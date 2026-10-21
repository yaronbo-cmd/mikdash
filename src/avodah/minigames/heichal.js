/* ─────────────────────────────────────────────────────────────────────────────
 * heichal.js: into the Heichal (Tamid 3:6–9).
 * 1. The great gate: open it — the slaughterer waits for its sound, heard as far as Jericho (3:7–8).
 *    Default (as the owner has seen it): the player holds the gate's ring from the Ulam, then walks in.
 *    ⚑ Option HEICHAL_OPTS.wicket (or window.__AV_WICKET): the Mishnah's way — "נכנס לו בפשפש שבצפון, ונכנס להיכל" —
 *    in by the northern wicket (world.sanctuary.enter('heichal', { via: 'wicket' })), then, inside, facing the gate
 *    (focus('heichal-gate')), the player opens it from within.
 * 2. דישון מזבח הזהב: scoop the ashes by handfuls into the teni, then sweep the rest in (3:9).
 * 3. הטבת חמש הנרות: step onto the stone with three steps, clean five lamps and leave the two eastern ones
 *    burning (3:9), then set the kuz on the second step.
 * 3D points: world.sanctuary.anchor(…) — gate, gate-in, gold-altar-top, menorah-stone, menorah-stone-2 — and the lamps by
 * lampPosition (world.js lampsWestToEast); places.js when the world has no anchors.
 * The lamps: levels[0..6] west → east (index 6 = the easternmost). Which lamps are "eastern" depends on how the
 * Menorah stood (Menachot 98b; needs the owner's decision): the picture here is an illustration.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { spreadLamps } from '../interact3d.js';
import { HEICHAL_DOOR, GOLD_ALTAR, MENORAH_STONE } from '../../places.js';

/** ⚑ the opener's route (docs/AVODAH.md ⚑12): false = from the Ulam (default); true = by the northern wicket (Tamid 3:7) */
export const HEICHAL_OPTS = { wicket: false };
const byWicket = (W) => !!(HEICHAL_OPTS.wicket || (typeof window !== 'undefined' && window.__AV_WICKET === true)) && !!W && W.canProject && W.hasFn('sanctuary', 'enter') && W.hasFn('sanctuary', 'anchor');

export const heichal = {
  id: 'heichal', title: 'בהיכל — דישון והטבת הנרות', kicker: 'ההיכל',
  intro: 'פתח את השער הגדול מבפנים, דשן את מזבח הזהב, והטב חמישה נרות — את שני המזרחיים השאר דולקים.',
  introAgain: 'פתח את השער הגדול, דשן את מזבח הזהב, והטב חמישה נרות.',
  stage(W, ctx) {
    W.time('dawn'); W.sanct('setLamps', [0, 0, 0, 0, 0, 1, 1]); W.sanct('setGoldAltar', { coals: 0.4, smoke: 0 });
    // ⚑ the wicket: in by the northern wicket and the cell; the game goes on while the walk ends (play waits for it)
    if (byWicket(W)) { W.sanct('setDoors', 0); const p = W.sanctWait('enter', ['heichal', { via: 'wicket' }], 11000); if (ctx) ctx.wicketIn = p; return p; }
    // 3D: the gate first, seen from the Ulam; the walk-in comes when it opens (see play)
    if (W.canProject && W.hasFn('sanctuary', 'focus')) { W.sanct('setDoors', 0); return W.sanctWait('focus', ['heichal-doors', 1200], 4000); }
    if (!W.hasFn('sanctuary', 'enter')) W.look('heichalDoor', 1400);
    return W.sanctWait('enter', ['heichal', { ms: 6000 }], 11000);
  },
  play(api) {
    const W = api.world;
    const wicket = byWicket(W) && !!api.three;
    const svg = api.svg('0 0 360 250', 'ההיכל מבפנים');
    let phase = 1, open = 0;
    /** a world anchor, or the places.js fallback */
    const A = (id, fb) => (W && W.anchor(id)) || fb;
    // phase 1: the gate
    const g1 = svgEl('g', {}, svg);
    svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-hall' }, g1);
    const dL = svgEl('rect', { x: 100, y: 40, width: 80, height: 190, class: 'av-door' }, g1);
    const dR = svgEl('rect', { x: 180, y: 40, width: 80, height: 190, class: 'av-door' }, g1);
    svgEl('text', { x: 180, y: 28, class: 'av-lab light', 'text-anchor': 'middle' }, g1).textContent = 'השער הגדול — מבפנים';
    const gateBtn = api.button('החזק כדי לפתוח את השער', () => {}, 'gold hold');
    const H = api.hold(gateBtn);
    let creaked = false, sentOpen = 0;
    api.loop((dt) => {
      if (phase !== 1) return;
      if (H.held()) { open = Math.min(1, open + dt * 0.45); if (!creaked) { creaked = true; api.sfx && api.sfx.play('creak'); } }
      else creaked = false;
      dL.setAttribute('width', 80 * (1 - open * 0.85)); dR.setAttribute('x', 180 + 80 * open * 0.85); dR.setAttribute('width', 80 * (1 - open * 0.85));
      if (W && Math.abs(open - sentOpen) >= 0.1) { sentOpen = open; W.sanct('setDoors', open); }
      // (the wicket route: the world's walk-in opens the gate when it arrives inside; the player opens it, so hold it where he left it)
      if (wicket && W) { const st = W.sanctState(); if (st && typeof st.doors === 'number' && Math.abs(st.doors - sentOpen) > 0.02) W.sanct('setDoors', sentOpen); }
      if (open >= 1) {
        phase = 2; gateBtn.remove(); api.hint('"מיריחו היו שומעין קול שער הגדול שנפתח". השוחט שמע — ועכשיו: מזבח הזהב.', 'ok');
        if (W) W.sanct('setDoors', 1);
        if (T3 && wicket) { T3.clear(true); api.after(500, altar); }   // already inside
        else if (T3) { T3.clear(true); api.after(300, async () => { await api.walk(W.sanctWait('enter', ['heichal', { ms: api.ctx.fast || api.repeat ? 1200 : 3500 }], 9000), 'נכנסים להיכל…'); altar(); }); }
        else api.after(900, altar);
      }
    });
    api.hint(api.ctx.segment === 'shachar' ? 'בשער הגדול שני דלתות כבדות.' : 'קידשת ידיים ורגליים מן הכיור — רק כך נכנסים להיכל (כלים א, ט).');
    const T3 = api.three;
    if (T3 && wicket) {
      // "נכנס לו בפשפש שבצפון ... ונכנס להיכל" (Tamid 3:7): wait for the way in (capped), then face the gate from inside
      api.hint('נכנסים בפשפש שבצפון, ומן התא להיכל — ופותחים את השער הגדול מבפנים.');
      (async () => {
        // the way in ends with a cut into the Heichal, before the shut gate (state.room 'heichal'); only then face the gate
        // (a focus from outside would walk in through the gate itself)
        const walkIn = api.ctx.wicketIn || W.sanctWait('enter', ['heichal', { via: 'wicket' }], 11000);
        let arrived = false;
        walkIn.then(() => { arrived = true; });
        const t0 = performance.now();
        api.hint('בפשפש שבצפון, ומן התא להיכל…');
        while (phase === 1 && !arrived && performance.now() - t0 < 12000) { const st = W.sanctState(); if (st && st.room === 'heichal') break; await api.wait(100 / api.T); }
        if (phase !== 1) return;
        T3.focus('heichal-gate', 900);
        T3.targets([{ key: 'gate', at: A('gate-in', [HEICHAL_DOOR.x0 - 0.4, HEICHAL_DOOR.y0 + 3, 0]), label: 'החזק — פתח מבפנים', onHold: (d) => H.set(d) }]);
        api.hint('אתה בהיכל, מול השער הסגור. החזק כדי לפתוח אותו מבפנים.');
      })();
    } else if (T3) {
      T3.targets([{ key: 'gate', at: A('gate', [HEICHAL_DOOR.x1 - 1, (HEICHAL_DOOR.y0 + HEICHAL_DOOR.y1) / 2, 0]), label: 'החזק — פתח', onHold: (d) => H.set(d) }]);
      api.hint('החזק על השער הגדול כדי לפתוח אותו.');
    }

    // phase 2: the golden altar
    let handfuls = 0, swept = false, sweepBtn = null, ash = [];
    function altar() {
      g1.remove();
      W && W.sanct('focus', 'gold-altar', 1200); W && W.kohen('player').carry('teni');
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-hall' }, g);
      svgEl('rect', { x: 110, y: 90, width: 140, height: 110, rx: 6, class: 'av-gold' }, g);
      svgEl('text', { x: 180, y: 80, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = 'מזבח הזהב';
      for (let k = 0; k < 5; k++) {
        const a = svgEl('ellipse', { cx: 135 + k * 22, cy: 130 + (k % 2) * 16, rx: 12, ry: 8, class: 'av-ash', tabindex: 0 }, g);
        a.addEventListener('pointerdown', () => { if (a.classList.contains('taken')) return; a.classList.add('taken'); handfuls++; api.sfx && api.sfx.play('step'); if (handfuls === 5) { sweepBtn.disabled = false; api.hint('עכשיו "כבד את השאר לתוכו".'); } });
        ash.push(a);
      }
      svgEl('path', { d: 'M150 225 L210 225 L200 245 L160 245 Z', class: 'av-gold' }, g);
      svgEl('text', { x: 180, y: 218, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = 'הטני';
      sweepBtn = api.button('כבד את השאר', () => {
        if (handfuls < 5) { api.miss('קודם חופן — "והיה חופן ונותן לתוכו", ובאחרונה כבד את השאר.'); return; }
        if (swept) return;
        swept = true; sweepBtn.remove(); W && W.sanct('setGoldAltar', { coals: 0, smoke: 0 });
        api.sfx && api.sfx.play('chime', { n: 3 });
        api.after(500, () => { g.remove(); menorah(); });
      });
      api.hint('חפון את האפר אל הטני — חופן אחר חופן.');
      if (T3) {
        T3.focus('gold-altar', 1000);
        const top = A('gold-altar-top', [GOLD_ALTAR.x, GOLD_ALTAR.y + GOLD_ALTAR.h + 0.05, GOLD_ALTAR.z]), D = 0.34;
        const at = [[0, 0], [-D, -D], [D, -D], [-D, D], [D, D]];
        T3.targets(ash.map((a, k) => ({ key: `ash-${k}`, at: [top[0] + at[k][0], top[1] + 0.05, top[2] + at[k][1]], small: true, onTap: () => { a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); T3.done(`ash-${k}`, true); } })));
      }
    }

    // phase 3: the menorah
    const lampsState = [0, 0, 0, 0, 0, 1, 1];          // west → east; the two eastern burn
    let onStone = false, cleaned = 0, kuzSet = false, lampEls = [], stoneEl = null, step2 = null;
    function menorah() {
      phase = 3;
      W && W.sanct('focus', 'menorah', 1200); W && W.kohen('player').carry('kuz');
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-hall' }, g);
      svgEl('text', { x: 16, y: 20, class: 'av-lab light' }, g).textContent = '→ מערב';
      svgEl('text', { x: 344, y: 20, class: 'av-lab light', 'text-anchor': 'end' }, g).textContent = 'מזרח ←';
      // the menorah: seven arms in a row, west (left) to east (right) — an illustration
      svgEl('rect', { x: 176, y: 110, width: 8, height: 90, class: 'av-gold' }, g);
      svgEl('path', { d: 'M150 212 L210 212 L196 196 L164 196 Z', class: 'av-gold' }, g);
      for (let k = 0; k < 3; k++) { const r = 30 + k * 28; svgEl('path', { d: `M${180 - r} 70 Q${180 - r} ${110 + r * 0.4} 180 ${110 + r * 0.4} Q${180 + r} ${110 + r * 0.4} ${180 + r} 70`, class: 'av-arm' }, g); }
      for (let i = 0; i < 7; i++) {
        const x = 96 + i * 28;
        const L = svgEl('g', { class: 'av-lamp' + (lampsState[i] ? ' lit' : ''), tabindex: 0 }, g);
        svgEl('ellipse', { cx: x, cy: 66, rx: 9, ry: 5, class: 'av-gold' }, L);
        svgEl('path', { d: `M${x} 60 q-5 -9 0 -18 q5 9 0 18`, class: 'av-flame small' }, L);
        svgEl('rect', { x: x - 13, y: 38, width: 26, height: 40, class: 'av-hit' }, L);
        L.addEventListener('pointerdown', () => lamp(i, L));
        lampEls.push(L);
      }
      // the stone with three steps (south of the menorah, in front of it)
      stoneEl = svgEl('g', { class: 'av-stone3', tabindex: 0 }, g);
      for (let s = 0; s < 3; s++) svgEl('rect', { x: 250 + s * 18, y: 226 - (s + 1) * 12, width: 18, height: (s + 1) * 12, class: 'av-stone' }, stoneEl);
      svgEl('text', { x: 277, y: 244, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = 'אבן — שלוש מעלות';
      step2 = svgEl('rect', { x: 268, y: 202, width: 18, height: 24, class: 'av-hit' }, stoneEl);
      stoneEl.addEventListener('pointerdown', (e) => { const s2 = e.target === step2; if (s2 && cleaned >= 5 && !kuzSet) svgEl('rect', { x: 271, y: 196, width: 12, height: 8, rx: 2, class: 'av-gold' }, g); stoneTap(s2); });
      api.hint('הנרות גבוהים — עלה קודם על האבן שלפני המנורה.');
      if (T3) {
        T3.focus('menorah', 1000);
        const L = spreadLamps(W.lampsWestToEast());
        const stoneAt = A('menorah-stone', [MENORAH_STONE.x, 22.4, MENORAH_STONE.z]);
        T3.targets([
          { key: 'stone', at: stoneAt, label: 'האבן', onTap: () => stoneTap(false) },
          ...L.map((p, i) => ({ key: `lamp-${i}`, at: p, small: true, onTap: () => { lamp(i, lampEls[i]); if (lampsState[i] === 2) T3.done(`lamp-${i}`); } })),
        ]);
      }
    }
    function stoneTap(isStep2) {
      if (!onStone) { onStone = true; stoneEl.classList.add('on'); api.sfx && api.sfx.play('step'); api.hint('עמדת על האבן. הטב את חמשת הנרות הכבויים — השאר את שני המזרחיים דולקים.'); if (api.three) api.three.done('stone', true); return; }
      if (cleaned >= 5 && !kuzSet) {
        if (!isStep2) { api.miss('את הכוז מניח על המעלה השנייה.'); return; }
        kuzSet = true;
        W && W.sanct('setLamps', lampsState.map((v) => (v === 2 ? 0.6 : v)));
        W && W.kohen('player').carry(null);
        api.sparkle(78, 80, 10);
        api.done({ text: 'חמשת הנרות הוטבו, ושני המזרחיים דולקים במקומם. הכוז על המעלה השנייה — ויצאת.', linger: 1100 });
      }
    }
    function lamp(i, L) {
      if (!onStone) { api.miss('עלה קודם על האבן — "שעליה הכהן עומד ומטיב את הנרות".'); return; }
      if (lampsState[i] === 1) { api.miss('את שני הנרות המזרחיים הדולקים — הוא מניח דולקים במקומם.'); return; }
      if (lampsState[i] === 2) return;
      lampsState[i] = 2; cleaned++;
      L.classList.add('fresh');
      api.sfx && api.sfx.play('chime', { n: cleaned });
      if (cleaned === 5) {
        api.hint('עכשיו הנח את הכוז על המעלה השנייה של האבן.', 'ok');
        if (api.three) api.three.targets([{ key: 'step2', at: A('menorah-stone-2', [MENORAH_STONE.x, 22.35, MENORAH_STONE.z]), label: 'המעלה השנייה', onTap: () => stoneTap(true) }]);
      }
    }
    api.solver(async () => {
      if (wicket) { const t0 = performance.now(); while (!(api.three && api.three.has('gate')) && performance.now() - t0 < 12000) await api.wait(40); }
      api.hit('gate', gateBtn, 'down');
      while (phase === 1) await api.wait(40);
      api.hit('gate', gateBtn, 'up');
      while (!ash.length || !sweepBtn) await api.wait(40);
      for (let k = 0; k < ash.length; k++) { api.hit(`ash-${k}`, ash[k], 'down'); await api.wait(40); }
      press(sweepBtn);
      while (!stoneEl) await api.wait(40);
      await api.wait(60);
      api.hit('stone', stoneEl.querySelector('rect'), 'down');
      for (let i = 0; i < 5; i++) { api.hit(`lamp-${i}`, lampEls[i].querySelector('.av-hit'), 'down'); await api.wait(40); }
      await api.wait(60);
      api.hit('step2', step2, 'down');
    });
  },
};
