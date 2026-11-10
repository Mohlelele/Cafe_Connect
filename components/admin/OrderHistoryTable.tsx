'use client';

import { confirmPayment, setOrderStatus } from '@/app/actions';
import { HistoryIcon } from '@/components/Icons';
import { EmptyState, StatusBadge, useActionRunner } from '@/components/ui';
import { formatOrderItems, formatOrderTime, formatRand, PAYMENT_LABELS } from '@/lib/menu';
import { canChangeStatus, ORDER_STATUSES } from '@/lib/order-status';
import type { Order, OrderStatus } from '@/lib/types';

export default function OrderHistoryTable({ orders }: { orders: Order[] }) {
  const { run, pending } = useActionRunner();

  if (orders.length === 0) return <EmptyState title="No orders to show" icon={<HistoryIcon />}><p>Try a different status or search.</p></EmptyState>;

  return (
    <div className="panel table-scroll">
      <table className="data-table card-table">
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
              <td data-label="Order"><span className="mono">{order.orderNumber}</span></td>
              <td data-label="Customer">{order.customerName}</td>
              <td data-label="Items" className="table-wrap">{formatOrderItems(order.items)}</td>
              <td data-label="Placed" className="nowrap">{formatOrderTime(order.createdAt)}</td>
              <td data-label="Payment">
                <span className="order-payment">
                  {PAYMENT_LABELS[order.paymentMethod]} <StatusBadge status={order.paymentStatus} />
                  {order.paymentStatus === 'Unpaid' ? (
                    <button type="button" className="btn btn-secondary btn-sm" disabled={pending} aria-label={`Confirm payment for order ${order.orderNumber}`} onClick={() => run(() => confirmPayment(order.id))}>Confirm</button>
                  ) : null}
                </span>
              </td>
              <td data-label="Total" className="numeric nowrap">{formatRand(order.total)}</td>
              <td data-label="Status">
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
              <td data-label="Last update" className="nowrap">{formatOrderTime(order.statusUpdatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
