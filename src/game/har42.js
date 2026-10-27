/* ── fable32 (build 42) ── har42.js — the new Phase A, stage 01 "שיטוח ההר", end to end (docs/specs/shlav-alef-v2-he.md §10-01, §7, §9;
 * shlav-alef-bimui-he.md §1–§4; shlav-alef-hard-fun-he.md §1, §5). It takes the Mount's stage over while it is not done: the old stage's
 * taps (measure, dig), its paid finishing ("🪙 לשלם"), its separate check, its card chain and its "steel tools" card are not played; the
 * stages after it (02–15) play as before. The parts, in order:
 *   open   — the flyover: dawn, from over the Mount of Olives, the whole mountain, the gold plan of the platform unrolling, a slow orbit and
 *            the dive to the work (the first time ~16 s; later 3 s, with a skip)
 *   rope   — measuring by walking the rope: held, he walks it to the far peg ("חמש מאות אמה", מדות ב, א)
 *   lift   — the treadwheel lifts the first corner stone (LIFT; ויטרוביוס י, ב — המחשה)
 *   rock0…2 — reading the rock (INSPECT): 1 a clear line, 2 faint, 3 two lines and one with the layers (המחשה)
 *   course0, course1 — his hand stones in a course (PLACE) while the crews lay the rest before his eyes; a pull-back at each course's end
 *   roll   — the great stone on rollers: the crew's chant sets the tempo; the freed roller dragged to the front (המחשה; the great course
 *            stone of the Western Wall tunnels — the game's card)
 *   pave   — the last paving slabs: sizes that fill each row exactly
 *   trace  — "לבית התקיעה", traced on the parapet stone (Mazar 1968)
 *   reveal — the crane up from the last slab to the whole smooth plaza, the opening's rock for a moment first (before / after); one card
 * Input as in Phase B: hold anywhere → he walks to the next place (build 39's guide, guide39); the act's touch on the thing (build 40's
 * touch40); no stick (the developer's flag ?stick=1 keeps the old Phase A). The materials by day (§9: fam42 caravan42). The camera: the
 * object near the right hand, him ≤ 45 % of the height (twin.js pan40 / CAM41), frozen while a finger is on the thing.
 * Its own save: localStorage bh_har42. Developer flags: ?har42=0 (the old stage), ?h42at=<part>, ?h42day=<days ahead>, ?h42stock=<n>.
 * Every text "טיוטה" + its source, or "המחשה". Never a Divine Name. ── /fable32 ── */
import * as THREE from 'three';
import { createGuide39 } from '../avodah/shift/guide39.js';
import { walk39, pan40, CAM41, HERO41 } from './twin.js';
import { createTouch40 } from '../avodah/shift/touch40.js';
import { buzz42 } from '../avodah/shift/prefs28.js';
import { RATE30 } from '../avodah/shift/rate30.js';
import * as F from './fam42.js';

export const H42KEY = 'bh_har42';
export const PARTS42 = Object.freeze(['open', 'rope', 'lift', 'rock0', 'rock1', 'rock2', 'course0', 'course1', 'roll', 'pave', 'trace', 'reveal']);
/** the parts' families (for the grades' levels) and their materials (fam42 MAT42.cost) */
const FAMOF = { lift: 'lift', rock0: 'inspect', rock1: 'inspect', rock2: 'inspect', course0: 'place', course1: 'place', roll: 'place', pave: 'place', trace: 'place' };
const MATOF = { lift: 'lift', rock0: 'rock', rock1: 'rock', rock2: 'rock', course0: 'stone', course1: 'stone', roll: 'roll', pave: 'pave' };
/** the lines (short; each with its source, or המחשה) */
export const LINE42 = Object.freeze({
  rope: 'מחזיקים — הולכים עם החבל ליתד הרחוקה · "חמש מאות אמה" (מדות ב, א) · טיוטה',
  walk: 'מחזיקים — הולכים אל העבודה הבאה',
  lift: 'החזיקו — הולכים בתוך הגלגל; שחררו מוקדם — האבן ממשיכה מעט · גלגל דריכה: ויטרוביוס י, ב · המחשה',
  lift2: 'גררו מטה — מורידים מעט',
  sweep: 'גררו על הסלע — האור עובר; בזווית נמוכה מופיע קו השכבה · המחשה',
  wedge: 'הקישו על הקו — יתדות עץ, במרווחים שווים · המחשה',
  pour: 'החזיקו — מים על היתדות, הסדק רץ; שחררו כשהוא מגיע לסוף · המחשה',
  two: 'שני קווים — רק אחד הולך עם השכבות · המחשה',
  place: 'גררו אבן לנדבך והחזיקו רגע — שתתיישב; אף חיבור לא מעל חיבור · "אריח על גבי לבנה" (מגילה טז ע"ב) · טיוטה',
  roll: 'גררו את הגליל שהשתחרר מאחור — אל החזית, לפני שהאבן מגיעה לסוף · המחשה',
  pave: 'גררו לוחות בגדלים שימלאו כל שורה בדיוק · המחשה',
  trace: 'גררו לאורך הנקודות — "לבית התקיעה" (חפירות ב. מזר, 1968) · טיוטה',
  courseEnd: 'הנדבך הושלם — הצוותים ממשיכים',
  out: 'מחר: שיירת אבנים מהמחצבה · אלף עגלות הביאו אבנים (קדמוניות טו 390) · טיוטה',
  caravan: 'הבוקר הגיעה שיירה · אלף עגלות הביאו אבנים (קדמוניות טו 390) · טיוטה',
});
const CSS = `.h42{position:fixed;inset:0;z-index:40;pointer-events:none;direction:rtl;font-family:Heebo,system-ui,sans-serif}
.h42-walk{position:fixed;inset:0;z-index:41;pointer-events:auto;touch-action:none}
.h42-pad{position:fixed;top:0;bottom:0;left:51%;right:0;z-index:45;touch-action:none;pointer-events:auto;display:none}.h42-pad.on{display:block}
.h42-line{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);max-width:78vw;z-index:47;padding:5px 14px;border-radius:14px;background:rgba(28,20,10,.82);color:#FFF4DC;font:800 14px/1.3 Heebo,system-ui,sans-serif;text-align:center;pointer-events:none}
.h42-line small{display:block;font:600 11px/1.2 Heebo,system-ui,sans-serif;opacity:.8}
.h42-mat{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:calc(env(safe-area-inset-right,0px) + 10px);z-index:47;min-height:44px;box-sizing:border-box;padding:4px 10px;border-radius:14px;background:rgba(28,20,10,.78);color:#FFE6A0;font:900 15px/1.2 Heebo,system-ui,sans-serif;display:flex;align-items:center;gap:4px;pointer-events:none}
.h42-pile{position:fixed;right:calc(env(safe-area-inset-right,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:46;display:flex;gap:8px;pointer-events:auto}
.h42-it{min-width:52px;min-height:48px;padding:4px 8px;border-radius:10px;border:2px solid #E2B65A;background:linear-gradient(#D9CBB0,#B9A888);color:#3B2A12;font:900 15px/1 Heebo,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.h42-it.drag{position:fixed;z-index:60;pointer-events:none;opacity:.92}
.h42-it.no{animation:h42sh .32s}@keyframes h42sh{0%,100%{transform:translateX(0)}30%{transform:translateX(-7px)}70%{transform:translateX(7px)}}
.h42-g{position:fixed;left:0;top:0;z-index:48;pointer-events:none;font:900 24px/1 Heebo,system-ui,sans-serif;color:#FFD66E;text-shadow:0 2px 6px rgba(0,0,0,.7);transform:translate(-50%,-50%);animation:h42g 1.6s ease-out forwards}
@keyframes h42g{0%{opacity:0;margin-top:8px}15%{opacity:1}100%{opacity:0;margin-top:-40px}}
.h42-svg{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:44;pointer-events:none;overflow:visible}
.h42-meter{position:fixed;z-index:46;width:18px;height:110px;border-radius:9px;background:rgba(28,20,10,.6);border:2px solid #FFE6A0;overflow:hidden;pointer-events:none}
.h42-meter i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#9FD3F0,#3C8DC4)}.h42-meter b{position:absolute;left:-2px;right:-2px;background:rgba(255,214,110,.55);border-top:2px solid #FFD66E;border-bottom:2px solid #FFD66E}.h42-meter u{position:absolute;left:-4px;right:-4px;height:3px;background:#fff;opacity:.85}
.h42-card{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(20,14,6,.55);pointer-events:auto}
.h42-card>div{max-width:min(420px,86vw);padding:16px 20px;border-radius:18px;background:#FBF3E2;color:#2A1804;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.h42-card h2{margin:0 0 6px;font:900 22px/1.2 Heebo,system-ui,sans-serif}.h42-card p{margin:4px 0;font:600 15px/1.35 Heebo,system-ui,sans-serif}.h42-card small{display:block;opacity:.7;font:600 11px/1.3 Heebo,system-ui,sans-serif}
.h42-card button{margin-top:10px;min-height:48px;min-width:140px;border-radius:14px;border:0;background:#C8923A;color:#2A1804;font:900 17px/1 Heebo,system-ui,sans-serif}
.h42-skip{position:fixed;left:calc(env(safe-area-inset-left,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:49;min-height:44px;min-width:88px;border-radius:14px;border:2px solid #FFE6A0;background:rgba(28,20,10,.8);color:#FFE6A0;font:900 15px/1 Heebo,system-ui,sans-serif;pointer-events:auto}
.h42-before{position:fixed;left:12px;top:56px;z-index:49;width:30vw;max-width:240px;border:3px solid #FFE6A0;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.5);pointer-events:none;transition:opacity .6s}
.h42-tag{position:fixed;z-index:50;padding:2px 8px;border-radius:8px;background:rgba(28,20,10,.82);color:#FFE6A0;font:900 13px/1.2 Heebo,system-ui,sans-serif;pointer-events:none}
body.h42-on .gm{display:none!important}`;

const ls = () => { try { return globalThis.localStorage || null; } catch (e) { return null; } };
const qs = (k) => { try { const m = new RegExp(`[?&]${k}=([^&#]*)`).exec(location.search || ''); return m ? decodeURIComponent(m[1]) : null; } catch (e) { return null; } };
export function load42() { try { const s = ls(); const v = s && JSON.parse(s.getItem(H42KEY) || 'null'); if (v && typeof v === 'object' && v.v === 1) return v; } catch (e) { /* */ } return { v: 1, part: 0, open: 0, fam: {}, mat: {}, grades: [], hands: 0, t0: Date.now() }; }
export function save42(S) { try { const s = ls(); if (s) s.setItem(H42KEY, JSON.stringify(S)); } catch (e) { /* not kept */ } }
/** the new stage 01 plays while the Mount is not done (and not under the developer's ?har42=0 / the old stick ?stick=1, nor the demo) */
export function wanted42(G, isDone) { if (!G || G.demo || isDone(G, 'har')) return false; if (qs('har42') === '0' || qs('stick') === '1' || globalThis.__H42_OFF) return false; return true; }

/* ───────── the director ───────── */
export function createHar42(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const st = { on: false, part: null, t: 0, last: 0, hold: null, drag: null, finger: 0, cam: null, camLock: null, ui: {}, props: {}, job: null, out: false, done: false, snapshot: null, pending: null };
  const S = load42();
  const stages = o.stages, view = o.view;
  const scene = () => (o.scene && o.scene()) || (globalThis.__T && globalThis.__T.scene) || null;
  const camera = () => (globalThis.__T && globalThis.__T.camera) || null;
  const hp = { x: 0, y: 0, z: 0, yaw: 0 };
  const hero = () => { try { stages.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const gy = (x, z) => { try { const y = stages.groundAt(x, z); return Number.isFinite(y) ? y : 20; } catch (e) { return 20; } };
  const proj = (x, y, z) => { try { const p = view.project(x, y, z); return p && p.on !== false ? { x: p.x, y: p.y } : null; } catch (e) { return null; } };
  const W = () => (typeof innerWidth === 'number' ? innerWidth : 844), H = () => (typeof innerHeight === 'number' ? innerHeight : 390);
  const now = () => performance.now() / 1000;
  // the places: around the Mount's work corner (the old stage's banker spot) — the rope's pegs, the wheel, the rocks, the course, the stone's run, the paving, the parapet
  const base = (() => { const w = o.spot ? o.spot() : null; return w && Number.isFinite(w.x) ? { x: w.x, z: w.z } : { x: -60, z: 60 }; })();
  const P = (dx, dz) => ({ x: base.x + dx, z: base.z + dz, get y() { return gy(this.x, this.z); } });
  const PL = { peg0: P(-14, 4), peg1: P(16, 4), wheel: P(10, -10), stone0: P(16, -10), rock: [P(-12, -14), P(-24, -6), P(-30, 8)], course: P(2, 16), roll0: P(-20, 24), roll1: P(4, 24), pave: P(18, 26), trace: P(30, 14) };
  const STAND = { rope: PL.peg1, lift: P(6, -10), rock0: P(-9, -12), rock1: P(-21, -4), rock2: P(-27, 10), course0: P(2, 12), course1: P(2, 12), roll: P(-8, 20), pave: P(28, 27), trace: P(27, 14) };   // (the paving from its east: from its south the act's camera stood behind the crews' course)

  /* ── the scene's props (simple shapes; המחשה) ── */
  const mat = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const STONE = mat('#CDBF9F'), ROCK = mat('#9C8F78'), WOOD = mat('#7A5A36');
  function props() {
    const sc = scene(); if (!sc || st.props.root) return;
    const g = new THREE.Group(); g.name = 'har42'; sc.add(g); st.props.root = g;
    const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
    // the rope's pegs and the rope
    st.props.peg0 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6, 6), WOOD), PL.peg0.x, PL.peg0.y + 0.8, PL.peg0.z);
    st.props.peg1 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6, 6), WOOD), PL.peg1.x, PL.peg1.y + 0.8, PL.peg1.z);
    const rg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); st.props.rope = add(new THREE.Line(rg, new THREE.LineBasicMaterial({ color: '#E8D9B0' })), 0, 0, 0);
    // the treadwheel and its stone
    const wh = new THREE.Group(); wh.add(new THREE.Mesh(new THREE.TorusGeometry(3, 0.25, 6, 20), WOOD)); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 6, 0.15), WOOD); s.rotation.z = (i * Math.PI) / 6; wh.add(s); }
    st.props.wheel = add(wh, PL.wheel.x, PL.wheel.y + 3.3, PL.wheel.z);
    st.props.stone0 = add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.2), STONE), PL.stone0.x, PL.stone0.y + 0.55, PL.stone0.z);
    st.props.boom = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 7, 0.2), WOOD), PL.stone0.x, PL.stone0.y + 3.5, PL.stone0.z - 0.8);
    // the rocks
    st.props.rocks = PL.rock.map((p, i) => { const m = add(new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 0), ROCK), p.x, p.y + 1.6, p.z); m.scale.set(1.3, 0.8, 1); m.rotation.y = i; return m; });
    // the course: the crews' stones below and in his course, and the slot
    st.props.course = new THREE.Group(); add(st.props.course, PL.course.x, PL.course.y, PL.course.z);
    // the great stone and its rollers
    st.props.big = add(new THREE.Mesh(new THREE.BoxGeometry(7, 2.2, 2.6), STONE), PL.roll0.x, PL.roll0.y + 1.6, PL.roll0.z);
    st.props.rollers = [0, 1, 2, 3].map((i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 8), WOOD); c.rotation.x = Math.PI / 2; return add(c, PL.roll0.x - 3 + i * 2, PL.roll0.y + 0.3, PL.roll0.z); });
    // the paving's rows
    st.props.pave = new THREE.Group(); add(st.props.pave, PL.pave.x, PL.pave.y + 0.05, PL.pave.z);
    // the parapet stone
    st.props.parapet = add(new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.4, 1), STONE), PL.trace.x, PL.trace.y + 0.7, PL.trace.z);
    // the gold plan of the platform (unrolling in the opening)
    const R = 140, c0 = { x: base.x - 40, z: base.z - 50 }, gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 }), C4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    st.props.plan = C4.map((a, i) => { const b = C4[(i + 1) % 4], x0 = c0.x + a[0] * R, z0 = c0.z + a[1] * R, x1 = c0.x + b[0] * R, z1 = c0.z + b[1] * R, L = Math.hypot(x1 - x0, z1 - z0); const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.6, 2.4), gm); m.geometry.translate(L / 2, 0, 0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.scale.x = 0.001; return add(m, x0, gy(x0, z0) + 2, z0); });
  }
  function dropProps() { try { const g = st.props.root; if (g && g.parent) g.parent.remove(g); } catch (e) { /* */ } st.props = {}; }

  /* ── the DOM ── */
  const el = (cls, html = '', tag = 'div') => { const e = doc.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; };
  function ui() {
    if (!doc || st.ui.root) return;
    if (!doc.getElementById('h42-css')) { const s = doc.createElement('style'); s.id = 'h42-css'; s.textContent = CSS; doc.head.appendChild(s); }
    const r = el('h42'); doc.body.appendChild(r); st.ui.root = r;
    st.ui.walk = el('h42-walk'); r.appendChild(st.ui.walk); st.ui.walk.setAttribute('aria-label', 'החזיקו כדי ללכת');
    st.ui.line = el('h42-line'); r.appendChild(st.ui.line);
    st.ui.mat = el('h42-mat'); r.appendChild(st.ui.mat);
    st.ui.svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); st.ui.svg.setAttribute('class', 'h42-svg'); r.appendChild(st.ui.svg);
    st.ui.pad = el('h42-pad'); r.appendChild(st.ui.pad);
    st.ui.pile = el('h42-pile'); r.appendChild(st.ui.pile);
    st.t40 = createTouch40({ doc, pad: st.ui.pad, id: 'h42', proj });
    // the walk: held anywhere off the thing — the guide's way; released — he stops
    const w = st.ui.walk;
    w.addEventListener('pointerdown', (e) => { e.preventDefault(); if (st.hold) return; st.hold = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY }; try { w.setPointerCapture(e.pointerId); } catch (err) { /* */ } });
    w.addEventListener('pointermove', (e) => { if (st.hold && e.pointerId === st.hold.id) { st.hold.x = e.clientX; st.hold.y = e.clientY; } });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) w.addEventListener(t, (e) => { if (st.hold && e.pointerId === st.hold.id) st.hold = null; });
    // the act's surface on the thing: its gesture (each part reads st.act: { down, x0, y0, x, y, t0, moved, up })
    const pad = st.ui.pad;
    pad.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); st.act = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: now(), moved: 0, down: true }; st.finger++; try { pad.setPointerCapture(e.pointerId); } catch (err) { /* */ } if (st.job && st.job.down) st.job.down(st.act); });
    pad.addEventListener('pointermove', (e) => { const a = st.act; if (!a || e.pointerId !== a.id) return; a.x = e.clientX; a.y = e.clientY; a.moved = Math.max(a.moved, Math.hypot(a.x - a.x0, a.y - a.y0)); if (st.job && st.job.move) st.job.move(a); });
    const up = (e) => { const a = st.act; if (!a || e.pointerId !== a.id) return; a.down = false; st.finger = Math.max(0, st.finger - 1); if (st.job && st.job.up) st.job.up(a, e.type); st.act = null; };
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(t, up);
  }
  function dropUI() { try { if (st.t40) st.t40.destroy(); if (st.ui.root) st.ui.root.remove(); } catch (e) { /* */ } st.ui = {}; if (doc) doc.body.classList.remove('h42-on'); }
  const line = (t, sub = '') => { if (!st.ui.line) return; const h = `${esc(t)}${sub ? `<small>${esc(sub)}</small>` : ''}`; if (st.ui.line.__h !== h) { st.ui.line.__h = h; st.ui.line.innerHTML = h; } st.ui.line.hidden = !t; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const matChip = () => { if (st.ui.mat) st.ui.mat.textContent = `🪨 ${S.mat.stock | 0}`; };
  function toast(rating, at, opened) {
    if (!doc || !st.ui.root) return;
    const g = el('h42-g', `${RATE30.icon[rating]} ${RATE30.he[rating]}${opened ? ` · רמה ${opened} נפתחה` : ''}`); g.style.left = `${Math.round(at ? at.x : W() / 2)}px`; g.style.top = `${Math.round(at ? at.y : H() * 0.4)}px`; st.ui.root.appendChild(g); setTimeout(() => g.remove(), 1700);
    buzz42(rating === 'mehudar' ? 'ok' : rating === 'kasher' ? 'tick' : 'retry');
  }
  function card(title, lines, btn, on) {
    if (!doc) return null;
    const c = el('h42-card', `<div role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${lines.map((l) => (l.startsWith('~') ? `<small>${esc(l.slice(1))}</small>` : `<p>${esc(l)}</p>`)).join('')}<button type="button">${esc(btn)}</button></div>`);
    c.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); c.remove(); st.card = null; if (on) on(); });
    c.addEventListener('pointerdown', (e) => e.stopPropagation());
    doc.body.appendChild(c); st.card = c; return c;
  }
  const svgClear = () => { if (st.ui.svg) st.ui.svg.innerHTML = ''; };
  const svgAdd = (html) => { if (st.ui.svg) st.ui.svg.insertAdjacentHTML('beforeend', html); };

  /* ── the camera: a view of his own (the follow, the act's frame, the flyover), set each frame ── */
  const cq = { p: new THREE.Vector3(), t: new THREE.Vector3() };
  let camInit = false;
  function camTo(p, t, k) {
    if (!camInit) { cq.p.set(...p); cq.t.set(...t); camInit = true; }
    else { cq.p.x += (p[0] - cq.p.x) * k; cq.p.y += (p[1] - cq.p.y) * k; cq.p.z += (p[2] - cq.p.z) * k; cq.t.x += (t[0] - cq.t.x) * k; cq.t.y += (t[1] - cq.t.y) * k; cq.t.z += (t[2] - cq.t.z) * k; }
    try { view.camSet(cq.p.x, cq.p.y, cq.p.z, cq.t.x, cq.t.y, cq.t.z); const c = camera(); if (c) { c.lookAt(cq.t); c.updateMatrixWorld(); } } catch (e) { /* */ }   // (the matrices now: the marks and the touch ring projected this frame match the picture — without it they lagged a camera step behind)
  }
  const FOLLOW = { d: 17, el: 0.52, az: 0.9 };
  function followView(h) { const ce = Math.cos(FOLLOW.el), t = [h.x, h.y + 1.9, h.z]; return { p: [t[0] + Math.cos(FOLLOW.az) * ce * FOLLOW.d, t[1] + Math.sin(FOLLOW.el) * FOLLOW.d, t[2] + Math.sin(FOLLOW.az) * ce * FOLLOW.d], t }; }
  /** the act's frame: from beside him, the thing at 60 % of the width, him ≤ 45 % of the height (pan40, CAM41); held while a finger is on the thing */
  function actView(O) {
    const h = hero(); if (st.finger > 0 && st.camLock) return st.camLock;
    // (ש3: from beside him, 30° down — the forward turned θ off the line from him to the thing, so the thing stands right of him)
    let ux = O.x - h.x, uz = O.z - h.z; const Lu = Math.hypot(ux, uz) || 1; ux /= Lu; uz /= Lu;
    const th = 0.95, fx = ux * Math.cos(th) + uz * Math.sin(th), fz = -ux * Math.sin(th) + uz * Math.cos(th);
    const t = [(h.x + O.x) / 2, (h.y + O.y) / 2 + 1.2, (h.z + O.z) / 2], d = 18, el = 0.5, ce = Math.cos(el);   // (18: at the camera's own distance (closeCam) 12 made his figure 60–70 % of a 640 × 296 height; ≥ 15 at his depth keeps it ≤ 45 % with the field's 32°)
    const p = [t[0] - fx * ce * d, t[1] + Math.sin(el) * d, t[2] - fz * ce * d];
    const c = camera(), tanV = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), tanH = tanV * (W() / H());
    let v = { p, t };
    try { const r = pan40(p, t, O, { x: h.x, y: h.y + HERO41 / 2, z: h.z, h: HERO41 }, tanH, CAM41, tanV); if (r) v = { p: r.p, t: r.t }; } catch (e) { /* */ }
    // (him ≤ 45 % of the height: at the camera's own distance pan40's pose stood ~10 amot from him — 60–70 % at 640 × 296; back along the view's ray to 16)
    { const dh = Math.hypot(v.p[0] - h.x, v.p[1] - h.y - HERO41 / 2, v.p[2] - h.z), vx = v.p[0] - v.t[0], vy = v.p[1] - v.t[1], vz = v.p[2] - v.t[2], L = Math.hypot(vx, vy, vz) || 1; if (dh < 16) { const k = (L + (16 - dh)) / L; v = { p: [v.t[0] + vx * k, v.t[1] + vy * k, v.t[2] + vz * k], t: v.t }; } }
    st.camLock = v; return v;
  }

  /* ── the walk: the guide's way to the part's stand (guide39 over the open Mount: every floor free) ── */
  const E39 = { state: () => ({ phase: 'run', acting: !!(st.job && st.job.acting) }), flowNext: () => (st.target ? { id: st.part, at: { x: st.target.x, y: st.target.y, z: st.target.z } } : null), alt39: () => [] };
  const G39 = createGuide39({ E: E39, freeFor: () => () => true });
  const vel = { vx: 0, vz: 0 };
  function walkStep(dt) {
    const h = hero(); let g = null;
    if (st.hold && !st.job) g = G39.dir(h, null);
    walk39(vel, g, 14, dt);
    try { stages.hero.drive(vel.vx, vel.vz); } catch (e) { /* */ }
    if (st.hold && !st.job) S.hands += dt;
    return st.target ? Math.hypot(st.target.x - h.x, st.target.z - h.z) : 99;
  }

  /* ── the parts ── */
  const famL = (fam) => F.famLevel(S, fam);
  function grade(part, q, at) {
    const fam = FAMOF[part] || 'place', L = famL(fam), r = F.famRate(S, fam, L, q);
    S.grades.push([part, r.rating, Math.round(q * 100) / 100, L]); save42(S);
    toast(r.rating, at, r.opened);
    o.emit && o.emit('h42grade', { part, rating: r.rating, q, L, fam });
    return r.rating;
  }
  /** the act's thing: for the camera always; the touch surface on it only for the acts touched on the thing (the pile's acts drag from the pile) */
  function objPlace(on, pts, id) {
    const p0 = on && pts && pts[0]; st.obj = p0 ? { x: p0.x, y: p0.y, z: p0.z } : null;
    const touch = on && !(st.job && st.job.dragOnly);
    if (st.ui.pad) st.ui.pad.classList.toggle('on', !!touch);
    if (st.t40) st.t40.place(touch, touch ? pts : null, id);
  }
  // each part: begin() → its state; frame(dt) → true when the part is done
  const PART = {
    open: {
      begin() { const first = !S.open; st.fly = { t: 0, T: first ? 16 : 3, first }; line(''); if (!first) skipBtn(); else skipBtn(5); try { if (o.snapshot) st.snapshot = o.snapshot(); } catch (e) { st.snapshot = null; } },
      frame(dt) {
        const f = st.fly; f.t += dt; const u = Math.min(1, f.t / f.T), V = (globalThis.__T && globalThis.__T.VIEWS && globalThis.__T.VIEWS.olives) || { p: [601, 301, -215], t: [-60, 20, 0] };
        const c = { x: V.t[0], z: V.t[2] }, R0 = Math.hypot(V.p[0] - c.x, V.p[2] - c.z), a0 = Math.atan2(V.p[2] - c.z, V.p[0] - c.x);
        const orbit = Math.min(1, u / 0.78), a = a0 + orbit * 0.9, R = R0 * (1 - 0.35 * orbit), y = V.p[1] * (1 - 0.3 * orbit);
        let p = [c.x + Math.cos(a) * R, y, c.z + Math.sin(a) * R], t = [V.t[0], V.t[1], V.t[2]];
        if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
        camTo(p, t, 1);
        if (st.props.plan) st.props.plan.forEach((m, i) => { m.scale.x = Math.max(0.001, Math.min(1, (u - 0.12) * 6 - i)); });   // (the four edges unroll one after another)
        return u >= 1;
      },
      end() { S.open = (S.open | 0) + 1; if (st.ui.skip) { st.ui.skip.remove(); st.ui.skip = null; } },
    },
    rope: {
      begin() { line(LINE42.rope); },
      frame() {
        const h = hero(), r = st.props.rope; if (r) { const a = r.geometry.attributes.position; a.setXYZ(0, PL.peg0.x, PL.peg0.y + 1.4, PL.peg0.z); a.setXYZ(1, h.x, h.y + 1.6, h.z); a.needsUpdate = true; }
        return st.near;
      },
    },
    lift: {
      begin() { const L = famL('lift'); st.job = mkLift(L); line(LINE42.lift, `רמה ${L}`); },
    },
    rock0: { begin() { st.job = mkRock(0); } }, rock1: { begin() { st.job = mkRock(1); } }, rock2: { begin() { st.job = mkRock(2); } },
    course0: { begin() { st.job = mkCourse(0); } }, course1: { begin() { st.job = mkCourse(1); } },
    roll: { begin() { st.job = mkRoll(); } },
    pave: { begin() { st.job = mkPave(); } },
    trace: { begin() { st.job = mkTrace(); } },
    reveal: {
      begin() {
        line(''); objPlace(false); svgClear(); if (st.props.root) st.props.root.visible = false;
        let out = null; try { out = o.complete ? o.complete() : null; } catch (e) { out = null; }
        st.rev = { t: 0, out };
        if (st.snapshot && doc) { const im = el('h42-before', '', 'img'); im.src = st.snapshot; st.ui.root.appendChild(im); st.ui.before = im; const tg = el('h42-tag', 'לפני — הסלע של הבוקר'); tg.style.left = '16px'; tg.style.top = '60px'; st.ui.root.appendChild(tg); st.ui.btag = tg; }
        buzz42('peak');
      },
      frame(dt) {
        const r = st.rev; r.t += dt; const u = Math.min(1, r.t / 7), e = u * u * (3 - 2 * u), h = hero();
        const p0 = [PL.pave.x + 8, PL.pave.y + 6, PL.pave.z + 8], t0 = [PL.pave.x, PL.pave.y, PL.pave.z], p1 = [base.x + 160, gy(base.x, base.z) + 260, base.z + 220], t1 = [base.x - 40, gy(base.x, base.z), base.z - 50];
        camTo(p0.map((v, i) => v + (p1[i] - v) * e), t0.map((v, i) => v + (t1[i] - v) * e), 1);
        if (st.ui.before && r.t > 2.2) { st.ui.before.style.opacity = '0'; if (st.ui.btag) st.ui.btag.textContent = 'אחרי — רחבה חלקה ועצומה'; }
        void h; return r.t > 7.5;
      },
      end() { finishCard(); },
    },
  };
  function skipBtn(after = 0) {
    if (!doc || !st.ui.root) return;
    setTimeout(() => { if (!st.on || st.part !== 'open' || st.ui.skip) return; const b = el('h42-skip', 'דלגו', 'button'); b.type = 'button'; b.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (st.fly) st.fly.t = st.fly.T * 0.78; }); st.ui.root.appendChild(b); st.ui.skip = b; }, after * 1000);
  }

  /* LIFT: the treadwheel — hold on the wheel: he walks it; a drag down: lowers; the shadow (level 1) and the window on a meter */
  function mkLift(L) {
    const J = F.createLift(L), mt = el('h42-meter', '<i></i><b></b><u></u>'); st.ui.root.appendChild(mt);
    const [w0, w1] = J.P.win; mt.querySelector('b').style.bottom = `${w0 * 80}%`; mt.querySelector('b').style.height = `${(w1 - w0) * 80}%`;
    const inp = { hold: false, back: false };
    return {
      acting: true, el: [mt], J, kind: 'lift',
      down() { inp.hold = true; inp.back = false; }, move(a) { const over = J.state().y > J.P.win[1]; if (a.y - a.y0 > 20 || (over && Math.hypot(a.x - a.x0, a.y - a.y0) > 20)) { inp.hold = false; inp.back = true; } },   // (over the window, a drag any way lowers it — the naive kid dragged every way but down)
      up() { inp.hold = false; inp.back = false; },
      frame(dt) {
        const s = J.step(dt, inp); if (inp.hold && s.held > F.TAP42 && Math.random() < dt * 6) buzz42('creak');
        const y = s.y + J.sway(); st.props.stone0 && (st.props.stone0.position.y = PL.stone0.y + 0.55 + y * 5); st.props.wheel && (st.props.wheel.rotation.z -= s.v * dt * 3);
        objPlace(true, [{ x: PL.wheel.x, y: PL.wheel.y + 3.3, z: PL.wheel.z, r: 3 }], 'h42lift');
        const q = proj(PL.wheel.x, PL.wheel.y + 3.3, PL.wheel.z); if (q) { mt.style.left = `${Math.round(Math.min(W() - 40, q.x + 90))}px`; mt.style.top = `${Math.round(Math.max(60, q.y - 55))}px`; }
        mt.querySelector('i').style.height = `${Math.round(Math.min(1.2, s.y) * 80)}%`; const u = mt.querySelector('u'); u.style.display = J.P.shadow ? '' : 'none'; u.style.bottom = `${Math.round(J.stopAt() * 80)}%`;
        line(s.slip ? 'הבלם מוריד את האבן לאט אל החלון — או גררו מטה · המחשה' : s.y > J.P.win[1] + 0.02 ? LINE42.lift2 : LINE42.lift, `רמה ${s.L}`);
        if (s.done) { grade('lift', s.q, q); buzz42('settle'); return true; }
        return false;
      },
    };
  }
  /* INSPECT: reading the rock — sweep (drag), wedges (taps on the shown line), the water (hold), let go at the end */
  function mkRock(i) {
    const L = famL('inspect'), J = F.createRock(i, L), R = PL.rock[i], C = { x: R.x, y: R.y + 1.6, z: R.z };
    line(LINE42.sweep, i === 2 ? LINE42.two : `סלע ${i + 1} מתוך 3 · רמה ${L}`);
    const box = () => { const a = proj(C.x - 2.8, C.y + 1.6, C.z), b = proj(C.x + 2.8, C.y - 1.4, C.z), c = proj(C.x, C.y, C.z); if (!a || !b || !c) return null; const l = Math.min(a.x, b.x), r = Math.max(a.x, b.x), t = Math.min(a.y, b.y), bt = Math.max(a.y, b.y); return { l, r, t, b: bt, w: Math.max(40, r - l), h: Math.max(30, bt - t), cx: c.x, cy: c.y }; };
    // a line on the rock: from its graze across the box at a slope (screen space; drawn when seen)
    const seg = (l, B) => { const y0 = B.t + B.h * (0.35 + l.graze * 0.35), y1 = y0 + B.h * (l.id === 'a' ? 0.12 : -0.1); return { x0: B.l + B.w * 0.08, y0, x1: B.r - B.w * 0.08, y1 }; };
    let mode = '', pourOn = false, swept = 0;
    return {
      acting: true, J, kind: 'rock', box, lines: () => { const B = box(); return B ? J.rock.lines.filter((l) => J.state().seen[l.id]).map((l) => ({ id: l.id, ...seg(l, B) })) : []; },
      down(a) { mode = ''; pourOn = false; a.tDown = now(); },
      move(a) { if (a.moved > 10) { mode = 'sweep'; const B = box(); if (B) { const u = (a.x - B.l) / B.w; J.sweep(Math.max(0, Math.min(1, u))); swept++; if (swept % 6 === 0) buzz42('creak'); } } },
      up(a) {
        if (mode === 'sweep') { mode = ''; return; }
        if (pourOn) { pourOn = false; J.pour(0.016, false); return; }
        if (now() - (a.tDown || 0) < F.TAP42 + 0.05 && a.moved < 10) {   // a tap: a wedge on a seen line near the touch
          const B = box(); if (!B) return;
          let best = null, bd = J.state().L <= 1 ? Math.max(B.w, B.h) : 26;   // (level 1: a tap anywhere on the rock goes to the line — and to its nearest free mark)
          for (const l of J.rock.lines) { if (!J.state().seen[l.id]) continue; const s = seg(l, B), vx = s.x1 - s.x0, vy = s.y1 - s.y0, t = Math.max(0, Math.min(1, ((a.x - s.x0) * vx + (a.y - s.y0) * vy) / (vx * vx + vy * vy))), d = Math.hypot(a.x - (s.x0 + vx * t), a.y - (s.y0 + vy * t)); if (d < bd) { bd = d; best = { id: l.id, t }; } }
          if (best && J.state().L <= 1) { const ws = J.state().wedges, free = [0.2, 0.4, 0.6, 0.8].filter((m) => !ws.some((w) => Math.abs(w - m) < 0.04)); if (free.length) best.t = free.reduce((p, m) => (Math.abs(m - best.t) < Math.abs(p - best.t) ? m : p), free[0]); }   // (level 1: a tap lands on the nearest free marked place — the marks teach the even spacing)
          if (best) { const r = J.wedge(best.id, best.t); if (r === 'ok') buzz42('mallet'); }
        }
      },
      frame(dt) {
        const s = J.state(), B = box(); objPlace(true, [{ x: C.x, y: C.y, z: C.z, r: 2.6 }], 'h42rock');
        // the hold: past the tap, without moving → the water
        const a = st.act; if (a && a.down && mode !== 'sweep' && a.moved < 10 && now() - (a.tDown || 0) > F.TAP42 && s.wedges.length >= F.INSPECT42.minWedges) pourOn = true;
        J.pour(dt, pourOn);
        svgClear();
        if (B) {
          for (const l of J.rock.lines) { if (!s.seen[l.id]) continue; const g = seg(l, B), op = l.band < 0.12 ? 0.55 : 0.9; svgAdd(`<line x1="${g.x0}" y1="${g.y0}" x2="${g.x1}" y2="${g.y1}" stroke="#2A1804" stroke-width="3" stroke-dasharray="2 5" opacity="${op}"/>`);
            if (s.L <= 1 && s.wedges.length < F.INSPECT42.wedges && (!s.line || s.line === l.id)) for (const t of [0.2, 0.4, 0.6, 0.8]) { if (s.wedges.some((w) => Math.abs(w - t) < 0.04)) continue; svgAdd(`<circle cx="${g.x0 + (g.x1 - g.x0) * t}" cy="${g.y0 + (g.y1 - g.y0) * t}" r="9" fill="none" stroke="#FFE6A0" stroke-width="2" stroke-dasharray="3 3" opacity=".8"/>`); }   // (level 1: the even places marked)
            if (s.line === l.id) { for (const t of s.wedges) svgAdd(`<circle cx="${g.x0 + (g.x1 - g.x0) * t}" cy="${g.y0 + (g.y1 - g.y0) * t}" r="7" fill="#8A5A2A" stroke="#FFE6A0" stroke-width="2"/>`); const c = Math.min(1, s.crack); svgAdd(`<line x1="${g.x0}" y1="${g.y0}" x2="${g.x0 + (g.x1 - g.x0) * c}" y2="${g.y0 + (g.y1 - g.y0) * c}" stroke="#111" stroke-width="4"/>`); svgAdd(`<rect x="${g.x0 + (g.x1 - g.x0) * 0.9 - 4}" y="${Math.min(g.y0, g.y1) - 16}" width="${(g.x1 - g.x0) * 0.14 + 8}" height="${Math.abs(g.y1 - g.y0) + 32}" fill="none" stroke="#FFD66E" stroke-width="2" stroke-dasharray="4 4"/>`); } }
          if (s.light >= 0) svgAdd(`<rect x="${B.l + B.w * s.light - 10}" y="${B.t}" width="20" height="${B.h}" fill="rgba(255,240,190,.35)"/>`);
        }
        const seen = Object.keys(s.seen).length;
        line(!seen ? LINE42.sweep : s.wedges.length < F.INSPECT42.minWedges ? LINE42.wedge : LINE42.pour, i === 2 ? LINE42.two : `סלע ${i + 1} מתוך 3 · רמה ${J.state().L}`);
        if (s.done) { const q = proj(C.x, C.y, C.z); grade(`rock${i}`, s.q, q); buzz42('heavy'); if (st.props.rocks && st.props.rocks[i]) st.props.rocks[i].scale.set(1.3, 0.35, 1); svgClear(); return true; }
        return false;
      },
    };
  }
  /* PLACE: his hand stones in the course — drag from the pile, hold over the course to settle; the crews lay the rest */
  function mkCourse(n) {
    const L = famL('place'), spec = F.courseSpec(n, L), J = F.createCourse(spec), U = 1.2, C = { x: PL.course.x, y: PL.course.y + 1.5 + n * 1.0, z: PL.course.z };
    line(LINE42.place, `נדבך ${n + 1} · רמה ${L}`);
    // the course below (the crews'), and the crews' stones of this course outside his stretch, laid one by one
    const g = st.props.course; const box3 = (len, x0, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len * U - 0.08, 1, 1.2), STONE); m.position.set((x0 + len / 2) * U - 7, y, 0); g.add(m); return m; };
    if (n === 0) { let x = 0; const bl = spec.below.concat([15]); for (const j of bl) { box3(j - x, x, 0.5); x = j; } }
    const crew = []; for (let x = 0; x < spec.a; x += 2) crew.push([x, Math.min(2, spec.a - x)]); for (let x = spec.b; x < 15; x += 3) crew.push([x, Math.min(3, 15 - x)]);
    let crewT = 0, crewN = 0, graded = false;
    // the pile
    const pile = st.ui.pile; pile.innerHTML = '';
    for (const len of F.PLACE42.lens) { const b = el('h42-it', `${'▭'.repeat(1)} ${len}`, 'button'); b.type = 'button'; b.dataset.len = String(len); b.setAttribute('aria-label', `אבן באורך ${len}`); pile.appendChild(b); dragItem(b, (drop) => tryPlace(len, b, drop)); }
    const slotBox = () => { const a = proj(C.x + (J.state().at * U - 7) + PL.course.x * 0 - 0.2, C.y + 1.6, C.z), b = proj(C.x + (spec.b * U - 7) + 0.2, C.y - 0.6, C.z); return a && b ? { l: Math.min(a.x, b.x) - 30, r: Math.max(a.x, b.x) + 30, t: Math.min(a.y, b.y) - 30, b: Math.max(a.y, b.y) + 30 } : null; };
    function tryPlace(len, b, drop) {
      const B = slotBox(); if (!B || !(drop.x >= B.l && drop.x <= B.r && drop.y >= B.t && drop.y <= B.b)) return false;
      const r = J.place(len, { dragPx: drop.px, settleS: drop.still });
      if (r === 'ok') { box3(len, J.state().at - len, 1.5 + n * 1.0); buzz42('settle'); return true; }
      if (r === 'unsettled') line('החזיקו רגע על הנדבך — שתתיישב · המחשה', `נדבך ${n + 1}`);
      if (r === 'long' || r === 'gap') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); if (r === 'gap') line('האבן הזאת תשאיר רווח שאין אבן קטנה מספיק למלא — בחרו אחרת · המחשה', `נדבך ${n + 1}`); }
      return false;
    }
    return {
      acting: true, dragOnly: true, J, kind: 'course', slot: slotBox, spec,
      frame(dt) {
        crewT += dt; if (crewN < crew.length && crewT > 1.6) { crewT = 0; const [x, len] = crew[crewN++]; box3(len, x, 1.5 + n * 1.0); }
        objPlace(true, [{ x: C.x + ((spec.a + spec.b) / 2) * U - 7, y: C.y + 1, z: C.z, r: ((spec.b - spec.a) * U) / 2 + 0.6 }], 'h42course');
        // the joints below his stretch, shown at level 1 (the rule's teacher)
        svgClear(); { const B = slotBox(); if (B && !J.state().done) svgAdd(`<rect x="${B.l + 26}" y="${B.t + 26}" width="${Math.max(10, B.r - B.l - 52)}" height="${Math.max(10, B.b - B.t - 52)}" fill="rgba(255,214,110,.14)" stroke="#FFD66E" stroke-width="2" stroke-dasharray="6 4" rx="6"/>`); }
        if (J.state().L <= 1) for (const j of spec.below) { if (j <= spec.a || j >= spec.b) continue; const q = proj(C.x + j * U - 7, C.y + 0.4, C.z); if (q) svgAdd(`<line x1="${q.x}" y1="${q.y - 22}" x2="${q.x}" y2="${q.y + 6}" stroke="#C0392B" stroke-width="3" opacity=".7"/>`); }
        if (J.state().done) { if (!graded) { graded = true; pile.innerHTML = ''; svgClear(); const q = proj(C.x, C.y + 1, C.z); grade(`course${n}`, J.state().q, q); } return crewN >= crew.length; }   /* (graded once; the part ends when the crews have laid the rest) */
        return false;
      },
      end() { pile.innerHTML = ''; st.pull = { t: 0 }; line(LINE42.courseEnd); },
    };
  }
  /* PLACE (twist): the great stone on rollers — the chant's beat; drag the freed roller (its handle at the back) to the front */
  function mkRoll() {
    const L = famL('place'), J = F.createRoll(L); line(LINE42.roll, `האבן הגדולה · רמה ${L}`);
    let beatT = 0; const h = el('h42-it', '⟳', 'button'); h.type = 'button'; h.setAttribute('aria-label', 'הגליל שהשתחרר'); h.style.position = 'fixed'; h.style.zIndex = '46'; h.style.pointerEvents = 'auto';   /* (the layer above is pointer-events none: without this a finger fell through to the walk — the naive kid's K42-P-roll / K42-W-roll; the autoplayer's events had gone straight to it) */ h.hidden = true; st.ui.root.appendChild(h);
    dragItem(h, (drop) => { const r = J.moveRoller({ dragPx: drop.px }); if (r === 'ok') { buzz42('heavy'); return true; } return false; }, true);
    return {
      acting: true, dragOnly: true, el: [h], J, kind: 'roll', handle: () => (h.hidden ? null : h.getBoundingClientRect()),
      frame(dt) {
        const s = J.step(dt); beatT += dt; if (beatT > s.beat) { beatT = 0; if (!s.waiting) buzz42('tick'); }
        const x = PL.roll0.x + s.x * 2; if (st.props.big) st.props.big.position.x = x;
        if (st.props.rollers) st.props.rollers.forEach((c, i) => { const k = (i + s.moved) % 4; c.position.x = x - 3 + k * 2; c.rotation.y += dt * (s.waiting ? 0 : 2); });
        objPlace(true, [{ x, y: PL.roll0.y + 1.6, z: PL.roll0.z, r: 3.6 }], 'h42roll');
        const back = proj(x - 3.4, PL.roll0.y + 0.3, PL.roll0.z); h.hidden = !s.free; if (back && s.free) { h.style.left = `${Math.round(back.x - 26)}px`; h.style.top = `${Math.round(back.y - 24)}px`; }
        line(s.waiting ? 'האבן נעצרה — אין גליל בחזית. גררו אותו קדימה · המחשה' : LINE42.roll, `גלגלים: ${s.moved} / ${F.ROLL42.moves} · השירה קובעת את הקצב`);
        if (s.done) { const q = proj(x, PL.roll0.y + 2, PL.roll0.z); grade('roll', s.q, q); h.remove(); return true; }
        return false;
      },
    };
  }
  /* PLACE (end): the last paving slabs — drag slabs whose sizes fill each row exactly */
  function mkPave() {
    const J = F.createPave(), U = 1.4, rowsY = [0, 1.5, 3]; line(LINE42.pave, `השורה ${J.state().row + 1} · נשארו ${J.state().left[0]}`);
    const pile = st.ui.pile; pile.innerHTML = '';
    for (const n of F.PAVE42.sizes) { const b = el('h42-it', `▢ ${n}`, 'button'); b.type = 'button'; b.setAttribute('aria-label', `לוח בגודל ${n}`); pile.appendChild(b); dragItem(b, (drop) => { const B = paveBox(); if (!B || !(drop.x >= B.l && drop.x <= B.r && drop.y >= B.t && drop.y <= B.b)) return false; const row = J.state().row, at = J.state().rows[row] - J.state().left[row], r = J.lay(n, { dragPx: drop.px }); if (r === 'ok') { const m = new THREE.Mesh(new THREE.BoxGeometry(n * U - 0.06, 0.18, 1.3), STONE); m.position.set((at + n / 2) * U - 4, 0.1, rowsY[row]); st.props.pave.add(m); buzz42('settle'); return true; } if (r === 'long') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); } return false; }); }
    // the rows' empty beds (darker) inside the paving already laid round them — the gap each row's slabs must fill exactly (simple shapes · המחשה)
    const X0 = -4, g0 = st.props.pave;
    if (g0 && !g0.userData.bed) {
      g0.userData.bed = true;
      const slab = (w, d, x, z, m, h) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, h / 2, z); g0.add(k); };
      J.state().rows.forEach((n, r) => { slab(n * U, 1.3, X0 + (n * U) / 2, rowsY[r], ROCK, 0.06); const e = X0 + n * U; if (6.7 - e > 0.05) slab(6.7 - e, 1.3, (e + 6.7) / 2, rowsY[r], STONE, 0.2); });
      slab(13.5, 1.4, 1.35, -1.35, STONE, 0.2); slab(13.5, 1.4, 1.35, 4.35, STONE, 0.2); slab(1.4, 4.6, -4.7, 1.5, STONE, 0.2); slab(1.4, 4.6, 7.4, 1.5, STONE, 0.2);
    }
    // the drop's box from the points in front of the camera (its near plane is 4 amot: a corner of the paving can fall behind it), kept on the screen
    const at3 = (u, r, dz = 0) => [PL.pave.x + X0 + u * U, PL.pave.y + 0.1, PL.pave.z + rowsY[r] + dz];
    const boxOf = (pts, m) => { const q = pts.map((p) => proj(p[0], p[1], p[2])).filter(Boolean); if (q.length < 2) return null; const xs = q.map((p) => p.x), ys = q.map((p) => p.y); const B = { l: Math.max(0, Math.min(...xs) - m), r: Math.min(W(), Math.max(...xs) + m), t: Math.max(0, Math.min(...ys) - m), b: Math.min(H(), Math.max(...ys) + m) }; return B.r - B.l > 20 && B.b - B.t > 20 ? B : null; };
    const paveBox = () => boxOf([0, 3.5, 7].flatMap((u) => [0, 1, 2].map((r) => at3(u, r, r === 0 ? -0.7 : r === 2 ? 0.7 : 0))), 40);
    const gapBox = () => { const s = J.state(); if (s.done) return null; const r = s.row, a = s.rows[r] - s.left[r], b = s.rows[r]; return boxOf([at3(a, r, -0.65), at3(b, r, -0.65), at3(a, r, 0.65), at3(b, r, 0.65), at3((a + b) / 2, r)], 12); };   // (a row is 1.3 amot deep: ~15 px on a phone — the outline a little wider than the gap)
    return {
      acting: true, dragOnly: true, J, kind: 'pave', box: paveBox,
      frame() {
        const s = J.state(); objPlace(true, [{ x: PL.pave.x, y: PL.pave.y, z: PL.pave.z + 1.5, r: 5 }], 'h42pave');
        svgClear(); { const B = gapBox(); if (B) svgAdd(`<rect x="${B.l}" y="${B.t}" width="${Math.max(10, B.r - B.l)}" height="${Math.max(10, B.b - B.t)}" fill="rgba(255,214,110,.14)" stroke="#FFD66E" stroke-width="2" stroke-dasharray="6 4" rx="6"/>`); }
        if (!s.done) line(LINE42.pave, `שורה ${s.row + 1} מתוך ${s.rows.length} · נשארו ${s.left[s.row]}`);
        if (s.done) { pile.innerHTML = ''; svgClear(); grade('pave', s.q, proj(PL.pave.x, PL.pave.y, PL.pave.z)); return true; }
        return false;
      },
    };
  }
  /* the inscription "לבית התקיעה": drag along the dotted line (right to left), in order */
  function mkTrace() {
    line(LINE42.trace); const N = 9; let hit = 0, lastT = -1;
    const pts = () => { const a = proj(PL.trace.x + 1.4, PL.trace.y + 0.9, PL.trace.z + 0.55), b = proj(PL.trace.x - 1.4, PL.trace.y + 0.9, PL.trace.z + 0.55); if (!a || !b) return null; return Array.from({ length: N }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / (N - 1), y: a.y + ((b.y - a.y) * i) / (N - 1) + Math.sin(i * 1.3) * 6 })); };
    return {
      acting: true, kind: 'trace', dots: () => pts(), hit: () => hit,
      move(a) { if (a.moved < 8) return; const P2 = pts(); if (!P2 || hit >= N) return; const q = P2[hit]; if (Math.hypot(a.x - q.x, a.y - q.y) < 30) { hit++; lastT = now(); buzz42('tick'); } },
      frame() {
        objPlace(true, [{ x: PL.trace.x, y: PL.trace.y + 0.9, z: PL.trace.z, r: 2 }], 'h42trace');
        svgClear(); const P2 = pts(); if (P2) P2.forEach((q, i) => svgAdd(`<circle cx="${q.x}" cy="${q.y}" r="${i < hit ? 6 : 5}" fill="${i < hit ? '#2A1804' : 'none'}" stroke="#FFE6A0" stroke-width="2"/>`));
        if (hit >= N) { svgClear(); grade('trace', 1, P2 ? P2[N >> 1] : null); return true; }
        if (hit > 0 && !st.act && now() - lastT > 1.2 && hit < N) { line('מהתחלה — לאורך הנקודות, בלי לעצור · טיוטה'); hit = 0; }
        return false;
      },
    };
  }
  /** a pile item dragged: its clone follows the finger; a still moment (≥ 0.5 s within 6 px) counts as the settle; on release → onDrop({x, y, px, still}) → true keeps it */
  function dragItem(b, onDrop, keep) {
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const g = b.cloneNode(true); g.classList.add('drag'); doc.body.appendChild(g);
      const d = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, px: 0, still: 0, sx: e.clientX, sy: e.clientY, st0: now() };
      const place = () => { g.style.left = `${Math.round(d.x - 26)}px`; g.style.top = `${Math.round(d.y - 40)}px`; }; place();
      st.finger++;
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      const mv = (ev) => { d.x = ev.clientX; d.y = ev.clientY; d.px = Math.max(d.px, Math.hypot(d.x - d.x0, d.y - d.y0)); if (Math.hypot(d.x - d.sx, d.y - d.sy) > 6) { d.sx = d.x; d.sy = d.y; d.st0 = now(); } d.still = now() - d.st0; place(); };
      const upF = () => { b.removeEventListener('pointermove', mv); b.removeEventListener('pointerup', upF); b.removeEventListener('pointercancel', upF); d.still = now() - d.st0; st.finger = Math.max(0, st.finger - 1); let ok = false; try { ok = onDrop({ x: d.x, y: d.y, px: d.px, still: d.still }); } catch (err) { ok = false; } g.remove(); if (ok && !keep) { /* the pile stays (the stones are many) */ } };
      b.addEventListener('pointermove', mv); b.addEventListener('pointerup', upF); b.addEventListener('pointercancel', upF);
    });
  }

  /* ── the flow ── */
  function standOf(part) { const s = STAND[part]; return s ? { x: s.x, y: s.y, z: s.z } : null; }
  function startPart(i) {
    if (i >= PARTS42.length) { finish(); return; }
    const part = PARTS42[i]; S.part = i; save42(S);
    // the materials: checked at a part's start only (never mid-act): out → "מחר: …" (the open loop)
    const m = MATOF[part];
    if (m && !F.enough42(S.mat, m)) { st.part = 'out'; st.target = null; line(''); card('השיירה של היום נגמרה', [LINE42.out, '~הצוותים ממשיכים לבנות גם כשאתם לא כאן · המחשה'], 'עד מחר', () => {}); return; }
    if (m) { F.spend42(S.mat, m); matChip(); save42(S); }
    st.part = part; st.job = null; st.near = false; st.camLock = null; svgClear(); if (st.ui.pile) st.ui.pile.innerHTML = '';
    st.target = standOf(part); G39.reset();
    const p = PART[part];
    if (st.target && part !== 'rope') { line(LINE42.walk, labelOf(part)); st.pending = p; }
    else { st.pending = null; p.begin && p.begin(); }
  }
  const labelOf = (part) => ({ lift: 'גלגל הדריכה', rock0: 'הסלע הראשון', rock1: 'הסלע השני', rock2: 'הסלע השלישי', course0: 'הנדבך', course1: 'הנדבך הבא', roll: 'האבן הגדולה', pave: 'הריצוף', trace: 'אבן המעקה' })[part] || '';
  function endPart() { const p = PART[st.part]; if (st.job && st.job.end) st.job.end(); if (p && p.end) p.end(); if (st.job && st.job.el) st.job.el.forEach((e) => { try { e.remove(); } catch (err) { /* */ } }); st.job = null; objPlace(false); startPart(S.part + 1); }
  function finish() { st.part = 'done'; }
  function finishCard() {
    const n = { mehudar: 0, kasher: 0, tikkun: 0 }; for (const g of S.grades) n[g[1]] = (n[g[1]] || 0) + 1;
    S.done = Date.now(); save42(S);
    card('שיטוח ההר — נבנה', [`${RATE30.icon.mehudar} מהודר ${n.mehudar} · ${RATE30.icon.kasher} כשר ${n.kasher} · ${RATE30.icon.tikkun} טעון תיקון ${n.tikkun}`, `ידיים: ${Math.round(S.hands / 60)} דק׳`, 'נפתח: חומת העזרה', '~הר הבית כהר מכוסה שלג (מלחמות ה 222–223) · טיוטה'], 'המשך', () => stop(true));
  }

  /* ── the frame ── */
  function frame(ms) {
    if (!st.on) return;
    const t = ms / 1000, dt = st.last ? Math.min(0.1, Math.max(0, t - st.last)) : 0.016; st.last = t;
    if (o.keepAwake) o.keepAwake();
    if (st.card) return;
    const part = st.part;
    if (part === 'open' || part === 'reveal') { const p = PART[part]; if (p.frame(dt)) { if (p.end) p.end(); if (part === 'open') { const r = st.resumeAt; st.resumeAt = null; startPart(r != null ? r : S.part + 1); } else { st.part = 'done'; } } return; }
    if (part === 'done' || part === 'out') return;
    const d = walkStep(dt), h = hero();
    if (st.pending) {   // walking to the part's place
      camTo(followView(h).p, followView(h).t, Math.min(1, dt * 3));
      if (d < 2.6) { const p = st.pending; st.pending = null; try { stages.hero.drive(0, 0); } catch (e) { /* */ } if (p.begin) p.begin(); }
      return;
    }
    if (part === 'rope') { st.near = d < 2.6; camTo(followView(h).p, followView(h).t, Math.min(1, dt * 3)); if (PART.rope.frame()) endPart(); return; }
    if (st.pull) { st.pull.t += dt; const fv = followView(h), u = Math.min(1, st.pull.t / 2.6), k = Math.sin(u * Math.PI); camTo(fv.p.map((v, i) => (i === 1 ? v + 30 * k : v + (v - fv.t[i]) * 1.6 * k)), fv.t, Math.min(1, dt * 4)); if (u >= 1) st.pull = null; return; }
    const J = st.job; if (!J) return;
    S.hands += dt;
    const O = st.obj || { x: h.x, y: h.y + 1, z: h.z };
    const v = actView(O); camTo(v.p, v.t, st.finger > 0 ? 0 : Math.min(1, dt * 2));
    if (J.frame(dt)) endPart();
  }

  function start() {
    if (st.on || !doc) return false;
    st.on = true; doc.body.classList.add('h42-on'); ui(); props();
    try { if (view.closeCam) view.closeCam(true); } catch (e) { /* */ }   // (main.js's OrbitControls keep the camera 35 amot from its target and the near plane at 4: the stage's follow (17) and act (12) views were pushed back to 35 — the picture farther than the frame, the marks projected off the things; Phase B's close-up gives way the same way)
    // the morning's caravan (and the developer's flags)
    const add = +(qs('h42day') || 0) + (globalThis.__H42_DAY | 0), came = F.caravan42(S.mat, Date.now(), add);
    if (qs('h42stock') != null) S.mat.stock = +qs('h42stock') | 0;
    const at = qs('h42at'); if (at && PARTS42.includes(at)) S.part = PARTS42.indexOf(at);
    matChip(); save42(S);
    // where he stands at the start: by the first peg (a new stage) or at his part
    try { const p = S.part <= 1 ? PL.peg0 : standOf(PARTS42[S.part]) || PL.peg0; stages.hero.setPos(p.x, p.z, 0); stages.hero.show(true); } catch (e) { /* */ }
    // (a new stage: the flyover in full; back to it: the flyover's 3 s, then his part)
    const go = () => { if (S.part > 0 && S.part < PARTS42.indexOf('reveal')) { st.resumeAt = S.part; st.part = 'open'; PART.open.begin(); } else startPart(S.part); };
    if (came && S.part > 0) card('בוקר טוב', [LINE42.caravan, `+${F.MAT42.daily * came} אבנים`], 'לעבודה', go); else go();
    o.emit && o.emit('h42start', { part: PARTS42[S.part] });
    return true;
  }
  function stop(done) {
    if (!st.on) return; st.on = false;
    try { if (view.closeCam) view.closeCam(false); } catch (e) { /* */ }
    try { stages.hero.drive(0, 0); } catch (e) { /* */ }
    dropUI(); dropProps();
    if (o.onExit) o.onExit(!!done);
  }
  const api = {
    start, stop, frame, get on() { return st.on; },
    state: () => ({ part: st.part, idx: S.part, job: !!st.job, pending: !!st.pending, hold: !!st.hold, finger: st.finger, mat: S.mat.stock | 0, grades: S.grades.slice(), hands: Math.round(S.hands), card: !!st.card, fam: Object.fromEntries(F.FAM42.map((f) => [f, famL(f)])) }),
    sig: () => `${st.part}|${S.part}|${S.grades.length}|${st.card ? 'card' : ''}|${st.job && st.job.frame ? 'job' : ''}`,
    line: () => (st.ui.line ? st.ui.line.textContent : ''),
    save: () => S, places: () => ({ PL, STAND, base }),
    job: () => (st.job ? { kind: st.job.kind || '', s: st.job.J ? st.job.J.state() : null, ref: st.job } : null),   // (the tools read the act: never write)
  };
  try { globalThis.__H42 = api; } catch (e) { /* */ }
  return api;
}
