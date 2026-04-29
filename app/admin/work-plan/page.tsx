"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookOpen, Calendar, Check, ChevronDown, ChevronUp, ClipboardList,
  Edit2, FileText, Loader2, Plus, Save, Sparkles, Target, Trash2,
  Users, X, Zap, TrendingUp, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course { id: string; name: string; }
interface Exam { id: string; title: string; }
interface Notebook { id: string; title: string; }
interface WorkPlan { id: string; course_id: string; title: string; }
interface WorkPlanWeek {
  id: string;
  plan_id: string;
  week_number: number;
  title: string;
  description: string;
  topics: string[];
  exam_id: string | null;
  notebook_id: string | null;
  due_date: string | null;
}
interface Progress {
  week_id: string;
  user_id: string;
  completed: boolean;
  profiles?: { full_name: string | null; avatar_url: string | null };
}

export default function WorkPlanPage() {
  const [courses, setCourses]     = useState<Course[]>([]);
  const [exams, setExams]         = useState<Exam[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [plans, setPlans]         = useState<WorkPlan[]>([]);
  const [weeks, setWeeks]         = useState<WorkPlanWeek[]>([]);
  const [progress, setProgress]   = useState<Progress[]>([]);
  const [members, setMembers]     = useState<{id:string;full_name:string|null;avatar_url:string|null}[]>([]);

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [activePlan, setActivePlan]         = useState<WorkPlan | null>(null);
  const [expandedWeek, setExpandedWeek]     = useState<string | null>(null);
  const [loading, setLoading]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [userId, setUserId]                 = useState<string | null>(null);
  const [tab, setTab]                       = useState<"plan"|"progress">("plan");

  // New plan form
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [planTitle, setPlanTitle]       = useState("");

  // New/edit week form
  const [editingWeek, setEditingWeek]   = useState<WorkPlanWeek | null>(null);
  const [weekForm, setWeekForm] = useState({
    title: "", description: "", topics: "", exam_id: "", notebook_id: "", due_date: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    Promise.all([
      supabase.from("courses").select("id,name").order("name"),
      supabase.from("exams").select("id,title").order("title"),
      supabase.from("notebooks").select("id,title").order("title"),
    ]).then(([c, e, n]) => {
      setCourses(c.data ?? []);
      setExams(e.data ?? []);
      setNotebooks(n.data ?? []);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    Promise.all([
      supabase.from("work_plans").select("*").eq("course_id", selectedCourse),
      supabase.from("profiles").select("id,full_name,avatar_url").eq("course_id", selectedCourse),
    ]).then(([p, m]) => {
      setPlans(p.data ?? []);
      setMembers(m.data ?? []);
      if (p.data && p.data.length > 0) loadPlan(p.data[0]);
      else { setActivePlan(null); setWeeks([]); }
      setLoading(false);
    });
  }, [selectedCourse]);

  async function loadPlan(plan: WorkPlan) {
    setActivePlan(plan);
    const [w, prog] = await Promise.all([
      supabase.from("work_plan_weeks").select("*").eq("plan_id", plan.id).order("week_number"),
      supabase.from("work_plan_progress").select("*, profiles(full_name,avatar_url)").in(
        "week_id",
        (await supabase.from("work_plan_weeks").select("id").eq("plan_id", plan.id)).data?.map(x=>x.id) ?? []
      ),
    ]);
    setWeeks(w.data ?? []);
    setProgress((prog.data as any) ?? []);
  }

  async function createPlan() {
    if (!planTitle.trim() || !selectedCourse || !userId) return;
    setSaving(true);
    const { data } = await supabase.from("work_plans").insert({
      course_id: selectedCourse, title: planTitle.trim(), created_by: userId,
    }).select().single();
    if (data) { setPlans(p => [...p, data]); setActivePlan(data); setWeeks([]); }
    setPlanTitle(""); setCreatingPlan(false); setSaving(false);
  }

  async function saveWeek() {
    if (!activePlan || !weekForm.title.trim()) return;
    setSaving(true);
    const payload = {
      plan_id: activePlan.id,
      week_number: editingWeek?.week_number ?? (weeks.length + 1),
      title: weekForm.title.trim(),
      description: weekForm.description.trim(),
      topics: weekForm.topics.split("\n").map(t=>t.trim()).filter(Boolean),
      exam_id: weekForm.exam_id || null,
      notebook_id: weekForm.notebook_id || null,
      due_date: weekForm.due_date || null,
    };
    if (editingWeek) {
      const { data } = await supabase.from("work_plan_weeks").update(payload).eq("id", editingWeek.id).select().single();
      if (data) setWeeks(ws => ws.map(w => w.id === editingWeek.id ? data as WorkPlanWeek : w));
    } else {
      const { data } = await supabase.from("work_plan_weeks").insert(payload).select().single();
      if (data) setWeeks(ws => [...ws, data as WorkPlanWeek]);
    }
    setEditingWeek(null);
    setWeekForm({ title:"",description:"",topics:"",exam_id:"",notebook_id:"",due_date:"" });
    setSaving(false);
  }

  async function deleteWeek(id: string) {
    await supabase.from("work_plan_weeks").delete().eq("id", id);
    setWeeks(ws => ws.filter(w => w.id !== id));
  }

  function startEditWeek(w: WorkPlanWeek) {
    setEditingWeek(w);
    setWeekForm({
      title: w.title, description: w.description ?? "",
      topics: (w.topics ?? []).join("\n"),
      exam_id: w.exam_id ?? "", notebook_id: w.notebook_id ?? "", due_date: w.due_date ?? "",
    });
  }

  // Progress stats per week
  function weekStats(weekId: string) {
    const wp = progress.filter(p => p.week_id === weekId);
    const done = wp.filter(p => p.completed).length;
    return { done, total: members.length, pct: members.length ? Math.round(done / members.length * 100) : 0 };
  }

  const completedWeeks = weeks.filter(w => weekStats(w.id).pct === 100).length;
  const overallPct = weeks.length ? Math.round(completedWeeks / weeks.length * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl" dir="rtl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Target size={20} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">תוכנית עבודה</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">בנה תוכנית שבועית לקורס ועקוב אחר התקדמות כל חניך</p>
      </div>

      {/* Course selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">בחר קורס</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500">
          <option value="">— בחר קורס —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>}

      {!loading && selectedCourse && (
        <>
          {/* No plan yet */}
          {!activePlan && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center space-y-4">
              <Target size={36} className="text-gray-600 mx-auto" />
              <p className="text-gray-400">אין תוכנית עבודה לקורס זה עדיין</p>
              {creatingPlan ? (
                <div className="flex gap-2 justify-center max-w-sm mx-auto">
                  <input value={planTitle} onChange={e => setPlanTitle(e.target.value)}
                    placeholder="שם התוכנית (לדוגמה: קורס חובשים 2026)"
                    className="flex-1 h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500" />
                  <button onClick={createPlan} disabled={saving || !planTitle.trim()}
                    className="px-4 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : "צור"}
                  </button>
                  <button onClick={() => setCreatingPlan(false)} className="px-3 h-10 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setCreatingPlan(true)}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
                  <Plus size={15} /> צור תוכנית עבודה
                </button>
              )}
            </div>
          )}

          {activePlan && (
            <div className="space-y-5">
              {/* Plan header + tabs */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{activePlan.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{weeks.length} שבועות · {members.length} חניכים</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Overall progress */}
                    <div className="text-end">
                      <p className="text-2xl font-bold text-indigo-400">{overallPct}%</p>
                      <p className="text-[10px] text-gray-500">השלמה כוללת</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4 bg-gray-800/60 border border-gray-700/60 rounded-lg p-0.5 w-fit">
                  {([["plan","📋 תוכנית"],["progress","📊 התקדמות"]] as const).map(([v,l]) => (
                    <button key={v} onClick={() => setTab(v)}
                      className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                        tab === v ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB: PLAN */}
              {tab === "plan" && (
                <div className="space-y-3">
                  {/* Week list */}
                  {weeks.map((w) => {
                    const stats = weekStats(w.id);
                    const isOpen = expandedWeek === w.id;
                    const examName = exams.find(e => e.id === w.exam_id)?.title;
                    const notebookName = notebooks.find(n => n.id === w.notebook_id)?.title;
                    return (
                      <div key={w.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        {/* Week header */}
                        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/40 transition-colors"
                          onClick={() => setExpandedWeek(isOpen ? null : w.id)}>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                            stats.pct === 100 ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : stats.pct > 0 ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "bg-gray-800 text-gray-500 border border-gray-700")}>
                            {w.week_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-100">{w.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              {w.due_date && <span className="text-[11px] text-gray-500 flex items-center gap-1"><Calendar size={9} />{w.due_date}</span>}
                              {examName && <span className="text-[11px] text-blue-400 flex items-center gap-1"><ClipboardList size={9} />{examName}</span>}
                              {notebookName && <span className="text-[11px] text-indigo-400 flex items-center gap-1"><FileText size={9} />{notebookName}</span>}
                            </div>
                          </div>
                          {/* Mini progress */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-end">
                              <p className={cn("text-sm font-bold", stats.pct===100?"text-green-400":stats.pct>0?"text-indigo-400":"text-gray-600")}>{stats.pct}%</p>
                              <p className="text-[10px] text-gray-600">{stats.done}/{stats.total}</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={e=>{e.stopPropagation();startEditWeek(w);}}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={e=>{e.stopPropagation();deleteWeek(w.id);}}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {isOpen ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isOpen && (
                          <div className="border-t border-gray-800 px-4 py-3 space-y-3">
                            {w.description && <p className="text-sm text-gray-400">{w.description}</p>}
                            {w.topics && w.topics.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1.5">נושאים:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {w.topics.map((t,i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full">{t}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Per-student completion */}
                            {members.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1.5">מצב חניכים:</p>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {members.map(m => {
                                    const done = progress.find(p => p.week_id === w.id && p.user_id === m.id)?.completed;
                                    return (
                                      <div key={m.id} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs",
                                        done ? "bg-green-500/10 border-green-500/20 text-green-300"
                                             : "bg-gray-800/50 border-gray-700/50 text-gray-500")}>
                                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                          done ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400")}>
                                          {done ? <Check size={9}/> : (m.full_name?.[0] ?? "?")}
                                        </div>
                                        <span className="truncate">{m.full_name ?? "—"}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Edit/Add week form */}
                  {(editingWeek !== null || (editingWeek === null && weeks.length >= 0)) && (
                    <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-5 space-y-4">
                      <p className="text-sm font-semibold text-gray-300">
                        {editingWeek ? `✏️ עריכת שבוע ${editingWeek.week_number}` : `➕ הוסף שבוע ${weeks.length + 1}`}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 mb-1 block">כותרת השבוע *</label>
                          <input value={weekForm.title} onChange={e=>setWeekForm(f=>({...f,title:e.target.value}))}
                            placeholder="לדוגמה: שבוע 1 — CPR והחייאה"
                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 mb-1 block">תיאור</label>
                          <textarea value={weekForm.description} onChange={e=>setWeekForm(f=>({...f,description:e.target.value}))}
                            rows={2} placeholder="מה לומדים השבוע?"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 resize-none" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 mb-1 block">נושאים (שורה לכל נושא)</label>
                          <textarea value={weekForm.topics} onChange={e=>setWeekForm(f=>({...f,topics:e.target.value}))}
                            rows={3} placeholder={"CPR בסיסי\nשימוש בדפיברילטור\nפרוטוקול OHCA"}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 resize-none" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">מבחן מקושר</label>
                          <select value={weekForm.exam_id} onChange={e=>setWeekForm(f=>({...f,exam_id:e.target.value}))}
                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500">
                            <option value="">— ללא —</option>
                            {exams.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">מצגת/אוגדן מקושר</label>
                          <select value={weekForm.notebook_id} onChange={e=>setWeekForm(f=>({...f,notebook_id:e.target.value}))}
                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500">
                            <option value="">— ללא —</option>
                            {notebooks.map(n=><option key={n.id} value={n.id}>{n.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">תאריך יעד</label>
                          <input type="date" value={weekForm.due_date} onChange={e=>setWeekForm(f=>({...f,due_date:e.target.value}))}
                            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveWeek} disabled={saving || !weekForm.title.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                          {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
                          {editingWeek ? "עדכן שבוע" : "הוסף שבוע"}
                        </button>
                        {editingWeek && (
                          <button onClick={()=>{setEditingWeek(null);setWeekForm({title:"",description:"",topics:"",exam_id:"",notebook_id:"",due_date:""}); }}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-xl transition-colors">
                            ביטול
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PROGRESS */}
              {tab === "progress" && (
                <div className="space-y-4">
                  {members.length === 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                      <Users size={32} className="text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">אין חניכים רשומים לקורס זה</p>
                    </div>
                  )}
                  {members.map(m => {
                    const userProgress = progress.filter(p => p.user_id === m.id);
                    const done = userProgress.filter(p => p.completed).length;
                    const pct = weeks.length ? Math.round(done / weeks.length * 100) : 0;
                    const behindWeeks = weeks.filter(w => {
                      const wp = progress.find(p => p.week_id === w.id && p.user_id === m.id);
                      return w.due_date && new Date(w.due_date) < new Date() && !wp?.completed;
                    });
                    return (
                      <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                            {m.full_name?.[0] ?? "?"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-100">{m.full_name ?? "—"}</p>
                              {behindWeeks.length > 0 && (
                                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                                  <AlertCircle size={9}/> {behindWeeks.length} שבועות באיחור
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${pct}%`}} />
                              </div>
                              <span className={cn("text-xs font-bold shrink-0", pct===100?"text-green-400":pct>50?"text-indigo-400":"text-gray-500")}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <div className="text-end shrink-0">
                            <p className="text-sm font-bold text-gray-300">{done}<span className="text-gray-600">/{weeks.length}</span></p>
                            <p className="text-[10px] text-gray-600">שבועות</p>
                          </div>
                        </div>
                        {/* Per-week dots */}
                        <div className="flex gap-1.5 flex-wrap">
                          {weeks.map(w => {
                            const wp = progress.find(p => p.week_id === w.id && p.user_id === m.id);
                            const late = w.due_date && new Date(w.due_date) < new Date() && !wp?.completed;
                            return (
                              <div key={w.id} title={w.title}
                                className={cn("w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center border",
                                  wp?.completed ? "bg-green-500/20 border-green-500/30 text-green-400"
                                  : late ? "bg-red-500/20 border-red-500/30 text-red-400"
                                  : "bg-gray-800 border-gray-700 text-gray-600")}>
                                {wp?.completed ? <Check size={10}/> : w.week_number}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
