import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import OrderCard from '@/components/OrderCard';
import { getStudentOrder } from '@/lib/data';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Order confirmation', description: 'Your order number and collection details.' };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const student = await requireStudent();
  const { orderNumber } = await params;
  const order = await getStudentOrder(student.id, orderNumber);
  if (!order) notFound();

  return (
    <main className="page page-narrow">
      <section className="ticket confirmation">
        <span className="ticket-icon"><CheckIcon /></span>
        <h1>Order placed</h1>
        <p>Show this number at the counter to pay and collect.</p>
        <strong className="ticket-number confirmation-number">{order.orderNumber}</strong>
      </section>
      <div className="page-header">
        <h2 className="section-title">Your order</h2>
        <LiveUpdates tables={['orders']} showStatus />
      </div>
      <OrderCard order={order} />
      <div>
        <Link href="/orders" className="btn btn-secondary">View all my orders</Link>
      </div>
    </main>
  );
}
