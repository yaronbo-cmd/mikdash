/* ─────────────────────────────────────────────────────────────────────────────
 * world.js: the guarded bridge from the Phase B gameplay to the 3D world (PROJECT.md §12).
 *
 * Every call is feature-detected: a missing object or method is a no-op, a throw is logged once, and a
 * promise is raced against a timeout, so the service always goes on — with `world = {}` too.
 *   world.look(p, t, ms)            camera flight (camera hints: places.SHOTS)
 *   world.setTimeOfDay(k)           dawn | noon | dusk | night
 *   world.sanctuary.*               enter(room) exit() setLamps(levels[7]) setGoldAltar({coals, smoke})
 *                                   setParochot({outer, inner}) setDoors(u) setBread(k) setBezichin(on) highlight(id)
 *                                   focus(id, ms)
 *   world.avodah.*                  kohen(id, opts) → actor, animal(kind, at, opts) → handle, slaughter(animal, at),
 *                                   sprinkle(corner, level), limbs(step), libation(kind), trumpets(), levites(on),
 *                                   blessing(on), bow(on), fire(level), smoke(level), pilgrim(offering), pilgrims(n),
 *                                   birdOffering(kind), pens.fill(n), lambsChamber.count(n)
 *   wave 4 (docs/SCENES.md §4):     sanctuary.anchor(id) → anchor(id); lambsChamber.positions() → lambs();
 *                                   lambsChamber.pick(ray) → pickLamb(x, y); animal(…, {index}); animal.partPosition /
 *                                   facing → handle.part(p, side) / .facing; kohen.walkTo(p, {speed, maxSec: 11})
 * `calls` records every call that reached a real function (tests read it).
 * ──────────────────────────────────────────────────────────────────────────── */
import { SHOTS, MENORAH } from '../places.js';

const WALK_SPEED = 7;   // amot per second: a brisk walk (world.avodah's default is 3.4)
const WALK_MAX_SEC = 11;   // a walk the game waits for never takes longer (world.avodah speeds up a long way)
// korbanot.json id → the offering key world.avodah understands (its pilgrim brings the right animal)
const OFFERING_KIND = {
  par_seir_yom_hakippurim: 'par', parim_seirim_nisrafim: 'par', chatat: 'chatat', olah: 'olah', shalmei_tzibbur: 'shelamim',
  asham: 'asham', todah: 'todah', eil_nazir: 'asham', shelamim: 'shelamim', bechor: 'bechor', maaser: 'maaser', pesach: 'pesach',
  chatat_haof: 'ken', olat_haof: 'ken', mincha_nikmetzet: 'olah',
};
/** the gameplay's lamp levels run west → east (index 6 = the easternmost); world.sanctuary numbers its lamps by name
 * (index 0 = "the western lamp"). Match them by where each lamp stands (world.sanctuary.lampPosition). */
function lampsForWorld(sanct, levels) {
  try {
    if (!sanct || typeof sanct.lampPosition !== 'function') return levels;
    const pos = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ i, p: sanct.lampPosition(i) }));
    if (pos.some((o) => !o.p)) return levels;
    const xs = pos.map((o) => o.p.x), zs = pos.map((o) => o.p.z);
    const alongX = Math.max(...xs) - Math.min(...xs) >= Math.max(...zs) - Math.min(...zs);
    const byWestToEast = pos.slice().sort((a, b) => (alongX ? a.p.x - b.p.x : a.p.z - b.p.z));
    const out = new Array(7).fill(0);
    byWestToEast.forEach((o, rank) => { out[o.i] = levels[rank] ?? 0; });
    return out;
  } catch (e) { return levels; }
}

/** an [x, y, z] of finite numbers (a copy) or null */
const vec3 = (r) => (Array.isArray(r) && r.length === 3 && r.every((v) => typeof v === 'number' && Number.isFinite(v)) ? r.slice() : null);
/** a ray the world's pick() understands (origin, direction, intersectSphere(sphere, target)) without importing three.js */
function rayOf(o, d) {
  return {
    origin: o, direction: d,
    intersectSphere(s, target) {
      const c = s.center, r = s.radius, ox = c.x - o.x, oy = c.y - o.y, oz = c.z - o.z;
      const tca = ox * d.x + oy * d.y + oz * d.z, d2 = ox * ox + oy * oy + oz * oz - tca * tca;
      if (d2 > r * r) return null;
      const thc = Math.sqrt(r * r - d2), t1 = tca + thc;
      let t0 = tca - thc;
      if (t1 < 0) return null;
      if (t0 < 0) t0 = t1;
      const x = o.x + d.x * t0, y = o.y + d.y * t0, z = o.z + d.z * t0;
      if (target && typeof target.set === 'function') { target.set(x, y, z); return target; }
      return { x, y, z };
    },
  };
}

const NOOP_ACTOR = { walkTo: () => Promise.resolve(false), face() {}, carry() {}, pose: () => Promise.resolve(false), remove() {} };
const NOOP_ANIMAL = { leadTo: () => Promise.resolve(false), inspect() {}, hide() {}, remove() {}, part: () => null, facing: null, position: null, scale: 1 };

export function guardWorld(world, { timeout = 6000, log = null } = {}) {
  const warned = new Set();
  const calls = [];
  const actors = new Map();
  const warn = (name, e) => { const k = name + String(e); if (warned.has(k)) return; warned.add(k); console.warn(`[avodah] world.${name}:`, e); };
  const w = () => world || {};
  const sub = (k) => { try { const o = w()[k]; return o && typeof o === 'object' ? o : null; } catch (e) { return null; } };
  /** call target[name](...args) if it exists; returns its value or undefined */
  function call(target, path, name, args) {
    let f;
    try { f = target && target[name]; } catch (e) { f = null; }
    if (typeof f !== 'function') return undefined;
    calls.push({ fn: path + name, args });
    if (log) { try { log(path + name, args); } catch (e) { /* ignore */ } }
    try { return f.apply(target, args); } catch (e) { warn(path + name, e); return undefined; }
  }
  /** a promise that always resolves (true when the world answered, false on a missing part / timeout / error) */
  function settle(p, ms, name) {
    return new Promise((resolve) => {
      if (!p || typeof p.then !== 'function') { resolve(p !== undefined && p !== false); return; }
      const timer = setTimeout(() => { warn(name, `no answer after ${ms} ms`); resolve(false); }, ms);
      p.then((v) => { clearTimeout(timer); resolve(v !== false); }, (e) => { clearTimeout(timer); warn(name, e); resolve(false); });
    });
  }
  const fire = (p, name) => { if (p && typeof p.catch === 'function') p.catch((e) => warn(name, e)); return p; };

  const api = {
    calls,
    has: (k) => { if (k === 'look' || k === 'setTimeOfDay') return typeof w()[k] === 'function'; return !!sub(k); },
    hasFn: (k, fn) => { const o = sub(k); return !!o && typeof o[fn] === 'function'; },
    /** camera: a SHOTS key or {p, t}; resolves when the flight ends (or at once without world.look) */
    look(shot, ms = 1800) {
      const s = typeof shot === 'string' ? SHOTS[shot] : shot;
      if (!s || !s.p || !s.t) return Promise.resolve(false);
      return settle(call(w(), '', 'look', [s.p.slice(), s.t.slice(), ms]), ms + 2500, 'look');
    },
    time(k) { return call(w(), '', 'setTimeOfDay', [k]); },
    /** world.sanctuary.<name>(...args): awaited calls return a settled promise */
    sanct(name, ...args) {
      if (name === 'setLamps' && Array.isArray(args[0])) args = [lampsForWorld(sub('sanctuary'), args[0])];
      return call(sub('sanctuary'), 'sanctuary.', name, args);
    },
    sanctWait(name, args = [], ms = timeout) { return settle(call(sub('sanctuary'), 'sanctuary.', name, args), ms, 'sanctuary.' + name); },
    /** world.avodah.<name>(...args) */
    av(name, ...args) {
      if (name === 'pilgrim' && args[0] && typeof args[0] === 'object' && args[0].id) args = [OFFERING_KIND[args[0].id] || 'olah', ...args.slice(1)];
      return fire(call(sub('avodah'), 'avodah.', name, args), 'avodah.' + name);
    },
    avWait(name, args = [], ms = timeout) { return settle(call(sub('avodah'), 'avodah.', name, args), ms, 'avodah.' + name); },
    /** ── water ── (WATER, wave 6) world.water.<name>(...args): the kiyor's spigots, the washing (hold / approach), the mukhni
     *  (src/water.js). Guarded like av(): undefined without the water layer (the harness, a missing world) */
    water(name, ...args) { return fire(call(sub('water'), 'water.', name, args), 'water.' + name); },
    /** world.avodah.pens.fill(n), world.avodah.lambsChamber.count(n) */
    avSub(obj, name, ...args) { const a = sub('avodah'); let o = null; try { o = a && a[obj]; } catch (e) { o = null; } return call(o, `avodah.${obj}.`, name, args); },
    /** an actor (kohen) or a do-nothing stand-in with the same methods */
    /** the same id gives the same actor for the whole session (created once) */
    kohen(id, opts) {
      if (actors.has(id)) return actors.get(id);
      const a = call(sub('avodah'), 'avodah.', 'kohen', [id, opts]);
      if (!a || typeof a !== 'object') return NOOP_ACTOR;
      const wrap = {
        raw: a,   // ── water ── (WATER, wave 6) the world's own handle, for world.water.hold / approach (see water() below)
        // (maxSec: a long way is walked faster so it ends within 11 s — docs/SCENES.md §4; the guard stays at 15 s)
        walkTo: (to) => settle(call(a, `kohen(${id}).`, 'walkTo', [to, { speed: WALK_SPEED, maxSec: WALK_MAX_SEC }]), Math.max(timeout, 15000), 'kohen.walkTo'),
        face: (x) => call(a, `kohen(${id}).`, 'face', [x]),
        carry: (x) => call(a, `kohen(${id}).`, 'carry', [x]),
        pose: (p) => settle(call(a, `kohen(${id}).`, 'pose', [p]), timeout, 'kohen.pose'),
        remove: () => { actors.delete(id); return call(a, `kohen(${id}).`, 'remove', []); },
      };
      actors.set(id, wrap);
      return wrap;
    },
    /** remove every actor this session made (stop) */
    clear() { for (const a of [...actors.values()]) a.remove(); },
    animal(kind, at, opts) {
      const h = call(sub('avodah'), 'avodah.', 'animal', [kind, at, opts]);
      if (!h || typeof h !== 'object') return { ...NOOP_ANIMAL, raw: null };
      return {
        raw: h,
        leadTo: (p) => {
          let by;
          try { const pos = h.position, av = sub('avodah'); if (pos && av && typeof av.kohen === 'function') by = av.kohen('mevi-' + kind, { at: [pos.x + 1.6, pos.z + 0.6] }); } catch (e) { by = undefined; }
          return settle(call(h, `animal(${kind}).`, 'leadTo', [p, by ? { by, speed: 5.5 } : { speed: 5.5 }]), 90000, 'animal.leadTo');
        },
        inspect: (on) => call(h, `animal(${kind}).`, 'inspect', [on]),
        hide: () => call(h, `animal(${kind}).`, 'hide', []),
        remove: () => call(h, `animal(${kind}).`, 'remove', []),
        /** where a part of the animal is now, as drawn (world.avodah partPosition: ear eye nose lip head …; side left|right)
         *  → [x, y, z] or null (a per-frame read: not logged) */
        part(p, side) {
          try { const r = typeof h.partPosition === 'function' ? h.partPosition(p, side) : null; return vec3(r); } catch (e) { warn('animal.partPosition', e); return null; }
        },
        /** its yaw (0 = facing south, +z) or null */
        get facing() { try { const f = h.facing; return Number.isFinite(f) ? f : null; } catch (e) { return null; } },
        get position() { try { const p = h.position; return p && Number.isFinite(p.x) && Number.isFinite(p.z) ? { x: p.x, y: Number.isFinite(p.y) ? p.y : 16, z: p.z } : null; } catch (e) { return null; } },
        get scale() { try { const k = h.scale; return Number.isFinite(k) && k > 0 ? k : 1; } catch (e) { return 1; } },
      };
    },
    /** world.sanctuary.anchor(id) → [x, y, z] (the vessels' points: gate, gold-altar-top, menorah-stone, shulchan-east …) or null */
    anchor(id) {
      const r = call(sub('sanctuary'), 'sanctuary.', 'anchor', [id]);
      return vec3(r);
    },
    /** the lambs waiting in their chamber: world.avodah.lambsChamber.positions() → [{ i, x, y, z, yaw, head }] ([] when missing) */
    lambs() {
      const r = api.avSub('lambsChamber', 'positions');
      return Array.isArray(r) ? r.filter((o) => o && Number.isInteger(o.i) && Number.isFinite(o.x) && Number.isFinite(o.z)) : [];
    },
    /** a tap on the canvas at (cx, cy) CSS px: which lamb of the chamber is under it (lambsChamber.pick) → i, or -1.
     *  The ray goes from the camera through the point (the same projection as project(), view offset included). */
    pickLamb(cx, cy) {
      const cam = api.camera, a = sub('avodah');
      let lc = null;
      try { lc = a && a.lambsChamber; } catch (e) { lc = null; }
      if (!cam || !lc || typeof lc.pick !== 'function' || typeof cam.position.clone !== 'function') return -1;
      try {
        const o = cam.position.clone(), V = o.constructor;
        const d = new V((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1, 0.5).unproject(cam).sub(o).normalize();
        const i = call(lc, 'avodah.lambsChamber.', 'pick', [rayOf(o, d)]);
        return Number.isInteger(i) ? i : -1;
      } catch (e) { warn('lambsChamber.pick', e); return -1; }
    },
    settle,
    /** world.project(x, y, z) → {x, y, on} in CSS px (per frame: a direct call, not logged); null when missing */
    project(x, y, z) {
      const o = w(), f = o.project;
      if (typeof f !== 'function') return null;
      try { const r = f.call(o, x, y, z); return r && typeof r.x === 'number' ? { x: r.x, y: r.y, on: r.on !== false } : null; } catch (e) { warn('project', e); return null; }
    },
    get canProject() { return typeof w().project === 'function'; },
    /** the world's camera (main.js exposes it for the 3D targets' auto-framing); null when missing */
    get camera() { try { const c = w().camera; return c && c.position && typeof c.fov === 'number' ? c : null; } catch (e) { return null; } },
    /** world.sanctuary.state (read only) or null */
    sanctState() { const s = sub('sanctuary'); try { return s && s.state ? s.state : null; } catch (e) { return null; } },
    /** the seven lamps' positions in gameplay order (index 0 = westernmost … 6 = easternmost): world.sanctuary.lampPosition
     *  when it exists, else places.MENORAH with the sanctuary's spread (an illustration) */
    lampsWestToEast() {
      const s = sub('sanctuary');
      try {
        if (s && typeof s.lampPosition === 'function') {
          const pos = [0, 1, 2, 3, 4, 5, 6].map((i) => s.lampPosition(i)).filter(Boolean);
          if (pos.length === 7) {
            const xs = pos.map((p) => p.x), zs = pos.map((p) => p.z);
            const alongX = Math.max(...xs) - Math.min(...xs) >= Math.max(...zs) - Math.min(...zs);
            return pos.slice().sort((a, b) => (alongX ? a.x - b.x : a.z - b.z)).map((p) => [p.x, p.y, p.z]);
          }
        }
      } catch (e) { warn('lampPosition', e); }
      return [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((dx) => [MENORAH.x + dx, MENORAH.y + MENORAH.h, MENORAH.z]);
    },
  };
  return api;
}
