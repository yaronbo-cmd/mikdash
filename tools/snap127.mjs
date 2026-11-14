// build 127 (rule 65): the snapshot of stage 05's places as the code makes them, and what build 126's snapshot of stage 01 missed.
// Like tools/snap126.mjs: every data export of the h120 modules (the film's too: it must not change), every act's stand for every
// mission and every free unit, the routes (the ways, the marks, the obstacles, the lane, the movers), the columns' frames, the floor
// of the lepers' chamber and its reference ways, the pack's own shots (its end film and its opening, played on a recording stub).
// Stage 01: its other modules' data, the courses' stands for every course, free ones too. Run in node, no page:
// `node tools/snap127.mjs > test/h127-snapshot.json`; test/h127-snapshot.test.mjs holds the running code to it number for number.
const R = new URL('../src/game/', import.meta.url).href;
const num = (v) => (Number.isFinite(v) ? +v.toPrecision(9) : String(v));
let BOOK0 = null;
function plain(v, seen = new Set(), d = 0) {
  if (BOOK0 && v === BOOK0) return 'BOOK';
  if (typeof v === 'number') return num(v);
  if (v == null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'function' || d > 7 || seen.has(v)) return undefined;
  if (typeof v !== 'object') return undefined;
  if (v.isObject3D || v.isMaterial || v.isBufferGeometry || v.isTexture) return undefined;
  seen.add(v);
  if (Array.isArray(v)) return v.map((x) => plain(x, seen, d + 1));
  const o = {};
  for (const k of Object.keys(v).sort()) { const x = plain(v[k], seen, d + 1); if (x !== undefined) o[k] = x; }
  return o;
}
const exportsOf = (E, m, M) => { for (const k of Object.keys(M).sort()) { const v = plain(M[k]); if (v !== undefined && !(typeof M[k] === 'object' && M[k] && !Array.isArray(v) && Object.keys(v).length === 0)) E[`${m}.${k}`] = v; } };
const stub = (st) => ({ M: { st }, ground: () => 0, level: () => 1, heroAt: () => null, THREE: null, stages: {}, scr: () => ({ x: 0, y: 0, on: true }) });
const tryP = (f) => { try { return plain(f()); } catch (e) { return 'ERR ' + e.message; } };

export async function snapshot() {
  BOOK0 = (await import(`${R}world/grid.js`)).BOOK;
  const out = {};
  /* ── stage 05 ── */
  {
    const E = {}, mods = {};
    for (const m of ['layout', 'model', 'routes', 'acts', 'acts2', 'acts3', 'acts4', 'acts5', 'world', 'look120', 'load', 'water120', 'sound120', 'pack', 'film', 'filmsound']) { try { mods[m] = await import(`${R}h120/${m}.js`); } catch (e) { E[m] = 'IMPORT ' + e.message; } }
    for (const [m, M] of Object.entries(mods)) exportsOf(E, m, M);
    const M = mods.model, RT = mods.routes, W = mods.world, ACTS = mods.acts.ACTS, st = M.freshH120();
    // every act's stand: the plan's missions and every free unit of every kind
    const stands = {};
    for (const m of M.PLAN) stands[m.id] = tryP(() => ACTS[m.k].stand(m, stub(st)));
    for (const id of [...M.COL_IDS.map((c) => 'colF:' + c), ...M.BEAMS.flatMap((b) => ['sawF:' + b.id, 'carryF:' + b.id])]) { const m = M.freeOf(id); if (m && ACTS[m.k]) stands[id] = tryP(() => ACTS[m.k].stand(m, stub(st))); }
    E.stands = stands;
    // the routes
    const RO = {};
    for (const lv of [1, 2, 3]) for (const L of [10, 11, 11.45, 12.3]) {
      RO[`way${lv}@${L}`] = tryP(() => RT.carryWay(lv, L)); RO[`start${lv}@${L}`] = tryP(() => RT.carryStart(lv, L)); RO[`mark${lv}@${L}`] = tryP(() => RT.markOf(lv, L));
    }
    for (const lv of [1, 2, 3]) {
      RO['obs' + lv] = tryP(() => RT.carryObs(lv, {}));
      RO['obsDown' + lv] = tryP(() => RT.carryObs(lv, { stands: () => false, jarsBroken: new Set([0]), scafDown: new Set([1]), scafHard: new Set([0, 2]), workerAt: [70, 0] }));
      RO['pass' + lv] = tryP(() => RT.passOf(lv));
      for (const t of [0, 3.3, 17.9, 40]) for (const k of [0, 1]) RO[`mover${lv}.${k}@${t}`] = tryP(() => RT.moverAt(lv, k, t));
    }
    for (let s = 0; s <= 50; s += 2.5) { RO['lane@' + s] = tryP(() => RT.laneAt(s)); RO['shape@' + s] = tryP(() => [RT.laneShape('sledge', s, 1), RT.laneShape('cart', s, -1)]); }
    for (const t of [0, 7, 31, 66, 120]) RO['state@' + t] = tryP(() => [RT.laneState(t, 'sledge'), RT.laneState(t, 'cart')]);
    E.routes = RO;
    // the frames: the columns as they stand and lie, the bays' ways
    const FR = {};
    for (const id of M.COL_IDS) FR['col' + id] = tryP(() => W.colFrame(id));
    for (const lv of [1, 2, 3]) FR['bay' + lv] = tryP(() => M.bayDir(lv));
    E.frames = FR;
    // the floor of the lepers' chamber (its rises, its fall to the lime pit) and the reference ways of the mikveh
    const FL = [];
    for (let x = 6; x <= 44; x += 0.9) for (let z = -67.5; z <= -29.5; z += 0.9) FL.push(num(M.floorH(x, z)));
    E.floor = FL;
    const WY = {};
    for (const lv of [1, 2, 3]) { WY['in' + lv] = tryP(() => M.refChannel(lv, 'in')); WY['straight' + lv] = tryP(() => M.straightChannel(lv, 'in')); }
    WY.over3 = tryP(() => M.refChannel(3, 'over'));
    E.ways = WY;
    // the pack: its data, and its opening's shots on a recording stub
    try {
      const P = mods.pack.makePack05(); E['pack.P'] = plain(P);
      const shots = [], X = { shot: (p, t, d) => shots.push(plain([p, t, d])), line: () => {}, save: () => {}, wait: () => Promise.resolve(), stages: { setWork() {} }, props: null };
      const run = P.before(null, X, { st: {} }); if (run && run.then) await run;
      E['pack.opening'] = shots;
    } catch (e) { E['pack.opening'] = 'ERR ' + e.message; }
    out.s05 = E;
  }
  /* ── stage 01: what build 126's snapshot did not hold ── */
  {
    const E = {};
    for (const m of ['paving', 'wedges', 'grips', 'look', 'kit', 'rock', 'props', 'director']) { try { exportsOf(E, m, await import(`${R}h109/${m}.js`)); } catch (e) { E[m] = 'IMPORT ' + e.message; } }
    const A3 = await import(`${R}h109/acts3.js`), MD = await import(`${R}h109/model.js`), st = MD.freshH109 ? MD.freshH109() : {};
    for (let c = 0; c < 8; c++) E['courseStand' + c] = tryP(() => A3.COURSE.stand({ k: 'course', c }, stub(st)));
    E.cornerStand = tryP(() => A3.CORNER.stand({ k: 'corner' }, stub(st)));
    E.lettersStand = tryP(() => A3.LETTERS.stand({ k: 'letters' }, stub(st)));
    out.s01x = E;
  }
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) snapshot().then((s) => process.stdout.write(JSON.stringify(s, null, 1) + '\n'));
