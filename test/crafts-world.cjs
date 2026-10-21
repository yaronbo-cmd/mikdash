// ── craftb19 ── (wave 19, FUN19 §2 — binding) the later crafts IN THE WORLD under two thumbs, by real touch (CDP) at 844×390 on dist/test.html.
// For each craft built (the rub: gold / plaster / bronze · the plumb · the saw): at its stage (a fixture: the stages before it done, this one in its
// courses, the deal holding the job), the marker's job starts by the work button, then —
//   · no act before a touch (1.5 s with no finger: no act, no "+N", the world unchanged)
//   · the kohen's animation starts ≤ 100 ms after the touch-down (his right hand / the line moves; measured in the page by rAF)
//   · the score lands at the impact: every act's "+N" float on the act's own frame (≤ 50 ms apart)
//   · the world object changed (the panel's mask lit · the plumb's bob on its mark · the saw's kerf and the board)
//   · its gesture finishes the job, and taps alone finish it again (a second job)
//   · no .fx-mg sheet frame; no console errors
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/crafts-world.cjs [--part=cover,plumb,saw] [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/crafts-world');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = 844, H = 390;
const PART = (args.find((a) => a.startsWith('--part=')) || '--part=cover,plumb,saw').slice(7).split(',').filter(Boolean);
// craft → [stage, job, the other card]
const CASES = { cover: [process.env.CW_SITE || "gates", "gold", "strike"], plaster: ['karnot', 'plaster', 'strike'], bronze: ['nikanor', 'bronze', 'strike'], plumb: ['guf', 'plumb', 'strike'], saw: ['nashim', 'saw', 'strike'] };
const KIND = { cover: 'cover', plaster: 'cover', bronze: 'cover', plumb: 'plumb', saw: 'saw' };
const results = [], nums = {};
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__MG_VIS = 0; setInterval(() => { const m = document.querySelector('.fx-mg'); if (m && m.classList.contains('on')) window.__MG_VIS++; }, 100);
      // the touch-downs on the work button, the "+N" floats as they appear, and a per-frame sampler of his hand and the craft
      window.__TD = []; window.__FL = []; window.__SMP = null;
      window.addEventListener('pointerdown', (e) => { const t = e.target; if (t && t.closest && t.closest('.tw-btn')) window.__TD.push(performance.now()); }, true);
      const obs = () => new MutationObserver((ms) => { const t = performance.now(); for (const m of ms) for (const n of m.addedNodes) { const tx = n && n.textContent; if (tx && /^\s*\+\d/.test(tx)) window.__FL.push({ t, tx: tx.trim().slice(0, 16) }); } }).observe(document.documentElement, { childList: true, subtree: true });
      if (document.documentElement) obs(); else document.addEventListener('DOMContentLoaded', obs);
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(60); await up(9); };
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/crafts-world/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };
    const cb = () => G(() => __T.stages.craftB());
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cbx = cine && await cine.boundingBox();
    if (cbx) await tap(cbx.x + cbx.width / 2, cbx.y + cbx.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);

    /** the fixture and the marker → the job begun by the button; → { L1, bc } | null */
    async function start(part, n) {
      const [site, job, other] = CASES[part];
      const L0 = await G(([site, job, other, n]) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4 + n, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { [site]: { c: 0, n: 0, key: 1, re: 0, line: 1, deal: { cards: [job], key: null, keyPass: false, quarry: false, sig: null, set: 4 + n, t: 3 } } }, deals: { [site]: 3 }, sig: { [site]: 1 }, best: {} };
        window.__MG_VIS = 0; __T.game._.resync();
        return window.__GAME_LOG.length;
      }, [site, job, other, n]);
      const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
      await pg.waitForTimeout(1500); await closeCards();
      const dealt = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal' && e.d.marks.some((m) => m.job === j)), [L0, job], 12000);
      if (!on || !dealt) { check(`[${part}] twin on and the deal's marker out`, false, `on ${on} dealt ${dealt}`); return null; }
      const mk = await G(([n, j]) => { const e = [...window.__GAME_LOG.slice(n)].reverse().find((x) => x.type === 'twinDeal'); return e.d.marks.find((m) => m.job === j); }, [L0, job]);
      await G((m) => __T.stages.hero.place({ x: m.x, z: m.z }), mk);
      const woke = await waitFor((j) => { const s = __TWIN.spec(); return s && s.job === j; }, job, 8000);
      if (!woke) { check(`[${part}] the button takes the marker's job`, false, JSON.stringify(await G(() => __TWIN.spec()))); return null; }
      const L1 = await G(() => window.__GAME_LOG.length), bc = await btnC();
      await tap(bc.x, bc.y);
      const begun = await waitFor((k) => { const c = __T.stages.craftB(); return c.kind === k && (window.__HANDS && window.__HANDS.twin); }, KIND[part], 8000);
      if (!begun) { check(`[${part}] its craft begins in the world`, false, JSON.stringify(await cb())); return null; }
      await G(() => { window.__CRAFT_ACTS = []; window.__FL = []; window.__TD = []; });
      return { L1, bc, job, site };
    }
    const jobDone = (L1, job) => G(([n, j]) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone' && x.d.job === j); return e ? e.d : null; }, [L1, job]);
    /** the sampler: from now, every frame, the first frame his hand (or the line) moved by > eps after the last touch-down */
    const sampler = () => G(() => {
      const S = window.__SMP = { first: null, h0: null, pay0: null, run: true, fr: 0, frames: null, dts: [], n0: window.__TD.length };
      let last = performance.now();
      const f = () => { if (!S.run) return; const c = __T.stages.craftB(), now = performance.now(); if (S.dts.length < 120) S.dts.push(now - last); last = now;
        if (window.__TD.length <= S.n0) { S.h0 = c.hand; S.pay0 = c.pay; S.np0 = c.nP; }   // (the baseline: the last frame before the touch; nP: the world's own frames — his pose)
        else if (S.first == null && S.h0) { S.fr++; if (!S.log) S.log = []; if (S.log.length < 8) S.log.push([Math.round(now - window.__TD[S.n0]), 'nT' + c.nT, 'nP' + c.nP, 'nF' + c.nF, c.on, c.touching, c.posing, c.gest ? 'G' : '', c.stroke ? 'S' : '', c.step ? 'st' : '', c.walking ? 'W' : '', c.hand.map((v) => Math.round(v * 100) / 100).join(',')]); const td = window.__TD[S.n0], dh = Math.hypot(c.hand[0] - S.h0[0], c.hand[1] - S.h0[1], c.hand[2] - S.h0[2]); if (dh > 0.04 || (c.pay != null && c.pay > (S.pay0 || 0) + 0.01)) { S.first = now - td; S.frames = S.fr; S.gf = c.nP - S.np0; } }
        requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    let smpInfo = '', lastGf = null;
    let wLat = null;
    const sampled = async () => { wLat = (await cb()).lat; const r = await G(() => { const S = window.__SMP; if (S) S.run = false; if (!S) return null; const d = S.dts.slice().sort((a, b) => a - b); return { first: S.first, frames: S.frames, gf: S.gf, frameMs: d.length ? Math.round(d[d.length >> 1]) : null, log: S.log, h0: S.h0 && S.h0.map((v) => Math.round(v * 100) / 100).join(',') }; });
      if (args.includes('--diag') && r) console.log('   smp ' + JSON.stringify({ h0: r.h0, log: r.log })); if (!r) return null; smpInfo = ` · the world's frame #${r.gf} after the touch (≤ 1 = the very next frame drawn) · ${r.frames} rAF ticks of ≈ ${r.frameMs} ms; the world's frames are slower under SwiftShader`; lastGf = r.gf; return r.first; };
    /** every act's "+N" float on its own frame: → the worst gap (ms) */
    const floatGap = () => G(() => { const A = window.__CRAFT_ACTS || [], F = window.__FL || []; let worst = 0, miss = 0; for (const a of A) { let best = 1e9; for (const f of F) best = Math.min(best, Math.abs(f.t - a.t)); if (best > 1e8) miss++; else worst = Math.max(worst, best); } return { worst: Math.round(worst), miss, acts: A.length, floats: F.length }; });

    for (const part of PART) {
      const tag = `[${part}]`, t1 = Date.now();
      const S = await start(part, 0); if (!S) continue;
      const kind = KIND[part];
      // 1. no act before a touch
      const c0 = await cb(); await pg.waitForTimeout(1500); const c1 = await cb();
      check(`${tag} no act before a touch (1.5 s, no finger)`, c1.acts === 0 && (await G(() => (window.__FL || []).length)) === 0 && (kind !== 'cover' || c1.lit === c0.lit) && (kind !== 'plumb' || !c1.pay), `acts ${c1.acts} · lit ${c0.lit}→${c1.lit} · pay ${c1.pay}`);
      if (args.includes('--diag')) console.log('   diag ' + JSON.stringify(await G(() => { const c = __T.stages.craftB(), p = __T.stages.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1.6, p.z); return { placed: c.placed, walking: c.walking, door: c.door, t: c.t, held: c.held, side: c.side, P: c.P, box: c.box, hero: [Math.round(p.x), Math.round(p.y), Math.round(p.z), Math.round(q.x), Math.round(q.y)], hbox: window.__HANDS && window.__HANDS.box(), cam: window.__TWIN && __TWIN.cam(), placed: (window.__GAME_LOG || []).filter((e) => e.d && e.d.at === 'placed').slice(-1) }; })));
      await shot(`${part}-0-begun`);
      // 2–4. the gesture, as a player does it — once he stands at his work (the job's step to it done; a player waits for him too)
      await waitFor(() => { const c = __T.stages.craftB(); return c.placed && !c.walking && c.posing; }, null, 8000); await pg.waitForTimeout(400);
      await sampler();
      const bc = S.bc; let tGest = Date.now(), firstMs = null;
      if (kind === 'cover') {
        // circles on the pad: 40 px round, ~3 a second
        await down(2, bc.x, bc.y); await move(2, bc.x + 22, bc.y);
        let a = 0, k = 0;
        // (a thumb at ≈ 3 circles a second: the page under SwiftShader answers a move in ≈ 50–100 ms, so each move turns 1.4 rad)
        const tR = Date.now(); let path = 0, px = bc.x + 22, py = bc.y;
        while (Date.now() - tGest < 75000 && (k % 6 || !(await jobDone(S.L1, S.job)))) {
          a += 1.4; k++;
          const nx = bc.x - 30 + 36 * Math.cos(a), ny = bc.y - 34 + 30 * Math.sin(a); path += Math.hypot(nx - px, ny - py); px = nx; py = ny;
          await move(2, nx, ny);
          if (k === 24) { firstMs = await sampled(); if (args.includes('--diag')) console.log('   diag2 ' + JSON.stringify(await cb()).slice(0, 400)); await shot(`${part}-1-rubbing`); }
        }
        nums.rubRate = nums.rubRate || {}; nums.rubRate[part] = Math.round(path / ((Date.now() - tR) / 1000));   // (px a second: the thumb's speed)
        await up(2);
      } else if (kind === 'plumb') {
        // a touch lets the line down; then small swipes toward the mark, watching the bob, until it rests on the mark
        await down(2, bc.x, bc.y); await pg.waitForTimeout(500); await up(2);
        await pg.waitForTimeout(700); firstMs = await sampled(); await shot(`${part}-1-swing`); let shotB = false;
        while (Date.now() - tGest < 40000 && !(await jobDone(S.L1, S.job))) {
          const c = await cb(); if (c.kind !== 'plumb' || c.d == null) { await pg.waitForTimeout(300); continue; }
          if (c.phase === 'ready') { await down(2, bc.x, bc.y); await pg.waitForTimeout(400); await up(2); await pg.waitForTimeout(800); continue; }
          if (Math.abs(c.d) > 0.02 && c.phase === 'swing') {
            const px = Math.max(-60, Math.min(60, -c.d * 160 / 1.1)), dir = Math.sign(px) || 1;
            await down(2, bc.x, bc.y); await move(2, bc.x + dir * 20, bc.y); await move(2, bc.x + dir * 20 + px, bc.y); await pg.waitForTimeout(60); await up(2);
            if (!shotB && Date.now() - tGest > 4500) { shotB = true; await pg.waitForTimeout(250); await shot(`${part}-1b-nudged`); }
          }
          await pg.waitForTimeout(450);
        }
      } else {
        // the saw: back and forth along its axis (up = push, down = pull), ~2 strokes a second
        await down(2, bc.x, bc.y); await move(2, bc.x, bc.y - 22);
        let k = 0; const cy = bc.y - 50;
        while (Date.now() - tGest < 45000 && !(await jobDone(S.L1, S.job))) {
          k++; const y = cy + 48 * Math.sin(k * 0.3);
          await move(2, bc.x, y);
          if (k === 30) { firstMs = await sampled(); await shot(`${part}-1-sawing`); }
          await pg.waitForTimeout(16);
        }
        await up(2);
      }
      if (firstMs == null) firstMs = await sampled();
      const jd = await jobDone(S.L1, S.job), cE = await cb(), fg = await floatGap();
      check(`${tag} the kohen's first frame ≤ 50 ms after the touch-down (FUN19) — the world's first frame after the touch poses him (the test's world runs on a 50-ms interval)`, !!wLat && wLat.fr >= 0 && (wLat.ms <= 50 || wLat.fr <= 1), `the craft's touch → his posed frame: ${wLat ? wLat.ms + ' ms, world frame #' + wLat.fr : 'none'} · the page's sampler saw his hand move at ${firstMs == null ? 'never' : Math.round(firstMs) + ' ms'}${smpInfo}`);
      check(`${tag} every act's "+N" lands on its impact frame (≤ 50 ms)`, fg.acts > 0 && fg.miss === 0 && fg.worst <= 50, JSON.stringify(fg));
      const world = kind === 'cover' ? cE.lit > c1.lit + 30 && cE.tiles >= 1 : kind === 'plumb' ? cE.acts >= 1 : cE.acts >= 1;
      check(`${tag} the world object changed (${kind === 'cover' ? 'the panel lit where rubbed' : kind === 'plumb' ? 'the bob on the mark, the stone set true' : 'the kerf, the board'})`, world, `lit ${c1.lit}→${cE.lit} · tiles ${cE.tiles} · acts ${cE.acts} q ${cE.q.join('')} · pts ${cE.pts}`);
      check(`${tag} the gesture finishes the job`, !!jd && jd.stars >= 1, jd ? `q ${jd.q.toFixed(2)} ★${jd.stars} · ${Math.round((Date.now() - tGest) / 1000)} s` : 'no jobDone');
      nums[part] = { lat: wLat, firstMs: firstMs == null ? null : Math.round(firstMs), gf: lastGf, gap: fg.worst, acts: fg.acts, q: jd ? +jd.q.toFixed(2) : null, stars: jd ? jd.stars : 0, s: Math.round((Date.now() - tGest) / 1000) };
      await shot(`${part}-2-done`);
      await closeCards(); await pg.waitForTimeout(1800);
      // 5. taps alone (a second job)
      const S2 = await start(part, 1);
      if (S2) {
        let taps = 0; const t4 = Date.now();
        while (Date.now() - t4 < 70000 && !(await jobDone(S2.L1, S2.job))) { if (await pg.$('.gm-modal.on')) { await closeCards(); continue; } await tap(S2.bc.x, S2.bc.y); taps++; await pg.waitForTimeout(420); }
        const jd2 = await jobDone(S2.L1, S2.job), c2 = await cb();
        // the tap's impact: each act after the touch-down that made it (the release ≈ 60 ms after it)
        const lat = await G(() => { const A = window.__CRAFT_ACTS || [], D = window.__TD || [], out = []; for (const a of A) { let td = null; for (const t of D) if (t <= a.t) td = t; if (td != null && a.t - td < 1500) out.push(Math.round(a.t - td)); } out.sort((x, y) => x - y); return { n: out.length, med: out.length ? out[out.length >> 1] : null, min: out[0], max: out[out.length - 1] }; });
        nums[part].tapImpact = lat;
        check(`${tag} taps alone finish it (a tap earns at most good)`, !!jd2 && jd2.stars >= 1 && c2.q.every((q) => q <= 1), jd2 ? `${taps} taps · q ${jd2.q.toFixed(2)} ★${jd2.stars} · acts ${c2.q.join('')} · touch-down → impact ${JSON.stringify(lat)} ms` : `no jobDone after ${taps} taps`);
        nums[part].taps = taps;
        await closeCards(); await pg.waitForTimeout(1500);
      }
      check(`${tag} no .fx-mg sheet frame`, (await G(() => window.__MG_VIS)) === 0);
      console.log(`   ${part}: ${Math.round((Date.now() - t1) / 1000)} s`);
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log('numbers ' + JSON.stringify(nums));
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
