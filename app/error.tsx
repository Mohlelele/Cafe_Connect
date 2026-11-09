'use client';

import { EmptyState } from '@/components/ui';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page page-narrow">
      <EmptyState title="Something went wrong">
        <p>We could not load this page. Please try again in a moment.</p>
        <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
      </EmptyState>
    </main>
  );
}
