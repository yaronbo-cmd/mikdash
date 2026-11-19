/* ── build 132 ── h132/stub.js — a stand-in act for a work of stage 09 not yet coded (build 132 phase 0: the skeleton). It shows the
 * work's place in the world from the book's camera for a moment (the world as stage(kind, lv, save) has it: h132/world.js draws it
 * from the open work) and finishes with a plain result (2 stars, 20 points, no flaw), so the stage plays through end to end while each
 * lane codes its own act. Each lane replaces its own file's stub (form.js, fill.js, strip.js, sikra.js): nothing else changes.
 *   stubAct(m, X, { eye, aim, at, line, kohen }) → act
 */
import { H132, qOf, starsOf } from './model.js';

export function stubAct(m, X, o) {
  const A = { t: 0, ended: false, shown: false };
  const finish = () => {
    if (A.ended) return; A.ended = true;
    const pts = 20, q = qOf(pts);
    X.end({ stars: starsOf(q), q, pts, perfect: false, at: o.at, flags: { stub: 1 }, film: { eye: o.eye, aim: o.aim, secs: 0.6 } });
  };
  return {
    close: true,
    begin() {
      if (o.kohen === false) X.kohen(false);   // (works 1–3: his own figure is not on screen — the crews do what the thumb does)
      X.shot(o.eye, o.aim, 0.01); A.shown = true;
      X.line(o.line || '', 0);
    },
    update(dt) { A.t += dt; if (A.t >= (+globalThis.__H132_STUB_SECS || H132.STUB_SECS)) finish(); },   // (tests: __H132_STUB_SECS holds the picture longer)
    down() {}, move() {}, up() {}, wants: () => false, holds: () => false, cancel() {},
    at() { return o.at; },
    end() { A.ended = true; X.line(''); },
    dbg() { return { id: m.id, lv: m.lv, stub: 1, t: +A.t.toFixed(2), shown: A.shown, block: X.M && X.M.block ? X.M.block() : null }; },
  };
}
