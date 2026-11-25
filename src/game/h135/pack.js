/* ── build 135 ── h135/pack.js — stage 12 "הכיור" (spec docs/specs/shlav-12-he.md v7) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH135: a level per work per visit), its acts (acts.js), its world
 * (world.js); the opening (rule 3: where am I — the court between the porch and the altar, the kiyor on its place; a tap skips it); the
 * finale "הלילה הראשון" (once, no points): the evening's check as a show (the water down to the moon ring, the upper streams fade, the
 * lower ones go on to the stations — what work 1 left is what is seen); the sinking: he touches the wheel and turns it (the shoe works by
 * itself), the full kiyor goes down with the screw, click after click, under the sink line; the sound to Jericho: the camera rises over
 * the whole altar chapter (stages 08–12) and the wood's sound fades eastward (Tamid 3:8, as a sound); the morning: dark, then the first
 * light, wooden clicks and far voices — "הגיע עת" (Tamid 1:4), fireworks. The kiyor does NOT rise here: it stays under the water (the
 * morning's raising is Phase B's). Then the result card with "שוב, לשיפור".
 */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, TITLES, KINDS, LOSS, MUL, createH135, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH12, initWorld, finalWorld, restWorld, own } from './world.js';
import { mats12, streamMesh } from './look.js';
import * as D from './dadim-model.js';
import { voices12, px360 } from './kit12.js';
import { fingers } from '../h113/acts.js';
import { BOOK } from '../world/grid.js';

const S12 = BOOK.s12, CAM = S12.cam, END = CAM.end, F = S12.floor, K = S12.kiyor, MK = S12.mukhni;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h135-film'); } catch (e) { /* */ } };
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
  for (let i = 0; i < n; i++) { const a = Math.PI * 0.15 + (i / n) * Math.PI * 1.2; out.push([[cx + Math.cos(a) * END.R * 0.6, END.y * 0.6, cz + Math.sin(a) * END.R * 0.6], [cx, F + 2, cz], 2.2]); }
  return out;
}
/** an old save whose old stage 12 ('kiyor') was done: the new stage stands built by the crews */
export function migrate12(G, oldDone) {
  if (!G || G.h135) return false;
  if (!oldDone) return false;
  G.h135 = fromOld(true); return true;
}
/** the crews' aims (a save from the crews, or the finale's page): each seat's own station's hands, solved */
export function crewSpigots() {
  const S = D.fresh(2, S12), out = {};
  for (const n of S.seats) { const s = S12.seats[n]; D.place(S, n); const sol = D.solve(S, n, s.i, 'morning'); if (sol) out[n] = { yaw: sol.yaw, pitch: sol.pitch, station: s.i, zone: 'hands', crews: 1 }; }
  return out;
}
const frames = (fn) => new Promise((res) => { let last = performance.now(); const go = (ms) => { const dt = Math.min(0.1, (ms - last) / 1000); last = ms; if (fn(dt)) res(); else requestAnimationFrame(go); }; requestAnimationFrame(go); });
const UI = (e) => !!(e.target && e.target.closest && e.target.closest('button,.gm-top,.gm-menu,.gm-modal'));

/** the evening's check, a show: the streams of the spigots as they stand — the upper fade, the lower go on */
async function evening(X, M) {
  const T = X.THREE, root = new T.Group(); X.props.root.add(root);
  const st = M.st, sp = st.spigots || {}, S = D.fresh(2, S12);
  for (const [n, p] of Object.entries(sp)) { if (!S.sp[n]) continue; S.sp[n].placed = true; S.sp[n].yaw = p.yaw || 0; S.sp[n].pitch = p.pitch || 0; }
  const live = {}, V = voices12(X);
  for (const n of S.seats) if (S.sp[n].placed) { const m = streamMesh(X); root.add(m); live[n] = m; }
  const curve = (n) => { const L = D.arc(S, n).land, q = D.mouthOf(S, n), v = D.speedOf(S, S12.seats[n].row), t = L.t; return [[q.x, q.y, q.z], [q.x + q.dx * v * t / 2, q.y + q.dy * v * t / 2, q.z + q.dz * v * t / 2], [L.x, L.y, L.z]]; };
  X.shot(CAM.dadim[0].slice(), CAM.dadim[1].slice(), 1.6);
  try { X.line('בדיקת הערב: המים יורדים מטבעת השמש לטבעת הירח', 3200); } catch (e) { /* */ }
  const W = SH12.refs && SH12.refs.kiyor && SH12.refs.kiyor.userData.water;
  let t = 0; V.hiss(0.7);
  await frames((dt) => {
    t += dt; const k = Math.max(0, Math.min(1, (t - 1.2) / 2)), y = S12.rings.sun + (S12.rings.moon - S12.rings.sun) * k;
    if (W) { W.position.y = y - K.y0; const r0 = SH12.refs.kiyor.userData.rIn(S12.rings.sun), r = SH12.refs.kiyor.userData.rIn(y); W.scale.set(r / r0, r / r0, 1); }
    for (const [n, m] of Object.entries(live)) { const up = S12.seats[n].row === 'up'; m.visible = up ? t < 2.6 : t > 2.2; if (m.visible) { const [a, b, c] = curve(+n); m.userData.set(a, b, c, up && t > 2 ? 0.045 * Math.max(0.2, 1 - (t - 2) / 0.6) : 0.045); } }
    return t > 5.2;
  });
  V.hiss(0); X.props.remove(root);
}
/** the sinking: his finger on the wheel turns it (the shoe by itself, no points); idle, it turns by itself */
async function sinking(X, M) {
  const V = voices12(X); SH12.hold = true; SH12.own.kiyorFull = true;
  X.shot(CAM.mukhni[0].slice(), CAM.mukhni[1].slice(), 1.4);
  try { X.line('הלילה: החזיקו את שפת הגלגל וסובבו. הכיור המלא שוקע לבור', 4200); } catch (e) { /* */ }
  const C = { d: 0, w: 0, idle: 0, a: null, acc: 0, hist: [], t: 0, tick: 0 };
  const wheel = () => { const c = X.scr(MK.x, MK.axle.y, MK.wheel.z), e = X.scr(MK.x + MK.wheel.r, MK.axle.y, MK.wheel.z), n = X.scr(MK.x, MK.axle.y + MK.wheel.r, MK.wheel.z); return { c, ax: Math.max(10, Math.hypot(e.x - c.x, e.y - c.y)), ay: Math.max(10, Math.hypot(n.x - c.x, n.y - c.y)) }; };
  const ang = (f) => { const W = wheel(); return Math.atan2((f.y - W.c.y) / W.ay, (f.x - W.c.x) / W.ax); };
  const dn = (e) => { if (UI(e)) return; C.a = { id: e.pointerId, a: ang({ x: e.clientX, y: e.clientY }) }; };
  const mv = (e) => { if (!C.a || e.pointerId !== C.a.id) return; const a = ang({ x: e.clientX, y: e.clientY }); let d = a - C.a.a; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; C.a.a = a; C.acc += d; };
  const up = (e) => { if (C.a && e.pointerId === C.a.id) C.a = null; };
  addEventListener('pointerdown', dn, true); addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  await frames((dt) => {
    C.t += dt; C.hist.push([C.t, C.acc]); while (C.hist.length > 2 && C.t - C.hist[0][0] > 0.12) C.hist.shift();
    const fw = C.a ? Math.max(0, (C.hist[C.hist.length - 1][1] - C.hist[0][1]) / Math.max(1e-3, C.hist[C.hist.length - 1][0] - C.hist[0][0]) / (Math.PI * 2)) : 0;
    if (C.a) C.idle = 0; else C.idle += dt;
    const want = C.a ? Math.min(0.45, fw) : C.idle > 6 || globalThis.__H135_AUTO_FINALE ? 0.4 : 0;
    C.w += (want - C.w) * Math.min(1, dt * 3); C.d = Math.min(K.travel, C.d + C.w * dt);
    const d0 = SH12.d; SH12.d = C.d; SH12.ang = C.d * Math.PI * 2; SH12.brake = 0.5;
    if (Math.floor(C.d * 8) > Math.floor(d0 * 8)) { V.click(); const tg = SH12.refs && SH12.refs.tongue; if (tg) tg.rotation.y = -0.35; }
    else { const tg = SH12.refs && SH12.refs.tongue; if (tg) tg.rotation.y *= 0.8; }
    if (d0 < K.y0 - S12.pit.sink && C.d >= K.y0 - S12.pit.sink) V.splash(1.4);
    return C.d >= K.travel - 1e-6;
  });
  removeEventListener('pointerdown', dn, true); removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
  M.st.sunk = 1; X.save(); SH12.hold = false; SH12.own.kiyorFull = false;
}
/** the sound to Jericho: the camera up over the altar chapter, the wood's clicks fading east; then the morning */
async function jericho(X) {
  const V = voices12(X), E = (() => { try { return X.pack && X.pack.time; } catch (e) { return null; } })();
  const [jx, jy, jz] = S12.finale.jericho;
  X.shot([jx, jy, jz], [-50, F, 10], 3.2);
  try { X.line('"מיריחו היו שומעין קול העץ" (תמיד ג, ח)', 3600); } catch (e) { /* */ }
  for (let i = 0; i < 8; i++) { const c = X.sfx && X.sfx.context; void c; try { V.click(); } catch (e) { /* */ } await beat(X, 380 + i * 60); }
  try { if (E && E.setTime) E.setTime('dawn'); } catch (e) { /* */ }
  await beat(X, 900);
  try { X.line('"הגיע עת" (תמיד א, ד)', 3200); V.knock && V.knock(1.6); } catch (e) { /* */ }
  await beat(X, 600);
}
async function fireworks(X) {
  const P = [[0, 24, 0], [-10, 30, -6], [10, 28, 6], [-5, 36, 8], [7, 34, -10], [0, 42, 0], [-14, 38, 3], [14, 40, -3]];
  const [cx, cz] = [K.x + 6, K.z + 4];
  for (const p of P) { try { X.sparks(cx + p[0], p[1], cz + p[2], 46); X.dust(cx + p[0], p[1], cz + p[2], 4, 8); if (X.play) X.play('fanfare', { level: 3 }); } catch (e) { /* */ } await beat(X, 330); }
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
    const st = M.st, best = st.bestOf || {}, row = (w) => { const b = best[w]; const s = b ? b.stars | 0 : 0; return `<li><b>${TITLES[w]}</b> <i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></li>`; };
    const fl = {}; for (const x of st.flaws || []) { fl[x.f] = (fl[x.f] || 0) + 1; }
    const fls = Object.entries(fl).map(([f, n]) => `<li>${LOSS[f] ? LOSS[f][0] : f}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || '<li>אין נזקים למראה</li>';
    const low = againOf(M);
    const el = document.createElement('div'); el.className = 'h109-ui h135-card';
    el.innerHTML = `<style>.h135-card{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(14,10,4,.42);font-family:Heebo,system-ui;direction:rtl}.h135-card>div{background:#FBF6EA;color:#3A2A14;border-radius:16px;padding:14px 22px;width:min(92vw,560px);max-height:92vh;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,.35)}.h135-card h3{margin:0 0 4px;font-size:22px}.h135-card ul{margin:2px 0 6px;padding:0 18px;font-size:15px;line-height:1.35}.h135-card ul.r,.h135-card ul.pts{display:flex;flex-wrap:wrap;gap:2px 18px;list-style:none;padding:0}@media (max-height:420px){.h135-card>div{padding:10px 16px}.h135-card h3{font-size:19px}.h135-card ul{font-size:14px}}.h135-card i{color:#C08A1A;font-style:normal;letter-spacing:1px}.h135-card .w{color:#2E7A3A;font-weight:800}.h135-card button{font:800 17px Heebo,system-ui;border:0;border-radius:12px;padding:10px 16px;margin-inline-end:8px;min-height:44px;background:#C08A1A;color:#fff}.h135-card button.b{background:#E8DCC2;color:#3A2A14}</style>`
      + `<div><h3>הכיור</h3><div class="w">הכיור שקוע במי בור הגולה עד הבוקר</div><ul class="r">${KINDS.map(row).join('')}</ul>${pointsRows(st)}<b>מה נשאר בעולם</b><ul>${fls}</ul><button class="a">שוב, לשיפור: ${TITLES[low]}</button><button class="b">להמשיך</button></div>`;
    document.body.appendChild(el);
    const close = (v) => { try { el.remove(); } catch (e) { /* */ } res(v); };
    el.querySelector('.a').addEventListener('click', (e) => { e.stopPropagation(); close(low); });
    el.querySelector('.b').addEventListener('click', (e) => { e.stopPropagation(); close(null); });
    setTimeout(() => close(null), 25000);
  });
}

export function makePack12(env = {}) {
  const RD = endRound();
  const P = {
    time: env,
    id: 'kiyor', key: 'h135', wordScreen: true,
    name: 'הכיור', PLAN, ACTS, icon: '🫗',
    create: (save) => createH135(save),
    count: (M) => M.count(),
    freeFilms: true,
    workLinks: true,
    workSeed(M, id) { if (String(id).startsWith('mukhni') && !M.st.water) M.st.water = 1; },
    quiet: true,
    byPlan: true,
    endTitle: 'הכיור נבנה!',
    upStrip: true,
    endSub: 'ואף הוא עשה מוכני לכיור, שלא יהו מימיו נפסלין בלינה (יומא ג, י)',
    nextStage: NEXT_STAGE,
    endView: [RD[0][0], RD[0][1]],
    film: endRound(3),
    sync(M, S0, instant, X) { if (!X || !SH12.X) return; if (M.finished() && !M.mission()) finalWorld(X); },
    visits: true,
    unitEnd: () => null,
    /** the opening (rule 3): over the court from the south-east, then the kiyor on its place between the porch and the altar */
    before(m, X, M) {
      try { globalThis.__H135_X = X; } catch (e) { /* (the probes) */ }
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        X.line(LINES.stage, 0);
        const shots = [[RD[1][0], RD[1][1]], CAM.open];
        for (let i = 0; i < shots.length; i++) {
          if (acting()) break;
          X.shot(shots[i][0].slice(), shots[i][1].slice(), i ? 2.6 : 0.01);
          if (await tapOr(X, i ? 3000 : 2200)) break;
        }
        if (!acting()) X.line('');
        if (!acting()) { try { X.stages.hero.place({ x: S12.start[0], z: S12.start[1], face: [K.x, K.z] }); } catch (e) { /* */ } }
        near(X, false);
      })();
    },
    /** the first night (once, no points): the evening's check, the sinking, the sound to Jericho, the morning; then the result card */
    async finale(X) {
      const M = X.M, st = M.st; finalWorld(X);
      if (!st.spigots || Object.keys(st.spigots).length < 12) { st.spigots = { ...crewSpigots(), ...(st.spigots || {}) }; X.save(); SH12.key = ''; finalWorld(X); }
      near(X, true);
      if (!st.finale) {
        const E = (() => { try { return X.pack && X.pack.time; } catch (e) { return null; } })();
        try { if (E && E.setTime) E.setTime('dusk'); } catch (e) { /* */ }
        try { await evening(X, M); } catch (e) { console.warn('[h135] evening', e && e.message); }
        try { if (E && E.setTime) E.setTime('night'); } catch (e) { /* */ }
        try { await sinking(X, M); } catch (e) { console.warn('[h135] sinking', e && e.message); }
        try { await jericho(X); } catch (e) { console.warn('[h135] jericho', e && e.message); }
        try { await fireworks(X); } catch (e) { /* */ }
        st.finale = 1; X.save(); SH12.key = ''; finalWorld(X);
        try { if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ }
      }
      near(X, false);
      const low = await resultCard(M);
      if (low) { P.again = low; try { X.line(`שוב, לשיפור: ${TITLES[low]}. הולכים אל העבודה`, 4000); } catch (e) { /* */ } }
      h131Card(true);
    },
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld; void own; void mats12; void fingers; void px360;
  return P;
}
