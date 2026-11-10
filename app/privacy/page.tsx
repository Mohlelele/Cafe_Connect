import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = { title: 'Privacy', description: 'What information Cafe Connect stores and why.' };

export default function PrivacyPage() {
  return (
    <main className="page page-narrow">
      <PageHeader title="Privacy" />
      <div className="panel prose">
        <p className="placeholder-note">The cafeteria's formal privacy policy has not been supplied yet. This page describes what the system stores.</p>
        <section>
          <h2>Information we store</h2>
          <ul>
            <li>Your name and email address, to run your account.</li>
            <li>Your orders, including items, totals, payment method and payment status.</li>
          </ul>
        </section>
        <section>
          <h2>Passwords</h2>
          <p>Passwords are handled by our login provider and are stored in hashed form. Staff cannot see them.</p>
        </section>
        <section>
          <h2>Your basket</h2>
          <p>Items in your basket are saved in your own browser until you place your order.</p>
        </section>
        <section>
          <h2>Who can see your orders</h2>
          <p>Only you and cafeteria staff can see your orders.</p>
        </section>
      </div>
    </main>
  );
}
