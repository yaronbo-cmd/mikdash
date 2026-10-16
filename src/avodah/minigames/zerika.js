/* ─────────────────────────────────────────────────────────────────────────────
 * zerika.js: שחיטה, קבלה וזריקה (Tamid 4:1; Zevachim 5:4; Middot 3:1). With dignity (PROJECT.md §2.9):
 * no animal is drawn at the moment of shechita — the view cuts to the kohanim's faces and the vessel.
 * 1. The place: north of the altar, the morning Tamid at the north-west corner, on the second ring (the afternoon
 *    one at the north-east). Pick the ring.
 * 2. "שחט השוחט" — a quiet cut-away (world.avodah.slaughter).
 * 3. "וקבל המקבל" — catch the blood in the mizrak: tap when the vessel is in place.
 * 4. "שתי מתנות שהן ארבע": the north-east corner, then the south-west, each BELOW the red line; the rest on the
 *    southern base — the yesod runs along the south side only one amah from the west (Middot 3:1), so the remnants
 *    are poured by the south-west corner.
 * From the tier "בקי" (gctx.tier ≥ 3) the corners and the line have no guide: the rings carry no names, and the plan's
 * corners and the side view's line are unlabelled — the player gives the blood from what he knows.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { RINGS, TAMID_RING, ALTAR_CORNERS, LEVEL, ALTAR } from '../../places.js';

/* camera frames (QA P2-6: after the zerika the old frame was a close, steep look at paving and a headless kohen) */
const SW_SHOT = { p: [ALTAR.x0 - 12, LEVEL.azara + 13, ALTAR.z1 + 24], t: [ALTAR.x0 + 4, LEVEL.azara + 2.5, ALTAR.z1 - 2.5] };   // the SW corner and its yesod
const AFTER_SHOT = { p: [ALTAR.x0 - 10, LEVEL.azara + 20, ALTAR.z1 + 33.5], t: [ALTAR.x0 + 10, LEVEL.azara + 4, ALTAR.z1 - 8.5] };   // the altar's SW quarter

export const zerika = {
  id: 'zerika', title: 'שחיטה, קבלה וזריקה', kicker: 'צפון המזבח',
  intro: 'העבודה בצפון המזבח: מצא את הטבעת, קבל את הדם במזרק, ותן "שתי מתנות שהן ארבע" — למטה מחוט הסיקרא.',
  introAgain: 'הטבעת, המזרק, ושתי מתנות שהן ארבע — למטה מן החוט.',
  stage(W) { W.time('dawn'); W.look('slaughter', 1600); },
  play(api) {
    const { ctx } = api, W = api.world;
    const pm = ctx.segment === 'erev';
    const pro = api.tier >= 3;   // no guide on the corners and the line
    const svg = api.svg('0 0 360 250', 'מקום השחיטה והמזבח');
    let phase = 1;
    // phase 1: the rings (plan: north up, east right; the altar below = south)
    const g1 = svgEl('g', {}, svg);
    svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, g1);
    svgEl('rect', { x: 70, y: 196, width: 220, height: 54, class: 'av-altartop' }, g1);
    svgEl('text', { x: 180, y: 230, class: 'av-lab', 'text-anchor': 'middle' }, g1).textContent = 'המזבח (דרום)';
    svgEl('text', { x: 180, y: 16, class: 'av-lab', 'text-anchor': 'middle' }, g1).textContent = 'צפון';
    svgEl('text', { x: 352, y: 120, class: 'av-lab', 'text-anchor': 'end' }, g1).textContent = 'מזרח';
    svgEl('text', { x: 8, y: 120, class: 'av-lab' }, g1).textContent = 'מערב';
    const want = pm ? { c: 3, r: 1 } : { c: 0, r: 1 };
    const target = pm ? TAMID_RING.afternoon : TAMID_RING.morning;
    const rings = [];
    RINGS.xs.forEach((x, c) => RINGS.zs.forEach((z, r) => {
      const cx = 105 + c * 50, cy = 172 - r * 28;
      const ring = svgEl('circle', { cx, cy, r: 10, class: 'av-ringmark', tabindex: 0 }, g1);
      svgEl('circle', { cx, cy, r: 16, class: 'av-hit' }, g1).addEventListener('pointerdown', () => pickRing(c, r, ring));
      rings.push({ c, r, ring });
    }));
    api.hint(pm ? 'תמיד של בין הערביים: באיזו טבעת?' : 'תמיד של שחר: באיזו טבעת שוחטים?');
    const T3 = api.three;
    if (T3) {
      T3.frame({ p: [-14, 40, -8], t: [-38, 16, -40] }, 1300);
      T3.targets(rings.map(({ c, r, ring }) => ({ key: `ring-${c}-${r}`, at: [RINGS.xs[c], RINGS.y + 0.3, RINGS.zs[r]], small: true, onTap: () => pickRing(c, r, ring) })));
    }
    let animal = null;
    function pickRing(c, r, ring) {
      if (phase !== 1) return;
      if (c !== want.c || r !== want.r) {
        api.miss(pm ? 'של בין הערביים — "על קרן מזרחית צפונית, על טבעת שניה".' : 'של שחר — "על קרן צפונית מערבית, על טבעת שניה" (תמיד ד, א).');
        return;
      }
      phase = 2; ring.classList.add('set');
      api.hint('ראשו לדרום ופניו למערב; השוחט עומד במזרח ופניו למערב.', 'ok');
      if (W) { animal = (ctx.shared && ctx.shared.lamb) || W.animal('lamb', target, { tamid: true }); if (ctx.shared) ctx.shared.lamb = null; W.kohen('player').carry('mizrak'); }
      api.after(1100, cutaway);
    }
    // phase 2: the cut-away
    async function cutaway() {
      g1.remove();
      if (T3) { T3.clear(); T3.frame({ p: [-30, 22, -14], t: [-84, 52, 0] }, 900); }
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-veil' }, g);
      svgEl('text', { x: 180, y: 118, class: 'av-say', 'text-anchor': 'middle' }, g).textContent = 'שָׁחַט הַשּׁוֹחֵט';
      svgEl('text', { x: 180, y: 146, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = 'המצלמה פונה אל פני הכהנים ואל הכלי';
      api.sfx && api.sfx.play('solemn');
      const p = W ? W.avWait('slaughter', [animal ? animal.raw : null, target], 5000) : Promise.resolve();
      await Promise.race([p, api.wait(api.repeat ? 1500 : 2400)]);   // ≤ 3.3 s, ≤ 2 s on a repeat play
      await api.wait(api.repeat ? 500 : 900);
      g.remove(); catchPhase();
    }
    // phase 3: the mizrak
    let mx = 0, dir = 1, caught = false, catchBtn = null, bowl = null;
    function catchPhase() {
      phase = 3;
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, g);
      svgEl('rect', { x: 160, y: 60, width: 40, height: 14, rx: 4, class: 'av-zone' }, g);
      svgEl('text', { x: 180, y: 52, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = 'כאן';
      bowl = svgEl('g', {}, g);
      svgEl('path', { d: 'M-22 0 Q0 26 22 0 Z', class: 'av-silver' }, bowl);
      svgEl('text', { x: 0, y: 44, class: 'av-lab', 'text-anchor': 'middle' }, bowl).textContent = 'מזרק';
      api.loop((dt) => {
        if (phase !== 3 || caught) return;
        mx += dir * dt * 170 * (ctx.fast ? 0.12 : 1); if (mx > 130) { mx = 130; dir = -1; } if (mx < -130) { mx = -130; dir = 1; }
        bowl.setAttribute('transform', `translate(${180 + mx} 96)`);
      });
      catchBtn = api.button('קבל!', () => {
        if (caught) return;
        if (Math.abs(mx) > 24) { api.miss('המזרק עוד לא במקומו — נסה שוב.'); return; }
        caught = true; catchBtn.remove();
        svgEl('ellipse', { cx: 0, cy: 6, rx: 14, ry: 4, class: 'av-blood' }, bowl);
        if (animal) animal.hide();
        W && W.kohen('player').walkTo([-23, -18.5]);
        api.sfx && api.sfx.play('chime', { n: 4 });
        api.after(600, () => { g.remove(); altarPhase(); });
      }, 'gold');
      api.hint('"וקבל המקבל": הקש כשהמזרק מתחת לסימן.');
    }
    // phase 4: the corners and the red line
    const order = ['NE', 'SW'];
    let gift = 0, corner = null, cornerEls = {}, side = null, lowerZone = null, upperZone = null, baseEl = null;
    function altarPhase() {
      phase = 4;
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, g);
      // plan of the altar (left) and a side view of a corner (right)
      svgEl('rect', { x: 20, y: 50, width: 150, height: 150, class: 'av-altartop' }, g);
      svgEl('text', { x: 95, y: 40, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = 'צפון';
      svgEl('text', { x: 95, y: 218, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = 'דרום';
      const C = { NE: [160, 60, 'מזרחית צפונית'], NW: [30, 60, 'צפונית מערבית'], SE: [160, 190, 'דרומית מזרחית'], SW: [30, 190, 'מערבית דרומית'] };
      for (const [k, [x, y, he]] of Object.entries(C)) {
        const c = svgEl('g', { class: 'av-corner', tabindex: 0 }, g);
        svgEl('rect', { x: x - 12, y: y - 12, width: 24, height: 24, rx: 3 }, c);
        svgEl('rect', { x: x - 20, y: y - 20, width: 40, height: 40, class: 'av-hit' }, c);
        c.addEventListener('pointerdown', () => pickCorner(k, he));
        cornerEls[k] = c;
      }
      side = svgEl('g', { transform: 'translate(200 40)', opacity: 0.35 }, g);
      svgEl('rect', { x: 0, y: 20, width: 140, height: 170, class: 'av-altarside' }, side);
      svgEl('rect', { x: 0, y: 103, width: 140, height: 4, class: 'av-redline' }, side);
      svgEl('text', { x: 70, y: 14, class: 'av-lab', 'text-anchor': 'middle' }, side).textContent = 'קיר המזבח';
      if (!pro) svgEl('text', { x: 138, y: 100, class: 'av-lab small', 'text-anchor': 'end' }, side).textContent = 'חוט הסיקרא';
      upperZone = svgEl('rect', { x: 0, y: 20, width: 140, height: 83, class: 'av-hit' }, side);
      lowerZone = svgEl('rect', { x: 0, y: 107, width: 140, height: 83, class: 'av-hit' }, side);
      upperZone.addEventListener('pointerdown', (e) => give(e, false));
      lowerZone.addEventListener('pointerdown', (e) => give(e, true));
      baseEl = svgEl('rect', { x: 20, y: 204, width: 44, height: 12, rx: 3, class: 'av-base', tabindex: 0 }, g);   // the southern yesod, by the SW corner (Middot 3:1)
      baseEl.addEventListener('pointerdown', () => remnant());
      api.hint(pro ? 'המתנה הראשונה.' : 'המתנה הראשונה — לאיזו קרן?');
      if (T3) cornerTargets();
      function cornerTargets() {
        T3.frame('altarTop', 1100);
        const Y = LEVEL.redLine + 1.2;
        T3.targets(Object.entries(C).map(([k, [, , he]]) => ({ key: `corner-${k}`, at: [ALTAR_CORNERS[k][0], Y + 3, ALTAR_CORNERS[k][1]], label: pro ? undefined : `קרן ${he}`, onTap: () => pickCorner(k, he) })));
      }
      function lineTargets(k) {
        const [x, z] = ALTAR_CORNERS[k], out = k === 'NE' ? [14, -16] : [-14, 16];
        T3.frame({ p: [x + out[0], LEVEL.redLine + 3, z + out[1]], t: [x, LEVEL.redLine, z] }, 1000);
        T3.targets([
          { key: 'line-up', at: [x, LEVEL.redLine + 2.2, z], label: pro ? undefined : 'מעל החוט', onTap: () => give(null, false) },
          { key: 'line-down', at: [x, LEVEL.redLine - 2.2, z], label: pro ? undefined : 'מתחת לחוט', onTap: () => give(null, true) },
        ]);
      }
      function pickCorner(k, he) {
        if (gift >= 2) return;
        if (k !== order[gift]) { api.miss(gift === 0 ? 'העולה: "בא לו לקרן מזרחית צפונית" — ראשונה.' : 'המתנה השנייה — בקרן מערבית דרומית, באלכסון.'); return; }
        corner = k; side.setAttribute('opacity', 1);
        Object.values(cornerEls).forEach((c) => c.classList.remove('sel')); cornerEls[k].classList.add('sel');
        api.hint(pro ? `קרן ${he}: היכן על הקיר?` : `קרן ${he}: הקש על הקיר — למעלה או למטה מחוט הסיקרא?`);
        if (T3) lineTargets(k);
      }
      function give(e, lower) {
        if (!corner) { api.miss('בחר קודם קרן.'); return; }
        if (!lower) { api.miss('דם העולה ניתן למטה מחוט הסיקרא, מחצי המזבח ולמטה (מדות ג, א; רמב״ם מעשה הקרבנות ה, ו).'); return; }
        svgEl('circle', { cx: 30 + gift * 60, cy: 150, r: 8, class: 'av-bloodmark' }, side);
        W && W.av('sprinkle', corner, 'lower');
        W && W.kohen('player').pose('throw');
        api.sfx && api.sfx.play('chime', { n: 5 + gift });
        cornerEls[corner].classList.add('done');
        gift++; corner = null; side.setAttribute('opacity', 0.35);
        if (gift === 1) api.hint('"ונותן מזרחה צפונה" — שני צדדים במתנה אחת. עכשיו המתנה השנייה.', 'ok');
        if (gift === 2) api.hint('שתי מתנות שהן ארבע! את שירי הדם — על היסוד הדרומי.', 'ok');
        if (T3 && gift === 1) cornerTargets();
        // the southern yesod: "ואוכל בדרום אמה אחת" (Middot 3:1) — only its first amah from the west, by the SW corner
        if (T3 && gift === 2) { T3.frame(SW_SHOT, 1000); T3.targets([{ key: 'yesod', at: [ALTAR.x0 + 0.6, LEVEL.azara + 1.1, ALTAR.z1 - 0.5], label: 'היסוד הדרומי', onTap: () => remnant() }]); }
      }
      function remnant() {
        if (gift < 2) { api.miss('שירי הדם — אחרי שתי המתנות.'); return; }
        baseEl.classList.add('set');
        // ── water ── (WATER, wave 6) the rest of the blood runs from his vessel, a thin dark trickle along the southern yesod
        // into the two holes at the SW corner (Middot 3:2) — world.avodah.shirayim; then he puts the vessel down
        // (fire and forget: the flow never waits for it; the vessel is put down when the pour ends, or after 12 s at most)
        const sh = W && W.hasFn && W.hasFn('avodah', 'shirayim') ? W.av('shirayim', 'S', { kohen: 'player' }) : null;
        if (sh && typeof sh.then === 'function') {
          let put = false;
          const down = () => { if (put) return; put = true; const P = W.kohen('player'); if (!P.raw || P.raw.item === 'mizrak') P.carry(null); };
          sh.then(down, down); setTimeout(down, 12000);
        } else if (W) W.kohen('player').carry(null);
        // ── end water ──
        // (QA P2-6) what stays in view with the card: the altar's south-west quarter — the SW gift below the line, the yesod
        if (W) W.look(AFTER_SHOT, 1400);
        api.sparkle(26, 86, 10);
        api.done({ text: '"שירי הדם היה שופך על יסוד דרומית". הזריקה נעשתה.', linger: 1000 });
      }
    }
    api.solver(async () => {
      const R = rings.find((x) => x.c === want.c && x.r === want.r);
      api.hit(`ring-${want.c}-${want.r}`, R.ring.nextSibling, 'down');
      while (phase < 3 || !catchBtn) await api.wait(40);
      while (!caught) { if (Math.abs(mx) <= 18) press(catchBtn); await api.wait(15); }
      while (phase < 4 || !cornerEls.NE) await api.wait(40);
      for (const k of order) { api.hit(`corner-${k}`, cornerEls[k].querySelector('.av-hit'), 'down'); await api.wait(60); api.hit('line-down', lowerZone, 'down'); await api.wait(80); }
      api.hit('yesod', baseEl, 'down');
    });
  },
};
