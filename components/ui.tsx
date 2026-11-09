'use client';

import Link from 'next/link';
import { useRef, useState, useTransition, type ReactNode } from 'react';
import { LogoMark } from '@/components/Icons';
import { useToast } from '@/components/Providers';
import { getCategoryImage, getItemImage, STATUS_LABELS } from '@/lib/menu';
import type { ActionResult, MenuCategory, OrderStatus } from '@/lib/types';

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

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="brand auth-brand">
          <LogoMark />
          <span>Cafe Connect</span>
        </Link>
        <h1>{title}</h1>
        {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  return message ? <p className="form-error" role="alert">{message}</p> : null;
}

// Admins can paste any image address, so next/image's fixed host list does not fit.
export function MenuImage({ item, alt, className }: { item: { imageUrl: string; category: MenuCategory }; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? getCategoryImage(item.category) : getItemImage(item)}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
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

export function ConfirmButton({ label, title, body, confirmLabel, onConfirm, disabled }: {
  label: string;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="btn btn-danger-quiet btn-sm" disabled={disabled} onClick={() => dialogRef.current?.showModal()}>
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
