'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { addMenuItem, removeMenuItem, setMenuAvailability, updateMenuItem } from '@/app/actions';
import { UtensilsIcon } from '@/components/Icons';
import { ConfirmButton, EmptyState, MenuImage, useActionRunner } from '@/components/ui';
import { formatRand, MENU_CATEGORIES } from '@/lib/menu';
import type { MenuCategory, MenuItem } from '@/lib/types';

type ItemForm = { name: string; description: string; price: string; imageUrl: string; category: MenuCategory };

const emptyItem: ItemForm = { name: '', description: '', price: '', imageUrl: '', category: 'Meals' };

// The fields shared by the "add" form and the "edit" dialog.
function ItemFields({ form, setForm }: { form: ItemForm; setForm: (update: (current: ItemForm) => ItemForm) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <>
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
          <input type="number" name="price" min="0.01" max="100000" step="0.01" inputMode="decimal" value={form.price} onChange={handleChange} required />
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
        <input type="url" name="imageUrl" placeholder="https://…" value={form.imageUrl} onChange={handleChange} />
        <small>Optional. Students see a category icon if there is no photo.</small>
      </label>
      <MenuImage key={form.imageUrl} item={{ imageUrl: /^https?:\/\/\S+$/i.test(form.imageUrl.trim()) ? form.imageUrl.trim() : '', category: form.category }} alt="Preview of the item's photo" className="image-preview" sizes="420px" />
    </>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  const { run, pending } = useActionRunner();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<ItemForm>(emptyItem);

  const openEditor = () => {
    setForm({ name: item.name, description: item.description, price: item.price.toFixed(2), imageUrl: item.imageUrl, category: item.category });
    dialogRef.current?.showModal();
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    run(() => updateMenuItem(item.id, form), () => dialogRef.current?.close());
  };

  return (
    <li className="manage-row">
      <MenuImage item={item} alt="" className="manage-image" sizes="52px" />
      <div className="manage-copy">
        <strong>{item.name}</strong>
        <span>{item.category}</span>
      </div>
      <span className="manage-price">{formatRand(item.price)}</span>

      <label className="switch">
        <input type="checkbox" checked={item.available} disabled={pending} onChange={(event) => run(() => setMenuAvailability(item.id, event.target.checked))} aria-label={`${item.name} is available`} />
        <span className="switch-track" aria-hidden="true" />
        <span>{item.available ? 'Available' : 'Unavailable'}</span>
      </label>

      <div className="row-actions-compact">
        <button type="button" className="btn btn-quiet btn-sm" aria-label={`Edit ${item.name}`} onClick={openEditor}>Edit</button>
        <ConfirmButton
          label="Remove"
          ariaLabel={`Remove ${item.name}`}
          title={`Remove ${item.name}?`}
          body="It will disappear from the menu. Past orders keep their details. To take it off temporarily, mark it unavailable instead."
          confirmLabel="Remove item"
          disabled={pending}
          onConfirm={() => run(() => removeMenuItem(item.id))}
        />
      </div>

      <dialog ref={dialogRef} className="dialog">
        <h2>Edit {item.name}</h2>
        <form className="dialog-form" onSubmit={handleSave}>
          <ItemFields form={form} setForm={setForm} />
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </dialog>
    </li>
  );
}

export default function MenuManager({ menu }: { menu: MenuItem[] }) {
  const { run, pending } = useActionRunner();
  const [form, setForm] = useState(emptyItem);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(() => addMenuItem(form), () => setForm(emptyItem));
  };

  return (
    <div className="split-layout">
      {menu.length === 0 ? (
        <EmptyState title="No menu items yet" icon={<UtensilsIcon />}><p>Add your first item using the form.</p></EmptyState>
      ) : (
        <ul className="panel manage-list">
          {menu.map((item) => <MenuRow key={item.id} item={item} />)}
        </ul>
      )}

      <form className="panel form side-form" onSubmit={handleSubmit}>
        <h2>Add a menu item</h2>
        <ItemFields form={form} setForm={setForm} />
        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>Add item</button>
      </form>
    </div>
  );
}
