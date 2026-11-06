// build 92: stage 04 rebuilt as physical acts (the owner, 3.11 22:12: "תמשיך ל 4-6"; the task doc: the lintel on two real cranes in the
// real opening, Herodian stone; the leaf's pivot and socket seen; the review §3 stage 04: a lintel at each gate, each heavier, a slip back
// to the ground when tilted too far, both ends landing together; the leaf by place and lean, its swing by strength). Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/gates92.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42, PARTS92 } from '../src/game/har42.js';
import { DEP63, open63 } from '../src/game/site63.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const fixed = () => 0.3;   // (the drift's side: left; the sway's phase)

/** a careful hand: holds where the tilt is corrected (the low end), lets the swing settle, lowers with short holds */
function careful(J, opt = {}) {
  const dt = 1 / 30; let t = 0, wait = 0;
  for (; t < 240 && !J.state().done; t += dt) {
    const k = J.state();
    if (k.ph === 'lift') { const u = Math.max(-1, Math.min(1, -(k.th * 6 + k.w * 2.5))); J.hold(true, u); }
    else if (k.ph === 'over') {
      const u = Math.max(-1, Math.min(1, (k.th * 6 + k.w * 2.5)));   // (lowering: the end held goes down faster)
      const calm = Math.abs(k.sx) < 0.08 && Math.abs(k.sv) < 0.15;
      if (opt.rush) J.hold(true, u);
      else { wait += dt; const pulse = wait % 1.0 < 0.6; J.hold(pulse && (calm || Math.abs(k.th) > 0.02), u); }
    } else J.hold(false, 0);
    J.step(dt);
  }
  return J.state();
}

test('build 92: GAME_BUILD 92; the gates — two north gates and one south of Middot 1:4–5, the openings of Middot 2:3', () => {
  assert.equal(GAME_BUILD, 107);
  assert.deepEqual(F.GATES92.gates.map((g) => g.id), ['nitzotz', 'korban', 'mayim']);
  assert.equal(F.GATES92.W, 10); assert.equal(F.GATES92.H, 20);
  for (const g of F.GATES92.gates) assert.match(g.why, /מדות א, [דה]/);
  assert.ok(F.GATES92.lw > F.GATES92.W + 2, 'the lintel rests on both jambs');
  assert.ok(F.LINTEL92.L[2].rise < F.LINTEL92.L[0].rise && F.LINTEL92.L[2].slip < F.LINTEL92.L[0].slip && F.LINTEL92.L[2].win < F.LINTEL92.L[0].win, 'each lintel heavier');
});

test('build 92: the lintel — a careful hand lifts it, waits out the swing, lowers it gently: both ends together, מהודר', () => {
  for (let i = 0; i < 3; i++) {
    const s = careful(F.createLintel92(i, fixed));
    assert.ok(s.done, `lintel ${i} set`); assert.equal(s.slips, 0, `lintel ${i} no slip`); assert.equal(s.misses, 0, `lintel ${i} on its jambs`);
    assert.equal(s.q, 1, `lintel ${i}: ${JSON.stringify({ uneven: s.uneven, chip: s.chip, th: s.th, v: s.v })}`);
  }
});

test('build 92: the lintel — a tap lifts nothing; let go, it hangs still; held at one end it tilts past the sling and slips back down', () => {
  const J = F.createLintel92(0, fixed);
  J.hold(true, 0); J.step(0.1); J.hold(false); for (let i = 0; i < 10; i++) J.step(0.1);
  assert.equal(J.state().y, 0, 'a tap: nothing');
  J.hold(true, 0); for (let i = 0; i < 30; i++) J.step(0.1); const y = J.state().y; J.hold(false); for (let i = 0; i < 20; i++) J.step(0.1);
  assert.ok(y > 0 && Math.abs(J.state().y - y) < 1e-9, 'let go: it hangs');
  const J2 = F.createLintel92(1, fixed); J2.hold(true, 1); let slipped = false; for (let i = 0; i < 300 && !slipped; i++) { J2.step(0.05); slipped = J2.state().ph === 'slip'; }
  assert.ok(slipped && J2.state().slips === 1, 'one end held: it slips');
  for (let i = 0; i < 60; i++) J2.step(0.05);
  assert.equal(J2.state().ph, 'lift'); assert.equal(J2.state().y, 0, 'back on the ground, to start again');
});

test('build 92: the lintel — three slips and the crews set it (no stone of his); lowered while it swings, one end misses; rushed, it chips', () => {
  const J = F.createLintel92(2, fixed);
  for (let n = 0; n < 3; n++) { J.hold(true, 1); for (let i = 0; i < 400 && J.state().ph !== 'slip'; i++) J.step(0.05); J.hold(false); for (let i = 0; i < 60 && !J.state().done && J.state().ph === 'slip'; i++) J.step(0.05); }
  assert.ok(J.state().done && J.state().crew && J.state().q === 0);
  const s = careful(F.createLintel92(2, fixed), { rush: true });
  assert.ok(s.done && s.q < 1 && (s.misses > 0 || s.chip), JSON.stringify({ m: s.misses, c: s.chip }));
  assert.ok(F.hold92(0.2) < F.hold92(1.5) && F.hold92(9) === F.LINTEL92.holdMax, 'the longer the hold, the faster');
});

test('build 92: the lintel\'s way — up before the face, swung in over the opening, down onto the jambs', () => {
  const k = { ph: 'lift', y: 0.5 }; assert.ok(Math.abs(F.lintelY92(k) - (F.GATES92.H + F.GATES92.clear) / 2) < 1e-9);
  assert.ok(F.lintelZ92({ ph: 'lift' }) > F.lintelZ92({ ph: 'over' }));
  assert.equal(F.lintelY92({ ph: 'over', low: F.LINTEL92.lowerAm }), F.GATES92.H);
  assert.equal(F.lintelY92({ ph: 'set' }, 18), 18);
});

test('build 92: the leaf — dragged over its socket and held still and straight, its pin goes in; off or leaning, it knocks; the swing by strength', () => {
  const L = F.createLeaf92(false, fixed);
  L.pull(0); L.hold(true); for (let i = 0; i < 30; i++) L.step(0.05);
  assert.equal(L.state().ph, 'hang', 'still moving: the pin does not go down');
  for (let i = 0; i < 200 && L.state().ph === 'hang'; i++) L.step(0.05);
  assert.equal(L.state().ph, 'swing'); assert.equal(L.state().knocks, 0);
  assert.equal(L.flick(0.2), 'weak'); for (let i = 0; i < 80 && L.state().ph !== 'swing'; i++) L.step(0.05);
  assert.equal(L.state().ph, 'swing', 'too soft: it came back'); assert.equal(L.flick(1.0), 'ok');
  for (let i = 0; i < 40; i++) L.step(0.05); assert.ok(L.state().done && L.state().q === 1);
  const H = F.createLeaf92(true, fixed); H.pull(0.9); for (let i = 0; i < 80; i++) H.step(0.05); H.hold(true); for (let i = 0; i < 120 && H.state().knocks === 0; i++) H.step(0.05);
  assert.equal(H.state().knocks, 1, 'off its socket: the pin knocks on the rim');
  const S = F.createLeaf92(true, fixed); S.pull(0); for (let i = 0; i < 120; i++) S.step(0.05); S.hold(true); for (let i = 0; i < 120 && S.state().ph === 'hang'; i++) S.step(0.05);
  assert.equal(S.flick(3), 'slam'); for (let i = 0; i < 40; i++) S.step(0.05); assert.equal(S.state().q, 0.5, 'slammed: כשר');
});

test('build 92: wiring — the parts, the order on the site, the props, the acts; lines sourced and short', () => {
  assert.deepEqual([...PARTS92], ['open', 'lintel', 'lintel2', 'lintel3', 'leaf', 'leaf7', 'names', 'reveal']);
  assert.deepEqual(open63('gates92', PARTS92, []), ['lintel', 'names']);
  assert.deepEqual(open63('gates92', PARTS92, ['lintel']), ['lintel2', 'leaf', 'names']);
  assert.deepEqual(open63('gates92', PARTS92, ['lintel', 'lintel2']), ['lintel3', 'leaf', 'leaf7', 'names']);
  assert.ok(DEP63.gates92 && DEP63.gates.lintel, 'the old order kept for ?h92=0');
  const h = read('src/game/har42.js');
  assert.match(h, /const ON92 = MODE === 'stage' && STG === 'gates' && qs\('h92'\) !== '0'/);
  assert.match(h, /STG === 'gates' \? \(ON92 \? PARTS92 : PARTS47\)/);
  assert.match(h, /function props92\(add\)/); assert.match(h, /function mkLintel92\(i\)/); assert.match(h, /function mkLeaf92\(heavy\)/);
  assert.match(read('src/batch.js'), /uHoleN/);
  for (const k of ['lintel92', 'lintel92b', 'lintel92c', 'leaf92', 'leaf92b']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה|מדות/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head ${t.split(' · ')[0].length}`); }
});
