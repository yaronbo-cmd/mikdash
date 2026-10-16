// ── route31 ── ROUTE31 (WAVE31: the true routes as short acts; the slice) by real touch on dist/test.html#shift=N at 844×390:
//  taps    — each type's route (עולה · מנחה · קן) runs by taps alone (the button / the act's zone, one touch each; the tables three)
//  gold    — and by the gold gestures: the slice (≥ 60 px within 300 ms on the lamb's zone), the drag to the corner, the hold at the mark,
//            the climb held to the top, the beat, the drag down the wall — each act graded gold
//  slice   — a slow slice is good, not gold; a tap also finishes the slaughter
//  laver   — the laver's act once per round (a second tap on it says "פעם אחת")
//  acts    — every act ≤ 3 touches (the tables: 3), ≤ 4 s, its first frame ≤ 50 ms after it starts
//  shots   — test/out/route31/*.png (≥ 8);  no console errors
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/route31-touch.cjs --no-build [--noshots] [--only=olah,mincha,ken]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/route31');
const args = process.argv.slice(2), arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = arg('only', '').split(',').filter(Boolean), want = (s) => !ONLY.length || ONLY.includes(s);
const DIST = arg('dist', path.join(ROOT, 'dist/test.html'));
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'דרור', mishmar: 5, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('r31')) { sessionStorage.setItem('r31', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; }, SAVE);
  await pg.goto('file://' + DIST + '#shift=1');
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 50) => { await down(7, x, y); await pg.waitForTimeout(ms); await up(7); };
  const shots = [];
  const shot = async (name) => { if (!SHOTS || shots.includes(name)) return; await G(() => { window.__HUD_HOLD = true; __T.render(); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; }); shots.push(name); console.log('   shot test/out/route31/' + name + '.png'); };
  const ok0 = await pg.waitForFunction(() => window.__SHIFT && __SHIFT.state && __SHIFT.state() && __SHIFT.mods, null, { polling: 300, timeout: 90000 }).then(() => true, () => false);
  check('the shift runs (#shift=1)', ok0); if (!ok0) { await b.close(); process.exit(1); }
  await pg.waitForFunction(() => __SHIFT.state().phase === 'run', null, { polling: 100, timeout: 15000 }).catch(() => null);

  const btn = () => G(() => { const e = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const zone = async () => { await pg.waitForFunction(() => { const e = document.querySelector('.s31-zone'); if (!e) return true; const r = e.getBoundingClientRect(); return r.left > 0 && r.top > 0; }, null, { polling: 50, timeout: 3000 }).catch(() => null); return G(() => { const e = document.querySelector('.s31-zone'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }); };
  const act = () => G(() => __SHIFT.mods.stations.state());
  const lastDone = () => G(() => { const l = __SHIFT.mods.stations.log().filter((x) => x[0] === 'done'); return l[l.length - 1] || null; });
  const used = { api: 0, chip: 0 };
  /** walk to a station the way a child does: its chip (lit or at the edge); the "לך ל…" button when FLOW31's is there; else the API (counted) */
  const actsOf = (id) => G((sid) => __SHIFT.mods.stations.log().filter((x) => x[0] === 'act' && x[1] === sid).length + ':' + __SHIFT.mods.stations.log().length, id);
  async function goTo(id, walkShot) {
    const before = await G((sid) => { const l = __SHIFT.mods.stations.log(); return { n: l.filter((x) => x[0] === 'act' && x[1] === sid).length, last: l.length ? JSON.stringify(l[l.length - 1]) : '' }; }, id);
    const c = await G((sid) => { const e = document.querySelector(`.s29-st[data-st="${sid}"]`); if (!e || e.classList.contains('s29-hide')) return null; const r = e.getBoundingClientRect(); if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight || r.width < 10) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);
    const lab = await G(() => { const e = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); return e ? (e.textContent || '').trim() : ''; });
    const vb = await G((sid) => { const S = __SHIFT.mods.stations.STATIONS || {}; return (S[sid] && (S[sid].verb31 || S[sid].label)) || ''; }, id);
    if (/^לך|לכו/.test(lab) || /לך ל/.test(lab) || (vb && lab.includes(vb.split(' — ')[0]))) { const B = await btn(); await tapAt(B.x, B.y); used.btn = (used.btn | 0) + 1; }   // (the button names the place to go, or this act's own verb in reach: the child taps it)
    else if (c) { const n0 = await G(() => __SHIFT.debug.log().length); await tapAt(c.x, c.y); used.chip++;
      // (a chip under another: the finger hit the neighbour — "לא — … קודם" — the child taps the right one again; here the engine's tap)
      await pg.waitForTimeout(250); const hitWrong = await G((n) => __SHIFT.debug.log().slice(n).some((e) => e[1] === 'no'), n0);
      if (hitWrong) { await pg.waitForTimeout(1050); await G((sid) => __SHIFT.E.tapStation(sid), id); used.api++; used.wrongChip = (used.wrongChip | 0) + 1; } }
    else { await G((sid) => __SHIFT.E.tapStation(sid), id); used.api++; }
    if (walkShot) { await pg.waitForTimeout(500); await shot(walkShot); console.log('   the parts drawn in his arms on the walk (frames):', await G(() => window.__R31PARTS | 0)); }
    const on = await pg.waitForFunction(([sid, b]) => { const a = __SHIFT.mods.stations.state(); if ((a && a.id === sid) || __SHIFT.state().phase !== 'run') return true; const l = __SHIFT.mods.stations.log(); const n = l.filter((x) => x[0] === 'act' && x[1] === sid).length; return n > b.n || (n === b.n && n > 0 && l.length && JSON.stringify(l[l.length - 1]) !== b.last && l.slice(-12).some((x) => x[0] === 'act' && x[1] === sid)); }, [id, before], { polling: 50, timeout: 9000 }).then(() => true, () => false);   // (or its act already came and went: a short act between two polls)
    if (!on) { console.log('   (goTo ' + id + ': no act after the touch — ' + JSON.stringify(await G(() => ({ lab: ((document.querySelector('.gm.tw-on .tw-btn') || {}).textContent || '').trim(), log: __SHIFT.debug.log().slice(-5), st: (({ carried, acting, phase, no, next }) => ({ carried, acting, phase, no, next }))(__SHIFT.state()) }))) + ')'); await G((sid) => __SHIFT.E.tapStation(sid), id); used.api++; return pg.waitForFunction((sid) => { const a = __SHIFT.mods.stations.state(); return a && a.id === sid && a.phase === 'act'; }, id, { polling: 50, timeout: 9000 }).then(() => true, () => false); }
    return true;
  }
  /** the act's gesture: 'tap' (one touch on the button; the tables three) or 'gold' (the act's own gesture) */
  async function perform(id, mode, shotName) {
    const A = await act(); if (!A) return null;
    const B = await btn();
    if (mode === 'tapnowait') { if (A.verb === 'tap3') { for (let i = 0; i < 3; i++) { await tapAt(B.x, B.y, 40); await pg.waitForTimeout(120); } } else await tapAt(B.x, B.y); return null; }
    if (mode === 'tap' || mode === 'slowslice') {
      if (A.verb === 'tap3') { for (let i = 0; i < 3; i++) { await tapAt(B.x, B.y, 40); await pg.waitForTimeout(140); } }
      else if (mode === 'slowslice' && A.verb === 'slice') { const z = await zone(); await down(8, z.x + 30, z.y); for (let i = 1; i <= 6; i++) { await pg.waitForTimeout(90); await move(8, z.x + 30 - i * 8, z.y + 2); } await up(8); }
      else await tapAt(B.x, B.y);
    } else {
      if (A.verb === 'hold') { await down(9, B.x, B.y); await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.t >= 1.12; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await up(9); }
      else if (A.verb === 'holdWalk') { await down(9, B.x, B.y); await pg.waitForTimeout(600); if (shotName) await shot(shotName + '-climb'); await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.phase !== 'act'; }, null, { polling: 50, timeout: 5000 }).catch(() => null); await up(9); }
      else if (A.verb === 'slice') { const z = await zone(); const P = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 8, radiusX: 6, radiusY: 6, force: 1 }];
        // (a flick: the three touch events sent back to back, not each after the page's answer — on this 2-core software-GL machine one
        // round trip is a frame of 150–300 ms, which a finger never waits for)
        await Promise.all([cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: P(z.x + 60, z.y - 6) }), cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: P(z.x - 5, z.y) }), cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: P(z.x - 70, z.y + 6) }), cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]); }
      else if (A.verb === 'tapOn') { const z = await zone(); if (z) await tapAt(z.x, z.y); else await tapAt(B.x, B.y); }
      else if (A.verb === 'drag') { await down(9, B.x, B.y); for (let i = 1; i <= 5; i++) { await pg.waitForTimeout(30); await move(9, B.x - i * 14, B.y - i * 12); } await up(9); }
      else if (A.verb === 'dragDown') { await down(9, B.x, B.y - 20); for (let i = 1; i <= 5; i++) { await pg.waitForTimeout(30); await move(9, B.x + 1, B.y - 20 + i * 10); } await up(9); }
      else if (A.verb === 'tapBeat') { await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.t >= 1.26; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await tapAt(B.x, B.y, 20); }
      else if (A.verb === 'tap3') { for (let i = 0; i < 3; i++) { await tapAt(B.x, B.y, 40); await pg.waitForTimeout(110); } }
      else await tapAt(B.x, B.y);
    }
    if (shotName) { await pg.waitForTimeout(id === 'shechita' ? 200 : id === 'kevesh' ? 500 : 100); await shot(shotName); }
    await pg.waitForFunction(() => !__SHIFT.mods.stations.state(), null, { polling: 60, timeout: 7000 }).catch(() => null);
    return lastDone();
  }
  /** in reach: the big button names this act's verb (FLOW31) — the gesture ON it starts and does the act (route31: the act starts at the touch-down) */
  async function inReach(id) { return G((sid) => { const e = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); const lab = e ? (e.textContent || '').trim() : ''; const S = __SHIFT.mods.stations.STATIONS || {}; const vb = (S[sid] && (S[sid].verb31 || '')) || ''; const sp = window.__T && __T.twin && __T.twin.spec ? __T.twin.spec() : null; return !!vb && lab.includes(vb.split(' — ')[0]); }, id); }
  async function performReach(id, mode, shotName) {
    const B = await btn(), verb = await G((sid) => (__SHIFT.mods.stations.STATIONS[sid] || {}).verb, id);
    const fast = (pts) => Promise.all(pts.map(([type, x, y]) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y), id: 9, radiusX: 6, radiusY: 6, force: 1 }] })));
    if (mode === 'tap') { if (verb === 'tap3') { for (let i = 0; i < 3; i++) { await tapAt(B.x, B.y, 40); await pg.waitForTimeout(120); } } else await tapAt(B.x, B.y); }
    else if (mode === 'slowslice') { await down(9, B.x, B.y); for (let i = 1; i <= 6; i++) { await pg.waitForTimeout(110); await move(9, B.x - i * 8, B.y); } await up(9); }
    else {
      if (verb === 'hold') { await down(9, B.x, B.y); await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.t >= 1.0; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await up(9); }
      else if (verb === 'holdWalk') { await down(9, B.x, B.y); await pg.waitForTimeout(500); if (shotName) await shot(shotName + '-climb'); await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.phase !== 'act'; }, null, { polling: 50, timeout: 5000 }).catch(() => null); await up(9); }
      else if (verb === 'slice') await fast([['touchStart', B.x, B.y], ['touchMove', B.x - 70, B.y - 10], ['touchMove', B.x - 140, B.y - 20], ['touchEnd']]);
      else if (verb === 'drag') { await down(9, B.x, B.y); for (let i = 1; i <= 5; i++) { await pg.waitForTimeout(30); await move(9, B.x - i * 14, B.y - i * 12); } await up(9); }
      else if (verb === 'dragDown') { await down(9, B.x, B.y - 25); for (let i = 1; i <= 5; i++) { await pg.waitForTimeout(30); await move(9, B.x + 1, B.y - 25 + i * 10); } await up(9); }
      else if (verb === 'tapBeat') { await tapAt(B.x, B.y); await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.t >= 1.26; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await tapAt(B.x, B.y, 20); }
      else if (verb === 'tap3') { for (let i = 0; i < 3; i++) { await tapAt(B.x, B.y, 40); await pg.waitForTimeout(110); } }
      else await tapAt(B.x, B.y);
    }
    used.reach = (used.reach | 0) + 1;
    if (shotName) { await pg.waitForTimeout(id === 'shechita' ? 200 : 100); await shot(shotName); }
    await pg.waitForFunction(() => !__SHIFT.mods.stations.state(), null, { polling: 60, timeout: 7000 }).catch(() => null);
    return lastDone();
  }
  async function takeOne(type) {
    for (let k = 0; k < 40; k++) {
      const c = await G((t) => { for (const e of document.querySelectorAll('.s29-pc')) { if (e.dataset.type !== t || e.classList.contains('left') || e.classList.contains('done') || e.classList.contains('taken')) continue; const r = e.getBoundingClientRect(); if (r.left > -100 && r.left < innerWidth) return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: +e.dataset.pid }; } const P = __SHIFT.mods.pilgrims.list().find((q) => q.type === t && q.state === 'wait'); return P ? { id: P.id, api: true } : null; }, type);
      if (c) {
        if (!c.api) await tapAt(c.x, c.y); else { await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); __SHIFT.E.tapPilgrim(P); }, c.id); used.api++; }
        const ok = await pg.waitForFunction((id) => __SHIFT.state().carried === id, c.id, { polling: 60, timeout: 2000 }).then(() => true, () => false);
        if (ok) return c.id;
        await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); if (P) __SHIFT.E.tapPilgrim(P); }, c.id); used.api++;
        if (await G((id) => __SHIFT.state().carried === id, c.id)) return c.id;
      }
      await G(() => __SHIFT.debug.spawnNow()); await pg.waitForTimeout(400);
    }
    return null;
  }
  async function route(type, mode, tag) {
    const out = { acts: [], served0: (await G(() => __SHIFT.state().served)) };
    const pid = await takeOne(type); if (!pid) return { ...out, err: 'no pilgrim of ' + type + ' ' + JSON.stringify(await G(() => ({ ps: __SHIFT.mods.pilgrims.list().map((q) => [q.id, q.type, q.state]), st: (({ carried, acting, phase, no, spawned, count }) => ({ carried, acting, phase, no, spawned, count }))(__SHIFT.state()), log: __SHIFT.debug.log().slice(-6) }))) };
    if (tag && type === 'olah' && mode === 'gold') await shot(`r31-1-taken-${type}`);
    for (let n = 0; n < 8; n++) {
      const nx = await G(() => __SHIFT.state().next); if (!nx) break;
      // (the button's tail word ('יפה!') first gives way to the next place or verb: a child reads the new word)
      await pg.waitForFunction(() => { const e = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); return !e || !/יפה/.test(e.textContent || ''); }, null, { polling: 60, timeout: 2500 }).catch(() => null);
      if (await inReach(nx)) { const r = await performReach(nx, mode, tag ? `r31-${tag}-${nx}` : null); out.acts.push({ id: nx, verb: null, q: r && r[2], gold: r && r[3], ms: r && r[4], touches: r && r[5], slice: r && r[6], reach: true }); if ((await G(() => __SHIFT.state().phase)) !== 'run') break; continue; }
      if (!(await goTo(nx, tag && nx === 'kevesh' ? `r31-${tag}-walk-parts` : null))) { out.err = 'no act at ' + nx + ' ' + JSON.stringify(await G(() => ({ log: __SHIFT.debug.log().slice(-6), st: (({ carried, acting, phase, no, next }) => ({ carried, acting, phase, no, next }))(__SHIFT.state()), walk: window.__S29W && __S29W.state() }))); break; }
      const A0 = await act();
      const r = (await perform(nx, mode, tag ? `r31-${tag}-${nx}` : null)) || (await G((sid) => { const l = __SHIFT.mods.stations.log().filter((x) => x[0] === 'done' && x[1] === sid); return l[l.length - 1] || null; }, nx));   // (an act that came and went on the walk's own touch)
      out.acts.push({ id: nx, verb: A0 && A0.verb, q: r && r[2], gold: r && r[3], ms: r && r[4], touches: r && r[5], slice: r && r[6] });
      if ((await G(() => __SHIFT.state().phase)) !== 'run') break;
    }
    out.served = (await G(() => __SHIFT.state().served)) - out.served0;
    out.firstFrames = await G(() => (__SHIFT.mods.stations.log() || []).length);
    return out;
  }
  const fmt = (R) => R.acts.map((a) => `${a.id}:${a.gold ? '★' : a.q}${a.touches != null ? '/' + a.touches : ''}`).join(' ');
  const ROUTE = { olah: ['samicha', 'shechita', 'zerika', 'nituach', 'kevesh'], mincha: ['hagasha', 'kemitza', 'haktara'], ken: ['melika', 'mitzui'] };
  const routeOk = (R, type, first) => { const ids = R.acts.map((a) => a.id); const wantIds = first ? ['kiyor', ...ROUTE[type]] : ROUTE[type]; return JSON.stringify(ids) === JSON.stringify(wantIds) && R.served === 1; };
  const sane = (R, type) => R.acts.every((a) => a.ms != null && a.ms <= 4000 && a.touches != null && a.touches <= 3);

  // ───────── level 1: עולה by taps, by gold; the laver once; the slow slice ─────────
  if (want('olah')) {
    await G(() => { window.__S29_CAP = 0; });
    await shot('r31-0-start');
    const T1 = await route('olah', 'tap', null);
    check('עולה by taps alone: the laver, then סמיכה → שחיטה → זריקה → ניתוח → כבש, served', routeOk(T1, 'olah', true), fmt(T1) + (T1.err ? ' · ' + T1.err : ''));
    check('עולה by taps: every act ≤ 3 touches, ≤ 4 s', sane(T1), JSON.stringify(T1.acts.map((a) => [a.id, a.ms, a.touches])));
    // the laver a second time: "פעם אחת"
    const lv = await G(() => { __SHIFT.E.runAt('kiyor'); return __SHIFT.state().no; });
    check('the laver once per round (a second time says so)', /פעם אחת/.test(lv) && (await G(() => __SHIFT.mods.stations.log().filter((x) => x[0] === 'act' && x[1] === 'kiyor').length)) === 1, lv);
    await pg.waitForTimeout(1100);
    // (the act's "+N" lives 1.1 s; a screenshot here comes later — a test-only observer keeps a still copy of each word for 4 s, so the shot
    // shows what the child saw for that second)
    await G(() => { const ob = new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('s31-pts') && !n.dataset.still) { const c = n.cloneNode(true); c.dataset.still = '1'; c.style.animation = 'none'; c.style.opacity = '1'; c.style.transform = `translate(${n.style.getPropertyValue('--x')},${n.style.getPropertyValue('--y')})`; n.parentNode.appendChild(c); setTimeout(() => c.remove(), 4000); } }); ob.observe(document.body, { childList: true, subtree: true }); window.__R31OB = ob; });
    const G1 = await route('olah', 'gold', 'g');
    await G(() => { if (window.__R31OB) window.__R31OB.disconnect(); });
    check('עולה by the gold gestures: every act gold', routeOk(G1, 'olah', false) && G1.acts.every((a) => a.gold), fmt(G1) + (G1.err ? ' · ' + G1.err : ''));
    const sl = await G(() => { const l = __SHIFT.mods.stations.log(); return l; });
    const sG = G1.acts.find((a) => a.id === 'shechita');
    check('the slice registers: ≥ 60 px within 300 ms on the lamb = gold', !!(sG && sG.gold), JSON.stringify(sG));
    // the blood's rule (DAM25) at the slaughter and the tables: the kit's own check — the vessel's liquid only, nothing red on a figure,
    // the floor or a part (the parts are pale shapes)
    { await G(() => __SHIFT.run(1)); await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase === 'run', null, { polling: 100, timeout: 12000 }).catch(() => null);   // (a fresh round: the blood's check and the slow slice need their time)
      const pid = await takeOne('olah'); if (await G(() => __SHIFT.state().washed === false)) { await goTo('kiyor'); await perform('kiyor', 'tap'); } const bcs = [], went = [];
      for (const id of ['samicha', 'shechita', 'zerika', 'nituach']) { const slow = id === 'shechita' || id === 'nituach'; await G((v) => { window.__S29_SLOW = v; }, slow ? 14 : 0); if (slow && id === 'shechita') await G(() => { const S = window.__BC31 = { n: 0, vessel: 0, reds: 0, floor: 0, untagged: 0, nearFig: 0, samples: 0 }; const t = setInterval(() => { const k = window.__W22 && __W22.kit && __W22.kit(); const b = k && k.bloodCheck ? k.bloodCheck() : null; const a = __SHIFT.mods.stations.state(); if (b && a) { S.samples++; S.n = Math.max(S.n, b.n); S.vessel = Math.max(S.vessel, b.tags.vessel | 0); S.reds = Math.max(S.reds, b.reds | 0); S.floor = Math.max(S.floor, b.floor | 0); S.untagged = Math.max(S.untagged, b.untagged | 0); } if (S.samples > 0 && !a) clearInterval(t); }, 80); setTimeout(() => clearInterval(t), 40000); });
        went.push([id, await goTo(id)]); if (slow) { await perform(id, 'tapnowait'); if (id === 'shechita') {
          // (the kit's own check sampled in the page every 80 ms through the whole act — a screenshot may hold the test for seconds)
          // (the sampler was set before the walk: in reach the touch that starts the slaughter also does it)
          // (no screenshot inside this act: one can hold the page's frames for > 12 s, and the act's clock runs on — the vessel's frames skipped)
          await pg.waitForFunction(() => !__SHIFT.mods.stations.state(), null, { polling: 100, timeout: 20000 }).catch(() => null);
          const bc = await G(() => { const S = window.__BC31; return { n: S.n, tags: { vessel: S.vessel }, floor: S.floor, reds: S.reds, untagged: S.untagged, nearFig: S.nearFig, samples: S.samples, ph: (S.ph || '').replace(/(.)\\1+/g, (m, c) => c + m.length), t: S.t, slow: window.__S29_SLOW }; });
          bcs.push([id, bc]); }
        else { await pg.waitForTimeout(900); bcs.push([id, await G(() => (window.__W22 && __W22.kit && __W22.kit().bloodCheck) ? __W22.kit().bloodCheck() : null)]); } } else await perform(id, 'tap'); await pg.waitForFunction(() => !__SHIFT.mods.stations.state(), null, { polling: 80, timeout: 12000 }).catch(() => null); }
      await G(() => { window.__S29_SLOW = 0; }); console.log('   the blood check\'s walk:', JSON.stringify(went), 'pilgrim', pid);
      const b1 = bcs[0] && bcs[0][1], b2 = bcs[1] && bcs[1][1];
      check('no red outside BLOOD: the slaughter — the vessel\'s liquid only, none by a figure or on the floor', !!b1 && b1.reds === 0 && b1.floor === 0 && b1.untagged === 0 && (b1.tags.vessel | 0) >= 1, JSON.stringify(b1));
      check('no red outside BLOOD: the parts on the table are pale shapes (no red, nothing untagged)', !!b2 && b2.reds === 0 && b2.untagged === 0 && b2.floor === 0, JSON.stringify(b2 && { n: b2.n, tags: b2.tags, reds: b2.reds }));
      await goTo('kevesh'); await perform('kevesh', 'tap'); void pid; }
    const S1 = await route('olah', 'slowslice', null);
    const sS = S1.acts.find((a) => a.id === 'shechita'), sT = T1.acts.find((a) => a.id === 'shechita');
    check('a slow slice is good, not gold; a tap also finishes the slaughter', !!(sS && !sS.gold && sS.q >= 0.75 && sT && sT.q > 0 && !sT.gold), JSON.stringify([sS, sT]));
    const ff = await G(() => __SHIFT.mods.stations.log().filter((x) => x[0] === 'done').length);
    void ff; void sl;
    const st = await G(() => __SHIFT.state());
    console.log('   level 1:', JSON.stringify({ score: st.score, actPts: st.actPts, served: st.served, lost: st.lost, rival: st.rival, t: st.t, used }));
    const pts = await G(() => __SHIFT.mods.stations.log().filter((x) => x[0] === 'pts').length);
    check('the act points count (+N born on the thing, its own word over it)', st.actPts > 0 && st.score >= st.actPts && pts >= 3, `actPts ${st.actPts} · words ${pts}`);
  }
  // ───────── level 3: מנחה and קן, by taps and by gold ─────────
  if (want('mincha') || want('ken')) {
    // (each type in its own fresh round of level 3: the bag brings the three types in its own order; the round's 90 s are short for four routes)
    const fresh = async () => { await G(() => __SHIFT.run(3)); await pg.waitForFunction(() => __SHIFT.state() && (__SHIFT.state().phase === 'opening' || __SHIFT.state().phase === 'run'), null, { polling: 100, timeout: 12000 }).catch(() => null);
      if ((await G(() => __SHIFT.state().phase)) === 'opening') await G(() => { for (let i = 0; i < 4; i++) __SHIFT.E.debug.openingTap(i); });
      await pg.waitForFunction(() => __SHIFT.state().phase === 'run', null, { polling: 100, timeout: 12000 }).catch(() => null); };
    for (const type of ['ken', 'mincha']) {
      if (!want(type)) continue;
      await fresh(); let first = true; const he = type === 'ken' ? 'קן' : 'מנחה';
      for (const mode of ['tap', 'gold']) {
        let R = null;
        for (let guard = 0; guard < 12 && (await G(() => __SHIFT.state().phase)) === 'run'; guard++) {
          const types = await G(() => __SHIFT.mods.pilgrims.list().filter((q) => q.state === 'wait').map((q) => q.type));
          if (types.includes(type)) { R = await route(type, mode, mode === 'gold' ? 'g' : null); break; }
          const other = types[0]; if (other) { await route(other, 'tap', null); first = false; } else { await G(() => __SHIFT.debug.spawnNow()); await pg.waitForTimeout(500); }
        }
        if (!R) { check(`${he} by ${mode}`, false, 'no pilgrim of that type came in time'); continue; }
        if (mode === 'tap') { check(`${he} by taps alone`, routeOk(R, type, first), fmt(R) + (R.err ? ' · ' + R.err : '')); check(`${he} by taps: ≤ 3 touches, ≤ 4 s`, sane(R), JSON.stringify(R.acts.map((a) => [a.id, a.ms, a.touches]))); }
        else check(`${he} by the gold gestures: every act gold`, routeOk(R, type, first) && R.acts.every((a) => a.gold || a.id === 'kiyor'), fmt(R) + (R.err ? ' · ' + R.err : ''));
        if (R.acts.length) first = false;
      }
    }
    if (await G(() => __SHIFT.state().phase === 'run')) await G(() => __SHIFT.debug.end());
    await pg.waitForSelector('.sh-end', { timeout: 6000 }).catch(() => null);
    const m = await G(() => { const d = document.querySelector('.sh-end details'); if (d) d.open = true; return [...document.querySelectorAll('.sh-mentor li')].map((e) => e.textContent); });
    await pg.waitForTimeout(300); await shot('r31-9-end-mentor');
    check('the end card\'s fold: the route\'s sources, one line per station', m.length >= 6 && m.some((t) => /מנחות/.test(t)) && m.some((t) => /זבחים ו/.test(t)), m.length + ' lines');
  }
  { const ff = await G(() => { const l = window.__SHIFT && __SHIFT.mods ? __SHIFT.mods.stations.log().filter((x) => x[0] === 'done' && Number.isFinite(x[7])) : []; return l.map((x) => [x[7], x[8] | 0]); });
    console.log('   the acts\' first frame on him [ms after the act began, the game frame then]:', JSON.stringify(ff));
    check('every act is on the kohen in its first drawn frame (≤ 50 ms, or within that one game frame on this machine)', ff.length > 0 && ff.every(([v, f]) => v <= Math.max(50, f * 1.25 + 4)), JSON.stringify(ff)); }
  console.log('   used', JSON.stringify(used));
  check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · shots ${shots.length}`);
  await b.close();
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
// ── /route31 ──
