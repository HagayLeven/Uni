"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Feed } from "@/components/feed/Feed";
import { XPWidget } from "@/components/layout/XPWidget";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardPage() {
  return (
    <>
      {/* ── Full-screen shell ── */}
      <div className="flex bg-gray-950" style={{ height: "100dvh" }}>

        {/* Sidebar: desktop only */}
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>

        {/* Main scroll area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar />
          <div className="flex-1">
            <div className="max-w-2xl mx-auto px-3 py-4 pb-28 md:pb-6">
              <Feed />
            </div>
          </div>
        </main>

        {/* XP panel: xl+ only */}
        <aside className="hidden xl:flex flex-col w-72 shrink-0 border-s border-gray-800 p-4 gap-4 overflow-y-auto">
          <XPWidget />
        </aside>
      </div>

      {/* Bottom nav: OUTSIDE the overflow container so fixed works */}
      <BottomNav />
    </>
  );
}
