import type { MenuCategory, MenuItem, PaymentMethod } from '@/lib/types';

export const MENU_CATEGORIES: MenuCategory[] = ['Burgers', 'Pizza', 'Meals', 'Drinks'];

export const CATEGORY_FILTERS = ['All', ...MENU_CATEGORIES] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const CATEGORY_IMAGES: Record<MenuCategory, string> = {
  Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  Meals: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
  Drinks: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
};

export const getCategoryImage = (category: MenuCategory) => CATEGORY_IMAGES[category];

export const getItemImage = (item: Pick<MenuItem, 'imageUrl' | 'category'>) => item.imageUrl || getCategoryImage(item.category);

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  Cash: 'Pay at cafeteria',
  Card: 'Debit or credit card',
  EFT: 'EFT',
  InstantEFT: 'Instant EFT',
};

export const PAYMENT_METHODS = Object.keys(PAYMENT_LABELS) as PaymentMethod[];

const randFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatRand = (amount: number) => `R ${randFormatter.format(amount)}`;

// Server rendering runs in UTC, so the campus time zone has to be explicit.
export const CAMPUS_TIME_ZONE = 'Africa/Johannesburg';

export const formatOrderTime = (createdAt: string) => new Date(createdAt).toLocaleString('en-ZA', {
  timeZone: CAMPUS_TIME_ZONE,
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatOrderItems = (items: { name: string; quantity: number }[]) => (
  items.map((item) => `${item.quantity} × ${item.name}`).join(', ')
);
