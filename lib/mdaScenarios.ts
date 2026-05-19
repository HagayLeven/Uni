export interface MdaAction {
  id: string;
  text: string;
  maxScore: number;
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
          { id: "C01-P1-A1", text: "בטיחות סצנה ומחסומי זיהום", maxScore: 3 },
          { id: "C01-P1-A2", text: "רושם של מצב כללי: הכרה, נשימה, צבע עור", maxScore: 3 },
          { id: "C01-P1-A3", text: "פתיחת נתיב אוויר ובדיקת נשימה", maxScore: 3 },
          { id: "C01-P1-A4", text: "החלת חמצן במסכה 15L/min", maxScore: 3 },
          { id: "C01-P1-A5", text: "ניטור: SpO2, ECG 12 ערוצים, לחץ דם", maxScore: 3 },
        ],
      },
      {
        id: "C01-P2", title: "טיפול",
        actions: [
          { id: "C01-P2-A1", text: "פתיחת ורידי עורקי: 2 עורקים, נוזלים 250mL bolus", maxScore: 3 },
          { id: "C01-P2-A2", text: "אספירין 300mg PO (ללעוס)", maxScore: 3 },
          { id: "C01-P2-A3", text: "ניטרוגליצרין 0.4mg SL אם BP>90 Systolic", maxScore: 3 },
          { id: "C01-P2-A4", text: "מורפין 2-4mg IV לניהול כאב לפי נחיצות", maxScore: 3 },
          { id: "C01-P2-A5", text: "הכנת ציוד דפיברילציה ומוניטורינג מתמשך", maxScore: 3 },
          { id: "C01-P2-A6", text: "הודעה מוקדמת לחדר מיון (Pre-alert STEMI)", maxScore: 3 },
        ],
      },
      {
        id: "C01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "C01-P3-A1", text: "ECG חוזר לאחר טיפול — תיעוד שינויים", maxScore: 3 },
          { id: "C01-P3-A2", text: "ניטור לחץ דם כל 5 דקות", maxScore: 3 },
          { id: "C01-P3-A3", text: "פינוי מהיר למרכז קרדיולוגי עם PCI", maxScore: 3 },
          { id: "C01-P3-A4", text: "תיעוד זמן תסמינים, טיפולים ותגובות", maxScore: 3 },
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
          { id: "C02-P1-A1", text: "בטיחות סצנה מיידית", maxScore: 3 },
          { id: "C02-P1-A2", text: "בדיקת תגובה: קריאה + טלטול כתפיים", maxScore: 3 },
          { id: "C02-P1-A3", text: "בדיקת דופק ונשימה במקביל (עד 10 שניות)", maxScore: 3 },
          { id: "C02-P1-A4", text: "הזעקה לעזרה + התחלת CPR 30:2", maxScore: 3 },
          { id: "C02-P1-A5", text: "חיבור AED והפעלתו", maxScore: 3 },
        ],
      },
      {
        id: "C02-P2", title: "דפיברילציה ו-ACLS",
        actions: [
          { id: "C02-P2-A1", text: "דפיברילציה 200J ביפאזי בהקדם האפשרי", maxScore: 3 },
          { id: "C02-P2-A2", text: "חידוש CPR מיד לאחר הלם ל-2 דקות", maxScore: 3 },
          { id: "C02-P2-A3", text: "ניהול נתיב אוויר מתקדם (LMA/ETT)", maxScore: 3 },
          { id: "C02-P2-A4", text: "אדרנלין 1mg IV כל 3-5 דקות", maxScore: 3 },
          { id: "C02-P2-A5", text: "בדיקת סיבות הפיכות (5H/5T)", maxScore: 3 },
          { id: "C02-P2-A6", text: "אמיודארון 300mg IV לאחר 3 הלמות", maxScore: 3 },
        ],
      },
      {
        id: "C02-P3", title: "ROSC וניטור",
        actions: [
          { id: "C02-P3-A1", text: "אימות ROSC: דופק, לחץ דם, SpO2", maxScore: 3 },
          { id: "C02-P3-A2", text: "ECG 12 ערוצים לאחר ROSC", maxScore: 3 },
          { id: "C02-P3-A3", text: "שמירה על SpO2 94-98%, הימנעות מהיפראוקסיה", maxScore: 3 },
          { id: "C02-P3-A4", text: "פינוי מהיר — Pre-alert מוקדם לחדר מיון", maxScore: 3 },
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
          { id: "C03-P1-A1", text: "הערכת מצב כללי ותודעה", maxScore: 3 },
          { id: "C03-P1-A2", text: "ניטור: ECG 12 ערוצים, SpO2, לחץ דם", maxScore: 3 },
          { id: "C03-P1-A3", text: "זיהוי SVT על ה-ECG (QRS צר, קצב סדיר)", maxScore: 3 },
          { id: "C03-P1-A4", text: "פתיחת גישה ורידית", maxScore: 3 },
        ],
      },
      {
        id: "C03-P2", title: "טיפול",
        actions: [
          { id: "C03-P2-A1", text: "ניסיון תמרון וגאלי: Valsalva/עיסוי קרוטיד", maxScore: 3 },
          { id: "C03-P2-A2", text: "אדנוזין 6mg IV rapid push אם וגאלי נכשל", maxScore: 3 },
          { id: "C03-P2-A3", text: "אדנוזין 12mg IV אם אין תגובה לאחר 2 דקות", maxScore: 3 },
          { id: "C03-P2-A4", text: "הכנת ציוד דפיברילציה סינכרוני (cardioversion)", maxScore: 3 },
          { id: "C03-P2-A5", text: "תיעוד ECG לאחר כל טיפול", maxScore: 3 },
        ],
      },
      {
        id: "C03-P3", title: "ניטור ופינוי",
        actions: [
          { id: "C03-P3-A1", text: "אימות המרה לסינוס נורמאלי ב-ECG", maxScore: 3 },
          { id: "C03-P3-A2", text: "ניטור לחץ דם ודופק לאחר המרה", maxScore: 3 },
          { id: "C03-P3-A3", text: "פינוי לבדיקה קרדיולוגית", maxScore: 3 },
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
          { id: "C04-P1-A1", text: "הושבת המטופל ב-90° (seated upright)", maxScore: 3 },
          { id: "C04-P1-A2", text: "מתן חמצן — CPAP אם זמין, אחרת מסכה 15L", maxScore: 3 },
          { id: "C04-P1-A3", text: "ניטור: SpO2, ECG, לחץ דם, RR", maxScore: 3 },
          { id: "C04-P1-A4", text: "השמעת ריאות — רחלות דו-צדדיות", maxScore: 3 },
        ],
      },
      {
        id: "C04-P2", title: "טיפול",
        actions: [
          { id: "C04-P2-A1", text: "פתיחת גישה ורידית — IV access", maxScore: 3 },
          { id: "C04-P2-A2", text: "ניטרוגליצרין 0.4mg SL אם BP>100 Systolic", maxScore: 3 },
          { id: "C04-P2-A3", text: "פוירוסמייד (Lasix) 40-80mg IV", maxScore: 3 },
          { id: "C04-P2-A4", text: "הימנעות ממתן נוזלים IV!", maxScore: 3 },
          { id: "C04-P2-A5", text: "הכנה לאינטובציה אם SpO2 לא משתפר", maxScore: 3 },
        ],
      },
      {
        id: "C04-P3", title: "ניטור ופינוי",
        actions: [
          { id: "C04-P3-A1", text: "ניטור SpO2 ו-RR כל 2 דקות", maxScore: 3 },
          { id: "C04-P3-A2", text: "תיעוד תגובה לטיפול", maxScore: 3 },
          { id: "C04-P3-A3", text: "פינוי בישיבה עם ציוד CPAP/אינטובציה מוכן", maxScore: 3 },
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
          { id: "C05-P1-A1", text: "הערכת תסמינים מלאה (OPQRST)", maxScore: 3 },
          { id: "C05-P1-A2", text: "ECG 12 ערוצים ופרשנות", maxScore: 3 },
          { id: "C05-P1-A3", text: "ניטור SpO2, BP, דופק", maxScore: 3 },
          { id: "C05-P1-A4", text: "חמצן רק אם SpO2<94%", maxScore: 3 },
        ],
      },
      {
        id: "C05-P2", title: "טיפול",
        actions: [
          { id: "C05-P2-A1", text: "פתיחת גישה ורידית", maxScore: 3 },
          { id: "C05-P2-A2", text: "אספירין 300mg PO", maxScore: 3 },
          { id: "C05-P2-A3", text: "ניטרוגליצרין SL אם BP>100", maxScore: 3 },
          { id: "C05-P2-A4", text: "מורפין 2-4mg IV לכאב עקשני", maxScore: 3 },
          { id: "C05-P2-A5", text: "ECG חוזר כל 15 דקות לזיהוי התקדמות ל-STEMI", maxScore: 3 },
        ],
      },
      {
        id: "C05-P3", title: "פינוי",
        actions: [
          { id: "C05-P3-A1", text: "Pre-alert לחדר מיון קרדיולוגי", maxScore: 3 },
          { id: "C05-P3-A2", text: "פינוי בשכיבה עם ניטור מתמשך", maxScore: 3 },
          { id: "C05-P3-A3", text: "תיעוד מלא כולל ECG, תרופות ותגובות", maxScore: 3 },
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
          { id: "R01-P1-A1", text: "הערכת חומרת אסתמה: דיבור, עבודת נשימה, צפצופים", maxScore: 3 },
          { id: "R01-P1-A2", text: "חמצן 15L/min במסכה", maxScore: 3 },
          { id: "R01-P1-A3", text: "ניטור SpO2, קצב לב, RR", maxScore: 3 },
          { id: "R01-P1-A4", text: "הושבת בישיבה נוחה (tripod position)", maxScore: 3 },
        ],
      },
      {
        id: "R01-P2", title: "טיפול",
        actions: [
          { id: "R01-P2-A1", text: "ונטולין (Salbutamol) נבולייזר 5mg", maxScore: 3 },
          { id: "R01-P2-A2", text: "אטרובנט (Ipratropium) נבולייזר 0.5mg בשילוב", maxScore: 3 },
          { id: "R01-P2-A3", text: "מגנזיום סולפט 2g IV על פני 20 דקות", maxScore: 3 },
          { id: "R01-P2-A4", text: "מתילפרדניסולון (סולו-מדרול) 125mg IV", maxScore: 3 },
          { id: "R01-P2-A5", text: "הכנה לאינטובציה אם אין שיפור", maxScore: 3 },
        ],
      },
      {
        id: "R01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R01-P3-A1", text: "הערכה חוזרת לאחר נבולייזר (SpO2, צפצופים)", maxScore: 3 },
          { id: "R01-P3-A2", text: "פינוי מהיר לחדר מיון עם ניטור מתמשך", maxScore: 3 },
          { id: "R01-P3-A3", text: "Pre-alert — אסתמה חמורה, טיפול כנ״ל", maxScore: 3 },
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
          { id: "R02-P1-A1", text: "הערכת נתיב אוויר ונשימה — ABCDE", maxScore: 3 },
          { id: "R02-P1-A2", text: "ממצאי בדיקה: ורידי צוואר, deviated trachea, העדר נשימה", maxScore: 3 },
          { id: "R02-P1-A3", text: "חמצן 15L/min מיידי", maxScore: 3 },
          { id: "R02-P1-A4", text: "אבחנה קלינית של tension pneumothorax", maxScore: 3 },
        ],
      },
      {
        id: "R02-P2", title: "טיפול — needle decompression",
        actions: [
          { id: "R02-P2-A1", text: "זיהוי אתר: 2nd ICS, midclavicular line, צד הפגוע", maxScore: 3 },
          { id: "R02-P2-A2", text: "ניקור מחט 14G/16G בטכניקה סטרילית", maxScore: 3 },
          { id: "R02-P2-A3", text: "אימות ביצוע: שחרור אוויר, שיפור SpO2 ו-BP", maxScore: 3 },
          { id: "R02-P2-A4", text: "חזרה לגישה ב-4th/5th ICS AAL אם לא משתפר", maxScore: 3 },
        ],
      },
      {
        id: "R02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R02-P3-A1", text: "ניטור SpO2, BP, RR לאחר ניקור", maxScore: 3 },
          { id: "R02-P3-A2", text: "הכנה לצינור חזה בית חולים (pre-alert trauma)", maxScore: 3 },
          { id: "R02-P3-A3", text: "פינוי מהיר לחדר מיון טראומה", maxScore: 3 },
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
          { id: "R03-P1-A1", text: "זיהוי אנפילקסיס: עור, נשימה, המודינמיקה", maxScore: 3 },
          { id: "R03-P1-A2", text: "הנחת המטופל: שכיבה עם רגליים מורמות (אלא אם קשי נשימה)", maxScore: 3 },
          { id: "R03-P1-A3", text: "חמצן 15L/min", maxScore: 3 },
          { id: "R03-P1-A4", text: "ניטור: SpO2, BP, ECG", maxScore: 3 },
        ],
      },
      {
        id: "R03-P2", title: "טיפול",
        actions: [
          { id: "R03-P2-A1", text: "אדרנלין 0.5mg IM (Adrenaline 1:1000) בשריר הירך", maxScore: 3 },
          { id: "R03-P2-A2", text: "חזרה על מנת אדרנלין IM לאחר 5-15 דקות אם לא מגיב", maxScore: 3 },
          { id: "R03-P2-A3", text: "נוזלים IV 1-2L Normal Saline bolus", maxScore: 3 },
          { id: "R03-P2-A4", text: "כלוראמין (Chlorphenamine) 10mg IV + הידרוקורטיזון 200mg IV", maxScore: 3 },
          { id: "R03-P2-A5", text: "הכנה לאינטובציה/קריקוטרירוטומיה", maxScore: 3 },
        ],
      },
      {
        id: "R03-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R03-P3-A1", text: "ניטור אחרי אדרנלין: BP, SpO2, קולות גרון", maxScore: 3 },
          { id: "R03-P3-A2", text: "פינוי מהיר לחדר מיון — סכנה לחיים", maxScore: 3 },
          { id: "R03-P3-A3", text: "Pre-alert: אנפילקסיס, טיפול, מצב נוכחי", maxScore: 3 },
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
          { id: "R04-P1-A1", text: "הערכת נשימה מפורטת: RR, מאמץ, צלילים", maxScore: 3 },
          { id: "R04-P1-A2", text: "חמצן מותאם לשמירה SpO2>94%", maxScore: 3 },
          { id: "R04-P1-A3", text: "ניטור: SpO2, BP, ECG 12 ערוצים, חום", maxScore: 3 },
          { id: "R04-P1-A4", text: "בדיקת גפיים תחתונות לסימני DVT", maxScore: 3 },
        ],
      },
      {
        id: "R04-P2", title: "טיפול",
        actions: [
          { id: "R04-P2-A1", text: "פתיחת גישה ורידית", maxScore: 3 },
          { id: "R04-P2-A2", text: "נוזלים: 250mL bolus זהיר אם BP<100", maxScore: 3 },
          { id: "R04-P2-A3", text: "הכנה לאינטובציה אם SpO2 לא מגיב", maxScore: 3 },
          { id: "R04-P2-A4", text: "אין ליתן אנטיביוטיקה בשטח (רשום ב-handover)", maxScore: 3 },
        ],
      },
      {
        id: "R04-P3", title: "ניטור ופינוי",
        actions: [
          { id: "R04-P3-A1", text: "Pre-alert: חשד PE/PNA, BP נמוך, SpO2 נמוך", maxScore: 3 },
          { id: "R04-P3-A2", text: "פינוי בישיבה עם ניטור מתמשך", maxScore: 3 },
          { id: "R04-P3-A3", text: "תיעוד: תסמינים, משך, סביבה כירורגית, ממצאים", maxScore: 3 },
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
          { id: "N01-P1-A1", text: "בדיקת FAST: פנים, ידיים, דיבור, זמן", maxScore: 3 },
          { id: "N01-P1-A2", text: "תיעוד זמן תחילת תסמינים (last seen well)", maxScore: 3 },
          { id: "N01-P1-A3", text: "ניטור: GCS, BP, SpO2, גלוקוז", maxScore: 3 },
          { id: "N01-P1-A4", text: "הימנעות מהורדת BP אגרסיבית בשטח", maxScore: 3 },
        ],
      },
      {
        id: "N01-P2", title: "טיפול",
        actions: [
          { id: "N01-P2-A1", text: "פתיחת גישה ורידית — בגפה לא משותקת", maxScore: 3 },
          { id: "N01-P2-A2", text: "חמצן רק אם SpO2<94%", maxScore: 3 },
          { id: "N01-P2-A3", text: "בדיקת גלוקוז + טיפול בהיפוגליקמיה אם רלוונטי", maxScore: 3 },
          { id: "N01-P2-A4", text: "אין לתת אספירין בשטח (לא ידוע אם דימומי)", maxScore: 3 },
          { id: "N01-P2-A5", text: "מיקום: ראש מוגבה 30° אלא אם BP נמוך", maxScore: 3 },
        ],
      },
      {
        id: "N01-P3", title: "פינוי",
        actions: [
          { id: "N01-P3-A1", text: "Pre-alert STROKE עם זמן תחילה מדויק", maxScore: 3 },
          { id: "N01-P3-A2", text: "פינוי מהיר למרכז שבץ עם CT/tPA", maxScore: 3 },
          { id: "N01-P3-A3", text: "תיעוד: FAST, GCS, תרופות (קומדין!), זמנים", maxScore: 3 },
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
          { id: "N02-P1-A1", text: "בטיחות — הרחקת גורמי סכנה, הגנה על ראש", maxScore: 3 },
          { id: "N02-P1-A2", text: "ניטור SpO2, דופק, הכרה בין התקפים", maxScore: 3 },
          { id: "N02-P1-A3", text: "תיעוד משך עווית ומאפיינים", maxScore: 3 },
          { id: "N02-P1-A4", text: "בדיקת גלוקוז", maxScore: 3 },
        ],
      },
      {
        id: "N02-P2", title: "טיפול",
        actions: [
          { id: "N02-P2-A1", text: "מידזולם (Dormicum) 10mg IM/intranasal", maxScore: 3 },
          { id: "N02-P2-A2", text: "דיאזפאם (Valium) 10mg IV אם ורידי גישה קיים", maxScore: 3 },
          { id: "N02-P2-A3", text: "חזרה על בנזו לאחר 5 דקות אם ממשיך", maxScore: 3 },
          { id: "N02-P2-A4", text: "פתיחת נתיב אוויר + חמצן לאחר הפסקת עווית", maxScore: 3 },
          { id: "N02-P2-A5", text: "גלוקוז 50% IV אם היפוגליקמיה", maxScore: 3 },
        ],
      },
      {
        id: "N02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "N02-P3-A1", text: "מיקום recovery position לאחר הפסקת עווית", maxScore: 3 },
          { id: "N02-P3-A2", text: "ניטור נשימה ו-GCS לאחר בנזו", maxScore: 3 },
          { id: "N02-P3-A3", text: "פינוי לחדר מיון עם תיעוד משך, טיפולים", maxScore: 3 },
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
          { id: "N03-P1-A1", text: "GCS מלא + AVPU + ממצאי אישונים", maxScore: 3 },
          { id: "N03-P1-A2", text: "זיהוי Cushing's Triad — סימן לסכנת חיים", maxScore: 3 },
          { id: "N03-P1-A3", text: "ניטור SpO2, RR, BP, דופק", maxScore: 3 },
          { id: "N03-P1-A4", text: "אימוביליזציה עמוד שדרה צוואר (כולר)", maxScore: 3 },
        ],
      },
      {
        id: "N03-P2", title: "טיפול",
        actions: [
          { id: "N03-P2-A1", text: "חמצן לשמירה SpO2>98%", maxScore: 3 },
          { id: "N03-P2-A2", text: "שמירה PaCO2 35-40 — הימנעות מהיפרוונטילציה (אלא אם הרניאציה מיידית)", maxScore: 3 },
          { id: "N03-P2-A3", text: "RSI/אינטובציה אם GCS≤8 ו-RR<10", maxScore: 3 },
          { id: "N03-P2-A4", text: "נוזלים זהירים — NS בלבד, לא גלוקוז", maxScore: 3 },
          { id: "N03-P2-A5", text: "מניטול 20% 0.5-1g/kg IV אם הרניאציה", maxScore: 3 },
        ],
      },
      {
        id: "N03-P3", title: "פינוי",
        actions: [
          { id: "N03-P3-A1", text: "Pre-alert לנוירוכירורגיה: GCS, אישונים, BP, RR", maxScore: 3 },
          { id: "N03-P3-A2", text: "פינוי מהיר — כל דקה קריטית", maxScore: 3 },
          { id: "N03-P3-A3", text: "ניטור GCS ואישונים כל 2 דקות בדרך", maxScore: 3 },
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
          { id: "T01-P1-A1", text: "בטיחות סצנה + מחסומי זיהום", maxScore: 3 },
          { id: "T01-P1-A2", text: "שמירת עמוד שדרה (c-spine control) מיידי", maxScore: 3 },
          { id: "T01-P1-A3", text: "A: נתיב אוויר פתוח + B: נשימה דו-צדדית", maxScore: 3 },
          { id: "T01-P1-A4", text: "C: דימום גלוי — חנק ישיר/חוסם עורקים", maxScore: 3 },
          { id: "T01-P1-A5", text: "D: GCS + E: חשיפה מלאה עם שמירת חום", maxScore: 3 },
        ],
      },
      {
        id: "T01-P2", title: "טיפול",
        actions: [
          { id: "T01-P2-A1", text: "שני עורקי IV גסים (14G) + נוזלים 1L NS/RL", maxScore: 3 },
          { id: "T01-P2-A2", text: "חמצן 15L/min", maxScore: 3 },
          { id: "T01-P2-A3", text: "Permissive hypotension: BP systolic 80-90 לטראומה חדרת", maxScore: 3 },
          { id: "T01-P2-A4", text: "הגנה על חום — שמיכה, מניעת היפותרמיה", maxScore: 3 },
          { id: "T01-P2-A5", text: "חזה: אם חשד pneumo/hemothorax — עיבוד", maxScore: 3 },
        ],
      },
      {
        id: "T01-P3", title: "פינוי",
        actions: [
          { id: "T01-P3-A1", text: "Load & Go — הזזה לאמבולנס תוך 10 דקות", maxScore: 3 },
          { id: "T01-P3-A2", text: "Pre-alert Trauma Level 1: מנגנון, ממצאים, BP, GCS", maxScore: 3 },
          { id: "T01-P3-A3", text: "ניטור מתמשך בדרך — שינוי מצב = שינוי טיפול", maxScore: 3 },
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
          { id: "T02-P1-A1", text: "זיהוי פצע פתוח מוצץ", maxScore: 3 },
          { id: "T02-P1-A2", text: "חמצן מיידי 15L/min", maxScore: 3 },
          { id: "T02-P1-A3", text: "ניטור SpO2, BP, שמיעת ריאות", maxScore: 3 },
          { id: "T02-P1-A4", text: "חשיפה מלאה — חיפוש פצעים נוספים", maxScore: 3 },
        ],
      },
      {
        id: "T02-P2", title: "טיפול",
        actions: [
          { id: "T02-P2-A1", text: "חבישה אוקלוסיבית עם valve (3-sided) על הפצע", maxScore: 3 },
          { id: "T02-P2-A2", text: "IV access גס + נוזלים", maxScore: 3 },
          { id: "T02-P2-A3", text: "מעקב אחר סימני tension (ורידי צוואר, deviated trachea)", maxScore: 3 },
          { id: "T02-P2-A4", text: "needle decompression אם מתפתח tension", maxScore: 3 },
        ],
      },
      {
        id: "T02-P3", title: "פינוי",
        actions: [
          { id: "T02-P3-A1", text: "Load & Go — פינוי מהיר לחדר מיון טראומה", maxScore: 3 },
          { id: "T02-P3-A2", text: "Pre-alert: פצע חודר חזה, BP, SpO2, טיפול", maxScore: 3 },
          { id: "T02-P3-A3", text: "ניטור SpO2 ו-BP מתמשך בדרך", maxScore: 3 },
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
          { id: "T03-P1-A1", text: "A: קול צרוד — חשד לחבלת שאיפה", maxScore: 3 },
          { id: "T03-P1-A2", text: "חמצן 100% בגוף גבוה — NRB mask", maxScore: 3 },
          { id: "T03-P1-A3", text: "חישוב TBSA בשיטת ה-9 (Rule of 9s)", maxScore: 3 },
          { id: "T03-P1-A4", text: "סיווג עומק כוויה: שני/שלישי", maxScore: 3 },
        ],
      },
      {
        id: "T03-P2", title: "טיפול",
        actions: [
          { id: "T03-P2-A1", text: "הכנה לאינטובציה — חבלת שאיפה = RSI מוקדם", maxScore: 3 },
          { id: "T03-P2-A2", text: "Parkland formula: 4ml × kg × TBSA% = נוזל 24h", maxScore: 3 },
          { id: "T03-P2-A3", text: "מחצית מהנוזל ב-8 שעות ראשונות", maxScore: 3 },
          { id: "T03-P2-A4", text: "חבישה יבשה נקייה — לא להרטיב בקרח", maxScore: 3 },
          { id: "T03-P2-A5", text: "מורפין IV לניהול כאב", maxScore: 3 },
        ],
      },
      {
        id: "T03-P3", title: "פינוי",
        actions: [
          { id: "T03-P3-A1", text: "Pre-alert מרכז כוויות: TBSA, חבלת שאיפה", maxScore: 3 },
          { id: "T03-P3-A2", text: "חימום — מניעת היפותרמיה", maxScore: 3 },
          { id: "T03-P3-A3", text: "פינוי מהיר למרכז כוויות", maxScore: 3 },
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
          { id: "T04-P1-A1", text: "הערכת גפה — צבע, חום, נאדיות, תחושה", maxScore: 3 },
          { id: "T04-P1-A2", text: "ניטור: ECG, BP, SpO2 (חשש לhyperkalemia)", maxScore: 3 },
          { id: "T04-P1-A3", text: "שני IV גסים לפני שחרור לחץ", maxScore: 3 },
          { id: "T04-P1-A4", text: "חמצן 15L/min", maxScore: 3 },
        ],
      },
      {
        id: "T04-P2", title: "טיפול",
        actions: [
          { id: "T04-P2-A1", text: "נוזלים אגרסיביים לפני ואחרי שחרור: 1-1.5L NS", maxScore: 3 },
          { id: "T04-P2-A2", text: "ניטור ECG לאיתור שינויי היפרקלמיה", maxScore: 3 },
          { id: "T04-P2-A3", text: "הימנעות מחוסם עורקים אלא אם דימום חיוני", maxScore: 3 },
          { id: "T04-P2-A4", text: "מורפין IV לכאב", maxScore: 3 },
          { id: "T04-P2-A5", text: "Sodium bicarbonate אם ECG changes", maxScore: 3 },
        ],
      },
      {
        id: "T04-P3", title: "פינוי",
        actions: [
          { id: "T04-P3-A1", text: "Pre-alert: Crush Syndrome, דופק, BP, ECG", maxScore: 3 },
          { id: "T04-P3-A2", text: "פינוי מהיר לטיפול נמרץ", maxScore: 3 },
          { id: "T04-P3-A3", text: "ניטור ECG ו-BP מתמשך", maxScore: 3 },
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
          { id: "T05-P1-A1", text: "הערכה ראשונית ABCDE", maxScore: 3 },
          { id: "T05-P1-A2", text: "זיהוי שבר ירך + הערכת ירך: עיוות, קיצור, סיבוב", maxScore: 3 },
          { id: "T05-P1-A3", text: "בדיקת דופק ותחושה דיסטלי לשבר", maxScore: 3 },
          { id: "T05-P1-A4", text: "ניטור: BP, דופק, SpO2", maxScore: 3 },
        ],
      },
      {
        id: "T05-P2", title: "טיפול",
        actions: [
          { id: "T05-P2-A1", text: "IV access גס × 2 + נוזלים 500mL", maxScore: 3 },
          { id: "T05-P2-A2", text: "Traction splint (Thomas splint) לשבר ירך", maxScore: 3 },
          { id: "T05-P2-A3", text: "מורפין IV 5-10mg לניהול כאב", maxScore: 3 },
          { id: "T05-P2-A4", text: "ניטור דופק דיסטלי לאחר ספליינט", maxScore: 3 },
        ],
      },
      {
        id: "T05-P3", title: "פינוי",
        actions: [
          { id: "T05-P3-A1", text: "פינוי לחדר מיון", maxScore: 3 },
          { id: "T05-P3-A2", text: "ניטור BP ודופק בדרך (דימום פנימי)", maxScore: 3 },
          { id: "T05-P3-A3", text: "Pre-alert: שבר ירך, הלם קל, גיל, מנגנון", maxScore: 3 },
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
          { id: "P01-P1-A1", text: "בדיקת תגובה לתינוק: שמיעה, נגיעה", maxScore: 3 },
          { id: "P01-P1-A2", text: "בדיקת נשימה ודופק (brachial artery)", maxScore: 3 },
          { id: "P01-P1-A3", text: "פתיחת נתיב אוויר: head-tilt/chin-lift עדין", maxScore: 3 },
          { id: "P01-P1-A4", text: "בדיקת חסימה גלויה בגרון", maxScore: 3 },
        ],
      },
      {
        id: "P01-P2", title: "CPR ו-PALS",
        actions: [
          { id: "P01-P2-A1", text: "התחלת CPR 30:2, לחיצות 4cm, 100-120/min", maxScore: 3 },
          { id: "P01-P2-A2", text: "נשיפות BVM תינוק — נפח מינימלי, SpO2 monitor", maxScore: 3 },
          { id: "P01-P2-A3", text: "חיבור AED/פדלי ילדים אם >1 שנה, adults אם >8", maxScore: 3 },
          { id: "P01-P2-A4", text: "IO access אם לא ורידי בזמן", maxScore: 3 },
          { id: "P01-P2-A5", text: "אדרנלין 0.01mg/kg IV/IO", maxScore: 3 },
        ],
      },
      {
        id: "P01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "P01-P3-A1", text: "ROSC — בדיקת דופק brachial", maxScore: 3 },
          { id: "P01-P3-A2", text: "Pre-alert: גיל, מנגנון, CPR duration, ROSC/לא", maxScore: 3 },
          { id: "P01-P3-A3", text: "פינוי מהיר לחדר מיון ילדים", maxScore: 3 },
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
          { id: "P02-P1-A1", text: "בטיחות — הגנה על ראש ילד", maxScore: 3 },
          { id: "P02-P1-A2", text: "ניטור SpO2, דופק, תיעוד משך עווית", maxScore: 3 },
          { id: "P02-P1-A3", text: "מדידת חום", maxScore: 3 },
          { id: "P02-P1-A4", text: "בדיקת גלוקוז", maxScore: 3 },
        ],
      },
      {
        id: "P02-P2", title: "טיפול",
        actions: [
          { id: "P02-P2-A1", text: "מידזולם אף/IM 0.2mg/kg אם >5 דקות", maxScore: 3 },
          { id: "P02-P2-A2", text: "חמצן לאחר הפסקת עווית", maxScore: 3 },
          { id: "P02-P2-A3", text: "הפחתת חום: פשיטת לבוש, מניחים במקום קריר", maxScore: 3 },
          { id: "P02-P2-A4", text: "הרגעת ההורים + הסבר מקצועי", maxScore: 3 },
        ],
      },
      {
        id: "P02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "P02-P3-A1", text: "Recovery position לאחר הפסקת עווית", maxScore: 3 },
          { id: "P02-P3-A2", text: "ניטור RR + SpO2 לאחר מידזולם", maxScore: 3 },
          { id: "P02-P3-A3", text: "פינוי לחדר מיון ילדים לבדיקה ראשונית", maxScore: 3 },
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
          { id: "P03-P1-A1", text: "GCS ילדי + AVPU", maxScore: 3 },
          { id: "P03-P1-A2", text: "ניטור SpO2, BP, דופק", maxScore: 3 },
          { id: "P03-P1-A3", text: "שמירת c-spine (כולר ילדי)", maxScore: 3 },
          { id: "P03-P1-A4", text: "בחינת אישונים ותגובה לאור", maxScore: 3 },
        ],
      },
      {
        id: "P03-P2", title: "טיפול",
        actions: [
          { id: "P03-P2-A1", text: "חמצן אם SpO2<95%", maxScore: 3 },
          { id: "P03-P2-A2", text: "IV access אם GCS<13", maxScore: 3 },
          { id: "P03-P2-A3", text: "לא ניתן מורפין לחבלת ראש!", maxScore: 3 },
          { id: "P03-P2-A4", text: "שמיכה + מיקום נכון", maxScore: 3 },
        ],
      },
      {
        id: "P03-P3", title: "פינוי",
        actions: [
          { id: "P03-P3-A1", text: "Pre-alert ילד: גיל, מנגנון, GCS, אישונים", maxScore: 3 },
          { id: "P03-P03-A2", text: "פינוי לחדר מיון ילדים עם טראומה מוחית", maxScore: 3 },
          { id: "P03-P3-A3", text: "ניטור GCS כל 2 דקות — אזהרת הרניאציה", maxScore: 3 },
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
          { id: "X01-P1-A1", text: "בטיחות — מחסומי זיהום מלאים (כפפות כפולות, מסכה)", maxScore: 3 },
          { id: "X01-P1-A2", text: "זיהוי SLUDGE: ריר, שתן, עיכול, דמעות, GI, הזעה", maxScore: 3 },
          { id: "X01-P1-A3", text: "ניטור: SpO2, ECG, דופק, BP", maxScore: 3 },
          { id: "X01-P1-A4", text: "פתיחת נתיב אוויר + שאיבת הפרשות", maxScore: 3 },
        ],
      },
      {
        id: "X01-P2", title: "טיפול",
        actions: [
          { id: "X01-P2-A1", text: "אטרופין 2-4mg IV כל 5-10 דקות עד יובש פה", maxScore: 3 },
          { id: "X01-P2-A2", text: "פרלידוקסים (2-PAM) 1-2g IV לביטול ACh", maxScore: 3 },
          { id: "X01-P2-A3", text: "מידזולם לפרפורי שרירים", maxScore: 3 },
          { id: "X01-P2-A4", text: "אינטובציה RSI אם אין שיפור נשימתי", maxScore: 3 },
        ],
      },
      {
        id: "X01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "X01-P3-A1", text: "ניטור הפרשות לאחר אטרופין", maxScore: 3 },
          { id: "X01-P3-A2", text: "Pre-alert: הרעלה + שם חומר אם ידוע", maxScore: 3 },
          { id: "X01-P3-A3", text: "פינוי לטיפול נמרץ + הודעה לרעלנולוגיה", maxScore: 3 },
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
          { id: "X02-P1-A1", text: "בטיחות + בדיקת כלים חדים בסצנה", maxScore: 3 },
          { id: "X02-P1-A2", text: "זיהוי הטריאדה: מיוזה, נשימה דחוקה, הכרה ירודה", maxScore: 3 },
          { id: "X02-P1-A3", text: "פתיחת נתיב אוויר + BVM rescue breaths", maxScore: 3 },
          { id: "X02-P1-A4", text: "ניטור SpO2, RR, GCS", maxScore: 3 },
        ],
      },
      {
        id: "X02-P2", title: "טיפול",
        actions: [
          { id: "X02-P2-A1", text: "נלוקסון (Narcan) 0.4-2mg IV/IM/IN", maxScore: 3 },
          { id: "X02-P2-A2", text: "חזרה על נלוקסון כל 2-3 דקות אם אין תגובה (מקס 10mg)", maxScore: 3 },
          { id: "X02-P2-A3", text: "חמצן 15L/min או BVM", maxScore: 3 },
          { id: "X02-P2-A4", text: "גישה ורידית", maxScore: 3 },
          { id: "X02-P2-A5", text: "ניטור לחזרת עייפות נשימתית (נלוקסון קצר מאופיואידים)", maxScore: 3 },
        ],
      },
      {
        id: "X02-P3", title: "ניטור ופינוי",
        actions: [
          { id: "X02-P3-A1", text: "ניטור RR ו-SpO2 כל 2 דקות", maxScore: 3 },
          { id: "X02-P3-A2", text: "Pre-alert: OD אופיואידים, נלוקסון, מצב", maxScore: 3 },
          { id: "X02-P3-A3", text: "פינוי לחדר מיון — לא לשחרר לאחר תגובה לנלוקסון!", maxScore: 3 },
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
          { id: "O01-P1-A1", text: "הגנה מפני נזק בעווית — שמירת מיקום צד שמאל", maxScore: 3 },
          { id: "O01-P1-A2", text: "תיעוד BP, SpO2, משך עווית", maxScore: 3 },
          { id: "O01-P1-A3", text: "הערכת עובר: דופק עוברי אם זמין", maxScore: 3 },
          { id: "O01-P1-A4", text: "חמצן 15L/min", maxScore: 3 },
        ],
      },
      {
        id: "O01-P2", title: "טיפול",
        actions: [
          { id: "O01-P2-A1", text: "מגנזיום סולפט 4g IV על פני 10-15 דקות (FIRST LINE)", maxScore: 3 },
          { id: "O01-P2-A2", text: "לא ניתן דיאזפאם לאקלמפסיה — מגנזיום!", maxScore: 3 },
          { id: "O01-P2-A3", text: "לאברטלול (Labetalol) 20mg IV לבקרת BP אם >160/110", maxScore: 3 },
          { id: "O01-P2-A4", text: "גישה ורידית × 2", maxScore: 3 },
          { id: "O01-P2-A5", text: "מיקום שמאל lateral decubitus להפחתת לחץ על IVC", maxScore: 3 },
        ],
      },
      {
        id: "O01-P3", title: "ניטור ופינוי",
        actions: [
          { id: "O01-P3-A1", text: "ניטור BP כל 2-5 דקות, SpO2, RR", maxScore: 3 },
          { id: "O01-P3-A2", text: "הכנה ללידה חירום בשטח אם צורך", maxScore: 3 },
          { id: "O01-P3-A3", text: "Pre-alert: הריון שבוע 34, אקלמפסיה, BP, מגנזיום", maxScore: 3 },
          { id: "O01-P3-A4", text: "פינוי דחוף לחדר לידה/גינקולוגיה", maxScore: 3 },
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
  {
    id: "C06", code: "C06", title: "טכיקרדיה על-חדרית (SVT)", badge: "⚡", category: "cardiac",
    story: "גבר בן 34 מתלונן על דפיקות לב מהירות שהחלו פתאום לפני 20 דקות. הוא חש סחרחורת קלה אך ללא כאב חזה. אין היסטוריה קרדיאלית ידועה.",
    vitals: { pulse: "190 סדיר", bp: "100/70", spo2: "97%", rr: "20" },
    phases: [
      { id: "C06-P1", title: "הערכה ראשונית", actions: [
        { id: "C06-P1-A1", text: "הערכת ABCDE ותלונת חולה", maxScore: 3 },
        { id: "C06-P1-A2", text: "מדידת סימנים חיוניים מלאה", maxScore: 3 },
        { id: "C06-P1-A3", text: "ECG 12 ערוצים – זיהוי SVT", maxScore: 3 },
        { id: "C06-P1-A4", text: "גישה ורידית והכנת אדנוזין", maxScore: 3 },
      ]},
      { id: "C06-P2", title: "טיפול", actions: [
        { id: "C06-P2-A1", text: "תמרון ואגאלי (Valsalva) – ניסיון ראשון", maxScore: 3 },
        { id: "C06-P2-A2", text: "אדנוזין 6mg IV בולוס מהיר אם תמרון נכשל", maxScore: 3 },
        { id: "C06-P2-A3", text: "אדנוזין 12mg חוזר אם אין תגובה", maxScore: 3 },
        { id: "C06-P2-A4", text: "ניטור ריתמי לאחר מתן – תיעוד המרה", maxScore: 3 },
        { id: "C06-P2-A5", text: "הכנה לקרדיוברסיה מסונכרנת אם אי-יציבות המודינמית", maxScore: 3 },
      ]},
      { id: "C06-P3", title: "פינוי", actions: [
        { id: "C06-P3-A1", text: "ניטור מתמשך ECG בנסיעה", maxScore: 3 },
        { id: "C06-P3-A2", text: "Pre-alert לחדר מיון – SVT, גיל, תגובה לטיפול", maxScore: 3 },
        { id: "C06-P3-A3", text: "תיעוד כל מנות אדנוזין והמרות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן אדנוזין ללא גישה ורידית בטוחה", "לא ניסה תמרון ואגאלי לפני תרופה", "לא זיהה SVT ב-ECG", "עיכוב קרדיוברסיה בחולה אי-יציב"],
    impression: ["SVT", "אדנוזין", "Valsalva", "קרדיוברסיה"],
  },
  {
    id: "C07", code: "C07", title: "טכיקרדיה חדרית (VT) עם דופק", badge: "💥", category: "cardiac",
    story: "אישה בת 62 עם היסטוריה של אוטם שריר הלב לפני 3 שנים מתלוננת על דפיקות לב ואי-נוחות בחזה. היא עייפה ומיוזעת. לחץ דם נמוך.",
    vitals: { pulse: "160 רחב לא סדיר", bp: "80/50", spo2: "93%", rr: "22" },
    phases: [
      { id: "C07-P1", title: "הערכה ראשונית", actions: [
        { id: "C07-P1-A1", text: "הערכת ABCDE – זיהוי אי-יציבות המודינמית", maxScore: 3 },
        { id: "C07-P1-A2", text: "ECG 12 ערוצים – זיהוי VT קומפלקס רחב", maxScore: 3 },
        { id: "C07-P1-A3", text: "גישה ורידית, O2 במסכה, ניטור", maxScore: 3 },
        { id: "C07-P1-A4", text: "הכנת ציוד לקרדיוברסיה", maxScore: 3 },
      ]},
      { id: "C07-P2", title: "טיפול", actions: [
        { id: "C07-P2-A1", text: "קרדיוברסיה מסונכרנת 100J – חולה עם דופק ואי-יציב", maxScore: 3 },
        { id: "C07-P2-A2", text: "הרגעה/sedation לפני קרדיוברסיה (מידזולאם)", maxScore: 3 },
        { id: "C07-P2-A3", text: "בדיקת ריתמי לאחר הלם – תיעוד", maxScore: 3 },
        { id: "C07-P2-A4", text: "אמיודרון 300mg IV אם הלם נכשל", maxScore: 3 },
      ]},
      { id: "C07-P3", title: "פינוי", actions: [
        { id: "C07-P3-A1", text: "ניטור ECG מתמשך", maxScore: 3 },
        { id: "C07-P3-A2", text: "Pre-alert – VT, היסטוריה קרדיאלית, לחץ דם, טיפול", maxScore: 3 },
        { id: "C07-P3-A3", text: "מוכנות לאוסצילציה/CPR בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["ביצוע קרדיוברסיה לא מסונכרנת בחולה עם דופק", "לא ביצע sedation לפני הלם", "עיכוב טיפול", "לא זיהה VT"],
    impression: ["VT", "קרדיוברסיה", "אמיודרון", "אי-יציבות"],
  },
  {
    id: "C08", code: "C08", title: "אי-ספיקת לב חריפה – בצקת ריאות", badge: "🫁", category: "cardiac",
    story: "גבר בן 75 עם אי-ספיקת לב כרונית מתעורר מהשינה עם קוצר נשימה קשה. הוא יושב זקוף ומסרב לשכב. נשמעים גרגורים בשמיעה.",
    vitals: { pulse: "110 סדיר", bp: "170/100", spo2: "84%", rr: "32" },
    phases: [
      { id: "C08-P1", title: "הערכה ראשונית", actions: [
        { id: "C08-P1-A1", text: "מיקום חולה ישיבה זקופה – legs down", maxScore: 3 },
        { id: "C08-P1-A2", text: "O2 במסכה high-flow, שקילת CPAP", maxScore: 3 },
        { id: "C08-P1-A3", text: "ניטור SpO2, ECG, BP", maxScore: 3 },
        { id: "C08-P1-A4", text: "גישה ורידית", maxScore: 3 },
      ]},
      { id: "C08-P2", title: "טיפול", actions: [
        { id: "C08-P2-A1", text: "ניטרוגליצרין SL אם BP>100 ממ\"כ", maxScore: 3 },
        { id: "C08-P2-A2", text: "פורוסמיד 40mg IV", maxScore: 3 },
        { id: "C08-P2-A3", text: "CPAP 5-10 cmH2O אם SpO2<90% בO2 גבוה", maxScore: 3 },
        { id: "C08-P2-A4", text: "הכנה לאינטובציה אם אין שיפור", maxScore: 3 },
        { id: "C08-P2-A5", text: "ניטור תגובה לטיפול – SpO2, RR, BP", maxScore: 3 },
      ]},
      { id: "C08-P3", title: "פינוי", actions: [
        { id: "C08-P3-A1", text: "פינוי בישיבה – לא שוכב", maxScore: 3 },
        { id: "C08-P3-A2", text: "המשך CPAP בנסיעה", maxScore: 3 },
        { id: "C08-P3-A3", text: "Pre-alert – בצקת ריאות, SpO2, טיפול", maxScore: 3 },
      ]},
    ],
    failCriteria: ["השכבת חולה", "מתן נוזלים IV", "לא מתן ניטרו בBP גבוה", "עיכוב CPAP"],
    impression: ["בצקת ריאות", "CPAP", "פורוסמיד", "ניטרוגליצרין"],
  },
  {
    id: "C09", code: "C09", title: "הלם קרדיוגני", badge: "💔", category: "cardiac",
    story: "אישה בת 68 עם כאב חזה מזה שעתיים. כעת מבולבלת, חיוורת ומיוזעת. לחץ דם נמוך מאד ודופק חלש.",
    vitals: { pulse: "115 חלש", bp: "70/40", spo2: "90%", rr: "28" },
    phases: [
      { id: "C09-P1", title: "הערכה ראשונית", actions: [
        { id: "C09-P1-A1", text: "הערכת הלם – ABCDE, skin, mentation", maxScore: 3 },
        { id: "C09-P1-A2", text: "O2 high-flow, גישה ורידית x2", maxScore: 3 },
        { id: "C09-P1-A3", text: "ECG 12 ערוצים – חיפוש STEMI", maxScore: 3 },
        { id: "C09-P1-A4", text: "ניטור מלא – ECG, SpO2, BP", maxScore: 3 },
      ]},
      { id: "C09-P2", title: "טיפול", actions: [
        { id: "C09-P2-A1", text: "אספירין 300mg PO אם STEMI/ACS", maxScore: 3 },
        { id: "C09-P2-A2", text: "נוזלים 250ml bolus זהיר אם ללא סימני עומס", maxScore: 3 },
        { id: "C09-P2-A3", text: "נורפינפרין/דופמין IV אם BP<70 ממ\"כ", maxScore: 3 },
        { id: "C09-P2-A4", text: "הימנע מניטרו ומאחרי עומס גדולים", maxScore: 3 },
      ]},
      { id: "C09-P3", title: "פינוי", actions: [
        { id: "C09-P3-A1", text: "Pre-alert קאת' מיידי – STEMI הלם קרדיוגני", maxScore: 3 },
        { id: "C09-P3-A2", text: "פינוי דחוף למרכז קאת' פעיל", maxScore: 3 },
        { id: "C09-P3-A3", text: "ניטור BP כל דקה בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן ניטרוגליצרין בהלם", "עומס נוזלים מוגזם", "עיכוב Pre-alert קאת'", "לא זיהה STEMI"],
    impression: ["הלם קרדיוגני", "STEMI", "קאת'", "וזופרסורים"],
  },
  {
    id: "C10", code: "C10", title: "פריקרדיטיס חריפה", badge: "🩺", category: "cardiac",
    story: "גבר בן 28 מתלונן על כאב חזה חד שמוחמר בשכיבה ומוקל בישיבה קדימה. היה לו שפעת לפני שבוע. חום קל.",
    vitals: { pulse: "95 סדיר", bp: "120/75", spo2: "98%", rr: "18", temp: "37.8°C" },
    phases: [
      { id: "C10-P1", title: "הערכה ראשונית", actions: [
        { id: "C10-P1-A1", text: "אנמנזה מלאה – אופי כאב, תנוחה, מחלה קודמת", maxScore: 3 },
        { id: "C10-P1-A2", text: "ECG 12 ערוצים – חיפוש ST elevation מפושט", maxScore: 3 },
        { id: "C10-P1-A3", text: "הבחנה מ-STEMI – saddle shape ST, PR depression", maxScore: 3 },
        { id: "C10-P1-A4", text: "האזנה – friction rub", maxScore: 3 },
      ]},
      { id: "C10-P2", title: "טיפול", actions: [
        { id: "C10-P2-A1", text: "מיקום נוח – ישיבה קדימה", maxScore: 3 },
        { id: "C10-P2-A2", text: "NSAID (איבופרופן) לאנלגזיה", maxScore: 3 },
        { id: "C10-P2-A3", text: "ניטור לסימני טמפונדה – BP, JVP, קולות לב", maxScore: 3 },
        { id: "C10-P2-A4", text: "O2 אם SpO2 ירוד", maxScore: 3 },
      ]},
      { id: "C10-P3", title: "פינוי", actions: [
        { id: "C10-P3-A1", text: "פינוי לאבחון – אקו לב, CRP, טרופונין", maxScore: 3 },
        { id: "C10-P3-A2", text: "Pre-alert – חשד פריקרדיטיס, ECG, חום", maxScore: 3 },
        { id: "C10-P3-A3", text: "ניטור לסימני דחיסת לב", maxScore: 3 },
      ]},
    ],
    failCriteria: ["טיפול כ-STEMI עם lytics", "לא ניטר לסימני טמפונדה", "לא הבחין מ-STEMI"],
    impression: ["פריקרדיטיס", "friction rub", "ST saddle", "טמפונדה"],
  },
  {
    id: "C11", code: "C11", title: "טמפונדה לבבית", badge: "🫀", category: "cardiac",
    story: "גבר בן 55 עם סרטן ריאות ידוע מגיע עם קוצר נשימה הולך וגובר, כאב חזה וחולשה. הוא חיוור ומיוזע. קולות לב מרוחקים.",
    vitals: { pulse: "120 חלש", bp: "90/80", spo2: "92%", rr: "26" },
    phases: [
      { id: "C11-P1", title: "הערכה ראשונית", actions: [
        { id: "C11-P1-A1", text: "זיהוי Beck's triad: BP נמוך, JVP גבוה, קולות מרוחקים", maxScore: 3 },
        { id: "C11-P1-A2", text: "חיפוש pulsus paradoxus (ירידת BP>10 בשאיפה)", maxScore: 3 },
        { id: "C11-P1-A3", text: "ECG – low voltage, electrical alternans", maxScore: 3 },
        { id: "C11-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "C11-P2", title: "טיפול", actions: [
        { id: "C11-P2-A1", text: "נוזלים IV זהיר לתמיכה המודינמית", maxScore: 3 },
        { id: "C11-P2-A2", text: "הימנע מBETA blocker/ניטרו", maxScore: 3 },
        { id: "C11-P2-A3", text: "פריקרדיוצנטזה – אם הכשרה ויש אולטרסאונד", maxScore: 3 },
        { id: "C11-P2-A4", text: "הכנה לניקוז דחוף בבית חולים", maxScore: 3 },
      ]},
      { id: "C11-P3", title: "פינוי", actions: [
        { id: "C11-P3-A1", text: "Pre-alert – חשד טמפונדה, Beck's triad, ממאירות", maxScore: 3 },
        { id: "C11-P3-A2", text: "פינוי דחוף לכירורגיה/קרדיולוגיה", maxScore: 3 },
        { id: "C11-P3-A3", text: "ניטור BP כל דקה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן ניטרו/diuretics", "עיכוב פינוי", "לא זיהה Beck's triad", "עומס נוזלים מוגזם"],
    impression: ["טמפונדה", "Beck's triad", "pulsus paradoxus", "פריקרדיוצנטזה"],
  },
  {
    id: "C12", code: "C12", title: "משבר יתר לחץ דם", badge: "🔴", category: "cardiac",
    story: "אישה בת 58 עם יתר לחץ דם שאינה נוטלת תרופות מגיעה עם כאב ראש עז, ראיה מטושטשת ובחילה. ממצאי עצב אופטי בבדיקה.",
    vitals: { pulse: "88 סדיר", bp: "220/130", spo2: "97%", rr: "18" },
    phases: [
      { id: "C12-P1", title: "הערכה ראשונית", actions: [
        { id: "C12-P1-A1", text: "אנמנזה – תרופות, משך תסמינים, שינוי ראיה", maxScore: 3 },
        { id: "C12-P1-A2", text: "הערכה נוירולוגית – FAST, level of consciousness", maxScore: 3 },
        { id: "C12-P1-A3", text: "מדידת BP בשתי ידיים", maxScore: 3 },
        { id: "C12-P1-A4", text: "ECG, גישה ורידית, ניטור מלא", maxScore: 3 },
      ]},
      { id: "C12-P2", title: "טיפול", actions: [
        { id: "C12-P2-A1", text: "הורדת BP הדרגתית – לא מהירה (מטרה 160/100 תוך שעה)", maxScore: 3 },
        { id: "C12-P2-A2", text: "ניטרוגליצרין SL/IV זהיר", maxScore: 3 },
        { id: "C12-P2-A3", text: "הימנע מהורדה חדה – סיכון איסכמיה מוחית", maxScore: 3 },
        { id: "C12-P2-A4", text: "הרגעת חולה, סביבה שקטה", maxScore: 3 },
      ]},
      { id: "C12-P3", title: "פינוי", actions: [
        { id: "C12-P3-A1", text: "Pre-alert – hypertensive emergency, נוירולוגיה", maxScore: 3 },
        { id: "C12-P3-A2", text: "פינוי לCT ראש ואבחון", maxScore: 3 },
        { id: "C12-P3-A3", text: "ניטור BP ותסמינים נוירולוגיים", maxScore: 3 },
      ]},
    ],
    failCriteria: ["הורדת BP מהירה מדי", "לא הערכה נוירולוגית", "מתן תרופה שגויה"],
    impression: ["hypertensive emergency", "papilledema", "הורדה הדרגתית", "CT ראש"],
  },
  {
    id: "C13", code: "C13", title: "ניתוק אאורטה חריף", badge: "🩸", category: "cardiac",
    story: "גבר בן 52 מתלונן על כאב חזה קורע המקרין לגב, שהחל פתאום. יש הפרש לחץ דם בין הידיים. הוא חיוור ומיוזע.",
    vitals: { pulse: "105 חלש", bp: "יד ימין: 160/90, יד שמאל: 110/70", spo2: "96%", rr: "22" },
    phases: [
      { id: "C13-P1", title: "הערכה ראשונית", actions: [
        { id: "C13-P1-A1", text: "אנמנזה – אופי כאב קורע, הקרנה לגב", maxScore: 3 },
        { id: "C13-P1-A2", text: "מדידת BP בשתי ידיים – חיפוש הפרש >20 ממ\"כ", maxScore: 3 },
        { id: "C13-P1-A3", text: "ECG – שלילת STEMI", maxScore: 3 },
        { id: "C13-P1-A4", text: "גישה ורידית, O2, ניטור", maxScore: 3 },
      ]},
      { id: "C13-P2", title: "טיפול", actions: [
        { id: "C13-P2-A1", text: "שמירת BP סיסטולי 100-120 – לא גבוה", maxScore: 3 },
        { id: "C13-P2-A2", text: "הימנע ממרחיבי כלים/נוזלים מוגזמים", maxScore: 3 },
        { id: "C13-P2-A3", text: "אנלגזיה – מורפין IV לכאב", maxScore: 3 },
        { id: "C13-P2-A4", text: "הימנע ממתן lytics/anticoagulants", maxScore: 3 },
      ]},
      { id: "C13-P3", title: "פינוי", actions: [
        { id: "C13-P3-A1", text: "Pre-alert – חשד ניתוק אאורטה, CT angio דחוף", maxScore: 3 },
        { id: "C13-P3-A2", text: "פינוי לבית חולים עם כירורגיה וסקולרית", maxScore: 3 },
        { id: "C13-P3-A3", text: "ניטור BP ותסמינים נוירולוגיים", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן lytics בחשד ניתוק אאורטה", "הורדת BP אגרסיבית מדי", "לא מדד BP בשתי ידיים", "עיכוב פינוי"],
    impression: ["ניתוק אאורטה", "כאב קורע", "הפרש BP", "CT angio"],
  },
  {
    id: "C14", code: "C14", title: "ברדיקרדיה סימפטומטית", badge: "🐢", category: "cardiac",
    story: "גבר בן 70 עם דופק איטי מאד, כאב ראש ועייפות. הוא נוטל מטופרולול. מדי פעם מאבד הכרה לשניות.",
    vitals: { pulse: "38 סדיר", bp: "85/55", spo2: "95%", rr: "16" },
    phases: [
      { id: "C14-P1", title: "הערכה ראשונית", actions: [
        { id: "C14-P1-A1", text: "הערכת ABCDE, תרופות, סימפטומים", maxScore: 3 },
        { id: "C14-P1-A2", text: "ECG 12 ערוצים – זיהוי בלוק AV/sick sinus", maxScore: 3 },
        { id: "C14-P1-A3", text: "גישה ורידית, ניטור מלא", maxScore: 3 },
        { id: "C14-P1-A4", text: "O2 אם SpO2 ירוד", maxScore: 3 },
      ]},
      { id: "C14-P2", title: "טיפול", actions: [
        { id: "C14-P2-A1", text: "אטרופין 0.5mg IV – מנה ראשונה", maxScore: 3 },
        { id: "C14-P2-A2", text: "אטרופין 0.5mg חוזר כל 3-5 דקות עד 3mg", maxScore: 3 },
        { id: "C14-P2-A3", text: "קצב חיצוני transcutaneous אם אטרופין נכשל", maxScore: 3 },
        { id: "C14-P2-A4", text: "דופמין/אדרנלין אם קצב חיצוני לא זמין", maxScore: 3 },
        { id: "C14-P2-A5", text: "הכנה ל-transvenous pacing בית חולים", maxScore: 3 },
      ]},
      { id: "C14-P3", title: "פינוי", actions: [
        { id: "C14-P3-A1", text: "המשך קצב חיצוני בנסיעה אם נדרש", maxScore: 3 },
        { id: "C14-P3-A2", text: "Pre-alert – ברדיקרדיה סימפטומטית, ECG, טיפול", maxScore: 3 },
        { id: "C14-P3-A3", text: "ניטור BP ודופק ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא ניסה אטרופין לפני קצב חיצוני", "מינון אטרופין נמוך מדי (<0.5mg)", "לא זיהה חסם AV", "עיכוב קצב חיצוני בחולה אי-יציב"],
    impression: ["ברדיקרדיה", "אטרופין", "קצב חיצוני", "חסם AV"],
  },
  {
    id: "C15", code: "C15", title: "כשל קוצב לב", badge: "🔋", category: "cardiac",
    story: "אישה בת 78 עם קוצב לב מזה 10 שנים מגיעה עם סחרחורת וסינקופה חוזרת. הדופק איטי מאד ולא מסודר.",
    vitals: { pulse: "35 לא סדיר", bp: "80/50", spo2: "94%", rr: "20" },
    phases: [
      { id: "C15-P1", title: "הערכה ראשונית", actions: [
        { id: "C15-P1-A1", text: "אנמנזה – סוג קוצב, מתי הושתל, תסמינים", maxScore: 3 },
        { id: "C15-P1-A2", text: "ECG – חיפוש spikes קוצב, capture failure", maxScore: 3 },
        { id: "C15-P1-A3", text: "גישה ורידית, O2, ניטור", maxScore: 3 },
        { id: "C15-P1-A4", text: "הכנת ציוד קצב חיצוני", maxScore: 3 },
      ]},
      { id: "C15-P2", title: "טיפול", actions: [
        { id: "C15-P2-A1", text: "קצב חיצוני transcutaneous – גיבוי לקוצב כושל", maxScore: 3 },
        { id: "C15-P2-A2", text: "אטרופין 0.5mg IV כגשר", maxScore: 3 },
        { id: "C15-P2-A3", text: "הימנע ממגנט על קוצב ללא הנחייה", maxScore: 3 },
        { id: "C15-P2-A4", text: "ניטור יעילות קצב חיצוני – capture, BP", maxScore: 3 },
      ]},
      { id: "C15-P3", title: "פינוי", actions: [
        { id: "C15-P3-A1", text: "Pre-alert – כשל קוצב, ברדיקרדיה, קצב חיצוני פעיל", maxScore: 3 },
        { id: "C15-P3-A2", text: "פינוי לקרדיולוגיה/electrophysiology", maxScore: 3 },
        { id: "C15-P3-A3", text: "ניטור ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא זיהה כשל קוצב ב-ECG", "עיכוב קצב חיצוני", "שימוש במגנט שגוי"],
    impression: ["כשל קוצב", "capture failure", "קצב חיצוני", "electrophysiology"],
  },
  {
    id: "C16", code: "C16", title: "NSTEMI", badge: "❤️", category: "cardiac",
    story: "אישה בת 65 עם סוכרת מתלוננת על עייפות, בחילה וקוצר נשימה קל ללא כאב חזה אופייני. ECG מראה שינויי ST.",
    vitals: { pulse: "88 סדיר", bp: "140/85", spo2: "96%", rr: "20" },
    phases: [
      { id: "C16-P1", title: "הערכה ראשונית", actions: [
        { id: "C16-P1-A1", text: "אנמנזה – equivalent anginal (סוכרת, נשים)", maxScore: 3 },
        { id: "C16-P1-A2", text: "ECG 12 ערוצים – ST depression, T inversion", maxScore: 3 },
        { id: "C16-P1-A3", text: "גישה ורידית, ניטור, O2 אם SpO2<94%", maxScore: 3 },
        { id: "C16-P1-A4", text: "גלוקומטר – שלילת היפוגליקמיה", maxScore: 3 },
      ]},
      { id: "C16-P2", title: "טיפול", actions: [
        { id: "C16-P2-A1", text: "אספירין 300mg PO ללעיסה", maxScore: 3 },
        { id: "C16-P2-A2", text: "ניטרוגליצרין SL אם BP>100", maxScore: 3 },
        { id: "C16-P2-A3", text: "מורפין IV לכאב/אי-נוחות", maxScore: 3 },
        { id: "C16-P2-A4", text: "ניטור ECG ברציפות – זיהוי הידרדרות ל-STEMI", maxScore: 3 },
      ]},
      { id: "C16-P3", title: "פינוי", actions: [
        { id: "C16-P3-A1", text: "Pre-alert – NSTEMI, ECG, גיל, סוכרת", maxScore: 3 },
        { id: "C16-P3-A2", text: "פינוי לחדר כלילי להמשך טיפול", maxScore: 3 },
        { id: "C16-P3-A3", text: "מוכנות לAED/CPR", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא ניתן אספירין", "לא זיהה NSTEMI בחולה ללא כאב אופייני", "עיכוב פינוי"],
    impression: ["NSTEMI", "equivalent", "אספירין", "ניטרו"],
  },
  {
    id: "C17", code: "C17", title: "אוטם חדר ימין", badge: "💛", category: "cardiac",
    story: "גבר בן 60 עם כאב חזה ו-ST elevation בV1-V4 וב-lead III. לחץ דם נמוך למרות ראות צלולות. גרגורים אינם נשמעים.",
    vitals: { pulse: "72 סדיר", bp: "90/60", spo2: "94%", rr: "18" },
    phases: [
      { id: "C17-P1", title: "הערכה ראשונית", actions: [
        { id: "C17-P1-A1", text: "ECG 12 ערוצים + ערוצים ימניים V3R-V4R", maxScore: 3 },
        { id: "C17-P1-A2", text: "זיהוי תבנית – ST elevation ימני, ללא בצקת ריאות", maxScore: 3 },
        { id: "C17-P1-A3", text: "גישה ורידית x2, ניטור מלא", maxScore: 3 },
        { id: "C17-P1-A4", text: "הערכת JVP, צליל לב ימין", maxScore: 3 },
      ]},
      { id: "C17-P2", title: "טיפול", actions: [
        { id: "C17-P2-A1", text: "נוזלים IV 500ml bolus – חדר ימין תלוי preload", maxScore: 3 },
        { id: "C17-P2-A2", text: "הימנע מניטרו/diuretics – מסוכן!", maxScore: 3 },
        { id: "C17-P2-A3", text: "אספירין 300mg PO", maxScore: 3 },
        { id: "C17-P2-A4", text: "ניטור תגובה לנוזלים – BP, mentation", maxScore: 3 },
      ]},
      { id: "C17-P3", title: "פינוי", actions: [
        { id: "C17-P3-A1", text: "Pre-alert – STEMI חדר ימין, BP, נוזלים", maxScore: 3 },
        { id: "C17-P3-A2", text: "פינוי דחוף לקאת'", maxScore: 3 },
        { id: "C17-P3-A3", text: "ניטור BP ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן ניטרוגליצרין באוטם חדר ימין", "לא ביצע ערוצים ימניים", "לא מתן נוזלים", "עיכוב Pre-alert קאת'"],
    impression: ["אוטם חדר ימין", "נוזלים", "ללא ניטרו", "ערוצים ימניים"],
  },
  {
    id: "C18", code: "C18", title: "ROSC לאחר דום לב", badge: "🔄", category: "cardiac",
    story: "גבר בן 50 שעבר VF ו-CPR מוצלח על ידי עוברי אורח. בהגעת המד\"א יש דופק ספונטני. הוא אינו מגיב.",
    vitals: { pulse: "90 לא סדיר", bp: "100/60", spo2: "91%", rr: "אינו נושם ספונטנית" },
    phases: [
      { id: "C18-P1", title: "הערכה ראשונית", actions: [
        { id: "C18-P1-A1", text: "אישור ROSC – דופק, BP, ריתמי", maxScore: 3 },
        { id: "C18-P1-A2", text: "ניהול נתיב אוויר – אינטובציה/SGA", maxScore: 3 },
        { id: "C18-P1-A3", text: "SpO2 מטרה 94-98%, EtCO2 35-45", maxScore: 3 },
        { id: "C18-P1-A4", text: "ECG 12 ערוצים – חיפוש STEMI", maxScore: 3 },
      ]},
      { id: "C18-P2", title: "טיפול post-ROSC", actions: [
        { id: "C18-P2-A1", text: "מניעת היפוקסיה והיפרוקסיה – ניהול O2 מדויק", maxScore: 3 },
        { id: "C18-P2-A2", text: "BP מטרה >100 systolic – נוזלים/וזופרסורים", maxScore: 3 },
        { id: "C18-P2-A3", text: "גלוקוז – שמירה 6-10 mmol/L", maxScore: 3 },
        { id: "C18-P2-A4", text: "Targeted Temperature Management – הכנה", maxScore: 3 },
        { id: "C18-P2-A5", text: "מוכנות ל-re-arrest בנסיעה", maxScore: 3 },
      ]},
      { id: "C18-P3", title: "פינוי", actions: [
        { id: "C18-P3-A1", text: "Pre-alert – ROSC post VF, STEMI?, תצורת טיפול", maxScore: 3 },
        { id: "C18-P3-A2", text: "פינוי לקאת' ו/או ICU", maxScore: 3 },
        { id: "C18-P3-A3", text: "ניטור EtCO2, SpO2, BP ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["היפרוונטילציה post-ROSC", "SpO2 >99% ממושך", "לא חיפש STEMI", "עיכוב פינוי"],
    impression: ["ROSC", "post-cardiac arrest", "TTM", "STEMI post-arrest"],
  },
  {
    id: "C19", code: "C19", title: "פרפור עליות עם תגובה חדרית מהירה", badge: "〰️", category: "cardiac",
    story: "אישה בת 70 עם היסטוריה של AF מגיעה עם דפיקות לב, עייפות וקוצר נשימה. AF עם קצב חדרי מהיר.",
    vitals: { pulse: "145 לא סדיר", bp: "110/70", spo2: "95%", rr: "22" },
    phases: [
      { id: "C19-P1", title: "הערכה ראשונית", actions: [
        { id: "C19-P1-A1", text: "ECG – אישור AF, קצב חדרי, מורפולוגיית QRS", maxScore: 3 },
        { id: "C19-P1-A2", text: "הערכת יציבות המודינמית", maxScore: 3 },
        { id: "C19-P1-A3", text: "אנמנזה – משך, anticoagulation, תרופות", maxScore: 3 },
        { id: "C19-P1-A4", text: "גישה ורידית, ניטור, O2", maxScore: 3 },
      ]},
      { id: "C19-P2", title: "טיפול", actions: [
        { id: "C19-P2-A1", text: "AF יציב – rate control: metoprolol/digoxin IV", maxScore: 3 },
        { id: "C19-P2-A2", text: "AF עם אי-יציבות – קרדיוברסיה מסונכרנת 120-200J", maxScore: 3 },
        { id: "C19-P2-A3", text: "O2 לפי SpO2, מניעת CHF", maxScore: 3 },
        { id: "C19-P2-A4", text: "ניטור תגובה לטיפול", maxScore: 3 },
      ]},
      { id: "C19-P3", title: "פינוי", actions: [
        { id: "C19-P3-A1", text: "Pre-alert – AF RVR, יציבות, טיפול", maxScore: 3 },
        { id: "C19-P3-A2", text: "פינוי לקרדיולוגיה", maxScore: 3 },
        { id: "C19-P3-A3", text: "ניטור ECG ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["קרדיוברסיה לא מסונכרנת", "לא הבחין יציב/לא יציב", "מתן adenosine ל-AF"],
    impression: ["AF RVR", "rate control", "קרדיוברסיה", "anticoagulation"],
  },
  {
    id: "C20", code: "C20", title: "טכיקרדיה קומפלקס רחב לא מוגדרת", badge: "❓", category: "cardiac",
    story: "גבר בן 45 עם דפיקות לב חדות. ECG מראה טכיקרדיה קומפלקס רחב >120ms. אין היסטוריה ברורה.",
    vitals: { pulse: "155 סדיר", bp: "105/65", spo2: "96%", rr: "20" },
    phases: [
      { id: "C20-P1", title: "הערכה ראשונית", actions: [
        { id: "C20-P1-A1", text: "ECG – מדידת QRS, אקסיס, מורפולוגיה", maxScore: 3 },
        { id: "C20-P1-A2", text: "הנחת VT עד הוכחת היפך", maxScore: 3 },
        { id: "C20-P1-A3", text: "הערכת יציבות המודינמית", maxScore: 3 },
        { id: "C20-P1-A4", text: "גישה ורידית, ניטור, O2", maxScore: 3 },
      ]},
      { id: "C20-P2", title: "טיפול", actions: [
        { id: "C20-P2-A1", text: "אם אי-יציב – קרדיוברסיה מסונכרנת מיידית", maxScore: 3 },
        { id: "C20-P2-A2", text: "אם יציב – אמיודרון 150mg IV על 10 דקות", maxScore: 3 },
        { id: "C20-P2-A3", text: "הימנע מ-calcium channel blockers (Verapamil) – סכנה ב-VT", maxScore: 3 },
        { id: "C20-P2-A4", text: "ניטור תגובה – ריתמי, BP", maxScore: 3 },
      ]},
      { id: "C20-P3", title: "פינוי", actions: [
        { id: "C20-P3-A1", text: "Pre-alert – wide complex tachycardia, טיפול", maxScore: 3 },
        { id: "C20-P3-A2", text: "פינוי לאבחון מלא – אלקטרופיזיולוגיה", maxScore: 3 },
        { id: "C20-P3-A3", text: "ניטור ECG ברציפות, מוכנות ל-re-arrest", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן Verapamil בחשד VT", "לא הנחה VT כברירת מחדל", "קרדיוברסיה לא מסונכרנת בחולה עם דופק"],
    impression: ["wide complex tachycardia", "VT", "אמיודרון", "אלקטרופיזיולוגיה"],
  },
  {
    id: "R05", code: "R05", title: "אנפילקסיס עם ברונכוספזם", badge: "🐝", category: "respiratory",
    story: "אישה בת 32 עקוצה על ידי דבורה לפני 10 דקות. היא מפתחת קוצר נשימה, שריקות, בצקת פנים ופריחה. BP יורד.",
    vitals: { pulse: "130 חלש", bp: "80/50", spo2: "90%", rr: "28" },
    phases: [
      { id: "R05-P1", title: "הערכה ראשונית", actions: [
        { id: "R05-P1-A1", text: "זיהוי אנפילקסיס – עקיצה, stridor, BP נמוך, פריחה", maxScore: 3 },
        { id: "R05-P1-A2", text: "הכנת אדרנלין 1:1000 IM מיידי", maxScore: 3 },
        { id: "R05-P1-A3", text: "O2 high-flow במסכה", maxScore: 3 },
        { id: "R05-P1-A4", text: "גישה ורידית מהירה x2", maxScore: 3 },
      ]},
      { id: "R05-P2", title: "טיפול", actions: [
        { id: "R05-P2-A1", text: "אדרנלין 0.5mg IM (1:1000) לירך חיצוני", maxScore: 3 },
        { id: "R05-P2-A2", text: "נוזלים IV 500-1000ml bolus", maxScore: 3 },
        { id: "R05-P2-A3", text: "סלבוטמול נבולייזר לברונכוספזם", maxScore: 3 },
        { id: "R05-P2-A4", text: "הידרוקורטיזון 200mg IV ו-כלורפנירמין 10mg IV", maxScore: 3 },
        { id: "R05-P2-A5", text: "מנה שנייה אדרנלין IM אחרי 5 דקות אם ללא שיפור", maxScore: 3 },
      ]},
      { id: "R05-P3", title: "פינוי", actions: [
        { id: "R05-P3-A1", text: "פינוי דחוף – ניטור לrebound reaction", maxScore: 3 },
        { id: "R05-P3-A2", text: "Pre-alert – אנפילקסיס, אדרנלין, BP", maxScore: 3 },
        { id: "R05-P3-A3", text: "הכנה לאינטובציה אם stridor מחמיר", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב אדרנלין IM", "מתן אדרנלין IV ללא ניטור", "לא מתן נוזלים בהלם", "לא ניטר rebound"],
    impression: ["אנפילקסיס", "אדרנלין IM", "ברונכוספזם", "הלם"],
  },
  {
    id: "R06", code: "R06", title: "החמרת COPD", badge: "🌬️", category: "respiratory",
    story: "גבר בן 70 מעשן כבד עם COPD ידוע. החמרה ב-3 ימים – ליחה ירוקה, קוצר נשימה בעת מנוחה. שפתיים כחלחלות.",
    vitals: { pulse: "105 סדיר", bp: "145/90", spo2: "84%", rr: "28" },
    phases: [
      { id: "R06-P1", title: "הערכה ראשונית", actions: [
        { id: "R06-P1-A1", text: "הערכת נשימה – accessory muscles, cyanosis, mentation", maxScore: 3 },
        { id: "R06-P1-A2", text: "O2 מבוקר – מטרה SpO2 88-92% ב-COPD", maxScore: 3 },
        { id: "R06-P1-A3", text: "האזנה – wheeze, air entry", maxScore: 3 },
        { id: "R06-P1-A4", text: "גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "R06-P2", title: "טיפול", actions: [
        { id: "R06-P2-A1", text: "סלבוטמול 2.5-5mg נבולייזר", maxScore: 3 },
        { id: "R06-P2-A2", text: "איפרטרופיום (Atrovent) 0.5mg נבולייזר", maxScore: 3 },
        { id: "R06-P2-A3", text: "מתיל-פרדניזולון 125mg IV", maxScore: 3 },
        { id: "R06-P2-A4", text: "NIV/BiPAP אם מחמיר – pH<7.35, CO2 גבוה", maxScore: 3 },
        { id: "R06-P2-A5", text: "הכנה לאינטובציה כמוצא אחרון", maxScore: 3 },
      ]},
      { id: "R06-P3", title: "פינוי", actions: [
        { id: "R06-P3-A1", text: "המשך O2 מבוקר וNIV בנסיעה", maxScore: 3 },
        { id: "R06-P3-A2", text: "Pre-alert – COPD exacerbation, SpO2, BiPAP", maxScore: 3 },
        { id: "R06-P3-A3", text: "ניטור SpO2, mentation, RR", maxScore: 3 },
      ]},
    ],
    failCriteria: ["O2 גבוה מדי ב-COPD (SpO2>95%)", "לא מתן ברונכודילטור", "עיכוב BiPAP"],
    impression: ["COPD", "O2 מבוקר", "ברונכודילטור", "BiPAP"],
  },
  {
    id: "R07", code: "R07", title: "פנאומוטורקס מתחת לעור", badge: "💨", category: "respiratory",
    story: "גבר בן 25 גבוה ורזה מתלונן על כאב חזה חד פתאומי וקוצר נשימה שהחלו בעת מאמץ קל. הנשמה חלשה בצד שמאל.",
    vitals: { pulse: "98 סדיר", bp: "115/75", spo2: "93%", rr: "24" },
    phases: [
      { id: "R07-P1", title: "הערכה ראשונית", actions: [
        { id: "R07-P1-A1", text: "האזנה דו-צדדית – הפחתת כניסת אוויר צד אחד", maxScore: 3 },
        { id: "R07-P1-A2", text: "הקשה – היפר-רזוננס בצד הפגוע", maxScore: 3 },
        { id: "R07-P1-A3", text: "O2 high-flow, ניטור SpO2", maxScore: 3 },
        { id: "R07-P1-A4", text: "זיהוי פנאומוטורקס פשוט vs tension", maxScore: 3 },
      ]},
      { id: "R07-P2", title: "טיפול", actions: [
        { id: "R07-P2-A1", text: "פנאומוטורקס פשוט – O2, ניטור, פינוי", maxScore: 3 },
        { id: "R07-P2-A2", text: "פנאומוטורקס מתח – ניקוב מיידי מחט 2nd ICS MCL", maxScore: 3 },
        { id: "R07-P2-A3", text: "זיהוי סימני tension: tracheal deviation, ורידי צוואר", maxScore: 3 },
        { id: "R07-P2-A4", text: "לאחר ניקוב – הכנה לצינור חזה בבית חולים", maxScore: 3 },
      ]},
      { id: "R07-P3", title: "פינוי", actions: [
        { id: "R07-P3-A1", text: "Pre-alert – פנאומוטורקס, ניקוב אם בוצע, SpO2", maxScore: 3 },
        { id: "R07-P3-A2", text: "פינוי לכירורגיה לצינור חזה", maxScore: 3 },
        { id: "R07-P3-A3", text: "ניטור SpO2, BP, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב ניקוב בפנאומוטורקס מתח", "ניקוב בפנאומוטורקס פשוט ללא סיבה", "לא זיהה tension signs"],
    impression: ["פנאומוטורקס", "tension", "ניקוב מחט", "2nd ICS"],
  },
  {
    id: "R08", code: "R08", title: "תסחיף ריאתי", badge: "🩸", category: "respiratory",
    story: "אישה בת 45 לאחר טיסה ארוכה מתלוננת על קוצר נשימה חד וכאב חזה פלאוריטי. רגל שמאל נפוחה ואדומה.",
    vitals: { pulse: "118 סדיר", bp: "105/65", spo2: "91%", rr: "26" },
    phases: [
      { id: "R08-P1", title: "הערכה ראשונית", actions: [
        { id: "R08-P1-A1", text: "אנמנזה – DVT גורמי סיכון, טיסה, immobility", maxScore: 3 },
        { id: "R08-P1-A2", text: "בדיקת גפיים – DVT סימנים", maxScore: 3 },
        { id: "R08-P1-A3", text: "ECG – S1Q3T3, sinus tachycardia", maxScore: 3 },
        { id: "R08-P1-A4", text: "O2 high-flow, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "R08-P2", title: "טיפול", actions: [
        { id: "R08-P2-A1", text: "O2 לפי SpO2, מטרה >94%", maxScore: 3 },
        { id: "R08-P2-A2", text: "נוזלים IV זהיר – אם BP נמוך", maxScore: 3 },
        { id: "R08-P2-A3", text: "הימנע מהורדת preload – ניטרו, diuretics", maxScore: 3 },
        { id: "R08-P2-A4", text: "אנלגזיה לכאב פלאוריטי", maxScore: 3 },
        { id: "R08-P2-A5", text: "PE המסיבי + הלם – שקילת lytics", maxScore: 3 },
      ]},
      { id: "R08-P3", title: "פינוי", actions: [
        { id: "R08-P3-A1", text: "Pre-alert – חשד PE, SpO2, יציבות", maxScore: 3 },
        { id: "R08-P3-A2", text: "פינוי לCT angio ריאות", maxScore: 3 },
        { id: "R08-P3-A3", text: "ניטור ברציפות – מוכנות לאוסצילציה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא חשד PE", "מתן ניטרו בPE", "עיכוב פינוי", "לא בדק DVT"],
    impression: ["PE", "DVT", "S1Q3T3", "CT angio"],
  },
  {
    id: "R09", code: "R09", title: "שאיפת עשן", badge: "🔥", category: "respiratory",
    story: "גבר בן 40 חולץ מבניין בוער. הוא מיוזע עם קול צרוד, ריסים שרופים ופיח סביב הפה. SpO2 תקינה לכאורה בפולסאוקסימטר.",
    vitals: { pulse: "105 סדיר", bp: "130/85", spo2: "98% (לא אמין!)", rr: "22" },
    phases: [
      { id: "R09-P1", title: "הערכה ראשונית", actions: [
        { id: "R09-P1-A1", text: "O2 100% NRB מיידי – CO poisoning בכל חולה שריפה", maxScore: 3 },
        { id: "R09-P1-A2", text: "הערכת נתיב אוויר – stridor, קול צרוד, ריסים שרופים", maxScore: 3 },
        { id: "R09-P1-A3", text: "זיהוי SpO2 לא אמין ב-CO – COHb גבוה", maxScore: 3 },
        { id: "R09-P1-A4", text: "גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "R09-P2", title: "טיפול", actions: [
        { id: "R09-P2-A1", text: "O2 100% NRB ברציפות – הפחתת t1/2 CO", maxScore: 3 },
        { id: "R09-P2-A2", text: "הכנה לאינטובציה מוקדמת – בצקת airway מתפתחת", maxScore: 3 },
        { id: "R09-P2-A3", text: "RSI מוקדם אם stridor/קול צרוד מחמיר", maxScore: 3 },
        { id: "R09-P2-A4", text: "נוזלים IV, ניטור לפי צרכים", maxScore: 3 },
      ]},
      { id: "R09-P3", title: "פינוי", actions: [
        { id: "R09-P3-A1", text: "Pre-alert – שאיפת עשן, airway compromise, אינטובציה", maxScore: 3 },
        { id: "R09-P3-A2", text: "פינוי לחדר כוויות/ICU", maxScore: 3 },
        { id: "R09-P3-A3", text: "שקילת hyperbaric O2 ב-CO קשה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["סמיכות על SpO2 תקינה בחשד CO", "עיכוב אינטובציה מוקדמת", "O2 פחות מ-100%"],
    impression: ["שאיפת עשן", "CO poisoning", "airway burn", "אינטובציה מוקדמת"],
  },
  {
    id: "R10", code: "R10", title: "טביעה ממש (Near-drowning)", badge: "🌊", category: "respiratory",
    story: "ילד בן 8 חולץ מהבריכה לאחר חוסר תגובה. CPR בוצע על ידי ההורים. בהגעת מד\"א הוא נושם חלש, מלא מים.",
    vitals: { pulse: "60 חלש", bp: "80/50", spo2: "82%", rr: "8 לא יעיל" },
    phases: [
      { id: "R10-P1", title: "הערכה ראשונית", actions: [
        { id: "R10-P1-A1", text: "הערכת ABCDE – airway, breathing, circulation", maxScore: 3 },
        { id: "R10-P1-A2", text: "ניהול נתיב אוויר – הטיה, BVM, שאיבה", maxScore: 3 },
        { id: "R10-P1-A3", text: "O2 100%, BVM עם PEEP", maxScore: 3 },
        { id: "R10-P1-A4", text: "ניטור טמפרטורה – היפותרמיה", maxScore: 3 },
      ]},
      { id: "R10-P2", title: "טיפול", actions: [
        { id: "R10-P2-A1", text: "RSI/אינטובציה – airway protection", maxScore: 3 },
        { id: "R10-P2-A2", text: "היפותרמיה – לא להכריז מוות עד חום תקין", maxScore: 3 },
        { id: "R10-P2-A3", text: "גישה ורידית/IO – נוזלים חמים", maxScore: 3 },
        { id: "R10-P2-A4", text: "CPR אם PEA/asystole", maxScore: 3 },
        { id: "R10-P2-A5", text: "ניטור גלוקוז, אלקטרוליטים (הערכה)", maxScore: 3 },
      ]},
      { id: "R10-P3", title: "פינוי", actions: [
        { id: "R10-P3-A1", text: "Pre-alert – near drowning, גיל, היפותרמיה, אינטובציה", maxScore: 3 },
        { id: "R10-P3-A2", text: "פינוי מהיר לICU ילדים", maxScore: 3 },
        { id: "R10-P3-A3", text: "חימום פעיל בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["הכרזת מוות מוקדמת בהיפותרמיה", "לא אינטובציה", "לא ניטר טמפרטורה"],
    impression: ["near-drowning", "היפותרמיה", "אינטובציה", "PEEP"],
  },
  {
    id: "R11", code: "R11", title: "אפיגלוטיטיס", badge: "🦷", category: "respiratory",
    story: "גבר בן 35 עם כאב גרון קשה מאד, קושי בבליעה ונזילת רוק. קול חנוק, חום גבוה. מסרב לשכב.",
    vitals: { pulse: "115 סדיר", bp: "125/80", spo2: "95%", rr: "22" },
    phases: [
      { id: "R11-P1", title: "הערכה ראשונית", actions: [
        { id: "R11-P1-A1", text: "זיהוי הצגה – drooling, stridor, sniffing position", maxScore: 3 },
        { id: "R11-P1-A2", text: "O2 high-flow בעדינות – לא לאלץ מיקום", maxScore: 3 },
        { id: "R11-P1-A3", text: "הימנע מבדיקת גרון עם spatula – סיכון spasm", maxScore: 3 },
        { id: "R11-P1-A4", text: "הכנה לניהול airway קשה", maxScore: 3 },
      ]},
      { id: "R11-P2", title: "טיפול", actions: [
        { id: "R11-P2-A1", text: "O2 humidified, מיקום נוח לחולה", maxScore: 3 },
        { id: "R11-P2-A2", text: "הכנה לאינטובציה RSI על ידי מנוסה בairway קשה", maxScore: 3 },
        { id: "R11-P2-A3", text: "הכנה ל-cricothyrotomy כמוצא אחרון", maxScore: 3 },
        { id: "R11-P2-A4", text: "גישה ורידית, אדרנלין IM אם אנפילקסיס בDDx", maxScore: 3 },
      ]},
      { id: "R11-P3", title: "פינוי", actions: [
        { id: "R11-P3-A1", text: "Pre-alert – חשד אפיגלוטיטיס, airway מסוכן, אנסתזיה", maxScore: 3 },
        { id: "R11-P3-A2", text: "פינוי מהיר עם רופא/אנסתזיולוג", maxScore: 3 },
        { id: "R11-P3-A3", text: "לא לעזוב חולה רגע", maxScore: 3 },
      ]},
    ],
    failCriteria: ["בדיקת גרון עם spatula", "השכבת חולה", "עיכוב Pre-alert", "לא הכנה לcric"],
    impression: ["אפיגלוטיטיס", "stridor", "airway קשה", "cricothyrotomy"],
  },
  {
    id: "R12", code: "R12", title: "קרופ חריף בילד", badge: "🔔", category: "respiratory",
    story: "ילד בן 2 מגיע עם שיעול נביחה, stridor בהשראה וקוצר נשימה שהחמיר בלילה. חום קל. ההורים מבוהלים.",
    vitals: { pulse: "140 סדיר", bp: "95/60", spo2: "94%", rr: "36" },
    phases: [
      { id: "R12-P1", title: "הערכה ראשונית", actions: [
        { id: "R12-P1-A1", text: "הרגעת ילד והורים – distress מחמיר stridor", maxScore: 3 },
        { id: "R12-P1-A2", text: "O2 humidified מרחוק (blow-by) – לא מסכה צמודה", maxScore: 3 },
        { id: "R12-P1-A3", text: "ציון Westley – חומרת קרופ", maxScore: 3 },
        { id: "R12-P1-A4", text: "הבחנה מאפיגלוטיטיס – שיעול נביחה, קול צרוד", maxScore: 3 },
      ]},
      { id: "R12-P2", title: "טיפול", actions: [
        { id: "R12-P2-A1", text: "אדרנלין (1:1000) 5ml נבולייזר", maxScore: 3 },
        { id: "R12-P2-A2", text: "דקסמתזון 0.15mg/kg PO/IM", maxScore: 3 },
        { id: "R12-P2-A3", text: "O2 אם SpO2<94%", maxScore: 3 },
        { id: "R12-P2-A4", text: "הכנה לאינטובציה אם מחמיר", maxScore: 3 },
      ]},
      { id: "R12-P3", title: "פינוי", actions: [
        { id: "R12-P3-A1", text: "Pre-alert – קרופ, גיל, Westley, אדרנלין", maxScore: 3 },
        { id: "R12-P3-A2", text: "פינוי – rebound אחרי אדרנלין, ניטור 2-4 שעות", maxScore: 3 },
        { id: "R12-P3-A3", text: "ניטור SpO2, stridor, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מסכה צמודה – מגביר distress", "לא מתן אדרנלין נבולייזר", "לא ניטר rebound"],
    impression: ["קרופ", "stridor", "אדרנלין נבולייזר", "דקסמתזון"],
  },
  {
    id: "R13", code: "R13", title: "שיעול דם (Hemoptysis)", badge: "🩸", category: "respiratory",
    story: "גבר בן 58 מעשן מגיע עם שיעול דם מסיבי. הוא מאבד כ-300ml בשעה האחרונה. תנועת חזה א-סימטרית.",
    vitals: { pulse: "118 חלש", bp: "95/60", spo2: "88%", rr: "28" },
    phases: [
      { id: "R13-P1", title: "הערכה ראשונית", actions: [
        { id: "R13-P1-A1", text: "כמות ומקור – massive hemoptysis הגדרה >200ml/24h", maxScore: 3 },
        { id: "R13-P1-A2", text: "O2 high-flow, גישה ורידית x2", maxScore: 3 },
        { id: "R13-P1-A3", text: "מיקום – צד הפגוע למטה לדלף לריאה בריאה", maxScore: 3 },
        { id: "R13-P1-A4", text: "ניטור SpO2, BP, mentation", maxScore: 3 },
      ]},
      { id: "R13-P2", title: "טיפול", actions: [
        { id: "R13-P2-A1", text: "נוזלים IV לתמיכה המודינמית", maxScore: 3 },
        { id: "R13-P2-A2", text: "הכנה לאינטובציה – single lung ventilation אם מחמיר", maxScore: 3 },
        { id: "R13-P2-A3", text: "לא מתן anticoagulants", maxScore: 3 },
        { id: "R13-P2-A4", text: "שאיבת דרכי אוויר", maxScore: 3 },
      ]},
      { id: "R13-P3", title: "פינוי", actions: [
        { id: "R13-P3-A1", text: "Pre-alert – massive hemoptysis, SpO2, אינטובציה", maxScore: 3 },
        { id: "R13-P3-A2", text: "פינוי לכירורגיה/interventional radiology", maxScore: 3 },
        { id: "R13-P3-A3", text: "ניטור ברציפות, מוכנות לCPR", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מיקום שגוי – צד בריא למטה", "לא אינטובציה בחמור", "מתן anticoagulants"],
    impression: ["hemoptysis", "מיקום צד פגוע", "single lung", "interventional radiology"],
  },
  {
    id: "R14", code: "R14", title: "אי-ספיקה נשימתית – אינדיקציה ל-BiPAP", badge: "🫁", category: "respiratory",
    story: "אישה בת 72 עם היסטוריה של CHF וCOPD מגיעה עם קוצר נשימה קשה. עייפות שרירי נשימה, CO2 גבוה.",
    vitals: { pulse: "110 סדיר", bp: "155/95", spo2: "87%", rr: "35 רדוד" },
    phases: [
      { id: "R14-P1", title: "הערכה ראשונית", actions: [
        { id: "R14-P1-A1", text: "הערכת עייפות נשימתית – accessory muscles, paradoxical", maxScore: 3 },
        { id: "R14-P1-A2", text: "EtCO2 אם זמין – ריטנציית CO2", maxScore: 3 },
        { id: "R14-P1-A3", text: "O2 נמוך ל-COPD, גישה ורידית", maxScore: 3 },
        { id: "R14-P1-A4", text: "ניטור SpO2, BP, GCS", maxScore: 3 },
      ]},
      { id: "R14-P2", title: "טיפול", actions: [
        { id: "R14-P2-A1", text: "BiPAP: IPAP 12-16, EPAP 4-8 cmH2O", maxScore: 3 },
        { id: "R14-P2-A2", text: "ברונכודילטור במקביל נבולייזר", maxScore: 3 },
        { id: "R14-P2-A3", text: "ניטור תגובה – SpO2, RR, mentation שיפור", maxScore: 3 },
        { id: "R14-P2-A4", text: "הכנה לאינטובציה אם BiPAP נכשל", maxScore: 3 },
      ]},
      { id: "R14-P3", title: "פינוי", actions: [
        { id: "R14-P3-A1", text: "המשך BiPAP בנסיעה", maxScore: 3 },
        { id: "R14-P3-A2", text: "Pre-alert – NIV failure risk, COPD/CHF, SpO2", maxScore: 3 },
        { id: "R14-P3-A3", text: "ניטור ברציפות, מוכנות לאינטובציה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["O2 גבוה ב-COPD hypercapnic", "עיכוב BiPAP", "לא הכנה לאינטובציה גיבוי"],
    impression: ["BiPAP", "hypercapnia", "COPD/CHF", "NIV"],
  },
  {
    id: "R15", code: "R15", title: "פנאומוניה COVID חמורה", badge: "🦠", category: "respiratory",
    story: "גבר בן 55 לא מחוסן עם חום 5 ימים, שיעול יבש וקוצר נשימה הולך וגובר. Happy hypoxia – SpO2 84% ללא distress.",
    vitals: { pulse: "105 סדיר", bp: "125/80", spo2: "84%", rr: "28" },
    phases: [
      { id: "R15-P1", title: "הערכה ראשונית", actions: [
        { id: "R15-P1-A1", text: "זיהוי happy hypoxia – SpO2 נמוך ללא distress קשה", maxScore: 3 },
        { id: "R15-P1-A2", text: "O2 NRB/High flow, מטרה SpO2>94%", maxScore: 3 },
        { id: "R15-P1-A3", text: "prone position אם ניתן – שיפור oxygenation", maxScore: 3 },
        { id: "R15-P1-A4", text: "גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "R15-P2", title: "טיפול", actions: [
        { id: "R15-P2-A1", text: "O2 high-flow nasal cannula (HFNC) אם זמין", maxScore: 3 },
        { id: "R15-P2-A2", text: "prone positioning לשיפור V/Q", maxScore: 3 },
        { id: "R15-P2-A3", text: "נוזלים זהיר – ARDS נוטה לoverfill", maxScore: 3 },
        { id: "R15-P2-A4", text: "הכנה לאינטובציה – SpO2<90% בO2 מקסימלי", maxScore: 3 },
      ]},
      { id: "R15-P3", title: "פינוי", actions: [
        { id: "R15-P3-A1", text: "Pre-alert – COVID pneumonia, happy hypoxia, SpO2", maxScore: 3 },
        { id: "R15-P3-A2", text: "פינוי לICU – ARDS protocol", maxScore: 3 },
        { id: "R15-P3-A3", text: "ניטור SpO2 ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא O2 בחולה happy hypoxia", "עיכוב טיפול כי חולה 'נראה טוב'", "נוזלים מוגזמים"],
    impression: ["COVID", "happy hypoxia", "prone", "ARDS"],
  },
  {
    id: "R16", code: "R16", title: "תפיחת ריאות (Pleural Effusion) מסיבית", badge: "💧", category: "respiratory",
    story: "אישה בת 65 עם סרטן ריאות מגיעה עם קוצר נשימה הולך וגובר בשבועות האחרונים. תנועת חזה אסימטרית, עמעום מוחלט.",
    vitals: { pulse: "98 סדיר", bp: "130/80", spo2: "89%", rr: "28" },
    phases: [
      { id: "R16-P1", title: "הערכה ראשונית", actions: [
        { id: "R16-P1-A1", text: "האזנה – אי-שמיעת נשימה בצד + עמעום", maxScore: 3 },
        { id: "R16-P1-A2", text: "O2 high-flow, מיקום ישיבה", maxScore: 3 },
        { id: "R16-P1-A3", text: "FAST/Lung US אם זמין – עמידת נוזל", maxScore: 3 },
        { id: "R16-P1-A4", text: "ניטור SpO2, BP, mentation", maxScore: 3 },
      ]},
      { id: "R16-P2", title: "טיפול", actions: [
        { id: "R16-P2-A1", text: "O2 לפי SpO2, מיקום נוח", maxScore: 3 },
        { id: "R16-P2-A2", text: "ניקוז pleural – אם מיומן ויש ציוד ועמידת נוזל", maxScore: 3 },
        { id: "R16-P2-A3", text: "הבחנה מפנאומוטורקס – עמעום vs היפר-רזוננס", maxScore: 3 },
        { id: "R16-P2-A4", text: "ניטור תגובה לO2", maxScore: 3 },
      ]},
      { id: "R16-P3", title: "פינוי", actions: [
        { id: "R16-P3-A1", text: "Pre-alert – תפיחת ריאות, ממאירות, SpO2", maxScore: 3 },
        { id: "R16-P3-A2", text: "פינוי לניקוז בבית חולים", maxScore: 3 },
        { id: "R16-P3-A3", text: "ניטור SpO2 ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["ניסיון ניקוז ללא הכשרה", "לא הבחין מפנאומוטורקס", "השכבת חולה"],
    impression: ["תפיחת ריאות", "pleural effusion", "Lung US", "ניקוז"],
  },
  {
    id: "R17", code: "R17", title: "אסתמה בהריון", badge: "🤰", category: "respiratory",
    story: "אישה בהריון שבוע 30 עם אסתמה ידועה מגיעה עם התקף חמור. שריקות, שימוש בשרירים עזר, SpO2 ירוד.",
    vitals: { pulse: "120 סדיר", bp: "115/75", spo2: "91%", rr: "32" },
    phases: [
      { id: "R17-P1", title: "הערכה ראשונית", actions: [
        { id: "R17-P1-A1", text: "הערכת חומרת התקף אסתמה", maxScore: 3 },
        { id: "R17-P1-A2", text: "מיקום שמאל – הרחבת לחץ IVC בהריון", maxScore: 3 },
        { id: "R17-P1-A3", text: "O2 high-flow – מטרה SpO2>95% בהריון!", maxScore: 3 },
        { id: "R17-P1-A4", text: "גישה ורידית, ניטור FHR אם ניתן", maxScore: 3 },
      ]},
      { id: "R17-P2", title: "טיפול", actions: [
        { id: "R17-P2-A1", text: "סלבוטמול נבולייזר – בטוח בהריון", maxScore: 3 },
        { id: "R17-P2-A2", text: "מגנזיום סולפט 2g IV – bronchodilator", maxScore: 3 },
        { id: "R17-P2-A3", text: "הידרוקורטיזון 200mg IV", maxScore: 3 },
        { id: "R17-P2-A4", text: "הכנה לאינטובציה אם מחמיר – RSI מיוחד להריון", maxScore: 3 },
      ]},
      { id: "R17-P3", title: "פינוי", actions: [
        { id: "R17-P3-A1", text: "Pre-alert – אסתמה חמורה + הריון, SpO2, שבוע הריון", maxScore: 3 },
        { id: "R17-P3-A2", text: "פינוי לחדר לידה + ריאות", maxScore: 3 },
        { id: "R17-P3-A3", text: "ניטור SpO2 מטרה >95%", maxScore: 3 },
      ]},
    ],
    failCriteria: ["SpO2 מטרה <94% בהריון", "לא מיקום שמאל", "עיכוב טיפול מחשש לעובר"],
    impression: ["אסתמה", "הריון", "מגנזיום", "SpO2>95%"],
  },
  {
    id: "R18", code: "R18", title: "היפרוונטילציה פסיכוגנית", badge: "😰", category: "respiratory",
    story: "אישה בת 22 אחרי ריב עם בן זוג מגיעה עם נשימות מהירות, עקצוץ בידיים ותחושת חנק. Carpopedal spasm.",
    vitals: { pulse: "105 סדיר", bp: "125/80", spo2: "99%", rr: "36 עמוק" },
    phases: [
      { id: "R18-P1", title: "הערכה ראשונית", actions: [
        { id: "R18-P1-A1", text: "שלילת אבחנות מסכנות חיים – PE, MI, פנאומוטורקס", maxScore: 3 },
        { id: "R18-P1-A2", text: "אנמנזה מלאה – טריגר, היסטוריה, תרופות", maxScore: 3 },
        { id: "R18-P1-A3", text: "גלוקומטר, ECG, SpO2 – שלילת אורגני", maxScore: 3 },
        { id: "R18-P1-A4", text: "הרגעה, הסבר לחולה", maxScore: 3 },
      ]},
      { id: "R18-P2", title: "טיפול", actions: [
        { id: "R18-P2-A1", text: "הנחיית נשימה – slow breathing, diaphragmatic", maxScore: 3 },
        { id: "R18-P2-A2", text: "הימנע ממסכה עם שקית נייר – סיכון", maxScore: 3 },
        { id: "R18-P2-A3", text: "הרגעת סביבה, הוצאת גורמי לחץ", maxScore: 3 },
        { id: "R18-P2-A4", text: "לא O2 נוסף – SpO2 כבר תקינה", maxScore: 3 },
      ]},
      { id: "R18-P3", title: "פינוי", actions: [
        { id: "R18-P3-A1", text: "פינוי לאבחון שלמות – שלילת PE בחולה ראשונה", maxScore: 3 },
        { id: "R18-P3-A2", text: "תיעוד – תגובה לטיפול הרגעתי", maxScore: 3 },
        { id: "R18-P3-A3", text: "הפניה לתמיכה נפשית", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מסכה עם שקית נייר", "לא שלל אורגני", "מתן O2 מיותר", "לא הרגיע"],
    impression: ["היפרוונטילציה", "פסיכוגני", "carpopedal spasm", "שלילת PE"],
  },
  {
    id: "R19", code: "R19", title: "טראומת בית החזה – שבר צלעות", badge: "🦴", category: "respiratory",
    story: "גבר בן 60 לאחר תאונת דרכים. כאב חזה ימין חמור, נשימה רדודה ומכאיבה. מרובע – 4 צלעות שבורות.",
    vitals: { pulse: "108 סדיר", bp: "120/80", spo2: "93%", rr: "24 רדוד" },
    phases: [
      { id: "R19-P1", title: "הערכה ראשונית", actions: [
        { id: "R19-P1-A1", text: "MARCH/ABCDE – trauma survey", maxScore: 3 },
        { id: "R19-P1-A2", text: "הערכת flail chest – תנועה פרדוקסלית", maxScore: 3 },
        { id: "R19-P1-A3", text: "O2 high-flow, ניטור SpO2", maxScore: 3 },
        { id: "R19-P1-A4", text: "שלילת פנאומוטורקס/המוטורקס", maxScore: 3 },
      ]},
      { id: "R19-P2", title: "טיפול", actions: [
        { id: "R19-P2-A1", text: "אנלגזיה IV – מורפין/קטמין לאפשר נשימה יעילה", maxScore: 3 },
        { id: "R19-P2-A2", text: "Flail chest – IPPV/CPAP לstabilization", maxScore: 3 },
        { id: "R19-P2-A3", text: "לא splinting חיצוני – מגביל נשימה", maxScore: 3 },
        { id: "R19-P2-A4", text: "נוזלים זהיר – ריאה קוסנטוסית", maxScore: 3 },
      ]},
      { id: "R19-P3", title: "פינוי", actions: [
        { id: "R19-P3-A1", text: "Pre-alert – טראומת חזה, flail, SpO2, אנלגזיה", maxScore: 3 },
        { id: "R19-P3-A2", text: "פינוי לטראומה – X ray, CT חזה", maxScore: 3 },
        { id: "R19-P3-A3", text: "ניטור SpO2, BP, RR ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["splinting חיצוני", "לא אנלגזיה", "לא זיהה flail chest", "עיכוב פינוי"],
    impression: ["flail chest", "שבר צלעות", "אנלגזיה", "CPAP"],
  },
  {
    id: "N04", code: "N04", title: "אירוע איסכמי חולף (TIA)", badge: "⚡", category: "neuro",
    story: "גבר בן 65 מדווח על חולשה בצד שמאל שחלפה תוך 20 דקות. כעת הוא תקין נוירולוגית. אין גורמי סיכון ידועים.",
    vitals: { pulse: "78 סדיר", bp: "155/90", spo2: "98%", rr: "16" },
    phases: [
      { id: "N04-P1", title: "הערכה ראשונית", actions: [
        { id: "N04-P1-A1", text: "FAST – גם אם חלף, תיעוד סימנים קודמים", maxScore: 3 },
        { id: "N04-P1-A2", text: "NIHSS – הערכה נוירולוגית מלאה", maxScore: 3 },
        { id: "N04-P1-A3", text: "גלוקומטר – שלילת היפוגליקמיה", maxScore: 3 },
        { id: "N04-P1-A4", text: "ECG – חיפוש AF", maxScore: 3 },
      ]},
      { id: "N04-P2", title: "טיפול", actions: [
        { id: "N04-P2-A1", text: "O2 אם SpO2<94%", maxScore: 3 },
        { id: "N04-P2-A2", text: "גישה ורידית, ניטור", maxScore: 3 },
        { id: "N04-P2-A3", text: "לא lytics – תסמינים חלפו", maxScore: 3 },
        { id: "N04-P2-A4", text: "אספירין 300mg PO – antiplatelets", maxScore: 3 },
      ]},
      { id: "N04-P3", title: "פינוי", actions: [
        { id: "N04-P3-A1", text: "Pre-alert – TIA, ABCD2 score, ECG, גלוקוז", maxScore: 3 },
        { id: "N04-P3-A2", text: "פינוי דחוף – TIA = stroke בהמתנה", maxScore: 3 },
        { id: "N04-P3-A3", text: "ניטור לסימני stroke בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן lytics בTIA שחלף", "עיכוב פינוי כי 'זה חלף'", "לא בדק גלוקוז", "לא ECG"],
    impression: ["TIA", "FAST", "ABCD2", "אספירין"],
  },
  {
    id: "N05", code: "N05", title: "אנצפלופתיה יתר לחץ דם", badge: "🔴", category: "neuro",
    story: "גבר בן 55 עם יתר לחץ דם לא מטופל מגיע עם בלבול, כאב ראש עז והפרעות ראיה. BP 240/140 ממ\"כ.",
    vitals: { pulse: "88 סדיר", bp: "240/140", spo2: "96%", rr: "18" },
    phases: [
      { id: "N05-P1", title: "הערכה ראשונית", actions: [
        { id: "N05-P1-A1", text: "NIHSS, GCS, הערכה נוירולוגית מלאה", maxScore: 3 },
        { id: "N05-P1-A2", text: "מדידת BP בשתי ידיים", maxScore: 3 },
        { id: "N05-P1-A3", text: "גלוקומטר, ECG, ניטור", maxScore: 3 },
        { id: "N05-P1-A4", text: "גישה ורידית", maxScore: 3 },
      ]},
      { id: "N05-P2", title: "טיפול", actions: [
        { id: "N05-P2-A1", text: "הורדת BP הדרגתית – מטרה 25% תוך שעה", maxScore: 3 },
        { id: "N05-P2-A2", text: "ניטרוגליצרין IV זהיר / labetalol IV", maxScore: 3 },
        { id: "N05-P2-A3", text: "הימנע מהורדה מהירה – CVA!", maxScore: 3 },
        { id: "N05-P2-A4", text: "O2 לפי SpO2", maxScore: 3 },
      ]},
      { id: "N05-P3", title: "פינוי", actions: [
        { id: "N05-P3-A1", text: "Pre-alert – hypertensive encephalopathy, BP, GCS", maxScore: 3 },
        { id: "N05-P3-A2", text: "פינוי לCT ראש ונוירולוגיה", maxScore: 3 },
        { id: "N05-P3-A3", text: "ניטור BP ותסמינים נוירולוגיים", maxScore: 3 },
      ]},
    ],
    failCriteria: ["הורדת BP מהירה מדי", "לא בדק גלוקוז", "עיכוב פינוי"],
    impression: ["hypertensive encephalopathy", "BP הדרגתי", "CT ראש", "labetalol"],
  },
  {
    id: "N06", code: "N06", title: "שיתוק Todd's לאחר פרכוס", badge: "🧠", category: "neuro",
    story: "אישה בת 28 עם אפילפסיה ידועה. לאחר פרכוס גנרלי עם חולשת ידה השמאלית. כעת מתאוששת אך יש weakness.",
    vitals: { pulse: "95 סדיר", bp: "130/80", spo2: "97%", rr: "18" },
    phases: [
      { id: "N06-P1", title: "הערכה ראשונית", actions: [
        { id: "N06-P1-A1", text: "אנמנזה – פרכוס קודם, אפילפסיה, תרופות", maxScore: 3 },
        { id: "N06-P1-A2", text: "FAST – הבחנה מ-CVA אמיתי", maxScore: 3 },
        { id: "N06-P1-A3", text: "גלוקומטר – שלילת היפוגליקמיה", maxScore: 3 },
        { id: "N06-P1-A4", text: "גישה ורידית, ניטור, O2", maxScore: 3 },
      ]},
      { id: "N06-P2", title: "טיפול", actions: [
        { id: "N06-P2-A1", text: "ניטור הדרגתי – Todd's משתפר תוך דקות-שעות", maxScore: 3 },
        { id: "N06-P2-A2", text: "לא lytics – Todd's ולא CVA אמיתי", maxScore: 3 },
        { id: "N06-P2-A3", text: "הגנת airway אם הכרה ירודה", maxScore: 3 },
        { id: "N06-P2-A4", text: "תיעוד הפרכוס, נסיבות, עדי ראייה", maxScore: 3 },
      ]},
      { id: "N06-P3", title: "פינוי", actions: [
        { id: "N06-P3-A1", text: "Pre-alert – post-ictal weakness, היסטוריה, FAST", maxScore: 3 },
        { id: "N06-P3-A2", text: "פינוי לCT ראש – שלילת bleed", maxScore: 3 },
        { id: "N06-P3-A3", text: "ניטור שיפור נוירולוגי בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מתן lytics בחולה עם היסטוריית פרכוסים", "עיכוב פינוי", "לא בדק גלוקוז"],
    impression: ["Todd's paralysis", "post-ictal", "שלילת CVA", "lytics"],
  },
  {
    id: "N07", code: "N07", title: "המטומה תת-עכבישית (SDH)", badge: "🩹", category: "neuro",
    story: "גבר בן 78 על warfarin נפל ביתי. אמנזיה קצרה, כאב ראש מתגבר. כעת מנומנם ומבולבל.",
    vitals: { pulse: "58 סדיר", bp: "175/95", spo2: "96%", rr: "14" },
    phases: [
      { id: "N07-P1", title: "הערכה ראשונית", actions: [
        { id: "N07-P1-A1", text: "GCS serial, NIHSS, pupil check", maxScore: 3 },
        { id: "N07-P1-A2", text: "אנמנזה – warfarin, נפילה, אמנזיה", maxScore: 3 },
        { id: "N07-P1-A3", text: "Cushing's triad – BP גבוה, bradycardia, irregular breathing", maxScore: 3 },
        { id: "N07-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "N07-P2", title: "טיפול", actions: [
        { id: "N07-P2-A1", text: "ניהול airway – אינטובציה אם GCS≤8", maxScore: 3 },
        { id: "N07-P2-A2", text: "ראש 30° למעלה – הפחתת ICP", maxScore: 3 },
        { id: "N07-P2-A3", text: "מניטול 1g/kg IV אם herniation", maxScore: 3 },
        { id: "N07-P2-A4", text: "Reversal warfarin – K, FFP, PCC (ב-BH)", maxScore: 3 },
      ]},
      { id: "N07-P3", title: "פינוי", actions: [
        { id: "N07-P3-A1", text: "Pre-alert – SDH, warfarin, GCS, herniation signs", maxScore: 3 },
        { id: "N07-P3-A2", text: "פינוי לנוירוכירורגיה דחוף", maxScore: 3 },
        { id: "N07-P3-A3", text: "ניטור serial GCS, pupils", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא בדק Cushing's triad", "שכחת warfarin", "עיכוב פינוי לנוירוכירורגיה", "לא ראש 30°"],
    impression: ["SDH", "Cushing's triad", "warfarin", "נוירוכירורגיה"],
  },
  {
    id: "N08", code: "N08", title: "פציעת עמוד שדרה צווארי", badge: "🦴", category: "neuro",
    story: "גבר בן 22 לאחר קפיצה לבריכה רדודה. צוואר כאוב, חולשת ידיים ותחושת חוסר תחושה. הוא מסוגל לנשום.",
    vitals: { pulse: "58 סדיר", bp: "90/60", spo2: "96%", rr: "20 shallow" },
    phases: [
      { id: "N08-P1", title: "הערכה ראשונית", actions: [
        { id: "N08-P1-A1", text: "immobilization מוחלט – ידני ועם collar", maxScore: 3 },
        { id: "N08-P1-A2", text: "הערכה נוירולוגית – motor, sensory, level", maxScore: 3 },
        { id: "N08-P1-A3", text: "הכרה על neurogenic shock – BP נמוך + Brady", maxScore: 3 },
        { id: "N08-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "N08-P2", title: "טיפול", actions: [
        { id: "N08-P2-A1", text: "log roll מלא לכל תזוזה", maxScore: 3 },
        { id: "N08-P2-A2", text: "נוזלים IV לneurogenic shock", maxScore: 3 },
        { id: "N08-P2-A3", text: "norepi/atropine אם bradycardia קשה", maxScore: 3 },
        { id: "N08-P2-A4", text: "מניעת היפותרמיה – spinal injury", maxScore: 3 },
      ]},
      { id: "N08-P3", title: "פינוי", actions: [
        { id: "N08-P3-A1", text: "Spinal board + head blocks + collar + straps", maxScore: 3 },
        { id: "N08-P3-A2", text: "Pre-alert – SCI cervical, neurogenic shock, level", maxScore: 3 },
        { id: "N08-P3-A3", text: "פינוי לטראומה עם spinal center", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא immobilization", "לא זיהה neurogenic shock", "חוסר log roll"],
    impression: ["SCI", "neurogenic shock", "immobilization", "log roll"],
  },
  {
    id: "N09", code: "N09", title: "מנינגיטיס חיידקי חריף", badge: "🦠", category: "neuro",
    story: "סטודנטית בת 19 מגיעה עם כאב ראש עז, קשיון עורף, חום גבוה ופוטופוביה שהחלו לפני 6 שעות. פריחה פטכיאלית בגפיים.",
    vitals: { pulse: "118 סדיר", bp: "105/65", spo2: "97%", rr: "22", temp: "39.5°C" },
    phases: [
      { id: "N09-P1", title: "הערכה ראשונית", actions: [
        { id: "N09-P1-A1", text: "זיהוי classic triad – חום, קשיון עורף, שינוי הכרה", maxScore: 3 },
        { id: "N09-P1-A2", text: "בדיקת פריחה – purpura/petechiae = meningococcemia", maxScore: 3 },
        { id: "N09-P1-A3", text: "Kernig, Brudzinski signs", maxScore: 3 },
        { id: "N09-P1-A4", text: "O2, גישה ורידית, ניטור, בידוד", maxScore: 3 },
      ]},
      { id: "N09-P2", title: "טיפול", actions: [
        { id: "N09-P2-A1", text: "אנטיביוטיקה מיידית – כרבי IM/IV לפני CT", maxScore: 3 },
        { id: "N09-P2-A2", text: "דקסמתזון 0.15mg/kg IV לפני/עם אנטיביוטיקה", maxScore: 3 },
        { id: "N09-P2-A3", text: "נוזלים IV לתמיכה המודינמית", maxScore: 3 },
        { id: "N09-P2-A4", text: "ניטור GCS, pupil", maxScore: 3 },
      ]},
      { id: "N09-P3", title: "פינוי", actions: [
        { id: "N09-P3-A1", text: "Pre-alert – meningitis, purpura, אנטיביוטיקה", maxScore: 3 },
        { id: "N09-P3-A2", text: "פינוי דחוף לICU ואינפקציולוגיה", maxScore: 3 },
        { id: "N09-P3-A3", text: "דיווח בריאות הציבור – מחלה מידברת", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב אנטיביוטיקה לCT", "לא זיהה purpura", "לא בידוד", "שכח דקסמתזון"],
    impression: ["מנינגיטיס", "meningococcemia", "כרבי", "דקסמתזון"],
  },
  {
    id: "N10", code: "N10", title: "אנצפלופתיה Wernicke", badge: "🍺", category: "neuro",
    story: "גבר בן 48 אלכוהוליסט מגיע עם בלבול, הפרעת הליכה ועיניים לא מיושרות. נראה תת-תזונה.",
    vitals: { pulse: "98 סדיר", bp: "110/70", spo2: "96%", rr: "18" },
    phases: [
      { id: "N10-P1", title: "הערכה ראשונית", actions: [
        { id: "N10-P1-A1", text: "Wernicke triad – בלבול, ataxia, ophthalmoplegia", maxScore: 3 },
        { id: "N10-P1-A2", text: "גלוקומטר – גלוקוז לפני thiamine!", maxScore: 3 },
        { id: "N10-P1-A3", text: "אנמנזה – אלכוהול, תת-תזונה, הקאות", maxScore: 3 },
        { id: "N10-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "N10-P2", title: "טיפול", actions: [
        { id: "N10-P2-A1", text: "Thiamine 200mg IV לפני/במקביל גלוקוז!", maxScore: 3 },
        { id: "N10-P2-A2", text: "גלוקוז 50% IV אם היפוגליקמיה – רק אחרי thiamine", maxScore: 3 },
        { id: "N10-P2-A3", text: "נוזלים IV – saline, לא D5W בלי thiamine", maxScore: 3 },
        { id: "N10-P2-A4", text: "ניטור GCS, pupil", maxScore: 3 },
      ]},
      { id: "N10-P3", title: "פינוי", actions: [
        { id: "N10-P3-A1", text: "Pre-alert – Wernicke, אלכוהוליסט, thiamine", maxScore: 3 },
        { id: "N10-P3-A2", text: "פינוי לאינטרניסט/נוירולוגיה", maxScore: 3 },
        { id: "N10-P3-A3", text: "ניטור תגובה לthiamine", maxScore: 3 },
      ]},
    ],
    failCriteria: ["גלוקוז לפני thiamine", "D5W ללא thiamine", "לא זיהה Wernicke triad"],
    impression: ["Wernicke", "thiamine", "אלכוהול", "ophthalmoplegia"],
  },
  {
    id: "N11", code: "N11", title: "סטטוס אפילפטיקוס", badge: "⚡", category: "neuro",
    story: "גבר בן 35 עם אפילפסיה ידועה עם פרכוסים מתמשכים מעל 5 דקות. לא חוזר להכרה בין ההתקפים.",
    vitals: { pulse: "120", bp: "150/90", spo2: "88%", rr: "לא סדיר" },
    phases: [
      { id: "N11-P1", title: "הערכה ראשונית", actions: [
        { id: "N11-P1-A1", text: "הגנת airway – מיקום צד, שאיבה", maxScore: 3 },
        { id: "N11-P1-A2", text: "O2 high-flow, גישה ורידית/IO", maxScore: 3 },
        { id: "N11-P1-A3", text: "גלוקומטר – היפוגליקמיה גורם שכיח", maxScore: 3 },
        { id: "N11-P1-A4", text: "זמן פרכוס – >5 דקות = status", maxScore: 3 },
      ]},
      { id: "N11-P2", title: "טיפול", actions: [
        { id: "N11-P2-A1", text: "בנזודיאזפין: מידזולאם IM/IV או דיאזפם רקטלי", maxScore: 3 },
        { id: "N11-P2-A2", text: "חזרה אם ללא הפסקה ב-5 דקות – מנה שנייה", maxScore: 3 },
        { id: "N11-P2-A3", text: "Phenytoin 20mg/kg IV כ-second line", maxScore: 3 },
        { id: "N11-P2-A4", text: "אינטובציה RSI אם status refractory", maxScore: 3 },
      ]},
      { id: "N11-P3", title: "פינוי", actions: [
        { id: "N11-P3-A1", text: "Pre-alert – status epilepticus, תרופות, זמן", maxScore: 3 },
        { id: "N11-P3-A2", text: "פינוי לICU נוירולוגי", maxScore: 3 },
        { id: "N11-P3-A3", text: "ניטור GCS, פרכוסים, SpO2", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב בנזודיאזפין", "לא בדק גלוקוז", "לא זיהה status", "לא הגן airway"],
    impression: ["status epilepticus", "בנזודיאזפין", "Phenytoin", "airway"],
  },
  {
    id: "N12", code: "N12", title: "שינוי הכרה בקשיש", badge: "👴", category: "neuro",
    story: "גבר בן 82 בית אבות עם הכרה ירודה פתאומית. ביום קודם היה תקין. שתן כהה וחום קל.",
    vitals: { pulse: "105 חלש", bp: "100/60", spo2: "94%", rr: "20", temp: "38.2°C" },
    phases: [
      { id: "N12-P1", title: "הערכה ראשונית", actions: [
        { id: "N12-P1-A1", text: "AEIOU-TIPS – גורמי AMS", maxScore: 3 },
        { id: "N12-P1-A2", text: "גלוקומטר, SpO2, ECG, טמפרטורה", maxScore: 3 },
        { id: "N12-P1-A3", text: "FAST – שלילת CVA", maxScore: 3 },
        { id: "N12-P1-A4", text: "אנמנזה – תרופות, מחלות, שינויים", maxScore: 3 },
      ]},
      { id: "N12-P2", title: "טיפול", actions: [
        { id: "N12-P2-A1", text: "O2, נוזלים IV אם נמוך לחץ דם/sepsis", maxScore: 3 },
        { id: "N12-P2-A2", text: "גלוקוז אם היפוגליקמי", maxScore: 3 },
        { id: "N12-P2-A3", text: "ניטור ECG – AF/bradycardia", maxScore: 3 },
        { id: "N12-P2-A4", text: "הגנת airway – מניעת אספירציה", maxScore: 3 },
      ]},
      { id: "N12-P3", title: "פינוי", actions: [
        { id: "N12-P3-A1", text: "Pre-alert – AMS, קשיש, ספסיס?, גלוקוז", maxScore: 3 },
        { id: "N12-P3-A2", text: "פינוי לאבחון – CT ראש, תרביות, בדיקות", maxScore: 3 },
        { id: "N12-P3-A3", text: "ניטור GCS ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא בדק גלוקוז", "לא חשב על ספסיס", "עיכוב פינוי"],
    impression: ["AMS", "AEIOU-TIPS", "ספסיס", "גלוקוז"],
  },
  {
    id: "N13", code: "N13", title: "פריצת מוח (Brain Herniation)", badge: "💀", category: "neuro",
    story: "גבר בן 45 לאחר TBI בינוני. GCS יורד מ-13 ל-6 תוך שעה. אישון ימין מורחב וקבוע. Cushing's response.",
    vitals: { pulse: "48 סדיר", bp: "195/105", spo2: "93%", rr: "6 Cheyne-Stokes" },
    phases: [
      { id: "N13-P1", title: "הערכה ראשונית", actions: [
        { id: "N13-P1-A1", text: "GCS serial, pupil check – unilateral dilation = herniation", maxScore: 3 },
        { id: "N13-P1-A2", text: "Cushing's triad – hypertension, bradycardia, irregular respiration", maxScore: 3 },
        { id: "N13-P1-A3", text: "O2, ניהול airway דחוף", maxScore: 3 },
        { id: "N13-P1-A4", text: "ראש 30° למעלה, midline", maxScore: 3 },
      ]},
      { id: "N13-P2", title: "טיפול", actions: [
        { id: "N13-P2-A1", text: "RSI מיידי – GCS≤8 herniation", maxScore: 3 },
        { id: "N13-P2-A2", text: "Hyperventilation קצר – PaCO2 35, לא <30", maxScore: 3 },
        { id: "N13-P2-A3", text: "מניטול 1g/kg IV bolus", maxScore: 3 },
        { id: "N13-P2-A4", text: "NaCl 3% היפרטוני כאלטרנטיב", maxScore: 3 },
      ]},
      { id: "N13-P3", title: "פינוי", actions: [
        { id: "N13-P3-A1", text: "Pre-alert – brain herniation, GCS, pupils, Cushing's", maxScore: 3 },
        { id: "N13-P3-A2", text: "פינוי דחוף לנוירוכירורגיה", maxScore: 3 },
        { id: "N13-P3-A3", text: "ניטור EtCO2 בנסיעה – hyperventilation מבוקר", maxScore: 3 },
      ]},
    ],
    failCriteria: ["hyperventilation אגרסיבי", "לא ראש 30°", "עיכוב RSI", "לא מניטול"],
    impression: ["herniation", "Cushing's triad", "מניטול", "hyperventilation"],
  },
  {
    id: "N14", code: "N14", title: "היפוגליקמיה עם תסמינים נוירולוגיים", badge: "🍬", category: "neuro",
    story: "אישה בת 55 סוכרתית על אינסולין מגיעה עם בלבול, קשיות וחולשה חד-צדדית. גלוקוז 1.8.",
    vitals: { pulse: "112 סדיר", bp: "140/85", spo2: "97%", rr: "18" },
    phases: [
      { id: "N14-P1", title: "הערכה ראשונית", actions: [
        { id: "N14-P1-A1", text: "גלוקומטר מיידי – ALWAYS בAMS", maxScore: 3 },
        { id: "N14-P1-A2", text: "FAST – חולשה חד-צדדית: CVA vs hypoglycemia", maxScore: 3 },
        { id: "N14-P1-A3", text: "אנמנזה – אינסולין, אוכל, מחלה", maxScore: 3 },
        { id: "N14-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "N14-P2", title: "טיפול", actions: [
        { id: "N14-P2-A1", text: "גלוקוז 50% 50ml IV מיידי", maxScore: 3 },
        { id: "N14-P2-A2", text: "גלוקגון 1mg IM אם ללא גישה ורידית", maxScore: 3 },
        { id: "N14-P2-A3", text: "ניטור גלוקוז חוזר כל 15 דקות", maxScore: 3 },
        { id: "N14-P2-A4", text: "אוכל/שתיה לאחר השכלת הכרה", maxScore: 3 },
      ]},
      { id: "N14-P3", title: "פינוי", actions: [
        { id: "N14-P3-A1", text: "פינוי גם לאחר שיפור – תסמינים נוירולוגיים זקוקים לCT", maxScore: 3 },
        { id: "N14-P3-A2", text: "Pre-alert – hypoglycemia + neurological deficit, CT", maxScore: 3 },
        { id: "N14-P3-A3", text: "ניטור גלוקוז ו-FAST בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא בדק גלוקוז", "lytics ב-hypoglycemia", "שחרור ללא פינוי עם deficit"],
    impression: ["hypoglycemia", "גלוקוז", "FAST", "lytics"],
  },
  {
    id: "N15", code: "N15", title: "מיגרנה עם אאורה", badge: "👁️", category: "neuro",
    story: "אישה בת 30 עם מיגרנה ידועה עם אאורה ויזואלית. כאב ראש עז חד-צדדי, בחילה, ריגוש. לא הגיב לאיבופרופן.",
    vitals: { pulse: "88 סדיר", bp: "130/80", spo2: "99%", rr: "16" },
    phases: [
      { id: "N15-P1", title: "הערכה ראשונית", actions: [
        { id: "N15-P1-A1", text: "שלילת thunder clap headache – SAH", maxScore: 3 },
        { id: "N15-P1-A2", text: "FAST – שלילת CVA", maxScore: 3 },
        { id: "N15-P1-A3", text: "אנמנזה – מיגרנה ידועה, אאורה, תרופות", maxScore: 3 },
        { id: "N15-P1-A4", text: "גלוקומטר, ניטור, O2 אם נדרש", maxScore: 3 },
      ]},
      { id: "N15-P2", title: "טיפול", actions: [
        { id: "N15-P2-A1", text: "חדר חשוך ושקט, הפחתת גירויים", maxScore: 3 },
        { id: "N15-P2-A2", text: "מטוקלופרמיד 10mg IV – antiemetic + antimigraine", maxScore: 3 },
        { id: "N15-P2-A3", text: "פרוקטול/נפרוקסן IV אנלגזיה", maxScore: 3 },
        { id: "N15-P2-A4", text: "נוזלים IV – התייבשות שכיחה", maxScore: 3 },
      ]},
      { id: "N15-P3", title: "פינוי", actions: [
        { id: "N15-P3-A1", text: "פינוי לשלילת SAH אם thunder clap או ראשונה", maxScore: 3 },
        { id: "N15-P3-A2", text: "Pre-alert – מיגרנה vs SAH, FAST", maxScore: 3 },
        { id: "N15-P3-A3", text: "ניטור GCS, הופעת סימנים נוירולוגיים חדשים", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא שלל SAH", "lytics ב-migraine", "לא בדק FAST"],
    impression: ["מיגרנה", "SAH שלילה", "thunder clap", "מטוקלופרמיד"],
  },
  {
    id: "N16", code: "N16", title: "שיתוק Bell's – חשד CVA", badge: "😶", category: "neuro",
    story: "גבר בן 42 מגיע בפאניקה עם 'פרצוף עקום'. בדיקה מראה חולשת פנים כוללת צד ימין כולל מצח.",
    vitals: { pulse: "80 סדיר", bp: "125/80", spo2: "98%", rr: "16" },
    phases: [
      { id: "N16-P1", title: "הערכה ראשונית", actions: [
        { id: "N16-P1-A1", text: "FAST – הבחנה central vs peripheral facial palsy", maxScore: 3 },
        { id: "N16-P1-A2", text: "בדיקת מצח – חולשת מצח = peripheral (Bell's)", maxScore: 3 },
        { id: "N16-P1-A3", text: "שלילת תסמינים נוספים – CVA multi-system", maxScore: 3 },
        { id: "N16-P1-A4", text: "גלוקומטר, ניטור", maxScore: 3 },
      ]},
      { id: "N16-P2", title: "טיפול", actions: [
        { id: "N16-P2-A1", text: "הרגעת חולה – Bell's לא מסכן חיים", maxScore: 3 },
        { id: "N16-P2-A2", text: "הגנת עין – eye drops, לא לעצום עין מלא", maxScore: 3 },
        { id: "N16-P2-A3", text: "לא lytics – Bell's peripheral", maxScore: 3 },
        { id: "N16-P2-A4", text: "אם אי-ודאות – פינוי כ-CVA", maxScore: 3 },
      ]},
      { id: "N16-P3", title: "פינוי", actions: [
        { id: "N16-P3-A1", text: "פינוי לCT ושלילת CVA/מסה", maxScore: 3 },
        { id: "N16-P3-A2", text: "Pre-alert – facial palsy, peripheral?, CT", maxScore: 3 },
        { id: "N16-P3-A3", text: "ניטור לסימנים נוירולוגיים נוספים", maxScore: 3 },
      ]},
    ],
    failCriteria: ["lytics ב-Bell's", "לא בדק מצח להבחנה", "שחרור ללא פינוי"],
    impression: ["Bell's palsy", "central vs peripheral", "מצח", "CT שלילה"],
  },
  {
    id: "N17", code: "N17", title: "סינקופה – הערכה מלאה", badge: "😵", category: "neuro",
    story: "אישה בת 55 איבדה הכרה לכ-30 שניות בקניון. חזרה לעצמה לגמרי. כאב חזה קל לפני האירוע.",
    vitals: { pulse: "72 סדיר", bp: "120/75", spo2: "98%", rr: "16" },
    phases: [
      { id: "N17-P1", title: "הערכה ראשונית", actions: [
        { id: "N17-P1-A1", text: "אנמנזה מפורטת – לפני, במהלך, אחרי", maxScore: 3 },
        { id: "N17-P1-A2", text: "ECG – ריתמי, QT, WPW, HCM", maxScore: 3 },
        { id: "N17-P1-A3", text: "גלוקומטר, BP שכיבה/ישיבה – orthostatic", maxScore: 3 },
        { id: "N17-P1-A4", text: "FAST – שלילת נוירולוגי", maxScore: 3 },
      ]},
      { id: "N17-P2", title: "טיפול", actions: [
        { id: "N17-P2-A1", text: "אם ואגאלי – מיקום supine, רגליים מורמות", maxScore: 3 },
        { id: "N17-P2-A2", text: "נוזלים IV אם orthostatic/dehydration", maxScore: 3 },
        { id: "N17-P2-A3", text: "ריתמי ECG – אם cardiac cause", maxScore: 3 },
        { id: "N17-P2-A4", text: "O2, ניטור", maxScore: 3 },
      ]},
      { id: "N17-P3", title: "פינוי", actions: [
        { id: "N17-P3-A1", text: "כאב חזה לפני סינקופה = cardiac = פינוי חובה", maxScore: 3 },
        { id: "N17-P3-A2", text: "Pre-alert – syncope + chest pain, ECG, risky features", maxScore: 3 },
        { id: "N17-P3-A3", text: "ניטור ECG ברציפות בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["שחרור בלי ECG", "לא שלל cardiac cause", "עיכוב פינוי עם כאב חזה"],
    impression: ["סינקופה", "cardiac cause", "ECG", "orthostatic"],
  },
  {
    id: "N18", code: "N18", title: "דימום תת-עכבישי (SAH)", badge: "🩸", category: "neuro",
    story: "אישה בת 48 מתלוננת על 'כאב הראש החזק ביותר שאי פעם חשתי' שהחל פתאום. בחילה, קשיון עורף קל.",
    vitals: { pulse: "88 סדיר", bp: "175/100", spo2: "97%", rr: "18" },
    phases: [
      { id: "N18-P1", title: "הערכה ראשונית", actions: [
        { id: "N18-P1-A1", text: "זיהוי thunder clap headache – SAH עד שלא הוכח אחרת", maxScore: 3 },
        { id: "N18-P1-A2", text: "FAST, GCS, pupil check", maxScore: 3 },
        { id: "N18-P1-A3", text: "גלוקומטר, BP, ניטור", maxScore: 3 },
        { id: "N18-P1-A4", text: "O2, גישה ורידית", maxScore: 3 },
      ]},
      { id: "N18-P2", title: "טיפול", actions: [
        { id: "N18-P2-A1", text: "BP control זהיר – מטרה <160 systolic", maxScore: 3 },
        { id: "N18-P2-A2", text: "הגנת airway – GCS, aspiration risk", maxScore: 3 },
        { id: "N18-P2-A3", text: "לא lytics – דימום!", maxScore: 3 },
        { id: "N18-P2-A4", text: "אנלגזיה זהיר – לא מדכא הכרה", maxScore: 3 },
      ]},
      { id: "N18-P3", title: "פינוי", actions: [
        { id: "N18-P3-A1", text: "Pre-alert – thunder clap, SAH, BP, GCS", maxScore: 3 },
        { id: "N18-P3-A2", text: "פינוי לCT + LP + נוירוכירורגיה", maxScore: 3 },
        { id: "N18-P3-A3", text: "ניטור serial GCS, BP ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["lytics ב-SAH", "עיכוב פינוי", "לא זיהה thunder clap", "BP drop מהיר"],
    impression: ["SAH", "thunder clap", "CT LP", "BP control"],
  },
  {
    id: "T06", code: "T06", title: "טראומה חודרת – חזה", badge: "🔪", category: "trauma",
    story: "גבר בן 25 הגיע עם פצע דקירה בחזה שמאל. נשימה מאומצת, דם מהפצע, קולות לב מרוחקים.",
    vitals: { pulse: "120 חלש", bp: "90/60", spo2: "90%", rr: "28" },
    phases: [
      { id: "T06-P1", title: "הערכה ראשונית", actions: [
        { id: "T06-P1-A1", text: "MARCH – Massive hemorrhage, airway, breathing", maxScore: 3 },
        { id: "T06-P1-A2", text: "חבישת פצע חודר – occlusive dressing 3 צדדים", maxScore: 3 },
        { id: "T06-P1-A3", text: "האזנה – פנאומוטורקס מתח? טמפונדה?", maxScore: 3 },
        { id: "T06-P1-A4", text: "O2 high-flow, גישה ורידית x2", maxScore: 3 },
      ]},
      { id: "T06-P2", title: "טיפול", actions: [
        { id: "T06-P2-A1", text: "פנאומוטורקס מתח – ניקוב מחט מיידי", maxScore: 3 },
        { id: "T06-P2-A2", text: "טמפונדה – נוזלים, פינוי מיידי לניתוח", maxScore: 3 },
        { id: "T06-P2-A3", text: "נוזלים IV permissive hypotension – BP≥90 systolic", maxScore: 3 },
        { id: "T06-P2-A4", text: "חימום, מניעת coagulopathy", maxScore: 3 },
      ]},
      { id: "T06-P3", title: "פינוי", actions: [
        { id: "T06-P3-A1", text: "Pre-alert – penetrating chest, BP, טמפונדה/PTX", maxScore: 3 },
        { id: "T06-P3-A2", text: "פינוי מהיר לחדר ניתוח", maxScore: 3 },
        { id: "T06-P3-A3", text: "ניטור ברציפות, מוכנות לCPR", maxScore: 3 },
      ]},
    ],
    failCriteria: ["occlusive 4 צדדים – לחץ בנד", "עיכוב ניקוב בPTX מתח", "עומס נוזלים מוגזם", "עיכוב פינוי"],
    impression: ["penetrating chest", "occlusive dressing", "PTX מתח", "permissive hypotension"],
  },
  {
    id: "T07", code: "T07", title: "אוורור מעיים (Evisceration)", badge: "🩸", category: "trauma",
    story: "גבר בן 35 לאחר תאונת דרכים עם פצע בטן ואוורור מעיים. מעיים גלויים מחוץ לחלל הבטן.",
    vitals: { pulse: "115 חלש", bp: "95/60", spo2: "97%", rr: "22" },
    phases: [
      { id: "T07-P1", title: "הערכה ראשונית", actions: [
        { id: "T07-P1-A1", text: "MARCH – trauma primary survey", maxScore: 3 },
        { id: "T07-P1-A2", text: "כיסוי מעיים – חבישה לחה ולא להחזיר!", maxScore: 3 },
        { id: "T07-P1-A3", text: "O2, גישה ורידית x2", maxScore: 3 },
        { id: "T07-P1-A4", text: "הערכת נפח איבוד דם", maxScore: 3 },
      ]},
      { id: "T07-P2", title: "טיפול", actions: [
        { id: "T07-P2-A1", text: "חבישה לחה מלוחה (saline) על המעיים", maxScore: 3 },
        { id: "T07-P2-A2", text: "נוזלים IV permissive hypotension", maxScore: 3 },
        { id: "T07-P2-A3", text: "אנלגזיה IV – מורפין/קטמין", maxScore: 3 },
        { id: "T07-P2-A4", text: "מניעת היפותרמיה", maxScore: 3 },
      ]},
      { id: "T07-P3", title: "פינוי", actions: [
        { id: "T07-P3-A1", text: "Pre-alert – evisceration, BP, ניתוח דחוף", maxScore: 3 },
        { id: "T07-P3-A2", text: "פינוי מהיר לחדר ניתוח", maxScore: 3 },
        { id: "T07-P3-A3", text: "ניטור BP, SpO2 ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["החזרת מעיים לחלל", "חבישה יבשה", "עיכוב ניתוח", "נוזלים מוגזמים"],
    impression: ["evisceration", "חבישה לחה", "permissive hypotension", "ניתוח"],
  },
  {
    id: "T08", code: "T08", title: "פגיעת ראש טראומטית (TBI) חמורה", badge: "🧠", category: "trauma",
    story: "גבר בן 28 לאחר תאונת אופנוע. GCS 7, אישון שמאל מורחב. סימני fracture בסיס גולגולת.",
    vitals: { pulse: "55 סדיר", bp: "195/110", spo2: "93%", rr: "10 לא סדיר" },
    phases: [
      { id: "T08-P1", title: "הערכה ראשונית", actions: [
        { id: "T08-P1-A1", text: "ABCDE + trauma survey, C-spine immobilization", maxScore: 3 },
        { id: "T08-P1-A2", text: "GCS, pupil check, Cushing's response", maxScore: 3 },
        { id: "T08-P1-A3", text: "O2 high-flow, SPO2 מטרה >95%", maxScore: 3 },
        { id: "T08-P1-A4", text: "BP מטרה >90 systolic – מוח צריך CPP", maxScore: 3 },
      ]},
      { id: "T08-P2", title: "טיפול", actions: [
        { id: "T08-P2-A1", text: "RSI מיידי – GCS≤8", maxScore: 3 },
        { id: "T08-P2-A2", text: "EtCO2 מטרה 35-45 – לא hyperventilate", maxScore: 3 },
        { id: "T08-P2-A3", text: "מניטול 1g/kg IV אם herniation signs", maxScore: 3 },
        { id: "T08-P2-A4", text: "ראש 30°, midline, לא PEEP גבוה", maxScore: 3 },
      ]},
      { id: "T08-P3", title: "פינוי", actions: [
        { id: "T08-P3-A1", text: "Pre-alert – severe TBI, GCS, pupils, RSI", maxScore: 3 },
        { id: "T08-P3-A2", text: "פינוי לנוירוכירורגיה CT מיידי", maxScore: 3 },
        { id: "T08-P3-A3", text: "ניטור EtCO2, BP, GCS בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["היפוטנסיה לא מטופלת ב-TBI", "hyperventilation אגרסיבי", "עיכוב RSI", "שכחת C-spine"],
    impression: ["severe TBI", "RSI", "EtCO2", "מניטול"],
  },
  {
    id: "T09", code: "T09", title: "פציעת ריסוק (Crush Injury)", badge: "⚙️", category: "trauma",
    story: "גבר בן 45 נלכד תחת מכבש לפני שעה. גפה תחתונה שמאלית ריסוק. בשחרור הגפה חשש לתסמונת ריסוק.",
    vitals: { pulse: "108 סדיר", bp: "100/65", spo2: "95%", rr: "22" },
    phases: [
      { id: "T09-P1", title: "הערכה ראשונית", actions: [
        { id: "T09-P1-A1", text: "הערכת איברים – perfusion, sensation, motion", maxScore: 3 },
        { id: "T09-P1-A2", text: "גישה ורידית x2 לפני שחרור הריסוק", maxScore: 3 },
        { id: "T09-P1-A3", text: "ECG – היפרקלמיה (peaked T, wide QRS)", maxScore: 3 },
        { id: "T09-P1-A4", text: "ניטור BP, SpO2", maxScore: 3 },
      ]},
      { id: "T09-P2", title: "טיפול", actions: [
        { id: "T09-P2-A1", text: "נוזלים IV מאסיביים לפני שחרור – rhabdo flush", maxScore: 3 },
        { id: "T09-P2-A2", text: "נתרן ביקרבונאט – אלקליזציה שתן", maxScore: 3 },
        { id: "T09-P2-A3", text: "היפרקלמיה – גלוקונאט סידן IV", maxScore: 3 },
        { id: "T09-P2-A4", text: "חוסם עורקים לפני שחרור אם necessary", maxScore: 3 },
      ]},
      { id: "T09-P3", title: "פינוי", actions: [
        { id: "T09-P3-A1", text: "Pre-alert – crush, rhabdomyolysis, hyperkalemia, ECG", maxScore: 3 },
        { id: "T09-P3-A2", text: "פינוי לICU/כירורגיה – dialysis risk", maxScore: 3 },
        { id: "T09-P3-A3", text: "ניטור ECG ברציפות – היפרקלמיה arrythmia", maxScore: 3 },
      ]},
    ],
    failCriteria: ["שחרור ריסוק ללא גישה ורידית", "לא ניטר ECG", "לא נוזלים לפני שחרור"],
    impression: ["crush injury", "rhabdomyolysis", "hyperkalemia", "נוזלים מוקדמים"],
  },
  {
    id: "T10", code: "T10", title: "פציעת פיצוץ (Blast Injury)", badge: "💥", category: "trauma",
    story: "גבר בן 30 חייל לאחר פיצוץ. חירשות זמנית, hemotympanum, קוצר נשימה וכאב בטן. נראה תקין חיצונית.",
    vitals: { pulse: "105 סדיר", bp: "120/75", spo2: "94%", rr: "24" },
    phases: [
      { id: "T10-P1", title: "הערכה ראשונית", actions: [
        { id: "T10-P1-A1", text: "Blast injury 4 patterns – primary, secondary, tertiary, quaternary", maxScore: 3 },
        { id: "T10-P1-A2", text: "הערכת ריאות – blast lung", maxScore: 3 },
        { id: "T10-P1-A3", text: "הערכת TM, אוזניים, abdomen, extremities", maxScore: 3 },
        { id: "T10-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "T10-P2", title: "טיפול", actions: [
        { id: "T10-P2-A1", text: "O2 high-flow – blast lung/pneumothorax", maxScore: 3 },
        { id: "T10-P2-A2", text: "שמיעה ו-TM damage – documentation", maxScore: 3 },
        { id: "T10-P2-A3", text: "נוזלים זהיר – blast lung = ARDS risk", maxScore: 3 },
        { id: "T10-P2-A4", text: "פנאומוטורקס – ניקוב מחט אם tension signs", maxScore: 3 },
      ]},
      { id: "T10-P3", title: "פינוי", actions: [
        { id: "T10-P3-A1", text: "Pre-alert – blast injury, ריאות, SpO2, brain", maxScore: 3 },
        { id: "T10-P3-A2", text: "פינוי לטראומה – CT מלא", maxScore: 3 },
        { id: "T10-P3-A3", text: "ניטור SpO2, BP, GCS בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא זיהה blast lung", "נוזלים מוגזמים", "לא הערכה מלאה 4 patterns"],
    impression: ["blast injury", "blast lung", "ARDS", "primary/secondary"],
  },
  {
    id: "T11", code: "T11", title: "פוליטראומה – תאונת דרכים", badge: "🚗", category: "trauma",
    story: "אישה בת 35 במכונית שהתהפכה. לא חגרה חגורה. GCS 12, חשד לפגיעת בטן וCXR עם המוטורקס.",
    vitals: { pulse: "118 חלש", bp: "85/55", spo2: "90%", rr: "26" },
    phases: [
      { id: "T11-P1", title: "הערכה ראשונית", actions: [
        { id: "T11-P1-A1", text: "MARCH – Massive hemorrhage control", maxScore: 3 },
        { id: "T11-P1-A2", text: "C-spine immobilization, log roll", maxScore: 3 },
        { id: "T11-P1-A3", text: "Primary survey – ABCDE", maxScore: 3 },
        { id: "T11-P1-A4", text: "FAST – free fluid בטן, pericardial", maxScore: 3 },
      ]},
      { id: "T11-P2", title: "טיפול", actions: [
        { id: "T11-P2-A1", text: "RSI – GCS ירוד, airway protection", maxScore: 3 },
        { id: "T11-P2-A2", text: "נוזלים IV permissive hypotension", maxScore: 3 },
        { id: "T11-P2-A3", text: "hemothorax – ניקוב מחט PTX? צינור חזה בBH", maxScore: 3 },
        { id: "T11-P2-A4", text: "חימום, חוסם עורקים לפציעות גפיים", maxScore: 3 },
      ]},
      { id: "T11-P3", title: "פינוי", actions: [
        { id: "T11-P3-A1", text: "Pre-alert – polytrauma, GCS, BP, FAST positive", maxScore: 3 },
        { id: "T11-P3-A2", text: "פינוי לחדר טראומה – מוכן לניתוח", maxScore: 3 },
        { id: "T11-P3-A3", text: "ניטור ברציפות, תיעוד mechanism", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא C-spine", "נוזלים מוגזמים", "לא FAST", "עיכוב פינוי"],
    impression: ["polytrauma", "MARCH", "FAST", "permissive hypotension"],
  },
  {
    id: "T12", code: "T12", title: "קטיעה טראומטית", badge: "✂️", category: "trauma",
    story: "גבר בן 40 נלכד במכונה תעשייתית. יד שמאל נקטעה בשורש כף היד. דימום פעיל, חיוורון ועילפון.",
    vitals: { pulse: "130 חלש", bp: "80/50", spo2: "95%", rr: "24" },
    phases: [
      { id: "T12-P1", title: "הערכה ראשונית", actions: [
        { id: "T12-P1-A1", text: "חוסם עורקים מיידי מעל הקטיעה", maxScore: 3 },
        { id: "T12-P1-A2", text: "זמן הנחת חוסם עורקים – תיעוד!", maxScore: 3 },
        { id: "T12-P1-A3", text: "O2, גישה ורידית x2, ניטור", maxScore: 3 },
        { id: "T12-P1-A4", text: "שמירת הגפה הקטועה – קר ולח, לא קפוא", maxScore: 3 },
      ]},
      { id: "T12-P2", title: "טיפול", actions: [
        { id: "T12-P2-A1", text: "נוזלים IV aggressive – hemorrhagic shock", maxScore: 3 },
        { id: "T12-P2-A2", text: "חבישה לחיץ על גדם", maxScore: 3 },
        { id: "T12-P2-A3", text: "אנלגזיה IV – קטמין/מורפין", maxScore: 3 },
        { id: "T12-P2-A4", text: "גפה קטועה בשקית פלסטיק + קרח עטוף", maxScore: 3 },
      ]},
      { id: "T12-P3", title: "פינוי", actions: [
        { id: "T12-P3-A1", text: "Pre-alert – traumatic amputation, זמן, גפה שמורה", maxScore: 3 },
        { id: "T12-P3-A2", text: "פינוי לכירורגיה עם מרכז replantation", maxScore: 3 },
        { id: "T12-P3-A3", text: "ניטור BP, פינוי מהיר – golden hour", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא חוסם עורקים", "לא שמר גפה קטועה", "לא תיעד זמן חוסם", "עיכוב פינוי"],
    impression: ["קטיעה", "חוסם עורקים", "replantation", "golden hour"],
  },
  {
    id: "T13", code: "T13", title: "כוויות חמורות", badge: "🔥", category: "trauma",
    story: "אישה בת 30 עם כוויות 40% TBSA מדרגה שנייה ושלישית. נשאפה עשן. קול צרוד, ריסים שרופים.",
    vitals: { pulse: "120 סדיר", bp: "115/75", spo2: "96%", rr: "24" },
    phases: [
      { id: "T13-P1", title: "הערכה ראשונית", actions: [
        { id: "T13-P1-A1", text: "הערכת airway – stridor, ריסים שרופים", maxScore: 3 },
        { id: "T13-P1-A2", text: "O2 100% NRB – CO poisoning", maxScore: 3 },
        { id: "T13-P1-A3", text: "חישוב TBSA – rule of 9s", maxScore: 3 },
        { id: "T13-P1-A4", text: "גישה ורידית x2, ניטור", maxScore: 3 },
      ]},
      { id: "T13-P2", title: "טיפול", actions: [
        { id: "T13-P2-A1", text: "RSI מוקדם – inhalation injury airway", maxScore: 3 },
        { id: "T13-P2-A2", text: "Parkland formula – 4ml/kg/% TBSA ב-24h", maxScore: 3 },
        { id: "T13-P2-A3", text: "חבישה יבשה קרה – לא קרח", maxScore: 3 },
        { id: "T13-P2-A4", text: "אנלגזיה IV – קטמין/מורפין", maxScore: 3 },
      ]},
      { id: "T13-P3", title: "פינוי", actions: [
        { id: "T13-P3-A1", text: "Pre-alert – כוויות TBSA%, airway, CO, אינטובציה", maxScore: 3 },
        { id: "T13-P3-A2", text: "פינוי למרכז כוויות", maxScore: 3 },
        { id: "T13-P3-A3", text: "ניטור SpO2, BP, urine output הערכה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב RSI בinhalation injury", "קרח על כוויות", "לא Parkland", "לא CO2"],
    impression: ["כוויות", "TBSA", "inhalation injury", "Parkland"],
  },
  {
    id: "T14", code: "T14", title: "טראומת עמוד שדרה עם גירעון נוירולוגי", badge: "🦴", category: "trauma",
    story: "גבר בן 50 נפל מגובה 3 מטר על רגליו. כאב גב חמור וחולשת רגל ימין. Saddle anesthesia.",
    vitals: { pulse: "88 סדיר", bp: "120/80", spo2: "97%", rr: "18" },
    phases: [
      { id: "T14-P1", title: "הערכה ראשונית", actions: [
        { id: "T14-P1-A1", text: "Spinal immobilization – collar, backboard", maxScore: 3 },
        { id: "T14-P1-A2", text: "הערכה נוירולוגית – motor, sensory, reflexes", maxScore: 3 },
        { id: "T14-P1-A3", text: "Cauda equina – saddle anesthesia, bladder/bowel", maxScore: 3 },
        { id: "T14-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "T14-P2", title: "טיפול", actions: [
        { id: "T14-P2-A1", text: "log roll בכל תזוזה", maxScore: 3 },
        { id: "T14-P2-A2", text: "נוזלים IV – neurogenic shock?", maxScore: 3 },
        { id: "T14-P2-A3", text: "אנלגזיה זהיר – לא מסיר assessment", maxScore: 3 },
        { id: "T14-P2-A4", text: "מניעת היפותרמיה", maxScore: 3 },
      ]},
      { id: "T14-P3", title: "פינוי", actions: [
        { id: "T14-P3-A1", text: "Pre-alert – SCI, cauda equina, level, neurologic", maxScore: 3 },
        { id: "T14-P3-A2", text: "פינוי לנוירוכירורגיה – cauda equina emergency", maxScore: 3 },
        { id: "T14-P3-A3", text: "תיעוד נוירולוגי serial", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא immobilization", "לא זיהה cauda equina", "עיכוב ניתוח"],
    impression: ["SCI", "cauda equina", "saddle anesthesia", "immobilization"],
  },
  {
    id: "T15", code: "T15", title: "ירי בבטן", badge: "🔫", category: "trauma",
    story: "גבר בן 28 עם פצע ירי בבטן ימין. בטן רגישה, נוקשה. דימום פנימי מוחשד.",
    vitals: { pulse: "125 חלש", bp: "80/50", spo2: "96%", rr: "24" },
    phases: [
      { id: "T15-P1", title: "הערכה ראשונית", actions: [
        { id: "T15-P1-A1", text: "MARCH – דימום פנימי, לא מוציאים גוף זר", maxScore: 3 },
        { id: "T15-P1-A2", text: "FAST – free fluid", maxScore: 3 },
        { id: "T15-P1-A3", text: "O2, גישה ורידית x2", maxScore: 3 },
        { id: "T15-P1-A4", text: "מניין פצעי כניסה/יציאה", maxScore: 3 },
      ]},
      { id: "T15-P2", title: "טיפול", actions: [
        { id: "T15-P2-A1", text: "חבישה סטרילית על פצעים – לא לחץ חזק", maxScore: 3 },
        { id: "T15-P2-A2", text: "נוזלים permissive hypotension", maxScore: 3 },
        { id: "T15-P2-A3", text: "TXA 1g IV תוך שעה מהאירוע", maxScore: 3 },
        { id: "T15-P2-A4", text: "חימום, מניעת coagulopathy", maxScore: 3 },
      ]},
      { id: "T15-P3", title: "פינוי", actions: [
        { id: "T15-P3-A1", text: "Pre-alert – GSW abdomen, BP, FAST, TXA", maxScore: 3 },
        { id: "T15-P3-A2", text: "פינוי מהיר לניתוח – damage control", maxScore: 3 },
        { id: "T15-P3-A3", text: "ניטור BP, SpO2, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["הוצאת גוף זר", "נוזלים מוגזמים", "עיכוב TXA", "עיכוב פינוי"],
    impression: ["GSW abdomen", "TXA", "damage control", "permissive hypotension"],
  },
  {
    id: "T16", code: "T16", title: "נפילה מגובה – קשיש", badge: "👴", category: "trauma",
    story: "אישה בת 80 על warfarin נפלה מהמדרגות. כאב ראש, כאב צלעות ימין וסחרחורת. GCS 14.",
    vitals: { pulse: "88 סדיר", bp: "140/85", spo2: "95%", rr: "20" },
    phases: [
      { id: "T16-P1", title: "הערכה ראשונית", actions: [
        { id: "T16-P1-A1", text: "C-spine immobilization, ABCDE", maxScore: 3 },
        { id: "T16-P1-A2", text: "GCS serial, pupil check", maxScore: 3 },
        { id: "T16-P1-A3", text: "אנמנזה – warfarin, מינון, INR", maxScore: 3 },
        { id: "T16-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "T16-P2", title: "טיפול", actions: [
        { id: "T16-P2-A1", text: "ניהול airway – RSI אם GCS ירד", maxScore: 3 },
        { id: "T16-P2-A2", text: "Vitamin K IV, PCC – warfarin reversal בשדה", maxScore: 3 },
        { id: "T16-P2-A3", text: "אנלגזיה זהיר – לא NSAIDs", maxScore: 3 },
        { id: "T16-P2-A4", text: "ניטור GCS ברציפות – הידרדרות = SDH", maxScore: 3 },
      ]},
      { id: "T16-P3", title: "פינוי", actions: [
        { id: "T16-P3-A1", text: "Pre-alert – head trauma, warfarin, GCS, SDH risk", maxScore: 3 },
        { id: "T16-P3-A2", text: "פינוי לCT ראש ונוירוכירורגיה", maxScore: 3 },
        { id: "T16-P3-A3", text: "ניטור GCS, צלעות, SpO2", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא שקל warfarin", "לא C-spine", "עיכוב CT", "NSAIDs בקשיש"],
    impression: ["head trauma קשיש", "warfarin", "SDH", "C-spine"],
  },
  {
    id: "T17", code: "T17", title: "טראומת ילד – תאונת אופניים", badge: "🚲", category: "trauma",
    story: "ילד בן 10 פגע בהגה האופניים בבטן. כאב בטן עז, בחילה, ורידי צוואר תקינים. FAST חיובי.",
    vitals: { pulse: "130 סדיר", bp: "85/55", spo2: "97%", rr: "28" },
    phases: [
      { id: "T17-P1", title: "הערכה ראשונית", actions: [
        { id: "T17-P1-A1", text: "ABCDE ילד – וזן גיל, BP נורמלי", maxScore: 3 },
        { id: "T17-P1-A2", text: "FAST – hemoperitoneum", maxScore: 3 },
        { id: "T17-P1-A3", text: "גישה ורידית/IO, O2", maxScore: 3 },
        { id: "T17-P1-A4", text: "משקל ילד לחישוב נוזלים ותרופות", maxScore: 3 },
      ]},
      { id: "T17-P2", title: "טיפול", actions: [
        { id: "T17-P2-A1", text: "נוזלים 20ml/kg bolus IV/IO", maxScore: 3 },
        { id: "T17-P2-A2", text: "אנלגזיה ילדים – קטמין/מורפין במינון ילד", maxScore: 3 },
        { id: "T17-P2-A3", text: "TXA – >16kg כ-15mg/kg IV", maxScore: 3 },
        { id: "T17-P2-A4", text: "חימום, מניעת היפותרמיה", maxScore: 3 },
      ]},
      { id: "T17-P3", title: "פינוי", actions: [
        { id: "T17-P3-A1", text: "Pre-alert – pediatric trauma, hemoperitoneum, BP", maxScore: 3 },
        { id: "T17-P3-A2", text: "פינוי לחדר ניתוח ילדים", maxScore: 3 },
        { id: "T17-P3-A3", text: "ניטור BP, GCS, SpO2", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מינוני מבוגרים לילד", "לא FAST", "עיכוב פינוי", "נוזלים לא לפי משקל"],
    impression: ["pediatric trauma", "hemoperitoneum", "TXA", "משקל"],
  },
  {
    id: "T18", code: "T18", title: "היפותרמיה טראומטית", badge: "🥶", category: "trauma",
    story: "גבר בן 35 שנמצא חצוי בהר אחרי לילה. טמפרטורה 28°C, לא מגיב לגירויים, ECG מראה J waves.",
    vitals: { pulse: "40 לא סדיר", bp: "70/40", spo2: "88%", rr: "8" },
    phases: [
      { id: "T18-P1", title: "הערכה ראשונית", actions: [
        { id: "T18-P1-A1", text: "מדידת טמפרטורה תיקנית – rectal/esophageal", maxScore: 3 },
        { id: "T18-P1-A2", text: "ECG – J waves (Osborn waves), ריתמי", maxScore: 3 },
        { id: "T18-P1-A3", text: "לא הכרזת מוות – 'not dead until warm and dead'", maxScore: 3 },
        { id: "T18-P1-A4", text: "O2 חמים לחים, גישה ורידית", maxScore: 3 },
      ]},
      { id: "T18-P2", title: "טיפול", actions: [
        { id: "T18-P2-A1", text: "חימום פסיבי – בגדים רטובים, שמיכות", maxScore: 3 },
        { id: "T18-P2-A2", text: "נוזלים חמים IV 40°C", maxScore: 3 },
        { id: "T18-P2-A3", text: "CPR אם VF/PEA – AED אחרי חימום", maxScore: 3 },
        { id: "T18-P2-A4", text: "הימנע מתנועות חדות – arrhythmia", maxScore: 3 },
      ]},
      { id: "T18-P3", title: "פינוי", actions: [
        { id: "T18-P3-A1", text: "Pre-alert – severe hypothermia, ECMO warming center", maxScore: 3 },
        { id: "T18-P3-A2", text: "פינוי למרכז עם ECMO/rewarming", maxScore: 3 },
        { id: "T18-P3-A3", text: "ניטור טמפרטורה ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["הכרזת מוות מוקדמת", "נוזלים קרים", "AED לפני חימום", "תנועות חדות"],
    impression: ["היפותרמיה", "J waves", "ECMO", "not dead until warm"],
  },
  {
    id: "T19", code: "T19", title: "דקירת חזה + pneumothorax", badge: "🩺", category: "trauma",
    story: "אישה בת 22 עם פצע דקירה בחזה ימין. ירידה ב-air entry, BP יורד, טכיקרדיה גוברת. Tracheal deviation.",
    vitals: { pulse: "128 חלש", bp: "75/45", spo2: "86%", rr: "30" },
    phases: [
      { id: "T19-P1", title: "הערכה ראשונית", actions: [
        { id: "T19-P1-A1", text: "Tension pneumothorax – tracheal deviation, absent breath sounds", maxScore: 3 },
        { id: "T19-P1-A2", text: "ניקוב מחט מיידי – 2nd ICS MCL", maxScore: 3 },
        { id: "T19-P1-A3", text: "O2 high-flow, גישה ורידית", maxScore: 3 },
        { id: "T19-P1-A4", text: "occlusive dressing על פצע – 3 צדדים", maxScore: 3 },
      ]},
      { id: "T19-P2", title: "טיפול", actions: [
        { id: "T19-P2-A1", text: "ניקוב מחט עם אישור – השמעת אוויר", maxScore: 3 },
        { id: "T19-P2-A2", text: "נוזלים IV permissive hypotension", maxScore: 3 },
        { id: "T19-P2-A3", text: "הכנה לצינור חזה בבית חולים", maxScore: 3 },
        { id: "T19-P2-A4", text: "ניטור תגובה – SpO2, BP, mentation", maxScore: 3 },
      ]},
      { id: "T19-P3", title: "פינוי", actions: [
        { id: "T19-P3-A1", text: "Pre-alert – tension PTX, ניקוב, SpO2", maxScore: 3 },
        { id: "T19-P3-A2", text: "פינוי לכירורגיה – chest tube", maxScore: 3 },
        { id: "T19-P3-A3", text: "ניטור ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב ניקוב בtension PTX", "occlusive 4 צדדים", "לא זיהה tracheal deviation"],
    impression: ["tension PTX", "ניקוב מחט", "tracheal deviation", "occlusive 3-sided"],
  },
  {
    id: "T20", code: "T20", title: "טביעה טראומטית + היפותרמיה", badge: "🌊", category: "trauma",
    story: "גבר בן 35 חולץ מנהר קר אחרי תאונת סירה. טמפרטורה 30°C, ירידת הכרה, חשד לפגיעת ראש.",
    vitals: { pulse: "50 חלש", bp: "80/50", spo2: "85%", rr: "10" },
    phases: [
      { id: "T20-P1", title: "הערכה ראשונית", actions: [
        { id: "T20-P1-A1", text: "C-spine immobilization – trauma mechanism", maxScore: 3 },
        { id: "T20-P1-A2", text: "GCS, pupil check, ABCDE", maxScore: 3 },
        { id: "T20-P1-A3", text: "מדידת טמפרטורה, ECG", maxScore: 3 },
        { id: "T20-P1-A4", text: "O2, גישה ורידית/IO", maxScore: 3 },
      ]},
      { id: "T20-P2", title: "טיפול", actions: [
        { id: "T20-P2-A1", text: "ניהול airway – RSI עם C-spine precautions", maxScore: 3 },
        { id: "T20-P2-A2", text: "נוזלים חמים IV", maxScore: 3 },
        { id: "T20-P2-A3", text: "לא הכרזת מוות – היפותרמיה", maxScore: 3 },
        { id: "T20-P2-A4", text: "CPR אם נדרש", maxScore: 3 },
      ]},
      { id: "T20-P3", title: "פינוי", actions: [
        { id: "T20-P3-A1", text: "Pre-alert – drowning trauma, hypothermia, GCS, RSI", maxScore: 3 },
        { id: "T20-P3-A2", text: "פינוי לטראומה עם יכולת rewarming", maxScore: 3 },
        { id: "T20-P3-A3", text: "ניטור טמפרטורה, SpO2, GCS", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא C-spine", "הכרזת מוות מוקדמת", "נוזלים קרים", "עיכוב RSI"],
    impression: ["drowning trauma", "היפותרמיה", "C-spine", "rewarming"],
  },
  {
    id: "P04", code: "P04", title: "החייאת יילוד", badge: "👶", category: "pediatric",
    story: "יילוד נולד בשבוע 37 ללא ציוד בית חולים. לא בוכה, טון שרירים ירוד, צבע כחול. תפקיד: החייאת יילוד.",
    vitals: { pulse: "60", bp: "לא נמדד", spo2: "75%", rr: "0 – אפנאה" },
    phases: [
      { id: "P04-P1", title: "הערכה ראשונית", actions: [
        { id: "P04-P1-A1", text: "ייבוש וגירוי, שמירת חום", maxScore: 3 },
        { id: "P04-P1-A2", text: "הערכת נשימה ודופק – 60 שניות", maxScore: 3 },
        { id: "P04-P1-A3", text: "פתיחת נתיב אוויר – sniffing position", maxScore: 3 },
        { id: "P04-P1-A4", text: "Apgar score – 1 ו-5 דקות", maxScore: 3 },
      ]},
      { id: "P04-P2", title: "טיפול", actions: [
        { id: "P04-P2-A1", text: "PPV – BVM 40-60 נשימות/דקה, מסכה מתאימה", maxScore: 3 },
        { id: "P04-P2-A2", text: "אם דופק <60 – לחיצות חזה 3:1", maxScore: 3 },
        { id: "P04-P2-A3", text: "אינטובציה אם PPV לא יעיל", maxScore: 3 },
        { id: "P04-P2-A4", text: "אדרנלין IO/IV 0.01mg/kg אם דופק <60 לאחר לחיצות", maxScore: 3 },
        { id: "P04-P2-A5", text: "גלוקוז – בדיקה וטיפול", maxScore: 3 },
      ]},
      { id: "P04-P3", title: "פינוי", actions: [
        { id: "P04-P3-A1", text: "Pre-alert – neonatal resus, גיל הריון, Apgar, טיפול", maxScore: 3 },
        { id: "P04-P3-A2", text: "פינוי לNICU עם חימום", maxScore: 3 },
        { id: "P04-P3-A3", text: "ניטור ברציפות – SpO2, دل, גלוקוז", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא ייבוש וגירוי", "תדירות PPV שגויה", "עיכוב לחיצות חזה <60", "לא חימום"],
    impression: ["החייאת יילוד", "PPV", "Apgar", "NICU"],
  },
  {
    id: "P05", code: "P05", title: "פרכוס חום (Febrile Seizure)", badge: "🌡️", category: "pediatric",
    story: "ילדה בת 2 עם פרכוס גנרלי מתמשך 4 דקות בחום 39.5. ההורים מבוהלים. הפרכוס נפסק בהגיע צוות.",
    vitals: { pulse: "150 סדיר", bp: "90/55", spo2: "95%", rr: "24" },
    phases: [
      { id: "P05-P1", title: "הערכה ראשונית", actions: [
        { id: "P05-P1-A1", text: "בטיחות – מניעת פציעה בזמן פרכוס", maxScore: 3 },
        { id: "P05-P1-A2", text: "זמן פרכוס, אופי, גיל, חום", maxScore: 3 },
        { id: "P05-P1-A3", text: "ABCDE לאחר פרכוס – post-ictal assessment", maxScore: 3 },
        { id: "P05-P1-A4", text: "גלוקומטר, טמפרטורה, ניטור", maxScore: 3 },
      ]},
      { id: "P05-P2", title: "טיפול", actions: [
        { id: "P05-P2-A1", text: "אם פרכוס נמשך >5 דקות – מידזולאם IM/intranasal", maxScore: 3 },
        { id: "P05-P2-A2", text: "הורדת חום – פרצטמול/איבופרופן", maxScore: 3 },
        { id: "P05-P2-A3", text: "O2 אם SpO2 ירוד", maxScore: 3 },
        { id: "P05-P2-A4", text: "הרגעת הורים – febrile seizure בדרך כלל שפיר", maxScore: 3 },
      ]},
      { id: "P05-P3", title: "פינוי", actions: [
        { id: "P05-P3-A1", text: "פינוי לכל פרכוס חום ראשון לאבחון", maxScore: 3 },
        { id: "P05-P3-A2", text: "Pre-alert – febrile seizure, גיל, חום, משך", maxScore: 3 },
        { id: "P05-P3-A3", text: "ניטור לפרכוס חוזר, GCS", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא בדק גלוקוז", "עיכוב מידזולאם בפרכוס ממושך", "לא פינוי בפרכוס ראשון"],
    impression: ["febrile seizure", "מידזולאם", "חום", "אבחון ראשון"],
  },
  {
    id: "P06", code: "P06", title: "ברונכיוליטיס חריפה", badge: "🫁", category: "pediatric",
    story: "תינוק בן 3 חודשים עם נזלת מאתמול וקוצר נשימה הולך וגובר. שריקות בנשיפה, עבודת נשימה קשה.",
    vitals: { pulse: "160 סדיר", bp: "75/45", spo2: "90%", rr: "60" },
    phases: [
      { id: "P06-P1", title: "הערכה ראשונית", actions: [
        { id: "P06-P1-A1", text: "הערכת מאמץ נשימתי – nasal flaring, retractions", maxScore: 3 },
        { id: "P06-P1-A2", text: "O2 high-flow nasal cannula", maxScore: 3 },
        { id: "P06-P1-A3", text: "מינימום גירויים – תינוק מתגרה בקלות", maxScore: 3 },
        { id: "P06-P1-A4", text: "ניטור SpO2, HR, RR", maxScore: 3 },
      ]},
      { id: "P06-P2", title: "טיפול", actions: [
        { id: "P06-P2-A1", text: "O2 לפי SpO2 – מטרה >94%", maxScore: 3 },
        { id: "P06-P2-A2", text: "שאיבת אף עדינה", maxScore: 3 },
        { id: "P06-P2-A3", text: "High flow O2 nasal cannula – HFNC אם זמין", maxScore: 3 },
        { id: "P06-P2-A4", text: "שלילת ברונכיוליטיס RSV – ניהול תסמיני", maxScore: 3 },
      ]},
      { id: "P06-P3", title: "פינוי", actions: [
        { id: "P06-P3-A1", text: "Pre-alert – bronchiolitis, גיל, SpO2, HFNC", maxScore: 3 },
        { id: "P06-P3-A2", text: "פינוי לאשפוז – ניטור", maxScore: 3 },
        { id: "P06-P3-A3", text: "ניטור SpO2, HR ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["סלבוטמול – לא יעיל בברונכיוליטיס", "גירוי מוגזם", "לא O2"],
    impression: ["ברונכיוליטיס", "RSV", "HFNC", "O2"],
  },
  {
    id: "P07", code: "P07", title: "קרופ חמור בילד", badge: "🔔", category: "pediatric",
    story: "ילד בן 3 עם stridor חד בהשראה ונשיפה, שיעול נביחה וחיוורון. SpO2 ירוד, עבודת נשימה קשה.",
    vitals: { pulse: "145 סדיר", bp: "90/55", spo2: "91%", rr: "40" },
    phases: [
      { id: "P07-P1", title: "הערכה ראשונית", actions: [
        { id: "P07-P1-A1", text: "הרגעת ילד – distress מחמיר stridor", maxScore: 3 },
        { id: "P07-P1-A2", text: "O2 humidified blow-by", maxScore: 3 },
        { id: "P07-P1-A3", text: "Westley score – חומרת קרופ", maxScore: 3 },
        { id: "P07-P1-A4", text: "גישה ורידית – אם ניתן ללא distress", maxScore: 3 },
      ]},
      { id: "P07-P2", title: "טיפול", actions: [
        { id: "P07-P2-A1", text: "אדרנלין nebulizer 5ml (1:1000)", maxScore: 3 },
        { id: "P07-P2-A2", text: "דקסמתזון 0.6mg/kg IM/PO", maxScore: 3 },
        { id: "P07-P2-A3", text: "הכנה לאינטובציה – SpO2<90%", maxScore: 3 },
        { id: "P07-P2-A4", text: "Heliox אם זמין – הפחתת עבודת נשימה", maxScore: 3 },
      ]},
      { id: "P07-P3", title: "פינוי", actions: [
        { id: "P07-P3-A1", text: "Pre-alert – croup severe, גיל, SpO2, אדרנלין", maxScore: 3 },
        { id: "P07-P3-A2", text: "פינוי לאשפוז – rebound אדרנלין", maxScore: 3 },
        { id: "P07-P3-A3", text: "ניטור stridor, SpO2, GCS", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מסכה צמודה", "לא אדרנלין נבולייזר", "לא דקסמתזון", "עיכוב אינטובציה בSpO2<90%"],
    impression: ["קרופ חמור", "אדרנלין nebulizer", "דקסמתזון", "Westley"],
  },
  {
    id: "P08", code: "P08", title: "כוויות בילד", badge: "🔥", category: "pediatric",
    story: "ילד בן 4 שמשך מפה עם קנקן מים רותחים. כוויות 20% TBSA בטן ורגליים. בוכה בקול.",
    vitals: { pulse: "148 סדיר", bp: "92/60", spo2: "97%", rr: "32" },
    phases: [
      { id: "P08-P1", title: "הערכה ראשונית", actions: [
        { id: "P08-P1-A1", text: "קירור כוויה – מים פושרים 20 דקות", maxScore: 3 },
        { id: "P08-P1-A2", text: "TBSA ילד – Lund and Browder chart", maxScore: 3 },
        { id: "P08-P1-A3", text: "הערכת airway – שאיפה?", maxScore: 3 },
        { id: "P08-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "P08-P2", title: "טיפול", actions: [
        { id: "P08-P2-A1", text: "Parkland ילד – 3ml/kg/% TBSA ב-24h", maxScore: 3 },
        { id: "P08-P2-A2", text: "אנלגזיה – קטמין IV/IM, מינון ילד", maxScore: 3 },
        { id: "P08-P2-A3", text: "חבישה יבשה לחה – לא קרח", maxScore: 3 },
        { id: "P08-P2-A4", text: "מניעת היפותרמיה – ילדים מאבדים חום מהר", maxScore: 3 },
      ]},
      { id: "P08-P3", title: "פינוי", actions: [
        { id: "P08-P3-A1", text: "Pre-alert – pediatric burns, TBSA%, גיל, airway", maxScore: 3 },
        { id: "P08-P3-A2", text: "פינוי למרכז כוויות ילדים", maxScore: 3 },
        { id: "P08-P3-A3", text: "ניטור SpO2, BP, תגובה לנוזלים", maxScore: 3 },
      ]},
    ],
    failCriteria: ["קרח על כוויות", "לא קירור מים פושרים", "לא Parkland ילד", "חוסר חימום"],
    impression: ["כוויות ילד", "Lund and Browder", "Parkland", "קירור"],
  },
  {
    id: "P09", code: "P09", title: "התעללות בילד", badge: "⚠️", category: "pediatric",
    story: "ילד בן 3 הובא עם 'נפילה מהמדרגות'. שברים בשלבי ריפוי שונים ב-X ray. ההורים סותרים עצמם.",
    vitals: { pulse: "130 סדיר", bp: "80/50", spo2: "98%", rr: "28" },
    phases: [
      { id: "P09-P1", title: "הערכה ראשונית", actions: [
        { id: "P09-P1-A1", text: "הערכה רפואית מלאה – פציעות גלויות ונסתרות", maxScore: 3 },
        { id: "P09-P1-A2", text: "זיהוי סימני NAI – bruises multiple ages, burns, שברים", maxScore: 3 },
        { id: "P09-P1-A3", text: "ABCDE – stable? unstable?", maxScore: 3 },
        { id: "P09-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "P09-P2", title: "טיפול", actions: [
        { id: "P09-P2-A1", text: "טיפול פציעות כשגרה", maxScore: 3 },
        { id: "P09-P2-A2", text: "תיעוד מפורט – אנמנזה, פציעות, timeline", maxScore: 3 },
        { id: "P09-P2-A3", text: "לא להאשים – רישום עובדות בלבד", maxScore: 3 },
        { id: "P09-P2-A4", text: "הבטחת בטיחות ילד", maxScore: 3 },
      ]},
      { id: "P09-P3", title: "פינוי", actions: [
        { id: "P09-P3-A1", text: "פינוי לחדר ילדים + Pre-alert חשד NAI", maxScore: 3 },
        { id: "P09-P3-A2", text: "דיווח לרשויות – חוקי רנדל", maxScore: 3 },
        { id: "P09-P3-A3", text: "לא להשאיר ילד עם החשוד", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא זיהה NAI", "לא דיווח לרשויות", "השאיר ילד עם חשוד", "לא תיעוד"],
    impression: ["NAI", "child abuse", "דיווח", "תיעוד"],
  },
  {
    id: "P10", code: "P10", title: "הסתחפות מעיים (Intussusception)", badge: "🌀", category: "pediatric",
    story: "תינוק בן 9 חודשים עם כאב בטן קולקתי – בוכה קשות ואז שקט חוזר. צואה כדם דובדבן. בטן נרגשת.",
    vitals: { pulse: "150 סדיר", bp: "75/45", spo2: "98%", rr: "36" },
    phases: [
      { id: "P10-P1", title: "הערכה ראשונית", actions: [
        { id: "P10-P1-A1", text: "אנמנזה – colicky pain, current jelly stool", maxScore: 3 },
        { id: "P10-P1-A2", text: "בדיקת בטן – sausage mass ב-RUQ", maxScore: 3 },
        { id: "P10-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "P10-P1-A4", text: "FAST – שלילת free fluid", maxScore: 3 },
      ]},
      { id: "P10-P2", title: "טיפול", actions: [
        { id: "P10-P2-A1", text: "נוזלים IV 20ml/kg בנסיעה", maxScore: 3 },
        { id: "P10-P2-A2", text: "אנלגזיה – מורפין מינון ילד", maxScore: 3 },
        { id: "P10-P2-A3", text: "NPO – כירורגיה/enema", maxScore: 3 },
        { id: "P10-P2-A4", text: "ניטור פרפוזיה, mentation", maxScore: 3 },
      ]},
      { id: "P10-P3", title: "פינוי", actions: [
        { id: "P10-P3-A1", text: "Pre-alert – intussusception, גיל, current jelly, כירורגיה", maxScore: 3 },
        { id: "P10-P3-A2", text: "פינוי דחוף לכירורגיה ילדים", maxScore: 3 },
        { id: "P10-P3-A3", text: "ניטור SpO2, BP ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב פינוי", "לא זיהה current jelly stool", "לא נוזלים"],
    impression: ["intussusception", "current jelly stool", "sausage mass", "enema"],
  },
  {
    id: "P11", code: "P11", title: "DKA בילד", badge: "💉", category: "pediatric",
    story: "בן 12 עם סוכרת type 1 לא טופלת. כאב בטן, בחילה, נשימת Kussmaul ובריח acetone.",
    vitals: { pulse: "118 סדיר", bp: "90/55", spo2: "97%", rr: "32 עמוק" },
    phases: [
      { id: "P11-P1", title: "הערכה ראשונית", actions: [
        { id: "P11-P1-A1", text: "גלוקומטר – היפרגליקמיה, כיטוים", maxScore: 3 },
        { id: "P11-P1-A2", text: "הערכת הידרציה – turgor, mucous membranes", maxScore: 3 },
        { id: "P11-P1-A3", text: "Kussmaul breathing, acetone breath", maxScore: 3 },
        { id: "P11-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "P11-P2", title: "טיפול", actions: [
        { id: "P11-P2-A1", text: "נוזלים Normal Saline 10-20ml/kg – לא מהיר מדי!", maxScore: 3 },
        { id: "P11-P2-A2", text: "לא אינסולין בשדה ב-DKA ילד", maxScore: 3 },
        { id: "P11-P2-A3", text: "ניטור GCS – cerebral edema סיכון!", maxScore: 3 },
        { id: "P11-P2-A4", text: "ECG – היפרקלמיה/היפוקלמיה", maxScore: 3 },
      ]},
      { id: "P11-P3", title: "פינוי", actions: [
        { id: "P11-P3-A1", text: "Pre-alert – DKA ילד, גיל, גלוקוז, GCS", maxScore: 3 },
        { id: "P11-P3-A2", text: "פינוי לICU ילדים", maxScore: 3 },
        { id: "P11-P3-A3", text: "ניטור GCS, גלוקוז – cerebral edema", maxScore: 3 },
      ]},
    ],
    failCriteria: ["אינסולין בשדה", "נוזלים מהירים מדי – cerebral edema", "לא ניטור GCS"],
    impression: ["DKA ילד", "Kussmaul", "cerebral edema", "נוזלים הדרגתי"],
  },
  {
    id: "P12", code: "P12", title: "מנינגוקוקמיה", badge: "🔴", category: "pediatric",
    story: "תינוקת בת 18 חודשים עם חום גבוה ופריחה לא מתלבנת (non-blanching). נפוחה, עייפה, photophobia.",
    vitals: { pulse: "168 חלש", bp: "70/40", spo2: "94%", rr: "40" },
    phases: [
      { id: "P12-P1", title: "הערכה ראשונית", actions: [
        { id: "P12-P1-A1", text: "glass test – non-blanching rash = meningococcemia!", maxScore: 3 },
        { id: "P12-P1-A2", text: "הערכת הלם – septic shock", maxScore: 3 },
        { id: "P12-P1-A3", text: "O2 high-flow, IO/IV גישה מהירה", maxScore: 3 },
        { id: "P12-P1-A4", text: "בידוד", maxScore: 3 },
      ]},
      { id: "P12-P2", title: "טיפול", actions: [
        { id: "P12-P2-A1", text: "כרבי IM מיידי – לפני כל דבר אחר", maxScore: 3 },
        { id: "P12-P2-A2", text: "נוזלים 20ml/kg NS bolus", maxScore: 3 },
        { id: "P12-P2-A3", text: "דקסמתזון 0.15mg/kg IV", maxScore: 3 },
        { id: "P12-P2-A4", text: "RSI אם GCS ירוד", maxScore: 3 },
      ]},
      { id: "P12-P3", title: "פינוי", actions: [
        { id: "P12-P3-A1", text: "Pre-alert – meningococcemia, פריחה, הלם, כרבי", maxScore: 3 },
        { id: "P12-P3-A2", text: "פינוי דחוף לICU ילדים", maxScore: 3 },
        { id: "P12-P3-A3", text: "דיווח בריאות הציבור", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב כרבי", "לא glass test", "לא בידוד", "לא דיווח"],
    impression: ["meningococcemia", "non-blanching rash", "כרבי", "septic shock"],
  },
  {
    id: "P13", code: "P13", title: "אנפילקסיס בילד", badge: "🐝", category: "pediatric",
    story: "ילד בן 6 עם אלרגיה לאגוזים אכל עוגה. פניו נפוחים, שריקות, stridor, BP ירוד.",
    vitals: { pulse: "140 חלש", bp: "75/45", spo2: "90%", rr: "32" },
    phases: [
      { id: "P13-P1", title: "הערכה ראשונית", actions: [
        { id: "P13-P1-A1", text: "זיהוי אנפילקסיס – אלרגן, urticaria, bronchospasm", maxScore: 3 },
        { id: "P13-P1-A2", text: "מינון אדרנלין לילד – 0.01mg/kg IM (max 0.5mg)", maxScore: 3 },
        { id: "P13-P1-A3", text: "O2 high-flow, IO/IV", maxScore: 3 },
        { id: "P13-P1-A4", text: "ניטור SpO2, BP, stridor", maxScore: 3 },
      ]},
      { id: "P13-P2", title: "טיפול", actions: [
        { id: "P13-P2-A1", text: "אדרנלין 0.01mg/kg IM (1:1000)", maxScore: 3 },
        { id: "P13-P2-A2", text: "נוזלים NS 20ml/kg bolus", maxScore: 3 },
        { id: "P13-P2-A3", text: "סלבוטמול נבולייזר לברונכוספזם", maxScore: 3 },
        { id: "P13-P2-A4", text: "הידרוקורטיזון 4mg/kg IV", maxScore: 3 },
      ]},
      { id: "P13-P3", title: "פינוי", actions: [
        { id: "P13-P3-A1", text: "Pre-alert – אנפילקסיס ילד, גיל, אדרנלין, BP", maxScore: 3 },
        { id: "P13-P3-A2", text: "פינוי לניטור rebound", maxScore: 3 },
        { id: "P13-P3-A3", text: "מנה שנייה אדרנלין IM אחרי 5 דקות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["מינון מבוגר לילד", "עיכוב אדרנלין", "לא נוזלים", "לא ניטר rebound"],
    impression: ["אנפילקסיס ילד", "אדרנלין IM", "מינון משקל", "rebound"],
  },
  {
    id: "P14", code: "P14", title: "חסימת נתיב אוויר גוף זר", badge: "🍬", category: "pediatric",
    story: "ילד בן 3 נחנק מסוכריה. בוכה בלי קול, הוצאת אוויר מועטת, שפתיים כחולות.",
    vitals: { pulse: "160 סדיר", bp: "לא נמדד", spo2: "82%", rr: "לא יעיל" },
    phases: [
      { id: "P14-P1", title: "הערכה ראשונית", actions: [
        { id: "P14-P1-A1", text: "חסימה חלקית vs מלאה – silent cough = complete", maxScore: 3 },
        { id: "P14-P1-A2", text: "לא בדיקת אצבע עיוורת – מסוכן!", maxScore: 3 },
        { id: "P14-P1-A3", text: "שיטת Heimlich – >1 שנה, 5 abdominal thrusts", maxScore: 3 },
        { id: "P14-P1-A4", text: "גב ילד – 5 back blows", maxScore: 3 },
      ]},
      { id: "P14-P2", title: "טיפול", actions: [
        { id: "P14-P2-A1", text: "5 back blows + 5 chest thrusts (ילד>1 שנה)", maxScore: 3 },
        { id: "P14-P2-A2", text: "אם אובד הכרה – CPR ולארינגוסקופיה", maxScore: 3 },
        { id: "P14-P2-A3", text: "הסרת גוף זר בגרון אם גלוי", maxScore: 3 },
        { id: "P14-P2-A4", text: "O2, BVM אם נדרש", maxScore: 3 },
      ]},
      { id: "P14-P3", title: "פינוי", actions: [
        { id: "P14-P3-A1", text: "פינוי גם לאחר שחרור – חשד לגוף זר ריאות", maxScore: 3 },
        { id: "P14-P3-A2", text: "Pre-alert – FBAO ילד, גיל, SpO2, ניהול", maxScore: 3 },
        { id: "P14-P3-A3", text: "ניטור SpO2, נשימה בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["Heimlich ב-<1 שנה", "בדיקת אצבע עיוורת", "עיכוב פינוי אחרי שחרור"],
    impression: ["FBAO", "Heimlich", "back blows", "CPR אם חסר הכרה"],
  },
  {
    id: "P15", code: "P15", title: "פגיעת ראש בילד", badge: "🧠", category: "pediatric",
    story: "ילדה בת 7 נפלה מעץ. GCS 12, הקאות x3, עיניים שחורות. חשד לפגיעת בסיס גולגולת.",
    vitals: { pulse: "70 סדיר", bp: "100/60", spo2: "97%", rr: "18" },
    phases: [
      { id: "P15-P1", title: "הערכה ראשונית", actions: [
        { id: "P15-P1-A1", text: "C-spine immobilization ילד", maxScore: 3 },
        { id: "P15-P1-A2", text: "GCS ילד, pupils, Cushing's", maxScore: 3 },
        { id: "P15-P1-A3", text: "Battle's sign, raccoon eyes – base skull fracture", maxScore: 3 },
        { id: "P15-P1-A4", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "P15-P2", title: "טיפול", actions: [
        { id: "P15-P2-A1", text: "ניהול airway – RSI אם GCS≤8", maxScore: 3 },
        { id: "P15-P2-A2", text: "ראש 30° – ICP", maxScore: 3 },
        { id: "P15-P2-A3", text: "BP מטרה – MAP ≥ גיל+40 mmHg", maxScore: 3 },
        { id: "P15-P2-A4", text: "מניטול ילד 0.5g/kg IV אם herniation", maxScore: 3 },
      ]},
      { id: "P15-P3", title: "פינוי", actions: [
        { id: "P15-P3-A1", text: "Pre-alert – pediatric TBI, GCS, pupils, RSI", maxScore: 3 },
        { id: "P15-P3-A2", text: "פינוי לנוירוכירורגיה ילדים", maxScore: 3 },
        { id: "P15-P3-A3", text: "ניטור GCS serial, BP, EtCO2", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא C-spine", "לא RSI ב-GCS≤8", "לא ראש 30°", "עיכוב CT"],
    impression: ["pediatric TBI", "base skull fracture", "RSI", "מניטול"],
  },
  {
    id: "P16", code: "P16", title: "צהבת יילוד קריטית", badge: "💛", category: "pediatric",
    story: "יילוד בן 3 ימים עם צהבת גוברת, עייף מאד, לא אוכל ועוויתות קצרות. בילירובין גבוה מוחשד.",
    vitals: { pulse: "190 חלש", bp: "60/35", spo2: "93%", rr: "50 רדוד" },
    phases: [
      { id: "P16-P1", title: "הערכה ראשונית", actions: [
        { id: "P16-P1-A1", text: "הערכת צהבת – sclerae, skin, craniocaudal spread", maxScore: 3 },
        { id: "P16-P1-A2", text: "Bilirubin encephalopathy (kernicterus) – hypertonia", maxScore: 3 },
        { id: "P16-P1-A3", text: "GCS יילוד, O2, חימום", maxScore: 3 },
        { id: "P16-P1-A4", text: "גלוקוז, ניטור", maxScore: 3 },
      ]},
      { id: "P16-P2", title: "טיפול", actions: [
        { id: "P16-P2-A1", text: "O2, תמיכה נשימתית אם נדרש", maxScore: 3 },
        { id: "P16-P2-A2", text: "גלוקוז IV אם היפוגליקמיה", maxScore: 3 },
        { id: "P16-P2-A3", text: "מנה הוורידית לABO incompatibility – בית חולים", maxScore: 3 },
        { id: "P16-P2-A4", text: "חימום ומניעת hypothermia", maxScore: 3 },
      ]},
      { id: "P16-P3", title: "פינוי", actions: [
        { id: "P16-P3-A1", text: "Pre-alert – neonatal jaundice critical, kernicterus, גיל", maxScore: 3 },
        { id: "P16-P3-A2", text: "פינוי דחוף לNICU – exchange transfusion", maxScore: 3 },
        { id: "P16-P3-A3", text: "ניטור SpO2, גלוקוז, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב פינוי", "לא גלוקוז", "לא חימום", "לא זיהה kernicterus"],
    impression: ["kernicterus", "neonatal jaundice", "exchange transfusion", "NICU"],
  },
  {
    id: "P17", code: "P17", title: "הלם ספטי בילד", badge: "🦠", category: "pediatric",
    story: "ילד בן 5 עם חום 3 ימים. חיוור, עייף, זמן מילוי נימי 4 שניות. BP נמוך לגיל. שתן כהה.",
    vitals: { pulse: "160 חלש", bp: "70/40", spo2: "93%", rr: "40" },
    phases: [
      { id: "P17-P1", title: "הערכה ראשונית", actions: [
        { id: "P17-P1-A1", text: "הלם ספטי ילד – warm vs cold shock", maxScore: 3 },
        { id: "P17-P1-A2", text: "IO/IV מהיר – fluid resuscitation", maxScore: 3 },
        { id: "P17-P1-A3", text: "O2 high-flow, ניטור", maxScore: 3 },
        { id: "P17-P1-A4", text: "גלוקומטר", maxScore: 3 },
      ]},
      { id: "P17-P2", title: "טיפול", actions: [
        { id: "P17-P2-A1", text: "נוזלים 20ml/kg NS bolus – חזור אם ללא שיפור", maxScore: 3 },
        { id: "P17-P2-A2", text: "כרבי IV – wide spectrum", maxScore: 3 },
        { id: "P17-P2-A3", text: "RSI אם GCS ירוד", maxScore: 3 },
        { id: "P17-P2-A4", text: "Noradrenaline אם נוזלים נכשלים", maxScore: 3 },
      ]},
      { id: "P17-P3", title: "פינוי", actions: [
        { id: "P17-P3-A1", text: "Pre-alert – septic shock ילד, BP, כרבי, IO", maxScore: 3 },
        { id: "P17-P3-A2", text: "פינוי לICU ילדים", maxScore: 3 },
        { id: "P17-P3-A3", text: "ניטור BP, GCS, capillary refill", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב אנטיביוטיקה", "נוזלים לא לפי משקל", "לא IO ב-difficultaccess"],
    impression: ["septic shock ילד", "IO", "כרבי", "warm vs cold shock"],
  },
  {
    id: "P18", code: "P18", title: "טביעה ילד", badge: "🌊", category: "pediatric",
    story: "ילד בן 5 חולץ מבריכה אחרי שקיעה לכ-3 דקות. לא נושם, ללא דופק. ההורים בפאניקה.",
    vitals: { pulse: "0", bp: "לא נמדד", spo2: "לא נמדד", rr: "0" },
    phases: [
      { id: "P18-P1", title: "הערכה ראשונית", actions: [
        { id: "P18-P1-A1", text: "CPR ילד מיידי – 30:2 (2 מציל)", maxScore: 3 },
        { id: "P18-P1-A2", text: "5 rescue breaths ראשונות ב-drowning", maxScore: 3 },
        { id: "P18-P1-A3", text: "AED/Defib – VF?", maxScore: 3 },
        { id: "P18-P1-A4", text: "מדידת טמפרטורה – היפותרמיה", maxScore: 3 },
      ]},
      { id: "P18-P2", title: "טיפול", actions: [
        { id: "P18-P2-A1", text: "אינטובציה מהירה לאחר CPR", maxScore: 3 },
        { id: "P18-P2-A2", text: "IO/IV – אדרנלין 0.01mg/kg", maxScore: 3 },
        { id: "P18-P2-A3", text: "לא הכרזת מוות אם היפותרמי", maxScore: 3 },
        { id: "P18-P2-A4", text: "נוזלים חמים, חימום פעיל", maxScore: 3 },
      ]},
      { id: "P18-P3", title: "פינוי", actions: [
        { id: "P18-P3-A1", text: "Pre-alert – pediatric drowning, CPR, היפותרמיה, גיל", maxScore: 3 },
        { id: "P18-P3-A2", text: "פינוי לICU ילדים – ECMO?", maxScore: 3 },
        { id: "P18-P3-A3", text: "ניטור טמפרטורה, GCS, SpO2", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא 5 rescue breaths ראשונות", "הכרזת מוות היפותרמיה", "עיכוב CPR"],
    impression: ["pediatric drowning", "CPR", "rescue breaths", "היפותרמיה"],
  },
  {
    id: "O02", code: "O02", title: "שליה קדמית – דימום", badge: "🩸", category: "obstetric",
    story: "אישה בהריון שבוע 32 עם דימום ללא כאב – ורוד בהיר, ללא כאבי צירים. BP תקין. שליה קדמית ידועה.",
    vitals: { pulse: "105 סדיר", bp: "115/70", spo2: "97%", rr: "18" },
    phases: [
      { id: "O02-P1", title: "הערכה ראשונית", actions: [
        { id: "O02-P1-A1", text: "לא בדיקה נרתיקית – שליה קדמית!", maxScore: 3 },
        { id: "O02-P1-A2", text: "מיקום שמאל – IVC decompression", maxScore: 3 },
        { id: "O02-P1-A3", text: "כמות דימום, צבע, כאב", maxScore: 3 },
        { id: "O02-P1-A4", text: "O2, גישה ורידית x2, ניטור FHR אם ניתן", maxScore: 3 },
      ]},
      { id: "O02-P2", title: "טיפול", actions: [
        { id: "O02-P2-A1", text: "נוזלים IV לתמיכה המודינמית", maxScore: 3 },
        { id: "O02-P2-A2", text: "ניטור BP ודופק עוברי", maxScore: 3 },
        { id: "O02-P2-A3", text: "O2 high-flow לתמיכה עוברית", maxScore: 3 },
        { id: "O02-P2-A4", text: "לא פרוסטגלנדינים/טוקוליטים בשדה", maxScore: 3 },
      ]},
      { id: "O02-P3", title: "פינוי", actions: [
        { id: "O02-P3-A1", text: "Pre-alert – placenta previa, שבוע הריון, דימום, BP", maxScore: 3 },
        { id: "O02-P3-A2", text: "פינוי לחדר לידה/גינקולוגיה", maxScore: 3 },
        { id: "O02-P3-A3", text: "ניטור BP, דימום, FHR ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["בדיקה נרתיקית – שליה קדמית!", "לא מיקום שמאל", "עיכוב פינוי"],
    impression: ["placenta previa", "ללא בדיקה נרתיקית", "מיקום שמאל", "חדר לידה"],
  },
  {
    id: "O03", code: "O03", title: "צניחת חבל טבור", badge: "⚠️", category: "obstetric",
    story: "אישה בהריון שבוע 38 ציינה 'משהו יצא' עם פקיעת מים. חבל טבור גלוי בנרתיק. FHR ירוד.",
    vitals: { pulse: "110 סדיר", bp: "120/75", spo2: "98%", rr: "20" },
    phases: [
      { id: "O03-P1", title: "הערכה ראשונית", actions: [
        { id: "O03-P1-A1", text: "ראיית חבל טבור = צניחה – emergency!", maxScore: 3 },
        { id: "O03-P1-A2", text: "מיקום Knee-Chest לחץ על ראש עובר מהנרתיק", maxScore: 3 },
        { id: "O03-P1-A3", text: "FHR – דקיקות?", maxScore: 3 },
        { id: "O03-P1-A4", text: "O2 100% לאם", maxScore: 3 },
      ]},
      { id: "O03-P2", title: "טיפול", actions: [
        { id: "O03-P2-A1", text: "ידיים בנרתיק – הרמת הראש מהחבל!", maxScore: 3 },
        { id: "O03-P2-A2", text: "לא להחזיר חבל לנרתיק", maxScore: 3 },
        { id: "O03-P2-A3", text: "חבל עטוף בבד לח חמים", maxScore: 3 },
        { id: "O03-P2-A4", text: "מנח knee-chest כל הדרך לבית חולים", maxScore: 3 },
      ]},
      { id: "O03-P3", title: "פינוי", actions: [
        { id: "O03-P3-A1", text: "Pre-alert – cord prolapse, FHR, ניתוח קיסרי דחוף", maxScore: 3 },
        { id: "O03-P3-A2", text: "פינוי מהיר עם ידיים בנרתיק – לא לעזוב!", maxScore: 3 },
        { id: "O03-P3-A3", text: "ניטור FHR ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא הרמת ראש מהחבל", "החזרת חבל לנרתיק", "עיכוב פינוי"],
    impression: ["cord prolapse", "knee-chest", "הרמת ראש", "ניתוח קיסרי"],
  },
  {
    id: "O04", code: "O04", title: "תקיעת כתף (Shoulder Dystocia)", badge: "🚨", category: "obstetric",
    story: "לידה בשטח – ראש יצא אך כתפיים תקועות. תינוק לא יוצא. FHR יורד מהר.",
    vitals: { pulse: "100 סדיר", bp: "120/75", spo2: "97%", rr: "22" },
    phases: [
      { id: "O04-P1", title: "הערכה ראשונית", actions: [
        { id: "O04-P1-A1", text: "זיהוי shoulder dystocia – turtle sign, ראש לא מתקדם", maxScore: 3 },
        { id: "O04-P1-A2", text: "קריאת עזרה – צוות נוסף", maxScore: 3 },
        { id: "O04-P1-A3", text: "McRoberts maneuver – גמישות ירך מקסימלית", maxScore: 3 },
        { id: "O04-P1-A4", text: "O2 100% לאם, ניטור", maxScore: 3 },
      ]},
      { id: "O04-P2", title: "טיפול", actions: [
        { id: "O04-P2-A1", text: "לחץ suprapubic – לא fundal pressure!", maxScore: 3 },
        { id: "O04-P2-A2", text: "McRoberts + לחץ suprapubic = שיטה ראשונה", maxScore: 3 },
        { id: "O04-P2-A3", text: "Rubin II / Wood screw maneuver אם ראשון נכשל", maxScore: 3 },
        { id: "O04-P2-A4", text: "Gaskin – כל ארבע (all-fours) אם אחרים נכשלים", maxScore: 3 },
      ]},
      { id: "O04-P3", title: "פינוי", actions: [
        { id: "O04-P3-A1", text: "Pre-alert – shoulder dystocia, FHR, נסיונות, שבוע", maxScore: 3 },
        { id: "O04-P3-A2", text: "פינוי מהיר לחדר לידה", maxScore: 3 },
        { id: "O04-P3-A3", text: "תיעוד כל maneuver ותוצאה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["fundal pressure – מחמיר!", "לא McRoberts ראשון", "עיכוב עזרה"],
    impression: ["shoulder dystocia", "McRoberts", "suprapubic pressure", "Gaskin"],
  },
  {
    id: "O05", code: "O05", title: "דימום לאחר לידה (PPH)", badge: "🩸", category: "obstetric",
    story: "לידה ספונטנית השלמה. 30 דקות לאחר לידה דימום מאסיבי מהרחם. שליה יצאה. BP יורד.",
    vitals: { pulse: "120 חלש", bp: "85/50", spo2: "95%", rr: "24" },
    phases: [
      { id: "O05-P1", title: "הערכה ראשונית", actions: [
        { id: "O05-P1-A1", text: "הערכת הלם היפוולמי – 4Ts: tone, trauma, tissue, thrombin", maxScore: 3 },
        { id: "O05-P1-A2", text: "גישה ורידית x2, O2 high-flow", maxScore: 3 },
        { id: "O05-P1-A3", text: "בדיקת רחם – atony?", maxScore: 3 },
        { id: "O05-P1-A4", text: "ניטור BP, SpO2, mentation", maxScore: 3 },
      ]},
      { id: "O05-P2", title: "טיפול", actions: [
        { id: "O05-P2-A1", text: "עיסוי רחם bimanual אם atony", maxScore: 3 },
        { id: "O05-P2-A2", text: "אוקסיטוצין 10 IU IM – uterotonics", maxScore: 3 },
        { id: "O05-P2-A3", text: "נוזלים IV מאסיביים – blood products בית חולים", maxScore: 3 },
        { id: "O05-P2-A4", text: "TXA 1g IV תוך 3 שעות מלידה", maxScore: 3 },
      ]},
      { id: "O05-P3", title: "פינוי", actions: [
        { id: "O05-P3-A1", text: "Pre-alert – PPH, אוקסיטוצין, BP, TXA", maxScore: 3 },
        { id: "O05-P3-A2", text: "פינוי מהיר לחדר ניתוח/כלי דם", maxScore: 3 },
        { id: "O05-P3-A3", text: "ניטור BP, Hb, mentation ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא אוקסיטוצין", "לא TXA", "עיכוב פינוי", "לא עיסוי רחם"],
    impression: ["PPH", "4Ts", "אוקסיטוצין", "TXA"],
  },
  {
    id: "O06", code: "O06", title: "הריון חוץ-רחמי", badge: "⚠️", category: "obstetric",
    story: "אישה בת 28 עם אמנוריאה 8 שבועות. כאב בטן ימין חמור ודימום נרתיקי. BP נמוך. ייתכן הריון חוץ-רחמי.",
    vitals: { pulse: "118 חלש", bp: "85/55", spo2: "96%", rr: "22" },
    phases: [
      { id: "O06-P1", title: "הערכה ראשונית", actions: [
        { id: "O06-P1-A1", text: "חשד הריון חוץ-רחמי – כאב, אמנוריאה, דימום", maxScore: 3 },
        { id: "O06-P1-A2", text: "FAST – free fluid בטן", maxScore: 3 },
        { id: "O06-P1-A3", text: "O2, גישה ורידית x2", maxScore: 3 },
        { id: "O06-P1-A4", text: "ניטור BP – הלם!", maxScore: 3 },
      ]},
      { id: "O06-P2", title: "טיפול", actions: [
        { id: "O06-P2-A1", text: "נוזלים IV aggressive – הלם היפוולמי", maxScore: 3 },
        { id: "O06-P2-A2", text: "TXA 1g IV", maxScore: 3 },
        { id: "O06-P2-A3", text: "O2 high-flow, מיקום supine", maxScore: 3 },
        { id: "O06-P2-A4", text: "ניטור BP, SpO2 ברציפות", maxScore: 3 },
      ]},
      { id: "O06-P3", title: "פינוי", actions: [
        { id: "O06-P3-A1", text: "Pre-alert – suspected ectopic, BP, FAST positive", maxScore: 3 },
        { id: "O06-P3-A2", text: "פינוי דחוף לגינקולוגיה/ניתוח", maxScore: 3 },
        { id: "O06-P3-A3", text: "ניטור BP, mentation ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב פינוי", "לא FAST", "נוזלים לא מספיק", "לא TXA"],
    impression: ["ectopic pregnancy", "הלם", "FAST", "TXA"],
  },
  {
    id: "O07", code: "O07", title: "HELLP Syndrome", badge: "🔴", category: "obstetric",
    story: "אישה בהריון שבוע 33 עם כאב RUQ, בחילה, ראיה מטושטשת ו-BP גבוה. בדיקות – PLT ירוד, LFT גבוה.",
    vitals: { pulse: "95 סדיר", bp: "175/110", spo2: "97%", rr: "18" },
    phases: [
      { id: "O07-P1", title: "הערכה ראשונית", actions: [
        { id: "O07-P1-A1", text: "HELLP – Hemolysis, EL, LP", maxScore: 3 },
        { id: "O07-P1-A2", text: "BP, כאב RUQ, שינוי ראיה", maxScore: 3 },
        { id: "O07-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "O07-P1-A4", text: "FAST – liver hematoma/rupture", maxScore: 3 },
      ]},
      { id: "O07-P2", title: "טיפול", actions: [
        { id: "O07-P2-A1", text: "מגנזיום סולפט 4g IV loading dose", maxScore: 3 },
        { id: "O07-P2-A2", text: "הורדת BP זהיר – labetalol/hydralazine", maxScore: 3 },
        { id: "O07-P2-A3", text: "מיקום שמאל", maxScore: 3 },
        { id: "O07-P2-A4", text: "ניטור תסמינים – פרכוסים?", maxScore: 3 },
      ]},
      { id: "O07-P3", title: "פינוי", actions: [
        { id: "O07-P3-A1", text: "Pre-alert – HELLP, BP, מגנזיום, שבוע הריון", maxScore: 3 },
        { id: "O07-P3-A2", text: "פינוי לחדר לידה בכח", maxScore: 3 },
        { id: "O07-P3-A3", text: "ניטור BP, פרכוסים, FHR", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא מגנזיום", "הורדת BP מהירה", "לא מיקום שמאל", "עיכוב פינוי"],
    impression: ["HELLP", "מגנזיום", "labetalol", "liver rupture"],
  },
  {
    id: "O08", code: "O08", title: "הקאות מוחצן בהריון", badge: "🤢", category: "obstetric",
    story: "אישה בהריון שבוע 10 עם הקאות מרובות 4 ימים. חולשה קשה, שתן כהה, טורגור עור ירוד.",
    vitals: { pulse: "118 חלש", bp: "95/60", spo2: "98%", rr: "20" },
    phases: [
      { id: "O08-P1", title: "הערכה ראשונית", actions: [
        { id: "O08-P1-A1", text: "Hyperemesis gravidarum – >3% ירידת משקל, ketonuria", maxScore: 3 },
        { id: "O08-P1-A2", text: "הערכת התייבשות – mucous membranes, turgor, urine", maxScore: 3 },
        { id: "O08-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "O08-P1-A4", text: "גלוקומטר – hyperemesis + hypoglycemia", maxScore: 3 },
      ]},
      { id: "O08-P2", title: "טיפול", actions: [
        { id: "O08-P2-A1", text: "נוזלים IV NS 500ml בנסיעה", maxScore: 3 },
        { id: "O08-P2-A2", text: "מטוקלופרמיד 10mg IV antiemetic", maxScore: 3 },
        { id: "O08-P2-A3", text: "Thiamine לפני גלוקוז – Wernicke risk", maxScore: 3 },
        { id: "O08-P2-A4", text: "נוחות חולה, הרגעה", maxScore: 3 },
      ]},
      { id: "O08-P3", title: "פינוי", actions: [
        { id: "O08-P3-A1", text: "Pre-alert – hyperemesis, התייבשות, שבוע", maxScore: 3 },
        { id: "O08-P3-A2", text: "פינוי לאשפוז גינקולוגיה", maxScore: 3 },
        { id: "O08-P3-A3", text: "ניטור SpO2, BP, GCS", maxScore: 3 },
      ]},
    ],
    failCriteria: ["גלוקוז לפני thiamine", "לא נוזלים", "לא antiemetic"],
    impression: ["hyperemesis", "התייבשות", "thiamine", "antiemetic"],
  },
  {
    id: "O09", code: "O09", title: "לידה מואצת בשטח", badge: "👶", category: "obstetric",
    story: "אישה בהריון 40 שבועות. מרחק גדול מבית החולים. צירים כל 2 דקות, תחושת דחיפה, ראש נראה.",
    vitals: { pulse: "95 סדיר", bp: "120/75", spo2: "98%", rr: "20" },
    phases: [
      { id: "O09-P1", title: "הערכה ראשונית", actions: [
        { id: "O09-P1-A1", text: "הערכת שלב לידה – crowning, rupture of membranes", maxScore: 3 },
        { id: "O09-P1-A2", text: "הכנת ציוד לידה – clamps x2, גזה, שמיכה", maxScore: 3 },
        { id: "O09-P1-A3", text: "O2, גישה ורידית לאם", maxScore: 3 },
        { id: "O09-P1-A4", text: "FHR ניטור", maxScore: 3 },
      ]},
      { id: "O09-P2", title: "טיפול", actions: [
        { id: "O09-P2-A1", text: "תמיכת ראש עדינה – לא למשוך!", maxScore: 3 },
        { id: "O09-P2-A2", text: "בדיקת חבל צוואר – loop around neck", maxScore: 3 },
        { id: "O09-P2-A3", text: "לידת כתפיים – anterior shoulder ראשון", maxScore: 3 },
        { id: "O09-P2-A4", text: "הערכת ילוד – Apgar, חימום, ייבוש", maxScore: 3 },
      ]},
      { id: "O09-P3", title: "פינוי", actions: [
        { id: "O09-P3-A1", text: "Pre-alert – field delivery, Apgar, שליה?", maxScore: 3 },
        { id: "O09-P3-A2", text: "פינוי לחדר לידה – אם ושליה", maxScore: 3 },
        { id: "O09-P3-A3", text: "ניטור PPH, FHR ילוד, Apgar", maxScore: 3 },
      ]},
    ],
    failCriteria: ["משיכת ראש", "לא בדיקת חבל צוואר", "לא חימום ילוד", "עיכוב הכנה"],
    impression: ["field delivery", "Apgar", "תמיכת ראש", "PPH"],
  },
  {
    id: "O10", code: "O10", title: "לידה בבהוצגה רגלית", badge: "🦶", category: "obstetric",
    story: "אישה בהריון 38 שבועות עם לידה מואצת. לא ראש – רגליים מוצגות. FHR ירוד.",
    vitals: { pulse: "100 סדיר", bp: "120/75", spo2: "97%", rr: "22" },
    phases: [
      { id: "O10-P1", title: "הערכה ראשונית", actions: [
        { id: "O10-P1-A1", text: "הצגה רגלית – breech presentation זיהוי", maxScore: 3 },
        { id: "O10-P1-A2", text: "O2, גישה ורידית, קריאת עזרה", maxScore: 3 },
        { id: "O10-P1-A3", text: "FHR ניטור ברציפות", maxScore: 3 },
        { id: "O10-P1-A4", text: "אם ניתן – עצור לידה ופנה מיידית", maxScore: 3 },
      ]},
      { id: "O10-P2", title: "טיפול", actions: [
        { id: "O10-P2-A1", text: "לא לעצור – לידה ספונטנית ברגליים אם כבר מתקדמת", maxScore: 3 },
        { id: "O10-P2-A2", text: "תמיכת גוף ילד – לא למשוך!", maxScore: 3 },
        { id: "O10-P2-A3", text: "Mauriceau-Smellie-Veit לראש", maxScore: 3 },
        { id: "O10-P2-A4", text: "ניטור asphyxia, חימום ילוד", maxScore: 3 },
      ]},
      { id: "O10-P3", title: "פינוי", actions: [
        { id: "O10-P3-A1", text: "Pre-alert – breech delivery, FHR, ניתוח קיסרי?", maxScore: 3 },
        { id: "O10-P3-A2", text: "פינוי מהיר", maxScore: 3 },
        { id: "O10-P3-A3", text: "ניטור ילוד, Apgar, SpO2", maxScore: 3 },
      ]},
    ],
    failCriteria: ["משיכת ילד ברגליים", "לא Mauriceau לראש", "עיכוב פינוי"],
    impression: ["breech", "Mauriceau", "לא למשוך", "asphyxia"],
  },
  {
    id: "O11", code: "O11", title: "תסחיף מי שפיר", badge: "💨", category: "obstetric",
    story: "אישה בלידה פתאום קורסת – קוצר נשימה קשה, BP אפסי, ציאנוזה. מיד לאחר ניקוב מי שפיר.",
    vitals: { pulse: "150 חלש", bp: "60/30", spo2: "78%", rr: "40" },
    phases: [
      { id: "O11-P1", title: "הערכה ראשונית", actions: [
        { id: "O11-P1-A1", text: "זיהוי AFE – תחילה קטסטרופלית, intrapartum", maxScore: 3 },
        { id: "O11-P1-A2", text: "CPR אם cardiac arrest", maxScore: 3 },
        { id: "O11-P1-A3", text: "O2 100%, גישה ורידית x2", maxScore: 3 },
        { id: "O11-P1-A4", text: "ניטור ברציפות", maxScore: 3 },
      ]},
      { id: "O11-P2", title: "טיפול", actions: [
        { id: "O11-P2-A1", text: "נוזלים IV aggressive, וזופרסורים", maxScore: 3 },
        { id: "O11-P2-A2", text: "RSI – airway protection", maxScore: 3 },
        { id: "O11-P2-A3", text: "CPR בצד שמאל 15°, נפרסץ מיידי", maxScore: 3 },
        { id: "O11-P2-A4", text: "דיסקוסיה DIC – blood products בית חולים", maxScore: 3 },
      ]},
      { id: "O11-P3", title: "פינוי", actions: [
        { id: "O11-P3-A1", text: "Pre-alert – AFE, cardiac arrest, pregnancy", maxScore: 3 },
        { id: "O11-P3-A2", text: "פינוי מהיר לICU מיילדות", maxScore: 3 },
        { id: "O11-P3-A3", text: "ניטור מאוד פעיל", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב CPR", "לא RSI", "לא נפרסץ מיידי", "עיכוב פינוי"],
    impression: ["AFE", "amniotic fluid embolism", "CPR הריון", "DIC"],
  },
  {
    id: "O12", code: "O12", title: "חירום סוכרת בהריון", badge: "💉", category: "obstetric",
    story: "אישה בהריון שבוע 28 עם GDM מגיעה עם בלבול ורעד. גלוקוז 2.1. אינסולין ולא אכלה.",
    vitals: { pulse: "110 סדיר", bp: "115/70", spo2: "98%", rr: "18" },
    phases: [
      { id: "O12-P1", title: "הערכה ראשונית", actions: [
        { id: "O12-P1-A1", text: "גלוקומטר מיידי – ALWAYS בAMS הריון", maxScore: 3 },
        { id: "O12-P1-A2", text: "הערכת FHR", maxScore: 3 },
        { id: "O12-P1-A3", text: "O2, גישה ורידית, מיקום שמאל", maxScore: 3 },
        { id: "O12-P1-A4", text: "ניטור SpO2, BP, mentation", maxScore: 3 },
      ]},
      { id: "O12-P2", title: "טיפול", actions: [
        { id: "O12-P2-A1", text: "גלוקוז 50% 50ml IV – hypoglycemia הריון", maxScore: 3 },
        { id: "O12-P2-A2", text: "בדיקת גלוקוז 15 דקות לאחר גלוקוז", maxScore: 3 },
        { id: "O12-P2-A3", text: "O2 לשיפור utero-placental perfusion", maxScore: 3 },
        { id: "O12-P2-A4", text: "מיקום שמאל – IVC compression", maxScore: 3 },
      ]},
      { id: "O12-P3", title: "פינוי", actions: [
        { id: "O12-P3-A1", text: "Pre-alert – hypoglycemia הריון, שבוע, FHR", maxScore: 3 },
        { id: "O12-P3-A2", text: "פינוי לחדר לידה לניטור עוברי", maxScore: 3 },
        { id: "O12-P3-A3", text: "ניטור גלוקוז, FHR ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא בדק גלוקוז", "לא מיקום שמאל", "עיכוב פינוי לניטור עוברי"],
    impression: ["GDM", "hypoglycemia הריון", "FHR", "מיקום שמאל"],
  },
  {
    id: "O13", code: "O13", title: "קרע ברחם", badge: "🚨", category: "obstetric",
    story: "אישה בלידה עם קיסרי קודם. לפתע – כאב חד, הפסקת צירים, FHR חמור, BP ירד.",
    vitals: { pulse: "125 חלש", bp: "80/50", spo2: "94%", rr: "24" },
    phases: [
      { id: "O13-P1", title: "הערכה ראשונית", actions: [
        { id: "O13-P1-A1", text: "זיהוי – uterine rupture: pain, deceleration, maternal shock", maxScore: 3 },
        { id: "O13-P1-A2", text: "O2, גישה ורידית x2", maxScore: 3 },
        { id: "O13-P1-A3", text: "FHR ניטור", maxScore: 3 },
        { id: "O13-P1-A4", text: "FAST – free fluid", maxScore: 3 },
      ]},
      { id: "O13-P2", title: "טיפול", actions: [
        { id: "O13-P2-A1", text: "נוזלים IV aggressive", maxScore: 3 },
        { id: "O13-P2-A2", text: "TXA 1g IV", maxScore: 3 },
        { id: "O13-P2-A3", text: "O2 high-flow, מיקום שמאל", maxScore: 3 },
        { id: "O13-P2-A4", text: "ניטור BP, FHR ברציפות", maxScore: 3 },
      ]},
      { id: "O13-P3", title: "פינוי", actions: [
        { id: "O13-P3-A1", text: "Pre-alert – uterine rupture, קיסרי קודם, BP, FHR", maxScore: 3 },
        { id: "O13-P3-A2", text: "פינוי דחוף לניתוח קיסרי חירום", maxScore: 3 },
        { id: "O13-P3-A3", text: "ניטור מלא בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב פינוי", "לא TXA", "לא ניטור FHR", "נוזלים לא מספיק"],
    impression: ["uterine rupture", "קיסרי קודם", "TXA", "ניתוח חירום"],
  },
  {
    id: "O14", code: "O14", title: "היפרדות שליה", badge: "🩸", category: "obstetric",
    story: "אישה בהריון שבוע 35 עם כאב בטן חד מאד ודימום כהה. רחם נוקשה וכואב. FHR ירוד.",
    vitals: { pulse: "120 חלש", bp: "90/55", spo2: "95%", rr: "24" },
    phases: [
      { id: "O14-P1", title: "הערכה ראשונית", actions: [
        { id: "O14-P1-A1", text: "abruptio placentae – painful bleeding, rigid uterus", maxScore: 3 },
        { id: "O14-P1-A2", text: "FHR ניטור", maxScore: 3 },
        { id: "O14-P1-A3", text: "O2, גישה ורידית x2", maxScore: 3 },
        { id: "O14-P1-A4", text: "FAST – דימום מוסתר?", maxScore: 3 },
      ]},
      { id: "O14-P2", title: "טיפול", actions: [
        { id: "O14-P2-A1", text: "נוזלים IV, TXA 1g", maxScore: 3 },
        { id: "O14-P2-A2", text: "O2 high-flow, מיקום שמאל", maxScore: 3 },
        { id: "O14-P2-A3", text: "ניטור DIC – coagulopathy", maxScore: 3 },
        { id: "O14-P2-A4", text: "ניטור BP, FHR", maxScore: 3 },
      ]},
      { id: "O14-P3", title: "פינוי", actions: [
        { id: "O14-P3-A1", text: "Pre-alert – abruptio, שבוע, FHR, BP", maxScore: 3 },
        { id: "O14-P3-A2", text: "פינוי לחדר לידה/ניתוח", maxScore: 3 },
        { id: "O14-P3-A3", text: "ניטור DIC, BP, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא TXA", "לא ניטור FHR", "עיכוב פינוי", "לא מיקום שמאל"],
    impression: ["abruptio placentae", "painful bleeding", "DIC", "TXA"],
  },
  {
    id: "O15", code: "O15", title: "לידה מוקדמת", badge: "⏰", category: "obstetric",
    story: "אישה בהריון שבוע 30 מגיעה עם כאבי בטן קצביים וצירים כל 5 דקות. צוואר הרחם נפתח 3 ס\"מ.",
    vitals: { pulse: "90 סדיר", bp: "115/70", spo2: "98%", rr: "18" },
    phases: [
      { id: "O15-P1", title: "הערכה ראשונית", actions: [
        { id: "O15-P1-A1", text: "הגדרת preterm – <37 שבועות עם צירים", maxScore: 3 },
        { id: "O15-P1-A2", text: "FHR ניטור, O2, מיקום שמאל", maxScore: 3 },
        { id: "O15-P1-A3", text: "הכנת ציוד NICU", maxScore: 3 },
        { id: "O15-P1-A4", text: "גישה ורידית, ניטור", maxScore: 3 },
      ]},
      { id: "O15-P2", title: "טיפול", actions: [
        { id: "O15-P2-A1", text: "לא tocolytics בשדה", maxScore: 3 },
        { id: "O15-P2-A2", text: "מגנזיום 4g IV – neuroprotection לעובר <32w", maxScore: 3 },
        { id: "O15-P2-A3", text: "אם לידה בלתי נמנעת – הכנה ל-preterm delivery", maxScore: 3 },
        { id: "O15-P2-A4", text: "ניטור FHR ברציפות", maxScore: 3 },
      ]},
      { id: "O15-P3", title: "פינוי", actions: [
        { id: "O15-P3-A1", text: "Pre-alert – preterm labor שבוע 30, NICU, מגנזיום", maxScore: 3 },
        { id: "O15-P3-A2", text: "פינוי לבית חולים עם NICU", maxScore: 3 },
        { id: "O15-P3-A3", text: "ניטור FHR, צירים בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["tocolytics בשדה", "לא מגנזיום <32w", "פינוי לבית חולים ללא NICU"],
    impression: ["preterm labor", "מגנזיום neuroprotection", "NICU", "פינוי"],
  },
  {
    id: "O16", code: "O16", title: "הריון מולרי (Molar Pregnancy)", badge: "🔬", category: "obstetric",
    story: "אישה בת 22 בהריון שבוע 14. דימום ורוד מאסיבי, BP גבוה לפתע, גודל רחם גדול לגיל הריון.",
    vitals: { pulse: "115 חלש", bp: "155/100", spo2: "96%", rr: "20" },
    phases: [
      { id: "O16-P1", title: "הערכה ראשונית", actions: [
        { id: "O16-P1-A1", text: "חשד הריון מולרי – דימום מוקדם, BP גבוה, גודל גדול", maxScore: 3 },
        { id: "O16-P1-A2", text: "כמות דימום, מצב המודינמי", maxScore: 3 },
        { id: "O16-P1-A3", text: "O2, גישה ורידית x2, ניטור", maxScore: 3 },
        { id: "O16-P1-A4", text: "FAST – free fluid?", maxScore: 3 },
      ]},
      { id: "O16-P2", title: "טיפול", actions: [
        { id: "O16-P2-A1", text: "נוזלים IV לתמיכה המודינמית", maxScore: 3 },
        { id: "O16-P2-A2", text: "לא oxytocin בשדה ב-molar", maxScore: 3 },
        { id: "O16-P2-A3", text: "BP control זהיר – מטרה לא מתחת ל-150", maxScore: 3 },
        { id: "O16-P2-A4", text: "ניטור BP, דימום ברציפות", maxScore: 3 },
      ]},
      { id: "O16-P3", title: "פינוי", actions: [
        { id: "O16-P3-A1", text: "Pre-alert – suspected molar, BP, דימום, שבוע", maxScore: 3 },
        { id: "O16-P3-A2", text: "פינוי לגינקולוגיה – evacuation", maxScore: 3 },
        { id: "O16-P3-A3", text: "ניטור BP, SpO2, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["oxytocin ב-molar", "עיכוב פינוי", "לא BP control"],
    impression: ["molar pregnancy", "GTN", "BP גבוה", "evacuation"],
  },
  {
    id: "X03", code: "X03", title: "הרעלת TCA (נוגדי דיכאון טריציקליים)", badge: "💊", category: "toxicology",
    story: "גבר בן 35 נמצא לא מגיב אחרי נטילת Amitriptyline. ECG מראה QRS רחב. BP נמוך, arrhythmia.",
    vitals: { pulse: "120 לא סדיר", bp: "80/50", spo2: "90%", rr: "10 shallow" },
    phases: [
      { id: "X03-P1", title: "הערכה ראשונית", actions: [
        { id: "X03-P1-A1", text: "ECG – QRS >100ms, חיפוש R בaVR", maxScore: 3 },
        { id: "X03-P1-A2", text: "ABCDE, GCS, ניהול airway", maxScore: 3 },
        { id: "X03-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X03-P1-A4", text: "אנמנזה – תרופה, מינון, זמן", maxScore: 3 },
      ]},
      { id: "X03-P2", title: "טיפול", actions: [
        { id: "X03-P2-A1", text: "נתרן ביקרבונאט 8.4% 1-2mmol/kg IV – QRS narrowing", maxScore: 3 },
        { id: "X03-P2-A2", text: "RSI – GCS ירוד, airway protection", maxScore: 3 },
        { id: "X03-P2-A3", text: "נוזלים IV לBP", maxScore: 3 },
        { id: "X03-P2-A4", text: "הימנע מ-physostigmine, flumazenil", maxScore: 3 },
      ]},
      { id: "X03-P3", title: "פינוי", actions: [
        { id: "X03-P3-A1", text: "Pre-alert – TCA overdose, ECG QRS, NaHCO3", maxScore: 3 },
        { id: "X03-P3-A2", text: "פינוי לICU עם המשך NaHCO3", maxScore: 3 },
        { id: "X03-P3-A3", text: "ניטור ECG ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא NaHCO3 ב-QRS רחב", "flumazenil – מסוכן!", "עיכוב RSI", "לא ECG"],
    impression: ["TCA", "QRS רחב", "NaHCO3", "R ב-aVR"],
  },
  {
    id: "X04", code: "X04", title: "הרעלת פרצטמול", badge: "💊", category: "toxicology",
    story: "אישה בת 22 נטלה 30 כדורי Paracetamol לפני 4 שעות. כרגע נראית תקינה – ללא תסמינים.",
    vitals: { pulse: "78 סדיר", bp: "120/75", spo2: "99%", rr: "16" },
    phases: [
      { id: "X04-P1", title: "הערכה ראשונית", actions: [
        { id: "X04-P1-A1", text: "כמות ומינון – >150mg/kg מסוכן", maxScore: 3 },
        { id: "X04-P1-A2", text: "זמן נטילה – ≤1 שעה? activated charcoal", maxScore: 3 },
        { id: "X04-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X04-P1-A4", text: "הסברת silence period – כבד ייפגע מאוחר", maxScore: 3 },
      ]},
      { id: "X04-P2", title: "טיפול", actions: [
        { id: "X04-P2-A1", text: "Activated charcoal 1g/kg PO אם ≤1 שעה", maxScore: 3 },
        { id: "X04-P2-A2", text: "NAC – N-acetylcysteine (בבית חולים)", maxScore: 3 },
        { id: "X04-P2-A3", text: "לא לאלץ הקאה – שאיפה!", maxScore: 3 },
        { id: "X04-P2-A4", text: "ניטור GCS, עייפות, RUQ pain", maxScore: 3 },
      ]},
      { id: "X04-P3", title: "פינוי", actions: [
        { id: "X04-P3-A1", text: "Pre-alert – paracetamol OD, מינון, זמן, AC", maxScore: 3 },
        { id: "X04-P3-A2", text: "פינוי לכולם – liver failure מאוחרת", maxScore: 3 },
        { id: "X04-P3-A3", text: "ניטור LFT, GCS בנסיעה", maxScore: 3 },
      ]},
    ],
    failCriteria: ["שחרור כי 'נראה טוב'", "הקאה מאולצת", "עיכוב AC"],
    impression: ["paracetamol OD", "NAC", "activated charcoal", "liver failure"],
  },
  {
    id: "X05", code: "X05", title: "רעילות ליתיום", badge: "⚗️", category: "toxicology",
    story: "גבר בן 45 עם הפרעה ביפולרית על ליתיום. רעד, אטקסיה, בלבול, עוויתות. מינון ליתיום לא ידוע.",
    vitals: { pulse: "88 סדיר", bp: "125/80", spo2: "96%", rr: "18" },
    phases: [
      { id: "X05-P1", title: "הערכה ראשונית", actions: [
        { id: "X05-P1-A1", text: "ליתיום toxicity – SLUD: seizures, level consciousness, urinary", maxScore: 3 },
        { id: "X05-P1-A2", text: "גלוקומטר, אנמנזה – תרופות, זמן", maxScore: 3 },
        { id: "X05-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X05-P1-A4", text: "ECG – ST changes, T wave", maxScore: 3 },
      ]},
      { id: "X05-P2", title: "טיפול", actions: [
        { id: "X05-P2-A1", text: "נוזלים NS IV – dilution ו-renal clearance", maxScore: 3 },
        { id: "X05-P2-A2", text: "עוויתות – בנזודיאזפין", maxScore: 3 },
        { id: "X05-P2-A3", text: "הימנע מ-NSAID/diuretics – מגבירים ליתיום", maxScore: 3 },
        { id: "X05-P2-A4", text: "ניטור GCS, עוויתות, ECG", maxScore: 3 },
      ]},
      { id: "X05-P3", title: "פינוי", actions: [
        { id: "X05-P3-A1", text: "Pre-alert – lithium toxicity, ECG, עוויתות, GCS", maxScore: 3 },
        { id: "X05-P3-A2", text: "פינוי לNephrology – dialysis אפשרי", maxScore: 3 },
        { id: "X05-P3-A3", text: "ניטור ברציפות – serum lithium", maxScore: 3 },
      ]},
    ],
    failCriteria: ["NSAID/diuretics – מגבירים ליתיום!", "עיכוב נוזלים", "לא ECG"],
    impression: ["lithium toxicity", "NS IV", "dialysis", "seizures"],
  },
  {
    id: "X06", code: "X06", title: "הרעלת חוסם בטא", badge: "🫀", category: "toxicology",
    story: "גבר בן 65 נטל יתר Metoprolol. ברדיקרדיה קשה, BP נמוך, GCS ירוד, היפוגליקמיה.",
    vitals: { pulse: "38 סדיר", bp: "75/45", spo2: "93%", rr: "14" },
    phases: [
      { id: "X06-P1", title: "הערכה ראשונית", actions: [
        { id: "X06-P1-A1", text: "ECG – ברדיקרדיה, PR prolongation, AV block", maxScore: 3 },
        { id: "X06-P1-A2", text: "גלוקומטר – beta-blocker = hypoglycemia", maxScore: 3 },
        { id: "X06-P1-A3", text: "O2, גישה ורידית x2, ניטור", maxScore: 3 },
        { id: "X06-P1-A4", text: "אנמנזה – תרופה, מינון, זמן", maxScore: 3 },
      ]},
      { id: "X06-P2", title: "טיפול", actions: [
        { id: "X06-P2-A1", text: "High dose insulin 1unit/kg bolus + גלוקוז – HDIE", maxScore: 3 },
        { id: "X06-P2-A2", text: "גלוקגון 5-10mg IV – inotrope", maxScore: 3 },
        { id: "X06-P2-A3", text: "קצב חיצוני + אטרופין לברדיקרדיה", maxScore: 3 },
        { id: "X06-P2-A4", text: "Lipid emulsion 20% אם cardiac arrest", maxScore: 3 },
      ]},
      { id: "X06-P3", title: "פינוי", actions: [
        { id: "X06-P3-A1", text: "Pre-alert – beta-blocker OD, ECG, BP, גלוקגון", maxScore: 3 },
        { id: "X06-P3-A2", text: "פינוי לICU – ECMO option", maxScore: 3 },
        { id: "X06-P3-A3", text: "ניטור ECG, גלוקוז, BP ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא גלוקגון", "לא HDIE", "עיכוב קצב חיצוני", "לא גלוקוז"],
    impression: ["beta-blocker OD", "גלוקגון", "HDIE", "Lipid emulsion"],
  },
  {
    id: "X07", code: "X07", title: "הרעלת CCB (חוסמי סידן)", badge: "🔴", category: "toxicology",
    story: "אישה בת 58 נטלה יתר Verapamil. ברדיקרדיה, BP נמוך, AV block כולל. בלבול.",
    vitals: { pulse: "40 סדיר", bp: "70/40", spo2: "92%", rr: "16" },
    phases: [
      { id: "X07-P1", title: "הערכה ראשונית", actions: [
        { id: "X07-P1-A1", text: "ECG – ברדיקרדיה, AV block, PR prolonged", maxScore: 3 },
        { id: "X07-P1-A2", text: "O2, גישה ורידית x2, ניטור", maxScore: 3 },
        { id: "X07-P1-A3", text: "גלוקומטר", maxScore: 3 },
        { id: "X07-P1-A4", text: "אנמנזה – CCB, sustained release?", maxScore: 3 },
      ]},
      { id: "X07-P2", title: "טיפול", actions: [
        { id: "X07-P2-A1", text: "גלוקונאט סידן 10% 10-30ml IV", maxScore: 3 },
        { id: "X07-P2-A2", text: "HDIE – High dose insulin + גלוקוז", maxScore: 3 },
        { id: "X07-P2-A3", text: "קצב חיצוני לברדיקרדיה", maxScore: 3 },
        { id: "X07-P2-A4", text: "Lipid emulsion 20% – cardiac arrest", maxScore: 3 },
      ]},
      { id: "X07-P3", title: "פינוי", actions: [
        { id: "X07-P3-A1", text: "Pre-alert – CCB OD, ECG, סידן, HDIE", maxScore: 3 },
        { id: "X07-P3-A2", text: "פינוי לICU", maxScore: 3 },
        { id: "X07-P3-A3", text: "ניטור ECG, BP ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא סידן", "לא HDIE", "עיכוב קצב חיצוני", "לא SR warning"],
    impression: ["CCB OD", "סידן", "HDIE", "Lipid emulsion"],
  },
  {
    id: "X08", code: "X08", title: "הרעלת אופיואידים", badge: "💉", category: "toxicology",
    story: "גבר בן 28 נמצא לא מגיב עם מחטים ליד. נשימה איטית מאד, מיוזיס, ציאנוזה.",
    vitals: { pulse: "55 סדיר", bp: "90/60", spo2: "82%", rr: "6 shallow" },
    phases: [
      { id: "X08-P1", title: "הערכה ראשונית", actions: [
        { id: "X08-P1-A1", text: "Opioid triad – miosis, respiratory depression, LOC", maxScore: 3 },
        { id: "X08-P1-A2", text: "O2, BVM, נשימות הצלה", maxScore: 3 },
        { id: "X08-P1-A3", text: "גישה ורידית/IO/IM", maxScore: 3 },
        { id: "X08-P1-A4", text: "ABCDE, GCS", maxScore: 3 },
      ]},
      { id: "X08-P2", title: "טיפול", actions: [
        { id: "X08-P2-A1", text: "נלוקסון 0.4mg IV/IM/IN – antidote", maxScore: 3 },
        { id: "X08-P2-A2", text: "חזרה 0.4mg כל 2-3 דקות עד RR>12", maxScore: 3 },
        { id: "X08-P2-A3", text: "ניטור ל-renarcotization – נלוקסון t1/2 קצר!", maxScore: 3 },
        { id: "X08-P2-A4", text: "BVM/אינטובציה אם חוסמה נשימה", maxScore: 3 },
      ]},
      { id: "X08-P3", title: "פינוי", actions: [
        { id: "X08-P3-A1", text: "פינוי – renarcotization ב-IR/fentanyl", maxScore: 3 },
        { id: "X08-P3-A2", text: "Pre-alert – opioid OD, נלוקסון, RR, SpO2", maxScore: 3 },
        { id: "X08-P3-A3", text: "ניטור RR, SpO2, GCS ברציפות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא נלוקסון", "שחרור אחרי נלוקסון – renarcotization!", "עיכוב BVM"],
    impression: ["opioid OD", "נלוקסון", "miosis", "renarcotization"],
  },
  {
    id: "X09", code: "X09", title: "הרעלת בנזודיאזפינים", badge: "💊", category: "toxicology",
    story: "אישה בת 40 נטלה יתר Diazepam. GCS 10, נשימה מדוכאת קלה, דיבור מטושטש. SpO2 גבולי.",
    vitals: { pulse: "75 סדיר", bp: "115/70", spo2: "93%", rr: "12 shallow" },
    phases: [
      { id: "X09-P1", title: "הערכה ראשונית", actions: [
        { id: "X09-P1-A1", text: "ABCDE, GCS, airway protection", maxScore: 3 },
        { id: "X09-P1-A2", text: "שלילת TCA – ECG!", maxScore: 3 },
        { id: "X09-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X09-P1-A4", text: "גלוקומטר, אנמנזה", maxScore: 3 },
      ]},
      { id: "X09-P2", title: "טיפול", actions: [
        { id: "X09-P2-A1", text: "O2, BVM אם RR<8", maxScore: 3 },
        { id: "X09-P2-A2", text: "Flumazenil – רק אם ידוע ספציפי, זהיר! TCA?", maxScore: 3 },
        { id: "X09-P2-A3", text: "הימנע מflumazenil ב-polypharmacy", maxScore: 3 },
        { id: "X09-P2-A4", text: "ניטור SpO2, GCS ברציפות", maxScore: 3 },
      ]},
      { id: "X09-P3", title: "פינוי", actions: [
        { id: "X09-P3-A1", text: "Pre-alert – BZD OD, GCS, SpO2, שלילת TCA", maxScore: 3 },
        { id: "X09-P3-A2", text: "פינוי לאבחון ועזרה תמיכתית", maxScore: 3 },
        { id: "X09-P3-A3", text: "ניטור SpO2, airway", maxScore: 3 },
      ]},
    ],
    failCriteria: ["flumazenil ב-polypharmacy/TCA", "לא בדק ECG", "שחרור ללא פינוי"],
    impression: ["BZD OD", "flumazenil זהיר", "O2 תמיכתי", "polypharmacy"],
  },
  {
    id: "X10", code: "X10", title: "תסמונת סרוטונין", badge: "🔥", category: "toxicology",
    story: "גבר בן 30 על SSRI + Tramadol. רעד, היפרתרמיה, אגיטציה, myoclonus, hypereflexia.",
    vitals: { pulse: "128 סדיר", bp: "145/90", spo2: "97%", rr: "22", temp: "39.5°C" },
    phases: [
      { id: "X10-P1", title: "הערכה ראשונית", actions: [
        { id: "X10-P1-A1", text: "Hunter criteria – clonus, myoclonus, agitation, diaphoresis", maxScore: 3 },
        { id: "X10-P1-A2", text: "אנמנזה – SSRI, MAOI, tramadol, triptans", maxScore: 3 },
        { id: "X10-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X10-P1-A4", text: "טמפרטורה, ECG, גלוקוז", maxScore: 3 },
      ]},
      { id: "X10-P2", title: "טיפול", actions: [
        { id: "X10-P2-A1", text: "הפסקת סרוטונרגי – remove the trigger", maxScore: 3 },
        { id: "X10-P2-A2", text: "ציפרוהפטדין 12mg PO – serotonin antagonist", maxScore: 3 },
        { id: "X10-P2-A3", text: "קירור היפרתרמיה – קרח, מים קרים", maxScore: 3 },
        { id: "X10-P2-A4", text: "בנזודיאזפין לאגיטציה/עוויתות", maxScore: 3 },
      ]},
      { id: "X10-P3", title: "פינוי", actions: [
        { id: "X10-P3-A1", text: "Pre-alert – serotonin syndrome, temp, tachycardia", maxScore: 3 },
        { id: "X10-P3-A2", text: "פינוי לICU", maxScore: 3 },
        { id: "X10-P3-A3", text: "ניטור טמפרטורה, ECG, GCS", maxScore: 3 },
      ]},
    ],
    failCriteria: ["הוספת סרוטונרגי", "לא קירור", "לא ציפרוהפטדין", "עיכוב פינוי"],
    impression: ["serotonin syndrome", "Hunter criteria", "ציפרוהפטדין", "clonus"],
  },
  {
    id: "X11", code: "X11", title: "תסמונת NMS (נוירולפטית ממאירה)", badge: "🧊", category: "toxicology",
    story: "אישה בת 35 על הלופרידול. חום גבוה, קשיון שרירים מוחלט, AMS, diaphoresis. תחילה אחרי שינוי מינון.",
    vitals: { pulse: "115 סדיר", bp: "150/95", spo2: "95%", rr: "22", temp: "40.5°C" },
    phases: [
      { id: "X11-P1", title: "הערכה ראשונית", actions: [
        { id: "X11-P1-A1", text: "NMS – WHAR: Weakness/rigidity, Hyperthermia, AMS, Rhabdomyolysis", maxScore: 3 },
        { id: "X11-P1-A2", text: "הבחנה מ-serotonin syndrome – lead pipe rigidity vs clonus", maxScore: 3 },
        { id: "X11-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X11-P1-A4", text: "טמפרטורה, CK גבוה (הערכה)", maxScore: 3 },
      ]},
      { id: "X11-P2", title: "טיפול", actions: [
        { id: "X11-P2-A1", text: "קירור אגרסיבי – מים קרים, קרח", maxScore: 3 },
        { id: "X11-P2-A2", text: "Dantrolene – muscle relaxant (בבית חולים)", maxScore: 3 },
        { id: "X11-P2-A3", text: "הפסקת נוירולפטי", maxScore: 3 },
        { id: "X11-P2-A4", text: "נוזלים IV – rhabdomyolysis renal protection", maxScore: 3 },
      ]},
      { id: "X11-P3", title: "פינוי", actions: [
        { id: "X11-P3-A1", text: "Pre-alert – NMS, temp 40.5, rigidity, נוירולפטי", maxScore: 3 },
        { id: "X11-P3-A2", text: "פינוי לICU – Dantrolene, cooling", maxScore: 3 },
        { id: "X11-P3-A3", text: "ניטור טמפרטורה, BP, mentation", maxScore: 3 },
      ]},
    ],
    failCriteria: ["המשך נוירולפטי", "לא קירור", "לא נוזלים – rhabdo", "אבחנה שגויה כ-serotonin"],
    impression: ["NMS", "lead pipe rigidity", "Dantrolene", "hyperthermia"],
  },
  {
    id: "X12", code: "X12", title: "הרעלת פחמן חד-חמצני (CO)", badge: "💨", category: "toxicology",
    story: "משפחה שלמה נמצאת מבולבלת בבית חורף. כאב ראש, בחילה, חולשה. מחמם גז עם אוורור לקוי.",
    vitals: { pulse: "105 סדיר", bp: "130/80", spo2: "99% (לא אמין!)", rr: "20" },
    phases: [
      { id: "X12-P1", title: "הערכה ראשונית", actions: [
        { id: "X12-P1-A1", text: "יציאה מיידית מהסביבה!", maxScore: 3 },
        { id: "X12-P1-A2", text: "SpO2 פולסאוקסימטר לא אמין – COHb גבוה", maxScore: 3 },
        { id: "X12-P1-A3", text: "GCS, FAST – שלילת CVA", maxScore: 3 },
        { id: "X12-P1-A4", text: "CO detector אם זמין", maxScore: 3 },
      ]},
      { id: "X12-P2", title: "טיפול", actions: [
        { id: "X12-P2-A1", text: "O2 100% NRB לכולם – הפחתת t1/2 CO", maxScore: 3 },
        { id: "X12-P2-A2", text: "גישה ורידית, ניטור, O2 ברציפות", maxScore: 3 },
        { id: "X12-P2-A3", text: "RSI אם GCS ירוד", maxScore: 3 },
        { id: "X12-P2-A4", text: "שקילת hyperbaric O2 – הריון, LOC, arrhythmia", maxScore: 3 },
      ]},
      { id: "X12-P3", title: "פינוי", actions: [
        { id: "X12-P3-A1", text: "Pre-alert – CO poisoning, GCS, כולם, hyperbaric?", maxScore: 3 },
        { id: "X12-P3-A2", text: "פינוי לboring – hyperbaric center", maxScore: 3 },
        { id: "X12-P3-A3", text: "ניטור GCS, SpO2 (אמיתי - CO-oximeter בית חולים)", maxScore: 3 },
      ]},
    ],
    failCriteria: ["סמיכות על SpO2", "לא יציאה מסביבה", "O2 נמוך", "עיכוב hyperbaric"],
    impression: ["CO poisoning", "SpO2 לא אמין", "O2 100%", "hyperbaric"],
  },
  {
    id: "X13", code: "X13", title: "הרעלת ציאניד", badge: "☠️", category: "toxicology",
    story: "גבר בן 40 חולץ משריפה תעשייתית. כשל נשימתי חמור, BP נמוך, בגרגרים בספוג-O2, ריח שקדים מריר.",
    vitals: { pulse: "120 חלש", bp: "75/45", spo2: "85%", rr: "30" },
    phases: [
      { id: "X13-P1", title: "הערכה ראשונית", actions: [
        { id: "X13-P1-A1", text: "חשד ציאניד – שריפה, bitter almond odor, rapid decompensation", maxScore: 3 },
        { id: "X13-P1-A2", text: "O2 100% NRB מיידי", maxScore: 3 },
        { id: "X13-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X13-P1-A4", text: "Hydroxocobalamin 5g IV – antidote", maxScore: 3 },
      ]},
      { id: "X13-P2", title: "טיפול", actions: [
        { id: "X13-P2-A1", text: "Hydroxocobalamin 5g IV על 15 דקות", maxScore: 3 },
        { id: "X13-P2-A2", text: "RSI – airway protection", maxScore: 3 },
        { id: "X13-P2-A3", text: "נוזלים IV לBP", maxScore: 3 },
        { id: "X13-P2-A4", text: "הימנע מthiosulfate אם hydroxocobalamin ניתן", maxScore: 3 },
      ]},
      { id: "X13-P3", title: "פינוי", actions: [
        { id: "X13-P3-A1", text: "Pre-alert – cyanide poisoning, hydroxocobalamin, BP", maxScore: 3 },
        { id: "X13-P3-A2", text: "פינוי לICU", maxScore: 3 },
        { id: "X13-P3-A3", text: "ניטור BP, SpO2, lactate (גבוה ב-cyanide)", maxScore: 3 },
      ]},
    ],
    failCriteria: ["עיכוב hydroxocobalamin", "לא O2 100%", "עיכוב RSI"],
    impression: ["cyanide poisoning", "hydroxocobalamin", "bitter almond", "lactate"],
  },
  {
    id: "X14", code: "X14", title: "הרעלת מתנול", badge: "🧪", category: "toxicology",
    story: "גבר בן 30 שתה אלכוהול מסוכן. כאב ראש, ראיה מטושטשת, חמצת קשה. Metabolic acidosis.",
    vitals: { pulse: "108 סדיר", bp: "110/70", spo2: "97%", rr: "28 Kussmaul" },
    phases: [
      { id: "X14-P1", title: "הערכה ראשונית", actions: [
        { id: "X14-P1-A1", text: "אנמנזה – אלכוהול לא ידוע, ראיה, חמצת", maxScore: 3 },
        { id: "X14-P1-A2", text: "Kussmaul breathing = metabolic acidosis", maxScore: 3 },
        { id: "X14-P1-A3", text: "O2, גישה ורידית, ניטור", maxScore: 3 },
        { id: "X14-P1-A4", text: "גלוקומטר, ECG", maxScore: 3 },
      ]},
      { id: "X14-P2", title: "טיפול", actions: [
        { id: "X14-P2-A1", text: "Ethanol IV כאנטידוט – מתחרה על alcohol dehydrogenase", maxScore: 3 },
        { id: "X14-P2-A2", text: "נתרן ביקרבונאט לחמצת", maxScore: 3 },
        { id: "X14-P2-A3", text: "Fomepizole 15mg/kg IV (בית חולים)", maxScore: 3 },
        { id: "X14-P2-A4", text: "נוזלים IV, ניטור GCS", maxScore: 3 },
      ]},
      { id: "X14-P3", title: "פינוי", actions: [
        { id: "X14-P3-A1", text: "Pre-alert – methanol, Kussmaul, ראיה, חמצת", maxScore: 3 },
        { id: "X14-P3-A2", text: "פינוי לDialysis center", maxScore: 3 },
        { id: "X14-P3-A3", text: "ניטור ראיה, GCS, חמצת", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא אנטידוט", "לא NaHCO3", "עיכוב dialysis", "עיכוב פינוי"],
    impression: ["methanol", "Kussmaul", "Fomepizole", "dialysis"],
  },
  {
    id: "X15", code: "X15", title: "עקיצת נחש", badge: "🐍", category: "toxicology",
    story: "גבר בן 35 נעקץ על ידי נחש ויפרי בישראל. נפיחות מהירה, כאב מקומי, בחילה, ירידת BP.",
    vitals: { pulse: "112 חלש", bp: "90/60", spo2: "96%", rr: "20" },
    phases: [
      { id: "X15-P1", title: "הערכה ראשונית", actions: [
        { id: "X15-P1-A1", text: "זיהוי נחש אם בטוח – צילום לא לגעת!", maxScore: 3 },
        { id: "X15-P1-A2", text: "הערכת נפיחות, crepitus, ecchymosis", maxScore: 3 },
        { id: "X15-P1-A3", text: "O2, גישה ורידית x2, ניטור", maxScore: 3 },
        { id: "X15-P1-A4", text: "ECG – ריתמי, QT", maxScore: 3 },
      ]},
      { id: "X15-P2", title: "טיפול", actions: [
        { id: "X15-P2-A1", text: "Immobilize הגפה – מתחת לרמת לב", maxScore: 3 },
        { id: "X15-P2-A2", text: "לא tourniquet, לא חיתוך, לא מציצה!", maxScore: 3 },
        { id: "X15-P2-A3", text: "נוזלים IV לתמיכה המודינמית", maxScore: 3 },
        { id: "X15-P2-A4", text: "Antivenom – בבית חולים בלבד", maxScore: 3 },
      ]},
      { id: "X15-P3", title: "פינוי", actions: [
        { id: "X15-P3-A1", text: "Pre-alert – snake bite, ויפרי?, נפיחות, BP", maxScore: 3 },
        { id: "X15-P3-A2", text: "פינוי לבית חולים עם antivenom", maxScore: 3 },
        { id: "X15-P3-A3", text: "ניטור נפיחות, BP, coagulopathy", maxScore: 3 },
      ]},
    ],
    failCriteria: ["tourniquet", "חיתוך/מציצה", "לא נוזלים", "עיכוב antivenom"],
    impression: ["snake bite", "ויפרי", "antivenom", "לא tourniquet"],
  },
  {
    id: "X16", code: "X16", title: "עקיצת עקרב בילד", badge: "🦂", category: "toxicology",
    story: "ילד בן 6 עקוץ על ידי עקרב (Scorpio maurus). כאב מקומי, רוק מוגבר, עוויתות, tachycardia.",
    vitals: { pulse: "155 סדיר", bp: "100/65", spo2: "95%", rr: "28" },
    phases: [
      { id: "X16-P1", title: "הערכה ראשונית", actions: [
        { id: "X16-P1-A1", text: "עקרב בישראל – Scorpio maurus, Androctonus", maxScore: 3 },
        { id: "X16-P1-A2", text: "הערכת תסמינים – local vs systemic", maxScore: 3 },
        { id: "X16-P1-A3", text: "O2, גישה ורידית/IO, ניטור", maxScore: 3 },
        { id: "X16-P1-A4", text: "ECG – ריתמי, autonomic signs", maxScore: 3 },
      ]},
      { id: "X16-P2", title: "טיפול", actions: [
        { id: "X16-P2-A1", text: "אנלגזיה IV לכאב מקומי", maxScore: 3 },
        { id: "X16-P2-A2", text: "בנזודיאזפין לעוויתות", maxScore: 3 },
        { id: "X16-P2-A3", text: "O2 לפי SpO2", maxScore: 3 },
        { id: "X16-P2-A4", text: "אנטי-וונום בבית חולים – כשיש systemic signs", maxScore: 3 },
      ]},
      { id: "X16-P3", title: "פינוי", actions: [
        { id: "X16-P3-A1", text: "Pre-alert – scorpion envenomation ילד, systemic, עוויתות", maxScore: 3 },
        { id: "X16-P3-A2", text: "פינוי לבית חולים – antivenom, ICU", maxScore: 3 },
        { id: "X16-P3-A3", text: "ניטור ECG, GCS, עוויתות", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא עוויתות בנזודיאזפין", "עיכוב antivenom systemic", "לא ECG"],
    impression: ["envenomation", "scorpion", "systemic signs", "antivenom"],
  },
  {
    id: "X17", code: "X17", title: "הרעלת אורגנופוספאט", badge: "🧴", category: "toxicology",
    story: "גבר בן 45 חקלאי בהגעה עם ריחת חומרי הדברה. מיוזיס, רוק מוגבר, ברונכוספזם, שתן לא נשלט.",
    vitals: { pulse: "55 סדיר", bp: "80/50", spo2: "88%", rr: "32" },
    phases: [
      { id: "X17-P1", title: "הערכה ראשונית", actions: [
        { id: "X17-P1-A1", text: "SLUDGE – Salivation, Lacrimation, Urination, Defecation, GI, Emesis", maxScore: 3 },
        { id: "X17-P1-A2", text: "מיוזיס, Nicotinic signs – muscle fasciculations", maxScore: 3 },
        { id: "X17-P1-A3", text: "O2, ניהול airway, שאיבה", maxScore: 3 },
        { id: "X17-P1-A4", text: "הגנה על הצוות – כפפות, הסרת בגדים", maxScore: 3 },
      ]},
      { id: "X17-P2", title: "טיפול", actions: [
        { id: "X17-P2-A1", text: "אטרופין 2-4mg IV – חזרה כל 5 דקות עד דיסה", maxScore: 3 },
        { id: "X17-P2-A2", text: "Pralidoxime (2-PAM) 1-2g IV – within 48h", maxScore: 3 },
        { id: "X17-P2-A3", text: "RSI – succinylcholine – זהיר (fasiculations)", maxScore: 3 },
        { id: "X17-P2-A4", text: "decontamination – הסרת בגדים, שטיפה", maxScore: 3 },
      ]},
      { id: "X17-P3", title: "פינוי", actions: [
        { id: "X17-P3-A1", text: "Pre-alert – organophosphate, SLUDGE, אטרופין, decon", maxScore: 3 },
        { id: "X17-P3-A2", text: "פינוי לICU – המשך אטרופין", maxScore: 3 },
        { id: "X17-P3-A3", text: "ניטור SpO2, HR, secretions", maxScore: 3 },
      ]},
    ],
    failCriteria: ["לא decontamination – סיכון צוות", "מינון אטרופין נמוך", "עיכוב Pralidoxime"],
    impression: ["organophosphate", "SLUDGE", "אטרופין", "Pralidoxime"],
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
