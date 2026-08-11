'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

const PAYMENT_COLORS = {
  UNPAID: '#ef4444',
  PAID: '#10b981',
};

function statusBg(color) { return color + '15'; }
function paymentBg(color) { return color + '15'; }

const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [updating, setUpdating] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteInternal, setNoteInternal] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  async function fetchOrders(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentStatus', paymentFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const res = await fetch(`/api/admin/product-orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  }

  async function fetchOrderDetail(id) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/product-orders/${id}`);
      const data = await res.json();
      if (data.success) setSelectedOrder(data.data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    }
    setDetailLoading(false);
  }

  async function updateStatus(id, newStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/product-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrderDetail(id);
        await fetchOrders(pagination.page);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
    setUpdating(false);
  }

  async function addNote(orderId) {
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/admin/product-orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim(), isInternal: noteInternal }),
      });
      const data = await res.json();
      if (data.success) {
        setNoteContent('');
        setNoteInternal(false);
        await fetchOrderDetail(orderId);
      } else {
        alert(data.error || 'Failed to add note');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    }
    setSubmittingNote(false);
  }

  function exportCSV() {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (paymentFilter) params.set('paymentStatus', paymentFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    window.open(`/api/admin/product-orders/export?${params}`, '_blank');
  }

  useEffect(() => { fetchOrders(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchOrders(1);
  }

  function formatPrice(n) {
    return `\u20B9${(n || 0).toLocaleString('en-IN')}`;
  }

  function formatDate(d) {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (selectedOrder) {
    const allowedTransitions = VALID_TRANSITIONS[selectedOrder.status] || [];
    return (
      <div>
        <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}>
          \u2190 Back to orders
        </button>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{selectedOrder.orderNumber}</h2>
              <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>Created {formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 500, background: statusBg(STATUS_COLORS[selectedOrder.status] || '#666'), color: STATUS_COLORS[selectedOrder.status] || '#666', border: '1px solid ' + (STATUS_COLORS[selectedOrder.status] || '#666') + '30' }}>
                {selectedOrder.status}
              </span>
              <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 500, background: paymentBg(PAYMENT_COLORS[selectedOrder.paymentStatus] || '#666'), color: PAYMENT_COLORS[selectedOrder.paymentStatus] || '#666', border: '1px solid ' + (PAYMENT_COLORS[selectedOrder.paymentStatus] || '#666') + '30' }}>
                {selectedOrder.paymentStatus}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
              <div>{selectedOrder.customerName || '\u2014'}</div>
              <div style={{ color: '#666' }}>{selectedOrder.customerEmail || '\u2014'}</div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Shipping Address</div>
              <div>{selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}</div>
              <div style={{ color: '#666' }}>{selectedOrder.shippingAddress}</div>
              <div style={{ color: '#666' }}>{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPin}</div>
              {selectedOrder.shippingPhone && <div style={{ color: '#666' }}>{selectedOrder.shippingPhone}</div>}
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Billing Address</div>
              {selectedOrder.billingSameAsShipping ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>Same as shipping</div>
              ) : (
                <>
                  <div>{selectedOrder.billingFirstName} {selectedOrder.billingLastName}</div>
                  <div style={{ color: '#666' }}>{selectedOrder.billingAddress}</div>
                  <div style={{ color: '#666' }}>{selectedOrder.billingCity}, {selectedOrder.billingState} {selectedOrder.billingPin}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#666' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#666' }}>SKU</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, color: '#666' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, color: '#666' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, color: '#666' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(selectedOrder.items || []).map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.productImage && <img src={item.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />}
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.productNameSnapshot}</div>
                        <div style={{ color: '#999', fontSize: '11px' }}>{item.productId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#999', fontSize: '12px', fontFamily: 'monospace' }}>{item.sku || '\u2014'}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>{formatPrice(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500 }}>{formatPrice(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#666' }}>Subtotal</span>
            <span>{formatPrice(selectedOrder.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#666' }}>Shipping</span>
            <span>{formatPrice(selectedOrder.shippingAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#666' }}>Tax</span>
            <span>{formatPrice(selectedOrder.taxAmount || 0)}</span>
          </div>
          {(selectedOrder.discountAmount || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#10b981' }}>
              <span>Discount</span>
              <span>-{formatPrice(selectedOrder.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
            <span>Total</span>
            <span>{formatPrice(selectedOrder.totalAmount)}</span>
          </div>
        </div>

        {allowedTransitions.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Update Status</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {allowedTransitions.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(selectedOrder.id, s)}
                  disabled={updating}
                  style={{
                    padding: '6px 14px', fontSize: '12px', border: '1px solid #d1d5db', background: s === 'CANCELLED' ? '#fef2f2' : 'white',
                    color: s === 'CANCELLED' ? '#dc2626' : '#374151', cursor: updating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {(selectedOrder.history || []).length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Status History</div>
            <div style={{ fontSize: '12px' }}>
              {selectedOrder.history.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: i < selectedOrder.history.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ color: '#999', minWidth: '140px' }}>{formatDate(h.createdAt)}</span>
                  <span style={{ color: '#666' }}>
                    {h.oldStatus ? `${h.oldStatus} \u2192 ` : ''}{h.newStatus}
                  </span>
                  <span style={{ color: '#999', fontSize: '11px' }}>by {h.changedByType}: {h.changedBy}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Add Note</div>
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Write a note about this order..."
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={noteInternal} onChange={e => setNoteInternal(e.target.checked)} />
              Internal note (not visible to customer)
            </label>
            <button
              onClick={() => addNote(selectedOrder.id)}
              disabled={submittingNote || !noteContent.trim()}
              style={{ padding: '6px 14px', fontSize: '12px', background: '#374151', color: 'white', border: 'none', cursor: submittingNote || !noteContent.trim() ? 'not-allowed' : 'pointer', opacity: submittingNote || !noteContent.trim() ? 0.5 : 1 }}
            >
              {submittingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>

        {(selectedOrder.notes || []).length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Notes</div>
            {selectedOrder.notes.map((n, i) => (
              <div key={i} style={{ padding: '10px 12px', background: n.isInternal ? '#fffbeb' : '#f9fafb', border: '1px solid ' + (n.isInternal ? '#fde68a' : '#e5e7eb'), marginBottom: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>{n.author}</span>
                  <span style={{ color: '#999' }}>{formatDate(n.createdAt)}</span>
                </div>
                <div style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{n.content}</div>
                {n.isInternal ? <div style={{ color: '#92400e', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>Internal</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Product Orders</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: '13px' }}>{pagination.total} total</span>
          <button onClick={exportCSV} style={{ padding: '6px 14px', fontSize: '12px', background: 'white', border: '1px solid #d1d5db', color: '#374151', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }}>
          <option value="">All payments</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }} />
        <button type="submit" style={{ padding: '8px 16px', background: '#374151', color: 'white', border: 'none', fontSize: '13px', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <p style={{ color: '#666', fontSize: '13px' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '40px' }}>No orders found.</p>
      ) : (
        <>
          <div style={{ background: 'white', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Order</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Customer</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Payment</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Items</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => fetchOrderDetail(order.id)}
                    style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 500, fontFamily: 'monospace', fontSize: '12px' }}>{order.orderNumber}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>{order.customerName || '\u2014'}</div>
                      <div style={{ color: '#999', fontSize: '11px' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 500, background: statusBg(STATUS_COLORS[order.status] || '#666'), color: STATUS_COLORS[order.status] || '#666' }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 500, background: paymentBg(PAYMENT_COLORS[order.paymentStatus] || '#666'), color: PAYMENT_COLORS[order.paymentStatus] || '#666' }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500 }}>{formatPrice(order.totalAmount)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{order.itemCount}</td>
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: '12px' }}>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => fetchOrders(p)}
                  style={{
                    padding: '6px 12px', fontSize: '12px', border: '1px solid #d1d5db',
                    background: p === pagination.page ? '#374151' : 'white',
                    color: p === pagination.page ? 'white' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
