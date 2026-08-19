import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const db = getDb();
    const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const activity = db.prepare(`
      SELECT id, actorType, actorId, action, oldValue, newValue, note, isCustomerVisible, createdAt
      FROM order_activity
      WHERE orderId = ?
      ORDER BY createdAt ASC
    `).all(orderId);

    const statusHistory = db.prepare(`
      SELECT oldStatus, newStatus, changedBy, changedByType, note, createdAt
      FROM order_status_history
      WHERE orderId = ?
      ORDER BY createdAt ASC
    `).all(orderId);

    const notes = db.prepare(`
      SELECT author, authorType, content, isInternal, createdAt
      FROM order_notes
      WHERE orderId = ?
      ORDER BY createdAt ASC
    `).all(orderId);

    const unified = [
      ...activity.map(a => ({
        type: 'activity',
        action: a.action,
        actorType: a.actorType,
        actorId: a.actorId,
        oldValue: a.oldValue,
        newValue: a.newValue,
        note: a.note,
        isInternal: !a.isCustomerVisible,
        createdAt: a.createdAt,
      })),
      ...statusHistory.map(s => ({
        type: 'status_change',
        action: 'status_changed',
        oldValue: s.oldStatus,
        newValue: s.newStatus,
        actorType: s.changedByType,
        actorId: s.changedBy,
        note: s.note,
        isInternal: s.changedByType === 'admin',
        createdAt: s.createdAt,
      })),
      ...notes.map(n => ({
        type: 'note',
        action: 'note_added',
        actorType: n.authorType,
        actorId: n.author,
        note: n.content,
        isInternal: n.isInternal === 1,
        createdAt: n.createdAt,
      })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return NextResponse.json({ success: true, data: unified });
  } catch (error) {
    log.error('Order activity GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}