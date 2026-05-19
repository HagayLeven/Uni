"use client";

import { Bell, Plus, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { getLevel } from "@/lib/xp";
import { XP_VALUES } from "@/lib/xp";
import Link from "next/link";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

export function TopBar() {
  const [createOpen, setCreateOpen] = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [xp, setXp]                 = useState(0);
  const [unread, setUnread]         = useState(0);
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(null);
  const [initials, setInitials]     = useState("?");
  const [userEmail, setUserEmail]   = useState("");

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsAdmin(user.email === ADMIN_EMAIL);
      setUserEmail(user.email ?? "");

      // ── Last seen ───────────────────────────────────────────────
      supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", user.id);

      // ── XP ──────────────────────────────────────────────────────
      const [{ data: profile }, { count: posts }, { count: comments }] = await Promise.all([
        supabase.from("profiles").select("xp_override, bonus_xp, avatar_url, full_name").eq("id", user.id).single(),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("is_announcement", false),
        supabase.from("comments").select("*", { count: "exact", head: true }).eq("author_id", user.id),
      ]);

      const { data: myPosts } = await supabase.from("posts").select("id").eq("author_id", user.id);
      const postIds = (myPosts ?? []).map((p: any) => p.id);
      let upvotes = 0;
      if (postIds.length) {
        const { count } = await supabase.from("votes").select("*", { count: "exact", head: true }).in("post_id", postIds).eq("value", 1);
        upvotes = count ?? 0;
      }

      const bonus = profile?.bonus_xp ?? 0;
      const calculatedXp = profile?.xp_override != null
        ? profile.xp_override
        : (posts ?? 0) * XP_VALUES.post + (comments ?? 0) * XP_VALUES.comment + upvotes * XP_VALUES.upvote + bonus;
      setXp(calculatedXp);
      setAvatarUrl((profile as any)?.avatar_url ?? null);
      const name = (profile as any)?.full_name ?? "";
      setInitials(name ? name[0] : (user.email?.[0]?.toUpperCase() ?? "?"));

      // ── Unread notifications ─────────────────────────────────────
      const { count: unreadCount } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(unreadCount ?? 0);

      // ── Realtime subscription ────────────────────────────────────
      channel = supabase
        .channel(`notif-topbar-${user.id}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, async () => {
          const { count } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("read", false);
          setUnread(count ?? 0);
        })
        .subscribe();
    }

    load();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const level = getLevel(xp);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 glass border-b border-white/5" dir="rtl">

        {/* Search — navigates to search page */}
        <Link href="/search" className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
          <div className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg pe-9 ps-4 text-sm text-gray-500 flex items-center cursor-pointer hover:border-indigo-500 transition-colors">
            חיפוש...
          </div>
        </Link>

        {/* XP bar — hidden on small screens */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-xl shrink-0">
          <Zap size={13} className="text-yellow-400 shrink-0" />
          <div className="flex flex-col gap-0.5 min-w-[80px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">רמה {level.level} · {level.name}</span>
              <span className="text-[10px] text-yellow-400 font-semibold">{xp} XP</span>
            </div>
            <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${level.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* New post button — admin only */}
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 h-9 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shrink-0">
            <Plus size={15} />
            <span className="hidden md:inline">פרסום חדש</span>
          </button>
        )}

        {/* Notifications bell — links to /notifications page */}
        <Link href="/notifications"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors shrink-0">
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </header>

      {createOpen && <CreatePostModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
