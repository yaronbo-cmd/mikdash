/* ── build 132 ── h132/world.js — the things of stage 09 in the one world, drawn from the save (THE CORE'S FILE: the lead's).
 *
 * The block's state machine (h132/model.js BLOCK): 'site' (stage 08's white yesod, drawn by h131/world.js) → 'formLying' (the four
 * walls lying round it: three outside, the west one on the yesod's top inward) → 'formUp' (the four walls standing and locked, the
 * stakes, the patched board if one cracked; the ramp from the north with its three sleds for the fill) → 'filled' (the top surface with
 * its dents and bumps, the bulged boards) → 'bare' (the white block with every flaw on it; the walls lying where they fell, the timber
 * on the pile) → 'lined' (the red line six tefachim under the top). The state drawn is M.block(): the open work's start (stage(kind,
 * lv, save)) or, with none open, the state after the last kind done. The old model of the sovev (temple.js set 'sovev': the block and
 * its red line) stays hidden from the stage's start, in this stage and every later one (stages.stageOwn): this world draws the block as
 * he built it, flaws and all.
 *
 * Simple, final-shaped geometry (phase 0): the walls are one object each, hinged at their foot (rotation is how lane A raises and drops
 * them: wallSet(k, angle)); each has its tongue (N, S) or its sockets (E, W) visible from afar at the corners.
 * The lanes draw their own things in their own files and register them here (addLane): each { init(X, M), frame(dt, X, M), sync(X, M),
 * rest(X, M), owns?(k) } (any may be missing); a lane that owns a thing while its act plays says so (owns('walls'), owns('block') …)
 * and this world leaves it to the lane.
 *
 *   SH9 · mats(X) · addLane(L) · wallSet(k, deg) · initWorld(X) · frameWorld(dt, X) · restWorld(X, M) · finalWorld(X)
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';

const S9 = BOOK.s09, B = S9.block, T = S9.T, Y0 = S9.base, Y1 = S9.top, H = S9.H, F = S9.floor;
export const SH9 = { X: null, g: null, key: '', walls: null, t: 0, clear: null };
/** (build 132, item 10: a clean site for work 4) the strip's act calls siteClear(true) when its last part is off, before its closing film:
 *  while the world is still in the work's pre-state ('filled') the sills and the timber of the form are drawn as after it (none round the
 *  block; the strip's timber on the pile). It holds for that work only: a new work (st.cur changes) or siteClear(false) ends it */
export function siteClear(v) { const M = SH9.X && SH9.X.M; SH9.clear = v ? (M && M.st && M.st.cur) || '?' : null; SH9.key = ''; }
const LANES = [];
/** a lane's things in the world (called once by the lane's own file) */
export function addLane(L) { if (L && !LANES.includes(L)) LANES.push(L); return L; }
const owns = (what) => LANES.some((L) => { try { return !!(L.owns && L.owns(what)); } catch (e) { return false; } });
const lane = (f, ...a) => { for (const L of LANES) { try { if (L && L[f]) L[f](...a); } catch (e) { console.warn('[h132] lane', f, e && e.message); } } };

/* ───────── materials (painted when the view is made: no black first frame) ───────── */
export function mats(X) {
  const P0 = X.props, Tt = X.THREE;
  if (P0.M.y9wood) return P0.M;
  const std = (c, o = {}) => new Tt.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  P0.M.y9wood = std('#9C7046', { roughness: 0.86 });      // the form's boards
  P0.M.y9woodD = std('#6B4728', { roughness: 0.88 });     // battens, stakes, the sockets' housing
  P0.M.y9tongue = std('#D2A066', { roughness: 0.8 });     // the tongue: lighter, seen from afar
  P0.M.y9socket = std('#3A2614');                         // the socket's dark mouth
  P0.M.y9patch = std('#C9B08A', { roughness: 0.9 });      // a patched board (another shade)
  P0.M.y9mix = std('#9E927E', { roughness: 0.82 });       // the fill's top, wet stones and mix (illustration)
  P0.M.y9white = std('#FFFFFF', { roughness: 0.6, emissive: '#3A3730' });   // the block whitened
  P0.M.y9nest = std('#8A8070');                           // bare stones of a nest
  P0.M.y9scar = std('#B9B1A2');                           // a torn corner, a torn patch, a bulge's mark
  P0.M.y9red = std('#B3261E', { roughness: 0.55, emissive: '#3A0806' });   // the red line
  P0.M.y9earth = std('#A08A64');                          // the ramp's packed earth (illustration)
  return P0.M;
}

/* ───────── the walls: one object each, hinged at its foot ───────── */
// each wall: its hinge (x, y, z), the axis it turns on ('x' for N/S, 'z' for E/W), the sign that lays it outward (W: inward), its length
const W9 = S9.wall;
const HINGE = {
  N: { p: [B[0], Y0, W9.N.z], ax: 'x', out: -1, L: B[2] - B[0], inw: +1 },   // (thickness toward +z, the block)
  S: { p: [B[0], Y0, W9.S.z], ax: 'x', out: +1, L: B[2] - B[0], inw: -1 },
  E: { p: [W9.E.x, Y0, B[1] - T], ax: 'z', out: +1, L: B[3] - B[1] + 2 * T, inw: -1 },   // (E and W run T past each corner: the sockets' housing)
  W: { p: [B[0], Y0, B[1] - T], ax: 'z', out: +1, L: B[3] - B[1] + 2 * T, inw: -1, inside: true },   // (the west one lies inward: hinged at its inner foot)
};
/** the lying tilt: the head of an outer wall rests on the floor one amah under its foot (the yesod's top or the sill): asin(1/5) */
const TILT = Math.asin((Y0 - F) / H);
function wallBuild(X, k, g) {
  const Tt = X.THREE, Mt = mats(X), hg = HINGE[k], grp = new Tt.Group(); grp.name = 'h132-wall-' + k; g.add(grp);
  grp.position.set(...hg.p);
  // (in the group's own frame the wall stands from y 0 to H; along +x (N, S) or +z (E, W); its thickness toward the block)
  const along = hg.ax === 'x' ? 'x' : 'z', L = hg.L;
  const bx = (mat, a0, a1, y0, y1, t0, t1) => (along === 'x' ? box(X, mat, a0, y0, t0, a1, y1, t1, grp) : box(X, mat, t0, y0, a0, t1, y1, a1, grp));
  const th = hg.inside || hg.inw < 0 ? [-T, 0] : [0, T];   // (W: hinged at its inner foot x −53, its board −T … 0 from there)
  bx(Mt.y9wood, 0, L, 0, H, th[0], th[1]);
  // battens on the outer face (three, across the boards) — the boards read as boards
  const outF = hg.inside ? th[0] : hg.inw > 0 ? th[0] : th[1], o = hg.inside ? -0.08 : hg.inw > 0 ? -0.08 : 0.08;
  for (const a of [0.12, 0.5, 0.88]) bx(Mt.y9woodD, a * L - 0.18, a * L + 0.18, 0.15, H - 0.15, outF, outF + o);
  const tg = [];
  if (k === 'N' || k === 'S') {
    // the tongues: past each end of the board into the corner, as long as the wall is thick, and proud of the E/W walls' outer face
    // (lighter wood: seen from afar)
    for (const [a0, a1] of [[-T - 0.14, 0], [L, L + T + 0.14]]) tg.push(bx(Mt.y9tongue, a0, a1, 0.6, H - 0.6, th[0] + 0.06, th[1] - 0.06));
  } else {
    // the sockets: a dark mouth on the outer face at each end, where the tongue of N and S comes through
    for (const [a0, a1] of [[0, T], [L - T, L]]) tg.push(bx(Mt.y9socket, a0 - 0.02, a1 + 0.02, 0.5, H - 0.5, outF, outF + o * 1.2));
  }
  const marks = new Tt.Group(); marks.name = 'h132-wall-marks-' + k; grp.add(marks);
  return { k, grp, marks, deg: 90 };
}
/** a wall's angle (90 standing, 0 lying; outer walls lie on the floor at the tilt, the west one flat on the yesod's top) */
export function wallSet(k, deg) {
  const W = SH9.walls && SH9.walls[k]; if (!W) return;
  W.deg = deg; const hg = HINGE[k], u = Math.max(0, Math.min(1, deg / 90)), lie = hg.inside ? Math.PI / 2 : Math.PI / 2 + TILT;
  const a = (1 - u) * lie;   // (0 standing … lie lying)
  if (hg.ax === 'x') W.grp.rotation.set(hg.out < 0 ? -a : a, 0, 0);   // (N lies toward −z, S toward +z)
  else W.grp.rotation.set(0, 0, -a);                                   // (E outward to +x; W inward to +x: both turn the same way)
}

/* ───────── the world's things by the block's state ───────── */
function build(X) {
  const Tt = X.THREE, g = new Tt.Group(); g.name = 'h132-site'; X.props.root.add(g);
  const drawn = new Tt.Group(); drawn.name = 'h132-drawn'; g.add(drawn);
  SH9.g = g; SH9.drawn = drawn;
  SH9.walls = {}; for (const k of ['N', 'S', 'E', 'W']) SH9.walls[k] = wallBuild(X, k, g);
}
const ORDER = ['site', 'formLying', 'formUp', 'filled', 'bare', 'lined'];
const at = (s, s0) => ORDER.indexOf(s) >= ORDER.indexOf(s0);
function sync(X, M) {
  if (!SH9.g || !M) return;
  const st = M.st, blk = M.block ? M.block() : 'site', cur = st.cur || '';
  if (SH9.clear && SH9.clear !== cur) SH9.clear = null;
  const clean = !!SH9.clear;   // (the strip done, its film still in the pre-state: the site drawn clean)
  const key = [blk, cur, st.done.join(','), st.flaws.length, st.crews, owns('walls'), owns('block'), owns('ramp'), owns('line'), clean].join('|'); if (key === SH9.key) return; SH9.key = key;
  const D = SH9.drawn, Mt = mats(X), Tt = X.THREE;
  while (D.children.length) D.remove(D.children[0]);
  for (const k of ['N', 'S', 'E', 'W']) { const G = SH9.walls[k].marks; while (G.children.length) G.remove(G.children[0]); }
  const flaws = st.flaws || [], has = (f) => flaws.filter((x) => x.f === f);
  // the walls: lying (formLying; after the strip, where they fell), standing (formUp, filled); none on the site
  const wallsOn = blk !== 'site';
  if (!owns('walls')) for (const k of ['N', 'S', 'E', 'W']) {
    SH9.walls[k].grp.visible = wallsOn;
    wallSet(k, blk === 'formUp' || blk === 'filled' ? 90 : 0);
  }
  // (phase 1 decision 3: lowered off the steps by the pullers and laid flat beside the timber pile, along x — its hinge at its west end)
  if (!owns('walls') && at(blk, 'bare')) { const W = SH9.walls.W, [cx, cz] = S9.wallRest.W; W.grp.position.set(cx - HINGE.W.L / 2, F, cz + H / 2); W.grp.rotation.set(0, Math.PI / 2, -Math.PI / 2); }
  else if (SH9.walls.W) SH9.walls.W.grp.position.set(...HINGE.W.p);
  // the sills under the south and east walls (the proposed footing over the strip with no yesod: stage 08's timbers, as the book has
  // them), while the form stands or lies there
  if (at(blk, 'formLying') && !at(blk, 'bare') && !clean) for (const k of ['E', 'S']) { const b = S9.sill[k]; box(X, Mt.y9woodD, b[0], F, b[1], b[2], Y0, b[3], D); }
  // a patched board (work 1's crack): on its wall's outer face, until the strip and after it with the wall
  for (const c of has('form.crack')) {
    const k = c.wall || 'N', W = SH9.walls[k]; if (!W) continue;
    const hg = HINGE[k], L = hg.L, a = 0.3 + 0.1 * ((c.n | 0) % 5), outF = hg.inside ? -T : 0, o = hg.inw > 0 || hg.inside ? -0.1 : 0.1;   // (the outer face in the wall's own frame)
    const m = hg.ax === 'x' ? box(X, Mt.y9patch, a * L - 1.2, 1.2, outF, a * L + 1.2, 2.4, outF + o, W.marks) : box(X, Mt.y9patch, outF, 1.2, a * L - 1.2, outF + o, 2.4, a * L + 1.2, W.marks);
    m.name = 'h132-patch';
  }
  // the stakes at the corners (from the form's standing on: the four "בכל מקרה")
  if (at(blk, 'formUp')) for (const k of ['NE', 'SE', 'SW', 'NW']) { const [x, z] = S9.corner[k], s = new Tt.Mesh(X.props.geo.stake, Mt.y9woodD); s.scale.set(1.1, 1.0, 1.1); s.position.set(x + (k.includes('E') ? 0.45 : -0.45), Y0, z + (k.includes('S') ? 0.45 : -0.45)); s.castShadow = true; D.add(s); }
  // the ramp from the north for the fill, its three sleds (while the form stands and the fill is ahead; gone before the strip)
  if (blk === 'formUp' && !owns('ramp')) {
    const R = S9.ramp, dz = R.head[1] - R.foot[1], dy = R.headY - R.footY, len = Math.hypot(dz, dy), ang = Math.atan2(dy, dz);
    const rp = new Tt.Mesh(X.props.geo.box, Mt.y9earth); rp.scale.set(R.w, 0.6, len); rp.position.set(R.foot[0], (R.footY + R.headY) / 2 - 0.3, (R.foot[1] + R.head[1]) / 2); rp.rotation.x = -ang; rp.castShadow = rp.receiveShadow = true; rp.name = 'h132-ramp'; D.add(rp);
    for (const [x, z] of S9.sleds) { const u = (z - R.foot[1]) / dz, y = R.footY + dy * u; const sd = box(X, Mt.y9wood, x - 1.1, y, z - 1.6, x + 1.1, y + 0.5, z + 1.6, D); sd.rotation.x = -ang; sd.name = 'h132-sled'; }
  }
  // the fill's top (filled): the mix at the rim, its dents and bumps where the layers closed uneven, and a centre dent
  if (blk === 'filled' && !owns('block')) {
    box(X, Mt.y9mix, B[0], Y1 - 0.25, B[1], B[2], Y1 - 0.02, B[3], D);
    for (const u of [...has('fill.uneven'), ...has('fill.dent')]) { const z = S9.zone[u.zone || 'C'] || S9.mid, up = u.f === 'fill.uneven' && (u.n | 0) > 0; const b = box(X, up ? Mt.y9mix : Mt.y9nest, z[0] - 1.6, Y1 - (up ? 0.02 : 0.3), z[1] - 1.6, z[0] + 1.6, Y1 + (up ? 0.35 : -0.2), z[1] + 1.6, D); b.name = 'h132-' + u.f; }
  }
  // the bulged boards (work 2): the wall bowed outward at its middle while it stands
  if ((blk === 'filled') && !owns('walls')) for (const b of has('fill.bulge')) { const k = b.wall || 'N', g0 = S9.gauge[k], n = k === 'N' ? [0, -1] : k === 'S' ? [0, 1] : k === 'E' ? [1, 0] : [-1, 0]; const w = 4, d = 0.35, x = g0[0] + n[0] * d / 2, z = g0[1] + n[1] * d / 2; const m = box(X, Mt.y9wood, x - (n[0] ? d / 2 : w), Y0 + 1, z - (n[1] ? d / 2 : w), x + (n[0] ? d / 2 : w), Y1 - 1, z + (n[1] ? d / 2 : w), D); m.name = 'h132-bulge'; }
  // the block exposed: white, with every flaw on it
  if (at(blk, 'bare') && !owns('block')) {
    box(X, Mt.y9white, B[0], Y0, B[1], B[2], Y1, B[3], D).name = 'h132-block';
    const face = (k, a, y0, y1, w, mat, nm) => {   // (a mark on face k at `a` amot along the walk's run of that wall, out by 0.04)
      const R = S9.run[k], L = Math.hypot(R.to[0] - R.from[0], R.to[1] - R.from[1]), ux = (R.to[0] - R.from[0]) / L, uz = (R.to[1] - R.from[1]) / L, x = R.from[0] + ux * a, z = R.from[1] + uz * a;
      const n = k === 'N' ? [0, -1] : k === 'S' ? [0, 1] : k === 'E' ? [1, 0] : [-1, 0], e = 0.06;
      const m = box(X, mat, Math.min(x - Math.abs(ux) * w / 2, x + n[0] * e), y0, Math.min(z - Math.abs(uz) * w / 2, z + n[1] * e), Math.max(x + Math.abs(ux) * w / 2, x + n[0] * e), y1, Math.max(z + Math.abs(uz) * w / 2, z + n[1] * e), D); m.name = 'h132-' + nm; return m;
    };
    // (spec line 286: "משטח מחוספס באורך אמה בערך" — a rough, broken patch about one amah long in the block's own white: small lumps and
    //  hollows out of the face, their shading the roughness; fixed, no chance)
    const rough = (k, a, yc, nm) => {
      const g = []; for (let i = 0; i < 9; i++) {
        const du = ((i * 0.618) % 1 - 0.5) * 1.0, dy = ((i * 0.381 + 0.2) % 1 - 0.5) * 0.9, w = 0.18 + ((i * 0.27) % 1) * 0.26, out = i % 3 === 2 ? 0.02 : 0.05 + ((i * 0.41) % 1) * 0.12;
        const m = face(k, a + du, yc + dy - w / 2, yc + dy + w / 2, w, i % 4 === 3 ? Mt.y9scar : Mt.y9white, nm);
        const n = k === 'N' ? [0, -1] : k === 'S' ? [0, 1] : k === 'E' ? [1, 0] : [-1, 0], d = 0.1 + out;   /* (a lump d deep, its middle 0.07 out of the face: partly sunk into it, partly standing out) */ if (n[0]) { m.scale.x = d; m.position.x += n[0] * 0.04; } else { m.scale.z = d; m.position.z += n[1] * 0.04; } m.rotation.y = (i - 4) * 0.07; g.push(m);
      }
      return g;
    };
    has('fill.bulge').forEach((b) => rough(b.wall || 'N', S9.side / 2, (Y0 + Y1) / 2, 'bulgemark'));
    has('fill.nest').forEach((b, i) => { const z = b.zone || 'NE', k = z === 'NE' ? 'E' : z === 'NW' ? 'N' : z === 'SW' ? 'W' : 'S'; rough(k, 26 - i * 0.4, Y0 + 1, 'nest'); });
    has('fill.dent').forEach(() => { box(X, Mt.y9nest, S9.mid[0] - 1, Y1 - 0.25, S9.mid[1] - 1, S9.mid[0] + 1, Y1 + 0.005, S9.mid[1] + 1, D).name = 'h132-dent'; });
    has('strip.torn').forEach((b, i) => { const k = ['SE', 'NE', 'NW', 'SW'][i % 4], [x, z] = b.at && Array.isArray(b.at) ? b.at : S9.corner[k], sx = x > S9.mid[0] ? -1 : 1, sz = z > S9.mid[1] ? -1 : 1; box(X, Mt.y9scar, Math.min(x, x + sx * 0.9), Y0 + 1.5, Math.min(z, z + sz * 0.9), Math.max(x, x + sx * 0.9), Y1 - 0.4, Math.max(z, z + sz * 0.9), D).name = 'h132-torn'; });
    has('strip.patch').forEach(() => rough('S', S9.side / 2, Y0 + 2.4, 'tornpatch'));
  }
  // the strip's timber on the pile (bare and later, and the strip's closing film): the two sills at the bottom, the four braces on them,
  // the four belts across, the wedge on top — nothing of the form left round the block (lane A lays the four walls in their stack beside it)
  if (at(blk, 'bare') || clean) pileWood(X, Mt, D);
  // the red line, six tefachim under the top, round the four faces (with its flaws' marks where the act kept them)
  if (at(blk, 'lined') && !owns('line')) {
    const y = S9.lineY, h = 0.07, e = 0.04;
    box(X, Mt.y9red, B[0] - e, y - h, B[1] - e, B[2] + e, y + h, B[1], D); box(X, Mt.y9red, B[0] - e, y - h, B[3], B[2] + e, y + h, B[3] + e, D);
    box(X, Mt.y9red, B[0] - e, y - h, B[1], B[0], y + h, B[3], D); box(X, Mt.y9red, B[2], y - h, B[1], B[2] + e, y + h, B[3], D);
  }
  void Tt;
}
function pileWood(X, Mt, D) {
  const [x, z] = S9.pile; let y = F;
  for (const j of [0, 1]) { const b = box(X, Mt.y9woodD, x - 4, y, z - 1.4 + j * 1.6, x + 4, y + 0.55, z - 0.6 + j * 1.6, D); b.name = 'h132-pile-sill'; }
  y += 0.55;
  for (let j = 0; j < 4; j++) { const b = box(X, Mt.y9wood, x - 3.5, y, z - 1.5 + j * 0.8, x + 3.5, y + 0.36, z - 1.1 + j * 0.8, D); b.name = 'h132-pile-brace'; }
  y += 0.36;
  for (let j = 0; j < 4; j++) { const b = box(X, Mt.y9woodD, x - 2.4 + j * 1.3, y, z - 1.8, x - 1.7 + j * 1.3, y + 0.45, z + 1.6, D); b.name = 'h132-pile-belt'; }
  y += 0.45;
  { const b = box(X, Mt.y9wood, x - 0.5, y, z - 0.3, x + 0.6, y + 0.4, z + 0.3, D); b.name = 'h132-pile-wedge'; }
}
/** (build 132, item 13) stage 08's frame boards round the foundation ('h131-frame', drawn by h131/frame3d.js) are not standing there
 *  from stage 09's 'bare' on, nor in the strip's closing film: the crew took them to the timber pile with the rest. Stage 09 only hides
 *  that node while its block is so (and shows it again otherwise); stage 08's own pages and saved look are untouched */
export function frameAway(root, away) {
  const g = root && root.getObjectByName ? root.getObjectByName('h131-frame') : null; if (!g) return false;
  if (away) { if (g.visible) { g.visible = false; g.userData.h132away = true; } }
  else if (g.userData.h132away) { g.visible = true; g.userData.h132away = false; }
  return true;
}
/** (build 132, integration item 8) stage 08's witness stakes at the foundation's corners ('h131-site' children drawn with the props'
 *  stake): work 4 measures with its own stakes on the walls, so these have no role in stage 09 — out from 'bare' on like the frame,
 *  back before it; only what stage 09 hid is shown again. → how many stakes it found */
export function siteStakesAway(root, away, geo) {
  const g = root && root.getObjectByName ? root.getObjectByName('h131-site') : null; if (!g || !geo) return 0;
  let n = 0;
  for (const c of g.children) {
    // (and stage 08's pile of the pit's stones, h131-pile: no role in stage 09, it lay east of the block on the men's way)
    if (!(c.isMesh && c.geometry === geo) && c.name !== 'h131-pile') continue; n++;
    if (away) { if (c.visible) { c.visible = false; c.userData.h132away = true; } }
    else if (c.userData.h132away) { c.visible = true; c.userData.h132away = false; }
  }
  return n;
}
function frameAwayNow(X) {
  try {
    const M = X.M, blk = M && M.block ? M.block() : 'site', away = at(blk, 'bare') || (!!SH9.clear && SH9.clear === ((M && M.st && M.st.cur) || ''));
    frameAway(X.scene || X.props.root, away);
    siteStakesAway(X.props.root, away, X.props.geo && X.props.geo.stake);
  } catch (e) { /* */ }
}
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('sovev', true); } catch (e) { /* */ } }

/* ───────── the life of the world ───────── */
export function initWorld(X) {
  mats(X); SH9.X = X;
  try { window.__H132_SH = SH9; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X);
  if (!SH9.g) build(X);
  SH9.key = ''; sync(X, X.M);
  lane('init', X, X.M); frameAwayNow(X);
}
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH9.X) return;
  SH9.t += dt;
  jT -= dt; if (jT <= 0) { jT = 0.5; modelHide(X); sync(X, X.M); lane('sync', X, X.M); frameAwayNow(X); }
  lane('frame', dt, X, X.M);
}
/** after a reload, the stage done or later: the block as he built it, the model's own hidden */
export function restWorld(X, M) {
  mats(X); SH9.X = X; modelHide(X);
  if (!SH9.g) build(X);
  SH9.key = ''; sync(X, M);
  lane('rest', X, M); frameAwayNow(X);
}
export function finalWorld(X) { if (!SH9.X) return; SH9.key = ''; sync(X, X.M); }
