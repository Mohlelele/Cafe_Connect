import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/AuthForms';

export const metadata: Metadata = { title: 'Reset password', description: 'Get a link to reset your Cafe Connect password.' };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
