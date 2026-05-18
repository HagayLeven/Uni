"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import {
  BookMarked, Clock, Download, ExternalLink, FileText, Loader2, Layers,
  Megaphone, Paperclip, Plus, Search, X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

type Category = "all" | "notebook" | "directive";

interface Notebook {
  id: string;
  title: string;
  body: string;
  category: "notebook" | "directive";
  file_url?: string | null;
  file_name?: string | null;
  author_id: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "עכשיו";
  if (m < 60) return `לפני ${m} דק'`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש'`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

function FileAttachment({ url, name }: { url: string; name: string }) {
  const isPdf = name.toLowerCase().endsWith(".pdf");
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl">
      <div className={cn("p-2 rounded-lg shrink-0", isPdf ? "bg-red-500/10" : "bg-blue-500/10")}>
        <FileText size={16} className={isPdf ? "text-red-400" : "text-blue-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 truncate">{name}</p>
        <p className="text-xs text-gray-500">{isPdf ? "PDF" : "מסמך"}</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-gray-700 transition-colors" title="פתח">
        <ExternalLink size={15} />
      </a>
      <a href={url} download={name}
        className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors" title="הורד">
        <Download size={15} />
      </a>
    </div>
  );
}

export default function NotebooksPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isAdmin, setIsAdmin]     = useState(false);
  const [userId, setUserId]       = useState<string | null>(null);
  const [category, setCategory]   = useState<Category>("all");
  const [search, setSearch]       = useState("");
  const [open, setOpen]           = useState<Notebook | null>(null);
  const [creating, setCreating]   = useState(false);
  const [form, setForm]           = useState({ title: "", body: "", category: "notebook" as "notebook" | "directive" });
  const [file, setFile]           = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const admin = user?.email === ADMIN_EMAIL;
      if (user) {
        setUserId(user.id);
        setIsAdmin(admin);
      }

      const { data } = await supabase
        .from("notebooks")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });
      setNotebooks((data as any) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = notebooks.filter((n: any) => {
    if (category !== "all" && n.category !== category) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !(n.body ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !userId) return;
    setSaving(true);
    setUploadProgress(0);

    let file_url: string | null = null;
    let file_name: string | null = null;

    // Upload file if selected
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `notebooks/${userId}/${Date.now()}.${ext}`;
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: false });

      if (!uploadError) {
        setUploadProgress(70);
        const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);
        file_url = publicUrl;
        file_name = file.name;
      }
    }

    setUploadProgress(90);
    const { data } = await supabase
      .from("notebooks")
      .insert({
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        author_id: userId,
        file_url,
        file_name,
      })
      .select("*, profiles(full_name)")
      .single();

    if (data) setNotebooks((prev) => [data as any, ...prev]);
    setForm({ title: "", body: "", category: "notebook" });
    setFile(null);
    setCreating(false);
    setSaving(false);
    setUploadProgress(0);
  };

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked size={20} className="text-indigo-400" />
                <h1 className="text-lg font-bold text-white">אוגדנים והוראות שעה</h1>
              </div>
              {isAdmin && (
                <button onClick={() => setCreating(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                  <Plus size={15} /> חדש
                </button>
              )}
            </div>

            {/* Search + filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש..."
                  className="w-full h-10 bg-gray-900 border border-gray-800 rounded-xl pe-9 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              {(["all", "notebook", "directive"] as Category[]).map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={cn("px-3 py-2 rounded-xl text-xs font-medium transition-colors border",
                    category === c ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200")}>
                  {c === "all" ? "הכל" : c === "notebook" ? "אוגדן" : "הוראת שעה"}
                </button>
              ))}
            </div>

            {loading && <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20">
                <BookMarked size={36} className="text-gray-700" />
                <p className="text-gray-500 text-sm">אין מסמכים עדיין</p>
              </div>
            )}

            {/* List */}
            <div className="space-y-3">
              {filtered.map((n) => (
                <button key={n.id} onClick={() => setOpen(n)}
                  className="w-full text-start bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl p-4 space-y-2 transition-colors">
                  <div className="flex items-center gap-2">
                    {n.category === "directive"
                      ? <Megaphone size={13} className="text-yellow-400 shrink-0" />
                      : <FileText size={13} className="text-indigo-400 shrink-0" />}
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium",
                      n.category === "directive" ? "bg-yellow-500/10 text-yellow-400" : "bg-indigo-500/10 text-indigo-400")}>
                      {n.category === "directive" ? "הוראת שעה" : "אוגדן"}
                    </span>
                    {n.file_name && (
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Paperclip size={9} /> {n.file_name}
                      </span>
                    )}
                    <span className="text-xs text-gray-600 me-auto flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-100">{n.title}</h3>
                  {n.body && <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>}
                  <div className="flex items-center gap-2">
                    {n.profiles?.full_name && (
                      <p className="text-[10px] text-gray-600">נוסף ע"י {n.profiles.full_name}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    {n.file_name && (
                      <Link
                        href={`/admin/ai-exam?topic=${encodeURIComponent(n.title)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[11px] font-medium transition-colors border border-purple-500/20">
                        <Sparkles size={11} /> בנה מבחן AI
                      </Link>
                    )}
                    {n.body && (
                      <Link href={`/flashcards/${n.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-medium transition-colors border border-indigo-500/20">
                        <Layers size={11} /> כרטיסיות
                      </Link>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* View modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
              <div className={cn("p-2 rounded-lg", open.category === "directive" ? "bg-yellow-500/10" : "bg-indigo-500/10")}>
                {open.category === "directive" ? <Megaphone size={16} className="text-yellow-400" /> : <FileText size={16} className="text-indigo-400" />}
              </div>
              <h2 className="text-base font-bold text-white flex-1">{open.title}</h2>
              <button onClick={() => setOpen(null)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {open.body && (
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{open.body}</p>
              )}
              {open.file_url && open.file_name && (
                <FileAttachment url={open.file_url} name={open.file_name} />
              )}
              {!open.body && !open.file_url && (
                <p className="text-sm text-gray-600">אין תוכן</p>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-600">
              <Clock size={11} />
              <span>{timeAgo(open.created_at)}</span>
              {open.profiles?.full_name && <span>· {open.profiles.full_name}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {creating && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
              <Plus size={18} className="text-indigo-400" />
              <h2 className="text-base font-bold text-white flex-1">מסמך חדש</h2>
              <button onClick={() => { setCreating(false); setFile(null); }} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-5 py-4 space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2">
                {(["notebook", "directive"] as const).map((c) => (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, category: c }))}
                    className={cn("flex-1 py-2 rounded-xl text-sm font-medium border transition-colors",
                      form.category === c ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400")}>
                    {c === "notebook" ? "📋 אוגדן" : "📣 הוראת שעה"}
                  </button>
                ))}
              </div>

              {/* Title */}
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="כותרת" required
                className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />

              {/* Body */}
              <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="תוכן המסמך (אופציונלי אם יש קובץ מצורף)..." rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />

              {/* File upload */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                    <Paperclip size={15} className="text-indigo-400 shrink-0" />
                    <span className="flex-1 text-sm text-gray-200 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 w-full py-3 border border-dashed border-gray-700 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors justify-center">
                    <Paperclip size={15} />
                    צרף קובץ (PDF, Word, PPT, תמונה...)
                  </button>
                )}
              </div>

              {/* Progress bar while uploading */}
              {saving && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 text-center">מעלה קובץ...</p>
                </div>
              )}

              <button type="submit" disabled={saving || !form.title.trim()}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={16} className="animate-spin" /> מעלה...</> : "פרסם"}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
