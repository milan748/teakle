'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '@/lib/adminApi';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      const data = await adminFetch(`/api/admin/products?${params}`);
      if (data.success) {
        setProducts(data.data);
        setCategories(data.categories);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  async function fetchProductDetail(id) {
    try {
      const data = await adminFetch(`/api/admin/products/${id}`);
      if (data.success) setSelectedProduct(data.data);
    } catch (err) {
      console.error('Failed to fetch product:', err);
    }
  }

  async function handleSave() {
    if (!selectedProduct) return;
    setSaving(true);
    setMessage(null);
    try {
      const data = await adminFetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          sku: selectedProduct.sku || null,
          active: selectedProduct.active,
          inventoryQuantity: selectedProduct.inventoryQuantity,
        }),
      });
      if (data.success) {
        setMessage({ type: 'success', text: 'Product updated' });
        setSelectedProduct(prev => ({ ...prev, ...data.data }));
        fetchProducts(pagination.page);
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(paise) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise);
  }

  const inputStyle = { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', width: '100%' };
  const labelStyle = { fontSize: '12px', fontWeight: 500, color: '#555', marginBottom: '4px', display: 'block' };
  const sectionStyle = { marginBottom: '20px' };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px' }}>Products</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '220px' }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, width: '160px' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, width: '140px' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Product List */}
        <div style={{ flex: '1 1 60%', minWidth: 0 }}>
          {loading ? (
            <p style={{ color: '#999' }}>Loading...</p>
          ) : products.length === 0 ? (
            <p style={{ color: '#999' }}>No products found</p>
          ) : (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500 }}>Product</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500 }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 500 }}>Price</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 500 }}>SKU</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 500 }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 500 }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => fetchProductDetail(p.id)}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        background: selectedProduct?.id === p.id ? '#f0f7ff' : 'white',
                      }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {p.image && <img src={p.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />}
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            <div style={{ color: '#999', fontSize: '11px' }}>{p.id}{p.isHero ? ' (Hero)' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#666' }}>{p.categoryName}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500 }}>{formatPrice(p.price)}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', color: p.sku ? '#333' : '#ccc' }}>
                        {p.sku || '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: p.active ? '#d4edda' : '#f8d7da',
                          color: p.active ? '#155724' : '#721c24',
                        }}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>
                        {p.inventoryQuantity ?? '∞'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => fetchProducts(p)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: p === pagination.page ? '#1a1a1a' : 'white',
                    color: p === pagination.page ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Detail Panel */}
        <div style={{ flex: '1 1 35%', minWidth: '280px' }}>
          {selectedProduct ? (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{selectedProduct.name}</h3>

              <div style={sectionStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={labelStyle}>Price</span>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{formatPrice(selectedProduct.price)}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Category</span>
                    <div style={{ fontSize: '13px', color: '#666' }}>{selectedProduct.categoryName}</div>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>SKU</label>
                <input
                  type="text"
                  value={selectedProduct.sku || ''}
                  onChange={e => setSelectedProduct(prev => ({ ...prev, sku: e.target.value || null }))}
                  placeholder="e.g. TK-AT-001"
                  maxLength={50}
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Letters, numbers, hyphens, underscores, periods. Max 50 chars.</div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>Status</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedProduct(prev => ({ ...prev, active: true }))}
                    style={{
                      flex: 1, padding: '8px', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
                      background: selectedProduct.active ? '#d4edda' : 'white',
                      borderColor: selectedProduct.active ? '#28a745' : '#ddd',
                      color: selectedProduct.active ? '#155724' : '#666',
                    }}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setSelectedProduct(prev => ({ ...prev, active: false }))}
                    style={{
                      flex: 1, padding: '8px', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
                      background: !selectedProduct.active ? '#f8d7da' : 'white',
                      borderColor: !selectedProduct.active ? '#dc3545' : '#ddd',
                      color: !selectedProduct.active ? '#721c24' : '#666',
                    }}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div style={sectionStyle}>
                <label style={labelStyle}>Inventory Quantity</label>
                <input
                  type="number"
                  value={selectedProduct.inventoryQuantity ?? ''}
                  onChange={e => {
                    const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    setSelectedProduct(prev => ({ ...prev, inventoryQuantity: isNaN(v) ? null : v }));
                  }}
                  placeholder="null = unlimited"
                  min="0"
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Leave empty for unlimited. Hero product should be 1.</div>
              </div>

              {selectedProduct.isHero && (
                <div style={{ padding: '8px 12px', background: '#fff3cd', borderRadius: '4px', fontSize: '12px', color: '#856404', marginBottom: '16px' }}>
                  This is the hero product — limited to 1 per order.
                </div>
              )}

              {message && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginBottom: '12px',
                  background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: message.type === 'success' ? '#155724' : '#721c24',
                }}>
                  {message.text}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '20px', textAlign: 'center', color: '#999' }}>
              Select a product to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
