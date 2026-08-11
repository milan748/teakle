/**
 * TEAKLE — Address Validation
 *
 * Server-side validation for shipping and billing addresses.
 * India is the current intended market but the system is not
 * irreversibly restricted to India.
 */

const MAX_LENGTHS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 20,
  address: 500,
  apartment: 200,
  city: 100,
  state: 100,
  pin: 20,
  country: 100,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{7,20}$/;
const INDIA_PIN_REGEX = /^[1-9][0-9]{5}$/;

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

function validateField(name, value, required = true) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    if (required) return `${name} is required`;
    return null;
  }

  const str = String(value).trim();

  if (str.length === 0 && required) {
    return `${name} is required`;
  }

  const maxLen = MAX_LENGTHS[name] || 500;
  if (str.length > maxLen) {
    return `${name} must be ${maxLen} characters or less`;
  }

  return null;
}

function validateEmailField(value, required = true) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    if (required) return 'Email is required';
    return null;
  }
  const str = String(value).trim();
  if (str.length > MAX_LENGTHS.email) {
    return `Email must be ${MAX_LENGTHS.email} characters or less`;
  }
  if (!EMAIL_REGEX.test(str)) {
    return 'Invalid email format';
  }
  return null;
}

function validatePhoneField(value, required = false) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    if (required) return 'Phone is required';
    return null;
  }
  const str = String(value).trim();
  if (str.length > MAX_LENGTHS.phone) {
    return `Phone must be ${MAX_LENGTHS.phone} characters or less`;
  }
  if (!PHONE_REGEX.test(str)) {
    return 'Invalid phone format';
  }
  return null;
}

function validatePostalCode(value, country = 'India') {
  if (!value) return null;
  const str = String(value).trim();
  if (country === 'India') {
    if (!INDIA_PIN_REGEX.test(str)) {
      return 'Invalid Indian PIN code (must be 6 digits)';
    }
  }
  if (str.length > MAX_LENGTHS.pin) {
    return `Postal code must be ${MAX_LENGTHS.pin} characters or less`;
  }
  return null;
}

/**
 * Validate a full address object.
 * @param {object} addr - Address fields
 * @param {string} type - 'shipping' or 'billing'
 * @param {object} options - { requireAll: boolean }
 * @returns {{ valid: boolean, errors: object, data: object }}
 */
export function validateAddress(addr, type = 'shipping', options = {}) {
  const { requireAll = true } = options;
  const prefix = type === 'billing' ? 'Billing ' : 'Shipping ';
  const errors = {};

  const firstNameErr = validateField('firstName', addr.firstName, requireAll);
  if (firstNameErr) errors.firstName = prefix + firstNameErr;

  const lastNameErr = validateField('lastName', addr.lastName, requireAll);
  if (lastNameErr) errors.lastName = prefix + lastNameErr;

  if (type === 'shipping') {
    const emailErr = validateEmailField(addr.email, requireAll);
    if (emailErr) errors.email = emailErr;
  }

  const phoneErr = validatePhoneField(addr.phone, false);
  if (phoneErr) errors.phone = prefix + phoneErr;

  const addressErr = validateField('address', addr.address, requireAll);
  if (addressErr) errors.address = prefix + addressErr;

  const aptErr = validateField('apartment', addr.apartment, false);
  if (aptErr) errors.apartment = prefix + aptErr;

  const cityErr = validateField('city', addr.city, requireAll);
  if (cityErr) errors.city = prefix + cityErr;

  const stateErr = validateField('state', addr.state, requireAll);
  if (stateErr) errors.state = prefix + stateErr;

  const pinErr = validatePostalCode(addr.pin, addr.country || 'India');
  if (pinErr) errors.pin = prefix + pinErr;

  const countryErr = validateField('country', addr.country, false);
  if (countryErr) errors.country = prefix + countryErr;

  const valid = Object.keys(errors).length === 0;

  const data = valid ? {
    firstName: sanitize(addr.firstName || ''),
    lastName: sanitize(addr.lastName || ''),
    email: addr.email ? String(addr.email).trim().toLowerCase() : '',
    phone: addr.phone ? sanitize(addr.phone) : '',
    address: sanitize(addr.address || ''),
    apartment: addr.apartment ? sanitize(addr.apartment) : '',
    city: sanitize(addr.city || ''),
    state: sanitize(addr.state || ''),
    pin: addr.pin ? String(addr.pin).trim() : '',
    country: addr.country ? sanitize(addr.country) : 'India',
  } : null;

  return { valid, errors, data };
}

/**
 * Validate a full checkout address set.
 */
export function validateCheckoutAddresses(shipping, billing, billingSameAsShipping) {
  const errors = {};

  const shippingResult = validateAddress(shipping, 'shipping', { requireAll: true });
  if (!shippingResult.valid) {
    Object.assign(errors, shippingResult.errors);
  }

  if (!billingSameAsShipping) {
    const billingResult = validateAddress(billing, 'billing', { requireAll: true });
    if (!billingResult.valid) {
      Object.assign(errors, billingResult.errors);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    shipping: shippingResult.data,
    billing: billingSameAsShipping ? shippingResult.data : (billingResult?.data || null),
  };
}
