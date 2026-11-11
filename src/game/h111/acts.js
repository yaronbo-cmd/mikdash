/* ── build 111 ── h111/acts.js — the acts of stage 02 "חומת העזרה", each played on the courts' wall in the old world (spec §"המשחקונים עד
 * רמת המגע"). The same registry as stage 01's (h109/acts.js):
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face, mx?, mz? }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), close? } — it calls X.end({ stars, q, at }) once.
 * This file: 1 the line and the stakes, 2 the course in bond (the station that repeats), 3 the plumb line. acts2.js: 4 the great stone
 * on the crowbar, 5 the gates' frames, 6 the closing stone.
 */
import { H111, STRETCH, puzzleOf, checkCourse, starsOf } from './model.js';
import { SH2, frameOf, rowOff, stoneMesh, placeStone, laidFill, label, initWorld, frameWorld, holesOn, ensureLaid } from './world.js';
import { onPlane, clamp, lerp, ease } from '../h109/kit.js';
import { LEVER, GATES, CLOSING } from './acts2.js';

const H = H111.H;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** the ramp's place for a station: on the wall's inner face, `along` amot from cell 0 (the kohen's side) */
export function rampFor(F, along = -5.5) { const p = F.at(along, -3); return { x: p.x, z: p.z, nx: F.nx, nz: F.nz }; }
/** where he stands on the wall's top for stretch work: left of the gap (from the court), on the inner half */
export function standTop(F, along = -1.7, across = -1.2) { const p = F.at(along, across); const c = F.at(F.G / 2, 0); return { x: p.x, z: p.z, face: [c.x, c.z] }; }
/** the crew of a station on the wall's top: two masons at work beyond the crane, one on the crane's rope; a carrier on the ramp */
function stationCrew(X, F, o = {}) {
  const C = SH2.crew, out = [];
  const m1 = F.at(F.G + (o.far || 13.5), -1.2), m2 = F.at(F.G + (o.far || 13.5) + 2.4, 1.0), t = F.at(F.G + (o.far || 13.5) + 1.2, 0);
  out.push(C.add(m1.x, m1.z, { role: 'hammer', item: 'mallet', fx: t.x, fz: t.z, crew: 3 }));
  out.push(C.add(m2.x, m2.z, { role: 'hammer', item: 'mallet', fx: t.x, fz: t.z, crew: 3, off: 0.45 }));
  // the earth for the ramp: a carrier up and down it with his basket (the crews pour the slope, spec "משאירים")
  const R = rampFor(F), foot = { x: R.x - R.nx * 9, z: R.z - R.nz * 9 }, top = { x: R.x - R.nx * 1.5 - F.ux * 1.6, z: R.z - R.nz * 1.5 - F.uz * 1.6 };
  out.push(C.add(foot.x, foot.z, { role: 'carry', item: 'basket', from: [foot.x, foot.z], to: [top.x, top.z], crew: 1 }));
  return out;
}
/** the crane stands on the wall's top past the stock, its jib over the work */
function craneAt(X, F, along) { const p = F.at(along, 0.2); SH2.crane.place(p.x, p.z, F.yaw + Math.PI / 2 * 0 + Math.atan2(-F.ux, -F.uz) - Math.atan2(F.ux, F.uz) * 0); SH2.crane.g.visible = true; SH2.craneAt = { s: F.s, along }; const c = F.at(F.G / 2, 0); SH2.crane.aim(c.x, c.z, 1); }

/* ───────── 1. the line and the stakes: h111/stakes.js (build 118) ───────── */
import { STAKES } from './stakes.js';
export { STAKES };

/* ───────── 2. the course in bond: h111/bond.js (build 118) ───────── */
import { BOND } from './bond.js';
export { BOND };

/* ───────── 3. the plumb line (after every course, nine times) ───────── */
const SB = 2 / 24;   // the setback: about two fingers (an amah of 24 fingers; Herodian courses 3–5 cm in, archaeology of the Western Wall)
export const PLUMB = {
  icon: '📐', title: 'היישור באנך',
  walkLine: (m) => `קטע ${m.s}: יישור באנך`,
  stand(m) { const F = frameOf(m.s); return standTop(F, -1.4, 0.4); },
  prepare(m, X) { const F = frameOf(m.s); try { X.stages.s20Pin(rampFor(F)); } catch (e) { /* */ } craneAt(X, F, F.G + 10.5); },
  make(m, X) {
    const F = frameOf(m.s), lv = X.level(), T3 = X.THREE, PR = X.props, Pz = puzzleOf(m.s);
    const wet = lv >= 3, target = lv >= 2 ? -SB : 0, TOL = { gold: 0.04, good: 0.1 };
    const L = ensureLaid(X, m.s);
    const st = X.M.st;
    // the outer face's stones, two or three of them out of line (the crews set them roughly; he trues them)
    let face = L ? L.stones.map((q, i) => ({ q, m: L.meshes[i] })).filter((o) => o.q.row === 0) : [];
    if (!face.length && L) face = L.stones.map((q, i) => ({ q, m: L.meshes[i] })).filter((o) => o.q.row === 'h');
    const r = (k) => { const v = Math.sin((m.s * 31 + k * 17) * 12.9898) * 43758.5453; return v - Math.floor(v); };
    const nOff = Math.min(face.length, lv >= 2 ? 3 : 2);
    const pickI = face.map((_, i) => i).sort((a, b) => r(a) - r(b)).slice(0, nOff).sort((a, b) => face[a].q.a - face[b].q.a);
    const S = pickI.map((i, k) => ({ o: face[i], off: (r(k + 5) > 0.5 ? 1 : -1) * (0.3 + 0.35 * r(k + 9)), taps: 0, hard: 0, cracked: false, okd: false, q: 1, par: 0, crack: null, ind: null, rod: null, str: null, bob: null }));
    for (const s of S) { s.par = 1 + Math.ceil(Math.abs(s.off - target) / 0.32); s.o.q.off = s.off; placeStone(X, F, s.o.m, s.o.q); }
    const A = { press: null, done: false, t: 0, breaks: 0, busy: false };
    // the plumb rods: a rod out over the face from the top, the line and its bob down to the course below (its face is the plumb)
    const rodM = PR.M.wood, strM = new T3.MeshBasicMaterial({ color: 0x2A1E12 }), arrowM = new T3.MeshBasicMaterial({ color: 0xE0563E, transparent: true, opacity: 0.95, depthWrite: false }), goldLine = new T3.MeshBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.9, depthWrite: false });
    for (const s of S) {
      const w = s.o.q.L, al = s.o.q.a + w / 2;
      const rod = new T3.Mesh(PR.geo.box, rodM); const r0 = F.at(al, 3.1 - 1.2, H + 0.35 + 0.12); rod.scale.set(0.16, 0.16, 2.8); rod.position.set(r0.x, r0.y, r0.z); rod.rotation.y = F.yaw; PR.root.add(rod); s.rod = rod;
      const top = F.at(al, 3.02, H + 0.35), bot = F.at(al, 3.02, -H * 0.55);
      const str = new T3.Mesh(PR.geo.box, strM); str.scale.set(0.03, top.y - bot.y, 0.03); str.position.set(top.x, (top.y + bot.y) / 2, top.z); PR.root.add(str); s.str = str;
      const bob = new T3.Mesh(new T3.ConeGeometry(0.18, 0.4, 8), PR.M.woodD); bob.rotation.x = Math.PI; bob.position.set(bot.x, bot.y - 0.2, bot.z); PR.root.add(bob); s.bob = bob;
      // the mark to reach (from level 2: two fingers in from the line) as a gold tick on the stone's top, and the arrow of the error
      const ind = new T3.Mesh(new T3.ConeGeometry(0.28, 0.7, 3), arrowM.clone()); PR.root.add(ind); s.ind = ind;
      const tk = new T3.Mesh(PR.geo.box, goldLine); const tp = F.at(al, 3 + target, H + 0.03); tk.scale.set(w * 0.9, 0.03, 0.07); tk.position.set(tp.x, tp.y, tp.z); tk.rotation.y = F.yaw; PR.root.add(tk); s.tick = tk;
    }
    const err = (s) => s.off - target;
    function indSync(s) {
      const w = s.o.q.L, al = s.o.q.a + w / 2, e = err(s), ok = Math.abs(e) <= TOL.good;
      const p = F.at(al, 3 + s.off + (e > 0 ? 0.6 : 1.4), H + 0.9); s.ind.position.set(p.x, p.y, p.z);
      // the arrow points the way the stone must go: inward (−n) when it stands proud, outward when it is sunk
      const dir = e > 0 ? -1 : 1, yaw = Math.atan2(F.nx * dir, F.nz * dir); s.ind.rotation.set(Math.PI / 2, 0, 0); s.ind.rotation.y = 0; s.ind.quaternion.setFromEuler(new T3.Euler(Math.PI / 2, yaw, 0, 'YXZ'));
      const k = clamp(Math.abs(e) / 0.5, 0.35, 1.2); s.ind.scale.set(k, k, k); s.ind.visible = !s.okd;
      s.ind.material.color.setHex(ok ? 0xFFD66E : 0xE0563E); s.tick.material = s.okd ? goldLine : goldLine;
    }
    S.forEach(indSync);
    const crew = stationCrew(X, F);
    function shot() {
      // close, from outside and a little along the face: the stones' faces against the lines (rule 16: ≤ 10 s of close work each)
      const a0 = S.length ? S[0].o.q.a : 0, a1 = S.length ? S[S.length - 1].o.q.a + S[S.length - 1].o.q.L : F.G, mid = (a0 + a1) / 2, span = Math.max(7, a1 - a0 + 4);
      const t = F.at(mid, 2.6, H * 0.55), p = F.at(mid - span * 0.75, 3 + span * 0.62, H + span * 0.32);
      X.shot([p.x, p.y, p.z], [t.x, t.y, t.z], 1.0);
    }
    function stoneAt(p) {
      const hits = X.rayAt(p.x, p.y).intersectObjects(S.filter((s) => !s.okd).map((s) => s.o.m), false);
      return hits.length ? S.find((s) => s.o.m === hits[0].object) : null;
    }
    async function breakStone(s) {
      // the third hard blow: the corner breaks off, the stone is rejected; the crews' wheel lifts it out and lowers a new one
      A.busy = true; A.breaks++;
      const c = s.o.m.position, at = { x: c.x, y: c.y + H, z: c.z };
      try { PR.chunksAt({ x: c.x + F.nx * 1, y: c.y - H / 2, z: c.z + F.nz * 1, r: 0.8 }, 5); } catch (e) { /* */ }
      X.dust(c.x, c.y, c.z, 18, 1.6); X.shake(0.3, 0.5);
      X.loss(20, at, 'הפינה נשברה · האבן נפסלה', 1);
      if (s.crack) { PR.remove(s.crack); s.crack = null; }
      X.line('גלגל הדריכה מרים אותה החוצה ומוריד אבן חדשה');
      const y0 = s.o.m.position.y;
      for (let k = 1; k <= 18; k++) { await sleep(45); s.o.m.position.y = y0 + ease(k / 18) * 6; }
      s.off = (Math.random() > 0.5 ? 1 : -1) * (0.3 + 0.25 * Math.random()); s.hard = 0; s.taps = 0; s.par = 1 + Math.ceil(Math.abs(err(s)) / 0.32); s.q = 0.6;
      s.o.q.off = s.off; placeStone(X, F, s.o.m, s.o.q); const y1 = s.o.m.position.y;
      for (let k = 1; k <= 18; k++) { await sleep(45); s.o.m.position.y = y1 + (1 - ease(k / 18)) * 6; }
      X.play('settle'); X.dust(c.x, y1 - H / 2, c.z, 8, 1.4); indSync(s);
      X.line('מיישרים את החדשה מההתחלה'); A.busy = false;
    }
    function strike(s, hold) {
      // the mallet's force is the blow's length (press): short moves a little, long moves more; L3: the bed wet, more for every blow
      const push = (0.03 + clamp(hold, 0, 0.9) * 0.8) * (wet ? 1.35 : 1), hard = hold >= 0.42;
      const e0 = err(s), dir = e0 > 0 ? -1 : 1;
      s.taps++;
      const was = s.off; s.off += dir * push;
      try { X.hero.act('tamp', { x: s.o.m.position.x, y: s.o.m.position.y + H / 2, z: s.o.m.position.z }, { snap: true }); } catch (e) { /* */ }
      X.play(hard ? 'strike' : 'chip'); X.dust(s.o.m.position.x + F.nx * 0.8, s.o.m.position.y, s.o.m.position.z + F.nz * 0.8, hard ? 7 : 3, 0.8);
      s.o.q.off = s.off; placeStone(X, F, s.o.m, s.o.q); indSync(s);
      const at = { x: s.o.m.position.x, y: s.o.m.position.y + H, z: s.o.m.position.z };
      if (hard) {
        s.hard++;
        if (s.hard === 2) { X.play('crack'); X.word(at, 'סדק דק! עוד מכה חזקה והפינה תישבר'); const cr = new T3.Mesh(PR.geo.box, PR.M.seam); const p = F.at(s.o.q.a + s.o.q.L * 0.3, 3.02 + s.off, H * 0.5); cr.scale.set(0.05, H * 0.75, 0.05); cr.position.set(p.x, p.y, p.z); cr.rotation.set(0, F.yaw, 0.4); PR.root.add(cr); s.crack = cr; s.cracked = true; }
        if (s.hard >= 3) { breakStone(s); return; }
      }
      const e = err(s);
      if (Math.sign(e) !== Math.sign(e0) && Math.abs(e) > TOL.good) X.word(at, 'עבר את הקו · מחזירים מהצד השני');
      if (Math.abs(e) <= TOL.good) {
        s.okd = true; s.ind.visible = false;
        const g = Math.abs(e) <= TOL.gold && s.taps <= s.par ? 'gold' : Math.abs(e) <= TOL.gold || s.taps <= s.par + 1 ? 'good' : 'ok';
        s.q *= g === 'gold' ? 1 : g === 'good' ? 0.82 : 0.6; if (s.cracked) s.q *= 0.85;
        X.hit(at, g, { text: '', craft: 'בנאים' }); X.play('tier');
        if (S.every((q) => q.okd)) finish();
        else X.line('האבן הבאה');
      }
      void was;
    }
    async function finish() {
      A.done = true; X.hand(null); X.line('');
      // the line of light along the face: every stone true
      const a0 = 0, a1 = F.G, bar = new T3.Mesh(PR.geo.box, goldLine); bar.scale.set(0.25, H * 1.05, 0.25); PR.root.add(bar);
      for (let k = 0; k <= 24; k++) { const p = F.at(lerp(a0, a1, k / 24), 3.15 + target, H / 2); bar.position.set(p.x, p.y, p.z); await sleep(35); }
      PR.remove(bar);
      if (A.breaks === 0 && S.every((s) => !s.cracked)) X.bonus(100, 'plumb', lv >= 2 ? 'בנסיגה של שתי אצבעות' : 'באנך');
      // what stays in the wall: the stones as he left them
      const lay = st.lay[m.s]; if (lay) { lay.stones.forEach((q, i) => { q.off = L.stones[i] ? (L.stones[i].off || 0) : 0; }); for (const s of S) { const i = L.meshes.indexOf(s.o.m); if (i >= 0) lay.stones[i].off = s.off; } }
      X.save();
      const q = S.length ? S.reduce((a, s) => a + s.q, 0) / S.length : 1;
      await sleep(600);
      X.end({ q, stars: starsOf(q), at: F.at(F.G / 2, 3, H + 1) });
    }
    return {
      close: true,
      begin() {
        shot(); const sp = standTop(F, -1.4, 0.4); try { X.hero.setPos(sp.x, sp.z, Math.atan2(sp.face[0] - sp.x, sp.face[1] - sp.z)); } catch (e) { /* */ }
        if (!S.length) { setTimeout(() => X.end({ q: 1, stars: 3 }), 300); return; }
        X.line(lv >= 2 ? 'לחצו על אבן: לחיצה קצרה מזיזה מעט · היעד: שתי אצבעות פנימה מהקו' : 'לחצו על אבן בולטת או שקועה: לחיצה קצרה מזיזה מעט, ארוכה יותר');
        const s = S[0]; X.hand({ x: s.o.m.position.x, y: s.o.m.position.y + H * 0.2, z: s.o.m.position.z }, 0, 10);
      },
      update(dt) {
        A.t += dt;
        if (A.press) { const k = clamp((A.t - A.press.t) / 0.9, 0, 1); const s = A.press.s; X.meter({ x: s.o.m.position.x, y: s.o.m.position.y + H * 1.2, z: s.o.m.position.z }, k); }
        // the bobs sway a little (the wind on the wall)
        for (const s of S) if (s.bob) s.bob.position.x += Math.sin(A.t * 2.1 + s.o.q.a) * 0.0006;
      },
      down(p) { if (A.done || A.busy) return; const s = stoneAt(p); if (s) A.press = { s, t: A.t }; },
      move() {},
      up() { const pr = A.press; A.press = null; X.meter(null); if (!pr || A.done || A.busy) return; strike(pr.s, A.t - pr.t); },
      end() {
        for (const s of S) { for (const o of [s.rod, s.str, s.bob, s.ind, s.tick, s.crack]) if (o) PR.remove(o); }
        for (const w of crew) SH2.crew.remove(w);
      },
      at() { return F.at(F.G / 2, 3, H + 1); },
      dbg() {
        const sc = (o) => { const r2 = X.scr(o.x, o.y, o.z); return [Math.round(r2.x), Math.round(r2.y)]; };
        return { s: m.s, lv, done: A.done, busy: A.busy, wet, breaks: A.breaks, stones: S.map((s) => ({ err: +err(s).toFixed(3), okd: s.okd, hard: s.hard, taps: s.taps, scr: sc({ x: s.o.m.position.x, y: s.o.m.position.y, z: s.o.m.position.z }) })) };
      },
    };
  },
};

export const ACTS = {
  stakes: STAKES, bond: BOND, plumb: PLUMB, lever: LEVER, gates: GATES, closing: CLOSING,
  __init: initWorld,
  __sh: () => SH2,
  __frame(dt, X) { frameWorld(dt, X); },
};
void H;
