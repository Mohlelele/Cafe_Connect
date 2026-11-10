import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { LOGIN_VIEW_COOKIE } from '@/lib/login-view';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

// Finds the logged-in account. cache() means this only runs once per page load.
const getAccount = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, fullName: true, email: true, role: true },
  });
});

// Staff can log in on the student page to use the site as a student.
// The cookie can only lower access: the admin role always comes from the database.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const account = await getAccount();
  if (!account) return null;

  const cookieStore = await cookies();
  const chosenStudent = cookieStore.get(LOGIN_VIEW_COOKIE)?.value === 'student';
  return account.role === 'admin' && chosenStudent ? { ...account, role: 'student' } : account;
});

// The account's real role, whichever login page was used.
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
