'use server';

import { randomBytes, randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { ALLERGENS, DIETARY_LABELS, MENU_CATEGORIES, PAYMENT_METHODS } from '@/lib/menu';
import { BasketError, parseBasket, priceBasket } from '@/lib/order-pricing';
import { canChangeStatus, ORDER_STATUSES } from '@/lib/order-status';
import { prisma } from '@/lib/prisma';
import { getAccountRole, requireAdmin, requireStudent } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ActionResult, UploadResult, UserRole } from '@/lib/types';
import { asText, isOneOf, isUuid, isValidEmail, isValidImageUrl, parseIngredients, passwordProblem, parsePrice, pickAllowed, toCents } from '@/lib/validate';

// Everything here can be called from the browser with any values, and Prisma
// can change any data. So every action starts with requireStudent() or
// requireAdmin(), and checks each argument before using it.

const NO_SERVICE_KEY = 'Student account tools need SUPABASE_SERVICE_ROLE_KEY to be set on the server.';
const SAVE_FAILED = 'That could not be saved. Please refresh the page and try again.';
const ORDER_NUMBER_ATTEMPTS = 5;

const fail = (message: string): ActionResult => ({ ok: false, message });

function succeed(message: string): ActionResult {
  revalidatePath('/', 'layout'); // Refresh every page with the new data.
  return { ok: true, message };
}

function failAndRefresh(message: string): ActionResult {
  revalidatePath('/', 'layout');
  return fail(message);
}

// Runs a database change and turns the outcome into a message for the screen.
async function save(successMessage: string, change: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await change();
    return succeed(successMessage);
  } catch (error) {
    console.error(error);
    return fail(SAVE_FAILED);
  }
}

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === 'P2002';

// 4 random bytes give over 4 billion possible numbers. A clash just means try another.
const newOrderNumber = () => `CC-${randomBytes(4).toString('hex').toUpperCase()}`;

// The staff login form uses this to refuse accounts that are not staff.
export async function getSignedInRole(): Promise<UserRole | null> {
  return getAccountRole();
}

// ----- Orders -----

type PlaceOrderResult = ActionResult & { orderNumber?: string };

function findOrderFromRequest(studentId: string, requestId: string) {
  return prisma.order.findUnique({
    where: { studentId_idempotencyKey: { studentId, idempotencyKey: requestId } },
    select: { orderNumber: true },
  });
}

// requestId is created once per checkout attempt, so a double click or a retry
// after a dropped connection returns the original order instead of a new one.
export async function placeOrder(items: unknown, paymentMethod: unknown, requestId: unknown, expectedTotal: unknown): Promise<PlaceOrderResult> {
  const student = await requireStudent();
  if (!isOneOf(paymentMethod, PAYMENT_METHODS)) return fail('Please choose a valid payment method.');
  if (!isUuid(requestId)) return fail('Please refresh the page and try again.');

  const alreadyPlaced = (orderNumber: string): PlaceOrderResult => ({ ...succeed(`Order ${orderNumber} placed successfully.`), orderNumber });

  try {
    const existing = await findOrderFromRequest(student.id, requestId);
    if (existing) return alreadyPlaced(existing.orderNumber);

    const quantities = parseBasket(items);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: [...quantities.keys()] } } });
    const { lines, total } = priceBasket(quantities, menuItems.map((item) => ({ ...item, price: item.price.toNumber() })));

    if (typeof expectedTotal !== 'number' || toCents(expectedTotal) !== toCents(total)) {
      return failAndRefresh('Menu prices have changed. Please check your new total and place your order again.');
    }

    for (let attempt = 1; attempt <= ORDER_NUMBER_ATTEMPTS; attempt += 1) {
      const orderNumber = newOrderNumber();
      try {
        // Prisma saves the order, its items and its payment together, or none of them.
        await prisma.order.create({
          data: {
            orderNumber,
            idempotencyKey: requestId,
            studentId: student.id,
            customerName: student.fullName,
            totalAmount: total,
            items: { create: lines },
            payment: { create: { method: paymentMethod, amount: total } },
          },
        });
        return alreadyPlaced(orderNumber);
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const placedMeanwhile = await findOrderFromRequest(student.id, requestId);
        if (placedMeanwhile) return alreadyPlaced(placedMeanwhile.orderNumber);
      }
    }
    return fail('Your order could not be placed. Please try again.');
  } catch (error) {
    if (error instanceof BasketError) return failAndRefresh(error.message);
    console.error(error);
    return fail('Your order could not be placed. Please try again.');
  }
}

export async function setOrderStatus(orderId: unknown, status: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(orderId) || !isOneOf(status, ORDER_STATUSES)) return fail('That status change is not valid.');

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!order) return failAndRefresh('That order no longer exists.');
    if (!canChangeStatus(order.status, status)) return failAndRefresh('That status change is not allowed.');

    // Only updates if the status is still what was read above, so two staff
    // members acting at the same moment cannot overwrite each other.
    const { count } = await prisma.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status, statusUpdatedAt: new Date() },
    });
    if (count === 0) return failAndRefresh('Another staff member just updated this order. The latest status is now showing.');
    return succeed(`Order moved to ${status}.`);
  } catch (error) {
    console.error(error);
    return fail(SAVE_FAILED);
  }
}

// Paying is a separate step from collecting, and always confirmed by staff.
export async function confirmPayment(orderId: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(orderId)) return fail('That order could not be found.');

  try {
    const { count } = await prisma.payment.updateMany({
      where: { orderId, status: 'Unpaid' },
      data: { status: 'Paid', paidAt: new Date() },
    });
    if (count === 0) return failAndRefresh('This payment has already been confirmed.');
    return succeed('Payment confirmed.');
  } catch (error) {
    console.error(error);
    return fail(SAVE_FAILED);
  }
}

// ----- Menu -----

// Returns the cleaned-up item, or a message saying what is wrong with it.
function checkMenuItem(input: unknown) {
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = asText(raw.name);
  const description = asText(raw.description);
  const imageUrl = asText(raw.imageUrl);
  const price = parsePrice(raw.price);
  const category = raw.category;

  if (!name || !description) return 'Item name and description are required.';
  if (name.length > 100 || description.length > 500) return 'Item name or description is too long.';
  if (price === null) return 'Please enter a valid price greater than zero.';
  if (!isOneOf(category, MENU_CATEGORIES)) return 'Please choose a category.';
  if (imageUrl && !isValidImageUrl(imageUrl)) return 'Image URL must start with http:// or https://.';

  const ingredients = parseIngredients(raw.ingredients);
  if (!ingredients) return 'Please list at most 30 ingredients, each under 60 characters.';
  const allergens = pickAllowed(raw.allergens, ALLERGENS);
  const dietary = pickAllowed(raw.dietary, DIETARY_LABELS);

  return { name, description, price, imageUrl, category, ingredients, allergens, dietary };
}

// Saves a food photo to Supabase Storage and returns its public address.
// The browser shrinks photos before sending them, so they are usually small.
const PHOTO_BUCKET = 'menu-images';
const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export async function uploadMenuPhoto(formData: unknown): Promise<UploadResult> {
  await requireAdmin();
  const photo = formData instanceof FormData ? formData.get('photo') : null;
  if (!(photo instanceof File) || !PHOTO_TYPES[photo.type]) return fail('Please choose a JPG, PNG or WebP photo.');
  if (photo.size > MAX_PHOTO_BYTES) return fail('That photo is too large. Please choose one under 4 MB.');

  const supabase = createAdminClient();
  if (!supabase) return fail('Photo uploads need the Supabase service key on the server. You can paste an image link instead.');

  const path = `${randomUUID()}.${PHOTO_TYPES[photo.type]}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, photo, { contentType: photo.type, cacheControl: '31536000' });
  if (error) {
    console.error(error);
    return fail('The photo could not be uploaded. Please try again.');
  }
  return { ok: true, message: 'Photo uploaded. Save the item to keep it.', url: supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function addMenuItem(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const data = checkMenuItem(input);
  if (typeof data === 'string') return fail(data);
  return save('Menu item added.', () => prisma.menuItem.create({ data }));
}

export async function updateMenuItem(itemId: unknown, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(itemId)) return fail('That menu item could not be found.');
  const data = checkMenuItem(input);
  if (typeof data === 'string') return fail(data);
  return save('Menu updated successfully.', () => prisma.menuItem.update({ where: { id: itemId }, data }));
}

export async function setMenuAvailability(itemId: unknown, available: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(itemId) || typeof available !== 'boolean') return fail('That menu item could not be found.');
  const message = available ? 'Item is available again.' : 'Item marked as unavailable.';
  return save(message, () => prisma.menuItem.update({ where: { id: itemId }, data: { available } }));
}

export async function removeMenuItem(itemId: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(itemId)) return fail('That menu item could not be found.');
  return save('Menu item removed.', () => prisma.menuItem.delete({ where: { id: itemId } }));
}

// ----- Announcements -----

// With an id this edits that announcement. Without one it publishes a new one.
export async function saveAnnouncement(announcementId: unknown, titleInput: unknown, bodyInput: unknown): Promise<ActionResult> {
  await requireAdmin();

  const title = asText(titleInput);
  const body = asText(bodyInput);
  if (!title || !body) return fail('Enter both an announcement title and message.');
  if (title.length > 120 || body.length > 1000) return fail('Announcement is too long.');

  if (announcementId === null) {
    return save('Announcement published.', () => prisma.announcement.create({ data: { title, body } }));
  }
  if (!isUuid(announcementId)) return fail('That announcement could not be found.');
  return save('Announcement updated.', () => prisma.announcement.update({ where: { id: announcementId }, data: { title, body } }));
}

export async function deleteAnnouncement(announcementId: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(announcementId)) return fail('That announcement could not be found.');
  return save('Announcement removed.', () => prisma.announcement.delete({ where: { id: announcementId } }));
}

// ----- Student accounts (these use Supabase Auth, not Prisma) -----

// ----- Staff requests -----

// Gives a staff sign-up access to the staff side. Only works on an account that
// asked for it, so a manager cannot turn an ordinary student into staff by mistake.
export async function approveStaffRequest(profileId: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(profileId)) return fail('That request could not be found.');
  try {
    const { count } = await prisma.profile.updateMany({
      where: { id: profileId, role: 'student', staffRequested: true },
      data: { role: 'admin', staffRequested: false },
    });
    if (count === 0) return failAndRefresh('That request has already been handled.');
    return succeed('Staff access approved. They can now use Staff sign in.');
  } catch (error) {
    console.error(error);
    return fail(SAVE_FAILED);
  }
}

// Turns the request down. The account stays as an ordinary student account.
export async function declineStaffRequest(profileId: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isUuid(profileId)) return fail('That request could not be found.');
  try {
    const { count } = await prisma.profile.updateMany({
      where: { id: profileId, role: 'student', staffRequested: true },
      data: { staffRequested: false },
    });
    if (count === 0) return failAndRefresh('That request has already been handled.');
    return succeed('Request declined. The account can still order as a student.');
  } catch (error) {
    console.error(error);
    return fail(SAVE_FAILED);
  }
}

export async function createStudent(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) return fail(NO_SERVICE_KEY);

  const raw = (input ?? {}) as Record<string, unknown>;
  const name = asText(raw.name);
  const email = asText(raw.email).toLowerCase();

  if (!name || !email) return fail('Student details are required.');
  if (name.length > 100) return fail('Name must be 100 characters or fewer.');
  if (!isValidEmail(email)) return fail('Please enter a valid email address.');
  const weakPassword = passwordProblem(raw.password, email);
  if (weakPassword) return fail(weakPassword);

  // A database trigger creates the matching row in profiles.
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password: raw.password as string,
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

export async function resetStudentPassword(studentId: unknown, password: unknown): Promise<ActionResult> {
  await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) return fail(NO_SERVICE_KEY);

  if (!isUuid(studentId)) return fail('Select a student and enter a new password.');

  // Only student accounts can be reset here, never another admin.
  const student = await prisma.profile.findFirst({ where: { id: studentId, role: 'student' } });
  if (!student) return fail('Student not found.');

  const weakPassword = passwordProblem(password, student.email);
  if (weakPassword) return fail(weakPassword);

  const { error } = await adminClient.auth.admin.updateUserById(student.id, { password: password as string });
  if (error) {
    console.error(error);
    return fail('Password reset failed.');
  }
  return succeed('Password updated.');
}
