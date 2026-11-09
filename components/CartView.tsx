'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { placeOrder } from '@/app/actions';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import { useCart, useToast } from '@/components/Providers';
import { CONNECTION_ERROR, EmptyState, MenuImage, PageHeader } from '@/components/ui';
import { formatRand, PAYMENT_LABELS, PAYMENT_METHODS } from '@/lib/menu';
import type { PaymentMethod } from '@/lib/types';

export default function CartView() {
  const router = useRouter();
  const showToast = useToast();
  const { cart, cartCount, updateCartItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isPlacing, startPlacing] = useTransition();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    startPlacing(async () => {
      try {
        const result = await placeOrder(cart.map(({ id, quantity }) => ({ id, quantity })), paymentMethod);
        if (result.ok) {
          clearCart();
          router.push(`/orders/${result.orderNumber}`);
        } else {
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
        <EmptyState title="Your basket is empty">
          <p>Add something from today&rsquo;s menu to get started.</p>
          <Link href="/menu" className="btn btn-primary">Browse the menu</Link>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your basket" subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
        <Link href="/menu" className="btn btn-secondary">Add more items</Link>
      </PageHeader>

      <div className="checkout-layout">
        <ul className="panel basket-list">
          {cart.map((item) => (
            <li className="basket-row" key={item.id}>
              <MenuImage item={item} alt="" className="basket-image" />
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
            </li>
          ))}
        </ul>

        <section className="panel checkout-summary" aria-label="Checkout">
          <fieldset className="payment-options">
            <legend>How will you pay?</legend>
            {PAYMENT_METHODS.map((method) => (
              <label className="payment-option" key={method}>
                <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                <span>{PAYMENT_LABELS[method]}</span>
              </label>
            ))}
          </fieldset>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatRand(total)}</strong>
          </div>

          <button type="button" className="btn btn-primary btn-block" disabled={isPlacing} onClick={handleCheckout}>
            {isPlacing ? 'Placing order…' : 'Place order'}
          </button>
          <p className="summary-note">No payment is taken online. Show your order number at the counter to pay and collect.</p>
        </section>
      </div>
    </>
  );
}
