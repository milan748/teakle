import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let query = `
      SELECT o.orderNumber, o.status, o.paymentStatus,
             o.subtotal, o.shippingAmount, o.totalAmount,
             o.shippingFirstName, o.shippingLastName, o.shippingEmail, o.shippingPhone,
             o.shippingAddress, o.shippingCity, o.shippingState, o.shippingPin,
             o.createdAt, o.updatedAt,
             c.email as customerEmail, c.name as customerName
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customerId
    `;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("o.status = ?");
      params.push(status);
    }
    if (paymentStatus) {
      conditions.push("o.paymentStatus = ?");
      params.push(paymentStatus);
    }
    if (dateFrom) {
      conditions.push("o.createdAt >= ?");
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push("o.createdAt <= ?");
      params.push(dateTo + ' 23:59:59');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY o.createdAt DESC';

    const orders = db.prepare(query).all(...params);

    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headers = [
      'Order Number', 'Status', 'Payment Status',
      'Subtotal', 'Shipping', 'Total',
      'Customer Name', 'Customer Email',
      'Shipping Name', 'Shipping Email', 'Shipping Phone',
      'Shipping Address', 'City', 'State', 'PIN',
      'Created At', 'Updated At',
    ];

    const rows = orders.map(o => [
      o.orderNumber, o.status, o.paymentStatus,
      o.subtotal, o.shippingAmount, o.totalAmount,
      o.customerName || '', o.customerEmail || '',
      `${o.shippingFirstName || ''} ${o.shippingLastName || ''}`.trim(),
      o.shippingEmail || '', o.shippingPhone || '',
      o.shippingAddress || '', o.shippingCity || '', o.shippingState || '', o.shippingPin || '',
      o.createdAt, o.updatedAt,
    ].map(escapeCSV).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teakle-orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Orders export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
