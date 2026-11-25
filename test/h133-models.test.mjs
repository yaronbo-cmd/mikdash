// build 133 — stage 10's pure models (spec docs/specs/shlav-10-he.md): the stage's flow and save, and each work's rules played by a
// bot to its best and to its losses (the loss table's rows), with no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN, STAGE_FLOW, createH133, stage, lossPts, mulOf, LOSS, slabOfBad } from '../src/game/h133/model.js';
import * as N from '../src/game/h133/nail-model.js';
import * as MB from '../src/game/h133/malben-model.js';
import * as K from '../src/game/h133/kevesh-model.js';
import * as NM from '../src/game/h133/nima-model.js';

const dt = 1 / 60;
test('the stage: 1 and 2 open, 3 waits for 1, 4 for 2 and 3; done after four; then each station at its next level', () => {
  assert.equal(PLAN.length, 12); assert.deepEqual([...STAGE_FLOW], ['nail1', 'malben1', 'kevesh1', 'nima1']);
  const M = createH133(null);
  assert.deepEqual(M.open().map((m) => m.id), ['nail1', 'malben1']);
  M.pick('nail1'); M.done({ stars: 3, pts: 100 });
  assert.deepEqual(M.open().map((m) => m.id), ['malben1', 'kevesh1']);
  M.pick('kevesh1'); M.done({ stars: 2 });
  assert.deepEqual(M.open().map((m) => m.id), ['malben1']);
  M.pick('malben1'); M.done({ stars: 2 }); assert.deepEqual(M.open().map((m) => m.id), ['nima1']);
  M.pick('nima1'); M.done({ stars: 1 }); assert.ok(M.finished());
  assert.deepEqual(M.open().map((m) => m.id), ['nail2', 'malben2', 'kevesh2', 'nima2']);
  assert.equal(mulOf(1), 1); assert.equal(mulOf(2), 2); assert.equal(mulOf(3), 4);
  for (const f of Object.keys(LOSS)) { assert.equal(lossPts(f, 1), 20); assert.equal(lossPts(f, 3), 80); }
});
test('the world from the save: each row by its own work; flaws kept where they happened; a kevesh replay sets its slabs\' flaws aside', () => {
  const M = createH133(null);
  M.pick('nail1'); assert.equal(M.flaw('nail.bad', {}), 20); assert.equal(M.flaws('nail.bad')[0].slab, 1); M.done({ stars: 1 });
  assert.equal(slabOfBad(7), 2);
  let w = stage('kevesh', 1, M.st); assert.deepEqual([w.stock, w.upper, w.ramp, w.head], [true, false, false, false]);
  M.pick('kevesh1'); assert.equal(M.flaws('nail.bad').length, 0, 'set aside while slabs 1–3 are re-seated');
  M.flaw('kevesh.lip', { slab: 2 }); M.done({ stars: 2 });
  assert.equal(M.flaws('kevesh.lip')[0].slab, 2);
  w = stage('nima', 1, M.st); assert.equal(w.ramp, true); assert.equal(w.upper, false);
  const L = createH133(null); const got = L.autoTo((m) => m.id === 'nima3');
  assert.equal(got && got.id, 'nima3'); assert.ok(['nail1', 'malben1', 'kevesh1'].every((id) => L.isDone(id))); assert.equal(L.finished(), false, 'the page does not end the stage before nima3 opens (review round, build 133)');
});

/* ── work 1: a bot that runs every edge at a good speed and stops at the flaw ── */
function nailBot(lv, o = {}) {
  const S = N.fresh(lv), ev = [];
  while (!N.done(S)) {
    const s = N.cur(S);
    for (let e = 0; e < s.edges; e++) {
      const E = N.edgeOf(S);
      for (const mo of E.moss) for (let w = 0; w < 2; w++) { const a = mo.a + 0.02, b = mo.b - 0.02; ev.push(...N.glide(S, a, b, 300, 0.1).events, ...N.glide(S, b, a, 300, 0.1).events); }
      // (the moss wiped: a flaw under it is seen at once — the thumb goes to it and stops)
      if (E.moss.length && E.bad != null && !o.miss && E.moss.some((mo) => E.bad >= mo.a && E.bad <= mo.b)) { ev.push(...N.glide(S, E.bad - 0.04, E.bad, 300, 0.05).events, ...N.stop(S, E.bad)); }
      if (o.mud && E.mud.length) ev.push(...N.stop(S, E.mud[0]));
      let u = 0; while (u < 1 && !N.edgeOf(S).ck) { const u1 = Math.min(1, u + 0.02); ev.push(...N.glide(S, u, u1, 300, 0.02).events); if (E.bad != null && u1 >= E.bad && !o.miss) { ev.push(...N.stop(S, E.bad)); } u = u1; }
      if (s.edges > 1) N.rotate(S);
    }
    const bad = !!s.bad; ev.push(...N.sort(S, o.wrong ? (bad ? 'basket' : 'pile') : bad ? 'pile' : 'basket'));
  }
  return { S, ev, R: N.result(S) };
}
test('work 1 (הציפורן): a perfect check on every level; mud is a wrong mark; a flawed stone to the basket is damage', () => {
  for (const lv of [1, 2, 3]) { const { R } = nailBot(lv); assert.equal(R.perfect, true, 'level ' + lv); assert.equal(R.stars, 3); }
  const m = nailBot(1, { mud: true }); assert.ok(m.R.flags.wrong >= 1); assert.equal(m.R.flags.dmg, 0);
  const w = nailBot(1, { wrong: true }); assert.ok(w.ev.some((e) => e.k === 'back'), 'the free trial: the first stone back'); assert.ok(w.R.flags.dmg >= 1); assert.ok(w.ev.some((e) => e.k === 'badIn'));
  const S = N.fresh(1); assert.deepEqual(N.sort(S, 'basket'), [{ k: 'shake' }], 'no sort before the edge is checked');
  assert.equal(N.glide(N.fresh(1), 0, 0.5, 700, 0.1).glint, 'smear');
});

/* ── work 2: pull the frame to the middle, lower it ── */
function malbenBot(lv, aim = 0) {
  const S = MB.fresh(lv);
  for (let i = 0; i < 400 && !MB.land; i++) break;
  for (let r = 0; r < 12; r++) {
    for (const [ax, plus, minus] of [['dx', 'E', 'W'], ['dz', 'S', 'N']]) {
      const e = S[ax] - aim; if (Math.abs(e) < 0.03 || !MB.can(S, plus)) continue;
      MB.pull(S, e > 0 ? minus : plus, Math.abs(e) / (MB.MK.GAIN * MB.MK.TAU));
    }
    if (lv >= 3 && Math.abs(S.a) > 0.05) MB.turn(S, -Math.sign(S.a), Math.abs(S.a) / (MB.MK.TURN * MB.MK.TAU));
    for (let i = 0; i < 180; i++) MB.step(S, dt);
  }
  return { S, L: MB.land(S), R: MB.result(S) };
}
test('work 2 (המלבן במרכז): centred and square on every level is gold; a side two tefachim off cracks the step', () => {
  for (const lv of [1, 2, 3]) { const { L, R } = malbenBot(lv); assert.equal(L.grade, 'gold', 'level ' + lv + ' err ' + L.err); assert.equal(R.perfect, true); }
  const S = MB.fresh(1); const L = MB.land(S); assert.equal(L.grade, null); assert.equal(L.crack, 'E'); assert.equal(MB.result(S).stars, 1);
  const T = MB.fresh(1); assert.equal(MB.pull(T, 'N', 50), false, 'level 1: north and south locked');
});

/* ── works 3 and 4: the three states, a bot that pulls, coasts, brakes and lets go when still ── */
function stopDist(mo, brake) { let v = mo.v, b = brake ? mo.brake : 0, d = 0; for (let i = 0; i < 900 && v > 0; i++) { if (brake) b = Math.min(1, b + dt / 0.5); v = Math.max(0, v - (mo.g + (brake ? b * mo.brakeMax : 0)) * dt); if (mo.slow && v > mo.slow.v && mo.s + d > mo.len - mo.slow.d) v = Math.max(mo.slow.v, v - mo.slow.b * dt); d += v * dt; } return d; }
function drive(stepF, S, moOf, doneF, target = 0, early = false) {
  let T = 0, ph = 'pull', hold = 0; const out = [];
  while (!doneF(S) && T < 200) {
    const mo = moOf(S), rem = mo.len - mo.s - target, inp = { side: Math.max(-1, Math.min(1, mo.x * 1.5)) };
    if (ph === 'pull') { inp.pull = true; if (S.way && S.way.turn != null && mo.s < S.way.turn ? mo.v > 1.0 : stopDist(mo, false) >= rem - 0.3) ph = 'coast'; }
    else if (ph === 'coast') { if (stopDist(mo, true) >= rem || (mo.v <= 0.001 && mo.still > 0.02)) { ph = 'brake'; hold = 0; } if (S.way && S.way.turn != null && mo.s < S.way.turn && mo.v < 0.3) ph = 'pull'; }
    else if (ph === 'brake') { inp.brake = true; if (Math.abs(mo.v) < 1e-3) hold += dt; if (hold > (early ? -1 : 0.35)) ph = 'rel'; }
    else ph = 'pull';
    for (const e of stepF(S, inp, dt)) { out.push(e); if (e.k === 'seated' || e.k === 'again') ph = 'pull'; }
    T += dt;
  }
  return out;
}
test('work 3 (הכבש): a patient bot seats every slab gold; a release while it moves leaves a lip; a slide to the foot cracks it', () => {
  for (const lv of [1, 2]) { const S = K.fresh(lv); const out = drive(K.step, S, (s) => s.mo, K.done); const seated = out.filter((e) => e.k === 'seated'); assert.equal(seated.length, lv === 1 ? 3 : 6); assert.ok(seated.every((e) => e.lip === 'none'), JSON.stringify(seated)); assert.ok(K.result(S).stars >= 2, 'level ' + lv); }
  const S = K.fresh(1); for (let i = 0; i < 40; i++) K.step(S, { pull: true }, dt); for (let i = 0; i < 6; i++) K.step(S, { brake: true }, dt);
  const ev = K.step(S, {}, dt); const st = ev.find((e) => e.k === 'seated'); assert.ok(st && st.lip === 'lip' && st.loss === 20);
  // the free trial: the first slab slides back without a crack; the second cracks
  const C = K.fresh(1); for (let i = 0; i < 20; i++) K.step(C, { pull: true }, dt); let a = [];
  for (let i = 0; i < 1200 && !a.some((e) => e.k === 'again'); i++) a = a.concat(K.step(C, {}, dt));
  assert.ok(a.some((e) => e.k === 'again' && e.free)); assert.equal(C.cracked, 0);
  C.free = false; for (let i = 0; i < 20; i++) K.step(C, { pull: true }, dt); a = [];
  for (let i = 0; i < 1200 && !a.some((e) => e.k === 'cracked'); i++) a = a.concat(K.step(C, {}, dt));
  assert.equal(C.cracked, 1);
});
/** work 4's bot: as drive(), and a short nudge when the stone stops short of the face */
function nimaBot(lv) {
  const S = NM.fresh(lv); let T = 0, ph = 'pull', hold = 0, nudge = 0;
  while (!NM.done(S) && T < 60) {
    const mo = S.mo, rem = mo.len - mo.s - 0.008, inp = {};
    if (ph === 'pull') { inp.pull = true; const turnAhead = S.way.turn != null && mo.s < S.way.turn; if (turnAhead ? mo.v > 1.0 : stopDist(mo, false) >= rem - 0.15) ph = 'coast'; }
    else if (ph === 'coast') { if (mo.v <= 0.001) { if (rem > 0.012) { ph = 'nudge'; nudge = 0; } else { ph = 'brake'; hold = 0; } } else if (stopDist(mo, true) >= rem && stopDist(mo, false) > rem) { ph = 'brake'; hold = 0; } }
    else if (ph === 'nudge') { inp.pull = true; nudge += dt; if (nudge >= 0.05 || stopDist(mo, false) >= rem) ph = 'coast'; }
    else if (ph === 'brake') { inp.brake = true; if (Math.abs(mo.v) < 1e-3) hold += dt; if (hold > 0.35) ph = 'rel'; }
    NM.step(S, inp, dt);
    if (S.way.turn != null && mo.s < S.way.turn && ph === 'coast' && mo.v < 0.3) ph = 'pull';
    T += dt;
  }
  return S;
}
test('work 4 (מלא נימא): a hair\'s gap is gold on every level (level 3 with the clean turn); a touch scratches after the free trial', () => {
  for (const lv of [1, 2, 3]) {
    const S = nimaBot(lv);
    const g = NM.gapOf(S); assert.ok(g > 0 && g <= 1 / 60 + 1e-9, 'level ' + lv + ' gap ' + g);
    assert.equal(NM.result(S).flags.touched, false);
    if (lv === 3) assert.equal(S.turn, 'clean');
  }
  const S = NM.fresh(1); S.free = false; let ev = [];
  for (let i = 0; i < 400 && !ev.some((e) => e.k === 'touch'); i++) ev = ev.concat(NM.step(S, { pull: true }, dt));
  assert.ok(ev.some((e) => e.k === 'touch' && e.loss === 20)); assert.equal(S.touched, true);
});
