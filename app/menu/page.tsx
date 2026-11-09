import type { Metadata } from 'next';
import LiveUpdates from '@/components/LiveUpdates';
import MenuBrowser from '@/components/MenuBrowser';
import { PageHeader } from '@/components/ui';
import { getAnnouncements, getMenu } from '@/lib/data';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Menu' };

export default async function MenuPage() {
  await requireStudent();
  const [menu, announcements] = await Promise.all([getMenu(), getAnnouncements()]);

  return (
    <main className="page">
      <LiveUpdates tables={['menu_items', 'announcements']} />
      <PageHeader title="Today's menu" subtitle="Order now and collect from the cafeteria." />
      <MenuBrowser items={menu} announcement={announcements[0] ?? null} />
    </main>
  );
}
