"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2, Search, FileText, Users, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Tab = "posts" | "users";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "עכשיו";
  if (m < 60) return `לפני ${m} דק'`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש'`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

const POST_TYPE_LABELS: Record<string, string> = {
  question: "שאלה", summary: "סיכום", resource: "חומר לימוד",
  note: "הערה", exam_question: "שאלת מבחן",
};

export default function SearchPage() {
  const [query, setQuery]       = useState("");
  const [tab, setTab]           = useState<Tab>("posts");
  const [posts, setPosts]       = useState<any[]>([]);
  const [users, setUsers]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) { setPosts([]); setUsers([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);

    const [{ data: postData }, { data: userData }] = await Promise.all([
      supabase
        .from("posts")
        .select("id, content, type, upvotes, downvotes, created_at, author_id, profiles!author_id(full_name, avatar_url)")
        .ilike("content", `%${q}%`)
        .eq("is_announcement", false)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, faculty, login_streak")
        .or(`full_name.ilike.%${q}%,faculty.ilike.%${q}%`)
        .limit(15),
    ]);

    setPosts((postData ?? []).map((r: any) => {
      const lines = (r.content ?? "").split("\n").filter(Boolean);
      return {
        id: r.id,
        type: r.type ?? "note",
        title: lines[0] ?? "",
        body: lines.slice(1).join(" ").trim() || lines[0] || "",
        author: { name: r.profiles?.full_name ?? "משתמש", avatar: r.profiles?.avatar_url ?? null },
        author_id: r.author_id,
        upvotes: r.upvotes ?? 0,
        downvotes: r.downvotes ?? 0,
        created_at: r.created_at,
      };
    }));

    setUsers(userData ?? []);
    setLoading(false);
  };

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const totalResults = posts.length + users.length;

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

            {/* Search bar */}
            <div className="relative">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 end-3.5 text-gray-500 pointer-events-none" />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute top-1/2 -translate-y-1/2 start-3.5 text-gray-500 hover:text-gray-300 transition-colors">
                  <X size={15} />
                </button>
              )}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חפש פוסטים, משתמשים, נושאים..."
                autoFocus
                className={cn(
                  "w-full h-12 bg-gray-900 border border-gray-700 rounded-2xl text-sm text-gray-100",
                  "placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors",
                  query ? "pe-10 ps-10" : "pe-10 ps-4"
                )}
              />
            </div>

            {/* Tabs */}
            {searched && !loading && (
              <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
                {([
                  { id: "posts", label: "פוסטים", count: posts.length, icon: FileText },
                  { id: "users", label: "משתמשים", count: users.length, icon: Users },
                ] as const).map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                      tab === t.id ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"
                    )}>
                    <t.icon size={12} />
                    {t.label}
                    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]",
                      tab === t.id ? "bg-indigo-500" : "bg-gray-800")}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 size={22} className="animate-spin text-indigo-500" />
              </div>
            )}

            {/* Empty */}
            {!loading && searched && totalResults === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <Search size={32} className="text-gray-700" />
                <p className="text-gray-500 text-sm">לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
                <p className="text-gray-700 text-xs">נסה מילה אחרת</p>
              </div>
            )}

            {/* No query */}
            {!searched && !loading && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <Search size={32} className="text-gray-800" />
                <p className="text-gray-600 text-sm">הקלד כדי לחפש</p>
              </div>
            )}

            {/* ── Posts results ── */}
            {!loading && searched && tab === "posts" && posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}
                className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 space-y-2 transition-colors">
                <div className="flex items-center gap-2">
                  {post.author.avatar
                    ? <img src={post.author.avatar} className="w-7 h-7 rounded-full object-cover border border-gray-700 shrink-0" />
                    : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{post.author.name[0]}</div>
                  }
                  <span className="text-xs text-gray-400">{post.author.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                    {POST_TYPE_LABELS[post.type] ?? post.type}
                  </span>
                  <span className="text-[10px] text-gray-600 me-auto">{timeAgo(post.created_at)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-100 line-clamp-1">{post.title}</p>
                {post.body && post.body !== post.title && (
                  <p className="text-xs text-gray-400 line-clamp-2">{post.body}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                  <span>👍 {post.upvotes}</span>
                  <span>👎 {post.downvotes}</span>
                </div>
              </Link>
            ))}

            {/* ── Users results ── */}
            {!loading && searched && tab === "users" && users.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
                {user.avatar_url
                  ? <img src={user.avatar_url} className="w-11 h-11 rounded-full object-cover border border-gray-700 shrink-0" />
                  : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">{user.full_name?.[0] ?? "?"}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100">{user.full_name ?? "משתמש"}</p>
                  {user.faculty && <p className="text-xs text-gray-500">{user.faculty}</p>}
                </div>
                {(user.login_streak ?? 0) >= 3 && (
                  <span className="text-xs text-orange-400">🔥 {user.login_streak}</span>
                )}
              </Link>
            ))}

          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
