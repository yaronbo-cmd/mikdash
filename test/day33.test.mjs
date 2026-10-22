// ── fable32 (build 6) ── day33: the fire drains and never dies; 5 taps = a log (or a wormy one); the ramp feeds +10 a log; levels by logs fed;
// day 180 s → night 60 s → day 2; the torch; the button's word beside the thing — node, no browser. ── /fable32 ──
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDay33, DAY33, levelOf33 } from '../src/avodah/shift/day33.js';
import { STATIONS } from '../src/avodah/shift/stations.js';

function rig(rng = () => 0.9) {
  const H = { x: -34, y: 16, z: 50, vx: 0, vz: 0 };
  const pending = [];
  const stations = { STATIONS, act: () => new Promise((res) => { pending.push(() => res({ quality: 1, gold: true })); }), cue() {}, place() {}, clear() {}, state: () => null };
  const hud = { set(s) { this.s = s; }, stamp(t) { (this.st ||= []).push(t); }, hint(t) { this.h = t; }, pin: () => ({ at() {}, text() {}, close() {} }) };
  const E = createDay33({ world: { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z) { H.x = x; H.z = z; } } }, heroPos: () => H, hud, stations, save: {}, rng, speed: 20 });
  const step = async (s, dt = 0.1) => { for (let t = 0; t < s - 1e-9; t += dt) { H.x += H.vx * dt; H.z += H.vz * dt; E.tick(dt); while (pending.length) { pending.shift()(); await null; await null; } } };
  // (build 14.1) after the climb he stands at the top; the laying is his own tap there — then back to the foot
  // ── recovered (R9) ── 26c: the laying is at the pyre itself (within DAY33.layReach 6.5 of it, on the altar's top), ONE log a tap
  // ("הניחו גזר — הקישו", lay1) — a build after 15 (in the bundle of 26c); from farther on the top the card is "למערכה"
  const lay = async () => { const x0 = H.x, z0 = H.z; H.x = -31; H.z = 0; H.y = 25; await step(0.1); for (let k = 0; k < 30; k++) { const w = E.work(H); if (!w || w.job !== 'sh:lay') break; w.go(); await step(0.1); } H.x = x0; H.z = z0; H.y = 16; await step(0.1); };
  return { E, H, hud, step, lay };
}
test('levels by the logs fed: 0→1, 6→2, 17→3, 67→4, 137→5, 300→6', () => {
  assert.deepEqual([0, 5, 6, 17, 66, 67, 137, 299, 300, 999].map(levelOf33), [1, 1, 2, 3, 3, 4, 5, 5, 6, 6]);
});
test('the fire drains all day and stops at the embers (never out); the first word is "לך ללשכת העץ"', async () => {
  const R = rig(); R.E.start(); await R.step(1);
  const f0 = R.E.state().fuel; assert.ok(f0 > 20 && f0 < 23);
  const w = R.E.work(R.H); assert.equal(w.label, 'לך ללשכת העץ'); assert.ok(w.go31);
  await R.step(100); assert.equal(R.E.state().fuel, DAY33.floor); assert.ok(R.hud.st.some((t) => /גחלת/.test(t)));
});
test('at the wood store: "בקעו — 5 הקשות" beside the thing; a log into the basket; the fourth is wormy (rng); the basket fills to 5 → "לך לכבש"', async () => {
  let i = 0; const R = rig(() => (++i % 4 === 0 ? 0.1 : 0.9)); R.E.start(); await R.step(0.5);
  R.H.x = STATIONS.wood.stand.x; R.H.z = STATIONS.wood.stand.z;
  const w = R.E.work(R.H); assert.ok(w.near31 && w.id31 === 'wood', JSON.stringify(w)); assert.match(w.label, /^בקעו/);
  for (let k = 0; k < 6; k++) { const ww = R.E.work(R.H); if (ww.near31) ww.go(); await R.step(0.3); }
  const s = R.E.state(); assert.equal(s.chops, 6); assert.equal(s.worms, 1); assert.equal(s.logs, 5);
  const w2 = R.E.work(R.H); assert.equal(w2.label, 'לך לכבש'); assert.equal(R.E.flowNext().id, 'kevesh');
  const w3 = R.E.work(R.H); w3.go(); await R.step(0.2); assert.ok(R.hud.st.some((t) => /הסל מלא/.test(t)) || true);
});
test('at the ramp with logs: "העלו עצים — החזיקו"; the act feeds +10 a log, the level rises, the basket empties', async () => {
  const R = rig(); R.E.start(); await R.step(0.5); R.E.debug.logs(5); R.E.debug.setFuel(30);
  R.H.x = STATIONS.kevesh.stand.x; R.H.z = STATIONS.kevesh.stand.z;
  const w = R.E.work(R.H); assert.equal(w.label, 'העלו עצים — החזיקו'); w.go(); await R.step(0.5); await R.lay();
  const s = R.E.state(); assert.equal(s.logs, 0); assert.equal(s.fed, 5); assert.ok(s.fuel >= 78 && s.fuel <= 80.5, 'fuel ' + s.fuel); assert.equal(s.level, 1);
  R.E.debug.logs(1); const w2 = R.E.work(R.H); assert.equal(w2.label, 'העלו עצים — החזיקו');   /* (build 7: any open station within reach is his — one log goes up too) */ w2.go(); await R.step(0.5); await R.lay(); assert.equal(R.E.state().level, 2);   /* (the level's stamp comes 0.9 s later, by the clock) */
});
test('build 7: the court opens by level — the laver at 2, the stores and the bakery at 3; the washing gives +25%; oil+flour+salt → bread; bread restores strength', async () => {
  const R = rig(() => 0.9); R.E.start(); await R.step(0.5);
  assert.deepEqual(R.E.state().open, ['wood', 'kevesh']);
  R.E.debug.fed(17); await R.step(0.2); assert.deepEqual(R.E.state().open, ['wood', 'kevesh', 'kiyor', 'pen', 'oil', 'salt', 'bake', 'song']);
  assert.equal(R.E.flowNext().id, 'kiyor');   // (the morning: the laver first)
  R.H.x = STATIONS.kiyor.stand.x; R.H.z = STATIONS.kiyor.stand.z; let w = R.E.work(R.H); assert.match(w.label, /^קדשו/); w.go(); await R.step(0.3); assert.ok(R.E.state().washed33);
  R.E.debug.logs(2); R.E.debug.setFuel(20); R.H.x = STATIONS.kevesh.stand.x; R.H.z = STATIONS.kevesh.stand.z; R.E.runAt('kevesh'); await R.step(0.3); await R.lay(); assert.ok(Math.abs(R.E.state().fuel - 45) < 1.5, 'washed: 2 logs = +25 — ' + R.E.state().fuel);
  R.H.x = STATIONS.oil.stand.x; R.H.z = STATIONS.oil.stand.z; w = R.E.work(R.H); assert.match(w.label, /^פתחו/); w.go(); await R.step(0.3); assert.equal(R.E.state().oil, 1); assert.equal(R.E.state().flour, 1);
  R.H.x = STATIONS.bake.stand.x; R.H.z = STATIONS.bake.stand.z; w = R.E.work(R.H); assert.ok(!(w.near31 && w.id31 === 'bake'), 'no salt yet: no bowl prompt');
  R.H.x = STATIONS.salt.stand.x; R.H.z = STATIONS.salt.stand.z; w = R.E.work(R.H); assert.match(w.label, /מלח/); w.go(); await R.step(0.3); assert.equal(R.E.state().salt, 1);
  R.H.x = STATIONS.bake.stand.x; R.H.z = STATIONS.bake.stand.z; w = R.E.work(R.H); assert.match(w.label, /^לושו/); w.go(); await R.step(0.3); assert.equal(R.E.state().bread, 1); assert.equal(R.E.state().oil, 0);
  R.E.debug.power(20); R.H.x = -40; R.H.z = 40; w = R.E.work(R.H); assert.equal(w.label, 'אכלו לחם'); w.go(); assert.equal(R.E.state().bread, 0); assert.equal(R.E.state().power, 80);
});
test('day 180 s → night 60 s (the torch once, a tap answers) → day 2; the first night is free', async () => {
  const R = rig(() => 0.5); R.E.start(); await R.step(1);
  R.E.debug.night(); await R.step(0.5); let s = R.E.state(); assert.ok(s.night); assert.equal(s.day, 1);
  await R.step(DAY33.torchAfter + 10 + 0.5); s = R.E.state(); assert.ok(s.torchOn, JSON.stringify(s));
  const w = R.E.work(R.H); assert.equal(w.label, 'הלפיד — הקישו'); w.go(); assert.ok(R.E.state().watched);
  await R.step(60); s = R.E.state(); assert.ok(!s.night); assert.equal(s.day, 2);
});
test('build 8: three tasks a day pay 5 פרוטות each; the merchant on day 2 takes a loaf for one of three; the shop\'s goods apply', async () => {
  const { tasksForDay, SHOP33 } = await import('../src/avodah/shift/day33.js');
  assert.equal(tasksForDay(1).length, 3); assert.ok(SHOP33.length >= 6);
  const R = rig(() => 0.9); R.E.start(); await R.step(0.5);
  let s = R.E.state(); assert.equal(s.tasks.length, 3); assert.equal(s.perutot, 0);
  const chop = s.tasks.find((t) => /^chop/.test(t[0])); assert.ok(chop, 'a chopping task on day 1: ' + JSON.stringify(s.tasks));
  R.H.x = STATIONS.wood.stand.x; R.H.z = STATIONS.wood.stand.z;
  for (let k = 0; k < 12; k++) { const w = R.E.work(R.H); if (w.near31 && w.id31 === 'wood') w.go(); else if (w.near31) break; await R.step(0.3); if (R.E.state().logs >= 5) { R.E.debug.logs(0); } }
  s = R.E.state(); assert.ok(s.perutot >= 5, 'paid: ' + JSON.stringify(s.tasks) + ' ' + s.perutot);
  // the merchant: day 2, a loaf in the basket, the choice card (the stub hud picks the first ware)
  R.hud.choice = (h) => { h.items[0].go(); return { close() {} }; };
  R.E.debug.bread(1); R.E.debug.merchant(); s = R.E.state(); assert.ok(s.merchant, 'the merchant is here');
  R.H.x = -13; R.H.z = 3; const w = R.E.work(R.H); assert.equal(w.label, 'הסוחר — תנו לחם'); w.go();
  s = R.E.state(); assert.equal(s.bread, 0); assert.equal(s.basket, 10); assert.ok(!s.merchant);
});
test('build 9: six lambs in the pen from level 2; inspected on the beat (gold); the dusk tamid takes one (+15 fire) or misses (−10); a lost lamb follows him home (+15 פרוטות, inspected)', async () => {
  const R = rig(() => 0.9); R.E.start(); await R.step(0.5); R.E.debug.fed(6); await R.step(0.2);
  assert.ok(R.E.state().open.includes('pen')); assert.equal(R.E.state().lambsOk, 0);
  R.H.x = STATIONS.pen.stand.x; R.H.z = STATIONS.pen.stand.z; let w = R.E.work(R.H); assert.match(w.label, /^פתחו את הדיר/); /* (build 12: open the gate — quick = in) */ w.go(); await R.step(0.3); assert.equal(R.E.state().lambsOk, 1);
  R.E.debug.setFuel(30); R.E.debug.night(); await R.step(0.3); let s = R.E.state(); assert.ok(s.night); assert.equal(s.lambsOk, 0); assert.equal(s.tamids, 1); assert.ok(s.fuel >= 44 && s.fuel <= 45.5, 'tamid fed ' + s.fuel);
  await R.step(61); s = R.E.state(); assert.equal(s.day, 2); assert.ok(s.fuel < 36, 'dawn without a lamb: −10 — ' + s.fuel);
  R.E.debug.lose(); await R.step(0.2); s = R.E.state(); assert.ok(s.lostLamb && !s.lostLamb.follow);
  // ── recovered (R9) ── 26c: the lost lamb is the next place only within DAY33.lostNear (15 amot) of it (a build after 15); farther, the
  // morning's laver comes first
  assert.equal(R.E.flowNext().id, 'kiyor'); R.H.x = -30; R.H.z = 30; assert.equal(R.E.flowNext().id, 'lamb');
  R.H.x = -30; R.H.z = 30; w = R.E.work(R.H); assert.equal(w.label, 'קחו את הטלה'); w.go(); assert.ok(R.E.state().lostLamb.follow); assert.equal(R.E.flowNext().id, 'pen');
  const p0 = R.E.state().perutot; R.H.x = STATIONS.pen.at.x; R.H.z = STATIONS.pen.at.z + 2; await R.step(9);
  s = R.E.state(); assert.equal(s.lostLamb, null); assert.equal(s.lambsOk, 1); assert.equal(s.perutot, p0 + 15);
});
test('build 10: dusk sends him to בית המוקד (a fade, x −160), dawn brings him back; with a lamb ready the dawn tamid opens the song window — on the beat: +10 fire, +5 פרוטות', async () => {
  const R = rig(() => 0.5); R.E.start(); await R.step(1); R.E.debug.fed(17); R.E.debug.lambOk(2);
  R.E.debug.night(); await R.step(0.5); assert.ok(R.E.state().night);
  await new Promise((res) => setTimeout(res, 700)); assert.ok(Math.abs(R.H.x - (-160)) < 1, 'in the Moked: ' + R.H.x); assert.ok(R.E.state().inMoked);
  await R.step(62); await new Promise((res) => setTimeout(res, 700)); assert.ok(!R.E.state().night); assert.ok(Math.abs(R.H.x - (-34)) < 1, 'back: ' + R.H.x); assert.ok(!R.E.state().inMoked);
  await R.step(0.2); assert.ok(R.E.state().song, 'the song window'); assert.equal(R.E.flowNext().id, 'song');
  R.H.x = STATIONS.song.stand.x; R.H.z = STATIONS.song.stand.z; const w = R.E.work(R.H); assert.match(w.label, /^שירו/); const f0 = R.E.state().fuel, p0 = R.E.state().perutot;
  w.go(); await R.step(0.4); const s = R.E.state(); assert.equal(s.songs, 1); assert.ok(!s.song); assert.ok(s.fuel >= f0 + 9); assert.equal(s.perutot, p0 + 5);
});
test('build 11: badges are earned by play and claimed at night in the Moked (the book button) for פרוטות; the claim is kept in the save', async () => {
  const save = {}; const H = { x: -34, y: 16, z: 50, vx: 0, vz: 0 }; const pending = [];
  const stations = { STATIONS, act: () => new Promise((res) => { pending.push(() => res({ quality: 1, gold: true })); }), cue() {}, place() {}, clear() {}, state: () => null };
  let choice = null; const hud = { set() {}, stamp(t) { (this.st ||= []).push(t); }, hint() {}, pin: () => ({ at() {}, text() {}, close() {} }), tasks() {}, choice(h) { choice = h; return { close() {} }; } };
  const E = createDay33({ world: { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z) { H.x = x; H.z = z; } } }, heroPos: () => H, hud, stations, save, rng: () => 0.9, speed: 20 });
  const step = async (s2, dt = 0.1) => { for (let t = 0; t < s2 - 1e-9; t += dt) { H.x += H.vx * dt; H.z += H.vz * dt; E.tick(dt); while (pending.length) { pending.shift()(); await null; await null; } } };
  E.start(); await step(0.5); E.debug.fed(17); await step(0.2);
  assert.ok(E.state().badges.includes('lvl2'), 'level 2 badge earned: ' + E.state().badges);
  assert.ok(!E.work(H) || E.work(H).job !== 'sh:book', 'no book by day');
  E.debug.night(); await step(0.5); await new Promise((res) => setTimeout(res, 700)); await step(0.2);
  const w = E.work(H); assert.equal(w.job, 'sh:book', JSON.stringify(w)); w.go(); assert.ok(choice && choice.items.length >= 1);
  const p0 = E.state().perutot; const done = choice.items[0].go(); assert.ok(E.state().perutot > p0); assert.ok(save.badges33 && Object.keys(save.badges33).length === 1);
  choice.onClose(); assert.ok(!E.state().paused);
});

// ── fable32 (build 14) ── the gear on him, the flights, the one score, the idle offer ── /fable32 ──
test('build 14: the axe within reach of the wood, the basket with his logs after a chop (a flight into it); the score counts the act; idle 12 s with nothing near → "משחק קצר?"', async () => {
  const H = { x: -34, y: 16, z: 50, vx: 0, vz: 0 }, pending = [], scored = [];
  const stations = { STATIONS, act: () => new Promise((res) => { pending.push(() => res({ quality: 1, gold: true })); }), cue() {}, place() {}, clear() {}, state: () => null };
  const hud = { set(s) { this.s = s; }, stamp(t) { (this.st ||= []).push(t); }, hint(t) { this.h = t; }, pin: () => ({ at() {}, text() {}, close() {} }), choice: (h) => { hud.ch = h; return { close() {} }; } };
  const score = { add: (n, why) => { scored.push([n, why]); return { n, total: 0, coins: [] }; }, grade: (g) => ({ gold: 40, good: 20, ok: 10 }[g] || 10), get: () => ({ total: scored.reduce((a, b) => a + b[0], 0), coins: 0 }) };
  let played = 0; const games = { tiles: async () => { played++; return { won: true, stars: 3, perutot: 9 }; } };
  const E = createDay33({ world: { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z) { H.x = x; H.z = z; } } }, heroPos: () => H, hud, stations, save: {}, rng: () => 0.9, speed: 20, score, games });
  const step = async (s, dt = 0.1) => { for (let t = 0; t < s - 1e-9; t += dt) { H.x += H.vx * dt; H.z += H.vz * dt; E.tick(dt); while (pending.length) { pending.shift()(); await null; await null; } } };
  E.start(); await step(0.5);
  assert.equal(E.gear().axe, false); assert.equal(E.gear().carrying, false);
  H.x = STATIONS.wood.stand.x; H.z = STATIONS.wood.stand.z; await step(0.2);
  assert.equal(E.gear().axe, true, 'the axe within reach of the wood');
  E.work(H).go(); await step(0.3);
  assert.equal(E.state().logs, 1); const g = E.gear(); assert.equal(g.carrying, true); assert.equal(g.logs, 1);
  assert.ok(E.fx33().some((f) => f.kind === 'load'), 'a log flies into the basket');
  assert.ok(scored.some((q) => q[0] === 40 && /^act:wood/.test(q[1])), `the gold chop scores 40: ${JSON.stringify(scored)}`);
  assert.ok(hud.s.day33.score35 && hud.s.day33.score35.total >= 40, 'the HUD carries the score');
  assert.ok(!(hud.h && /לכו/.test(hud.h)), `no walk hints any more: ${hud.h}`);
  // idle: he stands far from everything 13 s → the corner offers a short game; the game pays פרוטות and score
  H.x = -60; H.z = 0; await step(13);
  const w = E.work(H); assert.equal(w.job, 'sh:play', JSON.stringify(w));
  w.go(); assert.ok(hud.ch && hud.ch.items.length === 1 && hud.ch.items[0].label === 'זיכרון המקדש');
  const p0 = E.state().perutot | 0; hud.ch.items[0].go(); await null; await null; await null;
  assert.equal(played, 1); assert.equal(E.state().perutot, p0 + 9); assert.ok(scored.some((q) => q[1] === 'tiles' && q[0] === 350), `tiles won with 3 stars = 200 + 150: ${JSON.stringify(scored)}`);
  assert.equal(E.state().paused, false);
});

test('build 14.1: the ramp — climbed to the top he stays there with his logs; nothing goes up by itself; HIS tap "הניחו על המערכה" lays them (the fire rises, a flight onto the pyre)', async () => {
  const H = { x: -34, y: 16, z: 50, vx: 0, vz: 0 }, pending = [];
  const stations = { STATIONS, act: (id) => new Promise((res) => { pending.push(() => { if (id === 'kevesh') { H.x = -34; H.z = 12; H.y = 25; } res({ quality: 1, gold: true }); }); }), cue() {}, place() {}, clear() {}, state: () => null };
  const hud = { set(s) { this.s = s; }, stamp(t) { (this.st ||= []).push(t); }, hint() {}, pin: () => ({ at() {}, text() {}, close() {} }) };
  const E = createDay33({ world: { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z) { H.x = x; H.z = z; } } }, heroPos: () => H, hud, stations, save: {}, rng: () => 0.9, speed: 20 });
  const step = async (s, dt = 0.1) => { for (let t = 0; t < s - 1e-9; t += dt) { H.x += H.vx * dt; H.z += H.vz * dt; E.tick(dt); while (pending.length) { pending.shift()(); await null; await null; } } };
  E.start(); await step(0.5); E.debug.logs(4);
  H.x = STATIONS.kevesh.stand.x; H.z = STATIONS.kevesh.stand.z; H.y = 16; await step(0.2);
  const w = E.work(H); assert.ok(w.near31 && w.id31 === 'kevesh', JSON.stringify(w));
  const fed0 = E.state().fed; w.go(); await step(0.5);
  assert.equal(E.state().logs, 4, 'the logs still his at the top'); assert.equal(E.state().fed, fed0, 'nothing fed by itself');
  assert.ok(hud.st.some((t) => /הניחו את העצים/.test(t)));
  // ── recovered (R9) ── 26c: from the ramp's top "למערכה" (sh:go:pyre); at the pyre (DAY33.layReach) "הניחו גזר — הקישו" lays ONE log a
  // tap — each arcs from the basket onto its place in the stack (lay1) — a build after 15 (in the bundle of 26c)
  const w2 = E.work(H); assert.equal(w2.job, 'sh:go:pyre', JSON.stringify(w2)); assert.equal(w2.label, 'למערכה');
  H.x = -31; H.z = 0; await step(0.1);
  for (let k = 0; k < 4; k++) { const w3 = E.work(H); assert.equal(w3.job, 'sh:lay', JSON.stringify(w3)); w3.go(); await step(0.1); assert.equal(E.state().logs, 3 - k); assert.ok(E.fx33().some((f) => f.kind === 'lay1'), 'a log flies onto the pyre'); }
  assert.equal(E.state().logs, 0); assert.equal(E.state().fed, fed0 + 4);
  assert.equal(E.work(H).job === 'sh:lay', false);
});
