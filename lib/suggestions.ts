import type { MenuItem } from './types.ts';

// "You may like" on the basket page. Suggests food that goes with what is
// already in the basket: categories the basket does not have yet come first
// (a burger with no drink suggests a drink), one per category for variety,
// then the rest of the menu. Only available items that are not in the basket.
export function suggestItems(menu: MenuItem[], basketIds: string[], limit = 4): MenuItem[] {
  const inBasket = new Set(basketIds);
  const basketCategories = new Set(menu.filter((item) => inBasket.has(item.id)).map((item) => item.category));
  const candidates = menu.filter((item) => item.available && !inBasket.has(item.id));

  const newCategories = candidates.filter((item) => !basketCategories.has(item.category));
  const sameCategories = candidates.filter((item) => basketCategories.has(item.category));

  const onePerCategory: MenuItem[] = [];
  for (const item of newCategories) {
    if (!onePerCategory.some((picked) => picked.category === item.category)) onePerCategory.push(item);
  }

  return [
    ...onePerCategory,
    ...newCategories.filter((item) => !onePerCategory.includes(item)),
    ...sameCategories,
  ].slice(0, limit);
}
