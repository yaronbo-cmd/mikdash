/* ─────────────────────────────────────────────────────────────────────────────
 * net/index.js — NET10 (wave 10): "כהנים יחד", two kohanim building together from two devices (a prototype; טיוטה).
 * The owner (28.9 21:33): "נרצה לשלב כמה שחקנים ביחד במשחק אחד משני מכשירים שונים שיהיו שני כהנים שיבנו ביחד ואולי יתחרו זה
 * בזה באיכות ובמהירות העבודה."
 *
 *   const net = createTogether({ game: () => game, stages: () => stages, life: () => life, scene, camera, view, mock })
 *   net.event(type, detail)     the game's events (main.js hands them over): strike · stoneSet (by the hero) · boulder
 *   net.open() / net.close()    the lobby card (the menu's button calls open)
 *   net.host() / net.join(code) / net.leave()
 *   net.menuHTML()              the menu's button (for a ui.js hook; else it is inserted into the menu sheet here)
 *   net.state, net.partner      (tests)
 *
 * Each device keeps its own save (nothing of it is shared or at risk). While together:
 *  · my presence says where my builder is, his last blow (a sequence number: absolute state) and my counts;
 *  · the other kohen is drawn in my world where his builder works (partner.js), his blows swing his hammer;
 *  · the session's document games/<code> holds each kohen's counts under his device key (members.<mid>): the stones set by
 *    either count for both — the panel's "יחד" is their sum, and every 10 together is a shared toast on both devices;
 *    with the game's hook game.coStone(site) (FLOW10, s10-flow: one crew stone, applied live), his stone at the site we
 *    share also sets a stone in MY world — guarded, so a build without it keeps the shared tally only;
 *  · a friendly race: perfect strikes (quality) and stones per minute (speed), no stakes, nothing lost.
 * Nothing here may block or break the game: every entry point is guarded; no transport → the card explains, nothing else.
 * ──────────────────────────────────────────────────────────────────────────── */
import { connect } from './transport.js';
import { APP, V, GOAL, newCode, isCode, newMid, cleanName, stats0, cleanStats, perMin, race, raceLine, ours, partnerOf, openWorks, besideSpot, pickSide } from './session.js';
import { createNetUI, T, markRect } from './ui.js';
import { createPartner } from './partner.js';
import { focusOf } from '../game/state.js';   // (read-only: the site the player works now — G.focus, else the game's own choice)

const TICK = 200, FLUSH = 1500, LOST = 6000;
const r1 = (v) => Math.round(v * 10) / 10;

export function createTogether(ctx = {}) {
  const fn = (f) => (typeof f === 'function' ? f : () => f);
  const gameOf = fn(ctx.game), stagesOf = fn(ctx.stages), lifeOf = fn(ctx.life);
  const now = () => Date.now();
  const warn = (k, e) => { try { console.warn('[net]', k, e && e.message ? e.message : e); } catch (_) { /* */ } };
  const guard = (k, f) => (...a) => { try { return f(...a); } catch (e) { warn(k, e); return undefined; } };

  // this tab's device key (a reload keeps it; another tab or phone has its own)
  let mid = null;
  try { mid = sessionStorage.getItem('bh_net_mid'); } catch (e) { /* blocked */ }
  if (!mid || !/^k[0-9a-z]{8}$/.test(mid)) { mid = newMid(); try { sessionStorage.setItem('bh_net_mid', mid); } catch (e) { /* in memory */ } }

  const st = {
    phase: 'off',               // off · lobby · wait (my work is open, nobody yet) · play (together)
    code: '', host: false, me: stats0(now()),
    him: null,                  // { mid, name, st, site, seen, here }
    hitN: 0, hitP: false, hitSeen: -1, stonesSeen: -1,
    members: {}, total: 0, goal: GOAL, err: '', sent: '', flushT: 0, cheerT: 0,
  };
  let t = null, connecting = null, offPeers = null, offCheer = null, offDoc = null, doc = null, timer = null, docReady = Promise.resolve();

  const ui = createNetUI({ onAction: guard('action', onAction) });
  let pk = null;
  function partner() {
    if (pk) return pk;
    const S = stagesOf(), L = lifeOf();
    if (!S || !L || !ctx.scene || !ctx.camera || !ctx.view) return null;
    const ground = (x, z) => { try { const y = S.groundAt(x, z); return Number.isFinite(y) ? y : 0; } catch (e) { return 0; } };
    pk = createPartner({ scene: ctx.scene, camera: ctx.camera, life: L, ground, project: (x, y, z) => ctx.view.project(x, y, z), ui, mine: myPos });
    return pk;
  }

  /* ── the connection (lazy: only when the player opens the mode) ── */
  function link() {
    if (t) return Promise.resolve(t);
    if (!connecting) {
      connecting = connect({ mock: ctx.mock === true ? true : ctx.mock === false ? false : undefined }).then((tr) => {
        t = tr;
        if (t) {
          offPeers = t.onPeers(guard('peers', onPeers));
          offCheer = t.on('cheer', guard('cheer', onCheer));
        }
        return t;
      });
    }
    return connecting;
  }

  /* ── the lobby ── */
  function open() {
    if (st.phase === 'wait' || st.phase === 'play') { lobbyOrPanel(); return; }
    st.phase = 'lobby'; st.err = '';
    closeSheet();
    ui.lobby({ kind: 'wait' });
    link().then(() => { if (st.phase === 'lobby') lobbyRender(); });
  }
  function lobbyRender() {
    const list = t ? ours(t.peers(), now()) : [];
    ui.lobby({ kind: t ? t.kind : 'none', works: openWorks(list, mid), err: st.err });
  }
  function close() { if (st.phase === 'lobby') st.phase = 'off'; ui.lobbyOff(); }
  function closeSheet() { try { const g = gameOf(); if (g && g.ui && typeof g.ui.closeSheet === 'function') g.ui.closeSheet(); } catch (e) { /* */ } }
  function lobbyOrPanel() { closeSheet(); ui.more(true); panel(true); }   // (in a shared work, the menu's button opens its details)

  function onAction(kind, arg) {
    if (kind === 'host') host();
    else if (kind === 'join') join(arg);
    else if (kind === 'close') close();
    else if (kind === 'leave') leave();
    else if (kind === 'cheer') cheer();
    else if (kind === 'edge') lookAtHim();
  }

  /* ── a shared work ── */
  function host() { if (!t) return; start(newCode(), true); }
  function join(code) {
    const c = String(code || '').replace(/\D/g, '');
    if (!t) return;
    if (!isCode(c)) { st.err = 'קוד של 4 ספרות, למשל 4821'; lobbyRender(); return; }
    start(c, false);
  }
  function start(code, isHost, resume = false) {
    stopSession(false);
    Object.assign(st, { code, host: isHost, me: stats0(now()), him: null, hitN: 0, hitSeen: -1, stonesSeen: -1, members: {}, total: 0, goal: 0, err: '', sent: '' });
    st.phase = isHost ? 'wait' : 'play';
    ui.lobbyOff();
    publish(true);
    doc = t.doc('games/' + code);
    const body = { v: V, code, t0: now(), members: { [mid]: st.me } };
    if (isHost && !resume) docReady = doc.set(body);
    else {
      const d = doc;
      docReady = d.get().then((v) => {
        if (d !== doc) return null;
        // (back after a reload: my own counts come back from the shared work, and its "together" goes on from there)
        const m = resume && v && v.members && v.members[mid];
        if (m) { const c = cleanStats(m, now()); for (const k of ['stones', 'perfect', 'strikes']) st.me[k] = Math.max(st.me[k], c[k]); st.me.t0 = Math.min(st.me.t0, c.t0); st.goal = 0; publish(true); refresh(); }
        return v ? d.update({ members: { [mid]: { ...st.me } } }) : d.set(body);
      });
    }
    try { sessionStorage.setItem('bh_net_s', JSON.stringify({ code, host: !!isHost })); } catch (e) { /* no resume */ }
    offDoc = doc.onSnapshot(guard('doc', (v) => { st.members = (v && v.members && typeof v.members === 'object') ? v.members : {}; refresh(); }));
    clearInterval(timer); timer = setInterval(guard('tick', tick), TICK);
    const p = partner(); if (p) p.show(false);
    refresh(); panel(true);
  }
  function stopSession(clearPresence = true) {
    clearInterval(timer); timer = null;
    if (offDoc) { try { offDoc(); } catch (e) { /* */ } offDoc = null; }
    if (doc && st.code) flush(true);
    doc = null;
    if (pk) pk.show(false);
    if (clearPresence && t) t.presence({ app: null, v: null, code: null, host: null, mid: null, name: null, x: null, z: null, yaw: null, site: null, away: null, hit: null, st: null });
    st.sent = '';
  }
  function leave() {
    stopSession(true);
    st.phase = 'off'; st.code = ''; st.him = null;
    ui.panelOff();
    try { sessionStorage.removeItem('bh_net_s'); } catch (e) { /* */ }
  }
  /* a reload in the middle of a shared work (a phone's page may reload after its screen locks): the same tab goes back to it
     once the game is past its opening; nothing shows before */
  function resumeLater() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem('bh_net_s') || 'null'); } catch (e) { s = null; }
    if (!s || !isCode(s.code)) return;
    let tries = 0;
    const iv = setInterval(() => {
      if (++tries > 240) { clearInterval(iv); return; }
      const mg = myGame();
      if (!mg || mg.g.busy || st.phase !== 'off' || !partner()) return;
      clearInterval(iv);
      link().then((tr) => { if (tr && st.phase === 'off') { start(s.code, !!s.host, true); toast('חזרת לעבודה המשותפת', `${T.mode} · ${s.code}`); } });
    }, 1000);
  }
  resumeLater();

  /* ── my side: presence and the document ── */
  function myGame() {
    const g = gameOf(); const G = g && g.state;
    return G && typeof G === 'object' && G.st ? { g, G } : null;
  }
  const siteOf = (G) => { try { return focusOf(G) || ''; } catch (e) { return (G && G.focus) || ''; } };
  function publish(force) {
    if (!t || !st.code) return;
    const S = stagesOf(), mg = myGame();
    let x = null, z = null, yaw = 0;
    try { const h = S && S.hero; if (h) { const p = h.position; x = r1(p.x); z = r1(p.z); yaw = Math.round((h.yaw || 0) * 100) / 100; } } catch (e) { /* no builder */ }
    const L = lifeOf();
    const away = !mg || !!mg.g.whole || (L && L.phase && L.phase !== 'build');
    const p = { app: APP, v: V, code: st.code, host: st.host, mid, name: cleanName(mg && mg.G.name), x, z, yaw, site: mg ? siteOf(mg.G) : '', away, hit: { n: st.hitN, p: st.hitP }, st: st.me };
    const k = JSON.stringify(p);
    if (!force && k === st.sent) return;
    st.sent = k;
    t.presence(p);
  }
  function flush(force) {
    if (!doc) return;
    const n = now();
    if (!force && n - st.flushT < FLUSH) { st.flushDue = true; return; }
    st.flushT = n; st.flushDue = false;
    const d = doc, me = { ...st.me };
    docReady = docReady.then(() => d.update({ members: { [mid]: me } }), () => d.update({ members: { [mid]: me } }));   // (after the document exists: update needs it)
  }

  /** the game's events (main.js): only while together */
  function event(type, d) {
    if (st.phase !== 'wait' && st.phase !== 'play') return;
    const me = st.me;
    if (type === 'strike') {
      me.strikes++; if (d && d.perfect) me.perfect++;
      st.hitN++; st.hitP = !!(d && d.perfect);
      publish(); refresh();
    } else if ((type === 'stoneSet' && d && d.by === 'hero') || type === 'boulder') {
      me.stones += type === 'stoneSet' && Number.isFinite(d.n) && d.n > 0 ? Math.min(3, d.n) : 1;
      publish(); flush(); refresh(); ui.flash();
    }
  }

  /* ── his side ── */
  function onPeers() {
    if (st.phase === 'lobby') { lobbyRender(); return; }
    if (st.phase === 'wait' || st.phase === 'play') see();
  }
  function see() {
    if (!t || !st.code) return;
    const n = now();
    const o = partnerOf(ours(t.peers(), n), st.code, mid);
    const p = partner();
    if (o) {
      const q = o.p, first = !st.him || st.him.mid !== q.mid;
      if (first) { st.hitSeen = q.hit.n; st.stonesSeen = q.st.stones; }
      const was = st.him && st.him.here;
      st.him = { mid: q.mid, name: q.name, st: q.st, site: q.site, seen: n, here: true, away: q.away, x: q.x, z: q.z, yaw: q.yaw };
      if (st.phase === 'wait') st.phase = 'play';
      if (!was) toast(`${q.name || T.other} ${st.host ? 'הצטרף' : 'כאן'}`, 'עכשיו אתם בונים יחד · ' + st.code);
      if (p) {
        const show = !q.away && q.x != null;
        p.show(show);
        p.label(q.name || T.other, siteName(q.site));
        if (show) {
          const me = myPos(), cam = ctx.camera ? [ctx.camera.position.x, ctx.camera.position.z] : null;
          const hx = me ? me.x : NaN, hz = me ? me.z : NaN;
          // beside me: the side away from the game's pointer (my stone), chosen when we meet and kept while we stay put
          const key = `${Math.round(q.x / 3)},${Math.round(q.z / 3)},${Math.round(hx / 3)},${Math.round(hz / 3)}`;
          if (st.sideKey !== key) {
            st.sideKey = key; st.side = 1;
            const a = besideSpot(q.x, q.z, hx, hz, cam, 1), b = besideSpot(q.x, q.z, hx, hz, cam, -1), m = markRect();
            if (a && b && m && ctx.view && (a[0] !== b[0] || a[1] !== b[1])) {
              const pr = (s) => { const o = ctx.view.project(s[0], (me ? me.y : 0) + 1.5, s[1]); return { x: o.x, y: o.y }; };
              st.side = pickSide(pr(a), pr(b), { x: (m.left + m.right) / 2, y: (m.top + m.bottom) / 2 });
            }
            // (the step aside is fixed when we meet: the camera orbiting does not walk him round me)
            const c = besideSpot(q.x, q.z, hx, hz, cam, st.side);
            st.off = c && Number.isFinite(hx) ? [c[0] - hx, c[1] - hz] : null;
          }
          const near = Number.isFinite(hx) && Math.hypot(q.x - hx, q.z - hz) < 3.5;
          const s = near && st.off && Math.hypot(st.off[0], st.off[1]) > 1 ? [hx + st.off[0], hz + st.off[1]] : besideSpot(q.x, q.z, hx, hz, cam, st.side);
          if (s) p.target(s[0], s[1], q.yaw);
        }
        if (q.hit.n > st.hitSeen) { st.hitSeen = q.hit.n; p.strike(q.hit.p); }
      }
      if (q.st.stones > st.stonesSeen) {
        const k = q.st.stones - Math.max(0, st.stonesSeen); st.stonesSeen = q.st.stones;
        if (p) p.say(k > 1 ? `+${k} אבנים` : '+1 אבן', true);
        ui.flash();
        coStone(q.site, k);
      }
    } else if (st.him && st.him.here && n - st.him.seen > LOST) {
      st.him.here = false;
      if (p) p.show(false);
      toast(`${st.him.name || T.other} יצא`, 'העבודה שלו נשמרה בעבודה המשותפת');
    }
    refresh();
  }
  /** his stone at the site we share: a stone in my world too, when the game offers the hook (guarded) */
  function coStone(site, k) {
    const mg = myGame(); if (!mg || !site || site !== siteOf(mg.G)) return;
    if (typeof mg.g.coStone !== 'function') return;
    for (let i = 0; i < Math.min(3, k); i++) { try { mg.g.coStone(site); } catch (e) { warn('coStone', e); return; } }
  }
  function myPos() { try { const S = stagesOf(); return S && S.hero ? S.hero.position : null; } catch (e) { return null; } }
  function siteName(id) {
    try { const mg = myGame(); if (!id) return ''; if (mg && id === siteOf(mg.G)) return ''; } catch (e) { /* */ }
    const N = { har: 'בהר', wall: 'בחומה', sorag: 'בסורג', gates: 'בשערים', nashim: 'בעזרת נשים', nikanor: 'בשער ניקנור', lishka: 'בלשכות', yesod: 'ביסוד המזבח', sovev: 'בסובב', guf: 'בגוף המזבח', karnot: 'בקרנות', kiyor: 'בכיור', ulam: 'באולם', heichal: 'בהיכל', kodesh: 'בקודש הקודשים' };
    return N[id] || '';
  }
  /* the edge chip's tap: the camera flies to HIM, close — (FUN11, PRODUCER10 N31) he stands ≥ 80 px tall in the frame: the
     builder's size is ~5 amot, the phone's fov 32° over 844 px → 80 px at ≤ 90 amot; LOOK_D 42 (× 1.35 on a phone ≈ 57 amot)
     gives him ~130 px, at 18° (a low, working view, not the steep top-down one over the fog). Never the whole hill (the owner's
     "זום אאוט"); the player's next tap on the world brings the frame back to his own kohen, as close (the game's own flight to
     its target, when it makes one, follows and wins) */
  const LOOK_D = 42, LOOK_EL = 18, LOOK_HOLD = 10;
  let backArmed = null, lookRel = null;
  const unhold = () => { if (lookRel) { try { lookRel(); } catch (e) { /* */ } lookRel = null; } };
  function lookAtHim() {
    const p = pk && pk.state; if (!p || p.x == null || !ctx.view || !ctx.camera) return;
    const c = ctx.camera.position, az = Math.atan2(c.z - p.z, c.x - p.x) * 180 / Math.PI;
    try { ctx.view.lookAt(p.x, p.y + 2.5, p.z, LOOK_D, az, LOOK_EL, 1300); } catch (e) { warn('look', e); return; }
    // (FUN11, N31) the game's camera nets would take the frame back to MY work at once (my kohen is out of this close frame):
    // they wait while he is looked at — until the next tap on the world, or 10 s
    unhold();
    try { const g = myGame(); const api = g && g.g; if (api && typeof api.holdCam === 'function') lookRel = api.holdCam(LOOK_HOLD); } catch (e) { lookRel = null; }
    if (backArmed) document.removeEventListener('pointerdown', backArmed, true);
    backArmed = (e) => {
      if (!e.target || e.target.tagName !== 'CANVAS') return;                          // (a tap on the world, not on a button)
      document.removeEventListener('pointerdown', backArmed, true); backArmed = null;
      unhold();
      const me = myPos(); if (!me || !Number.isFinite(me.x)) return;
      const cc = ctx.camera.position, a2 = Math.atan2(cc.z - me.z, cc.x - me.x) * 180 / Math.PI;
      try { ctx.view.lookAt(me.x, me.y + 2.5, me.z, LOOK_D, a2, LOOK_EL, 1100); } catch (err) { warn('look back', err); }
    };
    setTimeout(() => { if (backArmed) document.addEventListener('pointerdown', backArmed, true); }, 0);   // (not the chip's own tap)
  }

  /* ── the cheer: "יישר כוח" (a moment on the 'cheer' topic) ── */
  function cheer() {
    if (!t || !st.code || now() - st.cheerT < 2500) return;
    st.cheerT = now();
    t.emit('cheer', { code: st.code, mid });
    toast('שלחת "יישר כוח"', st.him && st.him.name ? `ל${st.him.name}` : '');
  }
  function onCheer(data, from) {
    if (from && from.self) return;
    if (!data || data.code !== st.code || data.mid === mid) return;
    if (pk) pk.say('יישר כוח!', true);
    toast(`${(st.him && st.him.name) || T.other}: יישר כוח!`, '');
  }

  /* ── the panel ── */
  function stats() {
    const n = now();
    const himSt = st.him ? st.him.st : null;
    // the joint total: my live count + everyone else in the document (his live count when it is newer)
    let total = st.me.stones;
    const seen = new Set([mid]);
    for (const [k, m] of Object.entries(st.members || {})) {
      if (seen.has(k)) continue; seen.add(k);
      const c = cleanStats(m, n).stones;
      total += st.him && k === st.him.mid && himSt ? Math.max(c, himSt.stones) : c;
    }
    if (st.him && himSt && !seen.has(st.him.mid)) total += himSt.stones;
    return { n, himSt, total };
  }
  function refresh() {
    if (st.phase !== 'wait' && st.phase !== 'play') return;
    const { n, himSt, total } = stats();
    if (!st.goal) st.goal = (Math.floor(total / GOAL) + 1) * GOAL;        // (the next round number from here: no toast on arrival)
    else if (total >= st.goal) {
      const g = Math.floor(total / GOAL) * GOAL;
      st.goal = g + GOAL;
      toast(`יחד: ${g} אבנים!`, 'יישר כוח לשני הכהנים');
      // the site's crews cheer (the world's own celebration, stages.crewsCheer) and the other kohen lifts his arms
      try { const S = stagesOf(), mg = myGame(); if (S && typeof S.crewsCheer === 'function' && mg && siteOf(mg.G)) S.crewsCheer(siteOf(mg.G)); } catch (e) { /* */ }
      if (pk) { pk.celebrate(); pk.say('יחד!', true); }
    }
    st.total = total;
    panel(false, n, himSt, total);
  }
  function panel(force, n = now(), himSt = st.him ? st.him.st : null, total = st.total) {
    if (st.phase !== 'wait' && st.phase !== 'play') return;
    const mg = myGame();
    const myName = cleanName(mg && mg.G.name);
    const R = race(st.me, himSt, n);
    const himName = (st.him && st.him.name) || T.other;
    const lead = (who) => [R.q === who ? 'מדויק' : '', R.s === who ? 'זריז' : ''].filter(Boolean).join(' · ');
    const live = !!(st.him && st.him.here);
    // (both opened a work at once: while I wait, another open work is offered — one tap joins it instead)
    const offer = st.phase === 'wait' && !st.him && t ? openWorks(ours(t.peers(), n), mid).filter((w) => w.code !== st.code)[0] || null : null;
    ui.panel({
      code: st.code, wait: st.phase === 'wait' && !st.him, live, total, offer,
      me: { name: myName ? `${T.you} (${myName})` : T.you, stones: st.me.stones, perfect: st.me.perfect, acc: st.me.strikes >= 3 ? Math.round(100 * st.me.perfect / st.me.strikes) : null, spm: r1(perMin(st.me, n)), lead: lead('me') },
      him: himSt ? { name: himName, stones: himSt.stones, perfect: himSt.perfect, acc: himSt.strikes >= 3 ? Math.round(100 * himSt.perfect / himSt.strikes) : null, spm: r1(perMin(himSt, n)), lead: lead('him') } : null,
      line: st.him ? (live ? raceLine(R, himName) : `${himName} לא מחובר כרגע · העבודה נשמרה`) : raceLine(R, himName),
    });
  }
  function toast(title, body) {
    try { const g = gameOf(); if (g && g.ui && typeof g.ui.toast === 'function') { g.ui.toast({ icon: 'crew', title, body, kind: 'mini', ms: 2600 }); return; } } catch (e) { /* */ }
  }

  /* ── every 200 ms while together: my presence, his figure, the panel, a late flush ── */
  function tick() {
    publish();
    see();
    if (st.flushDue) flush();
    const L = lifeOf();
    if (pk && L && L.phase && L.phase !== 'build') pk.show(false);   // the whole view, Phase B, the tour: the building is done
  }

  /* ── the menu's button: a ui.js hook may place it (menuHTML); else it is inserted into the open menu sheet ── */
  let sheetBody = null, mo = null;
  function menuBind() {
    const b = document.querySelector('.gm .gm-sh-b');
    if (b === sheetBody) return;
    if (mo) mo.disconnect();
    sheetBody = b; mo = null;
    if (!b || typeof MutationObserver !== 'function') return;
    mo = new MutationObserver(guard('menu', menuFill)); mo.observe(b, { childList: true });
    menuFill();
  }
  function menuFill() {
    const b = sheetBody; if (!b || !b.querySelector('[data-a="newGame"]') || b.querySelector('[data-net="open"]')) return;
    const w = document.createElement('div'); w.innerHTML = ui.menuHTML();
    const sec = [...b.querySelectorAll('.gm-sec')].pop();
    if (sec) b.insertBefore(w.firstElementChild, sec); else b.appendChild(w.firstElementChild);
  }
  document.addEventListener('click', guard('menu click', (e) => { const x = e.target && e.target.closest && e.target.closest('[data-net="open"]'); if (x) { e.preventDefault(); open(); } }));
  setInterval(guard('menu bind', menuBind), 700);

  return {
    open: guard('open', open), close: guard('close', close), host: guard('host', host), join: guard('join', join), leave: guard('leave', leave),
    event: guard('event', event), cheer: guard('cheer', cheer), lookAtHim: guard('look', lookAtHim),
    menuHTML: () => ui.menuHTML(),
    link,
    get partner() { return pk; },
    get transport() { return t ? t.kind : null; },
    get state() {
      const { total } = stats();
      return { phase: st.phase, code: st.code, host: st.host, mid, me: { ...st.me }, him: st.him ? { ...st.him, st: { ...st.him.st } } : null, total, members: st.members, figure: pk ? pk.state : null };
    },
  };
}
