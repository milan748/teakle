'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi';

export default function ContactManager() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, [search]);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const data = await adminFetch(`/api/admin/contact?${params}`);
      if (data.success) setSubmissions(data.data);
    } catch {}
    setLoading(false);
  }

  async function loadDetail(id) {
    try {
      const data = await adminFetch(`/api/admin/contact/${id}`);
      if (data.success) {
        setSelected(data.data);
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: 1 } : s));
      }
    } catch {}
  }

  async function toggleRead(id, currentRead) {
    const newRead = currentRead ? 0 : 1;
    try {
      const data = await adminFetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: newRead }),
      });
      if (data.success) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: newRead } : s));
        if (selected?.id === id) setSelected(prev => ({ ...prev, read: newRead }));
      }
    } catch {}
  }

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Contact Submissions</h2>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search name, email, or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minWidth: '300px' }}
        />
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
            </div>
            <button
              onClick={() => toggleRead(selected.id, selected.read)}
              style={{ fontSize: '12px', padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
            >
              {selected.read ? 'Mark Unread' : 'Mark Read'}
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Subject</div>
            <div style={{ fontSize: '14px' }}>{selected.subject || '(no subject)'}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Submitted</div>
            <div style={{ fontSize: '13px' }}>{new Date(selected.createdAt).toLocaleString()}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Message</div>
            <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>{selected.message}</div>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No contact submissions yet.</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              {submissions.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => loadDetail(sub.id)}
                  style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {!sub.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0070f3', flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: sub.read ? 400 : 600 }}>{sub.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{sub.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>{sub.subject || '(no subject)'}</span>
                    <span style={{ fontSize: '11px', color: '#999' }}>{new Date(sub.createdAt).toLocaleDateString()}</span>
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
