/* ── build 137 ── h137/hakzaa.js — work 2 "הקצעת קרשי התקרה", the act (spec docs/specs/shlav-14-he.md v3, עבודה 2; the model
 * hakzaa-model.js). In the carpenters' yard (BOOK.s14.yard: the wood chamber of the women's court, outside the Azarah: no iron in
 * the House). A fixed view: about 45° over and 15° off the side, the board 300 dp long on the screen (3 m in the world: 100 dp a metre),
 * the plane 140 dp with its two handles at its ends and the depth wheel on a post over its middle.
 *   · the work hand: the first finger on either handle pushes the plane along the board away from that handle (its travel 0 … 160
 *     dp); drawn back toward the hand, the plane rides lifted and does not cut (the grain's other way = the other handle);
 *   · the helper: the other handle; dragged across the board it sets the skew (±8° at ±40 dp; level 1: none, the hand is a bonus);
 *   · level 3: the work finger dragged across leans the plane onto one edge (the twist);
 *   · the depth wheel: a tap = the next notch (fine → medium → deep → fine), a drag along it = a notch per 28 dp; only between strokes;
 *   · nothing held to keep a state: the plane rests on the board where it was left, the wheel keeps its notch.
 * The camera never moves while a finger is down. Juice: the curled chip (one long chip when clean), the creak turning to a hiss, the
 * charcoal fading cell by cell, the clean tone and the wood's sheen when the board is flat; the board rises to the House. */
import { BOOK } from '../world/grid.js';
import * as K from './hakzaa-model.js';
import { WORDS } from './model.js';
import { mats14, box } from './look.js';
import { award, extra, hurt, finish, V3, lens, voices14, ring, HANDS, dp, fingers } from './kit14.js';

const S14 = BOOK.s14, YD = S14.yard, HK = K.HK;
export const HT = Object.freeze({ HANDLE: 56, WHEEL: 56, SKEW_DP: 40, LEAN_DP: 35, LEAN_LOCK: 24, NOTCH_DP: 28, TAP: 0.25, TAP_DP: 12, FOV: 40, EL: 45, SIDE: 15 });
const RAD = Math.PI / 180, M_DP = 0.01, WH = [0, 1.25, -0.36];   // (the wheel on its post, over the plane's middle and back)   // (a board dp in metres)
const NAMES = K.NAMES;

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices14(X), Mt = mats14(X);
  const root = new T.Group(); root.name = 'h137-hakzaa-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, work: null, helper: null, wheel: null, lift: 0, chip: null, chips: [], sheen: 0 };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 30) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── the yard: the bench, the trestles, the pile, the chips' heap (the world's yard is built by the stage; the act's own things here)
  const FL = YD.floor, BX = YD.bench.x, BZ = YD.bench.z, TOP = FL + YD.bench.h;
  const bench = new T.Group(); root.add(bench);
  for (const s of [-1, 1]) {
    box(X, Mt.y14woodD, BX + s * 1.1 - 0.12, FL, BZ - 0.55, BX + s * 1.1 + 0.12, TOP - 0.1, BZ - 0.4, bench);
    box(X, Mt.y14woodD, BX + s * 1.1 - 0.12, FL, BZ + 0.4, BX + s * 1.1 + 0.12, TOP - 0.1, BZ + 0.55, bench);
    box(X, Mt.y14wood, BX + s * 1.1 - 0.2, TOP - 0.1, BZ - 0.6, BX + s * 1.1 + 0.2, TOP, BZ + 0.6, bench);   // (the two trestles' tops)
  }
  const pileG = new T.Group(); root.add(pileG);
  const chipHeap = new T.Group(); root.add(chipHeap);
  // ── the board: its body, the charcoal (per cell and lane, the three stripes), the grain's arrows, the knots, the scars
  const BL = HK.BOARD * M_DP, BW = 0.9, x0 = BX - BL / 2;
  const boardG = new T.Group(); root.add(boardG);
  let body = null, coal = [], scarG = null, arrows = [], sticks = [];
  const cellX = (c) => x0 + (HK.PLANE / 2 + (c + 0.5) * HK.TRAVEL / HK.N) * M_DP;
  const laneZ = (l) => BZ + (l - 1) * BW / 3;
  const thickM = () => 0.08 + 0.006 * K.thick(S.b);   // (a little thicker board shows; the gauge reads the difference)
  function buildBoard() {
    for (let i = boardG.children.length - 1; i >= 0; i--) boardG.remove(boardG.children[i]);
    boardG.position.set(0, 0, 0); boardG.visible = true;
    const th = thickM();
    body = box(X, Mt.y14plank, x0, TOP, BZ - BW / 2, x0 + BL, TOP + th, BZ + BW / 2, boardG);
    coal = [];
    const cg = new T.PlaneGeometry(HK.TRAVEL / HK.N * M_DP * 0.98, BW / 3 * 0.86);
    for (let c = 0; c < HK.N; c++) {
      const inStripe = (c >= 3 && c < 6) || (c >= 9 && c < 12) || (c >= 15 && c < 18);
      const row = [];
      for (let l = 0; l < 3; l++) {
        if (!inStripe) { row.push(null); continue; }
        const q = new T.Mesh(cg, Mt.y14charcoal.clone()); q.rotation.x = -Math.PI / 2; q.position.set(cellX(c), TOP + th + 0.004, laneZ(l)); q.renderOrder = 2; boardG.add(q); row.push(q);
      }
      coal.push(row);
    }
    // the grain's arrows (every fourth cell: its grain), faint; the knots dark
    arrows = [];
    const ag = new T.ConeGeometry(0.05, 0.16, 3);
    for (let c = 1; c < HK.N; c += 4) {
      const a = new T.Mesh(ag, Mt.y14woodD); a.rotation.set(0, 0, -Math.PI / 2 * S.b.g[c]); a.position.set(cellX(c), TOP + th + 0.01, BZ + BW / 2 - 0.08); a.scale.set(1, 1, 0.3); boardG.add(a); arrows.push(a);
      const a2 = a.clone(); a2.position.z = BZ - BW / 2 + 0.08; boardG.add(a2); arrows.push(a2);
    }
    for (const c of S.b.knot) {
      const k = new T.Mesh(new T.CircleGeometry(0.07, 10), Mt.y14scar); k.rotation.x = -Math.PI / 2; k.scale.set(1.6, 1, 1); k.position.set(cellX(c) + (c % 2 ? 0.04 : -0.04), TOP + th + 0.006, BZ + 0.05); boardG.add(k);
    }
    scarG = new T.Group(); boardG.add(scarG);
    for (const c of S.b.scars) scar(c);
    // level 3: the winding sticks at the board's two ends (their tilt shows the twist)
    sticks = [];
    if (lv === 3) for (const e of [0, 1]) { const s = box(X, Mt.y14woodD, -0.03, 0, -BW / 2 - 0.1, 0.03, 0.06, BW / 2 + 0.1, boardG); s.position.set(e ? x0 + BL - 0.18 : x0 + 0.18, TOP + th + 0.06, BZ); sticks.push(s); }
  }
  function scar(c) { const s = box(X, Mt.y14scar, cellX(c) - 0.07, TOP + thickM(), BZ - BW / 2 + 0.05, cellX(c) + 0.08, TOP + thickM() + 0.01, BZ + BW / 2 - 0.12, scarG); s.rotation.y = 0.12; }
  function paintCoal() {
    const ch = S.b.e;
    for (let c = 0; c < coal.length; c++) for (let l = 0; l < 3; l++) { const q = coal[c][l]; if (!q) continue; const v = Math.min(1, ch[l][c] / 0.9); q.material.opacity = v < 0.02 ? 0 : 0.18 + 0.8 * v; q.visible = v >= 0.02; }
    if (sticks.length) { const a = S.b.e[0][1] - S.b.e[2][1], b = S.b.e[0][HK.N - 2] - S.b.e[2][HK.N - 2]; sticks[0].rotation.x = a * 0.12; sticks[1].rotation.x = b * 0.12; }
  }
  // ── the plane: its body (140 dp), the rear and front handles, the depth wheel on its post
  const plane = new T.Group(); root.add(plane);
  const PL = HK.PLANE * M_DP;
  box(X, Mt.y14woodD, -PL / 2, 0, -0.14, PL / 2, 0.2, 0.14, plane);
  box(X, Mt.y14wood, -PL / 2 + 0.05, 0.2, -0.11, PL / 2 - 0.05, 0.26, 0.11, plane);
  const hA = box(X, Mt.y14wood, -PL / 2 + 0.02, 0.2, -0.07, -PL / 2 + 0.2, 0.46, 0.07, plane);   // (the handle at the −x end)
  const hB = box(X, Mt.y14wood, PL / 2 - 0.2, 0.2, -0.07, PL / 2 - 0.02, 0.46, 0.07, plane);     // (the handle at the +x end)
  const post = box(X, Mt.y14woodD, -0.03, 0.235, -0.21, 0.03, 1.275, -0.15, plane); post.rotation.x = -Math.atan2(WH[2] * -1, WH[1] - 0.26);   // (leaning back: the wheel ≥ 20 dp clear of both handles' targets on the screen)
  const wheel = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.06, 18), Mt.y14woodL); wheel.rotation.x = Math.PI / 2; wheel.position.set(0, WH[1], WH[2]); plane.add(wheel);
  const notch = box(X, Mt.y14dark, -0.02, 0, -0.035, 0.02, 0.2, 0.035, wheel); notch.position.set(0, 0.04, 0); notch.rotation.set(Math.PI / 2, 0, 0);
  const capA = box(X, Mt.y14handR, -0.06, 0.46, -0.06, 0.06, 0.5, 0.06, plane); capA.position.x = -PL / 2 + 0.11;
  const capB = box(X, Mt.y14handL, -0.06, 0.46, -0.06, 0.06, 0.5, 0.06, plane); capB.position.x = PL / 2 - 0.11;
  void post;
  const rings = { work: ring(HANDS.R), helper: ring(HANDS.L) };
  // the depth's word under the wheel (three names, no millimetres), and level 3's gauge
  const ui = (cls, css) => { try { const d = document.createElement('div'); d.className = 'h109-ui ' + cls; d.style.cssText = css; document.body.appendChild(d); return d; } catch (e) { return null; } };
  const depthEl = ui('h137-depth', 'position:fixed;z-index:4;pointer-events:none;transform:translate(-50%,0);font:600 13px system-ui;color:#3A2A18;background:#F6EAD2cc;border-radius:8px;padding:1px 8px');
  // the speed strip under the depth's word while a stroke runs: clean (green) to 240, the chip breaks (amber) to 300, a tear (red) past
  const VMAXB = 360, speedEl = ui('h137-speed', 'position:fixed;z-index:4;pointer-events:none;transform:translate(-50%,0);width:96px;height:9px;border-radius:5px;border:1.5px solid #5A3A1E;display:none;'
    + `background:linear-gradient(90deg,#7CC86A 0 ${100 * HK.CLEAN_V / VMAXB}%,#F0B848 0 ${100 * HK.TEAR_V / VMAXB}%,#D9563A 0)`);
  const speedMk = speedEl ? (() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;top:-4px;width:4px;height:15px;margin-left:-2px;background:#2A1A0C;border-radius:2px'; speedEl.appendChild(d); return d; })() : null;
  const twistOf = () => { try { const e = S.b.e; return e[0].reduce((a, v) => a + v, 0) - e[2].reduce((a, v) => a + v, 0); } catch (er) { return 0; } };
  let twist0 = null;
  const gaugeEl = lv === 3 ? ui('h137-gauge', 'position:fixed;z-index:4;pointer-events:none;right:14px;top:70px;width:22px;height:120px;border-radius:6px;background:#F6EAD2cc;border:2px solid #7A4E2C') : null;
  const gaugeMk = gaugeEl ? (() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:-4px;width:26px;height:4px;background:#7A2E1A;border-radius:2px'; gaugeEl.appendChild(d); const band = document.createElement('div'); band.style.cssText = `position:absolute;left:0;width:22px;top:${60 - 60 * HK.GAUGE / 1.0}px;height:${120 * HK.GAUGE / 1.0}px;background:#9EE08A88`; gaugeEl.appendChild(band); return d; })() : null;
  try { X.kohen(false); } catch (e) { /* (the board and the plane only: the hands are the player's) */ }
  // ── the view: fixed (45° over, 15° off the side), the board 300 dp: the distance that makes a metre 100 dp at this lens
  const cam0 = X.camera, fov0 = cam0.fov;
  const D = 360 / (200 * Math.tan(HT.FOV / 2 * RAD));
  const aim = [BX, TOP + 0.55, BZ - 0.1];   // (the board low in the frame: the wheel clear of the top bar)
  const eye = [aim[0] + D * Math.cos(HT.EL * RAD) * Math.sin(HT.SIDE * RAD), aim[1] + D * Math.sin(HT.EL * RAD), aim[2] + D * Math.cos(HT.EL * RAD) * Math.cos(HT.SIDE * RAD)];
  function view(d = 0.6) { lens(X, HT.FOV); X.shot(eye, aim, d); }
  // ── screen helpers: the board's axis on the screen, a point's board dp along it and across it
  const scr = (x, y, z) => { try { const r = X.scr(x, y, z); return { x: r.x, y: r.y }; } catch (e) { return { x: innerWidth / 2, y: innerHeight / 2 }; } };
  function axis() {
    const a = scr(x0, TOP, BZ), b = scr(x0 + BL, TOP, BZ), L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { a, ux: (b.x - a.x) / L, uy: (b.y - a.y) / L, k: L / HK.BOARD };   // (k: screen px per board dp)
  }
  const along = (f, ax = axis()) => ((f.x - ax.a.x) * ax.ux + (f.y - ax.a.y) * ax.uy) / ax.k;
  const across = (f, ax = axis()) => (-(f.x - ax.a.x) * ax.uy + (f.y - ax.a.y) * ax.ux);   // (screen px)
  const planeX = () => x0 + (HK.PLANE / 2 + S.p) * M_DP;
  const handleAt = (end) => { const v = new T.Vector3(end ? PL / 2 - 0.11 : -PL / 2 + 0.11, 0.42, 0); plane.localToWorld(v); return scr(v.x, v.y, v.z); };
  const wheelAt = () => { const v = new T.Vector3(0, WH[1], WH[2]); plane.localToWorld(v); return scr(v.x, v.y, v.z); };
  const inBox = (f, c, n) => Math.abs(f.x - c.x) <= dp(n) / 2 + dp(4) && Math.abs(f.y - c.y) <= dp(n) / 2 + dp(4);
  const onHandle = (f) => (inBox(f, handleAt(0), HT.HANDLE) ? 0 : inBox(f, handleAt(1), HT.HANDLE) ? 1 : -1);
  const onWheel = (f) => inBox(f, wheelAt(), HT.WHEEL);
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy || S.phase !== 'plane') return;
      if (f.button === 2) { if (!A.helper && A.work) { A.helper = { id: f.id, end: 1 - A.work.end, c0: across(f), c: across(f) }; ev('helper:mouse'); } return; }
      const h = onHandle(f);
      if (!A.work && h >= 0) { const ax = axis(); A.work = { id: f.id, end: h, g: along(f, ax) - S.p, c0: across(f, ax), c: across(f, ax), x: f.x, y: f.y }; X.hand(null); ev('work:' + h); return; }
      if (A.work && !A.helper && h === 1 - A.work.end) { A.helper = { id: f.id, end: h, c0: across(f), c: across(f) }; ev('helper'); return; }
      if (!A.wheel && onWheel(f) && !S.stroke) { A.wheel = { id: f.id, x0: f.x, y0: f.y, t0: A.t, moved: 0, n: 0 }; ev('wheel'); }
    },
    move(f) {
      if (A.work && f.id === A.work.id) { A.work.x = f.x; A.work.y = f.y; A.work.c = across(f); }
      if (A.helper && f.id === A.helper.id) A.helper.c = across(f);
      if (A.wheel && f.id === A.wheel.id) {
        const d = (f.y - A.wheel.y0) + (f.x - A.wheel.x0) * 0.3; A.wheel.moved = Math.max(A.wheel.moved, Math.hypot(f.x - A.wheel.x0, f.y - A.wheel.y0));
        const n = Math.trunc(-d / dp(HT.NOTCH_DP)); if (n !== A.wheel.n && !S.stroke) { setDepth(S.depth + (n - A.wheel.n)); A.wheel.n = n; }
      }
    },
    up(f) {
      if (A.work && f.id === A.work.id) { A.work = null; if (A.helper && A.helper.id !== -1) { /* (the helper stays on its handle: the skew it set) */ } }
      if (A.helper && f.id === A.helper.id) A.helper = null;
      if (A.wheel && f.id === A.wheel.id) { if (A.wheel.moved < dp(HT.TAP_DP) && A.t - A.wheel.t0 < 0.6 && !A.wheel.n && !S.stroke) setDepth((S.depth + 1) % 3); A.wheel = null; }
    },
  });
  let wantDepth = null;
  function setDepth(d) { wantDepth = Math.max(0, Math.min(2, d)); }
  function input() {
    const out = { hold: false, free: !A.work && !A.helper && !A.wheel && FG.n === 0 };
    if (A.feed) return A.feed(S, out);   // (the probes' bot)
    if (wantDepth != null) { out.depth = wantDepth; wantDepth = null; }
    if (A.work) {
      const ax = axis(); out.hold = true; out.p = along({ x: A.work.x, y: A.work.y }, ax) - A.work.g;
      // the push is away from the handle held (the −x handle pushes toward +x); drawn back, the plane rides lifted
      const push = A.work.end ? -1 : 1, d = out.p - S.p;
      if (d * push < -0.5 && (!S.stroke || !S.stroke.dir)) out.lift = true;
      // level 3's lean: set by the finger's sideways press in the first stretch of a stroke, then held for the rest of it (the push
      // and the lean never fight: build 137 review)
      if (lv === 3) {
        const lean = Math.max(-1, Math.min(1, (A.work.c - A.work.c0) / dp(HT.LEAN_DP)));
        if (!S.stroke) A.work.lock = null;
        else if (A.work.lock == null && Math.abs(S.p - S.stroke.p0) > HT.LEAN_LOCK) A.work.lock = lean;
        out.lean = A.work.lock != null ? A.work.lock : lean;
      }
    }
    if (A.helper) { out.two = true; if (lv > 1) out.skew = Math.max(-HK.SKEW_MAX, Math.min(HK.SKEW_MAX, (A.helper.c - A.helper.c0) / dp(HT.SKEW_DP) * HK.SKEW_MAX)) * (A.helper.end ? 1 : -1); }
    return out;
  }
  const at = () => V3(X, planeX(), TOP + 0.4, BZ);
  // ── the chip: grows at the plane's mouth while it cuts; a long one when clean, pieces when it breaks
  function chipGrow(dt, cutting) {
    if (!cutting) return;
    if (!A.chip) { const c = new T.Mesh(new T.TorusGeometry(0.07, 0.012, 3, 14, Math.PI * 1.2), Mt.y14chip); c.userData.len = 0; root.add(c); A.chip = c; }
    const c = A.chip; c.userData.len += dt; const k = Math.min(2.6, 1 + c.userData.len * 1.4);
    c.scale.set(k, k, 1); c.position.set(planeX() + (S.dir || 1) * 0.05, TOP + 0.3 + 0.03 * k, BZ - 0.02); c.rotation.set(0, Math.PI / 2, A.t * 4);
  }
  function chipDrop(whole) {
    const c = A.chip; A.chip = null; if (!c) return;
    if (!whole) { root.remove(c); try { X.dust(planeX(), TOP + 0.4, BZ, 6, 1); } catch (e) { /* */ } return; }
    A.chips.push({ m: c, t: 0, v: new T.Vector3(0.4, 1.2, 0.9) });
  }
  function handle(e) {
    if (e.k === 'depth') { V.click(); try { X.haptic && X.haptic(8); } catch (er) { /* */ } ev('depth:' + e.d); }
    else if (e.k === 'stroke') { ev('stroke'); twist0 = twistOf(); }
    else if (e.k === 'chip') { ev('chip'); chipDrop(false); }
    else if (e.k === 'pass') {
      ev('pass:' + e.n + (e.long ? ':long' : '')); chipDrop(e.long); V.plane(0, true);
      // level 3: each pass says what it did to the twist (the passes differ by what they fix, not only by their number)
      if (lv === 3 && e.pass && twist0 != null) { const t1 = twistOf(), a0 = Math.abs(twist0), a1 = Math.abs(t1); const w = a1 < 0.15 ? 'הפיתול יושר' : a1 < a0 - 0.05 ? 'הפיתול קטן' : a1 > a0 + 0.05 ? 'הפיתול גדל: הטו לצד השני' : 'הפיתול לא זז: הטו את המקצוע אל הצד הגבוה'; try { X.line(w, 1500); } catch (er) { /* */ } }
    }
    else if (e.k === 'nostroke') { chipDrop(false); V.plane(0, true); }
    else if (e.k === 'small') { V.tear(); ev('small'); }
    else if (e.k === 'tear') {
      V.tear(); ev('tear:' + e.c + ':' + e.why);
      hurt(X, Mo, 'hakzaa.tear', at(), { lv, at: S.k });
      if (e.c >= 0) scar(e.c);
    } else if (e.k === 'free') { V.tear(); ev('free'); try { X.line(e.why === 'thin' ? 'ניסוי חינם: הלוח נעשה דק מדי. פחות מעברים עמוקים' : 'ניסוי חינם: עמוק נגד הסיבים או ליד קשר קורע. הפכו כיוון או גלגלו לדק', 2800); } catch (er) { /* */ } }
    else if (e.k === 'reject') { ev('reject'); V.board(); addPile(true); buildBoard(); }
    else if (e.k === 'gauge') { ev('gauge'); try { X.line('הלוח עבה מבן־זוגו: עוד מעבר דק', 1800); } catch (er) { /* */ } }
    else if (e.k === 'board-done') {
      ev('board:' + e.grade);
      award(X, at(), e.grade, lv, 'קרש');
      if (lv === 1 && e.two) extra(X, 10, lv, 'two', 'שתי ידיים');
      if (e.grade === 'gold') V.clean(); else V.right();
      A.sheen = 1; A.lift = 0.001; addPile(false);
      { const P = (Mo.st.planks = Mo.st.planks || []); P.push({ i: e.i, lv, scars: S.b.scars.slice() }); if (P.length > 24) P.splice(0, P.length - 24); }   // (his boards: the nesarim in the ceiling)
      keep();
    } else if (e.k === 'board') { ev('board' + e.i); V.board(); buildBoard(); A.lift = 0; paintCoal(); keep(); }
    else if (e.k === 'done') { ev('done'); done(); }
  }
  function addPile(rejected) {
    const n = pileG.children.length, [px, pz] = YD.pile;
    const p = box(X, rejected ? Mt.y14woodD : Mt.y14plank, px - 1.5, FL + 0.1 + n * 0.1, pz - 0.45, px + 1.5, FL + 0.18 + n * 0.1, pz + 0.45, pileG); p.rotation.y = Math.PI / 2 + (n % 2 ? 0.04 : -0.03);
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    const res = K.result(S);
    if (res.bonus) extra(X, 40, lv, 'work', 'כל הקרשים ישרים');
    Mo.keep(m.k, null); X.save();
    await X.wait(1.0);
    const fe = [BX + 4, TOP + 6, BZ + 7], fa = [BX, TOP, BZ];
    await finish(X, A, res, WORDS.hakzaa, V3(X, BX, TOP + 1, BZ), { eye: fe, aim: fa, secs: 1.4, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn || lv > 1) return; A.hintOn = 1; try { const v = new T.Vector3(-PL / 2 + 0.11, 0.46, 0); plane.localToWorld(v); X.hand({ x: v.x, y: v.y, z: v.z }, 0, 40); } catch (e) { /* */ } }
  function draw(dt) {
    // the plane on the board where it was left; its skew
    const th = thickM();
    plane.position.set(planeX(), TOP + th + (A.lift ? 0 : 0), BZ); plane.rotation.set(lv === 3 ? S.lean * 0.05 : 0, S.skew * RAD, 0);
    notch.parent.rotation.set(Math.PI / 2, [0, 2.1, 4.2][S.depth], 0);
    paintCoal();
    // the board done: it rises to the House (the model waits 0.9 s), the sheen
    if (A.lift) { A.lift += dt; boardG.position.y = Math.min(6, A.lift * A.lift * 9); plane.visible = A.lift < 0.25; }
    else { boardG.position.y = 0; plane.visible = true; }
    if (A.sheen > 0) { A.sheen = Math.max(0, A.sheen - dt * 1.2); if (body) body.material = A.sheen > 0.2 ? Mt.y14woodL : Mt.y14plank; }
    // the chip's life
    const cutting = !!S.stroke && S.v > 5 && S.stroke.cut > 0.01;
    chipGrow(dt, cutting);
    for (let i = A.chips.length - 1; i >= 0; i--) { const c = A.chips[i]; c.t += dt; c.v.y -= 6 * dt; c.m.position.addScaledVector(c.v, dt); if (c.m.position.y < FL + 0.05) { c.m.position.y = FL + 0.05; c.v.set(0, 0, 0); } if (c.t > 1.4) { A.chips.splice(i, 1); root.remove(c.m); if (chipHeap.children.length < 24) { const h = c.m.clone(); h.position.set(YD.chips[0] + (chipHeap.children.length % 5) * 0.18, FL + 0.05, YD.chips[1] + Math.floor(chipHeap.children.length / 5) * 0.16); chipHeap.add(h); } } }
    // the plane's voice: a creak by speed when rough, a hiss when smooth
    if (S.stroke && S.v > 5) { const smooth = S.depth === 0 || (S.v <= HK.CLEAN_V && !S.small); V.plane(Math.min(1, S.v / 260) * (S.depth === 2 ? 1 : 0.7), smooth); } else V.plane(0, true);
    // the thumbs' rings, the depth's word, the gauge
    if (A.work) { const p = handleAt(A.work.end); rings.work.show(p.x, p.y, Math.min(1, (S.v || 0) / HK.CLEAN_V), (S.v || 0) <= HK.CLEAN_V && !!S.stroke); } else rings.work.hide();
    if (A.helper) { const p = handleAt(A.helper.end); rings.helper.show(p.x, p.y, Math.abs(S.skew) / HK.SKEW_MAX, Math.abs(S.skew) >= HK.SKEW_OK); } else rings.helper.hide();
    if (depthEl) { const w = wheelAt(); depthEl.style.left = (w.x + dp(58)) + 'px'; depthEl.style.top = (w.y - dp(10)) + 'px'; depthEl.textContent = NAMES[S.depth]; depthEl.style.display = S.phase === 'plane' && !A.finished ? 'block' : 'none'; }
    if (speedEl) { const on = !!S.stroke && S.phase === 'plane' && !A.finished; speedEl.style.display = on ? 'block' : 'none'; if (on) { const w = wheelAt(); speedEl.style.left = (w.x + dp(58)) + 'px'; speedEl.style.top = (w.y + dp(14)) + 'px'; speedMk.style.left = (100 * Math.min(1, (S.v || 0) / VMAXB)) + '%'; } }
    if (gaugeMk) { const o = K.thickOver(S); gaugeMk.style.top = (60 - 60 * Math.max(-1, Math.min(1, o == null ? 0 : o)) - 2) + 'px'; gaugeEl.style.opacity = o == null ? 0.4 : 1; }
  }
  return {
    close: true, kohenWorks: false,
    begin() {
      FG.attach(); buildBoard(); for (const s of S.pile) { void s; addPile(!!s.rejected); } view(0.01);
      X.line(resumed ? '' : lv === 1 ? 'גררו את המקצוע מהידית לאורך הלוח, עם חצי הסיבים. כשהפחם נעלם, הלוח ישר' : lv === 2 ? 'באמצע הלוח הסיבים מתהפכים ויש קשר. הגלגל קובע עומק, היד השנייה מטה את המקצוע' : 'זוגות: השני כמו הראשון בעובי. הלוח מעוקם: הטו את היד לצד הגבוה', resumed ? 0 : 5200);
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        if (!A.busy && !A.finished) {
          const inp = input();
          const evs = K.step(S, Math.min(dt, 1 / 30), inp);
          for (const e of evs) handle(e);
        }
        draw(dt);
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h137] hakzaa', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.work = null; A.helper = null; A.wheel = null; keep(); },
    wants(p) { if (!p) return true; if (A.work || A.helper || A.wheel) return true; return onHandle(p) >= 0 || onWheel(p); },
    holds() { return !!(A.work || A.helper || A.wheel); },
    lensFov: HT.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); V.stop(); X.hand(null); lens(X, fov0);
      for (const r of Object.values(rings)) r.remove();
      try { depthEl && depthEl.remove(); speedEl && speedEl.remove(); gaugeEl && gaugeEl.remove(); } catch (e) { /* */ }
      try { X.kohen(true); } catch (e) { /* */ }
      X.props.remove(root);
    },
    at,
    dbg() {
      const r = (v) => Math.round(v), h0 = handleAt(0), h1 = handleAt(1), w = wheelAt(), ax = axis();
      return { id: m.id, lv, finished: A.finished, busy: A.busy, phase: S.phase, k: S.k, passes: S.passes, depth: S.depth, p: +S.p.toFixed(1), skew: +S.skew.toFixed(1), ex: +K.excess(S.b).toFixed(3), steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.length, done: S.done,
        hA: [r(h0.x), r(h0.y)], hB: [r(h1.x), r(h1.y)], wheel: [r(w.x), r(w.y)], pxPerDp: +(ax.k / dp(1)).toFixed(3), work: !!A.work, helper: !!A.helper, ev: A.ev.slice(-12) };
    },
    probe() { return { S, K, A }; },
  };
}
export const HAKZAA_ACT = { icon: '🪵', title: 'הקצעת קרשי התקרה', walkLine: () => 'הקצעת קרשי התקרה: אל חצר הנגרים, מחוץ לעזרה', stand() { return { x: YD.stand[0], z: YD.stand[1], face: YD.face }; }, prepare() {}, make };
