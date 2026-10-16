# Content — Sprint 4 (wave 4) notes (2026-09-26, motzaei Shabbat)

Agent: content & halacha. Branch `s5-content` (from master 140cf73). Everything here is **draft** until Yaron approves it in
`content/REVIEW.md`. No code was edited: §2 is the table the supervisor applies.

## 1. Method (as in Sprint 2–3) and what was fetched

- Every source is fetched **twice**, from Sefaria's v1 API (`/api/texts/<Ref>?context=0`) and v3 API (`/api/v3/texts/<Ref>`),
  through WebFetch, saved in the scratch source folder, and every quoted segment is checked in code against both passes
  (`check.mjs`: vocalized, letter and point for point). A Name in a fetched text is saved as ה׳.
- New this round (two passes each, identical unless said): Mishnah **Yoma 3:8–9, 4:1–4** (Torat Emet 357); **Leviticus
  16:7–10** (Miqra according to the Masorah); **Bartenura on Middot 3:4 and 3:7** (Torat-Emet; one lemma in 3:7 differs,
  "וְאֶחָת"/"וְאֶחָה" — not quoted); **Rashi on Exodus 20:22** (Rosenbaum–Silbermann); **Rambam, Avodat Yom HaKippurim 2:6–7**
  (Torat Emet 363 — the fetch model rewrote "הַשֵּׁם" as ה׳ in one pass, so the Rambam is used only as a paraphrased supporting
  source). Josephus (Whiston) by **phrase checks** in two passes (the fetch tool refuses long verbatim passages): War 5.5.6
  (sacred-texts.com, penelope.uchicago.edu — five phrases), Ant. 15.11.2 = §390 and 15.11.6 = §421 (biblestudytools.com,
  lexundria.com). One attempt at Tiferet Yisrael on Middot 1:4–5 returned another numbering (Vilna) and was not used.
- A third check in another edition (Mishnah, ed. Romm, Vilna 1913, unvocalized): Yoma 4:1 has the same letters —
  "אחד כתוב עליו לשם", "נתנו על שני השעירים" (so row 20 is not a quirk of Torat Emet).
- Already in the folder and re-used: Middot (middot.js, two passes), Tamid 3 and 3:8, Yoma 3:10–11, 5:1–4, 6:2, 7:4–5,
  Shekalim 6:1–2, Bavli Yoma 38a (Nikanor), 52b–54a, Ezra 3:1–7.
- The sweep: `sweep.mjs` (every Hebrew fragment inside ״…״, "…" or a vocalized literal, letters-only, both passes) over
  `src/game/moments.js`, `src/game/content.js`, `src/crews.js`, `src/avodah/scenes/index.js`, `src/avodah/interact3d.js`,
  `src/game/hooks/*.js`, `src/avodah/hooks/index.js` — 109 segments, 65 found in both passes, and each of the other 44 read by
  hand (UI strings, or the rows below); then a new pass for **unmarked** near-quotes (every 3-word window found only after
  dropping ו/י — 15 windows, rows 3–4 and §5); then every player-visible Hebrew line of the eleven wave-3 moments (217 lines) and
  the English source comments in the yk block of `avodah3d.js` and in `crews.js` read against the texts.
- `src/avodah/interact3d.js` has no player text (its labels come from the mini-games); the mini-games changed since Sprint 3
  only by the Sprint 3 rows (23–29, 31–34, 58–59), all applied as written.
- The content re-check (`check.mjs content/*.json`): **611 segments, 0 problems** (575 at the end of Sprint 3; +36 this round).

## 2. Code-fix table (for the supervisor)

**27 rows** (+ 5 optional doc rows, §2.5; row 25 was added last and sits in §2.1; rows 26–27, §2.6, are comments found in passing outside the list). Line numbers are at master 140cf73; every "old" string was checked to occur in that
file exactly as written (and once, unless the row says otherwise). Replace the exact text in "old" with "new". Priority **A**
= a wrong word, fact or source; **B** = a quote not in the source's words or spelling; **C** = a code comment; **opt.** =
nothing wrong — a clearer or better-sourced wording; **⚑** = depends on an owner decision (REVIEW.md, the default is given).

**Tested:** the Sprint 3 apply script (`apply_table.py` in the scratch folder), pointed at this file and run with `--opt`
(its "skip §2.4" rule was for Sprint 3's optional section; here §2.4 holds the comment rows), applies all 27 rows: 27 OK,
0 missing. On a scratch copy with the rows applied, `node --check` passes for the seven files, and the unit tests
`hooks-avodah`, `hooks`, `game-state` pass (46/46); the six new card ids resolve through `C()` / `YC()` as the scenes use them.
The browser tests (`test/scenes.cjs`, `test/moments.cjs`) were not run on this shared machine.

### 2.1 The wave-3 moments — `src/game/moments.js` and `MOMENTS` in `src/game/content.js`

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 1 B | moments.js:1133 (the storm, shown to the player) | `K.say('"השליכו אותי איתה"')` | `K.say('"הטילוני עמה" — השליכו אותי איתה')` | quote marks around words that are not the Gemara's; the Gemara: "הטילוני עמה". The new line keeps "אותי", which the `/אותי/` test on the line above looks for (so the line is still said once) | יומא לח, א |
| 2 C | moments.js:1084 (comment) | `Nikanor held it: "השליכו אותי איתה", and` | `Nikanor held it: "הטילוני עמה" (in plain Hebrew "השליכו אותי איתה"), and` | as row 1 | יומא לח, א |
| 3 B | content.js:245 (`MOMENTS.guf`, the card) | `ולא טחו אותן בכפיס של ברזל, שמא יגע ויפסול (מדות ג, ד).` | `ולא סדו אותן בכפיס של ברזל, שמא יגע ויפסול (מדות ג, ד; הסיד — ברטנורא שם).` | our Mishnah (Torat Emet): "לא היו סדין אותן בכפיס של ברזל" (plastering; Bartenura: "לא היו סדין אותן בכפות של בנאים"); "ליבנו **בסיד**" is right, but the lime is Bartenura's word ("ומלבנים אותן. בסיד"), the Mishnah says only "מלבנים" | מדות ג, ד; ברטנורא שם |
| 4 opt. | moments.js:829 (the tool refused, shown to the player) | `'לא טחו את המזבח בכפיס של ברזל, שמא יגע ויפסול'` | `'לא סדו את המזבח בכפיס של ברזל, שמא יגע ויפסול'` | as row 3 (an unmarked line in the Mishnah's words) | מדות ג, ד |
| 5 B | content.js:233 (`MOMENTS.heichal`, the card) | `יוספוס מתאר: חזית ההיכל הייתה מצופה לוחות זהב כבדים,` | `יוספוס מתאר: חזית הבית הייתה מצופה כולה לוחות זהב כבדים,` | Josephus speaks of "the outward face of **the temple** in its front" — the House's front (the Ulam's façade), not the Heichal, a room inside it; "covered **all over** with plates of gold of great weight". The rest of the free translation is right (sunrise, "like a mountain covered with snow", "not gilt … exceeding white" — five phrases, two passes) | Whiston, War 5.5.6 |
| 6 ⚑ | content.js:233 (`MOMENTS.heichal`) | `(מלחמת היהודים ה, ה, ו, בתרגום חופשי).')` | `(מלחמת היהודים ה, ה, ו, בתרגום חופשי). ולפי הגמרא, הורדוס רצה לצפות את הבית בזהב, וחכמים אמרו לו להשאיר אותו כך, כי כך הוא נראה כגלי הים (בבא בתרא ד, א).')` | ⚑6 (default: marble without full gold outside) — the card then gives both sources. With ⚑6 as default, the moment's sunrise should light only the Ulam's gold and the vine (content/moments.json `heichal_facade` note) | בבא בתרא ד, א ("סבר למשעייה בדהבא ... כי אידוותא דימא", Sprint 3) |
| 7 opt. | content.js:243 (`MOMENTS.lishka`) | `גזית: אבן מסותתת וחלקה.` | `גזית: אבן מסותתת — ״לשון גזיזה, שפוסלן ומכתתן בברזל״ (רש״י שמות כ, כב).` | "the meaning of Gazit" is right; Rashi gives it in words, and it is the opposite of the altar's stones (row 3 of the moment "בלי ברזל") | רש״י שמות כ, כב |
| 8 opt. | content.js:235 (`MOMENTS.gates`) | `(סדר השערים בתוך כל צד: פרשנות של המשחק.)` | `(הסדר בתוך כל צד: קריאתנו — בדרום מן המערב, כמו ״שערים דרומיים סמוכים למערב״, מדות ב, ו.)` | the order in temple.js:79–83 (south from the west: הדלק, הבכורות, המים; north: בית המוקד at the west, הקרבן, הניצוץ) is supported by the Mishnah itself: Middot 2:6 lists the southern gates "סמוכים למערב" — העליון, הדלק, הבכורות, המים; in the north שער הקרבן is second from the west there too; and Beit HaMoked in the north-west fits Tamid 3:3 (the lambs' chamber "במקצוע צפונית מערבית"). Still our reading — kept marked | מדות א, ד–ה; ב, ו; תמיד ג, ג |
| 9 opt. | content.js:229 (`MOMENTS.ulam`) | `חמש מלתראות, קורות של מילת,` | `חמש מלתראות, קורות של מילת (אילן שגדלים בו עפצים — ברטנורא),` | "קורות של מילת" is right: Bartenura — "אמלתראות: קורות מצירות ומכירות"; "של מילת: של אילן שגדלים בו עפצים שקרוין מילין". The addition only explains the word | מדות ג, ז; ברטנורא שם |
| 25 A | moments.js:1167 (the fifteen steps, shown to the player) | `K.say('עליהן אמרו הלוים את שירי המעלות')` | `K.say('עליהן עמדו הלוים בכלי שיר ואמרו שירה')` | the Mishnah does not say which songs the Levites sang on the steps: "כנגד חמש עשרה מעלות שבתהלים, שעליהן הלוים אומרים בשיר" (Middot 2:5), "שעליהן לויים עומדין בכלי שיר ואומרים שירה" (Sukkah 5:4) — the steps match the fifteen Songs of Ascents in number; that those psalms were sung on them is a later reading, not verified | מדות ב, ה; סוכה ה, ד |

Checked and correct in the eleven moments and their cards (the MOMENTS agent's list, §3): the horns "מקום הקרנות אמה מזה ואמה
מזה" and the 28 → 26 → 24 amot of the top (Middot 3:1); the five lintels 22 → 30 with a course of stones between (3:7, and
Bartenura's arithmetic "עשרים ושתים ... וחמישית שלשים"); the vine, "כל מי שהוא מתנדב עלה, או גרגיר, או אשכול, מביא ותולה
בה" (3:8; the cedar poles are 3:8 too); "שכל הבית טוח בזהב, חוץ מאחר הדלתות" (4:1); the gates' `why` lines (1:4, 1:5, 2:6);
Nikanor — "מיד נח הים מזעפו" is the Gemara's own words, the door "ובנמל עכו יצאה ... מתחת לדופן הספינה" matches "כיון שהגיע
לנמלה של עכו היתה מבצבצת ויוצאה מתחת דופני הספינה" (Yoma 38a); the fifteen steps "מקפות כחצי גרן עגלה" and "כנגד חמש עשרה
שיר המעלות" (Middot 2:5; Sukkah 5:4); the wood chamber (2:5); "נפגמה אחת מהן, היא פסולה" (3:4); the kevesh 32 × 16 on the
south (3:3); "פעמים בשנה, אחת בפסח ואחת בחג" (3:4); Lishkat HaGazit "בדרום" — in our numbering "שבדרום, לשכת העץ, לשכת
הגולה, לשכת הגזית" is Middot **5:4** (not 5:3), so the card's "(מדות ה, ד)" is right; Ben Katin's twelve spigots (Yoma 3:10),
twelve kohanim at once (Yoma 37a), the mukhni "שלא יהיו מימיו נפסלין בלינה" (3:10) and its wood heard from Jericho (Tamid
3:8: "מיריחו היו שומעין קול העץ שעשה בן קטין מוכני לכיור"); the wall's masonry line (archaeology, marked). The labels "מקום
הילוך רגלי הכהנים" (moments.js:422) and "ויפסול" are plene but not marked as quotes — left.

### 2.2 `src/avodah/scenes/index.js` — the drafts become content cards

The four drafts (`DR(...)`) are now verified content items; `C(MYST, id)` and `YC(id)` already read them (YC finds the new
`yom_kippur_script` lines by `from: "yom_kippur.json:<id>"`). The stop ids stay (the tests use them).

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 10 A ⚑ | scenes/index.js:75 (ARK `find`) | `title: 'מצא את האבן', find: true,` | `title: 'ההשתחוויה הארבע עשרה', find: true,` | the step is the fourteenth bow, not a search (⚑ `mysteries.json: ark_find.mechanic` — default: the stone is highlighted, the player only bows; in Shekalim 6:2 the kohen who saw the stone "לא הספיק לגמר את הדבר עד שיצתה נשמתו") | שקלים ו, א–ב |
| 11 A | scenes/index.js:75 (ARK `find`) | `cards: [DR('מצא את האבן', 'באחת מאבני הרצפה של לשכת העצים יש משהו שונה. חפש אותה — והשתחווה לעומתה, כמו בית רבן גמליאל ובית רבי חנניה סגן הכהנים: ההשתחוויה הארבע עשרה.', 'שקלים ו, א–ב')]` | `cards: [C(MYST, 'ark_find')]` | the Mishnah: the extra bow was "כנגד דיר העצים" (toward the wood shed; the Gemara: "ארון בלשכת דיר העצים היה גנוז"), not toward a floor stone; "רבי **חנניא**" | שקלים ו, א–ב; יומא נד, א |
| 12 opt. | scenes/index.js:76 (ARK `end`) | `cards: [DR('מסורת מאבותיהם', 'לא "מוצאים" את הארון. בבית השני לא היה ארון בקודש הקדשים — ״אבן היתה שם מימות נביאים ראשונים, ושתיה היתה נקראת״. נשארה המסורת: ״שכן מסרת בידם מאבותיהם ששם הארון נגנז״.', 'שקלים ו, א–ב; יומא ה, ב'), C(MYST, 'foundation_stone')]` | `cards: [C(MYST, 'ark_end'), C(MYST, 'foundation_stone')]` | the draft's two quotes are right (verified); the content card carries them with nikud and a source | יומא ה, ב; שקלים ו, א |
| 13 B | scenes/index.js:84 (`yk_confession`) | `cards: [DR('הווידוי על הפר', 'הפר עומד בין האולם למזבח, ראשו לדרום ופניו למערב. הכהן הגדול עומד במזרח, פניו למערב, סומך שתי ידיו על הפר ומתוודה. כשהזכיר את השם המפורש, ״הכהנים והעם העומדים בעזרה... היו כורעים ומשתחוים ונופלים על פניהם, ואומרים: ברוך שם כבוד מלכותו לעולם ועד״. (נוסח הווידוי אינו מובא כאן במלואו.)', 'יומא ג, ח; ו, ב')]` | `cards: [YC('yk_confession')]` | the kept quote is Yoma 6:2 and dropped its first letter ("**ו**הכהנים"); Yoma 3:8 itself says only "והן עונין אחריו, ברוך שם כבוד מלכותו לעולם ועד" — that they bowed at the first confession too is the Rambam's (every one of the ten mentions); the facts (the bull between the Ulam and the altar, head south, face west; he in the east facing west, both hands on it) are right | יומא ג, ח; ו, ב; רמב״ם עבודת יוה״כ ב, ו–ז |
| 14 A ⚑ | scenes/index.js:85 (`yk_lots`) | `cards: [DR('שני שעירים וקלפי', 'במזרח העזרה, לצפון המזבח, עומדים שני שעירים, ושם קלפי ובה שני גורלות. הסגן מימין הכהן הגדול וראש בית אב משמאלו. הכהן הגדול טורף בקלפי ומעלה שני גורלות — על אחד כתוב "לה׳" ועל השני "לעזאזל" — ונותן אותם על ראשי השעירים.', 'יומא ג, ט; ד, א')]` | `cards: [YC('yk_lots')]` | the Mishnah: "נתנו על שני השעירים" — not "on their heads"; "על אחד כתוב **לשם**" in the Mishnah (the verse: "גורל אחד לה׳") — ⚑ which the game writes, default the Mishnah's "לשם" (`yom_kippur.json: yk_lots.inscription`); the lots were of gold (3:9) | יומא ג, ט; ד, א; ויקרא טז, ח |
| 15 opt. | scenes/index.js:86 (`yk_ketoret_entry`) | `cards: [YC('yk_ketoret_entry'), C(KETORET, 'yom_kippur_ketoret'), YC('yk_short_prayer')]` | `cards: [YC('yk_machta'), YC('yk_ketoret_entry'), C(KETORET, 'yom_kippur_ketoret'), YC('yk_short_prayer')]` | the Yom Kippur machta — of gold, light, a long handle (Yoma 4:3–4), asked for by the scenes agent | יומא ד, ג–ד |
| 16 opt. | scenes/index.js:91 (`yk_feast`) | `cards: [YC('yk_feast')]` | `cards: [YC('yk_own_clothes'), YC('yk_feast')]` | the last change of garments: gold again for the afternoon ketoret and the lamps, then his own clothes (7:4); the world goes straight to "own" (§2.4 row 22) | יומא ז, ד |

### 2.3 The hooks

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 17 A | game/hooks/avodah.js:39 (the altar invitation) | `כך היה בימי עזרא: המזבח נבנה, והעבודה התחילה, עוד לפני שנוסד ההיכל.` | `כך היה בשיבת ציון, בימי ישוע בן יוצדק וזרובבל (עזרא ג, ב): המזבח נבנה, והעבודה התחילה, עוד לפני שנוסד ההיכל.` | the altar of Ezra 3 was built by Yeshua ben Yotzadak and Zerubbabel ("ויקם ישוע בן יוצדק ... וזרבבל בן שאלתיאל ... ויבנו את מזבח"), a generation before Ezra came (Ezra 7) — the book bears his name. The quote (3:6) is right | עזרא ג, ב; ג, ו |
| 18 opt. | avodah/hooks/index.js:277 (the vessels line) | `כל כלי נאסף בעבודה שבה משתמשים בו, לפי משנה מסכת תמיד.` | `כל כלי נאסף בעבודה שבה משתמשים בו, לפי המשנה (בעיקר מסכת תמיד).` | of the 25 vessels, the torches are Middot 1:2, the lyres and harps Arakhin 2:3, 2:5, the mizrak Zevachim 5:4 / the Rambam; each tooltip shows its own source | the step sources |

The 25 vessels: each was checked against its step's source — all are named there (Tamid 1:1, 1:4, 2:1, 3:4, 3:5, 3:6, 4:3,
5:4–5, 5:6, 7:3; Middot 1:2; Arakhin 2:3, 2:5; the Rambam, Maaseh HaKorbanot 5:6 for the mizrak), except **סכין**: Tamid 4:1
does not name a knife. Content fix (applied, content/tamid.json `shechita.source`): "תמיד ד, א; מדות ד, ז" — "ששם גונזים את
הסכינים". The Ezra 3:6 invitation, Ezra 3:4, Sukkah 55b "שבעים פרים כנגד מי? כנגד שבעים אומות", Sukkah 5:7 "בשלשה פרקים בשנה
היו כל משמרות שוות", Middot 2:6 (the Water Gate) and "השלישי משערי הדרום (מדות א, ד)" — right (as in Sprint 3).

### 2.4 Code comments

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 19 C | avodah3d.js:887 | `("החיצונה פרופה מן הדרום", Yoma 5:1)` | `("החיצונה היתה פרופה מן הדרום", Yoma 5:1)` | "היתה" dropped from a quote | יומא ה, א |
| 20 C | avodah3d.js:1035 | `// "ונותנן על שני השעירים" (Yoma 4:1): the lots on the goats' heads` | `// "נתנו על שני השעירים" (Yoma 4:1); on the goats' heads: illustration` | the Mishnah's word is "נתנו"; it does not say "heads" | יומא ד, א |
| 21 C | avodah3d.js:1084 | `// the blood of the goat, and then of both, toward the parochet from outside (Yoma 5:4) — the motion only` | `// toward the parochet from outside: the bull's blood, then the goat's; then the two are mixed (Yoma 5:4) — the motion only` | wrong order: "נטל דם הפר והניח דם השעיר, והזה ממנו על הפרכת שכנגד הארון מבחוץ", then the goat's; "ערה דם הפר לתוך דם השעיר" is the mixing, not a sprinkling on the parochet | יומא ה, ד |
| 22 C | avodah3d.js:1092 | `// at the end of the day, in white again, he goes in to take out the kaf and the machta (Yoma 7:4)` | `// at the end of the day, in white again, he goes in to take out the kaf and the machta (Yoma 7:4); then gold again for the afternoon ketoret and the lamps, and only then his own clothes (ibid.) — the world skips the gold step` | the order of 7:4 ("הביאו לו בגדי זהב ... להקטיר קטרת של בין הערבים ולהטיב את הנרות ... הביאו לו בגדי עצמו") | יומא ז, ד |
| 23 C | crews.js:28 | `Herod "prepared a thousand wagons" for the stones (Ant. 15.11.2)` | `Herod "got ready a thousand waggons" for the stones (Ant. 15.11.2, Whiston)` | Whiston's words (two passes); "prepared" is not in the text | Ant. 15.11.2 (§390) |
| 24 C | crews.js:29 | `"מן הלבנון אל ים יפו" (Ezra 3:7)` | `"מן הלבנון אל ים יפוא" (Ezra 3:7)` | the verse spells "יפוא" | עזרא ג, ז |

Checked and correct in the yk block (avodah3d.js:870–1116): the bull between the Ulam and the altar, head south, face west, he in
the east facing west (Yoma 3:8); the lots "to the east of the azara, to the north of the altar", the Segan at his right (3:9;
4:1); the linen sheet (3:4, 3:6: "פרסו סדין של בוץ בינו לבין העם"); the immersion on the parva's roof reached by the rinsing
chamber's stair (Middot 5:3); "נטל את המחתה בימינו ואת הכף בשמאלו. היה מהלך בהיכל" (5:1); the inner parochet folded at the
north (5:1); the machta on the stone, the house full of smoke (5:1–2); "כמצליף", one up and seven down, counted aloud (5:3);
"הביאו לו בגדי עצמו, ולבש. ומלוין אותו עד ביתו" (7:4 — the comment's punctuation differs only); the gold machta (4:4). The
header's dignity rules match the content (no blood, no Name, the camera never walks his path in the Kodesh HaKodashim).
The crews' sources: Josephus Ant. 15.11.2 (§390) and 15.11.6 (§421 — "But the temple itself was built by the priests in a year
and six months") are right (two passes); "the cloisters and the outer enclosures ... in eight years" is 15.11.5. "שלא הונף
עליהן ברזל" (Middot 3:4), the Coponius gate (1:3), the Lishkat HaGazit in the south (5:4), lime for the whitewash (Bartenura on
3:4) — right.

### 2.6 Found in passing (outside this round's list; comments)

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 26 C | sanctuary.js:952 (wave 3) | `"נכנס לתא ומן התא להיכל"` | `"נכנס לתא, ומן התא אל ההיכל"` | Tamid 3:7's words (Middot 4:2 has "ונכנס להתא, ומהתא להיכל"); the comment matches neither | תמיד ג, ז; מדות ד, ב |
| 27 C | sanctuary.js:185 | `("כתיבה פרוצה", Menachot 94b)` | `("כמין תיבה פרוצה", Menachot 94b)` | the Gemara's words (R. Chanina) | מנחות צד, ב |

### 2.5 Docs of other owners (optional)

| # | where | old | new | why |
|---|---|---|---|---|
| D1 | docs/CREWS.md:30 | `"he also prepared a thousand sacerdotal garments for as many of the priests` | `"and bought a thousand sacerdotal garments for as many of the priests` | Whiston's words (two passes) |
| D2 | docs/CREWS.md:33 | `"ישבת ודנה את הכהונה" (Middot 5:4)` | `"יושבת ודנה את הכהנה" (Middot 5:4)` | the Mishnah's words |
| D3 | docs/CREWS.md:36 | `(the whitewash, Middot 3:4 "ומסיידין אותו")` | `(the whitewash: Middot 3:4 "ומלבנים אותן"; the lime is Bartenura's, "בסיד")` | "ומסיידין אותו" is not in the Mishnah |
| D4 | docs/HOOKS-he.md:16 | `בימי עזרא התחילו להקריב` | `בשיבת ציון (בימי ישוע בן יוצדק וזרובבל, עזרא ג, ב) התחילו להקריב` | as row 17 |
| D5 | docs/MOMENTS.md, "Quotes and what still needs checking" | (the three open items) | "Checked by the content agent, wave 4 (docs/CONTENT-S4.md §2–3)" | the checks are done |

## 3. The MOMENTS agent's list — answers

| item | result |
|---|---|
| Josephus War 5.5.6 on the heichal card | right as a free translation, marked; five English phrases verified in two passes. One word: "חזית **הבית**" (row 5). ⚑6 decides whether the façade is gold (row 6). |
| Nikanor in plain Hebrew (Yoma 38a) | "מיד נח הים מזעפו" — the Gemara's words; the door at Acre — right ("לנמלה של עכו ... מתחת דופני הספינה"); "השליכו אותי איתה" is a plain rendering of "הטילוני עמה" — fine unmarked (STORY), not inside quote marks (rows 1–2). "המלחים" — the Gemara says only "נטלו" (they took); a plain-language reading. |
| Tamid 3:8 — the gate heard in Jericho | right: "מיריחו היו שומעין קול שער הגדול שנפתח" (heichal.js:44); the mukhni's wood too (moments.js:655, content.js:227). |
| "ליבנו בסיד" vs Middot 3:4 "מלבנים" | right with Bartenura ("ומלבנים אותן. בסיד, פעמים בשנה") — cite him; and our Mishnah has "לא היו **סדין** אותן בכפיס של ברזל", not "טחין" (rows 3–4). |
| "קורות של מילת" (Middot 3:7) | right — Bartenura: "קורות מצירות ומכירות", "של מילת: של אילן שגדלים בו עפצים" (row 9 optional). |
| the meaning of Gazit | right — "גזית: לשון גזיזה, שפוסלן ומכתתן בברזל" (Rashi, Exodus 20:22); "וחלקה" is the moment's reading (row 7 optional). |
| content/kiyor.json:95 "יִהְיו" | both passes of Torat Emet print "יִהְיו" — an evident typo of the edition (the vav needs its shuruk). **Fixed** in kiyor.json (`mukhni`) and scenes.json (`tour_kiyor`) to "יִהְיוּ" (letters unchanged; `check.mjs` knows this one correction and still checks the rest of the segment point for point). The game's kiyor card takes the words from kiyor.json, so it is fixed there too. |
| the gate order, temple.js:79–83 | supported by the Mishnah: Middot 2:6 "שערים דרומיים סמוכים למערב, שער העליון, שער הדלק, שער הבכורות, שער המים" (south from the west, as temple.js); in the north "שער הקרבן" is second from the west in 2:6 too, and Beit HaMoked in the north-west fits Tamid 3:3. The Mishnah in 1:4–5 lists the south from the west and the north from the east (a circuit). The commentators were not checked this round. Keep "קריאתנו" on the card (row 8). |

## 4. Delivered content (ids other agents can rely on)

- `content/yom_kippur.json` +4, in the Mishnah's order: **`yk_confession`** (Yoma 3:8; 6:2 in `views`; the Rambam as a
  paraphrase), **`yk_lots`** (4:1; 3:9 and Leviticus 16:8 in `views`; `inscription` — ⚑, default "לַשֵּׁם", alternative
  "לַה׳"), **`yk_machta`** (4:4; 4:3 and the rest of 4:4 in `views`; `world_hint`), **`yk_own_clothes`** (7:4: gold for the
  afternoon, then his own clothes; `world_hint`). Each has `do_not_show_he`.
- `content/scenes.json: yom_kippur_script` +4 lines in the same form (`yk_scene_3_1` … `yk_scene_9_5`, `scene` 3.1, 3.2, 3.3,
  9.5, `from: "yom_kippur.json:<id>"`), so `YC('<id>')` works as it is (rows 13–16).
- `content/mysteries.json` +2: **`ark_find`** (Shekalim 6:1; 6:2 and Yoma 54a in `views`; `mechanic` ⚑) and **`ark_end`** (Yoma
  5:2; Shekalim 6:1 in `views`) — rows 11–12.
- `content/crews.json` (new, 4): **`crews_priests_trained`** (Ant. 15.11.2, free translation, `reference_en`),
  **`crews_priests_built`** (15.11.6), **`crews_no_iron`** (Middot 3:4 + Bartenura "בסיד"), **`crews_gazit`** (Middot 5:4 + Rashi
  on Gazit). Josephus: `quote: null`, `translation: "free"`, `text_he`, `reference_en` — show "בתרגום חופשי".
- `content/moments.json`: `views` added to `gates` (Middot 2:6), `ulam` (Bartenura), `guf` (Bartenura; 3:4 "סדין"), `yesod`
  (Bartenura on פגימה), `lishka` (Rashi), `heichal` (Josephus, free, with the verified English). The game reads only
  `quote`/`source`, so nothing it shows changes.
- `content/tamid.json`: `shechita.source` → "תמיד ד, א; מדות ד, ז" (the knife, §2.3). `content/yom_kippur.json:
  yk_ketoret_entry.note`: "משניטל" → "משנטל" (the Mishnah's spelling, as row 6 of Sprint 3).

## 5. Also checked (no change)

- The wave-3 cards in `MOMENTS` built by `mcard()` show the verified `moments.json` quote and its ref; the kiyor card's Yoma 37a
  line is a paraphrase ("שנים עשר אחיו הכהנים העסוקין בתמיד מקדשין ידיהן ורגליהן בבת אחת").
- Unmarked near-quotes (3-word windows found only after dropping ו/י): "שלושה עשר שערים", "שלוש בצפון ושלוש בדרום", "על
  רוחב שש עשרה" (content.js stage cards, modern spelling of the Mishnah's facts, not marked — as Sprint 3 left them).
- The Phase B hooks' festival texts and the Sukkot strip (Sukkah 55b; Ezra 3:4; Sukkah 5:7) — right.

## 6. needs_check and ⚑

No new item needs_check this round (the four new Yom Kippur items, the two Ark items and the four crews items are verified).
New ⚑ for the owner (REVIEW.md, the list at the top, 49–56): the inscription on the lot; the Ark "find" step; the heichal card and
⚑6; the kohanim building in priestly garments; and the ⚑ items of docs/MOMENTS.md, CREWS.md and SCENES.md.
