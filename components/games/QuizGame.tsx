"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Clock, Check, X, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Question bank ─────────────────────────────────────────────────────────────

interface Question {
  q: string;
  options: string[];
  correct: number; // index
  explanation: string;
}

const QUESTION_BANK: Question[] = [
  {
    q: "מה מינון אדרנלין ב-CPR מבוגר?",
    options: ["0.5 mg IV כל 5 דקות", "1 mg IV כל 3–5 דקות", "2 mg IV כל 10 דקות", "0.1 mg/kg IV"],
    correct: 1,
    explanation: "אדרנלין 1 mg IV כל 3–5 דקות — מוזרק רק לאחר 2 סבבים ב-CPR",
  },
  {
    q: "מה יחס עיסויים-הנשמות ב-CPR מבוגר ללא נתיב מתקדם?",
    options: ["15:2", "30:2", "20:2", "10:1"],
    correct: 1,
    explanation: "יחס 30:2 — 30 עיסויים ו-2 הנשמות ללא נתיב מתקדם",
  },
  {
    q: "מה המינון הראשון של אמיודרון ב-VF עמיד?",
    options: ["150 mg", "200 mg", "300 mg", "500 mg"],
    correct: 2,
    explanation: "אמיודרון מנה I — 300 mg מהול ב-20 ml; מנה II — 150 mg",
  },
  {
    q: "מה מינון אספירין ב-ACS?",
    options: ["325 mg IV", "160–325 mg לעיסה", "500 mg PO", "100 mg SL"],
    correct: 1,
    explanation: "אספירין 160–325 mg בלעיסה — מאיץ ספיגה וירידת צבירת טסיות",
  },
  {
    q: "מה ה-ETCO₂ היעד בניהול נתיב אוויר מתקדם?",
    options: ["20–30 mmHg", "45–55 mmHg", "35–45 mmHg", "< 20 mmHg"],
    correct: 2,
    explanation: "ETCO₂ יעד 35–45 mmHg — מצביע על איכות הנשמה ועיסויים",
  },
  {
    q: "מה הצעד הראשון לפי MARCH בטראומה?",
    options: ["Airway", "Circulation", "Massive Hemorrhage", "Respiration"],
    correct: 2,
    explanation: "MARCH — M = Massive Hemorrhage: לחץ ישיר → חוסם עורקים → חבישה לוחצת",
  },
  {
    q: "מה מינון דורמיקום לפרכוסים IV?",
    options: ["10 mg", "2.5 mg", "5 mg", "1 mg/kg"],
    correct: 2,
    explanation: "דורמיקום 5 mg IV — לא לתת אם לחץ דם < 100; IM/IN: 10 mg",
  },
  {
    q: "מה עומק עיסויים בCPR מבוגר?",
    options: ["3–4 ס\"מ", "6–8 ס\"מ", "5–6 ס\"מ", "4–5 ס\"מ"],
    correct: 2,
    explanation: "עומק עיסויים 5–6 ס\"מ — קצב 100–120 לדקה",
  },
  {
    q: "מה מינון נרקן (נלוקסון) IN להרעלת אופיאטים?",
    options: ["0.4 mg", "4 mg", "2 mg", "10 mg"],
    correct: 2,
    explanation: "נרקן IN: 2 mg — יעד: שיפור אוורור, לאו דווקא השכמה מלאה",
  },
  {
    q: "מה הטיפול הראשוני באנפילקסיס?",
    options: ["ונטולין 5 mg", "אדרנלין IM 0.3–0.5 mg לירך", "סולומדרול 125 mg IV", "אדנוזין 6 mg"],
    correct: 1,
    explanation: "אדרנלין IM 0.3–0.5 mg לשריר הירך — טיפול ראשון ועיקרי באנפילקסיס",
  },
  {
    q: "מה השוק הראשון ב-VF במכשיר Corpuls?",
    options: ["150J", "360J", "200J", "100J"],
    correct: 2,
    explanation: "Corpuls: 200J לכל השוקים — LP-12: 200J → 300J → 360J",
  },
  {
    q: "מה מינון אטרופין בברדיקרדיה סימפטומטית?",
    options: ["0.5 mg כל 5 דקות", "1 mg כל 3–5 דקות", "2 mg מנה יחידה", "0.1 mg/kg"],
    correct: 1,
    explanation: "אטרופין 1 mg IV כל 3–5 דקות — מקסימום 3 mg",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface QuizGameProps { onBack: () => void; }

export default function QuizGame({ onBack }: QuizGameProps) {
  const [questions]   = useState(() => shuffle(QUESTION_BANK).slice(0, 10));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  // Timer
  useEffect(() => {
    if (answered || done) return;
    if (timeLeft === 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, done]);

  const handleAnswer = async (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === questions[current].correct;
    const newResults = [...results, isCorrect];
    setResults(newResults);
    if (isCorrect) setScore((s) => s + 1);

    // XP award at end
    if (current === questions.length - 1) {
      const total = newResults.filter(Boolean).length + (isCorrect ? 0 : 0); // already counted
      setTimeout(() => {
        setDone(true);
        awardXP(total);
      }, 1500);
    } else {
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(20);
      }, 1500);
    }
  };

  const awardXP = async (correct: number) => {
    if (correct < 5) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const xpBonus = correct >= 9 ? 20 : correct >= 7 ? 15 : 10;
    const { data: profile } = await supabase
      .from("profiles").select("xp_override").eq("id", user.id).single();
    // Only set xp_override if it's explicitly managed; otherwise trust computed XP
    // We add a post instead to give XP naturally
    await supabase.from("posts").insert({
      content: `🎮 קיבלתי ${xpBonus} XP ממשחק שאלות — ענה נכון ${correct}/10`,
      type: "resource",
      author_id: user.id,
      sensitivity: "safe",
      upvotes: 0,
      downvotes: 0,
      is_announcement: false,
    });
  };

  const q = questions[current];
  const pct = ((current) / questions.length) * 100;

  if (done) {
    const grade = score >= 9 ? "מצוין! 🏆" : score >= 7 ? "טוב מאוד! 🌟" : score >= 5 ? "עובר 👍" : "המשך להתאמן 💪";
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6" dir="rtl">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">{score >= 7 ? "🏆" : "📚"}</div>
          <h2 className="text-2xl font-bold text-white">{grade}</h2>
          <p className="text-4xl font-bold text-indigo-400">{score}/10</p>
          {score >= 5 && (
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-semibold">
              <Zap size={16} /> +{score >= 9 ? 20 : score >= 7 ? 15 : 10} XP
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onBack}
              className="flex-1 h-11 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
              חזור
            </button>
            <button onClick={() => { setCurrent(0); setScore(0); setAnswered(false); setSelected(null); setTimeLeft(20); setDone(false); setResults([]); }}
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              שחק שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">שאלה {current + 1}/{questions.length}</span>
            <div className={cn("flex items-center gap-1 text-sm font-bold tabular-nums",
              timeLeft <= 5 ? "text-red-400" : "text-gray-300")}>
              <Clock size={14} />
              {timeLeft}s
            </div>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
          <Trophy size={14} />
          {score}
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-gray-800">
        <div
          className={cn("h-full transition-all", timeLeft <= 5 ? "bg-red-500" : "bg-green-500")}
          style={{ width: `${(timeLeft / 20) * 100}%`, transitionDuration: "1000ms" }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-5">
        {/* Question */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-base font-semibold text-white leading-relaxed">{q.q}</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let style = "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700";
            if (answered) {
              if (i === q.correct) style = "bg-green-500/20 border-green-500/50 text-green-300";
              else if (i === selected) style = "bg-red-500/20 border-red-500/50 text-red-300";
              else style = "bg-gray-800 border-gray-700 text-gray-500 opacity-50";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-start transition-all",
                  style
                )}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                  {answered && i === q.correct ? <Check size={12} /> :
                   answered && i === selected && i !== q.correct ? <X size={12} /> :
                   String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className={cn(
            "p-4 rounded-xl border text-sm",
            selected === q.correct
              ? "bg-green-500/10 border-green-500/25 text-green-300"
              : "bg-orange-500/10 border-orange-500/25 text-orange-300"
          )}>
            <p className="font-semibold mb-1">{selected === q.correct ? "✅ נכון!" : "❌ לא נכון"}</p>
            <p className="text-xs opacity-90">{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
