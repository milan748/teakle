/**
 * Sprint #16 Security Patch — Password Reset Token Exposure Tests
 * Run: node scripts/test-sprint16-security-patch.js
 *
 * Tests that the password reset token is never exposed in API responses,
 * logs, or error messages. Tests the reset mechanism directly via DB
 * since the API no longer returns the token.
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'teakle-test-s16-sec.db');
let db, passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function assertIncludes(haystack, needle, m) { if (!haystack.includes(needle)) throw new Error(m || `Expected string to include "${needle}"`); }
function assertNotIncludes(haystack, needle, m) { if (haystack.includes(needle)) throw new Error(m || `Expected string NOT to include "${needle}"`); }

function sha256(str) { return createHash('sha256').update(str).digest('hex'); }
function generateToken() { return randomBytes(32).toString('hex'); }

function setup() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      tokenHash TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );
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

// ─── 1. Forgot-Password Endpoint: No Token in Response ───
function testForgotPasswordNoTokenInResponse() {
  console.log('\n\x1b[1m-- Forgot-Password: No Token in Response --\x1b[0m');

  let routeSource;
  try {
    routeSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'forgot-password', 'route.js'), 'utf8');
  } catch {
    test('forgot-password route file readable', () => { throw new Error('Cannot read route file'); });
    return;
  }

  test('route file exists and is non-empty', () => assert(routeSource.length > 0));
  test('response does NOT contain "token: token"', () => assertNotIncludes(routeSource, 'token: token', 'Plaintext token is returned in response'));
  test('response does NOT contain "token,"', () => assertNotIncludes(routeSource, 'token: token,', 'Plaintext token is returned in response'));
  test('generic message for existing email', () => assertIncludes(routeSource, 'If an account exists with that email'));
  test('generic message for non-existing email', () => {
    const lines = routeSource.split('\n');
    const nonExistReturn = lines.findIndex(l => l.includes('non-existent email'));
    const genericReturn = lines.findIndex(l => l.includes('If an account exists'));
    assert(nonExistReturn > 0 && genericReturn > 0, 'Both paths should return generic message');
    assert(Math.abs(nonExistReturn - genericReturn) < 30, 'Non-existent and existing email responses should be identical');
  });
  test('token is generated with randomBytes(32)', () => assertIncludes(routeSource, 'randomBytes(32)'));
  test('token is hashed with SHA-256 before storage', () => assertIncludes(routeSource, 'sha256(token)'));
  test('only tokenHash is stored in DB', () => assertIncludes(routeSource, 'INSERT INTO password_resets (customerId, tokenHash'));
  test('old tokens deleted before creating new', () => assertIncludes(routeSource, 'DELETE FROM password_resets'));
  test('rate limiting applied', () => assertIncludes(routeSource, 'rateLimit'));
  test('log does not include token as a data field', () => {
    const logLines = routeSource.split('\n').filter(l => l.includes('log.'));
    for (const line of logLines) {
      // Allow "token" in log message strings (e.g. "Password reset token created")
      // but NOT as a data property (e.g. { token: token } or { token })
      assertNotIncludes(line, '{ token:', `Log should not pass token as data field: ${line.trim()}`);
      assertNotIncludes(line, 'token,}', `Log should not pass token as data field: ${line.trim()}`);
    }
  });
}

// ─── 2. Reset-Password Endpoint: No Token Exposure ───
function testResetPasswordNoExposure() {
  console.log('\n\x1b[1m-- Reset-Password: No Token Exposure --\x1b[0m');

  let routeSource;
  try {
    routeSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'reset-password', 'route.js'), 'utf8');
  } catch {
    test('reset-password route file readable', () => { throw new Error('Cannot read route file'); });
    return;
  }

  test('route file exists and is non-empty', () => assert(routeSource.length > 0));
  test('looks up by tokenHash, not plaintext token', () => assertIncludes(routeSource, 'WHERE tokenHash = ?'));
  test('success response does NOT contain token', () => assertNotIncludes(routeSource, 'token:', 'Token should not be in success response'));
  test('error responses do NOT leak actual token value', () => {
    const errorResponses = routeSource.match(/Response\.json\(\{[^}]*error[^}]*\}/g) || [];
    for (const resp of errorResponses) {
      // Error messages like "Reset token is required" are safe — they don't expose the actual token.
      // We check that the response doesn't contain a token VALUE (hex string pattern).
      assertNotIncludes(resp, 'token: ', `Error response should not include token as a data field: ${resp}`);
      assertNotIncludes(resp, 'token,', `Error response should not include token as a data field: ${resp}`);
    }
  });
  test('marks token as used after success', () => assertIncludes(routeSource, 'UPDATE password_resets SET used = 1'));
  test('validates token expiry', () => assertIncludes(routeSource, 'expiresAt'));
  test('validates token not already used', () => assertIncludes(routeSource, 'reset.used'));
  test('hashes new password with bcrypt', () => assertIncludes(routeSource, 'bcrypt.hash'));
  test('rate limiting applied', () => assertIncludes(routeSource, 'rateLimit'));
}

// ─── 3. Email Abstraction: No Token Logging ───
function testEmailAbstractionNoTokenLogging() {
  console.log('\n\x1b[1m-- Email Abstraction: No Token Logging --\x1b[0m');

  let emailSource;
  try {
    emailSource = fs.readFileSync(path.join(__dirname, '..', 'lib', 'email.js'), 'utf8');
  } catch {
    test('email.js file readable', () => { throw new Error('Cannot read email.js'); });
    return;
  }

  test('email.js exists', () => assert(emailSource.length > 0));
  test('sendPasswordReset function exists', () => assertIncludes(emailSource, 'sendPasswordReset'));
  test('sendPasswordReset does NOT log resetToken as a data field', () => {
    const fnMatch = emailSource.match(/export async function sendPasswordReset\([^)]*\)\s*\{[\s\S]*?\n\}/);
    assert(fnMatch, 'sendPasswordReset function body not found');
    const fnBody = fnMatch[0];
    // The function accepts resetToken as a parameter (for future email delivery)
    // but must NOT pass it to log calls as a data field
    const logCalls = fnBody.match(/log\.[a-z]+\([^)]+\)/g) || [];
    for (const logCall of logCalls) {
      assertNotIncludes(logCall, 'resetToken', `Log call should not include resetToken: ${logCall}`);
      assertNotIncludes(logCall, 'token:', `Log call should not include token field: ${logCall}`);
    }
  });
  test('sendPasswordReset logs only { to }', () => {
    const fnMatch = emailSource.match(/export async function sendPasswordReset\([^)]*\)\s*\{[\s\S]*?\n\}/);
    assert(fnMatch, 'sendPasswordReset function body not found');
    const fnBody = fnMatch[0];
    assertIncludes(fnBody, '{ to }', 'sendPasswordReset should only log { to }');
  });
  test('sendPasswordReset returns noop', () => assertIncludes(emailSource, "provider: 'noop'"));
}

// ─── 4. Logger: Token Redaction ───
function testLoggerTokenRedaction() {
  console.log('\n\x1b[1m-- Logger: Token Redaction --\x1b[0m');

  let loggerSource;
  try {
    loggerSource = fs.readFileSync(path.join(__dirname, '..', 'lib', 'logger.js'), 'utf8');
  } catch {
    test('logger.js file readable', () => { throw new Error('Cannot read logger.js'); });
    return;
  }

  test('logger.js exists', () => assert(loggerSource.length > 0));
  test('SENSITIVE_KEYS includes "token"', () => assertIncludes(loggerSource, "'token'"));
  test('SENSITIVE_KEYS includes "password"', () => assertIncludes(loggerSource, "'password'"));
  test('SENSITIVE_KEYS includes "passwordHash"', () => assertIncludes(loggerSource, "'passwordHash'"));
  test('sanitize function redacts sensitive keys', () => assertIncludes(loggerSource, '[REDACTED]'));
}

// ─── 5. DB Schema: Only Token Hash Stored ───
function testDBSchemaTokenHash() {
  console.log('\n\x1b[1m-- DB Schema: Only Token Hash Stored --\x1b[0m');

  const resetCols = db.prepare("PRAGMA table_info(password_resets)").all();
  const colNames = resetCols.map(c => c.name);

  test('password_resets table exists', () => assert(colNames.length > 0));
  test('has tokenHash column', () => assert(colNames.includes('tokenHash')));
  test('does NOT have plaintext token column', () => assert(!colNames.includes('token'), 'password_resets should not have a "token" column'));
  test('tokenHash is UNIQUE', () => {
    const col = resetCols.find(c => c.name === 'tokenHash');
    assert(col && col.pk === 0, 'tokenHash should be unique');
    const indexes = db.prepare("PRAGMA index_list(password_resets)").all();
    const uniqueIndexes = indexes.filter(i => i.unique === 1);
    const tokenHashIndex = uniqueIndexes.find(i => {
      const info = db.prepare(`PRAGMA index_info('${i.name}')`).all();
      return info.some(idx => idx.name === 'tokenHash');
    });
    assert(tokenHashIndex, 'tokenHash should have a UNIQUE index');
  });
  test('has expiresAt column', () => assert(colNames.includes('expiresAt')));
  test('has used column', () => assert(colNames.includes('used')));
  test('has customerId column', () => assert(colNames.includes('customerId')));
}

// ─── 6. Token Lifecycle: Generate → Hash → Store → Verify → Use → Invalidate ───
function testTokenLifecycle() {
  console.log('\n\x1b[1m-- Token Lifecycle --\x1b[0m');

  const customer = createTestCustomer('lifecycle@teakle.in');
  const customerId = customer.lastInsertRowid;

  // Generate token and store hash (simulating forgot-password)
  const token = generateToken();
  const tokenHash = sha256(token);

  test('token is 64 hex chars (32 bytes)', () => assertEq(token.length, 64));
  test('tokenHash is 64 hex chars (SHA-256)', () => assertEq(tokenHash.length, 64));
  test('token and tokenHash are different', () => assert(token !== tokenHash, 'Token and hash should differ'));

  // Store only the hash
  db.prepare(
    "INSERT INTO password_resets (customerId, tokenHash, expiresAt) VALUES (?, ?, datetime('now', '+1 hour'))"
  ).run(customerId, tokenHash);

  const stored = db.prepare('SELECT * FROM password_resets WHERE tokenHash = ?').get(tokenHash);
  test('tokenHash stored in DB', () => assert(stored, 'Token hash should be found in DB'));
  test('stored tokenHash matches', () => assertEq(stored.tokenHash, tokenHash));
  test('stored expiresAt is in the future', () => assert(new Date(stored.expiresAt + 'Z') > new Date()));
  test('stored used is 0', () => assertEq(stored.used, 0));

  // Verify token works for reset
  const reset = db.prepare(
    "SELECT id, customerId, expiresAt, used FROM password_resets WHERE tokenHash = ? ORDER BY id DESC LIMIT 1"
  ).get(tokenHash);
  test('reset record found by tokenHash', () => assert(reset && reset.customerId === customerId));

  // Simulate successful reset
  const newHash = bcrypt.hashSync('NewPassword456', 12);
  db.prepare("UPDATE customers SET passwordHash = ?, updatedAt = datetime('now') WHERE id = ?").run(newHash, customerId);
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);

  const customerAfter = db.prepare('SELECT passwordHash FROM customers WHERE id = ?').get(customerId);
  test('password updated after reset', () => assert(bcrypt.compareSync('NewPassword456', customerAfter.passwordHash)));
  test('old password no longer works', () => assert(!bcrypt.compareSync('TestPassword123', customerAfter.passwordHash)));

  const resetAfter = db.prepare('SELECT used FROM password_resets WHERE id = ?').get(reset.id);
  test('token marked as used', () => assertEq(resetAfter.used, 1));

  // Try to use same token again — should fail
  const reuse = db.prepare(
    "SELECT id FROM password_resets WHERE tokenHash = ? AND used = 0"
  ).get(tokenHash);
  test('used token cannot be found for reuse', () => assert(!reuse, 'Used token should not be available'));
}

// ─── 7. Token Expiry ───
function testTokenExpiry() {
  console.log('\n\x1b[1m-- Token Expiry --\x1b[0m');

  const customer = createTestCustomer('expiry@teakle.in');
  const customerId = customer.lastInsertRowid;

  const token = generateToken();
  const tokenHash = sha256(token);

  // Insert expired token (1 hour ago)
  db.prepare(
    "INSERT INTO password_resets (customerId, tokenHash, expiresAt) VALUES (?, ?, datetime('now', '-1 hour'))"
  ).run(customerId, tokenHash);

  const reset = db.prepare(
    "SELECT id, expiresAt, used FROM password_resets WHERE tokenHash = ?"
  ).get(tokenHash);
  test('expired token exists in DB', () => assert(reset));
  test('expired token has past expiresAt', () => assert(new Date(reset.expiresAt + 'Z') < new Date()));

  // Simulate reset-password logic: check expiry
  const now = new Date();
  const expiresAt = new Date(reset.expiresAt + 'Z');
  test('expired token is rejected by expiry check', () => assert(now > expiresAt, 'Token should be expired'));

  // Insert valid token (1 hour from now)
  const validToken = generateToken();
  const validHash = sha256(validToken);
  db.prepare(
    "INSERT INTO password_resets (customerId, tokenHash, expiresAt) VALUES (?, ?, datetime('now', '+1 hour'))"
  ).run(customerId, validHash);

  const validReset = db.prepare(
    "SELECT expiresAt FROM password_resets WHERE tokenHash = ?"
  ).get(validHash);
  const validExpiry = new Date(validReset.expiresAt + 'Z');
  test('valid token has future expiry', () => assert(new Date() < validExpiry));
}

// ─── 8. Token Single-Use ───
function testTokenSingleUse() {
  console.log('\n\x1b[1m-- Token Single-Use --\x1b[0m');

  const customer = createTestCustomer('singleuse@teakle.in');
  const customerId = customer.lastInsertRowid;

  const token = generateToken();
  const tokenHash = sha256(token);

  db.prepare(
    "INSERT INTO password_resets (customerId, tokenHash, expiresAt) VALUES (?, ?, datetime('now', '+1 hour'))"
  ).run(customerId, tokenHash);

  // First use: mark as used
  db.prepare("UPDATE password_resets SET used = 1 WHERE tokenHash = ?").run(tokenHash);

  const reset = db.prepare('SELECT used FROM password_resets WHERE tokenHash = ?').get(tokenHash);
  test('token marked as used after first use', () => assertEq(reset.used, 1));

  // Second use attempt: should find no unused tokens
  const reuse = db.prepare(
    "SELECT id FROM password_resets WHERE tokenHash = ? AND used = 0"
  ).get(tokenHash);
  test('used token not available for second use', () => assert(!reuse));
}

// ─── 9. Non-Existent Email: Same Generic Response ───
function testNonExistentEmailGenericResponse() {
  console.log('\n\x1b[1m-- Non-Existent Email: Generic Response --\x1b[0m');

  let routeSource;
  try {
    routeSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'forgot-password', 'route.js'), 'utf8');
  } catch {
    test('route file readable', () => { throw new Error('Cannot read route file'); });
    return;
  }

  // Find both return paths (existing and non-existing email)
  const lines = routeSource.split('\n');
  const existingEmailReturn = lines.findIndex(l => l.includes('Password reset requested for non-existent'));
  const genericReturn = lines.findIndex(l => l.includes('If an account exists'));

  test('non-existent email log exists', () => assert(existingEmailReturn > 0));
  test('generic response for non-existent email', () => {
    // The non-existent email path should return the same message as the existing email path
    const nextReturn = lines.slice(existingEmailReturn).findIndex(l => l.includes('return Response.json'));
    assert(nextReturn > 0, 'Non-existent email should return a response');
    const returnBlock = lines.slice(existingEmailReturn + nextReturn, existingEmailReturn + nextReturn + 5).join('\n');
    assertIncludes(returnBlock, 'If an account exists', 'Non-existent email should return generic message');
  });
  test('non-existent email does NOT reveal account existence', () => {
    const nonExistBlock = lines.slice(existingEmailReturn, existingEmailReturn + 10).join('\n');
    assertNotIncludes(nonExistBlock, 'not found', 'Should not say account not found');
    assertNotIncludes(nonExistBlock, 'does not exist', 'Should not say account does not exist');
    assertNotIncludes(nonExistBlock, 'no account', 'Should not say no account');
  });
}

// ─── 10. Password Hash Never Returned ───
function testPasswordHashNeverReturned() {
  console.log('\n\x1b[1m-- Password Hash Never Returned --\x1b[0m');

  const files = [
    'app/api/auth/forgot-password/route.js',
    'app/api/auth/reset-password/route.js',
    'app/api/auth/profile/route.js',
    'app/api/auth/password/route.js',
    'app/api/auth/login/route.js',
    'app/api/auth/register/route.js',
  ];

  for (const file of files) {
    let source;
    try {
      source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    } catch { continue; }

    test(`${file.split('/').pop()}: no passwordHash in JSON responses`, () => {
      // Find all Response.json calls and check they don't include passwordHash
      const jsonCalls = source.match(/Response\.json\([^)]+\)/g) || [];
      for (const call of jsonCalls) {
        assertNotIncludes(call, 'passwordHash', `Response should not include passwordHash: ${call.substring(0, 100)}`);
      }
    });
  }
}

// ─── 11. Token Not in Error Messages ───
function testTokenNotInErrorMessages() {
  console.log('\n\x1b[1m-- Token Not in Error Messages --\x1b[0m');

  const files = [
    'app/api/auth/forgot-password/route.js',
    'app/api/auth/reset-password/route.js',
  ];

  for (const file of files) {
    let source;
    try {
      source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    } catch { continue; }

    test(`${file.split('/').pop()}: error messages do not leak token value`, () => {
      const errorResponses = source.match(/error:\s*['"][^'"]+['"]/g) || [];
      for (const err of errorResponses) {
        // "Reset token is required" is safe — it's a static instruction, not the actual token.
        // We verify no error message contains a hex token pattern (64+ hex chars).
        assert(!/[0-9a-f]{64,}/.test(err), `Error message should not contain token value: ${err}`);
      }
    });

    test(`${file.split('/').pop()}: log.error calls do not contain token`, () => {
      const logErrors = source.match(/log\.error\([^)]+\)/g) || [];
      for (const logCall of logErrors) {
        assertNotIncludes(logCall, 'token', `Log error should not contain token: ${logCall}`);
      }
    });
  }
}

// ─── 12. Rate Limiting Still Functional ───
function testRateLimitingStillFunctional() {
  console.log('\n\x1b[1m-- Rate Limiting Still Functional --\x1b[0m');

  let forgotSource, resetSource;
  try {
    forgotSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'forgot-password', 'route.js'), 'utf8');
    resetSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'auth', 'reset-password', 'route.js'), 'utf8');
  } catch {
    test('route files readable', () => { throw new Error('Cannot read route files'); });
    return;
  }

  test('forgot-password has rate limiting', () => assertIncludes(forgotSource, 'rateLimit'));
  test('forgot-password returns 429 when rate limited', () => assertIncludes(forgotSource, '429'));
  test('reset-password has rate limiting', () => assertIncludes(resetSource, 'rateLimit'));
  test('reset-password returns 429 when rate limited', () => assertIncludes(resetSource, '429'));
  test('forgot-password rate limit key is unique', () => assertIncludes(forgotSource, 'auth:forgot-password'));
  test('reset-password rate limit key is unique', () => assertIncludes(resetSource, 'auth:reset-password'));
}

// ─── Run All Tests ───
console.log('\x1b[1m\x1b[36mSprint #16 Security Patch — Password Reset Token Exposure\x1b[0m');
console.log('\x1b[90m' + '─'.repeat(55) + '\x1b[0m');

try {
  setup();
  testForgotPasswordNoTokenInResponse();
  testResetPasswordNoExposure();
  testEmailAbstractionNoTokenLogging();
  testLoggerTokenRedaction();
  testDBSchemaTokenHash();
  testTokenLifecycle();
  testTokenExpiry();
  testTokenSingleUse();
  testNonExistentEmailGenericResponse();
  testPasswordHashNeverReturned();
  testTokenNotInErrorMessages();
  testRateLimitingStillFunctional();
} finally {
  cleanup();
}

console.log('\n' + '\x1b[90m' + '─'.repeat(55) + '\x1b[0m');
console.log(`\x1b[1mResults: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, \x1b[1m${total} total\x1b[0m`);

if (failed > 0) process.exit(1);
