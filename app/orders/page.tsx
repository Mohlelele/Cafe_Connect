import type { Metadata } from 'next';
import Link from 'next/link';
import LiveUpdates from '@/components/LiveUpdates';
import OrderCard from '@/components/OrderCard';
import { EmptyState, PageHeader } from '@/components/ui';
import { getStudentOrders } from '@/lib/data';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'My orders' };

export default async function OrdersPage() {
  const student = await requireStudent();
  const orders = await getStudentOrders(student.id);
  const active = orders.filter((order) => order.status !== 'Paid');
  const past = orders.filter((order) => order.status === 'Paid');

  return (
    <main className="page page-narrow">
      <LiveUpdates tables={['orders']} />
      <PageHeader title="My orders" subtitle="This page updates as the kitchen works on your order.">
        <Link href="/menu" className="btn btn-secondary">Back to menu</Link>
      </PageHeader>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet">
          <p>Your orders will appear here once you place one.</p>
          <Link href="/menu" className="btn btn-primary">Browse the menu</Link>
        </EmptyState>
      ) : null}

      {active.length > 0 ? (
        <section className="stack">
          <h2 className="section-title">In progress</h2>
          {active.map((order) => <OrderCard key={order.id} order={order} />)}
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="stack">
          <h2 className="section-title">Completed</h2>
          {past.map((order) => <OrderCard key={order.id} order={order} />)}
        </section>
      ) : null}
    </main>
  );
}
