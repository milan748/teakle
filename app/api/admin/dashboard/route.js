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
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const dateWhere = dateFrom || dateTo ? 'WHERE ' : '';
    const dateConditions = [];
    const dateParams = [];

    if (dateFrom) {
      dateConditions.push("createdAt >= ?");
      dateParams.push(dateFrom);
    }
    if (dateTo) {
      dateConditions.push("createdAt <= ?");
      dateParams.push(dateTo + ' 23:59:59');
    }

    const newOrders = db.prepare("SELECT COUNT(*) as count FROM custom_orders WHERE status = 'NEW'").get().count;
    const totalCustomOrders = db.prepare("SELECT COUNT(*) as count FROM custom_orders").get().count;
    const contactSubmissions = db.prepare("SELECT COUNT(*) as count FROM contact_submissions").get().count;
    const unreadContacts = db.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE read = 0").get().count;
    const tradeEnquiries = db.prepare("SELECT COUNT(*) as count FROM trade_enquiries").get().count;
    const newsletterSubscribers = db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers").get().count;
    const cmsDrafts = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE status = 'draft'").get().count;
    const cmsPublished = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE status = 'published'").get().count;
    const mediaCount = db.prepare("SELECT COUNT(*) as count FROM media").get().count;
    const productOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;
    const pendingProductOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'").get().count;
    const confirmedProductOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'CONFIRMED'").get().count;
    const processingProductOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'PROCESSING'").get().count;
    const completedProductOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'COMPLETED'").get().count;
    const cancelledProductOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'CANCELLED'").get().count;
    const unpaidOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE paymentStatus = 'UNPAID'").get().count;
    const paidOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE paymentStatus = 'PAID'").get().count;
    const customers = db.prepare("SELECT COUNT(*) as count FROM customers").get().count;

    const newCustomOrdersPeriod = dateFrom || dateTo
      ? db.prepare(`SELECT COUNT(*) as count FROM custom_orders ${dateWhere}${dateConditions.join(' AND ')}`).get(...dateParams).count
      : null;
    const newProductOrdersPeriod = dateFrom || dateTo
      ? db.prepare(`SELECT COUNT(*) as count FROM orders ${dateWhere}${dateConditions.join(' AND ')}`).get(...dateParams).count
      : null;
    const newCustomersPeriod = dateFrom || dateTo
      ? db.prepare(`SELECT COUNT(*) as count FROM customers ${dateWhere}${dateConditions.join(' AND ')}`).get(...dateParams).count
      : null;

    const totalRevenue = db.prepare("SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders WHERE status != 'CANCELLED'").get().total;
    const pendingRevenue = db.prepare("SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders WHERE status IN ('PENDING', 'CONFIRMED')").get().total;

    return NextResponse.json({
      success: true,
      data: {
        newOrders,
        totalCustomOrders,
        contactSubmissions,
        unreadContacts,
        tradeEnquiries,
        newsletterSubscribers,
        cmsDrafts,
        cmsPublished,
        mediaCount,
        productOrders,
        pendingProductOrders,
        confirmedProductOrders,
        processingProductOrders,
        completedProductOrders,
        cancelledProductOrders,
        unpaidOrders,
        paidOrders,
        customers,
        newCustomOrdersPeriod,
        newProductOrdersPeriod,
        newCustomersPeriod,
        totalRevenue,
        pendingRevenue,
      },
    });
  } catch (error) {
    log.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
