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

// Turns "Beef patty, Cheese" or one-ingredient-per-line text into a clean list.
// Returns null if the list is too long.
export function parseIngredients(value: unknown): string[] | null {
  const ingredients = [...new Set(asText(value).split(/[\n,]/).map((part) => part.trim()).filter(Boolean))];
  if (ingredients.length > 30 || ingredients.some((ingredient) => ingredient.length > 60)) return null;
  return ingredients;
}

// Keeps only the ticked values that are on the allowed list, in the list's order.
export const pickAllowed = <T extends string>(value: unknown, allowed: readonly T[]): T[] => (
  Array.isArray(value) ? allowed.filter((option) => value.includes(option)) : []
);

export const toCents =(amount: number) => Math.round(amount * 100);
