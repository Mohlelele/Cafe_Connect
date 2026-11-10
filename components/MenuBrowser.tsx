'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AddToBasket from '@/components/AddToBasket';
import { AllIcon, BellIcon, CATEGORY_ICONS, SearchIcon, UtensilsIcon } from '@/components/Icons';
import { EmptyState, MenuImage } from '@/components/ui';
import { CATEGORY_FILTERS, formatRand, type CategoryFilter } from '@/lib/menu';
import type { Announcement, MenuItem } from '@/lib/types';

const CARD_SIZES = '(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 25vw';

export default function MenuBrowser({ items, announcement, initialCategory }: { items: MenuItem[]; announcement: Announcement | null; initialCategory: CategoryFilter }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');

  // Available items come first, so unavailable ones never push food people can order down the page.
  const filteredItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return items
      .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
      .filter((item) => !keyword || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(keyword))
      .sort((a, b) => Number(b.available) - Number(a.available));
  }, [items, selectedCategory, searchTerm]);

  const countFor = (category: CategoryFilter) => (
    category === 'All' ? items.length : items.filter((item) => item.category === category).length
  );

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
  };

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
          {CATEGORY_FILTERS.map((category) => {
            const Icon = category === 'All' ? AllIcon : CATEGORY_ICONS[category];
            return (
              <button type="button" key={category} className="chip" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
                <Icon /> {category} <span className="chip-count">{countFor(category)}</span>
              </button>
            );
          })}
        </div>
        <label className="search-field">
          <SearchIcon />
          <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search the menu" aria-label="Search the menu" />
        </label>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState title={items.length ? 'Nothing matches your search' : 'The menu is being updated'} icon={items.length ? <SearchIcon /> : <UtensilsIcon />}>
          {items.length ? (
            <>
              <p>{searchTerm.trim() ? `We couldn't find "${searchTerm.trim()}" in ${selectedCategory === 'All' ? 'the menu' : selectedCategory}.` : 'There are no items in this category yet.'}</p>
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>Show the full menu</button>
            </>
          ) : <p>Please check back shortly.</p>}
        </EmptyState>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item, index) => (
            <article className={item.available ? 'food-card' : 'food-card is-unavailable'} key={item.id}>
              <Link href={`/menu/${item.id}`} className="food-card-link" aria-label={`View details of ${item.name}`}>
                <MenuImage item={item} alt="" className="food-card-image" sizes={CARD_SIZES} priority={index < 4} />
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
