// Server actions can be called with anything, whatever TypeScript says, so
// each value from the browser is checked with these before it is used.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

export const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const isOneOf = <T extends string>(value: unknown, allowed: readonly T[]): value is T => (
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
);

export const isValidEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password: unknown): password is string => (
  typeof password === 'string' && password.length >= 8 && new TextEncoder().encode(password).length <= 72
);

export const isValidImageUrl = (url: string) => /^https?:\/\/\S+$/i.test(url);

export function parsePrice(value: unknown): number | null {
  const price = typeof value === 'string' && value.trim() ? Number(value) : NaN;
  if (!Number.isFinite(price) || price <= 0 || price > 100000) return null;
  return Math.round(price * 100) / 100;
}

export const toCents = (amount: number) => Math.round(amount * 100);
