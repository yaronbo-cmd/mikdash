/* ── build 96 ── voyage96.js — the doors' voyage made a game (the owner, 4.11 04:47, on build 95: the sea leg has no game, "maybe light
 * navigation … a compass to the port … a small map"; the storm's "same wave" jumps back instead of going on; the cargo is never seen
 * falling; the thumbs do nothing seen on the ship; balance alone is fun for 10–20 s, the act wants minutes with challenges in between).
 * Pure logic, no THREE: the sea leg (createNav96: the steering oar, the yard braced to the wind, a wind that shifts, a current, a shoal),
 * the approach into Acre between its moles (the same, with a mouth), and the storm that goes on (createStorm96: no replay — a beaten
 * wave costs a crate over the side and the voyage goes on). The story is Yoma 38a; the route, the winds, the shoal and the moles are
 * המחשה. Never a Divine Name. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const R = Math.PI / 180;
/** an angle to −180…180 */
export const norm180 = (a) => { a = ((a + 180) % 360 + 360) % 360 - 180; return a === -180 ? 180 : a; };

/* ───────── the sea leg ───────── */
export const NAV96 = Object.freeze({
  bearing: 62,                 // the course from Alexandria to Acre, compass degrees (המחשה)
  leg: 1300,                   // the sea leg's length (the voyage's amot, at its scale)
  vMax: 15,                    // the best speed (amot/s)
  tau: 1.8,                    // the ship gathers or loses way (s)
  turn: 20,                    // degrees/s at full helm and full way
  fall: 9,                     // in irons the bow pays off from the wind (deg/s)
  irons: 60,                   // closer to the wind than this (deg off the bow) the square sail cannot draw
  braceMax: 70,                // the yard braced at most this far round (deg)
  good: 0.6,                   // sailing "well": the sail drawing at least this much of the best
  winds: Object.freeze([Object.freeze({ at: 0, from: 300 }), Object.freeze({ at: 0.36, from: 340 }), Object.freeze({ at: 0.72, from: 255 })]),
  shoal: Object.freeze({ at: 0.55, r: 55 }),
  L: Object.freeze([
    Object.freeze({ hint: true, drift: 0, tol: 34 }),
    Object.freeze({ hint: false, drift: 2.2, tol: 26 }),
    Object.freeze({ hint: false, drift: 3.6, tol: 20 }),
  ]),
});
/** how much a square sail draws with the wind `rel` degrees off the bow (0: dead ahead … 180: dead astern) */
export function pointOfSail96(rel) {
  const a = Math.abs(rel);
  if (a < NAV96.irons) return 0;
  if (a < 90) return 0.3 + 0.55 * (a - NAV96.irons) / (90 - NAV96.irons);
  if (a < 150) return 0.85 + 0.15 * (a - 90) / 60;
  return 1 - 0.08 * (a - 150) / 30;
}
/** the yard's best brace for the wind `rel` off the bow: square across with the wind astern, braced round as it comes forward */
export const braceFor96 = (rel) => Math.sign(rel || 1) * clamp((180 - Math.abs(rel)) * 0.62, 0, NAV96.braceMax);
/** the sail's draw for a brace `b` against the best `b0`: full within `tol`, falling off past it (it shivers, then backs) */
export const trim96 = (b, b0, tol) => { const e = Math.abs(b - b0); return e <= tol ? 1 : clamp(1 - (e - tol) / 45, 0, 1); };

/**
 * createNav96(i, o): i = the level (0…2); o = { leg, winds, shoal, port: { gap } } to override (the approach into Acre). The ship's place
 * on the course: x along it, y to its left; its heading `hdg` (compass); the helm `rud` (−1 port … 1 starboard) and the brace `brace`
 * (degrees) are his. step(dt) → null | 'shoal' | 'wind' | 'bump' | 'done'.
 */
export function createNav96(i = 0, o = {}) {
  const P = NAV96, Lv = P.L[clamp(i | 0, 0, P.L.length - 1)], leg = o.leg || P.leg, winds = o.winds || P.winds, shoal = o.shoal === undefined ? P.shoal : o.shoal;
  const k = { L: i | 0, x: 0, y: 0, hdg: o.hdg != null ? o.hdg : P.bearing, rud: 0, brace: 0, v: o.v0 != null ? o.v0 : P.vMax * 0.6, from: winds[0].from, wi: 0,
    draw: 0, ps: 0, tr: 0, best: 0, t: 0, goodX: 0, hits: 0, bumps: 0, irons: 0, done: false, q: null, hitAt: -1 };
  function helm(r) { k.rud = clamp(+r || 0, -1, 1); }
  function braceTo(b) { k.brace = clamp(+b || 0, -P.braceMax, P.braceMax); }
  /** the wind off the bow: + from the starboard side, − from the port side */
  const rel = () => norm180(k.from - k.hdg);
  function step(dt) {
    if (k.done) return 'done';
    k.t += dt; let ev = null;
    const p = k.x / leg; while (k.wi + 1 < winds.length && p >= winds[k.wi + 1].at) { k.wi++; k.from = winds[k.wi].from; ev = 'wind'; }
    const r = rel(); k.ps = pointOfSail96(r); k.best = braceFor96(r); k.tr = trim96(k.brace, k.best, Lv.tol); k.draw = k.ps * k.tr;
    k.irons = k.ps === 0 ? k.irons + dt : 0;
    if (k.ps === 0) k.hdg = (k.hdg - Math.sign(r || 1) * P.fall * dt + 360) % 360;   // (in irons she pays off by herself: never stuck)
    const vT = P.vMax * k.draw; k.v += (vT - k.v) * Math.min(1, dt / P.tau);
    k.hdg = (k.hdg + k.rud * P.turn * (0.35 + 0.65 * k.v / P.vMax) * dt + 360) % 360;
    const th = norm180(k.hdg - P.bearing) * R;
    k.x += k.v * Math.cos(th) * dt; k.y += (-k.v * Math.sin(th) - Lv.drift) * dt;
    if (k.draw >= P.good) k.goodX += Math.max(0, k.v * Math.cos(th) * dt);
    if (shoal && k.hitAt < 0) { const sx = shoal.at * leg; if (Math.hypot(k.x - sx, k.y) < shoal.r) { k.hits++; k.hitAt = k.t; k.v *= 0.25; ev = 'shoal'; } }
    if (o.port && k.x >= leg) {
      if (Math.abs(k.y) <= o.port.gap) return finish();
      k.bumps++; k.x = leg - 70; k.y *= 0.5; k.v = 3; k.hdg = P.bearing; return 'bump';
    }
    if (!o.port && k.x >= leg) return finish();
    return ev;
  }
  function finish() {
    k.done = true; k.x = Math.min(k.x, leg);
    if (o.port) k.q = k.bumps === 0 ? 1 : k.bumps <= 2 ? 0.5 : 0;
    else { const good = k.goodX / leg; k.good = good; k.q = good >= 0.7 && k.hits === 0 ? 1 : good >= 0.4 && k.hits <= 1 ? 0.5 : 0; }
    return 'done';
  }
  /** the shoal's place relative to the ship, in the ship's course frame (x ahead along the course, y to its left), or null */
  const shoalAt = () => (shoal ? { x: shoal.at * leg - k.x, y: -k.y, r: shoal.r } : null);
  return { helm, braceTo, step, rel, shoalAt, state: () => k, P, Lv, leg, port: o.port || null };
}

/* ───────── the storm, going on ───────── */
/** each wave: its side d (+ the deck dips to starboard), its strength s, a double push (two humps), a cross (the push turns over half-way),
 *  ropes (the cargo strains: the right thumb must hold), the throw (the sailors' scene), the hug (the last: on the door). The heel h
 *  integrates the push and the left thumb's balance b: dh/dt = K·(p + b) − D·h. Past the line: counted. Beaten (|h| ≥ 1): a crate over
 *  the side, the wave spent — the storm goes on. Ropes let go too long in a push: the cargo slides — a crate over. In the hug, let go
 *  and the sailors drag the door toward the rail; held, it comes back — it never goes over (the story), but it counts. */
export const STORM96 = Object.freeze({
  K: 2.4, D: 1.2, line: 0.55, beat: 1, tele: 1.4, push: 2.3, rest: 0.8, throwT: 4.2, slack: 1.2, takeUp: 0.25, hugSlack: 0.35, crates: 6,
  str: Object.freeze([0.8, 0.92, 1.05]),
  waves: Object.freeze([
    Object.freeze({ d: 1 }), Object.freeze({ d: -1 }), Object.freeze({ d: 1, ropes: true }), Object.freeze({ throw: true }),
    Object.freeze({ d: -1, double: true }), Object.freeze({ d: 1, cross: true }), Object.freeze({ d: -1, s: 1.15, ropes: true }),
    Object.freeze({ d: 1, double: true, cross: true }), Object.freeze({ d: -1, s: 1.2 }), Object.freeze({ d: 1, s: 1.2, hug: true }),
  ]),
});
export function createStorm96(i = 0, o = {}) {
  const P = STORM96, W = o.waves || P.waves, last = W.length - 1, sL = P.str[clamp(i | 0, 0, P.str.length - 1)];
  const k = { L: i | 0, i: 0, ph: W[0].throw ? 'throw' : 'tele', t: 0, h: 0, b: 0, p: 0, hold: false, held: 0, slackT: 0, crossed: false, crossings: 0,
    lost: 0, crates: P.crates, beaten: 0, slid: 0, thrown: false, hug: false, door: 0, doorMax: 0, done: false, q: null, ev: null };
  const wv = () => W[k.i] || {};
  function balance(b) { k.b = clamp(+b || 0, -1, 1); }
  function holdOn(on) { if (on && !k.hold) k.held = 0; k.hold = !!on; }
  const holding = () => k.hold && k.held >= P.takeUp;
  /** the push of the current wave at u (0…1 of its push) */
  function push(u) {
    const w = wv(), s = (w.s || 1) * sL; let f = w.double ? Math.abs(Math.sin(2 * Math.PI * u)) : Math.sin(Math.PI * u);
    let d = w.d || 0; if (w.cross && u > 0.5) d = -d;
    return d * s * f;
  }
  function lose(why) { if (k.crates > 0) { k.crates--; k.lost++; } k.ev = why; }
  function next() {
    k.t = 0; k.crossed = false; k.slackT = 0;
    if (k.i >= last) { finish(); return; }
    k.i++; k.ph = wv().throw ? 'throw' : 'tele'; k.hug = !!wv().hug;
  }
  function step(dt) {
    k.ev = null; if (k.done) return null;
    if (k.hold) k.held += dt; k.t += dt; k.hug = !!wv().hug;
    if (k.ph === 'throw') { k.h *= Math.max(0, 1 - dt * 2); k.p = 0; if (k.t >= P.throwT) { k.thrown = true; next(); } return k.ev; }
    const pl = wv().double ? P.push * 1.5 : P.push, u = k.ph === 'push' ? Math.min(1, k.t / pl) : 0;
    k.p = k.ph === 'push' ? push(u) : 0;
    k.h += (P.K * (k.p + k.b) - P.D * k.h) * dt;
    if (k.ph === 'push') {
      const needRopes = wv().ropes || wv().hug || (wv().s || 1) * sL >= 1;
      if (!holding()) k.slackT += dt; else k.slackT = Math.max(0, k.slackT - dt * 2);
      if (k.hug) { k.door = clamp(k.door + (k.slackT > P.hugSlack ? dt * 0.5 : -dt * 0.6), 0, 1); k.doorMax = Math.max(k.doorMax, k.door); }
      else if (needRopes && k.slackT > P.slack) { lose('slid'); k.slid++; k.slackT = 0; }
      if (Math.abs(k.h) > P.line && !k.crossed) { k.crossed = true; k.crossings++; }
      if (Math.abs(k.h) >= P.beat) { k.beaten++; if (!k.hug) lose('beat'); else k.ev = 'beat'; k.h = Math.sign(k.h) * 0.6; k.ph = 'rest'; k.t = 0; return k.ev; }
    } else if (k.hug) k.door = clamp(k.door - dt * 0.6, 0, 1);
    if (k.ph === 'tele' && k.t >= P.tele) { k.ph = 'push'; k.t = 0; }
    else if (k.ph === 'push' && k.t >= pl) { k.ph = 'rest'; k.t = 0; }
    else if (k.ph === 'rest' && k.t >= P.rest) next();
    return k.ev;
  }
  function finish() {
    k.done = true; k.hug = false;
    const f = k.lost + (k.doorMax > 0.5 ? 1 : 0) + (k.crossings > 3 ? 1 : 0);
    k.q = f === 0 ? 1 : f <= 2 ? 0.5 : 0;
  }
  return { balance, holdOn, step, state: () => k, P, wave: wv, dirAt: () => (wv().d || 0), push };
}

/* ───────── the map: Alexandria to Acre (המחשה) ───────── */
/** the coast and the two ports on a 0…1 map (x east, y south), and the ship's place on it for the voyage's progress 0…1 */
export const MAP96 = Object.freeze({
  coast: Object.freeze([[0, 0.62], [0.1, 0.6], [0.2, 0.66], [0.32, 0.7], [0.42, 0.72], [0.52, 0.74], [0.62, 0.76], [0.7, 0.74], [0.76, 0.66], [0.8, 0.54], [0.84, 0.42], [0.87, 0.3], [0.9, 0.18], [0.93, 0.05]]),
  alex: Object.freeze([0.08, 0.6]), acre: Object.freeze([0.88, 0.24]),
});
export function mapAt96(p, lat = 0) {
  const [ax, ay] = MAP96.alex, [bx, by] = MAP96.acre, u = clamp(p, 0, 1), bow = Math.sin(Math.PI * u) * 0.09;   // (the route bows out to sea, away from the coast)
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), nx = dy / L, ny = -dx / L;   // (the normal to the left of the course: out to sea)
  return [ax + dx * u + nx * (bow + lat), ay + dy * u + ny * (bow + lat)];
}
