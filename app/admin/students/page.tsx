import type { Metadata } from 'next';
import StudentManager, { StaffRequests } from '@/components/admin/StudentManager';
import { PageHeader } from '@/components/ui';
import { getStaffRequests, getStudents } from '@/lib/data';
import { requireAdmin } from '@/lib/session';
import { hasAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = { title: 'Students' };

export default async function AdminStudentsPage() {
  await requireAdmin();
  const [students, staffRequests] = await Promise.all([getStudents(), getStaffRequests()]);

  return (
    <main className="page">
      <PageHeader title="Students" subtitle="Create accounts, help students who are locked out and approve new staff." />
      <StaffRequests requests={staffRequests} />
      <StudentManager students={students} toolsReady={hasAdminClient()} />
    </main>
  );
}
