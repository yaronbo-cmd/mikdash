/* ── build 131 ── h131/stub.js — a stand-in act for a part of stage 08 not yet coded (build 131 part 1: the skeleton). It shows the
 * work's place in the world from the book's camera for a moment and finishes at once with a plain result (2 stars, 20 points, no
 * damage), so the stage plays through end to end while each lane codes its own act. Each lane replaces its own file's stub (pit.js,
 * frame.js, pour.js, finale.js): nothing else changes.
 *   stubAct(m, X, { eye, aim, at, line, pit }) → act
 */
import { H131, qOf, starsOf } from './model.js';
import { goPit, backFromPit } from './world.js';

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
      if (o.pit) goPit(X);
      X.shot(o.eye, o.aim, 0.01); A.shown = true;
      X.line(o.line || '', 0);
    },
    update(dt) { A.t += dt; if (A.t >= (+globalThis.__H131_STUB_SECS || H131.STUB_SECS)) finish(); },   // (tests: __H131_STUB_SECS holds the picture longer)
    down() {}, move() {}, up() {}, wants: () => false, holds: () => false, cancel() {},
    at() { return o.at; },
    end() { A.ended = true; X.line(''); if (o.pit) backFromPit(X); },
    dbg() { return { id: m.id, stub: 1, t: +A.t.toFixed(2), shown: A.shown }; },
  };
}
