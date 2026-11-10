// The Supabase browser library is large (about 67 KB compressed, 254 KB of
// JavaScript). Most pages only need it when someone logs in, logs out or a page
// shows live updates. Loading it on demand keeps it out of every page's first
// download, which matters most on phones and slow connections.

const importClient = () => import('@/lib/supabase/client');

export async function loadSupabase() {
  const { createClient } = await importClient();
  return createClient();
}

// Starts the download early (for example on the login page) so it is ready by
// the time the form is submitted.
export function preloadSupabase() {
  void importClient();
}
