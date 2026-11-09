'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getSignedInRole } from '@/app/actions';
import { AuthCard, CONNECTION_ERROR, FormError } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm({ variant, notice }: { variant: 'student' | 'admin'; notice?: string }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(notice ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdminForm = variant === 'admin';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (signInError) {
        setError(signInError.code === 'invalid_credentials' ? 'Incorrect email or password.' : signInError.message);
        return;
      }

      const role = await getSignedInRole();
      if (isAdminForm && role !== 'admin') {
        await supabase.auth.signOut();
        setError('Incorrect email or password.');
        return;
      }

      // A full load, so the server renders the page for the new session.
      window.location.assign(role === 'admin' ? '/admin' : '/menu');
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={isAdminForm ? 'Staff sign in' : 'Welcome back'}
      subtitle={isAdminForm ? 'Manage orders, the menu and student accounts.' : 'Log in to order from the campus cafeteria.'}
    >
      <form className="form" method="post" onSubmit={handleSubmit}>
        <FormError message={error} />
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className="field">
          <span className="field-label-row">
            Password
            {isAdminForm ? null : <Link href="/forgot-password" className="text-link">Forgot password?</Link>}
          </span>
          <input type="password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-footer">
        {isAdminForm ? (
          <Link href="/login" className="text-link">Student login</Link>
        ) : (
          <>New here? <Link href="/register" className="text-link">Create an account</Link></>
        )}
      </p>
    </AuthCard>
  );
}
