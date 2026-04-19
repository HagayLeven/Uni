"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Brain, ChevronLeft, Gamepad2, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import QuizGame from "@/components/games/QuizGame";
import MemoryGame from "@/components/games/MemoryGame";
import FlashCards from "@/components/games/FlashCards";

type GameMode = "menu" | "quiz" | "memory" | "flashcards";

const GAMES = [
  {
    id: "quiz",
    icon: Zap,
    emoji: "⚡",
    name: "שאלות ותשובות",
    description: "10 שאלות מבחן בזמן — פרוטוקולים, תרופות, מינונים",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    gradient: "from-yellow-600 to-orange-600",
  },
  {
    id: "memory",
    icon: Brain,
    emoji: "🧠",
    name: "משחק זיכרון",
    description: "התאם תרופה למינון — זוגות קליניים",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    id: "flashcards",
    icon: Layers,
    emoji: "📚",
    name: "כרטיסיות",
    description: "חזרה מהירה — פרוטוקול → צד אחד, תרופה → צד שני",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    gradient: "from-green-600 to-teal-600",
  },
];

export default function GamesPage() {
  const [mode, setMode] = useState<GameMode>("menu");

  if (mode === "quiz")       return <QuizGame onBack={() => setMode("menu")} />;
  if (mode === "memory")     return <MemoryGame onBack={() => setMode("menu")} />;
  if (mode === "flashcards") return <FlashCards onBack={() => setMode("menu")} />;

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
                <Gamepad2 size={20} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">משחקי למידה</h1>
                <p className="text-xs text-gray-500">חזור על חומר בדרך מהנה — תרוויח XP</p>
              </div>
            </div>

            <div className="space-y-3">
              {GAMES.map((game) => {
                const Icon = game.icon;
                return (
                  <button
                    key={game.id}
                    onClick={() => setMode(game.id as GameMode)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.01] text-start",
                      game.bg
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shrink-0",
                      game.gradient,
                    )}>
                      {game.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{game.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{game.description}</p>
                    </div>
                    <ChevronLeft size={16} className="text-gray-600 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-400">
                משחקים = <span className="text-indigo-400 font-semibold">XP</span> — כל משחק שלם מזכה ב-+10 XP
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
