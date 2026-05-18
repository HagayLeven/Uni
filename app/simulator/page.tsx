"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, Search, GraduationCap, Archive, BookOpen, Dumbbell, Pencil, X, Save, Loader2, Settings } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { mdaScenarios, categoryLabels, categoryColors } from "@/lib/mdaScenarios";
import type { MdaScenario } from "@/lib/mdaScenarios";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { canAccessSimulator } from "@/lib/simulatorAccess";

type Category = MdaScenario["category"] | "all";
type ScenarioOverride = { id: string; story?: string; vitals?: Record<string, string> };

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "cardiac", label: "❤️ לב" },
  { value: "respiratory", label: "🌬️ נשימה" },
  { value: "neuro", label: "🧠 נוירולוגיה" },
  { value: "trauma", label: "🚗 טראומה" },
  { value: "pediatric", label: "👶 ילדים" },
  { value: "obstetric", label: "🤰 מיילדות" },
  { value: "toxicology", label: "☠️ הרעלות" },
];

function canEditScenarios(role?: string | null, faculty?: string | null, email?: string | null): boolean {
  if (email === "hagayas2001@gmail.com") return true;
  if (faculty === "אדמיניסטרציה") return true;
  return ["root", "מנהל מערכת"].includes(role ?? "");
}

export default function SimulatorHubPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [canEdit, setCanEdit] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, ScenarioOverride>>({});
  const [editScenario, setEditScenario] = useState<MdaScenario | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      const { data: profile } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
      if (!canAccessSimulator((profile as any)?.role, (profile as any)?.faculty, user.email)) {
        router.replace("/dashboard");
        return;
      }
      setCanEdit(canEditScenarios((profile as any)?.role, (profile as any)?.faculty, user.email));
    }
    checkAccess();
  }, [router]);

  useEffect(() => {
    async function loadOverrides() {
      const { data } = await supabase.from("mda_scenarios").select("id, story, vitals");
      if (data) {
        const map: Record<string, ScenarioOverride> = {};
        data.forEach((row: ScenarioOverride) => { map[row.id] = row; });
        setOverrides(map);
      }
    }
    loadOverrides();
  }, []);

  // Merge static scenarios with DB overrides
  const scenarios = mdaScenarios.map((s) => {
    const ov = overrides[s.code];
    if (!ov) return s;
    return {
      ...s,
      story: ov.story ?? s.story,
      vitals: ov.vitals ? { ...s.vitals, ...ov.vitals } : s.vitals,
    };
  });

  const filtered = scenarios.filter((s) => {
    const matchCat = category === "all" || s.category === category;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.title.includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.story.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Stethoscope size={22} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">סימולטור מד״א</h1>
                <p className="text-sm text-gray-400">תרגל תרחישי חירום לקראת הבחינה</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/simulator/archive"
                className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition-colors"
              >
                <Archive size={16} />
                ארכיון
              </Link>
              <Link
                href="/simulator/graduation"
                className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 text-sm font-bold transition-colors"
              >
                <GraduationCap size={16} />
                בגרות 20/05
              </Link>
              {canEdit && (
                <Link
                  href="/simulator/scenarios"
                  className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
                  title="עריכת תרחישים"
                >
                  <Settings size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 end-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש תרחיש..."
              className="w-full py-3 bg-gray-900 border border-gray-700 rounded-xl px-4 pe-10 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category filters — horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-2 mb-5 -mx-4 px-4">
            <div className="flex gap-2 w-max">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={cn(
                    "whitespace-nowrap px-3 py-2 min-h-[40px] rounded-full text-xs font-medium border transition-colors",
                    category === opt.value
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario count */}
          <p className="text-xs text-gray-500 mb-4">
            {filtered.length} תרחישים
          </p>

          {/* Scenario grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                canEdit={canEdit}
                onEdit={() => setEditScenario(scenario)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
              <p>לא נמצאו תרחישים</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />

      {/* Edit Modal */}
      {editScenario && (
        <EditModal
          scenario={editScenario}
          onClose={() => setEditScenario(null)}
          onSaved={(updated) => {
            setOverrides((prev) => ({ ...prev, [updated.id]: updated }));
            setEditScenario(null);
          }}
        />
      )}
    </div>
  );
}

function ScenarioCard({ scenario, canEdit, onEdit }: { scenario: MdaScenario; canEdit: boolean; onEdit: () => void }) {
  const totalActions = scenario.phases.reduce(
    (sum, p) => sum + p.actions.length,
    0
  );
  const maxScore = totalActions * 2;

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl leading-none">{scenario.badge}</span>
          <div>
            <span className="text-xs font-mono text-gray-500">{scenario.code}</span>
            <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
              {scenario.title}
            </h3>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border",
            categoryColors[scenario.category]
          )}
        >
          {categoryLabels[scenario.category]}
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
        {scenario.story}
      </p>

      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span>{scenario.phases.length} שלבים</span>
        <span className="text-gray-700">·</span>
        <span>{totalActions} פעולות</span>
        <span className="text-gray-700">·</span>
        <span>מקס {maxScore} נק׳</span>
      </div>

      {/* Vitals preview */}
      <div className="flex gap-2 flex-wrap">
        <VitalBadge label="דופק" value={scenario.vitals.pulse} />
        <VitalBadge label="BP" value={scenario.vitals.bp} />
        <VitalBadge label="SpO2" value={scenario.vitals.spo2} />
      </div>

      {/* CTAs */}
      <div className="flex gap-2 mt-1">
        <Link
          href={`/simulator/exam?scenario=${scenario.code}&mode=practice`}
          className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/30 text-indigo-400 text-sm font-medium transition-colors"
        >
          <Dumbbell size={14} />
          תרגול
        </Link>
        <Link
          href={`/simulator/exam?scenario=${scenario.code}&mode=exam`}
          className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 text-sm font-medium transition-colors"
        >
          <BookOpen size={14} />
          מבחן
        </Link>
        {canEdit && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center min-h-[44px] w-11 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white transition-colors"
            title="עריכת תרחיש"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function VitalBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1 bg-gray-800 rounded-md px-2 py-1 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-medium">{value}</span>
    </span>
  );
}

function EditModal({
  scenario,
  onClose,
  onSaved,
}: {
  scenario: MdaScenario;
  onClose: () => void;
  onSaved: (updated: ScenarioOverride) => void;
}) {
  const [story, setStory] = useState(scenario.story);
  const [vitals, setVitals] = useState<Record<string, string>>({ ...scenario.vitals } as Record<string, string>);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("לא מחובר");
      const { error: err } = await supabase.from("mda_scenarios").upsert({
        id: scenario.code,
        story,
        vitals,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: "id" });
      if (err) throw err;
      onSaved({ id: scenario.code, story, vitals });
    } catch (e: any) {
      setError(e.message ?? "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const VITAL_LABELS: Record<string, string> = {
    pulse: "דופק", bp: "לחץ דם", spo2: "SpO2", rr: "נשימות", temp: "חום", gcs: "GCS",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 md:pb-0" dir="rtl">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <p className="text-xs font-mono text-gray-500">{scenario.code}</p>
            <h2 className="text-base font-bold text-white">{scenario.title} — עריכה</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 min-h-[36px] min-w-[36px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Story */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">מלל תרחיש</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="תיאור התרחיש..."
            />
          </div>

          {/* Vitals */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">מדדים</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(vitals).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-[10px] text-gray-500 mb-1">{VITAL_LABELS[key] ?? key}</label>
                  <input
                    value={val}
                    onChange={(e) => setVitals((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "שומר..." : "שמור שינויים"}
          </button>
        </div>
      </div>
    </div>
  );
}
