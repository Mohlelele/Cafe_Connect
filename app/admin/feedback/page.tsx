import type { Metadata } from 'next';
import Link from 'next/link';
import { ChatIcon } from '@/components/Icons';
import { EmptyState, PageHeader, Stars } from '@/components/ui';
import { FEEDBACK_PAGE_SIZE, getFeedback } from '@/lib/data';
import { formatOrderTime } from '@/lib/menu';
import { requireAdmin } from '@/lib/session';

export const metadata: Metadata = { title: 'Feedback' };

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1);
  const { entries, total, average, counts } = await getFeedback(page);
  const lastPage = Math.max(1, Math.ceil(total / FEEDBACK_PAGE_SIZE));

  return (
    <main className="page">
      <PageHeader title="Feedback" subtitle="What students say about their orders after collecting them." />

      {total === 0 ? (
        <EmptyState title="No ratings yet" icon={<ChatIcon />}>
          <p>Students can rate an order once they have collected it. Their ratings and comments appear here.</p>
        </EmptyState>
      ) : (
        <>
          <section className="panel feedback-summary" aria-label="Rating summary">
            <div className="feedback-average">
              <strong>{average.toFixed(1)}</strong>
              <Stars value={average} />
              <span>{total} {total === 1 ? 'rating' : 'ratings'}</span>
            </div>
            <ul className="feedback-bars">
              {counts.map(({ stars, count }) => (
                <li key={stars}>
                  <span>{stars} ★</span>
                  <span className="feedback-bar"><span style={{ width: `${total ? (count / total) * 100 : 0}%` }} /></span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          </section>

          <ul className="feedback-list">
            {entries.map((entry) => (
              <li key={entry.orderNumber} className="panel feedback-item">
                <header>
                  <Stars value={entry.rating} />
                  <time dateTime={entry.updatedAt}>{formatOrderTime(entry.updatedAt)}</time>
                </header>
                {entry.comment ? <p>{entry.comment}</p> : <p className="feedback-empty">No comment.</p>}
                <footer><span className="mono">{entry.orderNumber}</span> · {entry.customerName}</footer>
              </li>
            ))}
          </ul>

          {lastPage > 1 ? (
            <div className="pagination">
              <span>Page {page} of {lastPage}</span>
              <div className="pagination-links">
                {page > 1 ? <Link className="btn btn-secondary btn-sm" href={`/admin/feedback?page=${page - 1}`}>Previous</Link> : null}
                {page < lastPage ? <Link className="btn btn-secondary btn-sm" href={`/admin/feedback?page=${page + 1}`}>Next</Link> : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
