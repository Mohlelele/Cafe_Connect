// Works out what an order costs. Names and prices always come from the menu,
// never from the browser, so nobody can change a price by editing the request.

export const MAX_ITEM_QUANTITY = 20;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STALE_BASKET = 'An item in your basket is no longer available. Please update your basket and try again.';

// A problem the student can fix, so its message is safe to show them.
export class BasketError extends Error {}

type MenuEntry = { id: string; name: string; price: number; available: boolean };

// Checks the basket and returns how many of each item was asked for.
export function parseBasket(items: unknown): Map<string, number> {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new BasketError('Order must contain at least one item.');
  }

  const quantities = new Map<string, number>();
  for (const { id, quantity } of items) {
    if (typeof id !== 'string' || !UUID.test(id)) throw new BasketError(STALE_BASKET);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BasketError('Each item needs a whole-number quantity of at least 1.');
    }
    const key = id.toLowerCase();
    quantities.set(key, (quantities.get(key) ?? 0) + quantity);
  }
  return quantities;
}

// Builds the order lines and total using the prices on the menu.
export function priceBasket(quantities: Map<string, number>, menuItems: MenuEntry[]) {
  const lines = [];
  let totalCents = 0; // Adding whole cents avoids decimal rounding errors.

  for (const [id, quantity] of quantities) {
    const item = menuItems.find((candidate) => candidate.id.toLowerCase() === id);
    if (!item) throw new BasketError(STALE_BASKET);
    if (!item.available) throw new BasketError(`${item.name} is no longer available. Please update your basket and try again.`);
    if (quantity > MAX_ITEM_QUANTITY) throw new BasketError(`You can order up to ${MAX_ITEM_QUANTITY} of ${item.name} at a time.`);

    totalCents += Math.round(item.price * 100) * quantity;
    lines.push({ menuItemId: item.id, name: item.name, quantity, unitPrice: item.price });
  }

  return { lines, total: totalCents / 100 };
}
