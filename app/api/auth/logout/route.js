import { deleteCustomerSession } from '@/lib/customerSession';

export async function POST() {
  try {
    await deleteCustomerSession();
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
