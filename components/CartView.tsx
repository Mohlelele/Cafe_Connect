'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { placeOrder } from '@/app/actions';
import { BasketIcon, InfoIcon, MinusIcon, PAYMENT_ICONS, PlusIcon, TrashIcon } from '@/components/Icons';
import { useCart, useToast } from '@/components/Providers';
import { CONNECTION_ERROR, EmptyState, MenuImage, PageHeader } from '@/components/ui';
import { formatRand, PAYMENT_OPTIONS } from '@/lib/menu';
import type { PaymentMethod } from '@/lib/types';

export default function CartView() {
  const router = useRouter();
  const showToast = useToast();
  const { cart, cartCount, updateCartItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isPlacing, startPlacing] = useTransition();
  const total = cart.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;

  // Stays the same if the connection drops and the student tries again, so the
  // server can recognise a repeat and not create a second order.
  const requestId = useRef<string | null>(null);

  const handleCheckout = () => {
    if (isPlacing) return;
    requestId.current ??= crypto.randomUUID();

    startPlacing(async () => {
      try {
        const result = await placeOrder(cart.map(({ id, quantity }) => ({ id, quantity })), paymentMethod, requestId.current, total);
        if (result.ok) {
          requestId.current = null;
          clearCart();
          router.push(`/orders/${result.orderNumber}`);
        } else {
          requestId.current = null;
          showToast(result.message, 'error');
        }
      } catch {
        showToast(CONNECTION_ERROR, 'error');
      }
    });
  };

  if (cart.length === 0) {
    return (
      <>
        <PageHeader title="Your basket" />
        <EmptyState title="Your basket is empty" icon={<BasketIcon />}>
          <p>Add something from the menu to get started.</p>
          <Link href="/menu" className="btn btn-primary">Browse the menu</Link>
        </EmptyState>
      </>
    );
  }

  const placeLabel = isPlacing ? 'Placing order…' : 'Place order';

  return (
    <>
      <PageHeader title="Your basket" subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
        <Link href="/menu" className="btn btn-secondary">Add more items</Link>
      </PageHeader>

      <div className="checkout-layout">
        <ul className="panel basket-list">
          {cart.map((item) => (
            <li className="basket-row" key={item.id}>
              <MenuImage item={item} alt="" className="basket-image" sizes="64px" />
              <div className="basket-row-copy">
                <strong>{item.name}</strong>
                <span>{formatRand(item.price)} each</span>
              </div>
              <div className="stepper">
                <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => updateCartItem(item.id, -1)}><MinusIcon /></button>
                <span>{item.quantity}</span>
                <button type="button" aria-label={`Add one ${item.name}`} onClick={() => updateCartItem(item.id, 1)}><PlusIcon /></button>
              </div>
              <strong className="basket-row-total">{formatRand(item.price * item.quantity)}</strong>
              <button type="button" className="icon-btn" aria-label={`Remove ${item.name} from basket`} onClick={() => updateCartItem(item.id, -item.quantity)}><TrashIcon /></button>
            </li>
          ))}
        </ul>

        <section className="panel checkout-summary" aria-label="Checkout">
          <h2>Order summary</h2>
          <fieldset className="payment-options">
            <legend>How will you pay?</legend>
            {PAYMENT_OPTIONS.map(({ method, label, note }) => {
              const Icon = PAYMENT_ICONS[method];
              return (
                <label className="payment-option" key={method}>
                  <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                  <span><strong>{label}</strong><small>{note}</small></span>
                  <Icon />
                </label>
              );
            })}
          </fieldset>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatRand(total)}</strong>
          </div>

          <button type="button" className="btn btn-primary btn-block btn-lg" disabled={isPlacing} onClick={handleCheckout}>{placeLabel}</button>
          <p className="summary-note"><InfoIcon /> <span>Nothing is charged on this website. Staff confirm your payment at the cafeteria, and you collect using your order number.</span></p>
        </section>
      </div>

      <div className="checkout-bar">
        <div>
          <span>Total</span>
          <strong>{formatRand(total)}</strong>
        </div>
        <button type="button" className="btn btn-primary" disabled={isPlacing} onClick={handleCheckout}>{placeLabel}</button>
      </div>
    </>
  );
}
