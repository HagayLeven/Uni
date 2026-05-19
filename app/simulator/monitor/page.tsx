"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SUPERVISOR_EMAILS = ["hagayas2001@gmail.com", "paz.gutman@gmail.com", "danbenishi@gmail.com"];

interface ExamStatePayload {
  candidate: string;
  phase: number;
  answers: Record<string, number>;
  pct: number;
}

interface RubricItem { text: string; maxScore: number }
interface RubricCategory { id: string; title: string; items: RubricItem[] }

// ── Graduation monitor ────────────────────────────────────────────────────────
function GraduationMonitor({ candidateName }: { candidateName: string }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [failChecked, setFailChecked] = useState<Record<string, boolean>>({});
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<{ impression: string; strengths: string; improvements: string; recommendation: string } | null>(null);
  const [rubric, setRubric] = useState<RubricCategory[]>([]);
  const [failCriteria, setFailCriteria] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Live meta from broadcaster
  const [liveExaminer, setLiveExaminer] = useState<string>("");
  const [liveCandidateId, setLiveCandidateId] = useState<string>("");
  const [liveScenarioTitle, setLiveScenarioTitle] = useState<string>("");
  const [liveGroupId, setLiveGroupId] = useState<number | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const applyState = (state: any) => {
    if (!state) return;
    if (state.scores) setScores(state.scores);
    if (state.failChecked) setFailChecked(state.failChecked);
    if (state.timestamps) setTimestamps(state.timestamps);
    if (state.notes) setNotes(state.notes);
    if (state.examiner) setLiveExaminer(state.examiner);
    if (state.candidateId !== undefined) setLiveCandidateId(state.candidateId ?? "");
    if (state.scenarioTitle) setLiveScenarioTitle(state.scenarioTitle);
    if (state.groupId !== undefined) setLiveGroupId(state.groupId ?? null);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    // Load rubric config
    supabase.from("graduation_config").select("rubric, fail_criteria").eq("id", "default").maybeSingle()
      .then(({ data }) => {
        if (data?.rubric && Array.isArray(data.rubric)) setRubric(data.rubric as RubricCategory[]);
        if (data?.fail_criteria && Array.isArray(data.fail_criteria)) setFailCriteria(data.fail_criteria as string[]);
      });

    // Load initial state from DB
    supabase.from("graduation_live_state").select("state").eq("candidate_name", candidateName).maybeSingle()
      .then(({ data }) => { if (data?.state) { applyState(data.state); setConnected(true); } });

    // Subscribe to Postgres Realtime changes — reliable, no broadcast issues
    const ch = supabase.channel("monitor-" + Math.random().toString(36).slice(2))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "graduation_live_state",
        filter: `candidate_name=eq.${candidateName}`,
      }, (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row?.state) applyState(row.state);
        setConnected(true);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnected(true);
      });

    channelRef.current = ch;
    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateName]);

  const scoreKey = (catId: string | undefined, idx: number) =>
    catId ? `${catId}.${idx}` : `__cat${idx}`;

  const earned = rubric.reduce((s, cat) =>
    s + cat.items.reduce((cs, item, i) => {
      const v = scores[scoreKey(cat.id, i)] ?? 0;
      return v === -1 ? cs : cs + (v / 3) * item.maxScore;
    }, 0), 0);
  const maxScore = rubric.reduce((s, cat) =>
    s + cat.items.reduce((cs, item, i) => {
      const v = scores[scoreKey(cat.id, i)];
      return v === -1 ? cs : cs + item.maxScore;
    }, 0), 0);
  const pct = maxScore === 0 ? 0 : Math.round((earned / maxScore) * 100);
  const anyFail = Object.values(failChecked).some(Boolean);
  const passed = !anyFail && pct >= 60;

  const SCORE_BG = [
    "bg-red-500/20 border-red-500/40 text-red-400",
    "bg-orange-500/20 border-orange-500/40 text-orange-400",
    "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
    "bg-green-500/20 border-green-500/40 text-green-400",
  ];
  const SCORE_LABELS = ["לא בוצע", "חלקי", "טוב", "מעולה"];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 p-3 md:p-5">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h1 className="text-lg font-bold text-amber-400">🎓 צפייה חיה — בחינת בגרות</h1>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
              <span className={`text-xs font-semibold ${connected ? "text-green-400" : "text-gray-500"}`}>
                {connected ? "מחובר בזמן אמת" : "מתחבר..."}
              </span>
            </div>
          </div>
          {/* Exam meta — mirrors what the examiner sees */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800 rounded-lg px-3 py-2">
              <p className="text-gray-500 mb-0.5">נבחן/ת</p>
              <p className="text-white font-semibold">{candidateName}</p>
            </div>
            {liveCandidateId && <div className="bg-gray-800 rounded-lg px-3 py-2">
              <p className="text-gray-500 mb-0.5">ת.ז.</p>
              <p className="text-white font-mono">{liveCandidateId}</p>
            </div>}
            {liveGroupId && <div className="bg-gray-800 rounded-lg px-3 py-2">
              <p className="text-gray-500 mb-0.5">קבוצה</p>
              <p className="text-white font-semibold">קבוצה {liveGroupId}</p>
            </div>}
            {liveExaminer && <div className="bg-gray-800 rounded-lg px-3 py-2">
              <p className="text-gray-500 mb-0.5">בוחן</p>
              <p className="text-white font-semibold">{liveExaminer}</p>
            </div>}
            {liveScenarioTitle && <div className="bg-gray-800 rounded-lg px-3 py-2 col-span-2">
              <p className="text-gray-500 mb-0.5">תרחיש</p>
              <p className="text-white font-semibold">{liveScenarioTitle}</p>
            </div>}
          </div>
          <div className="mt-2 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-[10px] text-gray-600">
                  עדכון אחרון: {lastUpdate.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score banner */}
        <div className={`rounded-xl p-4 text-center border ${passed ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <div className={`text-5xl font-black mb-1 ${passed ? "text-green-400" : "text-red-400"}`}>{pct}%</div>
          <div className={`text-lg font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
            {passed ? "✅ עובר" : "❌ נכשל"}
          </div>
          <div className="text-xs text-gray-500 mt-1">{Math.round(earned)}/{maxScore} נקודות</div>
        </div>

        {/* Fail criteria */}
        {failCriteria.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-800/80">
              <span className="text-sm font-semibold text-white">⚠ קריטריוני כישלון</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {failCriteria.map((fc, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                  failChecked[i]
                    ? "bg-red-500/20 border-red-500/50"
                    : "bg-gray-800/40 border-gray-700"
                }`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    failChecked[i] ? "bg-red-500 border-red-400" : "border-gray-600"
                  }`}>
                    {failChecked[i] && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className={`text-xs ${failChecked[i] ? "text-red-300 font-semibold" : "text-gray-400"}`}>{fc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rubric categories */}
        {rubric.map((cat) => {
          const catEarned = cat.items.reduce((s, item, i) => {
            const v = scores[scoreKey(cat.id, i)] ?? 0;
            return v === -1 ? s : s + (v / 3) * item.maxScore;
          }, 0);
          const catMax = cat.items.reduce((s, item, i) => {
            const v = scores[scoreKey(cat.id, i)];
            return v === -1 ? s : s + item.maxScore;
          }, 0);
          return (
            <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-800/80 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{cat.title}</span>
                <span className="text-xs text-gray-400">{Math.round(catEarned)}/{catMax}</span>
              </div>
              <div className="px-4 py-3 space-y-3">
                {cat.items.map((item, i) => {
                  const key = scoreKey(cat.id, i);
                  const v = scores[key] ?? 0;
                  const ts = timestamps[key];
                  if (v === -1) return (
                    <div key={i} className="flex items-center gap-3 opacity-30">
                      <div className="w-7 h-7 rounded-lg border border-gray-700 text-[10px] flex items-center justify-center shrink-0 text-gray-500">ל</div>
                      <p className="text-xs text-gray-500 line-through">{item.text}</p>
                    </div>
                  );
                  const pts = Math.round((v / 3) * item.maxScore);
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        {/* Score indicator — mirrors the 0-3 buttons */}
                        <div className="flex gap-1 shrink-0">
                          {[0, 1, 2, 3].map((btn) => (
                            <div
                              key={btn}
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                                v === btn
                                  ? SCORE_BG[btn] + " ring-2 ring-offset-1 ring-offset-gray-900 " + (btn === 0 ? "ring-red-500/60" : btn === 1 ? "ring-orange-500/60" : btn === 2 ? "ring-yellow-500/60" : "ring-green-500/60")
                                  : "bg-gray-800/30 border-gray-700/30 text-gray-700"
                              }`}
                            >
                              {btn}
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-200 leading-snug">{item.text}</p>
                        </div>
                        <span className={`text-xs font-bold shrink-0 ${
                          v === 0 ? "text-red-400" : v === 1 ? "text-orange-400" : v === 2 ? "text-yellow-400" : "text-green-400"
                        }`}>{pts}/{item.maxScore}</span>
                      </div>
                      {ts && (
                        <div className="flex items-center gap-1.5 pr-1">
                          <span className="text-[11px] text-blue-400 font-mono bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5">
                            ⏱ {ts}
                          </span>
                          <span className="text-[10px] text-gray-500">{SCORE_LABELS[v]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Notes (if examiner filled anything) */}
        {notes && (notes.impression || notes.strengths || notes.improvements || notes.recommendation) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-800/80">
              <span className="text-sm font-semibold text-white">📝 הערות בוחן</span>
            </div>
            <div className="px-4 py-3 space-y-2 text-xs text-gray-300">
              {notes.impression   && <p><span className="text-gray-500">סיבת כישלון:</span> {notes.impression}</p>}
              {notes.strengths    && <p><span className="text-gray-500">הערות כלליות:</span> {notes.strengths}</p>}
              {notes.improvements && <p><span className="text-gray-500">נקודות לשיפור:</span> {notes.improvements}</p>}
              {notes.recommendation && <p><span className="text-gray-500">המלצה:</span> {notes.recommendation}</p>}
            </div>
          </div>
        )}

        {!lastUpdate && connected && (
          <div className="text-center py-8 text-gray-600 text-sm">
            ממתין לעדכון מהבוחן...
          </div>
        )}

      </div>
    </div>
  );
}

// ── Regular session monitor ───────────────────────────────────────────────────
function SessionMonitor({ sessionCode }: { sessionCode: string }) {
  const [state, setState] = useState<ExamStatePayload | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionCode) return;

    timeoutRef.current = setTimeout(() => setTimedOut(true), 30_000);

    const ch = supabase.channel("exam-session-" + sessionCode);
    channelRef.current = ch;

    ch.on("broadcast", { event: "state_update" }, ({ payload }) => {
      if (typeof payload !== "object" || payload === null) return;
      const p = payload as Partial<ExamStatePayload>;
      setState({
        candidate: typeof p.candidate === "string" ? p.candidate : "—",
        phase: typeof p.phase === "number" ? p.phase : 0,
        answers: typeof p.answers === "object" && p.answers !== null ? p.answers as Record<string, number> : {},
        pct: typeof p.pct === "number" ? p.pct : 0,
      });
      setTimedOut(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setTimedOut(true), 30_000);
    });

    ch.subscribe();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sessionCode]);

  const answeredCount = state ? Object.values(state.answers).filter((v) => v > 0).length : 0;
  const totalCount = state ? Object.keys(state.answers).length : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 overflow-x-hidden">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-1">מסך מעקב בחינה</h1>
          <p className="text-sm text-gray-500 font-mono">קוד: {sessionCode || "לא צוין"}</p>
        </div>

        {(!state || timedOut) && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6 text-center">
            <p className="text-amber-400 font-semibold text-lg">
              {timedOut ? "⏱ אין עדכון מהבוחן מזה 30 שניות" : "מחכה לנתונים..."}
            </p>
            <p className="text-amber-500/60 text-sm mt-2">ודא שקוד המעקב נכון והבחינה פעילה</p>
          </div>
        )}

        {state && !timedOut && (
          <div className="space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-sm text-gray-500 mb-1">תרחיש נוכחי</p>
              <p className="text-2xl font-bold text-white">{state.candidate}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 mb-3">ציון חי</p>
              <p className={`text-6xl font-black mb-4 ${state.pct >= 60 ? "text-green-400" : "text-red-400"}`}>{state.pct}%</p>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${state.pct >= 60 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${state.pct}%` }} />
              </div>
              <p className="text-sm text-gray-500 mt-2">סף מעבר: 60%</p>
            </div>
            <div className={`rounded-2xl p-5 text-center border ${state.pct >= 60 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <p className={`text-2xl font-black ${state.pct >= 60 ? "text-green-400" : "text-red-400"}`}>{state.pct >= 60 ? "✅ עובר" : "❌ נכשל"}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-sm text-gray-500 mb-1">פעולות שבוצעו</p>
              <p className="text-3xl font-bold text-white">{answeredCount} / {totalCount}</p>
            </div>
            <div className="flex items-center justify-center gap-3 py-2">
              <span className="w-4 h-4 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-500/50" />
              <span className="text-green-400 font-semibold text-base">מחובר בזמן אמת</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function MonitorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const candidateName = searchParams.get("candidate") ?? "";
  const sessionCode = searchParams.get("session") ?? "";
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (type !== "graduation") { setAllowed(true); return; }
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/dashboard"); return; }
      if (SUPERVISOR_EMAILS.includes(user.email ?? "")) { setAllowed(true); return; }
      const { data: p } = await supabase.from("profiles").select("role, faculty, permissions").eq("id", user.id).single();
      const ok = (p as any)?.faculty === "אדמיניסטרציה"
        || ["root","מנהל מערכת"].includes((p as any)?.role ?? "")
        || (p as any)?.permissions?.supervisor_access === true;
      if (!ok) { router.replace("/dashboard"); return; }
      setAllowed(true);
    });
  }, [type, router]);

  if (type === "graduation" && allowed === null) {
    return <div className="flex h-screen bg-gray-950 items-center justify-center"><p className="text-gray-400">בודק הרשאות...</p></div>;
  }

  if (type === "graduation" && candidateName) {
    return <GraduationMonitor candidateName={candidateName} />;
  }

  return <SessionMonitor sessionCode={sessionCode} />;
}

export default function MonitorPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-gray-950 items-center justify-center">
        <p className="text-gray-400 text-lg">טוען...</p>
      </div>
    }>
      <MonitorContent />
    </Suspense>
  );
}
