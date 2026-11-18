// check132 — build 132's browser check of a built play page served as a GitHub Pages version folder (/mikdash/v/131/):
//   the inline manifest (CDP Page.getAppManifest: its errors, its fields; the icons decoded in the page), the console's warnings,
//   the game's boot (page errors) and the menu (a still; whether it offers "הצצה: העבודה בבית" and "סיור בבית המקדש").
//   node tools/check132.cjs PAGE.html OUTDIR [label]     (wrap it: flock /tmp/probe109.lock timeout 300 node tools/check132.cjs …)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [PAGE, OUT, LABEL = 'page'] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const body = fs.readFileSync(PAGE);
const srv = http.createServer((q, s) => {
  const p = q.url.split('?')[0];
  if (p === '/mikdash/v/131/' || p === '/mikdash/v/131/index.html') { s.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return s.end(body); }
  s.writeHead(404); s.end();
}).listen(0);
(async () => {
  const port = srv.address().port, url = `http://localhost:${port}/mikdash/v/131/`;
  const b = await chromium.launch({ channel: 'chromium' });   // (the full Chromium: the headless shell has no manifest/installability path)
  const ctx = await b.newContext({ viewport: { width: 900, height: 420 }, hasTouch: true, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [], warns = [];
  pg.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  pg.on('console', (m) => { if (m.type() === 'error') errs.push('console.error ' + m.text().slice(0, 200)); if (m.type() === 'warning') warns.push(m.text().slice(0, 200)); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const T0 = Date.now();
  await pg.goto(url);
  const cdp = await ctx.newCDPSession(pg);
  const man = await cdp.send('Page.getAppManifest');
  const inst = await cdp.send('Page.getInstallabilityErrors').catch((e) => ({ err: e.message }));
  const appId = await cdp.send('Page.getAppId').catch(() => ({}));
  let M = null; try { M = JSON.parse(man.data); } catch (e) { /* none */ }
  const icons = await pg.evaluate(async (list) => Promise.all(list.map((i) => new Promise((res) => { const im = new Image(); im.onload = () => res(`${i.sizes} ${i.purpose}: decoded ${im.naturalWidth}x${im.naturalHeight}, ${Math.round(i.src.length * 3 / 4 / 1024 * 10) / 10} KB`); im.onerror = () => res(`${i.sizes} ${i.purpose}: NOT decoded`); im.src = i.src; }))), (M && M.icons) || []);
  console.log(`[${LABEL}] ${url}`);
  console.log(`manifest url: ${(man.url || '').slice(0, 40)}… (${(man.data || '').length} chars), errors: ${JSON.stringify(man.errors)}`);
  if (M) console.log(`fields: id=${M.id} start_url=${M.start_url} scope=${M.scope} name=${M.name} short_name=${M.short_name} display=${M.display} orientation=${M.orientation} theme=${M.theme_color} bg=${M.background_color} lang=${M.lang} dir=${M.dir}`);
  console.log(`appId: ${JSON.stringify(appId)}; installability errors: ${JSON.stringify(inst.installabilityErrors || inst)}`);
  console.log('icons:', icons.join(' · ') || 'none');
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 250, timeout: 200000 });
  console.log(`booted in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  await pg.waitForTimeout(3000);
  for (let i = 0; i < 8; i++) { await pg.evaluate(() => { const c = document.querySelector('.gm-cine:not(.gm-hidden)'); if (c) c.click(); const m = document.querySelector('.gm-modal button'); if (m) m.click(); }); await pg.touchscreen.tap(450, 260); await pg.waitForTimeout(600); }
  await pg.evaluate(() => { const e = document.querySelector('[data-a=sheet][data-k=menu]'); if (e) e.click(); });
  await pg.waitForTimeout(1500);
  const menu = await pg.evaluate(() => { const s = document.querySelector('.gm-sheet .gm-sh-b'); return s ? s.innerText : ''; });
  const shot = path.join(OUT, `menu-${LABEL}.png`);
  await pg.screenshot({ path: shot });
  const nScroll = await pg.evaluate(() => { const s = document.querySelector('.gm-sheet .gm-sh-b'); if (!s) return 0; s.scrollTop = s.scrollHeight; return s.scrollHeight; });
  const shot2 = path.join(OUT, `menu-${LABEL}-end.png`);
  if (nScroll) { await pg.waitForTimeout(400); await pg.screenshot({ path: shot2 }); }
  console.log(`menu offers "הצצה: העבודה בבית": ${menu.includes('הצצה: העבודה בבית')}; "סיור בבית המקדש": ${menu.includes('סיור בבית המקדש')}; "העבודה בבית" at all: ${menu.includes('העבודה בבית')}`);
  console.log(`stills: ${shot}${nScroll ? ' · ' + shot2 : ''}`);
  const manWarn = warns.filter((w) => /manifest|icon/i.test(w));
  console.log(`console warnings: ${warns.length} (about the manifest or icons: ${manWarn.length})${warns.length ? ' — ' + JSON.stringify(warns.slice(0, 5)) : ''}`);
  console.log(`page errors: ${errs.length}${errs.length ? ' — ' + JSON.stringify(errs.slice(0, 5)) : ''}`);
  console.log(`wall ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  await b.close(); srv.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
