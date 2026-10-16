/* ─────────────────────────────────────────────────────────────────────────────
 * game-harness-entry.js: boots src/game (v2) against a FAKE 3D world (bundled by game-harness.cjs).
 *
 * The fake world implements the stages.js interface the game uses, logs every call
 * (window.__H.world.calls) and keeps the states it was told. It needs no WebGL, so the harness is fast.
 * URL params:  fast=1 (short animations and tutorial timers) · theme=dark|light · bg=<image url>
 *              api12=1 (also provide the GDD §12 world requests: hotspot, screenPos, showPlan, redLine, …)
 *              broken=1 (a world that throws / hangs / rejects: the game must keep going) · demo=1
 *              tod=dawn|noon|dusk|night (pins the game's clock; the harness pins noon unless a test asks)
 * ──────────────────────────────────────────────────────────────────────────── */
import { createGame } from '../src/game/index.js';

const P = new URLSearchParams(location.search);
const FAST = P.get('fast') === '1';
const MS = FAST ? { walk: 30, hit: 40 } : { walk: 320, hit: 450 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
if (P.get('theme')) document.documentElement.dataset.theme = P.get('theme');
if (P.get('bg')) document.getElementById('c').style.backgroundImage = `url("${P.get('bg')}")`;

function createFakeWorld() {
  const calls = [], stages = {};
  let boulders = new Array(12).fill(2);
  const hero = { x: 150, y: 0, z: -96, at: null, vis: false };
  const log = (fn, ...args) => calls.push({ fn, args, t: Math.round(performance.now()) });
  const world = {
    calls, stages, get boulders() { return boulders.slice(); }, timeOfDay: null, focused: null,
    setStage(id, status, progress) { stages[id] = { status, progress: progress || 0 }; log('setStage', id, status, Math.round((progress || 0) * 1000) / 1000); },
    setBoulders(states) { boulders = states.slice(); log('setBoulders', states.join('')); },
    hitBoulder(i) { boulders[i] = Math.max(0, boulders[i] - 1); log('hitBoulder', i); return wait(MS.hit).then(() => true); },
    hero: {
      walkTo(target) { log('hero.walkTo', target); return wait(MS.walk).then(() => { hero.at = typeof target === 'string' ? target : target && target.boulder !== undefined ? 'b' + target.boulder : null; return true; }); },
      swing(o) { log('hero.swing', o && o.shake === false ? 'noshake' : ''); return wait(400).then(() => true); },   // the real swing hits at 0.40 s
      place(t) { log('hero.place', t); hero.at = t && t.boulder !== undefined ? 'b' + t.boulder : t; },
      show(v) { hero.vis = !!v; log('hero.show', !!v); },
      get position() { return { x: hero.x, y: hero.y, z: hero.z }; },
      get at() { return hero.at; },
    },
    groundAt: () => 0,
    siteTop: (id) => ({ x: 0, y: 20, z: 0 }),
    workFX(id) { log('workFX', id); },
    celebrate(id) { log('celebrate', id); },
    focus(id, dur) { world.focused = id; log('focus', id); },
    setTimeOfDay(k) { world.timeOfDay = k; document.documentElement.dataset.tod = k; log('setTimeOfDay', k); },
    isDone: (id) => stages[id] && stages[id].status === 'done',
  };
  if (P.get('api12') === '1') {
    // the GDD §12 world API as stages.js v2 provides it (signatures only; the promises resolve after a while)
    for (const n of ['hotspot', 'setCraneSite', 'redLine', 'boxes', 'setVine', 'rain', 'strikeFX', 'setComboLevel', 'setQuarryStock']) world[n] = (...a) => log(n, ...a);
    const later = (n, ms) => (...a) => { log(n, ...a); return wait(FAST ? Math.min(ms, 120) : ms); };
    world.showPlan = (ms = 2600) => { log('showPlan', ms); return wait(ms); };
    world.orbit = later('orbit', 3000); world.showcase = later('showcase', 4000); world.shine = later('shine', 3000);
    world.playTimelapse = (changes, ms = 4000) => {
      log('playTimelapse', (changes || []).map((c) => c.id).join(','), ms);
      for (const c of changes || []) world.setStage(c.id, c.b.status, c.b.p);
      return wait(FAST ? 150 : ms);
    };
    const sp = { x: 0, y: 0, on: true };
    world.screenPos = (t, out) => { const o = out || sp; o.x = innerWidth / 2; o.y = innerHeight * 0.45; o.on = true; return o; };
    world.quarry = { x: 208, z: -208, spot: { x: 196, z: -199 } }; world.hasQuarry = true;
    world.hero.setTool = (k) => log('hero.setTool', k);
  }
  if (P.get('site6') === '1') {
    // ── build6 ── SITE's v6 API (bus/SITE.md) and PEOPLE's strokes (bus/PEOPLE.md), signatures only
    world.siteInfo = (id) => ({ kind: 'ashlar', stone: 'ash', courses: 10, perCourse: [], stones: 400, H: 2 });
    world.setWork = (id, o) => { stages[id] = { status: 'building', progress: stages[id] ? stages[id].progress : 0, work: o }; log('setWork', id, o.phase, o.stones, o.stock); return { stones: o.stones }; };
    world.liftStone = (id, o) => { log('liftStone', id, !!(o && o.great)); return wait(FAST ? 60 : 900).then(() => ({ course: 0, index: 0 })); };
    world.nextSlot = (id) => { log('nextSlot', id); return { x: 0, y: 10, z: 0, w: 2, h: 1, d: 1, yaw: 0, course: 0, index: 0 }; };
    world.workSpot = (id, kind) => { log('workSpot', id, kind); return { x: 10, y: 0, z: 10, face: [12, 10] }; };
    world.hero.act = (kind, target, o) => { log('hero.act', kind); return wait(400).then(() => true); };
    world.hero.workpiece = (st) => log('hero.workpiece', st);
    // ── flow9 ── SITE9's boulder field (DESIGN8B's proposal, STAGING §4: a zigzag from rock 4 toward the crane) and M11's delivery
    world.boulderSpots = () => [[206.3, -8.6, 8.6], [202.3, 15.3, 7.4], [225.9, 10.3, 9.2], [221.8, 34.1, 7.8], [128, -84, 8.4], [123.9, -60.2, 7.6], [147.6, -65.1, 8.8], [143.5, -41.3, 7.4], [167.2, -46.3, 8.4], [163.1, -22.5, 7.8], [186.8, -27.4, 8.6], [182.7, -3.6, 9]];
    world.deliverKeyStone = (id, o) => { log('deliverKeyStone', id, o && o.what); return wait(FAST ? 150 : 1500).then(() => true); };
  }
  if (P.get('parts') === '1') {
    // ── build6 ── MATCH3, KINGS and FUN as their contracts say (bus/MATCH3.md, bus/KINGS.md, bus/FUN.md)
    const calls = world.calls;
    globalThis.__BH_PARTS = {
      match3: {
        FIELDS: { quarry: {}, forest: {}, gold: {} },
        runLevel(ctx) { calls.push({ fn: 'm3.runLevel', args: [ctx.field, JSON.stringify(ctx.need), !!ctx.demo] }); ctx.onEvent && ctx.onEvent('m3open', { field: ctx.field }); const m3 = ctx.save.get() || {}; ctx.save.set({ ...m3, level: { ...(m3.level || {}), [ctx.field]: ((m3.level || {})[ctx.field] || 1) + 1 } }); const got = {}; for (const [k, v] of Object.entries(ctx.need || {})) got[k === 'wstone' ? 'stone' : k] = v + (window.__M3_EXTRA != null ? window.__M3_EXTRA : 6); got.silver = 4;
          // (build7) window.__M3_LIVE: the board reports its material as gathered (m3collect), half now and half before the close
          const half = {}; if (window.__M3_LIVE) for (const [k, v] of Object.entries(got)) { half[k] = Math.floor(v / 2); ctx.onEvent && ctx.onEvent('m3collect', { res: k, n: half[k] }); }
          return wait(window.__M3_MS || (FAST ? 80 : 600)).then(() => { if (window.__M3_LIVE) for (const [k, v] of Object.entries(got)) ctx.onEvent && ctx.onEvent('m3collect', { res: k, n: v - half[k] }); ctx.onEvent && ctx.onEvent('m3close', {}); return { won: true, stars: window.__M3_STARS || 2, moves: 3, collected: got, score: 900, ms: 180000, quit: false, field: ctx.field, level: 3, attempts: 1 }; }); },
      },
      kings: {
        _due: [],
        PARTNERS: [{ id: 'tyre', short: 'צור וצידון' }, { id: 'nikanor', short: 'ניקנור' }],
        bestFor(G, res, need) { return res === 'cedar' ? { id: 'tyre_taste', partner: 'tyre', gives: { cedar: 60 }, cost: 5, ok: true } : res === 'bronze' && window.__KB_BRONZE ? { id: 'nik_doors', partner: 'nikanor', gives: { bronze: 150 }, cost: 20, ok: true } : null; },
        openCourt(ctx) { calls.push({ fn: 'kings.openCourt', args: [JSON.stringify(ctx.needs || {}), !!ctx.arrivals, ctx.partner || null, ctx.offer || null] }); const ok = ctx.apply({ cedar: 40, silver: -5 }); calls.push({ fn: 'kings.apply', args: [ok] }); return wait(FAST ? 60 : 400).then(() => ({ deals: 1, unloaded: 0 })); },
        settle(G, now) { const d = this._due; this._due = []; if (d.length) calls.push({ fn: 'kings.settle', args: [d.length] }); return d; },
        status() { return { sea: window.__KB_BRONZE ? 0 : 1, arrived: 0, next: null, badge: 1 }; },
      },
      minigames: {
        MINIGAMES: { crane: {}, dress: {}, plumb: {}, whole: {} },
        runMinigame(kind, ctx) { calls.push({ fn: 'fun.runMinigame', args: [kind, ctx.site, !!ctx.slot, ctx.kicker || null] }); return wait(FAST ? 60 : 500).then(() => ({ ok: true, quality: window.__KEY_Q != null ? window.__KEY_Q : 0.92, perfect: true, ms: 9000, score: 80 })); },
      },
    };
  }
  if (P.get('open7') === '1') {
    // ── build7 ── WORLD7's opening vision (bus/WORLD7.md): restore() at the swap (40 %), the promise at the end; visionSkip()
    let cur = null;
    world.vision = (o) => {
      log('vision', o.ms, !!o.to, typeof o.restore);
      return new Promise((res) => {
        const t1 = setTimeout(() => { log('vision.swap'); o.restore(); }, o.ms * 0.4);
        const t2 = setTimeout(() => { cur = null; log('vision.end'); res({ skipped: false }); }, o.ms);
        cur = { skip() { clearTimeout(t1); clearTimeout(t2); cur = null; o.restore(); res({ skipped: true }); } };
      });
    };
    world.visionSkip = () => { log('visionSkip'); if (cur) cur.skip(); };
  }
  if (P.get('broken') === '1') {
    world.setStage = () => { throw new Error('setStage exploded'); };
    world.hitBoulder = () => new Promise(() => {});           // never settles
    world.hero.walkTo = () => Promise.reject(new Error('no path'));
    world.focus = () => { throw new Error('no camera'); };
  }
  return world;
}

const world = createFakeWorld();
// a stand-in projection: world x/z spread over the screen, so anchors land somewhere sensible
const out = { x: 0, y: 0, on: true };
const view = {
  project(x, y, z) { out.x = innerWidth / 2 + x * 0.6; out.y = innerHeight * 0.5 + z * 0.35 - y * 0.5; out.on = true; return out; },
  lookAt(...a) { world.calls.push({ fn: 'view.lookAt', args: a.slice(0, 3) }); },
};
const hooks = {
  enterWhole() { world.calls.push({ fn: 'hooks.enterWhole', args: [] }); document.body.classList.add('whole-demo'); },
  exitWhole() { world.calls.push({ fn: 'hooks.exitWhole', args: [] }); document.body.classList.remove('whole-demo'); },
  setAutoRotate(v) { world.calls.push({ fn: 'hooks.setAutoRotate', args: [v] }); },
};
window.__GAME_LOG = [];
const game = createGame({
  world, root: document.body, view, hooks,
  options: { fast: FAST, fixedTime: P.get('tod') || false },     // tod=dawn|noon|dusk|night pins the clock
  onEvent: (type, d) => window.__GAME_LOG.push({ t: performance.now(), type, d }),
});
window.__H = { world, game };
// frames for the world-anchored HUD
(function loop(now) { game.frame(now); requestAnimationFrame(loop); })(performance.now());
game.start();
