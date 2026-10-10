const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
(async () => {
  fs.mkdirSync('typography-screenshots', { recursive: true });
  const response = await fetch('https://raw.githubusercontent.com/cnshiyang/cnshiyang.github.io/83a5e118c447d59ad01cbcb8e5353b80f7647c06/styles.css');
  assert(response.ok, 'Reference stylesheet must load');
  const referenceCSS = await response.text();
  const fixture = '<!doctype html><html><head><style>' + referenceCSS + '</style></head><body><header class="topbar"><div class="topbar-inner page-width"><a class="site-name">Lixian Chen</a><nav><a>Education</a></nav></div></header><main class="page-width"><section class="profile"><div></div><div class="profile-info"><h1>Lixian Chen</h1><div class="profile-details"><p class="role">Incoming M.S. Student</p><p class="institution">Southeast University</p></div><div class="profile-links"><a>Google Scholar</a></div></div></section><section class="bio"><p>I will join Southeast University as a master’s student in Fall 2027.</p></section><section class="content-section"><h2>Education</h2><article class="education-item"><h3>Southeast University</h3></article><article class="publication"><h3>Robust Multimodal Learning</h3></article></section></main></body></html>';
  const root = path.resolve('_site');
  const server = http.createServer((req, res) => {
    const route = new URL(req.url, 'http://localhost').pathname;
    if (route === '/reference-fonts') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fixture); return; }
    let target = path.resolve(root, '.' + decodeURIComponent(route));
    if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { res.writeHead(404); res.end(); return; }
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf' };
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    res.end(fs.readFileSync(target));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
  const reference = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url);
  await reference.goto(url + '/reference-fonts');
  await page.evaluate(() => document.fonts.ready);
  const pairs = [
    ['Name', '#profile-name', '.profile-info h1'],
    ['Biography', '.bio p', '.bio p'],
    ['Section heading', '.section-heading h2', '.content-section h2'],
    ['University', '.education-copy h3', '.education-item h3'],
    ['Paper title', '.publication h3', '.publication h3'],
    ['Navigation', '.site-header nav a', '.topbar nav a'],
    ['Site name', '.wordmark', '.site-name'],
    ['Role', '.profile-role', '.role'],
    ['Contact button', '.contact-links a', '.profile-links a']
  ];
  const properties = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
  const readStyle = (locator) => locator.first().evaluate((el, keys) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(keys.map(key => [key, style[key]]));
  }, properties);
  let desktopStyles;
  for (const width of [320, 375, 520, 620, 768, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 1100 });
    await reference.setViewportSize({ width, height: 1100 });
    // Chromium may acknowledge viewport resizing before media queries reach the next frame.
    await Promise.all([page, reference].map(p => p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))));
    assert.equal(await page.evaluate(() => innerWidth), width);
    assert.equal(await reference.evaluate(() => innerWidth), width);
    const styles = [];
    for (const [label, ours, theirs] of pairs) {
      const actual = await readStyle(page.locator(ours));
      const expected = await readStyle(reference.locator(theirs));
      assert.deepEqual(actual, expected, label + ' typography mismatch at ' + width);
      styles.push({ label, actual, expected });
    }
    if (width === 1440) desktopStyles = styles;
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow at ' + width);
    if (width >= 1440) assert((await page.locator('main').boundingBox()).width / width >= .85, 'Wide layout must remain');
  }
  console.log('PASS typography: 9 element types match the pinned reference font families, sizes, weights, line heights and tracking at all 8 viewport widths.');
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.locator('#publications').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Array.from(document.images).every(i => i.complete && i.naturalWidth > 0));
  await page.evaluate(() => scrollTo(0, 0));
  assert.equal(await page.locator('.publication').count(), 3);
  assert((await page.locator('link[rel="icon"]').getAttribute('href')).endsWith('/pikachu.svg'));
  await page.screenshot({ path: 'typography-screenshots/desktop.png', fullPage: true });
  console.log('LAYOUT_PREVIEW_BASE64=' + (await page.screenshot({ type: 'jpeg', quality: 82 })).toString('base64'));
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.screenshot({ path: 'typography-screenshots/dark-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({ path: 'typography-screenshots/mobile.png', fullPage: true });
  console.log('MOBILE_PREVIEW_BASE64=' + (await page.screenshot({ type: 'jpeg', quality: 80 })).toString('base64'));
  await page.goto(url + '/cv/');
  assert.equal(await page.locator('main a').count(), 0, 'CV body must stay free of links');
  assert.equal(await page.locator('main .publication').count(), 3);
  assert.deepEqual(errors, []);
  fs.writeFileSync('typography-screenshots/font-comparison.json', JSON.stringify({ referenceCommit: '83a5e118c447d59ad01cbcb8e5353b80f7647c06', viewports: [320,375,520,620,768,1440,1920,2560], desktop: desktopStyles }, null, 2));
  console.log('PASS layout: three papers, Pikachu favicon, light/dark controls, responsive widths and CV body without links.');
  await browser.close();
  await new Promise(resolve => server.close(resolve));
})().catch(e => { console.error(e); process.exit(1); });
