"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Bell, Check, MessageCircle, ThumbsUp, Megaphone, Reply } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  type: "upvote" | "comment" | "reply" | "announcement";
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק'`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש'`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

const TYPE_META = {
  upvote:       { icon: ThumbsUp,   color: "text-green-400",  bg: "bg-green-500/10"  },
  comment:      { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10"   },
  reply:        { icon: Reply,       color: "text-indigo-400", bg: "bg-indigo-500/10" },
  announcement: { icon: Megaphone,   color: "text-yellow-400", bg: "bg-yellow-500/10" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("read", false);
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-indigo-400" />
                <h1 className="text-lg font-bold text-white">התראות</h1>
                {unread > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">{unread}</span>
                )}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  <Check size={12} /> סמן הכל כנקרא
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && notifs.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20">
                <Bell size={36} className="text-gray-700" />
                <p className="text-gray-500 text-sm">אין התראות עדיין</p>
              </div>
            )}

            {/* List */}
            {!loading && notifs.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.announcement;
              const Icon = meta.icon;
              const content = (
                <div onClick={() => markRead(n.id)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer",
                    n.read
                      ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                      : "bg-gray-900 border-indigo-500/30 hover:border-indigo-500/50"
                  )}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", meta.bg)}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-snug", n.read ? "text-gray-300" : "text-white font-medium")}>
                      {n.title}
                    </p>
                    {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.body}</p>}
                    <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
                </div>
              );

              return n.link
                ? <Link key={n.id} href={n.link}>{content}</Link>
                : <div key={n.id}>{content}</div>;
            })}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
