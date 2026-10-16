// ── shift29 ── engine.js — "משמרת": the Temple as a 90-second order-fulfilment round (docs/WAVE29-BRIEF.md "the contract";
// docs/GAME29-PRINCIPLES.md §1–§2). Pilgrims come in at the gate, each with an offering and a patience bar; the kohen (the player)
// takes one, runs him through his stations in the right order, and the altar ends it: +score, a combo; a pilgrim left waiting too
// long goes home ("הלך", the combo resets — nothing else lost). A rival משמר's bar runs beside yours; at 90 s the stars.
//
//   const E = createShift({ level, world, twin, view, hud, stations, pilgrims, camera, sfx, save, persist, own, heroPos, rng })
//   → { start(), stop(), state(), onEnd(cb), tick(dt), work(h), marks(), tapPilgrim(P), tapStation(id), tapGate(), debug }
//   state: { t, left, score, rival, combo, stars, served, lost, phase }   phase: 'ready' | 'opening' | 'run' | 'end'
//
// The world modules are SHIFT29B's (pilgrims.js / stations.js / camera.js); this file only drives them. Taps alone finish every
// act; the clock runs only inside the round (nothing outside it presses). Every text is a draft (טיוטה); no Divine Name anywhere.
import { levelOf, ROUND_S, MAX_LEVEL } from './levels.js';
import { createRival, rivalName } from './rival.js';
import { planPath } from '../day/guide27.js';
import { free as free22 } from '../day/world22.js';
import { verb31, goLabel31 } from './layout31.js';   // ── flow31 ── ── /flow31 ──
import { ROUTES31, NAME31, VERB31, LAVER31, mentorLines } from './route31.js';   // ── route31 ── ── /route31 ──
import { SHARED } from './draw.js';   // ── fable32 ── (pulse31: the path lit by the away button) ── /fable32 ──

export const NEXT_HE = { kiyor: 'הכיור', rings: 'הטבעות', altar: 'המזבח', seals: 'החותמות', duchan: 'הקינים', ...NAME31 };   // ── route31 ── (+ the true routes' names) ── /route31 ──
const ROUTE = ROUTES31;   // ── route31 ── ── /route31 ──
export const COMBO = [[6, 2], [4, 1.5], [2, 1.2]];   // (streak ≥ n → ×m)
export const comboOf = (streak) => { for (const [n, m] of COMBO) if (streak >= n) return m; return 1; };
/** the points of one served pilgrim: (10 + round(10 × patience left)) × (1 + 0.5 × gold share) × combo — an integer */
export function servePoints(patience, goldShare, combo) {
  const base = 10 + Math.round(10 * Math.max(0, Math.min(1, patience || 0)));
  return Math.round(base * (1 + 0.5 * Math.max(0, Math.min(1, goldShare || 0))) * (combo || 1));
}
export function starsOf(L, served, count, score, rival) {
  const f = count > 0 ? served / count : 0, sp = L.stars || [0.6, 0.85, 'beatRival'];
  let s = 0; if (f >= sp[0] - 1e-9) s = 1; if (f >= sp[1] - 1e-9) s = 2; if (s === 2 && score > rival && (!L.all3 || f >= 1 - 1e-9)) s = 3;   // ── flow31 ── (all3: ★★★ only with every pilgrim served) ── /flow31 ──
  return s;
}
// the opening: the Tamid's first four in their order (תמיד א–ב; the lots after the laver — יומא כב.) — a stub act each (the ring + a sound)
export const OPENING = [   // ── fable29 ── the Tamid's own order (תמיד א, ב–ד): the lot, then the winner washes at the laver, then the ash, then the pyre
  { id: 'payis', label: 'הפיס', at: [-40, 16, -60] },
  { id: 'kiyor', label: 'הכיור', at: [-57, 16, 14.2] },
  { id: 'deshen', label: 'תרומת הדשן', at: [-29.5, 16, 12] },
  { id: 'maaracha', label: 'המערכה', at: [-33, 25, 2] },
];
export const OPENING_SRC = 'תמיד א, ב–ד; ב, א–ה; יומא כב. · טיוטה';
const pos3 = (a) => (Array.isArray(a) ? { x: +a[0] || 0, y: +a[1] || 16, z: +a[2] || 0 } : a && typeof a === 'object' ? { x: +a.x || 0, y: Number.isFinite(+a.y) ? +a.y : 16, z: +a.z || 0 } : null);
const say = (fn, ...a) => { try { return fn && fn(...a); } catch (e) { console.warn('[shift]', e && e.message); return undefined; } };

export function createShift(o = {}) {
  const L = typeof o.level === 'object' && o.level ? o.level : levelOf(o.level);
  const S = o.world || null, T = o.twin || null, view = o.view || null, hud = o.hud || null, ST = o.stations || null, PG = o.pilgrims || null, CAM = o.camera || null;
  const save = o.save && typeof o.save === 'object' ? o.save : {};
  if (!save.best || typeof save.best !== 'object') save.best = {};
  const rng = typeof o.rng === 'function' ? o.rng : Math.random;
  const sfx = (n) => { try { o.sfx && o.sfx.play && o.sfx.play(n); } catch (e) { /* none */ } };
  const STN = (ST && ST.STATIONS) || o.STATIONS || {};
  const hp = { x: 0, y: 16, z: 0 };
  const heroP = () => { if (o.heroPos) { const p = o.heroPos(); if (p) return p; } try { S.heroXYZ(hp); } catch (e) { /* none */ } return hp; };
  const rival = createRival({ ...(L.rival || {}), level: L.n, own: o.own | 0, rng });
  const st = { t: 0, left: ROUND_S, score: 0, rival: 0, combo: 1, streak: 0, best: 0, stars: 0, served: 0, lost: 0, spawned: 0, phase: 'ready', level: L.n, rivalName: rival.name, count: L.count, bonus: 0, opening: null, coal: null, washed: false, lav31: false, actPts: 0 };   // ── route31 ── (washed: the laver once per round) ── /route31 ──
  const ends = [];
  let openHelp31 = false;   // ── flow31 ── ── /flow31 ──
  let nextSpawn = 2, carried = null, acting = null, goal = null, lockUntil = 0, ended = false, raf = 0, lastMs = 0, typeBag = [], openN = 0, openBad = 0, openT = 0, openCtl = null, coalCtl = null, coalDone = false, clockT = 0, lastTick = -1;
  const W = { stuck: 0, best: 1e9 };
  const log = [];
  const L0 = (...a) => { log.push([Math.round(st.t * 10) / 10, ...a]); if (log.length > 120) log.shift(); };
  st.best = Math.max(0, +save.best[L.n] || 0);

  /* ───────── the pilgrims ───────── */
  const list = () => { try { return (PG && PG.list()) || []; } catch (e) { return []; } };
  const present = () => list().filter((P) => P.state !== 'done' && P.state !== 'left').length;
  // (the level's "concurrent": how many stand waiting — at the gate or parked at a station — beside the one he leads: at level 1 the next
  // one is already in line while he serves; the round never stands empty — GAME29 §2.8 "25: שניים במקביל")
  const waiting = () => list().filter((P) => P.state === 'wait' || (P.state === 'atStation' && P !== acting && P !== carried)).length;
  function nextType() { if (!typeBag.length) { typeBag = L.types.slice(); for (let i = typeBag.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [typeBag[i], typeBag[j]] = [typeBag[j], typeBag[i]]; } } return typeBag.shift(); }
  function spawn() {
    const type = nextType();
    const P = say(() => PG.spawn(type, { patienceS: L.patienceS }));
    if (!P) return null;
    st.spawned++;
    if (!Array.isArray(P.route) || !P.route.length) P.route = (ROUTE[type] || ROUTE.olah).slice();
    if (!Number.isFinite(P.step)) P.step = 0;
    if (!Number.isFinite(P.patience)) P.patience = 1;
    P.patienceS = L.patienceS; P.gold = 0; P.acts = 0;
    if (o.bindChips !== false) bindChip(P);
    L0('spawn', P.id, type);
    return P;
  }
  function bindChip(P) {
    const el = P.el; if (!el || el.__sh29) return;
    el.__sh29 = true;
    try { el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer'; el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'עולה רגל — לקחת'); } catch (e) { /* */ }
    const f = (e) => { try { e.stopPropagation(); e.preventDefault(); } catch (err) { /* */ } tapPilgrim(P); };
    try { el.addEventListener('click', f); } catch (e) { /* */ }
  }
  function leave(P) {
    if (P.__gone) return; P.__gone = true;
    if (P.state !== 'left') P.state = 'left';
    st.lost++; st.streak = 0; st.combo = 1;
    if (carried === P) carried = null;
    if (goal && goal.P === P) { goal = null; if (o.walk && o.walk.stop) say(() => o.walk.stop()); }
    if (!(PG && PG.drains)) say(() => PG.remove(P));   // (B's pilgrims play their own puff and fade)
    const q = P.pos ? pos3(P.pos) : null;
    say(() => hud && hud.stamp('הלך', { kind: 'lost', at: q && project(q) }));
    sfx('miss'); L0('left', P.id);
  }
  function drain(dt) {
    if (PG && PG.drains) { for (const P of list()) if (P.state === 'left' && !P.__gone) leave(P); return; }   // (B's own clock: count its leavers)
    for (const P of list()) {
      if (P.state === 'left') { if (!P.__gone) leave(P); continue; }
      const waiting = P.state === 'wait' || (P.state === 'atStation' && acting !== P);
      if (!waiting) continue;
      P.patience = Math.max(0, P.patience - dt / (L.patienceS || 20));
      if (P.patience <= 0) leave(P);
    }
  }

  /* ───────── walking: a tap on a station or a pilgrim runs him there (the stick takes over at once) ───────── */
  const standOf = (id) => { const s = STN[id]; return s ? pos3(s.stand || s.hero || s.at) : null; };
  function walkTo(target, then, r = 3, face = null) {
    if (CAM && CAM.focus) say(() => CAM.focus(target));
    if (o.walk && o.walk.to) {   // (SHIFT29B's walk.js: guide27's path round the walls, the run ×1.8)
      const g = { p: target, then, r, P: target.P || null, ext: true }; goal = g; W.stuck = 0; W.best = 1e9; W.mx = NaN; W.mz = NaN;
      Promise.resolve(say(() => o.walk.to(target.x, target.z, r, face || undefined))).then((ok) => {
        if (goal !== g || ended || !g.ext) return;
        if (ok !== false) { goal = null; if (then) then(); return; }
        const why = (say(() => o.walk.state && o.walk.state().why) || '');
        L0('walk-no', why);
        if (why === 'stick' || why === 'again' || why === 'stop') { goal = null; return; }
        g.ext = false; W.stuck = 0; W.best = 1e9; route(g);   // (no path found, stuck or slow: the straight run with the hop finishes it)
      });
      return;
    }
    goal = { p: target, then, r, P: target.P || null };
    W.stuck = 0; W.best = 1e9; route(goal);
  }
  // (the fallback's way: guide27's planPath over the court's free floor — the walls of world22 —, then the stick's drive along it)
  function route(g) {
    g.pts = null; g.i = 0;
    try { const h = heroP(), gy = (x, z) => { try { const y = S.groundAt(x, z); return Number.isFinite(y) ? y : 16; } catch (e) { return 16; } }; const q = planPath(h.x, h.z, g.p.x, g.p.z, free22, gy, () => true); if (q && q.length > 1) g.pts = q; } catch (e) { g.pts = null; }
  }
  function walkStep(dt) {
    if (!goal) return;
    if (goal.ext) {   // (B's walk drives him; the engine only watches: near the stand and not getting nearer → he is there; long stuck → the fallback)
      const h = heroP(), gE = goal.P ? pos3(goal.P.pos) || goal.p : goal.p, dE = Math.hypot(gE.x - h.x, gE.z - h.z);
      // (progress = HIS movement, not the distance: B's way may lead away first — round the ramp's foot out of the laver's corridor)
      if (!Number.isFinite(W.mx) || Math.hypot(h.x - W.mx, h.z - W.mz) >= 0.25) { W.mx = h.x; W.mz = h.z; W.stuck = 0; } else W.stuck += dt;
      if ((dE <= goal.r + 4.5 && W.stuck > 0.45) || W.stuck > 2.0) {
        const g = goal; L0('walk-cut', Math.round(dE * 10) / 10);
        if (dE <= goal.r + 4.5) { goal = null; say(() => o.walk.stop()); drive(0, 0); if (g.then) g.then(); }
        else { g.ext = false; say(() => o.walk.stop()); W.stuck = 0; W.best = 1e9; route(g); }
      }
      return;
    }
    try { if (T && T.stick && T.stick().on) { goal = null; return; } } catch (e) { /* */ }
    const h = heroP(), gEnd = goal.P ? pos3(goal.P.pos) || goal.p : goal.p;
    const dEnd = Math.hypot(gEnd.x - h.x, gEnd.z - h.z);
    if (dEnd <= goal.r) { drive(0, 0); const f = goal.then; goal = null; if (f) f(); return; }
    // the next waypoint of the planned way (the last is the goal itself)
    let g = gEnd;
    if (goal.pts) { while (goal.i < goal.pts.length - 1 && Math.hypot(goal.pts[goal.i].x - h.x, goal.pts[goal.i].z - h.z) < 1.2) { goal.i++; W.best = 1e9; } if (goal.i < goal.pts.length - 1) g = { x: goal.pts[goal.i].x, z: goal.pts[goal.i].z }; }
    const dx = g.x - h.x, dz = g.z - h.z, d = Math.max(0.01, Math.hypot(dx, dz));
    const v = g === gEnd ? Math.min(o.speed || 16, Math.max(5, d * 3)) : (o.speed || 16);   // (× stages.hero.speedMul 1.8 — the run; slower only at the goal)
    drive(dx / d * v, dz / d * v);
    // stuck (a wall between, or sliding along it): 0.4 s without getting 0.4 amah nearer → step him over to the goal's side (the day's fade)
    if (!(d < W.best - 0.4)) W.stuck += dt; else { W.best = d; W.stuck = 0; }
    if (W.stuck > 0.4) {
      W.stuck = 0; W.best = 1e9;
      const ex = gEnd.x - h.x, ez = gEnd.z - h.z, k = (goal.r * 0.7) / Math.max(dEnd, 0.01);
      const nx = gEnd.x - ex * k, nz = gEnd.z - ez * k; goal.pts = null;
      try { S.hero.setPos(nx, nz, Math.atan2(ex, ez)); } catch (e) { /* */ }
      L0('hop');
    }
  }
  function drive(vx, vz) { try { S && S.hero && S.hero.drive(vx, vz); } catch (e) { /* */ } }

  /* ───────── the acts ───────── */
  function project(p) { if (!p || !view || !view.project) return null; try { const q = view.project(p.x, p.y, p.z); return q && q.on !== false ? { x: q.x, y: q.y } : null; } catch (e) { return null; } }
  function float(text, at, kind) {
    st.lastFloat = text; st.floats = (st.floats | 0) + 1;
    const p = at || (() => { const h = heroP(); return { x: h.x, y: h.y + 3.4, z: h.z }; })();
    if (T && T.feedback) say(() => T.feedback(p, text, kind || 'gold'));
    if (hud && hud.float) say(() => hud.float(text, project(p)));
  }
  function no(text, sid, need) { if (sid && ST && ST.wrong && say(() => ST.wrong(sid, need))) { lockUntil = st.t + 1; sfx('miss'); L0('no', text); lastNo = text; return; }   // (said over the station by SHIFT29B: once, not twice)
    lastNo = text; lockUntil = st.t + 1; say(() => hud && hud.stamp(text, { kind: 'no' })); sfx('miss'); L0('no', text); }
  let lastNo = '';
  const busy = () => st.phase !== 'run' || !!acting || st.t < lockUntil;
  // ── route31 ── the next station: the laver first (the kohen's own act, once per round), then the taken pilgrim's route; null = the gate.
  // FLOW31's button and path read this (E.next31()) ── /route31 ──
  const needWash = () => !st.washed && STN.kiyor;
  function next31() {
    if (st.phase !== 'run') return null;
    if (needWash()) return { id: 'kiyor', he: NEXT_HE.kiyor, verb: VERB31.kiyor, why: 'laver' };
    if (carried) { const id = carried.route[carried.step]; return id ? { id, he: NEXT_HE[id] || id, verb: VERB31[id] || '', why: 'route', P: carried.id } : null; }
    return null;
  }
  function tapPilgrim(P) {
    if (st.phase !== 'run' || !P || P.state === 'done' || P.state === 'left') return false;
    if (acting) { if (acting === P && ST && ST.poke) say(() => ST.poke('pilgrim')); return false; }   // ── route31 ── (the samicha: a tap on him) ── /route31 ──
    if (carried === P) return false;
    // (he calls him: the pilgrim comes to the kohen and follows — the kohen never goes down to the gate; the decision is who, not the walk)
    if (goal && !goal.P) { /* a walk to a station goes on: he joins on the way */ }
    return take(P);
  }
  function take(P) {
    if (st.phase !== 'run' || !P || P.state === 'done' || P.state === 'left' || acting) return false;
    if (carried && carried !== P) { say(() => PG.release(carried)); carried.state = 'atStation'; L0('park', carried.id); }   // (the other one waits where he stands: his patience runs again)
    say(() => PG.take(P)); P.state = 'taken'; carried = P; sfx('ui'); L0('take', P.id);
    const nx = needWash() ? 'kiyor' : P.route[P.step]; if (nx && ST && ST.cue) say(() => ST.cue(nx, true));   // ── route31 ── (unwashed: the laver first) ── /route31 ──
    return true;
  }
  function tapGate() {
    if (st.phase !== 'run') return false;
    const w = list().filter((P) => P.state === 'wait').sort((a, b) => a.patience - b.patience)[0];   // (the gate chip: the one whose patience is lowest)
    if (!w) { no('אין עולי רגל בשער'); return false; }
    return tapPilgrim(w);
  }
  function tapStation(id) {
    if (st.phase !== 'run' || acting) return false;
    if (!STN[id]) return false;
    const p = standOf(id); if (!p) return false;
    const h = heroP();
    if (Math.hypot(p.x - h.x, p.z - h.z) <= 3.2) return runAt(id);
    // ── fable32 (build 4) ── the walk ends at the place and STOPS there ("הגעת"): the act is the player's own tap on the big button (the owner 13.10:
    // "יותר מדי אוטומציה… הפעולות לא מבינים") — a test may ask for the old walk-then-act with __SH_WALKACT ── /fable32 ──
    walkTo(p, () => (globalThis.__SH_WALKACT ? runAtSoon(id) : arrived32(id)), o.walk ? 1.8 : 3, pos3(STN[id].at));
    return true;
  }
  function arrived32(id) {
    if (st.phase !== 'run' || acting) return false;
    const p = standOf(id); if (!p) return false;
    if (st.arr32 !== id) { st.arr32 = id; sfx('ok'); try { if (navigator.vibrate) navigator.vibrate([18, 40, 18]); } catch (e) { /* */ } SHARED.arrive32 = { t: performance.now(), x: p.x, z: p.z, id }; L0('arrive', id); }
    return true;
  }
  // ── shift30 ── (the short trips arrive inside the 1-s hush of a "לא — …" said on the way: the act waits the hush out instead of being
  // dropped — he is at the station, the player tapped it) ── /shift30 ──
  function runAtSoon(id, n = 0) {
    if (st.phase === 'run' && !acting && st.t < lockUntil && n < 8) { setTimeout(() => { if (!ended && !goal) runAtSoon(id, n + 1); }, Math.max(60, (lockUntil - st.t) * 1000 + 30)); return false; }
    return runAt(id);
  }
  async function runAt(id) {
    if (busy()) return false;
    // ── route31 ── the laver: the kohen's own opening act, once per round, with or without a pilgrim; nothing else before it ── /route31 ──
    if (id === 'kiyor' && STN.kiyor) {
      if (st.washed) { no('כבר קידשתם — פעם אחת לפני העבודה', 'kiyor', null); return false; }
      const Pw = carried; acting = Pw || true; if (Pw) { say(() => PG.release(Pw, id)); Pw.state = 'atStation'; } drive(0, 0);
      if (ST && ST.cue) say(() => ST.cue('kiyor', false));
      L0('act', 'kiyor', Pw ? Pw.id : 0);
      let r = null; try { r = await ST.act('kiyor', Pw || null); } catch (e) { r = { quality: 0.6, gold: false }; }
      acting = null; if (ended || st.phase !== 'run') return false;
      st.washed = true; st.lav31 = true; addActPts(r);   // (lav31: FLOW31's name for it)
      // ── fable32 ── (no pilgrim is taken by himself after the washing: the player calls him — the owner 13.10: "עולה הרגל נדבק אליי בלי שעשיתי כלום") ── /fable32 ──
      sfx('ok'); return true;
    }
    if (needWash()) { no(`לא — ${NEXT_HE.kiyor} קודם`, id, 'kiyor'); return false; }
    const P = carried;
    if (!P) { no('קודם — עולה רגל מהשער'); return false; }
    const want = P.route[P.step];
    if (want !== id) { no(`לא — ${NEXT_HE[want] || want} קודם`, id, want); return false; }
    acting = P; say(() => PG.release(P, id)); P.state = 'atStation'; drive(0, 0);
    if (ST && ST.cue) say(() => ST.cue(id, false));
    L0('act', id, P.id);
    let r = null;
    try { r = await ST.act(id, P); } catch (e) { console.warn('[shift] act', id, e && e.message); r = { quality: 0.6, gold: false }; }
    acting = null;
    if (ended || st.phase !== 'run') return false;
    if (P.state === 'left' || P.__gone) return false;
    P.acts++; if (r && r.gold) P.gold++;
    addActPts(r);   // ── route31 ── ── /route31 ──
    P.step++;
    if (P.step >= P.route.length) { serve(P); return true; }
    say(() => PG.take(P)); P.state = 'taken'; carried = P;
    const nx = P.route[P.step]; if (ST && ST.cue) say(() => ST.cue(nx, true));
    sfx('ok');
    return true;
  }
  /** ── route31 ── the act's "+N" (stations.js floats it on the thing) counts in the score ── /route31 ── */
  function addActPts(r) { const n = r && Number.isFinite(r.pts) ? r.pts | 0 : 0; if (n > 0) { st.score += n; st.actPts += n; } }
  function serve(P) {
    st.streak++; st.combo = comboOf(st.streak);
    const pts = servePoints(P.patience, P.acts ? P.gold / P.acts : 0, st.combo);
    st.score += pts; st.served++;
    P.state = 'done'; if (carried === P) carried = null;
    say(() => (PG.done ? PG.done(P) : PG.remove(P)));
    float(`+${pts}`, null, 'gold'); sfx('coin');
    if (st.streak >= 2 && comboOf(st.streak) !== comboOf(st.streak - 1)) say(() => hud && hud.stamp(`${st.streak} ברצף! ×${st.combo}`, { kind: 'combo' }));
    L0('served', P.id, pts);
    if (st.spawned >= L.count && present() === 0) finishEarly();
  }

  /* ───────── the twin's button and markers ───────── */
  // ── flow31 ── ONE VERB (WAVE31 FLOW31 (3)): the big button has two states — away from the next place: "לך ל<place>" (a tap walks him
  // there on the path; the stick cancels); within 3 amot: the act's verb ("שחטו — גררו"). Never a stale label, never a dead tap: the next
  // place is the taken pilgrim's next station, else the laver (once a round, when ROUTE31's st.lav31 === false), else the gate's line.
  function nx31() {
    if (st.phase !== 'run') return null;
    if (st.lav31 === false && STN.kiyor) return { id: 'kiyor', kind: 'station' };
    if (carried) { const id = carried.route[carried.step]; if (id && STN[id]) return { id, kind: 'station', P: carried }; }
    const w = list().filter((P) => P.state === 'wait' || (P.state === 'atStation' && P !== acting));
    if (w.length) { w.sort((a, b) => a.patience - b.patience); return { id: 'gate', kind: 'take', P: w[0] }; }
    return { id: 'gate', kind: 'none' };
  }
  const nextAt31 = (n) => { if (!n) return null; if (n.kind === 'station') return standOf(n.id); const q = n.P ? pos3(n.P.pos) : GATE; return q ? { x: q.x, y: q.y, z: q.z } : null; };
  const REACH31 = 3;
  // ── fable32 ── the arrival stop for the stick (twin.js): at the next place's stand (≤ 2.4 amot) he stops and faces it
  function stopAt31(h) {
    if (st.phase !== 'run' || acting) return null;
    const n = nx31(); if (!n || n.kind !== 'station') return null;
    const p = nextAt31(n); if (!p) return null;
    if (Math.hypot(p.x - h.x, p.z - h.z) > 2.4) return null;
    // ── fable32 (build 3) ── "הגעת": once per station — a sound, a buzz, the landing ring on the floor (flow31 draws it), the button lit gold, the hint
    if (st.arr32 !== n.id) { st.arr32 = n.id; sfx('ok'); try { if (navigator.vibrate) navigator.vibrate([18, 40, 18]); } catch (e) { /* */ } SHARED.arrive32 = { t: performance.now(), x: p.x, z: p.z, id: n.id }; L0('arrive', n.id); }
    return pos3(STN[n.id].at) || p;
  }
  try { globalThis.__SH_STOP = stopAt31; } catch (e) { /* */ }
  // ── /fable32 ──
  function work31(h) {
    if (acting) { const sa = ST && ST.state ? say(() => ST.state()) : null, sid = (sa && sa.id) || (acting.route ? acting.route[Math.max(0, acting.step)] : 'kiyor') || ''; const s = STN[sid] || {}; if (sa && sa.phase === 'tail') return { icon: '✓', label: 'יפה!', job: 'sh:done', noRing: true, go: () => {}, act31: true };   /* (the act's tail: done — never the verb again; ROUTE31 20:03) */ return { icon: s.icon || '✋', label: verb31(sid, s), job: 'sh:act', noRing: true, go: () => {}, act31: true }; }   // (the act holds the button: its own verb; the act's input listener takes the touch)
    const n = nx31(); if (!n) return null;
    const p = nextAt31(n); if (!p) return null;
    const d = Math.hypot(p.x - h.x, p.z - h.z);
    if (n.kind === 'station') {
      const s = STN[n.id];
      if (d <= REACH31 + 0.2) return { icon: s.icon || '✋', label: verb31(n.id, s), job: 'sh:' + n.id, noRing: true, near31: true, id31: n.id, at: { ...p, y: (p.y || 16) + 1 }, go: () => runAt(n.id) };
      return { icon: s.icon || '➜', label: goLabel31(s.he || NEXT_HE[n.id] || n.id), job: 'sh:go:' + n.id, noRing: true, go31: true, id31: n.id, go: () => { if (globalThis.__SH_AUTOWALK === false || globalThis.__SH_AUTOWALK === undefined) { SHARED.pulse31 = performance.now(); return true; } if (goal && goal.id31 === n.id && goal.ext && o.walk && o.walk.on) return true; const r = tapStation(n.id); if (goal) goal.id31 = n.id; return r; } };   // ── fable32 ── (the owner 13.10: "שביל הזהב מריץ אותי… ולא אני זז בעצמי" — the button away from the place only lights the path; he walks with the stick, or taps the chip to be taken) ── /fable32 ──   // (a second tap on the way: he is already going — the walk goes on, never restarted)
    }
    if (n.kind === 'take') {
      return { icon: n.P.icon || '🙋', label: 'קחו את עולה הרגל', job: 'sh:take', noRing: true, near31: true, id31: 'gate', go: () => take(n.P) };   // (he calls him from where he stands: the pilgrim comes to him — one tap, no walk; the word says so)
    }
    if (GATE && d > REACH31 + 1.5) return { icon: '🚪', label: goLabel31('השער'), job: 'sh:go:gate', noRing: true, go31: true, id31: 'gate', go: () => { if (globalThis.__SH_AUTOWALK !== true) { SHARED.pulse31 = performance.now(); return true; } return walkTo({ x: GATE.x - 1.5, y: GATE.y, z: GATE.z }, null, 2); } };   // ── fable32 ── ── /fable32 ──
    return { icon: '⏳', label: 'עולה רגל בדרך', job: 'sh:wait', noRing: true, id31: 'gate', go: () => { if (st.spawned < L.count) nextSpawn = Math.min(nextSpawn, st.t); } };   // (a tap calls the next one sooner — never a dead tap)
  }
  // ── /flow31 ──
  function work(h) {
    if (st.phase === 'run' && o.flow31 !== false) return work31(h);   // ── flow31 ── ── /flow31 ──
    if (st.phase === 'opening' && o.flow31 !== false && openN < OPENING.length) return { icon: '👆', label: `הבא: ${OPENING[openN].label}`, job: 'sh:open', noRing: true, go: () => { openHelp31 = true; openingTap(openN); } };   // ── flow31 ── (the opening: the button names the next ring and taps it — no +20 then; never 'עבודה', never a dead tap) ── /flow31 ──
    if (st.phase !== 'run' || acting) return null;
    // a station here, for the pilgrim he leads
    let best = null, bd = 6;   // (6 amot: some stands lie a step inside the laver's / the altar's foot — the stick stops him short of them)
    if (ST && ST.near) { const nx = next31(); best = say(() => ST.near(h, 6, nx ? nx.id : null)) || null; }   // ── route31 ── (the one he needs first) ── /route31 ──
    else for (const id in STN) { const p = standOf(id); if (!p) continue; const d = Math.hypot(p.x - h.x, p.z - h.z); if (d <= bd) { bd = d; best = id; } }
    if (best) { const s = STN[best]; return { icon: s.icon || '✋', label: VERB31[best] || s.label || NEXT_HE[best] || best, job: 'sh:' + best, noRing: true, at: { ...standOf(best), y: standOf(best).y + 1 }, go: () => runAt(best) }; }
    if (!carried) {
      let w = null, wd = 3.2;
      for (const P of list()) { if (P.state !== 'wait' && P.state !== 'atStation') continue; const q = pos3(P.pos); if (!q) continue; const d = Math.hypot(q.x - h.x, q.z - h.z); if (d <= wd) { wd = d; w = P; } }
      if (w) return { icon: w.icon || '🙋', label: 'לקחת', job: 'sh:take', noRing: true, at: { ...pos3(w.pos) }, go: () => take(w) };
    }
    return null;
  }
  const marks = () => [];

  /* ───────── the opening: four rings in the Tamid's order (a stub act each) ───────── */
  function openingStart() {
    st.phase = 'opening'; openN = 0; openBad = 0; openT = 0;
    openCtl = say(() => hud && hud.opening(OPENING.map((s) => ({ id: s.id, label: s.label })), { tap: (i) => openingTap(i), src: OPENING_SRC })) || null;
    sfx('chime'); L0('opening');
  }
  function openingTap(i) {
    if (st.phase !== 'opening') return false;
    if (i === openN) { openN++; say(() => openCtl && openCtl.mark(i, 'ok')); sfx('chime'); if (openN >= OPENING.length) openingEnd(true); return true; }
    openBad++; say(() => openCtl && openCtl.mark(i, 'bad')); no(`לא — ${OPENING[openN].label} קודם`); lockUntil = 0;
    return false;
  }
  function openingEnd(done) {
    const clean = done && openBad === 0 && !openHelp31;   // ── flow31 ── (+ !openHelp31) ── /flow31 ──
    if (clean) { st.score += 20; st.bonus += 20; say(() => hud && hud.stamp('+20 — בסדר הנכון!', { kind: 'combo' })); sfx('fanfare'); }
    else say(() => hud && hud.stamp(done ? 'הסדר נלמד — עכשיו המשמרת' : 'המשמרת מתחילה', { kind: 'info' }));
    say(() => openCtl && openCtl.close()); openCtl = null;
    st.opening = { done: !!done, bad: openBad, clean };
    if (ST && ST.place) say(() => ST.place());
    st.phase = 'run'; L0('openingEnd', clean);
  }

  /* ───────── the coal (level 5): one ring by the altar for 3 s ───────── */
  const COAL_AT = { x: -26, y: 16.2, z: 9 };
  function coalStep() {
    if (L.event !== 'coal' || coalDone) return;
    if (!coalCtl && st.t >= 48) {
      coalCtl = say(() => hud && hud.ring('coal', { icon: '🔥', label: 'גחלת!', tap: () => { if (!coalCtl || coalDone) return; coalDone = true; st.score += 15; st.bonus += 15; say(() => hud.stamp('+15 — כיביתם!', { kind: 'combo' })); sfx('coin'); say(() => coalCtl.close()); L0('coal', 1); } })) || { close() {}, at() {} };
      st.coal = { at: st.t };
    }
    if (coalCtl && !coalDone) {
      const q = project(COAL_AT); say(() => coalCtl.at(q));
      if (st.t >= st.coal.at + 3) { coalDone = true; say(() => coalCtl.close()); L0('coal', 0); }
    }
  }

  /* ───────── the gate chip: how many wait; a tap takes the one whose patience is lowest ───────── */
  const GATE = pos3(o.gateSpot) || null;
  let gateCtl = null, gateN = -1;
  function gateStep() {
    if (!hud || !hud.pin || !GATE) return;
    // ── shift30 ── the gate's chip is one of the court's chips (stations.js gate(): over the line, or at the edge toward it, "תור N");
    // the HUD's docked pin only where the world has none (the stubs) ── /shift30 ──
    if (!gateCtl && ST && ST.gate) { gateCtl = say(() => ST.gate({ at: GATE, tap: () => tapGate() })) || null; if (gateCtl) gateCtl.own30 = true; }
    if (!gateCtl) gateCtl = say(() => hud.pin('gate', { icon: '🚪', label: 'השער', dock: true, tap: () => tapGate() })) || null;
    if (!gateCtl) return;
    const n = list().filter((P) => P.state === 'wait').length;
    if (n !== gateN) { gateN = n; say(() => gateCtl.text(gateCtl.own30 ? n : n ? `השער · ${n}` : 'השער')); }
    if (gateCtl.own30) { say(() => gateCtl.at(null, n > 0)); return; }
    const q = project({ x: GATE.x, y: GATE.y + 0.2, z: GATE.z });
    say(() => gateCtl.at(q ? { x: q.x - 84, y: q.y + 20 } : null, n > 0));   // (beside the line, not on it: the pilgrims' chips stand over their heads)
  }

  /* ───────── the first round's two words at the foot (level 1, until the first pilgrim is served): who to tap, which station next ───────── */
  let hintNow = null;
  function hintStep() {
    if (!hud || !hud.hint) return;
    let h = null;
    if (L.n === 1 && st.phase === 'run' && o.flow31 !== false) {   // ── flow31 ── level 1 only, one sentence, the button's own word ── /flow31 ──
      const hh = heroP(), w = acting ? null : work31(hh);
      h = !w ? null : w.near31 ? ((SHARED.arrive32 && performance.now() - SHARED.arrive32.t < 2500 ? 'הגעתם! ' : '') + (w.id31 && STN[w.id31] && STN[w.id31].he ? `הקישו על הכפתור שליד ${STN[w.id31].he}` : 'הקישו על הכפתור')) /* ── fable32 (build 5) ── (the prompt beside the thing) ── /fable32 ── */ : w.go31 ? 'לכו בשביל הזהב עם האגודל השמאלי — או הקישו על הבועה של התחנה' : null;
    } else if (L.n === 1 && st.served === 0 && st.phase === 'run') {
      if (needWash() && !acting) h = `קודם: ${NEXT_HE.kiyor} — ${LAVER31.label}`;   // ── route31 ── ── /route31 ──
      else if (carried) { const nx = carried.route[carried.step]; h = acting ? null : `עכשיו: ${NEXT_HE[nx] || nx} — הקישו על התחנה המוארת`; }
      else if (list().some((P) => P.state === 'wait')) h = 'הקישו על עולה הרגל שמחכה — הוא יבוא אחריכם';
    }
    if (h !== hintNow) { hintNow = h; say(() => hud.hint(h)); }
  }

  /* ───────── the race: a line when the lead changes hands (once per 4 s) ───────── */
  let lead = 0, leadT = -9;
  function leadStep() {
    const now = st.score > st.rival ? 1 : st.score < st.rival ? -1 : lead;
    if (now !== lead && st.t - leadT > 4 && (st.score > 0 || st.rival > 8)) {
      leadT = st.t;
      if (now > 0) { say(() => hud && hud.stamp(`עקפתם את משמר ${st.rivalName}!`, { kind: 'combo' })); sfx('chime'); L0('lead', 1); }
      else if (lead > 0) { say(() => hud && hud.stamp(`משמר ${st.rivalName} עקף אתכם`, { kind: 'info' })); L0('lead', -1); }
    }
    lead = now;
  }

  /* ───────── the clock ───────── */
  function tick(dt) {
    if (!(dt > 0) || ended) return st;
    if (st.paused) { drive(0, 0); return st; }   // ── fable32 (build 3) ── the pause: the clock, the pilgrims and the rival stand still ── /fable32 ──
    dt = Math.min(dt, 0.25);
    if (st.phase === 'opening') {
      openT += dt;
      if (openCtl && openCtl.place) for (let i = 0; i < OPENING.length; i++) say(() => openCtl.place(i, project(pos3(OPENING[i].at))));
      if (openT >= 10) openingEnd(false);
      push(); return st;
    }
    if (st.phase !== 'run') return st;
    st.t += dt; st.left = Math.max(0, ROUND_S - st.t);
    st.rival = rival.tick(dt);
    walkStep(dt);
    say(() => PG && PG.tick(dt));
    drain(dt);
    if (st.spawned < L.count && st.t >= nextSpawn && waiting() < L.concurrent && !(L.one31 && present() > 0)) { spawn(); nextSpawn = st.t + L.spawnEveryS; }   // ── flow31 ── (one31: one at a time — the next only when the last is served or gone) ── /flow31 ──
    coalStep();
    if (needWash() && !st.kc31 && ST && ST.cue) { st.kc31 = 1; say(() => ST.cue('kiyor', true)); }   // ── route31 ── (the round opens at the laver) ── /route31 ──
    gateStep();
    hintStep();
    leadStep();
    const sec = Math.ceil(st.left); if (sec <= 5 && sec !== lastTick && sec > 0) { lastTick = sec; sfx('tick'); }
    if (st.left <= 0) end();
    push();
    return st;
  }
  function push() { clockT = 0; if (hud) say(() => hud.set(state())); }
  function finishEarly() {
    // all the shift's pilgrims are home before the sun: the rival runs to its 90 s; the seconds left pay 2 each
    const left = Math.max(0, ROUND_S - st.t), b = Math.round(left * 2);
    if (b > 0) { st.score += b; st.bonus += b; say(() => hud && hud.stamp(`+${b} — סיימתם לפני הזמן!`, { kind: 'combo' })); }
    st.rival = rival.tick(left); st.t = ROUND_S; st.left = 0;
    end();
  }
  function end() {
    if (ended) return; ended = true;
    drive(0, 0); goal = null; if (o.walk && o.walk.stop) say(() => o.walk.stop());
    st.phase = 'end'; st.left = 0;
    st.stars = starsOf(L, st.served, L.count, st.score, st.rival);
    const prev = Math.max(0, +save.best[L.n] || 0), newBest = st.score > prev;
    if (newBest) save.best[L.n] = st.score;
    st.best = Math.max(prev, st.score);
    if (st.stars >= 2) save.lvl = Math.max(+save.lvl || 1, Math.min(MAX_LEVEL, L.n + 1));
    if (!save.stars || typeof save.stars !== 'object') save.stars = {};
    save.stars[L.n] = Math.max(+save.stars[L.n] || 0, st.stars);
    say(() => o.persist && o.persist());
    for (const P of list()) if (P.state !== 'done' && P.state !== 'left') say(() => PG.remove(P));
    carried = null; say(() => gateCtl && gateCtl.close()); gateCtl = null; if (hintNow) { hintNow = null; say(() => hud && hud.hint && hud.hint(null)); }
    if (ST && ST.clear) say(() => ST.clear());
    sfx('fanfare');
    const res = { score: st.score, rival: st.rival, rivalName: st.rivalName, stars: st.stars, served: st.served, lost: st.lost, count: L.count, best: st.best, newBest, beat: st.score > st.rival, level: L.n, next: st.stars >= 2 && L.n < MAX_LEVEL ? L.n + 1 : null, mentor: mentorLines(L.types), actPts: st.actPts };   // ── route31 ── (+ the mentor's fold: one line per station) ── /route31 ──
    st.result = res; L0('end', res.score, res.rival, res.stars);
    push();
    for (const f of ends) say(() => f(res));
  }
  function state() { return { t: Math.round(st.t * 100) / 100, left: Math.round(st.left * 100) / 100, score: st.score, rival: st.rival, rivalName: st.rivalName, combo: st.combo, streak: st.streak, stars: st.stars, served: st.served, lost: st.lost, spawned: st.spawned, count: L.count, phase: st.phase, level: L.n, best: st.best, carried: carried ? carried.id : null, acting: !!acting, opening: st.opening, coal: st.coal, bonus: st.bonus, result: st.result || null, washed: st.washed, actPts: st.actPts, next: (() => { const n = next31(); return n ? n.id : null; })(), flowNext: (() => { const n = nx31(); return n ? n.id : null; })(), lav31: st.lav31, paused: !!st.paused /* ── fable32 (build 3) ── ── /fable32 ── */, no: lastNo, float: st.lastFloat || '', floats: st.floats | 0 }; }

  /* ───────── the lifecycle ───────── */
  function loop(ms) { if (!raf) return; const dt = lastMs ? (ms - lastMs) / 1000 : 0; lastMs = ms; tick(dt); raf = requestAnimationFrame(loop); }
  const E = {
    start() {
      if (st.phase !== 'ready') return E;
      if (ST && ST.place && !L.opening) say(() => ST.place());   // (with an opening, the stations' chips come after it: its four rings alone on the board)
      if (CAM && CAM.on) say(() => CAM.on());
      if (L.opening) openingStart(); else st.phase = 'run';
      push();
      if (o.raf && typeof requestAnimationFrame === 'function') { lastMs = 0; raf = requestAnimationFrame(loop); }
      L0('start', L.n);
      return E;
    },
    stop() {
      if (raf) { try { cancelAnimationFrame(raf); } catch (e) { /* */ } raf = 0; }
      ended = true; try { if (globalThis.__SH_STOP === stopAt31) delete globalThis.__SH_STOP; } catch (e) { /* */ } drive(0, 0); goal = null; if (o.walk && o.walk.stop) say(() => o.walk.stop());
      say(() => openCtl && openCtl.close()); say(() => coalCtl && coalCtl.close()); say(() => gateCtl && gateCtl.close()); gateCtl = null;
      for (const P of list()) say(() => PG.remove(P));
      if (ST && ST.clear) say(() => ST.clear());
      if (CAM && CAM.off) say(() => CAM.off());
    },
    state, tick, work, marks, next31,   // ── route31 ── ── /route31 ──
    pause(on) { st.paused = !!on; if (st.paused) drive(0, 0); return st.paused; },   // ── fable32 (build 3) ── ── /fable32 ──
    flowNext: () => { const n = nx31(); if (!n) return null; const p = nextAt31(n); return { ...n, P: undefined, pid: n.P ? n.P.id : null, at: p }; }, st31: st, /* ── flow31 ── ── /flow31 ── */
    leave: (P) => { if (P && !P.__gone && !ended) leave(P); }, tapPilgrim, tapStation, tapGate, take, runAt,
    onEnd(cb) { if (typeof cb === 'function') ends.push(cb); return E; },
    get level() { return L; },
    debug: {
      log: () => log.slice(), goal: () => (goal ? { ext: !!goal.ext, r: goal.r, p: goal.p && [Math.round(goal.p.x * 10) / 10, Math.round(goal.p.z * 10) / 10], pts: goal.pts ? goal.pts.length : 0, i: goal.i | 0, stuck: Math.round(W.stuck * 100) / 100 } : null), stars: (n) => { save.lvl = Math.max(+save.lvl || 1, n >= 2 ? Math.min(MAX_LEVEL, L.n + 1) : 1); st.served = Math.ceil(L.count * (n >= 2 ? 0.86 : n >= 1 ? 0.6 : 0)); if (n >= 3) st.score = Math.max(st.score, st.rival + 1); return n; },
      end: () => end(), skip: (s) => { for (let i = 0; i < Math.round(s * 10); i++) tick(0.1); return state(); },
      spawnNow: () => { nextSpawn = st.t; }, openingTap: (i) => openingTap(i), patience: (P, v) => { P.patience = v; }, carried: () => carried, rival,
    },
  };
  return E;
}
export { rivalName };
// ── /shift29 ──
