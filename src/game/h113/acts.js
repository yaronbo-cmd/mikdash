/* ── build 113 ── h113/acts.js — the acts of stage 04 "שערי העזרה", each played at its gate in the old world (spec "המשחקונים,
 * תחנה אחרי תחנה"). The same registry as stages 01–03 (h109/acts.js, h112/acts.js):
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), close? } — it calls X.end({ stars, q, at }) once.
 * This file: the shared touch (two fingers: the director's first, this file's listener for the rest), and station 1, the pivot sockets
 * (the pin is the gauge, the bow drill's stroke profile, the depth that cannot be undone, tested by dropping the pin). acts2.js: 2 the
 * lintel on two fingers, 3 the leaf's widths puzzle. acts3.js: 4 hanging the leaf, 5 the bar, the pins and the key.
 */
import { H113, GATES, LV, SOCKETS, qOf, starsOf } from './model.js';
import { SH4, mats, frameOf, pivotX, gateBuild, label, initWorld, frameWorld, keep, gateKeep, box } from './world.js';
import { LINTEL, LEAF } from './acts2.js';
import { HANG, LOCK } from './acts3.js';
import { clamp, lerp, ease } from '../h109/kit.js';
import { gripR, bigR, nearPts, nearSeg, nearObjs } from '../h109/grips.js';   // (build 125)

const F = H113.FINGER;
export const MOUSE = (() => { try { return !!(globalThis.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches); } catch (e) { return false; } })();
export const sc = (X, o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
export const heroAt = (X, x, z, fx, fz) => { try { X.hero.setPos(x, z, Math.atan2(fx - x, fz - z)); } catch (e) { /* */ } };
/** a screen point near a world point (a touch target ≥ 96 px wide: r 48 at least) */
export const nearPt = (X, at, p, r = 56) => { const q = X.scr(at.x, at.y, at.z); return q.on && Math.hypot(q.x - p.x, q.y - p.y) < r; };
/** the finger on the horizontal plane y = h */
export function onY(X, p, h) { const r = X.rayAt(p.x, p.y).ray, d = r.direction, o = r.origin; if (Math.abs(d.y) < 1e-4) return null; const t = (h - o.y) / d.y; if (t < 0) return null; return { x: o.x + d.x * t, y: h, z: o.z + d.z * t }; }
/** the finger on the vertical plane z = zc */
export function onZ(X, p, zc) { const r = X.rayAt(p.x, p.y).ray, d = r.direction, o = r.origin; if (Math.abs(d.z) < 1e-4) return null; const t = (zc - o.z) / d.z; if (t < 0) return null; return { x: o.x + d.x * t, y: o.y + d.y * t, z: zc }; }

/**
 * the fingers on the world: the director hands the act its first finger (down/move/up with ptr); every other finger comes here from
 * the window (the director lets them pass). h: { down(f), move(f), up(f) }; f: { id, x, y, x0, y0, t0, type }
 */
export function fingers(X, h) {
  const L = new Map(); let primary = null;
  const hud = (e) => !!(e.target && e.target.closest && e.target.closest('.gm-top,.gm-tabs,.gm-menu,.gm-modal,button,.h109-ui'));
  const now = () => performance.now() / 1000;
  const add = (id, x, y, type) => { const f = { id, x, y, x0: x, y0: y, t0: now(), type, moved: 0 }; L.set(id, f); if (h.down) h.down(f); return f; };
  function onWin(e) {
    if (e.pointerId === primary) return;
    if (e.type === 'pointerdown') {
      if (hud(e)) return; const c = document.getElementById('c') || document.querySelector('canvas'); if (e.target !== c) return;
      try { e.preventDefault(); } catch (er) { /* */ }
      add(e.pointerId, e.clientX, e.clientY, e.pointerType); return;
    }
    const f = L.get(e.pointerId); if (!f) return;
    if (e.type === 'pointermove') { f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.x0, e.clientY - f.y0)); f.x = e.clientX; f.y = e.clientY; if (h.move) h.move(f); return; }
    L.delete(e.pointerId); f.x = e.clientX; f.y = e.clientY; if (h.up) h.up(f);
  }
  const T = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'];
  return {
    L,
    // (two fingers on the canvas must not become the browser's pinch: it cancels the first finger — the batten let go, the lintel's end dropped)
    attach() { for (const t of T) window.addEventListener(t, onWin, true); try { const c = document.getElementById('c') || document.querySelector('canvas'); if (c) { this.ta = c.style.touchAction; c.style.touchAction = 'none'; } } catch (e) { /* */ } },
    detach() { for (const t of T) window.removeEventListener(t, onWin, true); L.clear(); primary = null; try { const c = document.getElementById('c') || document.querySelector('canvas'); if (c && this.ta !== undefined) c.style.touchAction = this.ta; } catch (e) { /* */ } },
    down(p) { primary = p.id; add(p.id, p.x, p.y, MOUSE ? 'mouse' : 'touch'); },
    move(p) { const f = L.get(p.id); if (!f) return; f.moved = Math.max(f.moved, Math.hypot(p.x - f.x0, p.y - f.y0)); f.x = p.x; f.y = p.y; if (h.move) h.move(f); },
    up(p) { const f = L.get(p.id); if (primary === p.id) primary = null; if (!f) return; L.delete(p.id); f.x = p.x; f.y = p.y; if (h.up) h.up(f); },
    get n() { return L.size; },
  };
}

/* ───────── the tools of station 1 ───────── */
/** the bronze pin: a rod with a broad head one tefach wide (spec 1: "ראש הפין רוחב טפח בדיוק, והוא גם המד") */
function pinMesh(X, thin) {
  const T = X.THREE, M = mats(X), g = new T.Group(), R = (thin ? 0.5 : 1) * H113.TEFACH / 2;
  const rod = new T.Mesh(new T.CylinderGeometry(R * 0.42, R * 0.42, 0.55, 10), M.bronze); rod.position.y = 0.275; rod.castShadow = true; g.add(rod);
  const head = new T.Mesh(new T.CylinderGeometry(R, R, 0.06, 18), M.bronze); head.position.y = 0.58; head.castShadow = true; g.add(head);
  X.props.root.add(g); g.userData = { R }; return g;
}
/** the bow drill: the rod (a hard stone head at its foot, the red mark at level 1), the stone cap the crew holds, the bow and its string */
function drillMesh(X, o = {}) {
  const T = X.THREE, M = mats(X), g = new T.Group(), r = o.thin ? 0.022 : 0.04;
  const rod = new T.Group(); g.add(rod);
  const shaft = new T.Mesh(new T.CylinderGeometry(r, r, 1.5, 8), M.cedarL); shaft.position.y = 0.75; shaft.castShadow = true; rod.add(shaft);
  const tipM = new T.Mesh(new T.ConeGeometry(r * 1.6, 0.12, 8), M.flint); tipM.rotation.x = Math.PI; tipM.position.y = 0.06; rod.add(tipM);
  let red = null; if (o.red) { red = new T.Mesh(new T.CylinderGeometry(r * 1.25, r * 1.25, 0.05, 10), M.redc); rod.add(red); }
  const cap = new T.Mesh(new T.SphereGeometry(0.11, 10, 8), M.ash4); cap.scale.y = 0.6; cap.position.y = 1.55; g.add(cap);
  const bow = new T.Group(); bow.position.y = 0.95; g.add(bow);
  const arc = new T.Mesh(new T.TorusGeometry(0.85, 0.025, 5, 20, Math.PI * 0.55), M.cedarD); arc.rotation.z = Math.PI * 0.225; arc.position.y = -0.62; bow.add(arc);
  const str = new T.Mesh(new T.BoxGeometry(1.36, 0.012, 0.012), M.rope || X.props.M.rope); bow.add(str);
  X.props.root.add(g); g.userData = { rod, red, cap, bow, r };
  return g;
}
const VS = 4;   // (the depth drawn ×4 on the rod and the pin's head: three fingers would be a hair at the camera's distance; המחשה)

/* ───────── 1. the pivot sockets ───────── */
export const SOCKET = {
  icon: '🪛', title: 'גומות הציר',
  walkLine: (m) => `${GATES[m.lv].name}: גומות הציר באסקופה`,
  stand(m) { const G = GATES[m.lv], Fr = frameOf(G), x = pivotX(G, -1); return { x: x + 1.4, z: Fr.out(1.5), face: [x, Fr.zp] }; },
  prepare(m, X) { for (const D of SH4.dk) D.hide(); },
  make(m, X) {
    const lv = X.level(), L = LV[lv], G = GATES[m.lv], Fr = frameOf(G), st = X.M.st, PR = X.props, T = X.THREE;
    SH4.busy = 1;
    const defs = SOCKETS[m.lv];
    st.sock[m.lv] = { list: [] };
    const out = st.sock[m.lv].list;
    let world = gateBuild(X, m.lv, { socks: true, form: true });
    const A = { i: -1, d: null, phase: 'form', rec: null, pts: [], depth: 0, tests: 0, seat: 0, strokes: [], dirS: 0, turnX: 0, lastX: 0, smokeT: 0, longs: 0, busy: true,
      pin: null, drill: null, crew: [], mark: null, cross: null, flint: null, pish: null, tpl: null, lab: label(X), band: label(X), grab: null, t: 0, lead: 0, cracks: 0, walks: 0 };
    const target = () => (A.d && A.d.thin ? 2 : 3);
    const tolOf = () => (A.d && A.d.thin ? L.pishTol || 0.25 : L.depthTol);
    const W = () => Math.max(320, innerWidth);
    // the surface the socket is drilled in: the sill, the lintel lying bottom-up on its sledge (L2), the wicket's little sill (L3)
    const bed = { x: G.c, z: Fr.out(3.6), y: 6.7 + H113.LINTEL_H };
    const pishAt = { x: G.c - 2.4, z: Fr.out(2.2), y: 6.32 };
    function surf() { const d = A.d; return d.where === 'lintel' ? bed.y : d.where === 'pish' ? pishAt.y + 0.2 : Fr.sill; }
    function crewAt(x, z, fx, fz, o = {}) { const w = SH4.crew.add(x, z, { role: o.role || 'kneel', item: o.item, fx, fz, crew: o.crew || 2 }); if (w) A.crew.push(w); return w; }
    function clearCrew() { for (const w of A.crew) SH4.crew.remove(w); A.crew = []; }
    // (from the Chel, high over the kohen's shoulder: he works beside the socket, never between the camera and it — rule 2)
    // (from the opening's middle, outside and above, toward the jamb: the jamb's face, the pin, the sill, the drill in one frame)
    function shotAt(x, y, z, side) { X.shot([x - side * 2.5, y + 2.5, z - Fr.s * 2.7], [x + side * 0.1, y + 0.15, z], 0.9); }

    // the lintel lying on its sledge for level 2 (bottom up), the wicket's sill for level 3
    if (m.lv === 3) { A.pish = box(X, mats(X).ash4, pishAt.x - 0.9, 6, pishAt.z - 0.35, pishAt.x + 0.9, pishAt.y + 0.2, pishAt.z + 0.35); }

    async function removeForm() {
      // (the stage-02 formwork comes out: the crew's first step at every gate, spec "משאירים")
      if (st.form[m.lv]) { A.phase = 'place0'; return; }
      X.line('התבנית יורדת · המזוזות חשופות');
      X.shot([G.c + 3, 13, Fr.out(17)], [G.c, 13, Fr.zf], 1.0);
      const w1 = crewAt(G.c - 3.5, Fr.out(1.6), G.c - 4.6, Fr.zf, { role: 'lever', crew: 1 }), w2 = crewAt(G.c + 3.5, Fr.out(1.6), G.c + 4.6, Fr.zf, { role: 'lever', crew: 1 });
      const F0 = gateBuild(X, m.lv, { socks: true });   // (with the formwork)
      world = F0;
      await X.wait(1.2);
      X.dust(G.c, 8, Fr.zf, 18, 6); X.play('thud'); X.shake(0.12, 0.2);
      st.form[m.lv] = 1; X.save();
      world = gateBuild(X, m.lv, { socks: true });
      await X.wait(0.9);
      SH4.crew.remove(w1); SH4.crew.remove(w2); A.crew = A.crew.filter((w) => w !== w1 && w !== w2);
      A.phase = 'place0';
    }
    function socketDisc(x, z, y, r) { const d = new T.Mesh(new T.CircleGeometry(r, 16), mats(X).socket); d.rotation.x = -Math.PI / 2; d.position.set(x, y + 0.01, z); PR.root.add(d); d.visible = false; return d; }
    function openSocket() {
      A.i++; clearCrew();
      for (const k of ['pin', 'drill', 'mark', 'cross', 'flint', 'tpl']) if (A[k]) { PR.remove(A[k]); A[k] = null; }
      A.lab.set(''); A.band.set('');
      if (A.i >= defs.length) { finish(); return; }
      const d = defs[A.i]; A.d = d; A.depth = 0; A.tests = 0; A.seat = 0; A.strokes = []; A.smokeT = 0; A.longs = 0; A.grab = null;
      A.rec = { id: d.id, ex: 0, dd: 0, shift: 0, walked: 0, deep: 0, pts: 40 };
      const side = d.side, y = surf();
      if (d.where === 'sill') {
        const tx = pivotX(G, side);
        A.sx = tx; A.sz = Fr.zp;
        if (d.mirror) { openMirror(); return; }
        // the pin stands on the sill a little in from the jamb; the faint chalk cross (level 1); the flint knot (level 3)
        A.pin = pinMesh(X); A.pin.position.set(tx - side * 0.75, y, Fr.zp);
        if (lv === 1) { const c = new T.Group(); for (const a of [0.785, -0.785]) { const b = new T.Mesh(new T.PlaneGeometry(0.3, 0.025), mats(X).chalk); b.rotation.set(-Math.PI / 2, 0, a); c.add(b); } c.position.set(tx, y + 0.012, Fr.zp); PR.root.add(c); A.cross = c; c.children.forEach((b) => { b.material = b.material.clone(); b.material.opacity = 0.45; }); }
        if (d.flint) { const f = new T.Mesh(new T.IcosahedronGeometry(0.075, 0), mats(X).flint); f.scale.y = 0.45; f.position.set(tx, y + 0.012, Fr.zp); PR.root.add(f); A.flint = f; }
        A.phase = 'place';
        shotAt(tx, y, Fr.zp, side);
        // (he stands on the sill beside the socket, at its depth; his helper kneels further in: neither between the camera and it)
        heroAt(X, tx - side * 1.7, Fr.zp + Fr.s * 2.3, tx, Fr.zp);
        crewAt(tx - side * 3.6, Fr.in(2.8), tx, Fr.zp, { role: 'kneel', item: null });
        X.line(A.i === 0 ? 'גררו את הפין עד המזוזה' : 'עכשיו הצד השני, כמראה');
        X.hand({ x: A.pin.position.x, y: y + 0.6, z: Fr.zp }, side * 40, 0);
        A.busy = false;
      } else if (d.where === 'lintel') {
        openTemplate();
      } else {
        // the wicket's two sockets (level 3): marked on its little sill; the thin drill
        const k = A.i - defs.findIndex((x) => x.where === 'pish'), x = pishAt.x + (k ? 0.55 : -0.55);
        A.sx = x; A.sz = pishAt.z;
        const c = new T.Mesh(new T.RingGeometry(0.03, 0.05, 14), mats(X).coal); c.rotation.x = -Math.PI / 2; c.position.set(x, y + 0.012, pishAt.z); PR.root.add(c); A.cross = c;
        A.pin = pinMesh(X, true); A.pin.position.set(x + 0.32, y, pishAt.z + 0.18);
        shotAt(x, y, pishAt.z, -1); heroAt(X, x + 3.0, pishAt.z + Fr.s * 1.2, x, pishAt.z);
        crewAt(x - 1.3, pishAt.z - Fr.s * 0.6, x, pishAt.z, { role: 'kneel' });
        startDrill(true);
        X.line(k ? 'הגומה השנייה של הפשפש' : 'הפשפש: מקדח דק · לא יותר משלושה מהלכים בשנייה');
      }
    }
    /* the template plank (level 2): the lower socket's place carried to the lintel lying bottom up (spec 1, level 2) */
    function openTemplate() {
      const side = A.d.side, lower = out.find((r) => r.id === 'L');
      A.tpl = new T.Group(); const pl = box(X, mats(X).cedarL, -0.9, 0, -0.18, 0.9, 0.06, 0.18, A.tpl); void pl;
      const holes = [-0.5, 0.62].map((hx) => { const h = new T.Mesh(new T.CircleGeometry(0.06, 12), mats(X).socket); h.rotation.x = -Math.PI / 2; h.position.set(hx, 0.065, 0); A.tpl.add(h); return h; });
      A.tplHoles = holes; PR.root.add(A.tpl);
      const lx = pivotX(G, side, lower ? lower.ex : 0);
      // (on the sill, its first hole over the drilled socket, its end against the jamb)
      A.tpl.position.set(lx + 0.5, Fr.sill + 0.005, Fr.zp); A.tplFlip = 0;
      A.phase = 'tplSill'; A.busy = false;
      shotAt(lx, Fr.sill, Fr.zp, side);
      X.line('אמת הנגרים: הקישו על החור לסמן בפחם');
      X.hand({ x: lx, y: Fr.sill + 0.1, z: Fr.zp }, 0, 12);
    }
    async function tplToLintel() {
      A.busy = true; X.play('rope');
      const from = A.tpl.position.clone(), lx = bed.x + (pivotX(G, A.d.side) - G.c), to = new T.Vector3(lx + 0.5, bed.y + 0.005, bed.z);
      // (the lintel lies bottom up: the plank put down as it was gives its socket mirrored; a tap on the plank turns it over)
      for (let i = 1; i <= 20; i++) { await X.wait(0.035); const u = ease(i / 20); A.tpl.position.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u) + Math.sin(u * Math.PI) * 1.2, lerp(from.z, to.z, u)); }
      A.phase = 'tplLintel'; A.busy = false;
      shotAt(lx + 0.4, bed.y, bed.z, A.d.side); heroAt(X, lx - A.d.side * 3.0, bed.z + Fr.s * 1.7, lx, bed.z);
      X.line('המשקוף שוכב הפוך · הקישו על הקרש להפוך, על החור לסמן');
      X.hand({ x: to.x, y: to.y + 0.1, z: to.z }, 0, 12);
    }
    async function tplFlip() {
      if (A.busy) return; A.busy = true; X.play('rope');
      const r0 = A.tpl.rotation.z;
      for (let i = 1; i <= 14; i++) { await X.wait(0.03); A.tpl.rotation.z = r0 + Math.PI * ease(i / 14); A.tpl.position.y = bed.y + 0.005 + Math.sin((i / 14) * Math.PI) * 0.5; }
      A.tpl.rotation.z = (A.tplFlip ? 0 : Math.PI); A.tpl.position.y = bed.y + 0.005 + (A.tplFlip ? 0 : 0.065);
      A.tplFlip = A.tplFlip ? 0 : 1; A.busy = false;
    }
    async function tplMark() {
      A.busy = true; X.play('tap');
      const lower = out.find((r) => r.id === 'L'), lx = bed.x + (pivotX(G, A.d.side) - G.c) - A.d.side * (lower ? lower.ex : 0);
      if (!A.tplFlip) {
        // marked through the plank as it was: the socket comes out mirrored (spec 1, "בלי נזק, סותמים בעופרת וקודחים שוב, 10")
        const mx = lx + 1.12, c = new T.Mesh(new T.CircleGeometry(0.06, 12), mats(X).coal); c.rotation.x = -Math.PI / 2; c.position.set(mx, bed.y + 0.012, bed.z); PR.root.add(c);
        X.word({ x: mx, y: bed.y + 0.6, z: bed.z }, 'הסימן הפוך! הקרש לא הופך');
        A.rec.pts = Math.min(A.rec.pts, 10); A.rec.flip = 1;
        const w = crewAt(mx + 0.6, bed.z + 0.9, mx, bed.z, { role: 'kneel', crew: 1 });
        await X.wait(1.6); PR.remove(c); SH4.crew.remove(w);
        X.line('הנגר הופך את הקרש ומסמן שוב');
        await tplFlip(); A.busy = true;
      }
      const c2 = new T.Mesh(new T.RingGeometry(0.03, 0.06, 14), mats(X).coal); c2.rotation.x = -Math.PI / 2; c2.position.set(lx, bed.y + 0.012, bed.z); PR.root.add(c2); A.cross = c2;
      A.sx = lx; A.sz = bed.z; A.rec.ex = lower ? lower.ex : 0;
      await X.wait(0.5); PR.remove(A.tpl); A.tpl = null;
      A.pin = pinMesh(X); A.pin.position.set(lx + 0.45, bed.y, bed.z + 0.4);
      crewAt(lx - 0.5, bed.z + 1.1, lx, bed.z, { role: 'kneel' });
      heroAt(X, lx - A.d.side * 3.0, bed.z + Fr.s * 1.7, lx, bed.z);
      shotAt(lx, bed.y, bed.z, A.d.side);
      startDrill(false);
      X.line('קדחו את הגומה העליונה · קצרים ואז ארוכים');
    }
    /* the mirror socket (level 3): the same shift on the other side; the crews drill it */
    function openMirror() {
      const Lr = out.find((r) => r.id === 'L'), shiftL = Lr ? Lr.shift || 0 : 0, side = A.d.side, tx = pivotX(G, side);
      A.phase = 'mirror'; A.mshift = 0; A.busy = false;
      A.cross = new T.Mesh(new T.RingGeometry(0.035, 0.07, 14), mats(X).coal); A.cross.rotation.x = -Math.PI / 2; A.cross.position.set(tx, Fr.sill + 0.012, Fr.zp); PR.root.add(A.cross);
      A.sx = tx; A.sz = Fr.zp;
      shotAt(tx, Fr.sill, Fr.zp, side); heroAt(X, tx - side * 1.7, Fr.zp + Fr.s * 2.3, tx, Fr.zp);
      const fz = (k) => (k / F).toFixed(1).replace(/\.0$/, '');
      A.lab.set(`שמאל ${fz(shiftL)} · ימין ${fz(0)} אצבעות`, { x: tx, y: Fr.sill + 0.5, z: Fr.zp });
      X.line('אותה הזזה פנימה גם כאן · גררו את הסימן ושחררו');
      X.hand({ x: tx, y: Fr.sill + 0.05, z: Fr.zp }, 0, -28);
      A.mirrorOf = shiftL;
    }
    async function mirrorSet() {
      A.busy = true; const d = Math.abs(A.mshift - A.mirrorOf) / F;
      A.rec.shift = A.mshift; A.rec.pts = d <= 0.5 ? 40 : d <= 1.25 ? 20 : 10;
      X.hit({ x: A.sx, y: Fr.sill + 0.6, z: A.sz }, d <= 0.5 ? 'gold' : d <= 1.25 ? 'good' : 'ok', { text: d <= 0.5 ? 'כמראה!' : `הפרש ${d.toFixed(1)} אצבעות`, craft: 'נגרים' });
      const w = crewAt(A.sx + 0.4, Fr.in(0.9), A.sx, A.sz, { role: 'kneel', crew: 1 });
      X.line('הצוות קודח את הגומה שסימנת'); await X.wait(1.6);
      X.dust(A.sx, Fr.sill + 0.1, A.sz, 8, 0.6);
      A.disc = socketDisc(A.sx, A.sz, Fr.sill, 0.09); A.disc.visible = true;
      SH4.crew.remove(w);
      out.push(A.rec); A.pts.push(A.rec.pts); X.save();
      await X.wait(0.4); openSocket();
    }
    /* the place: the pin against the jamb; its head's inner edge shows a tefach in; a tap there sets the drill */
    function placeDrill(at) {
      const d = A.d, side = d.side, tx = pivotX(G, side);
      if (Math.abs(at.x - tx) > 0.9 || Math.abs(at.z - Fr.zp) > 0.6) { X.word({ x: tx, y: Fr.sill + 0.5, z: Fr.zp }, 'כאן, ליד המזוזה'); return; }
      const ex = (at.x - tx) * -side;   // (+: toward the middle)
      A.rec.ex = +ex.toFixed(4); A.sx = at.x;
      if (lv >= 3 && d.flint) { A.rec.shift = +clamp((at.z - Fr.zp) * Fr.s, -0.2, 0.2).toFixed(4); A.sz = at.z; }
      else A.sz = Fr.zp;
      if (Math.abs(ex) / F > 2) A.rec.pts = Math.min(A.rec.pts, 20);
      startDrill(false);
      X.line(lv === 1 ? 'שלושה קצרים, ואז ארוכים · הרימו לעצור' : 'קצרים לאחיזה, אחר כך ארוכים');
    }
    function startDrill(thin) {
      if (A.drill) PR.remove(A.drill);
      A.drill = drillMesh(X, { thin, red: lv === 1 && !thin });
      A.disc = socketDisc(A.sx, A.sz, surf(), thin ? 0.04 : 0.09);
      A.phase = 'drill'; A.busy = false; A.seat = thin ? 3 : A.seat;
      drillPose();
      if (A.pin && A.d.where === 'sill') A.pin.position.set(A.sx - A.d.side * 0.5, surf(), A.sz + Fr.s * 0.55);
      X.hand({ x: A.sx, y: surf() + 0.95, z: A.sz }, 70, 0);
      bandShow();
    }
    function drillPose(bowX = 0) {
      const g = A.drill; if (!g) return; const y = surf(), dv = A.depth * F * VS;
      g.position.set(A.sx, y - dv, A.sz);
      g.userData.bow.position.x = bowX;
      if (g.userData.red) g.userData.red.position.y = (target() * F * VS);
      g.userData.cap.position.y = 1.55;
      A.disc.visible = A.depth > 0.05; A.disc.scale.setScalar(A.rec.walked ? 1.4 : 1); if (A.rec.walked) A.disc.scale.set(1.5, 1, 1);
    }
    // the stroke profile's strip on the ground (level 1: short-short-short-long), a chip at the drill's foot
    function bandShow() {
      if (!A.d || A.d.thin || lv > 1) { A.band.set(''); return; }
      const cells = [0, 1, 2].map((k) => (A.seat > k ? '■' : '□')).join(' ') + '  ' + (A.seat >= 3 ? '▬▬' : '▭▭');
      A.band.set(cells, { x: A.sx + Fr.s * 0, y: surf() - 0.05, z: A.sz - Fr.s * 0.75 }, A.seat >= 3);
    }
    /* the strokes: each reversal of the finger closes one; its length (screen) and the rate (the last second) */
    function stroke(len) {
      const now = performance.now() / 1000, w = W(), short = len < 0.16 * w, long = len >= 0.3 * w;
      A.strokes.push(now); A.strokes = A.strokes.filter((t) => now - t < 1.0);
      const rate = A.strokes.length;
      X.play('wheel'); try { X.haptic && X.haptic(6); } catch (e) { /* */ }
      if (A.seat < 3) {
        if (long) {
          // a long stroke first: the head walks on the stone and scratches it; the socket moves off its place (spec 1)
          A.seat = 3; A.rec.walked = 1; A.walks++; A.rec.pts = Math.min(A.rec.pts, 20);
          const side = A.d.side; A.sx += -side * 1.5 * F; A.rec.ex += 1.5 * F;
          X.word({ x: A.sx, y: surf() + 0.7, z: A.sz }, 'הראש הלך על האבן · שריטה'); X.play('scrape');
          X.dust(A.sx, surf() + 0.05, A.sz, 4, 0.4);
        } else { A.seat++; A.depth += 0.06; X.dust(A.sx, surf() + 0.05, A.sz, 2, 0.25); if (A.seat === 3) X.word({ x: A.sx, y: surf() + 0.8, z: A.sz }, 'נאחז! עכשיו ארוכים'); }
        bandShow(); drillPose(); return;
      }
      let gain = short ? 0.05 : long ? 0.34 : 0.14;
      if (rate < L.rateLo) gain *= 0.45;   // (rubbing, not biting: grey dust)
      A.depth += gain; if (long) A.longs++;
      const biting = long && rate >= L.rateLo && rate <= L.rateHi + 0.6;
      X.dust(A.sx, surf() + 0.05, A.sz, biting ? 5 : 2, biting ? 0.45 : 0.2);
      // (level 3, the knot of flint at the good place: the head breaks on it, spec 1)
      if (A.d.flint && A.flint && Math.hypot(A.sx - A.flint.position.x, A.sz - A.flint.position.z) < 0.075 && A.longs >= 2) { flintBreak(); return; }
      if (A.d.thin && rate > (L.thin || 3)) { thinBreak(); return; }
      drillPose();
    }
    async function flintBreak() {
      A.busy = true; A.phase = 'wait'; X.play('crack'); X.sparks(A.sx, surf() + 0.1, A.sz, 10);
      X.word({ x: A.sx, y: surf() + 0.8, z: A.sz }, 'צור! ראש המקדח נשבר');
      A.depth = 0; A.longs = 0; A.seat = 0; A.disc.visible = false; PR.remove(A.drill); A.drill = null;
      await X.wait(2.2);
      X.line('הזיזו פנימה עד חצי טפח, ושם קדחו'); A.phase = 'place'; A.busy = false;
      X.hand({ x: A.flint.position.x, y: surf() + 0.05, z: A.flint.position.z + Fr.s * 0.07 }, 0, -18);
    }
    async function thinBreak() {
      A.busy = true; A.phase = 'wait'; X.play('crack'); X.word({ x: A.sx, y: surf() + 0.7, z: A.sz }, 'המקדח הדק נשבר · מהר מדי');
      A.rec.pts = Math.min(A.rec.pts, 20);
      if (A.drill) A.drill.visible = false; const w = crewAt(A.sx + 0.7, A.sz + 0.6, A.sx, A.sz, { role: 'hammer', item: 'chisel', crew: 1 });
      X.line('הנגר מתקן מקדח חדש'); await X.wait(3.0); SH4.crew.remove(w);
      if (A.drill) A.drill.visible = true; A.phase = 'drill'; A.busy = false; X.line('לאט · עד שלושה בשנייה');
    }
    async function crack() {
      A.busy = true; A.phase = 'wait'; A.cracks++;
      const at = { x: A.sx, y: surf() + 0.5, z: A.sz };
      X.sparks(A.sx, surf() + 0.1, A.sz, 14); X.dust(A.sx, surf() + 0.3, A.sz, 18, 1.2); X.shake(0.18, 0.3);
      if (A.d.where === 'lintel') {
        X.loss(20, at, 'שפת הגומה נסדקה במשקוף', 1);
        A.rec.pts = Math.min(A.rec.pts, 10); A.rec.lead = 1;
        X.line('הצוות סותם בעופרת'); const w = crewAt(A.sx + 0.6, A.sz + 0.8, A.sx, A.sz, { role: 'kneel', crew: 1 }); await X.wait(3.0); SH4.crew.remove(w);
        A.smokeT = 0; A.phase = 'drill'; A.busy = false; X.line('לאט יותר · קצב אחד עד שניים'); return;
      }
      X.loss(20, at, 'קידוח מהיר: השפה נסדקה', 1);
      // the crew lifts the sill on a crowbar and brings another (the sockets drilled so far are drilled again by them)
      X.line('הצוות מרים את האסקופה בלום ומביא אחרת');
      const w = crewAt(G.c, Fr.in(1.4), G.c, Fr.zp, { role: 'lever', crew: 1 });
      if (A.drill) A.drill.visible = false; if (A.pin) A.pin.visible = false;
      world.sill && (world.sill.visible = false);
      await X.wait(1.4); world.sill && (world.sill.visible = true); X.play('thud'); X.dust(G.c, 6.2, Fr.zp, 20, 4);
      await X.wait(0.8); SH4.crew.remove(w);
      A.depth = 0; A.seat = 0; A.smokeT = 0; A.longs = 0; A.rec.walked = 0; A.rec.ex = 0; A.rec.pts = Math.min(A.rec.pts, 20);
      PR.remove(A.drill); A.drill = null; A.disc.visible = false;
      if (A.pin) { A.pin.visible = true; A.pin.position.set(pivotX(G, A.d.side) - A.d.side * 0.75, Fr.sill, Fr.zp); }
      A.phase = 'place'; A.busy = false; bandShow();
      X.line('שוב: הפין אל המזוזה, והקשה במקום');
    }
    /* the test: the crew lifts the drill, blows the dust, the pin goes down; its head stands up by what is missing */
    async function test() {
      A.busy = true; A.phase = 'test'; A.tests++; X.hand(null);
      const y = surf(), at = { x: A.sx, y: y + 0.55, z: A.sz };
      if (A.drill) { for (let i = 1; i <= 8; i++) { await X.wait(0.03); A.drill.position.y += 0.08; } A.drill.visible = false; }
      X.dust(A.sx, y + 0.1, A.sz, 6, 0.3); X.play('rope');
      await X.wait(0.4);
      const miss = target() - A.depth, head = Math.max(-0.03, miss * F * VS);
      const p0 = A.pin.position.clone();
      for (let i = 1; i <= 12; i++) { await X.wait(0.035); const u = ease(i / 12); A.pin.position.set(lerp(p0.x, A.sx, u), lerp(p0.y, y + head + 0.25, u), lerp(p0.z, A.sz, u)); }
      for (let i = 1; i <= 5; i++) { await X.wait(0.03); A.pin.position.y = lerp(y + head + 0.25, y + head - 0.55 + 0.55, i / 5); }
      A.pin.position.y = y + head - 0.0;   // (the head's foot at the stone + what is missing)
      const tol = tolOf();
      if (Math.abs(miss) <= tol) {
        X.play('settle');
        const first = A.tests <= L.tests40;
        if (!first) A.rec.pts = Math.min(A.rec.pts, 20);
        A.rec.dd = +(-miss).toFixed(2);
        const grade = A.rec.pts >= 40 ? 'gold' : A.rec.pts >= 20 ? 'good' : 'ok';
        X.hit(at, grade, { text: A.rec.pts >= 40 ? 'בדיוק! ראש הפין נוגע באבן' : 'נוגע באבן', craft: 'חוצבים' });
        A.lab.set('');
        await X.wait(1.2); done();
        return;
      }
      if (miss < -tol) {
        // too deep: no way back; the crew pours lead into its foot (spec 1: "10 במקום 40", the leaf sits low at station 4)
        X.play('thud'); A.rec.deep = 1; A.rec.dd = +(-miss).toFixed(2); A.rec.pts = Math.min(A.rec.pts, 10);
        X.word(at, `עמוק מדי ב-${(-miss).toFixed(1)} אצבעות`);
        const w = crewAt(A.sx + 0.5, A.sz + Fr.s * 0.9, A.sx, A.sz, { role: 'kneel', item: 'jar', crew: 1 });
        X.line('הצוות יוצק עופרת לתחתית'); await X.wait(2.2); SH4.crew.remove(w);
        A.lab.set(''); done(); return;
      }
      // short: the head stands above the stone by what is missing (level 1 in fingers; level 2 in halves; level 3 in words)
      const t = lv === 1 ? `חסרות ${(Math.round(miss * 2) / 2).toString()} אצבעות` : lv === 2 ? `חסר בערך ${Math.max(0.5, Math.round(miss * 2) / 2)}` : miss > 1.5 ? 'חסר הרבה' : miss > 0.8 ? 'חסר מעט' : 'כמעט';
      A.lab.set(t, { x: A.sx, y: y + 0.85, z: A.sz }, miss < 1);
      X.play('tap');
      await X.wait(1.1);
      // the pin out again, the drill back in its hole
      A.pin.position.set(A.sx - (A.d.side || -1) * 0.5, y, A.sz + Fr.s * 0.55);
      if (A.drill) { A.drill.visible = true; drillPose(); }
      A.phase = 'drill'; A.busy = false;
      X.line('עוד פרץ קצר, ובודקים שוב');
    }
    async function done() {
      A.busy = true; A.phase = 'wait';
      out.push(A.rec); A.pts.push(A.rec.pts); X.save();
      if (A.drill) { PR.remove(A.drill); A.drill = null; }
      X.dust(A.sx, surf() + 0.05, A.sz, 8, 0.5);
      try { X.hero.act('tamp', { x: A.sx, y: surf(), z: A.sz }, { snap: true }); } catch (e) { /* */ }
      await X.wait(0.8);
      // level 1: the lintel's sockets are the crews' (seen on the lintel lying on the ground)
      if (lv === 1 && A.i === defs.length - 1 && m.lv === 1) {
        const b = { x: G.c, z: Fr.out(3.6) }; X.line('הצוות קודח את גומות המשקוף');
        X.shot([b.x + 3, 11, b.z - 9], [b.x, 8.5, b.z], 1.0);
        const w1 = crewAt(b.x - 5.6, b.z - 1.6, b.x - 5.6, b.z, { role: 'push', item: null, crew: 1 }), w2 = crewAt(b.x + 5.6, b.z - 1.6, b.x + 5.6, b.z, { role: 'push', crew: 1 });
        await X.wait(2.0); SH4.crew.remove(w1); SH4.crew.remove(w2);
      }
      openSocket();
    }
    function finish() {
      if (A.over) return; A.over = true;
      const q = A.pts.length ? A.pts.reduce((a, p) => a + qOf(p), 0) / A.pts.length : 0.5;
      st.sock[m.lv].done = 1; X.save();
      X.end({ q, stars: starsOf(q), at: { x: G.c, y: 7, z: Fr.zp } });
    }
    // the drag: the pin (place), the mark (mirror), the bow (drill); a tap: the drill's place, the pin's test, the template
    const P = { f: null };
    return {
      close: true,
      begin() { keep(X, [gateKeep(G)]); removeForm().then(() => openSocket()); },
      update(dt) {
        A.t += dt;
        if (A.phase === 'drill' && A.drill) {
          const now = performance.now() / 1000; A.strokes = A.strokes.filter((t) => now - t < 1.0);
          const rate = A.strokes.length;
          if (rate > L.smoke && P.f) { A.smokeT += dt; if (Math.random() < 0.3) X.dust(A.sx, surf() + 0.3, A.sz, 2, 0.6); if (A.smokeT > 0.35 && !A.smokeW) { A.smokeW = 1; X.line('עשן! לאט יותר', 1400); } }
          else { A.smokeT = Math.max(0, A.smokeT - dt * 1.5); if (A.smokeT <= 0) A.smokeW = 0; }
          if (A.smokeT >= 1.0 && !A.d.thin) { crack(); return; }
          A.drill.userData.rod.rotation.y += (P.f ? 9 : 0) * dt * (rate + 0.5);
        }
      },
      down(p) {
        if (A.busy) return;
        P.f = { x: p.x, y: p.y, x0: p.x, y0: p.y, t0: performance.now(), moved: 0, lastX: p.x, dir: 0, turnX: p.x, what: null };
        const f = P.f;
        if (A.phase === 'place' && A.pin && nearPt(X, { x: A.pin.position.x, y: surf() + 0.45, z: A.pin.position.z }, p, 60)) { f.what = 'pin'; X.hand(null); return; }
        if (A.phase === 'mirror') { f.what = 'mark'; X.hand(null); return; }
        if (A.phase === 'drill' && A.pin && nearPt(X, { x: A.pin.position.x, y: surf() + 0.45, z: A.pin.position.z }, p, 52)) { f.what = 'test'; return; }
        if (A.phase === 'drill') { f.what = 'bow'; X.hand(null); return; }
        f.what = 'tap';
      },
      // (build 125: on the right half only the work in hand is the act's — the pin and the place round it, the mark, the bow drill, the
      //  template; the rest is the right thumb's look)
      wants(p) {
        if (A.busy) return false; if (!p) return true;
        const pinP = A.pin ? { x: A.pin.position.x, y: surf() + 0.45, z: A.pin.position.z } : null;
        if (A.phase === 'place') return !!pinP && nearPts(X, p, [pinP], bigR());
        if (A.phase === 'mirror') return !!A.cross && nearObjs(X, p, [A.cross], bigR());
        if (A.phase === 'drill') return (!!A.drill && nearObjs(X, p, [A.drill], bigR())) || (!!pinP && nearPts(X, p, [pinP]));
        if (A.phase === 'tplSill' || A.phase === 'tplLintel') return !!A.tpl && nearObjs(X, p, [A.tpl], bigR());
        return false;
      },
      move(p) {
        const f = P.f; if (!f || A.busy) return;
        f.moved = Math.max(f.moved, Math.hypot(p.x - f.x0, p.y - f.y0)); f.x = p.x; f.y = p.y;
        if (f.what === 'pin') {
          const h = onY(X, p, surf() + 0.3); if (!h) return;
          const side = A.d.side, jf = G.c + side * H113.OPEN_W / 2, R = A.pin.userData.R;
          // (it stops against the jamb: the head's rim on the dressed face)
          let x = h.x; if (side < 0) x = Math.max(jf + R, Math.min(jf + 1.6, x)); else x = Math.min(jf - R, Math.max(jf - 1.6, x));
          A.pin.position.x = x;
          const snug = Math.abs(Math.abs(x - jf) - R) < 0.012;
          if (snug && !f.snug) { f.snug = 1; X.play('tap'); A.lab.set('צמוד למזוזה', { x, y: surf() + 0.9, z: A.pin.position.z }, true); }
          if (!snug) { f.snug = 0; A.lab.set(''); }
          return;
        }
        if (f.what === 'mark') {
          const h = onY(X, p, Fr.sill); if (!h) return;
          A.mshift = clamp((h.z - Fr.zp) * Fr.s, 0, 0.2);
          A.cross.position.z = Fr.zp + Fr.s * A.mshift;
          const fz = (k) => (Math.round((k / F) * 2) / 2).toString();
          A.lab.set(`שמאל ${fz(A.mirrorOf)} · ימין ${fz(A.mshift)} אצבעות`, { x: A.sx, y: Fr.sill + 0.5, z: A.sz }, Math.abs(A.mshift - A.mirrorOf) / F <= 0.5);
          return;
        }
        if (f.what === 'bow') {
          const dx = p.x - f.lastX; f.lastX = p.x;
          const d = Math.sign(dx);
          if (Math.abs(p.x - f.turnX) > 6 && d) {
            if (f.dir && d !== f.dir) { stroke(Math.abs(f.peak - f.turnX)); f.turnX = f.peak; }
            f.dir = d;
          }
          f.peak = p.x;
          drillPose(clamp((p.x - f.x0) / W() * 1.6, -0.7, 0.7));
        }
      },
      up(p) {
        const f = P.f; P.f = null; if (!f || A.busy) return;
        if (f.what === 'bow') { if (f.dir && Math.abs(f.peak - f.turnX) > 6) stroke(Math.abs(f.peak - f.turnX)); drillPose(0); return; }
        if (f.what === 'pin') { if (A.phase === 'place') { X.line('הקישו טפח פנימה, בקצה ראש הפין'); const R = A.pin.userData.R; X.hand({ x: A.pin.position.x - A.d.side * R, y: surf() + 0.05, z: A.pin.position.z }, 0, 12); } return; }
        if (f.what === 'mark') { mirrorSet(); return; }
        if (f.moved > 14) return;
        if (f.what === 'test') { test(); return; }
        if (A.phase === 'place') { const h = onY(X, p, surf()); if (h) placeDrill(h); return; }
        if (A.phase === 'tplSill' && A.tpl) { tplToLintel(); return; }
        if (A.phase === 'tplLintel' && A.tpl) {
          const hole = A.tplHoles[0].getWorldPosition(new T.Vector3());
          if (nearPt(X, { x: hole.x, y: hole.y, z: hole.z }, p, 44) || nearPt(X, { x: hole.x + (A.tplFlip ? 1.12 : -1.12), y: hole.y, z: hole.z }, p, 1)) tplMark(); else tplFlip();
          return;
        }
      },
      end() {
        for (const k of ['pin', 'drill', 'mark', 'cross', 'flint', 'tpl', 'pish']) if (A[k]) PR.remove(A[k]);
        A.lab.remove(); A.band.remove(); clearCrew(); keep(X, []); SH4.busy = 0; X.hand(null);
        gateBuild(X, m.lv);
      },
      at() { return { x: A.sx || G.c, y: 7, z: A.sz || Fr.zp }; },
      dbg() {
        const d = A.d || {}, y = A.d ? surf() : Fr.sill;
        const jf = A.d && A.d.side ? G.c + A.d.side * H113.OPEN_W / 2 : 0, R = A.pin ? A.pin.userData.R : 0;
        const hole = A.tplHoles && A.tpl ? A.tplHoles[0].getWorldPosition(new T.Vector3()) : null;
        return { lv, phase: A.phase, i: A.i, id: d.id, where: d.where, busy: A.busy, depth: +A.depth.toFixed(2), target: A.d ? target() : 3, tol: A.d ? tolOf() : 1, seat: A.seat, tests: A.tests, flip: A.tplFlip,
          rec: A.rec, pts: A.pts, cracks: A.cracks, walks: A.walks, rate: A.strokes.length, smoke: +A.smokeT.toFixed(2),
          pin: A.pin ? sc(X, { x: A.pin.position.x, y: y + 0.45, z: A.pin.position.z }) : null,
          snug: A.pin && A.d && A.d.side ? sc(X, { x: jf - A.d.side * R, y: y + 0.3, z: A.pin.position.z }) : null,
          spot: A.d && A.d.side ? sc(X, { x: pivotX(G, A.d.side) + (d.flint ? 0 : 0), y, z: Fr.zp + (d.flint ? Fr.s * 0.08 : 0) }) : null,
          drill: A.drill ? sc(X, { x: A.sx, y: y + 0.9, z: A.sz }) : null, hole: hole ? sc(X, hole) : null, tpl: A.tpl ? sc(X, A.tpl.position) : null,
          mark: A.cross ? sc(X, A.cross.position) : null, mirrorOf: A.mirrorOf, mshift: A.mshift,
          markTo: A.phase === 'mirror' ? sc(X, { x: A.sx, y: Fr.sill, z: Fr.zp + Fr.s * (A.mirrorOf || 0) }) : null, thin: !!(A.d && A.d.thin), where: d.where,
          flint: A.flint ? sc(X, A.flint.position) : null };
      },
    };
  },
};

export const ACTS = {
  socket: SOCKET, lintel: LINTEL, leaf: LEAF, hang: HANG, lock: LOCK,
  __init: initWorld,
  __sh: () => SH4,
  __frame(dt, X) { frameWorld(dt, X); },
};
