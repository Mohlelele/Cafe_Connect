import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { LOGIN_VIEW_COOKIE } from '@/lib/login-view';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/lib/types';

// Finds the logged-in account. cache() means this only runs once per page load.
const getAccount = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, fullName: true, email: true, role: true },
  });
});

// Staff can use the site as a student. The cookie can only lower access:
// the admin role, and so isStaff, always comes from the database.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const account = await getAccount();
  if (!account) return null;

  const isStaff = account.role === 'admin';
  const cookieStore = await cookies();
  const usingStudentView = cookieStore.get(LOGIN_VIEW_COOKIE)?.value === 'student';
  const role: UserRole = isStaff && !usingStudentView ? 'admin' : 'student';
  return { ...account, role, isStaff };
});

// The account's real role, whichever view it is using.
export async function getAccountRole() {
  return (await getAccount())?.role ?? null;
}

export async function requireStudent(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (profile.role === 'admin') redirect('/admin');
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/admin-login');
  if (profile.role !== 'admin') redirect('/menu');
  return profile;
}
