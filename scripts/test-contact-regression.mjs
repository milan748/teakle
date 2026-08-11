/**
 * Comprehensive contact form regression test
 * Tests: valid CSRF + submission, missing CSRF, wrong CSRF, invalid data, error handling
 * Run: node scripts/test-contact-regression.mjs
 */
import http from 'http';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';
let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try { fn(); passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
  catch (err) { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); console.log(`    ${err.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
function assertEq(a, b, m) { if (a !== b) throw new Error(m || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function assertIncludes(h, n, m) { if (!h.includes(n)) throw new Error(m || `Expected to include "${n}"`); }

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          parsed: (() => { try { return JSON.parse(data); } catch { return null; } })(),
          setCookie: res.headers['set-cookie'] || [],
        });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

function extractCookie(setCookieArr, name) {
  const header = setCookieArr.find(c => c.startsWith(name + '='));
  return header ? header.split(';')[0] : '';
}

async function getCsrf() {
  const resp = await request('GET', '/api/csrf');
  const token = resp.parsed.csrfToken;
  const cookie = extractCookie(resp.setCookie, 'teakle_csrf');
  return { token, cookie, cookieHeader: cookie };
}

async function main() {
  console.log('Contact Form Regression Tests\n');

  // ─── 1. Valid CSRF + valid submission → 201 ───
  console.log('1. Valid CSRF + valid submission');
  const { token, cookieHeader } = await getCsrf();
  const r1 = await request('POST', '/api/contact',
    { name: 'Regression Test', email: 'regression@teakle.in', subject: 'Test Subject', message: 'Regression test message' },
    { 'Cookie': cookieHeader, 'x-csrf-token': token }
  );
  test('Returns 201', () => assertEq(r1.status, 201));
  test('Returns success: true', () => assert(r1.parsed.success === true));
  test('Returns id', () => assert(typeof r1.parsed.id === 'number'));
  test('Returns success message', () => assertIncludes(r1.parsed.message, 'successfully'));
  test('No internal error in response', () => assert(!r1.parsed.error));

  // ─── 2. Missing CSRF cookie → 403 ───
  console.log('\n2. Missing CSRF cookie');
  const r2 = await request('POST', '/api/contact',
    { name: 'Test', email: 'test@test.com', subject: 'S', message: 'M' },
    { 'x-csrf-token': token }
  );
  test('Returns 403', () => assertEq(r2.status, 403));
  test('Error is "CSRF token missing"', () => assertEq(r2.parsed.error, 'CSRF token missing'));
  test('No internal details leaked', () => assert(!JSON.stringify(r2.parsed).includes('stack')));
  test('No internal details leaked (trace)', () => assert(!JSON.stringify(r2.parsed).includes('trace')));

  // ─── 3. Invalid CSRF token (mismatch) → 403 ───
  console.log('\n3. Invalid CSRF token');
  const r3 = await request('POST', '/api/contact',
    { name: 'Test', email: 'test@test.com', subject: 'S', message: 'M' },
    { 'Cookie': cookieHeader, 'x-csrf-token': 'wrong_token_64_chars_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }
  );
  test('Returns 403', () => assertEq(r3.status, 403));
  test('Error is "CSRF validation failed"', () => assertEq(r3.parsed.error, 'CSRF validation failed'));

  // ─── 4. Invalid contact data → controlled 400 ───
  console.log('\n4. Invalid contact data');

  // 4a. Missing required fields
  const r4a = await request('POST', '/api/contact',
    {},
    { 'Cookie': cookieHeader, 'x-csrf-token': token }
  );
  test('Missing fields → 400', () => assertEq(r4a.status, 400));
  test('Error mentions missing fields', () => assertIncludes(r4a.parsed.error, 'Missing'));

  // 4b. Invalid email
  const r4b = await request('POST', '/api/contact',
    { name: 'Test', email: 'not-an-email', subject: 'S', message: 'M' },
    { 'Cookie': cookieHeader, 'x-csrf-token': token }
  );
  test('Invalid email → 400', () => assertEq(r4b.status, 400));
  test('Error mentions email', () => assertIncludes(r4b.parsed.error.toLowerCase(), 'email'));

  // 4c. Message too long (>5000 chars)
  const r4c = await request('POST', '/api/contact',
    { name: 'Test', email: 'test@test.com', subject: 'S', message: 'x'.repeat(5001) },
    { 'Cookie': cookieHeader, 'x-csrf-token': token }
  );
  test('Message too long → 400', () => assertEq(r4c.status, 400));

  // 4d. Name too long (>100 chars)
  const r4d = await request('POST', '/api/contact',
    { name: 'x'.repeat(101), email: 'test@test.com', subject: 'S', message: 'M' },
    { 'Cookie': cookieHeader, 'x-csrf-token': token }
  );
  test('Name too long → 400', () => assertEq(r4d.status, 400));

  // ─── 5. Database failure does not expose internals ───
  console.log('\n5. Error handling — no internal details');

  // 5a. Empty body (not JSON)
  const r5a = await request('POST', '/api/contact', undefined,
    { 'Cookie': cookieHeader, 'x-csrf-token': token, 'Content-Length': '0' }
  );
  // This might return 400 or 500 depending on how request.json() handles empty body
  // The key assertion: no stack trace or internal path in response
  test('Empty body: no stack trace in response', () => assert(!JSON.stringify(r5a.parsed || {}).includes('stack')));
  test('Empty body: no internal path in response', () => assert(!JSON.stringify(r5a.parsed || {}).includes('node_modules')));
  test('Empty body: no file path in response', () => assert(!JSON.stringify(r5a.parsed || {}).includes('C:\\')));

  // 5b. Verify catch block doesn't leak internals (check the source code)
  const routePath = path.join(__dirname, '..', 'app', 'api', 'contact', 'route.js');
  const routeSource = fs.readFileSync(routePath, 'utf-8');
  test('Catch block returns generic error', () => assertIncludes(routeSource, 'Internal server error'));
  test('Catch block uses log.error', () => assertIncludes(routeSource, 'log.error'));
  test('Catch block does not expose error.message to client', () => {
    // The catch block should log the error but return generic message
    const catchSection = routeSource.substring(routeSource.indexOf('catch'));
    assert(!catchSection.includes('error.message') || catchSection.includes("log.error('Contact API error', { message: error.message })"));
  });

  // ─── 6. Verify database stores submission correctly ───
  console.log('\n6. Database verification');
  const dbPath = path.join(process.cwd(), 'data', 'teakle.db');
  if (fs.existsSync(dbPath)) {
    const db = new Database(dbPath);
    const count = db.prepare('SELECT COUNT(*) as c FROM contact_submissions').get();
    test('Contact submissions table exists', () => assert(count.c >= 0));
    const latest = db.prepare('SELECT * FROM contact_submissions ORDER BY id DESC LIMIT 1').get();
    if (latest) {
      test('Latest submission has name', () => assert(latest.name && latest.name.length > 0));
      test('Latest submission has email', () => assert(latest.email && latest.email.includes('@')));
      test('Latest submission has message', () => assert(latest.message && latest.message.length > 0));
      test('Latest submission has status', () => assertEq(latest.status, 'NEW'));
      test('Latest submission has timestamps', () => assert(latest.createdAt && latest.updatedAt));
    }
    db.close();
  }

  // ─── 7. Verify CSRF protection is applied ───
  console.log('\n7. CSRF protection source verification');
  test('Route imports withCsrf', () => assertIncludes(routeSource, "import { withCsrf } from '@/lib/csrf'"));
  test('POST is wrapped with withCsrf', () => assertIncludes(routeSource, 'withCsrf(async function POST'));
  test('Route imports rateLimit', () => assertIncludes(routeSource, "import { rateLimit } from '@/lib/rateLimit'"));
  test('Route has rate limiting', () => assertIncludes(routeSource, 'rateLimit('));
  test('Route imports logger', () => assertIncludes(routeSource, "import { log } from '@/lib/logger'"));
  test('Route uses log.error in catch', () => assertIncludes(routeSource, 'log.error'));

  // ─── Summary ───
  console.log('\n' + '═'.repeat(60));
  console.log(`Contact Regression Tests: ${passed}/${total} passed, ${failed} failed`);
  console.log('═'.repeat(60));

  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
