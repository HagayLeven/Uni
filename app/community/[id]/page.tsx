"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { Feed } from "@/components/feed/Feed";
import { Users } from "lucide-react";

interface Community {
  id: string;
  name: string;
  description: string | null;
}

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    supabase
      .from("communities")
      .select("id, name, description")
      .eq("id", id)
      .single()
      .then(({ data }) => { if (data) setCommunity(data); });
  }, [id]);

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }}>
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar />
          <div className="max-w-2xl mx-auto w-full px-3 py-4 pb-28 md:pb-6" dir="rtl">
            {/* Community header */}
            {community && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center shrink-0">
                  <Users size={22} className="text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{community.name}</h1>
                  {community.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{community.description}</p>
                  )}
                </div>
              </div>
            )}
            <Feed />
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
