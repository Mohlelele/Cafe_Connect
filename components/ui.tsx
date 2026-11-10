'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState, useTransition, type ChangeEvent, type ReactNode } from 'react';
import { CATEGORY_ICONS, EyeIcon, EyeOffIcon, LeafIcon, LogoFull, LogoMark, StarIcon, WarningIcon } from '@/components/Icons';
import { useToast } from '@/components/Providers';
import type { ActionResult, MenuCategory, OrderStatus, PaymentStatus } from '@/lib/types';
import { passwordStrength } from '@/lib/validate';

export const CONNECTION_ERROR = 'Could not reach the server. Check your connection and try again.';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="page-header-actions">{children}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus | PaymentStatus | 'Available' | 'Unavailable' }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export function EmptyState({ title, icon, children }: { title: string; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div className="empty-state">
      {icon ? <span className="empty-state-icon">{icon}</span> : null}
      <h2>{title}</h2>
      {children}
    </div>
  );
}

const AUTH_PHOTO = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=75';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside" aria-hidden="true">
        <Image src={AUTH_PHOTO} alt="" fill sizes="50vw" />
        <LogoFull className="logo-full auth-aside-logo" />
        <div className="auth-aside-copy">
          <h2>Your lunch, ready when you are.</h2>
          <p>Order from anywhere on campus and collect without the queue.</p>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <Link href="/" className="brand auth-brand">
            <LogoMark />
            <span>Cafe Connect</span>
          </Link>
          <h1>{title}</h1>
          {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
          {children}
        </div>
      </main>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="form-error" role="alert"><WarningIcon /> <span>{message}</span></p>;
}

// Shown under a new password while it is typed: Weak, Fair or Strong, with a tip.
function StrengthMeter({ password, email }: { password: string; email: string }) {
  if (!password) return null;
  const { level, label, tip } = passwordStrength(password, email);
  return (
    <div className={`strength strength-${level}`} aria-live="polite">
      <span className="strength-bars" aria-hidden="true"><span /><span /><span /></span>
      <span><strong>{label}.</strong> {tip}</span>
    </div>
  );
}

export function PasswordField({ label, name, value, onChange, autoComplete, minLength, hint, labelExtra, showStrength = false, email = '' }: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  minLength?: number;
  hint?: string;
  labelExtra?: ReactNode;
  showStrength?: boolean; // For new passwords only, not when logging in.
  email?: string; // Lets the meter warn if the password contains the email name.
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="field">
      <span className="field-label-row">
        <label htmlFor={id}>{label}</label>
        {labelExtra}
      </span>
      <div className="password-wrap">
        <input id={id} type={visible ? 'text' : 'password'} name={name} autoComplete={autoComplete} minLength={minLength} value={value} onChange={onChange} required />
        <button type="button" className="password-toggle" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {showStrength && value ? <StrengthMeter password={value} email={email} /> : hint ? <small>{hint}</small> : null}
    </div>
  );
}

const OPTIMISED_HOSTS = /^https:\/\/(images\.unsplash\.com|[a-z0-9-]+\.supabase\.co)\//i;

// Shows the food photo, or a tile with the category icon if there is no photo or it fails to load.
export function MenuImage({ item, alt, className, sizes, priority = false }: {
  item: { imageUrl: string; category: MenuCategory };
  alt: string;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const Placeholder = CATEGORY_ICONS[item.category];
  const showPhoto = item.imageUrl && failedUrl !== item.imageUrl;

  return (
    <span className={`media ${className}`}>
      {showPhoto ? (
        <Image
          src={item.imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!OPTIMISED_HOSTS.test(item.imageUrl)}
          onError={() => setFailedUrl(item.imageUrl)}
        />
      ) : (
        <span className="media-placeholder"><Placeholder /></span>
      )}
    </span>
  );
}

// A row of five stars showing a rating, e.g. 4 out of 5.
export function Stars({ value, className = 'stars' }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={className} role="img" aria-label={`${value.toFixed(value % 1 ? 1 : 0)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} className={star <= rounded ? 'icon star-on' : 'icon star-off'} />)}
    </span>
  );
}

// "★ 4.6 (12)" on a menu card. Shows nothing until the dish has a rating.
export function CardRating({ rating }: { rating?: { average: number; count: number } }) {
  if (!rating || rating.count === 0) return null;
  return (
    <span className="card-rating" aria-label={`Rated ${rating.average.toFixed(1)} out of 5 by ${rating.count} ${rating.count === 1 ? 'student' : 'students'}`}>
      <StarIcon className="icon star-on" /> <strong>{rating.average.toFixed(1)}</strong> <span>({rating.count})</span>
    </span>
  );
}

// Small labels such as "Vegetarian". Shows nothing if there are none.
export function DietaryTags({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <ul className="tag-list" aria-label="Dietary labels">
      {labels.map((label) => <li key={label} className="tag"><LeafIcon /> {label}</li>)}
    </ul>
  );
}

// Runs a server action and reports the outcome as a toast.
export function useActionRunner() {
  const showToast = useToast();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>, onSuccess?: () => void) => {
    startTransition(async () => {
      try {
        const result = await action();
        showToast(result.message, result.ok ? 'success' : 'error');
        if (result.ok) onSuccess?.();
      } catch {
        showToast(CONNECTION_ERROR, 'error');
      }
    });
  };

  return { run, pending };
}

export function ConfirmButton({ label, title, body, confirmLabel, onConfirm, disabled, ariaLabel }: {
  label: string;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="btn btn-danger-quiet btn-sm" aria-label={ariaLabel} disabled={disabled} onClick={() => dialogRef.current?.showModal()}>
        {label}
      </button>
      <dialog ref={dialogRef} className="dialog">
        <h2>{title}</h2>
        <p>{body}</p>
        <form method="dialog" className="dialog-actions">
          <button type="submit" className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </form>
      </dialog>
    </>
  );
}
