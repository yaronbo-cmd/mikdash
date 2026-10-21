// ECON14 (wave 14) — the ring made legible (D3), by REAL TOUCH at 390×844 on dist/test.html: the Mount's courses (a fixture past
// the rocks), the save's first tries (the teach: slow beats, the hand, the mentor's line), one early, one late, one on the beat;
// the words under the gold; shots of the ring closing, "עכשיו!", and the words.   node test/econ-ring-probe.cjs [--no-build]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/econ');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'warning' && /hero job failed|econ14|ring/.test(m.text())) logs.push('WARN ' + m.text().slice(0, 160)); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) { /* */ } });
    { const fa = args.find((a) => a.startsWith('--file=')); await pg.goto('file://' + (fa ? path.resolve(fa.slice(7)) : path.join(ROOT, 'dist/test.html'))); }
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 50, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => { await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); const f = path.join(OUT, `ring-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); console.log('   shot', path.relative(ROOT, f)); await G(() => { window.__HUD_HOLD = false; }); };
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => { const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, ''); Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: 2, k: 0, chk: 0 }); g.st.har.keys[0] = 0.9; g.res.stone = 400; g.crews = []; __T.game._.resync(); });
    await pg.waitForTimeout(2500);
    const heroPt = () => G(() => { const hp = __T.stages.hero.position; const q = __T.view.project(hp.x, hp.y + 1.8, hp.z); return { x: q.x, y: q.y }; });
    const ringOn = () => G(() => document.querySelector('.gm-ring').classList.contains('live'));
    const st = () => G(() => { const r = document.querySelector('.gm-ring'), h = __T.game._.hero; return { cls: r.className, fb: r.querySelector('s').textContent, fbOn: r.querySelector('s').className, coach: __T.game.ui.coachText, beat: h.beat, now: performance.now() / 1000, econ: __T.game.state.econ || {} }; });
    // the first tap: he walks to his banker and strikes; the ring starts (slow: the teach)
    const tapHero = async () => { const p = await heroPt(); await tap(p.x, p.y + 10); };
    // (v27: wave 14's course loop deals "מה נעשה עכשיו?" at the load — its sheet covers him; the probe closes it by its ✕, as a
    //  player may, and strikes freely: a free tap still strikes. The deal comes back after a job, a check or a load, not a strike)
    const closeDeal = async () => { const x = await G(() => { const d = document.querySelector('.gm-deal.on .gm-x'); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (x) { await tap(x.x, x.y); await pg.waitForTimeout(500); } return !!x; };
    await waitFor(() => !!document.querySelector('.gm-deal.on'), null, 8000); await closeDeal();
    const fb = () => G(() => document.querySelector('.gm-ring s').textContent);
    const untilBeat = async (off) => { const s = await st(); const w = (s.beat - s.now + off) * 1000; if (w > 0) await pg.waitForTimeout(w); };
    const nextRing = async () => { await waitFor(() => __T.game._.hero.busy, null, 3000); await waitFor(() => document.querySelector('.gm-ring').classList.contains('live'), null, 6000); };
    await tapHero();
    check('the first strike starts the ring', await waitFor(() => document.querySelector('.gm-ring').classList.contains('live'), null, 15000));
    await pg.waitForTimeout(700);   // (the first contact moves the ring to where his tool met the stone)
    // (v27: the ring's transform moves only while its anchor projects on screen — during the frame's glide after his walk the
    //  ring is faded out, and its last transform is stale: the probe reads it once it is seen, as the player does)
    await waitFor(() => { const i = document.querySelector('.gm-ring i'); return !!i && +i.style.opacity > 0.3; }, null, 4000);
    const near = await G(() => { const r = document.querySelector('.gm-ring').style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); const hp = __T.stages.hero.position, q = __T.view.project(hp.x, hp.y + 1.8, hp.z); const a = __T.game._.hero.anchorT; return { ring: r ? [+r[1], +r[2]] : null, hero: [Math.round(q.x), Math.round(q.y)], a: a && typeof a === 'object' ? 'stone' : String(a) }; });
    check('the ring sits on the stone he strikes, by the kohen (not the crane)', near.ring && Math.hypot(near.ring[0] - near.hero[0], near.ring[1] - near.hero[1]) < 160 && near.a === 'stone', JSON.stringify(near));
    const s0 = await st();
    check('the teach: the ring is slow (beat ≥ 1.5 s after the swing) and the hand is on', /teach/.test(s0.cls) && s0.beat - s0.now > 1.0, `${s0.cls} · beat in ${(s0.beat - s0.now).toFixed(2)} s`);
    const cap = await G(() => { const e = document.querySelector('.gm-ring small'); return { t: e.textContent, o: getComputedStyle(e).opacity, coachOn: document.querySelector('.gm').classList.contains('coach-on') }; });
    check('the ring says "הקש כשהטבעת נוגעת בזהב" under the gold (no bubble: .coach-on stays off — N93)', /הקש כשהטבעת נוגעת בזהב/.test(cap.t) && +cap.o > 0.5 && !cap.coachOn, JSON.stringify(cap));
    // try 1: early (0.7 s before the beat)
    await untilBeat(-0.7); await tapHero();
    check('an early tap: "מוקדם, חכה עוד רגע"', await waitFor(() => /מוקדם/.test(document.querySelector('.gm-ring s').textContent), null, 4000), await fb());
    // try 2: on the beat
    await nextRing(); await untilBeat(-0.04); await tapHero();
    check('a tap on the beat: "מדויק! מכה כפולה"', await waitFor(() => /מדויק/.test(document.querySelector('.gm-ring s').textContent), null, 4000), await fb());
    // try 3: late (0.5 s after the beat)
    await nextRing(); await untilBeat(0.5); await tapHero();
    check('a late tap: "מאוחר, הקש קצת קודם"', await waitFor(() => /מאוחר/.test(document.querySelector('.gm-ring s').textContent), null, 4000), await fb());
    // tries 4–5 on the beat → the teach ends after five tries
    for (let k = 0; k < 2; k++) { await nextRing(); await untilBeat(-0.04); await tapHero(); await pg.waitForTimeout(200); }
    await pg.waitForTimeout(400);
    const tries = await G(() => window.__GAME_LOG.filter((e) => e.type === 'ringTry').map((e) => `${e.d.perfect ? 'P' : e.d.early ? 'E' : e.d.late ? 'L' : '?'}${e.d.dt}${e.d.teach ? 't' : ''}`));
    const strikes = await G(() => window.__GAME_LOG.filter((e) => e.type === 'strike').length);
    check('the teach ends after five tries (taught)', await G(() => window.__GAME_LOG.some((e) => e.type === 'ringTaught')), `${tries.join(' ')} · ${strikes} strikes`);
    await nextRing(); const s1 = await st();
    check('after the teach: the game\'s beat (0.86 s) and no hand', !/teach/.test(s1.cls) && (s1.beat - s1.now) < 0.9, `${s1.cls} · ${(s1.beat - s1.now).toFixed(2)}`);
    // the shots: the teach again (a fresh save's), one slow cycle mid-close, the next at "עכשיו!", then the words
    await pg.waitForTimeout(2500);
    await G(() => { const e = __T.game.state.econ; e.tt = 0; e.tp = 0; e.rw = 0; e.pw = 0; });
    await tapHero(); await nextRing(); await pg.waitForTimeout(700); await shot('1-closing');
    await nextRing(); await untilBeat(-0.7); await tapHero(); await pg.waitForTimeout(120); await shot('2-early');
    await nextRing(); await untilBeat(-0.05); const nowCls = await G(() => { __T.game.frame(performance.now()); return document.querySelector('.gm-ring').className; }); await shot('3-now'); await tapHero();
    check('"עכשיו!" and the gold glows at the beat', /now/.test(nowCls) && /near/.test(nowCls), nowCls);
    await pg.waitForTimeout(150); await shot('4-perfect');
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } catch (e) { check('the probe ran', false, e.message); } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})();
