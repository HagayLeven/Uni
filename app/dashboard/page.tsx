"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { Feed } from "@/components/feed/Feed";
import { XPWidget } from "@/components/layout/XPWidget";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OnboardingModal } from "@/components/ui/OnboardingModal";
import { WorkPlanWidget } from "@/components/dashboard/WorkPlanWidget";
import { JoinCoursePrompt } from "@/components/dashboard/JoinCoursePrompt";

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userId, setUserId]   = useState<string | null>(null);
  const [hasCourse, setHasCourse] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_done, course_id")
        .eq("id", user.id)
        .single();
      if (!profile?.onboarding_done) setShowOnboarding(true);
      setHasCourse(!!profile?.course_id);
    }
    checkOnboarding();
  }, []);

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }}>
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar />
          <div className="flex-1">
            <div className="max-w-2xl mx-auto px-3 py-4 pb-28 md:pb-6">
              <Feed />
            </div>
          </div>
        </main>
        <aside className="hidden xl:flex flex-col w-72 shrink-0 border-s border-gray-800 p-4 gap-4 overflow-y-auto">
          <XPWidget />
          {!hasCourse && <JoinCoursePrompt />}
          {hasCourse && <WorkPlanWidget />}
        </aside>
      </div>
      <BottomNav />

      {showOnboarding && userId && (
        <OnboardingModal userId={userId} onClose={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
