/* ── worksb22 ── registerb.js — WORKSB22's works into ENGINE22's registry (src/avodah/day/works.js; the contract on bus/ENGINE22.md).
 *   In src/avodah/day/index.js, fence `// ── works-imports ──`:   import { registerWorksB } from '../works/registerb.js'; registerWorksB(WORKS);
 * Task ids ↔ works: queue (the pilgrims at the gate) · seals (Yochanan and Achiya) · account (the evening count of the seals) ·
 * kiyor (dawn and afternoon) · vessels (the 93) · gates (the closing). Path B of the contract: run(ctx) drives itself, the right thumb's
 * tap is the work's own next step (taps alone finish it), the source line comes through ctx.mentor AFTER the end. */
import * as THREE from 'three';
import { createGateWork } from './gate.js';
import { createSealsWork } from './seals.js';
import { createKiyorWork } from './kiyor.js';
import { createCloseWork } from './close.js';
import { s27Opts } from './slice27.js';   // ── slice27 ── ── /slice27 ──

const DEFS = {
  queue: { he: 'תור העולים בשער', icon: '🐑', make: createGateWork, opts: (c) => ({ origin: c.PLACE && c.PLACE.gate ? c.PLACE.gate : null, every: +globalThis.__WB22_EVERY || 8 /* ── polish23 ── a kid's pace: a pilgrim every 8 s (the queue holds 4) */ }) },
  seals: { he: 'חותמות ונסכים', icon: '🏺', make: createSealsWork, opts: () => ({}) },
  account: { he: 'חשבון הערב של אחיה', icon: '🔢', make: createSealsWork, opts: () => ({ mode: 'evening' }) },
  kiyor: { he: 'הכיור והמוכני', icon: '☸', make: createKiyorWork, opts: (c) => { const o = s27Opts(c); return { kiddush: !!(c && c.task && c.task.work === 'kiddush'), l2: o.l2 }; } },   // ── slice27 ── (the kiddush's tap last; L2) ── /slice27 ──
  vessels: { he: 'ספירת 93 הכלים', icon: '🔢', make: createCloseWork, opts: () => ({ part: 'vessels' }) },
  gates: { he: 'נעילת השערים', icon: '🔒', make: createCloseWork, opts: () => ({ part: 'gate' }) },
};

/** the works' ctx from the day's ctx (a getter-backed view: the day's ctx is rebuilt for each start, the work's props live on) */
export function worksCtx(H) {
  const C = () => H.c;
  const float = (at, text, kind) => { try { C().float(at, text, kind); } catch (e) { /* */ } };
  return {
    THREE, get scene() { return C().scene; }, get camera() { return C().camera; }, get layer() { return C().layer; },
    project: (x, y, z) => { const p = C().project(x, y, z); return p && p.on !== false ? p : null; },
    get av() { return C().av; }, get actors() { const a = C().av; return a && a._actors || null; }, get animals() { const a = C().av; return a && a._animals || null; },
    ground: (x, z) => C().ground(x, z), get hero() { return C().hero(); }, free: (x, z) => C().free(x, z), get stock() { return C().stock; }, emit: (t, d) => C().emit(t, d), get water() { const c = C(); return c.water || (c.world && c.world.water) || null; /* ── places24 ── (the world's water: the real laver) */ }, get world() { return C().world; },
    say: (text, o) => C().mentor(text, o && o.src ? (o.draft === false ? '' : 'טיוטה · ') + o.src : ''),
    sfx: (n) => { try { const s = C().sfx; s && s.play && s.play(n); } catch (e) { /* */ } },
    // the acts' "+N" through the day's float; the act entries leave M.fx (the day pays the task: tasks.done)
    acts(M, at, label) {
      for (let i = M.fx.length - 1; i >= 0; i--) {
        const f = M.fx[i];
        if (f && f.act) { M.fx.splice(i, 1); const a = f.act; float({ x: at.x, y: at.y, z: at.z }, `+${a.pts}${a.say ? ' ' + a.say : ''}`, a.q >= 2 ? 'gold' : 'good'); this.sfx(a.q >= 2 ? 'perfect' : a.q ? 'good' : 'tap'); }
        else if (f && f.bonus) { M.fx.splice(i, 1); float({ x: at.x, y: at.y + 1.2, z: at.z }, `+${f.bonus.pts} ${f.bonus.say}`, 'big'); }
      }
    },
    selfLoop: true,
  };
}

export function registerWorksB(WORKS) {
  for (const id in DEFS) {
    const D = DEFS[id], H = { c: null }; let inst = null;
    WORKS[id] = {
      id, he: D.he, icon: D.icon,
      begin(ctx) { return { ok: true }; },
      run(ctx) {
        H.c = ctx;
        if (!inst) inst = D.make(worksCtx(H));
        const w = inst; try { (globalThis.__WB22 = globalThis.__WB22 || {})[id] = w; } catch (e) { /* tests read it */ }
        return new Promise((res) => {
          let off = null, lastTap = 0, fin = false;
          const done = (r) => { if (fin) return; fin = true; if (off) { try { off(); } catch (e) { /* */ } } setTimeout(() => res(r), 700); };
          const b = w.begin({ ...D.opts(ctx), keep: false, selfLoop: true, n: +globalThis.__WB22_N || 0 });   // (__WB22_EVERY / __WB22_N: test hooks)
          if (!b.ok) { done({ ok: false, skipped: true }); return; }
          w.setOnDone((r) => done({ ok: true, quality: r.quality, perfect: r.perfect, score: r.score, skipped: false }));
          if (ctx.twin && typeof ctx.twin.onWork === 'function') {
            off = ctx.twin.onWork((ev) => {
              if (ev && ev.t === 'press' && typeof w.press === 'function') { try { w.press(!!ev.down); } catch (e) { /* the work's */ } return true; }   // ── fix26 ── (a hold: the kiyor's mukhni) ── /fix26 ──
              if (ev && (ev.t === 'tap' || ev.t === 'up')) { const t = Date.now(); if (t - lastTap > 140 && w.B.M) { lastTap = t; w.B.M.tap(); } }
              return true;
            });
          }
        });
      },
      end() { /* the work tears itself down 3 s after its end */ },
    };
  }
  return WORKS;
}
// ── /worksb22 ──
