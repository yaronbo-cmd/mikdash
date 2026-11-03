// build 90: the owner, 3.11 20:51, on 89 — the slab's turn "jumps artificially from side to side" (now it follows the finger with its
// weight); the turn belongs on the slab itself (across on the slab turns it, his hand steadies the swing across too); "the yellow flashes
// don't look good — are they needed?" (a job's place on the site is a stake with a cloth). Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F84 from '../src/game/soreg84.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42 } from '../src/game/har42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const base = { tol: 0.1, tolZ: 0.1, tolR: 0.1, damp: 0.3, sway0: 0, swayZ0: 0, twist0: 0, r0: 0, vChip: 1, vBreak: 1.8, wind: 0 };

test('build 90: GAME_BUILD 90', () => { assert.equal(GAME_BUILD, 92); });

test('build 90: one big jump of the finger is not one jump of the slab — it follows over several frames, a little past, then settles', () => {
  const H = F84.createHoist84(base); H.twistBy(Math.PI / 2, 0); const r = [];
  for (let n = 0; n < 90; n++) { H.step(1 / 60, 0, 0, false); r.push(H.state().r); }
  assert.ok(r[0] < 0.2, `not at once (${r[0].toFixed(3)})`); assert.ok(r[8] > 0.4 && r[8] < Math.PI / 2, 'on its way');
  const peak = Math.max(...r); assert.ok(peak > Math.PI / 2 && peak < Math.PI / 2 + 0.35, `a little past (${peak.toFixed(3)})`);
  assert.ok(Math.abs(r[89] - Math.PI / 2) < 0.05, 'and settles on it');
});

test('build 90: his hand on the slab steadies its swing across as well', () => {
  const run = (held) => { const H = F84.createHoist84({ ...base, sway0: 0.3 }); for (let n = 0; n < 120; n++) H.step(1 / 60, 0, 0, held); return Math.abs(H.state().x); };
  assert.ok(run(true) < run(false) * 0.5);
});

test('build 90: wiring — across on the slab turns it; let go ends the turn; the site marks are stakes', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /st84\.grab && ON89 && st84\.J\) \{ const gx/); assert.match(h, /st84\.J\.twistEnd\(\)/);
  assert.match(h, /function mark90\(g\)/); assert.match(h, /if \(ON89\) mark90\(g\); else/);
  assert.ok(LINE42.lat84.split(' · ')[0].length <= 50 && /המחשה/.test(LINE42.lat84));
});
