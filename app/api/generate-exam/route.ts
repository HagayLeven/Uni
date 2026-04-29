import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, context, count = 10, language = "he" } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "topic required" }, { status: 400 });
    }

    const prompt = `אתה מומחה בהוראת רפואת חירום וחובשות. צור ${count} שאלות בחירה מרובה (multiple choice) בעברית על הנושא: "${topic}".

${context ? `תוכן נוסף לפי המצגת:\n${context}\n` : ""}

דרישות:
- כל שאלה עם 4 אפשרויות (א, ב, ג, ד)
- שאלות ברמת קושי מגוונת (חלק קלות, חלק בינוניות, חלק קשות)
- שאלות קליניות מעשיות — לא תיאורטיות בלבד
- שאלות כמו שנשאלות במבחני חובשים/פראמדיקים
- התשובה הנכונה צריכה להיות ברורה ומבוססת ידע

החזר JSON בלבד, בפורמט הזה בדיוק (ללא טקסט נוסף):
{
  "title": "מבחן: ${topic}",
  "questions": [
    {
      "q": "טקסט השאלה",
      "options": ["אפשרות א", "אפשרות ב", "אפשרות ג", "אפשרות ד"],
      "answer": 0
    }
  ]
}

שדה "answer" הוא האינדקס (0-3) של התשובה הנכונה.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as any).text ?? "";

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("generate-exam error:", err);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
