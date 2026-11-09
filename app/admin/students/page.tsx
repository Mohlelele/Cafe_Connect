import type { Metadata } from 'next';
import StudentManager from '@/components/admin/StudentManager';
import { PageHeader } from '@/components/ui';
import { getStudents } from '@/lib/data';
import { requireAdmin } from '@/lib/session';
import { hasAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = { title: 'Students' };

export default async function AdminStudentsPage() {
  await requireAdmin();
  const students = await getStudents();

  return (
    <main className="page page-wide">
      <PageHeader title="Students" subtitle="Create accounts and help students who are locked out." />
      <StudentManager students={students} toolsReady={hasAdminClient()} />
    </main>
  );
}
