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
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [updating, setUpdating] = useState(false);

  async function fetchOrders(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
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

  useEffect(() => { fetchOrders(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchOrders(1);
  }

  function formatPrice(n) {
    return `₹${(n || 0).toLocaleString('en-IN')}`;
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (selectedOrder) {
    const allowedTransitions = VALID_TRANSITIONS[selectedOrder.status] || [];
    return (
      <div>
        <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}>
          ← Back to orders
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
              <div>{selectedOrder.customerName || '—'}</div>
              <div style={{ color: '#666' }}>{selectedOrder.customerEmail || '—'}</div>
            </div>
            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Shipping</div>
              <div>{selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}</div>
              <div style={{ color: '#666' }}>{selectedOrder.shippingAddress}</div>
              <div style={{ color: '#666' }}>{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPin}</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#666' }}>Product</th>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
            <span>Total</span>
            <span>{formatPrice(selectedOrder.totalAmount)}</span>
          </div>
        </div>

        {allowedTransitions.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '16px' }}>
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
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Product Orders</h2>
        <span style={{ color: '#666', fontSize: '13px' }}>{pagination.total} total</span>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
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
                      <div>{order.customerName || '—'}</div>
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
