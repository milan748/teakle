'use client';

import { useState } from 'react';
import HomepageEditor from './HomepageEditor';
import PageEditor from './PageEditor';

const PAGES = {
  home: { label: 'Homepage', sections: { hero: 'Hero', philosophy: 'Philosophy', signature: 'Signature Collection', craftsmanship: 'Craftsmanship', 'workshop-story': 'Workshop Story', 'process-story': 'Process Story' } },
  studio: { label: 'Studio', sections: { hero: 'Hero', origin: 'Origin', gallery: 'Workshop Gallery' } },
  contact: { label: 'Contact', sections: { hero: 'Hero', introduction: 'Introduction' } },
  trade: { label: 'Trade', sections: { hero: 'Hero', introduction: 'Introduction' } },
  custom: { label: 'Custom Orders', sections: { hero: 'Hero', introduction: 'Introduction' } },
  journal: { label: 'Journal', sections: { hero: 'Hero' } },
  archive: { label: 'Archive', sections: { hero: 'Hero' } },
};

export default function AdminDashboard({ admin }) {
  const [activePage, setActivePage] = useState('home');
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

  const pageConfig = PAGES[activePage];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', minHeight: '100vh', padding: '20px 0' }}>
          <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #eee' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Teakle Admin</h1>
            <p style={{ color: '#666', margin: 0, fontSize: '12px' }}>{admin.email}</p>
          </div>

          <div style={{ padding: '16px 0' }}>
            <div style={{ padding: '0 16px 8px', fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Content
            </div>
            {Object.entries(PAGES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActivePage(key)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  fontSize: '14px',
                  border: 'none',
                  background: activePage === key ? '#f0f0f0' : 'transparent',
                  color: activePage === key ? '#1a1a1a' : '#666',
                  fontWeight: activePage === key ? 500 : 400,
                  cursor: 'pointer',
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
            <div style={{ padding: '0 16px 8px', fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Data
            </div>
            <div style={{ padding: '6px 16px', fontSize: '14px', color: '#666' }}>Custom Orders</div>
            <div style={{ padding: '6px 16px', fontSize: '14px', color: '#666' }}>Contact Submissions</div>
            <div style={{ padding: '6px 16px', fontSize: '14px', color: '#666' }}>Trade Enquiries</div>
            <div style={{ padding: '6px 16px', fontSize: '14px', color: '#666' }}>Newsletter</div>
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #eee' }}>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ width: '100%', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', fontSize: '13px', cursor: loggingOut ? 'not-allowed' : 'pointer', opacity: loggingOut ? 0.7 : 1 }}
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '32px 40px' }}>
          <PageEditor
            page={activePage}
            sectionLabels={pageConfig.sections}
            backLabel={pageConfig.label}
          />
        </div>
      </div>
    </div>
  );
}
