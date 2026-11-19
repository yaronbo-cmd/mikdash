// build 128: the snapshot of stage 06's exports as the code makes them (for later builds to hold to): the pack's sea flag and works,
// every act's stand for every mission and every free ring, the model's tables (the notches, the three rings' plans, the bolts, the
// leaves, the capstan), the book's cameras and places of the stage. Run in node, no page:
// `node tools/snap128.mjs > test/h128-snapshot.json`; test/h128-snapshot.test.mjs holds the running code to it.
const R = new URL('../src/game/', import.meta.url).href;
const num = (v) => (typeof v === 'number' ? (Number.isFinite(v) ? +v.toPrecision(9) : String(v)) : v);
const deep = (o) => (Array.isArray(o) ? o.map(deep) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v !== 'function').map(([k, v]) => [k, deep(v)])) : num(o));
export async function snap128() {
  const A = await import(R + 'h128/acts.js'), P = await import(R + 'h128/pack.js'), Mo = await import(R + 'h128/model.js'), G = await import(R + 'world/grid.js');
  const stands = {};
  for (const m of Mo.PLAN) stands[m.id] = A.ACTS[m.k].stand(m);
  for (let i = 2; i <= 14; i++) { const f = Mo.freeOf('ringF:' + i); if (f) stands[f.id] = A.ACTS.steps.stand(f); }
  const rings = {}; for (const i of [1, 8, 15]) { const p = Mo.ringPlan(i); rings[i] = { G: p.G, C: p.C, n: p.n, sol: p.sol, below: p.below, tol: p.tol, lag: p.lag, yard: p.yard }; }
  const B = G.BOOK.s06;
  return deep({ sea: P.SEA_IN_PLAY, plan: Mo.PLAN, kinds: Mo.KINDS, titles: Object.fromEntries(Mo.KINDS.map((k) => [k, A.ACTS[k].title])), stands, notch: Mo.NOTCH_D, cap: Mo.CAP, rings, bolts: Mo.BOLT_LV, leaf: Mo.LEAF, lines: Mo.LINES, quick: Mo.QUICK, loss: Mo.LOSS,
    book: { gate: B.gate, ramp: B.ramp, capstan: B.capstan, steps: B.steps, wicket: B.wicket, close: B.close, levites: B.levites, cam: B.cam } });
}
if (import.meta.url === `file://${process.argv[1]}`) console.log(JSON.stringify(await snap128(), null, 1));
