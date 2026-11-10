'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AuthCard, CONNECTION_ERROR, FormError, PasswordField } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

const MIN_PASSWORD_LENGTH = 8;
const SHORT_PASSWORD = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters.`;
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !isValidEmail(email)) {
      setError('Please enter your name and a valid email address.');
      return;
    }
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(SHORT_PASSWORD);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const { data, error: signUpError } = await createClient().auth.signUp({
        email,
        password: form.password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/menu`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        window.location.assign('/menu');
        return;
      }
      setAwaitingConfirmation(true);
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <AuthCard title="Check your email" subtitle={`We sent a confirmation link to ${form.email.trim()}. Open it on this device to finish setting up your account.`}>
        <p className="auth-footer"><Link href="/login" className="text-link">Back to login</Link></p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Order ahead and collect without the queue.">
      <form className="form" method="post" onSubmit={handleSubmit}>
        <FormError message={error} />
        <label className="field">
          <span>Full name</span>
          <input type="text" name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        </label>
        <PasswordField label="Password" name="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} value={form.password} onChange={handleChange} hint={PASSWORD_HINT} />
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-footer">Already registered? <Link href="/login" className="text-link">Log in</Link></p>
    </AuthCard>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={sent ? 'Check your email' : 'Reset your password'}
      subtitle={sent ? 'If that email has an account, a reset link is on its way. Open it on this device.' : "Enter your email and we'll send you a reset link."}
    >
      {sent ? null : (
        <form className="form" method="post" onSubmit={handleSubmit}>
          <FormError message={error} />
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="auth-footer"><Link href="/login" className="text-link">Back to login</Link></p>
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(SHORT_PASSWORD);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await supabase.auth.signOut();
      window.location.assign('/login');
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle="You'll use this to log in from now on.">
      <form className="form" method="post" onSubmit={handleSubmit}>
        <FormError message={error} />
        <PasswordField label="New password" name="newPassword" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} value={password} onChange={(event) => setPassword(event.target.value)} hint={PASSWORD_HINT} />
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthCard>
  );
}
