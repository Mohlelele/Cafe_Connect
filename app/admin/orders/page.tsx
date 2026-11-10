import type { Metadata } from 'next';
import Link from 'next/link';
import OrderHistoryTable from '@/components/admin/OrderHistoryTable';
import { SearchIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import { PageHeader } from '@/components/ui';
import { getOrderHistory, HISTORY_PAGE_SIZE } from '@/lib/data';
import { ORDER_STATUSES } from '@/lib/order-status';
import { requireAdmin } from '@/lib/session';
import { asText, isOneOf } from '@/lib/validate';

export const metadata: Metadata = { title: 'Order history' };

type SearchParams = Promise<{ status?: string; q?: string; page?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const status = isOneOf(params.status, ORDER_STATUSES) ? params.status : undefined;
  const search = asText(params.q).slice(0, 100);
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const { orders, total } = await getOrderHistory({ status, search: search || undefined, page });
  const lastPage = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));

  const linkTo = (changes: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    const nextStatus = 'status' in changes ? changes.status : status;
    if (nextStatus) query.set('status', nextStatus);
    if (search) query.set('q', search);
    if (changes.page && changes.page > 1) query.set('page', String(changes.page));
    const text = query.toString();
    return text ? `/admin/orders?${text}` : '/admin/orders';
  };

  return (
    <main className="page">
      <PageHeader title="Order history" subtitle={`${total} ${total === 1 ? 'order' : 'orders'}`}>
        <LiveUpdates tables={['orders']} showStatus />
      </PageHeader>

      <div className="table-tools">
        <nav className="filter-chips" aria-label="Filter by status">
          <Link href={linkTo({ status: undefined })} className="chip" aria-current={status ? undefined : 'page'}>All</Link>
          {ORDER_STATUSES.map((candidate) => (
            <Link key={candidate} href={linkTo({ status: candidate })} className="chip" aria-current={status === candidate ? 'page' : undefined}>
              {candidate}
            </Link>
          ))}
        </nav>
        <form className="search-field" action="/admin/orders" role="search">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <SearchIcon />
          <input type="search" name="q" defaultValue={search} placeholder="Order number or name" aria-label="Search orders by number or customer" />
        </form>
      </div>

      <OrderHistoryTable orders={orders} />

      {lastPage > 1 ? (
        <div className="pagination">
          <span>Page {Math.min(page, lastPage)} of {lastPage}</span>
          <div className="pagination-links">
            {page > 1 ? <Link href={linkTo({ page: page - 1 })} className="btn btn-secondary btn-sm">Previous</Link> : null}
            {page < lastPage ? <Link href={linkTo({ page: page + 1 })} className="btn btn-secondary btn-sm">Next</Link> : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
