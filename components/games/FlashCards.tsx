"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Cards data ───────────────────────────────────────────────────────────────

const CARDS = [
  {
    front: "CPR מבוגר — סדר פעולות",
    back:  "C-A-B: \n1. עיסויים 100–120/דק, 5–6 ס\"מ\n2. נתיב אוויר — גב/לסת\n3. הנשמות — 30:2\n4. שוק מוקדם",
    category: "CPR",
  },
  {
    front: "VF — תרופות לפי סדר",
    back:  "1. שוק × 3 (200→300→360J)\n2. אדרנלין 1 mg (אחרי 2 סבבים)\n3. אמיודרון 300 mg\n4. אדרנלין כל 3–5 דקות\n5. אמיודרון 150 mg",
    category: "CPR",
  },
  {
    front: "ACS — סדר טיפול",
    back:  "1. O₂ → SpO₂ 92–96%\n2. אספירין 160–325 mg לעיסה\n3. ניטרולינגואל 0.4 mg SL\n4. נוזלים 250 ml אם לחץ דם < 100\n5. הפרין 5000 IU ב-STEMI\n6. הודע לצנתורים",
    category: "ACS",
  },
  {
    front: "אנפילקסיס — טיפול ראשוני",
    back:  "1. אדרנלין IM 0.3–0.5 mg לירך\n2. עירוי מהיר 1–4 L/hr\n3. ונטולין בתסמינים נשימתיים\n4. סולומדרול 125 mg\n5. אינטובציה מוקדמת בסטרידור",
    category: "אנפילקסיס",
  },
  {
    front: "RSI — סדציה + שיתוק",
    back:  "סדציה:\n• אטומידאט 0.3 mg/kg\n• קטמין 2–3 mg/kg\n• דורמיקום 0.1 mg/kg (לא < 100)\n\nשיתוק:\n• רוקורוניום 0.6 mg/kg\n\nמקסימום 3 ניסיונות → SGA → קריקו",
    category: "נתיב אוויר",
  },
  {
    front: "אסתמה קשה — טיפול",
    back:  "1. ונטולין 5 mg × 3\n2. אירובנט 0.5 mg\n3. מגנזיום 2 gr ב-10 דקות\n4. סולומדרול 125 mg\n5. אדרנלין IM 0.5 mg (< 40, ללא IHD)",
    category: "נשימה",
  },
  {
    front: "START טריאז' — סדר",
    back:  "1. נשימה? לא → פתח נתיב\n   עדיין לא → שחור\n2. > 30 נשימות? → אדום\n3. דופק רדיאלי? מילוי > 2ש? → אדום\n4. פקודות פשוטות? לא → אדום\n   כן → צהוב",
    category: "אר\"ן",
  },
  {
    front: "פרכוסים — טיפול",
    back:  "1. מנע אספירציה + TBI\n2. דורמיקום 5 mg IV / 10 mg IM/IN\n3. גלוקוז אם < 60 mg%\n4. מגנזיום 4 gr בהיריון",
    category: "נוירולוגיה",
  },
  {
    front: "CHF — בצקת ריאות",
    back:  "1. O₂ (SpO₂ < 92%)\n2. ניטרולינגואל 0.4 mg SL × 3\n3. פוסיד 1 mg/kg\n4. איזוקט PUSH 1–2 mg\n5. CPAP PEEP 5→10 cmH₂O",
    category: "לב",
  },
  {
    front: "ROSC — לאחר החייאה",
    back:  "SpO₂ 92–98% | ETCO₂ 35–45\nSBP > 90 mmHg\n• אמיודרון 150 mg → 1 mg/min\n• אדרנלין 10–20 mcg PUSH\n• דופמין 5–20 mcg/kg/min\n• STEMI → הודע לצנתורים",
    category: "CPR",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface FlashCardsProps { onBack: () => void; }

export default function FlashCards({ onBack }: FlashCardsProps) {
  const [cards] = useState(() => shuffle(CARDS));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const card = cards[index];
  const progress = (index / cards.length) * 100;

  const next = (markKnown: boolean) => {
    if (markKnown) setKnown((k) => new Set([...k, index]));
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % cards.length), 100);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    "CPR": "bg-red-500/20 text-red-400",
    "ACS": "bg-orange-500/20 text-orange-400",
    "נתיב אוויר": "bg-blue-500/20 text-blue-400",
    "נשימה": "bg-teal-500/20 text-teal-400",
    "לב": "bg-pink-500/20 text-pink-400",
    "נוירולוגיה": "bg-purple-500/20 text-purple-400",
    "אנפילקסיס": "bg-yellow-500/20 text-yellow-400",
    "אר\"ן": "bg-green-500/20 text-green-400",
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{index + 1} / {cards.length}</span>
            <span className="text-xs text-green-400">{known.size} ידוע</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {/* Card */}
        <div
          className={cn(
            "w-full max-w-sm min-h-48 rounded-3xl border p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none",
            flipped
              ? "bg-indigo-600/10 border-indigo-500/30"
              : "bg-gray-900 border-gray-800 hover:border-gray-700"
          )}
          onClick={() => setFlipped((v) => !v)}
        >
          {/* Category badge */}
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-semibold mb-4",
            CATEGORY_COLORS[card.category] ?? "bg-gray-700 text-gray-400"
          )}>
            {card.category}
          </span>

          {flipped ? (
            <div className="whitespace-pre-wrap text-sm text-indigo-200 leading-relaxed text-center">
              {card.back}
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-white">{card.front}</p>
              <p className="text-xs text-gray-500 mt-3">לחץ לגלות</p>
            </div>
          )}
        </div>

        {/* Hint */}
        {!flipped && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <RotateCw size={12} />
            הקש כדי להפוך
          </div>
        )}

        {/* Actions */}
        {flipped && (
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => next(false)}
              className="flex-1 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-semibold text-sm transition-colors hover:bg-red-500/20"
            >
              עוד צריך לתרגל
            </button>
            <button
              onClick={() => next(true)}
              className="flex-1 h-12 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl font-semibold text-sm transition-colors hover:bg-green-500/20"
            >
              ידעתי! ✓
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={() => { setFlipped(false); setTimeout(() => setIndex((i) => (i - 1 + cards.length) % cards.length), 100); }}
            className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => { setFlipped(false); setTimeout(() => setIndex((i) => (i + 1) % cards.length), 100); }}
            className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
