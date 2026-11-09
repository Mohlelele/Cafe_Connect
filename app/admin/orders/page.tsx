import type { Metadata } from 'next';
import Link from 'next/link';
import OrderHistoryTable from '@/components/admin/OrderHistoryTable';
import LiveUpdates from '@/components/LiveUpdates';
import { PageHeader } from '@/components/ui';
import { getOrderHistory } from '@/lib/data';
import { ORDER_STATUSES } from '@/lib/order-status';
import { requireAdmin } from '@/lib/session';
import type { OrderStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'Order history' };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status: statusParam } = await searchParams;
  const status = ORDER_STATUSES.find((candidate): candidate is OrderStatus => candidate === statusParam);
  const orders = await getOrderHistory(status);

  return (
    <main className="page page-wide">
      <LiveUpdates tables={['orders']} />
      <PageHeader title="Order history" subtitle="The 200 most recent orders." />
      <nav className="filter-chips" aria-label="Filter by status">
        <Link href="/admin/orders" className="chip" aria-current={status ? undefined : 'page'}>All</Link>
        {ORDER_STATUSES.map((candidate) => (
          <Link key={candidate} href={`/admin/orders?status=${candidate}`} className="chip" aria-current={status === candidate ? 'page' : undefined}>
            {candidate}
          </Link>
        ))}
      </nav>
      <OrderHistoryTable orders={orders} />
    </main>
  );
}
