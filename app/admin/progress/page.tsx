"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Loader2, TrendingUp, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course { id: string; name: string; }
interface Week { id: string; week_number: number; title: string; }
interface MemberRow {
  user_id: string;
  name: string;
  avatar: string | null;
  completed: Set<string>; // week ids
  last_seen: string | null;
}

function timeAgo(d: string | null) {
  if (!d) return "אף פעם";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש׳`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

export default function ProgressPage() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [selCourse, setSelCourse] = useState("");
  const [weeks, setWeeks]       = useState<Week[]>([]);
  const [members, setMembers]   = useState<MemberRow[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    supabase.from("courses").select("id, name").order("created_at").then(({ data }) => setCourses(data ?? []));
  }, []);

  useEffect(() => {
    if (!selCourse) return;
    setLoading(true);

    Promise.all([
      supabase.from("course_weeks").select("id, week_number, title").eq("course_id", selCourse).order("week_number"),
      supabase.from("course_members").select("user_id, profiles(full_name, avatar_url)").eq("course_id", selCourse),
      supabase.from("member_progress").select("user_id, week_id, completed").eq("course_id", selCourse),
    ]).then(([{ data: w }, { data: m }, { data: p }]) => {
      setWeeks(w ?? []);

      const progressMap: Record<string, Set<string>> = {};
      for (const row of (p ?? [])) {
        if (!progressMap[row.user_id]) progressMap[row.user_id] = new Set();
        if (row.completed) progressMap[row.user_id].add(row.week_id);
      }

      setMembers((m ?? []).map((mem: any) => ({
        user_id: mem.user_id,
        name: mem.profiles?.full_name ?? "משתמש",
        avatar: mem.profiles?.avatar_url ?? null,
        completed: progressMap[mem.user_id] ?? new Set(),
        last_seen: null,
      })));
      setLoading(false);
    });
  }, [selCourse]);

  const totalWeeks = weeks.length;

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-white">מעקב התקדמות</h1>
        <p className="text-sm text-gray-500 mt-0.5">ראה מי השלים מה — לפי חניך ולפי שבוע</p>
      </div>

      {/* Course selector */}
      <select value={selCourse} onChange={(e) => setSelCourse(e.target.value)}
        className="h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500">
        <option value="">— בחר קורס —</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {selCourse && (
        <>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-indigo-500" /></div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Users size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">אין חניכים בקורס זה עדיין</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{members.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">חניכים</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {members.filter((m) => m.completed.size === totalWeeks && totalWeeks > 0).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">השלימו הכל</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {members.filter((m) => m.completed.size === 0).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">לא התחילו</p>
                </div>
              </div>

              {/* Progress table */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-start px-4 py-3 text-xs font-semibold text-gray-500 min-w-[160px]">חניך</th>
                        <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 min-w-[70px]">התקדמות</th>
                        {weeks.map((w) => (
                          <th key={w.id} className="text-center px-2 py-3 text-xs font-semibold text-gray-500 min-w-[56px]">
                            ש׳{w.week_number}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {members
                        .sort((a, b) => b.completed.size - a.completed.size)
                        .map((m) => {
                          const pct = totalWeeks ? Math.round((m.completed.size / totalWeeks) * 100) : 0;
                          return (
                            <tr key={m.user_id} className="hover:bg-gray-800/30 transition-colors">
                              {/* Name */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {m.name[0]}
                                  </div>
                                  <span className="text-gray-200 font-medium truncate max-w-[110px]">{m.name}</span>
                                </div>
                              </td>

                              {/* Progress % */}
                              <td className="px-3 py-3">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={cn("text-xs font-bold",
                                    pct === 100 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400")}>
                                    {pct}%
                                  </span>
                                  <div className="w-10 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all",
                                      pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500")}
                                      style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </td>

                              {/* Week cells */}
                              {weeks.map((w) => (
                                <td key={w.id} className="px-2 py-3 text-center">
                                  {m.completed.has(w.id)
                                    ? <Check size={14} className="text-green-400 mx-auto" />
                                    : <X size={14} className="text-gray-700 mx-auto" />}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
