export interface MdaAction {
  id: string;
  text: string;
  maxScore: 2;
}

export interface MdaPhase {
  id: string;
  title: string;
  actions: MdaAction[];
}

export interface MdaScenario {
  id: string;
  code: string;
  title: string;
  badge: string;
  category: "cardiac" | "respiratory" | "neuro" | "trauma" | "pediatric" | "obstetric" | "toxicology";
  story: string;
  vitals: {
    pulse: string;
    bp: string;
    spo2: string;
    rr: string;
    temp?: string;
    gcs?: string;
  };
  phases: MdaPhase[];
  failCriteria: string[];
  impression: string[];
}

export const mdaScenarios: MdaScenario[] = [
  // ── CARDIAC ──────────────────────────────────────────────────────────────
  {
    id: "C01",
    code: "C01",
    title: "אוטם שריר הלב עם עליית ST (STEMI)",
    badge: "❤️",
    category: "cardiac",
    story: "גבר בן 58 מתלונן על כאב חזה מוחץ המקרין לזרוע שמאל ולסת, שנמשך 45 דקות. הוא חיוור, מזיע ונסוג. בת זוגו התקשרה לחירום לאחר שנטל ניטרוגליצרין ביתי ללא הקלה.",
    vitals: { pulse: "98", bp: "90/60", spo2: "94%", rr: "20" },
    phases: [
      {
        id: "C01-P1", title: "הערכה ראשונית",
        actions: [
          { id: "C01-P1-A1", text: "בטיחות סצנה ומחסומי זיהום", maxScore: 2 },
          { id: "C01-P1-A2", text: "רושם של מצב כללי: הכרה, נשימה, צבע עור", maxScore: 2 },
          { id: "C01-P1-A3", text: "פתיחת נתיב אוויר ובדיקת נשימה", maxScore: 2 },
          { id: "C01-P1-A4", text: "החלת חמצן במסכה 15L/min", maxScore: 2 },
          { id: "C01-P1-A5", text: "ניטור: SpO2, ECG 12 ערוצים, לחץ דם", maxScore: 2 },
        ],
      },
      {
        id: "C01-P2", title: "טיפול",
        actions: [
          { id: "C01-P2-A1", text: "פתיחת ורידי עורקי: 2 עורקים, נוזלים 250mL bolus", maxScore: 2 },
          { id: "C01-P2-A2", text: "אספירין 300mg PO (ללעוס)", maxScore: 2 },
          { id: "C01-P2-A3", text: "ניטרוגליצרין 0.4mg SL אם BP>90 Systolic", maxScore: 2 },
          { id: "C01-P2-A4", text: "מורפין 2-4mg IV לניהול כאב לפי נחיצות", maxScore: 2 },
          { id: "C01-P2-A5", text: "הכנת ציוד דפיברילציה ומוניטורינג מתמשך", maxScore: 2 },
          { id: "C01-P2-A6", text: "הודעה מוקדמת לחדר מיון (Pre-alert STEMI)", maxScore: 2 },
        ],
      },
      {
        id: "C01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "C01-P3-A1", text: "ECG חוזר לאחר טיפול — תיעוד שינויים", maxScore: 2 },
          { id: "C01-P3-A2", text: "ניטור לחץ דם כל 5 דקות", maxScore: 2 },
          { id: "C01-P3-A3", text: "פינוי מהיר למרכז קרדיולוגי עם PCI", maxScore: 2 },
          { id: "C01-P3-A4", text: "תיעוד זמן תסמינים, טיפולים ותגובות", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא בוצע ECG 12 ערוצים",
      "לא ניתן אספירין",
      "עיכוב פינוי מעל 15 דקות",
      "לא דווח Pre-alert לבית חולים",
    ],
    impression: ["הערכה ראשונית", "טיפול תרופתי", "ניטור", "פינוי"],
  },
  {
    id: "C02",
    code: "C02",
    title: "פיברילציה חדרית — עצירת לב",
    badge: "⚡",
    category: "cardiac",
    story: "אישה בת 65 קרסה פתאום בזמן קניות. אנשים שמסביב מדווחים על אובדן הכרה מיידי. אין נשימה ואין דופק. AED זמין במקום. זמן מגע ראשוני כ-4 דקות מהקריסה.",
    vitals: { pulse: "0", bp: "0/0", spo2: "0%", rr: "0", gcs: "3" },
    phases: [
      {
        id: "C02-P1", title: "הערכה ראשונית והחייאה",
        actions: [
          { id: "C02-P1-A1", text: "בטיחות סצנה מיידית", maxScore: 2 },
          { id: "C02-P1-A2", text: "בדיקת תגובה: קריאה + טלטול כתפיים", maxScore: 2 },
          { id: "C02-P1-A3", text: "בדיקת דופק ונשימה במקביל (עד 10 שניות)", maxScore: 2 },
          { id: "C02-P1-A4", text: "הזעקה לעזרה + התחלת CPR 30:2", maxScore: 2 },
          { id: "C02-P1-A5", text: "חיבור AED והפעלתו", maxScore: 2 },
        ],
      },
      {
        id: "C02-P2", title: "דפיברילציה ו-ACLS",
        actions: [
          { id: "C02-P2-A1", text: "דפיברילציה 200J ביפאזי בהקדם האפשרי", maxScore: 2 },
          { id: "C02-P2-A2", text: "חידוש CPR מיד לאחר הלם ל-2 דקות", maxScore: 2 },
          { id: "C02-P2-A3", text: "ניהול נתיב אוויר מתקדם (LMA/ETT)", maxScore: 2 },
          { id: "C02-P2-A4", text: "אדרנלין 1mg IV כל 3-5 דקות", maxScore: 2 },
          { id: "C02-P2-A5", text: "בדיקת סיבות הפיכות (5H/5T)", maxScore: 2 },
          { id: "C02-P2-A6", text: "אמיודארון 300mg IV לאחר 3 הלמות", maxScore: 2 },
        ],
      },
      {
        id: "C02-P3", title: "ROSC וניטור",
        actions: [
          { id: "C02-P3-A1", text: "אימות ROSC: דופק, לחץ דם, SpO2", maxScore: 2 },
          { id: "C02-P3-A2", text: "ECG 12 ערוצים לאחר ROSC", maxScore: 2 },
          { id: "C02-P3-A3", text: "שמירה על SpO2 94-98%, הימנעות מהיפראוקסיה", maxScore: 2 },
          { id: "C02-P3-A4", text: "פינוי מהיר — Pre-alert מוקדם לחדר מיון", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא בוצעה דפיברילציה תוך 3 דקות מהגעה",
      "הפסקת CPR מעל 10 שניות ללא סיבה",
      "לא ניתן אדרנלין",
      "לא נבדקו סיבות הפיכות",
    ],
    impression: ["CPR איכותי", "דפיברילציה", "ACLS", "ROSC ופינוי"],
  },
  {
    id: "C03",
    code: "C03",
    title: "טכיקרדיה על-חדרית (SVT)",
    badge: "💓",
    category: "cardiac",
    story: "גבר בן 32, ספורטאי, מגיע בהכרה עם דפיקות לב מהירות ופרפורים שהתחילו לפני 30 דקות. מתלונן על קוצר נשימה קל. ללא כאב חזה. ללא רקע קרדיולוגי ידוע.",
    vitals: { pulse: "180", bp: "110/70", spo2: "97%", rr: "18" },
    phases: [
      {
        id: "C03-P1", title: "הערכה ראשונית",
        actions: [
          { id: "C03-P1-A1", text: "הערכת מצב כללי ותודעה", maxScore: 2 },
          { id: "C03-P1-A2", text: "ניטור: ECG 12 ערוצים, SpO2, לחץ דם", maxScore: 2 },
          { id: "C03-P1-A3", text: "זיהוי SVT על ה-ECG (QRS צר, קצב סדיר)", maxScore: 2 },
          { id: "C03-P1-A4", text: "פתיחת גישה ורידית", maxScore: 2 },
        ],
      },
      {
        id: "C03-P2", title: "טיפול",
        actions: [
          { id: "C03-P2-A1", text: "ניסיון תמרון וגאלי: Valsalva/עיסוי קרוטיד", maxScore: 2 },
          { id: "C03-P2-A2", text: "אדנוזין 6mg IV rapid push אם וגאלי נכשל", maxScore: 2 },
          { id: "C03-P2-A3", text: "אדנוזין 12mg IV אם אין תגובה לאחר 2 דקות", maxScore: 2 },
          { id: "C03-P2-A4", text: "הכנת ציוד דפיברילציה סינכרוני (cardioversion)", maxScore: 2 },
          { id: "C03-P2-A5", text: "תיעוד ECG לאחר כל טיפול", maxScore: 2 },
        ],
      },
      {
        id: "C03-P3", title: "ניטור ופינוי",
        actions: [
          { id: "C03-P3-A1", text: "אימות המרה לסינוס נורמאלי ב-ECG", maxScore: 2 },
          { id: "C03-P3-A2", text: "ניטור לחץ דם ודופק לאחר המרה", maxScore: 2 },
          { id: "C03-P3-A3", text: "פינוי לבדיקה קרדיולוגית", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא נוסה תמרון וגאלי לפני תרופות",
      "אדנוזין ניתן בהזרקה איטית (לא rapid push)",
      "לא תועד ECG לאחר טיפול",
    ],
    impression: ["הערכה ראשונית", "טיפול אנטי-אריתמי", "המרה לסינוס", "פינוי"],
  },
  {
    id: "C04",
    code: "C04",
    title: "אי ספיקת לב חריפה — בצקת ריאות",
    badge: "🫁",
    category: "cardiac",
    story: "אישה בת 72 עם רקע של יתר לחץ דם ואי ספיקת לב מתלוננת על קוצר נשימה חמור שהחמיר בישיבה. שמיעה לריאות מגלה רחלות (crackles) דו-צדדיות. נסיוב ורוד בקנה.",
    vitals: { pulse: "110", bp: "180/100", spo2: "86%", rr: "32" },
    phases: [
      {
        id: "C04-P1", title: "הערכה ראשונית",
        actions: [
          { id: "C04-P1-A1", text: "הושבת המטופל ב-90° (seated upright)", maxScore: 2 },
          { id: "C04-P1-A2", text: "מתן חמצן — CPAP אם זמין, אחרת מסכה 15L", maxScore: 2 },
          { id: "C04-P1-A3", text: "ניטור: SpO2, ECG, לחץ דם, RR", maxScore: 2 },
          { id: "C04-P1-A4", text: "השמעת ריאות — רחלות דו-צדדיות", maxScore: 2 },
        ],
      },
      {
        id: "C04-P2", title: "טיפול",
        actions: [
          { id: "C04-P2-A1", text: "פתיחת גישה ורידית — IV access", maxScore: 2 },
          { id: "C04-P2-A2", text: "ניטרוגליצרין 0.4mg SL אם BP>100 Systolic", maxScore: 2 },
          { id: "C04-P2-A3", text: "פוירוסמייד (Lasix) 40-80mg IV", maxScore: 2 },
          { id: "C04-P2-A4", text: "הימנעות ממתן נוזלים IV!", maxScore: 2 },
          { id: "C04-P2-A5", text: "הכנה לאינטובציה אם SpO2 לא משתפר", maxScore: 2 },
        ],
      },
      {
        id: "C04-P3", title: "ניטור ופינוי",
        actions: [
          { id: "C04-P3-A1", text: "ניטור SpO2 ו-RR כל 2 דקות", maxScore: 2 },
          { id: "C04-P3-A2", text: "תיעוד תגובה לטיפול", maxScore: 2 },
          { id: "C04-P3-A3", text: "פינוי בישיבה עם ציוד CPAP/אינטובציה מוכן", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "מתן נוזלים IV לאי ספיקת לב",
      "הגשת חמצן ללא CPAP כשהספירה מתחת 90%",
      "השכבת המטופל",
    ],
    impression: ["זיהוי בצקת ריאות", "מיקום וחמצן", "טיפול תרופתי", "פינוי"],
  },
  {
    id: "C05",
    code: "C05",
    title: "תסמונת כלילית חריפה (ACS) ללא ST-Elevation",
    badge: "🩺",
    category: "cardiac",
    story: "גבר בן 50, מעשן, מגיע בתלונת כאב חזה מוחץ בעצמה בינונית המקרין לגב שנמשך 3 שעות. קיים קוצר נשימה קל. ECG מראה שקיעת ST ב-V4-V6 בלי עליה.",
    vitals: { pulse: "88", bp: "140/85", spo2: "96%", rr: "16" },
    phases: [
      {
        id: "C05-P1", title: "הערכה ראשונית",
        actions: [
          { id: "C05-P1-A1", text: "הערכת תסמינים מלאה (OPQRST)", maxScore: 2 },
          { id: "C05-P1-A2", text: "ECG 12 ערוצים ופרשנות", maxScore: 2 },
          { id: "C05-P1-A3", text: "ניטור SpO2, BP, דופק", maxScore: 2 },
          { id: "C05-P1-A4", text: "חמצן רק אם SpO2<94%", maxScore: 2 },
        ],
      },
      {
        id: "C05-P2", title: "טיפול",
        actions: [
          { id: "C05-P2-A1", text: "פתיחת גישה ורידית", maxScore: 2 },
          { id: "C05-P2-A2", text: "אספירין 300mg PO", maxScore: 2 },
          { id: "C05-P2-A3", text: "ניטרוגליצרין SL אם BP>100", maxScore: 2 },
          { id: "C05-P2-A4", text: "מורפין 2-4mg IV לכאב עקשני", maxScore: 2 },
          { id: "C05-P2-A5", text: "ECG חוזר כל 15 דקות לזיהוי התקדמות ל-STEMI", maxScore: 2 },
        ],
      },
      {
        id: "C05-P3", title: "פינוי",
        actions: [
          { id: "C05-P3-A1", text: "Pre-alert לחדר מיון קרדיולוגי", maxScore: 2 },
          { id: "C05-P3-A2", text: "פינוי בשכיבה עם ניטור מתמשך", maxScore: 2 },
          { id: "C05-P3-A3", text: "תיעוד מלא כולל ECG, תרופות ותגובות", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא ניתן אספירין",
      "לא בוצע ECG 12 ערוצים",
      "מתן ניטרו עם BP<100 Systolic",
    ],
    impression: ["הערכה ראשונית", "טיפול תרופתי", "ECG מעקב", "פינוי"],
  },

  // ── RESPIRATORY ───────────────────────────────────────────────────────────
  {
    id: "R01",
    code: "R01",
    title: "סטטוס אסתמטיקוס",
    badge: "🌬️",
    category: "respiratory",
    story: "ילדה בת 16 עם אסתמה ידועה מגיעה בקוצר נשימה חמור שלא מגיב ל-3 פחיות ונטולין. היא מתקשה לדבר במשפטים שלמים. שרירי עזר פעילים. שמיעה לריאות: צפצופים בינוניים.",
    vitals: { pulse: "130", bp: "120/80", spo2: "88%", rr: "30" },
    phases: [
      {
        id: "R01-P1", title: "הערכה ראשונית",
        actions: [
          { id: "R01-P1-A1", text: "הערכת חומרת אסתמה: דיבור, עבודת נשימה, צפצופים", maxScore: 2 },
          { id: "R01-P1-A2", text: "חמצן 15L/min במסכה", maxScore: 2 },
          { id: "R01-P1-A3", text: "ניטור SpO2, קצב לב, RR", maxScore: 2 },
          { id: "R01-P1-A4", text: "הושבת בישיבה נוחה (tripod position)", maxScore: 2 },
        ],
      },
      {
        id: "R01-P2", title: "טיפול",
        actions: [
          { id: "R01-P2-A1", text: "ונטולין (Salbutamol) נבולייזר 5mg", maxScore: 2 },
          { id: "R01-P2-A2", text: "אטרובנט (Ipratropium) נבולייזר 0.5mg בשילוב", maxScore: 2 },
          { id: "R01-P2-A3", text: "מגנזיום סולפט 2g IV על פני 20 דקות", maxScore: 2 },
          { id: "R01-P2-A4", text: "מתילפרדניסולון (סולו-מדרול) 125mg IV", maxScore: 2 },
          { id: "R01-P2-A5", text: "הכנה לאינטובציה אם אין שיפור", maxScore: 2 },
        ],
      },
      {
        id: "R01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R01-P3-A1", text: "הערכה חוזרת לאחר נבולייזר (SpO2, צפצופים)", maxScore: 2 },
          { id: "R01-P3-A2", text: "פינוי מהיר לחדר מיון עם ניטור מתמשך", maxScore: 2 },
          { id: "R01-P3-A3", text: "Pre-alert — אסתמה חמורה, טיפול כנ״ל", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא ניתן ונטולין נבולייזר",
      "לא זוהו סימני עייפות נשימתית — אינדיקציה לאינטובציה",
      "עיכוב פינוי מעל 15 דקות",
    ],
    impression: ["חומרת אסתמה", "טיפול ברונכו-דילטטורים", "סטרואידים", "פינוי"],
  },
  {
    id: "R02",
    code: "R02",
    title: "פנאומוטורקס במתח (Tension Pneumothorax)",
    badge: "🫁",
    category: "respiratory",
    story: "גבר בן 28 שנפגע בתאונת דרכים מתלונן על כאב חזה ימני ועייפות חמורה. מצבו מחמיר. ורידי צוואר מוגבהים, צלילי ריאה נשמעים פחות בצד ימין. BP יורד.",
    vitals: { pulse: "130", bp: "80/50", spo2: "82%", rr: "28", gcs: "13" },
    phases: [
      {
        id: "R02-P1", title: "הערכה ראשונית",
        actions: [
          { id: "R02-P1-A1", text: "הערכת נתיב אוויר ונשימה — ABCDE", maxScore: 2 },
          { id: "R02-P1-A2", text: "ממצאי בדיקה: ורידי צוואר, deviated trachea, העדר נשימה", maxScore: 2 },
          { id: "R02-P1-A3", text: "חמצן 15L/min מיידי", maxScore: 2 },
          { id: "R02-P1-A4", text: "אבחנה קלינית של tension pneumothorax", maxScore: 2 },
        ],
      },
      {
        id: "R02-P2", title: "טיפול — needle decompression",
        actions: [
          { id: "R02-P2-A1", text: "זיהוי אתר: 2nd ICS, midclavicular line, צד הפגוע", maxScore: 2 },
          { id: "R02-P2-A2", text: "ניקור מחט 14G/16G בטכניקה סטרילית", maxScore: 2 },
          { id: "R02-P2-A3", text: "אימות ביצוע: שחרור אוויר, שיפור SpO2 ו-BP", maxScore: 2 },
          { id: "R02-P2-A4", text: "חזרה לגישה ב-4th/5th ICS AAL אם לא משתפר", maxScore: 2 },
        ],
      },
      {
        id: "R02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R02-P3-A1", text: "ניטור SpO2, BP, RR לאחר ניקור", maxScore: 2 },
          { id: "R02-P3-A2", text: "הכנה לצינור חזה בית חולים (pre-alert trauma)", maxScore: 2 },
          { id: "R02-P3-A3", text: "פינוי מהיר לחדר מיון טראומה", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "אינטובציה לפני ניקור מחט בחשד tension pneumothorax",
      "ניקור בצד הלא נכון",
      "עיכוב טיפול — needle decompression חייב מיידי",
    ],
    impression: ["אבחנה קלינית", "needle decompression", "ניטור לאחר טיפול", "פינוי"],
  },
  {
    id: "R03",
    code: "R03",
    title: "אנפילקסיס",
    badge: "🐝",
    category: "respiratory",
    story: "בחורה בת 22 דקרה על ידי דבורה לפני 10 דקות. כעת חולה מאוד: פריחה אורטיקרית מפושטת, ורידי צוואר תקינים. בגרון נפיחות, קול צרוד וסטרידור. BP צונח.",
    vitals: { pulse: "128", bp: "70/40", spo2: "91%", rr: "26" },
    phases: [
      {
        id: "R03-P1", title: "הערכה ראשונית",
        actions: [
          { id: "R03-P1-A1", text: "זיהוי אנפילקסיס: עור, נשימה, המודינמיקה", maxScore: 2 },
          { id: "R03-P1-A2", text: "הנחת המטופל: שכיבה עם רגליים מורמות (אלא אם קשי נשימה)", maxScore: 2 },
          { id: "R03-P1-A3", text: "חמצן 15L/min", maxScore: 2 },
          { id: "R03-P1-A4", text: "ניטור: SpO2, BP, ECG", maxScore: 2 },
        ],
      },
      {
        id: "R03-P2", title: "טיפול",
        actions: [
          { id: "R03-P2-A1", text: "אדרנלין 0.5mg IM (Adrenaline 1:1000) בשריר הירך", maxScore: 2 },
          { id: "R03-P2-A2", text: "חזרה על מנת אדרנלין IM לאחר 5-15 דקות אם לא מגיב", maxScore: 2 },
          { id: "R03-P2-A3", text: "נוזלים IV 1-2L Normal Saline bolus", maxScore: 2 },
          { id: "R03-P2-A4", text: "כלוראמין (Chlorphenamine) 10mg IV + הידרוקורטיזון 200mg IV", maxScore: 2 },
          { id: "R03-P2-A5", text: "הכנה לאינטובציה/קריקוטרירוטומיה", maxScore: 2 },
        ],
      },
      {
        id: "R03-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R03-P3-A1", text: "ניטור אחרי אדרנלין: BP, SpO2, קולות גרון", maxScore: 2 },
          { id: "R03-P3-A2", text: "פינוי מהיר לחדר מיון — סכנה לחיים", maxScore: 2 },
          { id: "R03-P3-A3", text: "Pre-alert: אנפילקסיס, טיפול, מצב נוכחי", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא ניתן אדרנלין IM כטיפול ראשוני",
      "מתן אנטיהיסטמין לפני אדרנלין",
      "עיכוב מתן אדרנלין — טיפול חייב מיידי",
    ],
    impression: ["אבחנה", "אדרנלין IM", "נוזלים ותרופות", "פינוי"],
  },
  {
    id: "R04",
    code: "R04",
    title: "בצקת ריאות — סיבה נשימתית",
    badge: "💧",
    category: "respiratory",
    story: "גבר בן 45 שאושפז לפני שבוע לניתוח מגיע עם קוצר נשימה פרוגרסיבי, חום וצמרמורות. ריאות: רחלות בסיסיות + שפשוף פלאורלי. חשד לאמבוליה ריאתית או דלקת ריאות.",
    vitals: { pulse: "108", bp: "100/65", spo2: "90%", rr: "26", temp: "38.8°C" },
    phases: [
      {
        id: "R04-P1", title: "הערכה ראשונית",
        actions: [
          { id: "R04-P1-A1", text: "הערכת נשימה מפורטת: RR, מאמץ, צלילים", maxScore: 2 },
          { id: "R04-P1-A2", text: "חמצן מותאם לשמירה SpO2>94%", maxScore: 2 },
          { id: "R04-P1-A3", text: "ניטור: SpO2, BP, ECG 12 ערוצים, חום", maxScore: 2 },
          { id: "R04-P1-A4", text: "בדיקת גפיים תחתונות לסימני DVT", maxScore: 2 },
        ],
      },
      {
        id: "R04-P2", title: "טיפול",
        actions: [
          { id: "R04-P2-A1", text: "פתיחת גישה ורידית", maxScore: 2 },
          { id: "R04-P2-A2", text: "נוזלים: 250mL bolus זהיר אם BP<100", maxScore: 2 },
          { id: "R04-P2-A3", text: "הכנה לאינטובציה אם SpO2 לא מגיב", maxScore: 2 },
          { id: "R04-P2-A4", text: "אין ליתן אנטיביוטיקה בשטח (רשום ב-handover)", maxScore: 2 },
        ],
      },
      {
        id: "R04-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R04-P3-A1", text: "Pre-alert: חשד PE/PNA, BP נמוך, SpO2 נמוך", maxScore: 2 },
          { id: "R04-P3-A2", text: "פינוי בישיבה עם ניטור מתמשך", maxScore: 2 },
          { id: "R04-P3-A3", text: "תיעוד: תסמינים, משך, סביבה כירורגית, ממצאים", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "אי זיהוי חומרת מצב",
      "עיכוב פינוי",
      "מתן נוזלים ביתר לחשד PE עם BP תקין",
    ],
    impression: ["הערכה נשימתית", "חמצן ונוזלים", "אבחנה מבדלת", "פינוי"],
  },

  // ── NEURO ─────────────────────────────────────────────────────────────────
  {
    id: "N01",
    code: "N01",
    title: "שבץ מוחי חריף (CVA)",
    badge: "🧠",
    category: "neuro",
    story: "אישה בת 68 התעוררה עם חולשה בצד שמאל של הגוף ואי ברור בדיבור. בעלה מדווח שתסמינים החלו לפני כשעה. ללא היסטוריה של שבץ. נוטלת קומדין.",
    vitals: { pulse: "82", bp: "170/95", spo2: "95%", rr: "14", gcs: "12" },
    phases: [
      {
        id: "N01-P1", title: "הערכה ראשונית",
        actions: [
          { id: "N01-P1-A1", text: "בדיקת FAST: פנים, ידיים, דיבור, זמן", maxScore: 2 },
          { id: "N01-P1-A2", text: "תיעוד זמן תחילת תסמינים (last seen well)", maxScore: 2 },
          { id: "N01-P1-A3", text: "ניטור: GCS, BP, SpO2, גלוקוז", maxScore: 2 },
          { id: "N01-P1-A4", text: "הימנעות מהורדת BP אגרסיבית בשטח", maxScore: 2 },
        ],
      },
      {
        id: "N01-P2", title: "טיפול",
        actions: [
          { id: "N01-P2-A1", text: "פתיחת גישה ורידית — בגפה לא משותקת", maxScore: 2 },
          { id: "N01-P2-A2", text: "חמצן רק אם SpO2<94%", maxScore: 2 },
          { id: "N01-P2-A3", text: "בדיקת גלוקוז + טיפול בהיפוגליקמיה אם רלוונטי", maxScore: 2 },
          { id: "N01-P2-A4", text: "אין לתת אספירין בשטח (לא ידוע אם דימומי)", maxScore: 2 },
          { id: "N01-P2-A5", text: "מיקום: ראש מוגבה 30° אלא אם BP נמוך", maxScore: 2 },
        ],
      },
      {
        id: "N01-P3", title: "פינוי",
        actions: [
          { id: "N01-P3-A1", text: "Pre-alert STROKE עם זמן תחילה מדויק", maxScore: 2 },
          { id: "N01-P3-A2", text: "פינוי מהיר למרכז שבץ עם CT/tPA", maxScore: 2 },
          { id: "N01-P3-A3", text: "תיעוד: FAST, GCS, תרופות (קומדין!), זמנים", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא תועד זמן תחילת תסמינים",
      "מתן אספירין בשטח",
      "פינוי לא למרכז שבץ",
      "עיכוב מעל 10 דקות בסצנה",
    ],
    impression: ["FAST", "זמן תחילה", "טיפול תומך", "פינוי"],
  },
  {
    id: "N02",
    code: "N02",
    title: "עווית — סטטוס אפילפטיקוס",
    badge: "⚡",
    category: "neuro",
    story: "גבר בן 25 עם אפילפסיה ידועה בהתקף עוויתי כללי הנמשך מעל 5 דקות. ללא הפסקה. לא נטל קרבמזפין (טגרטול) כשבוע. נוכחים בני משפחה.",
    vitals: { pulse: "110", bp: "150/90", spo2: "92%", rr: "18", gcs: "3" },
    phases: [
      {
        id: "N02-P1", title: "הערכה ראשונית",
        actions: [
          { id: "N02-P1-A1", text: "בטיחות — הרחקת גורמי סכנה, הגנה על ראש", maxScore: 2 },
          { id: "N02-P1-A2", text: "ניטור SpO2, דופק, הכרה בין התקפים", maxScore: 2 },
          { id: "N02-P1-A3", text: "תיעוד משך עווית ומאפיינים", maxScore: 2 },
          { id: "N02-P1-A4", text: "בדיקת גלוקוז", maxScore: 2 },
        ],
      },
      {
        id: "N02-P2", title: "טיפול",
        actions: [
          { id: "N02-P2-A1", text: "מידזולם (Dormicum) 10mg IM/intranasal", maxScore: 2 },
          { id: "N02-P2-A2", text: "דיאזפאם (Valium) 10mg IV אם ורידי גישה קיים", maxScore: 2 },
          { id: "N02-P2-A3", text: "חזרה על בנזו לאחר 5 דקות אם ממשיך", maxScore: 2 },
          { id: "N02-P2-A4", text: "פתיחת נתיב אוויר + חמצן לאחר הפסקת עווית", maxScore: 2 },
          { id: "N02-P2-A5", text: "גלוקוז 50% IV אם היפוגליקמיה", maxScore: 2 },
        ],
      },
      {
        id: "N02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "N02-P3-A1", text: "מיקום recovery position לאחר הפסקת עווית", maxScore: 2 },
          { id: "N02-P3-A2", text: "ניטור נשימה ו-GCS לאחר בנזו", maxScore: 2 },
          { id: "N02-P3-A3", text: "פינוי לחדר מיון עם תיעוד משך, טיפולים", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא ניתן בנזודיאזפין לסטטוס אפילפטיקוס",
      "לא בוצעה בדיקת גלוקוז",
      "ניסיון להכניס דבר לפה בזמן עווית",
    ],
    impression: ["ניהול עווית", "בנזודיאזפינים", "גלוקוז", "פינוי"],
  },
  {
    id: "N03",
    code: "N03",
    title: "חבלת ראש + סימני הרניאציה",
    badge: "🦺",
    category: "neuro",
    story: "גבר בן 40 נפל מגובה של 3 מטר ונחבל בראשו. GCS התדרדר מ-14 ל-8. אישון ימני מורחב ואינו מגיב לאור. יש לחץ דם עולה ודופק יורד (Cushing's triad).",
    vitals: { pulse: "52", bp: "190/100", spo2: "94%", rr: "8", gcs: "8" },
    phases: [
      {
        id: "N03-P1", title: "הערכה ראשונית",
        actions: [
          { id: "N03-P1-A1", text: "GCS מלא + AVPU + ממצאי אישונים", maxScore: 2 },
          { id: "N03-P1-A2", text: "זיהוי Cushing's Triad — סימן לסכנת חיים", maxScore: 2 },
          { id: "N03-P1-A3", text: "ניטור SpO2, RR, BP, דופק", maxScore: 2 },
          { id: "N03-P1-A4", text: "אימוביליזציה עמוד שדרה צוואר (כולר)", maxScore: 2 },
        ],
      },
      {
        id: "N03-P2", title: "טיפול",
        actions: [
          { id: "N03-P2-A1", text: "חמצן לשמירה SpO2>98%", maxScore: 2 },
          { id: "N03-P2-A2", text: "שמירה PaCO2 35-40 — הימנעות מהיפרוונטילציה (אלא אם הרניאציה מיידית)", maxScore: 2 },
          { id: "N03-P2-A3", text: "RSI/אינטובציה אם GCS≤8 ו-RR<10", maxScore: 2 },
          { id: "N03-P2-A4", text: "נוזלים זהירים — NS בלבד, לא גלוקוז", maxScore: 2 },
          { id: "N03-P2-A5", text: "מניטול 20% 0.5-1g/kg IV אם הרניאציה", maxScore: 2 },
        ],
      },
      {
        id: "N03-P3", title: "פינוי",
        actions: [
          { id: "N03-P3-A1", text: "Pre-alert לנוירוכירורגיה: GCS, אישונים, BP, RR", maxScore: 2 },
          { id: "N03-P3-A2", text: "פינוי מהיר — כל דקה קריטית", maxScore: 2 },
          { id: "N03-P3-A3", text: "ניטור GCS ואישונים כל 2 דקות בדרך", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא זוהתה Cushing's Triad",
      "היפרוונטילציה אגרסיבית ללא סימני הרניאציה מיידית",
      "מתן נוזלים ביתר לחבלת ראש",
      "לא בוצעה אימוביליזציה",
    ],
    impression: ["GCS ואישונים", "Cushing's Triad", "ניהול נשימה", "פינוי"],
  },

  // ── TRAUMA ────────────────────────────────────────────────────────────────
  {
    id: "T01",
    code: "T01",
    title: "פוליטראומה — תאונת דרכים",
    badge: "🚗",
    category: "trauma",
    story: "גבר בן 35 שנפגע בתאונת דרכים חזיתית בבטן ובחזה. ברחוב. לא ידוע על אובדן הכרה. תלונה על כאב בטן, חזה וצלע. מצב כללי מחמיר בהדרגה.",
    vitals: { pulse: "120", bp: "85/50", spo2: "92%", rr: "24", gcs: "14" },
    phases: [
      {
        id: "T01-P1", title: "הערכה ראשונית — ABCDE",
        actions: [
          { id: "T01-P1-A1", text: "בטיחות סצנה + מחסומי זיהום", maxScore: 2 },
          { id: "T01-P1-A2", text: "שמירת עמוד שדרה (c-spine control) מיידי", maxScore: 2 },
          { id: "T01-P1-A3", text: "A: נתיב אוויר פתוח + B: נשימה דו-צדדית", maxScore: 2 },
          { id: "T01-P1-A4", text: "C: דימום גלוי — חנק ישיר/חוסם עורקים", maxScore: 2 },
          { id: "T01-P1-A5", text: "D: GCS + E: חשיפה מלאה עם שמירת חום", maxScore: 2 },
        ],
      },
      {
        id: "T01-P2", title: "טיפול",
        actions: [
          { id: "T01-P2-A1", text: "שני עורקי IV גסים (14G) + נוזלים 1L NS/RL", maxScore: 2 },
          { id: "T01-P2-A2", text: "חמצן 15L/min", maxScore: 2 },
          { id: "T01-P2-A3", text: "Permissive hypotension: BP systolic 80-90 לטראומה חדרת", maxScore: 2 },
          { id: "T01-P2-A4", text: "הגנה על חום — שמיכה, מניעת היפותרמיה", maxScore: 2 },
          { id: "T01-P2-A5", text: "חזה: אם חשד pneumo/hemothorax — עיבוד", maxScore: 2 },
        ],
      },
      {
        id: "T01-P3", title: "פינוי",
        actions: [
          { id: "T01-P3-A1", text: "Load & Go — הזזה לאמבולנס תוך 10 דקות", maxScore: 2 },
          { id: "T01-P3-A2", text: "Pre-alert Trauma Level 1: מנגנון, ממצאים, BP, GCS", maxScore: 2 },
          { id: "T01-P3-A3", text: "ניטור מתמשך בדרך — שינוי מצב = שינוי טיפול", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא שמרו c-spine",
      "מתן נוזלים ביתר (>2L) ללא שיקול",
      "שהייה בסצנה מעל 15 דקות — Load and Go!",
    ],
    impression: ["ABCDE", "c-spine", "נוזלים ונשימה", "פינוי מהיר"],
  },
  {
    id: "T02",
    code: "T02",
    title: "חבלה חודרת לחזה",
    badge: "🔪",
    category: "trauma",
    story: "בחור בן 22 נדקר בצד שמאל של החזה. פצע פתוח מוצץ (sucking chest wound). קוצר נשימה מחמיר. SpO2 יורד בצד שמאל שמיעה ירודה. ורידי צוואר שטוחים.",
    vitals: { pulse: "125", bp: "90/60", spo2: "88%", rr: "30", gcs: "14" },
    phases: [
      {
        id: "T02-P1", title: "הערכה ראשונית",
        actions: [
          { id: "T02-P1-A1", text: "זיהוי פצע פתוח מוצץ", maxScore: 2 },
          { id: "T02-P1-A2", text: "חמצן מיידי 15L/min", maxScore: 2 },
          { id: "T02-P1-A3", text: "ניטור SpO2, BP, שמיעת ריאות", maxScore: 2 },
          { id: "T02-P1-A4", text: "חשיפה מלאה — חיפוש פצעים נוספים", maxScore: 2 },
        ],
      },
      {
        id: "T02-P2", title: "טיפול",
        actions: [
          { id: "T02-P2-A1", text: "חבישה אוקלוסיבית עם valve (3-sided) על הפצע", maxScore: 2 },
          { id: "T02-P2-A2", text: "IV access גס + נוזלים", maxScore: 2 },
          { id: "T02-P2-A3", text: "מעקב אחר סימני tension (ורידי צוואר, deviated trachea)", maxScore: 2 },
          { id: "T02-P2-A4", text: "needle decompression אם מתפתח tension", maxScore: 2 },
        ],
      },
      {
        id: "T02-P3", title: "פינוי",
        actions: [
          { id: "T02-P3-A1", text: "Load & Go — פינוי מהיר לחדר מיון טראומה", maxScore: 2 },
          { id: "T02-P3-A2", text: "Pre-alert: פצע חודר חזה, BP, SpO2, טיפול", maxScore: 2 },
          { id: "T02-P3-A3", text: "ניטור SpO2 ו-BP מתמשך בדרך", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "חבישה אוקלוסיבית ארבעה צדדים — סכנת tension!",
      "לא זוהו פצעים נוספים",
      "עיכוב פינוי",
    ],
    impression: ["זיהוי פצע", "חבישה 3-sided", "מעקב tension", "פינוי"],
  },
  {
    id: "T03",
    code: "T03",
    title: "כוויות נרחבות >20% TBSA",
    badge: "🔥",
    category: "trauma",
    story: "גבר בן 30 ניצל משריפת בית. כוויות מדרגה שנייה ושלישית בפנים, חזה וזרועות — ~25% TBSA. קול צרוד, שיטפת ריאות בשאיפה. גבות ושיער חרוכים.",
    vitals: { pulse: "115", bp: "105/70", spo2: "93%", rr: "22", temp: "36.0°C" },
    phases: [
      {
        id: "T03-P1", title: "הערכה ראשונית",
        actions: [
          { id: "T03-P1-A1", text: "A: קול צרוד — חשד לחבלת שאיפה", maxScore: 2 },
          { id: "T03-P1-A2", text: "חמצן 100% בגוף גבוה — NRB mask", maxScore: 2 },
          { id: "T03-P1-A3", text: "חישוב TBSA בשיטת ה-9 (Rule of 9s)", maxScore: 2 },
          { id: "T03-P1-A4", text: "סיווג עומק כוויה: שני/שלישי", maxScore: 2 },
        ],
      },
      {
        id: "T03-P2", title: "טיפול",
        actions: [
          { id: "T03-P2-A1", text: "הכנה לאינטובציה — חבלת שאיפה = RSI מוקדם", maxScore: 2 },
          { id: "T03-P2-A2", text: "Parkland formula: 4ml × kg × TBSA% = נוזל 24h", maxScore: 2 },
          { id: "T03-P2-A3", text: "מחצית מהנוזל ב-8 שעות ראשונות", maxScore: 2 },
          { id: "T03-P2-A4", text: "חבישה יבשה נקייה — לא להרטיב בקרח", maxScore: 2 },
          { id: "T03-P2-A5", text: "מורפין IV לניהול כאב", maxScore: 2 },
        ],
      },
      {
        id: "T03-P3", title: "פינוי",
        actions: [
          { id: "T03-P3-A1", text: "Pre-alert מרכז כוויות: TBSA, חבלת שאיפה", maxScore: 2 },
          { id: "T03-P3-A2", text: "חימום — מניעת היפותרמיה", maxScore: 2 },
          { id: "T03-P3-A3", text: "פינוי מהיר למרכז כוויות", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא זוהתה חבלת שאיפה",
      "שימוש בקרח על כוויות",
      "לא חושבה Parkland formula",
      "עיכוב אינטובציה בחשד שאיפה",
    ],
    impression: ["A/B בכוויות", "TBSA + Parkland", "אינטובציה", "פינוי"],
  },
  {
    id: "T04",
    code: "T04",
    title: "פציעת מחיצה (Crush Injury)",
    badge: "⚠️",
    category: "trauma",
    story: "גבר בן 50 כלוא מתחת לקורת בניין שקרסה במשך שעה. חולץ כעת. גפה תחתונה שמאל כחלחלה ומוחצת. חשש מתסמונת שחרור (Crush Syndrome).",
    vitals: { pulse: "105", bp: "95/60", spo2: "95%", rr: "20" },
    phases: [
      {
        id: "T04-P1", title: "הערכה ראשונית",
        actions: [
          { id: "T04-P1-A1", text: "הערכת גפה — צבע, חום, נאדיות, תחושה", maxScore: 2 },
          { id: "T04-P1-A2", text: "ניטור: ECG, BP, SpO2 (חשש לhyperkalemia)", maxScore: 2 },
          { id: "T04-P1-A3", text: "שני IV גסים לפני שחרור לחץ", maxScore: 2 },
          { id: "T04-P1-A4", text: "חמצן 15L/min", maxScore: 2 },
        ],
      },
      {
        id: "T04-P2", title: "טיפול",
        actions: [
          { id: "T04-P2-A1", text: "נוזלים אגרסיביים לפני ואחרי שחרור: 1-1.5L NS", maxScore: 2 },
          { id: "T04-P2-A2", text: "ניטור ECG לאיתור שינויי היפרקלמיה", maxScore: 2 },
          { id: "T04-P2-A3", text: "הימנעות מחוסם עורקים אלא אם דימום חיוני", maxScore: 2 },
          { id: "T04-P2-A4", text: "מורפין IV לכאב", maxScore: 2 },
          { id: "T04-P2-A5", text: "Sodium bicarbonate אם ECG changes", maxScore: 2 },
        ],
      },
      {
        id: "T04-P3", title: "פינוי",
        actions: [
          { id: "T04-P3-A1", text: "Pre-alert: Crush Syndrome, דופק, BP, ECG", maxScore: 2 },
          { id: "T04-P3-A2", text: "פינוי מהיר לטיפול נמרץ", maxScore: 2 },
          { id: "T04-P3-A3", text: "ניטור ECG ו-BP מתמשך", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא ניתנו נוזלים לפני שחרור",
      "לא נוטר ECG",
      "שימוש בחוסם עורקים ללא אינדיקציה",
    ],
    impression: ["הערכת גפה", "Crush Syndrome", "נוזלים + ECG", "פינוי"],
  },
  {
    id: "T05",
    code: "T05",
    title: "שבר עצם הירך עם דימום",
    badge: "🦴",
    category: "trauma",
    story: "אישה בת 75 נפלה ועצם ירך שמאל שבורה — שבר בודד. ירך מעוותת ומקוצרת, כאב עז. יש סימנים לדימום פנימי משמעותי (1.5-2L אפשרי בשבר ירך).",
    vitals: { pulse: "115", bp: "100/65", spo2: "96%", rr: "18" },
    phases: [
      {
        id: "T05-P1", title: "הערכה ראשונית",
        actions: [
          { id: "T05-P1-A1", text: "הערכה ראשונית ABCDE", maxScore: 2 },
          { id: "T05-P1-A2", text: "זיהוי שבר ירך + הערכת ירך: עיוות, קיצור, סיבוב", maxScore: 2 },
          { id: "T05-P1-A3", text: "בדיקת דופק ותחושה דיסטלי לשבר", maxScore: 2 },
          { id: "T05-P1-A4", text: "ניטור: BP, דופק, SpO2", maxScore: 2 },
        ],
      },
      {
        id: "T05-P2", title: "טיפול",
        actions: [
          { id: "T05-P2-A1", text: "IV access גס × 2 + נוזלים 500mL", maxScore: 2 },
          { id: "T05-P2-A2", text: "Traction splint (Thomas splint) לשבר ירך", maxScore: 2 },
          { id: "T05-P2-A3", text: "מורפין IV 5-10mg לניהול כאב", maxScore: 2 },
          { id: "T05-P2-A4", text: "ניטור דופק דיסטלי לאחר ספליינט", maxScore: 2 },
        ],
      },
      {
        id: "T05-P3", title: "פינוי",
        actions: [
          { id: "T05-P3-A1", text: "פינוי לחדר מיון", maxScore: 2 },
          { id: "T05-P3-A2", text: "ניטור BP ודופק בדרך (דימום פנימי)", maxScore: 2 },
          { id: "T05-P3-A3", text: "Pre-alert: שבר ירך, הלם קל, גיל, מנגנון", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא הוכנס ספליינט traction",
      "לא ניתן כאב שלם",
      "לא הוערך דופק דיסטלי",
    ],
    impression: ["שבר + דימום", "Traction splint", "כאב", "פינוי"],
  },

  // ── PEDIATRIC ─────────────────────────────────────────────────────────────
  {
    id: "P01",
    code: "P01",
    title: "דום נשימה ילדותי",
    badge: "👶",
    category: "pediatric",
    story: "תינוק בן 8 חודשים כחלחל, לא נושם, אין תגובה. אמא מדווחת שהשאיר פתאום להיות בוכה ונחנק. אין היסטוריה של מחלה. אין עצם בגרון גלויה.",
    vitals: { pulse: "0", bp: "0/0", spo2: "0%", rr: "0", gcs: "3" },
    phases: [
      {
        id: "P01-P1", title: "הערכה ראשונית",
        actions: [
          { id: "P01-P1-A1", text: "בדיקת תגובה לתינוק: שמיעה, נגיעה", maxScore: 2 },
          { id: "P01-P1-A2", text: "בדיקת נשימה ודופק (brachial artery)", maxScore: 2 },
          { id: "P01-P1-A3", text: "פתיחת נתיב אוויר: head-tilt/chin-lift עדין", maxScore: 2 },
          { id: "P01-P1-A4", text: "בדיקת חסימה גלויה בגרון", maxScore: 2 },
        ],
      },
      {
        id: "P01-P2", title: "CPR ו-PALS",
        actions: [
          { id: "P01-P2-A1", text: "התחלת CPR 30:2, לחיצות 4cm, 100-120/min", maxScore: 2 },
          { id: "P01-P2-A2", text: "נשיפות BVM תינוק — נפח מינימלי, SpO2 monitor", maxScore: 2 },
          { id: "P01-P2-A3", text: "חיבור AED/פדלי ילדים אם >1 שנה, adults אם >8", maxScore: 2 },
          { id: "P01-P2-A4", text: "IO access אם לא ורידי בזמן", maxScore: 2 },
          { id: "P01-P2-A5", text: "אדרנלין 0.01mg/kg IV/IO", maxScore: 2 },
        ],
      },
      {
        id: "P01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "P01-P3-A1", text: "ROSC — בדיקת דופק brachial", maxScore: 2 },
          { id: "P01-P3-A2", text: "Pre-alert: גיל, מנגנון, CPR duration, ROSC/לא", maxScore: 2 },
          { id: "P01-P3-A3", text: "פינוי מהיר לחדר מיון ילדים", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לחיצות חזה עמוקות מדי (>4cm בתינוק)",
      "שימוש בפדלי מבוגרים בתינוק",
      "הפסקת CPR מעל 10 שניות",
    ],
    impression: ["הערכת תינוק", "CPR ילדי", "PALS תרופות", "פינוי"],
  },
  {
    id: "P02",
    code: "P02",
    title: "עווית עם חום (Febrile Seizure)",
    badge: "🌡️",
    category: "pediatric",
    story: "ילד בן 2.5 מגיע בעווית כללית שנמשכת 4 דקות. חום 39.5°C. הורים חסרי ניסיון פחדניים. ללא היסטוריה של אפילפסיה. זו עוויתו הראשונה.",
    vitals: { pulse: "155", bp: "90/55", spo2: "94%", rr: "22", temp: "39.5°C", gcs: "8" },
    phases: [
      {
        id: "P02-P1", title: "הערכה ראשונית",
        actions: [
          { id: "P02-P1-A1", text: "בטיחות — הגנה על ראש ילד", maxScore: 2 },
          { id: "P02-P1-A2", text: "ניטור SpO2, דופק, תיעוד משך עווית", maxScore: 2 },
          { id: "P02-P1-A3", text: "מדידת חום", maxScore: 2 },
          { id: "P02-P1-A4", text: "בדיקת גלוקוז", maxScore: 2 },
        ],
      },
      {
        id: "P02-P2", title: "טיפול",
        actions: [
          { id: "P02-P2-A1", text: "מידזולם אף/IM 0.2mg/kg אם >5 דקות", maxScore: 2 },
          { id: "P02-P2-A2", text: "חמצן לאחר הפסקת עווית", maxScore: 2 },
          { id: "P02-P2-A3", text: "הפחתת חום: פשיטת לבוש, מניחים במקום קריר", maxScore: 2 },
          { id: "P02-P2-A4", text: "הרגעת ההורים + הסבר מקצועי", maxScore: 2 },
        ],
      },
      {
        id: "P02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "P02-P3-A1", text: "Recovery position לאחר הפסקת עווית", maxScore: 2 },
          { id: "P02-P3-A2", text: "ניטור RR + SpO2 לאחר מידזולם", maxScore: 2 },
          { id: "P02-P3-A3", text: "פינוי לחדר מיון ילדים לבדיקה ראשונית", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא בוצעה בדיקת גלוקוז",
      "לא ניתן בנזודיאזפין לעווית >5 דקות",
      "לא מדדו חום",
    ],
    impression: ["הגנה ובטיחות", "בנזו לפי גיל", "חום", "פינוי"],
  },
  {
    id: "P03",
    code: "P03",
    title: "טראומת ילד — פגיעת ראש",
    badge: "🧒",
    category: "pediatric",
    story: "ילד בן 7 נפל מאופניים מגובה 1 מטר וחבט ראשו על אספלט. חבש קסדה. מאות הגעה: מבולבל, מקיא. ניכרת שפשוף על הרקה שמאל. הורים חרדים.",
    vitals: { pulse: "100", bp: "105/65", spo2: "98%", rr: "20", gcs: "12" },
    phases: [
      {
        id: "P03-P1", title: "הערכה ראשונית",
        actions: [
          { id: "P03-P1-A1", text: "GCS ילדי + AVPU", maxScore: 2 },
          { id: "P03-P1-A2", text: "ניטור SpO2, BP, דופק", maxScore: 2 },
          { id: "P03-P1-A3", text: "שמירת c-spine (כולר ילדי)", maxScore: 2 },
          { id: "P03-P1-A4", text: "בחינת אישונים ותגובה לאור", maxScore: 2 },
        ],
      },
      {
        id: "P03-P2", title: "טיפול",
        actions: [
          { id: "P03-P2-A1", text: "חמצן אם SpO2<95%", maxScore: 2 },
          { id: "P03-P2-A2", text: "IV access אם GCS<13", maxScore: 2 },
          { id: "P03-P2-A3", text: "לא ניתן מורפין לחבלת ראש!", maxScore: 2 },
          { id: "P03-P2-A4", text: "שמיכה + מיקום נכון", maxScore: 2 },
        ],
      },
      {
        id: "P03-P3", title: "פינוי",
        actions: [
          { id: "P03-P3-A1", text: "Pre-alert ילד: גיל, מנגנון, GCS, אישונים", maxScore: 2 },
          { id: "P03-P03-A2", text: "פינוי לחדר מיון ילדים עם טראומה מוחית", maxScore: 2 },
          { id: "P03-P3-A3", text: "ניטור GCS כל 2 דקות — אזהרת הרניאציה", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא שמרו c-spine",
      "מתן אופיואידים לחבלת ראש",
      "לא ניטר GCS מתמשך",
    ],
    impression: ["GCS ילדי", "c-spine", "אישונים", "פינוי"],
  },

  // ── TOXICOLOGY ────────────────────────────────────────────────────────────
  {
    id: "X01",
    code: "X01",
    title: "הרעלת אורגנופוספטים",
    badge: "☠️",
    category: "toxicology",
    story: "פועל חקלאי בן 45 חשוף לריסוס חקלאי. מגיע עם ריר, הזעה, דמעות, שרירים מפרפרים, מיוזה (אישונים קטנים). מבולבל, נשימה שרקנית.",
    vitals: { pulse: "55", bp: "85/50", spo2: "88%", rr: "28" },
    phases: [
      {
        id: "X01-P1", title: "הערכה ראשונית",
        actions: [
          { id: "X01-P1-A1", text: "בטיחות — מחסומי זיהום מלאים (כפפות כפולות, מסכה)", maxScore: 2 },
          { id: "X01-P1-A2", text: "זיהוי SLUDGE: ריר, שתן, עיכול, דמעות, GI, הזעה", maxScore: 2 },
          { id: "X01-P1-A3", text: "ניטור: SpO2, ECG, דופק, BP", maxScore: 2 },
          { id: "X01-P1-A4", text: "פתיחת נתיב אוויר + שאיבת הפרשות", maxScore: 2 },
        ],
      },
      {
        id: "X01-P2", title: "טיפול",
        actions: [
          { id: "X01-P2-A1", text: "אטרופין 2-4mg IV כל 5-10 דקות עד יובש פה", maxScore: 2 },
          { id: "X01-P2-A2", text: "פרלידוקסים (2-PAM) 1-2g IV לביטול ACh", maxScore: 2 },
          { id: "X01-P2-A3", text: "מידזולם לפרפורי שרירים", maxScore: 2 },
          { id: "X01-P2-A4", text: "אינטובציה RSI אם אין שיפור נשימתי", maxScore: 2 },
        ],
      },
      {
        id: "X01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "X01-P3-A1", text: "ניטור הפרשות לאחר אטרופין", maxScore: 2 },
          { id: "X01-P3-A2", text: "Pre-alert: הרעלה + שם חומר אם ידוע", maxScore: 2 },
          { id: "X01-P3-A3", text: "פינוי לטיפול נמרץ + הודעה לרעלנולוגיה", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא הכניסו מחסומי זיהום מלאים",
      "לא ניתן אטרופין",
      "מתן אטרופין בלתי מספיק (מינון נמוך)",
    ],
    impression: ["בטיחות", "SLUDGE", "אטרופין + 2-PAM", "פינוי"],
  },
  {
    id: "X02",
    code: "X02",
    title: "מינון יתר אופיואידים",
    badge: "💊",
    category: "toxicology",
    story: "גבר בן 28 נמצא על ידי חברו לא מגיב בדירה. ליד סירינג'ה. מציין נשימה שטחית, אישונים קטנים (מיוזה), שפתיים כחלחלות.",
    vitals: { pulse: "55", bp: "90/60", spo2: "78%", rr: "6", gcs: "5" },
    phases: [
      {
        id: "X02-P1", title: "הערכה ראשונית",
        actions: [
          { id: "X02-P1-A1", text: "בטיחות + בדיקת כלים חדים בסצנה", maxScore: 2 },
          { id: "X02-P1-A2", text: "זיהוי הטריאדה: מיוזה, נשימה דחוקה, הכרה ירודה", maxScore: 2 },
          { id: "X02-P1-A3", text: "פתיחת נתיב אוויר + BVM rescue breaths", maxScore: 2 },
          { id: "X02-P1-A4", text: "ניטור SpO2, RR, GCS", maxScore: 2 },
        ],
      },
      {
        id: "X02-P2", title: "טיפול",
        actions: [
          { id: "X02-P2-A1", text: "נלוקסון (Narcan) 0.4-2mg IV/IM/IN", maxScore: 2 },
          { id: "X02-P2-A2", text: "חזרה על נלוקסון כל 2-3 דקות אם אין תגובה (מקס 10mg)", maxScore: 2 },
          { id: "X02-P2-A3", text: "חמצן 15L/min או BVM", maxScore: 2 },
          { id: "X02-P2-A4", text: "גישה ורידית", maxScore: 2 },
          { id: "X02-P2-A5", text: "ניטור לחזרת עייפות נשימתית (נלוקסון קצר מאופיואידים)", maxScore: 2 },
        ],
      },
      {
        id: "X02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "X02-P3-A1", text: "ניטור RR ו-SpO2 כל 2 דקות", maxScore: 2 },
          { id: "X02-P3-A2", text: "Pre-alert: OD אופיואידים, נלוקסון, מצב", maxScore: 2 },
          { id: "X02-P3-A3", text: "פינוי לחדר מיון — לא לשחרר לאחר תגובה לנלוקסון!", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "לא ניתן נלוקסון",
      "שחרור לאחר תגובה לנלוקסון ללא פינוי",
      "לא ניטרה חזרת עייפות נשימתית",
    ],
    impression: ["זיהוי OD", "נלוקסון", "נשימה", "פינוי"],
  },

  // ── OBSTETRIC ─────────────────────────────────────────────────────────────
  {
    id: "O01",
    code: "O01",
    title: "אקלמפסיה בהריון",
    badge: "🤰",
    category: "obstetric",
    story: "אישה בת 28 בשבוע 34 להריון, יתר לחץ דם מוכר, מגיעה עם כאב ראש חמור, ראייה מטושטשת ואז עווית כללית. בעלה מדווח שרגלים נפחו בימים האחרונים.",
    vitals: { pulse: "108", bp: "175/115", spo2: "92%", rr: "20", gcs: "9" },
    phases: [
      {
        id: "O01-P1", title: "הערכה ראשונית",
        actions: [
          { id: "O01-P1-A1", text: "הגנה מפני נזק בעווית — שמירת מיקום צד שמאל", maxScore: 2 },
          { id: "O01-P1-A2", text: "תיעוד BP, SpO2, משך עווית", maxScore: 2 },
          { id: "O01-P1-A3", text: "הערכת עובר: דופק עוברי אם זמין", maxScore: 2 },
          { id: "O01-P1-A4", text: "חמצן 15L/min", maxScore: 2 },
        ],
      },
      {
        id: "O01-P2", title: "טיפול",
        actions: [
          { id: "O01-P2-A1", text: "מגנזיום סולפט 4g IV על פני 10-15 דקות (FIRST LINE)", maxScore: 2 },
          { id: "O01-P2-A2", text: "לא ניתן דיאזפאם לאקלמפסיה — מגנזיום!", maxScore: 2 },
          { id: "O01-P2-A3", text: "לאברטלול (Labetalol) 20mg IV לבקרת BP אם >160/110", maxScore: 2 },
          { id: "O01-P2-A4", text: "גישה ורידית × 2", maxScore: 2 },
          { id: "O01-P2-A5", text: "מיקום שמאל lateral decubitus להפחתת לחץ על IVC", maxScore: 2 },
        ],
      },
      {
        id: "O01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "O01-P3-A1", text: "ניטור BP כל 2-5 דקות, SpO2, RR", maxScore: 2 },
          { id: "O01-P3-A2", text: "הכנה ללידה חירום בשטח אם צורך", maxScore: 2 },
          { id: "O01-P3-A3", text: "Pre-alert: הריון שבוע 34, אקלמפסיה, BP, מגנזיום", maxScore: 2 },
          { id: "O01-P3-A4", text: "פינוי דחוף לחדר לידה/גינקולוגיה", maxScore: 2 },
        ],
      },
    ],
    failCriteria: [
      "מתן בנזודיאזפין במקום מגנזיום",
      "לא שמרו מיקום שמאל",
      "לא ניטר BP תכוף",
      "עיכוב פינוי לחדר לידה",
    ],
    impression: ["אקלמפסיה", "מגנזיום", "BP", "פינוי"],
  },
];

export const categoryLabels: Record<MdaScenario["category"], string> = {
  cardiac: "לב",
  respiratory: "נשימה",
  neuro: "נוירולוגיה",
  trauma: "טראומה",
  pediatric: "ילדים",
  obstetric: "מיילדות",
  toxicology: "הרעלות",
};

export const categoryColors: Record<MdaScenario["category"], string> = {
  cardiac: "bg-red-500/20 text-red-400 border-red-500/30",
  respiratory: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  neuro: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  trauma: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pediatric: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  obstetric: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  toxicology: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};
