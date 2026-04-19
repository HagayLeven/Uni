"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type PostType = "summary" | "note" | "question" | "resource" | "exam_question";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "summary",       label: "סיכום"       },
  { value: "question",      label: "שאלה"        },
  { value: "exam_question", label: "שאלת מבחן"   },
  { value: "resource",      label: "חומר לימודי" },
  { value: "note",          label: "הערה"        },
];

interface Topic { id: string; title: string; }

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<PostType>("summary");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("topics").select("id, title").order("created_at").then(({ data }) => {
      if (data) {
        setTopics(data);
        if (data.length > 0) setTopicId(data[0].id);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("יש להתחבר קודם"); setLoading(false); return; }

    const content = body.trim() ? `${title}\n\n${body}` : title;

    const { error: insertError } = await supabase.from("posts").insert({
      content,
      type,
      author_id: user.id,
      topic_id: topicId || null,
      sensitivity: "safe",
      upvotes: 0,
      downvotes: 0,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onClose();
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl" dir="rtl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">פרסום חדש</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">סוג הפוסט</label>
            <div className="flex gap-2 flex-wrap">
              {POST_TYPES.map((pt) => (
                <button key={pt.value} type="button" onClick={() => setType(pt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                    type === pt.value
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-100",
                  )}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel */}
          {topics.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">ערוץ</label>
              <select value={topicId} onChange={(e) => setTopicId(e.target.value)}
                className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors">
                {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">כותרת</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת ברורה ומתארת..." required minLength={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">תוכן</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="כתוב כאן את הסיכום, השאלה, או ההסבר..." rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
          </div>

          {/* Files */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">קבצים מצורפים</label>
            <input type="file" ref={fileRef} onChange={handleFileChange} multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-500 text-sm transition-colors w-full justify-center">
              <Upload size={15} />
              העלאת קבצים (PDF, תמונות)
            </button>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300">
                    {f.type.includes("pdf") ? <FileText size={13} className="text-red-400 shrink-0" /> : <ImageIcon size={13} className="text-blue-400 shrink-0" />}
                    <span className="flex-1 truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="text-gray-600 hover:text-red-400 transition-colors"><X size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || title.length < 3}
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} />פרסם</>}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 h-11 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors">
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
