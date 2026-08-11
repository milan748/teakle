'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi';

const STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_COLORS = {
  NEW: '#0070f3',
  CONTACTED: '#f59e0b',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#22c55e',
  CANCELLED: '#999',
};

export default function CustomOrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [search, filterStatus]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      const data = await adminFetch(`/api/admin/custom-orders?${params}`);
      if (data.success) setOrders(data.data);
    } catch {}
    setLoading(false);
  }

  async function loadDetail(id) {
    try {
      const data = await adminFetch(`/api/admin/custom-orders/${id}`);
      if (data.success) setSelected(data.data);
    } catch {}
  }

  async function updateStatus(id, status) {
    setUpdating(true);
    try {
      const data = await adminFetch(`/api/admin/custom-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      }
    } catch {}
    setUpdating(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Custom Orders</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minWidth: '200px' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {selected ? (
        <DetailView
          item={selected}
          onBack={() => setSelected(null)}
          onUpdateStatus={(status) => updateStatus(selected.id, status)}
          updating={updating}
        />
      ) : (
        <>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No custom orders yet.</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => loadDetail(order.id)}
                  style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{order.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{order.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {order.referenceFile && <span style={{ fontSize: '11px', color: '#0070f3' }}>Has reference</span>}
                    <span style={{ fontSize: '11px', color: '#999' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: STATUS_COLORS[order.status] || '#333', background: (STATUS_COLORS[order.status] || '#333') + '15', padding: '2px 8px', borderRadius: '10px' }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailView({ item, onBack, onUpdateStatus, updating }) {
  return (
    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '20px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#0070f3', marginBottom: '16px', padding: 0 }}>
        &larr; Back to list
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{item.name}</h3>
          <div style={{ fontSize: '13px', color: '#666' }}>{item.email}</div>
          {item.phone && <div style={{ fontSize: '13px', color: '#666' }}>{item.phone}</div>}
        </div>
        <span style={{ fontSize: '12px', fontWeight: 500, color: STATUS_COLORS[item.status], background: STATUS_COLORS[item.status] + '15', padding: '4px 10px', borderRadius: '10px' }}>
          {item.status.replace('_', ' ')}
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Submitted</div>
        <div style={{ fontSize: '13px' }}>{new Date(item.createdAt).toLocaleString()}</div>
      </div>

      {item.size && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Size</div>
          <div style={{ fontSize: '13px' }}>{item.size}</div>
        </div>
      )}

      {item.dimensions && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Dimensions</div>
          <div style={{ fontSize: '13px' }}>{item.dimensions}</div>
        </div>
      )}

      {item.description && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Description</div>
          <div style={{ fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.description}</div>
        </div>
      )}

      {item.referenceFile && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Reference File</div>
          <a href={item.referenceFile} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0070f3' }}>{item.referenceFile}</a>
        </div>
      )}

      <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Update Status</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => onUpdateStatus(s)}
              disabled={updating || item.status === s}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: item.status === s ? '2px solid ' + STATUS_COLORS[s] : '1px solid #ddd',
                borderRadius: '4px',
                background: item.status === s ? STATUS_COLORS[s] + '15' : 'white',
                color: item.status === s ? STATUS_COLORS[s] : '#333',
                cursor: updating ? 'not-allowed' : 'pointer',
                fontWeight: item.status === s ? 600 : 400,
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
