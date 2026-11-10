'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccountIcon, BasketIcon, ReceiptIcon, UtensilsIcon } from '@/components/Icons';
import { useCart } from '@/components/Providers';
import { AUTH_PAGES, isStaffPath } from '@/components/SiteHeader';

const LINKS = [
  { href: '/menu', label: 'Menu', Icon: UtensilsIcon },
  { href: '/orders', label: 'Orders', Icon: ReceiptIcon },
  { href: '/cart', label: 'Basket', Icon: BasketIcon },
  { href: '/account', label: 'Account', Icon: AccountIcon },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  if (AUTH_PAGES.includes(pathname) || isStaffPath(pathname)) return null;

  return (
    <nav className="mobile-nav" aria-label="Quick links">
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}>
          <Icon />
          {label}
          {href === '/cart' && cartCount > 0 ? <span key={cartCount} className="mobile-nav-badge">{cartCount}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
