// SITE11 (wave 11) — the living sites by REAL TOUCH (STAGING §6–§8, rule 8 "the stone is dressed where it is set").
//   node test/site_wall_touch.cjs [dist/test.html] [--out=test/out/site11/wall] [--tag=run] [--sites=wall:4,gates:2,yesod:2,har-finish]
// Phone 390×844, touch, normal mode, a fresh profile, no autoplay flags. The opening is skipped by a tap; then, per site, the
// state is written ONCE (declared, the seed's way: the Mount done, the site in its courses at a segment's second stone, the
// segment paid, the keys before it done), the camera flown as a load flies it (focus), and from there every stone is played by
// taps on what the screen shows (the ring, the gold pointer, the site's glowing stone, the next slot, the banker, else the
// middle of the screen). At every tap it measures what the player sees and what the world does:
//   - the site posed after the load (stages.posed: the count landed, the crane, its stock and his banker at the working front);
//   - the kohen on screen, in the safe frame, ≥ 80 px tall (STAGING R1/R8);
//   - his banker ≤ 12 amot from the course's next slot at the wall (R8), ≤ 16 elsewhere (a working bay beside it);
//   - the crane at the working front (its base ≤ 30 amot from the slot) and its stock ≤ 14 amot from his banker;
//   - the stones set by taps; at the altar the stone on his banker stays a whole field stone (never drafted or dressed);
//   - har-finish: the Mount's paving grows at his strokes (N40), he is on screen while he paves.
// Shots: <out>/<tag>-NN-*.png (looked at by the author). Exit code 1 on a failed check.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const file = path.resolve(args.find((a) => !a.startsWith('--')) || 'dist/test.html');
const out = opt('out', 'test/out/site11/wall'), tag = opt('tag', 'run');
const PLAN = opt('sites', 'har-finish,wall:4,gates:2,yesod:2').split(',').map((x) => { const [id, n] = x.split(':'); return { id, n: +(n || 3) }; });
const SHOTS = +opt('shots', 16);
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const T0 = Date.now(), sec = () => ((Date.now() - T0) / 1000).toFixed(0);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  await pg.addInitScript(() => {
    window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true;
    try { localStorage.clear(); } catch (e) { /* */ }
  });
  const logs = [];
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) logs.push(m.text().slice(0, 200)); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const frame = () => G(() => { __T.simulate(false); __T.render(); __T.game.frame(performance.now()); __T.simulate(true); });
  let nShot = 0;
  const shot = async (name, force) => {
    if (nShot >= SHOTS && !force) return null;
    const f = `${out}/${tag}-${String(++nShot).padStart(2, '0')}-${name}.png`;
    await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: f, timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; });
    console.log(`${sec()}s SHOT ${f}`); return f;
  };
  // the opening: a tap skips it
  await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { polling: 100, timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(600);
  await pg.touchscreen.tap(195, 500);
  await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 100, timeout: 20000 }).catch(() => {});
  await pg.waitForTimeout(400);
  const M = (id) => G((id) => {
    const S = __T.stages, cam = __T.camera, D = S._dbg, h = S.hero; cam.updateMatrixWorld();
    const P = h.position.clone(), head = P.clone(); head.y += 3.6;   // (his full height, as PRODUCER11's K80)
    const pr = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * innerWidth, y: (1 - q.y) / 2 * innerHeight, front: q.z < 1 }; };
    const a = pr(P), bb = pr(head), px = Math.abs(a.y - bb.y);
    const on = a.front && bb.x > 60 && bb.x < 330 && bb.y > 110 && a.y < 700;
    const fin = id === 'har';
    const s = fin ? null : S.nextSlot(id), w = S.workSpot(id, fin ? 'set' : 'dress'), C = D.crane, st = D.ST[id], pile = st.piles && st.piles[0];
    const r = (v) => Math.round(v * 10) / 10;
    const g = __T.game.state.st[id] || {};
    const wp = S.hero.workpiece();
    return {
      set: g.set, k: g.k, p: g.p, fd: g.fd, wp, tool: S.hero.tool, pave: D.pave ? D.pave() : null,
      hero: { x: r(P.x), y: r(P.y), z: r(P.z), px: Math.round(px), on, sx: Math.round(bb.x), sy: Math.round(bb.y), dist: r(cam.position.distanceTo(head)) },
      slot: s ? { x: r(s.face[0]), y: r(s.y), z: r(s.face[2]), c: s.course, i: s.index } : null,
      banker: w && w.stone ? { x: r(w.stone.x), y: r(w.stone.y), z: r(w.stone.z) } : null,
      crane: C.st ? { site: C.st.id, x: r(C.bx), z: r(C.bz), lift: !!C.lift } : null,
      pile: pile ? { x: r(pile[0]), z: r(pile[1]), stock: st.stock } : null,
      heroToSpot: w ? r(Math.hypot(P.x - w.x, P.z - w.z)) : null,
      bankerToSlot: s && w && w.stone ? r(Math.hypot(w.stone.x - s.face[0], w.stone.z - s.face[2])) : null,
      craneToSlot: s && C.st ? r(Math.hypot(C.bx - s.face[0], C.bz - s.face[2])) : null,
      pileToBanker: pile && w && w.stone ? r(Math.hypot(pile[0] - w.stone.x, pile[1] - w.stone.z)) : null,
      camToSlot: s ? r(cam.position.distanceTo(new cam.position.constructor(s.face[0], s.y, s.face[2]))) : null,
      pill: (() => { const n = document.querySelector('.gm-pill'); return n && n.offsetParent ? n.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) : ''; })(),
    };
  }, id);
  // where a player taps: the ring, the gold pointer, the site's glowing stone, the next slot, his banker, the kohen, else the middle
  const where = (id) => G((id) => {
    const H = innerHeight, ok = (s) => s && s.on && s.x > 20 && s.x < 370 && s.y > 120 && s.y < H - 150;
    const tr = (sel, live) => { const r = document.querySelector(sel); if (!r || (live && !r.classList.contains('live')) || r.classList.contains('gm-hidden') || r.style.opacity === '0') return null; const m = r.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m && +m[2] > 120 && +m[2] < H - 150 ? { x: +m[1], y: +m[2] } : null; };
    const ring = tr('.gm-ring', true); if (ring) return { ...ring, by: 'ring' };
    const mk = tr('.gm-mark'); if (mk) return { ...mk, by: 'mark' };
    const S = __T.stages, hs = S._dbg.hs, V = __T.view;
    if (hs && hs.id === id && hs.pos) { const s = V.project(hs.pos.x, hs.pos.y, hs.pos.z); if (ok(s)) return { x: s.x, y: s.y, by: 'hotspot' }; }
    if (id !== 'har') { const sl = S.nextSlot(id); if (sl) {
      // (the slot, or the course's foot below it: a tap on the site's own masonry — v20's flow has no "tap anywhere")
      for (const dy of [0, -sl.h / 2, sl.h]) { const s = V.project(sl.face[0] - sl.n[0] * 0.4, sl.y + dy, sl.face[2] - sl.n[1] * 0.4); if (ok(s)) return { x: s.x, y: s.y, by: 'slot' }; }
    } }
    const w = S.workSpot(id, 'dress'); if (w && w.stone) { const s = V.project(w.stone.x, w.stone.y + 0.5, w.stone.z); if (ok(s)) return { x: s.x, y: s.y, by: 'banker' }; }
    const p = S.hero.position, s = V.project(p.x, p.y + 2, p.z); if (ok(s)) return { x: s.x, y: s.y, by: 'hero' };
    return { x: 195, y: 420, by: 'centre' };
  }, id);
  for (const part of PLAN) {
    const fin = part.id === 'har-finish', id = fin ? 'har' : part.id, T = `${tag}/${part.id}`;
    // the seed (declared; written once): every stage before it done; the site at a segment's second stone (or the Mount's finish)
    const seeded = await G(({ id, fin }) => {
      const g = __T.game.state;
      const order = ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
      g.ftue = 99; g.bh = g.bh.map(() => 0);
      for (const d of order) { if (d === id) break; g.st[d] = { done: true }; }
      for (const d of order.slice(order.indexOf(id) + 1)) delete g.st[d];
      const P = __T.game._.proj ? null : null;
      const n = { har: 192, wall: 256, gates: 144, nashim: 144, sorag: 96, nikanor: 144, lishka: 144, yesod: 64, sovev: 64, guf: 128, karnot: 16 }[id] || 64;
      const seg = { yesod: 8, sovev: 8, guf: 8, karnot: 8 }[id] || 8, set = fin ? n : 1;
      const keys = {}; for (let i = 0; i < set; i++) keys[i] = 0.9;
      g.st[id] = fin ? { p: 'finish', n, dp: 1, paid: n, set: n, k: 0, fp: 1, fd: 0, keys, ev: {}, bad: [], chk: n, insp: 0, w: 0, ph: 1 }
        : { p: 'courses', n, dp: 1, paid: Math.min(n, seg), set, k: 0, fp: 0, fd: 0, keys, ev: {}, bad: [], chk: set, insp: 0, w: 0, ph: 1 };
      g.res.stone = Math.max(g.res.stone || 0, 400); g.res.silver = Math.max(g.res.silver || 0, 200); g.res.wstone = Math.max(g.res.wstone || 0, 200);
      while (g.crews.length < 2) g.crews.push({ at: null });
      for (const c of g.crews) if (c.at && c.at !== 'quarry') c.at = null;
      g.crews[0].at = id; g.focus = id;
      __T.game._.resync();
      return g.st[id].n;
    }, { id, fin });
    // (a load lands on the site's working frame — welcomeBack → W.focus(focusOf); the resync alone leaves the camera)
    await G((id) => __T.stages.focus(id), id);
    console.log(`${sec()}s ── ${part.id}: seeded (${seeded} logical stones)`);
    const tPosed = Date.now();
    const posedOk = await pg.waitForFunction((id) => typeof __T.stages.posed !== 'function' || __T.stages.posed(id), id, { polling: 200, timeout: 15000 }).then(() => true, () => false);
    check(`[${T}] the site is posed after the load (stages.posed)`, posedOk, `${((Date.now() - tPosed) / 1000).toFixed(1)} s`);
    await pg.waitForTimeout(2600);
    const m0 = await M(id);
    console.log(`${sec()}s at start: ${JSON.stringify(m0)}`);
    await shot(`${part.id}-start`, true);
    const dc = await G(() => { try { return __T.drawCalls ? __T.drawCalls() : null; } catch (e) { return null; } });
    if (dc) check(`[${T}] ≤ 150 draw calls in the phone's working frame`, dc.total <= 150, `${dc.total} (scene ${dc.scene})`);
    const rows = [];
    let lastSet = m0.set, lastFd = m0.fd, taps = 0, stuck = 0;
    const startSet = m0.set, want = fin ? 1 : part.n;
    const doneNow = async () => { const g = await G((id) => { const s = __T.game.state.st[id]; return s ? { set: s.set, p: s.p, fd: s.fd, done: !!s.done } : null; }, id); return !g || (fin ? g.p !== 'finish' || g.fd >= 1 : g.set >= startSet + want); };
    while (taps < want * 6 && !(await doneNow())) {
      await frame();
      const w = await where(id);
      const n0 = await G(() => window.__GAME_LOG.filter((e) => e.type === 'strike' || e.type === 'stroke' || e.type === 'stoneSet').length);
      await pg.touchscreen.tap(Math.max(8, Math.min(382, w.x)), Math.max(8, Math.min(836, w.y)));
      taps++;
      await pg.waitForFunction((n) => window.__GAME_LOG.filter((e) => e.type === 'strike' || e.type === 'stroke' || e.type === 'stoneSet').length > n, n0, { polling: 100, timeout: 9000 }).catch(() => {});
      await pg.waitForTimeout(900);
      const post = await M(id);
      rows.push({ tap: taps, by: w.by, post });
      console.log(`${sec()}s tap ${taps} by ${w.by} (${w.x | 0},${w.y | 0}) set ${post.set}/${(post.k || 0).toFixed(2)} fd ${post.fd} wp ${post.wp} tool ${post.tool} pave ${post.pave} · hero ${post.hero.px}px ${post.hero.on ? 'on' : 'OFF'} d${post.hero.dist} →spot ${post.heroToSpot} · banker→slot ${post.bankerToSlot} · crane→slot ${post.craneToSlot} · pile→banker ${post.pileToBanker}`);
      if (post.set !== lastSet || post.fd !== lastFd) { lastSet = post.set; lastFd = post.fd; stuck = 0; if (!fin && post.set === startSet + 1) await shot(`${part.id}-set${post.set}`); }
      else if (++stuck > 8) { console.log('no progress in 8 taps: next part'); break; }
      if (taps === 2) await shot(`${part.id}-tap2`);
    }
    await pg.waitForTimeout(2500);
    await shot(`${part.id}-end`, true);
    const at = rows.map((r) => r.post);
    if (!at.length) { check(`[${T}] taps reached the site`, false); continue; }
    const heroOk = at.filter((m) => m.hero.on && m.hero.px >= 80).length;
    check(`[${T}] the kohen on screen and ≥ 80 px at every tap`, heroOk === at.length, `${heroOk}/${at.length} (min ${Math.min(...at.map((m) => m.hero.px))} px, max dist ${Math.max(...at.map((m) => m.hero.dist))})`);
    if (fin) {
      const pv = at.map((m) => m.pave).filter((v) => typeof v === 'number');
      check(`[${T}] the paving grows at his strokes (N40)`, pv.length && Math.max(...pv) > Math.min(...pv), pv.join(' → '));
    } else {
      const lim = id === 'wall' ? 12 : 16, bk = at.filter((m) => m.bankerToSlot !== null && m.bankerToSlot <= lim).length;
      check(`[${T}] his banker ≤ ${lim} amot from the next slot`, bk === at.length, `${bk}/${at.length} (max ${Math.max(...at.map((m) => m.bankerToSlot || 0))})`);
      const cr = at.filter((m) => m.craneToSlot !== null && m.craneToSlot <= 30).length;
      check(`[${T}] the crane at the working front (≤ 30 amot from the slot)`, cr === at.length, `${cr}/${at.length} (max ${Math.max(...at.map((m) => m.craneToSlot || 0))})`);
      const pl = at.filter((m) => m.pileToBanker !== null && m.pileToBanker <= 14).length;
      check(`[${T}] the stock ≤ 14 amot from his banker`, pl === at.length, `${pl}/${at.length} (max ${Math.max(...at.map((m) => m.pileToBanker || 0))})`);
      const set1 = await G((id) => __T.game.state.st[id].set, id);
      check(`[${T}] ${want} stones set by taps`, set1 >= startSet + want, `${startSet} → ${set1} in ${taps} taps`);
      if (['yesod', 'sovev', 'guf', 'karnot'].includes(id)) {
        const bad = at.filter((m) => m.wp && m.wp !== 'field');
        check(`[${T}] the stone on his banker stays a whole field stone (never dressed)`, !bad.length, bad.length ? bad.map((m) => m.wp).join(',') : at.map((m) => m.wp).join(','));
      }
    }
    fs.writeFileSync(`${out}/${tag}-${part.id}-rows.json`, JSON.stringify(rows, null, 1));
  }
  check(`[${tag}] no page errors`, !logs.length, logs.slice(0, 3).join(' | '));
  await b.close();
  const bad = results.filter((r) => !r.ok).length;
  console.log(`${results.length - bad}/${results.length} passed (${sec()} s)`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
