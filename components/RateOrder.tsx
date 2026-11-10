'use client';

import { useState, type FormEvent } from 'react';
import { rateOrder } from '@/app/actions';
import { StarIcon } from '@/components/Icons';
import { Stars, useActionRunner } from '@/components/ui';
import type { Order } from '@/lib/types';

const LABELS = ['Choose a rating', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'];

// Shown on a collected order: 1 to 5 stars and an optional comment.
// The stars are real radio buttons, so they work with a keyboard and screen readers.
export default function RateOrder({ order }: { order: Order }) {
  const saved = order.feedback;
  const [editing, setEditing] = useState(!saved);
  const [rating, setRating] = useState(saved?.rating ?? 0);
  const [comment, setComment] = useState(saved?.comment ?? '');
  const { run, pending } = useActionRunner();

  if (saved && !editing) {
    return (
      <section className="panel rating-card" aria-labelledby="rating-heading">
        <h2 id="rating-heading">Your rating</h2>
        <div className="rating-summary">
          <Stars value={saved.rating} />
          <strong>{LABELS[saved.rating]}</strong>
        </div>
        {saved.comment ? <blockquote className="rating-comment">{saved.comment}</blockquote> : null}
        <button type="button" className="text-link link-button" onClick={() => setEditing(true)}>Change my rating</button>
      </section>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(() => rateOrder(order.id, rating, comment), () => setEditing(false));
  };

  return (
    <form className="panel rating-card" onSubmit={handleSubmit} aria-labelledby="rating-heading">
      <h2 id="rating-heading">How was your order?</h2>
      <p>Your rating helps the cafeteria get better.</p>

      <fieldset className="star-input">
        <legend className="visually-hidden">Your rating, from 1 to 5 stars</legend>
        {[1, 2, 3, 4, 5].map((stars) => (
          <label key={stars} className={stars <= rating ? 'star is-on' : 'star'}>
            <input type="radio" name="rating" value={stars} checked={rating === stars} onChange={() => setRating(stars)} />
            <StarIcon />
            <span className="visually-hidden">{stars} {stars === 1 ? 'star' : 'stars'}, {LABELS[stars]}</span>
          </label>
        ))}
        <span className="star-label" aria-hidden="true">{LABELS[rating]}</span>
      </fieldset>

      <label className="field">
        <span>Tell us more (optional)</span>
        <textarea name="comment" rows={3} maxLength={500} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you enjoy, or what could be better?" />
        <small>{comment.length}/500 · Your first name and comment may be shown on the menu.</small>
      </label>

      <div className="rating-actions">
        {saved ? <button type="button" className="btn btn-secondary" onClick={() => { setRating(saved.rating); setComment(saved.comment); setEditing(false); }}>Cancel</button> : null}
        <button type="submit" className="btn btn-primary" disabled={pending || rating === 0}>
          {pending ? 'Sending…' : saved ? 'Update rating' : 'Send feedback'}
        </button>
      </div>
    </form>
  );
}
