# Content — Sprint 3 notes (2026-09-25)

Agent: content & halacha. Everything here is **draft** until Yaron approves it in `content/REVIEW.md`.

- **Round 1** (08:54 UTC, six minutes before its hard stop) delivered `content/scenes.json` (13 tour cards, the
  10-scene Yom Kippur script) and `content/moments.json` (13 Phase A moment cards), all from already-verified quotes.
- **Round 2** (this wave, from 09:30 UTC): the code sweep (§2 — the table the supervisor applies), the Avodah gaps and
  the fallback move (§4, §5), the missing sources (§6), and `content/REVIEW.md` (the ⚑ checklist at the top).

## 1. Method (as in Sprint 2)

- Every source was fetched **twice**, from Sefaria's v1 API (`/api/texts/<Ref>/he/<Version>`) and v3 API
  (`/api/v3/texts/<Ref>?version=hebrew|<Version>`), through WebFetch (the shell cannot reach sefaria.org), and saved as
  `<Ref>.v1.txt` / `<Ref>.v3.txt` in the scratch source folder. Editions: Mishnah — Torat Emet 357; Tanakh — Miqra
  according to the Masorah; Bavli — William Davidson Edition – Aramaic (unvocalized); Rashi — Vilna.
- New this round (46 sources × 2 passes): Mishnah Tamid 1:1–3, 2:5, 7:1–4; Yoma 1:5, 2:1–7, 3:1, 6:2 (end only);
  Sukkah 4:1–4, 5:5–8; Pesachim 5:1; Zevachim 5:4, 10:1; Arakhin 2:3–6; Berakhot 9:5 (the Temple Mount sentence);
  Kelim 1:8; Ezra 3:1–7; Exodus 25:31, 25:36, 30:1–3, 30:7–8; Leviticus 6:5–6; Bavli Yoma 21b, 22a, 22b, 25a, 38a
  (Nikanor), Sukkah 45a, 55a, Rosh Hashanah 31a, Zevachim 19a, 88b, Menachot 94b, Taanit 23a, Bava Batra 4a;
  Rashi Sukkah 53b, Rashi Rosh Hashanah 31a (two v3 passes — the v1 API returned only the page's first comment); and,
  for the re-check of tamid.json, Mishnah Tamid 2:1–4, 3:5, Yoma 1:8, Zevachim 6:2–3, Menachot 4:5, Megillah 2:6, Leviticus
  6:2, Bavli Yoma 19a, 33a, Pesachim 58b, Rambam Temidin uMusafin 6:11 (Torat Emet 363). Josephus (Whiston): War 5.5.2 and 5.5.6 (sacred-texts.com verbatim + penelope.uchicago.edu phrase
  check), Antiquities 15.11.2, .3, .6 (lexundria.com + biblestudytools.com phrase checks).
- At the end of the round (for the comment refs, §2.3, §2.6, §2.7, and the lottery count, §5): Mishnah Yoma 7:5,
  Sotah 7:6, Temurah 2:1; Bavli Sotah 38a, Yoma 71b and Rashi there, Sukkah 52b, Beitzah 19a, Pesachim 59a, Zevachim 19a
  (the belt), Menachot 44a, Megillah 6a; Song 4:1; Bartenura on Middot 1:5, Yoma 1:8 and Yoma 2:1 (Torat Emet); Rambam
  Klei HaMikdash 3:2, 8:1, 8:17, 8:19, 9:3, 10:1 and Temidin uMusafin 4:3 (Torat Emet 363) — all identical in both passes.
  Fetched once each, only to see that something is not there: Bartenura on Middot 1:4 and Bavli Sotah 37b; Rambam Lulav
  7:23 (once in full, once cut short) gives no hour for the circuit of the altar. Archaeology of `FINDS` (not quotes):
  Wikipedia, the Western Wall Heritage Foundation, Times of Israel, the Armstrong Institute, Madain Project, and the
  Israel Museum records (IMJ 191538, 191539, via the national museums portal).
- **Differences between passes** and what was done: Yoma 25a "ועומדין" (v3) / "ועומדים" (v1) → a third pass gave
  "ועומדין", used. Mishnah Yoma 2:2 "ורצין"/"ורצים" and 2:7 "בשלשה"/"בשלשה" (dagesh) — the words are not quoted.
  Tamid 7:2 "אַחַת"/"אֶחָת" at the second "ברכה אחת" — not quoted. Sukkah 55a v3 first gave only the psalm incipits;
  a second v3 pass returned the full segments, identical to v1.
- The code was swept by a script: every Hebrew fragment inside ״…״, "…" or a vocalized string literal in the files
  below (269 segments) was looked up letters-only (nikud, punctuation and spacing ignored) in both passes. 175 were
  found in both; every one of the other 94 was read by hand (most are UI strings, not quotes). A fuzzy aligner showed
  the nearest source text for each, which gave the replacements below.
- A second pass at the end of the round looked for **unmarked** quotes: every 3-word window of every Hebrew string literal
  in the same files whose letters match a source only after dropping the matres ו/י. 58 places; all but two are rows
  already or modern-spelled prose ("של בין הערביים", "שלושה עשר שערים"); the two are rows 58–59.
- Files swept: `src/info.js` (all 26 Sprint 2 sanctuary cards, and the Sprint 0 cards), `src/avodah/data.js`,
  `src/avodah/minigames/*.js` (21), `src/avodah/scenes/index.js`, `src/game/hooks/*.js`, `src/avodah/hooks/index.js`,
  `src/game/content.js`, and the comment references in `src/avodah3d.js`, `src/actors.js`, `src/animals.js`,
  `src/pens.js`.

## 2. Code-fix table (for the supervisor)

**59 rows** (1–40 in this round's list, 41–52 found in other files, 53–59 added at the end of the round — §2.7), and 18
optional spelling rows for the Sprint 0 cards (40.1–40.18, §2.4). Every "old" string was checked to be in master 7e9b008 as
written, and none of them is touched by the parallel wave-3 branches (s4-moments, s4-crews, s4-world, s4-qa) as of 11:10 UTC
— line numbers may move when those merge, the strings will not. Replace the exact text in the "old" column with the "new" column (both exact, including punctuation).
Priority **A** = a wrong word, a wrong fact or a wrong source; **B** = the quote is right but not in the source's
spelling (our convention: quotes in the source's spelling, PROJECT.md §2.1, REVIEW.md «מוסכמות»); **C** = a code
comment; **opt.** = optional (nothing wrong — an added source or a more careful wording). Line numbers are at master
7e9b008. In `info.js` source strings a Bavli page is written as the file writes it ("יומא לג ע״ב").

### 2.1 `src/info.js` — the Sprint 2 sanctuary cards (lines 154–179)

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 1 A | info.js:154 `heichal-in` | `״הבית כולו מחופה זהב, חוץ מאחורי הדלתות״` | `״שכל הבית טוח בזהב, חוץ מאחר הדלתות״` | not the Mishnah's words | מדות ד, א |
| 2 A | info.js:154 `heichal-in` | `מעל הקירות אמה ״כיור״ ומעליה התקרה.` | `מעל הקירות ״אמה כיור, ואמתים בית דלפה, ואמה תקרה״.` | between the kiyur and the ceiling there are two amot of "בית דלפה" | מדות ד, ו |
| 3 A | info.js:154 `heichal-in` (source) | `'מידות ד, א; ד, ו–ז · שמות כו, לה'` | `'מידות ד, א; ד, ו–ז · שמות כו, לה · יומא לג ע״ב'` | "ומזבח הזהב ביניהם" is Yoma 33b | יומא לג, ב (Sprint 2) |
| 4 A | info.js:160 `parochet` | `״הפרוכת עביה טפח, ועל שבעים ושתים נימין נארגת, ועל כל נימה ונימה עשרים וארבעה חוטין״` | `״פרכת עביה טפח, ועל שבעים ושתים נימין נארגת, ועל כל נימא ונימא עשרים וארבעה חוטין״` | two words differ | שקלים ח, ה |
| 5 opt. | info.js:160 `parochet` (source) | `'יומא ה, א · שקלים ח, ה · יומא עא ע״ב'` | `'יומא ה, א · שקלים ח, ה · יומא עא ע״ב · שמות כו, לא'` | Yoma 71b is right (verified at the end of the round: "ויליף משזר משזר מפרוכת מה להלן עשרים וארבעה"; Rashi there: "שהרי ד׳ מינין יש בה וכל מין ומין כפול שש"); the four colours are the Torah's — add Exodus 26:31 | יומא עא, ב ורש״י שם; שמות כו, לא |
| 6 A | info.js:161 `even-shtiya` | `״משניטל הארון,` | `״משנטל הארון,` | spelling of the quoted word | יומא ה, ב |
| 7 A | info.js:162 `upper-openings` | `לבית קדשי הקדשים, שבהן היו משלשלין את האומנין בתיבות, כדי שלא יזונו עיניהם מבית` | `לבית קדש הקדשים, שבהן היו משלשלין את האמנים בתבות, כדי שלא יזונו עיניהן מבית` | four words differ | מדות ד, ה |
| 8 A | info.js:163 `ulam-tables` | `״שני שולחנות היו באולם מבפנים על פתח הבית, אחד של שיש ואחד של זהב. על של שיש נותנין לחם הפנים בכניסתו, ועל של זהב ביציאתו, שמעלין בקודש ולא מורידין״` | `״שני שלחנות היו באולם מבפנים על פתח הבית, אחד של שיש ואחד של זהב. על של שיש נותנים לחם הפנים בכניסתו, ועל של זהב ביציאתו, שמעלין בקדש ולא מורידין״` | "נותנים", and the spelling | מנחות יא, ז |
| 9 A | info.js:164 `ulam-chains` | `שבהן היו פרחי כהונה עולין ורואין את העטרות` | `שבהן פרחי כהנה עולין ורואין את העטרת` | "היו" is not in the Mishnah | מדות ג, ח |
| 10 B | info.js:166 `lambs` | `״כקיטוניות פתוחות לטרקלין״` | `״כקיטונות פתוחות לטרקלין״` | spelling | מדות א, ו |
| 11 B | info.js:166 `lambs` | `״אין פוחתין מששה טלאים המבוקרים בלשכת הטלאים״` | `״אין פוחתין מששה טלאים המבקרין בלשכת הטלאים״` | "המבקרין" | ערכין ב, ה |
| 12 A | info.js:169 `moked-tevila` | `״מערבית צפונית, בה יורדין לבית הטבילה״` | `״צפונית מערבית, בה יורדים לבית הטבילה״` | the Mishnah says "צפונית מערבית" | מדות א, ו |
| 13 A | info.js:170 `avtinas` | `״בשלשה מקומות הכהנים שומרים בבית המקדש: בבית אבטינס ובבית הניצוץ ובבית המוקד. בית אבטינס ובית הניצוץ היו עליות״` | `״בשלשה מקומות הכהנים שומרים בבית המקדש, בבית אבטינס, ובבית הניצוץ, ובבית המוקד״. ״בית אבטינס ובית הניצוץ היו עליות״` | two sources were run together as one quote (the first is Middot 1:1, the second Tamid 1:1) | מדות א, א; תמיד א, א |
| 14 A | info.js:170 `avtinas` | `לשם העלו את הכהן הגדול לפני יום הכיפורים ללמדו לחפון.` | `לעליית בית אבטינס העלו את הכהן הגדול לפני יום הכיפורים — ״והשביעוהו״ (המשנה), ו״ללמדו חפינה״ (הברייתא).` | the teaching of the handful is a baraita (Yoma 19a, now verified in two passes); the Mishnah itself says they took him up there to put him under oath | יומא א, ה; יומא יט, א |
| 15 A | info.js:170 `avtinas` (source) | `'מידות א, א · יומא א, ה'` | `'מידות א, א · תמיד א, א · יומא א, ה · יומא יט ע״א'` | the second quote, and the baraita | תמיד א, א; יומא יט, א |
| 16 B | info.js:171 `salt` | `״לשכת המלח — שם היו נותנין מלח לקרבן״` | `״לשכת המלח, שם היו נותנים מלח לקרבן״` | "נותנים" | מדות ה, ג |
| 17 A | info.js:173 `rinse` | `״לשכת המדיחין — ששם מדיחין קרבי הקדשים, ומשם מסבה` | `״לשכת המדיחין, ששם היו מדיחין קרבי הקדשים. ומשם מסבה` | "היו" was missing | מדות ה, ג |
| 18 A | info.js:175 `maaracha-ketoret` | `סמוך לקרן המערבית־דרומית` | `מכנגד הקרן המערבית־דרומית, ארבע אמות צפונה ממנה` | it stood four amot north of the corner, not by it | תמיד ב, ה |
| 19 B | info.js:176 `tapuach` | `״תפוח היה באמצע המזבח` | `״ותפוח היה באמצע המזבח` | the quote dropped the ו | תמיד ב, ב |
| 20 B | info.js:177 `shitin` | `״היו שני נקבים כמין שני חוטמין דקין״` | `״היו שני נקבים, כמין שני חטמין דקין״` | spelling | מדות ג, ב |
| 21 A | info.js:179 `deshen` | `על הרצפה במזרחו של הכבש, רחוק ממנו שלושה טפחים — שם נותנים את תרומת הדשן, את מוראת העוף ואת דישון המזבח הפנימי והמנורה.` | `על הרצפה ממזרח לכבש: ״הלך למזרחו של כבש כעשר אמות. צבר את הגחלים על גבי הרצפה רחוק מן הכבש שלשה טפחים״ — שם נותנים גם את מראות העוף ואת דישון המזבח הפנימי והמנורה.` | the ten amot along the ramp were missing (places.js DESHEN_PLACE was fixed to z ≈ 32.5 for this); "מראות" | תמיד א, ד |

Checked and correct in the other sanctuary cards: `heichal-doors` (מדות ד, א–ב), `menorah` (״מקשה אחת״ — שמות כה, לו;
18 tefachim, 22/11/9 — מנחות כח, ב), `menorah-stone` (תמיד ג, ט), `shulchan` (שמות כה, כג–כד; ויקרא כד, ה–ז; מנחות יא, ה–ו),
`gold-altar` (the paraphrase matches שמות ל, א–ג, ז–ח and תמיד ה, ה), `mechanism` (יומא ג, י; תמיד ג, ח), `moked-bakers`,
`moked-stones` (מדות א, ו), `parva` (מדות ה, ג), `maaracha` (תמיד ב, ד; אבות ה, ה), `ring-slab` (מדות ג, ג — the numbering is
right), `parochet`'s "(ולדעת ר׳ יוסי הייתה שם פרוכת אחת)" (יומא ה, א).

### 2.2 `src/avodah/minigames/*.js`, `src/avodah/scenes/index.js`, `src/game/content.js`

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 22 A | scenes/index.js:58 (card "מסורת מאבותיהם") | `״שכך מסורת בידם מאבותיהם, ששם נגנז״` | `״שכן מסרת בידם מאבותיהם ששם הארון נגנז״` | the word "הארון" was missing; "שכן" | שקלים ו, א |
| 23 A | barkai.js:58 | `` `"האיר פני כל המזרח עד שבחברון?" — "הין!"${tail}` `` | `` `"האיר פני כל המזרח" — "עד שהוא בחברון?" — "הין!"${tail}` `` | the game cites Tamid 3:2, whose words are "האיר פני כל המזרח. עד שהוא בחברון, והוא אומר, הין"; "עד שבחברון … הן" is Yoma 3:1 — the line mixed the two (as tamid.json `dawn_check.calls`) | תמיד ג, ב (and יומא ג, א) |
| 24 B | barkai.js:57 | `"האיר פני המזרח"` | `"האיר פני כל המזרח"` | a quote-marked label, "כל" dropped | תמיד ג, ב |
| 25 B | payis.js:21 | `"מי שטבל יבוא ויפיס"` | `"מי שטבל יבא ויפיס"` | spelling | תמיד א, ב |
| 26 B | payis.js:23 | `"חדשים לקטורת — באו והפיסו!"` | `"חדשים לקטרת באו והפיסו!"` | spelling | תמיד ה, ב |
| 27 B | erev.js:41 | `"תמיד נשחט בשמונה ומחצה"` | `"תמיד נשחט בשמנה ומחצה"` | spelling (also the comment at erev.js:3) | פסחים ה, א |
| 28 B | ketoret.js:189 | `"מיריחו היו מריחים ריח פטום הקטורת"` | `"מיריחו היו מריחים ריח פטום הקטרת"` | spelling | תמיד ג, ח |
| 29 B | zerika.js:50 (twice) | `על טבעת שנייה` | `על טבעת שניה` | spelling | תמיד ד, א |
| 30 A | game/content.js:203 (`MOMENTS.greatStone.src.d`) | `יוספוס מתאר אבנים באורך עשרים וחמש אמה, בגובה שמונה וברוחב שתים עשרה.` | `יוספוס מתאר את אבני הבית שבנה הורדוס: באורך עשרים וחמש אמה, בגובה שמונה וברוחב כשתים עשרה.` | Whiston: "the temple was built of stones that were white and strong, and each of their length was twenty-five cubits, their height was eight, and their breadth about twelve" — "about", and these are the house's stones; using them for the Mount's corner stone is an illustration (content/moments.json `har`) | Ant. 15.11.3 (§391–392) |

Checked and correct (quotes found verbatim in both passes, with the right reference): the Ezra 3:6 invitation
(`game/hooks/avodah.js:38`, `avodah/hooks/index.js:249`), Ezra 3:4 (`game/hooks/avodah.js:46`, `avodah/hooks/index.js:258`),
Sukkah 5:7 "בשלשה פרקים בשנה היו כל משמרות שוות" (`avodah/hooks/index.js:259` — "כל משמרות" without ה is the Mishnah's
own wording), Sukkah 55b "שבעים פרים כנגד מי? כנגד שבעים אומות" (`:257`), the Sukkot card's Middot 2:6 "ולמה נקרא שמו
שער המים. שבו מכניסין צלוחית של מים של נסוך בחג" (`game/hooks/index.js:35`; its note "השלישי משערי הדרום (מדות א, ד)" is
right), all 15 stage cards in `game/content.js` (Middot 2:1, 5:1, 1:4, 2:5, 2:3 ×2, 5:4, 3:4, 3:1 ×2, 3:3, 3:6, 3:7, 4:1;
Yoma 5:2), ROUTES (Ezra 3:7; Yoma 38a; Middot 3:4), STORY (Middot 1:6; Taanit 23a; Bava Batra 4a incl. "[מימיו]"; the
Nikanor storm, Yoma 38a — the two plain-language beats match the Gemara: one door thrown in, Nikanor embraced the
other, the sea calmed, the first door came out under the ship at Akko), DONORS (Yoma 3:10 ×2), MOMENTS breaches (Middot
2:3), redLine (3:1), boxes (4:5). Josephus paraphrases: wagons/workmen/priests' garments (Ant. 15.11.2), built by the
priests in a year and six months (15.11.6) — both right. In the mini-games: Tamid 1:3 "שלום, הכל שלום", 1:4 (×6),
2:3, 2:5 ("הציתו שתי המערכות באש" is Tamid 2:5 — the older source file was cut short), 3:2, 3:4, 3:8, 3:9, 4:1, 4:3,
5:2, 5:6, 6:1, 6:3, 7:3 ("נתנו לו יין לנסך", "על כל פרק תקיעה, ועל כל תקיעה השתחויה", "זה הוא סדר התמיד לעבודת בית
אלקינו"); Zevachim 5:4 "שתי מתנות שהן ארבע", 10:1 "כל התדיר מחברו קודם את חברו"; Leviticus 6:6; Sukkah 4:5, 4:9, 5:1,
5:3, 5:4; Yoma 26a; Menachot 11:7; Yoma 6:2 (the Yom Kippur confession card, `scenes/index.js:67`).

### 2.3 Code comments (priority C)

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 31 C | minigames/art.js:106 | `"מוציאין אצבע אחת או שתים", Yoma 2:1` | `"ומה הן מוציאין, אחת או שתים", Yoma 2:1` | "אצבע" is not in the Mishnah | יומא ב, א |
| 32 C | minigames/barkai.js:3 | `"עד שבחברון"` | `"עד שהוא בחברון"` | Tamid 3:2's words (see row 23) | תמיד ג, ב |
| 33 C | minigames/deshen.js:4 | `המאוכלות` | `המאכלות` | spelling (the same word at :70, in a message to the player — row 58) | תמיד א, ד |
| 34 C | minigames/erev.js:3 | `"תמיד נשחט בשמונה ומחצה וקרב בתשע ומחצה"` | `"תמיד נשחט בשמנה ומחצה וקרב בתשע ומחצה" (Pesachim 5:1)` | spelling; name the source | פסחים ה, א |
| 35 C | avodah3d.js:596 | `"מערבי של מים ומזרחי של יין"` | `"מערבי של מים, מזרחי של יין"` | no ו in the Mishnah (the same words are in docs/AVODAH.md ⚑14 — its owner) | סוכה ד, ט |
| 36 C | avodah3d.js:609 | `at least twelve Levites on the duchan (Arachin 2:6): nine lyres, two harps, and one cymbal` | `at least twelve Levites on the duchan (Arachin 2:6); at least nine lyres and one cymbal (2:5), at least two harps (2:3)` | the Mishnah gives a minimum per instrument; "9 + 2 + 1 = 12" is our arithmetic | ערכין ב, ג; ב, ה; ב, ו |
| 37 C | avodah3d.js:624–625 (two lines) | `once the song` (end of :624) / `begins they stand beside Ben Arza,` (start of :625) | `after the first` / `tekiah–teruah–tekiah they come and stand beside Ben Arza, before the libation and the song,` | the Mishnah's order: "תקעו והריעו ותקעו. באו ועמדו אצל בן ארזא … שחה לנסך … ודברו הלוים בשיר" | תמיד ז, ג |
| 38 C | avodah3d.js:747 | `chatat below at the south-west corner (Zevachim 6:4–5)` | `chatat below at the south-west corner (Zevachim 6:2, 6:4–5)` | 6:5 names the south-east horn for the olah; the chatat's corner is in 6:2: "חטאת העוף היתה נעשית על קרן דרומית מערבית" (verified) | זבחים ו, ב; ו, ד–ה |
| 39 C | actors.js:10 and actors.js:129 | `72 each, Zevachim 88b` / `72 of each (Zevachim 88b)` | `72 bells, Zevachim 88b (R. Dosa for R. Yehuda: 36); a pomegranate between two bells (Exodus 28:33–34)` / `72 bells (Zevachim 88b); the pomegranates between them` | the Gemara counts the bells ("שבעים ושנים זגין"); the pomegranates' number is our inference | זבחים פח, ב |

Checked and correct (the task's list): Tamid 1:4 (kiddush at the kiyor — avodah3d.js:18, :295, actors.js:413), 3:4
(the gold cup, "מבקרין אותו לאור האבוקות" — :372, :412), 4:1 (head south, face west, the shochet east facing west,
"קבל המקבל", the remnant on the southern yesod — :448–479), 4:3 (the row, "ומלחום", the אליה held with the tail —
animals.js:6), 7:2 (on the Ulam steps, "the first ones" south, five vessels, hands above their heads — :650, :663), 7:3
(the Kohen Gadol "וסמך עליהן וזרקן", the two silver trumpets on the table of fats, Ben Arza's cymbal — :530, :609,
:624); Yoma 3:10 (twelve spigots — :326), 25a (the lots in Lishkat HaGazit — :319); Zevachim 19a ("שערו היה נראה בין ציץ
למצנפת" — actors.js:14), 6:5 (the olah of the bird at the south-east horn, via the sovev); Sukkah 4:9 (the two silver
bowls — :586, actors.js:259); Arachin 2:5 (six checked lambs — pens.js:5, :155, avodah3d.js:398), 2:6 (twelve
Levites); Berakhot 9:5 ("לא יכנס להר הבית במקלו, ובמנעלו" — actors.js:19); Menachot 94b ("כמין תיבה פרוצה … כמין ספינה
רוקדת" — actors.js:264). Checked at the end of the round (two passes each): Sotah 38a — the Mishnah (Sotah 7:6) runs
onto 38a: "ובמקדש על גבי ראשיהן, חוץ מכהן גדול" (avodah3d.js:663 right); Pesachim 58b "מנין שלא יהא דבר קודם לתמיד של
שחר" (avodah/index.js:235, avodah3d.js:820 right); Song 4:1 "שערך כעדר העזים" (animals.js:7 right; the colour is an
illustration, as it says); Yoma 7:5 — "כהן גדול משמש בשמנה כלים, וההדיוט בארבעה, בכתנת ומכנסים ומצנפת ואבנט"
(actors.js:6, :9 right); Rambam Klei HaMikdash 8:1 ("וארבעתן של פשתן לבנים ... והאבנט לבדו רקום בצמר"), 8:17 ("ארך
הכתנת עד למעלה מן העקב" — "to the feet" is close enough), 9:3 (72 bells, "ששה ושלשים בשולי כנף זה" — actors.js:10's
"ch. 9" is right; the pomegranates are not counted there either, so row 39 stands); Bartenura and the belt — rows 53–54.

### 2.4 `src/info.js` — the Sprint 0 cards (optional; they were checked in Sprint 0 against Torat Emet, Vilna and Kaufman)

| # | where | old | new | why | source |
|---|---|---|---|---|---|
| 40 A | info.js:63, :66, :99, :104, :119 | (63) `״ששם הנזירים מבשלים את שלמיהם, ומגלחים את שערם, ומשלחים תחת הדוד״` · (66) `״אמר ר׳ אליעזר בן יעקב: שכחתי למה היתה משמשת. אבא שאול אומר: שם היו נותנין יין ושמן, והיא היתה נקראת לשכת בית שמניה״` · (104) `״שני שערי חולדה מן הדרום, שהיו משמשין כניסה ויציאה״` · (99, 119) Josephus inside ״…״ | (63) `״ששם הנזירים מבשלין את שלמיהן, ומגלחין את שערן, ומשלחים תחת הדוד״` · (66) `״אמר רבי אליעזר בן יעקב, שכחתי מה היתה משמשת. אבא שאול אומר, שם היו נותנין יין ושמן, היא היתה נקראת לשכת בית שמניה״` · (104) `״שני שערי חלדה מן הדרום, משמשין כניסה ויציאה״` · (99, 119) drop the ״…״ or add "(בתרגום חופשי)" | wording differs from Torat Emet (unless Kaufman was followed on purpose); a translation of Josephus is not a quote | מדות ב, ה; א, ג |

**Spelling (optional, one decision — REVIEW.md ⚑48).** The Sprint 0 cards write the Mishnah plene; Torat Emet (our
convention) writes it as below. 18 replacements (40.1–40.18); each "old" string occurs once in info.js; the "new" string is
the Torat Emet text, letter for letter (Middot and Sukkah 4–5, two passes saved in earlier rounds). A dropped initial ו is restored where the quote begins
the Mishnah's sentence (40.2, 40.4), as in rows 19 and 47; after a "..." it is left out (info.js:139, "לא היתה חצר").

| # | where | old | new | spelling | source |
|---|---|---|---|---|---|
| 40.1 | info.js:5 | `צר מאחוריו ורחב מלפניו, ודומה לארי` | `צר מאחריו ורחב מלפניו, ודומה לארי` | מאחוריו→מאחריו | מדות ד, ז |
| 40.2 | info.js:10 | `מודלה על גבי כלונסות` | `ומדלה על גבי כלונסות` | מודלה→ומדלה | מדות ג, ח |
| 40.3 | info.js:15 | `עלה אמה וכנס אמה — זה היסוד; עלה חמש וכנס אמה — זה הסובב` | `עלה אמה וכנס אמה — זה היסוד ... עלה חמש וכנס אמה — זה הסובב` | ;→... | מדות ג, א |
| 40.4 | info.js:15 | `חוט של סיקרא חוגרו באמצע` | `וחוט של סקרא חוגרו באמצע` | חוט→וחוט, סיקרא→סקרא | מדות ג, א |
| 40.5 | info.js:20 | `וכבש היה לדרומו של מזבח, שלשים ושתים על רוחב שש עשרה` | `וכבש היה לדרומו של מזבח, שלשים ושתים על רחב שש עשרה` | רוחב→רחב | מדות ג, ג |
| 40.6 | info.js:30 | `רום מעלה חצי אמה ושלחה אמה, אמה אמה ורובד שלש` | `רום מעלה חצי אמה ושלחה אמה, אמה אמה ורבד שלש` | ורובד→ורבד | מדות ג, ו |
| 40.7 | info.js:30 | `והעליונה אמה אמה ורובד ארבע` | `והעליונה אמה אמה ורבד ארבע` | ורובד→ורבד | מדות ג, ו |
| 40.8 | info.js:35 | `ורביעין של ארז על גביהן, ואונקליות של ברזל` | `ורביעין של ארז על גביהן, ואנקליות של ברזל` | ואונקליות→ואנקליות | מדות ג, ה |
| 40.9 | info.js:40 | `כל העזרה היתה אורך מאה ושמונים ושבע על רוחב מאה ושלשים וחמש` | `כל העזרה היתה ארך מאה ושמונים ושבע על רחב מאה ושלשים וחמש` | אורך→ארך, רוחב→רחב | מדות ב, ו |
| 40.10 | info.js:55 | `כנגד חמש עשרה מעלות שבתהלים, שעליהן הלוים אומרים בשיר. לא היו טרוטות, אלא מוקפות כחצי גורן עגולה` | `כנגד חמש עשרה מעלות שבתהלים, שעליהן הלוים אומרים בשיר. לא היו טרוטות, אלא מקפות כחצי גרן עגלה` | מוקפות→מקפות, גורן→גרן, עגולה→עגלה | מדות ב, ה |
| 40.11 | info.js:60 | `וארבע לשכות היו בארבע מקצעותיה, של ארבעים ארבעים אמה, ולא היו מקורות` | `וארבע לשכות היו בארבע מקצועותיה, של ארבעים ארבעים אמה, ולא היו מקורות` | מקצעותיה→מקצועותיה | מדות ב, ה |
| 40.12 | info.js:65 | `היא היתה לשכת מצורעים` | `היא היתה לשכת מצרעים` | מצורעים→מצרעים | מדות ב, ה |
| 40.13 | info.js:69 | `כל הכתלים שהיו שם היו גבוהים, חוץ מכותל המזרחי — שהכהן השורף את הפרה עומד בראש הר המשחה, ומתכוון ורואה בפתחו של היכל בשעת הזיית הדם` | `כל הכתלים שהיו שם היו גבוהים, חוץ מכתל המזרחי — שהכהן השורף את הפרה עומד בראש הר המשחה, ומתכון ורואה בפתחו של היכל בשעת הזית הדם` | מכותל→מכתל, ומתכוון→ומתכון, הזיית→הזית | מדות ב, ד |
| 40.14 | info.js:79 | `גובהן עשרים אמה ורחבן עשר אמות, חוץ משל אולם` | `גבהן עשרים אמה ורחבן עשר אמות, חוץ משל אולם` | גובהן→גבהן | מדות ב, ג |
| 40.15 | info.js:84 | `בית המוקד כיפה, ובית גדול היה, מוקף רובדין של אבן, וזקני בית אב ישנים שם, ומפתחות העזרה בידם` | `בית המוקד כפה, ובית גדול היה, מקף רובדין של אבן, וזקני בית אב ישנים שם, ומפתחות העזרה בידם` | כיפה→כפה, מוקף→מקף | מדות א, ח |
| 40.16 | info.js:89 | `שם היתה סנהדרי גדולה של ישראל יושבת, ודנה את הכהונה` | `שם היתה סנהדרי גדולה של ישראל יושבת, ודנה את הכהנה` | הכהונה→הכהנה | מדות ה, ד |
| 40.17 | info.js:94 | `הר הבית היה חמש מאות אמה על חמש מאות אמה; רובו מן הדרום, שני לו מן המזרח, שלישי לו מן הצפון, מיעוטו מן המערב` | `הר הבית היה חמש מאות אמה על חמש מאות אמה; רבו מן הדרום, שני לו מן המזרח, שלישי לו מן הצפון, מעוטו מן המערב` | רובו→רבו, מיעוטו→מעוטו | מדות ב, א |
| 40.18 | info.js:139 | `ומנורות של זהב היו שם, וארבעה ספלים של זהב בראשיהן, וארבעה סולמות לכל אחד ואחד` | `ומנורות של זהב היו שם, וארבעה ספלים של זהב בראשיהן, וארבעה סלמות לכל אחד ואחד` | סולמות→סלמות | סוכה ה, ב |

info.js:139 ("תנא: גובהה של מנורה חמשים אמה", Sukkah 52b) was verified at the end of the round; its source string is right.

### 2.5 `src/avodah/data.js` — superseded by the content switch (§4)

The 20 `FALLBACK` texts now live in `content/avodah_fallbacks.json` with the same ids. Differences from the strings in
data.js: `payis_circle`, `payis_count`, `gazit`, `ketoret_once` are Bavli → `quote` without nikud, `quote_nikud: null`
(the convention); `payis_circle` now quotes the baraita from "והכהנים מוקפין ועומדין" to "פייס מתחיל" (its first half,
the chamber, is `gazit`), with "ועומדין" settled by a third pass, and a summary that names the mitznefet;
`payis_count` quoted the Gemara in reverse order ("אסור למנות … הוציאו אצבעותיכם") — now in the Gemara's order
("הוציאו אצבעותיכם למנין ... אסור למנות את ישראל אפילו לדבר מצוה"); `ketoret_once` quotes the whole baraita with R.
Chanina's reason, and its summary quotes "חדשים לקטרת"; `shoevah_dance` had "וְהַלְוִיִּים" — the Mishnah has
"וְהַלְוִיִּם"; `aravot` says "וביום השביעי" instead of "בהושענא רבה" (the Mishnah's words); `kiyor` cites Yoma 37a for
the reason in its summary. All the other texts are unchanged.

### 2.6 Other files (outside this round's list; found by the same sweep — optional)

| # | where | old | new | why | source (2 passes) |
|---|---|---|---|---|---|
| 41 A | sanctuary.js:73 (comment) | `"גביעים כמין כוסות אלכסנדריים, כפתורים כמין תפוחי הכרתיים, פרחים כמין ציורים שבעמודים"` | `"גביעין ... כמין כוסות אלכסנדריים, כפתורים ... כמין תפוחי הכרתיים, פרחים ... כמין פרחי העמודין"` | the Gemara: "פרחים למה הן דומין כמין פרחי העמודין" (not "ציורים"); "למה הן דומין" was dropped without "..." | מנחות כח, ב |
| 42 A | sanctuary.js:144 (comment) | `"כדי שתהא הרוח מנשבת בהן"` | `"כדי שתהא הרוח מנשבת ביניהן"` | wording | מנחות יא, ה |
| 43 A | tex.js:379 (comment) | `"עביה טפח, ועל שבעים ושנים נימין נארגת, ועל כל נימה ונימה עשרים וארבעה חוטין"` | `"עביה טפח, ועל שבעים ושתים נימין נארגת, ועל כל נימא ונימא עשרים וארבעה חוטין"` | "ושתים", "נימא" | שקלים ח, ה |
| 44 A | temple.js:361 (comment) | `"שני פתחים היו לבית המוקד, אחד פתוח לחיל ואחד פתוח לעזרה"` | `"שנים שערים היו לבית המוקד, אחד פתוח לחיל ואחד פתוח לעזרה"` | wording | מדות א, ז |
| 45 A | places.js:59 (comment) | `"על קרן צפונית מערבית בטבעת שנייה"` | `"על קרן צפונית מערבית, על טבעת שניה"` | "על טבעת" | תמיד ד, א |
| 46 B | places.js:26 (comment) | `"משניטל הארון` | `"משנטל הארון` | spelling (as row 6) | יומא ה, ב |
| 47 B | places.js:37 (comment) | `"אבן היתה לפני המנורה ובה שלש מעלות"` | `"ואבן היתה לפני המנורה ובה שלש מעלות"` | the ו was dropped | תמיד ג, ט |
| 48 B | avodah/ui.js:164 | `"אינה דוחה לא את השבת ולא את יום טוב"` | `"שאינה דוחה לא את השבת ולא את יום טוב"` | the ש was dropped | סוכה ה, א |
| 49 B | temple.js:358, :363, :377, :381, :420, :481 (comments) | `"בית המוקד כיפה"` · `"כקיטוניות פתוחות לטרקלין"` · `"מוקף רובדין של אבן"` · `בין קודש לחול"` · `נפסלים בלינה"` · `"כמין שני חוטמין דקין"` | `"בית המוקד כפה"` · `"כקיטונות פתוחות לטרקלין"` · `"מקף רובדין של אבן"` · `בין קדש לחל"` · `נפסלין בלינה"` · `"כמין שני חטמין דקין"` | spelling | מדות א, ו; א, ח; ג, ב; יומא ג, י |
| 50 B | calendar.js:345, avodah/schedule.js:165 (comments) | `"סוכה וניסוך המים, שבעה"` / `סכה וניסוך המים, שבעה"` | `"סכה ונסוך המים, שבעה"` / `סכה ונסוך המים, שבעה"` | spelling | סוכה ד, א |
| 51 B | calendar.js:376 (comment) | `"כל הלילה כשר לקצירת העומר ולהקטר חלבים ואברים"` | `"כל הלילה כשר לקצירת העמר ולהקטר חלבים ואברים"` | spelling | מגילה ב, ו |
| 52 B | avodah/ui.js:197 | `"אלו הן הממונין שהיו במקדש"` | `"אלו הן הממנין שהיו במקדש"` | spelling; note: the two passes differ on the ending (ממנין / ממנים) | שקלים ה, א |

Checked and correct in these files: calendar.js:338 and :366 ("בין דם לאברים", "בין אברים לנסכים" — Yoma 3:5, fetched this
round), calendar.js:445 (Taanit 29a, Yehoyariv's watch); and, at the end of the round: calendar.js:317–318 (Yoma 1:8
verbatim; Bartenura there: "והיו משכימין מן האשמרת הראשונה שהיא שליש הלילה"), calendar.js:355–357 (Pesachim 58b "שלא
יהא דבר קודם לתמיד של שחר"; Pesachim 59a "ואין לך דבר שמתעכב אחר תמיד של בין הערבים אלא קטרת ונרות ופסח ומחוסר
כפורים"; Temurah 2:1 "וקרבנות היחיד אינן דוחים לא את השבת" — Torat Emet has "דוחים" here; Beitzah 19a "נדרים ונדבות אין
קריבין ביום טוב"), tex.js:380 (Yoma 71b "מפרוכת מה להלן עשרים וארבעה"; "six each" of the four kinds is Rashi there — right).

### 2.7 Added at the end of the round — the comment refs left open, the archaeology of `FINDS`, two unmarked quotes

| # | where | old | new | why | source |
|---|---|---|---|---|---|
| 53 C | avodah3d.js:715–716 (comment) | `(Middot 1:4; the name: "where the most holy offerings` / `were brought in" — Bartenura there)` | `(Middot 1:5; the name: "where the most holy offerings` / `slaughtered in the north were brought in" — Bartenura there: "שם מכניסים קדשי קדשים ששחיטתן בצפון")` | שער הקרבן is one of the northern gates, Middot 1:5 ("שני לו, שער הקרבן"); 1:4 has the southern gates and Nikanor | מדות א, ה; ברטנורא שם (2 passes) |
| 54 C | actors.js:8 (comment) | `(Rambam, Klei HaMikdash ch. 8; ends hanging in front: illustration)` | `(Rambam, Klei HaMikdash 8:1, 8:19 — three fingers wide, 32 amot, "כרך על גבי כרך"; the height "כנגד אצילי ידיו" is 10:1 and Zevachim 19a; ends hanging in front: illustration)` | the elbow height is not in ch. 8 | רמב״ם כלי המקדש ח, א; ח, יט; י, א; זבחים יט, א (2 passes) |
| 55 opt. | game/content.js:173 `FINDS.trumpet.ref` | `'ארכאולוגיה: חפירות ב. מזר, 1968'` | `'ארכאולוגיה: חפירות ב. מזר, 1968 · מוזיאון ישראל'` | the museum record (Israel Museum, via the national museums portal, item IMJ 191539): "Western Wall excavations at the south-western corner of the Temple Mount"; "it apparently fell from the southwest corner of the Temple Mount to the street below" — the card's text is right (1968, B. Mazar: Wikipedia, Madain Project) | as in "why" |
| 56 A | game/content.js:174 `FINDS.warning` | `ושבר נוסף נמצא ב-1936 (היום במוזיאון ישראל).` and `ref: 'ארכאולוגיה: ש. קלרמון־גנו, 1871'` | `ושבר של עותק נוסף נמצא ב-1935, מחוץ לשער האריות (היום במוזיאון ישראל).` and `ref: 'ארכאולוגיה: ש. קלרמון־גנו, 1871 · ג׳. ה. איליף, 1936'` | the fragment was found in December 1935, in road works outside the Lions' Gate (Iliffe's report, as quoted in Wikipedia; also Times of Israel, Armstrong Institute), and published by J. H. Iliffe, QDAP 6 (1936), pp. 1–3 — the "1936" of Wikipedia's summary line is the publication. The complete tablet: 1871, Clermont-Ganneau, Istanbul Archaeology Museums — right | as in "why" |
| 57 opt. | game/content.js:175 `FINDS.bigstone` | `באורך 13.55 מטר ובגובה 3.3 מטר.` and `ref: 'ארכאולוגיה: מנהרות הכותל'` | `באורך כ-13.6 מטר ובגובה כ-3.3 מטר.` and `ref: 'ארכאולוגיה: מנהרות הכותל · הקרן למורשת הכותל המערבי'` | the figures are approximate: Wikipedia 13.55 × 3.3 m (the exposed face), the Western Wall Heritage Foundation "approx. 13.60 … approx. 3.3" (depth 2–4.6 m, 285–570 tons, both estimates) | as in "why" |
| 58 B | minigames/deshen.js:70 (`api.miss`, shown to the player) | `'חתה מן המאוכלות הפנימיות — ` | `'"חתה מן המאכלות הפנימיות" (תמיד א, ד) — ` | an unmarked quote in the source's words, plene "המאוכלות" (the same word as row 33, in the comment) | תמיד א, ד (2 passes) |
| 59 B | minigames/ketoret.js:150 (`api.miss`) | `'לא היה המקטיר מקטיר עד שהממונה אומר לו "הקטר".'` | `'"לא היה המקטיר מקטיר עד שהממנה אומר לו, הקטר" (תמיד ו, ג).'` | an unmarked quote: the Mishnah's words, "שהממנה" | תמיד ו, ג (2 passes) |

## 3. Refs the other agents can rely on (unchanged)

The ids of Sprint 2 (docs/CONTENT-S2.md §2) are unchanged. New ids this round are listed in §4–§6.

## 4. The fallback switch — `content/avodah_fallbacks.json`

An array of 20 items, ids exactly as `data.js FALLBACK`: `payis_circle payis_fingers payis_count payis_race
ketoret_once kiyor deshen_walk deshen_place wood menorah_stone red_line aravot aravot_shabbat shoevah_dance kelim_1_9
bowls mukhni six_lambs levites_instruments gazit`. Each has `id, name_he, summary_he, quote, quote_nikud, source, status:
"draft", needs_check, note, fallback: true` and `games[]` (the mini-games in `GAMES` that show it). Suggested code (the
supervisor's): in data.js, `import fbJson from '../../content/avodah_fallbacks.json' with { type: 'json' };` and
`export const FALLBACK = Object.fromEntries(arr(fbJson).filter((x) => x && x.id).map((x) => [x.id, { ...x, fallback: true }]));`
— `card()` already prefers `quote_nikud` and falls back to `quote`. `BLEMISHES` can stay (its seven ids are covered by
`content/animals.json: blemishes` — `ear-cartilage`→`ear_notch`, `ear-split`→`ear_split`, `eyelid`→`eyelid`,
`eye-white`→`eye_streak`, `nose`→`nose`, `lip`→`lip`; `ear-skin` is the "not the skin" half of `ear_notch`).

## 5. The Avodah gaps — `content/avodah_gaps.json`

See the file (ids): `payis_method` (the lottery: the race and the accident, the fingers, "count fingers, not people",
the mitznefet that marks where the count starts, the circle in Lishkat HaGazit; the reason for counting fingers is the
fallback `payis_count`; **the count itself** — a large number, counted over the fingers around the circle from the
mitznefet, and the kohen at whose finger it ends wins — Rambam Temidin uMusafin 4:3 and Bartenura on Yoma 2:1, verified
at the end of the round, so the item no longer needs_check; left for ⚑20: two fingers — Rambam: every finger shown
counts, the thumb never; Bartenura: a sick kohen's two count as one; `game.count`, `game.two_fingers`), `shir_perakim`
(three פרקים per song — Rashi on Sukkah 53b, on Mishnah 5:5; the nine blasts), `shir_musaf_days` (the psalms of Chol
HaMoed Sukkot, Sukkah 55a), `shir_shabbat_musaf_mincha` (Rosh Hashanah 31a), `shir_afternoon` ⚑ (that there was a song:
the Rambam, Klei HaMikdash 3:2 — "on every obligatory public olah ... at the libation of the wine", verified at the end
of the round; which psalm: secondary only), `aravot_timing` ⚑ (and the aravot's height, Sukkah 45a),
`shoevah_when_where` (Sukkah 5:2 — the first night, Ezrat Nashim; with pointers to festivals.json 5:2–5:4),
`kiddush_posture` (pointer to kiyor.json `kiddush_how`, Zevachim 19b), `erev_eleven` (the afternoon's eleven kohanim,
Yoma 2:5), `trumpets_count` (Sukkah 5:5, Arakhin 2:3).

## 6. Missing sources — delivered

- `content/moments.json` +4: `har` (the great stone: Middot 2:1; Josephus Ant. 15.11.3, free translation; Bava Batra 4a),
  `sorag` (the 13 breaches: Middot 2:3; the chel, Kelim 1:8; the warning inscription, War 5.5.2 free translation),
  `nikanor_storm` (Yoma 38a, verbatim, the three segments), `heichal_facade` (War 5.5.6, free translation, marked, with
  Whiston's English in `reference_en`).
- `content/mysteries.json` +1: `five_missing` (Yoma 21b: "אלו חמשה דברים שהיו בין מקדש ראשון למקדש שני …").
- `content/heichal.json: parochet` +4 views (Bavli and Rashi, unvocalized): Yoma 71b "ויליף משזר משזר מפרוכת מה להלן
  עשרים וארבעה" and Rashi there (four kinds, each six-fold); Menachot 44a (the chilazon and the techelet); Megillah 6a
  "תני רב יוסף שפוני זה חלזון" (Zebulun's portion). These are the sources GDD §5 asks to verify before the techelet
  route is used ("verify Megillah 6a / Menachot 44a before use") — now verified; whether to add the route is REVIEW ⚑42.

## 7. Re-check of the whole content database

With the new sources, `check.mjs` (fill `quote` from `quote_nikud`; every quoted segment against both passes) now passes
with **0 problems on all 18 content files — 575 segments** (563 at first; at the end of the round +4 in `heichal.json:
parochet`, +7 in `avodah_gaps.json: payis_method`, +1 in `shir_afternoon`). Sources added for the re-check: Numbers
28–29; Leviticus 2:2, 6:2, 23:12–19, 24:8; Mishnah Tamid 2:1–4, 3:5; Yoma 1:8; Zevachim 5, 6:1–3; Shekalim 1:1–3, 5:1–4;
Menachot 4:5, 10:3–5, 11:4; Bikkurim 3:2–4; Pesachim 5:5–9; Megillah 2:6; I Chronicles 24:7–18; Bavli Yoma 19a, 33a,
Pesachim 58b, Taanit 27a–b, 29a; Rambam Temidin uMusafin 6:11, Maaseh HaKorbanot 5:6. Where the passes differed:
Shekalim 1:3 "יושבין"/"יושבים" (a third pass: "יושבין", as quoted); Shekalim 5:1 "הממנין"/"הממנים", Pesachim 5:10,
Bikkurim 3:4 — words not quoted; Numbers 29:17–39 — the v3 pass dropped a verse twice, so three v3 fetches were combined
(each verse is present in v3 at least once); Kelim 1:9 "וְרַגְלָיִם"/"וְרַגְלַיִם" — four passes split (v1 twice kamatz,
v3 twice patach); at the end of the round one more pass of each gave patach, so the v1 reading is not stable either —
still needs_check (a printed edition would settle it; the content keeps the kamatz form for now).

Content changes this required: tamid.json — the Bavli segments (Yoma 33a, Pesachim 58b in hatavat_5, hatavat_2,
limbs_to_altar, mincha_chavitin, musafim) were shown with the vocalized edition's nikud; they are now unvocalized, per
the convention, and Leviticus 6:2 keeps the Masoretic rafe ("מוֹקְדָהֿ"). mishmarot.json — `destruction` had "הייתה"
(the Gemara: "היתה") and Bavli nikud/punctuation; `return_from_exile` unvocalized, and it no longer needs_check: Taanit
27b ("וכן התנו נביאים שביניהם שאפילו יהויריב ראש משמרת עולה לא ידחה ידעיה ממקומו") shows the 24 names were kept in the
Second Temple. Checker fixes (scratch tool only): the Name א-ל written with a hyphen matches "אל"; a space left before
punctuation by a removed "(reference)" is dropped; Masoretic {ס}/{פ} marks are ignored. Archaeology (not quotes): first
checked on Wikipedia, then, at the end of the round, against a second source and the museum records: the complete
warning tablet (1871, Clermont-Ganneau, Istanbul) and the Trumpeting Place inscription (1968, B. Mazar, Israel Museum)
are right; the fragment of the warning inscription was found in 1935 and published in 1936 (row 56); the Western Stone's
figures are approximate (row 57).
