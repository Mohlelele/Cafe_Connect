import type { Metadata } from 'next';
import CartView from '@/components/CartView';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Basket' };

export default async function CartPage() {
  await requireStudent();
  return (
    <main className="page">
      <CartView />
    </main>
  );
}
