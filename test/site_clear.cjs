// SITE12 (wave 12) — PRODUCER-S11 top-10 #1 (N45, N47, N55): a clear line to the kohen at every work frame, the world's side.
// For each site and phase: the stages before it done, the site at that phase, the kohen placed where the game works him (the
// survey stake, the dig spot, his banker at the next slot, the finish spot), the camera at the site's working frame
// (stages.siteWorkView — what the plain focus flies to), then the producer's K80 check: on screen, ≥ 80 px for his 3.6 amot, and
// not HIDDEN — a ray from the camera to his head and one to his chest both stopped by a built mesh (named). Unlike a plain ray
// cast, a stage being built hides only up to its built height (the reveal shader discards the courses above it).
// Also N59: at the altar's stages the tool in his hand is never iron. One shot per case + a contact sheet.
// Usage: node test/site_clear.cjs [dist/test.html] [--out=test/out/site12/clear] [--only=lishka,yesod]
// (a queued run can be re-planned while it waits for its turn — the queue is first come, first served: test/out/site12/<this
//  test>.plan.json = {"exec": "<another test>.cjs", "argv": [...]} runs that one instead, once; the file is consumed)
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
let sharp = null; try { sharp = require('sharp'); } catch (e) { sharp = null; }
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const file = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dist/test.html');
const OUT = path.resolve(A.out || 'test/out/site12/clear');
fs.mkdirSync(OUT, { recursive: true });
const CASES = [
  ['nashim', 'survey'], ['nashim', 'dig'], ['nashim', 'courses', 0.3],
  ['nikanor', 'survey'], ['nikanor', 'dig'], ['nikanor', 'courses', 0.3],
  ['lishka', 'survey'], ['lishka', 'dig'], ['lishka', 'courses', 0.3], ['lishka', 'courses', 0.7],
  ['yesod', 'survey'], ['yesod', 'dig'], ['yesod', 'courses', 0.4],
  ['sovev', 'survey'], ['sovev', 'courses', 0.5],
  ['guf', 'survey'], ['guf', 'courses', 0.3], ['guf', 'courses', 0.8],
  ['karnot', 'survey'], ['karnot', 'courses', 0.5],
  ['kiyor', 'survey'], ['kiyor', 'dig'],
  ['ulam', 'survey'], ['ulam', 'dig'], ['ulam', 'courses', 0.2],
].filter((c) => !A.only || A.only.split(',').includes(c[0]));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 400000 });
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  const rows = [], files = [];
  let fail = 0;
  for (const [id, phase, frac, mode = 'world'] of CASES.flatMap((c) => (c[1] === 'dig' ? [c, [c[0], c[1], c[2], 'game']] : [c]))) {
    const r = await pg.evaluate(({ id, phase, frac, mode }) => {
      const S = __T.stages, IDS = S.ids, ST = S._dbg.ST;
      __T.buildMode();
      for (const s of IDS) { if (s === id) break; S.setStage(s, 'done', undefined, { instant: true }); }
      S.setStage(id, 'building', 0, { instant: true });
      const I = S.siteInfo(id);
      S.setWork(id, { phase, stones: phase === 'courses' ? Math.max(1, Math.round((frac || 0) * I.stones)) : 0, stock: 8 });
      __T.step(4, 0.1);
      const altar = ['yesod', 'sovev', 'guf', 'karnot'].includes(id);
      const kind = phase === 'survey' ? 'survey' : phase === 'courses' ? 'dress' : 'set';
      const w = S.workSpot(id, kind) || S.workSpot(id, 'set');
      if (!w) return { err: 'no spot' };
      S.hero.place({ x: w.x, z: w.z, face: w.face });
      S.hero.setTool(altar ? 'wood' : 'iron');
      __T.step(1.5, 0.1);
      const t0 = performance.now();
      let v = S.siteWorkView(id);
      // (game: FLOW11's closeFrame for a phase with no course to frame — index.js:843–856 — replayed: from outside the site, its
      //  top behind him, 50 amot, 26° up, the first of its 12 turns that S.frameBlocked calls clear, else the first)
      if (mode === 'game') {
        const at = { x: w.x, y: S.groundAt(w.x, w.z), z: w.z }, c = S.siteTop(id), d = 50, e0 = 26;
        const a0 = (c && Math.hypot(at.x - c.x, at.z - c.z) > 3 ? (Math.atan2(at.z - c.z, at.x - c.x) * 180) / Math.PI : 0) + 30, t = [at.x, at.y + 1.8, at.z];
        const pose = (az, el) => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180; return [at.x + Math.cos(e) * Math.cos(a) * d, at.y + 1.8 + Math.sin(e) * d, at.z + Math.cos(e) * Math.sin(a) * d]; };
        let p = pose(a0, e0), az = a0, el = e0;
        for (const [da, de] of [[0, 0], [40, 0], [-40, 0], [0, 12], [80, 0], [-80, 0], [40, 12], [-40, 12], [180, 0], [120, 8], [-120, 8], [0, 26]]) { const q = pose(a0 + da, e0 + de); if (!S.frameBlocked(q[0], q[1], q[2], t[0], t[1], t[2], id)) { p = q; az = a0 + da; el = e0 + de; break; } }
        v = { p, t, az, el };
      }
      const ms = Math.round(performance.now() - t0);   // (the frame's search, with its clear-line tests)
      if (!v) return { err: 'no frame' };
      __T.look(v.p, v.t); __T.render(); __T.render();
      const cam = __T.camera; cam.updateMatrixWorld();
      // (his feet where he is drawn: the hero mesh's own origin — at two altar surveys the API's position gave 50 px for a figure drawn
      //  ≈ 105 px tall; both are logged)
      const PA = S.hero.position, hm = S._dbg.hero && S._dbg.hero.mesh, P = hm ? hm.getWorldPosition(new __T.Vector3()) : PA.clone(), head = P.clone(); head.y += 3.6;
      const pr = (q) => { const u = q.clone().project(cam); return { x: (u.x + 1) / 2 * innerWidth, y: (1 - u.y) / 2 * innerHeight, front: u.z < 1 }; };
      const a = pr(P), bb = pr(head), px = Math.round(Math.abs(a.y - bb.y));
      const on = a.front && bb.x > 10 && bb.x < innerWidth - 10 && bb.y > 90 && a.y < innerHeight - 110;
      const stageOf = (o) => { for (let q = o; q; q = q.parent) if (q.name && q.name.startsWith('stage-')) return q.name.slice(6); return null; };
      const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
      const block = (pt) => {
        const rc = new __T.Raycaster(), dd = cam.position.distanceTo(pt); rc.set(cam.position, pt.clone().sub(cam.position).normalize()); rc.camera = cam;
        for (const x of rc.intersectObjects(__T.scene.children, true)) {
          const mt = Array.isArray(x.object.material) ? x.object.material[0] : x.object.material;
          if (!vis(x.object) || x.object.name === 'hill' || x.object.name === 'pave' || x.object.isPoints || x.object.isLine || x.object.isSprite || x.object.isSkinnedMesh || (mt && (mt.visible === false || mt.colorWrite === false || (mt.transparent && (mt.opacity < 0.5 || mt.depthWrite === false || mt.blending === 2)) || mt.opacity < 0.2))) continue;
          const sid = stageOf(x.object);
          if (sid && ST[sid] && ST[sid].status === 'building' && x.point.y > ST[sid].U.uY.value + 0.05) continue;   // (above its built height: not drawn)
          if (x.distance >= dd - 1.2) return null;
          return (x.object.name || x.object.type) + (sid ? '<' + sid : '') + ' d' + Math.round(x.distance);
        }
        return null;
      };
      const chest = P.clone(); chest.y += 2.2;
      const o1 = block(head), o2 = block(chest);
      return { px, on, hidden: !!(o1 && o2), occ: o1 && o2 ? o1 : null, graze: !(o1 && o2) && (o1 || o2) || null, dist: Math.round(cam.position.distanceTo(head)), held: S.hero.held, tool: S.hero.tool, el: v.el, az: Math.round(v.az), ms, apiOff: Math.round(PA.distanceTo(P) * 10) / 10 };
    }, { id, phase, frac, mode });
    // (N59) at the altar: the game's stroke of this phase (the dig's 'pick', a reset's 'split'), the tool in his hand during it and after
    if (!r.err && mode === 'world' && ['yesod', 'sovev', 'guf', 'karnot'].includes(id) && phase !== 'survey') {
      const k = await pg.evaluate(async ({ id, phase }) => {
        const S = __T.stages, seen = new Set(), kinds = phase === 'dig' ? ['pick'] : ['dress', 'split'];
        for (const kind of kinds) {
          let done = false; S.hero.act(kind, kind === 'dress' ? undefined : id, { shake: false }).then(() => { done = true; });
          for (let i = 0; i < 40 && !done; i++) { __T.step(0.05, 0.05); seen.add(S.hero.held); await new Promise((r) => setTimeout(r, 0)); }
          __T.step(1.2, 0.05); seen.add(S.hero.held);
        }
        return [...seen];
      }, { id, phase });
      r.strokes = k; if (k.some((t) => ['pick', 'hammer', 'sledge'].includes(t))) r.held = 'IRON in a stroke: ' + k.join('/');
    }
    const tag = `${id}-${phase}${frac !== undefined ? '-' + frac : ''}${mode === 'game' ? '-game' : ''}`;
    const f = path.join(OUT, `${tag}.png`);
    await pg.screenshot({ path: f, timeout: 300000 });
    files.push(f);
    const altar = ['yesod', 'sovev', 'guf', 'karnot'].includes(id);
    const iron = altar && (['pick', 'hammer', 'sledge'].includes(r.held) || /^IRON/.test(r.held || ''));
    const ok = !r.err && r.on && !r.hidden && r.px >= 80 && !iron;
    if (!ok) fail++;
    rows.push({ tag, ...r, ok });
    console.log(`${ok ? '✓' : '✗'} ${tag.padEnd(22)} ${r.err || `K80 ${r.on ? '' : 'OFF-FRAME '}${r.hidden ? 'HIDDEN(' + r.occ + ') ' : ''}${r.px}px d${r.dist} az${r.az} el${r.el}${r.graze ? ' graze:' + r.graze : ''} ${r.ms}ms${r.apiOff > 0.5 ? ' (api pos off ' + r.apiOff + ')' : ''}${altar ? ' held:' + r.held : ''}${iron ? ' IRON' : ''}`}`);
  }
  if (sharp && files.length) {
    const tw = 130, th = 281, cols = 9, rowsN = Math.ceil(files.length / cols);
    const tiles = await Promise.all(files.map((f) => sharp(f).resize(tw, th).toBuffer()));
    await sharp({ create: { width: tw * cols, height: th * rowsN, channels: 3, background: '#000' } }).composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * tw, top: Math.floor(i / cols) * th }))).png().toFile(path.join(OUT, 'sheet.png'));
  }
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(rows, null, 1));
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fail || errs.length ? `FAIL (${fail} of ${rows.length})` : `ALL PASS (${rows.length})`);
  await b.close();
  process.exit(fail || errs.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
