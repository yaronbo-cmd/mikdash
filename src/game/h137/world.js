/* ── build 137 ── h137/world.js — the things of stage 14 "ההיכל" in the one world, drawn from the save (spec docs/specs/shlav-14-he.md
 * v3: "הסדר והחריגים", "ביצוע חוזר", "טבלת ההפסד", "המראה"). Every place from BOOK.s14. The old game's Heichal model is the stage's own
 * (stages.stageOwn('heichal'): hidden for good); this draws the House as he builds it, no figures (the rule of 25.11):
 *   · the Heichal's floor (y 22), its north and south walls (z ±10 … ±15) and the west wall (x −165 … −159), RISING by themselves:
 *     at the stage's start to the cells' height (37), after work 1 to 62, after work 2 to the roof (112) and the parapet (115);
 *   · the cells' wing north, south and west (three storeys to 37, the mesibah's wall): massing, its inside is work 1's own section;
 *   · after work 2: the two ceilings (62 … 67 and 107 … 112, Middot 4:6: the kiyor gilded, the beit dilfa, the nesarim, the ma'aziva),
 *     the roof and its parapet with the "כלה עורב" spikes (dark, no word of their metal; no sound); the four doors hung by themselves:
 *     the inner leaves open 180° flat on the east wall's inner face (z ±5 … ±10, y 22 … 42: "אחר הדלתות"), the outer ones on the
 *     opening's sides (המחשה, Gemini's geometry, spec "הדלתות");
 *   · the gold of each wall he gilded (level 1 north, 2 east above the doors, 3 south), its seams where a leaf failed; the finale's
 *     burnish turns all of it from matte to polished (SH14.shine 0 … 1);
 *   · the carpenters' yard in the wood chamber of the women's court: the bench, the pile of his boards, the heap of chips (it stays);
 *   · the champion's seal.
 * An act holds what it shows itself: SH14.own (wing: work 1's section; yard: work 2's bench; gold:<wall>: work 3's wall).
 *   SH14 · own(k, on) · initWorld · frameWorld · restWorld · finalWorld · floorAt14 · wallsTarget
 */
import { BOOK } from '../world/grid.js';
import { box } from './look.js';
import { mats14 } from './look.js';

const S14 = BOOK.s14, F = S14.floor, FL = S14.hallFloor, H = S14.heichal, KD = S14.kodesh, TA = S14.taim, W = TA.wing, YD = S14.yard, ZB = S14.zahav, TK = S14.tikra, RF = S14.roof;
const WEST = [-165, -159], NS = [10, 15];
export const SH14 = { X: null, g: null, key: '', own: {}, M: null, H: 37, HT: 37, shine: 0, refs: null };
export function own(k, on) { if (on) SH14.own[k] = 1; else delete SH14.own[k]; SH14.key = ''; }
const clear = (G) => { for (let i = G.children.length - 1; i >= 0; i--) { const o = G.children[i]; G.remove(o); o.traverse((c) => { if (c.geometry && c.geometry !== SH14.X.props.geo.box && !(c.geometry.userData && c.geometry.userData.keep)) c.geometry.dispose(); }); } };
/** the walls' height wanted by the save: the cells' height; 62 after work 1; the parapet's top after work 2 */
export function wallsTarget(M) {
  const w = M ? Math.max(M.st.walls | 0, M.wallsWanted()) : 0;
  return w >= 2 ? RF.parapet : w >= 1 ? TK.one[0] : TA.roof;
}
const roofed = (M) => !!M && Math.max(M.st.walls | 0, M.wallsWanted()) >= 2;
/** a wall in gold: the one he gilded at its level; once the stage's round is done the House's other walls are gilt too (by themselves, as
 *  the walls rose: no crews) — the finale burnishes "all the Heichal's gold" (spec הסיום), its last seam on the south wall */
const gilt = (M, lv) => !!M && (M.st.crews || M.isDone('zahav' + lv) || M.finished());

function floorAndShell(X, Mt, D, Ht) {
  box(X, Mt.y14stoneB, KD.x0 - 6, F, H.z0, H.x1, FL, H.z1, D).name = 'h137-floor';          // (the Heichal's and the Holy of Holies' floor)
  const top = Math.min(Ht, RF.y);
  for (const s of [-1, 1]) box(X, Mt.y14stone, WEST[0], F, s * NS[0], H.x1, top, s * NS[1], D).name = 'h137-wall';
  box(X, Mt.y14stone, WEST[0], F, -NS[1], WEST[1], top, NS[1], D).name = 'h137-wall';
}
function wing(X, Mt, D, Ht) {
  if (SH14.own.wing) return;
  const top = Math.min(Ht, TA.roof);
  box(X, Mt.y14stoneB, W.x0, F, W.n.z0, W.x1, top, -NS[1], D).name = 'h137-wing';
  box(X, Mt.y14stoneB, W.x0, F, NS[1], W.x1, top, W.s.z1, D).name = 'h137-wing';
  box(X, Mt.y14stoneB, W.x0, F, -NS[1], WEST[0], top, NS[1], D).name = 'h137-wing';
}
function ceilings(X, Mt, D, M) {
  if (!roofed(M) || SH14.H < TK.two[TK.two.length - 1] - 0.5) return;
  const x0 = KD.x0, x1 = H.x1, z0 = H.z0, z1 = H.z1;
  for (const L of [TK.one, TK.two]) {
    box(X, Mt.y14goldMatte, x0, L[0], z0, x1, L[1], z1, D).name = 'h137-kiyor';               // (the kiyor: the lower beam, gilded and painted — Bartenura)
    box(X, Mt.y14cedar, x0, L[1], z0, x1, L[2], z1, D).name = 'h137-dilfa';                   // (beit dilfa)
    box(X, Mt.y14plank, x0, L[2], z0, x1, L[3], z1, D).name = 'h137-nesarim';                 // (the nesarim: his boards)
    box(X, Mt.y14stoneD, x0, L[3], z0, x1, L[4], z1, D).name = 'h137-maaziva';
  }
  // his boards in the lower ceiling: one plank per board he planed, the scarred ones darker (seen from inside)
  const pl = (M.st.planks || []).slice(-12), T = X.THREE;
  pl.forEach((p, i) => { const z = z0 + 0.8 + i * 1.5; if (z > z1 - 0.8) return; const m = box(X, p.scars && p.scars.length ? Mt.y14woodD : Mt.y14woodL, x0 + 2, TK.one[2] - 0.05, z - 0.6, x1 - 2, TK.one[2], z + 0.6, D); m.castShadow = false; void T; });
  // the roof, the parapet and its spikes
  box(X, Mt.y14stoneB, WEST[0], RF.y, -NS[1], H.x1, RF.y + 0.6, NS[1], D).name = 'h137-roof';
  const p = (x0_, z0_, x1_, z1_) => box(X, Mt.y14stone, x0_, RF.y, z0_, x1_, RF.parapet, z1_, D);
  p(WEST[0], -NS[1], H.x1, -NS[1] + 0.6); p(WEST[0], NS[1] - 0.6, H.x1, NS[1]); p(WEST[0], -NS[1], WEST[0] + 0.6, NS[1]);
  const T2 = X.THREE, n = RF.spikes.n | 0 || 24, geo = new T2.ConeGeometry(0.12, RF.top - RF.parapet, 5);
  const im = new T2.InstancedMesh(geo, Mt.y14spike, n * 2); im.name = 'h137-spikes'; im.frustumCulled = false; const m4 = new T2.Matrix4();
  for (let i = 0; i < n; i++) { const x = WEST[0] + 1 + i * ((H.x1 - WEST[0] - 2) / (n - 1)); for (const s of [0, 1]) { m4.makeTranslation(x, RF.parapet + (RF.top - RF.parapet) / 2, (s ? 1 : -1) * (NS[1] - 0.3)); im.setMatrixAt(i * 2 + s, m4); } }
  D.add(im);
}
function doors(X, Mt, D, M) {
  if (!roofed(M)) return;
  const DR = ZB.doors, gold = gilt(M, 2) || M.finished(), mt = gold ? Mt.y14goldMatte : Mt.y14cedar;
  // the inner leaves: open 180°, flat on the east wall's inner face (x −98), z ±5 … ±10 — "אחר הדלתות" not gilded
  // (while he gilds the east wall the leaves stand swung to, out of the way: the band runs along their tops)
  if (!SH14.own['gold:east']) for (const [za, zb] of DR.inner.lie) box(X, Mt.y14cedar, H.x1 - 0.3, DR.inner.y0, za, H.x1 - 0.02, DR.inner.y1, zb, D).name = 'h137-door-in';
  // the outer leaves: on the opening's sides, inside its thickness (x −97 … −92)
  for (const s of [-1, 1]) box(X, mt, DR.outer.lie[0], DR.inner.y0, s * 5 - (s > 0 ? 0.25 : -0.25), DR.outer.lie[1], DR.inner.y1, s * 5, D).name = 'h137-door-out';
}
function gold(X, Mt, D, M) {
  const T = X.THREE, mat = SH14.shine > 0.5 ? Mt.y14gold : Mt.y14goldMatte, out = [];
  const plane = (w, h, x, y, z, ry) => { const q = new T.Mesh(new T.PlaneGeometry(w, h), mat); q.position.set(x, y, z); q.rotation.y = ry; q.name = 'h137-gilt'; D.add(q); out.push(q); return q; };
  if (gilt(M, 1) && !SH14.own['gold:north']) plane(H.x1 - H.x0, H.y1 - FL, (H.x0 + H.x1) / 2, (FL + H.y1) / 2, H.z0 + 0.03, 0);
  if (gilt(M, 3) && !SH14.own['gold:south']) plane(H.x1 - H.x0, H.y1 - FL, (H.x0 + H.x1) / 2, (FL + H.y1) / 2, H.z1 - 0.03, Math.PI);
  if (gilt(M, 2) && !SH14.own['gold:east']) { const y0 = ZB.doors.inner.y1; plane(H.z1 - H.z0, H.y1 - y0, H.x1 - 0.03, (y0 + H.y1) / 2, 0, -Math.PI / 2); }
  // the seams where a leaf failed (kept: "נשאר תפר"), at the band of the segment
  for (const x of M.st.flaws || []) {
    if (!/^zahav\./.test(x.f)) continue;
    const wall = x.lv === 1 ? ZB.north : x.lv === 2 ? ZB.east : ZB.south, n = x.lv === 1 ? 4 : x.lv === 2 ? 6 : 8, mid = (wall.a0 + wall.a1) / 2, s = mid - n * 1.4 + ((x.at | 0) + 0.5) * 2.8;
    const p = wall.axis === 'x' ? [s, wall.face + wall.normal[1] * 0.05] : [wall.face + wall.normal[0] * 0.05, s];
    const m = box(X, Mt.y14scar, p[0] - 0.04, 33.4, p[1] - 0.04, p[0] + 0.04, 34.6, p[1] + 0.04, D); m.name = 'h137-seam';
  }
  return out;
}
function yard(X, Mt, D, M) {
  if (SH14.own.yard || !(M.built('hakzaa') || M.st.crews)) return;
  const B = YD.bench, FY = YD.floor, top = FY + B.h;
  for (const s of [-1, 1]) box(X, Mt.y14woodD, B.x + s * 1.1 - 0.2, FY, B.z - 0.6, B.x + s * 1.1 + 0.2, top, B.z + 0.6, D);
  const n = Math.min(12, Math.max(3, (M.st.planks || []).length));
  for (let i = 0; i < n; i++) { const m = box(X, Mt.y14plank, YD.pile[0] - 1.5, FY + 0.1 + i * 0.1, YD.pile[1] - 0.45, YD.pile[0] + 1.5, FY + 0.18 + i * 0.1, YD.pile[1] + 0.45, D); m.rotation.y = Math.PI / 2 + (i % 2 ? 0.04 : -0.03); }
  const T = X.THREE, heap = new T.Mesh(new T.SphereGeometry(0.9, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), Mt.y14chip); heap.scale.set(1.3, 0.45, 1); heap.position.set(YD.chips[0], FY, YD.chips[1]); heap.name = 'h137-chips'; D.add(heap);
}
function champion(X, Mt, D, on) {
  if (!on) return; const T = X.THREE, [x, z] = S14.champion;
  const s = new T.Mesh(new T.CylinderGeometry(0.9, 1.0, 0.25, 20), Mt.y14gold); s.position.set(x, F + 0.12, z); s.name = 'h137-champion'; D.add(s);
}
function sync(X, M) {
  if (!SH14.g || !M) return;
  const st = M.st, Hk = Math.round(SH14.H * 2) / 2;
  const key = JSON.stringify([st.done, st.crews, st.flaws.length, (st.planks || []).length, Object.keys(SH14.own), st.champion, st.walls, Hk, SH14.shine > 0.5]);
  if (key === SH14.key) return;
  SH14.key = key;
  const D = SH14.g, Mt = mats14(X); clear(D);
  floorAndShell(X, Mt, D, SH14.H); wing(X, Mt, D, SH14.H);
  ceilings(X, Mt, D, M); doors(X, Mt, D, M);
  const G = gold(X, Mt, D, M);
  yard(X, Mt, D, M);
  champion(X, Mt, D, !!st.champion);
  SH14.refs = { gold: G };
}
/* ───────── the floor: the Heichal and its door (y 22) ───────── */
const PREV = { f: null, busy: false };
export function floorAt14(x, z) {
  if (x >= KD.x0 && x <= H.x1 && Math.abs(z) <= H.z1) return FL;
  if (x > H.x1 - 0.01 && x <= -92 && Math.abs(z) <= 5) return FL;
  if (x > -96.2 && x <= -92 && z >= -20.7 && z <= -7) return FL;   // (the pishpash's passage through the east wall: work 1's way in)
  if (!PREV.f || PREV.busy) return null;
  PREV.busy = true; try { return PREV.f(x, z); } finally { PREV.busy = false; }
}
function floorSet(X) {
  const S0 = X.stages; if (!S0 || !S0.floorHook) return;
  try { const cur = S0.floorHookOf ? S0.floorHookOf() : null; if (cur && cur !== floorAt14) PREV.f = cur; } catch (e) { /* */ }
  S0.floorHook(floorAt14);
}
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('heichal', true); } catch (e) { /* */ } }
function build(X) { const T = X.THREE, g = new T.Group(); g.name = 'h137-site'; X.props.root.add(g); SH14.g = g; }
export function initWorld(X) {
  mats14(X); SH14.X = X; SH14.M = X.M;
  try { window.__H137_SH = SH14; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X); floorSet(X);
  if (!SH14.g) build(X);
  if (X.M && X.M.st && (X.M.st.intro || X.M.st.crews)) SH14.H = wallsTarget(X.M);
  SH14.HT = wallsTarget(X.M);
  SH14.key = ''; sync(X, X.M);
}
let jT = 0, dT = 0;
export function frameWorld(dt, X, loop) {
  if (!SH14.X) return; SH14.M = X.M;
  const now = performance.now(); if (loop && now - (SH14.lastF || 0) < 80) return; if (!loop) SH14.lastF = now;
  jT -= dt; if (jT <= 0) { jT = 0.4; modelHide(X); floorSet(X); SH14.HT = wallsTarget(X.M); sync(X, X.M); }
  // the walls rise by themselves (dust and the stones' sound at the top course): no crews
  if (SH14.H < SH14.HT - 1e-3) {
    SH14.H = Math.min(SH14.HT, SH14.H + (SH14.fast || 6) * dt);
    dT -= dt; if (dT <= 0) { dT = 0.5; try { X.dust(-118 + ((now / 400) % 5) * 8, SH14.H, -12.5, 3, 3); X.dust(-118 + ((now / 400) % 5) * 8, SH14.H, 12.5, 3, 3); } catch (e) { /* */ } }
    if (Math.abs(SH14.H - (SH14.lastH || 0)) > 1) { SH14.lastH = SH14.H; sync(X, X.M); }
  } else if (SH14.H > SH14.HT + 1e-3) { SH14.H = SH14.HT; sync(X, X.M); }
}
export function restWorld(X, M) {
  mats14(X); SH14.X = X; SH14.M = M; modelHide(X); floorSet(X); if (!SH14.g) build(X); SH14.H = wallsTarget(M); SH14.HT = SH14.H; SH14.key = ''; sync(X, M);
  try { if (!SH14.tick) { SH14.tick = true; const go = () => { try { frameWorld(1 / 60, SH14.X, true); } catch (e) { /* */ } requestAnimationFrame(go); }; requestAnimationFrame(go); } } catch (e) { /* */ }
}
export function finalWorld(X) { if (!SH14.X) return; if (X.M && X.M.st.finale) SH14.shine = 1; SH14.key = ''; sync(X, X.M); }
export { sync };
