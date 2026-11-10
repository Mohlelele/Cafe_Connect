import type { Metadata } from 'next';
import Link from 'next/link';
import AccountActions from '@/components/AccountActions';
import { CaretRightIcon, HelpIcon, InfoIcon, MegaphoneIcon, ReceiptIcon } from '@/components/Icons';
import { PageHeader } from '@/components/ui';
import { requireStudent } from '@/lib/session';

export const metadata: Metadata = { title: 'Account', description: 'Your Cafe Connect account.' };

const LINKS = [
  { href: '/orders', label: 'My orders', Icon: ReceiptIcon },
  { href: '/announcements', label: 'Announcements', Icon: MegaphoneIcon },
  { href: '/about', label: 'About', Icon: InfoIcon },
  { href: '/faq', label: 'FAQs', Icon: HelpIcon },
];

export default async function AccountPage() {
  const student = await requireStudent();

  return (
    <main className="page page-narrow">
      <PageHeader title="Account" />
      <section className="panel account-card">
        <div className="account-head">
          <span className="avatar" aria-hidden="true">{student.fullName.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{student.fullName}</strong>
            <span>{student.email}</span>
          </div>
        </div>
      </section>
      <nav className="panel account-links" aria-label="Account">
        {LINKS.map(({ href, label, Icon }) => (
          <Link key={href} href={href}><Icon /> {label} <CaretRightIcon /></Link>
        ))}
      </nav>
      <AccountActions isStaff={student.isStaff} />
    </main>
  );
}
