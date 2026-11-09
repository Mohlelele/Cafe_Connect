'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type LiveTable = 'orders' | 'menu_items' | 'announcements';

// Re-fetches the current page when the data behind it changes, so staff and
// students see updates without reloading. The timer is a safety net.
export default function LiveUpdates({ tables }: { tables: LiveTable[] }) {
  const router = useRouter();
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
    channel.subscribe();

    const intervalId = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, 30000);

    return () => {
      window.clearTimeout(debounceId);
      window.clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [tableKey, router]);

  return null;
}
