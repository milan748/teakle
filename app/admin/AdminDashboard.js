'use client';

import { useState } from 'react';

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
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
          Teakle Admin
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Admin Dashboard
        </p>

        <div style={{
          background: '#f8f9fa',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Email:</strong> {admin.email}
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>Role:</strong> {admin.role}
          </p>
          <p style={{ margin: '0', color: '#28a745' }}>
            <strong>Status:</strong> Authenticated
          </p>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
          Backend Sections
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 24px 0',
          color: '#666',
        }}>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            Custom Orders
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            Contact Submissions
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            Trade Enquiries
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            Newsletter Subscribers
          </li>
          <li style={{ padding: '8px 0', color: '#999' }}>
            Content Management <span style={{ fontSize: '12px' }}>(coming soon)</span>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.7 : 1,
          }}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
