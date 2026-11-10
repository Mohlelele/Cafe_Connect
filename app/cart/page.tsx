import type { Metadata } from 'next';
import CartView from '@/components/CartView';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Basket', description: 'Review your basket and place your order.' };

export default async function CartPage() {
  await requireStudent();
  return (
    <main className="page">
      <CartView />
    </main>
  );
}
