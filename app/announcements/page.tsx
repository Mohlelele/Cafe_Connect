import type { Metadata } from 'next';
import { MegaphoneIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import { EmptyState, PageHeader } from '@/components/ui';
import { getAnnouncements } from '@/lib/data';
import { CAMPUS_TIME_ZONE } from '@/lib/menu';

export const metadata: Metadata = { title: 'Announcements', description: 'News and specials from the cafeteria team.' };

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-ZA', { timeZone: CAMPUS_TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' });

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <main className="page page-narrow">
      <LiveUpdates tables={['announcements']} />
      <PageHeader title="Announcements" subtitle="News from the cafeteria team." />
      {announcements.length === 0 ? (
        <EmptyState title="No announcements right now" icon={<MegaphoneIcon />}><p>Check back later for news and specials.</p></EmptyState>
      ) : (
        <div className="stack">
          {announcements.map((item) => (
            <article className="panel announcement" key={item.id}>
              <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
