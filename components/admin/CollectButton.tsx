'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { setOrderStatus } from '@/app/actions';
import { WalletIcon } from '@/components/Icons';
import { useToast } from '@/components/Providers';
import { CONNECTION_ERROR, FormError } from '@/components/ui';
import { formatRand } from '@/lib/menu';
import { orderNumberMatches, WRONG_ORDER_NUMBER } from '@/lib/order-status';
import type { Order } from '@/lib/types';

// "Mark collected" asks staff to type the order number the student shows
// (from their email or My orders) before the food is handed over. The server
// checks the number again, so this step cannot be skipped.
export default function CollectButton({ order }: { order: Order }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const showToast = useToast();
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = () => {
    setTyped('');
    setError(null);
    dialogRef.current?.showModal();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!orderNumberMatches(typed, order.orderNumber)) {
      setError(WRONG_ORDER_NUMBER);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await setOrderStatus(order.id, 'Collected', typed);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        dialogRef.current?.close();
        showToast(result.message, 'success');
      } catch {
        setError(CONNECTION_ERROR);
      }
    });
  };

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" aria-label={`Mark order ${order.orderNumber} collected`} onClick={open}>Mark collected</button>

      <dialog ref={dialogRef} className="dialog">
        <h2>Hand over the order</h2>
        <p>Ask <strong>{order.customerName}</strong> for their order number, from their email or the My orders page, and type it below.</p>
        <form className="dialog-form" onSubmit={handleSubmit}>
          <FormError message={error} />
          <label className="field">
            <span>Order number the student shows</span>
            <input
              type="text"
              name="collectionNumber"
              className={error ? 'code-input is-invalid' : 'code-input'}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="CC-XXXXXXXX"
              value={typed}
              onChange={(event) => { setTyped(event.target.value); setError(null); }}
              aria-invalid={error ? true : undefined}
              required
            />
            <small>Capitals, spaces and the &quot;CC-&quot; at the start do not matter.</small>
          </label>
          {order.paymentStatus === 'Unpaid' ? (
            <p className="collect-note"><WalletIcon /> <span>Not paid yet: take <strong>{formatRand(order.total)}</strong> in cash and confirm the payment.</span></p>
          ) : null}
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Checking…' : 'Confirm collection'}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
