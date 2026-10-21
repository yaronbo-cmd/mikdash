// LIGHT28 (WAVE28): light that does not blind, text that never hides, the blessing — by real touch on dist/test.html#avodah at 844×390.
//   lum    — in every work's close-up and in the night watch: ≤ 2 % of the frame's pixels ≥ 250 luminance (the canvas alone: the DOM layers
//            hidden for the measure; the top 12 % masked — the sky when outdoors). Shots: nightwalk, night, lambs, taleh, deshen, maaracha, kiyor,
//            evarim, payis, birkat (+ the תפוח).
//   zone   — in each shot: no label rect (the kit's 3D labels, the work chips, the says lines, the count, the ממונה's bubble, the verse)
//            intersects the HUD bar or the buttons; no two labels intersect; the kiyor's 3D "n/12 דדים" is gone (the chip has it).
//   birkat — three taps = three verses, each shown in full with ה׳ (≥ 22 px), one at a time; never a Name (the patterns from \u escapes only).
//   tapuach — the ash heap reads: grey-brown, darker rim; the label "התפוח" in the zone.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/light28-touch.cjs --no-build [--noshots] [--only=nightwalk,night,lambs,taleh,deshen,maaracha,kiyor,evarim,payis,birkat,tapuach]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/light28');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (s) => !ONLY.length || ONLY.includes(s);
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
// the Name, never written: built from \u escapes (the qa-content-scan's own way)
const NAME = new RegExp([0x05D9, 0x05D4, 0x05D5, 0x05D4].map((c) => String.fromCharCode(c)).join('[\\u0591-\\u05C7]*'));
const HASHEM = String.fromCharCode(0x05D4, 0x05F3);   // ה׳
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage(); const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__S27_STAMP_HOLD = true; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const tap = async (p) => { await down(2, p.x, p.y); await pg.waitForTimeout(70); await up(2); };
    const hold = async (p, ms) => { await down(2, p.x, p.y); await pg.waitForTimeout(ms); await up(2); };
    const freeze = () => G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; });
    const thaw = () => G(() => { window.__HUD_HOLD = false; __T.simulate(true); });
    // the frame's bright share: the canvas alone (every DOM layer hidden for the grab), the top 12 % masked
    const lum = async (name) => {
      await freeze();
      await G(() => { window.__L28HID = [...document.querySelectorAll('body > *:not(canvas), .gm, .wb-layer, .dy-gm')].filter((e) => !e.querySelector('canvas') && e.tagName !== 'CANVAS'); for (const e of window.__L28HID) e.style.visibility = 'hidden'; });
      const buf = await pg.screenshot({ timeout: 120000 });
      await G(() => { for (const e of window.__L28HID || []) e.style.visibility = ''; });
      const r = await G(async (b64) => {
        const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const cv = document.createElement('canvas'); cv.width = bm.width; cv.height = bm.height; const x = cv.getContext('2d'); x.drawImage(bm, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data;
        const y0 = Math.round(cv.height * 0.12); let n = 0, hot = 0, sum = 0;
        for (let y = y0; y < cv.height; y++) for (let xx = 0; xx < cv.width; xx++) { const i = (y * cv.width + xx) * 4, L = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; sum += L; if (L >= 250) hot++; }
        return { hot: +(hot / n * 100).toFixed(2), mean: Math.round(sum / n) };
      }, buf.toString('base64'));
      if (SHOTS) fs.writeFileSync(path.join(OUT, name + '-lum.png'), buf);
      await thaw();
      check(`[${name}] ≤ 2 % of the frame ≥ 250 luminance`, r.hot <= 2, `${r.hot} % hot · mean ${r.mean} · ${JSON.stringify(await G(() => ({ cam: window.__L28 && __L28.cam() ? [+__L28.cam().position.x.toFixed(1), +__L28.cam().position.y.toFixed(1), +__L28.cam().position.z.toFixed(1)] : null, torch: window.__L28 && __L28.lights ? __L28.lights() : null })))}`);
      return r;
    };
    // the labels on the screen now: the claimed rects (the kit's 3D labels, the chips) + the DOM lines; vs the HUD and the buttons
    const zoneCheck = async (name) => {
      const z = await G(() => {
        const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (!(r.width > 2 && r.height > 2) || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.3) return null; return { x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom) }; };
        const labs = (window.__L28 ? __L28.claims() : []).filter((r) => r.tag === 'label');   // (the claimed 3D labels; the chips and the DOM lines measured below)
        for (const [sel, tag] of [['.dy-say.on', 'bubble'], ['.wb-say:not(.off)', 'say'], ['.wb-count', 'count'], ['.l28-verse.on', 'verse'], ['.l28-tap.on', 'tapuach'], ['.wb-t:not(.off)', 'chipdom']]) for (const e of document.querySelectorAll(sel)) { const r = R(e); if (r) labs.push({ ...r, tag }); }
        const hud = R(document.querySelector('.dy-hud'));
        const btns = ['.tw-btn', '.tw-hand', '.tw-ov', '.wb-bar button', '.gm.tw-on .tw-base', '.gm.tw-on .tw-tip'].flatMap((s) => [...document.querySelectorAll(s)].map(R)).filter(Boolean);
        const hit = (a, b) => a.x0 < b.x1 - 1 && a.x1 > b.x0 + 1 && a.y0 < b.y1 - 1 && a.y1 > b.y0 + 1;
        const bad = [];
        for (const l of labs) { if (l.x1 < 0 || l.x0 > innerWidth || l.y1 < 0 || l.y0 > innerHeight) continue; if (hud && hit(l, hud)) bad.push(['hud', l]); for (const q of btns) if (hit(l, q)) bad.push(['btn', l, q]); }
        const seen = [];
        for (const l of labs) { for (const q of seen) if (hit(l, q) && !(l.tag === 'fixed' || q.tag === 'fixed')) bad.push(['pair', l, q]); seen.push(l); }
        return { n: labs.length, bad: bad.slice(0, 4), hud, zone: window.__L28 ? __L28.zone() : null, tags: labs.map((l) => l.tag).join(',') };
      });
      check(`[${name}] labels in the zone: none over the HUD or the buttons, none over another`, z.bad.length === 0, `${z.n} labels (${z.tags}) · zone ${JSON.stringify(z.zone)} · ${JSON.stringify(z.bad)}`);
      return z;
    };
    const shot = async (name) => { if (!SHOTS) return; await freeze(); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/light28/' + name + '.png'); await thaw(); };
    const toWork = async (id, atH) => {
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, place: k.place } : null; }, id);
      if (info && Number.isFinite(atH)) info.h = atH;   // (the night's works: at a dark hour)
      if (!info) return false;
      await G((h) => { __DAY.clock.resume(); __DAY.clock.skipTo(h + 0.05); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; const k = __DAY.tasks.get(id); if (k.state === 'done') k.state = 'passed'; k.practice = false; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      return waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
    };
    // (taps alone finish every work: tap the button until the work and its epilogue are over)
    const endWork = async () => {
      const t0 = Date.now();
      while (Date.now() - t0 < 60000 && (await G(() => __DAY.D.l28Busy()))) { const bc = await btnC(); await tap(bc); await pg.waitForTimeout(600); }
      await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; document.querySelectorAll('.s27-stamp').forEach((e) => e.classList.remove('on', 'hold')); }); await pg.waitForTimeout(1200);
    };
    const taps = async (n, gap = 900) => { const bc = await btnC(); for (let i = 0; i < n; i++) { await tap(bc); await pg.waitForTimeout(gap); } };

    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);

    /** one work: to its place, the button, a few taps, the close-up → the shot, the luminance, the zone */
    const work = async (name, id, o = {}) => {
      const ok = await toWork(id, o.h); check(`[${name}] the button wakes at its place`, ok); if (!ok) return false;
      const bc = await btnC();
      if (o.hold) await hold(bc, o.hold); else await tap(bc);
      await pg.waitForTimeout(o.wait || 2600);
      if (o.taps) await taps(o.taps, o.gap || 1100);
      if (o.after) await o.after(bc);
      // (the close-up: tap on until a key moment's close camera holds — figures24's closeState — then the shot; else the frame as it is)
      const cs = () => G(() => { const c = window.__F24 && __F24.closeState(); return c ? { on: c.on, w: c.w, key: c.key, dist: c.dist } : null; });
      let c = await cs();
      for (let i = 0; i < (o.closeTaps == null ? 12 : o.closeTaps) && !(c && c.on && c.w > 0.85) && (await G(() => __DAY.D.l28Busy())); i++) { await tap(await btnC()); await pg.waitForTimeout(o.gap || 1100); c = await cs(); }
      await pg.waitForTimeout(o.settle || 600); c = await cs();
      console.log(`   [${name}] close-up: ${JSON.stringify(c)}`);
      await shot(name); await lum(name); await zoneCheck(name);
      return true;
    };

    // (the day runs 18 → 18 and its clock only goes forward: the evening's lambs first, then the deep night, then the dawn)
    if (want('lambs')) { await work('lambs', 'lambs', { taps: 3, closeTaps: 0, h: 21 }); await endWork(); }   // (mid-work: the torch over the lambs)
    // ───────── the night watch: free, at the night place (shot 1) — then the work ─────────
    if (want('nightwalk')) {
      await G(() => { __DAY.clock.resume(); __DAY.clock.skipTo(1.5); __DAY.tasks.sync(); __DAY.D.refresh(); __DAY.clock.pause(); }); await pg.waitForTimeout(900);
      await G(() => __DAY.teleport('night')); await pg.waitForTimeout(3200);
      await shot('nightwalk'); await lum('nightwalk'); await zoneCheck('nightwalk');
    }
    if (want('night')) { await work('night', 'watch', { closeTaps: 0, h: 1.7 }); await endWork(); }   // (the owner's shot 1: the first frame of the watch, by the bench in the corner)
    if (want('taleh')) { await work('taleh', 'g-taleh', { taps: 2 }); await endWork(); }
    if (want('deshen')) { await work('deshen', 'g-deshen', { taps: 1, gap: 2500 }); await endWork(); }
    if (want('maaracha')) { await work('maaracha', 'g-maaracha', { wait: 3000 }); await endWork(); }
    if (want('kiyor')) {
      await work('kiyor', 'g-kiddush', { hold: 0, after: async (bc) => { await hold(bc, 2600); await pg.waitForTimeout(900); for (let i = 0; i < 6; i++) { await tap(bc); await pg.waitForTimeout(800); } } });
      const k3 = await G(() => { const w = window.__WB22 && __WB22.kiyor; const S = w && w.state; const kt = window.__W22 && __W22.kit(); return { spouts: S && S.spouts, mode: S && S.mode, labels: kt ? kt.l28labels || [] : [] }; });
      check('[kiyor] no 3D "n/12 דדים" over the kiyor (the HUD chip has the count)', !k3.labels.some((t) => /\/12/.test(t)), JSON.stringify(k3));
      await endWork();
    }
    if (want('evarim')) { await work('evarim', 'g-evarim', { wait: 3000 }); await endWork(); }
    if (want('payis')) { await work('payis', 'g-payis1', { wait: 3000 }); await endWork(); }
    if (want('birkat')) {
      const ok = await toWork('g-birkat'); check('[birkat] the button wakes at the Ulam', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await pg.waitForTimeout(2600);
        // up the steps, the five vessels
        for (let i = 0; i < 6 && (await G(() => (window.__S27RUN && __S27RUN.M ? __S27RUN.M.i : 0))) < 6; i++) { await tap(bc); await pg.waitForTimeout(1500); }
        const seen = [];
        for (let v = 1; v <= 3; v++) {
          await waitFor(() => { const M = window.__S27RUN && __S27RUN.M; return M && M.i === 5 + (M.verse || 0) + 1 - 1 + 0 && true; }, null, 500);
          await tap(bc); await waitFor((v) => { const e = document.querySelector('.l28-verse.on'); return !!e && e.dataset.n === String(v); }, v, 6000);
          await pg.waitForTimeout(700);
          const s = await G(() => { const e = document.querySelector('.l28-verse.on'); if (!e) return null; const t = e.querySelector('.l28-vt'); return { n: e.dataset.n, text: e.textContent, px: parseFloat(getComputedStyle(t || e).fontSize), count: document.querySelectorAll('.l28-verse.on').length, amen: window.__L28AMEN | 0 }; });
          seen.push(s);
          if (v === 1) { await shot('birkat'); await lum('birkat'); await zoneCheck('birkat'); } else if (v === 3) await shot('birkat-3');
        }
        const ok3 = seen.every((s, i) => s && s.n === String(i + 1) && s.count === 1 && s.text.includes(HASHEM) && !NAME.test(s.text) && s.px >= 22);
        check('[birkat] three taps = three verses, one at a time, each in full with ה׳ (≥ 22 px), never the Name', ok3 && new Set(seen.map((s) => s && s.text)).size === 3, JSON.stringify(seen.map((s) => s && { n: s.n, px: s.px, c: s.count, len: s.text.length, amen: s.amen })));
        await pg.waitForTimeout(1500); const amen = await G(() => window.__L28AMEN | 0);
        check('[birkat] the crowd\'s "אמן" after each verse', amen >= 3 && seen[0] && seen[1] && seen[1].amen >= 1 && seen[2].amen >= 2, JSON.stringify({ seen: seen.map((s) => s && s.amen), amen }));
        const words = await G(() => document.body.innerText);
        check('[birkat] nowhere on the page a Name', !NAME.test(words));
        await endWork();
      }
    }
    if (want('tapuach')) {
      await G(() => { __DAY.clock.resume(); __DAY.clock.skipTo(6.55); __DAY.tasks.sync(); __DAY.D.refresh(); __DAY.clock.pause(); }); await pg.waitForTimeout(900);
      await G(() => { if (__DAY.D.l28GoTapuach) __DAY.D.l28GoTapuach(); }); await pg.waitForTimeout(3000);
      const t = await G(() => { const e = document.querySelector('.l28-tap.on'); return e ? e.textContent : ''; });
      check('[tapuach] the label "התפוח" over the ash heap', /התפוח/.test(t), t);
      await shot('tapuach'); await lum('tapuach'); await zoneCheck('tapuach');
    }
    check('no page errors', errs.length === 0, errs.slice(0, 4).join(' | '));
  } catch (e) { console.log('FAIL  (threw) ' + (e && e.stack || e)); results.push(false); }
  finally { await b.close(); }
  const pass = results.filter(Boolean).length;
  console.log(`\n${pass}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(pass === results.length ? 0 : 1);
})();
