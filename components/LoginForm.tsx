'use client';

import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { getSignedInRole } from '@/app/actions';
import { AuthCard, CONNECTION_ERROR, FormError, PasswordField } from '@/components/ui';
import { rememberLoginView } from '@/lib/login-view';
import { loadSupabase, preloadSupabase } from '@/lib/supabase/lazy';

export default function LoginForm({ variant, notice }: { variant: 'student' | 'admin'; notice?: string }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(notice ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdminForm = variant === 'admin';
  useEffect(preloadSupabase, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = await loadSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (signInError) {
        setError(signInError.code === 'invalid_credentials' ? 'Incorrect email or password.' : signInError.message);
        return;
      }

      if (isAdminForm && (await getSignedInRole()) !== 'admin') {
        await supabase.auth.signOut();
        setError('This account does not have staff access. If you asked for a staff account, a manager still needs to approve it.');
        return;
      }

      rememberLoginView(variant);

      // A full load, so the server renders the page for the new session.
      window.location.assign(isAdminForm ? '/admin' : '/menu');
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
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          labelExtra={<Link href="/forgot-password" className="text-link">Forgot password?</Link>}
        />
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-footer">
        {isAdminForm ? (
          <>New staff member? <Link href="/register?staff=1" className="text-link">Request a staff account</Link> · <Link href="/login" className="text-link">Student login</Link></>
        ) : (
          <>New here? <Link href="/register" className="text-link">Create an account</Link> · <Link href="/admin-login" className="text-link">Staff sign in</Link></>
        )}
      </p>
    </AuthCard>
  );
}
