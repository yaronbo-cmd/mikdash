// PRODUCER15 (wave 15, the Gardenscapes loop): her first minutes by REAL TOUCH at 390×844 on a fresh save — the big "שחק ▶",
// the level (played by its pixels, as produce-play plays the board), the ★, "משימות", a card's "בצע", the task's scene (watched;
// skipped by a tap when it runs long), the quiz and the games under "עוד דרכים לכוכב". Buttons are found by their WORDS (the
// agents' selectors are not known in advance); the state is READ, never written (★ from G.meta.stars, coins from G.res.silver).
//   node test/produce-stars15.cjs --tag=v28a [--url=file:///…] [--fresh] [--budget=575] [--shots=30] [--skipAfter=12]
//        [--quizEvery=3] [--gameEvery=0] [--watchAll] [--name=אהרן]
// Output: test/out/produce/<tag>-NN-<step>.png, <tag>-log.json (every step with its page-clock time), <tag>-glog.json (the game's
// own event log), and a summary: the time to the first ★ and the first task done, ★ a minute, levels won/lost, scenes (length,
// skipped, K80 at ~1.5 s in), quiz results, waits ≥ 8 s with nothing to tap, the words on every card (טיוטה / source / המחשה).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const TAG = A.tag || 'stars';
let URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html');
if (/^file:\/\//.test(URL0) && A.pin !== '0') { try { const src = URL0.replace(/^file:\/\//, ''), dst = path.join(ROOT, 'test/out/produce/builds', `run-${TAG}.html`); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); URL0 = 'file://' + dst; } catch (e) { console.log('build pin: ' + e.message); } }
const BUDGET = +(A.budget || 575) * 1000, SHOTS = +(A.shots || 30), NAME = A.name || 'אהרן';
const SKIP_AFTER = +(A.skipAfter || 12) * 1000, QUIZ_EVERY = +(A.quizEvery || 3), GAME_EVERY = +(A.gameEvery || 0);
const PROFILE = path.resolve(A.profile || path.join(ROOT, 'test/out/produce/profile-' + TAG.replace(/-.*/, '')));
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
if (A.fresh) fs.rmSync(PROFILE, { recursive: true, force: true }); fs.mkdirSync(PROFILE, { recursive: true });
const W = 390, H = 844, T0 = Date.now();
const left = () => BUDGET - (Date.now() - T0), sec = () => Math.round((Date.now() - T0) / 1000);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'], viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const log = { tag: TAG, url: URL0, steps: [], shots: [], cards: [], levels: [], scenes: [], quizzes: [], games: [], sheets: [], stars: [], waits: [], errors: [], small: [], deals: [] };
  try {
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = ctx.pages()[0] || await ctx.newPage();
    await pg.addInitScript((jump) => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DIALOGS = []; if (jump) window.__NO_OPENING = true; for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => { window.__DIALOGS.push(k); return null; }; }, !!A.stages);
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) log.errors.push(m.text().slice(0, 200)); });
    pg.on('pageerror', (e) => log.errors.push('PAGEERR ' + e.message.slice(0, 200)));
    await pg.goto(URL0);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    note(`booted (${A.fresh ? 'fresh profile' : 'profile kept'}) · ${URL0}`);
    const E = (fn, a) => pg.evaluate(fn, a), wait = (ms) => pg.waitForTimeout(ms);
    const draw = () => E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); });
    const now = () => E(() => Math.round(performance.now()));
    // the kohen as she sees him (produce-play's heroView): on screen? hidden? how tall (px of his 3.6 amot)?
    const heroView = (noOcc = false) => E((noOcc) => {
      const S = __T.stages, h = S && S.hero; if (!h) return null;
      __T.camera.updateMatrixWorld();
      const cam = __T.camera, P = h.position.clone(), head = P.clone(); head.y += 3.6;
      const pr = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * innerWidth, y: (1 - q.y) / 2 * innerHeight, front: q.z < 1 }; };
      const a = pr(P), b = pr(head), dist = cam.position.distanceTo(head);
      const on = a.front && b.x > 10 && b.x < innerWidth - 10 && b.y > 90 && a.y < innerHeight - 110;
      let occ = null;
      if (on && !noOcc) {
        const mine = (o) => { for (let q = o; q; q = q.parent) if (q === h) return true; return false; };
        const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
        const block = (pt) => {
          const rc = new __T.Raycaster(); const dd = cam.position.distanceTo(pt); rc.set(cam.position, pt.clone().sub(cam.position).normalize()); rc.camera = cam;
          for (const x of rc.intersectObjects(__T.scene.children, true)) {
            if (x.object.isSkinnedMesh && x.point.distanceTo(P) < 4.5) continue;
            const mt = Array.isArray(x.object.material) ? x.object.material[0] : x.object.material;
            { let sid = null; for (let q = x.object; q && !sid; q = q.parent) { const m2 = /^stage-(\w+)$/.exec(q.name || ''); if (m2) sid = m2[1]; } const STD = __T.stages._dbg && __T.stages._dbg.ST; if (sid && STD && STD[sid] && STD[sid].status === 'building' && STD[sid].U && STD[sid].U.uY && x.point.y > STD[sid].U.uY.value + 0.05) continue; }
            if (mine(x.object) || !vis(x.object) || x.object.name === 'hill' || (x.object.geometry && x.object.geometry.boundingSphere && x.object.geometry.boundingSphere.radius > 3000) || x.object.name === 'pave' || x.object.isPoints || x.object.isLine || x.object.isSprite || (mt && (mt.visible === false || mt.colorWrite === false || (mt.transparent && (mt.opacity < 0.5 || mt.depthWrite === false || mt.blending === 2)) || mt.opacity < 0.2))) continue;
            return x.distance < dd - 1.2 ? { obj: (x.object.name || x.object.type) + (x.object.parent && x.object.parent.name ? '<' + x.object.parent.name : ''), d: Math.round(x.distance) } : null;
          }
          return null;
        };
        const chest = P.clone(); chest.y += 2.2; const o1 = block(head), o2 = block(chest); if (o1 && o2) occ = o1;
      }
      return { x: Math.round(b.x), y: Math.round(b.y), px: Math.round(Math.abs(a.y - b.y)), dist: Math.round(dist), on, hidden: !!occ, occ, pos: [P.x, P.y, P.z].map(Math.round) };
    }, noOcc);
    const st = () => E(() => { const g = __T.game && __T.game.state; if (!g) return { gone: true }; const M = g.meta || null; const id = g.focus || 'har', h = g.st[id] || {}; return { id, ftue: g.ftue, p: h.done ? 'done' : h.p, set: h.set, stars: M ? M.stars : null, done: M && M.done ? Object.keys(M.done).length : null, doneIds: M && M.done ? Object.keys(M.done).slice(-3) : [], earned: M && M.earned ? M.earned : null, silver: Math.round((g.res || {}).silver || 0), stone: Math.round((g.res || {}).stone || 0), name: g.name, level: g.m3 && g.m3.level ? (typeof g.m3.level === 'object' ? JSON.stringify(g.m3.level).slice(0, 40) : g.m3.level) : null, meta: !!M }; }).catch(() => ({ gone: true }));
    let nShot = 0;
    const shot = async (name, force = false, lite = false) => {
      if (nShot >= SHOTS && !force) return null;
      await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const hv = await heroView(lite).catch(() => null);
      const f = path.join(OUT, `${TAG}-${String(++nShot).padStart(2, '0')}-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      await E(() => { window.__HUD_HOLD = false; });
      const s = await st();
      const ov = await E(() => [...document.querySelectorAll('.fx-mg, .m3, .gm-modal.on, .gm-sheet.on, .gm-sh.on, .gm-mo.on, .g10, [data-g10], .gm-quiz, .mt-sheet, .mt-tasks')].some((x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.height > 60 && r.width > 60 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; })).catch(() => false);
      const k80 = !hv ? 'no-hero' : ov ? `overlay (${hv.on && !hv.hidden && hv.px >= 80 ? '✓' : hv.px + 'px'})` : hv.on && !hv.hidden && hv.px >= 80 ? '✓' : `✗ ${!hv.on ? 'OFF-FRAME' : hv.hidden ? 'HIDDEN(' + hv.occ.obj + ')' : hv.px + 'px'}`;
      const rec = { f: path.relative(ROOT, f), t: sec(), s: `${s.id}:${s.p}/${s.set} ★${s.stars} done${s.done} ◎${s.silver}`, hero: hv, k80 };
      log.shots.push(rec); note(`SHOT ${path.basename(f)} · K80 ${k80} · ${rec.s} · hero ${hv && `${hv.on ? 'on' : 'OFF'}${hv.hidden ? ' HIDDEN(' + hv.occ.obj + ')' : ''} ${hv.px}px d${hv.dist}`}`);
      return f;
    };
    const tap = async (x, y, why) => { await draw(); await pg.touchscreen.tap(x, y); log.steps.push({ t: sec(), pt: await now().catch(() => 0), x: Math.round(x), y: Math.round(y), why }); if (why) note(`tap (${x | 0},${y | 0}) ${why}`); };
    // a visible button by its words (the biggest), anywhere; [w×h] logged, < 44 px flagged
    const findBtn = (re, within) => E(([re, within]) => {
      const R = new RegExp(re); const root = within ? [...document.querySelectorAll(within)].find((x) => x.getBoundingClientRect().height > 30) : document;
      if (!root) return null;
      const vis = (x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.3 && !x.disabled && x.getAttribute('aria-disabled') !== 'true'; };
      const cands = [...root.querySelectorAll('button, [role=button], a, .gm-btn, .gm-big, .gm-chip, .gm-pill, [data-a]')].concat(root !== document && root.matches && root.matches('button, [role=button], .gm-pill, .gm-big, .gm-btn, [data-a]') ? [root] : []).filter((x) => vis(x) && R.test((x.innerText || x.getAttribute('aria-label') || '').replace(/\s+/g, ' ')));
      const leaf = cands.filter((b) => !cands.some((o) => o !== b && b.contains(o)));
      const b = leaf.sort((p, q) => q.getBoundingClientRect().width * q.getBoundingClientRect().height - p.getBoundingClientRect().width * p.getBoundingClientRect().height)[0]; if (!b) return null;
      const e = document.elementFromPoint(b.getBoundingClientRect().left + b.getBoundingClientRect().width / 2, b.getBoundingClientRect().top + b.getBoundingClientRect().height / 2);
      const r = b.getBoundingClientRect(); const cov = !!(e && !b.contains(e) && !e.contains(b)); const desc = (x) => { let o = x, path = []; for (let q = 0; o && q < 4; q++, o = o.parentElement) path.push((o.tagName || '').toLowerCase() + (o.className && typeof o.className === 'string' ? '.' + o.className.trim().replace(/\s+/g, '.') : '') + (o.dataset && o.dataset.a ? `[${o.dataset.a}]` : '')); return path.join(' < '); }; return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), t: (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60), a: b.dataset.a || '', covered: cov, cover: cov ? desc(e).slice(0, 160) : '' };
    }, [re.source, within || null]).catch(() => null);
    const tapBtn = async (re, why, within) => { const b = await findBtn(re, within); if (!b) return null; if (b.w < 44 || b.h < 44) { const k = `${b.t} ${b.w}×${b.h}`; if (!log.small.includes(k)) log.small.push(k); } if (b.covered) note(`(the button "${b.t}" is covered at its centre)`); await tap(b.x, b.y, `${why} "${b.t}" [${b.w}×${b.h}]`); return b; };
    const modalText = () => E(() => { const m = document.querySelector('.gm-modal.on .gm-card, .gm-modal.on'); return m ? m.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : null; });
    const tapModal = async () => (await tapBtn(/./, 'card', '.gm-modal.on .gm-btn-gold')) || (await tapBtn(/./, 'card (its only button)', '.gm-modal.on'));
    // the game's events since the last read: ★ earned, spends, scenes, levels, quizzes (whatever the agents log; names guessed widely)
    let evSeen = 0; const evs = [];
    const pullEv = async () => { const r = await E((k) => { const L = window.__GAME_LOG || []; return { n: L.length, out: L.slice(k).map((e) => { const dd = e.d != null ? e.d : e.detail; return { t: Math.round(e.t), type: e.type, d: (() => { try { return dd && typeof dd === 'object' ? JSON.parse(JSON.stringify(dd)) : dd; } catch (x) { return String(dd); } })() }; }) }; }, evSeen).catch(() => null); if (!r) return []; evSeen = r.n; for (const e of r.out) { evs.push(e); if (/star|spend|task|scene|level|quiz|meta|m3|win|lose|boost|ftue/i.test(e.type)) note(`EV ${e.t} ${e.type} ${JSON.stringify(e.d).slice(0, 140)}`); } return r.out; };
    const dumpGlog = () => { try { fs.writeFileSync(path.join(OUT, `${TAG}-glog.json`), JSON.stringify({ wall0: T0, steps: log.steps, ev: evs })); } catch (e) { /* */ } };
    // the words of what is on screen, read once per text (a card, a bubble, a toast)
    const seenText = new Set();
    const readCard = async (kind, txt, extra) => { const k = txt.slice(0, 50); if (seenText.has(k)) return false; seenText.add(k); const rec = { t: sec(), kind, txt: txt.slice(0, 400), tiyuta: /טיוטה/.test(txt), src: /\(([^)]*(?:מדות|יוספוס|קדמוניות|מלחמת|משנה|רמב|תמיד|יומא|שקלים|מידות|זכריה|ארכאולוג|מזר|תהלים|מלכים|דברי הימים|עזרא|נחמיה)[^)]*)\)/.exec(txt), illus: /המחשה/.test(txt), ...extra }; rec.src = rec.src ? rec.src[1] : null; log.cards.push(rec); note(`${kind.toUpperCase()}: "${txt.slice(0, 220)}"${rec.tiyuta ? ' [טיוטה]' : ''}${rec.src ? ' [src: ' + rec.src + ']' : ''}${rec.illus ? ' [המחשה]' : ''}`); return true; };
    // ── the level: produce-play's pixel player (a greedy child: the swap that makes the longest line, by two real taps) ──
    const playBoard = async () => {
      const mv = () => E(() => +((document.querySelector('.m3-moves b') || {}).textContent || NaN));
      await wait(1200); const rec = { t: sec(), pt: await now() }; log.levels.push(rec);
      const card = await E(() => { const c = document.querySelector('.m3 .m3-card'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').slice(0, 200) : null; });
      rec.card = card; if (card) { await readCard('level-card', card); if (log.levels.length <= 2) await shot(`level${log.levels.length}-card`, true, true); const b = await tapBtn(/./, 'the level: its card', '.m3 .m3-card'); if (!b) await tapBtn(/./, 'the level: a button', '.m3'); await wait(1500); }
      const hbh = await pg.$('.m3 .m3-hit'); const hb = hbh ? await hbh.boundingBox() : null;
      if (!hb) { rec.noBoard = true; note('LEVEL: no .m3-hit board to play'); await shot('level-noboard', true, true); return rec; }
      if (log.levels.length === 1) await shot('level1-open', true, true);
      const NC = +(A.cols || 8), NR = Math.max(5, Math.min(11, Math.round(hb.height / (hb.width / NC))));
      const cs = Math.floor(Math.min(hb.width / NC, hb.height / NR)), ox = hb.x + (hb.width - cs * NC) / 2, oy = hb.y + (hb.height - cs * NR) / 2;
      rec.grid = `${NC}×${NR} cell ${cs}px`; rec.moves0 = await mv();
      let ok = 0, tried = 0, noMove = 0, guessed = 0; const refused = new Set();
      const boardOn = () => E(() => { const h = document.querySelector('.m3 .m3-hit'); const c = document.querySelector('.m3 .m3-card'); return !!h && h.getBoundingClientRect().height > 50 && !(c && c.offsetParent && c.getBoundingClientRect().height > 40); });
      for (let q = 0; q < 70 && left() > 30000 && (await boardOn()); q++) {
        const grid = await E(({ ox, oy, cs, NC, NR }) => {
          const cv = document.querySelector('.m3 .m3-cv'); if (!cv) return null;
          const rr = cv.getBoundingClientRect(), sx = cv.width / rr.width, g = cv.getContext('2d'); const sig = [];
          for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) {
            const x0 = Math.round((ox + (c + 0.18) * cs - rr.left) * sx), y0 = Math.round((oy + (r + 0.18) * cs - rr.top) * sx), w = Math.max(6, Math.round(cs * 0.64 * sx));
            const d = g.getImageData(x0, y0, w, w).data, v = new Array(108).fill(0), cnt = new Array(36).fill(0);
            for (let yy = 0; yy < w; yy++) for (let xx = 0; xx < w; xx++) { const z = (yy * w + xx) * 4, b2 = ((yy * 6 / w) | 0) * 6 + ((xx * 6 / w) | 0); v[b2 * 3] += d[z]; v[b2 * 3 + 1] += d[z + 1]; v[b2 * 3 + 2] += d[z + 2]; cnt[b2]++; }
            for (let k = 0; k < 108; k++) v[k] /= Math.max(1, cnt[(k / 3) | 0]); sig.push(v);
          }
          const diff = (a, b2) => { let t = 0; for (let k = 0; k < 108; k++) t += Math.abs(a[k] - b2[k]); return t / 108; };
          const reps = [], out = []; for (const v of sig) { let id = reps.findIndex((z) => diff(z, v) < 14); if (id < 0) { id = reps.length; reps.push(v); } out.push(id); } return { out, kinds: reps.length };
        }, { ox, oy, cs, NC, NR });
        if (!grid) break;
        const B = grid.out, at = (r, c) => (r < 0 || r >= NR || c < 0 || c >= NC ? -2 : B[r * NC + c]);
        const line = (X, r, c) => { const v = X[r * NC + c]; if (v < 0) return 0; let h = 1, w2 = 1; for (let z = c - 1; z >= 0 && X[r * NC + z] === v; z--) h++; for (let z = c + 1; z < NC && X[r * NC + z] === v; z++) h++; for (let z = r - 1; z >= 0 && X[z * NC + c] === v; z--) w2++; for (let z = r + 1; z < NR && X[z * NC + c] === v; z++) w2++; return Math.max(h >= 3 ? h : 0, w2 >= 3 ? w2 : 0); };
        let best = null;
        for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) { if (at(r + dr, c + dc) === -2 || refused.has(`${r},${c},${dr},${dc}`)) continue; const X = B.slice(), a = r * NC + c, b2 = (r + dr) * NC + c + dc; if (X[a] === X[b2]) continue; [X[a], X[b2]] = [X[b2], X[a]]; const sc = Math.max(line(X, r, c), line(X, r + dr, c + dc)); if (sc >= 3 && (!best || sc > best.sc || (sc === best.sc && r > best.r))) best = { r, c, dr, dc, sc }; }
        if (!best) { noMove++; if (noMove > 12) break; const pool = []; for (let r = 1; r < NR - 1; r++) for (let c = 0; c < NC - 1; c++) if (!refused.has(`${r},${c},0,1`)) pool.push({ r, c, dr: 0, dc: 1, sc: 0 }); if (!pool.length) break; best = pool[(q * 7) % pool.length]; guessed++; }
        const before = await mv(), x1 = ox + (best.c + 0.5) * cs, y1 = oy + (best.r + 0.5) * cs;
        await pg.touchscreen.tap(x1, y1); await wait(150); await pg.touchscreen.tap(x1 + best.dc * cs, y1 + best.dr * cs); tried++;
        await pg.waitForFunction((b0) => { const z = +((document.querySelector('.m3-moves b') || {}).textContent || NaN); return z !== b0 || !document.querySelector('.m3 .m3-hit'); }, before, { polling: 150, timeout: 2500 }).catch(() => {});
        if ((await mv()) !== before) { ok++; noMove = 0; } else refused.add(`${best.r},${best.c},${best.dr},${best.dc}`);
        if (ok === 6 && log.levels.length === 1) await shot('level1-playing', true, true);
        await wait(1100);
      }
      rec.tried = tried; rec.accepted = ok; rec.guessed = guessed; rec.playS = sec() - rec.t;
      await wait(1500);
      const endCard = await E(() => { const c = document.querySelector('.m3 .m3-card'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').slice(0, 240) : null; });
      rec.endCard = endCard; rec.won = endCard ? !/עוד ניסיון|נגמרו|הפסד|לא הצלח|נסה שוב/.test(endCard) && /★|כוכב|ניצח|הצלח|כל הכבוד|מעולה|יפה/.test(endCard) : null;
      if (endCard) { await readCard('level-end', endCard); if (log.levels.length <= 3) await shot(`level${log.levels.length}-end`, true, true); }
      note(`LEVEL #${log.levels.length}: ${tried} swaps (${ok} accepted, ${guessed} guesses) in ${rec.playS} s → ${rec.won == null ? 'no end card' : rec.won ? 'WON' : 'LOST'} · "${(endCard || '').slice(0, 120)}"`);
      // its end card: the gold/first button (a win: "המשך"/"★"; a loss: "עוד ניסיון")
      for (let q = 0; q < 4 && (await E(() => { const m = document.querySelector('.m3'); return !!(m && m.getBoundingClientRect().height > 50 && getComputedStyle(m).display !== 'none'); })); q++) {
        const b = (await tapBtn(/המשך|אסוף|★|עוד ניסיון|חזרה|סגור|הבא|שחק/, 'the level\'s end card', '.m3')) || (await tapBtn(/./, 'the level: its last button', '.m3 .m3-card')) || (await tapBtn(/./, 'the level: ×', '.m3 .m3-exit, .m3 .m3-x'));
        if (!b) break; await wait(1500);
        if (await E(() => { const b = [...document.querySelectorAll('.m3 button')].find((x) => x.offsetParent && /לצאת/.test(x.textContent) && !/להמשיך/.test(x.textContent)); if (b) b.dataset.qa = 'quit'; return !!b; })) { await tapBtn(/לצאת/, 'confirm: לצאת', '.m3'); await wait(1200); }
      }
      await wait(1500);
      return rec;
    };
    // ── the quiz: one question a screen, three answers; the finger picks the longest answer (a child's guess), reads the source ──
    const playQuiz = async (root) => {
      const rec = { t: sec(), q: [], right: 0, n: 0 }; log.quizzes.push(rec);
      await shot(`quiz${log.quizzes.length}-open`, true, true);
      for (let q = 0; q < 12 && left() > 20000; q++) {
        const Q = await E((root) => {
          const R = [...document.querySelectorAll(root)].find((x) => x.getBoundingClientRect().height > 60); if (!R) return null;
          const vis = (x) => { const r = x.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.bottom > 0 && r.top < innerHeight; };
          const btns = [...R.querySelectorAll('button, [role=button]')].filter(vis);
          const ans = btns.filter((b) => !/המשך|סגור|חזרה|הבא|יציאה|✕|×|דלג/.test(b.innerText) && b.innerText.trim().length > 0);
          const go = btns.find((b) => /המשך|הבא|סגור|חזרה|אסוף|★/.test(b.innerText));
          ans.forEach((b, i) => { b.dataset.qaAns = String(i); });
          return { star: !!R.querySelector('.m3-star1'), res: !!R.querySelector('.md-res'), txt: R.innerText.replace(/\s+/g, ' ').trim().slice(0, 500), ans: ans.map((b) => ({ t: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 80), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), on: /on|sel|right|wrong|ok|bad|correct/.test(b.className) })), go: go ? go.innerText.trim().slice(0, 30) : null };
        }, root);
        if (!Q) break;
        if (Q.res || (/\d\s*(מתוך|\/)\s*5|עברת|לא עברת|סיכום/.test(Q.txt) && Q.ans.length < 2)) { rec.result = Q.txt.slice(0, 200); await readCard('quiz-end', Q.txt); await shot(`quiz${log.quizzes.length}-end`, true, true); rec.won = Q.star || /כוכב אחד/.test(Q.txt); (await tapBtn(/חזרה|סגור|המשך/, 'the quiz: חזרה', root)) || (await tapBtn(/./, 'the quiz: its end button', root)); await wait(1200); break; }
        if (Q.ans.length >= 2 && !Q.ans.some((a) => a.on)) {
          const pick = Q.ans.map((a, i) => ({ ...a, i })).sort((a, b) => b.t.length - a.t.length)[0];
          await readCard('quiz-q', Q.txt, { answers: Q.ans.map((a) => a.t) });
          for (const a of Q.ans) if (a.w < 44 || a.h < 44) { const k = `quiz answer "${a.t.slice(0, 20)}" ${a.w}×${a.h}`; if (!log.small.includes(k)) log.small.push(k); }
          const b = await E((i) => { const b = document.querySelector(`[data-qa-ans="${i}"]`); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, pick.i);
          await tap(b.x, b.y, `the quiz: answer "${pick.t.slice(0, 40)}"`); rec.n++; await wait(1500);
          const after = await E((root) => { const R = [...document.querySelectorAll(root)].find((x) => x.getBoundingClientRect().height > 60); return R ? R.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : ''; }, root);
          const right = /נכון!/.test(after) && !/התשובה:/.test(after); if (right) rec.right++;
          rec.q.push({ pick: pick.t.slice(0, 40), right, after: after.slice(0, 160) }); note(`QUIZ q${rec.n}: picked "${pick.t.slice(0, 40)}" → ${right ? 'RIGHT' : 'wrong/unknown'} · "${after.slice(0, 140)}"`);
          if (rec.n === 1) { await shot(`quiz${log.quizzes.length}-answered`, true, true); await readCard('quiz-after', after); }
          continue;
        }
        if (Q.go) { await tapBtn(new RegExp(Q.go.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'the quiz: next', root); await wait(1200); continue; }
        await wait(800);
      }
      note(`QUIZ #${log.quizzes.length}: ${rec.right}/${rec.n} right by a child's guess → ${rec.won == null ? '?' : rec.won ? 'PASSED' : 'failed'} · ${(rec.result || '').slice(0, 120)}`);
      return rec;
    };
    // ── the loop ──
    const s0 = await st(); note(`state ${JSON.stringify(s0)}`);
    if (A.fresh) { await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { polling: 200, timeout: 20000 }).catch(() => {}); await wait(1500); await shot('opening', true, true); await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, { polling: 200, timeout: 25000 }).catch(() => {}); await wait(1500); }
    let firstTap = null, lastStars = s0.stars, lastDone = s0.done, scene = null, lastKey = '', nothingSince = null, starsSinceSheet = 0, sheetAfterStar = false, starsEarned = 0, lastGlog = 0, quizN = 0, gameN = 0, dealSeen = 0, lastPill = '';
    const fromFirst = () => (firstTap == null ? null : Math.round((Date.now() - firstTap) / 1000));
    let stageT = null, holdUntil = 0, holdShot = false;
    const playLoop = async (deadline) => { nothingSince = null; lastKey = '';
    for (let k = 0; left() > 20000 && Date.now() < deadline && k < 900; k++) {
      if (Date.now() - lastGlog > 30000) { lastGlog = Date.now(); dumpGlog(); }
      const s = await st(); if (s.gone) { note('the game is gone'); await wait(1500); continue; }
      const ev = await pullEv();
      if (s.stars != null && lastStars != null && s.stars > lastStars) { starsEarned += s.stars - lastStars; const r = { t: sec(), from: fromFirst(), stars: s.stars, by: (ev.find((e) => /star|level|quiz|game/i.test(e.type)) || {}).type || '?' }; log.stars.push(r); note(`★ ${lastStars} → ${s.stars} at ${r.from} s from her first tap (${r.by})`); if (!log.firstStar) { log.firstStar = r.from; await shot('first-star', true, true); } starsSinceSheet++; sheetAfterStar = true; }
      if (s.stars != null) lastStars = s.stars;
      if (s.done != null && lastDone != null && s.done > lastDone) { const r = { t: sec(), from: fromFirst(), done: s.done, ids: s.doneIds }; (log.tasksDone = log.tasksDone || []).push(r); note(`TASK DONE #${s.done} (${s.doneIds.join(',')}) at ${r.from} s from her first tap`); if (!log.firstTask) log.firstTask = r.from; log.sheetNone = 0; log.sheetSwipes = 0; }
      if (s.done != null) lastDone = s.done;
      const key = `${s.ftue}|${s.id}|${s.p}|${s.meta}`; if (key !== lastKey) { note(`STATE ${JSON.stringify(s)}`); lastKey = key; }
      // a task's scene (SITE15): logged start → end/skip; shot ~1.5 s in for K80; a tap skips a long one (as she would)
      const sc = ev.filter((e) => /scene/i.test(e.type));
      for (const e of sc) { const at = (e.d && (e.d.at || e.d.phase)) || ''; if (/start|begin|open/.test(at) || (!scene && !/end|done|skip|close/.test(at))) { scene = { t: sec(), pt: e.t, id: e.d && (e.d.id || e.d.task), shot: false, from: fromFirst() }; log.scenes.push(scene); note(`SCENE START ${JSON.stringify(e.d).slice(0, 120)}`); } else if (scene && /end|done|skip|close/.test(at)) { scene.s = Math.round((e.t - scene.pt) / 1000); scene.end = at; note(`SCENE END ${scene.id} after ${scene.s} s (${at})`); scene = null; } }
      if (scene) holdUntil = 0;
      if (!scene && Date.now() < holdUntil && !(await modalText())) { if (!holdShot && Date.now() > holdUntil - 7000) { holdShot = true; await shot('after-do', true); } await wait(400); continue; }   // (after בצע: she watches; a tap would skip the scene)
      if (scene) {
        const lag = Date.now() - scene.t * 1000 - T0;
        if (!scene.shot && sec() - scene.t >= 1) { scene.shot = true; await wait(600); const f = await shot(`scene-${(scene.id || 'task').replace(/[^\w.]/g, '_')}`, true); scene.k80 = log.shots[log.shots.length - 1].k80; }
        if (!scene.skipped && (sec() - scene.t) * 1000 > SKIP_AFTER && !A.watchAll) { scene.skipped = true; scene.skipAt = sec() - scene.t; const b = await tapBtn(/דלג|המשך|skip/i, 'the scene: skip'); if (!b) await tap(W / 2, H * 0.5, `the scene: a tap to skip (after ${scene.skipAt} s)`); await wait(800); }
        if (sec() - scene.t > 40) { note(`SCENE ${scene.id} has no end event after 40 s: treated as over`); scene.s = 40; scene.end = 'timeout'; scene = null; }
        await wait(400); continue;
      }
      // the name prompt
      if (await pg.$('.gm-modal.on .gm-input')) { await shot('name-prompt', true, true); await tapBtn(/./, 'name field', '.gm-modal.on .gm-input') || await E(() => document.querySelector('.gm-modal.on .gm-input').focus()); await pg.keyboard.type(NAME); await wait(300); await tapModal(); await wait(1500); continue; }
      // the mentor's bubble (META15: .gm-mentor-say; a tap dismisses it; its line carries טיוטה · ref or המחשה): read once per text, then tapped as she would after reading
      const bub = await E(() => { const m = document.querySelector('.gm-mentor:not(.gm-hidden) .gm-mentor-say, .gm-mentor-say'); if (!m) return null; const r = m.getBoundingClientRect(), cs = getComputedStyle(m); if (r.width < 20 || r.height < 10 || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.3 || m.closest('.gm-hidden')) return null; return { t: m.innerText.replace(/\s+/g, ' ').trim().slice(0, 300), x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height) }; }).catch(() => null);
      if (bub && bub.t) { const fresh = await readCard('mentor', bub.t); if (fresh) { (log.mentor = log.mentor || []).push({ t: sec(), from: fromFirst(), txt: bub.t }); if ((log.mentor || []).length <= 4) await shot('mentor', true, true); await wait(+(A.readMs || 1500)); await tap(bub.x, bub.y, 'the mentor\'s bubble (read)'); await wait(900); continue; } }
      // the quiz open (any container with a question and ≥ 2 answers under a "חידון" title)
      const quizRoot = await E(() => { const vis = (x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.height > 200 && r.width > 200 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.3; }; const c = document.querySelector('.gm-modal.md-qz.on, .gm-modal.md-star.on') || [...document.querySelectorAll('.gm-quiz, .mt-quiz, [data-quiz], .quiz, .gm-modal.on')].find((x) => vis(x) && /חידון|שאלה \d+ מתוך/.test(x.innerText) && x.querySelectorAll('.md-ans, button').length >= 3 && !x.querySelector('.m3') && !x.closest('.gm-hud, .gm-meta, .gm-top')); if (!c) return null; c.dataset.qaQuiz = '1'; return '[data-qa-quiz="1"]'; }).catch(() => null);
      if (quizRoot) { if (!firstTap) firstTap = Date.now(); await playQuiz(quizRoot); await E(() => { for (const x of document.querySelectorAll('[data-qa-quiz]')) delete x.dataset.qaQuiz; }); continue; }
      // a card (the mentor's lines, the first-time flow, a task's line, a wage): read, shot once per text, its gold button
      const mt = await modalText();
      if (mt) { const fresh = await readCard('card', mt); if (fresh && log.cards.filter((c) => c.kind === 'card').length <= 8) await shot('card', false, true); if (!firstTap) firstTap = Date.now(); if (/הפסקה קצרה/.test(mt) && (await tapBtn(/אחר כך/, 'the games\' invitation: אחר כך', '.gm-modal.on'))) { await wait(700); continue; } await tapModal(); await wait(900); continue; }
      // the level open
      if (await E(() => { const m = document.querySelector('.m3'); return !!(m && m.getBoundingClientRect().height > 50 && getComputedStyle(m).display !== 'none' && getComputedStyle(m).visibility !== 'hidden'); })) { if (!firstTap) firstTap = Date.now(); await playBoard(); continue; }
      // a precision game / a key moment / an in-between game left open by the old loop or by a task: closed by its own button (logged)
      const old = await E(() => ({ mg: !!document.querySelector('.fx-mg'), mo: !!document.querySelector('.gm-mo.on'), g10: !!(document.querySelector('.g10') && document.querySelector('.g10').getBoundingClientRect().height > 50), deal: !!document.querySelector('.gm-deal.on') }));
      if (old.deal) { dealSeen++; const d = await E(() => (document.querySelector('.gm-deal.on') || {}).innerText.replace(/\s+/g, ' ').slice(0, 200)); if (dealSeen <= 3) { note(`DEAL "מה נעשה עכשיו?" #${dealSeen} at ${fromFirst()} s: "${d}"`); log.deals.push({ t: sec(), from: fromFirst(), d }); await shot(`deal${dealSeen}`, true, true); }
        if (A.dealPick) {   // (add mode: v27's deal is the path — she picks a card: --dealPick=tread → גלגל הדריכה first, else "חדש", else the first)
          const want = A.dealPick === 'tread' ? /גלגל הדריכה/ : new RegExp(A.dealPick); const cards = await E(() => { const R = document.querySelector('.gm-deal.on'); const all = [...R.querySelectorAll('button, [role=button]')].filter((b) => b.getBoundingClientRect().height >= 60); all.forEach((b, i) => { b.dataset.qaDeal = String(i); }); return all.map((b, i) => ({ i, t: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 60), job: b.dataset.job || '' })); });
          const pick = cards.find((c) => want.test(c.t) || want.test(c.job)) || cards.find((c) => /חדש/.test(c.t)) || cards[0];
          if (pick) { (log.dealPicks = log.dealPicks || []).push({ t: sec(), from: fromFirst(), pick: pick.t }); await tapBtn(/./, `the deal: "${pick.t.slice(0, 40)}"`, `[data-qa-deal="${pick.i}"]`); await wait(1500); continue; }
        }
        await tapBtn(/✕|×|סגור/, 'the deal: ✕', '.gm-deal.on') || await tap(W / 2, 120, 'outside the deal'); await wait(900); continue; }
      if (old.mg) { const g = await E(() => { const w = document.querySelector('.fx-mg'); return { kind: w.dataset.kind, title: ((w.querySelector('.fx-mg-top') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 80), done: w.classList.contains('done'), how: !!w.querySelector('.fx-mg-how:not([hidden])') }; }); const gr = log.games.find((x) => x.kind === g.kind && !x.closed) || (() => { const r = { t: sec(), kind: g.kind, title: g.title, taps: 0 }; log.games.push(r); note(`JOB GAME open: ${g.kind} "${g.title}"`); return r; })(); if (gr.taps === 0) await shot(`job-${g.kind}`, true, true); if (g.done) { await tapBtn(/./, 'the job: המשך', '.fx-mg .fx-go'); gr.closed = true; gr.s = sec() - gr.t; await wait(900); continue; } if (g.how) { await tapBtn(/./, 'the how-to', '.fx-mg .fx-mg-how') || await tap(W / 2, H * 0.6, 'the how-to'); await wait(400); continue; } if (sec() - gr.t > 40) { note(`JOB ${g.kind}: not ended by my hand in 40 s → דלג`); gr.skipped = true; gr.closed = true; await tapBtn(/דלג/, 'the job: דלג', '.fx-mg') || await tapBtn(/./, 'the job: a button', '.fx-mg button'); await wait(1200); continue; } const cv = await (await pg.$('.fx-mg canvas'))?.boundingBox(); const cue = await E(() => { const w = document.querySelector('.fx-mg'); try { const c = w.__mg && w.__mg.cue ? w.__mg.cue() : null; return Array.isArray(c) ? c[0] : c; } catch (e) { return null; } });
        if (cue && (cue.hold != null || cue.press != null || (cue.btn && cue.down != null))) {   // a hold button (tread.js's feet): held by real touch until the hand lets go
          const id = cue.hold != null && cue.hold !== true ? cue.hold : cue.press != null ? cue.press : cue.btn; if (cue.down === false || cue.now === false) { await wait(60); continue; }
          const hb = await pg.$(`.fx-mg [data-b="${id}"]`); const bb = hb ? await hb.boundingBox() : null; if (!bb) { await wait(150); continue; }
          const cdp = await ctx.newCDPSession(pg); const pt = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] }); const th = Date.now(); const holdMs = cue.ms ? Math.min(6000, +cue.ms) : 6000;
          while (Date.now() - th < holdMs) { const c2 = await E(() => { const w = document.querySelector('.fx-mg'); if (!w || w.classList.contains('done')) return { end: true }; try { return { c: w.__mg && w.__mg.cue ? w.__mg.cue() : null }; } catch (e) { return { c: null }; } }); const cc = c2.c && (Array.isArray(c2.c) ? c2.c[0] : c2.c); if (c2.end || (!cue.ms && (!cc || cc.down === false || ((cc.hold != null && cc.hold !== true ? cc.hold : cc.press != null ? cc.press : cc.btn) !== id)))) break; await wait(50); }
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); gr.taps++; (gr.holds = (gr.holds || 0) + 1);
          if (gr.holds === 2 || gr.holds === 8) { const f = await shot(`job-${g.kind}-hold${gr.holds}`, true); (gr.shots = gr.shots || []).push(f && path.basename(f)); }
          continue; }
        if (cue && typeof cue.x === 'number' && cv) { if (cue.now === false && cue.timed !== false) { await wait(60); continue; } await pg.touchscreen.tap(cv.x + cue.x * cv.width, cv.y + cue.y * cv.height); gr.taps++; } else if (cue && cue.btn) { await tapBtn(/./, '', `.fx-mg [data-b="${cue.btn}"]`); gr.taps++; } else if (cv) { await pg.touchscreen.tap(cv.x + cv.width / 2, cv.y + cv.height * 0.55); gr.taps++; } await wait(cue ? 250 : 900); continue; }
      if (old.mo) { const m = await E(() => { const w = document.querySelector('.gm-mo.on'); const tx = (q) => ((w.querySelector(q) || {}).innerText || '').replace(/\s+/g, ' ').trim(); const e = w.querySelector('.gm-mo-end'); return { t: tx('.gm-mo-t'), hint: tx('.gm-mo-hint'), end: !!(e && !e.hidden), src: tx('.gm-mo-src') }; }); if (!log.moment || log.moment.t !== m.t) { log.moment = { t: m.t, at: sec() }; note(`MOMENT "${m.t}" · "${m.hint}"`); await shot('moment-open', true, true); } if (m.end) { await readCard('moment-end', `${m.hint} ${m.src}`); await tapBtn(/./, 'moment: המשך', '.gm-mo.on .gm-mo-go'); await wait(1200); continue; } if (sec() - log.moment.at > 30) { await tapBtn(/./, 'moment: דלג', '.gm-mo.on .gm-mo-skip'); await wait(1200); continue; } const bt = await E(() => { const b = [...document.querySelectorAll('.gm-mo.on .gm-mo-play [role=button], .gm-mo.on .gm-mo-hold')].find((x) => x.getBoundingClientRect().width > 4 && !x.classList.contains('done') && !x.dataset.qaTapped); if (!b) return null; b.dataset.qaTapped = '1'; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); if (bt) { await tap(bt.x, bt.y, 'moment: a button'); await wait(700); } else await wait(1000); continue; }
      if (old.g10) { const g = await E(() => { const x = document.querySelector('.g10'); return { game: x.dataset.game || '', txt: x.innerText.replace(/\s+/g, ' ').slice(0, 160), res: !!(document.querySelector('.g10-result') && document.querySelector('.g10-result').offsetParent) }; }); const gr = log.games.find((x) => x.kind === 'g10:' + g.game && !x.closed) || (() => { const r = { t: sec(), kind: 'g10:' + g.game, title: g.txt.slice(0, 60), taps: 0 }; log.games.push(r); note(`PERIOD GAME open: ${g.game} "${g.txt.slice(0, 100)}"`); return r; })(); if (gr.taps === 0) await shot(`game-${g.game || 'x'}`, true, true); if (g.res) { const r = await E(() => document.querySelector('.g10-result').innerText.replace(/\s+/g, ' ').slice(0, 200)); gr.result = r; await readCard('game-end', r); await tapBtn(/./, 'the game: its result button', '.g10-result button[data-v="close"], .g10-result button'); gr.closed = true; gr.s = sec() - gr.t; await wait(1200); continue; } if (sec() - gr.t > 60) { gr.closed = true; gr.s = 60; await tapBtn(/./, 'the game: ✕', '.g10 .g10-x'); await wait(900); const c = await tapBtn(/לצאת|כן|חזרה/, 'confirm', '.g10'); await wait(900); continue; } const go = await tapBtn(/^(התחל|לבד)/, `the game (${g.game}): go`, '.g10'); if (go) { await wait(900); continue; } const tg = await E(() => { const c = document.querySelector('.g10 canvas'); const b = [...document.querySelectorAll('.g10 button, .g10 [role=button]')].filter((x) => x.offsetParent && !/g10-x/.test(x.className)); const x = b.sort((p, q) => q.getBoundingClientRect().width * q.getBoundingClientRect().height - p.getBoundingClientRect().width * p.getBoundingClientRect().height)[0] || c; if (!x) return null; const r = x.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); if (tg) { await pg.touchscreen.tap(tg.x, tg.y); gr.taps++; } await wait(900); continue; }
      // the tasks sheet open: read every card (name, ★ cost, open/locked, "waits for"), tap the first affordable "בצע"; else close
      const sheet = await E(() => {
        const vis = (x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.height > 80 && r.width > 200 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.3; };
        const R = [...document.querySelectorAll('.gm-sheet.on, .gm-sh.on, .mt-tasks, .mt-sheet, [data-tasks], .gm-modal.on')].find((x) => vis(x) && /משימות/.test(x.innerText) && /בצע|הצוות יעשה|אני אעשה/.test(x.innerText) && x.getBoundingClientRect().top < innerHeight - 120); if (!R) return null;
        R.dataset.qaSheet = '1';
        const btns = [...R.querySelectorAll('button, [role=button]')].filter((b) => b.getBoundingClientRect().height > 10);
        const dos = btns.filter((b) => /^\s*(בצע|הצוות יעשה|אני אעשה)/.test(b.innerText) || b.dataset.a === 'metaDo');
        dos.forEach((b, i) => { b.dataset.qaDo = String(i); });
        const cards = dos.map((b, i) => { const card = b.closest('.task, .mt-task, .gm-task, li, .card, [data-task]') || b.parentElement.parentElement; const r = b.getBoundingClientRect(); const t = (card ? card.innerText : b.innerText).replace(/\s+/g, ' ').trim(); return { i, id: b.dataset.task || (card && card.dataset ? card.dataset.task : '') || '', btn: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 20), me: /אני אעשה/.test(b.innerText), love: !!(card && card.querySelector('.gm-love')), t: t.slice(0, 120), w: Math.round(r.width), h: Math.round(r.height), off: b.disabled || b.getAttribute('aria-disabled') === 'true' || /\boff\b|dis|lock/.test(b.className) || /\boff\b|dis|lock/.test(card ? card.className : ''), stars: (t.match(/★+/g) || []).sort((a, b2) => b2.length - a.length)[0] || '', need: /חסר ★|נעול|אחרי:|ממתין|קודם/.test(t), bottom: Math.round(r.bottom) }; });
        const x = btns.find((b) => /✕|×|סגור/.test(b.innerText) || /gm-x|close/.test(b.className)); if (x) x.dataset.qaX = '1';
        return { title: R.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), cards, hasX: !!x, h: Math.round(R.getBoundingClientRect().height), done: [...R.querySelectorAll('.gm-task.done, .gm-task[data-state="done"], .gm-task.is-done')].map((c) => c.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)), txt: R.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) };
      }).catch(() => null);
      if (sheet) {
        const rec = { t: sec(), from: fromFirst(), stars: s.stars, cards: sheet.cards, title: sheet.title.slice(0, 80) }; log.sheets.push(rec);
        if (sheet.done.length || /הושלם|✓/.test(sheet.txt)) note(`TASKS SHEET done marks: ${sheet.done.join(' | ') || (sheet.txt.match(/[^.]{0,30}(הושלם|✓)[^.]{0,30}/g) || []).slice(0, 3).join(' | ')}`);
        note(`TASKS SHEET (★${s.stars}): ${sheet.cards.map((c) => `[${c.id || c.t.slice(0, 40)} ${c.stars}${c.love ? ' ❤️' : ''} "${c.btn}" ${c.off ? 'OFF' : c.need ? 'needs' : 'open'} ${c.w}×${c.h}]`).join(' ')}`);
        if (log.sheets.length <= 3) await shot(`tasks${log.sheets.length}`, true, true);
        for (const c of sheet.cards) { if (c.w < 44 || c.h < 44) { const k = `בצע "${c.t.slice(0, 20)}" ${c.w}×${c.h}`; if (!log.small.includes(k)) log.small.push(k); } await readCard('task-card', c.t); }
        const ok = sheet.cards.filter((c) => !c.off && !c.need && c.bottom < H - 10);
        const can = (A.me && !log.meTried && ok.find((c) => c.me)) || ok.find((c) => !c.me) || ok[0];
        if (can && can.me) log.meTried = true;
        if (can) { if (!firstTap) firstTap = Date.now(); rec.pick = can.t.slice(0, 60); await tapBtn(/./, `בצע on "${can.t.slice(0, 40)}"`, `[data-qa-do="${can.i}"]`); holdUntil = Date.now() + +(A.watchMs || 9000); holdShot = false; await wait(1500); sheetAfterStar = false; starsSinceSheet = 0; await E(() => { for (const x of document.querySelectorAll('[data-qa-sheet],[data-qa-x]')) { delete x.dataset.qaSheet; delete x.dataset.qaX; } }); continue; }
        const below = sheet.cards.filter((c) => c.bottom >= H - 10);
        if (below.length && !(log.sheetBelow || 0)) { log.sheetBelow = 1; note(`TASKS SHEET: ${below.length} of ${sheet.cards.length} cards lie below the screen's bottom (${below.map((c) => c.bottom).join(',')}) → she drags the sheet up`); await shot('tasks-below-fold', true, true); }
        if (below.length && (log.sheetSwipes || 0) < 3) { log.sheetSwipes = (log.sheetSwipes || 0) + 1; const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: Math.max(300, Math.min(H - 60, below[0].bottom - 200)), yDistance: -320, speed: 800, gestureSourceType: 'touch', repeatCount: 1 }).catch((e) => note('swipe: ' + e.message)); await cdp.detach().catch(() => {}); log.steps.push({ t: sec(), why: 'the sheet: a swipe up' }); await wait(1200); continue; }
        if (A.levelFromSheet && !log.levelFromSheet) { const pb = await findBtn(/שחק\s*▶|▶\s*שחק|^שחק/, '[data-qa-sheet="1"]'); if (pb) { log.levelFromSheet = true; await tap(pb.x, pb.y, `the sheet's "${pb.t}" [${pb.w}×${pb.h}]`); await wait(2000); continue; } }
        rec.none = true; log.sheetNone = (log.sheetNone || 0) + 1; note(`TASKS SHEET: nothing she can afford/do yet → closed${log.sheetNone > 2 ? ' (×' + log.sheetNone + ')' : ''}`);
        sheetAfterStar = false; starsSinceSheet = 0;
        if (log.sheetNone > 2 && log.sheetNone % 3 === 0) { await wait(2500); const pb = await findBtn(/שחק\s*▶|▶\s*שחק|^שחק/); if (pb && !pb.covered) { await tap(pb.x, pb.y, 'שחק ▶ (the sheet would not go)'); await wait(2000); continue; } }
        if (!(await tapBtn(/./, 'the tasks: ✕', '[data-qa-x="1"]'))) { if (!(await tapBtn(/✕|×|סגור|חזרה/, 'the tasks: close'))) await tap(W / 2, 60, 'outside the sheet'); }
        await E(() => { for (const x of document.querySelectorAll('[data-qa-sheet],[data-qa-x]')) { delete x.dataset.qaSheet; delete x.dataset.qaX; } });
        await wait(1200); continue;
      }
      // any other sheet with a big button (the old loop's) or an ✕
      const big = await findBtn(/./, '.gm-sheet.on .gm-big, .gm-sh.on .gm-big');
      if (big) { await tap(big.x, big.y, `sheet big "${big.t}" [${big.w}×${big.h}]`); await wait(1500); continue; }
      if (await E(() => !!document.querySelector('.gm-sheet.on, .gm-sh.on'))) { const t = await E(() => (document.querySelector('.gm-sheet.on, .gm-sh.on') || {}).innerText.replace(/\s+/g, ' ').slice(0, 160)); await readCard('sheet', t); await tapBtn(/./, 'a sheet: ✕', '.gm-sheet.on .gm-x, .gm-sh.on .gm-x') || await tap(W / 2, 60, 'outside the sheet'); await wait(1000); continue; }
      // ── home ──
      const tasksBtn = await findBtn(/משימות/), playBtn = await findBtn(/שחק\s*▶|▶\s*שחק|^שחק|שלב\s*\d+/), quizBtn = await findBtn(/חידון/), gamesBtn = await findBtn(/משחקי התקופה|משחקים/);
      if (!log.home && (tasksBtn || playBtn)) { log.home = { t: sec(), tasks: tasksBtn, play: playBtn, quiz: quizBtn, games: gamesBtn }; note(`HOME: play ${JSON.stringify(playBtn)} · tasks ${JSON.stringify(tasksBtn)} · quiz ${JSON.stringify(quizBtn)} · games ${JSON.stringify(gamesBtn)}`); await shot('home', true); }
      const badge = tasksBtn ? ((tasksBtn.t.match(/\d+/) || [])[0] || null) : null;
      if (tasksBtn && !log.sheetOnce && (dealSeen >= 1 || (log.mentor || []).length >= 1) && !(await E(() => !!document.querySelector('.gm-deal.on, .fx-mg, .gm-modal.on')))) { log.sheetOnce = true; await tapBtn(/משימות/, `משימות (once, after the first deal${badge ? ', badge ' + badge : ''})`); await wait(1500); continue; }
      if (tasksBtn && (sheetAfterStar || (badge && +badge > 0) || (starsSinceSheet === 0 && lastDone === 0 && s.stars > 0))) { await tapBtn(/משימות/, `משימות${badge ? ' (badge ' + badge + ')' : ''}`); if (!firstTap) firstTap = Date.now(); await wait(1500); continue; }
      if (quizBtn && QUIZ_EVERY && starsEarned >= 1 && quizN < Math.floor(starsEarned / QUIZ_EVERY) + 1 && quizN < 2) { quizN++; await tapBtn(/חידון/, 'עוד דרכים לכוכב: חידון'); await wait(1800); continue; }
      if (gamesBtn && GAME_EVERY && starsEarned >= 1 && gameN < Math.floor(starsEarned / GAME_EVERY) && gameN < 1) { gameN++; await tapBtn(/משחקי התקופה|משחקים/, 'עוד דרכים לכוכב: משחקים'); await wait(1800); continue; }
      if (playBtn) { if (!firstTap) firstTap = Date.now();
        if (playBtn.covered) { log.playCovered = (log.playCovered || 0) + 1; if (log.playCovered <= 2) { note(`PLAY COVERED: "${playBtn.t}" has something over its centre: ${playBtn.cover}`); await shot('play-covered', true, true); }
          // she taps the ✕ of whatever lies over it (an empty sheet), then the button
          if (log.playCovered % 2 === 1) { const x = await findBtn(/./, '.gm-sheet.on .gm-x, .gm-sh.on .gm-x, .gm-deal.on .gm-x'); if (x) { await tap(x.x, x.y, 'the cover\'s ✕'); await wait(900); continue; } } }
        await tapBtn(/שחק\s*▶|▶\s*שחק|^שחק|שלב\s*\d+/, 'שחק ▶'); await wait(2000); nothingSince = null; continue; }
      // v27's world (no meta loop on this build): the pointer / the pill, so the baseline still plays; logged as the old loop
      const m = await E(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return t ? { x: +t[1], y: +t[2] } : null; });
      const pill = await findBtn(/./, '.gm-pill');
      if (m && m.x > 20 && m.x < W - 20 && m.y > 100 && m.y < H - 130) { if (!firstTap) firstTap = Date.now(); await tap(m.x, m.y, 'the old loop: the pointer'); await wait(1300); continue; }
      if (pill) { if (pill.t !== lastPill) { lastPill = pill.t; await readCard('pill', pill.t); } await tap(pill.x, pill.y, `the old loop: the pill "${pill.t.slice(0, 40)}"`); await wait(1500); continue; }
      // nothing to tap: a wait she feels (≥ 8 s logged as a wait)
      if (!nothingSince) { nothingSince = sec(); await shot('nothing-to-tap', false, true); }
      else if (sec() - nothingSince >= 8 && !log.waits.some((w) => w.t === nothingSince)) { log.waits.push({ t: nothingSince, from: fromFirst(), s: sec() - nothingSince }); note(`WAIT: nothing to tap for ${sec() - nothingSince} s`); }
      log.steps.push({ t: sec(), why: 'nothing to tap' }); await wait(1500);
    }
    };
    // (PRODUCER15) --stages=har:90,wall:90,…  the seed's jump (the state written ONCE per stage, logged): the stages before it done
    // (content.js STAGES order), this one at its start (or @frac), materials for the old loop, and ★ 25 for the new one (G.meta
    // when it exists) — then the save reopens as a returning player's and everything is by touch: her tasks, their scenes (K80)
    const STG = (() => { try { return [...fs.readFileSync(path.join(ROOT, 'src/game/content.js'), 'utf8').matchAll(/^\s*S\('(\w+)', '([^']+)', (\d), \[([^\]]*)\], (\d+)/gm)].map((m) => ({ id: m[1], n: m[2], ch: +m[3], W: +m[5] })); } catch (e) { return []; } })();
    const doJump = async (id, frac) => {
      for (let q = 0; q < 6; q++) { const open = await E(() => ({ mg: !!document.querySelector('.fx-mg'), mo: !!document.querySelector('.gm-mo.on'), md: !!document.querySelector('.gm-modal.on'), g10: !!document.querySelector('.g10'), sh: !!document.querySelector('.gm-sheet.on, .gm-sh.on'), deal: !!document.querySelector('.gm-deal.on') })); if (!Object.values(open).some(Boolean)) break; if (open.md) await tapModal(); if (open.mg) await tapBtn(/./, 'close before the jump', '.fx-mg .fx-skip, .fx-mg .fx-go, .fx-mg button'); if (open.mo) await tapBtn(/./, 'close before the jump', '.gm-mo.on .gm-mo-skip, .gm-mo.on .gm-mo-go'); if (open.g10) await tapBtn(/./, 'close before the jump', '.g10 .g10-x'); if (open.sh) await tapBtn(/./, 'close before the jump', '.gm-sheet.on .gm-x, .gm-sh.on .gm-x'); if (open.deal) await tapBtn(/./, 'close before the jump', '.gm-deal.on .gm-x'); await wait(900); }
      if (!STG.some((s) => s.id === id)) throw new Error(`jump: no stage "${id}"`);
      const wrote = await E(({ id, frac, STG, stars }) => {
        const g = __T.game.state; if (g.ftue < 99) g.ftue = 99;
        const i = STG.findIndex((s) => s.id === id), me = STG[i], before = STG.slice(0, i).map((s) => s.id);
        for (const b of before) g.st[b] = { done: true }; for (const s of STG.slice(i + 1)) delete g.st[s.id];
        g.bh = (g.bh || []).map(() => 0); g.harAcc = 1;
        const CREWS = { har: 2, wall: 3, karnot: 4 }; let crews = Math.max(1, (g.crews || []).length); for (const b of before) if (CREWS[b]) crews = Math.max(crews, CREWS[b]); g.crews = g.crews || []; while (g.crews.length < crews) g.crews.push({ at: null });
        if (before.includes('har')) { g.finds = g.finds || {}; g.finds.trumpet = 1; } if (before.includes('sorag')) { g.finds = g.finds || {}; g.finds.warning = 1; }
        if (me.ch === 4 || before.includes('karnot') || before.includes('kiyor')) g.priests = Math.max(g.priests || 0, 10);
        g.chDone = g.chDone || {}; for (const ch of [1, 2, 3, 4]) if (STG.filter((s) => s.ch === ch).every((s) => before.includes(s.id))) g.chDone[ch] = true;
        for (const [k, v] of Object.entries({ stone: 600, wstone: 600, cedar: 400, bronze: 400, gold: 300, silver: 200 })) g.res[k] = Math.max(g.res[k] || 0, v);
        if (frac != null) { g.st[me.id] = { w: Math.max(0, Math.min(1, +frac)) * me.W, ph: 1 }; g.focus = me.id; for (const c of g.crews) c.at = me.id; } else { delete g.st[me.id]; g.focus = null; for (const c of g.crews) c.at = 'quarry'; }
        let meta = 'no G.meta (the migration will make ★ from the materials)';
        if (g.meta) { g.meta.stars = (g.meta.stars || 0) + stars; g.meta.cur = null; if (g.meta.done) for (const k of Object.keys(g.meta.done)) if (!k.startsWith(me.id + '.') && !before.some((b) => k.startsWith(b + '.'))) delete g.meta.done[k]; meta = `G.meta.stars → ${g.meta.stars}`; }
        __T.game._.resync(); __T.game.save();
        try { if (__T.game.ui && typeof __T.game.ui.coach === 'function') __T.game.ui.coach(null, ''); } catch (e) { /* */ }
        return `${me.id} (${me.n}) ${frac != null ? 'at ' + frac : 'at its start'} · done before: ${before.join(',') || '—'} · ${meta}`;
      }, { id, frac, STG, stars: +(A.jumpStars || 25) });
      note(`JUMP (state written once): ${wrote}`); (log.jumps = log.jumps || []).push({ t: sec(), id, frac, wrote });
      await pg.reload(); await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 }); evSeen = 0;
      note('reloaded: the jumped save opens as a returning player\'s'); await wait(2500);
      const s1 = await st(); note(`after the jump: ${JSON.stringify(s1)}`); lastStars = s1.stars; lastDone = s1.done; stageT = { id, t: sec(), stars0: s1.stars, done0: s1.done, scenes0: log.scenes.length };
      if (A.jumpShot !== '0') await shot(`jump-${id}`, true);
    };
        if (A.stages) {
      if (A.freshFirst) { note(`fresh part: ${A.freshFirst} s as she plays (v27's flow in add mode)`); await playLoop(Date.now() + +A.freshFirst * 1000); log.freshPart = { s: +A.freshFirst, from: fromFirst(), deals: log.deals.length, picks: log.dealPicks || [], games: log.games.map((g) => `${g.kind}${g.skipped ? ' skipped' : ''} ${g.taps} taps${g.holds ? ' ' + g.holds + ' holds' : ''}`), sheets: log.sheets.length, stars: (await st()).stars }; note(`FRESH PART ${JSON.stringify(log.freshPart).slice(0, 300)}`); }
      for (const ent of String(A.stages).split(',')) {
        const m = ent.match(/^(\w+)(?:@([\d.]+))?(?::(\d+))?$/); if (!m) { note(`bad stage entry "${ent}"`); continue; }
        const id = m[1], fr = m[2] != null ? +m[2] : null, secs = m[3] != null ? +m[3] : +(A.each || 90);
        if (left() < 40000) { note(`no time left for ${ent}`); break; }
        await doJump(id, fr); firstTap = null; starsSinceSheet = 0; sheetAfterStar = true;
        await playLoop(Date.now() + secs * 1000);
        const sc = log.scenes.slice(stageT.scenes0), s2 = await st();
        const rec = { id, s: sec() - stageT.t, stars: `${stageT.stars0} → ${s2.stars}`, done: `${stageT.done0} → ${s2.done}`, scenes: sc.map((x) => `${x.id} ${x.s != null ? x.s + 's' : '?'}${x.skipped ? ' skipped' : ''} K80 ${x.k80 || '—'}`), sheets: log.sheets.filter((x) => x.t >= stageT.t).length };
        (log.stageGate = log.stageGate || []).push(rec); note(`STAGE ${id}: ${JSON.stringify(rec)}`);
        if (A.endShot !== '0') await shot(`end-${id}`, true);
      }
    } else await playLoop(Infinity);
    await shot('end', true);
    dumpGlog();
    const end = await st(); log.end = end;
    const mins = Math.max(0.1, (fromFirst() || sec()) / 60);
    const won = log.levels.filter((l) => l.won).length, lost = log.levels.filter((l) => l.won === false).length;
    const k80s = log.scenes.filter((x) => x.k80 === '✓').length;
    log.summary = { firstStar: log.firstStar == null ? '—' : log.firstStar, firstTask: log.firstTask == null ? '—' : log.firstTask, stars: end.stars, starsPerMin: +(starsEarned / mins).toFixed(2), tasksDone: end.done, levels: `${log.levels.length} (won ${won}, lost ${lost}, mean ${Math.round(log.levels.reduce((a, l) => a + (l.playS || 0), 0) / Math.max(1, log.levels.length))} s)`, scenes: `${log.scenes.length} (skipped ${log.scenes.filter((x) => x.skipped).length}, K80 ✓ ${k80s}/${log.scenes.filter((x) => x.k80).length}, mean ${Math.round(log.scenes.reduce((a, x) => a + (x.s || 0), 0) / Math.max(1, log.scenes.length))} s)`, quizzes: log.quizzes.map((q) => `${q.right}/${q.n}${q.won ? ' ★' : ''}`).join(' '), games: log.games.map((g) => `${g.kind}${g.skipped ? ' skipped' : ''}${g.result ? ' ' + g.result.slice(0, 30) : ''}`).join(' · '), waits: log.waits.map((w) => `${w.from}s:${w.s}s`).join(' '), small: log.small, cards: log.cards.length, tiyuta: log.cards.filter((c) => c.tiyuta).length, sourced: log.cards.filter((c) => c.src).length, illus: log.cards.filter((c) => c.illus).length, oldDeal: dealSeen, coins: end.silver, errors: log.errors.length, mins: +mins.toFixed(1) };
    note(`SUMMARY ${JSON.stringify(log.summary)}`);
  } catch (e) { console.error('RUN ERROR', e.message); log.fatal = e.message; }
  finally { fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(log, null, 1)); await ctx.close(); }
})();
