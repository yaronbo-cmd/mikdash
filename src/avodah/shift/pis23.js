/* ── fable32 (build 23) ── ── recovered (build 23) ── pis23.js — the lot (הפיס, יומא ב, א–ד): before dawn the kohanim stand in a circle
 * round the ממונה (P23.c, P23.seats); "החליקו למעלה — הוציאו אצבע" — a swipe up on the right half raises his finger (E.p23raise); the
 * ממונה calls a number and counts round the fingers (the drum23 beat, the count over each hand); where it stops — "☝ זכיתם!" — and the
 * cards: one role, or two to choose from ("היום הוגרלת ל: … או … — במה תבחר?"), the record over each ("השיא שלך: N%", "תפקיד חדש!");
 * ── fable32 (build 28) ── one card, always: the lot draws one role (day33's draw23, from the fourth morning never yesterday's) — the
 * choice of two is gone (the owner, 22.10 09:19: "פיס נקי, קלף אחד"); the first lot's card carries its source, "הִתְקִינוּ שֶׁלֹּא יְהוּ
 * תוֹרְמִין אֶת הַמִּזְבֵּחַ אֶלָּא בְפַיִס" (יומא ב, ב; טיוטה) ── /fable32 ──
 * at the role's end its score — "שיא חדש!". The second lot of build 26 (k26: thirteen kohanim, POOL26) uses the same circle where he
 * stands. Meanwhile the other kohanim do the roles the lot did not give him (E.npc23(): the pyre's wood, the ashes' pan, the bowl, the
 * logs). rolesBook23 — the book of the roles ("ספר התפקידים": each role, its best, its last; the second lot's thirteen; shift/index.js
 * opens it from the lobby), its rows from day33's bookOf23.
 *   createPis23({ E, sfx, doc, view }) → { destroy(), state() }      (focus17.js makes it when E.p23on; globalThis.__P23)
 *   rolesBook23({ doc, save, onClose }) → { close(), el }
 * The bundle kept no comment and no local name: the names are the recovery's (rolesBook23: the build reports' "rolesBook23 in pis23.js").
 * Never a Divine Name. */
import { addDrawer, L, onTick } from './draw.js';
import { man, ROBE, SKIN } from '../works/figures.js';
import { CAP_MEMUNE } from '../works/dawn.js';
import { bookOf23, D21, M22, P23, POOL26, POOL23 } from './day33.js';
import { RATE30, role30, reg30, served30, servedHe30 } from './rate30.js';   // ── fable32 (build 30) ── ── /fable32 ──
import { canPractice31 } from './practice31.js';   // ── fable32 (build 31) ── the book's practice doors ── /fable32 ──
// ── fable32 (build 30) ── the roles book by the ratings: each role's best rating (מהודר gold, כשר cream, טעון תיקון soft), how many
// times מהודר, its skill title (rate30's title30: מתחיל → רגיל → מיומן → מומחה) and how often; the laver's row (every morning); "שימשת N
// בקרים". The percentages are gone (the save keeps them; they had time in them) ── /fable32 ──
// ── fable32 (build 31) ── the practice doors (the owner, 21.10 23:46: "ספר התפקידים — אימון בכל תפקיד בנוי, לשיא"): from the lobby
// (o.practice: (id) => the run) every role he has had in a real morning — the laver's row too — has "לתרגל" (≥ 44 px); a built role the
// lot never gave him stays locked, "עוד לא יצא לך בפיס" (the lot is the key: practice never opens one); a role not built yet, "בקרוב";
// mid-day (the day's summary) the book is read-only (no door; o.note31: where the doors are). bookHTML23 is the markup (tests) ── /fable32 ──
export function bookHTML23(save, o = {}) {
  const can = (id) => !!o.practice && (o.can ? !!o.can(id) : canPractice31(save, id)),
    door = (id, he) => (can(id) ? `<button type="button" class="p31" data-p31="${id}" aria-label="לתרגל — ${esc(he)}">▶ לתרגל</button>` : ''),
    rate = (r) => (r ? `<b class="${r}">${RATE30.he[r]}</b>` : '<b>—</b>'),
    card = (a) =>
      a.open && a.had > 0
        ? `<div class="q"><i>${a.icon}</i>${esc(a.he)}${rate(a.rate)}<small>${a.title ? `${esc(a.title)} · ` : ''}${a.h ? `מהודר ×${a.h} · ` : ''}${a.n} ${a.n === 1 ? 'פעם' : 'פעמים'}</small>${door(a.id, a.he)}</div>`
        : a.built
          ? `<div class="q lk"><i>${a.icon}</i>${esc(a.he)}<b>🔒</b><small>עוד לא יצא לך בפיס</small></div>`
          : `<div class="q lk sn"><i>${a.icon}</i>${esc(a.he)}<b>🔒</b><small>${a.lot === 2 ? 'כהנים אחרים — בקרוב' : 'בקרוב'}</small></div>`,
    rec = (save && save.roles23) || {},
    k = role30(rec.kiyor),
    sv = servedHe30(served30(save));
  return `<div class="c" role="dialog" aria-label="ספר התפקידים"><h2>🎭 ספר התפקידים</h2>${sv ? `<div class="sv">${esc(sv)}</div>` : ''}<small>כל בוקר הממונה מפיס — כל תפקיד, הדירוג הטוב שלכם בו והתואר${o.practice ? ' · "לתרגל": אימון בתפקיד שכבר יצא לכם (המחשה)' : ''} · ${SRC_LOT}</small>${
    o.note31 && !o.practice ? '<div class="n31">לתרגל תפקיד — מספר התפקידים שבמסך הבית (המחשה)</div>' : ''
  }${k.best ? `<div class="kr">💧 קידוש ידיים ורגליים — כל בוקר: ${rate(k.best)}${k.h ? ` · מהודר ×${k.h}` : ''}${door('kiyor', 'קידוש ידיים ורגליים')}</div>` : ''}<div class="g">${bookOf23(save).map(card).join('')}</div>
    <h4>הפיס השני — שלושה עשר תפקידים</h4><small>${SRC_LOT2}</small><div class="g g4">${bookOf23(save, POOL26)
      .map((a) => card({ ...a, lot: 2 }))
      .join('')}</div><small class="tl">התארים: מתחיל · רגיל (כשר פעמיים) · מיומן (מהודר 3 פעמים) · מומחה (מהודר 6 פעמים) — טיוטה</small><button type="button" data-p23="close">סגור</button></div>`;
}
export function rolesBook23(o = {}) {
  const doc = o.doc || (typeof document < 'u' ? document : null);
  if (!doc) return { close() {} };
  css(doc);
  const el = doc.createElement('div');
  el.className = 'p23-bk';
  el.innerHTML = bookHTML23(o.save, o);
  let shut = false;
  const close = (quiet) => {
    if (shut) return;
    shut = true;
    el.remove();
    if (o.onClose && !quiet) o.onClose();
  };
  el.querySelector('[data-p23="close"]').addEventListener('click', (a) => {
    a.stopPropagation();
    close();
  });
  // ── fable32 (build 31) ── "לתרגל": the book closes and the run begins (o.practice — shift/index.js's runPractice) ── /fable32 ──
  el.querySelectorAll('[data-p31]').forEach((b) =>
    b.addEventListener('click', (a) => {
      a.stopPropagation();
      if (shut) return;
      close(true);
      try {
        o.practice(b.dataset.p31);
      } catch (e) {
        console.warn('[p23] practice', e && e.message);
      }
    }),
  );
  el.addEventListener('pointerdown', (a) => a.stopPropagation());
  doc.body.appendChild(el);
  try {
    globalThis.__BOOK31 = { el, close: () => close(), practice: (id) => { const b = el.querySelector(`[data-p31="${id}"]`); if (b) b.click(); return !!b; } };   // (tests, the autoplayer)
  } catch (e) {}
  return { close, el };
}
export function createPis23(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null,
    stat = { ticks: 0, cards: 0, picks: 0, flash: 0, recs: 0, lines: 0, ups: 0, slow: 0 };
  if (!doc || !E || !E.on17 || !E.p23on) return { destroy() {}, state: () => stat };
  const T = globalThis.__T,
    snd = (n, a) => {
      try {
        o.sfx.play(n, a);
      } catch (e) {}
    },
    buzz = (p) => {
      try {
        navigator.vibrate(p);
      } catch (e) {}
    },
    now = () => performance.now() / 1e3,
    gy = (x, z, y0 = 16) => {
      try {
        const y = T.stages.groundAt(x, z);
        return Number.isFinite(y) ? y : y0;
      } catch (e) {
        return y0;
      }
    };
  css(doc);
  const mk = (cls, html, tag = 'div') => {
      const el = doc.createElement(tag);
      el.className = cls;
      if (html != null) el.innerHTML = html;
      doc.body.appendChild(el);
      return el;
    },
    cards = mk('p23-c', ''),
    flashEl = mk('p23-fl', null),
    line = mk('p23-m', ''),
    recEl = mk('p23-r', ''),
    pad = mk('p23-in', null),
    upHint = mk('p23-u', '<i>☝</i>'),   // ── fable32 (build 30) ── (the cue by the right thumb keeps its icon; its words are the step card's line — "החליקו למעלה ☝" — and its source, SRC_UP, the lot's end) ── /fable32 ──
    drags = new Map();
  pad.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
      pad.setPointerCapture(ev.pointerId);
    } catch (e) {}
    drags.set(ev.pointerId, [[now(), ev.clientY]]);
  });
  pad.addEventListener('pointermove', (ev) => {
    const trail = drags.get(ev.pointerId);
    if (!trail) return;
    const t = now();
    trail.push([t, ev.clientY]);
    while (trail.length > 1 && t - trail[0][0] > P23.fin.ms / 1e3) trail.shift();
    if (trail[0][1] - ev.clientY > P23.fin.dy * (innerHeight || 390) && E.p23raise()) {
      drags.clear();
      stat.ups++;
    }
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
    pad.addEventListener(type, (ev) => {
      if (drags.delete(ev.pointerId) && E.p23() && !E.p23().raised) stat.slow++;
    });
  cards.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  const best = (id) => {
      try {
        const r = E.roles23()[id];
        return r && r.n ? r.best | 0 : null;
      } catch (e) {
        return null;
      }
    },
    // ── fable32 (build 30) ── the card's record: the role's best rating and title ("השיא שלך: מהודר · מיומן"), or "תפקיד חדש!" (was the best %) ── /fable32 ──
    best30 = (id) => {
      try {
        const r = role30(E.roles23()[id]);
        return r.best ? `השיא שלך: ${RATE30.he[r.best]}${r.title ? ` · ${r.title.he}` : ''}` : null;
      } catch (e) {
        return null;
      }
    },
    cardHtml = (id, i, one, k26) => {
      const role = ROLE[id] || { he: id, icon: '•' },
        b = best30(id);
      return `<${one ? 'div' : 'button type="button"'} class="p23-k${one ? ' one' : ''}" data-i="${i}"><i>${role.icon}</i>${one ? (k26 ? 'הפיס השני: ' : 'הפיס: ') : ''}${esc(role.he)}<small>${b || 'תפקיד חדש!'}</small></${one ? 'div' : 'button'}>`;
    },
    flash = () => {
      stat.flash++;
      flashEl.classList.remove('on');
      flashEl.offsetWidth;
      flashEl.classList.add('on');
    };
  function showCards(p) {
    // ── fable32 (build 28) ── one card (the engine's pick, 0 — a lot of two, which no draw gives now, shows its first: never a choice) ── /fable32 ──
    cards.innerHTML = `<div>${cardHtml(p.cards[0], 0, 1, p.k26)}</div>`;   // ── fable32 (build 30) ── (its source line — SRC_LOT1 / SRC_LOT2 — follows the lot: end30's line, tappable) ── /fable32 ──
    cards.classList.add('on');
    stat.cards++;
    flash();
    snd('chord17', { up: 1 });
    buzz([30, 40, 60]);
  }
  function showPick(ev) {
    const keys = cards.querySelectorAll('.p23-k');
    keys.forEach((k, i) => {
      k.classList.toggle('pk', i === ev.pick);
      k.classList.toggle('no', i !== ev.pick);
    });
    const timeBar = cards.querySelector('.p23-t');
    if (timeBar) timeBar.style.visibility = 'hidden';
    flash();
    snd('good');
  }
  let lineUntil = -1,
    recAt = -1,
    rec = null,
    lotOn = false,
    say = (html, s = 4) => {
      line.innerHTML = html;
      line.classList.add('on');
      stat.lines++;
      lineUntil = E.st33.t + s;
    },
    setOn = (on) => {
      if (lotOn !== on) {
        lotOn = on;
        doc.body.classList.toggle('p23-on', on);
        try {
          const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods,
            twin = mods && mods.twin;
          if (twin && twin.noStick) twin.noStick(on || !!(E.d21() || E.m22()) || globalThis.__SH_NOSTICK === true);
        } catch (e) {}
      }
    },
    tick = null,
    doneAt = -9,
    inAt = -9,
    raisedAt = -9,
    offEv = E.on17((ev) => {
      const type = ev.type;
      if (type === 'p23' && ev.ph === 'in') {
        inAt = now();
        doneAt = -9;
        tick = null;
        cards.classList.remove('on');
        snd('ui');
      } else if (type === 'p23raise') {
        snd(ev.auto ? 'soft' : 'good');
        buzz(ev.auto ? 10 : [20, 30, 20]);
        raisedAt = now();
      } else if (type === 'p23' && ev.ph === 'call') {
        snd('drum23', { n: 0, big: 1 });
        buzz(20);
      } else if (type === 'p23tick') {
        stat.ticks++;
        tick = { ...ev, t: now() };
        snd('drum23', { n: ev.k, end: ev.last });
        buzz(ev.last ? [40, 30, 60] : 12);
      } else if (type === 'p23' && (ev.ph === 'show' || ev.ph === 'choose') && ev.pick == null) showCards(E.p23());
      else if (type === 'p23' && ev.ph === 'show') showPick(ev);
      else if (type === 'p23done') {
        cards.classList.remove('on');
        doneAt = now();
      } else if (type === 'p23rec') stat.recs++;   // ── fable32 (build 30) ── (the record's lines in the act — "השיא שלך: N%" at its start, "שיא חדש!" after it — are gone: the step card says the act's rating) ── /fable32 ──
    });
  function showRec(r) {
    const role = ROLE[r.id] || { he: '' };
    recEl.innerHTML = r.rec
      ? `<b>שיא חדש!</b>${esc(role.he)} — ${r.m}% (היה ${r.prev}%)`
      : r.first
        ? `<b>תפקיד חדש!</b>${esc(role.he)} — ${r.m}%`
        : `${esc(role.he)} — ${r.m}% · השיא ${r.best}%`;
    recEl.classList.remove('on');
    recEl.offsetWidth;
    recEl.classList.add('on');
    if (r.rec || r.first) {
      snd('chord17', { up: 1 });
      buzz([30, 40, 30]);
    }
  }
  let offTick = onTick(() => {
      const st = E.st33;
      if (!st) return;
      if (lineUntil >= 0 && st.t > lineUntil) {
        lineUntil = -1;
        line.classList.remove('on');
      }
      if (rec && st.t >= recAt) {
        showRec(rec);
        rec = null;
        recAt = st.t + 2.4;
      } else if (!rec && recAt >= 0 && st.t > recAt) {
        recAt = -1;
        recEl.classList.remove('on');
      }
      const p = E.p23(),
        wantUp = !!(p && !p.raised);
      setOn(st.phase === 'run' && !st.summary && !!p);
      if (pad.classList.contains('on') !== wantUp) {
        pad.classList.toggle('on', wantUp);
        upHint.classList.toggle('on', wantUp);
        if (!wantUp) drags.clear();
      }
    }),
    HOME = { x: P23.c.x, z: P23.c.z, a0: Math.PI },
    circle = HOME,
    lotC = HOME,
    seat = (i) => {
      const a = circle.a0 + (i * 2 * Math.PI) / P23.seats;
      return [Math.cos(a), Math.sin(a)];
    },
    kohen = (k, x, z, fx, fz, opt) =>
      man(k, L(x), L(z), L(gy(x, z)), { robe: ROBE.kohen, yaw: Math.atan2(fz, fx), skin: SKIN[opt.s | 0], t: opt.t, ...opt.o }),
    lerp = (a, b, u) => a + (b - a) * u,
    clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v),
    along = (way, d) => {
      for (let i = 1; i < way.length; i++) {
        const dx = way[i][0] - way[i - 1][0],
          dz = way[i][1] - way[i - 1][1],
          len = Math.hypot(dx, dz);
        if (d <= len || i === way.length - 1) {
          const u = clamp01(d / len);
          return [way[i - 1][0] + dx * u, way[i - 1][1] + dz * u, dx, dz];
        }
        d -= len;
      }
      return [way[0][0], way[0][1], 1, 0];
    },
    ASH_WAY = [[D21.stand.x, D21.stand.z], [D21.head.x, D21.head.z], [D21.foot.x, D21.foot.z], ...D21.go.slice(1)],
    WOOD_WAY = [
      [-43.5, -11],
      [-32.6, -5.4],
    ],
    offDraw = addDrawer(
      null,
      (k, tt) => {
        const st = E.st33;
        if (!st || st.phase !== 'run' || st.night || st.summary) return;
        const t = now(),
          p = E.p23(),
          gate = E.gate20() || E.gate23(),
          leave = !p && doneAt > 0 && t - doneAt < 2.5 ? (t - doneAt) / 2.5 : -1;
        if (p) lotC = p.C || HOME;
        const C = (circle = p || leave >= 0 ? lotC : HOME),
          walkIn = p && p.k26 ? clamp01((t - inAt) / 0.5) : 1;
        if (gate || p || leave >= 0) {
          const lots = p ? clamp01((t - inAt) / 0.45) : 0,
            ph = p ? p.ph : '',
            tk = tick && p && (ph === 'count' || ph === 'choose' || ph === 'show') ? tick : null;
          for (let i = 1; i < P23.seats; i++) {
            const [cx, cz] = seat(i),
              r = P23.r + (leave > 0 ? leave * 4.5 : 0) + (1 - walkIn) * 4.5,
              x = C.x + cx * r,
              z = C.z + cz * r,
              F = p ? p.F[i] : 1,
              hot = tk && tk.i === i,
              fig = kohen(k, x, z, leave > 0 ? cx : -cx, leave > 0 ? cz : -cz, {
                s: i % 3,
                t: tt + i,
                o: leave > 0 || walkIn < 1 ? { pose: 'walk' } : lots > 0 ? { pose: 'lots', u: lots, fingers: F } : { pose: 'stand' },
              });
            if (lots > 0 && fig && fig.R) {
              const done = tk && i >= p.s0 && i - p.s0 < tk.k;
              k.s(fig.R[0], fig.R[1], fig.R[2] + 0.04, 0.06, 0.06, 0.06, hot ? '!#FFF1B8' : '!#FFD66E');
              k.label(
                hot ? `‎${tk.from}${tk.to > tk.from ? `, ${tk.to}` : ''}` : F === 2 ? '✌' : '☝',
                fig.R[0],
                fig.R[1],
                fig.R[2] + 0.42,
                hot ? 0.3 : 0.2,
                hot ? { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' } : { opacity: done ? 0.55 : 0.9 },
              );
            }
            if (hot) k.ring(L(x), L(z), L(gy(x, z)) + 0.01, 0.42, '!#FFD24A', 16);
          }
          if (leave < 0) {
            const face = seat(tk ? tk.i : 0),
              [cx, cz] = seat(0),
              x = C.x - cx * (1 - walkIn) * 4.5,
              z = C.z - cz * (1 - walkIn) * 4.5,
              fig = man(k, L(x), L(z), L(gy(x, z)), {
                robe: ROBE.kohen,
                cap: CAP_MEMUNE,
                skin: SKIN[2],
                yaw: Math.atan2(face[1], face[0]),
                pose: walkIn < 1 ? 'walk' : ph === 'call' ? 'raise' : tk ? 'point' : 'stand',
                u: 1,
                t: tt,
              });
            if (p && (ph === 'call' || ph === 'count') && fig && fig.head)
              k.label(`הממונה: ${p.N}!`, fig.head[0], fig.head[1], fig.head[2] + 0.55, 0.26, { bg: 'rgba(255,240,200,.96)' });
          }
          if (p && p.raised && !(tk && tk.i === 0)) {
            const [cx, cz] = seat(0),
              x = C.x + cx * P23.r,
              z = C.z + cz * P23.r;
            k.label('☝', L(x), L(z), L(gy(x, z)) + 2 + 0.1 * Math.sin(tt * 4), t - raisedAt < 0.5 ? 0.4 : 0.28, {
              bg: 'rgba(255,226,150,.97)',
              fg: '#4A3510',
            });
          }
          if (tk && tk.i === 0) {
            const [cx, cz] = seat(0),
              x = C.x + cx * P23.r,
              z = C.z + cz * P23.r,
              y = L(gy(x, z)),
              s = 1 + 0.08 * Math.sin(tt * 6);
            k.ring(L(x), L(z), y + 0.01, 0.5 * s, '!#FFD24A', 20);
            k.ring(L(x), L(z), y + 0.02, 0.34 * s, '!#FFF1B8', 14);
            k.label('☝ זכיתם!', L(x), L(z), y + 2.05, 0.3, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' });
          }
        }
        const npc = E.npc23 ? E.npc23() : null,
          clock = st.t;
        if (npc === 'm22') {
          const u = (clock % 6) / 6,
            going = u < 0.42,
            back = u >= 0.58,
            w = going ? u / 0.42 : back ? 1 - (u - 0.58) / 0.42 : 1,
            x = lerp(WOOD_WAY[0][0], WOOD_WAY[1][0], w),
            z = lerp(WOOD_WAY[0][1], WOOD_WAY[1][1], w),
            dx = WOOD_WAY[1][0] - WOOD_WAY[0][0],
            dz = WOOD_WAY[1][1] - WOOD_WAY[0][1],
            fig = kohen(k, x, z, back ? -dx : dx, back ? -dz : dz, {
              s: 1,
              t: clock,
              o: going || back ? { pose: going ? 'carry' : 'walk' } : { pose: 'scoop', u: Math.sin(((u - 0.42) / 0.16) * Math.PI) },
            });
          if (going && fig && fig.R) {
            const a = Math.atan2(dz, dx);
            k.c(fig.R[0], fig.R[1], fig.R[2], 0.09, 1.2, '#9A8466', { yaw: -(a + Math.PI / 2), pitch: Math.PI / 2 });
          }
          kohen(k, M22.pyre.x - 1.6, M22.pyre.z + 2.7, 0.5, -1, { s: 2, t: clock, o: { pose: 'scoop', u: 0.5 + 0.5 * Math.sin(clock * 2.2) } });
        } else if (npc === 'deshen') {
          const len = ASH_WAY.reduce((s, p, i) => s + (i ? Math.hypot(p[0] - ASH_WAY[i - 1][0], p[1] - ASH_WAY[i - 1][1]) : 0), 0),
            c = clock % 11,
            d = c < 7 ? (c / 7) * len : len,
            [x, z, dx, dz] = along(ASH_WAY, d);
          if (c < 8.6) {
            const fig = kohen(k, x, z, c < 7 ? dx : 0, c < 7 ? dz : -1, { s: 0, t: clock, o: { pose: c < 7 ? 'carry' : 'pour', u: 1 } });
            if (fig && fig.R && c < 8) k.c(fig.R[0], fig.R[1], fig.R[2] + 0.02, 0.17, 0.025, '#E4E8EF');
          }
        }
        {
          const fig = kohen(k, -40.6, -8.6, 0.45, 1, { s: 2, t: clock, o: { pose: 'scoop', u: 0.55 + 0.45 * Math.sin(clock * 1.7) } });
          if (fig && fig.R) k.b(fig.R[0] + 0.2, fig.R[1] + 0.25, L(gy(-40.6, -8.6)) + 0.02, 0.26, 0.06, 0.04, '#6A5A44');
        }
        {
          const u = (clock % 16) / 16,
            w = u < 0.5 ? u * 2 : 2 - u * 2,
            x = lerp(-48, -37, w),
            fig = kohen(k, x, -15.6, u < 0.5 ? 1 : -1, 0, { s: 1, t: clock, o: { pose: 'carry' } });
          if (fig && fig.R) k.s(fig.R[0], fig.R[1], fig.R[2] + 0.04, 0.13, 0.13, 0.08, '#C9A04A');
        }
      },
      2,
    ),
    api = {
      destroy() {
        offEv();
        offTick();
        offDraw();
        setOn(false);
        for (const el of [cards, flashEl, line, recEl, pad, upHint])
          try {
            el.remove();
          } catch (e) {}
        try {
          if (globalThis.__P23 === api) delete globalThis.__P23;
        } catch (e) {}
      },
      state: () => ({
        ...stat,
        on: cards.classList.contains('on'),
        cards: [...cards.querySelectorAll('.p23-k')].map((k) => k.textContent.trim()),
        line: line.classList.contains('on') ? line.textContent : '',
      }),
    };
  try {
    globalThis.__P23 = api;
  } catch (e) {}
  return api;
}
const SRC_LOT = 'הפיס — יומא ב, א–ד · טיוטה';
const SRC_LOT1 = '"הִתְקִינוּ שֶׁלֹּא יְהוּ תוֹרְמִין אֶת הַמִּזְבֵּחַ אֶלָּא בְפַיִס" — יומא ב, ב · טיוטה';   // ── fable32 (build 28) ── (the first lot's card; checked on Sefaria) ── /fable32 ──
const ROLE = Object.fromEntries([...POOL23, ...POOL26].map((r) => [r.id, r]));
const SRC_LOT2 = 'הפיס השני: שלושה עשר כהנים — יומא ב, ג · טיוטה';
// ── fable32 (build 30) ── the lot's lines at its end (end30): the count of the fingers (the raise's line was "הממונה סופר אצבעות · יומא ב, א"),
// the lot's own; the second lot's thirteen roles (heichal26's "מי שוחט, מי זורק…", יומא ב, ג) ── /fable32 ──
const SRC_UP = 'הממונה סופר אצבעות · יומא ב, א · טיוטה';
reg30('lot', { chip: SRC_LOT1, all: [SRC_UP, SRC_LOT1] });
reg30('lot2', { chip: SRC_LOT2, all: [SRC_UP, SRC_LOT2, '"מי שוחט, מי זורק, ומי מדשן מזבח הפנימי, ומי מדשן את המנורה…" — יומא ב, ג · טיוטה'] });
const CSS = `.p23-c{position:fixed;left:75.5%;top:30%;transform:translateX(-50%);width:47vw;z-index:36;display:none;direction:rtl;text-align:center;color:#FFF6DA;font:900 16px/1.2 Heebo,system-ui,sans-serif}.p23-c.on{display:block}
.p23-c h3{margin:0 0 8px;font-size:16px;padding:5px 14px;border-radius:14px;background:#1C140AE0;border:1.5px solid #E2B65A;display:inline-block}
.p23-k{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:min(150px,20vw);min-height:104px;margin:0 5px;padding:6px 12px;border-radius:18px;border:3px solid #E2B65A;background:radial-gradient(#4A3618,#1C140A);color:#FFE6A0;font:900 21px/1.15 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 6px 18px #0009;animation:p23in .35s cubic-bezier(.2,1.5,.4,1)}
.p23-k i{font:40px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal}.p23-k small{font:800 12px/1.1 Heebo,system-ui,sans-serif;color:#FFF6DA;opacity:.9}.p23-k.one{pointer-events:none;min-width:min(240px,40vw)}
.p23-k.pk{border-color:#FFF1C8;box-shadow:0 0 0 5px #FFD66E99,0 0 30px 10px #FFD66E88;transform:scale(1.08)}.p23-k.no{opacity:.35;transform:scale(.92)}
.p23-t{height:7px;width:90%;margin:9px auto 0;border-radius:4px;background:#E2B65A;transform-origin:right}.p23-s{margin-top:6px;font-size:12px;display:inline-block;padding:2px 10px;border-radius:10px;background:#1C140AB8}
.p23-fl{position:fixed;inset:0;z-index:35;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 36%,#FFF1C8F0,#FFD66E80 30%,#FFD66E00 68%)}.p23-fl.on{animation:p23f .75s ease-out}
.p23-m{position:fixed;left:50%;top:118px;transform:translateX(-50%);z-index:32;padding:3px 12px;border-radius:12px;background:#1C140AD8;border:1.5px solid #E2B65A;color:#FFE6A0;font:800 13px/1.2 Heebo,system-ui,sans-serif;direction:rtl;pointer-events:none;opacity:0;transition:opacity .3s}.p23-m.on{opacity:1}
.p23-r{position:fixed;left:50%;top:27%;transform:translate(-50%,-50%);z-index:38;text-align:center;pointer-events:none;opacity:0;direction:rtl;white-space:nowrap;font:800 15px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA;text-shadow:0 2px 3px #000}.p23-r.on{animation:p23r 2.4s forwards}
.p23-r b{display:block;font:900 40px/1.1 Heebo,system-ui,sans-serif;color:#FFD66E;-webkit-text-stroke:1.5px #5A3608;text-shadow:0 0 20px #FFB04A}
body.p23-on .gm .tw-pad,body.p23-on .f17-bar{opacity:0!important;pointer-events:none!important}
.p23-in{position:fixed;top:0;bottom:0;left:51%;right:0;z-index:30;touch-action:none;display:none}.p23-in.on{display:block}
.p23-u{position:fixed;left:75.5%;top:56%;transform:translate(-50%,-50%);z-index:31;pointer-events:none;display:none;direction:rtl;text-align:center;color:#FFE6A0;font:900 20px/1.2 Heebo,system-ui,sans-serif;text-shadow:0 2px 4px #000}.p23-u.on{display:block}.p23-u i{display:block;font-style:normal;font-size:46px;line-height:1;animation:p23up .9s ease-in-out infinite}.p23-u small{display:block;font:800 12px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA}
@keyframes p23up{0%{transform:translateY(26px);opacity:.3}60%{transform:translateY(-20px);opacity:1}to{transform:translateY(-26px);opacity:0}}
@keyframes p23f{20%{opacity:1}}@keyframes p23in{from{opacity:0;transform:translateY(-22px) scale(.85)}}@keyframes p23r{0%{opacity:0;scale:.6}12%{opacity:1;scale:1.1}22%{scale:1}84%{opacity:1}to{opacity:0}}
.p23-bk{position:fixed;inset:0;z-index:62;display:flex;align-items:center;justify-content:center;background:#0E0A05B0;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA}
.p23-bk .c{width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;padding:10px 14px 12px;border-radius:20px;background:linear-gradient(#3A2A16,#21170B);border:2px solid #C8923A;text-align:center}
.p23-bk h2{margin:2px 0;font:900 22px/1.2 Heebo,system-ui,sans-serif}.p23-bk .g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.p23-bk .g4{grid-template-columns:repeat(4,1fr);gap:6px}.p23-bk .g4 .q i{font-size:24px}.p23-bk .g4 .q b{font-size:18px}.p23-bk h4{margin:6px 0 0;font:900 15px/1.2 Heebo,system-ui,sans-serif;color:#FFE6A0}
.p23-bk .q{padding:6px 4px;border-radius:14px;background:#1C140A;border:1.5px solid #E2B65A;font:800 13px/1.25 Heebo,system-ui,sans-serif}.p23-bk .q i{display:block;font:34px/1.1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal}
.p23-bk .q b{display:block;font:900 24px/1.1 Heebo,system-ui,sans-serif;color:#FFD66E}.p23-bk .q.lk{border-style:dashed;border-color:#8A6A3A;color:#B8A88A}.p23-bk .q.lk i{filter:brightness(0) opacity(.55)}
.p23-bk .q b.mehudar{color:#FFD66E;text-shadow:0 0 10px rgba(255,214,110,.6)}.p23-bk .q b.kasher{color:#FFF6DA;font-size:20px}.p23-bk .q b.tikkun{color:#E6D9BE;font-size:16px}.p23-bk .sv{font:800 14px/1.2 Heebo,system-ui,sans-serif;color:#FFE6A0}.p23-bk .kr{margin:6px auto 0;padding:4px 10px;border-radius:12px;background:#1C140A;border:1.5px solid #8A6A3A;font:800 13px/1.3 Heebo,system-ui,sans-serif;display:inline-block}.p23-bk .kr b{color:#FFD66E}.p23-bk .kr b.kasher{color:#FFF6DA}.p23-bk .kr b.tikkun{color:#E6D9BE}.p23-bk .tl{display:block;margin:4px 0 2px}
.p23-bk button{min-height:52px;min-width:180px;border-radius:16px;border:2px solid #E2B65A;background:#FFECBE1F;color:#FFF6DA;font:900 18px/1 Heebo,system-ui,sans-serif;cursor:pointer}.p23-bk small{font-size:11px;opacity:.7}
.p23-bk button.p31{display:block;width:100%;min-width:0;min-height:44px;margin-top:5px;padding:0 6px;border-radius:12px;border:2px solid #E2B65A;background:linear-gradient(180deg,#6A4C1C,#3A2A10);color:#FFE6A0;font:900 15px/1 Heebo,system-ui,sans-serif;touch-action:manipulation}.p23-bk button.p31:active{transform:scale(.95)}
.p23-bk .kr button.p31{display:inline-block;width:auto;min-width:96px;margin:0 8px 0 0;vertical-align:middle}.p23-bk .q.sn b{opacity:.6}.p23-bk .n31{margin:4px 0 0;font:700 12px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0;opacity:.85}`;   /* ── fable32 (build 31) ── (the practice doors) ── /fable32 ── */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const css = (doc) => {
  if (!doc.getElementById('p23-css')) {
    const el = doc.createElement('style');
    el.id = 'p23-css';
    el.textContent = CSS;
    doc.head.appendChild(el);
  }
};
