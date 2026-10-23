// ── fable32 (build 38) ── E3, the chain bar (svivat-avoda-he.md §6 — the owner, 23.10 10:39: "פס שרשרת כן") and the help at narrow
// openings ("עזרה בפתחים כן", §11.6): the morning's order as the engine has it, his links, what is done, the morning's now; the line when
// his link ends; the waits that exist (the gate before the slaughter, the five lamps before the blood, the shochet before the zorek) and
// a waiting kohen's sign; information only; the old station bar's laver slot gone; the stick's heading bent into a door, never a walk of
// its own; GAME_BUILD 38; a Divine-Name scan of the changed files by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAIN38, WAIT38, CH38 } from '../src/avodah/shift/day33.js';
import { DOOR38, assist38, HOUSE22 } from '../src/avodah/day/world22.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import '../src/avodah/shift/focus17.js';
import { rig, FLAGS, seeded } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const twin = () => { const T = { held: false, held19: () => T.held, stick: () => ({ on: false }), pace: { k: 0 } }; return T; };
const SAVE = () => ({ served30: 2, roles23: { m: 2, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22']], kiyor: { n: 2, best: 100, last: 100 }, deshen: { n: 1, best: 100, last: 100 }, m22: { n: 1, best: 90, last: 90 } }, roles26: { m: 2, h: [[1, 'menorah'], [2, 'inner']] }, day33state: { day: 2, night: true, at: Date.now() } });
const ids = (c) => c.links.map((x) => x.id);
const link = (c, id) => c.links.find((x) => x.id === id);

// ───────── A. the chain bar ─────────
test('build 38 (A): the chain — the morning\'s order as the engine has it (personal, shared, watched), each wait with its source (טיוטה), the lines המחשה', () => {
  assert.deepEqual(CHAIN38.map((x) => x.id), ['kiyor', 'lot1', 'deshen', 'm22', 'lamb', 'lot2', 'gate', 'menorah', 'inner', 'shochet', 'zorek', 'close']);
  assert.deepEqual([...new Set(CHAIN38.map((x) => x.kind))].sort(), ['lot1', 'lot2', 'own', 'shared', 'watch']);
  assert.equal(WAIT38.shochet.on, 'gate'); assert.match(WAIT38.shochet.src, /תמיד ג, ז · טיוטה$/);
  assert.equal(WAIT38.zorek.on, 'menorah'); assert.match(WAIT38.zorek.src, /יומא לג ע״א · טיוטה$/); assert.match(WAIT38.zorek.src2, /תמיד ד, א · טיוטה$/);
  assert.equal(CH38.src, 'המחשה'); assert.equal(`${CH38.done} · ${CH38.now}`, 'שלך הושלם · עכשיו');
  // no pressure: no clock, no "late", nothing lost
  const words = [read('src/avodah/shift/chain38.js'), JSON.stringify(CHAIN38), JSON.stringify(WAIT38), JSON.stringify(CH38)].join(' ');
  assert.ok(!/איחור|מאחר|מהר|זמן|שעון|הפסד|נכשל/.test(words), 'no pressure words');
});
test('build 38 (A): through a morning — his links ringed, the done ticked, the now lit; "שלך הושלם · עכשיו: ‹הבא›" when his link ends; the waiting kohen\'s sign; the old bar\'s laver slot gone', async () => {
  const R = rig(FLAGS, { save: SAVE(), twin: twin() }); R.E.start(); await R.step(0.5);
  let c = R.E.chain38();
  assert.equal(c.now, 'kiyor'); assert.equal(link(c, 'kiyor').his, true); assert.equal(c.msg, null);
  assert.deepEqual(R.E.bar17(), [], 'the station bar: no laver slot (the chain replaces it)'); assert.ok(R.E.focus17().chain && R.E.focus17().chain.links.length === CHAIN38.length);
  R.E.debug.wash20(); await R.step(0.3); c = R.E.chain38();
  assert.equal(link(c, 'kiyor').done, true); assert.equal(c.now, 'lot1'); assert.equal(c.msg.text, 'שלך הושלם · עכשיו: הפיס'); assert.equal(c.msg.src, 'המחשה');
  assert.ok(R.ev('c38').some((e) => e.id === 'kiyor' && e.next === 'lot1'));
  await R.step(CH38.msgS + 0.2); assert.equal(R.E.chain38().msg, null, 'the line goes');
  // the lot: his pyre; its end — the other two roles the court's, done with it; next the second lot
  R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.st33.r30day = [...R.E.st33.r30day, ['m22', 'mehudar']]; await R.step(0.3); c = R.E.chain38();
  assert.equal(link(c, 'm22').his, true); assert.ok(['deshen', 'm22', 'lamb'].every((x) => link(c, x).done)); assert.equal(c.now, 'lot2'); assert.equal(c.msg.text, 'שלך הושלם · עכשיו: הפיס השני');
  // the second lot: his menorah; he opens the gate — the shochet who waited for it signs
  R.E.debug.skip26('menorah'); await R.step(0.2); c = R.E.chain38();
  assert.equal(link(c, 'menorah').his, true); assert.equal(link(c, 'shochet').wait, true, 'the slaughter waits for the gate'); assert.equal(link(c, 'zorek').wait, true, 'the blood waits for the five lamps');
  const st = R.E.st33; st.g26day = st.day; st.g26t = st.t; st.men5t = null; await R.step(0.2); c = R.E.chain38();
  assert.equal(link(c, 'gate').done, true); assert.equal(link(c, 'shochet').sign, true, 'the shochet signs'); assert.equal(link(c, 'shochet').wait, false);
  // his five lamps: the zorek who waited signs; the line with the five lamps' source
  st.r30day = [...st.r30day, ['menorah', 'kasher']]; st.men5t = st.t; await R.step(0.2); c = R.E.chain38();
  assert.equal(link(c, 'menorah').done, true); assert.equal(link(c, 'zorek').sign, true); assert.match(c.msg.text, /^שלך הושלם · עכשיו: /); assert.equal(c.msg.src, WAIT38.zorek.src);
  // the court's blood after the five lamps (heichal26's moment), then the close
  await R.step(14); c = R.E.chain38(); assert.equal(link(c, 'shochet').done, true); assert.equal(link(c, 'zorek').done, true); assert.equal(c.now, 'close');
});
test('build 38 (A): his link the zorek — the slaughter is the court\'s and done when he receives; nothing in a practice run', async () => {
  const R = rig(FLAGS, { save: SAVE(), twin: twin() }); R.E.start(); await R.step(0.3);
  R.E.debug.wash20(); R.E.debug.skip23('deshen'); R.E.debug.skip21(); R.E.st33.r30day = [['kiyor', 'mehudar'], ['deshen', 'kasher']]; R.E.debug.skip26('zorek'); await R.step(0.3);
  const c = R.E.chain38(); assert.equal(link(c, 'zorek').his, true); assert.equal(link(c, 'menorah').his, false); assert.equal(link(c, 'shochet').done, false);
  const P = rig(FLAGS, { save: practiceSave31(SAVE()), practice: { role: 'menorah', day: 3, fed: 44, seed: 7 }, rng: seeded(3) }); P.E.start(); await P.step(0.5);
  assert.equal(P.E.chain38(), null, 'a practice run: no chain');
});
test('build 38 (A): the bar\'s page — a small line under the top bar, RTL, no tap (pointer-events none), dots for far links on a narrow screen or in an act, the line after the act\'s own word; hidden at the close and in the lamb chamber', () => {
  const s = read('src/avodah/shift/chain38.js');
  assert.match(s, /\.c38\{position:fixed;left:50%;top:calc\(env\(safe-area-inset-top,0px\) \+ 54px\)[^}]*direction:rtl;pointer-events:none/);
  assert.match(s, /innerWidth\) <= 700 \|\| !!acting/); assert.match(s, /Math\.abs\(i - \(ni < 0 \? c\.links\.length - 1 : ni\)\) > 1/);
  assert.match(s, /body\.f35-closing \.c38,body\.ch33-on \.c38\{display:none!important\}/);
  assert.match(s, /aria-label', 'סדר הבוקר'/);
  const f = read('src/avodah/shift/focus17.js'); assert.match(f, /chain38\.draw\(live && !F\.summary \? F\.chain : null, !!\(E\.act30 && E\.act30\(\)\)\)/);
  const d = read('src/avodah/shift/day33.js'); assert.match(d, /after = st\.end30 && st\.end30\.until > t \? st\.end30\.until : t/);
  assert.match(d, /if \(st\.c38 && st\.c38\.day === st\.day && st\.c38\.msg && st\.t < st\.c38\.msg\.t \+ CH38\.msgS\) return;/, 'the close waits for his last link\'s line');
  assert.match(d, /for \(const id of Object\.keys\(S\.his\)\) if \(S\.done\[id\]\) C\.his\[id\] = 1;/, 'a resumed morning: no line for what was done');
  assert.match(s, /\.c38\.msgon \.row\{display:none\}/); assert.match(s, /querySelector\('\.r30\.on:not\(\.sr\):not\(\.sl\)'\)/, 'below the act\'s source line');
});

test('build 38 (A): the day\'s summary shows the morning\'s chain with his links (svivat-avoda §8)', async () => {
  const R = rig(FLAGS, { save: SAVE(), twin: twin() }); R.E.start(); await R.step(0.3);
  R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.skip26('inner'); R.E.st33.r30day = [['kiyor', 'mehudar'], ['m22', 'kasher'], ['inner', 'mehudar']];
  R.E.debug.night(); for (let i = 0; i < 40 && !R.E.state().summary; i++) await R.step(0.2);
  const s = R.E.focus17().summary || R.ev('summary').at(-1);
  assert.ok(s && Array.isArray(s.chain), 'the summary\'s chain'); assert.deepEqual(s.chain.filter((x) => x.his).map((x) => x.id), ['kiyor', 'm22', 'inner']);
  assert.ok(!s.chain.some((x) => x.id === 'close'));
  assert.match(read('src/avodah/shift/focus17.js'), /<small>החוליות שלך — מוזהבות · המחשה<\/small>/);
});

// ───────── B. the help at narrow openings ─────────
test('build 38 (B): the door help — the stick toward the Heichal\'s gate beside its span is bent into it (the speed kept); never away, never with no stick, never with the gate shut, not when in line', () => {
  assert.deepEqual({ ...DOOR38 }, { k: 0.75, cone: 40, reach: 7, side: 5, inset: 1 });
  const on = HOUSE22.on, g = HOUSE22.gate;
  try {
    HOUSE22.on = true; HOUSE22.gate = true;
    const a = assist38(-86.8, -6.6, -6, 0);   // (where the naive kid stood, pushing west)
    assert.ok(a && a[0] < 0 && a[1] > 0, 'bent toward the opening'); assert.ok(Math.abs(Math.hypot(a[0], a[1]) - 6) < 1e-9, 'the stick\'s speed');
    assert.equal(assist38(-86.8, -6.6, 6, 0), null, 'walking away: none'); assert.equal(assist38(-86.8, -6.6, 0, 0), null, 'no stick: none');
    assert.equal(assist38(-86.8, -2, -6, 0), null, 'in line with the opening: none'); assert.equal(assist38(-86.8, -6.6, -4, 4.5), null, 'outside the cone');
    assert.equal(assist38(-70, -6.6, -6, 0), null, 'too far from the gate (and in line with the Ulam\'s door)');
    const u = assist38(-74, 12, -6, 0); assert.ok(u && u[1] < 0, 'the Ulam\'s door from its steps');
    const o = assist38(-105, 7, 6, 0); assert.ok(o && o[1] < 0, 'the gate\'s inner mouth, from the Heichal out');
    HOUSE22.gate = false; assert.equal(assist38(-86.8, -6.6, -6, 0), null, 'the gate shut: none');
    HOUSE22.on = false; assert.equal(assist38(-74, 12, -6, 0), null, 'the House shut: none');
  } finally { HOUSE22.on = on; HOUSE22.gate = g; }
  const t = read('src/game/twin.js'); assert.match(t, /if \(typeof T\.assist38 === 'function'\) \{ try \{ const a = T\.assist38\(hp\.x, hp\.z, dvx, dvz\);/);
  const d = read('src/avodah/shift/day33.js'); assert.match(d, /if \(p26 && T\) T\.assist38 = assist38;/); assert.match(d, /if \(T && T\.assist38 === assist38\) T\.assist38 = null;/);
});
test('build 38: GAME_BUILD 38; no Divine Name in the changed files (by code points); the pilgrims\' word', () => {
  assert.equal(GAME_BUILD, 38);
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/chain38.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/focus17.js', 'src/avodah/day/world22.js', 'src/game/twin.js', 'src/avodah/shift/lobby35.js', 'test/build38.test.mjs', 'test/build35.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  const bad = String.fromCharCode(0x5e6, 0x5dc, 0x5d9, 0x5d9, 0x5e0);
  for (const f of files.filter((f) => f.startsWith('src/'))) assert.ok(!read(f).includes(bad), f);
});
