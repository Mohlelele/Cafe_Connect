import type { OrderStatus } from '@/lib/types';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'Ready', 'Collected'];

// An order moves one step at a time. Staff can go one step back to fix a
// mistake, but a collected order is finished and cannot change.
export function canChangeStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === 'Collected') return false;
  return Math.abs(ORDER_STATUSES.indexOf(to) - ORDER_STATUSES.indexOf(from)) === 1;
}
