"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/lib/supabase";
import { mdaScenarios, categoryLabels, categoryColors } from "@/lib/mdaScenarios";
import { cn } from "@/lib/utils";

function canEdit(role?: string | null, faculty?: string | null, email?: string | null) {
  if (email === "hagayas2001@gmail.com") return true;
  if (faculty === "אדמיניסטרציה") return true;
  return ["root", "מנהל מערכת", "מדריך ראשי"].includes(role ?? "");
}

function ScenarioRow({
  s, deletingId, onDelete, graduation,
}: {
  s: { id: string; code: string; title: string; category: string; badge: string };
  deletingId: string | null;
  onDelete: (id: string) => void;
  graduation?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3 border",
      graduation ? "border-amber-500/20" : "border-indigo-500/20"
    )}>
      <span className="text-xl">{s.badge ?? "🚑"}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-mono text-gray-500 mr-2">{s.code}</span>
        <span className="text-sm font-medium text-white">{s.title}</span>
      </div>
      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", categoryColors[s.category as keyof typeof categoryColors] ?? "border-gray-700 text-gray-400")}>
        {categoryLabels[s.category as keyof typeof categoryLabels] ?? s.category}
      </span>
      <Link href={`/simulator/scenarios/${s.id}`} className="p-2 text-indigo-400 hover:text-indigo-300">
        <Pencil size={16} />
      </Link>
      <button onClick={() => onDelete(s.id)} disabled={deletingId === s.id} className="p-2 text-red-500/50 hover:text-red-400">
        {deletingId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}

export default function ScenariosListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dbScenarios, setDbScenarios] = useState<{ id: string; code: string; title: string; category: string; badge: string; graduation_only?: boolean }[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      const { data: p } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
      if (!canEdit((p as any)?.role, (p as any)?.faculty, user.email)) {
        router.replace("/simulator");
        return;
      }
      const { data } = await supabase.from("mda_scenarios").select("id, code, title, category, badge, graduation_only").order("code");
      setDbScenarios((data ?? []) as any);
      setLoading(false);
    }
    load();
  }, [router]);

  // Split DB scenarios
  const regularScenarios = dbScenarios.filter((s) => !s.graduation_only);
  const graduationScenarios = dbScenarios.filter((s) => s.graduation_only);
  // Static base scenarios not yet in DB
  const dbIds = new Set(dbScenarios.map((s) => s.id));
  const staticScenarios = mdaScenarios.filter((s) => !dbIds.has(s.code));

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק תרחיש זה?")) return;
    setDeletingId(id);
    await supabase.from("mda_scenarios").delete().eq("id", id);
    setDbScenarios((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/simulator" className="text-gray-500 hover:text-gray-300 min-h-[44px] flex items-center">
              <ArrowRight size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">עריכת תרחישים</h1>
              <p className="text-xs text-gray-500">ניהול מלא של תרחישי הסימולטור</p>
            </div>
            <Link
              href="/simulator/scenarios/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> תרחיש חדש
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
          ) : (
            <div className="space-y-4">
              {/* Regular DB Scenarios */}
              {regularScenarios.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">תרחישי סימולטור ({regularScenarios.length})</p>
                  <div className="space-y-2">
                    {regularScenarios.map((s) => (
                      <ScenarioRow key={s.id} s={s} deletingId={deletingId} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}

              {/* Graduation-only scenarios */}
              {graduationScenarios.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-500/70 mb-2 uppercase tracking-wide">🎓 תרחישי בחינת בגרות ({graduationScenarios.length})</p>
                  <div className="space-y-2">
                    {graduationScenarios.map((s) => (
                      <ScenarioRow key={s.id} s={s} deletingId={deletingId} onDelete={handleDelete} graduation />
                    ))}
                  </div>
                </div>
              )}

              {/* Static base scenarios */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">תרחישי בסיס — לחץ לעריכה ({staticScenarios.length})</p>
                <div className="space-y-2">
                  {staticScenarios.map((s) => (
                    <Link
                      key={s.code}
                      href={`/simulator/scenarios/${s.code}`}
                      className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-indigo-500/30 rounded-xl px-4 py-3 transition-colors"
                    >
                      <span className="text-xl">{s.badge}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-gray-500 mr-2">{s.code}</span>
                        <span className="text-sm font-medium text-white">{s.title}</span>
                      </div>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", categoryColors[s.category])}>
                        {categoryLabels[s.category]}
                      </span>
                      <Pencil size={15} className="text-gray-600 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
