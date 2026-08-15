'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi';

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      const d = await adminFetch(`/api/admin/dashboard?${params}`);
      if (d.success) setData(d.data);
    } catch (err) {}
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Loading...</div>;
  if (!data) return <div style={{ padding: '20px', color: '#c00' }}>Failed to load dashboard</div>;

  const cards = [
    { label: 'New Custom Orders', value: data.newOrders, color: '#0070f3' },
    { label: 'Total Custom Orders', value: data.totalCustomOrders, color: '#333' },
    { label: 'New Product Orders', value: data.productOrders, color: '#333' },
    { label: 'Pending', value: data.pendingProductOrders, color: data.pendingProductOrders > 0 ? '#f59e0b' : '#333' },
    { label: 'Confirmed', value: data.confirmedProductOrders, color: data.confirmedProductOrders > 0 ? '#3b82f6' : '#333' },
    { label: 'Processing', value: data.processingProductOrders, color: data.processingProductOrders > 0 ? '#8b5cf6' : '#333' },
    { label: 'Completed', value: data.completedProductOrders, color: data.completedProductOrders > 0 ? '#10b981' : '#333' },
    { label: 'Cancelled', value: data.cancelledProductOrders, color: data.cancelledProductOrders > 0 ? '#ef4444' : '#333' },
    { label: 'Unpaid Orders', value: data.unpaidOrders, color: data.unpaidOrders > 0 ? '#ef4444' : '#333' },
    { label: 'Paid Orders', value: data.paidOrders, color: data.paidOrders > 0 ? '#10b981' : '#333' },
    { label: 'Customers', value: data.customers, color: '#333' },
    { label: 'Contact Submissions', value: data.contactSubmissions, color: '#333' },
    { label: 'Unread Contacts', value: data.unreadContacts, color: data.unreadContacts > 0 ? '#f59e0b' : '#333' },
    { label: 'Trade Enquiries', value: data.tradeEnquiries, color: '#333' },
    { label: 'Newsletter Subscribers', value: data.newsletterSubscribers, color: '#333' },
    { label: 'CMS Drafts', value: data.cmsDrafts, color: data.cmsDrafts > 0 ? '#f59e0b' : '#333' },
    { label: 'CMS Published', value: data.cmsPublished, color: '#22c55e' },
    { label: 'Media Files', value: data.mediaCount, color: '#333' },
    { label: 'Total Revenue (₹)', value: data.totalRevenue ? (data.totalRevenue / 100).toLocaleString('en-IN') : '0', color: '#10b981' },
    { label: 'Pending Revenue (₹)', value: data.pendingRevenue ? (data.pendingRevenue / 100).toLocaleString('en-IN') : '0', color: '#f59e0b' },
  ];

  const periodCards = [];
  if (data.newCustomOrdersPeriod !== null) periodCards.push({ label: 'Custom Orders (Period)', value: data.newCustomOrdersPeriod, color: '#0070f3' });
  if (data.newProductOrdersPeriod !== null) periodCards.push({ label: 'Product Orders (Period)', value: data.newProductOrdersPeriod, color: '#3b82f6' });
  if (data.newCustomersPeriod !== null) periodCards.push({ label: 'New Customers (Period)', value: data.newCustomersPeriod, color: '#22c55e' });

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px', width: '180px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' }}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '13px', width: '180px' }} />
        </div>
        <button onClick={fetchData} style={{ padding: '8px 16px', background: '#374151', color: 'white', border: 'none', fontSize: '13px', cursor: 'pointer', height: '38px' }}>Apply</button>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {cards.map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{card.label}</div>
          </div>
        ))}
        {periodCards.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            {periodCards.map(card => (
              <div key={card.label} style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '1px solid #eee' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{card.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
