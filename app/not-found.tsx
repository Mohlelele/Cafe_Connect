import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page page-narrow">
      <div className="empty-state">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link href="/" className="btn btn-primary">Go home</Link>
      </div>
    </main>
  );
}
