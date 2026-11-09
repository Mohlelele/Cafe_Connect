'use client';

import { useState, type FormEvent } from 'react';
import { deleteAnnouncement, saveAnnouncement } from '@/app/actions';
import { ConfirmButton, EmptyState, useActionRunner } from '@/components/ui';
import type { Announcement } from '@/lib/types';

const emptyForm = { title: '', body: '' };

export default function AnnouncementManager({ announcements }: { announcements: Announcement[] }) {
  const { run, pending } = useActionRunner();
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(() => saveAnnouncement(form.title, form.body), () => setForm(emptyForm));
  };

  return (
    <div className="split-layout">
      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet"><p>Published announcements appear on the student menu.</p></EmptyState>
      ) : (
        <ul className="panel manage-list">
          {announcements.map((item) => (
            <li className="announcement-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setForm({ title: item.title, body: item.body })}>Edit</button>
                <ConfirmButton
                  label="Remove"
                  title="Remove this announcement?"
                  body={`"${item.title}" will no longer be shown to students.`}
                  confirmLabel="Remove"
                  disabled={pending}
                  onConfirm={() => run(() => deleteAnnouncement(item.id))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="panel form side-form" onSubmit={handleSubmit}>
        <h2>Publish an announcement</h2>
        <label className="field">
          <span>Title</span>
          <input type="text" maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <small>Using an existing title replaces that announcement.</small>
        </label>
        <label className="field">
          <span>Message</span>
          <textarea rows={4} maxLength={1000} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} required />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>Publish</button>
      </form>
    </div>
  );
}
