// (GAMES14, wave 14) The jobs' games played by REAL touch at 390×844 — CDP touch drags (Input.dispatchTouchEvent: the
// browser makes the pointer events), Playwright hasTouch taps — in normal mode, with no autoplay flag (no __MG_AUTO, no demo).
// The bot reads only what a player sees: the hand's cue ({x, y, x2, y2}: a swipe to drag along; `now`: the moment; a button
// to hold) and answers with a finger. Checked per job: the how-to shows with the hand; nothing plays by itself; the first touch
// is a move (the drag that closes the how-to already counts); the job is finished by touch (not skipped) at ≥ ★★; the result
// card has stars (never ☆☆☆) and a sourced fact (טיוטה). The saw for two: alternating pulls by two fingers; both at once sticks.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/jobs-touch.cjs [--shots] [--only=saw,cover]
//   shots (--shots): test/out/jobs/<job>-howto.png · -play.png · -result.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/jobs');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const ONLY = ((args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean));
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));

const js = esbuild.buildSync({
  stdin: { contents: "export * from './src/game/minigames/index.js'; export { createAudio } from './src/game/audio.js';", resolveDir: ROOT },
  bundle: true, format: 'iife', globalName: 'MG', write: false, target: 'es2020', minify: true, charset: 'utf8',
}).outputFiles[0].text;
const PAGE = path.join(OUT, 'jobs-lab.html');
fs.writeFileSync(PAGE, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>jobs lab</title></head><body style="margin:0;height:100vh;background:linear-gradient(#7FA3C8,#E9CF9E 60%,#B89C6C)"><script>${js}</script></body></html>`);

/** a finger's pace along a cue: the saw's pull is quick, the rub sweeps, the rope is hauled steadily (the top gently) */
const MOVES = (kind, k) => (kind === 'cover' ? 8 : kind === 'pull' ? (k.ms ? 12 : 10) : kind === 'rafts' ? 8 : kind === 'waves' ? 10 : 8);   // few events a drag: under a busy machine each one waits a frame
const GAP = (kind, k) => (kind === 'pull' ? (k.ms ? 70 : 40) : 16);                                                                        // the rope is hauled at a calm pace
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
// [kind, ctx, label, the quiet time to check "nothing plays by itself"]
const JOBS = [
  ['saw', {}, 'saw', 4000],
  ['saw', { duel: true }, 'saw2', 0],
  ['cover', { skin: 'gold', level: 1 }, 'gold', 3000],
  ['pull', {}, 'column', 3000],
  ['tread', {}, 'tread', 3000],
  ['rafts', {}, 'rafts', 3000],
  ['waves', {}, 'waves', 0],
  ['cover', { skin: 'plaster' }, 'plaster', 0],
  ['cover', { skin: 'bronze' }, 'bronze', 0],
].filter((j) => !ONLY.length || ONLY.includes(j[2]) || ONLY.includes(j[0]));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const cdp = await ctx.newCDPSession(pg);
    const shot = (n) => (SHOTS ? pg.screenshot({ path: path.join(OUT, n + '.png') }) : null);
    const E = (fn, a) => pg.evaluate(fn, a);
    const st = () => E(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.state() : null; });
    const cue = () => E(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; });
    const isDone = () => E(() => !!document.querySelector('.fx-mg.done'));
    const box = async (sel) => pg.locator(sel).first().boundingBox();
    const tapAt = async (sel, fx = 0.5, fy = 0.5) => { const bb = await box(sel); if (!bb) return false; await pg.touchscreen.tap(bb.x + bb.width * fx, bb.y + bb.height * fy); return true; };
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
    /** a finger's drag along the canvas' 0…1 box: from a to z in n moves (16 ms apart) */
    const drag = async (a, z, n = 8, hold = 0, back = false, gap = 16) => {
      const bb = await box('.fx-mg canvas'); if (!bb) return;
      const P = (u) => [bb.x + bb.width * u[0], bb.y + bb.height * u[1]];
      const A = P(a), Z = P(z);
      await touch('touchStart', [A]);
      for (let k = 1; k <= n; k++) { await touch('touchMove', [[A[0] + ((Z[0] - A[0]) * k) / n, A[1] + ((Z[1] - A[1]) * k) / n]]); await pg.waitForTimeout(gap); }
      if (back) for (let k = n - 1; k >= 0; k--) { await touch('touchMove', [[A[0] + ((Z[0] - A[0]) * k) / n, A[1] + ((Z[1] - A[1]) * k) / n]]); await pg.waitForTimeout(16); }   // a rub: there and back
      if (hold) await pg.waitForTimeout(hold);
      await touch('touchEnd', []);
    };
    /** two fingers at once (the duel's both-at-once) */
    const drag2 = async (a1, z1, a2, z2, n = 6) => {
      const bb = await box('.fx-mg canvas'); if (!bb) return;
      const P = (u) => [bb.x + bb.width * u[0], bb.y + bb.height * u[1]];
      const [A1, Z1, A2, Z2] = [a1, z1, a2, z2].map(P);
      await touch('touchStart', [A1, A2]);
      for (let k = 1; k <= n; k++) { const f = k / n; await touch('touchMove', [[A1[0] + (Z1[0] - A1[0]) * f, A1[1] + (Z1[1] - A1[1]) * f], [A2[0] + (Z2[0] - A2[0]) * f, A2[1] + (Z2[1] - A2[1]) * f]]); await pg.waitForTimeout(16); }
      await touch('touchEnd', []);
    };
    const holdBtn = async (id, ms) => {
      const bb = await box(`.fx-mg [data-b="${id}"]`); if (!bb) return;
      const p = [bb.x + bb.width / 2, bb.y + bb.height / 2];
      await touch('touchStart', [p]); await pg.waitForTimeout(ms); await touch('touchEnd', []);
    };
    const start = (kind, o) => E(([k, o]) => { window.__R = null; window.MG.runMinigame(k, { level: 0, seed: 11, ...o, sfx: window.MG.createAudio({}) }).then((r) => { window.__R = r; }); }, [kind, o]);

    /* a player's hand: follow the cue — a swipe (at its moment, if timed), a held button, or a tap */
    async function play(maxMs = 80000, shotAt = null) {
      const t0 = Date.now();
      let moves = 0, shotDone = !shotAt;
      while (Date.now() - t0 < maxMs) {
        if (await isDone()) return moves;
        const c = await cue(), s0 = (await st()) || {};
        if (!c) { await pg.waitForTimeout(50); continue; }
        if (c.timed && !c.now) {
          const ok = await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); const k = w && w.__mg && w.__mg.cue(); return !!(k && k.now) || !!(w && w.classList.contains('done')); }, null, { polling: 'raf', timeout: 5000 }).then(() => true, () => false);
          if (!ok) continue;
          if (await isDone()) return moves;
        }
        const k = (await cue()) || c;
        if (k.btn && k.hold) await holdBtn(k.btn, k.ms || 350);
        else if (k.btn) await tapAt(`.fx-mg [data-b="${k.btn}"]`);
        else if (k.x2 != null || k.y2 != null) await drag([k.x, k.y], [k.x2 == null ? k.x : k.x2, k.y2 == null ? k.y : k.y2], k.n || MOVES(s0.kind, k), 0, s0.kind === 'cover', GAP(s0.kind, k));
        else { const bb = await box('.fx-mg canvas'); await pg.touchscreen.tap(bb.x + bb.width * k.x, bb.y + bb.height * k.y); }
        moves++;
        if (!shotDone && moves >= shotAt) { shotDone = true; await shot(shotName + '-play'); }
        await pg.waitForTimeout(60);
      }
      return moves;
    }
    let shotName = '';

    await pg.goto('file://' + PAGE);
    for (const [kind, o, name, quiet] of JOBS) {
      shotName = name;
      await E(() => { try { localStorage.clear(); } catch (e) { /* file:// */ } });
      await start(kind, { ...o, howto: true });
      await pg.waitForTimeout(800);
      let s = await st();
      const handOn = await E(() => !!document.querySelector('.fx-mg-hand.on'));
      const c0 = await cue();
      check(`${name}: the first-time how-to shows, the hand on the job (a swipe or a button)`, s && s.how && s.kind === (o.duel ? 'saw2' : kind) && c0 && (c0.x2 != null || c0.btn), JSON.stringify(c0));
      check(`${name}: a 44-px target (the canvas, the buttons)`, await E(() => [...document.querySelectorAll('.fx-mg canvas, .fx-mg-ctl button:not([hidden])')].filter((e) => e.offsetParent).every((e) => { const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; })));
      await shot(name + '-howto');
      if (quiet) {
        await pg.waitForTimeout(quiet);
        s = await st();
        check(`${name}: nothing plays by itself (${(quiet / 1000).toFixed(1)} s untouched)`, s && s.progress === 0 && s.how, `progress ${s && s.progress}`);
      }
      // the first touch is a move: the drag that closes the how-to already works
      const p0 = (await st()).progress;
      const k0 = await cue();
      if (k0 && k0.x2 != null) await drag([k0.x, k0.y], [k0.x2, k0.y2], MOVES(s && s.kind, k0), 0, false, GAP(s && s.kind, k0));
      await pg.waitForTimeout(250);
      s = await st();
      if (k0 && k0.x2 != null) check(`${name}: the first touch is a move (the how-to closes and the drag counts)`, s && !s.how && s.progress > p0, `progress ${p0} → ${s && s.progress}`);
      if (o.duel) {                                     // two fingers at once: it sticks — a laugh, nothing lost
        await pg.waitForTimeout(300);
        await drag2([0.5, 0.6], [0.5, 0.9], [0.5, 0.4], [0.5, 0.1]);
        await pg.waitForTimeout(200);
        const pk = await E(() => document.querySelector('.fx-mg').__mg.peek());
        await shot(name + '-stuck');
        check(`${name}: both players at once — the saw sticks (a laugh, nothing lost)`, pk && pk.sticks >= 1, `sticks ${pk && pk.sticks}`);
      }
      const t0 = Date.now();
      const moves = await play(ONLY.length ? 140000 : 90000, 5);
      await pg.waitForTimeout(500);
      const res = await E(() => ({ stars: (document.querySelector('.fx-mg-stars') || {}).textContent || '', tier: (document.querySelector('.fx-mg-tier') || {}).textContent || '', acc: (document.querySelector('.fx-mg-acc') || {}).textContent || '', fact: (document.querySelector('.fx-mg-fact') || {}).textContent || '' }));
      await shot(name + '-result');
      check(`${name}: stars on the result card, never ☆☆☆`, /★/.test(res.stars) && res.stars.length === 3, res.stars);
      check(`${name}: a sourced fact (טיוטה) or המחשה on the result`, res.fact.length > 20 && /טיוטה|המחשה/.test(res.fact), res.fact.slice(0, 90));
      await tapAt('.fx-mg .fx-go');
      await pg.waitForFunction(() => window.__R, null, { timeout: 5000 }).catch(() => {});
      const r = await E(() => window.__R);
      check(`${name}: finished by real touch at ≥ ★★ (not skipped)`, r && !r.skipped && r.stars >= 2, `${moves} moves, ${((Date.now() - t0) / 1000).toFixed(1)} s, q ${r && r.quality}, ★${r && r.stars} · ${res.tier} · ${res.acc}`);
      await pg.waitForTimeout(400);
      await E(() => document.querySelectorAll('.fx-mg').forEach((e) => e.remove()));   // a job left open never spoils the next
    }
    if (!ONLY.length || ONLY.includes('demo')) {           /* #demo: the autopilot plays a job; her first real touch takes it over */
      shotName = 'demo';
      await start('cover', { skin: 'gold', demo: true, howto: false });
      await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); return !!(w && w.__mg && w.__mg.state().progress > 5); }, null, { timeout: 20000, polling: 100 }).catch(() => {});
      let s = await st();
      check('demo: the autopilot rubs the gold by itself', s && s.auto && s.progress > 0, `progress ${s && s.progress}`);
      const c = await cue(); if (c) await drag([c.x, c.y], [c.x2, c.y2], 14, 0, true);
      await pg.waitForTimeout(300); const p0 = (await st()).progress;
      await pg.waitForTimeout(3000); s = await st();
      check('demo: a real rub takes the job over (the autopilot stops)', s && !s.auto && s.progress <= p0 + 1, `progress ${p0} → ${s && s.progress}`);
      await play(60000);
      await tapAt('.fx-mg .fx-go');
      await pg.waitForFunction(() => window.__R, null, { timeout: 5000 }).catch(() => {});
      const r = await E(() => window.__R);
      check('demo: she finishes the job the autopilot started', r && !r.skipped, `q ${r && r.quality}`);
    }
    check('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(`\n${results.length - bad}/${results.length} PASS`);
  process.exit(bad ? 1 : 0);
})();
