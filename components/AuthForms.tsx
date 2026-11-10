'use client';

import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { AuthCard, CONNECTION_ERROR, FormError, PasswordField } from '@/components/ui';
import { loadSupabase, preloadSupabase } from '@/lib/supabase/lazy';

const MIN_PASSWORD_LENGTH = 8;
const SHORT_PASSWORD = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters.`;
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Staff use the same form. Their sign-up only asks for staff access: a manager
// approves it on the Students page, and until then the account is a student account.
export function RegisterForm({ asStaff = false }: { asStaff?: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [staffRequestSent, setStaffRequestSent] = useState(false);
  useEffect(preloadSupabase, []);
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
      const supabase = await loadSupabase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: asStaff ? { full_name: name, staff_request: true } : { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/menu`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (asStaff) {
        // Sign straight back out: staff access only starts once a manager approves it.
        if (data.session) await supabase.auth.signOut();
        setStaffRequestSent(true);
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

  if (staffRequestSent) {
    return (
      <AuthCard title="Request sent" subtitle="A manager needs to approve your staff account. Once they have, use Staff sign in with the email and password you just chose.">
        <p className="auth-footer"><Link href="/admin-login" className="text-link">Go to Staff sign in</Link></p>
      </AuthCard>
    );
  }

  if (awaitingConfirmation) {
    return (
      <AuthCard title="Check your email" subtitle={`We sent a confirmation link to ${form.email.trim()}. Open it on this device to finish setting up your account.`}>
        <p className="auth-footer"><Link href="/login" className="text-link">Back to login</Link></p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={asStaff ? 'Create a staff account' : 'Create your account'}
      subtitle={asStaff ? 'For cafeteria staff. A manager approves new staff accounts before they can be used.' : 'Order ahead and collect without the queue.'}
    >
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
          {isSubmitting ? 'Creating account…' : asStaff ? 'Request staff account' : 'Create account'}
        </button>
      </form>
      {asStaff ? (
        <p className="auth-footer">Already approved? <Link href="/admin-login" className="text-link">Staff sign in</Link> · <Link href="/register" className="text-link">Student sign-up</Link></p>
      ) : (
        <p className="auth-footer">Already registered? <Link href="/login" className="text-link">Log in</Link> · <Link href="/register?staff=1" className="text-link">Cafeteria staff?</Link></p>
      )}
    </AuthCard>
  );
}

const RESEND_WAIT_SECONDS = 60;

// Step 1: the student enters their email and Supabase emails them a one-time code
// (sent through Resend once it is set up as Supabase's email sender).
// Step 2: they type the code and a new password on this same page, so it works
// even if the email is opened on a different device.
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  useEffect(preloadSupabase, []);

  // Counts down until another code may be requested.
  useEffect(() => {
    if (waitSeconds <= 0) return;
    const timerId = window.setTimeout(() => setWaitSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [waitSeconds]);

  const sendCode = async () => {
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const supabase = await loadSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }
      setCodeSent(true);
      setWaitSeconds(RESEND_WAIT_SECONDS);
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCode = (event: FormEvent) => {
    event.preventDefault();
    void sendCode();
  };

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    const token = code.replace(/\s/g, '');

    if (!/^\d{6,10}$/.test(token)) {
      setError('Enter the code from the email. It is made of numbers only.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(SHORT_PASSWORD);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const supabase = await loadSupabase();
      const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'recovery' });
      if (verifyError) {
        setError('That code is wrong or has expired. Check your latest email, or send a new code.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Signed in with the new password. The home page sends them to the right place.
      window.location.assign('/');
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!codeSent) {
    return (
      <AuthCard title="Reset your password" subtitle="Enter your email and we'll send you a one-time code.">
        <form className="form" method="post" onSubmit={handleSendCode}>
          <FormError message={error} />
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send code'}
          </button>
        </form>
        <p className="auth-footer"><Link href="/login" className="text-link">Back to login</Link></p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Enter your code" subtitle={`If ${email.trim()} has an account, we've emailed it a code. It can take a minute to arrive, so check your spam folder too.`}>
      <form className="form" method="post" onSubmit={handleReset}>
        <FormError message={error} />
        <label className="field">
          <span>Code from the email</span>
          <input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={12}
            className="code-input"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </label>
        <PasswordField label="New password" name="newPassword" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} value={password} onChange={(event) => setPassword(event.target.value)} hint={PASSWORD_HINT} />
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Reset password'}
        </button>
      </form>
      <p className="auth-footer">
        {waitSeconds > 0 ? (
          <span>Send a new code in {waitSeconds}s</span>
        ) : (
          <button type="button" className="text-link link-button" disabled={isSubmitting} onClick={() => void sendCode()}>Send a new code</button>
        )}
        {' · '}
        <button type="button" className="text-link link-button" onClick={() => { setCodeSent(false); setCode(''); setError(null); }}>Use a different email</button>
      </p>
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
      const supabase = await loadSupabase();
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
