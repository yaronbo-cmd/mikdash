// ── fable32 (build 27) ── the second lot's two blood roles, "מי שוחט, מי זורק" (יומא ב, ג; תמיד ד, א), on the day engine in node
// (test/rig33.mjs): the lot and its schedule, the morning held, the shochet (the binding, the great gate, the cut on the needle's gold),
// the zorek (the stream, the swirl and the clot, the two gifts below the thread, the five lamps first, the rest on the yesod), the
// records, the views; the sound kit's new names; the module's texts (checked on Sefaria) and a scan of the new files for a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { POOL26, P26, P27, BLOOD27, needle27, stream27, throw27, rings27, bookOf23 } from '../src/avodah/shift/day33.js';
import { createSound } from '../src/avodah/sound.js';
import { SOUNDS } from '../src/game/audio.js';
import { rig, FLAGS } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
async function morning(role, flags = FLAGS, save) {
  const R = rig(flags, save ? { save } : {});
  R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22();
  if (role) R.E.debug.skip26(role);
  await R.step(0.1);
  return R;
}
async function lot2(R) {
  R.at(-60, 30); await R.step(0.3);
  const K = R.E.p23(); assert.ok(K && K.k26, 'the second lot began');
  for (let i = 0; i < 200 && R.E.p23(); i++) { if (R.E.p23().ph === 'raise') R.E.p23raise(); await R.step(0.1); }
  return R.E.role26();
}
async function atRing(role) {
  const R = await morning(role), a = role === 'shochet' ? P27.stand : P27.recv;
  R.at(a.x + 1, a.z); await R.step(0.6);
  return R;
}
async function toCut(R) {   // the shochet: bound, the gate open (the inner roles' winners: gateNpc s after the lot), the needle on
  R.E.r27bind(true); await R.step(P27.bound + 0.1);
  for (let i = 0; i < 200 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
  return R.E.r27();
}
async function tapAt(R, lo, hi) {
  for (let i = 0; i < 400; i++) { const u = R.E.r27().u; if (u >= lo && u <= hi) return R.E.r27tap(); await R.step(0.01, 0.01); }
  return null;
}
async function zorekAt(phase) {
  const R = await atRing('zorek');
  for (let i = 0; i < 300 && R.E.r27().ph !== 'recv'; i++) await R.step(0.1);
  const K = R.E.r27();
  for (let i = 0; i < 300 && K.ph === 'recv'; i++) { R.E.r27move(K.sp - K.pos); await R.step(0.05, 0.05); }
  await R.step(P27.full + 0.1);
  if (phase === 'carry') return R;
  for (let i = 0; i < 300 && !(R.E.men5t() != null && R.E.st33.t > R.E.men5t()); i++) { R.E.r27swirl(0.7); await R.step(0.1); }
  R.at(P27.at.NE.x, P27.at.NE.z); await R.step(0.1); await R.step(0.5);
  return R;
}

test('build 27: POOL26 — the shochet and the zorek built (with o.p27); P26.open: morning 4 the shochet, 5 the zorek', () => {
  assert.deepEqual([...BLOOD27], ['shochet', 'zorek']);
  for (const id of BLOOD27) assert.equal(POOL26.find((r) => r.id === id).built, true, id);
  assert.deepEqual([...P26.open], ['menorah', 'inner', 'menorah', 'shochet', 'zorek']);
});
test('build 27: the second lot — the fourth morning the shochet, the fifth the zorek; without p27 neither is drawn', async () => {
  const save = (h) => ({ roles26: { m: h.length, h: h.map((r, i) => [i + 1, r]) } });
  assert.equal(await lot2(await morning(null, FLAGS, save(['menorah', 'inner', 'menorah']))), 'shochet');
  assert.equal(await lot2(await morning(null, FLAGS, save(['menorah', 'inner', 'menorah', 'shochet']))), 'zorek');
  const off = await lot2(await morning(null, { ...FLAGS, p27: false }, save(['menorah', 'inner', 'menorah'])));
  assert.ok(off === 'inner' || off === 'menorah', String(off));
});
test('build 27: from the sixth morning the draw is among the four built roles and never yesterday\'s', async () => {
  for (const yest of ['shochet', 'zorek', 'menorah', 'inner'])
    for (let s = 1; s <= 3; s++) {
      const h = ['menorah', 'inner', 'menorah', 'shochet', yest];
      const R = await morning(null, FLAGS, { roles26: { m: 5, h: h.map((r, i) => [i + 1, r]) } });
      const role = await lot2(R);
      assert.notEqual(role, yest, `seed ${s}: ${yest} twice`);
      assert.ok(['shochet', 'zorek', 'inner', 'menorah'].includes(role));
    }
});
test('build 27: his blood role holds the morning (gate27): the clock and the stations wait; the way is to the ring, not the Heichal', async () => {
  const R = await morning('shochet');
  assert.equal(R.E.gate27(), true); assert.equal(R.E.gate26(), false);
  const f = R.E.flowNext(); assert.equal(f.id, 'r27'); assert.deepEqual([f.at.x, f.at.z], [P27.stand.x, P27.stand.z]);
  assert.match(R.E.work(R.H).label, /טבעות/); assert.match(R.E.step17().text, /השחיטה/);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); assert.equal(await R.E.runAt('wood'), false);
  const left = R.E.state().left; await R.step(2); assert.equal(R.E.state().left, left, 'the clock waits');
  const Z = await morning('zorek'); const g = Z.E.flowNext(); assert.deepEqual([g.at.x, g.at.z], [P27.recv.x, P27.recv.z]);
});
test('build 27: the rings\' floor is walkable (the place of slaughter, north of the altar), the hook pillars\' row is not', () => {
  for (const p of [P27.ring, P27.stand, P27.recv, P27.lamb]) assert.equal(rings27(p.x, p.z), true, JSON.stringify(p));
  assert.equal(rings27(-40, -58), false); assert.equal(rings27(-40, -20), false);
});
test('build 27: the shochet — within reach of his place it begins; the binding by hand: a short drag is a free retry, then bound', async () => {
  const R = await morning('shochet'); R.at(P27.stand.x + P27.reach + 1, P27.stand.z); await R.step(0.3); assert.ok(!R.E.r27(), 'out of reach');
  R.at(P27.stand.x + 1, P27.stand.z); await R.step(0.6);
  assert.equal(R.E.r27().ph, 'bind'); assert.equal(R.E.r27().role, 'shochet');
  assert.equal(R.E.r27bind(false), false); assert.equal(R.E.r27().ph, 'bind'); assert.equal(R.E.r27().rebinds, 1);
  assert.equal(R.E.r27bind(true), true); assert.equal(R.E.r27().ph, 'bound');
  assert.deepEqual(R.ev('r27bind').map((e) => e.ok), [false, true]);
});
test('build 27: "לא היה שוחט השוחט, עד ששומע קול שער הגדול שנפתח" — no cut before the gate; the inner roles\' winners open it', async () => {
  const R = await atRing('shochet'); R.E.r27bind(true); await R.step(P27.bound + 0.1);
  assert.equal(R.E.r27().ph, 'wait'); assert.equal(R.E.r27tap(), false, 'no tap while waiting'); assert.equal(R.E.open26(), false);
  for (let i = 0; i < 150 && !R.E.open26(); i++) await R.step(0.1);
  const gate = R.ev('r26gate').at(-1); assert.ok(gate && gate.npc, 'the gate opened by the court'); assert.equal(gate.jer, false);
  assert.ok(Math.abs(gate.t - (R.E.st33.l26t + P27.gateNpc)) < 0.25, `${gate.t} vs ${R.E.st33.l26t + P27.gateNpc}`);
  assert.ok(Math.abs(R.E.men5t() - R.E.g26t() - P27.men5) < 1e-6, 'the five lamps after the gate');
  await R.step(0.5); assert.equal(R.E.r27().ph, 'cut');
});
test('build 27: the cut — the needle goes back and forth; outside [0.425, 0.575] a free retry (a miss counted), inside PERFECT', async () => {
  assert.deepEqual([...P27.win], [0.425, 0.575]);
  assert.equal(needle27(0, 1), 0); assert.ok(Math.abs(needle27(0.5, 1) - 0.5) < 1e-9); assert.equal(needle27(1, 1), 1); assert.ok(Math.abs(needle27(1.5, 1) - 0.5) < 1e-9);
  const R = await atRing('shochet'); const K = await toCut(R); assert.equal(K.ph, 'cut');
  assert.equal(await tapAt(R, 0.05, 0.3), false); assert.equal(R.E.r27().ph, 'cut', 'again'); assert.equal(R.E.r27().miss, 1);
  assert.equal(await tapAt(R, 0.7, 0.95), false); assert.equal(R.E.r27().miss, 2);
  assert.equal(await tapAt(R, 0.46, 0.54), true); assert.equal(R.E.r27().ph, 'cutd');
  const cuts = R.ev('r27cut'); assert.deepEqual(cuts.map((e) => e.ok), [false, false, true]);
  assert.ok(cuts[2].u >= 0.425 && cuts[2].u <= 0.575);
});
test('build 27: the shochet\'s record — misses and the binding\'s tries in the mastery, coins by quality, the roles book; the morning released', async () => {
  const R = await atRing('shochet'); await toCut(R); await tapAt(R, 0.47, 0.53); await R.step(P27.cutd + 0.2);
  const r = R.E.r26r(); assert.equal(r.role, 'shochet'); assert.equal(r.misses, 0); assert.equal(r.rebinds, 0);
  assert.ok(r.mastery >= 90, String(r.mastery)); assert.ok(r.coins >= 2); assert.ok(r.cutT > 0);
  assert.equal(R.E.gate27(), false, 'the morning goes on'); assert.equal(R.ev('r27done').length, 1);
  const book = bookOf23(R.save, POOL26).find((x) => x.id === 'shochet'); assert.equal(book.open, true); assert.equal(book.n, 1); assert.equal(book.best, r.mastery);
  const R2 = await atRing('shochet'); R2.E.r27bind(false); R2.E.r27bind(false); await toCut(R2); await tapAt(R2, 0.05, 0.2); await tapAt(R2, 0.05, 0.2); await tapAt(R2, 0.05, 0.2); await tapAt(R2, 0.47, 0.53); await R2.step(P27.cutd + 0.2);
  const r2 = R2.E.r26r(); assert.equal(r2.misses, 3); assert.equal(r2.rebinds, 2); assert.ok(r2.mastery < r.mastery - 30, `${r2.mastery} vs ${r.mastery}`); assert.equal(r2.coins, 1);
});
test('build 27: the zorek — the court\'s shochet cuts once the gate is open and he is at the vessel; the stream fills it only under it (|pos − stream| < 0.15, 2.5 s)', async () => {
  assert.equal(P27.tol, 0.15); assert.equal(P27.fillS, 2.5);
  const R = await atRing('zorek'); assert.equal(R.E.r27().ph, 'wait');
  for (let i = 0; i < 200 && R.E.r27().ph !== 'recv'; i++) await R.step(0.1);
  assert.ok(R.ev('r27').some((e) => e.ph === 'cut' && e.npc), 'the court\'s shochet'); assert.equal(R.E.r27().ph, 'recv');
  const K = R.E.r27();
  // away from the stream: nothing
  for (let i = 0; i < 20; i++) { R.E.r27move(K.sp > 0 ? -1 : 1); await R.step(0.05, 0.05); }
  assert.equal(K.fill, 0);
  // under it: 2.5 s
  let n = 0;
  for (; n < 200 && K.ph === 'recv'; n++) { R.E.r27move(K.sp - K.pos); await R.step(0.05, 0.05); }
  assert.ok(n * 0.05 >= 2.4 && n * 0.05 <= 2.8, `${n * 0.05} s`); assert.ok(K.fillAcc > 50 && K.fillAcc < 90, String(K.fillAcc));
  assert.ok(Math.abs(stream27(1.3)) <= P27.sMax + 1e-9);
});
test('build 27: "ממרס… כדי שלא יקרש" — on the way, 3 s without a circle and the clot meter rises; at its top no throw till he swirls it down', async () => {
  const R = await zorekAt('carry'), K = R.E.r27(); assert.equal(K.ph, 'carry');
  for (let i = 0; i < 25; i++) { R.E.r27swirl(0.7); await R.step(0.1); }
  assert.equal(K.coag, 0); assert.ok(K.circ >= 2, 'the circles count (each a clink)'); assert.ok(R.ev('r27circ').length >= 2);
  await R.step(2.7); assert.equal(K.coag, 0, 'not before 3 s'); await R.step(3.9);
  assert.ok(K.coag >= 0.99 && K.clot, String(K.coag)); assert.ok(R.ev('r27clot').some((e) => e.on));
  for (let i = 0; i < 300 && !(R.E.men5t() != null && R.E.st33.t > R.E.men5t()); i++) await R.step(0.1);
  R.at(P27.at.NE.x, P27.at.NE.z); await R.step(0.6); assert.equal(K.ph, 'aim');
  assert.equal(R.E.r27throw(0.35, 0), 'clot'); assert.equal(K.ph, 'aim');
});
test('build 27: "הטבת חמש נרות קודם לדם התמיד" — at the north-east corner before the five lamps he holds; after them, the aim', async () => {
  const R = await zorekAt('carry'), K = R.E.r27();
  for (let i = 0; i < 20; i++) { R.E.r27swirl(0.7); await R.step(0.1); }
  assert.ok(R.E.st33.t < R.E.men5t()); R.at(P27.at.NE.x, P27.at.NE.z); await R.step(0.2);
  assert.equal(K.ph, 'hold'); assert.equal(R.E.r27throw(0.35, 0), null, 'no throw while holding');
  for (let i = 0; i < 300 && K.ph === 'hold'; i++) { R.E.r27swirl(0.7); await R.step(0.1); }
  assert.equal(K.ph, 'aim'); assert.ok(R.E.st33.t >= R.E.men5t());
});
test('build 27: the throw — under the red thread (y 21): at the corner\'s edge (±3°) both faces (Γ), to 28° one face; over it or past the corner, again', () => {
  assert.equal(P27.line, 21); assert.equal(P27.deg, 3);
  assert.equal(throw27(0.05, 0).res, 'weak');
  const hi = throw27(0.6, 0); assert.equal(hi.res, 'high'); assert.ok(hi.y >= 21);
  const g = throw27(0.35, 2.5); assert.equal(g.res, 'perfect'); assert.equal(g.face, 0); assert.equal(g.q, 1); assert.ok(g.y > P27.low && g.y < 21);
  assert.deepEqual([throw27(0.35, -12).res, throw27(0.35, -12).face, throw27(0.35, 12).face, throw27(0.35, 12).q], ['good', -1, 1, 0.6]);
  assert.equal(throw27(0.35, 40).res, 'miss');
});
test('build 27: the two gifts and the rest — a throw over the thread is a free retry (no "פסול"), NE then SW, the swipe down on the yesod; the record', async () => {
  const R = await zorekAt('aim'), K = R.E.r27(); assert.equal(K.ph, 'aim'); assert.equal(K.corner, 'NE');
  assert.equal(R.E.r27throw(0.8, 0), 'high'); assert.equal(K.ph, 'aim'); assert.equal(K.high, 1);
  assert.equal(R.E.r27throw(0.35, 0), 'perfect'); assert.equal(K.ph, 'splash');
  await R.step(P27.splash + 0.1); assert.equal(K.ph, 'carry2');
  assert.equal(R.E.flowNext().at.x, P27.at.SW.x);
  for (let i = 0; i < 10; i++) { R.E.r27swirl(0.7); await R.step(0.1); }
  R.at(P27.at.SW.x, P27.at.SW.z); await R.step(0.2); assert.equal(K.ph, 'aim2'); assert.equal(K.corner, 'SW');
  assert.equal(R.E.r27throw(0.35, 15), 'good'); await R.step(P27.splash + 0.1); assert.equal(K.ph, 'base');
  assert.equal(R.E.r27swipe(0, 0.1, 100), false, 'too short'); assert.equal(R.E.r27swipe(0.4, 0.3, 100), false, 'crooked');
  assert.equal(R.E.r27swipe(0, 0.4, 150), true); assert.equal(K.ph, 'poured'); await R.step(P27.poured + 0.2);
  const r = R.E.r26r(); assert.equal(r.role, 'zorek'); assert.deepEqual(r.gifts, [1, 0.6]); assert.equal(r.retries, 1); assert.equal(r.high, 1);
  assert.ok(r.mastery > 40 && r.mastery < 95, String(r.mastery)); assert.equal(R.E.gate27(), false);
  assert.deepEqual(R.ev('r27').map((e) => e.ph).filter((p) => /^(splash|splash2|base|poured|out)$/.test(p)), ['splash', 'splash2', 'base', 'poured', 'out']);
});
test('build 27: the views — the ring from the north-east, a medium shot (≥ 7 amot ≈ 3.4 m; the neck at the far, south end: never close on it), over his shoulder at each corner, none while he walks', async () => {
  const R = await atRing('shochet'); const a = R.E.camWork27().view, d = Math.hypot(a.p[0] - a.t[0], a.p[1] - a.t[1], a.p[2] - a.t[2]);
  assert.ok(d >= 7, String(d)); assert.ok(a.p[0] > a.t[0] && a.p[2] < a.t[2], 'from the north-east');
  const neck = Math.hypot(a.p[0] - P27.lamb.x, a.p[2] - (P27.lamb.z + 0.7)); assert.ok(neck >= 7, 'the neck ≥ 7 amot off: ' + neck);
  const Z = await zorekAt('carry'); assert.equal(Z.E.camWork27(), null, 'walking: the follow camera');
  const N = await zorekAt('aim'); const v = N.E.camWork27().view; assert.ok(v.p[0] > -23 && v.p[2] < -18.5, 'from beyond the north-east corner');
});
test('build 27: the sounds — blade27 … bind27 in the composed kit, each starting a voice; the module plays each', () => {
  const NEW = ['blade27', 'fill27', 'clink27', 'splash27', 'pour27', 'bind27'], k = createSound({}), src = read('src/avodah/shift/dam27.js');
  for (const n of NEW) { assert.ok(SOUNDS.includes(n), n); assert.ok(k.has(n), n); assert.match(src, new RegExp(`snd\\('${n}'`), n); }
});
test('build 27: the texts — each source line as checked on Sefaria, every one a draft; the numbers המחשה; no "פסול" anywhere in the role', () => {
  const src = read('src/avodah/shift/dam27.js');
  for (const s of [
    'של שחר היה נשחט על קרן צפונית מערבית, על טבעת שניה', 'לא היו כופתין את הטלה, אלא מעקדין אותו', 'יד ורגל, כעקידת יצחק בן אברהם',
    'וכך היתה עקדתו, ראשו לדרום ופניו למערב', 'מי שזכו באברים, אוחזים בו', 'השוחט, עומד במזרח ופניו למערב', 'לא היה שוחט השוחט, עד ששומע קול שער הגדול שנפתח',
    'שחט השוחט, וקבל המקבל', 'ממרס בו… כדי שלא יקרש', 'והטבת חמש נרות קודם לדם התמיד', 'בא לו לקרן מזרחית צפונית, ונותן מזרחה צפונה',
    'מערבית דרומית, ונותן מערבה דרומה', 'וחוט של סקרא חוגרו באמצע, להבדיל בין הדמים העליונים לדמים התחתונים', 'באלכסון מחצי המזבח ולמטה',
    'ודמה טעון שתי מתנות שהן ארבע', 'מתנה אחת כמין גמא נותן', 'שירי הדם היה שופך על יסוד דרומית',
  ]) assert.ok(src.includes(s), s);
  assert.match(src, /const cite = \(text, src\) => `"\$\{text\}" — \$\{src\} · טיוטה`/);
  assert.ok(!src.includes('פסול'), 'no "פסול"'); assert.match(src, /מעל החוט — לא כאן/);
});
test('build 27: the new files carry no Divine Name (scanned by code points)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]].map((c) => String.fromCharCode(...c));
  const files = ['src/avodah/shift/dam27.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/focus17.js', 'src/game/audio.js', 'test/build27.test.mjs', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs'];
  const hits = []; for (const f of files) { const s = read(f); for (const n of N) if (s.includes(n)) hits.push(f); }
  assert.deepEqual(hits, []);
});
