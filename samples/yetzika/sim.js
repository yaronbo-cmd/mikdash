// Height-field simulation of the molten mix inside one foundation segment.
// Pure logic, no three.js, no DOM: it runs the same in the browser and in node (tuning harness).
// Units: amot and seconds. x across the segment (-6..6), z from the far board (-4) to the near board (+4).

export const NX = 60, NZ = 40, DX = 0.2;
export const W = NX * DX, D = NZ * DX;      // 12 x 8 amot inside the frame
export const H = 1.0;                       // frame height = target depth
export const X0 = -W / 2, Z0 = -D / 2;
export const N = NX * NZ;

// ---- tuning -------------------------------------------------------------------------------
export const T = {
  KFLOW: 6.5322,       // flow conductance (amah^2/s) for hot, deep mix
  DEPTH_REF: 0.14,     // thinner than this flows more sluggishly (viscous film)
  DEPTH_MINF: 0.53,    // floor of the depth factor
  FLUID_LO: 0.25, FLUID_HI: 0.5614, // fluidity = smoothstep(lo, hi, heat)
  COOL_BASE: 0.0078,   // heat lost per second by any liquid cell (mix that travels far loses its heat: a deep pool fed only from the centre is too cool by the time it spills into a passage)
  COOL_THIN: 0.0129,   // + this / (depth + COOL_EPS): thin layers and the front cool fast
  COOL_EPS: 0.0396,
  FREEZE: 0.2,         // heat below which liquid turns to solid
  FULL_LEVEL: 0.7742,  // a cell is full (and a hardened passage counts as closed) when ground+solid+vol reaches this
  STONE_LEVEL: 0.97,   // ground above this: stone the mix cannot cover
  QMAX: 2.269,          // amah^3/s at full tilt
  TILT_POW: 0.8587,
  CAP_FRAC: 0.6563,    // cauldron = 66% of the free volume (two cauldrons can fill the segment)
  CAULDRON_COOL: 0.0122,// cauldron heat loss per second
  CAULDRON_MIN: 0.35,  // colder than this: crew fetch a new one
  SWAP_TIME: 3.0,
  POUR_CAP: 1.0,       // the stream stops landing when the surface there reaches this
  POUR_RAMP: 0.08,
  MAX_CAULDRONS: 4,
  EDGE_SHARE: 0.9237,  // a cell cools as if at least this share of its deepest neighbour's depth
  MISS_LEVEL: 0.5962,  // lower than this counts as missing (a hollow); between this and FULL_LEVEL looks full
  MIN_HOLLOW: 21,      // smaller unfilled specks do not count
  PLUG_R: 1.3,
  SUBSTEPS: 6,
  SET_BOOST: 5,        // cooling multiplier once the segment is done and only waits for the knock
  SPOUT_LAG: 4, TILT_UP: 6, TILT_DOWN: 4,
  JET_V: 3.4,          // stream momentum: speed (amah/s) of the push away from the spout
  JET_LEN0: 1.2856, JET_LEN1: 2.0821, JET_HALFW: 0.5, JET_UPHILL: 0.12,
  RUNOFF_STEPS: 26,    // a stream hitting a hardened mound runs down it for up to this many cells
  RUNOFF_DROP: 0.03, RUNOFF_POOL: 0.06, RUNOFF_COOL: 0,
  COOL_DRY: 0.1065, DRY_DEPTH: 0.0885,   // extra cooling of a thin film on the bare floor (a trickle)
};

// ---- stones -------------------------------------------------------------------------------
// x, z, rx, rz, height, rotation, tinted ("dug yourself")
export const STONES = [
  // barrier between the near area and the two back pockets, two narrow passages
  [-5.00, -1.25, 1.30, 0.95, 1.40, 0.15, 0],
  [-1.72, -1.40, 1.32, 0.95, 1.30, -0.2, 1],
  [ 0.00, -3.00, 1.85, 2.20, 1.55, 0.05, 0],
  [ 1.95, -1.35, 1.32, 0.95, 1.35, 0.25, 0],
  [ 5.05, -1.20, 1.28, 1.00, 1.45, -0.1, 0],
  // near area
  [-1.55,  1.55, 0.92, 0.80, 1.30, 0.4, 0],
  [ 2.25,  2.00, 0.82, 0.72, 1.25, -0.3, 0],
  [-4.85,  2.55, 0.52, 0.46, 0.55, 0.2, 1],
  [ 0.10,  0.35, 0.78, 0.62, 1.10, 0.9, 0],   // right in front of the spout's starting spot: a centre pour piles here
  [ 4.50,  2.75, 0.42, 0.40, 0.45, 0.0, 0],
  [-3.10,  3.15, 0.36, 0.34, 0.40, 0.6, 0],
  [ 5.25,  0.65, 0.60, 0.55, 0.90, 0.3, 0],
  // inside the pockets
  [-3.20, -3.25, 0.44, 0.40, 0.50, 0.5, 0],
  [ 3.60, -3.15, 0.46, 0.40, 0.55, -0.4, 1],
  // two wedge stones against the side boards: no crack along the walls, the pockets open only through the passages
  [-5.92, -1.25, 0.42, 0.85, 1.15, 0.0, 0],
  [ 5.92, -1.15, 0.42, 0.85, 1.20, 0.0, 0],
];

// deterministic small PRNG
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// each stone: irregular radius r(theta) and a rounded height profile
export function makeStoneShapes(seed = 8) {
  const rnd = mulberry32(seed);
  return STONES.map(([x, z, rx, rz, h, rot, tint]) => ({
    x, z, rx, rz, h, rot, tint,
    a: [rnd() * 0.12 + 0.05, rnd() * 0.07 + 0.03, rnd() * 0.04 + 0.01],
    p: [rnd() * 6.283, rnd() * 6.283, rnd() * 6.283],
    lean: [(rnd() - 0.5) * 0.25, (rnd() - 0.5) * 0.25],
  }));
}
export function stoneRadiusScale(s, th) {
  return 1 + s.a[0] * Math.sin(2 * th + s.p[0]) + s.a[1] * Math.sin(3 * th + s.p[1]) + s.a[2] * Math.sin(5 * th + s.p[2]);
}
// height of stone s at world (x,z); <=0 outside
export function stoneHeightAt(s, x, z) {
  const dx = x - s.x, dz = z - s.z;
  const c = Math.cos(s.rot), sn = Math.sin(s.rot);
  const lx = dx * c + dz * sn, lz = -dx * sn + dz * c;
  const ex = lx / s.rx, ez = lz / s.rz;
  const th = Math.atan2(ez, ex);
  const u = Math.sqrt(ex * ex + ez * ez) / stoneRadiusScale(s, th);
  if (u >= 1) return 0;
  const prof = Math.pow(1 - u * u, 0.55);
  return s.h * prof * (1 + s.lean[0] * ex + s.lean[1] * ez);
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function cellX(i) { return X0 + (i + 0.5) * DX; }
export function cellZ(k) { return Z0 + (k + 0.5) * DX; }

// far corners and the two pockets, for the "reached" rewards
export const TARGETS = [
  { name: 'pocketL', x: -3.6, z: -2.4, r: 0.5, word: 'הגיע!' },
  { name: 'pocketR', x: 3.75, z: -2.4, r: 0.5, word: 'הגיע!' },
  { name: 'cornerL', x: -5.6, z: -3.6, r: 0.45, word: 'פינה!' },
  { name: 'cornerR', x: 5.6, z: -3.6, r: 0.45, word: 'פינה!' },
];

export function createSim(seed = 8) {
  const shapes = makeStoneShapes(seed);
  const ground = new Float32Array(N);
  const vol = new Float32Array(N);
  const heat = new Float32Array(N);
  const solid = new Float32Array(N);
  const patch = new Uint8Array(N);       // hardened during a repour
  const floor = new Uint8Array(N);       // must be filled
  const passableBase = new Uint8Array(N);// not a stone
  const reach = new Uint8Array(N);
  const hollow = new Uint8Array(N);
  const plug = new Uint8Array(N);
  const prevReach = new Uint8Array(N);
  const fl = new Float32Array(N);
  const fx = new Float32Array(N);        // flux i -> i+1
  const fz = new Float32Array(N);        // flux k -> k+1
  const outSum = new Float32Array(N);
  const hv = new Float32Array(N);
  const queue = new Int32Array(N);
  const dist = new Int32Array(N);
  const freezeAge = new Float32Array(N); // seconds since this cell last froze (for visuals)

  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    const x = cellX(i), z = cellZ(k);
    let g = 0;
    for (const s of shapes) g = Math.max(g, stoneHeightAt(s, x, z));
    ground[k * NX + i] = g;
  }
  for (let c = 0; c < N; c++) {
    passableBase[c] = ground[c] < T.STONE_LEVEL ? 1 : 0;
    floor[c] = ground[c] < T.FULL_LEVEL - 0.02 ? 1 : 0;
  }
  // landing band: source of reachability
  const kSrc = Math.floor((1.9 - Z0) / DX);

  const sim = {
    shapes, ground, vol, heat, solid, patch, floor, reach, hollow, plug, freezeAge,
    time: 0,
    cauldron: { amount: 0, cap: 0, heat: 1, swapping: 0, used: 1, poured: 0, total: 0 },
    spout: { t: 0.5, tilt: 0, lx: 0, lz: 3.6, q: 0 },
    moving: 0,          // total flux this step
    stillTime: 0,       // seconds of no free mix moving
    noPourTime: 0,
    hollowCells: 0, missingCells: 0, filledFraction: 0, floorCount: 0, freeVolume: 0,
    sealEvents: [],     // {x,z,cells} pushed when a pocket closes
    freezeCount: 0,
    lastFreezeX: 0, lastFreezeZ: 0,
    repour: false,
    setting: false,
    hold: false,        // the game holds the cauldron (knock, results)     // the segment is done: let the last liquid set quickly before the knock
    exhausted: false,
  };

  let fv = 0, fc = 0;
  for (let c = 0; c < N; c++) if (floor[c]) { fv += (H - ground[c]) * DX * DX; fc++; }
  sim.freeVolume = fv; sim.floorCount = fc;
  sim.cauldron.cap = sim.cauldron.amount = fv * T.CAP_FRAC;

  // remove floor cells that cannot be reached even when empty (tiny cracks between stones)
  {
    computeReach();
    for (let c = 0; c < N; c++) if (floor[c] && !reach[c]) { floor[c] = 0; passableBase[c] = 0; }
    fc = 0; for (let c = 0; c < N; c++) if (floor[c]) fc++;
    sim.floorCount = fc;
    prevReach.set(reach);
  }

  // a cell lets mix through when it is not a stone and either not yet hardened full, or has liquid on top
  function isOpen(c) {
    return passableBase[c] && (ground[c] + solid[c] < T.FULL_LEVEL || vol[c] > 0.02);
  }
  function computeReach() {
    reach.fill(0);
    let qh = 0, qt = 0;
    for (let k = kSrc; k < NZ; k++) for (let i = 0; i < NX; i++) {
      const c = k * NX + i;
      if (isOpen(c)) { reach[c] = 1; queue[qt++] = c; }
    }
    while (qh < qt) {
      const c = queue[qh++];
      const i = c % NX;
      if (i > 0) { const n = c - 1; if (!reach[n] && isOpen(n)) { reach[n] = 1; queue[qt++] = n; } }
      if (i < NX - 1) { const n = c + 1; if (!reach[n] && isOpen(n)) { reach[n] = 1; queue[qt++] = n; } }
      if (c >= NX) { const n = c - NX; if (!reach[n] && isOpen(n)) { reach[n] = 1; queue[qt++] = n; } }
      if (c < N - NX) { const n = c + NX; if (!reach[n] && isOpen(n)) { reach[n] = 1; queue[qt++] = n; } }
    }
  }

  // keep only the components of mask (4-connected) with at least MIN_HOLLOW cells; returns cells kept
  const comp = new Int32Array(N);
  function keepBig(mask) {
    comp.fill(0);
    let kept = 0;
    for (let s = 0; s < N; s++) {
      if (!mask[s] || comp[s]) continue;
      let qh = 0, qt = 0;
      queue[qt++] = s; comp[s] = 1;
      while (qh < qt) {
        const c = queue[qh++];
        const i = c % NX;
        if (i > 0 && mask[c - 1] && !comp[c - 1]) { comp[c - 1] = 1; queue[qt++] = c - 1; }
        if (i < NX - 1 && mask[c + 1] && !comp[c + 1]) { comp[c + 1] = 1; queue[qt++] = c + 1; }
        if (c >= NX && mask[c - NX] && !comp[c - NX]) { comp[c - NX] = 1; queue[qt++] = c - NX; }
        if (c < N - NX && mask[c + NX] && !comp[c + NX]) { comp[c + NX] = 1; queue[qt++] = c + NX; }
      }
      if (qt < T.MIN_HOLLOW) { for (let j = 0; j < qt; j++) mask[queue[j]] = 0; }
      else kept += qt;
    }
    return kept;
  }

  // find where a closed region was cut off: BFS from the reachable area through hardened cells
  function findPlug(target) {
    dist.fill(-1);
    let qh = 0, qt = 0;
    for (let c = 0; c < N; c++) if (reach[c]) { dist[c] = 0; queue[qt++] = c; }
    if (qt === 0) for (let k = kSrc; k < NZ; k++) for (let i = 0; i < NX; i++) {
      const c = k * NX + i; if (passableBase[c] && !target[c]) { dist[c] = 0; queue[qt++] = c; }
    }
    let best = 1e9, bx = 0, bz = 0, bn = 0;
    while (qh < qt) {
      const c = queue[qh++];
      const i = c % NX, k = (c - i) / NX;
      const d = dist[c] + 1;
      if (d > best) break;
      for (let j = 0; j < 4; j++) {
        let n;
        if (j === 0) { if (i === 0) continue; n = c - 1; }
        else if (j === 1) { if (i === NX - 1) continue; n = c + 1; }
        else if (j === 2) { if (k === 0) continue; n = c - NX; }
        else { if (k === NZ - 1) continue; n = c + NX; }
        if (dist[n] >= 0 || !passableBase[n]) continue;
        if (target[n]) {
          if (d < best) { best = d; bx = 0; bz = 0; bn = 0; }
          if (d === best) { const ni = n % NX; bx += cellX(ni); bz += cellZ((n - ni) / NX); bn++; }
          continue;
        }
        if (hollow[n]) continue;
        dist[n] = d; queue[qt++] = n;
      }
    }
    if (!bn) return null;
    const ex = bx / bn, ez = bz / bn;
    // the plug: hardened cells between the open area and the closed region, near its entrance
    let px = 0, pz = 0, pn = 0;
    for (let c = 0; c < N; c++) {
      if (dist[c] > 0 && !reach[c]) {
        const i = c % NX, k = (c - i) / NX;
        const ddx = cellX(i) - ex, ddz = cellZ(k) - ez;
        if (ddx * ddx + ddz * ddz < T.PLUG_R * T.PLUG_R) { plug[c] = 1; px += cellX(i); pz += cellZ(k); pn++; }
      }
    }
    if (pn) return { x: px / pn, z: pz / pn, ex, ez };
    return { x: ex, z: ez, ex, ez };
  }

  const mask = new Uint8Array(N);
  const prevHollow = new Uint8Array(N);
  function updateHollow() {
    prevReach.set(reach);
    prevHollow.set(hollow);
    computeReach();
    let full = 0;
    for (let c = 0; c < N; c++) {
      if (!floor[c]) { mask[c] = 0; continue; }
      const lvl = ground[c] + solid[c] + vol[c];
      if (lvl >= T.FULL_LEVEL) full++;
      mask[c] = lvl < T.MISS_LEVEL ? 1 : 0;     // clearly low: what the eye (and the knock) finds missing
    }
    sim.filledFraction = full / sim.floorCount;
    sim.missingCells = keepBig(mask);              // every unfilled region worth knocking on
    let hc = 0, newly = 0;
    for (let c = 0; c < N; c++) {
      const h = mask[c] && !reach[c] ? 1 : 0;
      hollow[c] = h;
    }
    hc = keepBig(hollow);
    for (let c = 0; c < N; c++) if (hollow[c] && !prevHollow[c] && prevReach[c]) newly++;
    sim.hollowCells = hc;
    if (newly >= T.MIN_HOLLOW) {
      for (let c = 0; c < N; c++) mask[c] = hollow[c] && !prevHollow[c] ? 1 : 0;
      const p = findPlug(mask);
      if (p) sim.sealEvents.push({ x: p.x, z: p.z, ex: p.ex, ez: p.ez, cells: newly, time: sim.time });
    }
  }

  function pour(dt, tTarget, tiltTarget) {
    const sp = sim.spout, ca = sim.cauldron;
    // the crew follow the thumb with a little lag; the tilt eases (back to zero on release)
    sp.t += (tTarget - sp.t) * Math.min(1, dt * T.SPOUT_LAG);
    sp.tilt += (tiltTarget - sp.tilt) * Math.min(1, dt * (tiltTarget > sp.tilt ? T.TILT_UP : T.TILT_DOWN));
    sp.lx = X0 + 0.4 + sp.t * (W - 0.8);
    sp.lz = 3.65 - 1.7 * sp.tilt;
    sp.q = 0;
    if (sim.hold) return;
    if (ca.swapping > 0) {
      ca.swapping -= dt;
      if (ca.swapping <= 0) {
        ca.swapping = 0; ca.amount = ca.cap; ca.heat = 1; ca.used++; ca.poured = 0;
        sim.newCauldron = true;
      }
      return;
    }
    if (sim.exhausted) return;
    ca.heat = Math.max(0, ca.heat - T.CAULDRON_COOL * dt);
    if (ca.amount <= 1e-4 || ca.heat < T.CAULDRON_MIN) {
      if (ca.used >= T.MAX_CAULDRONS) { sim.exhausted = true; ca.amount = Math.max(ca.amount, 0); return; }
      ca.swapping = T.SWAP_TIME;
      return;
    }
    if (sp.tilt < 0.04) return;
    const i0 = Math.max(1, Math.min(NX - 2, Math.round((sp.lx - X0) / DX - 0.5)));
    let k0 = Math.max(1, Math.min(NZ - 2, Math.round((sp.lz - Z0) / DX - 0.5)));
    // a stream that hits a stone runs off it toward the spout side
    while (k0 < NZ - 2 && (!passableBase[k0 * NX + i0] || ground[k0 * NX + i0] > 0.85)) k0++;
    sp.lz = cellZ(k0);
    let cc = k0 * NX + i0, walked = 0;
    // a stream landing on a hardened mound runs down its side to the foot (steepest descent)
    for (let s = 0; s < T.RUNOFF_STEPS; s++) {
      const sc = ground[cc] + solid[cc] + vol[cc];
      if (vol[cc] > T.RUNOFF_POOL) break;              // landed in a pool: it stays there
      const ci = cc % NX;
      let best = -1, bs = sc - T.RUNOFF_DROP;
      if (ci > 1) { const n = cc - 1, s2 = ground[n] + solid[n] + vol[n]; if (passableBase[n] && s2 < bs) { bs = s2; best = n; } }
      if (ci < NX - 2) { const n = cc + 1, s2 = ground[n] + solid[n] + vol[n]; if (passableBase[n] && s2 < bs) { bs = s2; best = n; } }
      if (cc >= 2 * NX) { const n = cc - NX, s2 = ground[n] + solid[n] + vol[n]; if (passableBase[n] && s2 < bs) { bs = s2; best = n; } }
      if (cc < N - 2 * NX) { const n = cc + NX, s2 = ground[n] + solid[n] + vol[n]; if (passableBase[n] && s2 < bs) { bs = s2; best = n; } }
      if (best < 0) break;
      cc = best; walked++;
    }
    const ci0 = cc % NX, ck0 = (cc - ci0) / NX;
    const inHeat = Math.max(0, ca.heat - T.RUNOFF_COOL * walked);   // a rivulet over cold crust loses heat on the way
    sp.fx = cellX(ci0); sp.fz = cellZ(ck0);
    const surf = ground[cc] + solid[cc] + vol[cc];
    const eff = Math.min(1, Math.max(0, (T.POUR_CAP - surf) / T.POUR_RAMP));
    let q = T.QMAX * Math.pow(sp.tilt, T.TILT_POW) * eff * dt;
    if (q > ca.amount) q = ca.amount;
    if (q <= 0) return;
    ca.amount -= q; ca.poured += q; ca.total += q;
    sp.q = q / dt;
    const depth = q / (DX * DX);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      const w = (a === 0 ? 2 : 1) * (b === 0 ? 2 : 1) / 16;
      const c = (ck0 + a) * NX + (ci0 + b);
      if (!passableBase[c]) {
        // stone under the stream: it runs off onto the centre cell
        const add = depth * w;
        mixIn(cc, add, inHeat);
        continue;
      }
      mixIn(c, depth * w, inHeat);
    }
  }
  function mixIn(c, add, h) {
    const v = vol[c];
    heat[c] = v > 0 ? (heat[c] * v + h * add) / (v + add) : h;
    vol[c] = v + add;
  }

  function flow(sdt) {
    const k1 = T.KFLOW * sdt / (DX * DX);
    for (let c = 0; c < N; c++) {
      const v = vol[c];
      if (v <= 0) { fl[c] = 0; continue; }
      const f = smoothstep(T.FLUID_LO, T.FLUID_HI, heat[c]);
      const dfac = Math.max(T.DEPTH_MINF, Math.min(1, v / T.DEPTH_REF));
      fl[c] = Math.min(0.24, k1 * f * dfac);
    }
    outSum.fill(0);
    for (let k = 0; k < NZ; k++) {
      const row = k * NX;
      for (let i = 0; i < NX; i++) {
        const c = row + i;
        const sc = ground[c] + solid[c] + vol[c];
        if (i < NX - 1) {
          const n = c + 1;
          const sn = ground[n] + solid[n] + vol[n];
          const d = sc - sn;
          let f = 0;
          if (d > 0) { f = fl[c] * Math.min(d, vol[c]); outSum[c] += f; }
          else if (d < 0) { f = -fl[n] * Math.min(-d, vol[n]); outSum[n] -= f; }
          fx[c] = f;
        } else fx[c] = 0;
        if (k < NZ - 1) {
          const n = c + NX;
          const sn = ground[n] + solid[n] + vol[n];
          const d = sc - sn;
          let f = 0;
          if (d > 0) { f = fl[c] * Math.min(d, vol[c]); outSum[c] += f; }
          else if (d < 0) { f = -fl[n] * Math.min(-d, vol[n]); outSum[n] -= f; }
          fz[c] = f;
        } else fz[c] = 0;
      }
    }
    // scale so no cell gives more than it has
    for (let c = 0; c < N; c++) {
      const o = outSum[c];
      outSum[c] = o > vol[c] ? vol[c] / o : 1;   // reuse as scale
      hv[c] = vol[c] * heat[c];
    }
    let moved = 0;
    for (let c = 0; c < N; c++) {
      let f = fx[c];
      if (f !== 0) {
        const n = c + 1;
        if (f > 0) { f *= outSum[c]; vol[c] -= f; vol[n] += f; hv[c] -= f * heat[c]; hv[n] += f * heat[c]; moved += f; }
        else { f *= outSum[n]; vol[c] -= f; vol[n] += f; hv[c] -= f * heat[n]; hv[n] += f * heat[n]; moved -= f; }
      }
      f = fz[c];
      if (f !== 0) {
        const n = c + NX;
        if (f > 0) { f *= outSum[c]; vol[c] -= f; vol[n] += f; hv[c] -= f * heat[c]; hv[n] += f * heat[c]; moved += f; }
        else { f *= outSum[n]; vol[c] -= f; vol[n] += f; hv[c] -= f * heat[n]; hv[n] += f * heat[n]; moved -= f; }
      }
    }
    for (let c = 0; c < N; c++) {
      const v = vol[c];
      if (v > 1e-6) heat[c] = Math.min(1, Math.max(0, hv[c] / v));
      else if (v < 0) vol[c] = 0;
    }
    return moved;
  }

  // the falling stream pushes freshly landed mix away from the spout (into the frame)
  function jet(sdt) {
    const sp = sim.spout;
    if (sp.q <= 0 || T.JET_V <= 0) return 0;
    const len = T.JET_LEN0 + T.JET_LEN1 * sp.tilt;
    const hw = T.JET_HALFW;
    const i0 = Math.max(0, Math.floor((sp.lx - hw - X0) / DX));
    const i1 = Math.min(NX - 1, Math.ceil((sp.lx + hw - X0) / DX));
    const kTop = Math.min(NZ - 1, Math.round((sp.lz - Z0) / DX));
    const kBot = Math.max(1, Math.round((sp.lz - len - Z0) / DX));
    const vmax = T.JET_V * Math.min(1, sp.tilt * 1.4);
    let moved = 0;
    for (let k = kBot; k <= kTop; k++) {
      const along = (sp.lz - cellZ(k)) / len;          // 0 at landing .. 1 at the end
      if (along < -0.1 || along > 1) continue;
      const vz = vmax * (1 - Math.max(0, along));
      for (let i = i0; i <= i1; i++) {
        const c = k * NX + i, n = c - NX;
        const v = vol[c];
        if (v <= 1e-4 || !passableBase[n]) continue;
        const ax = (cellX(i) - sp.lx) / hw;
        const wgt = 1 - ax * ax;
        if (wgt <= 0) continue;
        const f = smoothstep(T.FLUID_LO, T.FLUID_HI, heat[c]);
        const sc = ground[c] + solid[c] + v, sn = ground[n] + solid[n] + vol[n];
        const room = Math.max(0, sc - sn + T.JET_UPHILL);
        let a = v * Math.min(0.5, vz * wgt * f * sdt / DX);
        if (a > room * 0.5) a = room * 0.5;
        if (a <= 0) continue;
        const hn = vol[n];
        heat[n] = hn > 0 ? (heat[n] * hn + heat[c] * a) / (hn + a) : heat[c];
        vol[n] = hn + a; vol[c] = v - a;
        moved += a;
      }
    }
    return moved;
  }

  function cool(dt) {
    let fc = 0;
    for (let c = 0; c < N; c++) {
      freezeAge[c] += dt;
      const v = vol[c];
      if (v <= 0) continue;
      if (v < 2e-4) { solid[c] += v; vol[c] = 0; continue; }
      // a thin edge lying against a deep pool is kept warm by it (cools like part of the pool)
      const i = c % NX;
      let vn = 0;
      if (i > 0 && vol[c - 1] > vn) vn = vol[c - 1];
      if (i < NX - 1 && vol[c + 1] > vn) vn = vol[c + 1];
      if (c >= NX && vol[c - NX] > vn) vn = vol[c - NX];
      if (c < N - NX && vol[c + NX] > vn) vn = vol[c + NX];
      const ve = Math.max(v, T.EDGE_SHARE * vn);
      let r = T.COOL_BASE + T.COOL_THIN / (ve + T.COOL_EPS);
      // a thin film running over the bare cold floor (nothing deep beside it) loses its heat into the stone
      if (ve < T.DRY_DEPTH && solid[c] < 0.02) r += T.COOL_DRY * (1 - ve / T.DRY_DEPTH);
      if (sim.setting) r *= T.SET_BOOST;
      const h = heat[c] - r * dt;
      heat[c] = h;
      if (h < T.FREEZE) {
        solid[c] += v; vol[c] = 0; freezeAge[c] = 0;
        if (sim.repour) patch[c] = 1;
        fc++;
        sim.lastFreezeX = cellX(i); sim.lastFreezeZ = cellZ((c - i) / NX);
      }
    }
    sim.freezeCount += fc;
  }

  let stepCount = 0;
  sim.step = function (dt, tTarget, tiltTarget) {
    sim.time += dt;
    pour(dt, tTarget, tiltTarget);
    let moved = 0;
    const sdt = dt / T.SUBSTEPS;
    for (let s = 0; s < T.SUBSTEPS; s++) { moved += flow(sdt); jet(sdt); }
    cool(dt);
    sim.moving = moved / dt;
    // "free mix moving": anything flowing noticeably, or still pouring
    if (sim.moving > 0.02 || sim.spout.q > 0) sim.stillTime = 0; else sim.stillTime += dt;
    if (sim.spout.q > 0) sim.noPourTime = 0; else if (!sim.cauldron.swapping) sim.noPourTime += dt;
    if (++stepCount % 6 === 0) updateHollow();
  };
  sim.updateHollow = updateHollow;

  // the segment is done: whatever liquid is left sets where it stands
  sim.freezeAll = function () {
    for (let c = 0; c < N; c++) if (vol[c] > 0) { solid[c] += vol[c]; vol[c] = 0; heat[c] = 0; if (sim.repour) patch[c] = 1; }
    updateHollow();
  };
  sim.liquidVolume = function () { let s = 0; for (let c = 0; c < N; c++) s += vol[c]; return s * DX * DX; };
  sim.hotLiquid = function () { let n = 0; for (let c = 0; c < N; c++) if (vol[c] > 0.01 && heat[c] > T.FLUID_LO + 0.05) n++; return n; };

  // crew lift out the hardened mix of this segment
  sim.clearMix = function () {
    vol.fill(0); solid.fill(0); heat.fill(0); hollow.fill(0); plug.fill(0);
    sim.repour = true;
    sim.exhausted = false;
    const ca = sim.cauldron;
    ca.amount = ca.cap; ca.heat = 1; ca.swapping = 0; ca.used = 1; ca.poured = 0;
    sim.stillTime = 0; sim.noPourTime = 0; sim.setting = false;
    computeReach(); updateHollow();
  };
  sim.reset = function () {
    sim.clearMix(); patch.fill(0); sim.repour = false; sim.time = 0;
  };
  sim.isFull = function () {
    return sim.missingCells === 0;
  };
  // at the knock: every unfilled region counts, sealed or not; returns one entrance per region
  const regionMask = new Uint8Array(N);
  sim.markPlugsForHollows = function () {
    updateHollow();
    plug.fill(0);
    for (let c = 0; c < N; c++) mask[c] = floor[c] && ground[c] + solid[c] + vol[c] < T.MISS_LEVEL ? 1 : 0;
    keepBig(mask);
    hollow.set(mask);
    const work = new Uint8Array(N); work.set(mask);
    const out = [];
    for (let s = 0; s < N; s++) {
      if (!work[s]) continue;
      // flood one region
      regionMask.fill(0);
      let qh = 0, qt = 0; queue[qt++] = s; regionMask[s] = 1; work[s] = 0;
      while (qh < qt) {
        const c = queue[qh++], i = c % NX;
        const nb = [i > 0 ? c - 1 : -1, i < NX - 1 ? c + 1 : -1, c - NX, c + NX];
        for (const n of nb) if (n >= 0 && n < N && work[n]) { work[n] = 0; regionMask[n] = 1; queue[qt++] = n; }
      }
      const size = qt;
      let cx = 0, cz = 0;
      for (let c = 0; c < N; c++) if (regionMask[c]) { const i = c % NX; cx += cellX(i); cz += cellZ((c - i) / NX); }
      // hide the other regions from the plug search so it stops at this one
      const savedReach = reach.slice();
      reach.fill(0);
      for (let c = 0; c < N; c++) hollow[c] = mask[c] && !regionMask[c] ? 1 : 0;
      const p = findPlug(regionMask);
      reach.set(savedReach);
      out.push({ cells: size, x: cx / size, z: cz / size, plug: p });
    }
    hollow.set(mask);
    return out;
  };

  updateHollow();
  return sim;
}
