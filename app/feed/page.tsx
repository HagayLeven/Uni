"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Feed } from "@/components/feed/Feed";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CommunityChat } from "@/components/chat/CommunityChat";

export default function FeedPage() {
  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }}>
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar />
          <div className="max-w-2xl mx-auto w-full px-3 py-4 pb-28 md:pb-6">
            <Feed />
          </div>
        </main>
      </div>
      <BottomNav />
      <CommunityChat />
    </>
  );
}
