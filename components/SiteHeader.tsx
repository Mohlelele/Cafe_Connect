'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { BasketIcon, InfoIcon, LogoMark, MegaphoneIcon, ReceiptIcon, SignOutIcon, SwitchIcon, UtensilsIcon } from '@/components/Icons';
import { useCart } from '@/components/Providers';
import { logOut, switchView } from '@/lib/auth-client';
import type { Profile } from '@/lib/types';

export const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/admin-login'];

export const isStaffPath = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');

const GUEST_LINKS = [
  { href: '/menu', label: 'Menu', Icon: UtensilsIcon },
  { href: '/announcements', label: 'Announcements', Icon: MegaphoneIcon },
  { href: '/about', label: 'About', Icon: InfoIcon },
];

const STUDENT_LINKS = [
  { href: '/menu', label: 'Menu', Icon: UtensilsIcon },
  { href: '/orders', label: 'My orders', Icon: ReceiptIcon },
  { href: '/announcements', label: 'Announcements', Icon: MegaphoneIcon },
  { href: '/about', label: 'About', Icon: InfoIcon },
];

// Shows a moving bar under a link while its page is loading.
function LinkProgress() {
  const { pending } = useLinkStatus();
  return <span className={pending ? 'nav-progress is-loading' : 'nav-progress'} aria-hidden="true" />;
}

export default function SiteHeader({ profile, openOrderCount }: { profile: Profile | null; openOrderCount: number }) {
  const pathname = usePathname();
  const { cartCount } = useCart();

  if (AUTH_PAGES.includes(pathname) || isStaffPath(pathname)) return null;

  const isStudent = profile?.role === 'student';
  const links = isStudent ? STUDENT_LINKS : GUEST_LINKS;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <LogoMark />
          <span>Cafe Connect</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="site-nav-link" aria-current={pathname === href ? 'page' : undefined}>
              <Icon />
              {label}
              {href === '/orders' && openOrderCount > 0 ? <span className="nav-count">{openOrderCount}</span> : null}
              <LinkProgress />
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          {isStudent ? (
            <Link href="/cart" className="basket-link" aria-label={`Basket, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
              <BasketIcon />
              {cartCount > 0 ? <span key={cartCount} className="basket-count">{cartCount}</span> : null}
            </Link>
          ) : null}

          {profile ? (
            <>
              <span className="user-name">{profile.fullName}</span>
              {profile.isStaff ? (
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => switchView('admin')}><SwitchIcon /> Staff view</button>
              ) : null}
              <button type="button" className="btn btn-quiet btn-sm" onClick={logOut}><SignOutIcon /> Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-quiet btn-sm">Log in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
