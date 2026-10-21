/* ─────────────────────────────────────────────────────────────────────────────
 * payis.js: הפייס — the lotteries in the Chamber of Hewn Stone (Tamid 1:2, 3:1, 5:2; Yoma 2:1–4).
 * The kohanim stand in a circle ("מוקפין ועומדין", Yoma 25a); each raises one or two fingers — never the thumb
 * (Yoma 2:1); the memuneh counts FINGERS, never people (Yoma 22b). The outcome is the day's seeded lot
 * (state.lotsFor): fair by design; the count is its animation, done as the sources describe it (avodah_gaps.json
 * payis_method): the memuneh takes the mitznefet off one kohen's head — the count starts from him (Yoma 25a) — names a
 * number far larger than the kohanim ("מאה, או ששים", Bartenura on Yoma 2:1; "שמונים מאה או אלף", Rambam Temidin
 * uMusafin 4:3) and counts the fingers round the circle, again and again, until the number ends: at whose finger it ends,
 * he wins. (The game picks the kohen with the mitznefet so that the number ends at the lot's winner.)
 * On a repeat the counts run faster (docs/HOOKS.md §13: the second payis was 13 s of one decision); from the tier "בקי"
 * (gctx.tier ≥ 3) faster still.
 * kinds: 'payis1' (terumat hadeshen) · 'payis2' (the 13 roles) · 'payis3' (new ones to the ketoret, then new and
 * old to the limbs).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, kohenFig, press, clamp } from './common.js';
import { hall, raisedHand } from './art.js';
import { ROLES, gapLine } from '../data.js';
import { GAZIT } from '../../places.js';

/** a hand with n raised fingers (0 = the thumb), inline SVG (no emoji fonts) */
const hand = (n) => `<svg class="av-i" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="11" width="10" height="10" rx="3" fill="currentColor" opacity=".85"/>${n === 0 ? '<rect x="3" y="9" width="4" height="8" rx="2" fill="currentColor" transform="rotate(-25 5 13)"/>' : ''}${n >= 1 ? '<rect x="8" y="3" width="3" height="10" rx="1.5" fill="currentColor"/>' : ''}${n >= 2 ? '<rect x="12" y="2.5" width="3" height="10.5" rx="1.5" fill="currentColor"/>' : ''}</svg>`;
const N = 14;                      // kohanim in the circle (the player is index 0, at the bottom)
const NAMES = ['שמעון', 'אלעזר', 'יהודה', 'חנניה', 'יוסף', 'עזריה', 'מתתיה', 'יונתן', 'אליקים', 'זכריה', 'נתנאל', 'שמריה', 'עמרם'];

// from high over Nikanor, south-west across the azara (clear of the Ulam's wing and the altar) to the chamber, whole
const GAZIT_SHOT = { p: [0, 75, -12], t: [(GAZIT.x0 + GAZIT.x1) / 2, 22, GAZIT.z0 + 6] };

export function makePayis(kind) {
  const TITLES = { payis1: 'הפיס הראשון — מי תורם את המזבח?', payis2: 'הפיס השני — שלושה עשר תפקידים', payis3: 'הפיס השלישי והרביעי' };
  const INTRO = {
    payis1: 'הממונה דופק בדלת: "מי שטבל יבא ויפיס". עמוד במעגל והצבע — הממונה סופר אצבעות, לא אנשים.',
    payis2: 'בלשכת הגזית: "באו והפיסו — מי שוחט, מי זורק…". שלושה עשר כהנים יזכו.',
    payis3: '"חדשים לקטרת באו והפיסו!" ואחר כך "חדשים עם ישנים": מי מעלה אברים מן הכבש למזבח.',
  };
  const AGAIN = {
    payis1: 'עמוד במעגל והוצא אצבע אחת או שתיים — לא אגודל.',
    payis2: 'שלושה עשר פייסות — מי שוחט, מי זורק…',
    payis3: 'חדשים לקטורת, ואחר כך חדשים עם ישנים לאברים.',
  };
  return {
    id: kind, title: TITLES[kind], kicker: 'לשכת הגזית', intro: INTRO[kind], introAgain: AGAIN[kind],
    // (QA P2-6: the old shot faced the Gazit's outer wall and its dark window slits) — the Chamber of Hewn Stone seen whole
    // from the azara's east end (Middot 5:4: half of it stood in the holy), its roof and face over the court
    stage(W) { W.look(GAZIT_SHOT, 1600); },
    play(api) {
      const { ctx } = api, lots = ctx.lots || {};
      const svg = api.svg('0 0 360 300', 'מעגל הכהנים בלשכת הגזית');
      hall(svg, 360, 300, { wall: 44 });   // the Chamber of Hewn Stone
      svgEl('ellipse', { cx: 180, cy: 150, rx: 150, ry: 118, class: 'av-floor', style: 'opacity:.45' }, svg);
      // "פייס במזרחה, וזקן יושב במערבה" (Yoma 25a): the elder at the west (left), the lottery in the east
      const elder = svgEl('g', { transform: 'translate(34 40)' }, svg);
      svgEl('rect', { x: -12, y: 14, width: 24, height: 10, rx: 3, class: 'av-stone' }, elder);
      kohenFig(elder, { x: 0, y: 0, s: 0.75 });
      const pos = [];
      for (let i = 0; i < N; i++) { const a = Math.PI / 2 + (i / N) * Math.PI * 2; pos.push([180 + Math.cos(a) * 128, 142 + Math.sin(a) * 98]); }
      const figs = pos.map(([x, y], i) => kohenFig(svg, { x, y: y - 14, s: 0.9, hl: i === 0, label: i === 0 ? (ctx.name || 'אתה') : '' }));
      // each kohen holds up his hand: one finger or two (drawn, not written)
      const hands = pos.map(([x, y]) => raisedHand(svg, x + 9, y - 29, 1.15));
      kohenFig(svg, { x: 180, y: 128, s: 1.15 });   // the memuneh, in the middle: he counts fingers
      const bubble = svgEl('text', { x: 180, y: 100, class: 'av-count', 'text-anchor': 'middle' }, svg);
      const roleTag = svgEl('text', { x: 180, y: 290, class: 'av-roletag', 'text-anchor': 'middle' }, svg);
      const ring = svgEl('circle', { r: 17, class: 'av-pick', cx: -99, cy: -99 }, svg);
      const npcF = () => 1 + Math.floor(Math.random() * 2);
      let fingers = [0, ...Array.from({ length: N - 1 }, npcF)];
      let chosen = 0, fast = 1;
      api.play.addEventListener('pointerdown', () => { fast = 3; });
      // the pace: a repeat counts faster (the hooks' request), a master (tier ≥ 3) faster still
      const pace = api.tier >= 3 ? 0.45 : api.repeat ? 0.6 : 1;
      // the mitznefet the memuneh took off a kohen's head: the count starts from him (Yoma 25a)
      const mitz = svgEl('g', { opacity: 0 }, svg);
      svgEl('path', { d: 'M-7 2 Q0 -9 7 2 Z', fill: '#F6F0DE', stroke: '#9C7A36', 'stroke-width': 1.4 }, mitz);
      svgEl('rect', { x: -7.5, y: 1, width: 15, height: 2.6, rx: 1, fill: '#E4D6B0', stroke: '#9C7A36', 'stroke-width': 0.8 }, mitz);
      const said = svgEl('text', { x: 180, y: 84, class: 'av-lab', 'text-anchor': 'middle' }, svg);

      /** the count, as the sources tell it: from the kohen whose mitznefet was taken, a large number of fingers round the
       *  circle; it lands on `target` (his finger ends the number). Resolves after the landing. */
      async function count(target, slow) {
        fingers = fingers.map((f, i) => (i === 0 ? chosen : npcF()));
        // the number: "הרבה יותר ממה שיש שם כהנים" — 60 for his own lots (Bartenura's "או ששים"), a smaller one for the others'
        const want = slow ? 60 : [24, 30, 36][Math.floor(Math.random() * 3)];
        // back from the winner round the circle until the number is reached: there stands the kohen with the mitznefet. (The
        // others' fingers are theirs to choose: when the number would end on a first finger of two, they choose again, so the
        // memuneh's round number ends exactly at the winner's finger; after ten tries the number said is the count itself.)
        let start = target, sum = 0;
        for (let tries = 0; tries < 10; tries++) {
          if (tries) fingers = fingers.map((f, i) => (i === 0 ? chosen : npcF()));
          start = target; sum = fingers[target];
          while (sum < want) { start = (start - 1 + N) % N; sum += fingers[start]; }
          if (sum === want) break;
        }
        hands.forEach((h, i) => h.set(fingers[i]));
        const seq = [];
        for (let i = start; ; i = (i + 1) % N) { for (let f = 0; f < fingers[i]; f++) seq.push(i); if (i === target && seq.length >= sum) break; }
        const [mx, my] = pos[start];
        mitz.setAttribute('transform', `translate(${mx + 12} ${my - 40}) scale(1.25)`); mitz.setAttribute('opacity', 1);
        said.textContent = `"${seq.length}"`;
        if (slow) api.hint(start === 0 ? `הממונה נטל את המצנפת מראשך — ממך מתחילים — ואמר: ${seq.length}.` : `הממונה נטל את המצנפת מראשו של ${NAMES[(start - 1) % NAMES.length]} — ממנו מתחילים — ואמר: ${seq.length}.`);
        await api.wait((slow ? 700 : 90) * pace / fast);
        for (let s = 0; s < seq.length; s++) {
          const [x, y] = pos[seq[s]];
          ring.setAttribute('cx', x); ring.setAttribute('cy', y - 12);
          bubble.textContent = String(s + 1);
          if (slow || s % 3 === 0) api.sfx && api.sfx.play('ui');
          const left = seq.length - s;
          await api.wait(((slow ? (left < 6 ? 230 : 32) : 9) * pace) / fast);
        }
        figs.forEach((f, j) => f.classList.toggle('won', j === target));
        ring.classList.add('landed');
        await api.wait((slow ? 500 : 110) * pace);
        ring.classList.remove('landed');
        mitz.setAttribute('opacity', 0); said.textContent = '';
      }
      const other = (except) => { let t; do { t = 1 + Math.floor(Math.random() * (N - 1)); } while (except.includes(t)); return t; };

      async function run() {
        if (kind === 'payis1') {
          await count(lots.deshen ? 0 : other([]), true);
          if (lots.deshen) { api.sparkle(50, 86, 12); api.sfx && api.sfx.play('chime', { n: 5 }); api.done({ text: 'זכית! היום אתה תורם את המזבח — תרומת הדשן בידיך.', won: true }); }
          else api.done({ text: `זכה ${NAMES[Math.floor(Math.random() * NAMES.length)]}. אתה תלמד ותעזור — וגם לך יש פיס בלשכת הגזית.`, won: false });
          return;
        }
        if (kind === 'payis2') {
          const mine = ROLES.findIndex((r) => r.id === lots.role);
          const used = [];
          for (let r = 0; r < ROLES.length; r++) {
            roleTag.textContent = ROLES[r].he;
            const me = r === mine;
            const t = me ? 0 : other(used);
            used.push(t);
            await count(t, me);
            if (me) { api.sparkle(50, 86, 14); api.sfx && api.sfx.play('fanfare'); roleTag.textContent = `זכית: ${ROLES[r].win}!`; await api.wait(900); }
          }
          const R = ROLES[mine] || ROLES[0];
          // ── water ── (WATER, wave 6) the winners go to their work: twelve of them sanctify hands and feet at once at Ben Katin's
          // twelve spigots (Yoma 37a), in view while the card is read. Guarded: nothing without world.water (the harness)
          const W = api.world;
          if (W && typeof W.has === 'function' && W.has('water') && typeof W.water === 'function') { W.water('washTogether', { n: 12 }); W.look('kiyor', 1400); }
          // ── end water ──
          api.done({ text: `התפקיד שלך היום: ${R.win}. את שאר העבודות תראה ותלמד.`, role: R.id, linger: 900 });
          return;
        }
        // payis3: new ones to the ketoret, then new and old to the limbs
        roleTag.textContent = 'חדשים לקטורת';
        if (lots.ketoret === null || lots.ketoret === undefined) {
          figs[0].classList.add('aside');
          api.hint('כבר הקטרת קטורת — "מעולם לא שנה אדם בה". הפעם אתה צופה.');
          await count(other([]), false);
        } else {
          await count(lots.ketoret ? 0 : other([]), true);
          if (lots.ketoret) { api.sparkle(50, 86, 18); api.sfx && api.sfx.play('solemn'); roleTag.textContent = 'זכית בקטורת!'; await api.wait(1200); }
        }
        figs[0].classList.remove('aside');
        roleTag.textContent = 'מי מעלה אברים מן הכבש למזבח';
        await count(lots.evarim ? 0 : other([]), false);
        api.done({ text: lots.ketoret ? 'זכית בקטורת — רגע שכהן זוכה בו פעם אחת בחייו.' : lots.evarim ? 'זכית להעלות את האברים למזבח.' : 'הפיסות נגמרו. לך לעזור ולראות.', won: !!lots.ketoret, linger: 900 });
      }

      const pick = (n) => {
        if (chosen) return;
        if (n === 'thumb') { api.miss('אין מוציאין אגודל במקדש — אצבע אחת או שתיים (יומא ב, א).'); return; }
        chosen = n;
        hands[0].set(n);
        // the method, verified (avodah_gaps.json payis_method): the Rambam's count
        if (kind !== 'payis3') api.cite(gapLine('payis_method', 'הרמב״ם — איך סופרים'));
        bOne.disabled = bTwo.disabled = bThumb.disabled = true;
        api.hint('הממונה סופר את האצבעות…');
        run();
      };
      const bOne = api.button(`${hand(1)} אצבע אחת`, () => pick(1));
      const bTwo = api.button(`${hand(2)} שתי אצבעות`, () => pick(2), 'gold');
      const bThumb = api.button(`${hand(0)} אגודל`, () => pick('thumb'), 'ghost');
      api.hint('בחר כמה אצבעות להוציא.');
      api.solver(() => press(bTwo));
      return () => {};
    },
  };
}
export const clampN = clamp;
