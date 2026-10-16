// The Phase A → Phase B handoff and the Phase B hooks in the REAL 3D build (dist/test.html, SwiftShader; slow).
//   node build.mjs && NODE_PATH=... node test/playtest/real-handoff.cjs     → test/out/playtest/real-b-*.png
// 1. Phase A's menu while the House is built: the button reads "הצצה"      (real-b-1-menu-preview.png)
// 2. The altar complete: the invitation card (Ezra 3:6)                    (real-b-2-invite-altar.png)
// 3. "לעבודה הראשונה" → Phase B opens straight into "העבודה שלך היום"      (real-b-3-ritual-first-game.png)
// 4. The ritual's summary: the day's work, the ממונה, "מחר: …"             (real-b-4-ritual-summary.png)
// 5. The home: the day panel, the Sukkot bulls strip, the ritual done       (real-b-5-home-day-panel.png)
// The clock of Phase B is pinned to Chol HaMoed Sukkot, 28.9.2026 17:30 (between the afternoon Tamid and Beit HaShoevah).
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
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'dusk'; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__GAME_LOG = [];
      window.__AV_NOW = Date.parse('2026-09-28T17:30:00+03:00'); window.__AV_T0 = performance.now();
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const t0 = Date.now();
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 500, timeout: 400000 });
    console.log(`booted in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    const G = (fn, a) => pg.evaluate(fn, a);
    const shot = async (name) => {
      const s0 = Date.now();
      await G(() => { window.__HUD_HOLD = true; window.__T.render(); window.__T.render(); });
      await pg.screenshot({ path: path.join(OUT, `real-b-${name}.png`), timeout: 300000 });
      await G(() => { window.__HUD_HOLD = false; });
      console.log(`   shot real-b-${name}.png (${((Date.now() - s0) / 1000).toFixed(0)} s)`);
    };
    const dismissA = async () => { for (let k = 0; k < 6; k++) { const on = await pg.$('.gm-modal.on .gm-btn-gold'); if (!on) break; await on.click(); await sleep(400); } };

    // a builder in the middle of chapter 3: the altar's body is done, the horns are next
    await G(() => {
      const g = __T.game.state; g.ftue = 99; g.name = 'אלעזר'; g.mishmar = 8; __T.game.ui.coach(null, '');
      for (const id of ['har', 'wall', 'gates', 'nashim', 'yesod', 'sovev', 'guf']) g.st[id] = { done: true };
      g.bh = g.bh.map(() => 0); __T.game._.resync();
    });
    await sleep(800); await dismissA();
    await G(() => { const m = document.querySelector('[data-a="sheet"][data-k="menu"]'); if (m) m.click(); });
    await sleep(900);
    const label = await G(() => (document.querySelector('[data-a="avodah"]') || {}).textContent || '');
    ok('Phase A menu: the Phase B button reads "הצצה" while the House is built', /הצצה/.test(label), label.trim().slice(0, 80));
    await shot('1-menu-preview');
    await G(() => { const x = document.querySelector('.gm-sheet [data-a="close"], .gm-x'); if (x) x.click(); });
    await sleep(500);

    // the horns done: the altar is complete → the invitation (the real flow calls it after the karnot stage card)
    await G(() => { const g = __T.game.state; g.st.karnot = { done: true }; __T.game._.resync(); __T.game.engagement.avodahInvite('altar'); });
    await pg.waitForSelector('.gm-modal.on', { timeout: 10000 }).catch(() => {});
    await sleep(500);
    const inv = await G(() => (document.querySelector('.gm-modal.on') || {}).innerText || '');
    ok('the altar complete: the invitation quotes Ezra 3:6', /עזרא ג, ו/.test(inv) && /לֹא יֻסָּד/.test(inv), inv.split('\n')[1] || '');
    await shot('2-invite-altar');
    await G(() => { const b = document.querySelector('.gm-modal.on .gm-btn-gold'); if (b) b.click(); });
    await pg.waitForFunction(() => !!window.__AVODAH && document.querySelector('.av'), null, { timeout: 90000, polling: 500 });
    ok('"לעבודה הראשונה" opens Phase B', true);
    // the first visit's intro card, then the ritual starts by itself (the one-shot intent)
    for (let k = 0; k < 40; k++) { const intro = await pg.$('.av-modal.on [data-v="go"]'); if (intro) { await intro.click(); break; } await sleep(500); }
    let seen = [], last = null, firstShot = false, summary = '';
    for (let guard = 0; guard < 300; guard++) {
      const st = await G(() => ({ g: window.__AVODAH._.game, busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on'), kick: ((document.querySelector('.av-modal.on .av-kick') || {}).textContent || '') }));
      if (st.g && st.g !== last && st.mg) {
        last = st.g; seen.push(st.g);
        await sleep(4500);
        if (!firstShot) { firstShot = true; await shot('3-ritual-first-game'); }
        await G(() => window.__AVODAH._.solve());
        await sleep(1200);
        continue;
      }
      if (st.modal) {
        if (/סוף העבודה/.test(st.kick)) { summary = await G(() => document.querySelector('.av-modal.on').innerText); await sleep(400); await shot('4-ritual-summary'); }
        await G(() => { const g = document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); });
        await sleep(600); continue;
      }
      if (!st.busy && seen.length) break;
      await sleep(600);
    }
    ok('the ritual ran: the payis, the role\'s work, the song', seen[0] === 'payis2' && seen.length >= 2, seen.join(','));
    ok('the summary ends with tomorrow', /מחר:/.test(summary), (summary.split('\n').find((l) => /מחר:/.test(l)) || '').slice(0, 90));
    await sleep(1500);
    const home = await G(() => ({ panel: !!document.querySelector('.av-home.on .hk-today'), bulls: !!document.querySelector('.av-home.on .hk-bulls'), pa: !!document.querySelector('.av-home.on .hk-pa'), text: (document.querySelector('.av-home.on .hk-today') || {}).innerText || '' }));
    ok('the home: the day panel, the Sukkot bulls, the Phase A line (the House is still being built)', home.panel && home.bulls && home.pa, home.text.replace(/\s+/g, ' ').slice(0, 120));
    await shot('5-home-day-panel');
    ok('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
    await ctx.close();
  } finally { await b.close(); }
  const f = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - f}/${results.length} passed`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
