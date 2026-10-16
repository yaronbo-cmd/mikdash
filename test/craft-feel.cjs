// ── crafta19 ── (wave 19, FUN19 §2 — binding; the owner's notes 2, 5, 7, 8, 9, 13, 14, 17, 18) the crafts' FEEL under two thumbs, by real touch
// (CDP) at 844×390 on dist/test.html. For each craft (rock · survey · tread · cord):
//   · the first act comes only after a touch (no finger for 1.5 s: no act, no "+N", the world unchanged — 8א: no strike by itself)
//   · the kohen's animation starts ≤ 100 ms after the touch-down (measured in the page by rAF from the pointerdown)
//   · the score lands at the impact: the act's "+N" float appears on the act's own frame (≤ 50 ms apart), never at the touch-down
//   · the world object changed (the rock's state · the survey's count · the wheel's angle and the rope · the cord's straightness, the line)
//   · taps alone still finish the job; no .fx-mg sheet; no console errors
//   + banker: the wall's strike card on the same rule (notes 9, 13)
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/craft-feel.cjs [--part=rock,survey,tread,cord,banker] [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/craft-feel');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = 844, H = 390;
const PART = (args.find((a) => a.startsWith('--part=')) || '--part=rock,survey,tread,cord,banker,key,dress,column').slice(7).split(',').filter(Boolean);
const results = [], nums = {};
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); if (args.includes('--diag') && /crafta19|hands/.test(m.text())) console.log('   console ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__MG_VIS = 0; setInterval(() => { const m = document.querySelector('.fx-mg'); if (m && m.classList.contains('on')) window.__MG_VIS++; }, 100);
      // the touch-downs on the work button; the "+N" floats as they appear
      window.__TD = []; window.__FL = [];
      window.addEventListener('pointerdown', (e) => { const t = e.target; if (t && t.closest && t.closest('.tw-btn')) window.__TD.push(performance.now()); }, true);
      const obs = () => new MutationObserver((ms) => { const t = performance.now(); for (const m of ms) { if (m.type === 'characterData') { const tx = m.target && m.target.textContent; if (tx && /^\s*\+\d/.test(tx)) window.__FL.push({ t, tx: tx.trim().slice(0, 16) }); continue; } for (const n of m.addedNodes) { const tx = n && n.textContent; if (tx && /^\s*\+\d/.test(tx)) window.__FL.push({ t, tx: tx.trim().slice(0, 16) }); } } }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      if (document.documentElement) obs(); else document.addEventListener('DOMContentLoaded', obs);
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const tap = async (x, y, ms = 50) => { await down(9, x, y); await pg.waitForTimeout(ms); await up(9); };
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/craft-feel/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };
    const since = (n, type) => G(([n, ty]) => window.__GAME_LOG.slice(n).filter((e) => e.type === ty).map((e) => e.d), [n, type]);
    const logN = () => G(() => window.__GAME_LOG.length);
    /** a fresh page for each part (one craft's job, cards and crane never leak into the next) */
    async function boot() {
      await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
      await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
      await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
      const cine = await pg.$('.gm-cine'); const cbx = cine && await cine.boundingBox();
      if (cbx) await tap(cbx.x + cbx.width / 2, cbx.y + cbx.height * 0.6);
      await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
      await pg.waitForTimeout(600);
    }

    /** the sampler: from now, every rAF, the first frame his act shows after the latest touch-down (the hero's stroke, or a craft's own
     *  `moving` read) → ms from the touch-down */
    const sampler = (read) => G((rd) => {
      const f0 = new Function('return (' + rd + ')()');
      const S = window.__SMP = { first: null, run: true, n0: window.__TD.length, base: null };
      const f = () => { if (!S.run) return; const v = f0();
        if (window.__TD.length <= S.n0) S.base = v;
        else if (S.first == null && v !== S.base && v != null && v !== false) S.first = performance.now() - window.__TD[S.n0];
        requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, read.toString());
    const sampled = () => G(() => { const S = window.__SMP; if (!S) return null; S.run = false; return S.first == null ? null : Math.round(S.first); });
    /** each act's "+N" against the act's own time (craftAct events) → { worst, miss, acts } */
    const floatGap = (n) => G((n) => { const A = window.__GAME_LOG.slice(n).filter((e) => e.type === 'craftAct').map((e) => e.d), F = window.__FL || []; let worst = 0, miss = 0, early = 0; for (const a of A) { let best = 1e9; for (const f of F) { const d = f.t - a.t; if (Math.abs(d) < Math.abs(best)) best = d; } if (Math.abs(best) > 1e8) miss++; else { worst = Math.max(worst, Math.abs(best)); } } return { worst: Math.round(worst), miss, acts: A.length, floats: F.length }; }, n);

    /** a stage's fixture (the stages before it done, this one in its courses, the deal holding `job`) and its marker's job begun by the
     *  button → { L1, bc } | null */
    async function startJob(tag, site, job, begun, n = 0, set = 4) {
      const L0 = await G(([site, job, n, set]) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: set + n, k: 0, fp: 0, fd: 0, keys: set >= 40 ? { 0: 0.9, 16: 0.9, 32: 0.9, 48: 0.9 } : set ? { 0: 0.9 } : {}, ev: {}, bad: [], chk: set >= 32 ? set : set ? 4 : 0, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { [site]: { c: job === 'key' ? -1 : 0, n: 0, key: job === 'key' ? 0 : 1, re: 0, line: 1, deal: { cards: job === 'key' ? [] : [job], key: null, keyPass: false, quarry: false, sig: null, set: set + n, t: 3 } } }, deals: { [site]: 3 }, sig: { [site]: 1 }, best: {} };
        window.__MG_VIS = 0; __T.game._.resync();
        return window.__GAME_LOG.length;
      }, [site, job, n, set]);
      const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
      await pg.waitForTimeout(1500); await closeCards();
      const dealt = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal' && e.d.marks.some((m) => m.job === j)), [L0, job], n ? 30000 : 12000);
      if (!on || !dealt) { check(`${tag} twin on and the deal's marker out`, false, `on ${on} dealt ${dealt} · ` + JSON.stringify(await G((n) => ({ deals: window.__GAME_LOG.slice(n).filter((e) => e.type === 'twinDeal').map((e) => e.d.marks.map((m) => m.job).join('+')), cur: __T.game.state.jobs && __T.game.state.jobs.cur, set: __T.game.state.st.wall && __T.game.state.st.wall.set, spec: __TWIN.spec() }), L0)).slice(0, 600)); return null; }
      const mk = await G(([n, j]) => { const e = [...window.__GAME_LOG.slice(n)].reverse().find((x) => x.type === 'twinDeal'); return e.d.marks.find((m) => m.job === j); }, [L0, job]);
      await G((m) => __T.stages.hero.place({ x: m.x, z: m.z }), mk);
      const woke = await waitFor((j) => { const s = __TWIN.spec(); return s && s.job === j; }, job, 8000);
      if (!woke) { check(`${tag} the button takes the marker's job`, false, JSON.stringify(await G(() => __TWIN.spec()))); return null; }
      const L1 = await logN(), bc = await btnC();
      await tap(bc.x, bc.y);
      const ok = await waitFor(begun, null, 10000);
      if (!ok) { check(`${tag} its craft begins in the world`, false, JSON.stringify(await G(() => ({ hands: window.__HANDS && window.__HANDS.kind, tw: __T.stages.caTread && __T.stages.caTread() })))); return null; }
      await G(() => { window.__CRAFT_ACTS = []; window.__FL = []; });
      return { L1, bc };
    }
    const jobDone = (L1, job) => G(([n, j]) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone' && x.d.job === j); return e ? e.d : null; }, [L1, job]);
    /** each world act's "+N" against the act's own time (__CRAFT_ACTS) */
    const actGap = () => G(() => { const A = window.__CRAFT_ACTS || [], F = window.__FL || []; let worst = 0, miss = 0; for (const a of A) { let best = 1e9; for (const f of F) { const d = f.t - a.t; if (Math.abs(d) < Math.abs(best)) best = d; } if (Math.abs(best) > 1e8) miss++; else worst = Math.max(worst, Math.abs(best)); } return { worst: Math.round(worst), miss, acts: A.length, floats: F.length, q: A.map((a) => a.q).join('') }; });

    let mgVis = 0;
    for (const part of PART) {
      const tag = `[${part}]`, t1 = Date.now();
      if (part !== PART[0]) mgVis += await G(() => window.__MG_VIS);
      await boot();
      if (part === 'rock') {
        /* the fixture: the Mount's rocks after the tutorial, every rock standing; he placed ~4.5 amot off his stand at rock 4 */
        const B = await G(() => {
          const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, '');
          g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
          g.bh = g.bh.map(() => 2); g.focus = 'har'; g.crews = []; __T.game._.resync();
          const bs = __T.stages.boulderSpots(); return { i: 4, bs: bs.map((b) => [+b[0], +b[1], +b[2] || 8]) };
        });
        const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
        await pg.waitForTimeout(800); await closeCards();
        // 8א: he stands ~4.5 amot off his stand at the rock — the first touch only brings him and raises the pick; no strike without a touch
        B.off = await G((B) => { const [x, z] = B.bs[B.i]; __T.stages.hero.place({ boulder: B.i }); const s = __T.stages.hero.standOf({ boulder: B.i }); let dx = s.x - x, dz = s.z - z; const L = Math.hypot(dx, dz) || 1; const d = Math.min(15.5, L + 5); __T.stages.hero.place({ x: x + dx / L * d, z: z + dz / L * d }); const s2 = __T.stages.hero.standOf({ boulder: B.i }), h = __T.stages.heroXYZ({}); return { fromStand: +Math.hypot(h.x - s2.x, h.z - s2.z).toFixed(1), fromRock: +Math.hypot(h.x - x, h.z - z).toFixed(1) }; }, B);
        console.log('   placed ' + JSON.stringify(B.off));
        const woke = await waitFor(() => { const s = __TWIN.spec(); return s && s.job === 'rock'; }, null, 6000);
        if (!on || !woke) { check(`${tag} twin on, the button takes the rock`, false, `on ${on} woke ${woke} spec ${JSON.stringify(await G(() => __TWIN.spec()))}`); continue; }
        const bc = await btnC();
        const L0 = await logN(), hp0 = await G(() => __T.game.state.bh.slice());
        if (args.includes('--diag')) console.log('   diag0 ' + JSON.stringify(await G(() => window.__GAME_LOG.slice(-30).map((e) => e.type + (/^ca|twinWork|heroReturn|heroPlace/.test(e.type) ? JSON.stringify(e.d) : '')).join(' '))));
        await pg.waitForTimeout(1500);
        const idle = { acts: (await since(L0, 'craftAct')).length, strokes: (await since(L0, 'stroke')).length, hp: await G(() => __T.game.state.bh.slice()), fl: await G(() => window.__FL.length) };
        check(`${tag} no strike without a touch (1.5 s by the rock, no finger)`, idle.acts === 0 && idle.strokes === 0 && JSON.stringify(idle.hp) === JSON.stringify(hp0), JSON.stringify(idle));
        // the first touch, away from the rock: he walks to it and raises the pick — and does NOT strike (8א)
        const L1 = await logN();
        await tap(bc.x, bc.y);
        const armed = await waitFor(() => { const a = __T.stages.hero.armed; return a && a.up; }, null, 6000);
        await pg.waitForTimeout(900);
        const first = { acts: (await since(L1, 'craftAct')).length, strokes: (await since(L1, 'stroke')).length, armed: await G(() => __T.stages.hero.armed) };
        check(`${tag} 8א: a touch away from the rock brings him there with the pick UP — no strike by itself`, armed && first.acts === 0 && first.strokes === 0, JSON.stringify(first));
        if (args.includes('--diag')) console.log('   diag ' + JSON.stringify(await G((n) => window.__GAME_LOG.slice(n).map((e) => e.type + (e.type === 'craftAct' || e.type === 'caRun' || e.type === 'heroReturn' || e.type === 'twinWork' ? JSON.stringify(e.d) : '')).join(' '), L1)));
        if (args.includes('--diag')) console.log('   diagA ' + JSON.stringify(await G((B) => { const H = __T.stages.hero, p = __T.stages.heroXYZ({}), [x, z] = B.bs[B.i], P = H._pose; return { yaw: +H.yaw.toFixed(2), toRock: +Math.atan2(x - p.x, z - p.z).toFixed(2), armed: H.armed, held: H.held, WR: [P.WR.x, P.WR.y, P.WR.z].map((v) => +v.toFixed(2)), st: H.twinState(), gest: H.gesturing, ca: H._ca() }; }, B)));
        await shot('rock-0-armed');
        // the strikes: each touch → his fall within 100 ms, the impact ≈ 90 ms after, the "+N" on that frame, the rock answers
        const lags = [], falls = [], grades = [];
        let L2 = await logN(), split = false;
        const hpBefore = await G((i) => __T.game.state.bh[i], B.i);
        for (let k = 0; k < 8 && !split; k++) {
          await sampler(() => { const s = __T.stages.hero.stroke; return s ? 'k' + s.kk : null; });
          // (on the ring's gold moment: the touch at beat − 90 ms, read from the button's own ring)
          await waitFor(() => { const r = __TWIN.ring(); return r.on && r.u > 0.82 && r.u < 0.97; }, null, 2500);
          const n0 = await logN();
          await tap(bc.x, bc.y, 40);
          const got = await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'craftAct'), n0, 3000);
          falls.push(await sampled());
          if (got) { const a = (await since(n0, 'craftAct'))[0], td = await G(() => window.__TD[window.__TD.length - 1]); lags.push(Math.round(a.t - td)); grades.push(a.q); }
          split = (await since(n0, 'boulder')).length > 0;
          if (k === 0) await shot('rock-1-strike');
          await pg.waitForTimeout(500);
        }
        const fg = await floatGap(L2);
        const hpAfter = await G((i) => __T.game.state.bh[i], B.i), stW = await G((i) => __T.stages.boulders[i], B.i);
        nums.rock = { falls, lags, grades, float: fg };
        check(`${tag} his fall starts ≤ 100 ms after each touch-down`, falls.length && falls.every((v) => v != null && v <= 100), `falls ${falls.join(', ')} ms`);
        check(`${tag} the impact ≈ 90 ms after the touch-down (≤ 200 ms here, SwiftShader frames)`, lags.length && lags.every((v) => v >= 40 && v <= 200), `impact lags ${lags.join(', ')} ms`);
        check(`${tag} the "+N" lands at the impact (≤ 50 ms from the act, none at the touch-down)`, fg.acts > 0 && fg.miss === 0 && fg.worst <= 70, JSON.stringify(fg) + " (≤ 70: one SwiftShader frame ≈ 50 ms — the number is drawn by juice's next frame)");
        check(`${tag} the rock answers: cracked, then split into chunks (state ${hpBefore} → ${hpAfter}, world ${stW})`, hpAfter < hpBefore && split && stW === 0, `grades ${grades.join('')}`);
        await shot('rock-2-split');
        // taps alone finish the dig's next rock too (whatever the timing)
        const L3 = await logN();
        const next = await G(() => { const st = __T.stages.boulders; const i = st.findIndex((v) => v > 0); if (i >= 0) __T.stages.hero.place({ boulder: i }); return i; });
        await waitFor((i) => { const s = __TWIN.spec(); return s && s.job === 'rock' && __T.stages.hero.armed; }, next, 4000);
        let split2 = false; for (let k = 0; k < 8 && !split2; k++) { await tap(bc.x, bc.y, 40); await pg.waitForTimeout(330 + (k % 3) * 170); split2 = (await since(L3, 'boulder')).length > 0; }
        check(`${tag} taps alone split the next rock`, split2, `rock ${next} · acts ${(await since(L3, 'craftAct')).length}`);
      }
      if (part === 'tread') {
        const S = await startJob(tag, 'wall', 'tread', () => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'tread') && __T.stages.caTread().on);
        if (S) {
          await waitFor(() => __T.stages.caTread().inWheel, null, 8000); await pg.waitForTimeout(600);
          const w0 = await G(() => __T.stages.caTread()); await pg.waitForTimeout(1500); const w1 = await G(() => __T.stages.caTread());
          check(`${tag} no step without a touch (1.5 s in the wheel, no finger)`, (await G(() => (window.__CRAFT_ACTS || []).length)) === 0 && Math.abs(w1.h - w0.h) < 0.001 && Math.abs(w1.wheelA - w0.wheelA) < 0.01, `h ${w0.h.toFixed(3)}→${w1.h.toFixed(3)} wheel ${w0.wheelA.toFixed(2)}→${w1.wheelA.toFixed(2)}`);
          const bc = S.bc, falls = [];
          // swipes down on the button: 60 px in ~90 ms, one every ~450 ms (≈ 2.2 steps a second)
          // (three CDP events a swipe: under SwiftShader each waits for a frame — more events made the pace 0.9 s a swipe)
          const swipe = async () => { await down(3, bc.x, bc.y - 28); await move(3, bc.x, bc.y + 34); await up(3); };
          let tS = Date.now(), k = 0, mid = null;
          while (Date.now() - tS < 60000 && !(k % 6 === 5 && await jobDone(S.L1, 'tread'))) {
            if (k < 3) await sampler(() => { const c = __T.stages.caTread(); return Math.round(c.ph * 20) + ':' + (c.kick > 0); });
            const t0 = Date.now(); await swipe(); k++;
            if (k <= 3) { await pg.waitForTimeout(120); falls.push(await sampled()); }
            if (k === 9) { mid = await G(() => __T.stages.caTread()); await shot('tread-1-walking'); }
            await pg.waitForTimeout(Math.max(0, 440 - (Date.now() - t0)));
          }
          const w2 = await G(() => __T.stages.caTread()), gap = await actGap(), done = await jobDone(S.L1, 'tread');
          gap.rates = (await G(() => (window.__CRAFT_ACTS || []).map((a) => a.p))).join(' '); gap.period = Math.round((Date.now() - tS) / k);
          nums.tread = { swipes: k, falls, gap, mid: mid && { h: +mid.h.toFixed(2), v: +mid.v.toFixed(2), turns: mid.turns, wheel: +(mid.wheelA - w1.wheelA).toFixed(1), rope: +(mid.ropeL - w1.ropeL).toFixed(1) }, done: done && { stars: done.stars, q: done.q } };
          check(`${tag} his step starts ≤ 100 ms after each touch-down (the foot lifts at once)`, falls.length && falls.every((v) => v != null && v <= 100), `falls ${falls.join(', ')} ms`);
          check(`${tag} the wheel turns and the rope winds on the drum as the stone rises (mid-lift)`, mid && Math.abs(mid.wheelA - w1.wheelA) > 1 && mid.ropeL < w1.ropeL - 0.5 && mid.turns > 2 && mid.walk > 0.5, JSON.stringify(nums.tread.mid));
          check(`${tag} every stride's "+N" lands on its act's frame (≤ 70 ms)`, gap.acts >= 6 && gap.miss === 0 && gap.worst <= 70, JSON.stringify(gap));
          check(`${tag} swipes at ≈ 2.2 a second earn gold strides; the job ends with its stones set`, !!done && /2/.test(gap.q) && w2.set + (w2.on ? 0 : 3) >= 3, `${k} swipes · grades ${gap.q} · ${JSON.stringify(nums.tread.done)}`);
          // taps alone finish a second job
          mgVis += await G(() => window.__MG_VIS); await boot();
          const S2 = await startJob(tag + '(taps)', 'wall', 'tread', () => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'tread') && __T.stages.caTread().on, 1);
          if (S2) {
            await waitFor(() => __T.stages.caTread().inWheel, null, 8000);
            let n = 0; const tT = Date.now(); while (Date.now() - tT < 60000 && !(await jobDone(S2.L1, 'tread'))) { await tap(S2.bc.x, S2.bc.y, 40); n++; await pg.waitForTimeout(380); }
            const d2 = await jobDone(S2.L1, 'tread'), g2 = await actGap();
            check(`${tag} taps alone finish the job (graded ≤ good)`, !!d2 && !/2/.test(g2.q), `${n} taps · grades ${g2.q} · stars ${d2 && d2.stars}`);
          }
        }
      }
      if (part === 'survey') {
        const fixture = () => G(() => {
          const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, '');
          g.st.har = { p: 'survey', n: __T.game._.siteStones('har'), dp: 0, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
          g.bh = g.bh.map(() => 2); g.focus = 'har'; g.crews = []; __T.game._.resync(); return window.__GAME_LOG.length;
        });
        const toStake = () => G(() => { const w = __T.stages.workSpot('har', 'survey'); if (w && typeof w.x === 'number') __T.stages.hero.place({ x: w.x, z: w.z }); return w ? [Math.round(w.x), Math.round(w.z)] : null; });
        const begin = async (L0) => {
          const on = await waitFor(() => window.__TWIN && __TWIN.on(), null, 15000); await pg.waitForTimeout(900); await closeCards(); await toStake();
          const woke = await waitFor(() => { const s = __TWIN.spec(); return s && s.job === 'survey'; }, null, 8000);
          if (!on || !woke) { check(`${tag} the button takes the survey`, false, `on ${on} spec ${JSON.stringify(await G(() => __TWIN.spec()))}`); return null; }
          const bc = await btnC(); await tap(bc.x, bc.y);
          const ok = await waitFor(() => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'survey') && __T.stages.caSurvey().on, null, 8000);
          if (!ok) { check(`${tag} the survey's craft begins`, false, JSON.stringify(await G(() => __T.stages.caSurvey()))); return null; }
          await G(() => { window.__CRAFT_ACTS = []; window.__FL = []; }); return bc;
        };
        const L0 = await fixture(), bc = await begin(L0);
        if (bc) {
          await pg.waitForTimeout(700);
          const s0 = await G(() => __T.stages.caSurvey()); await pg.waitForTimeout(1500); const s1 = await G(() => __T.stages.caSurvey());
          check(`${tag} no measure without a touch (1.5 s kneeling at the stake)`, (await G(() => (window.__CRAFT_ACTS || []).length)) === 0 && s1.u < 0.02 && s1.pegs === 0 && s1.near, JSON.stringify({ u: s1.u, pegs: s1.pegs, near: s1.near, drop: s1.drop }));
          await shot('survey-0-kneel');
          const counts = []; let fall = null;
          for (let side = 0; side < 2; side++) {
            if (side === 0) await sampler(() => { const c = __T.stages.caSurvey(); return c.grip + ':' + Math.round(c.u * 100); });
            await down(5, bc.x, bc.y); await pg.waitForTimeout(100); if (side === 0) fall = await sampled();
            for (let k = 1; k <= 6; k++) { await move(5, bc.x - 204 * k / 6, bc.y); await pg.waitForTimeout(70); if (side === 0) counts.push(await G(() => { const e = document.querySelector('.ca-sv'); return e ? e.textContent : ''; })); }
            if (side === 0) await shot('survey-1-paying');
            const n0 = await G(() => (window.__CRAFT_ACTS || []).length);
            await up(5);
            await waitFor((n) => (window.__CRAFT_ACTS || []).length > n, n0, 3000);
            await pg.waitForTimeout(side === 0 ? 300 : 100); if (side === 0) await shot('survey-2-stamped');
            await waitFor(() => { const c = __T.stages.caSurvey(); return c.phase === 'ready' || c.phase === 'done' || !c.on; }, null, 4000);
          }
          const dug = await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'phase' && e.d.ph === 'dig' || e.type === 'surveyed'), L0, 8000);
          const gap = await actGap(), s2 = await G(() => ({ c: __T.stages.caSurvey(), p: __T.game.state.st.har.p }));
          nums.survey = { fall, counts, gap, pegs: s2.c.pegs, phase: s2.p };
          check(`${tag} his hands take the reel ≤ 100 ms after the touch-down`, fall != null && fall <= 100, `${fall} ms`);
          check(`${tag} the counter climbs in amot as the cord pays out`, counts.length === 6 && counts.map((c) => parseInt(c, 10)).every((v, i, a) => !i || v > a[i - 1]) && /אמה/.test(counts[5]), counts.join(' | '));
          check(`${tag} each release is an act on its own frame ("+N" ≤ 70 ms), released at the far stake: gold`, gap.acts === 2 && gap.miss === 0 && gap.worst <= 70 && /2/.test(gap.q), JSON.stringify(gap));
          check(`${tag} the stakes drive in, the survey is done: on to the dig`, dug && s2.p === 'dig' && s2.c.pegs >= 12, `phase ${s2.p} pegs ${s2.c.pegs}`);
          // taps alone measure it too
          const L2 = await fixture(), bc2 = await begin(L2);
          if (bc2) { await pg.waitForTimeout(500); for (let k = 0; k < 2; k++) { await tap(bc2.x, bc2.y, 40); await pg.waitForTimeout(2500); }
            const ok2 = await waitFor(() => __T.game.state.st.har.p === 'dig', null, 6000), g2 = await actGap();
            check(`${tag} taps alone measure it (good)`, ok2 && g2.q === '11', `grades ${g2.q} · phase ${await G(() => __T.game.state.st.har.p)}`); }
        }
      }
      if (part === 'banker') {
        // (notes 9, 13: "אותן בעיות סנכרון ואי ביצוע מאומה של הדמות גם בחומת העזרה ובשערי העזרה") the wall's banker strike on the same rule
        const S0 = await startJob(tag, 'wall', 'strike', () => !!(__T.game.loop && __T.game.loop.strike && __T.game.loop.strike()));
        const woke = !!S0 && await waitFor(() => { const s = __TWIN.spec(); return s && s.strike && (s.job === 'banker' || s.job === 'strike'); }, null, 8000);
        const armed = woke && await waitFor(() => { const a = __T.stages.hero.armed; return a && a.up; }, null, 5000);
        check(`${tag} at his banker the tool is held up (armed) before any touch`, armed, JSON.stringify(await G(() => ({ spec: __TWIN.spec(), armed: __T.stages.hero.armed }))));
        if (woke) {
          const bc = await btnC(), L0 = await logN(), falls = [], lags = [];
          for (let k = 0; k < 4; k++) {
            await sampler(() => { const s = __T.stages.hero.stroke; return s ? 'k' + s.kk : null; });
            await waitFor(() => { const r = __TWIN.ring(); return r.on && r.u > 0.82 && r.u < 0.97; }, null, 2500);
            const n0 = await logN(); await tap(bc.x, bc.y, 40);
            const got = await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'craftAct'), n0, 3000);
            falls.push(await sampled());
            if (got) { const a = (await since(n0, 'craftAct'))[0], td = await G(() => window.__TD[window.__TD.length - 1]); lags.push(Math.round(a.t - td)); }
            if (k === 1) await shot('banker-1-strike');
            await pg.waitForTimeout(600);
          }
          const fg = await floatGap(L0), strokes = (await since(L0, 'stroke')).length;
          nums.banker = { falls, lags, fg, strokes };
          const fs = falls.slice().sort((a, b) => a - b), med = fs[fs.length >> 1];
          check(`${tag} each touch: his fall ≤ 100 ms (median; ≤ 130 worst: one SwiftShader frame), the impact ≤ 200 ms, the "+N" on it, a stroke on the stone`, falls.every((v) => v != null && v <= 130) && med <= 100 && lags.length === 4 && lags.every((v) => v <= 200) && fg.miss === 0 && fg.worst <= 70 && strokes >= 4, JSON.stringify(nums.banker));
        }
      }
      if (part === 'key') {
        // the key stone on the crane (RESEARCH19's B2): hold to lower, drag to align, the shadow shrinks onto the slot, it lands on it
        const begun = () => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'crane') && __T.stages.caKey().on;
        const S = await startJob(tag, 'wall', 'key', begun, 0, 64);   // (the wall's 3rd course, an even one: its corner stone (64) is dealt, and it is the crane's)
        if (S) {
          await pg.waitForTimeout(1200);
          const k0 = await G(() => __T.stages.caKey()); await pg.waitForTimeout(1500); const k1 = await G(() => __T.stages.caKey());
          check(`${tag} the stone hangs over its slot and does not move without a touch (1.5 s)`, k1.y === 1 && k0.y === 1 && (await G(() => (window.__CRAFT_ACTS || []).length)) === 0 && k1.carry, JSON.stringify({ y: k1.y, off: +k1.off.toFixed(2), block: k1.block, slot: k1.slot }));
          await shot('key-0-hanging');
          const bc = S.bc, sh = [];
          await sampler(() => { const k = __T.stages.caKey(); return Math.round(k.y * 1000); });
          await down(6, bc.x, bc.y); await pg.waitForTimeout(150); const fall = await sampled();
          // align: drag along by the offset it shows (160 px a slot width), while it comes down
          const off = (await G(() => __T.stages.caKey())).off;
          for (let k = 1; k <= 4; k++) { await move(6, bc.x - off * 160 * k / 4, bc.y); await pg.waitForTimeout(80); }
          sh.push(await G(() => { const k = __T.stages.caKey(); return [+k.y.toFixed(2), k.shadow, k.shadowO]; }));
          await waitFor(() => __T.stages.caKey().y < 0.55, null, 6000); sh.push(await G(() => { const k = __T.stages.caKey(); return [+k.y.toFixed(2), k.shadow, k.shadowO]; }));
          await shot('key-1-lowering');
          await waitFor(() => __T.stages.caKey().y < 0.22, null, 6000); sh.push(await G(() => { const k = __T.stages.caKey(); return [+k.y.toFixed(2), k.shadow, k.shadowO]; }));
          await up(6); await pg.waitForTimeout(700);   // (the brake: it holds)
          const held = await G(() => __T.stages.caKey()); await pg.waitForTimeout(400); const held2 = await G(() => __T.stages.caKey());
          const n0 = await G(() => (window.__CRAFT_ACTS || []).length);
          await down(6, bc.x, bc.y);   // (hold again near the bed: it comes down slowly — a soft landing)
          const landed = await waitFor((n) => (window.__CRAFT_ACTS || []).length > n, n0, 8000);
          await up(6);
          await pg.waitForTimeout(200); await shot('key-2-landed');
          const done = await waitFor(([n]) => window.__GAME_LOG.slice(n).some((x) => x.type === 'keyStone' || (x.type === 'jobDone' && x.d.job === 'key')), [S.L1], 8000);
          const gap = await actGap(), k2 = await G(() => __T.stages.caKey()), set = await G((n) => window.__GAME_LOG.slice(n).filter((x) => x.type === 'stoneSet').length, S.L1);
          const soft = await G(() => (window.__FL || []).some((f) => /רכה/.test(f.tx)) || [...document.querySelectorAll('.jx-n, .gm-float')].some((e) => /רכה/.test(e.textContent)));
          nums.key = { fall, shadow: sh, brake: [held.y, held2.y], gap, set, gone: k2.gone, soft };
          check(`${tag} the hold lowers it at once (≤ 100 ms after the touch-down)`, fall != null && fall <= 100, `${fall} ms`);
          check(`${tag} its shadow shrinks and darkens onto the slot as it nears`, sh.length === 3 && sh[2][1] < sh[0][1] && sh[2][2] > sh[0][2], JSON.stringify(sh));
          check(`${tag} released, the brake holds it (it never falls)`, Math.abs(held2.y - held.y) < 0.005 && held.y > 0, `${held.y.toFixed(3)} → ${held2.y.toFixed(3)}`);
          check(`${tag} it lands on the slot: the act on its frame ("+N" ≤ 70 ms), aligned → gold, the stone counted where it lies`, landed && gap.miss === 0 && gap.worst <= 70 && /2/.test(gap.q) && done && set >= 1 && k2.gone, JSON.stringify({ gap, set, done, gone: k2.gone }));
          check(`${tag} a soft landing pays +20 ("נחיתה רכה")`, soft, '');
          mgVis += await G(() => window.__MG_VIS); await boot();
          const S2 = await startJob(tag + '(taps)', 'wall', 'key', begun, 0, 64);
          if (S2) { await pg.waitForTimeout(800); let n = 0; while (n < 12 && !(await G(() => (window.__CRAFT_ACTS || []).length))) { await tap(S2.bc.x, S2.bc.y, 40); n++; await pg.waitForTimeout(800); }
            const g2 = await actGap(); check(`${tag} taps alone land it (≤ good)`, g2.acts === 1 && g2.q !== '2', `${n} taps · ${g2.q}`); }
        }
      }
      if (part === 'dress') {
        // dressing at the banker (B2): short swipes on the beat = chisel strokes; the margins turn smooth and pale
        const begun = () => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'dress') && __T.stages.caDress().on;
        const S = await startJob(tag, 'wall', 'key', begun, 0, 16);   // (the wall's first corner stone (16) is dressed)
        if (S) {
          await pg.waitForTimeout(1200);
          const d0 = await G(() => __T.stages.caDress()); await pg.waitForTimeout(1500); const d1 = await G(() => __T.stages.caDress());
          check(`${tag} the mallet held up; no stroke without a touch (1.5 s)`, d1.armed && d1.strips === 0 && (await G(() => (window.__CRAFT_ACTS || []).length)) === 0, JSON.stringify(d1));
          const bc = S.bc, falls = []; let k = 0; const t0 = Date.now();
          while (Date.now() - t0 < 40000 && !(await G(() => window.__GAME_LOG.some((x) => x.type === 'keyStone')))) {
            if (k < 3) await sampler(() => { const s = __T.stages.hero.stroke; return s ? 'k' : null; });
            await waitFor(() => { const r = __TWIN.ring(); return r.on && r.u > 0.8 && r.u < 0.96; }, null, 2500);
            await down(7, bc.x, bc.y - 20); await move(7, bc.x, bc.y + 24); await up(7); k++;
            if (k <= 3) { await pg.waitForTimeout(140); falls.push(await sampled()); }
            if (k === 5) await shot('dress-1-margins');
            await pg.waitForTimeout(250);
          }
          const gap = await actGap(), d2 = await G(() => __T.stages.caDress()), done = await G(() => window.__GAME_LOG.some((x) => x.type === 'keyStone'));
          nums.dress = { swipes: k, falls, gap, d2 };
          check(`${tag} each swipe: the mallet falls ≤ 100 ms after the touch (the swipe's crossing)`, falls.length === 3 && falls.every((v) => v != null && v <= 130), `falls ${falls.join(', ')} ms`);
          check(`${tag} every stroke's "+N" on its contact frame; the margins turn smooth (4 strips), the stone drafted, the key stone set`, gap.acts >= 12 && gap.miss === 0 && gap.worst <= 70 && done && (d2.wp === 'drafted' || d2.wp === 'field'), JSON.stringify({ gap, wp: d2.wp, strips: d2.strips, done }));
          await shot('dress-2-done');
        }
      }
      if (part === 'column') {
        // the column pull (B2): upward swipes on the beat, hand over hand; the column rises on the shear legs; at 90° into its socket
        const begun = () => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'pull') && __T.stages.caColumn().on;
        const S = await startJob(tag, 'nikanor', 'column', begun);
        if (S) {
          await pg.waitForTimeout(1000);
          const c1 = await G(() => __T.stages.caColumn()); await pg.waitForTimeout(1500); const c2 = await G(() => __T.stages.caColumn());
          check(`${tag} the column lies at its socket; no heave without a touch (1.5 s)`, c2.u === 0 && c2.k === 0 && (await G(() => (window.__CRAFT_ACTS || []).length)) === 0, JSON.stringify(c2));
          await shot('column-0-lying');
          const bc = S.bc, falls = [], us = []; let k = 0; const t0 = Date.now();
          while (Date.now() - t0 < 45000 && !(await G((n) => window.__GAME_LOG.slice(n).some((x) => x.type === 'jobDone'), S.L1))) {
            if (k < 3) await sampler(() => { const c = __T.stages.caColumn(); return c.grip + ':' + c.k; });
            await waitFor(() => { const r = __TWIN.ring(); return r.on && r.u > 0.8 && r.u < 0.96; }, null, 2500);
            await down(8, bc.x, bc.y + 22); await move(8, bc.x, bc.y - 26); await up(8); k++;
            if (k <= 3) { await pg.waitForTimeout(120); falls.push(await sampled()); }
            if (k % 5 === 0) us.push(+(await G(() => __T.stages.caColumn().u)).toFixed(2));
            if (k === 8) await shot('column-1-rising');
            await pg.waitForTimeout(200);
          }
          const gap = await actGap(), c3 = await G(() => __T.stages.caColumn()), done = await G((n) => window.__GAME_LOG.slice(n).some((x) => x.type === 'jobDone'), S.L1);
          nums.column = { heaves: k, falls, us, gap, stood: c3.stood };
          check(`${tag} the touch-down grips the rope at once (≤ 100 ms)`, falls.length === 3 && falls.every((v) => v != null && v <= 100), `falls ${falls.join(', ')} ms`);
          check(`${tag} each heave raises it (the ratchet holds); every "+N" on its heave's frame; it stands in its socket; the job ends`, us.length >= 2 && us.every((v, i, a) => !i || v >= a[i - 1]) && gap.miss === 0 && gap.worst <= 70 && gap.acts >= 15 && c3.stood && done, JSON.stringify({ us, gap, stood: c3.stood, done }));
          await shot('column-2-standing');
        }
      }
      if (part === 'cord') {
        const begun = () => !!(window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'snap') && __T.stages.caCord().kind === 'line';
        const S = await startJob(tag, 'wall', 'line', begun);
        if (S) {
          await waitFor(() => { const c = __T.stages.caCord(); return c.near && c.on; }, null, 8000); await pg.waitForTimeout(500);
          const c0 = await G(() => __T.stages.caCord()); await pg.waitForTimeout(1500); const c1 = await G(() => __T.stages.caCord());
          check(`${tag} no snap without a touch (1.5 s at the cord, no finger); the cord hangs slack`, (await G(() => (window.__CRAFT_ACTS || []).length)) === 0 && c1.lines === 0 && c1.sag > 0.6, `sag ${c1.sag.toFixed(2)} lines ${c1.lines}`);
          const bc = S.bc;
          await sampler(() => { const c = __T.stages.caCord(); return Math.round(c.bow * 100) + ':' + Math.round(c.tenS * 100); });
          await down(4, bc.x, bc.y); await pg.waitForTimeout(120); const fall = await sampled();
          const mid = [];
          for (let k = 1; k <= 5; k++) { await move(4, bc.x - 14 * k, bc.y - 14 * k); await pg.waitForTimeout(90); mid.push(await G(() => { const c = __T.stages.caCord(); return [+c.tenS.toFixed(2), +c.sag.toFixed(2), c.hue]; })); }
          await shot('cord-1-pulled');
          const n0 = await G(() => (window.__CRAFT_ACTS || []).length);
          await up(4);
          const snapped = await waitFor((n) => (window.__CRAFT_ACTS || []).length > n, n0, 3000);
          await pg.waitForTimeout(300);
          const c2 = await G(() => __T.stages.caCord()), gap = await actGap();
          const done = await waitFor(([n]) => window.__GAME_LOG.slice(n).some((x) => x.type === 'jobDone' && x.d.job === 'line'), [S.L1], 8000);
          nums.cord = { fall, mid, gap, lines: c2.lines };
          check(`${tag} his lean starts ≤ 100 ms after the touch-down`, fall != null && fall <= 100, `${fall} ms`);
          check(`${tag} the cord straightens and brightens as the thumb pulls`, mid.length === 5 && mid[4][0] > mid[0][0] && mid[4][1] < 0.1 && mid[4][1] < mid[0][1] && mid[4][2] > mid[0][2], JSON.stringify(mid));
          check(`${tag} the release snaps it: gold at full tension, the "+N" on the snap's frame, the red line printed`, snapped && /2/.test(gap.q) && gap.miss === 0 && gap.worst <= 70 && c2.lines >= 1, JSON.stringify(gap) + ` lines ${c2.lines}`);
          await shot('cord-2-snapped');
          check(`${tag} the job ends`, done);
          const S2 = await startJob(tag + '(taps)', 'wall', 'line', begun, 1);
          if (S2) { await waitFor(() => __T.stages.caCord().near, null, 8000); await pg.waitForTimeout(400); await tap(S2.bc.x, S2.bc.y, 40);
            const d2 = await waitFor(([n]) => window.__GAME_LOG.slice(n).some((x) => x.type === 'jobDone' && x.d.job === 'line'), [S2.L1], 10000), g2 = await actGap();
            check(`${tag} a tap alone snaps it (good) and ends the job`, d2 && g2.q === '1', `grades ${g2.q}`); }
        }
      }
      console.log(`   ${tag} ${((Date.now() - t1) / 1000).toFixed(0)} s`);
    }
    check('no .fx-mg sheet frame', mgVis + (await G(() => window.__MG_VIS)) === 0);
    const errs = logs.filter((l) => !/favicon|net::|ERR_FILE|Failed to load resource/.test(l));
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
    console.log('NUMS ' + JSON.stringify(nums));
  } catch (e) { console.log('ERROR', e && e.stack); results.push(false); }
  finally { await b.close(); }
  const pass = results.filter(Boolean).length;
  console.log(`\ncraft-feel: ${pass}/${results.length} in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  process.exit(pass === results.length ? 0 : 1);
})();
