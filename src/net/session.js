/* ─────────────────────────────────────────────────────────────────────────────
 * net/session.js — NET10 (wave 10): the pure rules of "כהנים יחד" (no DOM, no three.js; test/net-session.test.mjs).
 *
 * A shared work ("עבודה משותפת") is a 4-digit code. Each device keeps its own save; the session only counts the work the two
 * kohanim do while together: per kohen { stones, perfect, strikes, t0 } under his own random device key (mid). "Stones"
 * are the stones his builder set and the rocks he split (a rock cleared is a stone of work). The joint total is the SUM of
 * the kohanim's own counts (never a shared counter: the platform's writes are last-writer-wins).
 * The race is friendly: quality = perfect strikes / strikes, speed = stones per minute; no stakes, nothing is lost.
 * Every text is a draft (טיוטה).
 * ──────────────────────────────────────────────────────────────────────────── */

export const APP = 'bh-net';            // presence tag: only our own pages' presence is read
export const V = 1;
export const GOAL = 10;                 // a shared celebration every GOAL stones together

export const newCode = (rnd = Math.random) => String(1000 + Math.floor(rnd() * 9000));
export const isCode = (s) => /^[1-9]\d{3}$/.test(String(s || '').trim());
export const newMid = (rnd = Math.random) => 'k' + Math.floor(rnd() * 36 ** 8).toString(36).padStart(8, '0');

/** a name typed by another player: display data only — no control / bidi / invisible characters, at most 18 letters */
export function cleanName(s) {
  // eslint-disable-next-line no-control-regex
  const t = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯﻿]/g, '').replace(/\s+/g, ' ').trim();
  return Array.from(t).slice(0, 18).join('');
}

export const stats0 = (now) => ({ stones: 0, perfect: 0, strikes: 0, t0: now });
/** a count read from another page: finite, whole, never negative */
const cnt = (v) => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
export function cleanStats(o, now) {
  const s = o && typeof o === 'object' ? o : {};
  return { stones: cnt(s.stones), perfect: cnt(s.perfect), strikes: Math.max(cnt(s.strikes), cnt(s.perfect)), t0: Number.isFinite(+s.t0) && +s.t0 > 0 ? +s.t0 : now };
}
/** stones per minute since t0 (the first minute counts as a whole minute: no wild rates at the start) */
export const perMin = (st, now) => st.stones / Math.max(1, (now - st.t0) / 60000);
export const accuracy = (st) => (st.strikes ? st.perfect / st.strikes : 0);

/** the joint total: the two kohanim's own counts (a member missing from `members` counts 0) */
export function together(members) {
  let n = 0;
  for (const m of Object.values(members || {})) n += cnt(m && m.stones);
  return n;
}

/** who leads each measure: 'me' | 'him' | 'tie' | null (nothing done yet); small gaps are ties (gently) */
export function race(me, him, now) {
  const a = { stones: me.stones, perfect: me.perfect, strikes: me.strikes, acc: accuracy(me), spm: perMin(me, now) };
  const b = him ? { stones: him.stones, perfect: him.perfect, strikes: him.strikes, acc: accuracy(him), spm: perMin(him, now) } : null;
  const lead = (x, y, eps, any) => (!b || !any ? null : Math.abs(x - y) <= eps ? 'tie' : x > y ? 'me' : 'him');
  return {
    me: a, him: b,
    q: lead(a.acc, b ? b.acc : 0, 0.05, b && a.strikes >= 3 && b.strikes >= 3),
    s: lead(a.spm, b ? b.spm : 0, 0.1, b && (a.stones || b.stones)),
  };
}

/** the gentle line under the race (טיוטה): who is precise, who is quick — never who lost */
export function raceLine(r, himName) {
  const h = himName || 'הכהן השני';
  if (!r.him) return 'ממתינים לכהן השני…';
  if (!r.me.strikes && !r.him.strikes) return 'הקישו על האבן — כל אבן נחשבת לשניכם';
  const q = r.q === 'me' ? 'אתה מדויק' : r.q === 'him' ? `${h} מדויק` : r.q === 'tie' ? 'דיוק שווה' : '';
  const s = r.s === 'me' ? 'אתה זריז' : r.s === 'him' ? `${h} זריז` : r.s === 'tie' ? 'קצב שווה' : '';
  if (r.q && r.q === r.s && r.q !== 'tie') return `${r.q === 'me' ? 'אתה מדויק וזריז' : `${h} מדויק וזריז`} · יישר כוח לשניכם`;
  return [q, s].filter(Boolean).join(' · ') || 'שני הכהנים זריזים';
}

/** our presence objects among the room's peers: [{ peer, self, p }] (p cleaned: code, mid, name, host, spot, counts) */
export function ours(peers, now) {
  const out = [];
  for (const x of peers || []) {
    const p = x && x.presence;
    if (!p || p.app !== APP || p.v !== V || !isCode(p.code) || typeof p.mid !== 'string') continue;
    out.push({
      peer: x.peer, self: !!x.self, at: x.at || 0,
      p: {
        code: String(p.code), mid: p.mid.slice(0, 16), host: !!p.host, name: cleanName(p.name),
        x: Number.isFinite(p.x) ? p.x : null, z: Number.isFinite(p.z) ? p.z : null, yaw: Number.isFinite(p.yaw) ? p.yaw : 0,
        site: typeof p.site === 'string' ? p.site.slice(0, 16) : '', away: !!p.away,
        hit: p.hit && Number.isFinite(p.hit.n) ? { n: p.hit.n, p: !!p.hit.p } : { n: 0, p: false },
        st: cleanStats(p.st, now),
      },
    });
  }
  return out;
}
/** the partner in my session: the most recent other kohen with my code (another tab of mine counts: two phones, one account) */
export function partnerOf(list, code, mid) {
  let best = null;
  for (const o of list) if (!o.self && o.p.code === code && o.p.mid !== mid && (!best || o.at > best.at)) best = o;
  return best;
}
/** open works I can join: others hosting a code nobody else has joined yet (one entry per code, the newest) */
export function openWorks(list, mid) {
  const byCode = new Map();
  for (const o of list) {
    if (o.self || o.p.mid === mid) continue;
    const c = o.p.code; const e = byCode.get(c) || { code: c, host: null, n: 0 };
    e.n++; if (o.p.host && (!e.host || o.at > e.host.at)) e.host = o;
    byCode.set(c, e);
  }
  return [...byCode.values()].filter((e) => e.host && e.n === 1).map((e) => ({ code: e.code, name: e.host.p.name, peer: e.host.peer }));
}

/**
 * Where to draw the other kohen: his builder's spot, but never inside mine — within 3.5 amot of my builder he steps 4.5 amot
 * aside, across the camera's line of sight (both stay in view). cam: [x, z] of the camera (or null).
 */
export function besideSpot(px, pz, hx, hz, cam, side = 1) {
  if (!Number.isFinite(px) || !Number.isFinite(pz)) return null;
  if (!Number.isFinite(hx) || !Number.isFinite(hz) || Math.hypot(px - hx, pz - hz) >= 3.5) return [px, pz];
  let dx = 1, dz = 0;
  if (cam && Number.isFinite(cam[0])) { const vx = hx - cam[0], vz = hz - cam[1], L = Math.hypot(vx, vz) || 1; dx = -vz / L; dz = vx / L; }
  const k = side < 0 ? -4.5 : 4.5;
  return [hx + dx * k, hz + dz * k];
}
/** beside me, which side: the one whose spot is farther on screen from the game's pointer (never on my stone); p1/p2: {x, y} */
export function pickSide(p1, p2, mark) {
  if (!mark || !p1 || !p2) return 1;
  const d = (p) => Math.hypot(p.x - mark.x, p.y - mark.y);
  return d(p2) > d(p1) + 8 ? -1 : 1;
}
