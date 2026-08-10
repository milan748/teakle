'use client';

import { useState, useEffect, useRef } from 'react';

export default function MediaLibrary({ onSelect, onClose }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingAlt, setEditingAlt] = useState(null);
  const [altValue, setAltValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) setMedia(data.data);
    } catch {
      setMessage('Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', '');

      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMedia(prev => [data.data, ...prev]);
        setMessage('Uploaded successfully');
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this media?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMedia(prev => prev.filter(m => m.id !== id));
        setMessage('Deleted');
      } else {
        setMessage(data.error || 'Delete failed');
      }
    } catch {
      setMessage('Delete failed');
    }
  }

  async function saveAltText(id) {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: altValue }),
      });
      const data = await res.json();
      if (data.success) {
        setMedia(prev => prev.map(m => m.id === id ? { ...m, altText: altValue } : m));
        setEditingAlt(null);
      }
    } catch {
      setMessage('Failed to update alt text');
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(url);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(url);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '8px', width: '90vw', maxWidth: '960px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Media Library</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleUpload} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 14px', fontSize: '13px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#666', padding: '0 4px' }}>
              &times;
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: '10px 20px', background: message.includes('success') || message.includes('Uploaded') || message.includes('Deleted') || message.includes('Copied') ? '#d4edda' : '#f8d7da', color: message.includes('success') || message.includes('Uploaded') || message.includes('Deleted') || message.includes('Copied') ? '#155724' : '#721c24', fontSize: '13px' }}>
            {message}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : media.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No media uploaded yet</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {media.map(item => (
                <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1', background: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.url} alt={item.altText || item.originalName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>
                      {formatSize(item.size)} &middot; {item.mimeType.split('/')[1].toUpperCase()}
                    </div>

                    {editingAlt === item.id ? (
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <input
                          type="text"
                          value={altValue}
                          onChange={e => setAltValue(e.target.value)}
                          placeholder="Alt text"
                          style={{ flex: 1, padding: '3px 6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '11px' }}
                        />
                        <button onClick={() => saveAltText(item.id)} style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer' }}>Save</button>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {onSelect && (
                        <button onClick={() => onSelect(item)} style={{ flex: 1, background: '#0070f3', color: 'white', border: 'none', borderRadius: '3px', padding: '4px 6px', fontSize: '11px', cursor: 'pointer', minWidth: '50px' }}>
                          Select
                        </button>
                      )}
                      <button
                        onClick={() => copyUrl(item.url)}
                        title="Copy URL"
                        style={{ background: copiedId === item.url ? '#d4edda' : '#f0f0f0', color: '#333', border: 'none', borderRadius: '3px', padding: '4px 6px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        {copiedId === item.url ? 'Copied' : 'Copy URL'}
                      </button>
                      <button onClick={() => { setEditingAlt(item.id); setAltValue(item.altText || ''); }} style={{ background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '3px', padding: '4px 6px', fontSize: '11px', cursor: 'pointer' }}>
                        Alt
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: '#fee', color: '#c00', border: 'none', borderRadius: '3px', padding: '4px 6px', fontSize: '11px', cursor: 'pointer' }}>
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
