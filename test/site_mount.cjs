// SITE8B (wave 8B) — the Mount by real touch: phone 390×844, touch, NORMAL mode, a fresh profile, no autoplay flags.
//   node test/site_mount.cjs [dist/test.html] [--out=test/out/site8/mount] [--tag=after]
// The opening is skipped by a tap; the survey by taps where the coach's hand points; then every boulder is struck by a real
// tap on the screen (on the ring when it shows, else on the rock the hero goes to, else on the hero). For each boulder's first
// strike: is the rock on screen, clear of the HUD (130 px top, 150 px bottom), is the line of sight clear of the hill (the
// ray from the camera to the rock's top marched over stages.groundAt), how far is the camera, and a shot; then a contact
// sheet of all of them (one image). World state is read, never driven: taps only.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const args = process.argv.slice(2);
const file = path.resolve(args.find((a) => !a.startsWith('--')) || 'dist/test.html');
const out = (args.find((a) => a.startsWith('--out=')) || '--out=test/out/site8/mount').slice(6);
const tag = (args.find((a) => a.startsWith('--tag=')) || '--tag=run').slice(6);
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
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
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const frame = () => G(() => { __T.simulate(false); __T.render(); __T.game.frame(performance.now()); __T.simulate(true); });
  const shot = async (f) => { await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: f, timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; }); };
  // the opening: a tap skips it
  await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { polling: 100, timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(600);
  await pg.touchscreen.tap(195, 500);
  await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 100, timeout: 20000 }).catch(() => {});
  await pg.waitForTimeout(400);
  // the survey: taps where the coach's hand points (else the hero)
  const heroXY = () => G(() => { const p = __T.stages.hero.position; const s = __T.view.project(p.x, p.y + 2.5, p.z); return [s.x, s.y]; });
  for (let k = 0; k < 8 && !(await G(() => __T.game.state.st.har && __T.game.state.st.har.p === 'dig')); k++) {
    await frame();
    const c = await G(() => { const c = document.querySelector('.gm-coach'); if (!c || c.classList.contains('gm-hidden')) return null; const m = c.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m ? [+m[1], +m[2]] : null; });
    const p = c && c[1] > 100 && c[1] < 700 ? c : await heroXY();
    await pg.touchscreen.tap(p[0], p[1]);
    await pg.waitForTimeout(1300);
  }
  const dig = await G(() => __T.game.state.st.har && __T.game.state.st.har.p);
  check(`[${tag}] taps survey the Mount, then the dig`, dig === 'dig', dig);
  await shot(`${out}/${tag}-00-dig.png`);
  // the dig: every boulder by taps
  const seen = new Set(), rows = [];
  for (let k = 0; k < 90; k++) {
    const st = await G(() => ({ bh: __T.game.state.bh.slice(), p: __T.game.state.st.har && __T.game.state.st.har.p }));
    if (st.p !== 'dig' || st.bh.every((v) => v <= 0)) break;
    await frame();
    // where to tap: the ring when it shows, else the rock the builder works (or the nearest standing one), else the hero
    const where = await G(() => {
      const r = document.querySelector('.gm-ring'); const W = innerWidth, H = innerHeight;
      if (r && r.classList.contains('live')) { const m = r.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); if (m && +m[2] > 120 && +m[2] < H - 160) return { x: +m[1], y: +m[2], by: 'ring' }; }
      const g = __T.game.state, S = __T.stages, hp = S.hero.position;
      const XZ = S.boulderSpots ? S.boulderSpots() : [[-172, -122], [-96, -132], [-24, -118], [60, -110], [128, -84], [178, -30], [186, 40], [124, 112], [34, 124], [-58, 118], [-142, 124], [-240, -30]];   // (site9: the field, from the world)
      let bi = -1, bd = 1e9;
      for (let i = 0; i < g.bh.length; i++) { if (!(g.bh[i] > 0)) continue; const s = S.screenPos({ boulder: i }); if (!s || !s.on || s.x < 20 || s.x > W - 20 || s.y < 120 || s.y > H - 160) continue; const d = Math.hypot(XZ[i][0] - hp.x, XZ[i][1] - hp.z); if (d < bd) { bd = d; bi = i; } }
      if (bi >= 0) { const s = S.screenPos({ boulder: bi }); return { x: s.x, y: s.y, by: 'rock' + bi }; }
      const s = __T.view.project(hp.x, hp.y + 2.5, hp.z); return { x: s.x, y: s.y, by: 'hero' };
    });
    const n0 = await G(() => window.__GAME_LOG.filter((e) => e.type === 'strike').length);
    await pg.touchscreen.tap(Math.max(8, Math.min(382, where.x)), Math.max(8, Math.min(836, where.y)));
    await pg.waitForFunction((n) => window.__GAME_LOG.filter((e) => e.type === 'strike').length > n, n0, { polling: 100, timeout: 9000 }).catch(() => {});
    const cur = await G(() => { const L = window.__GAME_LOG.filter((e) => e.type === 'strike'); const e = L[L.length - 1]; return e && e.d && e.d.job ? e.d.job : null; });
    if (!cur || cur[0] !== 'b') continue;
    const i = +cur.slice(1);
    if (seen.has(i)) continue;
    seen.add(i);
    await frame();
    const m = await G((i) => {
      const S = __T.stages, cam = __T.camera, W = innerWidth, H = innerHeight;
      const s = S.screenPos({ boulder: i }), bh = __T.game.state.bh;
      const B = (S.boulderSpots ? S.boulderSpots() : [[-172, -122, 8.6], [-96, -132, 7.4], [-24, -118, 9.2], [60, -110, 7.8], [128, -84, 8.4], [178, -30, 7.6], [186, 40, 8.8], [124, 112, 7.4], [34, 124, 8.4], [-58, 118, 7.8], [-142, 124, 8.6], [-240, -30, 9]])[i];
      const g = S.groundAt(B[0], B[1]), ty = g + B[2] * 0.6, P = cam.position;
      let clear = 1e9; for (let k = 1; k < 48; k++) { const u = k / 48, x = P.x + (B[0] - P.x) * u, y = P.y + (ty - P.y) * u, z = P.z + (B[1] - P.z) * u; if (Math.hypot(x - B[0], z - B[1]) < B[2] * 1.1) break; clear = Math.min(clear, y - S.groundAt(x, z)); }
      const hp = S.hero.position, hs = S.screenPos({ x: hp.x, y: hp.y + 2.4, z: hp.z }) || {};
      return { i, x: Math.round(s.x), y: Math.round(s.y), on: s.on, safe: s.on && s.x > 20 && s.x < W - 20 && s.y > 130 && s.y < H - 150, clear: +clear.toFixed(1), dist: Math.round(P.distanceTo({ x: B[0], y: ty, z: B[1], })), hero: [Math.round(hs.x), Math.round(hs.y)], left: bh.filter((v) => v > 0).length };
    }, i);
    m.by = where.by; rows.push(m);
    console.log(`   boulder ${i} (${seen.size}/12, tap on ${where.by}): screen ${m.x},${m.y} safe ${m.safe} · line of sight clears the hill by ${m.clear} amot · camera ${m.dist} amot away`);
    await shot(`${out}/${tag}-b${String(seen.size).padStart(2, '0')}-${i}.png`);
  }
  const all = rows.length === 12, safe = rows.filter((r) => r.safe && r.clear > 0.5);
  check(`[${tag}] every boulder struck by touch`, all, `${rows.length}/12`);
  check(`[${tag}] every boulder on screen, clear of the HUD and not hidden by the hill when struck`, all && safe.length === 12, rows.filter((r) => !(r.safe && r.clear > 0.5)).map((r) => `b${r.i}: ${r.x},${r.y} clear ${r.clear}`).join(' · '));
  check(`[${tag}] the camera stays close (≤ 190 amot) at every boulder`, rows.every((r) => r.dist <= 190), rows.map((r) => r.dist).join(','));
  // ── site9 ── (wave 9) the walls' frame after the rocks (DESIGN8B M7/M8, BRIEF9 item 2): no more taps — wait for the Mount's
  // walls phase and the camera's flight, then the builder's banker, the stock, the crane and the course's next slot must be on
  // screen and in clear sight (v17: bare ground — the first course lay in a trench under the terrain), the camera close
  if (all) {
    for (let k = 0; k < 60; k++) { const p = await G(() => __T.game.state.st.har && __T.game.state.st.har.p); if (p && p !== 'dig' && p !== 'survey') break; await pg.waitForTimeout(500); }
    await pg.waitForTimeout(4000);
    // (the game on this branch alone does not re-aim after the rocks; the merged game's workCam / focus does: the frame here is
    //  the one the game gets from the world's W.focus('har') — the working bay from the hill's side)
    await G(() => { __T.stages.focus('har', 1200); });
    await pg.waitForTimeout(2600);
    await frame();
    const fl = await G(() => { const S = __T.stages, sl = S.nextSlot('har'), P = __T.camera.position, c = S._dbg.crane, U = S._dbg.hill.U.uPit.value, v = S.wallView('har');
      const r = (a) => a.map((q) => +(+q).toFixed(1));
      return { cam: r([P.x, P.y, P.z]), view: v && r(v.p), t: v && r(v.t), slot: sl && r([sl.x, sl.y, sl.z, sl.course, sl.index]), crane: r([c.bx, c.bz]), bay: r([U.x, U.y, U.z, U.w]), lift: !!c.lift }; });
    console.log(`   after focus('har'): ${JSON.stringify(fl)}`);
    // the frame itself: the world's walls view, set exactly (the game's flight to it can be re-aimed by the game on this branch)
    await G(() => { const v = __T.stages.wallView('har'); if (v) __T.look(v.p, v.t); });
    await frame();
    const wm = await G(() => {
      const S = __T.stages, W = innerWidth, H = innerHeight, P = __T.camera.position;
      const on = (x, y, z) => { const s = __T.view.project(x, y, z), o = { x: Math.round(s.x), y: Math.round(s.y) }; o.on = !!s.on && o.x > 10 && o.x < W - 10 && o.y > 60 && o.y < H - 60; o.clear = !S.occluded(x, y, z, P); return o; };
      const sl = S.nextSlot('har'), b = S.workSpot('har', 'dress'), st = S.workSpot('har', 'stock'), cr = S._dbg.crane, hp = S.hero.position;
      return { phase: __T.game.state.st.har.p, slot: sl ? on(sl.x, sl.y + sl.h / 2, sl.z) : null, banker: b && b.stone ? on(b.stone.x, b.stone.y + 0.5, b.stone.z) : null,
        stock: st ? on(st.x, st.y + 1, st.z) : null, crane: cr && cr.g ? on(cr.g.position.x, cr.g.position.y + 8, cr.g.position.z) : null, hero: on(hp.x, hp.y + 2, hp.z),
        dist: sl ? Math.round(P.distanceTo({ x: sl.x, y: sl.y, z: sl.z })) : null, bay: +S._dbg.hill.U.uPitK.value.toFixed(2),
        distBanker: b && b.stone ? Math.round(P.distanceTo({ x: b.stone.x, y: b.stone.y, z: b.stone.z })) : null, slotY: sl ? +sl.y.toFixed(1) : null };
    });
    console.log(`   walls' frame: ${JSON.stringify(wm)}`);
    await shot(`${out}/${tag}-walls.png`);
    const ok = (o) => o && o.on && o.clear;
    check(`[${tag}] after the rocks the walls' frame (the working bay) holds the builder's banker and the stock, on screen and clear`, wm.bay > 0.9 && ok(wm.banker) && ok(wm.stock), `phase ${wm.phase}, bay ${wm.bay}`);
    check(`[${tag}] the walls' camera is at working distance (≤ 120 amot from the banker)`, wm.distBanker !== null && wm.distBanker <= 120, String(wm.distBanker));
    // (wave 9's red: course 0's first front-0 slots lay at y −124 and the crane, posed while the bay was dug, hung at the hill's
    //  old surface — FLOW10, wave 10: the player's slot is the east face's own stone in the bay (stages.js harSlotOk), the
    //  crane posed again once the bay is dug)
    check(`[${tag}] the next slot and the crane in the same frame`, ok(wm.slot) && ok(wm.crane), `slot y ${wm.slotY} → screen ${wm.slot && wm.slot.y}, crane ${wm.crane && wm.crane.y}`);
  }
  check(`[${tag}] no page errors`, !logs.length, logs.slice(0, 3).join(' | '));
  // one contact sheet of the strikes
  const files = fs.readdirSync(out).filter((f) => f.startsWith(tag + '-b')).sort();
  if (files.length) {
    const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(6,195px);gap:2px">${files.map((f) => `<div style="position:relative"><img src="data:image/png;base64,${fs.readFileSync(path.resolve(out, f)).toString('base64')}" style="width:195px;height:422px;display:block"><span style="position:absolute;top:4px;left:4px;color:#fff;background:#000a;font:14px sans-serif;padding:2px 4px">${f.replace(tag + '-', '').replace('.png', '')}</span></div>`).join('')}</body>`;
    const p2 = await b.newPage({ viewport: { width: 6 * 197, height: Math.ceil(files.length / 6) * 424 } });
    await p2.setContent(html); await p2.waitForTimeout(400);
    await p2.screenshot({ path: `${out}/${tag}-sheet.png` });
  }
  fs.writeFileSync(`${out}/${tag}.json`, JSON.stringify(rows, null, 1));
  await b.close();
  const bad = results.filter((r) => !r.ok).length;
  console.log(bad ? `${bad} FAIL` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
