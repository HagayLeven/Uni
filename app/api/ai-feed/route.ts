import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const TOPICS = [
  "שאלת מבחן על פרוטוקול החייאה (CPR, VF/VT, מינוני תרופות)",
  "סיכום פרוטוקול טיפול בחירום (ACS, CVA, אנפילקסיס, אסתמה, טראומה)",
  "מקרה קליני מהשטח — תאר תרחיש ושאל שאלת חשיבה",
  "חישוב מינון תרופה לפי משקל (ילד או מבוגר)",
  "טיפ קליני חשוב שפראמדיקים מתחילים לרוב מפספסים",
];

const SYSTEM = `אתה Uni, עוזרת AI של פראמדיקים מד"א.
צור פוסט לימודי קצר ומעניין בעברית לפלטפורמה של פראמדיקי מד"א.
הפוסט צריך להיות מדויק קלינית, קצר (עד 200 מילה), ומעורר מחשבה.
החזר JSON בדיוק בפורמט הבא (ללא markdown, ללא \`\`\`):
{
  "type": "summary" | "question" | "resource" | "exam_question",
  "title": "כותרת קצרה ומושכת (עד 80 תווים)",
  "body": "תוכן הפוסט בעברית"
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_AI_API_KEY חסר" }, { status: 500 });
  }

  let authorId: string;
  let count: number = 3;
  let topicIndex: number | null = null;

  try {
    const body = await req.json();
    authorId = body.author_id;
    if (!authorId) throw new Error("author_id חסר");
    if (body.count) count = Math.min(Number(body.count), 5);
    if (body.topic_index != null) topicIndex = Number(body.topic_index);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "בקשה לא תקינה" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM,
  });

  const db = createClient(supabaseUrl, supabaseServiceKey);
  const generated: any[] = [];
  const errors: string[] = [];

  for (let i = 0; i < count; i++) {
    const idx = topicIndex != null ? topicIndex : (Date.now() + i) % TOPICS.length;
    const topic = TOPICS[idx];

    try {
      const result = await model.generateContent(`צור פוסט בנושא: ${topic}`);
      const raw = result.response.text().trim();

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("תגובה לא תקינה מ-Gemini");
        parsed = JSON.parse(match[0]);
      }

      const content = `${parsed.title ?? "פוסט AI"}\n${parsed.body ?? ""}`.trim();
      const type = ["summary", "question", "resource", "exam_question"].includes(parsed.type)
        ? parsed.type
        : "resource";

      const { data, error } = await db
        .from("posts")
        .insert({
          content,
          type,
          author_id: authorId,
          sensitivity: "safe",
          upvotes: 0,
          downvotes: 0,
          is_announcement: false,
        })
        .select("id, content, type, created_at")
        .single();

      if (error) throw new Error(error.message);
      generated.push(data);
    } catch (err: any) {
      errors.push(err.message ?? "שגיאה לא ידועה");
    }

    if (i < count - 1) await new Promise((r) => setTimeout(r, 400));
  }

  return NextResponse.json({
    generated: generated.length,
    posts: generated,
    errors: errors.length ? errors : undefined,
  });
}
