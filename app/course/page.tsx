"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  BookOpen, Check, ChevronDown, ChevronUp, Clock,
  FileText, Loader2, Lock, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { JoinCoursePrompt } from "@/components/dashboard/JoinCoursePrompt";

interface Week {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  completed: boolean;
  items: WeekItem[];
}

interface WeekItem {
  id: string;
  item_type: "notebook" | "post" | "exam";
  item_id: string;
  label: string;
  link: string;
}

export default function CoursePage() {
  const [weeks, setWeeks]         = useState<Week[]>([]);
  const [loading, setLoading]     = useState(true);
  const [courseId, setCourseId]   = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const [openWeek, setOpenWeek]   = useState<string | null>(null);
  const [userId, setUserId]       = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get user's course
      const { data: profile } = await supabase
        .from("profiles")
        .select("course_id, courses(id, name)")
        .eq("id", user.id)
        .single();

      const cId = (profile as any)?.course_id;
      const cName = (profile as any)?.courses?.name ?? "";
      if (!cId) { setLoading(false); return; }
      setCourseId(cId);
      setCourseName(cName);

      // Get weeks
      const { data: weeksData } = await supabase
        .from("course_weeks")
        .select("*")
        .eq("course_id", cId)
        .order("week_number");

      if (!weeksData?.length) { setLoading(false); return; }

      // Get week items + progress in parallel
      const weekIds = weeksData.map((w: any) => w.id);
      const [{ data: itemsData }, { data: progressData }] = await Promise.all([
        supabase.from("week_items").select("*").in("week_id", weekIds),
        supabase.from("member_progress").select("week_id, completed").eq("user_id", user.id).in("week_id", weekIds),
      ]);

      // Get notebook titles
      const notebookIds = (itemsData ?? []).filter((i: any) => i.item_type === "notebook").map((i: any) => i.item_id);
      const { data: notebooks } = notebookIds.length
        ? await supabase.from("notebooks").select("id, title").in("id", notebookIds)
        : { data: [] };

      const notebookMap = Object.fromEntries((notebooks ?? []).map((n: any) => [n.id, n.title]));
      const progressMap = Object.fromEntries((progressData ?? []).map((p: any) => [p.week_id, p.completed]));

      const enriched: Week[] = weeksData.map((w: any) => ({
        id: w.id,
        week_number: w.week_number,
        title: w.title,
        description: w.description,
        completed: progressMap[w.id] ?? false,
        items: (itemsData ?? [])
          .filter((i: any) => i.week_id === w.id)
          .map((i: any) => ({
            id: i.id,
            item_type: i.item_type,
            item_id: i.item_id,
            label: i.item_type === "notebook"
              ? (notebookMap[i.item_id] ?? "אוגדן")
              : i.item_type === "exam" ? "מבחן תרגול" : "פוסט",
            link: i.item_type === "notebook"
              ? "/notebooks"
              : i.item_type === "exam"
              ? `/exams/${i.item_id}`
              : `/post/${i.item_id}`,
          })),
      }));

      setWeeks(enriched);
      // Auto-open first incomplete week
      const firstIncomplete = enriched.find((w) => !w.completed);
      setOpenWeek(firstIncomplete?.id ?? enriched[0]?.id ?? null);
      setLoading(false);
    }
    load();
  }, []);

  const toggleComplete = async (week: Week) => {
    if (!userId || !courseId) return;
    const newVal = !week.completed;
    setWeeks((prev) => prev.map((w) => w.id === week.id ? { ...w, completed: newVal } : w));

    await supabase.from("member_progress").upsert({
      user_id: userId,
      course_id: courseId,
      week_id: week.id,
      completed: newVal,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,week_id" });
  };

  const completed = weeks.filter((w) => w.completed).length;
  const progress  = weeks.length ? Math.round((completed / weeks.length) * 100) : 0;

  const ITEM_ICON: Record<string, React.ElementType> = {
    notebook: BookOpen,
    exam:     Trophy,
    post:     FileText,
  };

  const ITEM_COLOR: Record<string, string> = {
    notebook: "text-indigo-400",
    exam:     "text-yellow-400",
    post:     "text-blue-400",
  };

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen size={19} className="text-indigo-400" />
                <h1 className="text-lg font-bold text-white">{courseName || "הקורס שלי"}</h1>
              </div>
              <p className="text-sm text-gray-500">{completed}/{weeks.length} שבועות הושלמו</p>
            </div>

            {/* Progress bar */}
            {weeks.length > 0 && (
              <div className="space-y-1.5">
                <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>התקדמות כללית</span>
                  <span className="text-indigo-400 font-semibold">{progress}%</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            )}

            {!loading && !courseId && (
              <div className="flex flex-col items-center gap-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Lock size={36} className="text-gray-700" />
                  <p className="text-gray-300 font-semibold">לא משויך לקורס</p>
                  <p className="text-sm text-gray-600">הזן את קוד ההצטרפות שקיבלת מהמדריך</p>
                </div>
                <div className="w-full max-w-sm">
                  <JoinCoursePrompt />
                </div>
              </div>
            )}

            {!loading && courseId && weeks.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <Clock size={36} className="text-gray-700" />
                <p className="text-gray-400 font-medium">הקורס עדיין בבנייה</p>
                <p className="text-sm text-gray-600">המדריך יוסיף שבועות בקרוב</p>
              </div>
            )}

            {/* Weeks */}
            <div className="space-y-3">
              {weeks.map((week, idx) => {
                const isOpen    = openWeek === week.id;
                const locked    = idx > 0 && !weeks[idx - 1].completed;

                return (
                  <div key={week.id}
                    className={cn(
                      "rounded-2xl border overflow-hidden transition-colors",
                      week.completed
                        ? "bg-green-500/5 border-green-500/20"
                        : locked
                        ? "bg-gray-900/50 border-gray-800 opacity-60"
                        : "bg-gray-900 border-gray-800"
                    )}>

                    {/* Week header */}
                    <button
                      onClick={() => !locked && setOpenWeek(isOpen ? null : week.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-start"
                      disabled={locked}
                    >
                      {/* Number / check */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                        week.completed
                          ? "bg-green-500/20 text-green-400"
                          : locked
                          ? "bg-gray-800 text-gray-600"
                          : "bg-indigo-500/20 text-indigo-400"
                      )}>
                        {week.completed ? <Check size={14} /> : locked ? <Lock size={13} /> : week.week_number}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold",
                          week.completed ? "text-green-300" : locked ? "text-gray-600" : "text-white")}>
                          שבוע {week.week_number} — {week.title}
                        </p>
                        {week.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{week.description}</p>
                        )}
                      </div>

                      {!locked && (
                        isOpen
                          ? <ChevronUp size={16} className="text-gray-500 shrink-0" />
                          : <ChevronDown size={16} className="text-gray-500 shrink-0" />
                      )}
                    </button>

                    {/* Week content */}
                    {isOpen && !locked && (
                      <div className="border-t border-gray-800 px-4 py-3 space-y-3">
                        {week.items.length === 0 ? (
                          <p className="text-xs text-gray-600 py-2">אין תוכן עדיין לשבוע זה</p>
                        ) : (
                          <div className="space-y-2">
                            {week.items.map((item) => {
                              const Icon = ITEM_ICON[item.item_type] ?? FileText;
                              return (
                                <Link key={item.id} href={item.link}
                                  className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/60 hover:bg-gray-800 rounded-xl transition-colors">
                                  <Icon size={14} className={ITEM_COLOR[item.item_type]} />
                                  <span className="text-sm text-gray-200 flex-1">{item.label}</span>
                                  <ChevronDown size={12} className="text-gray-600 rotate-[-90deg]" />
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {/* Mark complete */}
                        <button
                          onClick={() => toggleComplete(week)}
                          className={cn(
                            "w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
                            week.completed
                              ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                              : "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30"
                          )}>
                          {week.completed
                            ? <><Check size={14} /> הושלם — לחץ לביטול</>
                            : <><Check size={14} /> סמן כהושלם</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
