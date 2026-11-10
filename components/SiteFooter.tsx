'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from '@/components/Icons';
import { AUTH_PAGES, isStaffPath } from '@/components/SiteHeader';
import { NOT_CONFIRMED, phoneLink, SITE } from '@/lib/site-info';

export default function SiteFooter() {
  const pathname = usePathname();
  if (AUTH_PAGES.includes(pathname) || isStaffPath(pathname)) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="brand"><LogoMark /><span>{SITE.name}</span></span>
          <p className="site-footer-blurb">{SITE.description}</p>
        </div>
        <div>
          <h2>Explore</h2>
          <ul>
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/announcements">Announcements</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <h2>Cafeteria</h2>
          <ul>
            <li>{SITE.campus}</li>
            <li>{SITE.address ?? `Address: ${NOT_CONFIRMED}`}</li>
            <li>Phone: {SITE.phone ? <a href={phoneLink(SITE.phone)}>{SITE.phone}</a> : NOT_CONFIRMED}</li>
            <li>Email: {SITE.email ? <a href={`mailto:${SITE.email}`}>{SITE.email}</a> : NOT_CONFIRMED}</li>
          </ul>
        </div>
        <div>
          <h2>Opening hours</h2>
          {SITE.openingHours ? (
            <ul className="footer-hours">
              {SITE.openingHours.map(({ days, time }) => <li key={days}><span>{days}</span><span>{time}</span></li>)}
            </ul>
          ) : <p>{NOT_CONFIRMED}</p>}
        </div>
        <div>
          <h2>Help</h2>
          <ul>
            <li><Link href="/faq">FAQs</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="site-footer-base">© {new Date().getFullYear()} {SITE.name}</div>
    </footer>
  );
}
