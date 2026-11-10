import type { Metadata } from 'next';
import { CaretRightIcon } from '@/components/Icons';
import { PageHeader } from '@/components/ui';
import { NOT_CONFIRMED, SITE } from '@/lib/site-info';

export const metadata: Metadata = { title: 'FAQs', description: 'Answers to common questions about ordering with Cafe Connect.' };

const QUESTIONS = [
  { q: 'Do I need an account to see the menu?', a: 'No. Anyone can see the menu and prices. You need an account to place an order and follow its progress.' },
  { q: 'Do I pay on the website?', a: 'No. Nothing is charged on this website. The cafeteria accepts cash only: pay at the counter when you collect, and staff confirm your payment there.' },
  { q: 'How do I collect my order?', a: 'After you order, you get an order number. Show it at the counter when your order says Ready.' },
  { q: 'How do I know when my order is ready?', a: 'Open My orders. Your order moves through Pending, Preparing, Ready and Collected as the kitchen works on it.' },
  { q: 'How many of one item can I order?', a: 'You can order up to 20 of the same item in one order.' },
  { q: 'Why was something removed from my basket?', a: 'If an item becomes unavailable or is taken off the menu, it is removed from your basket and you are told. Prices in your basket always follow the current menu.' },
  { q: 'I forgot my password. What do I do?', a: 'Use the Forgot password link on the login page. We email you a one-time code: enter it with your new password and you are back in.' },
  { q: 'When is the cafeteria open?', a: SITE.openingHours ? SITE.openingHours.map(({ days, time }) => `${days}: ${time}`).join('. ') + '.' : NOT_CONFIRMED },
  { q: 'Where is the cafeteria, and how do I contact it?', a: `${SITE.address ?? NOT_CONFIRMED}. Phone ${SITE.phone ?? NOT_CONFIRMED} or email ${SITE.email ?? NOT_CONFIRMED}.` },
];

export default function FaqPage() {
  return (
    <main className="page page-narrow">
      <PageHeader title="Frequently asked questions" />
      <div className="panel faq">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q}>
            <summary>{q} <CaretRightIcon /></summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
