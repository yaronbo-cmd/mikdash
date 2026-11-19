// ── fable32 (build 13) ── lobby35: the 3D home screen's logic without a DOM (the doors, the mode, the rewards' bookkeeping) ── /fable32 ──
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLobby, LOBBY35 } from '../src/avodah/shift/lobby35.js';

const mkWorld = () => { const h = { x: 0, z: 0, yaw: 0, vis: true, pos: [], shown: [] }; return { hero: { setPos: (x, z, yaw) => { h.x = x; h.z = z; h.yaw = yaw; h.pos.push([x, z]); }, drive() {}, show: (v) => { h.vis = !!v; h.shown.push(!!v); } }, heroXYZ: (o) => Object.assign(o, { x: h.x, y: 16, z: h.z, yaw: h.yaw, vis: h.vis }), h }; };
const mkCam = () => { const c = { on: 0, off: 0, orbit: [] }; return { c, f: () => ({ on: () => { c.on++; }, off: () => { c.off++; }, orbit: (az, el, d) => { c.orbit.push([az, el, d]); }, state: () => ({ drags: 0 }) }) }; };

test('the lobby enters the world: the hero at the lobby spot, hidden; the stick off; the camera orbiting at the lobby distance; play leaves it all as it was', () => {
  const W = mkWorld(), C = mkCam(), calls = [], T = { sticks: [], noStick(v) { this.sticks.push(v); } };
  const D = { active: false, canEnter: () => true, enter: () => { D.active = true; calls.push('enter'); return true; }, shiftMode: (h) => calls.push(['mode', !!h]) };
  const save = { perutot: 7, bestDay: 2, best: {}, lvl: 1 };
  const Lb = createLobby({ D, world: W, twin: T, view: { camNow: (o) => Object.assign(o, { px: 0, py: 20, pz: 60, tx: 0, ty: 17, tz: 50 }) }, save, camera: C.f, on: { day: () => calls.push('day'), shift: () => calls.push('shift'), tour: () => calls.push('tour') } });
  assert.deepEqual(W.h.pos[0], [LOBBY35.x, LOBBY35.z]); assert.equal(W.h.vis, false); assert.deepEqual(T.sticks, [true]);
  assert.equal(C.c.on, 1); assert.deepEqual(C.c.orbit[0], [LOBBY35.az0, LOBBY35.el, LOBBY35.d]);
  assert.equal(calls[0], 'enter'); assert.deepEqual(calls[1], ['mode', true]);
  const s = Lb.state(); assert.equal(s.open, true); assert.equal(s.mode, 'day'); assert.equal(s.perutot, 7);
  assert.equal(Lb.pick('play'), true);
  assert.equal(calls[calls.length - 1], 'day'); assert.equal(Lb.state().open, false);
  assert.equal(C.c.off, 1); assert.equal(W.h.vis, true); assert.deepEqual(T.sticks, [true, false]);
  assert.equal(Lb.pick('play'), false, 'closed: no second play');
});

test('the mode pill: kept in the save; שמשמרת and סיור go their own way', () => {
  const calls = [], save = {};
  const Lb = createLobby({ save, persist: () => calls.push('persist'), on: { day: () => calls.push('day'), shift: () => calls.push('shift'), tour: () => calls.push('tour') } });
  assert.equal(Lb.pick('mode:shift'), true); assert.equal(save.lobbyMode, 'shift'); assert.ok(calls.includes('persist'));
  Lb.pick('play'); assert.equal(calls[calls.length - 1], 'shift');
  const Lb2 = createLobby({ save, on: { tour: () => calls.push('tour') } }); assert.equal(Lb2.state().mode, 'shift');
  Lb2.pick('mode:tour'); Lb2.pick('play'); assert.equal(calls[calls.length - 1], 'tour');
});

test('the doors call the host: shop, book, merchant; the badges counted from the claimed book', () => {
  const calls = [], save = { badges33: { log1: 1, lvl2: 1 } };
  const Lb = createLobby({ save, on: { shop: () => calls.push('shop'), book: () => calls.push('book'), merchant: () => calls.push('merchant') } });
  for (const d of ['shop', 'book', 'merchant']) assert.equal(Lb.pick(d), true);
  assert.deepEqual(calls, ['shop', 'book', 'merchant']); assert.equal(Lb.state().badges, 2);
  assert.equal(Lb.pick('nothing'), false);
  Lb.close();
});
