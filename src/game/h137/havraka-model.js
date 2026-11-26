/* ── build 137 ── h137/havraka-model.js — the finale "ההברקה האחרונה" (spec docs/specs/shlav-14-he.md v3, הסיום). Pure.
 * The last seam on the south wall: LEN dp on the screen, along its own x (0 → LEN); its first half plain, its second in relief (the
 * turn at the middle). The agate is ≥ 144 dp long, two grips 56 dp at its ends: the work hand's grip leads along the seam; the helper's
 * grip turns the stone (its angle from the line between the grips, up to 20°). One continuous stroke: the work grip from the seam's
 * start to its end without lifting; its distance from the seam ≤ DEV all the way; past the middle the stone turned to RELIEF ± ANG_TOL.
 *   40 = one stroke, within DEV, the turn right; 20 = a small stray (≤ 2 × DEV) or the turn off; 10 = he lifted and went on (a part
 *   again). No clock, no cost for tries (spec: "אין שעון ואין קנס על ניסיונות"). */
export const HV = Object.freeze({ LEN: 180, DEV: 8, RELIEF: 15, ANG_TOL: 5, MAX_ANG: 20, START: 14 });
export function fresh() { return { t: 0, x: 0, done: false, on: false, strokes: 0, maxDev: 0, angBad: 0, angN: 0, angOk: 0, lifted: false, ev: [], grade: null, path: [] }; }
/** inp: { tip: { x, y, down } (the work grip in the seam's frame, dp), ang (the stone's turn, deg) } */
export function step(S, dt, inp = {}) {
  S.ev = []; S.t += dt; if (S.done) return S.ev;
  const p = inp.tip;
  if (!p || !p.down) { if (S.on) { S.on = false; if (S.x > HV.START) { S.lifted = true; S.ev.push({ k: 'lift', x: S.x }); } } return S.ev; }
  if (!S.on) {
    if (S.x <= HV.START ? p.x > HV.START + 8 || Math.abs(p.y) > HV.DEV * 3 : Math.abs(p.x - S.x) > 24 || Math.abs(p.y) > HV.DEV * 3) return S.ev;   // (a stroke starts at the seam's start, or where it stopped)
    S.on = true; S.strokes++; S.ev.push({ k: 'start', x: S.x });
  }
  if (p.x > S.x) {
    const dev = Math.abs(p.y); S.maxDev = Math.max(S.maxDev, dev);
    if (p.x > HV.LEN / 2) { const a = inp.ang || 0; S.angN++; if (Math.abs(a - HV.RELIEF) <= HV.ANG_TOL) S.angOk++; }
    else { const a = inp.ang || 0; if (Math.abs(a) > HV.ANG_TOL + 3) S.angBad++; }
    S.x = Math.min(HV.LEN, p.x); S.path.push([+S.x.toFixed(1), +p.y.toFixed(1)]);
    if (dev > HV.DEV * 3) { S.on = false; S.lifted = true; S.ev.push({ k: 'off', x: S.x }); }
  }
  if (S.x >= HV.LEN) {
    S.done = true;
    const turn = S.angN ? S.angOk / S.angN >= 0.7 : false;
    S.grade = S.lifted || S.strokes > 1 ? 'ok' : S.maxDev <= HV.DEV && turn && S.angBad < 6 ? 'gold' : S.maxDev <= HV.DEV * 2 ? 'good' : 'ok';
    S.ev.push({ k: 'done', grade: S.grade, dev: +S.maxDev.toFixed(1), turn });
  }
  return S.ev;
}
export function bot(S, o = {}) {
  const x = Math.min(HV.LEN, S.x + (o.v || 120) / 60), y = (o.dev || 0) * Math.sin(x / 20);
  return { tip: { x: S.on || S.x < 1 ? x : 0, y, down: true }, ang: x > HV.LEN / 2 ? HV.RELIEF + (o.angErr || 0) : 0 };
}
