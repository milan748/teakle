'use client';

import { useState, useEffect } from 'react';

const SETTINGS_CONFIG = [
  { key: 'siteName', label: 'Site Name', placeholder: 'Teakle' },
  { key: 'footerDescription', label: 'Footer Description', placeholder: 'Made by hand in India, one piece at a time.', multiline: true },
  { key: 'contactEmail', label: 'Contact Email', placeholder: 'hello@teakle.in' },
  { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://www.instagram.com/teaklestudio' },
  { key: 'workshopLocation', label: 'Workshop Location', placeholder: 'India — visits by appointment only' },
  { key: 'responseTime', label: 'Response Time', placeholder: 'Within two working days' },
  { key: 'newsletterHeading', label: 'Newsletter Heading', placeholder: 'From the Workshop' },
  { key: 'newsletterDescription', label: 'Newsletter Description', placeholder: 'Receive occasional notes from the workshop. No spam. No offers. Only stories.', multiline: true },
];

export default function SiteSettingsEditor() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch {
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Settings saved successfully.');
      } else {
        setMessage(data.error || 'Failed to save settings');
      }
    } catch {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Site Settings</h2>
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            background: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 20px',
            fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          background: message.includes('success') ? '#d4edda' : '#f8d7da',
          color: message.includes('success') ? '#155724' : '#721c24',
          fontSize: '14px',
        }}>
          {message}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '24px' }}>
        {SETTINGS_CONFIG.map(field => (
          <div key={field.key} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
              {field.label}
            </label>
            {field.multiline ? (
              <textarea
                value={settings[field.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={3}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
            ) : (
              <input
                type="text"
                value={settings[field.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            )}
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              Key: <code>{field.key}</code> {settings[field.key] ? '' : '(using fallback)'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
        Settings are applied site-wide. Public pages use these values with hardcoded fallbacks if empty.
        Local filesystem media storage is development-oriented and is not guaranteed to persist on ephemeral production hosting.
      </div>
    </div>
  );
}
