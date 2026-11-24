/* ── build 133 ── h133/pack.js — stage 10 "גוף המזבח והכבש" (spec docs/specs/shlav-10-he.md) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH133: a level per visit), its acts (acts.js), its world (world.js);
 * the opening (rule 3: where am I — the altar from the south-east, the kevesh's site in its scaffold; a tap skips it); the climb (spec
 * "סיום השלב: העלייה הראשונה", once, alone, no points): one swipe of salt over the kevesh on the path he will walk, then the kohen goes up
 * with a bundle of wood led by the left thumb (off the salt he slips a little and slows — no penalty), lays the wood on the fire's
 * place, the camera opens to the whole Mount, fireworks fill the screen; then the result card (what stands in the world, every flaw
 * in its place) with one button "שוב, לשיפור" that names the work with the fewest stars.
 */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, TITLES, KINDS, LOSS, createH133, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH10, initWorld, finalWorld, restWorld, mats10 } from './world.js';
import { filmFigs } from '../h128/figgate.js';
import { createGang, createBeat, onPlane } from '../h109/kit.js';
import { box } from '../h131/world.js';
import { BOOK } from '../world/grid.js';

const S10 = BOOK.s10, CAM = S10.cam, END = CAM.end, R = S10.ramp, F = S10.floor, Y1 = S10.top, MID = S10.mid;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h133-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** the end's round over the altar and the kevesh (cam:end: a circle round the middle) */
export function endRound(n = 4) {
  const [cx, cz] = END.c, out = [];
  for (let i = 0; i < n; i++) { const a = Math.PI / 4 + (i / n) * Math.PI * 2; out.push([[cx + Math.cos(a) * END.R, END.y, cz + Math.sin(a) * END.R], [cx, Y1, cz + 8], 2.2]); }
  return out;
}
/** an old save whose old stage 10 ('guf') was done: the new stage stands built by the crews */
export function migrate10(G, oldDone) {
  if (!G || G.h133) return false;
  if (!oldDone) return false;
  G.h133 = fromOld(true); return true;
}
const frames = (fn) => new Promise((res) => { let last = performance.now(); const go = (ms) => { const dt = Math.min(0.1, (ms - last) / 1000); last = ms; if (fn(dt)) res(); else requestAnimationFrame(go); }; requestAnimationFrame(go); });

/** the climb: salt, the kohen up with the wood, the wood on the fire's place → resolves when the wood lies there */
export async function climb(X, opts = {}) {
  const T = X.THREE, Mt = mats10(X), root = new T.Group(); root.name = 'h133-climb'; X.props.root.add(root);
  const C = { salt: null, k: null, t: 0, idle: 0, held: null, x: (R.x0 + R.x1) / 2, z: R.foot + 1.5, done: false, slip: 0 };
  try { globalThis.__H133_CLIMB = C; } catch (e) { /* (the probes' eyes) */ }
  // 1. one swipe of salt on the kevesh, on the path he will walk
  X.shot([-38, F + 7, R.foot + 13], [-38, 21, 22], 0.9);
  X.line('העלייה הראשונה: גרירה אחת על הכבש, לזרוק מלח על המסלול', 0);
  const sw = await new Promise((res) => {
    let p0 = null; const dn = (e) => { if (e.target && e.target.closest && e.target.closest('button,.gm-top,.gm-menu,.gm-modal')) return; p0 = { x: e.clientX, y: e.clientY }; };
    const up = (e) => { if (!p0) return; const d = Math.hypot(e.clientX - p0.x, e.clientY - p0.y); if (d < 50) { p0 = null; return; } off(); res([p0, { x: e.clientX, y: e.clientY }]); };
    const off = () => { removeEventListener('pointerdown', dn, true); removeEventListener('pointerup', up, true); };
    addEventListener('pointerdown', dn, true); addEventListener('pointerup', up, true);
    beat(X, opts.auto ? 600 : 9000).then(() => { off(); res(null); });
  });
  let xs = [-39.5, -36.5];
  if (sw) { const a = onPlane(X, sw[0].x, sw[0].y, 20), b = onPlane(X, sw[1].x, sw[1].y, 20); if (a && b) { const lo = Math.max(R.x0 + 0.5, Math.min(a.x, b.x)), hi = Math.min(R.x1 - 0.5, Math.max(a.x, b.x)); if (hi - lo >= 0.6) xs = [lo, hi]; else xs = [Math.max(R.x0 + 0.5, lo - 1.2), Math.min(R.x1 - 0.5, lo + 1.2)]; } }
  C.salt = xs;
  for (let z = R.foot; z > R.head + 0.2; z -= 1) { const y = S10.rampY(z - 0.5); const s = box(X, Mt.y10salt, xs[0], y + 0.01, z - 1, xs[1], y + 0.04, z, root); s.rotation.x = -Math.atan(9 / 32); }
  try { X.dust((xs[0] + xs[1]) / 2, S10.rampY(30) + 0.5, 30, 18, 8); } catch (e) { /* */ }
  // 2. the kohen with the wood: the left thumb held leads him up; its side steers; off the salt he slips and slows
  const Bt = createBeat(X), gang = createGang(X);
  const k = gang.add(C.x, C.z, { role: 'carry', variant: 'kohen', item: 'log', fx: C.x, fz: C.z - 5 }); if (k && k.a) { k.a.fixedY = F; try { gang.setRole(k, 'hold', { item: 'log' }); } catch (e) { /* */ } }
  // the crews along the kevesh, cheering
  const crew = []; for (let i = 0; i < 6; i++) { const z = 40 - i * 5, side = i % 2 ? R.x0 - 1.4 : R.x1 + 1.4; const w = gang.add(side, z, { role: 'point', crew: i, fx: -38, fz: z }); if (w && w.a) w.a.fixedY = F; crew.push(w); }
  X.line('החזק את האגודל: הכהן עולה עם צרור העצים. במלח הוא לא מחליק', 2600);
  const dn = (e) => { if (e.target && e.target.closest && e.target.closest('button,.gm-top,.gm-menu,.gm-modal')) return; C.held = { id: e.pointerId, x: e.clientX }; };
  const mv = (e) => { if (C.held && e.pointerId === C.held.id) C.held.x = e.clientX; };
  const up = (e) => { if (C.held && e.pointerId === C.held.id) C.held = null; };
  addEventListener('pointerdown', dn, true); addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  near(X, true);
  await frames((dt) => {
    C.t += dt; Bt.step(dt); gang.update(dt, Bt);
    const auto = opts.auto || C.idle > 8;
    if (!C.held) C.idle += dt; else C.idle = 0;
    if (C.held || auto) {
      if (C.held) { const w = innerWidth || 1, want = R.x0 + 1 + ((C.held.x / w) * 1.6 - 0.3) * (R.x1 - R.x0 - 2); C.x += Math.max(-1, Math.min(1, (Math.max(R.x0 + 1, Math.min(R.x1 - 1, want)) - C.x))) * dt * 2.5; }
      else C.x += ((C.salt[0] + C.salt[1]) / 2 - C.x) * dt;
      const onSalt = C.z > R.foot || (C.x >= C.salt[0] - 0.3 && C.x <= C.salt[1] + 0.3);
      if (!onSalt) C.slip = Math.min(1, C.slip + dt * 3); else C.slip = Math.max(0, C.slip - dt * 2);
      const sp = 2.4 * (1 - 0.55 * C.slip);
      if (C.z > R.head) C.z -= sp * dt; else { const dx = MID[0] - C.x, dz = MID[1] - C.z, L = Math.hypot(dx, dz); if (L > 0.6) { C.x += (dx / L) * 2.4 * dt; C.z += (dz / L) * 2.4 * dt; } else C.done = true; }
    }
    const y = C.z <= R.head ? Y1 : C.z >= R.foot ? F : S10.rampY(C.z);
    if (k && k.a) { k.a.x = C.x + Math.sin(C.t * 9) * 0.12 * C.slip; k.a.z = C.z; k.a.fixedY = y; k.a.yaw = Math.PI; k.stride = (C.held || auto) && !C.done ? 0.8 : 0; k.rate = 1.2; }
    X.shot([C.x + 1.5, y + 4.2, C.z + 9], [C.x, y + 1.4, C.z - 5], 0.01);
    return C.done;
  });
  removeEventListener('pointerdown', dn, true); removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
  // 3. the wood on the fire's place; the camera opens to the whole Mount; fireworks fill the screen
  X.line('', 0);
  return { root, gang, crew };
}
/** fireworks over the altar (fixed places, three volleys) */
async function fireworks(X) {
  const P = [[0, 30, 0], [-12, 36, -8], [12, 34, 6], [-6, 42, 10], [8, 40, -12], [0, 48, 0], [-16, 44, 4], [16, 46, -4], [0, 38, 14]];
  for (let i = 0; i < P.length; i++) { const p = P[i]; try { X.sparks(MID[0] + p[0], p[1], MID[1] + p[2], 46); X.dust(MID[0] + p[0], p[1], MID[1] + p[2], 4, 8); if (X.play) X.play('fanfare', { level: 3 }); } catch (e) { /* */ } await beat(X, 330); }
}
/** the result card: what stands in the world, every flaw in its place; one button "שוב, לשיפור" (the work with the fewest stars) */
function resultCard(M) {
  return new Promise((res) => {
    if (typeof document === 'undefined') { res(null); return; }
    const st = M.st, best = st.bestOf || {}, row = (k) => { const b = best[k]; const s = b ? b.stars | 0 : 0; return `<li><b>${TITLES[k]}</b> <i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></li>`; };
    const fl = {}; for (const x of st.flaws || []) fl[x.f] = (fl[x.f] | 0) + 1;
    const fls = Object.keys(fl).map((f) => `<li>${LOSS[f][0]}${fl[f] > 1 ? ` ×${fl[f]}` : ''}</li>`).join('') || '<li>אין פגמים בעולם</li>';
    const low = KINDS.slice().sort((a, b) => ((best[a] ? best[a].stars : 0) - (best[b] ? best[b].stars : 0)))[0];
    const el = document.createElement('div'); el.className = 'h109-ui h133-card';
    el.innerHTML = `<style>.h133-card{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(14,10,4,.42);font-family:Heebo,system-ui;direction:rtl}.h133-card>div{background:#FBF6EA;color:#3A2A14;border-radius:16px;padding:16px 22px;width:min(92vw,520px);box-shadow:0 8px 30px rgba(0,0,0,.35)}.h133-card h3{margin:0 0 6px;font-size:22px}.h133-card ul{margin:4px 0 10px;padding:0 18px;font-size:16px;line-height:1.45}.h133-card i{color:#C08A1A;font-style:normal;letter-spacing:1px}.h133-card button{font:800 18px Heebo,system-ui;border:0;border-radius:12px;padding:10px 18px;margin-inline-end:8px;background:#C08A1A;color:#fff}.h133-card button.b{background:#E8DCC2;color:#3A2A14}</style>`
      + `<div><h3>גוף המזבח והכבש</h3><ul>${KINDS.map(row).join('')}</ul><b>מה נשאר בעולם</b><ul>${fls}</ul><button class="a">שוב, לשיפור: ${TITLES[low]}</button><button class="b">להמשיך</button></div>`;
    document.body.appendChild(el);
    const close = (v) => { try { el.remove(); } catch (e) { /* */ } res(v); };
    el.querySelector('.a').addEventListener('click', (e) => { e.stopPropagation(); close(low); });
    el.querySelector('.b').addEventListener('click', (e) => { e.stopPropagation(); close(null); });
    setTimeout(() => close(null), 20000);
  });
}

export function makePack10(env = {}) {
  const RD = endRound();
  const P = {
    time: env,
    id: 'guf', key: 'h133', wordScreen: true,
    name: 'גוף המזבח והכבש', PLAN, ACTS, icon: '⛰',
    create: (save) => createH133(save),
    count: (M) => M.count(),
    freeFilms: true,
    workLinks: true,
    workSeed(M, id) { M.clearFlaws(id); },
    quiet: true,
    byPlan: true,
    endTitle: 'גוף המזבח והכבש נבנו!',
    upStrip: true,
    endSub: 'וכבש היה לדרום המזבח, שלושים ושתיים על רוחב שש עשרה (מידות ג, ג)',
    nextStage: NEXT_STAGE,
    endView: [RD[0][0], RD[0][1]],
    film: endRound(3),
    sync(M, S0, instant, X) { if (!X || !SH10.X) return; if (M.finished() && !M.mission()) finalWorld(X); },
    visits: true,
    unitEnd: () => null,
    /** the opening (rule 3): from the south-east over the court, down to the altar and the kevesh's site in its scaffold; a tap skips it */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        X.line(LINES.stage, 0);
        const shots = [[RD[0][0], RD[0][1]], CAM.open];
        for (let i = 0; i < shots.length; i++) {
          if (acting()) break;
          X.shot(shots[i][0].slice(), shots[i][1].slice(), i ? 2.6 : 0.01);
          if (await tapOr(X, i ? 3000 : 2200)) break;
        }
        if (!acting()) X.line('');
        if (!acting()) { try { X.stages.hero.place({ x: S10.start[0], z: S10.start[1], face: [-38, 20] }); } catch (e) { /* */ } }
        near(X, false);
      })();
    },
    /** the climb (once, alone, no points), the fireworks, the result card */
    async finale(X) {
      const M = X.M, st = M.st; finalWorld(X);
      let figsBack = null; try { figsBack = filmFigs({}); } catch (e) { figsBack = null; }
      try { X.kohen(false); } catch (e) { /* */ }
      let C = null;
      if (!st.finale) {
        try { C = await climb(X, { auto: !!globalThis.__H133_AUTO_CLIMB }); } catch (e) { console.warn('[h133] climb', e && e.message); }
        st.finale = 1; X.save(); SH10.key = ''; finalWorld(X);
      }
      try { X.shot([MID[0] + 48, 62, MID[1] + 58], [MID[0], 20, MID[1] + 10], 2.0); await beat(X, 1600); await fireworks(X); } catch (e) { /* */ }
      if (C) { try { C.gang.clear(); } catch (e) { /* */ } try { X.props.remove(C.root); } catch (e) { /* */ } }
      near(X, false);
      const low = await resultCard(M);
      if (low) { try { X.line(`שוב, לשיפור: ${TITLES[low]}. התחנה מחכה ברמה הבאה`, 4000); } catch (e) { /* */ } }
      h131Card(true);
      if (figsBack) SH10.figsBack = figsBack;
    },
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
