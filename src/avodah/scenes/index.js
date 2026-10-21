/* ─────────────────────────────────────────────────────────────────────────────
 * scenes/index.js — "סיור בבית המקדש": the Temple tour, the Ark mystery ("איפה הארון?") and the watch-only
 * Yom Kippur service ("סדר העבודה"). Reachable from the Phase B home and the Phase A menu (main.js: window.__openScenes).
 * Cards come from content/*.json and info.js; every text is a DRAFT ("טיוטה") with its source (PROJECT.md §2).
 * The camera moves with world.look / world.sanctuary (all calls guarded: a missing layer only skips its motion).
 * The player never walks into the Kodesh HaKodashim: it is a watch-only view reached with a fade (sanctuary.js).
 * ──────────────────────────────────────────────────────────────────────────── */
import { INFO } from '../../info.js';
import * as PL from '../../places.js';
import { dayInfo } from '../../calendar.js';
import HEICHAL from '../../../content/heichal.json';
import KIYOR from '../../../content/kiyor.json' with { type: 'json' };   // ── service13 ── (one module with game/content.js's)
import MYST from '../../../content/mysteries.json' with { type: 'json' };   // ── service13 ── (one module with game/hooks's)
import YK from '../../../content/yom_kippur.json';
import ANIMALS from '../../../content/animals.json';
import KETORET from '../../../content/ketoret.json' with { type: 'json' };   // ── service13 ── (the same module as data.js's: bundled once)
import SCENES from '../../../content/scenes.json';

// never a Divine Name in rendered text (defensive: the sources are already written with ה׳)
const NAME = /י[֑-ׇ]*ה[֑-ׇ]*ו[֑-ׇ]*ה/g;
const clean = (t) => String(t == null ? '' : t).replace(NAME, 'ה׳');
const esc = (t) => clean(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byId = (list, id) => (Array.isArray(list) ? list.find((x) => x && x.id === id) : null);
// a card from content json, from info.js, or a short draft of ours (marked "טיוטה")
const C = (list, id) => { const x = byId(list, id); return x ? { t: x.name_he, d: x.summary_he, q: x.quote, s: x.source } : null; };
const I = (id) => { const x = INFO[id]; return x ? { t: x.t, d: x.d, s: String(x.s || '').replace(/\s*·\s*טיוטה$/, '') } : null; };
const DR = (t, d, s) => ({ t, d, s, ours: true });
// content/scenes.json (CONTENT agent, built only from verified quotes): the tour's stop cards and the Yom Kippur script.
// Where it has the item, its card replaces the older one; where it has none, the older card (or our draft) stays.
const SC = (id) => { const x = byId(SCENES && SCENES.tour, id); return x ? { t: x.name_he, d: x.summary_he, q: x.quote, s: x.source, check: !!x.needs_check } : null; };
// a Yom Kippur chapter card: what the player sees (sees_he) and the verbatim line, titled from yom_kippur.json; the
// script's do_not_show_he rules are kept by the choreography (the camera stays outside the linen sheet, no blood, no Name)
const YKS_SCRIPT = (SCENES && SCENES.yom_kippur_script) || [];
const YC = (id) => {
  const x = YKS_SCRIPT.find((s) => s && s.from === 'yom_kippur.json:' + id), y = byId(YK, id);
  if (!x) return C(YK, id);
  return { t: (y && y.name_he) || id, d: x.sees_he, q: x.line, s: x.source, check: !!x.needs_check };
};

/* ───────── camera helpers (guarded) ───────── */
const S = (w) => (w && w.sanctuary) || null;
async function safe(fn) { try { return await fn(); } catch (e) { console.warn('[scenes]', e && e.message); return false; } }
const look = (w, p, t, ms) => safe(() => (w.look ? w.look(p, t, ms) : false));
const focus = (w, id, ms) => safe(() => (S(w) && S(w).focus ? S(w).focus(id, ms) : false));
const enter = (w, room, ms) => safe(() => (S(w) && S(w).enter ? S(w).enter(room, ms === 0 ? { ms: 0 } : { ms: 6000 }) : false));
const out = (w, ms) => safe(() => (S(w) && S(w).state && S(w).state.room !== 'out' && S(w).exit ? S(w).exit(ms === 0 ? { ms: 0 } : {}) : true));
const hi = (w, id) => { try { if (S(w) && S(w).highlight) S(w).highlight(id); } catch (e) { /* optional */ } };
// the folds and the market full for the pens stop (the service's world keeps 48 animals there; guarded)
const fillPens = (w, n) => { try { const P = w && w.avodah && w.avodah.pens; if (P && typeof P.fill === 'function' && (P.count || 0) < n) P.fill(n); } catch (e) { /* optional */ } };

/* ───────── the tour: stops with cards ───────── */
// portrait phones: the panel covers the lower part of a narrow screen, so the world's long lens sees ~15° × 17° above it;
// these poses were measured so each stop's subject sits between the top of the screen and the panel (390×844)
const TALL = () => typeof innerHeight !== 'undefined' && innerHeight > innerWidth;
// wide screens dock the panel at the right (CSS below): the world keeps the part left of it, nearly square, so the portrait
// poses fit it (measured by projection with main.js's side offset); world.look pulls them back only on a portrait screen
const SIDE = () => { try { return typeof matchMedia === 'function' && matchMedia('(min-width:980px) and (min-aspect-ratio:4/3)').matches; } catch (e) { return false; } };
const POSE = (wide, tall) => (TALL() || SIDE() ? tall : wide);
const TOUR = [
  { id: 'courts', title: 'העזרות והשערים', go: (w, ms) => out(w, ms).then(() => look(w, ...POSE([[70, 80, 130], [-50, 16, 0]], [[450, 380, 60], [-40, 10, 0]]), ms)), cards: [SC('tour_courts'), I('azara'), I('ezrat-nashim'), I('nikanor')] },
  { id: 'kiyor', title: 'הכיור והמוכני', go: (w, ms) => focus(w, 'kiyor', ms), hi: 'mechanism', cards: [SC('tour_kiyor'), C(KIYOR, 'kiyor_place'), C(KIYOR, 'ben_katin_spigots')] },
  { id: 'altar', title: 'המזבח, הכבש ובית המטבחיים', go: (w, ms) => look(w, ...POSE([PL.SHOTS.altarTop.p, PL.SHOTS.altarTop.t], [[-24, 104, 146], [-38, 18, 9]]), ms), cards: [I('altar'), SC('tour_red_line'), I('kevesh'), SC('tour_altar_rings'), I('maaracha'), I('shitin')] },
  { id: 'lambs', title: 'לשכת הטלאים', go: (w, ms) => focus(w, 'lambs', ms), hi: 'lambs', cards: [SC('tour_lambs'), C(ANIMALS.tamid_lambs, 'six_checked_lambs'), I('beit-hamoked')] },
  // (wave 4, QA P2-13: from the east, over the pens' east wall and down into the market yard — the dealers' stalls, their roped
  // pens, the dove sellers — with the folds and their flocks behind; the old frame showed the north portico's roof)
  { id: 'pens', title: 'הדיר ושוק הבהמות (המחשה)', go: (w, ms) => { fillPens(w, 72); return look(w, [220, 66, -545], [115, -31, -533], ms); }, cards: [SC('tour_pens'), C(ANIMALS.markets, 'animal_dealers'), C(ANIMALS.blemishes, 'torah_blemishes')] },
  { id: 'chambers', title: 'בית אבטינס והלשכות', go: (w, ms) => focus(w, 'avtinas', ms), cards: [SC('tour_avtinas'), C(KETORET, 'beit_avtinas'), C(KETORET, 'grinding_chant'), SC('tour_north_chambers'), I('salt'), I('parva'), I('rinse')] },
  // the golden vine over the Heichal's doorway (Middot 3:8), seen through the Ulam's 20 × 40 opening from the south-east, above
  // the altar's column of smoke (measured by projection on a phone and a desktop: the whole vine but its southern pole, which
  // the opening's edge hides from any angle clear of the smoke; stages.js hangs it grown in the finished Temple — QA P1-3)
  { id: 'ulam', title: 'האולם וגפן הזהב', go: (w, ms) => look(w, ...POSE([[-27.4, 67.7, 19.6], [-90.8, 50, -2]], [[-38, 60, 16], [-90.8, 50, -2]]), ms), cards: [SC('tour_ulam'), C(HEICHAL, 'ulam_beams_chains'), C(HEICHAL, 'ulam_tables'), C(HEICHAL, 'heichal_doors'), C(HEICHAL, 'heichal_wickets')] },
  { id: 'wash', title: 'קידוש ידיים ורגליים', gate: true, go: (w, ms) => focus(w, 'kiyor', ms), hi: 'kiyor', cards: [C(KIYOR, 'kiddush_how'), C(KIYOR, 'kiddush_when')] },
  { id: 'heichal', title: 'ההיכל', needs: 'wash', go: (w, ms) => enter(w, 'heichal', ms), cards: [SC('tour_heichal'), C(HEICHAL, 'heichal_dimensions'), C(HEICHAL, 'heichal_gold'), SC('tour_vessels')],
    subs: [['menorah', 'המנורה', [C(HEICHAL, 'menorah'), C(HEICHAL, 'menorah_branches'), C(HEICHAL, 'menorah_stone')]], ['shulchan', 'השולחן', [C(HEICHAL, 'shulchan'), C(HEICHAL, 'lechem_hapanim_layout')]], ['gold-altar', 'מזבח הזהב', [C(HEICHAL, 'gold_altar')]], ['parochet', 'הפרוכות', [SC('tour_parochot'), C(HEICHAL, 'parochet')]]] },
  // the player never enters the Kodesh HaKodashim (PROJECT.md §2.5, §11): the tour stops before the parochot; the room itself is
  // seen only in the watch-only Yom Kippur service (the "סדר העבודה" tab)
  { id: 'kodesh', title: 'קודש הקדשים — מאחורי הפרוכת', needs: 'wash', watch: true, go: (w, ms) => enter(w, 'heichal', ms).then(() => focus(w, 'parochet-front', ms)), cards: [SC('tour_kodesh'), DR('לפני הפרוכת', 'כאן עוצרים. לקודש הקדשים נכנס רק הכהן הגדול, ורק ביום הכיפורים. את מה שמאחורי הפרוכת רואים רק דרך עבודתו, בלשונית "סדר העבודה".', 'כלים א, ט'), I('upper-openings')] },
];

/* ───────── "איפה הארון?" — the tradition of the wood chamber (Shekalim 6:1–2; Yoma 52b–54a) ───────── */
const ARK = [
  { id: 'bows', title: 'שלוש עשרה השתחוויות', go: (w, ms) => focus(w, 'wood-chamber', ms), hi: 'wood-chamber', cards: [C(MYST, 'where_is_the_ark')] },
  { id: 'stone', title: 'האבן המשונה', go: (w, ms) => focus(w, 'odd-stone', ms), cards: [C(MYST, 'the_odd_stone')] },
  { id: 'views', title: 'מה קרה לארון?', cards: [C(MYST, 'ark_views')] },
  { id: 'find', title: 'ההשתחוויה הארבע עשרה', find: true, go: (w, ms) => focus(w, 'wood-chamber', ms), cards: [C(MYST, 'ark_find')] },
  { id: 'end', title: 'המסורת', go: (w, ms) => focus(w, 'odd-stone', ms), cards: [C(MYST, 'ark_end'), C(MYST, 'foundation_stone')] },
];

/* ───────── Yom Kippur, "סדר העבודה": watch-only chapters (content/yom_kippur.json + short drafts) ───────── */
// (the order is the Mishnah's: the confession over his bull (Yoma 3:8) comes before the lots (3:9–4:1))
const YKS = [
  { id: 'yk_immersions', title: 'חמש טבילות', go: (w, ms) => focus(w, 'parva', ms), yk: 'immersion', cards: [YC('yk_immersions')] },
  // (QA P2-17: the Kohen Gadol in white beside the linen sheet on the parva's roof, framed above the panel on a phone and a desktop)
  { id: 'yk_white_garments', title: 'בגדי לבן — מאחורי סדין', go: (w, ms) => look(w, ...POSE([[-56, 42, -32], [-68, 29.5, -59]], [[-48, 48, -38], [-68, 29.5, -59]]), ms), yk: 'white', cards: [YC('yk_white_garments'), YC('yk_garment_cost')] },
  { id: 'yk_confession', title: 'הווידוי — והעם משתחווה', go: (w, ms) => look(w, [-44, 28, -44], [-59, 16, -7], ms), yk: 'confession', bow: true, cards: [YC('yk_confession')] },
  { id: 'yk_lots', title: 'הגורלות על שני השעירים', go: (w, ms) => look(w, [-3, 30, -6], [-17, 12.5, -31], ms), yk: 'lots', cards: [YC('yk_lots')] },
  { id: 'yk_ketoret_entry', title: 'עם הקטורת, בין הפרוכות', go: (w, ms) => enter(w, 'heichal', ms).then(() => focus(w, 'parochot-south', ms)), yk: 'ketoret', cards: [YC('yk_machta'), YC('yk_ketoret_entry'), C(KETORET, 'yom_kippur_ketoret'), YC('yk_short_prayer')] },
  { id: 'yk_even_shtiya', title: 'אבן השתייה', go: (w, ms) => enter(w, 'kodesh-view', ms), yk: 'even-shtiya', kodeshSmoke: 1, cards: [YC('yk_even_shtiya')] },
  { id: 'yk_sprinkling', title: '"אחת, אחת ואחת..."', go: (w, ms) => enter(w, 'kodesh-view', ms), yk: 'sprinkle', count: true, cards: [YC('yk_sprinkling')] },
  { id: 'yk_goat_and_parochet', title: 'מול הפרוכת', go: (w, ms) => enter(w, 'heichal', ms).then(() => focus(w, 'parochet-front', ms)), yk: 'parochet', kodeshSmoke: 0.6, cards: [YC('yk_goat_and_parochet')] },
  { id: 'yk_take_out_machta', title: 'להוציא את הכף ואת המחתה', go: (w, ms) => enter(w, 'kodesh-view', ms), yk: 'machta-out', kodeshSmoke: 0.4, cards: [YC('yk_take_out_machta')] },
  { id: 'yk_feast', title: 'יצא בשלום', go: (w, ms) => out(w, ms).then(() => look(w, [70, 45, 75], [8, 10, 0], ms)), yk: 'exit', dusk: true, kodeshSmoke: 0, cards: [YC('yk_own_clothes'), YC('yk_feast')] },
];
// the count of the sprinklings (Yoma 5:3), as content/yom_kippur.json spells it
const COUNT = ((byId(YK, 'yk_sprinkling') || {}).count_he || ['אחת', 'אחת ואחת', 'אחת ושתים', 'אחת ושלש', 'אחת וארבע', 'אחת וחמש', 'אחת ושש', 'אחת ושבע']).map(String);

/* ───────── the panel's look (wave 4: QA P1-5, P2-2, P2-16) ─────────
 * Colours are tokens (--sc-*) with a dark set that follows prefers-color-scheme and the Phase B theme switch
 * (:root[data-theme]), in the Phase B palette (src/avodah/ui.css.js --av-*). Every text/background pair is ≥ 4.5:1
 * (the gold buttons: white on #7E5210 5.9:1 in light, #1D1406 on #E4B656 9.6:1 in dark). Every control is ≥ 44 px
 * high: the tabs and the buttons themselves; the stop chips keep a 32-px pill inside a 44-px hit area. */
const CSS = `
.sc-root{--sc-ink:#2A2016;--sc-soft:#5E4C36;--sc-src:#6E5838;--sc-panel:rgba(251,246,236,.97);--sc-btn:#FFF9EC;--sc-btn-ink:#4A3413;--sc-line:#D9C49A;
  --sc-chip:#FFFFFF;--sc-chip-line:#E4D3AE;--sc-chip-ink:#5A4424;--sc-on:#F4E2B8;--sc-on-line:#B8862B;--sc-lock:#F1EADD;--sc-lock-ink:#6B5A45;
  --sc-gold:#7E5210;--sc-gold-ink:#FFFFFF;--sc-q:#F6EBD2;--sc-q-line:#C9A452;--sc-draft:#FFE7B8;--sc-draft-ink:#7A4B00;--sc-chk:#EDE3F7;--sc-chk-ink:#4E2F7A;
  --sc-live:#B3261E;--sc-live-ink:#FFFFFF;--sc-count:#7E5210;--sc-shadow:0 -6px 28px rgba(40,26,8,.28);--sc-focus:#1F4F7A}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]) .sc-root{--sc-ink:#F3E9D6;--sc-soft:#D2C3A8;--sc-src:#C2B195;--sc-panel:rgba(29,24,19,.97);--sc-btn:#2A231B;--sc-btn-ink:#F3E9D6;--sc-line:rgba(232,200,150,.28);
  --sc-chip:#262019;--sc-chip-line:rgba(232,200,150,.22);--sc-chip-ink:#E9DCC4;--sc-on:#453722;--sc-on-line:#E4B656;--sc-lock:#211B15;--sc-lock-ink:#B8A686;
  --sc-gold:#E4B656;--sc-gold-ink:#1D1406;--sc-q:rgba(232,185,74,.12);--sc-q-line:#E4B656;--sc-draft:rgba(232,185,74,.2);--sc-draft-ink:#F2CF77;--sc-chk:rgba(170,140,230,.22);--sc-chk-ink:#DCCBF7;
  --sc-live:#FF6B5B;--sc-live-ink:#1D1406;--sc-count:#F2CF77;--sc-shadow:0 -6px 28px rgba(0,0,0,.5);--sc-focus:#93BCEA} }
:root[data-theme="dark"] .sc-root{--sc-ink:#F3E9D6;--sc-soft:#D2C3A8;--sc-src:#C2B195;--sc-panel:rgba(29,24,19,.97);--sc-btn:#2A231B;--sc-btn-ink:#F3E9D6;--sc-line:rgba(232,200,150,.28);
  --sc-chip:#262019;--sc-chip-line:rgba(232,200,150,.22);--sc-chip-ink:#E9DCC4;--sc-on:#453722;--sc-on-line:#E4B656;--sc-lock:#211B15;--sc-lock-ink:#B8A686;
  --sc-gold:#E4B656;--sc-gold-ink:#1D1406;--sc-q:rgba(232,185,74,.12);--sc-q-line:#E4B656;--sc-draft:rgba(232,185,74,.2);--sc-draft-ink:#F2CF77;--sc-chk:rgba(170,140,230,.22);--sc-chk-ink:#DCCBF7;
  --sc-live:#FF6B5B;--sc-live-ink:#1D1406;--sc-count:#F2CF77;--sc-shadow:0 -6px 28px rgba(0,0,0,.5);--sc-focus:#93BCEA}
.sc-root{position:fixed;left:0;right:0;bottom:0;z-index:40;direction:rtl;font:15px/1.5 Heebo,Arial,sans-serif;color:var(--sc-ink);pointer-events:none}
.sc-panel{pointer-events:auto;margin:0 auto;max-width:640px;background:var(--sc-panel);border-radius:18px 18px 0 0;box-shadow:var(--sc-shadow);padding:6px 12px calc(8px + env(safe-area-inset-bottom,0px));max-height:52vh;display:flex;flex-direction:column}
.sc-root button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.sc-root button:focus-visible{outline:2px solid var(--sc-focus);outline-offset:2px}
.sc-tabs{display:flex;gap:6px;align-items:center}.sc-tabs button,.sc-btn{min-height:44px;font:600 13.5px/1.2 Heebo,Arial,sans-serif;border:1px solid var(--sc-line);background:var(--sc-btn);color:var(--sc-btn-ink);border-radius:999px;padding:0 14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.sc-tabs button[aria-pressed=true]{background:var(--sc-gold);color:var(--sc-gold-ink);border-color:var(--sc-gold)}
.sc-x{margin-inline-start:auto;min-width:44px;padding:0!important}.sc-i{width:18px;height:18px;flex:0 0 auto}.sc-i path,.sc-i rect{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.sc-stops{display:flex;gap:4px;overflow-x:auto;padding:0 0 2px;scrollbar-width:none;scroll-padding-inline:24px}.sc-stops::-webkit-scrollbar{display:none}
.sc-stops button{flex:0 0 auto;min-height:44px;position:relative;z-index:0;font:500 12.5px/1.2 Heebo,Arial,sans-serif;border:0;background:none;padding:0 10px;color:var(--sc-chip-ink);cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.sc-stops button::before{content:"";position:absolute;inset:6px 0;z-index:-1;border:1px solid var(--sc-chip-line);background:var(--sc-chip);border-radius:10px}
.sc-stops button.on{font-weight:700}.sc-stops button.on::before{background:var(--sc-on);border-color:var(--sc-on-line);border-width:1.5px}
.sc-stops button.lock{color:var(--sc-lock-ink)}.sc-stops button.lock::before{background:var(--sc-lock);border-style:dashed}.sc-stops .sc-i{width:14px;height:14px}
.sc-card{overflow-y:auto;flex:1;min-height:60px}.sc-card h3{margin:2px 0 4px;font:700 17px Heebo,Arial,sans-serif}.sc-card p{margin:4px 0}.sc-card h3 small{color:var(--sc-soft);font-weight:600}
.sc-q{background:var(--sc-q);border-inline-start:3px solid var(--sc-q-line);padding:6px 9px;border-radius:6px;font-style:normal}
.sc-src{color:var(--sc-src);font-size:12.5px}.sc-draft{display:inline-block;background:var(--sc-draft);color:var(--sc-draft-ink);border-radius:999px;padding:0 8px;font:600 11.5px Heebo,Arial,sans-serif;margin-inline-start:6px}
.sc-row{display:flex;gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap}.sc-row .sc-grow{flex:1}.sc-btn.gold{background:var(--sc-gold);color:var(--sc-gold-ink);border-color:var(--sc-gold)}
.sc-live{background:var(--sc-live);color:var(--sc-live-ink);border-radius:999px;padding:0 7px;font-size:11px;margin-inline-start:4px}
.sc-count{font:700 22px Heebo,Arial,sans-serif;text-align:center;color:var(--sc-count);margin:6px 0}.sc-chk{background:var(--sc-chk);color:var(--sc-chk-ink)}
@media (prefers-reduced-motion: reduce){.sc-root *{scroll-behavior:auto!important}}
/* wide screens (a laptop, a desktop, a tablet on its side): the panel docks at the right, full height under the top bar, so
   nothing it shows is ever under it; main.js moves the camera's principal point to the middle of the part left of it (P2-18) */
@media (min-width:980px) and (min-aspect-ratio:4/3){
  .sc-root{left:auto;right:16px;top:74px;bottom:16px;width:min(440px,36vw)}
  .sc-panel{height:100%;max-height:none;max-width:none;border-radius:18px;padding:10px 14px 12px;box-shadow:0 10px 34px rgba(20,12,4,.32)}
  .sc-stops{flex-wrap:wrap;overflow-x:visible;row-gap:0}
}`;
// the game's own line icons (src/game/ui.js ICON: 24 × 24, a 1.8 stroke in currentColor) — no emoji fonts
const ICO = {
  lock: '<svg class="sc-i" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>',
  x: '<svg class="sc-i" viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 6.5 11 11m0-11-11 11"/></svg>',
};

export function createScenes({ world, root = document.body, now = () => new Date(), onClose = null } = {}) {
  let el = null, mode = 'tour', stop = 0, card = 0, sub = null, washed = false, bowed = false, busy = false, countN = 0, countT = null, kg = null;
  const L = { tour: TOUR, ark: ARK, yk: YKS };
  const isYK = () => { try { const h = dayInfo(now()).holiday; return !!(h && h.id === 'yom-kippur'); } catch (e) { return false; } };
  function mount() {
    if (el) return;
    if (!document.getElementById('sc-css')) { const st = document.createElement('style'); st.id = 'sc-css'; st.textContent = CSS; document.head.appendChild(st); }
    el = document.createElement('div'); el.className = 'sc-root'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'סיור בבית המקדש');
    el.innerHTML = '<div class="sc-panel"></div>';
    el.addEventListener('click', onClick);
    root.appendChild(el);
  }
  const list = () => L[mode];
  const cur = () => list()[stop];
  const cards = () => { const s = cur(); const c = sub ? sub[2] : s.cards; return c.filter(Boolean); };
  const locked = (s) => s.needs === 'wash' && !washed;
  function render() {
    if (!el) return;
    const s = cur(), cs = cards(), c = cs[Math.min(card, cs.length - 1)] || DR(s.title, '', '');
    let h = `<div class="sc-tabs"><button data-m="tour" aria-pressed="${mode === 'tour'}">סיור</button><button data-m="ark" aria-pressed="${mode === 'ark'}">איפה הארון?</button><button data-m="yk" aria-pressed="${mode === 'yk'}">סדר העבודה${isYK() ? '<span class="sc-live">היום</span>' : ''}</button><button class="sc-btn sc-x" data-a="close" aria-label="סגור">${ICO.x}</button></div>`;
    h += '<div class="sc-stops">' + list().map((x, i) => `<button data-s="${i}" class="${i === stop ? 'on' : ''}${locked(x) ? ' lock' : ''}"${i === stop ? ' aria-current="step"' : ''}${locked(x) ? ' aria-label="' + esc(`${i + 1}. ${x.title} — נעול עד רחיצת ידיים ורגליים`) + '"' : ''}>${i + 1}. ${esc(x.title)}${locked(x) ? ICO.lock : ''}</button>`).join('') + '</div>';
    h += `<div class="sc-card"><h3>${esc(sub ? sub[1] : s.title)}${mode === 'yk' ? ' · <small>צפייה</small>' : ''}</h3>`;
    h += `<p><b>${esc(c.t)}</b><span class="sc-draft">טיוטה</span>${c.check ? '<span class="sc-draft sc-chk">בבדיקה</span>' : ''}</p><p>${esc(c.d)}</p>`;
    if (c.q) h += `<p class="sc-q">״${esc(c.q)}״</p>`;
    h += `<p class="sc-src">מקור: ${esc(c.s || '')}${c.ours ? ' · טקסט זמני של הסיור' : ''}</p>`;
    if (s.count) h += `<div class="sc-count" aria-live="polite">${esc(COUNT[countN] || '')}</div>`;
    if (s.subs && !sub) h += '<div class="sc-row">' + s.subs.map(([id, t], i) => `<button class="sc-btn" data-sub="${i}">${esc(t)}</button>`).join('') + '</div>';
    h += '</div><div class="sc-row">';
    if (s.gate && !washed) h += `<button class="sc-btn gold" data-a="wash">רחיצת ידיים ורגליים מן הכיור</button>`;
    if (s.find && !bowed) h += `<button class="sc-btn gold" data-a="bow">השתחווה — ההשתחוויה הארבע עשרה</button>`;
    if (locked(s)) h += `<span class="sc-src">לפני הכניסה להיכל — מקדשים ידיים ורגליים בכיור (כלים א, ט).</span>`;
    h += `<span class="sc-grow"></span><button class="sc-btn" data-a="prev">הקודם</button><button class="sc-btn gold" data-a="next">${mode === 'yk' ? 'המשך' : 'הבא'}</button>${mode === 'yk' ? '<button class="sc-btn" data-a="skip">דלג לסוף</button>' : ''}</div>`;
    el.firstElementChild.innerHTML = h;
    try { const H = globalThis.__bhSceneHooks; if (H) H.render(el, { mode, stop, card, cards: cards().length, n: list().length, id: cur().id, ids: list().map((x) => x.id), sub: !!sub, washed }, { goStop, open }); } catch (e) { /* optional */ }   // ── hooks ── (HOOKS agent, round 3: stamps, "לתחנה הבאה", the doors — src/avodah/hooks/tour.js)
    // the current stop's chip stays in sight (QA P2-19): the chips scroll sideways, so after each render the active one is
    // brought to the middle of the row (instant; the panel itself does not move)
    const on = el.querySelector('.sc-stops button.on');
    if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' }); } catch (e) { on.scrollIntoView(false); } }
  }
  async function goStop(i, ms) {
    const L2 = list(); i = Math.max(0, Math.min(L2.length - 1, i));
    const s = L2[i];
    if (locked(s)) { stop = L2.findIndex((x) => x.gate); card = 0; sub = null; render(); return run(ms); }
    stop = i; card = 0; sub = null; countN = 0; render();
    return run(ms);
  }
  async function run(ms) {
    const s = cur(); busy = true;
    hi(world, s.hi || null);
    const SA = S(world);
    try { if (SA && s.kodeshSmoke !== undefined && SA.setKodeshSmoke) SA.setKodeshSmoke(s.kodeshSmoke); } catch (e) { /* optional */ }
    try { if (s.dusk && world.setTimeOfDay) world.setTimeOfDay('dusk'); } catch (e) { /* optional */ }
    if (s.go) await s.go(world, ms);
    if (mode === 'yk') ykStep(s);
    if (s.count) {
      clearInterval(countT); countN = 0; render();
      const driven = !!(world && world.avodah && typeof world.avodah.yomKippur === 'function');
      if (!driven) countT = setInterval(() => { if (!(el && cur().count)) { clearInterval(countT); return; } countN = (countN + 1) % COUNT.length; paintCount(); }, 1100);
    }
    busy = false; render();
    return true;
  }
  // the Kohen Gadol's service (world.avodah.yomKippur, avodah3d.js "── yk ──"): each chapter sets its stage at once (so
  // chapters can be skipped or taken in any order) and plays its short, dignified choreography. He is never shown
  // immersing (the linen sheet), no blood is shown, and the camera never walks his path inside the Kodesh HaKodashim.
  // Older worlds without yomKippur: the Kohen Gadol walks to the chapter's place (guarded; a missing layer is skipped).
  const YK_AT = { immersion: ['gadol', [-70.5, -55.2]], white: ['gadol-white', [-58, 32]], confession: ['gadol-white', [-58.6, -6.6]], lots: ['gadol-white', [-14.5, -28]] };
  function ykStep(s) {
    const A = world && world.avodah; if (!A || !s.yk) return;
    try {
      if (typeof A.yomKippur === 'function') {
        const p = A.yomKippur(s.yk, { onCount: s.count ? (n) => { countN = n % COUNT.length; paintCount(); } : null });
        if (p && p.catch) p.catch(() => false);
        return;
      }
      const at = YK_AT[s.yk];
      if (at && A.kohen) {
        if (!kg || kg.dress !== at[0]) { if (kg && kg.a && kg.a.remove) kg.a.remove(); kg = { a: A.kohen('kohen-gadol', { garments: at[0], role: 'gadol' }), dress: at[0] }; }
        if (kg.a && kg.a.walkTo) kg.a.walkTo(at[1]);
      }
      if (s.bow && A.bow) { A.bow(true); setTimeout(() => { try { A.bow(false); } catch (e) { /* optional */ } }, 5000); }
    } catch (e) { console.warn('[scenes] yk', e && e.message); }
  }
  function paintCount() { if (el && cur().count) { const n = el.querySelector('.sc-count'); if (n) n.textContent = COUNT[countN] || ''; } }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.m) { open(b.dataset.m); return; }
    if (b.dataset.s !== undefined) { goStop(+b.dataset.s); return; }
    if (b.dataset.sub !== undefined) { sub = cur().subs[+b.dataset.sub]; card = 0; render(); focus(world, sub[0]); return; }
    const a = b.dataset.a;
    if (a === 'close') close();
    else if (a === 'next') next();
    else if (a === 'prev') prev();
    else if (a === 'skip') goStop(list().length - 1);
    else if (a === 'wash') { washed = true; render(); }
    else if (a === 'bow') { bowed = true; hi(world, 'odd-stone'); render(); }
  }
  function next(ms) {
    const cs = cards();
    if (card < cs.length - 1) { card++; render(); return Promise.resolve(true); }
    if (cur().gate && !washed) { washed = true; }                        // (the tour continues: washing is the step)
    if (cur().find && !bowed) { bowed = true; hi(world, 'odd-stone'); }
    if (stop < list().length - 1) return goStop(stop + 1, ms);
    close(); return Promise.resolve(false);
  }
  function prev(ms) { if (card > 0) { card--; render(); return Promise.resolve(true); } if (sub) { sub = null; render(); return Promise.resolve(true); } return stop > 0 ? goStop(stop - 1, ms) : Promise.resolve(false); }
  function ykEnd() { try { const A = world && world.avodah; if (A && typeof A.yomKippur === 'function') A.yomKippur('end'); } catch (e) { /* optional */ } }
  function open(kind = 'tour', ms) {
    mount();
    const k = L[kind] ? kind : 'tour';
    if (mode === 'yk' && k !== 'yk') ykEnd();   // leaving the service: its people and animals go
    mode = k; stop = 0; card = 0; sub = null; render(); return goStop(0, ms);
  }
  function close() {
    clearInterval(countT); hi(world, null);
    try { const SA = S(world); if (SA && SA.setKodeshSmoke) SA.setKodeshSmoke(0); } catch (e) { /* optional */ }
    try { if (kg && kg.a && kg.a.remove) kg.a.remove(); } catch (e) { /* optional */ }
    ykEnd();
    kg = null;
    if (el) { el.remove(); el = null; }
    out(world);
    if (onClose) { try { onClose(); } catch (e) { /* the host decides what shows next */ } }
  }
  return {
    open, close, next, prev, goStop, render,
    wash() { washed = true; render(); }, bow() { bowed = true; hi(world, 'odd-stone'); render(); },
    get state() { return { open: !!el, mode, stop, card, id: el ? cur().id : null, washed, bowed, busy, stops: list().map((x) => x.id), text: el ? el.textContent : '' }; },
    get lists() { return { tour: TOUR.map((x) => x.id), ark: ARK.map((x) => x.id), yk: YKS.map((x) => x.id) }; },
    isYomKippur: isYK,
  };
}
export const SCENE_IDS = { tour: TOUR.map((x) => x.id), ark: ARK.map((x) => x.id), yk: YKS.map((x) => x.id) };
