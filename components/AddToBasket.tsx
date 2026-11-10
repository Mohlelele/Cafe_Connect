'use client';

import Link from 'next/link';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import { useCart } from '@/components/Providers';
import { StatusBadge } from '@/components/ui';
import type { MenuItem } from '@/lib/types';

// Shows "Add" until the item is in the basket, then plus and minus buttons.
export default function AddToBasket({ item }: { item: MenuItem }) {
  const { cart, canOrder, addToCart, updateCartItem } = useCart();
  const quantity = cart.find((entry) => entry.id === item.id)?.quantity ?? 0;

  if (!item.available) return <StatusBadge status="Unavailable" />;

  if (!canOrder) {
    return <Link href="/login" className="btn btn-primary btn-sm" aria-label={`Log in to order ${item.name}`}>Order</Link>;
  }

  if (quantity === 0) {
    return (
      <button type="button" className="btn btn-primary btn-sm" aria-label={`Add ${item.name} to basket`} onClick={() => addToCart(item)}>
        <PlusIcon /> Add
      </button>
    );
  }

  return (
    <div className="stepper">
      <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => updateCartItem(item.id, -1)}><MinusIcon /></button>
      <span aria-label={`${quantity} in basket`}>{quantity}</span>
      <button type="button" aria-label={`Add one ${item.name}`} onClick={() => updateCartItem(item.id, 1)}><PlusIcon /></button>
    </div>
  );
}
