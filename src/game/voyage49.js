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

export const Y49 = 400;   // (the sea's level: 400 amot over the hidden world)
export const VOY49 = Object.freeze(['harbour', 'sea', 'storm', 'hug', 'acre', 'road']);
export const VLINE49 = Object.freeze({
  intro: 'הסיפור של הדלתות — הפעם אתם ניקנור · "כשהלך ניקנור להביא דלתות מאלכסנדריא של מצרים" — יומא לח ע"א · טיוטה',
  harbour: 'משכו מטה בקצב — מנוף הנמל מעלה את הדלת · נמל אלכסנדריה; המגדלור — המחשה',
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
const TITLES = { harbour: 'נמל אלכסנדריה', sea: 'בלב ים', storm: 'סערה', hug: '"הטילוני עמה"', acre: 'נמל עכו', road: 'אל ירושלים' };

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
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 }, uA: { value: 0.5 }, uOff: { value: 0 }, uSun: { value: new THREE.Vector3(0.4, 0.5, 0.3).normalize() }, uDeep: { value: new THREE.Color('#1D4A63') }, uCrest: { value: new THREE.Color('#5DA2B7') }, uSky: { value: new THREE.Color('#BCD6E2') }, uFar: { value: 0 }, uR: { value: 160 } }]),
    vertexShader: `uniform float uT, uA, uOff, uFar, uR; varying vec3 vW; varying vec3 vN; varying float vH;
      #include <fog_pars_vertex>
      float sw(vec2 k, float w, float a, vec2 p, out vec2 g) { float ph = dot(k, p) + w * uT; g = a * cos(ph) * k; return a * sin(ph); }
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0); vec2 p = wp.xz + vec2(uOff, 0.0); float r = length(wp.xz);
        float att = uFar > 0.5 ? smoothstep(150.0, 260.0, r) * 0.6 : 1.0 - smoothstep(uR * 0.8, uR, r);
        vec2 g = vec2(0.0), gi; float h = 0.0;
        h += sw(vec2(0.11, 0.06), 1.0, 0.6, p, gi); g += gi; h += sw(vec2(0.17, -0.1), 1.5, 0.35, p, gi); g += gi;
        h += sw(vec2(0.29, 0.21), 2.2, 0.18, p, gi); g += gi; h += sw(vec2(0.05, 0.02), 0.6, 0.55, p, gi); g += gi;
        h *= uA * att; g *= uA * att; wp.y += h; if (uFar > 0.5 && r < 140.0) wp.y -= 8.0;
        vH = h / max(uA, 0.05); vW = wp.xyz; vN = normalize(vec3(-g.x, 1.0, -g.y));
        vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform vec3 uSun, uDeep, uCrest, uSky; uniform float uA; varying vec3 vW; varying vec3 vN; varying float vH;
      #include <fog_pars_fragment>
      void main() {
        vec3 V = normalize(cameraPosition - vW), N = normalize(vN);
        float fr = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        vec3 c = mix(uDeep, uCrest, clamp(0.5 + 0.45 * vH, 0.0, 1.0));
        c = mix(c, uSky, fr * 0.65);
        float sp = pow(max(dot(reflect(-uSun, N), V), 0.0), 90.0); c += vec3(1.0, 0.95, 0.8) * sp * 1.6;
        float foam = smoothstep(0.85, 1.25, vH) * clamp(uA * 0.6, 0.0, 1.0); c = mix(c, vec3(0.93, 0.95, 0.96), foam * 0.8);
        c *= 0.55 + 0.45 * max(dot(N, uSun), 0.0) + 0.25;
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
  const wood = mat('#7A5434', 0.85), dk = mat('#4E3420', 0.9), plank = mat('#A27A50', 0.85);
  add(new THREE.Mesh(new THREE.BoxGeometry(24, 3.2, 7.2), wood), 0, 1, 0, ship);
  add(new THREE.Mesh(new THREE.BoxGeometry(24, 0.3, 6.8), plank), 0, deckY, 0, ship);
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 3.6, 7, 4, 1), wood); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 4; bow.scale.z = 0.7; add(bow, 15.2, 1.2, 0, ship);
  add(new THREE.Mesh(new THREE.BoxGeometry(5, 1.6, 6.8), wood), -10, deckY + 0.9, 0, ship);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 5, 8), dk); post.rotation.z = 0.5; add(post, -13.6, 4, 0, ship);
  for (const sz of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 0.25), dk), 0.5, deckY + 0.6, sz * 3.4, ship);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 15, 10), dk), 2, deckY + 7.5, 0, ship);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 11, 8), dk), 2, deckY + 13.6, 0, ship).rotation.x = Math.PI / 2;
  const sailC = doc ? (() => { try { const cv = doc.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#E8DCC0'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#B34A32'; for (let i = 0; i < 4; i++) c.fillRect(i * 32 + 12, 0, 8, 128); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; } catch (e) { return null; } })() : null;
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(10, 8.5, 8, 6), new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: sailC, side: THREE.DoubleSide, roughness: 0.9 })); sail.rotation.y = Math.PI / 2; add(sail, 2.25, deckY + 9.2, 0, ship);
  const sail0 = sail.geometry.attributes.position.array.slice();
  // the doors: bronze, glinting
  const bronze = new THREE.MeshStandardMaterial({ color: '#D9A35C', metalness: 0.45, roughness: 0.3, emissive: new THREE.Color('#6A4218'), emissiveIntensity: 0.55 });   // (bright: with no environment a metal reads dark)
  const door = (x, z) => { const d = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 4.9), bronze); d.add(b); for (let i = 1; i < 4; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.42, 4.6), mat('#8A5A2A', 0.4, 0.8)); r.position.x = -4.5 + i * 2.25; d.add(r); } return add(d, x, deckY + 0.35, z, ship); };
  const door1 = door(-2.5, 1.6), door2 = door(7, -1.4); door1.visible = false;
  let glow = null; try { glow = TX.texGlow(); } catch (e) { glow = null; }
  const glints = [door1, door2].map((d) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#FFF1C8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(5, 5, 1); s.position.set(1.5, 0.6, 0.8); d.add(s); return s; });
  const ropesM = new THREE.LineBasicMaterial({ color: '#D9C9A0' });
  const ropeLine = (pts) => { const g2 = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))); return new THREE.LineSegments(g2, ropesM); };
  ship.add(ropeLine([[2, deckY + 15, 0], [13, deckY + 0.6, 0], [2, deckY + 15, 0], [-11, deckY + 2, 0], [2, deckY + 14, 0], [2, deckY + 0.6, 3.3], [2, deckY + 14, 0], [2, deckY + 0.6, -3.3]]));
  const knots = [[-6, -2.6], [2.5, 2.6], [10, -2.6]].map(([x, z]) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), mat('#D9C9A0')); return add(k, x, deckY + 0.5, z, ship); });
  const sailors = [0, 1, 2, 3].map((i) => { const f = figure49({ tunic: ['#C9B48A', '#A88F68', '#B9A27A', '#8E7A5A'][i], cap: '#6A5238' }); return add(f, [-8, 11, -4, 12][i], deckY + 0.15, [2, -2.2, -2.5, 2.4][i], ship); });
  const nic = add(figure49(NICANOR49), -9.5, deckY + 1.85, -1, ship); nic.rotation.y = Math.PI / 2;
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
  const V = { scene: 'harbour', t: 0, sub: 0, skipped: false, L: Math.max(1, ctx.L || 1), P: null, S: null, walk: 0, knotsOk: 0, acreY: 0, carT: 0, q: null, ended: false, fly: 0 };
  if (ui) {
    ui.addEventListener('pointerdown', (e) => { e.preventDefault(); try { ui.setPointerCapture(e.pointerId); } catch (er) { /* */ } const p = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: now(), still: now() };
      if (V.scene === 'storm' || V.scene === 'hug') { if (e.clientX < W() / 2) T.left = p; else T.right = p; } else T.one = p; onDown(p); });
    ui.addEventListener('pointermove', (e) => { for (const k of ['one', 'left', 'right']) { const p = T[k]; if (p && p.id === e.pointerId) { if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 4) p.still = now(); const dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; if (k === 'one') onMove(p, dy); } } });
    const upF = (e) => { for (const k of ['one', 'left', 'right']) { const p = T[k]; if (p && p.id === e.pointerId) { T[k] = null; if (k === 'one') onUp(p); } } };
    for (const tp of ['pointerup', 'pointercancel', 'lostpointercapture']) ui.addEventListener(tp, upF);
  }
  function onDown() { if (V.scene === 'harbour' && V.P) V.P.grab(); }
  function onMove(p, dy) { if (V.scene === 'harbour' && V.P && dy > 0) V.P.pull(dy); }
  function onUp() { if (V.scene === 'harbour' && V.P) V.P.release(); }
  // the scenes
  const setSea = (A, deep, crest, sky) => { seas.forEach((m) => { m.uniforms.uA.value = A; if (deep) m.uniforms.uDeep.value.set(deep); if (crest) m.uniforms.uCrest.value.set(crest); if (sky) m.uniforms.uSky.value.set(sky); }); };
  const fogTo = (n, f, c) => { if (!scene.fog) return; scene.fog.near = n; scene.fog.far = f; if (c) scene.fog.color.set(c); };
  function begin(s) {
    V.scene = s; V.t = 0; V.sub = 0; V.cp = null; V.ct = null; showTitle(TITLES[s] || '');   // (a cut between scenes) ctx.emit && ctx.emit('h49scene', { s });
    if (s === 'harbour') { try { ctx.timeOfDay && ctx.timeOfDay('dawn'); } catch (e) { /* */ } V.P = F.createPulley(V.L); setSea(0.35, '#1D4A63', '#5DA2B7', '#BCD6E2'); fogTo(300, 5000); door1.visible = true; door1.position.set(-2.5, 3.45, 9); ctx.line(VLINE49.harbour, `רמה ${V.L}`); }
    if (s === 'sea') { harbour.visible = false; V.P = null; V.walk = 0; setSea(0.55); ctx.line(VLINE49.sea); }
    if (s === 'storm') { try { ctx.timeOfDay && ctx.timeOfDay('dusk'); } catch (e) { /* */ } V.S = F.createStorm49(V.L); setSea(2.2, '#22343E', '#52707A', '#7E8E96'); fogTo(60, 700, '#6E7A80'); ctx.line(VLINE49.storm, `רמה ${V.L}`); ctx.sound && ctx.sound('rope'); }
    if (s === 'acre') { V.acreY = 0; acre.visible = true; door1.visible = true; door1.parent && door1.parent.remove(door1); G.add(door1); door1.position.set(-4, -6, 4.3); door1.rotation.set(Math.PI / 2 - 0.25, 0, 0); setSea(0.3, '#1D4A63', '#5DA2B7', '#BCD6E2'); fogTo(300, 5000); try { ctx.timeOfDay && ctx.timeOfDay('noon'); } catch (e) { /* */ } ctx.line(VLINE49.acre); }
    if (s === 'road') { acre.visible = false; near.visible = false; far.visible = false; ship.visible = false; door1.visible = false; road.visible = true; V.carT = 0; try { ctx.timeOfDay && ctx.timeOfDay('golden'); } catch (e) { /* */ } ctx.line(VLINE49.road); }
  }
  const camK = (p, t) => { V.cp = V.cp ? V.cp.map((v, i) => v + (p[i] - v) * 0.08) : p.slice(); V.ct = V.ct ? V.ct.map((v, i) => v + (t[i] - v) * 0.08) : t.slice(); ctx.camTo([V.cp[0], V.cp[1] + Y49, V.cp[2]], [V.ct[0], V.ct[1] + Y49, V.ct[2]], 1); };   // (the voyage's own coordinates: G's, 400 amot up)
  const gauge = (S) => {   // the heel: a half dial at the bottom, its red lines; the swell's arrow; the thumbs' rings
    if (!svg) return; const cx = W() / 2, cy = H() - 18, r = Math.min(110, W() * 0.16), a = (v) => -Math.PI / 2 + v * 0.9, s2 = S.state();
    let h = `<path d="M${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="rgba(20,24,28,.55)" stroke="#FFF4DC" stroke-width="2"/>`;
    for (const sgn of [-1, 1]) { const an = a(sgn * F.STORM49.line); h += `<line x1="${cx + Math.cos(an) * r * 0.55}" y1="${cy + Math.sin(an) * r * 0.55}" x2="${cx + Math.cos(an) * r}" y2="${cy + Math.sin(an) * r}" stroke="#E04A3A" stroke-width="4"/>`; }
    const an = a(Math.max(-1.1, Math.min(1.1, s2.h))); h += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(an) * r * 0.92}" y2="${cy + Math.sin(an) * r * 0.92}" stroke="#FFD66E" stroke-width="5" stroke-linecap="round"/>`;
    if (s2.ph === 'tele' || s2.ph === 'push') {   // the swell rising on the side the deck will dip; by the left thumb, the way to slide
      const d = S.dirAt(), rise = s2.ph === 'tele' ? Math.min(1, s2.t / F.STORM49.tele) : 1 - Math.min(1, s2.t / F.STORM49.push) * 0.6, x0 = d > 0 ? W() : 0, sx = d > 0 ? -1 : 1, hh = H() * (0.18 + 0.32 * rise), ww = W() * 0.16;
      h += `<path d="M${x0} ${H()} L${x0} ${H() - hh} Q${x0 + sx * ww * 0.6} ${H() - hh - 18} ${x0 + sx * ww} ${H() - hh * 0.35} L${x0 + sx * ww} ${H()} Z" fill="rgba(70,140,170,.55)" stroke="#E8F6FA" stroke-width="3"/>`;
    }
    if (s2.L <= 1) {   // (level 1, the shadow: by the left thumb, the way to slide now — until the arrow goes out)
      const ideal = Math.max(-1, Math.min(1, -s2.p - 0.5 * s2.h)), off = ideal - s2.b;
      if (Math.abs(off) > 0.22) { const lx0 = T.left ? T.left.x : W() * 0.18, ly0 = (T.left ? T.left.y : H() * 0.62) - 52; h += `<text x="${lx0}" y="${ly0}" font-size="40" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#1A2A30" stroke-width="4" paint-order="stroke">${off < 0 ? '⇦' : '⇨'}</text>`; }
    }
    const lx = T.left ? T.left.x : W() * 0.18, ly = T.left ? T.left.y : H() * 0.62, rx = T.right ? T.right.x : W() * 0.82, ry = T.right ? T.right.y : H() * 0.62;
    h += `<circle cx="${lx}" cy="${ly}" r="30" fill="${T.left ? 'rgba(255,214,110,.25)' : 'none'}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="${T.left ? '0' : '6 5'}"/><text x="${lx}" y="${ly + 50}" font-size="13" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#1A2A30" stroke-width="3" paint-order="stroke">⇆ איזון</text>`;
    h += `<circle cx="${rx}" cy="${ry}" r="30" fill="${T.right ? 'rgba(255,214,110,.25)' : 'none'}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="${T.right ? '0' : '6 5'}"/><text x="${rx}" y="${ry + 50}" font-size="13" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#1A2A30" stroke-width="3" paint-order="stroke">${s2.hug ? '🤲 הדלת' : '✋ חבלים'}</text>`;
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
      if (s === 'sea' || s === 'storm' || s === 'hug') seas.forEach((m) => { m.uniforms.uOff.value += dt * (s === 'sea' ? 3 : 1.5); });
      glints.forEach((g2, i) => { g2.material.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.3 + i * 1.7)) * (s === 'storm' || s === 'hug' ? 0.25 : 1); });
      fire.material.opacity = 0.75 + 0.25 * Math.sin(t * 7);
      // the ship rides the sea: its bob and pitch from the swells; its roll from the storm's heel
      const off = seas[0].uniforms.uOff.value, hb = waveH(12 + off, 0, t, A), hs = waveH(-12 + off, 0, t, A), hm = waveH(off, 0, t, A);
      const heel = V.S && (s === 'storm' || s === 'hug') ? V.S.state().h : 0;
      ship.position.y = hm * 0.8 - 0.4; ship.rotation.z = Math.atan2(hb - hs, 24) * 0.8; ship.rotation.x = heel * 0.32 + (s === 'storm' || s === 'hug' ? 0 : Math.sin(t * 0.9) * 0.02);
      { const a = sail.geometry.attributes.position, wind = s === 'sea' ? Math.min(1, V.t / 18) : s === 'storm' || s === 'hug' ? 1 : 0.2; for (let i = 0; i < a.count; i++) { const y = sail0[i * 3 + 1], x = sail0[i * 3]; a.setZ(i, (1 - (y / 4.25) ** 2) * (1 - (x / 5) ** 2) * (0.6 + 1.6 * wind) * (1 + 0.08 * Math.sin(t * 6 + x))); } a.needsUpdate = true; }
      svg && (svg.innerHTML = '');
      if (V.skipped) { V.q = null; return end(); }
      if (s === 'harbour') {
        const P = V.P; if (T.one && now() - T.one.still > 0.12) P.hold(dt); P.step(dt); const st = P.state();
        const y = st.done ? 1 : Math.min(1.15, (st.y + P.sway()) / (P.P.win[1] + 0.05)), over = st.done ? Math.min(1, V.sub / 1.2) : 0, down = st.done ? Math.min(1, Math.max(0, (V.sub - 1.3) / 0.8)) : 0;
        door1.position.set(-2.5, 3.45 + y * 9 - (3.45 + 9 - deckY - 0.35) * down, 9 - 7.4 * over);
        cRope.geometry.attributes.position.setXYZ(1, -2.5, door1.position.y + 0.4, door1.position.z); cRope.geometry.attributes.position.setXYZ(0, -2.5, 18.8, door1.position.z - 0.5); cRope.geometry.attributes.position.needsUpdate = true;
        if (st.done) { V.sub += dt; if (V.sub > 2.1) { if (!V.pq) { V.pq = P.result(); ctx.buzz('settle'); ctx.sound && ctx.sound('thud'); } if (V.sub > 3) begin('sea'); } }
        const d = door1.position; camK(V.t < 3.5 ? [62, 28, -52] : [d.x - 17, d.y + 3.5, -14], V.t < 3.5 ? [-2.5, 7, 8] : [d.x, d.y + 0.5, d.z]);   // (wide — the quay, the city, the lighthouse; then low on the shining door)
        nic.position.set(-6, deckY + 0.15, 1); nic.rotation.y = 0.4;
      } else if (s === 'sea') {
        if (T.one) V.walk = Math.min(1, V.walk + dt / 14);
        const x = -9.5 + 21 * V.walk; nic.position.set(x, deckY + 0.15, -0.9 + Math.sin(V.walk * 9) * 0.25); nic.rotation.y = Math.PI / 2; nic.userData.top.rotation.z = T.one ? Math.sin(t * 8) * 0.04 : 0;
        knots.forEach((kn, i) => { const at = [-6, 2.5, 10][i]; if (x > at && !kn.userData.ok) { kn.userData.ok = 1; kn.material = new THREE.MeshStandardMaterial({ color: '#FFD66E', emissive: new THREE.Color('#8A6A20'), emissiveIntensity: 0.6 }); V.knotsOk++; ctx.buzz('tick'); ctx.sound && ctx.sound('rope'); if (V.knotsOk === 2) ctx.line(VLINE49.wind); } });
        setSea(0.55 + 0.9 * V.walk); fogTo(300 - 120 * V.walk, 5000 - 3000 * V.walk);
        camK([nic.position.x - 26, 13 + ship.position.y, -16], [nic.position.x + 6, 3, 0]);
        if (V.walk >= 1 && (V.sub += dt) > 1.2) begin('storm');
      } else if (s === 'storm' || s === 'hug') {
        const S = V.S, st0 = S.state(), wasI = st0.i, wasR = st0.replays, wasPh = st0.ph;
        const b = T.left ? Math.max(-1, Math.min(1, (T.left.x - T.left.x0) / (W() * 0.16))) : 0; S.balance(b); S.holdOn(!!T.right); S.step(dt);
        const st = S.state();
        if (st.replays > wasR) { ctx.line(st.why === 'heel' ? VLINE49.heel : st.why === 'hug' ? VLINE49.hugLost : VLINE49.ropes, `גל ${st.i + 1}`); ctx.buzz('retry'); ctx.emit && ctx.emit('h49replay', { why: st.why }); }
        if (wasPh !== 'throw' && st.ph === 'throw') { ctx.line(VLINE49.thrown); ctx.sound && ctx.sound('splash'); V.throwT = 0; }
        if (st.ph === 'throw') {   // the sailors throw the first door overboard (a scene)
          V.throwT = (V.throwT || 0) + dt; const u = Math.min(1, V.throwT / 3.2);
          sailors[0].position.set(-4 + 1.5 * Math.min(1, u * 2), deckY + 0.15, 2.4); sailors[2].position.set(-1, deckY + 0.15, 2.4);
          door1.rotation.x = -1.2 * Math.min(1, u * 1.6); door1.position.set(-2.5, deckY + 0.35 + Math.sin(Math.min(1, u) * Math.PI) * 2.5 - (u > 0.7 ? (u - 0.7) * 20 : 0), 1.6 + 6 * Math.min(1, u * 1.3));
          if (u >= 1) door1.visible = false;
        }
        if (wasI !== st.i && st.i === F.STORM49.waves.length - 1 && s === 'storm') { V.scene = 'hug'; showTitle(TITLES.hug); ctx.line(VLINE49.hug, `רמה ${V.L}`); ctx.emit && ctx.emit('h49scene', { s: 'hug' }); }
        if (st.hug) {   // the sailors come for the second door; he kneels and holds it
          const go = st.ph === 'push' && st.slackT > 0 ? Math.min(1, st.slackT / 0.35) : st.ph === 'tele' ? 0.25 : 0.4;
          sailors[1].position.set(9.5 - 1.5 * go, deckY + 0.15, -3.4 + go); sailors[3].position.set(4.5 + 1.2 * go, deckY + 0.15, 0.6 - go);
          nic.position.set(6.5, deckY + 0.15, 0.8); nic.rotation.y = Math.PI; nic.userData.top.rotation.x = T.right ? 0.8 : 0.3; door2.rotation.x = st.slackT > 0.15 ? -0.25 * Math.min(1, st.slackT / 0.35) : 0;
        } else { nic.position.set(-2, deckY + 0.15, -1.5); nic.rotation.y = Math.PI / 2; nic.userData.top.rotation.z = -st.h * 0.4; }
        gauge(S); const shake = s === 'hug' ? 0.4 : 0.6;
        const cp = st.hug ? [15, 7.5 + ship.position.y, 10] : [-30, 9 + ship.position.y + Math.sin(t * 2.3) * shake, 12];   // (the hug: from the bow's side — Nicanor, the door, the sailors coming; the mast behind)
        camK(cp, st.hug ? [6.5, 3.4, -0.4] : [2, 4 + st.h * 1.5, 0]);
        if (st.done) {   // "ומיד נח הים מזעפו": the sea calms at once
          V.q = S.result(); setSea(0.25, '#1D4A63', '#5DA2B7', '#BCD6E2'); fogTo(300, 5000, '#EAD6BA'); try { ctx.timeOfDay && ctx.timeOfDay('noon'); } catch (e) { /* */ }
          ctx.line(VLINE49.calm); ctx.sound && ctx.sound('solemn'); ctx.buzz('peak'); ctx.emit && ctx.emit('h49calm', V.q); V.scene = 'calm'; V.t = 0;
          sailors.forEach((sl, i) => { sl.position.set([-8, 11, -4, 12][i], deckY + 0.15, [2, -2.2, -2.5, 2.4][i]); }); nic.userData.top.rotation.x = 0; door2.rotation.x = 0;
        }
      } else if (s === 'calm') {
        camK([-26, 10, 16], [4, 3, 0]); if (V.t > 6) begin('acre');
      } else if (s === 'acre') {
        if (T.one) V.acreY = Math.min(1, V.acreY + dt / 7);
        const y = -6 + 8.6 * V.acreY; door1.position.set(-4, y, 4.3 + 1.6 * Math.max(0, (V.acreY - 0.85) / 0.15)); door1.rotation.x = (Math.PI / 2 - 0.25) * (1 - Math.max(0, (V.acreY - 0.85) / 0.15));
        if (V.acreY > 0.05 && !V.bub) { V.bub = 1; ctx.sound && ctx.sound('splash'); }
        camK([-15, 4.5, 21], [-4, Math.max(1.2, y + 1), 4.3]);   // (low over the water: the door rising by the hull; Acre's quay behind)
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
    ctx.done && ctx.done({ q: r ? r.q : null, rating: r ? r.rating : null, crossings: st ? st.crossings : 0, replays: st ? st.replays : 0, skipped: V.skipped });
    return true;
  }
  let cleaned = false;
  function cleanup() {
    if (cleaned) return; cleaned = true;
    for (const c of hidden) c.visible = true; if (G.parent) G.parent.remove(G);
    if (fog0 && scene.fog) { scene.fog.near = fog0.n; scene.fog.far = fog0.f; scene.fog.color.copy(fog0.c); }
    try { if (ctx.stages && ctx.stages.hero) ctx.stages.hero.show(true); } catch (e) { /* */ }   // (the kohen returns)
    try { if (ui) ui.remove(); if (skipB) skipB.remove(); } catch (e) { /* */ }
    G.traverse((o) => { try { if (o.geometry) o.geometry.dispose(); } catch (e) { /* */ } });
  }
  return job;
}
