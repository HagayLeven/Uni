"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Save, X } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  faculty: string | null;
  role?: string | null;
  permissions?: Record<string, boolean> | null;
  created_at: string;
  email?: string;
}

const COMMUNITIES = [
  "אדמיניסטרציה",
  "קהילת פראמדיקים",
  "קהילת חובשים",
  "קהילת כוננים",
];

const ROLES = [
  "root",
  "מנהל מערכת",
  "מדריך ראשי",
  "מדריך",
  "סטודנט",
];

const ROLE_PERMISSIONS: Record<string, { key: string; label: string; description: string }[]> = {
  "מדריך ראשי": [
    { key: "manage_scenarios", label: "ניהול תרחישים", description: "הוספה/עריכה/מחיקה של תרחישי סימולטור" },
    { key: "view_all_archives", label: "צפייה בארכיון כולל", description: "גישה לכל ארכיוני הבחינות של כל הסטודנטים" },
    { key: "manage_courses", label: "ניהול קורסים", description: "עריכת שבועות ותכני קורסים" },
    { key: "manage_attendance", label: "ניהול נוכחות", description: "רישום ועריכת נוכחות" },
    { key: "view_analytics", label: "אנליטיקס", description: "גישה לדשבורד ונתוני ביצועים" },
    { key: "manage_exams", label: "ניהול מבחנים", description: "יצירה ועריכה של מבחנים" },
    { key: "export_data", label: "ייצוא נתונים", description: "ייצוא נתוני ארכיון וציונים" },
    { key: "graduation_exam", label: "גישה לבחינת בגרות", description: "הרשאה לניהול בחינת הבגרות 20/05" },
  ],
  "מדריך": [
    { key: "manage_attendance", label: "ניהול נוכחות", description: "רישום ועריכת נוכחות" },
    { key: "view_analytics", label: "אנליטיקס", description: "גישה לדשבורד ונתוני ביצועים" },
    { key: "graduation_exam", label: "גישה לבחינת בגרות", description: "הרשאה לניהול בחינת הבגרות 20/05" },
  ],
};

function roleBadge(role: string | null) {
  const map: Record<string, string> = {
    root: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    "מנהל מערכת": "bg-red-500/20 text-red-400 border-red-500/40",
    "מדריך ראשי": "bg-purple-500/20 text-purple-400 border-purple-500/40",
    "מדריך": "bg-blue-500/20 text-blue-400 border-blue-500/40",
    "סטודנט": "bg-gray-700 text-gray-400 border-gray-600",
  };
  const cls = map[role ?? ""] ?? "bg-gray-700 text-gray-500 border-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {role || "ללא תפקיד"}
    </span>
  );
}

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
  const [editingRole, setEditingRole] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [permissionsOpen, setPermissionsOpen] = useState<string | null>(null);
  const [permEdits, setPermEdits] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, faculty, role, permissions, created_at")
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

  // Single save — uses service-role API route to bypass RLS
  const saveUser = async (id: string) => {
    const updates: Record<string, string | null> = {};
    if (editing[id] !== undefined) updates.faculty = editing[id] || null;
    if (editingRole[id] !== undefined) updates.role = editingRole[id] || null;
    if (!Object.keys(updates).length) return;
    setSaving(id);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/update-profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ userId: id, updates }),
    });

    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...updates } : u));
      setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setEditingRole((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
    setSaving(null);
  };

  const savePermissions = async (u: Profile) => {
    const merged = { ...(u.permissions ?? {}), ...(permEdits[u.id] ?? {}) };
    setSaving(u.id + "_perm");

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/update-profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ userId: u.id, updates: { permissions: merged } }),
    });

    if (res.ok) {
      setUsers((prev) => prev.map((p) => p.id === u.id ? { ...p, permissions: merged } : p));
      setPermEdits((prev) => { const n = { ...prev }; delete n[u.id]; return n; });
      setPermissionsOpen(null);
    }
    setSaving(null);
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-gray-800 bg-gray-800/40">
              <tr>
                <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-48">משתמש</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-44">קהילה</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-52">תפקיד</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">הצטרף</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">הרשאות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((u) => {
                const currentFaculty = editing[u.id] ?? u.faculty ?? "";
                const isDirty = editing[u.id] !== undefined && editing[u.id] !== u.faculty;
                const isRoot = u.role === "root";
                const effectiveRole = editingRole[u.id] ?? u.role ?? "";
                const roleHasPerms = effectiveRole === "מדריך ראשי" || effectiveRole === "מדריך";
                const isPermOpen = permissionsOpen === u.id;
                const permList = ROLE_PERMISSIONS[effectiveRole] ?? [];

                return (
                  <>
                    <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-sm font-bold shrink-0">
                              {u.full_name?.[0] ?? "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-100 flex items-center gap-1">
                              {isRoot && <span title="root">👑</span>}
                              {u.full_name ?? "—"}
                            </p>
                            <p className="text-[10px] text-gray-600 font-mono">{u.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>

                      {/* Faculty */}
                      <td className="px-4 py-3">
                        <select
                          value={currentFaculty}
                          onChange={(e) => handleFacultyChange(u.id, e.target.value)}
                          className="h-8 w-full bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">— בחר —</option>
                          {COMMUNITIES.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isRoot ? roleBadge("root") : (
                            <select
                              value={effectiveRole}
                              onChange={(e) => setEditingRole((prev) => ({ ...prev, [u.id]: e.target.value }))}
                              className="h-8 flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">— ללא תפקיד —</option>
                              {ROLES.filter((r) => r !== "root").map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          )}
                          {/* Single save button — appears when either field changed */}
                          {!isRoot && (isDirty || (editingRole[u.id] !== undefined && editingRole[u.id] !== (u.role ?? ""))) && (
                            <button
                              onClick={() => saveUser(u.id)}
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

                      {/* Actions / Permissions */}
                      <td className="px-4 py-3">
                        {roleHasPerms && (
                          <button
                            onClick={() => setPermissionsOpen(isPermOpen ? null : u.id)}
                            className="px-2 py-1 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                          >
                            ⚙ הרשאות
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Permissions panel row */}
                    {isPermOpen && (
                      <tr key={u.id + "_perms"}>
                        <td colSpan={5} className="px-4 pb-4 pt-0 bg-gray-800/20">
                          <div className="border border-gray-700 rounded-xl p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-white">
                                הרשאות — {u.full_name}
                                <span className="mr-2">{roleBadge(effectiveRole)}</span>
                              </h3>
                              <button
                                onClick={() => setPermissionsOpen(null)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            {/* Permission toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {permList.map((perm) => {
                                const val = permEdits[u.id]?.[perm.key] ?? u.permissions?.[perm.key] ?? false;
                                return (
                                  <label
                                    key={perm.key}
                                    className="flex items-start gap-3 cursor-pointer group"
                                  >
                                    {/* Toggle */}
                                    <div
                                      onClick={() =>
                                        setPermEdits((prev) => ({
                                          ...prev,
                                          [u.id]: { ...(prev[u.id] ?? {}), [perm.key]: !val },
                                        }))
                                      }
                                      className={`relative mt-0.5 w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
                                        val ? "bg-indigo-600" : "bg-gray-700"
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                                          val ? "right-0.5" : "left-0.5"
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-200">{perm.label}</p>
                                      <p className="text-xs text-gray-500">{perm.description}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>

                            {/* Save button */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => savePermissions(u)}
                                disabled={saving === u.id + "_perm"}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                              >
                                {saving === u.id + "_perm"
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <Save size={14} />}
                                שמור הרשאות
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
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
