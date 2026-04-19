"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Apple, Mail, ArrowLeft, GraduationCap, Check, Loader2 } from "lucide-react";

type Step = "login" | "academic_email" | "profile";

const FACULTIES = [
  "מדעי המחשב", "הנדסת חשמל", "רפואה", "משפטים", "מנהל עסקים",
  "פסיכולוגיה", "כלכלה", "ביולוגיה", "מתמטיקה", "פיזיקה",
];

const UNIVERSITIES = [
  "האוניברסיטה העברית", "אוניברסיטת תל אביב", "אוניברסיטת חיפה",
  "הטכניון", "אוניברסיטת בן גוריון", "אוניברסיטת בר אילן",
  "האוניברסיטה הפתוחה", "אוניברסיטת אריאל",
];

export function AuthFlow() {
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [academicEmail, setAcademicEmail] = useState("");
  const [faculty, setFaculty] = useState("");
  const [university, setUniversity] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // ── Step 1: Social login ───────────────────────────────────────────────────

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const signInWithApple = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const sendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (error) {
      setError(error.message);
    } else {
      setStep("academic_email");
    }
    setLoading(false);
  };

  // ── Step 2: Academic email ─────────────────────────────────────────────────

  const submitAcademicEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (academicEmail && !academicEmail.endsWith(".ac.il")) {
      return setError("יש להזין אימייל אקדמי המסתיים ב-.ac.il");
    }
    setStep("profile");
  };

  // ── Step 3: Profile setup ──────────────────────────────────────────────────

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("שגיאת אימות — נסה שוב"); setLoading(false); return; }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      faculty,
      university,
      academic_email: academicEmail || null,
      xp_points: 0,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.replace("/dashboard");
    }
    setLoading(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden" dir="rtl">

      {/* Background glows */}
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

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {(["login", "academic_email", "profile"] as Step[]).map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              ["login", "academic_email", "profile"].indexOf(step) >= i
                ? "bg-indigo-500" : "bg-gray-800"
            }`} />
          ))}
        </div>

        {/* ── STEP 1: Login ── */}
        {step === "login" && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-white">למד חכם יותר,<br />יחד עם הקורס שלך</h2>
              <p className="text-sm text-gray-500 mt-1.5">הצטרף לאלפי סטודנטים שמשתמשים ב-AI</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 flex flex-col gap-3">

              {/* Social */}
              <button onClick={signInWithGoogle} disabled={loading}
                className="flex items-center justify-center gap-2.5 h-12 w-full bg-white hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-900 transition-all active:scale-[0.98] disabled:opacity-60">
                <GoogleIcon /> המשך עם Google
              </button>
              <button onClick={signInWithApple} disabled={loading}
                className="flex items-center justify-center gap-2.5 h-12 w-full bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60">
                <Apple size={18} /> המשך עם Apple
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">או עם אימייל</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              {/* Email OTP */}
              {!otpSent ? (
                <form onSubmit={sendEmailOtp} className="flex flex-col gap-2.5">
                  <div className="relative">
                    <Mail size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="name@example.com" dir="ltr" required
                      className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button type="submit" disabled={loading || !email}
                    className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowLeft size={16} /> שלח קוד אימות</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="flex flex-col gap-2.5">
                  <p className="text-xs text-gray-400 text-center">קוד נשלח ל-<span className="text-white">{email}</span></p>
                  <input value={otp} onChange={e => { setOtp(e.target.value); setError(""); }}
                    placeholder="000000" dir="ltr" maxLength={6}
                    className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl tracking-[0.4em] text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  <button type="submit" disabled={loading || otp.length < 6}
                    className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={16} /> אמת קוד</>}
                  </button>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">שלח שוב</button>
                </form>
              )}
            </div>
          </>
        )}

        {/* ── STEP 2: Academic Email ── */}
        {step === "academic_email" && (
          <>
            <div>
              <p className="text-xs text-indigo-400 font-medium mb-1">שלב 2 מתוך 3</p>
              <h2 className="text-2xl font-bold text-white">אימות אקדמי</h2>
              <p className="text-sm text-gray-500 mt-1">הזן אימייל אוניברסיטאי לגישה מלאה לתוכן</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6">
              <form onSubmit={submitAcademicEmail} className="flex flex-col gap-4">
                <div className="relative">
                  <GraduationCap size={15} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none" />
                  <input type="email" value={academicEmail} onChange={e => { setAcademicEmail(e.target.value); setError(""); }}
                    placeholder="user@university.ac.il" dir="ltr"
                    className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                {academicEmail.endsWith(".ac.il") && (
                  <div className="flex items-center gap-2 text-xs text-green-400 px-1">
                    <Check size={12} /> אימייל אקדמי תקין
                  </div>
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button type="submit"
                  className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> המשך
                </button>
                <button type="button" onClick={() => setStep("profile")} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-center">
                  דלג — אמת בהמשך מההגדרות
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── STEP 3: Profile Setup ── */}
        {step === "profile" && (
          <>
            <div>
              <p className="text-xs text-indigo-400 font-medium mb-1">שלב 3 מתוך 3</p>
              <h2 className="text-2xl font-bold text-white">הגדרת פרופיל</h2>
              <p className="text-sm text-gray-500 mt-1">ספר לנו עליך כדי להתאים את החוויה</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6">
              <form onSubmit={submitProfile} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">שם מלא</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="ישראל ישראלי" required
                    className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">אוניברסיטה</label>
                  <select value={university} onChange={e => setUniversity(e.target.value)} required
                    className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                    <option value="">בחר אוניברסיטה</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">פקולטה</label>
                  <select value={faculty} onChange={e => setFaculty(e.target.value)} required
                    className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none">
                    <option value="">בחר פקולטה</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button type="submit" disabled={loading || !fullName || !faculty || !university}
                  className="h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={16} /> סיום — כניסה לאפליקציה</>}
                </button>
              </form>
            </div>
          </>
        )}

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
