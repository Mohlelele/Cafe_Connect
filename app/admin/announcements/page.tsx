import type { Metadata } from 'next';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import { PageHeader } from '@/components/ui';
import { getAnnouncements } from '@/lib/data';
import { requireAdmin } from '@/lib/session';

export const metadata: Metadata = { title: 'Manage announcements' };

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const announcements = await getAnnouncements();

  return (
    <main className="page page-wide">
      <PageHeader title="Announcements" subtitle="The newest announcement is shown at the top of the student menu." />
      <AnnouncementManager announcements={announcements} />
    </main>
  );
}
