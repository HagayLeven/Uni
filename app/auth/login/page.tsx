"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode]           = useState<Mode>("signin");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [fullName, setFullName]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const reset = (m: Mode) => { setMode(m); setError(""); setSuccess(""); };

  /* ── Sign In ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("אימייל או סיסמה שגויים");
    else window.location.replace("/dashboard");
    setLoading(false);
  };

  /* ── Sign Up ── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("הסיסמה חייבת להכיל לפחות 6 תווים"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) setError(error.message);
    else setSuccess("✅ נרשמת בהצלחה! כעת תוכל להיכנס.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden" dir="rtl">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-700/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[360px] flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30 flex items-center justify-center text-3xl">
            🦉
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Uni</h1>
            <p className="text-sm text-indigo-400 mt-0.5">פלטפורמת הלמידה של פרמדיקי מד"א</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1">
          <button onClick={() => reset("signin")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signin" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            כניסה
          </button>
          <button onClick={() => reset("signup")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signup" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            הרשמה
          </button>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 flex flex-col gap-4">

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="flex flex-col gap-3">

            {/* Full name — signup only */}
            {mode === "signup" && (
              <div className="relative">
                <User size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="שם מלא" required autoFocus
                  className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="אימייל" dir="ltr" required autoFocus={mode === "signin"}
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
              <input type={showPass ? "text" : "password"}
                value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder={mode === "signup" ? "סיסמה (לפחות 6 תווים)" : "סיסמה"}
                dir="ltr" required minLength={6}
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-10 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-500 hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error   && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-green-400">{success}</p>}

            <button type="submit" disabled={loading}
              className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? <Loader2 size={18} className="animate-spin" /> : mode === "signin" ? "כניסה" : "הרשמה"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-700">
          בהמשך אתה מסכים ל<span className="text-gray-500">תנאי השימוש</span> ו<span className="text-gray-500">מדיניות הפרטיות</span>
        </p>
      </div>
    </div>
  );
}
