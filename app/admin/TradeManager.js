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

export default function TradeManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadEnquiries();
  }, [search, filterStatus]);

  async function loadEnquiries() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      const data = await adminFetch(`/api/admin/trade?${params}`);
      if (data.success) setEnquiries(data.data);
    } catch {}
    setLoading(false);
  }

  async function loadDetail(id) {
    try {
      const data = await adminFetch(`/api/admin/trade/${id}`);
      if (data.success) setSelected(data.data);
    } catch {}
  }

  async function updateStatus(id, status) {
    setUpdating(true);
    try {
      const data = await adminFetch(`/api/admin/trade/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (data.success) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      }
    } catch {}
    setUpdating(false);
  }

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Trade Enquiries</h2>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name, email, or project type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minWidth: '250px' }}
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
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '20px' }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#0070f3', marginBottom: '16px', padding: 0 }}>
            &larr; Back to list
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{selected.name}</h3>
              <div style={{ fontSize: '13px', color: '#666' }}>{selected.email}</div>
              {selected.company && <div style={{ fontSize: '13px', color: '#666' }}>{selected.company}</div>}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: STATUS_COLORS[selected.status], background: STATUS_COLORS[selected.status] + '15', padding: '4px 10px', borderRadius: '10px' }}>
              {selected.status.replace('_', ' ')}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Project Type</div>
            <div style={{ fontSize: '13px' }}>{selected.projectType || '(not specified)'}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Submitted</div>
            <div style={{ fontSize: '13px' }}>{new Date(selected.createdAt).toLocaleString()}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Details</div>
            <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>{selected.details || '(none)'}</div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Update Status</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  disabled={updating || selected.status === s}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    border: selected.status === s ? '2px solid ' + STATUS_COLORS[s] : '1px solid #ddd',
                    borderRadius: '4px',
                    background: selected.status === s ? STATUS_COLORS[s] + '15' : 'white',
                    color: selected.status === s ? STATUS_COLORS[s] : '#333',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    fontWeight: selected.status === s ? 600 : 400,
                  }}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No trade enquiries yet.</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              {enquiries.map(enq => (
                <div
                  key={enq.id}
                  onClick={() => loadDetail(enq.id)}
                  style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{enq.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{enq.email}{enq.company ? ` \u00b7 ${enq.company}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>{enq.projectType || '-'}</span>
                    <span style={{ fontSize: '11px', color: '#999' }}>{new Date(enq.createdAt).toLocaleDateString()}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: STATUS_COLORS[enq.status], background: STATUS_COLORS[enq.status] + '15', padding: '2px 8px', borderRadius: '10px' }}>
                      {enq.status.replace('_', ' ')}
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
