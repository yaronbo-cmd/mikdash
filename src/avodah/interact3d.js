/* ─────────────────────────────────────────────────────────────────────────────
 * interact3d.js: world-anchored touch targets for the mini-games — the player acts IN the 3D Temple.
 *
 *   const T = createInteract3D({ world: W, wrap, fast });   // null when the world cannot project (world = {}, tests)
 *   T.targets([{ key, at: [x, y, z] | () => [x, y, z], label, onTap, onHold(down), r }]);   // glowing rings over the world
 *                          (`at` as a function follows a moving point: a part of an animal as it is drawn)
 *   T.frame(shot, ms)      // a camera framing for the step (a places.SHOTS key or {p, t}); the docked card stays below
 *   T.focus(vesselId, ms)  // the sanctuary's own framing of a vessel (menorah, gold-altar, shulchan, heichal-doors …)
 *   T.clear()              // back to the illustrated card (the SVG fallback)
 *   T.el(key)              // the target's element (the harness solvers press it)
 *
 * No raycasting: every target is a DOM button whose position is world.project(x, y, z) each frame, so it works on
 * phones, under a paused loop (tests) and with any renderer. Touch areas are 60 px; the ring is drawn inside it.
 * While targets are shown the card docks at the bottom as a compact bar (title, hint, buttons) and the camera's
 * view offset (main.js) keeps what it looks at above it. Everything falls back to the SVG when a call is missing,
 * and also when a live target stays out of reach (off screen or under the card): the camera first frames all the
 * targets (fit), and if one is still out of reach 3 s later the layer retires for the rest of the game (`alive` = false; the step's onLost runs) and the illustrated card,
 * whose elements carry the same handlers, is played instead — never a stuck step.
 * ──────────────────────────────────────────────────────────────────────────── */
import { ULAM } from '../places.js';

const CSS = `
.av-mg.in3d{background:none;pointer-events:none;place-items:end center;padding:0 8px calc(env(safe-area-inset-bottom,0px) + 8px)}
.av-mg.in3d .av-mg-card{pointer-events:auto;width:min(100%,460px);border-radius:18px;padding:10px 12px 8px;box-shadow:0 -6px 24px rgba(20,14,6,.28)}
.av-mg.in3d .av-play,.av-mg.in3d .av-mg-intro{display:none}
.av-mg.in3d .av-hint{min-height:1.5em;margin-top:4px;font-size:15px}
.av-mg.in3d .av-ctl{margin-top:6px}
.av3d-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.av3d-t{position:absolute;left:0;top:0;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;pointer-events:auto;touch-action:none;
  background:radial-gradient(circle,rgba(255,236,170,.28) 0,rgba(255,214,110,.12) 52%,rgba(255,214,110,0) 70%)!important;border:0!important;will-change:transform;-webkit-tap-highlight-color:transparent}
.av3d-t::before{content:"";position:absolute;inset:14px;border-radius:50%;border:3px solid #FFD66E;box-shadow:0 0 12px 3px rgba(255,190,70,.8),inset 0 0 8px rgba(255,190,70,.5);animation:av3d-pulse 1.3s ease-in-out infinite}
.av3d-t.small{width:52px;height:52px;margin:-26px 0 0 -26px}
.av3d-t.small::before{inset:13px}
.av3d-t.done::before{border-color:#7FD39B;box-shadow:0 0 10px 2px rgba(80,200,120,.7);animation:none}
.av3d-t.dim{opacity:.35}
.av3d-t.off{display:none}
.av3d-t b{position:absolute;top:100%;left:50%;transform:translate(-50%,-4px);white-space:nowrap;font:800 12.5px/1.25 "Heebo",sans-serif;color:#FFF6DA;
  background:rgba(34,24,10,.86);padding:2px 8px 3px;border-radius:9px;box-shadow:0 1px 4px rgba(0,0,0,.35);direction:rtl;pointer-events:none}
.av3d-t.held::before{border-color:#fff;box-shadow:0 0 18px 6px rgba(255,220,120,.95)}
.av3d-t.lr b{left:auto;right:4px;transform:translate(0,-4px)}
.av3d-t.ll b{left:4px;transform:translate(0,-4px)}
@keyframes av3d-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.86);opacity:.75}}
@media (prefers-reduced-motion: reduce){.av3d-t::before{animation:none}}
`;

export function createInteract3D({ world, wrap, fast = false } = {}) {
  if (!world || !wrap || typeof world.project !== 'function') return null;
  const probe = world.project(0, 0, 0);
  if (!probe || typeof probe.x !== 'number' || !Number.isFinite(probe.x)) return null;
  const doc = wrap.ownerDocument || document;
  if (!doc.getElementById('av3d-css')) { const s = doc.createElement('style'); s.id = 'av3d-css'; s.textContent = CSS; doc.head.appendChild(s); }
  const layer = doc.createElement('div');
  layer.className = 'av3d-layer';
  wrap.insertBefore(layer, wrap.firstChild);
  let list = [], live = true, raf = 0, dead = false, lostSince = 0, graceUntil = 0, onLost = null, fitted = false, lastPlace = 0;
  const byKey = new Map();
  const LOST_MS = 3000;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  /** a target's world point: `at` is [x, y, z], or a function returning one each frame (a part of a moving animal) */
  const atOf = (t) => { let a = null; try { a = typeof t.at === 'function' ? t.at() : t.at; } catch (e) { a = null; } return Array.isArray(a) && a.length === 3 && a.every(Number.isFinite) ? a : null; };
  function place() {
    // a target is reachable when it is on screen and above the docked card (the card takes the taps below its top)
    let top = innerHeight;
    const card = wrap.classList.contains('in3d') ? wrap.querySelector('.av-mg-card') : null;
    if (card) { const r = card.getBoundingClientRect(); if (r.height > 0) top = r.top; }
    let lost = false;
    for (const t of list) {
      let p = null;
      const a = atOf(t);
      try { p = a ? world.project(a[0], a[1], a[2]) : null; } catch (e) { p = null; }
      const on = !!(p && p.on !== false && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > 8 && p.y > 8 && p.x < innerWidth - 8 && p.y < top - 6);
      t.el.classList.toggle('off', !on);
      if (on) {
        t.el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`;
        // a label near a side of the screen hangs inward, so it is never cut off (e.g. "הספל המזרחי" at the right edge)
        if (t.label) { t.el.classList.toggle('lr', p.x > innerWidth - 74); t.el.classList.toggle('ll', p.x < 74); }
      }
      else if (!t.el.classList.contains('done') && !t.el.classList.contains('dim')) lost = true;
    }
    const n = now();
    // a stall (the main thread blocked: a heavy frame, a shader compile, a slow renderer) is not time out of reach: the
    // camera may not have moved meanwhile, so the count starts again, with a short grace for the next frames
    if (lastPlace && n - lastPlace > 400) { lostSince = 0; graceUntil = Math.max(graceUntil, n + 800); }
    lastPlace = n;
    if (!lost || n < graceUntil) lostSince = 0;
    else if (!lostSince) lostSince = n;
    else if (!fitted && n - lostSince > 500) { fitted = true; lostSince = 0; fit(); }   // first: frame them all
    else if (n - lostSince > LOST_MS) retire();                                        // then: the illustrated card
  }
  /** a camera framing that holds every live target above the card: keep the view direction (but look down between
   *  30° and 65°), and step back until their bounding sphere fits the narrower field of view */
  function fit(ms = 900, o = {}) {
    const cam = world.camera;
    const pts = o.pts || list.filter((t) => !t.el.classList.contains('done') && !t.el.classList.contains('dim')).map(atOf).filter(Boolean);
    if (!cam || !world.look || !pts.length) return;
    const C = [0, 1, 2].map((i) => pts.reduce((a, p) => a + p[i], 0) / pts.length);
    // inside the house (west of the Ulam's front, within its breadth) the sanctuary's own focus poses frame the vessels: no
    // free camera there. (The lambs' chamber in the azara's north-west corner is west of the Ulam too, but outside the house.)
    if (C[0] < ULAM.x1 && Math.abs(C[2]) < 36) return;
    const R = Math.max(1.2, ...pts.map((p) => Math.hypot(p[0] - C[0], p[1] - C[1], p[2] - C[2]))) + 1.2;
    // the view direction: the one asked for (o.dir: from the subject toward the camera), else the camera's own
    let dx = o.dir ? -o.dir[0] : C[0] - cam.position.x, dz = o.dir ? -o.dir[2] : C[2] - cam.position.z;
    const h = Math.hypot(dx, dz) || 1; dx /= h; dz /= h;
    const elDeg = o.dir ? (Math.atan2(o.dir[1], Math.hypot(o.dir[0], o.dir[2])) * 180) / Math.PI : (Math.atan2(cam.position.y - C[1], h) * 180) / Math.PI;
    const el = Math.min(65, Math.max(30, elDeg)) * (Math.PI / 180);
    const v = ((cam.fov || 50) * Math.PI) / 180, asp = innerWidth / Math.max(1, innerHeight);
    const f = Math.min(v * 0.7, 2 * Math.atan(Math.tan(v / 2) * asp));                 // the card covers the bottom
    const d = Math.max(7, (R / Math.sin(f / 2)) * 1.15);
    const p = [C[0] - dx * d * Math.cos(el), C[1] + d * Math.sin(el), C[2] - dz * d * Math.cos(el)];
    graceUntil = now() + (fast ? 200 : ms) + 1500;
    try { world.look({ p, t: C }, fast ? 200 : ms); } catch (e) { /* ignore */ }
  }
  /** a live target stayed out of reach: the illustrated card takes over for the rest of the game */
  function retire() {
    if (dead) return;
    dead = true;
    const keys = list.filter((t) => t.el.classList.contains('off')).map((t) => t.key).join(',');
    const cb = onLost;
    api.clear();
    try { console.warn('[avodah] 3D target out of reach → the illustrated card:', keys); } catch (e) { /* ignore */ }
    if (cb) { try { cb(); } catch (e) { /* ignore */ } }
  }
  function loop() { if (!live) return; place(); raf = requestAnimationFrame(loop); }

  const api = {
    /** show targets (replaces the current ones); the card becomes the compact bottom bar.
     *  opts.onLost: what the step does if the layer retires (a step with no SVG twin moves on) */
    targets(defs, opts = {}) {
      if (dead) return api;
      api.clear(true);
      onLost = opts.onLost || null;
      fitted = false;
      graceUntil = Math.max(graceUntil, now() + 1200);
      wrap.classList.add('in3d');
      for (const d of defs) {
        const b = doc.createElement('button');
        b.type = 'button';
        b.className = 'av3d-t' + (d.small ? ' small' : '');
        b.dataset.key = d.key;
        b.setAttribute('aria-label', d.label || d.key);
        if (d.label) { const l = doc.createElement('b'); l.textContent = d.label; b.appendChild(l); }
        if (d.onHold) {
          b.dataset.hold = '1';
          const on = (e) => { if (e && e.cancelable) e.preventDefault(); b.classList.add('held'); d.onHold(true); };
          const off = () => { if (!b.classList.contains('held')) return; b.classList.remove('held'); d.onHold(false); };
          b.addEventListener('pointerdown', on);
          for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, off);
        } else {
          b.addEventListener('click', (e) => { e.preventDefault(); if (d.onTap) d.onTap(b); });
        }
        layer.appendChild(b);
        const t = { ...d, el: b };
        list.push(t); byKey.set(d.key, t);
      }
      place();
      if (!raf) { live = true; raf = requestAnimationFrame(loop); }
      return api;
    },
    /** mark a target as done (a green ring) or remove it */
    done(key, remove = false) { const t = byKey.get(key); if (!t) return; if (remove) { t.el.remove(); list = list.filter((x) => x !== t); byKey.delete(key); } else t.el.classList.add('done'); },
    dim(key, on = true) { const t = byKey.get(key); if (t) t.el.classList.toggle('dim', on); },
    el(key) { const t = byKey.get(key); return t && !dead && !t.el.classList.contains('off') ? t.el : null; },
    has(key) { return byKey.has(key); },
    /** back to the illustrated card; keep=true keeps the 3D mode (targets replaced next) */
    clear(keep = false) {
      for (const t of list) t.el.remove();
      list = []; byKey.clear(); lostSince = 0;
      if (!keep) onLost = null;
      if (!keep) { wrap.classList.remove('in3d'); cancelAnimationFrame(raf); raf = 0; }
    },
    /** frame these world points (or the live targets) above the card, seen from `dir` (from them toward the camera) */
    fit(ms = 1100, o = {}) { if (!dead) { fitted = true; fit(ms, o); } return api; },
    frame(shot, ms = 1200) { graceUntil = now() + (fast ? 200 : ms) + 1500; return world.look ? world.look(shot, fast ? Math.min(ms, 200) : ms) : Promise.resolve(false); },
    // (the sanctuary's focus ends on the wall clock with a backstop since wave 3 — docs/SCENES.md §4 — so a 2.5 s margin is enough)
    focus(id, ms = 1200) { graceUntil = now() + (fast ? 400 : ms) + 2500; return world.sanctWait ? world.sanctWait('focus', [id, fast ? 0 : ms], (fast ? 400 : ms) + 2500) : Promise.resolve(false); },
    end() { api.clear(); live = false; layer.remove(); },
    get active() { return list.length > 0; },
    /** false once the layer retired (a target out of reach): the game goes on in the illustrated card */
    get alive() { return !dead; },
  };
  return api;
}

/** The seven lamps are 0.4 amah apart: too close for a finger. Their targets fan out around the Menorah's centre
 *  (×1.9 along the row) and sit a little above the flames, so each ring still points at its own lamp. */
export function spreadLamps(pos, k = 1.9, lift = 0.45) {
  if (!Array.isArray(pos) || pos.length !== 7) return pos;
  const c = pos[3];
  return pos.map((p) => [c[0] + (p[0] - c[0]) * k, p[1] + lift, c[2] + (p[2] - c[2]) * k]);
}
