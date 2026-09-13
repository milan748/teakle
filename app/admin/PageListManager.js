'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/adminApi';

function StatusDot({ status }) {
  const colors = {
    published: '#22c55e',
    draft: '#f59e0b',
    empty: '#9ca3af',
  };
  const labels = {
    published: 'All published',
    draft: 'Has draft changes',
    empty: 'No content',
  };
  return (
    <span
      title={labels[status] || status}
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: colors[status] || '#9ca3af',
        flexShrink: 0,
      }}
    />
  );
}

function CreatePageModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState('');
  const [pageTemplateId, setPageTemplateId] = useState('');
  const [pageTemplates, setPageTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    // Fetch page templates
    adminFetch('/api/admin/templates/pages')
      .then(data => {
        if (data.success) {
          setPageTemplates(data.data || []);
        }
      })
      .catch(() => {});
  }, []);

  function generateSlug(t) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function handleTitleChange(e) {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) {
      setSlug(generateSlug(val));
    }
  }

  function handleSlugChange(e) {
    setSlugEdited(true);
    setSlug(e.target.value);
  }

  async function handleCreate() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!slug.trim()) { setError('Slug is required'); return; }

    setLoading(true);
    setError('');
    try {
      // Create the page first
      await adminFetch('/api/admin/pages', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), template }),
      });
      
      // If a page template was selected, instantiate it
      if (pageTemplateId) {
        await adminFetch(`/api/admin/templates/pages/${pageTemplateId}`, {
          method: 'POST',
          body: JSON.stringify({ page: slug.trim() }),
        });
      }
      
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', padding: '24px',
        width: '440px', maxWidth: '90vw', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Create New Page</h3>

        {error && (
          <div style={{
            padding: '8px 12px', borderRadius: '4px', marginBottom: '16px',
            background: '#fef2f2', color: '#991b1b', fontSize: '13px',
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. About Us"
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
              borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="about-us"
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
              borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
            }}
          />
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
            URL path: /{slug || '...'}
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
            Page Type (optional)
          </label>
          <select
            value={template}
            onChange={e => setTemplate(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
              borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
            }}
          >
            <option value="">None</option>
            <option value="homepage">Homepage</option>
            <option value="studio">Studio</option>
            <option value="contact">Contact</option>
            <option value="trade">Trade</option>
            <option value="custom">Custom Orders</option>
            <option value="journal">Journal</option>
            <option value="archive">Archive</option>
          </select>
        </div>

        {pageTemplates.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#333' }}>
              Start from Template (optional)
            </label>
            <select
              value={pageTemplateId}
              onChange={e => setPageTemplateId(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', border: '1px solid #d1d5db',
                borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
              }}
            >
              <option value="">Blank Page</option>
              {pageTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
              Pre-populate with sections from a saved template
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', background: 'white', color: '#333',
              border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px',
              cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              padding: '8px 16px', background: '#1a1a1a', color: 'white',
              border: 'none', borderRadius: '4px', fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >{loading ? 'Creating...' : 'Create Page'}</button>
        </div>
      </div>
    </div>
  );
}

export default function PageListManager({ onNavigateToEditor }) {
  const [pages, setPages] = useState([]);
  const [stats, setStats] = useState({ totalPages: 0, totalSections: 0, mediaCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function fetchPages() {
    setLoading(true);
    try {
      const data = await adminFetch('/api/admin/pages');
      if (data.success) {
        setPages(data.data.pages);
        setStats(data.data.stats);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPages(); }, []);

  async function handleDelete(slug) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      await adminFetch(`/api/admin/pages/${slug}`, { method: 'DELETE' });
      await fetchPages();
    } catch (err) {
      alert(err.message || 'Failed to delete page');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading pages...</div>;
  }

  return (
    <div>
      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Pages', value: stats.totalPages, color: '#1a1a1a' },
          { label: 'Total Sections', value: stats.totalSections, color: '#1a1a1a' },
          { label: 'Media Items', value: stats.mediaCount, color: '#1a1a1a' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '8px', padding: '16px 20px',
            border: '1px solid #eee', minWidth: '140px',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '2px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Pages</h2>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: '8px 16px', background: '#1a1a1a', color: 'white',
            border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer',
          }}
        >+ Create Page</button>
      </div>

      {/* Page List */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 140px 160px',
          padding: '12px 16px', borderBottom: '1px solid #eee',
          fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Page</span>
          <span>Slug</span>
          <span>Sections</span>
          <span>Status</span>
          <span>Last Modified</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Page Rows */}
        {pages.map(page => (
          <div
            key={page.slug}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 140px 160px',
              padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
              alignItems: 'center', fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: 500 }}>{page.title}</div>
            <div style={{ color: '#666', fontSize: '13px' }}>/{page.slug}</div>
            <div style={{ color: '#666' }}>{page.sectionCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StatusDot status={page.pageStatus} />
              <span style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>
                {page.pageStatus}
              </span>
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              }) : '—'}
            </div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              <a
                href={`/admin/editor/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '4px 10px', background: '#f0f0f0', color: '#333',
                  border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px',
                  textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >Edit</a>
              <a
                href={`/${page.slug === 'home' ? '' : page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '4px 10px', background: 'white', color: '#0070f3',
                  border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px',
                  textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >Preview</a>
              <button
                onClick={() => handleDelete(page.slug)}
                disabled={deleting === page.slug}
                style={{
                  padding: '4px 10px', background: 'white', color: '#dc3545',
                  border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12px',
                  cursor: deleting === page.slug ? 'not-allowed' : 'pointer',
                  opacity: deleting === page.slug ? 0.5 : 1, whiteSpace: 'nowrap',
                }}
              >Delete</button>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
            No pages found
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreate && (
        <CreatePageModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchPages(); }}
        />
      )}
    </div>
  );
}
