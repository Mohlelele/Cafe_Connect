'use client';

// Replaces the root layout when the layout itself fails, so it cannot rely on
// the app's stylesheet or providers.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '20vh 1rem', color: '#14232f' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Cafe Connect is temporarily unavailable</h1>
        <p>Please try again in a moment.</p>
        <button type="button" onClick={reset} style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', cursor: 'pointer' }}>Try again</button>
      </body>
    </html>
  );
}
