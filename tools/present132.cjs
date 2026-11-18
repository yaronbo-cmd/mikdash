// present132 — build 132's run of the presentation links: a built page served as /mikdash/v/131/ (+ a hash), booted headless.
//   node tools/present132.cjs PAGE.html OUTDIR LABEL [HASH] [menu]   (flock /tmp/probe109.lock timeout 300 node tools/present132.cjs …)
//   With 'menu': the menu opened, its two entries' tags and hrefs read, a still. Else: what opened (Phase B, the tour, Phase A,
//   a work page), a still after it opens. Every run: page errors and console errors.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [PAGE, OUT, LABEL, HASH = '', MODE = ''] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const body = fs.readFileSync(PAGE);
const srv = http.createServer((q, s) => { if (q.url.split('?')[0].startsWith('/mikdash/v/131/')) { s.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return s.end(body); } s.writeHead(404); s.end(); }).listen(0);
(async () => {
  const url = `http://localhost:${srv.address().port}/mikdash/v/131/${HASH}`;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 900, height: 420 }, hasTouch: true, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push('pageerror ' + e.message.slice(0, 200)));
  pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error ' + m.text().slice(0, 200)); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const T0 = Date.now();
  await pg.goto(url);
  await pg.waitForFunction(() => window.__T && window.__T.booted && (window.__T.game || window.__AVODAH || window.__SCENES), null, { polling: 250, timeout: 240000 });
  console.log(`[${LABEL}] ${url} — booted in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  await pg.waitForTimeout(9000);
  const state = () => pg.evaluate(() => ({ hash: location.hash, phaseB: !!window.__AVODAH, tour: !!window.__SCENES && document.body.classList.contains('sc-on'), phaseA: !!(document.querySelector('.gm') && !document.body.classList.contains('sc-on') && !window.__AVODAH), work: document.body.classList.contains('h109-quiet') || !!document.querySelector('.gm.h109-own') }));
  console.log('state:', JSON.stringify(await state()));
  if (MODE === 'menu') {
    for (let i = 0; i < 6; i++) { await pg.evaluate(() => { const c = document.querySelector('.gm-cine:not(.gm-hidden)'); if (c) c.click(); const m = document.querySelector('.gm-modal button'); if (m) m.click(); }); await pg.touchscreen.tap(450, 260); await pg.waitForTimeout(600); }
    await pg.evaluate(() => { const e = document.querySelector('[data-a=sheet][data-k=menu]'); if (e) e.click(); });
    await pg.waitForTimeout(1500);
    const ents = await pg.evaluate(() => { const r = []; document.querySelectorAll('.gm-sheet .gm-sh-b [data-present], .gm-sheet .gm-sh-b [data-a=avodah], .gm-sheet .gm-sh-b [data-a=scenes]').forEach((e) => r.push({ tag: e.tagName.toLowerCase(), cls: e.className, href: e.getAttribute('href'), target: e.getAttribute('target'), rel: e.getAttribute('rel'), text: e.innerText.replace(/\s+/g, ' ').trim() })); return r; });
    for (const e of ents) console.log('entry:', JSON.stringify(e));
    await pg.evaluate(() => { const e = document.querySelector('.gm-sheet [data-present=preview], .gm-sheet [data-a=avodah]'); if (e) e.scrollIntoView({ block: 'center' }); });
    await pg.waitForTimeout(500);
  }
  const shot = path.join(OUT, `present132-${LABEL}.png`);
  await pg.screenshot({ path: shot });
  console.log('still:', shot);
  console.log(`errors: ${errs.length}${errs.length ? ' — ' + JSON.stringify(errs.slice(0, 6)) : ''}`);
  await b.close(); srv.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
