'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MAX_ITEM_QUANTITY } from '@/lib/order-pricing';
import type { MenuItem } from '@/lib/types';

type ToastTone = 'success' | 'error' | 'info';
type ShowToast = (message: string, tone?: ToastTone) => void;
export type CartEntry = Pick<MenuItem, 'id' | 'name' | 'price' | 'imageUrl' | 'category'> & { quantity: number };

type CartContextValue = {
  cart: CartEntry[];
  cartCount: number;
  canOrder: boolean;
  addToCart: (item: MenuItem) => void;
  updateCartItem: (id: string, delta: number) => void;
  clearCart: () => void;
};

const TOAST_SHOWN_MS = 3500;
const TOAST_LEAVE_MS = 200;

const ToastContext = createContext<ShowToast>(() => {});
const CartContext = createContext<CartContextValue | null>(null);

export const useToast = () => useContext(ToastContext);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside Providers.');
  return value;
}

const toCartEntry = ({ id, name, price, imageUrl, category }: MenuItem, quantity: number): CartEntry => (
  { id, name, price, imageUrl, category, quantity }
);

export default function Providers({ studentId, menu, children }: { studentId: string | null; menu: MenuItem[] | null; children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: ToastTone; leaving: boolean } | null>(null);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const storageKey = studentId ? `cafe-connect-cart-${studentId}` : null;

  const showToast = useCallback<ShowToast>((message, tone = 'success') => {
    setToast({ id: Date.now(), message, tone, leaving: false });
  }, []);

  const toastId = toast?.id;
  useEffect(() => {
    if (toastId === undefined) return undefined;
    const leaveId = window.setTimeout(() => setToast((current) => current && { ...current, leaving: true }), TOAST_SHOWN_MS);
    const removeId = window.setTimeout(() => setToast(null), TOAST_SHOWN_MS + TOAST_LEAVE_MS);
    return () => {
      window.clearTimeout(leaveId);
      window.clearTimeout(removeId);
    };
  }, [toastId]);

  // Each student has their own basket, read after hydration because the server has no localStorage.
  useEffect(() => {
    let saved: CartEntry[] = [];
    try {
      saved = storageKey ? JSON.parse(localStorage.getItem(storageKey) ?? '[]') : [];
    } catch {
      saved = [];
    }
    setCart(saved);
    setLoadedKey(storageKey);
  }, [storageKey]);

  // Waits until the basket has loaded, so the empty starting basket never overwrites it.
  useEffect(() => {
    if (!storageKey || loadedKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      // Storage can be full or blocked. The basket still works for this visit.
    }
  }, [cart, storageKey, loadedKey]);

  // Keep the basket in step with the live menu: current prices, and nothing
  // that has been hidden or removed since it was added.
  useEffect(() => {
    if (!menu || !cart.length) return;

    const liveItems = new Map(menu.map((item) => [item.id, item]));
    const kept = cart.filter((entry) => liveItems.get(entry.id)?.available);
    const removedNames = cart.filter((entry) => !kept.includes(entry)).map((entry) => entry.name);
    const pricesChanged = kept.some((entry) => liveItems.get(entry.id)?.price !== entry.price);

    if (!removedNames.length && !pricesChanged) return;

    setCart(kept.map((entry) => toCartEntry(liveItems.get(entry.id)!, entry.quantity)));
    showToast(
      removedNames.length
        ? `${removedNames.join(', ')} is no longer available and was removed from your basket.`
        : 'Prices in your basket were updated.',
      'info',
    );
  }, [menu, cart, showToast]);

  const cartValue = useMemo<CartContextValue>(() => {
    const limitReached = (name: string) => showToast(`You can order up to ${MAX_ITEM_QUANTITY} of ${name} at a time.`, 'error');

    return {
      cart,
      cartCount: cart.reduce((total, entry) => total + entry.quantity, 0),
      canOrder: Boolean(studentId),
      addToCart: (item) => {
        const existing = cart.find((entry) => entry.id === item.id);
        if (existing && existing.quantity >= MAX_ITEM_QUANTITY) {
          limitReached(item.name);
          return;
        }
        setCart((current) => (
          current.some((entry) => entry.id === item.id)
            ? current.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
            : [...current, toCartEntry(item, 1)]
        ));
      },
      updateCartItem: (id, delta) => {
        const entry = cart.find((candidate) => candidate.id === id);
        if (!entry) return;
        if (entry.quantity + delta > MAX_ITEM_QUANTITY) {
          limitReached(entry.name);
          return;
        }
        setCart((current) => current
          .map((candidate) => (candidate.id === id ? { ...candidate, quantity: candidate.quantity + delta } : candidate))
          .filter((candidate) => candidate.quantity > 0));
      },
      clearCart: () => setCart([]),
    };
  }, [cart, showToast, studentId]);

  return (
    <ToastContext.Provider value={showToast}>
      <CartContext.Provider value={cartValue}>
        {children}
        <div className="toast-region" role="status" aria-live="polite">
          {toast ? <div key={toast.id} className={`toast toast-${toast.tone}${toast.leaving ? ' is-leaving' : ''}`}>{toast.message}</div> : null}
        </div>
      </CartContext.Provider>
    </ToastContext.Provider>
  );
}
