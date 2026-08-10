'use client';

import { useState, useEffect } from 'react';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, [search]);

  async function loadSubscribers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/newsletter?${params}`);
      const data = await res.json();
      if (data.success) setSubscribers(data.data);
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Newsletter Subscribers</h2>
        <span style={{ fontSize: '13px', color: '#666' }}>{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minWidth: '300px' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      ) : subscribers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No newsletter subscribers yet.</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
          {subscribers.map(sub => (
            <div
              key={sub.id}
              style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ fontSize: '14px' }}>{sub.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: sub.status === 'ACTIVE' ? '#22c55e' : '#999', background: (sub.status === 'ACTIVE' ? '#22c55e' : '#999') + '15', padding: '2px 8px', borderRadius: '10px' }}>
                  {sub.status}
                </span>
                <span style={{ fontSize: '11px', color: '#999' }}>{new Date(sub.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
