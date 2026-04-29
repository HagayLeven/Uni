"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Check, Loader2, Megaphone, Send, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course { id: string; name: string; member_count: number; }
interface Announcement { id: string; title: string; body: string | null; created_at: string; course_id: string | null; }

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש׳`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

export default function BroadcastPage() {
  const [courses, setCourses]       = useState<Course[]>([]);
  const [history, setHistory]       = useState<Announcement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    target: "all" as "all" | string, // "all" or course id
  });

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: a }] = await Promise.all([
        supabase.from("courses").select("id, name, course_members(count)").eq("active", true),
        supabase.from("course_announcements").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setCourses((c ?? []).map((x: any) => ({ ...x, member_count: x.course_members?.[0]?.count ?? 0 })));
      setHistory((a ?? []) as any);
      setLoading(false);
    }
    load();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Save announcement
    const { data: ann } = await supabase.from("course_announcements").insert({
      course_id: form.target === "all" ? null : form.target,
      author_id: user?.id,
      title: form.title.trim(),
      body: form.body.trim() || null,
    }).select().single();

    // 2. Get target users
    let userIds: string[] = [];
    if (form.target === "all") {
      const { data: profiles } = await supabase.from("profiles").select("id");
      userIds = (profiles ?? []).map((p: any) => p.id);
    } else {
      const { data: members } = await supabase.from("course_members").select("user_id").eq("course_id", form.target);
      userIds = (members ?? []).map((m: any) => m.user_id);
    }

    // 3. Send notification to each user (exclude self)
    const notifs = userIds
      .filter((id) => id !== user?.id)
      .map((id) => ({
        user_id: id,
        type: "announcement",
        title: form.title.trim(),
        body: form.body.trim() || null,
        link: null,
        read: false,
      }));

    if (notifs.length) {
      await supabase.from("notifications").insert(notifs);
    }

    if (ann) setHistory((prev) => [ann as any, ...prev]);
    setForm({ title: "", body: "", target: "all" });
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const deleteAnn = async (id: string) => {
    await supabase.from("course_announcements").delete().eq("id", id);
    setHistory((prev) => prev.filter((a) => a.id !== id));
  };

  const targetName = form.target === "all"
    ? "כל המשתמשים"
    : courses.find((c) => c.id === form.target)?.name ?? "";

  const targetCount = form.target === "all"
    ? courses.reduce((s, c) => s + c.member_count, 0)
    : (courses.find((c) => c.id === form.target)?.member_count ?? 0);

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-white">שליחת הודעה</h1>
        <p className="text-sm text-gray-500 mt-0.5">שלח התראה לכל חניכי קורס או לכולם בבת אחת</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Compose ── */}
        <form onSubmit={handleSend} className="space-y-4">
          {/* Target selector */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block font-medium">שלח אל</label>
            <div className="space-y-2">
              <button type="button" onClick={() => setForm((f) => ({ ...f, target: "all" }))}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-start",
                  form.target === "all" ? "bg-indigo-600/10 border-indigo-500/40 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700")}>
                <Users size={15} className={form.target === "all" ? "text-indigo-400" : "text-gray-600"} />
                <div className="flex-1">
                  <p className="text-sm font-medium">כולם</p>
                  <p className="text-xs text-gray-500">כל המשתמשים במערכת</p>
                </div>
                {form.target === "all" && <Check size={14} className="text-indigo-400 shrink-0" />}
              </button>

              {courses.map((c) => (
                <button key={c.id} type="button" onClick={() => setForm((f) => ({ ...f, target: c.id }))}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-start",
                    form.target === c.id ? "bg-indigo-600/10 border-indigo-500/40 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700")}>
                  <Megaphone size={15} className={form.target === c.id ? "text-indigo-400" : "text-gray-600"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.member_count} חניכים</p>
                  </div>
                  {form.target === c.id && <Check size={14} className="text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">כותרת</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="נושא ההודעה..." required
              className="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">תוכן (אופציונלי)</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="פרטים נוספים..." rows={4}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
          </div>

          {/* Preview */}
          {form.title && (
            <div className="flex items-start gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl">
              <Bell size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">תצוגה מקדימה ← {targetName} ({targetCount} משתמשים)</p>
                <p className="text-sm font-medium text-white">{form.title}</p>
                {form.body && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{form.body}</p>}
              </div>
            </div>
          )}

          <button type="submit" disabled={sending || !form.title.trim()}
            className={cn(
              "w-full h-11 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2",
              sent
                ? "bg-green-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
            )}>
            {sending
              ? <><Loader2 size={15} className="animate-spin" /> שולח...</>
              : sent
              ? <><Check size={15} /> נשלח בהצלחה!</>
              : <><Send size={15} /> שלח הודעה</>}
          </button>
        </form>

        {/* ── History ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">היסטוריית הודעות</p>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Megaphone size={28} className="text-gray-700" />
              <p className="text-sm text-gray-600">אין הודעות עדיין</p>
            </div>
          ) : history.map((a) => (
            <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Megaphone size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-white truncate">{a.title}</p>
                </div>
                <button onClick={() => deleteAnn(a.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
              {a.body && <p className="text-xs text-gray-500 line-clamp-2 pe-6">{a.body}</p>}
              <div className="flex items-center gap-2 text-[10px] text-gray-600">
                <span>{timeAgo(a.created_at)}</span>
                <span>·</span>
                <span>{a.course_id ? (courses.find((c) => c.id === a.course_id)?.name ?? "קורס") : "כולם"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
