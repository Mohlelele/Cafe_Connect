'use client';

import { SignOutIcon, SwitchIcon } from '@/components/Icons';
import { logOut, switchView } from '@/lib/auth-client';

export default function AccountActions({ isStaff }: { isStaff: boolean }) {
  return (
    <div className="stack">
      {isStaff ? (
        <button type="button" className="btn btn-secondary btn-block" onClick={() => switchView('admin')}><SwitchIcon /> Go to staff view</button>
      ) : null}
      <button type="button" className="btn btn-secondary btn-block" onClick={logOut}><SignOutIcon /> Log out</button>
    </div>
  );
}
