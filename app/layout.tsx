import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import type { ReactNode } from 'react';
import Providers from '@/components/Providers';
import SiteHeader from '@/components/SiteHeader';
import { countOpenStudentOrders, getMenu } from '@/lib/data';
import { getCurrentProfile } from '@/lib/session';
import './globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' });

export const metadata: Metadata = {
  title: { default: 'Cafe Connect', template: '%s | Cafe Connect' },
  description: 'Order campus meals ahead and track them from kitchen to collection.',
  icons: { icon: '/favicon.svg' },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  const studentId = profile?.role === 'student' ? profile.id : null;
  const [menu, openOrderCount] = studentId
    ? await Promise.all([getMenu(), countOpenStudentOrders(studentId)])
    : [null, 0];

  return (
    <html lang="en" className={figtree.variable} data-scroll-behavior="smooth">
      <body>
        <Providers studentId={studentId} menu={menu}>
          <SiteHeader profile={profile} openOrderCount={openOrderCount} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
