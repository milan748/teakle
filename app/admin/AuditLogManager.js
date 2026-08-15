'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi';

export default function AuditLogManager() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const ACTIONS = [
    'order_status_changed', 'order_note_added', 'order_cancelled',
    'product_created', 'product_updated', 'product_deleted',
    'cms_draft_saved', 'cms_published', 'cms_discarded',
    'site_setting_changed', 'media_uploaded', 'media_deleted',
    'custom_order_updated', 'contact_updated', 'trade_updated',
    'newsletter_sent', 'admin_login', 'bulk_status_change',
  ];

  const ENTITY_TYPES = ['order', 'product', 'custom_order', 'contact_submission', 'trade_enquiry', 'newsletter_subscriber', 'content_section', 'site_setting', 'media', 'admin'];

  async function fetchLogs(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entityType', entityFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const data = await adminFetch(`/api/admin/audit-logs?${params}`);
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
    setLoading(false);
  }

  useEffect(() => { fetchLogs(); }, [actionFilter, entityFilter, dateFrom, dateTo]);

  function formatDate(d) {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function truncate(str, len = 80) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Audit Log</h2>
      </div>

      <form style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px', minWidth: '200px' }}>
          <option value="">All actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px', minWidth: '200px' }}>
          <option value="">All entity types</option>
          {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px' }} />
        <button type="button" onClick={fetchLogs} style={{ padding: '8px 16px', background: '#374151', color: 'white', border: 'none', fontSize: '13px', cursor: 'pointer' }}>Filter</button>
      </form>

      {loading ? (
        <p style={{ color: '#666', fontSize: '13px' }}>Loading...</p>
      ) : logs.length === 0 ? (
        <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '40px' }}>No audit logs found.</p>
      ) : (
        <>
          <div style={{ background: 'white', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Time</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Admin</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Entity</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500, color: '#666' }}>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 500 }}>{log.adminEmail || '\u2014'}</div>
                      <div style={{ color: '#999', fontSize: '11px' }}>ID: {log.adminId}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{log.action}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>{log.entityType}</div>
                      {log.entityId && <div style={{ color: '#999', fontSize: '11px', fontFamily: 'monospace' }}>{log.entityId}</div>}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: '11px', fontFamily: 'monospace', maxWidth: '300px' }}>
                      {truncate(JSON.stringify(log.metadata), 150)}
                    </td>
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
                  onClick={() => fetchLogs(p)}
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