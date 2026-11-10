'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { CloseIcon, HistoryIcon, LightningIcon, LogoFull, MegaphoneIcon, MenuBarsIcon, SignOutIcon, StudentIcon, SwitchIcon, UtensilsIcon } from '@/components/Icons';
import { logOut, switchView } from '@/lib/auth-client';

const LINKS = [
  { href: '/admin', label: 'Live orders', Icon: LightningIcon },
  { href: '/admin/orders', label: 'Order history', Icon: HistoryIcon },
  { href: '/admin/menu', label: 'Menu', Icon: UtensilsIcon },
  { href: '/admin/students', label: 'Students', Icon: StudentIcon },
  { href: '/admin/announcements', label: 'Announcements', Icon: MegaphoneIcon },
];

function LinkProgress() {
  const { pending } = useLinkStatus();
  return <span className={pending ? 'nav-progress is-loading' : 'nav-progress'} aria-hidden="true" />;
}

export default function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);

  const currentLabel = LINKS.find((link) => link.href === pathname)?.label ?? 'Staff';

  return (
    <div className={drawerOpen ? 'admin-shell is-open' : 'admin-shell'}>
      <button type="button" className="admin-backdrop" aria-label="Close menu" tabIndex={drawerOpen ? 0 : -1} onClick={() => setDrawerOpen(false)} />

      <aside className="admin-sidebar" id="admin-sidebar">
        <Link href="/admin" className="admin-brand" onClick={() => setDrawerOpen(false)}>
          <LogoFull className="logo-full admin-logo" />
        </Link>

        <nav className="admin-nav" aria-label="Staff">
          {LINKS.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="admin-nav-link" aria-current={pathname === href ? 'page' : undefined} onClick={() => setDrawerOpen(false)}>
              <Icon />
              {label}
              <LinkProgress />
            </Link>
          ))}
        </nav>

        <div className="admin-account">
          <div className="admin-account-name">{name}</div>
          <button type="button" onClick={() => switchView('student')}><SwitchIcon className="icon" /> Use as student</button>
          <button type="button" onClick={logOut}><SignOutIcon className="icon" /> Log out</button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <button type="button" className="icon-btn" aria-label={drawerOpen ? 'Close menu' : 'Open menu'} aria-expanded={drawerOpen} aria-controls="admin-sidebar" onClick={() => setDrawerOpen((open) => !open)}>
            {drawerOpen ? <CloseIcon /> : <MenuBarsIcon />}
          </button>
          <strong>{currentLabel}</strong>
        </header>
        {children}
      </div>
    </div>
  );
}
