/* ── flow31 ── flow31.js — "never search" (docs/WAVE31-BRIEF.md FLOW31): the gold path on the floor to the NEXT place, the three chips,
 * the zoom-out button (hold = high over the field, "אני" over him; release = back in 0.6 s), the button's look, the full-screen button.
 *   createFlow31({ E, view, world, twin, root, kit, stations }) → { destroy(), state() }
 *   SHARED.f31 = { st: Set(station chip ids shown), pil(P) → shown?, top: P | null }  — read by stations.js / pilgrims.js when they place chips
 * The path: guide27's planPath over the court's floors, a gold disc every 1.4 amot from his feet to the next place, a soft wave running
 * along it toward the place; only while there is a next place. Nothing here presses: no clock, no penalty. Never a Divine Name. ── /flow31 ── */
import { planPath } from '../day/guide27.js';
import { man, lamb } from '../works/figures.js';   // ── fable32 (build 8) ── (the merchant at the gate) ── /fable32 ──
import { free, houseFloor, onHigh, rampWay, HOUSE22, WEST27, westStrip27, gap37 } from '../day/world22.js';   // ── recovered (16–26c) ── (houseFloor, onHigh, rampWay, HOUSE22) ── fable32 (build 27) ── (westStrip27) ── /fable32 ──
import { placeGround } from '../works/anchors.js';
import { addDrawer, layerOf, L, SHARED } from './draw.js';

export const F31 = { gap: 1.4, maxDiscs: 40, replanS: 0.25, replanMove: 1.2, zoomUp: 0.35, zoomDown: 0.6, zoomEl: 1.18, zoomD: 78, reach: 3, field: { x0: -30, x1: -9, z0: -26, z1: 50, y0: 14 }, dayField: { x0: -46.5, x1: -9, z0: -26, z1: 50, y0: 14 } };   // (field: the court east of the altar and of the ramp, north of the altar's NE corner to past the ramp's foot) ── recovered (16–26c) ── (dayField: the day's, from the ramp's west side)
const FREE = (x, z) => free(x, z) && !(x < -54.95 && x > -76.5 && Math.abs(z) < 50.5);   // (walk.js's: the Ulam's steps are a wall to the feet)
// ── recovered (build 26) ── the chambers' block north of the altar (stages.js 'lishka', x −54 to −22): the strong path goes round it
// ("the human autoplayer stood ~100 s against its west face"), unless the place is in it; in the house (HOUSE22.on) its own floor too,
// the gate shut or open (houseFloor reads HOUSE22.gate). The names but LISHKA26 (the report's) are the recovery's.
const LISHKA26 = (x, z) => x > -54.3 && x < -21.7 && z > -62.3 && z < -26.7;
const FREE26 = (x, z) => FREE(x, z) && !LISHKA26(x, z);
const FREE_HOUSE = (x, z) => !gap37(x, z) && (houseFloor(x, z) || FREE26(x, z));   // ── fable32 (build 37) ── (not through the gap beside the Ulam's door — world22 gap37) ── /fable32 ──
const FREE_GATE = (x, z) => !gap37(x, z) && (houseFloor(x, z) || FREE26(x, z));
// ── fable32 (build 27) ── while his blood role is on, the lowest steps by the altar's west face too (world22 westStrip27): functions of
// their own, so guide27's grid (cached by its function) is planned again ── /fable32 ──
const FREE_W = (x, z) => FREE(x, z) || westStrip27(x, z);
const FREE26_W = (x, z) => FREE_W(x, z) && !LISHKA26(x, z);
const freeFor = (p) => (HOUSE22.on ? (HOUSE22.gate ? FREE_GATE : FREE_HOUSE) : WEST27.on ? (p && LISHKA26(p.x, p.z) ? FREE_W : FREE26_W) : p && LISHKA26(p.x, p.z) ? FREE : FREE26);
const CSS = `.f31-zoom{position:fixed;top:calc(env(safe-area-inset-top,0px) + 60px);right:12px;z-index:31;min-width:96px;height:44px;padding:0 12px;border-radius:22px;border:2px solid rgba(255,236,190,.75);background:rgba(28,20,10,.78);color:#FFF6DA;font:800 15px/1 "Heebo",system-ui,sans-serif;direction:rtl;display:flex;align-items:center;justify-content:center;gap:6px;pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.f31-zoom i{font-style:normal;font-size:20px}.f31-zoom.on{background:#C8923A;color:#2A1804;border-color:#FFF1C8}
.f31-me{position:fixed;left:0;top:0;z-index:23;pointer-events:none;padding:3px 9px;border-radius:10px;background:#FFD66E;color:#2A1804;font:900 15px/1.1 "Heebo",system-ui,sans-serif;direction:rtl;box-shadow:0 0 0 2px #2A1804;transform:translate(-999px,-999px)}
.f31-me::after{content:"";position:absolute;left:50%;bottom:-8px;margin-left:-6px;border:6px solid transparent;border-top-color:#FFD66E}
body.sh-on .tw-ov,body.sh-on .tw-lift,body.sh-on .tw-tip{display:none!important}
body.sh-on .tw-btn{width:112px;height:112px}
body.sh-on .gm.tw-on .tw-zone{width:50vw;top:0}
body.sh-on .tw-btn .tw-lb{font:900 13px/1.1 "Heebo",system-ui,sans-serif;max-width:96px;white-space:normal;text-align:center}
body.sh-on .tw-btn.f31-go{background:radial-gradient(circle at 40% 30%,#E9C46A,#8A5A14);border-color:#FFF1C8}
.s29-pc.taken{z-index:12!important}
.f31-off{display:none!important}
.tw-btn.f31-arr{box-shadow:0 0 0 6px rgba(255,214,110,.85),0 0 30px 12px rgba(255,200,80,.9)!important;border-color:#FFF1B8!important;transition:box-shadow .08s}
.tw-btn.down{filter:brightness(1.3)}
.f31-zl{position:fixed;top:calc(env(safe-area-inset-top,0px) + 112px);right:12px;z-index:31;display:flex;gap:8px}
.f31-zl button{width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,236,190,.75);background:rgba(28,20,10,.78);color:#FFF4DC;font:900 24px/1 "Heebo",system-ui,sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.f31-zl button:active{background:#C8923A;color:#2A1804}
.f31-zl button[disabled]{opacity:.35}
/* ── fable32 (build 5) ── the prompt button beside the thing (Roblox's ProximityPrompt): 68 px, world-anchored, the verb big; the hold ring fills over 1 s while pressed */
body.sh-on .tw-btn.f31-prompt{position:fixed!important;left:0;top:0;right:auto!important;bottom:auto!important;width:68px;height:68px;margin:-34px 0 0 -34px;z-index:26;opacity:1;border-width:3px;border-color:#FFF1C8;background:radial-gradient(circle at 40% 30%,#E9C46A,#8A5A14);box-shadow:0 4px 14px rgba(0,0,0,.5);transition:none}
body.sh-on .tw-btn.f31-prompt .tw-ic{font-size:24px}
body.sh-on .tw-btn.f31-prompt .tw-lb{font:900 11px/1.05 "Heebo",system-ui,sans-serif;max-width:60px}
body.sh-on .tw-btn.f31-prompt::after{display:none}
body.sh-on .tw-btn.f31-far{opacity:0!important;pointer-events:none!important}
.f31-ring{position:absolute;inset:-7px;width:calc(100% + 14px);height:calc(100% + 14px);pointer-events:none;transform:rotate(-90deg)}
.f31-ring circle{fill:none;stroke:#FFF6DA;stroke-width:4;stroke-dasharray:100;stroke-dashoffset:100;stroke-linecap:round}
body.sh-on .tw-btn.f31-prompt.down .f31-ring circle{animation:f31ring 1s linear forwards}
@keyframes f31ring{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.f31-tag{position:fixed;left:0;top:0;z-index:25;pointer-events:none;padding:2px 8px;border-radius:8px;background:rgba(28,20,10,.78);color:#FFF4DC;font:800 12px/1.2 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap;transform:translate(-999px,-999px)}
/* build 5.1 — the stick drawn lightly (the owner: "בצורה יותר מגניבה של אבק"): a faint ring, a small knob; the speed shows as dust at his heels (draw) */
body.sh-on .tw-base{background:transparent;border:1.5px solid rgba(255,236,190,.45);box-shadow:none;width:104px;height:104px;margin:-52px 0 0 -52px}
body.sh-on .tw-knob{width:40px;height:40px;margin:-20px 0 0 -20px;opacity:.85;box-shadow:0 0 12px 2px rgba(255,214,110,.45)}
body.sh-on .tw-zone .tw-tip{display:none}
body.sh-on .sh-hint{bottom:calc(env(safe-area-inset-bottom,0px) + 64px)}
/* the hotbar: three slots at the foot, the one in hand lit */
.f31-hot{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);transform:translateX(-50%);z-index:24;display:flex;gap:8px;direction:rtl;pointer-events:none}
.f31-hot i{width:46px;height:46px;border-radius:10px;border:2px solid rgba(255,236,190,.55);background:rgba(28,20,10,.72);display:flex;align-items:center;justify-content:center;font:26px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;opacity:.55}
.f31-hot i.on{opacity:1;border-color:#FFD66E;background:rgba(200,146,58,.85);box-shadow:0 0 0 2px rgba(255,214,110,.5)}`;
const MARK24 = { bg: 'rgba(28,20,10,.7)', fg: '#FFD66E' };   // ── recovered (build 24) ── (the strong path's ▼ over the place: its label's colours; the name is the recovery's)
function css(doc) { if (!doc || doc.getElementById('f31-css')) return; const s = doc.createElement('style'); s.id = 'f31-css'; s.textContent = CSS; doc.head.appendChild(s); }

export function createFlow31(o = {}) {
  const E = o.E, view = o.view || null, S = o.world || null, doc = typeof document !== 'undefined' ? document : null;
  const STN = (o.stations && o.stations.STATIONS) || {};
  css(doc);
  const hp = { x: 0, y: 16, z: 0, yaw: 0 };
  const hero = () => { try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const gy = (x, z) => { try { const g = S && S.groundAt ? S.groundAt(x, z) : NaN; return Number.isFinite(g) ? g : 16; } catch (e) { return 16; } };
  const st = { pts: null, key: '', t: 0, ox: NaN, oz: NaN, zoom: 0, hold: false, holds: 0, n: 0, discs: 0, next: null, L: 0, shown: [], cue: null };
  const layer = layerOf(o.root || (doc && doc.body));
  /* the zoom-out button (FLOW31 (5)): a hold — never a gesture on the world */
  let zb = null, me = null, zl = null;
  const ZL = [{ d: 0.7, el: -0.05 }, { d: 1, el: 0 }, { d: 1.45, el: 0.12 }, { d: 2.1, el: 0.28 }, { d: 3.0, el: 0.45 }];   // ── fable32 ── ── /fable32 ──
  if (doc && globalThis.__SH_FIXEDCAM === false) {   // ── fable32 (build 4) ── (the fixed camera fits the frame by itself: no zoom buttons, no "מבט על") ── /fable32 ──
    zb = doc.createElement('button'); zb.type = 'button'; zb.className = 'f31-zoom'; zb.dataset.sh = 'zoom'; zb.setAttribute('aria-label', 'מבט על — החזיקו');
    zb.innerHTML = '<i aria-hidden="true">🔭</i><span>מבט על</span>';
    const on = (e) => { e.preventDefault(); e.stopPropagation(); if (st.hold) return; st.hold = true; st.holds++; zb.classList.add('on'); try { zb.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ } };
    const off = (e) => { if (e) { e.preventDefault(); e.stopPropagation(); } st.hold = false; zb.classList.remove('on'); };
    zb.addEventListener('pointerdown', on); zb.addEventListener('pointerup', off); zb.addEventListener('pointercancel', off); zb.addEventListener('lostpointercapture', () => off());
    zb.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
    zb.addEventListener('contextmenu', (e) => e.preventDefault());
    doc.body.appendChild(zb);
    me = doc.createElement('div'); me.className = 'f31-me'; me.textContent = 'אני'; (layer || doc.body).appendChild(me);
    // ── fable32 ── the zoom level: − / + (the owner 13.10: "אגודל ימין לא מצליח לעשות זום-אאוט ולהרחיק קצת פרופורציות") — five steps,
    // 14…60 amot, the camera a little higher the farther; kept between rounds (localStorage) ── /fable32 ──
    zl = doc.createElement('div'); zl.className = 'f31-zl'; zl.dir = 'ltr';
    zl.innerHTML = '<button type="button" data-sh="zoom-" aria-label="להתרחק">−</button><button type="button" data-sh="zoom+" aria-label="להתקרב">+</button>';
    const [bm, bp] = zl.querySelectorAll('button');
    const setZ = (i) => { st.zl = Math.max(0, Math.min(ZL.length - 1, i)); SHARED.zoomLvl = ZL[st.zl]; try { localStorage.setItem('sh.zoom', String(st.zl)); } catch (e) { /* */ } bm.disabled = st.zl >= ZL.length - 1; bp.disabled = st.zl <= 0; };
    const stopE = (e) => { e.preventDefault(); e.stopPropagation(); };
    bm.addEventListener('pointerdown', (e) => { stopE(e); setZ(st.zl + 1); }); bp.addEventListener('pointerdown', (e) => { stopE(e); setZ(st.zl - 1); });
    for (const b of [bm, bp]) { b.addEventListener('click', stopE); b.addEventListener('contextmenu', stopE); }
    doc.body.appendChild(zl);
    { let i = 1; try { const v = parseInt(localStorage.getItem('sh.zoom'), 10); if (Number.isFinite(v)) i = v; } catch (e) { /* */ } setZ(i); }
    st.setZ = setZ;
  }
  const btn = () => (doc ? doc.querySelector('.gm.tw-on .tw-btn') || doc.querySelector('.tw-btn') : null);
  // ── fable32 (build 5) ── the hotbar (Roblox): three tools, the one the next act uses lit; a tag over the thing with its name
  const TOOL32 = { song: 'basket', wood: 'axe', oil: 'bowl', salt: 'bowl', bake: 'basket', pen: 'basket', lamb: 'basket', kiyor: 'water', samicha: 'knife', shechita: 'knife', zerika: 'bowl', melika: 'knife', mitzui: 'bowl', nituach: 'basket', kevesh: 'basket', haktara: 'basket', kemitza: 'basket', hagasha: 'basket' };
  let hot = null, tag = null;
  if (doc) {
    hot = doc.createElement('div'); hot.className = 'f31-hot'; hot.innerHTML = '<i data-t="axe" title="גרזן">🪓</i><i data-t="knife" title="סכין">🔪</i><i data-t="bowl" title="מזרק">🏺</i><i data-t="basket" title="סל">🧺</i><i data-t="water" title="דלי">💧</i>'; doc.body.appendChild(hot);
    tag = doc.createElement('div'); tag.className = 'f31-tag'; doc.body.appendChild(tag);
  }
  // ── /fable32 ──

  /* the next place and its path */
  function plan(h, p) {
    // ── recovered (16–26c) ── on the altar: down the ramp first (rampWay), then the court's floors; to the altar: straight to it;
    // the floors by the place (freeFor: round the chambers' block, the house's floor)
    const ramp = rampWay(h.x, h.z), ok = freeFor(p),
      pts = ramp.length && !onHigh(p.x, p.z) ? ramp.concat(planPath(ramp[ramp.length - 1].x, ramp[ramp.length - 1].z, p.x, p.z, ok, placeGround, null) || [{ x: p.x, z: p.z }])
        : onHigh(p.x, p.z) ? [{ x: p.x, z: p.z }]
        : planPath(h.x, h.z, p.x, p.z, ok, placeGround, null) || [{ x: p.x, z: p.z }];
    const out = [{ x: h.x, z: h.z }]; for (const q of pts) out.push({ x: q.x, z: q.z });
    if (Math.hypot(out[out.length - 1].x - p.x, out[out.length - 1].z - p.z) > 0.3) out.push({ x: p.x, z: p.z });
    let Lw = 0; for (let i = 1; i < out.length; i++) Lw += Math.hypot(out[i].x - out[i - 1].x, out[i].z - out[i - 1].z);
    st.pts = out; st.L = Lw; st.ox = h.x; st.oz = h.z; st.t = 0;
  }
  function step(dt) {
    const s = E && E.state ? E.state() : null, run = s && s.phase === 'run';
    const n = run && E.flowNext ? E.flowNext() : null; st.next = n;
    const h = hero();
    // (the chips the frame may show: the taken pilgrim's, the next place's, the gate's — FLOW31 (4))
    const taken = run && s.carried != null;
    const shownSt = new Set(['gate']); if (n && n.kind === 'station') shownSt.add(n.id);
    if (E && typeof E.shown33 === 'function') { try { for (const id of E.shown33()) shownSt.add(id); } catch (e) { /* */ } }   // ── fable32 (build 7) ── (the day: every open station has its chip — the Roblox way) ── /fable32 ──
    SHARED.f31 = { st: shownSt, taken, pil: (P) => (taken ? P.state === 'taken' : P.state === 'wait' || P.state === 'atStation'), top: null };
    // (the cue: the next place's chip alone pulses; the follow camera turns toward it)
    const cueId = n && n.kind === 'station' ? n.id : null;
    if (cueId !== st.cue) { const old = st.cue; st.cue = cueId; try { if (old && o.stations && o.stations.cue) o.stations.cue(old, false); if (cueId && o.stations && o.stations.cue) o.stations.cue(cueId, true); } catch (e) { /* */ } }
    // (the path: re-planned when the place changes, or he moved off its start)
    const acting = run && s.acting;
    const p = n && !acting && n.kind === 'station' ? n.at : null;   // (the path only to a station: a pilgrim at the line comes to him)
    if (!p) { st.pts = null; st.key = ''; }
    else {
      const key = `${n.id}:${n.pid || ''}:${Math.round(p.x)}:${Math.round(p.z)}`, far = Math.hypot(p.x - h.x, p.z - h.z);
      st.t += dt;
      if (far <= F31.reach) st.pts = null;
      else if (key !== st.key || !st.pts || (st.t >= F31.replanS && Math.hypot(h.x - st.ox, h.z - st.oz) > F31.replanMove)) { st.key = key; plan(h, p); }
      else if (st.pts) { st.pts[0].x = h.x; st.pts[0].z = h.z; }
    }
    // (the button: the walk state looks like a way to go, the act state like the work)
    const b = btn(); if (b) { let sp = null; try { sp = run && E && E.work ? E.work(h) : null; } catch (e) { sp = null; } /* ── fable32 (build 5) ── (the engine's own word: __TWIN.spec() is a reduced copy) ── /fable32 ── */ const go = !!(sp && /^sh:go:/.test(sp.job || '')); if (b.__f31go !== go) { b.__f31go = go; b.classList.toggle('f31-go', go); }
      // ── fable32 (build 5) ── the prompt: within reach of the thing (or in its act) the button stands BESIDE the thing, 68 px, with the hold ring; far away it is gone (the stick, the path and the chip are the way)
      if (!b.querySelector('.f31-ring')) { const sv = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('class', 'f31-ring'); sv.setAttribute('viewBox', '0 0 36 36'); sv.innerHTML = '<circle cx="18" cy="18" r="15.9" pathLength="100"/>'; b.appendChild(sv); }
      let at = null, name = '';
      if (run && sp && (sp.near31 || sp.act31) && sp.id31 && sp.id31 !== 'gate' && o.stations && o.stations.STATIONS && o.stations.STATIONS[sp.id31]) { const S0 = o.stations.STATIONS[sp.id31]; at = { x: S0.at.x, y: (S0.at.y || 16) + 2.2, z: S0.at.z }; name = S0.he || ''; }
      else if (run && sp && sp.job === 'sh:take' && globalThis.__S29P && __S29P.list) { const w = __S29P.list().filter((P) => P.state === 'wait').sort((p, q) => p.patience - q.patience)[0]; if (w && w.pos) { at = { x: w.pos.x, y: (w.pos.y || 16) + 4.5, z: w.pos.z }; name = 'עולה הרגל'; } }
      const q = at && view ? view.project(at.x, at.y, at.z) : null;
      if (q && q.on) {
        const W = innerWidth || 844, H = innerHeight || 390, px = Math.max(W * 0.51 + 40, Math.min(W - 60, q.x + 62)), py = Math.max(70, Math.min(H - (SHARED.b17 ? 104 : 60), q.y));   // ── recovered (16–26c) ── (off the stick's half; above the chips' bar in b17)
        if (!b.__f31p) { b.__f31p = true; b.classList.add('f31-prompt'); } b.classList.remove('f31-far'); b.style.transform = `translate(${Math.round(px)}px,${Math.round(py)}px)${b.classList.contains('down') ? ' scale(.92)' : ''}`;
        if (tag) { tag.textContent = name; tag.style.transform = `translate(${Math.round(px - 30)}px,${Math.round(py - 60)}px)`; }
        SHARED.rects.push([px, py, 80, 80]);
        SHARED.prompt31 = (sp && sp.id31) || null;   // ── recovered (16–26c) ── (whose prompt stands now)
      } else {
        if (b.__f31p) { b.__f31p = false; b.classList.remove('f31-prompt'); b.style.transform = ''; if (tag) tag.style.transform = 'translate(-999px,-999px)'; }
        SHARED.prompt31 = null;   // ── recovered (16–26c) ──
        const far = !!(run && sp && (sp.go31 || sp.job === 'sh:wait')); if (b.__f31far !== far) { b.__f31far = far; b.classList.toggle('f31-far', far); }
      }
      if (hot) { const tl = run && sp && sp.id31 ? TOOL32[sp.id31] || '' : ''; if (hot.__t !== tl) { hot.__t = tl; for (const i of hot.children) i.classList.toggle('on', i.dataset.t === tl); } const dsp = run ? '' : 'none'; if (hot.style.display !== dsp) hot.style.display = dsp; }
      // ── /fable32 ──
    }
    if (zb) { const dsp = run ? '' : 'none'; if (zb.style.display !== dsp) { zb.style.display = dsp; if (!run) { st.hold = false; zb.classList.remove('on'); } } if (zl && zl.style.display !== dsp) zl.style.display = dsp; }   // (the button lives in the round only: never over the end card)
    // (the zoom: up in 0.35 s while held, down in 0.6 s)
    const zw = st.hold && run ? 1 : 0; st.zoom += Math.sign(zw - st.zoom) * Math.min(Math.abs(zw - st.zoom), dt > 0 ? dt / (zw ? F31.zoomUp : F31.zoomDown) : 0);
    const ze = st.zoom * st.zoom * (3 - 2 * st.zoom);
    SHARED.zoom31 = ze > 0.001 ? { k: ze, el: F31.zoomEl, d: F31.zoomD, mid: p ? { x: (h.x + p.x) / 2, z: (h.z + p.z) / 2 } : null } : null;
  }
  function draw(k, tt, dt) {
    step(dt || 0); st.n++;
    const h = hero();
    // (the kohen's head and the zoom button: no chip on them — LIGHT28's claim zone, kept for the shift's own chips)
    if (view) { try { const ft = view.project(h.x, (h.y || 16), h.z), hd = view.project(h.x, (h.y || 16) + 6.6, h.z); if (ft.on && hd.on) { const y0 = Math.min(ft.y, hd.y), y1 = Math.max(ft.y, hd.y), w = Math.max(40, (y1 - y0) * 0.42); SHARED.rects.push([ft.x, y0 + (y1 - y0) * 0.22, w, (y1 - y0) * 0.44]); } } catch (e) { /* */ } }
    // (the first round's hint line at the foot: no chip under it — the pilgrim's chip is never covered)
    if (doc) { if (!st.hintAt || (st.n % 15) === 0) { const he = doc.querySelector('.sh-hint.on'); const q = he && he.getBoundingClientRect(); st.hintR = q && q.width ? [q.left + q.width / 2, q.top + q.height / 2, q.width + 8, q.height + 8] : null; st.hintAt = 1; } if (st.hintR) SHARED.rects.push(st.hintR); }
    if (zb) { const r = zb.__r || (zb.__r = (() => { const q = zb.getBoundingClientRect(); return q.width ? [q.left + q.width / 2, q.top + q.height / 2, q.width + 6, q.height + 6] : null; })()); if (r) SHARED.rects.push(r); }
    if (zl) { const r = zl.__r || (zl.__r = (() => { const q = zl.getBoundingClientRect(); return q.width ? [q.left + q.width / 2, q.top + q.height / 2, q.width + 6, q.height + 6] : null; })()); if (r) SHARED.rects.push(r); }   // ── fable32 ── ── /fable32 ──
    // ── fable32 (build 8) ── the merchant at the gate: a man in a dark cloak by a basket, a slow turn, a ring on the floor
    { const M = SHARED.merchant33; if (M) { const my = gy(M.x, M.z); try { man(k, L(M.x), L(M.z), L(my), { pose: 'stand', u: 0.5, yaw: Math.PI + 0.3 * Math.sin(tt * 0.7), t: tt, robe: '#5A3A22', head: '#3A2A18' }); } catch (e) { /* */ } k.c(L(M.x) + 0.8, L(M.z) + 0.3, L(my) + 0.2, 0.32, 0.4, '#B08A4A'); if (!SHARED.b17) k.ring(L(M.x), L(M.z), L(my) + 0.02, 1.2 + 0.1 * Math.sin(tt * 4), '!#FFD24A', 18); } }   // ── recovered (build 17) ── (no ring in b17)
    // ── fable32 (build 9) ── the pen: a low fence, six lambs (a gold ear-ring = מבוקר), the lost one wandering or following
    { const LB = SHARED.lambs33; if (LB && o.stations && o.stations.STATIONS && o.stations.STATIONS.pen) { const P = o.stations.STATIONS.pen.at, py = gy(P.x, P.z);
        if (!st.penOn) { st.penOn = true; } for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, fx = P.x + Math.cos(a) * 5.2, fz = P.z + Math.sin(a) * 3.4; k.c(L(fx), L(fz), L(py) + 0.45, 0.06, 0.9, '#8A6A45'); } k.ring(L(P.x), L(P.z), L(py) + 0.01, L(4.4), '#8A6A45', 14);
        for (const q of LB) { const a = (q.i / 6) * Math.PI * 2 + 0.4, lx = P.x + Math.cos(a) * 3.0, lz = P.z + Math.sin(a) * 1.8; try { lamb(k, L(lx), L(lz), L(py), { yaw: a + Math.PI / 2 + 0.3 * Math.sin(tt * 0.5 + q.i), scale: 0.85, mark: q.ok, glow: q.ok ? 0.3 : 0, head: 0.3 + 0.3 * Math.sin(tt * 0.8 + q.i) }); } catch (e) { /* */ } } }
      const Lo = SHARED.lost33; if (Lo) { const ly = gy(Lo.x, Lo.z); try { lamb(k, L(Lo.x), L(Lo.z), L(ly), { yaw: Lo.yaw, scale: 0.85, step: Lo.walk ? tt * 9 : 0, glow: 0.6, head: 0.6 }); } catch (e) { /* */ } if (!SHARED.b17 || (st.next && st.next.id === 'lamb')) k.ring(L(Lo.x), L(Lo.z), L(ly) + 0.02, 1.0 + 0.15 * Math.sin(tt * 5), '!#FFD24A', 16); } }   // ── recovered (build 17) ── (in b17 only when the lamb is next)
    // ── fable32 (build 5.1) ── the dust at his heels while he runs: a trail of pale puffs that shrink and vanish in 0.7 s
    { const now = performance.now(); if (!st.tr) { st.tr = []; st.tx = h.x; st.tz = h.z; st.tt = now; }
      const dtp = (now - st.tt) / 1000; if (dtp > 0.04) { const sp = Math.hypot(h.x - st.tx, h.z - st.tz) / dtp; st.tx = h.x; st.tz = h.z; st.tt = now; if (sp > 5 && sp < 60) { const yaw = h.yaw || 0; st.tr.push({ x: h.x - Math.sin(yaw) * 0.6 + (Math.random() - 0.5) * 0.5, z: h.z - Math.cos(yaw) * 0.6 + (Math.random() - 0.5) * 0.5, t: now }); if (st.tr.length > 14) st.tr.shift(); } }
      for (let i = st.tr.length - 1; i >= 0; i--) { const P = st.tr[i], u = (now - P.t) / 700; if (u >= 1) { st.tr.splice(i, 1); continue; } const r = 0.16 + 0.42 * u; k.c(L(P.x), L(P.z), L(gy(P.x, P.z)) + 0.04 + 0.5 * u, r, 0.05, u < 0.5 ? '!#F7EFDC' : '!#E6DCC4'); } }
    // ── /fable32 ──
    // ── fable32 (build 14) ── the owner: "אם אני חוטב עץ אני צריך גרזן… להעמיס את העצים… ולראות מה אני עושה": the gear on the world's own figure (not in an act —
    // there the act draws him): the axe in his right hand within reach of the wood; the back-basket with his logs sticking out, wherever he walks; the flights —
    // a split log arcs from the block into the basket, the logs arc from the ramp's top onto the pyre
    { const G = E && typeof E.gear === 'function' ? E.gear() : null;
      const H35 = globalThis.__HERO35 && globalThis.__HERO35.loaded ? globalThis.__HERO35 : null;   // ── fable32 (build 15) ── (the real kohen: the props on his bones) ── /fable32 ──
      if (G && (!G.acting || (G.acting === 'kevesh' && H35)) && (G.axe || G.carrying)) { const yaw = h.yaw || 0, fx0 = Math.sin(yaw), fz0 = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw); let a = L(h.x), s2 = L(h.z), y = L(h.y || 16);   // ── recovered (16–26c) ── (in the ramp's act too, on the real kohen)
        if (H35) { const hr = H35.handR(), ch = H35.bone('chest'); if (G.axe && hr) { const hx = L(hr.x), hz = L(hr.z), hy = L(hr.y); k.c(hx, hz, hy + 0.3, 0.04, 1.05, '#7A5A3A', { pitch: 0.18, yaw: -yaw }); k.b(hx + fx0 * 0.14, hz + fz0 * 0.14, hy + 0.78, 0.34, 0.09, 0.2, '#9AA3AA', { yaw: -yaw }); k.b(hx + fx0 * 0.28, hz + fz0 * 0.28, hy + 0.78, 0.06, 0.1, 0.22, '#C9CED2', { yaw: -yaw }); }
          if (G.carrying && ch) { const v = H35.at('chest'), hs = H35.state(), sw = (hs.sp > 0.5 ? Math.sin(tt * (5 + 2.5 * Math.min(2, hs.rate || 1))) * 0.09 : 0) + (G.sw || 0);   // ── recovered (16–26c) ── (the basket sways with his gait, and with G.sw)
            const bx = L(h.x) - fx0 * 0.38 + rx * sw * 0.35, bz = L(h.z) - fz0 * 0.38 + rz * sw * 0.35, by = v ? L(v.y) + 0.05 : y + 0.95, tilt = { roll: sw, yaw: -yaw }; k.c(bx, bz, by, 0.26, 0.52, '#B08A58', tilt); k.c(bx, bz, by - 0.25, 0.27, 0.03, '#8A6A45', tilt); k.c(bx, bz, by + 0.25, 0.27, 0.03, '#8A6A45', tilt); const n = Math.min(10, G.logs | 0); for (let i = 0; i < n; i++) { const ox = ((i % 3) - 1) * 0.1 + sw * 0.6, oz = (Math.floor(i / 3) - 1) * 0.08; k.c(bx + rx * ox + fx0 * oz, bz + rz * ox + fz0 * oz, by + 0.3 + 0.1 * (i % 2), 0.045, 0.55, i % 2 ? '#A07A4A' : '#8A6A45', { pitch: 0.25 * ((i % 3) - 1), roll: 0.15 * (i % 2) + sw }); } }
        } else {
        if (G.axe) { const hx = a + rx * 0.42 + fx0 * 0.16, hz = s2 + rz * 0.42 + fz0 * 0.16; k.c(hx, hz, y + 1.0, 0.04, 1.05, '#7A5A3A', { pitch: 0.18, yaw: -yaw }); k.b(hx + fx0 * 0.14, hz + fz0 * 0.14, y + 1.48, 0.34, 0.09, 0.2, '#9AA3AA', { yaw: -yaw }); k.b(hx + fx0 * 0.28, hz + fz0 * 0.28, y + 1.48, 0.06, 0.1, 0.22, '#C9CED2', { yaw: -yaw }); }   // (the axe: the handle in the hand, the head up)
        if (G.carrying) { const bx = a - fx0 * 0.32, bz = s2 - fz0 * 0.32; k.c(bx, bz, y + 0.95, 0.26, 0.52, '#B08A58'); k.c(bx, bz, y + 0.7, 0.27, 0.03, '#8A6A45'); k.c(bx, bz, y + 1.2, 0.27, 0.03, '#8A6A45'); k.b(a - fx0 * 0.12, s2 - fz0 * 0.12, y + 1.25, 0.05, 0.4, 0.05, '#C9B48E', { pitch: 1.2, yaw: -yaw });   // (the basket on his back, its straps)
          const n = Math.min(10, G.logs | 0); for (let i = 0; i < n; i++) { const ox = ((i % 3) - 1) * 0.1, oz = (Math.floor(i / 3) - 1) * 0.08; k.c(bx + rx * ox + fx0 * oz, bz + rz * ox + fz0 * oz, y + 1.25 + 0.1 * (i % 2), 0.045, 0.55, i % 2 ? '#A07A4A' : '#8A6A45', { pitch: 0.25 * ((i % 3) - 1), roll: 0.15 * (i % 2) }); } } } }   // (the logs sticking out, one a chop)
      const FX = E && typeof E.fx33 === 'function' ? E.fx33() : null;
      if (FX && FX.length) for (const f of FX) { const u = Math.max(0, Math.min(1, f.t / f.dur)), n = Math.min(10, f.n | 0 || 1), arc = f.arc != null ? f.arc : 2.2; for (let i = 0; i < n; i++) { const ui = Math.max(0, Math.min(1, (u * f.dur - i * 0.05) / (f.dur - 0.05 * (n - 1 || 0) || f.dur))); if (ui <= 0 || ui >= 1) continue; const to = f.to || f.from, x = f.from.x + (to.x - f.from.x) * ui, z = f.from.z + (to.z - f.from.z) * ui, y0 = f.from.y + (to.y - f.from.y) * ui + arc * Math.sin(ui * Math.PI);
          // ── recovered (16–26c) ── (f.arc: the flight's height; 'lay1': a whole log laid on the pyre, turning to its place across or along)
          if (f.kind === 'lay1') k.c(L(x), L(z), L(y0), L(0.22), L(3) * (0.75 + 0.25 * ui), '#A07A4A', { pitch: Math.PI / 2, yaw: (to.cross ? Math.PI / 2 : 0) * ui + (1 - ui) * 0.6 });
          else k.c(L(x), L(z), L(y0), 0.06, 0.45, '#A07A4A', { pitch: Math.PI / 2, yaw: ui * 6 + i }); } } }
    // ── recovered (16–26c) ── the pyre: E.pyre33() = { n, slots: [{ x, y, z, cross }] }, the logs laid so far (the newest lightest, the old ones
    // charred), each but the one still in flight
    { const P = E && typeof E.pyre33 === 'function' ? E.pyre33() : null;
      if (P && P.n) { const fly = E.fx33 ? E.fx33().filter((f) => f.kind === 'lay1') : [];
        for (let i = 0; i < P.n; i++) { const s = P.slots[i]; if (fly.some((f) => f.to && Math.abs(f.to.y - s.y) < 0.01 && Math.abs(f.to.x - s.x) < 0.01 && Math.abs(f.to.z - s.z) < 0.01 && f.t < f.dur)) continue;
          const age = P.n - 1 - i; k.c(L(s.x), L(s.z), L(s.y), L(0.22), L(3), age === 0 ? '#B48A55' : age < 3 ? '#8A6440' : '#4A3220', { pitch: Math.PI / 2, yaw: s.cross ? Math.PI / 2 : 0 }); } } }
    // ── /fable32 ──
    // ── fable32 (build 11) ── the night corner in בית המוקד: the hall's fire (a low brazier) and what פרוטות bought — a rug, an oil lamp
    { const Mk = SHARED.moked33; if (Mk) { const my = gy(Mk.x, Mk.z); k.c(L(Mk.x + 6), L(Mk.z), L(my) + 0.25, 0.55, 0.5, '#5A4630'); k.c(L(Mk.x + 6), L(Mk.z), L(my) + 0.6, 0.3, 0.25, '!#FF9A3A'); if (Mk.rug) k.b(L(Mk.x - 3), L(Mk.z + 2), L(my) + 0.03, 1.6, 1.0, 0.04, '#8A3A3A'); if (Mk.lamp) { k.c(L(Mk.x - 3), L(Mk.z - 2), L(my) + 0.35, 0.12, 0.5, '#B98A48'); k.c(L(Mk.x - 3), L(Mk.z - 2), L(my) + 0.72, 0.07, 0.1, '!#FFD66E'); } } }
    // ── /fable32 ──
    // the gold discs
    let nd = 0;
    if (st.pts && st.pts.length > 1) {
      const pts = st.pts, wave = (tt * 9) % 6;
      let acc = 0.9, along = 0;   // (the first disc a step ahead of his feet)
      for (let i = 1; i < pts.length && nd < F31.maxDiscs; i++) {
        const a = pts[i - 1], b = pts[i], seg = Math.hypot(b.x - a.x, b.z - a.z); if (seg < 1e-3) continue;
        while (acc <= seg && nd < F31.maxDiscs) {
          const u = acc / seg, x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u, y = gy(x, z), d = along + acc;
          const pulse = Math.max(0, 1 - Math.abs(((d - wave * F31.gap * 2) % 12 + 12) % 12 - 6) / 2.2);
          const flash = SHARED.pulse31 ? Math.max(0, 1 - (performance.now() - SHARED.pulse31) / 1200) : 0;   // ── fable32 ── (the away button: the whole path flares) ── /fable32 ──
          k.c(L(x), L(z), L(y) + 0.045, (0.21 + 0.07 * pulse + 0.18 * flash) * (SHARED.strong24 ? 1.45 : 1), 0.03, pulse > 0.5 || flash > 0.4 || SHARED.strong24 ? '!#FFF6C8' : '!#FFC21F');   // ── recovered (build 24) ── (the strong path: bigger, light)
          nd++; acc += F31.gap;
        }
        acc -= seg; along += seg;
      }
      // the place itself: a wider gold ring
      const e = pts[pts.length - 1];
      // ── recovered (build 17) ── in b17 the ring warms with SHARED.hot17 (focus17's: 0…1), wider, quicker, orange, an inner flash
      if (SHARED.b17) { const hot = Math.max(0, Math.min(1, SHARED.hot17 || 0)); k.ring(L(e.x), L(e.z), L(gy(e.x, e.z)) + 0.01, 0.62 + 0.45 * hot + 0.06 * Math.sin(tt * (5 + 5 * hot)), hot > 0.66 ? '!#FF9A3A' : hot > 0.33 ? '!#FFB84A' : '!#FFD24A', 20); if (hot > 0.4) k.ring(L(e.x), L(e.z), L(gy(e.x, e.z)) + 0.015, 0.3 + 0.25 * hot * (0.5 + 0.5 * Math.sin(tt * 8)), '!#FFF1B8', 16); }
      else k.ring(L(e.x), L(e.z), L(gy(e.x, e.z)) + 0.01, 0.62 + 0.06 * Math.sin(tt * 5), '!#FFD24A', 18);
      if (SHARED.strong24) k.label('▼', L(e.x), L(e.z), L(gy(e.x, e.z) + 3.4 + 0.6 * Math.abs(Math.sin(tt * 4))), 0.7, MARK24);   // ── recovered (build 24) ── (a bobbing ▼ over the place)
    }
    // ── fable32 (build 3) ── "הגעת": the landing ring opens on the floor at the stand for 1 s; the big button lights gold for 1 s
    if (SHARED.arrive32) { const ag = (performance.now() - SHARED.arrive32.t) / 1000; if (ag < 1) { const A = SHARED.arrive32, u = ag; k.ring(L(A.x), L(A.z), L(gy(A.x, A.z)) + 0.02, 0.5 + 1.8 * u, '!#FFF1B8', 24); k.ring(L(A.x), L(A.z), L(gy(A.x, A.z)) + 0.015, 0.3 + 1.2 * u * u, '!#FFD24A', 20); if (!A.lit && doc) { A.lit = 1; const b = doc.querySelector('.tw-btn'); if (b) { b.classList.add('f31-arr'); setTimeout(() => b.classList.remove('f31-arr'), 1000); } } } }
    // ── /fable32 ──
    st.discs = nd; SHARED.path31 = st.pts && st.pts.length > 1 && st.next && st.next.kind === 'station' ? st.pts : null;   // (the camera looks along a way to a station; the line comes to him)
    // "אני" over him while the view is high
    if (me && view) { const z = SHARED.zoom31; if (z && z.k > 0.3) { const q = view.project(h.x, (h.y || 16) + 7.5, h.z); if (q.on) { me.style.transform = `translate(${Math.round(q.x - 20)}px,${Math.round(q.y - 34)}px)`; me.__on = true; } } else if (me.__on) { me.__on = false; me.style.transform = 'translate(-999px,-999px)'; } }
  }
  const off = addDrawer(o.kit, draw, -2);
  // the open field: the day's crowd out of the court east and south-east of the altar while the shift runs
  const life = () => { try { const f = globalThis.__T && __T.life; return typeof f === 'function' ? f() : f || null; } catch (e) { return null; } };   // ── recovered (16–26c) ── (__T.life: a function or the life itself)
  // ── recovered (16–26c) ── in the day (E.shown33): the day's field, and the ramp's lane off while the shift runs
  try { const day = !!(E && E.shown33), lf = life(); if (lf && lf.clearField) st.cleared = lf.clearField(day ? F31.dayField : F31.field); if (lf && lf.rampLane && day) lf.rampLane('off'); } catch (e) { /* */ }
  const api = {
    destroy() { off(); try { if (hot) hot.remove(); if (tag) tag.remove(); const b0 = btn(); if (b0) { b0.classList.remove('f31-prompt', 'f31-far'); b0.style.transform = ''; b0.__f31p = false; b0.__f31far = false; } } catch (e) { /* */ }   /* ── fable32 (build 5) ── ── /fable32 ── */ try { const lf = life(); if (lf && lf.clearField) lf.clearField(null); if (lf && lf.rampLane) lf.rampLane(0); /* ── recovered (16–26c) ── */ } catch (e) { /* */ } try { zb && zb.remove(); me && me.remove(); zl && zl.remove(); } catch (e) { /* */ } SHARED.zoomLvl = null; SHARED.f31 = null; SHARED.zoom31 = null; SHARED.path31 = null; const b = btn(); if (b) b.classList.remove('f31-go'); if (st.cue && o.stations && o.stations.cue) { try { o.stations.cue(st.cue, false); } catch (e) { /* */ } } },
    /** tests: the path, the next place, the zoom */
    state: () => ({ next: st.next ? { id: st.next.id, kind: st.next.kind } : null, discs: st.discs, pts: st.pts ? st.pts.map((q) => [Math.round(q.x * 10) / 10, Math.round(q.z * 10) / 10]) : null, L: Math.round(st.L * 10) / 10, zoom: Math.round(st.zoom * 100) / 100, hold: st.hold, holds: st.holds, cue: st.cue, n: st.n, cleared: st.cleared | 0, zl: st.zl }),
    setZoom(i) { if (st.setZ) st.setZ(i); return st.zl; },   // ── fable32 ── ── /fable32 ──
    hold(v) { st.hold = !!v; if (zb) zb.classList.toggle('on', st.hold); },
  };
  try { globalThis.__F31 = api; } catch (e) { /* tests */ }
  return api;
}
// ── /flow31 ──
