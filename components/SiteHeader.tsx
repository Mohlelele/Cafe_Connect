'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BasketIcon,
  ClipboardIcon,
  HistoryIcon,
  InfoIcon,
  LightningIcon,
  LogoMark,
  MegaphoneIcon,
  ReceiptIcon,
  SignOutIcon,
  StudentIcon,
  UtensilsIcon,
} from '@/components/Icons';
import { useCart } from '@/components/Providers';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

const GUEST_ONLY_PAGES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/admin-login'];

const GUEST_LINKS = [
  { href: '/announcements', label: 'Announcements', Icon: MegaphoneIcon },
  { href: '/about', label: 'About', Icon: InfoIcon },
];

const STUDENT_LINKS = [
  { href: '/menu', label: 'Menu', Icon: UtensilsIcon },
  { href: '/orders', label: 'My orders', Icon: ReceiptIcon },
  ...GUEST_LINKS,
];

const ADMIN_LINKS = [
  { href: '/admin', label: 'Live orders', Icon: LightningIcon },
  { href: '/admin/orders', label: 'Order history', Icon: HistoryIcon },
  { href: '/admin/menu', label: 'Menu', Icon: ClipboardIcon },
  { href: '/admin/students', label: 'Students', Icon: StudentIcon },
  { href: '/admin/announcements', label: 'Announcements', Icon: MegaphoneIcon },
];

// Shows a moving bar under a link while its page is loading.
function LinkProgress() {
  const { pending } = useLinkStatus();
  return <span className={pending ? 'nav-progress is-loading' : 'nav-progress'} aria-hidden="true" />;
}

export default function SiteHeader({ profile, openOrderCount }: { profile: Profile | null; openOrderCount: number }) {
  const pathname = usePathname();
  const { cartCount } = useCart();

  if (!profile && GUEST_ONLY_PAGES.includes(pathname)) return null;

  const isStudent = profile?.role === 'student';
  const links = profile?.role === 'admin' ? ADMIN_LINKS : isStudent ? STUDENT_LINKS : GUEST_LINKS;

  const logout = async () => {
    await createClient().auth.signOut();
    window.location.assign('/');
  };

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
              {cartCount > 0 ? <span className="basket-count">{cartCount}</span> : null}
            </Link>
          ) : null}

          {profile ? (
            <>
              <span className="user-name">{profile.fullName}</span>
              <button type="button" className="btn btn-quiet btn-sm" onClick={logout}><SignOutIcon /> Log out</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
