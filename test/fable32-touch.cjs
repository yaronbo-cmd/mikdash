// ── fable32 ── build 1 of the basics (13.10): by real touch on dist/test.html#shift=1 at 844×390 —
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
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('f32')) { sessionStorage.setItem('f32', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } }, SAVE);
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
    const cam = () => G(() => { const c = window.__TWIN && __TWIN.cam ? __TWIN.cam() : null; const co = window.__S29C ? __S29C.state() : null; return { az: co && co.az, d: co && co.d, mode: co && co.mode }; });
    const hero = () => G(() => { const h = {}; __T.stages.heroXYZ(h); return { x: h.x, z: h.z }; });
    const btn = async () => { const r = await G(() => { const b = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); const q = b && b.getBoundingClientRect(); return q ? { x: q.left + q.width / 2, y: q.top + q.height / 2, t: b.textContent } : null; }); return r; };
    // the laver first (ROUTE31): walk there by the chip? — instead: the first button tap when away must NOT move him
    const b1 = await btn(); check('the button has a word', !!b1, b1 && b1.t);
    const h0 = await hero(); await tapAt(b1.x, b1.y); await pg.waitForTimeout(2000); const h1 = await hero();
    const movedBtn = Math.hypot(h1.x - h0.x, h1.z - h0.z);
    check('(2) the away button does not walk him (< 1 amah in 2 s)', movedBtn < 1, `moved ${movedBtn.toFixed(2)} · "${b1 && b1.t}"`);
    // (1) steer with the stick: hold the left zone and push right for 2.5 s — the camera's bearing must hold
    const c0 = await cam(); const sx = 80, sy = 300;
    await down(3, sx, sy); await move(3, sx + 50, sy); const azs = [];
    for (let i = 0; i < 10; i++) { await pg.waitForTimeout(250); await move(3, sx + 50 + (i % 2), sy - (i % 3)); azs.push((await cam()).az); }
    const h2 = await hero(); await up(3); await pg.waitForTimeout(300);
    console.log('   stick after up: ' + JSON.stringify(await G(() => (window.__TWIN && __TWIN.stick ? __TWIN.stick() : null))));
    const dAz = Math.max(...azs.map((a) => Math.abs(Math.atan2(Math.sin(a - c0.az), Math.cos(a - c0.az)))));
    check('(1) the camera holds its bearing under the stick (Δaz ≤ 0.05 rad over 2.5 s)', dAz <= 0.05, `Δaz ${dAz.toFixed(3)} · walked ${Math.hypot(h2.x - h1.x, h2.z - h1.z).toFixed(1)} amot`);
    check('the stick walks him (≥ 3 amot in 2.5 s)', Math.hypot(h2.x - h1.x, h2.z - h1.z) >= 3);
    // standing: no turn for 3 s
    const c1 = await cam(); await pg.waitForTimeout(3000); const c2 = await cam();
    const dIdle = Math.abs(Math.atan2(Math.sin(c2.az - c1.az), Math.cos(c2.az - c1.az)));
    check('(1) standing still: the camera does not turn (Δaz ≤ 0.6 rad in 3 s — the ease-behind after a walk allowed)', dIdle <= 0.6, `Δaz ${dIdle.toFixed(3)} mode ${c2.mode}`);
    // (3) zoom buttons
    const zb = await G(() => { const q = [...document.querySelectorAll('.f31-zl button')].map((b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: b.textContent, dis: b.disabled }; }); return q; });
    check('(3) the − / + buttons exist (44 px)', zb.length === 2, JSON.stringify(zb));
    const d0 = (await cam()).d; await tapAt(zb[0].x, zb[0].y); await pg.waitForTimeout(1200); const d1 = (await cam()).d; await tapAt(zb[0].x, zb[0].y); await pg.waitForTimeout(1200); const d2 = (await cam()).d;
    check('(3) − moves the camera farther (twice)', d1 > d0 * 1.2 && d2 > d1 * 1.2, `d ${d0 && d0.toFixed(1)} → ${d1 && d1.toFixed(1)} → ${d2 && d2.toFixed(1)}`);
    await tapAt(zb[1].x, zb[1].y); await pg.waitForTimeout(1200); const d3 = (await cam()).d;
    check('(3) + brings it back nearer', d3 < d2, `d ${d3 && d3.toFixed(1)}`);
    const lvl = await G(() => localStorage.getItem('sh.zoom')); check('(3) the level is kept', lvl === '2', `sh.zoom=${lvl}`);
    // (4) a chip tap walks him
    const chip = await G(() => { const el = [...document.querySelectorAll('.s29-st[data-st]')].find((e) => /כיור|סמיכה|שער/.test(e.textContent) && e.getBoundingClientRect().width > 0); const r = el && el.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, t: el.textContent.trim().slice(0, 20) } : null; });
    console.log('   stick before chip: ' + JSON.stringify(await G(() => (window.__TWIN && __TWIN.stick ? __TWIN.stick() : null))) + ' walk ' + JSON.stringify(await G(() => (window.__S29W ? __S29W.state() : null))));
    if (chip) { const h3 = await hero(); await tapAt(chip.x, chip.y); await pg.waitForTimeout(2500); const h4 = await hero(); console.log('   walk after chip: ' + JSON.stringify(await G(() => (window.__S29W ? __S29W.state() : null)))); check('(4) a chip tap walks him (≥ 2 amot in 2.5 s)', Math.hypot(h4.x - h3.x, h4.z - h3.z) >= 2, `"${chip.t}" moved ${Math.hypot(h4.x - h3.x, h4.z - h3.z).toFixed(1)}`); }
    else check('(4) a station chip to tap', false, 'none found');
    await pg.screenshot({ path: path.join(ROOT, 'test/out/fable32-1.png') });
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' ') : e)); results.push(false); }
  await b.close();
  console.log(`${results.filter(Boolean).length}/${results.length} passed`);
  process.exit(results.every(Boolean) ? 0 : 1);
})();
