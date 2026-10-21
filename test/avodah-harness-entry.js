/* ─────────────────────────────────────────────────────────────────────────────
 * avodah-harness-entry.js: boots Phase B (src/avodah) against a MOCK world (bundled by avodah-harness.cjs).
 * The mock implements the PROJECT.md §12 surface (world.look, setTimeOfDay, world.sanctuary.*, world.avodah.*),
 * records every call (window.__AV.calls) and resolves its promises after a short while. No WebGL.
 * URL params: fast=1 · theme=dark|light · world=none (world = {}) · now=<ISO> (pins the clock) ·
 *             broken=1 (a world that throws / hangs / rejects) · no3d=1 (no world.project: the SVG fallback) ·
 *             lost=1 (every target lands under the card: the 3D layer retires, the SVG is played) ·
 *             wicket=1 (the heichal game goes in by the northern wicket and opens the gate from inside)
 * ──────────────────────────────────────────────────────────────────────────── */
import { createAvodah } from '../src/avodah/index.js';
import { hasDivineName } from '../src/avodah/data.js';

// every text the page ever shows is scanned for a Divine Name written in full (PROJECT.md §2.3)
window.__AV_NAMES = [];
window.__AV_TEXTS = 0;
const scan = (node) => {
  const t = node && (node.nodeType === 3 ? node.nodeValue : node.textContent);
  if (!t) return;
  window.__AV_TEXTS++;
  if (hasDivineName(t)) window.__AV_NAMES.push(t.slice(0, 120));
};
new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'characterData') scan(m.target); for (const n of m.addedNodes) scan(n); } })
  .observe(document.documentElement, { childList: true, subtree: true, characterData: true });

// every 3D target pressed (a world-anchored ring from interact3d.js), as "game:key": the harness checks that the
// solvers act in the world when it can project, and never when it cannot (no3d=1, world=none)
window.__AV3D_HITS = [];
for (const ev of ['pointerdown', 'click']) {
  document.addEventListener(ev, (e) => {
    const t = e.target && e.target.closest ? e.target.closest('.av3d-t') : null;
    if (t) window.__AV3D_HITS.push(`${(window.__AV && window.__AV.av._.game) || '?'}:${t.dataset.key}`);
  }, true);
}

const P = new URLSearchParams(location.search);
const FAST = P.get('fast') === '1';
if (P.get('wicket') === '1') window.__AV_WICKET = true;   // ⚑ the heichal game's route by the northern wicket (Tamid 3:7)
if (P.get('theme')) document.documentElement.dataset.theme = P.get('theme');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const calls = [];
const log = (fn, args) => calls.push({ fn, args: JSON.parse(JSON.stringify(args || [], (k, v) => (v && typeof v === 'object' && v.__mock ? `<${v.__mock}>` : v))), t: Math.round(performance.now()) });

function mockWorld() {
  const later = (fn, ms = 120) => (...a) => { log(fn, a); return wait(FAST ? 20 : ms).then(() => true); };
  const now = (fn) => (...a) => { log(fn, a); };
  const actor = (id) => ({ __mock: 'kohen:' + id, walkTo: later(`kohen(${id}).walkTo`), face: now(`kohen(${id}).face`), carry: now(`kohen(${id}).carry`), pose: later(`kohen(${id}).pose`), remove: now(`kohen(${id}).remove`) });
  // (wave 4) an animal draws its parts where world.avodah's partPosition says: the sheep's model points, turned by its yaw
  const SHEEP = { head: [0, 1.57, 1.07], ear: [0.3, 1.6, 1.0], eye: [0.155, 1.66, 1.19], nose: [0, 1.49, 1.43], lip: [0, 1.35, 1.33], mouth: [0, 1.41, 1.39] };
  const animal = (kind, at) => {
    const pos = { x: -172, y: 16, z: -62 }, yaw = 0.6;
    return {
      __mock: 'animal:' + kind, position: pos, _h: { yaw, s: 1 }, facing: yaw, forward: [Math.sin(yaw), Math.cos(yaw)], scale: 1,
      partPosition: (part, side) => { const q = SHEEP[part]; if (!q) return null; const sg = side === 'right' ? -1 : 1, x = q[0] * sg, c = Math.cos(yaw), sn = Math.sin(yaw); return [pos.x + x * c + q[2] * sn, pos.y + q[1], pos.z - x * sn + q[2] * c]; },
      leadTo: later(`animal(${kind}).leadTo`), inspect: now(`animal(${kind}).inspect`), hide: now(`animal(${kind}).hide`), remove: now(`animal(${kind}).remove`),
    };
  };
  // the six lambs in their chamber (world.avodah.lambsChamber.positions)
  const LAMBS = [0, 1, 2, 3, 4, 5].map((i) => ({ i, x: -176 + (i % 3) * 3.6, y: 16, z: -65.5 + Math.floor(i / 3) * 4.2, yaw: Math.PI / 2 }));
  // the sanctuary's anchors (docs/SCENES.md §4), a few of them
  const ANCHORS = { gate: [-95, 32, 0], 'gate-in': [-98.4, 25, 0], 'gate-out': [-91.6, 25, 0], 'gold-altar-top': [-121, 24.02, 0], 'menorah-stone': [-123.3, 22.9, 7.5], 'menorah-stone-2': [-122.8, 22.6, 7.5], 'shulchan-east': [-124, 23.5, -7.5], 'shulchan-west': [-126, 23.5, -7.5] };
  const sanctState = { doors: 0, menorahAxis: 'ew', room: 'out' };
  const w = {
    look: later('look', 300),
    setTimeOfDay: (k) => { log('setTimeOfDay', [k]); document.documentElement.dataset.tod = k; },
    sanctuary: {
      enter: later('sanctuary.enter', 300), exit: later('sanctuary.exit', 300),
      setLamps: now('sanctuary.setLamps'), setGoldAltar: now('sanctuary.setGoldAltar'), setParochot: now('sanctuary.setParochot'),
      setDoors: (u) => { log('sanctuary.setDoors', [u]); sanctState.doors = u; }, setBread: now('sanctuary.setBread'), setBezichin: now('sanctuary.setBezichin'),
      highlight: now('sanctuary.highlight'), focus: later('sanctuary.focus'), pick: () => null, update: () => {},
      anchor: (id) => { log('sanctuary.anchor', [id]); return ANCHORS[id] ? ANCHORS[id].slice() : null; }, get state() { return { ...sanctState }; },
    },
    avodah: {
      kohen: (id, o) => { log('avodah.kohen', [id, o]); return actor(id); },
      animal: (kind, at, o) => { log('avodah.animal', [kind, at, o]); return animal(kind, at); },
      slaughter: later('avodah.slaughter', 400), sprinkle: later('avodah.sprinkle'), limbs: later('avodah.limbs'), libation: later('avodah.libation'),
      trumpets: now('avodah.trumpets'), levites: now('avodah.levites'), blessing: now('avodah.blessing'), bow: now('avodah.bow'),
      fire: now('avodah.fire'), smoke: now('avodah.smoke'), pilgrim: (o) => { log('avodah.pilgrim', [o]); return { __mock: 'pilgrim' }; }, pilgrims: now('avodah.pilgrims'),
      birdOffering: later('avodah.birdOffering'), pens: { fill: now('avodah.pens.fill') }, update: () => {},
      lambsChamber: { count: now('avodah.lambsChamber.count'), positions: () => LAMBS.map((o) => ({ ...o, head: [o.x + 1.07, 17.57, o.z] })), pick: () => 2 },
    },
  };
  // world.project for the 3D targets (a stand-in: every world point lands somewhere on screen, deterministically)
  if (P.get('no3d') !== '1') {
    w.project = (x, y, z) => ({ x: innerWidth * 0.08 + ((Math.abs(x) * 13.7 + Math.abs(z) * 7.3 + y * 3.1) % (innerWidth * 0.84)), y: innerHeight * 0.1 + ((Math.abs(z) * 11.3 + Math.abs(x) * 2.9 + y * 5.7) % (innerHeight * 0.38)), on: true });
    w.sanctuary.lampPosition = (i) => ({ x: -125 + [0, -1.2, 1.2, -0.8, 0.8, -0.4, 0.4][i], y: 25, z: 7.5 });   // named order: 0 = "the western lamp"
    if (P.get('lost') === '1') w.project = () => ({ x: innerWidth / 2, y: innerHeight - 20, on: true });   // every target under the card: out of reach
  }
  if (P.get('broken') === '1') {
    w.look = () => new Promise(() => {});                       // never settles
    w.sanctuary.enter = () => Promise.reject(new Error('no house'));
    w.avodah.slaughter = () => { throw new Error('no animal'); };
    w.avodah.kohen = () => { throw new Error('no kohen'); };
    w.setTimeOfDay = () => { throw new Error('no sky'); };
  }
  return w;
}
const world = P.get('world') === 'none' ? {} : mockWorld();
const fixed = P.get('now') ? Date.parse(P.get('now')) : null;
const t0 = Date.now();
const nowFn = fixed ? () => fixed + (Date.now() - t0) : () => Date.now();
window.__AV_LOG = [];
const av = createAvodah({
  world, root: document.body,
  options: { fast: FAST, now: nowFn, production: P.get('production') === '1' },
  onEvent: (type, d) => window.__AV_LOG.push({ t: Math.round(performance.now()), type, d }),
});
window.__AV = { av, world, calls };
(function loop(t) { av.frame(t); requestAnimationFrame(loop); })(performance.now());
const mode = P.get('mode');
av.start(mode ? { mode, segment: P.get('segment') || undefined } : {});
