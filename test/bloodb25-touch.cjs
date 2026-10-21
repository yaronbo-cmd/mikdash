// BLOODB25 (DAM25 §3 lower half) in ENGINE22's day, by real touch on dist/test.html#avodah at 844×390: the private offerings at the real rings by
// the kind the queue sent — עולה (two Γ marks on the real altar BELOW the line, NE then SW), חטאת (up the ramp, the four horns ABOVE the line in
// order SE → NE → NW → SW; a wrong horn waits with "קודם …", no penalty), קן (the mark on the wall: חטאת העוף below, עולת העוף above) — the
// slaughter behind the screen pays nothing (no act while it lasts, the grave tone), the camera never over the screen, no palette piece near a
// figure or on the floor, no forbidden red; the six washings at the day's end; the gardener at the outlet (+1). No console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/bloodb25-touch.cjs [--no-build] [--only=olah,chatat,ken,vessels,ganan]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/bloodb25');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const RUNS = ['olah', 'chatat', 'ken', 'vessels', 'ganan'].filter((i) => !ONLY.length || ONLY.includes(i));
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage(); const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    let shotMs = 0; const shots = [];
    const shot = async (name) => { const sT = Date.now(); try { await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); shots.push(name); console.log('   shot test/out/bloodb25/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); } finally { shotMs += Date.now() - sT; } };
    const tapBtn = async (bc) => { await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);
    /** bring the errand to its hour, alone, the hero at its marker, the camera behind him; → its info */
    async function ready(id, tag) {
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, game: k.game || null, place: k.place } : null; }, id);
      check(`${tag} the errand exists and is a work`, info && info.work && !info.game, JSON.stringify(info)); if (!info) return null;
      await G((h) => { __DAY.clock.skipTo(h + 0.05); __DAY.D.refresh && __DAY.D.refresh(); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; if (__DAY.tasks.get(id).state !== 'open') __DAY.tasks.get(id).state = 'open'; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      const awake = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
      check(`${tag} the right button wakes at the marker`, awake);
      await G(() => { const v = __T.view, c = v.camNow({}), h = {}; __T.stages.heroXYZ(h); const r = Math.hypot(c.px - c.tx, c.pz - c.tz) || 8, hy = c.py - c.ty; v.camSet(h.x - r, c.ty + hy, h.z, h.x, c.ty, h.z); });
      await pg.waitForTimeout(2000); await G(() => { window.__GAME_LOG.length = 0; });
      return info;
    }
    /** a sample of the stage now: the kit's blood check, the world's marks against the figures, the camera vs the screen */
    const sample = () => G(() => {
      const k = window.__W22 && __W22.kit(), M = window.__YACHID, bc = k && k.bloodCheck ? k.bloodCheck() : { n: 0, nearFig: 0, floor: 0, reds: 0 };
      const figs = k ? k.figs.slice() : [], av = __T.avodah, wm = av && av.marks ? av.marks() : [];
      let nearW = 0; for (const m of wm) for (const f of figs) { const dy = m.y - f[1]; if (Math.hypot(m.x - f[0], m.z - f[2]) < 1.5 && dy > -0.3 && dy < 4) { nearW++; break; } }
      const c = __T.camera.position, Y = window.__YACHID25, s = M && M.cur ? M.cur.k : '';
      let over = false; if (Y && (s === 'shecht')) { const R = Y.RG, S = Y.SCR, u = (S.z - c.z) / (R[1] - c.z), yAt = c.y + (17.2 - c.y) * u, xAt = c.x + (R[0] - c.x) * u; over = !(u > 0 && u < 1 && yAt < 16 + S.h && xAt > S.x0 && xAt < S.x0 + S.w); }
      return { bc: { n: bc.n, nearFig: bc.nearFig, floor: bc.floor, reds: bc.reds, tags: bc.tags }, nearW, wm: wm.length, step: s, i: M ? M.i : -1, acts: M ? M.acts.length : 0, over, cam: [+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)], figs: figs.length };
    });

    for (const kind of RUNS.filter((r) => ['olah', 'chatat', 'ken'].includes(r))) {
      const tag = `[yachid:${kind}]`;
      await G((kd) => { window.__YACHID_KINDS = [kd]; window.__YACHID = null; try { __T.avodah.clearMarks(); } catch (e) { /* */ } }, kind);
      const info = await ready('yachid', tag); if (!info) continue;
      const bc = await btnC(); let n = 0, t0 = Date.now(); shotMs = 0;
      const agg = { nearFig: 0, nearW: 0, floor: 0, reds: 0, over: 0, liquid: 0, shechtActs: new Set(), grave: 0 };
      const seenShot = new Set(); let wrongTried = false;
      while (!(await G(() => __DAY.tasks.get('yachid').state === 'done')) && Date.now() - t0 - shotMs < 75000) {
        // the wrong horn first (chatat): it must wait
        if (kind === 'chatat' && !wrongTried) {
          const st = await G(() => { const M = window.__YACHID; return M && !M.cur && M.steps[M.i] && M.steps[M.i].k === 'horn' ? { i: M.i, c: M.steps[M.i].c, miss: M.miss } : null; });
          if (st) {
            wrongTried = true;
            const HE = { SE: 'דרומית־מזרחית', NE: 'מזרחית־צפונית', NW: 'צפונית־מערבית', SW: 'מערבית־דרומית' }, wrongC = st.c === 'SW' ? 'NE' : 'SW';
            const r = await G((c) => { const M = window.__YACHID, ok = M.horn(c); return { ok, warn: M.warn, i: M.i, miss: M.miss, cur: !!M.cur }; }, wrongC);
            await pg.waitForTimeout(500); const i2 = await G(() => window.__YACHID.i);
            check(`${tag} a wrong horn (${wrongC} before ${st.c}): "קודם …", it waits, no penalty`, !r.ok && r.warn === 'קודם ' + HE[st.c] && r.i === st.i && i2 === st.i && r.miss === st.miss && !r.cur, JSON.stringify(r));
            await shot(`${kind}-wrong-horn`);
          }
        }
        await tapBtn(bc); n++;
        for (let w = 0; w < 4; w++) {
          await pg.waitForTimeout(110);
          const S = await sample();
          agg.nearFig = Math.max(agg.nearFig, S.bc.nearFig); agg.nearW = Math.max(agg.nearW, S.nearW); agg.floor = Math.max(agg.floor, S.bc.floor); agg.reds = Math.max(agg.reds, S.bc.reds); if (S.over) agg.over++;
          if (S.bc.tags && S.bc.tags.vessel) agg.liquid++;
          if (S.step === 'shecht') agg.shechtActs.add(S.acts);
          const key = S.step === 'shecht' ? 'screen' : S.step === 'recv' ? 'vessel' : S.step;
          if (key && !seenShot.has(key) && ['screen', 'vessel', 'zerika', 'horn', 'melak', 'shirayim'].includes(key)) { seenShot.add(key); await pg.waitForTimeout(key === 'screen' ? 700 : key === 'melak' ? 1500 : 900); await shot(`${kind}-${key}`); }
        }
      }
      const secs = (Date.now() - t0 - shotMs) / 1000, done = await G(() => __DAY.tasks.get('yachid').state === 'done');
      check(`${tag} taps alone finish it in ≤ 60 s`, done && secs <= 60, `${n} taps ${secs.toFixed(0)} s`);
      const M = await G(() => { const M = window.__YACHID; return { kinds: M.kinds, marks: M.marks, steps: M.steps.map((s) => s.k), acts: M.acts.length, n: M.n, graveN: M.graveN | 0, miss: M.miss }; });
      const wm = await G(() => (__T.avodah && __T.avodah.marks ? __T.avodah.marks() : []));
      const pts = await G(() => { const e = window.__GAME_LOG.find((x) => x.type === 'taskDone' && x.d && x.d.id === 'yachid'); return e ? e.d.pts : 0; });
      check(`${tag} the kind from the queue plays its own chain`, M.kinds.length === 1 && M.kinds[0] === kind, M.steps.join(','));
      if (kind !== 'ken') {
        check(`${tag} the slaughter: the grave moment, no act while it lasts (0 points), the first "+N" at the receiving`, M.graveN === 1 && agg.shechtActs.size <= 1 && M.acts === M.n - 1, `grave ${M.graveN} · acts during ${[...agg.shechtActs]} · acts ${M.acts}/${M.n}`);
        check(`${tag} the camera never over the screen`, agg.over === 0, `over ${agg.over}`);
        check(`${tag} the vessel held the dark liquid (palette, tagged 'vessel')`, agg.liquid > 0, `frames ${agg.liquid}`);
      }
      if (kind === 'olah') check(`${tag} two corners BELOW the line: NE then SW (the real altar: y < 21)`, M.marks.map((m) => m.c + m.level).join() === 'NElower,SWlower' && wm.length >= 4 && wm.every((m) => m.y < 21), JSON.stringify(wm.slice(0, 4)));
      if (kind === 'chatat') check(`${tag} the four horns ABOVE the line in order SE → NE → NW → SW (the real altar: y > 21)`, M.marks.map((m) => m.c + m.level).join() === 'SEupper,NEupper,NWupper,SWupper' && wm.length >= 8 && wm.every((m) => m.y > 21), JSON.stringify(wm.slice(0, 2)));
      if (kind === 'ken') check(`${tag} the wall mark: חטאת העוף below at SW (+ the yesod), עולת העוף above at SE`, M.marks.map((m) => m.c + m.level).join() === 'SWlower,SWyesod,SEupper' && wm.some((m) => m.y < 21 && m.x < -50) && wm.some((m) => m.y > 21 && m.x > -26), JSON.stringify(wm.map((m) => [m.x, m.y, m.z])));
      check(`${tag} no palette piece near a figure or an animal (kit and the world's marks), none on the floor, no forbidden red`, agg.nearFig === 0 && agg.nearW === 0 && agg.floor === 0 && agg.reds === 0, JSON.stringify({ nearFig: agg.nearFig, nearW: agg.nearW, floor: agg.floor, reds: agg.reds }));
      check(`${tag} the points go in`, pts > 0, `+${pts}`);
      // a look at the stone itself: the marks where they were given (the camera set by hand for a moment)
      const LOOK = { olah: [[-16.5, 22.5, -25], [-23, 19.4, -18.5]], chatat: [[-19.5, 28.5, 15.5], [-24.4, 25.3, 10.4]], ken: [[-60, 23, 18], [-53, 19, 11.5]] }[kind];
      if (LOOK) { const sT = Date.now(); await G((L) => { __T.simulate(false); __T.view.camSet(L[0][0], L[0][1], L[0][2], L[1][0], L[1][1], L[1][2]); __T.camera.lookAt(L[1][0], L[1][1], L[1][2]); __T.render(); __T.render(); window.__HUD_HOLD = true; }, LOOK); await pg.screenshot({ path: path.join(OUT, `${kind}-stone.png`) }); shots.push(`${kind}-stone`); await G(() => { window.__HUD_HOLD = false; __T.simulate(true); }); shotMs += Date.now() - sT; }
      await pg.waitForTimeout(500);
      const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
      check(`${tag} the mentor line after the end, by the kind`, (kind === 'ken' ? /אין סמיכה[^]*ובעוף — הפוך/ : kind === 'chatat' ? /באצבע/ : /למטה מחוט הסיקרא/).test(line), line.slice(0, 120));
      await pg.waitForTimeout(2600);
    }

    if (RUNS.includes('vessels')) {
      const tag = '[vessels]'; const info = await ready('vessels', tag);
      if (info) {
        const bc = await btnC(); let n = 0, t0 = Date.now(); shotMs = 0; let washShot = false;
        while (!(await G(() => __DAY.tasks.get('vessels').state === 'done')) && Date.now() - t0 - shotMs < 75000) {
          await tapBtn(bc); n++; await pg.waitForTimeout(380);
          const w = await G(() => { const W = window.__WB22 && __WB22.vessels; return W ? W.state.washed : -1; });
          if (w === 3 && !washShot) { washShot = true; await pg.waitForTimeout(150); await shot('vessels-washing'); }
        }
        const S = await G(() => { const W = __WB22.vessels; return { cnt: W.state.cnt, washed: W.state.washed, n: W.B && W.B.M ? W.B.M.n : 0 }; });
        check(`${tag} 93 counted, then six vessels washed in clear water (taps alone)`, S.cnt === 93 && S.washed === 6 && S.n === 18, JSON.stringify(S) + ` · ${n} taps`);
        await pg.waitForTimeout(2600);
      }
    }

    if (RUNS.includes('ganan')) {
      const tag = '[ganan]'; const info = await ready('ganan', tag);
      if (info) {
        const bc = await btnC(); let n = 0, t0 = Date.now(); let cam = null, figs = 0;
        await tapBtn(bc); n++;
        for (let q = 0; q < 30; q++) { await pg.waitForTimeout(200); const s = await G(() => { const k = __W22.kit(), c = __T.camera.position; return { cam: [c.x, c.y, c.z], figs: k.figs.filter((f) => f[0] > 270).length, fp: k.figs.filter((f) => f[0] > 270).map((f) => f.slice(0, 3).map((v) => +(+v).toFixed(1))), anchor: k.F.anchor }; }); if (q === 11) console.log('   ganan', JSON.stringify(s)); if (!cam || s.cam[0] > cam[0]) cam = s.cam; figs = Math.max(figs, s.figs); if (q === 11) await shot('ganan-outlet'); if (await G(() => __DAY.tasks.get('ganan').state === 'done')) break; if (q % 8 === 7) { await tapBtn(bc); n++; } }
        const pts = await G(() => { const e = window.__GAME_LOG.find((x) => x.type === 'taskDone' && x.d && x.d.id === 'ganan'); return e ? e.d.pts : 0; });
        check(`${tag} the camera at the outlet in the east (x > 250), the gardener and the treasurer there`, cam && cam[0] > 250 && figs >= 2, JSON.stringify({ cam: cam && cam.map((v) => +v.toFixed(1)), figs }));
        check(`${tag} one tap: the coins recorded, +1 (once a day)`, pts === 1 && (Date.now() - t0) < 60000, `+${pts} · ${n} taps`);
        const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
        check(`${tag} the line of Yoma 5:6 after`, /לגננין/.test(line) && /יומא ה, ו/.test(line), line.slice(0, 100));
      }
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
    console.log('shots: ' + shots.join(', '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
