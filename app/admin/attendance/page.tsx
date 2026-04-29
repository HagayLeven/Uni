"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Check, ChevronDown, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course { id: string; name: string; }
interface Session { id: string; course_id: string; title: string; session_date: string; created_at: string; }
interface Member { id: string; full_name: string | null; avatar_url: string | null; }
interface AttendanceRecord { session_id: string; user_id: string; present: boolean; }

export default function AdminAttendancePage() {
  const [courses, setCourses]     = useState<Course[]>([]);
  const [members, setMembers]     = useState<Member[]>([]);
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState<string | null>(null);
  const [newTitle, setNewTitle]   = useState("");
  const [newDate, setNewDate]     = useState(new Date().toISOString().split("T")[0]);
  const [creating, setCreating]   = useState(false);
  const [addingSession, setAddingSession] = useState(false);

  useEffect(() => {
    supabase.from("courses").select("id, name").order("name").then(({ data }) => {
      setCourses(data ?? []);
      if (data?.[0]) setSelectedCourse(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    Promise.all([
      supabase.from("attendance_sessions").select("*").eq("course_id", selectedCourse).order("session_date", { ascending: false }),
      supabase.from("course_members").select("profiles(id, full_name, avatar_url)").eq("course_id", selectedCourse),
      supabase.from("attendance_records").select("session_id, user_id, present")
        .in("session_id",
          supabase.from("attendance_sessions").select("id").eq("course_id", selectedCourse) as any
        ),
    ]).then(([{ data: sess }, { data: mems }, { data: att }]) => {
      setSessions((sess as Session[]) ?? []);
      setMembers((mems ?? []).map((m: any) => m.profiles).filter(Boolean) as Member[]);
      setAttendance((att as AttendanceRecord[]) ?? []);
      setLoading(false);
    });
  }, [selectedCourse]);

  // Reload attendance when sessions change
  const reloadAttendance = async () => {
    if (!selectedCourse) return;
    const sessIds = sessions.map(s => s.id);
    if (!sessIds.length) return;
    const { data } = await supabase.from("attendance_records")
      .select("session_id, user_id, present")
      .in("session_id", sessIds);
    setAttendance((data as AttendanceRecord[]) ?? []);
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedCourse) return;
    setCreating(true);
    const { data } = await supabase.from("attendance_sessions")
      .insert({ course_id: selectedCourse, title: newTitle.trim(), session_date: newDate })
      .select().single();
    if (data) {
      setSessions(prev => [data as Session, ...prev]);
      // Create default records (absent) for all members
      if (members.length) {
        await supabase.from("attendance_records").insert(
          members.map(m => ({ session_id: data.id, user_id: m.id, present: false }))
        );
        await reloadAttendance();
      }
    }
    setNewTitle("");
    setAddingSession(false);
    setCreating(false);
  };

  const deleteSession = async (id: string) => {
    if (!confirm("למחוק את המפגש?")) return;
    await supabase.from("attendance_sessions").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => prev.filter(a => a.session_id !== id));
  };

  const toggleAttendance = async (sessionId: string, userId: string) => {
    const key = `${sessionId}-${userId}`;
    setSaving(key);
    const existing = attendance.find(a => a.session_id === sessionId && a.user_id === userId);
    if (existing) {
      await supabase.from("attendance_records")
        .update({ present: !existing.present })
        .eq("session_id", sessionId).eq("user_id", userId);
      setAttendance(prev => prev.map(a =>
        a.session_id === sessionId && a.user_id === userId ? { ...a, present: !a.present } : a));
    } else {
      await supabase.from("attendance_records")
        .insert({ session_id: sessionId, user_id: userId, present: true });
      setAttendance(prev => [...prev, { session_id: sessionId, user_id: userId, present: true }]);
    }
    setSaving(null);
  };

  const getPresent = (sessionId: string) =>
    attendance.filter(a => a.session_id === sessionId && a.present).length;

  const getUserAttendance = (userId: string) => {
    const total = sessions.length;
    if (!total) return null;
    const present = attendance.filter(a => a.user_id === userId && a.present).length;
    return { present, total, pct: Math.round((present / total) * 100) };
  };

  const isPresent = (sessionId: string, userId: string) =>
    attendance.find(a => a.session_id === sessionId && a.user_id === userId)?.present ?? false;

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">נוכחות</h1>
        <p className="text-sm text-gray-500 mt-1">מעקב נוכחות לפי מפגש וחניך</p>
      </div>

      {/* Course selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 pe-8 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 appearance-none">
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={13} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-500 pointer-events-none" />
        </div>
        <button onClick={() => setAddingSession(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={14} /> מפגש חדש
        </button>
      </div>

      {/* New session form */}
      {addingSession && (
        <form onSubmit={createSession} className="flex gap-2 flex-wrap items-end bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-gray-500 mb-1">שם המפגש</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="מפגש 1 — מבוא לחובשות"
              className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">תאריך</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={creating || !newTitle.trim()}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5">
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} צור
          </button>
          <button type="button" onClick={() => setAddingSession(false)}
            className="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">
            ביטול
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <CalendarDays size={36} className="text-gray-700" />
          <p className="text-gray-500 text-sm">אין מפגשים עדיין — צור מפגש ראשון</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Attendance grid */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
            <table className="text-sm" style={{ minWidth: `${Math.max(600, 200 + sessions.length * 80)}px` }}>
              <thead className="border-b border-gray-800 bg-gray-800/40">
                <tr>
                  <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 w-48 sticky start-0 bg-gray-800/80">חניך</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 w-20">סה״כ</th>
                  {sessions.map(s => (
                    <th key={s.id} className="text-center px-2 py-2 min-w-[72px]">
                      <div className="text-[10px] font-semibold text-gray-400 truncate max-w-[64px] mx-auto">{s.title}</div>
                      <div className="text-[9px] text-gray-600">{new Date(s.session_date).toLocaleDateString("he-IL")}</div>
                      <div className="text-[9px] text-gray-600 mt-0.5">{getPresent(s.id)}/{members.length}</div>
                    </th>
                  ))}
                  <th className="px-2 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {members.map(m => {
                  const att = getUserAttendance(m.id);
                  return (
                    <tr key={m.id} className="hover:bg-gray-800/20">
                      <td className="px-4 py-2.5 sticky start-0 bg-gray-900 hover:bg-gray-800/20">
                        <div className="flex items-center gap-2">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                              {m.full_name?.[0] ?? "?"}
                            </div>
                          )}
                          <span className="text-xs text-gray-200 truncate max-w-[110px]">{m.full_name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {att && (
                          <span className={cn("text-xs font-bold",
                            att.pct >= 80 ? "text-green-400" : att.pct >= 60 ? "text-yellow-400" : "text-red-400")}>
                            {att.pct}%
                          </span>
                        )}
                      </td>
                      {sessions.map(s => {
                        const present = isPresent(s.id, m.id);
                        const key = `${s.id}-${m.id}`;
                        return (
                          <td key={s.id} className="px-2 py-2.5 text-center">
                            <button
                              onClick={() => toggleAttendance(s.id, m.id)}
                              disabled={saving === key}
                              className={cn("w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors",
                                present
                                  ? "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                                  : "bg-gray-800 border border-gray-700 text-gray-600 hover:border-red-500/40 hover:text-red-400")}>
                              {saving === key
                                ? <Loader2 size={11} className="animate-spin" />
                                : present ? <Check size={12} /> : <X size={11} />}
                            </button>
                          </td>
                        );
                      })}
                      <td />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Session list with delete */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/40">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">מפגשים ({sessions.length})</p>
            </div>
            <div className="divide-y divide-gray-800/60">
              {sessions.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-200">{s.title}</p>
                    <p className="text-xs text-gray-500">{new Date(s.session_date).toLocaleDateString("he-IL")} · {getPresent(s.id)}/{members.length} נוכחים</p>
                  </div>
                  <button onClick={() => deleteSession(s.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
