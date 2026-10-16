// Round 3 in the REAL 3D build (dist/test.html, SwiftShader; slow): the tour's stamps and "לתחנה הבאה" over the world,
// and the tour's last stop with its door to the Ark. Phone 390 × 844.
//   node build.mjs && NODE_PATH=... node test/playtest/real-shots-r3.cjs   → test/out/playtest/real-r3-*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking'] });
  const results = [];
  const ok = (name, pass, info = '') => { results.push({ name, pass }); console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (info ? '  · ' + info : '')); };
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g/.test(m.text())) errors.push(m.text()); });
    pg.on('pageerror', (e) => errors.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) { /* */ } });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 500, timeout: 400000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const shot = async (name) => { const s0 = Date.now(); await G(() => { window.__HUD_HOLD = true; window.__T.render(); window.__T.render(); }); await pg.screenshot({ path: path.join(OUT, `real-r3-${name}.png`), timeout: 300000 }); await G(() => { window.__HUD_HOLD = false; }); console.log(`   shot real-r3-${name}.png (${((Date.now() - s0) / 1000).toFixed(0)} s)`); };
    await G(() => { window.__openScenes('tour', 0); });
    await pg.waitForFunction(() => !!document.querySelector('.sc-root .sc-stamps'), null, { timeout: 60000, polling: 500 }).catch(() => {});
    await sleep(800);
    await G(() => { const b = document.querySelector('[data-hk="nextstop"]'); if (b) b.click(); });
    await sleep(1500);
    const s1 = await G(() => ({ id: window.__SCENES && window.__SCENES.state.id, row: (document.querySelector('.sc-stamps') || {}).textContent || '' }));
    ok('real build: "לתחנה הבאה" moves the tour to the kiyor, 2/10 stamps', s1.id === 'kiyor' && /2\/10/.test(s1.row.replace(/[⁦-⁩]/g, '')), JSON.stringify(s1));
    await shot('tour-kiyor-stamps');
    // to the last stop's last card (the door)
    await G(async () => { const S = window.__SCENES; S.wash(); await S.goStop(S.state.stops.length - 1, 0); for (let k = 0; k < 6 && !document.querySelector('.sc-done'); k++) await S.next(0); });
    await sleep(1500);
    const door = await G(() => (document.querySelector('.sc-done') || {}).textContent || '');
    ok('real build: the tour\'s last card shows the door to the Ark', /איפה הארון/.test(door), door.slice(0, 80));
    await shot('tour-door');
    ok('real build: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
    await ctx.close();
  } finally { await b.close(); }
  const f = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - f}/${results.length} passed`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
