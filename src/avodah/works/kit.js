/* ── worksa22 ── kit.js — the prop kit of Phase B's world crafts (WAVE22: the night, the pen, the wood).
 * A work is a small diorama set down beside the אמרכל (the free quarter of the frame, ahead of him in the camera's line), drawn with a
 * handful of instanced meshes — boxes, ellipsoids, cylinders — plus an unlit "glow" set for the marks that must read crisp whatever
 * the light (a flame, the pulse over the next target, a gold ring), a few word sprites (Hebrew labels in the world) and ONE torch light
 * (made at init with intensity 0: a light added mid-game would recompile every material). No image files. Nothing is allocated per frame.
 * Rules kept here: no red material anywhere but the blood's own palette at its places (blood.js: BLOOD, isRed by hue; kit.bloodCheck), no blemish drawn,
 * no Divine Name. Local frame of a stage: a = along his line (away from him), s = to his right, y = up from the ground at the spot.
 *   const kit = createKit({ scene, camera, ground, hero, free })
 *   kit.place(o) → true   sets the stage (o.ahead, o.lat: amot)         kit.begin() / kit.end()  frame bracket (reset → draw → commit)
 *   kit.b(a,s,y,w,d,h,hex,o)  box (w across, d along, h up)   kit.s(a,s,y,rx,ry,rz,hex)  ellipsoid   kit.c(a,s,y,r,h,hex)  cylinder
 *   hex beginning with '!' = unlit (glow)                      kit.label(text,a,s,y,size,o)   kit.torch(a,s,y,k)
 *   kit.world(a,s,y,out) → out {x,y,z}   kit.screen(a,s,y) → {x,y,on} in CSS px
 * ── /worksa22 ── */
import * as THREE from 'three';
import { ANCHORS, placeGround } from './anchors.js';   // ── places24 ──
import { nearDim, claim, reg as reg28, forget as forget28 } from '../../light28.js';   // ── light28 ── ── /light28 ──
const L28K = { cap: 7 }, L28Z = { hMax: 34 };   // ── light28 ── (the kit torch's reach, in stage amot × K) ── /light28 ──

const CAP = { box: 220, sph: 120, cyl: 80, gbox: 120, gsph: 80, gcyl: 72 };   // ── flow31 ── (gcyl 24 → 72: the shift's gold path, ≤ 40 discs) ── /flow31 ──
const unitBox = new THREE.BoxGeometry(1, 1, 1), unitSph = new THREE.SphereGeometry(1, 10, 7), unitCyl = new THREE.CylinderGeometry(1, 1, 1, 9);
// ── blooda25 ── the red test is blood.js's (by hue, 345°–15°, sat > 0.45 — the dark reds too); the palette (BLOOD) and the red line are the only
// reds allowed, and only at their places (kit.bloodCheck): isRed here = a FORBIDDEN red
import { isRed as forbiddenRed, isBloodHex } from './blood.js';
const redHex = (n) => forbiddenRed(n);
export const isRed = (hex) => forbiddenRed(hex);
// ── /blooda25 ──

export function createKit(ctx) {
  const { scene, camera } = ctx;
  const ground = ctx.ground || (() => 0), heroOf = ctx.hero || (() => ({ x: 0, y: 0, z: 0 })), freeAt = ctx.free || (() => true);
  const root = new THREE.Group(); root.name = 'worksa22'; scene.add(root);
  const mk = (geo, lit, n, name) => {
    const m = new THREE.InstancedMesh(geo, lit ? new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.88 }) : new THREE.MeshBasicMaterial({ color: '#FFFFFF', fog: false }), n);
    m.name = name; m.frustumCulled = false; m.visible = false; m.count = 0; m.castShadow = lit; m.receiveShadow = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const c = new THREE.Color(1, 1, 1); for (let i = 0; i < n; i++) m.setColorAt(i, c);
    root.add(m); return m;
  };
  const P = {
    box: mk(unitBox, true, CAP.box, 'w22-box'), sph: mk(unitSph, true, CAP.sph, 'w22-sph'), cyl: mk(unitCyl, true, CAP.cyl, 'w22-cyl'),
    gbox: mk(unitBox, false, CAP.gbox, 'w22-gbox'), gsph: mk(unitSph, false, CAP.gsph, 'w22-gsph'), gcyl: mk(unitCyl, false, CAP.gcyl, 'w22-gcyl'),
  };
  const R27 = [];   // ── slice27 ── ── /slice27 ──
  const N = { box: 0, sph: 0, cyl: 0, gbox: 0, gsph: 0, gcyl: 0 };
  // the torch: one light, intensity 0 until a work asks (made now, at init)
  const light = new THREE.PointLight('#FFC27A', 0, 26, 1.6); light.name = 'w22-torch'; light.visible = true; root.add(light);
  // (and a soft fill over the stage, so the figures read in a dark night: also made now, 0 until a work is on)
  const fill = new THREE.PointLight('#C9D2EC', 0, 30, 1.1); fill.name = 'w22-fill'; fill.visible = true; root.add(fill);
  reg28('kitTorch', light); reg28('kitFill', fill);   // ── light28 ── (tests) ── /light28 ──
  // word sprites
  const sprites = [], texCache = new Map(); let nSpr = 0;
  let lastPlace = null;   // ── polish23 ──
  const F = { on: false, x: 0, y: 0, z: 0, fx: 0, fz: 1, K: 1.5, yaw: 0, Ca: 1, a0: 0 };
  const tmpE = new THREE.Euler(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpC = new THREE.Color();
  const colorCache = new Map();
  const col = (hex) => { let c = colorCache.get(hex); if (!c) { c = new THREE.Color(hex[0] === '!' ? hex.slice(1) : hex); colorCache.set(hex, c); } return c; };

  /** a local point → the world (K-scaled about the stage's origin) */
  function world(a, s, y, out) { const K = F.K; a = F.a0 + (a - F.a0) * F.Ca; out.x = F.x + (F.fx * a - F.fz * s) * K; out.z = F.z + (F.fz * a + F.fx * s) * K; out.y = F.y + y * K; return out; }
  function put(kind, a, s, y, sx, sy, sz, yaw, hex, pitch, roll) {
    const glow = hex.charCodeAt(0) === 33, key = glow ? 'g' + kind : kind, i = N[key];
    if (i >= CAP[key]) return;
    const K = F.K;
    world(a, s, y, tmpV); tmpE.set(pitch || 0, F.yaw + (yaw || 0), roll || 0, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.set(sx * K, sy * K, sz * K); tmpM.compose(tmpV, tmpQ, tmpS);
    P[key].setMatrixAt(i, tmpM); P[key].setColorAt(i, col(hex)); N[key] = i + 1;
    lastPut.key = key; lastPut.i = i;   // ── blooda25 ── (k.tagBlood(tag) names the piece just drawn)
  }
  const lastPut = { key: '', i: -1 }, tags = new Map();   // ── blooda25 ── key+i → 'vessel' | 'horn' | 'yesod' | 'line' | 'amah'
  /** how dark the world is now, 0 (full sun) … 1 (night): from the sun, the sky and the ambient lights (the stage's own lights follow it, so a lit day is not blown out) */
  let darkAt = -1e9, dark = 0.6;
  function darkNow() {
    const t = performance.now(); if (t - darkAt < 1500) return dark; darkAt = t;
    let lum = 0; scene.traverse((o) => { if (!o.isLight || o.parent === root || !o.visible) return; if (o.isDirectionalLight) lum += o.intensity; else if (o.isHemisphereLight) lum += 0.5 * o.intensity; else if (o.isAmbientLight) lum += o.intensity; });
    dark = Math.max(0.1, Math.min(1, 1 - lum / (ctx.litLum || 2.6))); kit.lum = lum; return dark;
  }
  // ── light28 ── the label zone (light28.js): every word sprite drawn this frame is clamped on the screen between the HUD's foot + 8 px and the
  // buttons' top − 8 px, and stacked off the labels before it — moved on the screen only (its depth kept: the same size, the same place in depth)
  const zV = new THREE.Vector3(), zP = new THREE.Vector3();
  function zone28() {
    if (!camera || !camera.isPerspectiveCamera || !nSpr) return;
    const W = globalThis.innerWidth || 844, H = globalThis.innerHeight || 390, th = Math.tan(camera.fov * Math.PI / 360);
    camera.updateMatrixWorld(); zP.setFromMatrixPosition(camera.matrixWorld);
    const fwd = tmpS.set(0, 0, -1).applyQuaternion(camera.quaternion);
    for (let i = 0; i < nSpr; i++) {
      const sp = sprites[i]; if (!sp.visible) continue;
      const depth = zV.copy(sp.position).sub(zP).dot(fwd); if (!(depth > 0.3)) continue;
      zV.copy(sp.position).project(camera);
      const x = (zV.x * 0.5 + 0.5) * W, y = (-zV.y * 0.5 + 0.5) * H, ppu = H / (2 * depth * th);
      // (a word seen from a close camera grew to a third of the frame's height and hid the work: at most L28Z.hMax px tall on the screen)
      if (sp.scale.y * ppu > L28Z.hMax) { const f = L28Z.hMax / (sp.scale.y * ppu); sp.scale.x *= f; sp.scale.y *= f; }
      const w = sp.scale.x * ppu, h = sp.scale.y * ppu;
      if (x + w / 2 < 0 || x - w / 2 > W || y + h / 2 < -H || y - h / 2 > 2 * H) continue;
      const c = claim(x, y, w, h, 'label');
      if (c.moved || Math.abs(c.x - x) > 0.5) { zV.x = (c.x / W) * 2 - 1; zV.y = -((c.y / H) * 2 - 1); zV.unproject(camera); sp.position.copy(zV); }
    }
  }
  // ── /light28 ──
  const kit = {
    F, light, darkNow,
    l28labels: [],   // ── light28 ── ── /light28 ──
    figs: [],   // ── blooda25 ── each frame: [x, y, z, kind] (world) of every figure drawn (figures.js man / lamb)
    /** ── blooda25 ── the piece just drawn is blood of this place (blood.js tagBlood) */
    tagBlood(tag) { if (lastPut.i >= 0) tags.set(lastPut.key + lastPut.i, tag); },
    /** ── blooda25 ── the figure at local (a, s, y) is recorded for the blood check (world) */
    fig(a, s, y, kind) { if (kit.figs.length < 64) { world(a, s, y, tmpV); kit.figs.push([tmpV.x, tmpV.y, tmpV.z, kind || 'man']); } },
    /** ── blooda25 ── tests (DAM25 §4.4): every palette piece drawn now — { n, tags: {tag: n}, untagged, nearFig (a palette piece other than the
     *  vessel's liquid within 1.5 amot of a figure's body), floor (one on the floor, not by the drain), reds (forbidden reds), pts: [[x, y, z, tag]] } */
    bloodCheck() {
      const out = { n: 0, tags: {}, untagged: 0, nearFig: 0, floor: 0, reds: 0, pts: [] }, fy = F.y;
      for (const k in P) {
        const m = P[k];
        for (let i = 0; i < m.count; i++) {
          m.getColorAt(i, tmpC); const hx = tmpC.getHex();
          if (redHex(hx)) { out.reds++; continue; }
          if (!isBloodHex(hx)) continue;
          m.getMatrixAt(i, tmpM); tmpV.setFromMatrixPosition(tmpM);
          const tag = tags.get(k + i) || ''; out.n++; out.tags[tag || '?'] = (out.tags[tag || '?'] | 0) + 1; if (!tag) out.untagged++;
          if (out.pts.length < 40) out.pts.push([+tmpV.x.toFixed(2), +tmpV.y.toFixed(2), +tmpV.z.toFixed(2), tag]);
          if (tag !== 'vessel') for (const f of kit.figs) { const dy = tmpV.y - f[1]; if (Math.hypot(tmpV.x - f[0], tmpV.z - f[2]) < 1.5 && dy > -0.3 && dy < 1.9 * F.K) { out.nearFig++; break; } }
          const gy = F.anchor ? placeGround(tmpV.x, tmpV.z) : ground(tmpV.x, tmpV.z);
          if (tag !== 'yesod' && tag !== 'amah' && tmpV.y - gy < 0.25 && Math.hypot(tmpV.x + 54.6, tmpV.z - 17.2) > 3) out.floor++;
          void fy;
        }
      }
      return out;
    },
    b(a, s, y, w, d, h, hex, o) { put('box', a, s, y, w, h, d, o && o.yaw, hex, o && o.pitch, o && o.roll); },
    s(a, s, y, rx, ry, rz, hex, o) { put('sph', a, s, y, rx, ry, rz, o && o.yaw, hex, o && o.pitch, o && o.roll); },
    /** an upright cylinder (radius r, height h) — or lying: o.pitch = π/2 turns it along the line */
    c(a, s, y, r, h, hex, o) { put('cyl', a, s, y, r, h, r, o && o.yaw, hex, o && o.pitch, o && o.roll); },
    /** a ring on the ground (a circle of small unlit bars — the pulse over the next thing to touch) */
    ring(a, s, y, r, hex = '!#FFD24A', n = 16) {
      if (R27.length < 24) R27.push([a, s, y, r, hex]);   // ── slice27 ── (tests: the rings of this frame — the cue on the thing to touch) ── /slice27 ──
      const len = (2 * Math.PI * r / n) * 0.8;
      for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; put('box', a + Math.cos(t) * r, s + Math.sin(t) * r, y + 0.03, len, 0.07, 0.06, -t, hex); }
    },
    world,
    screen(a, s, y) {
      world(a, s, y, tmpV); if (!camera) return { x: 0, y: 0, on: false };   // (a node test's kit has no camera)
      tmpV.project(camera);
      return { x: Math.round((tmpV.x * 0.5 + 0.5) * (globalThis.innerWidth || 844)), y: Math.round((-tmpV.y * 0.5 + 0.5) * (globalThis.innerHeight || 390)), on: tmpV.z < 1 };
    },
    /** the stage: ahead of him along the camera's line, offset to his side (amot) — the first free of a few tries */
    place(o = {}) {
      lastPlace = o; kit.placedAt = performance.now();   // ── polish23 ──
      // ── places24 ── the stage IS the place: the frame on the real point, the place's own facing, the figures at the אמרכל's height
      F.anchor = null; F.A = null; F.view = null;
      if (o.anchor && ANCHORS[o.anchor]) { kit.anchor(o.anchor, o.K); F.view = F.A.view || null; return true; }
      // ── /places24 ──
      const h = heroOf(), ahead = o.ahead == null ? 2.6 : o.ahead, lat = o.lat || 0;
      let fx, fz;
      if (camera) { tmpV.set(0, 0, -1).applyQuaternion(camera.quaternion); fx = tmpV.x; fz = tmpV.z; }
      else { fx = Math.sin(h.yaw || 0); fz = Math.cos(h.yaw || 0); }
      let l = Math.hypot(fx, fz); if (l < 0.05) { fx = Math.sin(h.yaw || 0); fz = Math.cos(h.yaw || 0); l = 1; } fx /= l; fz /= l;
      // (the first free of a few tries: as asked, then nearer, then the other side — by the walk's own obstacles)
      let ox = 0, oz = 0, got = false; const bd = o.bounds, K = o.K || 1.5;
      for (const [d, k] of [[1, 1], [0.7, 1], [1, -1], [0.5, 0], [0.4, -1]]) {
        const x = h.x + fx * ahead * d + (-fz) * lat * k, z = h.z + fz * ahead * d + fx * lat * k;
        if (!got) { ox = x; oz = z; got = true; }
        // (the footprint: nine samples over the stage's bounds — at most one may be blocked)
        let bad = 0;
        if (bd) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = bd[0] + (bd[1] - bd[0]) * i / 2, s = bd[2] + (bd[3] - bd[2]) * j / 2; if (freeAt(x + (fx * a - fz * s) * K, z + (fz * a + fx * s) * K) === false) bad++; }
        else if (freeAt(x, z) === false) bad = 9;
        if (bad <= 1) { ox = x; oz = z; break; }
      }
      F.fx = fx; F.fz = fz; F.yaw = Math.atan2(fx, fz); F.K = K; F.x = ox; F.z = oz; F.Ca = 1; F.a0 = bd ? bd[0] : 0;
      F.y = ground(F.x, F.z); F.on = true;
      // (the same size on the screen under any camera: the stage's width at its middle depth is set to ~66% of the view, the near edge keeps its distance;
      // then the back of the stage must stay under the HUD: a steep camera squeezes depth, so first the positions along the line are drawn closer
      // (Ca ≥ 0.5; the figures keep their size), and only then is the whole stage made smaller)
      if (bd && camera && !o.fixed) {
        const W = globalThis.innerWidth || 844, H = globalThis.innerHeight || 390, near = ahead + bd[0] * K, mid = (bd[0] + bd[1]) / 2, dx = ox - (h.x + fx * ahead), dz = oz - (h.z + fz * ahead);
        const reset = () => { const ahead2 = near - bd[0] * F.K; F.x = h.x + fx * ahead2 + dx; F.z = h.z + fz * ahead2 + dz; F.y = ground(F.x, F.z); };
        for (let it = 0; it < 2; it++) {
          const p = kit.screen(mid, bd[2], 0), q = kit.screen(mid, bd[3], 0), wpx = Math.abs(q.x - p.x);
          if (!(wpx > 20) || !p.on || !q.on) break;
          F.K = Math.max(K * 0.7, Math.min(K * (o.maxMul || 2.0), F.K * (0.66 * W) / wpx)); reset();   // ── polish23 ── (maxMul: refit)
        }
        for (let it = 0; it < 14; it++) {
          const far = kit.screen(bd[1], 0, o.farH || Math.min(2, bd[4] || 1));
          if (far.on && far.y >= H * (o.topFrac || 0.19)) break;   // ── polish23 ── (refit: the HUD's two rows end at ~15 % — the far props' tops may reach under them)
          if (F.Ca > (o.caMin || 0.5) + 0.02) F.Ca = Math.max(o.caMin || 0.5, F.Ca * 0.9); else F.K *= 0.92;
          reset();
        }
      }
      F.fit = { K: +F.K.toFixed(2), Ca: +F.Ca.toFixed(2) };
      return true;
    },
    /** ── polish23 ── the same stage fitted again under the camera as it is NOW (the day's closer camera has settled and looks at the stage): it may grow to 2.6× its base size, so it fills the frame's width */
    refit(mul = 3) { if (!lastPlace || !F.on || F.anchor) return false;   // ── places24 ── (an anchored stage is the place: nothing to fit)
 return kit.place({ ...lastPlace, maxMul: mul, topFrac: 0.1, caMin: 0.34, farH: 1.1 }); },
    // ── places24 ── the real place in the frame: a world point → local [a, s, y]; the local floor under (a, s); a box / an upright
    // cylinder at a world point with real (amot) sizes; the camera the place asks for (kit.F.view → the day's camWork)
    /** the frame onto another real place mid-work (a work that walks between places: the ketoret from the altar to the golden altar) */
    anchor(id, K) {
      const A = ANCHORS[id]; if (!A) return false; F.anchor = id; F.A = A;
      F.x = A.x; F.z = A.z; F.y = A.y; F.fx = A.face[0]; F.fz = A.face[1]; F.yaw = Math.atan2(F.fx, F.fz); F.K = K || A.K || 2.3; F.Ca = 1; F.a0 = 0; F.on = true;
      F.fit = { anchor: id, K: F.K }; return true;
    },
    loc(x, y, z) { const K = F.K, dx = (x - F.x) / K, dz = (z - F.z) / K; return [F.fx * dx + F.fz * dz, -F.fz * dx + F.fx * dz, (y - F.y) / K]; },
    gy(a, s) { world(a, s, 0, tmpV); return ((F.anchor ? placeGround(tmpV.x, tmpV.z) : ground(tmpV.x, tmpV.z)) - F.y) / F.K; },   // (on a real place: its own floors — the ramp, the steps, the top)
    wb(x, y, z, w, d, h, hex, o) { const p = kit.loc(x, y, z), K = F.K; put('box', p[0], p[1], p[2], w / K, h / K, d / K, o && o.yaw, hex, o && o.pitch, o && o.roll); },
    wc(x, y, z, r, h, hex, o) { const p = kit.loc(x, y, z), K = F.K; put('cyl', p[0], p[1], p[2], r / K, h / K, r / K, o && o.yaw, hex, o && o.pitch, o && o.roll); },
    ws(x, y, z, rx, ry, rz, hex, o) { const p = kit.loc(x, y, z), K = F.K; put('sph', p[0], p[1], p[2], rx / K, ry / K, rz / K, o && o.yaw, hex, o && o.pitch, o && o.roll); },
    view(p, t) { F.view = p ? { p, t } : null; },
    /** tests: every drawn piece's world position (x, y, z) */
    points() { const out = []; for (const k in P) { const m = P[k]; for (let i = 0; i < N[k]; i++) { m.getMatrixAt(i, tmpM); tmpV.setFromMatrixPosition(tmpM); out.push([+tmpV.x.toFixed(2), +tmpV.y.toFixed(2), +tmpV.z.toFixed(2), k]); } } return out; },
    // ── /places24 ──
    /** a frame: reset the counts… */
    begin() { kit.l28labels.length = 0; /* ── light28 ── ── /light28 ── */ N.box = N.sph = N.cyl = N.gbox = N.gsph = N.gcyl = 0; nSpr = 0; R27.length = 0; /* ── slice27 ── ── /slice27 ── */ kit.figs.length = 0; tags.clear(); lastPut.i = -1;   // ── blooda25 ──
 light.intensity = 0; if (F.on) { world(2.5, 0, 6.5, tmpV); fill.position.copy(tmpV); fill.intensity = 38 * F.K * darkNow() * darkNow(); } else fill.intensity = 0; },
    /** …draw (b / s / c / label / torch) … and commit */
    end() {
      for (const k in P) { const m = P[k]; m.count = N[k]; m.visible = N[k] > 0 && F.on; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      for (let i = nSpr; i < sprites.length; i++) sprites[i].visible = false;
      zone28();   // ── light28 ── ── /light28 ──
    },
    torch(a, s, y, k = 1) { world(a, s, y, tmpV); light.position.copy(tmpV); light.intensity = 42 * k * F.K * (0.12 + 0.88 * darkNow() * darkNow());
      // ── light28 ── the torch seen near: × k² by the camera's distance to it (nearDim), its reach capped — never a white wall at 2 amot (shots 1, 2)
      const nd = nearDim(light.position); light.intensity *= nd * nd; light.distance = L28K.cap * F.K; },
      // ── /light28 ──
    /** a word in the world (a Hebrew label on a canvas texture, cached by its text) */
    label(text, a, s, y, size = 1.1, o = {}) {
      if (nSpr >= 24 /* ── fix26 ── (14 → 24: the evarim's names on every piece) ── /fix26 ── */) return; size *= 1.35;
      const key = text + '|' + (o.bg || '') + '|' + (o.fg || '');
      let tex = texCache.get(key);
      if (!tex) {
        const cv = document.createElement('canvas'), g = cv.getContext('2d'); g.font = `700 44px Heebo, "Segoe UI", Arial, sans-serif`;
        const w = Math.ceil(g.measureText(text).width) + 36; cv.width = Math.max(64, w); cv.height = 72;
        g.font = `700 44px Heebo, "Segoe UI", Arial, sans-serif`; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = o.bg || 'rgba(255,248,232,.92)'; const r = 18; g.beginPath(); g.moveTo(r, 4); g.arcTo(cv.width - 4, 4, cv.width - 4, 68, r); g.arcTo(cv.width - 4, 68, 4, 68, r); g.arcTo(4, 68, 4, 4, r); g.arcTo(4, 4, cv.width - 4, 4, r); g.fill();
        g.strokeStyle = 'rgba(120,90,40,.7)'; g.lineWidth = 3; g.stroke();
        g.fillStyle = o.fg || '#3B2A12'; g.fillText(text, cv.width / 2, 38);
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; tex = { t, w: cv.width, h: cv.height }; texCache.set(key, tex);
      }
      let sp = sprites[nSpr];
      if (!sp) { sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.t, transparent: true, depthTest: false, fog: false })); sp.renderOrder = 20; sp.frustumCulled = false; root.add(sp); sprites.push(sp); }
      if (sp.material.map !== tex.t) { sp.material.map = tex.t; sp.material.needsUpdate = true; }
      sp.material.opacity = o.opacity == null ? 1 : o.opacity;
      world(a, s, y, tmpV); sp.position.copy(tmpV); sp.scale.set(size * F.K * tex.w / tex.h, size * F.K, 1); sp.visible = true; nSpr++;
      kit.l28labels[nSpr - 1] = text;   // ── light28 ── (tests: this frame's words) ── /light28 ──
    },
    /** off: the stage is gone */
    clear() { F.on = false; kit.begin(); kit.end(); light.intensity = 0; fill.intensity = 0; forget28(); /* ── light28 ── ── /light28 ── */ },
    /** tests: what is drawn, any red? */
    // ── slice27 ── tests: this frame's rings on the screen (the gold cue rings: hex '!#FFD24A' / '!#FFE9A6')
    rings() { return R27.map((q) => { const c = kit.screen(q[0], q[1], q[2]), e = kit.screen(q[0] + q[3], q[1], q[2]); return { x: Math.round(c.x), y: Math.round(c.y), rpx: Math.round(Math.hypot(e.x - c.x, e.y - c.y)), hex: q[4] }; }); },
    // ── /slice27 ──
    stats() { return { box: N.box, sph: N.sph, cyl: N.cyl, gbox: N.gbox, gsph: N.gsph, gcyl: N.gcyl, sprites: nSpr, light: +light.intensity.toFixed(1) }; },
    reds() {
      let n = 0;
      for (const k in P) { const m = P[k]; for (let i = 0; i < m.count; i++) { m.getColorAt(i, tmpC); if (redHex(tmpC.getHex())) n++; } }
      return n;
    },
    dispose() { scene.remove(root); },
  };
  return kit;
}
