/* ============================================
   TEAKLE — Auth, Cart, Wishlist (localStorage)
   ============================================ */
var Teakle = (function () {

  /* ---------- helpers ---------- */
  function get(key, fallback) {
    try { return JSON.parse(localStorage.getItem('teakle_' + key)) || fallback; }
    catch (e) { return fallback; }
  }
  function set(key, val) {
    localStorage.setItem('teakle_' + key, JSON.stringify(val));
  }

  /* ---------- AUTH ---------- */
  function getUsers() { return get('users', []); }
  function saveUsers(u) { set('users', u); }
  function getCurrentUser() { return get('currentUser', null); }
  function setCurrentUser(u) { set('currentUser', u); }

  function register(name, email, password) {
    var users = getUsers();
    var exists = users.some(function (u) { return u.email === email; });
    if (exists) return { ok: false, msg: 'An account with this email already exists.' };
    var user = { name: name, email: email, password: password };
    users.push(user);
    saveUsers(users);
    setCurrentUser(user);
    return { ok: true, user: user };
  }

  function login(email, password) {
    var users = getUsers();
    var user = users.find(function (u) { return u.email === email && u.password === password; });
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    setCurrentUser(user);
    return { ok: true, user: user };
  }

  function logout() {
    localStorage.removeItem('teakle_currentUser');
  }

  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  function requireAuth() {
    if (isLoggedIn()) return true;
    window.location.href = '/login';
    return false;
  }

  /* ---------- CART ---------- */
  function getCart() {
    var cart = get('cart', []);
    // Normalize hero products: cap qty at 1
    if (typeof window !== 'undefined' && window.TEAKLE_PRODUCTS) {
      var changed = false;
      cart.forEach(function (item) {
        var product = window.TEAKLE_PRODUCTS.find(function (p) { return p.id === item.id; });
        if (product && product.isHero && item.qty > 1) {
          item.qty = 1;
          changed = true;
        }
      });
      if (changed) saveCart(cart);
    }
    return cart;
  }
  function saveCart(c) { set('cart', c); }

  function addToCart(item) {
    var qty = item.qty || 1;
    var cart = getCart();
    var idx = cart.findIndex(function (c) { return c.id === item.id; });
    // Look up product to check hero status
    var product = (typeof window !== 'undefined' && window.TEAKLE_PRODUCTS)
      ? window.TEAKLE_PRODUCTS.find(function (p) { return p.id === item.id; })
      : null;
    var isHero = product && product.isHero;
    if (idx > -1) {
      cart[idx].qty = isHero ? 1 : (cart[idx].qty || 1) + qty;
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price || '', image: item.image || '', qty: isHero ? 1 : qty });
    }
    saveCart(cart);
    updateCounts();
    return cart.length;
  }

  function removeFromCart(id) {
    var cart = getCart().filter(function (c) { return c.id !== id; });
    saveCart(cart);
    updateCounts();
    return cart;
  }

  function updateCartQty(id, qty) {
    var cart = getCart();
    var idx = cart.findIndex(function (c) { return c.id === id; });
    if (idx > -1) {
      // Check hero status
      var product = (typeof window !== 'undefined' && window.TEAKLE_PRODUCTS)
        ? window.TEAKLE_PRODUCTS.find(function (p) { return p.id === id; })
        : null;
      var isHero = product && product.isHero;
      if (qty <= 0) { cart.splice(idx, 1); }
      else { cart[idx].qty = isHero ? 1 : qty; }
    }
    saveCart(cart);
    updateCounts();
    return cart;
  }

  function cartCount() {
    return getCart().reduce(function (sum, c) { return sum + (c.qty || 1); }, 0);
  }

  /* ---------- WISHLIST ---------- */
  function getWishlist() { return get('wishlist', []); }
  function saveWishlist(w) { set('wishlist', w); }

  function toggleWishlist(item) {
    var wl = getWishlist();
    var idx = wl.findIndex(function (w) { return w.id === item.id; });
    if (idx > -1) {
      wl.splice(idx, 1);
    } else {
      wl.push({ id: item.id, name: item.name, price: item.price || '', image: item.image || '' });
    }
    saveWishlist(wl);
    updateCounts();
    return { wishlist: wl, added: idx === -1 };
  }

  function isInWishlist(id) {
    return getWishlist().some(function (w) { return w.id === id; });
  }

  function wishlistCount() {
    return getWishlist().length;
  }

  /* ---------- OTP ---------- */
  function generateOTP(email) {
    var otp = String(Math.floor(100000 + Math.random() * 900000));
    set('otp', { email: email, otp: otp, expires: Date.now() + 300000 });
    return otp;
  }

  function verifyOTP(email, otp) {
    var stored = get('otp', null);
    if (!stored) return { ok: false, msg: 'No OTP found. Please request a new one.' };
    if (stored.email !== email) return { ok: false, msg: 'OTP was sent to a different email.' };
    if (Date.now() > stored.expires) return { ok: false, msg: 'OTP has expired. Please request a new one.' };
    if (stored.otp !== otp) return { ok: false, msg: 'Invalid OTP. Please try again.' };
    localStorage.removeItem('teakle_otp');
    return { ok: true };
  }

  /* ---------- UI HELPERS ---------- */
  function updateCounts() {
    var cartBadge = document.getElementById('cartCount');
    var wishBadge = document.getElementById('wishlistCount');
    var bottomCart = document.getElementById('bottomCartCount');
    var bottomWish = document.getElementById('bottomWishlistCount');
    var c = cartCount();
    var w = wishlistCount();
    if (cartBadge) { cartBadge.textContent = c; cartBadge.style.display = c > 0 ? '' : 'none'; }
    if (wishBadge) { wishBadge.textContent = w; wishBadge.style.display = w > 0 ? '' : 'none'; }
    if (bottomCart) { bottomCart.textContent = c; bottomCart.style.display = c > 0 ? '' : 'none'; }
    if (bottomWish) { bottomWish.textContent = w; bottomWish.style.display = w > 0 ? '' : 'none'; }
  }

  function updateHeaderAuth() {
    var authLink = document.getElementById('authLink');
    if (!authLink) return;
    if (isLoggedIn()) {
      var user = getCurrentUser();
      authLink.innerHTML = '<span style="font-size:0.65rem;letter-spacing:0.04em;text-transform:uppercase;color:var(--text-secondary)">' + user.name.split(' ')[0] + '</span>';
      authLink.href = '#';
      authLink.onclick = function (e) {
        e.preventDefault();
        logout();
        window.location.reload();
      };
    } else {
      authLink.href = '/login';
      authLink.onclick = null;
    }
  }

  /* ---------- INIT ---------- */
  function init() {
    updateCounts();
    updateHeaderAuth();
  }

  return {
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    requireAuth: requireAuth,
    getCurrentUser: getCurrentUser,
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateCartQty: updateCartQty,
    cartCount: cartCount,
    getWishlist: getWishlist,
    toggleWishlist: toggleWishlist,
    isInWishlist: isInWishlist,
    wishlistCount: wishlistCount,
    generateOTP: generateOTP,
    verifyOTP: verifyOTP,
    updateCounts: updateCounts,
    updateHeaderAuth: updateHeaderAuth,
    init: init
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  Teakle.init();
});
