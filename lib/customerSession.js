import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_NAME = 'teakle_customer_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return new TextEncoder().encode(SESSION_SECRET);
}

async function isSecureConnection() {
  if (process.env.NODE_ENV !== 'production') return false;
  if (process.env.ALLOW_INSECURE_SESSION === 'true') return false;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const proto = h.get('x-forwarded-proto');
    if (proto) return proto === 'https';
  } catch {}
  return false;
}

export async function createCustomerSession(customer) {
  const token = await new SignJWT({
    customerId: customer.id,
    email: customer.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: await isSecureConnection(),
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      customerId: payload.customerId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function deleteCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, '', {
    httpOnly: true,
    secure: await isSecureConnection(),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function requireCustomer(handler) {
  return async function (req, ctx) {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return handler(req, ctx, session);
  };
}
