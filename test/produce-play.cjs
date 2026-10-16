// PRODUCER10 (wave 10): the owner's play by REAL TOUCH, in parts over one persistent profile (a phone that keeps its save).
//   node test/produce-play.cjs --tag=base [--url=file:///…/dist/test.html] [--fresh] [--budget=420] [--until="s.set>=12"]
//        [--shots=24] [--demo] [--watch] [--time=noon|real] [--profile=dir] [--name=אהרן]
// Phone portrait 390×844, dpr 1, hasTouch/isMobile, he-IL. Input is only what a player does: page.touchscreen.tap on what the
// screen shows (the gold pointer `.gm-mark`, the coach's hand, the ring, a card's gold button, a sheet's big button, the goal
// pill, the game's own on-screen hand in a precision game, the board's vessels read from its pixels). The state is READ, never
// written. The only test hook is the renderer's (__START_PAUSED + __T.simulate): SwiftShader cannot run the loop at 60 fps, so
// the world advances in real time and a frame is drawn before every tap and every screenshot.
// At every step it asks the owner's questions: can I see my kohen (on screen, not hidden, big enough)? do I know what to tap
// (a pointer/hand/ring/pill)? is the frame too dark / too yellow (the shot's mean light)? It logs the words the player reads.
// --watch: the demo's reel — a shot every ~25 s, taps only what a card asks.
// Output: test/out/produce/<tag>-NN-<step>.png and <tag>-log.json (steps, words, hero visibility, light, mini-games, board).
// PRODUCER11 (wave 11): --jump reaches ANY stage (the seed's jump, declared and logged "JUMP (state written once)"; after it,
//   only touch). Forms:  --jump='{"stage":"wall"}'            the wall's start: every stage before it (content.js STAGES order,
//                          which is the player's order and satisfies every dep) done, with what a player has by then (crews,
//                          priests, the book's unlocked mishnayot, finds, chapters) and materials; the pill says "התחל לבנות"
//                        --jump='{"stage":"wall","frac":0.3}'  the site already at that fraction (the game's own v5 → v6
//                          conversion: 0.8·c/C = course c of C; > 0.8 the finish; 1 = its key moment ready), in focus
//                        --jump='{"stage":"har","frac":0.95}'  the Mount near its end (the rocks cleared)
//                        + "res":{…} to set the materials (default: enough for a few segments of any stage), + "ftue":99
//                        --jump='{"har":{…}}'                  the old form (the Mount's fields)
//   The state read (st) follows the stage in focus (else the jump's stage). Every shot logs "the kohen ≥ 80 px and in frame"
//   (K80 ✓/✗: on screen, not hidden, projected height of his 3.6 amot ≥ 80 px — STAGING rule 1) and the run ends with the count.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (e) { sharp = null; }
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
// (PRODUCER11) a queued run can be re-planned while it waits for its turn: test/out/produce/<tag>.args.json overrides the arguments
try { const f = path.join(__dirname, 'out/produce', (A.tag || 'play') + '.args.json'); if (fs.existsSync(f)) { Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); console.log('args from ' + f + ': ' + JSON.stringify(A)); } } catch (e) { console.log('args file: ' + e.message); }
// (PRODUCER11) a queued ticket handed to the other harness (the queue is FIFO; the args file says which run is due first):
//   {"exec": "produce-middot.cjs", "argv": ["--tag=x", …]} — the rest of this file does not run
if (A.exec && A.exec !== path.basename(__filename)) { process.argv = [process.argv[0], path.join(__dirname, A.exec), ...(A.argv || [])]; console.log('exec ' + A.exec + ' ' + (A.argv || []).join(' ')); require(path.join(__dirname, A.exec)); return; }
const TAG = A.tag || 'play';
let URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html');
// (PRODUCER11) a run keeps the build it started with (a reload mid-run must not pick up a newer merge): the page is copied once
if (/^file:\/\//.test(URL0) && A.pin !== '0') { try { const src = URL0.replace(/^file:\/\//, ''), dst = path.join(ROOT, 'test/out/produce/builds', `run-${TAG}.html`); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); console.log(`build: ${src} → ${dst}`); URL0 = 'file://' + dst; } catch (e) { console.log('build pin: ' + e.message); } }
const DEMO = !!A.demo, WATCH = !!A.watch;
const BUDGET = +(A.budget || 420) * 1000;
const SHOTS = +(A.shots || 24);
const NAME = A.name || 'אהרן';
const PROFILE = path.resolve(A.profile || path.join(ROOT, 'test/out/produce/profile-' + TAG.replace(/-.*/, '')));
const UNTIL = A.until ? new Function('s', 'return (' + A.until + ');') : () => false;
const OUT = path.join(ROOT, 'test/out/produce');
fs.mkdirSync(OUT, { recursive: true });
if (A.fresh) fs.rmSync(PROFILE, { recursive: true, force: true });
fs.mkdirSync(PROFILE, { recursive: true });
const W = 390, H = 844;
// (PRODUCER11) the stages, their order, deps and work units, and the book's unlocks, read from the source (so the jump follows it)
const SRC = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const STG = [...SRC('src/game/content.js').matchAll(/^\s*S\('(\w+)', '([^']+)', (\d), \[([^\]]*)\], (\d+)/gm)].map((m) => ({ id: m[1], n: m[2], ch: +m[3], deps: m[4].split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean), W: +m[5] }));
const UNL = (() => { const m = SRC('src/game/middot.js').match(/export const UNLOCKS = (\{.*?\});/); try { return m ? JSON.parse(m[1]) : {}; } catch (e) { return {}; } })();
// (PRODUCER12) each site's courses (C) and stones per course (P), read from content.js PROJ: a course ends every P stones
const PJ = Object.fromEntries([...SRC('src/game/content.js').matchAll(/^\s*(\w+): J\((\d+), (\d+),/gm)].map((m) => [m[1], { C: +m[2], P: +m[3] }]));
const JUMP = A.jump ? JSON.parse(A.jump) : null;
// (PRODUCER13a, wave 13 — the owner now tests in the DEMO) --demoPick=har:150,wall:150,…  the demo entered by touch from the menu
//   ("מצב הדגמה"), then each stage chosen by touch from the strip's "שלבים ▾" picker (the gold "⏭ לשלב הבא" when it names the
//   stage, else its numbered row), then played by touch for its seconds. With it: the kohen's track at 4 Hz (world spot, screen
//   spot, his height in px, the camera and its target, the job, the stock) and the game log's heroReturn / heroAim / heroPlace /
//   workFrame / courseBeat / stoneSet events, summed per stage and per idle window (note 3: "עמד וזז מצד לצד"); --idle=12 idle
//   windows of 12 s (no touch at all) after each course, after a game, when the stock runs out, and every --idleEvery s; a census
//   of the machines, carts, scaffold and crews in the working frame and in a wide frame at each stage's start (note 5).
const DEMOPICK = A.demoPick ? String(A.demoPick).split(',').filter(Boolean) : null;
const IDLE_S = +(A.idle || (DEMOPICK ? 12 : 0)), IDLE_EVERY = +(A.idleEvery || 70);
let STAGE0 = (JUMP && JUMP.stage) || A.stage || null;   // (the stage the state read follows when none is in focus; each jump sets it)
const T0 = Date.now();
const left = () => BUDGET - (Date.now() - T0);
const sec = () => Math.round((Date.now() - T0) / 1000);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'],
    viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL',
  });
  const log = { tag: TAG, url: URL0, steps: [], words: [], shots: [], mg: [], board: [], hero: [], errors: [] };
  try {
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = ctx.pages()[0] || await ctx.newPage();
    await pg.addInitScript((t) => {
      window.__FORCE_Q = 'normal'; if (t.time !== 'real') window.__FORCE_TIME = t.time; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DIALOGS = [];
      if (t.jump) window.__NO_OPENING = true;   // (PRODUCER11: a jumped save is a returning player's: no opening vision on the empty profile's first boot)
      for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => { window.__DIALOGS.push(k); return null; };
      if (t.track) {   // (PRODUCER13a) the kohen's track, read 4 times a second (nothing written): [t, x, y, z, headX, headY, px, front, cam x y z, target x y z, busy, site, phase, set, stock, mark, yaw]
        window.__TRK = []; window.__TRK_MARK = '';
        setInterval(() => { try {
          const T = window.__T; if (!T || !T.stages || !T.stages.hero || !T.camera || !T.game) return;
          const h = T.stages.hero, c = T.camera; c.updateMatrixWorld(); const P = h.position;
          const pr = (x, y, z) => { const v = new P.constructor(x, y, z).project(c); return [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight), v.z < 1 ? 1 : 0]; };
          const a = pr(P.x, P.y, P.z), b = pr(P.x, P.y + 3.6, P.z), g = T.game.state, id = g && g.focus, s = id && g.st[id], tg = T.controls && T.controls.target;
          window.__TRK.push([Math.round(performance.now()), +P.x.toFixed(2), +P.y.toFixed(2), +P.z.toFixed(2), b[0], b[1], Math.abs(a[1] - b[1]), a[2], +c.position.x.toFixed(1), +c.position.y.toFixed(1), +c.position.z.toFixed(1), tg ? +tg.x.toFixed(1) : 0, tg ? +tg.y.toFixed(1) : 0, tg ? +tg.z.toFixed(1) : 0, T.game._ && T.game._.hero && T.game._.hero.busy ? 1 : 0, id || '', s ? (s.done ? 'done' : s.p) : '', s ? s.set : -1, s && s.paid != null ? s.paid - s.set : -1, window.__TRK_MARK || '', h.rotation ? +h.rotation.y.toFixed(2) : (h.yaw != null ? +(+h.yaw).toFixed(2) : 0)]);
          if (window.__TRK.length > 40000) window.__TRK.splice(0, 8000);
        } catch (e) { /* the track is optional */ } }, 250);
      }
    }, { time: A.time || 'noon', jump: !!(JUMP || A.stages || DEMOPICK), track: !!(DEMOPICK || A.track) });
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) log.errors.push(m.text().slice(0, 200)); });
    pg.on('pageerror', (e) => log.errors.push('PAGEERR ' + e.message.slice(0, 200)));
    await pg.goto(URL0 + (DEMO ? '#demo' : ''));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    note(`booted (${A.fresh ? 'fresh profile' : 'profile kept'})`);
    const E = (fn, a) => pg.evaluate(fn, a);
    const wait = (ms) => pg.waitForTimeout(ms);
    const draw = () => E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); });
    const canvas3d = (on) => E((v) => { const c = [...document.querySelectorAll('canvas')].find((x) => !x.closest('.fx-mg, .m3, .g10, [data-g10]')); if (c) c.style.visibility = v ? '' : 'hidden'; }, on);
    let hidden3d = false, nShot = 0;
    // the kohen as the player sees him: on screen? hidden behind something? how tall on screen? how far?
    const heroView = (noOcc = false) => E((noOcc) => {
      const S = __T.stages, h = S.hero; if (!h) return null;
      __T.camera.updateMatrixWorld();
      const cam = __T.camera, P = h.position.clone(), head = P.clone(); head.y += 3.6;   // (PRODUCER11: his full height, STAGING §3: ≈ 3.6 amot; wave 10 measured 1.7, half of him)
      const pr = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * innerWidth, y: (1 - q.y) / 2 * innerHeight, front: q.z < 1 }; };
      const a = pr(P), b = pr(head), dist = cam.position.distanceTo(head);
      const on = a.front && b.x > 10 && b.x < innerWidth - 10 && b.y > 90 && a.y < innerHeight - 110;
      let occ = null;
      if (on && !noOcc) {   // (PRODUCER11) hidden = his head AND his chest both behind something (one grazing ray — a banker's stone, an arm — is not "hidden")
        const mine = (o) => { for (let q = o; q; q = q.parent) if (q === h) return true; return false; };
        const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
        const block = (pt) => {
          const rc = new __T.Raycaster(); const dd = cam.position.distanceTo(pt); rc.set(cam.position, pt.clone().sub(cam.position).normalize()); rc.camera = cam;   // (a Sprite's raycast needs the camera)
          for (const x of rc.intersectObjects(__T.scene.children, true)) {
            if (x.object.isSkinnedMesh && x.point.distanceTo(P) < 4.5) continue;   // (PRODUCER12: a skinned body at his feet — his own, whose bones hang outside his group — does not hide him)
            const mt = Array.isArray(x.object.material) ? x.object.material[0] : x.object.material;
            { let sid = null; for (let q = x.object; q && !sid; q = q.parent) { const m2 = /^stage-(\w+)$/.exec(q.name || ''); if (m2) sid = m2[1]; }   // (SITE12 18:41: a site being built draws only up to its built height — the reveal shader discards the rest)
              const STD = __T.stages._dbg && __T.stages._dbg.ST; if (sid && STD && STD[sid] && STD[sid].status === 'building' && STD[sid].U && STD[sid].U.uY && x.point.y > STD[sid].U.uY.value + 0.05) continue; }   // (PRODUCER12: a pick proxy / hit box — material invisible, no colour written, near-clear — hides nothing)
            if (mine(x.object) || !vis(x.object) || x.object.name === 'hill' || (x.object.geometry && x.object.geometry.boundingSphere && x.object.geometry.boundingSphere.radius > 3000) || x.object.name === 'pave' || x.object.isPoints || x.object.isLine || x.object.isSprite || (mt && (mt.visible === false || mt.colorWrite === false || (mt.transparent && (mt.opacity < 0.5 || mt.depthWrite === false || mt.blending === 2)) || mt.opacity < 0.2))) continue;
            return x.distance < dd - 1.2 ? { obj: (x.object.name || x.object.type) + (x.object.parent && x.object.parent.name ? '<' + x.object.parent.name : ''), d: Math.round(x.distance), mat: mt ? `${mt.type}${mt.transparent ? ' tr' : ''}${mt.depthWrite === false ? ' nodw' : ''} o${mt.opacity}` : '', geo: x.object.geometry ? x.object.geometry.type + ' r' + Math.round((x.object.geometry.boundingSphere || { radius: 0 }).radius) : '' } : null;
          }
          return null;
        };
        const chest = P.clone(); chest.y += 2.2;
        const o1 = block(head), o2 = block(chest);
        if (o1 && o2) occ = o1;
      }
      return { x: Math.round(b.x), y: Math.round(b.y), px: Math.round(Math.abs(a.y - b.y)), dist: Math.round(dist), on, hidden: !!occ, occ, pos: [P.x, P.y, P.z].map(Math.round), busy: !!(__T.game._ && __T.game._.hero && __T.game._.hero.busy), noOcc };
    }, noOcc);
    const light = async (f) => {
      if (!sharp) return null;
      try { const { channels } = await sharp(f).extract({ left: 0, top: 110, width: W, height: 560 }).stats(); const [r, g, b] = channels.map((c) => c.mean); return { lum: Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b), yel: Math.round((r + g) / 2 - b), rgb: [r, g, b].map(Math.round) }; } catch (e) { return null; }
    };
    const shot = async (name, force = false, lite = false) => {   // (PRODUCER13a) lite: no occlusion rays (they cost ~5 s a shot on SwiftShader)
      if (nShot >= SHOTS && !force) return null;
      if (A.uiShots === '0' && /^(sheet-|card$|picker-|menu-open|demo-on)/.test(name)) return null;   // (PRODUCER13: the sheets and cards are seen once; each shot costs ~10 s of play on SwiftShader)
      if (hidden3d) await canvas3d(true);
      await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const hv = await heroView(lite).catch(() => null);
      const f = path.join(OUT, `${TAG}-${String(++nShot).padStart(2, '0')}-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      await E(() => { window.__HUD_HOLD = false; });
      if (hidden3d) await canvas3d(false);
      const L = await light(f), s = await st(), w = await words();
      const mus = await E(() => { try { const M = globalThis.__BH_MUSIC; const g = M && M.get ? M.get() : null; return g ? { state: g.state, bpm: g.bpm, int: g.intensity, fin: (() => { try { const F = globalThis.__BH_FINALE; const x = F && F.state; return x ? { b: Math.round((x.buildup || 0) * 100) / 100, lands: Array.isArray(x.lands) ? x.lands.length : x.lands, lamps: x.lamps, cel: x.celebrating } : undefined; } catch (e) { return undefined; } })() } : null; } catch (e) { return null; } }).catch(() => null);   // (PRODUCER12, note 5: the music's state and tempo at every shot)
      const ov = await E(() => [...document.querySelectorAll('.fx-mg, .m3 .m3-hit, .gm-modal.on, .gm-sheet.on, .gm-sh.on, .gm-mo.on, .g10, [data-g10]')].some((x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.height > 60 && r.width > 60 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; })).catch(() => false);   // (PRODUCER13a: a hidden overlay left in the DOM is not an overlay)
      const k80 = /-c\d+-(fix-|pinch)|-wide-/.test(name) ? 'zoomed-out' : !hv ? 'no-hero' : ov ? 'overlay' : (!s.p || s.p === 'done') ? `between (${hv.on && !hv.hidden && hv.px >= 80 ? '✓' : hv.px + 'px'})` : hv.on && !hv.hidden && hv.px >= 80 ? '✓' : `✗ ${!hv.on ? 'OFF-FRAME' : hv.hidden ? 'HIDDEN' : hv.px + 'px'}`;
      const rec = { f: path.relative(ROOT, f), t: sec(), s, hero: hv, k80, light: L, pill: w.pill, bub: w.bub, toast: w.toast, mus };
      log.shots.push(rec);
      note(`SHOT ${rec.f} · K80 ${k80} · ${JSON.stringify({ s: `${s.id}:${s.p}/${s.set}/ftue${s.ftue}`, hero: hv && `${hv.on ? 'on' : 'OFF'}${hv.hidden ? ' HIDDEN(' + hv.occ.obj + ')' : ''} ${hv.px}px d${hv.dist}`, light: L && `lum${L.lum} yel${L.yel}`, mus: mus && `${mus.state}${mus.bpm ? '@' + mus.bpm : ''}${mus.int != null ? ' i' + mus.int : ''}${mus.fin && (mus.fin.b || mus.fin.cel) ? ` · finale b${mus.fin.b} lands ${mus.fin.lands} lamps ${mus.fin.lamps}${mus.fin.cel ? ' CELEBRATING' : ''}` : ''}`, pill: w.pill.slice(0, 50) })}`);
      return f;
    };
    const st = async () => { for (let q = 0; q < 6; q++) { const r = await st1().catch(() => ({ gone: true })); if (!r.gone) return r; await pg.waitForTimeout(800); } return { gone: true }; };   // (PRODUCER13: a switch or a pick re-makes the game state for a moment)
    const st1 = () => E((sid) => { const g = __T.game && __T.game.state; if (!g) return { gone: true }; const id = g.focus || sid || 'har', h = g.st[id] || {}, r = g.res || {}; return { id, ftue: g.ftue, p: h.done ? 'done' : h.p, set: h.set, n: h.n, paid: h.paid, fd: h.fd, ready: !!h.ready, done: !!h.done, bh: id === 'har' ? (g.bh || []).join('') : undefined, stone: Math.round(r.stone || 0), wstone: Math.round(r.wstone || 0), cedar: Math.round(r.cedar || 0), bronze: Math.round(r.bronze || 0), gold: Math.round(r.gold || 0), silver: Math.round(r.silver || 0), name: g.name, demo: !!g.demo, focus: g.focus, book: g.book ? { pts: g.book.pts } : null }; }, STAGE0);
    const words = () => E(() => { const t = (s) => { const n = document.querySelector(s); return n && n.offsetParent ? n.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) : ''; }; const ts = [...document.querySelectorAll('.gm-toasts .gm-toast')].map((n) => n.innerText.replace(/\s+/g, ' ').trim().slice(0, 120)); return { pill: t('.gm-pill'), bub: t('.gm-bub'), toast: ts[ts.length - 1] || '' }; });
    const readWords = async (at) => { const w = await words(); const last = log.words[log.words.length - 1]; if (!last || last.pill !== w.pill || last.bub !== w.bub || last.toast !== w.toast) { log.words.push({ t: sec(), at, ...w }); } return w; };
    const markPt = async () => { await draw(); return E(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); const L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); return t ? { x: +t[1], y: +t[2], d: L ? L.d : null } : null; }); };
    const coachPt = () => E(() => { const c = document.querySelector('.gm-coach'); if (!c || c.classList.contains('gm-hidden') || c.style.opacity === '0') return null; const m = c.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m ? { x: +m[1], y: +m[2] } : null; });
    const ringPt = () => E(() => { const r = document.querySelector('.gm-ring'); if (!r || !r.classList.contains('live')) return null; const m = r.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m ? { x: +m[1], y: +m[2] } : null; });
    const inFrame = (p) => !!p && p.x > 20 && p.x < W - 20 && p.y > 100 && p.y < H - 130;
    const tap = async (x, y, why) => { await draw(); await pg.touchscreen.tap(x, y); log.steps.push({ t: sec(), x: Math.round(x), y: Math.round(y), why }); if (why) note(`tap (${x | 0},${y | 0}) ${why}`); };
    const tapEl = async (sel, why) => { const h = await pg.$(sel); if (!h) return false; const r = await h.boundingBox(); if (!r) return false; await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); log.steps.push({ t: sec(), sel, why, w: Math.round(r.width), h: Math.round(r.height) }); note(`tap ${sel} ${why || ''} [${Math.round(r.width)}×${Math.round(r.height)}]`); return true; };
    const modalText = () => E(() => { const m = document.querySelector('.gm-modal.on .gm-card'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 240) : null; });
    const tapModal = async () => (await tapEl('.gm-modal.on .gm-btn-gold', 'card')) || tapEl('.gm-modal.on button', 'card (its only button)');

    // (PRODUCER12, note 2) the whole Mount at the end of each course: the SAME fixed cameras every time (the view from the Mount of
    // Olives, VIEWS.olives; from above, VIEWS.top; SITE8B's wide [260,150,-250]→[150,-40,-40]), then the owner's own zoom-out — a
    // real two-finger pinch — as he does it. The camera is put back where the game had it after the fixed shots.
    const FIXCAMS = { olives: null, top: null, wide: { p: [260, 150, -250], t: [150, -40, -40] }, se: { p: [540, 420, 640], t: [-20, -20, -10] }, pinch7: null };   // (se, pinch7: SITE12's cameras, bus 18:24 — pinch7 = wallView('har')'s ray × 7, fixed at the first course shot)
    const pinchOut = async (n = 3) => {
      const cdp = await ctx.newCDPSession(pg);
      for (let k = 0; k < n; k++) {
        const a0 = [{ x: 95, y: 430, id: 1 }, { x: 295, y: 430, id: 2 }];
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: a0 });
        for (let q = 1; q <= 10; q++) { const d = 100 - 80 * q / 10; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195 - d, y: 430, id: 1 }, { x: 195 + d, y: 430, id: 2 }] }); await wait(30); }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(250);
      }
      await cdp.detach().catch(() => {});
    };
    const courseShots = async (id, c, why) => {
      if (!A.fixcam) return;
      if (await E(() => !!document.querySelector('.gm-sheet.on'))) await tapEl('.gm-sheet.on .gm-x[data-a="close"]', 'the sheet: × (before the course shots)');   // (a child closes the sheet to look)
      await E(() => __T.simulate(true)); await wait(+(A.settle || 3000));   // (the site's eased progress reaches its count: ~2 s at 3.2/s)
      const sv = await E(() => ({ p: __T.camera.position.toArray(), t: __T.controls.target.toArray() }));
      const cams = String(A.fixcam === true || A.fixcam === '1' ? 'olives,se,pinch7' : A.fixcam).split(',');
      for (const k of cams) {
        if (k === 'pinch7' && !FIXCAMS.pinch7) { FIXCAMS.pinch7 = await E(() => { const v = __T.stages.wallView && __T.stages.wallView('har'); if (!v) return null; const p = v.p.map((x, i) => v.t[i] + (x - v.t[i]) * 7); return { p, t: v.t }; }); note(`pinch7 camera ${JSON.stringify(FIXCAMS.pinch7)}`); log.pinch7 = FIXCAMS.pinch7; }
        const v = FIXCAMS[k] || (await E((k) => __T.VIEWS[k] || null, k)); if (!v) continue;
        await E((v) => { __T.look(v.p, v.t); }, v);
        const f = await shot(`${id}-c${c}-fix-${k}`, true);
        log.fix = (log.fix || []).concat({ id, c, cam: k, f: f && path.relative(ROOT, f), why, t: sec(), set: (await st()).set });
      }
      await E((v) => { __T.look(v.p, v.t); }, sv);
      if (A.pinch !== '0') { await pinchOut(+(A.pinch || 2)); await wait(700); const f = await shot(`${id}-c${c}-pinch`, true); const cam = await E(() => ({ p: __T.camera.position.toArray().map(Math.round), d: Math.round(__T.camera.position.distanceTo(__T.controls.target)) })); log.fix = (log.fix || []).concat({ id, c, cam: 'pinch', f: f && path.relative(ROOT, f), why, t: sec(), at: cam }); note(`PINCH-OUT at course ${c}: camera ${JSON.stringify(cam)}`); }
    };
    // (PRODUCER12, note 1) which game a quarry action brought: whatever game overlay is open, named (the board and its level/goal,
    // a precision game, an in-between game, the sling, or anything new that covers the screen)
    const whatOpen = () => E(() => {
      const vis = (x) => { if (!x) return false; const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.height > 50 && r.width > 50 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };   // (a fixed overlay has no offsetParent)
      const tx = (x) => (x ? x.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : '');
      const m3 = document.querySelector('.m3'); if (vis(m3)) return { kind: 'board', title: tx(m3.querySelector('.m3-card')) || tx(m3.querySelector('.m3-top, .m3-hud')), level: (__T.game.state.m3 && __T.game.state.m3.level) || null };
      const mg = document.querySelector('.fx-mg'); if (vis(mg)) return { kind: 'precision:' + (mg.dataset.kind || '?'), title: tx(mg.querySelector('.fx-mg-top')) };
      const g = document.querySelector('.g10, [data-g10]'); if (vis(g)) { const id = g.dataset.game || g.dataset.g10 || (g.querySelector('[data-game]') || {}).dataset?.game || ''; return { kind: 'g10:' + id, title: tx(g.querySelector('.g10-card h2, .g10-card h3, .g10-top, .g10-title')) || tx(g).slice(0, 100) }; }
      const other = [...document.querySelectorAll('body > div, body > section')].find((x) => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return r.width > 300 && r.height > 500 && cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.5 && !/(^|\s)gm($|\s|-)|hud|card|hint|bar|toast/.test(x.id + ' ' + x.className) && x.querySelector('canvas, button'); });
      return other ? { kind: 'other:' + (other.className || other.id || other.tagName).toString().slice(0, 40), title: tx(other).slice(0, 120) } : null;
    });
    let openWas = null, lastPillTap = '';
    const logOpen = async () => {
      const o = await whatOpen().catch(() => null), k = o ? o.kind : null;
      if (k !== (openWas && openWas.kind)) {
        if (o) { const q = { t: sec(), n: (log.quarry || []).length + 1, kind: o.kind, title: o.title, level: o.level, after: lastPillTap }; log.quarry = (log.quarry || []).concat(q); note(`GAME OPEN #${q.n}: ${o.kind} · "${(o.title || '').slice(0, 90)}" · after "${lastPillTap.slice(0, 50)}"${o.level ? ' · m3 level ' + JSON.stringify(o.level) : ''}`); }
        else if (openWas) { const q = (log.quarry || [])[log.quarry.length - 1]; if (q && !q.s) q.s = sec() - q.t; note(`GAME CLOSED: ${openWas.kind}${q ? ' after ' + q.s + ' s' : ''}`); }
        openWas = o;
      }
      return o;
    };
    // (PRODUCER12, note 1) a quarry action on purpose: the pill when it offers "▶ …", else the meter's stone chip → "▶ שחק"
    let quarryN = 0;
    const openQuarry = async () => {
      if (A.drain) {   // (declared, logged: the meter's stone emptied, so the pill offers the quarry as it does when a step lacks stone)
        const was = await E(() => { const g = __T.game.state; const w = Math.round(g.res.stone || 0); g.res.stone = 0; __T.game._.resync(); return w; });
        note(`DRAIN (declared): the meter's stone ${was} → 0`); await wait(1500);
        for (let q = 0; q < 6 && !(await E(() => { const b = document.querySelector('.gm-pill'); return !!(b && b.offsetParent && /^▶/.test(b.innerText.trim())); })); q++) { if (await E(() => !!document.querySelector('.gm-modal.on'))) await tapModal(); await wait(800); }
      }
      const p = await E(() => { const b = document.querySelector('.gm-pill'); return b && b.offsetParent ? b.innerText.replace(/\s+/g, ' ').trim() : ''; });
      quarryN++;
      if (/^▶/.test(p)) { lastPillTap = p; note(`QUARRY #${quarryN} by the pill "${p}"`); await tapEl('.gm-pill', `quarry #${quarryN}: the pill`); return true; }
      if (!(await tapEl('.gm-res [data-r="stone"]', `quarry #${quarryN}: the stone chip`))) return false;
      await wait(1200);
      const b = await E(() => { const x = [...document.querySelectorAll('[data-a="playField"]')].find((y) => y.offsetParent); if (x) x.dataset.qa = 'pf'; return x ? x.innerText.trim() : null; });
      if (!b) { note('the stone sheet has no "▶ שחק"'); await shot('quarry-sheet-noplay', true); return false; }
      lastPillTap = `the stone sheet: ${b}`; note(`QUARRY #${quarryN} by the stone sheet "${b}"`);
      await shot(`quarry${quarryN}-sheet`, true);
      await tapEl('[data-a="playField"][data-qa="pf"]', `quarry #${quarryN}: ▶ שחק`);
      return true;
    };
    // (PRODUCER12) an in-between game (.g10) played by touch as a child plays it: the how-to's "לבד", then the game's own loop
    // (נדבך על נדבך: the stone set when it is over the course, a miss after 8 to end the wall; any other game: its big targets),
    // then its result card read and "חזרה"
    const tapBox = async (bb, fx = 0.5, fy = 0.5) => { if (bb) await pg.touchscreen.tap(bb.x + bb.width * fx, bb.y + bb.height * fy); };
    const playG10 = async (why) => {
      await wait(700); await shot('g10-open', true);
      const game = await E(() => { const g = document.querySelector('.g10'); return g ? (g.dataset.game || '') : ''; });
      const q0 = (log.quarry || [])[log.quarry.length - 1];
      const intro = await E(() => { const c = document.querySelector('.g10-cy-intro, .g10-howto'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').trim().slice(0, 260) : null; });
      if (intro) { note(`g10 intro (${game}): "${intro}"`); if (q0) q0.intro = intro; }
      // the cycle's intro: "התחל" (the hub's how-to: "לבד")
      const go = await E(() => { const b = [...document.querySelectorAll('.g10 button')].find((x) => x.offsetParent && (x.dataset.v === 'go' || x.dataset.v === 'solo' || /^(התחל|לבד)/.test(x.textContent.trim()))); if (b) b.dataset.qa = 'go'; return b ? b.textContent.trim() : null; });
      if (go) { await tapEl('.g10 button[data-qa="go"]', `the game (${game || why}): ${go}`); await wait(900); }
      const t0 = Date.now(); let taps = 0, shotPlay = false, shots = 0, levels = 0; const slog = [];
      const wantLv = +(A.slingLevels || 1);
      while (Date.now() - t0 < +(A.g10ms || 150000) && left() > 25000) {
        const s = await E(() => {
          const g = document.querySelector('.g10'); if (!g) return { gone: true };
          const r = document.querySelector('.g10-result'); if (r && r.offsetParent) return { res: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 300), btns: [...r.querySelectorAll('button[data-v]')].map((x) => x.dataset.v) };
          const sl = document.querySelector('.g10-sling'); if (sl && sl.__g10) return { sling: sl.__g10.state() };
          const h = document.querySelector('.g10-half.g10-b'); const st = h && h.__g10 ? h.__g10.state() : null;
          return { stk: !!document.querySelector('.g10-half.g10-b .g10-stk'), st };
        });
        if (s.gone) break;
        if (s.res) {
          await wait(700); await shot(`g10-result-${game || 'x'}`, true);
          note(`g10 result (${game}): "${s.res}" · buttons ${s.btns.join(',')}`);
          if (q0) (q0.results = q0.results || []).push(s.res.slice(0, 200));
          levels++;
          const next = game === 'sling' && levels < wantLv && (s.btns.includes('next') || s.btns.includes('again')) ? (s.btns.includes('next') ? 'next' : 'again') : 'close';
          await tapEl(`.g10-result button[data-v="${next}"]`, `the result: ${next}`); await wait(1200);
          if (next === 'close') break; else continue;
        }
        if (s.sling) {   // הקלע של דוד: a real touch drag from the pouch, back and down, released — aimed as a child aims by the dotted arc
          const S0 = s.sling;
          if (S0.over || !S0.ready || S0.flying) { await wait(250); continue; }
          const i = S0.aims.findIndex((x) => x); if (i < 0) { await wait(300); continue; }
          const k = shots % 5, lob = shots % 4 === 3;
          const d = await E(([i, lob]) => document.querySelector('.g10-sling').__g10.aimAt(i, lob), [i, lob]);
          if (!d) { await wait(300); continue; }
          const err = [0.93, 1.06, 0.97, 1.03, 1.0][k];   // (a child's hand: a little short, a little long)
          const to = { x: d.from.x + (d.to.x - d.from.x) * err, y: d.from.y + (d.to.y - d.from.y) * err };
          const cdp = await ctx.newCDPSession(pg);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.from.x, y: d.from.y }] });
          for (let q = 1; q <= 14; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: d.from.x + (to.x - d.from.x) * q / 14, y: d.from.y + (to.y - d.from.y) * q / 14 }] }); await wait(25); }
          if (shots === 0 || (shots === 5 && !shotPlay)) { await wait(200); await shot(`g10-sling-aim-L${S0.level}`, true); }
          await wait(150);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {});
          shots++; taps++;
          await wait(900);
          if (shots === 1) await shot(`g10-sling-flight-L${S0.level}`, true);
          await pg.waitForFunction(() => { const b = document.querySelector('.g10-sling'); const x = b && b.__g10 && b.__g10.state(); return !x || x.over || (!x.flying && x.ready) || document.querySelector('.g10-result'); }, null, { polling: 200, timeout: 9000 }).catch(() => {});
          const S1 = await E(() => { const b = document.querySelector('.g10-sling'); return b && b.__g10 ? b.__g10.state() : null; });
          const row = { lv: S0.level, name: S0.name, shot: S0.used + 1, target: i, lob, pull: [Math.round(to.x - d.from.x), Math.round(to.y - d.from.y)], down: S1 ? S1.down : null, of: S1 ? S1.targets : null, left: S1 ? S1.stones : null, over: S1 ? S1.over : null, won: S1 ? S1.won : null };
          slog.push(row); note(`sling L${row.lv} "${row.name}" shot ${row.shot}: pull ${row.pull} → down ${row.down}/${row.of}, stones left ${row.left}${row.over ? (row.won ? ' · WON' : ' · over') : ''}`);
          if (!shotPlay && S1 && S1.down > 0) { shotPlay = true; await shot(`g10-sling-down-L${S0.level}`, true); }
          continue;
        }
        if (s.stk && s.st) {   // נדבך על נדבך: the stone set when it is over the course; a miss after 8 ends the wall
          const S0 = s.st; if (S0.over || !S0.cur) { await wait(150); continue; }
          const miss = S0.n >= 8;
          const ok = await pg.waitForFunction((miss) => { const h = document.querySelector('.g10-half.g10-b'); const s = h && h.__g10 && h.__g10.state(); if (!s || !s.cur) return true; const d = s.cur.x - s.top.x; return miss ? (d > s.top.w + 0.03 || d < -s.cur.w - 0.03) : Math.abs(d) < 0.02; }, miss, { polling: 'raf', timeout: 9000 }).then(() => true, () => false);
          if (!ok) continue;
          await tapBox(await pg.locator('.g10-half.g10-b .g10-stk').boundingBox(), 0.5, 0.35); taps++;
          if (!shotPlay && taps === 4) { await wait(250); await shot('g10-stack-playing', true); shotPlay = true; }
          await wait(80); continue;
        }
        // an unknown game: its biggest visible button or its canvas centre, once a second (logged)
        const tgt = await E(() => { const c = document.querySelector('.g10 canvas'); const b = [...document.querySelectorAll('.g10 button, .g10 [role=button]')].filter((x) => x.offsetParent && !/g10-x/.test(x.className)); const x = b.sort((p, q) => q.getBoundingClientRect().width * q.getBoundingClientRect().height - p.getBoundingClientRect().width * p.getBoundingClientRect().height)[0] || c; if (!x) return null; const r = x.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: (x.innerText || x.tagName).slice(0, 20) }; });
        if (tgt) { await tap(tgt.x, tgt.y, taps < 3 ? `the game: "${tgt.t}"` : ''); taps++; if (!shotPlay && taps === 4) { await shot('g10-playing', true); shotPlay = true; } }
        await wait(1000);
      }
      note(`g10 done (${game}): ${taps} taps, ${Math.round((Date.now() - t0) / 1000)} s, ${levels} result card(s)`);
      if (q0) Object.assign(q0, { game, taps, playS: Math.round((Date.now() - t0) / 1000), sling: slog.length ? slog : undefined });
      log.sling = (log.sling || []).concat(slog);
      await wait(900);
      if (await E(() => { const g = document.querySelector('.g10'); return !!(g && g.getBoundingClientRect().height > 50); })) {   // still open: its own "חזרה"
        const c2 = await E(() => { const b = [...document.querySelectorAll('.g10 button')].find((x) => x.offsetParent && (x.dataset.v === 'close' || x.dataset.v === 'back' || /חזרה|לצאת|כן/.test(x.textContent)) && !/להמשיך/.test(x.textContent)); if (b) b.dataset.qa = 'back2'; return !!b; });
        if (c2) await tapEl('.g10 button[data-qa="back2"]', 'the game: חזרה לבנייה'); await wait(1000);
      }
    };
    // ───────── (PRODUCER13a) the demo by touch, the kohen's track, the idle windows, the machines' census ─────────
    const tapVis = async (sel, why) => { const ok = await E((sel) => { const b = [...document.querySelectorAll(sel)].find((x) => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4 && x.offsetParent !== null && getComputedStyle(x).visibility !== 'hidden'; }); if (b) b.dataset.qa = 'vis'; return !!b; }, sel); if (!ok) return false; const r = await tapEl(`${sel}[data-qa="vis"]`, why); await E(() => { for (const x of document.querySelectorAll('[data-qa="vis"]')) delete x.dataset.qa; }); return r; };
    const enterDemoByMenu = async () => {
      for (let q = 0; q < 10 && !(await E(() => !!(__T.game && __T.game.state && __T.game.state.demo)).catch(() => false)); q++) {
        if (await pg.$('.gm-modal.on .gm-input')) { await tapEl('.gm-modal.on .gm-input', 'name field'); await pg.keyboard.type(NAME); await wait(300); await tapEl('.gm-modal.on .gm-btn-gold', 'name: next'); await wait(1200); continue; }
        if (await E(() => !!document.querySelector('.gm-modal.on'))) { await tapModal(); await wait(900); continue; }
        if (!(await E(() => !!document.querySelector('.gm-sheet.on .gm-sw[data-a="demo"]')))) { if (!(await tapVis('[data-a="sheet"][data-k="menu"]', 'the menu'))) await wait(1500); await wait(1200); continue; }
        await shot('menu-open', true);
        // (PRODUCER14: the sheet rises — a tap measured mid-rise landed on another row of the menu and left Phase A (b2, __T.game null);
        //  the finger waits until the switch has stopped moving)
        for (let q2 = 0, prev = null; q2 < 20; q2++) { const r = await E(() => { const b = document.querySelector('.gm-sheet.on .gm-sw[data-a="demo"]'); if (!b) return null; const a = b.getBoundingClientRect(); return Math.round(a.top) + ',' + Math.round(a.left); }); if (r && r === prev) break; prev = r; await wait(250); }
        await tapEl('.gm-sheet.on .gm-sw[data-a="demo"]', 'the menu: מצב הדגמה'); await wait(2500);
      }
      if (await E(() => !!document.querySelector('.gm-sheet.on'))) await tapVis('.gm-sheet.on .gm-x', 'the sheet: ×');
      await wait(1500); await shot('demo-on', true);
      await pg.waitForFunction(() => window.__T && __T.game && __T.game.state, null, { polling: 250, timeout: 30000 }).catch(() => {});   // (PRODUCER13: the demo's switch re-makes the game; m4 died reading it mid-switch)
      note(`DEMO by the menu: ${JSON.stringify(await E(() => { const g = __T.game && __T.game.state; return { demo: !!(g && g.demo), ftue: g && g.ftue, strip: [...document.querySelectorAll('.gm-demo button')].map((x) => x.textContent.trim()) }; }))}`);
    };
    const closeOpen = async () => {   // whatever the last stage left open, closed by its own buttons (as doJump does)
      if (await E(() => !!document.querySelector('.gm-deal.on'))) { await tapVis('.gm-deal.on .gm-x', 'the deal: ✕ (before the pick)'); await wait(700); }   // (PRODUCER14)
      for (let q = 0; q < 6; q++) {
        if (await E(() => [...document.querySelectorAll('.gm-modal.on h2')].some((h) => /בחר שלב/.test(h.textContent)))) return;   // (PRODUCER13: the picker itself is left open — its gold button would skip a stage)
        const open = await E(() => { const cx = document.getElementById('card'); return { mg: !!document.querySelector('.fx-mg'), mo: !!document.querySelector('.gm-mo.on'), md: !!document.querySelector('.gm-modal.on'), g10:!!document.querySelector('.g10'), m3: !!document.querySelector('.m3 .m3-hit, .m3 .m3-exit'), sh: !!document.querySelector('.gm-sheet.on'), info: !!(cx && cx.classList.contains('on')) }; });
        if (open.info) await tapEl('#cx', 'close the place card');
        if (!open.mg && !open.mo && !open.md && !open.g10 && !open.m3 && !open.sh) return;
        if (open.mg && !((await tapEl('.fx-mg .fx-skip:not([hidden])', 'close before the pick')) || (await tapEl('.fx-mg .fx-go', 'close before the pick')))) await wait(500);
        if (open.mo) await tapEl('.gm-mo.on .gm-mo-skip:not([hidden])', 'close before the pick') || await tapEl('.gm-mo.on .gm-mo-go', 'close before the pick');
        if (open.md) await tapModal();
        if (open.g10) await tapEl('.g10 .g10-x', 'close before the pick');
        if (open.m3) { await tapEl('.m3 .m3-exit', 'the board: exit'); await wait(700); const qb = await E(() => { const b = [...document.querySelectorAll('.m3 button')].find((x) => x.offsetParent && /לצאת/.test(x.textContent) && !/להמשיך/.test(x.textContent)); if (b) b.dataset.qa = 'quit'; return !!b; }); if (qb) await tapEl('.m3 button[data-qa="quit"]', 'confirm: לצאת'); }
        if (open.sh) await tapVis('.gm-sheet.on .gm-x', 'the sheet: ×');
        await wait(1200);
      }
    };
    const pickByTouch = async (id) => {
      const idx = STG.findIndex((s) => s.id === id); if (idx < 0) { note(`no stage ${id}`); return false; }
      for (let q = 0; q < 6; q++) {
        await closeOpen();
        if (!(await E(() => [...document.querySelectorAll('.gm-modal.on h2')].some((h) => /בחר שלב/.test(h.textContent))))) {
          if (!(await tapVis('.gm-demo [data-a="pickStage"]', 'the strip: שלבים ▾'))) { note('the strip\'s "שלבים ▾" is not on screen'); await shot('no-strip', true); await wait(1500); continue; }
          await wait(1300);
          if (q === 0) await shot(`picker-${id}`, true);
        }
        const b = await E(({ idx, n }) => { const bs = [...document.querySelectorAll('.gm-modal.on button')]; const nx = bs.find((x) => /^⏭/.test(x.textContent.trim()) && x.textContent.includes(n)); const it = nx || bs.find((x) => x.textContent.trim().startsWith(`${idx + 1}. `)); if (!it) return null; it.dataset.qa = 'pick'; const r0 = it.getBoundingClientRect(); return { t: it.textContent.trim(), next: it === nx, all: bs.length, top: Math.round(r0.top), bottom: Math.round(r0.bottom) }; }, { idx, n: STG[idx].n });
        if (!b) { note('the picker has no row for ' + id); await wait(800); continue; }
        // (PRODUCER13) a row below the fold: the owner's finger scrolls the list (a real swipe up on the card), waits for it to settle,
        // then taps — no scrollIntoView (PRODUCER13a's row-9 misses and b2's row-10 misses were taps after a programmatic scroll)
        for (let sw = 0; sw < 5; sw++) {
          const r = await E(() => { const it = document.querySelector('.gm-modal.on button[data-qa="pick"]'); const c = it && it.closest('.gm-card'); if (!it) return null; const a = it.getBoundingClientRect(), cr = c ? c.getBoundingClientRect() : { top: 0, bottom: innerHeight }; return { top: a.top, bottom: a.bottom, ctop: cr.top, cbot: Math.min(cr.bottom, innerHeight) }; });
          if (!r || (r.top >= r.ctop + 8 && r.bottom <= r.cbot - 8 && r.bottom < H - 100)) break;
          const up = r.bottom > r.cbot - 8 || r.bottom >= H - 100, y0 = up ? Math.min(r.cbot - 60, 640) : r.ctop + 120, y1 = up ? y0 - 300 : y0 + 300;
          const cdp = await ctx.newCDPSession(pg);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y: y0 }] });
          for (let q = 1; q <= 12; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 300, y: y0 + ((y1 - y0) * q) / 12 }] }); await wait(25); }
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {});
          note(`the picker: a finger swipe ${up ? 'up' : 'down'} (${Math.round(y0)} → ${Math.round(y1)}) to bring "${b.t}" into view`); await wait(1300);
        }
        const hit = await E(() => { const it = document.querySelector('.gm-modal.on button[data-qa="pick"]'); if (!it) return null; const a = it.getBoundingClientRect(), x = a.left + a.width / 2, y = a.top + a.height / 2, e = document.elementFromPoint(x, y); return { x: Math.round(x), y: Math.round(y), mine: !!(e && (e === it || it.contains(e))), at: e ? `${e.tagName}.${String(e.className).slice(0, 30)} "${(e.textContent || '').trim().slice(0, 30)}"` : null }; });
        if (hit && !hit.mine) note(`PICKER: the row "${b.t}" at ${hit.x},${hit.y} is covered by ${hit.at}`);
        await tapEl('.gm-modal.on button[data-qa="pick"]', `the picker: "${b.t}"${b.next ? ' (the gold next)' : ''} · ${b.all} buttons · row at y ${hit ? hit.y : '?'}`);
        await wait(2600);
        const f = await E(() => __T.game && __T.game.state && __T.game.state.focus).catch(() => null);
        if (f === id) { note(`PICKED ${id} by touch`); return true; }
        note(`the pick did not land (focus ${f}); again`); log.pickMiss = (log.pickMiss || []).concat({ t: sec(), id, row: b.t, hit, focus: f });
        await shot(`pick-miss-${id}`, true);   // (the picker, if still open, stays open: the next try picks the row again — closeOpen leaves it alone)
      }
      return false;
    };
    const census = (id) => E((id) => {
      const T = __T, c = T.camera; c.updateMatrixWorld(); const V = T.Vector3 || T.stages.hero.position.constructor;
      const on = (x, y, z) => { const v = new V(x, y, z).project(c); return v.z < 1 && Math.abs(v.x) < 0.98 && v.y > -0.72 && v.y < 0.76; };   // (the HUD's rows cut)
      const out = { id, cam: c.position.toArray().map(Math.round) };
      try { const ci = T.stages.crane && T.stages.crane(); out.crane = ci ? { site: ci.site, posed: !!ci.posed, onScreen: on(ci.bx, ci.y - 6, ci.bz) || on(ci.x, ci.y, ci.z) } : null; } catch (e) { out.crane = 'err ' + e.message; }
      try { const s = T.crews.stats; out.cartsInView = s.carts; out.trains = Object.keys(s.trains).length; out.site = s.sites[id] || null; out.quarryCrews = s.quarry; out.people = s.people; } catch (e) { out.crewsErr = e.message; }
      try { const roles = {}; let n = 0, all = 0; for (const w of T.crews._people || []) { if (w.gone || !w.a || w.a.vis < 0.5) continue; all++; if (!on(w.a.x, (w.a.y || 0) + 1.5, w.a.z)) continue; n++; roles[w.role] = (roles[w.role] || 0) + 1; } out.workersOnScreen = n; out.workersAll = all; out.roles = roles; } catch (e) { out.peopleErr = e.message; }
      try { const sc = T.stages.scaffold && T.stages.scaffold(id); out.scaffold = sc ? { runs: sc.runs.length, shown: +(+sc.shown || 0).toFixed(2), status: sc.status } : null; } catch (e) { out.scaffold = 'err'; }
      try { const D = T.stages._dbg, WW = D && Array.isArray(D.W) ? D.W : null, nw = D ? D.nWork : 0; if (WW) { const r2 = {}; let k = 0; for (let i = 0; i < nw && i < WW.length; i++) { const w = WW[i]; if (!w || !w.st) continue; if (!on(w.x, (w.y || 0) + 1.5, w.z)) continue; k++; r2[w.role] = (r2[w.role] || 0) + 1; } out.siteWorkers = nw; out.siteWorkersOnScreen = k; out.siteRoles = r2; } } catch (e) { out.siteWorkersErr = e.message; }
      try { const kc = T.crews.keyCartState, mc = T.crews.mountCart; out.keyCart = kc && kc.on ? kc.leg : null; out.mountCart = mc && mc.on ? mc.leg : null; } catch (e) { /* optional */ }
      // (PRODUCER13) carts ON SCREEN: every train's carts (SITE13's site train among them), projected at the ground (the old
      // `cartsInView` is the instanced mesh's count — carts that exist, anywhere)
      try { const g = (x, z) => { try { return T.stages.groundAt ? T.stages.groundAt(x, z) : 0; } catch (e) { return 0; } }; let k = 0, all = 0; const TR = T.crews._trains || {}; for (const rid in TR) for (const c of TR[rid].carts || []) { if (!(c.vis > 0.5)) continue; all++; if (on(c.x, g(c.x, c.z) + 1.2, c.z)) k++; } out.cartsOnScreen = k; out.cartsAll = all; out.siteTrain = T.crews.stats.trains.site || null; } catch (e) { out.cartErr = e.message; }
      // (PRODUCER13, SITE13's machines: stages.machines() → { id: { crane, base, shear, sled } }) the crews' machines on screen
      try {
        const M = T.stages.machines ? T.stages.machines() : null, m = M && M[id], at = (p) => (Array.isArray(p) ? on(p[0], p[1], p[2]) : p && typeof p.x === 'number' ? on(p.x, p.y || 0, p.z) : false);
        if (M) { out.mk = m ? { crane: at(m.hook) || at(m.crane) || at(m.base), hook: at(m.hook), shear: at(m.shear), sled: at(m.sled) } : null; out.mkSites = Object.keys(M); }   // (SITE13 20:07: the hook counts — its load comes down at the ×1 frame's edge)
        out.machines = (out.crane && out.crane.onScreen ? 1 : 0) + (out.mk ? (out.mk.crane ? 1 : 0) + (out.mk.shear ? 1 : 0) + (out.mk.sled ? 1 : 0) : 0);
      } catch (e) { out.mkErr = e.message; }
      return out;
    }, id);
    const wideCensus = async (id, tagw) => {   // (declared camera hook: the working frame's own ray, 3× farther; the camera put back after)
      const sv = await E(() => ({ p: __T.camera.position.toArray(), t: __T.controls.target.toArray() }));
      const near = await census(id);
      const k = +(A.wideK || 3), wp = { p: sv.t.map((t, i) => t + (sv.p[i] - t) * k), t: sv.t };
      await E((v) => { __T.look(v.p, v.t); }, wp); await wait(400);
      await E(() => { __T.simulate(false); __T.render(); __T.crews && __T.crews.update && 0; __T.simulate(true); }); await wait(700);
      const wide = await census(id); const f = await shot(`${id}-wide-${tagw}`, true, true);
      await E((v) => { __T.look(v.p, v.t); }, sv);
      const rec = { id, at: tagw, t: sec(), near, wide, f: f && path.relative(ROOT, f) };
      log.census = (log.census || []).concat(rec);
      note(`CENSUS ${id} ${tagw}: near ${JSON.stringify(near)} · wide(×${k}) ${JSON.stringify(wide)}`);
      return rec;
    };
    const pullTrack = () => E(() => ({ rows: (window.__TRK || []).slice(), now: Math.round(performance.now()), ev: (window.__GAME_LOG || []).filter((e) => /^(heroReturn|heroAim|heroPlace|workFrame|courseBeat|markAim|stoneSet|course|check|checkStand|minigameStart|minigame|cycle|demoJump|phase|keyStone|keyAsk|loadLand|step|mark)$/.test(e.type)).map((e) => ({ t: Math.round(e.t), type: e.type, d: e.type === 'stoneSet' ? { by: e.d.by, set: e.d.set, course: e.d.course } : e.type === 'workFrame' ? { id: e.d.id, px: e.d.px, close: e.d.close } : e.type === 'mark' ? { d: typeof e.d === 'object' ? JSON.stringify(e.d).slice(0, 60) : e.d } : e.d })) }));
    const trackStats = (rows, ev, t0, t1) => {
      const R = rows.filter((r) => r[0] >= t0 && r[0] <= t1), E2 = ev.filter((e) => e.t >= t0 && e.t <= t1);
      let walk = 0, moving = 0, cam = 0, tgt = 0, sxW = 0, sxC = 0, place = 0, yaw = 0; const walks = []; let cur = null;
      for (let i = 1; i < R.length; i++) {
        const a = R[i - 1], b = R[i], d = Math.hypot(b[1] - a[1], b[3] - a[3]);
        if (d > 25) { place++; if (cur) { walks.push(cur); cur = null; } continue; }
        cam += Math.hypot(b[8] - a[8], b[9] - a[9], b[10] - a[10]); tgt += Math.hypot(b[11] - a[11], b[12] - a[12], b[13] - a[13]); yaw += Math.abs(b[20] - a[20]) > 3.14 ? 0 : Math.abs(b[20] - a[20]);
        const dsx = Math.abs(b[4] - a[4]);
        if (d > 0.12) { moving++; walk += d; sxW += dsx; if (!cur) cur = { t: a[0], from: [a[1], a[3]], len: 0 }; cur.len += d; cur.to = [b[1], b[3]]; cur.t1 = b[0]; }
        else { sxC += dsx; if (cur) { walks.push(cur); cur = null; } }
      }
      if (cur) walks.push(cur);
      let rev = 0; for (let k = 1; k < walks.length; k++) { const u = [walks[k - 1].to[0] - walks[k - 1].from[0], walks[k - 1].to[1] - walks[k - 1].from[1]], v = [walks[k].to[0] - walks[k].from[0], walks[k].to[1] - walks[k].from[1]], nu = Math.hypot(...u), nv = Math.hypot(...v); if (nu > 1 && nv > 1 && (u[0] * v[0] + u[1] * v[1]) / (nu * nv) < -0.5) rev++; }
      const cnt = (t) => E2.filter((e) => e.type === t).length;
      const px = R.filter((r) => r[7]).map((r) => r[6]);
      return {
        secs: R.length > 1 ? Math.round((R[R.length - 1][0] - R[0][0]) / 1000) : 0, walked: +walk.toFixed(1), movingPct: R.length ? Math.round((100 * moving) / R.length) : 0,
        walks: walks.length, walkLens: walks.map((w) => +w.len.toFixed(1)).slice(0, 30), walkNet: walks.map((w) => [Math.round(w.to[0] - w.from[0]), Math.round(w.to[1] - w.from[1])]).slice(0, 30), reversals: rev, placements: place,
        camMoved: Math.round(cam), targetMoved: Math.round(tgt), yawTurned: +yaw.toFixed(1), headDxWalk: Math.round(sxW), headDxCamera: Math.round(sxC), px: px.length ? [Math.min(...px), Math.round(px.reduce((p, q) => p + q, 0) / px.length), Math.max(...px)] : null,
        stock: R.length ? [Math.min(...R.map((r) => r[18])), Math.max(...R.map((r) => r[18]))] : null, set: R.length ? [R[0][17], R[R.length - 1][17]] : null,
        ev: { heroReturn: cnt('heroReturn'), heroAim: cnt('heroAim'), heroPlace: cnt('heroPlace'), workFrame: cnt('workFrame'), courseBeat: cnt('courseBeat'), markAim: cnt('markAim'), course: cnt('course'), crewStones: E2.filter((e) => e.type === 'stoneSet' && e.d.by !== 'hero').length, heroStones: E2.filter((e) => e.type === 'stoneSet' && e.d.by === 'hero').length, games: E2.filter((e) => e.type === 'minigameStart').map((e) => e.d.kind + (e.d.level != null ? '@' + e.d.level : '')), cycle: E2.filter((e) => e.type === 'cycle').map((e) => e.d.game), checkStand: cnt('checkStand') },
        returns: E2.filter((e) => e.type === 'heroReturn').map((e) => ({ s: Math.round((e.t - t0) / 100) / 10, amot: Math.round(Math.hypot(e.d.to[0] - e.d.from[0], e.d.to[1] - e.d.from[1])), from: e.d.from, to: e.d.to })).slice(0, 25),
      };
    };
    let stageT0 = 0, idleLast = 0, idleN = 0, evSeen = 0, lastCourseIdle = -1, gameIdle = 0; const handOnStrip = new Set();
    const idleDue = async (s) => {
      if (!IDLE_S || !DEMOPICK || s.ftue < 99 || idleN >= +(A.idleMax || 3)) return null;
      const nowP = await E(() => ({ n: (window.__GAME_LOG || []).length, t: performance.now() }));
      const ev = await E((k) => (window.__GAME_LOG || []).slice(k).map((e) => ({ type: e.type, d: e.type === 'course' ? e.d.c : e.type === 'minigame' ? e.d.kind : null })), evSeen); evSeen = nowP.n;
      const course = ev.filter((e) => e.type === 'course').pop(); const game = ev.some((e) => e.type === 'minigame' || e.type === 'cycle');
      if (course && course.d !== lastCourseIdle) { lastCourseIdle = course.d; return `after-course${course.d}`; }
      if (game && gameIdle < 2) { gameIdle++; return 'after-game'; }
      if (s.p === 'courses' && s.paid != null && s.paid - s.set <= 0 && s.set > 0) return 'no-stones';
      if (Date.now() - idleLast > IDLE_EVERY * 1000 && Date.now() - stageT0 > 25000) return 'idle-every';
      return null;
    };
    const idleWindow = async (s, why) => {
      idleN++; idleLast = Date.now();
      const t0 = await E((m) => { window.__TRK_MARK = m; return Math.round(performance.now()); }, 'idle:' + why);
      note(`IDLE ${IDLE_S} s (${why}) at ${s.id}:${s.p}/${s.set} — no touch`);
      await shot(`${s.id}-idle${idleN}-${why}-a`, true, true); { const tEnd = Date.now() + IDLE_S * 1000; while (Date.now() < tEnd) { await courseWatch(); await wait(400); } }   // (PRODUCER13: the course ends and beats inside the window are seen too — no touch)
      await shot(`${s.id}-idle${idleN}-${why}-c`, true, true);
      const T = await pullTrack(); await E(() => { window.__TRK_MARK = ''; });
      const st2 = trackStats(T.rows, T.ev, t0, T.now);
      log.idle = (log.idle || []).concat({ id: s.id, why, p: s.p, set: s.set, t: sec(), ...st2 });
      note(`IDLE-STATS ${s.id} ${why}: ${JSON.stringify(st2)}`);
    };
    const stageReport = async (id, pT0) => {
      let T = null, st2 = null; try { T = await pullTrack(); st2 = trackStats(T.rows, T.ev, pT0, T.now); } catch (e) { note(`STAGE-STATS ${id}: ${e.message}`); return; }   // (PRODUCER14: b2 lost its end here)
      log.stage = (log.stage || []).concat({ id, t: sec(), ...st2 });
      note(`STAGE-STATS ${id}: ${JSON.stringify(st2)}`);
      if (A.dumpTrack) { const f = path.join(OUT, `${TAG}-track-${id}.json`); fs.writeFileSync(f, JSON.stringify({ rows: T.rows.filter((r) => r[0] >= pT0), ev: T.ev.filter((e) => e.t >= pT0) })); }
    };
    const doJump = async (J, reload) => {   // (the seed's jump, declared: the state is written ONCE here, then everything is by touch)
      STAGE0 = J.stage || STAGE0;
      // (between stages) whatever the last stage left open is closed first, by its own buttons: a precision game (דלג), a key
      // moment (דלג), a card, an in-between game — so nothing of the previous stage plays into the next one
      if (await E(() => !!document.querySelector('.gm-deal.on'))) { await tapVis('.gm-deal.on .gm-x', 'the deal: ✕ (before the jump)'); await wait(700); }   // (PRODUCER14: pd1 — a deal left open across the jump kept the old site's cards)
      for (let q = 0; q < 6; q++) {
        await wait(1200);
        const open = await E(() => { const cx = document.getElementById('card'); return { mg: !!document.querySelector('.fx-mg'), mo: !!document.querySelector('.gm-mo.on'), md: !!document.querySelector('.gm-modal.on'), g10: !!document.querySelector('.g10'), info: !!(cx && cx.classList.contains('on')) }; });   // (the place card is shown by its class 'on'; hidden, its × still has a layout box) });
        if (open.info) await tapEl('#cx', 'close the place card before the jump');
        if (!open.mg && !open.mo && !open.md && !open.g10) break;
        if (open.mg && !((await tapEl('.fx-mg .fx-skip:not([hidden])', 'close before the jump')) || (await tapEl('.fx-mg .fx-go', 'close before the jump')))) await E(() => { const w = document.querySelector('.fx-mg .fx-skip, .fx-mg button'); if (w) w.click(); });
        if (open.mo) await tapEl('.gm-mo.on .gm-mo-skip:not([hidden])', 'close before the jump') || await tapEl('.gm-mo.on .gm-mo-go', 'close before the jump');
        if (open.md) await tapModal();
        if (open.g10) await tapEl('.g10 .g10-x', 'close before the jump');
      }
      if (J.stage && !STG.some((s) => s.id === J.stage)) throw new Error(`jump: no stage "${J.stage}" (content.js has ${STG.map((s) => s.id).join(' ')})`);
      const wrote = await E(({ J, STG, UNL }) => {
        const g = __T.game.state; if (g.ftue < 99) g.ftue = J.ftue || 99;
        if (J.har) Object.assign(g.st.har || (g.st.har = {}), J.har);   // (the old form)
        if (J.stone) g.res.stone = Math.max(g.res.stone || 0, J.stone);
        if (J.m3) { g.m3 = g.m3 && typeof g.m3 === 'object' ? g.m3 : {}; g.m3.level = Object.assign(g.m3.level || {}, J.m3); g.stats = g.stats || {}; g.stats.levels = Math.max(g.stats.levels || 0, (J.m3.quarry || 1) - 1); if (g.games && J.cycle !== 'keep') delete g.games.cycle; }   // (PRODUCER12: a v21 player who already played boards)
        if (!J.stage) return 'har fields';
        const i = STG.findIndex((s) => s.id === J.stage), me = STG[i], before = STG.slice(0, i).map((s) => s.id);
        for (const id of before) g.st[id] = { done: true };
        for (const s of STG.slice(i + 1)) delete g.st[s.id];
        g.bh = g.bh.map(() => 0); g.harAcc = 1;   // (the rocks are cleared once the Mount lays courses: a site at a fraction; and every later stage)
        // what a player has by then (state.js migrateV4's list): crews, training, finds, priests, the book, the chapters
        const CREWS = { har: 2, wall: 3, karnot: 4 }; let crews = Math.max(1, g.crews.length);
        for (const id of before) { if (CREWS[id]) crews = Math.max(crews, CREWS[id]); for (const m of UNL[id] || []) g.book.un[m] = 1; }
        while (g.crews.length < crews) g.crews.push({ at: null });
        if (before.includes('yesod')) g.trainOn = true;
        if (before.includes('har')) g.finds.trumpet = 1;
        if (before.includes('sorag')) g.finds.warning = 1;
        if (me.ch === 4 || before.includes('karnot') || before.includes('kiyor')) g.priests = Math.max(g.priests || 0, 10);
        for (const ch of [1, 2, 3, 4]) if (STG.filter((s) => s.ch === ch).every((s) => before.includes(s.id))) g.chDone[ch] = true;
        const R = J.res || { stone: 600, wstone: 600, cedar: 400, bronze: 400, gold: 300, silver: 200 };
        for (const [k, v] of Object.entries(R)) g.res[k] = Math.max(g.res[k] || 0, v);
        if (J.resSet) for (const [k, v] of Object.entries(J.resSet)) g.res[k] = v;   // (PRODUCER12: the meter exactly — e.g. no stone, so the pill offers the quarry)
        if (J.frac != null) {   // the site at a fraction (a v5-shaped entry: the game converts it on its first read, as for an old save)
          g.st[me.id] = { w: Math.max(0, Math.min(1, +J.frac)) * me.W, ph: 1 };
          g.focus = me.id;
          for (const c of g.crews) c.at = me.id;
          if (g.crews.length > 1 && me.id !== 'har') g.crews[0].at = 'quarry';
        } else { delete g.st[me.id]; g.focus = null; for (const c of g.crews) c.at = 'quarry'; }
        __T.game._.resync(); __T.game.save();
        try { if (__T.game.ui && typeof __T.game.ui.coach === 'function') __T.game.ui.coach(null, ''); } catch (e) { /* (a brand-new game's first coach line is not the jumped player's) */ }
        return `${me.id} (${me.n}) ${J.frac != null ? 'at ' + J.frac : 'at its start'} · done before: ${before.join(',') || '—'} · crews ${g.crews.length} · priests ${g.priests} · res ${JSON.stringify(g.res)}`;
      }, { J, STG, UNL });
      note(`JUMP (state written once): ${JSON.stringify(J)} → ${wrote}`);
      log.jumps = (log.jumps || []).concat({ t: sec(), J, wrote });
      if (reload) {   // the saved state opens as the owner reopens his game (a reload), then only touch
        await pg.reload(); await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
        note('reloaded: the jumped save opens as a returning player\'s');
        const tr = Date.now(); for (const at of [1500, 5000]) { await wait(Math.max(0, at - (Date.now() - tr))); await shot(`reopen-${at / 1000}s`, true); }
      } else { await wait(2500); if (A.jumpShot !== '0') await shot(`jump-${J.stage || 'har'}`, true); }
    };
    if (JUMP) await doJump(JUMP, A.jumpReload !== '0');
    const s0 = await st();
    note(`state ${JSON.stringify(s0)}`);
    if (A.fresh && !DEMO && !JUMP && !A.stages && !DEMOPICK) {   // the opening: it ends by itself (a tap may hurry it) (PRODUCER12: not after a jump — __NO_OPENING)
      await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { polling: 200, timeout: 20000 }).catch(() => {});
      await wait(1500); await shot('opening', true);
      await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, { polling: 200, timeout: 25000 }).catch(() => {});
      await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 200, timeout: 20000 }).catch(() => {});
      await wait(1600);
    }
    let courseAt = null; let checkShot = false, checkSeq = 0, lastReel = 0, reelN = 0, heroDead = 0, lastKey = '', lastPill = '', dead = 0, idleOff = 0, lastSet = -1, lastWatch = 0, lastHeroCheck = 0;
    const seenModal = new Set(), moSeen = new Set(); let moT0 = 0, avT = 0, avShot = 0, avN = 0, lastAvSay = ''; const walk = []; log.walk = walk;
    const walkNote = (id) => { const ws = walk.filter((x) => !id || x.s.startsWith(id + ':')); const far = ws.slice(1).map((x, i) => Math.round(Math.hypot(x.p[0] - ws[i].p[0], x.p[1] - ws[i].p[1]))); note(`WALK${id ? ' ' + id : ''}: ${ws.length} spots · steps (amot) [${far.join(' ')}] · ${ws.map((x) => `${x.s}@${x.p.join(',')}`).slice(0, 14).join(' → ')}`); };
    // (PRODUCER13, wave 13 — N79 "every course end seen, whoever set the last stone") the game log read on every loop step: a
    // `course` event is logged with who set its last stone (`by`, when the game says) and the toast on screen; a `courseBeat` gets a
    // lite shot at once (the beat lasts ~2.6 s; a shot with the occlusion rays takes longer) — the director's frame, looked at
    let cwSeen = 0; const beatShots = new Set();
    const courseWatch = async () => {
      const r = await E((k) => { const L = window.__GAME_LOG || []; const out = L.slice(k).filter((e) => /^(course|courseBeat|courseCheck|check|minigameStart|checkStand|toast|jobReveal|jobDone)$/.test(e.type)).map((e) => ({ t: Math.round(e.t), type: e.type, d: e.d && typeof e.d === 'object' ? JSON.parse(JSON.stringify(e.d)) : e.d })); return { n: L.length, out, now: Math.round(performance.now()) }; }, cwSeen).catch(() => null);
      if (!r) return; cwSeen = r.n;
      for (const e of r.out) {
        const d = e.d || {};
        if (e.type === 'course') {   // (the toast may come a moment later — the moment waits for a clear screen: read again below)
          const w = await words();
          const rec = { t: sec(), id: d.id, c: d.c, of: d.of, by: d.by || '?', toast: /נדבך/.test(w.toast) ? w.toast : '' }; log.courses = (log.courses || []).concat(rec); pendToast.push(rec); note(`COURSE END ${rec.id} ${rec.c}/${rec.of} by ${rec.by}${d.away ? ' (away)' : ''} · toast "${rec.toast}"`);
        } else if (e.type === 'courseBeat') {
          const k = `${d.id}-${(log.courses || []).filter((c) => c.id === d.id).length}`; let lag = r.now - e.t;
          if (!beatShots.has(k) && lag < 2400) {   // (the camera flies 1.5 s to the beat's frame: the shot at ~1.8 s into the beat)
            if (lag < 1800) await wait(1800 - lag);
            lag = (await E(() => Math.round(performance.now()))) - e.t;
            beatShots.add(k); const f = await shot(`${d.id}-beat${beatShots.size}`, true, true); (log.beats = log.beats || []).push({ t: sec(), id: d.id, f: f && path.relative(ROOT, f), lag, view: d.view, el: d.el, dist: d.dist }); note(`BEAT ${d.id} ${JSON.stringify(d)} (shot ${lag} ms into it) → ${f && path.basename(f)}`);
          }
          else { (log.beats = log.beats || []).push({ t: sec(), id: d.id, late: lag }); note(`BEAT ${d.id} (seen ${lag} ms late, no shot)`); }
        } else if (e.type === 'jobReveal' || e.type === 'jobDone') {   // (PRODUCER14) what the job left in the building: a shot ~1.4 s into the reveal's flight
          if (e.type === 'jobDone') { note(`JOB DONE ${JSON.stringify(d).slice(0, 200)}`); continue; }
          let lag = r.now - e.t; if (lag < 1400) await wait(1400 - lag);
          const f = await shot(`${d.site || d.id || ''}-reveal-${d.job || d.id || 'job'}`, true, true); (log.reveals = log.reveals || []).push({ t: sec(), ...d, f: f && path.relative(ROOT, f) }); note(`JOB REVEAL ${JSON.stringify(d).slice(0, 160)} → ${f && path.basename(f)}`);
        } else if (e.type === 'minigameStart') { note(`MINIGAME START ${JSON.stringify(d).slice(0, 200)}`); (log.mgStart = log.mgStart || []).push({ t: sec(), ...d }); }
        else if (e.type === 'courseCheck' || e.type === 'check' || e.type === 'checkStand') note(`CHECK EVENT ${e.type} ${JSON.stringify(d).slice(0, 160)}`);
      }
      for (const rec of pendToast.splice(0)) if (!rec.toast) {   // (a course end's toast, read for up to 3 s)
        for (let q = 0; q < 6 && !rec.toast; q++) { await wait(500); const w = await words(); if (/נדבך/.test(w.toast)) rec.toast = w.toast; }
        note(`COURSE TOAST ${rec.id} ${rec.c}: "${rec.toast || '— none in 3 s'}"`);
      }
    };
    const pendToast = [], chipSeen = new Set();
    let ringTries = 0, dealN = 0, redealN = 0, lastJob = ''; const dealShot = new Set(), jobsPlayed = new Set(), ptrOnStrip = new Set();
    let shopBought = false, shopLast = 0, shopN = 0, shopBuys = 0;
    const shopVisit = async (s) => {
      shopN++;
      const coins0 = s.silver;
      const opened = (await tapVis('.gm-purse, [data-a="purse"], [data-a="shop"], [data-k="silver"], [aria-label*="מטבעות"]', 'the purse')) ;
      if (!opened) { note('SHOP: no purse on screen'); (log.shop = log.shop || []).push({ t: sec(), err: 'no purse' }); return; }
      for (let q = 0, prev = null; q < 16; q++) { await wait(250); const r = await E(() => { const R = [...document.querySelectorAll('.gm-sheet.on, .gm-sh.on, .gm-modal.on, .gm-shop, [data-shop]')].find((x) => /אוצר המלאכה/.test(x.innerText)); if (!R) return null; const a = R.getBoundingClientRect(); return Math.round(a.top); }); if (r != null && r === prev) break; prev = r; }
      const shop = await E(() => {
        const R = [...document.querySelectorAll('.gm-sheet.on, .gm-sh.on, .gm-modal.on, .gm-shop, [data-shop]')].find((x) => /אוצר המלאכה/.test(x.innerText)); if (!R) return null;
        const vis = (x) => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight; };
        const btns = [...R.querySelectorAll('button, [role=button]')].filter((x) => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; });   // (PRODUCER14: the whole sheet — her mark, the instruments and the lamps sit below the fold)
        const items = btns.map((b, i) => { b.dataset.qaShop = String(i); const r = b.getBoundingClientRect(); const row = b.closest('.gm-shop-card, li, .gm-shop-item, [data-item], .gm-row, .gm-item') || b.parentElement; const tt = (row ? row.innerText : b.innerText).replace(/\s+/g, ' ').trim(); const pm = (b.innerText.match(/(\d[\d,]*)/) || tt.match(/(\d[\d,]*)\s*(?:מטבעות|◎)/) || [])[1]; return { i, b: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 30), t: tt.slice(0, 90), price: pm ? +pm.replace(/,/g, '') : null, w: Math.round(r.width), h: Math.round(r.height), off: b.disabled || b.getAttribute('aria-disabled') === 'true' || /dis|off|locked/.test(b.className), item: b.dataset.k || b.dataset.item || (row && row.dataset && (row.dataset.k || row.dataset.item || row.dataset.id)) || '', buy: b.dataset.a === 'buy' }; });
        return { title: R.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), items };
      });
      if (!shop) { note('SHOP: the purse opened no "אוצר המלאכה"'); (log.shop = log.shop || []).push({ t: sec(), err: 'no shop' }); await shot(`shop-none-${shopN}`, true, true); await closeOpen(); return; }
      note(`SHOP #${shopN} (coins ${coins0}): ${shop.title.slice(0, 120)} · ${shop.items.map((x) => `[${x.item || x.b} ${x.price != null ? x.price : '?'}${x.off ? ' off' : ''} ${x.w}×${x.h}]`).join(' ')}`);
      await shot(`shop${shopN}`, true, true);
      const HER = /כלי|מכונ|גלגל|עגל|נר|מנור|שיר|נבל|כינור|חליל|חצוצר|צלצל|מצלת|לויים|האבן שלי|סימן/;
      const order = s.demo ? [/^mark$|האבן שלי/, /^lamp$|נר חרס/, /^kinnor$|כינור/] : [null, /^mark$|האבן שלי/, /^lamp$|נר חרס/];   // (the regular game: the cheapest of her five first; the demo: her mark, a lamp, a kinnor)
      const base = shop.items.filter((x) => (x.buy || x.price != null) && !x.off && x.price != null && x.price <= coins0 && (HER.test(x.t) || HER.test(x.b))).sort((a, b) => a.price - b.price);
      let can = [];   // (her order from this buy on; what is not on sale here yet — her mark outside the courses — is skipped)
      for (const want of order.slice(Math.min(shopBuys, order.length - 1)).concat([null])) { can = base.filter((x) => !want || want.test(x.item) || want.test(x.t)); if (can.length) break; }
      const rec = { t: sec(), coins: coins0, items: shop.items, small: shop.items.filter((x) => x.w < 44 || x.h < 44).map((x) => `${x.b} ${x.w}×${x.h}`) };
      if (can.length) {
        const it = can[0];
        for (let sw = 0; sw < 6; sw++) {   // a row below the fold: her finger scrolls the sheet (a real swipe up), then taps
          const r = await E((i) => { const b = document.querySelector(`[data-qa-shop="${i}"]`); if (!b) return null; const a = b.getBoundingClientRect(); return { top: a.top, bottom: a.bottom }; }, it.i);
          if (!r || (r.top > 240 && r.bottom < H - 20)) break;
          // (Chrome's own touch scroll gesture — pb2's raw touch events did not move the sheet)
          const dg = await E(() => { const B = document.querySelector('.gm-sheet.on .gm-sh-b'), S2 = document.querySelector('.gm-sheet.on'); if (!B || !S2) return null; const a = S2.getBoundingClientRect(), b = B.getBoundingClientRect(); return { sheet: [Math.round(a.top), Math.round(a.bottom)], body: [Math.round(b.top), Math.round(b.bottom)], client: B.clientHeight, scroll: B.scrollHeight, top: B.scrollTop, ov: getComputedStyle(B).overflowY }; });
          if (sw === 0) { note(`SHOP SCROLL CHECK ${JSON.stringify(dg)}`); (log.shopScroll = log.shopScroll || []).push(dg); }
          const up = r.bottom >= H - 20, cdp = await ctx.newCDPSession(pg);
          await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: up ? 640 : 380, yDistance: up ? -260 : 260, speed: 900, gestureSourceType: 'touch', repeatCount: 1 }).catch((e) => note('scroll gesture: ' + e.message));
          await cdp.detach().catch(() => {}); await wait(900);
          if (sw === 0) { const t2 = await E(() => { const B = document.querySelector('.gm-sheet.on .gm-sh-b'); return B ? B.scrollTop : null; }); note(`SHOP SCROLL after the gesture: scrollTop ${t2}`); (log.shopScroll = log.shopScroll || []).push({ after: t2 }); }
        }
        await shot(`shop${shopN}-${it.item || 'item'}`, true, true);
        await tapEl(`[data-qa-shop="${it.i}"]`, `the shop: buy "${it.t.slice(0, 40)}" for ${it.price}`); await wait(1500);
        // האבן שלי opens its draw pad (a frame game, drawMark): the loop plays it by its own hand (a swipe, then "done")
        if (await E(() => !!document.querySelector('.fx-mg'))) { rec.drew = 'the pad opened (played by its cue)'; shopBuys++; shopBought = shopBuys >= +(A.shopBuys || 1); rec.bought = { item: it.t.slice(0, 60), price: it.price, min: +((Date.now() - T0) / 60000).toFixed(1) }; note(`SHOP: BOUGHT "${it.t.slice(0, 50)}" for ${it.price} — its draw pad is open`); (log.shop = log.shop || []).push(rec); return; }
        else if (await modalText()) { await shot(`shop-confirm-${shopN}`, true, true); await tapModal(); await wait(1000); }
        const s2 = await st();
        if (!(s2.silver < coins0)) { note(`SHOP: the tap on "${it.t.slice(0, 30)}" bought nothing (coins ${coins0} → ${s2.silver})`); rec.missed = it.t.slice(0, 40); (log.shop = log.shop || []).push(rec); await closeOpen(); return; }
        rec.bought = { item: it.t.slice(0, 60), price: it.price, coinsAfter: s2.silver, min: +((Date.now() - T0) / 60000).toFixed(1) };
        shopBuys++; shopBought = shopBuys >= +(A.shopBuys || 1); note(`SHOP: BOUGHT "${it.t.slice(0, 50)}" for ${it.price} (coins ${coins0} → ${s2.silver}) at minute ${rec.bought.min} of the run`); await shot(`shop-bought-${shopN}`, true, true);
      } else note(`SHOP: nothing of her five affordable yet (coins ${coins0})`);
      (log.shop = log.shop || []).push(rec);
      await closeOpen(); await wait(600);
    };
    const ringTap = async () => {   // (PRODUCER14) the ring, as the screen teaches: wait for it to touch the gold, then tap it
      const t0 = Date.now(), RT = +(A.ringAt || 1.06); let last = null;
      while (Date.now() - t0 < 3500) {
        const r = await E(() => { const R = document.querySelector('.gm-ring'); if (!R || !R.classList.contains('live')) return null; const I = R.querySelector('i'); const m = I && (I.style.transform || '').match(/scale\(([\d.]+)\)/); const t = (R.style.transform || '').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); const wd = [...document.querySelectorAll('.gm-ring-say, .gm-ring-fb, .gm-ring .gm-now, .gm-rfb')].map((x) => x.innerText).join(' ').trim(); return { s: m ? +m[1] : null, x: t ? +t[1] : null, y: t ? +t[2] : null, wd, k: (window.__GAME_LOG || []).length }; }).catch(() => null);
        if (!r) { if (Date.now() - t0 < 1400 && !last) { await wait(40); continue; } return null; }   // (the ring starts at the impact, ~0.4 s after a tap)
        last = r;
        if (r.s != null && r.x != null && r.s <= RT) { if (await E((p) => { const e = document.elementFromPoint(p.x, p.y); return !!(e && e.closest && e.closest('.gm-demo button, .gm-sheet.on, .gm-deal.on, .gm-modal.on')); }, r)) return null;   /* (N93: never through the strip or a sheet) */ await pg.touchscreen.tap(r.x, r.y); log.steps.push({ t: sec(), x: Math.round(r.x), y: Math.round(r.y), why: `ring (timed at scale ${r.s})` }); await wait(350); const fb = await E(() => { const R = document.querySelector('.gm-ring'); const s2 = R && R.querySelector('s'); return [s2 && s2.className && /on/.test(s2.className) ? s2.textContent : '', ...[...document.querySelectorAll('.gm-float')].filter((f) => +getComputedStyle(f).opacity > 0.2).map((f) => f.textContent)].filter(Boolean).join(' | ').replace(/\s+/g, ' ').slice(0, 80); }).catch(() => ''); return { s: r.s, ms: Date.now() - t0, k: r.k, words: fb || r.wd }; }
        await wait(12);
      }
      return null;
    };
    // (PRODUCER14) --glog=1: the game's own event log (window.__GAME_LOG: strikes, strokes, stones set, courses, games, jobs, pay)
    // written every 30 s and at the end to <tag>-glog.json, with the page's clock at the run's start — the gestures' timeline
    // (produce-base14.cjs) reads it; a run cut by the 10-minute timeout keeps its last dump
    let glogAt = 0; const glogT0 = await E(() => Math.round(performance.now())).catch(() => 0);
    const dumpGlog = async (force) => { if (!A.glog || (!force && Date.now() - glogAt < 30000)) return; glogAt = Date.now(); try { const L = await E(() => (window.__GAME_LOG || []).map((e) => ({ t: Math.round(e.t), type: e.type, d: (() => { try { return e.d && typeof e.d === 'object' ? JSON.parse(JSON.stringify(e.d)) : e.d; } catch (x) { return String(e.d); } })() }))); const pn = await E(() => performance.now()); fs.writeFileSync(path.join(OUT, `${TAG}-glog.json`), JSON.stringify({ t0: glogT0, wall0: T0, pageNow: pn, wallSec: (Date.now() - T0) / 1000, steps: log.steps, mg: log.mg, board: log.board, ev: L })); } catch (e) { note('glog: ' + e.message); } };
    log.glogT0 = glogT0;
    const playLoop = async (deadline) => {
    lastKey = ''; lastSet = -1; dead = 0; heroDead = 0; idleOff = 0; checkShot = false;
    for (let k = 0; left() > 25000 && Date.now() < deadline && k < 600; k++) {
      await dumpGlog(false);
      const s = await st();
      if (s.gone) { note('the game is gone'); break; }
      if (UNTIL(s)) { note(`until reached: ${A.until}`); break; }
      const w = await readWords('loop');
      await logOpen();
      await courseWatch(s);   // (PRODUCER13, N79) every course end: who set the last stone, the toast, the beat's frame
      { const chip = await E(() => { const c = document.querySelector('.g10-chip'); if (!c) return null; const r = c.getBoundingClientRect(); return r.width > 20 && getComputedStyle(c).display !== 'none' && +getComputedStyle(c).opacity > 0.3 ? { game: c.dataset.game || '', t: c.innerText.replace(/\s+/g, ' ').trim().slice(0, 80), y: Math.round(r.top) } : null; }).catch(() => null);   // (PRODUCER13: GAMES13's in-between games' chip in the demo)
        if (chip && !chipSeen.has(s.id + chip.game)) { chipSeen.add(s.id + chip.game); note(`GAMES CHIP at ${s.id}: ${JSON.stringify(chip)}`); log.chips = (log.chips || []).concat({ t: sec(), id: s.id, ...chip }); await shot(`${s.id}-games-chip`, true, true); } }
      // (PRODUCER13a, note 3) an idle window: no touch for IDLE_S s, the track and three shots (after a course, after a game, no stones)
      if (IDLE_S && DEMOPICK && !(await whatOpen()) && !(await modalText()) && !(await E(() => !!document.querySelector('.fx-mg, .gm-mo.on, .gm-sheet.on')))) { const why = await idleDue(s); if (why) { await idleWindow(s, why); continue; } }
      // (PRODUCER12, note 2) a course ended: the fixed cameras + the owner's pinch
      if (A.fixcam && PJ[s.id] && (!A.fixcamOnly || String(A.fixcamOnly).split(',').includes(s.id))) {
        const c = s.p === 'courses' ? Math.floor((s.set || 0) / PJ[s.id].P) : /finish|insp|done|key/.test(String(s.p)) ? PJ[s.id].C : null;
        if (c != null && (courseAt == null || c > courseAt)) { const first = courseAt == null; courseAt = c; note(`COURSE ${c} of ${PJ[s.id].C} (${s.id} set ${s.set})`); await courseShots(s.id, c, first ? 'start' : `course ${c} done (set ${s.set})`); }
      }
      // (PRODUCER11) does he walk from point to point at his work? his spot (x, z) sampled every step; a move > 2.5 amot is a new spot
      const hp = await E(() => { const h = __T.stages && __T.stages.hero; if (!h) return null; const p = h.position; return [Math.round(p.x), Math.round(p.z)]; }).catch(() => null);
      if (hp) { const lw = walk[walk.length - 1]; if (!lw || Math.hypot(hp[0] - lw.p[0], hp[1] - lw.p[1]) > 2.5) walk.push({ t: sec(), s: `${s.id}:${s.p}/${s.set}`, p: hp }); }
      const key = `${s.ftue}|${s.id}|${s.p}|${s.done}`;
      if (key !== lastKey) { note(`STATE ${JSON.stringify(s)}`); if (lastKey) await shot(`${s.id}-${s.p || 'none'}${s.ftue < 99 ? '-f' + s.ftue : ''}`); lastKey = key; }
      if (s.set !== lastSet) { if (lastSet >= 0 && (A.stages ? [1, 9, 17, 33] : [1, 2, 3, 5, 8, 12, 16, 20, 26, 32, 33, 40, 48, 56, 64, 65, 72, 80, 96, 97]).includes(s.set)) await shot(`${s.id}-set${s.set}`); lastSet = s.set; }
      if (/בדיקת הנדבכים|האנך|הבדיקה/.test(w.pill + ' ' + w.bub) && !checkShot) { checkShot = true; await shot('check-pill', true); }
      if (w.pill && w.pill !== lastPill) { note(`pill: "${w.pill}"${w.bub ? ` · bub: "${w.bub}"` : ''}`); lastPill = w.pill; }
      // the kohen while nothing is running: in view? (every ~6 s)
      if (Date.now() - lastHeroCheck > 6000) {
        lastHeroCheck = Date.now();
        const busy = await E(() => !!(document.querySelector('.fx-mg, .m3 .m3-hit, .gm-modal.on, .gm-mo.on') || (__T.game && __T.game.busy)));
        if (!busy) {
          const hv = await heroView().catch(() => null);
          if (hv) { log.hero.push({ t: sec(), s: `${s.p}/${s.set}`, ...hv }); if ((!hv.on || hv.hidden || hv.px < 10) && idleOff++ < (A.stages ? 2 : 4)) { note(`KOHEN NOT SEEN ${JSON.stringify(hv)}`); await shot(`kohen-${!hv.on ? 'off' : hv.hidden ? 'hidden' : 'tiny'}-${s.p}${s.set}`); } }
        }
      }
      if (WATCH) {   // the demo's reel: watch it, a shot every ~25 s, answer only what a card asks
        const mt = await modalText();
        if (mt) { if (!seenModal.has(mt.slice(0, 30))) { seenModal.add(mt.slice(0, 30)); note('card: ' + mt.slice(0, 160)); await shot('card'); } await tapModal(); await wait(800); continue; }
        if (Date.now() - lastWatch > 25000) { lastWatch = Date.now(); await shot('reel'); }
        await wait(1500); continue;
      }
      // (PRODUCER11) Phase B (the service, src/avodah): a short look — a shot every ~12 s (≤ 8), a tap on what it offers first
      // (its gold/primary button, else a tile/option, else a 3D target), and its words logged
      const av = await E(() => { const t = document.querySelector('.av-top'); if (!t || !t.offsetParent) return null; const vis = (x) => x && x.offsetParent && x.getBoundingClientRect().width > 20; const say = [...document.querySelectorAll('.av-say, .av-hint, .av-card h2, .av-card h3, .av-status')].filter(vis).map((x) => x.innerText.replace(/\s+/g, ' ').trim()).join(' | ').slice(0, 220); const b = [...document.querySelectorAll('.av-modal .av-btn, .av-card .av-btn, .av-btn')].filter(vis); const g = b.find((x) => /gold|primary|go/.test(x.className)) || b[0] || [...document.querySelectorAll('.av-opt, .av-tile, .av3d-t')].find(vis); if (g) g.dataset.qa = 'av'; return { say, btn: g ? g.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) : null }; });
      if (av) {
        if (!avT) { avT = Date.now(); note('PHASE B entered'); }
        if (av.say !== lastAvSay) { note(`phase B: "${av.say}" · next "${av.btn || '—'}"`); lastAvSay = av.say; }
        if (Date.now() - avShot > 12000 && avN < 8) { avShot = Date.now(); avN++; await shot(`phaseB-${avN}`, true); }
        if (av.btn) await tapEl('[data-qa="av"]', `phase B: "${av.btn}"`);
        await wait(2200); continue;
      }
      // the name prompt
      if (await pg.$('.gm-modal.on .gm-input')) {
        await shot('name-prompt', true);
        await tapEl('.gm-modal.on .gm-input', 'name field'); await pg.keyboard.type(NAME); await wait(300);
        await tapEl('.gm-modal.on .gm-btn-gold', 'name: next'); await wait(1500);
        await shot('after-name', true);
        continue;
      }
      // (PRODUCER11) an in-between game open (.g10): unless --games, the player goes back to building ("חזרה" / "יציאה")
      if ((await E(() => { const g = document.querySelector('.g10'); return !!(g && g.getBoundingClientRect().height > 50); })) && (A.games || A.quarry || /^▶|stone sheet/.test(lastPillTap))) {
        const why = lastPillTap; lastPillTap = ''; await playG10(why || 'games'); continue;
      }
      if (!A.games && (await E(() => { const g = document.querySelector('.g10'); return !!(g && g.getBoundingClientRect().height > 50); }))) {
        await shot('g10-open', true);
        const out = (await tapEl('.g10 .g10-x[data-v="close"]', 'the games: חזרה לבנייה')) || (await tapEl('.g10 .g10-x', 'the game: יציאה'));
        await wait(900);
        const conf = await E(() => { const b = [...document.querySelectorAll('.g10 button')].find((x) => x.offsetParent && /לצאת|כן|חזרה/.test(x.textContent) && !/להמשיך/.test(x.textContent)); if (b) b.dataset.qa = 'out'; return !!b; });
        if (conf) await tapEl('.g10 button[data-qa="out"]', 'confirm');
        await wait(900); if (!out) await wait(1500);
        continue;
      }
      const mt = await modalText();
      if (mt && (await E(() => { const c = document.getElementById('card'); return !!(c && c.classList.contains('on')); }))) {   // a place card over a card: its × first (a child would)
        note('a place card is open over the card: × first'); await shot('placecard-over-card', true); await tapEl('#cx', 'the place card: ×'); await wait(900); continue;
      }
      if (mt && DEMOPICK && /בחר שלב/.test(mt)) {   // (PRODUCER13a) a picker this run did not open: closed with its own "סגור", logged
        note('THE PICKER IS OPEN (not by my pick): closed'); log.strayPicker = (log.strayPicker || 0) + 1; await shot('stray-picker', true);
        const cl = await E(() => { const b = [...document.querySelectorAll('.gm-modal.on button')].pop(); if (b) b.dataset.qa = 'close'; return b ? b.textContent.trim() : null; });
        if (cl) await tapEl('.gm-modal.on button[data-qa="close"]', `the picker: "${cl}"`); await wait(900); continue;
      }
      if (mt) {
        const k2 = mt.slice(0, 40);
        if (!seenModal.has(k2)) { seenModal.add(k2); note('card: ' + mt.slice(0, 200)); await shot('card'); }
        if (!A.games && /הפסקה קצרה/.test(mt)) {   // the in-between games' invitation: a builder says "אחר כך" (--games plays)
          const later = await E(() => { const b = [...document.querySelectorAll('.gm-modal.on button')].find((x) => /אחר כך/.test(x.textContent)); if (b) b.dataset.qa = 'later'; return !!b; });
          if (later && (await tapEl('.gm-modal.on button[data-qa="later"]', 'the games\' invitation: אחר כך'))) { await wait(700); continue; }
        }
        await tapModal(); await wait(700);
        if (A.checkSeq && /הבדיקה|האנך/.test(mt) && !checkSeq) { checkSeq = 1; for (const at of [1, 4, 7, 10, 13, 16]) { await wait(at === 1 ? 300 : 2400); await shot(`check-${at}s`, true); } }
        continue;
      }
      // (PRODUCER11) a key moment (moments.js .gm-mo): read its words, then play it the way a child would — hold the hold button
      // (released when the stone on screen reaches its mark, read from the picture's transform), tap each thing marked as a button,
      // drag what must be dragged (the draggable piece toward the dashed target); after 50 s without an end, "דלג" (logged)
      const mo = await E(() => { const w = document.querySelector('.gm-mo.on'); if (!w) return null; const tx = (q) => ((w.querySelector(q) || {}).innerText || '').replace(/\s+/g, ' ').trim(); const e = w.querySelector('.gm-mo-end'); return { t: tx('.gm-mo-t'), hint: tx('.gm-mo-hint'), end: !!(e && !e.hidden), hold: !!w.querySelector('.gm-mo-hold'), btns: w.querySelectorAll('.gm-mo-play [role=button]').length }; });
      if (mo) {
        if (!moSeen.has(mo.t)) { moSeen.add(mo.t); moT0 = Date.now(); note(`MOMENT "${mo.t}" · hint "${mo.hint}" · hold ${mo.hold} · buttons ${mo.btns}`); await wait(900); await shot(`mo-${mo.t.replace(/\s+/g, '_').slice(0, 14)}-open`, true); log.mo = (log.mo || []).concat({ t: sec(), title: mo.t, hint: mo.hint }); }
        if (mo.end) { await shot(`mo-${mo.t.replace(/\s+/g, '_').slice(0, 14)}-done`, true); const src = await E(() => ((document.querySelector('.gm-mo .gm-mo-src') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 200)); note(`MOMENT done: "${mo.hint}" · ${src}`); (log.mo[log.mo.length - 1] || {}).done = { hint: mo.hint, src, s: Math.round((Date.now() - moT0) / 1000) }; await tapEl('.gm-mo.on .gm-mo-go', 'moment: המשך'); await wait(1500); continue; }
        if (Date.now() - moT0 > 50000) { note(`MOMENT "${mo.t}" not finished by my hand in 50 s: דלג`); (log.mo[log.mo.length - 1] || {}).skipped = true; await shot(`mo-${mo.t.replace(/\s+/g, '_').slice(0, 14)}-stuck`, true); await tapEl('.gm-mo.on .gm-mo-skip', 'moment: דלג'); await wait(1500); continue; }
        if (mo.hold) {
          const hb = await (await pg.$('.gm-mo.on .gm-mo-hold')).boundingBox();
          const cdp = await ctx.newCDPSession(pg); const pt = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 };
          const stoneY = () => E(() => { const g = [...document.querySelectorAll('.gm-mo.on .gm-mo-svg g[transform]')][0]; const m = g && g.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)/); return m ? +m[2] : null; });
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
          const th = Date.now(); let y = null;
          while (Date.now() - th < 6000) { y = await stoneY(); if (y != null && /האבן הגדולה/.test(mo.t) ? y >= 196 : Date.now() - th > 1400) break; await wait(30); }
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {});
          note(`moment: held ${Date.now() - th} ms (the picture at y ${y})`); await wait(1200); continue;
        }
        if (mo.btns) {
          const bt = await E(() => { const b = [...document.querySelectorAll('.gm-mo.on .gm-mo-play [role=button]')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 4 && !x.classList.contains('done') && !x.classList.contains('ok') && !x.dataset.qaTapped; }); if (!b) return null; b.dataset.qaTapped = '1'; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, l: b.getAttribute('aria-label') || '' }; });
          if (bt) { await tap(bt.x, bt.y, `moment button "${bt.l}"`); await wait(700); continue; }
        }
        const dr = await E(() => { const w = document.querySelector('.gm-mo.on'); const d = w && [...w.querySelectorAll('.gm-mo-play svg [class*="drag"], .gm-mo-play svg .gm-mo-line, .gm-mo-play svg [style*="grab"]')].find((x) => x.getBoundingClientRect().width > 2); const t = w && [...w.querySelectorAll('.gm-mo-play svg [class*="target"], .gm-mo-play svg [class*="slot"], .gm-mo-play svg .gm-mo-mark')].find((x) => x.getBoundingClientRect().width > 2); if (!d || !t) return null; const a = d.getBoundingClientRect(), b = t.getBoundingClientRect(); return { x0: a.x + a.width / 2, y0: a.y + a.height / 2, x1: b.x + b.width / 2, y1: b.y + b.height / 2 }; });
        if (dr) { const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: dr.x0, y: dr.y0 }] }); for (let q = 1; q <= 12; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: dr.x0 + (dr.x1 - dr.x0) * q / 12, y: dr.y0 + (dr.y1 - dr.y0) * q / 12 }] }); await wait(40); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); note(`moment: dragged ${JSON.stringify(dr)}`); await wait(1000); continue; }
        await wait(1200); continue;
      }
      // a precision game: watch 4 s with no input, then play by hand (the game's own on-screen hand, else a tap a second)
      const mg = await E(() => { const w = document.querySelector('.fx-mg'); if (!w) return null; const tx = (s) => ((w.querySelector(s) || {}).innerText || '').replace(/\s+/g, ' ').trim(); return { kind: w.dataset.kind, title: tx('.fx-mg-top'), hint: tx('.fx-mg-hint'), fact: tx('.fx-mg-fact'), how: tx('.fx-mg-how'), done: w.classList.contains('done') }; });
      if (mg) {
        if (mg.done) { await tapEl('.fx-mg .fx-go', 'mini-game: המשך'); await wait(800); continue; }
        note(`mini-game ${JSON.stringify(mg).slice(0, 260)}`);
        await shot(`mg-${mg.kind}-open`);
        hidden3d = true; await canvas3d(false);
        const t1 = Date.now();
        const self = await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); return !w || w.classList.contains('done'); }, null, { polling: 150, timeout: 4000 }).then(() => true, () => false);
        const r0 = { t: sec(), kind: mg.kind, title: mg.title, hint: mg.hint, how: mg.how.slice(0, 120), pill: w.pill, endedAlone: self };
        if (!self) {
          const cvh = await pg.$('.fx-mg canvas'); const cv = cvh ? await cvh.boundingBox() : { x: 0, y: 200, width: W, height: 400 };
          let taps = 0, cued = 0, lastTap = Date.now(); const t2 = Date.now();
          while (Date.now() - t2 < 45000) {
            const d = await E(() => { const w = document.querySelector('.fx-mg'); if (!w || w.classList.contains('done')) return { end: true }; const mm = w.__mg; let c = null; try { c = mm && typeof mm.cue === 'function' ? mm.cue() : null; } catch (e) { c = null; } let how = false; try { how = mm && typeof mm.state === 'function' ? !!mm.state().how : !!w.querySelector('.fx-mg-how:not([hidden])'); } catch (e) { how = false; } return { end: false, cue: c, how }; });
            if (d.end) break;
            if (d.how) { if (!(await tapEl('.fx-mg .fx-mg-how:not([hidden])', 'the how-to'))) await pg.touchscreen.tap(cv.x + cv.width / 2, cv.y + cv.height / 2); await wait(500); continue; }
            // (PRODUCER14, GAMES14's drag channel) the game's own hand: a swipe {x, y, x2, y2} is dragged by real touch (CDP), a
            // hold button ({hold|press: id} or a hold btn) is held until the hand lets go, an array is the first thumb's
            const cu = Array.isArray(d.cue) ? d.cue[0] : d.cue;
            if (cu && (cu.hold != null || cu.press != null || (cu.btn && cu.down != null))) {
              const id = cu.hold != null && cu.hold !== true ? cu.hold : cu.press != null ? cu.press : cu.btn;
              if (cu.down === false || cu.now === false) { await wait(60); continue; }   // (tread.js: `now` = both feet up — the next foot waits for it)
              const bb = await (async () => { const h = await pg.$(`.fx-mg [data-b="${id}"]`); return h ? h.boundingBox() : null; })();
              if (!bb) { await wait(150); continue; }
              const cdp = await ctx.newCDPSession(pg); const pt = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] }); const th = Date.now();
              const holdMs = cu.ms ? Math.min(6000, +cu.ms) : 6000;
              while (Date.now() - th < holdMs) { const c2 = await E(() => { const w = document.querySelector('.fx-mg'); if (!w || w.classList.contains('done')) return { end: true }; try { return { c: w.__mg && w.__mg.cue ? w.__mg.cue() : null }; } catch (e) { return { c: null }; } }); const cc = c2.c && (Array.isArray(c2.c) ? c2.c[0] : c2.c); if (c2.end || (!cu.ms && (!cc || cc.down === false || ((cc.hold != null && cc.hold !== true ? cc.hold : cc.press != null ? cc.press : cc.btn) !== id)))) break;   /* (a hold with its own ms is held for exactly that: tread.js's cue turns to the other foot at once) */ await wait(50); }
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {});
              (r0.holds = r0.holds || []).push(`${id}:${Date.now() - th}ms`); cued++;
            }
            else if (cu && typeof cu.x === 'number' && typeof cu.x2 === 'number') {
              if (cu.timed !== false && cu.now === false) { await wait(40); continue; }
              const cb = await (async () => { const h = await pg.$('.fx-mg canvas'); return (h && await h.boundingBox()) || cv; })();
              const P = (x, y) => ({ x: cb.x + x * cb.width, y: cb.y + y * cb.height });
              const a0 = P(cu.x, cu.y), a1 = P(cu.x2, cu.y2), cdp = await ctx.newCDPSession(pg), NS = +(A.dragSteps || 5);   // (PRODUCER14: few touch events a drag — each waits a frame on a busy machine; GAMES14 found the same)
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a0] });
              // (a swipe with no timing — the rub — is rubbed as a child does: back and forth, 4 passes in one touch; a timed or paced one once)
              const passes = mg.kind === 'cover' && cu.now == null && !cu.ms ? 4 : 1;   // (only the rub: the rafts' swipe steers, once)
              for (let pz = 0; pz < passes; pz++) { const [p0, p1] = pz % 2 ? [a1, a0] : [a0, a1]; for (let q = 1; q <= NS; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p0.x + (p1.x - p0.x) * q / NS, y: p0.y + (p1.y - p0.y) * q / NS }] }); await wait(+(cu.ms || A.dragMs || 450) / NS); } }
              await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {});
              r0.drags = (r0.drags || 0) + 1; cued++;
            }
            else if (cu && cu.btn) { if (!(await tapEl(`.fx-mg [data-b="${cu.btn}"]`, ''))) await wait(200); cued++; }
            else if (d.cue && typeof d.cue.x === 'number') { if ((d.cue.timed === true || d.cue.now === false) && d.cue.timed !== false && !d.cue.now && Date.now() - lastTap < 8000) { await wait(40); continue; }   /* (PRODUCER14: a cue that says neither `timed` nor `now` is tapped at once — snap.js's grab) */ await pg.touchscreen.tap(cv.x + d.cue.x * cv.width, cv.y + d.cue.y * cv.height); if (d.cue.now) cued++; }
            else if (await E(() => { const w = document.querySelector('.fx-mg'); const st = w && w.__mg && w.__mg.state ? w.__mg.state() : {}; return !!(st.drag || (w && w.querySelector('.fx-hold'))); })) { await wait(150); continue; }   // (PRODUCER14: a drag or hold game with no hand on screen is coasting — her finger waits)
            else await pg.touchscreen.tap(cv.x + cv.width / 2, cv.y + cv.height * 0.55);
            taps++; lastTap = Date.now();
            if (taps === 3) await shot(`mg-${mg.kind}-playing`);
            if (taps === 1 && mg.kind === 'plumb') await shot(`mg-plumb-round1`, true);   // (PRODUCER13: the first round — the level with the needle where GAMES13 put it)
            await wait(d.cue ? 250 : 900);
          }
          r0.taps = taps; r0.cued = cued; r0.playS = Math.round((Date.now() - t2) / 1000);
          r0.result = await E(() => { const w = document.querySelector('.fx-mg'); if (!w) return 'closed'; const t = (s) => ((w.querySelector(s) || {}).textContent || '').replace(/\s+/g, ' ').trim(); return w.classList.contains('done') ? `${t('.fx-mg-tier')} · ${t('.fx-mg-acc')}` : ''; });
          r0.fact = await E(() => ((document.querySelector('.fx-mg .fx-mg-fact') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160));
          r0.finished = await E(() => { const w = document.querySelector('.fx-mg'); return !w || w.classList.contains('done'); });
          if (r0.result && r0.result !== 'closed') await shot(`mg-${mg.kind}-result`);
          if (!r0.finished) { note('not ended in 45 s: skip'); if (!(await tapEl('.fx-mg .fx-skip:not([hidden])', 'skip'))) await tapEl('.fx-mg .fx-go', 'continue'); await wait(1200); }
        }
        if (await pg.$('.fx-mg.done .fx-go')) { await tapEl('.fx-mg .fx-go', 'mini-game: המשך'); await pg.waitForFunction(() => !document.querySelector('.fx-mg'), null, { polling: 150, timeout: 4000 }).catch(() => {}); }
        hidden3d = false; await canvas3d(true);
        log.mg.push(r0); note(`mini-game done ${JSON.stringify(r0).slice(0, 300)}`);
        // after the corner stone's quarry game: the cart and the crane, watched (3 s, 11 s, 20 s)
        if (mg.kind === 'quarry') { const tk = Date.now(); const ks = A.keyEvery ? [...Array(Math.floor(26 / +A.keyEvery)).keys()].map((q) => (q + 1) * +A.keyEvery * 1000) : [3000, 11000, 20000]; for (const at of ks) { while (Date.now() - tk < at) { if (await modalText()) await tapModal(); await readWords('keystone'); await wait(400); } await shot(`keystone-${at / 1000}s`, true); } }
        continue;
      }
      // the board (match-3): started by touch, played by a greedy player that reads its pixels
      if (await pg.$('.m3 .m3-hit')) {
        const mv = () => E(() => +((document.querySelector('.m3-moves b') || {}).textContent || NaN));
        await wait(1500); await shot('board-open', true);
        hidden3d = true; await canvas3d(false);
        const card = await E(() => { const c = document.querySelector('.m3 .m3-card'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').slice(0, 160) : null; });
        const rec = { t: sec(), card };
        if (card) { await tapEl('.m3 .m3-card .m3-cta', 'the board: התחל'); await wait(1500); rec.startedByTouch = !(await E(() => !!document.querySelector('.m3 .m3-card .m3-cta') && !!document.querySelector('.m3 .m3-card').offsetParent)); }
        const m0 = await mv(); await wait(4000); rec.selfPlay = (await mv()) !== m0;
        // (PRODUCER10) the board as a player sees it: each cell's picture (its centre, 6×6 averaged) compared with the others —
        // the same vessel is the same picture — then the swap that makes the longest line, by two real taps; a swap the board
        // refuses is not tried again; with no line seen, an untried neighbour pair (a player's guess)
        const hbh = await pg.$('.m3 .m3-hit'); const hb = hbh ? await hbh.boundingBox() : null;
        if (!hb || A.reel) {   // (the demo's board plays itself; a board gone already)
          const tb = Date.now(); while (Date.now() - tb < 60000 && (await pg.$('.m3 .m3-hit'))) { if (Date.now() - tb > 8000 && !rec.mid) { rec.mid = true; await shot('board-demo'); } await wait(1500); }
          hidden3d = false; await canvas3d(true); rec.dur = Math.round((Date.now() - tb) / 1000) + 4; log.board.push(rec); note(`board (watched) ${JSON.stringify(rec).slice(0, 200)}`); continue;
        }
        const NC = +(A.cols || 8), NR = Math.max(5, Math.min(11, Math.round(hb.height / (hb.width / NC))));
        const cs = Math.floor(Math.min(hb.width / NC, hb.height / NR)), ox = hb.x + (hb.width - cs * NC) / 2, oy = hb.y + (hb.height - cs * NR) / 2;
        rec.grid = `${NC}×${NR} cell ${cs}px`;
        let ok = 0, tried = 0, noMove = 0, guessed = 0; const refused = new Set();
        for (let q = 0; q < 60 && ok < +(A.moves || 40) && left() > 30000 && (await pg.$('.m3 .m3-hit')) && !(await E(() => { const c = document.querySelector('.m3 .m3-card'); return !!(c && c.offsetParent); })); q++) {
          const grid = await E(({ ox, oy, cs, NC, NR }) => {
            const cv = document.querySelector('.m3 .m3-cv'); if (!cv) return null;
            const rr = cv.getBoundingClientRect(), sx = cv.width / rr.width, g = cv.getContext('2d');
            const sig = [];
            for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
              const x0 = Math.round((ox + (c + 0.18) * cs - rr.left) * sx), y0 = Math.round((oy + (r + 0.18) * cs - rr.top) * sx), w = Math.max(6, Math.round(cs * 0.64 * sx));
              const d = g.getImageData(x0, y0, w, w).data, v = new Array(108).fill(0), cnt = new Array(36).fill(0);
              for (let yy = 0; yy < w; yy++) for (let xx = 0; xx < w; xx++) { const z = (yy * w + xx) * 4, b2 = ((yy * 6 / w) | 0) * 6 + ((xx * 6 / w) | 0); v[b2 * 3] += d[z]; v[b2 * 3 + 1] += d[z + 1]; v[b2 * 3 + 2] += d[z + 2]; cnt[b2]++; }
              for (let k = 0; k < 108; k++) v[k] /= Math.max(1, cnt[(k / 3) | 0]);
              sig.push(v);
            }
            const diff = (a, b2) => { let t = 0; for (let k = 0; k < 108; k++) t += Math.abs(a[k] - b2[k]); return t / 108; };
            const reps = [], out = [];
            for (const v of sig) { let id = reps.findIndex((z) => diff(z, v) < 14); if (id < 0) { id = reps.length; reps.push(v); } out.push(id); }
            return { out, kinds: reps.length };
          }, { ox, oy, cs, NC, NR });
          if (!grid) break;
          const B = grid.out, at = (r, c) => (r < 0 || r >= NR || c < 0 || c >= NC ? -2 : B[r * NC + c]);
          const line = (X, r, c) => { const v = X[r * NC + c]; if (v < 0) return 0; let h = 1, w2 = 1; for (let z = c - 1; z >= 0 && X[r * NC + z] === v; z--) h++; for (let z = c + 1; z < NC && X[r * NC + z] === v; z++) h++; for (let z = r - 1; z >= 0 && X[z * NC + c] === v; z--) w2++; for (let z = r + 1; z < NR && X[z * NC + c] === v; z++) w2++; return Math.max(h >= 3 ? h : 0, w2 >= 3 ? w2 : 0); };
          let best = null;
          for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
            if (at(r + dr, c + dc) === -2 || refused.has(`${r},${c},${dr},${dc}`)) continue;
            const X = B.slice(), a = r * NC + c, b2 = (r + dr) * NC + c + dc; if (X[a] === X[b2]) continue; [X[a], X[b2]] = [X[b2], X[a]];
            const sc = Math.max(line(X, r, c), line(X, r + dr, c + dc));
            if (sc >= 3 && (!best || sc > best.sc || (sc === best.sc && r > best.r))) best = { r, c, dr, dc, sc };
          }
          if (!best) {   // no line seen: a player's guess (an untried neighbour pair near the middle)
            noMove++; if (noMove > 12) break;
            const pool = []; for (let r = 1; r < NR - 1; r++) for (let c = 0; c < NC - 1; c++) if (!refused.has(`${r},${c},0,1`)) pool.push({ r, c, dr: 0, dc: 1, sc: 0 });
            if (!pool.length) break; best = pool[(q * 7) % pool.length]; guessed++;
          }
          const before = await mv();
          const x1 = ox + (best.c + 0.5) * cs, y1 = oy + (best.r + 0.5) * cs;
          await pg.touchscreen.tap(x1, y1); await wait(150);
          if (tried === 0) { await E(() => { window.__HUD_HOLD = true; }); await pg.screenshot({ path: path.join(OUT, `${TAG}-board-first-tap.png`) }); await E(() => { window.__HUD_HOLD = false; }); }
          await pg.touchscreen.tap(x1 + best.dc * cs, y1 + best.dr * cs);
          tried++;
          await pg.waitForFunction((b0) => { const z = +((document.querySelector('.m3-moves b') || {}).textContent || NaN); return z !== b0 || !document.querySelector('.m3 .m3-hit'); }, before, { polling: 150, timeout: 2500 }).catch(() => {});
          if ((await mv()) !== before) { ok++; noMove = 0; } else refused.add(`${best.r},${best.c},${best.dr},${best.dc}`);
          if (ok === 8 && !rec.shot8) { rec.shot8 = true; await shot('board-8-moves', true); }
          await wait(1200);
        }
        rec.guessed = guessed;
        rec.tried = tried; rec.accepted = ok;
        const endCard = await E(() => { const c = document.querySelector('.m3 .m3-card'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').slice(0, 160) : null; });
        rec.endCard = endCard;
        if (endCard) { await shot('board-end', true); const hasBack = await E(() => { const b = [...document.querySelectorAll('.m3 .m3-card button')].find((x) => /חזרה/.test(x.textContent)) || document.querySelector('.m3 .m3-card .m3-cta'); if (b) b.dataset.qa = 'end'; return !!b; }); if (hasBack) await tapEl('.m3 .m3-card button[data-qa="end"]', 'the board\'s end card'); await wait(1500); }
        if (await pg.$('.m3 .m3-exit')) { await tapEl('.m3 .m3-exit', 'board exit'); await wait(900); const qb = await E(() => { const b = [...document.querySelectorAll('.m3 button')].find((x) => x.offsetParent && /לצאת/.test(x.textContent) && !/להמשיך/.test(x.textContent)); if (b) b.dataset.qa = 'quit'; return !!b; }); if (qb) await tapEl('.m3 button[data-qa="quit"]', 'confirm: לצאת'); await wait(1200); }
        hidden3d = false; await canvas3d(true);
        log.board.push(rec); note(`board ${JSON.stringify(rec).slice(0, 300)}`);
        await shot('after-board');
        continue;
      }
      // (PRODUCER14, ECON14's purse and "אוצר המלאכה") --shop=1: from minute --shopMin (default 4) of play, every 75 s until a first
      // purchase: open the purse by touch, read the shop (her five: the machines, the tools, האבן שלי, the instruments, the lamps;
      // each price, each button's size), shot it, buy the cheapest of her five she can afford, close it
      if (A.shop && !shopBought && Date.now() - shopLast > 75000 && (Date.now() - T0) / 1000 > +(A.shopMin || 4) * 60 && !(await whatOpen()) && !(await modalText())) {
        shopLast = Date.now(); await shopVisit(s); continue;
      }
      // (PRODUCER14, FUN14's deal "מה נעשה עכשיו?") two big cards and one ↻: read both (the job, "עד N מטבעות", "חדש!"), shot the
      // first deals, then pick as she would (--dealPick=heart: one of her ❤️ jobs not played yet, else "חדש!", else the craft card,
      // else the other card than last time; --dealPick=first|second); --redeal=N: the ↻ tried N times a run (logged)
      const deal = await E(() => {
        const vis = (x) => { if (!x) return false; const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.width > 30 && r.height > 30 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.3 && r.bottom > 0 && r.top < innerHeight; };
        const R = [...document.querySelectorAll('.gm-sheet.on, .gm-sh.on, .gm-modal.on, .gm-deal, [data-deal], .gm-cards, .fn-deal, .gm-jobs')].find((x) => vis(x) && /מה נעשה עכשיו/.test(x.innerText));
        if (!R) return null;
        const all = [...R.querySelectorAll('button, [role=button], .gm-card-job, [data-job]')].filter(vis);
        const redeal = all.find((b) => /↻|ערבב|חלק שוב|עוד קלפים/.test(b.innerText || b.getAttribute('aria-label') || ''));
        const cards = all.filter((b) => b !== redeal && !b.contains(redeal) && b.getBoundingClientRect().height >= 60 && !all.some((o) => o !== b && b.contains(o) && o.getBoundingClientRect().height >= 60));
        cards.forEach((b, i) => { b.dataset.qaCard = String(i); }); if (redeal) redeal.dataset.qaCard = 'redeal';
        return { title: (R.querySelector('h2, h3, .gm-deal-t') || R).innerText.replace(/\s+/g, ' ').trim().slice(0, 60), cards: cards.map((b, i) => { const r = b.getBoundingClientRect(); return { i, job: b.dataset.job || b.dataset.id || '', t: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 90), w: Math.round(r.width), h: Math.round(r.height), isNew: /חדש/.test(b.innerText), kind: b.dataset.kind || (b.classList.contains('craft') ? 'craft' : b.classList.contains('stone') ? 'stone' : b.classList.contains('quarry') ? 'quarry' : '') }; }), redeal: redeal ? (() => { const r = redeal.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), t: redeal.innerText.trim() }; })() : null };
      }).catch(() => null);
      if (deal && deal.cards.length && A.noDeal) { if (!dealShot.has(s.id)) { dealShot.add(s.id); note(`DEAL at ${s.id}:${s.set} (closed: --noDeal, the gate looks at the world) ${deal.cards.map((c) => c.job).join(' | ')}`); } await tapVis('.gm-deal.on .gm-x', 'the deal: ✕'); await wait(700); continue; }
      if (deal && deal.cards.length) {
        dealN++; const rec = { t: sec(), id: s.id, set: s.set, cards: deal.cards, redeal: deal.redeal };
        note(`DEAL #${dealN} at ${s.id}:${s.set} — ${deal.cards.map((c) => `[${c.job || '?'}${c.kind ? '/' + c.kind : ''} "${c.t}" ${c.w}×${c.h}${c.isNew ? ' NEW' : ''}]`).join(' ')}${deal.redeal ? ` · ↻ ${deal.redeal.w}×${deal.redeal.h}` : ' · no ↻'}`);
        if (dealN <= 3 || !dealShot.has(s.id)) { dealShot.add(s.id); await shot(`deal${dealN}-${s.id}`, true, true); }
        if (deal.redeal && redealN < +(A.redeal || 1)) { redealN++; rec.redealt = true; (log.deals = log.deals || []).push(rec); await tapEl('[data-qa-card="redeal"]', 'the deal: ↻'); await wait(900); continue; }
        const HEART = /זהב|שיבריק|ניסור|מסור|עמוד|קשת|החוט|אותיות|גלגל|רפסוד/;
        const pol = A.dealPick || 'heart';
        let pick = null;
        if (pol === 'first') pick = deal.cards[0]; else if (pol === 'second') pick = deal.cards[1] || deal.cards[0];
        else { if (A.want) { for (const wj of String(A.want).split(',')) { if (jobsPlayed.has(wj)) continue; pick = deal.cards.find((c) => c.job === wj); if (pick) break; } }   // (--want=gold,saw,…: her jobs in the order I still need them)
          pick = pick || deal.cards.find((c) => HEART.test(c.t) && !jobsPlayed.has(c.job || c.t.slice(0, 14))) || deal.cards.find((c) => c.isNew) || deal.cards.find((c) => /craft/.test(c.kind)) || deal.cards.find((c) => (c.job || c.t.slice(0, 14)) !== lastJob) || deal.cards[0]; }
        rec.pick = pick.i; rec.pickT = pick.t; (log.deals = log.deals || []).push(rec);
        lastJob = pick.job || pick.t.slice(0, 14); jobsPlayed.add(lastJob);
        await tapEl(`[data-qa-card="${pick.i}"]`, `the deal: "${pick.t.slice(0, 40)}"`); await wait(1200); continue;
      }
      // a sheet's one big button
      const big = await E(() => { const b = document.querySelector('.gm-sheet.on .gm-big, .gm-sh.on .gm-big, .gm-big'); if (!b || !b.offsetParent) return null; const r = b.getBoundingClientRect(); const cy = r.y + r.height / 2; if (cy < 40 || cy > innerHeight - 20 || r.width < 20) return null; return { x: r.x + r.width / 2, y: cy, w: Math.round(r.width), h: Math.round(r.height), t: b.innerText.replace(/\s+/g, ' '), a: b.dataset.a }; });
      if (big) { await shot(`sheet-${big.a || 'x'}`); await tap(big.x, big.y, `sheet big "${big.t}" [${big.w}×${big.h}]`); await wait(1500); continue; }
      // --reel (the demo): the strip's "הרגע הבא ✦" once the last beat has settled (≥ 12 s), a shot of what the beat left on screen
      if (A.reel) {
        const hl = await E(() => { const b = document.querySelector('.gm-hl'); if (!b || !b.offsetParent) return null; const r = b.getBoundingClientRect(); const chips = [...document.querySelectorAll('.gm-demo button')].map((x) => { const q = x.getBoundingClientRect(); return `${x.textContent.trim()} ${Math.round(q.width)}×${Math.round(q.height)}`; }); return { x: r.x + r.width / 2, y: r.y + r.height / 2, chips }; });
        if (hl && Date.now() - lastReel > 12000) { if (lastReel) await shot(`reel-beat${reelN}`); else note(`demo chips: ${JSON.stringify(hl.chips)}`); reelN++; lastReel = Date.now(); await tap(hl.x, hl.y, `הרגע הבא ✦ (#${reelN})`); await wait(2500); continue; }
        await wait(1500); continue;
      }
      // the world: the pointer, the coach's hand, the ring; else the goal pill; else the kohen himself
      // (PRODUCER12, note 1) --quarry=N: N quarry actions in a row, before any other work
      if (A.quarry && quarryN < +A.quarry && !(await whatOpen()) && s.ftue >= 99) { if (await openQuarry()) { await wait(2500); continue; } }
      const nAct = () => E(() => window.__GAME_LOG.filter((e) => /^(strike|stroke|stoneSet|step|check|course|set|phase|stageStart|stageDone|keyStone|keyAsk|momentStart|moment|event|reset|sheet)$/.test(e.type)).length);
      const m = await markPt();
      let hand = m && inFrame(m) ? null : await coachPt();
      // (PRODUCER13a) in the demo the coach's hand that points up at the pill lies on the strip's "שלבים ▾" chip: a tap there opens
      // the stage picker, whose first (gold) button skips the stage. Logged once per stage, then the pill is tapped instead.
      if (hand && DEMOPICK) { const onStrip = await E((p) => [...document.querySelectorAll('.gm-demo button')].some((b) => { const r = b.getBoundingClientRect(); return r.width > 4 && p.x >= r.left - 6 && p.x <= r.right + 6 && p.y >= r.top - 6 && p.y <= r.bottom + 6; }), hand); if (onStrip) { if (!handOnStrip.has(s.id)) { handOnStrip.add(s.id); note(`HAND ON THE STRIP at ${Math.round(hand.x)},${Math.round(hand.y)} (${s.id}:${s.p}/${s.set}) — a tap there opens the picker`); log.handOnStrip = (log.handOnStrip || []).concat({ t: sec(), id: s.id, p: s.p, set: s.set, at: [Math.round(hand.x), Math.round(hand.y)] }); await shot(`${s.id}-hand-on-strip`, true); } hand = null; } }
      const ring = (m && inFrame(m)) || hand ? null : await ringPt();
      let where = m && inFrame(m) ? { ...m, why: `pointer ${JSON.stringify(m.d).slice(0, 60)}` } : hand ? { ...hand, why: 'hand' } : ring && inFrame(ring) ? { ...ring, why: 'ring' } : null;
      // (PRODUCER14, N93) in the demo a world pointer can lie on the strip's "יציאה ממצב הדגמה ✕" (the coach slides the strip down
      // onto it): she would tap it and leave the demo. Logged with a shot once a stage; my finger then waits for the frame to change
      if (where && DEMOPICK) { const onStrip = await E((p) => { const e = document.elementFromPoint(p.x, p.y); const b = e && e.closest && e.closest('.gm-demo button, .gm-demo [role=button]'); return b ? b.textContent.trim().slice(0, 30) : null; }, where); if (onStrip) { if (!ptrOnStrip.has(s.id)) { ptrOnStrip.add(s.id); note(`POINTER ON THE STRIP at ${Math.round(where.x)},${Math.round(where.y)} (${s.id}:${s.p}/${s.set}): a tap there hits "${onStrip}"`); log.ptrOnStrip = (log.ptrOnStrip || []).concat({ t: sec(), id: s.id, p: s.p, set: s.set, at: [Math.round(where.x), Math.round(where.y)], chip: onStrip }); await shot(`${s.id}-pointer-on-strip`, true, true); } where = null; await wait(1200); continue; } }
      if (m && !inFrame(m) && !hand) note(`pointer out of frame at ${Math.round(m.x)},${Math.round(m.y)} ${JSON.stringify(m.d).slice(0, 60)}`);
      // (PRODUCER14, D3 "the precise strike, the ring") --ringTimed=N: the first N strikes while the ring is live are timed as the
      // screen teaches — the finger waits until the ring touches the gold (its scale ≤ --ringAt, default 1.06) and taps there; each
      // try is logged with the game's own verdict (the strike event's perfect / dt / early / late)
      const scOn = /סתת בקצב/.test(w.pill || '');   // (FUN14's strike card: every one of its 10 strikes timed as the ring teaches)
      if ((scOn || (A.ringTimed && ringTries < +A.ringTimed)) && dead < 3 && (where ? /^pointer|^ring|^hand/.test(where.why) : await E(() => { const R = document.querySelector('.gm-ring'); return !!(R && R.classList.contains('live')); }))) {
        const rt = await ringTap();
        if (rt) { ringTries++; let ev = []; for (let q = 0; q < 20 && !ev.length; q++) { await wait(100); ev = await E((k) => (window.__GAME_LOG || []).slice(k).filter((e) => e.type === 'strike').map((e) => e.d), rt.k); } const d = ev[0] || { none: true };   /* (PRODUCER14: the strike lands ~0.4–0.9 s after the tap — pa1 read it too early) */ (log.ring = log.ring || []).push({ t: sec(), try: ringTries, scale: rt.s, waited: rt.ms, perfect: !!d.perfect, dt: d.dt, early: d.early, late: d.late, words: rt.words }); note(`RING try ${ringTries}: tapped at scale ${rt.s} after ${rt.ms} ms → ${d.none ? 'NO STRIKE in 2 s' : d.perfect ? 'PERFECT' : 'not perfect'}${d.dt != null ? ` dt ${(+d.dt).toFixed(3)}` : ''}${rt.words ? ` · "${rt.words}"` : ''}`); if (ringTries <= 2 || d.perfect) await shot(`ring-try${ringTries}${d.perfect ? '-perfect' : ''}`, true, true); continue; }
      }
      if (where && dead < 3) { const n0 = await nAct(); await tap(where.x, where.y, where.why); await wait(1300); if ((await nAct()) === n0) { dead++; } else dead = 0; continue; }
      dead = 0;
      if (s.ftue >= 99 && heroDead < 3 && s.p && s.p !== 'done') {   // (a stage not started yet: the pill says "התחל לבנות", not him)
        const hv0 = await heroView().catch(() => null);
        if (hv0 && hv0.on) { const n0 = await nAct(); await tap(hv0.x, hv0.y + 12, heroDead ? '' : 'the kohen (no pointer after the first-time flow)'); await wait(1300); if ((await nAct()) === n0) heroDead++; else heroDead = 0; continue; }
      }
      heroDead = 0;
      const pill = await E(() => { const b = document.querySelector('.gm-pill'); if (!b || !b.offsetParent) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), t: b.innerText.replace(/\s+/g, ' ') }; });
      if (pill) { lastPillTap = pill.t.trim(); await tap(pill.x, pill.y, `pill "${pill.t.slice(0, 60)}" [${pill.w}×${pill.h}]`); await wait(1500); continue; }
      const hv = await heroView().catch(() => null);
      if (hv && hv.on) { await tap(hv.x, hv.y + 10, 'the kohen'); await wait(1500); continue; }
      log.steps.push({ t: sec(), why: 'nothing to tap' });   // (PRODUCER14: a wait with nothing on screen to touch — an escape moment)
      await wait(1500);
    }
    };
    if (DEMOPICK) {   // (PRODUCER13a) the demo: entered from the menu by touch, each stage from the strip's picker by touch
      await enterDemoByMenu();
      for (const ent of DEMOPICK) {
        const m = ent.match(/^(\w+)(?::(\d+))?$/); if (!m) { note(`bad entry "${ent}"`); continue; }
        const id = m[1], secs = m[2] != null ? +m[2] : +(A.each || 150);
        if (left() < 60000) { note(`no time left for ${ent}`); break; }
        STAGE0 = id;
        if (!(await pickByTouch(id))) { note(`PICK FAILED ${id}`); await shot(`pick-failed-${id}`, true); continue; }
        await shot(`picked-${id}`, true);
        const pT0 = await E(() => Math.round(performance.now()));
        stageT0 = Date.now(); idleLast = Date.now(); idleN = 0; lastCourseIdle = -1; gameIdle = 0; evSeen = await E(() => (window.__GAME_LOG || []).length); courseAt = null;
        if (A.census !== '0' && A.census !== 'end') await wideCensus(id, 'start');   // (PRODUCER13: --census=end skips the start's)
        await playLoop(Date.now() + secs * 1000);
        if (A.census !== '0') await wideCensus(id, 'end');
        if (A.endShot !== '0') await shot(`end-${id}`, true); walkNote(id);
        await stageReport(id, pT0);
      }
    } else if (A.stages) {   // (PRODUCER11) several stages in one run: a jump to each one's start (or --frac), then --each seconds by touch
      for (const ent of String(A.stages).split(',')) {   // an entry: id[@frac][:seconds]
        const m = ent.match(/^(\w+)(?:@([\d.]+))?(?::(\d+))?$/); if (!m) { note(`bad stage entry "${ent}"`); continue; }
        const id = m[1], fr = m[2] != null ? +m[2] : A.frac != null ? +A.frac : null, secs = m[3] != null ? +m[3] : +(A.each || 150);
        if (left() < 60000) { note(`no time left for ${ent}`); break; }
        await doJump({ stage: id, ...(fr != null ? { frac: fr } : {}) }, A.jumpReload === '1');
        await playLoop(Date.now() + secs * 1000);
        if (A.endShot !== '0') await shot(`end-${id}`, true); walkNote(id);
      }
    } else await playLoop(Infinity);
    await shot('end', true); walkNote(null);
    await dumpGlog(true);
    if (A.reloadEnd) {
      await pg.reload(); await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
      const tr = Date.now(); for (const at of [2000, 6000, 10000]) { await wait(Math.max(0, at - (Date.now() - tr))); await shot(`reload-${at / 1000}s`, true); }
    }
    log.end = await st();
    note(`end ${JSON.stringify(log.end)} · errors ${log.errors.length} ${log.errors.slice(0, 2).join(' | ')}`);
    const k80 = log.shots.filter((r) => r.k80 === '✓').length, k80n = log.shots.filter((r) => r.k80 && r.k80[0] === '✗').length;
    note(`K80 (the kohen ≥ 80 px and in frame, world shots): ✓ ${k80} · ✗ ${k80n} [${log.shots.filter((r) => r.k80 && r.k80[0] === '✗').map((r) => path.basename(r.f).replace(/\.png$/, '') + ':' + r.k80.slice(2)).join(', ')}] · (overlay shots not counted: ${log.shots.filter((r) => r.k80 === 'overlay').length})`);
    note(`COURSES ${JSON.stringify((log.courses || []).map((c) => `${c.id}:${c.c}/${c.of} by ${c.by}${c.toast ? ' ✓toast' : ' NO-TOAST'}`))} · BEATS ${JSON.stringify((log.beats || []).map((b) => `${b.id}${b.f ? ':' + path.basename(b.f) : ' late ' + b.late}`))} · games ${JSON.stringify((log.mgStart || []).map((g) => g.kind + (g.check ? '/' + g.check : '') + (g.site ? '@' + g.site : '')))}`);
    const seenH = log.hero.filter((h) => h.on && !h.hidden && h.px >= 10).length;
    note(`kohen seen while idle: ${seenH}/${log.hero.length} checks · off ${log.hero.filter((h) => !h.on).length} · hidden ${log.hero.filter((h) => h.hidden).length} · tiny ${log.hero.filter((h) => h.on && h.px < 10).length}`);
  } catch (e) { console.error('RUN ERROR', e.message); log.fatal = e.message; }
  finally {
    fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(log, null, 1));
    await ctx.close();
  }
})();
