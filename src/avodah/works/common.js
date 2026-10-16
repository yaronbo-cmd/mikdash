/* ── worksb22 ── common.js — what the four works of the day's second half share (WORKSB22; docs/WAVE22-BRIEF.md).
 *   tapModel(o)         a work's model on acts.js: every right tap is one act (hit), N hits finish it; taps alone always finish;
 *                       a miss never subtracts (it is "עוד קצת"). Same fields as fable20's workModel, so hands.js / ENGINE22 read it as one.
 *   propKit(THREE, scene, name, N)   one lit and one unlit instanced box mesh (the world craft's props; no images, nothing per frame)
 *   workBase(ctx, id, spec)          the contract object { id, model, begin, touch, update, end, box, on, tick } around a spec
 *   chips: DOM tap targets projected on the world (the same idea as interact3d.js, 52-px at least, RTL), the station bar, the "+N" pop,
 *          the one-line hint and the mentor line (after the end only — draft + exact source).
 * ctx (all optional; a missing part is a no-op):
 *   { THREE, scene, camera, layer, project(x,y,z)->{x,y}|null, av, actors, animals, ground, hero:{x,y,z}, stock, emit, water, say(text, o),
 *     acts(M, at, label), sfx(name), buzz(ms) }
 * Rules: never a Divine Name; no gore; no gambling; a wrong send waits without penalty; the kid finishes every work by taps alone. */
import { act as caAct, bonus as caBonus, actsQ as caQ } from '../../game/minigames/acts.js';
import { epiMs } from './hero26.js';   // ── hero26 ── ── /hero26 ──
import { claim as claim28, pinTops as pinTops28 } from '../../light28.js';   // ── light28 ── ── /light28 ──

export const WORK_N = [6, 8, 10, 12, 12];
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

/** the model of a tap work. hit(q, o): q 0 ok · 1 good · 2 gold (acts.js); the n-th hit ends it */
export function tapModel({ id = 'work', n = 6, level = 0, coach = '', bonusAt = 0 } = {}) {
  const L = clamp(level | 0, 0, 4);
  const M = {
    kind: 'work', game: 'work', job: id, juice: true, twinOnly: true, level: L, n, i: 0, k: 0, phase: 'work', t: 0, pt: 0, fx: [], acts: [], pts: 0, done: false, progress: 0,
    queue: [], pending: 0, coach: coach || 'הקישו על מה שמסומן — כל הקשה היא פעולה', soft: 0, autoFn: null,
    hit(q, o) {
      if (this.phase !== 'work') return null;
      const a = caAct(this, q, { x: 0.5, y: 0.35, ...(o || {}) });
      if (a.q === 0) this.soft++;
      this.i++; this.k = this.i; this.progress = Math.round(100 * this.i / this.n);
      if (this.i >= this.n) {
        if (!this.soft) caBonus(this, 60, 'עבודה נקייה');
        this.phase = 'end'; this.pt = 0; this.fx.push({ sfx: 'chime', o: { combo: 6 } });
      }
      return a;
    },
    step(dt) { if (this.done) return; this.t += dt; this.pt += dt; if (this.phase === 'end' && this.pt > 1.1) { this.done = true; this.phase = 'done'; this.progress = 100; } },
    /** the right thumb's button / a bare tap: the next right action (the work's own autopilot) */
    tap() { if (this.phase === 'work' && typeof this.autoFn === 'function') this.autoFn(); },
    twinTap() { this.tap(); },
    touch() {}, drag() {}, press() {}, cue() { return null; }, auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length > 0, score: this.pts | 0, acts: this.i }; },
  };
  return M;
}

/** instanced boxes: put() all of a frame's pieces between clear() and flush(). A hex starting with '!' is unlit. */
export function propKit(THREE, scene, name, N = 96) {
  const mk = (basic) => {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), basic ? new THREE.MeshBasicMaterial({ color: '#FFFFFF' }) : new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.85 }), N);
    m.name = name + (basic ? '-glow' : ''); m.frustumCulled = false; m.visible = false; m.count = 0; m.castShadow = !basic; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const c = new THREE.Color(1, 1, 1); for (let i = 0; i < N; i++) m.setColorAt(i, c);
    scene.add(m); return m;
  };
  const lit = mk(false), glow = mk(true);
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), Mx = new THREE.Matrix4(), C = new THREE.Color();
  let a = 0, b = 0;
  const kit = {
    lit, glow, name,
    clear() { a = 0; b = 0; },
    put(x, y, z, w, h, d, yaw, hex, pitch = 0, roll = 0) {
      E.set(pitch, yaw || 0, roll, 'YXZ'); Q.setFromEuler(E); V.set(x, y, z); S.set(w, h, d); Mx.compose(V, Q, S);
      if (hex.charCodeAt(0) === 33) { if (b >= N) return; glow.setMatrixAt(b, Mx); glow.setColorAt(b, C.set(hex.slice(1))); b++; return; }
      if (a >= N) return; lit.setMatrixAt(a, Mx); lit.setColorAt(a, C.set(hex)); a++;
    },
    flush() {
      lit.count = a; lit.visible = a > 0; lit.instanceMatrix.needsUpdate = true; if (lit.instanceColor) lit.instanceColor.needsUpdate = true;
      glow.count = b; glow.visible = b > 0; glow.instanceMatrix.needsUpdate = true; if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
    },
    hide() { a = b = 0; lit.visible = glow.visible = false; lit.count = glow.count = 0; },
    get count() { return a + b; },
    dispose() { for (const m of [lit, glow]) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); m.material.dispose(); if (m.dispose) m.dispose(); } },
  };
  return kit;
}

const CSS = `
.wb-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:7;direction:rtl;font-family:"Heebo",sans-serif}
.wb-t{position:absolute;left:0;top:0;min-width:52px;min-height:52px;margin:-26px 0 0 -26px;box-sizing:border-box;border-radius:26px;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
  border:3px solid #FFD66E;background:rgba(34,24,10,.8);color:#FFF6DA;font:800 12.5px/1.15 "Heebo",sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px 8px;white-space:nowrap;will-change:transform;cursor:pointer}
.wb-t .ic{font-size:26px;line-height:1.05}
.wb-t.sel{border-color:#fff;box-shadow:0 0 0 4px rgba(255,214,110,.85),0 0 16px 4px rgba(255,214,110,.7)}
.wb-t.done{opacity:.6;border-color:#7FD39B}
.wb-t.off{display:none}
.wb-t.st{border-radius:14px;border-color:#9ED6FF;min-height:48px;margin:-24px 0 0 -40px}
.wb-t.shake{animation:wb-shake .38s}
@keyframes wb-shake{0%,100%{translate:0 0}25%{translate:-6px 0}75%{translate:6px 0}}
.wb-bar{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);display:flex;gap:6px;pointer-events:none;max-width:calc(100% - 8px);direction:rtl}
.wb-bar button,.wb-btn{pointer-events:auto;touch-action:manipulation;min-height:52px;min-width:52px;border-radius:14px;border:3px solid #FFD66E;background:rgba(34,24,10,.86);color:#FFF6DA;font:800 13px/1.15 "Heebo",sans-serif;padding:3px 9px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer}
.wb-bar button .ic{font-size:22px;line-height:1.05}
.wb-bar button.on{border-color:#fff;box-shadow:0 0 0 3px rgba(255,214,110,.8)}
.wb-bar button.done{opacity:.55;border-color:#7FD39B}
.wb-say{position:absolute;left:50%;top:62px;transform:translateX(-50%);max-width:min(94%,520px);box-sizing:border-box;text-align:center;pointer-events:none;background:rgba(34,24,10,.88);color:#FFF6DA;font:700 14px/1.35 "Heebo",sans-serif;padding:6px 14px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.wb-say small{display:block;font:600 11.5px/1.3 "Heebo",sans-serif;color:#FFD66E;margin-top:2px}
.wb-say.off{display:none}
.wb-pop{position:absolute;left:0;top:0;pointer-events:none;font:900 22px/1 "Heebo",sans-serif;color:#FFE08A;text-shadow:0 2px 0 #3A2A12,0 0 8px rgba(0,0,0,.5);animation:wb-rise 1.1s ease-out forwards;white-space:nowrap}
@keyframes wb-rise{0%{opacity:0;margin-top:0}12%{opacity:1}100%{opacity:0;margin-top:-54px}}
.wb-count{position:absolute;right:10px;top:64px;pointer-events:none;background:rgba(34,24,10,.85);color:#FFF6DA;font:900 20px/1 "Heebo",sans-serif;padding:6px 12px;border-radius:12px;direction:rtl}
.wb-count small{font:700 11px/1 "Heebo",sans-serif;display:block;color:#FFD66E;margin-top:2px}
@media (prefers-reduced-motion: reduce){.wb-t.shake,.wb-pop{animation:none}}
`;

/** the default projector: camera + the layer's CSS size → { x, y } in CSS px, or null behind the camera / far outside */
export function makeProject(THREE, camera, layer) {
  const v = new THREE.Vector3();
  return (x, y, z) => {
    v.set(x, y, z).project(camera);
    if (!(v.z > -1 && v.z < 1)) return null;
    const w = layer.clientWidth || 800, h = layer.clientHeight || 400;
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  };
}

/** a DOM kit for one work: tap chips in the world, a bar of buttons, a hint line, "+N" pops, a counter */
export function makeUi(ctx, id) {
  const doc = (ctx.layer && ctx.layer.ownerDocument) || (typeof document !== 'undefined' ? document : null);
  if (!doc) return null;
  if (!doc.getElementById('wb-css')) { const s = doc.createElement('style'); s.id = 'wb-css'; s.textContent = CSS; doc.head.appendChild(s); }
  const host = ctx.layer || doc.body;
  for (const old of host.querySelectorAll(':scope > .wb-layer')) old.remove();   // (a lingering mentor line of the work before)
  const layer = doc.createElement('div'); layer.className = 'wb-layer'; layer.dataset.work = id; host.appendChild(layer);
  const project = ctx.project || (ctx.THREE && ctx.camera ? makeProject(ctx.THREE, ctx.camera, layer) : () => null);
  const chips = new Map();
  let bar = null, say = null, count = null, sayT = 0;
  const ui = {
    layer, doc,
    /** a chip over a world point: at() → [x,y,z]; html: icon + label */
    chip(key, { at, icon = '', label = '', cls = '', onTap }) {
      let c = chips.get(key);
      if (!c) { const el = doc.createElement('button'); el.type = 'button'; el.className = 'wb-t ' + cls; el.dataset.key = key; layer.appendChild(el); c = { el, at, onTap: null, last: '' }; chips.set(key, c);
        el.addEventListener('click', (e) => { e.stopPropagation(); const f = c.onTap; if (f) f(key); }); }
      c.at = at; c.onTap = onTap;
      const html = (icon ? `<span class="ic">${icon}</span>` : '') + (label ? `<span>${label}</span>` : '');
      if (html !== c.last) { c.el.innerHTML = html; c.last = html; }
      if (cls !== c.cls) { c.el.className = 'wb-t ' + cls; c.cls = cls; }
      return c.el;
    },
    chipCls(key, cls, on) { const c = chips.get(key); if (c) c.el.classList.toggle(cls, !!on); },
    drop(key) { const c = chips.get(key); if (c) { c.el.remove(); chips.delete(key); } },
    dropAll(prefix) { for (const k of [...chips.keys()]) if (!prefix || k.startsWith(prefix)) ui.drop(k); },
    el(key) { const c = chips.get(key); return c ? c.el : null; },
    keys() { return [...chips.keys()]; },
    /** reposition every chip (call each frame) */
    frame() {
      for (const c of chips.values()) {
        const p = c.at ? c.at() : null; const s = p ? project(p[0], p[1], p[2]) : null;
        if (!s || s.x < -40 || s.y < -40 || s.x > (layer.clientWidth || 800) + 40 || s.y > (layer.clientHeight || 400) + 40) { c.el.classList.add('off'); continue; }
        c.el.classList.remove('off');
        // ── light28 ── the chip in the label zone, off the labels before it (its size measured once per content: no layout per frame)
        if (!(c.w28 > 0) || c.k28 !== c.last) { c.k28 = c.last; c.w28 = c.el.offsetWidth || 52; c.h28 = c.el.offsetHeight || 52; }
        const q = claim28(s.x, s.y, c.w28, c.h28, 'chip');
        // ── /light28 ──
        c.el.style.transform = `translate(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px)`;
      }
    },
    /** the bar of big buttons at the foot: [{ key, icon, label, onTap }] */
    setBar(list) {
      if (!bar) { bar = doc.createElement('div'); bar.className = 'wb-bar'; layer.appendChild(bar); }
      bar.innerHTML = '';
      for (const b of list) { const el = doc.createElement('button'); el.type = 'button'; el.dataset.key = b.key; el.innerHTML = (b.icon ? `<span class="ic">${b.icon}</span>` : '') + `<span>${b.label}</span>`; el.addEventListener('click', (e) => { e.stopPropagation(); b.onTap(b.key); }); bar.appendChild(el); }
      return bar;
    },
    clearBar() { if (bar) { bar.remove(); bar = null; } },
    barEl(key) { return bar ? bar.querySelector(`[data-key="${key}"]`) : null; },
    barCls(key, cls, on) { const e = ui.barEl(key); if (e) e.classList.toggle(cls, !!on); },
    /** the one-line hint (before) or the mentor line (after: with its draft source) */
    say(text, o = {}) {
      if (!say) { say = doc.createElement('div'); say.className = 'wb-say off'; say.dataset.role = 'say'; layer.appendChild(say); }
      if (o.mentor && ctx.say) { try { ctx.say(text, o); } catch (e) { /* */ } return; }   // (the host's own mentor line: the source AFTER the end)
      if (!text) { say.classList.add('off'); say.textContent = ''; return; }
      say.innerHTML = ''; const t = doc.createElement('span'); t.textContent = text; say.appendChild(t);
      if (o.src) { const s = doc.createElement('small'); s.textContent = (o.draft === false ? '' : 'טיוטה · ') + o.src; say.appendChild(s); }
      say.dataset.src = o.src || ''; say.classList.remove('off');
      clearTimeout(sayT); if (o.ms) sayT = setTimeout(() => say && say.classList.add('off'), o.ms);
    },
    count(big, small) {
      if (big == null) { if (count) { count.remove(); count = null; } return; }
      if (!count) { count = doc.createElement('div'); count.className = 'wb-count'; count.dataset.role = 'count'; layer.appendChild(count); }
      count.innerHTML = `${big}<small>${small || ''}</small>`;
    },
    /** a "+N" born at a world point */
    pop(text, at) {
      const s = at ? project(at[0], at[1], at[2]) : null; const el = doc.createElement('div'); el.className = 'wb-pop'; el.textContent = text;
      el.style.left = ((s ? s.x : (layer.clientWidth || 800) / 2) - 20).toFixed(0) + 'px'; el.style.top = ((s ? s.y : (layer.clientHeight || 400) / 2)).toFixed(0) + 'px';
      layer.appendChild(el); setTimeout(() => el.remove(), 1200);
    },
    /** a wrong tap: the chip shakes (no penalty) */
    shake(key) { const e = ui.el(key) || ui.barEl(key); if (!e) return; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); setTimeout(() => e.classList.remove('shake'), 420); },
    /** the work is over: its chips, bar and counter go at once; only the mentor line stays a while */
    settle() { for (const k of [...chips.keys()]) ui.drop(k); if (bar) { bar.remove(); bar = null; } if (count) { count.remove(); count = null; } },
    project,
    destroy() { clearTimeout(sayT); layer.remove(); chips.clear(); bar = say = count = null; },
  };
  return ui;
}

/** the act's "+N" and sound: through ctx.acts (the game's juice) when the host gave one, else the work's own pop; the act entries leave M.fx either way */
export function drainActs(ctx, ui, M, at, label) {
  if (typeof ctx.acts === 'function') { try { ctx.acts(M, { x: at[0], y: at[1], z: at[2] }, label || ''); } catch (e) { /* */ } return; }
  for (let i = M.fx.length - 1; i >= 0; i--) {
    const f = M.fx[i];
    if (f && f.act) { M.fx.splice(i, 1); const a = f.act; if (ui) ui.pop(`+${a.pts}${a.say ? ' ' + a.say : ''}`, at); if (ctx.sfx) { try { ctx.sfx(a.q >= 2 ? 'perfect' : a.q ? 'good' : 'soft'); } catch (e) { /* */ } } }
    else if (f && f.bonus) { M.fx.splice(i, 1); if (ui) ui.pop(`+${f.bonus.pts} ${f.bonus.say}`, [at[0], at[1] + 1.2, at[2]]); }
  }
}

/** is the point in the camera's sight (nothing of the world between)? once per candidate, at the begin */
function seen(ctx, x, y, z) {
  try {
    const TH = ctx.THREE, cam = ctx.camera, scene = ctx.scene; if (!TH || !cam || !scene) return true;
    const rc = seen.rc || (seen.rc = new TH.Raycaster()), a = new TH.Vector3(x, y, z), d0 = new TH.Vector3().copy(a).sub(cam.position), d = d0.length(); d0.normalize();
    rc.set(cam.position, d0); rc.far = d - 0.8; rc.camera = cam;
    const hits = []; rc.intersectObjects(scene.children, true, hits);
    for (const h of hits) { const o = h.object; if (!o.visible || o.isSprite || o.isPoints || o.isLine || (o.name && /^(worksb22|actor|items|animal|blob|hero)/.test(o.name)) || (o.material && o.material.transparent && o.material.opacity < 0.5)) continue; return false; }
    return true;
  } catch (e) { return true; }
}
/** a free spot beside the hero for a piece with the footprint o.foot = [a0, a1, s0, s1] (amot away from him, across): the best of six directions
 *  and three distances — the footprint on free, flat floor and its middle in the camera's sight; o.at overrides */
export function sideSpot(ctx, o = {}) {
  if (o.at) { const [x, z] = o.at; const y = ctx.ground ? ctx.ground(x, z) : 0; const f = o.face || [0, 1]; return { x, y, z, fx: f[0], fz: f[1] }; }
  const h = typeof ctx.hero === 'function' ? ctx.hero() : (ctx.hero || { x: 0, y: 0, z: 0 }), cam = ctx.camera;
  let ax = 0, az = 1, rx = 1, rz = 0;
  if (cam && ctx.THREE) {
    ax = h.x - cam.position.x; az = h.z - cam.position.z; const l = Math.hypot(ax, az) || 1; ax /= l; az /= l;
    const v = new ctx.THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion); rx = v.x; rz = v.z; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
  }
  const foot = o.foot || [0.5, 4.5, -3.5, 3.5], gy = (x, z) => (ctx.ground ? ctx.ground(x, z) : (h.y || 0));
  const dirs = [[-1, 0.15], [1, 0.15], [-0.8, 0.6], [0.8, 0.6], [-0.8, -0.5], [0.8, -0.5]];
  let best = null;
  for (const dist of o.d ? [o.d] : [2.6, 4.2, 6]) for (const [kr, ka] of dirs) {
    let ex = rx * kr + ax * ka, ez = rz * kr + az * ka; const el = Math.hypot(ex, ez) || 1; ex /= el; ez /= el;
    const x = h.x + ex * dist, z = h.z + ez * dist, y0 = gy(x, z);
    let ok = 0, tot = 0, flat = 0;
    for (const a of [foot[0], (foot[0] + foot[1]) / 2, foot[1]]) for (const s of [foot[2], 0, foot[3]]) {
      const px = x + ex * a - ez * s, pz = z + ez * a + ex * s; tot++;
      if (!ctx.free || ctx.free(px, pz, h.x, h.z)) ok++;
      if (Math.abs(gy(px, pz) - y0) < 0.35) flat++;
    }
    let sc = ok / tot * 10 + flat / tot * 4 - (dist - 2.6) * 0.25;
    if (ok === tot && flat === tot) sc += 3;
    if (!best || sc > best.sc) { best = { sc, x, z, ex, ez, y0, full: ok === tot && flat === tot }; if (best.sc >= 16.75 && dist === 2.6) break; }
  }
  // the camera's sight: of the footprint-clean candidates, the best that sees the piece's middle (else the best of all)
  if (best && ctx.THREE && ctx.camera && ctx.scene) {
    const cands = [];
    for (const dist of o.d ? [o.d] : [2.6, 4.2, 6]) for (const [kr, ka] of dirs) {
      let ex = rx * kr + ax * ka, ez = rz * kr + az * ka; const el = Math.hypot(ex, ez) || 1; ex /= el; ez /= el;
      const x = h.x + ex * dist, z = h.z + ez * dist; let ok = 0, tot = 0;
      for (const a of [foot[0], foot[1]]) for (const s of [foot[2], foot[3]]) { const px = x + ex * a - ez * s, pz = z + ez * a + ex * s; tot++; if (!ctx.free || ctx.free(px, pz, h.x, h.z)) ok++; }
      if (ok === tot) cands.push({ x, z, ex, ez, dist });
    }
    cands.sort((p, q) => p.dist - q.dist);
    for (const c of cands.slice(0, 8)) { const mx = c.x + c.ex * (foot[0] + foot[1]) / 2, mz = c.z + c.ez * (foot[0] + foot[1]) / 2; if (seen(ctx, mx, gy(mx, mz) + 1.2, mz)) { best = { x: c.x, z: c.z, ex: c.ex, ez: c.ez }; break; } }
  }
  if (!best) { const ex = -rx, ez = -rz; best = { x: h.x + ex * 2.6, z: h.z + ez * 2.6, ex, ez }; }
  return { x: best.x, y: gy(best.x, best.z), z: best.z, fx: best.ex, fz: best.ez };
}

/** the contract object around a spec:
 *  spec = { id, n(level), coach, build(B, o) -> void (once, at begin: B.ui, B.kit, B.M, B.o), tick(dt, B), end(B, r), at(B) -> [x,y,z], propsFree }  */
export function workBase(ctx, spec) {
  const B = { ctx, id: spec.id, on: false, M: null, ui: null, kit: null, o: {}, t: 0, over: 0, ext: 0, raf: 0, spot: null, ended: false, endT: 0 };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  let last = 0;
  function tick(dt) {
    if (!B.on) return;
    dt = clamp(dt, 0, 0.1); B.t += dt;
    if (B.M) B.M.step(dt);
    try { spec.tick && spec.tick(dt, B); } catch (e) { console.warn('[worksb22]', spec.id, e && e.message); }
    if (B.ended && B.epT0) { B.ep = (now() - B.epT0) / 1000; if (B.M) B.M.ep = B.ep; const A2 = spec.after; if (A2 && typeof A2.draw === 'function') { try { A2.draw(B, B.ep, dt); } catch (e) { /* the work's */ } } }   // ── hero26 ── ── /hero26 ──
    if (B.ui) B.ui.frame();
    if (B.M && B.M.done && !B.ended) finish();
    if (B.ended && !B.o.keep) { B.over -= dt; if (B.over <= 0) teardown(); }
  }
  function loop() { B.raf = 0; if (!B.on) return; const t = now(); if (t - B.ext > 300) tick(Math.min(0.1, (t - last) / 1000)); last = t; B.raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame(loop) : 0; }
  function finish() {
    if (B.ended) return; B.ended = true;
    const r = B.M.result();
    if (B.ui) B.ui.clearBar();
    try { spec.end && spec.end(B, r); } catch (e) { console.warn('[worksb22] end', e && e.message); }
    if (ctx.emit) { try { ctx.emit('workDone', { id: spec.id, ...r }); } catch (e) { /* */ } }
    B.over = 3.2; if (B.onDone) B.onDone(r);
    B.over = Math.max(B.over, W.afterMs / 1000 + 1.6); B.epT0 = now();   // ── hero26 ── (the stage stays through the epilogue and the camera's glide back) ── /hero26 ──
  }
  const W = {
    id: spec.id, B,
    model(o = {}) {
      const L = clamp(o.level | 0, 0, 4);
      const n = o.n > 0 ? o.n | 0 : (typeof spec.n === 'function' ? spec.n(L) : WORK_N[L]);
      return tapModel({ id: spec.id, n, level: L, coach: spec.coach });
    },
    begin(o = {}) {
      if (B.on && B.ended) teardown();   // (the one before still shows its mentor line: it goes)
      if (B.on) return { ok: false, why: 'busy' };
      B.o = o; B.ended = false; B.t = 0; B.over = 0; B.epT0 = 0; B.ep = 0;   // ── hero26 ── ── /hero26 ──
      B.M = o.M || W.model(o); B.M.worldOn = true;
      if (!B.ui) B.ui = makeUi(ctx, spec.id);
      if (!B.ui) return { ok: false, why: 'no-dom' };
      if (spec.kit && ctx.THREE && ctx.scene) { if (!B.kit) B.kit = propKit(ctx.THREE, ctx.scene, 'worksb22-' + spec.id, spec.kit); }
      B.spot = spec.place ? sideSpot(ctx, { ...o, foot: spec.foot }) : null;
      B.on = true; last = now();
      try { spec.build && spec.build(B, o); } catch (e) { console.warn('[worksb22] build', e && e.message); B.on = false; return { ok: false, why: 'build' }; }
      tick(0);
      if (typeof requestAnimationFrame === 'function' && o.selfLoop !== false && ctx.selfLoop !== false) B.raf = requestAnimationFrame(loop);
      const at = spec.at ? spec.at(B) : [0, 0, 0];
      return { ok: true, at: { x: at[0], y: at[1], z: at[2] } };
    },
    touch(down, M) { if (M && typeof M.touch === 'function') M.touch(down); },
    update(M) { B.ext = now(); if (M && M !== B.M) B.M = M; const t = now(); tick(Math.min(0.1, (t - (B.lastExt || t)) / 1000)); B.lastExt = t; return B.on; },
    tick,
    end() { if (!B.on) return false; if (!B.ended) finish(); teardown(); return true; },
    box() { if (!B.on || !B.ui) return null; const w = B.ui.layer.clientWidth || 800, h = B.ui.layer.clientHeight || 400; return { x: w * 0.25, y: h * 0.2, w: w * 0.5, h: h * 0.5 }; },
    on: () => B.on,
    done: () => !!(B.M && B.M.done),
    setOnDone(f) { B.onDone = f; },
    // ── hero26 ── after(ctx, res) → Promise: the epilogue — the stage stays spec.after.ms (or EPILOGUE[id].ms, default 1500) after the last act;
    // spec.after.draw(B, e) is called each frame of it after spec.tick (e = seconds since the end; B.ep too)
    get afterMs() { const A2 = spec.after; return A2 && A2.ms > 0 ? A2.ms : epiMs(spec.id); },
    after(ctx, res) { return new Promise((r) => setTimeout(r, W.afterMs)); },
    // ── /hero26 ──
  };
  function teardown() {
    B.on = false; if (B.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(B.raf); B.raf = 0;
    try { spec.teardown && spec.teardown(B); } catch (e) { /* */ }
    if (B.kit) B.kit.hide();
    if (B.ui) { const u = B.ui; u.settle(); setTimeout(() => u.destroy(), 7000); B.ui = null; }
  }
  W.teardown = teardown;
  return W;
}
// ── /worksb22 ──
