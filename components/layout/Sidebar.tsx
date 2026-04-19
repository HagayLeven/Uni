"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, ChevronDown, ChevronLeft, Gamepad2, Home, MessageSquare,
  Plus, Settings, Shield, Sparkles, Trophy, Users, User, Rss, X, Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

const NAV_ITEMS = [
  { icon: Home,          label: "ראשי",       href: "/dashboard"   },
  { icon: Rss,           label: "פיד קהילה",  href: "/feed"        },
  { icon: Sparkles,      label: "מדריך AI",    href: "/tutor"       },
  { icon: Trophy,        label: "לוח הישגים", href: "/leaderboard" },
  { icon: Gamepad2,      label: "משחקים",     href: "/games"       },
  { icon: MessageSquare, label: "הודעות",      href: "/messages", badge: 0 },
  { icon: User,          label: "פרופיל",      href: "/profile"     },
  { icon: Settings,      label: "הגדרות",      href: "/settings"    },
];

interface Channel { id: string; title: string; }

export function Sidebar() {
  const pathname = usePathname();

  // ── User state ──────────────────────────────────────────────
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [faculty, setFaculty] = useState("פראמדיקים");
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Channels (topics) ───────────────────────────────────────
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  // ── Add channel form ─────────────────────────────────────────
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load user & channels ─────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsAdmin(user.email === ADMIN_EMAIL);
      setUserEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, faculty")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
        if (profile.faculty) setFaculty(profile.faculty);
      }
    }

    async function loadChannels() {
      const { data } = await supabase
        .from("topics")
        .select("id, title")
        .order("created_at", { ascending: true });
      if (data) setChannels(data);
    }

    load();
    loadChannels();
  }, []);

  // ── Add channel ───────────────────────────────────────────────
  useEffect(() => {
    if (adding) setTimeout(() => inputRef.current?.focus(), 50);
  }, [adding]);

  const handleAddChannel = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);

    // Match community by user's faculty name
    const { data: community } = await supabase
      .from("communities")
      .select("id")
      .eq("name", faculty)
      .maybeSingle();

    // Fallback: first community in DB
    const { data: fallback } = !community
      ? await supabase.from("communities").select("id").limit(1).maybeSingle()
      : { data: null };

    const communityId = community?.id ?? fallback?.id ?? null;

    const { data, error } = await supabase
      .from("topics")
      .insert({ title: name, ...(communityId ? { community_id: communityId } : {}) })
      .select("id, title")
      .single();

    if (!error && data) {
      setChannels((prev) => [...prev, data]);
      setActiveChannel(data.id);
    } else if (error) {
      console.error("Channel insert error:", error.message);
    }
    setNewName("");
    setAdding(false);
    setSaving(false);
  };

  const handleDeleteChannel = async (id: string) => {
    await supabase.from("topics").delete().eq("id", id);
    setChannels((prev) => prev.filter((c) => c.id !== id));
    if (activeChannel === id) setActiveChannel(null);
  };

  const initials = userName ? userName[0] : "?";

  return (
    <aside className="flex flex-col w-[272px] h-full glass-sidebar border-e border-white/5 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
          isAdmin
            ? "bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-red-600/30"
            : "bg-indigo-600"
        )}>
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-base leading-none">UniNexus</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-gray-500">{faculty}</p>
            {isAdmin && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white leading-none animate-pulse">
                ADMIN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-600/20"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              )}>
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        {/* Channels */}
        <div className="pt-4">
          <div className="flex items-center gap-1 px-3 py-2">
            <button onClick={() => setChannelsOpen(v => !v)}
              className="flex items-center gap-2 flex-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors">
              <Users size={12} />
              <span className="flex-1 text-start">ערוצים</span>
              {channelsOpen ? <ChevronDown size={12} /> : <ChevronLeft size={12} />}
            </button>
            {isAdmin && (
              <button onClick={() => setAdding(v => !v)}
                className="p-1 rounded-md text-gray-600 hover:text-indigo-400 hover:bg-gray-800 transition-colors">
                <Plus size={13} />
              </button>
            )}
          </div>

          {/* Add channel input */}
          {adding && isAdmin && (
            <div className="mx-2 mb-2 flex items-center gap-1.5">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddChannel(); if (e.key === "Escape") setAdding(false); }}
                placeholder="שם הערוץ"
                className="flex-1 h-8 bg-gray-800 border border-indigo-500/60 rounded-lg px-3 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none"
              />
              <button onClick={handleAddChannel} disabled={saving || !newName.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                <Check size={12} className="text-white" />
              </button>
              <button onClick={() => { setAdding(false); setNewName(""); }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
                <X size={12} />
              </button>
            </div>
          )}

          {channelsOpen && (
            <ul className="mt-1 space-y-0.5">
              {channels.length === 0 && !adding && (
                <li className="px-3 py-2 text-xs text-gray-600">
                  {isAdmin ? 'לחץ + להוסיף ערוץ' : 'אין ערוצים עדיין'}
                </li>
              )}
              {channels.map(ch => (
                <li key={ch.id} className="group">
                  <button onClick={() => setActiveChannel(ch.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-start",
                      activeChannel === ch.id
                        ? "bg-indigo-600/20 text-indigo-300"
                        : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    )}>
                    <span className="text-gray-600 text-xs font-mono">#</span>
                    <span className="flex-1 text-xs font-medium truncate">{ch.title}</span>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteChannel(ch.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-red-400 transition-all">
                        <X size={11} />
                      </button>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Admin button */}
      {isAdmin && (
        <div className="px-3 pb-2">
          <Link href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors">
            <Shield size={14} />
            ניהול מערכת
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar"
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-700" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-100 truncate">{userName || userEmail}</p>
              {isAdmin && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white leading-none shrink-0">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{faculty}</p>
          </div>
          <Link href="/settings" className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors">
            <Settings size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
