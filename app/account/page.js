'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { id: 'orders', label: 'My Orders', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'wishlist', label: 'Wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'recent', label: 'Recently Viewed', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id: 'addresses', label: 'Saved Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'details', label: 'Account Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'support', label: 'Support', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editField, setEditField] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', dob: '' });
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', pin: '', phone: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const t = window.Teakle;
    if (!t || !t.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }
    const u = t.getCurrentUser();
    setUser(u);
    setProfileForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', dob: u.dob || '' });
    setWishlist(t.getWishlist());
    setCart(t.getCart());
    try { setRecentlyViewed(JSON.parse(localStorage.getItem('teakle_recently_viewed') || '[]')); } catch { setRecentlyViewed([]); }
    try { setAddresses(JSON.parse(localStorage.getItem('teakle_addresses') || '[]')); } catch { setAddresses([]); }
    try {
      const stored = JSON.parse(localStorage.getItem('teakle_notifications') || '[]');
      if (stored.length === 0) {
        setNotifications([
          { id: 1, title: 'Welcome to Teakle', desc: 'Your collection awaits. Explore handcrafted pieces made with care.', time: 'Just now', read: false },
          { id: 2, title: 'Order Confirmed', desc: 'Your Anchor Table order has been confirmed. We\'ll share dispatch details soon.', time: '2 days ago', read: false },
          { id: 3, title: 'Craft Care Reminder', desc: 'Monthly care tips for your walnut pieces are available in your guide.', time: '1 week ago', read: true },
        ]);
      } else {
        setNotifications(stored);
      }
    } catch { setNotifications([]); }
  }, []);

  const logout = useCallback(() => {
    if (window.Teakle) window.Teakle.logout();
    window.location.href = '/login';
  }, []);

  function saveAddresses(addrs) {
    setAddresses(addrs);
    localStorage.setItem('teakle_addresses', JSON.stringify(addrs));
  }

  function removeFromWishlist(id) {
    const t = window.Teakle;
    t.toggleWishlist({ id });
    setWishlist(t.getWishlist());
  }

  function moveToCart(item) {
    const t = window.Teakle;
    t.addToCart(item);
    t.toggleWishlist(item);
    setWishlist(t.getWishlist());
    setCart(t.getCart());
  }

  function saveProfile() {
    const t = window.Teakle;
    const u = t.getCurrentUser();
    u.name = profileForm.name;
    u.phone = profileForm.phone;
    u.dob = profileForm.dob;
    localStorage.setItem('teakle_currentUser', JSON.stringify(u));
    setUser({ ...u });
    setEditField(null);
  }

  function markNotificationRead(id) {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('teakle_notifications', JSON.stringify(updated));
      return updated;
    });
  }

  if (!user) return null;

  const orders = [
    { id: 'TK-2026-001', product: 'The Anchor Table', image: 'https://images.pexels.com/photos/11112739/pexels-photo-11112739.jpeg?auto=compress&cs=tinysrgb&w=300', status: 'Confirmed', delivery: 'Awaiting dispatch', price: '₹1,85,000' },
    { id: 'TK-2026-002', product: 'Walnut Serving Board', image: 'https://images.pexels.com/photos/5974275/pexels-photo-5974275.jpeg?auto=compress&cs=tinysrgb&w=300', status: 'Delivered', delivery: 'Delivered Jan 15', price: '₹4,200' },
  ];

  const stats = [
    { label: 'Current Orders', value: orders.filter(o => o.status !== 'Delivered').length, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Wishlist Items', value: wishlist.length, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Cart Items', value: cart.length, icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
    { label: 'Saved Addresses', value: addresses.length, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  function renderContent() {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'wishlist': return renderWishlist();
      case 'recent': return renderRecent();
      case 'addresses': return renderAddresses();
      case 'details': return renderDetails();
      case 'security': return renderSecurity();
      case 'notifications': return renderNotifications();
      case 'support': return renderSupport();
      default: return renderOverview();
    }
  }

  function renderOverview() {
    return (
      <div className="acct-section" key="overview">
        <h2 className="acct-section-title">Dashboard</h2>
        <div className="acct-stats">
          {stats.map((s, i) => (
            <div className="acct-stat-card" key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon}/></svg>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid rgba(167,134,89,0.15)', background: 'rgba(167,134,89,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--text-primary)' }}>You have {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', opacity: 0.7 }}>Complete your purchase before these pieces are reserved.</p>
            </div>
            <Link href="/cart" className="acct-btn-sm" style={{ textDecoration: 'none' }}>View Cart</Link>
          </div>
        )}

        <h3 className="acct-subtitle">Recent Orders</h3>
        {orders.length === 0 ? (
          <div className="acct-empty">
            <div className="empty-illustration">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              <div className="empty-line"></div>
            </div>
            <p className="empty-heading">No orders yet</p>
            <p className="empty-desc">Your collection begins with a single piece.</p>
            <Link href="/gallery" className="acct-cta">Explore the Collection</Link>
          </div>
        ) : (
          <div className="acct-orders-list">
            {orders.slice(0, 2).map((o, i) => (
              <div className="acct-order-card" key={o.id} style={{ animationDelay: `${(i + 4) * 80}ms` }}>
                <img src={o.image} alt={o.product} className="order-img" loading="lazy" />
                <div className="order-info">
                  <div className="order-name">{o.product}</div>
                  <div className="order-meta">{o.id} · {o.price}</div>
                  <div className={`order-status ${o.status === 'Delivered' ? 'is-delivered' : ''}`}>{o.status}</div>
                  <div className="order-delivery">{o.delivery}</div>
                </div>
                <div className="order-actions">
                  <button className="acct-btn-sm">View Details</button>
                  {o.status !== 'Delivered' && <button className="acct-btn-sm acct-btn-outline">Track Order</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="acct-section" key="orders">
        <h2 className="acct-section-title">My Orders</h2>
        {orders.length === 0 ? (
          <div className="acct-empty">
            <div className="empty-illustration">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              <div className="empty-line"></div>
            </div>
            <p className="empty-heading">No orders to display</p>
            <p className="empty-desc">Discover handcrafted pieces made to last generations.</p>
            <Link href="/gallery" className="acct-cta">Start Shopping</Link>
          </div>
        ) : (
          <div className="acct-orders-list">
            {orders.map((o, i) => (
              <div className="acct-order-card" key={o.id} style={{ animationDelay: `${i * 80}ms` }}>
                <img src={o.image} alt={o.product} className="order-img" loading="lazy" />
                <div className="order-info">
                  <div className="order-name">{o.product}</div>
                  <div className="order-meta">{o.id} · {o.price}</div>
                  <div className={`order-status ${o.status === 'Delivered' ? 'is-delivered' : ''}`}>{o.status}</div>
                  <div className="order-delivery">{o.delivery}</div>
                </div>
                <div className="order-actions">
                  <button className="acct-btn-sm">View Details</button>
                  {o.status !== 'Delivered' && <button className="acct-btn-sm acct-btn-outline">Track Order</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderWishlist() {
    return (
      <div className="acct-section" key="wishlist">
        <h2 className="acct-section-title">Wishlist</h2>
        {wishlist.length === 0 ? (
          <div className="acct-empty">
            <div className="empty-illustration">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <div className="empty-line"></div>
            </div>
            <p className="empty-heading">Your wishlist is waiting</p>
            <p className="empty-desc">Explore handcrafted collections curated for you.</p>
            <Link href="/gallery" className="acct-cta">Explore Collections</Link>
          </div>
        ) : (
          <div className="acct-wishlist-grid">
            {wishlist.map((item, i) => (
              <div className="acct-wish-card" key={item.id} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="wish-img-wrap">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <div className="wish-overlay">
                    <button onClick={() => moveToCart(item)} className="wish-action">Move to Cart</button>
                    <button onClick={() => removeFromWishlist(item.id)} className="wish-action wish-remove">Remove</button>
                  </div>
                </div>
                <div className="wish-info">
                  <div className="wish-name">{item.name}</div>
                  <div className="wish-price">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderRecent() {
    return (
      <div className="acct-section" key="recent">
        <h2 className="acct-section-title">Recently Viewed</h2>
        {recentlyViewed.length === 0 ? (
          <div className="acct-empty">
            <div className="empty-illustration">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <div className="empty-line"></div>
            </div>
            <p className="empty-heading">Nothing viewed yet</p>
            <p className="empty-desc">Begin discovering pieces that speak to you.</p>
            <Link href="/gallery" className="acct-cta">Browse the Collection</Link>
          </div>
        ) : (
          <div className="acct-scroll-row">
            {recentlyViewed.map((item, i) => (
              <Link href={`/shop/${item.id}`} className="acct-scroll-card" key={item.id} style={{ animationDelay: `${i * 80}ms` }}>
                <img src={item.image} alt={item.name} loading="lazy" />
                <div className="scroll-card-name">{item.name}</div>
                <div className="scroll-card-price">{item.price}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderAddresses() {
    function addAddress(e) {
      e.preventDefault();
      const addr = { ...newAddress, id: Date.now(), isDefault: addresses.length === 0 };
      saveAddresses([...addresses, addr]);
      setNewAddress({ label: '', street: '', city: '', state: '', pin: '', phone: '' });
      setShowAddressForm(false);
    }
    function removeAddress(id) {
      saveAddresses(addresses.filter(a => a.id !== id));
    }
    function setDefault(id) {
      saveAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    }

    return (
      <div className="acct-section" key="addresses">
        <div className="acct-section-header">
          <h2 className="acct-section-title">Saved Addresses</h2>
          <button className="acct-btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}>
            {showAddressForm ? 'Cancel' : '+ Add Address'}
          </button>
        </div>

        {showAddressForm && (
          <form className="acct-address-form" onSubmit={addAddress}>
            <div className="acct-form-row">
              <input type="text" placeholder="Label (e.g. Home, Office)" required value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} />
            </div>
            <div className="acct-form-row">
              <input type="text" placeholder="Street address" required value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
            </div>
            <div className="acct-form-grid">
              <input type="text" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
              <input type="text" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
              <input type="text" placeholder="PIN code" required value={newAddress.pin} onChange={e => setNewAddress({ ...newAddress, pin: e.target.value })} />
              <input type="tel" placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
            </div>
            <button type="submit" className="acct-btn-sm">Save Address</button>
          </form>
        )}

        {addresses.length === 0 && !showAddressForm ? (
          <div className="acct-empty">
            <div className="empty-illustration">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <div className="empty-line"></div>
            </div>
            <p className="empty-heading">No saved addresses</p>
            <p className="empty-desc">Add an address for seamless deliveries.</p>
            <button className="acct-cta" onClick={() => setShowAddressForm(true)}>Add Your First Address</button>
          </div>
        ) : (
          <div className="acct-address-list">
            {addresses.map((a, i) => (
              <div className="acct-address-card" key={a.id} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="addr-header">
                  <span className="addr-label">{a.label}</span>
                  {a.isDefault && <span className="addr-default">Default</span>}
                </div>
                <p className="addr-text">{a.street}<br/>{a.city}, {a.state} {a.pin}</p>
                {a.phone && <p className="addr-phone">{a.phone}</p>}
                <div className="addr-actions">
                  {!a.isDefault && <button onClick={() => setDefault(a.id)} className="acct-link">Set Default</button>}
                  <button onClick={() => removeAddress(a.id)} className="acct-link acct-link-danger">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderDetails() {
    return (
      <div className="acct-section" key="details">
        <h2 className="acct-section-title">Account Details</h2>
        <div className="acct-detail-card">
          <div className="detail-row">
            <span className="detail-label">Name</span>
            {editField === 'name' ? (
              <div className="detail-edit">
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                <button onClick={saveProfile} className="acct-btn-sm">Save</button>
                <button onClick={() => setEditField(null)} className="acct-btn-sm acct-btn-outline">Cancel</button>
              </div>
            ) : (
              <div className="detail-value-row">
                <span className="detail-value">{profileForm.name}</span>
                <button onClick={() => setEditField('name')} className="acct-link">Edit</button>
              </div>
            )}
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <div className="detail-value-row">
              <span className="detail-value">{profileForm.email}</span>
              <span className="detail-badge">Verified</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            {editField === 'phone' ? (
              <div className="detail-edit">
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Not set" />
                <button onClick={saveProfile} className="acct-btn-sm">Save</button>
                <button onClick={() => setEditField(null)} className="acct-btn-sm acct-btn-outline">Cancel</button>
              </div>
            ) : (
              <div className="detail-value-row">
                <span className="detail-value">{profileForm.phone || 'Not set'}</span>
                <button onClick={() => setEditField('phone')} className="acct-link">Edit</button>
              </div>
            )}
          </div>
          <div className="detail-row">
            <span className="detail-label">Date of Birth</span>
            {editField === 'dob' ? (
              <div className="detail-edit">
                <input type="date" value={profileForm.dob} onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })} />
                <button onClick={saveProfile} className="acct-btn-sm">Save</button>
                <button onClick={() => setEditField(null)} className="acct-btn-sm acct-btn-outline">Cancel</button>
              </div>
            ) : (
              <div className="detail-value-row">
                <span className="detail-value">{profileForm.dob || 'Not set'}</span>
                <button onClick={() => setEditField('dob')} className="acct-link">Edit</button>
              </div>
            )}
          </div>
          <div className="detail-row">
            <span className="detail-label">Password</span>
            <div className="detail-value-row">
              <span className="detail-value">{'•'.repeat(8)}</span>
              <button onClick={() => setEditField(editField === 'password' ? null : 'password')} className="acct-link">Change</button>
            </div>
            {editField === 'password' && (
              <div className="detail-edit detail-edit-stack">
                <input type="password" placeholder="Current password" />
                <input type="password" placeholder="New password" />
                <input type="password" placeholder="Confirm new password" />
                <button onClick={() => setEditField(null)} className="acct-btn-sm" disabled title="Requires Shopify customer accounts">Update Password</button>
              </div>
            )}
          </div>
          <div className="detail-row">
            <span className="detail-label">Newsletter</span>
            <label className="acct-toggle">
              <input type="checkbox" defaultChecked disabled title="Requires Shopify customer accounts" />
              <span className="toggle-slider"></span>
              <span className="toggle-text">Receive workshop updates</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  function renderSecurity() {
    return (
      <div className="acct-section" key="security">
        <h2 className="acct-section-title">Security</h2>
        <div className="acct-detail-card">
          <div className="detail-row">
            <span className="detail-label">Password</span>
            <div className="detail-value-row">
              <span className="detail-value">Last changed 30 days ago</span>
              <button className="acct-link" disabled title="Requires Shopify customer accounts">Change</button>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Two-Factor Auth</span>
            <div className="detail-value-row">
              <span className="detail-value">Not enabled</span>
              <button className="acct-link" disabled title="Requires Shopify customer accounts">Enable</button>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Active Sessions</span>
            <div className="detail-value-row">
              <span className="detail-value">1 active session</span>
              <button className="acct-link acct-link-danger" disabled title="Requires Shopify customer accounts">Sign Out All</button>
            </div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', opacity: 0.7 }}>Security features require Shopify customer account integration.</p>
        </div>
      </div>
    );
  }

  function renderNotifications() {
    const unread = notifications.filter(n => !n.read).length;
    return (
      <div className="acct-section" key="notifications">
        <div className="acct-section-header">
          <h2 className="acct-section-title">Notifications</h2>
          {unread > 0 && <span className="notif-badge">{unread} new</span>}
        </div>
        {notifications.length === 0 ? (
          <div className="acct-empty">
            <div className="empty-illustration">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <div className="empty-line"></div>
            </div>
            <p className="empty-heading">All caught up</p>
            <p className="empty-desc">No new notifications at this time.</p>
          </div>
        ) : (
          <div className="acct-notif-list">
            {notifications.map((n, i) => (
              <div
                className={`acct-notif-item ${n.read ? '' : 'is-unread'}`}
                key={n.id}
                style={{ animationDelay: `${i * 80}ms` }}
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="notif-dot"></div>
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-desc">{n.desc}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderSupport() {
    const items = [
      { id: 'contact', title: 'Contact Support', desc: 'Reach our team directly for any questions.', href: '/contact' },
      { id: 'faq', title: 'FAQ', desc: 'Answers to common questions about orders, shipping, and care.' },
      { id: 'shipping', title: 'Shipping Information', desc: 'Details on delivery timelines, packaging, and international shipping.' },
      { id: 'returns', title: 'Returns & Exchanges', desc: 'Our policy on returns, exchanges, and manufacturing defects.' },
      { id: 'care', title: 'Craft Care Guide', desc: 'How to maintain your Teakle pieces for generations.' },
    ];

    return (
      <div className="acct-section" key="support">
        <h2 className="acct-section-title">Support</h2>
        <div className="acct-support-list">
          {items.map((item, i) => (
            <div className="acct-support-item" key={item.id} style={{ animationDelay: `${i * 80}ms` }}>
              {item.href ? (
                <Link href={item.href} className="support-link">
                  <div className="support-title">{item.title}</div>
                  <div className="support-desc">{item.desc}</div>
                </Link>
              ) : (
                <div className="support-link">
                  <div className="support-title">{item.title}</div>
                  <div className="support-desc">{item.desc}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ============================================
           ACCOUNT — Private Members' Lounge
           ============================================ */

        .acct-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg-primary);
          display: flex;
          position: relative;
        }

        /* Subtle wood grain texture */
        .acct-page::before {
          content: '';
          position: fixed;
          inset: 0;
          opacity: 0.02;
          pointer-events: none;
          z-index: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(43,34,27,0.12) 2px,
            rgba(43,34,27,0.12) 3px
          );
        }

        /* Warm ambient glow */
        .acct-page::after {
          content: '';
          position: fixed;
          top: -30%;
          right: -20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse at center, rgba(167,134,89,0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* --- Sidebar --- */
        .acct-sidebar {
          width: 260px;
          min-height: 100vh;
          border-right: 1px solid rgba(43,34,27,0.06);
          padding: 2.5rem 0 2rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          flex-shrink: 0;
          background: var(--bg-primary);
          z-index: 1;
          animation: acctFadeIn 600ms var(--ease) both;
        }

        @keyframes acctFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .acct-sidebar-brand {
          padding: 0 1.75rem 1.75rem;
          margin-bottom: 0.5rem;
        }

        .acct-sidebar-brand a { text-decoration: none; display: inline-block; }
        .acct-sidebar-brand img { height: 22px; opacity: 0.55; transition: opacity 300ms var(--ease); }
        .acct-sidebar-brand img:hover { opacity: 0.8; }

        .acct-nav-label {
          font-size: 0.55rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 0 1.75rem;
          margin-bottom: 0.5rem;
          opacity: 0.6;
          font-weight: 500;
        }

        .acct-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1.75rem;
          font-size: var(--text-caption);
          letter-spacing: 0.03em;
          color: var(--text-secondary);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: var(--font-body);
          transition: color 250ms var(--ease), background 250ms var(--ease);
          position: relative;
        }

        .acct-nav-item:hover { color: var(--text-primary); background: rgba(43,34,27,0.015); }

        .acct-nav-item.is-active {
          color: var(--text-primary);
          font-weight: 500;
        }

        .acct-nav-item.is-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 18%;
          height: 64%;
          width: 2px;
          background: var(--bronze);
          border-radius: 0 1px 1px 0;
          animation: navIndicator 300ms var(--ease) both;
        }

        @keyframes navIndicator {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        .acct-nav-item svg { width: 17px; height: 17px; flex-shrink: 0; opacity: 0.5; transition: opacity 250ms var(--ease); }
        .acct-nav-item.is-active svg { opacity: 1; }

        .acct-nav-divider {
          height: 1px;
          background: rgba(43,34,27,0.05);
          margin: 0.75rem 1.75rem;
        }

        .acct-nav-logout { color: var(--text-secondary); }
        .acct-nav-logout:hover { color: #8B6B4A; }

        /* --- Main Content --- */
        .acct-main {
          flex: 1;
          min-width: 0;
          padding: 2.5rem 3.5rem;
          position: relative;
          z-index: 1;
        }

        /* --- Header --- */
        .acct-header {
          margin-bottom: 3rem;
          animation: acctSlideUp 600ms var(--ease) 100ms both;
        }

        @keyframes acctSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .acct-greeting {
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          opacity: 0.7;
        }

        .acct-header-row {
          display: flex;
          align-items: center;
          gap: 1.125rem;
          margin-bottom: 0.625rem;
        }

        .acct-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(167,134,89,0.08) 0%, rgba(167,134,89,0.04) 100%);
          border: 1px solid rgba(167,134,89,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--bronze);
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .acct-member-name {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 2.5vw, var(--text-h2));
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
          max-width: none;
          letter-spacing: -0.01em;
        }

        .acct-header-sub {
          font-size: var(--text-body);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
          opacity: 0.75;
        }

        /* --- Section --- */
        .acct-section {
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .acct-section-title {
          font-family: var(--font-display);
          font-size: var(--text-subhead);
          font-weight: 500;
          color: var(--text-primary);
          margin: 0 0 1.5rem;
          max-width: none;
          letter-spacing: -0.005em;
        }

        .acct-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .acct-section-header .acct-section-title { margin: 0; }

        .acct-subtitle {
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin: 2.5rem 0 1rem;
          font-weight: 500;
          max-width: none;
          opacity: 0.7;
        }

        /* --- Stats Grid --- */
        .acct-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .acct-stat-card {
          background: var(--bg-secondary);
          padding: 1.375rem;
          border: 1px solid rgba(43,34,27,0.04);
          transition: transform 300ms var(--ease), box-shadow 300ms var(--ease);
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .acct-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(43,34,27,0.06);
        }

        .stat-icon {
          color: var(--bronze);
          opacity: 0.5;
          margin-bottom: 0.875rem;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: var(--text-h2);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.6rem;
          color: var(--text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        /* --- Order Cards --- */
        .acct-orders-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .acct-order-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem;
          border: 1px solid rgba(43,34,27,0.05);
          transition: transform 250ms var(--ease), box-shadow 250ms var(--ease);
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .acct-order-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(43,34,27,0.05);
        }

        .order-img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .order-info { flex: 1; min-width: 0; }

        .order-name {
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .order-meta {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          margin-bottom: 0.3rem;
          opacity: 0.7;
        }

        .order-status {
          display: inline-block;
          font-size: 0.55rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          background: rgba(167,134,89,0.08);
          color: var(--bronze);
          font-weight: 500;
          margin-bottom: 0.2rem;
        }

        .order-status.is-delivered {
          background: rgba(29,53,40,0.06);
          color: var(--forest);
        }

        .order-delivery {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          opacity: 0.65;
        }

        .order-actions {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        /* --- Buttons --- */
        .acct-btn-sm {
          font-family: var(--font-body);
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.5rem 1.125rem;
          background: var(--walnut);
          color: var(--bg-primary);
          border: 1px solid var(--walnut);
          cursor: pointer;
          transition: background 250ms var(--ease), transform 200ms var(--ease);
          white-space: nowrap;
        }

        .acct-btn-sm:hover { background: #3d2e23; }
        .acct-btn-sm:active { transform: scale(0.97); }

        .acct-btn-outline {
          background: transparent;
          color: var(--text-secondary);
          border-color: rgba(43,34,27,0.12);
        }

        .acct-btn-outline:hover {
          background: rgba(43,34,27,0.03);
          color: var(--text-primary);
        }

        .acct-link {
          font-size: var(--text-caption);
          color: var(--bronze);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          padding: 0;
          transition: opacity 200ms var(--ease);
        }

        .acct-link:hover { opacity: 0.7; }
        .acct-link-danger { color: #8B6B4A; }

        .acct-cta {
          display: inline-block;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--bg-primary);
          background: var(--walnut);
          padding: 0.7rem 1.75rem;
          text-decoration: none;
          transition: background 250ms var(--ease), transform 200ms var(--ease);
        }

        .acct-cta:hover { background: #3d2e23; transform: translateY(-1px); }

        /* --- Empty States --- */
        .acct-empty {
          text-align: center;
          padding: 3.5rem 1rem;
          color: var(--text-secondary);
        }

        .empty-illustration {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon { opacity: 0.2; }

        .empty-line {
          width: 32px;
          height: 1px;
          background: var(--bronze);
          opacity: 0.25;
          margin-top: 1rem;
        }

        .empty-heading {
          font-family: var(--font-display);
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
          max-width: none;
        }

        .empty-desc {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          opacity: 0.7;
          max-width: none;
        }

        /* --- Wishlist Grid --- */
        .acct-wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .acct-wish-card {
          border: 1px solid rgba(43,34,27,0.05);
          overflow: hidden;
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .wish-img-wrap {
          position: relative;
          aspect-ratio: 3/4;
          overflow: hidden;
        }

        .wish-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms var(--ease);
        }

        .acct-wish-card:hover .wish-img-wrap img { transform: scale(1.04); }

        .wish-overlay {
          position: absolute;
          inset: 0;
          background: rgba(43,34,27,0.55);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 350ms var(--ease);
        }

        .acct-wish-card:hover .wish-overlay { opacity: 1; }

        .wish-action {
          font-family: var(--font-body);
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.5rem 1.125rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          border: none;
          cursor: pointer;
          transition: background 250ms var(--ease);
          min-width: 120px;
          text-align: center;
        }

        .wish-action:hover { background: #fff; }

        .wish-remove {
          background: transparent;
          color: var(--bg-primary);
          border: 1px solid rgba(247,244,238,0.35);
        }

        .wish-remove:hover { background: rgba(247,244,238,0.08); }

        .wish-info { padding: 0.75rem; }

        .wish-name {
          font-size: var(--text-caption);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .wish-price {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          opacity: 0.7;
        }

        /* --- Scroll Row --- */
        .acct-scroll-row {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none;
        }

        .acct-scroll-row::-webkit-scrollbar { display: none; }

        .acct-scroll-card {
          flex-shrink: 0;
          width: 180px;
          text-decoration: none;
          border: 1px solid rgba(43,34,27,0.05);
          overflow: hidden;
          transition: transform 250ms var(--ease), box-shadow 250ms var(--ease);
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .acct-scroll-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(43,34,27,0.06);
        }

        .acct-scroll-card img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }

        .scroll-card-name {
          padding: 0.5rem 0.75rem 0.15rem;
          font-size: var(--text-caption);
          font-weight: 500;
          color: var(--text-primary);
        }

        .scroll-card-price {
          padding: 0 0.75rem 0.5rem;
          font-size: var(--text-caption);
          color: var(--text-secondary);
          opacity: 0.7;
        }

        /* --- Address Cards --- */
        .acct-address-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .acct-address-card {
          padding: 1.125rem;
          border: 1px solid rgba(43,34,27,0.05);
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .addr-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .addr-label { font-size: var(--text-body); font-weight: 500; color: var(--text-primary); }

        .addr-default {
          font-size: 0.5rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          background: rgba(167,134,89,0.08);
          color: var(--bronze);
        }

        .addr-text { font-size: var(--text-body); color: var(--text-secondary); line-height: var(--lh-relaxed); margin: 0 0 0.3rem; }
        .addr-phone { font-size: var(--text-caption); color: var(--text-secondary); margin: 0 0 0.5rem; opacity: 0.7; }
        .addr-actions { display: flex; gap: 1rem; }

        /* --- Address Form --- */
        .acct-address-form {
          padding: 1.375rem;
          border: 1px solid rgba(43,34,27,0.06);
          margin-bottom: 1.25rem;
          background: var(--bg-secondary);
        }

        .acct-form-row { margin-bottom: 0.75rem; }

        .acct-form-row input, .acct-form-grid input {
          width: 100%;
          padding: 0.65rem 0;
          font-family: var(--font-body);
          font-size: var(--text-body);
          color: var(--text-primary);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--stone);
          outline: none;
          transition: border-color 300ms var(--ease);
        }

        .acct-form-row input:focus, .acct-form-grid input:focus { border-bottom-color: var(--bronze); }

        .acct-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        /* --- Detail Card --- */
        .acct-detail-card { border: 1px solid rgba(43,34,27,0.05); }

        .detail-row {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(43,34,27,0.04);
        }

        .detail-row:last-child { border-bottom: none; }

        .detail-label {
          display: block;
          font-size: 0.55rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.35rem;
          font-weight: 500;
          opacity: 0.7;
        }

        .detail-value-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .detail-value { font-size: var(--text-body); color: var(--text-primary); }

        .detail-badge {
          font-size: 0.5rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          background: rgba(29,53,40,0.06);
          color: var(--forest);
        }

        .detail-edit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .detail-edit input {
          flex: 1;
          padding: 0.5rem 0;
          font-family: var(--font-body);
          font-size: var(--text-body);
          color: var(--text-primary);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--bronze);
          outline: none;
        }

        .detail-edit-stack {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }

        .detail-edit-stack input { border-bottom: 1px solid var(--stone); }
        .detail-edit-stack input:focus { border-bottom-color: var(--bronze); }

        /* --- Toggle --- */
        .acct-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .acct-toggle input { display: none; }

        .toggle-slider {
          width: 36px;
          height: 20px;
          background: var(--stone);
          border-radius: 10px;
          position: relative;
          transition: background 300ms var(--ease);
          flex-shrink: 0;
        }

        .toggle-slider::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: var(--bg-primary);
          border-radius: 50%;
          transition: transform 300ms var(--ease);
        }

        .acct-toggle input:checked + .toggle-slider { background: var(--bronze); }
        .acct-toggle input:checked + .toggle-slider::after { transform: translateX(16px); }
        .toggle-text { font-size: var(--text-body); color: var(--text-primary); }

        /* --- Notifications --- */
        .notif-badge {
          font-size: 0.55rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          background: rgba(167,134,89,0.1);
          color: var(--bronze);
          font-weight: 500;
        }

        .acct-notif-list { display: flex; flex-direction: column; gap: 0.5rem; }

        .acct-notif-item {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          padding: 1rem 1.125rem;
          border: 1px solid rgba(43,34,27,0.05);
          cursor: pointer;
          transition: background 250ms var(--ease), transform 200ms var(--ease);
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .acct-notif-item:hover {
          background: rgba(43,34,27,0.015);
          transform: translateY(-1px);
        }

        .acct-notif-item.is-unread {
          border-left: 2px solid var(--bronze);
        }

        .notif-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--bronze);
          flex-shrink: 0;
          margin-top: 0.4rem;
          opacity: 0;
          transition: opacity 250ms var(--ease);
        }

        .acct-notif-item.is-unread .notif-dot { opacity: 1; }

        .notif-content { flex: 1; min-width: 0; }

        .notif-title {
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .notif-desc {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
          margin-bottom: 0.3rem;
          opacity: 0.75;
        }

        .notif-time {
          font-size: 0.55rem;
          color: var(--text-secondary);
          opacity: 0.5;
          letter-spacing: 0.02em;
        }

        /* --- Support --- */
        .acct-support-list { display: flex; flex-direction: column; gap: 0.5rem; }

        .acct-support-item {
          border: 1px solid rgba(43,34,27,0.05);
          animation: acctSlideUp 450ms var(--ease) both;
        }

        .support-link {
          display: block;
          padding: 1rem 1.25rem;
          text-decoration: none;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          transition: background 250ms var(--ease);
        }

        .support-link:hover { background: rgba(43,34,27,0.015); }

        .support-title {
          font-size: var(--text-body);
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .support-desc {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
          opacity: 0.7;
        }

        /* --- Mobile Hamburger --- */
        .acct-mobile-toggle {
          display: none;
          position: fixed;
          bottom: 76px;
          right: 1rem;
          width: 44px;
          height: 44px;
          background: var(--walnut);
          color: var(--bg-primary);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          z-index: 160;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(43,34,27,0.2);
          transition: transform 200ms var(--ease);
        }

        .acct-mobile-toggle:active { transform: scale(0.93); }

        .acct-drawer-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(43,34,27,0.25);
          z-index: 200;
          opacity: 0;
          transition: opacity 350ms var(--ease);
        }

        .acct-drawer-overlay.is-open { opacity: 1; }

        .acct-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          height: 100dvh;
          background: var(--bg-primary);
          z-index: 210;
          transform: translateX(-100%);
          transition: transform 350ms var(--ease);
          overflow-y: auto;
          padding: 2.5rem 0 2rem;
          padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
          box-shadow: 4px 0 24px rgba(43,34,27,0.08);
        }

        .acct-drawer.is-open { transform: translateX(0); }

        .acct-drawer-brand {
          padding: 0 1.75rem 1.75rem;
          margin-bottom: 0.5rem;
        }

        .acct-drawer-brand img { height: 20px; opacity: 0.55; }

        /* --- Responsive --- */
        @media (max-width: 860px) {
          .acct-sidebar { display: none; }
          .acct-mobile-toggle { display: flex; }
          .acct-drawer-overlay { display: block; pointer-events: none; }
          .acct-drawer-overlay.is-open { pointer-events: auto; }
          .acct-main { padding: 1.75rem 1.25rem 5.5rem; }
          .acct-stats { grid-template-columns: repeat(2, 1fr); }
          .acct-order-card { flex-wrap: wrap; }
          .order-actions { flex-direction: row; width: 100%; }
          .order-actions .acct-btn-sm { flex: 1; }
          .acct-form-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 560px) {
          .acct-main { padding: 1.25rem 1rem 5.5rem; }
          .acct-stats { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .acct-stat-card { padding: 1rem; }
          .acct-wishlist-grid { grid-template-columns: repeat(2, 1fr); }
          .acct-header-row { gap: 0.75rem; }
          .acct-avatar { width: 42px; height: 42px; font-size: 0.8rem; }
          .acct-header { margin-bottom: 2rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .acct-page, .acct-sidebar, .acct-header, .acct-section, .acct-stat-card,
          .acct-order-card, .acct-wish-card, .acct-scroll-card,
          .acct-address-card, .acct-notif-item, .acct-support-item,
          .acct-nav-item.is-active::before {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="acct-page">
        {/* Desktop Sidebar */}
        <aside className="acct-sidebar">
          <div className="acct-sidebar-brand">
            <Link href="/"><img src="/assets/logo-black.png" alt="Teakle" /></Link>
          </div>
          <div className="acct-nav-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`acct-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
              {item.label}
            </button>
          ))}
          <div className="acct-nav-divider"></div>
          <button className="acct-nav-item acct-nav-logout" onClick={logout}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <div className="acct-main">
          <div className="acct-header">
            <p className="acct-greeting">{getGreeting()},</p>
            <div className="acct-header-row">
              <div className="acct-avatar">{getInitials(user.name || 'U')}</div>
              <h1 className="acct-member-name">{user.name}</h1>
            </div>
            <p className="acct-header-sub">Manage your collection, orders and account.</p>
          </div>

          {renderContent()}
        </div>

        {/* Mobile Drawer */}
        <button className="acct-mobile-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className={`acct-drawer-overlay ${drawerOpen ? 'is-open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
        <div className={`acct-drawer ${drawerOpen ? 'is-open' : ''}`}>
          <div className="acct-drawer-brand">
            <Link href="/"><img src="/assets/logo-black.png" alt="Teakle" /></Link>
          </div>
          <div className="acct-nav-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`acct-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              onClick={() => { setActiveSection(item.id); setDrawerOpen(false); }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
              {item.label}
            </button>
          ))}
          <div className="acct-nav-divider"></div>
          <button className="acct-nav-item acct-nav-logout" onClick={logout}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
