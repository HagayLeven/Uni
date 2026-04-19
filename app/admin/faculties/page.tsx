"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, ChevronDown, ChevronUp, Check, Loader2,
  Plus, Search, Shield, Trash2, Users, X,
  GraduationCap, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Community { id: string; name: string; }
type ModPermissions = { filter: boolean; edit: boolean; add: boolean };

interface Moderator {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  permissions: ModPermissions;
}
interface ProfileResult { id: string; full_name: string; avatar_url: string | null; }

const FALLBACK_TRACKS = [
  "פראמדיק בסיסי", "פראמדיק מתקדם", "EMT",
  "רופא חירום", "נהג אמבולנס", "מנהל תחנה",
];
const FALLBACK_INSTITUTIONS = [
  "מרכז הדרכה ארצי — רמלה", "מחוז ירושלים", "מחוז תל אביב",
  "מחוז חיפה", "מחוז צפון", "מחוז דרום",
  "מחוז שרון", "מחוז דן-פת\"מ", "מחוז ש\"י",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function loadSetting(key: string, fallback: string[]): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (data?.value && Array.isArray(data.value)) return data.value as string[];
  } catch {}
  return fallback;
}

async function saveSetting(key: string, value: string[]) {
  await supabase
    .from("app_settings")
    .upsert({ key, value }, { onConflict: "key" });
}

// ─── SettingsListEditor ────────────────────────────────────────────────────────
// Reusable CRUD list for study_tracks and institutions

function SettingsListEditor({
  title, icon: Icon, settingKey, fallback, color,
}: {
  title: string;
  icon: any;
  settingKey: string;
  fallback: string[];
  color: string;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSetting(settingKey, fallback).then((v) => { setItems(v); setLoading(false); });
  }, [settingKey]);

  const addItem = async () => {
    const val = newItem.trim();
    if (!val || items.includes(val)) return;
    setSaving(true);
    const next = [...items, val];
    await saveSetting(settingKey, next);
    setItems(next);
    setNewItem("");
    setAdding(false);
    setSaving(false);
  };

  const removeItem = async (item: string) => {
    const next = items.filter((i) => i !== item);
    await saveSetting(settingKey, next);
    setItems(next);
    setConfirmDel(null);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className={color} />
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <button
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors"
        >
          <Plus size={12} /> הוסף
        </button>
      </div>

      {adding && (
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") { setAdding(false); setNewItem(""); } }}
            placeholder={`שם ${title === "מסלולי לימוד" ? "המסלול" : "התחנה"}...`}
            className="flex-1 h-9 bg-gray-800 border border-indigo-500/60 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
          <button onClick={addItem} disabled={saving || !newItem.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin text-white" /> : <Check size={14} className="text-white" />}
          </button>
          <button onClick={() => { setAdding(false); setNewItem(""); }}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 rounded-xl skeleton-shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item} className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700">
              <div className={cn("w-2 h-2 rounded-full shrink-0", color.replace("text-", "bg-"))} />
              <span className="flex-1 text-xs text-gray-200 truncate">{item}</span>
              {confirmDel === item ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => removeItem(item)} className="text-red-400 hover:text-red-300 text-[10px] font-bold">מחק</button>
                  <button onClick={() => setConfirmDel(null)} className="text-gray-500 hover:text-gray-300 text-[10px]">לא</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDel(item)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ModeratorsPanel ───────────────────────────────────────────────────────────

function ModeratorsPanel({ communityId }: { communityId: string }) {
  const [mods, setMods] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadMods();
  }, [communityId]);

  async function loadMods() {
    setLoading(true);
    const { data } = await supabase
      .from("moderators")
      .select("id, user_id, profiles(full_name, avatar_url)")
      .eq("community_id", communityId);

    setMods(
      (data ?? []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        full_name: m.profiles?.full_name ?? "משתמש",
        avatar_url: m.profiles?.avatar_url ?? null,
        permissions: m.permissions ?? { filter: true, edit: false, add: false },
      }))
    );
    setLoading(false);
  }

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .ilike("full_name", `%${search.trim()}%`)
      .limit(6);
    setResults((data ?? []).filter((p: any) => !mods.some((m) => m.user_id === p.id)));
    setSearching(false);
  };

  const addMod = async (profile: ProfileResult) => {
    const { data, error } = await supabase
      .from("moderators")
      .insert({ community_id: communityId, user_id: profile.id })
      .select("id")
      .single();
    if (!error && data) {
      setMods((prev) => [...prev, {
        id: data.id,
        user_id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        permissions: { filter: true, edit: false, add: false },
      }]);
      setResults((prev) => prev.filter((p) => p.id !== profile.id));
      setSearch("");
    }
  };

  const removeMod = async (mod: Moderator) => {
    await supabase.from("moderators").delete().eq("id", mod.id);
    setMods((prev) => prev.filter((m) => m.id !== mod.id));
  };

  const togglePermission = async (mod: Moderator, key: keyof ModPermissions) => {
    const next = { ...mod.permissions, [key]: !mod.permissions[key] };
    await supabase.from("moderators").update({ permissions: next }).eq("id", mod.id);
    setMods((prev) => prev.map((m) => m.id === mod.id ? { ...m, permissions: next } : m));
  };

  const PERM_LABELS: { key: keyof ModPermissions; label: string; color: string }[] = [
    { key: "filter", label: "סינון",  color: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30" },
    { key: "edit",   label: "עריכה",  color: "bg-blue-600/20 text-blue-400 border-blue-600/30"       },
    { key: "add",    label: "הוספה",  color: "bg-green-600/20 text-green-400 border-green-600/30"    },
  ];

  return (
    <div className="space-y-3">
      {/* Current mods */}
      {loading ? (
        <div className="flex gap-2">{[1,2].map(i => <div key={i} className="h-8 w-28 rounded-xl skeleton-shimmer" />)}</div>
      ) : mods.length === 0 ? (
        <p className="text-xs text-gray-600">אין מודרטורים בקהילה זו עדיין</p>
      ) : (
        <div className="space-y-2">
          {mods.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl">
              {m.avatar_url
                ? <img src={m.avatar_url} className="w-7 h-7 rounded-full object-cover shrink-0" />
                : <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {m.full_name[0]}
                  </div>
              }
              <span className="text-xs font-medium text-gray-200 flex-1 truncate">{m.full_name}</span>
              {/* Permission toggles */}
              <div className="flex gap-1">
                {PERM_LABELS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => togglePermission(m, p.key)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all",
                      m.permissions[p.key]
                        ? p.color
                        : "bg-gray-700/50 text-gray-600 border-gray-700"
                    )}
                    title={m.permissions[p.key] ? `הסר הרשאת ${p.label}` : `הוסף הרשאת ${p.label}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button onClick={() => removeMod(m)} className="text-gray-600 hover:text-red-400 transition-colors ms-1">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search to add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="חפש משתמש להוספה..."
            className="w-full h-8 bg-gray-800 border border-gray-700 rounded-xl pe-8 ps-3 text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button onClick={handleSearch} disabled={searching}
          className="h-8 px-3 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs transition-colors">
          {searching ? <Loader2 size={12} className="animate-spin" /> : "חפש"}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((p) => (
            <li key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {p.full_name[0]}
              </div>
              <span className="flex-1 text-xs text-gray-300">{p.full_name}</span>
              <button onClick={() => addMod(p)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Shield size={11} /> מנה מודרטור
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminFacultiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => { loadCommunities(); }, []);

  async function loadCommunities() {
    setLoading(true);
    const [{ data: comms }, { data: profiles }] = await Promise.all([
      supabase.from("communities").select("id, name").order("name"),
      supabase.from("profiles").select("faculty"),
    ]);
    const counts: Record<string, number> = {};
    (profiles ?? []).forEach((p: any) => {
      if (p.faculty) counts[p.faculty] = (counts[p.faculty] ?? 0) + 1;
    });
    setCommunities(comms ?? []);
    setMemberCounts(counts);
    setLoading(false);
  }

  const addCommunity = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    const { data, error } = await supabase.from("communities").insert({ name }).select("id, name").single();
    if (!error && data) setCommunities((prev) => [...prev, data]);
    setNewName(""); setAdding(false); setSaving(false);
  };

  const deleteCommunity = async (id: string, name: string) => {
    if (!confirm(`למחוק את הקהילה "${name}"?`)) return;
    await supabase.from("communities").delete().eq("id", id);
    setCommunities((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ניהול קהילות ומסלולים</h1>
          <p className="text-sm text-gray-500 mt-1">קהילות, מודרטורים, מסלולי לימוד ותחנות</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={15} /> קהילה חדשה
        </button>
      </div>

      {/* Add community form */}
      {adding && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCommunity(); if (e.key === "Escape") setAdding(false); }}
            placeholder="שם הקהילה (למשל: מחוז ירושלים, יחידת גפ״ן...)"
            className="flex-1 h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500" />
          <button onClick={addCommunity} disabled={saving || !newName.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={16} className="animate-spin text-white" /> : <Check size={16} className="text-white" />}
          </button>
          <button onClick={() => { setAdding(false); setNewName(""); }}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Communities list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton-shimmer" />)}
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">אין קהילות עדיין.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {communities.map((c) => {
            const isOpen = expanded === c.id;
            const count = memberCounts[c.name] ?? 0;
            return (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-gray-800/30 transition-colors text-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100">{c.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users size={10} /> {count} חברים
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); deleteCommunity(c.id, c.name); }}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-800 p-5 bg-gray-800/20 space-y-5">
                    {/* Moderators — F7 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={13} className="text-indigo-400" />
                        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">מודרטורים</p>
                      </div>
                      <ModeratorsPanel communityId={c.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Study Tracks CRUD — F8 */}
      <SettingsListEditor
        title="מסלולי לימוד"
        icon={GraduationCap}
        settingKey="study_tracks"
        fallback={FALLBACK_TRACKS}
        color="text-indigo-400"
      />

      {/* Institutions CRUD — F8 */}
      <SettingsListEditor
        title="תחנות מד״א"
        icon={Building2}
        settingKey="institutions"
        fallback={FALLBACK_INSTITUTIONS}
        color="text-teal-400"
      />
    </div>
  );
}
