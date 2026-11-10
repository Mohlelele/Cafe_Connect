'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { addMenuItem, removeMenuItem, setMenuAvailability, updateMenuItem, uploadMenuPhoto } from '@/app/actions';
import { EditIcon, PlusIcon, UploadIcon, UtensilsIcon } from '@/components/Icons';
import { useToast } from '@/components/Providers';
import { ConfirmButton, EmptyState, MenuImage, useActionRunner } from '@/components/ui';
import { ALLERGENS, DIETARY_LABELS, formatRand, MENU_CATEGORIES } from '@/lib/menu';
import type { MenuCategory, MenuItem } from '@/lib/types';

type ItemForm = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: MenuCategory;
  ingredients: string; // One per line while typing. The server turns it into a list.
  allergens: string[];
  dietary: string[];
};

type SetForm = (update: (current: ItemForm) => ItemForm) => void;

const emptyItem: ItemForm = { name: '', description: '', price: '', imageUrl: '', category: 'Meals', ingredients: '', allergens: [], dietary: [] };

const toForm = (item: MenuItem): ItemForm => ({
  name: item.name,
  description: item.description,
  price: item.price.toFixed(2),
  imageUrl: item.imageUrl,
  category: item.category,
  ingredients: item.ingredients.join('\n'),
  allergens: item.allergens,
  dietary: item.dietary,
});

// Phone photos can be 5 MB or more. This shrinks them to 1200px wide JPEGs
// (usually under 300 KB) before uploading, so menu pages stay fast.
async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read photo'))), 'image/jpeg', 0.85);
  });
}

function PhotoField({ form, setForm, uploading, setUploading }: { form: ItemForm; setForm: SetForm; uploading: boolean; setUploading: (value: boolean) => void }) {
  const showToast = useToast();
  const previewUrl = /^https?:\/\/\S+$/i.test(form.imageUrl.trim()) ? form.imageUrl.trim() : '';

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Lets staff pick the same file again.
    if (!file) return;

    setUploading(true);
    try {
      const upload = new FormData();
      upload.append('photo', await shrinkPhoto(file), 'photo.jpg');
      const result = await uploadMenuPhoto(upload);
      showToast(result.message, result.ok ? 'success' : 'error');
      if (result.url) setForm((current) => ({ ...current, imageUrl: result.url! }));
    } catch {
      showToast('That photo could not be uploaded. Please try a JPG, PNG or WebP photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="field">
      <span>Photo</span>
      <MenuImage key={previewUrl} item={{ imageUrl: previewUrl, category: form.category }} alt="Preview of the item's photo" className="image-preview" sizes="600px" />
      <div className="photo-actions">
        <label className={uploading ? 'btn btn-secondary btn-sm file-button is-busy' : 'btn btn-secondary btn-sm file-button'}>
          <UploadIcon /> {uploading ? 'Uploading…' : previewUrl ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} />
        </label>
        {previewUrl ? (
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setForm((current) => ({ ...current, imageUrl: '' }))}>Remove photo</button>
        ) : null}
      </div>
      <details className="link-option">
        <summary>Or paste an image link</summary>
        <input type="url" name="imageUrl" placeholder="https://…" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} aria-label="Image link" />
      </details>
      <small>Optional. Without a photo, students see the category icon.</small>
    </div>
  );
}

// A group of tick-boxes, such as the allergens.
function TickBoxes({ legend, hint, options, selected, onChange }: { legend: string; hint: string; options: string[]; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <fieldset className="tick-group">
      <legend>{legend}</legend>
      <small>{hint}</small>
      <div className="tick-options">
        {options.map((option) => (
          <label className="tick" key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((value) => value !== option))}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ItemFields({ form, setForm, uploading, setUploading }: { form: ItemForm; setForm: SetForm; uploading: boolean; setUploading: (value: boolean) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <>
      <PhotoField form={form} setForm={setForm} uploading={uploading} setUploading={setUploading} />
      <label className="field">
        <span>Name</span>
        <input type="text" name="name" maxLength={100} value={form.name} onChange={handleChange} placeholder="e.g. Classic beef burger" required />
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
        <span>Description</span>
        <textarea name="description" rows={2} maxLength={500} value={form.description} onChange={handleChange} placeholder="A short line that makes students want it" required />
      </label>
      <label className="field">
        <span>Ingredients</span>
        <textarea name="ingredients" rows={4} value={form.ingredients} onChange={handleChange} placeholder={'Beef patty\nCheddar cheese\nLettuce'} />
        <small>One per line, or separated by commas. Optional.</small>
      </label>
      <TickBoxes
        legend="Allergens"
        hint="Tick everything this item contains."
        options={ALLERGENS}
        selected={form.allergens}
        onChange={(allergens) => setForm((current) => ({ ...current, allergens }))}
      />
      <TickBoxes
        legend="Dietary labels"
        hint="Only tick what you are sure of."
        options={DIETARY_LABELS}
        selected={form.dietary}
        onChange={(dietary) => setForm((current) => ({ ...current, dietary }))}
      />
    </>
  );
}

// The button and pop-up form used both to add a new item and to edit one.
function ItemDialog({ item }: { item?: MenuItem }) {
  const { run, pending } = useActionRunner();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<ItemForm>(emptyItem);
  const [uploading, setUploading] = useState(false);

  const open = () => {
    setForm(item ? toForm(item) : emptyItem);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    run(() => (item ? updateMenuItem(item.id, form) : addMenuItem(form)), close);
  };

  return (
    <>
      {item ? (
        <button type="button" className="btn btn-quiet btn-sm" aria-label={`Edit ${item.name}`} onClick={open}><EditIcon /> Edit</button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={open}><PlusIcon /> Add menu item</button>
      )}

      <dialog ref={dialogRef} className="dialog dialog-wide">
        <h2>{item ? `Edit ${item.name}` : 'Add a menu item'}</h2>
        <form className="dialog-form" onSubmit={handleSave}>
          <ItemFields form={form} setForm={setForm} uploading={uploading} setUploading={setUploading} />
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={pending || uploading}>
              {pending ? 'Saving…' : item ? 'Save changes' : 'Add item'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

// Used in the page header.
export function AddMenuItemButton() {
  return <ItemDialog />;
}

function MenuRow({ item }: { item: MenuItem }) {
  const { run, pending } = useActionRunner();
  const details = item.ingredients.length ? `${item.ingredients.length} ingredients` : 'No ingredients listed';

  return (
    <li className="manage-row">
      <MenuImage item={item} alt="" className="manage-image" sizes="52px" />
      <div className="manage-copy">
        <strong>{item.name}</strong>
        <span>{item.category} · {details}</span>
      </div>
      <span className="manage-price">{formatRand(item.price)}</span>

      <label className="switch">
        <input type="checkbox" checked={item.available} disabled={pending} onChange={(event) => run(() => setMenuAvailability(item.id, event.target.checked))} aria-label={`${item.name} is available`} />
        <span className="switch-track" aria-hidden="true" />
        <span>{item.available ? 'Available' : 'Unavailable'}</span>
      </label>

      <div className="row-actions-compact">
        <ItemDialog item={item} />
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
    </li>
  );
}

export default function MenuManager({ menu }: { menu: MenuItem[] }) {
  if (menu.length === 0) {
    return (
      <EmptyState title="No menu items yet" icon={<UtensilsIcon />}>
        <p>Add your first item to start taking orders.</p>
        <AddMenuItemButton />
      </EmptyState>
    );
  }

  return (
    <ul className="panel manage-list">
      {menu.map((item) => <MenuRow key={item.id} item={item} />)}
    </ul>
  );
}
