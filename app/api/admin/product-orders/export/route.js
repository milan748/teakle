import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';
import { rateLimitIp, RATE_LIMITS } from '@/lib/rateLimit';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const rl = rateLimitIp('admin:export', RATE_LIMITS.adminExport, request.headers);
  if (!rl.allowed) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const minTotal = searchParams.get('minTotal') || '';
    const maxTotal = searchParams.get('maxTotal') || '';
    const customer = searchParams.get('customer') || '';
    const orderNumber = searchParams.get('orderNumber') || '';

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

    if (search) {
      conditions.push("(o.orderNumber LIKE ? OR c.email LIKE ? OR c.name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
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
    if (customer) {
      conditions.push("(c.email LIKE ? OR c.name LIKE ?)");
      params.push(`%${customer}%`, `%${customer}%`);
    }
    if (orderNumber) {
      conditions.push("o.orderNumber LIKE ?");
      params.push(`%${orderNumber}%`);
    }
    if (minTotal) {
      const v = parseInt(minTotal, 10);
      if (Number.isNaN(v)) {
        return Response.json({ error: 'minTotal must be a number' }, { status: 400 });
      }
      conditions.push("o.totalAmount >= ?");
      params.push(v);
    }
    if (maxTotal) {
      const v = parseInt(maxTotal, 10);
      if (Number.isNaN(v)) {
        return Response.json({ error: 'maxTotal must be a number' }, { status: 400 });
      }
      conditions.push("o.totalAmount <= ?");
      params.push(v);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY o.createdAt DESC';

    const orders = db.prepare(query).all(...params);

    const escapeCSV = (val) => {
      if (val == null) return '';
      const str = String(val);
      if (/[=+\-@]/.test(str.charAt(0))) {
        return "'" + str;
      }
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

    // Audit log
    try {
      db.prepare('INSERT INTO admin_audit_logs (adminId, action, entityType, entityId, metadata) VALUES (?, ?, ?, ?, ?)').run(
        auth.admin.id, 'export', 'orders', null,
        JSON.stringify({ format: 'csv', rowCount: orders.length })
      );
    } catch { /* audit log failure is non-blocking */ }

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teakle-orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    log.error('Orders export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
