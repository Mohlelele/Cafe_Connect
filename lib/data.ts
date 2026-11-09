import 'server-only';

import type { Prisma } from '@/lib/generated/prisma/client';
import { CAMPUS_TIME_ZONE } from '@/lib/menu';
import { prisma } from '@/lib/prisma';
import type { Announcement, MenuItem, Order, OrderStatus, Student } from '@/lib/types';

// Functions that read from the database. Pages check who is logged in first.

const MAX_ORDERS = 200;
const OPEN_STATUSES: OrderStatus[] = ['Pending', 'Prep', 'Ready'];

// The browser cannot receive Prisma's Decimal and Date values, so convert them.
function toOrder(order: Prisma.OrderGetPayload<{ include: { items: true } }>): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    total: order.totalAmount.toNumber(),
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
    })),
  };
}

export async function getMenu(): Promise<MenuItem[]> {
  const items = await prisma.menuItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price.toNumber(),
    available: item.available,
    imageUrl: item.imageUrl,
    category: item.category,
  }));
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const announcements = await prisma.announcement.findMany({ orderBy: { updatedAt: 'desc' } });
  return announcements.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }));
}

export async function getStudentOrders(studentId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { studentId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: MAX_ORDERS,
  });
  return orders.map(toOrder);
}

export function countOpenStudentOrders(studentId: string): Promise<number> {
  return prisma.order.count({ where: { studentId, status: { in: OPEN_STATUSES } } });
}

// Oldest first, because that is the order the kitchen works through them.
export async function getActiveOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { status: { in: OPEN_STATUSES } },
    include: { items: true },
    orderBy: { createdAt: 'asc' },
    take: MAX_ORDERS,
  });
  return orders.map(toOrder);
}

export async function getOrderHistory(status?: OrderStatus): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { status },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: MAX_ORDERS,
  });
  return orders.map(toOrder);
}

export function getStudents(): Promise<Student[]> {
  return prisma.profile.findMany({
    where: { role: 'student' },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  });
}

export async function getDashboardStats() {
  // South Africa is UTC+2 all year, so midnight there is always +02:00.
  const todayInCampus = new Date().toLocaleDateString('en-CA', { timeZone: CAMPUS_TIME_ZONE });
  const today = { createdAt: { gte: new Date(`${todayInCampus}T00:00:00+02:00`) } };

  const [paid, ordersToday, availableItems] = await Promise.all([
    prisma.order.aggregate({ where: { ...today, status: 'Paid' }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: today }),
    prisma.menuItem.count({ where: { available: true } }),
  ]);

  return {
    revenueToday: paid._sum.totalAmount?.toNumber() ?? 0,
    ordersToday,
    availableItems,
  };
}
