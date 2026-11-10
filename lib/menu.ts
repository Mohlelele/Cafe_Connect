import type { MenuCategory, PaymentMethod } from '@/lib/types';

export const MENU_CATEGORIES: MenuCategory[] = ['Burgers', 'Pizza', 'Meals', 'Drinks'];

export const CATEGORY_FILTERS = ['All', ...MENU_CATEGORIES] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

// Staff tick these when adding food. To offer another option, add it to the list.
export const ALLERGENS = ['Gluten', 'Dairy', 'Eggs', 'Peanuts', 'Tree nuts', 'Soy', 'Fish', 'Shellfish', 'Sesame'];
export const DIETARY_LABELS = ['Vegetarian', 'Vegan', 'Halal'];

// No payment is taken on the website. The cafeteria accepts cash only.
// To offer another method again, add it back to this list.
export const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; note: string }[] = [
  { method: 'Cash', label: 'Cash', note: 'Pay at the counter when you collect.' },
];

export const PAYMENT_METHODS: PaymentMethod[] = PAYMENT_OPTIONS.map((option) => option.method);

// Older orders may have used another method, so every method keeps a label.
export const PAYMENT_LABELS: Record<PaymentMethod, string> = { Cash: 'Cash', Card: 'Card', EFT: 'EFT', InstantEFT: 'Instant EFT' };

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
