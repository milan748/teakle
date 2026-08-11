'use client';

import { useState, useEffect } from 'react';

const GENERAL_SETTINGS = [
  { key: 'siteName', label: 'Site Name', placeholder: 'Teakle' },
  { key: 'footerDescription', label: 'Footer Description', placeholder: 'Made by hand in India, one piece at a time.', multiline: true },
  { key: 'contactEmail', label: 'Contact Email', placeholder: 'hello@teakle.in' },
  { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://www.instagram.com/teaklestudio' },
  { key: 'workshopLocation', label: 'Workshop Location', placeholder: 'India — visits by appointment only' },
  { key: 'responseTime', label: 'Response Time', placeholder: 'Within two working days' },
  { key: 'newsletterHeading', label: 'Newsletter Heading', placeholder: 'From the Workshop' },
  { key: 'newsletterDescription', label: 'Newsletter Description', placeholder: 'Receive occasional notes from the workshop. No spam. No offers. Only stories.', multiline: true },
];

const SUPPORT_SETTINGS = [
  { key: 'supportEmail', label: 'Support Email', placeholder: 'support@teakle.in' },
  { key: 'supportPhone', label: 'Support Phone', placeholder: '+91 XXXXX XXXXX' },
];

const BUSINESS_SETTINGS = [
  { key: 'legalEntityName', label: 'Legal Entity Name', placeholder: 'Not configured' },
  { key: 'businessAddress', label: 'Business Address', placeholder: 'Not configured', multiline: true },
  { key: 'gstin', label: 'GSTIN', placeholder: 'Not configured' },
  { key: 'pan', label: 'PAN', placeholder: 'Not configured' },
];

const TAX_SETTINGS = [
  { key: 'tax_enabled', label: 'Enable Tax', type: 'boolean' },
  { key: 'tax_rate', label: 'Tax Rate (%)', placeholder: 'e.g. 18 for 18% GST' },
  { key: 'tax_label', label: 'Tax Label', placeholder: 'GST' },
];

const SHIPPING_SETTINGS = [
  { key: 'shipping_enabled', label: 'Enable Shipping', type: 'boolean' },
  { key: 'shipping_rate', label: 'Shipping Rate (paise)', placeholder: 'e.g. 50000 for \u20B9500' },
  { key: 'shipping_method', label: 'Shipping Method', placeholder: 'Standard' },
  { key: 'free_shipping_threshold', label: 'Free Shipping Threshold (paise)', placeholder: 'e.g. 1000000 for \u20B910,000' },
];

function SettingsSection({ title, fields, settings, onChange }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>{title}</h3>
      {fields.map(field => (
        <div key={field.key} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
            {field.label}
          </label>
          {field.type === 'boolean' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={settings[field.key] === 'true'}
                onChange={e => onChange(field.key, e.target.checked ? 'true' : 'false')}
              />
              {settings[field.key] === 'true' ? 'Enabled' : 'Disabled'}
            </label>
          ) : field.multiline ? (
            <textarea
              value={settings[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          ) : (
            <input
              type="text"
              value={settings[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          )}
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
            Key: <code>{field.key}</code> {settings[field.key] ? '' : '(Not configured)'}
          </div>
        </div>
      ))}
    </div>
  );
}

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

  function updateSetting(key, value) {
    setSettings(s => ({ ...s, [key]: value }));
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
        <SettingsSection title="General" fields={GENERAL_SETTINGS} settings={settings} onChange={updateSetting} />
        <SettingsSection title="Support" fields={SUPPORT_SETTINGS} settings={settings} onChange={updateSetting} />
        <SettingsSection title="Business / Legal" fields={BUSINESS_SETTINGS} settings={settings} onChange={updateSetting} />
        <SettingsSection title="Tax Configuration" fields={TAX_SETTINGS} settings={settings} onChange={updateSetting} />
        <SettingsSection title="Shipping Configuration" fields={SHIPPING_SETTINGS} settings={settings} onChange={updateSetting} />
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
        Settings are applied site-wide. Business/legal information is admin-only and never exposed through public APIs. Tax and shipping configurations control order calculation at checkout. Values marked "Not configured" use safe fallbacks (zero tax, unconfigured shipping).
      </div>
    </div>
  );
}
