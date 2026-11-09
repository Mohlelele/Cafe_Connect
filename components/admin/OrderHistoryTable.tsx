'use client';

import { setOrderStatus } from '@/app/actions';
import { EmptyState, StatusBadge, useActionRunner } from '@/components/ui';
import { formatOrderItems, formatOrderTime, formatRand, PAYMENT_LABELS } from '@/lib/menu';
import { canChangeStatus, ORDER_STATUSES } from '@/lib/order-status';
import type { Order, OrderStatus } from '@/lib/types';

export default function OrderHistoryTable({ orders }: { orders: Order[] }) {
  const { run, pending } = useActionRunner();

  if (orders.length === 0) return <EmptyState title="No orders to show" />;

  return (
    <div className="panel table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Placed</th>
            <th>Payment</th>
            <th className="numeric">Total</th>
            <th>Status</th>
            <th>Last update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><strong>{order.orderNumber}</strong></td>
              <td>{order.customerName}</td>
              <td className="table-wrap">{formatOrderItems(order.items)}</td>
              <td className="nowrap">{formatOrderTime(order.createdAt)}</td>
              <td className="nowrap">
                <span className="order-payment">{PAYMENT_LABELS[order.paymentMethod]} <StatusBadge status={order.paymentStatus} /></span>
              </td>
              <td className="numeric nowrap">{formatRand(order.total)}</td>
              <td>
                <select
                  className="select-compact"
                  value={order.status}
                  disabled={pending || order.status === 'Collected'}
                  aria-label={`Status of order ${order.orderNumber}`}
                  onChange={(event) => run(() => setOrderStatus(order.id, event.target.value as OrderStatus))}
                >
                  {ORDER_STATUSES.filter((status) => status === order.status || canChangeStatus(order.status, status)).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td className="nowrap">{formatOrderTime(order.statusUpdatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
