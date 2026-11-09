import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/AuthForms';
import { getCurrentProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage() {
  if (await getCurrentProfile()) redirect('/');
  return <RegisterForm />;
}
