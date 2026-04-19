"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  BookOpen,
  Settings,
  ChevronLeft,
  Activity,
  Eye,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { href: string; icon: React.ElementType; label: string; badge?: number }[] = [
  { href: "/admin",              icon: LayoutDashboard, label: "סקירה כללית"   },
  { href: "/admin/users",        icon: Users,           label: "משתמשים"       },
  { href: "/admin/assignments",  icon: GitBranch,       label: "שיוכים"        },
  { href: "/admin/faculties",    icon: BookOpen,        label: "קהילות ומסלולים"},
  { href: "/admin/moderation",   icon: ShieldAlert,     label: "מודרציה"       },
  { href: "/admin/settings",     icon: Settings,        label: "הגדרות"        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-gray-900 border-e border-gray-800 shrink-0">
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Eye size={15} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-[10px] text-red-400 font-medium">Super Admin Access</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800",
                )}
              >
                <item.icon size={17} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="px-4 pb-5 pt-2 border-t border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={14} />
            חזרה לאפליקציה
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-950/90 backdrop-blur border-b border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Activity size={13} className="text-green-400" />
            <span className="text-green-400 font-medium">Live</span>
            <span>·</span>
            <span>UniNexus Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
              ה
            </div>
            <span className="text-sm text-gray-300 font-medium">Super Admin</span>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
