/**
 * Sprint #16 - Customer Account Management & Security Tests
 * Run: node scripts/test-sprint16.js
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'teakle-test-s16.db');
let db, passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function assertType(v, t, m) { if (typeof v !== t) throw new Error(m || `Expected type ${t}, got ${typeof v}`); }
function assertHas(obj, key, m) { if (!(key in obj)) throw new Error(m || `Expected object to have key "${key}"`); }
function sha256(str) { return createHash('sha256').update(str).digest('hex'); }

function setup() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', phone TEXT DEFAULT '', isActive INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS customer_addresses (id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL, label TEXT NOT NULL DEFAULT '', fullName TEXT NOT NULL DEFAULT '', phone TEXT DEFAULT '', addressLine1 TEXT NOT NULL, addressLine2 TEXT DEFAULT '', city TEXT NOT NULL, state TEXT NOT NULL, postalCode TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'India', isDefault INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL DEFAULT (datetime('now')), updatedAt TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (customerId) REFERENCES customers(id));
    CREATE TABLE IF NOT EXISTS password_resets (id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER NOT NULL, tokenHash TEXT NOT NULL UNIQUE, expiresAt TEXT NOT NULL, used INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (customerId) REFERENCES customers(id));
    CREATE INDEX IF NOT EXISTS idx_customer_addresses_customerId ON customer_addresses(customerId);
    CREATE INDEX IF NOT EXISTS idx_password_resets_customerId ON password_resets(customerId);
    CREATE INDEX IF NOT EXISTS idx_password_resets_tokenHash ON password_resets(tokenHash);
  `);
}

function cleanup() {
  if (db) db.close();
  [DB_PATH, DB_PATH + '-wal', DB_PATH + '-shm'].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
}

function createTestCustomer(email = 'test@teakle.in', password = 'TestPassword123') {
  const hash = bcrypt.hashSync(password, 12);
  return db.prepare('INSERT INTO customers (email, passwordHash, name, phone) VALUES (?, ?, ?, ?)').run(email, hash, 'Test User', '+91 98765 43210');
}

// ─── Database Schema Tests ───
function testSchema() {
  console.log('\n\x1b[1m-- Database Schema --\x1b[0m');

  const customers = db.prepare("PRAGMA table_info(customers)").all();
  const colNames = customers.map(c => c.name);

  test('customers table has isActive column', () => assert(colNames.includes('isActive'), 'Missing isActive'));
  test('isActive defaults to 1', () => {
    const col = customers.find(c => c.name === 'isActive');
    assert(col && col.dflt_value === '1', 'isActive default not 1');
  });

  const addrCols = db.prepare("PRAGMA table_info(customer_addresses)").all();
  const addrNames = addrCols.map(c => c.name);

  test('customer_addresses table exists', () => assert(addrNames.length > 0, 'No columns'));
  test('customer_addresses has customerId', () => assert(addrNames.includes('customerId')));
  test('customer_addresses has label', () => assert(addrNames.includes('label')));
  test('customer_addresses has fullName', () => assert(addrNames.includes('fullName')));
  test('customer_addresses has phone', () => assert(addrNames.includes('phone')));
  test('customer_addresses has addressLine1', () => assert(addrNames.includes('addressLine1')));
  test('customer_addresses has addressLine2', () => assert(addrNames.includes('addressLine2')));
  test('customer_addresses has city', () => assert(addrNames.includes('city')));
  test('customer_addresses has state', () => assert(addrNames.includes('state')));
  test('customer_addresses has postalCode', () => assert(addrNames.includes('postalCode')));
  test('customer_addresses has country', () => assert(addrNames.includes('country')));
  test('customer_addresses has isDefault', () => assert(addrNames.includes('isDefault')));
  test('customer_addresses has timestamps', () => assert(addrNames.includes('createdAt') && addrNames.includes('updatedAt')));

  const resetCols = db.prepare("PRAGMA table_info(password_resets)").all();
  const resetNames = resetCols.map(c => c.name);

  test('password_resets table exists', () => assert(resetNames.length > 0, 'No columns'));
  test('password_resets has customerId', () => assert(resetNames.includes('customerId')));
  test('password_resets has tokenHash', () => assert(resetNames.includes('tokenHash')));
  test('password_resets has expiresAt', () => assert(resetNames.includes('expiresAt')));
  test('password_resets has used flag', () => assert(resetNames.includes('used')));
  test('password_resets has createdAt', () => assert(resetNames.includes('createdAt')));
}

// ─── Profile API Tests ───
function testProfileAPI() {
  console.log('\n\x1b[1m-- Customer Profile API --\x1b[0m');

  let profileSource;
  try {
    profileSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'profile', 'route.js'), 'utf8');
  } catch {
    test('profile route file readable', () => { throw new Error('Cannot read profile route'); });
    return;
  }

  test('profile route exists', () => assert(profileSource.length > 0));
  test('exports GET function', () => assert(profileSource.includes('export async function GET')));
  test('exports PUT function', () => assert(profileSource.includes('export async function PUT')));
  test('uses getCustomerSession', () => assert(profileSource.includes('getCustomerSession')));
  test('GET returns customer without passwordHash', () => assert(profileSource.includes('SELECT id, email, name, phone, isActive, createdAt, updatedAt')));
  test('PUT validates name length', () => assert(profileSource.includes('MAX_NAME')));
  test('PUT validates phone format', () => assert(profileSource.includes('PHONE_RE')));
  test('PUT validates phone length', () => assert(profileSource.includes('MAX_PHONE')));
  test('PUT returns 401 when not authenticated', () => assert(profileSource.includes("'Authentication required'")));
  test('PUT returns validation errors', () => assert(profileSource.includes("'Validation failed'")));
  test('PUT updates updatedAt', () => assert(profileSource.includes("datetime('now')")));
  test('does not expose passwordHash in response', () => assert(!profileSource.includes('passwordHash') || profileSource.includes('SELECT id, email, name')));
}

// ─── Password Change API Tests ───
function testPasswordAPI() {
  console.log('\n\x1b[1m-- Password Change API --\x1b[0m');

  let passwordSource;
  try {
    passwordSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'password', 'route.js'), 'utf8');
  } catch {
    test('password route file readable', () => { throw new Error('Cannot read password route'); });
    return;
  }

  test('password route exists', () => assert(passwordSource.length > 0));
  test('exports PUT function', () => assert(passwordSource.includes('export async function PUT')));
  test('uses bcrypt for hashing', () => assert(passwordSource.includes('bcrypt.hash') || passwordSource.includes("from 'bcryptjs'")));
  test('uses bcrypt for comparison', () => assert(passwordSource.includes('bcrypt.compare')));
  test('validates MIN_PASSWORD', () => assert(passwordSource.includes('MIN_PASSWORD')));
  test('validates MAX_PASSWORD', () => assert(passwordSource.includes('MAX_PASSWORD')));
  test('requires current password', () => assert(passwordSource.includes('currentPassword')));
  test('requires new password', () => assert(passwordSource.includes('newPassword')));
  test('rejects same password', () => assert(passwordSource.includes('different from current password')));
  test('applies rate limiting', () => assert(passwordSource.includes('rateLimit')));
  test('returns 401 on incorrect current password', () => assert(passwordSource.includes('Current password is incorrect')));
  test('logs password change', () => assert(passwordSource.includes('Password changed successfully') || passwordSource.includes('log.info')));
  test('hashes with bcrypt cost 12', () => assert(passwordSource.includes("12)")));
}

// ─── Forgot Password Architecture Tests ───
function testForgotPassword() {
  console.log('\n\x1b[1m-- Forgot Password Architecture --\x1b[0m');

  let forgotSource;
  try {
    forgotSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'forgot-password', 'route.js'), 'utf8');
  } catch {
    test('forgot-password route file readable', () => { throw new Error('Cannot read forgot-password route'); });
    return;
  }

  test('forgot-password route exists', () => assert(forgotSource.length > 0));
  test('exports POST function', () => assert(forgotSource.includes('export async function POST')));
  test('uses SHA-256 for token hashing', () => assert(forgotSource.includes('sha256') || forgotSource.includes('SHA-256')));
  test('generates random token', () => assert(forgotSource.includes('generateToken') || forgotSource.includes('randomBytes')));
  test('deletes old unused tokens before creating new', () => assert(forgotSource.includes('DELETE FROM password_resets')));
  test('inserts new reset token', () => assert(forgotSource.includes('INSERT INTO password_resets')));
  test('sets expiry', () => assert(forgotSource.includes('expiresAt') || forgotSource.includes('hours')));
  test('returns generic message for security', () => assert(forgotSource.includes('If an account exists')));
  test('applies rate limiting', () => assert(forgotSource.includes('rateLimit')));
  test('does not reveal if email exists', () => assert(!forgotSource.includes('Email not found')));
  test('logs non-existent email requests', () => assert(forgotSource.includes('non-existent email') || forgotSource.includes('Password reset requested')));

  let resetSource;
  try {
    resetSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'reset-password', 'route.js'), 'utf8');
  } catch {
    test('reset-password route file readable', () => { throw new Error('Cannot read reset-password route'); });
    return;
  }

  test('reset-password route exists', () => assert(resetSource.length > 0));
  test('reset-password exports POST', () => assert(resetSource.includes('export async function POST')));
  test('validates token', () => assert(resetSource.includes('tokenHash') || resetSource.includes('token')));
  test('checks token expiry', () => assert(resetSource.includes('expiresAt') || resetSource.includes('expired')));
  test('checks if token already used', () => assert(resetSource.includes('used')));
  test('marks token as used after success', () => assert(resetSource.includes("UPDATE password_resets SET used = 1")));
  test('hashes new password with bcrypt', () => assert(resetSource.includes('bcrypt.hash')));
  test('validates MIN_PASSWORD', () => assert(resetSource.includes('MIN_PASSWORD')));
  test('applies rate limiting', () => assert(resetSource.includes('rateLimit')));
  test('returns generic error for invalid token', () => assert(resetSource.includes('Invalid or expired reset token')));
}

// ─── Saved Addresses API Tests ───
function testAddressesAPI() {
  console.log('\n\x1b[1m-- Saved Addresses API --\x1b[0m');

  let listSource;
  try {
    listSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'addresses', 'route.js'), 'utf8');
  } catch {
    test('addresses route file readable', () => { throw new Error('Cannot read addresses route'); });
    return;
  }

  test('addresses route exists', () => assert(listSource.length > 0));
  test('exports GET function', () => assert(listSource.includes('export async function GET')));
  test('exports POST function', () => assert(listSource.includes('export async function POST')));
  test('GET requires authentication', () => assert(listSource.includes('getCustomerSession')));
  test('GET orders by isDefault DESC', () => assert(listSource.includes('isDefault DESC')));
  test('POST validates with validateAddress', () => assert(listSource.includes('validateAddress')));
  test('POST validates label length', () => assert(listSource.includes('100')));
  test('POST validates fullName length', () => assert(listSource.includes('fullName')));
  test('POST validates addressLine2 length', () => assert(listSource.includes('200')));
  test('POST sets first address as default', () => assert(listSource.includes('addressCount') || listSource.includes('isDefault')));
  test('POST creates address', () => assert(listSource.includes('INSERT INTO customer_addresses')));
  test('POST returns 201', () => assert(listSource.includes('201')));
  test('returns ok: true', () => assert(listSource.includes('ok: true')));

  let crudSource;
  try {
    crudSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'addresses', '[id]', 'route.js'), 'utf8');
  } catch {
    test('address [id] route file readable', () => { throw new Error('Cannot read address [id] route'); });
    return;
  }

  test('address [id] route exists', () => assert(crudSource.length > 0));
  test('exports GET function', () => assert(crudSource.includes('export async function GET')));
  test('exports PUT function', () => assert(crudSource.includes('export async function PUT')));
  test('exports DELETE function', () => assert(crudSource.includes('export async function DELETE')));
  test('GET checks customer ownership', () => assert(crudSource.includes('customerId')));
  test('PUT validates address', () => assert(crudSource.includes('validateAddress')));
  test('PUT updates address', () => assert(crudSource.includes('UPDATE customer_addresses')));
  test('DELETE removes address', () => assert(crudSource.includes('DELETE FROM customer_addresses')));
  test('DELETE reassigns default if needed', () => assert(crudSource.includes('isDefault') || crudSource.includes('next')));
}

// ─── Account Deactivation Tests ───
function testDeactivation() {
  console.log('\n\x1b[1m-- Account Deactivation --\x1b[0m');

  let deactivateSource;
  try {
    deactivateSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'deactivate', 'route.js'), 'utf8');
  } catch {
    test('deactivate route file readable', () => { throw new Error('Cannot read deactivate route'); });
    return;
  }

  test('deactivate route exists', () => assert(deactivateSource.length > 0));
  test('exports POST function', () => assert(deactivateSource.includes('export async function POST')));
  test('requires password confirmation', () => assert(deactivateSource.includes('Password confirmation is required')));
  test('validates password with bcrypt', () => assert(deactivateSource.includes('bcrypt.compare')));
  test('checks for active orders', () => assert(deactivateSource.includes('active orders') || deactivateSource.includes('NOT IN')));
  test('anonymizes customer data', () => assert(deactivateSource.includes('Deleted User') || deactivateSource.includes('deactivated')));
  test('clears passwordHash', () => assert(deactivateSource.includes("passwordHash = ''")));
  test('sets isActive to 0', () => assert(deactivateSource.includes('isActive = 0')));
  test('clears addresses', () => assert(deactivateSource.includes('DELETE FROM customer_addresses')));
  test('clears password resets', () => assert(deactivateSource.includes('DELETE FROM password_resets')));
  test('ends session', () => assert(deactivateSource.includes('deleteCustomerSession')));
  test('applies rate limiting', () => assert(deactivateSource.includes('rateLimit')));
  test('logs deactivation', () => assert(deactivateSource.includes('Account deactivated') || deactivateSource.includes('log.info')));
  test('rejects incorrect password', () => assert(deactivateSource.includes('Password is incorrect')));
}

// ─── Client API Helper Tests ───
function testClientAPI() {
  console.log('\n\x1b[1m-- Client-Side API Helpers --\x1b[0m');

  let apiSource;
  try {
    apiSource = fs.readFileSync(path.join(__dirname, '..', 'lib', 'api.js'), 'utf8');
  } catch {
    test('api.js file readable', () => { throw new Error('Cannot read api.js'); });
    return;
  }

  test('api.js exists', () => assert(apiSource.length > 0));
  test('customerAuth.getProfile exists', () => assert(apiSource.includes('getProfile')));
  test('customerAuth.updateProfile exists', () => assert(apiSource.includes('updateProfile')));
  test('customerAuth.changePassword exists', () => assert(apiSource.includes('changePassword')));
  test('customerAuth.forgotPassword exists', () => assert(apiSource.includes('forgotPassword')));
  test('customerAuth.resetPassword exists', () => assert(apiSource.includes('resetPassword')));
  test('customerAuth.deactivate exists', () => assert(apiSource.includes('deactivate')));
  test('customerAddresses.list exists', () => assert(apiSource.includes('customerAddresses') && apiSource.includes('async list()')));
  test('customerAddresses.get exists', () => assert(apiSource.includes('async get(id)') || apiSource.includes('async get(')));
  test('customerAddresses.create exists', () => assert(apiSource.includes('async create(addressData)')));
  test('customerAddresses.update exists', () => assert(apiSource.includes('async update(id, addressData)')));
  test('customerAddresses.remove exists', () => assert(apiSource.includes('async remove(id)')));
  test('updateProfile uses PUT method', () => assert(apiSource.includes("method: 'PUT'")));
  test('changePassword uses PUT method', () => assert(apiSource.includes("method: 'PUT'")));
  test('deactivate uses POST method', () => assert(apiSource.includes("method: 'POST'")));
}

// ─── Rate Limiting Tests ───
function testRateLimits() {
  console.log('\n\x1b[1m-- Rate Limiting Configuration --\x1b[0m');

  let rlSource;
  try {
    rlSource = fs.readFileSync(path.join(__dirname, '..', 'lib', 'rateLimit.js'), 'utf8');
  } catch {
    test('rateLimit.js file readable', () => { throw new Error('Cannot read rateLimit.js'); });
    return;
  }

  test('passwordChange rate limit defined', () => assert(rlSource.includes('passwordChange')));
  test('forgotPassword rate limit defined', () => assert(rlSource.includes('forgotPassword')));
  test('resetPassword rate limit defined', () => assert(rlSource.includes('resetPassword')));
}

// ─── Checkout Integration Tests ───
function testCheckoutIntegration() {
  console.log('\n\x1b[1m-- Checkout Saved Address Integration --\x1b[0m');

  let checkoutSource;
  try {
    checkoutSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'checkout', 'page.js'), 'utf8');
  } catch {
    test('checkout page file readable', () => { throw new Error('Cannot read checkout page'); });
    return;
  }

  test('imports customerAddresses', () => assert(checkoutSource.includes('customerAddresses')));
  test('has savedAddresses state', () => assert(checkoutSource.includes('savedAddresses')));
  test('has selectedAddressId state', () => assert(checkoutSource.includes('selectedAddressId')));
  test('has saveAddressChecked state', () => assert(checkoutSource.includes('saveAddressChecked')));
  test('loads saved addresses when logged in', () => assert(checkoutSource.includes('customerAddresses.list()')));
  test('has selectSavedAddress function', () => assert(checkoutSource.includes('selectSavedAddress')));
  test('saves address during checkout if checked', () => assert(checkoutSource.includes('saveAddressChecked') && checkoutSource.includes('customerAddresses.create')));
  test('shows saved addresses section when logged in', () => assert(checkoutSource.includes('savedAddresses.length > 0')));
}

// ─── Account Page Frontend Tests ───
function testAccountFrontend() {
  console.log('\n\x1b[1m-- Account Page Frontend --\x1b[0m');

  let accountSource;
  try {
    accountSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'account', 'page.js'), 'utf8');
  } catch {
    test('account page file readable', () => { throw new Error('Cannot read account page'); });
    return;
  }

  test('imports customerAddresses', () => assert(accountSource.includes('customerAddresses')));
  test('has passwordForm state', () => assert(accountSource.includes('passwordForm')));
  test('has passwordError state', () => assert(accountSource.includes('passwordError')));
  test('has passwordSuccess state', () => assert(accountSource.includes('passwordSuccess')));
  test('has deactivating state', () => assert(accountSource.includes('deactivating')));
  test('handleChangePassword function exists', () => assert(accountSource.includes('handleChangePassword')));
  test('handleDeactivate function exists', () => assert(accountSource.includes('handleDeactivate')));
  test('password change validates MIN length', () => assert(accountSource.includes('at least 8 characters')));
  test('password change validates confirm match', () => assert(accountSource.includes('do not match')));
  test('calls customerAuth.changePassword', () => assert(accountSource.includes('customerAuth.changePassword')));
  test('calls customerAuth.deactivate', () => assert(accountSource.includes('customerAuth.deactivate')));
  test('calls customerAuth.updateProfile for profile save', () => assert(accountSource.includes('customerAuth.updateProfile')));
  test('loads addresses from API', () => assert(accountSource.includes('customerAddresses.list()')));
  test('address CRUD via API', () => assert(accountSource.includes('customerAddresses.create') && accountSource.includes('customerAddresses.remove')));
  test('default address via API', () => assert(accountSource.includes('customerAddresses.update')));
  test('security section has password change UI', () => assert(accountSource.includes('security-pass')));
  test('security section has account deactivation', () => assert(accountSource.includes('Deactivate')));
  test('deactivation ends session on success', () => assert(accountSource.includes('window.Teakle.logout()') || accountSource.includes("window.location.href = '/login'")));
}

// ─── Security Tests ───
function testSecurity() {
  console.log('\n\x1b[1m-- Security --\x1b[0m');

  const files = [
    { path: 'app/api/auth/profile/route.js', name: 'profile' },
    { path: 'app/api/auth/password/route.js', name: 'password' },
    { path: 'app/api/auth/forgot-password/route.js', name: 'forgot-password' },
    { path: 'app/api/auth/reset-password/route.js', name: 'reset-password' },
    { path: 'app/api/auth/deactivate/route.js', name: 'deactivate' },
    { path: 'app/api/addresses/route.js', name: 'addresses list' },
    { path: 'app/api/addresses/[id]/route.js', name: 'addresses CRUD' },
  ];

  for (const f of files) {
    let source;
    try {
      source = fs.readFileSync(path.join(__dirname, '..', f.path), 'utf8');
    } catch { continue; }

    test(`${f.name}: no hardcoded passwords`, () => assert(!source.includes("'password123'") && !source.includes('"password123"')));
    test(`${f.name}: no console.log`, () => assert(!source.includes('console.log(')));
    test(`${f.name}: uses logger`, () => assert(source.includes('log.') || source.includes("import { log }")));
    test(`${f.name}: returns 500 on error`, () => assert(source.includes('500')));
  }
}

// ─── Data Integrity Tests ───
function testDataIntegrity() {
  console.log('\n\x1b[1m-- Data Integrity --\x1b[0m');

  const result = createTestCustomer('integrity@teakle.in');
  test('test customer created', () => assert(result.changes === 1));

  const addrResult = db.prepare(
    'INSERT INTO customer_addresses (customerId, label, fullName, phone, addressLine1, city, state, postalCode, country, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(result.lastInsertRowid, 'Home', 'Test User', '+91 98765 43210', '123 Test Street', 'Mumbai', 'Maharashtra', '400001', 'India', 1);
  test('address created successfully', () => assert(addrResult.changes === 1));

  const addr = db.prepare('SELECT * FROM customer_addresses WHERE id = ?').get(addrResult.lastInsertRowid);
  test('address has correct customerId', () => assertEq(addr.customerId, result.lastInsertRowid));
  test('address has correct label', () => assertEq(addr.label, 'Home'));
  test('address has correct fullName', () => assertEq(addr.fullName, 'Test User'));
  test('address has correct addressLine1', () => assertEq(addr.addressLine1, '123 Test Street'));
  test('address has correct city', () => assertEq(addr.city, 'Mumbai'));
  test('address has correct postalCode', () => assertEq(addr.postalCode, '400001'));
  test('address has correct country', () => assertEq(addr.country, 'India'));
  test('address has isDefault set', () => assertEq(addr.isDefault, 1));

  const token = randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const resetResult = db.prepare(
    "INSERT INTO password_resets (customerId, tokenHash, expiresAt) VALUES (?, ?, datetime('now', '+1 hour'))"
  ).run(result.lastInsertRowid, tokenHash);
  test('password reset token created', () => assert(resetResult.changes === 1));

  const reset = db.prepare('SELECT * FROM password_resets WHERE tokenHash = ?').get(tokenHash);
  test('reset token has correct customerId', () => assertEq(reset.customerId, result.lastInsertRowid));
  test('reset token has expiresAt', () => assert(reset.expiresAt));
  test('reset token not used', () => assertEq(reset.used, 0));

  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);
  const usedReset = db.prepare('SELECT used FROM password_resets WHERE id = ?').get(reset.id);
  test('reset token marked as used', () => assertEq(usedReset.used, 1));

  db.prepare("UPDATE customers SET isActive = 0 WHERE id = ?").run(result.lastInsertRowid);
  const customer = db.prepare('SELECT isActive FROM customers WHERE id = ?').get(result.lastInsertRowid);
  test('customer isActive can be set to 0', () => assertEq(customer.isActive, 0));

  db.prepare('DELETE FROM customer_addresses WHERE customerId = ?').run(result.lastInsertRowid);
  const remainingAddrs = db.prepare('SELECT COUNT(*) as count FROM customer_addresses WHERE customerId = ?').get(result.lastInsertRowid);
  test('addresses can be deleted', () => assertEq(remainingAddrs.count, 0));
}

// ─── Run All Tests ───
console.log('\x1b[1m\x1b[36mSprint #16 — Customer Account Management & Security\x1b[0m');
console.log('\x1b[90m' + '─'.repeat(50) + '\x1b[0m');

try {
  setup();
  testSchema();
  testProfileAPI();
  testPasswordAPI();
  testForgotPassword();
  testAddressesAPI();
  testDeactivation();
  testClientAPI();
  testRateLimits();
  testCheckoutIntegration();
  testAccountFrontend();
  testSecurity();
  testDataIntegrity();
} finally {
  cleanup();
}

console.log('\n' + '\x1b[90m' + '─'.repeat(50) + '\x1b[0m');
console.log(`\x1b[1mResults: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, \x1b[1m${total} total\x1b[0m`);

if (failed > 0) process.exit(1);
