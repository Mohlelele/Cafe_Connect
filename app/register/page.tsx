import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/AuthForms';
import { getCurrentProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'Create account', description: 'Create a Cafe Connect account and order ahead.' };

// /register?staff=1 is the staff version of the form.
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ staff?: string }> }) {
  if (await getCurrentProfile()) redirect('/');
  const { staff } = await searchParams;
  return <RegisterForm asStaff={staff === '1'} />;
}
