import { getCustomerSession } from '@/lib/customerSession';
import { getDb } from '@/lib/db';
import { log } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return Response.json({ customer: null });
    }

    const db = getDb();
    const customer = db.prepare('SELECT id, email, name, phone, createdAt FROM customers WHERE id = ?')
      .get(session.customerId);

    if (!customer) {
      return Response.json({ customer: null });
    }

    return Response.json({ customer });
  } catch (err) {
    log.error('Get customer error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
