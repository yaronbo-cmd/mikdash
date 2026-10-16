// SITE12 (wave 12) — the owner's note 2 (29.9, 21:01): "בשלב שיטוח ההר צריך שכשעשים זום אאוט רואים את ההתקדמות של החציבה. אני
// בשלב 3 עכשיו וזה נראה בדיוק כמו בשלב ראשון". The Mount at the end of each of its 6 courses (content.js PROJ.har = 6 × 32; the
// game sends a logical stone k of 192 as round(k / 192 × stones), index.js syncSite), shot whole from FIXED cameras, and the
// difference between consecutive courses measured on the Mount's own pixels (the platform's footprint projected on the screen).
// A second shot at the same course a few seconds later gives the noise floor (the crews, the carts, the crane move).
// No game: the world is driven directly (the real-touch runs are site_mount.cjs / site_wall_touch.cjs).
// Usage: node test/site_mount_courses.cjs [dist/test.html] [--out=test/out/site12/courses] [--cams=olives,pinch,se] [--min=3]
// Pass: every consecutive pair of courses differs on ≥ --min % of the Mount's pixels at the 'olives' and 'pinch' cameras, and
//       more than twice the noise floor; the working frame's draw calls ≤ 150; no page errors.
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
const sharp = require('sharp');
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const file = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dist/test.html');
const OUT = path.resolve(A.out || 'test/out/site12/courses'), MIN = +(A.min || 3);
const CAMS = (A.cams || 'olives,pinch,pinch14,se').split(',');
fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844;

async function diff(a, b, mask) {
  const [ra, rb] = await Promise.all([sharp(a).removeAlpha().raw().toBuffer(), sharp(b).removeAlpha().raw().toBuffer()]);
  let n = 0, ch = 0;
  for (let i = 0, p = 0; p < W * H; p++, i += 3) {
    if (!mask[p]) continue;
    n++;
    const d = Math.abs(ra[i] - rb[i]) + Math.abs(ra[i + 1] - rb[i + 1]) + Math.abs(ra[i + 2] - rb[i + 2]);
    if (d > 36) ch++;
  }
  return { n, pct: n ? (100 * ch) / n : 0 };
}
function polyMask(poly, m = new Uint8Array(W * H)) {   // screen polygon (px) → a W×H mask (even-odd scanline)
  const y0 = Math.max(0, Math.floor(Math.min(...poly.map((p) => p[1])))), y1 = Math.min(H - 1, Math.ceil(Math.max(...poly.map((p) => p[1]))));
  for (let y = y0; y <= y1; y++) {
    const xs = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[j];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k])); x < Math.min(W, xs[k + 1]); x++) m[y * W + x] = 1;
  }
  return m;
}
// the Mount's pixels: the platform's ground as a grid of cells projected on the screen (a cell with a corner behind the camera
// is skipped), minus the viewer's top card and bottom buttons
function mountMask(cells) {
  const m = new Uint8Array(W * H);
  for (const q of cells) polyMask(q, m);
  for (let y = 0; y < H; y++) if (y < 96 || y > 724) for (let x = 0; x < W; x++) m[y * W + x] = 0;
  return m;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 400000 });
  const info = await pg.evaluate(() => {
    __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none';
    const S = __T.stages; __T.buildMode();
    S.setStage('har', 'building', 0.08); S.setWork('har', { phase: 'dig' }); S.setBoulders(new Array(12).fill(0)); __T.step(40, 0.2);
    const I = S.siteInfo('har'); return { stones: I.stones, courses: I.courses };
  });
  console.log('har', JSON.stringify(info));
  const res = { courses: [], pairs: {}, noise: {}, calls: [] };
  let pinch = null;
  // (pinch14: the same ray twice as far, ≈ 980 amot — a deeper pinch-out, where the crest comes into the frame's lower half)
  const far = (k) => pinch && { p: pinch.t.map((t, i) => t + (pinch.p[i] - t) * k), t: pinch.t };
  const camOf = (k) => (k === 'olives' ? { p: [601, 301, -215], t: [-60, 20, 0] } : k === 'se' ? { p: [540, 420, 640], t: [-20, -20, -10] } : k === 'top' ? { p: [-10, 1150, 180], t: [-10, 0, -20] } : k === 'pinch14' ? far(2) : pinch);
  const shots = {};
  for (let c = 0; c <= 6; c++) {
    const r = await pg.evaluate(({ c, N }) => {
      const S = __T.stages;
      S.setWork('har', { phase: c ? 'courses' : 'foundation', stones: Math.round((c / 6) * N), stock: 8 });
      // (a whole course set at once ripples in with a dust burst at every stone: let it land and the dust settle — in play the
      //  crews set the stones one by one)
      __T.step(10, 0.1); S.hero.place('har'); __T.step(30, 0.25);
      const st = S.status('har'), v = S.wallView('har');
      return { shown: st.shown, set: S.siteInfo('har').set, cut: S._dbg && S._dbg.hill ? S._dbg.hill.U.uCut.value : null, wall: v };
    }, { c, N: info.stones });
    if (!pinch && r.wall) {   // the owner's pinch-out: the working frame's own ray, 7× farther (≈ 490 amot), fixed from course 1 on
      const { p, t } = r.wall, k = 7; pinch = { p: [t[0] + (p[0] - t[0]) * k, t[1] + (p[1] - t[1]) * k, t[2] + (p[2] - t[2]) * k], t: t.slice() };
    }
    // the working frame's draw calls (the phone view the game flies to)
    if (r.wall) { const d = await pg.evaluate((v) => { __T.look(v.p, v.t); __T.render(); return __T.drawCalls(); }, r.wall); res.calls.push(d.total); }
    res.courses.push({ c, shown: +r.shown.toFixed(4), set: r.set });
    for (const k of CAMS) {
      const cam = camOf(k); if (!cam) continue;
      const cells = await pg.evaluate((cam) => {
        __T.look(cam.p, cam.t); __T.render(); __T.render();
        // the platform's ground (x −300…277, z −480…400) as 24 × 36 cells at the drawn height, projected
        const cv = __T.camera, V = __T.Vector3, S = __T.stages, nx = 24, nz = 36, pts = [];
        cv.updateMatrixWorld(); cv.updateProjectionMatrix();
        for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
          const x = -300 + (577 * i) / nx, z = -480 + (880 * j) / nz, y = S.groundAt ? S.groundAt(x, z) : 0;
          const v = new V(x, y, z).applyMatrix4(cv.matrixWorldInverse);
          if (v.z > -1) { pts.push(null); continue; }
          v.applyMatrix4(cv.projectionMatrix); pts.push([(v.x + 1) * 195, (1 - v.y) * 422]);
        }
        const out = [];
        for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
          const a = pts[j * (nx + 1) + i], b = pts[j * (nx + 1) + i + 1], c2 = pts[(j + 1) * (nx + 1) + i + 1], d = pts[(j + 1) * (nx + 1) + i];
          if (a && b && c2 && d) out.push([a, b, c2, d]);
        }
        return out;
      }, cam);
      const f = path.join(OUT, `${k}-c${c}.png`);
      await pg.screenshot({ path: f, timeout: 300000 });
      shots[k + c] = { f, mask: mountMask(cells) };
      if (c === 3) {   // the noise floor: the same course 4 s later
        await pg.evaluate(() => { __T.step(4, 0.1); __T.render(); __T.render(); });
        const f2 = path.join(OUT, `${k}-c${c}-again.png`);
        await pg.screenshot({ path: f2, timeout: 300000 });
        res.noise[k] = +(await diff(f, f2, shots[k + c].mask)).pct.toFixed(2);
      }
    }
    console.log(`course ${c}: shown ${r.shown.toFixed(3)} set ${r.set} cut ${r.cut} calls ${res.calls[res.calls.length - 1]}`);
  }
  let pass = true;
  for (const k of CAMS) {
    res.pairs[k] = [];
    for (let c = 1; c <= 6; c++) {
      const a = shots[k + (c - 1)], bb = shots[k + c]; if (!a || !bb) continue;
      const mk = new Uint8Array(W * H); for (let i = 0; i < mk.length; i++) mk[i] = a.mask[i] | bb.mask[i];
      const d = await diff(a.f, bb.f, mk);
      res.pairs[k].push(+d.pct.toFixed(2));
      if ((k === 'olives' || k === 'pinch' || k === 'pinch14') && c >= 1 && (d.pct < MIN || d.pct < 2 * (res.noise[k] || 0))) pass = false;
    }
    console.log(`${k}: course→course changed % of the Mount's pixels ${JSON.stringify(res.pairs[k])} (noise ${res.noise[k]})`);
  }
  // a contact sheet per camera: courses 0…6 side by side
  for (const k of CAMS) {
    const fs0 = [0, 1, 2, 3, 4, 5, 6].map((c) => shots[k + c] && shots[k + c].f).filter(Boolean); if (!fs0.length) continue;
    const tw = 195, th = 422;
    const tiles = await Promise.all(fs0.map((f) => sharp(f).resize(tw, th).toBuffer()));
    await sharp({ create: { width: tw * tiles.length, height: th, channels: 3, background: '#000' } }).composite(tiles.map((t, i) => ({ input: t, left: i * tw, top: 0 }))).png().toFile(path.join(OUT, `sheet-${k}.png`));
  }
  if (Math.max(...res.calls) > 150) pass = false;
  if (errs.length) pass = false;
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 1));
  console.log(`draw calls at the working frame: ${res.calls.join(' ')}`);
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(pass ? 'ALL PASS' : 'FAIL');
  await b.close();
  process.exit(pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
