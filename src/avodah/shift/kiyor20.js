/* ── fable32 (build 20) ── ── recovered (build 20) ── kiyor20.js — the laver (קידוש ידיים ורגליים, תמיד א, ד; זבחים יט ע״ב): the
 * kohen kneels at the laver and holds BOTH rings — the left thumb's "שמאל — יד ורגל", the right's "ימין — יד ורגל" — while the water
 * pours from its two spigots onto his hands (water.js pour20, rush20's sound); the ring fills as he washes (E.k20(): up → pose → done),
 * the dust on his robe (hero35's dust20) goes, and at the end "ידיים ורגליים מקודשות" with three ripples, the bells (wbell20, unlock20)
 * and the day's slots lit one by one. The first time the ממונה says "ימין על ימין, שמאל על שמאל". A station tapped before its turn
 * gets a note over its slot ("קודם לכיור 💧", "קודם תרומת הדשן 🔥", … — the morning's order) and the slot it should be pulses.
 * The stick is off while the rings are up (twin.noStick).
 *   createKiyor20({ E, sfx, doc, slot, twin }) → { destroy(), state() }      (focus17.js makes it when E.g20; globalThis.__K20)
 * The bundle kept no comment and no local name: the names are the recovery's. Never a Divine Name. */
import { onTick } from './draw.js';
import { K20 } from './day33.js';
import { reg30 } from './rate30.js';   // ── fable32 (build 30) ── ── /fable32 ──
// ── fable32 (build 30) ── the laver's lines: no longer over the world while he washes (the step card's one line: "שני אגודלים — החזיקו");
// at its end the rating and ONE source line, a tap opens both (end30.js) ── /fable32 ──
const SRC_K20 = '"עד שתקדש ידיך ורגליך מן הכיור" — תמיד א, ד · טיוטה';
const SRC_MM = 'הממונה: ״ימין על ימין, שמאל על שמאל״ — זבחים יט ע״ב · טיוטה';
reg30('kiyor', { chip: SRC_K20, all: [SRC_K20, SRC_MM] });
export function createKiyor20(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    stat = { downs: 0, ups: 0, flows: 0, pours: 0, unlocks: 0, gates: 0, buzz: 0, first: 0, lastP: 0 };
  if (!doc || !E || !E.on17 || !E.g20) return { destroy() {}, state: () => stat };
  const snd = (n, a) => {
      try {
        o.sfx.play(n, a);
      } catch (e) {}
    },
    rush = (k) => {
      try {
        o.sfx.rush20(k);
      } catch (e) {}
    },
    buzz = (p) => {
      try {
        navigator.vibrate(p);
        stat.buzz++;
      } catch (e) {}
    },
    hero = () => {
      const H = globalThis.__HERO35;
      return H && H.loaded ? H : null;
    },
    water = () => {
      const T = globalThis.__T;
      return T && T.water && T.water.pour20 ? T.water : null;
    },
    now = () => performance.now() / 1e3;
  if (!doc.getElementById('k20-css')) {
    const css = doc.createElement('style');
    css.id = 'k20-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  const mk = (cls, html, tag = 'div') => {
    const el = doc.createElement(tag);
    el.className = cls;
    if (html != null) el.innerHTML = html;
    doc.body.appendChild(el);
    return el;
  };
  try {
    globalThis.__K20LAVER = true;
  } catch (e) {}
  const ptr = { L: null, R: null },
    ys = { L: null, R: null },   // ── fable32 (build 36) ── (each thumb's height since it pressed — the laver's level 4 levels the stream by them) ── /fable32 ──
    rings = {};
  for (const [side, label] of [
    ['L', 'שמאל — יד ורגל'],
    ['R', 'ימין — יד ורגל'],
  ]) {
    const btn = mk(`k20-r ${side}`, `${side === 'L' ? RING.replace('>', `>${DEFS}`) : RING}<b>${label}</b>`);
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', `${label} — החזיקו`);
    rings[side] = btn;
    btn.__pr = [...btn.querySelectorAll('.pr')];
    btn.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (ptr[side] == null) {
        ptr[side] = ev.pointerId;
        ys[side] = { y0: ev.clientY, y: ev.clientY };
        try {
          btn.setPointerCapture(ev.pointerId);
        } catch (e) {}
        press(side, true);
      }
    });
    const up = (ev) => {
      ptr[side] == null || (ev && ev.pointerId !== ptr[side]) || ((ptr[side] = null), press(side, false));
    };
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, up);
    btn.addEventListener('pointermove', (ev) => {   // ── fable32 (build 36) ── ── /fable32 ──
      if (ptr[side] === ev.pointerId && ys[side]) ys[side].y = ev.clientY;
    });
    btn.addEventListener('contextmenu', (ev) => ev.preventDefault());
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });
  }
  function press(side, down) {
    const ok = E.k20in(side, down);
    rings[side].classList.toggle('on', !!down && ok);
    if (down) {
      stat.downs++;
      buzz(15);
      snd('tap');
      for (const s2 of ['L', 'R']) rings[s2].classList.remove('pl');
    } else stat.ups++;
  }
  // ── fable32 (build 30) ── (the end's word "ידיים ורגליים מקודשות" and its source over the world are gone: the step card says its rating,
  // end30 its source line — SRC_K20) ── /fable32 ──
  const balEl = mk('k20-bal', '');   // ── fable32 (build 36) ── (level 4: the stream's tilt between the rings — המחשה) ── /fable32 ──
  balEl.style.display = 'none';
  balEl.setAttribute('aria-hidden', 'true');
  const word = mk('k20-w', '');
  word.setAttribute('aria-hidden', 'true');
  let waves = [0, 1, 2].map(() => mk('k20-v', null)),
    wasOn = false,
    flowing = false,
    buzzT = 0,
    washedAt = -9,
    lastP = -1,
    stickOff = false,
    setOn = (on) => {
      if (stickOff !== on) {
        stickOff = on;
        doc.body.classList.toggle('k20-on', on);
        try {
          const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods,
            twin = o.twin || (mods && mods.twin);
          if (twin && twin.noStick) twin.noStick(on ? true : globalThis.__SH_NOSTICK === true);
        } catch (e) {}
      }
    },
    handAt = (bone) => () => {
      const H = hero(),
        p = H && H.at(bone);
      return p ? { x: p.x, y: p.y + 0.05, z: p.z } : null;
    };
  function flow(on, k) {
    const w = water();
    if (flowing === on || ((flowing = on), rush(on ? 1 : 0), on && stat.flows++, !w)) return;
    const spig = K20.spig;
    if (on) {
      stat.pours++;
      const rate = k && k.two ? 1 : 0.8;
      w.pour20(spig[0], handAt('handr'), true, rate);
      w.pour20(spig[1], handAt('handl'), true, rate);
    } else {
      w.pour20(spig[0], null, false);
      w.pour20(spig[1], null, false);
    }
  }
  const offTick = onTick((tt, dt) => {
      const st = E.st33,
        k = E.k20();
      if (!st) return;
      const on = !!k,
        vis = on && (k.ph === 'up' || k.ph === 'pose');
      setOn(on);
      for (const side of ['L', 'R']) {
        const btn = rings[side];
        if (btn.classList.contains('vis') !== vis) btn.classList.toggle('vis', vis);
        if (!vis && ptr[side] != null) {
          ptr[side] = null;
          btn.classList.remove('on');
        }
      }
      if (!on && wasOn) {
        flow(false);
        for (const side of ['L', 'R']) rings[side].classList.remove('on', 'pl');
      }
      wasOn = on;
      // ── fable32 (build 36) ── level 2 on: no guide — the rings do not fill (he holds till the water stops); level 4: the stream's tilt
      // between the rings (bal36), levelled by the thumbs' heights: the left lower than the right tips it one way, and back ── /fable32 ──
      const guide = !(k && k.P36 && k.P36.guide === 0),
        p = k ? (k.ph === 'pose' ? (guide ? k.p : 0) : k.ph === 'up' ? 0 : 1) : 0,
        bal = !!(k && k.ph === 'pose' && k.P36 && k.P36.bal);
      if (bal) {
        const dL = ys.L && ptr.L != null ? ys.L.y - ys.L.y0 : 0,
          dR = ys.R && ptr.R != null ? ys.R.y - ys.R.y0 : 0;
        if (ptr.L != null || ptr.R != null) E.k20bal(Math.max(-1, Math.min(1, (dL - dR) / 60)));   // (a thumb on a ring: its heights level it)
        const lim = k.P36.bal.lim, b = Math.max(-1, Math.min(1, k.b || 0));
        balEl.style.display = '';
        balEl.innerHTML = `<u style="left:${(50 - 50 * lim).toFixed(1)}%;width:${(100 * lim).toFixed(1)}%"></u><i style="left:${(50 + 50 * b).toFixed(1)}%"></i>`;
        balEl.classList.toggle('bad', Math.abs(b) > lim * 0.8);
      } else if (balEl.style.display !== 'none') balEl.style.display = 'none';
      if (Math.abs(p - lastP) > 0.004) {
        lastP = p;
        const dash = `${(p * 100).toFixed(1)} ${(100 - p * 100).toFixed(1)}`;
        for (const side of ['L', 'R']) for (const c of rings[side].__pr) c.style.strokeDasharray = dash;
      }
      stat.lastP = Math.round(p * 100) / 100;
      const pour = !!(k && k.ph === 'pose' && k.flow);
      flow(pour, k);
      if (pour && (buzzT -= dt) <= 0) {
        buzzT = 0.1;
        buzz(20);
      }
      const H = hero();
      if (H) {
        H.pose20(!!(k && (k.ph === 'pose' || (k.ph === 'up' && k.t > k.dur - 0.15))));
        const dirt = st.washed ? 0 : k && k.ph === 'pose' ? 1 - k.p : 1,
          glow = Math.max(0, 1.3 - (now() - washedAt) / 1.2);
        H.dust20(dirt, st.washed ? 0.22 + glow : pour ? 0.35 * k.p : 0);
      }
    }),
    offEv = E.on17((ev) => {
      const type = ev.type;
      if (type === 'k20' && ev.ph === 'up') {
        snd('ui');
        if (ev.first) {
          stat.first++;
          for (const side of ['L', 'R']) rings[side].classList.add('pl');   // ── fable32 (build 30) ── (the ממונה's card over the world is gone: SRC_MM, at the end) ── /fable32 ──
        }
      } else if (type === 'unlock') unlock(ev);
      else if (type === 'gate') gate(ev);
    });
  function unlock() {
    stat.unlocks++;
    washedAt = now();
    flow(false);
    snd('wbell20');
    setTimeout(() => snd('unlock20'), 260);
    buzz([30, 40, 30, 40, 60]);
    waves.forEach((v, i) => {
      try {
        v.animate(
          [
            { transform: 'scale(.2)', opacity: 0.95 },
            { transform: 'scale(13)', opacity: 0 },
          ],
          { duration: 1e3, delay: i * 130, easing: 'cubic-bezier(.2,.6,.3,1)' },
        );
      } catch (e) {}
    });
    setTimeout(() => {
      const slots = [...doc.querySelectorAll('.f17-sl')];
      slots.forEach((sl, i) =>
        setTimeout(() => {
          sl.classList.remove('k20-up');
          sl.offsetWidth;
          sl.classList.add('k20-up');
          snd('tab', { i: Math.min(4, i) });
        }, i * 90),
      );
    }, 320);
  }
  function gate(ev) {
    stat.gates++;
    snd('drip');
    buzz(10);
    // ── fable32 (build 30) ── (in an act the note is its one line for a moment, not a second word over the world) ── /fable32 ──
    const inAct = !!(E.act30 && E.act30());
    const slot = (o.slot && ev.id && o.slot(ev.id)) || null,
      r = slot ? slot.getBoundingClientRect() : null,
      x = r ? r.left + r.width / 2 : (innerWidth || 844) / 2,
      y = r ? r.top - 12 : (innerHeight || 390) * 0.7,
      note = mk(
        'k20-no',
        ev.p26
          ? E.gate26L && E.gate26L()
            ? 'קודם הפיס השני ☝'
            : 'קודם ההיכל 🪔'
          : ev.p25
            ? 'קודם בדיקת הטלה 🐑'
            : ev.p23
              ? 'קודם הפיס ☝'
              : ev.m22
                ? 'קודם המערכה 🪵'
                : ev.d21
                  ? 'קודם תרומת הדשן 🔥'
                  : 'קודם לכיור 💧',
      ),
      w = inAct ? 0 : note.getBoundingClientRect().width || 120,
      left = Math.max(8, Math.min((innerWidth || 844) - w - 8, x - w / 2));
    if (inAct) {
      note.remove();
      if (E.say30) E.say30(note.textContent, 'no', 1.3);
    } else try {
      const an = note.animate(
        [
          { transform: `translate(${left}px,${y}px)`, opacity: 0 },
          { transform: `translate(${left}px,${y - 30}px)`, opacity: 1, offset: 0.18 },
          { transform: `translate(${left}px,${y - 42}px)`, opacity: 1, offset: 0.75 },
          { transform: `translate(${left}px,${y - 54}px)`, opacity: 0 },
        ],
        { duration: 1300, easing: 'ease-out' },
      );
      an.onfinish = () => note.remove();
    } catch (e) {
      note.remove();
    }
    const call = !ev.p26 && o.slot && o.slot(ev.p25 ? 'pen' : ev.m22 ? (E.m22 && E.m22() ? 'kevesh' : 'wood') : ev.d21 ? 'kevesh' : 'kiyor');
    if (call) {
      call.classList.add('k20-call');
      setTimeout(() => call.classList.remove('k20-call'), 1600);
    }
  }
  const api = {
    destroy() {
      offTick();
      offEv();
      flow(false);
      rush(0);
      setOn(false);
      for (const el of [rings.L, rings.R, word, ...waves])
        try {
          el.remove();
        } catch (e) {}
      const H = hero();
      if (H) {
        H.pose20(false);
        H.dust20(0, 0);
      }
      try {
        delete globalThis.__K20LAVER;
        if (globalThis.__K20 === api) delete globalThis.__K20;
      } catch (e) {}
    },
    state: () => ({
      ...stat,
      vis: rings.L.classList.contains('vis'),
      on: [rings.L.classList.contains('on'), rings.R.classList.contains('on')],
      flow: flowing,
      stickOff,
    }),
  };
  try {
    globalThis.__K20 = api;
  } catch (e) {}
  return api;
}
const DROP = 'M0-17C4-10 11-3 11 5A11 11 0 1 1-11 5C-11-3-4-10 0-17Z';
const CSS = `body{--k20f:"Heebo",system-ui,sans-serif}
.k20-r{position:fixed;z-index:36;top:62%;width:112px;height:112px;margin:-56px 0 0 -56px;opacity:0;transform:scale(.6);transition:opacity .3s,transform .3s;pointer-events:none;touch-action:none;user-select:none;-webkit-tap-highlight-color:transparent}
.k20-r.L{left:max(calc(env(safe-area-inset-left,0px) + 72px),13vw)}.k20-r.R{left:auto;right:max(calc(env(safe-area-inset-right,0px) + 72px),13vw);margin:-56px -56px 0 0}
.k20-r.vis{opacity:.6;transform:none;pointer-events:auto}.k20-r.vis.on{opacity:1}
.k20-r svg{width:100%;height:100%;overflow:visible}.k20-r.on svg{filter:drop-shadow(0 0 6px #78ECDE) drop-shadow(0 0 16px #FFD66E8C)}
.k20-r .pr{stroke-dasharray:0 100}.k20-r .lq{transform:translateY(36px);transition:transform .3s}.k20-r.on .lq{transform:translateY(-31px)}.k20-r .wv{animation:k20wv 1.1s linear infinite}
.k20-r b{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:-4px;font:800 13px/1 var(--k20f);color:#FFE6A0;text-shadow:0 1px 3px #000;white-space:nowrap;pointer-events:none}
.k20-r.pl,.f17-sl.k20-call{animation:k20pl .8s ease-in-out infinite alternate}
.k20-bal{position:fixed;z-index:36;left:50%;top:calc(62% + 44px);width:min(220px,40vw);height:14px;margin-left:calc(min(220px,40vw) / -2);border-radius:7px;background:#1C140AD8;border:1.5px solid #E2B65A;pointer-events:none}.k20-bal u{position:absolute;top:0;bottom:0;background:#9FE0FF33;border:1.5px solid #CFF6FF;border-radius:6px;box-sizing:border-box}.k20-bal i{position:absolute;top:-3px;width:8px;height:20px;margin-left:-4px;border-radius:4px;background:#CFF6FF;box-shadow:0 0 8px #9FE0FF}.k20-bal.bad i{background:#FFC690}
.k20-w,.k20-no,.k20-mm,.k20-v{position:fixed;pointer-events:none;direction:rtl;white-space:nowrap;text-align:center}
.k20-w{left:50%;top:40%;transform:translate(-50%,-50%);z-index:37;opacity:0;padding:12px 44px;background:radial-gradient(ellipse,#0C1E1CB3,#0C1E1C59 55%,#0000 72%)}.k20-w.on{animation:k20w 1.3s ease-out forwards}
.k20-w b{display:block;font:900 40px/1.1 var(--k20f);color:#FFEBB0;-webkit-text-stroke:1.5px #1D5A55;text-shadow:0 0 18px #78ECDE,0 3px 0 #5A3A12}
.k20-w small,.k20-mm small{display:block;font:700 12px/1.3 var(--k20f);opacity:.8}
.k20-v{left:50%;top:50%;width:80px;height:80px;margin:-40px 0 0 -40px;border-radius:50%;z-index:35;border:5px solid #96ECE2;box-shadow:0 0 18px 5px #FFD66E99,inset 0 0 14px #96ECE2;opacity:0}
.k20-no,.k20-mm{padding:6px 14px;border-radius:14px;font:900 17px/1.15 var(--k20f)}
.k20-no{left:0;top:0;z-index:37;background:#123230E6;border:2px solid #8FE8DF;color:#E8FFFB}
.k20-mm{left:50%;top:calc(env(safe-area-inset-top,0px) + 60px);transform:translateX(-50%);z-index:32;background:#1C140ADB;border:1.5px solid #E2B65A;color:#FFF6DA;animation:k20mm 4.2s forwards}
body.k20-on .gm .tw-pad{opacity:0!important;pointer-events:none!important}
.f17-sl.k20-lk{border-color:#FFECBE47;background:#1C140A9E}.f17-sl.k20-lk>i,.f17-sl.k20-lk>b{filter:grayscale(1) brightness(.6);opacity:.65}
.f17-sl.k20-lk::after{content:"🔒";position:absolute;top:-8px;left:-8px;width:22px;height:22px;border-radius:50%;background:#1C140AE6;border:1.5px solid #FFECBE8C;font:12px/22px "Segoe UI Emoji","Noto Color Emoji",sans-serif}
.f17-sl.k20-up{animation:k20up .65s ease-out}
@keyframes k20wv{to{transform:translateX(-20px)}}@keyframes k20pl{to{scale:1.13}}
@keyframes k20w{0%{opacity:0;scale:.7}15%{opacity:1;scale:1.06}25%{scale:1}80%{opacity:1}to{opacity:0;translate:0 -18px}}
@keyframes k20up{35%{box-shadow:0 0 0 6px #96ECE2,0 0 22px 6px #FFD66E;filter:brightness(1.7)}}
@keyframes k20mm{0%{opacity:0}8%,85%{opacity:1}to{opacity:0}}`;
const grad = (id, vert, stops) =>
  `<linearGradient id="${id}" x2="${vert ? 0 : 1}" y2="1">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const DEFS = `<defs>${grad('k20br', 0, ['#F6DC93', '#C68E3C', '#7A4A18', '#E9C878'])}${grad('k20lq', 1, ['#D2FFF8', '#3CB5AB', '#E2B65A'])}${grad('k20pr', 0, ['#86F2E4', '#FFD66E'])}<clipPath id="k20cl"><circle r="29.5"/></clipPath></defs>`;
const WAVE = (() => {
  let d = 'M-60 0';
  for (let x = -60; x < 60; x += 10) d += `Q${x + 5} ${x % 20 ? 3.5 : -3.5} ${x + 10} 0`;
  return `${d}V40H-60Z`;
})();
const RING = `<svg viewBox="-50-50 100 100" aria-hidden="true"><circle r="45" fill="none" stroke="#FFE6AA47" stroke-width="4.5"/><circle class="pr" r="45" fill="none" stroke="url(#k20pr)" stroke-width="5.5" stroke-linecap="round" pathLength="100" transform="rotate(-90)"/>
<circle r="33" fill="#120C046B"/><g clip-path="url(#k20cl)"><g class="lq"><path class="wv" d="${WAVE}" fill="url(#k20lq)"/></g></g>
<circle r="34" fill="none" stroke="url(#k20br)" stroke-width="7"/><circle r="37.7" fill="none" stroke="#3A2408B3"/>${Array.from(
  { length: 12 },
  (_, i) => `<rect x="-1" y="-37.4" width="2" height="3.6" fill="#4A2E0E" transform="rotate(${i * 30 + 15})"/>`,
).join('')}
<path d="${DROP}" fill="#1E120499" transform="translate(1.3,3.2)"/><path d="${DROP}" fill="url(#k20lq)" stroke="#8C5A22" stroke-width="1.6" transform="translate(0,1.5)"/><path d="M-6.5 4A7.5 7.5 0 0 0-3.5 12" fill="none" stroke="#F4FFFD" stroke-width="1.7" stroke-linecap="round"/></svg>`;
