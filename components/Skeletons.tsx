const Block = ({ className }: { className: string }) => <div className={`skeleton ${className}`} />;

export function GridSkeleton() {
  return (
    <main className="page" role="status" aria-label="Loading">
      <Block className="skeleton-title" />
      <div className="skeleton-grid">
        {Array.from({ length: 8 }, (_, index) => <Block key={index} className="skeleton-card" />)}
      </div>
    </main>
  );
}

export function ListSkeleton() {
  return (
    <main className="page page-narrow" role="status" aria-label="Loading">
      <Block className="skeleton-title" />
      {Array.from({ length: 4 }, (_, index) => <Block key={index} className="skeleton-row" />)}
    </main>
  );
}
