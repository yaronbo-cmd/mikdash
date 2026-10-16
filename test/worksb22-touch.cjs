// WORKSB22 — real-touch test of the four works on the life lab (844x390, hasTouch): the queue, the seals, the kiyor, the day's end.
//   NODE_PATH=... node test/worksb22-touch.cjs [--no-build] [--shots]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/worksb22');
fs.mkdirSync(OUT, { recursive: true });
if (!process.argv.includes('--no-build')) {
  require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [path.join(__dirname, 'worksb22-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/life-lab.bundle.js'), logLevel: 'warning' });
}
const fails = [], R = {};
const ok = (n, c, i) => { if (!c) fails.push(n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); console.log((c ? 'ok   ' : 'FAIL ') + n + (c || i === undefined ? '' : ' ' + JSON.stringify(i))); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.join(__dirname, 'life-lab.html'), { timeout: 240000 });
    await pg.waitForFunction(() => window.__W && __L.ready, null, { timeout: 90000 });
    const step = (s) => pg.evaluate(async (s) => { for (let t = 0; t < s; t += 0.1) { __L.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); } __L.render(); }, s);
    const shot = async (n) => { await pg.evaluate(() => __L.render()); await pg.screenshot({ path: path.join(OUT, n + '.png') }); console.log('shot ' + n); };
    // a REAL touch on an element (its centre), refusing a hidden or covered one
    const tapEl = async (sel) => {
      const h = await pg.$(sel); if (!h) return false;
      const bb = await h.boundingBox(); if (!bb || bb.width < 2) return false;
      const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const top = await pg.evaluate(([x, y, sel]) => { const e = document.elementFromPoint(x, y), t = document.querySelector(sel); return !!e && (e === t || t.contains(e)); }, [cx, cy, sel]);
      if (!top) return false;
      await pg.touchscreen.tap(cx, cy); return { w: bb.width, h: bb.height };
    };
    const js = (f, a) => pg.evaluate(f, a);

    // ───────── 1. the gate ─────────
    await js(() => { __L.look([26, 19, 9], [3, 14, 0]); });
    const g0 = await js(() => { const W = __W.W.gate; const r = W.begin({ n: 4, every: 6 }); return { r, n: W.B.M.n }; });
    ok('gate begins', g0.r.ok && g0.n === 4, g0);
    await step(7);
    await shot('gate_queue');
    const names = [];
    let wrongDone = false, hintOK = false, noPenalty = false;
    for (let i = 0; i < 12; i++) {
      const st = await js(() => { const W = __W.W.gate, M = W.B.M; return { done: M.done || M.phase !== 'work', i: M.i, pts: M.pts, q: W.queue().filter((p) => p.state === 'wait') }; });
      if (st.done) break;
      if (!st.q.length) { await step(3); continue; }
      const p = st.q.sort((a, b) => a.id - b.id)[0];
      names.push(p.kind);
      if (!wrongDone) {
        // a wrong send first: the person waits, no penalty
        const wrong = await js((k) => { const W = __W.W.gate; return ['north', 'ramp', 'birds', 'menachot'].find((s) => !W.okAt(k, s)); }, p.kind);
        const before = await js(() => ({ i: __W.W.gate.B.M.i, pts: __W.W.gate.B.M.pts, acts: __W.W.gate.B.M.acts.length }));
        ok('person chip tapped by touch', !!(await tapEl(`.wb-t[data-key="p${p.id}"]`)));
        ok('wrong station tapped by touch', !!(await tapEl(`.wb-bar [data-key="${wrong}"]`)));
        await step(0.3);
        const after = await js((id) => { const W = __W.W.gate; const q = W.queue().find((x) => x.id === id); const say = document.querySelector('.wb-layer[data-work="gate"] .wb-say'); return { i: W.B.M.i, pts: W.B.M.pts, acts: W.B.M.acts.length, q, say: say ? say.textContent : '' }; }, p.id);
        noPenalty = after.i === before.i && after.pts === before.pts && after.acts === before.acts && after.q && after.q.state === 'wait' && after.q.tries === 1;
        hintOK = /לא כאן/.test(after.say);
        ok('wrong send: waits, no points lost, hint shown', noPenalty && hintOK, { before, after });
        await shot('gate_wrong');
        wrongDone = true;
      }
      const right = await js((k) => { const W = __W.W.gate; return ['north', 'ramp', 'birds', 'menachot'].find((s) => W.okAt(k, s)); }, p.kind);
      const sel = await tapEl(`.wb-t[data-key="p${p.id}"]`);
      const sent = await tapEl(`.wb-bar [data-key="${right}"]`);
      ok(`send ${p.kind} -> ${right}`, !!sel && !!sent, { sel, sent });
      await step(0.4);
    }
    const g1 = await js(() => { const W = __W.W.gate, M = W.B.M; return { i: M.i, n: M.n, phase: M.phase, pts: M.pts, acts: M.acts.map((a) => a.q), say: !!document.querySelector('.wb-layer[data-work="gate"] .wb-say small') }; });
    ok('4 pilgrims directed', g1.i === 4, g1);
    await step(1.4);
    const g2 = await js(() => { const W = __W.W.gate, M = W.B.M; const s = document.querySelector('.wb-layer[data-work="gate"] .wb-say'); return { done: M.done, src: s ? s.dataset.src : null, text: s ? s.textContent : '' , bonus: (M.bonuses || []).length }; });
    ok('gate done by taps alone, mentor source after the end', g2.done && /זבחים ה/.test(g2.src || ''), g2);
    ok('kinds seen', names.length >= 4, names);
    await shot('gate_done');
    await step(4);

    // ───────── 2. the seals ─────────
    await js(() => { __W.setHero(-24, 28); });
    const s0 = await js(() => { const W = __W.W.seals; const r = W.begin({ n: 6 }); return { r, n: W.B.M.n }; });
    ok('seals begins', s0.r.ok && s0.n === 6, s0);
    await step(1.2);
    await shot('seals_ask');
    let wrongSeal = false;
    for (let i = 0; i < 3; i++) {
      const ask = await js(() => __W.W.seals.asking());
      if (!wrongSeal) {
        const wrong = await js((a) => ['egel', 'zachar', 'gedi', 'chote'].find((s) => s !== a), ask);
        const b = await js(() => ({ i: __W.W.seals.B.M.i, pts: __W.W.seals.B.M.pts }));
        ok('wrong seal tapped by touch', !!(await tapEl(`.wb-bar [data-key="${wrong}"]`)));
        await step(0.2);
        const a = await js(() => ({ i: __W.W.seals.B.M.i, pts: __W.W.seals.B.M.pts, phase: __W.W.seals.state.phase }));
        ok('wrong seal waits without penalty', a.i === b.i && a.pts === b.pts && a.phase === 'ask', { b, a });
        wrongSeal = true;
      }
      ok(`right seal ${ask}`, !!(await tapEl(`.wb-bar [data-key="${ask}"]`)));
      await step(0.3);
      if (i === 0) await shot('seals_redeem');
      ok('Achiya tapped by touch', !!(await tapEl('.wb-t[data-key="achiya"]')));
      await step(0.3);
    }
    const s1 = await js(() => { const M = __W.W.seals.B.M; return { i: M.i, done: M.done || M.phase !== 'work', took: __W.stock.took, pts: M.pts }; });
    ok('seals: 3 requests matched, libations taken from the stock', s1.i === 6 && s1.took.wine > 0 && s1.took.oil === s1.took.wine, s1);
    await step(1.5);
    const s2 = await js(() => { const s = document.querySelector('.wb-layer[data-work="seals"] .wb-say'); return { done: __W.W.seals.B.M.done, src: s ? s.dataset.src : '' }; });
    ok('seals done, source after the end', s2.done && /שקלים ה/.test(s2.src), s2);
    await step(4);
    // the evening count
    const e0 = await js(() => { const r = __W.W.seals.begin({ mode: 'evening' }); return { r, n: __W.W.seals.B.M.n }; });
    ok('evening count begins (6)', e0.r.ok && e0.n === 6, e0);
    for (let i = 0; i < 6; i++) ok('count seal ' + (i + 1), !!(await tapEl(`.wb-t[data-key="c${i}"]`)) || !!(await tapEl('.wb-bar [data-key="count"]')));
    await step(0.3); await shot('seals_evening');
    await step(1.4);
    const e1 = await js(() => { const s = document.querySelector('.wb-layer[data-work="seals"] .wb-say'); return { done: __W.W.seals.B.M.done, counted: __W.W.seals.state.counted, src: s ? s.dataset.src : '' }; });
    ok('evening: 6 counted, done', e1.done && e1.counted === 6, e1);
    await step(4);

    // ───────── 3. the kiyor ─────────
    await js(() => { __W.setHero(-52, 34, [5, 9, 11]); });
    const k0 = await js(() => { const W = __W.W.kiyor; return { r: W.begin({}), n: W.B.M.n }; });
    ok('kiyor begins (12 spouts)', k0.r.ok && k0.n === 12, k0);
    await step(0.5); await shot('kiyor_start');
    for (let i = 0; i < 12; i++) {
      ok('turn ' + (i + 1), !!(await tapEl('.wb-t[data-key="wheel"]')) || !!(await tapEl('.wb-bar [data-key="turn"]')));
      await step(i === 5 ? 0.9 : 0.7);
      if (i === 5) await shot('kiyor_half');
    }
    await step(1.5);
    const k1 = await js(() => { const W = __W.W.kiyor, s = document.querySelector('.wb-layer[data-work="kiyor"] .wb-say'); return { spouts: W.state.spouts, done: W.B.M.done, src: s ? s.dataset.src : '' }; });
    ok('kiyor: 12 spouts filled by taps, source after', k1.spouts === 12 && k1.done && /יומא ג/.test(k1.src), k1);
    await shot('kiyor_done');
    await step(4);

    // ───────── 4. the day's end ─────────
    await js(() => { __W.setHero(-22, 30, [6, 9, 12]); });
    const c0 = await js(() => { const W = __W.W.close; return { r: W.begin({}), n: W.B.M.n }; });
    ok('close begins (12 trays + 6 washings + 3 gate taps)', c0.r.ok && c0.n === 21, c0);   // ── bloodb25 ── (+ the washing)
    await step(0.5); await shot('close_vessels');
    const counts = [];
    for (let i = 0; i < 12; i++) {
      ok('tray ' + (i + 1), !!(await tapEl(`.wb-t[data-key="t${i}"]`)) || !!(await tapEl('.wb-bar [data-key="count"]')));
      await step(0.25);
      counts.push(await js(() => __W.W.close.state.cnt));
      if (i === 5) await shot('close_half');
    }
    ok('count 93 in 12 taps of 8', counts[0] === 8 && counts[10] === 88 && counts[11] === 93, counts);
    // ── bloodb25 ── the six vessels washed in clear water, each to its tray
    await step(0.6);
    for (let i = 0; i < 6; i++) { ok('wash ' + (i + 1), !!(await tapEl(`.wb-t[data-key="w${i}"]`)) || !!(await tapEl('.wb-bar [data-key="wash"]'))); await step(0.3); if (i === 2) await shot('close_wash'); }
    ok('washed 6', (await js(() => __W.W.close.state.washed)) === 6);
    await step(2.2);
    await shot('close_gate_start');
    for (const k of ['stone', 'keys', 'lock']) { ok('gate: ' + k, !!(await tapEl(`.wb-t[data-key="g-${k}"]`)) || !!(await tapEl('.wb-bar [data-key="gate"]'))); await step(k === 'lock' ? 1.6 : 0.8); if (k === 'keys') await shot('close_keys'); }
    await shot('close_locked');
    await step(1.5);
    const c1 = await js(() => { const W = __W.W.close, s = document.querySelector('.wb-layer[data-work="close"] .wb-say'); return { cnt: W.state.cnt, gate: W.state.gate, done: W.B.M.done, src: s ? s.dataset.src : '', emitted: __W.emitted.map((e) => e[0]) }; });
    ok('close: 93 counted, gate locked, done, source after', c1.cnt === 93 && c1.gate === 3 && c1.done && /מדות א/.test(c1.src) && c1.emitted.includes('closeDone'), c1);

    ok('no console errors', logs.length === 0, logs.slice(0, 5));
  } finally { await b.close(); }
  console.log(fails.length ? 'FAILED: ' + fails.length : 'ALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
