/* ── build 138 ── h138/world.js — the things of stage 15 "קודש הקדשים" in the one world, drawn from the save (spec docs/specs/shlav-15-he.md
 * v4: "המצלמה", "הסדר והחריגים", "ביצוע חוזר"). Every place from BOOK.s15. No figures (the rule of 25.11).
 *   · THE VOID: the Holy of Holies is never drawn ("לא היה בו דבר כלל", Josephus, Wars 5.219): an unlit black block fills KODESH, so
 *     every ray into it from anywhere in the world meets one flat black, no edge, no shade (spec "בדיקה אוטומטית");
 *   · ראשי הפספסין: a light row of stones in the upper chamber's floor over the amah (the form is illustration), and the lulin's lids;
 *   · after work 1: the two parochot hang by themselves (x −138 the outer, x −139 the inner; z ±10; y 22 … 62), deep colours; the two
 *     gold hooks; after work 2: each fold in its hook (the outer open in the south, the inner in the north: Yoma 5:1), the narrow box
 *     hanging at the lul over the amah; a tear stays as a dark seam.
 *   SH15 · initWorld · frameWorld · restWorld · finalWorld · sync */
import { BOOK } from '../world/grid.js';

const B = BOOK.s15;
export const SH15 = { X: null, g: null, key: '', M: null, mats: null };
function mats(X) {
  if (SH15.mats) return SH15.mats;
  const T = X.THREE, std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, ...o });
  SH15.mats = {
    void: new T.MeshBasicMaterial({ color: '#000000' }),
    outer: std('#4A2550'), inner: std('#26346A'), flap: std('#74222A'), gold: std('#E2B54A', { metalness: 0.35, roughness: 0.35, emissive: '#3A2808' }),
    stone: std('#E6DCC6'), wood: std('#6B4A2A'), seam: std('#1E120A'),
  };
  return SH15.mats;
}
const clear = (G) => { for (let i = G.children.length - 1; i >= 0; i--) { const o = G.children[i]; G.remove(o); if (o.geometry) o.geometry.dispose(); } };
function boxAt(X, mat, x0, y0, z0, x1, y1, z1, D, name) {
  const T = X.THREE, m = new T.Mesh(new T.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.name = name || 'h138'; D.add(m); return m;
}
export function sync(X, M) {
  if (!SH15.g || !M) return;
  const st = M.st, key = JSON.stringify([st.done, st.crews, st.hung, (st.flaws || []).length]);
  if (key === SH15.key) return; SH15.key = key;
  const D = SH15.g, Mt = mats(X); clear(D);
  // the void: never drawn (a flat black block inside KODESH, just short of the inner parochet)
  const V = B.kodesh.void; boxAt(X, Mt.void, V.x0 + 0.05, V.y0 + 0.02, V.z0 + 0.05, V.x1, V.y1 - 0.02, V.z1 - 0.05, D, 'h138-void');
  // ראשי הפספסין and the lulin's lids in the upper chamber's floor
  const PS = B.aliyah.pispasin; boxAt(X, Mt.stone, PS.x0, PS.y - 0.02, PS.z0, PS.x1, PS.y + 0.06, PS.z1, D, 'h138-pispasin');
  for (const L of Object.values(B.aliyah.lul)) boxAt(X, Mt.wood, L.x - L.w / 2, B.aliyah.y, L.z - L.w / 2, L.x + L.w / 2, B.aliyah.y + 0.08, L.z + L.w / 2, D, 'h138-lul');
  if (!(st.hung || M.hungWanted())) return;
  const PO = B.parochet.outer, PI = B.parochet.inner, th = B.parochet.thick, done2 = M.built('parochot');
  // the two parochot: open (folded into the hook) at opposite ends once work 2 is done — the outer from the south, the inner from the north
  const gap = done2 ? 1.6 : 0;
  boxAt(X, Mt.outer, PO.x - th / 2, PO.y0, PO.z0, PO.x + th / 2, PO.y1, PO.z1 - gap, D, 'h138-outer');
  boxAt(X, Mt.inner, PI.x - th / 2, PI.y0, PI.z0 + gap, PI.x + th / 2, PI.y1, PI.z1, D, 'h138-inner');
  if (done2) {
    boxAt(X, Mt.flap, PO.x + th / 2, PO.y0, PO.z1 - gap - 0.4, PO.x + th / 2 + 0.25, PO.y1, PO.z1 - gap, D, 'h138-fold');   // (the doubled head, toward the Heichal)
    boxAt(X, Mt.flap, PI.x + th / 2, PI.y0, PI.z0 + gap, PI.x + th / 2 + 0.25, PI.y1, PI.z0 + gap + 0.4, D, 'h138-fold');   // (the inner's, toward the amah)
    const TA = B.teivahAmah; boxAt(X, Mt.wood, TA.x - TA.w / 2, B.aliyah.y - 2.2, TA.z - TA.w / 2, TA.x + TA.w / 2, B.aliyah.y - 0.6, TA.z + TA.w / 2, D, 'h138-teivah');
  }
  for (const K of [B.keres.south, B.keres.north]) boxAt(X, Mt.gold, K.x - 0.12, K.y - 0.12, K.z - 0.12, K.x + 0.12, K.y + 0.12, K.z + 0.12, D, 'h138-keres');
  // a tear stays as a dark seam at the edge (ביצוע חוזר: "קרע בשפה נשאר כתפר כהה")
  const tears = (st.flaws || []).filter((x) => x.f === 'parochot.tear').length;
  for (let i = 0; i < Math.min(4, tears); i++) boxAt(X, Mt.seam, PO.x + th / 2, PO.y0 + 2 + i * 3, PO.z1 - gap - 0.5, PO.x + th / 2 + 0.03, PO.y0 + 3.2 + i * 3, PO.z1 - gap - 0.42, D, 'h138-tear');
}
function build(X) { const T = X.THREE, g = new T.Group(); g.name = 'h138-site'; X.props.root.add(g); SH15.g = g; }
export function initWorld(X) {
  SH15.X = X; SH15.M = X.M; mats(X);
  try { window.__H138_SH = SH15; } catch (e) { /* (the probes' eyes) */ }
  if (!SH15.g) build(X);
  SH15.key = ''; sync(X, X.M);
}
let jT = 0;
export function frameWorld(dt, X) { if (!SH15.X) return; SH15.M = X.M; jT -= dt; if (jT <= 0) { jT = 0.4; sync(X, X.M); } }
export function restWorld(X, M) {
  SH15.X = X; SH15.M = M; mats(X); if (!SH15.g) build(X); SH15.key = ''; sync(X, M);
  try { if (!SH15.tick) { SH15.tick = true; const go = () => { try { frameWorld(1 / 60, SH15.X); } catch (e) { /* */ } requestAnimationFrame(go); }; requestAnimationFrame(go); } } catch (e) { /* */ }
}
export function finalWorld(X) { if (!SH15.X) return; SH15.key = ''; sync(X, X.M); }
