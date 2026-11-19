/* ── build 128 ── h128/look.js — the sea's look sample (brief §3; page flag window.__H128_SEA_LOOK = true): no play, a loop of 45 s.
 *   0–8 s    the ship on a calm swell, a clear late afternoon (the opening line of Yoma 38a)
 *   8–28 s   the sky darkens, the sail is furled; three big swells pass: from port, from starboard, over the bow (seen coming from far;
 *            the camera lifts a little before the second, as the act will)
 *   28–36 s  the cloud break: the ceiling tears open far ahead under the low sun, the bright patch runs over the water to the bronze
 *   36–45 s  the lifted view round the ship
 * A small frames-per-second number in a corner, the renderer's draw calls and triangles under it (this page only). The probe's eyes: window.__H128_LOOK = { seek(t), bench(sec), dbg() },
 * and a small window.__T (booted, game.frame, simulate, render) so tools/probe109.cjs drives this page as it drives the game.
 */
import { createSea3d } from './sea3d.js';
import { LINES } from './model.js';

const LOOP = 45;
const sm = (a, b, t) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
// the three swells of the sample: crest at the ship at 15, 20.5 and 26 s (from port, from starboard, over the bow)
const SWELLS = [{ head: 'port', t0: 15 }, { head: 'stbd', t0: 20.5 }, { head: 'bow', t0: 26 }];
/** the sample's script at loop time t: the weather, the camera */
export function lookAt(t) {
  const storm = sm(8, 12, t) * (1 - sm(28, 31, t) * 0.45), brk = sm(28, 32, t), furl = sm(9, 13, t), hole = sm(28.5, 33.5, t);
  let cam = 'play', u = 0, round = 0;
  u = sm(17, 18.5, t) * (1 - sm(19.2, 20.2, t)) * 0.6;          // lifted a little before the starboard swell, then back
  if (t >= 36) { cam = 'round'; round = -0.5 + ((t - 36) / 9) * Math.PI * 1.1; u = 0; }
  const next = SWELLS.find((w) => w.t0 > t - 1.5);
  return { k: storm, brk, hole, furl, cam, u, round, head: next ? next.head : null, line: t < 7.5 ? LINES.open : t >= 28.5 && t < 35.5 ? 'פרצת עננים (המחשה)' : '' };
}

export function runSeaLook({ renderer, canvas }) {
  // the page is the sample alone: no loader, no game interface
  try { const ld = document.getElementById('load'); if (ld) ld.remove(); for (const el of [...document.body.children]) if (el !== canvas && el.tagName !== 'SCRIPT' && !el.contains(canvas)) el.style.display = 'none'; } catch (e) { /* */ }
  const S = createSea3d({ renderer });
  const fit = () => { renderer.setSize(innerWidth, innerHeight, false); S.resize(innerWidth, innerHeight); };
  fit(); addEventListener('resize', fit);
  const css = 'position:fixed;z-index:9;font:600 13px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000;pointer-events:none';
  const fpsEl = Object.assign(document.createElement('div'), { id: 'fps128', dir: 'ltr' }); fpsEl.style.cssText = css + ';left:8px;bottom:6px;opacity:.8';
  const cap = Object.assign(document.createElement('div'), { id: 'cap128', dir: 'rtl' }); cap.style.cssText = css + ';top:10px;left:0;right:0;text-align:center;font-size:17px;padding:0 16px';
  const tag = Object.assign(document.createElement('div'), { dir: 'rtl', textContent: 'דוגמת מראה: הספינה בים (המחשה)' }); tag.style.cssText = css + ';right:10px;bottom:6px;opacity:.75;font-weight:400';
  document.body.append(fpsEl, cap, tag);

  let lt = 0, paused = !!globalThis.__START_PAUSED, last = performance.now(), fr = 0, fAcc = 0, sAcc = 0;
  // the speed net: over each 2 s of play, if the average frame is above 22 ms, one step down (first the clouds mirrored in the
  // water, then the fine chop; the foam and the swells' shape stay). Probes set the level by hand (look.level) or turn it off.
  const NET = { ms: 22, win: 2 }, LEVELS = ['full detail', 'no clouds in the water', 'no clouds in the water, no fine chop'];
  let netAcc = 0, netN = 0, netAuto = !globalThis.__H128_NO_DROP, warm = 0;
  const stat = { frames: 0, script: 0, render: 0 };
  function step(t, dt) {
    const L = lookAt(t);
    S.set({ k: L.k, brk: L.brk, hole: L.hole, furl: L.furl, swells: SWELLS });
    S.view(L.cam, L.u, L.round, L.head);
    S.update(t, dt);
    if (cap.textContent !== L.line) cap.textContent = L.line;
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const raw = (now - last) / 1000, dt = Math.min(0.1, raw); last = now;
    if (paused) return;
    if (raw > 0.25) { netAcc = 0; netN = 0; }   // (a stall: a hidden tab, a pause. Not a measure of the drawing: start the window again)
    else if (netAuto && (warm += raw) > 3 && S.state.level < 2) {
      netAcc += raw; netN++;
      if (netAcc >= NET.win) { if ((netAcc / netN) * 1000 > NET.ms) S.quality(S.state.level + 1); netAcc = 0; netN = 0; }
    }
    lt = (lt + dt) % LOOP;
    const t0 = performance.now(); step(lt, dt); const t1 = performance.now(); S.render(); const t2 = performance.now();
    stat.frames++; stat.script += S.state.scriptMs; stat.render += t2 - t1;
    fr++; fAcc += dt; sAcc += t1 - t0;
    if (fAcc >= 0.5) { const I = renderer.info.render; fpsEl.innerHTML = `${Math.round(fr / fAcc)} fps · ${(sAcc / fr).toFixed(2)} ms<br><span style="font-size:11px;font-weight:400">${I.calls} draw calls · ${(I.triangles / 1000).toFixed(1)}k triangles · ${LEVELS[S.state.level]}</span>`; fr = 0; fAcc = 0; sAcc = 0; }
  }
  step(0, 0); S.render(); requestAnimationFrame(frame);

  const look = {
    S, lookAt,
    /** show loop time t (the hull's inertia settled over the 2 s before it) and stop the clock */
    seek(t) { paused = true; lt = t; for (let u = Math.max(0, t - 2); u < t; u += 1 / 30) step(u, 1 / 30); step(t, 1 / 30); S.render(); return S.dbg(); },
    play() { paused = false; last = performance.now(); },
    /** set the speed net's level by hand (0 full … 2) and stop it stepping by itself */
    level(n) { netAuto = false; S.quality(n); return S.state.level; },
    /** run the loop live for sec seconds from loop time t0: { fps, scriptMs (the sea's update), frameScriptMs (all of step), renderMs } */
    bench(sec = 8, t0 = 10) {
      lt = t0; Object.assign(stat, { frames: 0, script: 0, render: 0 }); paused = false; last = performance.now();
      const T0 = performance.now();
      return new Promise((res) => setTimeout(() => {
        const T = (performance.now() - T0) / 1000, n = Math.max(1, stat.frames);
        res({ sec: +T.toFixed(2), frames: stat.frames, fps: +(stat.frames / T).toFixed(1), seaScriptMs: +(stat.script / n).toFixed(3), renderCallMs: +(stat.render / n).toFixed(2), from: t0, to: +lt.toFixed(1) });
      }, sec * 1000));
    },
    dbg: () => ({ ...S.dbg(), detail: LEVELS[S.state.level], net: netAuto, lt: +lt.toFixed(2), paused, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, deckMargin: +S.deckMargin().toFixed(2) }),
  };
  globalThis.__H128_LOOK = look;
  // the probe's handle (tools/probe109.cjs waits for __T.booted && __T.game, renders before a shot)
  globalThis.__T = { booted: true, game: { frame() {} }, simulate() {}, render() { S.render(); }, renderer };
  return look;
}
