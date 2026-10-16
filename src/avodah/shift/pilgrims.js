/* ── shift29 ── pilgrims.js — the shift's pilgrims (WAVE29 SHIFT29B; docs/WAVE29-BRIEF.md "the contract"; GAME29 §2.2).
 * People come in through Nikanor's gate and wait at its inner side (the court of Israel), at most three in the line; each brings one
 * offering — 🐑 עולה (a lamb on a rope), 🕊 קן (two doves in a basket), 🌾 מנחה (a bowl of fine flour and a sheaf) — and over each head a
 * chip: the icon (28 px) and a patience bar (60×6, green → amber → deep orange, no numbers). The kohen (the player) TAKES one: he follows
 * him on his own trail, 1.2 amot behind; at a station he is RELEASED and stands. Patience runs only while he waits at the gate or stands
 * at a station with no act on him; at 0 he leaves — a grey puff, "הלך", a 0.6 s fade — no other penalty (the engine resets its combo).
 *   createPilgrims({ world, kit, gateSpot, root, view, patienceS, onTap, onLeave }) → { spawn, tick, list, take, release, remove, done, next, clear, at }
 * The figures are figures.js man/lamb in the works kit (draw.js: one frame for all). המחשה: the line's place and the people's look.
 * Never a Divine Name; nothing red. ── /shift29 ── */
import { man, lamb, SKIN, WOOL } from '../works/figures.js';
import { addDrawer, layerOf, L, placeChip, chipsTime, SHARED } from './draw.js';
import { ROUTES31 } from './route31.js';   // ── route31 ── ── /route31 ──

/** the line's head: inside the court (the priests' court, west of the דוכן's steps — the way in from Nikanor's gate; ⚑ ANCHORS has no
 *  'gate': this spot is the shift's; the court of Israel below the steps has no walk up for the kohen's path) */
export const GATE_SPOT = { x: -15, y: 16, z: 3 };
/** the line: the front first, two behind it to the south; people come up the דוכן's steps from Nikanor's gate (east) */
export const QUEUE = [[-15, 3], [-15, 6.2], [-15, 9.4]];
const SPAWN = [-4, 2.5];
// ── route31 ── the true routes (route31.js): the laver is the kohen's own act once per round, not a pilgrim's station ── /route31 ──
export const ROUTES = ROUTES31;
export const ICONS = Object.freeze({ olah: '🐑', ken: '🕊', mincha: '🌾' });
export const NAMES = Object.freeze({ olah: 'עולה', ken: 'קן', mincha: 'מנחה' });
/** the bar's colours by patience (no red: the low end is a deep orange ⚑) */
export const BAR = Object.freeze({ ok: '#4CAF50', mid: '#F2B233', low: '#E4682C' });
export const barColor = (p) => (p > 0.5 ? BAR.ok : p > 0.25 ? BAR.mid : BAR.low);
const ROBES = ['#8C7A62', '#6F7F8F', '#9A8466', '#7D6F8A', '#86906E', '#A08A70'];   // (wool and undyed cloth: no red)
const CAPS = ['#5C5242', '#E8E0CC', '#4E5A66', '#6B5A46'];
const WALK = 5.2, FOLLOW = 1.2, FADE = 0.6;
export const SIDE30 = { side: 1.6, back: 0.4, near: 5 };   // ── shift30 ── (the pilgrim at the kohen's side: 1.6 over — the figures are 6.5 amot tall, at 1.2 they cut into each other ⚑) ── /shift30 ──
const CSS = `.s29-pc{position:absolute;left:0;top:0;min-width:64px;height:44px;margin:0;padding:2px 2px 0;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;background:rgba(255,248,232,.82);border:2px solid rgba(120,90,40,.55);box-shadow:0 2px 6px rgba(0,0,0,.28);pointer-events:auto;touch-action:manipulation;cursor:pointer;z-index:6;will-change:transform;transform:translate(-999px,-999px);-webkit-user-select:none;user-select:none}
.s29-pc i{font:28px/28px "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;height:28px}
.s29-pc b{display:block;width:60px;height:6px;border-radius:3px;background:rgba(40,28,12,.35);overflow:hidden}
.s29-pc b s{display:block;height:100%;width:100%;border-radius:3px;background:${BAR.ok};transform-origin:right center;text-decoration:none}
.s29-pc.taken{border-color:#E2B65A;background:rgba(255,236,190,.95)}
.s29-pc.left,.s29-pc.done{pointer-events:none;transition:opacity .6s;opacity:0}
.s29-pc.shake{animation:s29sh .32s}
@keyframes s29sh{0%,100%{margin-left:0}25%{margin-left:-6px}75%{margin-left:6px}}
.s29-fl{position:absolute;left:0;top:0;z-index:7;pointer-events:none;font:800 20px/1 "Heebo",system-ui,sans-serif;color:#6B6458;text-shadow:0 1px 2px rgba(255,255,255,.8);direction:rtl;white-space:nowrap;animation:s29fl 1.1s ease-out forwards}
@keyframes s29fl{0%{opacity:0;transform:translate(var(--x),var(--y))}15%{opacity:1}100%{opacity:0;transform:translate(var(--x),calc(var(--y) - 34px))}}`;

export function createPilgrims(o = {}) {
  const S = o.world || null, doc = typeof document !== 'undefined' ? document : null;
  const gate = o.gateSpot || GATE_SPOT, gx = gate.x - GATE_SPOT.x, gz = gate.z - GATE_SPOT.z;
  const view = o.view || (globalThis.__T && globalThis.__T.view) || null;
  const root = layerOf(o.root || (doc && doc.body)) || null;   // (the shift's own layer: over the thumbs' zones, under the HUD)
  const gy = (x, z) => { try { const g = S && S.groundAt ? S.groundAt(x, z) : NaN; return Number.isFinite(g) ? g : 16; } catch (e) { return 16; } };
  const hp = { x: 0, y: 0, z: 0, yaw: 0 };
  const hero = () => { try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  if (doc && !doc.getElementById('s29p-css')) { const s = doc.createElement('style'); s.id = 's29p-css'; s.textContent = CSS; doc.head.appendChild(s); }
  const all = [];   // every P on the floor (left/done ones until their fade ends)
  const trail = [];   // the hero's own way (for the follower): [x, z] every 0.45 amah, the last 80
  let seq = 0, alive = true;
  const st = { spawned: 0, left: 0, done: 0, full: 0 };

  function chip(P) {
    if (!doc || !root) return null;
    const e = doc.createElement('div'); e.className = 's29-pc'; e.setAttribute('role', 'button'); e.setAttribute('aria-label', `${NAMES[P.type]} — לקחת`);
    e.dataset.pid = String(P.id); e.dataset.type = P.type;
    e.innerHTML = `<i aria-hidden="true">${P.icon}</i><b aria-hidden="true"><s></s></b>`;
    const tap = (ev) => { ev.preventDefault(); ev.stopPropagation(); if (P.state === 'left' || P.state === 'done') return; try { o.onTap && o.onTap(P); } catch (err) { /* the engine's */ } };
    e.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    e.addEventListener('click', tap);
    root.appendChild(e); P._bar = e.querySelector('s'); return e;
  }
  const slotOf = (i) => [QUEUE[i][0] + gx, QUEUE[i][1] + gz];
  const waiting = () => all.filter((P) => P.state === 'wait').sort((a, b) => a.id - b.id);
  function restack() { waiting().forEach((P, i) => { const [x, z] = slotOf(Math.min(i, QUEUE.length - 1)); P._tx = x; P._tz = z; P._slot = i; }); }

  function spawn(type, so = {}) {
    if (!alive || !ROUTES[type]) return null;
    const w = waiting(); if (w.length >= QUEUE.length) { st.full++; return null; }
    const id = ++seq, ps = so.patienceS > 0 ? so.patienceS : o.patienceS > 0 ? o.patienceS : 25;
    const P = { id, type, icon: ICONS[type], patience: 1, state: 'wait', route: ROUTES[type].slice(), step: 0, pos: { x: SPAWN[0] + gx, y: 0, z: SPAWN[1] + gz + (id % 2 ? 0.6 : -0.6) }, el: null, acting: false,
      patienceS: ps, _x: SPAWN[0] + gx, _z: SPAWN[1] + gz + (id % 2 ? 0.6 : -0.6), _yaw: Math.PI, _tx: 0, _tz: 0, _walk: 0, _ti: 0, _fade: 0, _robe: ROBES[id % ROBES.length], _cap: CAPS[(id * 3) % CAPS.length], _skin: SKIN[id % SKIN.length],
      _lx: 0, _lz: 0, _lyaw: Math.PI, _t: 0, _order: 0, _puff: 0 };
    P._lx = P._x + 1.2; P._lz = P._z;
    P.pos.y = gy(P._x, P._z);
    all.push(P); restack(); P.el = chip(P); st.spawned++;
    return P;
  }
  function take(P) {
    if (!P || P.state === 'left' || P.state === 'done') return false;
    P.state = 'taken'; P.acting = false; P._order = all.filter((q) => q.state === 'taken' && q !== P).length;
    const h = hero(); trail.length = 0; trail.push([P._x, P._z], [h.x, h.z]); P._ti = 0;
    if (P.el) P.el.classList.add('taken');
    restack(); return true;
  }
  function release(P) {
    if (!P || P.state === 'left' || P.state === 'done') return false;
    P.state = 'atStation'; P._tx = P._x; P._tz = P._z; if (P.el) P.el.classList.remove('taken');
    // (the others who follow close up)
    let i = 0; for (const q of all) if (q.state === 'taken') q._order = i++;
    return true;
  }
  function leaveNow(P, how) {
    P.state = how; P._fade = 0.0001; P.acting = false;
    if (P.el) { P.el.classList.remove('taken'); P.el.classList.add(how); }
    if (how === 'left') { st.left++; P._puff = 0.0001; float(P, 'הלך'); try { o.onLeave && o.onLeave(P); } catch (e) { /* the engine's */ } }
    else { st.done++; const g = slotOf(0); P._tx = g[0] + 4; P._tz = g[1] + 2; }
    restack();
  }
  function done(P) { if (!P || P.state === 'left' || P.state === 'done') return false; leaveNow(P, 'done'); return true; }
  function remove(P) { const i = all.indexOf(P); if (i < 0) return false; all.splice(i, 1); if (P.el) { try { P.el.remove(); } catch (e) { /* */ } P.el = null; } if (P.state !== 'left' && P.state !== 'done') P.state = 'done'; restack(); return true; }
  function float(P, text) {
    if (!doc || !root || !view) return;
    const p = view.project(P._x, gy(P._x, P._z) + 4.6, P._z); if (!p || !p.on) return;
    const f = doc.createElement('div'); f.className = 's29-fl'; f.textContent = text; f.style.setProperty('--x', `${Math.round(p.x - 20)}px`); f.style.setProperty('--y', `${Math.round(p.y - 20)}px`);
    root.appendChild(f); setTimeout(() => f.remove(), 1200);
  }

  /** the walk toward (tx, tz), at WALK amot/s (a follower: faster when he lags) → moved */
  function stepTo(P, tx, tz, dt, sp = WALK, maxS = 1e9) {
    const dx = tx - P._x, dz = tz - P._z, d = Math.hypot(dx, dz); if (d < 0.05) return false;
    const s = Math.min(d, sp * dt, maxS); if (s <= 0) return false; P._x += dx / d * s; P._z += dz / d * s;
    const want = Math.atan2(dz, dx); let dy = want - P._yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); P._yaw += dy * Math.min(1, dt * 10);
    return true;
  }
  function tick(dt) {
    if (!alive || !(dt > 0)) return;
    dt = Math.min(dt, 0.25);
    const h = hero();
    { const t = trail[trail.length - 1]; if (!t || Math.hypot(h.x - t[0], h.z - t[1]) > 0.45) { trail.push([h.x, h.z]); if (trail.length > 160) { trail.shift(); for (const P of all) if (P._ti > 0) P._ti--; } } }
    for (let i = all.length - 1; i >= 0; i--) {
      const P = all[i]; P._t += dt; P._walk = 0;
      if (P.state === 'wait' || (P.state === 'atStation' && !P.acting)) {
        P.patience = Math.max(0, P.patience - dt / P.patienceS);
        if (P.patience <= 0) { leaveNow(P, 'left'); continue; }
      }
      if (P.state === 'wait' || P.state === 'atStation') { if (stepTo(P, P._tx, P._tz, dt, P.state === 'wait' ? 3.4 : WALK)) P._walk = 1; else if (P.state === 'wait') { let dy = Math.PI - P._yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); P._yaw += dy * Math.min(1, dt * 4); } }
      else if (P.state === 'taken') {
        // (on his trail: the next point he has not reached; he stops 1.2 amot (+ 1.4 for each one ahead of him) from the kohen)
        const stop = FOLLOW + P._order * 1.4, dH = Math.hypot(h.x - P._x, h.z - P._z);
        // ── shift30 ── near him he walks AT HIS SIDE (the camera is behind the kohen: one behind him would hide him or be cut by the frame's
        // foot) — to his right, SIDE30 amot over and a little back; far (a long detour), on his trail as before ── /shift30 ──
        const fx = Math.sin(h.yaw || 0), fz = Math.cos(h.yaw || 0), sx = h.x - fz * SIDE30.side - fx * (SIDE30.back + P._order * 1.4), sz = h.z + fx * SIDE30.side - fz * (SIDE30.back + P._order * 1.4);
        if (dH < SIDE30.near && Number.isFinite(sx)) {
          const dS = Math.hypot(sx - P._x, sz - P._z);
          if (dS > 0.12 && stepTo(P, sx, sz, dt, Math.max(WALK, Math.min(26, dS * 5)))) P._walk = dS > 0.3 ? 1 : 0;
          if (P._walk === 0) { let dy = Math.atan2(fz, fx) - P._yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); P._yaw += dy * Math.min(1, dt * 6); }
        } else if (dH > stop) {
          while (P._ti < trail.length - 1 && Math.hypot(trail[P._ti][0] - P._x, trail[P._ti][1] - P._z) < 0.35) P._ti++;
          const q = trail[Math.min(P._ti, trail.length - 1)], sp = Math.max(WALK, Math.min(26, (dH - stop) * 4.5));
          if (stepTo(P, q[0], q[1], dt, sp, dH - stop)) P._walk = 1;   // (never closer than his stop)
          // (lost on a long detour: he steps onto the kohen's last points)
          if (dH > 14) { P._ti = Math.max(P._ti, trail.length - 6); }
        }
        else if (dH < stop * 0.75 && dH > 0.01) { const k = Math.min(1, dt * 8) * (stop * 0.9 - dH) / dH; P._x += (P._x - h.x) * k; P._z += (P._z - h.z) * k; }   // (the kohen stepped back onto him: he gives way)
      } else if (P.state === 'done' || P.state === 'left') {
        if (P.state === 'done' && stepTo(P, P._tx, P._tz, dt, WALK)) P._walk = 1;
        P._fade += dt / (P.state === 'done' ? 1.4 : FADE); if (P._puff) P._puff += dt;
        if (P._fade >= 1) { remove(P); continue; }
      }
      // the lamb on its rope: 1.1 amot behind him, to his left
      if (P.type === 'olah') { const bx = P._x - Math.cos(P._yaw) * 1.1 + Math.sin(P._yaw) * 0.6, bz = P._z - Math.sin(P._yaw) * 1.1 - Math.cos(P._yaw) * 0.6; const d = Math.hypot(bx - P._lx, bz - P._lz); if (d > 0.05) { const k = Math.min(1, dt * 6); P._lx += (bx - P._lx) * k; P._lz += (bz - P._lz) * k; P._lyaw = Math.atan2(P._z - P._lz, P._x - P._lx); } }
      P.pos.x = P._x; P.pos.z = P._z; P.pos.y = gy(P._x, P._z);
    }
  }

  // ── the draw (draw.js: in the kit's world frame) and the chips (the DOM, over the heads; LIGHT28's zone)
  function draw(k, t) {
    { const t0 = performance.now(); chips(); chipsTime(performance.now() - t0); }   // ── shift30 ── (timed) ── /shift30 ── (the chips first: a figure's error never leaves them off the screen)
    for (const P of all) {
      const y = gy(P._x, P._z), sc = P._fade > 0 ? Math.max(0.001, 1 - P._fade * (P.state === 'left' ? 1 : 0.6)) : 1;
      const carry = P.type !== 'olah';
      const lean = P.lean31 && P.type === 'olah' && !P.lambGone, yawL = lean ? Math.atan2(P._lz - P._z, P._lx - P._x) : P._yaw;   // ── route31 ── (the samicha: he turns to the lamb and leans his hands on it) ── /route31 ──
      const r = man(k, L(P._x), L(P._z), L(y), { robe: P._robe, cap: P._cap, skin: P._skin, yaw: yawL, u: lean ? 0.35 : undefined, pose: lean ? 'reach' : P._walk && !carry ? 'walk' : carry ? 'carry' : 'stand', walk: !!P._walk, t: P._t, scale: sc, avnet: false, hero: false });
      const R = r && r.R, Lh = r && r.L;
      if (sc > 0.2 && R && Lh) {
        const ma = (R[0] + Lh[0]) / 2, ms = (R[1] + Lh[1]) / 2, my = (R[2] + Lh[2]) / 2;
        if (P.type === 'ken') {   // a wicker basket and two doves (handed over at the דוכן: the basket empty)
          k.c(ma, ms, my - 0.02, 0.13 * sc, 0.11 * sc, '#A88A5E'); k.c(ma, ms, my + 0.04, 0.135 * sc, 0.015 * sc, '#8A6A45');
          if (!P.kenGone) { k.s(ma + 0.04, ms + 0.04, my + 0.1, 0.06 * sc, 0.05 * sc, 0.08 * sc, '#ECEAE4'); k.s(ma - 0.04, ms - 0.04, my + 0.1, 0.06 * sc, 0.05 * sc, 0.08 * sc, '#D9D6CF'); }
        } else if (P.type === 'mincha') {   // a bowl of fine flour, a sheaf over his arm
          if (!P.bowlGiven) { k.c(ma, ms, my - 0.01, 0.14 * sc, 0.07 * sc, '#B9A27A'); k.s(ma, ms, my + 0.03, 0.12 * sc, 0.045 * sc, 0.12 * sc, '#F5F0E2'); }   // ── route31 ── (handed to the kohen at the הגשה) ── /route31 ──
          for (let i = 0; i < 5; i++) k.c(Lh[0] + 0.02 * i - 0.04, Lh[1] - 0.03, Lh[2] + 0.12, 0.012 * sc, 0.38 * sc, '#D8B85A', { pitch: 0.25 + 0.05 * i });
          k.s(Lh[0], Lh[1] - 0.03, Lh[2] + 0.32, 0.05 * sc, 0.09 * sc, 0.05 * sc, '#E3C567');
        }
      }
      if (P.type === 'olah' && !P.lambGone) {   // (after the slaughter behind the screen the lamb is not drawn again: DAM25 §1 row 1)
        const ly = gy(P._lx, P._lz);
        lamb(k, L(P._lx), L(P._lz), L(ly), { yaw: P._lyaw, scale: 0.55 * sc, step: P._walk ? P._t * 9 : 0, wool: WOOL, head: 0.5 });
        if (R && sc > 0.2) { const ra = L(P._lx) + Math.cos(P._lyaw) * 0.3, rs = L(P._lz) + Math.sin(P._lyaw) * 0.3, rz = L(ly) + 0.36;   // the rope: a sagging line of beads
          for (let i = 1; i < 8; i++) { const u = i / 8; k.s(ra + (R[0] - ra) * u, rs + (R[1] - rs) * u, rz + (R[2] - rz) * u - 0.12 * Math.sin(u * Math.PI), 0.014, 0.014, 0.014, '#8C7350'); } }
      }
      if (P._puff > 0) { const u = Math.min(1, P._puff / 0.6); for (let i = 0; i < 5; i++) { const a = i * 1.257 + u; k.s(L(P._x) + Math.cos(a) * 0.3 * (0.4 + u), L(P._z) + Math.sin(a) * 0.3 * (0.4 + u), L(y) + 0.5 + 0.25 * u + 0.08 * i, 0.22 * (0.5 + u) * (1 - u * 0.6), 0.18 * (0.5 + u) * (1 - u * 0.6), 0.22 * (0.5 + u) * (1 - u * 0.6), '!#B9B4AA'); } }
      if (P.state === 'taken' && sc > 0.5) k.ring(L(P._x), L(P._z), L(y) + 0.01, 0.42, '!#FFE9A6', 12);
    }
  }
  function chips() {
    if (!view) return;
    const order = all.some((P) => P.state === 'taken') ? [...all].sort((a, b) => (b.state === 'taken') - (a.state === 'taken')) : all;   // ── flow31 ── (the taken one's chip first) ── /flow31 ──
    for (const P of order) {
      const e = P.el; if (!e) continue;
      { const f = SHARED.f31, hide = !!(f && f.pil && !f.pil(P)); if (e.__f31 !== hide) { e.__f31 = hide; e.classList.toggle('f31-off', hide); } if (hide) continue; }   // ── flow31 ── (during a take: his chip alone) ── /flow31 ──
      const p0 = view.project(P._x, gy(P._x, P._z) + 4.3, P._z), p = { x: p0.x, y: p0.y, on: p0.on };

      if (!p || !p.on) { if (e.__on !== false) { e.__on = false; e.style.transform = 'translate(-999px,-999px)'; } continue; }
      { const op = P.acting ? '0.2' : ''; if (e.style.opacity !== op) e.style.opacity = op; }   // (under an act his chip steps aside: the close camera shows the act — his patience is still while he is served)
      const c = placeChip(p.x, p.y - 22, 68, 44); if (!c) { if (e.__on !== false) { e.__on = false; e.style.transform = 'translate(-999px,-999px)'; } continue; }   // (never one chip on another: the line's chips stand one over another)
      if (!(e.__on && Math.abs((e.__cx || -1e4) - c.x) <= 2 && Math.abs((e.__cy || -1e4) - c.y) <= 2)) { e.__cx = c.x; e.__cy = c.y; e.style.transform = `translate(${Math.round(c.x - 32)}px,${Math.round(c.y - 22)}px)`; } e.__on = true;   // ── shift30 ── (moved only past 2 px) ── /shift30 ──
      if (P._bar) { const w = `scaleX(${Math.max(0, P.patience).toFixed(3)})`; if (P._bar.style.transform !== w) P._bar.style.transform = w; const c2 = barColor(P.patience); if (P._bar.__c !== c2) { P._bar.__c = c2; P._bar.style.background = c2; } }
    }
  }
  const off = addDrawer(o.kit, draw, 1);

  const api = {
    spawn, tick, take, release, remove, done,
    list: () => all.filter((P) => P.state !== 'left' && P.state !== 'done'),
    next: () => waiting()[0] || null,
    at: (P) => (P ? { x: P._x, y: gy(P._x, P._z), z: P._z } : null),
    clear() { for (const P of [...all]) remove(P); trail.length = 0; },
    destroy() { api.clear(); alive = false; off(); },
    stats: () => ({ ...st, n: all.length, waiting: waiting().length }),
    /** tests: the shake on a chip (a wrong tap) */
    shake(P) { if (P && P.el) { P.el.classList.remove('shake'); void P.el.offsetWidth; P.el.classList.add('shake'); } },
    float: (P, text) => float(P, text),
    all: () => all.slice(),
  };
  try { globalThis.__S29P = api; } catch (e) { /* tests */ }
  return api;
}
