import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.id, o.orderNumber, o.status, o.paymentStatus,
             o.totalAmount, o.subtotal, o.shippingAmount,
             o.shippingFirstName, o.shippingLastName, o.shippingEmail,
             o.createdAt, o.updatedAt,
             c.email as customerEmail, c.name as customerName,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) as itemCount
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
      conditions.push("o.totalAmount >= ?");
      params.push(parseInt(minTotal, 10));
    }
    if (maxTotal) {
      conditions.push("o.totalAmount <= ?");
      params.push(parseInt(maxTotal, 10));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY o.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as total FROM orders o LEFT JOIN customers c ON c.id = o.customerId';
    const countParams = [];
    const countConditions = [];
    if (search) {
      countConditions.push("(o.orderNumber LIKE ? OR c.email LIKE ? OR c.name LIKE ?)");
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      countConditions.push("o.status = ?");
      countParams.push(status);
    }
    if (paymentStatus) {
      countConditions.push("o.paymentStatus = ?");
      countParams.push(paymentStatus);
    }
    if (dateFrom) {
      countConditions.push("o.createdAt >= ?");
      countParams.push(dateFrom);
    }
    if (dateTo) {
      countConditions.push("o.createdAt <= ?");
      countParams.push(dateTo + ' 23:59:59');
    }
    if (customer) {
      countConditions.push("(c.email LIKE ? OR c.name LIKE ?)");
      countParams.push(`%${customer}%`, `%${customer}%`);
    }
    if (orderNumber) {
      countConditions.push("o.orderNumber LIKE ?");
      countParams.push(`%${orderNumber}%`);
    }
    if (minTotal) {
      countConditions.push("o.totalAmount >= ?");
      countParams.push(parseInt(minTotal, 10));
    }
    if (maxTotal) {
      countConditions.push("o.totalAmount <= ?");
      countParams.push(parseInt(maxTotal, 10));
    }
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    const { total } = db.prepare(countQuery).get(...countParams);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    log.error('Product orders GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
