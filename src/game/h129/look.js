/* ── build 129 ── h129/look.js — the Golah's water look sample (brief §3; page flag window.__H129_WATER_LOOK = true): no play, a loop of
 * twenty seconds, for the owner to judge the water on his tablet before it is coded into the game.
 *   0–7 s     down the shaft from its lit side: the full bucket comes up hand over hand (the wheel turns in pulls, the empty one goes
 *             down past it and breaks into the water), a broken stream of drops falls from it all the way, each a ring on the well's water
 *   7–9.6 s   at the rim it hangs and drips on the stones; it is drawn over to the trough by the well
 *   9.6–13 s  the pour into the trough, seen from the side: one curved sheet, its spray, foam and rings, the trough heaving and filling
 *   10.6–15 s the water runs down the channel out through the door, turned east by the lowered sluice stone, heaping at the raised one
 *             and turning into its spur, over the lip into the basin
 *   14–20 s   the trough by the well empties and the water's tail follows down the channel: the stone it ran over stays dark and dries
 *             from its edges; the basin filling, its water line climbing, the low sun's glint sliding on it
 * A small frames-per-second number in a corner, the renderer's draw calls and triangles under it (this page only). The probe's eyes:
 * window.__H129_LOOK = { seek(t), bench(sec, t0), dbg(), frameAt(t) } and a small window.__T (booted, game.frame, simulate, render).
 * Every place is the book's (BOOK.s07.golah, .cam.look); the swing's period is the model's.
 */
import { BOOK } from '../world/grid.js';
import { LINES, H129, GOLAH } from './model.js';
import { createGolah3d, DEPTH } from './golah3d.js';

const LOOP = 20, GL = BOOK.s07.golah, F0 = GL.floor, CAM = BOOK.s07.cam.look;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sm = (a, b, t) => { const u = clamp((t - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const hash = (i, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const G = 20.4;   // gravity in amot/s² (9.81 m/s², an amah 0.48 m)
// the bucket (as golah3d draws it: the origin at the bail's top): its bottom, its body's middle, its rim, below the bail
const B_BOT = 1.32, B_MID = 0.92, B_RIM = 0.52, B_R = 0.5;
const [wx, wz] = GL.well, ZN = wz - H129.ROPE_OFF, ZS = wz + H129.ROPE_OFF, AXLE = F0 + GL.wheel.axle;
const [hx, hz] = GL.head, HB = F0 + 0.15, HTOP = F0 + GL.headSize[2];
// the trip: the full bucket's bottom from under the water to clear of the rim; eleven pulls (hand over hand), each eased over PULL s
const BOT0 = F0 - DEPTH - 0.35, BOT1 = F0 + GL.rimH + 0.35, NPULL = 11, T_PULL0 = 0.55, T_PULLD = 0.58, PULL = 0.36;
const T_OVER = [8.3, 9.6], T_TILT = [9.6, 11.0], T_BACK = [12.7, 13.5], T_POUR = [9.95, 12.6], T_RUN = 10.6, RUN_V = GOLAH.RUN;
// the trough by the well: where the bucket hangs over it to pour (its body's middle) and how far it tips (radians, its mouth to the north)
const OVER = [hx, F0 + 3.0, hz + 1.0], TILT = 1.85;
// the way the water runs (as golah3d's flow): its legs to the lowered stone's bend and to the raised stone, its length to the basin's lip
const [m0, m1] = GL.channel.main, LIP_Z = GL.troughs.B[1] + GL.troughSize[1] / 2, HO = m0[1] - GL.headSize[1] / 2;
const LEG_A = HO - m1[1], LEG_B = LEG_A + Math.abs(GL.sluice.B[0] - m1[0]), WAY = LEG_B + (m1[1] - LIP_Z);
const T_IN = T_RUN + WAY / RUN_V;
// when the trough by the well has emptied the water's tail follows down the channel (slower than the front): the stone behind it dries
const T_TAIL = T_POUR[1] + 1.4, TAIL_V = 4.2, T_TAIL_IN = T_TAIL + WAY / TAIL_V;

const pulls = (t) => { let s = 0; for (let k = 0; k < NPULL; k++) s += sm(0, 1, (t - (T_PULL0 + k * T_PULLD)) / PULL); return s / NPULL; };
const periodAt = (depth) => GOLAH.T0 + GOLAH.TL * (depth + GOLAH.HANG);
/** the full bucket: its body's middle and tilt at loop time t (the swing along x, calmed at every pull in the rhythm) */
function fullAt(t) {
  const p = pulls(t), bot = BOT0 + (BOT1 - BOT0) * p, depth = F0 - bot;
  const done = Math.max(0, Math.min(NPULL, Math.floor((t - T_PULL0) / T_PULLD) + 1));
  const A = t < T_PULL0 ? 0 : 0.34 * Math.pow(0.8, done) * Math.exp(-Math.max(0, t - T_PULL0) / 4) + 0.05 * sm(T_OVER[0], T_OVER[1], t) * (1 - sm(T_TILT[0], T_TILT[1], t));
  const w = (2 * Math.PI) / periodAt(Math.max(0, depth)), ph = w * Math.max(0, t - T_PULL0);
  let x = wx + A * Math.sin(ph), y = bot + B_BOT - B_MID, z = ZN;
  // drawn over to the trough by the well, tipped, brought back
  const o = sm(T_OVER[0], T_OVER[1], t) * (1 - sm(T_BACK[1] + 0.2, T_BACK[1] + 1.6, t));
  x += (OVER[0] - x) * o; z += (OVER[2] - z) * o; y += (OVER[1] - y) * o + 0.5 * Math.sin(Math.PI * clamp((t - T_OVER[0]) / (T_OVER[1] - T_OVER[0]), 0, 1));
  const tilt = -TILT * sm(T_TILT[0], T_TILT[1], t) * (1 - sm(T_BACK[0], T_BACK[1], t));
  const fill = t < T_POUR[0] ? 1 : 1 - sm(T_POUR[0], T_POUR[1], t);
  return { mid: [x, y, z], tilt, fill, swing: A * Math.sin(ph), swingV: A * w * Math.cos(ph), depth };
}
/** the bail's place for a body's middle at a tilt (the bucket turns about its body; the rope is tied at the bail) */
const bailOf = (mid, tilt) => [mid[0], mid[1] + B_MID * Math.cos(tilt), mid[2] + B_MID * Math.sin(tilt)];
/** a point of the bucket (local, below the bail) in the world, for a body's middle and tilt */
function local(mid, tilt, lx, ly, lz) { const b = bailOf(mid, tilt), c = Math.cos(tilt), s = Math.sin(tilt); return [b[0] + lx, b[1] + ly * c - lz * s, b[2] + ly * s + lz * c]; }

const WELL_Y = F0 - DEPTH;
const emptyBotAt = (t) => BOT0 + BOT1 - (BOT0 + (BOT1 - BOT0) * pulls(t));
// the empty bucket touches the water on its way down (the loop's one search, made once)
const T_TOUCH = (() => { for (let t = 0; t < LOOP; t += 0.01) if (emptyBotAt(t) < WELL_Y) return t; return LOOP; })();

/* the drops: a fixed schedule (rule 56) of drops off the full bucket's bottom and rim while it is out of the water and not pouring — a
 * broken stream all the way up; each falls from where the bucket was when it left, and lands on the well's water (a ring), the trough's,
 * the rim or the floor (a wet spot) */
const RATE = (t) => (t < T_PULL0 + 0.25 ? 0 : t < 2.4 ? 26 : t < 6.2 ? 16 : t < T_OVER[0] ? 9 : t < T_POUR[0] ? 5 : t < T_BACK[1] ? 0 : t < 15.5 ? 2 : 0);
const DRIPS = (() => {
  const L = []; let acc = 0, i = 0;
  for (let t = 0; t < LOOP; t += 1 / 120) { acc += RATE(t) / 120; while (acc >= 1) { acc -= 1; L.push(t + hash(i, 1) / 120); i++; } }
  return L.map((te, k) => {
    const f = fullAt(te), a = hash(k, 2) * Math.PI * 2, rim = hash(k, 5) < 0.3, r = rim ? B_R + 0.02 : 0.15 + 0.25 * hash(k, 3);
    const p = rim ? local(f.mid, f.tilt, Math.cos(a) * r, -B_RIM, Math.sin(a) * r) : local(f.mid, f.tilt, Math.cos(a) * r, -B_BOT - 0.02, Math.sin(a) * r);
    const dx = p[0] - wx, dz = p[2] - wz, rr = Math.hypot(dx, dz);
    let land = F0 + 0.01, on = 'floor';
    if (rr < GL.shaftR - 0.05) { land = WELL_Y; on = 'well'; }
    else if (rr < GL.shaftR + GL.rimT) { land = F0 + GL.rimH + 0.01; on = 'rim'; }
    else if (Math.abs(p[0] - hx) < GL.headSize[0] / 2 - 0.15 && Math.abs(p[2] - hz) < GL.headSize[1] / 2 - 0.15) { land = HB + 0.3; on = 'head'; }
    const tl = te + Math.sqrt((2 * Math.max(0, p[1] - land)) / G);
    return { te, tl, p, land, on, s: 0.03 + 0.02 * hash(k, 4) };
  });
})();
// the splashes round the trough while it is poured into: fixed spots on its rim and the floor by it
const SPLASH = Array.from({ length: 16 }, (_, k) => { const a = hash(k, 7) * Math.PI * 2, r = 1.0 + 0.7 * hash(k, 8); return { t: T_POUR[0] + 0.3 + 2.2 * hash(k, 9), x: hx + Math.cos(a) * r * 0.9, z: hz + Math.sin(a) * r * 0.55, s: 0.06 + 0.06 * hash(k, 10) }; });

const headLevel = (t) => 0.9 * sm(T_POUR[0] + 0.1, T_POUR[1] + 0.2, t) - 0.84 * sm(T_POUR[1] + 0.2, T_TAIL + 0.6, t);
const basinLevel = (t) => 0.62 * sm(T_IN, T_TAIL_IN + 0.8, t) + 0.04 * sm(T_IN, T_IN + 0.5, t);

/** the pour at loop time t: the lip, the water's first velocity, its time to the trough's water, its widths; the strength pk */
function pourAt(t, f, headY) {
  const pk = sm(T_POUR[0], T_POUR[0] + 0.3, t) * (1 - sm(T_POUR[1] - 0.7, T_POUR[1], t));
  if (pk < 0.01) return null;
  const lip = local(f.mid, f.tilt, 0, -B_RIM + 0.02, -B_R + 0.04), v0 = [0, -0.25 - 0.3 * pk, -0.55 - 0.9 * pk];
  const h = Math.max(0.05, lip[1] - headY), tt = (v0[1] + Math.sqrt(v0[1] * v0[1] + 2 * G * h)) / G;
  const land = [lip[0], headY, lip[2] + v0[2] * tt];
  return { p0: lip, v0, ax: [1, 0, 0], tt, w0: 0.2 + 0.5 * pk, w1: 0.12 + 0.22 * pk, bow: 0.55, on: Math.min(1, pk * 1.6), land, pk };
}
// the spray where the pour strikes: drops thrown up and out from the landing (fixed: each its start, its throw)
const SPRAY = Array.from({ length: 70 }, (_, k) => ({ t: T_POUR[0] + 0.25 + (T_POUR[1] - T_POUR[0] - 0.6) * hash(k, 21), a: hash(k, 22) * Math.PI * 2, up: 1.2 + 1.8 * hash(k, 23), out: 0.4 + 1.2 * hash(k, 24), s: 0.025 + 0.025 * hash(k, 25) }));

/** the frame of the sample at loop time t: everything golah3d draws (a pure function of t: seek is exact) */
export function frameAt(t) {
  const f = fullAt(t), emptyBot = emptyBotAt(t);
  const fb = bailOf(f.mid, f.tilt), eb = [wx - f.swing * 0.5, emptyBot + B_BOT, ZS];
  const ropeLen = Math.max(1, AXLE - fb[1]);
  const front = Math.max(-1, (t - T_RUN) * RUN_V), tail = t < T_TAIL ? -1 : (t - T_TAIL) * TAIL_V;
  const F = {
    full: { x: fb[0], y: fb[1], z: fb[2], tilt: f.tilt, fill: f.fill, swing: Math.asin(clamp((f.swing * 0.6) / ropeLen, -0.3, 0.3)), slosh: clamp(-f.swingV * 0.12, -0.18, 0.18) },
    empty: { x: eb[0], y: eb[1], z: eb[2], swing: Math.asin(clamp((-f.swing * 0.3) / Math.max(1, AXLE - eb[1]), -0.3, 0.3)) },
    wheel: -((BOT1 - BOT0) * pulls(t)) / (GL.wheel.R + 0.04),
    head: Math.max(0, headLevel(t)), headWet: t > T_POUR[0] ? Math.max(0, headLevel(Math.min(t, T_POUR[1] + 0.2))) : 0,
    front, tail, tailV: TAIL_V, flow: 1 - 0.55 * sm(T_POUR[1], T_TAIL + 0.5, t),
    pileA: sm(LEG_A - 0.2, LEG_A + 0.6, front) * (1 - sm(LEG_A - 0.5, LEG_A + 0.5, tail)), pileB: sm(LEG_B - 0.2, LEG_B + 0.6, front) * (1 - sm(LEG_B - 0.5, LEG_B + 0.5, tail)),
    trough: basinLevel(t), drips: [], spots: [], wellRings: [], headRings: [], trRings: [], ropeWet: 1,
  };
  // the pour: one sheet from the tipped bucket's mouth to the trough's water, its foam, its spray
  const headY = HB + 0.02 + F.head * (GL.headSize[2] - 0.27);
  const P = pourAt(t, f, headY);
  if (P) { F.pour = P; F.pourAt = [P.land[0], P.land[2], Math.min(1, P.pk * 1.3)]; }
  for (const d of SPRAY) {
    const tau = t - d.t; if (tau < 0) continue;
    const Q = pourAt(d.t, fullAt(d.t), HB + 0.02 + Math.max(0, headLevel(d.t)) * (GL.headSize[2] - 0.27)); if (!Q) continue;
    const vy = d.up * Q.pk - G * tau, y = Q.land[1] + d.up * Q.pk * tau - 0.5 * G * tau * tau;
    if (y < Q.land[1] - 0.02) continue;
    const vx = Math.cos(d.a) * d.out, vz = Math.sin(d.a) * d.out * 0.8 + 0.4;
    F.drips.push([Q.land[0] + vx * tau, y, Q.land[2] + vz * tau, d.s, vx, vy, vz]);
  }
  // the dribble off the bucket as it leaves the water (a thin stream off its bottom, thinning, breaking)
  const dk = sm(T_PULL0 + 0.1, T_PULL0 + 0.35, t) * (1 - sm(1.6, 3.0, t));
  if (dk > 0.01) { const p = local(f.mid, f.tilt, 0.1, -B_BOT, 0.05), L = Math.min(p[1] - WELL_Y, 9); F.dribble = [p, [p[0], p[1] - L * 0.5, p[2]], [p[0], p[1] - L, p[2]], 0.09 * dk + 0.02, 0.03, dk]; }
  // the fall over the basin's lip into its water (a short sheet), while the channel runs
  const ik = sm(T_IN - 0.05, T_IN + 0.3, t) * (1 - sm(T_TAIL_IN - 0.4, T_TAIL_IN + 0.2, t)) * (0.55 + 0.45 * F.flow);
  const by = F0 - GL.troughSize[2] + 0.03 + F.trough * (GL.troughSize[2] - 0.18), lipY = F0 - 0.3 + 0.2;
  if (ik > 0.01) {
    const v0 = [0, -0.1, -1.1 * (0.6 + 0.4 * F.flow)], h = Math.max(0.05, lipY - by), tt = (v0[1] + Math.sqrt(v0[1] * v0[1] + 2 * G * h)) / G;
    F.inflow = { p0: [GL.troughs.B[0], lipY, LIP_Z - 0.01], v0, ax: [1, 0, 0], tt, w0: 0.42, w1: 0.36, bow: 0.25, on: ik };
    F.inAt = [GL.troughs.B[0], LIP_Z - 0.01 + v0[2] * tt, ik];
  }
  // the drops in the air now (with their speed, for their streaks), the spots they left, the rings where they fell in water
  const wr = [], hr = [];
  for (const d of DRIPS) {
    if (d.te > t) break;
    if (t < d.tl) { const tau = t - d.te; F.drips.push([d.p[0], d.p[1] - 0.5 * G * tau * tau, d.p[2], d.s, 0, -G * tau, 0]); continue; }
    if (d.on === 'floor' || d.on === 'rim') F.spots.push([d.p[0], d.land, d.p[2], 0.05 + d.s * 1.2]);
    else if (d.on === 'well') wr.push([d.p[0], d.p[2], d.tl, 0.45]); else hr.push([d.p[0], d.p[2], d.tl, 0.4]);
  }
  for (const s of SPLASH) if (s.t <= t) F.spots.push([s.x, F0 + 0.012, s.z, s.s]);
  // the big rings: where the full bucket left the water, where the empty one broke into it
  wr.push([wx, ZN, T_PULL0 + 0.15, 1.6], [wx, ZS, T_TOUCH, 1.4], [wx, ZS, T_TOUCH + 0.5, 0.7]);
  F.wellRings = wr.filter((r) => r[2] <= t).sort((a, b) => b[2] - a[2]).slice(0, 8);
  // the pour's rings (a ring every 0.35 s round where it lands), the drops' rings
  if (P) for (let k = 0; k < 4; k++) { const t0 = t - ((t - T_POUR[0] + k * 0.35) % 1.4); hr.push([P.land[0] + (hash(k, 31) - 0.5) * 0.3, P.land[2] + (hash(k, 32) - 0.5) * 0.15, t0, 0.8]); }
  F.headRings = hr.sort((a, b) => b[2] - a[2]).slice(0, 8);
  // the basin's rings from the inflow: one every 0.6 s, spreading
  if (ik > 0.01) for (let k = 0; k < 5; k++) { const t0 = t - ((t - T_IN + k * 0.6) % 3.0); F.trRings.push([F.inAt[0] + (hash(k, 11) - 0.5) * 0.5, F.inAt[1] - 0.05 - hash(k, 12) * 0.15, t0, 0.55 * ik]); }
  F.cam = camAt(t);
  F.line = t < 6.5 ? LINES.golah : '';
  return F;
}
/** the camera at loop time t: a smooth path through the book's keyframes (Catmull-Rom on the eye and the aim) */
export function camAt(t) {
  const K = CAM; let i = 0; while (i < K.length - 2 && t > K[i + 1][2]) i++;
  const u = clamp((t - K[i][2]) / (K[i + 1][2] - K[i][2]), 0, 1), e = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
  const P = (j, w) => K[clamp(j, 0, K.length - 1)][w];
  const cr = (w) => [0, 1, 2].map((c) => { const p0 = P(i - 1, w)[c], p1 = P(i, w)[c], p2 = P(i + 1, w)[c], p3 = P(i + 2, w)[c]; return 0.5 * ((2 * p1) + (-p0 + p2) * e + (2 * p0 - 5 * p1 + 4 * p2 - p3) * e * e + (-p0 + 3 * p1 - 3 * p2 + p3) * e * e * e); });
  return { eye: cr(0), aim: cr(1) };
}

export function runWaterLook({ renderer, canvas }) {
  // the page is the sample alone: no loader, no game interface
  try { const ld = document.getElementById('load'); if (ld) ld.remove(); for (const el of [...document.body.children]) if (el !== canvas && el.tagName !== 'SCRIPT' && !el.contains(canvas)) el.style.display = 'none'; } catch (e) { /* */ }
  const S = createGolah3d({ renderer });
  renderer.toneMappingExposure = 0.95;
  const fit = () => { renderer.setSize(innerWidth, innerHeight, false); S.resize(innerWidth, innerHeight); };
  fit(); addEventListener('resize', fit);
  const css = 'position:fixed;z-index:9;font:600 13px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000;pointer-events:none';
  const fpsEl = Object.assign(document.createElement('div'), { id: 'fps129', dir: 'ltr' }); fpsEl.style.cssText = css + ';left:8px;bottom:6px;opacity:.8';
  const cap = Object.assign(document.createElement('div'), { id: 'cap129', dir: 'rtl' }); cap.style.cssText = css + ';top:10px;left:0;right:0;text-align:center;font-size:16px;padding:0 16px';
  const tag = Object.assign(document.createElement('div'), { dir: 'rtl', textContent: 'דוגמת מראה: המים בלשכת הגולה (המחשה: הקירות חתוכים כדי לראות)' }); tag.style.cssText = css + ';right:10px;bottom:6px;opacity:.75;font-weight:400';
  document.body.append(fpsEl, cap, tag);

  let lt = 0, paused = !!globalThis.__START_PAUSED, last = performance.now(), fr = 0, fAcc = 0, sAcc = 0;
  const stat = { frames: 0, script: 0, render: 0 };
  function step(t) {
    const F = frameAt(t);
    S.set(F); S.view(F.cam.eye, F.cam.aim); S.update(t);
    if (cap.textContent !== F.line) cap.textContent = F.line;
    return F;
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const raw = (now - last) / 1000, dt = Math.min(0.1, raw); last = now;
    if (paused) return;
    lt = (lt + dt) % LOOP;
    const t0 = performance.now(); step(lt); const t1 = performance.now(); S.render(); const t2 = performance.now();
    stat.frames++; stat.script += t1 - t0; stat.render += t2 - t1;
    fr++; fAcc += dt; sAcc += t1 - t0;
    if (fAcc >= 0.5) { const I = renderer.info.render; fpsEl.innerHTML = `${Math.round(fr / fAcc)} fps · ${(sAcc / fr).toFixed(2)} ms<br><span style="font-size:11px;font-weight:400">${I.calls} draw calls · ${(I.triangles / 1000).toFixed(1)}k triangles</span>`; fr = 0; fAcc = 0; sAcc = 0; }
  }
  step(0); S.render(); requestAnimationFrame(frame);

  const look = {
    S, frameAt, camAt, LOOP,
    /** show loop time t and stop the clock (everything is a function of t: exact) */
    seek(t) { paused = true; lt = t; step(t); S.render(); return look.dbg(); },
    play() { paused = false; last = performance.now(); },
    /** run the loop live for sec seconds from loop time t0: { fps, frameScriptMs (all of step), renderCallMs } */
    bench(sec = 8, t0 = 0) {
      lt = t0; Object.assign(stat, { frames: 0, script: 0, render: 0 }); paused = false; last = performance.now();
      const T0 = performance.now();
      return new Promise((res) => setTimeout(() => {
        const T = (performance.now() - T0) / 1000, n = Math.max(1, stat.frames);
        res({ sec: +T.toFixed(2), frames: stat.frames, fps: +(stat.frames / T).toFixed(1), frameScriptMs: +(stat.script / n).toFixed(3), renderCallMs: +(stat.render / n).toFixed(2), from: t0, to: +lt.toFixed(1), calls: renderer.info.render.calls, tris: renderer.info.render.triangles });
      }, sec * 1000));
    },
    dbg: () => { const F = frameAt(lt); return { ...S.dbg(), lt: +lt.toFixed(2), paused, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, drips: F.drips.length, spots: F.spots.length, front: +F.front.toFixed(2), head: +F.head.toFixed(2), trough: +F.trough.toFixed(2) }; },
  };
  globalThis.__H129_LOOK = look;
  // the probe's handle (tools/probe109.cjs waits for __T.booted && __T.game, renders before a shot)
  globalThis.__T = { booted: true, game: { frame() {} }, simulate() {}, render() { S.render(); }, renderer };
  return look;
}
