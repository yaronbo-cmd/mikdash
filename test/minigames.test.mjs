// FUN (wave 6): the site's precision games. Pure models played headless (autopilot, no taps, mashing), the catalogue,
// the calm fallbacks, the real-course reader for the crane, and BUILD's self-registration.
// Run: node --test test/minigames.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, MINIGAMES, runMinigame, simulate, craneCourse, tierOf, TIERS, WHAT_KEY, LEVEL_ORDER, levelAt } from '../src/game/minigames/index.js';
import { checkEvery, CHECK_EVERY } from '../src/game/content.js';

const KINDS = ['crane', 'dress', 'plumb', 'whole', 'quarry'];
const NAME = new RegExp(String.fromCharCode(0x5D9, 0x5D4, 0x5D5, 0x5D4));   // built from char codes: the Name is never written

test('the catalogue: five games, each with a name, a hint, a length, a step and one sourced fact (a draft)', () => {
  assert.deepEqual(Object.keys(MINIGAMES).filter((k) => KINDS.includes(k)).sort(), [...KINDS].sort());   // (games14: and the jobs' games after them)
  for (const k of KINDS) {
    const g = MINIGAMES[k];
    assert.ok(g.n && g.hint && g.step, k);
    assert.ok(g.secs[0] >= 10 && g.secs[1] <= 60, k + ' secs');
    assert.ok(g.fact.he.length > 20 && g.fact.ref.length > 4, k + ' fact');
    assert.equal(g.tiers.length, 4);
    assert.ok(!NAME.test(JSON.stringify(g)), 'never the Name');
  }
  assert.equal(TIERS[tierOf(0.95)], 'מופת');
  assert.equal(tierOf(0.2), 0);
});

test('the autopilot plays every game well, in 10–60 s, at every level; the same seed plays the same game', () => {
  for (const k of KINDS) for (const level of [0, 2, 4]) {
    const r = simulate(GAMES[k], { level, rng: seeded(7) });
    assert.ok(r.done, `${k}@${level} ends`);
    assert.ok(r.s >= 8 && r.s <= 60, `${k}@${level} lasts ${r.s.toFixed(1)} s`);
    assert.ok(r.quality >= 0.75, `${k}@${level} quality ${r.quality.toFixed(2)}`);
    const again = simulate(GAMES[k], { level, rng: seeded(7) });
    assert.equal(again.score, r.score, `${k}@${level} deterministic`);
  }
});

test('a player who never taps still reaches the end (no stall, no fail screen); a masher is answered, not stuck', () => {
  for (const k of KINDS) {
    const idle = simulate(GAMES[k], { level: 1, rng: seeded(3) }, () => false);
    assert.ok(idle.done && idle.s <= 70, `${k} idle ends in ${idle.s.toFixed(1)} s`);
    assert.ok(idle.quality >= 0 && idle.quality <= 0.6, `${k} idle quality ${idle.quality.toFixed(2)}`);
    let n = 0;
    const mash = simulate(GAMES[k], { level: 1, rng: seeded(3) }, () => (++n % 6 === 0 ? (k === 'whole' ? 'ok' : true) : false));
    assert.ok(mash.done, `${k} mash ends`);
    const auto = simulate(GAMES[k], { level: 1, rng: seeded(3) });
    assert.ok(auto.quality > mash.quality, `${k}: skill beats mashing (${auto.quality.toFixed(2)} > ${mash.quality.toFixed(2)})`);
  }
});

test('the crane: joints over joints cost quality; a perfect drop is rewarded', () => {
  const M = GAMES.crane.model({ level: 0, rng: seeded(1) });
  const tg = M.target();
  assert.equal(M.clashAt(tg.u, tg.w), false, 'the bed itself never sits joint over joint');
  let hitJoint = false;
  for (const j of M.joints) if (M.clashAt(j + tg.w / 2, tg.w)) hitJoint = true;
  assert.ok(hitJoint, 'an edge over a joint is detected');
});

test('runMinigame always resolves: no DOM → a calm result; an unknown kind → calm; it self-registers for BUILD', async () => {
  const r = await runMinigame('crane', { site: 'wall', world: { nextSlot() { throw new Error('x'); } } });
  assert.equal(r.ok, true); assert.equal(r.skipped, true); assert.ok(r.quality > 0.5);
  const u = await runMinigame('nope', {});
  assert.equal(u.ok, true);
  assert.equal(typeof globalThis.__BH_PARTS.minigames.runMinigame, 'function');
  assert.ok(globalThis.__BH_PARTS.minigames.MINIGAMES.crane);
});

test('craneCourse reads SITE\'s real course along a rotated face (and mirrors a front that works the other way)', () => {
  const yaw = 0.7, ax = Math.cos(yaw), az = -Math.sin(yaw);
  const at = (u, w, set = false) => ({ x: 10 + u * ax, y: 3, z: 5 + u * az, w, h: 1, d: 1, yaw, set });
  const cur = [at(-2, 2, true), at(0, 2), at(2.1, 2.2), at(4.2, 2), at(6.2, 2)];
  const below = [at(-1, 2), at(1, 2), at(3, 2), at(5, 2)];
  const st = { slots: (id, c) => (c === 4 ? cur : below) };
  const slot = { ...at(0, 2), course: 4 };
  const c = craneCourse(st, 'wall', slot);
  assert.ok(c && c.targets.length === 4, 'four free stones ahead');
  assert.ok(Math.abs(c.targets[0].u) < 1e-9 && Math.abs(c.targets[0].w - 1) < 1e-9, 'the slot is the unit');
  assert.ok(Math.abs(c.below[0].u + 0.5) < 1e-9, 'the course below in the slot\'s units');
  const back = craneCourse({ slots: (id, co) => (co === 4 ? [at(-4, 2), at(-2, 2), at(0, 2), at(2, 2, true)] : below) }, 'wall', slot);
  assert.ok(back && back.targets.length === 3 && back.targets[1].u > 0, 'mirrored');
  assert.equal(craneCourse({}, 'wall', slot), null);
});

function seeded(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

test('a quick lift: the crane with one stone ends in a few seconds', () => {
  const r = simulate(GAMES.crane, { level: 0, rng: seeded(4), setup: { stones: 1 } });
  assert.ok(r.done && r.placed === 1 && r.s < 6, `one stone in ${r.s.toFixed(1)} s`);
});

test('the crane\'s key stones: the first (3 stones), a corner (2), the great stone and the lintel (one long stone each)', () => {
  const n = (what) => simulate(GAMES.crane, { level: 1, rng: seeded(6), setup: { what } });
  assert.equal(n('first').placed, 3); assert.equal(n('corner').placed, 2);
  const g = n('great'), l = n('lintel');
  assert.ok(g.done && g.placed === 1 && g.quality > 0.7, 'the great stone');
  assert.ok(l.done && l.placed === 1 && l.quality > 0.7, 'the lintel');
  const M = GAMES.crane.model({ level: 0, rng: seeded(2), setup: { what: 'lintel' } });
  assert.equal(M.posts, true);
  const G2 = GAMES.crane.model({ level: 0, rng: seeded(2), setup: { what: 'great' } });
  assert.equal(G2.clashAt(0, G2.target().w), false, 'the great stone\'s bed never sits joint over joint');
});

test('the course check (BUILD: every two courses) is three plumb rounds, ~7 s', () => {
  const r = simulate(GAMES.plumb, { level: 0, rng: seeded(8), setup: { rounds: 3 } });
  assert.ok(r.done && r.s < 9, `course check in ${r.s.toFixed(1)} s`);
});

// (GAMES13, wave 13 — the owner, 30.9 11:12: "הפלס עם המחט … לשלבי הפילוס") the level first where the work IS leveling
test('the leveling stages: the Mount\'s every course, the paving, the court\'s floor, the 15 steps, the altar\'s top — two level rounds, then the plumb', () => {
  assert.deepEqual(LEVEL_ORDER, ['level', 'level', 'plumb']);
  assert.equal(levelAt({ site: 'har', check: 'courses' }).surface, 'course');
  assert.deepEqual(levelAt({ site: 'har', check: 'rock' }).order, ['level', 'level'], 'N82: the bedrock, leveled once the rocks are gone');
  for (const [site, surf] of [['har', 'paving'], ['nashim', 'floor'], ['nikanor', 'steps'], ['karnot', 'altar']]) assert.equal(levelAt({ site }).surface, surf, site);
  for (const site of ['wall', 'gates', 'ulam', 'kodesh']) assert.equal(levelAt({ site, check: 'courses' }), null, site + ': the plumb as before');
  assert.equal(levelAt({ site: 'nashim', check: 'courses' }), null, 'the court\'s courses keep the plumb; its floor gets the level');
  assert.equal(checkEvery('har'), 1, 'the Mount: a check at every course end'); assert.equal(checkEvery('wall'), CHECK_EVERY);
  const M = GAMES.plumb.model({ level: 0, rng: seeded(8), setup: { order: LEVEL_ORDER, surface: 'paving' } });
  assert.deepEqual([0, 1, 2].map((r) => M.kind(r)), ['level', 'level', 'plumb']);
  assert.equal(M.rounds, 3); assert.equal(M.surface, 'paving');
  // the line follows the tool: the plumb's how-to comes when the third round begins
  const lines = []; let t = 0;
  while (!M.done && t < 30) { if (M.auto()) M.tap(); M.step(1 / 60); for (const e of M.fx) if (e.howto) lines.push([M.r, e.howto]); M.fx.length = 0; t += 1 / 60; }
  assert.ok(M.done && t < 10, `three rounds in ${t.toFixed(1)} s`);
  assert.deepEqual(lines.map((l) => l[0]), [2]); assert.ok(/האנך/.test(lines[0][1]), lines[0][1]);
  const old = GAMES.plumb.model({ level: 0, rng: seeded(8), setup: {} });
  assert.deepEqual([0, 2, 3, 4].map((r) => old.kind(r)), ['plumb', 'plumb', 'level', 'level'], 'elsewhere: 3 plumb + 2 level, as before');
  // a whole leveling check played by the autopilot is as good as the old one; a player who never taps still reaches the end
  const r = simulate(GAMES.plumb, { level: 1, rng: seeded(4), setup: { order: LEVEL_ORDER } });
  assert.ok(r.done && r.quality >= 0.75, `quality ${r.quality.toFixed(2)}`);
  const idle = simulate(GAMES.plumb, { level: 1, rng: seeded(4), setup: { order: LEVEL_ORDER } }, () => false);
  assert.ok(idle.done && idle.s < 30);
});

test('BUILD\'s Hebrew key-stone labels reach the crane\'s variants (the great stone, the lintel)', async () => {
  const seen = [];
  const r = await runMinigame('crane', { what: 'אבן גדולה', onEvent: (t, d) => seen.push(d) });   // no DOM: a calm result
  assert.ok(r.ok);
  assert.equal(WHAT_KEY['אבן גדולה'], 'great'); assert.equal(WHAT_KEY['המשקוף'], 'lintel'); assert.equal(WHAT_KEY['האבן הראשונה'], 'first');
  const M = GAMES.crane.model({ level: 0, rng: seeded(2), setup: { what: 'great' } });
  const L = GAMES.crane.model({ level: 0, rng: seeded(2), setup: { what: 'lintel' } });
  assert.equal(M.n, 1, 'the great stone is one stone'); assert.equal(L.posts, true, 'the lintel rests on posts');
});

// ── games14 ── (wave 14) the drag channel: simulate (and the frame's autopilot) feed {x, y, p} drags, {press, down} holds
// and arrays of them (two thumbs); a drag model gets 'down' instead of tap; the star floor: a finished game is never ☆☆☆
import { starsOf, feed, STARS_Q } from '../src/game/minigames/index.js';
test('the drag channel: {x, y, p} drags, {press, down} holds, arrays; the star floor (done ★, .7 ★★, .9 ★★★)', () => {
  const log = [];
  const toy = {
    kind: 'toy',
    model() {
      let k = 0;
      return {
        done: false, progress: 0, fx: [], t: 0,
        step(dt) { this.t += dt; if (this.t > 0.2) this.done = true; },
        tap(x, y) { log.push(['tap', x, y]); }, drag(x, y, p, id) { log.push([p, x, y, id]); }, press(id, down) { log.push(['press', id, down]); },
        auto() { k++; return k === 1 ? { x: 0.2, y: 0.9, p: 'down' } : k === 2 ? { x: 0.2, y: 0.4, p: 'move', id: 3 } : k === 3 ? [{ press: 'L', down: true }, { press: 'R', down: false }] : k === 4 ? { x: 0.5, y: 0.5, p: 'tap' } : null; },
        result() { return { quality: 0.72, perfect: false, score: 9 }; },
      };
    },
  };
  const r = simulate(toy, {});
  assert.deepEqual(log, [['down', 0.2, 0.9, 0], ['move', 0.2, 0.4, 3], ['press', 'L', true], ['press', 'R', false], ['tap', 0.5, 0.5]]);
  assert.equal(r.stars, 2, 'q .72 → ★★');
  const noDrag = []; feed({ tap: (x, y) => noDrag.push([x, y]) }, { x: 0.1, y: 0.2, p: 'move' });
  assert.deepEqual(noDrag, [[0.1, 0.2]], 'a tap model hears a drag as a tap (never throws)');
  assert.deepEqual(STARS_Q, [0.7, 0.9]);
  assert.deepEqual([0, 0.4, 0.69, 0.7, 0.89, 0.9, 1].map(starsOf), [1, 1, 1, 2, 2, 3, 3], 'never ☆☆☆');
  for (const k of KINDS) { const s = simulate(GAMES[k], { level: 0, rng: seeded(5) }); assert.ok(s.stars >= 1 && s.stars <= 3, k); }
});
// ── /games14 ──

// ── games14 ── (wave 14) the jobs' games: each solver ★★★ at L1 and ≥ ★★ at L3, in 15–32 s; mashing scores lower;
// idling ends kindly (the crew's help, a calm quality); every text is a draft with a source or המחשה; never the Name
import { saw2 } from '../src/game/minigames/saw.js';
import { coverSkins, SKINS } from '../src/game/minigames/cover.js';
const JOB_KINDS = ['saw', 'cover', 'pull', 'tread', 'rafts', 'waves'];
const masher = (every, dx = 0) => { let k = 0, a = null; return () => { if (a) { a.y += 0.08; if (a.y > 0.98) { a = null; return { x: 0.5 + dx, y: 0.98, p: 'up', id: 1 }; } return { x: 0.5 + dx * (a.y - 0.6) * 2.5, y: a.y, p: 'move', id: 1 }; } if (++k % Math.round(every * 60) === 0) { a = { y: 0.6 }; return { x: 0.5, y: 0.6, p: 'down', id: 1 }; } return null; }; };
test('the jobs\' games: the solver ★★★ at L1 and ≥ ★★ at L3 (20–30 s); mashing and idling score lower; idling ends', () => {
  for (const k of JOB_KINDS) {
    const g = GAMES[k];
    assert.ok(g && MINIGAMES[k], k + ' registered');
    assert.ok(g.fact && g.fact.ref && g.fact.status === 'draft' && g.fact.he.length > 20, k + ' fact: a draft with its source');
    assert.ok(!NAME.test(JSON.stringify({ n: g.n, h: g.hint, w: g.howto, f: g.fact })), k + ': never the Name');
    const r0 = simulate(g, { level: 0, rng: seeded(7) }), r2 = simulate(g, { level: 2, rng: seeded(7) });
    assert.ok(r0.done && r0.stars === 3, `${k} L1 ★${r0.stars} q ${r0.quality.toFixed(2)}`);
    assert.ok(r2.done && r2.stars >= 2, `${k} L3 ★${r2.stars} q ${r2.quality.toFixed(2)}`);
    for (const r of [r0, r2]) assert.ok(r.s >= 15 && r.s <= 32, `${k} lasts ${r.s.toFixed(1)} s`);
    const idle = simulate(g, { level: 1, rng: seeded(3) }, () => false);
    assert.ok(idle.done && idle.s <= 70 && idle.quality <= 0.6, `${k} idle ends in ${idle.s.toFixed(1)} s at q ${idle.quality.toFixed(2)}`);
    const mash = simulate(g, { level: 1, rng: seeded(3) }, masher(0.4)), auto = simulate(g, { level: 1, rng: seeded(3) });
    assert.ok(mash.done && auto.quality > mash.quality + 0.1, `${k}: skill beats mashing (${auto.quality.toFixed(2)} > ${mash.quality.toFixed(2)})`);
  }
});

test('the saw: the off-beat pull bites; pulling with the partner sticks; crooked pulls cost the line; knots at L2–L3', () => {
  const crooked = simulate(GAMES.saw, { level: 0, rng: seeded(2) }, masher(1.2, 0.25));
  assert.ok(crooked.line < 0.3, `crooked line ${crooked.line.toFixed(2)}`);
  const M = GAMES.saw.model({ level: 0, setup: {} });
  M.drag(0.5, 0.6, 'down', 1); for (let y = 0.65; y <= 0.95; y += 0.05) M.drag(0.5, y, 'move', 1); M.drag(0.5, 0.95, 'up', 1);
  assert.equal(M.pulls, 1, 'the first pull counts at once (the partner follows her)');
  for (let i = 0; i < 40 && !M.pp; i++) M.step(1 / 60);
  assert.ok(M.pp > 0, 'the partner pulls back on his beat');
  M.drag(0.5, 0.6, 'down', 2); M.drag(0.5, 0.7, 'move', 2);
  assert.equal(M.sticks, 1, 'pulling while he pulls: it sticks');
  assert.equal(GAMES.saw.model({ level: 0 }).knotAt(), -1); assert.equal(GAMES.saw.model({ level: 2 }).planks, 3);
  const k1 = GAMES.saw.model({ level: 1 }); k1.plank = 1; assert.equal(k1.knotAt(), 0.5, 'L2: a knot in the second plank');
});

test('the saw for two (one phone): alternating pulls cut; both at once stick; runMinigame picks it by ctx.duel', () => {
  assert.equal(GAMES.saw.pick({ duel: true }), saw2); assert.equal(GAMES.saw.pick({}), GAMES.saw);
  assert.ok(saw2.tall > 0.5, 'a tall canvas');
  const r = simulate(saw2, { level: 0, rng: seeded(3) });
  assert.ok(r.done && r.stars === 3 && r.s >= 10 && r.s <= 30, `duel ★${r.stars} in ${r.s.toFixed(1)} s`);
  const D = saw2.model({ level: 0 });
  D.drag(0.5, 0.6, 'down', 1); D.drag(0.5, 0.4, 'down', 2);
  D.drag(0.5, 0.7, 'move', 1); D.drag(0.5, 0.3, 'move', 2);
  assert.equal(D.sticks, 1, 'both pull at once: it sticks');
  const E = saw2.model({ level: 0 });
  E.drag(0.5, 0.6, 'down', 1); for (let y = 0.65; y <= 0.95; y += 0.05) E.drag(0.5, y, 'move', 1); E.drag(0.5, 0.95, 'up', 1);
  E.drag(0.5, 0.4, 'down', 2); for (let y = 0.35; y >= 0.05; y -= 0.05) E.drag(0.5, y, 'move', 2); E.drag(0.5, 0.05, 'up', 2);
  assert.equal(E.pulls, 2, 'the near and the far player each pulled toward himself');
  assert.ok(E.blade < 0.05 && E.c > 0, 'the far pull brought the blade back up, and the cut ran on');
});
// ── /games14 ──

test('cover: the gold, the plaster, the bronze — each ★★★ at L1 and ≥ ★★ at L3 by its sweep; the door\'s edge (L2 gold) costs a scribbler', () => {
  for (const sk of ['gold', 'plaster', 'bronze']) {
    const g = coverSkins[sk];
    assert.equal(GAMES.cover.pick({ skin: sk }), g, sk + ' by ctx.skin');
    assert.ok(g.fact.status === 'draft' && g.fact.illus && /מדות/.test(g.fact.ref), sk + ' fact');
    assert.ok(!NAME.test(JSON.stringify(SKINS[sk])), sk + ': never the Name');
    const r0 = simulate(g, { level: 0, rng: seeded(7) }), r2 = simulate(g, { level: 2, rng: seeded(7) });
    assert.ok(r0.stars === 3 && r2.stars >= 2 && r0.s >= 12 && r2.s <= 32, `${sk}: L1 ★${r0.stars} ${r0.s.toFixed(1)} s · L3 ★${r2.stars} ${r2.s.toFixed(1)} s`);
  }
  assert.equal(GAMES.cover.pick({ site: 'nikanor' }), coverSkins.bronze, 'by the site: Nikanor is bronze');
  assert.equal(GAMES.cover.pick({ site: 'guf' }), coverSkins.plaster, 'the altar is plaster');
  const M = coverSkins.gold.model({ level: 1, rng: seeded(1) });
  assert.ok(M.off[0] && !M.off[C24(4)], 'L2 gold: behind the door (the left four columns) is no gold');
  M.drag(0.1, 0.5, 'down', 1); for (let k = 0; k < 30; k++) { M.step(1 / 60); M.drag(0.1, 0.3 + (k % 10) * 0.05, 'move', 1); }
  assert.ok(M.spill > 0 && M.mine === 0, `rubbing behind the door spills (${M.spill.toFixed(2)})`);
  const P = coverSkins.plaster.model({ level: 0, rng: seeded(1) });
  let t = 0; P.drag(0.5, 0.5, 'down', 1);
  while (t < 2) { t += 1 / 60; P.step(1 / 60); P.drag(0.5 + 0.1 * Math.sin(t * 6 * Math.PI), 0.5, 'move', 1); }
  assert.ok(P.cov > 0.05 && P.cov < 0.4, `two seconds of rubbing one spot whiten it (${P.cov.toFixed(2)})`);
});
function C24(i) { return i; }
// ── /games14 ──

test('the column: hauled steadily it rises true; a yank sways it (it never falls); past the plumb the crew eases it back', () => {
  const M = GAMES.pull.model({ level: 0, rng: seeded(1) });
  M.drag(0.86, 0.2, 'down', 1);
  for (let k = 1; k <= 6; k++) { M.drag(0.86, 0.2 + k * 0.12, 'move', 1); M.step(1 / 60); }   // 0.72 of the height in 0.1 s: a yank
  assert.ok(M.sway > 0.2 && M.ang > 0 && M.ang < 1, `a yank sways it (sway ${M.sway.toFixed(2)}), the column only rises`);
  const N = GAMES.pull.model({ level: 0, rng: seeded(1) }); N.ang = 0.99; N.drag(0.86, 0.3, 'down', 1); N.drag(0.86, 0.6, 'move', 1);
  assert.equal(N.overs, 1, 'past the plumb'); for (let k = 0; k < 60; k++) N.step(1 / 60);
  assert.ok(N.ang < 1 && N.ang > 0.9 && N.phase === 'pull', 'the crew eased it back, short of true');
  const S = GAMES.pull.model({ level: 0, rng: seeded(1) }); S.ang = 1 - S.tol / 2; S.step(1 / 60);
  assert.equal(S.phase, 'set', 'let go within the plumb: it stands');
});
// ── /games14 ──

test('the treadwheel: two hold buttons in step raise the stone; the same foot twice stumbles; both feet brake; it rests on the mark', () => {
  assert.deepEqual(GAMES.tread.buttons.map((b) => [b.id, !!b.hold]), [['R', true], ['L', true]], 'two hold buttons');
  const M = GAMES.tread.model({ level: 0, rng: seeded(1) });
  M.press('R', true); for (let k = 0; k < 20; k++) M.step(1 / 60); M.press('R', false);
  M.press('L', true); for (let k = 0; k < 20; k++) M.step(1 / 60); M.press('L', false);
  assert.ok(M.h > 0.03 && M.good === 2, `two steps in step raise the stone (${M.h.toFixed(3)})`);
  M.press('L', true); M.press('L', false);
  assert.equal(M.stumbles, 1, 'the same foot twice: a stumble');
  const v0 = M.v; M.press('R', true); M.press('L', true); for (let k = 0; k < 20; k++) M.step(1 / 60);
  assert.ok(M.v < v0 * 0.2, 'both feet: the brake');
  const S = GAMES.tread.model({ level: 0, rng: seeded(1) }); S.h = S.mark(); for (let k = 0; k < 40; k++) S.step(1 / 60);
  assert.equal(S.phase, 'set', 'at rest on the mark: the crane sets it');
});
// ── /games14 ──

test('the rafts: an open channel always runs through the rocks (the autopilot never hits); a rock only bumps; the current speeds the raft', () => {
  for (const level of [0, 1, 2]) for (const seed of [1, 2, 3, 4]) {
    const M = GAMES.rafts.model({ level, rng: seeded(seed) });
    for (const k of M.rocks) assert.ok(Math.abs(k.x - M.pathAt(k.y)) > k.r + 0.16, `L${level}/${seed}: a rock off the channel`);
    const r = simulate(GAMES.rafts, { level, rng: seeded(seed) });
    assert.ok(r.hits === 0 && r.stars === 3, `L${level}/${seed}: ★${r.stars}, ${r.hits} hits`);
  }
  const M = GAMES.rafts.model({ level: 0, rng: seeded(5) }); const k = M.rocks[0];
  M.d = k.y - (1 - 0.78); M.x = M.tx = k.x; M.step(1 / 60);
  assert.ok(M.hits === 1 && M.slow > 0 && !M.done, 'a rock bumps and slows the raft; the trip goes on');
});
// ── /games14 ──

test('the waves: out, in, out — each stone let go on its depth mark; the wall ripples at the end (בבא בתרא ד, א)', () => {
  const M = GAMES.waves.model({ level: 0, rng: seeded(2) });
  assert.notEqual(M.want(0), M.want(1)); assert.equal(M.want(0), M.want(2));
  for (let k = 0; k < 60; k++) M.step(1 / 60);
  assert.equal(M.phase, 'hang', 'the crane brought the first stone');
  M.drag(0.86, 0.5, 'down', 1); M.drag(0.86 + (M.target() - M.x), 0.5, 'move', 1); M.drag(0.5, 0.5, 'up', 1);
  assert.equal(M.accs[0], 1, 'let go on its mark: true');
  for (let k = 0; k < 90; k++) M.step(1 / 60);
  M.drag(0.86, 0.5, 'down', 1); M.drag(0.86 - 0.1, 0.5, 'move', 1); M.drag(0.5, 0.5, 'up', 1);
  assert.ok(M.accs[1] < 1, 'off its mark: less');
  M.drag(0.5, 0.5, 'down', 1); M.drag(0.5, 0.5, 'up', 1);
  assert.equal(M.accs.length, 2, 'a tap with no drag sets nothing (a hint)');
});
// ── /games14 ──
