/* ─────────────────────────────────────────────────────────────────────────────
 * index.js: Phase B — "העבודה בבית" — the gameplay controller.
 *
 *   const av = createAvodah({ world, root, onEvent, options });
 *   av.start();                                  // the home: live status, practice, the book, the path
 *   av.start({ mode: 'live' });                  // join what the Temple is doing now (or show the next time)
 *   av.start({ mode: 'practice', segment: 'shachar' | 'erev' | <game id> });
 *   av.frame(nowMs);  av.stop();  av.state
 *
 * world: anything (PROJECT.md §12); every call goes through world.js (guarded; `world = {}` works).
 * options: { now: () => ms, storage, fast (short animations, tests), production (approved content only),
 *            sfx (a sound kit to share) }.
 * Rules: state.js · the clock: schedule.js (calendar.js) · content: data.js · the mini-games: minigames/.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as S from './state.js';
import { SHACHAR, EREV, GAMES, cardsFor, card as toCard, MEMUNIM, role as roleById, korban, shirOf, isDraft, needOf } from './data.js';
import { liveStatus, dayTheme, isRestDay, jerusalemDay, clockHe, whenHe, SEGMENTS, skyOf, EVENT_SHOT, EVENT_SHOT_TALL } from './schedule.js';
import { guardWorld } from './world.js';
import { createSound } from './sound.js';
import { createUI } from './ui.js';
import { runGame } from './minigames/common.js';
import { MINIGAMES } from './minigames/index.js';
import * as HB from './hooks/index.js';   // ── hooks ── (HOOKS agent: pacing, the daily ritual, tiers, festival, collections)
import { musafSong } from './minigames/shir.js';   // ── avoda12 ── the musaf's song (Shabbat: Haazinu; Chol HaMoed Sukkot: the day's psalm)
import { MISHMAROT, currentMishmar } from '../calendar.js';   // ── hooks ──
import { createDay } from './day/index.js';
import { mountShift } from './shift/index.js';   // ── shift29 ── "משמרת": the 90-second round, Phase B's default entry in landscape ── /shift29 ──   // ── engine22 ── "יום במקדש": the game-time clock, the errands, the two thumbs in the Temple (landscape)
import { turnCard } from './shift/prefs28.js';   // ── fable32 (build 28) ── (the one "turn the phone" card) ── /fable32 ──

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** calendar.js event → the mini-game where a live player joins the service */
const JOIN_AT = {
  'terumat-hadeshen': 'payis1', payis: 'payis2', 'tamid-shachar': 'barkai', 'ketoret-shachar': 'payis3', 'birkat-kohanim': 'birkat',
  nesachim: 'shir', 'nisuch-hamayim': 'shir', 'tamid-bein-haarbayim': 'erev', 'ketoret-erev': 'neirot', 'hadlakat-haneirot': 'neirot',
};
const race = (p, ms) => Promise.race([Promise.resolve(p).catch(() => false), sleep(ms)]);

export function createAvodah({ world, root, onEvent, options = {} } = {}) {
  const opt = { ...options };
  const now = typeof opt.now === 'function' ? opt.now : () => Date.now();
  const store = opt.storage || S.storage;
  const fast = !!opt.fast, F = fast ? 0.12 : 1;
  const W = guardWorld(world, { timeout: fast ? 1500 : 7000 });
  const sfx = opt.sfx || createSound({ storage: store });
  let { A, isNew } = S.load(store, now());
  let quitting = false;
  let D = null;   // ── engine22 ──
  let started = false, busy = false, current = null, statusT = 0, lastStatus = 0, theme = null, status = null;
  const log = [];
  const a0 = S.readPhaseA(store);
  const adopted = S.adoptPhaseA(A, a0);
  // ── hooks ── the hooks' part of the save, Phase A's progress (read-only), a one-shot intent from Phase A's invitation
  HB.norm(A);
  const pa = HB.phaseAProgress(store);
  const intent = HB.takeIntent(store);
  /** the day panel's extra lines: the next appointment, what tomorrow brings */
  function hooksToday() {
    // while a live segment he has not joined yet today is on, "join" is the one call to action; after it, the ritual
    const t = now(), st = status || {}, o = { live: !!(st.live && !((A.live[jerusalemDay(t)] || []).includes(st.live.id))) };
    if (st.next) o.next = st.next.whenHe;
    try { const k = HB.addDays(jerusalemDay(t), 1); o.tomorrow = HB.tomorrowHe(A, dayTheme(Date.parse(k + 'T09:00:00+03:00')), k, isRestDay); } catch (e) { o.tomorrow = []; }
    return o;
  }
  function mishmarNow() { try { return currentMishmar(new Date(now())); } catch (e) { return null; } }
  const hooksUI = {
    today: (m) => HB.todayHTML(m, hooksToday()),
    phaseA: () => HB.phaseAHTML(pa) + HB.scenesHomeHTML(now(), undefined, A),   // ── hooks ── (round 3) the coming Yom Kippur (announced), the tour's stamps, the Ark mystery on the second day
    fest: (th) => HB.sukkotHTML(th, A, { mishmarHe: A.mishmar ? MISHMAROT[A.mishmar - 1] : '', day: jerusalemDay(now()), isRest: isRestDay }),
    path: () => HB.pathHTML(A, { mishmar: HB.mishmarHe(A, mishmarNow(), MISHMAROT, now()) }),
    tier: (g) => HB.tierOf(A, g), tierHe: HB.tierHe,
    brief: HB.briefHTML, autoMs: fast ? 0 : HB.PACE.autoMs,
  };
  // ── end hooks ──
  function emit(type, detail) {
    log.push({ t: now(), type, detail });
    if (typeof D !== 'undefined' && D) { try { D.onAvodah(type, detail); } catch (e) { /* engine22 */ } }   // ── engine22 ──
    if (log.length > 500) log.shift();
    if (typeof onEvent === 'function') { try { onEvent(type, detail); } catch (e) { console.warn('[avodah] onEvent failed', e); } }
  }
  const persist = () => S.save(A, store, now());
  const haptic = (ms) => { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* none */ } };

  /* ───────── the model the UI reads ───────── */
  function refreshClock() {
    const t = now();
    try { theme = dayTheme(t); } catch (e) {
      // (an Intl without the Hebrew calendar: a plain weekday, so the game still runs)
      if (!theme) { console.warn('[avodah] dayTheme', e); const wd = new Date(t).getDay(); theme = { kind: 'weekday', evening: false, info: { weekday: wd, isShabbat: wd === 6 }, hebrew: null, labelHe: '', dateHe: 'העבודה בבית', psalm: shirOf(wd), musaf: [], events: [], sukkot: null, mishmar: null }; }
    }
    try { status = liveStatus(t); } catch (e) { console.warn('[avodah] liveStatus', e); status = { live: null, current: null, next: null, barkai: null }; }
    if (theme && theme.sukkot && theme.sukkot.shoevah) theme.sukkot.shoevahWhen = whenHe(theme.sukkot.shoevah.start, t);
  }
  function model() {
    if (!theme) refreshClock();
    const t = now(), st = status || {};
    return {
      A, theme, shachar: SHACHAR, rank: S.rankOf(A.points), rolesDone: S.rolesCount(A), day: jerusalemDay(t), phaseA: a0,
      todayDone: SHACHAR.filter((g) => A.games[g] && S.dayKey(A.games[g].t) === S.dayKey(t)).length,
      sangToday: !!(A.games.shir && S.dayKey(A.games.shir.t) === S.dayKey(t)),   // ── avoda12 ── the song of the day, sung today
      svc: svcModel(jerusalemDay(t)),   // ── service13 ── the ketoret he compounded, tomorrow's animals, the lambs' chamber
      status: {
        live: st.live, next: st.next, barkai: st.barkai, barkaiHe: st.barkai ? whenHe(st.barkai, t) : '',
        currentHe: st.current ? st.current.nameHe : '', liveUntil: st.live ? clockHe(st.live.end) : '',
      },
    };
  }
  // ── service13 ── the day's animals from the calendar (tomorrow's are shown on the home and in the pens), the store
  function needFor(day) {
    const out = { today: null, tomorrow: null, restToday: false, restHe: '', tomorrowRest: false };
    const th = (k) => dayTheme(Date.parse(k + 'T09:00:00+03:00'));
    try { const t0 = th(day); out.today = needOf(t0.info); out.restToday = !!isRestDay(day); out.restHe = t0.info && t0.info.isShabbat ? 'שבת' : 'יום טוב'; } catch (e) { /* no calendar */ }
    try { const k = HB.addDays(day, 1); out.tomorrow = needOf(th(k).info); out.tomorrowRest = !!isRestDay(k); } catch (e) { /* no calendar */ }
    return out;
  }
  let svcKey = '', svcNeed = null;
  function svcModel(day) {
    if (svcKey !== day) { svcKey = day; svcNeed = needFor(day); }
    const manim = S.pitumManim(A);
    return { manim, low: manim < S.PITUM_LOW, made: A.pitum.batches > 0, need: svcNeed, tended: S.dirToday(A, day), checked: S.dirNorm(A).checked };
  }
  // ── /service13 ──
  function pushStatus() {
    if (!ui) return;
    const t = now(), st = status || {};
    if (st.live) ui.setStatus({ live: true, title: `חי: ${st.live.he}`, sub: `עד ${clockHe(st.live.end)} · הצטרף` });
    else {
      const nx = st.next ? `${st.next.he} ${st.next.start - t < 3600e3 * 10 ? st.next.textHe.replace(st.next.he + ' ', '') : whenHe(st.next.start, t)}` : '';
      ui.setStatus({ live: false, title: st.current ? `עכשיו במקדש: ${st.current.nameHe}` : 'מה קורה עכשיו במקדש', sub: nx });
    }
  }
  /* On the home, the world shows what the Temple is doing now, under the real Jerusalem sky (once per change). */
  let sceneKey = '';
  function liveScene() {
    if (busy || !started || (D && D.active)) return;   // ── engine22 ── (the day's own sky)
    const t = now(), cur = status && status.current ? status.current.id : '';
    let sky = 'noon';
    try { sky = skyOf(t); } catch (e) { /* keep noon */ }
    const key = cur + '|' + sky;
    if (key === sceneKey) return;
    sceneKey = key;
    W.time(sky);
    const tall = typeof innerWidth === 'number' && innerWidth < 760 && innerHeight > innerWidth;   // the home's strip above its panel (schedule.js)
    const shot = (tall && EVENT_SHOT_TALL[cur]) || EVENT_SHOT[cur];
    if (shot) W.look(shot, 2600);
    emit('scene', { event: cur, sky });
  }
  function tick() {
    refreshClock();
    pushStatus();
    if (ui.homeOpen) liveScene();
    // ── engine22 ── rotate: the Temple (landscape) ↔ the home (portrait)
    // ── fable32 (build 28) ── once the shift is up (its lobby or its day: SH.live) a turn to portrait never leaves for the old home (that was a
    // side door into Phase B's home, rohvi-he.md §1, §16): the "turn the phone" card over the paused day, and back on landscape ── /fable32 ──
    if (D && started && SH && SH.live) {
      const port = !D.canEnter();
      SH.turn28(port);
      if (!port && !D.active) D.enter();
    }
    else if (D && started && !busy && !ui.busy) {
      if (D.active && !D.canEnter()) { D.exit(); sceneKey = ''; ui.showHome(true); }
      else if (!D.active && D.canEnter() && A.seenIntro && S.hasPlayer(A)) { ui.showHome(false); D.enter(); }
    }
    // ── /engine22 ──
    if (ui.homeOpen && !busy && Date.now() - lastStatus > 20000) { lastStatus = Date.now(); ui.renderHome(true); }   // ── service13 ── (keeps the scroll)
  }

  /* ───────── actions ───────── */
  // ── guide27 ── the real Temple hour now (Jerusalem's clock; the day's hours are plain clock hours)
  function templeHourNow() { try { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(now())); const g = (t) => +((p.find((x) => x.type === t) || {}).value || 0); return (g('hour') % 24) + g('minute') / 60; } catch (e) { const d = new Date(now()); return d.getHours() + d.getMinutes() / 60; } }
  const dayGo = (fn) => { if (!(D && D.canEnter())) return false; ui.showHome(false); if (!D.active && !D.enter()) return false; fn(); return true; };
  // ── /guide27 ──
  const act = {
    play(what, mode) { if (busy) return; if (dayGo(() => D.toWork(what))) return; /* ── guide27 ── (landscape: to the work's place in the day) ── /guide27 ── */ run(what, { live: false }); },
    join() {
      if (busy) return;
      if (dayGo(() => D.joinLive(templeHourNow()))) return;   // ── guide27 ── ── /guide27 ──
      refreshClock();
      const live = status && status.live;
      if (!live) { ui.toast('אין עבודה חיה ברגע זה — הבאה מופיעה למעלה.'); return; }
      // join where the Temple is now: the calendar's current event → the first mini-game of that step
      const cur = status.current ? status.current.id : '';
      const from = live.id === 'shachar' ? SHACHAR.indexOf(JOIN_AT[cur] || 'payis1') : live.id === 'erev' ? EREV.indexOf(JOIN_AT[cur] || 'erev') : 0;
      run(live.id === 'erev' ? 'erevchain' : live.id, { live: true, seg: live.id, from: Math.max(0, from) });
    },
    mute() { sfx.muted = !sfx.muted; if (!sfx.muted && sfx.unlock) sfx.unlock(); },
    /** the home button during a service: stop after this step (the step's "דלג" leaves at once) */
    /** back to Phase A (main.js swaps the game; the Phase B save is kept) */
    exit() { if (busy) return; persist(); if (opt.onExit) opt.onExit(); },
    quit() { if (!busy || quitting) return; quitting = true; ui.toast('יוצאים אחרי השלב הזה — "דלג" יוצא מיד. מה שלמדת נשמר.', 3200); emit('quit', {}); },
  };
  const ui = createUI({ root: root || document.body, ctx: { model, act, sfx, fast, busy: () => busy, exitable: () => typeof opt.onExit === 'function', hooks: hooksUI /* ── hooks ── */ } });
  // ── engine22 ── "יום במקדש": in landscape the home gives way to the Temple itself (the clock, the horizon, the errands, the two thumbs);
  // portrait keeps today's Phase B. The day's save is A.day (state.js). opt.rig = { stages, view, camera, scene } from main.js.
  const tomorrowLines = () => { try { const d0 = jerusalemDay(now()), tk = HB.addDays(d0, 1); const L = HB.tomorrowHe(A, dayTheme(Date.parse(tk + 'T09:00:00+03:00')), tk, isRestDay); try { L.unshift(`משמר ${currentMishmar(new Date(Date.parse(tk + 'T09:00:00+03:00'))).nameHe}`); } catch (e) { /* no calendar */ } return L; } catch (e) { return []; } };
  D = opt.rig && !opt.noDay ? createDay({
    A, persist, emit: (t, d) => emit(t, d), rig: opt.rig, sfx, world: W, fast,
    runGame: (id) => run(id, { live: false }), busy: () => busy || ui.busy, homeOpen: () => ui.homeOpen,
    tomorrow: tomorrowLines, rankLine: () => { const r = S.rankOf(A.points); return r.next ? `${r.rank}/15 ממונים פגשת · עוד ${r.next - A.points} זכויות לממונה הבא` : `${r.rank}/15 ממונים פגשת`; }, addPoints: (n) => { S.addPoints(A, n); persist(); },
  }) : null;
  const dayOn = () => !!(D && D.active);
  // ── shift29 ── the shift (src/avodah/shift): its entry card on the landscape entry; #shift / #shift=N start a round at once
  const SH = D ? mountShift({ D, A, persist, sfx, emit: (t, d) => emit(t, d), rig: opt.rig }) : null;
  const shiftCardOk = () => { try { return !(/^#avodah/.test(location.hash || '') && globalThis.__START_PAUSED); } catch (e) { return true; } };   // (the day's own tests open #avodah into the day, as before)
  // ── /shift29 ──
  // ── /engine22 ──

  /* ───────── lifecycle ───────── */
  async function start(o = {}) {
    if (!started) {
      started = true;
      ui.mount();
      refreshClock();
      pushStatus();
      statusT = setInterval(tick, 1000);
      addEventListener('pagehide', persist);
      emit('start', { isNew, mode: o.mode || 'home', fromA: !!a0, adopted });
      if (adopted) persist();
    }
    // ── fable32 (build 29) ── the Shabbat and Yom Tov lock (rule 16): a page opened during it shows its screen alone — before the first
    // run's name and mishmar screens too; at its end this start goes on from here ── /fable32 ──
    if (SH && o.shift != null && SH.gate29 && SH.gate29(() => start(o))) { try { ui.showHome(false); } catch (e) { /* */ } emit('lock29', {}); return null; }
    // ── fable32 (build 44) ── the one-time vision from Phase A (v2 §12): no name, no intro — the finished House, one act, and back to the
    // Mount (the shift's runVision; when the day cannot open — a portrait window — straight back)
    if (SH && o.shift === 'vision') {
      if (D && D.canEnter() && D.enter() && SH.runVision && SH.runVision({ exit: () => { busy = false; act.exit(); } })) { try { ui.showHome(false); } catch (e) { /* */ } emit('visionEnter', {}); return null; }
      setTimeout(() => act.exit(), 0); return null;
    }
    // ── /fable32 ──
    if (!S.hasPlayer(A)) {
      busy = true;
      const r = await ui.namePick({ name: A.name });   // ── avoda12 ── (N69) a known name is never asked again
      A.name = r.name || A.name; A.mishmar = r.mishmar;
      persist();
      busy = false;
      emit('name', { mishmar: A.mishmar });
    }
    if (!A.seenIntro) {
      busy = true;
      await ui.intro(A.name);
      A.seenIntro = true; persist();
      busy = false;
    }
    // ── fable29 ── the shift asked for (#shift / "משמרת") but the window is portrait or narrow (the owner opened the artifact in a side
    // panel and landed on the old home): a card that says to widen or turn, and the shift opens by itself once the window is landscape
    if (SH && o.shift != null && D && !D.canEnter() && typeof document !== 'undefined' && !document.getElementById('sh-turn')) {
      ui.showHome(false);
      const el = turnCard(document, 'sh-turn');   // ── fable32 (build 28) ── (the same card, from prefs28.js) ── /fable32 ──
      const again = () => { if (D.canEnter()) { removeEventListener('resize', again); el.remove(); start(o); } };
      addEventListener('resize', again);
      return null;
    }
    // ── /fable29 ──
    // ── shift29 ──
    if (SH && o.shift != null && D && D.canEnter()) {
      ui.showHome(false);
      if (D.enter()) { if (o.shift === 'card' || o.shift === '') SH.card(); else if (o.shift === 'day' && SH.runDay) SH.runDay(); /* ── fable32 (build 6) ── (#shift=day) ── /fable32 ── */ else SH.run(+o.shift || SH.save.lvl); emit('shiftEnter', { how: String(o.shift) }); return null; }
    }
    // ── /shift29 ──
    // ── guide27 ── one world (WAVE27 #5): in landscape the invitation, a practice segment and "live" enter the day — never a sheet
    // (portrait keeps the sheets ⚑). live = the day's clock set to the real Temple hour (Jerusalem time; forward only)
    if (D && D.canEnter() && (o.mode === 'live' || o.segment || (!o.mode && intent && intent !== 'home'))) {
      ui.showHome(false);
      if (D.enter()) {
        if (o.mode === 'live') D.joinLive(templeHourNow()); else D.toWork(o.segment || intent);
        emit('g27Enter', { mode: o.mode || 'intent', what: o.segment || (o.mode === 'live' ? 'live' : intent) });
        return null;
      }
    }
    // ── /guide27 ──
    if (o.mode === 'live') {
      refreshClock();
      if (status && status.live) return act.join();
      ui.showHome(true);
      return null;
    }
    if (o.segment) return run(o.segment === 'erev' ? 'erevchain' : o.segment, { live: false });
    // ── hooks ── Phase A's invitation (the altar complete / Chanukat HaBayit) opens straight into the daily ritual
    if (!o.mode && intent && intent !== 'home') return run(intent, { live: false });
    // ── engine22 ── landscape: the Temple itself, not the home
    if (D && D.canEnter()) { ui.showHome(false); if (D.enter()) { if (SH && shiftCardOk()) SH.card(); /* ── shift29 ── ── /shift29 ── */ return null; } }
    // ── /engine22 ──
    ui.showHome(true);
    liveScene();
    return null;
  }
  function stop() {
    if (SH) { try { SH.destroy(); } catch (e) { /* shift29 */ } }   // ── shift29 ── ── /shift29 ──
    if (D) { try { D.destroy(); } catch (e) { /* engine22 */ } }   // ── engine22 ──
    clearInterval(statusT); statusT = 0;
    W.clear();
    removeEventListener('pagehide', persist);
    if (started) persist();
    ui.destroy();
    started = false;
  }
  let lastFrame = 0;
  function frame(ms) { if (D) D.frame(ms); /* ── engine22 ── */ if (started && ms - lastFrame > 1000) { lastFrame = ms; pushStatus(); } }

  /* ───────── running the service ───────── */
  const FOR_REAL = {
    kiddush: (L) => !!L.deshen, deshen: (L) => !!L.deshen,
    zerika: (L) => L.role === 'shochet' || L.role === 'zorek',
    heichal: (L) => L.role === 'dishun-mizbeach' || L.role === 'dishun-menorah',
    evarim: (L) => { const r = roleById(L.role); return !!(r && r.limb); },
    ketoret: (L) => L.ketoret === true,
    shir: (L) => !!L.evarim || L.role === 'yayin',
  };
  async function run(what, { live = false, seg = null, from = 0 } = {}) {
    if (busy) return null;
    let list = what === 'shachar' ? SHACHAR.slice() : what === 'erevchain' ? EREV.slice() : MINIGAMES[what] ? [what] : null;
    // ── hooks ── "העבודה שלך היום": the daily ritual (the payis, your role's work בפועל, the song)
    const mineRun = what === 'mine';
    if (mineRun) list = HB.mineList(A, S.drawLots(A, jerusalemDay(now())));
    // the musaf segment: "ומוספין לבזיכין" (Yoma 33a) — on Shabbat the showbread after it; on Sukkot days the aravot
    if (what === 'musaf' && theme) {
      // ── avoda12 ── the musaf's libations and song: on Shabbat Haazinu (RH 31a), on Chol HaMoed the day's psalm (Sukkah 55a)
      if (musafSong(theme, jerusalemDay(now()))) list.push('shir');
      if (theme.sukkot && theme.sukkot.aravot) list.push('aravot');
      if (theme.info && theme.info.isShabbat) list.push('lechem');
    }
    if (!list) return null;
    if (from > 0 && from < list.length) list = list.slice(from);
    const chain = list.length > 1;
    busy = true; quitting = false;
    ui.showHome(false);
    const segment = what === 'erevchain' ? 'erev' : what === 'shachar' ? 'shachar' : what === 'musaf' ? 'musaf' : seg || null;   // ── avoda12 ── (musaf: its song)
    const label = mineRun ? HB.MINE_HE : what === 'shachar' ? SEGMENTS.shachar.he : what === 'erevchain' ? SEGMENTS.erev.he : list.length > 1 && SEGMENTS[what] ? SEGMENTS[what].he : GAMES[what] ? GAMES[what].he : what;
    const day = jerusalemDay(now());
    const lots = S.drawLots(A, day);
    persist();
    const before = S.rankOf(A.points).rank;
    const totals = { points: 0, steps: 0, real: 0, games: 0 };
    const shared = {};                                  // handles passed between the games of one run (the lamb)
    emit('run', { what, live, list });
    // before the morning Tamid nothing is offered (Pesachim 58b): clear the world's ambient pilgrims and kohanim
    W.av('ambient', false);
    if (live && seg && S.markLive(A, day, seg)) emit('live', { seg, day });
    if (what === 'shachar' || what === 'erevchain') sfx.play('fanfare');
    // ── hooks ── joining the morning live after the payis: the lot already fell in the Chamber of Hewn Stone — reveal it
    // (the daily ritual must not be lost to a late joiner: the bots' regular, at 06:40, always joined after it)
    if (!opt.production && what === 'shachar' && from > SHACHAR.indexOf('payis2') && !HB.playedToday(A, 'payis2', day) && A.hk.reveal !== day && roleById(A.lots.role)) {
      A.hk.reveal = day; persist();
      await ui.card({ kicker: 'הפייס של היום', cards: [{ id: 'role', title: `התפקיד שלך היום: ${roleById(A.lots.role).win}`, summary: 'הפייס כבר נפל בלשכת הגזית, לפני שהגעת. את העבודה שלך אפשר לעשות "בפועל" בכל שעה — בכפתור "העבודה שלך היום".', quote: '', source: 'תמיד ג, א', draft: true }], button: 'להצטרף לעבודה' });
    }
    for (let i = 0; i < list.length; i++) {
      const id = list[i], def = MINIGAMES[id];
      // ── hooks ── the dots of the games he does "בפועל" today are marked on the service's progress
      ui.progress(chain ? list : null, i, label, list.map((g) => !!(FOR_REAL[g] && FOR_REAL[g](A.lots))));
      const role = roleById(A.lots.role);
      const forReal = !!(FOR_REAL[id] && FOR_REAL[id](A.lots)) && !(id === 'ketoret' && A.ketoret.done);
      const watch = id === 'ketoret' && live && !forReal;
      // ── hooks ── a repeat: shorter walk-in/after waits and a brief card; the game gets repeat/tier to shorten itself
      const repeat = HB.seenBefore(A, id), againToday = HB.playedToday(A, id, day);
      const gctx = {
        root: ui.el, sfx, world: W, fast, lots: A.lots, role, forReal, watch, live, theme, segment, name: A.name, now, haptic, shared,
        repeat, tier: HB.tierOf(A, id),
        day, emit: (type, d) => emit(type, d),   // ── avoda12 ── the game's own events (the song → music.event('shir', …, 'B'))
        need: id === 'dir' ? needFor(day) : null,   // ── service13 ── the pens: tomorrow's animals from the calendar
        onGame: (g) => { current = g; emit('game', g ? { id: g.id, phase: 'open' } : { phase: 'closed' }); },
        onMiss: (gid, text) => emit('miss', { id: gid, text }),
      };
      if (def.stage) await race(def.stage(W, gctx), HB.stageCap(A, id) * F);
      const r = await runGame(def, gctx);
      if (def.after) await race(def.after(W, gctx), HB.afterCap(A, id) * F);
      HB.beforeGame(A, id);   // ── hooks ──
      // the rules
      if (id === 'payis2' && r.role) A.lots.role = r.role;
      if (id === 'payis3' && A.lots.ketoret === false) S.ketoretTry(A, day);
      const legendary = id === 'ketoret' && forReal && !r.skipped && S.ketoretDone(A, day, now());
      const L = S.learn(A, id, GAMES[id] ? GAMES[id].steps : [], { live, forReal: forReal && !r.skipped, role: FOR_REAL[id] ? (id === 'deshen' || id === 'kiddush' ? 'deshen' : A.lots.role) : null, perfect: r.perfect && !r.skipped, score: r.score, now: now(), again: againToday /* ── hooks ── */ });
      if (id === 'korbanot') { A.stats.pilgrims += r.pilgrims || 0; A.stats.correct += r.score || 0; }
      // ── hooks ── mastery, the vessels, the festival days, his mishmar's week (a festival: all the mishmarot) doubles "נכחת בזמן"
      const hk = HB.afterGame(A, id, { ...r, forReal }, day);
      if (theme && theme.sukkot && !r.skipped) HB.festMark(A, theme, day);
      const doubleLive = live && !againToday && !r.skipped && HB.mishmarWeek(A, mishmarNow(), theme);
      if (doubleLive) { S.addPoints(A, S.POINTS.live); L.points += S.POINTS.live; }
      const streak = S.touchStreak(A, S.dayKey(now()), isRestDay, (last, d) => HB.graceCovers(A, last, d, isRestDay));   // ── hooks ── (one weekday a week covered)
      persist();
      totals.points += L.points; totals.steps += L.newSteps.length; totals.real += forReal ? 1 : 0; totals.games++;
      emit('done', { id, skipped: r.skipped, mistakes: r.mistakes, points: L.points, newSteps: L.newSteps, forReal, live, legendary });
      // the source card(s)
      const gains = [{ t: `+${L.points} זכויות`, cls: '' }];
      if (L.newSteps.length) gains.push({ t: `+${L.newSteps.length} בספר העבודה` });
      if (forReal) gains.push({ t: 'עבודה בפועל', cls: 'real' });
      if (live) gains.push({ t: 'נכחת בזמן', cls: 'live' });
      if (legendary) gains.push({ t: 'הקטרת קטורת — פעם בחיים', cls: 'real' });
      if (streak.grew && streak.n > 1) gains.push({ t: `רצף ${streak.n} ימים` });
      if (r.perfect && !r.skipped) gains.push({ t: 'בלי טעויות' });
      // ── hooks ──
      if (doubleLive) gains.push({ t: theme && theme.kind === 'festival' ? 'ברגל כל המשמרות עולות: +5' : 'משמר בשבוע: +5', cls: 'live' });
      if (againToday) gains.push({ t: 'תרגול נוסף היום' });
      if (hk.tierUp) gains.push({ t: `דרגה חדשה: ${HB.tierHe(hk.tierUp)}`, cls: 'real' });
      if (hk.vessels.length) gains.push({ t: `כלי חדש: ${hk.vessels.map((v) => v.he).join(', ')}` });
      // ── service13 ── Beit Avtinas' batch into his store; the day's ketoret (½ in the morning, ½ in the evening, once a day each)
      // from it — an empty store never stops the service (the Temple burns its own); the pens tended (adds only, never takes)
      if (!r.skipped) {
        if (id === 'pitum' && r.pitum) { const P = S.pitumAdd(A, day); gains.push({ t: P.added ? `+${P.added} מנה באוצר הקטורת` : 'אוצר הקטורת מלא לשנה', cls: 'real' }); emit('pitum', P); }
        if (id === 'ketoret' || id === 'neirot') { const U = S.pitumUse(A, day, id === 'neirot' ? 'pm' : 'am'); if (U.used && U.fromStore) gains.push({ t: `½ מנה מן הקטורת שפיטמת · נשארו ${U.manim}` }); emit('ketoretUse', { when: id === 'neirot' ? 'pm' : 'am', ...U }); }
        if (id === 'dir' && r.dir) { const D = S.dirTend(A, day, r.dir); if (r.dir.n) gains.push({ t: `+${r.dir.n} טלאים בדוקים ללשכה` }); emit('dir', D); }
        persist();
      }
      // ── /service13 ──
      let cards = cardsFor(id);
      if (id === 'korbanot' && r.offerings) cards = cards.concat(r.offerings.map((k) => toCard(korban(k))).filter(Boolean));
      if (id === 'musaf' && theme && theme.musaf.length) cards = theme.musaf.map(toCard).concat(cards);
      if (id === 'payis2' && role) cards.unshift({ id: 'role', title: `התפקיד שלך היום: ${roleById(A.lots.role).win}`, summary: 'את העבודה הזאת תעשה היום "בפועל"; את כל השאר תראה ותלמד. מחר — תפקיד אחר, עד שתעבור את כל שלושה עשר.', quote: '', source: 'תמיד ג, א', draft: true });
      if (opt.production) cards = cards.filter((c) => !c.draft);          // PROJECT.md §2.2: approved content only
      busy = true;
      const again = id === 'korbanot' && i === list.length - 1;
      // ── hooks ── a repeat gets the brief card (tap for the source; it moves on by itself) — not the payis reveal,
      // not a legendary moment, not a new tier, not the last card of a service
      const brief = repeat && !r.skipped && id !== 'payis2' && !legendary && !hk.tierUp && i < list.length - 1;
      const v = await ui.card({ kicker: `${label}${list.length > 1 ? ` · ${i + 1}/${list.length}` : ''}`, cards, gains, text: r.skipped ? 'דילגת — אפשר לחזור לזה בכל עת.' : '', button: i < list.length - 1 ? 'לעבודה הבאה' : 'סיום', alt: again ? 'עוד עולי רגל' : null, brief });
      if (again && v === 'alt') { list.push('korbanot'); ui.progress(null); }
      if (quitting) break;
    }
    ui.progress(null);
    // the summary
    const after = S.rankOf(A.points);
    let mineNext = null, summaryV = null;   // ── hooks ──
    const lines = [`${totals.games} עבודות · +${totals.points} זכויות · ${Object.keys(A.book).length}/40 בספר העבודה`];
    if (from > 0) lines.push('הצטרפת באמצע העבודה — את השלבים שלפני כן אפשר ללמוד בכל עת.');
    if (totals.real) lines.push(`${totals.real === 1 ? 'עבודה אחת' : `${totals.real} עבודות`} בפועל — התפקיד שלך היום: ${roleById(A.lots.role).win}`);   // ── hooks ── (agreement)
    // ── hooks ── one line for the ממונים met (their card follows), the ritual marked, and what tomorrow brings
    if (after.rank > before) lines.push(after.rank - before > 1 ? `פגשת ${after.rank - before} ממונים חדשים (${after.rank}/15)` : `פגשת ממונה חדש: ${MEMUNIM[before] ? MEMUNIM[before].name_he : ''} (${after.rank}/15)`);
    else if (after.next) lines.push(`${after.next - A.points === 1 ? 'עוד זכות אחת' : `עוד ${after.next - A.points} זכויות`} לממונה הבא (${after.rank + 1}/15)`);
    if (mineRun && !quitting) HB.mineDone(A, day);
    lines.push(`רצף: ${A.streak.n} ${A.streak.n === 1 ? 'יום' : 'ימים'} (שבת ויום טוב אינם שוברים אותו)`);
    const next = status && status.next ? `הבא במקדש: ${status.next.whenHe}` : '';
    if (next) lines.push(next);
    try { const tk = HB.addDays(day, 1), tm = HB.tomorrowHe(A, dayTheme(Date.parse(tk + 'T09:00:00+03:00')), tk, isRestDay); if (tm.length) lines.push(`מחר: ${tm.join(' · ')}`); } catch (e) { /* no calendar */ }
    // ── end hooks ──
    if ((chain || from > 0) && !quitting) {
      A.stats.services++;
      persist();
      sfx.play('fanfare');
      const tamid = what === 'shachar' || what === 'erevchain';
      const title = mineRun ? 'העבודה שלך היום — נעשתה' : what === 'shachar' ? 'התמיד של שחר הושלם' : what === 'erevchain' ? 'התמיד של בין הערביים הושלם' : `${label} — הושלם`;
      // ── hooks ── his own work not done "בפועל" today (a late joiner, a chain without it): the ritual is one tap away
      const R0 = roleById(A.lots.role);
      mineNext = !mineRun && R0 && !HB.playedToday(A, R0.game, day) ? `העבודה שלך היום: ${R0.win} · כ־3 דקות` : null;
      summaryV = await ui.summary({ title, quote: tamid ? { q: 'זֶה הוּא סֵדֶר הַתָּמִיד לַעֲבוֹדַת בֵּית אֱלֹקֵינוּ', src: 'תמיד ז, ג' } : null, lines, gains: live ? [{ t: 'נכחת בזמן', cls: 'live' }] : [], alt: mineNext });
    }
    // each new rank: meet the ממונה (memunim.json, Shekalim 5:1)
    // ── hooks ── one card for all the ממונים met in this service (the first open, the rest folded)
    { const mc = HB.memunimCard(before, after.rank, (m) => (opt.production && isDraft(m) ? null : toCard(m))); if (mc && mc.cards.length) await ui.card(mc); }
    busy = false; quitting = false;
    W.av('ambient', true);
    emit('runDone', { what, totals });
    refreshClock(); pushStatus();
    ui.showHome(!dayOn());   // ── engine22 ── (the Temple, not the home, when the day is on)
    sceneKey = ''; liveScene();
    if (summaryV === 'alt' && mineNext) setTimeout(() => run('mine'), 60);   // ── hooks ── straight into the daily ritual
    return totals;
  }

  return {
    start, stop, frame,
    get state() { return A; },
    get busy() { return busy; },
    log, ui, sfx, world: W,
    /** for hosts (the scenes panel closes back to the home) */
    showHome() { try { ui.showHome(true); if (ui.renderHome) ui.renderHome(); } catch (e) { /* no home yet */ } },
    /** test hooks */
    _: {
      solve: () => (current ? current.solve() : null),
      get game() { return current ? current.id : null; },
      run, refreshClock, model,
      setState(fn) { fn(A); persist(); ui.renderHome(); },
    },
  };
}
