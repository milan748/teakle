import { deleteCustomerSession } from '@/lib/customerSession';
import { log } from '@/lib/logger';
import { withCsrf } from '@/lib/csrf';

export const POST = withCsrf(async function POST() {
  try {
    await deleteCustomerSession();
    return Response.json({ ok: true });
  } catch (err) {
    log.error('Logout error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
