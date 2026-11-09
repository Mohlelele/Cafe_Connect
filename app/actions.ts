'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { MENU_CATEGORIES, PAYMENT_METHODS } from '@/lib/menu';
import { BasketError, parseBasket, priceBasket } from '@/lib/order-pricing';
import { canChangeStatus, ORDER_STATUSES } from '@/lib/order-status';
import { prisma } from '@/lib/prisma';
import { getCurrentProfile, requireAdmin, requireStudent } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ActionResult, MenuCategory, OrderStatus, PaymentMethod, UserRole } from '@/lib/types';

// Everything here can be called from the browser, and Prisma can change any
// data. So every action must start with requireStudent() or requireAdmin().

const NO_SERVICE_KEY = 'Student account tools need SUPABASE_SERVICE_ROLE_KEY to be set on the server.';
const INVALID_PASSWORD = 'Password must be between 8 and 72 characters long.';

const fail = (message: string): ActionResult => ({ ok: false, message });

function succeed(message: string): ActionResult {
  revalidatePath('/', 'layout'); // Refresh every page with the new data.
  return { ok: true, message };
}

// Runs a database change and turns the outcome into a message for the screen.
async function save(successMessage: string, change: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await change();
    return succeed(successMessage);
  } catch (error) {
    if (error instanceof StatusChangeError) return fail('That status change is not allowed.');
    console.error(error);
    return fail('That could not be saved. Please refresh the page and try again.');
  }
}

class StatusChangeError extends Error {}

function parsePrice(value: string): number | null {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0 || price > 100000) return null;
  return Math.round(price * 100) / 100;
}

const isValidPassword = (password: string) => password.length >= 8 && Buffer.byteLength(password) <= 72;
const isValidEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// The login form uses this to decide where to send someone after they log in.
export async function getSignedInRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile ? profile.role : null;
}

// ----- Orders -----

export async function placeOrder(items: unknown, paymentMethod: PaymentMethod): Promise<ActionResult & { orderNumber?: string }> {
  const student = await requireStudent();
  if (!PAYMENT_METHODS.includes(paymentMethod)) return fail('Please choose a valid payment method.');

  try {
    const quantities = parseBasket(items);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: [...quantities.keys()] } } });
    const { lines, total } = priceBasket(quantities, menuItems.map((item) => ({ ...item, price: item.price.toNumber() })));
    const orderNumber = `CC-${randomBytes(3).toString('hex').toUpperCase()}`;

    // Prisma saves the order, its items and its payment together, or none of them.
    await prisma.order.create({
      data: {
        orderNumber,
        studentId: student.id,
        customerName: student.fullName,
        totalAmount: total,
        items: { create: lines },
        payment: { create: { method: paymentMethod, amount: total } },
      },
    });
    return { ...succeed(`Order ${orderNumber} placed successfully.`), orderNumber };
  } catch (error) {
    if (error instanceof BasketError) return fail(error.message);
    console.error(error);
    return fail('Your order could not be placed. Please try again.');
  }
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return fail('That status is not valid.');

  return save('Order status updated.', async () => {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { status: true } });
    if (!canChangeStatus(order.status, status)) throw new StatusChangeError();

    // Students pay at the counter when they collect, so collecting marks it paid.
    const now = new Date();
    const payment = status === 'Collected' ? { update: { status: 'Paid' as const, paidAt: now } } : undefined;
    await prisma.order.update({ where: { id: orderId }, data: { status, statusUpdatedAt: now, payment } });
  });
}

// ----- Menu -----

type MenuItemInput = { name: string; description: string; price: string; imageUrl: string; category: MenuCategory };

// Returns the cleaned-up item, or a message saying what is wrong with it.
function checkMenuItem(input: MenuItemInput) {
  const name = input.name.trim();
  const description = input.description.trim();
  const imageUrl = input.imageUrl.trim();
  const price = parsePrice(input.price);
  const category = input.category;

  if (!name || !description) return 'Item name and description are required.';
  if (name.length > 100 || description.length > 500) return 'Item name or description is too long.';
  if (price === null) return 'Please enter a valid price greater than zero.';
  if (!MENU_CATEGORIES.includes(category)) return 'Please choose a category.';
  if (imageUrl && !/^https?:\/\/\S+$/i.test(imageUrl)) return 'Image URL must start with http:// or https://.';

  return { name, description, price, imageUrl, category };
}

export async function addMenuItem(input: MenuItemInput): Promise<ActionResult> {
  await requireAdmin();
  const data = checkMenuItem(input);
  if (typeof data === 'string') return fail(data);
  return save('Menu item added.', () => prisma.menuItem.create({ data }));
}

export async function updateMenuItem(itemId: string, input: MenuItemInput): Promise<ActionResult> {
  await requireAdmin();
  const data = checkMenuItem(input);
  if (typeof data === 'string') return fail(data);
  return save('Menu updated successfully.', () => prisma.menuItem.update({ where: { id: itemId }, data }));
}

export async function setMenuAvailability(itemId: string, available: boolean): Promise<ActionResult> {
  await requireAdmin();
  const message = available ? 'Item is back on the menu.' : 'Item hidden from the menu.';
  return save(message, () => prisma.menuItem.update({ where: { id: itemId }, data: { available } }));
}

export async function removeMenuItem(itemId: string): Promise<ActionResult> {
  await requireAdmin();
  return save('Menu item removed.', () => prisma.menuItem.delete({ where: { id: itemId } }));
}

// ----- Announcements -----

export async function saveAnnouncement(titleInput: string, bodyInput: string): Promise<ActionResult> {
  await requireAdmin();

  const title = titleInput.trim();
  const body = bodyInput.trim();
  if (!title || !body) return fail('Enter both an announcement title and message.');
  if (title.length > 120 || body.length > 1000) return fail('Announcement is too long.');

  return save('Announcement published.', () => prisma.announcement.upsert({
    where: { title },
    create: { title, body },
    update: { body },
  }));
}

export async function deleteAnnouncement(announcementId: string): Promise<ActionResult> {
  await requireAdmin();
  return save('Announcement removed.', () => prisma.announcement.delete({ where: { id: announcementId } }));
}

// ----- Student accounts (these use Supabase Auth, not Prisma) -----

export async function createStudent(input: { name: string; email: string; password: string }): Promise<ActionResult> {
  await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) return fail(NO_SERVICE_KEY);

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email || !input.password) return fail('Student details are required.');
  if (name.length > 100) return fail('Name must be 100 characters or fewer.');
  if (!isValidEmail(email)) return fail('Please enter a valid email address.');
  if (!isValidPassword(input.password)) return fail(INVALID_PASSWORD);

  // A database trigger creates the matching row in profiles.
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error?.code === 'email_exists') return fail('An account with this email already exists.');
  if (error) {
    console.error(error);
    return fail('Student creation failed.');
  }
  return succeed('Student account created.');
}

export async function resetStudentPassword(studentId: string, password: string): Promise<ActionResult> {
  await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) return fail(NO_SERVICE_KEY);

  if (!studentId) return fail('Select a student and enter a new password.');
  if (!isValidPassword(password)) return fail(INVALID_PASSWORD);

  // Only student accounts can be reset here, never another admin.
  const student = await prisma.profile.findFirst({ where: { id: studentId, role: 'student' } });
  if (!student) return fail('Student not found.');

  const { error } = await adminClient.auth.admin.updateUserById(student.id, { password });
  if (error) {
    console.error(error);
    return fail('Password reset failed.');
  }
  return succeed('Password updated.');
}
