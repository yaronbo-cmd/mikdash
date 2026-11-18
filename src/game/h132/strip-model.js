/* ── build 132 ── h132/strip-model.js — the rules of work 3 "שליפת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 3). Pure: no
 * three.js, no DOM. LANE A's file.
 *
 * Every wall is held by three things: a diagonal brace outside, a belt beam, and the tongue at the corner. A part something still rests
 * on is loaded. A tap tests a part (free: it wobbles; loaded: it creaks — at level 3 only a creak, its pitch rising with the number of
 * parts still resting on it); a drag outward pulls it.
 * The dependencies (spec "התלויות"; a part is free only when everything listed after it is gone):
 *   1. a brace: always free
 *   2. the east belt, the west belt: its brace
 *   3. the north belt, the south belt: its brace, and both belts of east and west
 *   4. the north wall, the south wall: its belt
 *   5. the east wall, the west wall: its belt, and both walls north and south
 *   6. level 3 only, the wedge: free once the south belt is gone; and the south wall needs then its belt, the wedge, and the slide west
 * A pull:
 *   · a free brace, belt or wedge comes out: 20; a wall that falls free: 40
 *   · a loaded part (a brace or belt something rests on; a wall whose belt is still on; the wedge before the south belt; the stuck south
 *     wall with its wedge in) does not move and creaks: 0, the streak broken
 *   · an east or west wall pulled before north and south: it comes out but tears a piece of the corner (strip.torn, −20, for good)
 *   · level 3, the stuck south wall (its belt and wedge out) pulled out without the slide: the first time it only shakes and creaks (0,
 *     the streak broken); the second time it tears a patch from the block's face (strip.patch, −20) and comes out
 *   · level 3, the slide: the south wall dragged along itself one amah west, once its belt and wedge are out: 20 (it frees the tongue
 *     from the east socket); before that it does not move
 * The free trial: the first tap (taps never cost; the hint hand shows on it).
 *
 *   SK · PARTS · fresh(lv) · load(b) · save(S, id) · deps(S, p) · resting(S, p) · isFree(S, p) · tap(S, p) · pull(S, p) · slide(S)
 *   pitchOf(n) · done(S) · result(S) · maxPts(lv)
 */
import { starsOf } from './model.js';

export const SK = Object.freeze({
  PTS: Object.freeze({ part: 20, slide: 20, wall: 40, loaded: 0, torn: -20, patch: -20 }),
  SLIDE: 1,                    // (amot: the stuck wall's slide west)
  // the creak's pitch (level 3): a base and a step per part still resting on it (semitones, לכיוונון)
  PITCH: Object.freeze({ base: 1, step: 2 }),
});
const BR = ['brace:N', 'brace:S', 'brace:E', 'brace:W'], BE = ['belt:N', 'belt:S', 'belt:E', 'belt:W'], WA = ['wall:N', 'wall:S', 'wall:E', 'wall:W'];
export const PARTS = Object.freeze({ 1: Object.freeze([...WA]), 2: Object.freeze([...BR, ...BE, ...WA]), 3: Object.freeze([...BR, ...BE, 'wedge', ...WA]) });
const side = (p) => p.split(':')[1];

/* S = { lv, left: { p: 1 }, gone: [p] in order, slid (0|1, level 3), stuckN (pulls of the stuck wall without the slide), taps, pts,
 *       dmg, breaks, streak, torn: [corner], patch, ev: [], n } */
export function fresh(lv) {
  lv = Math.max(1, Math.min(3, lv | 0 || 1));
  const S = { lv, left: {}, gone: [], slid: 0, stuckN: 0, taps: 0, pts: 0, dmg: 0, breaks: 0, streak: 0, torn: [], patch: 0, ev: [], n: 0 };
  for (const p of PARTS[lv]) S.left[p] = 1;
  return S;
}
export function save(S, id) { return { id, lv: S.lv, gone: S.gone.slice(), slid: S.slid, stuckN: S.stuckN, taps: S.taps, pts: S.pts, dmg: S.dmg, breaks: S.breaks, torn: S.torn.slice(), patch: S.patch, n: S.n }; }
export function load(b) {
  const S = fresh(b.lv);
  for (const p of b.gone || []) if (S.left[p]) { delete S.left[p]; S.gone.push(p); }
  Object.assign(S, { slid: b.slid | 0, stuckN: b.stuckN | 0, taps: b.taps | 0, pts: b.pts | 0, dmg: b.dmg | 0, breaks: b.breaks | 0, torn: (b.torn || []).slice(), patch: b.patch | 0, n: b.n | 0 });
  return S;
}
const evt = (S, e) => { S.ev.push(e); if (S.ev.length > 24) S.ev.shift(); S.n++; return e; };
const has = (S, p) => !!S.left[p];

/** what part p waits for — its hard needs (it will not move while any is in) and its soft ones (an east or west wall: the walls north
 *  and south; pulled before them it comes out and tears the corner) → { hard: [p], soft: [p], slide: bool } */
export function deps(S, p) {
  const k = side(p) || '', lv3 = S.lv === 3;
  if (p.startsWith('brace:')) return { hard: [], soft: [] };
  if (p === 'belt:E' || p === 'belt:W') return { hard: ['brace:' + k], soft: [] };
  if (p === 'belt:N' || p === 'belt:S') return { hard: ['brace:' + k, 'belt:E', 'belt:W'], soft: [] };
  if (p === 'wedge') return { hard: ['belt:S'], soft: [] };
  if (p === 'wall:N') return { hard: ['belt:N'], soft: [] };
  if (p === 'wall:S') return { hard: lv3 ? ['belt:S', 'wedge'] : ['belt:S'], soft: [], slide: lv3 };
  if (p === 'wall:E' || p === 'wall:W') return { hard: ['belt:' + k], soft: ['wall:N', 'wall:S'] };
  return { hard: [], soft: [] };
}
/** the parts still resting on p (what is still in of what it waits for, hard and soft; the stuck wall's slide not yet made counts one) */
export function resting(S, p) {
  const d = deps(S, p); let n = d.hard.filter((q) => has(S, q)).length + d.soft.filter((q) => has(S, q)).length;
  if (d.slide && !S.slid) n++;
  return n;
}
/** free: nothing rests on it (a tap wobbles it; a pull takes it cleanly) */
export const isFree = (S, p) => has(S, p) && resting(S, p) === 0;
/** the creak's pitch for n parts resting on it (level 3: it rises with n) */
export const pitchOf = (n) => SK.PITCH.base + SK.PITCH.step * Math.max(0, n | 0);

/** a tap: a test only → { p, sound: 'wobble' | 'creak', n (parts resting on it), pitch, free (the first tap) } */
export function tap(S, p) {
  if (!has(S, p)) return null;
  const n = resting(S, p), first = S.taps === 0; S.taps++;
  const sound = S.lv === 3 ? 'creak' : n === 0 ? 'wobble' : 'creak';
  return evt(S, { k: 'tap', p, sound, n, pitch: pitchOf(n), first: first ? 1 : 0 });
}
/** level 3: the stuck south wall dragged along itself, west, one amah → { ok, pts } */
export function slide(S) {
  if (S.lv !== 3 || !has(S, 'wall:S') || S.slid) return { ok: false, pts: 0 };
  if (has(S, 'belt:S') || has(S, 'wedge')) { S.streak = 0; S.breaks++; evt(S, { k: 'stuckSlide', p: 'wall:S', pts: 0 }); return { ok: false, pts: 0, loaded: true }; }
  S.slid = 1; S.pts += SK.PTS.slide; S.streak++;
  evt(S, { k: 'slide', p: 'wall:S', pts: SK.PTS.slide });
  return { ok: true, pts: SK.PTS.slide };
}
/** a pull (a drag outward; the wedge: upward) → { p, out (it came out), pts, kind: 'free' | 'wall' | 'loaded' | 'torn' | 'shake' | 'patch', corner? } */
export function pull(S, p) {
  if (!has(S, p)) return null;
  const d = deps(S, p), hardIn = d.hard.filter((q) => has(S, q)), softIn = d.soft.filter((q) => has(S, q));
  const out = (kind, pts, more = {}) => {
    delete S.left[p]; S.gone.push(p); S.pts += Math.max(0, pts); if (pts < 0) S.dmg++;
    if (kind === 'free' || kind === 'wall') S.streak++; else { S.streak = 0; S.breaks++; }
    return evt(S, { k: 'pull', p, out: 1, kind, pts, ...more });
  };
  if (hardIn.length) { S.streak = 0; S.breaks++; return evt(S, { k: 'pull', p, out: 0, kind: 'loaded', pts: 0, n: resting(S, p) }); }
  if (d.slide && !S.slid) {
    S.stuckN++;
    if (S.stuckN === 1) { S.streak = 0; S.breaks++; return evt(S, { k: 'pull', p, out: 0, kind: 'shake', pts: 0 }); }
    S.patch++; return out('patch', SK.PTS.patch);
  }
  if (softIn.length) {
    // (the corner torn: where the east or west wall meets the first tongue wall still standing — N first, then S)
    const k = side(p), t = side(softIn[0]), corner = (t === 'N' ? 'N' : 'S') + k;
    S.torn.push(corner); return out('torn', SK.PTS.torn, { corner });
  }
  if (p.startsWith('wall:')) return out('wall', SK.PTS.wall);
  return out('free', SK.PTS.part);
}
export const done = (S) => Object.keys(S.left).length === 0;
/** the most a level can score: 20 for each brace, belt and wedge, the slide's 20, 40 for each wall */
export const maxPts = (lv) => PARTS[lv].reduce((a, p) => a + (p.startsWith('wall:') ? SK.PTS.wall : SK.PTS.part), 0) + (lv === 3 ? SK.PTS.slide : 0);
export function result(S) {
  const max = maxPts(S.lv), pts = Math.max(0, S.pts - 20 * S.dmg), q = Math.max(0, Math.min(1, pts / max));
  const perfect = done(S) && !S.dmg && !S.breaks;
  return { pts, max, q: +q.toFixed(3), stars: starsOf(q), perfect, flags: { 'strip.torn': S.torn.length, 'strip.patch': S.patch, breaks: S.breaks, taps: S.taps, order: S.gone.join(',') } };
}
