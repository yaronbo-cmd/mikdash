// WORKSA22 lab: a plain night/day court, the kit's stage beside a stand-in hero, a stand-in right thumb (.tw-btn: press / tap / drag → hands.js's
// onWork events exactly as src/game/twin.js fires them), and hands.js runInWorld(input 'twin') running the work. Real touch drives it.
import * as THREE from 'three';
import { initWorks } from '../src/avodah/works/craft.js';
import { WORKS } from '../src/avodah/works/index.js';
import { runInWorld } from '../src/game/hands.js';

const Q = new URLSearchParams(location.search), night = Q.get('time') !== 'day';
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false);
const scene = new THREE.Scene(); scene.background = new THREE.Color(night ? '#0E1424' : '#BFD3E6'); scene.fog = new THREE.Fog(night ? '#0E1424' : '#D9E2EA', 40, 160);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 500);
scene.add(new THREE.HemisphereLight(night ? '#3A4A7A' : '#C8D6E8', night ? '#1A1812' : '#BCA887', night ? 0.4 : 0.8));
const sun = new THREE.DirectionalLight(night ? '#8FA3D8' : '#FFF4E4', night ? 0.3 : 2.4); sun.position.set(40, 80, 30); scene.add(sun);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: night ? '#6E6657' : '#D9CDB4', roughness: 0.95 })); scene.add(floor);
const hero = { x: 0, y: 0, z: 0, yaw: Math.PI };
const hm = new THREE.Group(); hm.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.2, 10), new THREE.MeshStandardMaterial({ color: '#C9B58A' })).translateY(0.6), new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: '#D3A27A' })).translateY(1.4)); scene.add(hm);
camera.position.set(0, 6.2, 9.4); camera.lookAt(0, 1.2, -4); camera.updateMatrixWorld();
const stock = { wood: 0, add(k, n) { this[k] = (this[k] || 0) + n; this.log = (this.log || []).concat([[k, n]]); } };
initWorks({ scene, camera, ground: () => 0, hero: () => hero, stock });
const ctx = { scene, camera, hero: () => hero, stock };
// the stand-in right thumb (twin.js's events: press, tap | down/move/up)
const listeners = new Set(), btn = document.getElementById('btn'); let bt = null;
const fire = (e) => { for (const f of [...listeners]) f(e); };
btn.addEventListener('pointerdown', (ev) => { ev.preventDefault(); btn.setPointerCapture && btn.setPointerCapture(ev.pointerId); bt = { x: ev.clientX, y: ev.clientY, dx: 0, dy: 0, drag: false, t: performance.now() }; fire({ t: 'press', down: true }); window.__LAB.downs++; });
btn.addEventListener('pointermove', (ev) => { if (!bt) return; bt.dx = ev.clientX - bt.x; bt.dy = ev.clientY - bt.y; if (!bt.drag && Math.hypot(bt.dx, bt.dy) > 18) { bt.drag = true; fire({ t: 'down', dx: 0, dy: 0 }); } if (bt.drag) fire({ t: 'move', dx: bt.dx, dy: bt.dy }); });
const rel = (ev) => { if (!bt) return; const b = bt; bt = null; fire({ t: 'press', down: false }); fire(b.drag ? { t: 'up', dx: b.dx, dy: b.dy } : { t: 'tap', grade: 'good' }); };
btn.addEventListener('pointerup', rel); btn.addEventListener('pointercancel', rel);
const T = { on: true, onWork: (f) => { listeners.add(f); return () => listeners.delete(f); }, btnPos: () => { const r = btn.getBoundingClientRect(); return { x: r.left + 40, y: r.top }; } };
const coachEl = document.getElementById('coach');
const ui = { root: document.body, coachText: '', coach(pt, text) { this.coachText = text || ''; coachEl.textContent = this.coachText; coachEl.style.display = this.coachText ? 'block' : 'none'; (window.__LAB.coaches = window.__LAB.coaches || []).push(this.coachText); }, float(t, x, y) { const d = document.createElement('div'); d.className = 'lab-float'; d.textContent = t; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1200); } };
const view = { project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(camera); return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, on: v.z < 1 }; } };
window.__BH_PARTS = { juice: { hit(kind, o) { (window.__LAB.hits = window.__LAB.hits || []).push({ text: o.text, pts: o.pts, q: o.quality, grade: o.grade }); const p = o.at ? view.project(o.at.x, o.at.y, o.at.z) : { x: 400, y: 200 }; ui.float(o.text, p.x, p.y); } }, score: { add(p, w) { window.__LAB.bonus = (window.__LAB.bonus || 0) + p; (window.__LAB.bonuses = window.__LAB.bonuses || []).push([p, w]); } } };
let raf = 0; const loop = () => { renderer.render(scene, camera); raf = requestAnimationFrame(loop); }; loop();
window.__LAB = {
  THREE, scene, camera, hero, stock, WORKS, downs: 0, result: null, running: null, events: [],
  run(id, o = {}) {
    const W = WORKS[id], M = W.model({ level: 0 }); this.M = M; this.result = null; this.coaches = []; this.hits = [];
    this.running = runInWorld(M, { kind: id, site: 'lab', ui, sfx: { play() {}, haptic() {} }, hooks: W.hooks(), twin: T, input: 'twin', view, heroPos: () => ({ x: hero.x, y: hero.y, z: hero.z }), world: {}, fact: o.noFact ? null : W.fact, onEvent: (t, d) => this.events.push([t, d && d.at || d && d.kind]) }).then((r) => { this.result = r; return r; });
    return true;
  },
  state(id) { const W = WORKS[id]; return W.state(); },
  render() { renderer.render(scene, camera); },
  resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
  btnCenter() { const r = btn.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
  screen(a, s, y) { const k = WORKS.pen && null; return null; },
  cam(px, py, pz, tx, ty, tz) { camera.position.set(px, py, pz); camera.lookAt(tx, ty, tz); camera.updateMatrixWorld(); },
};
window.__LAB.ready = true;
