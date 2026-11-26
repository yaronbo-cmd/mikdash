/* build 137 — the lab: stage 14's acts alone on a plain page (the spec's "שלושה אבות־טיפוס אפורים": each work playable on a phone before
 * the full code). The same act files as the game (src/game/h137/*.js) on a small stand-in of the director's X: the camera's shots, the
 * screen projection, the points (40 / 20 / 10 × the level), the losses, the words. #taim1 … #zahav3, #havraka: the work and its level. */
import * as THREE from 'three';
import { createH137, PLAN } from '../../src/game/h137/model.js';
import { mats14 } from '../../src/game/h137/look.js';

const ACTS = {};
export function register(k, A) { ACTS[k] = A; }
const W = () => innerWidth, H = () => innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('c') });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W(), H()); renderer.shadowMap.enabled = true;
if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#BFD3E0');
const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 2000);
scene.add(new THREE.HemisphereLight('#FFF6E8', '#8A7C66', 1.3));
const sun = new THREE.DirectionalLight('#FFF1D6', 1.6); sun.position.set(60, 120, 40); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 400 }); scene.add(sun); scene.add(sun.target);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: '#CFC6B2', roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
addEventListener('resize', () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
const root = new THREE.Group(); scene.add(root);
const UI = document.getElementById('ui');
const el = (cls, html, css) => { const d = document.createElement('div'); d.className = 'lab-ui ' + cls; d.innerHTML = html; if (css) d.style.cssText = css; document.body.appendChild(d); return d; };
const lineEl = el('line', '', ''); const scoreEl = el('score', '0');
let total = 0; const addPts = (n) => { total = Math.max(0, total + n); scoreEl.textContent = total; };
// ── the camera: shots (eased) and tracking
const CAMS = { from: null, to: null, t: 1, d: 0 };
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function shot(eye, aim, d = 1) { const p = camera.position.clone(), q = CAMS.aim ? CAMS.aim.clone() : v3(aim); CAMS.from = [p, q]; CAMS.to = [v3(eye), v3(aim)]; CAMS.t = 0; CAMS.d = Math.max(0.01, d); }
function camStep(dt) {
  if (!CAMS.to) return; CAMS.t = Math.min(1, CAMS.t + dt / CAMS.d); const k = CAMS.t < 1 ? 1 - Math.pow(1 - CAMS.t, 3) : 1;
  camera.position.lerpVectors(CAMS.from[0], CAMS.to[0], k); CAMS.aim = new THREE.Vector3().lerpVectors(CAMS.from[1], CAMS.to[1], k); camera.lookAt(CAMS.aim); camera.updateMatrixWorld();
}
function scr(x, y, z) { const v = new THREE.Vector3(x, y, z).project(camera); return { x: (v.x + 1) / 2 * W(), y: (1 - v.y) / 2 * H(), on: v.z < 1 }; }
const rc = new THREE.Raycaster();
function rayAt(x, y) { rc.setFromCamera(new THREE.Vector2(x / W() * 2 - 1, -(y / H()) * 2 + 1), camera); return rc.ray; }
// ── the words, the points, the hand
let lineT = null;
function line(t, ms = 3000) { lineEl.textContent = t || ''; lineEl.style.display = t ? 'block' : 'none'; clearTimeout(lineT); if (t && ms) lineT = setTimeout(() => { lineEl.style.display = 'none'; }, ms); }
function pop(at, text, color, big) { const p = at && at.sx != null ? { x: at.sx, y: at.sy } : at ? scr(at.x, at.y, at.z) : { x: W() / 2, y: H() * 0.4 }; const d = el('pop', text, `left:${p.x}px;top:${p.y}px;color:${color};font-size:${big ? 30 : 22}px`); setTimeout(() => d.classList.add('up'), 20); setTimeout(() => d.remove(), 1400); }
let run = 0;
const handEl = el('hand', '👆', 'display:none'); let handAt = null;
const sparks = [];
function burst(x, y, z, n, color) { for (let i = 0; i < Math.min(30, n); i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 3), new THREE.MeshBasicMaterial({ color })); m.position.set(x, y, z); const a = i * 2.39, s = 1.5 + (i % 5) * 0.5; m.userData.v = new THREE.Vector3(Math.cos(a) * s, 2 + (i % 3), Math.sin(a) * s); scene.add(m); sparks.push({ m, t: 0 }); } }
const actx = (() => { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } })();
addEventListener('pointerdown', () => { try { if (actx && actx.state !== 'running') actx.resume(); } catch (e) { /* */ } }, true);
const WAITS = [];
const props = { root, geo: { box: new THREE.BoxGeometry(1, 1, 1) }, M: {}, remove(o) { try { o.parent && o.parent.remove(o); } catch (e) { /* */ } } };
let M = createH137(null), act = null, cur = null;
const X = {
  THREE, scene, camera, props, get M() { return M; },
  shot, track(eye, aim, d) { shot(eye, aim, d || 0.3); }, scr, rayAt,
  line, hand(p) { handAt = p; handEl.style.display = p ? 'block' : 'none'; },
  hit(at, grade, o = {}) { const base = grade === 'gold' ? 40 : grade === 'good' ? 20 : 10; run = grade === 'gold' ? run + 1 : 0; addPts(base); pop(at, (o.text || '+' + base), grade === 'gold' ? '#FFD24A' : grade === 'good' ? '#FFFFFF' : '#DDD'); if (run >= 3) { addPts(50); pop(at, 'רצף +50', '#FFE9A0', true); run = 0; } },
  loss(n, at, label) { addPts(-n); run = 0; pop(at, `−${n} ${label || ''}`, '#FF6A5A', true); return n; },
  bonus(n, why, label) { addPts(n); pop(null, `${label || ''} +${n}`, '#9EF08A'); },
  perfect(text, at) { const d = el('perfect', text); setTimeout(() => d.remove(), 1800); if (at) burst(at.x, at.y, at.z, 30, '#FFD24A'); },
  wait: (s) => new Promise((r) => WAITS.push({ t: s, r })),
  save() {}, sparks(x, y, z, n) { burst(x, y, z, n, '#FFE08A'); }, dust(x, y, z, n) { burst(x, y, z, n, '#D8CFBF'); }, shake() {},
  play() {}, kohen() {}, haptic(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* */ } },
  sfx: { get context() { return actx; }, muted: false },
  stages: { hero: { place() {} } }, acting: () => !!act, view: {},
  end(res) { endAct(res); },
};
window.__LAB = { X, get act() { return act; }, get M() { return M; }, THREE };
mats14(X);
function endAct(res) {
  const a = act; act = null; try { a && a.end && a.end(res); } catch (e) { /* */ }
  addPts([0, 50, 100, 200][res.stars | 0] || 0);
  const card = el('card', `<h3>${'★'.repeat(res.stars | 0)}${'☆'.repeat(3 - (res.stars | 0))}</h3><div>${Math.round((res.q || 0) * 100)}% · ${total} נקודות</div><button data-a="again">שוב</button><button data-a="next">רמה הבאה</button>`);
  card.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; card.remove(); const lv = +cur.slice(-1); go(b.dataset.a === 'next' ? cur.replace(/\d$/, String(Math.min(3, lv + 1))) : cur); });
  window.__LAB_END = res;
}
function go(id) {
  if (act) { try { act.end({}); } catch (e) { /* */ } act = null; }
  for (let i = root.children.length - 1; i >= 0; i--) root.remove(root.children[i]);
  for (const s of sparks) scene.remove(s.m); sparks.length = 0;
  cur = id; total = 0; addPts(0); window.__LAB_END = null;
  const k = id.replace(/\d$/, ''), A = ACTS[k]; if (!A) { line('אין עבודה כזאת: ' + id, 0); return; }
  M = createH137(null);
  const m = M.autoTo((x) => x.id === id) || { k, id, lv: +id.slice(-1) || 1, work: k };
  if (A.prepare) A.prepare(m, X);
  if (A.scene) A.scene(X, root);
  act = A.make(m, X); act.t = 0; act.begin && act.begin();
  document.querySelectorAll('.lab-ui.lv button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
}
// the level buttons
export function mount(list) {
  const bar = el('lv', list.map((id) => `<button data-id="${id}">${id.replace(/\d$/, (d) => ' ' + d)}</button>`).join(''));
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { location.hash = b.dataset.id; go(b.dataset.id); } });
  const h = (location.hash || '').replace('#', ''); go(list.includes(h) ? h : list[0]);
}
// the pointers: the first down is the act's primary (as the director passes it); the rest the act's fingers take from the window
let primary = null;
const cv = renderer.domElement; cv.style.touchAction = 'none';
cv.addEventListener('contextmenu', (e) => e.preventDefault());
cv.addEventListener('pointerdown', (e) => { if (!act || primary != null) return; if (act.wants && !act.wants({ x: e.clientX, y: e.clientY, button: e.button })) return; primary = e.pointerId; act.down && act.down({ id: e.pointerId, x: e.clientX, y: e.clientY, type: e.pointerType, button: e.button }); }, true);
addEventListener('pointermove', (e) => { if (act && e.pointerId === primary) act.move && act.move({ id: e.pointerId, x: e.clientX, y: e.clientY }); }, true);
const upH = (e) => { if (e.pointerId !== primary) return; primary = null; if (act) act.up && act.up({ id: e.pointerId, x: e.clientX, y: e.clientY }); };
addEventListener('pointerup', upH, true); addEventListener('pointercancel', upH, true);
let last = performance.now();
function frame(ms) {
  const dt = Math.min(0.1, (ms - last) / 1000); last = ms;
  for (let i = WAITS.length - 1; i >= 0; i--) { WAITS[i].t -= dt; if (WAITS[i].t <= 0) { const w = WAITS.splice(i, 1)[0]; w.r(); } }
  camStep(dt);
  if (act) { act.t += dt; try { act.update(dt); } catch (e) { console.error(e); } }
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t += dt; s.m.userData.v.y -= 9 * dt; s.m.position.addScaledVector(s.m.userData.v, dt); if (s.t > 1) { scene.remove(s.m); sparks.splice(i, 1); } }
  if (handAt) { const p = scr(handAt.x, handAt.y, handAt.z); handEl.style.left = p.x + 'px'; handEl.style.top = (p.y + 10 + 8 * Math.sin(ms / 200)) + 'px'; }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
void PLAN; void UI;
