/* ── build 132 ── h132/fill.js — work 2 "מילוי הגוש באיזון" (spec docs/specs/shlav-09-he.md, עבודה 2). THE LEAD'S FILE.
 * Twenty loads come up the ramp from the north on sleds the oxen bring along the road; the left thumb (or the mouse's left button) drags
 * the first sled (level 3: either of the first two) over the form and lets it go on one of the five zones (the zone under it shows
 * green, rule 59); the two unloaders tip it there — a big basket of round stones lands heavy and slow, a small one light, a tub of mix
 * pours and spreads to its neighbours; the three levellers spread it with wooden rakes, and at a layer's close, when it lies level, they
 * rake it flat (the bonus, the flash climbing the walls). The gauges' tongues on the four walls' tops show each wall's load. The right
 * thumb is the camera's. The kohen is out (the crews work here). No iron: wood, reeds, stones and mix.
 * The rules: fill-model.js (pure). Its things: fill3d.js. Every place: BOOK.s09 (block, zone, gauge, ramp, sleds, oxen, stand.w2, cam.w2).
 *   FILL_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS, LOSS } from './model.js';
import { FILL, ZONES, zoneAt, gauges, band, fresh, load, save, canTake, take, tick, result, advise, onRamp, screenOf } from './fill-model.js';
import { fmats, surfH, standY, fillTop, zoneMarks, gaugeSet, layerLines, rampMesh, rampY, rampAng, sledMesh, stoneHeap, oxPair, fillHold, FD } from './fill3d.js';
import { createVoices } from '../h129/sound129.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, onPlane, clamp, ease } from '../h109/kit.js';

const S9 = BOOK.s09, B = S9.block, Y0 = S9.base, Y1 = S9.top, MID = S9.mid, ZC = S9.zone, R = S9.ramp, OX = S9.oxen;
/** the act's numbers: how near a finger must be to a sled (px), the loads' fall (s), the flow's ease (s), the oxen's walk (s), the men's
 *  pace (amot/s), the hint hand's longest gesture (px), the wait before the end (s) (המחשה, לכיוונון) */
export const FK = Object.freeze({
  PICK: 70, PICKM: 46, FALL: Object.freeze({ big: 1.1, small: 0.45, tub: 0.7 }), FLOW: 0.6, SLIDE: 0.7, OX_WALK: 2.6, MEN: 7, HP: 85, END: 1.6,
  LIFT: 1.6, RAKE: 1.3, BACK: 0.5, FOV: 50, ROAD0: 0.5, BOB: 8, BOB_HOLD: 0.15, BOB_BACK: 0.6,
});
/** the act's words (what to do, at most five words) */
export const FILLL = Object.freeze({
  l1: 'גררו מזחלת אל אזור',
  l3: 'אפשר לבחור מבין השתיים',
  wait: 'השוורים מחכים',
  free: 'ניסיון חינם',
  collapse: 'המרכז גלש לפינה',
  flat: 'שכבה ישרה!',
});
const KIND_HE = { big: 'סל גדול', small: 'סל קטן', tub: 'גיגית' };

export const FILL_ACT = {
  icon: '🧺',
  title: 'מילוי הגוש באיזון',
  walkLine: () => 'המילוי: עשרים מטענים, חמש שכבות',
  stand() { const s = S9.stand.w2; return { x: s[0], z: s[1], face: [R.foot[0], R.foot[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 2, V = createVoices(X.sfx); fmats(X);
    const root = new T.Group(); root.name = 'h132-fill-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], fl: null, done: 0, busy: 0, hintN: -1, adv: null, advN: -1, waitSaid: 0, lastBand: 'good' };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    // ── the work: fresh, or the one a reload broke off (its heights, its queue, its flaws already kept)
    const b0 = Mo.workOf('fill');
    let S = b0 && b0.id === m.id ? load(b0.S) : null; const resumed = !!S;
    if (!S) S = fresh(lv);
    const keep = () => { Mo.keep('fill', { id: m.id, S: save(S) }); X.save(); };
    // ── the things: the ramp, the fill's top, the zones' battens and greens, the gauges, the layer lines, the stones of a pocket
    rampMesh(X, root);
    const top = fillTop(X, root), zm = zoneMarks(X, root), gs = gaugeSet(X, root), ll = layerLines(X, root), heap = stoneHeap(X, root);
    const shown = { ...S.h }; let from = null, to = null, flowT = 1, flowD = FK.FLOW;
    const bulges = {};
    let gaugeKnock = false;   // (no knock for the first drawing of the gauges)
    function drawFill() {
      top.set(shown); zm.set(shown); ll.set(S.layer - 1);
      // (review 132 R1: a wood knock as a tongue steps out or in — step 1 low, 2 middle, 3 high; one knock a frame)
      const mv = gs.set(gauges(shown), lv, S.bulged), up = mv.reduce((m, q) => Math.max(m, q[1]), 0);
      if (mv.length && gaugeKnock) { try { V.knock(up >= 3 ? 0.62 : up === 2 ? 0.9 : 1.35); } catch (e) { /* */ } }
      for (const z of ZONES) { const p = S.pockets.some((q) => q.zone === z && !q.mended && q.layer === S.layer); heap.set(z, S.last[z] === 'stone', p, Y0 + surfH(shown, ZC[z][0], ZC[z][1])); }
      for (const k of ['N', 'S', 'E', 'W']) if (S.bulged[k] && !bulges[k]) {
        const g0 = S9.gauge[k], n = k === 'N' ? [0, -1] : k === 'S' ? [0, 1] : k === 'E' ? [1, 0] : [-1, 0], w = 4, d = 0.35, x = g0[0] + n[0] * d, z = g0[1] + n[1] * d;
        const mb = new T.Mesh(X.props.geo.box, X.props.M.y9wood); mb.scale.set(n[0] ? d : 2 * w, Y1 - Y0 - 2, n[1] ? d : 2 * w); mb.position.set(x, (Y0 + Y1) / 2, z); mb.castShadow = true; mb.name = 'h132-bulge'; root.add(mb); bulges[k] = mb;
      }
    }
    // ── the sleds on the ramp (as the model's ramp has them; the one brought now walks in behind the oxen)
    const sleds = new Map();   // queue index → { g, load, kind, pos: {x, y, z}, want, st: 'ramp' | 'drag' | 'drop' | 'road' }
    const slotOf = (j) => S9.sleds[Math.min(j, S9.sleds.length - 1)];
    function sledFor(q) {
      let s = sleds.get(q.i); if (s) return s;
      s = sledMesh(X, q.kind, root); s.q = q; s.st = 'road'; s.pos = { x: OX.from[0], y: S9.floor, z: OX.from[1] }; sleds.set(q.i, s);
      return s;
    }
    // (the sleds already on the ramp when the work begins stand at their slots)
    S.ramp.forEach((q, j) => { const s = sledFor(q), [x, z] = slotOf(j); s.st = 'ramp'; s.onRamp = 1; s.pos = { x, y: rampY(z) + 0.05, z }; });
    // ── the figures: two drivers with wooden goads by the oxen; two unloaders at the ramp's head; three levellers with wooden rakes
    const Bt = createBeat(X), gang = createGang(X), ox = oxPair(X, root);
    const now = (w) => { if (w && w.a) w.a.vis = 1; return w; };
    const groundOf = (w) => { w.a.ground = (x, z) => standY(X, x, z, shown); };
    const UN0 = [[R.head[0] - 2.3, S9.sleds[0][1] - 1], [R.head[0] + 2.3, S9.sleds[0][1] - 1]];   // (on the ramp's head either side of its first sled: seen over the block's far edge from the south camera)
    const LV0 = [[MID[0] - 10, MID[1] - 7], [MID[0] - 11.5, MID[1] + 1.5], [MID[0] - 9, MID[1] + 9]];   // (on the block's far (west) half from the east camera: never between it and the work)
    const drv = [0, 1].map((j) => now(gang.add(OX.to[0] + 2.5, OX.to[1] + 2.5, { role: 'hold', item: 'staff', fx: OX.to[0] - 4, fz: OX.to[1], crew: j })));
    const un = UN0.map((p, j) => now(gang.add(p[0], p[1], { role: 'hold', fx: MID[0], fz: MID[1], crew: 2 + j })));
    const lvl = LV0.map((p, j) => now(gang.add(p[0], p[1], { role: 'hold', item: 'rake', fx: MID[0], fz: MID[1], crew: j })));
    for (const w of [...un, ...lvl]) if (w && w.a) groundOf(w);
    // (the figure gate: an unloader or a leveller standing inside the block is on the work's own top — his body over the focus is the
    //  work being done, never "between" the camera and it; outside the block the gate's test is as for any man)
    const onBlock = (a) => () => a.x > B[0] && a.x < B[2] && a.z > B[1] && a.z < B[3];
    for (const w of [...un, ...lvl]) if (w && w.a) w.a.gateOnWork = onBlock(w.a);
    const men = { drv, un, lvl };
    // each man's place now (the act moves them itself: a short lerp with their legs walking, never a path across the work)
    const goal = new Map();
    function place(w, x, z, fx, fz, role, extra = {}) { if (!w || !w.a) return; goal.set(w, { x, z, fx, fz, role, ...extra }); }
    function menStep(dt) {
      for (const [w, g] of goal) {
        const a = w.a; if (!a || !a.alive) continue;
        const dx = g.x - a.x, dz = g.z - a.z, d = Math.hypot(dx, dz), v = (g.v || FK.MEN) * dt;
        if (d > 0.03) { const k = Math.min(1, v / d); a.x += dx * k; a.z += dz * k; }
        const walk = d > 0.15;
        const role = walk && g.role !== 'pull' && g.role !== 'push' ? 'hold' : g.role;
        if (w.role !== role || !!w.stride !== (walk || !!g.stride)) gang.setRole(w, role, { fx: g.fx, fz: g.fz, stride: walk ? 0.8 : g.stride || 0, rate: walk ? 2 : g.rate || 1.2 });
        w.fx = walk ? g.x + dx : g.fx; w.fz = walk ? g.z + dz : g.fz; if (walk) a.yaw = Math.atan2(dx, dz);
        if (g.tip != null) { const u = g.tip; a.arm[0] = a.armT[0] = 0.9 + 0.8 * u; a.arm[2] = a.armT[2] = 0.9 + 0.8 * u; a.arm[1] = a.armT[1] = -0.2; a.arm[3] = a.armT[3] = -0.2; a.bow = a.bowT = 0.45 - 0.3 * u; }
      }
    }
    // the levellers' home and their raking: at a tub (spread round its zone) and at a level layer (all three across the top)
    const rake = { t: 0, at: null };
    function levellersHome() { lvl.forEach((w, j) => place(w, LV0[j][0], LV0[j][1], MID[0], MID[1], 'hold')); }
    function levellersTo(zone, secs) {
      const c = ZC[zone]; rake.t = secs; rake.at = zone;
      lvl.forEach((w, j) => { const a = (j / 3) * Math.PI * 2 + 0.6, r = zone === 'C' ? 3.4 : 3; place(w, clamp(c[0] + Math.cos(a) * r, B[0] + 1.2, B[2] - 1.2), clamp(c[1] + Math.sin(a) * r, B[1] + 1.2, B[3] - 1.2), c[0], c[1], 'pull', { stride: 0.35, rate: 1.6 }); });
    }
    function levellersAll(secs) {
      rake.t = secs; rake.at = 'all';
      const P = [[MID[0] - 9, MID[1] - 6], [MID[0], MID[1] + 7], [MID[0] + 9, MID[1] - 6]];
      lvl.forEach((w, j) => place(w, P[j][0], P[j][1], P[j][0], P[j][1] + (j === 1 ? -6 : 6), 'pull', { stride: 0.4, rate: 1.8 }));
    }
    levellersHome();
    un.forEach((w, j) => place(w, UN0[j][0], UN0[j][1], R.head[0], R.head[1] - 6, 'hold'));
    // ── the oxen and their drivers: idle beside the ramp's foot; bringing a sled along the road from the east
    const road = { t: -1, q: null };
    const OXW = [OX.to[0] + 4.5, OX.to[1]];
    function oxIdle() { ox.set(OXW[0], OXW[1], -Math.PI / 2, 0); }
    oxIdle();
    function oxStep(dt) {
      // a sled waits to come: the next one the model has on the ramp with no mesh yet (or level 3's caravan: the one that just came)
      if (road.t < 0) {
        const q = S.ramp.find((r) => !sleds.has(r.i) || sleds.get(r.i).st === 'road');
        if (q) { road.t = 0; road.q = q; const s = sledFor(q); s.st = 'road'; ev('bring:' + q.kind); }
      }
      if (road.t >= 0) {
        road.t += dt; const u = Math.min(1, road.t / FK.OX_WALK), x0 = OX.from[0] + (OX.to[0] - OX.from[0]) * FK.ROAD0, x = x0 + (OX.to[0] + 4.5 - x0) * ease(u);   // (from the road's half that the work's view holds)
        ox.set(x, OXW[1], -Math.PI / 2, u < 1 ? 1 : 0);
        const s = sleds.get(road.q.i); if (s) { s.pos.x = x + 4.2; s.pos.z = OX.to[1]; s.pos.y = S9.floor; s.ang = 0; s.yaw = Math.PI / 2; }
        if (u >= 1) { if (s) s.st = 'ramp'; road.t = -1; road.q = null; V.knock(0.7); }
      } else oxIdle();
      ox.update(dt);
      // the drivers walk beside the pair, their goads in hand
      drv.forEach((w, j) => place(w, ox.P.x + (j ? 2.4 : -0.6), ox.P.z + 2.5, ox.P.x - 6, ox.P.z, 'hold', { v: 14 }));   // (2.5 south of the pair: the figure gate's grid (scratch gate.json) has that line whole at u 0 and u 0.3 at 960x600 and 1600x900 for the whole road; north of the pair the lifted view cut them)
    }
    // ── the sleds' places: on the ramp at their slot (the first nearest the head), carried by the finger, or tipping on a zone
    function sledsStep(dt) {
      S.ramp.forEach((q, j) => {
        const s = sledFor(q); if (s.st === 'road') return;
        if (s.st === 'ramp') { const [x, z] = slotOf(j); s.want = { x, y: rampY(z) + 0.05, z }; s.ang = rampAng(); s.yaw = 0; }
      });
      for (const s of sleds.values()) {
        if (s.st === 'road') { s.g.position.set(s.pos.x, s.pos.y, s.pos.z); s.g.rotation.set(0, s.yaw || 0, 0); continue; }
        if (s.st === 'ramp' && s.want) {
          // (a sled that came off the road climbs to its slot from the ramp's foot)
          if (!s.onRamp) { s.onRamp = 1; s.pos.x = R.foot[0]; s.pos.z = R.foot[1] + 1; s.pos.y = rampY(R.foot[1] + 1); }
          const k = 1 - Math.exp(-dt * 4); s.pos.x += (s.want.x - s.pos.x) * k; s.pos.y += (s.want.y - s.pos.y) * k; s.pos.z += (s.want.z - s.pos.z) * k;
          s.g.position.set(s.pos.x, s.pos.y, s.pos.z); s.g.rotation.set(-s.ang, 0, 0);
        }
        if (s.st === 'drag') { const k = 1 - Math.exp(-dt * 10); s.pos.x += (s.want.x - s.pos.x) * k; s.pos.y += (s.want.y - s.pos.y) * k; s.pos.z += (s.want.z - s.pos.z) * k; s.g.position.set(s.pos.x, s.pos.y, s.pos.z); s.g.rotation.set(0, 0, 0); }
      }
    }
    // (a sled climbing from the ramp's foot is not yet to be taken: only at its slot, where the view holds it)
    const atSlot = (s) => !!s.want && Math.hypot(s.want.x - s.pos.x, s.want.z - s.pos.z) < 0.6;
    // ── the finger: a sled that may be taken, dragged over the form, let go on a zone
    const sp = (x, y, z) => X.scr(x, y, z);
    const pickR = () => (MOUSE ? FK.PICKM : FK.PICK);
    function pick(f) {
      if (A.done || A.drop) return null;
      let best = null, bd = pickR();
      S.ramp.forEach((q, j) => { const s = sleds.get(q.i); if (!s || s.st !== 'ramp' || !atSlot(s) || !canTake(S, j)) return; const p = sp(s.pos.x, s.pos.y + 0.8, s.pos.z); if (p.on === false) return; const d = Math.hypot(f.x - p.x, f.y - p.y); if (d < bd) { bd = d; best = { j, s }; } });
      return best;
    }
    /** the finger's ray on the fill's top (not on a plane at the sled's height: from the slanted view that read the zone next to the one
     *  under the finger): a few steps, each on the plane at the surface's height where the last one met */
    function onSurf(f) {
      let y = Y0 + Math.max(...ZONES.map((z) => shown[z])), p = null;
      for (let i = 0; i < 4; i++) { const q = onPlane(X, f.x, f.y, y); if (!q) return p; p = q; const inB = q.x > B[0] && q.x < B[2] && q.z > B[1] && q.z < B[3]; const y2 = inB ? Y0 + surfH(shown, q.x, q.z) : y; if (Math.abs(y2 - y) < 0.02) break; y = y2; }
      return p;
    }
    const dragY = () => Y0 + Math.max(...ZONES.map((z) => shown[z])) + FK.LIFT;
    const FG = fingers(X, {
      down(f) {
        if (A.fl != null) return; const k = pick(f); if (!k) { try { if (X.lookHome) X.lookHome(); } catch (e) { /* */ } return; }
        A.fl = f.id; f.k = k; k.s.st = 'drag'; k.s.want = { ...k.s.pos }; X.hand(null); V.scrape(0.5); ev('grab:' + k.s.kind + (k.j ? ':2nd' : ''));
      },
      move(f) {
        const k = f.k; if (!k || A.fl !== f.id) return; const p = onSurf(f); if (!p) return;
        const x = clamp(p.x, B[0] - 2, B[2] + 2), z = clamp(p.z, R.foot[1] + 2, B[3] + 2), on = zoneAt(x, z);
        k.s.want = { x, y: on ? dragY() : Math.max(dragY(), standY(X, x, z, shown) + 0.3), z };
        A.over = on; zm.lit(on); V.scrape(0.4);
      },
      up(f) {
        const k = f.k; if (!k || A.fl !== f.id) return; A.fl = null; V.scrape(0); zm.lit(null);
        const z = A.over; A.over = null;
        if (!z || A.done) { k.s.st = 'ramp'; ev('back'); return; }
        drop(k, z);
      },
    });
    // ── a load let go on a zone: the unloaders tip it, it lands (the model takes it), the flow and the collapse are seen, the score
    function drop(k, zone) {
      const s = k.s, c = ZC[zone]; A.drop = { s, zone, t: 0, j: k.j, landed: 0 };
      s.st = 'drop'; s.want = { x: c[0], y: Y0 + surfH(shown, c[0], c[1]) + 0.05, z: c[1] };
      // the two unloaders at the sled's sides
      un.forEach((w, j) => place(w, c[0] - 1.7, c[1] + (j ? 0.9 : -1.4), c[0], c[1], 'hold', { v: 16 }));   // (on the sled's far (west) side from the east camera)
      ev('drop:' + s.kind + '@' + zone);
    }
    function dropStep(dt) {
      const D = A.drop; if (!D) return; D.t += dt; const s = D.s, fall = FK.FALL[s.kind];
      // the sled comes down onto the zone (a big basket slow and heavy), then the men tip it
      const k = 1 - Math.exp(-dt * (s.kind === 'big' ? 3 : 7)); s.pos.x += (s.want.x - s.pos.x) * k; s.pos.y += (s.want.y - s.pos.y) * k; s.pos.z += (s.want.z - s.pos.z) * k;
      s.g.position.set(s.pos.x, s.pos.y, s.pos.z);
      const u = clamp((D.t - fall) / 0.45, 0, 1);
      s.load.rotation.x = -1.6 * ease(u); s.load.position.z = 0.9 * ease(u);
      for (const w of un) { const g = goal.get(w); if (g) g.tip = D.t > fall * 0.6 ? ease(u) : null; }
      if (!D.landed && D.t >= fall + 0.3) { D.landed = 1; land(D); }
      if (D.landed && D.t >= fall + 0.3 + FK.BACK) {
        // the empty sled taken off; the men back to the ramp's head
        root.remove(s.g); for (const [i, q] of sleds) if (q === s) sleds.delete(i);
        for (const w of un) { const g = goal.get(w); if (g) g.tip = null; }
        un.forEach((w, j) => place(w, UN0[j][0], UN0[j][1], R.head[0], R.head[1] - 6, 'hold', { v: 10 }));
        A.drop = null; hintNext(true);
      }
    }
    // (the words after a load wait their turn: each one POP after the one before, so no two stand on the block at once)
    const POP = 0.75;
    function later(fn) { const t = Math.max(A.t, A.popAt || 0) + POP; A.popAt = t; X.wait(t - A.t).then(() => { try { fn(); } catch (e) { /* */ } }); }
    const atOf = (zone) => ({ x: ZC[zone][0], y: Y0 + surfH(S.h, ZC[zone][0], ZC[zone][1]) + 1.5, z: ZC[zone][1] });
    // (review 132 R5: as a load lands the camera rises 8° about its aim — the whole top and the four tongues — and comes home 0.6 s later;
    //  never while the right thumb holds a look or a sled is dragged: the player's camera wins)
    function bob() {
      let L = null; try { L = X.lookNow ? X.lookNow() : null; } catch (e) { L = null; }
      if (A.lifted || (L && (L.u > 0.02 || Math.abs(L.yaw || 0) > 0.03 || L.ov)) || A.fl != null || [...sleds.values()].some((q) => q.st === 'drag')) return;
      const [e0, a0] = S9.cam.w2, v = [e0[0] - a0[0], e0[1] - a0[1], e0[2] - a0[2]], hl = Math.hypot(v[0], v[2]), d = Math.hypot(hl, v[1]);
      const el = Math.min(1.35, Math.atan2(v[1], hl) + FK.BOB * Math.PI / 180), k = (d * Math.cos(el)) / (hl || 1);
      X.shot([a0[0] + v[0] * k, a0[1] + d * Math.sin(el), a0[2] + v[2] * k], a0.slice(), 0.22);
      A.bobT = A.t + 0.22 + FK.BOB_HOLD;
    }
    function land(D) {
      const h0 = { ...shown }, e = take(S, D.j, D.zone); if (!e) { ev('refused'); return; }
      bob();
      const at = atOf(D.zone);
      // the sound and the dust of its matter: stones heavy (a big basket a thud and a shake), the mix a wet spill
      if (e.kind === 'big') { V.thud(); X.shake(0.18, 0.3); X.dust(at.x, at.y - 1, at.z, 12, 2.5); } else if (e.kind === 'small') { V.bump(); X.dust(at.x, at.y - 1, at.z, 6, 1.8); } else { V.dust(); V.bump(); }
      // the heights ease from what was to what is now (the flow seen spreading; the collapse a slide after it)
      from = h0; to = { ...S.h }; flowT = 0; flowD = e.collapse ? FK.FLOW + FK.SLIDE : FK.FLOW;
      if (e.kind === 'tub') levellersTo(D.zone, FK.RAKE);
      // the score: the worst gauge's band (40 / 20 / 10), the collapse at most 10, the free trial never against
      // (one popup at a time, at one place: the load's points at the zone, its gold word above them, the free trial's word in the
      //  goal's line; the screen's streak as the rules': screenOf — a 20 or a 10 ends the gold run, the free trial neither)
      const sc = screenOf(e);
      if (sc.grade) X.hit(at, sc.grade, { kind: 'craft', text: '', craft: 'ממלאים' });
      else { try { if (X.bonus) X.bonus(sc.bonus, 'fill-free', FILLL.free); } catch (er) { /* */ } X.dust(at.x, at.y - 1, at.z, 6, 1.8); }
      if (e.free) X.line(FILLL.free, 2600);
      if (sc.grade === 'gold') { const q = X.scr(at.x, at.y, at.z); X.quick(q && q.on !== false ? { sx: q.x, sy: q.y - 120, avoid: { x0: q.x - 70, x1: q.x + 70, y0: q.y - 72, y1: q.y + 24 } } : at, WORDS.quick, s0(D.s)); /* (one above the other: the word clears the number and its rise) */ }
      if (e.band !== 'good' && !e.free) V.creak(e.band === 'danger' ? 1 : 0.5); else V.creak(0);
      if (e.collapse) { V.groan(); X.shake(0.12, 0.2); const p = Mo.flaw('fill.collapse', { zone: e.collapse }); later(() => X.loss(p, atOf(e.collapse), LOSS['fill.collapse'][0])); ev('collapse:' + e.collapse); }   // (its word after the load's points have gone)
      ev('land:' + e.kind + '@' + D.zone + ':' + e.pts + (e.pocket ? ':pocket' : '') + (e.mended ? ':mended' : ''));
      // the layer's close: level → the rakes, the flash up the walls, the rising sound, the bonus; else what stays (no points)
      if (e.layer) closed(e.layer);
      for (const f of e.flaws) flaw(f);
      keep();
      if (S.done) finish();
    }
    const s0 = (s) => (s && s.load ? s.load : null);
    function closed(L) {
      if (L.flat) {
        levellersAll(FK.RAKE + 0.4); ll.flash(L.n); V.lock(L.n); X.shake(0.06, 0.12);
        // (the layer's word and bonus after the last load's points have gone: never two words on the block at once)
        const at = { x: MID[0], y: Y0 + L.n + 1.2, z: MID[1] };
        try { if (X.bonus) X.bonus(FILL.PTS.layer, 'layer', FILLL.flat); } catch (e) { /* */ }
        later(() => X.quick(at, FILLL.flat, null));
        ev('layer:' + L.n + ':flat');
      } else ev('layer:' + L.n + ':off:' + L.off.map((o) => o.zone).join(','));
    }
    function flaw(f) {
      const p = Mo.flaw(f.f, { zone: f.zone, wall: f.wall, n: f.n }), lab = LOSS[f.f] ? LOSS[f.f][0] : '';
      const at = f.wall ? { x: S9.gauge[f.wall][0], y: Y1 + 0.5, z: S9.gauge[f.wall][1] } : atOf(f.zone || 'C');
      later(() => { if (p > 0) X.loss(p, at, lab); else if (X.word) X.word(at, lab); });   // (after the load's own points)
      ev('flaw:' + f.f + ':' + (f.zone || f.wall || ''));
    }
    // ── the hint hand: the free trial's one hand at every level (rule 25), and level 1's every load (rule 34: level 1 shows the way)
    function adv() { const k = S.n + ':' + S.ramp.length; if (A.advN !== k) { A.advN = k; A.adv = advise(S); } return A.adv; }   // (level 3: a sled's arrival may change the best line)
    function hintNext(force) {
      if (A.done || A.fl != null || A.drop) { X.hand(null); return; }
      if (!(S.free || lv === 1)) { if (A.hintN !== -2) { A.hintN = -2; X.hand(null); } return; }
      if (!force && A.hintN === S.n) return; A.hintN = S.n;
      const a = adv(); if (!a || a.wait) { X.hand(null); A.hintN = -1; return; }   // (wait for the next sled: no hand till it comes)
      const s = sleds.get(S.ramp[a.i] && S.ramp[a.i].i); if (!s || s.st !== 'ramp') { A.hintN = -1; return; }
      const p = sp(s.pos.x, s.pos.y + 0.8, s.pos.z), c = ZC[a.zone], q = sp(c[0], Y0 + surfH(shown, c[0], c[1]), c[1]);
      X.hand({ x: s.pos.x, y: s.pos.y + 0.8, z: s.pos.z + FD.SLED[2] * FD.SLED_K * 0.6 },   /* (review P8: the finger at the sled's near end, the hand below it — the sled and its load read under the hint) */ clamp(q.x - p.x, -FK.HP, FK.HP), clamp(q.y - p.y, -FK.HP, FK.HP));
    }
    // ── the end: the result, the perfect word, the film (the whole block, the crews in it)
    async function finish() {
      if (A.done) return; A.done = 1; X.hand(null); V.creak(0);
      const res = result(S); ev('done');
      Mo.keep('fill', null);
      await X.wait(Math.max(FK.END, (A.popAt || 0) - A.t + 0.4));   // (the last words have had their turn)
      if (res.perfect) { try { X.perfect(WORDS.fill, { x: MID[0], y: Y1 + 1, z: MID[1] }); } catch (e) { /* */ } await X.wait(1.2); }
      X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, flags: res.flags, at: { x: MID[0], y: Y1 + 0.5, z: MID[1] },
        film: { eye: S9.cam.w2after[0].slice(), aim: S9.cam.w2after[1].slice(), secs: 2.0,   /* (review P4: the book's closing view, the faces and the top together) */   // (the work's shot, its aim raised onto the filled top: aimed inside the full block the camera's guard drew the eye onto its face — a flat frame)
        kohen: false, own: () => gang.list.map((w) => w.a), after: () => { try { gang.clear(); } catch (e) { /* */ } try { ox.clear(); } catch (e) { /* */ } } } });
    }
    // ── the camera: the book's one shot of the work (the whole block, the ramp and the road, the horizon); the right thumb looks round
    const cam0 = X.camera, fov0 = cam0.fov;
    const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const shotHome = (d = 0) => { lens(FK.FOV); X.shot(S9.cam.w2[0].slice(), S9.cam.w2[1].slice(), d); };
    drawFill(); gaugeKnock = true;
    return {
      close: true,
      begin() {
        fillHold(true);
        try { X.kohen(false); } catch (e) { /* */ }
        FG.attach(); shotHome(0);
        X.line(lv === 3 ? FILLL.l3 : FILLL.l1, 4500);
        X.wait(1.2).then(() => hintNext(true));
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); Bt.step(dt);
          // the model's clock: the gauges' danger (the bulge) and level 3's caravan
          if (!A.done) for (const e of tick(S, dt)) {
            if (e.bulge) { V.crack(); X.shake(0.2, 0.3); flaw(e.flaw); keep(); }
            if (e.wait && !A.waitSaid) { A.waitSaid = 1; X.line(FILLL.wait, 2400); X.loss(0, { x: OX.to[0], y: S9.floor + 3, z: OX.to[1] }, FILLL.wait); ev('wait'); }
            if (e.arrive) { A.waitSaid = 0; ev('arrive:' + e.arrive); }
          }
          // the heights' ease after a load
          if (flowT < 1 && from && to) { flowT = Math.min(1, flowT + dt / flowD); const u = ease(flowT); for (const z of ZONES) shown[z] = from[z] + (to[z] - from[z]) * u; drawFill(); }
          else if (A.redraw !== S.n + '|' + S.dmg) { A.redraw = S.n + '|' + S.dmg; for (const z of ZONES) shown[z] = S.h[z]; drawFill(); }
          if (rake.t > 0) { rake.t -= dt; if (rake.t <= 0) levellersHome(); }
          ll.step(dt); oxStep(dt); sledsStep(dt); dropStep(dt); menStep(dt); gang.update(dt, Bt);
          // the gauges' creak while one is past the good
          const g = gauges(S.h), worst = Math.max(g.N, g.S, g.E, g.W), b = S.free || S.grace ? 'good' : band(worst, lv);
          if (b !== A.lastBand) { A.lastBand = b; V.creak(b === 'danger' ? 1 : b === 'warn' ? 0.45 : 0); }
          if (A.t % 0.5 < dt) hintNext(false);
          if (A.bobT && A.t >= A.bobT) { A.bobT = 0; if (!A.lifted) shotHome(FK.BOB_BACK); }
          // (the right thumb's look let go and home: the work's shot taken again — after a lift out over the court the camera came back to
          //  its eye but kept the lifted aim, turned off the block)
          { let L = null; try { L = X.lookNow ? X.lookNow() : null; } catch (e) { L = null; } if (L) { if (L.u > 0.02 || Math.abs(L.yaw || 0) > 0.03 || L.ov) A.lifted = 1; else if (A.lifted && L.u < 1e-3 && Math.abs(L.yaw || 0) < 1e-3) { A.lifted = 0; shotHome(0.3); ev('look:home'); } } }
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h132] fill', e && e.message, e && e.stack); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { for (const s of sleds.values()) if (s.st === 'drag') s.st = 'ramp'; A.fl = null; zm.lit(null); V.scrape(0); },
      // (rule 66: on the right half a touch is the act's only where it lands on a sled that may be taken; else the camera's)
      wants(p) { if (!p) return true; return !!pick(p); },
      holds() { return A.fl != null; },
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        if (!A.done) { gang.clear(); ox.clear(); }
        X.props.remove(root); fillHold(false);
      },
      at() { return new T.Vector3(MID[0], Y1 + 0.5, MID[1]); },
      dbg() {
        const s2 = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const a = A.done ? null : adv();
        const o = { id: m.id, lv, done: A.done, n: S.n, placed: S.n, layer: S.layer, inLayer: S.inLayer, pts: result(S).pts, dmg: S.dmg, flat: S.flat, free: S.free, ramp: onRamp(S), mouse: MOUSE, nf: FG.n, ev: A.ev.slice(-10),
          h: Object.fromEntries(ZONES.map((z) => [z, +S.h[z].toFixed(3)])), drop: A.drop ? A.drop.zone : null, drag: A.fl != null, busy: A.drop ? 1 : 0, road: road.t >= 0 ? 1 : 0, waiting: S.waiting };
        o.sleds = S.ramp.map((q, j) => { const s = sleds.get(q.i); return s && s.st === 'ramp' ? { j, kind: q.kind, take: canTake(S, j) && atSlot(s), at: s2(s.pos.x, s.pos.y + 0.8, s.pos.z) } : { j, kind: q.kind, take: false, at: null }; });
        o.zones = Object.fromEntries(ZONES.map((z) => [z, s2(ZC[z][0], Y0 + surfH(shown, ZC[z][0], ZC[z][1]), ZC[z][1])]));
        o.hint = a ? (a.wait ? { wait: true } : { j: a.i, zone: a.zone, kind: a.kind }) : null; o.fl = result(S).flags;
        o.g = Object.fromEntries(Object.entries(gauges(S.h)).map(([k, v]) => [k, +v.toFixed(2)]));
        const P = (w) => (w && w.a ? s2(w.a.x, w.a.y + 1.9, w.a.z) : null);
        o.figs = { drv: drv.map(P), un: un.map(P), lvl: lvl.map(P) };
        o.unTip = un.some((w) => { const g = goal.get(w); return g && g.tip > 0.3; }); o.raking = rake.t > 0 ? rake.at : null; o.oxWalk = ox.P.walk;
        const cp = X.camera.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1)); try { const dv = new T.Vector3(); X.camera.getWorldDirection(dv); o.dir = [dv.x, dv.y, dv.z].map((v) => +v.toFixed(2)); } catch (e) { /* */ }
        return o;
      },
    };
  },
};
void FD;
