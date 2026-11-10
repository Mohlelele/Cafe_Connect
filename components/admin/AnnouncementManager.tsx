'use client';

import { useState, type FormEvent } from 'react';
import { deleteAnnouncement, saveAnnouncement } from '@/app/actions';
import { MegaphoneIcon } from '@/components/Icons';
import { ConfirmButton, EmptyState, useActionRunner } from '@/components/ui';
import type { Announcement } from '@/lib/types';

const emptyForm = { id: null as string | null, title: '', body: '' };

export default function AnnouncementManager({ announcements }: { announcements: Announcement[] }) {
  const { run, pending } = useActionRunner();
  const [form, setForm] = useState(emptyForm);
  const isEditing = form.id !== null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(() => saveAnnouncement(form.id, form.title, form.body), () => setForm(emptyForm));
  };

  return (
    <div className="split-layout">
      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet" icon={<MegaphoneIcon />}><p>Published announcements appear on the student menu.</p></EmptyState>
      ) : (
        <ul className="panel manage-list">
          {announcements.map((item) => (
            <li className="announcement-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-quiet btn-sm" aria-label={`Edit ${item.title}`} onClick={() => setForm({ id: item.id, title: item.title, body: item.body })}>Edit</button>
                <ConfirmButton
                  label="Remove"
                  ariaLabel={`Remove ${item.title}`}
                  title="Remove this announcement?"
                  body={`"${item.title}" will no longer be shown to students.`}
                  confirmLabel="Remove"
                  disabled={pending}
                  onConfirm={() => run(() => deleteAnnouncement(item.id), () => {
                    if (form.id === item.id) setForm(emptyForm);
                  })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="panel form side-form" onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Edit announcement' : 'Publish an announcement'}</h2>
        <label className="field">
          <span>Title</span>
          <input type="text" name="title" maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea name="body" rows={4} maxLength={1000} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} required />
        </label>
        <div className="form-actions">
          {isEditing ? <button type="button" className="btn btn-secondary" onClick={() => setForm(emptyForm)}>Cancel</button> : null}
          <button type="submit" className="btn btn-primary" disabled={pending}>{isEditing ? 'Save changes' : 'Publish'}</button>
        </div>
      </form>
    </div>
  );
}
