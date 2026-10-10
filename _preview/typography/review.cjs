const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const specs = require(path.resolve('_preview/typography/specs.json'));
(async () => {
  fs.mkdirSync('typography-screenshots', { recursive: true });
  const browser = await chromium.launch();
  const http = require('node:http');
  const rootDir = path.resolve('_site');
  const server = http.createServer((req, res) => {
    const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let target = path.resolve(rootDir, '.' + requested);
    if (target !== rootDir && !target.startsWith(rootDir + path.sep)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { res.writeHead(404); res.end(); return; }
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    res.end(fs.readFileSync(target));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  const production = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await production.goto(url);
  await production.evaluate(() => document.fonts.ready);
  assert(await production.evaluate(() => document.fonts.check('16px SiteManrope')), 'Default site font must load');
  assert.equal(await production.locator('#profile-name').evaluate(el => getComputedStyle(el).fontSize), '35px');
  assert.equal(await production.locator('#profile-name').evaluate(el => getComputedStyle(el).fontWeight), '500');
  assert.equal(await production.locator('.bio p').first().evaluate(el => getComputedStyle(el).fontSize), '18px');
  assert((await production.locator('link[rel="icon"]').getAttribute('href')).endsWith('/pikachu.svg'));
  assert((await (await production.request.get(url + '/assets/academic/pikachu.svg')).text()).includes('Pikachu'));
  assert.equal(await production.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
  assert((await production.locator('.portrait').boundingBox()).width >= 240, 'Desktop portrait must have a balanced visual size');
  await production.getByRole('button', { name: 'Switch to dark theme' }).click();
  assert.equal(await production.locator('html').getAttribute('data-theme'), 'dark');
  await production.screenshot({ path: 'typography-screenshots/default-dark-desktop.png', fullPage: true });
  await production.getByRole('button', { name: 'Switch to light theme' }).click();
  await production.screenshot({ path: 'typography-screenshots/default-wide-desktop.png', fullPage: true });
  for (const width of [320, 375, 768, 1440, 1920, 2560]) {
    await production.setViewportSize({ width, height: 1000 });
    assert(await production.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Production horizontal overflow ' + width);
    if (width >= 1440) {
      const box = await production.locator('main').boundingBox();
      assert(box.width / width >= 0.85, 'Desktop content area must fill at least 85% of viewport');
    }
  }
  await production.setViewportSize({ width: 375, height: 900 });
  await production.screenshot({ path: 'typography-screenshots/default-mobile.png', fullPage: true });
  await production.setViewportSize({ width: 1440, height: 1100 });
  const layoutShot = await production.screenshot({ type: 'jpeg', quality: 80 });
  console.log('LAYOUT_PREVIEW_BASE64=' + layoutShot.toString('base64'));
  await production.close();
  await new Promise(resolve => server.close(resolve));
  console.log('PASS production: refined Manrope layout, Pikachu favicon, fluid width and no overflow at 320–2560px.');

  let baseline;
  const crops = [];
  for (const spec of specs) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    const errors = [];
    const external = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('https://**/*', route => { external.push(route.request().url()); return route.abort(); });
    await page.goto(pathToFileURL(path.resolve('typography-variants', spec.id + '.html')).href);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#publications').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Array.from(document.images).every(i => i.complete && i.naturalWidth > 0));
    await page.evaluate(() => window.scrollTo(0, 0));
    const body = await page.locator('body').innerText();
    if (baseline === undefined) baseline = body; else assert.equal(body, baseline, 'Typography variants must preserve the same content');
    assert.equal(await page.locator('#publications .publication').count(), 3);
    assert.equal(await page.locator('#profile-name').evaluate(el => getComputedStyle(el).fontSize), spec.name + 'px');
    assert(await page.evaluate(() => document.fonts.check('16px PreviewType')), 'Embedded typeface must load offline');
    assert.equal(external.length, 0, 'No external assets may be needed');
    await page.screenshot({ path: 'typography-screenshots/' + spec.id + '-desktop.png', fullPage: true });
    const shot = await page.locator('.profile').screenshot({ type: 'jpeg', quality: 88 });
    crops.push({ label: spec.label + ' · ' + spec.name + 'px', image: shot.toString('base64') });
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    for (const width of [320, 375, 768, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Horizontal overflow: ' + spec.id + ' ' + width);
      if (width >= 1440) assert((await page.locator('main').boundingBox()).width / width >= 0.85, 'Variant must use the wide layout');
    }
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.screenshot({ path: 'typography-screenshots/' + spec.id + '-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS ' + spec.id + ': offline assets, three publications, identical content, typography, theme and responsive widths.');
    await page.close();
  }
  const sheet = await browser.newPage({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 1 });
  const faviconData = 'data:image/svg+xml;base64,' + fs.readFileSync('_site/assets/academic/pikachu.svg').toString('base64');
  await sheet.setContent('<html><body style="margin:0;padding:30px;background:#f0f2ee;font:16px Arial"><div style="display:flex;align-items:center;gap:24px;padding:8px 28px 24px"><strong>New favicon</strong><img width="16" height="16" src="' + faviconData + '"><img width="32" height="32" src="' + faviconData + '"><img width="64" height="64" src="' + faviconData + '"></div>' + crops.map(c => '<section style="background:#fafbf8;padding:20px 28px;margin-bottom:18px;border:1px solid #dde4dc;border-radius:10px"><p style="margin:0 0 16px;color:#245c49;font-weight:600">' + c.label + '</p><img style="display:block;width:100%;height:auto" src="data:image/jpeg;base64,' + c.image + '"></section>').join('') + '</body></html>');
  const contact = await sheet.screenshot({ path: 'typography-screenshots/comparison.jpg', type: 'jpeg', quality: 80, fullPage: true });
  console.log('TYPOGRAPHY_COMPARISON_BASE64=' + contact.toString('base64'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
