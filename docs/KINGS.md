# KINGS — trade and diplomacy with the kings of the nations (wave 6, DRAFT)

> The daughter's idea, adopted by the owner: "ושיהיה אופציה לדבר עם מלכי אומות העולם ולעשות איתם עסקים", with a
> resource meter that the player spends to advance any stage. KINGS is one of the three sources that fill the meter
> (the match-3 before each step, the crews over time, and the kings' voyages over hours).
> Every text is a draft ("טיוטה") with its source; dialogue is dramatization ("המחשה"); ⚑ marks an illustration choice
> for the owner.

## בקצרה, לבעלים (טיוטה)
- **מה זה:** כפתור "מלכים" פותח מפה מצוירת של הים הגדול והארצות שסביבו, ועליה חמש חצרות: סוחרי צור וצידון (ארזים), אוגוסטוס
  קיסר (נחושת קפריסין), הילני המלכה ומונבז המלך (זהב במתנה), ניקנור מאלכסנדריה (הדלתות), וסוחרי הנבטים מפטרה (⚑ המחשה).
- **איך משחקים:** בוחרים חצר, קוראים שתיים־שלוש שורות (המחשה), בוחרים הצעה עם שיקול אמיתי (מהר ויקר או לאט וזול, קטן או גדול),
  חותמים בחותם שעווה. הספינה או השיירה יוצאת בזמן אמת (3 דקות עד 6 שעות), עוגנת ביפו או בעכו, העגלות עולות לירושלים,
  והמטען מחכה במחסן עד שפורקים אותו למד.
- **למה לחזור:** מסעות שנגמרים כשלא משחקים, יחסים עם כל חצר (4 רמות: הצעות חדשות, הנחה, ספינות מהירות), חותם לכל חצר,
  5 איגרות, וסיפורים שמסופרים מראש: הסערה של ניקנור (בבלי יומא לח, א).
- **כללים:** אין הימורים, אין קופסאות הפתעה, אין קניות, אין הפסד: מטען שהגיע מחכה לעולם. בשבת וביום טוב צופים וקוראים,
  ועסקים ופריקה ממתינים למוצאי שבת. כל טקסט הוא טיוטה עם מקור. הדיוקנאות מסוגננים, בלי סמלי עבודה זרה.

## 1. The loop in one paragraph
Open "מלכי האומות" from the dock. A hand-drawn chart of the Great Sea and the lands around it shows five courts. Tap
one: a stylized portrait, 2–3 short dramatized lines, and two to five offers, each a real trade-off. Sign a contract
(a wax seal presses onto it) and a ship, a caravan or a messenger sets out on the chart in real time: minutes to hours.
It lands at Jaffa (Akko for Nikanor), carts climb to Jerusalem, and the cargo waits at the storehouse until you unload it
(one tap; the crates fly into the meter). Each cargo raises the relationship with that court; levels unlock better
offers and letters; the first cargo from each court gives its seal. Nothing is random, nothing is ever lost, and there
is nothing to buy.

## 2. The partners (sources; CONTENT verifies in docs/SOURCES-S6.md)
| id | court | gives | wants | route (chart) | sources / status |
|---|---|---|---|---|---|
| `tyre` | סוחרי צור וצידון | cedar | silver | Tyre → rafts along the coast → Jaffa → carts | Ezra 3:7 (Return era: paid in food, drink and oil); Middot 3:8 (cedar beams between the Heichal's and the Ulam's walls: cedar in Herod's House is sourced). The deal in Herod's time is an analogy **⚑**; the game pays in silver and says so |
| `rome` | אוגוסטוס קיסר | copper ("נחושת", BUILD's `bronze`) | a one-time gift, then shipping only | embassy Jaffa ⇄ Rome; then Cyprus → Jaffa | Ant. 16.4.5 (§128): Herod gave 300 talents; Caesar gave him half the revenue of the Cyprus copper mines and the care of the other half. That the copper went to the Temple is illustration **⚑**; the gift is scaled down |
| `adiabene` | הילני המלכה ומונבז המלך | gold, as gifts | nothing: a letter on the building's progress | letter to Adiabene, the caravan back via Palmyra and Damascus | Yoma 3:10 (Monbaz's gold handles for the Yom Kippur vessels; Helena's golden chandelier over the Heichal's entrance); Ant. 20.2–4 (Helena's conversion, 20.2.3 §35; Monbaz's, 20.4.1 §75; Helena's grain and figs in the famine, 20.2.5); Bava Batra 11a (Monbaz: "my fathers stored below, I store above"); Yoma 37b (the chandelier's sparks at sunrise, the time of Shema). They lived two generations after Herod: the game brings generations together **⚑** |
| `nikanor` | ניקנור מאלכסנדריה | the bronze doors (an item) + bronze | only the carts from Akko | Alexandria → sea (the storm) → Akko → carts | Yoma 38a (the storm, one door thrown in, Nikanor embraces the other, the sea calms, the door surfaces at Akko); Middot 2:3 (his gates were not gilded); the Nikanor ossuary (Mount Scopus 1902, British Museum). A one-time quest |
| `petra` | סוחרי הנבטים מפטרה | gold | silver | caravan Petra → the King's Highway → Jericho → Jerusalem | Strabo 16.4.21–24 (Petra; camel traders carried aromatics to the coast). They sold aromatics, not gold: the gold line is illustration **⚑**; no king is named |
| event | מרקוס אגריפס בירושלים | +2 relationship with Rome, a letter | — | — | Ant. 16.2.1 (§12–15): Herod's guest; offered a hecatomb and feasted the people. It happens with the first copper under the treaty |

Content rules kept: no Divine Name anywhere (tests scan data.js); portraits are stylized, no likeness claimed, no cult
symbols (no laurel wreath, no eagle, no idols, no divine titles); the Adiabene gifts never carry a price; the Nikanor
storm is told in advance ("כך מסופר") and always ends the same way.

## 3. Offers and numbers (one `TUNE` table: `K.tune({cost, yield, time})`)
BUILD's silver income is ≈ 120–200 a day. A deal costs 5–120 silver; voyages run 3 min – 5 h (demo ×60).

| offer | gives | cost | time | unlock | the trade-off |
|---|---|---|---|---|---|
| tyre_taste | 60 cedar | 5 | 3 min | first deal only | learn the loop inside the first session |
| tyre_raft | 80 cedar | 15 | 45 min | — | cheap, slow |
| tyre_fast | 80 cedar | 30 | 15 min | — | same cargo, ⅓ the time, 2× the price |
| tyre_bulk | 240 cedar | 40 | 3 h | level 1 | cheapest per beam, long |
| rome_market | 50 bronze | 30 | 1 h | until the treaty | full price |
| rome_embassy | 60 bronze + the treaty | 120 | 4 h | once | a big gift now, copper at shipping cost forever |
| rome_mines | 120 bronze | 20 | 1.5 h | the treaty | ≈ 3.6× cheaper than the market |
| adi_first | 40 gold | gift | 2 h | the Mount levelled (`har`) | a letter, a gift |
| adi_monbaz | 80 gold | gift | 3 h | the altar complete (`karnot`) | Monbaz's handles |
| adi_helena | 120 gold + the chandelier | gift | 4 h | the Ulam built (`ulam`) | Helena's chandelier |
| nik_doors | 150 bronze + the doors | 20 | 5 h | the Nikanor gate reached | the storm (told), Akko |
| petra_small | 30 gold | 35 | 2 h | — | small |
| petra_big | 100 gold | 100 | 4 h | level 1 | bulk |

**Relationship** per court: points = 1 per cargo (special deals 2–4). Levels at 2 / 5 / 9 / 14 points: זרים → מכרים →
ידידים → ידידים קרובים → נאמנים. Level 1 unlocks the bigger offers; level 2 = −15% on prices; level 4 = voyages ¼ faster;
**One voyage per court at a time** (a commitment: the long cheap one or
the short dear one), five courts in parallel.

## 4. Screens (phone portrait 390×844, RTL, 44-px targets, light and dark)
- **The chart** (top 300 px): a log-azimuthal "fisheye" on Jerusalem, so Rome and Adiabene fit while Tyre, Akko, Jaffa
  and Jerusalem stay apart; coasts, Cyprus, Crete, the Nile, Jordan, Euphrates and Tigris, the Dead Sea; sea routes
  dashed, caravan roads dotted, carts; court pins (a ring pulses when a cargo waits); ships, carts, camels and a
  messenger move on their legs; far ships show their timer. Below it: news ("סערה בים!"), Shabbat, and one row per court
  (seal, name, status and timer, relationship pips; an arrived cargo shows "פרוק").
- **A court**: portrait, who, relationship and what the next level gives; the dramatized lines ("המחשה · טיוטה"); the
  voyage in progress (a bar, the ETA); the offers ("נחוץ עכשיו" when it covers BUILD's shortfall;
  "⚑ המחשה" where illustrative; the reason when closed: busy, lacking silver, a level, a milestone, Shabbat, done); the
  sources with their references. Offers are ordered: what you can do now and need, what you can do, locked, done.
- **The port beat**: when a ship docks at Jaffa (Akko) while the chart is open, FUN's `cart` sound; the ship becomes a cart on
  the chart and the court's row says "בעגלות מיפו".
- **The contract**: what you give, what you get, the route, the time, the known events (the storm),
  ⚑ notes; "חתום ושלח" presses the court's seal, then the chart shows the departure.
- **The arrival beat**: crates, the amounts; "פרוק למחסן" → the crates fly to the meter (BUILD's chips via
  `ctx.target(res)`), the relationship pips, "רמה חדשה" and what it opened, a new seal pressed, new letters to read.
- **Letters & seals**: each court's seal is pressed in wax on its chart row with the first cargo (a dashed outline before);
  5 letters (the storm and Akko, Monbaz's words, Helena's chandelier, Agrippa's visit), each read at the arrival or the news line and kept in its court.

## 5. Hooks and ethics
A reason to come back (a voyage finishing while you are away, a told event on the way, an arrival beat, a seal, a
letter); a short thing now (the 3-minute taste; a 15-minute fast ship) and a long thing running (a 3–6 h convoy).
No gambling, no loot boxes, no purchases, no random outcomes, no expiry: an arrived cargo waits forever. **Shabbat and
Yom Tov (⚑ default):** the courts are open to read and to watch; new deals and unloading wait for מוצאי שבת ("לא נושאים
ונותנים בשבת"); ships keep sailing; nothing is lost.

## 6. API (src/kings/index.js) and integration
```js
K.ensure(G) → G.kings                    // guarded defaults; BUILD keeps G.kings in the save, nothing else
K.partners(G, now, {needs, rest}) · K.offers(G, id, now, {needs, rest, demo})
K.accept(G, offerId, now, {apply, rest}) → {ok, cost, eta, voyage} | {ok:false, why, lack, need}
K.settle(G, now) → [{id, partner, res, at}] only NEW arrivals (idempotent)   K.status(G, now) → {sea, arrived, news, badge}
K.bestFor(G, res, need, now, {needs, rest}) → the open offer for a shortage chip (covers `need` first, then the soonest) | null
K.unload(G, voyageId, now, {apply, rest}) → {ok, res, rel:{lvl, up}, seal, letters, item, flag, event} · K.unloadAll(G, now, opts)
K.tune({cost, yield, time})
K.openCourt({root, G, now, apply, onEvent, demo, sfx, needs, rest, partner?, arrivals?, top?, target?}) → Promise<{deals, unloaded}>
//   offer: with partner, opens that offer's contract (BUILD's shortage chip)
//   demo: ×60, and the loop plays itself (Tyre's court → contract → seal → the taste raft → arrival → unload), closing at ≈ 14.5 s
```
Events: `kingsOpen · kingsCourt · deal {king, what, cost, eta, res} · kingsArrive · delivery {from, res} · kingsRel ·
kingsSeal · kingsLetter · kingsItem {id:'doors'|'lamp'} · kingsEvent {kind:'agrippa'} · kingsClose`.
Sounds (FUN's kit): `court deal sail arrive page coinsIn`. The exact BUILD snippet is on the bus (bus/KINGS.md).

## 7. Tests
`node --test test/kings.test.mjs` (the rules: deals, costs, ETAs, offline settle, determinism, unlocks, the treaty, the
gifts, the storm, Shabbat, demo, tune, content rules). `node test/kings.cjs` (DOM harness, one browser,
phone 390×844: the chart, the storm story, the arrival and unload, a court's letters, a court, the contract and sign,
dark + Shabbat) → test/out/kings-*.png.

## 8. ⚑ for the owner (each with the default)
1. צור וצידון בימי הורדוס: אין מקור לעסקת ארזים; המחשה לפי עזרא ג, ז. ברירת מחדל: להשאיר, מסומן ⚑.
2. נחושת קפריסין: העסקה עם הקיסר מתועדת (קדמוניות טז, 128); שהנחושת הגיעה למקדש היא המחשה. ברירת מחדל: להשאיר, מסומן ⚑.
3. הילני ומונבז חיו כשני דורות אחרי הורדוס. ברירת מחדל: להפגיש דורות במשחק, עם הערה.
4. פטרה: אין מקור לסחר זהב עם המקדש; סוחרים בלי מלך. ברירת מחדל: להשאיר כהמחשה, או להוריד.
5. שבת ויום טוב: לא עושים עסקים ולא פורקים; צפייה וקריאה פתוחות. ברירת מחדל: כך.
6. מתנות חדייב קשורות לאבני דרך בבנייה (ההר, המזבח, האולם), בלי מחיר. ברירת מחדל: כך.
7. כדי לעמוד בתקציב (60K) ירדו: העצירה בבארות ומורה הדרך, מסך האיגרות הנפרד, ההצעות הגדולות ברמות 2–3, תמונת הסערה. ברירת מחדל: כך; אפשר להחזיר בגל 7.

## 9. Budget
**59.7 KB** in the merged build (21:15 UTC: s6-build 79e6a9e + fun + match3 + content + kings; BUILD's `import * as kings`
in main.js vs. a stub: 2,243,342 − 2,183,677 bytes), inside the 60 KB share. It was 71.4 KB; the trim kept the five courts,
their portraits, dialogue, sources, offers, the chart and the voyages, and dropped: Petra's wells wait and the paid guide; the
separate letters screen (letters now live in their court; seals show on the chart rows); the level-2/3 bulk offers
(`tyre_beams`, `rome_fleet`); seven letters that repeated a line or a fact, or went with the guide (`tyre1 tyre3 rome1 monbaz adi1 petra1 petra3`); the storm
picture (its story stays); the arrival clock; the port banner (the row says "בעגלות מיפו", the cart sound stays); the chart's
mountains, compass and jitter; Cypros's line; `sourcesOf`, `guide`, `status().next/fresh`. The portraits, icons and CSS share
parts.
