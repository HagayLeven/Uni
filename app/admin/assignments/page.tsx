"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Loader2, Search, Users, GitBranch, Building2, RotateCcw, Zap } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  faculty: string | null;
  study_track: string | null;
  institution: string | null;
  xp_override: number | null;
}

interface Community { id: string; name: string; }

const STUDY_TRACKS = [
  "פראמדיק בסיסי",
  "פראמדיק מתקדם",
  "EMT",
  "רופא חירום",
  "נהג אמבולנס",
  "מנהל תחנה",
];

const MDA_INSTITUTIONS = [
  "מרכז הדרכה ארצי — רמלה",
  "מחוז ירושלים",
  "מחוז תל אביב",
  "מחוז חיפה",
  "מחוז צפון",
  "מחוז דרום",
  "מחוז שרון",
  "מחוז דן-פת״מ",
  "מחוז ש״י",
];

type Saving = { id: string; field: string } | null;

export default function AdminAssignmentsPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCommunity, setFilterCommunity] = useState("all");
  const [saving, setSaving] = useState<Saving>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [xpEditing, setXpEditing] = useState<string | null>(null);
  const [xpInput, setXpInput] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: comms }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url, faculty, study_track, institution, xp_override").order("full_name"),
        supabase.from("communities").select("id, name").order("name"),
      ]);
      setUsers((profiles as Profile[]) ?? []);
      setCommunities(comms ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const save = async (id: string, field: string, value: string) => {
    setSaving({ id, field });
    await supabase.from("profiles").update({ [field]: value || null }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, [field]: value || null } : u));
    setSaving(null);
    setSaved(`${id}-${field}`);
    setTimeout(() => setSaved(null), 1500);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = (u.full_name ?? "").toLowerCase().includes(q);
    const matchCommunity = filterCommunity === "all" || u.faculty === filterCommunity;
    return matchSearch && matchCommunity;
  });

  const isSaving = (id: string, field: string) => saving?.id === id && saving?.field === field;
  const isSaved  = (id: string, field: string) => saved === `${id}-${field}`;

  const resetXp = async (id: string) => {
    await supabase.from("profiles").update({ xp_override: null }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, xp_override: null } : u));
  };

  const setXpOverride = async (id: string) => {
    const val = parseInt(xpInput);
    if (isNaN(val) || val < 0) return;
    await supabase.from("profiles").update({ xp_override: val }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, xp_override: val } : u));
    setXpEditing(null);
    setXpInput("");
  };

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">ניהול שיוכים</h1>
        <p className="text-sm text-gray-500 mt-1">שיוך משתמשים לקהילות, מסלולי לימוד ותחנות מד"א</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,     label: "סה״כ משתמשים",    value: users.length,                                          color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"    },
          { icon: GitBranch, label: "משויכים לקהילה",  value: users.filter(u => u.faculty).length,                   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
          { icon: Building2, label: "ללא שיוך",         value: users.filter(u => !u.faculty).length,                  color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20"},
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <s.icon size={16} className={`${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
          <input
            placeholder="חיפוש לפי שם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg pe-8 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={filterCommunity}
          onChange={(e) => setFilterCommunity(e.target.value)}
          className="h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">כל הקהילות</option>
          {communities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          <option value="">ללא שיוך</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl skeleton-shimmer" />)}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 bg-gray-800/40">
              <tr>
                {["משתמש", "קהילה / יחידה", "מסלול לימוד", "תחנת מד\"א", "XP"].map((h) => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/20 transition-colors">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-sm font-bold shrink-0">
                          {u.full_name?.[0] ?? "?"}
                        </div>
                      )}
                      <span className="font-medium text-gray-100 truncate max-w-[140px]">
                        {u.full_name ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* Community */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        defaultValue={u.faculty ?? ""}
                        onChange={(e) => save(u.id, "faculty", e.target.value)}
                        className="h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500 max-w-[160px]"
                      >
                        <option value="">— בחר —</option>
                        {communities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      {isSaving(u.id, "faculty") && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                      {isSaved(u.id, "faculty")  && <Check size={12} className="text-green-400" />}
                    </div>
                  </td>

                  {/* Study track */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        defaultValue={u.study_track ?? ""}
                        onChange={(e) => save(u.id, "study_track", e.target.value)}
                        className="h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500 max-w-[160px]"
                      >
                        <option value="">— בחר —</option>
                        {STUDY_TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {isSaving(u.id, "study_track") && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                      {isSaved(u.id, "study_track")  && <Check size={12} className="text-green-400" />}
                    </div>
                  </td>

                  {/* Institution */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <select
                        defaultValue={u.institution ?? ""}
                        onChange={(e) => save(u.id, "institution", e.target.value)}
                        className="h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500 max-w-[160px]"
                      >
                        <option value="">— בחר —</option>
                        {MDA_INSTITUTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {isSaving(u.id, "institution") && <Loader2 size={12} className="animate-spin text-indigo-400" />}
                      {isSaved(u.id, "institution")  && <Check size={12} className="text-green-400" />}
                    </div>
                  </td>

                  {/* XP override */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      {xpEditing === u.id ? (
                        <>
                          <input
                            type="number"
                            value={xpInput}
                            onChange={(e) => setXpInput(e.target.value)}
                            placeholder="XP"
                            min={0}
                            className="h-8 w-20 bg-gray-800 border border-indigo-500/60 rounded-lg px-2 text-xs text-gray-100 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setXpOverride(u.id);
                              if (e.key === "Escape") { setXpEditing(null); setXpInput(""); }
                            }}
                          />
                          <button onClick={() => setXpOverride(u.id)}
                            className="p-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                            <Check size={11} />
                          </button>
                          <button onClick={() => { setXpEditing(null); setXpInput(""); }}
                            className="p-1 rounded-md text-gray-500 hover:text-gray-300 transition-colors">
                            <RotateCcw size={11} />
                          </button>
                        </>
                      ) : (
                        <>
                          {u.xp_override != null ? (
                            <>
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                                <Zap size={11} /> {u.xp_override}
                              </span>
                              <button onClick={() => resetXp(u.id)}
                                title="אפס XP"
                                className="p-1 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <RotateCcw size={11} />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-600">מחושב</span>
                          )}
                          <button
                            onClick={() => { setXpEditing(u.id); setXpInput(u.xp_override?.toString() ?? ""); }}
                            className="p-1 rounded-md text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="קבע XP ידני"
                          >
                            <Zap size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-600">לא נמצאו משתמשים</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
