import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import OrderQueue from '@/components/admin/OrderQueue';
import { ClipboardIcon, ClockIcon, UtensilsIcon, WalletIcon } from '@/components/Icons';
import LiveUpdates from '@/components/LiveUpdates';
import { PageHeader } from '@/components/ui';
import { getActiveOrders, getDashboardStats } from '@/lib/data';
import { formatRand } from '@/lib/menu';
import { requireAdmin } from '@/lib/session';

export const metadata: Metadata = { title: 'Live orders' };

export default async function AdminPage() {
  await requireAdmin();
  const [orders, stats] = await Promise.all([getActiveOrders(), getDashboardStats()]);

  const tiles: { label: string; value: string; icon: ReactNode }[] = [
    { label: 'Open orders', value: String(orders.length), icon: <ClockIcon /> },
    { label: 'Orders today', value: String(stats.ordersToday), icon: <ClipboardIcon /> },
    { label: 'Paid today', value: formatRand(stats.revenueToday), icon: <WalletIcon /> },
    { label: 'Items available', value: String(stats.availableItems), icon: <UtensilsIcon /> },
  ];

  return (
    <main className="page">
      <PageHeader title="Live orders" subtitle="New orders appear here automatically.">
        <LiveUpdates tables={['orders', 'menu_items']} showStatus />
      </PageHeader>
      <div className="stat-grid">
        {tiles.map((tile) => (
          <div className="stat" key={tile.label}>
            <span className="stat-icon">{tile.icon}</span>
            <div>
              <span className="stat-label">{tile.label}</span>
              <strong className="stat-value">{tile.value}</strong>
            </div>
          </div>
        ))}
      </div>
      <OrderQueue orders={orders} />
    </main>
  );
}
