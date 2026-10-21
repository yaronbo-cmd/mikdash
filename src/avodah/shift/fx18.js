/* ── fable32 (build 18) ── ── recovered (build 18) ── fx18.js — the day's answer to the hand (focus17's l18: one place for the acts'
 * sound and buzz — stations.js leaves them to it under opts.fb18): every hit, lay and miss gets its sound (SND: SWING17's own, the lay's
 * whoosh, the laver's water), a buzz, a burst of sparks on the thing and a flash of its slot; the coins of build 18 — the temple's till
 * at the top ("קופת המקדש"), each coin flying from the thing into it (C18.pay; a streak rings higher), the chests by the gate where
 * pilgrims drop their gifts and he collects (C18.chests), the three pads to buy at (C18.pads: the price drains as he stands on it),
 * the treasurer's stamp and the family's נדבה; and the court's mood by the fire — a crowd of pilgrims as it burns high, the light and a
 * vignette as it sinks (__FIRELOW33), the Levites' choir after it has burned well a while, the bow at the dawn tamid (life's setBow).
 *   createFx18({ E, view, sfx, doc, top, slot, sparks, stamp, note, pop }) → { fb(id, at, g, ev), destroy(), state() }   (globalThis.__FX18)
 * The bundle kept no comment and no local name: the names are the recovery's (SND: the report's "fx18's SND"; createFx18 and its
 * arguments: focus17.js's line in the session transcript). Never a Divine Name. */
import { addDrawer, L, onTick } from './draw.js';
import { man } from '../works/figures.js';
import { C18 } from './day33.js';
import { SWING17 } from './stations.js';
export function createFx18(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null,
    stat = { fb: 0, coins: 0, landed: 0, collects: 0, buys: 0, charges: 0, crowd: 0, light: 1, vig: 0, choir: 0 };
  if (!doc || !E || !E.on17) return { fb() {}, destroy() {}, state: () => stat };
  const snd = (n, a) => {
      try {
        o.sfx.play(n, a);
      } catch (e) {}
    },
    buzz = (p) => {
      try {
        navigator.vibrate(p);
      } catch (e) {}
    },
    choir = (k) => {
      try {
        o.sfx.choir(k);
      } catch (e) {}
    },
    bow = (k) => {
      try {
        globalThis.__T.life.setBow(k);
      } catch (e) {}
    };
  if (!doc.getElementById('c18-css')) {
    const css = doc.createElement('style');
    css.id = 'c18-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  let mk = (cls, html, parent = doc.body) => {
      const el = doc.createElement('div');
      el.className = cls;
      if (html != null) el.innerHTML = html;
      parent.appendChild(el);
      return el;
    },
    proj = (p) => {
      if (!p || !view || !view.project) return null;
      try {
        const q = view.project(p.x, p.y, p.z);
        return q && q.on !== false ? { x: q.x, y: q.y } : null;
      } catch (e) {
        return null;
      }
    },
    center = (el) => {
      try {
        const r = el.getBoundingClientRect();
        return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
      } catch (e) {
        return null;
      }
    },
    gy = (x, z) => {
      try {
        const y = globalThis.__T.stages.groundAt(x, z);
        return Number.isFinite(y) ? y : 16;
      } catch (e) {
        return 16;
      }
    },
    flash = (el, big, fill) => {
      try {
        el.animate([{ scale: 1 }, { scale: big ? 1.34 : 1.12, offset: 0.38 }, { scale: 1 }], { duration: big ? 300 : 420, easing: 'ease-out' });
        if (fill)
          el.animate(
            [{ boxShadow: 'inset 0 0 0 #FFD66E' }, { boxShadow: 'inset 0 -56px 0 #FFD66E', offset: 0.6 }, { boxShadow: 'inset 0 -56px 0 #FFD66E00' }],
            big ? 360 : 460,
          );
      } catch (e) {}
    },
    F = null;
  try {
    F = E.focus17();
  } catch (e) {}
  const c18 = () => (F && F.c18) || {},
    coinsOn = () => !!c18().coins,
    till = coinsOn() ? mk('f17-tam c18-till', '<small>קופת המקדש</small><b>🪙 0</b>', o.top || doc.body) : null;
  if (till) {
    till.setAttribute('role', 'status');
    if (o.top) o.top.prepend(till);
  }
  let tillB = till && till.querySelector('b'),
    inFly = 0,
    streak = 0,
    lastLand = -9,
    hinted = 0;
  try {
    hinted = localStorage.c18hint;
  } catch (e) {}
  const now = () => performance.now() / 1e3,
    coins = [],
    freeCoin = () => coins.find((c) => !c.__busy) || (coins.length < 28 ? (coins[coins.length] = mk('c18-c', null)) : null);
  function fly(from, to, delay, n, done, right) {
    const coin = freeCoin();
    if (!coin || !from || !to || !coin.animate) return false;
    coin.__busy = true;
    const mx = (from.x + to.x) / 2 + (right ? 30 : -40),
      my = Math.min(from.y, to.y) - 60 - rand() * 30,
      an = coin.animate(
        [
          { transform: `translate(${from.x}px,${from.y}px)`, opacity: 0.4 },
          { transform: `translate(${mx}px,${my}px) scale(1.2)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${to.x}px,${to.y}px) scale(.7)`, opacity: 1 },
        ],
        { duration: FLY_S * 1e3, delay: delay * 1e3, easing: 'cubic-bezier(.45,0,.6,1)' },
      ),
      free = () => {
        coin.__busy = false;
        coin.style.opacity = '0';
      };
    an.onfinish = () => {
      free();
      if (done) done(n);
    };
    an.oncancel = free;
    return an;
  }
  function land(n) {
    inFly = Math.max(0, inFly - n);
    stat.landed++;
    const t = now();
    streak = t - lastLand < STREAK_S ? streak + 1 : 0;
    lastLand = t;
    snd('coin18', { n: streak, big: n > 1 });
    flash(till, false);
  }
  function pay(n, at, rush) {
    const to = till && center(till),
      from = (at && proj(at)) || { x: (innerWidth || 844) / 2, y: (innerHeight || 390) * 0.45 };
    if (o.pop)
      try {
        o.pop(`+${n} 🪙`, from.x, from.y - 26, 'gold');
      } catch (e) {}
    if (!to) return;
    let k = Math.min(n, MAX_FLY),
      delay = 0,
      gap = rush ? 0.14 : GAP_S;
    for (let i = 0; i < k; i++) {
      const v = Math.floor(n / k) + (i < n % k ? 1 : 0);
      if (fly({ x: from.x + (rand() - 0.5) * 16, y: from.y }, to, delay, v, land)) inFly += v;
      delay += gap;
      if (rush) gap = Math.max(0.035, gap * 0.82);
    }
  }
  let padFly = [];
  function padStart(ev) {
    padStop();
    const from = till && center(till),
      to = proj(ev.at);
    if (!from || !to) return;
    for (let i = 0; i < 8; i++) {
      const an = fly(from, to, (i * C18.padS) / 9, 1, () => snd('coin18', { n: i }), true);
      if (an) padFly.push(an);
    }
  }
  function padStop() {
    for (const an of padFly)
      try {
        an.cancel();
      } catch (e) {}
    padFly = [];
  }
  let vig = mk('c18-vig', null),
    hemi = null,
    hemi0 = 0,
    hemiSet = -1;
  try {
    globalThis.__T.scene.traverse((o3) => {
      if (!hemi && o3.isHemisphereLight) hemi = o3;
    });
  } catch (e) {}
  const sparks = [];
  function burst(at, n, color, k = 1) {
    if (at)
      for (let i = 0; i < n; i++) {
        if (sparks.length >= MAX_SPARKS) sparks.shift();
        const a = rand() * 6.283,
          v = (1.5 + rand() * 2.5) * k;
        sparks.push({
          x: at.x,
          y: at.y - 1,
          z: at.z,
          vx: Math.cos(a) * v,
          vy: (2.5 + rand() * 3) * k,
          vz: Math.sin(a) * v,
          t: 0,
          life: 0.45 + rand() * 0.3,
          c: color,
        });
      }
  }
  const crowd = [],
    givers = [],
    hp = { x: 0, y: 0, z: 0 },
    between = (a, b) => a + rand() * (b - a);
  function walker(x, z, out) {
    const box = CROWD_BOX;
    return {
      x: x,
      z: z,
      tx: between(box[0], box[1]),
      tz: between(box[2], box[3]),
      sp: 1.3 + rand() * 0.6,
      ph: rand() * 6,
      robe: ROBES[(rand() * 6) | 0],
      out: !!out,
      t: 0,
    };
  }
  let bowUntil = 0,
    warmT = 0,
    lightT = 0,
    choirT = 0;
  function draw(k, tt, dt) {
    if (!F || F.phase !== 'run' || F.night) return;
    const c = c18(),
      CH = C18.chests,
      cy = gy(CH.x, CH.z0),
      bowing = now() < bowUntil;
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.t += dt;
      if (p.t >= p.life) {
        sparks.splice(i, 1);
        continue;
      }
      p.vy -= 9 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const r = 0.07 * (1 - p.t / p.life) + 0.02;
      k.s(L(p.x), L(p.z), L(p.y), r, r, r, '!' + p.c);
    }
    for (const w of [...crowd, ...givers]) {
      const dx = w.tx - w.x,
        dz = w.tz - w.z,
        d = Math.hypot(dx, dz),
        walk = d > 0.3 && !bowing;
      if (walk) {
        const step = Math.min(d, w.sp * dt);
        w.x += (dx / d) * step;
        w.z += (dz / d) * step;
        w.yaw = Math.atan2(dz, dx);
      }
      w.t += dt;
      try {
        man(k, L(w.x), L(w.z), L(gy(w.x, w.z)), {
          robe: w.robe,
          cap: '#E8E0CC',
          yaw: w.yaw || Math.PI,
          walk: walk,
          pose: bowing ? undefined : walk ? 'walk' : 'stand',
          lean: bowing ? 1.6 : 0,
          t: w.t + w.ph,
          avnet: false,
        });
      } catch (e) {}
    }
    if (!c.coins) return;
    const full = c.ch && c.ch.n >= CH.max && Math.sin(tt * 6) > -0.4,
      stack = {};
    for (let i = 0; i < CH.n; i++) {
      const z = CH.z0 + i * CH.dz;
      k.b(L(CH.x), L(z), L(cy) + 0.33, 0.7, 0.4, 0.66, full ? '!#E2B65A' : '#7A5A3A');
      k.s(L(CH.x - 0.1), L(z), L(cy) + 0.7, 0.22, 0.12, 0.22, '#B58B3A');
      k.c(L(CH.x - 0.3), L(z), L(cy) + 1.1, 0.07, 0.8, '#C9A04A', { roll: 0.35 });
    }
    for (const c2 of (c.ch && c.ch.c) || []) {
      const n = (stack[c2] = (stack[c2] | 0) + 1);
      k.s(L(CH.x + 0.35), L(CH.z0 + c2 * CH.dz), L(cy) + 0.67 + 0.06 * n, 0.16, 0.04, 0.16, '!#FFD66E');
    }
    try {
      globalThis.__T.stages.heroXYZ(hp);
    } catch (e) {}
    C18.pads.forEach((pad, i) => {
      const y = gy(pad.x, pad.z),
        own = c.own && c.own[i];
      if (Math.hypot(pad.x - hp.x, pad.z - hp.z) < 22 && !F.gate)
        k.label(own ? `${pad.icon} ${pad.he} ✓` : `${pad.icon} ${pad.he} · ${pad.price} 🪙`, L(pad.x), L(pad.z), L(y) + 1.1, 0.42, {
          bg: 'rgba(28,20,10,.85)',
          fg: '#FFE6A0',
          opacity: own || F.perutot < pad.price ? 0.65 : 1,
        });
      if (own) return;
      const r = L(C18.padR),
        fill = c.pad && c.pad.id === pad.id ? clamp01(c.pad.t / C18.padS) : 0;
      k.ring(L(pad.x), L(pad.z), L(y) + 0.01, r, '!#E2B65A', 14);
      if (fill) k.ring(L(pad.x), L(pad.z), L(y) + 0.04, r * (0.15 + 0.8 * fill), '!#FFF1B8', 6 + Math.round(12 * fill));
    });
  }
  let offDraw = addDrawer(null, draw, 2),
    lastT = 0;
  function tick() {
    let f17 = null;
    try {
      f17 = E.focus17();
    } catch (e) {
      f17 = null;
    }
    F = f17;
    if (!f17) return;
    const t = now(),
      dt = lastT ? Math.min(0.1, t - lastT) : 0;
    lastT = t;
    const live = f17.phase === 'run' && !f17.night && !f17.summary,
      c = f17.c18 || {};
    if (till) {
      const price = c.pad ? Math.round(c.pad.price * clamp01(c.pad.t / C18.padS)) : 0,
        txt = '🪙 ' + Math.max(0, Math.round(f17.perutot - inFly - price));
      if (tillB.textContent !== txt) tillB.textContent = txt;
    }
    if (!live) {
      if (vig.style.opacity !== '0') vig.style.opacity = '0';
      return;
    }
    const want = f17.fuel >= 60 ? Math.min(MAX_CROWD, 1 + (f17.fuel >= 80 ? 1 : 0) + (c.tams | 0)) : 0;
    stat.crowd = want;
    const inCrowd = crowd.filter((w) => !w.out);
    if (inCrowd.length < want && rand() < dt * 0.5) crowd.push(walker(GATE_X, GATE_Z));
    else if (inCrowd.length > want) {
      const w = inCrowd[inCrowd.length - 1];
      w.out = true;
      w.tx = GATE_X;
      w.tz = GATE_Z;
      w.sp = 1.8;
    }
    for (let i = crowd.length - 1; i >= 0; i--) {
      const w = crowd[i];
      if (Math.hypot(w.tx - w.x, w.tz - w.z) < 0.4)
        if (w.out) crowd.splice(i, 1);
        else {
          const box = CROWD_BOX;
          w.tx = between(box[0], box[1]);
          w.tz = between(box[2], box[3]);
        }
    }
    for (let i = givers.length - 1; i >= 0; i--) {
      const w = givers[i];
      if (w.out && Math.hypot(w.tx - w.x, w.tz - w.z) < 0.4) givers.splice(i, 1);
    }
    if ((lightT += dt) >= 0.25) {
      lightT = 0;
      const low = clamp01(Number(globalThis.__FIRELOW33) || 0),
        high = clamp01((f17.fuel - 80) / 20),
        k = 1 - DIM * low + BRIGHT * high;
      stat.light = Math.round(k * 1e3) / 1e3;
      stat.vig = Math.round(low * 100) / 100;
      const op = (0.9 * low).toFixed(2);
      if (vig.style.opacity !== op) vig.style.opacity = op;
      if (hemi) {
        if (Math.abs(hemi.intensity - hemiSet) > 1e-4) hemi0 = hemi.intensity;
        hemi.intensity = hemiSet = hemi0 * k;
      }
    }
    warmT = f17.fuel >= 60 ? warmT + dt : 0;
    if ((choirT += dt) >= 0.5) {
      choirT = 0;
      const k = clamp01((f17.fuel - 55) / 40) * clamp01(warmT / CHOIR_S);
      stat.choir = Math.round(k * 100) / 100;
      choir(k);
    }
  }
  const offTick = onTick(() => {
    try {
      tick();
    } catch (err) {
      console.warn('[fx18]', err && err.message);
    }
  });
  function fb(id, at, g, ev = {}) {
    stat.fb++;
    const miss = g === 'miss',
      gold = g === 'gold';
    if (miss) snd(ev.grace ? 'soft' : 'thud');
    else {
      if (SND[id]) snd(SND[id]);
      if (id !== 'lay') snd(gold ? 'perfect' : 'good', gold ? { combo: Math.max(1, ev.streak | 0) } : { light: true });
    }
    buzz(miss ? 10 : gold ? 30 : 18);
    burst(at, miss ? 4 : gold ? 14 : 7, miss ? '#B9B4AA' : SPARK[id] || '#FFD66E', miss ? 0.5 : gold ? 1.2 : 0.9);
    if (miss) return;
    stat.charges++;
    const slot = o.slot ? o.slot(SLOT_OF[id] || id) : null,
      btn = doc.querySelector('.tw-btn');
    flash(slot, gold, 1);
    if (id !== 'lay') flash(btn, gold);
    const c = slot && center(slot);
    if (c && o.sparks) o.sparks(c, gold ? 10 : 4, '#FFD66E');
  }
  const onEv = (ev) => {
      const type = ev.type;
      if (type === 'hit' || type === 'act') fb(ev.id, ev.at, ev.g, ev);
      else if (type === 'lay') fb('lay', ev.at, ev.g || 'good', ev);
      else if (type === 'miss') fb(ev.id, ev.at, 'miss', ev);
      else if (type === 'tamid' && ev.onTime) {
        bowUntil = now() + BOW_S;
        bow(1);
        setTimeout(() => bow(0), BOW_S * 1e3);
      }
      if (!coinsOn()) return;
      if (type === 'coins') {
        stat.coins += ev.n;
        pay(ev.n, ev.at, ev.why === 'chests');
        if (!hinted) {
          hinted = 1;
          try {
            localStorage.c18hint = 1;
          } catch (e) {}
          if (o.note) o.note('🪙 מטבעות לקופת המקדש — לבדק הבית');
        }
      } else if (type === 'pilgrim') {
        const CH = C18.chests,
          w = walker(GATE_X, GATE_Z + (rand() - 0.5) * 3);
        w.tx = CH.x - 2.4;
        w.tz = CH.z0 + ev.i * CH.dz;
        w.sp = Math.hypot(w.tx - w.x, w.tz - w.z) / Math.max(0.5, ev.s - 0.2);
        givers.push(w);
      } else if (type === 'drop') {
        const CH = C18.chests,
          z = CH.z0 + ev.i * CH.dz;
        burst({ x: CH.x, y: gy(CH.x, z) + 2.6, z: z }, 5, '#FFD66E', 0.5);
        snd('coin18', { n: 2 });
        for (const w of givers)
          if (!w.out && Math.abs(w.tz - z) < 0.1) {
            w.out = true;
            w.tx = GATE_X;
            w.tz = GATE_Z;
            w.sp = 1.8;
          }
      } else if (type === 'collect') {
        stat.collects++;
        const CH = C18.chests;
        burst({ x: CH.x, y: gy(CH.x, CH.z0) + 2.5, z: CH.z0 + 7 }, 14, '#FFD66E', 1.2);
        buzz([20, 30, 20]);
      } else if (type === 'pad')
        if (ev.id) padStart(ev);
        else padStop();
      else if (type === 'buy') {
        stat.buys++;
        padFly = [];
        burst(ev.at, 16, '#FFD66E', 1.3);
        snd('chord17', { up: 1 });
        buzz([30, 50, 30]);
        if (o.stamp) o.stamp(`הגזבר הוציא ${ev.he} למשמר`, 'מתרומת הלשכה — טיוטה');
      } else if (type === 'nedava') {
        snd('chord17', { up: 1 });
        snd('fanfare');
        buzz([30, 40, 30, 40, 60]);
        if (o.stamp) o.stamp('נדבה!', 'משפחה של עולי רגל — +10 לקופת המקדש');
      }
    },
    offEv = E.on17(onEv),
    api = {
      fb: fb,
      destroy() {
        offTick();
        offDraw();
        padStop();
        choir(0);
        bow(0);
        try {
          offEv();
          for (const el of [till, vig, ...coins]) if (el) el.remove();
          if (hemi && hemi0 && Math.abs(hemi.intensity - hemiSet) < 1e-4) hemi.intensity = hemi0;
          if (globalThis.__FX18 === api) delete globalThis.__FX18;
        } catch (e) {}
      },
      state: () => ({ ...stat, till: tillB && tillB.textContent, inFly: inFly, hemi: hemi && hemi.intensity }),
    };
  try {
    globalThis.__FX18 = api;
  } catch (e) {}
  return api;
}
const FLY_S = 0.6;
const GAP_S = 0.07;
const STREAK_S = 0.55;
const MAX_FLY = 12;
const MAX_SPARKS = 40;
const MAX_CROWD = 4;
const BOW_S = 3.2;
const GATE_X = -9.6;
const GATE_Z = 1.5;
const CROWD_BOX = [-20, -14.6, -12, 32];
const DIM = 0.28;
const BRIGHT = 0.06;
const CHOIR_S = 20;
const CSS = `.c18-till{flex-direction:column;justify-content:center;gap:0;border:2px solid #C8923A;opacity:1;pointer-events:none!important}.c18-till small{font-size:10px}.c18-till b{font-size:19px;direction:ltr}
.c18-c{position:fixed;left:0;top:0;z-index:35;width:18px;height:18px;margin:-11px 0 0 -11px;border-radius:50%;background:#F2C14E;border:2px solid #9A6A16;box-shadow:0 0 8px #FFD66E;pointer-events:none;opacity:0}
.c18-vig{position:fixed;inset:0;z-index:5;pointer-events:none;opacity:0;transition:opacity .8s;background:radial-gradient(ellipse at 50% 55%,transparent 38%,rgba(20,8,2,.72))}
`;
const SND = { ...SWING17.sfx, lay: 'whoosh', kiyor: 'water' };
const SPARK = { lay: '#FF9A3A', kiyor: '#A8DCFF' };
const SLOT_OF = { oil: 'bake', salt: 'bake', lay: 'wood' };
const ROBES = ['#8C7A62', '#6F7F8F', '#9A8466', '#7D6F8A', '#86906E', '#A08A70'];
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const rand = Math.random;
