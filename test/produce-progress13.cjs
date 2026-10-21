// PRODUCER13a (wave 13, the owner's note 4, 30.9 11:12: "לוודא שבכל שלבי הבנייה נראית ההתקדמות של הבניה כי בעזרת נשים ומצורעים
// לא בטוח שראיתי את זה"): every stage at the end of each of its courses, then its finish at half and whole, from the SAME cameras
// every time — the stage's own working frame (the world's wallView / siteWorkView, fixed at course 1), that frame's ray 3× farther
// (a child's zoom-out), and the course beat's frame (index.js courseBeat: over the next slot, 70 amot, az+34°, 44° up; at the
// Mount the whole-Mount courseView). Every stage before it is built. No game: the world is driven directly (as
// site_mount_courses.cjs), so this measures what the world SHOWS for a count, not the play (the play is produce-play --demoPick).
//   node test/produce-progress13.cjs [--stages=nashim,lishka] [--cams=work,wide,beat] [--tag=pg1]
// Writes test/out/produce/<tag>-<stage>-c<k>-<cam>.png, one sheet per stage and camera (<tag>-sheet-<stage>-<cam>.png) and prints
// the % of the frame changed from one step to the next (the produce-sheet measure: a pixel moved > 36 levels in RGB, y 100…760).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const sharp = require('sharp');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const ROOT = path.resolve(__dirname, '..');
try { const f = path.join(__dirname, 'out/produce', (A.tag || 'pg') + '.args.json'); if (fs.existsSync(f)) { Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); console.log('args from ' + f + ': ' + JSON.stringify(A)); } } catch (e) { console.log('args file: ' + e.message); }   // (re-planned while queued)
const file = path.resolve(A.url || path.join(ROOT, 'dist/test.html'));
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const TAG = A.tag || 'pg';
const SRC = fs.readFileSync(path.join(ROOT, 'src/game/content.js'), 'utf8');
const STG = [...SRC.matchAll(/^\s*S\('(\w+)', '([^']+)', (\d), \[([^\]]*)\], (\d+)/gm)].map((m) => ({ id: m[1], n: m[2] }));
const PJ = Object.fromEntries([...SRC.matchAll(/^\s*(\w+): J\((\d+), (\d+),/gm)].map((m) => [m[1], { C: +m[2], P: +m[3] }]));
const ONLY = A.stages ? String(A.stages).split(',') : STG.map((s) => s.id);
const CAMS = String(A.cams || 'work,wide,beat').split(',');
const W = 390, H = 844, Y0 = 100, Y1 = 760;
const T0 = Date.now(); const sec = () => Math.round((Date.now() - T0) / 1000);
async function pct(a, b) {
  const [ra, rb] = await Promise.all([a, b].map((f) => sharp(f).extract({ left: 0, top: Y0, width: W, height: Y1 - Y0 }).removeAlpha().raw().toBuffer()));
  let n = 0; for (let k = 0; k < ra.length; k += 3) if (Math.abs(ra[k] - rb[k]) + Math.abs(ra[k + 1] - rb[k + 1]) + Math.abs(ra[k + 2] - rb[k + 2]) > 36) n++;
  return Math.round((1000 * n) / (ra.length / 3)) / 10;
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 400000 });
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  const res = {};
  for (const id of ONLY) {
    if (Date.now() - T0 > +(A.budget || 540) * 1000) { console.log(`${sec()}s no time for ${id}`); break; }
    const P = PJ[id]; if (!P) continue;
    const idx = STG.findIndex((s) => s.id === id), before = STG.slice(0, idx).map((s) => s.id);
    // (the courses a child compares: the start, the first two, the middle, the last; the finish whole — and at half where it adds
    //  its own items, the women's court's gallery and corner chambers)
    const cs = A.all || (A.allFor && String(A.allFor).split(',').includes(id)) ? [...Array(P.C + 1).keys()] : [...new Set((A.few ? [0, 1, Math.round(P.C / 2), P.C] : [0, 1, 2, Math.round(P.C / 2), P.C]).filter((c) => c <= P.C))].sort((a, b) => a - b);
    const steps = cs.map((c) => ({ k: `c${c}`, o: { phase: c ? 'courses' : 'foundation', c } })).concat((id === 'nashim' || A.f50 ? [{ k: 'f50', o: { phase: 'finish', f: 0.5 } }] : []).concat([{ k: 'f100', o: { phase: 'finish', f: 1 } }]));
    const info = await pg.evaluate(({ id, before }) => {
      const S = __T.stages; __T.buildMode();
      for (const x of before) S.setStage(x, 'done', 1, { instant: true });
      if (id !== 'har') { S.setBoulders(new Array(12).fill(0)); }
      S.setStage(id, 'building', 0.05, { instant: true }); S.setWork(id, { phase: 'foundation', stones: 0, stock: 8, instant: true }); __T.step(8, 0.2);
      const I = S.siteInfo(id); return { stones: I ? I.stones : 0, courses: I ? I.courses : 0 };
    }, { id, before });
    const cams = {}; const shots = {}; res[id] = { info, pairs: {} };
    console.log(`${sec()}s ${id}: ${JSON.stringify(info)} · before ${before.length} built`);
    for (const st of steps) {
      const t1 = Date.now();
      const r = await pg.evaluate(({ id, o, N, C, A_STEP }) => {
        const S = __T.stages;
        const w = o.phase === 'finish' ? { phase: 'finish', stones: N, stock: 0, finish: o.f } : { phase: o.phase, stones: Math.round((o.c / C) * N), stock: 8 };
        S.setWork(id, w); __T.step(+(A_STEP[0]), 0.1); try { S.hero.place(id); } catch (e) { /* */ } __T.step(+(A_STEP[1]), 0.3);
        const v = (S.siteWorkView && S.siteWorkView(id)) || (S.wallView && S.wallView(id));
        let beat = null;
        try {
          const cv0 = id !== 'har' && S.courseView ? S.courseView(id) : null;   // (PRODUCER13: DIRECTOR13's beat — courseBeatView — at every walled site)
          if (cv0 && Array.isArray(cv0.p) && Array.isArray(cv0.t)) beat = { p: cv0.p, t: cv0.t };
          else if (id === 'har' && S.courseView) { const cv = S.courseView(id); if (cv && typeof cv.x === 'number') { const a = (cv.az * Math.PI) / 180, e = (cv.el * Math.PI) / 180; beat = { p: [cv.x + Math.cos(e) * Math.cos(a) * cv.dist, cv.y + Math.sin(e) * cv.dist, cv.z + Math.cos(e) * Math.sin(a) * cv.dist], t: [cv.x, cv.y, cv.z] }; } }
          else { const sl = S.nextSlot(id), bk = S.workSpot(id, 'dress'); if (sl && Array.isArray(sl.n) && bk && typeof bk.x === 'number') { const x = bk.x * 0.4 + sl.face[0] * 0.6, z = bk.z * 0.4 + sl.face[2] * 0.6, y = Math.max(S.groundAt(x, z), sl.y) + 2; const az = Math.atan2(-sl.n[1], -sl.n[0]) + (34 * Math.PI) / 180, el = (44 * Math.PI) / 180; beat = { p: [x + Math.cos(el) * Math.cos(az) * 70, y + Math.sin(el) * 70, z + Math.cos(el) * Math.sin(az) * 70], t: [x, y, z] }; } }
        } catch (e) { beat = null; }
        // (a child's look from above: the site's footprint centre, from 1.6× its span up and to the south, 60° down)
        let top = null; try { const c = S.siteCenter(id); const d = S._dbg && S._dbg.ST && S._dbg.ST[id] && S._dbg.ST[id].fb; const span = d ? Math.max(d.x1 - d.x0, d.z1 - d.z0) : 150; top = { p: [c.x, c.y + span * 1.35, c.z + span * 0.75], t: [c.x, c.y, c.z] }; } catch (e) { top = null; }
        const I = S.siteInfo(id);
        return { v, beat, top, set: I ? I.set : null, shown: S.status(id) ? +S.status(id).shown.toFixed(3) : null };
      }, { id, o: st.o, N: info.stones, C: P.C, A_STEP: String(A.steps || '3,6').split(',') });
      if (!cams.work && r.v && st.k !== 'c0') { cams.work = { p: r.v.p, t: r.v.t }; cams.wide = { p: r.v.t.map((t, i) => t + (r.v.p[i] - t) * 3), t: r.v.t }; }
      if (!cams.work && r.v && st.k === 'c0') { cams.work0 = { p: r.v.p, t: r.v.t }; }
      for (const k of (A.camsFor && A.camsFor[id] ? String(A.camsFor[id]).split(',') : CAMS)) {
        if (k === 'top' && r.top && !cams.top) cams.top = r.top;   // (fixed at the first step)
        const cam = k === 'beat' ? r.beat : cams[k] || (k === 'work' ? cams.work0 : k === 'wide' && cams.work0 ? { p: cams.work0.t.map((t, i) => t + (cams.work0.p[i] - t) * 3), t: cams.work0.t } : null);
        if (!cam) continue;
        const f = path.join(OUT, `${TAG}-${id}-${st.k}-${k}.png`);
        await pg.evaluate((c) => { __T.look(c.p, c.t); __T.render(); __T.render(); }, cam);
        await pg.screenshot({ path: f, timeout: 240000 });
        (shots[k] = shots[k] || []).push({ k: st.k, f });
      }
      console.log(`${sec()}s   ${id} ${st.k}: set ${r.set} shown ${r.shown} (${Math.round((Date.now() - t1) / 100) / 10} s)`);
    }
    for (const k of Object.keys(shots)) {
      const L = shots[k]; const d = [];
      for (let i = 1; i < L.length; i++) d.push(await pct(L[i - 1].f, L[i].f));
      res[id].pairs[k] = d;
      const tw = 130, th = Math.round((Y1 - Y0) / 3), lab = 18;
      const tiles = await Promise.all(L.map((x) => sharp(x.f).extract({ left: 0, top: Y0, width: W, height: Y1 - Y0 }).resize(tw, th).png().toBuffer()));
      const width = L.length * (tw + 3) + 3, height = th + lab + 16;
      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font:bold 11px sans-serif;fill:#222}</style>${L.map((x, i) => `<text x="${4 + i * (tw + 3)}" y="13">${x.k}${i ? ' Δ' + d[i - 1] + '%' : ''}</text>`).join('')}<text x="4" y="${height - 3}" style="font:10px sans-serif">${TAG} · ${id} · camera ${k}</text></svg>`;
      const out = path.join(OUT, `${TAG}-sheet-${id}-${k}.png`);
      await sharp({ create: { width, height, channels: 3, background: '#f4efe4' } }).composite([{ input: Buffer.from(svg), top: 0, left: 0 }, ...tiles.map((t, i) => ({ input: t, top: lab, left: 3 + i * (tw + 3) }))]).png().toFile(out);
      console.log(`${sec()}s SHEET ${path.relative(ROOT, out)} · Δ% ${d.join(' · ')}`);
    }
    fs.writeFileSync(path.join(OUT, `${TAG}-progress.json`), JSON.stringify(res, null, 1));
  }
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
