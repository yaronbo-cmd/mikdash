// ── fable32 (build 31) ── practice any role you have had, from the roles book (hachraot-he.md "עולם ומבנה", the owner, 21.10 23:46:
// "ספר התפקידים — אימון בכל תפקיד בנוי, לשיא"; build 30's טעון תיקון end invites to it). Node, on the day engine (test/rig33.mjs) with
// o.practice: a practice door only for a role he has had in a real morning (the laver too), locked "עוד לא יצא לך בפיס" / "בקרוב"
// otherwise; each act opens at once in its place, the court round it, no tamid clock, no day timer; its end — the rating, the card
// ("p31end"); the role's record changes (its rating, מהודר count, title), never the coins, the day, the lot, the mornings served, the
// tasks or the badges; the saved day is byte-identical after it and the lobby's "המשך יום N" with it; the day's summary without
// "באיחור"; the inner altar's quality spans the full range; a Divine-Name scan of the changed files.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { D21, M22, P23, P25, P26, P27, PRAC31, POOL23, POOL26, bookOf23 } from '../src/avodah/shift/day33.js';
import { RATE30, LINE30, quality30, rate30, role30, served30, INNER31 } from '../src/avodah/shift/rate30.js';
import { canPractice31, practiceSave31, merge31, endHTML31 } from '../src/avodah/shift/practice31.js';
import { bookHTML23 } from '../src/avodah/shift/pis23.js';
import { createLobby } from '../src/avodah/shift/lobby35.js';
import { createFocus17 } from '../src/avodah/shift/focus17.js';   // (it imports every act's module: their sources register)
import { rig, FLAGS, seeded } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
void createFocus17;

// a returning player's save: six mornings — every built role had at least once (the laver every morning), a day saved mid-morning
const SAVE = () => ({
  served30: 5, perutot: 40, bestDay: 6, badges33: { log1: 1 }, day33: { axe: 1 },
  roles23: {
    m: 6, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22'], [3, 'lamb', 'lamb'], [4, 'deshen', 'deshen'], [5, 'm22', 'm22'], [6, 'lamb', 'lamb']],
    kiyor: { n: 6, best: 100, last: 75, r30: { h: 4, k: 2, t: 0, best: 'mehudar' } }, deshen: { n: 2, best: 100, last: 100, r30: { h: 2, k: 0, t: 0, best: 'mehudar' } },
    m22: { n: 2, best: 80, last: 80, r30: { h: 0, k: 2, t: 0, best: 'kasher' } }, lamb: { n: 2, best: 100, last: 45, r30: { h: 1, k: 0, t: 1, best: 'mehudar' } },
    menorah: { n: 2, best: 90, last: 90 }, inner: { n: 1, best: 95, last: 95 }, shochet: { n: 1, best: 100, last: 100 }, zorek: { n: 1, best: 88, last: 88 },
  },
  roles26: { m: 6, h: [[1, 'menorah'], [2, 'inner'], [3, 'menorah'], [4, 'shochet'], [5, 'zorek'], [6, 'menorah']] },
  day33state: { day: 7, fed: 44, level: 4, fuel: 61.5, washed: true, p23day: 7, lot: 'deshen', d21day: 7, m22day: 7, p26day: 0, left: 150, logs: 2, tasks: [['jars2', true], ['bake1', false], ['carry20', false]] /* (day 7's three at level 4: tasksForDay) */, lambs: [true, false, false, false, false, false], badges: {}, night: false, at: 1761100000000, why: 'tick' },
});
const PR = (role, save) => ({ role, day: 7, fed: 44, seed: 4242 });
/** a practice run of a role on a copy of the save (as shift/index.js's runPractice); the merged record back into the save */
function practise(role, save, o = {}) {
  const copy = practiceSave31(save), R = rig(FLAGS, { save: copy, practice: o.practice || PR(role), rng: seeded(o.seed || 11) });
  R.E.on17((ev) => { if (ev.type === 'p31rec') merge31(save, ev.id, ev.rec); });
  return R;
}
async function begin(R, role) { R.E.start(); if (role === 'deshen') R.H.y = 25; await R.step(0.3); }
async function settle(R) { await R.step(0.5); }   // (each act's own glide into its place — "in" — is ≤ 0.5 s)
// ── each act played to its end through the engine's own surface (good: the right action; poor: the slips the rating counts) ──
const PLAY = {
  async kiyor(R, poor) {
    await settle(R);
    for (let i = 0; i < 40 && R.E.k20().ph !== 'pose'; i++) await R.step(0.1);
    R.E.k20in('L', true); R.E.k20in('R', true);
    if (poor) for (let i = 0; i < 3; i++) { await R.step(0.4); R.E.k20in('R', false); await R.step(0.1); R.E.k20in('R', true); }
    for (let i = 0; i < 80 && R.E.k20() && R.E.k20().ph === 'pose'; i++) await R.step(0.1);
  },
  async deshen(R) {
    await settle(R);
    for (let i = 0; i < D21.layers; i++) { R.E.d21swipe(0.6, 0.05, 100); await R.step(0.3); }
    await R.step(1); R.E.d21stick(1);
    for (let i = 0; i < 900 && R.E.d21() && R.E.d21().ph !== 'foot'; i++) { R.E.d21bal(Math.max(-1, Math.min(1, -R.E.d21().b * 4))); await R.step(0.05); }
    const g = D21.go[2]; R.at(g[0], g[1]); await R.step(0.2); R.E.d21tap(); await R.step(D21.pour + 0.6);
  },
  async m22(R) {
    await settle(R);
    for (let i = 0; i < 300 && R.E.m22() && ['in', 'sort'].includes(R.E.m22().ph); i++) { const K = R.E.m22(); if (K.ph === 'sort' && K.ls === 'on') R.E.m22swipe(K.cur.ok ? 0.5 : -0.5, 0, 100); await R.step(0.1); }
    await R.step(1.2); R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0);
    const K = R.E.m22(), dFor = (air, r) => (2 * r * (1 + air)) / (1 - air);
    for (const size of 'LMS') {
      if (!K.got.some((g) => g.size === size && !g.at)) continue;
      const r = M22.r[size], i1 = K.got.findIndex((g) => g.size === size && !g.at); R.E.m22place(i1, -0.6);
      const i2 = K.got.findIndex((g) => g.size === size && !g.at); if (i2 >= 0) R.E.m22place(i2, size === 'S' ? 0 : -0.6 + dFor(0.35, r));
    }
    for (let i = 0; i < 30 && R.E.m22().ph !== 'ready'; i++) await R.step(0.1);
    R.E.m22tap(); await R.step(M22.ign + 0.3);
  },
  async lamb(R) {
    await settle(R);
    for (let i = 0; i < 40 && R.E.p25() && R.E.p25().ph !== 'scan'; i++) await R.step(0.1);
    for (let n = 0; n < 8 && R.E.p25() && !/^(ok|lead|end)$/.test(R.E.p25().ph); n++) {
      const K = R.E.p25();
      if (K.L.blem) { R.E.p25stamp('pasul'); await R.step(P25.aside + 0.1); R.E.p25tap(); await R.step(P25.bring + 0.1); }
      else { for (const s of K.L.spots.filter((x) => x.kind === 'dirt')) { R.E.p25focus(s.i); R.E.p25tap(); await R.step(P25.zoom + 0.1); R.E.p25swipe(0.5, 0.02, 100); await R.step(P25.clean + 0.1); } R.E.p25stamp('tamim'); await R.step(P25.ok + 0.2); }
    }
  },
  async gate(R) { await R.step(0.6); R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(P26.key + 0.2); R.E.r26hold(false); await R.step(P26.opn + 0.2); },
  async inner(R, poor) {
    await PLAY.gate(R); const a = P26.alt; R.at(a.x + 1, a.z); await R.step(1.2);
    for (let i = 0; i < P26.pulls && R.E.r26() && R.E.r26().ph === 'pull'; i++) { R.E.r26pull(poor ? P26.vmax + 1 : 1.5); await R.step(0.2); }
    await R.step(P26.leave + 0.2);
  },
  async menorah(R) {
    await PLAY.gate(R); const a = P26.walkM; R.at(a.x + 1, a.z); await R.step(1.2);
    for (let i = 0; i < 600 && R.E.r26() && !['out'].includes(R.E.r26().ph); i++) {
      const K = R.E.r26();
      if (K.ph === 'wick') R.E.r26swipe(0, -0.5, 100); else if (K.ph === 'wipe') R.E.r26swipe(0.5, 0, 100);
      else if (K.ph === 'pour' && !K.held) R.E.r26hold(true); else if (K.ph === 'pour' && K.held && K.fill >= 0.95) R.E.r26hold(false);
      else if (K.ph === 'new' || K.ph === 'kuz') R.E.r26tap(); else if (K.ph === 'drag') R.E.r26light();
      await R.step(0.05);
    }
  },
  async shochet(R) {
    await settle(R);
    R.E.r27bind(true); await R.step(P27.bound + 0.1);
    for (let i = 0; i < 200 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
    for (let i = 0; i < 400; i++) { const u = R.E.r27().u; if (u >= 0.46 && u <= 0.54) break; await R.step(0.01, 0.01); }
    R.E.r27tap(); await R.step(P27.cutd + 0.2);
  },
  async zorek(R) {
    await settle(R);
    for (let i = 0; i < 300 && R.E.r27().ph !== 'recv'; i++) await R.step(0.1);
    const K = R.E.r27();
    for (let i = 0; i < 300 && K.ph === 'recv'; i++) { R.E.r27move(K.sp - K.pos); await R.step(0.05, 0.05); }
    await R.step(P27.full + 0.1);
    for (let i = 0; i < 300 && !(R.E.men5t() != null && R.E.st33.t > R.E.men5t()); i++) { R.E.r27swirl(0.7); await R.step(0.1); }
    R.at(P27.at.NE.x, P27.at.NE.z); await R.step(0.6); R.E.r27throw(0.35, 0); await R.step(P27.splash + 0.1);
    for (let i = 0; i < 10; i++) { R.E.r27swirl(0.7); await R.step(0.1); }
    R.at(P27.at.SW.x, P27.at.SW.z); await R.step(0.3); R.E.r27throw(0.35, 0); await R.step(P27.splash + 0.1);
    R.E.r27swipe(0, 0.4, 150); await R.step(P27.poured + 0.2);
  },
};
const snap = (s) => JSON.stringify({ day33state: s.day33state, m: s.roles23.m, h: s.roles23.h, roles26: s.roles26, served30: s.served30, perutot: s.perutot, badges33: s.badges33, day33: s.day33, bestDay: s.bestDay, k20seen: s.k20seen, jer26: s.jer26, gh19: s.gh19 });

// ───────── (1) the doors ─────────
test('build 31 (1): a practice door only for a role he has had in a real morning — the laver too; locked "עוד לא יצא לך בפיס" when the lot never gave it; "בקרוב" when not built; none mid-day', () => {
  const save = SAVE(); delete save.roles23.zorek; delete save.roles23.lamb;
  const h = bookHTML23(save, { practice: () => {} });
  for (const id of ['kiyor', 'deshen', 'm22', 'menorah', 'inner', 'shochet']) assert.match(h, new RegExp(`data-p31="${id}"`), id);
  for (const id of ['lamb', 'zorek', 'chavitin', 'ketoret', 'shir', 'rosh', 'yayin']) assert.ok(!h.includes(`data-p31="${id}"`), id);
  const card = (he) => { const i = h.indexOf(he); return h.slice(h.lastIndexOf('<div class="q', i), h.indexOf('</div>', i)); };
  assert.match(card('בדיקת הטלה'), /🔒[^]*עוד לא יצא לך בפיס/); assert.match(card('זריקת הדם'), /🔒[^]*עוד לא יצא לך בפיס/);
  assert.match(card('הקטורת'), /בקרוב/); assert.ok(!/עוד לא יצא לך/.test(card('הקטורת')), 'the incense: not built — בקרוב, nothing to do for it'); assert.match(card('החביתין'), /בקרוב/);
  assert.match(card('היין'), /כהנים אחרים — בקרוב/);
  assert.match(h, /💧 קידוש ידיים ורגליים — כל בוקר:[^]*data-p31="kiyor"/, 'the laver\'s row');
  // the doors are ≥ 44 px
  assert.match(read('src/avodah/shift/pis23.js'), /\.p23-bk button\.p31\{[^}]*min-height:44px/);
  // mid-day (the day's summary): read-only — no door, a line where the doors are
  const ro = bookHTML23(save, { note31: true }); assert.ok(!/data-p31=/.test(ro)); assert.match(ro, /לתרגל תפקיד — מספר התפקידים שבמסך הבית/);
  // the lot is the key: a role with practice runs only (n = pr) is not "had"; a built role off (its flag) has no door
  assert.equal(canPractice31({ roles23: { zorek: { n: 2, pr: 2 } } }, 'zorek'), false); assert.equal(canPractice31({ roles23: { zorek: { n: 3, pr: 2 } } }, 'zorek'), true);
  assert.equal(canPractice31(save, 'deshen', { deshen: false }), false); assert.equal(canPractice31(save, 'ketoret'), false); assert.equal(canPractice31({}, 'kiyor'), false);
  assert.deepEqual([...PRAC31.roles], ['kiyor', 'deshen', 'm22', 'lamb', 'inner', 'menorah', 'shochet', 'zorek']);
  assert.ok(POOL23.find((x) => x.id === 'ketoret' && !x.built), 'the incense is not built');
});
test('build 31 (1): the doors are reachable from the lobby (the titles\' card, ספר הזכרונות › תפקידים) and run only from there; the summary\'s book is read-only', () => {
  const ix = read('src/avodah/shift/index.js');
  assert.match(ix, /roles: \(\) => openRoles31\('full'\)/); assert.match(ix, /rolesBook23\(\{ doc, save, practice: \(id\) => runPractice\(id, 'full'\), can:/);
  assert.match(ix, /function runPractice\(role, from = 'full'\) \{\n\s*if \(!D \|\| !doc \|\| !canPractice31\(save, role, on31\(\)\)\) return false;/);
  assert.match(ix, /if \(gate29\(\)\) return false;   \/\/ \(the lock/);
  // (build 32: the summary's book is the journal's "תפקידים" tab — read-only, note31, no practice; the lobby's doors open the journal)
  const f = read('src/avodah/shift/focus17.js'); assert.match(f, /openJournal32\(\{ doc, save: E\.book31\(\), tab: 'roles', note31: true,/); assert.ok(!/(rolesBook23|openJournal32)\([^)]*practice/.test(f), 'no practice mid-day');
});

// ───────── (2) the run ─────────
test('build 31 (2): every role\'s act opens at once in its own place — the act\'s one line, the court\'s kohanim at the other parts, no tamid clock, no day timer, no drain', async () => {
  for (const role of PRAC31.roles) {
    const R = practise(role, SAVE()); await begin(R, role);
    const s = R.E.state(), want = { kiyor: 'k20', deshen: 'd21', m22: 'm22', lamb: 'p25', inner: 'r26', menorah: 'r26', shochet: 'r27', zorek: 'r27' }[role];
    assert.ok(want === 'k20' ? s.k20 : s[want], `${role}: its act`); assert.equal(R.E.act30(), true, role); assert.equal(R.E.prac31, role);
    assert.ok(Object.values(LINE30).some((L) => Object.values(L).includes(R.E.step17().text)), `${role}: "${R.E.step17().text}"`);
    const t0 = R.E.focus17().tamid, left = s.left, fuel = s.fuel; await R.step(4);
    assert.equal(R.E.state().left, left, `${role}: no day timer`); assert.equal(R.E.focus17().tamid.inS, t0.inS, `${role}: the tamid clock does not run`); assert.equal(R.E.state().fuel, fuel, `${role}: the fire does not drain`);
  }
  // the court: the pyre's wood by the court's kohen on an ashes run, the ashes' pan on a pyre run; the inner roles' winners open the great gate for a blood role
  const A = practise('deshen', SAVE()); await begin(A, 'deshen'); assert.equal(A.E.npc23(), 'm22');
  const B = practise('m22', SAVE()); await begin(B, 'm22'); assert.equal(B.E.npc23(), 'deshen');
  const Z = practise('zorek', SAVE()); await begin(Z, 'zorek'); assert.equal(Z.E.open26(), false); await Z.step(PRAC31.gate27 + 0.2);
  assert.equal(Z.E.open26(), true, 'the court opened the great gate'); assert.ok(Z.ev('r26gate').some((e) => e.npc)); for (let i = 0; i < 30 && Z.E.r27().ph !== 'recv'; i++) await Z.step(0.1);
  assert.equal(Z.E.r27().ph, 'recv', 'the court\'s shochet cut — "שחט השוחט, וקבל המקבל"');
});
test('build 31 (2): each role played to its end — its rating, no coins, the end card as the rating\'s word ends ("p31end"), the day waits under it', async () => {
  const out = {};
  for (const role of PRAC31.roles) {
    const save = SAVE(), R = practise(role, save); await begin(R, role); await PLAY[role](R);
    for (let i = 0; i < 40 && !R.ev('p31end').length; i++) await R.step(0.1);
    const r = R.ev('rate30').find((e) => e.id === role), e = R.ev('p31end')[0];
    assert.ok(r, `${role}: rated`); assert.equal(r.coins, 0, `${role}: no coins`); assert.ok(e, `${role}: the end`); assert.equal(e.rating, r.rating);
    assert.ok(e.t - r.t >= PRAC31.endS - 0.11 && e.t - r.t <= RATE30.wordS + 0.11, `${role}: the card as the word ends (${(e.t - r.t).toFixed(2)} s)`);
    assert.equal(R.E.state().paused, true, `${role}: the day waits under the card`); assert.equal(R.ev('coins').length, 0, role); assert.equal(R.ev('task').length, 0, role);
    assert.equal(R.E.p31().done.rating, r.rating); out[role] = r.rating;
  }
  assert.deepEqual(Object.keys(out), PRAC31.roles.slice());
  for (const [role, rt] of Object.entries(out)) assert.ok(RATE30.ids.includes(rt), `${role}: ${rt}`);
});

// ───────── (3) what practice changes ─────────
test('build 31 (3): the role\'s record changes — n, best, its rating counts (מהודר ×), the title, pr; nothing else: coins, the day, the lot, the mornings served, the tasks, the badges', async () => {
  const save = SAVE(), before = snap(save), others = JSON.stringify(Object.fromEntries(Object.entries(save.roles23).filter(([k]) => k !== 'deshen')));
  const R = practise('deshen', save); await begin(R, 'deshen'); await PLAY.deshen(R); await R.step(3);
  const d = save.roles23.deshen;
  assert.equal(d.n, 3); assert.equal(d.pr, 1); assert.deepEqual({ ...d.r30 }, { h: 3, k: 0, t: 0, best: 'mehudar' });
  assert.equal(role30(d).title.he, 'מיומן', 'three times מהודר: מיומן');
  assert.equal(snap(save), before, 'the saved day, the lot (m, h), roles26, served30, perutot, badges, the shop — as they were');
  assert.equal(JSON.stringify(Object.fromEntries(Object.entries(save.roles23).filter(([k]) => k !== 'deshen'))), others, 'every other role as it was');
  assert.equal(served30(save), 5); assert.equal(R.ev('p31rec').length, 1); assert.equal(R.ev('summary').length, 0);
  // the run's own copy took nothing of the day: no saved day written in it
  assert.equal(R.save.day33state, undefined);
});
test('build 31 (3): the lot never moves for practice — the weights, "never yesterday\'s" and the first times read the mornings had (n − pr)', async () => {
  const lotOf = async (save, seed) => { const R = rig(FLAGS, { save, seed }); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.at(-60, 30); await R.step(0.4); for (let i = 0; i < 40 && R.E.p23() && R.E.p23().ph !== 'show'; i++) { if (R.E.p23().ph === 'raise') R.E.p23raise(); await R.step(0.2); } return R.E.p23() ? R.E.p23().cards[0] : R.E.lot23(); };
  const plain = () => { const s = SAVE(); delete s.day33state; return s; };
  for (const seed of [3, 5, 8, 13]) {
    const a = plain(), b = plain(); b.roles23.lamb = { ...b.roles23.lamb, n: b.roles23.lamb.n + 9, pr: 9 }; b.roles23.deshen = { ...b.roles23.deshen, n: 7, pr: 5 };
    assert.equal(await lotOf(b, seed), await lotOf(a, seed), `seed ${seed}`);
  }
  const row = bookOf23({ roles23: { lamb: { n: 5, pr: 4 } } }).find((x) => x.id === 'lamb'); assert.equal(row.had, 1); assert.equal(row.pr, 4); assert.equal(row.n, 5);
});
test('build 31 (3): the saved day is byte-identical before and after a practice of every role, and the lobby still says "המשך יום 7"', async () => {
  const save = SAVE(), day0 = JSON.stringify(save.day33state), lobby = (s) => createLobby({ save: s, start: true }).html().match(/המשך יום \d+/)[0];
  assert.equal(lobby(save), 'המשך יום 7');
  for (const role of PRAC31.roles) { const R = practise(role, save); await begin(R, role); await PLAY[role](R); await R.step(3); R.E.stop(); }
  assert.equal(JSON.stringify(save.day33state), day0, 'byte-identical'); assert.equal(lobby(save), 'המשך יום 7');
  for (const role of PRAC31.roles) assert.equal(save.roles23[role].pr, 1, role);
  // the day itself then goes on where it was (the day, the fire's logs, the gates, the tasks)
  const R = rig(FLAGS, { save }); R.E.start(); await R.step(0.1); const s = R.E.state();
  assert.equal(s.day, 7); assert.equal(s.fed, 44); assert.equal(s.lot, 'deshen'); assert.equal(R.E.st33.p23day, 7); assert.equal(R.E.st33.m22day, 7); assert.equal(s.gate26L, true, 'the second lot next, as it was');
  assert.deepEqual(s.tasks, [['jars2', true], ['bake1', false], ['carry20', false]]); assert.equal(s.resumed, 7);
  // shift/index.js: the run on a copy of his save — no saved day in it, its persist a no-op; only the role's entry merged back
  const ix = read('src/avodah/shift/index.js'), rp = ix.slice(ix.indexOf('function runPractice('), ix.indexOf('// ── /fable32 ──', ix.indexOf('function runPractice(')));
  assert.match(rp, /save: practiceSave31\(save\), persist: \(\) => \{\}/); assert.match(rp, /merge31\(save, ev\.id, ev\.rec\)/); assert.match(rp, /practice: \{ role, day: resumeDay33\(save\) \|\| 1/);
  const d = read('src/avodah/shift/day33.js'); assert.match(d, /function saveState\(why\) \{\n\s*if \(prac\) return;/); assert.match(d, /function pay\(n, why, at\) \{\n\s*if \(prac\) return/);
});
test('build 31 (3): the engine in practice — no coins (pay), no morning served, no tasks, no badges, no "33 days", a new seed per run (another lamb)', async () => {
  const save = SAVE(); save.roles23.kiyor.n = 40; const R = practise('kiyor', save, { practice: { role: 'kiyor', day: 40, seed: 7 } }); await begin(R, 'kiyor'); await PLAY.kiyor(R); await R.step(3);
  assert.equal(R.save.perutot, 40, 'no coins in the run\'s copy either'); assert.equal(R.save.served30, 5); assert.deepEqual(R.E.state().tasks, []); assert.deepEqual(R.E.state().badges, []);
  assert.ok(!R.events.some((e) => e.type === 'pop' && /33/.test(String(e.text || ''))));
  const spots = async (seed) => { const L = practise('lamb', SAVE(), { practice: { role: 'lamb', day: 7, seed } }); await begin(L, 'lamb'); for (let i = 0; i < 20 && L.E.p25().ph !== 'scan'; i++) await L.step(0.1); const K = L.E.p25(); return JSON.stringify([K.L.blem, K.L.spots.map((s) => [s.kind, s.r])]); };
  const seen = new Set(); for (const seed of [101, 202, 303, 404, 505, 606]) seen.add(await spots(seed)); assert.ok(seen.size >= 3, `lambs by the seed: ${seen.size}`);
});

// ───────── (4) the inner altar's full range ─────────
test('build 31 (4): the inner altar\'s quality spans the full range — every pull too fast is טעון תיקון (q < 0.5); INNER31 is P26\'s', async () => {
  assert.equal(INNER31.pulls, P26.pulls); assert.equal(INNER31.scr, P26.scr);
  assert.equal(quality30('inner', { pulls: 7, scratches: 0, accuracy: 100 }), 1); assert.equal(quality30('inner', { pulls: 7, scratches: 7, accuracy: 65 }), 0);
  assert.equal(rate30(quality30('inner', { pulls: 7, scratches: 1 })), 'mehudar'); assert.equal(rate30(quality30('inner', { pulls: 7, scratches: 2 })), 'kasher');
  assert.equal(rate30(quality30('inner', { pulls: 7, scratches: 4 })), 'tikkun'); assert.ok(quality30('inner', { accuracy: 65 }) < 0.5, 'an older record by its accuracy');
  const R = practise('inner', SAVE()); await begin(R, 'inner'); await PLAY.inner(R, true);
  const r = R.ev('rate30').find((e) => e.id === 'inner'); assert.ok(r.q < 0.5, String(r.q)); assert.equal(r.rating, 'tikkun');
  const G = practise('inner', SAVE()); await begin(G, 'inner'); await PLAY.inner(G, false); assert.equal(G.ev('rate30').find((e) => e.id === 'inner').rating, 'mehudar');
  // and the laver's three lifts, as build 30: טעון תיקון in practice too
  const K = practise('kiyor', SAVE()); await begin(K, 'kiyor'); await PLAY.kiyor(K, true); assert.equal(K.ev('rate30')[0].rating, 'tikkun');
});

// ───────── (5) the end card, the tag, the pause card ─────────
test('build 31 (5): the end card — the rating word, the source line (tappable: end30\'s card), "עוד פעם" and "חזרה" (≥ 44 px), a new title said; practice is המחשה', () => {
  const h = endHTML31({ id: 'zorek', rating: 'mehudar', rec: { n: 4, pr: 1, best: 100, r30: { h: 3, k: 0, t: 0, best: 'mehudar' } }, was: role30({ n: 3, best: 100, r30: { h: 2, k: 0, t: 0, best: 'mehudar' } }) });
  assert.match(h, /class="rt mehudar">✦ מהודר/); assert.match(h, /data-p31="src"[^]*יומא|data-p31="src"[^]*תמיד|data-p31="src"[^]*זבחים/); assert.match(h, /טיוטה/);
  assert.match(h, /data-p31="again">עוד פעם/); assert.match(h, /data-p31="back">חזרה/); assert.match(h, /תואר חדש: מיומן!/); assert.match(h, /אימון — המחשה/);
  const t = endHTML31({ id: 'inner', rating: 'tikkun', rec: { n: 2, best: 95, r30: { h: 0, k: 0, t: 1, best: 'tikkun' } } }); assert.match(t, /class="rt tikkun">↻ טעון תיקון/); assert.ok(!/אפשר לנסות שוב/.test(t), 'no invite: "עוד פעם" is there');
  const p = read('src/avodah/shift/practice31.js');
  assert.match(p, /\.p31-end \.bt button\{[^}]*min-height:52px/); assert.match(p, /\.p31-end \.src\{[^}]*min-height:44px/);
  assert.match(p, /body\.p31-on \.f17-fire,body\.p31-on \.f17-tam,body\.p31-on \.f17-bar,body\.p31-on \.p25-w\{display:none!important\}/, 'no fire meter, no tamid timer, no coins\' till, no bar, no dawn clock');
  assert.match(p, /tag\.innerHTML = '<b>אימון<\/b><small>המחשה<\/small>'/);
  const red = (hex) => { const v = hex.replace('#', '').slice(0, 6), r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16); return r > 180 && g < 120 && b < 120; };
  for (const c of p.match(/#[0-9A-Fa-f]{6}/g)) assert.ok(!red(c), c);
  const e = read('src/avodah/shift/end30.js'); assert.match(e, /if \(!E\.prac31\) show\(ev\.id, ev\.rating\);/); assert.match(e, /openAct: \(id, rating\) =>/);
  const ix = read('src/avodah/shift/index.js'); assert.match(ix, /restart: \(\) => runPractice\(role, from\), back: \{ label: 'חזרה לספר התפקידים', fn: \(\) => backFrom31\(from\) \}/);
  assert.match(ix, /onAgain: \(\) => runPractice\(role, from\), onBack: \(\) => backFrom31\(from\)/); assert.match(ix, /back31 = \{ full: from !== 'start', roles: true \};/);
  assert.match(read('src/avodah/shift/hud.js'), /data-sh="backP"/);
});
test('build 31 (5): the pause card stands over the acts\' touch pads (they lay over its right half — its "המשך" — during an act, in the day too)', () => {
  const h = read('src/avodah/shift/hud.js'), pc = h.slice(h.indexOf('pauseCard(h = {})'), h.indexOf('destroy() {', h.indexOf('pauseCard(h = {})')));
  const z = (css) => +css.match(/z-index:(\d+)/)[1], up = z(h.match(/\.sh-root\.sh-up\{[^}]*\}/)[0]);
  assert.match(pc, /R\.classList\.add\('sh-up'\);/); assert.match(pc, /R\.classList\.remove\('sh-up'\);/);
  for (const [f, cls] of [['deshen21.js', 'd21-in'], ['maaracha22.js', 'm22-in'], ['pen25.js', 'p25-in'], ['heichal26.js', 'hk26-in'], ['dam27.js', 'dm27-in'], ['pis23.js', 'p23-in']]) {
    const m = read(`src/avodah/shift/${f}`).match(new RegExp(`\\.${cls}\\{[^}]*\\}`)); assert.ok(m, cls); assert.ok(z(m[0]) < up, `${cls} under the pause card`);
  }
  for (const [f, re] of [['practice31.js', /\.p31-end\{[^}]*\}/], ['end30.js', /\.r30-c\{[^}]*\}/], ['pis23.js', /\.p23-bk\{[^}]*\}/]]) assert.ok(z(read(`src/avodah/shift/${f}`).match(re)[0]) > up, `${f}: its card above`);
});

// ───────── (6) build 30's small fixes ─────────
test('build 31 (6): the day\'s summary says no "באיחור" — a tamid not on time is "הוקרב"; the summary and the lobby carry no late/fail word', async () => {
  const f = read('src/avodah/shift/focus17.js'), sum = f.slice(f.indexOf('function showSummary'), f.indexOf('function closeSummary'));
  assert.ok(!/באיחור|איחר|נכשל|פספס/.test(sum), 'the summary'); assert.match(sum, /tm\.ok \? 'בזמן ✓' : 'הוקרב'/);
  assert.match(sum, /data-f17="book">🎭 ספר התפקידים/, 'the roles book from the summary');
  // on the engine: a day whose evening tamid never came on time → the summary still lists it (ok: false → "הוקרב")
  const R = rig(FLAGS); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.done26(); R.E.debug.setFuel(10);
  R.E.debug.night(); await R.step(0.3); const s = R.E.focus17().summary; assert.ok(s && s.tamids.some((t) => !t.ok));
  const L = [createLobby({ save: SAVE(), start: true }).html(), createLobby({ save: SAVE(), start: false }).html()].join('\n');
  assert.ok(!/באיחור|איחר|נכשל|פספס|הפסד/.test(L), 'the lobby');
});

// ───────── the Divine Name ─────────
test('build 31: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/practice31.js', 'src/avodah/shift/rate30.js', 'src/avodah/shift/end30.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/focus17.js', 'src/avodah/shift/pis23.js', 'src/avodah/shift/hud.js', 'src/avodah/shift/index.js', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'test/build31.test.mjs', 'test/build30.test.mjs', 'test/rig33.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  const words = [bookHTML23(SAVE(), { practice: () => {} }), ...PRAC31.roles.map((id) => endHTML31({ id, rating: 'kasher', rec: SAVE().roles23[id] }))].join(' ');
  for (const r of res) assert.ok(!r.test(words));
});
