'use client';

import { useState } from 'react';
import HomepageEditor from './HomepageEditor';

export default function AdminDashboard({ admin }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
              Teakle Admin
            </h1>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
              {admin.email} &middot; {admin.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              opacity: loggingOut ? 0.7 : 1,
            }}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '24px' }}>
          <HomepageEditor />
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            Backend Sections
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#666',
            fontSize: '14px',
          }}>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              Custom Orders
            </li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              Contact Submissions
            </li>
            <li style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              Trade Enquiries
            </li>
            <li style={{ padding: '6px 0' }}>
              Newsletter Subscribers
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
