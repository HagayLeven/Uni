"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Camera, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDICAL_ROLES = ["פראמדיק", "חובש בכיר", "חובש", "מגיש עזרה ראשונה"];

const STEPS = [
  { id: 1, label: "פרטים אישיים" },
  { id: 2, label: "פרטי קשר" },
  { id: 3, label: "תמונת פרופיל" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // User info
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [medicalRole, setMedicalRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");

      // If already completed → skip to dashboard
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, birth_date, medical_role, avatar_url, onboarding_complete")
        .eq("id", user.id)
        .single();

      if ((p as any)?.onboarding_complete) {
        router.replace("/dashboard");
        return;
      }
      // Pre-fill from existing profile
      if ((p as any)?.full_name) setFullName((p as any).full_name);
      if ((p as any)?.birth_date) setBirthDate((p as any).birth_date);
      if ((p as any)?.medical_role) setMedicalRole((p as any).medical_role);
      if ((p as any)?.avatar_url) { setAvatarUrl((p as any).avatar_url); setAvatarPreview((p as any).avatar_url); }
      setLoading(false);
    }
    init();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("יש לבחור קובץ תמונה בלבד"); return; }
    if (file.size > 5_000_000) { alert("קובץ גדול מדי — מקסימום 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarUrl;
    setUploadingAvatar(true);
    try {
      const ext = avatarFile.name.split(".").pop();
      const path = `avatars/${userId}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      return publicUrl + `?t=${Date.now()}`;
    } catch {
      return avatarUrl;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const canNext = () => {
    if (step === 1) return fullName.trim().length >= 2 && birthDate && medicalRole;
    if (step === 2) return true; // email is pre-filled, read-only
    return true; // avatar optional
  };

  const handleNext = async () => {
    setError("");
    if (step < 3) { setStep(s => (s + 1) as 1 | 2 | 3); return; }
    // Final step — save everything
    setSaving(true);
    try {
      const finalAvatarUrl = await uploadAvatar();
      const { error: err } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName.trim(),
        birth_date: birthDate || null,
        medical_role: medicalRole || null,
        avatar_url: finalAvatarUrl,
        onboarding_complete: true,
      }, { onConflict: "id" });
      if (err) throw err;
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <img src="/logoAmbulance.jpeg" alt="מד״א" className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
        <h1 className="text-xl font-bold text-white">ברוך הבא לסימולטור מד״א</h1>
        <p className="text-sm text-gray-500">מלא את הפרטים הבאים כדי להתחיל</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                step > s.id
                  ? "bg-green-500 border-green-400 text-white"
                  : step === s.id
                  ? "bg-indigo-600 border-indigo-400 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-500"
              )}>
                {step > s.id ? <Check size={16} /> : s.id}
              </div>
              <span className={cn("text-[10px] font-medium", step === s.id ? "text-indigo-400" : "text-gray-600")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("w-10 h-0.5 mb-4 rounded", step > s.id ? "bg-green-500" : "bg-gray-700")} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">

        {/* Step 1 — Personal info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">פרטים אישיים</h2>
              <p className="text-xs text-gray-500">שם מלא, תאריך לידה וסמכות רפואית</p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">שם מלא <span className="text-red-400">*</span></label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="ישראל ישראלי"
                className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">תאריך לידה <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">סמכות רפואית <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {MEDICAL_ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => setMedicalRole(role)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-medium transition-all",
                      medicalRole === role
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-indigo-500/50"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Contact */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">פרטי קשר</h2>
              <p className="text-xs text-gray-500">אימייל ההרשמה שלך</p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">כתובת אימייל</label>
              <input
                value={email}
                readOnly
                className="w-full h-11 bg-gray-800/50 border border-gray-700 rounded-xl px-4 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-600 mt-1 mr-1">האימייל נקבע בעת ההרשמה ולא ניתן לשינוי</p>
            </div>

            {/* Summary of step 1 */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-indigo-400 mb-2">סיכום פרטים</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">שם מלא</span>
                <span className="text-white font-medium">{fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">תאריך לידה</span>
                <span className="text-white font-medium">{birthDate ? new Date(birthDate).toLocaleDateString("he-IL") : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">סמכות</span>
                <span className="text-white font-medium">{medicalRole}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Avatar */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">תמונת פרופיל</h2>
              <p className="text-xs text-gray-500">אופציונלי — ניתן להוסיף גם מאוחר יותר</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Avatar preview */}
              <div
                onClick={() => fileRef.current?.click()}
                className="relative w-28 h-28 rounded-full cursor-pointer group"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500/40" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-800 border-4 border-dashed border-gray-600 flex items-center justify-center">
                    <Camera size={28} className="text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={22} className="text-white" />
                </div>
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:border-indigo-500/50 transition-colors"
              >
                {avatarPreview ? "החלף תמונה" : "בחר תמונה"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

              {avatarPreview && (
                <button onClick={() => { setAvatarPreview(null); setAvatarFile(null); setAvatarUrl(null); }}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors">
                  הסר תמונה
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:border-gray-600 transition-colors"
            >
              <ChevronRight size={16} /> חזור
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canNext() || saving || uploadingAvatar}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              canNext() && !saving
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            )}
          >
            {saving || uploadingAvatar
              ? <><Loader2 size={16} className="animate-spin" /> שומר...</>
              : step === 3
              ? <><Check size={16} /> סיום והכנס למערכת</>
              : <>המשך <ChevronLeft size={16} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
