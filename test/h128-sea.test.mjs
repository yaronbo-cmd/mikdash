// build 128, part 3: the sea's rules (brief §4) as the station plays them — the rope's four bands, the hand, the swells and their low
// ropes, what stays from one work to the next on the same ship, the swells the drawing gets, the hold's swells, the named mistakes
// the bot makes (a torn rope, a ring pulled out, a hand off at a swell), and that nothing is random.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/game/h128/model.js';

const DT = 1 / 60;
// the clean player (as test/h128-model.test.mjs's): before each swell the low ropes low in the quiet band, the others high
function seaBot(id, opt = {}) {
  const s = M.seaFresh(id, opt.carry), L = M.SEA_LV[id];
  let cur = 0;
  for (let k = 0; k < 60 * 120 && !s.done; k++) {
    const w = s.sw.find((x) => !x.back) || s.sw[s.sw.length - 1];
    const want = {};
    if (w && s.t > w.t0 - 5.5) {
      const { crest, back } = M.lowRopes(w.head);
      for (const r of M.ROPES) {
        const R = s.ropes[r];
        if (crest.includes(r)) want[r] = R.worn ? 0.36 : (L.D >= 0.4 ? 0.4 : 0.45);
        else if (back.includes(r)) want[r] = R.worn ? 0.45 : 0.6;
        if (crest.includes(M.partnerOf(r)) && !crest.includes(r) && s.ropes[M.partnerOf(r)].worn) want[r] = 0.63;
      }
    }
    if (opt.mistake) opt.mistake(s, want);
    const keys = Object.keys(want).filter((r) => Math.abs(s.ropes[r].tgt - want[r]) > 0.01);
    let inp = {};
    if (keys.length) { const r = keys[cur++ % keys.length]; inp = { rope: r, dy: Math.max(-40, Math.min(40, (want[r] - s.ropes[r].tgt) / M.H128.GAIN)) }; }
    M.seaStep(s, inp, DT);
    if (opt.each) opt.each(s);
  }
  return s;
}

test('the rope is the gauge: four bands at 0.30, 0.70, 0.90 (the brief\'s table)', () => {
  assert.deepEqual([0, 0.29, 0.3, 0.5, 0.7, 0.71, 0.9, 0.91, 1.2].map(M.bandOf), ['slack', 'slack', 'quiet', 'quiet', 'quiet', 'sings', 'sings', 'frays', 'frays']);
});

test('the hand: 120 px toward the player hauls 0.5, away pays out; the rope follows with a short lag; let go, it stays (the wet rope only eases)', () => {
  const s = M.seaFresh('sea1'), t0 = s.ropes.portFore.t;
  M.seaStep(s, { rope: 'portFore', dy: 120 }, DT);
  assert.ok(Math.abs(s.ropes.portFore.tgt - (t0 + 0.5)) < 1e-3);
  assert.ok(s.ropes.portFore.t < t0 + 0.2, 'the lag');
  for (let i = 0; i < 30; i++) M.seaStep(s, {}, DT);
  assert.ok(Math.abs(s.ropes.portFore.t - s.ropes.portFore.tgt) < 0.02, 'caught up within half a second');
  const held = s.ropes.portFore.t;
  for (let i = 0; i < 120; i++) M.seaStep(s, {}, DT);
  assert.ok(held - s.ropes.portFore.t <= M.SEA_LV.sea1.drift * 2 + 1e-6, 'two seconds untouched: only the drift');
  M.seaStep(s, { rope: 'portFore', dy: -240 }, DT);
  assert.ok(s.ropes.portFore.tgt < held - 0.9);
});

test('a swell: the deck tips away from it; the two low ropes take D at the crest, the other two D/2 on the back roll', () => {
  const want = { port: ['stbdFore', 'stbdAft'], stbd: ['portFore', 'portAft'], bow: ['portAft', 'stbdAft'], stern: ['portFore', 'stbdFore'] };
  for (const h of M.HEADS) {
    const { crest, back } = M.lowRopes(h);
    assert.deepEqual(crest, want[h], h); assert.equal(back.length, 2); assert.ok(back.every((r) => !crest.includes(r)));
  }
  // sea1's first swell (port): a rope's load at its crest is D on the low side
  const s = M.seaFresh('sea1'), w = s.sw[0];
  M.seaStep(s, { rope: 'stbdFore', dy: 0.15 / M.H128.GAIN }, DT);   // (set in the quiet band: an untouched rope eases into the slack by then)
  while (s.t < w.t0 - DT / 2) M.seaStep(s, {}, DT);
  M.seaStep(s, {}, DT);
  assert.ok(Math.abs(s.ropes.stbdFore.load - M.SEA_LV.sea1.D) < 0.02, 'crest load ' + s.ropes.stbdFore.load);
  assert.ok(s.ropes.portFore.load < 0.01);
});

test('the swells the drawing gets: the model\'s headings and crest times on the sea\'s clock; sea2\'s are taller; the next one to come', () => {
  const s1 = M.seaFresh('sea1'), s2 = M.seaFresh('sea2');
  assert.deepEqual(M.swellsOf(s1, 5).map((w) => [w.head, w.t0]), M.SEA_LV.sea1.heads.map((h, i) => [h, M.SEA_LV.sea1.first + i * M.SEA_LV.sea1.gap + 5]));
  assert.ok(M.swellsOf(s2)[0].H > M.swellsOf(s1)[0].H);
  let n = M.nextSwell(s1); assert.equal(n.i, 0); assert.equal(n.head, 'port'); assert.ok(n.in >= 6, 'seen at least 6 s before');
  while (!s1.sw[0].crest) M.seaStep(s1, {}, DT);
  n = M.nextSwell(s1); assert.equal(n.i, 1); assert.equal(n.head, 'bow'); assert.ok(n.in > 10);
  // every swell of both works comes at least 6 s after the one before it (time to read it in the lifted view)
  for (const id of ['sea1', 'sea2']) { const L = M.SEA_LV[id]; assert.ok(L.first >= 6 && L.gap >= 10, id); }
});

test('the bot\'s mistakes: "snap" tears a rope (one −20, sea.torn), "ring" pulls a ring (sea.ring), each stays (a knot)', () => {
  // snap: one rope hauled into the frays band and held there (a strand parts at 3 s; the worn rope tears at 3 s more)
  let ev = [];
  let s = seaBot('sea1', { mistake: (x, want) => { if (x.t > 1 && x.t < 8.5) want.portAft = 1.0; }, each: (x) => { ev = ev.concat(x.ev.map((e) => e.e)); } });
  assert.deepEqual(ev.filter((e) => e === 'strand' || e === 'torn'), ['strand', 'torn']);
  assert.equal(s.flags['sea.torn'], 1); assert.equal(s.flags['sea.ring'], 0); assert.equal(s.dmg, 1); assert.equal(M.seaPts(s), 10);
  assert.equal(s.ropes.portAft.knot, 1);
  // ring: the first swell's low ropes (port swell: starboard side low) left high in the sings band: both rings come out
  s = seaBot('sea1', { mistake: (x, want) => { const w = x.sw[0]; if (!w.crest && x.t > w.t0 - 5) { want.stbdFore = 0.8; want.stbdAft = 0.8; } } });
  assert.equal(s.flags['sea.ring'], 2); assert.equal(s.flags['sea.torn'], 0); assert.equal(M.seaPts(s), 10);
});

test('what stays on the ship: a rope worn in sea1 is worn in sea2 (limit 0.8), its knot drawn; sea1\'s damage is not sea2\'s', () => {
  const s1 = seaBot('sea1', { mistake: (x, want) => { if (x.t > 1 && x.t < 8.5) want.stbdFore = x.t < 4.6 ? 1.0 : 0.5; } });
  assert.equal(s1.ropes.stbdFore.worn, 1); assert.equal(s1.dmg, 0, 'a strand alone is no damage');
  const torn = seaBot('sea1', { mistake: (x, want) => { if (x.t > 1 && x.t < 8.5) want.portAft = 1.0; } });
  const carry = M.seaCarry(torn, M.seaCarry(s1, {}));
  assert.deepEqual(carry.worn, { stbdFore: 1, portAft: 1 }); assert.deepEqual(carry.torn, { portAft: 1 }); assert.deepEqual(carry.knot, { portAft: 1 });
  const s2 = M.seaFresh('sea2', carry);
  assert.equal(s2.ropes.stbdFore.worn, 1); assert.equal(s2.ropes.portAft.knot0, 1); assert.equal(s2.dmg, 0);
  // the carried worn rope pulls its ring at 0.8, as sea2's own worn rope does: at the first starboard swell (port side low)
  const s3 = seaBot('sea2', { carry: { worn: { portFore: 1 } }, mistake: (x, want) => { const w = x.sw[0]; if (!w.crest && x.t > w.t0 - 5.5) want.portFore = 0.5; } });
  assert.ok(s3.ropes.portFore.ring >= 1); assert.equal(s3.sw[0].clean, 0);
  // and the clean player with that carry still plays sea2 to 40
  assert.equal(M.seaPts(seaBot('sea2', { carry: { worn: { stbdFore: 1 } } })), 40);
});

test('the hold: its swells come from fixed headings, seen from far; "slip" (a hand left off at a swell) brings that swell again', () => {
  const s = M.holdFresh();
  assert.equal(M.holdSwell(s), null);
  M.holdStep(s, { L: true, R: true }, DT);
  const w = M.holdSwell(s); assert.equal(w.head, M.HOLD.heads[0]); assert.ok(w.t0 - s.t >= 6 - 1e-6);
  // the slipping hands are fixed per swell (R, L, R …: HOLD.order after each held swell): the first slipped thumb stays off through one swell
  let ev = [], lifted = { L: 0, R: 0 }, lazy = null;
  for (let k = 0; k < 60 * 90 && !s.done; k++) {
    const inp = { L: true, R: true };
    for (const h of ['L', 'R']) { if (s.off[h] && !lifted[h]) { inp[h] = false; lifted[h] = 1; } else if (!s.off[h]) lifted[h] = 0; }
    if (!lazy) { const h = ['L', 'R'].find((q) => s.off[q]); if (h) lazy = { h, until: s.swells + 1 }; }
    if (lazy && s.swells < lazy.until) inp[lazy.h] = false;
    M.holdStep(s, inp, DT); ev = ev.concat(s.ev.map((e) => e.e + (e.hand ? ':' + e.hand : '')));
  }
  assert.ok(s.done); assert.equal(s.held, 3);
  assert.equal(ev.filter((e) => e === 'again').length, 1, ev.join(' '));
  assert.equal(ev.find((e) => e.startsWith('off')), 'off:' + M.HOLD.order[1], 'the first swell slips the hand the table names');
  assert.ok(ev.includes('calm'));
});

test('nothing random at play time: the same hand gives the same sea, the same hold, the same Akko', () => {
  const run = () => { const s = seaBot('sea2', { mistake: (x, want) => { if (x.t > 2 && x.t < 9) want.stbdAft = 0.97; } }); return JSON.stringify([s.t, s.dmg, s.flags, s.sw.map((w) => w.clean), Object.values(s.ropes).map((r) => [+r.t.toFixed(6), r.worn, r.ring, r.torn])]); };
  assert.equal(run(), run());
  const ak = () => { const s = M.akkoFresh(); for (let k = 0; k < 600; k++) M.akkoStep(s, { hx: 0, hy: M.ringY(s.t) }, DT); return JSON.stringify([s.phase, s.tries, +s.t.toFixed(4)]); };
  assert.equal(ak(), ak());
});
