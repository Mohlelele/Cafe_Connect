import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { getCurrentProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'About', description: 'How Cafe Connect makes campus dining easier.' };

const VALUES = [
  { title: 'Fresh meals', body: 'Food is prepared daily with quality ingredients and fast service.' },
  { title: 'Quick pickup', body: 'Orders are ready for collection quickly, so you can get back to class.' },
  { title: 'Student friendly', body: 'Affordable meals and simple online ordering for the whole campus.' },
];

export default async function AboutPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="page page-narrow">
      <PageHeader title="About Cafe Connect" subtitle="Campus dining without the long queues." />
      <div className="panel prose">
        <p>
          Cafe Connect makes campus dining easier for students and staff. Browse the menu, place a quick order,
          and pick up your food without standing in line.
        </p>
        <div className="feature-grid">
          {VALUES.map((value) => (
            <div key={value.title} className="feature">
              <h2>{value.title}</h2>
              <p>{value.body}</p>
            </div>
          ))}
        </div>
        {profile?.role === 'admin' ? null : (
          <Link href="/menu" className="btn btn-primary">View the menu</Link>
        )}
      </div>
    </main>
  );
}
