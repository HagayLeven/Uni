"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Apple, Loader2, Mail, Lock, User } from "lucide-react";

type Mode = "signin" | "signup";

const FACULTIES = [
  "פראמדיקים",
  "מדעי המחשב", "הנדסת חשמל", "רפואה", "משפטים", "מנהל עסקים",
  "פסיכולוגיה", "כלכלה", "ביולוגיה", "מתמטיקה", "הנדסה אזרחית",
];

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const handleAppleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("אימייל או סיסמה שגויים");
    } else {
      window.location.replace("/dashboard");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, faculty },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("נשלח אימייל אימות — בדוק את תיבת הדואר שלך!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden" dir="rtl">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-700/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[360px] flex flex-col gap-6">

        {/* Logo */}
        <div className="flex items-center gap-3" dir="ltr">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">UniNexus</span>
            <p className="text-[11px] text-indigo-400 leading-none mt-0.5">רשת הלמידה האקדמית</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1">
          <button
            onClick={() => { setMode("signin"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "signin" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "signup" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 flex flex-col gap-4">

          {/* Social */}
          <div className="flex flex-col gap-2.5">
            <button onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2.5 h-12 w-full bg-white hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-900 transition-all active:scale-[0.98]">
              <GoogleIcon />
              {mode === "signin" ? "כניסה עם Google" : "הרשמה עם Google"}
            </button>
            <button onClick={handleAppleLogin}
              className="flex items-center justify-center gap-2.5 h-12 w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]">
              <Apple size={18} />
              {mode === "signin" ? "כניסה עם Apple" : "הרשמה עם Apple"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">או עם אימייל</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="flex flex-col gap-3">

            {mode === "signup" && (
              <div className="relative">
                <User size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="שם מלא" required
                  className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="אימייל" dir="ltr" required
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="סיסמה" dir="ltr" required minLength={6}
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>

            {mode === "signup" && (
              <select value={faculty} onChange={e => setFaculty(e.target.value)} required
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                <option value="">בחר פקולטה</option>
                {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-green-400">{success}</p>}

            <button type="submit" disabled={loading}
              className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? <Loader2 size={18} className="animate-spin" /> :
                mode === "signin" ? "Sign In" : "Sign Up"}
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
