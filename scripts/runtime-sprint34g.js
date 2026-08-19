/**
 * Sprint #34G — Runtime Tests
 * Run against dev server on port 3099
 */
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3099';
let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  return fn().then(ok => {
    if (ok) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`); }
    else { failed++; console.log(`  \x1b[31m✗\x1b[0m ${name}`); }
  }).catch(err => {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${err.message}`);
  });
}
async function fetchPage(path) {
  const r = await fetch(BASE + path, { redirect: 'manual' });
  return { status: r.status, text: await r.text() };
}

async function run() {
  console.log('\n1. Page Status Codes');

  await test('Homepage returns 200', async () => {
    const { status } = await fetchPage('/');
    return status === 200;
  });

  await test('Gallery returns 200', async () => {
    const { status } = await fetchPage('/gallery');
    return status === 200;
  });

  await test('Hero Product returns 200', async () => {
    const { status } = await fetchPage('/shop/anchor-table');
    return status === 200;
  });

  await test('Gallery with Limited Edition filter returns 200', async () => {
    const { status } = await fetchPage('/gallery?availability=Limited+Edition');
    return status === 200;
  });

  await test('Invalid route returns 404', async () => {
    const { status } = await fetchPage('/nonexistent-page-xyz');
    return status === 404;
  });

  console.log('\n2. DOM Structure');

  await test('Homepage has nav-dropdown-desktop-link (single Gallery element)', async () => {
    const { text } = await fetchPage('/');
    return text.includes('nav-dropdown-desktop-link');
  });

  await test('Homepage has nav-dropdown-mobile-link (single Gallery element)', async () => {
    const { text } = await fetchPage('/');
    return text.includes('nav-dropdown-mobile-link');
  });

  await test('No nav-dropdown-mobile-trigger (duplicate removed)', async () => {
    const { text } = await fetchPage('/');
    return !text.includes('nav-dropdown-mobile-trigger');
  });

  await test('Homepage has Hero Edition', async () => {
    const { text } = await fetchPage('/');
    return text.includes('Hero Edition');
  });

  await test('Homepage has Limited Edition', async () => {
    const { text } = await fetchPage('/');
    return text.includes('Limited Edition');
  });

  await test('No "Anchor Table" sub-text in Gallery dropdown', async () => {
    const { text } = await fetchPage('/');
    return !text.includes('nav-dropdown-featured-sub');
  });

  await test('Homepage has close button', async () => {
    const { text } = await fetchPage('/');
    return text.includes('nav-mobile-close-btn');
  });

  await test('Homepage has search row', async () => {
    const { text } = await fetchPage('/');
    return text.includes('nav-mobile-search-row');
  });

  console.log('\n3. Navigation');

  await test('All nav links return 200', async () => {
    const links = ['/archive', '/studio', '/journal', '/custom', '/login', '/cart'];
    for (const l of links) {
      const { status } = await fetchPage(l);
      if (status !== 200) return false;
    }
    return true;
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Runtime Tests: ${passed}/${total} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
