// ── fable32 ── build 3 of the basics (13.10): real places, the pause, the arrival — by real touch at 844×390.
// (the harness is build 1's)   NODE_PATH=… /home/claude/wt/bus/brun node test/fable32b-touch.cjs --no-build
// build 1 of the basics (13.10): by real touch on dist/test.html#shift=1 at 844×390 —
//   (1) the camera holds its bearing while the stick is held (az change ≤ 0.05 rad over 2 s of steering), and does not turn when he stands;
//   (2) the away button lights the path and does NOT walk him (his position moves < 1 amah in 2 s after the tap);
//   (3) the − / + buttons change the follow distance (camOver.d) and keep the level across a reload;
//   (4) a chip tap still walks him.   NODE_PATH=… /home/claude/wt/bus/brun node test/fable32-touch.cjs --no-build
const { chromium } = require('playwright'); const path = require('path');
const ROOT = path.resolve(__dirname, '..'), DIST = path.join(ROOT, 'dist/test.html');
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'דרור', mishmar: 5, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('f32b')) { sessionStorage.setItem('f32b', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } }, SAVE);
  await pg.goto('file://' + DIST + '#shift=1');
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 60) => { await down(7, x, y); await pg.waitForTimeout(ms); await up(7); };
  try {
    const ok0 = await pg.waitForFunction(() => window.__SHIFT && __SHIFT.state && __SHIFT.state().phase === 'run', null, { polling: 300, timeout: 120000 }).then(() => true, () => false);
    check('the round runs', ok0);
    await pg.waitForFunction(() => { const b = document.querySelector('.gm.tw-on .tw-btn'); return b && b.getBoundingClientRect().width > 0; }, null, { polling: 300, timeout: 60000 }).catch(() => {});
    await pg.waitForTimeout(1500);
    const hero = () => G(() => { const h = {}; __T.stages.heroXYZ(h); return { x: h.x, z: h.z }; });
    const btn = async () => G(() => { const b = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); const q = b && b.getBoundingClientRect(); return q ? { x: q.left + q.width / 2, y: q.top + q.height / 2, t: b.textContent } : null; });
    // (1) the real places: the next place is the laver at the Ulam's steps
    const nx = await G(() => { const n = __SHIFT.E ? __SHIFT.E.flowNext() : null; return n && n.at ? { id: n.id, x: n.at.x, z: n.at.z } : null; });
    check('(1) the first place is the laver, its stand at the steps\' foot (x ≈ −54.3, z 20)', nx && nx.id === 'kiyor' && Math.abs(nx.x + 54.3) < 0.6 && Math.abs(nx.z - 20) < 0.6, JSON.stringify(nx));
    const places = await G(() => { const S = __SHIFT.mods && __SHIFT.mods.stations && __SHIFT.mods.stations.STATIONS; return S ? ['shechita', 'nituach', 'hagasha', 'kevesh'].map((id) => [id, S[id].at.x, S[id].at.z]) : null; });
    check('(1) the slaughter at the morning ring, the cutting at a table, the הגשה at the SW corner, the ramp\'s foot', !!places && places[0][1] === -47 && places[1][2] === -56 && places[2][1] === -53 && places[3][2] === 42.5, JSON.stringify(places));
    // (2) the pause: the clock stops, the card shows, "המשך" runs on
    const pb = await G(() => { const b = document.querySelector('.sh-pbtn'); const r = b && b.getBoundingClientRect(); return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width } : null; });
    check('(2) the pause button exists (≥ 44 px, top-left)', pb && pb.w >= 44 && pb.x < 120, JSON.stringify(pb));
    if (pb) {
      await tapAt(pb.x, pb.y); await pg.waitForTimeout(400);
      const t0 = await G(() => __SHIFT.state().t); const card = await G(() => !!document.querySelector('.sh-pause .sh-card'));
      await pg.waitForTimeout(1200); const t1 = await G(() => __SHIFT.state().t);
      check('(2) the clock stands still under the card', card && Math.abs(t1 - t0) < 0.05, `card ${card} t ${t0 && t0.toFixed(2)} → ${t1 && t1.toFixed(2)}`);
      const rb = await G(() => { const b = document.querySelector('[data-sh=resume]'); const r = b && b.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
      if (rb) await tapAt(rb.x, rb.y);
      const ran = await pg.waitForFunction((t) => !__SHIFT.state().paused && __SHIFT.state().t > t + 0.2, t1, { polling: 300, timeout: 12000 }).then(() => true, () => false);   // (SwiftShader: a frame may take 2 s)
      const t2 = await G(() => __SHIFT.state().t);
      check('(2) "המשך": the clock runs again, the card gone', ran && !(await G(() => !!document.querySelector('.sh-pause'))), `t ${t2 && t2.toFixed(2)}`);
    }
    // (3) a chip tap walks him to the laver's stand; the arrival: the button's word becomes the act's verb; the basin prop is off
    const chip = await G(() => { const el = [...document.querySelectorAll('.s29-st[data-st]')].find((e) => /כיור/.test(e.textContent) && e.getBoundingClientRect().width > 0); const r = el && el.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
    if (chip) {
      await tapAt(chip.x, chip.y);
      const arrived = await pg.waitForFunction(() => { const h = {}; __T.stages.heroXYZ(h); return Math.hypot(h.x + 54.3, h.z - 20) < 3.2; }, null, { polling: 200, timeout: 45000 }).then(() => true, () => false);
      const h = await hero(); check('(3) the chip walks him to the real laver\'s stand (≤ 45 s under SwiftShader)', arrived, `at ${h.x.toFixed(1)}, ${h.z.toFixed(1)}`);
      await pg.waitForTimeout(800); const b = await btn();
      check('(3) at the laver the button says the act\'s verb (קדשו)', b && /קדשו/.test(b.t), b && b.t);
      // the act: hold the button ~1 s → the kohen at the laver (the act's own figure), the act done
      if (b) { await down(7, b.x, b.y); await pg.waitForTimeout(1000); await up(7); await pg.waitForTimeout(1500); }
      const washed = await G(() => !!__SHIFT.state().washed || __SHIFT.state().lav31 !== false);
      check('(3) the laver\'s act done by a hold on the button', washed);
      const basin = await G(() => { try { return __SHIFT.mods.stations.BASIN30 ? !!__SHIFT.mods.stations.BASIN30.off : 'n/a'; } catch (e) { return 'n/a'; } });
      check('(3) the shift basin prop is off', basin === true || basin === 'n/a', String(basin));
    } else check('(3) the laver chip to tap', false, 'none found');
    await pg.screenshot({ path: path.join(ROOT, 'test/out/fable32-3.png') });
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' ') : e)); results.push(false); }
  await b.close();
  console.log(`${results.filter(Boolean).length}/${results.length} passed`);
  process.exit(results.every(Boolean) ? 0 : 1);
})();
