"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Home, Search, Sparkles, Trophy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CreatePostModal } from "@/components/feed/CreatePostModal";

const NAV_ITEMS = [
  { href: "/dashboard",  icon: Home,      label: "ראשי"   },
  { href: "/leaderboard",icon: Trophy,    label: "דירוג"  },
  { href: "/games",      icon: Gamepad2,  label: "משחקים" },
  { href: "/tutor",      icon: Sparkles,  label: "AI"      },
];

export function BottomNav() {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {/* First 2 items */}
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          {/* Center create button */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform"
          >
            <Plus size={24} className="text-white" />
          </button>

          {/* Last 2 items */}
          {NAV_ITEMS.slice(2).map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}
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
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 w-14 h-full"
    >
      <Icon
        size={22}
        className={cn(
          "transition-colors",
          active ? "text-indigo-400" : "text-gray-500",
        )}
      />
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
