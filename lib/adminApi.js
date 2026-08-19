/**
 * Client-side API helper for admin-facing endpoints.
 * Sends CSRF token header on state-changing requests.
 */

function getCsrfToken() {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)teakle_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

let csrfEnsured = false;
async function ensureCsrfCookie() {
  if (csrfEnsured) return;
  if (getCsrfToken()) { csrfEnsured = true; return; }
  try {
    await fetch('/api/csrf', { method: 'GET', credentials: 'same-origin' });
    csrfEnsured = true;
  } catch {}
}

export async function adminFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrfCookie();
  }

  const headers = { ...options.headers };

  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = getCsrfToken();
    if (csrf) headers['x-csrf-token'] = csrf;
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}
