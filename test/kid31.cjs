// ── flow31 ── kid31.cjs — the kid harness (WAVE31 FLOW31 (7)): a scripted player who behaves like a child with two thumbs at 844×390.
// He reads ONLY what is on the screen — the big button's word, the lit chip, the act's tip line, the seals' words, the end card — waits
// 500 ms before each reaction (a child looks first), and does what the button says:
//   "לך ל…" / "קחו …"  → a tap on the button          "… — גררו …"  → a drag from the button (100 px in 0.2 s: the slice/the throw)
//   "… — החזיקו"       → a hold on the button 1.0 s    "… — הקישו …" (or anything else) → a tap on the button
//   a tip "הקישו על החותם: X" → a tap on the seal X       "עולה רגל בדרך" → he waits
// He never reads the game's internals to decide (the in-page sampler reads the round's phase only to time the measures). Per round it prints
// score / stars / served / left (from the end card) and the longest stretch of "not knowing" (no lit chip on the screen AND the button's word
// is neither a way ("לך ל…", "קחו …") nor an act's verb ("… — …")); a shot every 10 s of the first round (test/out/kid31/).
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/kid31.cjs --no-build [--rounds=3] [--lvl=1]
//     [--shots=1 (rounds with shots — a shot holds the page for seconds and its round is not a fair measure: the acceptance runs without)] [--noshots] [--dist=<html>] [--want=2 (the stars each round must reach)] [--lost=2 (max s not knowing)]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/kid31');
const args = process.argv.slice(2), arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const ROUNDS = +arg('rounds', 3), LVL = +arg('lvl', 1), SHOT_R = args.includes('--noshots') ? 0 : +arg('shots', 0), WANT = +arg('want', 2), LOST = +arg('lost', 2);
const DIST = arg('dist', path.join(ROOT, 'dist/test.html'));
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'דרור', mishmar: 5, seenIntro: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('k31')) { sessionStorage.setItem('k31', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; }, SAVE);
  await pg.goto('file://' + DIST + `#shift=${LVL}`);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 60) => { await down(7, x, y); await sleep(ms); await up(7); };
  const shots = [];
  const shot = async (name) => { await G(() => { __T.simulate(false); window.__HUD_HOLD = true; __T.render(); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; __T.simulate(true); }); /* (the world held still for the shot: a held game frame with a running world walked him blind) */ shots.push(name); console.log('   shot test/out/kid31/' + name + '.png'); };
  const ok0 = await pg.waitForFunction(() => window.__SHIFT && __SHIFT.state && __SHIFT.state(), null, { polling: 300, timeout: 90000 }).then(() => true, () => false);
  check(`the shift runs (#shift=${LVL})`, ok0); if (!ok0) { await b.close(); process.exit(1); }

  // (the software renderer's first frames compile every material for seconds — a warm-up render, then the round from its start: the
  //  environment's cost, not the game's; a phone's GPU has none of it)
  await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.simulate(true); });
  // (and the input: the page's first touch is delivered ~16 s late here (the traced round: the kid's tap at 1 s reached the game at 16.6 s,
  //  his next look at 17.4 s) — one touch first on the work button (its first touch wakes the page's sound), then the round from its start)
  { const z = await G(() => { const e = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn');   /* (the work button: its first touch wakes the sound — the 15.6-s touch of round 1 was the button's first) */ const r = e && e.getBoundingClientRect(); return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; }); const tw = Date.now(); if (z) await tapAt(z.x, z.y, 80); console.log(`   (warm-up touch acknowledged in ${Date.now() - tw} ms)`); }
  await G((l) => __SHIFT.run(l), LVL);
  await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase === 'run', null, { polling: 100, timeout: 15000 }).catch(() => null);
  // the screen as a child sees it (the DOM only)
  const look = () => G(() => {
    const vis = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.2) return null; return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; };
    const btn = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'), lb = btn && btn.querySelector('.tw-lb');
    const end = document.querySelector('.sh-end');
    const lit = [...document.querySelectorAll('.s29-st.cue, .s30-gate.lit')].map((e) => ({ t: e.textContent.trim(), at: vis(e) })).filter((q) => q.at);
    const tip = [...document.querySelectorAll('.s29-tip')].map((e) => e.textContent.trim()).find(Boolean) || '';
    const seals = [...document.querySelectorAll('.s29-seal')].map((e) => ({ t: e.textContent.trim(), at: vis(e) })).filter((q) => q.at);
    const again = end ? vis(end.querySelector('[data-sh=again]')) : null;
    return { label: lb ? lb.textContent.trim() : '', btn: vis(btn), lit, tip, seals, end: end ? { res: (end.querySelector('.sh-res') || {}).textContent || '', sub: (end.querySelector('.sh-sub') || {}).textContent || '', stars: end.querySelectorAll('.sh-stars i.on').length, again } : null };
  });
  // the measure (in the page, every 100 ms of the round): not knowing = no lit chip on the screen and the button's word is neither a way nor a verb
  await G(() => {
    const M = window.__K31 = { on: false, n: 0, lost: 0, cur: 0, max: 0, at: null, bad: [] }; let last = performance.now();
    setInterval(() => {
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      const s = window.__SHIFT && __SHIFT.state && __SHIFT.state(); if (!s || s.phase !== 'run' || s.t < 1.5 || document.querySelector('.sh-end')) { M.cur = 0; return; }
      M.n++;
      const lb = ((document.querySelector('.gm.tw-on .tw-btn .tw-lb') || document.querySelector('.tw-btn .tw-lb') || {}).textContent || '').trim();
      const lit = [...document.querySelectorAll('.s29-st.cue, .s30-gate.lit')].some((e) => { const r = e.getBoundingClientRect(); return r.width && r.left < innerWidth && r.right > 0 && r.top < innerHeight && r.bottom > 0 && getComputedStyle(e).display !== 'none'; });
      const knows = lit || /^לך ל/.test(lb) || /^קחו/.test(lb) || /\s—\s/.test(lb) || /^יפה/.test(lb) || !!document.querySelector('.s29-tip');   // ("יפה!": the act's own answer on the button in its tail)
      if (knows) M.cur = 0; else { M.cur += Math.min(dt, 0.3); M.lost++; if (M.cur > M.max) { M.max = M.cur; M.at = { t: s.t, lb }; } if (M.bad.length < 20 && M.cur > 0.5) M.bad.push([Math.round(s.t * 10) / 10, lb]); }
    }, 100);
  });

  const rounds = [];
  for (let r = 0; r < ROUNDS; r++) {
    if (r > 0) {   // "עוד פעם" on the end card, as a child would
      const L0 = await look(); if (L0.end && L0.end.again) { await sleep(500); await tapAt(L0.end.again.x, L0.end.again.y); }
      const re = await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase !== 'end' && !document.querySelector('.sh-end'), null, { polling: 100, timeout: 6000 }).then(() => true, () => false);
      if (!re) { await G((l) => __SHIFT.run(l), LVL); }
    }
    await G(() => { Object.assign(window.__K31, { n: 0, lost: 0, cur: 0, max: 0, at: null, bad: [] }); });
    const t0 = Date.now(); let nextShot = 4000, k = 0, lastKey = '', seen = 0, acts = { tap: 0, hold: 0, drag: 0, seal: 0, wait: 0 };
    const shotsOn = r < SHOT_R;
    while (Date.now() - t0 < (shotsOn ? 330000 : 170000)) {   // (a shot holds the game's frame: a round with shots is ~2× its 90 s)
      const L = await look();
      if (L.end) { await sleep(1800); const L2 = await look(); const e = L2.end || L.end; const m = /(\d+)\s*—\s*משמר\s*(\S+)\s*(\d+)/.exec(e.res) || []; const sv = /(\d+)\/(\d+)\s*עולי רגל/.exec(e.sub) || []; const lf = /(\d+)\s*הלכו/.exec(e.sub);
        const K = await G(() => ({ ...window.__K31 })); const R = { round: r + 1, score: +m[1] || 0, rival: +m[3] || 0, stars: e.stars, served: +sv[1] || 0, count: +sv[2] || 0, left: lf ? +lf[1] : 0, maxNotKnowing: +K.max.toFixed(1), notKnowingAt: K.at, ms: Date.now() - t0, acts };
        if (shotsOn) await shot(`k31-r${r + 1}-end`);
        console.log('   ROUND', JSON.stringify(R));
        if (args.includes('--log')) console.log('   (debug, not read by the kid) log', JSON.stringify(await G(() => (__SHIFT.debug.log() || []).filter((e) => !/^walk-cut$/.test(e[1])).slice(-80))), 'walks', JSON.stringify(await G(() => (window.__S29W && __S29W.times()) || []))); if (K.bad.length) console.log('   not-knowing samples', JSON.stringify(K.bad)); rounds.push(R); break; }
      if (shotsOn && Date.now() - t0 >= nextShot && !L.tip && !(await G(() => !!(window.__S29W && __S29W.state().on)))) {   // (not mid-walk either: the harness's own timing, never the kid's decision — a paused world under a ticking walk cuts it)   // (not in the middle of an act: an act keeps its own wall clock)
        await shot(`k31-r${r + 1}-${String(k++).padStart(2, '0')}-${Math.round((Date.now() - t0) / 1000)}s`); nextShot = Date.now() - t0 + 10000; lastKey = ''; continue; }   // (10 s of play between two shots: a shot itself takes seconds)
      const key = `${L.label}|${L.tip}|${L.lit.map((q) => q.t).join(',')}`;
      if (key !== lastKey) { lastKey = key; seen = Date.now(); }
      if (Date.now() - seen < 500 || Date.now() - t0 < 1500) { await sleep(80); continue; }   // (a child looks before he touches — 1.5 s at a round's start: the new screen; in this browser a touch in the round's first second was delivered 16 s late)
      if (!L.btn) { await sleep(150); continue; }
      // the seals: the tip names the one
      const sm = /החותם:\s*(\S+)/.exec(L.tip);
      if (sm && L.seals.length) { const s = L.seals.find((q) => q.t === sm[1]) || L.seals[0]; await tapAt(s.at.x, s.at.y); acts.seal++; lastKey = ''; await sleep(250); continue; }
      const w = L.label;
      if (args.includes('--log') && (acts.trace = acts.trace || []).length < 40) acts.trace.push([Math.round((Date.now() - t0) / 100) / 10, w, L.tip.slice(0, 14)]);
      if (/^עולה רגל בדרך/.test(w)) { acts.wait++; await sleep(300); continue; }
      if (/גררו/.test(w) || /גררו/.test(L.tip)) {   // the slice / the throw: from the button, 100 px up and toward the middle in 0.2 s
        await down(7, L.btn.x, L.btn.y); for (let i = 1; i <= 5; i++) { await move(7, L.btn.x - 16 * i, L.btn.y - 12 * i); await sleep(35); } await up(7); acts.drag++;
      } else if (/החזיקו/.test(w) || /החזיקו/.test(L.tip)) { await down(7, L.btn.x, L.btn.y); await sleep(1000); await up(7); acts.hold++; }
      else { const tt = Date.now(); await tapAt(L.btn.x, L.btn.y); acts.tap++; const ms = Date.now() - tt; if (ms > 1500) { acts.slowTaps = acts.slowTaps || []; acts.slowTaps.push([Math.round((tt - t0) / 100) / 10, w, ms, await G(() => __SHIFT.state().t)]); } }   // (the touch's own delivery time — the harness's measure: [s into the round, the word, ms the touch took, the game's clock after it])
      lastKey = ''; await sleep(300);
    }
    if (rounds.length < r + 1) { rounds.push({ round: r + 1, timeout: true }); console.log('   ROUND timeout'); }
  }
  console.log('KID31', JSON.stringify(rounds.map((q) => ({ r: q.round, score: q.score, rival: q.rival, stars: q.stars, served: q.served, left: q.left, lost: q.maxNotKnowing }))));
  for (const q of rounds) {
    check(`[round ${q.round}] level ${LVL}: ≥ ${'★'.repeat(WANT)} by the button alone`, q.stars >= WANT, JSON.stringify(q));
    check(`[round ${q.round}] ≤ ${LOST} s of not knowing at any moment`, q.maxNotKnowing <= LOST, `max ${q.maxNotKnowing} s at ${JSON.stringify(q.notKnowingAt)}`);
  }
  check('no console errors', !errs.length, errs.slice(0, 3).join(' | '));
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · shots ${shots.length}`);
  await b.close(); process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
// ── /flow31 ──
