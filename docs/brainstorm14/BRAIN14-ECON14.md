# BRAIN14-ECON14: the coins, the shop, the strike (ECON14, 1.10)

All player Hebrew is טיוטה. Verified 1.10 (Sefaria; Whiston): עזרא ח, לד · שקלים ד, ב · שקלים ה, ב · Ant. 20.220.

## 1. Five new jobs (not in §4)

| # | Job | Gesture | The kohen in 3D · what stays | Stages | Source | Why she likes it | Effort |
|---|---|---|---|---|---|---|---|
| E1 | **מאזני הזהב** | drag weights onto the pan until the needle stands straight | weighs the gold with the treasurer; the plates shine on the doors | gates, ulam, heichal, kodesh | עזרא ח, לד: "במספר במשקל לכל" (never quote verse 33) | a balance that wobbles, a sum to find, the owner's needle | S |
| E2 | **אמת המים** | tap a channel stone to turn it until the water runs | lays the stone channel with a crew; water glints in it, and fills the laver | har (finish), kiyor | משנה שקלים ד, ב ("ואמת המים... באין משירי הלשכה") | the pipe puzzle kids love, then rushing water | M |
| E3 | **השוורים שלי** | hold to brake downhill, let go uphill | drives the ox cart from the quarry with the next segment; her named pair walks the road ever after | every stage after har | יוספוס, קדמוניות היהודים 15.11.2 (the thousand wagons; in ROUTES) | a pet she names, and driving; the shop's oxen become a toy (unbought: a crew's pair, no paywall) | M |
| E4 | **זריקת המילוי** | flick small stones into the glowing hollows | tosses the fill behind the retaining wall; the Mount's fill rises | har, wall | המחשה | flick-to-throw, a gesture no job has | M |
| E5 | **קורה לשקע** | turn the beam's end with a dial, then push: click | sets the cedar beams in their sockets with a partner; the ceiling stays | lishka, nashim, heichal, kodesh | המחשה (priests learned carpentry: STORY, 15.11.2) | shape-fitting, a loud click | S–M |

VOTE | gold-scales | מאזני הזהב | שוקלים את הזהב לציפוי הדלתות: גוררים משקולות לכף המאזניים עד שהמחוג עומד ישר | גרירת משקולות | השערים, האולם וההיכל | עזרא ח, לד
VOTE | aqueduct | אמת המים | מסובבים אבני תעלה עד שהמים זורמים מהמעיין אל המקדש, ורואים אותם רצים בתעלה | הקשה מסובבת | הר הבית והכיור | משנה שקלים ד, ב
VOTE | my-oxen | השוורים שלי | נותנים שמות לזוג שוורים ומובילים איתם עגלת אבנים מהמחצבה: בירידה בולמים, בעלייה משחררים | לחיצה ושחרור | בכל שלב אחרי ההר | יוספוס, קדמוניות היהודים 15.11.2
VOTE | fill-flick | זריקת המילוי | זורקים בהעפה אבנים קטנות אל החורים שמאחורי החומה, עד שהרחבה של ההר מתמלאת ועולה | העפה באצבע | הר הבית והחומה | המחשה
VOTE | beam-socket | קורה לשקע | מסובבים את קצה קורת הארז עד שהיא מתאימה לחור בקיר, ודוחפים פנימה: קליק! | סיבוב ודחיפה | הלשכות, עזרת הנשים וההיכל | המחשה

## 2. My top 6 (for her)

1. **A6 שפשף עד שיבריק**: pure joy, S, and the gold stays on four stages.
2. **B3 סיד על המזבח**: colouring-in; the altar's four stages get a second verb.
3. **B1 ניסור**: a new rhythm gesture, 8 cedar finishes; a parent can join the saw.
4. **B8 קשת על פיגום**: the "wow" at har, the first stage, where she decides to stay.
5. **E2 אמת המים**: depth, three natural levels, and the generator is its own solver.
6. **B9 גפן הזהב**: decorating with her name, the bridge from the coins to the House.

## 3. Three cuts

- **B7 קנה המידה**: tap-tap-tap along a line and count to 83: the strike's chore in costume, plus homework.
- **B11 רפסודות**: travel, not building; it overlaps מרוץ הכבש, and skill that shortens caravans muddles the economy.
- **A3 גזית**: a new gesture for the very job she runs from ("חוץ מלחצוב אבנים"). Keep it in lishka's moment.

## 4. My lens

**One coin.** The silver becomes the coins, **"שקלים"** on screen (the key stays `silver`; match3 already draws a shekel). Two currencies beside six materials would lose an 8-year-old, and silver lacks a sink (PLAYTEST-S6: "silver piles up").
- **Never stuck:** when a survey or dig lacks only silver, the treasurer pays the rest ("הגזבר שילם מקופת המקדש"; the גזברים, שקלים ה, ב). The shop never blocks building (~10 lines, state.js).
- **Paid at once:** "did but labor for a single hour, he received his pay immediately" (Ant. 20.220): coins at each job's end.

**Pay: coins = stars × (level + 2).** One rule for everything:

| | ★ | ★★ | ★★★ |
|---|---|---|---|
| קל (L1, checks) | 3 | 6 | 9 |
| בינוני (L2, corner stone) | 4 | 8 | 12 |
| קשה (L3, great stone, lintel) | 5 | 10 | 15 |

- Stars = the frame's tier, at least ★ (failing is kind); a skip pays 3. Course end +5; the stage's moment ×2 on top of REWARD, shown big; five perfect strikes in a row +1 (≤ 5 a course).
- The two cards of "מה נעשה עכשיו?" read "עד 15 שקלים": harder pays more, so the choice has a reason.
- ≈ 40 a course, ≈ 5,000 over Phase A, against ≈ 2,900 of today's sinks: the shop takes the rest (game-sim tunes it).
- In-between games unchanged: a job earns 2–5× more a minute (the escape rate).

**Purse and flight.** The silver chip becomes a purse in the top corner (44 px; it opens the shop). Each star bursts into coins: ≤ 12 sprites arc to the purse, each clink a step higher; it bumps and counts up. ≤ 1.2 s, a tap skips.

**The shop, "השוק"** (המחשה; shops lined the Herodian street below the Mount). Two cards a row: picture, name, price on a coin, one button. Prices fixed forever.

| Card | What she sees | Price |
|---|---|---|
| **האבן שלי** | she draws her mark; the crane sets that stone in this course; later "מצא את האבנים שלך" | 25, one a stage |
| **נר חרס** | a Herodian lamp at her banker, lit at dusk (up to 6) | 30 |
| **צמד שוורים** | a pair she names, on the road and in E3 (= UPGRADES.carts) | 60/150/300 |
| **גלגל הדריכה** | one more walker in the wheel: crews set faster (= .crane) | 80/200/400 |
| **כלי הסתתים** | new hammer and chisel in his hands (= .tools) | 60/160/320 |
| **כלי הלויים** | joins the music at once (music.js mixes kinnor, nevel, chalil, tziltzal, trumpets); a Levite plays it on the 15 steps | כינור 40 · חליל 40 · נבל 60 · צלצל 60 · חצוצרה 100 |
| **נדבה לגפן** | leaf, grape or cluster with her name in the donors' book; hung with the Ulam's גפן הזהב (setVine) | 15/30/60 |

- **A set:** the Levites' minimum, 2 נבלים, 2 חלילים, 2 חצוצרות, 9 כנורות, one צלצל (ערכין ב, ג; ב, ה; verified in the repo, content/avodah_fallbacks.json). Complete: "הדוכן שלם", the Levites play the whole song once.
- **"המטרה שלי":** she pins one card; a ring on the purse fills toward it. No timer, no nag.
- **First purchase, minutes 5–8:** she starts with 60; at the first course end the mentor says once "יש לך מספיק לאבן עם הסימן שלך"; she draws, buys, and the crane sets it.
- **Rules:** nothing random, no sales, no timers. A shortfall reads "עוד 12", a goal, not a scold. Closed on Shabbat and Yom Tov, like the kings; nothing is lost. ≈ 18 KB in all.

**The strike (§7).** The ring starts at the impact and meets the target at the beat: 0.46 s, a flash (index.js 1149). The ±0.22-s window covers half of it: the timing is generous, but it can't be read.
1. **A bar, not a ring** (my pick until her vote; no votes yet): a vertical pill beside the stone, a small hammer climbing it as the kohen raises his, a gold top (the honest window). A marker in a zone reads at a glance; shrinking circles don't, and they hide the stone. The ring stays as a setting for PRODUCER14's touch test.
2. **The ear:** the music already beats one swing (music.js, 69.8): two ticks on the climb, the tof's dum at the beat.
3. **Teach once:** on the first stone after the tutorial, the kohen holds the hammer up and the beat comes slowly (2.0 s, 1.4, then 0.86); a hand taps with the gold: "הקש כשהפטיש בזהב"; after 5 tries it moves on. runJob: `hero.beat = swingAt + (teach ? T : RHYTHM.cycle)`, ~20 lines.
4. **Feedback:** a tick stays where she tapped: "מוקדם" below the gold, "מאוחר" after, "מדויק!" in it, with a gold burst and the stone jumping a dressing state. Words for the first 8 misses only; the combo reads "3 ברצף!" (no "×1.5").

## Response

*(06:00 UTC, after FUN14, GAMES14, SITE14 and HISTORY14, and their Responses. VOTES14: only אבא, 👍 on the machines, the vine, the instruments, the tools and the mark; nothing yet on the oxen, the lamps or ring vs. bar.)*

**Merge:**
- **אמת המים** (my E2, GAMES N2, HISTORY H3): one `pipes.js`, and it runs in today's tap-only frame. My שקלים ד, ב ✓ (Sefaria) is its second source: the aqueduct was paid from the Temple's funds ("באין משירי הלשכה").
- **ממלאים את הסוללה** (FUN F2 with my E4) and **כלונסות הארז** (SITE N2, with GAMES' two thumbs): I drop E4 and E5 as separate jobs. E1 (the scales) waits for wave 15, behind A6.
- **FUN's rules, taken whole:** stars pay coins, not work; the floor is done = ★, q ≥ .7 = ★★, q ≥ .9 = ★★★; a free tap pays no coins. So I drop my "+1 per 5 perfect strikes". The strike pays only through FUN's "סתת בקצב" card, at L1 (3/6/9).
- **Re-based on FUN's J (≈ 10 jobs a stage):** ≈ 150–180 a stage, ≈ 15 a minute. Early on she can afford something new every ~5 minutes (25 · 30 · 60 · 80), and the third crane level in about half an hour. Three ★★★ raise a job's level, so the card's cap climbs from "עד 9" to "עד 15": she sees mastery pay.
- **The words:** her own word wins, "מטבעות", written in sentences (FUN). The coin is a "שקל כסף", drawn as a coin with a number. The first pay's card quotes "ויתנו כסף לחצבים ולחרשים" (עזרא ג, ז ✓ Sefaria, no Name in the verse; HISTORY's find).
- **The shop's name:** HISTORY's **"אוצר המלאכה"** (עזרא ב, סט ✓ Sefaria, no Name in the verse) replaces my "השוק". A child reads "אוצר" as treasure, and everything bought goes into the building. Quote only "ככחם נתנו לאוצר המלאכה", never 2:68.
- **The vine:** the B9 job (GAMES' `place.js`) is where her donated leaves get hung. The shop fills the tray with her named gifts.

**Disagree:**
- **B8:** I take it out of my top 6. It goes to wave 15 (SITE: nothing stays in view; GAMES: Robinson's Arch is modeled). Its place goes to **מקימים עמוד**: har, four agents, an instanced payoff.
- **The oxen and the lamps** got no vote. Build them last, and cut them if she doesn't pick them.

**Build first (mine), in order:**
1. `PAY` in content.js: one rule, stars × (level + 2). Then `S.payJob`, the purse and the flight, landing with FUN's first job. About 4 KB, with a node test.
2. The strike bar: the slow teach and the early/late ticks, for the free strike and the "סתת בקצב" card. The ring stays as a setting. About 3 KB.
3. "אוצר המלאכה", in this order:
   - the machines (UPGRADES re-skinned: the hammer, the treadwheel's walkers, the ox carts);
   - האבן שלי (the first purchase, with a small draw pad);
   - the instruments (music.js mix gains);
   - the vine donations.
   About 12 KB.
4. The treasurer net, and "המטרה שלי". game-sim checks the totals.

**On the JOINT (06:05), one disagreement:** har, her first ten minutes and the stage where she decides to stay, has no craft card in Part 1. Its four cards (crane, F1, strike, quarry) are all stone work, so the deal's "one stone + one craft" fails right there. Promote **אמת המים** to Part 1 as har's craft card:
- it runs on today's tap-only frame, with no wait for the drag channel;
- three agents proposed it;
- both its sources are ✓ (שקלים ד, ב · יומא לא ע״א).

I can build pipes.js (≈ 8 KB) right after the purse, if the shop's oxen and lamps (no votes) wait for wave 15.
