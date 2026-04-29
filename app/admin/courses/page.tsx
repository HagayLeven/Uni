"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, Check, Copy, Loader2, Plus, Trash2, Users, X, UserCheck, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  description: string | null;
  code: string;
  active: boolean;
  created_at: string;
  member_count?: number;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  course_id: string | null;
}

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function CoursesAdmin() {
  const [courses, setCourses]     = useState<Course[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);
  const [selected, setSelected]   = useState<Course | null>(null);
  const [members, setMembers]     = useState<Member[]>([]);
  const [allUsers, setAllUsers]   = useState<Profile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", code: randomCode() });

  const load = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*, course_members(count)")
      .order("created_at", { ascending: false });

    setCourses((data ?? []).map((c: any) => ({
      ...c,
      member_count: c.course_members?.[0]?.count ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("courses")
      .insert({ name: form.name.trim(), description: form.description.trim() || null, code: form.code, created_by: user?.id })
      .select()
      .single();
    if (data) setCourses((prev) => [{ ...data, member_count: 0 }, ...prev]);
    setForm({ name: "", description: "", code: randomCode() });
    setCreating(false);
    setSaving(false);
  };

  const loadMembers = async (course: Course) => {
    setSelected(course);
    setLoadingMembers(true);
    const [{ data: mData }, { data: uData }] = await Promise.all([
      supabase.from("course_members").select("*, profiles(full_name, avatar_url)").eq("course_id", course.id),
      supabase.from("profiles").select("id, full_name, avatar_url, course_id"),
    ]);
    setMembers((mData as any) ?? []);
    setAllUsers((uData as any) ?? []);
    setLoadingMembers(false);
  };

  const assignUser = async (userId: string) => {
    const { data } = await supabase
      .from("course_members")
      .insert({ course_id: selected!.id, user_id: userId, role: "student" })
      .select("*, profiles(full_name, avatar_url)")
      .single();
    // Update profile course_id
    await supabase.from("profiles").update({ course_id: selected!.id }).eq("id", userId);
    if (data) setMembers((prev) => [...prev, data as any]);
  };

  const removeUser = async (memberId: string, userId: string) => {
    await supabase.from("course_members").delete().eq("id", memberId);
    await supabase.from("profiles").update({ course_id: null }).eq("id", userId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const toggleActive = async (course: Course) => {
    await supabase.from("courses").update({ active: !course.active }).eq("id", course.id);
    setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, active: !c.active } : c));
    if (selected?.id === course.id) setSelected((s) => s ? { ...s, active: !s.active } : s);
  };

  const deleteCourse = async (id: string) => {
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const memberIds = new Set(members.map((m) => m.user_id));
  const unassigned = allUsers.filter((u) => !memberIds.has(u.id));

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">ניהול קורסים</h1>
          <p className="text-sm text-gray-500 mt-0.5">יצירת קורסים ושיוך חניכים</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={15} /> קורס חדש
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* ── Course list ── */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-indigo-500" /></div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <BookOpen size={32} className="text-gray-700" />
              <p className="text-gray-500 text-sm">אין קורסים עדיין</p>
            </div>
          ) : courses.map((c) => (
            <div key={c.id}
              onClick={() => loadMembers(c)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-colors space-y-2",
                selected?.id === c.id
                  ? "bg-indigo-600/10 border-indigo-500/40"
                  : "bg-gray-900 border-gray-800 hover:border-gray-700"
              )}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      c.active ? "bg-green-500/10 text-green-400" : "bg-gray-700 text-gray-500")}>
                      {c.active ? "פעיל" : "סגור"}
                    </span>
                  </div>
                  {c.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); toggleActive(c); }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-gray-800 transition-colors" title="הפעל/כבה">
                    <RefreshCw size={13} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteCourse(c.id); }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors" title="מחק">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={11} />
                  <span>{c.member_count} חניכים</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); copyCode(c.code); }}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg border transition-colors",
                    copied === c.code
                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : "border-gray-700 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/40"
                  )}>
                  {copied === c.code ? <Check size={11} /> : <Copy size={11} />}
                  {copied === c.code ? "הועתק!" : `קוד: ${c.code}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Members panel ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
              <UserCheck size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">בחר קורס כדי לנהל חניכים</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{selected.name}</p>
                <span className="text-xs text-gray-500">{members.length} חניכים</span>
              </div>

              {loadingMembers ? (
                <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-indigo-500" /></div>
              ) : (
                <div className="divide-y divide-gray-800/50 max-h-[420px] overflow-y-auto">

                  {/* Current members */}
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.profiles?.full_name?.[0] ?? "?"}
                      </div>
                      <p className="flex-1 text-sm text-gray-200 truncate">{m.profiles?.full_name ?? "משתמש"}</p>
                      <span className="text-[10px] text-gray-600">{m.role === "instructor" ? "מדריך" : "חניך"}</span>
                      <button onClick={() => removeUser(m.id, m.user_id)}
                        className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Unassigned users to add */}
                  {unassigned.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-800/30">
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">הוסף חניכים</p>
                      </div>
                      {unassigned.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/30 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.full_name?.[0] ?? "?"}
                          </div>
                          <p className="flex-1 text-sm text-gray-400 truncate">{u.full_name ?? "משתמש"}</p>
                          <button onClick={() => assignUser(u.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs rounded-lg transition-colors">
                            <Plus size={11} /> הוסף
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
              <BookOpen size={17} className="text-indigo-400" />
              <h2 className="text-base font-bold text-white flex-1">קורס חדש</h2>
              <button onClick={() => setCreating(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-5 py-4 space-y-4">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="שם הקורס (לדוג׳: קורס חובשים שב״ס 2026)" required autoFocus
                className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="תיאור קצר (אופציונלי)" rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">קוד הצטרפות</label>
                  <div className="flex items-center gap-2 h-10 bg-gray-800 border border-gray-700 rounded-xl px-4">
                    <span className="text-sm font-mono font-bold text-indigo-400 flex-1">{form.code}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, code: randomCode() }))}
                      className="text-gray-500 hover:text-gray-300 transition-colors">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin" /> : "צור קורס"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
