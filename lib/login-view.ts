// Remembers which login page someone used, so a staff member can also use the
// site as a student. It is safe to keep in the browser because it can only
// lower access: the admin role always comes from the database.

export const LOGIN_VIEW_COOKIE = 'cafe-connect-view';

export function rememberLoginView(view: 'student' | 'admin') {
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${LOGIN_VIEW_COOKIE}=${view}; path=/; samesite=lax${secure}`;
}
