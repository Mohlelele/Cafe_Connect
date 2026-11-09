'use client';

import { useMemo, useState } from 'react';
import { BellIcon, MinusIcon, PlusIcon, SearchIcon } from '@/components/Icons';
import { useCart } from '@/components/Providers';
import { EmptyState, MenuImage } from '@/components/ui';
import { CATEGORY_FILTERS, formatRand, type CategoryFilter } from '@/lib/menu';
import type { Announcement, MenuItem } from '@/lib/types';

export default function MenuBrowser({ items, announcement }: { items: MenuItem[]; announcement: Announcement | null }) {
  const { cart, addToCart, updateCartItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleItems = useMemo(() => items.filter((item) => item.available), [items]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return visibleItems
      .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
      .filter((item) => !keyword || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(keyword));
  }, [visibleItems, selectedCategory, searchTerm]);

  const quantities = useMemo(() => new Map(cart.map((entry) => [entry.id, entry.quantity])), [cart]);

  const countFor = (category: CategoryFilter) => (
    category === 'All' ? visibleItems.length : visibleItems.filter((item) => item.category === category).length
  );

  return (
    <>
      {announcement ? (
        <aside className="notice">
          <BellIcon />
          <div>
            <strong>{announcement.title}</strong>
            <p>{announcement.body}</p>
          </div>
        </aside>
      ) : null}

      <div className="menu-toolbar">
        <div className="filter-chips" role="group" aria-label="Filter by category">
          {CATEGORY_FILTERS.map((category) => (
            <button
              type="button"
              key={category}
              className="chip"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category} <span className="chip-count">{countFor(category)}</span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <SearchIcon />
          <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search the menu" aria-label="Search the menu" />
        </label>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState title={visibleItems.length ? 'Nothing matches your search' : 'The menu is being updated'}>
          <p>{visibleItems.length ? 'Try a different keyword or category.' : 'Please check back shortly.'}</p>
        </EmptyState>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => {
            const quantity = quantities.get(item.id) ?? 0;
            return (
              <article className="food-card" key={item.id}>
                <MenuImage item={item} alt="" className="food-card-image" />
                <div className="food-card-body">
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <div className="food-card-footer">
                    <strong>{formatRand(item.price)}</strong>
                    {quantity === 0 ? (
                      <button type="button" className="btn btn-primary btn-sm" aria-label={`Add ${item.name} to basket`} onClick={() => addToCart(item)}>
                        Add
                      </button>
                    ) : (
                      <div className="stepper">
                        <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => updateCartItem(item.id, -1)}><MinusIcon /></button>
                        <span aria-label={`${quantity} in basket`}>{quantity}</span>
                        <button type="button" aria-label={`Add one ${item.name}`} onClick={() => updateCartItem(item.id, 1)}><PlusIcon /></button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
