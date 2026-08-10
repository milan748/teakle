'use client';

import { useState } from 'react';
import PageEditor from './PageEditor';
import MediaLibrary from './MediaLibrary';
import DashboardOverview from './DashboardOverview';
import CustomOrdersManager from './CustomOrdersManager';
import ContactManager from './ContactManager';
import TradeManager from './TradeManager';
import NewsletterManager from './NewsletterManager';
import SiteSettingsEditor from './SiteSettingsEditor';

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
  const [activePage, setActivePage] = useState('dashboard');
  const [showMedia, setShowMedia] = useState(false);
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
  const isContentPage = !!pageConfig;

  function NavButton({ label, isActive, onClick }) {
    return (
      <button
        onClick={onClick}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '8px 16px',
          fontSize: '14px',
          border: 'none',
          background: isActive ? '#f0f0f0' : 'transparent',
          color: isActive ? '#1a1a1a' : '#666',
          fontWeight: isActive ? 500 : 400,
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    );
  }

  function SectionLabel({ text }) {
    return (
      <div style={{ padding: '0 16px 8px', fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {text}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {showMedia && <MediaLibrary onClose={() => setShowMedia(false)} />}

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', minHeight: '100vh', padding: '20px 0', flexShrink: 0 }}>
          <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #eee' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Teakle Admin</h1>
            <p style={{ color: '#666', margin: 0, fontSize: '12px' }}>{admin.email}</p>
          </div>

          <div style={{ padding: '16px 0' }}>
            <SectionLabel text="Overview" />
            <NavButton label="Dashboard" isActive={activePage === 'dashboard'} onClick={() => { setActivePage('dashboard'); setShowMedia(false); }} />
          </div>

          <div style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
            <SectionLabel text="Content" />
            {Object.entries(PAGES).map(([key, cfg]) => (
              <NavButton key={key} label={cfg.label} isActive={activePage === key && !showMedia} onClick={() => { setActivePage(key); setShowMedia(false); }} />
            ))}
          </div>

          <div style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
            <SectionLabel text="Media" />
            <NavButton label="Media Library" isActive={showMedia} onClick={() => setShowMedia(true)} />
          </div>

          <div style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
            <SectionLabel text="Settings" />
            <NavButton label="Site Settings" isActive={activePage === 'site-settings'} onClick={() => { setActivePage('site-settings'); setShowMedia(false); }} />
          </div>

          <div style={{ padding: '16px 0', borderTop: '1px solid #eee' }}>
            <SectionLabel text="Data" />
            <NavButton label="Custom Orders" isActive={activePage === 'data-orders'} onClick={() => { setActivePage('data-orders'); setShowMedia(false); }} />
            <NavButton label="Contact" isActive={activePage === 'data-contact'} onClick={() => { setActivePage('data-contact'); setShowMedia(false); }} />
            <NavButton label="Trade Enquiries" isActive={activePage === 'data-trade'} onClick={() => { setActivePage('data-trade'); setShowMedia(false); }} />
            <NavButton label="Newsletter" isActive={activePage === 'data-newsletter'} onClick={() => { setActivePage('data-newsletter'); setShowMedia(false); }} />
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
        <div style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
          {activePage === 'dashboard' && <DashboardOverview />}
          {isContentPage && (
            <PageEditor
              page={activePage}
              sectionLabels={pageConfig.sections}
              backLabel={pageConfig.label}
            />
          )}
          {activePage === 'data-orders' && <CustomOrdersManager />}
          {activePage === 'data-contact' && <ContactManager />}
          {activePage === 'data-trade' && <TradeManager />}
          {activePage === 'data-newsletter' && <NewsletterManager />}
          {activePage === 'site-settings' && <SiteSettingsEditor />}
        </div>
      </div>
    </div>
  );
}
