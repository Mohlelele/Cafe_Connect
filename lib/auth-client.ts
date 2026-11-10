import { rememberLoginView } from '@/lib/login-view';
import { loadSupabase } from '@/lib/supabase/lazy';

// The header is on every page, so the Supabase library is only downloaded
// when someone actually logs out (see lib/supabase/lazy.ts).
export async function logOut() {
  const supabase = await loadSupabase();
  await supabase.auth.signOut();
  window.location.assign('/');
}

// For staff accounts: move between the staff and student sides of the site.
export function switchView(view: 'student' | 'admin') {
  rememberLoginView(view);
  window.location.assign(view === 'admin' ? '/admin' : '/menu');
}
