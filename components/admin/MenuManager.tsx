'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { addMenuItem, removeMenuItem, setMenuAvailability, updateMenuPrice } from '@/app/actions';
import { ConfirmButton, EmptyState, MenuImage, useActionRunner } from '@/components/ui';
import { MENU_CATEGORIES } from '@/lib/menu';
import type { MenuCategory, MenuItem } from '@/lib/types';

const emptyItem = { name: '', description: '', price: '', imageUrl: '', category: 'Meals' as MenuCategory };

function MenuRow({ item }: { item: MenuItem }) {
  const { run, pending } = useActionRunner();
  const [price, setPrice] = useState(item.price.toFixed(2));
  const isDirty = Number(price) !== item.price;

  const savePrice = (event: FormEvent) => {
    event.preventDefault();
    if (isDirty) run(() => updateMenuPrice(item.id, price));
  };

  return (
    <li className="manage-row">
      <MenuImage item={item} alt="" className="manage-image" />
      <div className="manage-copy">
        <strong>{item.name}</strong>
        <span>{item.category}</span>
      </div>

      <form className="price-editor" onSubmit={savePrice}>
        <span aria-hidden="true">R</span>
        <input type="number" min="0.01" max="100000" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} aria-label={`Price of ${item.name}`} />
        <button type="submit" className="btn btn-secondary btn-sm" disabled={!isDirty || pending}>Save</button>
      </form>

      <label className="switch">
        <input type="checkbox" checked={item.available} disabled={pending} onChange={(event) => run(() => setMenuAvailability(item.id, event.target.checked))} />
        <span className="switch-track" aria-hidden="true" />
        <span>{item.available ? 'On menu' : 'Hidden'}</span>
      </label>

      <ConfirmButton
        label="Remove"
        title={`Remove ${item.name}?`}
        body="It will disappear from the menu. Past orders keep their details. To take it off temporarily, hide it instead."
        confirmLabel="Remove item"
        disabled={pending}
        onConfirm={() => run(() => removeMenuItem(item.id))}
      />
    </li>
  );
}

export default function MenuManager({ menu }: { menu: MenuItem[] }) {
  const { run, pending } = useActionRunner();
  const [form, setForm] = useState(emptyItem);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(() => addMenuItem(form), () => setForm(emptyItem));
  };

  return (
    <div className="split-layout">
      {menu.length === 0 ? (
        <EmptyState title="No menu items yet"><p>Add your first item using the form.</p></EmptyState>
      ) : (
        <ul className="panel manage-list">
          {/* Keyed on price so the editor resets when the saved price changes. */}
          {menu.map((item) => <MenuRow key={`${item.id}-${item.price}`} item={item} />)}
        </ul>
      )}

      <form className="panel form side-form" onSubmit={handleSubmit}>
        <h2>Add a menu item</h2>
        <label className="field">
          <span>Name</span>
          <input type="text" name="name" maxLength={100} value={form.name} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea name="description" rows={3} maxLength={500} value={form.description} onChange={handleChange} required />
        </label>
        <div className="field-pair">
          <label className="field">
            <span>Price (R)</span>
            <input type="number" name="price" min="0.01" max="100000" step="0.01" value={form.price} onChange={handleChange} required />
          </label>
          <label className="field">
            <span>Category</span>
            <select name="category" value={form.category} onChange={handleChange}>
              {MENU_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Image URL</span>
          <input type="url" name="imageUrl" placeholder="Optional" value={form.imageUrl} onChange={handleChange} />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>Add item</button>
      </form>
    </div>
  );
}
