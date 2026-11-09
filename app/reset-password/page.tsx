import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/AuthForms';
import { getCurrentProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'Choose a new password' };

// The link in the reset email signs the person in before landing here.
export default async function ResetPasswordPage() {
  if (!(await getCurrentProfile())) redirect('/forgot-password');
  return <ResetPasswordForm />;
}
