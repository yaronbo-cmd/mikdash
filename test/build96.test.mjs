// build 96: the doors' voyage made a game (the owner, 4.11 04:47, on build 95: the sea leg has no game — light navigation, a compass to
// the port, a small map; the storm's "same wave" jumps back — it must go on; the cargo is never seen falling; balance alone is fun for
// 10–20 s). The sea leg: the steering oar, the yard braced to a wind that shifts, a current, a shoal; the storm going on, a crate over
// the side for a beaten wave; the approach into Acre between the moles. Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as V from '../src/game/voyage96.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
/** a good sailor: the yard braced right, the helm back to the course, round the shoal on its seaward side */
function sail(N, opt = {}) {
  let evs = [];
  for (let n = 0; n < 60 * 600 && !N.state().done; n++) {
    const k = N.state(), sh = N.shoalAt(), want = sh && sh.x > -40 && sh.x < 420 ? -80 : 0;   // (stand off to the coast side of the shoal: the north wind will not let her up to its seaward side)
    let aim = V.NAV96.bearing - Math.max(-25, Math.min(25, (want - k.y) * 1.0)); const wr = V.norm180(k.from - aim); if (Math.abs(wr) < 78) aim = k.from - Math.sign(wr || 1) * 78;
    N.helm(opt.noHelm ? 0 : Math.max(-1, Math.min(1, V.norm180(aim - k.hdg) / 8)));
    N.braceTo(opt.square ? 0 : V.braceFor96(N.rel()));
    const e = N.step(1 / 30); if (e) evs.push(e);
  }
  return evs;
}

test('build 96: the sea leg — braced to the wind and kept on the course, round the shoal: in, whole, at every level; the wind shifts twice', () => {
  for (let i = 0; i < 3; i++) {
    const N = V.createNav96(i), ev = sail(N), k = N.state();
    assert.ok(k.done, `level ${i}`); assert.equal(k.hits, 0, 'round the shoal'); assert.equal(k.q, 1, `level ${i} q ${k.q} good ${k.good}`);
    assert.equal(ev.filter((e) => e === 'wind').length, 2, 'the wind shifts twice');
    assert.ok(k.t > 80 && k.t < 160, `the leg is a minute and a half or two (${k.t.toFixed(0)} s)`);
  }
});

test('build 96: the sea leg — the yard left square in a wind on the bow draws little; into the wind it does not draw at all; the shoal on the course', () => {
  assert.equal(V.pointOfSail96(0), 0); assert.equal(V.pointOfSail96(50), 0); assert.ok(V.pointOfSail96(120) > V.pointOfSail96(75));
  assert.equal(V.braceFor96(180), 0); assert.ok(Math.abs(V.braceFor96(90)) > 40);
  const A = V.createNav96(2), B = V.createNav96(2); sail(A); sail(B, { square: true });
  assert.ok(B.state().t > A.state().t * 1.15, 'square all the way: slower'); assert.ok(B.state().q < 1);
  const C = V.createNav96(0), ev = sail(C, { noHelm: true }); assert.ok(ev.includes('shoal'), 'held straight on the course: the shoal'); assert.equal(C.state().hits, 1);
  const D = V.createNav96(0); D.helm(1); for (let n = 0; n < 30 * 20; n++) D.step(1 / 30); assert.ok(D.state().irons > 0 || D.state().v < 5, 'helm hard over: up into the wind, she stops');
});

test('build 96: the approach — into the mouth between the moles: in; wide of it: a bump and back, no failure', () => {
  const N = V.createNav96(1, { leg: 260, shoal: null, winds: [{ at: 0, from: 240 }], port: { gap: 14 } }); sail(N); assert.ok(N.state().done); assert.equal(N.state().q, 1);
  const M = V.createNav96(1, { leg: 260, shoal: null, winds: [{ at: 0, from: 240 }], port: { gap: 14 }, hdg: V.NAV96.bearing - 14 });
  let bump = false; for (let n = 0; n < 30 * 40 && !bump; n++) { M.braceTo(V.braceFor96(M.rel())); if (M.step(1 / 30) === 'bump') bump = true; }
  assert.ok(bump, 'wide of the mouth: the mole'); assert.ok(!M.state().done); assert.equal(M.state().bumps, 1);
});

/** the storm, his two thumbs: the balance answering the push, the ropes held */
function weather(S, o = {}) { for (let n = 0; n < 30 * 300 && !S.state().done; n++) { const k = S.state(); S.balance(o.noBal ? 0 : -k.p * 0.95); S.holdOn(!o.noRopes); S.step(1 / 30); } return S.state(); }
test('build 96: the storm goes on — no wave replayed: answered, every crate kept; beaten, a crate over the side and on to the next wave', () => {
  for (let i = 0; i < 3; i++) { const k = weather(V.createStorm96(i)); assert.ok(k.done); assert.equal(k.lost, 0, `level ${i}`); assert.equal(k.q, 1); assert.ok(k.thrown); }
  const S = V.createStorm96(2); let maxI = 0, back = false; for (let n = 0; n < 30 * 300 && !S.state().done; n++) { S.holdOn(true); S.step(1 / 30); if (S.state().i < maxI) back = true; maxI = Math.max(maxI, S.state().i); }
  const k = S.state(); assert.ok(k.done, 'it ends without his balance'); assert.ok(!back, 'never back to the same wave'); assert.ok(k.lost >= 3 && k.crates === V.STORM96.crates - k.lost); assert.equal(k.q, 0);
  const R = weather(V.createStorm96(1), { noRopes: true }); assert.ok(R.slid >= 2, 'the ropes let go: the cargo slides'); assert.ok(R.doorMax > 0.5, 'in the hug the sailors drag the door');
  let t = 0; const T = V.createStorm96(0); while (!T.state().done) { T.balance(-T.state().p * 0.95); T.holdOn(true); T.step(1 / 30); t += 1 / 30; } assert.ok(t > 45 && t < 90, `about a minute (${t.toFixed(0)} s)`);
});

test('build 96: the map and the wiring — Alexandria to Acre; the voyage plays the new acts; the lines short and sourced or marked', async () => {
  const a = V.mapAt96(0), b = V.mapAt96(1), m = V.mapAt96(0.5); assert.deepEqual(a.map((v) => +v.toFixed(3)), [...V.MAP96.alex]); assert.deepEqual(b.map((v) => +v.toFixed(3)), [...V.MAP96.acre]);
  assert.ok(m[1] < (a[1] + b[1]) / 2, 'the route bows out to sea');
  const v = read('src/game/voyage49.js');
  assert.match(v, /createNav96\(/); assert.match(v, /createStorm96\(/); assert.match(v, /VLINE96\.beat/, 'a beaten wave: a crate over, and on'); assert.match(v, /ctx\.v96 !== false/);
  const { VLINE96 } = await import('../src/game/voyage49.js');
  for (const [k2, t2] of Object.entries(VLINE96)) { assert.ok(/המחשה|יומא|טיוטה/.test(t2), k2); assert.ok(t2.split(' · ')[0].length <= 50, `${k2} ${t2.split(' · ')[0].length}`); }
});

test('build 96: the whole voyage in the node — the harbour, the sea leg by his hands, the storm, the approach, Acre, the road; graded', async () => {
  const THREE = await import('three'); const { createVoyage49 } = await import('../src/game/voyage49.js');
  const scene = new THREE.Scene(); const lines = [], emits = []; let done = null;
  const job = createVoyage49({ scene, doc: null, camTo: (p) => cams.push(p), line: (t) => lines.push(t), root: null, W: () => 844, H: () => 390, buzz: () => {}, sound: () => {}, emit: (t, d) => emits.push([t, d && d.s]), timeOfDay: () => {}, stages: {}, L: 1, seen: false, done: (r) => { done = r; } });
  const cams = []; job.go('sea'); let n = 0;
  const hand = () => {   // a sailor's hands: the helm to the course, the brace to the wind (set straight on the nav, as his drag would)
    const N = job.V.N; if (!N) return; const k = N.state(); let aim = V.NAV96.bearing + (job.scene() === 'port' ? Math.atan2(k.y, Math.max(20, N.leg - k.x)) * 180 / Math.PI : 0);
    const sh = N.shoalAt(); if (sh && sh.x > -40 && sh.x < 420) aim = V.NAV96.bearing - Math.max(-25, Math.min(25, (-80 - k.y)));
    const wr = V.norm180(k.from - aim); if (Math.abs(wr) < 78) aim = k.from - Math.sign(wr || 1) * 78;
    job.T.one = { x: 422 + Math.max(-1, Math.min(1, V.norm180(aim - k.hdg) / 8)) * 844 * 0.2, x0: 422, y: 300, y0: 300, mode: 'helm', b0: 0 }; N.braceTo(V.braceFor96(N.rel()));
  };
  while (job.scene() === 'sea' && n++ < 20000) { hand(); job.frame(1 / 30); }
  assert.equal(job.scene(), 'storm'); assert.equal(job.V.qs.sea, 1, 'sailed well'); assert.ok(cams.length > 1000, 'the camera follows her at sea');
  const S = job.storm(); while (['storm', 'hug'].includes(job.scene()) && n++ < 60000) { const s = S.state(); job.T.one = null; job.T.left = { x: 844 * 0.18 + Math.max(-1, Math.min(1, -s.p * 0.95)) * 844 * 0.16, x0: 844 * 0.18, y: 240, y0: 240, still: 0 }; job.T.right = { x: 700, x0: 700, y: 240, y0: 240, still: 0 }; job.frame(1 / 30); }
  assert.equal(S.state().lost, 0); assert.equal(job.V.qs.storm, 1);
  job.T.left = null; job.T.right = null; while (['calm', 'port'].includes(job.scene()) && n++ < 90000) { if (job.scene() === 'port') hand(); else job.T.one = null; job.frame(1 / 30); }
  assert.equal(job.scene(), 'acre'); assert.equal(job.V.qs.port, 1); assert.equal(done, null);
  job.T.one = { x: 400, x0: 400, y: 200, y0: 200, still: 0 }; while (!done && n++ < 120000) job.frame(1 / 30);
  assert.ok(done && done.q === 1 && done.rating, 'graded: the sea, the storm and the approach');
  assert.deepEqual(emits.filter((e) => e[0] === 'h49scene').map((e) => e[1]), ['harbour', 'sea', 'storm', 'hug', 'port', 'acre', 'road']);
  assert.ok(!lines.some((l) => /אותו גל/.test(l)), 'no "the same wave"');
});

test('build 96: the cylinders\' bug — an inline .glb is decoded and parsed, never fetched (the artifact frame refuses a fetch of a data: url)', () => {
  const p = read('src/game/people88.js'), w = read('src/game/props88.js');
  assert.match(p, /export function loadGlb96\(L, url, ok, fail\)/); assert.match(p, /url\.startsWith\('data:'\)[\s\S]{0,200}L\.parse\(buf\.buffer/);
  assert.match(p, /parser\.textureLoader = new THREE\.TextureLoader/, 'the pictures through an <img>, not a fetch of a blob: url');
  assert.match(p, /loadGlb96\(L, u, ok,/); assert.doesNotMatch(p, /L\.load\(u, ok/); assert.match(w, /loadGlb96\(L, a\.WAGON_URL/);
});
