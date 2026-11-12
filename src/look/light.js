/* ── look C ── src/look/light.js — the work light of stages 01 to 04 (docs/specs/look/C-light-sky-air.md §C1, C2, C5): the ONE place that sets
 * the sun, the sky's fill, the haze and the exposure while a directed stage runs. The sun advances from morning toward noon as the stage's
 * works get done (progress 0..1, never the clock: the same progress always gives the same sun); it holds still while a minigame runs and eases
 * to its new place in the walk between works. Its colour is one soft golden light (the owner: one golden light, weaker and less yellow:
 * "האור הצהוב צריך להוריד. מכל המשחקונים"), the shade filled by a warm bounce from the ground's own tone so the stone's shaded faces stay warm.
 *
 *   workPreset(p, T, G, out?) → the light at progress p: { el, az, sun, sunI, hs, hg, hI, envI, exp, bloom, bloomT, fogN, fogF, sat, gain,
 *     lift, vig, sky } (sky: the dome's blend dawn → noon). T = main.js TIMES, G = main.js GRADE (pure: no three.js)
 *   lerpHex(a, b, t) → '#rrggbb' (sRGB) · sunDir(el, az, out?) → [x, y, z]
 *   createWorkLight(apply) → { set(o), tick(dt), force(p), state() }: o = { p, act, at, k } from the director every frame (k: the open work's
 *     kind: ACT_SUN holds some acts' sun higher), null when no stage
 *     runs; apply(L, how) is main.js's: how = 'move' (the sun and its colours), 'full' (and the environment), 'off' (the clock's preset back)
 *   shadowBox(target, dir, half, mapSize, out) → the shadow camera's centre snapped to whole shadow texels (no shimmer while it follows)
 * ── /look C ── */

export const WORK = Object.freeze({
  el: [28, 62],                 // the sun's elevation (deg) from the stage's first work to its last
  // the light at the stage's start (a softened morning, the sun itself near-white cream) and at its end (noon); the shade's fill: a warm
  // ground bounce (the hill's own earth tone) and a warm-neutral sky term (review J2: the blue sky term, '#C3CCDB', turned the pits and the
  // shade behind walls navy once the sun left them), a weaker environment (the sky's blue again)
  morning: { sun: '#FFEFD8', sunI: 2.55, hs: '#DACBAE', hg: '#C4AA84', hI: 1.15, envI: 0.15, exp: 0.86 },
  noon: { sun: '#FFF6E6', sunI: 2.7, hs: '#DCCFB6', hg: '#C6AC86', hI: 1.05, envI: 0.18, exp: 0.74 },
  sky0: 1,                      // the dome's blend toward noon at the stage's start (review J1: noon's blue sky all the way; was 0.65, pale)
  ease: 2.6,                    // seconds for the sun to reach its new place in the walk
  step: 0.2,                    // seconds between two moves of the shadows while it eases
});
// (C5) the acts whose work a long shadow would hide at the low sun (the shots at both ends of the sun's travel): their sun held higher.
// corner: the corner tower's shadow over the setting square; great: the cut crest's shadow over the great stone's road down
export const ACT_SUN = Object.freeze({ corner: [0.5, 1], great: [0.5, 1] });
export function actSun(k, p) { const r = ACT_SUN[k]; return r ? Math.max(r[0], Math.min(r[1], p)) : p; }

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
export function lerpHex(a, b, t) {
  const pa = parseInt(String(a).slice(1), 16), pb = parseInt(String(b).slice(1), 16);
  let o = 0;
  for (const s of [16, 8, 0]) o |= Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t)) << s;
  return '#' + o.toString(16).padStart(6, '0').toUpperCase();
}
export function sunDir(el, az, out = [0, 0, 0]) {
  const e = el * Math.PI / 180, a = az * Math.PI / 180;
  out[0] = Math.cos(e) * Math.cos(a); out[1] = Math.sin(e); out[2] = Math.cos(e) * Math.sin(a);
  return out;
}
/** the light at progress p (0: the stage's first work, 1: its last) */
export function workPreset(p, T, G, out = {}) {
  const u = clamp01(+p || 0), D = T.dawn, N = T.noon, M = WORK.morning, Z = WORK.noon;
  const el = lerp(WORK.el[0], WORK.el[1], u);
  // (the azimuth along the presets' own path: the dawn's at its elevation, the noon's at 62°)
  const k = clamp01((el - D.el) / (N.el - D.el));
  out.el = el; out.az = lerp(D.az, N.az, k);
  out.sun = lerpHex(M.sun, Z.sun, u); out.sunI = lerp(M.sunI, Z.sunI, u);
  out.hs = lerpHex(M.hs, Z.hs, u); out.hg = lerpHex(M.hg, Z.hg, u); out.hI = lerp(M.hI, Z.hI, u);
  out.envI = lerp(M.envI, Z.envI, u); out.exp = lerp(M.exp, Z.exp, u);
  out.bloom = lerp(D.bloom, N.bloom, u); out.bloomT = lerp(D.bloomT, N.bloomT, u);
  const s = lerp(WORK.sky0, 1, u); out.sky = s;
  const gd = G.dawn, gn = G.noon;
  out.fogN = lerp(gd.fogN, gn.fogN, s); out.fogF = lerp(gd.fogF, gn.fogF, s); out.sat = lerp(gd.sat, gn.sat, s); out.vig = lerp(gd.vig, gn.vig, s);
  // (the grade's warm gain and cool lift mostly the noon's: the dawn's would tint the cream stone orange again)
  const g = 0.7 + 0.3 * u;
  out.gain = [0, 1, 2].map((i) => lerp(gd.gain[i], gn.gain[i], g)); out.lift = [0, 1, 2].map((i) => lerp(gd.lift[i], gn.lift[i], g));
  out.p = u;
  return out;
}
/** the shadow camera's centre: the target moved to the nearest whole texel of the light's view (it follows the play camera without shimmer) */
export function shadowBox(t, d, half, size, out = [0, 0, 0]) {
  // the light's right and up axes (d: toward the sun, unit)
  let rx = d[2], rz = -d[0]; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
  const ux = d[1] * rz - 0 * d[2], uy = d[2] * rx - d[0] * rz, uz = 0 * d[0] - d[1] * rx;   // up = d × right
  const tex = (2 * half) / size;
  const a = t[0] * rx + t[2] * rz, b = t[0] * ux + t[1] * uy + t[2] * uz, c = t[0] * d[0] + t[1] * d[1] + t[2] * d[2];
  const sa = Math.round(a / tex) * tex, sb = Math.round(b / tex) * tex;
  // back to the world from the snapped (right, up) and the unsnapped depth (the box's depth is not seen)
  const ul = Math.hypot(ux, uy, uz) || 1;
  for (let i = 0; i < 3; i++) out[i] = [rx, 0, rz][i] * sa + [ux, uy, uz][i] * sb / (ul * ul) + d[i] * c;
  return out;
}

export function createWorkLight(apply) {
  const S = { on: false, want: 0, cur: 0, act: false, at: null, forced: null, acc: 0, moving: false, fresh: true };
  const go = (how) => { try { apply(S.forced != null ? actSun(S.k, S.forced) : S.cur, how, S); } catch (e) { /* the world keeps its light */ } };
  return {
    /** the director, every frame: { p, act, at } (null: no directed stage now) */
    set(o) {
      if (!o) { if (S.on) { S.on = false; S.fresh = true; go('off'); } return; }
      S.k = o.k || null; const p = actSun(S.k, clamp01(+o.p || 0)), act = !!o.act;
      S.want = p; S.at = o.at || null;
      if (!S.on) { S.on = true; S.cur = p; S.act = act; S.fresh = false; go('full'); return; }
      // (an act begins: the sun at its place for this progress, then still for the whole act)
      if (act && !S.act && Math.abs(S.cur - p) > 1e-4) { S.cur = p; S.moving = false; go('full'); }
      if (act !== S.act) { S.act = act; go('act'); }
    },
    tick(dt) {
      if (!S.on || S.act) return;
      const d = S.want - S.cur;
      if (Math.abs(d) < 1e-4) { if (S.moving) { S.moving = false; S.cur = S.want; go('full'); } return; }
      const v = Math.max(Math.abs(d), 0.02) / WORK.ease * dt;
      S.cur = Math.abs(d) <= v ? S.want : S.cur + Math.sign(d) * v;
      S.moving = true; S.acc += dt;
      if (S.acc >= WORK.step) { S.acc = 0; go('move'); }
    },
    /** tests and the after shots: the light at p (null: the stage's own again) */
    again() { if (S.on) go('full'); },
    force(p) { S.forced = p == null ? null : clamp01(+p); if (S.on) go('full'); return S.on; },
    get on() { return S.on; },
    state: () => ({ on: S.on, p: +S.cur.toFixed(4), want: +S.want.toFixed(4), act: S.act, forced: S.forced }),
  };
}
