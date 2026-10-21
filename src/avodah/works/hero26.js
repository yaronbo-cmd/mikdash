/* ── hero26 ── hero26.js — the player IS the acting kohen (WAVE26 HERO26; the owner 10.10: "שהדמות הראשית תהיה השחקן, או אחד מהכהנים,
 * ובכל שלב היא הדמות המבצעת … גם בסוני פלייסטיישן פעם אני השוער פעם אני הבלם ופעם אני החלוץ"; and "המצלמה קופצת לשחקן הראשי שלנו שעומד
 * בהלם … צריכה להיות המשכיות").
 *   ONE mechanism for every work:
 *   - the figure.  man(k, a, s, y, { hero: true }) / figW(…, { hero: true }) draws that kohen with the HERO's look (his robe = stages.js
 *     buildHero's LIN, his skin from stages.hero.look(), the linen migba'at, the avnet — without the shani: no red in a work, ⚑ — and a
 *     gold ring at his feet like the hero's own marker). Without it, while a work runs, ONE figure per frame is picked by ACTOR[workId]
 *     (default: the first kohen-robe figure of the frame whose cap is the plain one — the ממונה with his gold cap is never the player).
 *     The picked figure's world spot and facing are kept (H.at): the real hero mesh comes back THERE after the work.
 *   - the epilogue.  EPILOGUE[workId] = { ms, draw(k, M, e, dt), move(o, n, e, k) }: after the last act the stage stays `ms` (default
 *     1500) with the figures completing; draw adds to the frame, move re-poses figures (the row walks off, the circle breaks). The day
 *     awaits it before the camera glides back and before the mentor line and the next ממונה bubble.
 *   - the day's side (day/index.js `// ── hero26 ──`): begin() hides the hero mesh, back() sets him at the actor's last spot facing the next
 *     open marker and walks one step, and "no standing in shock": no marker within 6 amot → the next task's marker pulses, he turns to it.
 * Never a Divine Name; nothing red; taps alone finish every work (nothing here waits on the player). ── /hero26 ── */

import { ANCHORS } from './anchors.js';

export const HERO_ROBE = '#F6F2E9';           // (stages.js buildHero: LIN — the hero's ketonet)
export const HERO_SKINS = ['#E3B592', '#D2A078', '#B98460', '#93613F'];   // (stages.js look(): SKINS[i][0])
const KOHEN = '#EFE9DA';                      // (figures.js ROBE.kohen)
const RING = '!#FFD66E';                      // (the hero's gold marker ring, unlit)

/** the state: on (a work runs or its epilogue), the work id, this frame's counters, the actor's last world spot */
export const H = { on: false, work: null, n: 0, nk: 0, picked: false, at: null, skin: HERO_SKINS[1], ep: -1, M: null, frames: 0, actorFrames: 0, robe: null, idx: -1, epT0: 0, hidden: false, log: [] };
export const heroOn = () => H.on;

const plain = (o) => o.robe === KOHEN && !o.cap && !o.lying && !o.sit;
const notScreen = (o) => plain(o) && o.pose !== 'raise' && o.pose !== 'bow';
/** which figure of the frame is the player's: (o, n = index of all figures this frame, nk = index of the kohen-robe ones) → bool */
export const ACTOR = {
  payis: (o, n) => n === 0, payis2: (o, n) => n === 0, payis3: (o, n) => n === 0, payis4: (o, n) => n === 0,   // (the seat HERO_SEAT = 0 — FIX26)
  zerika: notScreen, erev: notScreen,                                                                             // (the receiver with the vessel — not the two who hold the screen)
  shir: (o) => plain(o) && (o.pose === 'hold' || o.pose === 'carry' || o.pose === 'walk'), shir2: (o) => plain(o) && (o.pose === 'hold' || o.pose === 'carry' || o.pose === 'walk'),   // (the kohen with the trumpet ⚑; the carrier before)
  gates: (o, n) => n === 0, vessels: (o, n) => n === 0, pen: (o, n) => n === 0,                                                          // (the one at the door, with the keys)
  birkat: (o, n, nk) => plain(o) && nk === 3,                                                                     // (the middle one of the row — the close-up's ⚑)
};
const DEFAULT = (o) => plain(o);

/** figures.js man() asks: is this figure the player's? → the options to draw it with (his look), or null */
export function h26Fig(k, a, s, o) {
  if (!k.__h26) { const b = k.begin; k.begin = function () { H.n = 0; H.nk = 0; H.picked = false; H.frames++; return b.apply(k, arguments); }; k.__h26 = true; }
  const n = H.n++, nk = o.robe === KOHEN ? H.nk++ : -1;
  // (he is back in his own body: the stage's lingering frames no longer draw the actor beside him — the same pick, drawn to nothing)
  if (!H.on && H.ghost && H.ghost.until > performance.now() && !H.picked && H.ghost.work) { const f = ACTOR[H.ghost.work] || DEFAULT; let g = o.hero === true; if (!g && o.hero !== false) { try { g = !!f(o, n, nk); } catch (e) { g = false; } } if (g) { H.picked = true; return Object.assign({}, o, { scale: 0.001, hero: false }); } }
  let me = o.hero === true && !H.picked;
  if (!me && o.hero !== false && H.on && !H.picked && H.work) { const f = ACTOR[H.work] || DEFAULT; try { me = !!f(o, n, nk); } catch (e) { me = false; } }
  let q = o;
  if (H.on && H.ep >= 0 && H.work && EPILOGUE[H.work] && EPILOGUE[H.work].move) { try { q = EPILOGUE[H.work].move(Object.assign({}, o, { __a: a, __s: s }), n, H.ep, k, me) || o; if (q !== o && q.__a !== a) H.moved = (H.moved | 0) + 1; } catch (e) { q = o; H.moveErr = e && e.message; } }
  if (!me) return q === o ? null : q;
  H.picked = true; H.actorFrames++; H.idx = n;
  return Object.assign({}, q, { robe: HERO_ROBE, cap: q.cap && q.cap === q.skin ? H.skin : HERO_ROBE, avnet: true, skin: H.skin, hero: true });
}
/** man() tells where the player's figure stands this frame (world) and which way it faces (world forward), and draws his ring */
export function h26Note(k, a, s, y, R0w, fW, sc, skirtI) {
  H.at = { x: R0w[0], y: R0w[1], z: R0w[2], yaw: Math.atan2(fW[0], fW[2]), work: H.work, t: performance.now(), anchor: k.F && k.F.anchor };
  H.robe = HERO_ROBE; H.skirtI = skirtI; H.noteF = H.frames;
  if (H.on && !H.hidden && H.S) { try { H.S.hero.show(false); } catch (e) { /* */ } H.hidden = true; log('hide', H.work); }
  try { k.ring(a, s, y + 0.015, 0.36 * (sc || 1), RING, 12); } catch (e) { /* a kit without rings */ }
}

/* ───────── the epilogues ───────── */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const ease = (u) => u * u * (3 - 2 * u);
const GAZIT = [-81, 55.5];                    // (day/places.js PLACE22.gazit — the next task's place after the limbs)
const ALT = ANCHORS.altar.pts;              // (the altar's top, world: the great pyre, the תפוח)
const altarPts = () => {};
/** a figure walks from where it stands toward a world point, starting `d` seconds into the epilogue, `len` amot in `dur` seconds */
function walkOff(o, k, e, d, toX, toZ, len, dur, a0, s0) {
  const u = clamp((e - d) / dur); if (u <= 0) return null;
  const t = k.loc ? k.loc(toX, 0, toZ) : null; if (!t) return null;
  let da = t[0] - a0, ds = t[1] - s0; const L = Math.hypot(da, ds) || 1; da /= L; ds /= L;
  const go = ease(u) * Math.min(L, len / (k.F ? k.F.K : 1));
  return { a: a0 + da * go, s: s0 + ds * go, yaw: Math.atan2(ds, da), walk: u < 1 };
}
export const EPILOGUE = {
  // the nine laid their parts on the ramp's lower west half and salted them; the row walks off toward the לשכת הגזית (the next lots)
  evarim: { ms: 3800, move(o, n, e, k) { if (o.robe !== KOHEN && o.robe !== HERO_ROBE) return o; const w = walkOff(o, k, e, 0.5 + n * 0.18, GAZIT[0], GAZIT[1], 9, 2.6, o.__a, o.__s); return w ? Object.assign({}, o, { __a: w.a, __s: w.s, yaw: w.yaw, pose: w.walk ? 'walk' : 'stand', u: 1, arms: 0.1 }) : o; } },
  // the fire takes on the great pyre: the flames rise for 2 s
  maaracha: { ms: 2000, draw(k, M, e) { altarPts(k); if (!k.loc) return; const h = clamp(e / 1.2); for (let j = 0; j < 6; j++) { const q = k.loc(ALT.great[0] + Math.cos(j * 1.05) * 1.2, ALT.great[1] + 1.4 + h * 0.6, ALT.great[2] + Math.sin(j * 1.05) * 1.2), f = (0.6 + 0.7 * h) * (1 + 0.15 * Math.sin(e * 9 + j)); k.s(q[0], q[1], q[2] + 0.2 * f, 0.22 * f, 0.4 * f, 0.22 * f, '!#FFA22E'); k.s(q[0], q[1], q[2] + 0.32 * f, 0.12 * f, 0.26 * f, 0.12 * f, '!#FFD76A'); } } },
  // the ash raised on the תפוח: a soft cloud of grey dust over the heap, settling
  deshen: { ms: 1800, draw(k, M, e) { altarPts(k); if (!k.loc) return; const u = clamp(e / 1.6); for (let j = 0; j < 5; j++) { const q = k.loc(ALT.tapuach[0] + 0.6 + Math.cos(j * 1.3) * (0.4 + u), ALT.tapuach[1] + 0.6 + u * 1.2 + j * 0.1, ALT.tapuach[2] + 1.6 + Math.sin(j * 1.3) * (0.4 + u)); const r = (0.18 + u * 0.22) * (1 - u * 0.6); k.s(q[0], q[1], q[2], r, r * 0.7, r, '#B8B2A6'); } } },
  // the vessel's last pour (DAM25: the shirayim on the yesod, the work's own animation, 1.5 s) — the stage stays for it
  zerika: { ms: 1800 }, erev: { ms: 1800 },
  // the spouts run, then close (FIX26 closes them; the stage stays for it)
  kiyor: { ms: 1800 }, kiddush: { ms: 1800 },
  // the winner steps forward and the circle breaks
  payis: { ms: 2400, move: lotsMove }, payis2: { ms: 2400, move: lotsMove }, payis3: { ms: 2400, move: lotsMove }, payis4: { ms: 2400, move: lotsMove },
  ketoret: { ms: 2200 }, neirot: { ms: 1800 },
  // the last bow: the work's own bow (M.bowT) once more at the end
  shir: { ms: 2000, start(M) { if (M && M.bowT != null) M.bowT = M.t; } }, shir2: { ms: 2000, start(M) { if (M && M.bowT != null) M.bowT = M.t; } },
  gates: { ms: 1800 }, shaarim: { ms: 1800 },
};
function lotsMove(o, n, e, k) {
  const M = H.M; if (!M || !(M.win >= 0) || n > 7) return o;
  const a0 = o.__a, s0 = o.__s, ca = 3.4, cs = 0;   // (payis.js PC: the circle's middle)
  let da = a0 - ca, ds = s0 - cs; const L = Math.hypot(da, ds) || 1; da /= L; ds /= L;
  if (n === M.win) { const u = ease(clamp(e / 0.8)); return Object.assign({}, o, { __a: a0 - da * 0.55 * u, __s: s0 - ds * 0.55 * u, pose: 'stand', arms: 0.2 + 0.6 * u, lean: 0 }); }
  const u = clamp((e - 0.9 - n * 0.08) / 1.1); if (u <= 0) return o;
  return Object.assign({}, o, { __a: a0 + da * 0.9 * ease(u), __s: s0 + ds * 0.9 * ease(u), yaw: Math.atan2(ds, da), pose: u < 1 ? 'walk' : 'stand', arms: 0.1, fingers: 0, u: 1 });
}
/** the ms the day waits after a work's end (its own after hook first, then the registry, then the default) */
export function epiMs(id, W) { const E = EPILOGUE[id]; const ms = W && W.afterMs > 0 ? W.afterMs : E && E.ms > 0 ? E.ms : 1500; return Math.max(1200, ms); }
/** craft.js's frame, after the work's own draw, when the work has ended: the epilogue's clock, its draw */
export function h26Epi(k, id, M, dt, T0) {
  const e = (performance.now() - T0) / 1000; H.ep = e; H.M = M; H.epF = (H.epF | 0) + 1;
  if (M) { M.ep = e; if (M.done) M.t += dt; }   // (the act's own timings play out: a bow comes up, a hand comes down)
  const E = EPILOGUE[id]; if (E && E.start && !M.__h26s) { M.__h26s = 1; try { E.start(M); } catch (x) { /* */ } }
  if (E && E.draw) { try { E.draw(k, M, e, dt); } catch (x) { /* */ } }
}

/* ───────── extra figures a work lacks: the kohen with the trumpet on the דוכן's side (תמיד ז, ג: "אחד מימינו ואחד משמאלו") ───────── */
const S_BEN = [-10.6, -8.4];
export const EXTRA = {
  shir: trumpets, shir2: trumpets,
};
function trumpets(k, M, T, man) {
  if (!M || !(M.i >= 5) || !k.loc || k.F.anchor !== 'duchan') return;
  const bw = M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * (1 - clamp((M.t - M.bowT - 1.0) * 1.5)) : 0;
  for (let j = 0; j < 2; j++) {
    const x = S_BEN[0] - 0.4, z = S_BEN[1] + (j ? -1.6 : 1.6), p = k.loc(x, 0, z), y = k.gy(p[0], p[1]);
    const yaw = Math.atan2(-k.F.fz * -1 + k.F.fx * 0.3, k.F.fx * -1 + k.F.fz * 0.3);   // (places24 dirL: facing [-1, 0.3], as בן ארזא)
    const blow = bw > 0.05 ? 1 : 0;
    man(k, p[0], p[1], y, { robe: KOHEN, hero: j === 0 ? true : false, yaw, pose: 'hold', u: 1, arms: 0.55 + blow * 0.3, t: T + j });
    const ca = Math.cos(yaw), sa = Math.sin(yaw); k.c(p[0] + ca * 0.55, p[1] + sa * 0.55, y + 1.45 + blow * 0.2, 0.04, 0.8, '#C9CED6', { yaw: -yaw, pitch: Math.PI / 2 - 0.3 - blow * 0.3 });
  }
}
export function h26Extra(k, id, M, T, man) { const f = EXTRA[id]; if (f) { try { f(k, M, T, man); } catch (e) { /* */ } } }

/* ───────── the day's side ───────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** a work begins: the hero mesh steps out (the stage's actor is he) */
export function heroBegin(S, workId) {
  H.on = true; H.work = workId || null; H.at = null; H.ep = -1; H.epF = 0; H.moved = 0; H.ghost = null; H.M = null; H.actorFrames = 0; H.idx = -1;
  try { const L = S && S.hero && S.hero.look ? S.hero.look() : null; if (L && HERO_SKINS[L.skin]) H.skin = HERO_SKINS[L.skin]; } catch (e) { /* */ }
  try { if (S && S.hero) { S.hero.drive(0, 0); S.hero.show(false); H.hidden = true; } } catch (e) { /* no hero */ }
  H.S = S; const w0 = workId, b0 = H.begun = (H.begun | 0) + 1;
  // (a work with no acting figure — the seals' chips, the count of the vessels: he does it himself, in his own body; he steps back in at
  // 1.5 s if no figure took his place, and out again the moment one does — h26Note)
  setTimeout(() => { if (H.on && H.begun === b0 && H.work === w0 && H.actorFrames === 0 && H.hidden) { try { S.hero.show(true); } catch (e) { /* */ } H.hidden = false; log('noactor', w0); } }, 1500);
  log('begin', workId);
}
/** a free floor spot at most `r` amot from (x, z), nearest first (world22.free) */
export function freeNear(x, z, free, r = 3) {
  if (!free || free(x, z)) return { x, z, d: 0 };
  for (let d = 0.6; d <= r + 1e-6; d += 0.6) for (let i = 0; i < 16; i++) { const t = i / 16 * Math.PI * 2, px = x + Math.cos(t) * d, pz = z + Math.sin(t) * d; if (free(px, pz)) return { x: px, z: pz, d }; }
  return null;
}
/** the work is over (its epilogue seen): the hero mesh comes back AT the actor's last spot, facing `to` (the next open marker), and takes one step */
export function heroBack(S, o = {}) {
  const hp = o.hp || { x: 0, z: 0 }, free = o.free;
  // (an actor inside the Heichal — the lamps, the golden altar: the player never passes its door — he is back where he stood, at the door ⚑)
  const inside = (q) => q.x < -92 && q.x > -140 && Math.abs(q.z) < 12;   // (places.js HEICHAL + its door: x −138…−92, z ±10)
  const at = H.at && H.at.work === H.work && !inside(H.at) ? H.at : null;
  let p = at ? freeNear(at.x, at.z, free, 3) || freeNear(at.x, at.z, free, 8) : null;
  if (!p) p = { x: hp.x, z: hp.z, d: -1 };
  const to = o.to, yaw = to ? Math.atan2(to.x - p.x, to.z - p.z) : at ? at.yaw : hp.yaw;
  H.on = false; H.ep = -1; H.M = null; H.ghost = { work: H.work, until: performance.now() + 6000 };
  // the follow camera never jumps: his (hidden) place slides from where he stood to the actor's spot in ~0.45 s — the camera follows it
  // as it glides back — and only there the mesh shows, facing the next work, and takes one visible step (≈ 1 amah, his own stride)
  const x0 = Number.isFinite(hp.x) ? hp.x : p.x, z0 = Number.isFinite(hp.z) ? hp.z : p.z, dist = Math.hypot(p.x - x0, p.z - z0), far = dist > 0.4, SL = o.fast ? 0 : Math.min(1800, 450 + dist * 28), t0 = performance.now();   // (~30 amot a second at most: a glide, never a whoosh)
  const show = () => {
    H.hidden = false;
    try { S.hero.setPos(p.x, p.z, yaw); S.hero.show(true); } catch (e) { /* no hero */ }
    if (to && Math.hypot(to.x - p.x, to.z - p.z) > 2) { const ux = Math.sin(yaw), uz = Math.cos(yaw); try { S.hero.drive(ux * 3.2, uz * 3.2); setTimeout(() => { try { S.hero.drive(0, 0); } catch (e) { /* */ } }, 320); } catch (e) { /* */ } }
    log('shown', { x: +p.x.toFixed(2), z: +p.z.toFixed(2) });
  };
  if (far && SL > 0) {
    const iv = setInterval(() => { const u = Math.min(1, (performance.now() - t0) / SL), e = ease(u); if (u >= 1) { clearInterval(iv); show(); return; } try { S.hero.setPos(x0 + (p.x - x0) * e, z0 + (p.z - z0) * e, yaw); S.hero.show(false); } catch (x) { clearInterval(iv); show(); } }, 30);
  } else show();
  const r = { x: +p.x.toFixed(2), z: +p.z.toFixed(2), yaw: +yaw.toFixed(3), from: at ? { x: +at.x.toFixed(2), z: +at.z.toFixed(2) } : null, d: at ? +Math.hypot(p.x - at.x, p.z - at.z).toFixed(2) : -1, to: to ? { x: +to.x.toFixed(2), z: +to.z.toFixed(2) } : null, slideMs: far ? Math.round(SL) : 0 };
  log('back', r); return r;
}
/** a work that never started or was left: the hero mesh back where he is */
export function heroAbort(S) { H.on = false; H.ep = -1; H.M = null; H.hidden = false; try { S.hero.show(true); } catch (e) { /* */ } log('abort'); }
export { sleep };
function log(t, d) { H.log.push({ t, d, ms: Math.round(performance.now()) }); if (H.log.length > 40) H.log.shift(); }
const CSS = `.tw-mk.h26p .tw-mi{animation:h26p .7s ease-in-out infinite alternate;border-color:#fff;background:#C8923A}
@keyframes h26p{0%{transform:scale(1);box-shadow:0 0 0 4px rgba(255,214,110,.35)}100%{transform:scale(1.32);box-shadow:0 0 0 10px rgba(255,214,110,.75)}}
@media (prefers-reduced-motion: reduce){.tw-mk.h26p .tw-mi{animation:none;transform:scale(1.25)}}`;
export function h26Css(doc) { try { if (doc && !doc.getElementById('h26-css')) { const s = doc.createElement('style'); s.id = 'h26-css'; s.textContent = CSS; doc.head.appendChild(s); } } catch (e) { /* */ } }
try { globalThis.__HERO26 = { H, ACTOR, EPILOGUE, HERO_ROBE, epiMs, state: () => ({ on: H.on, work: H.work, at: H.at, actorFrames: H.actorFrames, idx: H.idx, robe: H.robe, skin: H.skin, ep: H.ep, skirtI: H.noteF === H.frames ? H.skirtI : null, epF: H.epF | 0, moved: H.moved | 0, moveErr: H.moveErr || null, log: H.log.slice(-12) }) }; } catch (e) { /* tests */ }
// ── /hero26 ──
