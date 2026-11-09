import { CheckIcon } from '@/components/Icons';
import { StatusBadge } from '@/components/ui';
import { formatOrderTime, formatRand, ORDER_STATUSES, PAYMENT_LABELS, STATUS_LABELS } from '@/lib/menu';
import type { Order } from '@/lib/types';

export default function OrderCard({ order }: { order: Order }) {
  const currentStep = ORDER_STATUSES.indexOf(order.status);

  return (
    <article className="panel order-card">
      <header className="order-card-header">
        <div>
          <h2>{order.orderNumber}</h2>
          <time dateTime={order.createdAt}>{formatOrderTime(order.createdAt)}</time>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {order.status === 'Paid' ? null : (
        <ol className="order-progress" aria-label={`Order status: ${STATUS_LABELS[order.status]}`}>
          {ORDER_STATUSES.map((status, index) => (
            <li key={status} className={index < currentStep ? 'is-done' : index === currentStep ? 'is-current' : undefined}>
              <span className="order-progress-dot">{index < currentStep ? <CheckIcon /> : null}</span>
              <span className="order-progress-label">{STATUS_LABELS[status]}</span>
            </li>
          ))}
        </ol>
      )}

      <ul className="order-lines">
        {order.items.map((item) => (
          <li key={item.id}>
            <span>{item.quantity} × {item.name}</span>
            <span>{formatRand(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <footer className="order-card-footer">
        <span>{PAYMENT_LABELS[order.paymentMethod]}</span>
        <strong>{formatRand(order.total)}</strong>
      </footer>
    </article>
  );
}
