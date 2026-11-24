// probe133 — build 133's browser probe of stage 10 only: a work page (#nail1 … #nima3) or the stage page (#stage=10).
//   node tools/probe133.cjs PAGE.html OUTDIR HASH [script.js]    — the script (optional) runs in node with { pg, st, shot, log, wait }
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [PAGE, OUT, HASH = '#stage=10', SCRIPT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const body = fs.readFileSync(PAGE);
const srv = http.createServer((q, s) => { s.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); s.end(body); }).listen(0);
(async () => {
  const port = srv.address().port, url = `http://localhost:${port}/mikdash/v/133/${HASH}`;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 900, height: 420 }, hasTouch: false, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message.slice(0, 300)));
  pg.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || /\[h133\]/.test(t)) errs.push(m.type() + ' ' + t.slice(0, 300)); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript((extra) => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; try { localStorage.clear(); } catch (e) { /* */ } if (extra) { try { (0, eval)(extra); } catch (e) { console.error('init', e.message); } } }, process.env.INIT || '');
  const T0 = Date.now();
  await pg.goto(url);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 250, timeout: 200000 });
  const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s]`, ...a);
  log('booted');
  const st = () => pg.evaluate(() => { const H = window.__T.game.h109; return H ? { site: H.site, ...H.state() } : null; });
  let n = 0; const shot = async (name) => { const p = path.join(OUT, `${String(++n).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: p }); return p; };
  const wait = (ms) => pg.waitForTimeout(ms);
  const unmodal = () => pg.evaluate(() => { const m = document.querySelector('.gm-modal button'); if (m) { m.click(); return true; } return false; });
  if (SCRIPT) { const fn = require(path.resolve(SCRIPT)); await fn({ pg, st, shot, log, wait, errs, unmodal }); }
  else {
    for (let i = 0; i < 40; i++) { await unmodal(); const s = await st(); if (s && s.phase === 'act' && s.act) { log('act', JSON.stringify(s.act).slice(0, 600)); break; } if (i % 5 === 0) log('state', s && s.site, s && s.phase, s && s.mission); await wait(1000); }
    await wait(1500); log('still', await shot('act'));
  }
  log(`page errors: ${errs.length}`, errs.slice(0, 12).join(' | '));
  await b.close(); srv.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
