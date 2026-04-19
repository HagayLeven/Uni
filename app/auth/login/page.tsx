"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";

type Step = "email" | "otp";

export default function AuthPage() {
  const [step, setStep]       = useState<Step>("email");
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  /* ── Step 1: send OTP ── */
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError("שגיאה בשליחת הקוד — נסה שוב");
    } else {
      setStep("otp");
    }
    setLoading(false);
  };

  /* ── Step 2: verify OTP ── */
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });
    if (error) {
      setError("קוד שגוי או שפג תוקפו — נסה שוב");
    } else {
      window.location.replace("/dashboard");
    }
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

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 flex flex-col gap-5">

          {step === "email" ? (
            <>
              <div>
                <h2 className="text-base font-bold text-white">כניסה / הרשמה</h2>
                <p className="text-xs text-gray-400 mt-1">נשלח לך קוד כניסה לאימייל</p>
              </div>

              <form onSubmit={sendOtp} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="האימייל שלך"
                    dir="ltr"
                    required
                    autoFocus
                    className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "שלח קוד כניסה"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div>
                <button
                  onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors"
                >
                  <ArrowLeft size={12} />
                  שנה אימייל
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <h2 className="text-base font-bold text-white">הכנס את הקוד</h2>
                </div>
                <p className="text-xs text-gray-400">
                  שלחנו קוד 6 ספרות ל-<span className="text-indigo-400" dir="ltr">{email}</span>
                </p>
              </div>

              <form onSubmit={verifyOtp} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="000000"
                  dir="ltr"
                  required
                  autoFocus
                  inputMode="numeric"
                  className="w-full h-14 bg-gray-800 border border-gray-700 rounded-xl px-4 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "כניסה"}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  לא קיבלת? שלח שוב
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-700">
          בהמשך אתה מסכים ל<span className="text-gray-500">תנאי השימוש</span> ו<span className="text-gray-500">מדיניות הפרטיות</span>
        </p>
      </div>
    </div>
  );
}
