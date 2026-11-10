import type { Metadata } from 'next';
import MenuManager, { AddMenuItemButton } from '@/components/admin/MenuManager';
import { PageHeader } from '@/components/ui';
import { getMenu } from '@/lib/data';
import { requireAdmin } from '@/lib/session';

export const metadata: Metadata = { title: 'Manage menu' };

export default async function AdminMenuPage() {
  await requireAdmin();
  const menu = await getMenu();

  return (
    <main className="page">
      <PageHeader title="Menu" subtitle="Add food with photos, ingredients and allergens, and control what students can order.">
        <AddMenuItemButton />
      </PageHeader>
      <MenuManager menu={menu} />
    </main>
  );
}
