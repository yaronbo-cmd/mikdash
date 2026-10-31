// ── fable32 (build 48) ── stage 05, עזרת הנשים, the new way (docs/specs/shlav-alef-v2-he.md §10 "05", §4.2 the wood, §4.4 the shuffle-bag and
// the defects' book, §5 the beam into its socket, the order, tenon and peg): taps alone never finish a log, a beam or a peg; the shuffle-bag
// rule (every type once before a repeat, never twice in a row, across refills); the log's verdicts (a waste כשר, a bad log טעון תיקון); the
// order rule (the corner beams first — blocked otherwise, free); the push's angle; the peg's lock and split; the chambers without roofs; no
// "שמונה אבוקות" by the women's court; the wiring; the yard and the book; GAME_BUILD 48. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS48, LINE42, SRC48, YARD44 } from '../src/game/har42.js';
import { STAGE_GAMES } from '../src/games/index.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const seeded = (s) => { let a = s * 9301 + 49297; return () => ((a = (a * 9301 + 49297) % 233280) / 233280); };

test('build 48: TAPS ALONE NEVER FINISH a log, a beam or a peg — a hundred taps of each', () => {
  for (const t of F.WOOD48_TYPES) { const J = F.createLog48(t, seeded(3)); for (let k = 0; k < 100; k++) { J.mark(k / 100, 0.5); assert.equal(J.decide(k % 2 === 0, k % 23), 'tap'); assert.equal(J.peel(k % 23), 'tap'); } assert.equal(J.state().decided, null, t); }
  const G = F.createGallery48(1); for (let k = 0; k < 100; k++) { assert.equal(G.place(k % 5, k % 2 ? 'corner' : 'next', { dragPx: k % 23 }), 'tap'); G.push(k % 5, 3, 5, 0, -1); } assert.equal(G.state().done, false); assert.ok(G.state().set.every((x) => x === null));
  const P = F.createPeg48(1, seeded(4)); for (let k = 0; k < 100; k++) { assert.equal(P.tap(), 'wait', 'no tenon yet: the mallet does nothing'); P.tenon(k % 7, k % 9, 1, 0); P.step(0.2); } assert.equal(P.state().done, false); assert.equal(P.state().tenon, false);
});

test('build 48: the shuffle-bag — every type once before any repeats; never the same type twice in a row (across refills, from a saved bag too)', () => {
  for (let seed = 1; seed < 40; seed++) {
    const B = F.createBag48(null, seeded(seed)), seq = Array.from({ length: 50 }, () => B.draw()), n = F.WOOD48_TYPES.length;
    for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i], seq[i - 1], `seed ${seed}: ${seq[i]} twice in a row at ${i}`);
    for (let r = 0; r + n <= seq.length; r += n) assert.equal(new Set(seq.slice(r, r + n)).size, n, `seed ${seed}: round ${r / n} has every type once`);
    const C = F.createBag48(JSON.parse(JSON.stringify(B.state())), seeded(seed + 100)), nx = C.draw(); assert.notEqual(nx, seq[seq.length - 1], 'a saved bag: never the last one again');
  }
  assert.deepEqual(F.WOOD48_TYPES, ['holes', 'gallery', 'olive', 'vine', 'fig', 'walnut', 'shemen', 'knot', 'scar', 'drop']);
  for (const t of F.WOOD48_TYPES) assert.match(F.WOOD48[t].why, /טיוטה|המחשה/, t);
});

test('build 48: the log — the holes on one face only (turn to see them); the gallery only once that face is peeled; droppings wiped; a waste כשר, a bad log to the altar טעון תיקון', () => {
  const J = F.createLog48('holes', seeded(9)), f = J.state().at.face; while (J.state().face !== f) { assert.equal(J.visible(), false); J.turn(1); } assert.equal(J.visible(), true);
  const G = F.createLog48('gallery', seeded(5)), gf = G.state().at.face; while (G.state().face !== gf) G.turn(1); assert.equal(G.visible(), false, 'under the bark: not yet'); G.peel(60); assert.equal(G.visible(), true, 'peeled: the worms\' galleries');
  const D = F.createLog48('drop', seeded(6)), df = D.state().at.face; while (D.state().face !== df) D.turn(1); assert.equal(D.visible(), true); D.peel(40); assert.equal(D.visible(), false, 'wiped');
  assert.equal(F.createLog48('olive', seeded(1)).decide(true, 60), 'bad'); assert.equal(F.createLog48('fig', seeded(1)).decide(false, 60), 'waste'); assert.equal(F.createLog48('knot', seeded(1)).decide(true, 60), 'ok'); assert.equal(F.createLog48('vine', seeded(1)).decide(false, 60), 'ok');
  assert.equal(F.woodGrade48(['ok', 'ok']), 1); assert.equal(F.woodGrade48(['ok', 'waste']), 0.65); assert.equal(F.woodGrade48(['waste', 'bad']), 0.3);
  assert.equal(F.WOOD48.olive.bad && F.WOOD48.vine.bad, true); assert.equal(F.WOOD48.fig.bad || F.WOOD48.walnut.bad || F.WOOD48.shemen.bad, false, 'תמיד ב, ג: the usual woods');
});

test('build 48: the order rule — the corner beams first, else blocked (counted, free); the push\'s angle: straight it locks, crooked it stops at the rim; the peg locks and splits', () => {
  const G = F.createGallery48(1); assert.equal(G.place(2, 'next', { dragPx: 40 }), 'blocked'); assert.equal(G.state().order, 1); assert.equal(G.state().set[2], null, 'nothing went in: free');
  assert.equal(G.place(0, 'next', { dragPx: 40 }), 'wrong'); assert.equal(G.place(0, 'corner', { dragPx: 40 }), 'ok'); assert.equal(G.push(0, 30, -40, 0, -1), 'rim'); assert.equal(G.push(0, 2, -40, 0, -1), 'lock');
  assert.equal(G.place(4, 'corner', { dragPx: 40 }), 'ok'); G.push(4, 0, -40, 0, -1); assert.equal(G.cornersIn(), true);
  for (const i of [1, 2, 3]) { assert.equal(G.place(i, 'next', { dragPx: 40 }), 'ok'); G.push(i, 0, -40, 0, -1); }
  assert.equal(G.state().done, true); assert.equal(G.result().rating, 'tikkun', 'three mistakes (the order, the wrong beam, the rim)');
  const H = F.createGallery48(2); for (const i of [0, 4, 1, 2, 3]) { H.place(i, i === 0 || i === 4 ? 'corner' : 'next', { dragPx: 40 }); H.push(i, 0, -40, 0, -1); } assert.equal(H.result().rating, 'mehudar');
  const P = F.createPeg48(1, seeded(2)); assert.equal(P.tenon(40, 30, 1, 0), 'rim'); assert.equal(P.tenon(50, 3, 1, 0), 'in'); let r, n = 0; do { r = P.tap(); n++; } while (r !== 'lock' && n < 20); assert.equal(r, 'lock'); assert.ok(n >= 4, 'several taps: it goes in a little each'); assert.ok(P.pitch() > 600, 'the pitch rose');
  { const Q = F.createPeg48(1, seeded(8)); Q.tenon(50, 0, 1, 0); for (let n2 = 0; n2 < 2; n2++) { while (Q.tap() !== 'lock'); assert.equal(Q.tap(), 'split'); } while (Q.tap() !== 'lock'); assert.equal(Q.state().done, true, 'after two splits the third peg holds as it locks'); assert.equal(Q.tap(), 'done'); assert.equal(Q.result().rating, 'kasher'); }
  assert.equal(P.tap(), 'split', 'a tap after the lock: the peg splits — a new one, free'); assert.equal(P.state().depth, 0); do { r = P.tap(); } while (r !== 'lock'); for (let i = 0; i < 30; i++) P.step(0.05); assert.equal(P.state().done, true); assert.equal(P.result().rating, 'kasher');
});

test('build 48: the stage — its parts and lines, the chambers WITHOUT roofs (מדות ב, ה), no "שמונה אבוקות" by the women\'s court, the wiring, the yard and the book, GAME_BUILD 48', () => {
  assert.deepEqual([...PARTS48], ['open', 'wood', 'beams', 'pegs', 'corner', 'walk', 'reveal']);
  assert.match(LINE42.walk48, /שיהו הנשים רואות מלמעלן" — מדות ב, ה · טיוטה/); assert.match(LINE42.beams, /מדות ב, ה · טיוטה/);
  assert.ok(SRC48.some((x) => /ולא היו מקורות — מדות ב, ה/.test(x)) && SRC48.some((x) => /תמיד ב, ג/.test(x)));
  // the corner chambers: walls and copings only — no box over a chamber's inside at its top (temple.js, the set 'nashim' / 'nashim-lc')
  const t = read('src/temple.js'), blk = t.slice(t.indexOf("S('nashim');"), t.indexOf("S('lishka');"));
  const boxes = [...blk.matchAll(/box\('(\w+)',\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)/g)].map((m) => m.slice(1).map((v, i) => (i ? +v : v)));
  for (const [a, b, c, d] of [[103, -67.5, 141, -29.5], [103, 29.5, 141, 67.5], [6, -67.5, 44, -29.5], [6, 29.5, 44, 67.5]]) {
    const roof = boxes.find(([, x0, y0, z0, x1, y1, z1]) => y0 >= 13 && Math.min(x1, c) - Math.max(x0, a) > 8 && Math.min(z1, d) - Math.max(z0, b) > 8);
    assert.equal(roof, undefined, `a chamber at ${a}…${c}: no roof ("וְלֹא הָיוּ מְקוֹרוֹת")`);
  }
  assert.ok(!STAGE_GAMES.nashim.includes('torches') && !STAGE_GAMES.nikanor.includes('torches'), 'no שמחת בית השואבה by the women\'s court');
  const h = read('src/game/har42.js'); assert.ok(!/שמחת בית השואבה|שואבה/.test(h.slice(h.indexOf('function mkWood'), h.indexOf('/* ── build 47 ── stage 04\'s acts'))), 'no glimpse in stage 05\'s acts');
  for (const k of ['wood', 'beams', 'pegs', 'walk']) assert.match(h, new RegExp(`\\n    ${k}: \\{ begin\\(\\) \\{ st\\.job = mk`), k); assert.match(h, /\n    corner: \{ begin\(\) \{ st\.job = STG === 'nashim' && MODE === 'stage' \? mkCorner48\(\) : mkCorner\(\); \} \},/);   // (build 49: one 'corner' key — stage 05's by its STG)
  assert.match(h, /const r = J\.push\(cur, a\.x - a\.x0, a\.y - a\.y0, 0, -1\);/, 'into the wall: up the screen (K48-P2: from below the beam\'s own way in ran down)'); assert.ok(!/DEBUG48|dbg48/.test(h));
  assert.match(h, /function book48\(back\)/); assert.match(h, /data-b="book">📖 ספר הפגימות/); assert.match(h, /R\.logSeq\.push\(t\)/);
  assert.deepEqual(YARD44.slice(13, 16).map((v) => v.part), ['log', 'beam', 'peg']);   // (build 49: then stage 06's)
  const cost = F.MAT42.cost; assert.ok(cost.wood + cost.beams + cost.pegs + cost.corner48 > F.MAT42.daily, 'beyond a morning');
  const g = read('src/game/index.js'); assert.match(g, /else if \(wanted48\(\)\) startHar48\(\);/); assert.match(g, /\(nashim48=0\|stick=1\|har42=0\)/); assert.match(g, /h48go=1/); assert.match(g, /if \(done && wanted48\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar48\(\); \}, 400\);/);
  assert.equal(GAME_BUILD, 62);   // (build 49: the constant moved on) (build 50: again) (build 51: again)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], Pp = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(Pp), `${f}: עולי רגל`); }
});
