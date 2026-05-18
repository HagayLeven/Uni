"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ExamStatePayload {
  candidate: string;
  phase: number;
  answers: Record<string, number>;
  pct: number;
}

function MonitorContent() {
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get("session") ?? "";

  const [state, setState] = useState<ExamStatePayload | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionCode) return;

    // 30-second heartbeat timeout
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, 30_000);

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

        {/* Warning — no data / timed out */}
        {(!state || timedOut) && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6 text-center">
            <p className="text-amber-400 font-semibold text-lg">
              {timedOut ? "⏱ אין עדכון מהבוחן מזה 30 שניות" : "מחכה לנתונים..."}
            </p>
            <p className="text-amber-500/60 text-sm mt-2">
              ודא שקוד המעקב נכון והבחינה פעילה
            </p>
          </div>
        )}

        {/* Live state */}
        {state && !timedOut && (
          <div className="space-y-5">
            {/* Candidate */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-sm text-gray-500 mb-1">תרחיש נוכחי</p>
              <p className="text-2xl font-bold text-white">{state.candidate}</p>
            </div>

            {/* Score — very large */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 mb-3">ציון חי</p>
              <p className={`text-6xl font-black mb-4 ${state.pct >= 70 ? "text-green-400" : "text-red-400"}`}>
                {state.pct}%
              </p>
              {/* Thick progress bar */}
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    state.pct >= 70 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${state.pct}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">סף מעבר: 70%</p>
            </div>

            {/* Pass/fail status banner */}
            <div className={`rounded-2xl p-5 text-center border ${
              state.pct >= 70
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <p className={`text-2xl font-black ${state.pct >= 70 ? "text-green-400" : "text-red-400"}`}>
                {state.pct >= 70 ? "✅ עובר" : "❌ נכשל"}
              </p>
            </div>

            {/* Actions summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-sm text-gray-500 mb-1">פעולות שבוצעו</p>
              <p className="text-3xl font-bold text-white">
                {answeredCount} / {totalCount}
              </p>
            </div>

            {/* Live indicator — large pulse */}
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

export default function MonitorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-gray-950 items-center justify-center">
          <p className="text-gray-400 text-lg">טוען...</p>
        </div>
      }
    >
      <MonitorContent />
    </Suspense>
  );
}
