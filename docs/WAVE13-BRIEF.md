# Wave 13: the owner's ideas, and what the producer found in his testing mode

2026-09-30, night. Start 19:15 UTC. Plans on the bus by 19:35. Feature freeze 21:55 UTC. Hard stop 22:10 UTC (01:10 Jerusalem).

## The owner's words, for every agent

**30.9, 07:32 Jerusalem:**
> 1. "בהתחלה כשחשבתי על הרעיון של המשחק חשבתי גם על המסביב שיהיו מקומות לקורבנות לפרים לעזים וכו', צריך לנהל את הדירים
> והאורוות מסביב לבית, אולי."
> 2. "כמו כן קטורת - פיטום הקטרת, עדיין לדעתי לא נכנס למשחק."
> 3. "תחשוב שהמשחק מיועד בעיקר לבנים צעירים אז אולי אפשר לבדוק אילו משחקים שיחקו בתקופה ההיא ולהתאים משהו.."

**11:12:**
> "שים לב שעדיין המשחק היחיד שיש הוא המחצבה בדרגות שונות. ראיתי שויתרת על המשחק של הפלס עם המחט הוא דווקא נחמד תוסיף אותו
> לשלבי הפילוס. ושהבמאי יעבור על זויות הצילום. במשחקון ההדגמה היו מקרים שבהם השחקן רק עמד וזז מצד לצד בלי סיבה נראית לעין.
> אולי זה בגלל שחסר אבנים אבל אולי זה באג. בדוק את זה. לוודא שבכל שלבי הבנייה נראית ההתקדמות של הבניה כי בעזרת נשים ומצורעים
> לא בטוח שראיתי את זה. ועוד דבר, נראה שאני עובד לבד רק גלגלית אחת ישנה והיא שלי. צריך לדעתי עוד מכונות כאלה בסביבה ועוד מכונות
> בניה מגניבות מהימים ההם שייראה מלא פעילות. (אגב, לשלב הבא - כשישחקו ביחד אז כל אחד יבנה את המקטע שלו שחקנים אמיתיים
> מולטי-פלייר..)"

**22:00:** "אתה יכול להתחיל."

**The compass: "זה הכי חשוב שיהיה כיף ומעניין ותקין".** He loves the kohen walking from point to point at his work.

## Where we are
- **v25 is published.** Master is 624d961.
- **The owner tests in the demo** ("מצב הדגמה"):
  - its own save and plenty of materials;
  - "שלבים ▾" opens a picker: "⏭ לשלב הבא", then all 15 stages. A stage starts fresh with every stage before it built (`state.js demoAt`, `index.js jumpTo`);
  - since v24–v25 the demo plays like the real game. Only the investor reel keeps its curated behavior (`reelOn()`, after "הרגע הבא ✦").
- **Already fixed today (PRODUCER-S13a's top 12 #1, #2, #8):**
  - `stages.js route()` walks a short step straight;
  - the demo's games wait for a touch, and the quarry cycle plays in it;
  - the demo strip moves below the coach's hand.
  - Idle, he follows the crews' slot at most once in 8 s. Top-12 #4 wants it tighter; see DIRECTOR13.
- **Read first:**
  - **docs/PRODUCER-S13a.md**, today's pass on v24: the per-stage table, §3–§6 with file:line, the top 12, the ⚑ lines;
  - PROJECT.md §8 ("Wave 12", "30.9 day", "Next (wave 13)").

## Rules
The rules of docs/WAVE6–12-BRIEF.md apply in full:
- drafts marked טיוטה, each with its exact source;
- never write the Name, not even in code or tests (use ה׳, אלקים, א-ל);
- no gore (the shechita is a cut-away);
- no Ark in the Second Temple, and the player never enters the Kodesh HaKodashim;
- no gambling, loot, purchases or guilt;
- Shabbat and Yom Tov never break a streak;
- Hebrew RTL, phone first, 44-px targets;
- no paid services;
- no sub-agents.

**Testing:** real touch at 390×844, no autoplay flags in acceptance tests. Look at every screenshot you take. **Test in the demo,** as the owner does: `__T.game.switchMode(true)`, then "שלבים ▾" or `__T.game.jumpTo(id)`, declared.

**Usage:**
- commit every 15 minutes;
- read big files by ranges;
- keep your outputs short.

**The machine has 2 cores. Every browser run goes through the queue:** `/home/claude/wt/bus/brun <command…>`.
- First come, first served; a run is cut at 10 minutes.
- The producer has a lane: `BRUN_LANE=producer`.
- Never `pkill -f` a pattern that matches your own shell.

**Never shadow an imported helper** (`smooth`, `clamp`, `lerp`…) inside a module's closure.

**Budget:** the bundle is ≤ 3.1 MB (v25 is 2,980,962 bytes). Report your delta.

## The bus
- It lives at /home/claude/wt/bus/, with a notes file per agent: bus/<AGENT>.md.
- Post your plan by 19:35 UTC, then an update every 40 minutes.
- **bus/PRODUCER13.md is the inbox.** Owners answer under each note: fixed at <sha>, or why not.

## The five agents
| agent | worktree · branch | owns |
|---|---|---|
| PRODUCER13 | wt/producer13 · s13-producer | test/produce-*.cjs, new docs/PRODUCER-S13.md, bus/PRODUCER13.md. Plays everything in the demo by touch; changes no game code |
| SITE13 | wt/site13 · s13-site | src/stages.js (all but DIRECTOR13's camera functions, below), crews.js, batch.js, mount.js, temple.js's construction layer, crowd.js; main.js `// ── site13 ──`. Tests: site_*.cjs, stages_api*.cjs, crews.cjs; docs/SITE.md |
| DIRECTOR13 | wt/director13 · s13-director | **The camera and the course's beats.** In src/game/index.js: workFrame, courseBeat, closeFrame, fitHero, keepInFrame, keepAtWork, the crews' report (applyReport) and the demo's buying. In src/game/state.js: the crews' course report and the demo's payments. In ui.js: the labels. In src/stages.js ONLY the view functions (wallView, siteWorkView, courseView, checkView, frameBlocked, MOMENT_VIEW), inside `// ── director13 ──` fences. Tests: game-harness, game-flow, game-touch, game-courses-touch (both parts), moments --harness |
| GAMES13 | wt/games13 · s13-games | src/games/* (new games), src/game/minigames/*, src/match3/*; content.js CHECK_EVERY and the plumb's placement (a `// ── games13 ──` fence); the check's call site in index.js stays DIRECTOR13's (agree on the bus). Tests: games-touch, games-rules, sling*, cycle*, minigames*, match3* |
| SERVICE13 | wt/service13 · s13-service | src/avodah/*, src/avodah3d.js, src/calendar.js, content/ketoret.json and Phase B's JSON, src/pens.js and src/animals.js (the pens and the lambs); a `// ── service13 ──` fence in index.js/moments.js for Phase A's Beit Avtinas moment if needed. Tests: avodah-*, calendar.test, hooks-avodah, qa-content-scan |

A fence starts with `// ── <agent> ──` and ends with `// ── /<agent> ──`. Only its owner edits inside it, and it stays small. Keep every older fence working. Anything outside your files: ask on the bus with file:line. The supervisor decides.

## The work

**PRODUCER13: the owner's eyes in his testing mode.**
1. **First bus note:** the owner's words above, to everyone.
2. **By 20:30:** every stage in the demo, by touch, on a throwaway merge of the others' branches (wt/peek13, rebuilt every ~40 min).
   - The games that came.
   - The plumb and level at the leveling stages.
   - The course ends: a toast, the beat's frame, the check.
   - The progress sheet per stage (produce-progress13).
   - The machines per site.
   - K80 at every shot.
   - Any side-to-side walk (produce-play `--demoPick` logs his track).
3. **By 21:30:**
   - the new games (חמש אבנים, the torches, the nut tower);
   - פיטום הקטורת;
   - the lambs' chamber;
   - Phase B;
   - `produce-play --stages` on the merge.
4. **By 22:00, the verdict:** docs/PRODUCER-S13.md.
   - Each stage ✓/½/✗.
   - The notes' state.
   - The top 10 for wave 14.
   - ⚑ lines in Hebrew, each with a default.

**SITE13: the world shows the work, and it is full of machines and people** (PRODUCER-S13a #6, #7; N76 b–c; N64).
1. **The progress seen at every stage, like the Mount's course sheet.**
   - **Ezrat Nashim's four corner chambers** (temple.js 272–317; מדות ב, ה): לשכת הנזירים, לשכת דיר העצים, לשכת המצורעים with its pool, and לשכת בית שמניה. They rise one by one in the finish, each named on screen as it rises. They are no longer hidden inside the wall's courses.
   - **The Ulam, the Heichal and the Kodesh:** from their course 5 or 7 on, the picture changes at every course. The finish shows on the building itself: the gold, the vine, the doors, the lintels (with DIRECTOR13, whose camera rises with the building).
   - **The test:** a fixed-camera sheet per stage with a measured change ≥ 3 % per course (test/site_mount_courses.cjs is the model).
2. **Machines and life** ("רק גלגלית אחת ישנה והיא שלי"). At every walled site:
   - **Lifting and hauling:**
     - ≥ 2 lifting machines: his treadwheel and a crew's treadwheel crane (the magnus rota, a wheel walked by men) lifting the crews' stones in view;
     - a shear-legs (a two-legged frame with a pulley);
     - a cart train of ox carts from the quarry;
     - a sledge on rollers;
     - scaffolds that climb.
   - **The crews:** in the ×1 and ×3 frames, working.
   - **At the altar:** by hands and carts of whole stones, with no iron (מדות ג, ד).
   - **Limits:**
     - Illustrations are marked המחשה.
     - ≤ 150 draw calls per phone view: use instancing and the props' batches.
     - PRODUCER-S13a §5 counts one crane in the world today (stages.js:2074).
3. **N76 (b, c):** the karnot's survey on the ramp or the top; the crews near the altar with wooden mallets.
4. **N64:** the corner stone seen on the hook and landing.
5. **Keep green:**
   - site_mount, site_mount_courses, site_api, stages_api*, crews;
   - draw calls.

**DIRECTOR13: the camera at every stage, and every course end seen** (PRODUCER-S13a #3, #4, #9, #10, #11; N76 a).
1. **N79: every course end gets its moment, whoever set the last stone.**
   - The toast, the beat's frame and the check's call.
   - Today state.js:710–716 drops `out.course` from the crews' report, and index.js `applyReport` (≈ 386–402) never handles it. At ×60 the crews end almost every course, so the owner never saw one.
   - At most one beat per course, and none while a game or card is open (it waits).
2. **The frames:**
   - **The course beat at the walled sites:** along the course from outside, 25–30° up, the new course in the middle third, the crane not in front.
   - **The first frame after a pick:** today it is 4–12 px from 425–1,200 amot, twice HIDDEN.
   - **N74:** Ezrat Nashim's dig behind the court wall.
   - **The altar's courses** behind the sovev's plaster.
   - **The Ulam's upper courses:** the camera rises with the building.
   - **The Mount's rocks and first course.**
   - **The test:** K80 ✓ at every work frame of every stage (produce-play `--stages`), and you look at the shots. PRODUCER-S13a §6 lists every bad frame with the good one.
3. **Idle** (#4): he stays at his banker until the player taps or the course changes: ≤ 1 heroReturn per course in a no-touch minute.
4. **The demo's stones** (#11): one payment buys the three segments. At ×60 the crews empty the stock in ~20 s, and the site stops ("חסר אבנים").
5. **N76 (a):** no "חפירה עד הסלע" above the yesod (ui.js:300, :478); the true label.
6. **Keep green:**
   - game-harness, game-flow, game-touch;
   - game-courses-touch parts 1 and 2 (part 1 is 7/9 on v24 too: K80 77 px, and the slot off frame at s3; make them pass);
   - moments --harness.

**GAMES13: the games a boy of that time played, and the level with the needle.**
1. **Three new in-between games**, in the manner of src/games/*: the shell, the how-to, a duel on one phone, the pay, and a sourced fact marked טיוטה at the end.
   - **"חמש אבנים":** knucklebones (astragaloi).
     - The Temple Mount Sifting Project found knucklebones of the Hellenistic and Roman periods in the Mount's soil; the game is the ancestor of today's חמש אבנים (tmsifting.org, 2017).
     - Throw one, pick up the others and catch it, by touch: timing and quick taps. It gets harder each round (ones, twos, threes, fours).
   - **"שמונה אבוקות":** "רבן שמעון בן גמליאל כשהיה שמח שמחת בית השואבה היה נוטל שמונה אבוקות של אור, וזורק אחת ונוטל אחת ואין נוגעות זו בזו" (סוכה נג ע״א).
     - A juggling game of rhythm: torches in the air, tap to catch and throw, from 3 up to 8.
     - At night, in the courts' light.
   - **"מגדל האגוזים":** children played with nuts (the Mishnah's shopkeeper hands out nuts to children, בבא מציעא ד, יב; nuts for the children on Pesach night, פסחים קט ע״א).
     - A roll or flick to topple a tower of nuts (physics: the sling's matter-js).
     - The Roman nut game is an illustration, marked המחשה.
   - **In the quarry's cycle** where they fit, and at the games' table.
2. **The level with the needle** ("המשחק של הפלס עם המחט").
   - Today minigames/index.js:101 cuts the course check to 3 plumb rounds, and CHECK_EVERY is 2 (content.js:173).
   - **Where:** the level (the needle) at:
     - every course end at the Mount;
     - the plaza's paving;
     - Ezrat Nashim's floor;
     - the 15 steps;
     - the altar's top.
     Elsewhere it stays as is. Two level rounds, then the plumb.
   - DIRECTOR13 owns the call at the course's end. You own which game and its rounds.
3. **The sling:**
   - a child's fallback pull in test/sling-touch.cjs (level 6's last target has no solver line);
   - levels 6–10 by touch.
4. **The kiyor's words:** "יציקות נחושת", not "אבנים".
5. **Keep green:**
   - games-touch, games-rules, sling, cycle;
   - minigames, match3.

**SERVICE13: פיטום הקטורת, and the lambs' chamber.**
1. **"פיטום הקטורת"** ("עדיין לדעתי לא נכנס למשחק").
   - **Where:** at Beit Avtinas, where the House's incense was compounded (שקלים ה, א; יומא ג, יא). It is a game in Phase B, and its first time also closes Phase A's chambers stage as a moment if it fits (a `// ── service13 ──` fence).
   - **Weigh:** the eleven spices on the scales, by the baraita's weights (כריתות ו ע״א: הצרי והציפורן והחלבנה והלבונה משקל שבעים שבעים מנה…; מור וקציעה שבולת נרד וכרכום ששה עשר…; הקושט שנים עשר; קילופה שלשה; קנמון תשעה).
     - Quote only what you verify on Sefaria. Mark each line טיוטה.
     - The Name must not appear. The baraita has none; check.
   - **Grind:** to "הדק היטב, היטב הדק" ("מפני שהקול יפה לבשמים", כריתות ו ע״ב) as a rhythm game.
   - **The year's 368 manim:** 365 for the days and 3 for the High Priest's handfuls on Yom Kippur (כריתות ו ע״א).
     - The stock the player made feeds Phase B's daily ketoret: half a maneh in the morning, half in the evening.
     - It is shown in Phase B's home.
     - It is never a punishment when low: a gentle invitation.
   - content/ketoret.json exists: read it first.
2. **The lambs' chamber and the pens** (the owner's first idea; a first slice).
   - **The lambs' chamber** (לשכת הטלאים, מדות א, ו; תמיד ג, ג) holds ≥ 6 inspected lambs (ערכין ב, ה).
   - **Check a lamb for blemishes** before it enters: a gentle look game, no blood.
   - **Water and feed** at the pens (src/pens.js exists as scenery).
   - **The day's need comes from the calendar** (src/calendar.js):
     - the two tamid lambs;
     - Shabbat's musaf;
     - Rosh Chodesh;
     - the festivals: Sukkot's bulls, 13 → 7.
   - **Tomorrow's need is shown in Phase B's home.**
   - **Limits:** no gambling, no guilt. A day not tended costs nothing; the lambs are always cared for.
3. **Keep green:**
   - avodah-harness, avodah-*.test, calendar.test, hooks-avodah;
   - qa-content-scan.

## At the hard stop (22:10 UTC)
- **Your branch:**
  - everything is committed;
  - it builds;
  - your tests are green, or each failure is explained;
  - `git merge-tree --write-tree master s13-<you>` is clean.
- **Your final message** is your report:
  - what you built, by file:line;
  - the real-touch results;
  - the screenshots you looked at;
  - the bundle delta;
  - ⚑ lines in Hebrew, each with a default;
  - requests, as file:line.
  - Under 700 words.
