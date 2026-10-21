// ── craftb19 ── FUN19 §2 (binding) the rub on the pad (two thumbs: M.pad, the right thumb circles on the work button): a tile per
// scoring act (≈ 1 a second at a brisk rub); gold = the tile in one unbroken stroke at ≥ 2 circles a second; a slow rub earns good;
// taps alone finish it (each tile at most… a tap fill: ok); a brisk rubbing earns ★★★ at L1. The sheet keeps its own measure (minigames.test).
import test from 'node:test';
import assert from 'node:assert/strict';
import { coverSkins } from '../src/game/minigames/cover.js';
import { starsOf } from '../src/game/minigames/index.js';

/** a thumb circling on the pad (hands.js: the pad's units are 160 px): r px round, hz circles a second, lifting every `lift` s (0: never) */
function rub(skin, { level = 0, r = 18, hz = 3, lift = 0, maxS = 90 } = {}) {
  const M = coverSkins[skin].model({ level }); M.pad = true; M.patient = true;
  const dt = 1 / 60; let t = 0, down = false, a = 0, tl = 0;
  while (!M.done && t < maxS) {
    if (!down) { M.drag(0.5, 0.5, 'down', 7); down = true; tl = 0; }
    a += 2 * Math.PI * hz * dt;
    M.drag(0.5 + (r / 160) * Math.cos(a), 0.5 + (r / 160) * Math.sin(a), 'move', 7);
    M.rdt = dt; M.step(dt); M.fx.length = 0; t += dt; tl += dt;
    if (lift && tl >= lift) { M.drag(0.5, 0.5, 'up', 7); down = false; }
  }
  const q = M.result();
  return { M, s: t, q: q.quality, stars: M.done ? starsOf(q.quality) : 0, grades: M.acts.map((x) => x.q).join('') };
}

test('the rub on the pad: a brisk unbroken rub — every tile gold, ★★★ at L1, about a tile a second', () => {
  for (const sk of ['gold', 'plaster', 'bronze']) {
    const r = rub(sk, { hz: 3 });
    assert.ok(r.M.done && r.stars === 3, `${sk}: ★${r.stars} q ${r.q.toFixed(2)} (${r.grades})`);
    assert.equal(r.M.acts.length, r.M.nTiles, `${sk}: one act a tile`);
    assert.ok(r.M.acts.every((x) => x.q === 2), `${sk}: all gold (${r.grades})`);
    const pace = r.M.acts.length / r.s;
    assert.ok(pace >= 0.6 && pace <= 1.6, `${sk}: ${pace.toFixed(2)} acts a second (${r.s.toFixed(1)} s)`);
  }
});
test('the rub on the pad: a slow rub (1 circle a second) finishes at good; lifting between strokes is good too', () => {
  const slow = rub('gold', { hz: 1 });
  assert.ok(slow.M.done && slow.M.acts.every((x) => x.q === 1) && slow.stars === 2, `slow: ★${slow.stars} (${slow.grades}) ${slow.s.toFixed(1)} s`);
  const lifty = rub('gold', { hz: 3, lift: 0.5 });
  assert.ok(lifty.M.done && lifty.M.acts.filter((x) => x.q === 2).length < lifty.M.acts.length / 2, `lifting: (${lifty.grades})`);
  for (const L of [1, 2]) { const r = rub('gold', { level: L, hz: 3 }); assert.ok(r.M.done && r.stars >= 2 && r.s <= 40, `L${L + 1}: ★${r.stars} ${r.s.toFixed(1)} s (${r.grades})`); }
});
test('the rub on the pad: taps alone finish it (the autopilot\'s sweep, a tap fill: ok), never above good', () => {
  const M = coverSkins.plaster.model({ level: 0 }); M.pad = true; M.patient = true;
  const dt = 1 / 60; let t = 0;
  while (!M.done && t < 120) { const a = M.auto(); if (a && typeof a === 'object') M.drag(a.x, a.y, a.p, a.id | 0); M.rdt = dt; M.step(dt); M.fx.length = 0; t += dt; }
  assert.ok(M.done && M.acts.length === M.nTiles && M.acts.every((x) => x.q <= 1), `taps: ${M.acts.map((x) => x.q).join('')} in ${t.toFixed(1)} s`);
  assert.ok(starsOf(M.result().quality) >= 1);
});
test('no act before a touch; the crew never acts under two thumbs', () => {
  const M = coverSkins.gold.model({ level: 0 }); M.pad = true; M.patient = true;
  for (let k = 0; k < 600; k++) { M.rdt = 1 / 60; M.step(1 / 60); }
  assert.equal(M.acts.length, 0); assert.equal(M.tiles, 0);
});
// ── /craftb19 ──

// ── craftb19 ── the saw in the world (FUN19 §2): back and forth, the push cuts (the impact where the push ends — a slow turn too); a tap is
// one push from the ready pose, its impact ≈ 100 ms after the tap; one stroke a tap; taps alone finish (at most good)
import { saw } from '../src/game/minigames/saw.js';
import { plumb } from '../src/game/minigames/plumb.js';
import { twinBurst } from '../src/game/hands.js';
test('the saw in the world: strokes on the beat cut gold, a slow turn still cuts; a tap bites ≈ 100 ms after it; taps alone finish', () => {
  const P = 0.484;   // (124 BPM: the beat; strokes at every beat = ≈ 2 a second)
  globalThis.__CRAFT_BEAT = () => ({ period: P, toNext: P - ((M.t + 0.0001) % P) });
  let M = saw.world.model({ level: 0 }); const dt = 1 / 120;
  // the thumb: up (push) for half a beat, down (pull) for half — the push ending 40 ms after each beat (the touch allowance)
  M.drag(0.5, 0.5, 'down', 7); M.drag(0.5, 0.5, 'move', 7);
  let t = 0; while (!M.done && t < 30) { const y = 0.5 - 0.18 * Math.cos(((t - 0.04) / P) * 2 * Math.PI); M.drag(0.5, y, 'move', 7); M.step(dt); M.fx.length = 0; t += dt; }
  assert.ok(M.done && M.acts.length >= 8, `cuts ${M.acts.length} in ${t.toFixed(1)} s`);
  assert.ok(M.acts.filter((a) => a.q === 2).length >= M.acts.length - 1, `on the beat: ${M.acts.map((a) => a.q).join('')}`);
  // a slow back and forth (the turn slower than the blade): it still cuts at each turn
  globalThis.__CRAFT_BEAT = null;
  M = saw.world.model({ level: 0 }); M.drag(0.5, 0.5, 'down', 7); M.drag(0.5, 0.5, 'move', 7);
  t = 0; while (!M.done && t < 40) { M.drag(0.5, 0.5 + 0.2 * Math.cos(t * 2 * Math.PI * 0.6), 'move', 7); M.step(dt); M.fx.length = 0; t += dt; }
  assert.ok(M.done && M.acts.length >= 8, `slow: cuts ${M.acts.length} in ${t.toFixed(1)} s`);
  // taps (hands.js's burst at 60 fps): one push each, ≈ 100 ms after the tap
  M = saw.world.model({ level: 0 }); const d6 = 1 / 60; let b = null, last = -9, taps = 0; const ms = []; t = 0;
  while (!M.done && t < 60) { if (!b && t - last > 0.3) { b = { t: 0, p0: M.progress | 0 }; last = t; taps++; } if (b) b = twinBurst(M, b, d6, true, false, () => [0.5, 0.5]); const n0 = M.acts.length; M.step(d6); if (M.acts.length > n0) ms.push(Math.round((t - last) * 1000)); M.fx.length = 0; t += d6; }
  assert.ok(M.done && M.acts.length === taps - 1 + (M.acts.length === taps ? 1 : 0) && M.acts.every((a) => a.q <= 1), `taps ${taps} → cuts ${M.acts.length} (${M.acts.map((a) => a.q).join('')})`);
  assert.ok(ms.every((x) => x >= 80 && x <= 120), `the impact after the tap: ${ms.join(',')} ms`);
});
test('the plumb in the world: nothing before a touch; taps alone finish it (the line, then nudges; never a stuck thumb)', () => {
  const M = plumb.world.model({ level: 0, rng: () => 0.7 }); const dt = 1 / 60;
  for (let k = 0; k < 120; k++) M.step(dt);
  assert.equal(M.phase, 'ready'); assert.equal(M.pay, 0);
  let b = null, last = -9, taps = 0, t = 0;
  while (!M.done && t < 40) { if (!b && t - last > 0.45) { b = { t: 0, p0: M.progress | 0 }; last = t; taps++; } if (b) b = twinBurst(M, b, dt, true, false, () => [0.5, 0.5]); M.step(dt); M.fx.length = 0; t += dt; }
  assert.ok(M.done && M.acts.length === 1 && M.acts[0].q <= 1, `taps ${taps}, ${t.toFixed(1)} s, grade ${M.acts.map((a) => a.q)}`);
  assert.ok(t < 12, `done in ${t.toFixed(1)} s`);
});
// ── /craftb19 ──
test('the saw: the touch-down pushes (its bite ≈ 90 ms later); the tap after it only brings the blade back; a drag begun first takes the blade', () => {
  const M = saw.world.model({ level: 0 }); const dt = 1 / 60;
  assert.equal(M.touchPush(), true); let t = 0, at = null;
  while (t < 0.3 && at == null) { M.step(dt); t += dt; if (M.acts.length) at = t; }
  assert.ok(at != null && at >= 0.07 && at <= 0.12, `the bite at ${at && Math.round(at * 1000)} ms`);
  let b = { t: 0, p0: M.progress | 0 }; for (let k = 0; k < 60 && b; k++) { b = twinBurst(M, b, dt, true, false, () => [0.5, 0.5]); M.step(dt); }
  assert.equal(M.acts.length, 1, 'the tap after the touch\'s push: no second push'); assert.ok(M.armed && M.blade > 0.7, 'back at the ready pose, armed');
  assert.equal(M.touchPush(), true); M.step(dt); M.drag(0.5, 0.5, 'down', 7); for (let k = 0; k < 20; k++) M.step(dt);
  assert.equal(M.acts.length, 1, 'a drag begun before the bite takes the blade over (no act from the touch)');
});
