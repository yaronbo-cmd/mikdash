// SITE11 (wave 11) — the corner stone seen on the hook and landing (PRODUCER10 top-10 #4), by REAL TOUCH, a shot every 3 s.
//   node test/site_corner_touch.cjs [dist/test.html] [--out=test/out/site11/corner] [--tag=run]
// Phone 390×844, touch, normal mode, a fresh profile. The opening skipped by a tap; the state written ONCE (declared): the Mount's
// courses at stone 16, the course's corner stone next (the quarry game). Then only taps: the pill (the key stone), the quarry
// game by its hand's cue, a card's button. From the delivery's start (keyDeliver) to its end + 4 s, every 3 s: a shot, where
// the block is (on the cart, on the hook: on screen?), where the kohen is (≥ 80 px, on screen), and after it lands whether the
// next stone's ring waits at his banker (FLOW11's N15). Checks: the block on screen in ≥ 80 % of the hook samples; the stone
// landed (the count up); the kohen on screen at the end.
// (SITE12: a queued run can be re-planned while it waits for its turn — test/out/site12/<this test>.plan.json = {"exec": "<another
//  test>.cjs", "argv": [...]} runs that one instead, once; the file is consumed)
if (!global.__SITE12_PLANNED) {
  try {
    const f = require('path').join(__dirname, 'out/site12', require('path').basename(__filename, '.cjs') + '.plan.json');
    if (require('fs').existsSync(f)) {
      const P = JSON.parse(require('fs').readFileSync(f, 'utf8')); require('fs').unlinkSync(f);
      if (P.exec) { global.__SITE12_PLANNED = true; console.log('plan: ' + P.exec + ' ' + (P.argv || []).join(' ')); process.argv = [process.argv[0], require('path').join(__dirname, P.exec), ...(P.argv || [])]; require(require('path').join(__dirname, P.exec)); return; }
    }
  } catch (e) { console.log('plan: ' + e.message); }
}
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const file = path.resolve(args.find((a) => !a.startsWith('--')) || 'dist/test.html');
const out = opt('out', 'test/out/site11/corner'), tag = opt('tag', 'run');
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const T0 = Date.now(), sec = () => ((Date.now() - T0) / 1000).toFixed(0);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => {
    window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    try { localStorage.clear(); } catch (e) { /* */ }
  });
  const logs = [];
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(386, x)), Math.max(4, Math.min(840, y)));
  const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
  let nShot = 0;
  const shot = async (name) => {
    const f = `${out}/${tag}-${String(++nShot).padStart(2, '0')}-${name}.png`;
    await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: f, timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; });
    return f;
  };
  // the opening: a tap skips it
  await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
  await pg.waitForTimeout(600); await tap(195, 500);
  await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
  await pg.waitForTimeout(800);
  // the seed (declared, once): the Mount's courses at stone 16 — the course's corner stone next
  await G(() => {
    const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
    Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: 16, k: 0, chk: 16 }); g.st.har.keys[0] = 0.9;
    g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; __T.game._.resync(); __T.stages.focus('har');
  });
  await waitFor(() => typeof __T.stages.posed !== 'function' || __T.stages.posed('har'), null, 15000);
  await pg.waitForTimeout(2500);
  const look = () => G(() => {
    const S = __T.stages, cam = __T.camera, C = S._dbg.crane; cam.updateMatrixWorld();
    const hp = S.hero.position, a = __T.view.project(hp.x, hp.y, hp.z), ay = a.y, h = __T.view.project(hp.x, hp.y + 3.6, hp.z);   // (his full height, as PRODUCER11's K80)
    const hero = { on: !!h.on && h.x > 24 && h.x < 366 && h.y > 110 && ay < 714, px: Math.round(Math.abs(ay - h.y)) };
    let block = null;
    if (C && C.block.visible) { const p = C.block.position, q = __T.view.project(p.x, p.y, p.z); block = { on: !!q.on && q.x > 0 && q.x < 390 && q.y > 60 && q.y < 784, lift: !!C.lift, y: Math.round(p.y) }; }
    const ring = (() => { const r = document.querySelector('.gm-ring'); if (r && r.classList.contains('live')) return 'ring'; const m = document.querySelector('.gm-mark'); return m && !m.classList.contains('gm-hidden') && m.style.opacity !== '0' ? 'mark' : null; })();
    return { set: __T.game.state.st.har.set, hero, block, ring, stock: S._dbg.ST.har.stock };
  });
  // the pill asks for the key stone: tap it
  const pill = await pg.$('.gm-pill'); const pb = pill && await pill.boundingBox();
  console.log(`${sec()}s pill: ${await G(() => { const n = document.querySelector('.gm-pill'); return n ? n.innerText.replace(/\s+/g, ' ').slice(0, 80) : ''; })}`);
  await shot('before');
  if (pb) await tap(pb.x + pb.width / 2, pb.y + pb.height / 2);
  // the quarry game by its hand's cue (FLOW10's game-courses-touch way)
  const t0 = Date.now();
  await waitFor(() => !!document.querySelector('.fx-mg'), null, 12000);
  while (Date.now() - t0 < 90000) {
    const s = await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? { ...w.__mg.state(), cue: w.__mg.cue() } : null; });
    if (!s) break;
    if (s.done) { const r = await G(() => { const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; const go = [...document.querySelectorAll('.fx-mg button')].find((x) => vis(x) && /המשך|✓|שלמה/.test(x.textContent)); if (!go) return null; const r = go.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (r) await tap(r.x, r.y); await pg.waitForTimeout(400); continue; }
    if (s.how) { const e = await pg.$('.fx-mg-how'); const bb = e && await e.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height * 0.85); await pg.waitForTimeout(250); continue; }
    const c = s.cue; if (!c) { await pg.waitForTimeout(120); continue; }
    if (c.timed) await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); const k = w && w.__mg && w.__mg.cue(); return !!(k && k.now) || !w || w.classList.contains('done'); }, null, { polling: 'raf', timeout: 8000 }).catch(() => {});
    const k = (await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; })) || c;
    const cv = await pg.$('.fx-mg canvas'); const bb = cv && await cv.boundingBox();
    if (bb) await tap(bb.x + bb.width * (k.x == null ? 0.5 : k.x), bb.y + bb.height * (k.y == null ? 0.5 : k.y));
    await pg.waitForTimeout(c.timed ? 160 : 240);
  }
  console.log(`${sec()}s the quarry game over`);
  // the delivery: a shot and a look every 3 s from its start to its end + 4 s
  const started = await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'start'), null, 20000);
  check(`[${tag}] the hewn corner stone's delivery starts`, started);
  const samples = [];
  const tD = Date.now();
  let endAt = 0;
  for (let i = 0; i < 20; i++) {
    const ended = await G(() => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'end'));
    if (ended && !endAt) endAt = Date.now();
    if (endAt && Date.now() - endAt > 4000) break;
    const l = await look();
    const f = await shot(`t${String(Math.round((Date.now() - tD) / 1000)).padStart(2, '0')}`);
    samples.push({ t: Math.round((Date.now() - tD) / 1000), ...l, f: path.basename(f) });
    console.log(`${sec()}s +${samples[samples.length - 1].t}s set ${l.set} stock ${l.stock} block ${l.block ? (l.block.on ? 'ON' : 'off') + (l.block.lift ? ' hook' : '') + ' y' + l.block.y : '-'} hero ${l.hero.on ? 'on' : 'OFF'} ${l.hero.px}px ring ${l.ring} · ${path.basename(f)}`);
    const wait = 3000 - ((Date.now() - tD) % 3000);
    await pg.waitForTimeout(Math.max(200, wait));
  }
  const hook = samples.filter((s) => s.block && s.block.lift);
  check(`[${tag}] the corner stone seen on the hook (≥ 80 % of the hook samples on screen)`, hook.length > 0 && hook.filter((s) => s.block.on).length >= hook.length * 0.8, `${hook.filter((s) => s.block.on).length}/${hook.length}`);
  const last = samples[samples.length - 1] || {};
  check(`[${tag}] the corner stone landed (the count up)`, last.set >= 17, `set ${last.set}`);
  check(`[${tag}] the kohen on screen after the landing`, last.hero && last.hero.on && last.hero.px >= 50, JSON.stringify(last.hero || {}));   // (the lift's wide shot: 50 px)
  console.log(`${sec()}s after the landing: ring/mark = ${last.ring}`);
  check(`[${tag}] no page errors`, !logs.length, logs.slice(0, 3).join(' | '));
  fs.writeFileSync(`${out}/${tag}-samples.json`, JSON.stringify(samples, null, 1));
  await b.close();
  let bad = results.filter((r) => !r.ok).length;
  console.log(`${results.length - bad}/${results.length} passed (${sec()} s)`);
  // --then-sites=…: the living sites by touch in the same queue slot (test/site_wall_touch.cjs on the same build)
  const then = opt('then-sites', 'wall:3,gates:2,yesod:2');
  if (then) {
    try { require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'site_wall_touch.cjs'), file, `--tag=${tag}w`, `--sites=${then}`], { stdio: 'inherit', timeout: 470000 }); }
    catch (e) { bad++; console.log(`site_wall_touch: ${e.status != null ? 'exit ' + e.status : e.message}`); }
  }
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
