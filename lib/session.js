import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { isSecureConnection } from './secureConnection';

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET;
const SESSION_NAME = 'teakle_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours
const CSRF_COOKIE = 'teakle_csrf';
const CSRF_MAX_AGE = 60 * 60; // 1 hour

function getSecretKey() {
  const secret = ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET (or SESSION_SECRET) environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(admin) {
  const token = await new SignJWT({
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
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

  const csrfToken = crypto.randomBytes(32).toString('hex');
  cookieStore.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: await isSecureConnection(),
    sameSite: 'lax',
    maxAge: CSRF_MAX_AGE,
    path: '/',
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      adminId: payload.adminId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, '', {
    httpOnly: true,
    secure: await isSecureConnection(),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  cookieStore.set(CSRF_COOKIE, '', {
    httpOnly: false,
    secure: await isSecureConnection(),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
