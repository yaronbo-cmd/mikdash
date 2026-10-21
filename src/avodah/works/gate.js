/* ── worksb22 ── gate.js — the pilgrims' queue at שער ניקנור (WAVE22 WORKSB22 #1; שקלים ה, א; זבחים ה, א; ה, ו).
 * People come to the gate's foot, each with an icon over the head (what he brings): 🐑 עולה · 🐐 חטאת · 🐏 שלמים · 🕊 קינים · 🌾 מנחה.
 * The אמרכל taps a person (or just a station: the front of the queue goes), then a station: the north (קדשי קדשים), the ramp (קדשים
 * קלים — anywhere in the Azara; the north too), Petachia's stall (the birds), the menachot table. A right send pays (gold at the first
 * try, good after a wait); a wrong one is "לא כאן — …", the person waits (no penalty, no timer). One person every ~20 s by day, never
 * more than four waiting; the rest "come tomorrow". The rule is on the station markers; the mishna is said after the end, not before.
 * המחשה: the stations' exact places in the Azara (the places.js frame) and the flow. Taps alone finish it. */
import { noteSent } from './offerq.js';   // ── bloodb25 ──
import { workBase, drainActs, WORK_N } from './common.js';

export const GATE_STATIONS = {
  north: { x: -38, z: -45, icon: '⬆', label: 'צפון', hint: 'עולה · חטאת · אשם', ok: ['olah', 'chatat'] },
  ramp: { x: -38, z: 47, icon: '⛰', label: 'הכבש', hint: 'שלמים · תודה — בכל העזרה', ok: ['shelamim'] },
  birds: { x: -24, z: 35, icon: '🕊', label: 'פתחיה', hint: 'קינים', ok: ['kinim'] },
  menachot: { x: -54, z: 37, icon: '🌾', label: 'המנחות', hint: 'סולת ומנחות', ok: ['mincha'] },
};
// (a peace-offering may be slaughtered anywhere in the Azara — the north is as good as the ramp: זבחים ה, ו)
const ALSO = { shelamim: ['north'] };
export const GATE_KINDS = {
  olah: { icon: '🐑', he: 'עולה', beast: 'lamb', wrong: 'לא כאן — עולה: צפון' },
  chatat: { icon: '🐐', he: 'חטאת', beast: 'goat', wrong: 'לא כאן — חטאת: צפון' },
  shelamim: { icon: '🐏', he: 'שלמים', beast: 'ram', wrong: 'לא כאן — שלמים: במזבח, לא אצל הקינים והמנחות' },
  kinim: { icon: '🕊', he: 'קינים', beast: 'dove', wrong: 'לא כאן — קינים: פתחיה' },
  mincha: { icon: '🌾', he: 'מנחה', beast: null, wrong: 'לא כאן — סולת: שולחן המנחות' },
};
const ORDER = ['olah', 'shelamim', 'kinim', 'chatat', 'mincha', 'olah', 'shelamim', 'kinim', 'mincha', 'chatat'];
// (the queue's frame: slots 3.5 amot east of the origin — the gate's marker — spawn 18 east, through Nikanor from the Court of the Women)
export const GATE_SLOTS = [[7, -5.4], [7, -1.8], [7, 1.8], [7, 5.4]];
const SPAWN = [22, 0];
const MENTOR = { text: 'קדשי קדשים — עולה, חטאת, אשם — שחיטתם בצפון. קדשים קלים — שלמים, תודה — בכל מקום בעזרה. פתחיה היה ממונה על הקינים.', src: 'זבחים ה, א; ה, ו; שקלים ה, א' };

export function createGateWork(ctx) {
  const THREE = ctx.THREE, av = ctx.av || null;
  const actors = ctx.actors || (av && av._actors) || null, animals = ctx.animals || (av && av._animals) || null;
  const route = (av && av.route) || ((x0, z0, x1, z1) => [[x1, z1]]);
  const G = (x, z) => (ctx.ground ? ctx.ground(x, z) : 0);
  const S = { q: [], seq: 0, sel: null, tomorrow: 0, clock: 0, every: 8, sent: 0, wrongs: 0, done: 0, ox: 0, oz: 0 };
  const slotXZ = (i) => [GATE_SLOTS[i][0] + S.ox, GATE_SLOTS[i][1] + S.oz];
  const okAt = (kind, st) => GATE_STATIONS[st].ok.includes(kind) || (ALSO[kind] || []).includes(st);

  function drawStations(B) {
    const k = B.kit; if (!k) return; k.clear();
    for (const id in GATE_STATIONS) {
      const s = GATE_STATIONS[id], y = G(s.x, s.z), pulse = 0.5 + 0.5 * Math.sin(B.t * 3);
      const gold = '!#FFD66E';
      for (const [dx, dz, w, d] of [[0, -1.6, 3.4, 0.16], [0, 1.6, 3.4, 0.16], [-1.6, 0, 0.16, 3.4], [1.6, 0, 0.16, 3.4]]) k.put(s.x + dx, y + 0.1, s.z + dz, w, 0.1, d, 0, gold);
      if (id === 'birds') { for (const dx of [-1.2, 1.2]) k.put(s.x + dx, y + 1.2, s.z - 0.6, 0.14, 2.4, 0.14, 0, '#6B4E31'); k.put(s.x, y + 2.45, s.z - 0.6, 3.0, 0.1, 1.5, 0, '#CBB894'); k.put(s.x, y + 0.65, s.z - 0.6, 2.2, 0.12, 0.9, 0, '#8A6A45'); k.put(s.x, y + 0.2, s.z - 0.6, 2.0, 0.4, 0.7, 0, '#A88A5E'); }
      else if (id === 'menachot') { k.put(s.x, y + 0.75, s.z, 2.6, 0.14, 1.2, 0, '#EDE5D6'); for (const dx of [-1.1, 1.1]) k.put(s.x + dx, y + 0.35, s.z, 0.16, 0.7, 0.9, 0, '#B9AA8A'); for (const dx of [-0.8, 0, 0.8]) k.put(s.x + dx, y + 0.95, s.z, 0.42, 0.26, 0.42, 0, '#F2E9D0'); }
      else if (id === 'north') { k.put(s.x, y + 0.45, s.z, 2.4, 0.9, 1.0, 0, '#EEE9DF'); k.put(s.x, y + 0.95 + 0.06 * pulse, s.z, 2.0, 0.08, 0.8, 0, '!#FFE9A8'); }
      else { k.put(s.x, y + 0.4, s.z, 1.0, 0.8, 1.6, 0, '#D6C8AC'); k.put(s.x, y + 0.9 + 0.06 * pulse, s.z, 0.8, 0.08, 1.3, 0, '!#FFE9A8'); }
    }
    k.flush();
  }

  function mkPilgrim(B, kind) {
    const K = GATE_KINDS[kind]; let slot = -1;
    for (let i = 0; i < GATE_SLOTS.length; i++) if (!S.q.some((p) => p.slot === i)) { slot = i; break; }
    if (slot < 0) { S.tomorrow++; return null; }
    const id = ++S.seq, [sx, sz] = slotXZ(slot);
    const p = { id, kind, slot, state: 'wait', tries: 0, a: null, an: [], key: 'p' + id, x: SPAWN[0], z: SPAWN[1] + (slot - 1.5) * 1.2 };
    p.x += S.ox; p.z += S.oz;
    if (actors) {
      const a = actors.add(id % 3 === 0 ? 'woman' : 'pilgrim', p.x, p.z, { yaw: -Math.PI / 2, fadeIn: true, ground: ctx.ground }); p.a = a;
      if (K.beast === 'dove') { actors.setItem(a, 'cage'); }
      else if (kind === 'mincha') actors.setItem(a, 'bowl');
      else if (animals && K.beast) { const an = animals.add(K.beast, a.x + 2, a.z, { ground: ctx.ground, calm: true }); an.follow = a; an.followDist = 2.4; a.rope = an; p.an.push(an); }
      if (K.beast === 'dove' && animals) for (let i = 0; i < 2; i++) { const b = animals.add('dove', a.x, a.z, { calm: true, scale: 0.8, ground: ctx.ground }); b.held = { x: 0, y: 0, z: 0, yaw: 0 }; b.heldBy = a; b.heldOff = i ? 0.1 : -0.1; p.an.push(b); }
      actors.walk(a, route(a.x, a.z, sx, sz), 4.2).then(() => { if (p.state === 'wait' && p.a && p.a.alive) actors.face(p.a, -30, p.a.z); });
    } else p.state = 'wait';
    S.q.push(p); return p;
  }
  const pos = (p) => (p.a && p.a.alive ? [p.a.x, p.a.y + 3.5, p.a.z] : [slotXZ(p.slot)[0], G(7 + S.ox, S.oz) + 3.5, slotXZ(p.slot)[1]]);

  function vanish(p) {
    const done = () => { if (p.a) actors.remove(p.a); for (const an of p.an) { an.visT = 0; an.onHide = () => animals.remove(an); } S.q = S.q.filter((x) => x !== p); };
    if (!p.a || !actors) { done(); return; }
    const st = GATE_STATIONS[p.to] || GATE_STATIONS.north;
    actors.walk(p.a, route(p.a.x, p.a.z, st.x, st.z), 7).then(() => { p.a.visT = 0; p.a.onHide = done; setTimeout(done, 1600); });
  }

  function select(B, key) {
    const p = S.q.find((x) => x.key === key); if (!p || p.state !== 'wait') return;
    S.sel = S.sel === p.id ? null : p.id;
    for (const q of S.q) B.ui.chipCls(q.key, 'sel', q.id === S.sel);
    if (S.sel) B.ui.say(`${GATE_KINDS[p.kind].he} — לאן? הקישו על תחנה`, { ms: 4000 });
  }
  function send(B, st) {
    const M = B.M; if (!M || M.phase !== 'work') return false;
    let p = S.q.find((x) => x.id === S.sel && x.state === 'wait') || S.q.filter((x) => x.state === 'wait').sort((a, b) => a.id - b.id)[0];
    if (!p) { B.ui.say('אין עכשיו מי שממתין — הם מגיעים', { ms: 2500 }); return false; }
    const K = GATE_KINDS[p.kind];
    if (!okAt(p.kind, st)) {
      p.tries++; S.wrongs++; M.misses = (M.misses | 0) + 1;
      B.ui.shake(p.key); B.ui.say(K.wrong, { ms: 4200 });
      return false;
    }
    p.state = 'sent'; p.to = st; S.sel = null; S.sent++;
    const at = pos(p); at[1] -= 1.2;
    M.hit(p.tries ? 1 : 2, { x: 0.5, y: 0.4, say: p.tries ? '' : 'ישר למקום' });
    drainActs(ctx, B.ui, M, at, 'שער');
    B.ui.drop(p.key); B.ui.say(`${K.he} — ${GATE_STATIONS[st].label} ✓`, { ms: 2200 });
    if (ctx.stock) { try { if (p.kind === 'kinim') ctx.stock.take('doves', 1); else if (p.kind === 'mincha') ctx.stock.take('flour', 1); } catch (e) { /* */ } }
    vanish(p); B.ui.count(`${M.i}/${M.n}`, 'הוכוונו');
    if (ctx.emit) { try { ctx.emit('gateSent', { kind: p.kind, to: st, tries: p.tries }); } catch (e) { /* */ } }
    noteSent(p.kind);   // ── bloodb25 ── (the rings play each kind's own chain: offerq.js → more.js yachid)
    return true;
  }

  const W = workBase(ctx, {
    id: 'gate', n: (L) => WORK_N[L], coach: 'הקישו על אדם ואחר כך על התחנה הנכונה — או רק על התחנה: הראשון בתור הולך',
    build(B, o) {
      S.q = []; S.seq = 0; S.sel = null; S.tomorrow = 0; S.clock = 0; S.sent = 0; S.wrongs = 0; S.every = o.every > 0 ? +o.every : 8;   // ── polish23 ── (a kid's pace: 8 s, four waiting at most)
      // (the queue stands east of the marker: Phase B's gate marker is at the gate's inside, and he looks east through Nikanor)
      S.ox = o.origin ? o.origin.x - 3.5 : 0; S.oz = o.origin ? o.origin.z : 0;
      B.M.autoFn = () => { const p = S.q.filter((x) => x.state === 'wait').sort((a, b) => a.id - b.id)[0]; if (!p) return; const st = Object.keys(GATE_STATIONS).find((s) => okAt(p.kind, s)); send(B, st); };
      B.ui.setBar(Object.keys(GATE_STATIONS).map((id) => ({ key: id, icon: GATE_STATIONS[id].icon, label: `${GATE_STATIONS[id].label}<br><small>${GATE_STATIONS[id].hint}</small>`, onTap: (k) => send(B, k) })));
      for (const id in GATE_STATIONS) { const s = GATE_STATIONS[id]; B.ui.chip('s-' + id, { at: () => [s.x, G(s.x, s.z) + 3.2, s.z], icon: s.icon, label: `${s.label}<br>${s.hint}`, cls: 'st', onTap: () => send(B, id) }); }
      B.ui.say('מי שמגיע לשער — לאן? הקישו על תחנה', { ms: 5000 });
      B.ui.count(`0/${B.M.n}`, 'הוכוונו');
      for (let i = 0; i < Math.min(2, o.first == null ? 2 : o.first); i++) mkPilgrim(B, ORDER[S.seq % ORDER.length]);
    },
    tick(dt, B) {
      if (B.M.phase === 'work') {
        S.clock += dt;
        if (S.clock >= S.every) { S.clock = 0; mkPilgrim(B, ORDER[S.seq % ORDER.length]); }
      }
      for (const p of S.q) {
        if (p.state === 'sent') continue;
        B.ui.chip(p.key, { at: () => pos(p), icon: GATE_KINDS[p.kind].icon, label: GATE_KINDS[p.kind].he, cls: p.state === 'wait' ? (S.sel === p.id ? 'sel' : '') : 'done', onTap: (k) => select(B, k) });
      }
      if (S.tomorrow && B.M.phase === 'work') B.ui.count(`${B.M.i}/${B.M.n}`, `${S.tomorrow} יבואו מחר`);
      drawStations(B);
    },
    end(B) {
      B.ui.say(MENTOR.text, { src: MENTOR.src, mentor: true });
      B.ui.count(`${B.M.n}/${B.M.n}`, S.tomorrow ? `${S.tomorrow} יבואו מחר` : 'הוכוונו');
    },
    teardown(B) { for (const p of [...S.q]) { if (p.state !== 'sent') { if (p.a) actors.remove(p.a); for (const an of p.an) animals.remove(an); } } S.q = S.q.filter((p) => p.state === 'sent'); if (B.kit) B.kit.hide(); },
    at: () => [GATE_SLOTS[1][0] + S.ox, G(7 + S.ox, S.oz) + 2, GATE_SLOTS[1][1] + S.oz],
    kit: 64,
  });
  W.state = S; W.stations = GATE_STATIONS; W.okAt = okAt; W.sendTo = (st) => send(W.B, st); W.spawn = (kind) => mkPilgrim(W.B, kind);
  W.queue = () => S.q.map((p) => ({ id: p.id, kind: p.kind, state: p.state, tries: p.tries, key: p.key, slot: p.slot }));
  return W;
}
// ── /worksb22 ──
