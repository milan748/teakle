'use client';

import { useState, useEffect, useRef } from 'react';
import { adminFetch } from '@/lib/adminApi';

export default function MediaLibrary({ onSelect, onClose }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadMedia(search);
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [search]);

  async function loadMedia(searchQuery = '') {
    setLoading(true);
    try {
      const url = searchQuery ? `/api/admin/media?search=${encodeURIComponent(searchQuery)}` : '/api/admin/media';
      const data = await adminFetch(url);
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

      const data = await adminFetch('/api/admin/media', { method: 'POST', body: formData });
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
      const data = await adminFetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      if (data.success) {
        setMedia(prev => prev.filter(m => m.id !== id));
        if (selectedId === id) setSelectedId(null);
        setMessage('Deleted');
      } else {
        setMessage(data.error || 'Delete failed');
      }
    } catch {
      setMessage('Delete failed');
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function handleSelect() {
    if (!selectedId || !onSelect) return;
    const item = media.find(m => m.id === selectedId);
    if (item) onSelect(item);
  }

  const selected = selectedId ? media.find(m => m.id === selectedId) : null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <div style={{
        background: '#1a1a1a',
        borderRadius: '8px',
        width: '90vw',
        maxWidth: '960px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #333',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #333',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#fff' }}>Media Library</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                background: '#A78659',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '13px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#666',
                padding: '0 4px',
              }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #333' }}>
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#222',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '10px 20px',
            background: message.includes('success') || message.includes('Uploaded') || message.includes('Deleted') ? '#1a3a1a' : '#3a1a1a',
            color: message.includes('success') || message.includes('Uploaded') || message.includes('Deleted') ? '#4caf50' : '#f44336',
            fontSize: '13px',
          }}>
            {message}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : media.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>&#128247;</div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>No images uploaded yet</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: '#A78659',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                Upload your first image
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {media.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  style={{
                    border: selectedId === item.id ? '2px solid #A78659' : '1px solid #333',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: '#222',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    aspectRatio: '1',
                    background: '#1a1a1a',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img
                      src={item.url}
                      alt={item.altText || item.originalName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#ccc',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }} title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                      {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                      {formatSize(item.size)}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        style={{
                          background: '#333',
                          color: '#f44336',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '3px 6px',
                          fontSize: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {onSelect && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {selected ? `Selected: ${selected.originalName}` : 'No image selected'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  background: '#333',
                  color: '#ccc',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedId}
                style={{
                  background: selectedId ? '#A78659' : '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  cursor: selectedId ? 'pointer' : 'not-allowed',
                  opacity: selectedId ? 1 : 0.5,
                }}
              >
                Select
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
