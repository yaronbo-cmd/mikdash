// ── fable32 (build 36) ── E2 of the work environment: four mastery levels for every built role — real Hard Fun without failure
// (docs/specs/svivat-avoda-he.md §4.1–§4.5, §9 item 2; gemini-koshi-kesharim-2-he.md "טבלת רמות מתוקנת"). The parameters per role and
// level (cumulative, each with its source or המחשה); a level opens after two מהודר at the one below; the choice (the roles book's
// picker) persists and drives the real act and practice; the points (by the rating and the level, never lost) and the titles by the
// level; "בוקר מהודר" and "כל הרמות"; an older save made level-aware once; no gesture threshold changed; the level chip; the levels'
// cards and journal pages; a Divine-Name scan of the changed files by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { D21, M22, P25, P26, P27, rampY19, PRAC31, SWIPE36 } from '../src/avodah/shift/day33.js';
import { RATE30, LINE30, words30, role30, titleLv36, TITLE36 } from '../src/avodah/shift/rate30.js';
import { LVL36, ROLES36, par36, PTS36, pts36, L36, ensure36, open36, lvl36, pick36, rec36, migrate36, boker36, all36, row36, pages36, addBoker36, SRC36 } from '../src/avodah/shift/lvl36.js';
import { bookHTML23, pickHTML36 } from '../src/avodah/shift/pis23.js';
import { journalHTML32, unlockHTML32 } from '../src/avodah/shift/book32.js';
import { practiceSave31, merge31, endHTML31 } from '../src/avodah/shift/practice31.js';
import '../src/avodah/shift/focus17.js';   // (every act's module: their sources register)
import { rig, FLAGS, seeded } from './rig33.mjs';
import { run1 } from '../tools/lvl36sim.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const twin = () => { const T = { held: false, held19: () => T.held, stick: () => ({ on: false }), pace: { k: 0 } }; return T; };
function after(n) {
  const T23 = ['deshen', 'm22', 'lamb', 'deshen', 'm22', 'lamb'], R26 = ['menorah', 'inner', 'menorah', 'shochet', 'zorek', 'menorah'], past = Math.max(0, Math.min(5, n - 1));
  const roles23 = { m: past, h: T23.slice(0, past).map((id, i) => [i + 1, id, id]) }, roles26 = { m: past, h: R26.slice(0, past).map((id, i) => [i + 1, id]) };
  for (const id of [...T23.slice(0, past), ...R26.slice(0, past)]) roles23[id] = { n: ((roles23[id] && roles23[id].n) | 0) + 1, best: 100, last: 100 };
  if (past) roles23.kiyor = { n: past, best: 100, last: 100 };
  return past ? { day33state: { day: n - 1, night: true, at: Date.now() }, roles23, roles26, served30: past } : {};
}
async function settle(R) { await R.step(0.5); }
// each act played well through the engine's surface — level-aware (the inner coals' side, the band's middle, the western lamp's fire)
const ACT = {
  async kiyor(R) {
    for (let i = 0; i < 60 && !R.E.k20(); i++) await R.step(0.1);
    for (let i = 0; i < 40 && R.E.k20() && R.E.k20().ph !== 'pose'; i++) await R.step(0.1);
    R.E.k20in('L', true); R.E.k20in('R', true);
    for (let i = 0; i < 400 && R.E.k20() && R.E.k20().ph === 'pose'; i++) { const K = R.E.k20(); if (K.P36 && K.P36.bal) R.E.k20bal(Math.max(-1, Math.min(1, -K.b * 4))); await R.step(0.05); }
    R.E.k20in('L', false); R.E.k20in('R', false);
  },
  async lot(R) { for (let i = 0; i < 160 && (R.E.p23() || R.E.gate23() || R.E.gate26L()); i++) { const K = R.E.p23(); if (K && (K.ph === 'in' || K.ph === 'raise')) R.E.p23raise(); if (K && K.ph === 'choose') R.E.p23pick(0); await R.step(0.2); } },
  async m22(R) {
    const w = R.STATIONS.wood.stand; R.at(w.x, w.z); await R.step(0.3); await settle(R);
    for (let i = 0; i < 300 && R.E.m22() && ['in', 'sort', 'sorted'].includes(R.E.m22().ph); i++) { const K = R.E.m22(); if (K.ph === 'sort' && K.ls === 'on') R.E.m22swipe(K.cur.ok ? 0.5 : -0.5, 0, 100); await R.step(0.1); }
    R.at(-38, 46); await R.step(0.2); for (let z = 44; z >= 11; z -= 0.45) { R.at(-34, z, rampY19(z)); await R.step(0.05); }
    R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0);
    const dFor = (air, r) => (2 * r * (1 + air)) / (1 - air);
    for (let g = 0; g < 30 && R.E.m22() && R.E.m22().ph === 'stack'; g++) {
      const K = R.E.m22(), ly = K.layer, size = ly === 4 ? 'M' : 'LMS'[ly - 1], r = M22.r[size], i1 = K.got.findIndex((x) => x.size === size && !x.at && (ly === 4 ? x.s2 : !x.s2));
      const laid = K.got.filter((x) => x.at && x.at.ly === ly), band = R.E.band22();
      R.E.m22place(i1, laid.length ? laid[0].at.x + dFor((band[0] + band[1]) / 2, r) : -0.6); await R.step(0.15);
    }
    for (let i = 0; i < 30 && R.E.m22().ph !== 'ready'; i++) await R.step(0.1);
    R.E.m22tap(); await R.step(M22.ign + 0.3);
  },
  async deshen(R) {
    R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.4); await settle(R);
    for (let i = 0; i < 12 && R.E.d21() && R.E.d21().ph === 'sweep'; i++) { const K = R.E.d21(), s = K.side ? K.side[Math.min(K.n, K.side.length - 1)] : 1; R.E.d21swipe(0.6 * s, 0.05, 100); await R.step(0.3); }
    await R.step(1); R.E.d21stick(1);
    for (let i = 0; i < 900 && R.E.d21() && R.E.d21().ph !== 'foot'; i++) { R.E.d21bal(Math.max(-1, Math.min(1, -R.E.d21().b * 4))); await R.step(0.05); }
    const g = D21.go[2]; R.at(g[0], g[1]); await R.step(0.2); R.E.d21tap(); await R.step(D21.pour + 0.6);
  },
  async gate(R) { R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8); R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(P26.key + 0.2); R.E.r26hold(false); await R.step(P26.opn + 0.2); },
  async inner(R) {
    await ACT.gate(R); const a = P26.alt; R.at(a.x + 1, a.z); await R.step(1.2);
    for (let i = 0; i < P26.pulls && R.E.r26() && R.E.r26().ph === 'pull'; i++) { R.E.r26pull(1.5); await R.step(0.2); }
    for (let i = 0; i < 300 && R.E.r26() && R.E.r26().ph !== 'out'; i++) { const K = R.E.r26(); if (K.ph === 'teni36') R.E.r26bal(Math.max(-1, Math.min(1, -K.b * 4))); await R.step(0.05); }
  },
};
async function morning(day, o = {}) {
  const save = o.save || after(day), R = rig(FLAGS, { save, twin: twin(), rng: seeded(o.seed || 5), ...(o.lv36 != null ? { lv36: o.lv36 } : {}) });
  R.E.start(); await R.step(0.3);
  await ACT.kiyor(R); await ACT.lot(R);
  const lot = R.E.lot23(); await ACT[lot](R);
  for (let i = 0; i < 40 && (R.E.word30() || R.E.j32card()); i++) await R.step(0.1);
  R.at(-24, 32, 16); await R.step(0.4); await ACT.lot(R);
  const role = R.E.role26(); await ACT[role](R);
  for (let i = 0; i < 60; i++) await R.step(0.1);
  return { R, save, lot, role };
}
/** a practice run of a role at a level (forced) on a copy of the save; the record merged back */
function practise(role, save, L, seed = 11) {
  const copy = practiceSave31(save), R = rig(FLAGS, { save: copy, practice: { role, day: 7, fed: 44, seed: 4242 + seed }, rng: seeded(seed), ...(L ? { lv36: L } : {}) });
  R.E.on17((ev) => { if (ev.type === 'p31rec') merge31(save, ev.id, ev.rec); });
  return R;
}
const SAVE = () => ({ served30: 5, roles23: { m: 6, h: [], kiyor: { n: 6, best: 100, last: 75, r30: { h: 4, k: 2, t: 0, best: 'mehudar' } }, deshen: { n: 2, best: 100, last: 100, r30: { h: 2, k: 0, t: 0, best: 'mehudar' } }, m22: { n: 2, best: 80, last: 80, r30: { h: 0, k: 2, t: 0, best: 'kasher' } }, lamb: { n: 2, best: 100, last: 45, r30: { h: 1, k: 0, t: 1, best: 'mehudar' } }, menorah: { n: 2, best: 90, last: 90 }, inner: { n: 1, best: 95, last: 95 }, shochet: { n: 1, best: 100, last: 100 }, zorek: { n: 1, best: 88, last: 88 } }, roles26: { m: 6, h: [] } });

// ───────── (1) the parameters ─────────
test('build 36 (1): every built role has four levels — a name, what it adds, its source (טיוטה) or המחשה, its knobs; level 1 is the default', () => {
  assert.deepEqual(ROLES36, PRAC31.roles, 'the eight built roles (the laver too)');
  for (const id of ROLES36) {
    assert.equal(LVL36[id].length, 4, id);
    for (const [i, x] of LVL36[id].entries()) {
      assert.ok(x.he && x.add && x.p, `${id} L${i + 1}`);
      assert.ok(x.src ? / — .+ · טיוטה$/.test(x.src) : x.mh === 1, `${id} L${i + 1}: a source with טיוטה, or המחשה`);
      assert.ok(words30(x.he) >= 1 && words30(x.he) <= 6, `${id} L${i + 1}: a short name`);
    }
    assert.equal(par36(id, 0), LVL36[id][0].p); assert.equal(par36(id, 9), LVL36[id][3].p);
  }
  assert.equal(lvl36({}, 'zorek'), 1, 'level 1 by default');
});
test('build 36 (1): the levels are cumulative and harder by content — narrower windows, more conditions, weight, balance — never a speed-up of the day or a penalty', () => {
  const P = (id) => LVL36[id].map((x) => x.p);
  const k = P('kiyor'); assert.equal(k[0].guide, 1); assert.equal(k[1].guide, 0); assert.ok(k[2].hold > k[1].hold); assert.ok(k[3].bal && k[3].hold >= k[2].hold);
  const d = P('deshen'); assert.equal(d[0].inner, 0); assert.ok(d.slice(1).every((x) => x.inner === 1)); assert.ok(d[2].heavy.wind > d[1].heavy.wind && d[3].heavy.spill <= d[2].heavy.spill); assert.ok(d[3].exact > 0 && !d[2].exact);
  const m = P('m22'); assert.ok(m[1].bad > m[0].bad); assert.ok(m[2].band < 1 && m[3].band <= m[2].band && m[2].strict === 1); assert.equal(m[3].second, 2); assert.ok(m[3].band2 < m[3].band);
  const l = P('lamb'); assert.deepEqual(l.map((x) => [x.small, x.mimic, x.two]), [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]]);
  const n = P('inner'); assert.ok(n[1].vmax < n[0].vmax); assert.equal(n[2].guide, 0); assert.ok(n[3].teni && n[3].vmax <= n[2].vmax);
  const mn = P('menorah'); for (let i = 1; i < 4; i++) assert.ok(mn[i].hi - mn[i].lo <= mn[i - 1].hi - mn[i - 1].lo, 'the half-log band narrows'); assert.deepEqual(mn.map((x) => [x.ev, x.west]), [[0, 0], [0, 0], [1, 0], [1, 1]]);
  const s = P('shochet'); for (let i = 1; i < 4; i++) assert.ok(s[i].win[1] - s[i].win[0] <= s[i - 1].win[1] - s[i - 1].win[0]); assert.ok(s[1].turn && s[3].sweep < 1 && s[2].sweep === 1);
  const z = P('zorek'); assert.ok(z[0].tol > z[1].tol && z[1].guide === 0 && z[2].deg < z[1].deg && z[3].coag > 1);
  // the rating of build 30 is the same — מהודר ≥ 0.85, כשר ≥ 0.5 — and no level's knob is a time, a clock or a pace of the day
  assert.equal(RATE30.hi, 0.85); assert.equal(RATE30.lo, 0.5);
  const src = read('src/avodah/shift/lvl36.js');
  assert.ok(!/dayS|drain|fuel|speedMul|PACE|clock/.test(src.slice(src.indexOf('export const LVL36'), src.indexOf('export const par36'))), 'no day clock, drain or pace among the levels');
});
test('build 36 (1): the owner\'s decision (23.10 06:37, "סף ההחלקה להקל") — one shared swipe gate, SWIPE36: |Δ| ≥ 0.15 of the screen within ≤ 350 ms, read by every swipe check; holds, drags and timing windows untouched', async () => {
  assert.deepEqual({ ...SWIPE36 }, { dist: 0.15, ms: 350 }); assert.ok(Object.isFrozen(SWIPE36));
  // every swipe gate reads it: the engine's swipeWhy, the wick, the yesod; the lot's swipe up; the modules' crossing times
  const d = read('src/avodah/shift/day33.js');
  assert.match(d, /swipeWhy = \(dx, dy, ms, min\) => \(void min, Math\.abs\(dx\) >= SWIPE36\.dist \? \(Math\.abs\(dy\) > 0\.5 \* Math\.abs\(dx\) \? 'crooked' : ms > SWIPE36\.ms \? 'slow' : ''\) : 'short'\)/);
  assert.match(d, /\? dy <= -SWIPE36\.dist/); assert.match(d, /const why = dy < SWIPE36\.dist \? 'short' : Math\.abs\(dx\) > 0\.6 \* dy \? 'crooked' : ms > SWIPE36\.ms \? 'slow' : '';/);
  assert.ok(!/ms > D21\.ms|dy < -P26\.wick|ms > P26\.ms|dy < P27\.dn|ms > P27\.ms/.test(d), 'no swipe reads the old numbers');
  const pis = read('src/avodah/shift/pis23.js'); assert.match(pis, /t - trail\[0\]\[0\] > SWIPE36\.ms \/ 1e3/); assert.match(pis, />= SWIPE36\.dist \* \(innerHeight \|\| 390\) && E\.p23raise\(\)/);
  for (const f of ['deshen21', 'maaracha22', 'pen25', 'heichal26', 'dam27']) { const m = read(`src/avodah/shift/${f}.js`); assert.match(m, />= SWIPE36\.dist \* (W|WD|HT)\(\)/, f); assert.ok(!/> (D21|M22|P25|P26)\.sw \* |> P26\.wick \* |> P27\.dn \* /.test(m), `${f}: no old gate`); }
  // on the engine: the ashes' raking, the pyre's sort, the lamb's brush, the bolt, the wick, the wipe, the yesod — 0.15 within 350 ms counts; under it or slower not
  const s = SAVE(); migrate36(s);
  const D = practise('deshen', s, 1); D.E.start(); D.H.y = 25; await D.step(0.8);
  assert.equal(D.E.d21swipe(0.149, 0.02, 200), false); assert.equal(D.E.d21swipe(0.15, 0.02, 351), false); assert.equal(D.E.d21swipe(0.15, 0.02, 350), true, '0.15 in 350 ms: a scoop');
  assert.ok(D.ev('d21swipe').some((e) => e.why === 'short') && D.ev('d21swipe').some((e) => e.why === 'slow'));
  const M = practise('m22', s, 1); M.E.start(); await M.step(0.3); await settle(M);
  for (let i = 0; i < 60 && !(M.E.m22() && M.E.m22().ph === 'sort' && M.E.m22().ls === 'on'); i++) await M.step(0.1);
  assert.equal(M.E.m22swipe(0.14, 0, 200), null); assert.ok(M.E.m22swipe(-0.15, 0, 350), 'the sort: 0.15 counts');
  const N = practise('menorah', s, 1); N.E.start(); await N.step(0.6); N.at(P26.gate.x + 2, P26.gate.z); await N.step(0.8);
  assert.equal(N.E.r26swipe(0.149, 0, 300), false); assert.equal(N.E.r26swipe(0.15, 0, 350), true, 'the bolt: 0.15 in 350 ms');
  N.E.r26hold(true); await N.step(P26.key + 0.2); N.E.r26hold(false); await N.step(P26.opn + 0.2); N.at(P26.walkM.x + 1, P26.walkM.z); await N.step(1.2);
  assert.equal(N.E.r26().ph, 'wick'); assert.equal(N.E.r26swipe(0, -0.14, 200), false); assert.equal(N.E.r26swipe(0, -0.15, 350), true, 'the wick: 0.15 up in 350 ms');
  // holds, drags and timing windows are not swipes: their numbers as they were
  assert.deepEqual([P26.key, P26.vmax, P27.sweep, P27.still, D21.bal.fix, M22.gv], [0.8, 2.4, 1.15, 3, 2.4, 1.2]);
  assert.match(read('src/game/twin.js'), /STICK24/);
});

// ───────── (2) the unlock and the choice ─────────
test('build 36 (2): a level opens after two מהודר at the one below; the pick never goes above what is open; nothing goes down', () => {
  const a = { n: 0, best: 0, last: 0 };
  assert.equal(open36(a), 1);
  rec36(a, 1, 'mehudar'); assert.equal(open36(a), 1, 'one מהודר: not yet');
  rec36(a, 1, 'kasher'); rec36(a, 1, 'tikkun'); assert.equal(open36(a), 1, 'כשר and טעון תיקון do not open');
  const u = rec36(a, 1, 'mehudar'); assert.equal(open36(a), 2); assert.equal(u.opened, 2, 'the second מהודר opens level 2');
  rec36(a, 2, 'mehudar'); rec36(a, 2, 'mehudar'); assert.equal(open36(a), 3);
  rec36(a, 3, 'mehudar'); rec36(a, 3, 'mehudar'); assert.equal(open36(a), 4);
  rec36(a, 4, 'mehudar'); rec36(a, 4, 'mehudar'); assert.equal(open36(a), 4, 'four is the top');
  const save = { roles23: { m22: { n: 3, best: 90, last: 90, r30: { h: 1, k: 2, t: 0, best: 'mehudar' } } } };
  assert.equal(pick36(save, 'm22', 2), false, 'level 2 is locked (one מהודר)'); assert.equal(lvl36(save, 'm22'), 1);
  save.roles23.m22.l36.c[1].h = 2; assert.equal(pick36(save, 'm22', 2), true); assert.equal(lvl36(save, 'm22'), 2);
  assert.equal(pick36(save, 'm22', 1), true, 'back to an easier level: allowed'); assert.equal(lvl36(save, 'm22'), 1); assert.equal(open36(save.roles23.m22), 2, 'and level 2 stays open');
  save.roles23.m22.l36.pick = 4; assert.equal(lvl36(save, 'm22'), 2, 'a pick above what is open is played at the highest open');
  assert.equal(pick36(save, 'nope', 1), false); assert.equal(pick36(save, 'kiyor', 1), true, 'the laver: its record made if it has none');
});
test('build 36 (2): the choice drives the real act — the laver every morning at his pick — and practice; the act records its level', async () => {
  const save = after(3); save.roles23.kiyor.l36 = { c: { 1: { h: 2, k: 0, t: 0 }, 2: { h: 2, k: 0, t: 0 }, 3: { h: 0, k: 0, t: 0 }, 4: { h: 0, k: 0, t: 0 } }, pts: 0, pick: 3, keep: null, up: [] };
  const R = rig(FLAGS, { save, twin: twin(), rng: seeded(5) }); R.E.start(); await R.step(0.3);
  assert.deepEqual(R.E.lv36now(), { id: 'kiyor', lv: 3 }, 'before the act: the laver at level 3 (the chip)');
  for (let i = 0; i < 60 && !R.E.k20(); i++) await R.step(0.1);
  const K = R.E.k20(); assert.equal(K.lv, 3); assert.ok(Math.abs(K.T - 3.5 * 1.6) < 1e-9, 'the water runs longer'); assert.equal(K.P36.guide, 0);
  await ACT.kiyor(R); await R.step(0.5);
  assert.equal(R.E.lv36act('kiyor').lv, 3);
  assert.equal(save.roles23.kiyor.l36.c[3].h, 1, 'counted at level 3'); assert.equal(R.ev('p23rec').length >= 1, true);
  // practice: the same pick (the run's save is a copy of his)
  const s2 = SAVE(); migrate36(s2); s2.roles23.zorek.l36.c[1].h = 2; pick36(s2, 'zorek', 2);
  const P = practise('zorek', s2); P.E.start(); await P.step(0.8);
  assert.deepEqual(P.E.lv36now(), { id: 'zorek', lv: 2 }); assert.equal(P.E.lv36act('zorek').p.guide, 0);
});
test('build 36 (2): the roles book — each role its four levels, its points, the level button from the lobby only; the picker — open levels as buttons, a locked one "2 × מהודר ברמה N"', () => {
  const s = SAVE(); migrate36(s);
  const h = bookHTML23(s, { practice: () => {} });
  assert.equal((h.match(/class="l36"/g) || []).length, 8, 'the eight roles had (the laver\'s row and the two lots\' seven) — a levels row each');
  assert.match(h, /data-l36="deshen"[^>]*>רמה 1</, 'the ashes: played at level 1 (his pick) — level 2 open by its two מהודר');
  assert.match(h, /<span class="l36m"[^>]*><i class="on">1<\/i><i class="o">2<\/i><i class="lk">🔒<\/i><i class="lk">🔒<\/i><\/span><b class="pt">✦ 20<\/b>/, 'the marks: 1 chosen, 2 open, 3–4 locked; its points');
  assert.ok(!/data-l36=/.test(bookHTML23(s, { note31: true })), 'mid-day (read-only): no level button');
  assert.match(h, /התארים — לפי הרמה שבה הגעתם למהודר: מתחיל · רגיל \(רמה 1\) · מיומן \(רמה 2\) · מומחה \(רמה 3\) · אומן \(רמה 4\) — טיוטה/);
  const p = pickHTML36(s, 'deshen');
  assert.equal((p.match(/data-l36p="deshen:/g) || []).length, 2, 'levels 1–2 open'); assert.match(p, /🔒 רמה 3 · מחתה כבדה/); assert.match(p, /נפתחת אחרי 2 × מהודר ברמה 2 \(יש 0\)/);
  assert.match(p, /חתה מן המאוכלות הפנימיות&quot; — תמיד א, ד · טיוטה/); assert.match(p, /המחשה/); assert.match(p, /› חזרה/);
  assert.ok(!/(מהר|הזדרזו|נגמר הזמן|תפסיד|אל תפספס)/.test(p + h), 'no pressure wording');
  const css = read('src/avodah/shift/pis23.js');
  assert.match(css, /button\.l36b\{[^}]*min-height:44px/); assert.match(css, /\.l36o\{[^}]*min-height:52px/); assert.match(css, /button\.l36x\{[^}]*min-height:44px/);
  // the journal keeps the picker (book32: data-l36 / data-l36p / data-l36x) and saves the choice
  const b = read('src/avodah/shift/book32.js'); assert.match(b, /if \(pick36\(save, id, \+L\)\) persist\(\);/); assert.match(b, /lvPick: o\.practice \? o\.lvPick : null/);
});

// ───────── (3) the points and the titles ─────────
test('build 36 (3): mastery points by the rating and the level — never lost; the title by the highest level with a מהודר (מתחיל · רגיל · מיומן · מומחה · אומן — draft)', () => {
  assert.deepEqual(PTS36, { mehudar: [10, 20, 35, 60], kasher: [5, 10, 18, 30], tikkun: [1, 2, 3, 5] });
  assert.ok(pts36('mehudar', 4) > 10 * pts36('kasher', 1) - 1, 'מהודר at level 4 worth much more than כשר at level 1');
  assert.deepEqual(TITLE36.map((t) => t.he), ['מתחיל', 'רגיל', 'מיומן', 'מומחה', 'אומן']);
  const a = { n: 1, best: 0, last: 0 }; ensure36(a); a.l36.keep = null;
  assert.equal(titleLv36(a).he, 'מתחיל');
  let u = rec36(a, 1, 'kasher'); assert.equal(u.pts, 5); assert.equal(u.up, null); assert.equal(titleLv36(a).he, 'מתחיל');
  u = rec36(a, 1, 'mehudar', { d: 4, t: 1 }); assert.equal(u.up.ti, 'regular'); assert.equal(titleLv36(a).he, 'רגיל');
  rec36(a, 1, 'mehudar'); u = rec36(a, 2, 'mehudar', { d: 6 }); assert.equal(u.up.ti, 'skilled'); assert.equal(u.pts, 20);
  rec36(a, 2, 'mehudar'); u = rec36(a, 3, 'kasher'); assert.equal(u.up, null);
  u = rec36(a, 3, 'mehudar'); assert.equal(titleLv36(a).he, 'מומחה'); rec36(a, 3, 'mehudar'); u = rec36(a, 4, 'mehudar', { pr: 1 }); assert.equal(u.up.ti, 'master'); assert.equal(u.up.pr, 1);
  const total = a.l36.pts; rec36(a, 1, 'tikkun'); assert.ok(a.l36.pts > total, 'a טעון תיקון still adds — points never go down');
  assert.equal(titleLv36(a).he, 'אומן', 'a poorer act never lowers the title');
  assert.deepEqual(a.l36.up.map((x) => x.ti), ['regular', 'skilled', 'expert', 'master'], 'a page for each title risen to');
  assert.equal(role30(a).title.he, 'אומן', 'role30 reads the title by the level');
});
test('build 36 (3): a practice run counts at its level — its points and a level opened on the end card; a real morning\'s title-up — its card ("תואר חדש") after the rating\'s word', async () => {
  const s = SAVE(); migrate36(s);
  const R = practise('deshen', s, 0); R.E.start(); R.H.y = 25; await R.step(0.3); await ACT.deshen(R); await R.step(3);
  const end = R.ev('p31end')[0]; assert.ok(end, 'the end card'); assert.equal(end.lv36, 1); assert.equal(end.pts36, 10);
  assert.equal(s.roles23.deshen.l36.c[1].h, 3); assert.equal(s.roles23.deshen.l36.pts, 3 * 10, 'the old two מהודר (10 each) and this one');
  const h = endHTML31({ id: 'deshen', rating: 'mehudar', rec: s.roles23.deshen, lv36: 1, pts36: 10, open36: 2 });
  assert.match(h, /רמה 1 · \+10 נקודות שליטה \(30\)/); assert.match(h, /✦ רמה 2 נפתחה — בספר התפקידים/);
  // a fresh save's first מהודר in a real morning: רגיל — its card (l36new), answered by the rig; never in practice
  const M = await morning(2);
  const cards = M.R.ev('l36new'); assert.ok(cards.some((c) => c.kind === 'l36' && c.ti === 'regular'), 'a title card'); assert.equal(R.ev('l36new').length, 0, 'none in practice');
  assert.ok(M.save.roles23.kiyor.l36.up.some((x) => x.ti === 'regular'));
  const card = unlockHTML32({ id: 'kiyor', kind: 'l36', ti: 'regular', lv: 1, opened: 0 });
  assert.match(card, /🏅 תואר חדש: רגיל/); assert.match(card, /לפתוח ביומן/); assert.match(card, /המשך/); assert.ok(!/(שניות|זמן|מהר)/.test(card));
  const open = unlockHTML32({ id: 'm22', kind: 'l36', ti: null, lv: 1, opened: 2 }); assert.match(open, /✦ רמה 2 נפתחה/); assert.match(open, /אפשר לבחור בה בספר התפקידים — או להישאר ברמה שלכם; שום דבר לא יורד/);
});

// ───────── (4) the challenges ─────────
test('build 36 (4): "בוקר מהודר" — every act of his that morning מהודר at level 3 or more: a page and its card; not at level 2, not with one כשר; never a streak', async () => {
  assert.equal(boker36([['kiyor', 'mehudar', 3], ['m22', 'mehudar', 4]]), true);
  assert.equal(boker36([['kiyor', 'mehudar', 2], ['m22', 'mehudar', 4]]), false); assert.equal(boker36([['kiyor', 'kasher', 3]]), false); assert.equal(boker36([]), false);
  const M = await morning(2, { lv36: 3 });
  const ratings = M.R.ev('rate30').map((e) => [e.id, e.rating]);
  assert.deepEqual(ratings, [['kiyor', 'mehudar'], ['m22', 'mehudar'], ['inner', 'mehudar']], 'a whole morning מהודר at level 3');
  assert.equal(M.save.lvl36.boker.length, 1); assert.deepEqual(M.save.lvl36.boker[0].acts.map((x) => x[2]), [3, 3, 3]);
  assert.ok(M.R.ev('l36new').some((c) => c.kind === 'boker36'), 'its card'); assert.equal(M.R.ev('l36boker').length, 1);
  const L2 = await morning(2, { lv36: 2 }); assert.equal(((L2.save.lvl36 || {}).boker || []).length, 0, 'at level 2: no');
  assert.equal(addBoker36(M.save, M.save.lvl36.boker[0].d, 1, [['kiyor', 'mehudar', 3]]), false, 'once a day');
  const j = journalHTML32(M.save, { tab: 'badges' }); assert.match(j, /🏆 דפי השליטה/); assert.match(j, /בוקר מהודר — יום 2/);
  const pg = journalHTML32(M.save, { tab: 'badges', m36: 'boker:2' }); assert.match(pg, /🌅 בוקר מהודר — יום 2/); assert.match(pg, /בהידור מצוה עד שליש במצוה/); assert.match(pg, /אין רצף ואין מה להפסיד/);
  assert.ok(!/רצף של|ימים ברצף|אל תשבור/.test(read('src/avodah/shift/lvl36.js') + read('src/avodah/shift/book32.js')), 'no streak wording');
});
test('build 36 (4): "כל הרמות" — מהודר at level 4 in every built role → the badge in the journal', () => {
  const s = SAVE(); migrate36(s);
  for (const id of ROLES36) { const a = s.roles23[id] || (s.roles23[id] = { n: 0, best: 0, last: 0 }); ensure36(a); }
  assert.equal(all36(s), false);
  for (const id of ROLES36) rec36(s.roles23[id], 4, 'mehudar');
  assert.equal(all36(s), true);
  rec36(s.roles23.zorek, 4, 'tikkun'); assert.equal(all36(s), true, 'never lost');
  const j = journalHTML32(s, { tab: 'badges' }); assert.match(j, /<div class="b on"><i>🏅<\/i><span><b>כל הרמות<\/b>/); assert.match(j, /זכו בו שלשה עשר כהנים/);
  assert.equal(SRC36.all, '"זכו בו שלשה עשר כהנים" — יומא ב, ג · טיוטה');
  // the title pages: one per title risen to, with the role's own source
  const p = pages36(s); assert.ok(p.pages.length >= ROLES36.length); const t = p.pages.find((x) => x.k === 'title' && x.id === 'zorek');
  const pg = journalHTML32(s, { tab: 'badges', m36: `title:zorek:${t.ti}` }); assert.match(pg, /🏅 תואר חדש: /); assert.match(pg, /זריקת הדם/); assert.match(pg, /טיוטה/);
});

// ───────── (5) older saves ─────────
test('build 36 (5): an older save — everyone at level 1, the next open by his מהודר count, the points from his records once, his old title kept', () => {
  const s = SAVE(), n = migrate36(s);
  assert.equal(n, 8); assert.equal(migrate36(s), 0, 'once');
  const k = s.roles23.kiyor.l36; assert.deepEqual(k.c[1], { h: 4, k: 2, t: 0 }); assert.equal(k.pts, 4 * 10 + 2 * 5); assert.equal(k.pick, 1); assert.equal(open36(s.roles23.kiyor), 2, '4 × מהודר at level 1: level 2 open');
  assert.equal(open36(s.roles23.lamb), 1, 'one מהודר: level 1 only');
  const m = s.roles23.menorah.l36; assert.deepEqual(m.c[1], { h: 0, k: 2, t: 0 }, 'plays before build 30, best ≥ 50 %: כשר'); assert.equal(m.pts, 10);
  assert.equal(s.roles23.kiyor.l36.keep, 'skilled', 'build 30 gave the laver מיומן (4 × מהודר)'); assert.equal(role30(s.roles23.kiyor).title.he, 'מיומן', 'kept — no title goes down');
  assert.equal(role30(s.roles23.deshen).title.he, 'רגיל');
  assert.deepEqual(row36(s, 'kiyor').lv.map((x) => x.open), [true, true, false, false]);
  // shape guards: junk in l36 is repaired, not thrown
  const j = { n: 2, best: 70, last: 70, l36: { c: { 1: { h: 1 } }, pts: 'x' } }; ensure36(j); assert.deepEqual(Object.keys(j.l36.c).sort(), ['1', '2', '3', '4']); assert.equal(j.l36.pts, 0); assert.deepEqual(j.l36.up, []);
});

// ───────── (6) the acts at their levels ─────────
test('build 36 (6): each role\'s level-4 content in the engine — the laver\'s balance, the ashes\' side and heap, the second pyre, two lambs, the teni out, the western lamp from the altar, the shochet\'s window, the zorek\'s clot', async () => {
  const s = SAVE(); migrate36(s);
  // the ashes, level 2: a scoop from the outer side is refused and counted
  const D = practise('deshen', s, 2); D.E.start(); D.H.y = 25; await D.step(0.8);
  const K = D.E.d21(); assert.equal(K.ph, 'sweep'); const want = K.side[0];
  assert.equal(D.E.d21swipe(-0.6 * want, 0.05, 100), false); assert.equal(K.outer, 1); assert.equal(D.E.d21swipe(0.6 * want, 0.05, 100), true);
  assert.ok(D.ev('d21swipe').some((e) => e.why === 'outer'));
  // the pyre, level 4: after the big pyre, two fig logs for the second; its band narrower
  const M = practise('m22', s, 4); M.E.start(); await M.step(0.3); await (async () => { await settle(M); for (let i = 0; i < 400 && M.E.m22() && ['in', 'sort', 'sorted'].includes(M.E.m22().ph); i++) { const k = M.E.m22(); if (k.ph === 'sort' && k.ls === 'on') M.E.m22swipe(k.cur.ok ? 0.5 : -0.5, 0, 100); await M.step(0.1); } })();
  M.at(M22.stand.x, M22.stand.z, 25); await M.step(1.2);
  const dFor = (air, r) => (2 * r * (1 + air)) / (1 - air);
  for (let g = 0; g < 30 && M.E.m22() && M.E.m22().ph === 'stack'; g++) { const k = M.E.m22(), ly = k.layer, size = ly === 4 ? 'M' : 'LMS'[ly - 1], i1 = k.got.findIndex((x) => x.size === size && !x.at && (ly === 4 ? x.s2 : !x.s2)), laid = k.got.filter((x) => x.at && x.at.ly === ly), b = M.E.band22(); M.E.m22place(i1, laid.length ? laid[0].at.x + dFor((b[0] + b[1]) / 2, M22.r[size]) : -0.6); await M.step(0.15); }
  assert.equal(M.E.m22().ph, 'ready'); assert.equal(M.E.m22().got.filter((x) => x.s2 && x.at).length, 2, 'the second pyre laid'); assert.ok(M.ev('m22').some((e) => e.ph === 'second'));
  // the lamb, level 4: a whole lamb approved brings a second to compare
  const L = practise('lamb', s, 4, 3); L.E.start(); await L.step(0.8);
  for (let i = 0; i < 40 && L.E.p25().ph !== 'scan'; i++) await L.step(0.1);
  let judged = 0;
  for (let n = 0; n < 60 && L.E.p25() && !/^(lead|end)$/.test(L.E.p25().ph); n++) {
    const k = L.E.p25();
    if (k.ph === 'scan') { const blem = k.L.blem && k.rej < P25.rej; L.E.p25stamp(blem ? 'pasul' : 'tamim'); judged++; await L.step(0.3); continue; }
    if (k.ph === 'wait') { L.E.p25tap(); } await L.step(0.4);
  }
  assert.ok(L.E.p25r().judged36 >= 2, 'two lambs judged'); assert.ok(L.ev('p25').some((e) => e.ph === 'bring' && e.two) || L.ev('p25').some((e) => e.ph === 'aside'));
  // the menorah, level 4: the western lamp first, its fire only from the outer altar's pan
  const N = practise('menorah', s, 4); N.E.start(); await N.step(0.6); await ACT.gate(N); N.at(P26.walkM.x + 1, P26.walkM.z); await N.step(1.2);
  assert.deepEqual(N.E.r26().ord.slice(0, 2), [5, 6]); assert.deepEqual(N.E.r26().lit.slice(5), [0, 0]);
  for (let i = 0; i < 2000 && N.E.r26() && N.E.r26().ph !== 'altar'; i++) { const k = N.E.r26(); if (k.ph === 'wick') N.E.r26swipe(0, -0.5, 100); else if (k.ph === 'wipe') N.E.r26swipe(0.5, 0, 100); else if (k.ph === 'pour' && !k.held) N.E.r26hold(true); else if (k.ph === 'pour' && k.held && k.fill >= 0.96) N.E.r26hold(false); else if (k.ph === 'new') N.E.r26tap(); await N.step(0.02, 0.02); }
  assert.equal(N.E.r26().ph, 'altar'); assert.equal(N.E.r26light(), false, 'from a lamp: refused'); assert.equal(N.E.r26().wrong, 1); assert.equal(N.E.r26light('altar'), true); assert.equal(N.E.r26().lit[5], 1);
  // the inner altar, level 4: the teni carried out, held level
  const I = practise('inner', s, 4); I.E.start(); await I.step(0.6); await ACT.inner(I); await I.step(3);
  assert.ok(I.ev('r26').some((e) => e.ph === 'teni36')); assert.ok(I.E.r26r() && I.E.r26r().spills36 != null, 'its coals fallen counted');
  // the laver, level 4: the stream's spills count as lifts
  const R = practise('kiyor', s, 4); R.E.start(); await R.step(0.6);
  for (let i = 0; i < 40 && R.E.k20() && R.E.k20().ph !== 'pose'; i++) await R.step(0.1);
  R.E.k20in('L', true); R.E.k20in('R', true); for (let i = 0; i < 200 && R.E.k20() && R.E.k20().ph === 'pose'; i++) await R.step(0.05);   // (no counter: it tips)
  const kr = R.ev('rate30').find((e) => e.id === 'kiyor'); assert.ok(kr && kr.rating !== 'mehudar', 'unbalanced: not מהודר'); assert.ok(R.ev('k20spill').length >= 1);
  // the shochet, level 4: the narrow gold and the quicker needle; the zorek, level 4: the quicker clot circled away at the corner
  const S = practise('shochet', s, 4); S.E.start(); await S.step(0.8); S.E.r27bind(true); await S.step(P27.bound + 0.2);
  for (let i = 0; i < 100 && S.E.r27().ph !== 'cut'; i++) await S.step(0.1);
  assert.deepEqual(S.E.r27().P36.win, [0.482, 0.518]); assert.ok(Math.abs(S.E.r27().sweep - P27.sweep * 0.7) < 1e-9 || Math.abs(S.E.r27().sweep - P27.sweep1 * 0.7) < 1e-9);
  for (let i = 0; i < 400; i++) { const u = S.E.r27().u; if (u > 0.53 && u < 0.6) break; await S.step(0.005, 0.005); }
  assert.equal(S.E.r27tap(), false, 'outside the narrow gold'); assert.equal(S.E.r27().miss, 1);
  const Z = practise('zorek', s, 4); Z.E.start(); await Z.step(0.8);
  for (let i = 0; i < 300 && Z.E.r27().ph !== 'recv'; i++) await Z.step(0.1);
  const zk = Z.E.r27(); zk.ph = 'aim'; zk.clot = true; zk.coag = 1; zk.t = 1;
  assert.equal(Z.E.r27throw(0.35, 0), 'clot'); assert.equal(Z.E.r27swirl(1), true, 'a clot at the corner can be circled'); for (let i = 0; i < 40; i++) { Z.E.r27swirl(1.5); await Z.step(0.05, 0.05); }
  assert.equal(Z.E.r27().clot, false, 'circled away — no soft-lock');
});
test('build 36 (6): the measured share of מהודר (tools/lvl36sim.mjs, the autoplayer\'s two hands in node) — level 1 the child, level 4 the skilled: within the spec\'s targets for most roles', async () => {
  const rate = async (role, L, prof, n = 40) => { let h = 0; for (let i = 0; i < n; i++) if ((await run1(role, L, prof, i)).rating === 'mehudar') h++; return h / n; };
  // (a sample: the laver and the shochet at level 1 for the child, the ashes and the pyre at level 4 for the skilled; the full table is the build's report)
  const k1 = await rate('kiyor', 1, 'child'); assert.ok(k1 >= 0.55 && k1 <= 0.85, `laver L1 child ${k1}`);
  const z1 = await rate('zorek', 1, 'child'); assert.ok(z1 >= 0.55 && z1 <= 0.9, `zorek L1 child ${z1}`);
  const d4 = await rate('deshen', 4, 'skilled'); assert.ok(d4 >= 0.12 && d4 <= 0.5, `ashes L4 skilled ${d4}`);
  const m4 = await rate('m22', 4, 'skilled'); assert.ok(m4 >= 0.12 && m4 <= 0.5, `pyre L4 skilled ${m4}`);
  const s4 = await rate('shochet', 4, 'skilled'); assert.ok(s4 < 0.6, `shochet L4 skilled ${s4}: a real win, not always`);
});

// ───────── (7) the chip, the lines ─────────
test('build 36 (7): the level chip beside the step card (from E.lv36now — off between his acts); the new phases\' lines are 2–4 words', async () => {
  const f = read('src/avodah/shift/focus17.js');
  assert.match(f, /const chip36 = mk\('l36-chip', '', 'div', top\);/); assert.match(f, /chip36\.innerHTML = `<b>רמה \$\{lv\.lv \| 0\}<\/b><small>טיוטה<\/small>`/);
  assert.match(f, /\.l36-chip\{[^}]*min-height:44px/);
  for (const w of [LINE30.inner.lift36, LINE30.inner.teni36, LINE30.menorah.altar, LINE30.m22.s2]) assert.ok(words30(w) >= 2 && words30(w) <= 4, w);
  const M = await morning(2); assert.equal(M.R.E.lv36now(), null, 'after the morning: none');
});

// ───────── the Divine Name ─────────
test('build 36: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/lvl36.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/rate30.js', 'src/avodah/shift/index.js', 'src/avodah/shift/pis23.js', 'src/avodah/shift/book32.js', 'src/avodah/shift/focus17.js', 'src/avodah/shift/practice31.js', 'src/avodah/shift/dam27.js', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/kiyor20.js', 'src/avodah/shift/deshen21.js', 'src/avodah/shift/pen25.js', 'src/avodah/shift/maaracha22.js',
    'tools/lvl36sim.mjs', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'test/build36.test.mjs', 'test/rig33.mjs', 'test/build30.test.mjs', 'test/build31.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  // and every word a level can show
  const words = [...ROLES36.flatMap((id) => LVL36[id].flatMap((x) => [x.he, x.add, x.src || ''])), SRC36.boker, SRC36.all, ...TITLE36.map((t) => t.he), bookHTML23(SAVE(), { practice: () => {} }), pickHTML36(SAVE(), 'menorah')].join(' ');
  res.forEach((r) => assert.ok(!r.test(words)));
});
