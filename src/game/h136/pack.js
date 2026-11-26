/* ── build 136 ── h136/pack.js — stage 13 "האולם" (spec docs/specs/shlav-13-he.md v4) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH136: a level per work per visit), its acts (acts.js), its world (world.js);
 * the opening (rule 3: where am I — over the court, the Ulam's walls rising by themselves to 62 and on to 70, no crews; a tap skips it);
 * after works 1 and 2 the walls rise to the ceiling and the roof, the golden chains are hung (a short look, once); the finale "שחר בפתח
 * שאין לו דלת" (once, no points): the camera in one move out through the opening and round to the front; the dawn over the Mount of
 * Olives — the low light makes the waves of the courses that stand out and sink in ("אפיק שפה ועייל שפה", Bava Batra 4a); a horizontal
 * drag moves the eye along the front on a fixed rail (the light does not follow the finger); after about 15 s, or when he rests at the
 * middle, the sun's ray enters the opening that has no door and the camera follows it in to the Heichal's door, open, still without
 * doors — "כל הפתחים שהיו שם היו להן דלתות, חוץ משל אולם" (Middot 2:3); the camera draws back: "פרק הבית התחיל.". Then the result card
 * with "שוב, לשיפור".
 */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, TITLES, KINDS, LOSS, MUL, createH136, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH13, initWorld, finalWorld, restWorld, bandsWave, bandsPlain } from './world.js';
import { mats13 } from './look.js';
import { voices13 } from './kit13.js';
import { BOOK } from '../world/grid.js';
import { filmFigs } from '../h128/figgate.js';

const S13 = BOOK.s13, CAM = S13.cam, END = CAM.end, F = S13.floor, FN = S13.finale, HD = S13.heichalDoor;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h136-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
export function endRound(n = 4) {
  const [cx, , cz] = [END.c[0], 0, END.c[2]], out = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI * 0.35 + (i / n) * Math.PI * 0.7; out.push([[cx + Math.cos(a) * END.R, END.y, cz + Math.sin(a) * END.R], [cx, 50, cz], 2.2]); }
  return out;
}
/** an old save whose old stage 13 ('ulam') was done: the new stage stands built by the crews */
export function migrate13(G, oldDone) {
  if (!G || G.h136) return false;
  if (!oldDone) return false;
  G.h136 = fromOld(true); return true;
}
const frames = (fn) => new Promise((res) => { let last = performance.now(); const go = (ms) => { const dt = Math.min(0.1, (ms - last) / 1000); last = ms; if (fn(dt)) res(); else requestAnimationFrame(go); }; requestAnimationFrame(go); });
const UI = (e) => !!(e.target && e.target.closest && e.target.closest('button,.gm-top,.gm-menu,.gm-modal'));

/** the walls to the ceiling and the roof, the chains hung (after works 1 and 2, once): a short look from the court */
async function roofLook(X) {
  if (SH13.roofing) return; SH13.roofing = true;
  try {
    near(X, true); SH13.fast = 9;
    X.shot(CAM.open[0].slice(), [-80, 70, 0], 1.6);
    try { X.line('הכתלים עולים עד התקרה, ושרשראות הזהב נתלות בה', 3600); } catch (e) { /* */ }
    await frames(() => SH13.H >= SH13.HT - 0.01);
    await beat(X, 800);
  } finally { SH13.fast = 0; SH13.roofing = false; near(X, false); }
}
/** the dawn (once): out through the opening, the waves, the rail, the ray, the line, the retreat */
async function dawn(X) {
  const T = X.THREE, Mt = mats13(X), V = voices13(X), root = new T.Group(); X.props.root.add(root);
  const E = (() => { try { return X.pack && X.pack.time; } catch (e) { return null; } })();
  try { if (E && E.setTime) E.setTime('dawn'); } catch (e) { /* */ }
  // 1–2. one move: from inside the hall, down and out through the opening, round to the front
  X.shot([-86, 60, 14], [-80, 52, 0], 0.01);
  await beat(X, 300);
  X.shot([-74, 44, 2], [-60, 40, 0], 1.6); await beat(X, 1500);
  X.shot([-62, 40, 0], [-50, 40, 0], 1.2); await beat(X, 1100);
  X.shot([FN.rail.x, FN.rail.y, 0], FN.look.slice(), 1.6); await beat(X, 1500);
  V.wind();
  // 3–4. the waves, and the rail under his finger
  const C = { z: 0, v: 0, t: 0, drag: null, still: 0, touched: false };
  const dn = (e) => { if (UI(e)) return; C.drag = { id: e.pointerId, x: e.clientX }; C.touched = true; };
  const mv = (e) => { if (!C.drag || e.pointerId !== C.drag.id) return; const dx = e.clientX - C.drag.x; C.drag.x = e.clientX; C.z = Math.max(FN.rail.z0, Math.min(FN.rail.z1, C.z - dx * (80 / Math.max(320, innerWidth)))); };
  const up = (e) => { if (C.drag && e.pointerId === C.drag.id) C.drag = null; };
  addEventListener('pointerdown', dn, true); addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  try { X.line('השמש עולה מעל הר הזיתים. גררו לאורך החזית', 3400); } catch (e) { /* */ }
  await frames((dt) => {
    C.t += dt;
    bandsWave(C.t, Math.min(1, C.t / 2));
    X.track([FN.rail.x, FN.rail.y, C.z], [FN.look[0], FN.look[1], C.z * 0.4], 6, 0.4);
    if (C.touched && !C.drag && Math.abs(C.z) < 4) C.still += dt; else C.still = 0;
    if (C.t % 4 < dt) V.wind();
    return C.t > 15 || C.still > 1.5 || globalThis.__H136_AUTO_FINALE;
  });
  removeEventListener('pointerdown', dn, true); removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
  // 5. the ray: through the opening that has no door, in to the Heichal's door (open, no doors yet)
  const L = 70, ray = new T.Mesh(new T.CylinderGeometry(1.4, 4.5, L, 16, 1, true), Mt.y13ray); ray.rotation.z = Math.PI / 2; ray.position.set(-98 + L / 2 + 6, 38, 0); ray.scale.set(1, 0.001, 1); root.add(ray);
  let t = 0;
  X.shot([-60, 36, 3], [-90, 38, 0], 1.4);
  await frames((dt) => { t += dt; bandsWave(15 + t, Math.max(0, 1 - t / 3)); ray.scale.y = Math.min(1, t / 1.5); return t > 1.6; });
  X.shot([-79, 36, 4], [(HD.x0 + HD.x1) / 2 || -95, 40, 0], 2.4);
  try { X.line('"כל הפתחים שהיו שם היו להן דלתות, חוץ משל אולם" (מדות ב, ג)', 5200); } catch (e) { /* */ }
  for (let i = 0; i < 6; i++) { try { X.sparks(-93, 30 + i * 4, (i % 3 - 1) * 4, 6); } catch (e) { /* */ } await beat(X, 420); }
  await beat(X, 1600);
  // 7. the retreat: the Ulam, the five lintels, the kiyor, the altar and the Mount; gold dust in the air
  bandsPlain();
  X.shot([10, 95, 70], [-70, 40, 0], 3.4);
  for (let i = 0; i < 8; i++) { try { X.sparks(-76 + i * 3, 50 + (i % 3) * 8, -20 + i * 5, 10); } catch (e) { /* */ } await beat(X, 380); }
  try { X.line('פרק הבית התחיל.', 3600); } catch (e) { /* */ }
  await beat(X, 2600);
  X.props.remove(root);
  try { if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ }
}
async function fireworks(X) {
  const P = [[0, 24, 0], [-10, 30, -6], [10, 28, 6], [-5, 36, 8], [7, 34, -10], [0, 42, 0], [-14, 38, 3], [14, 40, -3]];
  const [cx, cz] = [-62, 0];
  for (const p of P) { try { X.sparks(cx + p[0], F + p[1], cz + p[2], 46); X.dust(cx + p[0], F + p[1], cz + p[2], 4, 8); if (X.play) X.play('fanfare', { level: 3 }); } catch (e) { /* */ } await beat(X, 330); }
}
function pointsRows(st) {
  let base = 0, lvb = 0; for (const [id, r] of Object.entries(st.res || {})) { const lv = +String(id).slice(-1) || 1, p = (r && r.pts) | 0; base += p; lvb += p * ((MUL[lv] || 1) - 1); }
  return `<ul class="pts"><li>נקודות העבודות: ${base}</li>${lvb ? `<li>בונוס הרמה: ${lvb}</li>` : ''}<li>הרצף הטוב ביותר: ${st.best | 0}</li></ul>`;
}
const starsOf = (st, k) => Math.max(0, ...[1, 2, 3].map((lv) => (st.res[k + lv] ? st.res[k + lv].stars | 0 : 0)));
export function againOf(M) { const c = KINDS.map((k) => [k, starsOf(M.st, k)]); c.sort((a, b) => a[1] - b[1]); return c[0][0]; }
function resultCard(M) {
  return new Promise((res) => {
    if (typeof document === 'undefined') { res(null); return; }
    const st = M.st, best = st.bestOf || {}, row = (w) => { const b = best[w]; const s = b ? b.stars | 0 : Math.max(0, ...Object.keys(st.res || {}).filter((id) => id.startsWith(w)).map((id) => st.res[id].stars | 0)); return `<li><b>${TITLES[w]}</b> <i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></li>`; };
    const fl = {}; for (const x of st.flaws || []) { fl[x.f] = (fl[x.f] || 0) + 1; }
    const fls = Object.entries(fl).map(([f, n]) => `<li>${LOSS[f] ? LOSS[f][0] : f}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || '<li>אין נזקים למראה</li>';
    const low = againOf(M);
    const el = document.createElement('div'); el.className = 'h109-ui h136-card';
    el.innerHTML = `<style>.h136-card{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(14,10,4,.42);font-family:Heebo,system-ui;direction:rtl}.h136-card>div{background:#FBF6EA;color:#3A2A14;border-radius:16px;padding:14px 22px;width:min(92vw,560px);max-height:92vh;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,.35)}.h136-card h3{margin:0 0 4px;font-size:22px}.h136-card ul{margin:2px 0 6px;padding:0 18px;font-size:15px;line-height:1.35}.h136-card ul.r,.h136-card ul.pts{display:flex;flex-wrap:wrap;gap:2px 18px;list-style:none;padding:0}@media (max-height:420px){.h136-card>div{padding:10px 16px}.h136-card h3{font-size:19px}.h136-card ul{font-size:14px}}.h136-card i{color:#C08A1A;font-style:normal;letter-spacing:1px}.h136-card .w{color:#2E7A3A;font-weight:800}.h136-card button{font:800 17px Heebo,system-ui;border:0;border-radius:12px;padding:10px 16px;margin-inline-end:8px;min-height:44px;background:#C08A1A;color:#fff}.h136-card button.b{background:#E8DCC2;color:#3A2A14}</style>`
      + `<div><h3>האולם</h3><div class="w">הפתח שאין לו דלת פתוח לשחר</div><ul class="r">${KINDS.map(row).join('')}</ul>${pointsRows(st)}<b>מה נשאר בעולם</b><ul>${fls}</ul><button class="a">שוב, לשיפור: ${TITLES[low]}</button><button class="b">להמשיך</button></div>`;
    document.body.appendChild(el);
    const close = (v) => { try { el.remove(); } catch (e) { /* */ } res(v); };
    el.querySelector('.a').addEventListener('click', (e) => { e.stopPropagation(); close(low); });
    el.querySelector('.b').addEventListener('click', (e) => { e.stopPropagation(); close(null); });
    setTimeout(() => close(null), 25000);
  });
}

export function makePack13(env = {}) {
  const RD = endRound();
  const P = {
    time: env,
    id: 'ulam', key: 'h136', wordScreen: true,
    name: 'האולם', PLAN, ACTS, icon: '🏛️',
    create: (save) => createH136(save),
    count: (M) => M.count(),
    freeFilms: true,
    workLinks: true,
    workSeed(M) { M.st.intro = 1; M.st.roofFilm = 1; },
    quiet: true,
    byPlan: true,
    endTitle: 'האולם נבנה!',
    upStrip: true,
    endSub: 'וחמש מלתראות של מילת היו על גביו (מדות ג, ז)',
    nextStage: NEXT_STAGE,
    endView: [RD[0][0], RD[0][1]],
    film: endRound(3),
    sync(M, S0, instant, X) {
      if (!X || !SH13.X) return;
      if (M.finished() && !M.mission()) finalWorld(X);
      // (works 1 and 2 done: the walls to the roof, the chains hung — a short look, once, while he walks)
      if (M.roofed() && !M.st.roofFilm && !(X.acting && X.acting())) { M.st.roofFilm = 1; X.save(); roofLook(X).catch(() => {}); }
    },
    visits: true,
    unitEnd: () => null,
    /** the opening (rule 3): over the court from the south-east, the Ulam's walls rising by themselves to 70 */
    before(m, X, M) {
      try { globalThis.__H136_X = X; } catch (e) { /* (the probes) */ }
      const st = M.st;
      if (m || st.intro) { if (st.intro) SH13.H = Math.max(SH13.H, SH13.HT); return null; }
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        X.line(LINES.stage, 0);
        X.shot(CAM.open[0].slice(), CAM.open[1].slice(), 0.01);
        const V = voices13(X); let n = 0;
        const tick = setInterval(() => { try { if (SH13.H < SH13.HT - 0.5) { V.knock(1.4 + (n++ % 3) * 0.3); } } catch (e) { /* */ } }, 700);
        const tapped = await tapOr(X, 7600);
        clearInterval(tick);
        if (tapped) { SH13.fast = 60; await beat(X, 400); SH13.fast = 0; }
        if (!acting()) X.line('');
        if (!acting()) { try { X.stages.hero.place({ x: S13.start[0], z: S13.start[1], face: [S13.front.face, 0] }); } catch (e) { /* */ } }
        near(X, false);
      })();
    },
    /** the dawn (once, no points); then the result card */
    async finale(X) {
      const M = X.M, st = M.st; finalWorld(X);
      near(X, true);
      let figsBack = null; try { figsBack = filmFigs({}); } catch (e) { figsBack = null; }   // (no idle figures: only the kohen)
      if (!st.finale) {
        try { await dawn(X); } catch (e) { console.warn('[h136] dawn', e && e.message); }
        try { await fireworks(X); } catch (e) { /* */ }
        st.finale = 1; X.save(); SH13.key = ''; finalWorld(X);
      }
      near(X, false);
      const low = await resultCard(M);
      if (low) { P.again = low; try { X.line(`שוב, לשיפור: ${TITLES[low]}. הולכים אל העבודה`, 4000); } catch (e) { /* */ } }
      h131Card(true);
      if (figsBack) SH13.figsBack = figsBack;
    },
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
