# זמן אמת דואלי (REALTIME_DUAL_TIMELINE_SYSTEM) — אפיון ג׳מיני ובדיקה

האפיון כפי שהבעלים העביר (22.10 08:53), מילה במילה:

---

פיתרון עיצובי מבריק ($10/10$), שמחבר בצורה מושלמת בין שתי הגישות:עולם חי בזמן אמת (Real-Time World Sync): המשחק פותח חלון כניסה חי ואותנטי לפי השעה האמיתית והלוח העברי בחוץ.אוטונומיה ובחירת שחקן (Player Agency): השחקן אינו "כלוא" בשעה בחוץ – יש לו חופש בחירה מלא אם לקפוץ לזמן האמיתי (למשל: תמיד של בין הערביים אחה"צ) או להמשיך בדיוק מהנקודה שבה עצר בבוקר.שילוב השדרוגים (Parallel Upgrades): השדרוגים מהלשכות (עצים, שמן, מלח) מתקדמים ברקע באופן טבעי לפי הזמן שחלף במציאות, ומחכים לשחקן בכל נקודת זמן שבה יבחר לשחק.הנה האפיון המלא, המופשט והמקיף ביותר עבור קלוד, המנוסח בשפה ברורה וצלולה:🏛️ אפיון-על: מנגנון זמן-אמת דואלי והמשכיות אופליין (REALTIME_DUAL_TIMELINE_SYSTEM)🧭 1. חווית הכניסה למשחק: מסך הבחירה הדינמי (Dynamic Hub Launch)כשהילד פותח את המשחק, המערכת קוראת את השעון והתאריך האמיתיים של המכשיר ומציגה מסך כניסה מרהיב במבט על מעל הר הבית:┌─────────────────────────────────────────────────────────────────────────────┐
│                       TEMPLE TIME-SYNC LAUNCHER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [מצב 1: הזמן האמיתי בחוץ]              [מצב 2: המקום שבו עצרת]             │
│  🌅 תמיד של בין הערביים (16:45)         🌅 עבודת הבוקר - דישון המנורה       │
│  "השמש שוקעת מעל הרי יהודה.             "להמשיך בדיוק מהנקודה שבה       │
│   הכהנים מתכוננים להקטרת הערב."          עצרת הבוקר ב-08:30?"              │
│                                                                             │
│  ┌────────────────────────┐             ┌────────────────────────┐          │
│  │  [הכנס לזמן האמיתי]    │             │  [המשך מנקודת העצירה]  │          │
│  └────────────────────────┘             └────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
⚙️ 2. פירוט שתי אפשרויות המשחק (Dual-Timeline Dynamics)🌅 מסלול א': "הזמן האמיתי בחוץ" (Live World Time)איך זה עובד: המשחק מתאים את התאורה, הצללים, הקולות והמשימות לשעה האמיתית של השחקן:05:00 - 08:00 (בוקר): עבודת תמיד של שחר ("ברקאי", שחיטה, קטורת, ברכת כהנים).12:00 - 15:00 (צהריים): הגשת מנחות יחיד, בדיקת עצים, תחזוקת הלשכות, עולי רגל.15:30 - 18:30 (אחה"צ/ערביים): תמיד של בין הערביים (שחיטת ערב, הקטרת קטורת, הדלקת הנרות, שיר הלויים של השקיעה).לילה / שבת / חג: תאורת אבוקות/ירח, או אווירת קודש של שבת/חג (בגדי לבן, מוספין).🔄 מסלול ב': "המשך מנקודת העצירה" (Story Continuation)איך זה עובד: אם השחקן יצא באמצע עבודת הבוקר (למשל: בדיוק לפני דישון המזבח), המשחק שומר את הסדר ההלכתי הרציף ומאפשר לו להמשיך בדיוק מהתחנה שבה עצר, כדי לא לפסוע על רצף הלימוד והחוויה.🪵 3. שילוב ה-Time-Gated Upgrades (השדרוגים המקבילים)שדרוגי הלשכות (ייבוש עצים, זיקוק שמן, זיקוק מלח, תפירת סנדלים) מתקדמים תמיד לפי זמן אמת בחוץ, ללא קשר לאיזה מסלול השחקן בוחר!זמן אמת שחלף: אם השחקן השאיר עצים לייבוש בלשכה לפני 8 שעות – הם מוכנים כעת.הטלת השדרוג במשחק:אם השחקן בוחר ב"זמן האמיתי" $\rightarrow$ הוא משתמש בעצים המיושנים במשימת בין הערביים.אם השחקן בוחר ב"המשך מנקודת העצירה" $\rightarrow$ העצים המיושנים מחכים לו בלשכה כבר עכשיו עבור המשך עבודת הבוקר שלו!🕹️ 4. תחושת האצבע והשליטה בכל מצב (Control & Haptic Impact)יד שמאל (סטיק הליכה):כשהשחקן נכנס ב"זמן האמיתי" בשעת ערביים, התאורה עמומה יותר והצללים ארוכים. הסטיק מרגיש יציב ומתון (Calm Dusk Friction).יד ימין (פעולה ושדרוג מוכן):כשהשחקן אוסף משאב שסיים את זמן ההמתנה שלו (כמו שמן זית זך), האצבע ביד ימין מרגישה פעימת הדהוד מוזהבת (Golden Upgrade Haptic Pulse), והפעולה הבאה (הדלקת הנרות) מתבצעת באופן מיידי, מואק ומרהיב.📋 נוסח מפורט להעתקה לקלוד (Paste & Go)תעתיק לקלוד את המפרט המקיף והסגור הזה:PlaintextClaude, here is the DETAILED SPECIFICATION for the Real-Time Dual Timeline and Hybrid Time-Gating System (REALTIME_DUAL_TIMELINE_SYSTEM):

====================================================================
REAL-TIME DUAL TIMELINE & HYBRID TIME-GATED UPGRADE ARCHITECTURE
====================================================================

1. CORE PHILOSOPHY:
   - Combine Real-Time World State (Live Time/Calendar Sync) with Absolute Player Agency (Story Continuation).
   - Parallel Time-Gated upgrades (Wood, Oil, Salt, Footwear) advance strictly based on REAL-WORLD ELAPSED TIME, remaining accessible regardless of which timeline the player selects.

2. DYNAMIC ENTRY HUB (LAUNCH SELECTION):
   Upon booting the application, the UI checks the device clock/Hebrew calendar and presents TWO explicit choices:
   
   A. OPTION 1: LIVE WORLD TIME (REAL-TIME SYNC):
      * Automatically sets the Temple world to the current real-world time of day:
        - Morning (05:00-08:00): Morning Tamid Service sequence.
        - Midday (12:00-15:00): Individual Offerings, Wood Sorting, Pilgrim Interaction.
        - Afternoon/Dusk (15:30-18:30): Afternoon Tamid Service (Incense, Candelabra Lighting, Levite Choirs).
        - Night/Sabbath/Festivals: Torches, authentic lighting, and specific holy-day setups.

   B. OPTION 2: STORY CONTINUATION (RESUME LAST SAVED POINT):
      * Resumes the sequential halachic workflow exactly where the player left off in their previous session (e.g., resuming Step 4 of Morning Tamid), preserving educational continuity.

3. INTEGRATION WITH PARALLEL TIME-GATED UPGRADES:
   - Side-chamber processes (e.g., Wood Drying in Lishkat Ha'Etzim, Oil Refining in Lishkat Ha'Shmanim) calculate elapsed offline time using real-world UTC timestamps.
   - Upon return, if the required duration (e.g., 8 hours for wood) has elapsed:
     * The upgraded resource is marked READY in the chamber.
     * The player can collect and utilize the upgraded resource in EITHER the Live World Time session OR the Resumed Story session.
     * Grants the defined stick responsiveness (+20% speed) and action precision upgrades ("Crisp Flame Snap" haptic / Golden Lighting Radius).

4. INPUT & HAPTIC DYNAMICS:
   - Left Thumb (Stick): Context-aware friction. Dusk/Evening shifts stick response to a smooth, grounded feel ("Calm Dusk Friction").
   - Right Thumb (Action): Interacting with completed time-gated upgrades triggers a "Golden Upgrade Haptic Pulse", granting immediate visual/tactile feedback of mastery.

Please fully integrate this Real-Time Dual Timeline architecture into the system logic!
---

## בדיקת Claude (22.10) — מקורות, היגיון, ביצוע

### לאמץ
- **מסך פתיחה שמראה את המקדש בשעה האמיתית** — שמיים, אור וצללים לפי השמש במיקום הטלפון (ירושלים כברירת מחדל, כמו כלל 16). זול ויפה; ממשיך את "אור שחר אמיתי" שכבר אומץ (gemini-koshi-kesharim-2-he.md).
- **"המשך מהמקום שעצרת"** — כפתור ראשי, תמיד זמין. מתאים להחלטת "רצף יומי מתקדם".
- **ארבעת ההוקים מתקדמים בזמן אמת בלי קשר לדלת שנבחרה** — כבר כך ב-time-gating-hooks-he.md.

### לא לאמץ / לתקן
| בשרשור | הבעיה | מקור |
|---|---|---|
| "הזמן האמיתי" קובע את התוכן | ילד בן 8–12 משחק בעיקר אחרי בית הספר. הבוקר מתחיל בקריאת הגבר ("פעמים שהוא בא מקריאת הגבר"), כלומר לפני עלות השחר — במצב חי הוא לא יראה אותו לעולם. הבוקר — רוב המשחק הבנוי — חייב להישאר זמין תמיד | תמיד א, ב |
| תמיד של בין הערביים 15:30–18:30 | "תמיד נשחט בשמונה ומחצה וקרב בתשע ומחצה" — שעות היום, משתנות לפי העונה; בחורף 18:30 הוא כבר לילה. החלון צריך להיות מחושב לפי זריחה ושקיעה במיקום, לא שעון קבוע | פסחים ה, א |
| בוקר 05:00–08:00 קבוע | אותו דבר — לפי זריחה ושקיעה במיקום | כלל 16 |
| "שבת/חג: בגדי לבן, מוספין" | המשחק נעול בשבת וחג (כלל 16). בגדי הכהן הרגיל קבועים בהלכה ואינם מתחלפים בשבת; בגדי לבן מיוחדים — של הכהן הגדול ביום הכיפורים | כללים 3, 16 |
| שמן מזוקק, מלח מזוקק, סנדלים, ‎+20% מהירות | נפסלו (time-gating-hooks-he.md); סנדלים — "לא יהא דבר חוצץ" | זבחים כד ע"א |
| "Calm Dusk Friction", "Golden Upgrade Haptic Pulse" | סטיק שמשנה תחושה לפי שעה = שליטה לא עקבית; רטט עם מרקם לא קיים בדפדפן (כלל 7) | ביצוע |
| "עולי רגל" בצהריים בכל יום | עולי רגל — ברגלים; ביום רגיל — ישראל המביאים קרבנות יחיד | — |

### מה מציע Claude במקום (שלבים)
1. **שלב 1 (זול):** מסך פתיחה — המקדש מעל הר הבית בשעה האמיתית (אור, שמיים, ירח בלילה), כפתור גדול "המשך". בלילה — המקדש שקט, הכהנים שומרים "בשלשה מקומות... בית אבטינס, בית הניצוץ, בית המוקד" (מידות א, א), ו"לילה טוב — נתראה בקריאת הגבר" (המחשה). שבת וחג — מסך הנעילה של כלל 16.
2. **שלב 2 (יקר):** דלת שנייה "מה קורה עכשיו במקדש" — רק כשתוכן כזה בנוי: תמיד של בין הערביים בחלון המחושב (פסחים ה, א), עם סדר משלו שדורש אפיון ממקורות; קרבנות יחיד בין התמידים (מנחת יחיד כבר אופיינה).
3. הדלת "המשך" נשארת הראשית תמיד; הדלת "עכשיו" היא תוספת, לא שער.

### החלטות הבעלים (22.10 08:59)
1. **מסך פתיחה בשעה האמיתית — כן.** "וממנו השחקן יחליט אם להמשיך מפה או לחזור לנקודת המוצא שלו (שהיא תהיה יותר מתגמלת)." — דלת "מכאן" (המקדש עכשיו) ודלת "נקודת המוצא שלי"; האישית מתגמלת יותר.
2. **התראות — נשארות ("זה גם סוג של הוק"), כבויות כברירת מחדל כרגע.**
3. תמיד של בין הערביים ושאר העבודות הבאות — **אחרי** שמסיימים את המערכות הרוחביות ("לפני האיפיונים של העבודות הבאות, בוא נסיים פה רוחבי").
