/**
 * CSRF Protection — Double Submit Cookie Pattern
 *
 * Server generates a random token, sets it as a cookie, and validates it
 * against a custom request header on state-changing requests.
 *
 * SameSite=Lax prevents CSRF on most cross-origin POSTs, but not on
 * same-origin form submissions. This adds header-based verification.
 */
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE = 'teakle_csrf';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_MAX_AGE = 60 * 60; // 1 hour

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get or create a CSRF token.
 * Returns the token to set in a cookie and include in responses.
 */
export async function getCsrfToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  if (existing && existing.length === 64) return existing;
  return generateToken();
}

/**
 * Set the CSRF cookie on the response.
 */
export async function setCsrfCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_MAX_AGE,
    path: '/',
  });
}

/**
 * Validate CSRF from a request object.
 * @param {Request} request
 */
export async function validateCsrfRequest(request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;

  if (!cookieToken) {
    return {
      valid: false,
      response: new Response(JSON.stringify({ error: 'CSRF token missing' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  const headerToken = request.headers.get(CSRF_HEADER);

  if (!headerToken || headerToken !== cookieToken) {
    return {
      valid: false,
      response: new Response(JSON.stringify({ error: 'CSRF validation failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { valid: true };
}

/**
 * Higher-order wrapper: adds CSRF validation to a route handler.
 * Only validates on non-GET/HEAD/OPTIONS requests.
 */
export function withCsrf(handler) {
  return async function (req, ctx) {
    const method = req.method?.toUpperCase();
    if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const csrf = await validateCsrfRequest(req);
      if (!csrf.valid) return csrf.response;
    }
    return handler(req, ctx);
  };
}
