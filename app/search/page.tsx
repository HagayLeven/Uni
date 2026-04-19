"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PostCard } from "@/components/feed/PostCard";
import { Loader2, Search } from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data } = await supabase
      .from("posts")
      .select("id, content, type, upvotes, downvotes, sensitivity, created_at, profiles(full_name, avatar_url), topics(title)")
      .ilike("content", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    setResults((data ?? []).map((row: any) => {
      const lines = (row.content ?? "").split("\n").filter(Boolean);
      return {
        id: row.id,
        type: row.type ?? "summary",
        title: lines[0] ?? "",
        body: (lines.slice(1).join("\n").trim() || lines[0]) ?? "",
        author: { name: row.profiles?.full_name ?? "משתמש", avatar: row.profiles?.avatar_url ?? null },
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

    setLoading(false);
  };

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חפש פוסטים, סיכומים, שאלות..."
                  autoFocus
                  className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button type="submit" disabled={loading}
                className="h-11 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm">
                חפש
              </button>
            </form>

            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <p className="text-center text-gray-600 py-12">לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
            )}

            {!loading && results.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
