import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell name={admin.fullName}>{children}</AdminShell>;
}
