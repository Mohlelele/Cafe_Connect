import type { Metadata } from 'next';
import MenuManager from '@/components/admin/MenuManager';
import { PageHeader } from '@/components/ui';
import { getMenu } from '@/lib/data';
import { requireAdmin } from '@/lib/session';

export const metadata: Metadata = { title: 'Manage menu' };

export default async function AdminMenuPage() {
  await requireAdmin();
  const menu = await getMenu();

  return (
    <main className="page">
      <PageHeader title="Menu" subtitle="Add, edit and control what students can order." />
      <MenuManager menu={menu} />
    </main>
  );
}
