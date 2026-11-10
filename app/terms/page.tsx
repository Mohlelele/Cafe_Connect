import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = { title: 'Terms', description: 'How ordering with Cafe Connect works.' };

export default function TermsPage() {
  return (
    <main className="page page-narrow">
      <PageHeader title="Terms" />
      <div className="panel prose">
        <p className="placeholder-note">The cafeteria's formal terms have not been supplied yet. This page describes how the system works.</p>
        <section>
          <h2>Orders</h2>
          <p>An order is placed when you receive an order number. Menu items and prices can change, and the price charged is the one shown when you place your order.</p>
        </section>
        <section>
          <h2>Payment</h2>
          <p>No payment is taken on this website. Staff confirm payment at the cafeteria.</p>
        </section>
        <section>
          <h2>Collection</h2>
          <p>Show your order number at the counter to collect your order.</p>
        </section>
      </div>
    </main>
  );
}
