/*
SQL to run in Supabase:
create table if not exists exam_archive (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  scenario_id text,
  scenario_title text,
  exam_type text default 'practice',
  answers jsonb,
  score int,
  max_score int,
  pct int,
  passed boolean,
  rubric_data jsonb,
  candidate_name text,
  group_number int,
  examiner text,
  saved_at timestamptz default now()
);
alter table exam_archive enable row level security;
create policy "own archive" on exam_archive for all using (auth.uid() = user_id);
*/

"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { mdaScenarios } from "@/lib/mdaScenarios";
import type { MdaPhase, MdaAction } from "@/lib/mdaScenarios";
import { calcScore } from "@/lib/examUtils";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { canAccessSimulator } from "@/lib/simulatorAccess";

function ExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioCode = searchParams.get("scenario") ?? "";
  const mode = (searchParams.get("mode") ?? "practice") as "practice" | "exam";

  const scenario = mdaScenarios.find((s) => s.code === scenarioCode);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [vitalsOpen, setVitalsOpen] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessionCode] = useState<string>(
    () => Math.random().toString(36).slice(2, 8).toUpperCase()
  );
  const [startTime] = useState<Date>(() => new Date());
  const [examiner, setExaminer] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("mda_examiner") ?? "";
    return "";
  });
  const [candidateName, setCandidateName] = useState<string>("");
  // Scenario timer (counts up from 0)
  const [elapsed, setElapsed] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!timerRunning) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };
  const [notes, setNotes] = useState({
    impression: "",
    strengths: "",
    improvements: "",
    recommendation: "",
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [activeTab, setActiveTab] = useState<"exam" | "edit">("exam");
  const [canEdit, setCanEdit] = useState(false);
  // Editable scenario fields
  const [editStory, setEditStory] = useState(scenario?.story ?? "");
  const [editVitals, setEditVitals] = useState<Record<string, string>>(
    scenario ? { ...scenario.vitals } as Record<string, string> : {}
  );
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      const { data: profile } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
      if (!canAccessSimulator((profile as any)?.role, (profile as any)?.faculty, user.email)) {
        router.replace("/dashboard");
        return;
      }
      const r = (profile as any)?.role;
      const f = (profile as any)?.faculty;
      const isAdmin = user.email === "hagayas2001@gmail.com" || f === "אדמיניסטרציה" || ["root","מנהל מערכת"].includes(r ?? "");
      setCanEdit(isAdmin);
      // Load any existing override from DB
      if (isAdmin && scenario) {
        const { data } = await supabase.from("mda_scenarios").select("story, vitals").eq("id", scenario.code).maybeSingle();
        if (data) {
          if (data.story) setEditStory(data.story);
          if (data.vitals) setEditVitals((prev) => ({ ...prev, ...(data.vitals as Record<string, string>) }));
        }
      }
    }
    checkAccess();
  }, [router, scenario]);

  useEffect(() => {
    if (scenario) {
      const initial: Record<string, boolean> = {};
      scenario.phases.forEach((p) => { initial[p.id] = true; });
      setOpenPhases(initial);
    }
  }, [scenario]);

  useEffect(() => {
    if (!sessionCode) return;
    const ch = supabase.channel("exam-session-" + sessionCode);
    channelRef.current = ch;
    ch.subscribe();
    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [sessionCode]);

  useEffect(() => {
    if (!sessionCode || !scenario) return;
    const { earned, max } = calcScore(scenario.phases, answers);
    const livePct = max === 0 ? 0 : Math.round((earned / max) * 100);
    channelRef.current?.send({
      type: "broadcast",
      event: "state_update",
      payload: {
        candidate: scenario.title,
        phase: 0,
        answers,
        pct: livePct,
      },
    });
  }, [answers, sessionCode, scenario]);

  const setAnswer = useCallback((actionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [actionId]: value }));
  }, []);

  if (!scenario) {
    return (
      <div dir="rtl" className="flex h-screen bg-gray-950 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">תרחיש לא נמצא: {scenarioCode}</p>
          <Link href="/simulator" className="text-indigo-400 hover:underline">
            חזרה לסימולטור
          </Link>
        </div>
      </div>
    );
  }

  const [manualOverride, setManualOverride] = useState<"pass" | "fail" | null>(null);

  const { earned, max, pct } = calcScore(scenario.phases, answers);
  const passed = manualOverride ? manualOverride === "pass" : pct >= 70;

  const missedActions: { phase: string; action: MdaAction }[] = [];
  scenario.phases.forEach((p) => {
    p.actions.forEach((a) => {
      if ((answers[a.id] ?? 0) < 2) {
        missedActions.push({ phase: p.title, action: a });
      }
    });
  });

  const handleSubmit = () => setSubmitted(true);

  const handleEditSave = async () => {
    if (!scenario) return;
    setEditSaving(true);
    setEditError("");
    setEditSaved(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("לא מחובר");
      const { error } = await supabase.from("mda_scenarios").upsert({
        id: scenario.code,
        story: editStory,
        vitals: editVitals,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: "id" });
      if (error) throw error;
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 3000);
    } catch (e: any) {
      setEditError(e.message ?? "שגיאה בשמירה");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const endTime = new Date();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not logged in");

      // Store extra fields inside answers jsonb (started_at, notes)
      const { error } = await supabase.from("exam_archive").insert({
        user_id: user.id,
        scenario_id: scenario.code,
        scenario_title: scenario.title,
        exam_type: mode,
        answers: {
          ...answers,
          _started_at: startTime.toISOString(),
          _notes: notes,
        },
        score: earned,
        max_score: max,
        pct,
        passed,
        examiner,
        candidate_name: candidateName || null,
        saved_at: new Date().toISOString(),
      });

      if (error) throw error;
      setSaved(true);

      // Auto-generate + open PDF
      const { generateExamPDF } = await import("@/lib/examPDF");
      generateExamPDF({
        type: "exam",
        candidateName: candidateName || undefined,
        scenarioTitle: scenario.title,
        scenarioCode: scenario.code,
        examiner,
        startTime,
        endTime,
        score: earned,
        maxScore: max,
        pct,
        passed,
        mode,
        phases: scenario.phases.map((p) => ({
          title: p.title,
          actions: p.actions.map((a) => ({ text: a.text, score: answers[a.id] ?? 0 })),
        })),
        notes,
      });
    } catch (e) {
      console.error("Save error:", e);
      alert("שגיאה בשמירה — בדוק קונסול");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setSaved(false);
    const initial: Record<string, boolean> = {};
    scenario.phases.forEach((p) => { initial[p.id] = true; });
    setOpenPhases(initial);
  };

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Back + mode badge */}
          <div className="flex items-center gap-3 mb-5">
            <Link href="/simulator" className="text-gray-500 hover:text-gray-300 transition-colors min-h-[44px] flex items-center">
              <ArrowRight size={20} />
            </Link>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl shrink-0">{scenario.badge}</span>
              <h1 className="text-base font-bold text-white truncate">{scenario.title}</h1>
            </div>
            <span className={cn(
              "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border",
              mode === "exam"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            )}>
              {mode === "exam" ? "🎯 מבחן" : "🏋️ תרגול"}
            </span>
          </div>

          {/* Tabs — exam/practice + edit (staff only) */}
          {canEdit && (
            <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("exam")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "exam"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                {mode === "exam" ? "🎯 מבחן" : "🏋️ תרגול"}
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "edit"
                    ? "bg-amber-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                ✏️ עריכת תרחיש
              </button>
            </div>
          )}

          {/* Edit tab content */}
          {activeTab === "edit" && canEdit && (
            <div className="space-y-4 mb-6">
              {/* Banner + full editor link */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <p className="text-xs text-amber-400 font-medium">✏️ עריכת תרחיש — סגל בלבד. שינויים משפיעים על כלל המשתמשים.</p>
                <Link
                  href={`/simulator/scenarios/${scenario.code}`}
                  target="_blank"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  עורך מלא ↗
                </Link>
              </div>

              {/* Quick: story */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">תיאור תרחיש (עריכה מהירה)</label>
                <textarea
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Quick: vitals */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">מדדים ראשוניים</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(editVitals).map(([key, val]) => {
                    const VITAL_LABELS: Record<string, string> = { pulse: "דופק", bp: "לחץ דם", spo2: "SpO2", rr: "נשימות", temp: "חום", gcs: "GCS" };
                    return (
                      <div key={key}>
                        <label className="block text-[10px] text-gray-500 mb-1">{VITAL_LABELS[key] ?? key}</label>
                        <input
                          value={val}
                          onChange={(e) => setEditVitals((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {editError && <p className="text-xs text-red-400">{editError}</p>}
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="w-full h-11 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {editSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editSaving ? "שומר..." : editSaved ? "✓ נשמר!" : "שמור שינויים מהירים"}
              </button>

              <p className="text-center text-xs text-gray-600">
                לעריכת שלבים, פעולות, רובריקה ומדדים לאחר טיפול — השתמש ב<Link href={`/simulator/scenarios/${scenario.code}`} target="_blank" className="text-amber-400 hover:underline">עורך המלא</Link>
              </p>
            </div>
          )}

          {/* Main exam content — hidden when edit tab active */}
          {activeTab === "exam" && (
          <div>
          <div className="mb-3 text-xs text-gray-500 flex items-center gap-3 flex-wrap">
            <span>קוד מעקב: <span className="font-mono text-indigo-400">{sessionCode}</span></span>
            <span className="text-indigo-300 font-medium">
              ⏱ התחלה: {startTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <Link
              href={`/simulator/monitor?session=${sessionCode}`}
              target="_blank"
              className="text-indigo-400 hover:underline"
            >
              פתח מסך מעקב ↗
            </Link>
          </div>

          {/* Examiner + Candidate fields */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <input
              value={examiner}
              onChange={(e) => {
                setExaminer(e.target.value);
                localStorage.setItem("mda_examiner", e.target.value);
              }}
              placeholder="שם הבוחן"
              dir="rtl"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white min-h-[44px] placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
            <input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="שם הנבחן"
              dir="rtl"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white min-h-[44px] placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* Scenario timer */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono ${timerRunning ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
              ⏱ {formatElapsed(elapsed)}
            </div>
            {!timerRunning && elapsed === 0 && (
              <button
                onClick={() => setTimerRunning(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors min-h-[36px]"
              >
                התחל תרחיש
              </button>
            )}
            {timerRunning && (
              <button
                onClick={() => setTimerRunning(false)}
                className="px-4 py-2 rounded-xl bg-yellow-600/80 hover:bg-yellow-500 text-white text-xs font-semibold transition-colors min-h-[36px]"
              >
                ⏸ עצור
              </button>
            )}
            {!timerRunning && elapsed > 0 && (
              <>
                <button
                  onClick={() => setTimerRunning(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors min-h-[36px]"
                >
                  ▶ המשך
                </button>
                <button
                  onClick={() => { setElapsed(0); setTimerRunning(false); }}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold transition-colors min-h-[36px]"
                >
                  ↺ איפוס
                </button>
              </>
            )}
          </div>

          {/* Vitals collapsible */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl mb-5 overflow-hidden">
            <button
              onClick={() => setVitalsOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 min-h-[52px] text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <span>📋 תרחיש ועקרים חיוניים</span>
              {vitalsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {vitalsOpen && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-gray-400 leading-relaxed">{scenario.story}</p>
                {/* Vitals as horizontal chips on mobile */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(scenario.vitals).map(([k, v]) => (
                    <div key={k} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
                      <p className="text-[10px] text-gray-500 uppercase">{k}</p>
                      <p className="text-sm font-semibold text-white">{v}</p>
                    </div>
                  ))}
                </div>
                {/* Fail criteria */}
                {scenario.failCriteria.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> קריטריוני כשלון אוטומטי
                    </p>
                    <ul className="space-y-1">
                      {scenario.failCriteria.map((fc, i) => (
                        <li key={i} className="text-xs text-red-300 flex items-start gap-1.5">
                          <span className="mt-0.5 shrink-0">⚠</span> {fc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results screen */}
          {submitted ? (
            <ResultsScreen
              earned={earned}
              max={max}
              pct={pct}
              passed={passed}
              manualOverride={manualOverride}
              onOverride={setManualOverride}
              phases={scenario.phases}
              answers={answers}
              missedActions={missedActions}
              saved={saved}
              saving={saving}
              onSave={handleSave}
              onReset={handleReset}
              mode={mode}
              scenarioCode={scenario.code}
              startTime={startTime}
              examiner={examiner}
              notes={notes}
            />
          ) : (
            <>
              {/* Phases */}
              <div className="space-y-4">
                {scenario.phases.map((phase) => (
                  <PhaseSection
                    key={phase.id}
                    phase={phase}
                    answers={answers}
                    setAnswer={setAnswer}
                    mode={mode}
                    open={!!openPhases[phase.id]}
                    onToggle={() => setOpenPhases(p => ({ ...p, [phase.id]: !p[phase.id] }))}
                  />
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">ציון נוכחי</span>
                  <span className="text-lg font-bold text-white">{earned}/{max}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", pct >= 70 ? "bg-green-500" : "bg-red-500")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">{pct}%</p>
              </div>

              {/* Written notes rubric */}
              <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="flex-1 border-t border-gray-700" />
                  <span className="shrink-0">הערות בכתב</span>
                  <span className="flex-1 border-t border-gray-700" />
                </h3>
                <div className="space-y-4">
                  {(
                    [
                      { key: "impression", label: "התרשמות כללית" },
                      { key: "strengths", label: "נקודות חוזק" },
                      { key: "improvements", label: "נקודות לשיפור" },
                      { key: "recommendation", label: "המלצת הבוחן" },
                    ] as { key: keyof typeof notes; label: string }[]
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">{label}</label>
                      <textarea
                        value={notes[key]}
                        onChange={(e) => setNotes((n) => ({ ...n, [key]: e.target.value }))}
                        rows={3}
                        dir="rtl"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none min-h-[80px]"
                        placeholder={label + "..."}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit — sticky on mobile */}
              <div className="sticky bottom-4 mt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-colors shadow-lg shadow-indigo-900/40"
                >
                  סיום מבחן
                </button>
              </div>
            </>
          )}
          </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function PhaseSection({
  phase,
  answers,
  setAnswer,
  mode,
  open,
  onToggle,
}: {
  phase: MdaPhase;
  answers: Record<string, number>;
  setAnswer: (id: string, v: number) => void;
  mode: "practice" | "exam";
  open: boolean;
  onToggle: () => void;
}) {
  const phaseEarned = phase.actions.reduce((s, a) => s + (answers[a.id] ?? 0), 0);
  const phaseMax = phase.actions.reduce((s, a) => s + a.maxScore, 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 min-h-[52px] hover:bg-gray-800 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-200 text-start">{phase.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">{phaseEarned}/{phaseMax}</span>
          {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-4 space-y-3">
          {phase.actions.map((action) => (
            <ActionRow
              key={action.id}
              action={action}
              value={answers[action.id] ?? -1}
              onChange={(v) => setAnswer(action.id, v)}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionRow({
  action,
  value,
  onChange,
  mode,
}: {
  action: MdaAction;
  value: number;
  onChange: (v: number) => void;
  mode: "practice" | "exam";
}) {
  const showFeedback = mode === "practice" && value >= 0;

  return (
    <div className={cn(
      "rounded-xl border p-3 transition-colors",
      value === 2 ? "border-green-500/40 bg-green-500/10" :
      value === 1 ? "border-yellow-500/40 bg-yellow-500/10" :
      value === 0 ? "border-red-500/40 bg-red-500/10" :
      "border-gray-700 bg-gray-800/50"
    )}>
      <p className="text-sm text-gray-200 mb-3 leading-snug">{action.text}</p>
      {/* Large scoring buttons — critical for exam use */}
      <div className="flex gap-2">
        {([0, 1, 2] as const).map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-bold border transition-all",
              value === score
                ? score === 0
                  ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-900/40"
                  : score === 1
                    ? "bg-yellow-500 border-yellow-400 text-gray-900 shadow-lg shadow-yellow-900/40"
                    : "bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/40"
                : score === 0
                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  : score === 1
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                    : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
            )}
          >
            {score === 0 ? "✗ 0" : score === 1 ? "~ 1" : "✓ 2"}
          </button>
        ))}
      </div>
      {showFeedback && value < 2 && (
        <p className={cn("text-xs mt-2", value === 0 ? "text-red-400" : "text-yellow-400")}>
          {value === 0 ? "❌ פעולה זו לא בוצעה — חשוב לתרגל!" : "⚠️ בוצע חלקית — שפר את הביצוע"}
        </p>
      )}
      {showFeedback && value === 2 && (
        <p className="text-xs mt-2 text-green-400">✅ מצוין!</p>
      )}
    </div>
  );
}

function ResultsScreen({
  earned, max, pct, passed,
  manualOverride, onOverride,
  phases, answers, missedActions,
  saved, saving, onSave, onReset,
  mode, scenarioCode,
  startTime, examiner, notes,
}: {
  earned: number; max: number; pct: number; passed: boolean;
  manualOverride: "pass" | "fail" | null;
  onOverride: (v: "pass" | "fail" | null) => void;
  phases: MdaPhase[]; answers: Record<string, number>;
  missedActions: { phase: string; action: MdaAction }[];
  saved: boolean; saving: boolean;
  onSave: () => void; onReset: () => void;
  mode: string; scenarioCode: string;
  startTime: Date;
  examiner: string;
  notes: { impression: string; strengths: string; improvements: string; recommendation: string };
}) {
  const endTime = new Date();
  const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  return (
    <div className="space-y-5">
      {/* Pass/Fail Banner */}
      <div className={cn(
        "rounded-xl p-6 text-center border",
        passed
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/30"
      )}>
        {passed ? (
          <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
        ) : (
          <XCircle size={48} className="mx-auto text-red-400 mb-3" />
        )}
        <p className={cn("text-2xl font-bold mb-2", passed ? "text-green-400" : "text-red-400")}>
          {passed ? "עברת את הבחינה! 🎉" : "לא עברת את הבחינה"}
        </p>
        <p className="text-5xl font-black text-white my-3">{pct}%</p>
        <p className="text-gray-400 text-sm">{earned} מתוך {max} נקודות | סף מעבר: 70%</p>
      </div>

      {/* Examiner pass/fail override */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">החלטת הבוחן — עבר / נכשל</p>
        <div className="flex gap-3">
          <button
            onClick={() => onOverride(manualOverride === "pass" ? null : "pass")}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm border transition-all",
              manualOverride === "pass"
                ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/40"
                : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
            )}
          >
            ✓ עבר/ה
          </button>
          <button
            onClick={() => onOverride(manualOverride === "fail" ? null : "fail")}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm border transition-all",
              manualOverride === "fail"
                ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-900/40"
                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            )}
          >
            ✗ נכשל/ה
          </button>
        </div>
        {manualOverride && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {manualOverride === "pass" ? "✓ סומן ידנית כעבר/ה" : "✗ סומן ידנית כנכשל/ה"} — לחץ שוב לביטול
          </p>
        )}
        {!manualOverride && (
          <p className="text-xs text-gray-600 mt-2 text-center">ללא סימון — תוצאה אוטומטית ({pct}% / סף 70%)</p>
        )}
      </div>

      {/* Session meta: time + examiner + notes summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex flex-wrap gap-4 text-gray-400">
          <span>
            ⏱ התחלה: <span className="text-white">{startTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>
          </span>
          <span>
            🕐 סיום: <span className="text-white">{endTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>
          </span>
          <span>
            ⏳ משך: <span className="text-white">{durationMin} דקות</span>
          </span>
          {examiner && (
            <span>
              👤 בוחן: <span className="text-white">{examiner}</span>
            </span>
          )}
        </div>
        {Object.values(notes).some(Boolean) && (
          <div className="mt-2 space-y-1">
            {(
              [
                { key: "impression" as const, label: "התרשמות" },
                { key: "strengths" as const, label: "חוזקות" },
                { key: "improvements" as const, label: "שיפור" },
                { key: "recommendation" as const, label: "המלצה" },
              ]
            ).map(({ key, label }) =>
              notes[key] ? (
                <p key={key} className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">{label}: </span>
                  {notes[key].slice(0, 80)}{notes[key].length > 80 ? "…" : ""}
                </p>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Per-phase breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">פירוט לפי שלב</h3>
        <div className="space-y-2">
          {phases.map((phase) => {
            const pe = phase.actions.reduce((s, a) => s + (answers[a.id] ?? 0), 0);
            const pm = phase.actions.reduce((s, a) => s + a.maxScore, 0);
            const pp = pm === 0 ? 0 : Math.round((pe / pm) * 100);
            return (
              <div key={phase.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-32 truncate shrink-0">{phase.title}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", pp >= 70 ? "bg-green-500" : "bg-red-500")}
                    style={{ width: `${pp}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 shrink-0">{pe}/{pm}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed actions */}
      {missedActions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            פעולות שלא בוצעו בשלמות ({missedActions.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {missedActions.map(({ phase, action }) => (
              <div key={action.id} className="flex items-start gap-2 text-xs">
                <span className={cn(
                  "shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center font-bold",
                  (answers[action.id] ?? 0) === 0
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                )}>
                  {answers[action.id] ?? 0}
                </span>
                <div>
                  <span className="text-gray-500">{phase} · </span>
                  <span className="text-gray-300">{action.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {!saved ? (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-indigo-600/20 border border-indigo-600/30 text-indigo-400 text-sm font-medium hover:bg-indigo-600/30 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "שומר..." : "שמור לארכיון"}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-green-600/20 border border-green-600/30 text-green-400 text-sm font-medium">
            <CheckCircle size={16} />
            נשמר!
          </div>
        )}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={16} />
          תרגל שוב
        </button>
        <Link
          href="/simulator"
          className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors text-center"
        >
          <ArrowRight size={16} />
          חזור לתרחישים
        </Link>
      </div>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-950 items-center justify-center">
        <p className="text-gray-400">טוען...</p>
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
