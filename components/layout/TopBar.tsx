"use client";

import { Bell, Plus, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CreatePostModal } from "@/components/feed/CreatePostModal";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

// Mock XP data (replace with Supabase)
const MOCK_XP = { current: 240, nextLevel: 500, level: "Junior", levelNum: 2 };

export function TopBar() {
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.email === ADMIN_EMAIL);
    });
  }, []);

  const xpPercent = Math.round((MOCK_XP.current / MOCK_XP.nextLevel) * 100);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 glass border-b border-white/5" dir="rtl">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
          <input
            type="search"
            placeholder="חיפוש בחומרי הקורס..."
            className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg pe-9 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* XP bar — hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-xl shrink-0">
          <Zap size={13} className="text-yellow-400 shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-[80px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">רמה {MOCK_XP.levelNum} · {MOCK_XP.level}</span>
              <span className="text-[10px] text-yellow-400 font-semibold">{MOCK_XP.current} XP</span>
            </div>
            <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-gray-600 shrink-0">{MOCK_XP.nextLevel}</span>
        </div>

        {/* New post button — admin only */}
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 h-9 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shrink-0">
            <Plus size={15} />
            <span className="hidden md:inline">פרסום חדש</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(v => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors">
            <Bell size={17} />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute top-11 end-0 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">התראות</span>
                <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">סמן הכל כנקרא</span>
              </div>
              {[
                { text: "רונית הגיבה לפוסט שלך באלגברה לינארית", time: "לפני 5 דק'" },
                { text: "פוסט חדש בקהילת מדעי המחשב", time: "לפני 20 דק'" },
                { text: "קיבלת 50 XP על סיכום שהועלה", time: "לפני שעה" },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-800/50">
                  <p className="text-xs text-gray-200 leading-relaxed">{n.text}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {createOpen && <CreatePostModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
