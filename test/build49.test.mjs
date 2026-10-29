// ── fable32 (build 49) ── stage 06, שער ניקנור וט״ו המעלות, the new way (docs/specs/shlav-alef-v2-he.md §11 the voyage, §10 "06", §2 the
// lever & wedge, §3 the steps tuned by ear): taps alone never finish the storm, the lever or a step; the replay-not-fail rule (a wave that beats
// him replays that wave — never a failure); the player figure is NOT a kohen in the voyage (Nicanor, the owner's exception) and is the kohen
// after; the doors stay bronze ("מפני שנעשו בהן נסים"); the wiring; the yard; build 48's duplicate 'corner' key undone; GAME_BUILD 49.
// Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import * as F from '../src/game/fam42.js';
import { PARTS49, LINE42, SRC49, FIND49, YARD44 } from '../src/game/har42.js';
import { createVoyage49, NICANOR49, VLINE49, VOY49, Y49 } from '../src/game/voyage49.js';
import { STAGE_GAMES } from '../src/games/index.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
/** a good pair of thumbs: the left answers the push (and the heel), the right holds */
const good = (S, g = 1) => { const s = S.state(); S.balance(Math.max(-1, Math.min(1, -s.p * g - s.h * 0.5))); S.holdOn(true); };

test('build 49: TAPS ALONE NEVER FINISH the storm, the lever or a step', () => {
  for (const L of [1, 2, 3, 4]) {   // the storm: the right thumb only tapped (0.1 s on, 0.4 s off), the left tapped in place — five minutes
    const S = F.createStorm49(L); let t = 0;
    for (let i = 0; i < 3000; i++) { const k = i % 5; S.holdOn(k === 0); S.balance(0); S.step(0.1); t += 0.1; }
    assert.equal(S.state().done, false, `storm L${L}: taps never calm the sea`); assert.ok(S.state().replays > 10, `storm L${L}: waves replayed (${S.state().replays})`);
  }
  for (const L of [1, 4]) { const J = F.createLever49(L); for (let k = 0; k < 100; k++) { assert.equal(J.pump(k % F.DRAG42, 400), 'tap'); assert.equal(J.wedge(), 'no', 'a wedge only at the top of a long drag'); J.step(0.1); } assert.equal(J.state().notch, 0); assert.equal(J.state().done, false); }
  for (const L of [1, 4]) { const J = F.createSteps49(L); for (let k = 0; k < 100; k++) assert.equal(J.drop({ dragPx: k % F.DRAG42, err: 0 }), 'tap'); assert.equal(J.state().i, 0); assert.equal(J.state().done, false); }
  const J = F.createLever49(1); assert.equal(J.pump(0.1 * 400, 400), 'short', 'a short drag lifts nothing'); assert.equal(J.pump(0.3 * 400, 400), 'up'); assert.equal(J.wedge(), 'ok'); assert.equal(J.state().notch, 1);
});

test('build 49: NO FAILURE — a wave that beats him (the heel, the ropes let go, the door not held in the hug) REPLAYS THAT WAVE; then good thumbs calm the sea', () => {
  const S = F.createStorm49(1);
  for (let i = 0; i < 200 && !S.state().replays; i++) { S.balance(0); S.holdOn(true); S.step(0.05); }   // (no balance: the first wave heels him over)
  let s = S.state(); assert.equal(s.replays, 1); assert.equal(s.why, 'heel'); assert.equal(s.i, 0, 'the same wave again'); assert.equal(s.ph, 'tele'); assert.equal(s.h, 0); assert.ok(!('failed' in s));
  const R2 = F.createStorm49(1); for (let i = 0; i < 400 && !R2.state().replays; i++) { const q = R2.state(); R2.balance(-q.p - q.h * 0.5); R2.holdOn(false); R2.step(0.05); }
  assert.equal(R2.state().why, 'ropes', 'the ropes let go too long: that wave again'); assert.equal(R2.state().i, 0);
  for (let i = 0; i < 4000 && !S.state().done; i++) { good(S); if (S.state().hug && S.state().ph === 'push' && !S.hugTried) { S.hugTried = 1; for (let k = 0; k < 20; k++) { const q = S.state(); S.balance(-q.p - q.h * 0.5); S.holdOn(false); S.step(0.05); } } else S.step(0.05); }
  s = S.state(); assert.equal(s.done, true, 'calmed'); assert.ok(s.thrown, 'the sailors threw the first door — a scene, never his fault');
  assert.ok(s.replays >= 2, `replays counted (${s.replays}) — the hug's too`); assert.ok(['kasher', 'tikkun'].includes(S.result().rating));
  const M = F.createStorm49(2); for (let i = 0; i < 4000 && !M.state().done; i++) { good(M); M.step(0.05); } assert.equal(M.result().rating, 'mehudar', 'never past the line: מהודר');
});

test('build 49: THE PLAYER IS NICANOR in the voyage — not a kohen (the kohen hidden; a figure in travelling clothes); the kohen returns after', async () => {
  const scene = new THREE.Scene(); scene.add(new THREE.AmbientLight()); const heroMesh = new THREE.Group(); heroMesh.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))); scene.add(heroMesh);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(10)); sky.name = 'sky'; scene.add(sky);
  const shows = [], lines = [], cams = [], emits = []; let done = null;
  const hero = { show: (v) => { shows.push(v); heroMesh.visible = v; } };
  const job = createVoyage49({ scene, doc: null, camTo: (p, t) => cams.push([p, t]), line: (t) => lines.push(t), root: null, W: () => 844, H: () => 390, buzz: () => {}, sound: () => {}, emit: (t, d) => emits.push([t, d && d.s]), timeOfDay: () => {}, stages: { hero }, L: 1, seen: false, done: (r) => { done = r; } });
  assert.deepEqual(shows, [false], 'the kohen hidden as the voyage begins'); assert.equal(heroMesh.visible, false); assert.equal(sky.visible, true, 'the sky kept');
  assert.ok(job.nic && job.nic.parent, 'Nicanor stands on the ship'); assert.notEqual(NICANOR49.tunic.toUpperCase(), '#FFFFFF'); assert.ok(!/^#F[0-9A-F]F[0-9A-F]F/i.test(NICANOR49.tunic), 'no white linen'); assert.ok(NICANOR49.cloak && NICANOR49.beard, 'a cloak and a beard: a wealthy Alexandrian');
  assert.match(VLINE49.intro, /הסיפור של הדלתות — הפעם אתם ניקנור/); assert.deepEqual([...VOY49], ['harbour', 'sea', 'storm', 'hug', 'acre', 'road']); assert.ok(Y49 >= 300);
  // the storm in the node: two thumbs on the job's touches (T) — the left slides, the right holds
  job.go('storm'); const S = job.storm(); let steps = 0;
  while (!['acre', 'road'].includes(job.scene()) && steps++ < 20000) { const s = S.state(); job.T.left = { x: 844 * 0.18 + Math.max(-1, Math.min(1, -s.p - s.h * 0.5)) * 844 * 0.16, x0: 844 * 0.18, y: 240, y0: 240, still: 0 }; job.T.right = { x: 700, x0: 700, y: 240, y0: 240, still: 0 }; job.frame(0.05); }
  assert.equal(job.scene(), 'acre', 'calmed — on to Acre'); assert.ok(lines.some((l) => l === VLINE49.calm)); assert.ok(lines.some((l) => l === VLINE49.thrown));
  job.T.left = null; job.T.right = null; job.T.one = { x: 400, x0: 400, y: 200, y0: 200, still: 0 };
  while (!done && steps++ < 40000) job.frame(0.05);
  assert.ok(done && done.q != null && done.rating, 'graded by the storm'); assert.equal(done.skipped, false);
  assert.equal(shows[shows.length - 1], true, 'the kohen returns'); assert.equal(heroMesh.visible, true); assert.equal(scene.getObjectByName('voyage49'), undefined, 'the sea gone');
  assert.ok(cams.every(([p]) => p[1] > Y49 - 20), 'the voyage\'s cameras over its own sea');
  assert.deepEqual(emits.filter((e) => e[0] === 'h49scene').map((e) => e[1]), ['harbour', 'storm', 'hug', 'acre', 'road'], 'each scene announced (the harbour, then the jump to the storm)');
  // seen once: a skip
  const j2 = createVoyage49({ scene, doc: null, camTo: () => {}, line: () => {}, root: null, W: () => 844, H: () => 390, buzz: () => {}, stages: { hero }, L: 1, seen: true, done: (r) => { done = r; } });
  j2.V.skipped = true; assert.equal(j2.frame(0.05), true); assert.equal(done.skipped, true); assert.equal(heroMesh.visible, true);
});

test('build 49: the stage — its parts, the doors left bronze ("מפני שנעשו בהן נסים"), the steps (מדות ב, ה), the wiring, the yard, the find, GAME_BUILD 49', () => {
  assert.deepEqual([...PARTS49], ['open', 'voyage', 'lever', 'hang', 'steps', 'reveal']);
  assert.match(LINE42.ungilded, /"מפני שנעשו בהן נסים" · יומא לח ע"א; מדות ב, ג · טיוטה/); assert.match(LINE42.steps, /"מקפות כחצי גרן עגלה" — מדות ב, ה · טיוטה/); assert.match(LINE42.levites, /מדות ב, ה · טיוטה/);
  assert.ok(SRC49.some((x) => /הטילוני עמה/.test(x) && /יומא לח ע"א · טיוטה/.test(x)) && SRC49.some((x) => /לא היו טרוטות/.test(x) && /מדות ב, ה/.test(x)));
  assert.match(VLINE49.storm, /"עמד עליו נחשול שבים לטבעו" — יומא לח ע"א · טיוטה/); assert.match(VLINE49.thrown, /"נטלו אחת מהן והטילוה לים"/); assert.match(VLINE49.calm, /"הטילוני עמה" — ומיד נח הים מזעפו/); assert.match(VLINE49.acre, /"מבצבצת ויוצאה מתחת דופני הספינה" — יומא לח ע"א/);
  assert.match(FIND49, /גלוסקמת ניקנור \(הר הצופים, 1902\)/);
  for (const [k, v] of Object.entries(VLINE49)) { const head = v.split(' · ')[0]; assert.ok(head.length <= 50, `${k}: ${head}`); assert.match(v, /טיוטה|המחשה|יומא/, k); }
  assert.ok(!STAGE_GAMES.nikanor.includes('levites'), 'the Levites\' song is the stage\'s own steps now: the old board off the stage\'s list');
  assert.deepEqual(YARD44.slice(16, 18).map((v) => v.part), ['lever', 'step']);   // (build 50: then stage 07's)
  const c = F.MAT42.cost; assert.equal(c.voyage, 0, 'the voyage costs nothing'); assert.ok(c.lever > 0 && c.leaf49 > 0 && c.steps > 0);
  const h = read('src/game/har42.js');
  assert.match(h, /o\.stage === 'nikanor' \? 'nikanor' : o\.stage === 'lishka' \? 'lishka' : 'har';/);   // (build 50: and stage 07's) assert.match(h, /STG === 'nikanor' \? PARTS49 :/);
  for (const k of ['voyage', 'lever', 'hang', 'steps']) assert.match(h, new RegExp(`\\n    ${k}: \\{ begin\\(\\) \\{ st\\.job = mk`), k);
  for (const line of [h, read('src/game/voyage49.js'), read('src/game/fam42.js')].join('\n').split('\n')) { const c = line.indexOf('//'); if (c < 0 || /https?:|'[^']*\/\/|`[^`]*\/\//.test(line)) continue; assert.ok(!/\b(target|frame|view|begin|end|down|up|move): \(/.test(line.slice(c)), `code after a comment: ${line.slice(c, c + 120)}`); }   // (four times this build a // swallowed code on its line)
  assert.match(h, /if \(J\.camK\) \{ if \(J\.frame\(dt\)\) endPart\(\); return; \}/, 'the voyage\'s own camera');
  assert.match(h, /stages\.setStage\('nikanor', 'done', 1, \{ instant: true \}\); \} catch \(e\) \{ \/\* \*\/ \} if \(qs\('h49voy'\) === '1' && R\.part <= PARTS49\.indexOf\('voyage'\)\) \{ R\.part = PARTS49\.indexOf\('voyage'\); R\.open = Math\.max\(1, R\.open \| 0\); st\.voyNow = 1; \} \}/, 'the gatehouse standing; ?h49voy=1 straight into the voyage (code, not a comment)');
  assert.match(h, /if \(STG === 'nikanor'\) \{ hole49\(null\); try \{ stages\.hero\.show\(true\);/, 'the reveal: the model\'s own doors and steps');
  assert.match(h, /\n    corner: \{ begin\(\) \{ st\.job = STG === 'nashim' && MODE === 'stage' \? mkCorner48\(\) : mkCorner\(\); \} \},/); assert.equal((h.match(/\n    corner: \{ begin\(\)/g) || []).length, 1, 'one corner part (build 48 had two keys: stage 01\'s crowbar was overridden)');
  const g = read('src/game/index.js'); assert.match(g, /else if \(wanted49\(\)\) startHar49\(\);/); assert.match(g, /\(nikanor49=0\|stick=1\|har42=0\)/); assert.match(g, /h49\(go\|voy\)=1/); assert.match(g, /if \(done && wanted49\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar49\(\); \}, 400\);/); assert.match(g, /restoreTime: \(\) => \{ tod = null;/);
  assert.equal(GAME_BUILD, 55);   // (build 50: the constant moved on) (build 51: again)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], Pp = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/voyage49.js', 'src/game/index.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(Pp), `${f}: עולי רגל`); }
});
