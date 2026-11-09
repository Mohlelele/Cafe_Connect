import type { ReactNode } from 'react';

// Next.js rebuilds a template on every page change, which restarts the
// fade-in animation in globals.css.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
