// ── build 101 ── tools/audit101.cjs — THE WORLD AS A PLAYER SEES IT, OVER TIME (the owner, 4.11 23:55: "דמות כפולה שהולכת בהבהוב… המדרגות
// עומדות באוויר… כל 5 שניות עולה דמות ונבלעת לתוך האדמה"). Opens each stage on out/index.html, skips the opening, and samples the
// frame N times: every real figure (people88 / the hero) — its feet against the floor under it (a ray down through the solid meshes),
// two figures on one spot, a figure that blinks (shown, hidden, shown); the world's instanced "far" figures (actors.js) in view; and every
// small prop of the stage (under the har42 group) whose foot hangs over the floor. Writes OUT/report.json and a shot per stage.
//   node tools/audit101.cjs OUT [stages=01,02,…] [W H] [samples] — needs Playwright and the browser at /opt/pw-browsers/chromium
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [OUT = 'audit101', LIST = '01,02,03,04,05,06,07', VW = '1374', VH = '902', NS = '24'] = process.argv.slice(2);
const Q = { '01': 'h42stock=99', '02': 'h45go=1&h42stock=99', '03': 'h46go=1&h42stock=99', '04': 'h47go=1&h42stock=99', '05': 'h48go=1&h42stock=99', '06': 'h49go=1&h42stock=99', '07': 'h50go=1&h42stock=99', '08': 'h55go=1&h42stock=99', '09': 'h56go=1&h42stock=99', '10': 'h57go=1&h42stock=99' };
const PAGE = 'file://' + path.resolve(__dirname, '../out/index.html');
/* the probe (in the page): one sample */
const PROBE = () => {
  const T = globalThis.__T, sc = T.scene, V = T.Vector3, A = (globalThis.__A101 = globalThis.__A101 || { n: 0, fig: {}, dup: 0, dupAt: [], act: 0, props: {} });
  A.n++;
  const vis = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const isFig = (o) => { for (let p = o; p; p = p.parent) if (p.children && p.children.some((c) => c.isSkinnedMesh)) return true; return false; };
  const solids = []; sc.traverse((m) => { if (m.isMesh && !m.isSkinnedMesh && !m.isInstancedMesh && vis(m) && m.material && !Array.isArray(m.material) && !(m.material.transparent && m.material.opacity < 0.6) && !m.material.isMeshBasicMaterial && !isFig(m)) solids.push(m); });
  const rc = new T.Raycaster(), down = new V(0, -1, 0), floorAt = (x, y, z, skip) => { rc.set(new V(x, y, z), down); rc.far = 80; const h = rc.intersectObjects(solids, false).find((q) => q.object !== skip); return h ? h.point.y : null; };
  const cam = T.camera, fr = new (T.camera.constructor === Object ? Object : Object)();
  const hero = sc.getObjectByName('kohen35'), H0 = hero ? hero.getWorldPosition(new V()) : cam.position.clone(); const inView = (p) => Math.hypot(p.x - H0.x, p.z - H0.z) < 70;
  const figs = [], seen = new Set();
  sc.traverse((m) => {
    if (!m.isSkinnedMesh || !m.skeleton || seen.has(m.skeleton.bones[0])) return; seen.add(m.skeleton.bones[0]);
    let lo = 1e9, hip = null; const p = new V(); for (const b of m.skeleton.bones) { b.getWorldPosition(p); if (/foot|toe/i.test(b.name) && p.y < lo) lo = p.y; if (/hip|pelvis/i.test(b.name) && !hip) hip = p.clone(); }
    if (!hip || lo > 1e8 || Math.abs(hip.y) > 500) return;
    let r = m; while (r.parent && r.parent !== sc && !(r.parent.name && /people88|crew71|kohen35|har42/.test(r.parent.name))) r = r.parent;
    const id = r.uuid.slice(0, 8), v = vis(m) && inView(hip);
    const f = (A.fig[id] = A.fig[id] || { id, name: (r.name || '') + '<' + ((r.parent && r.parent.name) || ''), seen: '', maxGap: 0, at: null });
    f.seen += v ? '1' : '0';
    if (v) { const fl = floorAt(hip.x, lo + 3, hip.z); const g = fl == null ? null : lo - fl; if (g != null && Math.abs(g) > Math.abs(f.maxGap)) { f.maxGap = +g.toFixed(2); f.at = [+hip.x.toFixed(1), +lo.toFixed(2), +hip.z.toFixed(1)]; } figs.push({ id, x: hip.x, z: hip.z, y: lo }); }
  });
  for (let i = 0; i < figs.length; i++) for (let j = i + 1; j < figs.length; j++) if (Math.hypot(figs[i].x - figs[j].x, figs[i].z - figs[j].z) < 0.35 && Math.abs(figs[i].y - figs[j].y) < 0.4) { A.dup++; if (A.dupAt.length < 6) A.dupAt.push([+figs[i].x.toFixed(1), +figs[i].z.toFixed(1)]); }
  // the world's instanced figures (actors.js): how many stand in view
  let act = 0; const M = new (T.camera.matrixWorld.constructor)(), q = new V();
  sc.traverse((m) => { if (m.isInstancedMesh && /^actor-/.test(m.name) && vis(m)) for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, M); q.setFromMatrixPosition(M).applyMatrix4(m.matrixWorld); if (M.elements[0] !== 0 && inView(q) && true) { act++; if (figs.some((f) => Math.hypot(f.x - q.x, f.z - q.z) < 0.7)) { A.dup++; if (A.dupAt.length < 6) A.dupAt.push(['actor', +q.x.toFixed(1), +q.z.toFixed(1)]); } } } });
  A.act = Math.max(A.act, act);
  // the stage's small props: a foot over the floor
  const root = sc.getObjectByName('har42');
  if (root) root.traverse((m) => {
    if (!m.isMesh || m.isSkinnedMesh || !vis(m) || isFig(m)) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld), s = bb.getSize(new V());
    if (s.y > 8 || s.x > 14 || s.z > 14 || s.y < 0.05) return; const c = bb.getCenter(new V()); if (!inView(c)) return;
    const fl = floorAt(c.x, bb.min.y + 0.02, c.z, m); if (fl == null) return; const g = bb.min.y - fl;
    if (g > 0.3) { const k = (m.name || m.geometry.type) + '@' + c.x.toFixed(0) + ',' + c.z.toFixed(0); const o = A.props[k] || (A.props[k] = { k, gap: 0, n: 0, size: [+s.x.toFixed(1), +s.y.toFixed(1), +s.z.toFixed(1)] }); o.n++; o.gap = Math.max(o.gap, +g.toFixed(2)); }
  });
  return A.n;
};
const SUM = () => { const A = globalThis.__A101; const figs = Object.values(A.fig); const blink = figs.filter((f) => /1+0+1/.test(f.seen)); const off = figs.filter((f) => Math.abs(f.maxGap) > 0.3);
  return { samples: A.n, figures: figs.length, blink: blink.map((f) => f.name + ' ' + f.seen), offFloor: off.map((f) => ({ n: f.name, gap: f.maxGap, at: f.at })), doubles: A.dup, doubleAt: A.dupAt, farFiguresInView: A.act, props: Object.values(A.props).filter((p) => p.n >= 2).sort((a, b) => b.gap - a.gap).slice(0, 20) }; };
(async () => {
  fs.mkdirSync(OUT, { recursive: true }); const rep = {};
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  for (const id of LIST.split(',')) {
    const ctx = await b.newContext({ viewport: { width: +VW, height: +VH } });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await ctx.addInitScript(() => { window.__DT_MAX = 0.5; window.__CAMSNAP = 1; try { localStorage.clear(); } catch (e) { /* */ } });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    try {
      await pg.goto(`${PAGE}?h63site=1&${Q[id]}`, { waitUntil: 'load', timeout: 180000 });
      await pg.waitForFunction(() => globalThis.__H42 && globalThis.__H42.on, null, { timeout: 300000, polling: 1000 });
      for (let k = 0; k < 90; k++) { await pg.evaluate(() => document.querySelectorAll('.h42-card button').forEach((x) => x.click())).catch(() => {}); if (await pg.evaluate(() => globalThis.__H42.site63 && globalThis.__H42.site63())) break; await pg.waitForTimeout(1000); }
      for (let k = 0; k < 90; k++) { const part = await pg.evaluate(() => { [...document.querySelectorAll('.h42-skip')].filter((x) => x.offsetParent).forEach((x) => x.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); const s = globalThis.__H42.state(); return s.part + '|' + !!globalThis.__T.flying; }); if (k > 3 && !/^open|^voy/.test(part)) break; await pg.waitForTimeout(2000); }
      await pg.waitForTimeout(5000); await pg.screenshot({ path: path.join(OUT, `${id}-a.png`), timeout: 180000 });
      for (let s = 0; s < +NS; s++) { await pg.evaluate(PROBE); await pg.waitForTimeout(450); }
      await pg.screenshot({ path: path.join(OUT, `${id}-b.png`), timeout: 180000 });
      rep[id] = await pg.evaluate(SUM); rep[id].part = await pg.evaluate(() => globalThis.__H42.state().part); rep[id].errors = errs.slice(0, 5);
    } catch (e) { rep[id] = { fail: String(e.message).slice(0, 300), errors: errs.slice(0, 5) }; }
    console.log(id, JSON.stringify(rep[id]).slice(0, 600)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(rep, null, 1));
    await ctx.close();
  }
  await b.close();
})();
