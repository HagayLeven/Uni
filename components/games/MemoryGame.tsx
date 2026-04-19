"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Card pairs ───────────────────────────────────────────────────────────────

const PAIRS = [
  { a: "אדרנלין CPR",       b: "1 mg IV כל 3–5 דקות" },
  { a: "אמיודרון מנה I",    b: "300 mg מהול 20 ml"   },
  { a: "אטרופין ברדיקרדיה", b: "1 mg IV מקס' 3 mg"   },
  { a: "אספירין ACS",       b: "160–325 mg לעיסה"    },
  { a: "נרקן הרעלה",        b: "2 mg IN / 0.4–2 mg IV" },
  { a: "דורמיקום פרכוסים",  b: "5 mg IV / 10 mg IN"  },
  { a: "מגנזיום TdP",       b: "2 gr ב-100 ml ב-10 דק'" },
  { a: "אדנוזין SVT",       b: "6 mg PUSH + 20 ml"   },
];

interface Card {
  id: number;
  text: string;
  pairId: number;
  side: "a" | "b";
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface MemoryGameProps { onBack: () => void; }

export default function MemoryGame({ onBack }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>(() => {
    const pairs = PAIRS.slice(0, 8);
    const all: Card[] = [];
    pairs.forEach((p, i) => {
      all.push({ id: i * 2,     text: p.a, pairId: i, side: "a", flipped: false, matched: false });
      all.push({ id: i * 2 + 1, text: p.b, pairId: i, side: "b", flipped: false, matched: false });
    });
    return shuffle(all);
  });

  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [checking, setChecking] = useState(false);

  const flipped = cards.filter((c) => c.flipped && !c.matched);

  const handleFlip = (id: number) => {
    if (checking) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newSelected = [...selected, id];
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setChecking(true);
      const [a, b] = newSelected.map((sid) => cards.find((c) => c.id === sid)!);

      setTimeout(() => {
        if (a.pairId === b.pairId) {
          // Match!
          setCards((prev) => prev.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, matched: true } : c
          ));
          setSelected([]);
          setChecking(false);
          // Check win
          setCards((prev) => {
            const allMatched = prev.every((c) => c.matched || (c.id === a.id || c.id === b.id));
            // After state update, check if all matched
            return prev;
          });
        } else {
          // No match — flip back
          setCards((prev) => prev.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setChecking(false);
        }
      }, 900);
    }
  };

  // Check win
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setTimeout(() => setWon(true), 300);
    }
  }, [cards]);

  const reset = () => {
    const pairs = PAIRS.slice(0, 8);
    const all: Card[] = [];
    pairs.forEach((p, i) => {
      all.push({ id: i * 2,     text: p.a, pairId: i, side: "a", flipped: false, matched: false });
      all.push({ id: i * 2 + 1, text: p.b, pairId: i, side: "b", flipped: false, matched: false });
    });
    setCards(shuffle(all));
    setSelected([]);
    setMoves(0);
    setWon(false);
    setChecking(false);
  };

  if (won) {
    const grade = moves <= 10 ? "מושלם! 🌟" : moves <= 16 ? "מצוין! 🏆" : "כל הכבוד! 👍";
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-5xl">🧠</div>
          <h2 className="text-2xl font-bold text-white">{grade}</h2>
          <p className="text-lg text-gray-300">{moves} מהלכים</p>
          <div className="flex gap-3">
            <button onClick={onBack}
              className="flex-1 h-11 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
              חזור
            </button>
            <button onClick={reset}
              className="flex-1 h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
              שחק שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800">
          <ChevronLeft size={18} />
        </button>
        <h1 className="flex-1 text-sm font-semibold text-white">משחק זיכרון — תרופות ומינונים</h1>
        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <Trophy size={13} />
          {moves} מהלכים
        </div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={cn(
                "aspect-square rounded-xl border transition-all text-[10px] font-semibold leading-tight p-1.5 text-center flex items-center justify-center",
                card.matched
                  ? "bg-green-500/20 border-green-500/40 text-green-300"
                  : card.flipped
                    ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-200"
                    : "bg-gray-800 border-gray-700 text-gray-800 hover:bg-gray-700 cursor-pointer hover:border-gray-600"
              )}
            >
              {(card.flipped || card.matched) ? card.text : "?"}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          התאם תרופה למינון הנכון — {cards.filter((c) => c.matched).length / 2}/{PAIRS.length} זוגות
        </p>
      </div>
    </div>
  );
}
