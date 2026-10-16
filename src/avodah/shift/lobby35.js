/* ── fable32 (build 13) ── lobby35.js — the 3D home screen ("מסך הבית"): the owner, 14.10 23:18–23:20, on Dror's 4-minute video of his
 * game's lobby — "רק במסך פתיחה יש מלא אופציות ומלא תנועה. העין לא נחה לרגע… החלק הכי מגניב שתופס אותך בפנים הוא השוט התלת-מימדי".
 * So, instead of the flat entry card: the kohen stands in the court at dawn, LIVE (the world renders behind him, pilgrims pass, the
 * altar's smoke rises), the camera drifts slowly round him, he breathes, waves, swings the axe; gold motes circle him over a glowing
 * disc. Round him the columns of doors, as in the genre: right (RTL first) — the watch's card (פרוטות, the best day, the badges),
 * ספר הזכרונות, today's tasks; left — the shop, the merchant ("ביום 2"), the two interludes (זיכרון המקדש, משחק האוצר); bottom — the
 * big gold "משחק" (pulsing) and the mode pill (יום במקדש / משמרת / סיור). A dot blinks on a door with news. Every text a draft
 * (טיוטה); never a Divine Name; 44-px targets; RTL.
 *   const Lb = createLobby({ D, world, view, twin, save, persist, sfx, root, camera(view, twin, o), kit, on: { day, shift, tour, shop, book, tiles, m3 } })
 *   Lb.close() · Lb.refresh() · Lb.el · tests: globalThis.__LOBBY (state(), pick(name))
 * ── /fable32 ── */
import { man, lamb, flame } from '../works/figures.js';
import { addDrawer, L, SHARED } from './draw.js';
import { BADGES33, SHOP33, DAY33, tasksForDay } from './day33.js';
import { interludeScore, fmt as fmtScore } from './score35.js';   // ── fable32 (build 14) ── the one score ── /fable32 ──

export const LOBBY35 = Object.freeze({ x: -34, z: 50, y: 16, az0: Math.PI / 2, swing: 0.45, swingS: 0.22, el: 0.2, d: 15, motes: 14, cycleS: 7 });

const CSS = `
.lb{position:fixed;inset:0;z-index:31;direction:rtl;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA;pointer-events:none;overflow:hidden}
.lb *{box-sizing:border-box}
.lb .lb-star{color:#FFD66E}
.lb .lb-top{position:absolute;top:max(6px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:rgba(20,14,6,.62);border:1px solid rgba(255,220,150,.35);border-radius:999px;padding:4px 14px;font:900 13px/1.2 "Heebo",system-ui,sans-serif;white-space:nowrap}
.lb .lb-col{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:5px;width:min(34vw,200px);pointer-events:none}
.lb .lb-r{right:max(8px,env(safe-area-inset-right))}.lb .lb-l{left:max(8px,env(safe-area-inset-left))}
.lb .lb-door{pointer-events:auto;position:relative;display:flex;align-items:center;gap:8px;min-height:44px;padding:6px 10px;border-radius:14px;border:2px solid rgba(255,230,180,.45);background:linear-gradient(180deg,rgba(60,42,16,.82),rgba(28,18,8,.86));color:#FFF6DA;font:800 13px/1.15 "Heebo",system-ui,sans-serif;text-align:right;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.35);transition:transform .12s}
.lb .lb-door:active{transform:scale(.96)}
.lb .lb-door i{font-style:normal;font-size:20px;line-height:1;width:26px;text-align:center;flex:none}
.lb .lb-door b{display:block;font-weight:900}.lb .lb-door small{display:block;font:700 11px/1.2 "Heebo",system-ui,sans-serif;opacity:.8}
.lb .lb-door.pick{border-color:#FFD66E;background:linear-gradient(180deg,rgba(120,84,20,.9),rgba(70,46,10,.92))}
.lb .lb-dot{position:absolute;top:-6px;left:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E24B3A;color:#fff;font:900 11px/18px "Heebo",system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px rgba(20,14,6,.8);animation:lb-pulse 1.4s ease-in-out infinite}
.lb .lb-card{pointer-events:auto;padding:8px 10px;border-radius:14px;border:2px solid rgba(255,230,180,.45);background:linear-gradient(180deg,rgba(60,42,16,.82),rgba(28,18,8,.86));font:800 12px/1.3 "Heebo",system-ui,sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.35)}
.lb .lb-card b{font-size:14px;font-weight:900}.lb .lb-card .lb-row{display:flex;justify-content:space-between;gap:6px;opacity:.95}
.lb .lb-bar{height:7px;border-radius:4px;background:rgba(0,0,0,.45);margin-top:5px;overflow:hidden}.lb .lb-bar i{display:block;height:100%;background:linear-gradient(90deg,#FFD66E,#D9A43A);border-radius:4px;transition:width .4s}
.lb .lb-task{display:flex;justify-content:space-between;gap:6px;font:700 11px/1.35 "Heebo",system-ui,sans-serif}.lb .lb-task.done{opacity:.6;text-decoration:line-through}
.lb .lb-bottom{position:absolute;bottom:max(10px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
.lb .lb-mode{pointer-events:auto;display:flex;gap:4px;background:rgba(20,14,6,.62);border:1px solid rgba(255,220,150,.35);border-radius:999px;padding:3px}
.lb .lb-mode button{min-height:34px;min-width:72px;border:0;border-radius:999px;background:transparent;color:#FFF6DA;font:800 12px/1 "Heebo",system-ui,sans-serif;padding:0 10px;cursor:pointer;opacity:.75}
.lb .lb-mode button.on{background:rgba(255,214,110,.28);opacity:1}
.lb .lb-play{pointer-events:auto;min-height:58px;min-width:220px;border-radius:18px;border:3px solid #FFE8A8;background:linear-gradient(180deg,#FFD66E,#E0A83A);color:#3A2300;font:900 24px/1 "Heebo",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 0 rgba(255,214,110,.6);cursor:pointer;animation:lb-glow 1.8s ease-in-out infinite}
.lb .lb-play small{display:block;font:800 12px/1.2 "Heebo",system-ui,sans-serif;opacity:.85;margin-top:3px}
.lb .lb-play:active{transform:scale(.97)}
.lb .lb-full{pointer-events:auto;position:absolute;top:max(6px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right));min-height:36px;border-radius:10px;border:1px solid rgba(255,220,150,.4);background:rgba(20,14,6,.55);color:#FFF6DA;font:800 11px/1 "Heebo",system-ui,sans-serif;padding:0 10px}
.lb-on .tw-btn,.lb-on .tw-zone,.lb-on .f31-hot,.lb-on .sh-hint,.lb-on .dy-hud,.lb-on .dy-coin,.lb-on .dy-say,.lb-on .dy-line,.lb-on .dy-banner,.lb-on .dy-tm,.lb-on .tw-goal,.lb-on .g27-skip,.lb-on .l28-tap,.lb-on .s27-stamp,.lb-on .tw-hand,.lb-on .tw-pad,.lb-on .av-top .av-rb[data-a=mute]{display:none!important}
.lb .lb-draft{position:absolute;bottom:4px;right:8px;font:700 10px/1 "Heebo",system-ui,sans-serif;opacity:.55}
@keyframes lb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes lb-glow{0%,100%{box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 0 rgba(255,214,110,.55)}50%{box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 10px rgba(255,214,110,0)}}
@media (max-height:420px){.lb .lb-col{gap:5px}.lb .lb-door{min-height:42px;padding:4px 8px}.lb .lb-play{min-height:52px;font-size:22px}}
@media (prefers-reduced-motion:reduce){.lb .lb-dot,.lb .lb-play{animation:none}}
`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function createLobby(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const save = o.save || {}, S = o.world || null, view = o.view || null, T = o.twin || null, D = o.D || null;
  const on = o.on || {};
  const persist = () => { try { o.persist && o.persist(); } catch (e) { /* */ } };
  const sfx = (n) => { try { o.sfx && o.sfx.play && o.sfx.play(n); } catch (e) { /* */ } };
  const st = { t: 0, mode: save.lobbyMode === 'shift' || save.lobbyMode === 'tour' ? save.lobbyMode : 'day', open: true, busy: false, cam: null, offDraw: null, drags: 0, dragT: -9, az: LOBBY35.az0, pose: 'stand', u: 1, hx: LOBBY35.x, hz: LOBBY35.z, hy: LOBBY35.y, n: 0 };
  const hp = { x: 0, y: 16, z: 0 };
  const H35 = () => { const H = globalThis.__HERO35; return H && H.loaded ? H : null; };   // ── fable32 (build 15) ── the real kohen (hero35.js), when loaded ── /fable32 ──
  const camNow = () => { try { if (view && view.camNow) return view.camNow(hp); } catch (e) { /* */ } return null; };
  /* ── the world: entered, the day's HUD held, the sky at dawn, the hero at the lobby's spot (hidden: the lobby draws him), the stick off ── */
  function enterWorld() {
    try { if (D && !D.active && D.canEnter && D.canEnter()) D.enter(); } catch (e) { /* */ }
    try { if (D && D.shiftMode) D.shiftMode({ work: () => null, marks: () => [], tick: () => {} }); } catch (e) { /* */ }
    try { const W = globalThis.__T; if (W && typeof W.setTime === 'function') W.setTime('dawn'); } catch (e) { /* */ }
    try { if (S && S.hero) { S.hero.setPos(LOBBY35.x, LOBBY35.z, 0); S.hero.drive(0, 0); S.hero.show(!!H35()); } } catch (e) { /* */ }   // (build 15: the real kohen stands himself; without him the kit draws the figure)
    try { if (S && S.heroXYZ) { S.heroXYZ(hp); st.hy = Number.isFinite(hp.y) ? hp.y : 16; } } catch (e) { /* */ }
    try { if (T && T.noStick) T.noStick(true); } catch (e) { /* */ }
    try { if (o.camera && view) { st.cam = o.camera(view, T, { world: S }); st.cam.on(); st.cam.orbit(LOBBY35.az0, LOBBY35.el, LOBBY35.d); } } catch (e) { st.cam = null; }
    SHARED.act = null;
  }
  function leaveWorld() {
    if (st.offDraw) { try { st.offDraw(); } catch (e) { /* */ } st.offDraw = null; }
    try { if (st.cam) st.cam.off(); } catch (e) { /* */ } st.cam = null;
    try { if (S && S.hero) S.hero.show(true); } catch (e) { /* */ }
    try { if (T && T.noStick) T.noStick(false); } catch (e) { /* */ }
  }
  /* ── the figure and the motes: one drawer a frame ── */
  function draw(k, t, dt) {
    st.t += dt; st.n++;
    // the camera's slow swing round him (paused 3 s after the thumb turned it)
    if (st.cam) { const s = st.cam.state(); if (s.drags !== st.drags) { st.drags = s.drags; st.dragT = st.t; } if (st.t - st.dragT > 3) { st.az = LOBBY35.az0 + LOBBY35.swing * Math.sin(st.t * LOBBY35.swingS); st.cam.orbit(st.az, null, LOBBY35.d); } }
    // the idle cycle: stand (breathing) · a wave · stand · the axe over the shoulder, swung once
    const c = st.t % LOBBY35.cycleS, breath = 0.5 + 0.5 * Math.sin(st.t * 1.7);
    let pose = 'stand', u = 1, axe = false;
    if (c > 2.2 && c < 3.4) { pose = 'raise'; u = Math.min(1, (c - 2.2) / 0.3) * (c > 3.1 ? Math.max(0, 1 - (c - 3.1) / 0.3) : 1); }
    else if (c > 4.6 && c < 6.3) { pose = 'reach'; axe = true; const w = (c - 4.6) / 1.7; u = 0.35 + 0.55 * Math.abs(Math.sin(w * Math.PI * 2)); }
    st.pose = pose; st.u = u;
    const cq = camNow(); const yaw = cq && Number.isFinite(cq.px) ? Math.atan2(cq.pz - st.hz, cq.px - st.hx) : Math.PI / 2;
    const a = L(st.hx), s = L(st.hz), y = L(st.hy);
    // the glowing disc under him, pulsing
    k.c(a, s, y + 0.01, 0.7 + 0.06 * breath, 0.02, '!#E6C25A'); k.c(a, s, y + 0.02, 0.5, 0.02, '!#FFE9A8');
    const H = H35();
    if (H) {
      // the real kohen: he faces the camera (the world hero's yaw: facing = (sin, cos)); the cycle's clips — a cheer, then the axe swung
      if (S && S.hero && cq) { const wy = Math.atan2(cq.px - st.hx, cq.pz - st.hz); if (!Number.isFinite(st.wy) || Math.abs(Math.atan2(Math.sin(wy - st.wy), Math.cos(wy - st.wy))) > 0.03) { st.wy = wy; try { S.hero.setPos(st.hx, st.hz, wy); S.hero.show(true); } catch (e) { /* */ } } }
      if (pose === 'raise' && st.lastClip !== 'Cheer' && c < 2.6) { st.lastClip = 'Cheer'; H.play('Cheer', { once: true }); }
      else if (axe && st.lastClip !== 'Chop' && c < 5.0) { st.lastClip = 'Chop'; H.play('2H_Melee_Attack_Chop', { once: true, speed: 0.8 }); }
      else if (!axe && pose === 'stand' && c > 6.3) st.lastClip = '';
      if (axe) { const R = H.handR(); if (R) { const hx = L(R.x), hz = L(R.z), hy = L(R.y); k.c(hx, hz, hy + 0.25, 0.04, 1.0, '#7A5A3A', { pitch: 0.2, yaw: -yaw }); k.b(hx + Math.cos(yaw) * 0.12, hz + Math.sin(yaw) * 0.12, hy + 0.7, 0.32, 0.08, 0.2, '#9AA3AA', { yaw: -yaw }); } }
    } else {
      const r = man(k, a, s, y + 0.012 * breath, { hero: true, pose, u, yaw, t });
      if (axe && r && r.R) { const R = r.R, dxh = Math.cos(yaw + Math.PI / 2) * 0.3, dzh = Math.sin(yaw + Math.PI / 2) * 0.3; k.b(R[0] + dxh * 0.3, R[1] + dzh * 0.3, R[2] + 0.25, 0.05, 0.05, 0.85, '#7A5A3A', { pitch: 0.35 }); k.b(R[0] + dxh, R[1] + dzh, R[2] + 0.62, 0.22, 0.05, 0.14, '#9AA3AA'); }
    }
    // a lamb trots a slow ring round him (its head up now and then); a small brazier burns at his side — the court alive
    { const ang = st.t * 0.45, rr = 2.6, lx = a + Math.cos(ang) * rr, lz = s + Math.sin(ang) * rr; lamb(k, lx, lz, y, { yaw: ang + Math.PI / 2, step: st.t * 9, head: 0.5 + 0.5 * Math.sin(st.t * 0.7), mark: true }); }
    { const bx = a - 1.3, bz = s - 0.5; k.c(bx, bz, y + 0.16, 0.13, 0.32, '#4A3A2A'); k.c(bx, bz, y + 0.33, 0.16, 0.03, '#6B5236'); flame(k, bx, bz, y + 0.34, 0.4, t); }
    // the gold motes: a slow spiral round him, rising and fading
    for (let i = 0; i < LOBBY35.motes; i++) { const ph = (st.t * 0.35 + i / LOBBY35.motes) % 1, ang = i * 2.4 + st.t * 0.6, rr = 0.7 + 0.35 * Math.sin(i * 1.3 + st.t * 0.8); const sz = 0.03 + 0.02 * (1 - ph); k.s(a + Math.cos(ang) * rr, s + Math.sin(ang) * rr, y + 0.1 + ph * 2.2, sz, sz, sz, '!#FFD66E'); }
  }
  /* ── the doors ── */
  let root = null;
  const claimed = () => { const c = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {}; return BADGES33.filter((b) => c[b.id]).length; };
  const perutot = () => +save.perutot || 0;
  const owned = () => (save.day33 && typeof save.day33 === 'object' ? save.day33 : {});
  const canBuy = () => SHOP33.some((it) => !owned()[it.id] && !(it.needs && !owned()[it.needs]) && perutot() >= it.price);
  const MODE = { day: ['יום במקדש', 'האש, העצים, הטלאים, הלילה'], shift: ['משמרת', '90 שניות — עולי הרגל בשער'], tour: ['סיור', 'היום במקדש — בלי שעון'] };
  function html() {
    const bd = claimed(), tl = save.tiles && typeof save.tiles === 'object' ? save.tiles : {}, pn = save.pen && typeof save.pen === 'object' ? save.pen : {}, m3 = save.m3 && typeof save.m3 === 'object' ? save.m3 : null;
    const sc = o.score ? (() => { try { return o.score.get(); } catch (e) { return null; } })() : null;
    const tasks = tasksForDay(1);
    return `
      <div class="lb-top">🏛️ בית המקדש השני <span style="opacity:.6">·</span> ${sc ? `<span class="lb-star">★ ${fmtScore(sc.total)}${sc.coins ? ` · ◉ ${sc.coins}` : ''}${sc.title ? ` · ${esc(sc.title)}` : ''}</span> <span style="opacity:.6">·</span> ` : ''}🪙 <span data-lb="perutot">${perutot()}</span> פרוטות <span style="opacity:.6">·</span> 📜 ${bd}/${BADGES33.length}</div>
      <button class="lb-full" type="button" data-lb="full">⛶ מסך מלא</button>
      <div class="lb-col lb-r">
        <div class="lb-card"><b>המשמר שלך בעזרה</b><div class="lb-row"><span>היום הטוב ביותר</span><span>${save.bestDay ? `יום ${+save.bestDay}` : '—'}</span></div><div class="lb-row"><span>שיא המשמרת</span><span>${save.best && save.best[save.lvl] ? save.best[save.lvl] : '—'}</span></div><div class="lb-bar"><i style="width:${Math.round(100 * bd / BADGES33.length)}%"></i></div><div class="lb-row"><span>ספר הזכרונות</span><span>${bd}/${BADGES33.length}</span></div></div>
        <button class="lb-door" type="button" data-lb="book"><i>📜</i><span><b>ספר הזכרונות</b><small>${bd ? `${bd} עיטורים שלכם` : 'מה מחכה לכם בעזרה'}</small></span></button>
        <div class="lb-card"><b>משימות הממונה — יום 1</b>${tasks.map((q) => `<div class="lb-task"><span>${esc(q.text)}</span><span>+${DAY33.taskReward || 5}🪙</span></div>`).join('')}</div>
      </div>
      <div class="lb-col lb-l">
        <button class="lb-door" type="button" data-lb="shop"><i>🪙</i><span><b>חנות</b><small>${perutot()} פרוטות</small></span>${canBuy() ? '<span class="lb-dot">!</span>' : ''}</button>
        <button class="lb-door" type="button" data-lb="merchant"><i>🧺</i><span><b>הסוחר</b><small>מגיע ביום 2 — סחר בעודפים</small></span></button>
        <button class="lb-door pick" type="button" data-lb="tiles"><i>🃏</i><span><b>זיכרון המקדש</b><small>${tl.level > 1 ? `שלב ${tl.level}` : 'קלפים מתהפכים — פרוטות'}</small></span><span class="lb-dot">${tl.level > 1 ? '★' : 'חדש'}</span></button>
        <button class="lb-door pick" type="button" data-lb="pen"><i>🐑</i><span><b>הוצאת הטלה מהדיר</b><small>${pn.level > 1 ? `שלב ${pn.level}` : 'פאזל הזזה — פרוטות'}</small></span>${pn.level > 1 ? '' : '<span class="lb-dot">חדש</span>'}</button>
        <button class="lb-door pick" type="button" data-lb="m3"><i>💎</i><span><b>משחק האוצר</b><small>${m3 && m3.level ? `מחצבה ${m3.level.quarry || 1}` : 'שלושה בשורה — פרוטות'}</small></span></button>
      </div>
      <div class="lb-bottom">
        <div class="lb-mode" role="tablist">${Object.keys(MODE).map((m) => `<button type="button" role="tab" data-lb="mode:${m}" class="${st.mode === m ? 'on' : ''}">${MODE[m][0]}</button>`).join('')}</div>
        <button class="lb-play" type="button" data-lb="play">משחק<small>${MODE[st.mode][0]} — ${MODE[st.mode][1]}</small></button>
      </div>
      <div class="lb-draft">טיוטה — להמחשה · מסך הבית (בנייה 13)</div>`;
  }
  function render() {
    if (!root) return;
    root.innerHTML = html();
    root.querySelectorAll('[data-lb]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); pick(b.dataset.lb); }));
  }
  function pick(name) {
    if (!st.open || st.busy) return false;
    sfx('ui');
    if (name.startsWith('mode:')) { st.mode = name.slice(5); save.lobbyMode = st.mode; persist(); render(); return true; }
    if (name === 'play') { const m = st.mode; close(); if (m === 'shift') on.shift && on.shift(); else if (m === 'tour') on.tour && on.tour(); else on.day && on.day(); return true; }
    if (name === 'full') { try { const d = doc.documentElement; if (doc.fullscreenElement) doc.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen(); } catch (e) { /* */ } return true; }
    if (name === 'shop') { on.shop && on.shop(); return true; }
    if (name === 'book') { on.book && on.book(); return true; }
    if (name === 'merchant') { on.merchant && on.merchant(); return true; }
    if (name === 'tiles' || name === 'pen' || name === 'm3') { play(name); return true; }
    return false;
  }
  // ── fable32 (build 14) ── one way for every interlude (o.games from index.js: tiles · pen · m3): the lobby hides while it plays; its פרוטות and score are the player's
  async function play(key) {
    const g = o.games && o.games[key]; if (st.busy || !doc || !g) return;
    st.busy = true; if (root) root.style.display = 'none';
    let r = null;
    try { r = await g(); } catch (e) { r = null; }
    if (r && r.perutot > 0) save.perutot = perutot() + (r.perutot | 0);
    const pts = interludeScore(key, r); if (pts > 0 && o.score) { try { o.score.add(pts, key); } catch (e) { /* */ } }
    persist(); st.busy = false; if (root) { root.style.display = ''; render(); }
  }
  // ── /fable32 ──
  function close() {
    if (!st.open) return; st.open = false;
    leaveWorld();
    if (root) { root.remove(); root = null; }
    try { doc && doc.body.classList.remove('lb-on'); } catch (e) { /* */ }
    try { if (globalThis.__LOBBY && globalThis.__LOBBY.__me === me) delete globalThis.__LOBBY; } catch (e) { /* */ }
  }
  /* ── open ── */
  if (doc) {
    if (!doc.getElementById('lb-css')) { const s = doc.createElement('style'); s.id = 'lb-css'; s.textContent = CSS; doc.head.appendChild(s); }
    doc.body.classList.add('lb-on');
    root = doc.createElement('div'); root.className = 'lb'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'מסך הבית'); (o.root || doc.body).appendChild(root);
    render();
    try { st.offDraw = addDrawer(o.kit || null, draw, 5); } catch (e) { st.offDraw = null; }
  }
  enterWorld();
  const me = { close, refresh: render, pick, get el() { return root; }, state: () => ({ open: st.open, mode: st.mode, busy: st.busy, pose: st.pose, u: +st.u.toFixed(2), az: +st.az.toFixed(2), frames: st.n, cam: st.cam ? st.cam.state() : null, perutot: perutot(), badges: claimed() }) };
  try { globalThis.__LOBBY = Object.assign({ __me: me }, me, { state: me.state, pick }); } catch (e) { /* */ }
  return me;
}
