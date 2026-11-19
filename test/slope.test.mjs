// build 116 — the great stone down the slope (h109/slope.js): its track and its weight
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeTrack, stepStone, limitAt, restAt, SL } from '../src/game/h109/slope.js';
import { BOOK } from '../src/game/world/grid.js';

const T = makeTrack(BOOK.great.track);
// a slope profile like the rock's: steep for the first 45 amot, then level
const sinAt = (s) => (s < 45 ? 0.5 : 0);

test('the track: from the rock in יט־6 to the wall, with two bends', () => {
  assert.equal(BOOK.great.name, 'יט־6');
  const a = T.at(0), b = T.at(T.L);
  assert.ok(Math.hypot(a.x - BOOK.great.x, a.z - BOOK.great.z) < 0.01);
  assert.ok(Math.hypot(b.x - BOOK.great.endX, b.z - BOOK.great.endZ) < 0.6);
  assert.ok(T.L > 120 && T.L < 220, 'length ' + T.L);
  // the last stretch runs north along the wall (heading −z)
  assert.ok(T.at(T.L - 2).tz < -0.97);
  // two separate bends
  let runs = 0, inB = false; for (let s = 0; s < T.L; s += 1) { const b2 = Math.abs(T.at(s).k) > 1 / 70; if (b2 && !inB) runs++; inB = b2; }
  assert.ok(runs >= 2, 'bends ' + runs);
});

test('untouched it stands still on every slope', () => {
  for (const lv of [1, 2, 3]) for (const sin of [0, 0.2, 0.5, 0.7]) {
    const S = restAt(10); for (let i = 0; i < 400; i++) stepStone(S, { pull: 0, side: 0 }, { sin, k: 0, lim: SL.vs[lv - 1], lv }, 0.05);
    assert.equal(S.v, 0); assert.equal(S.s, 10);
  }
});

test('released at the safe speed it stops within a bounded way at every level', () => {
  for (const lv of [1, 2, 3]) {
    const S = { ...restAt(0), v: SL.vs[lv - 1] }; let n = 0;
    while (S.v > 0 && n++ < 2000) stepStone(S, { pull: 0 }, { sin: 0.5, k: 0, lim: SL.vs[lv - 1], lv }, 0.02);
    assert.ok(S.v <= 0, 'stopped'); assert.ok(S.s < 25, 'lv ' + lv + ' ran ' + S.s.toFixed(1));
  }
});

test('held at a full pull from the start it snaps a rope before the first bend ends', () => {
  for (const lv of [1, 2, 3]) {
    const S = restAt(0); let snap = null;
    for (let i = 0; i < 4000 && S.s < T.L && snap == null; i++) { const p = T.at(S.s); const ev = stepStone(S, { pull: 1 }, { sin: sinAt(S.s), k: p.k, lim: limitAt(T, S.s, lv), lv }, 0.02); if (ev.snap) snap = S.s; }
    let bendEnd = 0, seen = false; for (let s = 0; s < T.L; s += 0.5) { const b = Math.abs(T.at(s).k) > 1 / 70; if (b) seen = true; else if (seen) { bendEnd = s; break; } }
    assert.ok(snap != null && snap < bendEnd, 'lv ' + lv + ' snap at ' + snap + ' bend ends ' + bendEnd);
  }
});

test('a careful pull, slowed before the bends and steered, brings it to the end without a snap or leaving the way', () => {
  for (const lv of [1, 2, 3]) {
    const S = restAt(0); let snaps = 0, off = 0;
    for (let i = 0; i < 40000 && S.s < T.L - 2; i++) {
      const p = T.at(S.s), lim = limitAt(T, S.s, lv), soon = T.bend(S.s + 14);
      const want = (soon ? SL.vb[lv - 1] : lim) * 0.7, pull = S.v < want ? want / SL.vmax : 0;
      const side = Math.max(-1, Math.min(1, -S.o * 0.8 - S.a * 6));
      const ev = stepStone(S, { pull, side }, { sin: sinAt(S.s), k: p.k, lim, lv }, 0.02);
      if (ev.snap) snaps++; if (Math.abs(S.o) > SL.half[lv - 1]) off++;
    }
    assert.equal(snaps, 0, 'lv ' + lv); assert.equal(off, 0, 'lv ' + lv + ' o'); assert.ok(S.s >= T.L - 2.5);
  }
});

test('left alone in a bend at level 3 it drifts off the way (the steering is his)', () => {
  const S = restAt(0); let off = false;
  for (let i = 0; i < 40000 && S.s < T.L - 2 && !off; i++) { const p = T.at(S.s), lim = limitAt(T, S.s, 3); stepStone(S, { pull: S.v < 2 ? 0.4 : 0, side: 0 }, { sin: 0, k: p.k, lim, lv: 3 }, 0.02); if (Math.abs(S.o) > SL.half[2]) off = true; }
  assert.ok(off);
});
