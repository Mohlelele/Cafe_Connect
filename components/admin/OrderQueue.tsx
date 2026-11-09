'use client';

import { setOrderStatus } from '@/app/actions';
import { useActionRunner } from '@/components/ui';
import { formatOrderTime, formatRand, STATUS_LABELS } from '@/lib/menu';
import type { Order, OrderStatus } from '@/lib/types';

const COLUMNS: { status: OrderStatus; next: OrderStatus; action: string }[] = [
  { status: 'Pending', next: 'Prep', action: 'Start preparing' },
  { status: 'Prep', next: 'Ready', action: 'Mark ready' },
  { status: 'Ready', next: 'Paid', action: 'Paid and collected' },
];

export default function OrderQueue({ orders }: { orders: Order[] }) {
  const { run, pending } = useActionRunner();

  return (
    <div className="queue">
      {COLUMNS.map(({ status, next, action }) => {
        const columnOrders = orders.filter((order) => order.status === status);
        return (
          <section className="queue-column" key={status} aria-label={STATUS_LABELS[status]}>
            <h2 className={`queue-heading queue-heading-${status.toLowerCase()}`}>
              {STATUS_LABELS[status]} <span>{columnOrders.length}</span>
            </h2>

            {columnOrders.length === 0 ? <p className="queue-empty">No orders</p> : null}

            {columnOrders.map((order) => (
              <article className="queue-card" key={order.id}>
                <header>
                  <strong>{order.orderNumber}</strong>
                  <time dateTime={order.createdAt}>{formatOrderTime(order.createdAt)}</time>
                </header>
                <p className="queue-customer">{order.customerName}</p>
                <ul>
                  {order.items.map((item) => <li key={item.id}>{item.quantity} × {item.name}</li>)}
                </ul>
                <footer>
                  <span>{formatRand(order.total)}</span>
                  <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => setOrderStatus(order.id, next))}>
                    {action}
                  </button>
                </footer>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}
