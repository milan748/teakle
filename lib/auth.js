import { getSession } from './session';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    admin: session,
  };
}
