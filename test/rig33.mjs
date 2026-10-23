// ── recovered (R9) ── the day engine of builds 16–26c in node (no browser): createDay33 with the builds' flags, a hero that is set
// where the test puts him, the stations' acts answered at once (gold unless told otherwise), the HUD and the world as stubs.
// Used by test/build16 … build27.test.mjs (not a test itself).
import { createDay33 } from '../src/avodah/shift/day33.js';
import { STATIONS } from '../src/avodah/shift/stations.js';

// the flags as shift/index.js passes them (each build needs the one before it): all on unless a test turns one off
export const FLAGS = { b17: true, court18: true, coins: true, b19: true, g20: true, d21: true, m22: true, p23: true, p25: true, p26: true, p27: true, e35: true };   // (build 27: p27) (build 35: e35 — the morning measured by the work)
/** ── build 35 ── the flags as shift/index.js passed them before build 35 (the old fire loop on): the tests of that loop's own mechanics */
export const FLAGS34 = { ...FLAGS, e35: false };
const UPTO = ['b17', 'court18', 'b19', 'g20', 'd21', 'm22', 'p23', 'p25', 'p26', 'p27'];
/** the flags up to a build: upTo('g20') → b17 … g20 on, the later ones off */
export function upTo(last) {
  const out = {}, i = UPTO.indexOf(last);
  UPTO.forEach((k, j) => { out[k] = j <= i; });
  out.coins = out.court18;
  if (i < UPTO.indexOf('p25')) out.p25 = false;
  if (i < UPTO.indexOf('p26')) out.p26 = false;
  if (i < UPTO.indexOf('p27')) out.p27 = false;
  return out;
}
/** a seeded rng (mulberry32), so a test's day repeats */
export function seeded(seed = 1) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function rig(flags = FLAGS, o = {}) {
  const H = { x: -34, y: 16, z: 50, vx: 0, vz: 0, yaw: Math.PI };
  const pending = [], acts = [];
  const answer = o.answer || (() => ({ quality: 1, gold: true }));
  const stations = { STATIONS, act: (id, P, opts) => new Promise((res) => { acts.push({ id, opts }); pending.push(() => res(answer(id, opts))); }), cue() {}, place() {}, clear() {}, cancel() {}, poke() {}, state: () => null };
  const hud = { set(s) { this.s = s; }, stamp(t, k) { (this.st ||= []).push(t); }, hint(t) { this.h = t; }, float(t) { (this.fl ||= []).push(t); }, pin: () => ({ at() {}, text() {}, close() {} }), choice(c) { this.choice1 = c; } };
  const save = o.save || {};
  const world = { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z, yaw) { H.x = x; H.z = z; if (Number.isFinite(yaw)) H.yaw = yaw; } } };
  const E = createDay33({ world, heroPos: () => H, hud, stations, save, persist: o.persist || (() => {}), rng: o.rng || seeded(o.seed || 7), twin: o.twin || null, ...flags, ...(o.practice ? { practice: o.practice } : {}), ...(o.now ? { now: o.now } : {}), ...(o.where ? { where: o.where } : {}) });   // (build 31: a practice run, o.practice) (build 32: the journal's clock and place, o.now / o.where)
  const events = [];
  E.on17((ev) => events.push(ev));
  // ── fable32 (build 32) ── the journal's unlock card ("j32new": a role's first end, or the first page ever — the day waits under it): a
  // player's "המשך" at once, as the card's button does (E.j32done); o.j32hold keeps it up (build 32's own tests) ── /fable32 ──
  let j32 = false;
  if (!o.j32hold) E.on17((ev) => { if (ev.type === 'j32new') j32 = true; });
  const step = async (s, dt = 0.1) => { for (let t = 0; t < s - 1e-9; t += dt) { E.tick(dt); if (j32) { j32 = false; E.j32done(); } while (pending.length) { pending.shift()(); await null; await null; } } };
  const at = (x, z, y = 16) => { H.x = x; H.z = z; H.y = y; };
  const ev = (type) => events.filter((e) => e.type === type);
  return { E, H, hud, save, step, at, events, ev, acts, STATIONS };
}
