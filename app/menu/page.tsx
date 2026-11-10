import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LiveUpdates from '@/components/LiveUpdates';
import MenuBrowser from '@/components/MenuBrowser';
import { PageHeader } from '@/components/ui';
import { getAnnouncements, getMenu, getMenuRatings } from '@/lib/data';
import { CATEGORY_FILTERS } from '@/lib/menu';
import { getCurrentProfile } from '@/lib/session';
import { isOneOf } from '@/lib/validate';

export const metadata: Metadata = { title: 'Menu', description: 'See today\'s cafeteria menu and prices, then order ahead and skip the queue.' };

// Anyone can look at the menu. Placing an order needs an account.
export default async function MenuPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const profile = await getCurrentProfile();
  if (profile?.role === 'admin') redirect('/admin');

  const [{ category }, menu, announcements, ratings] = await Promise.all([searchParams, getMenu(), getAnnouncements(), getMenuRatings()]);

  return (
    <main className="page">
      <LiveUpdates tables={['menu_items', 'announcements']} />
      <PageHeader title="Today's menu" subtitle={profile ? 'Order now and collect from the cafeteria.' : 'Log in or create an account when you are ready to order.'} />
      <MenuBrowser items={menu} ratings={ratings} announcement={announcements[0] ?? null} initialCategory={isOneOf(category, CATEGORY_FILTERS) ? category : 'All'} />
    </main>
  );
}
