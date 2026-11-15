/* ── build 128 ── h128/sea.js — station 1, "הנחשול" (brief §4): three works in one journey, played INSIDE the approved sea
 * (h128/sea3d.js + its look; nothing of the water, the sky or the ship restyled). The sea is drawn in place of the Mount while a
 * work of the station runs (main.js renderFrame: globalThis.__H128_DRAW) and between its works; the Mount comes back after Akko.
 *
 *   sea1 "הסערה מתקרבת"  the opening picture (6 s, a tap skips), four swells (port, bow, starboard, stern), D 0.30; the sky darkens
 *   sea2 "הנחשול"         three swells, D 0.40, one rope worn to the eye; then (seen) the sailors throw the port door over the rail;
 *                         the camera lifts a little by itself; both thumbs take the second door's two rings ("הטילוני עמה") through
 *                         three swells, each slipping one hand off; the sea goes flat at once ("מיד נח הים מזעפו"); the quiet moment
 *                         before the empty place ("והיה מצטער על חברתה"), 5 s
 *   sea3 "נמל עכו"        the ship at the quay; the thrown door rises and sinks under her side; the hook (right thumb), the hoist
 *                         (left thumb, the pendulum), the landing (ease); then the caravan up to Jerusalem (5 s, a tap skips)
 *
 * The rope is the gauge: each of the four lashing ropes shows its tension only by its look (slack: a curve that sways with the roll;
 * quiet: straight and still; sings: straight, paler, a fine quick shiver; frays: strands stand out) and its sound (a hum rising with
 * the tension, creaking). A finger on a rope's free tail drags it: toward the player (down the screen) hauls, away pays out; let go,
 * a sailor makes it fast on its cleat (seen). Rule 66: a right-half touch that does not start on a grip lifts the camera; lifted a
 * little (u ≤ 0.45) the play goes on and the camera turns toward the next swell's way. The rules are the model's (seaStep, holdStep,
 * akkoStep); every place is the book's (BOOK.s06.sea). Losses only from the loss table (a rope torn, a ring pulled from the deck),
 * each stays to the eye (a rough knot, a hole in the plank and a bent ring) and goes on to the next work on the same ship.
 *   SEA = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createSea3d } from './sea3d.js';
import { SEA_LV, ROPES, lowRopes, bandOf, seaFresh, seaStep, seaPts, seaCarry, nextSwell, swellsOf, headDir, swellPos, holdFresh, holdStep, holdSwell, HOLD,
  akkoFresh, akkoStep, akkoPts, AKKO, ringY, LINES, QUICK, LOSS, H128, qOf, starsOf } from './model.js';
import { createVoices } from './sound128.js';
import { createAnimals } from '../../animals.js';
import { CAPSTAN } from './capstan.js';
import { filmFigs } from './figgate.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { SH6, leafSlab, clamp, lerp, ease, TAU } from './world.js';
import { BOOK } from '../world/grid.js';

const S6 = BOOK.s06, SB = S6.sea, DK = SB.deck, QY = SB.quay, CM = SB.cam, CM6 = S6.cam;
const GRIP = 46;                 // (a tail's, a ring's, the hook's touch radius on the screen, px: at least 44, the nearest wins)
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const wrapA = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
const sideOf = (k) => (k.startsWith('port') ? 'port' : 'stbd');
const HOLD_H = SEA_LV.sea2.H;
const COIL_R = 1.1;              // (a tail's coil on the deck: its outer radius, amot)
const HOLD_S = 1.45;             // (B6: Nicanor's size on the door in the hold, larger than life so the figure reads at the act's lift)

/* ═════════════ the sea on screen: one sea3d for the whole journey, drawn in place of the Mount ═════════════ */
const SS = { S: null, R: null, on: false, t: 0, act: null, idle: 0, fresh: false, exp: null, calls: 0, tris: 0, drawMs: 0, ext: null, shake: 0, onResize: null };
function renderer() { try { return globalThis.__T && globalThis.__T.renderer; } catch (e) { return null; } }
function seaUp() {
  const R = renderer(); if (!R) return null;
  if (!SS.S) { SS.S = createSea3d({ renderer: R, play: true }); SS.R = R; SS.ext = buildExtras(SS.S); }
  if (!SS.on) {
    SS.on = true; SS.exp = R.toneMappingExposure; SS.idle = 0;
    SS.onResize = () => { try { SS.S.resize(innerWidth, innerHeight); } catch (e) { /* */ } }; addEventListener('resize', SS.onResize); SS.onResize();
    globalThis.__H128_DRAW = draw; if (globalThis.__H128_PROBE) globalThis.__H128_SEA = SS;   // (a probe page's flag: the probe reads the sea through it)
  }
  return SS.S;
}
function seaDown(dispose) {
  if (SS.on) { SS.on = false; globalThis.__H128_DRAW = null; if (SS.onResize) removeEventListener('resize', SS.onResize); try { if (SS.R && SS.exp != null) SS.R.toneMappingExposure = SS.exp; } catch (e) { /* */ } }
  if (dispose && SS.S) { try { SS.S.dispose(); } catch (e) { /* */ } SS.S = null; SS.ext = null; SS.t = 0; }
}
function draw(dt) {
  const S = SS.S; if (!S) return;
  const t0 = performance.now();
  if (!SS.act) {   // (between two works of the journey: the ship sails on, the camera stays; the Mount comes back if no work follows)
    SS.idle += dt; SS.t += dt; S.update(SS.t, dt);
    if (SS.idle > 8) { seaDown(false); return; }
  } else if (!SS.fresh) { try { SS.act.look(0); S.aim(); } catch (e) { /* */ } }   // (the act waits — the camera away — its look still moves the camera)
  SS.fresh = false;
  if (SS.shake > 0) { const c = S.camera, k = SS.shake; c.position.x += Math.sin(SS.t * 63) * 0.25 * k; c.position.y += Math.sin(SS.t * 71 + 1) * 0.2 * k; }
  try { SS.R.setRenderTarget(null); } catch (e) { /* */ }
  S.render();
  const I = SS.R.info.render; SS.calls = I.calls; SS.tris = I.triangles; SS.drawMs = performance.now() - t0;
}
const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
/** a point of the deck's frame ([x, y over the deck, z]) on the screen */
function deckScr(x, y, z) { const S = SS.S; v3.set(x, y, z); S.deck.localToWorld(v3); return worldScr(v3); }
function worldScr(v) { v4.copy(v).project(SS.S.camera); return { x: (v4.x + 1) / 2 * innerWidth, y: (1 - v4.y) / 2 * innerHeight, on: v4.z < 1 }; }
/** the screen ray of a touch, in the sea's frame */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function rayOf(p) { ndc.set((p.x / innerWidth) * 2 - 1, -(p.y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, SS.S.camera); return ray.ray; }

/* ═════════════ the station's own things on the ship (built once with the sea): the four ropes and their tails, their strands,
   the rough knots, the holes and bent rings, the hands on the rings, the splash, the shore astern, the quay and the derrick ═════════════ */
function buildExtras(S) {
  const P = S.play, deck = S.deck, keep = P.keep, top = P.top;
  const E = { ropes: {}, scars: [], knots: [] };
  // the ropes: one instanced mesh of short round segments (the four ropes, their tails, the hoist's and the hook's ropes)
  const cyl = keep(new THREE.CylinderGeometry(1, 1, 1, 6, 1, true)); cyl.translate(0, 0.5, 0);
  const ropeMat = keep(new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#000000' }));
  E.NSEG = 4 * 16 + 2 * 1;
  E.rope = new THREE.InstancedMesh(cyl, ropeMat, E.NSEG); E.rope.frustumCulled = false; E.rope.name = 'h128-ropes'; deck.add(E.rope);
  E.rope.setColorAt(0, new THREE.Color('#DCC69C'));
  // the tails' coils on the deck (the grips): a flat ring of rope and a knot, pale hemp
  const cg = new THREE.TorusGeometry(COIL_R - 0.25, 0.25, 6, 16); cg.rotateX(Math.PI / 2);   // (B4: 2.2 across, 44 px and more at u 0.3)
  E.coil = new THREE.InstancedMesh(keep(cg), ropeMat, 4); E.coil.frustumCulled = false; deck.add(E.coil);
  for (let i = 0; i < 4; i++) E.coil.setColorAt(i, new THREE.Color('#E2CFA6'));
  // the strands: thin fibres standing out of a fraying rope (and a few from a worn one)
  const fib = keep(new THREE.BoxGeometry(1, 1, 1)); fib.translate(0, 0.5, 0);
  E.NF = 4 * 12; E.fib = new THREE.InstancedMesh(fib, keep(new THREE.MeshLambertMaterial({ color: '#D9C9A0' })), E.NF); E.fib.frustumCulled = false; deck.add(E.fib);
  // the rough knots (lumps of rope) and the scars a ring pulled out leaves: a hole in the plank, the bent ring beside it
  const kg = keep(new THREE.IcosahedronGeometry(0.26, 0)); kg.scale(1.25, 0.8, 1.05);
  E.knot = new THREE.InstancedMesh(kg, keep(new THREE.MeshLambertMaterial({ color: '#7A5E3A' })), 8); E.knot.count = 0; E.knot.frustumCulled = false; deck.add(E.knot);
  const hole = new THREE.BoxGeometry(0.75, 0.05, 0.42); hole.translate(0, 0.02, 0);
  const bent = new THREE.TorusGeometry(0.28, 0.07, 5, 10, Math.PI * 1.35); bent.rotateX(Math.PI / 2 - 0.5); bent.scale(1.25, 1, 0.7); bent.translate(0.65, 0.1, 0.15);
  const scarG = keep(mergeGeometries([hole.toNonIndexed(), bent.toNonIndexed()].map((g) => { for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; }), false)); hole.dispose(); bent.dispose();
  E.scar = new THREE.InstancedMesh(scarG, keep(new THREE.MeshLambertMaterial({ color: '#17110C' })), 8); E.scar.count = 0; E.scar.frustumCulled = false; deck.add(E.scar);
  // his hands on the second door's rings (the hold): two fists
  E.arm = new THREE.InstancedMesh(cyl, keep(new THREE.MeshLambertMaterial({ color: '#5E3E26' })), 2); E.arm.count = 0; E.arm.frustumCulled = false; deck.add(E.arm);
  E.fist = new THREE.InstancedMesh(keep(new THREE.SphereGeometry(0.2, 8, 6)), keep(new THREE.MeshLambertMaterial({ color: '#B98A62' })), 2); E.fist.count = 0; E.fist.frustumCulled = false; deck.add(E.fist);
  // the splash (points thrown up where the door hits the water; in the sea's frame)
  const NS = 160, sp = new Float32Array(NS * 3).fill(-999);
  const spG = keep(new THREE.BufferGeometry()); spG.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  E.splash = new THREE.Points(spG, keep(new THREE.PointsMaterial({ color: '#E8F0EE', size: 0.55, transparent: true, opacity: 0.9, depthWrite: false })));
  E.splash.frustumCulled = false; E.splash.visible = false; S.scene.add(E.splash); E.sp = { P: sp, V: new Float32Array(NS * 3), L: new Float32Array(NS), N: NS, G: spG };
  // the shore the ship leaves (the opening picture only; המחשה): a long low strip astern
  const C = SB.coast, shore = new THREE.Mesh(keep(new THREE.BoxGeometry(60, C.h, C.w)), keep(new THREE.MeshLambertMaterial({ color: '#B8A27E' })));
  shore.position.set(C.x, C.h / 2 - 2, 0); shore.visible = false; shore.name = 'h128-shore'; S.scene.add(shore); E.shore = shore;
  // Akko (sea3): the quay (stone), the derrick (a post, a boom, its block), the hook on its rope; in the sea's frame, the deck at rest
  const Y0 = P.deckY - P.sit, q = new THREE.Group(); q.visible = false; q.name = 'h128-quay'; S.scene.add(q); E.quay = q; E.Y0 = Y0;
  const qTop = Y0 + QY.top, qx0 = QY.x[0], qx1 = QY.x[1];
  const stone = keep(new THREE.MeshLambertMaterial({ map: P.canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#9C8E78'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,30,20,0.35)'; for (let r = 0; r < 4; r++) { g.fillRect(0, r * h / 4, w, 2); for (let k = 0; k < 6; k++) g.fillRect(((k * 53 + r * 29) % 100) / 100 * w, r * h / 4, 2, h / 4); } }), color: '#ffffff' }));
  stone.map.wrapS = stone.map.wrapT = THREE.RepeatWrapping; stone.map.repeat.set(Math.round((qx1 - qx0) / 5), 3); stone.color.set('#E4DCCB');
  const qb = new THREE.Mesh(keep(new THREE.BoxGeometry(qx1 - qx0, qTop + 6, QY.w)), stone); qb.position.set((qx0 + qx1) / 2, (qTop - 6) / 2, QY.edge - QY.w / 2); q.add(qb);
  const wood = P.mats.gear, D0 = QY.derrick, fy = qTop;
  const post = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.35, 0.5, 1, 8)), wood); q.add(post); E.post = post;
  const boom = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.22, 0.3, 1, 7)), wood); q.add(boom); E.boom = boom;
  const block = new THREE.Mesh(keep(new THREE.BoxGeometry(0.6, 0.8, 0.5)), P.mats.dark); q.add(block); E.block = block;
  E.derrickFoot = new THREE.Vector3(D0.foot[0], fy, D0.foot[1]); E.headY = Y0 + D0.head[2];
  E.headR = Math.hypot(D0.head[0] - D0.foot[0], D0.head[1] - D0.foot[1]); E.head0 = Math.atan2(D0.head[1] - D0.foot[1], D0.head[0] - D0.foot[0]);
  // the hook: a shank and a curved point, dark iron
  const hk = mergeGeometries([new THREE.CylinderGeometry(0.07, 0.07, 0.9, 6).translate(0, 0.45, 0).toNonIndexed(), new THREE.TorusGeometry(0.28, 0.07, 5, 10, Math.PI * 1.3).rotateZ(Math.PI * 0.85).toNonIndexed()].map((g) => { for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k); return g; }), false);
  E.hook = new THREE.Mesh(keep(hk), P.mats.dark); E.hook.name = 'h128-hook'; q.add(E.hook);
  // the quay's lines for the hoist and the hook (two segments of the same rope look, its own small mesh in the sea's frame)
  E.qrope = new THREE.InstancedMesh(cyl, ropeMat, 3); E.qrope.frustumCulled = false; q.add(E.qrope);
  // the harbour round it (illustration, no claim): two bollards on the edge, the windlass between the derrick's men, a low harbour
  // wall behind the quay and a few flat-roofed houses beyond it — one mesh, coloured by vertex
  {
    const G = [], put = (g, col, x, y, z) => { g.translate(x, y, z); const c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k); G.push(g.index ? g.toNonIndexed() : g); };
    const zb = QY.edge - QY.w;
    for (const x of QY.bollards) put(new THREE.CylinderGeometry(0.45, 0.55, 1.2, 8), '#4A4038', x, qTop + 0.6, QY.edge - 0.8);
    { const w = new THREE.CylinderGeometry(0.55, 0.55, 3.2, 10); w.rotateX(Math.PI / 2); put(w, '#6E5232', QY.windlass[0], qTop + 1.1, QY.windlass[1]); }
    for (const dz of [-1.7, 1.7]) put(new THREE.BoxGeometry(0.3, 1.4, 0.3), '#5A4430', QY.windlass[0], qTop + 0.7, QY.windlass[1] + dz);
    put(new THREE.BoxGeometry(qx1 - qx0, 4.5, 1.6), '#A89C84', (qx0 + qx1) / 2, qTop + 2.25, zb + 0.8);
    QY.houses.forEach(([x, z, w, d, h], i) => { put(new THREE.BoxGeometry(w, h, d), i % 2 ? '#D8CDB4' : '#C9BC9E', x, qTop + h / 2, z); put(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), '#8C7A60', x, qTop + h + 0.2, z); });
    const hb = new THREE.Mesh(keep(mergeGeometries(G, false)), keep(new THREE.MeshLambertMaterial({ vertexColors: true }))); hb.name = 'h128-harbour'; q.add(hb);
    // the two timbers the door is laid on
    E.timber = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.8, 0.5, 6)), wood, 2); E.timber.count = 0; E.timber.frustumCulled = false; S.scene.add(E.timber);
  }
  // the coming swells as the lifted view reads them: a long dark ridge with a foam cap, from its heading (two at most). Its height
  // over the water: sea1's crest stays under the rail, sea2's stands over it (illustration of D 0.30 / 0.40)
  {
    const L = 160, Wd = 12, pos = [], col = [], cb = new THREE.Color('#1E4A50'), cf = new THREE.Color('#F4F6F0');
    const prof = [[-Wd * 0.65, 0, cb], [-Wd * 0.1, 0.86, cb], [0, 1, cf], [Wd * 0.1, 0.9, cf], [Wd * 0.35, 0, cb]];
    for (let i = 0; i < prof.length - 1; i++) {
      const [x0, y0, c0] = prof[i], [x1, y1, c1] = prof[i + 1];
      for (const [x, y, z, c] of [[x0, y0, -L / 2, c0], [x1, y1, -L / 2, c1], [x1, y1, L / 2, c1], [x0, y0, -L / 2, c0], [x1, y1, L / 2, c1], [x0, y0, L / 2, c0]]) { pos.push(x, y, z); col.push(c.r, c.g, c.b); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    E.ridge = new THREE.InstancedMesh(keep(g), keep(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })), 2); E.ridge.count = 0; E.ridge.frustumCulled = false; S.scene.add(E.ridge);
  }
  // the swell washing over the deck in the hold: a sheet of water and foam (the deck's frame)
  {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const g = cv.getContext('2d');
    g.fillStyle = 'rgba(40,110,110,0.55)'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = 'rgba(245,250,245,0.9)';
    for (let i = 0; i < 90; i++) { const x = (i * 37) % 128, y = (i * 23) % 64; g.beginPath(); g.ellipse(x, y, 3 + (i % 5) * 2, 1.5 + (i % 3), 0, 0, TAU); g.fill(); }
    const tx = keep(new THREE.CanvasTexture(cv)); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(3, 1);
    E.wash = new THREE.Mesh(keep(new THREE.PlaneGeometry(26, 9)), keep(new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false })));
    E.wash.rotation.x = -Math.PI / 2; E.wash.visible = false; E.wash.renderOrder = 3; deck.add(E.wash); E.washTex = tx;
  }
  return E;
}
const C_WORN = new THREE.Color('#B9B2A2'), C_PALE = new THREE.Color('#FBF6E8'), C_DARK = new THREE.Color('#6A5232');
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0), _c = new THREE.Color();
/** segment i of an instanced rope mesh from a to b with radius r */
function seg(mesh, i, a, b, r) {
  _b.subVectors(b, a); const L = _b.length();
  if (L < 1e-5) { _m.makeScale(0, 0, 0); mesh.setMatrixAt(i, _m); return; }
  _q.setFromUnitVectors(_y, _b.multiplyScalar(1 / L)); _m.compose(a, _q, _s.set(r, L, r)); mesh.setMatrixAt(i, _m);
}
const hide = (mesh, i) => { _m.makeScale(0, 0, 0); mesh.setMatrixAt(i, _m); };

/* ═════════════ the act ═════════════ */
export const SEA = {
  icon: '🌊', title: 'הנחשול',
  walkLine: (m) => (m && m.id === 'sea3' ? 'נמל עכו' : m && m.id === 'sea2' ? 'הנחשול' : 'הדלתות בדרך מאלכסנדריא'),
  stand() { return { x: S6.eastGate[0] - 4, z: S6.eastGate[1], face: [S6.eastGate[0], S6.eastGate[1]] }; },
  prepare() {},
  make(m, X) { return makeSea(m, X); },
};

function makeSea(m, X) {
  const st = X.M.st, V = createVoices(X.sfx), id = m.id;
  st.sea = st.sea || { ring: {}, torn: {}, knot: {}, worn: {} };
  const A = { id, phase: 'enter', t: 0, ev: [], downs: [], fing: new Map(), dy: {}, fast: {}, tasks: [], quickN: 0, look: { u: 0, yaw: 0, ov: false }, cam: { p: null, t: null }, skip: 0, fadeEl: null, ph: 0 };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
  let S = null, E = null, P = null;
  // the model's state of this work
  const s = id === 'sea3' ? null : seaFresh(id, st.sea);
  const ak = id === 'sea3' ? akkoFresh() : null;
  let hold = null;
  A.s = s; A.ak = ak;
  const mouse = MOUSE;

  /* ── the ropes as drawn (deck frame): ring (anchor) → over the door → down to the cleat; the tail from the cleat to its free end ── */
  const D = DK.doors, W2 = D.W / 2;
  const RP = {};
  for (const k of ROPES) {
    const [rx, rz] = DK.rings[k], [cx, cz] = DK.cleats[k], [tx, tz] = DK.tails[k], sg = Math.sign(cz);
    RP[k] = { rx, rz, cx, cz, tx, tz, sg, fore: k.endsWith('Fore'), edgeIn: sg * (Math.abs(D.port[1]) - W2), edgeOut: sg * (Math.abs(D.port[1]) + W2), pull: 0, gone: 0, slide: 0, slideT: 0, slideD: [0, 0] };
  }
  const anchorX = (k) => { const R = RP[k], n = (st.sea.ring[k] | 0) + (s ? s.ropes[k].ring : 0); return R.rx + (R.fore ? -1 : 1) * DK.next * Math.min(n, 2); };
  const pts = [...Array(16)].map(() => new THREE.Vector3()), tl = [...Array(5)].map(() => new THREE.Vector3());
  function drawRopes(dt) {
    const T = SS.t, roll = S.state.roll || 0, top = P.top;
    let i = 0, f = 0;
    for (const k of ROPES) {
      const R = RP[k], r = s ? s.ropes[k] : { t: 0.5, worn: 0 }, ten = r.t, band = bandOf(ten);
      if (R.gone) { for (let j = 0; j < 16; j++) hide(E.rope, i++); for (let j = 0; j < 12; j++) hide(E.fib, f++); hide(E.coil, ROPES.indexOf(k)); continue; }
      // the bands told apart at a glance: slack hangs in a curve (at least half an amah) and sways; quiet is straight and still;
      // sings is straight, paler, and shivers; frays shivers, darkens and shows its strands
      const slack = ten < H128.BAND.slack ? 0.55 + (H128.BAND.slack - ten) / H128.BAND.slack * 0.6 : 0;
      const shiver = band === 'sings' || band === 'frays' ? 0.07 + 0.06 * clamp((ten - 0.7) / 0.3, 0, 1) : 0;
      const ax = anchorX(k), ty = top + 0.16, dz = R.slide;
      // 0 the anchor, 1..4 over the door (an arch when slack), 5..10 the outer span down to the cleat (a sag when slack), 11 the cleat
      const span = [[ax, 0.2, R.rz]];
      for (let j = 0; j <= 4; j++) { const u = j / 4, z = lerp(R.edgeIn, R.edgeOut, u) + dz; span.push([R.rx, ty + Math.sin(u * Math.PI) * slack * 0.45, z]); }
      for (let j = 1; j <= 5; j++) { const u = j / 6, y = lerp(ty, 0.42, u) - Math.sin(u * Math.PI) * slack; span.push([lerp(R.rx, R.cx, u * u), Math.max(0.06, y), lerp(R.edgeOut + dz, R.cz - R.sg * 0.2, u)]); }
      span.push([R.cx, 0.42, R.cz]);
      for (let j = 0; j < span.length; j++) {
        const p = pts[j].set(...span[j]);
        if (j > 0 && j < span.length - 1) {
          const sw = slack * (0.35 * Math.sin(T * 1.3 + j * 0.6 + R.cz) + 3 * roll);   // (slack: it sways with the roll)
          p.x += sw; if (shiver) { const zz = (j % 2 ? 1 : -1) * shiver; p.x += Math.sin(T * 97 + j * 2.3) * shiver + zz; p.y += Math.cos(T * 89 + j * 1.7) * shiver * 0.6 + zz * 0.5; }
        }
      }
      const rad = 0.15;   // (6 px and more at the play camera's far end)
      for (let j = 0; j < span.length - 1; j++) seg(E.rope, i++, pts[j], pts[j + 1], r.worn && j > 1 && j < 8 ? rad * 0.68 : rad);
      // the tail: from the cleat aft along the rail to its free end, drawn toward the player while a finger hauls it
      const pull = R.pull;
      const [kx, kz] = DK.coil[k], ex = kx - pull * 1.4;
      const sx = Math.sign(ex - R.cx) || -1, x1 = R.cx + sx * 0.6;
      tl[0].set(R.cx, 0.42, R.cz); tl[1].set(x1, 0.12, R.cz - R.sg * 0.3); tl[2].set(lerp(x1, ex, 0.4), 0.12, lerp(R.cz - R.sg * 0.3, kz, 0.5));
      tl[3].set(lerp(x1, ex, 0.75), 0.12 + pull * 0.15, lerp(R.cz, kz, 0.9)); tl[4].set(ex - sx * 0.62, 0.14 + pull * 0.3, kz);
      for (let j = 0; j < 4; j++) seg(E.rope, i++, tl[j], tl[j + 1], 0.12);
      _m.compose(_a.set(ex, 0.22 + pull * 0.3, kz), _q.identity(), _s.set(1, 1, 1)); E.coil.setMatrixAt(ROPES.indexOf(k), _m);
      // the colour: rope; paler as it sings; a worn rope greyer and lighter
      _c.set('#DCC69C'); if (r.worn) _c.lerp(C_WORN, 0.6);
      if (band === 'sings') _c.lerp(C_PALE, 0.55 + 0.4 * (ten - 0.7) / 0.2); else if (band === 'frays') _c.lerp(C_DARK, 0.75);
      for (let j = i - 15; j < i; j++) E.rope.setColorAt(j, _c);
      // the strands: out along the rope over the door and down the span (frays: many and long; a worn rope: three short ones)
      const fk = band === 'frays' ? 1 : 0, wk = r.worn ? 1 : 0;
      for (let j = 0; j < 12; j++) {
        const show = fk || (wk && j % 2 === 1);
        if (!show) { hide(E.fib, f++); continue; }
        const a = pts[1 + (j % 9)], b = pts[2 + (j % 9)], u = ((j * 37) % 10) / 10, len = fk ? 0.26 + 0.12 * ((j * 13) % 5) / 5 : 0.16;
        _a.lerpVectors(a, b, u); const ang = j * 2.4 + (fk ? Math.sin(T * 30 + j) * 0.25 : 0);
        _b.set(Math.cos(ang) * 0.6, 0.8, Math.sin(ang) * 0.6).normalize();
        _q.setFromUnitVectors(_y, _b); _m.compose(_a, _q, _s.set(0.018, len, 0.018)); E.fib.setMatrixAt(f++, _m);
      }
    }
    while (i < E.NSEG) hide(E.rope, i++);
    E.coil.instanceMatrix.needsUpdate = true;
    E.rope.instanceMatrix.needsUpdate = true; if (E.rope.instanceColor) E.rope.instanceColor.needsUpdate = true; E.fib.instanceMatrix.needsUpdate = true;
    // a door that slid when its slack rope snatched: out half an amah toward the low side and back as the rope takes it
    for (const side of ['port', 'stbd']) {
      const g = P.doors[side]; if (!g || g.userData.off) continue;
      const k0 = side + 'Fore', R = RP[k0]; let ox = 0, oz = 0;
      for (const k of [side + 'Fore', side + 'Aft']) { const Q = RP[k]; if (Q.slideT > 0) { Q.slideT = Math.max(0, Q.slideT - dt); const b = Math.sin((1 - Q.slideT / 1.4) * Math.PI); ox = Q.slideD[0] * b; oz = Q.slideD[1] * b; } }
      g.position.x = D[side][0] + ox; g.position.z = D[side][1] + oz; void R;
    }
  }
  /** the scars and the knots as the save and this work have them */
  function marks() {
    let n = 0, kn = 0;
    for (const k of ROPES) {
      const R = RP[k], rings = (st.sea.ring[k] | 0) + (s ? s.ropes[k].ring : 0), torn = (st.sea.torn[k] | 0) + (s ? s.ropes[k].torn : 0);
      for (let j = 0; j < Math.min(rings, 2); j++) { _m.compose(_a.set(R.rx + (R.fore ? -1 : 1) * DK.next * j, 0, R.rz), _q.identity(), _s.set(1, 1, 1)); E.scar.setMatrixAt(n++, _m); }
      if (rings) { _m.compose(_a.set(anchorX(k), 0.24, R.rz), _q.identity(), _s.set(1, 1, 1)); E.knot.setMatrixAt(kn++, _m); }
      if (torn) { _m.compose(_a.set(lerp(R.rx, R.cx, 0.35), 0.62, lerp(R.edgeOut, R.cz, 0.45)), _q.identity(), _s.set(1.15, 1.15, 1.15)); E.knot.setMatrixAt(kn++, _m); }
    }
    E.scar.count = n; E.knot.count = Math.min(8, kn); E.scar.instanceMatrix.needsUpdate = true; E.knot.instanceMatrix.needsUpdate = true;
  }

  /* ── the sailors: a lasher makes a rope fast when the finger lets go (walks to its cleat, takes a turn); the throw; the keeper ── */
  const crew = () => S.crew, nic = () => S.nicanor;
  const lasher = (k) => crew()[sideOf(k) === 'port' ? 0 : 1];
  function makeFast(k) {
    const a = lasher(k); if (!a) return;
    const at = DK.fast[k], cl = P.cleatAt[k];
    A.tasks = A.tasks.filter((q) => q.a !== a);
    a.own128 = true; a.to = cl; S.actors.walk(a, [[at[0], at[1]]], 3.2);
    A.tasks.push({ a, k, at, cl, ph: 'walk', T: 0 });
  }
  function tasksFrame(dt) {
    for (const q of A.tasks) {
      const a = q.a; q.T += dt;
      if (q.ph === 'walk') { if (!a.path || q.T > 4) { q.ph = 'turn'; q.T = 0; a.x = q.at[0]; a.z = q.at[1]; a.yaw = Math.atan2(q.cl[0] - a.x, q.cl[2] - a.z); } }
      else if (q.ph === 'turn') {   // (a turn of the tail round the cleat: bent over it, hand over hand)
        const w = Math.sin(q.T * 9);
        a.bowT = 0.9; a.knT = 0.25; a.armT = [0.55 + 0.35 * w, -0.1, 0.55 - 0.35 * w, -0.1];
        if (q.T > 1.3) { q.ph = 'done'; a.own128 = false; }
      }
    }
    A.tasks = A.tasks.filter((q) => q.ph !== 'done');
  }

  /* ── the camera: the play shot and the right thumb's lift (toward the next swell's way), the films' shots ── */
  const sph = (p, t) => { const dx = p[0] - t[0], dy = p[1] - t[1], dz = p[2] - t[2], d = Math.hypot(dx, dy, dz); return { d, el: Math.asin(dy / d), az: Math.atan2(dz, dx) }; };
  // the lift (B4): in the play zone (u ≤ 0.45) the camera rises and backs a little over the stern and turns a little toward the side the
  // next swell runs to (CM.liftPlay), so the four coils stay large and apart and the play goes on; past it (the look out of the play
  // zone) it goes on round and up to the whole ship and the swell's way (CM.liftTop)
  function lookPose(base, u, yaw, head, out) {
    const a = sm(0, 0.45, u), ex = sm(0.45, 1, u), LP = CM.liftPlay, L = CM.liftTop;
    const B = sph(base[0], base[1]);
    const dir = head ? headDir(head) : [-1, 0], azS = Math.atan2(dir[1], dir[0]) + 0.9;
    const az = B.az + wrapA(azS - B.az) * (LP.turn * a + (1 - LP.turn) * ex) + yaw;
    const el = lerp(lerp(B.el, LP.el, a), L.el, ex) + 0.3 * ex, d = lerp(lerp(B.d, LP.d, a), L.d * 1.7, ex);
    const t = [0, 1, 2].map((i) => lerp(lerp(base[1][i], LP.t[i], a), L.t[i], ex));
    out.p = [t[0] + Math.cos(az) * Math.cos(el) * d, t[1] + Math.sin(el) * d, t[2] + Math.sin(az) * Math.cos(el) * d]; out.t = t; out.f = lerp(0.6, 0.35, a) * (1 - ex) + 0.25 * ex; return out;
  }
  /** the coming swells' ridges (the sea's frame), sunk into the water as the real swell takes the ship */
  function ridges() {
    if (!E.ridge) return;
    const L = (A.phase === 'ropes' && s ? swellsOf(s, T0.v) : []).concat(A.phase === 'hold' && A.hsw ? A.hsw : []);
    let n = 0; const hx = S.state.shipX || 0;
    for (const w of L) {
      const p = swellPos({ t0: w.t0 }, SS.t); if (p < -150 || p > -4 || n > 1) continue;
      const dir = headDir(w.head), hv = (w.H || 3.4) > 4 ? 5.8 : 2.6, sink = sm(-24, -6, p);
      _m.compose(_a.set(hx + dir[0] * p, -0.9 - sink * (hv + 1.5), dir[1] * p), _q.setFromAxisAngle(_y, -Math.atan2(dir[1], dir[0])), _s.set(1, hv + 0.9, 1));
      E.ridge.setMatrixAt(n++, _m);
    }
    E.ridge.count = n; E.ridge.instanceMatrix.needsUpdate = true;
  }
  /** the hold's swell washing over the deck and the door: a sheet of water and foam from its heading (1.6 s) */
  function washFrame() {
    if (!E.wash) return;
    let on = 0;
    if (A.phase === 'hold' && A.hsw) for (const w of A.hsw) { const p = swellPos({ t0: w.t0 }, SS.t); if (p > -8 && p < 22) {
      const dir = headDir(w.head), u = (p + 8) / 30; on = 1;
      E.wash.position.set(DK.hold[0] + dir[0] * lerp(-14, 14, u), P.top + 0.25, DK.hold[1] + dir[1] * lerp(-9, 9, u));
      E.wash.rotation.z = Math.atan2(dir[1], dir[0]); E.wash.material.opacity = Math.sin(u * Math.PI) * 0.95; E.washTex.offset.x = SS.t * 0.4; } }
    E.wash.visible = !!on;
  }
  const POSE = {};
  function look(dt) {
    let L = { u: 0, yaw: 0, ov: false };
    try { if (X.lookNow) L = X.lookNow(); } catch (e) { /* */ }
    A.look = L;
    const u = L.u, yaw = L.yaw;
    if (L.ov) {   // (the overview: the ship and the sea round her from high, slowly round)
      const a = SS.t * 0.06, d = 260, el = 0.85;
      S.camDeck([Math.cos(a) * Math.cos(el) * d - 8, Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d], [-8, 0, 0], 0.1, 0.3); return;
    }
    const ph = A.phase;
    if (ph === 'open') { const a = A.t * 0.02; const p = CM.open[0], t = CM.open[1]; S.camDeck([p[0] * Math.cos(a) - p[2] * Math.sin(a), p[1], p[0] * Math.sin(a) + p[2] * Math.cos(a)], t, 0.3, 0.6); return; }
    if (ph === 'throw') { const c = A.throwCam || CM.throw[1]; const base = CM.throw[0]; S.camDeck(base, c, 0.35, 0.7); return; }
    if (ph === 'hold' || ph === 'turn' || ph === 'calm') { const b = CM.hold; const k = clamp(u / 0.45, 0, 1); S.camDeck([b[0][0], b[0][1] + 3 * k + (ph === 'calm' ? A.calmT * 2 : 0), b[0][2] - 1 * k - (ph === 'calm' ? A.calmT * 2 : 0)], b[1], 0.3, 0.6); return; }   // (B6: the act's own lift rises less: the rings 60 px and more at u 0.22)
    if (ph === 'sorry') { S.camDeck(CM.sorry[0], CM.sorry[1], 0.3, 0.6); return; }
    if (id === 'sea3') {
      const k = clamp(u / 0.45, 0, 1) + clamp((u - 0.45) / 0.55, 0, 1) * 0.6, a = CM.akko, b = CM.akkoLift;
      S.camDeck([lerp(a[0][0], b[0][0], k), lerp(a[0][1], b[0][1], k), lerp(a[0][2], b[0][2], k)], [lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k), lerp(a[1][2], b[1][2], k)], 0, 0); return;
    }
    const n = s ? nextSwell(s) : null;
    lookPose(CM.deck, u, yaw, n ? n.head : A.lastHead || null, POSE); if (n) A.lastHead = n.head;
    S.camDeck(POSE.p, POSE.t, POSE.f, 0.85);
  }
  A.look = { u: 0, yaw: 0, ov: false };

  /* ── the fingers ── */
  const tailScr = (k) => { const R = RP[k], c = DK.coil[k]; return deckScr(c[0] - R.pull * 1.4, 0.16 + R.pull * 0.3, c[1]); };
  const ringScr = (h) => { const hd = DK.handles.stbd[h === 'L' ? 0 : 1]; return deckScr(hd[0], P.top + 0.4, hd[1] + 0.5); };
  function nearest(p, list) { let best = null, bd = 1e9; for (const [key, q] of list) { if (!q || !q.on) continue; const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; best = key; } } return bd <= GRIP ? best : null; }
  const taken = (key) => [...A.fing.values()].includes(key);
  /** (the probe's measure of the play's frame) the ship's share of the screen's width (her deck's outline and her two ends), each
   *  coil's size on the screen (its torus across, px) and the least distance between two coils (px) */
  function frameNow() {
    const H = SB.hull, xs = [];
    for (const x of [H.stern, H.wide, 0, H.stem]) for (const z of [-H.beam / 2, 0, H.beam / 2]) { const q = deckScr(x, 0, z); if (q.on) xs.push(q.x); }
    const coils = ROPES.map((k) => { const c = tailScr(k), R = RP[k], cx = DK.coil[k][0] - R.pull * 1.4, cz = DK.coil[k][1], y = 0.16 + R.pull * 0.3, r = COIL_R;
      let d = 0; for (const [dx, dz] of [[1, 0], [0, 1]]) { const a = deckScr(cx + dx * r, y, cz + dz * r), b = deckScr(cx - dx * r, y, cz - dz * r); d = Math.max(d, Math.hypot(a.x - b.x, a.y - b.y)); }
      return { k, x: Math.round(c.x), y: Math.round(c.y), px: Math.round(d) }; });
    let mn = 1e9; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) mn = Math.min(mn, Math.hypot(coils[i].x - coils[j].x, coils[i].y - coils[j].y));
    const w = xs.length ? (Math.min(innerWidth, Math.max(...xs)) - Math.max(0, Math.min(...xs))) / innerWidth : 0;
    return { u: +A.look.u.toFixed(3), shipW: +w.toFixed(3), coils, coilMin: Math.round(mn) };
  }
  /** (the probe's measure of the hold) each ring's size across on the screen, px */
  function ringPx() {
    const out = {};
    for (const h of ['L', 'R']) { const hd = DK.handles.stbd[h === 'L' ? 0 : 1], y = P.top + 0.38, z = hd[1] + 0.5, r = 0.75;
      const a = deckScr(hd[0] - r, y, z), b = deckScr(hd[0] + r, y, z); out[h] = Math.round(Math.hypot(a.x - b.x, a.y - b.y)); }
    return out;
  }
  function gripsNow() {
    const L = [];
    if (A.phase === 'ropes') for (const k of ROPES) if (!RP[k].gone && !taken(k)) L.push([k, tailScr(k)]);
    if (A.phase === 'hold') for (const h of mouse ? ['L'] : ['L', 'R']) if (!taken('ring' + h)) L.push(['ring' + h, ringScr(h)]);
    if (A.phase === 'hook' && !taken('hook')) L.push(['hook', hookScr()]);
    if ((A.phase === 'hoist' || A.phase === 'land') && !taken('haul')) L.push(['haul', haulScr()]);
    return L;
  }
  const FG = fingers(X, {
    down(f) {
      A.downs.push([Math.round(f.x), Math.round(f.y)]); if (A.downs.length > 6) A.downs.shift();
      if (A.phase === 'open' || A.phase === 'caravan' || A.phase === 'sorry') { A.skip = 1; return; }
      const g = nearest(f, gripsNow()); if (!g) return;
      A.fing.set(f.id, g); f.g = g; f.ly = f.y;
      if (ROPES.includes(g)) { A.tasks = A.tasks.filter((q) => !(q.k === g)); ev('take:' + g); }
      if (g === 'hook') hookTo(f);
    },
    move(f) {
      const g = A.fing.get(f.id); if (!g) return;
      const dy = f.y - f.ly; f.ly = f.y;
      if (ROPES.includes(g)) A.dy[g] = (A.dy[g] || 0) + dy;
      else if (g === 'hook') hookTo(f);
      else if (g === 'haul') A.haulPx = (A.haulPx || 0) + dy;
    },
    up(f) {
      const g = A.fing.get(f.id); A.fing.delete(f.id); if (!g) return;
      if (ROPES.includes(g)) { RP[g].pull = 0; makeFast(g); ev('fast:' + g); }
    },
  });
  const held = (key) => taken(key);

  /* ── the opening picture and the fade between the Mount and the sea ── */
  function fade(on, ms = 450) {
    if (!A.fadeEl) { const el = document.createElement('div'); el.className = 'h109-ui'; el.style.cssText = 'position:fixed;inset:0;background:#0B1418;opacity:0;transition:opacity .45s;z-index:56;pointer-events:none'; document.body.appendChild(el); A.fadeEl = el; }
    A.fadeEl.style.transitionDuration = ms + 'ms'; requestAnimationFrame(() => { if (A.fadeEl) A.fadeEl.style.opacity = on ? '1' : '0'; });
  }
  function bigLine(text, ms = 3200, rise = false) {   // (the calm: the whole screen lights and the line stands large)
    const el = document.createElement('div'); el.className = 'h109-ui';
    el.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:60;pointer-events:none;background:radial-gradient(circle at 50% 45%,rgba(255,236,170,.85),rgba(255,214,120,.35) 45%,rgba(255,200,90,0) 75%);opacity:0;transition:opacity .25s';
    el.innerHTML = `<b style="font:900 34px/1.25 Heebo,system-ui;color:#4A2A00;text-shadow:0 0 18px #fff8;direction:rtl;text-align:center;padding:0 24px;transition:transform 2.2s ease-out">${text}</b>`;
    if (rise) { el.style.background = 'none'; el.firstChild.style.color = '#FFF6DC'; el.firstChild.style.textShadow = '0 2px 12px #000c'; el.firstChild.style.transform = 'translateY(60px)'; }   // (his words rise over the hold)
    document.body.appendChild(el); requestAnimationFrame(() => { el.style.opacity = '1'; if (rise) el.firstChild.style.transform = 'translateY(-90px)'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, ms);
    if (!rise) try { if (X.haptic) X.haptic([30, 50, 30, 50, 80]); } catch (e) { /* */ }
  }

  /* ── the weather of each work ── */
  const T0 = { v: 0 };   // (the model's clock + T0 = the sea's clock)
  function weather() {
    if (id === 'sea1') { const tEnd = s.sw[s.sw.length - 1].t0, k = A.phase === 'open' ? 0 : sm(2, tEnd - 4, s.t); S.set({ k, brk: 0, hole: 0, furl: sm(0, 10, s.t) * (A.phase === 'open' ? 0 : 1), swells: swellsOf(s, T0.v) }); return; }
    if (id === 'sea2') {
      if (A.phase === 'calm' || A.phase === 'sorry') { const c = A.calmT; S.set({ k: Math.max(0.06, 1 - c * 1.6), brk: sm(0, 2.5, c), hole: sm(0.3, 4, c), furl: 1, swells: [] }); return; }
      S.set({ k: 1, brk: 0, hole: 0, furl: 1, swells: A.hsw ? swellsOf(s, T0.v).concat(A.hsw) : swellsOf(s, T0.v) }); return;
    }
    S.set({ k: 0, brk: 0, hole: 0, furl: 1, swells: [], shipX: A.shipX });
  }

  /* ═══ sea1 / sea2: the ropes through the swells ═══ */
  const midScr = (k) => { const R = RP[k]; return deckScr(lerp(R.rx, R.cx, 0.4), P.top + 0.4, lerp(R.edgeOut, R.cz, 0.3)); };
  function ropesStep(dt) {
    const inp = { ropes: {} };
    for (const [fid, g] of A.fing) if (ROPES.includes(g)) { const d = A.dy[g] || 0; inp.ropes[g] = d; RP[g].pull = clamp(RP[g].pull + d * 0.004, 0, 1.4); void fid; }
    A.dy = {};
    seaStep(s, inp, dt);
    for (const e of s.ev) {
      ev(e.e + (e.rope ? ':' + e.rope : ''));
      if (e.e === 'crest') { V.creak(); SS.shake = Math.max(SS.shake, 0.4); }
      if (e.e === 'snatch') { V.creak(); const R = RP[e.rope], d = headDir(e.sw.head); R.slideT = 1.4; R.slideD = [d[0] * 0.5, d[1] * 0.5]; SS.shake = Math.max(SS.shake, 0.7); }
      if (e.e === 'sing') { const k = lowRopes(e.sw.head).crest[0], q = midScr(k); V.string(0.6); X.quick({ sx: q.x, sy: q.y }, QUICK.rope, E.rope); A.quickN++; }
      if (e.e === 'strand') { V.creak(); X.line('נים אחד נפרם: החבל שחוק עכשיו', 2600); }
      if (e.e === 'ring' || e.e === 'torn') {
        const key = e.e === 'ring' ? 'sea.ring' : 'sea.torn', q = midScr(e.rope);
        X.loss(LOSS[key][1], { sx: q.x, sy: q.y }, LOSS[key][0]); SS.shake = 1; V.creak(); marks(); makeFast(e.rope);
        st.sea = seaCarry(s, st.sea); for (const k of ROPES) { s.ropes[k].ring = 0; s.ropes[k].torn = 0; } X.save();   // (it stays: the save has it at once)
        marks();
      }
    }
    // the voice of the ropes: a hum that rises with the highest tension in the singing band, creaking in the frays band
    let hi = 0; for (const k of ROPES) hi = Math.max(hi, s.ropes[k].eff);
    V.hum(hi > H128.BAND.quiet ? 1 : 0, Math.min(1.2, hi));
    if (hi > H128.BAND.sings && ((SS.t * 2) | 0) !== A.cr) { A.cr = (SS.t * 2) | 0; V.creak(); }
    if (s.done) ropesDone();
  }
  function ropesDone() {
    st.sea = seaCarry(s, st.sea); for (const k of ROPES) { s.ropes[k].ring = 0; s.ropes[k].torn = 0; } X.save();
    for (const [, g] of A.fing) if (ROPES.includes(g)) makeFast(g);
    A.fing.clear(); V.hum(0);
    if (id === 'sea1') { A.phase = 'end'; A.endT = 0; X.line('', 0); }
    else { A.phase = 'throw'; A.thT = 0; throwStart(); }
  }

  /* ═══ sea2: the throw (seen, no touch), the hold (both thumbs), the calm, the quiet moment ═══ */
  const LIFTERS = [0, 1, 2, 3];
  function throwStart() {
    X.line('', 0);
    for (const k of ['portFore', 'portAft']) RP[k].gone = 1;   // (the sailors cast off its lashings)
    const c = crew(); LIFTERS.forEach((i, j) => { const a = c[i]; if (!a) return; a.own128 = true; A.tasks = A.tasks.filter((q) => q.a !== a); S.actors.walk(a, [DK.lift[j]], 3.4); a.lift = DK.lift[j]; });
    A.throwCam = CM.throw[1].slice();
  }
  const door = () => P.doors.port;
  function throwFrame(dt) {
    A.thT += dt; const t = A.thT, g = door(), c = crew();
    // the sailors: at the door, bent to its edge (0–2 s), lifting (2–3.6 s), heaving it over the rail (3.6–4.4 s), then they turn
    LIFTERS.forEach((i, j) => { const a = c[i]; if (!a || a.path) return; a.yaw = Math.PI;   // (all four at its inboard edge, facing the rail)
      const up = sm(2, 3.4, t); a.bowT = lerp(1.0, 0.1, up); a.knT = lerp(0.5, 0, up); a.armT = [lerp(0.4, 2.3, up), -0.2, lerp(0.4, 2.3, up), -0.2]; });
    if (!g.userData.off) {
      // the leaf rises on its outboard edge, tips over the rail, then leaves the ship
      const up = sm(2, 3.6, t), over = sm(3.6, 4.4, t);
      g.rotation.x = -(up * 1.25 + over * 0.9); g.position.y = P.deckY + 0.3 + up * 0.6 + over * 1.6; g.position.z = D.port[1] - over * 4.2;
      if (t >= 4.4) {   // (into the sea's frame: it falls from here)
        g.updateMatrixWorld(true); const m4 = g.matrixWorld.clone(); S.ship.remove(g); S.scene.add(g); m4.decompose(g.position, g.quaternion, g.scale);
        g.userData.off = 1; g.userData.v = new THREE.Vector3(0, 1.5, -3); g.userData.spin = -1.2; V.creak();
      }
    } else if (!g.userData.sunk) {
      const u = g.userData, wy = S.waterAt(g.position.x, g.position.z);
      if (!u.wet) { u.v.y -= H128.G * dt; g.position.addScaledVector(u.v, dt); g.rotateX(u.spin * dt);
        if (g.position.y < wy + 0.5) { u.wet = 1; splash(g.position.x, wy, g.position.z); V.splash(1); u.v.set(0, -0.5, 0); u.wetT = 0; } }
      else {
        // (B3) it lies a moment on the water face up, then its far end dips, the near end rises out of the water and the bronze slides
        // under, down until nothing of it is above the surface
        u.wetT += dt; const w = u.wetT;
        if (!u.q0) { u.q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.08, 0, 0)); u.x0 = g.position.x; u.z0 = g.position.z; }
        const tip = sm(0.5, 2.2, w) * 0.85, dn = sm(0.4, 3.8, w) * 7.5;
        g.quaternion.copy(u.q0).multiply(_q.setFromAxisAngle(v4.set(0, 0, 1), tip));
        g.position.set(u.x0 - tip * 2.2, wy - 0.12 - dn + Math.sin(w * 2.1) * 0.1 * (1 - sm(0.4, 1.2, w)), u.z0);
        // gone when its highest corner is under the water
        let top = -1e9; for (const ex of [-10, 10]) { v4.set(ex, 0.4, 0).applyQuaternion(g.quaternion).add(g.position); top = Math.max(top, v4.y - S.waterAt(v4.x, v4.z)); }
        if (top < -0.35 || w > 7) { u.sunk = 1; g.visible = false; }
      }
      // the camera stays on the door: its aim follows it down (in the deck's frame, near enough: the ship's own small turn left out)
      v3.copy(g.position); S.deck.worldToLocal(v3); A.throwCam = [v3.x, Math.max(-3, v3.y), v3.z];
    }
    if (t > 2.5 && !A.thLine) { A.thLine = 1; X.line(LINES.throw, 5200); }
    if (g.userData.sunk) A.goneT = (A.goneT || 0) + dt;   // (the camera stays a moment on the water where it went down)
    if (A.goneT > 1.6 || t > 14) { A.phase = 'turn'; A.tuT = 0; turnStart(); }
  }
  function splash(x, y, z) {
    const sp = E.sp; E.splash.visible = true;
    for (let i = 0; i < sp.N; i++) { const a = (i / sp.N) * TAU * 3.7, r = 0.6 + (i % 7) * 0.25; sp.P.set([x + Math.cos(a) * r, y, z + Math.sin(a) * r], i * 3); sp.V.set([Math.cos(a) * (1.5 + (i % 5)), 6 + (i % 9) * 0.9, Math.sin(a) * (1.5 + (i % 5))], i * 3); sp.L[i] = 1.2 + (i % 4) * 0.2; }
  }
  function splashFrame(dt) {
    if (!E.splash.visible) return; const sp = E.sp; let live = 0;
    for (let i = 0; i < sp.N; i++) { if (sp.L[i] <= 0) continue; live++; sp.L[i] -= dt; const j = i * 3; sp.V[j + 1] -= H128.G * dt; sp.P[j] += sp.V[j] * dt; sp.P[j + 1] += sp.V[j + 1] * dt; sp.P[j + 2] += sp.V[j + 2] * dt; if (sp.L[i] <= 0) sp.P[j + 1] = -999; }
    sp.G.attributes.position.needsUpdate = true; if (!live) E.splash.visible = false;
  }
  function turnStart() {
    X.line('', 0);
    // the sailors turn to the second door; he throws himself on it; the camera lifts a little by itself (both thumbs will be busy)
    const c = crew(); LIFTERS.forEach((i, j) => { const a = c[i]; if (!a) return; S.actors.walk(a, [DK.help[j]], 3); a.yaw = Math.PI; });   // (B6: to its far side, by the starboard rail)
    const n = nic(); n.own128 = true; S.actors.walk(n, [[DK.hold[0], DK.hold[1] - 3.4]], 3.6);
    try { if (X.lookLift) X.lookLift(0.22); } catch (e) { /* */ }
    hold = holdFresh({ mouse }); A.hold = hold; A.hsw = [];
    if (mouse) { const kp = c[1]; if (kp) { kp.own128 = true; S.actors.walk(kp, [DK.keeper], 3); } }
  }
  function turnFrame(dt) {
    A.tuT += dt; const n = nic(), c = crew();
    LIFTERS.forEach((i) => { const a = c[i]; if (a && !a.path) { a.yaw = Math.PI; a.bowT = 0.35; a.armT = [1.2, -0.3, 1.2, -0.3]; } });   // (facing the door from beyond it)
    // (B6) he kneels on the door's inboard half facing across it (his back to the camera), bowed over it, larger than life so he
    // reads at the lifted camera, his arms out to the two rings (the arms drawn on from his hands to the fists: fistsFrame)
    if (!n.path) { if (n.s0 == null) n.s0 = n.s; n.s = n.s0 * HOLD_S; n.x = DK.hold[0]; n.z = DK.hold[1] - 1.7; n.fixedY = P.top; n.yaw = 0; n.bowT = 1.2; n.knT = 1; n.armT = [0.55, 1.25, 0.55, 1.25]; }
    if (mouse) { const kp = c[1]; if (kp && !kp.path) { kp.yaw = Math.atan2(DK.handles.stbd[1][0] - kp.x, DK.handles.stbd[1][1] - kp.z); kp.bowT = 1.1; kp.knT = 0.8; kp.armT = [0.9, 0, 0.9, 0]; } }
    if (A.tuT > 2.4 && !n.path) { A.phase = 'hold'; X.line(mouse ? 'הניחו יד על הטבעת שלפניכם: המלח מחזיק את השנייה' : 'שני האגודלים על שתי הטבעות', 4200); }
  }
  // the fists: on the rings while held; a slipping hand slides along its ring (1.2 s) and comes off beside it
  function fistsFrame() {
    const H = A.hold; if (!H) { E.fist.count = 0; E.arm.count = 0; return; }
    let n = 0;
    for (const h of ['L', 'R']) {
      const hd = DK.handles.stbd[h === 'L' ? 0 : 1], on = H.on[h] || (mouse && h === 'R'), sl = H.slip[h] > 0 ? 1 - H.slip[h] / HOLD.SLIP : 0;
      if (!on && !H.off[h] && !(held('ring' + h))) continue;
      let x = hd[0], y = P.top + 0.42, z = hd[1] + 0.5;
      if (sl) { const a = sl * 2.2; x += Math.sin(a) * 0.62 * (h === 'L' ? -1 : 1); z += (Math.cos(a) - 1) * 0.62; }
      if (H.off[h]) { x += (h === 'L' ? -1.1 : 1.1); z += 0.9; y = P.top + 0.1; }
      _m.compose(_a.set(x, y, z), _q.identity(), _s.set(1.1, 0.8, 0.9)); E.fist.setMatrixAt(n, _m);
      // his arm out along the door to that hand (he lies on the door between the rings, an arm to each)
      // (facing +z, his right hand is the −x one: ring L, at the lower x, is his right's)
      const nn = nic(); S.actors.handWorld(nn, h === 'L' ? -1 : 1, v4); seg(E.arm, n++, v4, _a.set(x, y, z), 0.2);
    }
    E.fist.count = n; E.arm.count = n; E.arm.instanceMatrix.needsUpdate = true; E.fist.instanceMatrix.needsUpdate = true;
  }
  function holdStep1(dt) {
    const H = hold;
    holdStep(H, { L: held('ringL'), R: mouse ? true : held('ringR') }, dt);
    const w = holdSwell(H); if (w && !A.hsw.some((q) => q.n === w.n)) A.hsw.push({ head: w.head, t0: w.t0 + T0.v, H: HOLD_H, n: w.n });
    for (const e of H.ev) {
      ev('hold:' + e.e + (e.hand || ''));
      if (e.e === 'line') { bigLine(LINES.hold, 2400, true); X.line(LINES.hold, 4200); V.creak(); }
      if (e.e === 'held') { V.creak(); SS.shake = 0.8; const q = deckScr(DK.hold[0], P.top + 1, DK.hold[1] + D.W / 2 + 1.5); X.quick({ sx: q.x, sy: Math.max(innerHeight * 0.25, q.y - innerHeight * 0.06) }, 'החזקתם!'); }   // (B6: above the door's far edge, never over him, and below the top's pill as it rises)
      if (e.e === 'again') { SS.shake = 0.8; X.line('יד אחת לא הייתה על הטבעת: הגל חוזר', 2600); }
      if (e.e === 'off') { try { if (X.haptic) X.haptic(12); } catch (er) { /* */ } }
      if (e.e === 'calm') calmStart();
    }
  }
  function calmStart() {
    A.phase = 'calm'; A.calmT = 0; A.fing.clear();
    try { if (X.lookLift) X.lookLift(0); } catch (e) { /* */ }
    bigLine(LINES.calm, 3400); V.bell(262); V.gong(131, false); V.sea(0.05, 0);
    X.line('', 0);
  }
  function calmFrame(dt) {
    A.calmT += dt;
    if (A.calmT > 4.2) {
      A.phase = 'sorry'; A.soT = 0; A.hold = null; E.fist.count = 0; E.arm.count = 0;
      const n = nic(); delete n.fixedY; n.y = 0; if (n.s0 != null) { n.s = n.s0; n.s0 = null; } n.bowT = 0.15; n.knT = 0; n.armT = [0.3, 0.05, 0.3, 0.05]; S.actors.walk(n, [DK.sorry], 1.6);
      if (mouse) { const kp = crew()[1]; if (kp) kp.own128 = false; }
      LIFTERS.forEach((i) => { const a = crew()[i]; if (a) a.own128 = false; });
      X.line(LINES.sorry, 5200);
    }
  }
  function sorryFrame(dt) {
    A.soT += dt; const n = nic();
    if (!n.path) { n.yaw = Math.PI; n.bowT = 0.22; }
    if (A.soT > 5.2 || (A.skip && A.soT > 1.2)) { A.skip = 0; end1(); }
  }

  /* ═══ sea3: Akko — the hook, the hoist, the landing; the caravan ═══ */
  const BOB = QY.bob;
  const gapZ = BOB[1], qTop = () => E.Y0 + QY.top;
  const ak3 = { hook: new THREE.Vector3(), head: new THREE.Vector3(), phi: 0, ring: new THREE.Vector3(), haul: 0, ease: 0 };
  function headAt(phi, out) { const a = E.head0 + phi; return out.set(E.derrickFoot.x + Math.cos(a) * E.headR, E.headY, E.derrickFoot.z + Math.sin(a) * E.headR); }
  function hookScr() { return worldScr(ak3.hook); }
  function haulScr() { return worldScr(v3.set(QY.haul[0], qTop() + 1, QY.haul[1]).clone()); }
  function hookTo(f) {
    const r = rayOf(f), d = r.direction, o = r.origin; if (Math.abs(d.z) < 1e-4) return;
    const tt = (gapZ - o.z) / d.z; if (tt < 0) return;
    const wy = S.waterAt(BOB[0], BOB[1]);
    ak3.hook.set(clamp(o.x + d.x * tt, BOB[0] - 9, BOB[0] + 9), clamp(o.y + d.y * tt, wy - 0.8, E.headY - 3), gapZ);
  }
  function akkoBuild() {
    E.quay.visible = true; A.shipX = SS.t * 2.2;
    const g = door(); g.visible = true; g.userData = {}; if (g.parent !== S.scene) { S.ship.remove(g); S.scene.add(g); }
    g.rotation.set(0, 0, 0); g.quaternion.identity();
    ak3.phi = 0; headAt(0, ak3.head); ak3.hook.set(QY.hookRest[0], E.Y0 + QY.hookRest[2], QY.hookRest[1]);
    // the derrick's crew on the quay, with the hauling end of the rope in their hands (they stand on the quay's top: the sea's frame)
    A.dcrew = [];
    for (const [x, z] of QY.crew) { const a = S.actors.add('worker', x, z, { y: 0, scale: 1.0, col: '#7A6046' }); if (a) { a.own128 = true; A.dcrew.push(a); } }
    for (const k of ['portFore', 'portAft']) RP[k].gone = 1;
  }
  function akkoDoor(dt) {
    const g = door(), wy = S.waterAt(BOB[0], BOB[1]), a = ak;
    let ring;
    if (a.phase === 'hook') { ring = v3.set(BOB[0], wy + ringY(a.t), gapZ + 0.25); g.rotation.set(0, 0, Math.PI / 2 + 0.06 * Math.sin(a.t * 1.3)); }
    else {
      // hung from the derrick's head by its ring: the pendulum's angle toward the quay (−z), the rope shortened as it is hauled
      const ry0 = wy, ryTop = E.headY - 2.5;
      let ry = lerp(ry0, ryTop, clamp(a.lift / AKKO.LIFT, 0, 1));
      if (a.phase === 'land' || a.done) ry = qTop() + 14.2 + (a.y / AKKO.DROP) * (ryTop - (qTop() + 14.2));
      const Lr = Math.max(2.5, E.headY - ry), th = a.th;
      ring = v3.set(ak3.head.x, ak3.head.y - Lr * Math.cos(th), ak3.head.z - Math.min(Lr, AKKO.LEN) * Math.sin(th));
      ring.y = Math.min(ring.y, ry);
      g.rotation.set(-th, 0, Math.PI / 2);
    }
    // the leaf's ring handle (its fore handle) is at the group's local (+4, T + 0.38): the group placed so the ring is at `ring`
    const hd = DK.handles.port[1][0] - D.port[0];
    _a.set(hd, D.T + 0.38, 0).applyEuler(g.rotation); g.position.copy(ring).sub(_a);
    ak3.ring.copy(ring);
    if (a.phase !== 'hook') ak3.hook.copy(ring).add(_b.set(0, 0.35, 0));
    // the landing: its lower edge on the quay, then the crew tips it down flat onto two timbers (about 2 s)
    if (a.phase === 'land' || A.phase === 'landed') {
      const L2 = D.L / 2;
      if (!A.p0 || A.phase !== 'landed') A.p0 = [g.position.x, qTop(), g.position.z];
      const p0 = A.p0, k = A.phase === 'landed' ? ease(clamp((A.laT - 0.4) / 2, 0, 1)) : 0;
      E.timber.count = 2; for (const j of [0, 1]) { _m.compose(_a.set(p0[0] + L2 + (j ? 5 : -5), p0[1] + 0.25, p0[2]), _q.identity(), _s.set(1, 1, 1)); E.timber.setMatrixAt(j, _m); } E.timber.instanceMatrix.needsUpdate = true;
      if (A.phase === 'landed') { const r = Math.PI / 2 * (1 - k); g.rotation.set(0, 0, r); g.position.set(p0[0] + Math.cos(r) * L2, p0[1] + Math.sin(r) * L2 + k * 0.5, p0[2]); }
    }
  }
  function akkoQuay() {
    const f = E.derrickFoot, h = ak3.head;
    headAt(ak3.phi, h);
    E.post.position.set(f.x, (f.y + E.headY * 0.55) / 2, f.z); E.post.scale.set(1, E.headY * 0.55 - f.y, 1);
    _a.set(f.x, E.headY * 0.55 - 0.3, f.z); _b.subVectors(h, _a); { const L = _b.length(); E.boom.position.copy(_a).addScaledVector(_b, 0.5); E.boom.quaternion.setFromUnitVectors(_y, _b.multiplyScalar(1 / Math.max(L, 1e-5))); E.boom.scale.set(1, L, 1); }
    E.block.position.copy(h).add(_b.set(0, -0.4, 0));
    E.hook.position.copy(ak3.hook);
    // the hook's rope from the head; the hauling end down the post and along the quay to the crew's hands
    seg(E.qrope, 0, _a.copy(h).add(_b.set(0, -0.8, 0)), _b.copy(ak3.hook).add(v4.set(0, 0.9, 0)), 0.07);
    seg(E.qrope, 1, _a.copy(h), v4.set(f.x, E.headY * 0.55, f.z), 0.07);
    seg(E.qrope, 2, _a.set(f.x, f.y + 1.2, f.z), v4.set(QY.haul[0], qTop() + 1, QY.haul[1]), 0.07);
    E.qrope.instanceMatrix.needsUpdate = true;
    for (const [j, w] of (A.dcrew || []).entries()) {   // (hand over hand while the rope is hauled; braced when it is eased)
      const q = QY.crew[j]; w.x = q[0]; w.z = q[1]; w.y = 0; w.yaw = Math.atan2(f.x - q[0], f.z - q[1]);
      const hv = Math.sin(SS.t * 7 + j) * clamp((A.haulV || 0) + (A.easeV || 0), 0, 1);
      w.bowT = 0.35 + 0.15 * hv; w.knT = 0.2; w.armT = [1.3 + 0.5 * hv, -0.15, 1.3 - 0.5 * hv, -0.15];
    }
  }
  function akkoStep1(dt) {
    const a = ak;
    // the thumb's haul and ease (amot of rope a second: 80 px of drag an amah), eased over a short window (the touch's events are uneven)
    const px = A.haulPx || 0; A.haulPx = 0;
    const hv = Math.max(0, px) / 80 / Math.max(dt, 1e-3), ev2 = Math.max(0, -px) / 80 / Math.max(dt, 1e-3);
    const k = 1 - Math.exp(-dt / 0.15); A.haulV = lerp(A.haulV || 0, held('haul') ? hv : 0, k); A.easeV = lerp(A.easeV || 0, held('haul') ? ev2 : 0, k);
    const wy = S.waterAt(BOB[0], BOB[1]);
    const inp = a.phase === 'hook' ? { hx: ak3.hook.x - BOB[0], hy: ak3.hook.y - wy } : a.phase === 'hoist' ? { haul: A.haulV } : a.phase === 'land' ? { ease: A.easeV } : {};
    akkoStep(a, inp, dt);
    if (a.phase === 'slew') ak3.phi = Math.PI * ease(clamp(a.slew / AKKO.SLEW, 0, 1));
    for (const e of a.ev) {
      ev('akko:' + e.e);
      if (e.e === 'hook') { const q = hookScr(); if (e.first) X.quick({ sx: q.x, sy: q.y }, QUICK.hook, E.hook); V.knock(1.2); A.phase = 'hoist'; A.fing.clear(); X.line('אגודל שמאל: משכו את חבל ההרמה (גררו למטה) כשהדלת נעה אל הרציף', 5200); }
      if (e.e === 'miss') V.clack();
      if (e.e === 'stop') X.line('הדלת מתנדנדת חזק: צוות המנוף עוצר עד שתירגע', 2600);
      if (e.e === 'slew') { A.phase = 'slew'; X.line('המנוף מסובב את הדלת אל מעל הרציף', 2600); }
      if (e.e === 'touch') {
        const q = worldScr(_a.copy(ak3.ring).add(_b.set(0, -6, 0)));
        if (e.soft) { X.quick({ sx: q.x, sy: q.y }, QUICK.soft, door().children[0]); V.bell(294); }
        else { V.knock(2.2); SS.shake = 1; X.line('הדלת נחתה בחבטה', 2200); }
        A.phase = 'landed'; A.laT = 0;
      }
    }
    if (a.phase === 'land' && A.phase === 'slew') { A.phase = 'land'; X.line('שחררו את החבל לאט (גררו למעלה): נחיתה רכה', 4200); }
  }
  function caravanStart() {
    A.phase = 'caravan'; A.caT = 0; A.skip = 0; X.line('', 0);
    fade(true, 400);
    setTimeout(() => {
      seaDown(true); SS.act = null;
      // on the Mount: the two wagons with the doors, one after the other along the road to the court's east gate (המחשה). One side
      // shot that goes with them: each wagon whole, its bronze door lying flat on its bed, a yoke of oxen walking before it (the old
      // world's walk cycle: animals.js), its wheels on the ground and turning, two men walking beside it with a hand on it; nobody else
      const C = S6.caravan, T = X.THREE, Mx = mats(X); A.wag = [];
      for (let w = 0; w < 2; w++) {
        const g = new T.Group(); X.props.root.add(g);
        const bed = new T.Mesh(new T.BoxGeometry(C.len, 0.5, C.w), Mx.wood); bed.position.y = C.wheel + 0.3; g.add(bed);
        for (const s of [-1, 1]) { const r = new T.Mesh(new T.BoxGeometry(C.len, 0.35, 0.22), Mx.dark); r.position.set(0, C.wheel + 0.65, s * (C.w / 2 - 0.11)); g.add(r); }   // (the bed's side rails)
        // the pole from the bed's front to the yoke between the oxen
        const pl = -C.len / 2 - (C.ox - C.yokeX), ph = C.yokeY - C.wheel, pn = Math.hypot(pl, ph);
        const pole = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, pn, 6), Mx.wood); pole.rotation.z = Math.atan2(pl, ph); pole.position.set(-C.len / 2 - pl / 2, C.wheel + ph / 2, 0); g.add(pole);
        const wheels = [];
        for (const ax of C.axles) for (const s of [-1, 1]) { const wh = wheelOf(T, Mx, C.wheel); wh.position.set(ax, C.wheel, s * (C.w / 2 + 0.25)); g.add(wh); wheels.push(wh); }
        g.userData.wheels = wheels;
        const lf = leafSlab(X, w === 1, false); lf.rotation.z = -Math.PI / 2; lf.position.set(-C.len / 2 + 0.5, C.wheel + 0.55 + 0.35, -2.5); g.add(lf);   // (lying flat, its face up)
        A.wag.push(g);
      }
      // the men: two by each wagon on the near side, walking with a hand on its rail (gang men: the figures gate leaves them be)
      A.men = [];
      try { for (let j = 0; j < 4; j++) { const w = SH6.crew.add(C.from[0], C.from[1] + C.side, { role: 'walk', crew: 1 + (j % 3) }); if (w) { w.j = j; A.men.push(w); } } } catch (e) { /* */ }
      // a yoke of oxen draws each wagon (the old world's bulls, walking by their own cycle)
      A.ox = [];
      try { A.anim = createAnimals({ scene: X.scene, camera: X.camera, ground: (x, z) => { try { return X.ground(x, z); } catch (e) { return C.from[2]; } } }); for (let j = 0; j < 4; j++) { const o = A.anim.add('bull', C.from[0], C.from[1], { yaw: -Math.PI / 2, calm: true, scale: C.oxS }); if (o) A.ox.push(o); } } catch (e) { console.warn('[h128] oxen', e && e.message); }
      A.yoke = [];
      for (let w = 0; w < 2; w++) { const y = new T.Mesh(new T.BoxGeometry(0.35, 0.3, 4.2), Mx.wood); X.props.root.add(y); A.yoke.push(y); }
      X.kohen(false);   // (he is not in this picture: after it he stands near the capstan)
      // (and no one of the court's: the world's figures and the site's workers are out while the caravan passes; its own men stay)
      try { const lf = globalThis.__T && __T.life ? __T.life() : null, K = C.clear; if (lf && lf.clearField) { lf.clearField({ x0: K[0], x1: K[1], z0: K[2], z1: K[3] }); A.lifeBack = () => lf.clearField(null); } } catch (e) { /* */ }   // (the pilgrims standing by the road too)
      try { A.figsBack = filmFigs({ scene: X.scene, keep: () => A.men || [], workers: (fn) => { try { if (X.hero && X.hero.h128Workers) X.hero.h128Workers(fn); } catch (e) { /* */ } } }); } catch (e) { A.figsBack = null; }
      A.caT = 0; caravanFrame(0);
      X.line('השיירה עולה לירושלים עם הדלתות · הקישו לדלג', 5200);
      fade(false, 500);
      A.caOn = 1;
    }, 420);
  }
  function caravanFrame(dt) {
    A.caT += dt; if (!A.caOn) return;
    // the road west toward the gate (−x), at the oxen's own pace; the lead wagon's middle at xu, the second C.gap behind it
    const C = S6.caravan, z0 = C.from[1], go = C.v * A.caT, xu = C.from[0] - go;
    const gy = (x, z = z0) => { try { const v = X.ground(x, z); return Number.isFinite(v) ? v : C.from[2]; } catch (e) { return C.from[2]; } };
    (A.wag || []).forEach((g, w) => {
      // each axle on the ground under it: the bed pitched between them, the wheels turning by the way gone (no slip)
      const xc = xu + w * C.gap, xf = xc + C.axles[0], xr = xc + C.axles[1], yf = gy(xf), yr = gy(xr);
      g.position.set(xc, (yf + yr) / 2, z0); g.rotation.z = Math.asin(clamp((yf - yr) / (C.axles[0] - C.axles[1]), -0.3, 0.3));
      for (const wh of g.userData.wheels) wh.rotation.z = go / C.wheel;
    });
    // the oxen: a yoke to each wagon, walking (a path a step ahead at the caravan's pace, so their legs and heads move by their own cycle)
    (A.ox || []).forEach((o, j) => {
      const w = j > 1 ? 1 : 0, x = xu + w * C.gap + C.ox, z = z0 + (j % 2 ? 1 : -1) * C.oxZ;
      o.x = x; o.z = z; o.yaw = -Math.PI / 2; o.path = [[x - 8, z]]; o.pi = 0; o.speed = C.v; o.walkT0 = undefined; o.res = null;
    });
    try { if (A.anim) A.anim.update(dt); } catch (e) { /* */ }
    (A.yoke || []).forEach((y, w) => { const x = xu + w * C.gap + C.ox - C.yokeX; y.position.set(x, gy(x) + C.yokeY, z0); });
    // the men beside the wagons (the near side): walking at the same pace, the hand nearer the wagon on its rail
    (A.men || []).forEach((m) => {
      const w = m.j > 1 ? 1 : 0, x = xu + w * C.gap + C.men[m.j % 2], z = z0 + C.side, a = m.a;
      a.x = x; a.z = z; a.yaw = -Math.PI / 2; a.path = [[x - 8, z]]; a.pi = 0; a.speed = C.v; a.walkT0 = undefined; a.hold = 'R';   // ('R': the swing is the free arm's only)
      a.armT[0] = 0.15; a.armT[1] = 0.05; a.armT[2] = C.hand[0]; a.armT[3] = C.hand[1]; a.bowT = 0.08;
    });
    // the camera goes with them: one side shot from the book, moved along the road with the lead wagon
    const P = CM6.caravan; X.shot([P[0][0] - go, gy(P[1][0] - go) + P[0][1], P[0][2]], [P[1][0] - go, gy(P[1][0] - go) + P[1][1], P[1][2]], 0.01);
    if (A.caT > 5.2 || (A.skip && A.caT > 1)) { A.skip = 0; end1(); }
  }
  /** a wagon wheel (axis along z): a rim, six spokes and a hub, so its turning is seen */
  function figsBack() { for (const k of ['figsBack', 'lifeBack']) { const f = A[k]; A[k] = null; if (f) { try { f(); } catch (e) { /* */ } } } }
  function wheelOf(T, Mx, R) {
    const g = new T.Group();
    const rim = new T.Mesh(new T.TorusGeometry(R - 0.12, 0.13, 6, 18), Mx.dark); g.add(rim);
    for (let k = 0; k < 3; k++) { const sp = new T.Mesh(new T.BoxGeometry(0.12, 2 * R - 0.2, 0.1), Mx.wood); sp.rotation.z = k * Math.PI / 3; g.add(sp); }
    const hub = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 0.4, 10), Mx.dark); hub.rotation.x = Math.PI / 2; g.add(hub);
    return g;
  }
  function mats(X2) {
    if (!SS.cm) SS.cm = { wood: new X2.THREE.MeshLambertMaterial({ color: '#7A5A3C' }), dark: new X2.THREE.MeshLambertMaterial({ color: '#3B2A1C' }) };
    return SS.cm;
  }

  /* ═══ the end of a work ═══ */
  function end1() {
    if (A.phase === 'done') return; A.phase = 'done'; V.hum(0); V.stop();
    let pts, flags;
    if (id === 'sea3') { pts = akkoPts(ak); flags = { tries: ak.tries, maxSw: +ak.maxSw.toFixed(1), soft: ak.land ? ak.land.soft : 0, v: ak.land ? ak.land.v : null }; }
    else { pts = seaPts(s); flags = { 'sea.torn': s.flags['sea.torn'], 'sea.ring': s.flags['sea.ring'], clean: s.sw.map((w) => w.clean) }; }
    const q = qOf(pts); X.save(); figsBack();
    if (id === 'sea3') { try { const [hx, hz] = S6.caravan.after, sp = CAPSTAN.stand(); X.hero.setPos(hx, hz, Math.atan2(sp.x - hx, sp.z - hz)); } catch (e) { /* */ } X.kohen(true); }   // (after the caravan he stands near the capstan)
    X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags, at: id === 'sea3' ? null : (() => { const c = deckScr(-12, 1, 0); return { sx: c.x, sy: c.y }; })() });
  }

  /* ═══ the act's frame ═══ */
  function frame(dt) {
    SS.t += dt; A.t += dt;
    if (SS.shake > 0) SS.shake = Math.max(0, SS.shake - dt * 2.2);
    if (s && A.phase === 'ropes') ropesStep(dt);
    if (A.phase === 'throw') throwFrame(dt);
    if (A.phase === 'turn') turnFrame(dt);
    if (A.phase === 'hold') { turnFrame(0); holdStep1(dt); }
    if (A.phase === 'calm') calmFrame(dt);
    if (A.phase === 'sorry') sorryFrame(dt);
    if (ak && ['hook', 'hoist', 'slew', 'land'].includes(A.phase)) akkoStep1(dt);
    if (A.phase === 'landed') { A.laT += dt; if (A.laT > 3.4) caravanStart(); }
    if (A.phase === 'end') { A.endT += dt; if (A.endT > 1.2) end1(); }
    if (A.phase === 'open') { if (A.t > 6 || A.skip) { A.skip = 0; X.line('', 0); playStart(); } }
    if (A.phase === 'caravan') { caravanFrame(dt); return; }
    if (!S) return;
    weather();
    tasksFrame(dt); splashFrame(dt);
    if (ak) { akkoQuay(); akkoDoor(dt); }
    ridges(); washFrame();
    S.update(SS.t, dt);
    if (s) drawRopes(dt); fistsFrame();
    look(dt); S.aim();
    V.sea(S.state.k, S.state.k * (1 - S.state.brk)); V.frame();
    SS.fresh = true;
  }
  function playStart() {
    A.phase = 'ropes'; T0.v = SS.t - s.t;
    X.line(id === 'sea1' ? 'גררו קצה חבל אליכם כדי למתוח, הלאה כדי לשחרר · אגודל ימין: הגל הבא' : 'חבל אחד שחוק: אל תמתחו אותו עד הסוף, חלקו את העומס', 5200);
  }

  const actApi = {
    begin() {
      FG.attach(); X.kohen(false);
      const fresh = !SS.on;
      // a short flight of the camera out to the sea from the court's east gate (when the sea is not on screen yet), then the sea
      if (fresh) { try { X.shot(S6.cam.toSea[0], S6.cam.toSea[1], 1.1); } catch (e) { /* */ } fade(true, 900); }
      setTimeout(() => {
        S = seaUp(); if (!S) { console.warn('[h128] sea: no renderer'); X.end({ stars: 0, q: 0, pts: 0 }); return; }
        E = SS.ext; P = S.play; SS.act = actApi; SS.idle = 0;
        // the ship as the journey left her: the door thrown in sea2 is gone, the lashings as the save has them
        const pd = P.doors.port;
        if (id === 'sea1' || id === 'sea2') { if (pd.parent !== S.ship) { S.scene.remove(pd); S.ship.add(pd); } pd.visible = true; pd.userData = {}; pd.rotation.set(0, 0, 0); pd.position.set(D.port[0], P.deckY + 0.3, D.port[1]); }
        for (const a of S.crew) { a.own128 = false; } S.nicanor.own128 = false; S.nicanor.y = 0;
        S.crew[0].x = DK.fast.portAft[0]; S.crew[0].z = DK.fast.portAft[1]; S.crew[1].x = DK.fast.stbdAft[0]; S.crew[1].z = DK.fast.stbdAft[1];
        S.crew[0].to = P.cleatAt.portAft; S.crew[1].to = P.cleatAt.stbdAft;
        E.quay.visible = false; E.shore.visible = id === 'sea1'; E.fist.count = 0; S.set({ shipX: null });
        marks();
        if (id === 'sea3') { akkoBuild(); A.phase = 'arrive'; A.arT = 0; X.line(LINES.akko, 6200); }
        else if (id === 'sea1') { A.phase = 'open'; A.t = 0; X.line(LINES.open + ' · הקישו לדלג', 0); }
        else playStart();
        frame(0); if (fresh) fade(false, 600);
      }, fresh ? 1000 : 0);
    },
    update(dt) {
      try {
        if (A.phase === 'arrive') { A.arT += dt; if (A.arT > 4.5) { A.phase = 'hook'; X.line('גררו באגודל ימין את האנקול אל הטבעת, כשהיא מעל המים', 5200); } }
        if (A.phase === 'enter') return;
        frame(dt);
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h128] sea', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.fing.clear(); },
    // (rule 66: a right-half touch is the act's only on one of its grips — a rope's tail, a ring, the hook, the hauling end — or to skip
    //  a film; any other right-half drag lifts the camera)
    wants(p) { if (['open', 'caravan', 'sorry'].includes(A.phase)) return true; if (!p || !S) return false; return !!nearest(p, gripsNow()); },
    holds() { return A.fing.size > 0; },
    end() {
      FG.detach(); V.stop(); X.line('', 0);
      try { if (A.fadeEl) A.fadeEl.remove(); } catch (e) { /* */ }
      try { if (X.lookLift) X.lookLift(0); } catch (e) { /* */ }
      figsBack();
      for (const g of (A.wag || []).concat(A.yoke || [])) X.props.remove(g);
      try { for (const o of A.ox || []) A.anim.remove(o); } catch (e) { /* */ }
      for (const w of A.men || []) { try { SH6.crew.remove(w); } catch (e) { /* */ } }
      for (const a of A.dcrew || []) { try { S.actors.remove ? S.actors.remove(a) : (a.alive = false); } catch (e) { /* */ } }
      if (SS.act === actApi) { SS.act = null; SS.idle = 0; }
    },
    at() { return { x: S6.eastGate[0], y: S6.eastGate[2] + 2, z: S6.eastGate[1] }; },
    dbg() {
      const o = { id, phase: A.phase, ox: (A.ox || []).length, t: +A.t.toFixed(2), seaT: +SS.t.toFixed(2), look: { u: +A.look.u.toFixed(3), yaw: +A.look.yaw.toFixed(2), ov: !!A.look.ov }, calls: SS.calls, tris: SS.tris, drawMs: +SS.drawMs.toFixed(2), mouse, ev: A.ev.slice(-10), downs: A.downs, nf: FG.n, fing: [...A.fing.values()], grip: GRIP };
      if (S) { const d = S.dbg(); o.k = d.k; o.brk = d.brk; o.roll = d.roll; o.scriptMs = d.scriptMs; }
      if (s) {
        o.mt = +s.t.toFixed(2); o.T0 = +T0.v.toFixed(2);
        o.ropes = Object.fromEntries(ROPES.map((k) => { const r = s.ropes[k]; return [k, { t: +r.t.toFixed(3), tgt: +r.tgt.toFixed(3), eff: +r.eff.toFixed(3), band: bandOf(r.t), worn: r.worn, fray: +r.fray.toFixed(2), gone: RP[k].gone }]; }));
        o.sw = s.sw.map((w) => ({ head: w.head, t0: w.t0, crest: w.crest, back: w.back, clean: w.clean })); o.next = nextSwell(s); o.D = SEA_LV[id].D; o.dmg = s.dmg; o.flags = s.flags; o.pts = seaPts(s);
        if (S && SS.S === S && A.phase === 'ropes') o.tails = Object.fromEntries(ROPES.map((k) => { const q = tailScr(k); return [k, [Math.round(q.x), Math.round(q.y)]]; }));
        o.low = o.next ? lowRopes(o.next.head) : null;
        if (S && SS.S === S && A.phase === 'ropes') o.frame = frameNow();
      }
      if (A.phase === 'throw' && P) { const u = (P.doors.port || {}).userData || {}; o.th = { t: +(A.thT || 0).toFixed(2), off: !!u.off, wet: !!u.wet, wetT: +(u.wetT || 0).toFixed(2), sunk: !!u.sunk }; }
      if (hold) { o.hold = { on: { ...hold.on }, off: { ...hold.off }, slip: { L: +hold.slip.L.toFixed(2), R: +hold.slip.R.toFixed(2) }, held: hold.held, swells: hold.swells, started: hold.started, next: hold.next != null ? +(hold.next - hold.t).toFixed(2) : null };
        if (S && SS.S === S && A.phase === 'hold') { o.rings = { L: (() => { const q = ringScr('L'); return [Math.round(q.x), Math.round(q.y)]; })(), R: (() => { const q = ringScr('R'); return [Math.round(q.x), Math.round(q.y)]; })() }; o.ringPx = ringPx(); } }
      if (ak) { o.akko = { phase: ak.phase, tries: ak.tries, th: +(ak.th * 180 / Math.PI).toFixed(1), w: +ak.w.toFixed(3), lift: +ak.lift.toFixed(2), maxSw: +ak.maxSw.toFixed(1), stop: ak.stop, y: +ak.y.toFixed(2), v: +ak.v.toFixed(3), land: ak.land, ringY: +ringY(ak.t).toFixed(3), pts: akkoPts(ak), haulV: +(A.haulV || 0).toFixed(2), easeV: +(A.easeV || 0).toFixed(2) };
        if (S && SS.S === S && E && E.quay.visible) { const h = hookScr(), r = worldScr(ak3.ring), q = haulScr(); o.hook = [Math.round(h.x), Math.round(h.y)]; o.ring = [Math.round(r.x), Math.round(r.y)]; o.haul = [Math.round(q.x), Math.round(q.y)]; o.hookD = +Math.hypot(ak3.hook.x - BOB[0], ak3.hook.y - (S.waterAt(BOB[0], BOB[1]) + ringY(ak.t))).toFixed(2);
          // (the screen px of one amah at the ring: the bot's hand needs it)
          const r2 = worldScr(_a.copy(ak3.ring).add(_b.set(0, 1, 0))); o.pxA = +Math.hypot(r2.x - r.x, r2.y - r.y).toFixed(1); } }
      return o;
    },
    look(dt) { look(dt); },
  };
  return actApi;
}
