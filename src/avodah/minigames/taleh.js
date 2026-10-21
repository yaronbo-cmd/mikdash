/* ─────────────────────────────────────────────────────────────────────────────
 * taleh.js: the lamb of the Tamid (Tamid 3:3–4; Arachin 2:5; Bekhorot 6).
 * 1. From the lambs' chamber, where at least six checked lambs always waited: choose one. In 3D the player picks it
 *    among the six in their stalls (world.avodah.lambsChamber.positions() → a ring over each; a tap on the lamb itself
 *    goes through lambsChamber.pick(ray)); the chosen one steps out (animal('lamb', 'lambsChamber', { index })).
 * 2. Water it from a gold cup ("השקו את התמיד בכוס של זהב") — in 3D, at its mouth.
 * 3. Check it again by torchlight, although it was checked the evening before: look at the ear, the eyelid, the
 *    nose and the lip, and decide. Two lambs: one with a real blemish, one with a mark that the Mishnah itself
 *    says is NOT a blemish (a cut in the skin of the ear, not the cartilage; a spot in the white of the eye).
 *    The rings sit on the parts as the lamb draws them (animal.partPosition), so they follow its head.
 *    From the tier "בקי" on (gctx.tier ≥ 3): three lambs, the marks are fainter, and a mark shows its detail only
 *    at a second, closer look.
 * The lamb stands calm; the binding (akeida) is not shown — the owner's decision is pending (docs/AVODAH.md ⚑13).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { beast } from './art.js';
import { BLEMISHES } from '../data.js';
import { TAMID_RING } from '../../places.js';

const PARTS = { ear: { x: 118, y: 62, he: 'אוזן' }, eye: { x: 168, y: 92, he: 'עין' }, nose: { x: 238, y: 124, he: 'חוטם' }, lip: { x: 222, y: 146, he: 'שפה' } };
const CLEAN = { id: 'clean', part: null, blemish: false, he: 'תקין', quote: '', source: '', status: 'draft' };   // a lamb with no mark at all

export const taleh = {
  id: 'taleh', title: 'הטלה — השקאה ובדיקה', kicker: 'לשכת הטלאים',
  intro: 'בחר טלה מלשכת הטלאים, השקה אותו בכוס של זהב, ובדוק אותו לאור האבוקות — אף שנבדק כבר בערב.',
  introAgain: 'בחר טלה, השקה אותו, ובדוק לאור האבוקות.',
  stage(W) {
    W.look('lambs', 1600);
    W.avSub('lambsChamber', 'count', 6);
  },
  play(api) {
    const W = api.world, T3 = api.three, { ctx } = api;
    const hard = (ctx.tier || 0) >= 3;
    const svg = api.svg('0 0 360 250', 'טלה לאור האבוקות');
    let phase = 1, lamb = null, animal = null, side = 'left';
    // phase 1: six lambs in the chamber
    const g1 = svgEl('g', {}, svg);
    svgEl('rect', { x: 20, y: 30, width: 320, height: 180, rx: 10, class: 'av-chamber' }, g1);
    svgEl('text', { x: 180, y: 22, class: 'av-lab', 'text-anchor': 'middle' }, g1).textContent = 'לשכת הטלאים — שישה טלאים מבוקרים';
    const pens = [];
    for (let k = 0; k < 6; k++) {
      const x = 70 + (k % 3) * 110, y = 85 + Math.floor(k / 3) * 80;
      const g = svgEl('g', { class: 'av-lambmini', transform: `translate(${x} ${y})`, tabindex: 0 }, g1);
      beast(g, 'lamb', -2, -6, 2.3);   // a calm lamb, in the illustrated style (art.js)
      svgEl('rect', { x: -36, y: -28, width: 76, height: 56, class: 'av-hit' }, g);
      g.addEventListener('pointerdown', () => bring(k));
      pens.push(g);
    }
    api.hint('בחר טלה והוצא אותו.');
    // 3D: a ring over each of the lambs in their stalls; a tap on a lamb itself is picked by the world (a ray)
    const inChamber = W ? W.lambs() : [];
    let offTap = null;
    if (T3 && inChamber.length) {
      const ringAt = (o) => (Array.isArray(o.head) && o.head.length === 3 ? [o.head[0], o.head[1] + 0.35, o.head[2]] : [o.x, (o.y || 16) + 1.9, o.z]);
      T3.targets(inChamber.slice(0, 6).map((o, k) => ({ key: `lamb-${k}`, at: ringAt(o), small: true, onTap: () => bring(k) })));
      // all six above the card, seen from the open court (south-east of the chamber, 40° down) — places.SHOTS.lambs' side
      T3.fit(1100, { pts: inChamber.slice(0, 6).map(ringAt), dir: [1, 1.2, 1] });
      api.hint('שישה טלאים בלשכה — הקש על טלה כדי להוציא אותו.');
      let down = null;
      const onDown = (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; };
      const onUp = (e) => {
        if (phase !== 1 || !down || !T3.alive) return;
        const tap = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8 && performance.now() - down.t < 450;
        down = null;
        if (!tap || (e.target && e.target.closest && e.target.closest('.av-mg-card, .av3d-t, .av-top, .av-prog'))) return;
        const i = W.pickLamb(e.clientX, e.clientY);
        const k = inChamber.findIndex((o) => o.i === i);
        if (k >= 0) bring(k);
      };
      addEventListener('pointerdown', onDown, true); addEventListener('pointerup', onUp, true);
      offTap = () => { removeEventListener('pointerdown', onDown, true); removeEventListener('pointerup', onUp, true); };
      api.onCleanup(offTap);
    }
    function bring(k) {
      if (phase !== 1) return;
      phase = 2; g1.remove();
      if (offTap) { offTap(); offTap = null; }
      W && W.sanct('highlight', 'lambs');
      const pick = inChamber[k];
      animal = W ? W.animal('lamb', 'lambsChamber', pick ? { tamid: true, index: pick.i } : { tamid: true }) : null;
      drawLamb();
      cupPhase();
    }
    // the lamb in profile (head to the right), with the parts to inspect
    let spots = {}, torch = null;
    function drawLamb() {
      lamb = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-night' }, lamb);
      torch = svgEl('circle', { cx: 180, cy: 110, r: 80, class: 'av-torchlight' }, lamb);
      svgEl('ellipse', { cx: 95, cy: 135, rx: 75, ry: 45, class: 'av-wool' }, lamb);
      for (const x of [50, 75, 120, 145]) svgEl('rect', { x, y: 165, width: 9, height: 45, rx: 4, class: 'av-leg' }, lamb);
      const head = svgEl('g', {}, lamb);
      svgEl('path', { d: 'M140 80 C170 60 230 90 248 120 C252 134 236 150 214 148 C190 146 160 130 140 118 Z', class: 'av-wool head' }, head);
      svgEl('path', { d: 'M126 60 C112 48 100 58 108 72 C114 80 128 78 134 72 Z', class: 'av-ear' }, head);
      svgEl('circle', { cx: 168, cy: 92, r: 5, class: 'av-eye' }, head);
      svgEl('circle', { cx: 240, cy: 124, r: 3, class: 'av-nostril' }, head);
      svgEl('path', { d: 'M210 142 Q224 150 236 140', class: 'av-lip' }, head);
      svgEl('text', { x: 20, y: 236, class: 'av-lab light' }, lamb).textContent = 'הקש על אוזן, עין, חוטם ושפה כדי לבדוק';
      api.play.addEventListener('pointermove', (e) => {
        const r = api.play.getBoundingClientRect();
        torch.setAttribute('cx', ((e.clientX - r.left) / r.width) * 360); torch.setAttribute('cy', ((e.clientY - r.top) / r.height) * 250);
      });
    }
    /* 3D: a look at the lamb's head by torchlight, from the side toward the open court (south-east of the chamber).
     * The world's camera keeps at least 35 amot from what it looks at (main.js OrbitControls.minDistance), where a lamb's
     * head is a few pixels: so the four rings are fanned out round the head on the screen's plane, each on the side of its
     * part as the lamb is drawn — the nose ahead, the lip ahead and below, the eyelid ahead and above, the ear behind and
     * above (animal.partPosition gives the head and the parts; the lamb's facing gives "ahead") — like the Menorah's lamps
     * (spreadLamps). They follow the head. Without partPosition: points from the position and facing (an estimate). */
    let close = null;
    const FAN = 2.7;   // amot from the head, on the screen's plane (≈ 90 px at the camera's nearest)
    function closeUp() {
      if (close) return close;
      const pos = animal && animal.position;
      if (!T3 || !pos) return null;
      const yaw = animal.facing != null ? animal.facing : 0, sc = animal.scale || 1;
      const f = [Math.sin(yaw), Math.cos(yaw)], left = [Math.cos(yaw), -Math.sin(yaw)];
      side = left[0] + left[1] >= 0 ? 'left' : 'right';
      const sd = side === 'left' ? left : [-left[0], -left[1]];
      const est = [pos.x + f[0] * 1.2 * sc, pos.y + 1.55 * sc, pos.z + f[1] * 1.2 * sc];
      const headNow = () => animal.part('head', side) || est;
      // the camera's right and up (world units), each frame; the lamb's "ahead" and "above" on that plane
      const basis = () => {
        const cam = api.world && api.world.camera, e = cam && cam.matrixWorld && cam.matrixWorld.elements;
        if (!e) return null;
        const R = [e[0], e[1], e[2]], U = [e[4], e[5], e[6]];
        let ax = f[0] * R[0] + f[1] * R[2], ay = f[0] * U[0] + f[1] * U[2];
        const n = Math.hypot(ax, ay);
        if (n < 0.2) { ax = 1; ay = 0; } else { ax /= n; ay /= n; }
        return { R, U, ahead: [ax, ay] };
      };
      const DIR = { nose: [1, 0], mouth: [1, 0], lip: [1, -1], eye: [1, 1], ear: [-0.6, 1] };   // (ahead, above)
      const at = (part) => () => {
        const h = headNow(), B = basis(), P = animal.part(part, side);
        if (!B) return P || h;
        const [a, u] = DIR[part] || [1, 0], k = Math.hypot(a, u);
        let sx = (B.ahead[0] * a) / k, sy = (B.ahead[1] * a + u) / k;   // the fan's direction on the screen (above = +y)
        // bent toward where the part is drawn from the head (partPosition), as far as the fan's order allows
        if (P) {
          const v = [P[0] - h[0], P[1] - h[1], P[2] - h[2]], px = v[0] * B.R[0] + v[1] * B.R[1] + v[2] * B.R[2], py = v[0] * B.U[0] + v[1] * B.U[1] + v[2] * B.U[2], pm = Math.hypot(px, py);
          if (pm > 0.02) { sx += (px / pm) * 0.3; sy += (py / pm) * 0.3; }
        }
        const m = Math.hypot(sx, sy) || 1;
        return [0, 1, 2].map((i) => h[i] + (B.R[i] * sx + B.U[i] * sy) * (FAN / m));
      };
      const head = headNow();
      // the frame: from the open court, south-east and 40° down as when the lamb was chosen (the chamber's low side), 36 amot
      // away (the controls would push a nearer camera back)
      const D = [1, 1.2, 1], dn = Math.hypot(...D), d = 36;
      close = { at, frame: { p: [0, 1, 2].map((i) => head[i] + (D[i] / dn) * d), t: [head[0], head[1], head[2]] } };
      return close;
    }
    let cup = null;
    function cupPhase() {
      cup = svgEl('g', { class: 'av-cup', transform: 'translate(300 60)', tabindex: 0 }, svg);
      svgEl('path', { d: 'M-16 -12 L16 -12 L10 10 L-10 10 Z', class: 'av-gold' }, cup);
      svgEl('rect', { x: -3, y: 10, width: 6, height: 10, class: 'av-gold' }, cup);
      svgEl('rect', { x: -12, y: 20, width: 24, height: 4, class: 'av-gold' }, cup);
      svgEl('text', { x: 0, y: 40, class: 'av-lab light', 'text-anchor': 'middle' }, cup).textContent = 'כוס של זהב';
      svgEl('rect', { x: -24, y: -20, width: 48, height: 64, class: 'av-hit' }, cup);
      cup.addEventListener('pointerdown', water);
      api.hint('השקה את הטלה: הקש על כוס הזהב.');
      const C = closeUp();
      if (C) {
        T3.frame(C.frame, 900);
        T3.targets([{ key: 'cup', at: C.at('mouth'), label: 'כוס של זהב', onTap: water }]);
        api.hint('"השקו את התמיד בכוס של זהב" — הקש ליד פיו.');
      } else if (T3) T3.clear();
    }
    function water() {
      if (phase !== 2) return;
      phase = 3;
      cup.setAttribute('transform', 'translate(250 118) rotate(-35)');
      W && W.sanct('highlight', null);
      api.sfx && api.sfx.play('water');
      if (T3) T3.done('cup');
      api.after(700, () => { cup.remove(); inspect(0); });
    }
    // phase 3: the inspections (two; three from the tier "בקי")
    const real = BLEMISHES.filter((b) => b.blemish), notReal = BLEMISHES.filter((b) => !b.blemish);
    const any = (a) => a[Math.floor(Math.random() * a.length)];
    const cases = [any(real), any(notReal)];
    if (hard) cases.push(Math.random() < 0.5 ? CLEAN : any(real.filter((b) => b !== cases[0])));
    let round = 0, looked = new Set(), closer = new Set(), btnOk = null, btnBad = null, marks = [];
    function lambTargets() {
      const C = closeUp();
      if (!C) { if (T3) T3.clear(); return; }
      T3.frame(C.frame, 700);
      T3.targets(Object.keys(PARTS).map((part) => ({ key: `part-${part}`, at: C.at(part), small: true, label: PARTS[part].he, onTap: () => { spots[part].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); if (looked.has(part) && (!hard || closer.has(part) || cases[round].part !== part)) T3.done(`part-${part}`); api.hint(marks.length ? marks[marks.length - 1].textContent : '', ''); } })));
    }
    function inspect(r) {
      round = r; looked = new Set(); closer = new Set();
      marks.forEach((m) => m.remove()); marks = [];
      for (const s of Object.values(spots)) s.remove();
      spots = {};
      const c = cases[r];
      if (animal) animal.inspect(true);
      for (const [part, p] of Object.entries(PARTS)) {
        const s = svgEl('circle', { cx: p.x, cy: p.y, r: 17, class: 'av-spot', tabindex: 0 }, lamb);
        s.addEventListener('pointerdown', () => {
          const hot = c.part === part;
          // from "בקי" on: a mark first shows only that something is there; a second, closer look tells what it is
          const first = !looked.has(part);
          looked.add(part);
          s.classList.add('seen');
          let finding = hot ? c.he : 'תקין';
          if (hard && hot && first) finding = 'יש כאן סימן — הבט שוב, מקרוב';
          else if (hard && hot) closer.add(part);
          const t = svgEl('text', { x: p.x, y: p.y - 22, class: 'av-find' + (hot ? ' hot' : ''), 'text-anchor': 'middle' }, lamb);
          t.textContent = `${p.he}: ${finding}`;
          marks.push(t);
          api.sfx && api.sfx.play('ui');
        });
        spots[part] = s;
      }
      // the mark itself, drawn on the lamb (fainter from "בקי" on)
      if (c.part) { const p = PARTS[c.part]; marks.push(svgEl('path', { d: `M${p.x - 4} ${p.y - 3} l6 4 l-3 5`, class: c.blemish && !hard ? 'av-flaw' : 'av-flaw soft' }, lamb)); }
      const n = cases.length;
      api.hint(r === 0 ? (api.repeat ? 'בדוק ארבעה מקומות, ואז החלט.' : 'בדוק את ארבעת המקומות, ואז החלט.') : `טלה ${r === 1 ? 'שני' : 'שלישי'}${n > 2 ? ` מתוך ${n}` : ''}. בדוק היטב — לא כל סימן הוא מום.`);
      lambTargets();
      if (!btnOk) {
        btnBad = api.button('בעל מום', () => decide(true), 'ghost');
        btnOk = api.button('כשר לתמיד', () => decide(false), 'gold');
      }
    }
    function decide(saysBlemish) {
      if (phase !== 3) return;
      const c = cases[round];
      if ((c.part && !looked.has(c.part)) || looked.size < (c.part ? 3 : 4)) { api.miss('בדוק קודם — אוזן, עין, חוטם ושפה, לאור האבוקה.'); return; }
      if (hard && c.part && !closer.has(c.part)) { api.miss('יש סימן — הבט בו שוב מקרוב לפני שאתה מחליט.'); return; }
      if (saysBlemish !== c.blemish) {
        api.miss(!c.part ? 'הטלה תקין בכל ארבעת המקומות — כשר.' : c.blemish ? `זה מום: "${c.quote}" (${c.source}).` : `זה אינו מום: "${c.quote}" (${c.source}).`);
        return;
      }
      api.sfx && api.sfx.play('chime', { n: 4 + round });
      if (round < cases.length - 1) {
        api.hint(c.part ? `נכון — "${c.quote}". ${c.blemish ? 'החזר אותו ללשכה והבא טלה אחר.' : 'ובכל זאת — בדוק עוד טלה.'}` : 'נכון — תקין. ועוד טלה.', 'ok');
        api.after(1200, () => inspect(round + 1));
        return;
      }
      phase = 4;
      btnOk.disabled = btnBad.disabled = true;
      if (T3) T3.clear();
      if (animal) { animal.inspect(false); animal.leadTo(TAMID_RING.morning); if (ctx.shared) ctx.shared.lamb = animal; }
      W && W.kohen('player').carry(null);
      api.done({ text: c.part ? `נכון — "${c.quote}" (${c.source}). הטלה כשר. מושכים אותו לבית המטבחיים.` : 'נכון — אין בו מום. הטלה כשר, ומושכים אותו לבית המטבחיים.', linger: 1300 });
    }
    api.solver(async () => {
      api.hit('lamb-0', pens[0].querySelector('.av-hit'), 'down');
      while (!cup) await api.wait(40);
      await api.wait(40);
      api.hit('cup', cup.querySelector('.av-hit'), 'down');
      for (let r = 0; r < cases.length; r++) {
        while (round !== r || !Object.keys(spots).length || phase !== 3) await api.wait(40);
        await api.wait(60);
        for (let pass = 0; pass < (hard ? 2 : 1); pass++) for (const [part, s] of Object.entries(spots)) { api.hit(`part-${part}`, s, 'down'); await api.wait(40); }
        press(cases[r].blemish ? btnBad : btnOk);
        await api.wait(r < cases.length - 1 ? 1500 : 100);
      }
    });
  },
};
