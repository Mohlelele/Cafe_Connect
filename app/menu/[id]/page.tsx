import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AddToBasket from '@/components/AddToBasket';
import { ArrowLeftIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import { MenuImage, StatusBadge } from '@/components/ui';
import { getMenuItem } from '@/lib/data';
import { formatRand } from '@/lib/menu';
import { getCurrentProfile } from '@/lib/session';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getMenuItem((await params).id);
  return item ? { title: item.name, description: item.description } : { title: 'Menu item' };
}

export default async function MenuItemPage({ params }: Props) {
  const profile = await getCurrentProfile();
  if (profile?.role === 'admin') redirect('/admin');

  const item = await getMenuItem((await params).id);
  if (!item) notFound();

  return (
    <main className="page">
      <LiveUpdates tables={['menu_items']} />
      <Link href="/menu" className="back-link"><ArrowLeftIcon /> Back to menu</Link>
      <article className="panel item-detail">
        <MenuImage item={item} alt={item.name} className="item-detail-image" sizes="(max-width: 760px) 100vw, 600px" priority />
        <div className="item-detail-body">
          <div className="item-meta">
            <span className="eyebrow">{item.category}</span>
            <StatusBadge status={item.available ? 'Available' : 'Unavailable'} />
          </div>
          <h1>{item.name}</h1>
          <p>{item.description}</p>
          <div className="food-card-footer">
            <strong className="item-detail-price">{formatRand(item.price)}</strong>
            <AddToBasket item={item} />
          </div>
          {profile && item.available ? <Link href="/cart" className="btn btn-secondary btn-block">View basket</Link> : null}
        </div>
      </article>
    </main>
  );
}
