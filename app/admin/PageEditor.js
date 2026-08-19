'use client';

import { useState, useEffect } from 'react';
import MediaLibrary from './MediaLibrary';
import { adminFetch } from '@/lib/adminApi';

const ALL_FIELDS = [
  'eyebrow', 'title', 'subtitle', 'body',
  'image', 'mobileImage',
  'buttonLabel', 'buttonUrl',
];

const FIELD_LABELS = {
  eyebrow: 'Eyebrow',
  title: 'Title',
  subtitle: 'Subtitle',
  body: 'Body',
  image: 'Desktop Image',
  mobileImage: 'Mobile Image',
  buttonLabel: 'Button Label',
  buttonUrl: 'Button URL',
};

function getStatus(section) {
  if (!section) return { label: 'Using fallback', color: '#6c757d', dot: '#6c757d' };
  const hasDraft = section.status === 'draft';
  if (hasDraft && section.enabled) return { label: 'Published + draft', color: '#e67e22', dot: '#e67e22' };
  if (hasDraft && !section.enabled) return { label: 'Draft changes', color: '#e67e22', dot: '#e67e22' };
  if (section.enabled) return { label: 'Published', color: '#28a745', dot: '#28a745' };
  return { label: 'Disabled', color: '#dc3545', dot: '#dc3545' };
}

function hasDraftChanges(section) {
  if (!section) return false;
  return section.status === 'draft';
}

export default function PageEditor({ page, sectionLabels, backLabel }) {
  const [sections, setSections] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [mediaField, setMediaField] = useState(null);

  useEffect(() => {
    fetchSections();
  }, [page]);

  async function fetchSections() {
    setLoading(true);
    try {
      const data = await adminFetch(`/api/admin/content/${page}`);
      if (data.success) setSections(data.data);
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
      enabled: existing ? existing.enabled === 1 : true,
    });
    setMessage('');
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setMessage('');
  }

  async function saveDraft() {
    setSaving(true);
    setMessage('');
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${editing}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
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
        setMessage('Draft saved.');
      } else {
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Failed to save draft');
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    setMessage('');
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${editing}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'publish' }),
      });
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
        setMessage('Published successfully.');
      } else {
        setMessage(data.error || 'Failed to publish');
      }
    } catch {
      setMessage('Failed to publish');
    } finally {
      setSaving(false);
    }
  }

  async function discardDraft() {
    setSaving(true);
    setMessage('');
    try {
      const data = await adminFetch(`/api/admin/content/${page}/${editing}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'discard' }),
      });
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
        setForm({
          eyebrow: data.data.eyebrow || '',
          title: data.data.title || '',
          subtitle: data.data.subtitle || '',
          body: data.data.body || '',
          image: data.data.image || '',
          mobileImage: data.data.mobileImage || '',
          buttonLabel: data.data.buttonLabel || '',
          buttonUrl: data.data.buttonUrl || '',
          enabled: data.data.enabled === 1,
        });
        setMessage('Draft discarded.');
      } else {
        setMessage(data.error || 'Failed to discard');
      }
    } catch {
      setMessage('Failed to discard draft');
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
          background: message.includes('success') || message.includes('saved') || message.includes('discarded') ? '#d4edda' : '#f8d7da',
          color: message.includes('success') || message.includes('saved') || message.includes('discarded') ? '#155724' : '#721c24',
          fontSize: '14px',
        }}>
          {message}
        </div>
      )}

      {mediaField && (
        <MediaLibrary
          onSelect={(item) => {
            setForm(f => ({ ...f, [mediaField]: item.url }));
            setMediaField(null);
          }}
          onClose={() => setMediaField(null)}
        />
      )}

      {editing ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={cancelEdit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666', padding: '0' }}
              >
                &larr;
              </button>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                {sectionLabels[editing]}
              </h3>
              {(() => {
                const section = sections.find(s => s.sectionKey === editing);
                const status = getStatus(section);
                return (
                  <span style={{ fontSize: '11px', fontWeight: 500, color: status.color, background: status.color + '15', padding: '2px 8px', borderRadius: '10px' }}>
                    {status.label}
                  </span>
                );
              })()}
            </div>
            <a href={`/${page === 'home' ? '' : page}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0070f3', textDecoration: 'none' }}>
              View live
            </a>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
              />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Enabled</span>
            </label>
          </div>

          {ALL_FIELDS.map(field => (
            <div key={field} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
                {FIELD_LABELS[field]}
              </label>
              {field === 'body' || field === 'subtitle' ? (
                <textarea
                  value={form[field] || ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  rows={field === 'body' ? 6 : 3}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
              ) : (field === 'image' || field === 'mobileImage') ? (
                <div>
                  {form[field] && (
                    <div style={{ marginBottom: '8px', border: '1px solid #eee', borderRadius: '4px', padding: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fafafa' }}>
                      <img src={form[field]} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '3px', background: '#f0f0f0' }} />
                      <span style={{ fontSize: '12px', color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form[field]}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, [field]: '' }))} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={form[field] || ''}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder="Paste URL or select from media"
                      style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setMediaField(field)} style={{ background: '#f0f0f0', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Choose from Media Library
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={form[field] || ''}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button onClick={saveDraft} disabled={saving} style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 20px', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={publish} disabled={saving} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 20px', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              Publish
            </button>
            {hasDraftChanges(sections.find(s => s.sectionKey === editing)) && (
              <button onClick={discardDraft} disabled={saving} style={{ background: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', padding: '8px 20px', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                Discard Draft
              </button>
            )}
            <button onClick={cancelEdit} style={{ background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 20px', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              {backLabel || page.charAt(0).toUpperCase() + page.slice(1)} Content
            </h3>
            <a href={`/${page === 'home' ? '' : page}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0070f3', textDecoration: 'none' }}>
              View live
            </a>
          </div>

          {Object.entries(sectionLabels).map(([key, label]) => {
            const section = sections.find(s => s.sectionKey === key);
            const status = getStatus(section);
            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: status.color, background: status.color + '15', padding: '2px 8px', borderRadius: '10px' }}>
                    {status.label}
                  </span>
                </div>
                <button onClick={() => startEdit(key)} style={{ background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 12px', fontSize: '13px', cursor: 'pointer' }}>
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
