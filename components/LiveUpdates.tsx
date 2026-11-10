'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type LiveTable = 'orders' | 'menu_items' | 'announcements';

const FALLBACK_REFRESH_MS = 30000;

// Re-fetches the current page when the data behind it changes, so staff and
// students see updates without reloading. If the live connection is down, the
// timer keeps the page up to date, and showStatus tells people which is happening.
export default function LiveUpdates({ tables, showStatus = false }: { tables: LiveTable[]; showStatus?: boolean }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const tableKey = tables.join(',');

  useEffect(() => {
    const supabase = createClient();
    let debounceId: number | undefined;

    const refresh = () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase.channel(`live-${tableKey}`);
    tableKey.split(',').forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh);
    });
    channel.subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    const intervalId = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, FALLBACK_REFRESH_MS);

    return () => {
      window.clearTimeout(debounceId);
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [tableKey, router]);

  if (!showStatus) return null;

  return (
    <span className={connected ? 'live-pill is-live' : 'live-pill'} role="status">
      <span className="live-dot" aria-hidden="true" />
      {connected ? 'Live' : 'Updates every 30 seconds'}
    </span>
  );
}
