// ── fable32 (build 37) ── "ליטוש בנייה 36": the wick's swipe in any clear direction and its hand the first time; the laver's second
// spigot removed (the owner, 23.10 06:49 "להוריד הדד") with its 40 perutot back once; the balance acts and the lamb retuned with the
// tools' one balance hand (hand37) and the eye model (miss37); GAME_BUILD 37; a Divine-Name scan of the changed files by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { C18, K20, P26, SWIPE36, refund37, K2R37 } from '../src/avodah/shift/day33.js';
import { LVL36, ROLES36, par36 } from '../src/avodah/shift/lvl36.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import '../src/avodah/shift/focus17.js';
import { rig, FLAGS, upTo, seeded } from './rig33.mjs';
import { hand37, look37, miss37, EYE37, run1 } from '../tools/lvl36sim.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const SAVE = () => ({ served30: 5, roles23: { m: 6, h: [], kiyor: { n: 6, best: 100, last: 75 }, deshen: { n: 2, best: 100, last: 100 }, lamb: { n: 2, best: 100, last: 45 }, menorah: { n: 2, best: 90, last: 90 }, inner: { n: 1, best: 95, last: 95 } }, roles26: { m: 6, h: [] } });
const practise = (role, L, seed = 11) => rig(FLAGS, { save: practiceSave31(SAVE()), practice: { role, day: 7, fed: 44, seed: 4242 + seed }, rng: seeded(seed), ...(L ? { lv36: L } : {}) });
async function toWick(L = 1) {
  const N = practise('menorah', L); N.E.start(); await N.step(0.6); N.at(P26.gate.x + 2, P26.gate.z); await N.step(0.8);
  N.E.r26swipe(0.5, 0, 100); N.E.r26hold(true); await N.step(P26.key + 0.2); N.E.r26hold(false); await N.step(P26.opn + 0.2); N.at(P26.walkM.x + 1, P26.walkM.z); await N.step(1.2);
  return N;
}

// ───────── (1) the wick ─────────
test('build 37 (1): the wick\'s swipe counts in any clear direction past SWIPE36 (↔ ⬇ ⬆ or slanted, ≥ 0.15 within ≤ 350 ms); short or slow still refused', async () => {
  const N = await toWick();
  assert.equal(N.E.r26().ph, 'wick');
  assert.equal(N.E.r26swipe(0.14, 0.05, 200), false, 'short'); assert.equal(N.ev('r26swipe').at(-1).why, 'short');
  assert.equal(N.E.r26swipe(-0.3, 0, 400), false, 'slow'); assert.equal(N.ev('r26swipe').at(-1).why, 'slow');
  assert.equal(N.E.r26swipe(-SWIPE36.dist, 0.02, SWIPE36.ms), true, 'sideways counts (the naive kid\'s ↔)');
  assert.equal(N.E.r26().ph, 'wipe');
  const M = await toWick(); assert.equal(M.E.r26swipe(0.05, 0.2, 150), true, 'down counts');
  const U = await toWick(); assert.equal(U.E.r26swipe(0.2, -0.2, 150), true, 'slanted counts');
  // the wipe keeps its ↔
  assert.equal(N.E.r26swipe(0, -0.5, 100), false, 'the wipe: still sideways only');
});
test('build 37 (1): the wick\'s hand — shown on the wick until his first wick counts, again after two refused in a row; the verb\'s arrow hidden meanwhile; the pad reads the crossing time in any axis', () => {
  const h = read('src/avodah/shift/heichal26.js');
  assert.match(h, /hand37 = mk\('hk26-w37', '<i>👆<\/i><b>⬆<\/b>'\)/);
  assert.match(h, /const h37 = !!\(live && K && ph === 'wick' && \(!w37\.done \|\| w37\.no >= 2\)\)/);
  assert.match(h, /verb\.style\.visibility = h37 \? 'hidden' : ''/);
  assert.match(h, /w37\.done = true;[^]{0,120}w37\.no = 0;/);
  assert.match(h, /if \(ev\.ph === 'wick'\) w37\.no\+\+;/);
  assert.match(h, /p\.ta = t - p\.t0/); assert.match(h, /E\.r26swipe\(dx \/ WD\(\), dy \/ HT\(\), p\.ta != null \? p\.ta : ms\)/);
  assert.match(h, /\.hk26-w37\{[^}]*\}/); assert.match(h, /@keyframes hk26w37\{/);
  assert.equal(GAME_BUILD, 50);   // (build 38: the constant moved on) (build 39: 39) (build 40: again) (build 41: again) (build 42: again) (build 43: again) (build 44: again) (build 45: again) (build 46: again) (build 47: again) (build 48: again) (build 49: again) (build 50: again)
});

// ───────── (2) the second spigot ─────────
test('build 37 (2): no second spigot — C18.pads without kiyor2, no kiyorK, no K20.hold2; no pad in the court (pads18 empty with E35)', async () => {
  assert.deepEqual(C18.pads.map((p) => p.id), ['axe', 'basket10']); assert.equal(C18.kiyorK, undefined); assert.equal(K20.hold2, undefined);
  const R = rig(FLAGS, { save: { ...SAVE(), perutot: 500 } }); R.E.start(); await R.step(0.3);
  assert.deepEqual(R.E.pads18(), []); assert.deepEqual(R.E.focus17().c18.pads, []);
  assert.ok(!/kiyor2|דד שני/.test(read('src/avodah/shift/lobby35.js')), 'the lobby: no pad');
  assert.ok(!/k && k\.two/.test(read('src/avodah/shift/kiyor20.js')), 'the laver: one stream');
});
test('build 37 (2): a save that owns kiyor2 gets its 40 perutot back once (save.k2r37) and owns it no more; other saves untouched; the laver the same for all', async () => {
  const s = { perutot: 7, day33: { kiyor2: 1, axe: 1 } };
  assert.equal(refund37(s), K2R37); assert.equal(K2R37, 40);
  assert.equal(s.perutot, 47); assert.equal(s.k2r37, 40); assert.deepEqual(s.day33, { axe: 1 });
  s.day33.kiyor2 = 1;   // (a merge that brought it back: never twice)
  assert.equal(refund37(s), 0); assert.equal(s.perutot, 47);
  const t = { perutot: 3, day33: { axe: 1 } }; assert.equal(refund37(t), 0); assert.deepEqual(t, { perutot: 3, day33: { axe: 1 } });
  assert.equal(refund37({}), 0); assert.equal(refund37(null), 0);
  // the engine refunds before it reads the perutot; the laver's hold is everyone's
  const R = rig(upTo('g20'), { save: { day33: { kiyor2: 1 }, perutot: 5 } }); R.E.start(); await R.step(0.3);
  assert.equal(R.E.state().perutot, 45); const k = R.STATIONS.kiyor.stand; R.at(k.x, k.z); await R.step(0.3);
  assert.equal(R.E.k20().T, K20.hold);
  const Q = rig(upTo('g20'), { save: { perutot: 5 } }); Q.E.start(); await Q.step(0.3); Q.at(k.x, k.z); await Q.step(0.3);
  assert.equal(Q.E.k20().T, R.E.k20().T); assert.equal(Q.E.state().perutot, 5);
  assert.match(read('src/avodah/shift/index.js'), /try \{ refund37\(save\); \} catch/);
});

// ───────── (3) the retune ─────────
test('build 37 (3): the levels\' new knobs — the ashes\' pans, the laver\'s and the teni\'s balance at level 4, the lamb\'s spots and level 4\'s smaller blemish; every level still with its source or המחשה', () => {
  assert.deepEqual(ROLES36.map((id) => LVL36[id].length), [4, 4, 4, 4, 4, 4, 4, 4]);
  for (const id of ROLES36) for (const x of LVL36[id]) assert.ok((x.src && /טיוטה/.test(x.src)) || x.mh === 1, `${id}: ${x.he}`);
  assert.deepEqual([1, 2, 3, 4].map((L) => { const h = par36('deshen', L).heavy; return [h.wind, h.spill]; }), [[1.2, 0.68], [1.2, 0.68], [1.45, 0.6], [1.65, 0.53]]);
  assert.deepEqual([par36('kiyor', 4).bal.wind, par36('kiyor', 4).bal.lim, par36('inner', 4).teni.wind, par36('inner', 4).teni.lim], [1.55, 0.5, 1.4, 0.5]);
  assert.deepEqual([1, 2, 3, 4].map((L) => [par36('lamb', L).pB, par36('lamb', L).dirt, par36('lamb', L).sz || 1]), [[0.8, 4, 1], [0.8, 4, 1], [0.8, 4, 1], [0.85, 4, 0.5]]);
  assert.match(read('src/avodah/shift/pen25.js'), /\* \(sp2\.small \? 0\.62 : 1\) \* \(sp2\.sz \|\| 1\)/);
});
test('build 37 (3): the lamb\'s level 4 carries its smaller blemish into the act (the spot\'s sz)', async () => {
  let found = 0;
  for (let seed = 1; seed < 12 && !found; seed++) {
    const R = practise('lamb', 4, seed); R.E.start(); await R.step(0.3);
    for (let i = 0; i < 80 && !(R.E.p25() && R.E.p25().L); i++) await R.step(0.1);
    const K = R.E.p25(), b = K && K.L && K.L.spots.find((s) => s.kind === 'blem');
    if (b) { assert.equal(b.sz, 0.5); assert.equal(b.small, 1); found++; }
  }
  assert.ok(found, 'a blemished lamb at level 4');
});
test('build 37 (3): the tools\' balance hand (hand37) — the same lines in the sim and the browser\'s autoplayer; its rate over a fixed 0.1 s (a look\'s jitter does not change its counter); the eye (miss37) by the drawn size', () => {
  const src = (f) => { const s = read(f), i = s.indexOf('function hand37('), j = s.indexOf('return u;', i); return s.slice(i, j).replace(/^[ \t]+/gm, ''); };
  assert.equal(src('tools/autoplay35.js'), src('tools/lvl36sim.mjs'));
  assert.match(read('tools/autoplay35.js'), /const EYE37 = \{ child: \{ k50: 0\.099, w: 0\.0367 \}, skilled: \{ k50: 0\.031, w: 0\.0367 \}, att: 0\.15 \};/);
  assert.deepEqual(EYE37, { child: { k50: 0.099, w: 0.0367 }, skilled: { k50: 0.031, w: 0.0367 }, att: 0.15 });
  // the same tilt seen through even looks and through jittered ones: the counters agree within a hair (build 36's differed by up to ±1)
  const tilt = (t) => 0.3 * Math.sin(3 * t), rnd = () => 0.5;
  const even = {}, jit = {}; let ue = 0, uj = 0;
  for (let t = 0; t <= 2 + 1e-9; t += 0.05) ue = hand37(+t.toFixed(3), tilt(t), false, rnd, even);
  for (let t = 0, i = 0; t <= 2 + 1e-9; t += i++ % 3 === 2 ? 0.1 : 0.05) uj = hand37(+t.toFixed(3), tilt(t), false, rnd, jit);
  assert.ok(Math.abs(ue - uj) < 0.15, `even ${ue} jittered ${uj}`);
  // the eye: a smaller spot is missed more; the child misses more than the skilled at every size
  const L = { spots: [{}] }, m = (k, p) => miss37({ r: 4, sz: k / 0.2 }, L, p);
  for (const k of [0.04, 0.1, 0.2]) assert.ok(m(k, 'child') > m(k, 'skilled'));
  assert.ok(m(0.05, 'skilled') > m(0.2, 'skilled') && m(0.2, 'skilled') < 0.02);
  const r = seeded(3), looks = Array.from({ length: 400 }, () => look37(false, r)); assert.ok(looks.every((x) => x === 0.05 || x === 0.1));
});
test('build 37 (3): a sample of the measured shares (node, the tuned table: the ashes, the laver, the lamb)', async () => {
  const share = async (role, L, prof, n) => { let h = 0; for (let i = 0; i < n; i++) if ((await run1(role, L, prof, i)).rating === 'mehudar') h++; return h / n; };
  const a1 = await share('deshen', 1, 'child', 20), a4 = await share('deshen', 4, 'skilled', 20);
  assert.ok(a1 >= 0.45 && a1 <= 0.95, `the ashes, level 1, the child: ${a1}`); assert.ok(a4 >= 0.1 && a4 <= 0.6, `the ashes, level 4, the skilled: ${a4}`);
  const l4 = await share('lamb', 4, 'skilled', 20); assert.ok(l4 >= 0.1 && l4 <= 0.65, `the lamb, level 4, the skilled: ${l4}`);
});

// ───────── (5) the naive kid's sweep ─────────
test('build 37 (5): the gap beside the Ulam\'s door (x −76.65…−75.95, |z| 9.3…31: the court\'s floor 6 below the top step) — a wall to the feet and to the gold path; one already in it set back on the step', async () => {
  const W = await import('../src/avodah/day/world22.js');
  W.HOUSE22.on = true;
  try {
    assert.equal(W.blocked(-76.3, 10, -75.8, 10), true); assert.equal(W.blocked(-76.3, -10, -75.8, -10), true);
    assert.equal(W.blocked(-75.8, 10, -75.5, 10), false, 'the top step itself'); assert.equal(W.blocked(-76.8, 5, -76.3, 5), false, 'the door');
    assert.equal(W.gap37(-76.3, 9), false); assert.equal(W.gap37(-76.3, 31.5), false);
  } finally { W.HOUSE22.on = false; }
  assert.match(read('src/avodah/shift/flow31.js'), /const FREE_HOUSE = \(x, z\) => !gap37\(x, z\) && /);
  assert.match(read('src/avodah/shift/flow31.js'), /const FREE_GATE = \(x, z\) => !gap37\(x, z\) && /);
  const N = practise('menorah', 1); N.E.start(); await N.step(0.6);
  N.at(-76.3, 10); await N.step(0.1);
  assert.ok(N.H.x > -76, `set back on the step: ${N.H.x}`); assert.equal(N.H.z, 10);
});
test('build 37 (5): the menorah\'s last step says its verb; the ashes\' gold-ring hand kept on the screen', () => {
  assert.match(read('src/avodah/shift/rate30.js'), /kuz: 'הכוז על המעלה — הקישו'/);
  assert.match(read('src/avodah/shift/deshen21.js'), /if \(p && Number\.isFinite\(p\.x\) && Number\.isFinite\(p\.y\)\) tapRing\.style\.transform = `translate\(\$\{Math\.max\(48, Math\.min\(\(innerWidth \|\| 640\) - 48, p\.x\)\)/);
});

// ───────── the Divine Name ─────────
test('build 37: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/day33.js', 'src/avodah/day/world22.js', 'src/avodah/shift/flow31.js', 'src/avodah/shift/deshen21.js', 'src/avodah/shift/rate30.js', 'tools/kid34/kidmodes.cjs', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/kiyor20.js', 'src/avodah/shift/index.js', 'src/avodah/shift/lvl36.js', 'src/avodah/shift/pen25.js', 'src/avodah/shift/lobby35.js',
    'tools/lvl36sim.mjs', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'test/build37.test.mjs', 'test/build18.test.mjs', 'test/build20.test.mjs', 'test/build35.test.mjs', 'test/build36.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  // the pilgrims' word (the owner, 23.10 07:47)
  const bad = String.fromCharCode(0x5e6, 0x5dc, 0x5d9, 0x5d9, 0x5e0);
  for (const f of files.filter((f) => f.startsWith('src/'))) assert.ok(!read(f).includes(bad), f);
});
