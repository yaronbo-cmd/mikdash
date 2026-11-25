/* ── build 133 ── h133/nail.js — work 1 "הציפורן" (spec docs/specs/shlav-10-he.md, עבודה 1). The rules: nail-model.js.
 * At Beit Kerem by the pit of stage 08 (its sheet: BOOK.s08.pit, the work's three stations BOOK.s10.w1 a / b / c round it). The field
 * stones raised whole wait in a row; one big stone in the middle of the screen, the edge being checked in the soft light of a low sun.
 * The kohen kneels by it (his hand is the thumb). Left of the stone the cradle's basket (fit, for the kevesh), right of it the heap of
 * the rejected.
 *   · a drag along the edge at the right speed makes a thin glint run on it; at a flaw it breaks for a moment; too fast it smears, too
 *     slow it dies. The flaw is also a thin notch a sharp eye sees;
 *   · a stop at the flaw is the mark (a dull stone click; a short buzz only with it); an edge with no flaw lights whole once run;
 *   · mud looks like a flaw but the glint runs over it; moss has no glint at all — wiped first with the cloth, three strokes;
 *   · once every edge is checked: a drag up sends it to the basket, down to the heap (before that it only trembles);
 *   · the right thumb on the stone turns it to its next edge; elsewhere it is the camera.
 * A fit stone flips in the air into the basket with a deep stone sound; a flawed one splits at its mark as it lands on the heap.
 *   NAIL_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import { fresh, load, save, cur, edgeOf, glide, stop, rotate, canSort, sort, done, result, NK } from './nail-model.js';
import { mats10 } from './world.js';
import { award, hurt, finish, V3, lens } from './kit10.js';
import { box, pitXYZ, goPit, backFromPit } from '../h131/world.js';
import { createVoices } from '../h129/sound129.js';
import { fingers } from '../h113/acts.js';
import { createGang, createBeat } from '../h109/kit.js';

const S10 = BOOK.s10, S8 = BOOK.s08;
export const NA1 = Object.freeze({ FOV: 30, W: 1.4, H: 0.8, D: 0.9, NEAR: 46, STILL: 0.22, STILLPX: 5, SORT: 50, FLY: 0.8 });

export const NAIL_ACT = {
  icon: '💅',
  title: 'הציפורן',
  walkLine: () => '',
  // (the walk ends on the Mount at the pit's way down, stage 08's; the act jumps to Beit Kerem, as the pit's work did)
  stand() { const s = S8.stand.pit; return { x: s[0], z: s[1], face: [S8.pile ? S8.pile[0] : s[0], S8.pile ? S8.pile[1] : s[1] + 5] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = mats10(X);
    const root = new T.Group(); root.name = 'h133-nail-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, f: null, glint: null, brk: 0, fly: null, spin: null, shake: 0, lit: 0, stillT: 0, stopped: false };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const b0 = Mo.workOf('nail');
    let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (done(S) || S.lv !== lv)) S = null; const resumed = !!S;
    if (!S) S = fresh(lv);
    let n0 = -1; const keep = () => { if (S.n === n0) return; n0 = S.n; Mo.keep('nail', save(S, m.id)); X.save(); };
    // ── the station on the pit's sheet: where he kneels, facing the pit; the stone before him, the basket left, the heap right
    const st = S10.w1[['a', 'b', 'c'][lv - 1]], hole = S8.pit.hole.at;
    let dx = hole[0] - st[0], dz = hole[1] - st[1]; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
    const rt = [-dz, dx];   // (the world's right of his facing)
    const P = (lx, y, lz) => pitXYZ(lx, y, lz);
    const sL = [st[0] + dx * 1.5, st[1] + dz * 1.5], base = P(sL[0], 0, sL[1]);
    const bkL = [sL[0] - rt[0] * 2.1 + dx * 0.4, sL[1] - rt[1] * 2.1 + dz * 0.4], hpL = [sL[0] + rt[0] * 2.1 + dx * 0.4, sL[1] + rt[1] * 2.1 + dz * 0.4];
    const yaw = Math.atan2(-dx, -dz);   // (local +z toward him)
    // the stone
    const stone = new T.Group(); stone.position.set(base[0], base[1] + 0.25, base[2]); stone.rotation.y = yaw; root.add(stone);
    const body = box(X, Mt.y10field, -NA1.W / 2, 0, -NA1.D / 2, NA1.W / 2, NA1.H, NA1.D / 2, stone);
    const marks = new T.Group(); stone.add(marks);
    const glint = box(X, Mt.y10glow, -0.07, -0.012, -0.012, 0.07, 0.012, 0.012, stone); glint.visible = false;
    const litBar = box(X, Mt.y10glow.clone(), -NA1.W / 2, NA1.H - 0.012, NA1.D / 2 - 0.012, NA1.W / 2, NA1.H + 0.012, NA1.D / 2 + 0.012, stone); litBar.visible = false;
    const cradle = box(X, Mt.y10woodD, -0.8, -0.25, -0.6, 0.8, 0, 0.6, stone);
    void cradle;
    // the basket and the heap
    const bk = P(bkL[0], 0, bkL[1]), hp = P(hpL[0], 0, hpL[1]);
    const basket = new T.Mesh(new T.CylinderGeometry(0.75, 0.55, 0.6, 14, 1, true), Mt.y10wood); basket.material = Mt.y10wood.clone(); basket.material.side = T.DoubleSide; basket.position.set(bk[0], bk[1] + 0.3, bk[2]); root.add(basket);
    // (seen from above: its floor and a thick rim, so the basket reads as a basket and not a thin arc)
    { const fl = new T.Mesh(new T.CircleGeometry(0.55, 14), Mt.y10woodD); fl.rotation.x = -Math.PI / 2; fl.position.set(bk[0], bk[1] + 0.02, bk[2]); root.add(fl);
      const rim = new T.Mesh(new T.TorusGeometry(0.75, 0.06, 6, 18), Mt.y10woodD); rim.rotation.x = Math.PI / 2; rim.position.set(bk[0], bk[1] + 0.6, bk[2]); root.add(rim); }
    const inB = new T.Group(); root.add(inB); const inH = new T.Group(); root.add(inH);
    const heapN = () => inH.children.length, bN = () => inB.children.length;
    function pileUp(g, at, n, mat) { const i = n, a = i * 2.3, r = 0.15 + (i % 4) * 0.12; box(X, mat, at[0] + Math.cos(a) * r - 0.22, at[1] + 0.05 + Math.floor(i / 5) * 0.2, at[2] + Math.sin(a) * r - 0.16, at[0] + Math.cos(a) * r + 0.22, at[1] + 0.25 + Math.floor(i / 5) * 0.2, at[2] + Math.sin(a) * r + 0.16, g); }
    for (let i = 0; i < S.basket; i++) pileUp(inB, bk, i, Mt.y10field); for (let i = 0; i < S.heap; i++) pileUp(inH, hp, i, Mt.y10field);
    // the row of stones still waiting
    const row = new T.Group(); root.add(row);
    function drawRow() { while (row.children.length) row.remove(row.children[0]); const left = S.stones.length - S.i - 1; for (let i = 0; i < left; i++) { const q = P(sL[0] - rt[0] * (3.6 + i * 0.95) - dx * 1.2, 0, sL[1] - rt[1] * (3.6 + i * 0.95) - dz * 1.2); box(X, Mt.y10field, q[0] - 0.4, q[1], q[2] - 0.32, q[0] + 0.4, q[1] + 0.55, q[2] + 0.32, row).rotation.y = i * 0.7; } }
    // ── the edge's marks: the flaw's notch, the mud, the moss (each edge in front, local +z, its top)
    const Ex = (u) => -NA1.W / 2 + u * NA1.W;
    function drawMarks() {
      while (marks.children.length) marks.remove(marks.children[0]);
      const E = edgeOf(S); if (!E) return;
      const y = NA1.H, z = NA1.D / 2;
      if (E.bad != null) box(X, Mt.y10crack, Ex(E.bad) - 0.012, y - 0.06, z - 0.03, Ex(E.bad) + 0.012, y + 0.004, z + 0.004, marks).name = 'notch';
      for (const u of E.mud) box(X, Mt.y10mud, Ex(u) - 0.06, y - 0.05, z - 0.06, Ex(u) + 0.06, y + 0.006, z + 0.006, marks).name = 'mud';
      for (const mo of E.moss) if (mo.wipes < NK.WIPES) { const k = 1 - mo.wipes / NK.WIPES; const mm = box(X, Mt.y10moss, Ex(mo.a), y - 0.09, z - 0.09, Ex(mo.b), y + 0.01, z + 0.01, marks); mm.scale.y *= 0.4 + 0.6 * k; mm.name = 'moss'; }
      if (E.marked != null) box(X, Mt.y10charcoal, Ex(E.marked) - 0.03, y + 0.004, z - 0.03, Ex(E.marked) + 0.03, y + 0.02, z + 0.004, marks).name = 'mark';
      litBar.visible = !!E.ck && E.marked == null; litBar.material.opacity = 0.35;
    }
    // ── the kohen kneels at the station; two men raise stones, two bear the cradle
    const Bt = createBeat(X), gang = createGang(X);
    function castMen() {
      gang.clear(); const k = P(st[0], 0, st[1]);
      const w = gang.add(k[0], k[2], { role: 'kneel', variant: 'kohen', fx: base[0], fz: base[2] }); if (w && w.a) w.a.fixedY = k[1];
      // (beside the row, left of the stone, raising the next on ropes: out of the narrow lens's line)
      for (const [o, f] of [[4.6, 1], [5.8, 1]]) { const q = P(sL[0] - rt[0] * o + dx * 0.6, 0, sL[1] - rt[1] * o + dz * 0.6); const h = gang.add(q[0], q[2], { role: 'pull', item: 'rope', crew: 2, fx: P(hole[0], 0, hole[1])[0], fz: P(hole[0], 0, hole[1])[2] }); if (h && h.a) h.a.fixedY = q[1]; void f; }
    }
    // ── the camera: low over his shoulder, the stone a third of the screen
    const cam0 = X.camera, fov0 = cam0.fov;
    // (the camera's floor is 7 over the valley everywhere off the Mount — the director's camFloor: so the eye stands high over his shoulder and the
    //  lens is narrow, the stone a third of the screen as the spec's low shot would give it)
    const eye = () => { const k = P(st[0] - dx * 2.6 + rt[0] * 0.8, 0, st[1] - dz * 2.6 + rt[1] * 0.8); return [k[0], base[1] + 10.5, k[2]]; };
    const aim = () => [base[0], base[1] + 0.55, base[2]];
    const home = (d = 0) => { lens(X, NA1.FOV); X.shot(eye(), aim(), d); };
    // the edge on the screen: its two ends (world), u of a screen point
    const wEdge = (u) => { const v = new T.Vector3(Ex(u), NA1.H, NA1.D / 2); stone.localToWorld(v); return v; };
    const sEdge = (u) => { const w = wEdge(u); const r = X.scr(w.x, w.y, w.z); return { x: r.x, y: r.y }; };
    function uOf(x, y) { const a = sEdge(0), b = sEdge(1), vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = ((x - a.x) * vx + (y - a.y) * vy) / L2; const px = a.x + vx * u, py = a.y + vy * u; return { u: Math.max(0, Math.min(1, u)), d: Math.hypot(x - px, y - py), raw: u }; }
    const onStone = (x, y) => { const a = sEdge(0), b = sEdge(1), c = X.scr(base[0], base[1] + 0.25, base[2]); return x > Math.min(a.x, b.x) - 30 && x < Math.max(a.x, b.x) + 30 && y > a.y - 50 && y < c.y + 40; };
    const kpx = () => (typeof innerHeight === 'number' && innerHeight > 0 ? 420 / innerHeight : 1);
    // ── the thumbs
    const FG = fingers(X, {
      down(f) {
        if (A.finished || A.busy || A.fly || A.spin) return;
        const right = f.x > innerWidth * 0.6;
        if (right) { if (onStone(f.x, f.y)) A.r = { id: f.id, x0: f.x, y0: f.y }; return; }
        const q = uOf(f.x, f.y);
        A.f = { id: f.id, x0: f.x, y0: f.y, x: f.x, y: f.y, t: A.t, u: q.u, edge: q.d < NA1.NEAR && q.raw > -0.08 && q.raw < 1.08, last: A.t, sx: f.x, sy: f.y };
        A.stopped = false; A.stillT = 0; X.hand(null); ev('down:' + (A.f.edge ? 'edge' : 'stone'));
      },
      move(f) {
        const F0 = A.f; if (!F0 || F0.id !== f.id) return;
        const dt = Math.max(1 / 240, A.t - F0.last); F0.last = A.t;
        const q = uOf(f.x, f.y), v = (Math.hypot(f.x - F0.x, f.y - F0.y) / dt) * kpx();
        if (Math.hypot(f.x - F0.sx, f.y - F0.sy) > NA1.STILLPX) { F0.sx = f.x; F0.sy = f.y; A.stillT = 0; A.stopped = false; }
        if (F0.edge && q.d < NA1.NEAR * 1.6 && Math.abs(f.y - F0.y0) < 60 * (innerHeight / 420)) {
          const r = glide(S, F0.u, q.u, v, dt);
          A.glint = { u: q.u, k: r.glint, t: 0.18 };
          for (const e of r.events) onGlide(e);
          F0.u = q.u;
        }
        F0.x = f.x; F0.y = f.y;
      },
      up(f) {
        if (A.r && A.r.id === f.id) { const R0 = A.r; A.r = null; if (Math.hypot(f.x - R0.x0, f.y - R0.y0) > 18 && rotate(S)) spin(); return; }
        const F0 = A.f; A.f = null; if (!F0 || F0.id !== f.id) return;
        const dy = (f.y - F0.y0) * kpx(), dxp = (f.x - F0.x0) * kpx();
        // (a sideways drag on the stone's body, off the edge: its turn to the next edge — the right thumb's, which can reach the stone in the
        //  screen's middle only from its own side; decision build 133)
        if (!F0.edge && Math.abs(dxp) > 40 && Math.abs(dxp) > Math.abs(dy) * 1.3 && onStone(F0.x0, F0.y0)) { if (rotate(S)) spin(); return; }
        if (Math.abs(dy) > NA1.SORT && Math.abs(dy) > Math.abs(dxp) * 1.3 && !(F0.edge && Math.abs(dxp) > 30)) {
          if (!canSort(S)) { A.shake = 0.5; V.bump(); X.line(lv >= 3 ? 'קודם בודקים את שתי השפות' : 'קודם בודקים את כל השפות', 1300); return; }
          sortTo(dy < 0 ? 'basket' : 'pile');
        }
        keep();
      },
    });
    function onGlide(e) {
      ev(e.k);
      if (e.k === 'break') { A.brk = 0.15; }
      else if (e.k === 'wipe') { V.dust(); drawMarks(); }
      else if (e.k === 'wiped') { V.dust(); drawMarks(); X.line('הטחב נוגב. עכשיו בודקים', 1200); }
      else if (e.k === 'lit') { A.lit = 0.6; V.harp(523); drawMarks(); hintSort(); autoTurn(); keep(); }
    }
    function doStop() {
      const F0 = A.f; if (!F0 || !F0.edge || A.stopped) return; A.stopped = true;
      const E = edgeOf(S); if (!E || E.ck || E.marked != null) return;
      for (const e of stop(S, F0.u)) {
        ev(e.k);
        const w = wEdge(F0.u), at = V3(X, w.x, w.y + 0.1, w.z);
        if (e.k === 'mark') { autoTurn(); V.knock(1.2); try { if (X.haptic) X.haptic(25); } catch (er) { /* */ } award(X, at, e.grade, lv, 'בודקים'); if (e.grade === 'gold') { try { X.quick(at, WORDS.quick); } catch (er) { /* */ } X.sparks(w.x, w.y, w.z, 8); } drawMarks(); hintSort(); }
        else if (e.k === 'wrong') { V.knock(0.8); X.loss(0, at, e.mud ? 'בוץ, לא פגם' : 'סימון שגוי'); }
      }
      keep();
    }
    /** (decision build 133: an edge checked, the stone turns by itself to the one not checked yet — the right thumb on it may still turn it) */
    function autoTurn() { const s = cur(S); if (s && s.edges > 1 && s.ck.some((c) => !c)) A.autoRot = 0.7; }
    function spin() { V.knock(0.6); A.spin = { t: 0, r0: stone.rotation.y }; X.hand(null); ev('rotate:' + cur(S).e); }
    function sortTo(to) {
      const s = cur(S), es = sort(S, to); ev('sort:' + to);
      for (const e of es) {
        const at = V3(X, base[0], base[1] + 1, base[2]);
        if (e.k === 'back') { X.line('הניסוי החינם: האבן חוזרת לשורה', 1600); drawMarks(); return; }
        if (e.k === 'shake') { A.shake = 0.5; return; }
        if (e.k === 'basket') award(X, at, 'ok', lv, 'בודקים');
        if (e.k === 'pile' && e.pts) award(X, at, 'ok', lv, 'בודקים');
        if (e.k === 'badIn') hurt(X, Mo, 'nail.bad', at, { lv });
        if (e.k === 'goodOut') X.loss(0, at, 'אבן כשרה לערימה');
      }
      if (to === 'pile') Mo.st.rejects = (Mo.st.rejects | 0) + 1; else Mo.st.basket = (Mo.st.basket | 0) + 1;
      A.fly = { t: 0, to, split: !!(s && s.bad), from: stone.position.clone() };
      keep();
    }
    function nextStone() {
      stone.position.set(base[0], base[1] + 0.25, base[2]); stone.rotation.set(0, yaw, 0); stone.scale.set(1, 1, 1); stone.visible = !done(S);
      drawMarks(); drawRow(); A.glint = null;
      if (done(S)) whenDone();
    }
    async function whenDone() {
      if (A.finished) return; A.busy = 1; X.hand(null);
      Mo.keep('nail', null);
      await X.wait(0.6); if (A.ended) return;
      X.line('הסל יוצא בדרך אל ההר, לערימה ליד רגל הכבש', 1800);
      await finish(X, A, result(S), WORDS.nail, V3(X, base[0], base[1] + 1, base[2]), { eye: eye(), aim: [bk[0], bk[1] + 0.5, bk[2]], secs: 1.2, kohen: false, own: () => (gang.list || []).map((w) => w.a), after: () => { try { Mo.filmOver(); } catch (er) { /* */ } try { gang.clear(); } catch (er) { /* */ } } });
    }
    function hintGlide() { if (resumed || A.hintOn || !S.free) return; A.hintOn = 1; const a = wEdge(0.05), p = sEdge(0.05), q = sEdge(0.6); X.hand({ x: a.x, y: a.y, z: a.z }, Math.round(q.x - p.x), Math.round(q.y - p.y)); }
    function hintSort() { if (!canSort(S) || A.sortHint || resumed) return; A.sortHint = 1; X.hand({ x: base[0], y: base[1] + 0.8, z: base[2] }, 0, -70); }
    // ── each frame
    function draw(dt) {
      // the stillness of the left thumb on the edge: the mark
      if (A.f && A.f.edge) { A.stillT += dt; if (A.stillT >= NA1.STILL && A.t - A.f.t > 0.15) doStop(); }
      const G = A.glint; if (G) { G.t -= dt; const w = Ex(G.u); glint.visible = G.k !== 'off' && G.t > 0 && A.brk <= 0 && !A.fly; glint.position.set(w, NA1.H, NA1.D / 2); glint.scale.set(G.k === 'smear' ? 5 : 1, 1, 1); glint.material.opacity = G.k === 'smear' ? 0.35 : 0.95; if (G.t <= 0) A.glint = null; } else glint.visible = false;
      if (A.brk > 0) A.brk -= dt;
      if (A.autoRot > 0) { A.autoRot -= dt; if (A.autoRot <= 0 && !A.f && !A.spin) { const s = cur(S); if (s && s.ck.some((c) => !c)) { while (s.ck[s.e]) rotate(S); spin(); } } }
      if (A.lit > 0) { A.lit -= dt; litBar.visible = true; litBar.material.opacity = 0.35 + A.lit; }
      if (A.shake > 0) { A.shake -= dt; stone.rotation.z = Math.sin(A.t * 60) * 0.02 * A.shake; } else if (!A.fly) stone.rotation.z = 0;
      if (A.spin) { const Sp = A.spin; Sp.t += dt; const u = Math.min(1, Sp.t / 0.5), e = u * u * (3 - 2 * u); stone.rotation.y = Sp.r0 + Math.PI * e; if (u >= 1) { A.spin = null; stone.rotation.y = yaw; drawMarks(); } }
      const Fy = A.fly; if (Fy) {
        Fy.t += dt; const u = Math.min(1, Fy.t / NA1.FLY), to = Fy.to === 'basket' ? bk : hp;
        stone.position.set(Fy.from.x + (to[0] - Fy.from.x) * u, Fy.from.y + Math.sin(u * Math.PI) * (Fy.to === 'basket' ? 1.6 : 0.5) + (to[1] + 0.4 - Fy.from.y) * u, Fy.from.z + (to[2] - Fy.from.z) * u);
        if (Fy.to === 'basket') stone.rotation.x = u * Math.PI * 2; stone.scale.setScalar(1 - 0.55 * u);
        if (u >= 1) {
          A.fly = null; stone.rotation.x = 0;
          if (Fy.to === 'basket') { V.thud(); pileUp(inB, bk, bN(), Mt.y10field); }
          else { V.crack(); X.dust(hp[0], hp[1] + 0.3, hp[2], 8, 1.5); pileUp(inH, hp, heapN(), Mt.y10field); if (Fy.split) pileUp(inH, hp, heapN(), Mt.y10field); }
          nextStone();
        }
      }
    }
    return {
      close: true, kohenWorks: true,
      begin() {
        goPit(X);
        try { X.kohen(false); } catch (e) { /* (the kohen kneels at the stone as one of the figures, his hand the thumb) */ }
        castMen(); drawMarks(); drawRow(); FG.attach(); home(0.01); X.line('', 0);
        X.wait(0.9).then(hintGlide);
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        try { V.frame(); Bt.step(dt); gang.update(dt, Bt); draw(dt); if (A.t % 1 < dt) keep(); }
        catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h133] nail', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.f = null; A.r = null; keep(); },
      // (the right thumb on the stone turns it; elsewhere it is the director's look)
      wants(p) { if (!p) return true; if (p.x < innerWidth * 0.6) return true; return onStone(p.x, p.y); },
      holds() { return !!A.f || !!A.r; },
      lensFov: NA1.FOV,
      end() { A.ended = true; FG.detach(); V.stop(); X.hand(null); lens(X, fov0); try { gang.clear(); } catch (e) { /* */ } X.props.remove(root); backFromPit(X); },
      at() { return V3(X, base[0], base[1] + 0.8, base[2]); },
      dbg() {
        const E = edgeOf(S), a = sEdge(0), b = sEdge(1), c = X.scr(base[0], base[1] + 0.4, base[2]);
        return { id: m.id, lv, t: +A.t.toFixed(2), ev: A.ev.slice(-10), i: S.i, n: S.stones.length, edge: E, edges: cur(S) ? cur(S).edges : 0, can: canSort(S), e0: [Math.round(a.x), Math.round(a.y)], e1: [Math.round(b.x), Math.round(b.y)], stone: [Math.round(c.x), Math.round(c.y)], pts: S.pts, dmg: S.dmg, wrong: S.wrong, missed: S.missed, exact: S.exact, free: S.free, busy: A.busy, finished: A.finished, fly: !!A.fly, cam: [cam0.position.x, cam0.position.y, cam0.position.z].map((v) => +v.toFixed(1)), eye: eye().map((v) => +v.toFixed(1)), base: base.map((v) => +v.toFixed(1)) };
      },
    };
  },
};
