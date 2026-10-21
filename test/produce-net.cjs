// PRODUCER10: "כהנים יחד" as two children meet it — two pages of one browser (NET10's BroadcastChannel mock, __NET_MOCK), each a
// fresh profile, real touch only. A: ☰ → כהנים יחד → open a shared work; B: ☰ → כהנים יחד → A's work (one tap). Then both play
// the survey and the rocks on their pointers, side by side, and I look: do I see the other kohen? his name? his blows? the count?
//   node test/produce-net.cjs --url=file:///…/dist/test.html [--tag=net] [--play=100]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const TAG = A.tag || 'net', URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html'), PLAY = +(A.play || 100) * 1000;
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = { A: [], B: [] };
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await ctx.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__NET_MOCK = true;
      try { if (!sessionStorage.getItem('pr-once')) { sessionStorage.setItem('pr-once', '1'); for (const k of Object.keys(localStorage)) if (/^bh_/.test(k)) localStorage.removeItem(k); } } catch (e) { /* storage */ }
    });
    const P = { A: await ctx.newPage(), B: await ctx.newPage() };
    for (const k of ['A', 'B']) { P[k].on('pageerror', (e) => errs[k].push(e.message)); P[k].on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs[k].push(m.text().slice(0, 160)); }); }
    await P.A.goto(URL0); await P.A.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
    await P.B.goto(URL0); await P.B.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
    note('both booted');
    const E = (k, fn, a) => P[k].evaluate(fn, a); let n = 0;
    const shot = async (k, name) => {
      await E(k, () => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${k}-${name}.png`); await P[k].screenshot({ path: f, timeout: 240000 }); await E(k, () => { window.__HUD_HOLD = false; });
      const info = await E(k, () => { const pl = document.querySelector('.nt-plate'), ed = document.querySelector('.nt-edge'), pn = document.querySelector('.nt-panel'); const vis = (e) => !!e && e.style.display !== 'none' && e.getBoundingClientRect().width > 0; return { plate: vis(pl) ? pl.textContent.trim().slice(0, 30) : null, edge: vis(ed) ? ed.textContent.trim().slice(0, 30) : null, panel: pn ? pn.innerText.replace(/\s+/g, ' ').slice(0, 140) : null }; });
      note(`SHOT ${path.relative(ROOT, f)} ${JSON.stringify(info)}`); return info;
    };
    const tapSel = async (k, sel, text, why) => {
      const r = await E(k, ([s, t]) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0 && (!t || new RegExp(t).test(x.textContent))); if (!e) return null; e.scrollIntoView({ block: 'center' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, w: Math.round(q.width), h: Math.round(q.height), t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) }; }, [sel, text || null]);
      if (!r) return null; await E(k, () => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); }); await P[k].touchscreen.tap(r.x, r.y); note(`${k} tap ${why || sel} "${r.t}" [${r.w}×${r.h}]`); return r;
    };
    // the openings end by themselves (a tap would skip them): wait, like a first-timer
    for (const k of ['A', 'B']) await P[k].waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 250, timeout: 30000 }).catch(() => {});
    await P.A.waitForTimeout(1500);
    // A opens a shared work
    await tapSel('A', '.gm-rb[data-k="menu"]', null, '☰'); await P.A.waitForTimeout(1000);
    await shot('A', 'menu');
    if (!(await tapSel('A', '[data-net="open"]', null, 'כהנים יחד'))) note('A: NO "כהנים יחד" in the menu');
    await P.A.waitForTimeout(1200); await shot('A', 'card');
    await tapSel('A', '.nt-modal [data-nt="host"]', null, 'open a shared work'); await P.A.waitForTimeout(1500);
    await shot('A', 'waiting');
    // B joins it
    await tapSel('B', '.gm-rb[data-k="menu"]', null, '☰'); await P.B.waitForTimeout(1000);
    await tapSel('B', '[data-net="open"]', null, 'כהנים יחד'); await P.B.waitForTimeout(2500);
    await shot('B', 'card');
    if (!(await tapSel('B', '.nt-modal [data-nt="join"]', null, 'join A'))) note('B: no work to join');
    await P.B.waitForTimeout(2500);
    await shot('A', 'joined'); await shot('B', 'joined');
    // both play: the pointer (else the ring, the pill), turn by turn
    const t1 = Date.now(); let k2 = 0, shotAt = [30000, 65000];
    while (Date.now() - t1 < PLAY) {
      for (const k of ['A', 'B']) {
        const m = await E(k, () => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); const card = document.querySelector('.gm-modal.on .gm-btn-gold'); if (card) { const r = card.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: 'card' }; } const q = document.querySelector('.gm-mark'); if (q && !q.classList.contains('gm-hidden') && q.style.opacity !== '0') { const t = q.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); if (t) return { x: +t[1], y: +t[2], w: 'pointer' }; } const rg = document.querySelector('.gm-ring.live'); if (rg) { const t = rg.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); if (t) return { x: +t[1], y: +t[2], w: 'ring' }; } return null; });
        if (m && m.x > 4 && m.x < W - 4 && m.y > 90 && m.y < H - 110) await P[k].touchscreen.tap(m.x, m.y); else if (m && m.w === 'card') await P[k].touchscreen.tap(m.x, m.y);
        k2++;
      }
      await P.A.waitForTimeout(700);
      if (shotAt.length && Date.now() - t1 > shotAt[0]) { shotAt.shift(); await shot('A', 'together'); await shot('B', 'together'); }
    }
    await shot('A', 'end'); await shot('B', 'end');
    for (const k of ['A', 'B']) note(`${k} state ${JSON.stringify(await E(k, () => { const s = globalThis.__BH_NET && __BH_NET.state; const g = __T.game.state; return { net: s ? { phase: s.phase, total: s.total, him: !!s.him } : null, har: g.st.har.p, bh: g.bh.join(''), set: g.st.har.set }; }))} errors ${errs[k].length} ${errs[k].slice(0, 2).join(' | ')}`);
  } catch (e) { console.error('RUN ERROR', e.message); }
  finally { await b.close(); }
})();
