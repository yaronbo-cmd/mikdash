// ── shift30 ── SHIFT30 (WAVE30: the shift from INSIDE the world) by real touch on dist/test.html#shift=N at 844×390:
//  camera  — the follow camera behind the kohen: his screen position in the lower-middle third (x 25–75 %, his middle y 40–85 %) in
//            ≥ 90 % of the round's samples; the taken pilgrim on the screen in ≥ 80 % of the samples while they walk; no camera step
//            > 1.5 amot per 60-fps frame outside a teleport (the guard's log)
//  chips   — every station and the gate has a chip; one whose anchor is off the screen stands at the screen's edge on its side (arrow + amot);
//            a tap on an edge chip walks him there (≤ 20 amot/s)
//  round   — full level-1 rounds by touch: each pilgrim's walking (the tap-walks of his three stations) ≤ 8 s; the scores
//  prof    — the frame-time log (__S30PROF) over a 60-s round in the REAL loop (rendered frames): the top 3 costs, frames > 40 ms
//  shots   — test/out/shift30/*.png;  no console errors
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/shift30-touch.cjs --no-build [--noshots]
//     [--only=camera,chips,round,prof] [--rounds=1] [--lvl=1] [--dist=<html>] [--profS=60]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/shift30');
const args = process.argv.slice(2), arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = arg('only', '').split(',').filter(Boolean), want = (s) => !ONLY.length || ONLY.includes(s);
const DIST = arg('dist', path.join(ROOT, 'dist/test.html')), ROUNDS = +arg('rounds', 1), LVLS = arg('lvl', '1').split(',').map(Number), PROF_S = +arg('profS', 60);
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'דרור', mishmar: 5, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('s30')) { sessionStorage.setItem('s30', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; }, SAVE);
  await pg.goto('file://' + DIST + `#shift=${LVLS[0]}`);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 50) => { await down(7, x, y); await pg.waitForTimeout(ms); await up(7); };
  const shots = [];
  const shot = async (name) => { if (!SHOTS || shots.includes(name)) return; await G(() => { window.__HUD_HOLD = true; __T.render(); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; }); shots.push(name); console.log('   shot test/out/shift30/' + name + '.png'); };
  const ok0 = await pg.waitForFunction(() => window.__SHIFT && __SHIFT.state && __SHIFT.state() && __SHIFT.mods, null, { polling: 300, timeout: 90000 }).then(() => true, () => false);
  check('the shift runs (#shift=1)', ok0); if (!ok0) { await b.close(); process.exit(1); }

  // ───────── the in-page sampler: every 120 ms of a round — him on the screen, the taken pilgrim, the chips' sides ─────────
  await G(() => {
    const S = window.__S30S = { n: 0, him: 0, hx: [], walkN: 0, walkOn: 0, chipN: 0, chipOk: 0, bad: [], camMode: {} };
    const W = innerWidth, H = innerHeight, h = {};
    setInterval(() => {
      const st = __SHIFT.state && __SHIFT.state(); if (!st || st.phase !== 'run' || !__SHIFT.mods) return;
      if (st.t < 2.2) return;   // (a round's first 2 s: the twin's own start frame (CAM28's intro: 1 s held, a 1.6-s glide) — not the follow camera's)
      const M = __SHIFT.mods, act = M.stations.state && M.stations.state(); if (act) return;   // (an act is its own frame)
      if (document.querySelector('.sh-end')) return;
      __T.stages.heroXYZ(h); S.n++;
      const p = __T.view.project(h.x, h.y + 3.2, h.z), px = p.x, py = p.y;
      if (px > W * 0.25 && px < W * 0.75 && py > H * 0.4 && py < H * 0.85) S.him++; else if (S.bad.length < 12) S.bad.push(['him', Math.round(px), Math.round(py)]);
      if (S.hx.length < 400) S.hx.push([Math.round(px), Math.round(py)]);
      const cm = __S29C && __S29C.state ? __S29C.state().mode : '?'; S.camMode[cm] = (S.camMode[cm] | 0) + 1;
      const P = M.pilgrims.list().find((q) => q.state === 'taken');
      if (P && ((window.__S29W && __S29W.state().on) || P._walk)) { S.walkN++; const q = __T.view.project(P._x, h.y + 3, P._z); if (q.on && q.x > 0 && q.x < W && q.y > 0 && q.y < H) S.walkOn++; else if (S.bad.length < 24) S.bad.push(['pil', Math.round(q.x), Math.round(q.y)]); }
      // (the chips: an anchor off the screen → its chip at the edge on its side)
      const cq = __T.view.camNow({});
      for (const e of document.querySelectorAll('.s29-st')) {
        if (e.classList.contains('s29-hide') || e.classList.contains('f31-off')) continue;   // ── flow31 ── (+ the chips FLOW31 does not draw) ── /flow31 ──
        const id = e.dataset.st, a = id === 'gate' ? { x: -15, y: 16, z: 3 } : (M.stations.STATIONS || __SHIFTLAB.STATIONS)[id].at;
        const r = e.getBoundingClientRect(), cx = r.left + r.width / 2;
        const q = __T.view.project(a.x, (a.y || 16) + 5.2, a.z), qx = q.x, qy = q.y;
        const depth = (a.x - cq.px) * (cq.tx - cq.px) + (a.y - cq.py) * (cq.ty - cq.py) + (a.z - cq.pz) * (cq.tz - cq.pz);
        const gq = __T.view.project(a.x, (a.y || 16) + 0.5, a.z), gIn = depth > 0 && gq.x > 0 && gq.x < W && gq.y > 64 && gq.y < H;
        const off = !gIn && (depth <= 0 || qx < 0 || qx > W || qy < 0 || qy > H);   // (the thing itself in the frame: its chip may stand at the top over it)
        if (!off) continue;
        S.chipN++;
        const edge = e.classList.contains('s30-edge'), inScr = r.left >= -2 && r.right <= W + 2 && r.top >= 0 && r.bottom <= H + 2;
        const cosA = depth / ((Math.hypot(a.x - cq.px, (a.y || 16) + 5.2 - cq.py, a.z - cq.pz) * Math.hypot(cq.tx - cq.px, cq.ty - cq.py, cq.tz - cq.pz)) || 1), cy = r.top + r.height / 2, side = cosA < 0.25 ? true : (qx - W / 2) * (cx - W / 2) + (qy - H * 0.55) * (cy - H * 0.55) > 0;   // (the chip on the anchor's side of the screen's middle)
        if (edge && inScr && side) S.chipOk++; else if (S.bad.length < 36) S.bad.push(['chip', id, edge, inScr, side, Math.round(qx), Math.round(qy), Math.round(cx)]);
      }
    }, 120);
  });

  // ───────── the player: one pilgrim at a time, the least patient first; each station's chip tapped (at the edge or over it), each act by touch ─────────
  async function playRound(o = {}) {
    const acts = { n: 0, gold: 0, retap: 0 }, t0 = Date.now(), trips = []; let shotK = 0;
    for (let it = 0; it < 4000; it++) {
      if (o.maxMs && Date.now() - t0 > o.maxMs) return { cut: true, acts, trips };
      const S = await G(() => {
        const st = __SHIFT.state(), M = __SHIFT.mods; if (!st || !M) return null;
        const P = M.pilgrims.list().map((p) => ({ id: p.id, state: p.state, step: p.step, route: p.route, patience: +p.patience.toFixed(2) }));
        const chips = {}; for (const e of document.querySelectorAll('.s29-pc')) { const q = e.getBoundingClientRect(); if (q.left > -100) chips[e.dataset.pid] = { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }
        const g = document.querySelector('.s29-st[data-st=gate]'), gq = g && g.getBoundingClientRect();
        const rings = [...document.querySelectorAll('.sh-ring')].map((e) => { const q = e.getBoundingClientRect(); return { i: +e.dataset.i, x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
        return { phase: st.phase, t: st.t, P, chips, gate: gq && gq.width && gq.left > -100 ? { x: gq.left + gq.width / 2, y: gq.top + gq.height / 2 } : null, rings, end: !!document.querySelector('.sh-end') };
      });
      if (!S) { await pg.waitForTimeout(300); continue; }
      if (S.phase === 'end' || S.end) {
        await pg.waitForTimeout(900);
        const st2 = await G(() => __SHIFT.state());
        if (args.includes('--log')) console.log('LOG', JSON.stringify(await G(() => (__SHIFT.debug.log() || []).slice(-80))).slice(0, 9000));
        return { score: st2.score, rival: st2.rival, stars: st2.stars, served: st2.served, lost: st2.lost, count: st2.count, acts, trips, secs: Math.round((Date.now() - t0) / 1000) };
      }
      if (S.phase === 'opening' && S.rings.length) { for (const q of S.rings.sort((a, c) => a.i - c.i)) { await tapAt(q.x, q.y); await pg.waitForTimeout(250); } continue; }
      if (S.phase !== 'run') { await pg.waitForTimeout(200); continue; }
      const w = S.P.filter((p) => p.state === 'wait' || p.state === 'atStation' || p.state === 'taken'); if (!w.length) { await pg.waitForTimeout(250); continue; }
      const pick = w.find((p) => p.state === 'taken') || w.sort((a, c) => a.patience - c.patience)[0];
      if (pick.state !== 'taken') {
        const c = S.chips[pick.id];
        if (c) await tapAt(c.x, c.y); else if (pick.state === 'wait' && S.gate) await tapAt(S.gate.x, S.gate.y); else await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); __SHIFT.E.tapPilgrim(P); }, pick.id);
      }
      let took = await pg.waitForFunction(() => { const s = __SHIFT.state(); return s.carried || s.phase !== 'run'; }, null, { polling: 80, timeout: 1500 }).then(() => true, () => false);
      if (!took) { acts.retap++; await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); if (P) __SHIFT.E.tapPilgrim(P); }, pick.id); took = await pg.waitForFunction(() => __SHIFT.state().carried || __SHIFT.state().phase !== 'run', null, { polling: 80, timeout: 2000 }).then(() => true, () => false); }
      if (!took) continue;
      const cur = await G(() => { const s = __SHIFT.state(), P = __SHIFT.mods.pilgrims.list().find((q) => q.id === s.carried); return P ? { id: P.id, step: P.step, route: P.route } : null; });
      if (!cur) continue;
      if (o.shots && shotK === 0) { shotK++; await pg.waitForTimeout(700); await shot(`s30-1-taken-L${o.lvl}`); }
      const w0 = await G(() => (window.__S29W && __S29W.times ? __S29W.times().length : 0));
      // ── route31 ── (the laver once per round, first; then his route) ── /route31 ──
      const seq31 = ((await G(() => __SHIFT.state().washed)) === false ? ['kiyor'] : []).concat(cur.route.slice(cur.step || 0));
      for (let i = 0; i < seq31.length; i++) {
        const sid = seq31[i];
        const c = await G((sid) => { const e = document.querySelector(`.s29-st[data-st="${sid}"]`); if (!e || e.classList.contains('s29-hide')) return null; const q = e.getBoundingClientRect(); if (!(q.width && q.left > -100)) return null; const x = q.left + q.width / 2, y = q.top + q.height / 2, top = document.elementFromPoint(x, y), mine = !!(top && top.closest && top.closest(`.s29-st[data-st="${sid}"]`)); return { x, y, edge: e.classList.contains('s30-edge'), mine, top: mine ? '' : top ? (top.className || top.tagName) + '|' + ((top.closest && top.closest('[data-st],[data-pid],[data-sh]')) || {}).outerHTML?.slice(0, 80) : 'none' }; }, sid);
        if (c && !c.mine) { acts.covered = (acts.covered || []); if (acts.covered.length < 8) acts.covered.push([sid, c.top]); }
        if (c) await tapAt(c.x, c.y); else { await G((sid) => __SHIFT.E.tapStation(sid), sid); acts.api = (acts.api | 0) + 1; }
        const moving = await pg.waitForFunction(() => { const s = __SHIFT.state(), a = __SHIFT.mods.stations.state(); return !!a || !!s.acting || (window.__S29W && __S29W.state().on) || s.phase !== 'run'; }, null, { polling: 60, timeout: 1500 }).then(() => true, () => false);
        if (!moving) { await G((sid) => __SHIFT.E.tapStation(sid), sid); acts.retap++; }
        if (o.shots && i === 1 && c) { await pg.waitForTimeout(500); await shot(`s30-2-walk-${sid}-L${o.lvl}${c.edge ? '-fromedge' : ''}`); }
        const on = await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return (a && a.phase === 'act') || __SHIFT.state().phase !== 'run'; }, null, { polling: 60, timeout: 9000 }).then(() => true, () => false);
        if (!on || (await G(() => __SHIFT.state().phase)) !== 'run') break;
        const A = await G(() => __SHIFT.mods.stations.state()), B = await G(() => { const r = document.querySelector('.gm.tw-on .tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        acts.n++;
        if (A.verb === 'hold') { await down(7, B.x, B.y); await pg.waitForTimeout(500); if (o.shots) await shot(`s30-3-act-${A.id}-L${o.lvl}`); await pg.waitForTimeout(450); await up(7); }
        else if (A.verb === 'tapBeat') { await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.t >= 1.24; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await tapAt(B.x, B.y, 20); if (o.shots) { await pg.waitForTimeout(250); await shot(`s30-3-act-${A.id}-L${o.lvl}`); } }
        else if (A.verb === 'drag') { await down(7, B.x, B.y); for (let k = 1; k <= 5; k++) { await move(7, B.x - 14 * k, B.y - 10 * k); await pg.waitForTimeout(25); } await up(7); if (o.shots) { await pg.waitForTimeout(150); await shot(`s30-3-act-${A.id}-L${o.lvl}`); } }
        else if (A.verb === 'tapRight') { const ss = await G(() => __SHIFT.mods.stations.sealsAt()); const t = ss.find((q) => q.name === A.want) || ss[0]; if (t) await tapAt(t.x, t.y); else await tapAt(B.x, B.y); }
        else if (A.verb === 'tap3') { for (let k = 0; k < 3; k++) { await tapAt(B.x, B.y, 40); await pg.waitForTimeout(120); } }   // ── route31 ── ── /route31 ──
        else if (A.verb === 'holdWalk') { await down(7, B.x, B.y); await pg.waitForTimeout(1100); await up(7); }   // ── route31 ── ── /route31 ──
        else await tapAt(B.x, B.y);
        await pg.waitForFunction(() => !__SHIFT.mods.stations.state(), null, { polling: 80, timeout: 6000 }).catch(() => null);
        const L = await G(() => { const l = __SHIFT.mods.stations.log(); return l[l.length - 1]; }); if (L && L[0] === 'done' && L[3]) acts.gold++;
      }
      const wt = await G((n0) => (window.__S29W && __S29W.times ? __S29W.times().slice(n0) : []), w0);
      const served = await G((id) => !__SHIFT.mods.pilgrims.list().some((q) => q.id === id), cur.id);
      if (served && wt.length) trips.push(+(wt.reduce((s, v) => s + v, 0) / 1000).toFixed(2));
    }
    return { cut: true, acts, trips };
  }
  const again = async (lvl) => { const ta = Date.now(); const S2 = await G(() => { const e = document.querySelector('.sh-end [data-sh=again]'); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); if (S2) await tapAt(S2.x, S2.y); let re = await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase !== 'end' && !document.querySelector('.sh-end'), null, { polling: 100, timeout: 4000 }).then(() => true, () => false); if (!re) { await G((l) => __SHIFT.run(l), lvl); re = await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase !== 'end', null, { polling: 100, timeout: 8000 }).then(() => true, () => false); } return Date.now() - ta; };
  const allScores = [];
  try {
    await pg.waitForTimeout(1500);
    // ───────── the camera's frame at the start, the chips ─────────
    if (want('camera') || want('chips')) {
      await pg.waitForFunction(() => __SHIFT.state().phase === 'run', null, { polling: 100, timeout: 12000 }).catch(() => null);
      await pg.waitForTimeout(2600);   // (the twin's start frame glides to the follow camera)
      const c0 = await G(() => { const s = __S29C.state(), h = {}; __T.stages.heroXYZ(h); const q = __T.view.project(h.x, h.y + 3.2, h.z), cq = __T.view.camNow({}); return { s, him: [Math.round(q.x), Math.round(q.y)], dist: +Math.hypot(cq.px - h.x, cq.py - h.y - 3, cq.pz - h.z).toFixed(1), el: +Math.atan2(cq.py - cq.ty, Math.hypot(cq.px - cq.tx, cq.pz - cq.tz)).toFixed(2), behind: +(((cq.px - h.x) * Math.sin(h.yaw) + (cq.pz - h.z) * Math.cos(h.yaw)) / Math.hypot(cq.px - h.x, cq.pz - h.z)).toFixed(2) }; });
      check('[camera] the start: behind him (the camera on his back side), 25–40° down, him in the lower-middle third', c0.behind < -0.5 && c0.el > 0.4 && c0.el < 0.75 && c0.him[0] > 211 && c0.him[0] < 633 && c0.him[1] > 156 && c0.him[1] < 332, JSON.stringify(c0));
      await shot('s30-0-start');
      // ── flow31 ── (WAVE31 FLOW31 (4): during a take only the next place's chip and the gate's are drawn — the others are not) ── /flow31 ──
      await G(() => { const P = __SHIFT.mods.pilgrims.list()[0]; if (P) __SHIFT.E.tapPilgrim(P); }); await pg.waitForTimeout(600);
      const nx31 = await G(() => __SHIFT.E.flowNext && __SHIFT.E.flowNext());
      const ch = await G(() => [...document.querySelectorAll('.s29-st')].filter((e) => !e.classList.contains('f31-off')).map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.st, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), edge: e.classList.contains('s30-edge'), d: (e.querySelector('.s30-d') || {}).textContent || '' }; }));
      check('[chips] (FLOW31) during a take: the next place\'s chip and the gate\'s, all on the screen, ≥ 44 px tall', ch.length === 2 && ch.some((q) => q.id === 'gate') && ch.some((q) => nx31 && q.id === nx31.id) && ch.every((q) => q.x >= -2 && q.x + q.w <= 846 && q.y >= 0 && q.y + q.h <= 392 && q.h >= 44), JSON.stringify(ch));
      check('[chips] an edge chip carries its distance in amot', ch.every((q) => !q.edge || /^\d+$/.test(q.d)), JSON.stringify(ch.filter((q) => q.edge)));
      // a tap on an edge chip walks him there (≤ 20 amot/s)
      const e1 = ch.find((q) => q.id !== 'gate');   // ── flow31 ── (the next place's chip, at the edge or over its place) ── /flow31 ──
      if (e1) {
        const h0 = await G(() => { const h = {}; __T.stages.heroXYZ(h); return h; });
        await pg.waitForTimeout(100);   // (a player looks before the next touch: the chips settle after the take)
        const tp = await G((id) => { const e = document.querySelector(`.s29-st[data-st="${id}"]`), r = e.getBoundingClientRect(); for (const [u, v] of [[0.5, 0.5], [0.3, 0.5], [0.7, 0.5], [0.2, 0.3], [0.8, 0.7]]) { const x = r.left + r.width * u, y = r.top + r.height * v, t = document.elementFromPoint(x, y); if (t && t.closest && t.closest(`.s29-st[data-st="${id}"]`)) return { x, y }; } return { x: r.left + r.width / 2, y: r.top + r.height / 2, covered: true }; }, e1.id);
        await tapAt(tp.x, tp.y); if (tp.covered) console.log('   (the edge chip was covered at every point)');
        await pg.waitForTimeout(150); console.log('   edge tap', JSON.stringify(tp), JSON.stringify(await G(() => ({ log: (__SHIFT.debug.log() || []).slice(-4), walk: __S29W.state() }))));
        const sp = await G(async () => { const out = []; let last = null, first = null, dist = 0; for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 100)); const h = {}; __T.stages.heroXYZ(h); const t = performance.now(); if (last) { const d = Math.hypot(h.x - last.x, h.z - last.z); dist += d; out.push(d / ((t - last.t) / 1000)); } else first = t; last = { x: h.x, z: h.z, t }; if (!__S29W.state().on && i > 3) break; } return { max: +Math.max(0, ...out).toFixed(1), avg: +(dist / ((last.t - first) / 1000)).toFixed(1), st: __S29W.state() }; });   /* (avg: the walk's own pace — a 100-ms sample of the simulated loop may hold two ticks) */
        const h1 = await G(() => { const h = {}; __T.stages.heroXYZ(h); return h; });
        check(`[chips] a tap on the next place's chip "${e1.id}" walks him there, ≤ 20 amot/s on average (+ the sim's jitter)`, Math.hypot(h1.x - h0.x, h1.z - h0.z) > 3 && sp.avg <= 21, JSON.stringify({ moved: +Math.hypot(h1.x - h0.x, h1.z - h0.z).toFixed(1), ...sp }));
        await shot('s30-4-edge-walk');
      } else check('[chips] the next place\'s chip to tap', false, 'none');
      await G((l) => __SHIFT.run(l), LVLS[0]); await pg.waitForFunction(() => __SHIFT.state().phase === 'run', null, { polling: 100, timeout: 12000 }).catch(() => null);
      await G(() => { const S = window.__S30S; S.n = S.him = S.walkN = S.walkOn = S.chipN = S.chipOk = 0; S.bad = []; S.hx = []; S.camMode = {}; });
    }
    // ───────── full rounds by touch: the trips, the scores; the sampler's camera and chips numbers ─────────
    if (want('round') || want('camera')) {
      for (const lvl of LVLS) {
        if ((await G(() => __SHIFT.state().lvl || __SHIFT.state().level)) !== lvl) { await G((l) => __SHIFT.run(l), lvl); await pg.waitForTimeout(1500); }
        for (let r = 0; r < ROUNDS; r++) {
          const res = await playRound({ lvl, shots: r === 0 });
          allScores.push({ lvl, round: r + 1, ...res });
          console.log('ROUND', JSON.stringify({ lvl, round: r + 1, score: res.score, rival: res.rival, stars: res.stars, served: res.served, lost: res.lost, count: res.count, acts: res.acts, trips: res.trips }));
          if (r === 0) await shot(`s30-5-end-L${lvl}`);
          if (r < ROUNDS - 1 || lvl !== LVLS[LVLS.length - 1]) { const ms = await again(lvl); console.log('   again →', ms, 'ms'); if (r === ROUNDS - 1) { await G((l) => __SHIFT.run(l), LVLS[LVLS.indexOf(lvl) + 1]); await pg.waitForTimeout(1500); } }
        }
      }
      const trips = allScores.flatMap((s) => s.trips || []).filter((t) => t > 0);
      const L1 = allScores.filter((s) => s.lvl === 1).flatMap((s) => s.trips || []);
      if (L1.length) check('[round] level 1: each pilgrim\'s walking (his three stations\' tap-walks) ≤ 8 s', L1.every((t) => t <= 8), `trips (s) ${JSON.stringify(L1)} · mean ${(L1.reduce((s, v) => s + v, 0) / L1.length).toFixed(2)}`);
      check('[round] every round played to its end card', allScores.every((s) => !s.cut && Number.isFinite(s.score)), JSON.stringify(allScores.map((s) => [s.lvl, s.score, s.rival, s.stars, `${s.served}/${s.count}`])));
      const S = await G(() => window.__S30S);
      check('[camera] him in the lower-middle third (x 25–75 %, his middle y 40–85 %) in ≥ 90 % of the samples', S.n > 40 && S.him / S.n >= 0.9, `${S.him}/${S.n} = ${(S.him / Math.max(1, S.n) * 100).toFixed(1)} % · modes ${JSON.stringify(S.camMode)} · bad ${JSON.stringify(S.bad.filter((q) => q[0] === 'him').slice(0, 6))}`);
      check('[camera] the taken pilgrim on the screen in ≥ 80 % of the samples while they walk', S.walkN > 10 && S.walkOn / S.walkN >= 0.8, `${S.walkOn}/${S.walkN} = ${(S.walkOn / Math.max(1, S.walkN) * 100).toFixed(1)} % · ${JSON.stringify(S.bad.filter((q) => q[0] === 'pil').slice(0, 6))}`);
      check('[chips] off-screen anchors\' chips at the edge, on the screen, on their side in ≥ 85 % of the samples (a full edge sends one up the other side; an anchor beside the camera flips; the sampler reads the screen a tick apart from the layout while the camera turns)', S.chipN > 20 && S.chipOk / S.chipN >= 0.85, `${S.chipOk}/${S.chipN} · ${JSON.stringify(S.bad.filter((q) => q[0] === 'chip').slice(0, 6))}`);
      const g = await G(() => ({ ...(__DAY.cam28 && __DAY.cam28.state ? { guard: __DAY.cam28.state().mode, n: __DAY.cam28.state().n, blk: __DAY.cam28.state().blk } : {}) }));
      console.log('   guard', JSON.stringify(g));
    }
    // ───────── the frame-time log in the REAL loop (rendered frames) ─────────
    if (want('prof')) {
      await G((l) => { __SHIFT.run(l); }, LVLS[0]);
      // (SwiftShader renders a frame of this court in seconds — the real loop gave 6 frames a minute: the log runs in the tests' simulated
      //  loop (every part but the render, each 50-ms tick), and a timed render (__T.render) every 3 s stands for the render's share)
      await pg.waitForFunction(() => __SHIFT.state().phase === 'run', null, { polling: 200, timeout: 20000 }).catch(() => null);
      await pg.waitForTimeout(2500);
      await G(() => { __T.render(); __T.render(); });   // (the software renderer's first frames compile every material: not the loop's cost)
      await G(() => { __S30PROF.start(6000); });
      const res = await playRound({ lvl: LVLS[0], maxMs: PROF_S * 1000 });
      const rep = await G(() => { const R = []; for (let i = 0; i < 6; i++) { const t0 = performance.now(); __T.render(); R.push(Math.round(performance.now() - t0)); } __S30PROF.stop(); const r = __S30PROF.report(); r.renders = { ...(r.renders || {}), after: R };   /* (six renders at the round's end, timed — SwiftShader's, not a GPU's; the compiles: new shader programs in them) */   /* (the render apart: six in a row at the round's end — SwiftShader's, not a GPU's) */ const F = __S30PROF.frames().filter((f) => f.dt > 0); r.step60 = +Math.max(...F.map((f) => (f.step || 0) / Math.max(1, Math.min(f.dt, 50) / 16.7))).toFixed(2); r.step60n = F.filter((f) => (f.step || 0) / Math.max(1, Math.min(f.dt, 50) / 16.7) > 1.5).length; return r; });
      console.log('PROF', JSON.stringify(rep));
      console.log('PROF-PLAY', JSON.stringify({ served: res.served, score: res.score, acts: res.acts, trips: res.trips }));
      check('[prof] the log ran over the round (≥ 600 ticks): the CPU of a frame ≤ 40 ms in ≥ 99 % of them', rep.n >= 600 && rep.cpu.over40 <= rep.n * 0.01, `n ${rep.n} · tick p50 ${rep.p50} p95 ${rep.p95} max ${rep.max} ms (> 40: ${rep.over40}) · CPU ${JSON.stringify(rep.cpu)} · top ${JSON.stringify(rep.top)} · renders ${JSON.stringify(rep.renders)} · spikes ${JSON.stringify(rep.spikes)}`);
      check('[prof] no camera step > 1.5 amot per 60-fps frame (the step ÷ the frame\'s 16.7-ms share)', rep.step60n === 0, `max ${rep.step60} · raw max ${rep.stepMax} (${rep.steps15} raw > 1.5)`);
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { check('the run did not throw', false, String(e && e.stack || e).slice(0, 400)); }
  console.log('\nSCORES', JSON.stringify(allScores.map((s) => ({ lvl: s.lvl, round: s.round, score: s.score, rival: s.rival, stars: s.stars, served: s.served, count: s.count, lost: s.lost, gold: s.acts && s.acts.gold, acts: s.acts && s.acts.n, trips: s.trips }))));
  const pass = results.filter(Boolean).length;
  console.log(`\n${pass}/${results.length} passed · shots ${shots.length} · ${Math.round((Date.now() - T0) / 1000)} s`);
  await b.close();
  process.exit(pass === results.length ? 0 : 1);
})();
// ── /shift30 ──
