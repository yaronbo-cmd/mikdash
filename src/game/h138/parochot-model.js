/* ── build 138 ── h138/parochot-model.js — stage 15, work 2 "להשתיק שתי פרוכות" and the finale "הנשימה האחרונה" (spec
 * docs/specs/shlav-15-he.md v4, עבודה 2 + הסיום). Pure and deterministic.
 * THE WAVE (spec "הגל", 1D): one field u(z) along the amah, z from −10 (north) to +10 (south); u = the cloths' bulge (amah), the outer
 * drawn toward the Heichal, the inner toward the void. Each deliberate PULL of an edge adds ONE bell pulse (3 amot wide) at its end:
 * A = 0.25 × min(1, vmax / 400), the sign by the pull's way. Pulses run at 8 amot/s, pass through each other, halve every 6 s, die
 * under 0.01, and come back from an end at 60%.
 * THE CATCH (spec "תפיסה"): an edge held (or a fold in its hook, free 0.3 amah across) moved ACROSS the cloth, the bulge's way, within
 * ±0.2 s of a pulse's peak reaching that end, at v = 400 × A / 0.25 (±35%): 70% absorbed, 30% back; the catch makes no pulse of its own.
 * Too fast: 30% back and a new pulse of the excess; too slow / wrong time: 60% back as usual (and the move's own pulse if it was a pull).
 * Unit of the screen: dp of the 640 × 360 design (the amah's 20 amot span 512 dp: 25.6 dp per amah). */
export const PV = Object.freeze({
  SPEED: 8, HALF: 6, DIE: 0.01, BACK: 0.6, CATCH_BACK: 0.3, PART_BACK: 0.45, WIDTH: 1.3,
  AMAX: 0.25, VREF: 400, WIN: 0.2, TOL: 0.35, PART: 0.6, CATCH_MIN: 10,
  STILL: 20,        // a pull ends when the edge slows under 20 dp/s or turns back
  LIGHT: 0.15,      // a free edge bulging more than 0.15 lifts: a seam of light
  CALM: 0.05,       // the fold takes the hook only when the edge's cloth is calm (build 138, the prototype: tune)
  QUIET: 0.03,
  TEAR: 400,        // a pull faster than 400 dp/s near the hook tears the edge in its fold
  NEAR_HOOK: 60,    // dp
  FOLD: 120,        // dp of drag along the cloth folds the edge fully
  HOOK_R: 32,       // dp: the fold's centre within 32 dp of the hook takes it
  HOOK_Y: 46,       // dp: the hook sits 46 dp across from the full fold (the outer's toward the Heichal, the inner's toward the amah)
  ACROSS: 0.3,      // amah: the edge (or the fold in its hook) moves up to 0.3 across
  PALM: 3,          // amot: the restraining palm reaches 3 amot from the edge
  LAG: 0.4, LAG_X: 0.12,
});
const hl = (dt) => Math.pow(2, -dt / PV.HALF);
export const ampOf = (v) => PV.AMAX * Math.min(1, Math.max(0, v) / PV.VREF);
export const vFor = (A) => Math.max(PV.CATCH_MIN, PV.VREF * Math.abs(A) / PV.AMAX);

/** the levels (spec "טבלת הרמות"): the phases in order; 'heichal' = the outer's south edge from the Heichal; 'teivah' = in the narrow
 * box at the north end (the inner's edge by the work hand, the outer's cloth by the helper) */
export const LEVELS = Object.freeze({
  1: { phases: ['heichal'], foldSteps: 2, palm: 'bonus', mustCatch: 0, quiet: false },
  2: { phases: ['heichal', 'teivah'], foldSteps: 1, palm: 'need', mustCatch: 0, quiet: false },
  3: { phases: ['heichal', 'teivah'], foldSteps: 1, palm: 'none', mustCatch: 2, quiet: true, running: 0.2 },
  neshima: { phases: ['teivah'], finale: true },
});
export function fresh(lv) {
  const P = LEVELS[lv] || LEVELS[1];
  const S = {
    lv, P, t: 0, pulses: [], seq: 0, ph: 0, phase: P.phases[0], moving: 0,
    edges: {
      S: { fold: 0, hooked: false, held: false, x: 0, y: 0, vy: 0, vx: 0, pull: null, tears: 0, back: false, slip: 0 },
      N: { fold: 0, hooked: false, held: false, x: 0, y: 0, vy: 0, vx: 0, pull: null, tears: 0, back: false, slip: 0 },
    },
    helper: { held: false, z: -9, y: 0, vy: 0, pull: null },   // the outer's cloth by the north wall (the box), or the palm (level 2)
    palm: null,
    lights: [], steps: [], step: null, catches: [], echoesLeft: 0, decayedSelf: 0, quietDone: false, done: false, free: true, touched: false,
    finale: P.finale ? { tries: 0, first: null, wave: false, got: 0 } : null, log: [],
  };
  if (P.finale) { S.edges.S.fold = 1; S.edges.S.hooked = true; S.edges.N.fold = 1; S.edges.N.hooked = true; }
  beginStep(S);
  return S;
}
/** the steps of the level in order (scored 40 / 20 / 10 each) */
export function plan(S) {
  const P = S.P, out = [];
  if (P.finale) return [{ k: 'neshima' }];
  for (const ph of P.phases) {
    const e = ph === 'heichal' ? 'S' : 'N';
    if (P.foldSteps === 2) { out.push({ k: 'fold', e, to: 0.5 }, { k: 'fold', e, to: 1 }); } else out.push({ k: 'fold', e, to: 1 });
    out.push({ k: 'hook', e });
  }
  if (P.mustCatch) for (let i = 0; i < P.mustCatch; i++) out.push({ k: 'catch' });
  if (P.quiet) out.push({ k: 'quiet' });
  return out;
}
function beginStep(S) {
  const L = plan(S), i = S.steps.length;
  S.step = i < L.length ? { ...L[i], i, lights: 0, again: false, tear: 0 } : null;
}
function closeStep(S, grade, why) {
  const s = S.step; if (!s) return null;
  const g = grade || (s.tear ? 'ok' : s.lights === 0 && !s.again ? 'gold' : s.lights <= 1 && !s.again ? 'good' : 'ok');
  S.steps.push({ k: s.k, grade: g, why }); S.log.push({ e: 'step', k: s.k, grade: g });
  beginStep(S);
  return { e: 'step', k: s.k, grade: g, i: s.i };
}
/** u at z: the sum of the bells */
export function uAt(S, z) { let u = 0; for (const p of S.pulses) { const d = (z - p.z) / PV.WIDTH; u += p.A * Math.exp(-d * d); } return u; }
const endZ = (e) => (e === 'S' ? 10 : -10);
function emit(S, e, A, why) {
  if (Math.abs(A) < PV.DIE) return null;
  const p = { id: ++S.seq, z: endZ(e), dir: e === 'S' ? -1 : 1, A, max: Math.abs(A), born: S.t, why, crossed: {} };
  S.pulses.push(p); return p;
}
/** who holds an end: 'S' the outer's edge (Heichal); 'N' the inner's edge by the work hand and the outer's cloth by the helper (the box) */
function handsAt(S, e) {
  const H = [];
  if (e === 'S') { const d = S.edges.S; if (d.held) H.push({ who: 'S', vy: d.vy, sign: 1, ed: d }); }
  else {
    const d = S.edges.N; if (d.held) H.push({ who: 'N', vy: d.vy, sign: 1, ed: d });
    if (S.phase === 'teivah' && S.helper.held && S.P.palm !== 'need') H.push({ who: 'H', vy: S.helper.vy, sign: 1, ed: S.helper });
  }
  return H;
}
const freeEdge = (S, e) => { const d = S.edges[e]; if (d.held || d.hooked) return false; if (e === 'N' && S.phase === 'heichal') return true; return true; };

/**
 * one step. inp: { S: { down, x, y } (the outer's edge finger, dp from its rest; x along the cloth toward the amah, y across, + = the
 *   bulge's way), N: { … } (the inner's edge), H: { down, y, z } (the helper: across motion on the outer's cloth by the north wall;
 *   level 2: the palm at z), next: bool (go down to the box) } → events
 */
export function step(S, dt, inp = {}) {
  const E = []; if (S.done) return E;
  S.t += dt;
  // ── the hands
  for (const e of ['S', 'N']) {
    const d = S.edges[e], f = inp[e];
    const mine = (e === 'S' && S.phase === 'heichal') || (e === 'N' && S.phase === 'teivah');
    if (!mine) { d.held = false; continue; }
    if (f && f.down) {
      if (!d.held) { d.held = true; d.gx = f.x - d.x; d.gy = f.y - d.y; d.pull = null; d.fx = null; d.vx0 = 0; d.vy0 = 0; if (!S.touched) { S.touched = true; E.push({ e: 'touch' }); if (S.finale) E.push(...finaleWave(S)); } }
      // the cloth is heavy: along it the edge follows the finger 0.4 s behind; across it lighter (0.12 s)
      const tx = f.x - d.gx, ty = f.y - d.gy;
      const nx = d.x + (tx - d.x) * Math.min(1, dt / PV.LAG), ny = d.y + (ty - d.y) * Math.min(1, dt / PV.LAG_X);
      const yMax = d.fold >= 0.98 && !d.hooked ? PV.HOOK_Y + 14 : PV.ACROSS * 25.6 * 3;   // dp on the screen (0.3 amah drawn ×3; a full fold reaches down to its hook)
      d.vx = dt > 0 ? (nx - d.x) / dt : 0; d.vy = dt > 0 ? (Math.max(-yMax, Math.min(yMax, ny)) - d.y) / dt : 0;
      d.x = d.hooked ? 0 : nx; d.y = Math.max(-yMax, Math.min(yMax, ny));
      // the pull and the catch are read from the HAND (the finger's speed, lightly smoothed): the cloth's lag is only what is seen
      if (d.fx != null && dt > 0) { const a = Math.min(1, dt / 0.05); d.vx = d.vx0 = (d.vx0 || 0) + ((f.x - d.fx) / dt - (d.vx0 || 0)) * a; const vy = (f.y - d.fy) / dt; d.vy = d.vy0 = (d.vy0 || 0) + (vy - (d.vy0 || 0)) * a; if (Math.abs(d.y) >= yMax - 0.01 && Math.sign(vy) === Math.sign(d.y)) d.vy = 0; }
      d.fx = f.x; d.fy = f.y;
      if (d.hooked) d.vx = 0;
      E.push(...pullTrack(S, e, d));
      // the fold: dragging along the cloth (x > 0) folds the edge back on itself; it stays where it is left
      if (!d.hooked) {
        const want = Math.max(0, Math.min(1, d.x / PV.FOLD));
        if (want < d.fold - 0.08) { d.back = true; }
        if (want > d.fold) { if (d.back && S.step && S.step.e === e) S.step.again = true; d.back = false; d.fold = want; }
        // a fast pull near the hook tears the edge in its fold
        if (Math.abs(d.vx) > PV.TEAR && d.fold > 0.6 && !d.tornNow) { d.tornNow = true; d.tears++; E.push({ e: 'tear', edge: e }); if (S.step) S.step.tear++; }
        if (Math.abs(d.vx) < PV.TEAR * 0.5) d.tornNow = false;
        if (S.step && S.step.k === 'fold' && S.step.e === e && d.fold >= S.step.to - 0.02) E.push(closeStep(S));
      }
    } else if (d.held) {
      // released: into the hook if the fold is full, near it, and the cloth there is calm
      d.held = false; d.fx = null; E.push(...pullEnd(S, e, d));
      if (!d.hooked && d.fold >= 0.98) {
        const hookX = PV.FOLD + 10, hookY = e === 'S' ? PV.HOOK_Y : -PV.HOOK_Y;   // (the hook: at the full fold, toward the Heichal for the outer, toward the amah for the inner: dp from the edge's rest)
        const near = Math.hypot(d.x - hookX, d.y - hookY) <= PV.HOOK_R + 6 || Math.hypot(f && f.x != null ? f.x - hookX : 99, f && f.y != null ? f.y - hookY : 99) <= PV.HOOK_R;
        const calm = Math.abs(uAt(S, endZ(e))) < PV.CALM;
        if (near && calm) { d.hooked = true; d.x = 0; d.y = 0; E.push({ e: 'hooked', edge: e }); if (S.step && S.step.k === 'hook' && S.step.e === e) E.push(closeStep(S)); }
        else if (near) { d.slip++; E.push({ e: 'slip', edge: e }); if (S.step && S.step.e === e) S.step.again = true; }
      }
      if (d.hooked) { d.y = 0; }
    } else if (d.hooked) { d.y *= Math.max(0, 1 - dt * 2); d.vy = 0; }   // the fold settles back into the hook slowly, with no pulse
  }
  // the helper (the box: the outer's cloth by the north wall; level 2: the palm on the worked cloth)
  const h = inp.H || {};
  if (S.P.palm === 'need' || S.P.palm === 'bonus') {
    if (h.down) { S.palm = { z: Math.max(-10, Math.min(10, h.z)) }; } else S.palm = null;
  } else if (S.phase === 'teivah') {
    if (h.down) {
      const yMax = PV.ACROSS * 25.6 * 3;
      if (!S.helper.held) { S.helper.held = true; S.helper.gy = h.y - S.helper.y; S.helper.pull = null; S.helper.fy = null; S.helper.vy0 = 0; if (!S.touched) { S.touched = true; E.push({ e: 'touch' }); if (S.finale) E.push(...finaleWave(S)); } }
      const ty = h.y - S.helper.gy, ny = S.helper.y + (ty - S.helper.y) * Math.min(1, dt / PV.LAG_X);
      const cy = Math.max(-yMax, Math.min(yMax, ny)); S.helper.y = cy;
      if (S.helper.fy != null && dt > 0) { const a = Math.min(1, dt / 0.05); S.helper.vy = S.helper.vy0 = (S.helper.vy0 || 0) + ((h.y - S.helper.fy) / dt - (S.helper.vy0 || 0)) * a; } else S.helper.vy = 0;
      S.helper.fy = h.y;
      E.push(...pullTrack(S, 'H', S.helper));
    } else if (S.helper.held) { S.helper.held = false; S.helper.fy = null; E.push(...pullEnd(S, 'H', S.helper)); }
    else { S.helper.y *= Math.max(0, 1 - dt * 2); S.helper.vy = 0; }
  }
  // ── the pulses: run, fade, pass the palm, reach an end (a catch window around the peak's arrival)
  const k = hl(dt);
  for (const p of S.pulses) {
    const z0 = p.z; p.z += p.dir * PV.SPEED * dt; p.A *= k;
    if (S.palm && !p.crossed.palm && (z0 - S.palm.z) * (p.z - S.palm.z) <= 0) { p.crossed.palm = 1; p.A *= 0.5; E.push({ e: 'palm' }); }
    // the catch window: sample the hands at the end from 0.2 s before the peak arrives
    const e = p.dir < 0 ? 'N' : 'S', ez = endZ(e), ta = (ez - p.z) / (p.dir * PV.SPEED);
    if (ta <= PV.WIN && !p.win) p.win = { e, peak: {}, A: p.A, t0: S.t };
    if (p.win) for (const H of handsAt(S, e)) { const v = H.vy * Math.sign(p.A); const w = p.win.peak[H.who]; if (w == null || v > w) p.win.peak[H.who] = v; H.ed.inWin = S.t; }
    if ((p.dir < 0 && p.z <= -10) || (p.dir > 0 && p.z >= 10)) {
      // arrival: reflect (tentatively 60%); the catch decision comes 0.2 s later
      p.z = ez - (p.z - ez); p.dir = -p.dir; p.Aarr = p.A; p.A *= PV.BACK; p.arr = S.t; p.win.arrived = true;
      if (Math.abs(p.Aarr) > PV.LIGHT && freeEdge(S, e)) { S.lights.push({ e, t: S.t, A: Math.abs(p.Aarr) }); if (S.step && S.step.k !== 'catch') S.step.lights++; E.push({ e: 'light', edge: e, A: Math.abs(p.Aarr) }); }
    }
    if (p.win && p.win.arrived && S.t - p.arr >= PV.WIN) E.push(...decide(S, p));
  }
  // fade out
  for (let i = S.pulses.length - 1; i >= 0; i--) { const p = S.pulses[i]; if (Math.abs(p.A) < PV.DIE && !(p.win && p.win.arrived && !p.win.done)) { S.pulses.splice(i, 1); if (S.touched && !p.free && !p.caught && p.max >= 0.05) { S.decayedSelf++; } E.push({ e: 'gone', id: p.id }); } }
  // ── the steps that close by state
  const st = S.step;
  if (S.phase === 'heichal' && st && S.P.phases[S.ph + 1] && S.edges.S.hooked && !st.e) { /* (not reached) */ }
  if (S.phase === 'heichal' && S.edges.S.hooked && S.P.phases[S.ph + 1] && !S.moving) { S.moving = 6; E.push({ e: 'to-box' }); }
  if (S.moving > 0) { S.moving -= dt; if (S.moving <= 0) { S.moving = 0; S.ph++; S.phase = S.P.phases[S.ph]; S.touched = false; E.push({ e: 'in-box' }); if (S.P.running) { const p = emit(S, 'S', S.P.running, 'running'); if (p) p.free = true; } } }
  if (st && st.k === 'quiet' && S.edges.S.hooked && S.edges.N.hooked && S.pulses.every((p) => Math.abs(p.A) < PV.QUIET) && !S.edges.N.held && !S.helper.held) {
    E.push(closeStep(S, S.decayedSelf === 0 ? 'gold' : S.decayedSelf === 1 ? 'good' : 'ok'));
  }
  if (!S.finale && !S.step && !S.done) { S.done = true; E.push({ e: 'done' }); }
  if (S.finale) finaleRearm(S);
  if (S.finale && S.finale.got >= 2 && !S.done && S.pulses.every((p) => Math.abs(p.A) < PV.DIE * 1.01 || p.id < 0)) { S.done = true; E.push({ e: 'done' }); }
  return E.filter(Boolean);
}
/** a pull: from when the edge starts to move until it slows under 20 dp/s or turns back; one pulse at its end */
function pullTrack(S, who, d) {
  const E = [];
  const vx = who === 'H' ? 0 : d.vx || 0, vy = d.vy || 0, sp = Math.hypot(vx, vy);
  if (!d.pull) { if (sp > PV.STILL) d.pull = { vmax: sp, ax: Math.abs(vx) >= Math.abs(vy) ? 'x' : 'y', sx: Math.sign(vx), sy: Math.sign(vy), t0: S.t }; return E; }
  const P = d.pull; if (sp > P.vmax) { P.vmax = sp; P.ax = Math.abs(vx) >= Math.abs(vy) ? 'x' : 'y'; }
  const turned = P.ax === 'x' ? Math.sign(vx) !== 0 && Math.sign(vx) !== P.sx : Math.sign(vy) !== 0 && Math.sign(vy) !== P.sy;
  if (sp < PV.STILL || turned) E.push(...pullEnd(S, who, d));
  return E;
}
function pullEnd(S, who, d) {
  const E = []; const P = d.pull; d.pull = null; if (!P) return E;
  // a move across within a catch window is a catch, not a pull (spec: the catch makes no pulse of its own)
  if (P.ax === 'y' && d.inWin != null && S.t - d.inWin < PV.WIN * 2 + 0.05) return E;
  const e = who === 'S' ? 'S' : 'N';
  const sign = P.ax === 'x' ? (P.sx >= 0 ? 1 : -1) : P.sy >= 0 ? 1 : -1;
  const A = sign * ampOf(P.vmax);
  const p = emit(S, e, A, who + P.ax);
  if (p) { if (S.free) { p.free = true; } E.push({ e: 'pulse', who, A }); S.free = false; }
  return E;
}
function decide(S, p) {
  const E = []; const w = p.win; w.done = true; p.win = null;
  const H = handsAt(S, w.e); const vs = vFor(p.Aarr);
  let best = null;
  for (const h of H) { const v = w.peak[h.who]; if (v == null || v < PV.CATCH_MIN) continue; const r = (v - vs) / vs; if (!best || Math.abs(r) < Math.abs(best.r)) best = { who: h.who, v, r }; }
  if (S.finale && best && S.finale.got === 1 && best.who === 'N') best = null;   // the echo: the other hand (the inner's fold sits in its hook)
  if (!best) { E.push({ e: 'miss', edge: w.e, A: p.Aarr }); if (S.finale) S.finale.tries += 0; return E; }
  let kind;
  if (Math.abs(best.r) <= PV.TOL) { p.A = p.Aarr * PV.CATCH_BACK; kind = 'catch'; }
  else if (best.r > PV.TOL) { p.A = p.Aarr * PV.CATCH_BACK; const ex = emit(S, w.e, Math.sign(p.Aarr) * PV.AMAX * (best.v - vs) / PV.VREF, 'excess'); kind = 'fast'; void ex; }
  else if (Math.abs(best.r) <= PV.PART) { p.A = p.Aarr * PV.PART_BACK; kind = 'part'; }
  else { kind = 'slow'; }
  if (kind !== 'slow') p.caught = true;
  const isFree = p.free && (p.why !== 'running' || !S.touched);
  const c = { kind, who: best.who, A: p.Aarr, r: best.r, t: S.t, free: isFree };
  S.catches.push(c); E.push({ e: 'catch', ...c, edge: w.e });
  if (!isFree) {
    const st = S.step;
    if (st && st.k === 'catch' && (kind === 'catch' || kind === 'part')) E.push(closeStep(S, kind === 'catch' ? 'gold' : 'good'));
    if (S.finale) {
      const F = S.finale;
      if (kind === 'catch' && F.got === 0 && best.who === 'N' && p.why === 'last') { F.got = 1; p.why = 'echo'; E.push({ e: 'first' }); }
      else if (kind === 'catch' && F.got === 1 && best.who === 'H' && p.why === 'echo') { F.got = 2; p.A = 0; E.push({ e: 'second' }); }
    }
  }
  return E;
}
/** the finale: the outer's fold settles into its hook in the south and sends one big wave north (on the first touch, not by a clock) */
function finaleWave(S) {
  const F = S.finale; if (F.wave) return [];
  F.wave = true; F.tries++; F.got = 0;
  const p = emit(S, 'S', PV.AMAX, 'last'); return [{ e: 'last-wave', id: p.id, try: F.tries }];
}
/** the finale's wave died (under 0.01) without the two catches: the next touch sends a new one */
export function finaleRearm(S) { if (S.finale && S.finale.wave && S.finale.got < 2 && !S.pulses.some((p) => p.why === 'last' || p.why === 'echo')) { S.finale.wave = false; S.touched = false; return true; } return false; }
export function finaleGrade(S) { const t = S.finale ? S.finale.tries : 9; return t <= 1 ? 'gold' : t === 2 ? 'good' : 'ok'; }
export function result(S, mul) {
  const g = S.finale ? [finaleGrade(S)] : S.steps.map((s) => s.grade);
  const n = S.finale ? 1 : plan(S).length;
  const pts = g.reduce((a, x) => a + (x === 'gold' ? 40 : x === 'good' ? 20 : 10), 0) * mul, base = n * 40 * mul, q = base ? pts / base : 0;
  const dmg = S.edges.S.tears + S.edges.N.tears;
  return { stars: q >= 0.85 && !dmg ? 3 : q >= 0.65 ? 2 : 1, q, pts, dmg, perfect: q >= 0.85 && !dmg };
}
