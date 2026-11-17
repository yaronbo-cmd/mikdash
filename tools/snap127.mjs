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
  /* ── stage 05: build 130 removed the old stage 05 (h120) — its snapshot went with it ── */
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
