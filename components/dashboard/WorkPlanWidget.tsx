"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, ChevronLeft, Calendar, ClipboardList, FileText, Target, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Week {
  id: string;
  week_number: number;
  title: string;
  description: string;
  topics: string[];
  exam_id: string | null;
  notebook_id: string | null;
  due_date: string | null;
}
interface Progress { week_id: string; completed: boolean; }

export function WorkPlanWidget() {
  const [weeks, setWeeks]     = useState<Week[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [planTitle, setPlanTitle] = useState("");
  const [exams, setExams]     = useState<Record<string,string>>({});
  const [notebooks, setNotebooks] = useState<Record<string,string>>({});
  const [userId, setUserId]   = useState<string|null>(null);
  const [marking, setMarking] = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get user's course
      const { data: profile } = await supabase.from("profiles").select("course_id").eq("id", user.id).single();
      if (!profile?.course_id) { setLoading(false); return; }

      // Get work plan for course
      const { data: plan } = await supabase.from("work_plans").select("id,title").eq("course_id", profile.course_id).single();
      if (!plan) { setLoading(false); return; }
      setPlanTitle(plan.title);

      // Get weeks
      const { data: ws } = await supabase.from("work_plan_weeks").select("*").eq("plan_id", plan.id).order("week_number");
      if (!ws?.length) { setLoading(false); return; }
      setWeeks(ws);

      // Get user progress
      const { data: prog } = await supabase.from("work_plan_progress")
        .select("week_id,completed").eq("user_id", user.id).in("week_id", ws.map(w=>w.id));
      setProgress(prog ?? []);

      // Exam + notebook names
      const examIds = ws.filter(w=>w.exam_id).map(w=>w.exam_id!);
      const nbIds   = ws.filter(w=>w.notebook_id).map(w=>w.notebook_id!);
      if (examIds.length) {
        const { data: e } = await supabase.from("exams").select("id,title").in("id",examIds);
        const map: Record<string,string> = {};
        (e??[]).forEach(x=>map[x.id]=x.title);
        setExams(map);
      }
      if (nbIds.length) {
        const { data: n } = await supabase.from("notebooks").select("id,title").in("id",nbIds);
        const map: Record<string,string> = {};
        (n??[]).forEach(x=>map[x.id]=x.title);
        setNotebooks(map);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function toggleComplete(weekId: string, current: boolean) {
    if (!userId) return;
    setMarking(weekId);
    const newVal = !current;
    await supabase.from("work_plan_progress").upsert(
      { week_id: weekId, user_id: userId, completed: newVal, completed_at: newVal ? new Date().toISOString() : null },
      { onConflict: "week_id,user_id" }
    );
    setProgress(p => {
      const exists = p.find(x => x.week_id === weekId);
      if (exists) return p.map(x => x.week_id === weekId ? { ...x, completed: newVal } : x);
      return [...p, { week_id: weekId, completed: newVal }];
    });
    setMarking(null);
  }

  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex justify-center">
      <Loader2 size={18} className="animate-spin text-indigo-500" />
    </div>
  );

  if (!weeks.length) return null;

  const done  = progress.filter(p => p.completed).length;
  const pct   = Math.round(done / weeks.length * 100);
  const nextWeek = weeks.find(w => !progress.find(p => p.week_id === w.id && p.completed));
  const lateWeeks = weeks.filter(w => {
    const wp = progress.find(p => p.week_id === w.id);
    return w.due_date && new Date(w.due_date) < new Date() && !wp?.completed;
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">תוכנית הלימוד שלי</h3>
        </div>
        <div className="flex items-center gap-2">
          {lateWeeks.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
              <AlertCircle size={9}/> {lateWeeks.length} באיחור
            </span>
          )}
          <span className={cn("text-sm font-bold", pct===100?"text-green-400":"text-indigo-400")}>{pct}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${pct}%`}} />
      </div>

      {/* Next up */}
      {nextWeek && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 space-y-2">
          <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">הבא בתור ← שבוע {nextWeek.week_number}</p>
          <p className="text-sm font-semibold text-white">{nextWeek.title}</p>
          {nextWeek.description && <p className="text-xs text-gray-400 line-clamp-2">{nextWeek.description}</p>}
          <div className="flex gap-2 flex-wrap">
            {nextWeek.exam_id && exams[nextWeek.exam_id] && (
              <Link href={`/exams`} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                <ClipboardList size={9}/> {exams[nextWeek.exam_id]}
              </Link>
            )}
            {nextWeek.notebook_id && notebooks[nextWeek.notebook_id] && (
              <Link href={`/notebooks`} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors">
                <FileText size={9}/> {notebooks[nextWeek.notebook_id]}
              </Link>
            )}
            {nextWeek.due_date && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Calendar size={9}/> {nextWeek.due_date}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Week checklist */}
      <div className="space-y-1.5">
        {weeks.map(w => {
          const wp = progress.find(p => p.week_id === w.id);
          const isDone = wp?.completed ?? false;
          const isLate = w.due_date && new Date(w.due_date) < new Date() && !isDone;
          return (
            <button key={w.id} onClick={() => toggleComplete(w.id, isDone)}
              disabled={marking === w.id}
              className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-start transition-all",
                isDone ? "bg-green-500/10 border-green-500/20" :
                isLate  ? "bg-red-500/10 border-red-500/20" :
                "bg-gray-800/50 border-gray-700/50 hover:border-gray-600")}>
              <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                isDone ? "bg-green-500 border-green-400" :
                isLate  ? "border-red-500/60" : "border-gray-600")}>
                {marking === w.id ? <Loader2 size={9} className="animate-spin text-white"/> :
                 isDone ? <Check size={9} className="text-white"/> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium truncate", isDone ? "text-green-300 line-through" : isLate ? "text-red-300" : "text-gray-200")}>
                  שבוע {w.week_number} — {w.title}
                </p>
              </div>
              {isLate && <AlertCircle size={11} className="text-red-400 shrink-0"/>}
              {isDone && <Check size={11} className="text-green-400 shrink-0"/>}
            </button>
          );
        })}
      </div>

      {pct === 100 && (
        <div className="text-center py-2">
          <p className="text-green-400 font-semibold text-sm">🎉 סיימת את כל תוכנית הלימוד!</p>
        </div>
      )}
    </div>
  );
}
