import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getCurrentProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'Log in', description: 'Log in to order from the campus cafeteria.' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentProfile()) redirect('/');
  const { error } = await searchParams;
  return <LoginForm variant="student" notice={error === 'link' ? 'That link is invalid or has expired. Please request a new one.' : undefined} />;
}
