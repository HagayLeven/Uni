"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function JoinCoursePrompt() {
  const router = useRouter();
  const [code, setCode]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");

    const { data: course } = await supabase
      .from("courses").select("id,name").eq("code", trimmed).eq("active", true).maybeSingle();

    if (!course) {
      setError("קוד לא נמצא. בדוק שוב עם המדריך.");
      setLoading(false);
      return;
    }
    router.push(`/join/${trimmed}`);
  };

  return (
    <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20 shrink-0">
          <BookOpen size={18} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">הצטרף לקורס</p>
          <p className="text-xs text-gray-400 mt-0.5">הזן את קוד ההצטרפות שקיבלת מהמדריך שלך</p>
        </div>
      </div>

      <form onSubmit={handleJoin} className="flex gap-2">
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
          placeholder="קוד הצטרפות (לדוגמה: ABC123)"
          maxLength={10}
          className="flex-1 h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm font-mono text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
        />
        <button type="submit" disabled={loading || !code.trim()}
          className="h-11 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 text-sm shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeft size={14} />}
          הצטרף
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <X size={11} /> {error}
        </p>
      )}
    </div>
  );
}
