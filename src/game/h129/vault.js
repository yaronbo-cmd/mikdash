/* ── build 129 ── h129/vault.js — (skeleton: filled in the next units) */
import { BOOK } from '../world/grid.js';
const S7 = BOOK.s07;
export const VAULT = {
  icon: '🏛', title: 'vault',
  walkLine: () => '',
  stand(m) { const s = 'vault' === 'gazit' ? S7.gazit.stand : 'vault' === 'night' ? S7.night.hearth : m && m.id === 'vaultS' ? S7.vault.standS : m && m.id === 'vaultM' ? S7.vault.deck.stand : S7.vault.standN; return { x: s[0], z: s[1], face: [s[0], s[1] + 1] }; },
  prepare() {},
  make(m, X) { let t = 0, done = false; return { begin() {}, update(dt) { t += dt; if (t > 1 && !done) { done = true; X.end({ stars: 2, q: 0.75, pts: 20, at: { x: 0, y: 16, z: 0 } }); } }, down() {}, move() {}, up() {}, end() {}, at() { return null; }, dbg() { return { t }; }, wants() { return false; }, holds() { return false; }, cancel() {} }; },
};
