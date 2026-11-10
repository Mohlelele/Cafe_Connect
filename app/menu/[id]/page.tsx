import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToBasket from '@/components/AddToBasket';
import { ArrowLeftIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import { MenuImage } from '@/components/ui';
import { getMenuItem } from '@/lib/data';
import { formatRand } from '@/lib/menu';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Menu item' };

export default async function MenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStudent();
  const { id } = await params;
  const item = await getMenuItem(id);
  if (!item) notFound();

  return (
    <main className="page">
      <LiveUpdates tables={['menu_items']} />
      <Link href="/menu" className="back-link"><ArrowLeftIcon /> Back to menu</Link>
      <article className="panel item-detail">
        <MenuImage item={item} alt={item.name} className="item-detail-image" />
        <div className="item-detail-body">
          <span className="eyebrow">{item.category}</span>
          <h1>{item.name}</h1>
          <p>{item.description}</p>
          <div className="food-card-footer">
            <strong className="item-detail-price">{formatRand(item.price)}</strong>
            <AddToBasket item={item} />
          </div>
          <Link href="/cart" className="btn btn-secondary btn-block">View basket</Link>
        </div>
      </article>
    </main>
  );
}
