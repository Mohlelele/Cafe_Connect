import type { OrderStatus } from '@/lib/types';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Collected'];

// An order moves one step at a time. Staff can go one step back to fix a
// mistake, but a collected order is finished and cannot change.
export function canChangeStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === 'Collected') return false;
  return Math.abs(ORDER_STATUSES.indexOf(to) - ORDER_STATUSES.indexOf(from)) === 1;
}

// Before handing food over, staff type the order number the student shows
// (from their email or the My orders page). Capitals, spaces and the "CC-"
// at the start do not matter, so "7f3a 91c2" matches "CC-7F3A91C2".
const simplify = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^CC/, '');

export function orderNumberMatches(typed: unknown, orderNumber: string): boolean {
  return typeof typed === 'string' && simplify(typed) !== '' && simplify(typed) === simplify(orderNumber);
}

export const WRONG_ORDER_NUMBER = 'That number does not match this order. Check the number the student is showing and try again.';
