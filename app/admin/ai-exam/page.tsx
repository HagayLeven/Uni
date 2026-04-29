"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Sparkles, BookOpen, Check, X, Loader2, Save, RefreshCw,
  ChevronDown, ChevronUp, Zap, Plus, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = [
  "CPR והחייאה", "טראומה ודימום", "מערכת הנשימה", "מערכת הלב וכלי הדם",
  "הלם (Shock)", "טראומת ראש", "טראומת עמוד שדרה", "כוויות",
  "רעלים והרעלות", "פגיעות ילדים", "לידה בשטח", "פגיעות קיצון חום/קור",
  "אנפילקסיס", "סכרת וחירום", "שבץ מוחי", "פרכוסים",
  "טביעה", "פגיעות חשמל", "טראומה בטנית", "טראומה חזית",
  "פגיעות ספורט", "גריאטרי ורפואת זקנה", "ילדים", "פסיכיאטריה ומשבר",
];

interface Question { q: string; options: string[]; answer: number; }
interface GeneratedExam { title: string; questions: Question[]; }

export default function AIExamPage() {
  return <Suspense><AIExamInner /></Suspense>;
}

function AIExamInner() {
  const searchParams = useSearchParams();
  const [topic, setTopic]           = useState("");
  const [customTopic, setCustomTopic] = useState(() => searchParams.get("topic") ?? "");
  const [count, setCount]           = useState(10);
  const [context, setContext]       = useState("");
  const [generating, setGenerating] = useState(false);
  const [exam, setExam]             = useState<GeneratedExam | null>(null);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [userId, setUserId]         = useState<string | null>(null);
  const [editingQ, setEditingQ]     = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  const generate = async () => {
    const t = customTopic.trim() || topic;
    if (!t) return;
    setGenerating(true);
    setError("");
    setExam(null);

    try {
      const res = await fetch("/api/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, context: context.trim() || undefined, count }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExam(data);
    } catch (e: any) {
      setError(e.message ?? "שגיאה בייצור מבחן");
    }
    setGenerating(false);
  };

  const saveExam = async () => {
    if (!exam || !userId) return;
    setSaving(true);
    await supabase.from("exams").insert({
      title: exam.title,
      questions: exam.questions,
      author_id: userId,
      description: `נוצר ע"י AI · ${exam.questions.length} שאלות`,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateQ = (i: number, field: keyof Question, val: any) => {
    if (!exam) return;
    setExam({ ...exam, questions: exam.questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q) });
  };

  const updateOpt = (qi: number, oi: number, val: string) => {
    if (!exam) return;
    setExam({ ...exam, questions: exam.questions.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q) });
  };

  const deleteQ = (i: number) => {
    if (!exam) return;
    setExam({ ...exam, questions: exam.questions.filter((_, idx) => idx !== i) });
  };

  const activeTopic = customTopic.trim() || topic;

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">יצירת מבחן עם AI</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">בחר נושא → Claude מייצר שאלות → ערוך ושמור</p>
      </div>

      {/* Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        {/* Topic grid */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">נושא מהרשימה</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button key={t} onClick={() => { setTopic(t); setCustomTopic(""); }}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  topic === t && !customTopic
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600")}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Custom topic */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">או הכנס נושא חופשי</label>
          <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setTopic(""); }}
            placeholder="לדוגמה: פגיעות ראש בגיל הילדות..."
            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* Context (optional) */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">הקשר נוסף (אופציונלי)</label>
          <textarea value={context} onChange={e => setContext(e.target.value)} rows={3}
            placeholder="הדבק כאן טקסט מהמצגת, נקודות עיקריות, פרוטוקולים ספציפיים..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
        </div>

        {/* Count */}
        <div className="flex items-center gap-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">כמות שאלות:</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={cn("w-10 h-9 rounded-lg text-sm font-bold transition-colors",
                  count === n ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-200")}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button onClick={generate}
          disabled={!activeTopic || generating}
          className="w-full h-12 bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
          {generating
            ? <><Loader2 size={16} className="animate-spin" /> Claude מייצר שאלות...</>
            : <><Sparkles size={16} /> צור {count} שאלות על {activeTopic || "..."}</>}
        </button>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <X size={14} /> {error}
          </p>
        )}
      </div>

      {/* Generated exam */}
      {exam && (
        <div className="space-y-4">
          {/* Title + actions */}
          <div className="flex items-center justify-between gap-3">
            <input value={exam.title} onChange={e => setExam({ ...exam, title: e.target.value })}
              className="flex-1 h-10 bg-gray-900 border border-gray-700 rounded-xl px-4 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            <div className="flex gap-2 shrink-0">
              <button onClick={generate} disabled={generating}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl transition-colors">
                <RefreshCw size={13} /> ייצר מחדש
              </button>
              <button onClick={saveExam} disabled={saving || saved}
                className={cn("flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-colors",
                  saved ? "bg-green-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white")}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> נשמר!</> : <><Save size={14} /> שמור מבחן</>}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">{exam.questions.length} שאלות · לחץ על שאלה לעריכה</p>

          {/* Questions */}
          <div className="space-y-3">
            {exam.questions.map((q, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Question header */}
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="text-xs font-bold text-indigo-400 shrink-0 mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    {editingQ === i ? (
                      <input value={q.q} onChange={e => updateQ(i, "q", e.target.value)}
                        className="w-full bg-gray-800 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none" />
                    ) : (
                      <p className="text-sm text-gray-100 leading-relaxed">{q.q}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditingQ(editingQ === i ? null : i)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                      {editingQ === i ? <Check size={13} /> : <Sparkles size={13} />}
                    </button>
                    <button onClick={() => deleteQ(i)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="px-4 pb-3 grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors",
                      q.answer === oi
                        ? "bg-green-500/10 border-green-500/40 text-green-300"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-400")}>
                      <button onClick={() => updateQ(i, "answer", oi)}
                        className={cn("w-4 h-4 rounded-full border-2 shrink-0 transition-colors",
                          q.answer === oi ? "bg-green-500 border-green-400" : "border-gray-600 hover:border-green-500/60")}>
                      </button>
                      {editingQ === i ? (
                        <input value={opt} onChange={e => updateOpt(i, oi, e.target.value)}
                          className="flex-1 bg-transparent border-b border-gray-600 focus:outline-none focus:border-indigo-400 text-xs py-0.5" />
                      ) : (
                        <span className="flex-1">{opt}</span>
                      )}
                      {q.answer === oi && <Check size={11} className="text-green-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save bottom */}
          <button onClick={saveExam} disabled={saving || saved}
            className={cn("w-full h-12 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2",
              saved ? "bg-green-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white")}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> שומר...</> :
             saved ? <><Check size={15} /> המבחן נשמר בהצלחה!</> :
             <><Save size={15} /> שמור {exam.questions.length} שאלות</>}
          </button>
        </div>
      )}
    </div>
  );
}
