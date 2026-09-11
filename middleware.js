import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_NAME = 'teakle_admin_session'

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Editor route header
  if (pathname.startsWith('/admin/editor')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-editor-route', '1')

    // Defense-in-depth: verify admin session on editor routes too
    const secretKey = getSecretKey()
    if (secretKey) {
      const token = request.cookies.get(SESSION_NAME)?.value
      if (token) {
        try {
          const { payload } = await jwtVerify(token, secretKey)
          requestHeaders.set('x-admin-id', String(payload.adminId))
          requestHeaders.set('x-admin-email', payload.email)
          requestHeaders.set('x-admin-role', payload.role)
        } catch {
          // Invalid token — still pass through (per-route can enforce)
        }
      }
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  // Admin API routes (except login which is public)
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    const secretKey = getSecretKey()
    if (!secretKey) {
      // No secret configured — fail closed
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const token = request.cookies.get(SESSION_NAME)?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    try {
      const { payload } = await jwtVerify(token, secretKey)
      // Pass admin info to route via headers (defense-in-depth layer)
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-admin-id', String(payload.adminId))
      requestHeaders.set('x-admin-email', payload.email)
      requestHeaders.set('x-admin-role', payload.role)
      return NextResponse.next({
        request: { headers: requestHeaders }
      })
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/editor/:path*', '/api/admin/:path*'],
}
