/* ─────────────────────────────────────────────────────────────────────────────
 * kings/data.js — the partners, their offers, the texts (KINGS, wave 6).
 *
 * Every text is a DRAFT (the UI tags it "טיוטה") with its source. Dialogue is dramatization ("המחשה").
 * `illus: true` = the sources are silent and this is our illustration (a ⚑ for the owner).
 * Quotes (`q`) are verbatim only where already verified in content.js; everything else is a free paraphrase.
 * Never a Divine Name here (write ה׳). Portraits: art.js (stylized, no likeness, no cult symbols).
 * ──────────────────────────────────────────────────────────────────────────── */

/** Resource keys = BUILD's meter. */
export const RES = {
  cedar: 'ארז', bronze: 'נחושת', gold: 'זהב', silver: 'כסף', stone: 'אבן', wstone: 'אבנים שלמות',
};

/** Relationship levels (points needed) and their names. */
export const LEVELS = [
  { at: 0, n: 'זרים' }, { at: 2, n: 'מכרים' }, { at: 5, n: 'ידידים' }, { at: 9, n: 'ידידים קרובים' }, { at: 14, n: 'נאמנים' },
];

/* ── the partners ── */
export const PARTNERS = [
  {
    id: 'tyre', n: 'סוחרי צור וצידון', short: 'צור וצידון', who: 'ראש הסוחרים', place: 'tyre', port: 'jaffa', seal: 'cedar',
    illus: true,
    lines: [
      'שלום לך, בונה מירושלים. ארזי הלבנון גבוהים וישרים, ראויים לבית גדול.',
      'נקשור אותם לרפסודות ונשיט אותם לאורך החוף, עד ים יפו.',
    ],
    facts: [
      { d: 'בימי שיבת ציון נתנו לצידונים ולצורים מאכל, משתה ושמן, כדי שיביאו ארזים מן הלבנון אל ים יפו.', q: 'וּמַאֲכָל וּמִשְׁתֶּה וָשֶׁמֶן לַצִּדֹנִים וְלַצֹּרִים לְהָבִיא עֲצֵי אֲרָזִים מִן־הַלְּבָנוֹן אֶל־יָם יָפוֹא', ref: 'עזרא ג, ז' },
      { d: 'בבית של הורדוס חיברו קורות ארז את קיר ההיכל לקיר האולם, כדי שהקיר לא יבלוט.', q: 'וּכְלוֹנָסוֹת שֶׁל אֶרֶז הָיוּ קְבוּעִין מִכָּתְלוֹ שֶׁל הֵיכָל לְכָתְלוֹ שֶׁל אוּלָם, כְּדֵי שֶׁלֹּא יִבְעָט', ref: 'משנה מידות ג, ח' },
      { d: 'על עסקת ארזים עם צור בימי הורדוס אין מקור: זו המחשה בדרך של שיבת ציון. שם שילמו במאכל, משתה ושמן; כאן משלמים בכסף.', ref: 'המחשה', illus: true },
    ],
  },
  {
    id: 'rome', n: 'אוגוסטוס קיסר', short: 'רומא', who: 'הקיסר', place: 'rome', port: 'jaffa', seal: 'ingot',
    lines: [
      'הורדוס ידידי כתב לי על הבית שהוא בונה בירושלים.',
      'מכרות הנחושת של קפריסין עשירים. שלח משלחת לרומא, ונחתום הסכם.',
      'הדרך לרומא ארוכה, אבל ההסכם יחזיק שנים.',
    ],
    facts: [
      { d: 'הורדוס נתן לקיסר שלוש מאות כיכרות כסף לחגיגות ולמתנות לעם רומא, והקיסר נתן לו מחצית מהכנסות מכרות הנחושת של קפריסין ומסר לידיו את ניהול המחצית השנייה.', ref: 'יוספוס, קדמוניות היהודים טז, 4, 5 (בתרגום חופשי)' },
      { d: 'שהנחושת הזאת הגיעה לבניין המקדש, זו המחשה. המתנה במשחק קטנה בהרבה משלוש מאות כיכרות.', ref: 'המחשה', illus: true },
    ],
  },
  {
    id: 'adiabene', n: 'הילני המלכה ומונבז המלך', short: 'חדייב', who: 'המלכה והמלך', place: 'adiabene', port: null, seal: 'lamp',
    gift: true,
    lines: [
      'שמענו בחדייב שהבית בירושלים נבנה מחדש. ספר לנו איך מתקדמת העבודה.',
      'מתנה למקדש אינה מקח וממכר. כתוב לנו, ונשלח את מה שלבנו נדב.',
    ],
    facts: [
      { d: 'הילני המלכה ובנה מונבז, מלכי חדייב, התגיירו. בשנת רעב קנתה הילני תבואה באלכסנדריה ודבלים בקפריסין לעניי ירושלים.', ref: 'יוספוס, קדמוניות היהודים כ, ב–ד (בתרגום חופשי)' },
      { q: 'מֻנְבַּז הַמֶּלֶךְ הָיָה עוֹשֶׂה כָל יְדוֹת הַכֵּלִים שֶׁל יוֹם הַכִּפּוּרִים שֶׁל זָהָב', ref: 'משנה יומא ג, י' },
      { q: 'הִילְנִי אִמּוֹ עָשְׂתָה נִבְרֶשֶׁת שֶׁל זָהָב עַל פִּתְחוֹ שֶׁל הֵיכָל', ref: 'משנה יומא ג, י' },
      { d: 'המשחק מפגיש דמויות מדורות שונים: הילני ומונבז חיו כשני דורות אחרי הורדוס, בזמן שהעבודה בהר הבית עוד נמשכה.', ref: 'המחשה', illus: true },
    ],
  },
  {
    id: 'nikanor', n: 'ניקנור מאלכסנדריה', short: 'אלכסנדריה', who: 'ניקנור', place: 'alexandria', port: 'akko', seal: 'door',
    quest: true,
    lines: [
      'שלום עליכם. באלכסנדריה יוצקים נחושת שמאירה כמו זהב.',
      'את הדלתות לשער אביא בעצמי, בספינה, דרך הים הגדול.',
    ],
    facts: [
      { q: 'כְּשֶׁהָלַךְ נִיקָנוֹר לְהָבִיא דְּלָתוֹת מֵאֲלֶכְּסַנְדְּרִיָּא שֶׁל מִצְרַיִם, בַּחֲזִירָתוֹ עָמַד עָלָיו נַחְשׁוֹל שֶׁבַּיָּם לְטַבְּעוֹ', ref: 'בבלי יומא לח, א' },
      { d: 'כל השערים הוחלפו בשערי זהב, חוץ משערי ניקנור, בגלל הנס שנעשה בהם. ויש אומרים: כי הנחושת שלהם זוהרת כמו זהב.', ref: 'משנה מידות ב, ג (בלשון פשוטה)' },
      { d: 'בהר הצופים נמצאה ב-1902 גלוסקמה ועליה כתובת ביוונית על ניקנור האלכסנדרוני "שעשה את הדלתות". היום במוזיאון הבריטי.', ref: 'ארכאולוגיה: גלוסקמת ניקנור, הר הצופים 1902 · המוזיאון הבריטי' },
    ],
  },
  {
    id: 'petra', n: 'סוחרי הנבטים מפטרה', short: 'פטרה', who: 'ראש השיירה', place: 'petra', port: null, seal: 'camel',
    illus: true,
    lines: [
      'מפטרה יוצאות שיירות גמלים עם בשמים אל כל הארצות.',
      'השיירה עוברת במדבר מבאר לבאר, ומגיעה בשלום.',
      'זהב תמורת כסף, במחיר הוגן.',
    ],
    facts: [
      { d: 'פטרה הייתה עיר הנבטים. סוחרי גמלים הלכו ממנה ואליה, והביאו בשמים מערב דרך פטרה אל חוף הים.', ref: 'סטרבון, גאוגרפיה 16.4.21–24 (בתרגום חופשי)' },
      { d: 'הנבטים מכרו בעיקר בשמים. זהב מפטרה למקדש הוא המחשה, בלי מלך ובלי עסקה עם אדם שחי באמת.', ref: 'המחשה', illus: true },
    ],
  },
];
export const PIDX = Object.fromEntries(PARTNERS.map((p, i) => [p.id, i]));

/* ── the offers ──
 * gives: what arrives · cost: silver · min: voyage minutes (real time; demo ×60) · lvl: relationship needed ·
 * once: one time only · ftue: only before the first deal with this partner · needs/until: a flag · sets: a flag on unload ·
 * gate: building milestones (BUILD's G.st) · storm: Nikanor's storm (a told event) ·
 * pts: relationship points on unload (default 1) · item: a special thing (event kingsItem) · gift: no price, ever. */
export const OFFERS = [
  // צור וצידון · ארז
  { id: 'tyre_taste', p: 'tyre', n: 'רפסודת ניסיון', d: 'רפסודה קטנה, כדי להכיר.', gives: { cedar: 60 }, cost: 5, min: 3, ftue: true },
  { id: 'tyre_raft', p: 'tyre', n: 'רפסודות ארזים', d: 'זול ואיטי: רפסודות לאורך החוף.', gives: { cedar: 80 }, cost: 15, min: 45 },
  { id: 'tyre_fast', p: 'tyre', n: 'ספינה מהירה', d: 'אותו מטען בשליש מהזמן, בכפל מחיר.', gives: { cedar: 80 }, cost: 30, min: 15 },
  { id: 'tyre_bulk', p: 'tyre', n: 'שיירת רפסודות', d: 'פי שלושה ארזים, זול יותר לכל קורה, אבל ארוך.', gives: { cedar: 240 }, cost: 40, min: 180, lvl: 1 },
  // רומא · נחושת קפריסין
  { id: 'rome_market', p: 'rome', n: 'נחושת בשוק קפריסין', d: 'בלי הסכם: מחיר מלא.', gives: { bronze: 50 }, cost: 30, min: 60, until: 'treaty' },
  { id: 'rome_embassy', p: 'rome', n: 'משלחת אל הקיסר', d: 'מתנה גדולה פעם אחת; אחריה הנחושת זולה בהרבה.', gives: { bronze: 60 }, cost: 120, min: 240, once: true, sets: 'treaty', pts: 3, illus: true },
  { id: 'rome_mines', p: 'rome', n: 'נחושת ממכרות קפריסין', d: 'לפי ההסכם: משלמים רק על ההובלה.', gives: { bronze: 120 }, cost: 20, min: 90, needs: 'treaty' },
  // חדייב · זהב במתנה (אין מחיר, לעולם)
  { id: 'adi_first', p: 'adiabene', n: 'איגרת ראשונה', d: 'ספר להם שההר שוטח והיסודות מוכנים.', gives: { gold: 40 }, cost: 0, min: 120, once: true, gift: true, gate: 'har', pts: 2 },
  { id: 'adi_monbaz', p: 'adiabene', n: 'ידות הזהב של מונבז', d: 'ספר להם שהמזבח עומד. מונבז שולח זהב לידות הכלים.', gives: { gold: 80 }, cost: 0, min: 180, once: true, gift: true, gate: 'karnot', pts: 2 },
  { id: 'adi_helena', p: 'adiabene', n: 'הנברשת של הילני', d: 'ספר להם שהאולם נבנה. הילני שולחת נברשת של זהב לפתח ההיכל.', gives: { gold: 120 }, cost: 0, min: 240, once: true, gift: true, gate: 'ulam', pts: 3, item: 'lamp' },
  // ניקנור · דלתות הנחושת (משימה)
  { id: 'nik_doors', p: 'nikanor', n: 'דלתות הנחושת של ניקנור', d: 'ניקנור מביא את הדלתות בעצמו. משלמים רק על העגלות מעכו.', gives: { bronze: 150 }, cost: 20, min: 300, once: true, gate: 'nikanor', storm: 0.55, pts: 4, item: 'doors' },
  // פטרה · זהב תמורת כסף (המחשה)
  { id: 'petra_small', p: 'petra', n: 'שיירת זהב', d: 'שיירה קטנה במדבר, מבאר לבאר.', gives: { gold: 30 }, cost: 35, min: 120, illus: true },
  { id: 'petra_big', p: 'petra', n: 'שיירה גדולה', d: 'פי שלושה זהב, ארבע שעות.', gives: { gold: 100 }, cost: 100, min: 240, lvl: 1, illus: true },
];
export const OIDX = Object.fromEntries(OFFERS.map((o, i) => [o.id, i]));


/** Building-milestone gates (BUILD's stage ids) and how the court says them. */
export const GATES = {
  har: 'אחרי שיטוח ההר',
  karnot: 'אחרי שהמזבח נשלם',
  ulam: 'אחרי שהאולם נבנה',
  nikanor: 'כשמגיעים לשער ניקנור',
};

/* ── the voyage legs, per partner: [kind, path, from, to, share] (share of the voyage time; paths in geo.js) ── */
export const LEGS = {
  tyre: [['sea', 'tyre', 0, 1, 0.72], ['cart', 'jaffa', 0, 1, 0.28]],
  rome: [['sea', 'cyprus', 0, 1, 0.72], ['cart', 'jaffa', 0, 1, 0.28]],
  rome_embassy: [['sea', 'rome', 1, 0, 0.42], ['court', 'rome', 0, 0, 0.08], ['sea', 'rome', 0, 1, 0.38], ['cart', 'jaffa', 0, 1, 0.12]],
  adiabene: [['letter', 'adiabene', 1, 0, 0.3], ['court', 'adiabene', 0, 0, 0.05], ['road', 'adiabene', 0, 1, 0.65]],
  nikanor: [['sea', 'alex', 0, 1, 0.7], ['cart', 'akko', 0, 1, 0.3]],
  petra: [['road', 'petra', 0, 0.5, 0.5], ['road', 'petra', 0.5, 1, 0.5]],
};

/* ── the seals (one per court: earned with the first cargo unloaded) ── */
export const SEALS = {
  tyre: { n: 'חותם צור וצידון' },
  rome: { n: 'חותם ההסכם' },
  adiabene: { n: 'חותם חדייב' },
  nikanor: { n: 'חותם ניקנור' },
  petra: { n: 'חותם השיירה' },
};

/* ── letters: earned at relationship levels (p + lvl) or by an event (ev). Dramatized, dignified, short. ── */
export const LETTERS = [
  { id: 'agrippa', p: 'rome', ev: 'agrippa', from: 'מירושלים', t: 'מרקוס אגריפס, ידידו של הקיסר, ביקר בירושלים בהזמנת הורדוס. לפי יוספוס הקריב מאה שוורים וערך משתה לעם.', ref: 'יוספוס, קדמוניות היהודים טז, 2, 1 (בתרגום חופשי)', fact: true },
  { id: 'monbaz2', p: 'adiabene', lvl: 2, from: 'על מונבז', t: 'בשנות בצורת חילק מונבז את אוצרותיו ואת אוצרות אבותיו. כשהוכיחו אותו אמר: ״אֲבוֹתַי גָּנְזוּ לְמַטָּה, וַאֲנִי גָּנַזְתִּי לְמַעְלָה״.', ref: 'בבלי בבא בתרא יא, א', fact: true },
  { id: 'helena', p: 'adiabene', ev: 'adi_helena', from: 'מהילני המלכה', t: 'נברשת של זהב לפתח ההיכל. מסופר שכשהשמש זרחה נצצו ממנה ניצוצות, וכולם ידעו שהגיע זמן קריאת שמע.', ref: 'משנה יומא ג, י · בבלי יומא לז, ב (בלשון פשוטה)', fact: true },
  { id: 'storm', p: 'nikanor', ev: 'storm', from: 'כך מסופר', t: 'בדרך חזרה קם נחשול. המלחים השליכו דלת אחת לים. כשרצו להשליך גם את השנייה, חיבק ניקנור את הדלת ואמר: השליכו אותי איתה. מיד נח הים מזעפו.', ref: 'בבלי יומא לח, א (בלשון פשוטה)', fact: true },
  { id: 'akko', p: 'nikanor', ev: 'nik_doors', from: 'בנמל עכו', t: 'כשהגיעה הספינה לנמל עכו, יצאה הדלת הראשונה מתחת לדופן הספינה. שתי הדלתות הגיעו לירושלים.', ref: 'בבלי יומא לח, א (בלשון פשוטה)', fact: true },
];

/** What each level gives, told in the court. */
export const PERKS = { 2: 'הנחה של 15% בכל ההצעות', 4: 'המסעות מהירים ברבע' };
