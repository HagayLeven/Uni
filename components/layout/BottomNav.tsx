"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, GraduationCap, Home, Plus, Stethoscope, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { canAccessSimulator } from "@/lib/simulatorAccess";

export function BottomNav() {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [canSimulator, setCanSimulator] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("course_id, role, faculty, avatar_url")
        .eq("id", user.id)
        .single();

      setCourseId(profile?.course_id ?? null);
      setCanSimulator(canAccessSimulator((profile as any)?.role, (profile as any)?.faculty, user.email));
      setAvatarUrl((profile as any)?.avatar_url ?? null);

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(count ?? 0);

      channel = supabase
        .channel(`notif-bottomnav-${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          async () => {
            const { count: c } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false);
            setUnread(c ?? 0);
          })
        .subscribe();
    }
    load();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // Smart items — always: Home, Course, [+], Notifications, Menu
  // + Simulator if accessible (replaces course slot or adds to right of +)
  const items = [
    { href: "/dashboard", icon: Home, label: "ראשי" },
    { href: courseId ? `/course/${courseId}` : "/course", icon: GraduationCap, label: "הקורס" },
    null, // center + button
    ...(canSimulator ? [{ href: "/simulator", icon: Stethoscope, label: "סימולטור" }] : []),
    { href: "/notifications", icon: Bell, label: "התראות", badge: unread },
  ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900/96 backdrop-blur-xl border-t border-gray-800/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-[62px] px-1">

          {/* Home */}
          <NavItem href="/dashboard" icon={Home} label="ראשי" active={pathname === "/dashboard"} />

          {/* Course */}
          <NavItem
            href={courseId ? `/course/${courseId}` : "/course"}
            icon={GraduationCap}
            label="הקורס"
            active={pathname.startsWith("/course")}
          />

          {/* Center create button */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setCreateOpen(true)}
              className="w-12 h-12 -mt-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform flex items-center justify-center"
            >
              <Plus size={22} className="text-white" />
            </button>
          </div>

          {/* Simulator (if access) */}
          {canSimulator && (
            <NavItem href="/simulator" icon={Stethoscope} label="סימולטור" active={pathname.startsWith("/simulator")} />
          )}

          {/* Notifications */}
          <NavItem href="/notifications" icon={Bell} label="התראות" active={pathname === "/notifications"} badge={unread} />

          {/* Menu — opens full sidebar drawer */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("mobile-sidebar-toggle"))}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-[52px] active:bg-gray-800/50 transition-colors rounded-lg mx-0.5"
          >
            {/* Avatar or menu icon */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-gray-700" />
            ) : (
              <Menu size={22} className="text-gray-500" />
            )}
            <span className="text-[10px] font-medium text-gray-500">תפריט</span>
          </button>
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
      className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-[52px] active:bg-gray-800/50 transition-colors rounded-lg mx-0.5"
    >
      <div className="relative">
        <Icon size={22} className={cn("transition-colors", active ? "text-indigo-400" : "text-gray-500")} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -end-1.5 min-w-[14px] h-3.5 px-0.5 bg-indigo-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className={cn("text-[10px] font-medium transition-colors", active ? "text-indigo-400" : "text-gray-600")}>
        {label}
      </span>
    </Link>
  );
}
