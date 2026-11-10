import type { Metadata } from 'next';
import CartView from '@/components/CartView';
import { getMenu } from '@/lib/data';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Basket', description: 'Review your basket and place your order.' };

export default async function CartPage() {
  await requireStudent();
  // Same cached menu the layout already loaded, so this adds no database query.
  const menu = await getMenu();
  return (
    <main className="page">
      <CartView menu={menu} />
    </main>
  );
}
