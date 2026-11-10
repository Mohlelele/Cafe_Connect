import assert from 'node:assert/strict';
import { test } from 'node:test';
import { suggestItems } from './suggestions.ts';
import type { MenuItem } from './types.ts';

const item = (id: string, category: MenuItem['category'], available = true): MenuItem => ({
  id, name: id, description: '', price: 10, available, imageUrl: '', category, ingredients: [], allergens: [], dietary: [],
});

const menu = [
  item('beef-burger', 'Burgers'), item('chicken-burger', 'Burgers'),
  item('pizza', 'Pizza'),
  item('curry', 'Meals'), item('pie', 'Meals', false),
  item('latte', 'Drinks'), item('juice', 'Drinks'),
];

test('suggests other kinds of food before more of the same', () => {
  const ids = suggestItems(menu, ['beef-burger']).map((i) => i.id);
  assert.deepEqual(ids, ['pizza', 'curry', 'latte', 'juice']);
});

test('never suggests what is already in the basket or unavailable', () => {
  const ids = suggestItems(menu, ['curry', 'latte'], 10).map((i) => i.id);
  assert.ok(!ids.includes('curry') && !ids.includes('latte') && !ids.includes('pie'));
});

test('an empty basket gets one item from each category', () => {
  const categories = suggestItems(menu, []).map((i) => i.category);
  assert.deepEqual(categories, ['Burgers', 'Pizza', 'Meals', 'Drinks']);
});

test('nothing to suggest when everything is already in the basket', () => {
  assert.deepEqual(suggestItems([item('only', 'Drinks')], ['only']), []);
});
