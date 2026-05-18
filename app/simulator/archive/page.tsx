"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { canAccessSimulator } from "@/lib/simulatorAccess";

interface ArchiveEntry {
  id: string;
  scenario_id: string;
  scenario_title: string;
  exam_type: string;
  score: number;
  max_score: number;
  pct: number;
  passed: boolean;
  candidate_name?: string;
  group_number?: number;
  examiner?: string;
  saved_at: string;
}

type Filter = "all" | "passed" | "failed";

export default function ArchivePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("exam_archive")
      .select("id,scenario_id,scenario_title,exam_type,score,max_score,pct,passed,candidate_name,group_number,examiner,saved_at")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });
    setEntries(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      const { data: profile } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
      if (!canAccessSimulator((profile as any)?.role, (profile as any)?.faculty, user.email)) {
        router.replace("/dashboard");
      }
    }
    checkAccess();
  }, [router]);

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק רשומה זו?")) return;
    await supabase.from("exam_archive").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = entries.filter((e) => {
    if (filter === "passed") return e.passed;
    if (filter === "failed") return !e.passed;
    return true;
  });

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/simulator" className="text-gray-500 hover:text-gray-300 min-h-[44px] flex items-center">
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">ארכיון מבחנים</h1>
              <p className="text-sm text-gray-400">{entries.length} רשומות</p>
            </div>
          </div>

          {/* Filters — horizontal scroll */}
          <div className="overflow-x-auto pb-2 mb-5 -mx-4 px-4">
            <div className="flex gap-2 w-max">
              {(["all", "passed", "failed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "whitespace-nowrap px-4 min-h-[40px] rounded-full text-xs font-medium border transition-colors",
                    filter === f
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                  )}
                >
                  {f === "all" ? "הכל" : f === "passed" ? "✅ עברו" : "❌ נכשלו"}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-20 text-gray-500">טוען...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="mb-2">אין רשומות עדיין</p>
              <Link href="/simulator" className="text-indigo-400 hover:underline text-sm">
                לך לתרגל!
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "bg-gray-900 border rounded-xl p-4 flex items-center gap-4",
                    entry.passed ? "border-green-500/20" : "border-red-500/20"
                  )}
                >
                  {entry.passed ? (
                    <CheckCircle size={22} className="text-green-400 shrink-0" />
                  ) : (
                    <XCircle size={22} className="text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">
                        {entry.scenario_title || entry.scenario_id}
                      </p>
                      {entry.exam_type === "graduation" && (
                        <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <GraduationCap size={9} /> בגרות
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span>{entry.pct}% ({entry.score}/{entry.max_score})</span>
                      {entry.candidate_name && <span>{entry.candidate_name}</span>}
                      <span>{new Date(entry.saved_at).toLocaleDateString("he-IL")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      entry.passed ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                    )}>
                      {entry.pct}%
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
                      title="מחק"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
