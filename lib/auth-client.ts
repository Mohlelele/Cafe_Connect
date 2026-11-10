import { rememberLoginView } from '@/lib/login-view';
import { createClient } from '@/lib/supabase/client';

export async function logOut() {
  await createClient().auth.signOut();
  window.location.assign('/');
}

// For staff accounts: move between the staff and student sides of the site.
export function switchView(view: 'student' | 'admin') {
  rememberLoginView(view);
  window.location.assign(view === 'admin' ? '/admin' : '/menu');
}
