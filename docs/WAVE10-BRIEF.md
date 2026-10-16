# Wave 10: the producer's eye, Middot that pays, classic games, two kohanim

2026-09-28. Start 20:25 UTC. Plans on the bus by 20:45. Feature freeze 22:50 UTC. Hard stop 23:05 UTC (02:05 Jerusalem).

## First: a message from the owner, for every agent
> "קודם כל אתה נהדר. והסוכנים גם. תעביר המסר שאנחנו מאוד מרוצים מהם. ושימשיכו ככה ויגדילו ראש!!" (Yaron, 28.9 21:33)

He is very pleased with your work. Keep going like this, and take initiative: when you see something a player would trip on,
fix it or post it, even if it is not on your list.

## Where we are
- **v19 is published** (master 7d757ab). It fixes what the owner found in v18 tonight. PROJECT.md §8 "v19" has the details:
  - the whole-Temple view kept its plaza;
  - the chapter's yellow wash: a one-argument `smooth` shadowed util's `smooth(e0, e1, x)` in createStages, since renamed
    `ease01`. **Never shadow an imported helper**;
  - the builder in the Mount's courses: `keepAtWork`, `keepInFrame`, `hero.atXZ`, and his stone goes with him to his current
    banker.
- **His words tonight** (Jerusalem time) — keep the Hebrew:
  - 21:16: "בשלב שעובר ליסוד המזבח יש יותר מדי אור צהוב" → fixed in v19.
  - 21:42: "בשלב שיטוח ההר נדבך 5 השחקן נעלם" and 21:46: "גם בשלב נדבך 1 הדמות של השחקן נעלמת. והחץ במקום אחר" and 21:57:
    "גם בנדבך 2 שיטוח ההר הדמות רחוקה מהאתר. תקועה וללא זזה לא רואים אותה והאבן המסותת במצאת באוויר" → v19 fixed the builder
    left behind and the floating stone. **Still open** (see FLOW10).
  - 21:33, the requests this wave answers:
    - "לגבי מסכת מידות - אפשר שכל מי שנכנס ולמד פרק עושה מבחן קצר ומקבל על זה נקודות ובסוף מבחן מסכם ומקבל הרבה נקודות שיהיה
      מוטיבציה ללמוד בכיף. חוץ מזה - שכל שם של מקום שכתוב במסכת מידות שיהיה קישור בלחצן איפה זה בעולם שיפנה למקום של זה באתר."
    - "לגבי המשחקונים - כרגע המשחק היחיד שיש לנו חוץ ממשחקוני הביניים ... הוא הקנדי קראש והוא טוב. אבל צריך חוץ ממנו עוד כמה
      משחקוני ביניים קלאסיים שישאירו את השחקן עוד כמה דקות במשחק."
    - "בשלב הבא ... נרצה לשלב כמה שחקנים ביחד במשחק אחד משני מכשירים שונים שיהיו שני כהנים שיבנו ביחד ואולי יתחרו זה בזה באיכות
      ובמהירות העבודה. ואז אפשר יהיה לשלב משחקי תחרות ביניהם. יש אפליקציה לילדים שלי בנייד שנקראת 2 3 4 player games ויש שם
      קרוב ל20 משחקים קלאסיים שאפשר ל"הלביש" על העולם שלנו, כמו שעשינו בקנדי קראש."
    - "נבנה סוכן שידרבן את שאר הסוכנים" → at 21:42 he approved a **producer** agent who plays each build by touch the way he
      does and returns precise notes ("סוכן מפיק שמשחק ומעיר - מצוין").

## Rules
The rules of docs/WAVE6-BRIEF.md, WAVE8B-BRIEF.md and WAVE9-BRIEF.md apply in full:
- every text is a draft marked טיוטה, with its exact source;
- never write the Name, not even in code or tests (use ה׳ / אלקינו);
- no gore;
- no gambling, loot boxes, purchases or guilt;
- Shabbat and Yom Tov never break a streak;
- Hebrew RTL, phone portrait first, 44-px targets;
- **no paid services**.

**Testing:** real touch at 390×844, no autoplay flags. Take screenshots and look at each one.

**Usage economy.** The account's usage limit stopped every long wave so far:
- **commit every 15 minutes**;
- read big files by ranges;
- keep your outputs short;
- no sub-agents.

**The machine has 2 cores.** Wrap every browser run in `flock -w 1500 /home/claude/wt/bus/.browser.lock <command>`, so only one
SwiftShader browser runs at a time. Keep each run under 8 minutes: split long plays into parts.

**Never shadow an imported helper** (`smooth`, `clamp`, `lerp`…) inside a module's closure. `node test/qa-content-scan.cjs` must
stay green.

## The bus
- It lives at /home/claude/wt/bus/, with a notes file per agent: bus/<AGENT>.md. Wave 9's notes are in bus/w9/ (read-only).
- Post your plan by 20:45 UTC, then an update every 40 minutes.
- For **PRODUCER10's notes**, bus/PRODUCER10.md is the inbox. Each note says:
  - the owner (FLOW10, MIDDOT10, GAMES10, NET10);
  - the severity (P0 stops play, P1 the owner would notice, P2 polish);
  - the screenshot path.
  Owners answer under the note: fixed at <sha>, or why not.

## The five agents
| agent | worktree · branch | owns |
|---|---|---|
| PRODUCER10 | wt/producer10 · s10-producer | new test/produce-*.cjs, new docs/PRODUCER-S10.md, bus/PRODUCER10.md. Reads everything and plays every branch; changes no game code |
| FLOW10 | wt/flow10 · s10-flow | src/game/state.js, index.js (except the `// ── middot10 ──` fence), content.js, ui.js (except the fences below), ui.css.js, moments.js, facts.js; main.js `// ── build* ──`. **This wave also the Mount's staging in src/stages.js**: harBay, harCranePose, wallView, workSpot/nextSlot/nextWorkIdx for 'har', the courses' camera. Tests: test/game-*.{cjs,mjs}, site_mount.cjs, moments.cjs |
| MIDDOT10 | wt/middot10 · s10-middot | src/game/middot.js, new src/game/middot-quiz.js + middot-ui.js (+ their CSS), new content/middot-quiz.json; a `// ── middot10 ──` fence in index.js (the api's showPlace) and in ui.js (the book sheet's hook) |
| GAMES10 | wt/games10 · s10-games | new src/games/* (the classic games and the duel mode on one phone); a `// ── games10 ──` fence in main.js (gameParts) and in ui.js (the menu entry). Tests: new test/games-touch.cjs |
| NET10 | wt/net10 · s10-net | new src/net/* (two devices); a `// ── net10 ──` fence in main.js. Tests: new test/net-*.cjs (two pages, a mock transport) |

A fence is a block that starts with `// ── <agent> ──` and ends with `// ── /<agent> ──`. Only its owner edits inside it. FLOW10
does not touch the others' fences in index.js and ui.js. A fence's owner keeps it small: a hook, not a feature.

## The work

**PRODUCER10 — the owner's eyes (new).** You play; you do not code the game.
1. **Pass on the owner's message** (above) in your first bus note, to everyone.
2. **By 21:00 UTC, the baseline.** Play v19 (master) the way the owner does, on a fresh profile, in the regular game, not the
   demo:
   - the opening;
   - the survey;
   - the 12 rocks;
   - the courses from the great stone to course 3;
   - the course check (בדיקת הנדבכים: האנך);
   - the corner stone;
   - the quarry board.
   At each step, ask:
   - Can I see my kohen?
   - Do I know what to tap?
   - Does the stone go where I see it go?
   - Is anything floating, flickering, stuck, too yellow, too dark, or zoomed too far?
   Seed: the supervisor's v19 replay harness is test/produce-courses.cjs (it logs the builder's screen
   position, the banker and the camera's last flights). Make it yours.
3. **From 21:00:** review each agent's branch by touch every 40 minutes (build it in their worktree, read-only), and post notes.
4. **By 22:40, the verdict.** Write docs/PRODUCER-S10.md: every owner note of 28.9 ✓/✗ with evidence, the new features as a
   first-time player meets them, and your top-10 list for the next wave.

**FLOW10 — the courses, clean.**
1. **The open items from tonight** (v19's replay: scratchpad notes in PROJECT.md §8 v19):
   - **The banker flips.** In the courses, the builder's banker (workSpot('har','dress')) flips between the bay's floor
     (x ≈ 263, y −64) and a ledge above it (x ≈ 281, y −49) every stone or two. The builder now follows it, walking up and down.
     The flip is not the slot normal (that was tried; the crane pose is not the cause). Find who sets `st.piles` or the crane's
     pose besides harCranePose: `syncCrane` → `setCraneSite`, the crews, deliverKeyStone. Make the banker stay in the bay.
   - **The first player slot above the bay floor** (SITE9's note, site_mount 7/8: slot y −124).
   - **The course check** (בדיקת הנדבכים: האנך, around course 5): frame the builder with his plumb. The owner: "נדבך 5 השחקן
     נעלם".
   - **The corner stone seen landing** on the hook.
   - **The stale coach line** "הקש כדי למדוד את ההר" must not linger into the courses.
   - **The demo chips** at 44 px.
2. **Take PRODUCER10's notes first.** Every P0 is fixed the same hour.
3. **Keep green:** game-harness, game-flow, game-touch, site_mount (8/8 when the slot is fixed), moments --harness, and the node
   tests.

**MIDDOT10 — learning that pays, and every place a door to the world.**
1. **A short quiz after each chapter studied.** Middot has 5 chapters.
   - A chapter counts as studied when its mishnayot were opened in the book.
   - 3–5 questions per chapter, multiple choice. Each question has a source (משנה מדות x, y), an explanation, and is a draft
     (טיוטה). You may reuse the questions in content.js (e.g. q7).
   - Points for the quiz. A **final test** (סיום המסכת) over all 5 chapters, worth many points.
   - The points live in `G.book` (e.g. `G.book.pts`, `G.book.quiz[ch]`). Show them in the book, and give a gentle reward the game
     already has (silver, a find, or a title), no purchases.
   - Retakes are allowed; the best score counts; nothing is lost.
2. **"איפה זה בעולם" on every place name.** Every place named in a mishna's text is a tappable link (e.g. בית המוקד, שער ניקנור,
   לשכת הגזית, הדוכן, הכיור, המזבח). It flies the camera to that place in the world and shows its info card.
   - Map the names to src/places.js and src/info.js (38 places), guarded. A name with no place stays plain text.
   - The per-mishna `focus` button stays.
   - The flight goes through the game api: `showPlace(key)` in your index.js fence, using `view.lookAt` or the world's focus.
3. **Tests:** a node test over the quiz data (every question has a source and one right answer, and no Name letters), and a
   touch check (open the book, tap a place name, the camera flies, take the quiz, points appear).

**GAMES10 — classic in-between games, dressed in our world.**
1. **Three classic games, dressed in the Temple's world** like the board (src/match3/*): the same look, Hebrew RTL, 44-px
   targets, a one-screen how-to, a short true fact at the end (טיוטה + source).
   - Proposals; choose and post by 20:45:
     - ארבע בשורה with the wall's stones;
     - זיכרון of the vessels (the Menorah, the Table, the Kiyor…);
     - the kohanim's race up the ramp (Yoma 2:1–2, told without its injury: only that they raced and then drew lots);
     - a stacking game of the courses;
     - a tap-rhythm game of the Levites' song.
   - 1–3 minutes each. No fail screens that shame, no timers that punish, no loot.
2. **The duel mode on one phone** (the owner's children's "2 3 4 Player Games"): each game playable by two on one phone, each
   player at their end of the screen (the top half rotated 180°), with big buttons, and a friendly result ("שני הכהנים זריזים").
3. **Entry:**
   - a "משחקי ביניים" section in the menu (your ui.js fence);
   - a between-stages invitation, at most once a day, never during the FTUE.
   Their rewards feed the same resources as the board (small).
4. **Tests:** test/games-touch.cjs plays each game and each duel by touch at 390×844.

**NET10 — two kohanim, two devices (a working prototype).**
- **The platform.** The game is a claude.ai artifact. Its runtime offers:
  - `room`: live presence and moments between everyone who has the page open now;
  - `db`: a realtime shared document store.
  Both work only between viewers of the same Claude account or organization, and only in the published artifact. That fits the
  owner's family on his account; a public release would need a server later.
- **The runtime's contract.** The type definitions are extracted at
  /tmp/claude-0/bundled-skills/2.1.283/dc22fdae9a9d3c1d1e5015612a5edfdd/artifact-capabilities/0.2.47/:
  - read `claude.d.ts`, `room.d.ts`, `db.d.ts` and `user.d.ts`;
  - `const room = await claude.use('room')` resolves `null` when unavailable, so the game must work alone.
1. **"כהנים יחד"**, a mode where two players build the same site:
   - each sees the other's kohen (a second builder or a named crew member, with a name plate), where he works and his strikes;
   - the stones set by either count for both;
   - a friendly race on quality (perfect strikes) and speed (stones per minute), shown gently, with no stakes.
   Presence carries the kohen's spot and action. Shared progress lives in one db doc per game.
2. **A transport interface** with two implementations:
   - the artifact's room + db;
   - a local mock (BroadcastChannel), so two Playwright pages in one browser can play together in the test.
3. **Tests:** test/net-together.cjs, two pages by touch: both kohanim visible to each other, and the count shared.
4. **Post the capabilities the page must declare** (e.g. `{room: {}, db: {}, user: {}}`) for the supervisor's publish.

## At the hard stop (23:05 UTC)
- **Your branch:**
  - everything is committed;
  - it builds;
  - your tests are green, or each failure is explained;
  - `git merge-tree --write-tree master s10-<you>` is clean.
- **Your final message** is your report:
  - what you built, by file;
  - the real-touch results;
  - the screenshots (you looked at them);
  - the bundle delta (budget 3 MB);
  - ⚑ lines in Hebrew, each with a default;
  - requests, as file:line.
