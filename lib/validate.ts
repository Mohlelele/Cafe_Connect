// Server actions can be called with anything, whatever TypeScript says, so
// each value from the browser is checked with these before it is used.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

export const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const isOneOf = <T extends string>(value: unknown, allowed: readonly T[]): value is T => (
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
);

export const isValidEmail = (email: string) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Passwords people pick most often. Anyone guessing passwords tries these first.
const COMMON_PASSWORDS = new Set([
  'password1', 'password12', 'password123', 'passw0rd', 'pa55word', 'qwerty123', 'qwerty12', 'qwertyuiop1',
  'abc12345', 'abcd1234', 'abc123456', '1q2w3e4r', '1qaz2wsx', 'iloveyou1', 'letmein1', 'welcome1',
  'welcome123', 'admin123', 'admin1234', 'monkey123', 'football1', 'dragon123', 'sunshine1', 'student1',
  'student123', 'test1234', 'changeme1', 'secret123', 'p@ssw0rd', 'trustno1',
]);
// Words that belong to this site: a password containing them is easy to guess.
const SITE_WORDS = ['cafeconnect', 'cafe', 'richfield', 'polokwane'];
export const PASSWORD_HINT = 'At least 8 characters, using letters and numbers. Avoid common passwords.';

// Returns what is wrong with a password, or null if it is acceptable.
// Used by every form that sets a password, and again by the server.
export function passwordProblem(password: unknown, email = ''): string | null {
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters long.';
  if (new TextEncoder().encode(password).length > 72) return 'Password must be at most 72 characters long.';
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return 'Use both letters and numbers in your password.';

  const lower = password.toLowerCase();
  const lettersOnly = lower.replace(/[^a-z]/g, '');
  const tooEasy = COMMON_PASSWORDS.has(lower)
    || /^(.)\1+$/.test(lower.replace(/\d/g, '')) // e.g. "aaaa1111"
    || SITE_WORDS.some((word) => lower.includes(word))
    || ['password', 'qwerty', 'abcdef', 'letmein', 'welcome', 'admin'].includes(lettersOnly);
  if (tooEasy) return 'That password is too easy to guess. Please choose a different one.';

  const emailName = email.split('@')[0].toLowerCase();
  if (emailName.length >= 4 && lower.includes(emailName)) return 'Your password must not contain your email address.';
  return null;
}

export const isValidPassword = (password: unknown): password is string => passwordProblem(password) === null;

export type PasswordStrength = { level: 'weak' | 'fair' | 'strong'; label: string; tip: string };

// For the strength meter under password fields. Weak passwords are refused;
// fair ones are allowed; strong ones are long and mix different kinds of characters.
export function passwordStrength(password: string, email = ''): PasswordStrength {
  const problem = passwordProblem(password, email);
  if (problem) return { level: 'weak', label: 'Weak', tip: problem };

  let points = 0;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/[^a-z0-9]/i.test(password)) points += 1;

  if (points >= 2) return { level: 'strong', label: 'Strong', tip: 'Great password.' };
  return { level: 'fair', label: 'Fair', tip: 'Good enough. Make it longer, or add a capital letter or a symbol, to make it stronger.' };
}

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

// A star rating must be a whole number from 1 to 5.
export const parseRating = (value: unknown): number | null => (
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5 ? value : null
);

export const toCents = (amount: number) => Math.round(amount * 100);
