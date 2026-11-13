// build 126 (rule 65): a snapshot of the places of stages 01–04 as the code makes them — every exported table of the stages' models,
// worlds and acts, every act's stand for every mission of its stage plan, and the frames the acts build on (stretches, bays, gates).
// Run in node from the modules, no page: `node tools/snap126.mjs > test/h126-snapshot.json`. test/h126-snapshot.test.mjs compares
// the running code with the committed file number for number, so moving a number's home into the book (world/grid.js BOOK) can
// never move the place itself.
const R = new URL('../src/game/', import.meta.url).href;
const STAGES = {
  s01: { dir: 'h109', mods: ['acts', 'model', 'slope', 'acts2', 'acts3'], fresh: 'freshH109' },
  s02: { dir: 'h111', mods: ['acts', 'model', 'stakes', 'bond', 'world', 'acts2'], fresh: 'freshH111' },
  s03: { dir: 'h112', mods: ['acts', 'model', 'world', 'acts2'], fresh: 'freshH112' },
  s04: { dir: 'h113', mods: ['acts', 'model', 'world', 'acts2', 'acts3'], fresh: 'freshH113' },
};
// (numbers kept to 9 significant places: a moved constant that is the same number gives the same text; no float noise is a change)
const num = (v) => (Number.isFinite(v) ? +v.toPrecision(9) : String(v));
function plain(v, seen = new Set(), d = 0) {
  if (typeof v === 'number') return num(v);
  if (v == null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'function' || d > 6 || seen.has(v)) return undefined;
  if (typeof v !== 'object') return undefined;
  if (v.isObject3D || v.isMaterial || v.isBufferGeometry || v.isTexture) return undefined;
  seen.add(v);
  if (Array.isArray(v)) return v.map((x) => plain(x, seen, d + 1));
  const o = {};
  for (const k of Object.keys(v).sort()) { const x = plain(v[k], seen, d + 1); if (x !== undefined) o[k] = x; }
  return o;
}
const stub = (st) => {
  const X = { M: { st }, ground: () => 0, level: () => 1, heroAt: () => null, THREE: null, stages: {}, scr: () => ({ x: 0, y: 0, on: true }) };
  return X;
};
export async function snapshot() {
  const out = {};
  for (const [sk, S] of Object.entries(STAGES)) {
    const E = {}, mods = {};
    for (const m of S.mods) { try { mods[m] = await import(`${R}${S.dir}/${m}.js`); } catch (e) { E[m] = 'IMPORT ' + e.message; } }
    // every exported table (functions are called below where they make places)
    for (const [m, M] of Object.entries(mods)) for (const k of Object.keys(M).sort()) { const v = plain(M[k]); if (v !== undefined && !(typeof M[k] === 'object' && M[k] && Object.keys(v).length === 0 && !Array.isArray(v))) E[`${m}.${k}`] = v; }
    // every act's stand for every mission of the plan
    const model = mods.model, ACTS = (mods.acts && mods.acts.ACTS) || {}, st = model && model[S.fresh] ? model[S.fresh]() : {};
    const stands = {};
    for (const m of (model && model.PLAN) || []) {
      const A = ACTS[m.k]; if (!A || typeof A.stand !== 'function') continue;
      let v; try { v = plain(A.stand(m, stub(st))); } catch (e) { v = 'n/a'; }
      stands[m.id] = v === undefined ? null : v;
    }
    E['stands'] = stands;
    out[sk] = E;
  }
  // the frames the acts build on
  try {
    const W2 = await import(`${R}h111/world.js`), M2 = await import(`${R}h111/model.js`), F = {};
    for (let s = 1; s <= M2.STRETCH.length; s++) { const f = W2.frameOf(s); F[s] = plain({ ...f, a0: f.at(0, 0), a1: f.at(f.G, 0), a2: f.at(-1.4, 0.4), a3: f.at(f.G / 2, -3) }); }
    for (const s of Object.keys(M2.GIANT)) { const f = W2.giantFrame(+s); F['giant' + s] = plain({ ...f, a0: f.at(0, 0), a1: f.at(-1.6, -2.2) }); }
    F.holes = plain(W2.holeRects()); out.s02['frames'] = F;
  } catch (e) { out.s02['frames'] = 'ERR ' + e.message; }
  try {
    const W3 = await import(`${R}h112/world.js`), M3 = await import(`${R}h112/model.js`), F = {}, st = M3.freshH112();
    for (const lv of Object.keys(M3.RUNS)) { const ps = M3.runPosts(+lv, st); F['posts' + lv] = plain(ps); const R0 = M3.RUNS[lv]; (R0.bays || []).forEach(([a, b], i) => { F[`bay${lv}.${i}`] = plain(W3.bayFrame(+lv, a, b, ps)); }); F['run' + lv] = plain(W3.runS(+lv)); }
    F.holes = plain(W3.holeRects()); F.flight = [num(W3.flightFloor(158, 0)), num(W3.flightFloor(160, 2))]; out.s03['frames'] = F;
  } catch (e) { out.s03['frames'] = 'ERR ' + e.message; }
  try {
    const W4 = await import(`${R}h113/world.js`), M4 = await import(`${R}h113/model.js`), F = {};
    for (const [lv, G] of Object.entries(M4.GATES)) { const f = W4.frameOf(G); F['gate' + lv] = plain({ ...f, out: [f.out(0), f.out(1.5), f.out(5.3)], in: [f.in(0), f.in(3.4), f.in(6.2)], bed: W4.LINTEL_BED(G), keep: W4.gateKeep(G), pivot: [W4.pivotX(G, -1), W4.pivotX(G, 1)], sock: [M4.socketAt(+lv, -1), M4.socketAt(+lv, 1)] }); }
    M4.SOUTH.forEach((G, i) => { const f = W4.frameOf(G); F['south' + i] = plain({ ...f, out: [f.out(0), f.out(3)], in: [f.in(0), f.in(3)] }); });
    F.holes = plain(W4.holeRects()); F.pass = [num(W4.passFloor(-38, -78)), num(W4.passFloor(-95, 78)), num(W4.passFloor(3, 0))]; out.s04['frames'] = F;
  } catch (e) { out.s04['frames'] = 'ERR ' + e.message; }
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) snapshot().then((s) => process.stdout.write(JSON.stringify(s, null, 1) + '\n'));
