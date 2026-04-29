"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, ChevronDown, FileText, Loader2, Plus,
  Trash2, Trophy, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course { id: string; name: string; }
interface Week { id: string; week_number: number; title: string; description: string | null; items: WeekItem[]; }
interface WeekItem { id: string; item_type: string; item_id: string; label: string; }
interface Notebook { id: string; title: string; }

export default function WeeksAdmin() {
  const [courses, setCourses]     = useState<Course[]>([]);
  const [selCourse, setSelCourse] = useState<string>("");
  const [weeks, setWeeks]         = useState<Week[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [newWeek, setNewWeek]     = useState({ title: "", description: "" });
  const [addingItem, setAddingItem] = useState<string | null>(null); // week id
  const [itemForm, setItemForm]   = useState({ type: "notebook", id: "" });

  useEffect(() => {
    supabase.from("courses").select("id, name").order("created_at").then(({ data }) => setCourses(data ?? []));
    supabase.from("notebooks").select("id, title").order("title").then(({ data }) => setNotebooks(data ?? []));
  }, []);

  useEffect(() => {
    if (!selCourse) return;
    setLoading(true);
    supabase.from("course_weeks").select("*, week_items(*)").eq("course_id", selCourse).order("week_number")
      .then(({ data }) => {
        setWeeks((data ?? []).map((w: any) => ({
          ...w,
          items: (w.week_items ?? []).map((i: any) => ({
            ...i,
            label: i.item_type === "notebook"
              ? (notebooks.find((n) => n.id === i.item_id)?.title ?? "אוגדן")
              : i.item_type === "exam" ? "מבחן" : "פוסט",
          })),
        })));
        setLoading(false);
      });
  }, [selCourse, notebooks]);

  const addWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeek.title.trim() || !selCourse) return;
    setSaving(true);
    const nextNum = (weeks[weeks.length - 1]?.week_number ?? 0) + 1;
    const { data } = await supabase.from("course_weeks")
      .insert({ course_id: selCourse, week_number: nextNum, title: newWeek.title.trim(), description: newWeek.description.trim() || null })
      .select().single();
    if (data) setWeeks((prev) => [...prev, { ...data, items: [] }]);
    setNewWeek({ title: "", description: "" });
    setSaving(false);
  };

  const deleteWeek = async (id: string) => {
    await supabase.from("course_weeks").delete().eq("id", id);
    setWeeks((prev) => prev.filter((w) => w.id !== id));
  };

  const addItem = async (weekId: string) => {
    if (!itemForm.id) return;
    const label = itemForm.type === "notebook"
      ? (notebooks.find((n) => n.id === itemForm.id)?.title ?? "אוגדן")
      : itemForm.type === "exam" ? "מבחן" : "פוסט";
    const { data } = await supabase.from("week_items")
      .insert({ week_id: weekId, item_type: itemForm.type, item_id: itemForm.id })
      .select().single();
    if (data) {
      setWeeks((prev) => prev.map((w) => w.id === weekId
        ? { ...w, items: [...w.items, { ...data, label }] }
        : w));
    }
    setAddingItem(null);
    setItemForm({ type: "notebook", id: "" });
  };

  const removeItem = async (weekId: string, itemId: string) => {
    await supabase.from("week_items").delete().eq("id", itemId);
    setWeeks((prev) => prev.map((w) => w.id === weekId
      ? { ...w, items: w.items.filter((i) => i.id !== itemId) }
      : w));
  };

  const ITEM_ICON: Record<string, React.ElementType> = { notebook: BookOpen, exam: Trophy, post: FileText };
  const ITEM_COLOR: Record<string, string> = { notebook: "text-indigo-400", exam: "text-yellow-400", post: "text-blue-400" };

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-white">שבועות קורס</h1>
        <p className="text-sm text-gray-500 mt-0.5">בנה את מבנה הקורס שבוע אחר שבוע</p>
      </div>

      {/* Course selector */}
      <select value={selCourse} onChange={(e) => setSelCourse(e.target.value)}
        className="h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500">
        <option value="">— בחר קורס —</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {selCourse && (
        <>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-indigo-500" /></div>
          ) : (
            <div className="space-y-3">
              {weeks.map((week) => (
                <div key={week.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {week.week_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{week.title}</p>
                      {week.description && <p className="text-xs text-gray-500">{week.description}</p>}
                    </div>
                    <button onClick={() => deleteWeek(week.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Items */}
                  <div className="border-t border-gray-800 px-4 py-2 space-y-1.5">
                    {week.items.map((item) => {
                      const Icon = ITEM_ICON[item.item_type] ?? FileText;
                      return (
                        <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                          <Icon size={13} className={ITEM_COLOR[item.item_type] ?? "text-gray-400"} />
                          <span className="text-xs text-gray-300 flex-1 truncate">{item.label}</span>
                          <button onClick={() => removeItem(week.id, item.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}

                    {addingItem === week.id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <select value={itemForm.type} onChange={(e) => setItemForm((f) => ({ ...f, type: e.target.value, id: "" }))}
                          className="h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none">
                          <option value="notebook">אוגדן</option>
                          <option value="exam">מבחן</option>
                        </select>
                        {itemForm.type === "notebook" && (
                          <select value={itemForm.id} onChange={(e) => setItemForm((f) => ({ ...f, id: e.target.value }))}
                            className="flex-1 h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none">
                            <option value="">— בחר —</option>
                            {notebooks.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
                          </select>
                        )}
                        {itemForm.type === "exam" && (
                          <input value={itemForm.id} onChange={(e) => setItemForm((f) => ({ ...f, id: e.target.value }))}
                            placeholder="ID של מבחן" className="flex-1 h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none" />
                        )}
                        <button onClick={() => addItem(week.id)} disabled={!itemForm.id}
                          className="px-3 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-lg transition-colors">הוסף</button>
                        <button onClick={() => setAddingItem(null)} className="p-1.5 text-gray-500 hover:text-gray-300">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingItem(week.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-400 transition-colors py-1">
                        <Plus size={12} /> הוסף תוכן
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add week */}
              <form onSubmit={addWeek} className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">שבוע חדש</p>
                <input value={newWeek.title} onChange={(e) => setNewWeek((f) => ({ ...f, title: e.target.value }))}
                  placeholder={`שבוע ${(weeks[weeks.length - 1]?.week_number ?? 0) + 1} — נושא`} required
                  className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                <input value={newWeek.description} onChange={(e) => setNewWeek((f) => ({ ...f, description: e.target.value }))}
                  placeholder="תיאור קצר (אופציונלי)"
                  className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                <button type="submit" disabled={saving || !newWeek.title.trim()}
                  className="flex items-center gap-2 px-4 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} הוסף שבוע
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
