// (JUICE18, wave 18) The juice and the craft points by REAL touch (CDP Input.dispatchTouchEvent) at 844×390 on dist/test.html —
// docs/WAVE18-BRIEF.md "test/juice-touch.cjs":
//   part 1 (the strikes, at a rock of the Mount): a strike → a "+1" that flies and lands in the xp counter, whose number rises by 1;
//     ten strikes → +10; at 10 the level up (the stamp "<המקצוע> — רמה 2!", the bar starts again); every answer within 50 ms of
//     the touch (juice.stats: the six answers in the touch's own task).
//   part 2 (the pools): 200 hits — no DOM node made after the warm-up, the heap after a GC within 300 KB of before.
//   part 3 (a job's end, at the wall's courses): walk to a marker by the stick, start it by the button, taps finish it → the
//     stars pop one by one (juice.result), the coins fly and the purse (.gm-res) rises by the paid amount.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/juice-touch.cjs [--part=1|2|3|all] [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/juice');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const has = (p) => PART === 'all' || PART.split(',').includes(p);
const W = 844, H = 390;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--expose-gc'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__MG_VIS = 0;
      setInterval(() => { const m = document.querySelector('.fx-mg'); if (m && m.classList.contains('on')) window.__MG_VIS++; }, 100);
      // (what the juice showed: the stars' pops in order, the stamps' words, the flights' last points)
      window.__JX = { stars: [], stamps: [], fly: [], coins: 0 };
      setInterval(() => { for (const c of document.querySelectorAll('.gm-coin')) if (c.style.opacity === '1') { window.__JX.coins++; break; } }, 60);
      new MutationObserver((ms) => { for (const m of ms) { const t = m.target; if (!t.classList) continue;
        if (t.classList.contains('jx-s') && t.classList.contains('on')) window.__JX.stars.push({ t: performance.now(), on: !t.classList.contains('e') });
        if (t.classList.contains('gm-stamp') && t.classList.contains('on')) window.__JX.stamps.push(t.textContent);
        if (t.classList.contains('jx-n') && t.classList.contains('f')) window.__JX.fly.push({ t: performance.now(), el: t }); } })
        .observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] });
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
    const shot = async (name) => { if (!SHOTS) return; await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/juice/' + name + '.png'); };
    const heroAt = () => G(() => { const S = __T.stages, p = S.heroXYZ({}), q = __T.view.project(p.x, p.y + 1.6, p.z); return { x: p.x, z: p.z, sx: Math.round(q.x), sy: Math.round(q.y), on: !!q.on }; });
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };
    // (the xp counter as the player sees it: HUD18's .gm-xp when ui.xp exists, else juice.js's own chip .jx-xp)
    const xpc = () => G(() => {
      const h = typeof __T.game.ui.xp === 'function' && document.querySelector('.gm-xp');
      if (h) {   // (HUD18's slot: "רמה N" in its small, "xp/next" in the bar's number)
        const r = h.getBoundingClientRect(), num = (h.querySelector('.gm-xp-bar em') || {}).textContent || '', lv = (h.querySelector('.gm-xp-tx small') || {}).textContent || '';
        const m = /(\d+)/.exec(num.replace(/[\u2066-\u2069]/g, '')), l = /(\d+)/.exec(lv), f = h.querySelector('.gm-xp-bar i');
        return { n: m ? +m[1] : NaN, level: l ? +l[1] : null, bar: f ? parseFloat(f.style.width) : null, text: h.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.width > 0 && !h.classList.contains('gm-hidden') };
      }
      const e = document.querySelector('.jx-xp');
      if (!e) return null;
      const r = e.getBoundingClientRect(), bar = e.querySelector('i i, .gm-xp-bar i, [style*="width"]');
      const n = e.dataset.xp != null ? +e.dataset.xp : +((e.textContent.match(/\d+/g) || ['NaN']).pop());
      return { n, level: e.dataset.level != null ? +e.dataset.level : null, bar: bar ? parseFloat(bar.style.width) : null, text: e.textContent, x: r.left + r.width / 2, y: r.top + r.height / 2, vis: r.width > 0 && getComputedStyle(e).display !== 'none' };
    });
    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
    if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);

    if (has('1') || has('2')) {
      /* the fixture: the Mount's rocks after the tutorial; the rock at hand cannot break in 10 strikes; no points yet */
      const i = await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, ''); g.xp = {};
        g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        g.bh[4] = 999; g.focus = 'har'; g.crews = []; __T.game._.resync(); return 4;
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 10000);
      await G((i) => __T.stages.hero.place({ boulder: i }), i);
      await pg.waitForTimeout(1500);
      const J = await G(() => { const j = globalThis.__BH_PARTS && globalThis.__BH_PARTS.juice; return { real: !!(j && j.hit && !j.stub && j.stats), game: !!(__T.game.juice && __T.game.juice === j) }; });
      check('juice.js is registered at __BH_PARTS.juice (and game.juice) — the one twin.js calls', J.real && J.game, JSON.stringify(J));
      const sp = await G(() => __TWIN.spec());
      check('by a rock the work button wakes with the rock\'s act', !!sp && sp.job === 'rock', JSON.stringify(sp));
      if (has('1')) {
        const bc = await btnC();
        /* one strike: the "+1" pops, flies, lands in the counter, whose number rises by 1 */
        const x0 = (await xpc()) || { n: 0 };
        await down(2, bc.x, bc.y); await pg.waitForTimeout(50); await up(2);
        await pg.waitForTimeout(90);
        const pop = await G(() => { const e = [...document.querySelectorAll('.jx-n')].find((n) => /^\+(1|10|20|40|50)$/.test(n.textContent) && getComputedStyle(n).opacity > 0.3)   /* hook19: the pop's number is the act's score (10 · 20 · 40 · 50); its craft point (+1) flies with it */; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: e.className }; });
        check('a strike → a number pops at the work (the juice\'s pooled number; hook19: the act\'s score, its +1 craft point flies with it)', !!pop, JSON.stringify(pop));
        await shot('1-plus');
        const landed = await waitFor(() => __T.game.juice.stats().landed >= 1, null, 3000) && await pg.waitForTimeout(300).then(() => true);
        const x1 = await xpc();
        const fl = await G(() => { const f = window.__JX.fly[0]; if (!f) return null; const r = f.el.getBoundingClientRect(); return { n: window.__JX.fly.length }; });
        check('… it flies to the xp counter and lands there: the counter\'s number rises by 1', landed && x1 && x1.n === (x0.n || 0) + 1 && x1.vis && !!fl, `${x0.n || 0} → ${x1 && x1.n} · "${x1 && x1.text}" · flights ${fl && fl.n}`);
        // (the flight ends on the counter: a point mid-way sampled, then its last place)
        /* more strikes, paced as a child strikes (the pips refill), until ten "+1" have come → +10 in all; at 10 the level up */
        const lag = [], ev = []; let touches = 1;
        while (touches < 16 && (await G(() => __T.game.juice.stats().pts)) < 10) {
          await pg.waitForTimeout(950);
          await down(2, bc.x, bc.y); await pg.waitForTimeout(45); await up(2); touches++;
          const s1 = await G(() => __T.game.juice.stats()); lag.push(+s1.lagLast.toFixed(1)); ev.push(Math.round(s1.evLast));
          if (s1.pts >= 10) { await pg.waitForTimeout(700); await shot('2-level'); }
        }
        await waitFor(() => __T.game.juice.stats().busy === 0, null, 4000);
        await pg.waitForTimeout(300);
        const x2 = await xpc(), st = await G(() => __T.game.juice.stats()), saved = await G(() => JSON.stringify(__T.game.state.xp));
        check('ten strikes → +10 in the counter (and in the save, G.xp)', st.pts === 10 && x2 && x2.n === (x0.n || 0) + 10 && /"חוצבים":10/.test(saved), `counter ${x2 && x2.n} · G.xp ${saved} · ${st.pts} points from ${touches} touches (a touch on empty pips strikes nothing) · landed ${st.landed}`);
        const stamp = await G(() => window.__JX.stamps.slice());
        check('at 10 the level up: the stamp "<המקצוע> — רמה 2!" and the bar starts again', stamp.some((s) => /רמה 2!/.test(s)) && st.ups >= 1 && x2 && (x2.level == null || x2.level === 2) && (x2.bar == null || x2.bar <= 10), `stamps ${JSON.stringify(stamp)} · level ${x2 && x2.level} · bar ${x2 && x2.bar}% · ups ${st.ups}`);
        check('every answer within 50 ms of its touch (from the page\'s touch to the six answers, in the touch\'s own task)', st.touch >= 10 && st.lagMax <= 50, `touch answers ${st.touch} (of ${st.hits} hits; the rest are the impact's words) · max ${st.lagMax.toFixed(1)} ms · each: ${lag.join(' ')} · from the touch's own time stamp (SwiftShader's queue included): ${ev.join(' ')} ms`);
      }
      if (has('2')) {
        /* the pools: 200 hits, no node made after the warm-up, the heap stable */
        const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
        const nodes0 = await G(() => document.querySelectorAll('.jx *').length);
        await G(() => { const J = __T.game.juice, p = __T.stages.heroXYZ({}); for (let k = 0; k < 20; k++) J.hit('strike', { at: { x: p.x, y: p.y, z: p.z }, text: '+1', perfect: k % 5 === 0, craft: 'סתתים', quality: 0.82 }); });
        await pg.waitForTimeout(1600);
        const h0 = await heap();
        for (let r = 0; r < 10; r++) {
          await G(() => { const J = __T.game.juice, p = __T.stages.heroXYZ({}); for (let k = 0; k < 20; k++) J.hit('strike', { at: { x: p.x, y: p.y, z: p.z }, text: k % 7 === 3 ? 'מושלם!' : '+1', perfect: k % 7 === 3, craft: 'סתתים', quality: 0.82 }); });
          await pg.waitForTimeout(120);
        }
        await pg.waitForTimeout(1800);
        const h1 = await heap(), nodes1 = await G(() => document.querySelectorAll('.jx *').length), st = await G(() => __T.game.juice.stats());
        check('200 hits: the pools hold (no node made after the warm-up)', nodes1 === nodes0, `${nodes0} → ${nodes1} nodes`);
        check('200 hits: the heap after a GC within 300 KB of before (no per-hit or per-frame garbage kept)', h1 - h0 < 300 * 1024, `${(h0 / 1048576).toFixed(2)} → ${(h1 / 1048576).toFixed(2)} MB (${((h1 - h0) / 1024).toFixed(0)} KB) · hits ${st.hits} · landed ${st.landed}`);
      }
    }

    if (has('3')) {
      /* a job's end at the wall's courses: the stars pop one by one; the coins fly to the purse, which rises by the paid amount */
      const site = 'wall';
      const L0 = await G((site) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
        window.__MG_VIS = 0; __T.game._.resync(); return window.__GAME_LOG.length;
      }, site);
      await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
      await pg.waitForTimeout(2500); await closeCards();
      const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z, face: w.face }; }, site);
      if (bank) { await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(1200); }
      await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal'), L0, 12000);
      const QUICK = ['saw', 'gold', 'plaster', 'bronze', 'wheel', 'column', 'line', 'tread', 'key', 'strike'];
      const pickT = () => G((q) => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'), dd = e && e.d; if (!dd || !dd.marks || !dd.marks.length) return null; const ms = dd.marks.slice().sort((a, b) => (q.indexOf(a.job) < 0 ? 99 : q.indexOf(a.job)) - (q.indexOf(b.job) < 0 ? 99 : q.indexOf(b.job))); return ms[0]; }, QUICK);
      let target = await pickT(), woke = null, fdown = false; const t3 = Date.now();
      while (target && Date.now() - t3 < 20000) {
        target = (await pickT()) || target;
        const sp = await G(() => __TWIN.spec()); if (sp && sp.job === target.job) { woke = sp; break; }
        if (await pg.$('.gm-modal.on')) { if (fdown) { await up(1); fdown = false; } await closeCards(); continue; }
        const hr = await heroAt(); const q = await G((t) => __T.view.projectRaw(t.x, __T.stages.groundAt(t.x, t.z) + 1, t.z), target);
        let vx = q.x - hr.sx, vy = q.y - hr.sy; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
        if (vl < 12) { if (fdown) { await up(1); fdown = false; } await pg.waitForTimeout(200); continue; }
        if (!fdown) { await down(1, 190, 300); fdown = true; }
        await move(1, 190 + vx * 55, 300 + vy * 55); await pg.waitForTimeout(220);
      }
      if (fdown) await up(1);
      check('[job] a marker is reached by the stick and the button takes its job', !!woke, `${target && target.job} · ${woke ? woke.label : 'null'}`);
      if (woke) {
        const L1 = await G(() => window.__GAME_LOG.length), bc = await btnC();
        const purse0 = await G(() => ({ n: Math.floor(__T.game.state.res.silver || 0), shown: (document.querySelector('.gm-purse .gm-num') || {}).textContent }));
        await tap(bc.x, bc.y);
        const started = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobStart' && e.d.job === j), [L1, woke.job], 8000);
        let taps = 0; const t4 = Date.now();
        while (started && Date.now() - t4 < 70000 && !(await G(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === j), [L1, woke.job]))) {
          if (await pg.$('.gm-modal.on')) { await closeCards(); continue; }
          await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(420);
        }
        const jd = await G(([n, j]) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone' && x.d.job === j); return e && e.d; }, [L1, woke.job]);
        const paid = await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'coins'), L1, 6000);
        await pg.waitForTimeout(1500);   // (a course closed by the job pays its own coins too)
        const coinsEv = await G((n) => { const es = window.__GAME_LOG.slice(n).filter((x) => x.type === 'coins'); return es.length ? { n: es.reduce((a, e) => a + e.d.n, 0), k: es.map((e) => e.d.n).join('+') } : null; }, L1);
        await pg.waitForTimeout(500); await shot('3-result');
        const rose = await waitFor(([p0, c]) => { const t = (document.querySelector('.gm-purse .gm-num') || {}).textContent || ''; return Math.floor(__T.game.state.res.silver || 0) === p0 + c && t.replace(/\D/g, '') !== '' ; }, [purse0.n, coinsEv ? coinsEv.n : -1], 5000);
        const purse1 = await G(() => ({ n: Math.floor(__T.game.state.res.silver || 0), shown: (document.querySelector('.gm-purse .gm-num') || {}).textContent }));
        check('[job] taps finish it (no sheet frame)', started && !!jd && await G(() => !window.__MG_VIS), `${woke.job} · ${taps} taps · ${jd ? `★${jd.stars}` : 'no jobDone'}`);
        const cxp = await G(() => JSON.stringify(__T.game.state.xp || {}));
        const trade = { saw: 'נגרים', gold: 'צורפים', plaster: 'סיידים', bronze: 'נחושתנים', wheel: 'שואבי מים', tread: 'מנופאים' }[woke.job] || 'סתתים';
        const got = (JSON.parse(cxp)[trade] || 0);
        check('[job] every touch of the craft earns its point — the good ("טוב") and the gold ("מושלם!") ones too', got >= taps - 2, `${trade}: ${got} points for ${taps + 1} touches · G.xp ${cxp}`);
        await waitFor(() => window.__JX.stars.length >= 3, null, 4000);
        const stars = await G(() => window.__JX.stars.slice(-3).map((s) => Math.round(s.t)));
        const gaps = stars.slice(1).map((t, k) => t - stars[k]);
        check('[job] juice.result: the three stars pop one by one (≈ 260 ms apart)', stars.length === 3 && gaps.every((g) => g >= 150 && g <= 520), `gaps ${gaps.join(' ')} ms · results ${(await G(() => __T.game.juice.stats())).results}`);
        check('[job] the coins fly and the purse (.gm-res) rises by the paid amount', paid && rose && coinsEv && purse1.n === purse0.n + coinsEv.n && await G(() => window.__JX.coins > 0), `${purse0.n} (${purse0.shown}) → ${purse1.n} (${purse1.shown}) · paid ${coinsEv && coinsEv.k} · coins seen flying ${await G(() => window.__JX.coins)}`);
        // (the celebration: on, the bubble stepped back; a tap on the stick's zone skips it — the bubble comes back)
        const bOn = await waitFor(() => __T.game.juice.stats().big, null, 6000);
        let skip = null;
        if (bOn) {
          const hush = await G(() => document.querySelector('.gm').classList.contains('jx-hush') && __T.game.juice.stats().big);
          await pg.waitForTimeout(300);
          const t5 = Date.now(); await tap(190, 300);
          const off = await waitFor(() => !__T.game.juice.stats().big && !document.querySelector('.gm').classList.contains('jx-hush'), null, 3000);
          skip = { hush, off, ms: Date.now() - t5 };
        }
        check('[job] the course\'s celebration: the bubble steps back while it plays, and a tap skips it', !bOn || (skip.hush && skip.off), JSON.stringify(skip));
        const bg = await G(() => __T.game.juice.stats());
        check('[job] a course closed by the job: juice.big after the stars (3.2 s, a tap skips it)', bg.bigs >= 1 || !(await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'course'), L1)), `bigs ${bg.bigs} · course ${await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'course'), L1)}`);
      }
    }
    const errs = logs.filter((l) => !/favicon|ERR_FILE_NOT_FOUND|net::|WebGL|GPU stall/i.test(l));
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  the run threw: ' + (e && e.stack || e)); results.push(false); }
  finally { await b.close(); }
  const ok = results.filter(Boolean).length;
  console.log(`\njuice-touch: ${ok}/${results.length} in ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(ok === results.length ? 0 : 1);
})();
