"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Loader2, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  questions: { q: string; options: string[]; answer: number }[];
  created_at: string;
}

interface Attempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export default function AdminExamsPage() {
  const [exams, setExams]       = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: e }, { data: a }] = await Promise.all([
        supabase.from("exams").select("*").order("created_at", { ascending: false }),
        supabase.from("exam_attempts")
          .select("*, profiles(full_name, avatar_url)")
          .order("completed_at", { ascending: false }),
      ]);
      setExams((e as Exam[]) ?? []);
      setAttempts((a as Attempt[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const deleteExam = async (id: string) => {
    if (!confirm("למחוק את המבחן וכל הנסיונות?")) return;
    setDeleting(id);
    await supabase.from("exams").delete().eq("id", id);
    setExams((p) => p.filter((e) => e.id !== id));
    setAttempts((p) => p.filter((a) => a.exam_id !== id));
    setDeleting(null);
  };

  const examAttempts = (id: string) => attempts.filter((a) => a.exam_id === id);
  const passRate = (id: string) => {
    const att = examAttempts(id);
    if (!att.length) return null;
    return Math.round((att.filter((a) => a.passed).length / att.length) * 100);
  };

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">ניהול מבחנים</h1>
        <p className="text-sm text-gray-500 mt-1">צפייה במבחנים, תוצאות ומחיקה</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "סה״כ מבחנים", value: exams.length, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "סה״כ נסיונות", value: attempts.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "עברו", value: attempts.filter(a => a.passed).length, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <BookOpen size={36} className="text-gray-700" />
          <p className="text-gray-500 text-sm">אין מבחנים — צור מדף המבחנים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const atts = examAttempts(exam.id);
            const pr   = passRate(exam.id);
            const open = expanded === exam.id;
            return (
              <div key={exam.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-100">{exam.title}</h3>
                    <p className="text-xs text-gray-500">
                      {exam.questions?.length ?? 0} שאלות · {atts.length} נסיונות
                      {pr !== null ? ` · ${pr}% עברו` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pr !== null && (
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                        pr >= 70 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>
                        {pr}%
                      </span>
                    )}
                    <button onClick={() => setExpanded(open ? null : exam.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => deleteExam(exam.id)} disabled={deleting === exam.id}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      {deleting === exam.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-gray-800">
                    {atts.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-gray-600">אין נסיונות עדיין</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead className="bg-gray-800/40">
                          <tr>
                            {["חניך", "ציון", "עבר/נכשל", "תאריך"].map((h) => (
                              <th key={h} className="text-start px-4 py-2 text-gray-500 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {atts.map((a) => (
                            <tr key={a.id} className="hover:bg-gray-800/20">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  {a.profiles?.avatar_url ? (
                                    <img src={a.profiles.avatar_url} className="w-6 h-6 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-[10px] font-bold">
                                      {a.profiles?.full_name?.[0] ?? "?"}
                                    </div>
                                  )}
                                  <span className="text-gray-200">{a.profiles?.full_name ?? "—"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={cn("font-bold", a.passed ? "text-green-400" : "text-red-400")}>
                                  {a.score}/{exam.questions?.length ?? "?"} ({Math.round((a.score / (exam.questions?.length || 1)) * 100)}%)
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                {a.passed
                                  ? <span className="flex items-center gap-1 text-green-400"><Check size={11} /> עבר</span>
                                  : <span className="flex items-center gap-1 text-red-400"><X size={11} /> נכשל</span>}
                              </td>
                              <td className="px-4 py-2.5 text-gray-500">
                                {a.completed_at ? new Date(a.completed_at).toLocaleDateString("he-IL") : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
