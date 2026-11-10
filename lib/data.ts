import 'server-only';

import { cache } from 'react';
import type { Prisma } from '@/lib/generated/prisma/client';
import { CAMPUS_TIME_ZONE } from '@/lib/menu';
import { prisma } from '@/lib/prisma';
import type { Announcement, MenuItem, Order, OrderStatus, Student } from '@/lib/types';
import { isUuid } from '@/lib/validate';

// Functions that read from the database. Pages check who is logged in first.

const OPEN_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Ready'];
const FULL_ORDER = { items: true, payment: true };
const STUDENT_ORDER_LIMIT = 100;
export const HISTORY_PAGE_SIZE = 25;

// The browser cannot receive Prisma's Decimal and Date values, so convert them.
function toOrder(order: Prisma.OrderGetPayload<{ include: typeof FULL_ORDER }>): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    total: order.totalAmount.toNumber(),
    paymentMethod: order.payment?.method ?? 'Cash',
    paymentStatus: order.payment?.status ?? 'Unpaid',
    paidAt: order.payment?.paidAt?.toISOString() ?? null,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    statusUpdatedAt: order.statusUpdatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
    })),
  };
}

function toMenuItem(item: Prisma.MenuItemGetPayload<object>): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price.toNumber(),
    available: item.available,
    imageUrl: item.imageUrl,
    category: item.category,
  };
}

// cache() means the layout and the page share one query per page load.
export const getMenu = cache(async (): Promise<MenuItem[]> => {
  const items = await prisma.menuItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  return items.map(toMenuItem);
});

export const getMenuItem = cache(async (id: string): Promise<MenuItem | null> => {
  if (!isUuid(id)) return null;
  const item = await prisma.menuItem.findUnique({ where: { id } });
  return item ? toMenuItem(item) : null;
});

export async function getAnnouncements(): Promise<Announcement[]> {
  const announcements = await prisma.announcement.findMany({ orderBy: { updatedAt: 'desc' } });
  return announcements.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }));
}

export async function getStudentOrders(studentId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { studentId },
    include: FULL_ORDER,
    orderBy: { createdAt: 'desc' },
    take: STUDENT_ORDER_LIMIT,
  });
  return orders.map(toOrder);
}

// Includes the student's id so nobody can open someone else's order.
export async function getStudentOrder(studentId: string, orderNumber: string): Promise<Order | null> {
  const order = await prisma.order.findFirst({ where: { studentId, orderNumber }, include: FULL_ORDER });
  return order ? toOrder(order) : null;
}

export function countOpenStudentOrders(studentId: string): Promise<number> {
  return prisma.order.count({ where: { studentId, status: { in: OPEN_STATUSES } } });
}

// Every outstanding order, oldest first, because that is the order the kitchen works through them.
export async function getActiveOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { status: { in: OPEN_STATUSES } },
    include: FULL_ORDER,
    orderBy: { createdAt: 'asc' },
  });
  return orders.map(toOrder);
}

export async function getOrderHistory(filters: { status?: OrderStatus; search?: string; page: number }) {
  const search = filters.search;
  const where: Prisma.OrderWhereInput = {
    status: filters.status,
    OR: search
      ? [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
        ]
      : undefined,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: FULL_ORDER,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: orders.map(toOrder), total };
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
  const startOfToday = new Date(`${todayInCampus}T00:00:00+02:00`);

  const [paid, ordersToday, availableItems] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'Paid', paidAt: { gte: startOfToday } }, _sum: { amount: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.menuItem.count({ where: { available: true } }),
  ]);

  return {
    revenueToday: paid._sum.amount?.toNumber() ?? 0,
    ordersToday,
    availableItems,
  };
}
