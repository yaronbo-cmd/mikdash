// MUSIC8B: the score in the real build (dist/test.html, SwiftShader) by real touch, at 390×844, in normal mode with no
// autoplay flags (the game's own log, window.__GAME_LOG, is only read). One browser, always closed.
//   node build.mjs && node test/music-touch.cjs
// Checks: silent before the first tap; a tap on the opening starts the music (the build state, a real output level);
// the game's mute switch (the menu ☰ → השתקה, tapped) silences it and a second tap brings it back; a hidden page pauses it;
// the menu's Phase B button (tapped) turns the music solemn.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__DT_MAX = 0.6; window.__START_PAUSED = true; });   // (__START_PAUSED: the render loop only — SwiftShader)
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const t0 = Date.now();
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game && window.__BH_MUSIC, null, { polling: 200, timeout: 300000 });
    console.log(`booted in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    // (the meter's analyser is made on its first call: read it twice, 400 ms apart)
    const M = () => pg.evaluate(async () => { window.__BH_MUSIC.meter(); await new Promise((r) => setTimeout(r, 400)); return { ...window.__BH_MUSIC.get(), level: +window.__BH_MUSIC.meter().toFixed(4) }; });
    const m0 = await M();
    check('no sound before the first gesture (no context, no state)', !m0.running && m0.state === null, JSON.stringify(m0));

    // the opening is up: a tap (real touch) skips it; that tap is the first gesture
    await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { polling: 100, timeout: 20000 }).catch(() => {});
    const cine = await pg.$('.gm-cine'), r = cine && await cine.boundingBox();
    await pg.touchscreen.tap(r ? r.x + r.width / 2 : 195, r ? r.y + r.height * 0.6 : 500);
    await pg.waitForTimeout(4500);
    const m1 = await M();
    check('the first tap starts the music: the build state, running, a real output level', m1.running && m1.state === 'build' && m1.level > 0.002, JSON.stringify(m1));
    check('(wave 12) the build state plays at 104.65 BPM (three beats = two hammer swings)', m1.bpm === 104.65, `bpm ${m1.bpm} · intensity ${m1.intensity}`);
    const f1 = path.join(OUT, 'music-touch-playing.png');
    await pg.evaluate(() => __T.simulate(false));
    await pg.evaluate(() => { __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: f1, timeout: 240000 });
    await pg.evaluate(() => { window.__HUD_HOLD = false; });
    console.log('shot', path.relative(ROOT, f1));

    // the game's own mute, by touch: the menu (☰) → the "השתקה" switch; the music follows the sound kit, and comes back
    const dismissAll = async () => { for (let k = 0; k < 6; k++) { const on = await pg.$('.gm-modal.on .gm-btn-gold'); if (!on) break; await tapSel('.gm-modal.on .gm-btn-gold'); await pg.waitForTimeout(400); } };
    // (a sheet slides up: tap only once the target's box has stopped moving — a box read mid-slide tapped the tour below it)
    const tapSel = async (sel) => {
      let bb = null;
      for (let k = 0; k < 30; k++) { const el = await pg.$(sel); const b2 = el && await el.boundingBox(); if (b2 && bb && Math.abs(b2.y - bb.y) < 1 && Math.abs(b2.x - bb.x) < 1) break; bb = b2; await pg.waitForTimeout(200); }
      if (!bb || bb.y + bb.height / 2 > 844) return false;
      await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return true;
    };
    // a precision game by touch: the dock's "היום" → the daily challenge "שחק" → the precision state; skipping ends it
    const day = await tapSel('[data-a="sheet"][data-k="daily"]');
    await pg.waitForTimeout(700);
    const play = day && await tapSel('[data-fun="daily"]');
    const mgOn = play && await pg.waitForSelector('.fx-mg', { timeout: 15000 }).then(() => true, () => false);
    await pg.waitForTimeout(3500);
    const mp = await M();
    if (day && !play) {
      // a new player's daily challenge is locked ("נפתח אחרי הנדבך הראשון שלך"): check the wiring's DOM contract instead —
      // a precision sheet (.fx-mg, GAMES8B's frame) on screen → the precision state; gone → back to build (synthetic)
      console.log('     (the daily challenge is locked for a new player; the precision game by hand is QA8B\'s real-play)');
      await dismissAll(); await tapSel('[data-a="sheet"][data-k="daily"]'); await pg.waitForTimeout(600);
      await pg.evaluate(() => { const d = document.createElement('div'); d.className = 'fx-mg'; d.id = 'mg-probe'; document.body.appendChild(d); });
      await pg.waitForTimeout(3000);
      const m7 = await M();
      await pg.evaluate(() => document.getElementById('mg-probe').remove());
      await pg.waitForTimeout(3000);
      const m8 = await M();
      check('(synthetic) a precision sheet on screen → the precision state; gone → build', m7.state === 'precision' && m7.level > 0.002 && m8.state === 'build', JSON.stringify({ with: m7.state, level: m7.level, after: m8.state }));
    } else check('a precision game (the daily challenge, tapped) → the precision state', mgOn && mp.state === 'precision' && mp.level > 0.002, JSON.stringify({ day, play, mgOn, ...mp }));
    if (mgOn) {
      const fp = path.join(OUT, 'music-touch-precision.png');
      await pg.evaluate(() => __T.simulate(false));
      await pg.evaluate(() => { __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: fp, timeout: 240000 });
      await pg.evaluate(() => { window.__HUD_HOLD = false; });
      console.log('shot', path.relative(ROOT, fp));
      for (let k = 0; k < 6 && await pg.$('.fx-mg'); k++) { if (!(await tapSel('.fx-mg .fx-skip')) && !(await tapSel('.fx-mg .fx-ok'))) await pg.waitForTimeout(2500); await pg.waitForTimeout(800); }
      await pg.waitForFunction(() => !document.querySelector('.fx-mg'), null, { polling: 200, timeout: 40000 }).catch(() => {});
      await pg.waitForTimeout(1500);
      const mb = await M();
      check('the game over: back to the build state', mb.state === 'build', JSON.stringify(mb));
    }
    await dismissAll();

    const menu = await tapSel('[data-a="sheet"][data-k="menu"]');
    await pg.waitForTimeout(900);
    const sw = await tapSel('[data-a="set"][data-k="mute"]');
    await pg.waitForTimeout(1500);
    const m2 = await M();
    check('the menu\'s mute switch (tapped) silences the music', menu && sw && m2.muted && m2.level < 0.001, JSON.stringify({ menu, sw, ...m2 }));
    const f2 = path.join(OUT, 'music-touch-muted.png');
    await pg.screenshot({ path: f2, timeout: 240000 });
    console.log('shot', path.relative(ROOT, f2));
    await tapSel('[data-a="set"][data-k="mute"]');
    await pg.waitForTimeout(4000);
    const m3 = await M();
    check('a second tap brings it back', !m3.muted && m3.state === 'build' && m3.level > 0.002, JSON.stringify(m3));
    await tapSel('[data-a="sheet"][data-k="menu"]');   // (closes the sheet)
    await pg.waitForTimeout(600);

    // the page hidden → paused (its own context suspended, or faded out when shared); shown → it plays again
    await pg.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await pg.waitForTimeout(1500);
    const m4 = await M();
    check('a hidden page pauses the music', m4.paused && (m4.state === null || !m4.running), JSON.stringify(m4));
    await pg.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await pg.waitForTimeout(4000);
    const m5 = await M();
    check('shown again, it plays', !m5.paused && m5.running && m5.state === 'build' && m5.level > 0.002, JSON.stringify(m5));

    // Phase B by touch: the menu → "הצצה: העבודה בבית" — the music turns solemn (B Aeolian, no drum)
    await tapSel('[data-a="sheet"][data-k="menu"]');
    await pg.waitForTimeout(900);
    const av = await tapSel('[data-a="avodah"]');
    await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'start' && e.d && 'fromA' in e.d), null, { polling: 200, timeout: 60000 }).catch(() => {});
    await pg.waitForTimeout(4500);
    const m6 = await M();
    check('Phase B (the menu, tapped): the solemn state plays', av && m6.state === 'phaseB' && m6.level > 0.001, JSON.stringify({ av, ...m6 }));
    const f3 = path.join(OUT, 'music-touch-phaseB.png');
    await pg.evaluate(() => __T.simulate(false));
    await pg.evaluate(() => { __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: f3, timeout: 240000 });
    await pg.evaluate(() => { window.__HUD_HOLD = false; });
    console.log('shot', path.relative(ROOT, f3));
    check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const bad = results.filter((x) => !x.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
