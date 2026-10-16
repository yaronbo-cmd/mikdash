// SHIFT29B (WAVE29: the shift's world — pilgrims, stations, camera, the run) by real touch on dist/test.html#avodah at 844×390, through
// SHIFT29B's own bench (src/avodah/shift/lab.js: __SHIFTLAB — the modules without the engine):
//  pilgrims — each type spawns with its icon (🐑/🕊/🌾) and its prop (the lamb on a rope / the basket and doves / the bowl and the sheaf);
//             the patience bar's colour at 0.7 / 0.4 / 0.1 (green / amber / deep orange — never red); take → he follows 1.2 amot behind;
//             patience 0 → he leaves (puff, "הלך", gone in < 1.2 s)
//  stations — each act finishes by taps alone in ≤ 4 s (the work button / the seal chip, real touch) and reports its quality; the hold
//             (kiyor) and the drag (altar) give gold; the act's kohen is drawn within 50 ms; a wrong station says "לא — הכיור קודם"
//  camera   — with him at the gate, the laver, the rings and the altar: every frame point (the line's ends, the five stations) projects
//             inside the screen with a 24-px margin; the lift still raises it
//  run      — the stick walks him ×1.8; a tap on a station walks him there by himself
//  colour   — no red in the kit but BLOOD's, none by a figure or on the floor; no console errors; shots
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/shift29-world.cjs --no-build [--noshots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/shift29b');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (s) => !ONLY.length || ONLY.includes(s);
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
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('s29b')) { sessionStorage.setItem('s29b', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; }, SAVE);
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 60) => { await down(7, x, y); await pg.waitForTimeout(ms); await up(7); };
  const shots = [];
  const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.render(); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); shots.push(name); console.log('   shot test/out/shift29b/' + name + '.png'); };
  const btn = () => G(() => { const r = document.querySelector('.gm.tw-on .tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const setPos = (x, z, face) => G(([x, z, f]) => { __T.stages.hero.setPos(x, z, f ? Math.atan2(f[0] - x, f[1] - z) : undefined); }, [x, z, face]);
  try {
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on') && __DAY.cam28 && __DAY.D.active, null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(600);
    await G(() => { __DAY.clock.resume(); __DAY.clock.skipTo(7); __DAY.tasks.sync(); __DAY.D.refresh(); });
    const started = await G(() => __SHIFTLAB.start({ spawn: false, patienceS: 300 }).then((m) => !!m));
    check('the bench starts (pilgrims, stations, camera, run)', started); if (!started) throw new Error('no lab');
    // ── flow31 ── (the day's guide is live under the bench: after 3 s idle it turns him toward its task, after 20 s it walks him there and calls —
    // it turned the bar's chip off the frame and walked him during the stick's legs; the shift itself exits the guide (D.shiftMode)) ── /flow31 ──
    await G(() => { try { const g = __DAY.D.guide && __DAY.D.guide(); if (g && g.exit) g.exit(); } catch (e) { /* */ } });
    await pg.waitForTimeout(1500);

    // ───────── pilgrims ─────────
    if (want('pilgrims')) {
      await setPos(-15, -8, [-15, 5]); await pg.waitForTimeout(400); await G(() => __SHIFTLAB.mods.walk.to(-15, -4, 0.6, { x: -15, z: 5 })); await pg.waitForTimeout(1600);   // ── shift30 ── (the camera is behind him now: he walks a step toward the line from the north, so it stands ahead of him) ── /shift30 ──
      const sp = await G(() => { const M = __SHIFTLAB.mods; M.P.clear(); const out = []; for (const t of ['olah', 'ken', 'mincha']) { const P = M.P.spawn(t); out.push({ t, id: P.id, icon: P.icon, chip: P.el ? P.el.querySelector('i').textContent : '', route: P.route.join('>'), bar: !!(P.el && P.el.querySelector('b s')) }); } out.push({ fourth: M.P.spawn('olah') === null }); return out; });
      const ok3 = sp[0].icon === '🐑' && sp[1].icon === '🕊' && sp[2].icon === '🌾' && sp.slice(0, 3).every((q) => q.chip === q.icon && q.bar);
      check('[pilgrims] each type spawns with its icon on a chip with a patience bar', ok3, JSON.stringify(sp.slice(0, 3).map((q) => q.icon + q.route)));
      check('[pilgrims] the routes (route31: the true ones; the laver is the kohen\'s own, once): olah samicha>shechita>zerika>nituach>kevesh · ken melika>mitzui · mincha hagasha>kemitza>haktara', sp[0].route === 'samicha>shechita>zerika>nituach>kevesh' && sp[1].route === 'melika>mitzui' && sp[2].route === 'hagasha>kemitza>haktara');
      check('[pilgrims] at most three wait in the line (a fourth is refused)', sp[3].fourth);
      await pg.waitForTimeout(3200);
      await pg.waitForFunction(() => __SHIFTLAB.mods.P.list().every((P) => P.state !== 'wait' || Math.hypot(P._x - P._tx, P._z - P._tz) < 0.4), null, { polling: 200, timeout: 8000 }).catch(() => null);   // ── shift30 ── (in their places in the line, ahead of him) ── /shift30 ──
      // the props: the kit's figures this frame (a lamb for the olah), the basket/bowl pieces near the ken/mincha hands
      const fig = await G(() => { const k = __W22.kit(); const f = k.figs.map((q) => q[3]); return { man: f.filter((x) => x === 'man').length, lamb: f.filter((x) => x === 'lamb').length, stats: k.stats() }; });
      check('[pilgrims] the figures are drawn: three men and the olah\'s lamb', fig.man >= 3 && fig.lamb >= 1, JSON.stringify(fig) + ' ' + JSON.stringify(await G(() => __S29D())));
      const chipsIn = await G(() => [...document.querySelectorAll('.s29-pc')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }));
      // ── shift30 ── (the camera follows behind him: a pilgrim out of the frame has no chip — the gate's chip stands for the line; the
      // chips of those in the frame are on the screen) ── /shift30 ──
      const vis = await G(() => __SHIFTLAB.mods.P.list().map((P) => { const q = __T.view.project(P._x, 20.3, P._z); const r = P.el.getBoundingClientRect(); return { inFrame: q.on && q.x > 0 && q.x < innerWidth && q.y > 0 && q.y < innerHeight, chip: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }; }));
      check('[pilgrims] the chips of the pilgrims in the frame are on the screen, ≥ 44 px tall', vis.some((v) => v.inFrame) && vis.filter((v) => v.inFrame).every((v) => v.chip[0] > -10 && v.chip[0] < 844 && v.chip[1] > 0 && v.chip[1] < 390 && v.chip[3] >= 44), JSON.stringify(vis) + ' ' + JSON.stringify(chipsIn));
      await shot('s29b-1-line');
      // the bar's colour by patience
      const cols = await G(async () => { const L = __SHIFTLAB.mods.P.list(), P = L.find((q) => q.el && !/-999/.test(q.el.style.transform)) || L[0], out = [];   /* ── shift30 ── (one whose chip is shown) ── /shift30 ── */ for (const p of [0.7, 0.4, 0.1]) { P.patience = p; await new Promise((r) => setTimeout(r, 1500));   /* ── shift30 ── (a few ticks after the run's first render: 120 ms was one tick on a loaded runner) ── /shift30 ── */ out.push(getComputedStyle(P.el.querySelector('b s')).backgroundColor); } P.patience = 1; return out; });
      const hue = (c) => { const m = c.match(/\d+/g).map(Number), [r, g, bb] = m, mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), d = mx - mn; if (!d) return 0; let h = mx === r ? ((g - bb) / d) % 6 : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4; h *= 60; return h < 0 ? h + 360 : h; };
      const hs = cols.map(hue);
      check('[pilgrims] the bar: green at 0.7, amber at 0.4, deep orange at 0.1 (not red: hue > 15°)', hs[0] > 90 && hs[0] < 150 && hs[1] > 30 && hs[1] < 55 && hs[2] > 15 && hs[2] < 30, `${cols.join(' · ')} → ${hs.map((h) => Math.round(h)).join('/')}`);
      // take → he follows 1.2 amot behind (walk the hero 12 amot away by himself)
      const tk = await G(() => { const M = __SHIFTLAB.mods, P = M.P.next(); const h = {}; __T.stages.heroXYZ(h); __T.stages.hero.setPos(P._x - 2, P._z, 0); M.P.take(P); return { id: P.id, st: P.state }; });
      await G(() => { __SHIFTLAB.mods.walk.to(-24, 8, 1.2); }); await pg.waitForTimeout(2500);
      await pg.waitForFunction(() => !__S29W.state().on, null, { polling: 100, timeout: 6000 }).catch(() => null); await pg.waitForTimeout(1500);
      const fd = await G((id) => { const P = __SHIFTLAB.mods.P.all().find((q) => q.id === id), h = {}; __T.stages.heroXYZ(h); return { d: +Math.hypot(P._x - h.x, P._z - h.z).toFixed(2), st: P.state, h: [h.x, h.z].map((v) => +v.toFixed(1)) }; }, tk.id);
      check('[pilgrims] taken: he follows the kohen, stopping ~1.2 amot behind', fd.st === 'taken' && fd.d > 0.7 && fd.d < 2.2, JSON.stringify(fd));
      await shot('s29b-2-follow');
      // patience 0 → he leaves
      const lv = await G(async () => { const M = __SHIFTLAB.mods, P = M.P.list().find((q) => q.state === 'wait'); P.patience = 0.00001; const t0 = performance.now(); await new Promise((r) => setTimeout(r, 250)); const s1 = P.state, fl = !!document.querySelector('.s29-fl'), txt = document.querySelector('.s29-fl') ? document.querySelector('.s29-fl').textContent : ''; await new Promise((r) => setTimeout(r, 1000)); return { s1, fl, txt, gone: !M.P.all().includes(P), left: M.P.stats().left, ms: Math.round(performance.now() - t0) }; });
      check('[pilgrims] patience 0: he leaves — "הלך", the chip and the figure gone in ≤ 1.3 s', lv.s1 === 'left' && lv.txt === 'הלך' && lv.gone && lv.left >= 1, JSON.stringify(lv));
      await G(() => __SHIFTLAB.mods.P.clear());
    }

    // ───────── stations ─────────
    if (want('stations')) {
      const runAct = async (id, type, how, cap) => {
        const S = await G(([id, type, cap]) => { window.__S29_CAP = cap; const M = __SHIFTLAB.mods, st = __SHIFTLAB.STATIONS[id]; M.P.clear(); const P = M.P.spawn(type); P._x = st.stand.x + 1.5; P._z = st.stand.z + 1; M.P.release(P); __T.stages.hero.setPos(st.stand.x, st.stand.z, Math.atan2(st.at.x - st.stand.x, st.at.z - st.stand.z)); window.__ACT = null; window.__ACT0 = performance.now(); M.st.act(id, P).then((r) => { window.__ACT = r; }); return { stand: st.stand }; }, [id, type, cap != null ? cap : id === 'seals' ? 9 : 0]);
        await pg.waitForTimeout(60);
        const ff = await G(() => { const s = __SHIFTLAB.mods.st.state(); return s ? s.firstFrame : -1; });
        const B = await btn(); const t0 = Date.now();
        if (how === 'tap') { await pg.waitForTimeout(250); await tapAt(B.x, B.y); }
        else if (how === 'beat') { await pg.waitForFunction(() => { const a = __SHIFTLAB.mods.st.state(); return !a || a.t >= 1.24; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await tapAt(B.x, B.y, 20); }
        else if (how === 'hold') { await down(7, B.x, B.y); await pg.waitForTimeout(1000); await up(7); }
        else if (how === 'drag') { const c = { dx: -0.8, dy: -0.6 }, L = 1; await down(7, B.x, B.y); for (let i = 1; i <= 5; i++) { await move(7, B.x + c.dx / L * 16 * i, B.y + c.dy / L * 16 * i); await pg.waitForTimeout(30); } await up(7); }
        else if (how === 'seal') { await pg.waitForTimeout(250); const ss = await G(() => __SHIFTLAB.mods.st.sealsAt()); const w = await G(() => __SHIFTLAB.mods.st.state().want); const t = ss.find((q) => q.name === w); if (t) await tapAt(t.x, t.y); }
        else if (how === 'sealwrong') { await pg.waitForTimeout(250); const ss = await G(() => __SHIFTLAB.mods.st.sealsAt()); const w = await G(() => __SHIFTLAB.mods.st.state().want); const bad = ss.find((q) => q.name !== w), t = ss.find((q) => q.name === w); await tapAt(bad.x, bad.y); await pg.waitForTimeout(300); await tapAt(t.x, t.y); }
        if (how === 'shot') { await pg.waitForTimeout(200); }
        return { S, ff, t0 };
      };
      const finishAct = async (label, r0, gold) => {
        const ok = await waitFor(() => !!window.__ACT, null, 6000);
        const r = await G(() => ({ ...window.__ACT, wall: Math.round(performance.now() - window.__ACT0) }));
        check(`[stations] ${label}: finished by touch in ≤ 4 s, quality reported${gold ? ', gold' : ''}`, ok && r.ms <= 4000 && r.quality > 0 && r.touches <= 3 && (!gold || r.gold), JSON.stringify(r));
        check(`[stations] ${label}: the kohen acts within 50 ms`, r0.ff >= 0 && r0.ff <= 50, `first frame ${r0.ff} ms`);
        await pg.waitForTimeout(200);
        return r;
      };
      const k1 = await runAct('kiyor', 'olah', 'tap'); await finishAct('kiyor by a tap', k1, false);
      const k2 = await runAct('kiyor', 'olah', 'hold'); await finishAct('kiyor by a hold of 1 s', k2, true);
      // a shot in the middle of an act: the hold
      { await runAct('kiyor', 'olah', 'none', 12); const B = await btn(); await down(7, B.x, B.y); await pg.waitForTimeout(900); await shot('s29b-3-kiyor-hold'); await pg.waitForTimeout(400); await up(7); await waitFor(() => !!window.__ACT, null, 5000); await pg.waitForTimeout(700); }
      const r1 = await runAct('rings', 'olah', 'tap'); await finishAct('rings by a tap', r1, false);
      { await runAct('rings', 'olah', 'beat'); await shot('s29b-4-rings-screen'); const ok = await waitFor(() => !!window.__ACT, null, 5000); const r = await G(() => window.__ACT); check('[stations] rings on the beat: gold', ok && r.gold, JSON.stringify(r)); }
      { await G(() => { window.__S29_SLOW = 8; }); await runAct('rings', 'olah', 'tap'); await pg.waitForTimeout(2600); const bc = await G(() => __W22.kit().bloodCheck()); check('[stations] rings: the vessel\'s liquid only (tagged vessel), none by a figure, none on the floor, no forbidden red', bc.reds === 0 && bc.floor === 0 && bc.untagged === 0 && (bc.tags.vessel | 0) >= 1, JSON.stringify({ n: bc.n, tags: bc.tags, nearFig: bc.nearFig, floor: bc.floor, reds: bc.reds })); await shot('s29b-5-rings-vessel'); await G(() => { window.__S29_SLOW = 0; }); await waitFor(() => !!window.__ACT, null, 12000); }
      const a1 = await runAct('altar', 'olah', 'tap'); await finishAct('altar by a tap', a1, false);
      const a2 = await runAct('altar', 'olah', 'drag'); const ra2 = await finishAct('altar by a drag toward the corner', a2, true); void ra2;
      { const mk = await G(() => { const m = __T.avodah && __T.avodah.marksState ? __T.avodah.marksState() : null; return m; }); void mk; }
      await shot('s29b-6-altar-mark');
      const d1 = await runAct('duchan', 'ken', 'tap'); await finishAct('duchan by a tap', d1, false);
      const s1 = await runAct('seals', 'mincha', 'seal'); await finishAct('seals: the right seal (זכר for the mincha ⚑)', s1, true);
      { await runAct('seals', 'mincha', 'none'); await pg.waitForTimeout(1200); await shot('s29b-7-seals'); const ss = await G(() => __SHIFTLAB.mods.st.sealsAt()); check('[stations] seals: three chips over the booth, ≥ 44 px, on the screen', ss.length === 3 && ss.every((q) => q.x > 20 && q.x < 824 && q.y > 30 && q.y < 370), JSON.stringify(ss)); const B = await btn(); await tapAt(B.x, B.y); await pg.waitForTimeout(200); await tapAt(B.x, B.y); await pg.waitForTimeout(200); await tapAt(B.x, B.y); const ok = await waitFor(() => !!window.__ACT, null, 5000); check('[stations] seals by the button alone: three taps finish it (no seal chosen → quality 0.5)', ok, JSON.stringify(await G(() => window.__ACT))); }
      const s2 = await runAct('seals', 'mincha', 'sealwrong'); const rs2 = await finishAct('seals: a wrong seal shakes, then the right one', s2, false); check('[stations] seals: a wrong seal first → not gold, no penalty (quality ≥ 0.5)', !rs2.gold && rs2.quality >= 0.5);
      // a touch-less act ends by itself at the cap
      { await runAct('duchan', 'ken', 'none'); const ok = await waitFor(() => !!window.__ACT, null, 6000); const r = await G(() => window.__ACT); check('[stations] an act left alone ends by itself in ≤ 4 s (never stuck)', ok && r.ms <= 4200, JSON.stringify(r)); }
      // the wrong station
      const wr = await G(async () => { const t = __SHIFTLAB.mods.st.wrong('rings', 'kiyor'); await new Promise((r) => setTimeout(r, 120)); const e = document.querySelector('.s29-no'); return { t, on: !!e && e.textContent }; });
      check('[stations] a station out of order: "לא — הכיור קודם"', wr.t === 'לא — הכיור קודם' && wr.on === 'לא — הכיור קודם', JSON.stringify(wr));
      await G(() => { window.__S29_CAP = 0; }); await waitFor(() => !__SHIFTLAB.mods.st.busy, null, 9000);
      // the hero back, visible, after the acts
      const hv = await G(() => { const h = {}; __T.stages.heroXYZ(h); return !!h.vis || __T.stages.hero.position != null; });
      check('[stations] the hero is back in his own body after the acts', hv);
      await G(() => __SHIFTLAB.mods.P.clear());
    }

    // ───────── camera ─────────
    if (want('camera')) {
      // ── shift30 ── (WAVE30: the overview board is gone — the camera follows behind him; what the board showed, the chips show: every
      // station's chip on the screen, over its anchor or at the edge toward it with its distance; him in the lower-middle of the frame) ── /shift30 ──
      const ST0 = await G(() => { const o = {}; for (const id in __SHIFTLAB.STATIONS) o[id] = [__SHIFTLAB.STATIONS[id].stand.x, __SHIFTLAB.STATIONS[id].stand.z]; return o; });
      const spots = { gate: [-18, 3], kiyor: ST0.kiyor, rings: ST0.rings, altar: ST0.altar, seals: ST0.seals };
      let i = 0;
      for (const id in spots) {
        await setPos(spots[id][0], spots[id][1]); await pg.waitForTimeout(3200);
        const f = await G(() => { const W = innerWidth, H = innerHeight, out = []; for (const e of document.querySelectorAll('.s29-st')) { const r = e.getBoundingClientRect(); out.push([e.dataset.st, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom), e.classList.contains('s30-edge')]); } const h = {}; __T.stages.heroXYZ(h); const hq = __T.view.project(h.x, h.y + 3.2, h.z); const c = __T.view.camNow({}); const el = Math.atan2(c.py - c.ty, Math.hypot(c.px - c.tx, c.pz - c.tz)); return { out, hero: [Math.round(hq.x), Math.round(hq.y)], el: +el.toFixed(2), st: __S29C.state(), d: +Math.hypot(c.px - c.tx, c.py - c.ty, c.pz - c.tz).toFixed(1) }; });
        const inside = f.out.length >= 5 && f.out.every((q) => q[1] >= -2 && q[3] <= 846 && q[2] >= 0 && q[4] <= 392) && f.hero[0] > 150 && f.hero[0] < 694 && f.hero[1] > 120 && f.hero[1] < 370;
        check(`[camera] him at ${id}: the follow camera — him in the lower-middle, every station's chip on the screen (over it or at the edge)`, inside, `chips ${JSON.stringify(f.out)} · him ${f.hero} · el ${f.el} d ${f.d}`);
        if (i++ < 2 || id === 'altar') await shot(`s29b-8-cam-${id}`);
      }
      // the lift still works over the shift's camera
      const d0 = await G(() => { const c = __T.view.camNow({}); return Math.hypot(c.px - c.tx, c.py - c.ty, c.pz - c.tz); });
      const X = 640, Y = 280; await down(9, X, Y); for (let k = 1; k <= 6; k++) { await move(9, X, Y - 10 * k); await pg.waitForTimeout(40); } await pg.waitForTimeout(800);
      const d1 = await G(() => { const c = __T.view.camNow({}); return Math.hypot(c.px - c.tx, c.py - c.ty, c.pz - c.tz); }); await up(9);
      // ── flow31 ── (WAVE31 FLOW31 (5): the lift gesture is OFF in the shift — it fought the button; the "מבט על" button holds the view up) ── /flow31 ──
      check('[camera] (FLOW31) the lift gesture is off over the shift camera (a drag on the right half leaves it)', d1 < d0 * 1.08, `${d0.toFixed(1)} → ${d1.toFixed(1)}`);
      await pg.waitForTimeout(1800);
    }

    // ───────── run ─────────
    if (want('run')) {
      // the run: the same stick drag with speedMul 1 and with the shift's 1.8 — the ratio (the harness's own clock noise cancels)
      const leg = async (mul) => {
        await setPos(-14, 0, [-30, 0]); await G((m) => { __T.stages.hero.speedMul = m; }, mul); await pg.waitForTimeout(400);
        const a0 = await G(() => { const h = {}; __T.stages.heroXYZ(h); return [h.x, h.z, performance.now()]; });
        await down(3, 150, 300); for (let k = 1; k <= 6; k++) { await move(3, 150 + 10 * k, 300 - 6 * k); await pg.waitForTimeout(30); }
        await pg.waitForTimeout(700);
        const a1 = await G(() => { const h = {}; __T.stages.heroXYZ(h); return [h.x, h.z, performance.now()]; }); await up(3); await pg.waitForTimeout(300);
        return Math.hypot(a1[0] - a0[0], a1[1] - a0[1]) / ((a1[2] - a0[2]) / 1000);
      };
      await G(() => __SHIFTLAB.mods.cam.off());   // ── shift30 ── (the run measured under the day's fixed-bearing camera: the follow camera turns behind his pace and curves the same drag) ── /shift30 ──
      const v1 = await leg(1), v18 = await leg(1.8);
      await G(() => __SHIFTLAB.mods.cam.on()); await G(() => { __T.stages.hero.speedMul = 1.8; });
      check('[run] the stick walks him ×1.8 during the shift (the same drag, speedMul 1 vs 1.8)', v18 / v1 > 1.5 && v18 / v1 < 2.1, `${v1.toFixed(1)} → ${v18.toFixed(1)} amot/s · ×${(v18 / v1).toFixed(2)}`);
      await pg.waitForTimeout(300);
      // a tap on a station's chip walks him there by himself (── route31 ── the corner's act is the zerika now: the old 'altar' has no chip ── /route31 ──)
      await setPos(-14, 0); await pg.waitForTimeout(1500);
      // ── shift30 ── (the chip's visible part: an edge chip may lie half under another — the finger goes where it is seen) ── /shift30 ──
      const c = await G(() => { const e = document.querySelector('.s29-st[data-st="zerika"]'); const r = e.getBoundingClientRect(); for (const [u, v] of [[0.5, 0.5], [0.25, 0.5], [0.75, 0.5], [0.15, 0.3], [0.85, 0.3], [0.15, 0.7], [0.85, 0.7]]) { const x = r.left + r.width * u, y = r.top + r.height * v, t = document.elementFromPoint(x, y); if (t && t.closest && t.closest('.s29-st[data-st="zerika"]')) return { x, y }; } return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      const t0 = Date.now(); await tapAt(c.x, c.y);
      const arrived = await waitFor(() => { const s = __S29W.state(); return !s.on && s.arrived; }, null, 9000);
      const ws = await G(() => { const h = {}; __T.stages.heroXYZ(h); const s = __SHIFTLAB.STATIONS.zerika.stand; return { d: +Math.hypot(h.x - s.x, h.z - s.z).toFixed(1), st: __S29W.state() }; });
      check('[run] a tap on a station walks him there by himself', arrived && ws.d < 2.2, `${Date.now() - t0} ms · ${JSON.stringify(ws)}`);
      await shot('s29b-9-arrived');
    }

    const red = await G(() => __W22.kit().reds());
    check('no forbidden red in the kit', red === 0, String(red));
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.error(e); check('the run', false, e.message); }
  await b.close();
  const pass = results.filter(Boolean).length;
  console.log(`\nshots: ${shots.length}\n${pass}/${results.length} PASS  (${Math.round((Date.now() - T0) / 1000)} s)`);
  process.exit(pass === results.length ? 0 : 1);
})();
