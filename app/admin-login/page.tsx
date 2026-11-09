import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getCurrentProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'Staff sign in' };

export default async function AdminLoginPage() {
  if (await getCurrentProfile()) redirect('/');
  return <LoginForm variant="admin" />;
}
