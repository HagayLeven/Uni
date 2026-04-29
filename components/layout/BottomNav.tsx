"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookMarked, GraduationCap, Home, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CreatePostModal } from "@/components/feed/CreatePostModal";

export function BottomNav() {
  const pathname    = usePathname();
  const [createOpen, setCreateOpen] = useState(false);
  const [unread, setUnread]         = useState(0);
  const [courseId, setCourseId]     = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("course_id").eq("id", user.id).single();
      setCourseId(profile?.course_id ?? null);

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(count ?? 0);

      channel = supabase
        .channel(`notif-bottomnav-${user.id}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        }, async () => {
          const { count: c } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("read", false);
          setUnread(c ?? 0);
        })
        .subscribe();
    }

    load();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          <NavItem href="/dashboard" icon={Home} label="ראשי" active={pathname === "/dashboard"} />
          <NavItem href="/notebooks" icon={BookMarked} label="אוגדנים" active={pathname === "/notebooks"} />

          {/* Center create button */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform"
          >
            <Plus size={24} className="text-white" />
          </button>

          <NavItem
            href={courseId ? `/course/${courseId}` : "/course"}
            icon={GraduationCap}
            label="הקורס שלי"
            active={pathname.startsWith("/course")}
          />
          <NavItem href="/notifications" icon={Bell} label="התראות" active={pathname === "/notifications"} badge={unread} />
        </div>
      </nav>

      {createOpen && <CreatePostModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  badge = 0,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center gap-1 w-14 h-full"
    >
      <div className="relative">
        <Icon
          size={22}
          className={cn(
            "transition-colors",
            active ? "text-indigo-400" : "text-gray-500",
          )}
        />
        {badge > 0 && (
          <span className="absolute -top-1.5 -end-1.5 min-w-[14px] h-3.5 px-0.5 bg-indigo-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-[10px] font-medium transition-colors",
          active ? "text-indigo-400" : "text-gray-600",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
