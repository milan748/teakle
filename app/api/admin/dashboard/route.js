import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const db = getDb();

    const newOrders = db.prepare("SELECT COUNT(*) as count FROM custom_orders WHERE status = 'NEW'").get().count;
    const totalOrders = db.prepare("SELECT COUNT(*) as count FROM custom_orders").get().count;
    const contactSubmissions = db.prepare("SELECT COUNT(*) as count FROM contact_submissions").get().count;
    const unreadContacts = db.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE read = 0").get().count;
    const tradeEnquiries = db.prepare("SELECT COUNT(*) as count FROM trade_enquiries").get().count;
    const newsletterSubscribers = db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers").get().count;
    const cmsDrafts = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE status = 'draft'").get().count;
    const cmsPublished = db.prepare("SELECT COUNT(*) as count FROM content_sections WHERE status = 'published'").get().count;
    const mediaCount = db.prepare("SELECT COUNT(*) as count FROM media").get().count;

    return NextResponse.json({
      success: true,
      data: {
        newOrders,
        totalOrders,
        contactSubmissions,
        unreadContacts,
        tradeEnquiries,
        newsletterSubscribers,
        cmsDrafts,
        cmsPublished,
        mediaCount,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
