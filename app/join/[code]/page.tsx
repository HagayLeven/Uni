"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookOpen, Check, Loader2, X } from "lucide-react";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const router   = useRouter();

  const [status, setStatus]   = useState<"loading" | "found" | "joining" | "done" | "error" | "already">("loading");
  const [course, setCourse]   = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function init() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/auth/login?next=/join/${code}`); return; }

      // Find course
      const { data: c } = await supabase.from("courses").select("id, name, description").eq("code", code.toUpperCase()).eq("active", true).single();
      if (!c) { setStatus("error"); setError("קוד לא קיים או שהקורס אינו פעיל"); return; }
      setCourse(c);

      // Check if already member
      const { data: existing } = await supabase.from("course_members").select("id").eq("course_id", c.id).eq("user_id", user.id).single();
      if (existing) { setStatus("already"); return; }

      setStatus("found");
    }
    init();
  }, [code]);

  const join = async () => {
    if (!course) return;
    setStatus("joining");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("course_members").insert({ course_id: course.id, user_id: user.id, role: "student" });
    await supabase.from("profiles").update({ course_id: course.id }).eq("id", user.id);
    setStatus("done");
    setTimeout(() => router.replace("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-indigo-500/30">
            <img src="/logoowl.jpeg" alt="Uni" className="w-full h-full object-cover object-top" />
          </div>
          <h1 className="text-xl font-bold text-white">הצטרפות לקורס</h1>
        </div>

        {/* States */}
        {status === "loading" && (
          <div className="flex justify-center py-10">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
            <X size={28} className="text-red-400 mx-auto" />
            <p className="text-white font-semibold">קוד שגוי</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        {(status === "found" || status === "joining") && course && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <BookOpen size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{course.name}</p>
                {course.description && <p className="text-sm text-gray-400 mt-0.5">{course.description}</p>}
              </div>
            </div>
            <button onClick={join} disabled={status === "joining"}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {status === "joining" ? <><Loader2 size={16} className="animate-spin" /> מצרף...</> : "הצטרף לקורס"}
            </button>
          </div>
        )}

        {status === "already" && course && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 text-center space-y-3">
            <Check size={28} className="text-blue-400 mx-auto" />
            <p className="text-white font-semibold">כבר מצורף!</p>
            <p className="text-sm text-gray-400">אתה כבר רשום ל{course.name}</p>
            <button onClick={() => router.replace("/dashboard")}
              className="w-full h-10 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-xl transition-colors">
              לדשבורד
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center space-y-2">
            <Check size={32} className="text-green-400 mx-auto" />
            <p className="text-white font-semibold">הצטרפת בהצלחה! 🎉</p>
            <p className="text-sm text-gray-400">מעביר לדשבורד...</p>
          </div>
        )}

      </div>
    </div>
  );
}
