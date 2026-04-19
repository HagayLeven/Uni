"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PostCard } from "@/components/feed/PostCard";
import { Settings, Zap } from "lucide-react";
import Link from "next/link";

interface Profile {
  full_name: string;
  avatar_url: string | null;
  faculty: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, faculty")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);

      const { data: userPosts } = await supabase
        .from("posts")
        .select("id, content, type, upvotes, downvotes, sensitivity, created_at, topics(title)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (userPosts) {
        setPosts(userPosts.map((row: any) => {
          const lines = (row.content ?? "").split("\n").filter(Boolean);
          return {
            id: row.id,
            type: row.type ?? "summary",
            title: lines[0] ?? "",
            body: (lines.slice(1).join("\n").trim() || lines[0]) ?? "",
            authorId: user.id,
            author: { name: prof?.full_name ?? "אני", avatar: prof?.avatar_url ?? null },
            course: row.topics?.title ?? "כללי",
            upvotes: row.upvotes ?? 0,
            downvotes: row.downvotes ?? 0,
            score: (row.upvotes ?? 0) - (row.downvotes ?? 0),
            comments: 0,
            sensitivity: row.sensitivity ?? "safe",
            userVote: null,
            timeAgo: timeAgo(row.created_at),
            files: [],
          };
        }));
      }
    }
    load();
  }, []);

  const initials = profile?.full_name?.[0] ?? "?";

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          {/* Header */}
          <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
            <div className="flex items-center gap-5">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{profile?.full_name ?? "טוען..."}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{profile?.faculty ?? "פראמדיק"}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Zap size={13} className="text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-semibold">0 XP</span>
                  <span className="text-xs text-gray-600 mx-1">·</span>
                  <span className="text-xs text-gray-500">{posts.length} פרסומים</span>
                </div>
              </div>
              <Link href="/settings"
                className="p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors shrink-0">
                <Settings size={18} />
              </Link>
            </div>
          </div>

          {/* Posts */}
          <div className="max-w-2xl mx-auto px-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">הפרסומים שלי</h2>
            {posts.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <p>עדיין לא פרסמת כלום</p>
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}
