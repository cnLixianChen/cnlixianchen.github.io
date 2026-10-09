const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const specs = require(path.resolve('_preview/typography/specs.json'));
(async () => {
  fs.mkdirSync('typography-screenshots', { recursive: true });
  const browser = await chromium.launch();
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
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Horizontal overflow: ' + spec.id + ' ' + width);
    }
    await page.setViewportSize({ width: 375, height: 1000 });
    await page.screenshot({ path: 'typography-screenshots/' + spec.id + '-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS ' + spec.id + ': offline assets, three publications, identical content, typography, theme and responsive widths.');
    await page.close();
  }
  const sheet = await browser.newPage({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 1 });
  await sheet.setContent('<html><body style="margin:0;padding:30px;background:#f0f2ee;font:16px Arial">' + crops.map(c => '<section style="background:#fafbf8;padding:20px 28px;margin-bottom:18px;border:1px solid #dde4dc;border-radius:10px"><p style="margin:0 0 16px;color:#245c49;font-weight:600">' + c.label + '</p><img style="display:block;width:100%;height:auto" src="data:image/jpeg;base64,' + c.image + '"></section>').join('') + '</body></html>');
  const contact = await sheet.screenshot({ path: 'typography-screenshots/comparison.jpg', type: 'jpeg', quality: 80, fullPage: true });
  console.log('TYPOGRAPHY_COMPARISON_BASE64=' + contact.toString('base64'));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
