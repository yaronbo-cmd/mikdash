// SLICE27 (WAVE27): six works to "done", by real touch on dist/test.html#avodah at 844×390 (CDP touch: the button, the hold, the drag,
// a tap on a figure in the world). For each of the six — fire (beat) · deshen (carry + hold + the coal event) · maaracha (aim) · kiddush
// (hold-release + the kiddush tap) · evarim (target) · payis (stop + the raised finger):
//   the first frame: a gold cue ring on the screen and the acting figure (hero26's actor) in the frame;
//   each of the first touches changes the act's box (pixel diff of the middle 70 % of the frame, ≥ 10 % of its height in changed rows);
//   the end (epilogue) is shot BEFORE the source line appears; then the stamp with its name; nothing red.
// level: three gold runs open level 2 ("רמה 2 נפתחה"), the next run's model is L2. event: the coal fires and one tap on it resolves it.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/slice27-touch.cjs --no-build [--noshots] [--only=fire,deshen,maaracha,kiddush,evarim,payis,level]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/slice27');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (s) => !ONLY.length || ONLY.includes(s);
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const STAMP = { fire: 'האש נשמרה', deshen: 'מחצי הכבש ולמטה', maaracha: 'שלוש מערכות', kiddush: 'הכיור מלא', evarim: 'כולם בשורה', payis: 'ניחשתם!' };
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
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const tap = async (p) => { await down(2, p.x, p.y); await pg.waitForTimeout(70); await up(2); };
    const hold = async (p, ms) => { await down(2, p.x, p.y); await pg.waitForTimeout(ms); await up(2); };
    const drag = async (p, dx, dy) => { await down(3, p.x, p.y); for (let i = 1; i <= 6; i++) { await move(3, p.x + dx * i / 6, p.y + dy * i / 6); await pg.waitForTimeout(25); } await up(3); };
    const shots = [];
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); shots.push(name); console.log('   shot test/out/slice27/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    // the act's box: the middle of the frame (the work camera frames the act there); the share of its rows that changed
    const BOX = { x: 127, y: 47, width: 590, height: 296 };
    const grab = () => pg.screenshot({ clip: BOX, timeout: 60000 });
    const rowsChanged = (a, c) => G(async ([A, C]) => {
      const load = async (b64) => { const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const cv = document.createElement('canvas'); cv.width = bm.width; cv.height = bm.height; const x = cv.getContext('2d'); x.drawImage(bm, 0, 0); return x.getImageData(0, 0, cv.width, cv.height); };
      const p = await load(A), q = await load(C); let rows = 0, px = 0;
      for (let y = 0; y < p.height; y++) { let n = 0; for (let x = 0; x < p.width; x++) { const i = (y * p.width + x) * 4; if (Math.abs(p.data[i] - q.data[i]) + Math.abs(p.data[i + 1] - q.data[i + 1]) + Math.abs(p.data[i + 2] - q.data[i + 2]) > 40) n++; } px += n; if (n / p.width >= 0.02) rows++; }
      return { rows: +(rows / p.height).toFixed(3), area: +(px / (p.width * p.height)).toFixed(3) };
    }, [a.toString('base64'), c.toString('base64')]);
    /** the pixel change one touch makes (vs. the scene's own motion over the same time without a touch) */
    const touchDiff = async (label, act, wait = 900) => {
      const a0 = await grab(); await pg.waitForTimeout(wait); const a1 = await grab(); const base = await rowsChanged(a0, a1);
      const b0 = await grab(); await act(); await pg.waitForTimeout(wait); const b1 = await grab(); const d = await rowsChanged(b0, b1);
      check(`${label} the touch changes ≥ 10 % of the act's box height`, d.rows >= 0.1, `touch rows ${d.rows} area ${d.area} · no-touch rows ${base.rows} area ${base.area}`);
      return d;
    };
    const M = () => G(() => { const R = window.__S27RUN; return R && R.M ? R.M : null; }).then(() => true);
    const st = (fn) => G(fn);
    const kitRings = () => G(() => { const k = __W22 && __W22.kit(); if (!k) return []; return k.rings().filter((r) => /FFD24A|FFE9A6/.test(r.hex) && r.x > 0 && r.x < 844 && r.y > 20 && r.y < 390); });
    const first = async (w, opt = {}) => {
      await waitFor(() => { const s = window.__HERO26 && __HERO26.state(); return !!(window.__S27RUN && s && s.on && s.actorFrames > 3); }, null, 12000);
      await pg.waitForTimeout(opt.wait || 1200);
      const r = await kitRings(), dbg = await G(() => ({ run: window.__S27RUN && __S27RUN.id, kit: !!(window.__W22 && __W22.kit()) })), act = await G(() => { const s = window.__HERO26 && __HERO26.state(); return s ? { on: s.on, frames: s.actorFrames, at: s.at } : null; });
      check(`[${w}] the first frame: a gold cue ring on the screen`, r.length > 0, `${r.length} rings ${JSON.stringify(r.slice(0, 2))} ${JSON.stringify(dbg)}`);
      check(`[${w}] the first frame: the acting kohen (he) is in the frame`, act && act.on && act.frames > 0, JSON.stringify(act));
      await shot(`${w}-1first`);
    };
    const toWork = async (id) => {
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, place: k.place } : null; }, id);
      if (!info) return false;
      await G(() => { window.__H26T = null; window.__S27LAST = null; document.querySelectorAll('.s27-stamp').forEach((e) => e.classList.remove('on', 'hold')); document.querySelectorAll('.dy-line').forEach((e) => e.classList.remove('on')); });
      await G((h) => { __DAY.clock.skipTo(h + 0.05); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; const k = __DAY.tasks.get(id); if (k.state === 'done') k.state = 'passed'; k.practice = false; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      return waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
    };
    /** the end: the epilogue is shot before the source line, then the stamp */
    const ending = async (w, id) => {
      const t0 = Date.now();
      await waitFor((id) => window.__H26T && __H26T.id === id && __H26T.ok, id, 30000);
      const pre = await G(() => { const l = document.querySelector('.dy-line'); return { on: !!(l && l.classList.contains('on') && l.querySelector('small')), text: l ? l.textContent.slice(0, 40) : '', stamp: !!document.querySelector('.s27-stamp.on') }; });   // (the source line has its reference in <small>; the coach line has none)
      await pg.waitForTimeout(500); await shot(`${w}-2end`);
      check(`[${w}] the end is seen before the source line (the epilogue: no line, no stamp yet)`, !pre.on && !pre.stamp, JSON.stringify(pre));
      const got = await waitFor((id) => window.__S27LAST && __S27LAST.id === id, id, 20000);
      const L = await G(() => ({ last: window.__S27LAST, stamp: (document.querySelector('.s27-stamp') || {}).textContent || '', line: (document.querySelector('.dy-line') || {}).textContent || '' }));
      check(`[${w}] the source line, then the stamp "${STAMP[w]}"`, got && L.last.lineOn && L.stamp.includes(w === 'payis' && !/ניחשתם/.test(L.stamp) ? 'הפיס נספר' : STAMP[w]), `stamp "${L.stamp}" · line "${L.line.slice(0, 70)}" · ${Math.round((Date.now() - t0) / 1000)} s`);
      await pg.waitForTimeout(350); console.log('   stamp dbg', JSON.stringify(await G(() => { const e = document.querySelector('.s27-stamp'), l = document.querySelector('.dy-line'); const cs = e && getComputedStyle(e); return { cls: e && e.className, op: cs && cs.opacity, disp: cs && cs.display, an: cs && cs.animationName, hold: !!window.__S27_STAMP_HOLD, par: e && e.parentNode && e.parentNode.className, line: l && l.className, lop: l && getComputedStyle(l).opacity, t: Math.round(performance.now()), at: window.__S27LAST && __S27LAST.t }; }))); await shot(`${w}-3stamp`);
      await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; });
      await pg.waitForTimeout(2500);
      return L;
    };
    const reds = () => G(() => { const k = __W22 && __W22.kit(); return k ? k.reds() : -1; });
    const Ms = (f) => G(f);

    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);

    // ───────── fire: the log on the beat ─────────
    const playFire = async (tag, shotsOn) => {
      const ok = await toWork('fire'); check(`[fire${tag}] the button wakes at בית המוקד`, ok); if (!ok) return null;
      const bc = await btnC(); await tap(bc);
      if (shotsOn) await first('fire'); else { await waitFor(() => { const s = window.__HERO26 && __HERO26.state(); return !!(window.__S27RUN && s && s.on && s.actorFrames > 3); }, null, 12000); await pg.waitForTimeout(1200); }
      const m0 = await Ms(() => { const m = __S27RUN.M; return { n: m.n, l2: m.l2, period: m.period }; });
      const onBeat = async () => { await waitFor(() => { const m = __S27RUN.M; return m && !m.fly && m.beatU > 0.86 && m.beatU < 0.93; }, null, 3000); await tap(bc); };
      if (shotsOn) { await touchDiff('[fire]', onBeat); }
      for (let i = 0; i < 12 && !(await Ms(() => __S27RUN.M.phase !== 'work')); i++) { await onBeat(); await pg.waitForTimeout(650); }
      const m1 = await Ms(() => { const m = __S27RUN.M; return { laid: m.laid, gold: m.acts.filter((a) => a.q >= 2).length, acts: m.acts.length, heat: +m.target.toFixed(2), q: m.result().quality }; });
      check(`[fire${tag}] taps on the beat lay the logs; most are gold (the flame grows with the precision)`, m1.laid === m0.n && m1.gold >= m0.n - 1, JSON.stringify({ ...m0, ...m1 }));
      check(`[fire${tag}] nothing red`, (await reds()) === 0);
      return { m0, m1 };
    };
    // ───────── level 2: three gold runs open it ─────────
    if (want('level')) {
      await G(() => { const b = __S27.box(); b.fire = { gold: 2, lv: 1 }; });
      let r = null, L = null;
      for (let k = 0; k < 3; k++) { r = await playFire(' L1→L2', false); L = await ending('fire', 'fire'); if ((await G(() => __S27.box().fire.lv)) === 2) break; }   // (a run that is not gold does not count: play again)
      const box = await G(() => __S27.box().fire);
      check('[level] the third gold run opens level 2 ("רמה 2 נפתחה"), kept in the save (A.day.lv27)', box.lv === 2 && /רמה 2 נפתחה/.test(L.stamp), JSON.stringify({ box, stamp: L.stamp, q: r && r.m1.q }));
      const ok = await toWork('fire');
      if (ok) { const bc = await btnC(); await tap(bc); await pg.waitForTimeout(1700); const m = await Ms(() => { const m = __S27RUN.M; return { l2: m.l2, n: m.n, period: m.period, level: m.level }; }); check('[level] the next run is level 2: the beat quickens, six logs, two piles', m.l2 && m.n === 6 && m.period < 0.7, JSON.stringify(m)); await shot('fire-5level2'); for (let i = 0; i < 14 && !(await Ms(() => __S27RUN.M.phase !== 'work')); i++) { await tap(bc); await pg.waitForTimeout(700); } await waitFor(() => window.__S27LAST && __S27LAST.id === 'fire', null, 25000); await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; }); await pg.waitForTimeout(2000); }   // (taps alone finish the L2 run too)
    }

    if (want('fire')) { await playFire('', true); await ending('fire', 'fire'); }

    // ───────── deshen: carry, hold, the coal ─────────
    if (want('deshen')) {
      await G(() => { window.__S27_EV = 1; });
      const ok = await toWork('g-deshen'); check('[deshen] the button wakes at the ramp', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await first('deshen');
        await touchDiff('[deshen]', () => tap(bc), 1500);   // (up the ramp)
        await waitFor(() => { const m = __S27RUN.M; return m && m.i === 1 && !m.mv; }, null, 12000);
        const meter = await Ms(() => { const m = __S27RUN.M; return { steady: m.steady, i: m.i }; });
        check('[deshen] up the ramp with still hands: the carry is gold ("ידיים יציבות")', await Ms(() => __S27RUN.M.acts[0] && __S27RUN.M.acts[0].q === 2), JSON.stringify(meter));
        await down(2, bc.x, bc.y); await waitFor(() => { const m = __S27RUN.M; return m.fill >= 0.5; }, null, 3000); await shot('deshen-4hold'); await waitFor(() => { const m = __S27RUN.M; return m.fill >= 0.93 || !m.hold27; }, null, 3000); await up(2);
        await waitFor(() => { const m = __S27RUN.M; return m.i === 2 && !m.mv; }, null, 6000);
        const sc = await Ms(() => { const m = __S27RUN.M; return { q: m.acts[1] && m.acts[1].q, fill: +m.fill.toFixed(2), full: m.full, pl: m.pl27 }; });
        check('[deshen] the hold at the top scoops; let go at the mark = gold', sc.q === 2 && sc.full, JSON.stringify(sc));
        await tap(bc);   // down — the coal falls on the way
        const fired = await waitFor(() => !!(__S27RUN.M.ev27 && window.__S27COAL), null, 12000);
        check('[deshen] the event: a coal drops on the ramp (cue ring, the walk waits)', fired, JSON.stringify(await G(() => [window.__S27COAL, (window.__S27E || []).slice(-1)])));
        if (fired) {
          await pg.waitForTimeout(900); await shot('deshen-5coal');
          const c = await G(() => window.__S27COAL); await tap(c); await pg.waitForTimeout(500); console.log('   coal tap', JSON.stringify(c), JSON.stringify(await G(() => window.__S27PK || null)));
          const res = await G(() => ({ ev: !!__S27RUN.M.ev27, log: (window.__S27E || []).slice(-1)[0], bon: (__S27RUN.M.bonuses || []).map((b) => b.say) }));
          check('[deshen] one tap on the coal puts it out (gold, "המחשה"), never a penalty', !res.ev && res.log && res.log.res && res.bon.some((s) => /כיביתם/.test(s)), JSON.stringify(res));
        }
        for (let i = 0; i < 20 && !(await Ms(() => __S27RUN.M.phase !== 'work')); i++) { await tap(bc); await pg.waitForTimeout(900); }
        check('[deshen] taps finish it; nothing red', (await Ms(() => __S27RUN.M.phase !== 'work')) && (await reds()) === 0);
        await ending('deshen', 'g-deshen');
      }
      await G(() => { window.__S27_EV = undefined; });
    }

    // ───────── maaracha: the aimed drag ─────────
    if (want('maaracha')) {
      const ok = await toWork('g-maaracha'); check('[maaracha] the button wakes at the altar', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await first('maaracha', { wait: 2400 });
        // (the drag toward the spot as the player sees it: the spot's direction from him on the ground, turned into the screen by the camera's bearing)
        const aimTo = async (r) => { const d = await G((r) => { const M = __S27RUN.M, W = M.w27, az = __TWIN.az(); if (!W) return null; const vx = W.spots[r][0] - W.o[0], vz = W.spots[r][1] - W.o[1], fx = -Math.cos(az), fz = -Math.sin(az), rx = -fz, rz = fx, uy = vx * fx + vz * fz, ux = vx * rx + vz * rz, L = Math.hypot(ux, uy) || 1; return { dx: ux / L, dy: -uy / L }; }, r); if (!d) return false; await drag(bc, d.dx * 130, d.dy * 130); return true; };
        await aimTo(1); await pg.waitForTimeout(600);
        const w = await Ms(() => ({ warn: __S27RUN.M.warn, laid: __S27RUN.M.laid }));
        check('[maaracha] a wrong spot: "זו של הקטורת" — no penalty, the log stays', /הקטורת/.test(w.warn || '') && w.laid === 0, JSON.stringify(w));
        await shot('maaracha-4wrong');
        await pg.waitForTimeout(1200);
        const r0next = () => 0;
        await touchDiff('[maaracha]', () => aimTo(0), 1100);
        await waitFor(() => !__S27RUN.M.fly, null, 6000);
        await aimTo(r0next()); await pg.waitForTimeout(500);
        console.log('   aim dbg', JSON.stringify(await Ms(() => ({ warn: __S27RUN.M.warn, laid: __S27RUN.M.laid, fly: __S27RUN.M.fly && +__S27RUN.M.fly.t.toFixed(2), cu: window.__F24 && __F24.closeState(), view: __W22.kit().F.view }))));
        for (let i = 0; i < 16 && !(await Ms(() => __S27RUN.M.phase !== 'work')); i++) {
          await waitFor(() => !__S27RUN.M.fly, null, 5000);
          const r = await Ms(() => { const m = __S27RUN.M; let x = m.laid; const N = [6, 2, 1]; for (let r = 0; r < 3; r++) { if (x < N[r]) return m.laid >= 9 ? -1 : r; x -= N[r]; } return -1; });
          if (r >= 0) await aimTo(r); else await tap(bc);
          await pg.waitForTimeout(400);
        }
        const m1 = await Ms(() => { const m = __S27RUN.M; return { laid: m.laid, gold: m.acts.filter((a) => a.q >= 2).length, acts: m.acts.length, q: +m.result().quality.toFixed(2) }; });
        check('[maaracha] drags to the right spots: 9 logs gold, then the fire', m1.laid === 9 && m1.gold >= 9, JSON.stringify(m1));
        check('[maaracha] nothing red', (await reds()) === 0);
        await ending('maaracha', 'g-maaracha');
      }
    }

    // ───────── kiddush: the mukhni's hold, the twelve heaves, the kiddush tap ─────────
    if (want('kiddush')) {
      const ok = await toWork('g-kiddush'); check('[kiddush] the button wakes at the kiyor', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await first('kiddush', { wait: 2200 });
        const K = () => G(() => { const w = window.__WB22 && __WB22.kiyor; const S = w && w.state; return S ? { mode: S.mode, rise: +S.rise.toFixed(2), spouts: S.spouts, lvl: +S.lvl.toFixed(2), kidd: S.kidd, done: !!(w.B.M && w.B.M.done), i: w.B.M ? w.B.M.i : -1, n: w.B.M ? w.B.M.n : -1, say: (w.B.M && w.B.M.acts.slice(-1)[0] || {}).say || '' } : null; });
        await down(2, bc.x, bc.y); await waitFor(() => { const S = __WB22.kiyor.state; return S.rise >= 0.96; }, null, 5000); await up(2); await pg.waitForTimeout(900);
        const k1 = await K(); check('[kiddush] the hold raises the kiyor (the mukhni) — then the heaves', k1 && k1.mode === 'heave', JSON.stringify(k1));
        await touchDiff('[kiddush]', () => tap(bc), 900);
        for (let i = 0; i < 16 && (await K()).spouts < 12; i++) { await tap(bc); await pg.waitForTimeout(800); }
        const k2 = await K(); await shot('kiddush-4full');
        check('[kiddush] the basin fills visibly with the twelve; the work waits for the kiddush', k2.spouts === 12 && k2.lvl > 0.8 && !k2.done && k2.kidd, JSON.stringify(k2));
        await tap(bc); await pg.waitForTimeout(400);
        const k3 = await K(); check('[kiddush] the last act: "יד ימין על רגל ימין" — one tap', k3.mode === 'kiddush-done' && /יד ימין/.test(k3.say), JSON.stringify(k3));
        await ending('kiddush', 'g-kiddush');
      }
    }

    // ───────── evarim: the right kohen ─────────
    if (want('evarim')) {
      const ok = await toWork('g-evarim'); check('[evarim] the button wakes at the tables', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await first('evarim', { wait: 2200 });
        const P = () => G(() => window.__S27EV || []);
        let p = await P(); const wrong = p.find((x) => x.id === 2);
        if (wrong) { await tap(wrong); await pg.waitForTimeout(500); }
        const w = await Ms(() => ({ warn: __S27RUN.M.warn, i: __S27RUN.M.i }));
        check('[evarim] a tap on the wrong kohen: "לא — הראש קודם", no penalty', /לא — הראש קודם/.test(w.warn || '') && w.i === 0, JSON.stringify({ w, n: p.length }));
        await shot('evarim-4wrong');
        const pickRight = async () => { await waitFor(() => { const m = __S27RUN.M; return m.anim <= 0 && (window.__S27EV || []).some((x) => x.id === m.i); }, null, 6000); const i = await Ms(() => __S27RUN.M.i); const q = (await P()).find((x) => x.id === i); if (q) await tap(q); else await tap(bc); };
        await touchDiff('[evarim]', pickRight, 2600);
        for (let k = 0; k < 24 && (await Ms(() => __S27RUN.M.i < 9)); k++) { await pickRight(); await pg.waitForTimeout(700); }
        for (let k = 0; k < 6 && !(await Ms(() => __S27RUN.M.phase !== 'work')); k++) { await tap(bc); await pg.waitForTimeout(900); }
        const m1 = await Ms(() => { const m = __S27RUN.M; return { i: m.i, gold: m.acts.filter((a) => a.q >= 2).length, acts: m.acts.length }; });
        check('[evarim] the nine by taps on the right kohen in order (gold), then the salt', m1.i >= 9 && m1.gold >= 7, JSON.stringify(m1));   // (the pick right after the wrong one is good, not gold: acts.js's "a try after a miss")
        check('[evarim] nothing red', (await reds()) === 0);
        await ending('evarim', 'g-evarim');
      }
    }

    // ───────── payis: his finger, the stop, the guess ─────────
    if (want('payis')) {
      const ok = await toWork('g-payis1'); check('[payis] the button wakes in the לשכת הגזית', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await first('payis', { wait: 2200 });
        const P = () => G(() => { const m = __S27RUN.M; return { sub: m.sub, f: m.fingers[0], now: m.fingersNow, guess: m.guess, win: m.win, plan: m.plan.win, done: !!m.done, stamp: !!m.stamp, phase: m.phase }; });
        await down(2, bc.x, bc.y); await pg.waitForTimeout(800); await shot('payis-4twofingers'); await up(2); await pg.waitForTimeout(600);
        const p1 = await P(); check('[payis] a long hold raises two fingers on his hand; the ring runs', p1.f === 2 && p1.sub === 'run', JSON.stringify(p1));
        await touchDiff('[payis]', () => tap(bc), 1500);
        await waitFor(() => __S27RUN.M.sub === 'predict', null, 6000);
        const seats = await G(() => (window.__F26P ? __F26P.seats() : [])), p2 = await P();
        const sp = seats[p2.plan];
        const free = sp && sp.y > 100 && sp.y < 380 && sp.x > 10 && sp.x < 834;
        if (free) await tap(sp);
        else { const t = Math.PI + (p2.plan + 0.5) / 8 * Math.PI * 2, a = 3.4 + Math.cos(t) * 1.05, s2 = Math.sin(t) * 3.0, u = Math.atan2(s2, a - (3.4 - 1.05)); await drag(bc, Math.sin(u) * 120, -Math.cos(u) * 120); }   // (his seat under the HUD: the guess by a drag from the button toward him — FIX26's other way)
        await pg.waitForTimeout(500); console.log('   guess dbg', JSON.stringify({ sp, free, g: await Ms(() => [__S27RUN.M.guess, __S27RUN.M.sub, +__S27RUN.M.pt6.toFixed(1)]) }));
        for (let i = 0; i < 12 && !(await Ms(() => __S27RUN.M.phase !== 'work')); i++) { await tap(bc); await pg.waitForTimeout(450); }
        const p3 = await P(); check('[payis] counted with his own fingers; the right guess → "ניחשתם!"', p3.stamp && p3.win === p2.plan, JSON.stringify({ p2, p3 }));
        check('[payis] nothing red', (await reds()) === 0);
        await ending('payis', 'g-payis1');
      }
    }

    check('no page errors', errs.length === 0, errs.slice(0, 4).join(' | '));
  } catch (e) { console.log('FAIL  (threw) ' + (e && e.stack || e)); results.push(false); }
  finally { await b.close(); }
  const pass = results.filter(Boolean).length;
  console.log(`\n${pass}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(pass === results.length ? 0 : 1);
})();
