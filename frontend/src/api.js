export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiRequest(endpoint, options = {}) {
  const authToken = localStorage.getItem('cafe-connect-auth-token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(payload.message || 'Something went wrong.');
  }

  return payload;
}
