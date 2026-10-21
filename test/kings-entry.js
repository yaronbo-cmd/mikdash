// KINGS DOM harness entry (bundled by test/kings.cjs): scenes over a plain page, no 3D world.
import * as K from '../src/kings/index.js';

const MIN = 60000;
export const T = Date.UTC(2026, 8, 27, 9, 0, 0);
function base() {
  return { res: { silver: 260, cedar: 40, bronze: 0, gold: 20, stone: 100 }, st: { har: { done: true }, wall: { done: true }, nashim: { done: true } } };
}
function busy(G, skip = []) {
  const at = (id, ago) => { if (!skip.includes(id)) { const r = K.accept(G, id, T - ago * MIN); if (!r.ok) throw new Error(id + ' ' + r.why); } };
  K.ensure(G).rel.tyre = 3; K.ensure(G).seals.tyre = T - 900 * MIN;
  at('tyre_raft', 20); at('rome_embassy', 60); at('petra_small', 55); at('nik_doors', 170); at('adi_first', 125);
  K.settle(G, T);
  return G;
}
const SCENES = {
  map: () => busy(base()),
  court: () => busy(base(), ['tyre_raft']),
  fresh: () => ({ res: { silver: 100, cedar: 0 } }),
};
window.KH = {
  K, T,
  open(name, extra = {}) {
    const G = SCENES[name](); window.__G = G; window.__EV = []; window.__SFX = [];
    let t = T; window.__setNow = (x) => { t = x; };
    window.__done = K.openCourt({
      G, now: () => t, demo: false,
      apply: (d) => K.applyRes(G, d),
      onEvent: (n, d) => window.__EV.push([n, d]),
      sfx: { play: (n) => window.__SFX.push(n) },
      ...extra,
    }).then((r) => { window.__result = r; return r; });
    return true;
  },
};
