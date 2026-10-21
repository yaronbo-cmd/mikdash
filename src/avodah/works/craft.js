/* ── worksa22 ── craft.js — the common ground of Phase B's world crafts (night, pen, wood): a model that grades its acts with acts.js,
 * and the world craft that draws its piece beside the אמרכל. The contract (WAVE22-BRIEF): a work is
 *   WORKS[id] = { model(o) → M, begin() → { ok, at }, touch(down, M), update(M), end(r), box(), hooks(), fact, place, on() }
 * run by hands.js runInWorld(M, { input: 'twin', hooks: WORKS[id].hooks(), fact: WORKS[id].fact, … }) exactly as Phase A's crafts are.
 * The model (UI-free, node-testable): twinTap() = the right thumb's tap (one act of the work, at the next target), drag(x, y, ph) =
 * the aimed act (a choice, a bigger log — never required), touch(down) = the press (a hold works like a tap that lasts), step(dt) the
 * work's own clock. Every act is acts.js's: ok 10 · good 20 · gold 40 on the music's beat; a miss never subtracts ("עוד קצת"). ── /worksa22 ── */
import { act as caAct, bonus as caBonus, actsQ as caQ, beatQ as caBeatQ } from '../../game/minigames/acts.js';
import { createKit } from './kit.js';
import { anchorsOn } from './anchors.js';   // ── places24 ──
import { h26Epi, h26Extra, epiMs, EPILOGUE } from './hero26.js';   // ── hero26 ── (the epilogue after the last act; the figures a work lacks) ── /hero26 ──
import { man as h26Man } from './figures.js';   // ── hero26 ── ── /hero26 ──

let KIT = null, CTX = {};
/** once, at world-live: { scene, camera, ground(x, z), hero() → { x, y, z, yaw }, free?(x, z), stock?, project? } */
export function initWorks(ctx) { if (KIT) { try { KIT.dispose(); } catch (e) { /* */ } } CTX = ctx || {}; KIT = createKit(CTX); return KIT; }
export const getKit = () => KIT;
export const getCtx = () => CTX;
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const ease = (u) => u * u * (3 - 2 * u);

const DRAG_PX = 160, MOVE_PX = 12;
/** the model every work shares. ext: { n, coach, tap(M), aim(M, dx, dy), press(M, down), step(M, dt), ready(M) → bool } */
export function baseModel(kind, o = {}, ext = {}) {
  const level = Math.max(0, Math.min(4, o.level | 0));
  const M = {
    kind, game: kind, juice: true, twinOnly: true, level, n: ext.n || 1, i: 0, k: 0, acts: [], pts: 0, fx: [], miss: 0, t: 0, pt: 0, phase: 'work', done: false, progress: 0,
    holds: !!ext.holds, coach: ext.coach || "הקישו על 'עבודה' — כל הקשה: הצעד הבא", last: [2, 0, 1], say: '', pending: 0, pressed: false, firstTry: true, d: null,
    /** the grade of an act landing now: on the music's beat → gold; a try after a miss at most good */
    grade() { const q = caBeatQ(level); return M.firstTry ? q : Math.min(q, 1); },
    /** one act, at a local point [a, s, y] (where its "+N" is born) */
    pay(at, say) { if (at) M.last = at; const a = caAct(M, M.grade(), { x: 0.5, y: 0.35, say: say || '' }); M.firstTry = true; return a; },
    advance() { M.i++; M.k = M.i; M.progress = Math.round(100 * M.i / M.n); if (M.i >= M.n && M.phase === 'work') M.finish(); },
    /** a try that was not the work's (a wrong place): the world answers "עוד קצת", nothing is taken */
    slip(say) { M.miss++; M.firstTry = false; M.warn = say || 'עוד קצת'; M.warnT = 1.6; },
    finish() { M.phase = 'end'; M.pt = 0; if (!M.miss) caBonus(M, 60, 'עבודה נקייה'); M.fx.push({ sfx: 'chime', o: { combo: 6 } }); },
    touch(down) { M.pressed = !!down; if (ext.press) ext.press(M, !!down); },
    twinTap() { if (M.phase !== 'work') return; if (ext.ready && !ext.ready(M)) { M.pending = Math.min(1, M.pending + 1); return; } ext.tap(M); },
    tap() { M.twinTap(); },
    /** the aimed act: a drag from the cue (0.5, 0.5); x, y in the box's unit (160 px) */
    drag(x, y, ph) {
      if (M.phase !== 'work') return;
      if (ph === 'down') { M.d = { x0: x, y0: y, moved: false, dx: 0, dy: 0 }; return; }
      const d = M.d; if (!d) return;
      d.dx = (x - d.x0) * DRAG_PX; d.dy = (y - d.y0) * DRAG_PX;
      if (ph === 'move') { if (Math.hypot(d.dx, d.dy) >= MOVE_PX) d.moved = true; return; }
      M.d = null; if (ph === 'cancel') return;
      if (d.moved && ext.aim) { if (ext.ready && !ext.ready(M)) { M.pending = Math.min(1, M.pending + 1); return; } ext.aim(M, d.dx, d.dy); } else M.twinTap();
    },
    cue() { return { x: 0.5, y: 0.5 }; },
    auto() { return true; },
    step(dt) {
      if (M.done) return; M.t += dt; if (M.warnT > 0) { M.warnT -= dt; if (M.warnT <= 0) M.warn = ''; }
      if (ext.step) ext.step(M, dt);
      if (M.phase === 'work' && M.pending && (!ext.ready || ext.ready(M))) { M.pending = 0; ext.tap(M); }   // (a tap that came during a walk or a flight lands when it ends)
      if (M.phase === 'end') { M.pt += dt; if (M.pt > 1.2) { M.done = true; M.phase = 'done'; M.progress = 100; } }
    },
    result() { const q = caQ(M, 0.8); return { quality: q, perfect: q >= 0.97 && M.acts.length > 0, score: M.pts | 0, acts: M.i }; },
  };
  return M;
}

/** the world craft of a work. def: { id, he, place, fact, stage: { ahead, lat, K }, bounds: [a0, a1, s0, s1, h], model(o), draw(k, M, T, dt), target(M) → [a, s, y], linger } */
let ACTIVE = null;   // (the kit is shared: a new work stops the one still lingering)
export function makeWork(def) {
  const S = { on: false, done: false, after: 0, endAt: 0, seen: 0, pulse: null, M: null, T: 0, last: 0, raf: 0, at: { x: 0, y: 0, z: 0 }, tmp: { x: 0, y: 0, z: 0 } };
  const retarget = (M) => {
    if (!KIT || !M) return;
    const t = (S.A && S.A.target ? S.A.target(M, KIT) : def.target && def.target(M)) || M.last || [3, 0, 1];   // ── places24 ── (S.A: the anchored draw)
    KIT.world(t[0], t[1], t[2], S.tmp); S.at.x = S.tmp.x; S.at.y = S.tmp.y; S.at.z = S.tmp.z;
    S.tl = t;   // ── places24 ──
  };
  const frame = () => {
    S.raf = 0; if (!S.on || !KIT) return;
    const now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - S.last) / 1000)); S.last = now; S.T += dt;
    if (S.M) {
      // (each act answers in the world on its own frame: a gold ring spreads from the place it landed)
      const n = S.M.acts ? S.M.acts.length : 0; if (n > S.seen) { S.seen = n; S.pulse = { t: 0, at: S.A && S.tl ? [S.tl[0], S.tl[1], KIT.gy(S.tl[0], S.tl[1])] : (S.M.last || [3, 0, 0.4]) }; if (S.A) { const w = KIT.world(S.pulse.at[0], S.pulse.at[1], S.pulse.at[2], {}); S.pulse.w = [w.x, w.y, w.z]; S.pulse.an = KIT.F.anchor; } }   // ── places24 ── (on a real place: where the act was asked — the last frame's target — on the floor there)
      KIT.begin(); if (S.A) S.A.draw(KIT, S.M, S.T, dt); else def.draw(KIT, S.M, S.T, dt);   // ── places24 ──
      // ── hero26 ── the figures the work lacks (the kohen with the trumpet), then — the work ended — its epilogue (the figures complete; def.after.draw / EPILOGUE)
      h26Extra(KIT, def.id, S.M, S.T, h26Man);
      if (S.done && S.epT0) { h26Epi(KIT, def.id, S.M, dt, S.epT0); const A2 = def.after; if (A2 && typeof A2.draw === 'function') { try { A2.draw(KIT, S.M, S.M ? S.M.ep : 0, dt); } catch (e) { /* the work's */ } } }
      // ── /hero26 ──
      if (S.pulse && S.pulse.an && (S.pulse.an !== KIT.F.anchor || (KIT.F.A && KIT.F.A.inside))) S.pulse = null;   // (the work moved on to another place: the ring stays behind, unseen; inside the Heichal the close camera needs none)
      if (S.pulse) { const P = S.pulse; P.t += dt; if (P.w) P.at = KIT.loc(P.w[0], P.w[1], P.w[2]); if (P.t > 0.55) S.pulse = null; else { const u = P.t / 0.55; KIT.ring(P.at[0], P.at[1], S.A ? P.at[2] + 0.05 : 0.05, S.A ? (0.5 + u * 1.6) * (KIT.F.A && KIT.F.A.inside ? 0.45 : 1) / KIT.F.K : 0.35 + u * 2.2, '!#FFE08A', 18); } }   // ── places24 ──
      KIT.end(); retarget(S.M);
    }
    if (S.done && now >= S.endAt) { S.on = false; KIT.clear(); return; }
    S.raf = requestAnimationFrame(frame);
  };
  const W = {
    id: def.id, he: def.he, place: def.place, fact: def.fact, job: def.id,
    model(o = {}) { return def.model(o); },
    on: () => S.on,
    begin() {
      if (!KIT) return { ok: false, why: 'init' };
      if (S.on && !S.done) return { ok: false, why: 'busy' };
      if (ACTIVE && ACTIVE !== W && ACTIVE.on()) ACTIVE.stop();
      ACTIVE = W;
      // ── places24 ── W.anchored = { anchor, draw(k, M, T, dt), target(M, k), mid: [a, s, y], bounds, begin(k), end(k) } (works/places24.js): the stage is the real place
      S.A = W.anchored && anchorsOn() ? W.anchored : null;
      if (S.A) { KIT.place({ anchor: typeof S.A.anchor === 'function' ? S.A.anchor() : S.A.anchor, K: S.A.K }); try { if (S.A.begin) S.A.begin(KIT); } catch (e) { console.warn('[places24] begin', e && e.message); } }
      else KIT.place(Object.assign({ bounds: def.bounds }, def.stage || {}));
      // ── /places24 ──
      Object.assign(S, { on: true, done: false, after: 0, M: null, T: 0, last: performance.now(), seen: 0, pulse: null, tl: null, epT0: 0 });   // ── hero26 ── (epT0) ── /hero26 ──
      if (S.A && S.A.mid) KIT.world(S.A.mid[0], S.A.mid[1], S.A.mid[2], S.tmp); else   // ── places24 ──
      KIT.world(def.bounds ? (def.bounds[0] + def.bounds[1]) / 2 : 3, 0, 1, S.tmp); S.at.x = S.tmp.x; S.at.y = S.tmp.y; S.at.z = S.tmp.z;
      if (!S.raf) S.raf = requestAnimationFrame(frame);
      return { ok: true, at: S.at };
    },
    touch(down, M) { if (M && typeof M.touch === 'function') M.touch(down); },
    update(M) { S.M = M; if (M && S.on) retarget(M); return true; },
    end() { if (!S.on) return false; S.done = true; if (S.A && S.A.end) { try { S.A.end(KIT, S.M); } catch (e) { /* the place's */ } }   // ── places24 ──
      S.endAt = performance.now() + (def.linger == null ? 2.6 : def.linger) * 1000; if (S.M && S.M.onEnd) S.M.onEnd(CTX);
      S.epT0 = performance.now(); S.endAt = Math.max(S.endAt, S.epT0 + W.afterMs + 1600);   // ── hero26 ── (the stage stays through the epilogue and the camera's glide back) ── /hero26 ──
      return true; },
    // ── hero26 ── after(ctx, res) → Promise: the epilogue — the stage stays `afterMs` after the last act (def.after.ms, EPILOGUE[id].ms, default 1500)
    get afterMs() { const A2 = def.after; return A2 && A2.ms > 0 ? A2.ms : epiMs(def.id); },
    after(ctx, res) { return new Promise((r) => setTimeout(r, W.afterMs)); },
    // ── /hero26 ──
    /** the screen box of the piece (CSS px) for the aimed drag */
    box() {
      if (!S.on || !KIT || !(S.A ? S.A.bounds : def.bounds)) return null;
      const [a0, a1, s0, s1, h] = S.A ? S.A.bounds : def.bounds, /* ── places24 ── */ pts = [[a0, s0, 0], [a0, s1, 0], [a1, s0, 0], [a1, s1, 0], [a0, s0, h], [a1, s1, h]];
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const p of pts) { const q = KIT.screen(p[0], p[1], p[2]); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
      return { x: x0, y: y0, w: Math.max(40, x1 - x0), h: Math.max(40, y1 - y0) };
    },
    hooks() { return { begin: () => W.begin(), update: (M) => W.update(M), end: (r) => W.end(r), box: () => W.box(), touch: (d, M) => W.touch(d, M) }; },
    stop() { S.on = false; S.done = true; if (KIT) KIT.clear(); },
    /** tests */
    state() { return { on: S.on, done: S.done, at: S.at, anchor: S.A ? KIT && KIT.F.anchor : null,   // ── places24 ──
      T: +S.T.toFixed(2), kit: KIT ? KIT.stats() : null, reds: KIT ? KIT.reds() : 0, blood: KIT && KIT.bloodCheck ? KIT.bloodCheck() : null }; },   // ── blooda25 ── (blood: the palette's pieces and their places)
  };
  return W;
}
export { caAct, caBonus, caQ, caBeatQ };
