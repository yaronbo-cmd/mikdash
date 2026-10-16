// SITE13 (wave 13) — the owner, 30.9 11:12: "לוודא שבכל שלבי הבנייה נראית ההתקדמות של הבניה כי בעזרת נשים ומצורעים לא בטוח שראיתי
// את זה"; PRODUCER-S13a #6. site_mount_courses.cjs generalized to every walled stage: the stage at the end of each of its logical
// courses (content.js PROJ: C × P; the game sends a logical stone k of C·P as round(k / (C·P) × stones)), then each finish step
// paid off (finish = k / F), from FIXED cameras: 'work' (the stage's own working frame at course 1: siteWorkView / wallView),
// 'wide' (that ray 3× farther: a child's pinch-out), 'site' (the whole building, SITE_CAM below). Every stage before it is built.
// The Ezrat Nashim's finish also shoots the four corner chambers rising one at a time ('lc1'…'lc4', 2.6 s apart), with the name
// on screen. Δ = % of the frame (y 100…760) changed from the step before (a pixel moved > 36 in RGB); the noise floor = the same
// step 4 s later (the crews, the machines and the crane move). Draw calls at the work and wide frames; the crews' machines on
// screen in them (stages.machines()). No game: the world is driven directly (as site_mount_courses), so this measures what the
// world SHOWS for a count; the play is produce-play --demoPick.
// Usage: node test/site_courses.cjs [dist/test.html] [--stages=nashim,ulam,heichal,kodesh] [--cams=work,wide,site] [--out=…] [--min=3]
// Pass: at each stage's 'site' camera (else 'wide') every course step and every finish step changes ≥ --min % and ≥ 1.5× the
// noise floor; draw calls ≤ 150 at every work/wide frame; no page errors.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const sharp = require('sharp');
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const ROOT = path.resolve(__dirname, '..');
const file = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || path.join(ROOT, 'dist/test.html'));
const OUT = path.resolve(A.out || path.join(ROOT, 'test/out/site13/courses')); fs.mkdirSync(OUT, { recursive: true });
const MIN = +(A.min || 3);
const SRC = fs.readFileSync(path.join(ROOT, 'src/game/content.js'), 'utf8');
const STG = [...SRC.matchAll(/^\s*S\('(\w+)', '([^']+)', (\d), \[([^\]]*)\], (\d+)/gm)].map((m) => ({ id: m[1], n: m[2] }));
const PJ = Object.fromEntries([...SRC.matchAll(/^\s*(\w+): J\((\d+), (\d+),[^\[]*\[([^\]]*)\]/gm)].map((m) => [m[1], { C: +m[2], P: +m[3], F: (m[4].match(/F\(/g) || []).length }]));
const ONLY = String(A.stages || 'nashim,ulam,heichal,kodesh').split(',');
const CAMS = String(A.cams || 'work,wide,site').split(',');
const W = 390, H = 844, Y0 = 100, Y1 = 760;
// the whole building from a fixed place: target, azimuth (0 = from +x, 90 = from +z), elevation, distance (amot)
const SITE_CAM = {
  nashim: { t: [73, 12, -2], az: 90, el: 62, d: 330 },
  ulam: { t: [-74, 66, 0], az: 40, el: 12, d: 215 },   // (from the south-east: the altar's smoke stays off the line)
  heichal: { t: [-116, 64, -35], az: -62, el: 22, d: 215 },
  kodesh: { t: [-158, 64, -35], az: -70, el: 22, d: 215 },
  wall: { t: [60, 22, -73.5], az: -80, el: 24, d: 260 },
  gates: { t: [144, 24, 0], az: 12, el: 18, d: 160 },
  nikanor: { t: [10, 28, 0], az: 20, el: 16, d: 170 },
  lishka: { t: [-40, 20, -45], az: 40, el: 30, d: 200 },
};
// a second whole-building camera where one cannot see every step: the Heichal's doors stand inside the Ulam (from the court, in
// front); the Ezrat Nashim's west chambers (from the north-west, high)
const SITE_CAM2 = {
  heichal: { t: [-90, 34, 0], az: 0, el: 9, d: 96 },
  nashim: { t: [40, 10, 0], az: 180, el: 50, d: 300 },
};
const camOf = (c) => { const a = (c.az * Math.PI) / 180, e = (c.el * Math.PI) / 180; return { p: [c.t[0] + Math.cos(e) * Math.cos(a) * c.d, c.t[1] + Math.sin(e) * c.d, c.t[2] + Math.cos(e) * Math.sin(a) * c.d], t: c.t }; };
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
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 300)); });
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 400000 });
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  const res = {}; let pass = true;
  for (const id of ONLY) {
    if (Date.now() - T0 > +(A.budget || 540) * 1000) { console.log(`${sec()}s no time for ${id}`); break; }
    const P = PJ[id]; if (!P) continue;
    const idx = STG.findIndex((s) => s.id === id), before = STG.slice(0, idx).map((s) => s.id);
    const cs = [...Array(P.C + 1).keys()];
    const steps = cs.map((c) => ({ k: `c${c}`, o: { phase: c ? 'courses' : 'foundation', c } }));
    for (let f = 1; f <= P.F; f++) steps.push({ k: `f${f}`, o: { phase: 'finish', f: f / P.F } });
    if (id === 'nashim') for (let q = 2; q <= 4; q++) steps.push({ k: `lc${q}`, o: { phase: 'finish', f: 1, wait: 2.6 } });
    // (--steps=c0,c4,c5,… a chosen few, when SwiftShader's minute a step on the shared machine cannot shoot them all)
    if (A.steps) { const want = new Set(String(A.steps).split(',')); for (let i = steps.length - 1; i >= 0; i--) if (!want.has(steps[i].k)) steps.splice(i, 1); }
    const info = await pg.evaluate(({ id, before }) => {
      const S = __T.stages; __T.buildMode();
      for (const x of before) S.setStage(x, 'done', 1, { instant: true });
      S.setBoulders(new Array(12).fill(0));
      S.setStage(id, 'building', 0.05, { instant: true }); S.setWork(id, { phase: 'foundation', stones: 0, stock: 8 }); __T.step(8, 0.2);
      const I = S.siteInfo(id); return { stones: I ? I.stones : 0, courses: I ? I.courses : 0 };
    }, { id, before });
    const cams = {}, shots = {}; res[id] = { info, pairs: {}, noise: {}, calls: [], machines: [], label: [] };
    const camList = CAMS.concat(SITE_CAM2[id] && CAMS.includes('site') ? ['site2'] : []);
    console.log(`${sec()}s ${id}: ${JSON.stringify(info)} · ${P.C} courses · ${P.F} finish steps`);
    for (const st of steps) {
      if (Date.now() - T0 > +(A.budget || 540) * 1000 - 30000) { console.log(`${sec()}s ${id}: out of time at ${st.k} — the sheets hold the steps so far`); break; }
      const r = await pg.evaluate(({ id, o, N, C }) => {
        const S = __T.stages;
        if (o.wait) { __T.step(o.wait, 0.1); }
        else {
          const w = o.phase === 'finish' ? { phase: 'finish', stones: N, stock: 0, finish: o.f } : { phase: o.phase, stones: Math.round((o.c / C) * N), stock: 8 };
          S.setWork(id, w); __T.step(2.4, 0.2); try { S.hero.place(id); } catch (e) { /* */ } __T.step(2.4, 0.4);   // (the count ripples in at ≥ 3.2/s)
        }
        const v = (S.siteWorkView && S.siteWorkView(id)) || (S.wallView && S.wallView(id));
        const I = S.siteInfo(id), L = S.finishLabel ? S.finishLabel() : null;
        return { v, set: I ? I.set : null, shown: S.status(id) ? +S.status(id).shown.toFixed(3) : null, label: L ? L.text : null };
      }, { id, o: st.o, N: info.stones, C: P.C });
      if (!cams.work && r.v && st.k === 'c1') { cams.work = { p: r.v.p, t: r.v.t }; cams.wide = { p: r.v.t.map((t, i) => t + (r.v.p[i] - t) * 3), t: r.v.t }; }
      if (r.label) res[id].label.push(st.k + ':' + r.label);
      const few = new Set(['c1', 'c2', `c${Math.round(P.C / 2)}`, `c${P.C}`, ...Array.from({ length: P.F }, (_, i) => `f${i + 1}`), 'lc4']);
      for (const k of camList) {
        const cam = k === 'site' ? (SITE_CAM[id] && camOf(SITE_CAM[id])) : k === 'site2' ? (SITE_CAM2[id] && camOf(SITE_CAM2[id])) : cams[k];
        if (!cam) continue;
        if ((k === 'work' || k === 'wide') && !few.has(st.k) && !A.allWork) continue;   // (SwiftShader: ~8 s a shot on the shared machine)
        const f = path.join(OUT, `${id}-${st.k}-${k}.png`);
        const d = await pg.evaluate(({ c, k }) => {
          __T.look(c.p, c.t); __T.render(); __T.render();
          let calls = null, mach = null;
          if ((k === 'work' || k === 'wide') && c.dc) {
            calls = __T.drawCalls().total;
            // the crews' machines on screen (crane tip, crane base, shear-legs, sledge)
            const M = __T.stages.machines ? __T.stages.machines() : {}, V = __T.Vector3, cam = __T.camera; cam.updateMatrixWorld();
            mach = 0; for (const m of Object.values(M)) for (const q of [m.hook || m.crane, m.base, [m.shear[0], 4, m.shear[1]], [m.sled[0], 2, m.sled[1]]]) { const v = new V(q[0], q[1], q[2]).project(cam); if (v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1) mach++; }
          }
          return { calls, mach };
        }, { c: Object.assign({ dc: st.k === 'c1' || st.k === `c${P.C}` || st.k === `f${P.F}` }, cam), k });
        await pg.screenshot({ path: f, timeout: 240000 });
        (shots[k] = shots[k] || []).push({ k: st.k, f });
        if (d.calls) res[id].calls.push(d.calls);
        if (d.mach !== null) res[id].machines.push(`${st.k}/${k}:${d.mach}`);
        if (st === steps[Math.min(2, steps.length - 1)]) {   // the noise floor: the same step 4 s later (at the third step shot)
          await pg.evaluate((c) => { __T.step(4, 0.1); __T.look(c.p, c.t); __T.render(); __T.render(); }, cam);
          const f2 = path.join(OUT, `${id}-${st.k}-${k}-again.png`);
          await pg.screenshot({ path: f2, timeout: 240000 });
          res[id].noise[k] = await pct(f, f2);
        }
      }
      console.log(`${sec()}s   ${id} ${st.k}: set ${r.set} shown ${r.shown}${r.label ? ' label ' + r.label : ''}`);
    }
    for (const k of Object.keys(shots)) {
      const L = shots[k], d = [];
      for (let i = 1; i < L.length; i++) d.push(await pct(L[i - 1].f, L[i].f));
      res[id].pairs[k] = d;
      const tw = 130, th = Math.round((Y1 - Y0) / 3), lab = 18;
      const tiles = await Promise.all(L.map((x) => sharp(x.f).extract({ left: 0, top: Y0, width: W, height: Y1 - Y0 }).resize(tw, th).png().toBuffer()));
      const perRow = 9, rows = Math.ceil(L.length / perRow), width = Math.min(L.length, perRow) * (tw + 3) + 3, height = rows * (th + lab) + 16;
      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font:bold 11px sans-serif;fill:#222}</style>${L.map((x, i) => `<text x="${4 + (i % perRow) * (tw + 3)}" y="${13 + Math.floor(i / perRow) * (th + lab)}">${x.k}${i ? ' Δ' + d[i - 1] + '%' : ''}</text>`).join('')}<text x="4" y="${height - 3}" style="font:10px sans-serif">site13 · ${id} · camera ${k} · noise ${res[id].noise[k]}%</text></svg>`;
      await sharp({ create: { width, height, channels: 3, background: '#f4efe4' } }).composite([{ input: Buffer.from(svg), top: 0, left: 0 }, ...tiles.map((t, i) => ({ input: t, top: lab + Math.floor(i / perRow) * (th + lab), left: 3 + (i % perRow) * (tw + 3) }))]).png().toFile(path.join(OUT, `sheet-${id}-${k}.png`));
      console.log(`${sec()}s SHEET ${id} ${k}: Δ% ${d.join(' · ')} (noise ${res[id].noise[k]})`);
    }
    // the bar: at the site camera (else wide) every step ≥ MIN and ≥ 1.5× the noise floor
    // (a step passes when any fixed camera that shot it changed enough: ≥ MIN and ≥ 1.5× its noise floor)
    const gate = res[id].pairs.site ? 'site' : 'wide', G = res[id].pairs[gate] || [];
    const prevK = (stepK) => { const j = steps.findIndex((x) => x.k === stepK); return j > 0 ? steps[j - 1].k : null; };
    const dOf = (k, stepK) => { const L = shots[k] || [], i = L.findIndex((x) => x.k === stepK); return i > 0 && L[i - 1].k === prevK(stepK) ? res[id].pairs[k][i - 1] : null; };   // (only a camera that shot the step before too)
    const ok = (stepK) => Object.keys(shots).some((k) => { const v = dOf(k, stepK); return v !== null && v >= MIN && v >= 1.5 * (res[id].noise[k] || 0); });
    const bad = G.map((v, i) => steps[i + 1].k).filter((k) => !k.startsWith('lc') && !ok(k)).map((k) => [k, ...Object.keys(shots).map((c) => `${c}:${dOf(c, k)}`)]);
    res[id].gate = { cam: gate, bad };
    console.log(`${id}: ${bad.length ? 'FAIL ' + JSON.stringify(bad) : 'pass'} at '${gate}' · calls ${Math.max(0, ...res[id].calls)} · machines on screen ${res[id].machines.filter((x) => /c[1-9]/.test(x)).slice(0, 6).join(' ')} · labels ${res[id].label.join(' ')}`);
    if (bad.length || Math.max(0, ...res[id].calls) > 150) pass = false;
    fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 1));
  }
  if (errs.length) pass = false;
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(pass ? 'ALL PASS' : 'FAIL');
  await b.close();
  process.exit(pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
