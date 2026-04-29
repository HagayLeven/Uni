"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  BookOpen, Check, ChevronRight, Clock, Loader2,
  Plus, RotateCcw, Trophy, X, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

interface Question { q: string; options: string[]; answer: number; }
interface Attempt { score: number; total: number; completed_at: string; }
interface Exam {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  author_id: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
  lastAttempt?: Attempt | null;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק'`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש'`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

// ─── Take Exam ───────────────────────────────────────────────────────────────
function TakeExam({ exam, userId, onBack, onFinished }: {
  exam: Exam; userId: string; onBack: () => void;
  onFinished: (score: number, total: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = exam.questions.filter((q, i) => answers[i] === q.answer).length;
  const pct   = submitted ? Math.round((score / exam.questions.length) * 100) : 0;

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) return;
    setSaving(true);
    const sc = exam.questions.filter((q, i) => answers[i] === q.answer).length;
    await supabase.from("exam_attempts").insert({
      exam_id: exam.id,
      user_id: userId,
      answers: JSON.stringify(answers),
      score: sc,
      passed: sc / exam.questions.length >= 0.7,
      completed_at: new Date().toISOString(),
    });
    setSubmitted(true);
    setSaving(false);
    onFinished(sc, exam.questions.length);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors">
          <ChevronRight size={18} />
        </button>
        <div>
          <h2 className="text-base font-bold text-white">{exam.title}</h2>
          {exam.description && <p className="text-xs text-gray-500 mt-0.5">{exam.description}</p>}
        </div>
      </div>

      {submitted && (
        <div className={cn("flex items-center gap-4 p-5 rounded-2xl border",
          pct >= 80 ? "bg-green-500/10 border-green-500/30"
          : pct >= 60 ? "bg-yellow-500/10 border-yellow-500/30"
          : "bg-red-500/10 border-red-500/30")}>
          <Trophy size={28} className={pct >= 80 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : "text-red-400"} />
          <div>
            <p className="text-lg font-bold text-white">{score}/{exam.questions.length} נכון</p>
            <p className="text-sm text-gray-400">{pct}% · {pct >= 70 ? "עבר ✅" : "נכשל ❌"}</p>
          </div>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }}
            className="me-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-xl transition-colors">
            <RotateCcw size={12} /> נסה שוב
          </button>
        </div>
      )}

      <div className="space-y-4">
        {exam.questions.map((q, i) => (
          <div key={i} className={cn("bg-gray-900 border rounded-xl p-4 space-y-3",
            submitted
              ? answers[i] === q.answer ? "border-green-500/30" : "border-red-500/30"
              : "border-gray-800")}>
            <p className="text-sm font-semibold text-gray-100">{i + 1}. {q.q}</p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[i] === oi;
                const correct  = q.answer === oi;
                return (
                  <button key={oi}
                    onClick={() => !submitted && setAnswers((a) => ({ ...a, [i]: oi }))}
                    disabled={submitted}
                    className={cn(
                      "text-start px-4 py-2.5 rounded-xl text-sm border transition-colors",
                      submitted
                        ? correct
                          ? "bg-green-500/20 border-green-500/50 text-green-300"
                          : selected
                          ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : "bg-gray-800/50 border-gray-700 text-gray-500"
                        : selected
                        ? "bg-indigo-600/30 border-indigo-500/60 text-indigo-200"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    )}>
                    <span className="font-mono text-xs me-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {submitted && correct && <Check size={13} className="inline me-2 text-green-400" />}
                  </button>
                );
              })}
            </div>
            {submitted && answers[i] !== q.answer && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Check size={11} /> תשובה נכונה: {q.options[q.answer]}
              </p>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < exam.questions.length || saving}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
          {saving ? <Loader2 size={15} className="animate-spin" /> : `הגש מבחן (${Object.keys(answers).length}/${exam.questions.length})`}
        </button>
      )}
    </div>
  );
}

// ─── Create Exam ──────────────────────────────────────────────────────────────
function CreateExam({ userId, onCreated, onBack }: {
  userId: string; onCreated: (e: Exam) => void; onBack: () => void;
}) {
  const [title, setTitle]     = useState("");
  const [desc, setDesc]       = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { q: "", options: ["", "", "", ""], answer: 0 }
  ]);
  const [saving, setSaving]   = useState(false);

  const addQ     = () => setQuestions((p) => [...p, { q: "", options: ["", "", "", ""], answer: 0 }]);
  const removeQ  = (i: number) => setQuestions((p) => p.filter((_, idx) => idx !== i));
  const updateQ  = (i: number, field: keyof Question, val: any) =>
    setQuestions((p) => p.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOpt = (qi: number, oi: number, val: string) =>
    setQuestions((p) => p.map((q, idx) => idx === qi
      ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("exams")
      .insert({ title: title.trim(), description: desc.trim() || null, questions, author_id: userId })
      .select("*, profiles(full_name)")
      .single();
    if (data) onCreated(data as any);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={onBack} className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors">
          <ChevronRight size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Plus size={18} className="text-indigo-400" />
          <h2 className="text-base font-bold text-white">מבחן חדש</h2>
        </div>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם המבחן" required
        className="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="תיאור (אופציונלי)"
        className="w-full h-10 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 shrink-0">שאלה {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQ(qi)} className="me-auto p-1 text-gray-600 hover:text-red-400 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
            <input value={q.q} onChange={(e) => updateQ(qi, "q", e.target.value)} placeholder="טקסט השאלה" required
              className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="relative">
                  <input value={opt} onChange={(e) => updateOpt(qi, oi, e.target.value)}
                    placeholder={`אפשרות ${String.fromCharCode(65 + oi)}`} required
                    className={cn("w-full h-9 rounded-xl px-3 ps-8 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none transition-colors border",
                      q.answer === oi ? "bg-green-500/10 border-green-500/40 focus:border-green-400" : "bg-gray-800 border-gray-700 focus:border-indigo-500")} />
                  <button type="button" onClick={() => updateQ(qi, "answer", oi)}
                    className={cn("absolute top-1/2 -translate-y-1/2 start-2.5 w-4 h-4 rounded-full border-2 transition-colors",
                      q.answer === oi ? "bg-green-500 border-green-400" : "border-gray-600 hover:border-gray-400")} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-600">לחץ על העיגול הירוק לסמן תשובה נכונה</p>
          </div>
        ))}
      </div>

      <button type="button" onClick={addQ}
        className="flex items-center gap-2 w-full py-3 border border-dashed border-gray-700 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors justify-center">
        <Plus size={14} /> הוסף שאלה
      </button>

      <button type="submit" disabled={saving || !title.trim()}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : "שמור מבחן"}
      </button>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExamsPage() {
  const [exams, setExams]     = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId]   = useState<string | null>(null);
  const [view, setView]       = useState<"list" | "take" | "create">("list");
  const [active, setActive]   = useState<Exam | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setIsAdmin(user.email === ADMIN_EMAIL);

      const [{ data: examsData }, { data: attemptsData }] = await Promise.all([
        supabase.from("exams").select("*, profiles(full_name)").order("created_at", { ascending: false }),
        supabase.from("exam_attempts").select("exam_id, score, completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }),
      ]);

      const attemptMap: Record<string, Attempt> = {};
      (attemptsData ?? []).forEach((a: any) => {
        if (!attemptMap[a.exam_id]) {
          attemptMap[a.exam_id] = { score: a.score, total: 0, completed_at: a.completed_at };
        }
      });

      const enriched = (examsData ?? []).map((e: any) => ({
        ...e,
        lastAttempt: attemptMap[e.id]
          ? { ...attemptMap[e.id], total: e.questions?.length ?? 0 }
          : null,
      }));

      setExams(enriched as Exam[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleCreated = (exam: Exam) => {
    setExams((prev) => [exam, ...prev]);
    setView("list");
  };

  const handleFinished = (score: number, total: number) => {
    if (!active) return;
    setExams((prev) => prev.map((e) => e.id === active.id
      ? { ...e, lastAttempt: { score, total, completed_at: new Date().toISOString() } }
      : e));
  };

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-3xl mx-auto px-4 py-6">

            {view === "take" && active && userId ? (
              <TakeExam exam={active} userId={userId}
                onBack={() => { setView("list"); setActive(null); }}
                onFinished={handleFinished} />
            ) : view === "create" && isAdmin ? (
              <CreateExam userId={userId!} onCreated={handleCreated} onBack={() => setView("list")} />
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-400" />
                    <h1 className="text-lg font-bold text-white">מבחנים</h1>
                    <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{exams.length}</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => setView("create")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                      <Plus size={15} /> מבחן חדש
                    </button>
                  )}
                </div>

                {loading && <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>}

                {!loading && exams.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-20">
                    <BookOpen size={36} className="text-gray-700" />
                    <p className="text-gray-500 text-sm">אין מבחנים עדיין</p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {exams.map((exam) => {
                    const att = exam.lastAttempt;
                    const pct = att ? Math.round((att.score / (att.total || exam.questions.length)) * 100) : null;
                    return (
                      <button key={exam.id} onClick={() => { setActive(exam); setView("take"); }}
                        className="text-start bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl p-4 space-y-3 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <BookOpen size={16} className="text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-100 truncate">{exam.title}</h3>
                            {exam.description && <p className="text-xs text-gray-500 truncate">{exam.description}</p>}
                          </div>
                          {pct !== null && (
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
                              pct >= 70 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>
                              {pct}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>{exam.questions?.length ?? 0} שאלות</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(exam.created_at)}</span>
                        </div>
                        <div className={cn("w-full py-2 rounded-lg text-xs font-medium text-center transition-colors border",
                          att
                            ? "bg-indigo-500/5 border-indigo-500/15 text-indigo-400"
                            : "bg-indigo-600/10 hover:bg-indigo-600/20 border-indigo-500/20 text-indigo-400")}>
                          {att ? `נסה שוב ← (ציון אחרון: ${pct}%)` : "התחל מבחן ←"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
