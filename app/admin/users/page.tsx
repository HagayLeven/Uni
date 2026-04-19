"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Save, Trash2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  faculty: string | null;
  created_at: string;
  email?: string;
}

const FACULTIES = [
  "פראמדיקים", "מדעי המחשב", "הנדסת חשמל", "רפואה",
  "משפטים", "מנהל עסקים", "פסיכולוגיה", "כלכלה",
  "ביולוגיה", "מתמטיקה", "הנדסה אזרחית",
];

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "היום";
  if (days === 1) return "אתמול";
  return `לפני ${days} ימים`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, faculty, created_at")
        .order("created_at", { ascending: false });
      setUsers((data as Profile[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.faculty ?? "").toLowerCase().includes(q)
    );
  });

  const handleFacultyChange = (id: string, val: string) => {
    setEditing((prev) => ({ ...prev, [id]: val }));
  };

  const saveFaculty = async (id: string) => {
    const faculty = editing[id];
    if (!faculty) return;
    setSaving(id);
    await supabase.from("profiles").update({ faculty }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, faculty } : u));
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setSaving(null);
  };

  const deleteUserPosts = async (id: string) => {
    if (!confirm("מחק את כל הפוסטים של משתמש זה?")) return;
    await supabase.from("posts").delete().eq("author_id", id);
  };

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ניהול משתמשים</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} משתמשים רשומים</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
        <input
          placeholder="חיפוש לפי שם או פקולטה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg pe-8 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 bg-gray-800/40">
              <tr>
                {["משתמש", "פקולטה / קהילה", "הצטרף", "פעולות"].map((h) => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((u) => {
                const currentFaculty = editing[u.id] ?? u.faculty ?? "";
                const isDirty = editing[u.id] !== undefined && editing[u.id] !== u.faculty;
                return (
                  <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
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
                        <div>
                          <p className="font-medium text-gray-100">{u.full_name ?? "—"}</p>
                          <p className="text-[10px] text-gray-600 font-mono">{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>

                    {/* Faculty */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={currentFaculty}
                          onChange={(e) => handleFacultyChange(u.id, e.target.value)}
                          className="h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">— בחר —</option>
                          {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                        {isDirty && (
                          <button
                            onClick={() => saveFaculty(u.id)}
                            disabled={saving === u.id}
                            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                          >
                            {saving === u.id
                              ? <Loader2 size={12} className="animate-spin text-white" />
                              : <Save size={12} className="text-white" />}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {timeAgo(u.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUserPosts(u.id)}
                        title="מחק את כל הפוסטים של המשתמש"
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-600">לא נמצאו משתמשים</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
