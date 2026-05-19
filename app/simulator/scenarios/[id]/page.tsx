"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, GripVertical, Star,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { mdaScenarios } from "@/lib/mdaScenarios";

// ── Types ──────────────────────────────────────────────────────────────────
interface ScenarioAction {
  id: string;
  text: string;
  maxScore: number;
}
interface ScenarioPhase {
  id: string;
  title: string;
  actions: ScenarioAction[];
}
interface RubricItem {
  id: string;
  text: string;
  points: number;    // ניקוד
  required: boolean; // כישלון אוטומטי אם לא בוצע
  category: string;  // קטגוריה חופשית (הערכה ראשונית, טיפול, תקשורת...)
}
interface FullScenario {
  id: string;
  code: string;
  title: string;
  badge: string;
  category: string;
  story: string;
  vitals: Record<string, string>;
  vitals_post: Record<string, string>; // מדדים לאחר טיפול
  phases: ScenarioPhase[];
  rubric: RubricItem[];              // רובריקה
  fail_criteria: string[];
  impression: string[];
  notes: string;                     // הערות לבוחן
}

const CATEGORIES = [
  { value: "cardiac",     label: "❤️ לב" },
  { value: "respiratory", label: "🌬️ נשימה" },
  { value: "neuro",       label: "🧠 נוירולוגיה" },
  { value: "trauma",      label: "🚗 טראומה" },
  { value: "pediatric",   label: "👶 ילדים" },
  { value: "obstetric",   label: "🤰 מיילדות" },
  { value: "toxicology",  label: "☠️ הרעלות" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const EMPTY: FullScenario = {
  id: "", code: "", title: "", badge: "🚑", category: "cardiac",
  story: "",
  vitals: { pulse: "", bp: "", spo2: "", rr: "" },
  vitals_post: {},
  phases: [],
  rubric: [],
  fail_criteria: [],
  impression: [],
  notes: "",
};

function canEdit(role?: string | null, faculty?: string | null, email?: string | null) {
  if (email === "hagayas2001@gmail.com") return true;
  if (faculty === "אדמיניסטרציה") return true;
  return ["root", "מנהל מערכת", "מדריך ראשי"].includes(role ?? "");
}

export default function ScenarioEditorPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string;
  const isNew = idParam === "new";

  const [scenario, setScenario] = useState<FullScenario>({ ...EMPTY });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<"basic" | "vitals" | "phases" | "rubric" | "criteria" | "notes">("basic");

  // Access check
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      const { data: p } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
      if (!canEdit((p as any)?.role, (p as any)?.faculty, user.email)) {
        router.replace("/simulator");
      }
    }
    check();
  }, [router]);

  // Load existing
  useEffect(() => {
    if (isNew) { setScenario({ ...EMPTY }); return; }
    async function load() {
      setLoading(true);
      const { data: dbRow } = await supabase.from("mda_scenarios").select("*").eq("id", idParam).maybeSingle();
      if (dbRow) {
        setScenario({
          id:           dbRow.id ?? "",
          code:         dbRow.code ?? dbRow.id ?? "",
          title:        dbRow.title ?? "",
          badge:        dbRow.badge ?? "🚑",
          category:     dbRow.category ?? "cardiac",
          story:        dbRow.story ?? "",
          vitals:       (dbRow.vitals as Record<string, string>) ?? {},
          vitals_post:  (dbRow.vitals_post as Record<string, string>) ?? {},
          phases:       ((dbRow.phases as ScenarioPhase[]) ?? []).map((p) => ({
            ...p,
            actions: (p.actions ?? []).map((a) => ({ ...a, maxScore: a.maxScore ?? 2 })),
          })),
          rubric:       (dbRow.rubric as RubricItem[]) ?? [],
          fail_criteria:(dbRow.fail_criteria as string[]) ?? [],
          impression:   (dbRow.impression as string[]) ?? [],
          notes:        dbRow.notes ?? "",
        });
      } else {
        // Fallback to static
        const stat = mdaScenarios.find((s) => s.code === idParam);
        if (stat) {
          setScenario({
            id:           stat.code,
            code:         stat.code,
            title:        stat.title,
            badge:        stat.badge,
            category:     stat.category,
            story:        stat.story,
            vitals:       stat.vitals as Record<string, string>,
            vitals_post:  {},
            phases:       stat.phases.map((p) => ({
              id: p.id,
              title: p.title,
              actions: p.actions.map((a) => ({ id: a.id, text: a.text, maxScore: (a as any).maxScore ?? 2 })),
            })),
            rubric:        [],
            fail_criteria: stat.failCriteria,
            impression:    stat.impression,
            notes:         "",
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [idParam, isNew]);

  // Open all phases by default
  useEffect(() => {
    const init: Record<string, boolean> = {};
    scenario.phases.forEach((p) => { init[p.id] = true; });
    setOpenPhases(init);
  }, [scenario.phases.length]);

  const set = <K extends keyof FullScenario>(key: K, val: FullScenario[K]) =>
    setScenario((s) => ({ ...s, [key]: val }));

  // ── Vitals ─────────────────────────────────────────────────────────────────
  const makeVitalHelpers = (field: "vitals" | "vitals_post") => ({
    setVal: (key: string, val: string) =>
      setScenario((s) => ({ ...s, [field]: { ...s[field], [key]: val } })),
    add: () =>
      setScenario((s) => ({ ...s, [field]: { ...s[field], "": "" } })),
    rename: (oldKey: string, newKey: string) =>
      setScenario((s) => {
        const v = { ...s[field] }; v[newKey] = v[oldKey]; delete v[oldKey];
        return { ...s, [field]: v };
      }),
    remove: (key: string) =>
      setScenario((s) => { const v = { ...s[field] }; delete v[key]; return { ...s, [field]: v }; }),
  });
  const vitals = makeVitalHelpers("vitals");
  const vitalsPost = makeVitalHelpers("vitals_post");

  // ── Phases ────────────────────────────────────────────────────────────────
  const addPhase = () => {
    const id = uid();
    setScenario((s) => ({ ...s, phases: [...s.phases, { id, title: "שלב חדש", actions: [] }] }));
    setOpenPhases((p) => ({ ...p, [id]: true }));
  };
  const updatePhase = (id: string, title: string) =>
    setScenario((s) => ({ ...s, phases: s.phases.map((p) => p.id === id ? { ...p, title } : p) }));
  const removePhase = (id: string) =>
    setScenario((s) => ({ ...s, phases: s.phases.filter((p) => p.id !== id) }));

  // ── Actions ───────────────────────────────────────────────────────────────
  const addAction = (phaseId: string) =>
    setScenario((s) => ({
      ...s,
      phases: s.phases.map((p) =>
        p.id === phaseId
          ? { ...p, actions: [...p.actions, { id: uid(), text: "", maxScore: 2 }] }
          : p
      ),
    }));
  const updateAction = (phaseId: string, actionId: string, patch: Partial<ScenarioAction>) =>
    setScenario((s) => ({
      ...s,
      phases: s.phases.map((p) =>
        p.id === phaseId
          ? { ...p, actions: p.actions.map((a) => a.id === actionId ? { ...a, ...patch } : a) }
          : p
      ),
    }));
  const removeAction = (phaseId: string, actionId: string) =>
    setScenario((s) => ({
      ...s,
      phases: s.phases.map((p) =>
        p.id === phaseId
          ? { ...p, actions: p.actions.filter((a) => a.id !== actionId) }
          : p
      ),
    }));

  // ── Rubric ────────────────────────────────────────────────────────────────
  const addRubricItem = () =>
    setScenario((s) => ({
      ...s,
      rubric: [...s.rubric, { id: uid(), text: "", points: 2, required: false, category: "" }],
    }));
  const updateRubric = (id: string, patch: Partial<RubricItem>) =>
    setScenario((s) => ({
      ...s,
      rubric: s.rubric.map((r) => r.id === id ? { ...r, ...patch } : r),
    }));
  const removeRubric = (id: string) =>
    setScenario((s) => ({ ...s, rubric: s.rubric.filter((r) => r.id !== id) }));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!scenario.title.trim()) { setError("חובה למלא שם תרחיש"); return; }
    setSaving(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const id = scenario.code.trim() || scenario.title.trim().replace(/\s+/g, "_").slice(0, 20);
      const { error: err } = await supabase.from("mda_scenarios").upsert({
        id,
        code:          scenario.code.trim() || id,
        title:         scenario.title.trim(),
        badge:         scenario.badge || "🚑",
        category:      scenario.category,
        story:         scenario.story,
        vitals:        scenario.vitals,
        vitals_post:   scenario.vitals_post,
        phases:        scenario.phases,
        rubric:        scenario.rubric,
        fail_criteria: scenario.fail_criteria,
        impression:    scenario.impression,
        notes:         scenario.notes,
        updated_at:    new Date().toISOString(),
        updated_by:    user?.id,
      }, { onConflict: "id" });
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (isNew) router.replace(`/simulator/scenarios/${id}`);
    } catch (e: any) {
      setError(e.message ?? "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  // ── Total rubric points ───────────────────────────────────────────────────
  const totalPhasePoints = scenario.phases.reduce(
    (sum, ph) => sum + ph.actions.reduce((s2, a) => s2 + (a.maxScore ?? 2), 0), 0
  );
  const totalRubricPoints = scenario.rubric.reduce((sum, r) => sum + (r.points ?? 0), 0);

  if (loading) return (
    <div dir="rtl" className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </main>
    </div>
  );

  const TABS = [
    { key: "basic",    label: "📋 בסיסי" },
    { key: "vitals",   label: "📊 מדדים" },
    { key: "phases",   label: `🔄 שלבים (${scenario.phases.length})` },
    { key: "rubric",   label: `✅ רובריקה (${scenario.rubric.length})` },
    { key: "criteria", label: "⚠️ כישלון" },
    { key: "notes",    label: "📝 הערות" },
  ] as const;

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/simulator/scenarios" className="text-gray-500 hover:text-gray-300 min-h-[44px] flex items-center">
              <ArrowRight size={20} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">
                {isNew ? "תרחיש חדש" : (scenario.badge + " " + scenario.title)}
              </h1>
              <p className="text-xs text-gray-500">עורך תרחיש מלא — שינויים משפיעים על כלל המשתמשים</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors shrink-0"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "שומר..." : saved ? "✓ נשמר!" : "שמור"}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
                  activeSection === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Basic Info ── */}
          {activeSection === "basic" && (
            <Section title="מידע בסיסי">
              <div className="grid grid-cols-2 gap-3">
                <Field label="קוד תרחיש">
                  <input value={scenario.code} onChange={(e) => set("code", e.target.value)} placeholder="C01" className={inputCls} />
                </Field>
                <Field label="שם תרחיש *">
                  <input value={scenario.title} onChange={(e) => set("title", e.target.value)} placeholder="שם התרחיש" className={inputCls} />
                </Field>
                <Field label="אימוג׳י">
                  <input value={scenario.badge} onChange={(e) => set("badge", e.target.value)} placeholder="🚑" className={inputCls} maxLength={4} />
                </Field>
                <Field label="קטגוריה">
                  <select value={scenario.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="תיאור התרחיש">
                  <textarea
                    value={scenario.story}
                    onChange={(e) => set("story", e.target.value)}
                    rows={5}
                    placeholder="תיאור מפורט של התרחיש — מה קרה, איפה, מה המצב..."
                    className={`${inputCls} resize-none w-full mt-1`}
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* ── TAB: Vitals ── */}
          {activeSection === "vitals" && (
            <div className="space-y-4">
              {/* Initial vitals */}
              <Section
                title="מדדים ראשוניים"
                action={<button onClick={vitals.add} className={addBtn}><Plus size={14} /> הוסף מדד</button>}
              >
                <p className="text-xs text-gray-500 mb-3">המדדים שמופיעים למציל בתחילת התרחיש</p>
                <div className="space-y-2">
                  {Object.entries(scenario.vitals).map(([key, val], idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        value={key}
                        onChange={(e) => vitals.rename(key, e.target.value)}
                        placeholder="שם מדד (pulse, bp...)"
                        className={`${inputCls} w-36 font-mono text-xs`}
                      />
                      <input
                        value={val}
                        onChange={(e) => vitals.setVal(key, e.target.value)}
                        placeholder="ערך"
                        className={`${inputCls} flex-1`}
                      />
                      <button onClick={() => vitals.remove(key)} className="text-red-500/60 hover:text-red-400 p-2">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {Object.keys(scenario.vitals).length === 0 && (
                    <p className="text-xs text-gray-600 text-center py-2">אין מדדים — לחץ "הוסף מדד"</p>
                  )}
                </div>
              </Section>

              {/* Post-treatment vitals */}
              <Section
                title="מדדים לאחר טיפול נכון"
                action={<button onClick={vitalsPost.add} className={addBtn}><Plus size={14} /> הוסף מדד</button>}
              >
                <p className="text-xs text-gray-500 mb-3">המדדים המשתנים לאחר מתן טיפול נכון — מה הנבחן אמור לראות כאשר הטיפול מוצלח</p>
                <div className="space-y-2">
                  {Object.entries(scenario.vitals_post).map(([key, val], idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        value={key}
                        onChange={(e) => vitalsPost.rename(key, e.target.value)}
                        placeholder="שם מדד"
                        className={`${inputCls} w-36 font-mono text-xs`}
                      />
                      <input
                        value={val}
                        onChange={(e) => vitalsPost.setVal(key, e.target.value)}
                        placeholder="ערך לאחר טיפול"
                        className={`${inputCls} flex-1`}
                      />
                      <button onClick={() => vitalsPost.remove(key)} className="text-red-500/60 hover:text-red-400 p-2">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {Object.keys(scenario.vitals_post).length === 0 && (
                    <p className="text-xs text-gray-600 text-center py-2">לא הוגדרו מדדים לאחר טיפול</p>
                  )}
                </div>
              </Section>
            </div>
          )}

          {/* ── TAB: Phases ── */}
          {activeSection === "phases" && (
            <Section
              title={`שלבים ופעולות — סה״כ ${totalPhasePoints} נקודות`}
              action={<button onClick={addPhase} className={addBtn}><Plus size={14} /> הוסף שלב</button>}
            >
              <div className="space-y-3">
                {scenario.phases.map((phase) => {
                  const phaseTotal = phase.actions.reduce((s, a) => s + (a.maxScore ?? 2), 0);
                  return (
                    <div key={phase.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                      {/* Phase header */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
                        <GripVertical size={14} className="text-gray-600 shrink-0" />
                        <input
                          value={phase.title}
                          onChange={(e) => updatePhase(phase.id, e.target.value)}
                          className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder:text-gray-500"
                          placeholder="שם השלב..."
                        />
                        <span className="text-xs text-gray-500 shrink-0">{phase.actions.length} פעולות · {phaseTotal}נק׳</span>
                        <button onClick={() => setOpenPhases((p) => ({ ...p, [phase.id]: !p[phase.id] }))} className="text-gray-500 hover:text-gray-300 p-1">
                          {openPhases[phase.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button onClick={() => removePhase(phase.id)} className="text-red-500/50 hover:text-red-400 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Actions */}
                      {openPhases[phase.id] && (
                        <div className="p-3 space-y-2">
                          {phase.actions.map((action, aIdx) => (
                            <div key={action.id} className="flex gap-2 items-center">
                              <span className="text-xs text-gray-600 w-5 text-center shrink-0">{aIdx + 1}</span>
                              <input
                                value={action.text}
                                onChange={(e) => updateAction(phase.id, action.id, { text: e.target.value })}
                                placeholder="תיאור הפעולה..."
                                className={`${inputCls} flex-1 text-sm`}
                              />
                              {/* maxScore */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Star size={11} className="text-yellow-500" />
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  value={action.maxScore ?? 2}
                                  onChange={(e) => updateAction(phase.id, action.id, { maxScore: Number(e.target.value) })}
                                  className="w-12 bg-gray-700 border border-gray-600 rounded px-1.5 py-1 text-xs text-center text-yellow-300 focus:outline-none"
                                  title="ניקוד מקסימלי"
                                />
                              </div>
                              <button onClick={() => removeAction(phase.id, action.id)} className="text-red-500/50 hover:text-red-400 p-1.5 shrink-0">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => addAction(phase.id)} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-1">
                            <Plus size={13} /> הוסף פעולה
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {scenario.phases.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">אין שלבים — לחץ "הוסף שלב"</p>
                )}
              </div>
            </Section>
          )}

          {/* ── TAB: Rubric ── */}
          {activeSection === "rubric" && (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-indigo-300">
                <strong>רובריקת הערכה</strong> — פריטים שהבוחן מסמן במהלך הבחינה. ניתן להגדיר ניקוד לכל פריט ולסמן פריטים כ"חובה" (כישלון אוטומטי אם לא בוצע).
                {totalRubricPoints > 0 && (
                  <span className="mr-2 text-white">סה״כ {totalRubricPoints} נקודות</span>
                )}
              </div>

              <Section
                title={`פריטי רובריקה (${scenario.rubric.length})`}
                action={<button onClick={addRubricItem} className={addBtn}><Plus size={14} /> הוסף פריט</button>}
              >
                <div className="space-y-3">
                  {scenario.rubric.map((item, idx) => (
                    <div key={item.id} className={cn(
                      "border rounded-xl p-3 space-y-2",
                      item.required ? "border-red-500/30 bg-red-500/5" : "border-gray-700 bg-gray-800/50"
                    )}>
                      <div className="flex gap-2 items-start">
                        <span className="text-xs text-gray-500 w-5 text-center pt-2.5 shrink-0">{idx + 1}</span>
                        <textarea
                          value={item.text}
                          onChange={(e) => updateRubric(item.id, { text: e.target.value })}
                          placeholder="תיאור הפריט לבדיקה..."
                          rows={2}
                          className={`${inputCls} flex-1 resize-none text-sm`}
                        />
                        <button onClick={() => removeRubric(item.id)} className="text-red-500/50 hover:text-red-400 p-1.5 shrink-0 mt-0.5">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex gap-3 items-center pr-7">
                        {/* Category */}
                        <input
                          value={item.category}
                          onChange={(e) => updateRubric(item.id, { category: e.target.value })}
                          placeholder="קטגוריה (הערכה ראשונית, טיפול, תקשורת...)"
                          className={`${inputCls} flex-1 text-xs`}
                        />
                        {/* Points */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={12} className="text-yellow-500" />
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={item.points}
                            onChange={(e) => updateRubric(item.id, { points: Number(e.target.value) })}
                            className="w-14 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-center text-yellow-300 focus:outline-none"
                            title="ניקוד"
                          />
                          <span className="text-xs text-gray-500">נק׳</span>
                        </div>
                        {/* Required toggle */}
                        <button
                          onClick={() => updateRubric(item.id, { required: !item.required })}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0",
                            item.required
                              ? "bg-red-500/20 border-red-500/40 text-red-300"
                              : "bg-gray-700 border-gray-600 text-gray-400 hover:text-gray-200"
                          )}
                          title="כישלון אוטומטי אם לא בוצע"
                        >
                          ⚠ {item.required ? "חובה" : "רשות"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {scenario.rubric.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-600 mb-3">אין פריטי רובריקה עדיין</p>
                      <button onClick={addRubricItem} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 mx-auto">
                        <Plus size={15} /> הוסף פריט ראשון
                      </button>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          )}

          {/* ── TAB: Criteria + Impression ── */}
          {activeSection === "criteria" && (
            <div className="space-y-4">
              <Section
                title="קריטריוני כישלון אוטומטי"
                action={<button onClick={() => set("fail_criteria", [...scenario.fail_criteria, ""])} className={addBtn}><Plus size={14} /> הוסף</button>}
              >
                <p className="text-xs text-gray-500 mb-3">ביצוע (או אי-ביצוע) של הפריטים הבאים גורר כישלון מיידי</p>
                <div className="space-y-2">
                  {scenario.fail_criteria.map((fc, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-red-500 text-sm shrink-0">⚠</span>
                      <input
                        value={fc}
                        onChange={(e) => set("fail_criteria", scenario.fail_criteria.map((f, i) => i === idx ? e.target.value : f))}
                        placeholder="קריטריון כישלון..."
                        className={`${inputCls} flex-1`}
                      />
                      <button onClick={() => set("fail_criteria", scenario.fail_criteria.filter((_, i) => i !== idx))} className="text-red-500/50 hover:text-red-400 p-1.5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {scenario.fail_criteria.length === 0 && <p className="text-xs text-gray-600 text-center py-2">אין קריטריוני כישלון</p>}
                </div>
              </Section>

              <Section
                title="נקודות להתרשמות כללית"
                action={<button onClick={() => set("impression", [...scenario.impression, ""])} className={addBtn}><Plus size={14} /> הוסף</button>}
              >
                <p className="text-xs text-gray-500 mb-3">הדברים שהבוחן צריך לשים לב אליהם מעבר לפעולות הספציפיות</p>
                <div className="space-y-2">
                  {scenario.impression.map((imp, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-indigo-400 text-sm shrink-0">•</span>
                      <input
                        value={imp}
                        onChange={(e) => set("impression", scenario.impression.map((f, i) => i === idx ? e.target.value : f))}
                        placeholder="נקודת התרשמות..."
                        className={`${inputCls} flex-1`}
                      />
                      <button onClick={() => set("impression", scenario.impression.filter((_, i) => i !== idx))} className="text-red-500/50 hover:text-red-400 p-1.5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {scenario.impression.length === 0 && <p className="text-xs text-gray-600 text-center py-2">אין נקודות</p>}
                </div>
              </Section>
            </div>
          )}

          {/* ── TAB: Notes ── */}
          {activeSection === "notes" && (
            <Section title="הערות לבוחן">
              <p className="text-xs text-gray-500 mb-3">הערות פנימיות לסגל — לא מוצגות לנבחן. ניתן לכלול הנחיות ספציפיות, נקודות תשומת לב, מידע על חולה מדומה וכד׳.</p>
              <textarea
                value={scenario.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={10}
                placeholder="הערות לבוחן..."
                className={`${inputCls} resize-none w-full`}
              />
            </Section>
          )}

          {/* Save button (bottom) */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "שומר..." : saved ? "✓ נשמר בהצלחה!" : "שמור תרחיש"}
          </button>

        </div>
      </main>
      <BottomNav />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
const inputCls = "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors";
const addBtn   = "flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-lg px-2.5 py-1.5 hover:border-indigo-500/60 transition-colors";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-300">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
