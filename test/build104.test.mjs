// ── build 104 ── stage 09 (הסובב וחוט הסיקרא) rebuilt: the corner by the plumb, the red line round the altar (lish104.js), and their wiring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/lish104.js';

const seeded = (s = 1) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

/** a hand on one corner stone: lower, then follow the stone's hint (careful) or shove (rush) */
function playCorner(i, hand = 'ok', seed = 3) {
  const J = F.createCorner104(i, seeded(seed)), dt = 1 / 30; let t = 0;
  while (!J.state().done && t < 400) {
    t += dt; const k = J.state();
    if (k.ph === 'hang') { const h = J.hint(); J.lower(hand === 'rush' ? true : h.hold, dt); }
    else if (k.ph === 'set' && Math.round(t / dt) % 10 === 0) {
      const h = J.hint();
      if (h.kind === 'tap') J.tapBob();
      else if (h.kind === 'turn') J.twist(h.da);
      else if (h.kind === 'push') { if (hand === 'rush') J.push(h.du * 3, h.dv * 3); else J.push(h.du, h.dv); }
    }
    J.step(dt);
  }
  return J.state();
}

test('the corner: lowered with care it lands softly; held all the way it lands hard and goes back up', () => {
  const k = playCorner(0, 'ok'); assert.equal(k.done, true); assert.equal(k.hard, 0);
  const J = F.createCorner104(0, seeded(5)); let r = 'down', n = 0; while (r === 'down' && n++ < 2000) r = J.lower(true, 1 / 30);
  assert.equal(r, 'hard'); assert.equal(J.state().hard, 1); assert.ok(J.state().h > 0.5, 'back up');
});

test('the corner: the stone sticks under a small push and jumps past it; a shove is counted', () => {
  const J = F.createCorner104(1, seeded(7)); while (J.state().ph === 'hang') J.lower(J.hint().hold, 1 / 30);
  assert.equal(J.state().ph, 'set');
  assert.equal(J.push(0.02, 0), 'stick');
  const u0 = J.state().u; assert.equal(J.push(F.CORNER104.fs[2], 0), 'jump'); assert.ok(J.state().u > u0);
  assert.equal(J.push(-0.6, 0), 'shove'); assert.equal(J.state().shoves, 1);
});

test('the corner: careful hands true all four stones מהודר; a rushing hand loses the grade', () => {
  const qs = [0, 1, 2, 3].map((i) => playCorner(i, 'ok', 11 + i).q);
  assert.deepEqual(qs, [1, 1, 1, 1]); assert.equal(F.cornerQ104(qs), 1);
  const rq = [0, 1, 2, 3].map((i) => playCorner(i, 'rush', 11 + i)); assert.ok(rq.some((k) => k.q < 1), JSON.stringify(rq.map((k) => [k.hard, k.shoves, k.crosses])));
});

test('the corner: it is not true while the bob swings, nor while a face crosses the line', () => {
  const J = F.createCorner104(0, seeded(9)); while (J.state().ph === 'hang') J.lower(J.hint().hold, 1 / 30);
  J.swingBob(1, 0); assert.equal(J.readable(), false);
  for (let n = 0; n < 60; n++) J.step(1 / 30); assert.notEqual(J.state().ph, 'true');
  const k = J.state(); k.rot = 0; k.u = 0.2; k.v2 = -0.02; assert.ok(J.ext().u > F.CORNER104.over);
});

test('וכנס אמה: the peg within a tefach of one amah', () => {
  assert.equal(F.reed104(1), 'ok'); assert.equal(F.reed104(1.1), 'ok'); assert.equal(F.reed104(0.7), 'short'); assert.equal(F.reed104(1.3), 'long');
});

/** a hand on the red line: start at h0, each side's end at the level (or the hint), snap with pull/along */
function playSikra({ h0 = 5, err = 0, pull = 0.5, along = 0, close = true } = {}) {
  const J = F.createSikra104(); J.setStart(h0); J.releaseStart(); let guard = 0;
  while (!J.state().done && guard++ < 20) {
    J.setEnd(J.hintEnd(close) + err); J.releaseEnd(); for (let n = 0; n < 120; n++) J.step(1 / 30);
    const r = J.snap(pull, along); if (r === 'smear' || r === 'askew') return { J, r };
  }
  return { J, r: 'done' };
}

test('the red line: level all round from the middle — closed, מהודר', () => {
  const { J } = playSikra(); const k = J.state(); assert.equal(k.done, true); assert.equal(k.q, 1); assert.ok(k.closure < 0.01); assert.equal(k.sides.length, 4);
});

test('the red line: an error carries round; ended by the level alone it leaves a step at the last corner', () => {
  const J = F.createSikra104(); J.setStart(5); J.releaseStart();
  for (let s = 0; s < 4; s++) { J.setEnd(J.state().yA + 0.06); J.releaseEnd(); J.snap(0.5, 0); }
  const k = J.state(); assert.equal(k.done, true); assert.ok(k.closure > 1, `step ${k.closure}`); assert.ok(k.q < 1);
});

test('the red line: the level leans with the cord and settles; faint, smear and askew snaps', () => {
  const J = F.createSikra104(); J.setStart(5); J.releaseStart(); J.setEnd(5.4);
  for (let n = 0; n < 200; n++) J.step(1 / 30); assert.ok(J.level() > 0.5); assert.equal(J.atNotch(), false);
  J.setEnd(5); for (let n = 0; n < 200; n++) J.step(1 / 30); assert.equal(J.atNotch(), true);
  J.releaseEnd(); assert.equal(J.snap(0.1, 0), 'faint'); assert.equal(J.snap(1.5, 0), 'smear'); assert.equal(J.snap(0.5, 0.4), 'askew');
  assert.equal(J.state().washes, 2); assert.equal(J.snap(0.5, 0), 'line'); assert.equal(J.state().sides[0].q, 0.5, 'washed: כשר at most');
});

test('the red line: started off the middle by a tefach and a half and more — no grade for that side', () => {
  const { J } = playSikra({ h0: 5 + 2 * F.TEFACH }); assert.equal(J.state().sides[0].q, 0);
});

test('lines and sources: every line sourced or marked, no Divine Name', () => {
  for (const [key, l] of Object.entries(F.L104)) assert.ok(/ · (טיוטה|המחשה)$/.test(l), key);
  for (const l of F.SRC104) assert.ok(/(טיוטה|המחשה)$/.test(l), l);
  const all = Object.values(F.L104).concat(F.SRC104).join(' '); assert.ok(!/יהוה|אלהים|ה׳/.test(all));
});

test('wiring: stage 09 takes the new parts, each part begins its act; the old stage behind ?h104=0', () => {
  const H = fs.readFileSync(new URL('../src/game/har42.js', import.meta.url), 'utf8');
  assert.match(H, /const ON104 = MODE === 'stage' && STG === 'sovev' && qs\('h104'\) !== '0'/);
  assert.match(H, /STG === 'sovev' \? \(ON104 \? F104\.PARTS104 : PARTS56\)/);
  for (const p of ['plumb', 'sikra']) assert.ok(H.includes(`\n    ${p}: { begin() { st.job = mk`), p);
  assert.deepEqual(F.PARTS104.slice(1, -1), Object.keys(F.DEP104));
  const S = fs.readFileSync(new URL('../src/game/site63.js', import.meta.url), 'utf8');
  assert.match(S, /sovev: Object\.freeze\(\{[^}]*plumb: \[\], sikra: \['plumb'\]/);
});
