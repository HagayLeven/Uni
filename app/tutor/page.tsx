"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { UniCharacter } from "@/components/uni/UniCharacter";
import { Sparkles, Clock, Wrench } from "lucide-react";

export default function TutorPage() {
  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 md:pb-6 relative overflow-hidden">

          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-purple-700/10 blur-[100px]" />
          </div>

          <div className="relative flex flex-col items-center gap-8 max-w-sm text-center">

            {/* Animated Uni character */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl scale-150 animate-pulse" />
              <UniCharacter pose="sleeping" size={100} animate />
            </div>

            {/* Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
              <Wrench size={12} className="text-indigo-400 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-xs font-semibold text-indigo-400 tracking-wide">בפיתוח פעיל</span>
            </div>

            {/* Main text */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white leading-tight">
                המדריך ה-AI
                <br />
                <span className="bg-gradient-to-l from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  עובדים על זה 🛠️
                </span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                אנחנו בונים לך חווית לימוד חכמה —
                <br />
                שאלות, הסברים, חזרות וקיצורי דרך.
                <br />
                <span className="text-gray-500">נתראה בקרוב!</span>
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { emoji: "🧠", label: "שאלות חכמות" },
                { emoji: "📋", label: "פרוטוקולים" },
                { emoji: "⚡", label: "חזרה מהירה" },
                { emoji: "🎯", label: "אימון ממוקד" },
              ].map((f) => (
                <div key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/50 text-xs text-gray-400">
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Timer hint */}
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <Clock size={12} />
              <span>בקרוב באפליקציה</span>
              <Sparkles size={12} className="text-indigo-500" />
            </div>

          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
