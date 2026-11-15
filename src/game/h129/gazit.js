/* ── build 129 ── h129/gazit.js — (skeleton: filled in the next unit) */
import { BOOK } from '../world/grid.js';
const S7 = BOOK.s07;
export const GAZIT = {
  icon: '⚖', title: 'לשכת הגזית',
  walkLine: () => '',
  stand() { const s = S7.gazit.stand; return { x: s[0], z: s[1], face: [s[0], s[1] + 4] }; },
  prepare() {},
  make(m, X) { let t = 0, done = false; return { begin() {}, update(dt) { t += dt; if (t > 1 && !done) { done = true; X.end({ stars: 2, q: 0.75, pts: 20 }); } }, down() {}, move() {}, up() {}, end() {}, at() { return null; }, dbg() { return { t }; }, wants() { return false; }, holds() { return false; }, cancel() {} }; },
};
