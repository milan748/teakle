import { headers } from 'next/headers';

/**
 * Determine whether the current connection should be treated as secure (HTTPS)
 * for the purpose of setting the `Secure` attribute on cookies.
 *
 * Trust model:
 * - In non-production environments the connection is never considered secure,
 *   so cookies are NOT marked Secure and work over plain HTTP (local dev).
 * - ALLOW_INSECURE_SESSION=true explicitly opts out of Secure cookies even in
 *   production (documented for local HTTP testing of production builds).
 * - Otherwise the `x-forwarded-proto` request header is trusted to indicate the
 *   original protocol. This is correct behind the documented reverse proxy
 *   (Internet -> HTTPS proxy -> Node.js -> Next.js). Direct exposure without the
 *   proxy is out of scope per DEPLOYMENT.md.
 *
 * This helper is shared by lib/session.js, lib/customerSession.js and lib/csrf.js
 * so that every cookie (admin, customer, CSRF) uses the exact same Secure policy.
 */
export async function isSecureConnection() {
  if (process.env.NODE_ENV !== 'production') return false;
  if (process.env.ALLOW_INSECURE_SESSION === 'true') return false;
  try {
    const h = await headers();
    const proto = h.get('x-forwarded-proto');
    if (proto) return proto === 'https';
  } catch {}
  return false;
}
