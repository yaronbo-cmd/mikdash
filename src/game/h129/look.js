/* ── build 129 ── h129/look.js — the Golah's water look sample (brief §3; page flag window.__H129_WATER_LOOK = true): no play, a loop of
 * twenty seconds, for the owner to judge the water on his tablet before it is coded into the game.
 *   0–7 s     down the shaft: the full bucket comes up hand over hand (the wheel turns in pulls, the empty one goes down past it), it
 *             leaves the water streaming and dripping, the rings on the well's water
 *   7–9.6 s   at the rim it hangs and drips on the stones; it is drawn over to the trough by the well
 *   9.6–13 s  the pour into the trough: the stream, its foam and rings, the trough filling; out by its outlet into the channel
 *   10.6–15 s the water runs down the channel out through the door, past the lowered sluice stone, east to the raised one, into its spur
 *             and over the lip into the basin; the stone it ran over stays dark and wet
 *   15–20 s   the basin filling and glinting in the golden light
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
const OVER = [hx, F0 + 1.75, hz + 0.95], TILT = 1.8;
// the way the water runs (as golah3d's ribbon): its length to the basin's lip
const [m0, m1] = GL.channel.main, LIP_Z = GL.troughs.B[1] + GL.troughSize[1] / 2, WAY = (m0[1] - GL.headSize[1] / 2 - m1[1]) + Math.abs(GL.sluice.B[0] - m1[0]) + (m1[1] - LIP_Z);
const T_IN = T_RUN + WAY / RUN_V;

const pulls = (t) => { let s = 0; for (let k = 0; k < NPULL; k++) s += sm(0, 1, (t - (T_PULL0 + k * T_PULLD)) / PULL); return s / NPULL; };
const periodAt = (depth) => GOLAH.T0 + GOLAH.TL * (depth + GOLAH.HANG);
/** the full bucket: its body's middle and tilt at loop time t (the swing along x, calmed at every pull in the rhythm) */
function fullAt(t) {
  const p = pulls(t), bot = BOT0 + (BOT1 - BOT0) * p, depth = F0 - bot;
  const done = Math.max(0, Math.min(NPULL, Math.floor((t - T_PULL0) / T_PULLD) + 1));
  const A = t < T_PULL0 ? 0 : 0.34 * Math.pow(0.8, done) * Math.exp(-Math.max(0, t - T_PULL0) / 4) + 0.05 * sm(T_OVER[0], T_OVER[1], t) * (1 - sm(T_TILT[0], T_TILT[1], t));
  const ph = (2 * Math.PI * Math.max(0, t - T_PULL0)) / periodAt(Math.max(0, depth));
  let x = wx + A * Math.sin(ph), y = bot + B_BOT - B_MID, z = ZN;
  // drawn over to the trough by the well, tipped, brought back
  const o = sm(T_OVER[0], T_OVER[1], t) * (1 - sm(T_BACK[1] + 0.2, T_BACK[1] + 1.6, t));
  x += (OVER[0] - x) * o; z += (OVER[2] - z) * o; y += (OVER[1] - y) * o + 0.5 * Math.sin(Math.PI * clamp((t - T_OVER[0]) / (T_OVER[1] - T_OVER[0]), 0, 1));
  const tilt = -TILT * sm(T_TILT[0], T_TILT[1], t) * (1 - sm(T_BACK[0], T_BACK[1], t));
  const fill = t < T_POUR[0] ? 1 : 1 - sm(T_POUR[0], T_POUR[1], t);
  return { mid: [x, y, z], tilt, fill, swing: A * Math.sin(ph), depth };
}
/** the bail's place for a body's middle at a tilt (the bucket turns about its body; the rope is tied at the bail) */
const bailOf = (mid, tilt) => [mid[0], mid[1] + B_MID * Math.cos(tilt), mid[2] + B_MID * Math.sin(tilt)];
/** a point of the bucket (local, below the bail) in the world, for a body's middle and tilt */
function local(mid, tilt, lx, ly, lz) { const b = bailOf(mid, tilt), c = Math.cos(tilt), s = Math.sin(tilt); return [b[0] + lx, b[1] + ly * c - lz * s, b[2] + ly * s + lz * c]; }

/* the drops: a fixed schedule (rule 56) of drops off the full bucket's bottom while it is out of the water and not pouring; each falls
 * from where the bucket was when it left, and lands on the well's water, the trough's water, the rim or the floor (a wet spot) */
const RATE = (t) => (t < T_PULL0 + 0.25 ? 0 : t < 2.6 ? 14 : t < T_OVER[0] ? 5 : t < T_POUR[0] ? 3 : t < T_BACK[1] ? 0 : t < 15.5 ? 2 : 0);
const DRIPS = (() => {
  const L = []; let acc = 0, i = 0;
  for (let t = 0; t < LOOP; t += 1 / 120) { acc += RATE(t) / 120; while (acc >= 1) { acc -= 1; L.push(t + hash(i, 1) / 120); i++; } }
  return L.map((te, k) => {
    const f = fullAt(te), a = hash(k, 2) * Math.PI * 2, r = 0.3 + 0.12 * hash(k, 3);
    const p = local(f.mid, f.tilt, Math.cos(a) * r, -B_BOT - 0.02, Math.sin(a) * r), dx = p[0] - wx, dz = p[2] - wz, rr = Math.hypot(dx, dz);
    let land = F0 + 0.01, on = 'floor';
    if (rr < GL.shaftR - 0.05) { land = F0 - DEPTH; on = 'well'; }
    else if (rr < GL.shaftR + GL.rimT) { land = F0 + GL.rimH + 0.01; on = 'rim'; }
    else if (Math.abs(p[0] - hx) < GL.headSize[0] / 2 - 0.15 && Math.abs(p[2] - hz) < GL.headSize[1] / 2 - 0.15) { land = HB + 0.3; on = 'head'; }
    const tl = te + Math.sqrt((2 * Math.max(0, p[1] - land)) / G);
    return { te, tl, p, land, on, s: 0.045 + 0.025 * hash(k, 4) };
  });
})();
// the splashes round the trough while it is poured into: fixed spots on its rim and the floor by it
const SPLASH = Array.from({ length: 14 }, (_, k) => { const a = hash(k, 7) * Math.PI * 2, r = 1.2 + 0.7 * hash(k, 8); return { t: T_POUR[0] + 0.3 + 2.2 * hash(k, 9), x: hx + Math.cos(a) * r * 0.9, z: hz + Math.sin(a) * r * 0.55, s: 0.06 + 0.06 * hash(k, 10) }; });

const headLevel = (t) => 0.9 * sm(T_POUR[0] + 0.1, T_POUR[1] + 0.2, t) - 0.25 * sm(T_POUR[1], LOOP, t);
const basinLevel = (t) => 0.78 * sm(T_IN, LOOP + 1.5, t) + 0.04 * sm(T_IN, T_IN + 0.5, t);

/** the frame of the sample at loop time t: everything golah3d draws (a pure function of t: seek is exact) */
export function frameAt(t) {
  const f = fullAt(t), emptyBot = BOT0 + BOT1 - (BOT0 + (BOT1 - BOT0) * pulls(t));
  const fb = bailOf(f.mid, f.tilt), eb = [wx - f.swing * 0.5, emptyBot + B_BOT, ZS];
  const ropeLen = Math.max(1, AXLE - fb[1]);
  const F = {
    full: { x: fb[0], y: fb[1], z: fb[2], tilt: f.tilt, fill: f.fill, swing: Math.asin(clamp((f.swing * 0.6) / ropeLen, -0.3, 0.3)) },
    empty: { x: eb[0], y: eb[1], z: eb[2], swing: Math.asin(clamp((-f.swing * 0.3) / Math.max(1, AXLE - eb[1]), -0.3, 0.3)) },
    wheel: -((BOT1 - BOT0) * pulls(t)) / (GL.wheel.R + 0.04),
    head: Math.max(0, headLevel(t)), front: Math.max(-1, (t - T_RUN) * RUN_V), flow: 1 - 0.25 * sm(14, LOOP, t),
    trough: basinLevel(t), threads: [], drips: [], spots: [], wellRings: [], headRings: [], trRings: [],
  };
  // the pour: the stream from the mouth to the trough's water, its foam where it lands
  const pk = sm(T_POUR[0], T_POUR[0] + 0.25, t) * (1 - sm(T_POUR[1] - 0.5, T_POUR[1], t));
  const headY = HB + 0.02 + F.head * (GL.headSize[2] - 0.27);
  if (pk > 0.01) {
    const lip = local(f.mid, f.tilt, 0, -B_RIM, -B_R + 0.03), land = [lip[0], headY, Math.max(hz - 0.2, lip[2] - 0.55)];
    F.threads[0] = [{ x: lip[0], y: lip[1], z: lip[2] }, { x: lip[0], y: lip[1] + 0.05, z: lip[2] - 0.35 }, { x: land[0], y: land[1], z: land[2] }, 0.2 * pk + 0.04, 0.12 * pk + 0.03, Math.min(1, pk * 1.4)];
    F.pourAt = [land[0], land[2], Math.min(1, pk * 1.3)];
  }
  // the dribble off the bucket as it leaves the water (a sheet off its bottom, thinning)
  const dk = sm(T_PULL0 + 0.1, T_PULL0 + 0.35, t) * (1 - sm(1.4, 2.8, t));
  if (dk > 0.01) { const p = local(f.mid, f.tilt, 0.12, -B_BOT, 0.05), L = Math.min(p[1] - (F0 - DEPTH), 7); F.threads[1] = [{ x: p[0], y: p[1], z: p[2] }, { x: p[0], y: p[1] - L * 0.5, z: p[2] }, { x: p[0], y: p[1] - L, z: p[2] }, 0.34 * dk, 0.06 * dk, dk]; }
  // the fall over the basin's lip into its water
  const ik = sm(T_IN - 0.05, T_IN + 0.3, t) * (0.6 + 0.4 * F.flow);
  if (ik > 0.01) {
    const by = F0 - GL.troughSize[2] + 0.03 + F.trough * (GL.troughSize[2] - 0.18), lipY = F0 - 0.3 + 0.13;
    F.threads[2] = [{ x: GL.troughs.B[0], y: lipY, z: LIP_Z + 0.01 }, { x: GL.troughs.B[0], y: lipY - 0.02, z: LIP_Z - 0.18 }, { x: GL.troughs.B[0], y: by, z: LIP_Z - 0.32 }, 0.4, 0.34, ik];
    F.inAt = [GL.troughs.B[0], LIP_Z - 0.33, ik];
  }
  // the drops in the air now, the spots they left, the rings where they fell in water
  const wr = [], hr = [];
  for (const d of DRIPS) {
    if (d.te > t) break;
    if (t < d.tl) { const tau = t - d.te; F.drips.push([d.p[0], d.p[1] - 0.5 * G * tau * tau, d.p[2], d.s]); continue; }
    if (d.on === 'floor' || d.on === 'rim') F.spots.push([d.p[0], d.land, d.p[2], 0.05 + d.s * 0.8]);
    else if (d.on === 'well') wr.push([d.p[0], d.p[2], d.tl, 0.5]); else hr.push([d.p[0], d.p[2], d.tl, 0.4]);
  }
  for (const s of SPLASH) if (s.t <= t) F.spots.push([s.x, F0 + 0.012, s.z, s.s]);
  // the big ring where the bucket left the water
  wr.push([wx, ZN, T_PULL0 + 0.15, 1.6]);
  F.wellRings = wr.sort((a, b) => b[2] - a[2]).slice(0, 4); F.headRings = hr.sort((a, b) => b[2] - a[2]).slice(0, 4);
  F.trRings = ik > 0.01 ? [0, 1, 2].map((k) => [GL.troughs.B[0] + (hash(k, 11) - 0.5) * 1.6, LIP_Z - 0.5 - hash(k, 12) * 0.6, T_IN + ((t - T_IN) - ((t - T_IN + k * 0.8) % 2.4)), 0.35]) : [];
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
  const tag = Object.assign(document.createElement('div'), { dir: 'rtl', textContent: 'דוגמת מראה: המים בלשכת הגולה (המחשה)' }); tag.style.cssText = css + ';right:10px;bottom:6px;opacity:.75;font-weight:400';
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
