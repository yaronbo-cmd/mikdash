/* ── build 112 ── h112/acts.js — the acts of stage 03 "הסורג והחיל", each played on the soreg's east side in the old world (spec
 * "המשחקונים, תחנה אחרי תחנה"). The same registry as stages 01–02 (h109/acts.js, h111/acts.js):
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), close? } — it calls X.end({ stars, q, at }) once.
 * This file: 1 the posts by sighting, 2 the lattice slab, 3 the warning slab and its word in red. acts2.js: 4 the steps, 5 the ring's
 * closing bay.
 */
import { H112, RUNS, LINE, warnOf, starsOf, driftOf, runPosts } from './model.js';
import { SH3, bayFrame, runBuild, postMesh, poleMesh, latticeSlab, warnSlab, warnSeat, label, initWorld, frameWorld, keep, boxOf, bayKeep } from './world.js';
import { createHoist } from './hoist.js';
import { clamp, lerp, ease } from '../h109/kit.js';
import { gripR, bigR, nearPts, nearSeg, nearObjs } from '../h109/grips.js';   // (build 125)
import { STEPS_ACT, CLOSE } from './acts2.js';

const rnd = (k) => { const v = Math.sin(k * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
const sc = (X, o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
const heroAt = (X, x, z, fx, fz) => { try { X.hero.setPos(x, z, Math.atan2(fx - x, fz - z)); } catch (e) { /* */ } };

/* ───────── shared: the crane and the cart beside a bay, the work shot from the Mount's side ───────── */
/** the treadwheel crane outside the soreg, its jib over the bay (its tip 10.7 from its foot: h109 makeCrane) */
export function craneFor(X, F) {
  const C = SH3.crane; const bx = F.cx + F.nx * 7.6 - F.ux * 7.2, bz = F.cz + F.nz * 7.6 - F.uz * 7.2;
  C.place(bx, bz, Math.atan2(F.cx - bx, F.cz - bz)); C.g.visible = true; C.slew.rotation.y = 0; C.aim(F.cx, F.cz, 1);
  return C;
}
/** where the slabs to choose stand: outside the line, beside the bay (k: 0, 1, 2) */
/** the slabs on the ground beside the bay (two in a row; a third in front of them, between: all three in the shot at any width) */
export function candAt(F, k, n = 3) { const al = n >= 3 && k === 2 ? 4.9 : 3.4 + k * 3.0, out = n >= 3 && k === 2 ? 7.4 : 3.4; return { x: F.cx + F.nx * out + F.ux * al, z: F.cz + F.nz * out + F.uz * al }; }
/** the shot of a bay from the Mount's side, three quarters: the bay a third of the screen, the crane to the left, the slabs to the right */
export function bayShot(X, F, o = {}) {
  const d = o.d || 14, side = o.side != null ? o.side : 1.2;
  const p = { x: F.cx + F.nx * d + F.ux * side, z: F.cz + F.nz * d + F.uz * side }, t = { x: F.cx + F.nx * 1.6 + F.ux * (o.look != null ? o.look : 2.6), z: F.cz + F.nz * 1.6 + F.uz * (o.look != null ? o.look : 2.6) };
  // (the slab hangs up to 6 amot: the shot keeps it, the bay and the sill in frame, under the top bar)
  X.shot([p.x, (o.h || 6.2) + X.ground(p.x, p.z), p.z], [t.x, (o.ty != null ? o.ty : 2.3) + X.ground(t.x, t.z), t.z], 1.0);
}
/** the kohen on the Mount's side of the bay (rule 8: never inside a wall; the work surface clear: rule 19) */
export function standBay(F, along = -(F.W / 2 + 2.4), out = 1.2) { return { x: F.cx + F.nx * out + F.ux * along, z: F.cz + F.nz * out + F.uz * along, face: [F.cx, F.cz] }; }

/* ───────── 1. the posts by sighting ───────── */
const GRADE_Q = { gold: 1, good: 0.8, ok: 0.45 };
export const POSTS = {
  icon: '📍', title: 'הניצבים בקו',
  walkLine: (m) => `${RUNS[m.lv].where}: מעמידים ניצבים בקו`,
  stand(m) { const S = RUNS[m.lv].sight[0], n = LINE[RUNS[m.lv].posts[S.near].line]; return { x: S.eye[0] + n[0] * 2.4 + S.dir[0] * 0.6, z: S.eye[1] + n[1] * 2.4 + S.dir[1] * 0.6, face: [S.eye[0] + S.dir[0] * 10, S.eye[1] + S.dir[1] * 10] }; },
  prepare(m, X) { try { X.stages.s20Pin(null); } catch (e) { /* */ } SH3.crane.g.visible = false; },
  make(m, X) {
    const lv = X.level(), R = RUNS[m.lv], T = X.THREE, PR = X.props, st = X.M.st;
    SH3.busy = 1; SH3.camD = 32;
    const run = runBuild(X, m.lv, { posts: true });
    // the kohen's posts: e across the line (n), ez for the corner's second sighting (along z)
    const K = R.kposts.map((pi, j) => ({ pi, j, e: 0, ez: 0, set: false, grade: null, m: null, pole: null, crew: [], t0: 0 }));
    const A = { g: 0, cur: null, drag: null, done: false, t: 0, busy: false, retakes: 0, chalk: null, poles: [] };
    const nomOf = (k) => R.posts[k.pi];
    const nOf = (k) => LINE[nomOf(k).line];
    const posOf = (k) => { const p = nomOf(k), n = nOf(k); return { x: p.x + n[0] * k.e, z: p.z + n[1] * k.e + k.ez }; };
    const topOf = (k) => (nomOf(k).tall ? H112.TALL_H : H112.POST_H);
    function place(k) { const p = posOf(k); k.m.position.set(p.x, X.ground(p.x, p.z) + (k.rise || 0), p.z); if (k.pole) k.pole.position.set(p.x, X.ground(p.x, p.z) + topOf(k) + (k.rise || 0), p.z); for (const [w, s] of k.crew) { if (!w || !w.a) continue; const n = nOf(k), u = [-n[1], n[0]]; w.a.x = p.x + n[0] * s * 2.2 + u[0] * 0.5; w.a.z = p.z + n[1] * s * 2.2 + u[1] * 0.5; } }
    // the poles on the true posts the eye sights along (the near one, and the far one where there is one)
    const S = () => R.sight[A.g];
    function polesFor(g) {
      for (const pl of A.poles) PR.remove(pl); A.poles = [];
      const s = R.sight[g]; for (const i of [s.near, s.far]) { if (i < 0) continue; const p = R.posts[i]; A.poles.push(poleMesh(X, p, X.ground(p.x, p.z) + (p.tall ? H112.TALL_H : H112.POST_H))); }
    }
    // level 1: the lime line on the floor (the crews' line, spec 1); from level 2 their feet have rubbed it out
    if (lv === 1) {
      const a = R.posts[R.c0], b = R.posts[R.close[1]], L = Math.hypot(b.x - a.x, b.z - a.z);
      const c = new T.Mesh(PR.geo.box, PR.M.chalk); c.scale.set(0.09, 0.03, L); c.position.set((a.x + b.x) / 2, X.ground(a.x, a.z) + 0.05, (a.z + b.z) / 2); c.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); PR.root.add(c); A.chalk = c;
    }
    function shotFor(g) {
      const s = R.sight[g], e = s.eye, d = s.dir, y = X.ground(e[0], e[1]) + 2.45;
      // low, at his eye, along the row from its end (spec, the camera: "נמוכה, בגובה עין הכהן")
      X.shot([e[0] - d[0] * 0.2, y, e[1] - d[1] * 0.2], [e[0] + d[0] * 16, y - 0.3, e[1] + d[1] * 16], 1.1);
    }
    function heroFor(g) { const s = R.sight[g], n = LINE[R.posts[s.near].line], e = s.eye; heroAt(X, e[0] + n[0] * 2.4 + s.dir[0] * 0.6, e[1] + n[1] * 2.4 + s.dir[1] * 0.6, e[0] + s.dir[0] * 10, e[1] + s.dir[1] * 10); }
    /** the next post the crew brings: they set it in its hole, roughly (spec 1) */
    async function bring(k) {
      A.busy = true;
      if (!k.m) {
        const p0 = R.posts[k.pi];
        k.m = postMesh(X, p0); k.e = (rnd(m.lv * 7 + k.j * 3) > 0.5 ? 1 : -1) * (0.28 + 0.36 * rnd(m.lv * 11 + k.j));
        const n = nOf(k), u = [-n[1], n[0]];
        for (const s of [-1, 1]) { const w = SH3.crew.add(p0.x + n[0] * s * 2.2 + u[0] * 0.5, p0.z + n[1] * s * 2.2 + u[1] * 0.5, { role: 'push', fx: p0.x, fz: p0.z, crew: 1 }); k.crew.push([w, s]); }
        k.rise = -topOf(k); place(k);
        for (let i = 1; i <= 16; i++) { await X.wait(0.04); k.rise = -topOf(k) * (1 - ease(i / 16)); place(k); }
        k.rise = 0; X.play('thud'); X.dust(posOf(k).x, X.ground(posOf(k).x, posOf(k).z) + 0.2, posOf(k).z, 6, 1.2);
      }
      if (!k.pole) { const p = posOf(k); k.pole = poleMesh(X, p, X.ground(p.x, p.z) + topOf(k)); }
      for (const [w] of k.crew) SH3.crew.setRole(w, 'push');
      place(k); A.cur = k; A.busy = false;
      X.line(A.g === 1 ? 'מהצד השני: הסתירו את מוט הפינה' : 'גררו עד שהמוט האדום נעלם');
      const p = posOf(k); X.hand({ x: p.x, y: X.ground(p.x, p.z) + topOf(k) + 0.7, z: p.z }, 46, 0);
    }
    /** px on the screen for an amah across the line at this post (signed: a drag right moves it right) */
    function pxPer(k) {
      const p = posOf(k), y = X.ground(p.x, p.z) + topOf(k) + 0.6, n = A.g === 1 ? [0, 1] : nOf(k);
      const a = X.scr(p.x, y, p.z), b = X.scr(p.x + n[0] * 0.5, y, p.z + n[1] * 0.5); return (b.x - a.x) / 0.5 || 60;
    }
    const errOf = (k) => (A.g === 1 ? k.ez : k.e);
    async function setDown(k) {
      // the crew rams it in: the grade by how far its pole stands out from the line
      A.busy = true; X.hand(null);
      const p = posOf(k), y = X.ground(p.x, p.z), e = Math.abs(errOf(k));
      for (const [w] of k.crew) SH3.crew.setRole(w, 'hammer', { item: 'mallet' });
      X.play('stamp'); X.dust(p.x, y + 0.2, p.z, 8, 1.3);
      const grade = e <= 0.05 ? 'gold' : e <= 0.12 ? 'good' : 'ok';
      k.grade = grade; if (A.g === 1) k.grade2 = grade; k.set = true;
      X.hit({ x: p.x, y: y + topOf(k) + 1.0, z: p.z }, grade, { text: grade === 'gold' ? 'נעלם!' : grade === 'ok' ? 'עקום' : '', craft: 'מודדים' });
      await X.wait(0.7);
      for (const [w] of k.crew) SH3.crew.remove(w); k.crew = [];
      A.cur = null; A.busy = false;
      next();
    }
    function next() {
      const s = S(), todo = s.posts.map((pi) => K.find((k) => k.pi === pi)).find((k) => !(A.g === 1 ? k.set2 : k.set));
      if (todo) { if (A.g === 1) todo.set = false; bring(todo); return; }
      if (A.g + 1 < R.sight.length) {
        // the corner (level 3): along the east line it is in; now from the south line's far end (spec 1, level 3)
        A.g++; for (const k of K) if (R.sight[A.g].posts.includes(k.pi)) { k.set2 = false; k.ez = (rnd(m.lv * 5 + 9) > 0.5 ? 1 : -1) * (0.3 + 0.25 * rnd(m.lv + 3)); place(k); }
        polesFor(A.g); shotFor(A.g); heroFor(A.g); X.line('הפינה: מכוונים גם מהקצה השני');
        setTimeout(() => { if (!A.done) next(); }, 900);
        return;
      }
      finish();
    }
    async function finish() {
      A.done = true; X.hand(null); X.line('');
      // the camera rises: the row as straight as a ruler (or its bend)
      const a = R.posts[R.c0], b = R.posts[R.kposts[R.kposts.length - 1]], mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, n = LINE[a.line];
      X.shot([mx + n[0] * 9, 13, mz + n[1] * 9 - 4], [mx, 0.8, mz], 1.4);
      const errs = []; for (const k of K) { errs.push(k.e); if (R.sight.length > 1 && R.sight[1].posts.includes(k.pi)) errs.push(k.ez); }
      const qs = K.map((k) => GRADE_Q[k.grade || 'ok'] * (k.grade2 ? GRADE_Q[k.grade2] : 1));
      const q = qs.reduce((s, x) => s + x, 0) / qs.length * (A.retakes > 2 ? 0.95 : 1);
      if (qs.every((x) => x >= 1)) X.bonus(100, 'posts', 'שורה ישרה כסרגל');
      st.posts[m.lv] = { done: 1, e: K.map((k) => +k.e.toFixed(3)), ez: +(K.find((k) => nomOf(k).corner) || { ez: 0 }).ez.toFixed(3), drift: +driftOf(m.lv, errs).toFixed(3) };
      X.save();
      await X.wait(1.6);
      X.end({ q, stars: starsOf(q), at: { x: mx, y: 3, z: mz } });
    }
    function postAt(p) {
      const objs = K.filter((k) => k.m && k.set && k !== A.cur).map((k) => k.m);
      const hits = X.rayAt(p.x, p.y).intersectObjects(objs, true); if (!hits.length) return null;
      let o = hits[0].object; while (o && !K.find((k) => k.m === o)) o = o.parent; return K.find((k) => k.m === o) || null;
    }
    // (the crews keep out of the eye's line along the row, from his eye to the far true post)
    keep(X, R.sight.map((sg) => { const f = R.posts[sg.far >= 0 ? sg.far : sg.posts[sg.posts.length - 1]]; return boxOf([{ x: sg.eye[0] - sg.dir[0], z: sg.eye[1] - sg.dir[1] }, { x: f.x + sg.dir[0] * 1.5, z: f.z + sg.dir[1] * 1.5 }], 2.4); }));
    return {
      begin() {
        polesFor(0); shotFor(0); heroFor(0);
        X.line(lv === 1 ? 'קו הסיד עוזר · ארבעה ניצבים' : 'בלי קו · רק העין');
        setTimeout(() => { if (!A.done) next(); }, 700);
      },
      update(dt) {
        A.t += dt;
        const k = A.cur; if (!k || !A.drag) return;
        // the workers move it with a little lag, a heavy thing (rule 21)
        const want = A.drag.e0 + (A.drag.x - A.drag.x0) / A.drag.px;
        if (A.g === 1) k.ez += (want - k.ez) * Math.min(1, dt * 5); else k.e += (want - k.e) * Math.min(1, dt * 5);
        place(k);
      },
      down(p) {
        if (A.done || A.busy) return;
        // (a press on a post already standing may be a tap on it — or the start of a drag on the new one sighted behind it)
        const tk = postAt(p); A.tap = tk ? { k: tk, x: p.x, y: p.y, t: A.t } : null;
        const k = A.cur; if (!k) return;
        A.drag = { x0: p.x, x: p.x, e0: errOf(k), px: pxPer(k) }; X.hand(null);
        for (const [w] of k.crew) SH3.crew.setRole(w, 'push');
      },
      move(p) { if (A.drag) A.drag.x = p.x; },
      // (build 125: on the right half the post in the crew's hands (along its height) and the posts already standing are the act's —
      //  the rest is the right thumb's look)
      wants(p) {
        if (A.done || A.busy) return false; if (!p) return true;
        const k = A.cur; if (k) { const q = posOf(k), g0 = X.ground(q.x, q.z); if (nearSeg(X, p, { x: q.x, y: g0, z: q.z }, { x: q.x, y: g0 + topOf(k) + 0.6, z: q.z }, gripR())) return true; }
        return !!postAt(p);
      },
      up(p) {
        if (A.tap && Math.hypot(p.x - A.tap.x, p.y - A.tap.y) < 12) {
          const t = A.tap; A.tap = null; if (A.drag && A.cur) { A.cur.e = A.g === 1 ? A.cur.e : A.drag.e0; if (A.g === 1) A.cur.ez = A.drag.e0; place(A.cur); } A.drag = null;
          // a tap on a post already standing: back in the hands (rule 24: undo before the next stage of the work)
          if (Math.hypot(p.x - t.x, p.y - t.y) < 12 && !A.busy && R.sight[A.g].posts.includes(t.k.pi)) { if (A.cur) A.cur.set = A.g === 1 ? A.cur.set : false; t.k.set = false; if (A.g === 1) t.k.set2 = false; A.retakes++; bring(t.k); X.word({ x: posOf(t.k).x, y: 3.2, z: posOf(t.k).z }, 'חזר לידיים'); }
          return;
        }
        A.tap = null;
        const d = A.drag; A.drag = null; if (!d || A.done || A.busy || !A.cur) return;
        if (Math.abs(d.x - d.x0) < 3) return;
        const k = A.cur;
        // (the lag: where the finger left it)
        if (A.g === 1) { k.ez = d.e0 + (d.x - d.x0) / d.px; k.set2 = true; } else k.e = d.e0 + (d.x - d.x0) / d.px;
        place(k); setDown(k);
      },
      end() {
        for (const k of K) { if (k.m) PR.remove(k.m); if (k.pole) PR.remove(k.pole); for (const [w] of k.crew) SH3.crew.remove(w); }
        for (const pl of A.poles) PR.remove(pl); if (A.chalk) PR.remove(A.chalk);
        keep(X, []); SH3.busy = 0; runBuild(X, m.lv);
      },
      at() { const p = R.posts[R.kposts[0]]; return { x: p.x, y: 3, z: p.z }; },
      dbg() {
        const k = A.cur;
        return { lv, g: A.g, done: A.done, busy: A.busy, cur: k ? k.pi : null, e: k ? +errOf(k).toFixed(3) : null, px: k ? +pxPer(k).toFixed(1) : null,
          scr: k ? sc(X, { x: posOf(k).x, y: X.ground(posOf(k).x, posOf(k).z) + topOf(k) + 0.6, z: posOf(k).z }) : null,
          set: K.map((q) => [q.pi, q.set ? 1 : 0, +q.e.toFixed(3), +q.ez.toFixed(3), q.grade]) };
      },
    };
  },
};

/* ───────── the lattice slabs to choose from: the right one, one whose pattern does not continue, (L2+) one of another pattern ───────── */
function candidates(R, lv, F, j) {
  const P = R.pattern === 'diag' ? 0.42 : 0.5, out = [{ type: R.pattern, shift: 0, ok: 1 }, { type: R.pattern, shift: R.pattern === 'diag' ? P / 2 : P, ok: 0 }];
  if (lv >= 2) out.push({ type: R.pattern === 'diag' ? 'ring' : 'diag', shift: 0, ok: 0 });
  // (level 2 on: the right one may come up upside down, its carved band below)
  if (lv >= 2 && rnd(j * 3 + lv) > 0.35) out[0].upside = 1;
  // their order on the ground (deterministic, the right one not always first)
  const k = Math.floor(rnd(j * 7 + lv * 13) * out.length); const r = out.splice(0, 1)[0]; out.splice(k, 0, r);
  return out;
}

/* ───────── 2. the lattice slab: choose, turn, lower ───────── */
export const SLAB = {
  icon: '▦', title: 'הלוח הסרוג',
  walkLine: (m) => `${RUNS[m.lv].where}: הלוחות הסרוגים`,
  stand(m, X) { const R = RUNS[m.lv], [a, b] = R.bays[R.order[0]]; return standBay(bayFrame(m.lv, a, b, runPosts(m.lv, X.M.st))); },
  prepare(m, X) { const R = RUNS[m.lv], [a, b] = R.bays[R.order[0]]; craneFor(X, bayFrame(m.lv, a, b, runPosts(m.lv, X.M.st))); },
  make(m, X) {
    const lv = X.level(), R = RUNS[m.lv], st = X.M.st, PR = X.props, T = X.THREE;
    SH3.busy = 1; SH3.camD = 24;
    const ps = runPosts(m.lv, st);
    st.slabs[m.lv] = st.slabs[m.lv] || { laid: R.bays.map(() => 0) };
    const laid = st.slabs[m.lv].laid;
    const A = { bi: -1, F: null, H: null, cands: [], held: null, done: false, t: 0, wrong: 0, mirror: 0, miss: 0, chips: 0, breaks: 0, grades: [], laidM: [], crew: [], busy: false };
    function crewAt(F) {
      for (const w of A.crew) SH3.crew.remove(w); A.crew = [];
      // the treadwheel's men (they walk it as the rope pays out), one at the bay with a hand up for the slab
      const C = SH3.crane; const b = C.base;
      A.crew.push(SH3.crew.add(b.x + F.ux * 1.6, b.z + F.uz * 1.6, { role: 'pull', item: 'rope', fx: F.cx, fz: F.cz, crew: 1 }));
      A.crew.push(SH3.crew.add(F.cx + F.nx * 1.2 + F.ux * (F.W / 2 + 0.9), F.cz + F.nz * 1.2 + F.uz * (F.W / 2 + 0.9), { role: 'hold', item: 'rope', fx: F.cx, fz: F.cz, crew: 2 }));
    }
    function openBay() {
      const j = R.order.find((i) => !laid[i]);
      if (j == null) { finish(); return; }
      A.bi = j; const [a, b] = R.bays[j]; const F = bayFrame(m.lv, a, b, ps); A.F = F;
      craneFor(X, F); crewAt(F); keep(X, [bayKeep(F)]);
      for (const c of A.cands) PR.remove(c.g); A.cands = [];
      // the last of level 3 closes between two standing slabs: its pattern meets both, its grooves are tight (spec 2, level 3)
      const between = R.order.indexOf(j) === R.order.length - 1 && m.lv === 3;
      A.between = between;
      if (A.H) A.H.dispose();
      A.H = createHoist(X, { F, seatY: H112.SILL, entryY: H112.POST_H, tol: between ? 0.07 : 0.14, vSafe: between ? 0.75 : lv >= 2 ? 0.9 : 1.0, wind: lv >= 3 || !!R.wind, crane: SH3.crane, onEvent });
      candidates(R, lv, F, j).forEach((c, k, L) => {
        const g = latticeSlab(X, { type: c.type, s0: F.s0, W: F.W, outer: F.ns, shift: c.shift }); const p = candAt(F, k, L.length);
        const o = { ...c, g, k, home: p }; homeC(o); A.cands.push(o);
      });
      bayShot(X, F); const sp = standBay(F); heroAt(X, sp.x, sp.z, F.cx, F.cz);
      const o0 = A.cands[0];
      X.line(laid.some(Boolean) ? 'הלוח הבא: הדוגמה ממשיכה' : 'הקישו על הלוח שממשיך את הדוגמה');
      X.hand({ x: o0.home.x, y: 1.4, z: o0.home.z }, 0, 12);
    }
    function homeC(o) {
      o.g.position.set(o.home.x, X.ground(o.home.x, o.home.z) + H112.SLAB_H / 2 + 0.04, o.home.z); o.g.rotation.set(0, A.F.yaw, 0); o.g.visible = true;
      const s = o.g.userData.slab; s.rotation.x = o.upside ? Math.PI : 0;
    }
    async function choose(o) {
      if (A.busy) return; A.busy = true; X.hand(null);
      if (A.held && A.held !== o) { homeC(A.held); A.H.release(); }
      A.held = o; X.play('rope');
      // the crew hooks it and the wheel lifts it over the bay
      const from = o.g.position.clone(), to = { x: A.F.cx, y: A.H.hang0 + H112.SLAB_H / 2, z: A.F.cz };
      const th0 = (rnd(A.bi * 5 + lv) > 0.5 ? 1 : -1) * (0.9 + 1.4 * rnd(A.bi * 3 + 2));
      for (let i = 1; i <= 22; i++) { await X.wait(0.04); const u = ease(i / 22); o.g.position.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u) + Math.sin(u * Math.PI) * 1.2, lerp(from.z, to.z, u)); o.g.rotation.y = A.F.yaw + th0 * u; }
      A.H.hang(o.g, { th: th0, flip: o.upside });
      A.busy = false;
      X.line(o.upside ? 'הכותרת למטה: הקישו להפוך' : 'גררו לסובב · החזיקו להוריד');
      X.hand({ x: A.F.cx, y: A.H.y + H112.SLAB_H / 2, z: A.F.cz }, 50, 0);
    }
    async function onEvent(k, i) {
      const H = A.H, o = A.held, F = A.F, at = { x: F.cx, y: H112.POST_H + 1.2, z: F.cz };
      if (k === 'gust-warn') { X.line('הדגלון מתנופף: משב בדרך!', 1600); return; }
      if (k === 'entry-miss') { A.miss++; X.word(at, i.upside ? 'הפוך: לא נכנס לחריץ · הקישו כדי להפוך' : 'לא בכיוון החריצים · סובבו'); return; }
      if (k === 'gust-hit' || k === 'chip') {
        // real damage (spec "הניקוד בהפסד"): a corner off on a hard landing; a slab smashed on a post in a gust
        if (k === 'chip') { A.chips++; X.loss(20, at, 'נחיתה קשה: פינה נשברה', 1); } else { A.breaks++; X.loss(40, at, 'המשב הטיח את הלוח בניצב: נשבר לשניים', 2); }
        X.shake(k === 'chip' ? 0.2 : 0.45, 0.4); X.dust(o.g.position.x, 0.6, o.g.position.z, k === 'chip' ? 12 : 26, 1.8);
        try { PR.chunksAt({ x: o.g.position.x, y: o.g.position.y, z: o.g.position.z, r: 0.6 }, k === 'chip' ? 3 : 7); } catch (e) { /* */ }
        H.busy = true; await X.wait(0.8); H.release(); H.busy = false;
        // the crew brings another of the same from the cart
        const g = latticeSlab(X, { type: o.type, s0: F.s0, W: F.W, outer: F.ns, shift: o.shift }); PR.remove(o.g); o.g = g; A.held = null; homeC(o);
        X.line(k === 'chip' ? 'לוח חדש · בעדינות בסוף' : 'לוח חדש · לא מורידים במשב');
        return;
      }
      if (k === 'seat') {
        if (!o.ok) {
          // its pattern does not run on: it stops on the sill, knocks the post; back to the cart (no damage)
          A.wrong++; X.word(at, 'הדוגמה לא ממשיכה את השכן'); X.play('thud');
          await H.raise(2.8); H.release(); homeC(o); A.held = null; X.line('בחרו לוח אחר');
          return;
        }
        if (i.mirrored) { A.mirror++; X.word(at, 'הדוגמה הפוכה: סובבו חצי סיבוב'); X.play('thud'); await H.raise(2.6); return; }
        // seated: the stone click, the pattern one line, light through its holes
        const grade = i.v <= 0.5 ? 'gold' : 'good';
        X.play('settle'); X.dust(F.cx, 0.3, F.cz, 10, F.W * 0.4); X.shake(0.08, 0.15);
        try { X.hero.act('tamp', { x: F.cx, y: 1.0, z: F.cz }, { snap: true }); } catch (e) { /* */ }
        X.hit({ x: F.cx, y: H112.SLAB_H + 1.0, z: F.cz }, grade, { text: 'נכנס!', craft: 'בנאים' });
        A.grades.push(grade); laid[A.bi] = 1; A.laidM.push(o.g); A.held = null; H.release();
        for (const c of A.cands) if (c !== o) PR.remove(c.g); A.cands = [];
        X.save();
        await X.wait(1.0);
        openBay();
      }
    }
    async function finish() {
      A.done = true; X.hand(null); X.line('');
      if (A.H) A.H.dispose(); SH3.crane.g.visible = false;
      st.slabs[m.lv] = { done: 1, laid: R.bays.map(() => 1) }; X.save();
      const base = A.grades.reduce((s, g) => s + (g === 'gold' ? 1 : 0.85), 0) / Math.max(1, A.grades.length);
      const q = clamp(base - 0.1 * A.wrong - 0.06 * A.mirror, 0.3, 1) * Math.pow(0.7, A.chips) * Math.pow(0.55, A.breaks);
      if (!A.wrong && !A.chips && !A.breaks) X.bonus(100, 'lattice', 'כל הלוחות נכנסו בלי טעות');
      const a = R.posts[R.c0], b = R.posts[R.close[0]]; const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, n = LINE[a.line];
      X.shot([mx + n[0] * 10, 6, mz + n[1] * 10], [mx, 1, mz], 1.2);
      await X.wait(1.4);
      X.end({ q, stars: starsOf(q), at: { x: mx, y: 2.5, z: mz } });
    }
    function candAtP(p) {
      const objs = A.cands.filter((c) => c !== A.held && c.g.visible).map((c) => c.g);
      const hits = X.rayAt(p.x, p.y).intersectObjects(objs, true); if (!hits.length) return null;
      let ob = hits[0].object; while (ob && !A.cands.find((c) => c.g === ob)) ob = ob.parent; return A.cands.find((c) => c.g === ob) || null;
    }
    return {
      begin() { openBay(); },
      update(dt) { A.t += dt; if (A.H) { A.H.tick(); A.H.update(dt); } },
      down(p) {
        if (A.done || A.busy) return;
        const c = candAtP(p); if (c) { A.tapC = { c, x: p.x, y: p.y }; return; }
        if (A.held && A.H) { A.H.down(p); X.hand(null); }
      },
      move(p) { if (A.H && !A.tapC) A.H.move(p); },
      // (build 125: the slabs lying to choose from, and the slab on the rope (a large moving thing) — the rest is the look)
      wants(p) { if (A.done || A.busy) return false; if (candAtP(p) || nearObjs(X, p, A.cands.filter((c) => c !== A.held && c.g.visible).map((c) => c.g))) return true; return !!(A.held && A.H && A.H.g) && nearObjs(X, p, [A.H.g], bigR()); },
      up(p) {
        if (A.tapC) { const t = A.tapC; A.tapC = null; if (Math.hypot(p.x - t.x, p.y - t.y) < 14) choose(t.c); return; }
        if (!A.H) return; const r = A.H.up(p);
        if (r === 'tap' && A.held) { A.H.flipNow(); X.line('הצוות הופך את הלוח'); }
      },
      end() {
        if (A.H) A.H.dispose(); for (const c of A.cands) PR.remove(c.g); for (const g of A.laidM) PR.remove(g);
        for (const w of A.crew) SH3.crew.remove(w); SH3.crane.g.visible = false;
        keep(X, []); SH3.busy = 0; runBuild(X, m.lv);
      },
      at() { return A.F ? { x: A.F.cx, y: 2.5, z: A.F.cz } : { x: 165, y: 2, z: 0 }; },
      dbg() {
        const H = A.H, F = A.F;
        return { lv, bay: A.bi, done: A.done, busy: A.busy, held: A.held ? A.cands.indexOf(A.held) : -1, between: !!A.between, wrong: A.wrong, chips: A.chips, breaks: A.breaks,
          cands: A.cands.map((c) => ({ ok: c.ok, upside: c.upside ? 1 : 0, scr: sc(X, { x: c.g.position.x, y: c.g.position.y, z: c.g.position.z }) })),
          h: H ? H.state() : null, slab: A.held && F ? sc(X, { x: F.cx, y: (H ? H.y : 3) + H112.SLAB_H * 0.5, z: F.cz }) : null, laid: laid.slice() };
      },
    };
  },
};

/* ───────── 3. the warning slab: count, turn it out, lower it, its word in red ───────── */
export const WARN = {
  icon: '⚠', title: 'אבן האזהרה',
  walkLine: (m) => `${RUNS[m.lv].where}: לוח האזהרה`,
  // (beside the frame, not before it: the count runs along the row behind him)
  stand(m, X) { const W = warnOf(m.lv), s = warnSeat(m.lv, W.at, runPosts(m.lv, X.M.st)), u = [-s.nz, s.nx], R = RUNS[m.lv], d = Math.sign((R.posts[W.from].x - s.x) * u[0] + (R.posts[W.from].z - s.z) * u[1]) || 1; return { x: s.x + s.nx * 2.2 - u[0] * d * 3.0, z: s.z + s.nz * 2.2 - u[1] * d * 3.0, face: [s.x, s.z] }; },
  prepare() { },
  make(m, X) {
    const lv = X.level(), R = RUNS[m.lv], W = warnOf(m.lv), st = X.M.st, PR = X.props, T = X.THREE;
    SH3.busy = 1; SH3.camD = 24;
    const ps = runPosts(m.lv, st), run = SH3.runs[m.lv] || runBuild(X, m.lv);
    const seat = warnSeat(m.lv, W.at, ps), u = [-seat.nz, seat.nx];
    const F = { cx: seat.x, cz: seat.z, ux: u[0], uz: u[1], nx: seat.nx, nz: seat.nz, yaw: seat.yaw, W: H112.WARN_W };
    keep(X, [bayKeep(F, 16)]);
    const A = { phase: 'count', wrongPost: 0, mirror: 0, miss: 0, chips: 0, done: false, t: 0, busy: false, H: null, g: null, cov: 0, stains: 0, paint: null, pT: 0, glow: null, crew: [] };
    // the slab on the cart: lying, its text up (the crews bring it to the post he names)
    SH3.cart.place(seat.x + seat.nx * 4.8 + u[0] * 4.2, seat.z + seat.nz * 4.8 + u[1] * 4.2, Math.atan2(-u[1], u[0]));
    const g = warnSlab(X, W.word, 0); A.g = g;
    const cartTop = () => ({ x: SH3.cart.g.position.x, y: SH3.cart.g.position.y + SH3.cart.top + H112.WARN_T / 2 + 0.02, z: SH3.cart.g.position.z });
    function onCart() { const c = cartTop(); g.position.set(c.x, c.y, c.z); g.rotation.set(-Math.PI / 2, seat.yaw, 0, 'YXZ'); g.userData.slab.rotation.set(0, 0, 0); }
    onCart();
    // level 1: the tall post shows itself (spec 3: "הניצב הגבוה מסמן את עצמו"); the count from the crews' last warning
    if (lv === 1) { const p = ps[W.at]; const r = PR.ringAt(p.x, p.z, 1.3, 0.12, PR.M.chalk); A.glow = r; }
    const counts = [];
    function showCount(on) {
      for (const L of counts) L.remove(); counts.length = 0; if (!on) return;
      // (level 1: the posts counted from the last warning, in chalk on the floor)
      let n = 0; for (let i = W.from + 1; i < ps.length && n < W.every; i++) { n++; const L = label(X); const p = ps[i]; L.set(String(n), { x: p.x + seat.nx * 1.0, y: 0.4, z: p.z + seat.nz * 1.0 }); counts.push(L); }
    }
    showCount(lv === 1);
    function shotCount() {
      // (from the last warning slab to two past his: all in frame, its length decides the distance)
      const a = ps[W.from], b = ps[Math.min(ps.length - 1, W.at + 1)]; const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, L = Math.hypot(b.x - a.x, b.z - a.z);
      const d = Math.max(13, L * 1.25 + 4); X.shot([mx + seat.nx * d, 2 + d * 0.32, mz + seat.nz * d], [mx, 1.3, mz], 1.0);
    }
    function shotHang() { bayShot(X, F, { d: 11, side: 0.4, look: 1.0, h: 5 }); }
    function shotMacro() { X.shot([seat.x + seat.nx * 1.95, seat.y + 0.05, seat.z + seat.nz * 1.95], [seat.x, seat.y, seat.z], 0.9); }
    function postAt(p) {
      const idx = Object.keys(run.posts || {}).map(Number).filter((i) => run.posts[i]);
      const hits = X.rayAt(p.x, p.y).intersectObjects(idx.map((i) => run.posts[i]), true);
      if (!hits.length) {
        // (a tall post is an open frame: a tap between its uprights, or near a post, is on it)
        let best = -1, bd = 46; for (const i of idx) { const q = ps[i], h = q.tall ? H112.TALL_H : H112.POST_H; for (const f of [0.3, 0.6, 0.9]) { const r = X.scr(q.x, h * f, q.z), d = Math.hypot(r.x - p.x, r.y - p.y); if (d < bd) { bd = d; best = i; } } }
        return best;
      }
      let o = hits[0].object; while (o && !idx.some((i) => run.posts[i] === o)) o = o.parent; const f = idx.find((i) => run.posts[i] === o); return f == null ? -1 : f;
    }
    async function lift() {
      A.busy = true; A.phase = 'hang'; X.hand(null); showCount(false); if (A.glow) { PR.remove(A.glow); A.glow = null; }
      craneFor(X, F); shotHang();
      A.crew.push(SH3.crew.add(SH3.crane.base.x + F.ux * 1.6, SH3.crane.base.z + F.uz * 1.6, { role: 'pull', item: 'rope', fx: F.cx, fz: F.cz, crew: 1 }));
      A.crew.push(SH3.crew.add(seat.x + seat.nx * 1.3 + u[0] * 1.5, seat.z + seat.nz * 1.3 + u[1] * 1.5, { role: 'hold', item: 'rope', fx: seat.x, fz: seat.z, crew: 2 }));
      if (A.H) A.H.dispose();
      A.H = createHoist(X, { F, seatY: 0.9, entryY: H112.TALL_H, tol: 0.09, vSafe: 0.7, wind: false, crane: SH3.crane, hangY: 3.6, onEvent });
      const from = g.position.clone();
      g.userData.H = H112.WARN_H;
      for (let i = 1; i <= 22; i++) { await X.wait(0.04); const k = ease(i / 22); g.position.set(lerp(from.x, F.cx, k), lerp(from.y, 3.6 + H112.WARN_H / 2, k) + Math.sin(k * Math.PI), lerp(from.z, F.cz, k)); g.rotation.set(-Math.PI / 2 * (1 - k), seat.yaw + Math.PI * k, 0, 'YXZ'); }
      g.rotation.set(0, 0, 0);
      // it hangs with its text to the court (and at level 3 upside down as well: spec 3, "שתי הפיכות")
      A.H.hang(g, { th: Math.PI, flip: W.flips >= 2 ? 1 : 0, y: 3.6 });
      A.busy = false;
      X.line(W.flips >= 2 ? 'הכתב הפוך: הקישו, ואז סובבו החוצה' : 'סובבו את הכתב החוצה, אל ההר');
      X.hand({ x: F.cx, y: 4.2, z: F.cz }, 50, 0);
    }
    async function onEvent(k, i) {
      const H = A.H, at = { x: seat.x, y: H112.TALL_H + 1, z: seat.z };
      if (k === 'entry-miss') { A.miss++; X.word(at, i.upside ? 'הפוך: הקישו כדי להפוך' : 'החריץ צר: ישר יותר'); return; }
      if (k === 'chip') {
        A.chips++; X.loss(20, at, 'נחיתה קשה: הלוח נסדק לאורך הכתב', 1);
        const cr = new T.Mesh(PR.geo.box, PR.M.seam); cr.scale.set(0.04, H112.WARN_H * 0.9, H112.WARN_T + 0.04); g.userData.slab.add(cr); cr.rotation.z = 0.35;
        H.busy = true; await X.wait(1.0); H.busy = false; g.userData.slab.remove(cr);
        X.line('לוח חדש · בעדינות, החריץ צר');
        H.hang(g, { th: Math.PI, flip: W.flips >= 2 ? 1 : 0, y: 3.6 });
        return;
      }
      if (k === 'seat') {
        if (i.mirrored) { A.mirror++; X.word(at, 'הכתב פונה פנימה, אל העזרה · מי שבא מבחוץ לא יקרא'); X.play('thud'); await H.raise(3.2); return; }
        X.play('settle'); X.dust(seat.x, 1.0, seat.z, 8, 0.8); X.hit(at, i.v <= 0.45 ? 'gold' : 'good', { text: 'בחריץ', craft: 'בנאים' });
        H.release(); for (const w of A.crew) SH3.crew.remove(w); A.crew = []; SH3.crane.g.visible = false;
        await X.wait(0.8); paintStart();
      }
    }
    /* the paint: one word's letters, red, inside their cut (≤ 10 s, rule 16) */
    function paintStart() {
      A.phase = 'paint'; shotMacro();
      const sp = { x: seat.x + seat.nx * 1.25 - u[0] * 0.9, z: seat.z + seat.nz * 1.25 - u[1] * 0.9 }; heroAt(X, sp.x, sp.z, seat.x, seat.z);
      const wc = g.userData.wc, base = document.createElement('canvas'); base.width = wc.W; base.height = wc.H; base.getContext('2d').drawImage(wc.c, 0, 0);
      const lay = document.createElement('canvas'); lay.width = wc.W; lay.height = wc.H;
      // the word's letters as a grid of cells (the coverage) — and the mask's own pixels, to tell a stroke inside the cut from a stain
      const mg = wc.mask.getContext('2d'), md = mg.getImageData(0, 0, wc.W, wc.H).data;
      const inMask = (x, y) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= wc.W || y >= wc.H) return false; return md[(y * wc.W + x) * 4 + 3] > 40; };
      const near = (x, y, r) => { for (let a = 0; a < 8; a++) { const q = (a / 8) * Math.PI * 2; if (inMask(x + Math.cos(q) * r, y + Math.sin(q) * r)) return true; } return inMask(x, y); };
      const cells = []; const B = wc.box;
      for (let y = Math.floor(B.y0); y < B.y1; y += 6) for (let x = Math.floor(B.x0); x < B.x1; x += 6) if (inMask(x, y)) cells.push({ x, y, on: 0 });
      A.paint = { wc, base, lay, inMask, near, cells, last: null, R: 15, start: A.t, dist: 0 };
      A.pT = A.t;
      X.line(`צבעו באדום את ${W.word}`);
      const c = B; const p0 = uvWorld((c.x0 + 6) / wc.W, c.cy / wc.H); X.hand(p0, 60, 0);
    }
    /** canvas (u, v from the top) → the world point on the slab's face */
    function uvWorld(uu, vv) { const lx = (uu - 0.5) * (H112.WARN_W - 0.04), ly = (0.5 - vv) * H112.WARN_H, s = g.userData.slab; const v = new T.Vector3(lx, ly, H112.WARN_T / 2 + 0.01); s.localToWorld(v); return { x: v.x, y: v.y, z: v.z }; }
    function stroke(p) {
      const P = A.paint; if (!P) return;
      const hit = X.rayAt(p.x, p.y).intersectObject(g.userData.slab, false)[0]; if (!hit || !hit.uv) { P.last = null; return; }
      const x = hit.uv.x * P.wc.W, y = (1 - hit.uv.y) * P.wc.H;
      const lg = P.lay.getContext('2d'), steps = P.last ? Math.max(1, Math.ceil(Math.hypot(x - P.last.x, y - P.last.y) / 5)) : 1;
      for (let i = 1; i <= steps; i++) {
        const qx = P.last ? lerp(P.last.x, x, i / steps) : x, qy = P.last ? lerp(P.last.y, y, i / steps) : y;
        if (P.near(qx, qy, P.R * 1.15)) { lg.fillStyle = '#B8241A'; lg.beginPath(); lg.arc(qx, qy, P.R, 0, Math.PI * 2); lg.fill(); for (const c of P.cells) if (!c.on && Math.hypot(c.x - qx, c.y - qy) <= P.R) c.on = 1; }
        else { P.dist += 5; if (P.dist > 26) { P.dist = 0; A.stains++; const bg = P.base.getContext('2d'); bg.fillStyle = 'rgba(176,40,28,.55)'; bg.beginPath(); bg.arc(qx, qy, P.R * 0.7, 0, Math.PI * 2); bg.fill(); } }
      }
      P.last = { x, y };
      // the face: the stone, then the red masked to the letters' cut
      const g2 = P.wc.c.getContext('2d'); g2.drawImage(P.base, 0, 0);
      const tmp = document.createElement('canvas'); tmp.width = P.wc.W; tmp.height = P.wc.H; const tg = tmp.getContext('2d'); tg.drawImage(P.lay, 0, 0); tg.globalCompositeOperation = 'destination-in'; tg.drawImage(P.wc.mask, 0, 0);
      g2.drawImage(tmp, 0, 0); g.userData.tex.needsUpdate = true;
      A.cov = P.cells.filter((c) => c.on).length / Math.max(1, P.cells.length);
      if (A.cov >= 0.93) paintEnd();
    }
    async function paintEnd() {
      if (A.phase !== 'paint') return; A.phase = 'show'; X.count(null); X.hand(null);
      const at = uvWorld(0.5, 0.5);
      if (A.cov >= 0.8) X.hit({ x: at.x, y: at.y + 1, z: at.z }, A.stains <= 1 ? 'gold' : 'good', { text: 'אדום!', craft: 'צבעים' }); else X.word({ x: at.x, y: at.y + 1, z: at.z }, 'הצבע לא מילא את כל האותיות');
      // as the people coming up the Mount will see it (spec 3: "המצלמה עוברת לצד ההר")
      X.line(''); X.shot([seat.x + seat.nx * 7.5 + u[0] * 1.2, 2.2, seat.z + seat.nz * 7.5 + u[1] * 1.2], [seat.x, 1.6, seat.z], 1.4);
      await X.wait(2.2);
      finish();
    }
    async function finish() {
      A.done = true;
      st.warn[m.lv] = { done: 1, cov: +A.cov.toFixed(3), stains: A.stains }; X.save();
      const q = clamp(Math.pow(0.85, A.wrongPost) * (A.mirror ? 0.9 : 1) * Math.pow(0.65, A.chips) * (0.45 + 0.55 * A.cov) - 0.04 * A.stains, 0.25, 1);
      if (!A.wrongPost && !A.chips && A.cov >= 0.9 && A.stains <= 1) X.bonus(100, 'warn', 'אבן האזהרה, בלי טעות');
      X.end({ q, stars: starsOf(q), at: { x: seat.x, y: 3.2, z: seat.z } });
    }
    return {

      begin() {
        shotCount(); const sp = WARN.stand(m, X); heroAt(X, sp.x, sp.z, sp.face[0], sp.face[1]);
        X.line(`כל ניצב ${W.every === 4 ? 'רביעי' : 'שלישי'}: הקישו עליו`);
        if (lv === 1) { const p = ps[W.at]; X.hand({ x: p.x, y: H112.TALL_H + 0.4, z: p.z }, 0, 12); }
      },
      update(dt) {
        A.t += dt; if (A.H) { A.H.tick(); A.H.update(dt); }
        if (A.phase === 'paint') { const left = Math.max(0, 10 - (A.t - A.pT)); const c = uvWorld(0.92, 0.08); X.count(c, String(Math.ceil(left))); if (left <= 0) paintEnd(); }
      },
      down(p) {
        if (A.done || A.busy) return;
        if (A.phase === 'count') { A.tap = { x: p.x, y: p.y, i: postAt(p) }; return; }
        if (A.phase === 'hang' && A.H) { A.H.down(p); X.hand(null); return; }
        if (A.phase === 'paint') { X.hand(null); A.paint.last = null; stroke(p); A.painting = true; }
      },
      move(p) { if (A.phase === 'hang' && A.H) A.H.move(p); if (A.phase === 'paint' && A.painting) stroke(p); },
      // (build 125: counting, the posts; hanging, the slab on the rope; painting, the slab's face — the rest is the look)
      wants(p) {
        if (A.done || A.busy) return false; if (!p) return true;
        if (A.phase === 'count') return postAt(p) >= 0 || nearPts(X, p, ps.map((q) => ({ x: q.x, y: (q.tall ? H112.TALL_H : H112.POST_H) * 0.6, z: q.z })));
        if (A.phase === 'hang') return !!(A.H && A.H.g) && nearObjs(X, p, [A.H.g], bigR());
        if (A.phase === 'paint') return nearPts(X, p, [seat], bigR());
        return false;
      },
      up(p) {
        if (A.phase === 'count' && A.tap) {
          const t = A.tap; A.tap = null; if (Math.hypot(p.x - t.x, p.y - t.y) > 14 || t.i < 0) return;
          const at = { x: ps[t.i].x, y: H112.TALL_H + 1, z: ps[t.i].z };
          if (t.i === W.at) { X.hit(at, A.wrongPost ? 'good' : 'gold', { text: 'כאן', craft: 'מודדים' }); lift(); }
          else { A.wrongPost++; X.word(at, ps[t.i].tall ? 'ניצב גבוה, אבל לא במרחק הנכון · ספרו שוב' : 'לא כאן · ספרו שוב מהאבן הקודמת'); X.play('thud'); }
          return;
        }
        if (A.phase === 'hang' && A.H) { const r = A.H.up(p); if (r === 'tap') { A.H.flipNow(); X.line('הצוות הופך את הלוח'); } return; }
        if (A.phase === 'paint') { A.painting = false; if (A.paint) A.paint.last = null; }
      },
      end() {
        if (A.H) A.H.dispose(); for (const w of A.crew) SH3.crew.remove(w); SH3.crane.g.visible = false; SH3.cart.hide();
        showCount(false); if (A.glow) PR.remove(A.glow); X.count(null);
        PR.remove(g); keep(X, []); SH3.busy = 0; runBuild(X, m.lv);
      },
      at() { return { x: seat.x, y: 3, z: seat.z }; },
      dbg() {
        const H = A.H, out = { lv, phase: A.phase, done: A.done, busy: A.busy, wrongPost: A.wrongPost, chips: A.chips, cov: +A.cov.toFixed(3), stains: A.stains, at: W.at,
          posts: ps.map((p, i) => (run.posts && run.posts[i] ? { i, tall: p.tall ? 1 : 0, scr: sc(X, { x: p.x, y: (p.tall ? H112.TALL_H : H112.POST_H) * 0.7, z: p.z }) } : null)).filter(Boolean),
          h: H ? H.state() : null, slab: sc(X, { x: F.cx, y: (H ? H.y : 3) + H112.WARN_H / 2, z: F.cz }) };
        if (A.paint) {
          // the bot's strokes: four passes along the word's box (screen points)
          const B = A.paint.wc.box, rows = [0.3, 0.45, 0.6, 0.75].map((f) => B.y0 + (B.y1 - B.y0) * f);
          out.strokes = rows.map((y) => [B.x0 + 2, B.x1 - 2].map((x) => sc(X, uvWorld(x / A.paint.wc.W, y / A.paint.wc.H))));
        }
        return out;
      },
    };
  },
};

export const ACTS = {
  posts: POSTS, slab: SLAB, warn: WARN, steps: STEPS_ACT, close: CLOSE,
  __init: initWorld,
  __sh: () => SH3,
  __frame(dt, X) { frameWorld(dt, X); },
};
void runPosts;
