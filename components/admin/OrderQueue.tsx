'use client';

import { useMemo, useState } from 'react';
import { confirmPayment, setOrderStatus } from '@/app/actions';
import CollectButton from '@/components/admin/CollectButton';
import { SearchIcon, STATUS_ICONS } from '@/components/Icons';
import { StatusBadge, useActionRunner } from '@/components/ui';
import { formatOrderTime, formatRand, PAYMENT_LABELS } from '@/lib/menu';
import type { Order, OrderStatus } from '@/lib/types';

const COLUMNS: { status: OrderStatus; next: OrderStatus; action: string }[] = [
  { status: 'Pending', next: 'Preparing', action: 'Start preparing' },
  { status: 'Preparing', next: 'Ready', action: 'Mark ready' },
  { status: 'Ready', next: 'Collected', action: 'Mark collected' },
];

export default function OrderQueue({ orders }: { orders: Order[] }) {
  const { run, pending } = useActionRunner();
  const [search, setSearch] = useState('');
  const [activeColumn, setActiveColumn] = useState<OrderStatus>('Pending');

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? orders.filter((order) => `${order.orderNumber} ${order.customerName}`.toLowerCase().includes(term)) : orders;
  }, [orders, search]);

  const inColumn = (status: OrderStatus) => visibleOrders.filter((order) => order.status === status);

  return (
    <>
      <div className="queue-tools">
        <label className="search-field">
          <SearchIcon />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find by order or name" aria-label="Find an order by number or customer" />
        </label>
      </div>

      <div className="queue-tabs" role="group" aria-label="Choose a column">
        {COLUMNS.map(({ status }) => {
          const Icon = STATUS_ICONS[status];
          return (
            <button key={status} type="button" className="chip" aria-pressed={activeColumn === status} onClick={() => setActiveColumn(status)}>
              <Icon /> {status} <span className="chip-count">{inColumn(status).length}</span>
            </button>
          );
        })}
      </div>

      <div className="queue">
        {COLUMNS.map(({ status, next, action }) => {
          const columnOrders = inColumn(status);
          return (
            <section className={activeColumn === status ? 'queue-column is-active' : 'queue-column'} key={status} aria-label={status}>
              <h2 className="queue-heading">
                {status} <span>{columnOrders.length}</span>
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
                  <div className="queue-payment">
                    <span className="order-payment">{PAYMENT_LABELS[order.paymentMethod]} <StatusBadge status={order.paymentStatus} /></span>
                    {order.paymentStatus === 'Unpaid' ? (
                      <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => run(() => confirmPayment(order.id))}>Confirm payment</button>
                    ) : null}
                  </div>
                  <footer>
                    <span>{formatRand(order.total)}</span>
                    {next === 'Collected' ? (
                      <CollectButton order={order} />
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => setOrderStatus(order.id, next))}>
                        {action}
                      </button>
                    )}
                  </footer>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
