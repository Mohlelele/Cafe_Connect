import type { Metadata } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import type { ReactNode } from 'react';
import MobileNav from '@/components/MobileNav';
import Providers from '@/components/Providers';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { countOpenStudentOrders, getMenu } from '@/lib/data';
import { getCurrentProfile } from '@/lib/session';
import { SITE } from '@/lib/site-info';
import './globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' });

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  metadataBase: new URL(productionHost ? `https://${productionHost}` : 'http://localhost:3000'),
  title: { default: `${SITE.name} | Campus food, ordered ahead`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  icons: { icon: '/brand/icon-64.png', apple: '/brand/apple-icon.png' },
  openGraph: { type: 'website', siteName: SITE.name, title: SITE.name, description: SITE.description },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  const studentId = profile?.role === 'student' ? profile.id : null;
  const [menu, openOrderCount] = studentId
    ? await Promise.all([getMenu(), countOpenStudentOrders(studentId)])
    : [null, 0];

  return (
    <html lang="en" className={`${figtree.variable} ${bricolage.variable}`} data-scroll-behavior="smooth">
      <body>
        <Providers studentId={studentId} menu={menu}>
          <SiteHeader profile={profile} openOrderCount={openOrderCount} />
          {children}
          <SiteFooter />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
