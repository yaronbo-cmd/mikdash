// Sprint 2 integration run in the REAL build: Phase B's morning service played end to end over the 3D world
// (world.sanctuary + world.avodah + the gameplay), with screenshots of the key moments; then the menu switch
// Phase A → Phase B → back to building.
//   node build.mjs && NODE_PATH=... node test/integration-s2.cjs [phone|desktop] [shots=a,b,c]
// Output: test/out/integration/*.png + a summary (world calls, warnings, errors).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.resolve(__dirname, 'out/integration');
fs.mkdirSync(OUT, { recursive: true });
const which = process.argv[2] || 'phone';
const SHOTS = (process.argv[3] || 'kiddush,deshen,taleh,heichal,zerika,evarim,ketoret,birkat,shir').split(',');
const SIZES = { phone: { width: 390, height: 844, mobile: true }, desktop: { width: 1280, height: 720, mobile: false } };
const S = SIZES[which];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking'] });
  const results = [];
  const ok = (name, pass, info = '') => { results.push({ name, pass, info }); console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (info ? '  · ' + info : '')); };
  try {
    const ctx = await b.newContext({ viewport: { width: S.width, height: S.height }, isMobile: S.mobile, hasTouch: S.mobile, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errors = [], warns = [];
    pg.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g/.test(t)) errors.push(t); else if (m.type() === 'warning' && !/willReadFrequently|fonts\.g/.test(t)) warns.push(t); });
    pg.on('pageerror', (e) => errors.push('PAGEERR ' + e.message));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__START_PAUSED = true;
      window.__AV_NOW = Date.parse('2026-09-27T05:40:00+03:00'); window.__AV_T0 = performance.now(); window.__DT_MAX = 0.6;   // Chol HaMoed Sukkot, dawn
      try {
        localStorage.clear();
        localStorage.setItem('bh_beta2', JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8 }));
        localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, pid: 'pint', name: 'אלעזר', mishmar: 8, seenIntro: true }));
      } catch (e) { /* ignore */ }
    });
    const t0 = Date.now();
    await pg.goto('file://' + path.resolve(__dirname, '../dist/test.html') + '#avodah');
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__AVODAH, null, { timeout: 400000, polling: 1000 });
    ok('boot straight into Phase B with #avodah', true, ((Date.now() - t0) / 1000).toFixed(0) + ' s');
    const shot = async (name) => {
      const t1 = Date.now();
      await pg.evaluate(() => { window.__HUD_HOLD = true; window.__T.render(); window.__T.render(); });
      await pg.screenshot({ path: path.join(OUT, `${which}-${name}.png`), timeout: 300000 });
      await pg.evaluate(() => { window.__HUD_HOLD = false; });
      console.log('   shot', name, ((Date.now() - t1) / 1000).toFixed(0) + ' s');
    };
    await sleep(2500);
    await shot('00-home');

    // the whole morning service, in practice mode, solved step by step
    await pg.evaluate(() => { window.__AVODAH._.run('shachar'); });
    const seen = [];
    let last = null, guard = 0;
    while (guard++ < 400) {
      const st = await pg.evaluate(() => ({ g: window.__AVODAH._.game, busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on') }));
      if (!st.busy) break;
      if (st.g && st.g !== last && st.mg) {
        last = st.g; seen.push(st.g);
        // camera flights, walk-ins and choreography (the taleh a little sooner: its six rings are framed by a flight that, with the
        // loop paused, lands only at the shot's render — a longer wait would let the layer retire first)
        await sleep(st.g === 'heichal' || st.g === 'ketoret' ? 7500 : st.g === 'taleh' ? 3800 : 5000);
        if (SHOTS.includes(st.g)) await shot(String(seen.length).padStart(2, '0') + '-' + st.g);
        await pg.evaluate(() => window.__AVODAH._.solve());
        await sleep(1200);
        if (st.g === 'zerika' && SHOTS.includes('zerika')) { await sleep(2500); await shot(String(seen.length).padStart(2, '0') + '-zerika-after'); }
        continue;
      }
      if (st.modal) { await pg.evaluate(() => { const g = document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); }); await sleep(500); continue; }
      await sleep(700);
    }
    ok('the morning service ran to the end over the real world', seen.length >= 12, seen.join(','));
    const calls = await pg.evaluate(() => window.__AVODAH.world.calls.map((c) => c.fn));
    const count = (re) => calls.filter((f) => re.test(f)).length;
    ok('world.sanctuary answered (enter/lamps/altar)', count(/^sanctuary\.enter/) > 0 && count(/^sanctuary\.setLamps/) > 0, `enter×${count(/^sanctuary\.enter/)} lamps×${count(/^sanctuary\.setLamps/)}`);
    ok('world.avodah answered (kohen/animal/slaughter/sprinkle/limbs)', ['kohen', 'animal', 'slaughter', 'sprinkle', 'limbs'].every((n) => count(new RegExp('^avodah\\.' + n)) > 0), ['kohen', 'animal', 'slaughter', 'sprinkle', 'limbs', 'libation', 'levites', 'blessing'].map((n) => n + '×' + count(new RegExp('^avodah\\.' + n))).join(' '));
    const timeouts = warns.filter((w) => /no answer after/.test(w));
    ok('no world call timed out', timeouts.length === 0, timeouts.slice(0, 6).join(' | '));
    await shot(String(seen.length + 1).padStart(2, '0') + '-summary');

    // back to building (Phase A) through the home button, then into Phase B again from the Phase A menu
    await pg.evaluate(() => { const h = document.querySelector('.av-home'); if (h && !h.classList.contains('on')) document.querySelector('.av [data-a="home"]').click(); });
    await sleep(600);
    const hasBack = await pg.evaluate(() => !!document.querySelector('.av [data-a="build"]'));
    ok('Phase B home offers "back to building"', hasBack);
    if (hasBack) {
      await pg.evaluate(() => document.querySelector('.av [data-a="build"]').click());
      await pg.waitForFunction(() => window.__T.game && window.__T.game.state && !window.__AVODAH, null, { timeout: 60000, polling: 500 });
      await sleep(2000);
      ok('Phase A resumed (its HUD is back, Phase B unmounted)', await pg.evaluate(() => !!document.querySelector('.gm-rb') && !document.querySelector('.av')));
      await shot('90-phaseA-back');
      await pg.evaluate(() => { const m = document.querySelector('[data-a="sheet"][data-k="menu"]'); if (m) m.click(); });
      await sleep(900);
      const hasEntry = await pg.evaluate(() => !!document.querySelector('[data-a="avodah"]'));
      ok('Phase A menu has "העבודה בבית · שלב ב׳"', hasEntry);
      if (hasEntry) {
        await pg.evaluate(() => document.querySelector('[data-a="avodah"]').click());
        await pg.waitForFunction(() => !!window.__AVODAH && document.querySelector('.av'), null, { timeout: 60000, polling: 500 });
        ok('the menu button opens Phase B', true);
        await sleep(2500);
        await shot('91-phaseB-again');
      }
    }
    ok('no page errors', errors.length === 0, errors.slice(0, 6).join(' | '));
    fs.writeFileSync(path.join(OUT, `${which}-calls.json`), JSON.stringify({ seen, calls, warns: warns.slice(0, 80), errors }, null, 1));
    await ctx.close();
  } finally { await b.close(); }
  const f = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - f}/${results.length} passed`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
