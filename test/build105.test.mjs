// ── build 105 ── stage 10 (גוף המזבח והכבש) rebuilt: the kevesh under the maul and the straight-edge, the whitewash with a cloth (lish105.js), and their wiring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/lish105.js';

const seeded = (s = 1) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

/** a hand on one kevesh stone: careful (the stone's hint) or rushing (full blows while it stands proud) */
function playStone(i, hand = 'ok', seed = 3) {
  const J = F.createStone105(i, seeded(seed)), dt = 1 / 30; J.place(); let t = 0, want = 1;
  while (!J.state().done && t < 300) {
    t += dt; const k = J.state();
    if (!k.held) { const h = hand === 'rush' && k.e > 0.15 ? { x: 0, h: 1 } : J.hint(); if (h && !h.wait && J.hold(h.x)) want = h.h; }
    else if (k.h >= want) J.release();
    J.step(dt);
  }
  return J.state();
}

test('the kevesh: careful blows lay all five stones true — מהודר', () => {
  for (let s = 1; s <= 4; s++) { const qs = [0, 1, 2, 3, 4].map((i) => playStone(i, 'ok', s * 7 + i).q); assert.deepEqual(qs, [1, 1, 1, 1, 1], `seed ${s}`); assert.equal(F.kevQ105(qs), 1); }
});

test('the kevesh: full blows sink stones too deep — the crew fills under them, the grade is lost, the roller knocks', () => {
  const ks = [0, 1, 2, 3, 4].map((i) => playStone(i, 'rush', 7 + i));
  assert.ok(ks.every((k) => k.done), 'every stone ends true in the end');
  assert.ok(ks.some((k) => k.refills > 0)); assert.ok(F.kevQ105(ks.map((k) => k.q)) < 1);
  assert.deepEqual(F.roller105(ks), ks.filter((k) => k.refills > 0).map((k) => k.row));
});

test('the maul: from too low it only bounces; the higher, the deeper', () => {
  const sink = (h) => { const J = F.createStone105(0, () => 0.5); J.place(); const e0 = J.state().e; J.hold(0); for (let n = 0; n < 200 && J.state().h < h; n++) J.step(1 / 60); const r = J.release(); return { r, d: e0 - J.state().e }; };
  assert.equal(sink(0.1).r, 'bounce'); assert.equal(sink(0.1).d, 0);
  const a = sink(0.5), b = sink(1); assert.equal(a.r, 'blow'); assert.ok(b.d > a.d * 1.5, `${a.d} ${b.d}`);
});

test('the straight-edge: rocks on a proud or tilted stone, flat on a true one, light under a sunk one; lifted and filled again', () => {
  const J = F.createStone105(2, () => 0.9); J.place(); assert.equal(J.edge(), 'rock');
  const k = J.state(); k.e = 0; k.t = 0.3; assert.equal(J.edge(), 'rock', 'tilted'); k.t = 0; assert.equal(J.edge(), 'flat');
  k.e = -0.2; assert.equal(J.edge(), 'light'); let r = ''; for (let n = 0; n < 100 && r !== 'refill'; n++) r = J.step(1 / 30);
  assert.equal(r, 'refill'); assert.equal(k.refills, 1); assert.ok(k.e > 0); assert.equal(J.hold(0), false, 'no blow while they lift it');
});

test('the heavy end: the blow falls where the finger holds — on the high end the tilt comes down', () => {
  const J = F.createStone105(2, () => 0.9); J.place(); const t0 = J.state().t; assert.ok(Math.abs(t0) > F.KEV105.tolT[3]);
  J.hold(Math.sign(t0)); for (let n = 0; n < 30; n++) J.step(1 / 30); J.release(); assert.ok(Math.abs(J.state().t) < Math.abs(t0));
});

test('wet fill: the stone goes on sinking after the blow', () => {
  const J = F.createStone105(3, () => 0.5); J.place(); J.hold(0); for (let n = 0; n < 30; n++) J.step(1 / 30); J.release();
  const e1 = J.state().e; for (let n = 0; n < 60; n++) J.step(1 / 30); assert.ok(J.state().e < e1 - 0.02, `${e1} → ${J.state().e}`);
});

/** a hand on one face: row by row from the top, round the red line; the rush lingers (drips) */
function playFace(i, hand = 'ok') {
  const J = F.createSid105(i), dt = 1 / 30; let t = 0, P = null; J.tool('cloth');
  while (!J.state().done && t < 600) {
    t += dt; const h = J.hint();
    if (h.kind === 'dip') { J.up(); P = null; J.dip(); }
    else if (h.kind === 'to') {
      const tx = h.row != null ? (h.ltr ? F.SID105.cols - 0.5 : 0.5) : h.x, ty = h.y;
      if (!P || (h.row != null && Math.abs(P[1] - ty) > 0.01) || (h.row == null && Math.hypot(P[0] - h.x, P[1] - h.y) > 1.5)) { J.up(); P = [h.x, h.y]; J.down(P[0], P[1]); }
      const linger = hand === 'rush' && Math.floor(t) % 6 === 3, dx = tx - P[0], dy = ty - P[1], d = Math.hypot(dx, dy), m = Math.min(d, 7 * dt);
      if (!linger && d > 0) { P = [P[0] + (dx / d) * m, P[1] + (dy / d) * m]; J.move(P[0], P[1]); }
    }
    J.step(dt);
  }
  return J;
}

test('the whitewash: careful rows cover every face round the red line — מהודר', () => {
  const qs = [0, 1, 2].map((i) => { const J = playFace(i); assert.equal(J.state().done, true); assert.ok(J.cover() >= F.SID105.need); assert.equal(J.faults(), 0, `face ${i}`); return J.state().q; });
  assert.deepEqual(qs, [1, 1, 1]); assert.equal(F.sidQ105(qs), 1);
});

test('the whitewash: a cloth held still drips; a drip left to dry is a fault; one wiped is not', () => {
  const J = F.createSid105(0); J.tool('cloth'); J.dip(); J.down(5, 4);
  for (let n = 0; n < 60; n++) J.step(1 / 30); assert.ok(J.state().drips.length >= 1, 'a drip');
  J.up(); const d = J.state().drips[0]; J.down(d.x, d.y); J.up(); assert.equal(d.gone, true); assert.equal(J.state().wiped >= 1, true);
  const K = F.createSid105(2); K.tool('cloth'); K.dip(); K.down(5, 2); for (let n = 0; n < 40; n++) K.step(1 / 30); K.up();
  for (let n = 0; n < 200; n++) K.step(1 / 30); assert.ok(K.state().dried >= 1); assert.ok(K.faults() >= 1);
});

test('the whitewash: the iron trowel is stopped, not counted; the red line touched turns pink — a fault', () => {
  const J = F.createSid105(1); assert.equal(J.tool('iron'), 'stop'); assert.equal(J.state().tool, null); assert.equal(J.faults(), 0);
  J.tool('cloth'); J.dip(); J.down(3, J.bandRow + 0.5); J.move(6, J.bandRow + 0.5); J.up(); assert.ok(J.state().pinkEv >= 1); assert.ok(J.cells().pink.some((x) => x));
});

test('the whitewash: in the sun, lime over dried white lime leaves a lap', () => {
  const J = F.createSid105(2); J.tool('cloth'); J.dip(); J.down(2, 2); J.move(8, 2); J.up();
  for (let n = 0; n < 120; n++) J.step(1 / 30); J.dip(); J.down(2, 2); J.move(8, 2); J.up(); assert.ok(J.state().lapEv >= 1);
  const E = F.createSid105(0); E.tool('cloth'); E.dip(); E.down(2, 2); E.move(8, 2); E.up(); for (let n = 0; n < 120; n++) E.step(1 / 30); E.dip(); E.down(2, 2); E.move(8, 2); E.up(); assert.equal(E.state().lapEv, 0, 'not on the first face');
});

test('lines and sources: every line sourced or marked, no Divine Name', () => {
  for (const [key, l] of Object.entries(F.L105)) assert.ok(/ · (טיוטה|המחשה)$/.test(l), key);
  for (const l of F.SRC105) assert.ok(/(טיוטה|המחשה)$/.test(l), l);
  const all = Object.values(F.L105).concat(F.SRC105).join(' '); assert.ok(!/יהוה|אלהים|ה׳/.test(all));
});

test('wiring: stage 10 takes the new parts, each part begins its act; the old stage behind ?h105=0', () => {
  const H = fs.readFileSync(new URL('../src/game/har42.js', import.meta.url), 'utf8');
  assert.match(H, /const ON105 = MODE === 'stage' && STG === 'guf' && qs\('h105'\) !== '0'/);
  assert.match(H, /STG === 'guf' \? \(ON105 \? F105\.PARTS105 : PARTS57\)/);
  assert.ok(H.includes("\n    makevet: { begin() { st.job = mkMakevet105(); } },"));
  assert.ok(H.includes("\n    sidud: { begin() { st.job = mkSidud105(); } },"));
  assert.deepEqual(F.PARTS105.slice(1, -1), Object.keys(F.DEP105));
  const S = fs.readFileSync(new URL('../src/game/site63.js', import.meta.url), 'utf8');
  assert.match(S, /guf: Object\.freeze\(\{[^}]*makevet: \[\], sidud: \['makevet'\]/);
});

test('the stage\'s new end (the owner 5.11 20:02): stage 10 ends on its own altar — the kohen up the kevesh, the slow orbit, a small card at the foot', () => {
  const H = fs.readFileSync(new URL('../src/game/har42.js', import.meta.url), 'utf8');
  assert.ok(H.includes("const c105 = endCfg105(); if (c105) { revBegin105(c105); return; }"), 'the reveal takes the new end');
  assert.ok(H.includes('if (st.rev && st.rev.cfg) finishCard105(st.rev.cfg); else finishCard();'));
  assert.match(H, /\.h42-card\.h105-end\{align-items:flex-end;/);
  assert.match(H, /<details class="h105-src"><summary>מקורות<\/summary>/, 'the sources folded away');
  assert.match(H, /function endCfg105\(\) \{\n    if \(!ON105\) return null;/, 'only stage 10 for now');
});
