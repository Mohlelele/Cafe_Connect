'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AddToBasket from '@/components/AddToBasket';
import { BellIcon, SearchIcon } from '@/components/Icons';
import { EmptyState, MenuImage } from '@/components/ui';
import { CATEGORY_FILTERS, formatRand, type CategoryFilter } from '@/lib/menu';
import type { Announcement, MenuItem } from '@/lib/types';

export default function MenuBrowser({ items, announcement }: { items: MenuItem[]; announcement: Announcement | null }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleItems = useMemo(() => items.filter((item) => item.available), [items]);

  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return visibleItems
      .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
      .filter((item) => !keyword || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(keyword));
  }, [visibleItems, selectedCategory, searchTerm]);

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
          {filteredItems.map((item) => (
            <article className="food-card" key={item.id}>
              <Link href={`/menu/${item.id}`} className="food-card-link" aria-label={`View details of ${item.name}`}>
                <MenuImage item={item} alt="" className="food-card-image" />
              </Link>
              <div className="food-card-body">
                <h2><Link href={`/menu/${item.id}`}>{item.name}</Link></h2>
                <p>{item.description}</p>
                <div className="food-card-footer">
                  <strong>{formatRand(item.price)}</strong>
                  <AddToBasket item={item} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
