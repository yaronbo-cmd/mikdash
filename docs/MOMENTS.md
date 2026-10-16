# Phase A key moments (wave 3, 25 Sep 2026)

Every Phase A stage now ends with a key moment: a 10–40 s hands-on overlay over the 3D site that teaches one real
detail and ends with a sourced card tagged "טיוטה". Four existed (greatStone, breaches, redLine, boxes); this wave adds
the other eleven. All texts are drafts until Yaron approves them (PROJECT.md §2.2).

Code: `src/game/moments.js` (each moment is a function named after its stage id), cards in `src/game/content.js`
`MOMENTS` (built from `content/moments.json` and, for Ben Katin, `content/kiyor.json`), wiring by `moment:` on each
stage in `STAGES`. World beats: `stages.js` `momentFX(kind, arg)` plus the existing `strikeFX` / `hero.setTool`,
reached through two marked one-liners in `src/game/index.js` (`// ── moments ──`).

## The site stays in view

On a portrait phone the moment's card sits at the bottom of the screen and the camera frames the site in the upper
part (`stages.js` `momentFX('frame', id)` → `focus(id, 1200, {x: 0, y: 0.5, zoom: 1.45})`: a pan of camera and target
together, so the view is the same, only moved); on a wide screen the card sits on the right and the site on the left.
The CSS for this is injected by moments.js (`.gm-mo` placement per orientation), so it applies to all fifteen moments.
Anything the player does in the card also lands in the 3D world behind it (dust and chips at the site, the altar's
fire, gold bursts).

## The rules every moment keeps

- **No fail state.** A wrong move explains itself (usually with the Mishnah's own words) and the same step is tried
  again at once. "דלג" always completes the moment. Nothing is ever lost.
- **Phone portrait first.** One 300 × 300 SVG play area inside the moment card; every target is at least 44 px on a
  390 px phone (hit areas larger than the drawing); hold buttons are the framework's big `.gm-mo-hold`; keyboard:
  Enter/Space (and the arrows on sliders).
- **Juice.** Each step has a sound from `audio.js` (settle, chime with a climbing combo, crack, creak, strike, leaf,
  fanfare), a haptic tick, gold sparks in the overlay, and a beat in the 3D world behind it (`fx` = strikeFX at the
  site; `momentFX('fire')` lights the altar; `'gold'` / `'dust'` bursts).
- **Replayable from the map, without rewards.** The hooks' "רגעים מיוחדים" list in the map sheet plays any finished
  moment again with `world: {}`; the save is untouched (checked by the test for every moment).
- **Stops cleanly.** Every timer, tween and rAF loop belongs to the moment's `jobs()` and stops on skip or done.

## The eleven moments

| stage | moment | what the player does | the detail it teaches | card (quote · ref) |
|---|---|---|---|---|
| wall | הנדבך הראשון | for each of 5 stones pick the cut ashlar whose end misses the red plumb lines of the joints below; a joint over a joint flashes and is lifted | offset joints: every stone sits on two (Herodian masonry, **archaeology, not Mishnah**) | Middot 5:1 (187 × 135) + the masonry line marked "ארכאולוגיה, לא משנה" |
| gates | שבעת השערים | a name card per gate; tap the wall it stands in (the plan faces west: south on the left, north on the right, Nikanor below); it flies to its place | three north, three south, one east, by name | Middot 1:4 (+ 1:5 for the north); a wrong wall quotes the Mishnah for that gate (the Water Gate: 2:6, the water libation on Sukkot) |
| nashim | לשכת העצים | find the 4 logs with worm holes (a worm peeks out) and tap them out; a clean log says "נקי" | wood with a worm is unfit for the altar; blemished priests checked it | Middot 2:5 |
| nikanor | הסערה והמעלות | hold the door in the storm until the sea rests (letting go only lets the waves rise a little); the first door comes out at Acre; then tap to lay 15 rounded steps | Nikanor's doors (Yoma 38a, from `STORY.nikanor`); 15 steps "כַּחֲצִי גֹרֶן עֲגֻלָּה", the Songs of Ascents | Middot 2:5 + Yoma 38a |
| lishka | אבן גזית | run the chisel across the rough face, band by band (short strokes add up), then the straightedge | גזית = dressed, smooth stone | Middot 5:4 |
| yesod | בלי ברזל | pick the tool: the iron hammer and the iron trowel are refused with the reason; the wooden mallet becomes the builder's tool in the world; then lay whole stones and set aside chipped ones | iron disqualifies by touch; "נִפְגְּמָה אַחַת מֵהֶן, הִיא פְסוּלָה" | Middot 3:4 |
| guf | הכבש והסיד | drag 4 whole stones up the ramp (let go low: it slides back), then whitewash altar and ramp with a wooden float | the kevesh 32 × 16 on the south (3:3); whitewashed twice a year, Pesach and Sukkot, never an iron trowel (3:4) | Middot 3:4 (the content card's line) + 3:3 |
| karnot | הקרנות והאש הראשונה | drag (or tap) 4 horns onto the corners of the altar's top, drawn to scale; then hold on the wood of the מערכה until the fire catches (world: life's altar fire + sparks) | horns one amah by one; the 24 × 24 מקום המערכה | Middot 3:1. Order kept: moment → stage card → the hooks' Phase B invitation (Ezra 3:6) |
| kiyor | שנים עשר הדדים | hold to pour bronze into the mould, release on the line (over it, the spill is scraped off and the level goes back); then the kiyor from above has 2 spigots: tap 10 glowing places to make 12; then night: hold to turn Ben Katin's mukhni, the kiyor sinks into the water | Ben Katin made twelve spigots, it had two; twelve priests at once; the mukhni kept its water from being disqualified overnight, its creak heard to Jericho | Yoma 3:10 (+ Yoma 37a, Tamid 3:8, Middot 3:6) |
| ulam | המלתראות וגפן הזהב | 5 lintels swing on the crane; tap "הורד" when centred (off-centre bumps back up); a stone course appears between them; then hang a leaf, a grape and a cluster on the vine (drag or tap) | lintels 22 → 30 amot, each overhanging the one below by an amah each side, a course of stones between; volunteers hung leaves, grapes, clusters | Middot 3:8 (+ 3:7) |
| heichal | הבית בזהב | rub 8 gold plates until they shine (rubbing the wall behind the open door explains "חוץ מאחר הדלתות"); then drag the sun up and the façade turns gold and white | the whole house gold except behind the doors; "like a snow-covered mountain" | Middot 4:1 + Josephus War 5.5.6 **in a free translation** |

## The finale's moment (wave 12, WORLD12): חנוכת הבית

| when | moment | what the player does | the detail it teaches | card (quote · ref) |
|---|---|---|---|---|
| the finale, after its story card (index.js `finale()` → main.js `hooks.celebrate` → src/finale.js) | חנוכת הבית · המחשה | at night, over the lit courts: tap each of the four golden menorot four times — at each tap its young kohen climbs a rung of his ladder and fills and lights the next bowl (16); the world lights with them (every lamp, the city), and "לא הייתה חצר בירושלים שלא האירה" | the menorot of the Beit HaShoeva, four bowls, four ladders and the young kohanim with jugs of oil; the celebration of the dedication | Sukkah 5:3 (quote) · Ezra 6:16–18 · Josephus, Ant. 15.421–423 · Sukkah 5:2–4 · marked המחשה; + "הזמינו חברים לחגיגה" (FUN12's "כהנים יחד") |

The world around it (src/finale.js): the night, the festival lamps along the courts (life.js `setFest`), the crowd's `chag`
scene (the dancers with torches, the Levites on the fifteen steps, the pilgrims of eight named lands, the guards' torches), and
the `chag` music. Before it, the build-up: from the Ulam's start, pilgrims of named lands walk up to the Mount with gifts (one
toast each, with its source) and lamps are hung. **No fireworks** (⚑ the owner). The investor demo shows the night for 6.5 s,
no taps. Test: `node test/finale-touch.cjs` (real touch, 390×844).

## Investor reel (`src/game/hooks/demo.js`)

"הרגע הבא ✦" now plays the karnot and ulam moments (they were "live" finishes): the first fire and the lintels + vine
are the most visual new moments and each takes ~15 s. The Heichal stays a live finish (its world `shine()` + orbit is
the payoff; the harness checks it). Order: great stone → the wall → breaches → red line → **horns + first fire** →
**lintels + vine** → the Heichal in gold → the craftsmen in boxes.

## Camera angles

`stages.js` `MOMENT_VIEW` gives three moments their own angle where the site's usual one hides the point: karnot
(the altar's top, from higher up: el 56°), yesod (el 44°), guf (the kevesh, from the south-east and above the south wall: az 36°, el 52°).

## Tests

- `node test/moments.cjs --harness` — the DOM harness (fake world, fast): every moment is played by a solver that
  also makes one wrong move where the moment has one, checks the end card, completes the stage, and replays it from
  the map. Shots: `test/out/moments-h-<id>.png` (mid-play) and `-end.png` (the card).
- `node test/moments.cjs` — the same in the real build (dist/test.html, SwiftShader), phone 390 × 844 and desktop
  1280 × 720: `test/out/moments-<id>-390.png`, `-1280.png`. The world runs in real time (`__T.simulate(true)`) and a
  frame is rendered only for each shot.
- Results on 25 Sep (2 shared cores, five agents): harness 94/94; real build, both viewports, 181/184 in the full run
  (the desktop wall solver clicked while the lift was still running: the wall now marks `data-busy` and the solvers
  wait on it), then wall + ulam again 32/32. A full real run takes ~13 min on the phone and ~25 min on the desktop.
- Changed fixtures elsewhere (because four more stages now wait for their moment): `test/game-state.test.mjs` (the
  wall's full work is `ready`, then `momentDone`), `test/game-harness.cjs` (the Heichal-by-a-strike fixture marks its
  moment played: `m: true`).

## Quotes and what still needs checking

Verified text only (content/moments.json, kiyor.json, middot.js — Sefaria Torat Emet, two passes), except:
- **Josephus, War 5.5.6** (heichal card): a free Hebrew paraphrase of Whiston's translation (the gold plates flashing
  at sunrise; "like a mountain covered with snow; for as to those parts of it that were not gilt, they were exceeding
  white"), marked "בתרגום חופשי". Needs the content agent's check against the Greek/Whiston.
- **Yoma 38a** in the nikanor card and the storm's lines: from `STORY.nikanor` ("בלשון פשוטה"); the moment quotes only
  "השליכו אותי איתה" and "מיד נח הים מזעפו" in plain Hebrew. The content card for nikanor still lacks the verified
  Yoma 38a quote (content/moments.json note).
- **Herodian joints** (wall): stated as archaeology (the masonry of the Western and Southern walls), not a quote.
- **Gate order inside each side** follows temple.js (south from the west: הדלק, הבכורות, המים; north from the east:
  הניצוץ, הקרבן, בית המוקד) — marked "פרשנות של המשחק" on the card.
- "גזית: אבן מסותתת וחלקה" (lishka) is the plain meaning of the word, not a quote.

## ⚑ For the owner

1. Every stage now has a key moment (15 of 15). Is that the right density, or should a few (gates, nashim) be
   optional "extra" moments that don't hold the stage?
2. The wall's moment is at the end of the wall's work but is called "הנדבך הראשון" (as briefed). Rename to "נדבך
   בחומה", or move it to the start of the wall?
3. Josephus' "snow-covered mountain" line in a free translation on the heichal card — keep it or quote Whiston in
   English under it?
4. The karnot moment lights the altar's fire in the world a few seconds before the stage completes — fine?
5. The investor reel now plays two more moments (karnot, ulam): ~30 s longer.
6. (wave 12) חנוכת הבית: לילה של אור — מנורות זהב, ספלים, אבוקות ורוקדים, הלויים על המעלות, ועולי רגל משמונה ארצות עם מתנות.
   בלי זיקוקים (הומצאו כאלף שנה אחרי החורבן). ברירת מחדל: כך. החלופה: להוסיף "זיקוקים" אם תחליט, כהמחשה מודרנית מסומנת.
7. (wave 12) "שבא · תימן" ברשימת הארצות נשען על החזון (ישעיהו ס, ו) ולא על מקור מימי הבית; מסומן המחשה. ברירת מחדל: כך.
   החלופה: להחליפה ב"ערב" או להשמיט.
