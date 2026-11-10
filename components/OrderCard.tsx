import type { CSSProperties } from 'react';
import { CheckIcon, STATUS_ICONS } from '@/components/Icons';
import { StatusBadge } from '@/components/ui';
import { formatOrderTime, formatRand, PAYMENT_LABELS } from '@/lib/menu';
import { ORDER_STATUSES } from '@/lib/order-status';
import type { Order } from '@/lib/types';

export default function OrderCard({ order }: { order: Order }) {
  const currentStep = ORDER_STATUSES.indexOf(order.status);
  const progress = { '--progress': currentStep / (ORDER_STATUSES.length - 1) } as CSSProperties;

  return (
    <article className="panel order-card">
      <header className="order-card-header">
        <div>
          <h2>{order.orderNumber}</h2>
          <p className="order-times">
            <span>Placed {formatOrderTime(order.createdAt)}</span>
            {order.statusUpdatedAt !== order.createdAt ? <span>Updated {formatOrderTime(order.statusUpdatedAt)}</span> : null}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {order.status === 'Collected' ? null : (
        <ol className="order-progress" style={progress} aria-label={`Order status: ${order.status}`}>
          {ORDER_STATUSES.map((status, index) => {
            const Icon = STATUS_ICONS[status];
            return (
              <li key={status} className={index < currentStep ? 'is-done' : index === currentStep ? 'is-current' : undefined} aria-current={index === currentStep ? 'step' : undefined}>
                <span className="order-progress-dot">{index < currentStep ? <CheckIcon /> : <Icon />}</span>
                <span className="order-progress-label">{status}</span>
              </li>
            );
          })}
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
        <span className="order-payment">
          {PAYMENT_LABELS[order.paymentMethod]}
          <StatusBadge status={order.paymentStatus} />
        </span>
        <strong>{formatRand(order.total)}</strong>
      </footer>
    </article>
  );
}
