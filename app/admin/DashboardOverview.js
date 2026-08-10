'use client';

import { useState, useEffect } from 'react';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Loading...</div>;
  if (!data) return <div style={{ padding: '20px', color: '#c00' }}>Failed to load dashboard</div>;

  const cards = [
    { label: 'New Custom Orders', value: data.newOrders, color: '#0070f3' },
    { label: 'Total Custom Orders', value: data.totalOrders, color: '#333' },
    { label: 'Pending Product Orders', value: data.pendingProductOrders, color: data.pendingProductOrders > 0 ? '#f59e0b' : '#333' },
    { label: 'Total Product Orders', value: data.productOrders, color: '#333' },
    { label: 'Customers', value: data.customers, color: '#333' },
    { label: 'Contact Submissions', value: data.contactSubmissions, color: '#333' },
    { label: 'Unread Contacts', value: data.unreadContacts, color: data.unreadContacts > 0 ? '#f59e0b' : '#333' },
    { label: 'Trade Enquiries', value: data.tradeEnquiries, color: '#333' },
    { label: 'Newsletter Subscribers', value: data.newsletterSubscribers, color: '#333' },
    { label: 'CMS Drafts', value: data.cmsDrafts, color: data.cmsDrafts > 0 ? '#f59e0b' : '#333' },
    { label: 'CMS Published', value: data.cmsPublished, color: '#22c55e' },
    { label: 'Media Files', value: data.mediaCount, color: '#333' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {cards.map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
