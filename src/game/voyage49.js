/* ── fable32 (build 49) ── voyage49.js — מסע הדלתות של ניקנור (docs/specs/shlav-alef-v2-he.md §11; the source: בבלי יומא לח ע"א), once.
 * "הסיפור של הדלתות": HERE THE PLAYER IS NICANOR — the owner's explicit exception to the one-kohen rule: a wealthy Alexandrian in travelling
 * clothes (a blue tunic, a red cloak, a dark cap, a beard — no priestly garments); the kohen is hidden while it plays and returns after.
 * The world is set aside (its objects hidden, the sky kept) and a sea is laid 400 amot over it: a procedural sea (one shader: four sine
 * swells, their slopes for the light, foam on the crests, the sun's glint), a merchant ship, two bronze doors glinting in the sun.
 * Scenes (each titled, the voyage one 3–5 minutes):
 *   1 harbour — Alexandria, morning, the lighthouse far off (המחשה): the harbour crane lifts the first door aboard (fam42's PULLEY, reused)
 *   2 sea     — open sea; HOLD to walk the deck from the stern to the bow checking the ropes (three ropes); the wind rises
 *   3 storm   — the approved TWO-THUMB exception: LEFT thumb balances the deck (a slide left/right; each wave telegraphed by its swell), RIGHT
 *               thumb holds the second door's ropes (fam42 createStorm49); after the third wave the sailors throw the first door overboard (a
 *               scene, never his fault)
 *   4 hug     — "הטילוני עמה לים": the sailors come for the second door; the right thumb holds ON the door, the left balances, the last
 *               wave; then the sea calms at once
 *   5 acre    — Acre: docking; the first door "מבצבצת ויוצאה מתחת דופני הספינה" — HOLD raises it from the water
 *   6 road    — to Jerusalem: a caravan in the hills at sunset (5 s)
 * No failure: a wave that beats him replays that wave. Grade (the storm): never past the line מהודר; once or twice כשר; more טעון תיקון.
 * Never a Divine Name. */
import * as THREE from 'three';
import * as F from './fam42.js';
import * as TX from '../tex.js';
import * as N96 from './voyage96.js';   // ── build 96 ── (the sea leg, the storm going on, the approach into Acre)
import { rate30 } from '../avodah/shift/rate30.js';

export const Y49 = 400;   // (the sea's level: 400 amot over the hidden world)
export const VOY49 = Object.freeze(['harbour', 'sea', 'storm', 'hug', 'acre', 'road']);
export const VLINE49 = Object.freeze({
  intro: 'הסיפור של הדלתות — הפעם אתם ניקנור · "כשהלך ניקנור להביא דלתות מאלכסנדריא של מצרים" — יומא לח ע"א · טיוטה',
  harbour: 'משכו מטה בקצב, ובין משיכה למשיכה החזיקו רגע · מנוף הנמל; המגדלור — המחשה',
  high: 'גבוה מדי — הרפו, החבל יורד אל החלון · המחשה',
  sea: 'החזיקו — הולכים על הסיפון ובודקים את החבלים · המחשה',
  wind: 'הרוח מתחזקת — עוד חבל · המחשה',
  storm: 'שמאל — מאזנים את הסיפון; ימין — מחזיקים חבלים · "עמד עליו נחשול שבים לטבעו" — יומא לח ע"א · טיוטה',
  ropes: 'ימין — החזיקו את חבלי הדלת! · המחשה',
  heel: 'הגל הפיל — עוד פעם, אותו גל · המחשה',
  thrown: 'המלחים השליכו דלת אחת לים · "נטלו אחת מהן והטילוה לים" — יומא לח ע"א · טיוטה',
  hug: 'הם באים לדלת השנייה — חבקו אותה (ימין) ואזנו · "עמד הוא וכרכה" — יומא לח ע"א · טיוטה',
  hugLost: 'המלחים כמעט לקחו את הדלת — חבקו אותה! · המחשה',
  calm: '"הטילוני עמה" — ומיד נח הים מזעפו · יומא לח ע"א · טיוטה',
  acre: 'החזיקו — הדלת הראשונה מבצבצת מתחת לספינה · "מבצבצת ויוצאה מתחת דופני הספינה" — יומא לח ע"א · טיוטה',
  road: 'אל ירושלים · המחשה',
  back: 'וחוזרים לכהן — הדלתות בשער · טיוטה',
});
/** ── build 96 ── the voyage's new lines (the owner, 4.11 04:47) */
export const VLINE96 = Object.freeze({
  sea: 'גררו לצדדים להגה; גררו את המפרש אל הרוח · המצפן: הזהב — אל עכו · המחשה',
  wind: 'הרוח נטתה — סובבו את המפרש אליה · הדגלון בראש התורן מראה את הרוח · המחשה',
  irons: 'הרוח מלפנים — המפרש לא מושך. סובבו את ההגה · המחשה',
  shoalAhead: 'גלים נשברים לפנים — שרטון. עקפו אותו · המחשה',
  shoal: 'שרטון! הספינה נגררה על החול · המחשה',
  storm: 'שמאל — מעבירים משקל; ימין — חבלי המטען · "עמד עליו נחשול שבים לטבעו" — יומא לח ע"א · טיוטה',
  beat: 'הגל הכה — ארגז נפל לים. ממשיכים! · המחשה',
  slid: 'החבלים התרופפו — ארגז החליק לים · המחשה',
  port: 'נמל עכו — היכנסו בין שני השוברים · המחשה',
  bump: 'פגעתם בשובר — אחורה, ושוב · המחשה',
});
const TITLES = { port: 'אל נמל עכו', harbour: 'נמל אלכסנדריה', sea: 'בלב ים', storm: 'סערה', hug: '"הטילוני עמה"', acre: 'נמל עכו', road: 'אל ירושלים' };

/** a figure (the sailors, Nicanor, the Levites): legs, a body that bows at the waist, arms, a head with a cap; colours per role (c.scale: its size) */
export function figure49(c = {}) {
  const m = (col, r = 0.85) => new THREE.MeshStandardMaterial({ color: col, roughness: r, metalness: 0 });
  const g = new THREE.Group(), top = new THREE.Group(); top.position.y = 1.5; g.add(top);
  const tunic = m(c.tunic || '#C9B48A'), skin = m(c.skin || '#C08A62'), cap = m(c.cap || '#5A4632');
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.5, 10), tunic); legs.position.y = 0.75; g.add(legs);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.33, 1.1, 10), tunic); body.position.y = 0.55; top.add(body);
  if (c.belt) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.13, 10), m(c.belt)); b.position.y = 0.1; top.add(b); }
  if (c.cloak) { const ck = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.5, 1.9, 12, 1, true, Math.PI * 0.55, Math.PI * 0.9), m(c.cloak, 0.95)); ck.material.side = THREE.DoubleSide; ck.position.y = 0.1; top.add(ck); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10), skin); head.position.y = 1.3; top.add(head);
  if (c.beard) { const bd = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), m(c.beard)); bd.scale.set(1, 1.2, 0.8); bd.position.set(0, 1.17, 0.12); top.add(bd); }
  const hat = new THREE.Mesh(c.round ? new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2) : new THREE.CylinderGeometry(0.2, 0.25, 0.18, 12), cap); hat.position.y = c.round ? 1.36 : 1.5; top.add(hat);
  const arms = [-1, 1].map((sx) => { const a = new THREE.Group(); a.position.set(sx * 0.36, 1.0, 0); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.9, 8), tunic); s.position.y = -0.45; a.add(s); const h = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), skin); h.position.y = -0.92; a.add(h); top.add(a); return a; });
  g.scale.setScalar(c.scale || 1.35); g.userData = { top, arms };   // (≈ 4 amot: a man beside a 24-amah ship)
  return g;
}
export const NICANOR49 = Object.freeze({ tunic: '#2E4E86', cloak: '#8C2E26', cap: '#3A2A1E', beard: '#2A1C12', belt: '#C9A24A', round: true, skin: '#B98660' });

/* the sea: one plane per ring (near: fine; far: coarse), the same four swells in the shader and in waveH (the ship's bob) */
const SW = [[0.11, 0.06, 1.0, 0.6], [0.17, -0.1, 1.5, 0.35], [0.29, 0.21, 2.2, 0.18], [0.05, 0.02, 0.6, 0.55]];
export function waveH(x, z, t, A) { let h = 0; for (const [kx, kz, w, a] of SW) h += a * Math.sin(kx * x + kz * z + w * t); return h * A; }
function seaMaterial(U) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uA: { value: 0.5 }, uOff: { value: 0 }, uOffZ: { value: 0 }, uSun: { value: new THREE.Vector3(0.4, 0.5, 0.3).normalize() }, uDeep: { value: new THREE.Color('#1D4A63') }, uCrest: { value: new THREE.Color('#5DA2B7') }, uSky: { value: new THREE.Color('#BCD6E2') }, uFar: { value: 0 }, uR: { value: 160 } }]),
    vertexShader: `uniform float uT, uA, uOff, uOffZ, uFar, uR; varying vec3 vW; varying vec3 vN; varying float vH;
      #include <fog_pars_vertex>
      float sw(vec2 k, float w, float a, vec2 p, out vec2 g) { float ph = dot(k, p) + w * uT; g = a * cos(ph) * k; return a * sin(ph); }
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0); vec2 p = wp.xz + vec2(uOff, uOffZ); float r = length(wp.xz);
        float att = uFar > 0.5 ? smoothstep(150.0, 260.0, r) * 0.6 : 1.0 - smoothstep(uR * 0.8, uR, r);
        vec2 g = vec2(0.0), gi; float h = 0.0;
        h += sw(vec2(0.11, 0.06), 1.0, 0.6, p, gi); g += gi; h += sw(vec2(0.17, -0.1), 1.5, 0.35, p, gi); g += gi;
        h += sw(vec2(0.29, 0.21), 2.2, 0.18, p, gi); g += gi; h += sw(vec2(0.05, 0.02), 0.6, 0.55, p, gi); g += gi;
        h *= uA * att; g *= uA * att; wp.y += h; if (uFar > 0.5 && r < 140.0) wp.y -= 8.0;
        vH = h / max(uA, 0.05); vW = wp.xyz; vN = normalize(vec3(-g.x, 1.0, -g.y));
        vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform vec3 uSun, uDeep, uCrest, uSky; uniform float uA, uT, uOff, uOffZ; varying vec3 vW; varying vec3 vN; varying float vH;
      #include <fog_pars_fragment>
      float hs(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 q) { vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f); return mix(mix(hs(i), hs(i + vec2(1.0, 0.0)), f.x), mix(hs(i + vec2(0.0, 1.0)), hs(i + vec2(1.0, 1.0)), f.x), f.y); }
      void main() {   // ── build 96 ── (the owner: "the sea does not look good": ripples on the swells, the sky in them by Fresnel, the sun's glitter, foam broken by noise)
        vec3 V = normalize(cameraPosition - vW); float dist = length(cameraPosition - vW);
        vec2 q = vW.xz + vec2(uOff, uOffZ); float nr = 1.0 - smoothstep(40.0, 280.0, dist);
        vec2 rp = vec2(cos(q.x * 0.83 + q.y * 0.31 + uT * 1.9), cos(q.y * 0.77 - q.x * 0.22 + uT * 1.6)) * 0.10;
        rp += vec2(cos(q.x * 1.9 - q.y * 1.1 + uT * 2.7), cos(q.y * 2.3 + q.x * 0.9 - uT * 2.2)) * 0.06;
        rp += vec2(cos(q.x * 4.1 + q.y * 3.3 + uT * 3.9), cos(q.y * 3.7 - q.x * 2.9 + uT * 3.4)) * 0.035 * nr;
        vec3 N = normalize(vN + vec3(rp.x, 0.0, rp.y) * (0.35 + 0.65 * nr));
        float fr = 0.03 + 0.97 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 c = mix(uDeep, uCrest, clamp(0.4 + 0.42 * vH + 0.5 * (dot(N, uSun) - 0.55), 0.0, 1.0));
        c = mix(c, uSky * 1.05, clamp(fr * 1.15, 0.0, 0.8));
        vec3 Hh = normalize(uSun + V); float nh = max(dot(N, Hh), 0.0);
        c += vec3(1.0, 0.95, 0.82) * (pow(nh, 260.0) * 2.2 + pow(nh, 36.0) * 0.14);
        float fn = vn(q * 0.35 + vec2(uT * 0.2, 0.0)) * 0.6 + vn(q * 1.3 - vec2(0.0, uT * 0.3)) * 0.4;
        float foam = smoothstep(0.7, 1.15, vH + (fn - 0.5) * 0.6) * clamp(uA * 0.6, 0.0, 1.0);
        c = mix(c, vec3(0.93, 0.96, 0.97), foam * 0.85);
        c *= 0.82 + 0.26 * max(dot(N, uSun), 0.0);
        gl_FragColor = vec4(c, 1.0);
        #include <fog_fragment>
      }`,
    fog: true,
  });
}

/**
 * createVoyage49(ctx): ctx = { scene, camTo(p, t, k), line(t, sub), root (the UI root), doc, W(), H(), buzz(k), sound(k), emit(t, d),
 * timeOfDay(k), stages, L (the lift level), seen (it was seen once: a skip), done({ q, rating, crossings, replays, skipped }) } → a job
 */
export function createVoyage49(ctx) {
  const { scene, doc } = ctx, W = ctx.W, H = ctx.H, now = () => performance.now() / 1000;
  const G = new THREE.Group(); G.name = 'voyage49'; G.position.y = Y49; scene.add(G);
  // the world set aside (the sky and the lights kept): restored at the end
  const hidden = []; for (const c of scene.children) if (c !== G && c.visible && !c.isLight && c.name !== 'sky' && !(c.type === 'Object3D' && !c.children.length)) { hidden.push(c); c.visible = false; }
  try { if (ctx.stages && ctx.stages.hero) ctx.stages.hero.show(false); } catch (e) { /* */ }   // (the kohen hidden: Nicanor plays here)
  const fog0 = scene.fog ? { n: scene.fog.near, f: scene.fog.far, c: scene.fog.color.clone() } : null;
  const mat = (c, r = 0.85, mt = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mt });
  const add = (o, x, y, z, par = G) => { o.position.set(x, y, z); par.add(o); return o; };
  // the sea
  const near = new THREE.Mesh(new THREE.PlaneGeometry(320, 320, 128, 128).rotateX(-Math.PI / 2), seaMaterial()); G.add(near);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000, 48, 48).rotateX(-Math.PI / 2), seaMaterial()); far.material.uniforms.uFar.value = 1; far.position.y = -0.4; G.add(far);
  const seas = [near.material, far.material];
  const seaU = (k, v) => seas.forEach((m) => { if (m.uniforms[k].value && m.uniforms[k].value.copy) m.uniforms[k].value.copy(v); else m.uniforms[k].value = v; });
  // the ship: a hull, its deck, the stern's raised deck, the bow, a mast, the yard and a square sail, the rails; the sailors
  const ship = new THREE.Group(); G.add(ship); const deckY = 2.6;
  const WD = ctx.wood || null, wood = WD ? WD('a', '#C9A27A') : mat('#7A5434', 0.85), dk = WD ? WD('b', '#B89A7A') : mat('#4E3420', 0.9), plank = WD ? WD('a', '#F4E6D2') : mat('#A27A50', 0.85);   // ── build 95 ── (the kit's wood, its grain along the planks: the voyage was flat colour)
  const longX = (w, h, d) => (ctx.grain ? ctx.grain(new THREE.BoxGeometry(h, w, d), w).rotateZ(Math.PI / 2) : new THREE.BoxGeometry(w, h, d));
  add(new THREE.Mesh(longX(24, 3.2, 7.2), wood), 0, 1, 0, ship);
  add(new THREE.Mesh(longX(24, 0.3, 6.8), plank), 0, deckY, 0, ship);
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 3.6, 7, 4, 1), wood); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 4; bow.scale.z = 0.7; add(bow, 15.2, 1.2, 0, ship);
  add(new THREE.Mesh(new THREE.BoxGeometry(5, 1.6, 6.8), wood), -10, deckY + 0.9, 0, ship);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 5, 8), dk); post.rotation.z = 0.5; add(post, -13.6, 4, 0, ship);
  for (const sz of [-1, 1]) add(new THREE.Mesh(longX(22, 0.9, 0.25), dk), 0.5, deckY + 0.6, sz * 3.4, ship);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 15, 10), dk), 2, deckY + 7.5, 0, ship);
  const rig = new THREE.Group(); rig.position.set(2, 0, 0); ship.add(rig);   // ── build 96 ── (the yard and the sail on the mast, braced round to the wind)
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 11, 8), dk), 0, deckY + 13.6, 0, rig).rotation.x = Math.PI / 2;
  const sailC = doc ? (() => { try { const cv = doc.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#E8DCC0'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#B34A32'; for (let i = 0; i < 4; i++) c.fillRect(i * 32 + 12, 0, 8, 128); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; } catch (e) { return null; } })() : null;
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(10, 8.5, 8, 6), new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: sailC, side: THREE.DoubleSide, roughness: 0.9 })); sail.rotation.y = Math.PI / 2; add(sail, 0.25, deckY + 9.2, 0, rig);
  const sail0 = sail.geometry.attributes.position.array.slice();
  // the doors: bronze, glinting
  const bronze = new THREE.MeshStandardMaterial({ color: '#D9A35C', metalness: 0.45, roughness: 0.3, emissive: new THREE.Color('#6A4218'), emissiveIntensity: 0.55 });   // (bright: with no environment a metal reads dark)
  const door = (x, z) => { const d = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 4.9), bronze); d.add(b); for (let i = 1; i < 4; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.42, 4.6), mat('#B98242', 0.35, 0.6)); r.position.x = -4.5 + i * 2.25; d.add(r); } return add(d, x, deckY + 0.35, z, ship); };
  const door1 = door(-2.5, 1.6), door2 = door(7, -1.4); door1.visible = false;
  let glow = null; try { glow = TX.texGlow(); } catch (e) { glow = null; }
  const glints = [door1, door2].map((d) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#FFF1C8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(4.2, 4.2, 1); s.position.set(1.5, 1.2, 0.8); d.add(s); return s; });   // ── build 95 ── (7 blinded the deck at sea)   // (the sun's glint on the bronze)
  const ropesM = new THREE.LineBasicMaterial({ color: '#D9C9A0' });
  const ropeLine = (pts) => { const g2 = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))); return new THREE.LineSegments(g2, ropesM); };
  ship.add(ropeLine([[2, deckY + 15, 0], [13, deckY + 0.6, 0], [2, deckY + 15, 0], [-11, deckY + 2, 0], [2, deckY + 14, 0], [2, deckY + 0.6, 3.3], [2, deckY + 14, 0], [2, deckY + 0.6, -3.3]]));
  const knots = [[-6, -2.6], [2.5, 2.6], [10, -2.6]].map(([x, z]) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), mat('#D9C9A0')); return add(k, x, deckY + 0.5, z, ship); });
  const sailors = [0, 1, 2, 3].map((i) => { const f = figure49({ tunic: ['#C9B48A', '#A88F68', '#B9A27A', '#8E7A5A'][i], cap: '#6A5238' }); return add(f, [-6.8, 11, -4, 12][i], deckY + 0.15, [2, -2.2, -2.5, 2.4][i], ship); });
  const nic = add(figure49(NICANOR49), -9.5, deckY + 1.85, -1, ship); nic.rotation.y = Math.PI / 2;
  /* ── build 95 ── the voyage's people are people88's (the owner, 3.11, on build 76: "שוב גלילים"): each stands on figure49's place
   * (kept, unseen, as its anchor), with its own walk, push, kneel; Nicanor in a blue tunic and a red head cloth, a dark beard (המחשה) */
  const cast = { on: false, sail: [], nic: null };
  /* ── build 96 ── the ship's working parts and the sea's marks (the owner, 4.11: the thumbs did nothing seen on the ship; the cargo was never
   * seen falling): the crates on the deck, lashed (the right thumb's ropes); the pennant at the masthead (the wind); the shoal's breakers;
   * Acre's two moles */
  const ON96 = ctx.v96 !== false;
  if (ON96) knots.forEach((kn) => { kn.visible = false; });   // (the old rope-check knots: the sea leg is the helm and the sail now)
  const crateM = WD ? WD('a', '#E2C49C') : mat('#9A7148', 0.85);
  const CR96 = [[-4.8, -2.3, 0], [-3.1, -2.3, 0], [-1.4, -2.3, 0], [10.2, 2.3, 0], [11.9, 2.3, 0], [10.2, 2.3, 1]];
  const crates = ON96 ? CR96.map(([x, z, up]) => { const c = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.5), crateM); c.castShadow = true; add(c, x, deckY + 0.85 + up * 1.4, z, ship); c.userData = { x, z, y: deckY + 0.85 + up * 1.4, gone: false, fall: -1, side: 1 }; return c; }) : [];
  const lashM = new THREE.LineBasicMaterial({ color: '#7A6A4A' });
  const lash = ON96 ? (() => { const pts = []; for (const [x, z] of [[-4.8, -2.3], [-3.1, -2.3], [-1.4, -2.3], [10.2, 2.3], [11.9, 2.3]]) { const sz = Math.sign(z); pts.push(new THREE.Vector3(x, deckY + 1.62, z), new THREE.Vector3(x, deckY + 0.75, z + sz * 1.05), new THREE.Vector3(x, deckY + 1.62, z), new THREE.Vector3(x, deckY + 0.75, z - sz * 1.0)); } const l = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lashM); ship.add(l); return l; })() : null;
  const penG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(3.4, 0, 0)]); penG.computeVertexNormals();
  const pennant = add(new THREE.Mesh(penG, new THREE.MeshStandardMaterial({ color: '#C8352A', side: THREE.DoubleSide, roughness: 0.8 })), 2, deckY + 15.4, 0, ship); pennant.visible = ON96;
  const shoalG = new THREE.Group(); shoalG.visible = false; G.add(shoalG);
  add(new THREE.Mesh(new THREE.CircleGeometry(52, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#8FC6B6', transparent: true, opacity: 0.45, depthWrite: false })), 0, 0.25, 0, shoalG);   // (the shallows, pale over the sand)
  for (let j = 0; j < 11; j++) { const a = j * 0.83, r = 8 + (j % 4) * 11; const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 + (j % 3) * 0.9), mat(['#4A4038', '#5A5046'][j % 2], 0.95)); rk.rotation.set(j, j * 2, 0); add(rk, Math.cos(a) * r, -0.3, Math.sin(a) * r, shoalG); }
  const foams = [0, 1, 2].map((j) => add(new THREE.Mesh(new THREE.RingGeometry(16 + j * 13, 21 + j * 13, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#F4F8F9', transparent: true, opacity: 0.8, depthWrite: false })), 0, 0.6, 0, shoalG));
  const moles = new THREE.Group(); moles.visible = false; G.add(moles);
  const moleM = mat('#CDBFA0', 0.9), moleS = [-1, 1].map((sg) => { const m2 = new THREE.Group(); add(new THREE.Mesh(new THREE.BoxGeometry(12, 6, 120), moleM), 0, 0.8, sg * 60, m2); const tw = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3, 12, 12), mat('#E2D6BC', 0.85)); add(tw, 0, 6, 0, m2); m2.userData.tw = tw; return add(m2, 0, 0, 0, moles); });
  function cast95(dt) {
    if (!cast.on) { const F2 = ctx.figs ? ctx.figs() : null; if (!F2) { if (V.fly > 12 && !cast.warned) { cast.warned = 1; try { console.error('[voyage] the people did not load: the cylinders stay (build 96)'); } catch (e) { /* */ } } return; } const mk = (o) => { const f = F2.make(o); if (f) ship.add(f.root); return f; };
      cast.sail = ['#C9B48A', '#A88F68', '#B9A27A', '#8E7A5A'].map((c, i) => mk({ tunic: c, cloth: ['#E6DCC8', '#6F5B44', '#D9CBB0', '#8A6A48'][i] })); cast.nic = mk({ tunic: '#2E4E86', cloth: '#8C2E26', beardColor: '#2A1C12' });
      if (!cast.nic || cast.sail.some((f) => !f)) return; cast.on = true; sailors.forEach((a) => { a.visible = false; }); nic.visible = false; }
    const put = (f, a, clip, rate = 1) => { f.root.position.copy(a.position); f.root.rotation.y = a.rotation.y; f.play(clip, rate); f.update(dt); };
    const s = V.scene, st = V.S ? V.S.state() : null;
    if (ON96) {   // ── build 96 ── (the clips follow his hands: the helm, the sheet, the crew shifting their weight, the haul on the lashings)
      const nav = s === 'sea' || s === 'port', moving = T.left && Math.abs(V.bv || 0) > 0.6;
      put(cast.nic, nic, nav ? (V.steer ? 'Push_Loop' : 'Idle') : st && st.hug ? (T.right ? 'Fixing_Kneeling' : 'Idle') : (s === 'storm' || s === 'hug') ? (moving ? 'Walking_A' : 'Idle') : 'Idle');
      cast.sail.forEach((f, i) => put(f, sailors[i], st && st.ph === 'throw' && (i === 0 || i === 2) ? 'Push_Loop' : st && st.hug && (i === 1 || i === 3) && st.ph === 'push' && st.slackT > 0.2 ? 'Walking_A'
        : nav ? (V.trim && (i === 1 || i === 3) ? 'Push_Loop' : 'Idle') : (s === 'storm' || s === 'hug') ? (T.right && (i === 1 || i === 3) ? 'Push_Loop' : moving ? 'Walking_A' : 'Idle') : 'Idle'));
      return;
    }
    put(cast.nic, nic, s === 'sea' ? (T.one ? 'Walking_A' : 'Idle') : (s === 'storm' || s === 'hug') && st && st.hug ? (T.right ? 'Fixing_Kneeling' : 'Idle') : s === 'storm' ? (T.left ? 'Push_Loop' : 'Idle') : 'Idle');
    cast.sail.forEach((f, i) => put(f, sailors[i], st && st.ph === 'throw' && (i === 0 || i === 2) ? 'Push_Loop' : st && st.hug && (i === 1 || i === 3) && st.ph === 'push' ? 'Walking_A' : 'Idle'));
  }
  // the places: Alexandria's quay and lighthouse, the harbour crane; Acre's quay; the hills and the caravan (each shown in its scene)
  const harbour = new THREE.Group(); G.add(harbour);
  const stone = mat('#D9CDB4', 0.9);
  add(new THREE.Mesh(new THREE.BoxGeometry(90, 4, 14), stone), 0, 1.2, 12, harbour);
  for (let i = 0; i < 6; i++) add(new THREE.Mesh(new THREE.BoxGeometry(8 + (i % 3) * 3, 6 + (i % 2) * 5, 8), mat(['#E4D8BE', '#D6C7A8', '#EADFC8'][i % 3], 0.9)), -40 + i * 15, 5, 26 + (i % 2) * 6, harbour);
  const lh = new THREE.Group(); [[16, 40, 14], [11, 36, 11], [7, 24, 7]].reduce((y, [w, h, d2]) => { add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d2), mat('#EDE4D0', 0.85)), 0, y + h / 2, 0, lh); return y + h; }, 0);
  const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#FFB24A', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fire.scale.set(26, 26, 1); add(fire, 0, 104, 0, lh);
  add(lh, -170, 0, 190, harbour);   // (Pharos — far off beyond the quay; המחשה)
  const crane = new THREE.Group(); for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.4, 16, 0.4), dk); l.position.set(sx * 1.6, 8, 0); l.rotation.z = -sx * 0.12; crane.add(l); } const jib = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 12), dk); jib.position.set(0, 15.6, -5); crane.add(jib); add(crane, -2.5, 3.2, 10, harbour);
  const cRope = add(ropeLine([[-2.5, 18.8, 4], [-2.5, 5, 4]]), 0, 0, 0, harbour);
  const acre = new THREE.Group(); acre.visible = false; G.add(acre);
  add(new THREE.Mesh(new THREE.BoxGeometry(80, 4, 12), mat('#CDBF9F', 0.9)), 0, 1.2, -12, acre);
  for (let i = 0; i < 5; i++) add(new THREE.Mesh(new THREE.BoxGeometry(10, 5 + (i % 3) * 3, 8), mat(['#D8CBAE', '#C9BA98'][i % 2], 0.9)), -30 + i * 14, 4, -24, acre);
  for (let i = 0; i < 4; i++) { const hm = new THREE.Mesh(new THREE.SphereGeometry(60 + i * 15, 18, 10), mat(['#A99B6E', '#8E8A5C'][i % 2], 0.95)); hm.scale.y = 0.28; add(hm, -120 + i * 80, -4, -150 - (i % 2) * 40, acre); }
  const road = new THREE.Group(); road.visible = false; G.add(road);
  for (let i = 0; i < 7; i++) { const hm = new THREE.Mesh(new THREE.SphereGeometry(70 + (i % 3) * 25, 18, 10), mat(['#B9A776', '#9E9468', '#C2AE7A'][i % 3], 0.95)); hm.scale.y = 0.32; add(hm, -260 + i * 90, -10 - (i % 2) * 6, -60 - (i % 3) * 70, road); }
  add(new THREE.Mesh(new THREE.BoxGeometry(600, 0.6, 400), mat('#CDB98A', 0.95)), 0, -0.4, 0, road); add(new THREE.Mesh(new THREE.BoxGeometry(600, 0.62, 7), mat('#E2D3A8', 0.95)), 0, -0.38, 6, road);   // (the hills' ground and the road)
  const carts = [0, 1, 2, 3].map((i) => { const c2 = new THREE.Group(); const bed = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 2.6), wood); bed.position.y = 1.4; c2.add(bed); for (const wx of [-1.8, 1.8]) for (const wz of [-1.4, 1.4]) { const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.25, 12), dk); w2.rotation.x = Math.PI / 2; w2.position.set(wx, 0.75, wz); c2.add(w2); } const ox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.1), mat('#6E5A44', 0.9)); ox.position.set(4.4, 1.1, 0); c2.add(ox); if (i < 2) { const d = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 2.4), bronze); d.position.y = 2.05; c2.add(d); } return add(c2, -40 - i * 9, 0, 6, road); });
  // the UI: titles, the heel gauge, the swell's warning, the thumbs' rings
  const ui = doc ? doc.createElement('div') : null;
  if (ui) { ui.className = 'v49'; ui.setAttribute('style', 'position:fixed;inset:0;z-index:45;touch-action:none;pointer-events:auto'); ctx.root.appendChild(ui); }
  const svg = doc ? doc.createElementNS('http://www.w3.org/2000/svg', 'svg') : null;
  if (svg) { svg.setAttribute('style', 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;overflow:visible'); ui.appendChild(svg); }
  const title = doc ? doc.createElement('div') : null;
  if (title) { title.setAttribute('style', 'position:fixed;left:50%;top:34%;transform:translate(-50%,-50%);font:900 30px/1.2 Heebo,system-ui,sans-serif;color:#FFF4DC;text-shadow:0 2px 10px rgba(0,0,0,.75);pointer-events:none;opacity:0;transition:opacity .5s;white-space:nowrap'); ui.appendChild(title); }
  let skipB = null;
  if (ctx.seen && doc) { skipB = doc.createElement('button'); skipB.className = 'h42-skip'; skipB.type = 'button'; skipB.textContent = 'דלגו'; skipB.addEventListener('pointerdown', (e) => { e.stopPropagation(); V.skipped = true; }); ctx.root.appendChild(skipB); }
  const showTitle = (t) => { if (!title) return; title.textContent = t; title.style.opacity = '1'; setTimeout(() => { if (title) title.style.opacity = '0'; }, 2600); };
  // the touches: one finger (the crane, the walk, Acre) — or two thumbs in the storm: the left half balances, the right half holds
  const T = { one: null, left: null, right: null };
  const V = { scene: 'harbour', t: 0, sub: 0, skipped: false, L: Math.max(1, ctx.L || 1), P: null, S: null, walk: 0, knotsOk: 0, acreY: 0, carT: 0, q: null, ended: false, fly: 0, qs: {}, prog: 0, lat: 0 };
  V.lv = Math.max(0, Math.min(2, V.L - 1)); ship.rotation.order = 'YXZ';   // ── build 96 ── (the level: 0…2; the ship turns on the sea, then heels about her keel)
  if (ui) {
    ui.addEventListener('pointerdown', (e) => { e.preventDefault(); try { ui.setPointerCapture(e.pointerId); } catch (er) { /* */ } const p = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: now(), still: now() };
      if (V.scene === 'storm' || V.scene === 'hug') { if (e.clientX < W() / 2) T.left = p; else T.right = p; } else T.one = p; onDown(p); });
    ui.addEventListener('pointermove', (e) => { for (const k of ['one', 'left', 'right']) { const p = T[k]; if (p && p.id === e.pointerId) { if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 4) p.still = now(); const dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; if (k === 'one') onMove(p, dy); } } });
    const upF = (e) => { for (const k of ['one', 'left', 'right']) { const p = T[k]; if (p && p.id === e.pointerId) { T[k] = null; if (k === 'one') onUp(p); } } };
    for (const tp of ['pointerup', 'pointercancel', 'lostpointercapture']) ui.addEventListener(tp, upF);
  }
  function onDown(p) {
    if (V.scene === 'harbour' && V.P) V.P.grab();
    if (ON96 && V.N && p) {   // ── build 96 ── (on the sail: the brace; anywhere else on the sea: the helm)
      p.mode = 'helm'; p.b0 = V.N.state().brace;
      try {
        const c = new THREE.Vector3(), e = new THREE.Vector3(); sail.getWorldPosition(c); rig.localToWorld(e.set(0, deckY + 13.6, 5.5));
        const pc = ctx.proj ? ctx.proj(c.x, c.y, c.z) : null, pe = ctx.proj ? ctx.proj(e.x, e.y, e.z) : null;
        if (pc && pe) { if (Math.hypot(p.x - pc.x, p.y - pc.y) < Math.max(60, Math.hypot(pe.x - pc.x, pe.y - pc.y) * 1.1)) p.mode = 'sail'; }
        else if (p.y < H() * 0.45) p.mode = 'sail';
      } catch (er) { if (p.y < H() * 0.45) p.mode = 'sail'; }
    }
  }
  function onMove(p, dy) { if (V.scene === 'harbour' && V.P && dy > 0) V.P.pull(dy); }
  function onUp() { if (V.scene === 'harbour' && V.P) V.P.release(); }
  // the scenes
  const setSea = (A, deep, crest, sky) => { seas.forEach((m) => { m.uniforms.uA.value = A; if (deep) m.uniforms.uDeep.value.set(deep); if (crest) m.uniforms.uCrest.value.set(crest); if (sky) m.uniforms.uSky.value.set(sky); }); };
  const fogTo = (n, f, c) => { if (!scene.fog) return; scene.fog.near = n; scene.fog.far = f; if (c) scene.fog.color.set(c); };
  function begin(s) {
    { const lying = s === 'sea' || s === 'storm' || s === 'hug'; bronze.emissiveIntensity = lying ? 0.12 : 0.55; bronze.roughness = lying ? 0.65 : 0.3; }   // ── build 95 ── (lying flat under the high sun the bronze blew out white on the deck)
    V.scene = s; V.t = 0; V.sub = 0; V.cp = null; V.ct = null; showTitle(TITLES[s] || ''); ctx.emit && ctx.emit('h49scene', { s });   // (a cut between scenes)
    if (s === 'harbour') { try { ctx.timeOfDay && ctx.timeOfDay('dawn'); } catch (e) { /* */ } V.P = F.createPulley(V.L); setSea(0.35, '#163C55', '#3D86A0', '#A6C6D8'); fogTo(300, 5000); door1.visible = true; door1.position.set(-2.5, 3.45, 9); ctx.line(VLINE49.harbour, `רמה ${V.L}`); }
    if (s === 'sea' && ON96) { harbour.visible = false; V.P = null; V.N = N96.createNav96(V.lv); setSea(0.6); fogTo(400, 6000); try { ctx.timeOfDay && ctx.timeOfDay('noon'); } catch (e) { /* */ } ctx.line(VLINE96.sea); }   // ── build 96 ──
    else if (s === 'sea') { harbour.visible = false; V.P = null; V.walk = 0; setSea(0.55); ctx.line(VLINE49.sea); }
    if (s === 'storm') { try { ctx.timeOfDay && ctx.timeOfDay('dusk'); } catch (e) { /* */ } V.S = ON96 ? N96.createStorm96(V.lv) : F.createStorm49(V.L); if (ON96) { ship.rotation.y = 0; shoalG.visible = false; V.N = null; } setSea(2.2, '#22343E', '#52707A', '#7E8E96'); fogTo(60, 700, '#6E7A80'); ctx.line(ON96 ? VLINE96.storm : VLINE49.storm, `רמה ${V.L}`); ctx.sound && ctx.sound('rope'); }
    if (s === 'port') {   // ── build 96 ── the approach: Acre's moles ahead, the mouth between them; the same helm and sail
      V.N = N96.createNav96(V.lv, { leg: 320, shoal: null, winds: [{ at: 0, from: 255 }], port: { gap: [24, 17, 12][V.lv] }, v0: 9 }); moles.visible = true; acre.visible = true; harbour.visible = false; acre.rotation.y = -Math.PI / 2;
      setSea(0.35, '#163C55', '#3D86A0', '#A6C6D8'); fogTo(400, 6000); ctx.line(VLINE96.port, `רמה ${V.L}`);
    }
    if (s === 'acre' && ON96) { ship.rotation.y = 0; moles.visible = false; acre.rotation.y = 0; acre.position.set(0, 0, 0); V.N = null; }
    if (s === 'acre') { V.acreY = 0; acre.visible = true; door1.visible = true; door1.parent && door1.parent.remove(door1); G.add(door1); door1.position.set(-4, -6, 4.3); door1.rotation.set(Math.PI / 2 - 0.25, 0, 0); setSea(0.3, '#163C55', '#3D86A0', '#A6C6D8'); fogTo(300, 5000); try { ctx.timeOfDay && ctx.timeOfDay('noon'); } catch (e) { /* */ } ctx.line(VLINE49.acre); }
    if (s === 'road') { acre.visible = false; near.visible = false; far.visible = false; ship.visible = false; door1.visible = false; road.visible = true; V.carT = 0; try { ctx.timeOfDay && ctx.timeOfDay('golden'); } catch (e) { /* */ } ctx.line(VLINE49.road); }
  }
  const camK = (p, t) => { V.cp = V.cp ? V.cp.map((v, i) => v + (p[i] - v) * 0.08) : p.slice(); V.ct = V.ct ? V.ct.map((v, i) => v + (t[i] - v) * 0.08) : t.slice(); ctx.camTo([V.cp[0], V.cp[1] + Y49, V.cp[2]], [V.ct[0], V.ct[1] + Y49, V.ct[2]], 1); };   // (the voyage's own coordinates: G's, 400 amot up)
  /* ── build 96 ── the sea leg and the approach: his hands on the helm and the sail, the ship turning on the sea, the shoal, the moles */
  const far96 = () => Math.max(1, Math.min(1.9, 0.8 * H() / Math.max(1, W())));   // (a tall phone screen: stand further off, the ship whole)
  const shipPt = (x, y, z) => { const a = ship.rotation.y, c = Math.cos(a), sn = Math.sin(a); return [x * c + z * sn, y, -x * sn + z * c]; };
  function navFrame(dt, t, s) {
    const N = V.N, k = N.state(); V.steer = false; V.trim = false;
    if (T.one) { const p = T.one; if (p.mode === 'sail') { V.trim = true; N.braceTo(p.b0 + ((p.x - p.x0) / Math.max(240, W())) * 170); } else { V.steer = true; N.helm((p.x - p.x0) / (W() * 0.2)); } } else N.helm(0);
    const ev = N.step(dt);
    if (ev === 'wind') { ctx.line(VLINE96.wind); ctx.sound && ctx.sound('rope'); ctx.buzz('tick'); }
    if (ev === 'shoal') { ctx.line(VLINE96.shoal); ctx.sound && ctx.sound('thud'); ctx.buzz('retry'); V.shake = 1; }
    if (ev === 'bump') { ctx.line(VLINE96.bump, `רמה ${V.L}`); ctx.sound && ctx.sound('thud'); ctx.buzz('retry'); V.shake = 1; }
    if (k.irons > 1.2 && !V.saidIrons) { V.saidIrons = 1; ctx.line(VLINE96.irons); } else if (V.saidIrons && k.draw > 0.5) V.saidIrons = 0;
    const yaw = -N96.norm180(k.hdg - N96.NAV96.bearing) * Math.PI / 180; ship.rotation.y = yaw;   // (the course runs along the sea's x; she turns off it)
    seas.forEach((m) => { m.uniforms.uOff.value += Math.cos(yaw) * k.v * dt; m.uniforms.uOffZ.value += -Math.sin(yaw) * k.v * dt; });
    rig.rotation.y = -k.brace * Math.PI / 180; post.rotation.y = -k.rud * 0.55;
    pennant.rotation.y = -N96.norm180(k.from + 180 - k.hdg) * Math.PI / 180 + Math.sin(t * 9) * 0.08;   // (it streams downwind)
    const sh = N.shoalAt(); shoalG.visible = !!sh && sh.x > -140 && sh.x < 900;
    if (shoalG.visible) { shoalG.position.set(sh.x, 0, -sh.y); foams.forEach((f, j) => { const u = (t * 0.45 + j / 3) % 1; f.scale.setScalar(0.85 + 0.3 * u); f.material.opacity = 0.85 * (1 - u); }); if (sh.x < 520 && sh.x > 0 && Math.abs(sh.y) < sh.r + 45 && !V.saidShoal) { V.saidShoal = 1; ctx.line(VLINE96.shoalAhead); } }
    if (s === 'port') { const rx = N.leg - k.x; moles.position.set(rx, 0, k.y); moleS.forEach((m2, j) => { m2.position.z = (j ? 1 : -1) * N.port.gap; }); acre.position.set(rx + 60, 0, k.y); }
    nic.position.set(-11.4, deckY + 1.75, -1.6); nic.rotation.y = Math.PI / 2;
    sailors[1].position.set(4.2, deckY + 0.15, -2.7); sailors[3].position.set(4.2, deckY + 0.15, 2.7); sailors[1].rotation.y = sailors[3].rotation.y = Math.PI / 2;
    V.prog = s === 'sea' ? 0.5 * Math.min(1, k.x / N.leg) : 0.86 + 0.14 * Math.min(1, k.x / N.leg); V.lat = k.y;
    V.shake = Math.max(0, (V.shake || 0) - dt * 1.5);
    const zk = far96(), a = s === 'port' ? shipPt(-30 * zk, 17 * zk + V.shake * Math.sin(t * 40) * 0.6, 24 * zk) : shipPt(-38 * zk, 15 * zk + V.shake * Math.sin(t * 40) * 0.6, 11 * zk), b2 = s === 'port' ? shipPt(40, 2, -6) : shipPt(18 / zk, 3, 0); camK([a[0], a[1] + ship.position.y, a[2]], b2);   // (in the approach: past the sail, at the mouth)
    hud96(N, k, s);
    if (ev === 'done' || k.done) {
      if (s === 'sea') { V.qs.sea = k.q; begin('storm'); }
      else { V.qs.port = k.q; const qq = ['sea', 'storm', 'port'].map((n) => (V.qs[n] == null ? 0.5 : V.qs[n])), m = (qq[0] + qq[1] + qq[2]) / 3, q = m >= 0.85 ? 1 : m >= 0.4 ? 0.5 : 0; V.q = { q, rating: rate30(q) }; begin('acre'); }
    }
  }
  /** the compass (the ship's head up; gold: the course to Acre; blue: where the wind blows) and the small map (the coast, the two ports, the ship) */
  function hud96(N, k, s) {
    if (!svg) return; const w = W(), hh = H(), cx = w / 2, R2 = Math.min(62, w * 0.12), cy = hh - R2 - 16, deg = (d) => (N96.norm180(d - k.hdg) - 90) * Math.PI / 180;
    const pt = (d, r) => `${(cx + Math.cos(deg(d)) * r).toFixed(1)},${(cy + Math.sin(deg(d)) * r).toFixed(1)}`;
    let h = `<circle cx="${cx}" cy="${cy}" r="${R2}" fill="rgba(20,28,34,.6)" stroke="#FFF4DC" stroke-width="2"/>`;
    for (let d = 0; d < 360; d += 30) h += `<line x1="${pt(d, R2 * 0.86).split(',')[0]}" y1="${pt(d, R2 * 0.86).split(',')[1]}" x2="${pt(d, R2).split(',')[0]}" y2="${pt(d, R2).split(',')[1]}" stroke="#FFF4DC" stroke-width="${d % 90 ? 1 : 2.5}"/>`;
    for (const [d, n] of [[0, 'צ'], [90, 'מז'], [180, 'ד'], [270, 'מע']]) { const [x, y] = pt(d, R2 * 0.66).split(','); h += `<text x="${x}" y="${+y + 5}" font-size="13" font-weight="800" text-anchor="middle" fill="#FFF4DC">${n}</text>`; }
    const brg = N96.NAV96.bearing + (s === 'port' ? Math.atan2(k.y, Math.max(20, N.leg - k.x)) * 180 / Math.PI : 0);   // (in the approach: toward the mouth)
    h += `<polygon points="${pt(brg, R2 + 12)} ${pt(brg - 7, R2 - 2)} ${pt(brg + 7, R2 - 2)}" fill="#FFD66E" stroke="#3A2A10" stroke-width="1.5"/>`;
    const dw = k.from + 180; h += `<line x1="${pt(dw + 180, R2 * 0.5).split(',')[0]}" y1="${pt(dw + 180, R2 * 0.5).split(',')[1]}" x2="${pt(dw, R2 * 0.5).split(',')[0]}" y2="${pt(dw, R2 * 0.5).split(',')[1]}" stroke="#7CC6F0" stroke-width="4" stroke-linecap="round"/><circle cx="${pt(dw, R2 * 0.5).split(',')[0]}" cy="${pt(dw, R2 * 0.5).split(',')[1]}" r="5" fill="#7CC6F0"/>`;
    h += `<polygon points="${cx},${cy - R2 - 4} ${cx - 8},${cy - R2 - 18} ${cx + 8},${cy - R2 - 18}" fill="#FFF4DC"/>`;   // (the ship's head)
    h += `<rect x="${cx - 46}" y="${cy + R2 - 4}" width="92" height="7" rx="3" fill="rgba(255,255,255,.18)"/><rect x="${cx - 46}" y="${cy + R2 - 4}" width="${(92 * Math.min(1, k.v / N96.NAV96.vMax)).toFixed(1)}" height="7" rx="3" fill="#9FE07A"/>`;   // (her way)
    const mw = Math.min(170, w * 0.36), mh = mw * 0.7, mx = w - mw - 12, my = 66, M = (x, y) => `${(mx + x * mw).toFixed(1)},${(my + y * mh).toFixed(1)}`;
    h += `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="8" fill="#5E95B0" stroke="#FFF4DC" stroke-width="2" opacity=".92"/>`;
    h += `<polygon points="${N96.MAP96.coast.map(([x, y]) => M(x, y)).join(' ')} ${M(1, 0)} ${M(1, 1)} ${M(0, 1)}" fill="#D9C79A" stroke="#8A7650" stroke-width="1"/>`;
    const path = []; for (let u = 0; u <= 1.001; u += 0.1) { const [x, y] = N96.mapAt96(u); path.push(M(x, y)); } h += `<polyline points="${path.join(' ')}" fill="none" stroke="#FFF4DC" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    for (const [[x, y], n] of [[N96.MAP96.alex, 'אלכסנדריה'], [N96.MAP96.acre, 'עכו']]) { const [px, py] = M(x, y).split(','); h += `<circle cx="${px}" cy="${py}" r="4" fill="#3A2A10"/><text x="${px}" y="${+py + 15}" font-size="11" font-weight="800" text-anchor="middle" fill="#3A2A10">${n}</text>`; }
    const [sx, sy] = N96.mapAt96(V.prog, V.lat * 0.0004); const [px, py] = M(sx, sy).split(','); h += `<circle cx="${px}" cy="${py}" r="5.5" fill="#E04A3A" stroke="#FFF" stroke-width="2"/>`;
    if (N.Lv.hint && T.one == null) {   // (level 1: the way to drag, at the sail or at the helm)
      const off = N96.norm180(brg - k.hdg), bad = k.best - k.brace;
      if (Math.abs(bad) > N.Lv.tol * 0.9 && k.ps > 0) h += `<text x="${w / 2}" y="${hh * 0.3}" font-size="22" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#1A2A30" stroke-width="4" paint-order="stroke">${bad > 0 ? 'המפרש ⇨' : '⇦ המפרש'}</text>`;
      else if (Math.abs(off) > 14 || k.ps === 0) h += `<text x="${cx}" y="${cy - R2 - 30}" font-size="22" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#1A2A30" stroke-width="4" paint-order="stroke">${(k.ps === 0 ? -Math.sign(N96.norm180(k.from - k.hdg)) : Math.sign(off)) > 0 ? 'הגה ⇨' : '⇦ הגה'}</text>`;
    }
    svg.innerHTML = h;
  }
  /** the storm on the ship: the crew shift their weight with the left thumb, the haulers on the lashings with the right, the crates slide
   *  and go over the side */
  function storm96(dt, t, S, st, b) {
    if (st.ph !== 'throw') { sailors[0].position.set(-6, deckY + 0.15, Math.max(-3, Math.min(3, 1.2 + b * 1.7))); sailors[2].position.set(1.2, deckY + 0.15, Math.max(-3, Math.min(3, 0.8 + b * 1.7))); }
    if (!st.hug) { sailors[1].position.set(0.6, deckY + 0.15, -2.6); sailors[1].rotation.y = Math.PI; sailors[3].position.set(8.4, deckY + 0.15, 2.7); sailors[3].rotation.y = -Math.PI / 2; }
    if (st.ev === 'beat' || st.ev === 'slid') {
      const c = [...crates].reverse().find((q) => !q.userData.gone && q.userData.fall < 0); if (c) { c.userData.fall = 0; c.userData.side = Math.sign(st.h) || 1; }
      ctx.line(st.ev === 'beat' ? VLINE96.beat : VLINE96.slid, `גל ${st.i + 1}`); ctx.buzz('retry'); ctx.sound && ctx.sound('splash'); ctx.emit && ctx.emit('h96lost', { why: st.ev, crates: st.crates });
    }
    const loose = st.ph === 'push' && st.slackT > 0.1;
    for (const c of crates) {
      const u0 = c.userData; if (u0.gone) continue;
      if (u0.fall >= 0) { u0.fall += dt; const u = Math.min(1, u0.fall / 1.4); c.position.set(u0.x, u0.y + Math.sin(Math.min(u, 0.45) * Math.PI) * 1.6 - Math.max(0, u - 0.4) * 16, u0.z + (u0.side * 5 - u0.z) * Math.min(1, u * 1.8)); c.rotation.x += dt * 4 * u0.side; if (u >= 1) { u0.gone = true; c.visible = false; } continue; }
      const sl = loose ? Math.sign(st.h || 1) * Math.min(0.7, st.slackT * 0.5) : 0; c.position.z += (u0.z + sl - c.position.z) * Math.min(1, dt * 6);
    }
    if (lash) lashM.color.set(T.right && !st.hug ? '#F2E2B0' : '#6A5A3C');
  }
  const gauge = (S) => {   // the heel: a half dial at the bottom, its red lines; the swell's arrow; the thumbs' rings
    if (!svg) return; const cx = W() / 2, cy = H() - 18, r = Math.min(110, W() * 0.16), a = (v) => -Math.PI / 2 + v * 0.9, s2 = S.state();
    let h = `<path d="M${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="rgba(20,24,28,.55)" stroke="#FFF4DC" stroke-width="2"/>`;
    for (const sgn of [-1, 1]) { const an = a(sgn * S.P.line); h += `<line x1="${cx + Math.cos(an) * r * 0.55}" y1="${cy + Math.sin(an) * r * 0.55}" x2="${cx + Math.cos(an) * r}" y2="${cy + Math.sin(an) * r}" stroke="#E04A3A" stroke-width="4"/>`; }
    const an = a(Math.max(-1.1, Math.min(1.1, s2.h))); h += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(an) * r * 0.92}" y2="${cy + Math.sin(an) * r * 0.92}" stroke="#FFD66E" stroke-width="5" stroke-linecap="round"/>`;
    if (s2.ph === 'tele' || s2.ph === 'push') {   // the swell rising on the side the deck will dip; by the left thumb, the way to slide
      const d = S.dirAt(), rise = s2.ph === 'tele' ? Math.min(1, s2.t / S.P.tele) : 1 - Math.min(1, s2.t / S.P.push) * 0.6, x0 = d > 0 ? W() : 0, sx = d > 0 ? -1 : 1, hh = H() * (0.18 + 0.32 * rise), ww = W() * 0.16;
      h += `<path d="M${x0} ${H()} L${x0} ${H() - hh} Q${x0 + sx * ww * 0.6} ${H() - hh - 18} ${x0 + sx * ww} ${H() - hh * 0.35} L${x0 + sx * ww} ${H()} Z" fill="rgba(70,140,170,.55)" stroke="#E8F6FA" stroke-width="3"/>`;
    }
    if (s2.L <= (ON96 ? 0 : 1)) {   // (level 1, the shadow: by the left thumb, the way to slide now — until the arrow goes out)
      const ideal = Math.max(-1, Math.min(1, -s2.p - 0.5 * s2.h)), off = ideal - s2.b;
      if (Math.abs(off) > 0.22) { const lx0 = T.left ? T.left.x : W() * 0.18, ly0 = (T.left ? T.left.y : H() * 0.62) - 52; h += `<text x="${lx0}" y="${ly0}" font-size="40" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#1A2A30" stroke-width="4" paint-order="stroke">${off < 0 ? '⇦' : '⇨'}</text>`; }
    }
    const lx = T.left ? T.left.x : W() * 0.18, ly = T.left ? T.left.y : H() * 0.62, rx = T.right ? T.right.x : W() * 0.82, ry = T.right ? T.right.y : H() * 0.62;
    h += `<circle cx="${lx}" cy="${ly}" r="30" fill="${T.left ? 'rgba(255,214,110,.25)' : 'none'}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="${T.left ? '0' : '6 5'}"/><text x="${lx}" y="${ly + 50}" font-size="13" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#1A2A30" stroke-width="3" paint-order="stroke">⇆ איזון</text>`;
    h += `<circle cx="${rx}" cy="${ry}" r="30" fill="${T.right ? 'rgba(255,214,110,.25)' : 'none'}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="${T.right ? '0' : '6 5'}"/><text x="${rx}" y="${ry + 50}" font-size="13" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#1A2A30" stroke-width="3" paint-order="stroke">${s2.hug ? '🤲 הדלת' : (ON96 ? '✋ חבלי המטען' : '✋ חבלים')}</text>`;
    if (ON96) { const n = s2.crates, tot = S.P.crates; let cs = ''; for (let j = 0; j < tot; j++) cs += `<rect x="${cx - tot * 11 + j * 22}" y="${cy - r - 34}" width="16" height="14" rx="2" fill="${j < n ? '#C9A27A' : 'rgba(255,255,255,.12)'}" stroke="#FFF4DC" stroke-width="1.5"/>`; h += cs; }   // ── build 96 ── (the crates still aboard)
    svg.innerHTML = h;
  };
  begin('harbour');
  const job = {
    acting: true, fullPad: false, kind: 'voyage', camK: 1, V, T, ui, nic, ship,
    storm: () => V.S, pulley: () => V.P, scene: () => V.scene, go: (s) => begin(s), door1, door2,
    down() {}, move() {}, up() {},
    view() { return null; },
    frame(dt) {
      if (V.ended) return true;
      V.t += dt; V.fly += dt; const t = V.fly, s = V.scene;
      const A = seas[0].uniforms.uA.value; seas.forEach((m) => { m.uniforms.uT.value = t; });
      if ((s === 'sea' && !ON96) || s === 'storm' || s === 'hug') seas.forEach((m) => { m.uniforms.uOff.value += dt * (s === 'sea' ? 3 : 1.5); });
      glints.forEach((g2, i) => { g2.visible = g2.parent.visible; g2.material.opacity = 0.6 * (0.45 + 0.55 * Math.max(0, Math.sin(t * 2.3 + i * 1.7))) * (s === 'storm' || s === 'hug' ? 0.25 : s === 'sea' ? 0.3 : s === 'road' ? 0 : 1); });
      fire.material.opacity = 0.75 + 0.25 * Math.sin(t * 7);
      // the ship rides the sea: its bob and pitch from the swells; its roll from the storm's heel
      const off = seas[0].uniforms.uOff.value, hb = waveH(12 + off, 0, t, A), hs = waveH(-12 + off, 0, t, A), hm = waveH(off, 0, t, A);
      const heel = V.S && (s === 'storm' || s === 'hug') ? V.S.state().h : 0;
      cast95(dt);   // ── build 95 ──
      ship.position.y = hm * 0.8 - 0.4; ship.rotation.z = Math.atan2(hb - hs, 24) * 0.8; ship.rotation.x = heel * 0.32 + (s === 'storm' || s === 'hug' ? 0 : Math.sin(t * 0.9) * 0.02);
      { const a = sail.geometry.attributes.position, wind = ON96 && V.N ? V.N.state().draw : s === 'sea' ? Math.min(1, V.t / 18) : s === 'storm' || s === 'hug' ? 1 : 0.2; for (let i = 0; i < a.count; i++) { const y = sail0[i * 3 + 1], x = sail0[i * 3]; a.setZ(i, (1 - (y / 4.25) ** 2) * (1 - (x / 5) ** 2) * (0.6 + 1.6 * wind) * (1 + 0.08 * Math.sin(t * 6 + x))); } a.needsUpdate = true; }
      svg && (svg.innerHTML = '');
      if (V.skipped) { V.q = null; return end(); }
      if (s === 'harbour') {
        const P = V.P; if (T.one && now() - T.one.still > 0.12) P.hold(dt); P.step(dt); const st = P.state();
        const y = st.done ? 1 : Math.min(1.15, (st.y + P.sway()) / (P.P.win[1] + 0.05)), over = st.done ? Math.min(1, V.sub / 1.2) : 0, down = st.done ? Math.min(1, Math.max(0, (V.sub - 1.3) / 0.8)) : 0;
        door1.position.set(-2.5, 3.45 + y * 9 - (3.45 + 9 - deckY - 0.35) * down, 9 - 7.4 * over);
        cRope.geometry.attributes.position.setXYZ(1, -2.5, door1.position.y + 0.4, door1.position.z); cRope.geometry.attributes.position.setXYZ(0, -2.5, 18.8, door1.position.z - 0.5); cRope.geometry.attributes.position.needsUpdate = true;
        if (svg && !st.done) {   // the crane's meter: the door's height and the window it must rest in (as stage 02's pulley)
          const x = W() * 0.88, y0 = H() * 0.22, hh = H() * 0.5, sc = (v) => y0 + hh * (1 - Math.min(1.25, v) / 1.25), w0 = P.P.win[0], w1 = P.P.win[1];
          svg.innerHTML = `<rect x="${x - 10}" y="${y0}" width="20" height="${hh}" rx="9" fill="rgba(28,20,10,.6)" stroke="#FFE6A0" stroke-width="2"/><rect x="${x - 12}" y="${sc(w1)}" width="24" height="${sc(w0) - sc(w1)}" fill="rgba(255,214,110,.55)" stroke="#FFD66E" stroke-width="2"/><rect x="${x - 7}" y="${sc(st.y)}" width="14" height="${y0 + hh - sc(st.y)}" rx="6" fill="#7FC0E0"/>`;
        }
        const hi = !st.done && st.y > P.P.win[1] + 0.02; if (hi !== V.hi) { V.hi = hi; ctx.line(hi ? VLINE49.high : VLINE49.harbour, `רמה ${V.L}`); }
        if (st.done) { V.sub += dt; if (V.sub > 2.1) { if (!V.pq) { V.pq = P.result(); ctx.buzz('settle'); ctx.sound && ctx.sound('thud'); } if (V.sub > 3) begin('sea'); } }
        const d = door1.position; camK(V.t < 3.5 ? [62, 28, -52] : [d.x - 17, d.y + 3.5, -14], V.t < 3.5 ? [-2.5, 7, 8] : [d.x, d.y + 0.5, d.z]);   // (wide — the quay, the city, the lighthouse; then low on the shining door)
        nic.position.set(-6, deckY + 0.15, 1); nic.rotation.y = 0.4;
      } else if ((s === 'sea' || s === 'port') && ON96) { navFrame(dt, t, s);
      } else if (s === 'sea') {
        if (T.one) V.walk = Math.min(1, V.walk + dt / 18);
        const x = -9.5 + 21 * V.walk; nic.position.set(x, deckY + 0.15, -0.9 + Math.sin(V.walk * 9) * 0.25); nic.rotation.y = Math.PI / 2; nic.userData.top.rotation.z = T.one ? Math.sin(t * 8) * 0.04 : 0;
        knots.forEach((kn, i) => { const at = [-6, 2.5, 10][i]; if (x > at && !kn.userData.ok) { kn.userData.ok = 1; kn.material = new THREE.MeshStandardMaterial({ color: '#FFD66E', emissive: new THREE.Color('#8A6A20'), emissiveIntensity: 0.6 }); V.knotsOk++; ctx.buzz('tick'); ctx.sound && ctx.sound('rope'); if (V.knotsOk === 2) ctx.line(VLINE49.wind); } });
        setSea(0.55 + 0.9 * V.walk); fogTo(300 - 120 * V.walk, 5000 - 3000 * V.walk);
        camK([nic.position.x - 26, 13 + ship.position.y, -16], [nic.position.x + 6, 3, 0]);
        if (V.walk >= 1 && (V.sub += dt) > 1.2) begin('storm');
      } else if (s === 'storm' || s === 'hug') {
        const S = V.S, st0 = S.state(), wasI = st0.i, wasR = st0.replays, wasPh = st0.ph;
        const b = T.left ? Math.max(-1, Math.min(1, (T.left.x - T.left.x0) / (W() * 0.16))) : 0, rising = s === 'storm' && V.t < 3;   // (the storm rises for 3 s before its first wave: the sky darkens, the swell grows)
        if (rising) setSea(1.45 + 0.75 * (V.t / 3)); S.balance(b); S.holdOn(!!T.right); if (!rising) S.step(dt);
        const st = S.state(); V.bv = (b - (V.bp || 0)) / Math.max(dt, 1e-3); V.bp = b;
        if (ON96) storm96(dt, t, S, st, b);   // ── build 96 ── (the crates, the lashings, the crew's weight, the swell: all on the ship)
        if (st.replays > wasR) { ctx.line(st.why === 'heel' ? VLINE49.heel : st.why === 'hug' ? VLINE49.hugLost : VLINE49.ropes, `גל ${st.i + 1}`); ctx.buzz('retry'); ctx.emit && ctx.emit('h49replay', { why: st.why }); }
        if (wasPh !== 'throw' && st.ph === 'throw') { ctx.line(VLINE49.thrown); ctx.sound && ctx.sound('splash'); V.throwT = 0; }
        if (st.ph === 'throw') {   // the sailors throw the first door overboard (a scene)
          V.throwT = (V.throwT || 0) + dt; const u = Math.min(1, V.throwT / 3.2);
          sailors[0].position.set(-4 + 1.5 * Math.min(1, u * 2), deckY + 0.15, 2.4); sailors[2].position.set(-1, deckY + 0.15, 2.4);
          door1.rotation.x = -1.2 * Math.min(1, u * 1.6); door1.position.set(-2.5, deckY + 0.35 + Math.sin(Math.min(1, u) * Math.PI) * 2.5 - (u > 0.7 ? (u - 0.7) * 20 : 0), 1.6 + 6 * Math.min(1, u * 1.3));
          if (u >= 1) door1.visible = false;
        }
        if (wasI !== st.i && (S.wave ? !!S.wave().hug : st.i === F.STORM49.waves.length - 1) && s === 'storm') { V.scene = 'hug'; showTitle(TITLES.hug); ctx.line(VLINE49.hug, `רמה ${V.L}`); ctx.emit && ctx.emit('h49scene', { s: 'hug' }); }
        if (st.hug) {   // the sailors come for the second door; he kneels and holds it
          const go = ON96 ? Math.max(0.25, st.door) : st.ph === 'push' && st.slackT > 0 ? Math.min(1, st.slackT / 0.35) : st.ph === 'tele' ? 0.25 : 0.4;
          sailors[1].position.set(9.5 - 1.5 * go, deckY + 0.15, -3.4 + go); sailors[3].position.set(4.5 + 1.2 * go, deckY + 0.15, 0.6 - go);
          nic.position.set(6.5, deckY + 0.15, 0.8); nic.rotation.y = Math.PI; nic.userData.top.rotation.x = T.right ? 0.8 : 0.3; door2.rotation.x = ON96 ? -0.25 * st.door : st.slackT > 0.15 ? -0.25 * Math.min(1, st.slackT / 0.35) : 0; if (ON96) door2.position.z = -1.4 - 1.9 * st.door;
        } else { nic.position.set(ON96 ? -3.2 : -2, deckY + 0.15, ON96 ? Math.max(-1.2, Math.min(3, 0.4 + b * 1.7)) : -1.5); nic.rotation.y = Math.PI / 2; nic.userData.top.rotation.z = -st.h * 0.4; }
        gauge(S); const shake = s === 'hug' ? 0.4 : 0.6;
        if (st.hug) {   // (the hug: close, from over the bow's side, riding with the ship — Nicanor kneeling on the door, the sailors coming)
          ship.updateMatrix(); const a = new THREE.Vector3(17.5, 10.5, 9.5).applyMatrix4(ship.matrix), b2 = new THREE.Vector3(6.2, 4.4, -0.5).applyMatrix4(ship.matrix); camK([a.x, a.y, a.z], [b2.x, b2.y, b2.z]);
        } else if (ON96) { const zk = far96(); camK([-24 * zk, 16 * zk + ship.position.y + Math.sin(t * 2.3) * shake, 19 * zk], [1, 3 + st.h * 1.2, 0]); }   // ── build 96 ── (higher: the deck, its crates and crew, seen)
        else camK([-30, 9 + ship.position.y + Math.sin(t * 2.3) * shake, 12], [2, 4 + st.h * 1.5, 0]);
        if (st.done) {   // "ומיד נח הים מזעפו": the sea calms at once
          V.q = ON96 ? null : S.result(); if (ON96) V.qs.storm = st.q; setSea(0.25, '#163C55', '#3D86A0', '#A6C6D8'); fogTo(300, 5000, '#EAD6BA'); try { ctx.timeOfDay && ctx.timeOfDay('noon'); } catch (e) { /* */ }
          ctx.line(VLINE49.calm); ctx.sound && ctx.sound('solemn'); ctx.buzz('peak'); ctx.emit && ctx.emit('h49calm', V.q || { q: st.q }); V.scene = 'calm'; V.t = 0;
          sailors.forEach((sl, i) => { sl.position.set([-6.8, 11, -4, 12][i], deckY + 0.15, [2, -2.2, -2.5, 2.4][i]); }); nic.userData.top.rotation.x = 0; door2.rotation.x = 0;
        }
      } else if (s === 'calm') {
        camK([-26, 10, 16], [4, 3, 0]); if (V.t > 6) begin(ON96 ? 'port' : 'acre');
      } else if (s === 'acre') {
        const dock = Math.min(1, V.t / 4), e = dock * dock * (3 - 2 * dock); ship.position.z = 16 * (1 - e);   // (docking: 4 s, the ship glides in to the quay)
        if (T.one && dock >= 1) V.acreY = Math.min(1, V.acreY + dt / 7);
        const y = -6 + 8.6 * V.acreY; door1.position.set(-4, y, 4.3 + 1.6 * Math.max(0, (V.acreY - 0.85) / 0.15)); door1.rotation.x = (Math.PI / 2 - 0.25) * (1 - Math.max(0, (V.acreY - 0.85) / 0.15));
        if (V.acreY > 0.05 && !V.bub) { V.bub = 1; ctx.sound && ctx.sound('splash'); }
        camK(dock < 1 ? [-30, 9, 34] : [-15, 4.5, 21], dock < 1 ? [-2, 2, ship.position.z] : [-4, Math.max(1.2, y + 1), 4.3]);   // (low over the water: the door rising by the hull; Acre's quay behind)
        if (V.acreY >= 1 && (V.sub += dt) > 1.5) begin('road');
      } else if (s === 'road') {
        V.carT += dt; carts.forEach((c2, i) => { c2.position.x = -40 - i * 9 + V.carT * 6; }); const lead = -40 + V.carT * 6;
        camK([lead + 12, 6.5, 24], [lead - 12, 2.5, 3]);
        if (V.carT > 5) return end();
      }
      return false;
    },
    end() { cleanup(); },
  };
  function end() {
    if (V.ended) return true; V.ended = true;
    const r = V.q || (V.skipped ? null : { q: 1, rating: 'mehudar' }), st = V.S ? V.S.state() : null;
    cleanup(); ctx.line(VLINE49.back);
    ctx.done && ctx.done({ q: r ? r.q : null, rating: r ? r.rating : null, crossings: st ? st.crossings : 0, replays: st ? (st.replays != null ? st.replays : st.lost) : 0, skipped: V.skipped });
    return true;
  }
  let cleaned = false;
  function cleanup() {
    if (cleaned) return; cleaned = true;
    for (const f of [cast.nic, ...cast.sail]) if (f && f.root.parent) f.root.parent.remove(f.root);   // ── build 95 ── (people88's shared shapes: not disposed with the voyage)
    for (const c of hidden) c.visible = true; if (G.parent) G.parent.remove(G);
    if (fog0 && scene.fog) { scene.fog.near = fog0.n; scene.fog.far = fog0.f; scene.fog.color.copy(fog0.c); }
    try { if (ctx.stages && ctx.stages.hero) ctx.stages.hero.show(true); } catch (e) { /* */ }   // (the kohen returns)
    try { if (ui) ui.remove(); if (skipB) skipB.remove(); } catch (e) { /* */ }
    G.traverse((o) => { try { if (o.geometry) o.geometry.dispose(); } catch (e) { /* */ } });
  }
  return job;
}
