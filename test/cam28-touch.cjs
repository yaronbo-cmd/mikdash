// CAM28 (WAVE28: a camera that is never inside a wall; "lift me up"; the HUD that says what is HERE; the start frame; the chips' depth),
// by real touch on dist/test.html#avodah at 844×390:
//  walk   — at each of the day's places (teleport, then the stick walks him into the walls round it): every 100 ms the line from the
//           camera to his head is sampled (stages.frameBlocked, its floor rule as the close-up's, + the guard's own solids: the smoke
//           column, the laver, the tables): 0 blocked samples after the first 300 ms at each place; the marker chips never over the HUD;
//           a chip whose anchor is behind a wall is at half alpha
//  lift   — a vertical drag on the right half raises the camera by the drag's size (24 px: +15°/×1.3, 120 px: the overview's height),
//           it eases back after the release; a double-tap keeps it up and lets it down; the hint "גררו למעלה — לראות מגבוה"
//  here   — at a non-primary open marker: "כאן: <this> · אחר כך: <primary>", the button says this task, the arrow keeps the primary
//  start  — after a teleport and a new entry: him from behind at 20 amot (⚑ 12 cut his head at 32°), 25° down, a clear line; the frame's centre third holds him
//           (≥ 2 % of its pixels change when he is hidden)
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/cam28-touch.cjs --no-build [--noshots] [--only=walk,lift,here,start] [--places=a,b]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/cam28');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
let sharp = null; try { sharp = require('sharp'); } catch (e) { sharp = null; }
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (s) => !ONLY.length || ONLY.includes(s);
const PLACES = (args.find((a) => a.startsWith('--places=')) || '--places=night,moked,lambs,pen,kiyor,limbs,altar,deshen,gazit,heichal,rings,store').slice(9).split(',');
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'אביתר', mishmar: 3, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('c28')) { sessionStorage.setItem('c28', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; }, SAVE);
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y) => { await down(7, x, y); await pg.waitForTimeout(60); await up(7); };
  const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/cam28/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
  // the camera as it would render: its elevation about its target, its distance, the line to his head
  const camQ = () => G(() => { const c = __T.view.camNow({}), h = {}; __T.stages.heroXYZ(h); const dx = c.px - c.tx, dy = c.py - c.ty, dz = c.pz - c.tz; const hd = Math.hypot(c.px - h.x, c.py - h.y - 4.5, c.pz - h.z);
    return { el: +Math.atan2(dy, Math.hypot(dx, dz)).toFixed(3), d: +Math.hypot(dx, dy, dz).toFixed(1), hd: +hd.toFixed(1), elH: +Math.atan2(c.py - h.y - 4.5, Math.hypot(c.px - h.x, c.pz - h.z)).toFixed(3), back: (() => { const a = Math.atan2(c.pz - h.z, c.px - h.x), bk = Math.atan2(-Math.cos(h.yaw), -Math.sin(h.yaw)); let d = a - bk; d = Math.atan2(Math.sin(d), Math.cos(d)); return +d.toFixed(2); })(), seg: __DAY.cam28.seg(h.x, h.y + 1.6, h.z, c.px, c.py, c.pz), g: __DAY.cam28.state() }; });
  const setHour = async (h) => { await G((h) => { __DAY.clock.resume(); __DAY.clock.skipTo(h); __DAY.tasks.sync(); __DAY.D.refresh(); __DAY.clock.pause(); }, h); await pg.waitForTimeout(500); };
  try {
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on') && __DAY.cam28, null, 60000);
    check('Phase B day mode is on (twin + __DAY + the camera guard)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);
    await G(() => { window.__CAM28_NOHINT = false; });
    if (args.includes('--noside')) await G(() => { window.__CAM28_SIDE = 0; });   // (A/B: the day's own bearing search off — the guard alone)

    // ───────── start (first: the hint and the entry are fresh) ─────────
    if (want('start')) {
      const firstFrame = async (label, act) => {
        const n0 = await G(() => __TWIN.intro().n);
        await act(); await waitFor((n0) => __TWIN.intro().n > n0 && __TWIN.intro().on && __TWIN.intro().t > 0.05, n0, 4000); await pg.waitForTimeout(120);
        const q = await camQ(), it = await G(() => __TWIN.intro());
        check(`[start] ${label}: the first frame is him from behind at 20 amot, 25° down (or higher behind: the altar) — a clear line`, it.on && Math.abs(q.hd - 20) < 1.6 && Math.abs(q.elH - it.el) < 0.08 && it.el <= 0.86 && !q.seg && it.off != null && Math.abs(it.off) <= 1.65, `hd ${q.hd} el ${q.elH} (asked ${it.el}) seg ${q.seg} off ${it.off} back ${q.back} · ${q.g.mode}`);
        if (sharp) {
          const clip = { x: 281, y: 130, width: 282, height: 130 };
          const grab = async (show) => { await G((v) => { __T.simulate(false); __T.stages.hero.show(v); __T.render(); __T.render(); }, show); const buf = await pg.screenshot({ clip }); return sharp(buf).raw().toBuffer({ resolveWithObject: true }); };
          const a = await grab(true), bb = await grab(false); await G(() => { __T.stages.hero.show(true); __T.simulate(true); });
          let n = 0; const N = a.info.width * a.info.height, ch = a.info.channels;
          for (let i = 0; i < N; i++) { const o = i * ch; if (Math.abs(a.data[o] - bb.data[o]) + Math.abs(a.data[o + 1] - bb.data[o + 1]) + Math.abs(a.data[o + 2] - bb.data[o + 2]) > 30) n++; }
          check(`[start] ${label}: he is in the frame's centre third (≥ 2 % of its pixels are his)`, n / N >= 0.02, `${(100 * n / N).toFixed(1)} %`);
          if (SHOTS) { await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; }); await pg.screenshot({ path: path.join(OUT, `c28-start-${label}.png`) }); console.log(`   shot test/out/cam28/c28-start-${label}.png`); await G(() => { window.__HUD_HOLD = false; __T.simulate(true); }); }
        }
        await pg.waitForTimeout(2900);
        const q2 = await camQ(), it2 = await G(() => __TWIN.intro());
        check(`[start] ${label}: then the follow camera (the intro ended, ≈ 35 amot, 57°)`, !it2.on && q2.d > 28 && q2.el > 0.85, `d ${q2.d} el ${q2.el}`);
      };
      await setHour(10);
      await firstFrame('teleport-court', () => G(() => __DAY.teleport('court')));
      await firstFrame('teleport-deshen', () => G(() => __DAY.teleport('deshen')));
      await firstFrame('enter', () => G(() => { __DAY.D.exit(); __DAY.D.enter(); }));
    }

    // ───────── lift ─────────
    if (want('lift')) {
      await setHour(10);
      await G(() => __DAY.teleport('court')); await pg.waitForTimeout(3600);
      const hint = await G(() => { const e = document.querySelector('.tw-lift'); return !!e && !e.hidden && /גררו למעלה — לראות מגבוה/.test(e.textContent) && /⌃/.test(e.textContent); });
      check('[lift] the hint "⌃ גררו למעלה — לראות מגבוה" on the right half (first days)', hint);
      if (hint) await shot('c28-lift-0-hint');
      const q0 = await camQ();
      const X = 640, Y = 280;
      await down(9, X, Y); for (let k = 1; k <= 4; k++) { await move(9, X, Y - 8 * k); await pg.waitForTimeout(40); }
      await pg.waitForTimeout(900);
      const q1 = await camQ(), L1 = await G(() => __TWIN.lift());
      check('[lift] a short drag (32 px) raises it a little: +15° or so, ×1.3 the distance', q1.el - q0.el > 0.2 && q1.el - q0.el < 0.5 && q1.d / q0.d > 1.25 && q1.d / q0.d < 1.8, `el ${q0.el} → ${q1.el} · d ${q0.d} → ${q1.d} · k ${L1.k}`);
      await shot('c28-lift-1-little');
      for (let k = 1; k <= 8; k++) { await move(9, X, Y - 32 - 16 * k); await pg.waitForTimeout(40); }
      await pg.waitForTimeout(1300);
      const q2 = await camQ(), L2 = await G(() => __TWIN.lift());
      check('[lift] a long drag (160 px) raises it a lot: the overview\'s height, him in the middle', q2.el > 1.25 && q2.d > 300 && L2.held, `el ${q2.el} d ${q2.d} k ${L2.k}`);
      const mid = await G(() => { const h = {}; __T.stages.heroXYZ(h); const q = __T.view.project(h.x, h.y + 1, h.z); return { x: Math.round(q.x), y: Math.round(q.y), on: q.on }; });
      check('[lift] he stays in the frame\'s middle', mid.on && Math.abs(mid.x - 422) < 120 && Math.abs(mid.y - 195) < 90, JSON.stringify(mid));
      await shot('c28-lift-2-high');
      await pg.waitForTimeout(400);
      const qh = await camQ(); check('[lift] it holds while the finger holds', Math.abs(qh.el - q2.el) < 0.05, `el ${qh.el}`);
      await up(9);
      await pg.waitForTimeout(700);
      const q3 = await camQ(); check('[lift] after the release it eases back (half-way at 0.7 s)', q3.el < q2.el - 0.03 && q3.el > q0.el + 0.02, `el ${q3.el}`);
      await pg.waitForTimeout(1300);
      const q4 = await camQ(); check('[lift] … and is back after 1.5 s', Math.abs(q4.el - q0.el) < 0.04 && q4.d > 28 && q4.d < 36.5, `el ${q4.el} d ${q4.d} (${q0.d} before; 30 the follow camera's, 35 OrbitControls' floor) held ${q4.g.held}`);
      const card0 = await G(() => { const c = document.getElementById('card'); return !!(c && c.classList.contains('on')); });
      check('[lift] the drag opened no info card', !card0);
      // a double-tap keeps it up; another lets it down
      const hitEl = await G(() => { const e = document.elementFromPoint(700, 230); return e ? (e.id || e.className || e.tagName) : null; });
      console.log('   before', JSON.stringify(await G(() => __TWIN.lift())));
      await tapAt(700, 230); await pg.waitForTimeout(100); await tapAt(702, 232);
      console.log('   tap 2', JSON.stringify(await G(() => __TWIN.lift())));
      await pg.waitForTimeout(2200);
      console.log('   (the double-tap landed on', hitEl, ')');
      const q5 = await camQ(), L5 = await G(() => __TWIN.lift());
      check('[lift] a double-tap on the right half keeps it up ("stay up")', L5.stay && q5.el > q0.el + 0.2, `el ${q5.el} stay ${L5.stay}`);
      await tapAt(700, 230); await pg.waitForTimeout(140); await tapAt(702, 232);
      await pg.waitForTimeout(2200);
      const q6 = await camQ(), L6 = await G(() => __TWIN.lift());
      check('[lift] a second double-tap lets it down', !L6.stay && Math.abs(q6.el - q0.el) < 0.05, `el ${q6.el}`);
      const card1 = await G(() => { const c = document.getElementById('card'); return !!(c && c.classList.contains('on')); });
      check('[lift] the double-taps opened no info card (a single tap picks after the window)', !card1);
      await G(() => { try { document.getElementById('cx').click(); } catch (e) { /* */ } });
      // the stick still walks him while it is lifted; the pinch is untouched (fix26-touch)
      await down(9, X, Y); for (let k = 1; k <= 6; k++) { await move(9, X, Y - 20 * k); await pg.waitForTimeout(40); }
      await down(3, 160, 300); await move(3, 160, 240); await pg.waitForTimeout(1200);
      const w = await G(() => __TWIN.stick()); await up(3); await up(9);
      check('[lift] the stick walks him while the right thumb lifts', w.walked > 2, `walked ${w.walked}`);
      await pg.waitForTimeout(1800);
    }

    // ───────── here ─────────
    if (want('here')) {
      let found = null;
      for (const hr of [4.7, 6.5, 9, 13]) {
        await setHour(hr);
        found = await G(() => { const g = __DAY.g27, p = g.primary(); if (!p) return null; const P = __DAY.D.PLACE, pp = P[p.place] || P.court;
          for (const k of __DAY.tasks.open()) { if (k.id === p.id) continue; const q = P[k.place] || P.court; if (Math.hypot(q.x - pp.x, q.z - pp.z) < 14) continue;
            const crowd = __DAY.tasks.open().filter((x) => x.id !== k.id && Math.hypot((P[x.place] || P.court).x - q.x, (P[x.place] || P.court).z - q.z) < 6.5).length; if (crowd) continue;
            return { id: k.id, place: k.place, name: g.nameOf(k), prim: p.id, pname: g.nameOf(p), pplace: p.place }; } return null; });
        if (found) break;
      }
      check('[here] an open non-primary marker away from the primary', !!found, JSON.stringify(found));
      if (found) {
        await G((pl) => { const q = __DAY.D.PLACE[pl]; __DAY.teleport({ x: q.x + 2.6, z: q.z - 0.6 + 1.2 }); }, found.place); await pg.waitForTimeout(1500);
        const hud = await G(() => __DAY.hud()), sp = await G(() => __TWIN.spec()), gl = await G(() => __DAY.g27.goal()), pp = await G((pl) => __DAY.D.PLACE[pl], found.pplace);
        check('[here] line 2: "כאן: <this task> · אחר כך: <the primary>"', hud.h2 === `כאן: ${found.name} · אחר כך: ${found.pname}`, hud.h2);
        check('[here] the work button says this task', !!sp && sp.job === found.id && sp.label === found.name, JSON.stringify(sp));
        check('[here] the arrow still points to the primary', !!gl && Math.abs(gl.x - pp.x) < 0.5 && Math.abs(gl.z - pp.z) < 0.5, JSON.stringify(gl));
        await shot('c28-here');
        await G(() => __DAY.teleport({ x: -18, z: 28 })); await pg.waitForTimeout(1300);
        const hud2 = await G(() => __DAY.hud());
        check('[here] away from it, "עכשיו:" again', /^עכשיו:/.test(hud2.h2), hud2.h2);
      }
    }

    // ───────── walk ─────────
    if (want('walk')) {
      await setHour(4.7);
      let worst = 0, chipsBad = 0, chipsOcc = 0, chipsN = 0, msMax = 0, rise = 0, pull = 0;
      for (const id of PLACES) {
        if (id === 'night' || id === 'moked' || id === 'lambs') await setHour(2.2); else await setHour(10);
        await G((id) => __DAY.teleport(id), id);
        await pg.waitForTimeout(560);   // (the fade: 260 ms, then the first 300 ms at the place)
        await G(() => { const S = __T.stages, gy = (x, z) => { try { return S.groundAt(x, z); } catch (e) { return 16; } };
          clearInterval(window.__c28I); window.__c28 = { n: 0, blk: 0, fb: 0, list: [], ms: 0 };
          window.__c28I = setInterval(() => { const c = __T.view.camNow({}), h = {}; S.heroXYZ(h); const R = window.__c28; R.n++;
            const fb = S.frameBlocked(c.px, Math.max(c.py, gy(c.px, c.pz) + 3.05), c.pz, h.x, h.y + 1.6, h.z, 'x'), sg = __DAY.cam28.seg(h.x, h.y + 1.6, h.z, c.px, c.py, c.pz);
            if (fb) R.fb++; if (fb || sg) { R.blk++; if (R.list.length < 6) R.list.push([Math.round(h.x), Math.round(h.z), Math.round(c.px), Math.round(c.py), Math.round(c.pz), fb ? 'fb' : 'sg', __DAY.cam28.state().mode]); }
            const st = __DAY.cam28.state(); if (st.ms > R.ms) R.ms = st.ms; }, 100); });
        // the stick walks him into the walls round the place: four ways, 2.2 s each
        for (const [dx, dy] of [[55, 0], [0, -55], [-55, 0], [0, 55]]) { await down(3, 160, 300); await move(3, 160 + dx * 0.5, 300 + dy * 0.5); await move(3, 160 + dx, 300 + dy); await pg.waitForTimeout(2200); await up(3); await pg.waitForTimeout(150); }
        await pg.waitForTimeout(500);
        const R = await G(() => { clearInterval(window.__c28I); return window.__c28; }), gs = await G(() => __DAY.cam28.state());
        const fin = await G(() => { const h = {}; __T.stages.heroXYZ(h); const c = __T.view.camNow({}); return { h: [h.x, h.y, h.z].map((v) => Math.round(v * 10) / 10), c: [c.px, c.py, c.pz].map((v) => Math.round(v)) }; });
        worst = Math.max(worst, R.blk); msMax = Math.max(msMax, R.ms); rise += gs.blk;
        check(`[walk] ${id}: no sample with the camera behind or inside a solid (after 300 ms)`, R.blk === 0 && R.n > 40, `${R.blk}/${R.n} blocked (fb ${R.fb}) · end: him ${fin.h} cam ${fin.c} ${gs.mode} · guard ${gs.blk} fixes · max ${R.ms.toFixed(1)} ms ${R.list.length ? JSON.stringify(R.list) : ''}`);
        // the chips: never over the HUD; behind a wall → half alpha
        const ch = await G(() => { const hud = document.querySelector('.dy-gm .dy-hud'), hr = hud ? hud.getBoundingClientRect() : null, hb = hr ? hr.bottom : 0, out = [];
          for (const m of document.querySelectorAll('.tw-mk')) { if (/-999/.test(m.style.transform)) continue; const r = m.getBoundingClientRect(); if (r.left > innerWidth || r.right < 0 || r.top > innerHeight) continue;   /* (off the screen: not seen) */ const under = !!hr && r.right > hr.left && r.left < hr.right; out.push({ under, top: Math.round(r.top), hb: Math.round(hb), ub: Math.round(__TWIN.hudB(r.left + 40)), x: Math.round(r.left), oc: m.classList.contains('c28o'), op: getComputedStyle(m).opacity }); } return out; });
        for (const c of ch) { chipsN++; let bad = c.under && c.top < c.hb + 7; if (c.oc) { chipsOcc++; if (Math.abs(+c.op - 0.5) > 0.01) bad = true; } if (bad) { chipsBad++; console.log('   bad chip at', id, JSON.stringify(c)); } }
        await shot(`c28-walk-${id}`);
      }
      check('[walk] the chips are never over the HUD; a chip behind a wall is at 50 %', chipsBad === 0, `${chipsN} chips seen, ${chipsOcc} behind a wall, ${chipsBad} bad`);
      check('[walk] the guard\'s cost per frame (its worst frame)', msMax < 25, `max ${msMax.toFixed(1)} ms (SwiftShader on a 2-core host: the search's frames; a clear frame ≈ 1 ms)`);
      void worst; void rise; void pull;
    }
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.error(e); check('the run', false, e.message); }
  await b.close();
  const pass = results.filter(Boolean).length;
  console.log(`\n${pass}/${results.length} PASS  (${Math.round((Date.now() - T0) / 1000)} s)`);
  process.exit(pass === results.length ? 0 : 1);
})();
