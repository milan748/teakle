'use client';

import { useState, useEffect } from 'react';

const SECTION_LABELS = {
  hero: 'Hero',
  philosophy: 'Philosophy',
  signature: 'Signature Collection',
  craftsmanship: 'Craftsmanship',
  'workshop-story': 'Workshop Story',
  'process-story': 'Process Story',
};

const SECTION_FIELDS = {
  hero: ['eyebrow', 'title', 'buttonLabel', 'buttonUrl', 'image'],
  philosophy: ['eyebrow', 'title', 'body'],
  signature: ['eyebrow', 'title', 'body', 'buttonLabel', 'buttonUrl', 'image'],
  craftsmanship: ['eyebrow', 'title', 'body', 'buttonLabel', 'buttonUrl', 'image'],
  'workshop-story': ['eyebrow', 'title', 'body', 'buttonLabel', 'buttonUrl', 'image'],
  'process-story': ['eyebrow', 'title', 'body', 'buttonLabel', 'buttonUrl', 'image'],
};

const FIELD_LABELS = {
  eyebrow: 'Eyebrow',
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Body',
  image: 'Image URL',
  mobileImage: 'Mobile Image URL',
  buttonLabel: 'Button Label',
  buttonUrl: 'Button URL',
  sortOrder: 'Sort Order',
  enabled: 'Enabled',
};

export default function HomepageEditor({ page = 'home' }) {
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      const res = await fetch(`/api/admin/content/${page}`);
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch {
      setMessage('Failed to load sections');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(sectionKey) {
    const existing = sections.find(s => s.sectionKey === sectionKey);
    setEditing(sectionKey);
    setForm({
      eyebrow: existing?.eyebrow || '',
      title: existing?.title || '',
      subtitle: existing?.subtitle || '',
      body: existing?.body || '',
      image: existing?.image || '',
      mobileImage: existing?.mobileImage || '',
      buttonLabel: existing?.buttonLabel || '',
      buttonUrl: existing?.buttonUrl || '',
      sortOrder: existing?.sortOrder || 0,
      enabled: existing?.enabled === 1,
    });
    setMessage('');
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setMessage('');
  }

  async function saveSection() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/content/${page}/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => {
          const idx = prev.findIndex(s => s.sectionKey === editing);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.data;
            return next;
          }
          return [...prev, data.data];
        });
        setEditing(null);
        setForm({});
        setMessage('Section saved successfully');
      } else {
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Failed to save section');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading...</div>;
  }

  return (
    <div>
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

      {editing ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              Editing: {SECTION_LABELS[editing]}
            </h3>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#0070f3', textDecoration: 'none' }}
            >
              Preview Homepage
            </a>
          </div>

          {(SECTION_FIELDS[editing] || []).map(field => (
            <div key={field} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
                {FIELD_LABELS[field]}
              </label>
              {field === 'body' ? (
                <textarea
                  value={form[field] || ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              ) : field === 'enabled' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                  />
                  <span style={{ fontSize: '14px' }}>Enabled</span>
                </label>
              ) : field === 'sortOrder' ? (
                <input
                  type="number"
                  value={form.sortOrder || 0}
                  onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  style={{
                    width: '100px',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={form[field] || ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button
              onClick={saveSection}
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
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={cancelEdit}
              style={{
                background: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px 20px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              Homepage Content
            </h3>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#0070f3', textDecoration: 'none' }}
            >
              Preview Homepage
            </a>
          </div>

          {Object.entries(SECTION_LABELS).map(([key, label]) => {
            const section = sections.find(s => s.sectionKey === key);
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
                  {section && (
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                      {section.enabled ? 'Active' : 'Disabled'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => startEdit(key)}
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
