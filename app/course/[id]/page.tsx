"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  Bell, BookOpen, CalendarDays, Check, ChevronDown, ChevronUp,
  Clock, FileText, Loader2, Lock, Megaphone,
  Plus, Send, Trash2, TrendingUp, Users, X, Trophy, Zap, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { sendNotification } from "@/lib/notifications";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

type Tab = "content" | "members" | "broadcast" | "progress" | "weeks" | "attendance";

interface Week { id: string; week_number: number; title: string; description: string | null; completed: boolean; items: any[]; }
interface Member { user_id: string; name: string; avatar: string | null; completed: Set<string>; last_seen: string | null; }
interface Announcement { id: string; title: string; body: string | null; created_at: string; }
interface Notebook { id: string; title: string; }
interface AttSession { id: string; title: string; session_date: string; }
interface AttRecord { session_id: string; user_id: string; present: boolean; }

function timeAgo(d: string | null) {
  if (!d) return "מעולם";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש׳`;
  const days = Math.floor(h / 24);
  if (days === 1) return "אתמול";
  return `לפני ${days} ימים`;
}

function activityDot(d: string | null) {
  if (!d) return "bg-gray-700";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "bg-green-400";
  if (days <= 3) return "bg-yellow-400";
  if (days <= 7) return "bg-orange-400";
  return "bg-red-500";
}

export default function CourseDashboard() {
  const { id: courseId } = useParams<{ id: string }>();

  const [isAdmin, setIsAdmin]       = useState(false);
  const [userId, setUserId]         = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [tab, setTab]               = useState<Tab>("content");
  const [loading, setLoading]       = useState(true);

  const [weeks, setWeeks]           = useState<Week[]>([]);
  const [openWeek, setOpenWeek]     = useState<string | null>(null);
  const [members, setMembers]       = useState<Member[]>([]);
  const [allUsers, setAllUsers]     = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bForm, setBForm]           = useState({ title: "", body: "" });
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [notebooks, setNotebooks]   = useState<Notebook[]>([]);
  const [newWeek, setNewWeek]       = useState({ title: "", description: "" });
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [itemForm, setItemForm]     = useState({ type: "notebook", id: "" });
  const [savingWeek, setSavingWeek] = useState(false);

  // Attendance
  const [attSessions, setAttSessions] = useState<AttSession[]>([]);
  const [attRecords, setAttRecords]   = useState<AttRecord[]>([]);
  const [newAttTitle, setNewAttTitle] = useState("");
  const [newAttDate, setNewAttDate]   = useState(new Date().toISOString().split("T")[0]);
  const [addingAtt, setAddingAtt]     = useState(false);
  const [attSaving, setAttSaving]     = useState<string | null>(null);

  // Pinging
  const [pinging, setPinging]       = useState<string | null>(null);
  const [pinged, setPinged]         = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setIsAdmin(user.email === ADMIN_EMAIL);

      const { data: course } = await supabase.from("courses").select("name, code").eq("id", courseId).single();
      setCourseName(course?.name ?? "");
      setCourseCode(course?.code ?? "");

      const { data: weeksData } = await supabase.from("course_weeks")
        .select("*, week_items(*)").eq("course_id", courseId).order("week_number");

      const weekIds = (weeksData ?? []).map((w: any) => w.id);

      const [{ data: progressData }, { data: notebooksData }, { data: membersData }, { data: anns }, { data: attSess }, { data: attRec }] = await Promise.all([
        supabase.from("member_progress").select("week_id, completed").eq("user_id", user.id).in("week_id", weekIds.length ? weekIds : [""]),
        supabase.from("notebooks").select("id, title").order("title"),
        supabase.from("course_members").select("user_id, profiles(full_name, avatar_url, last_seen)").eq("course_id", courseId),
        supabase.from("course_announcements").select("*").eq("course_id", courseId).order("created_at", { ascending: false }).limit(10),
        supabase.from("attendance_sessions").select("*").eq("course_id", courseId).order("session_date", { ascending: false }),
        supabase.from("attendance_records").select("session_id, user_id, present"),
      ]);

      const progressMap = Object.fromEntries((progressData ?? []).map((p: any) => [p.week_id, p.completed]));
      const notebookMap = Object.fromEntries((notebooksData ?? []).map((n: any) => [n.id, n.title]));

      setNotebooks(notebooksData ?? []);
      setAnnouncements((anns ?? []) as any);
      setAttSessions((attSess ?? []) as AttSession[]);
      setAttRecords((attRec ?? []) as AttRecord[]);

      const enriched: Week[] = (weeksData ?? []).map((w: any) => ({
        id: w.id, week_number: w.week_number, title: w.title, description: w.description,
        completed: progressMap[w.id] ?? false,
        items: (w.week_items ?? []).map((i: any) => ({
          ...i, label: i.item_type === "notebook" ? (notebookMap[i.item_id] ?? "אוגדן") : i.item_type === "exam" ? "מבחן" : "פוסט",
        })),
      }));
      setWeeks(enriched);
      setOpenWeek(enriched.find((w) => !w.completed)?.id ?? enriched[0]?.id ?? null);

      const allProgress: Record<string, Set<string>> = {};
      if (user.email === ADMIN_EMAIL && weekIds.length) {
        const { data: allProg } = await supabase.from("member_progress").select("user_id, week_id, completed").eq("course_id", courseId);
        for (const p of allProg ?? []) {
          if (!allProgress[p.user_id]) allProgress[p.user_id] = new Set();
          if (p.completed) allProgress[p.user_id].add(p.week_id);
        }
      }

      setMembers((membersData ?? []).map((m: any) => ({
        user_id: m.user_id,
        name: m.profiles?.full_name ?? "משתמש",
        avatar: m.profiles?.avatar_url ?? null,
        last_seen: m.profiles?.last_seen ?? null,
        completed: allProgress[m.user_id] ?? new Set(),
      })));

      const { data: allProfiles } = await supabase.from("profiles").select("id, full_name, avatar_url, last_seen");
      const memberIds = new Set((membersData ?? []).map((m: any) => m.user_id));
      setAllUsers((allProfiles ?? []).filter((p: any) => !memberIds.has(p.id)));
      setLoading(false);
    }
    load();
  }, [courseId]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggleComplete = async (week: Week) => {
    if (!userId) return;
    const newVal = !week.completed;
    setWeeks((prev) => prev.map((w) => w.id === week.id ? { ...w, completed: newVal } : w));
    await supabase.from("member_progress").upsert({ user_id: userId, course_id: courseId, week_id: week.id, completed: newVal, updated_at: new Date().toISOString() }, { onConflict: "user_id,week_id" });
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bForm.title.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: ann } = await supabase.from("course_announcements").insert({ course_id: courseId, author_id: user?.id, title: bForm.title.trim(), body: bForm.body.trim() || null }).select().single();
    const notifs = members.filter((m) => m.user_id !== user?.id).map((m) => ({ user_id: m.user_id, type: "announcement", title: bForm.title.trim(), body: bForm.body.trim() || null, link: null, read: false }));
    if (notifs.length) await supabase.from("notifications").insert(notifs);
    if (ann) setAnnouncements((prev) => [ann as any, ...prev]);
    setBForm({ title: "", body: "" });
    setSending(false); setSent(true); setTimeout(() => setSent(false), 2000);
  };

  const addWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeek.title.trim()) return;
    setSavingWeek(true);
    const nextNum = (weeks[weeks.length - 1]?.week_number ?? 0) + 1;
    const { data } = await supabase.from("course_weeks").insert({ course_id: courseId, week_number: nextNum, title: newWeek.title.trim(), description: newWeek.description.trim() || null }).select("*, week_items(*)").single();
    if (data) setWeeks((prev) => [...prev, { ...data, completed: false, items: [] }]);
    setNewWeek({ title: "", description: "" }); setSavingWeek(false);
  };

  const deleteWeek = async (id: string) => {
    await supabase.from("course_weeks").delete().eq("id", id);
    setWeeks((prev) => prev.filter((w) => w.id !== id));
  };

  const addItem = async (weekId: string) => {
    if (!itemForm.id) return;
    const label = itemForm.type === "notebook" ? (notebooks.find((n) => n.id === itemForm.id)?.title ?? "אוגדן") : "מבחן";
    const { data } = await supabase.from("week_items").insert({ week_id: weekId, item_type: itemForm.type, item_id: itemForm.id }).select().single();
    if (data) setWeeks((prev) => prev.map((w) => w.id === weekId ? { ...w, items: [...w.items, { ...data, label }] } : w));
    setAddingItem(null); setItemForm({ type: "notebook", id: "" });
  };

  const assignUser = async (uid: string) => {
    await supabase.from("course_members").insert({ course_id: courseId, user_id: uid, role: "student" });
    await supabase.from("profiles").update({ course_id: courseId }).eq("id", uid);
    const u = allUsers.find((x) => x.id === uid);
    if (u) { setMembers((prev) => [...prev, { user_id: uid, name: u.full_name ?? "משתמש", avatar: u.avatar_url, last_seen: u.last_seen ?? null, completed: new Set() }]); setAllUsers((prev) => prev.filter((x) => x.id !== uid)); }
  };

  const removeUser = async (uid: string) => {
    await supabase.from("course_members").delete().eq("course_id", courseId).eq("user_id", uid);
    await supabase.from("profiles").update({ course_id: null }).eq("id", uid);
    const m = members.find((x) => x.user_id === uid);
    setMembers((prev) => prev.filter((x) => x.user_id !== uid));
    if (m) setAllUsers((prev) => [...prev, { id: uid, full_name: m.name, avatar_url: m.avatar, last_seen: m.last_seen }]);
  };

  const pingMember = async (uid: string) => {
    setPinging(uid);
    await sendNotification({ userId: uid, type: "announcement", title: "🔔 תזכורת מהמדריך", body: `היי! יש עדכונים בקורס "${courseName}" — כדאי להתעדכן.` });
    setPinging(null); setPinged(uid);
    setTimeout(() => setPinged(null), 3000);
  };

  // Attendance
  const createAttSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttTitle.trim()) return;
    const { data } = await supabase.from("attendance_sessions")
      .insert({ course_id: courseId, title: newAttTitle.trim(), session_date: newAttDate })
      .select().single();
    if (data) {
      setAttSessions(prev => [data as AttSession, ...prev]);
      if (members.length) {
        await supabase.from("attendance_records").insert(
          members.map(m => ({ session_id: data.id, user_id: m.user_id, present: false }))
        );
        const newRecs = members.map(m => ({ session_id: data.id, user_id: m.user_id, present: false }));
        setAttRecords(prev => [...prev, ...newRecs]);
      }
    }
    setNewAttTitle(""); setAddingAtt(false);
  };

  const toggleAtt = async (sessionId: string, userId: string) => {
    const key = `${sessionId}-${userId}`;
    setAttSaving(key);
    const existing = attRecords.find(a => a.session_id === sessionId && a.user_id === userId);
    if (existing) {
      await supabase.from("attendance_records").update({ present: !existing.present }).eq("session_id", sessionId).eq("user_id", userId);
      setAttRecords(prev => prev.map(a => a.session_id === sessionId && a.user_id === userId ? { ...a, present: !a.present } : a));
    } else {
      await supabase.from("attendance_records").insert({ session_id: sessionId, user_id: userId, present: true });
      setAttRecords(prev => [...prev, { session_id: sessionId, user_id: userId, present: true }]);
    }
    setAttSaving(null);
  };

  const isPresent = (sid: string, uid: string) => attRecords.find(a => a.session_id === sid && a.user_id === uid)?.present ?? false;
  const memberAttPct = (uid: string) => {
    if (!attSessions.length) return null;
    const present = attRecords.filter(a => a.user_id === uid && a.present).length;
    return Math.round((present / attSessions.length) * 100);
  };

  const ITEM_ICON: Record<string, React.ElementType> = { notebook: BookOpen, exam: Trophy, post: FileText };
  const ITEM_COLOR: Record<string, string> = { notebook: "text-indigo-400", exam: "text-yellow-400", post: "text-blue-400" };

  const completed = weeks.filter((w) => w.completed).length;
  const progress = weeks.length ? Math.round((completed / weeks.length) * 100) : 0;
  const activeToday = members.filter(m => m.last_seen && Math.floor((Date.now() - new Date(m.last_seen).getTime()) / 86400000) === 0).length;
  const inactive7 = members.filter(m => !m.last_seen || Math.floor((Date.now() - new Date(m.last_seen).getTime()) / 86400000) > 7).length;

  const ADMIN_TABS = [
    { id: "content",    label: "תוכן",      icon: BookOpen    },
    { id: "weeks",      label: "שבועות",    icon: Clock       },
    { id: "members",    label: "חניכים",    icon: Users, badge: inactive7 > 0 ? inactive7 : 0 },
    { id: "attendance", label: "נוכחות",    icon: CalendarDays },
    { id: "progress",   label: "התקדמות",   icon: TrendingUp  },
    { id: "broadcast",  label: "הודעה",     icon: Megaphone   },
  ] as const;

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen size={19} className="text-indigo-400" />
                  <h1 className="text-xl font-bold text-white">{courseName}</h1>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{members.length} חניכים · {weeks.length} שבועות</p>
              </div>
              {courseCode && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-xl shrink-0">
                  <span className="text-xs text-gray-500">קוד הצטרפות:</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">{courseCode}</span>
                </div>
              )}
            </div>

            {/* ── Admin quick stats ── */}
            {isAdmin && !loading && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "חניכים", value: members.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                  { label: "פעילים היום", value: activeToday, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                  { label: "לא פעילים 7+ ימים", value: inactive7, color: inactive7 > 0 ? "text-red-400" : "text-gray-500", bg: inactive7 > 0 ? "bg-red-500/10 border-red-500/20" : "bg-gray-800 border-gray-700" },
                  { label: "שבועות", value: weeks.length, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl p-3 border ${s.bg}`}>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Student progress bar ── */}
            {!isAdmin && weeks.length > 0 && (
              <div className="space-y-1.5">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-l from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{completed}/{weeks.length} שבועות הושלמו</span>
                  <span className="text-indigo-400 font-semibold">{progress}%</span>
                </div>
              </div>
            )}

            {/* ── Admin tabs ── */}
            {isAdmin && (
              <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
                {ADMIN_TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id as Tab)}
                    className={cn("relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                      tab === t.id ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800")}>
                    <t.icon size={12} />{t.label}
                    {(t as any).badge > 0 && (
                      <span className="absolute -top-1 -end-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {(t as any).badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {loading && <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>}

            {/* ── CONTENT ── */}
            {!loading && (tab === "content" || !isAdmin) && (
              <div className="space-y-3">
                {weeks.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <Clock size={32} className="text-gray-700" />
                    <p className="text-gray-500">הקורס עדיין בבנייה</p>
                  </div>
                )}
                {weeks.map((week, idx) => {
                  const isOpen = openWeek === week.id;
                  const locked = !isAdmin && idx > 0 && !weeks[idx - 1].completed;
                  return (
                    <div key={week.id} className={cn("rounded-2xl border overflow-hidden transition-colors",
                      week.completed ? "bg-green-500/5 border-green-500/20" : locked ? "bg-gray-900/50 border-gray-800 opacity-60" : "bg-gray-900 border-gray-800")}>
                      <button onClick={() => !locked && setOpenWeek(isOpen ? null : week.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-start" disabled={locked}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                          week.completed ? "bg-green-500/20 text-green-400" : locked ? "bg-gray-800 text-gray-600" : "bg-indigo-500/20 text-indigo-400")}>
                          {week.completed ? <Check size={14} /> : locked ? <Lock size={13} /> : week.week_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-semibold", week.completed ? "text-green-300" : locked ? "text-gray-600" : "text-white")}>
                            שבוע {week.week_number} — {week.title}
                          </p>
                          {week.description && <p className="text-xs text-gray-500 mt-0.5">{week.description}</p>}
                        </div>
                        {!locked && (isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />)}
                      </button>
                      {isOpen && !locked && (
                        <div className="border-t border-gray-800 px-4 py-3 space-y-3">
                          {week.items.map((item) => {
                            const Icon = ITEM_ICON[item.item_type] ?? FileText;
                            return (
                              <Link key={item.id} href={item.item_type === "notebook" ? "/notebooks" : `/post/${item.item_id}`}
                                className="flex items-center gap-3 px-3 py-2.5 bg-gray-800/60 hover:bg-gray-800 rounded-xl transition-colors">
                                <Icon size={14} className={ITEM_COLOR[item.item_type]} />
                                <span className="text-sm text-gray-200 flex-1">{item.label}</span>
                              </Link>
                            );
                          })}
                          {week.items.length === 0 && <p className="text-xs text-gray-600 py-1">אין תוכן עדיין</p>}
                          {!isAdmin && (
                            <button onClick={() => toggleComplete(week)}
                              className={cn("w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
                                week.completed ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400")}>
                              <Check size={14} /> {week.completed ? "הושלם ✓" : "סמן כהושלם"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── WEEKS MGMT ── */}
            {!loading && isAdmin && tab === "weeks" && (
              <div className="space-y-3">
                {weeks.map((week) => (
                  <div key={week.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">{week.week_number}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{week.title}</p>
                        {week.description && <p className="text-xs text-gray-500">{week.description}</p>}
                      </div>
                      <button onClick={() => deleteWeek(week.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                    <div className="border-t border-gray-800 px-4 py-2 space-y-1.5">
                      {week.items.map((item) => {
                        const Icon = ITEM_ICON[item.item_type] ?? FileText;
                        return (
                          <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                            <Icon size={13} className={ITEM_COLOR[item.item_type] ?? "text-gray-400"} />
                            <span className="text-xs text-gray-300 flex-1 truncate">{item.label}</span>
                            <button onClick={async () => { await supabase.from("week_items").delete().eq("id", item.id); setWeeks((prev) => prev.map((w) => w.id === week.id ? { ...w, items: w.items.filter((i) => i.id !== item.id) } : w)); }} className="text-gray-600 hover:text-red-400"><X size={12} /></button>
                          </div>
                        );
                      })}
                      {addingItem === week.id ? (
                        <div className="flex items-center gap-2 pt-1">
                          <select value={itemForm.type} onChange={(e) => setItemForm((f) => ({ ...f, type: e.target.value, id: "" }))} className="h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none">
                            <option value="notebook">אוגדן</option>
                          </select>
                          <select value={itemForm.id} onChange={(e) => setItemForm((f) => ({ ...f, id: e.target.value }))} className="flex-1 h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none">
                            <option value="">— בחר —</option>
                            {notebooks.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                          </select>
                          <button onClick={() => addItem(week.id)} disabled={!itemForm.id} className="px-3 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-lg">הוסף</button>
                          <button onClick={() => setAddingItem(null)} className="p-1.5 text-gray-500 hover:text-gray-300"><X size={13} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingItem(week.id)} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-400 transition-colors py-1">
                          <Plus size={12} /> הוסף תוכן
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <form onSubmit={addWeek} className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">שבוע חדש</p>
                  <input value={newWeek.title} onChange={(e) => setNewWeek((f) => ({ ...f, title: e.target.value }))} placeholder={`שבוע ${(weeks[weeks.length - 1]?.week_number ?? 0) + 1} — נושא`} required className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                  <input value={newWeek.description} onChange={(e) => setNewWeek((f) => ({ ...f, description: e.target.value }))} placeholder="תיאור קצר (אופציונלי)" className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                  <button type="submit" disabled={savingWeek || !newWeek.title.trim()} className="flex items-center gap-2 px-4 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                    {savingWeek ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} הוסף שבוע
                  </button>
                </form>
              </div>
            )}

            {/* ── MEMBERS ── */}
            {!loading && isAdmin && tab === "members" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium">{members.length} חניכים רשומים</p>
                {members.sort((a, b) => {
                  const da = a.last_seen ? new Date(a.last_seen).getTime() : 0;
                  const db = b.last_seen ? new Date(b.last_seen).getTime() : 0;
                  return db - da;
                }).map((m) => {
                  const days = m.last_seen ? Math.floor((Date.now() - new Date(m.last_seen).getTime()) / 86400000) : 999;
                  const isInactive = days > 7;
                  return (
                    <div key={m.user_id} className={cn("flex items-center gap-3 bg-gray-900 border rounded-xl px-4 py-3",
                      isInactive ? "border-red-500/20" : "border-gray-800")}>
                      <div className="relative shrink-0">
                        {m.avatar ? (
                          <img src={m.avatar} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{m.name[0]}</div>
                        )}
                        <span className={cn("absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900", activityDot(m.last_seen))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200">{m.name}</p>
                        <p className="text-xs text-gray-500">
                          {m.completed.size}/{weeks.length} שבועות · {timeAgo(m.last_seen)}
                          {isInactive && <span className="text-red-400 mr-1"> · לא פעיל</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => pingMember(m.user_id)}
                        disabled={pinging === m.user_id || pinged === m.user_id}
                        className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          pinged === m.user_id
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : isInactive
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                            : "bg-gray-800 hover:bg-gray-700 text-gray-500 border border-gray-700")}>
                        {pinging === m.user_id ? <Loader2 size={11} className="animate-spin" /> : pinged === m.user_id ? <Check size={11} /> : <Bell size={11} />}
                        {pinged === m.user_id ? "נשלח" : "הזכר"}
                      </button>
                      <button onClick={() => removeUser(m.user_id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                    </div>
                  );
                })}
                {allUsers.length > 0 && (
                  <>
                    <p className="text-xs text-gray-600 font-medium pt-2">הוסף חניכים</p>
                    {allUsers.slice(0, 10).map((u) => (
                      <div key={u.id} className="flex items-center gap-3 bg-gray-900/60 border border-gray-800/60 rounded-xl px-4 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">{(u.full_name ?? "?")[0]}</div>
                        <p className="flex-1 text-sm text-gray-400">{u.full_name ?? "משתמש"}</p>
                        <button onClick={() => assignUser(u.id)} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs rounded-lg transition-colors"><Plus size={11} /> הוסף</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── ATTENDANCE ── */}
            {!loading && isAdmin && tab === "attendance" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{attSessions.length} מפגשים · {members.length} חניכים</p>
                  <button onClick={() => setAddingAtt(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors">
                    <Plus size={13} /> מפגש חדש
                  </button>
                </div>

                {addingAtt && (
                  <form onSubmit={createAttSession} className="flex gap-2 flex-wrap items-end bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex-1 min-w-36">
                      <label className="block text-xs text-gray-500 mb-1">שם המפגש</label>
                      <input value={newAttTitle} onChange={e => setNewAttTitle(e.target.value)} placeholder="מפגש 1 — מבוא"
                        className="w-full h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">תאריך</label>
                      <input type="date" value={newAttDate} onChange={e => setNewAttDate(e.target.value)}
                        className="h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <button type="submit" disabled={!newAttTitle.trim()}
                      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors">צור</button>
                    <button type="button" onClick={() => setAddingAtt(false)}
                      className="h-9 px-3 bg-gray-700 text-gray-300 text-xs rounded-lg">ביטול</button>
                  </form>
                )}

                {attSessions.length === 0 ? (
                  <div className="text-center py-16 text-gray-600">
                    <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                    <p>אין מפגשים עדיין</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                    <table className="text-sm" style={{ minWidth: `${Math.max(500, 180 + attSessions.length * 72)}px` }}>
                      <thead className="border-b border-gray-800 bg-gray-800/40">
                        <tr>
                          <th className="text-start px-4 py-3 text-xs font-semibold text-gray-400 sticky start-0 bg-gray-800/80 w-44">חניך</th>
                          <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 w-16">%</th>
                          {attSessions.map(s => (
                            <th key={s.id} className="text-center px-1 py-2 min-w-[64px]">
                              <div className="text-[10px] text-gray-400 truncate max-w-[56px] mx-auto">{s.title}</div>
                              <div className="text-[9px] text-gray-600">{new Date(s.session_date).toLocaleDateString("he-IL")}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {members.map(m => {
                          const pct = memberAttPct(m.user_id);
                          return (
                            <tr key={m.user_id} className="hover:bg-gray-800/20">
                              <td className="px-4 py-2.5 sticky start-0 bg-gray-900">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">{m.name[0]}</div>
                                  <span className="text-xs text-gray-200 truncate max-w-[90px]">{m.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {pct !== null && (
                                  <span className={cn("text-xs font-bold",
                                    pct >= 80 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : "text-red-400")}>
                                    {pct}%
                                  </span>
                                )}
                              </td>
                              {attSessions.map(s => {
                                const present = isPresent(s.id, m.user_id);
                                const key = `${s.id}-${m.user_id}`;
                                return (
                                  <td key={s.id} className="px-1 py-2.5 text-center">
                                    <button onClick={() => toggleAtt(s.id, m.user_id)} disabled={attSaving === key}
                                      className={cn("w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors",
                                        present ? "bg-green-500/20 border border-green-500/40 text-green-400" : "bg-gray-800 border border-gray-700 text-gray-600 hover:border-gray-500")}>
                                      {attSaving === key ? <Loader2 size={10} className="animate-spin" /> : present ? <Check size={11} /> : <X size={10} />}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── PROGRESS ── */}
            {!loading && isAdmin && tab === "progress" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{members.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">חניכים</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{members.filter((m) => m.completed.size === weeks.length && weeks.length > 0).length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">השלימו הכל</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{members.filter((m) => m.completed.size === 0).length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">לא התחילו</p>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-800">
                      <th className="text-start px-4 py-3 text-xs font-semibold text-gray-500">חניך</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">%</th>
                      {weeks.map((w) => <th key={w.id} className="text-center px-2 py-3 text-xs font-semibold text-gray-500">ש׳{w.week_number}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {members.sort((a, b) => b.completed.size - a.completed.size).map((m) => {
                        const pct = weeks.length ? Math.round((m.completed.size / weeks.length) * 100) : 0;
                        return (
                          <tr key={m.user_id} className="hover:bg-gray-800/20 transition-colors">
                            <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{m.name[0]}</div><span className="text-gray-200 text-sm truncate max-w-[100px]">{m.name}</span></div></td>
                            <td className="px-3 py-3 text-center"><span className={cn("text-xs font-bold", pct === 100 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400")}>{pct}%</span></td>
                            {weeks.map((w) => <td key={w.id} className="px-2 py-3 text-center">{m.completed.has(w.id) ? <Check size={13} className="text-green-400 mx-auto" /> : <X size={13} className="text-gray-700 mx-auto" />}</td>)}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── BROADCAST ── */}
            {!loading && isAdmin && tab === "broadcast" && (
              <div className="space-y-5">
                <form onSubmit={sendBroadcast} className="space-y-3">
                  <input value={bForm.title} onChange={(e) => setBForm((f) => ({ ...f, title: e.target.value }))} placeholder="כותרת ההודעה..." required
                    className="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                  <textarea value={bForm.body} onChange={(e) => setBForm((f) => ({ ...f, body: e.target.value }))} placeholder="תוכן (אופציונלי)..." rows={4}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                  <p className="text-xs text-gray-600">→ ישלח ל-{members.length} חניכים</p>
                  <button type="submit" disabled={sending || !bForm.title.trim()}
                    className={cn("w-full h-11 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2", sent ? "bg-green-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white")}>
                    {sending ? <><Loader2 size={15} className="animate-spin" /> שולח...</> : sent ? <><Check size={15} /> נשלח!</> : <><Send size={15} /> שלח הודעה</>}
                  </button>
                </form>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium">היסטוריה</p>
                  {announcements.map((a) => (
                    <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{a.title}</p>
                        <button onClick={async () => { await supabase.from("course_announcements").delete().eq("id", a.id); setAnnouncements((prev) => prev.filter((x) => x.id !== a.id)); }} className="text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
                      </div>
                      {a.body && <p className="text-xs text-gray-500">{a.body}</p>}
                      <p className="text-[10px] text-gray-600">{timeAgo(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
