/**
 * Client-side API helper for customer-facing endpoints.
 * Falls back to localStorage when server is unavailable or user is guest.
 */

const API_BASE = '';

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.warn(`API ${path} failed:`, err.message);
    return null;
  }
}

export const customerAuth = {
  async register(name, email, password, confirmPassword) {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  },

  async login(email, password) {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return apiFetch('/api/auth/logout', { method: 'POST' });
  },

  async me() {
    return apiFetch('/api/auth/me');
  },

  async getProfile() {
    return apiFetch('/api/auth/profile');
  },

  async updateProfile(profileData) {
    return apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async changePassword(currentPassword, newPassword) {
    return apiFetch('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async forgotPassword(email) {
    return apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token, password) {
    return apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async deactivate(password) {
    return apiFetch('/api/auth/deactivate', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};

export const customerAddresses = {
  async list() {
    return apiFetch('/api/addresses');
  },

  async get(id) {
    return apiFetch(`/api/addresses/${id}`);
  },

  async create(addressData) {
    return apiFetch('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  async update(id, addressData) {
    return apiFetch(`/api/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  async remove(id) {
    return apiFetch(`/api/addresses/${id}`, { method: 'DELETE' });
  },
};

export const customerCart = {
  async get() {
    return apiFetch('/api/cart');
  },

  async add(productId, quantity = 1) {
    return apiFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async update(productId, quantity) {
    return apiFetch('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async remove(productId) {
    return apiFetch(`/api/cart/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  },
};

export const customerWishlist = {
  async get() {
    return apiFetch('/api/wishlist');
  },

  async toggle(productId) {
    return apiFetch('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async remove(productId) {
    return apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  },
};

export const customerOrders = {
  async list() {
    return apiFetch('/api/orders');
  },

  async get(orderId) {
    return apiFetch(`/api/orders/${orderId}`);
  },

  async create(orderData) {
    return apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async cancel(orderId) {
    return apiFetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel' }),
    });
  },
};
