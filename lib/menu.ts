import type { MenuCategory, PaymentMethod } from '@/lib/types';

export const MENU_CATEGORIES: MenuCategory[] = ['Burgers', 'Pizza', 'Meals', 'Drinks'];

export const CATEGORY_FILTERS = ['All', ...MENU_CATEGORIES] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

// No payment is taken on the website. These tell the cafeteria how a student plans to pay.
export const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; note: string }[] = [
  { method: 'Cash', label: 'Cash', note: 'Pay at the counter when you collect.' },
  { method: 'Card', label: 'Card', note: 'Pay by card at the counter when you collect.' },
  { method: 'EFT', label: 'EFT', note: 'Staff confirm your payment once it has been received.' },
  { method: 'InstantEFT', label: 'Instant EFT', note: 'Staff confirm your payment once it has been received.' },
];

export const PAYMENT_METHODS: PaymentMethod[] = PAYMENT_OPTIONS.map((option) => option.method);

export const PAYMENT_LABELS = Object.fromEntries(PAYMENT_OPTIONS.map((option) => [option.method, option.label])) as Record<PaymentMethod, string>;

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
