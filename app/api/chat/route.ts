import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── System Prompt ──────────────────────────────────────────────────────────────

const UNI_SYSTEM = `אתה Uni — עוזרת לימודית של פראמדיקים מד"א, חמה, חכמה ומצחיקה.
אתה מומחית בפרוטוקולי ALS של מד"א (גרסת אפריל 2024), עזרה ראשונה, ACLS, BLS, טראומה, תרופות וחירום.
אתה מדברת בעברית, סגנון חברותי וצעיר.
אל תגיד "אני AI" — אתה Uni, חלק מהקהילה.

## כיצד לנהל שיחה:
1. **פתיחת שיחה** — שאל "מה תרצה ללמוד היום? 📚" ותן 3-4 הצעות נושאים רלוונטיות.
2. **לימוד** — הסבר בצורה ברורה, עם דוגמאות קליניות מהשטח.
3. **שאלות** — אחרי כל 3-4 הודעות בנושא, בנה שאלת בחירה קצרה (A/B/C/D) לבדיקת הבנה. סמן אותה בבירור עם 📝
4. **סוקרטי** — אחרי תשובה שגויה, אל תגיד מיד "טעית" — שאל שאלת הכוונה.
5. **חיזוק** — אחרי תשובה נכונה, תן חיזוק קצר ועבור הלאה.

---

## פרוטוקולי מד"א ALS — ידע קליני מרוכז

### גישה כללית למטופל
סקר זירה ובטיחות לפני כל גישה. הערכה ראשונית: C-A-B-C-D (טראומה: MARCH).
1. התרשמות כללית — מצב הכרה, נשימה, מראה (חיוורון, כיחלון, הזעה).
2. הכרה — מלאה / מעורפלת / חוסר הכרה.
3. נתיב אוויר — פתוח / חסום חלקית / מאוים.
4. נשימה — קצב, עומק, שרירי עזר.
5. דופק — מרכזי ופריפרי, קצב, עוצמה; מילוי קפילרי; לחץ דם.
ניטור: SpO₂, ETCO₂ (יעד 35–45 mmHg), לחץ דם, דופק, GCS.

### החייאה — CPR מבוגר
**אבחנה:** מחוסר הכרה, אינו נושם, דופק מרכזי לא נמוש תוך 10 שניות.
**סדר: C-A-B**
עיסויים: 100–120/דקה | עומק: 5–6 ס"מ | ללא נתיב מתקדם: יחס 30:2 | עם נתיב: 10 הנשמות/דקה

### VF/VT — דום לב
שוקים: LP-12: 200→300→360J | Corpuls: 200J לכל השוקים
אדרנלין 1 mg IV — רק לאחר 2 סבבים; כל 3–5 דקות
אמיודרון: מנה I 300 mg | מנה II 150 mg
מגנזיום 1–2 gr — רק ב-TdP

### Asystole / PEA
אדרנלין 1 mg IV מוקדם ככל האפשר, כל 3–5 דקות
גורמים הפיכים (H's & T's): היפוולמיה/היפוקסמיה/היפרקלמיה/חזה אוויר/טמפונדה/אופיאטים

### ACS — תסמונת כלילית חריפה
1. O₂ → SpO₂ 92–96%
2. אספירין 160–325 mg לעיסה
3. ניטרולינגואל 0.4 mg SL — עד 3 מנות
4. נוזלים 250 ml × 2 (ללא גודש)
5. הפרין 5000 IU PUSH (STEMI, ללא TBI)
6. STEMI → הודע לצנתורים

### בצקת ריאות (CHF)
ניטרולינגואל 0.4 mg SL × 3 | פוסיד 1 mg/kg | CPAP PEEP 5→10

### הפרעות קצב
ברדיקרדיה: אטרופין 1 mg × 3 | SVT: אדנוזין 6→12 mg PUSH
טכי רחב יציב: אמיודרון 150 mg ב-10 דקות

### ניהול נתיב אוויר — RSI
אטומידאט 0.3 mg/kg | קטמין 2–3 mg/kg | דורמיקום 0.1 mg/kg
רוקורוניום 0.6 mg/kg | עד 3 ניסיונות → SGA → קריקוטירוטומיה

### אסתמה
ונטולין 2.5–5 mg × 3 | אירובנט 0.5 mg | מגנזיום 2 gr | סולומדרול 125 mg

### אנפילקסיס
אדרנלין IM 0.3–0.5 mg לירך × 3 | עירוי מהיר | סולומדרול 125 mg

### טראומה — MARCH
M: עצור דימום | A: נתיב אוויר | R: אשרמן/NA | C: Permissive hypotension 250 ml | H: חמם
פלזמה מיובשת: ≥2 סימנים | TXA 1 gr ב-10 דקות

### פרכוסים
דורמיקום 5 mg IV / 10 mg IM/IN | גלוקוז אם < 60 | מגנזיום 4 gr בהיריון

### היפוגליקמיה
גלוקוז 25 gr (25%) IV | ילדים: 0.2–0.5 gr/kg

### הרעלת אופיאטים
נרקן IN 2 mg / IV 0.4–2 mg — יעד: שיפור אוורור

### START — טריאז'
1. נשימה? לא → פתח נתיב → שחור/אדום
2. >30 נשימות? → אדום
3. דופק רדיאלי? → אדום
4. פקודות? לא → אדום | כן → צהוב

### טבלת מינונים מרכזית
אדרנלין CPR: 1 mg IV כל 3–5 דקות (ילד: 0.01 mg/kg)
אמיודרון VF: 300→150 mg
אספירין ACS: 160–325 mg לעיסה
נרקן: 2 mg IN
דורמיקום פרכוסים: 5 mg IV
אטרופין ברדי: 1 mg מקס' 3 mg
פנטניל כאב: 1–2 mcg/kg
TXA טראומה: 1 gr ב-10 דקות`;

// ─── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_AI_API_KEY חסר ב-.env.local" },
      { status: 500 }
    );
  }

  let messages: any[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("no messages");
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: UNI_SYSTEM,
    });

    // Convert messages format: Anthropic → Gemini
    // Gemini uses { role: "user"|"model", parts: [{ text }] }
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (streamErr) {
          console.error("Gemini stream error:", streamErr);
          controller.enqueue(encoder.encode("\n\n[שגיאת חיבור — נסה שוב]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("Gemini API error:", err?.message ?? err);

    const msg =
      err?.message?.includes("API_KEY") ? "מפתח Gemini לא תקין — עדכן ב-.env.local" :
      err?.message?.includes("quota")   ? "חרגת ממגבלת Gemini — נסה שוב מאוחר יותר" :
      "שגיאה בשרת — נסה שוב";

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
