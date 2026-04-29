"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, BookMarked, ClipboardList, Loader2, Search, Users, Zap, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendNotification } from "@/lib/notifications";

interface UserActivity {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  faculty: string | null;
  course_id: string | null;
  xp_override: number | null;
  last_seen: string | null;
  courses?: { name: string } | null;
  notebook_count: number;
  exam_count: number;
  exam_pass_count: number;
}

function timeAgo(d: string | null) {
  if (!d) return "מעולם";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק'`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש'`;
  const days = Math.floor(h / 24);
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`;
  return `לפני ${Math.floor(days / 30)} חודשים`;
}

function activityStatus(d: string | null): { label: string; color: string; dot: string } {
  if (!d) return { label: "לא פעיל", color: "text-gray-600", dot: "bg-gray-700" };
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return { label: "פעיל היום", color: "text-green-400", dot: "bg-green-400" };
  if (days <= 3) return { label: "פעיל לאחרונה", color: "text-yellow-400", dot: "bg-yellow-400" };
  if (days <= 7) return { label: "שבוע לא פעיל", color: "text-orange-400", dot: "bg-orange-400" };
  return { label: "לא פעיל", color: "text-red-400", dot: "bg-red-400" };
}

export default function AdminActivityPage() {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [pinging, setPinging] = useState<string | null>(null);
  const [pinged, setPinged] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: notebooks }, { data: attempts }] = await Promise.all([
        supabase.from("profiles")
          .select("id, full_name, avatar_url, faculty, course_id, xp_override, last_seen, courses(name)")
          .order("last_seen", { ascending: false, nullsFirst: false }),
        supabase.from("notebooks").select("author_id"),
        supabase.from("exam_attempts").select("user_id, passed"),
      ]);

      const nbMap: Record<string, number> = {};
      (notebooks ?? []).forEach((n: any) => { nbMap[n.author_id] = (nbMap[n.author_id] ?? 0) + 1; });

      const examMap: Record<string, number> = {};
      const passMap: Record<string, number> = {};
      (attempts ?? []).forEach((a: any) => {
        examMap[a.user_id] = (examMap[a.user_id] ?? 0) + 1;
        if (a.passed) passMap[a.user_id] = (passMap[a.user_id] ?? 0) + 1;
      });

      setUsers((profiles ?? []).map((p: any) => ({
        ...p,
        notebook_count: nbMap[p.id] ?? 0,
        exam_count: examMap[p.id] ?? 0,
        exam_pass_count: passMap[p.id] ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = (u.full_name ?? "").toLowerCase().includes(q);
    const days = u.last_seen ? Math.floor((Date.now() - new Date(u.last_seen).getTime()) / 86400000) : 999;
    const matchFilter =
      filter === "all" ? true :
      filter === "active" ? days <= 7 :
      days > 7;
    return matchSearch && matchFilter;
  });

  const activeToday  = users.filter(u => u.last_seen && Math.floor((Date.now() - new Date(u.last_seen).getTime()) / 86400000) === 0).length;
  const activeWeek   = users.filter(u => u.last_seen && Math.floor((Date.now() - new Date(u.last_seen).getTime()) / 86400000) <= 7).length;
  const inactive     = users.filter(u => !u.last_seen || Math.floor((Date.now() - new Date(u.last_seen).getTime()) / 86400000) > 7).length;

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">פעילות חניכים</h1>
        <p className="text-sm text-gray-500 mt-1">מעקב אחר כניסות, אוגדנים ומבחנים</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "סה״כ", value: users.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "פעילים היום", value: activeToday, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "פעילים השבוע", value: activeWeek, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { label: "לא פעילים", value: inactive, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
          <input
            placeholder="חיפוש לפי שם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg pe-8 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
          {([["all", "הכל"], ["active", "פעילים"], ["inactive", "לא פעילים"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors",
                filter === val ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 bg-gray-800/40">
              <tr>
                {["חניך", "סטטוס", "כניסה אחרונה", "קורס", "אוגדנים", "מבחנים", "XP", ""].map((h) => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((u) => {
                const status = activityStatus(u.last_seen);
                return (
                  <tr key={u.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-sm font-bold shrink-0">
                            {u.full_name?.[0] ?? "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-100 truncate max-w-[120px]">{u.full_name ?? "—"}</p>
                          {u.faculty && <p className="text-xs text-gray-500 truncate max-w-[120px]">{u.faculty}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", status.dot)} />
                        <span className={cn("text-xs font-medium", status.color)}>{status.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(u.last_seen)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {(u.courses as any)?.name ?? <span className="text-gray-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <BookMarked size={11} className="text-indigo-400" />
                        {u.notebook_count}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <ClipboardList size={11} className="text-blue-400" />
                        {u.exam_count}
                        {u.exam_pass_count > 0 && (
                          <span className="text-green-400">({u.exam_pass_count} עברו)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                        <Zap size={11} />
                        {u.xp_override ?? <span className="text-gray-600 font-normal">מחושב</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={pinging === u.id || pinged === u.id}
                        onClick={async () => {
                          setPinging(u.id);
                          await sendNotification({ userId: u.id, type: "announcement", title: "🔔 תזכורת מהמדריך", body: "היי, לא ראינו אותך זמן מה — כדאי להתעדכן בחומר!" });
                          setPinging(null); setPinged(u.id);
                          setTimeout(() => setPinged(null), 3000);
                        }}
                        className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                          pinged === u.id
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-gray-800 hover:bg-indigo-500/20 text-gray-500 hover:text-indigo-400 border border-gray-700 hover:border-indigo-500/30")}>
                        {pinging === u.id ? <Loader2 size={11} className="animate-spin" /> :
                         pinged === u.id ? <Check size={11} /> : <Send size={11} />}
                        {pinged === u.id ? "נשלח" : "הזכר"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-600">לא נמצאו משתמשים</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
