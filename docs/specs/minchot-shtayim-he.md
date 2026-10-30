# שתי המנחות — מנחת הנסכים של התמיד ומנחת סולת של יחיד (אפיון הבעלים, 21.10.2026 09:40)

> הנוסח האנגלי שהודבק בצ׳אט, ואחריו הקובץ העברי המצורף, ואחריהם הערות Claude. רקע ומקורות: `minchat-solet-he.md`.

## הנוסח האנגלי (מילה במילה)

Claude, please apply this crucial Halachic and gameplay correction to the Minchah (Flour Offering) logic:

We must divide Flour Offerings into TWO distinct gameplay modules to reflect exact sources:

1. DAILY NESACHIM FLOUR OFFERING (ROLE_TAMID_FLOUR) - PART OF LOTTERY 2
- Context: 7th Priest in the second lottery ("עשירית האיפה סלת... בלולה בשמן").
- Rules: NO Frankincense (לבונה), NO Touch/Presentation (הגשה), NO Kemitza (קמיצה).
- Burn Status: 100% burned on Altar (אין בהם לכהנים).
- Execution Order: Organ Parts -> Daily Flour -> High Priest Chavitin -> Wine Libation (יומא לג ע"א).
- Gameplay Flow:
  1. Walk & Balance: Carry flour bowl down the ramp (Southwest lower half).
  2. Altar Ascent: Carry up to top of Great Altar.
  3. Salting & Fire Launch: Salt the flour at Altar top (מנחות כא ע"ב) -> Drag Right Thumb forward to toss entirely into the fire.

2. PRIVATE INDIVIDUAL FLOUR OFFERING (MODE_PRIVATE_MINCHAH) - HARD FUN MODULE
- Context: Private offering brought by an individual (ויקרב ב'). Contains oil & frankincense.
- Core Feature: Features "Kemitza" - labeled in Menachot 11a as "עבודה קשה שבמקדש".
- Step-by-Step Gameplay & Control Spec (Retry on error):
  * Step 1: Receiving & Approach — Left Thumb: Walk towards Altar. Action: Tap to receive vessel from owner.
  * Step 2: Presentation ("Hagashah") — Left Thumb: Walk to Southwest corner. Right Thumb: Drag bowl until it directly touches the sharp tip of the Southwestern corner ("חודה של קרן"). Error Condition: Missing the exact tip angle.
  * Step 3: Frankincense Displacement & Kemitza ("Avodah Kasheh") — Right Thumb: Swipe gestures to clear Frankincense grains away from the scoop zone. Error Condition: Any frankincense grain remaining in scoop zone = DISQUALIFIED ("פסל"). Multi-Touch Kemitza: Hold-to-close with 3 middle fingers. Fill meter indicates volume. Error Condition: Oversized ("יתר" / bulging) or Undersized ("חסר" / fingertips only) = DISQUALIFIED.
  * Step 4: Sanctification & Frankincense Return — Right Thumb: Tap to place scooped flour into sacred vessel, then drag Frankincense back on top of it.
  * Step 5: Altar Ascent, Salting & Offering — Left Thumb: Walk up ramp to Altar top. Right Thumb: Tap to salt -> Drag forward to scatter onto fire. Remaining Flour: Allocated to Cohanim ("והנותרת... לאהרן ולבניו").

Please acknowledge and confirm that you have separated the Daily Nesachim Flour Offering from the Private Kemitza Offering according to these exact rules.

## הנוסח העברי (הקובץ המצורף, מילה במילה)

הנה האפיון המלא של שתי המנחות בשפה ברורה, קבילה וויזואלית, כך שתוכל לראות ולהרגיש בדיוק מה השחקן חווה על המסך, שנייה אחר שנייה.🏛️ אפיון מעודכן: שתי המנחות בבית המקדשאיפסנו והפרדנו לחלוטין בין מנחת הנסכים של התמיד (חלק מ-13 תפקידי הפיס בבוקר) לבין מנחת סולת של אדם פרטי (המודול המורכב של הקמיצה).🌅 מודול 1: מנחת הנסכים של התמיד (ROLE_TAMID_FLOUR)מה זה? המנחה שמוגרלת בפיס השני בבוקר. מנחה מהירה, נקייה וזורמת. אין בה לבונה, אין בה הגשה לקרן המזבח, ואין בה קמיצה!┌─────────────────────────────────────────────────────────────────────────┐
│                    DAILY NESACHIM FLOUR FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. RAMP PLACEMENT (הנחה בכבש):                                          │
│    Left Thumb = Walk down ramp. Tap to set bowl on western side.        │
│                                                                         │
│ 2. ALTAR ASCENT (ענידת הסולת לראש המזבח):                               │
│    Left Thumb = Walk up ramp following Organ offering.                  │
│                                                                        │
│ 3. SALTING & FIRE TOSS (מליחה והקטרה כליל):                             │
│    Tap Salt Heap -> Drag Right Thumb forward to toss ALL into fire.     │
└─────────────────────────────────────────────────────────────────────────┘
🎮 חוויית השחקן על המסך (שריר ותחושה)הנחה במערב הכבש:השחקן צועד בסטיק השמאלי $V_{left}$ במורד הכבש.ביד ימין מופיעה נקישה קלה (Tap) שמניחה את קערית הסולת המוזהבת בחצי התחתון של הכבש בצד מערב.העלייה לראש המזבח:מיד לאחר שהכהנים מקריבים את נתחי הבשר, השחקן עולה בסטיק השמאלי לראש המזבח.מליחה והקטרה כליל:בראש המזבח השחקן עובר ליד ערמת המלח. נקישה קלה ביד ימין (Tap) זורקת חופן מלח על הסולת.תנועת ההקטרה: החלקה חלקה של אגודל ימין קדימה ($\Delta Y > 0$). כל הסולת נזרקת בקשת זהובה ישירות לאש המערכה. כל הסולת נשרפת (אין קמיצה ואין שיירים לכהנים).🌾 מודול 2: מנחת סולת של אדם פרטי (MODE_PRIVATE_MINCHAH)מה זה? מודול ה"עבודה קשה שבמקדש" (מנחת נדבה). מודול עמוק, איטי ומלא דיוק טקטילי מול בעל הקרבן.┌─────────────────────────────────────────────────────────────────────────┐
│                   PRIVATE MINCHAH - TACTILE SPEC                       │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. RECEIVING & APPROACH (קבלה מבעל המנחה והליכה למזבח).                 │
│                                                                         │
│ 2. HAGASHAH / CORNER TOUCH (הגשה בחוד קרן דרומית-מערבית).               │
│                                                                         │
│ 3. CLEARING FRANKINCENSE (הזזת הלבונה לניקוי שטח הקמיצה).              │
│                                                                         │
│ 4. THE KEMITZA / THREE-FINGER SCOOP (קמיצה בשלוש אצבעות - ASMR).        │
│                                                                         │
│ 5. SALTING & FIRE OFFERING (מליחה בראש המזבח והקטרה).                  │
└─────────────────────────────────────────────────────────────────────────┘
🕹️ תחושת השחקן על המסך – שלב אחר שלב1. קבלת המנחה והליכה למזבחמה רואים? הכהן עומד מול בעל המנחה בעזרה. בעל המנחה מגיש כלי זהב ובו סולת, שמן וגרגירי לבונה לבנים.הקלט: נקישה ביד ימין לקבלת הכלי, והליכה בסטיק שמאל $V_{left}$ לעבר המזבח החיצון.2. ההגשה בחוד הפינה ("הגשה")מה רואים? המצלמה עוברת לזווית תקריב תקריב (Macro View) של הקרן הדרומית-מערבית של המזבח (החלק התחתון של הפינה).הקלט ביד ימין (גרירה מדויקת): השחקן מזיז את כלי השרת באגודל ימין עד שתחתית הכלי נוגעת ממש בחוד הפינה של המזבח.תחושה: ברגע המגע נפלט רטט קצר ועדין (Haptic Touch), וחיווי זהוב מופיע. אם הפיספסת את החוד – הפעולה אינה נחשבת והשחקן מנסה שוב.3. הזזת הלבונה (ניקוי שטח הקמיצה)למה עושים את זה? אם יכנס גרגיר לבונה לתוך הקמיצה – המנחה נפסלת!הקלט ביד ימין (החלקה רכה): השחקן מעביר את אגודל ימין על פני הסולת ומזיז את גרגירי הלבונה הלבנים לצד אחד של הקערית.הסיכון: אם נשאר גרגיר לבונה באזור המיועד לקמיצה – מופיעה אזהרה אדומה!4. הקמיצה – "עבודה קשה שבמקדש" (The Kemitza ASMR)מה רואים? תקריב מוחלט על כף היד של הכהן בתוך קערית הסולת.המכניקה בשלוש אצבעות (3-Finger Hold & Scoop):השחקן מניח שלוש אצבעות (אצבע, אמה, קמיצה) על המסך במרכז הסולת.השחקן מטה/גורף את האצבעות למעלה ($\Delta Y > 0$).מד נפח הקומץ (Scoop Volume Meter):קומץ חסר (ראשי אצבעות בלבד): גריפה קצרה מדי = פסילה (חסר).קומץ יתר (גדוש ומציץ מכל הצדדים): גריפה עמוקה מדי = פסילה (יתר).קומץ מושלם (PERFECT_KEMITZA): גריפה מדויקת בטווח ה-100%. כף היד נסגרת, המכשיר מעביר רטט עמוק ומשביע רצון (Deep ASMR Haptic), ונשמע צליל גריפת סולת פריכה.5. קידוש בכלי, מליחה והקטרההעברה לכלי שרת: נקישה ביד ימין מעבירה את הסולת שנקמצה לתוך כלי זהב נפרד, וגרירת הלבונה בחזרה מעל הקומץ.מליחה והקטרה: השחקן עולה בסטיק השמאלי לראש המזבח, מולח את הקומץ בערמת המלח, ומפזר אותו לאש.שירי המנחה: יתר הסולת שנותרה בקערית הראשונית עוברת באנימציה עדינה ללשכת הכהנים להאכל לכהנים הזכאים.

## הערות Claude (21.10, 09:45)
- **ההפרדה לשני מודולים מאושרת.** היא תואמת את `minchat-solet-he.md`.
- **מודול 1, שלב 1:** לא "במורד הכבש". הנושא עולה מהרצפה ומניח "מחצי הכבש ולמטה במערבו, ומלחום" (תמיד ד, ג).
- **מודול 1, שלב 2 — שאלה פתוחה:** הפיס הרביעי הוא "מי מעלה אברים מן הכבש ולמזבח" (יומא ב, ד; רמב"ם תמידין ומוספין ד, ח). לא מצאתי במפורש אם גם הסולת עולה בידי זוכי הפיס הזה, או בידי השביעי. לבדוק לפני טקסט במשחק. עד אז: אותו כהן, כהמחשה.
- **מודול 2, קמיצה בשלוש אצבעות במגע מרובה:** מתנגש עם האחיזה בשני אגודלים ועם תקן הקלט (יד ימין = אגודל אחד). הצעה: גרירת האגודל הימני, והיד על המסך סוגרת שלוש אצבעות. עומק הגרירה קובע את נפח הקומץ, ושחרור בחלון "מלוא". כך נשמרים יתר/חסר (מנחות א, ב).
- **תוספת אפשרית לשלב 3:** "צרור או גרגיר מלח או קורט של לבונה" — כל אחד מהם פוסל (מנחות א, ב). כלומר גם גרגר מלח, לא רק לבונה.
- **הקלדה:** "ויקרב ב'" צריך להיות ויקרא ב.
