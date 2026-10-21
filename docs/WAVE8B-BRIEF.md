# Wave 8B — the owner's notes on v16 (2026-09-28, 09:50 UTC; feature freeze 11:50 UTC, hard stop 12:10 UTC = 15:10 Jerusalem)

## The owner's notes (ירון בן אור, 28.9, 12:18 Jerusalem — verbatim)
"הערות: שלב שיטוח ההר: שתי האבנים האחרונות מוסתרות ולא רואים על מה מכים. 2. המשחקון ביניים רץ בספיד ולא ניתן לשחק בו (אולי זה רק
מצב ההדגמה אבל צריך לסדר. אגב, גם יתר המשחקוני ביניים לא פועלים טוב ו/או בכלל). 3. פרט מידע אמיתי - כל פעם חוזר על אותו דבר, צריך
לבנות רשימת פרטי מידע אמיתיים, עדיף שקשורים לכל שלב/נושא בו נמצא המשחק ולשלב ביניהם רנדומלי וללא חזרות כך שכל פעם שאני פותח מחדש
את המשחק אני אראה פריט מידע אחר. 3. הדמות - לאחר הבחירה בשם כלשהו, לא רואים אותה בשום מקום, חסר צריך להשלים, שלום הכהן יכין או
משהו בסגנון. 4. שלב שיטוח ההר לא מבינים על מה להקיש. זום אאוט מאוד גדול. בנוסף, לא מבינים מה קורה שם. גם בחלונית בנה מקטע 8 אבנים
לא כ"כ ברור מה אני צריך לעשות. אחרי לחיצה אחת כבר כתבו הנח את אבן הפינה. גם המשחקונים בהנח את אבן הפינה תקולים. גם משחקון המחצבה
תקול. משחק לבד עם עצמו. גם שעון העצר שחלוניות שקופצות שהעבודה מתחילה בעו 0:02 שניות לא סופר אחורה. גם משחקון הסיתות תקול. בגדול -
ההתקדמות בשלב הזה לא נראית בעין בעולם של המשחק וזה רק לחיצות רנלדומליות ומידע בלי שבאמת זז משהו. בנוסף, ההר ריק מפועלים ומכלי
בנייה ומנופים. צריך לתת עוד מחשבה רבה על השלב הזה, וגם על שלבי הבנייה הבאים.
https://play.google.com/store/apps/details?id=com.quantumgames.skyscraper — תראה ברשת משחקי בניה כיצד הם בויים. כי אצלנו זה עדיין
לא זה.. ומסיקה שתהיה מוסיקה נלווית מותאמת."

**What this means.** v16 passed every automated suite, and still fails a real player on a real phone. The reason: our tests
drive the game with autoplay hooks (`__MG_AUTO`, `__M3_AUTO`, `_.resync`) and the demo's ×60 clock, so they never touched the
mini-games or the Mount with a human's taps.

**This wave's standard:** what a first-time player sees and does on a phone, by hand. Every fix is shown with real touch input
(Playwright `hasTouch`, `page.touchscreen.tap`, or pointer events on the canvas and DOM), in normal mode with no autoplay flags,
at 390×844, and screenshots you looked at.

**A known trap.** `#demo` (×60 clock, autoplay) sets `settings.demo`, and any later `saveSettings()` persists it (game/index.js ≈ 74–78,
switchMode ≈ 1402). A player who once opened `#demo` stays in demo mode afterwards. FLOW fixes it: demo is never persisted, and
a visible "יציאה ממצב הדגמה" chip is on screen while it is on.

## Rules and pattern
- docs/WAVE6-BRIEF.md: content rules, git, the machine, budgets, guarded calls.
- docs/WAVE7-BRIEF.md: usage economy, bus, reports.
- Everything is a draft tagged טיוטה with an exact source. Never a Divine Name. No gambling, loot boxes, purchases or guilt.
  Shabbat-safe. Hebrew RTL, phone portrait first, 44-px targets.
- **Paid services: none.** No music, image or voice APIs. Everything is procedural or CC0/MIT with the licence recorded.
- **Usage economy is real.** Read big files by ranges, keep outputs short, take few screenshots and look at each, no
  sub-agents, and commit every 15–20 minutes.
- **The machine:** 2 cores. The withdrawn wave's agents may still be finishing in wt/build8, fun8, content8 and world8. Never
  touch those worktrees; they end on their own.

## The bus
- /home/claude/wt/bus/. Your notes go in `bus/<AGENT>.md` (names below).
- Post your plan by 10:10 UTC, and an update every 40 minutes.

## The seven agents
| agent | worktree · branch | owns |
|---|---|---|
| QA8B | wt/qa8 · s8-qa | test/real-play.cjs (new: the first ten minutes by real touch, no autoplay), docs/QA-S8.md; reads everything, changes no game code |
| DESIGN8B | wt/design8 · s8-design | docs/STAGING.md + docs/STAGING-he.md (new): how building games stage construction, and the storyboard of Phase A's stages |
| SITE8B | wt/site8 · s8-site | src/stages.js OUTSIDE PEOPLE's hero fences (the site views `DEF[..].view`, the boulders, makeHill, the site's props), src/crews.js (the workers), src/batch.js; main.js `// ── site8 ──`; test/site_*.cjs, stages_api*.cjs, crews.cjs |
| FLOW8B | wt/flow8 · s8-flow | src/game/state.js, index.js, content.js, ui.js, ui.css.js, moments.js, middot.js; main.js `// ── build* ──`; test/game-*.{cjs,mjs}, moments.cjs; docs/BUILD*.md |
| GAMES8B | wt/games8 · s8-games | src/game/minigames/*, src/match3/*, src/game/audio.js (sounds), test/minigames*, test/match3*, test/playtest/minigames-*; docs/FUN.md (a §9) |
| MUSIC8B | wt/music8 · s8-music | src/game/music.js (new), main.js `// ── music ──`, test/music*.{cjs,html} (new), docs/MUSIC.md (new) |
| FACTS8B | wt/facts8 · s8-facts | content/facts.json (new), docs/FACTS-S8.md (new), a wave-8B ⚑ section in content/REVIEW.md |

## The work

### QA8B — the truth first
1. **By 10:30 UTC:** reproduce each owner note on master (v16, 326cb49) by real touch at 390×844.
   - Run it in normal mode (a fresh profile), and once in `#demo`.
   - For each note, give: reproduced or not, the root cause with file:line, a screenshot (looked at), and which agent owns
     the fix.
   - Post it all in bus/QA8B.md. The owners start from it.
2. **test/real-play.cjs:** the first ten minutes by real touch, with no autoplay flags. The steps:
   - the opening;
   - tap the survey;
   - strike every boulder, and each must be visible and on screen when struck;
   - the first stone;
   - a precision game played by hand;
   - one board played by hand for at least 20 moves (a simple greedy swapper that sends real pointer events);
   - a segment;
   - the name prompt;
   - the countdown chips counting down.

   Each step must visibly change the world (compare screenshots or the world's own state).
3. **From 11:15 UTC:** on a throwaway merge of the new branches, re-run it and check each owner note.
   - Write docs/QA-S8.md: each note ✓/✗, with evidence.
   - Post P0s to their owners.

### DESIGN8B — the director
1. **Research** (WebSearch/WebFetch, cite sources): how building games stage construction.
   - Games: Skyscraper (Quantum Games, the owner's link), Tower Bloxx, Idle Construction 3D and similar idle builders, SimCity
     BuildIt, Megapolis, Township, Hay Day's building, Minecraft-like builders.
   - For each: the camera and its distance; what the player taps; what moves after each tap (workers, machines, the building);
     how progress shows; the pace; the first minute.
2. **By 10:40 UTC:** post the full storyboard of the Mount ("שיטוח ההר") on the bus as a shot list, for SITE8B and FLOW8B.
   For every beat give: camera, target, the player's action, what the world does, the words on screen (few), the sound/music
   cue, and the fact shown. Required:
   - the site is alive: workers, carts, a crane, tools, piles;
   - each tap moves something you can see;
   - it is clear what to tap: a pointer in the world on the target, never a hidden target;
   - the camera stays close, and zooms out only for a reveal.
3. **By the end:** docs/STAGING.md with the storyboard of the wall, the gates and the altar, and an outline of the rest of
   Phase A. docs/STAGING-he.md is a 1–2-page owner summary in Hebrew (draft).

### SITE8B — the Mount on screen (with DESIGN8B's shots)
1. **The camera.** A close site camera for the Mount: the hero, his target and the workers in one frame. Every boulder is
   visible and framed when it is the target. The owner: "the last two are hidden and you can't see what you strike".
2. **A busy site on the Mount from the first minute:**
   - workers with picks, baskets and levers;
   - an ox cart hauling rubble;
   - a crane (treadwheel);
   - stone piles, tools, survey stakes and cords.

   Instanced, with a phone budget of ≤ 150 draw calls.
3. **Every strike changes the world:** the boulder cracks in stages, chunks are carted away, the levelled patch grows, and the
   Mount's first retaining course rises. Progress must be visible at a glance.
4. **The Mount's long colour bands** (makeHill): rock, soil and scrub. WORLD8's commits on s8-world (7136e24) may help; take
   what is useful.
5. **If time allows:** the same "alive site" for the wall's site.

### FLOW8B — clear, personal, honest
1. **What to tap.** The Mount's first minutes:
   - a pointer and a ring ON the target in the world, big;
   - the prompts in order, with the next step only after this one is done;
   - the "בנה מקטע · 8 אבנים" panel says in one line what happens and what to do;
   - no "הנח את אבן הפינה" after one tap.
   Use DESIGN8B's storyboard and SITE8B's camera and targets (guarded).
2. **The name.** After the prompt:
   - a greeting card: "שלום, הכהן <שם>";
   - the name on a HUD chip;
   - the coach addresses him by name now and then;
   - the welcome back uses it.
3. **Countdowns that count.** Every "בעוד 0:02" and every chip ticks live, with no static text.
4. **The demo trap.**
   - Demo is never persisted.
   - A visible exit chip is shown while it is on.
   - `#demo` still works for the investor.
5. **Facts.** A rotation system, using FACTS8B's content/facts.json:
   - a pool per stage and topic;
   - the current stage's facts first;
   - random, with no repeats across sessions (the seen set is kept in the save), and a new one on every visit.
   - Where they show: the loading screen, the precision games' fact line (GAMES8B calls your `nextFact(topic)`; post the API),
     and the idle tips.
6. **Keep green:** game-harness, game-flow, game-e2e, moments --harness, node tests. Update any test that relied on the old
   flow, with a one-line reason.

### GAMES8B — every mini-game playable by hand
1. **The precision games:** the crane (אבן פינה), dressing (הסיתות), quarry (המחצבה), plumb, whole stones and frame.
   - Play each one yourself by real touch at 390×844. Fix input, speed and clarity.
   - Add a first-time how-to (one line plus an animated hint).
   - Nothing moves or plays by itself unless `ctx.demo` or a test flag says so.
   - A slow first round, then the curve.
2. **The match-3 board:** swaps by drag and by tap-tap work on a phone; the pace is readable; the autoplay runs only in demo
   or tests.
3. **Facts:** each game's fact line comes from FLOW8B's `nextFact(topic)` (guarded; the old fixed fact is the fallback).
4. **Tests:** a real-touch test per game (test/minigames-touch.cjs, new), plus the existing ones green.

### MUSIC8B — an original, adaptive score (procedural WebAudio; no files, no paid services)
1. **The engine and the sound:**
   - Original motifs in modes that feel of the place and time: Ahava Rabbah / freygish, Dorian, Phrygian.
   - Synthesized instruments: kinnor (plucked lyre, Karplus–Strong), nevel (lower plucked), chalil (breathy flute), tof (frame
     drum), a soft drone.
   - No liturgy with the Name, and no existing melodies.
2. **States, crossfaded:**
   - build: calm, with a pulse;
   - board: livelier;
   - precision: tension;
   - moment: a swell;
   - night: soft;
   - Phase B: solemn;
   - silence under speech and cards (ducking).
3. **Wiring:**
   - It starts after the first gesture, follows the game's events (main.js `// ── music ──`: `game` events / `onEvent`), pauses
     when the page is hidden, and respects the existing mute.
   - Add a separate music volume (a small `music.set({volume})` API).
   - FLOW8B adds the toggle in the menu if time allows. Post the API.
4. **Constraints:** CPU-light on a phone; the bundle grows by ≤ 25 K.
5. **Deliverables:** docs/MUSIC.md, and a test page that renders each state offline (OfflineAudioContext) and checks for no
   clipping or silence.

### FACTS8B — true facts, many, per stage
1. **content/facts.json.** At least 8 verified facts per Phase A stage (15 stages), plus topics: Jerusalem, Herod's building,
   the priests, the quarry and stone, water, the kings' trade.
   - Each fact: id, stage/topic tags, a Hebrew text of ≤ 35 words, the exact source (Mishnah, Talmud, Rambam, Josephus
     paraphrased, archaeology with its publication), status draft.
   - Reuse what is already verified (docs/SOURCES-S6.md, content/*.json). Check new ones in two passes (Sefaria via WebFetch;
     institutional sites).
   - Post the schema by 10:15 UTC and the first 60 facts by 10:45 UTC, for FLOW8B.
2. **From 11:15 UTC:** read every new Hebrew string on the other branches, and post file:line → fix.
3. **The wave-8B ⚑ section** in content/REVIEW.md, each item with a default. Keep qa-content-scan green.

## At the hard stop (12:10 UTC)
- **Your branch:** everything committed; it builds; your tests are green, or each failure is explained;
  `git merge-tree --write-tree master s8-<you>` is clean.
- **Your final message is your report:**
  - what you built, by file;
  - how to test it, and the results by real touch;
  - screenshots (looked at);
  - the bundle delta;
  - ⚑ lines for the owner in Hebrew, each with a default;
  - requests to others, as file:line.
