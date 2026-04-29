"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart2, BookOpen, ChevronDown, Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  title: string;
  questions: { q: string; options: string[]; answer: number }[];
}

interface Attempt {
  id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>; // question index → chosen index
  completed_at: string;
}

interface QuestionStat {
  index: number;
  question: string;
  correct_answer: string;
  total: number;
  correct: number;
  pct: number;
  wrong_distribution: Record<string, number>; // option → count
}

export default function ExamAnalysisPage() {
  const [exams, setExams]       = useState<Exam[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats]       = useState<QuestionStat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    supabase.from("exams").select("id, title, questions").order("created_at", { ascending: false })
      .then(({ data }) => {
        setExams((data as Exam[]) ?? []);
        if (data?.[0]) setSelected(data[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setAnalyzing(true);
    supabase.from("exam_attempts").select("*").eq("exam_id", selected)
      .then(({ data }) => {
        const atts = (data ?? []).map((a: any) => ({
          ...a,
          answers: typeof a.answers === "string" ? JSON.parse(a.answers) : (a.answers ?? {}),
        })) as Attempt[];
        setAttempts(atts);

        const exam = exams.find(e => e.id === selected);
        if (!exam || !atts.length) { setStats([]); setAnalyzing(false); return; }

        const qs: QuestionStat[] = exam.questions.map((q, i) => {
          const total = atts.length;
          const correct = atts.filter(a => a.answers[i] === q.answer || a.answers[String(i)] === q.answer).length;
          const wrongDist: Record<string, number> = {};
          atts.forEach(a => {
            const chosen = a.answers[i] ?? a.answers[String(i)];
            if (chosen !== undefined && chosen !== q.answer) {
              const label = q.options[chosen] ?? `אפשרות ${chosen}`;
              wrongDist[label] = (wrongDist[label] ?? 0) + 1;
            }
          });
          return {
            index: i,
            question: q.q,
            correct_answer: q.options[q.answer] ?? "",
            total,
            correct,
            pct: Math.round((correct / total) * 100),
            wrong_distribution: wrongDist,
          };
        });

        setStats(qs.sort((a, b) => a.pct - b.pct)); // hardest first
        setAnalyzing(false);
      });
  }, [selected, exams]);

  const exam = exams.find(e => e.id === selected);
  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length / (exam?.questions?.length || 1) * 100)
    : null;
  const passRate = attempts.length
    ? Math.round(attempts.filter(a => a.passed).length / attempts.length * 100)
    : null;

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">ניתוח מבחנים</h1>
        <p className="text-sm text-gray-500 mt-1">אילו שאלות קשות לחניכים — לפי נתונים אמיתיים</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
          <p>אין מבחנים עדיין</p>
        </div>
      ) : (
        <>
          {/* Exam selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <select value={selected} onChange={e => setSelected(e.target.value)}
                className="h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 pe-8 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 appearance-none min-w-52">
                {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Summary stats */}
          {attempts.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "נסיונות", value: attempts.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { label: "ציון ממוצע", value: `${avgScore}%`, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                { label: "אחוז מעבר", value: `${passRate}%`, color: passRate! >= 70 ? "text-green-400" : "text-red-400", bg: passRate! >= 70 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {analyzing ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
              <p>אין נסיונות עדיין למבחן זה</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">שאלות לפי קושי (הקשות ראשון)</h2>
              </div>

              {stats.map((q) => (
                <div key={q.index} className={cn("bg-gray-900 border rounded-xl p-4 space-y-3",
                  q.pct < 50 ? "border-red-500/30" : q.pct < 75 ? "border-yellow-500/20" : "border-gray-800")}>
                  <div className="flex items-start gap-3">
                    {q.pct < 50 && <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100">{q.index + 1}. {q.question}</p>
                      <p className="text-xs text-green-400 mt-1">✓ תשובה נכונה: {q.correct_answer}</p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className={cn("text-lg font-bold",
                        q.pct >= 75 ? "text-green-400" : q.pct >= 50 ? "text-yellow-400" : "text-red-400")}>
                        {q.pct}%
                      </p>
                      <p className="text-[10px] text-gray-500">{q.correct}/{q.total} ענו נכון</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all",
                      q.pct >= 75 ? "bg-green-500" : q.pct >= 50 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${q.pct}%` }} />
                  </div>

                  {/* Wrong answers distribution */}
                  {Object.keys(q.wrong_distribution).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">תשובות שגויות נפוצות</p>
                      {Object.entries(q.wrong_distribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([opt, count]) => (
                          <div key={opt} className="flex items-center gap-2">
                            <div className="h-1 bg-red-500/40 rounded-full"
                              style={{ width: `${Math.round(count / q.total * 100)}%`, minWidth: 4 }} />
                            <span className="text-xs text-gray-500 truncate">{opt}</span>
                            <span className="text-xs text-red-400 font-medium shrink-0">{count}×</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
