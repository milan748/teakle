import { deleteCustomerSession } from '@/lib/customerSession';
import { log } from '@/lib/logger';

export async function POST() {
  try {
    await deleteCustomerSession();
    return Response.json({ ok: true });
  } catch (err) {
    log.error('Logout error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
