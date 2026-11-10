'use client';

import { WarningIcon } from '@/components/Icons';
import { EmptyState } from '@/components/ui';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page page-narrow">
      <EmptyState title="Something went wrong" icon={<WarningIcon />}>
        <p>We could not load this page. Check your connection and try again.</p>
        <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
      </EmptyState>
    </main>
  );
}
