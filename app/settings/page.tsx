"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  Bell, Camera, Check, ChevronLeft, Eye,
  ExternalLink, GraduationCap, Loader2, Lock,
  Shield, Trash2, User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Section = "profile" | "notifications" | "privacy";

const SECTIONS: { key: Section; icon: React.ElementType; label: string; description: string }[] = [
  { key: "profile",       icon: User,  label: "פרופיל",        description: "שם תצוגה ותמונה" },
  { key: "notifications", icon: Bell,  label: "התראות",        description: "מה ומתי לקבל" },
  { key: "privacy",       icon: Shield, label: "פרטיות ואבטחה", description: "אימייל וסיסמה" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [active, setActive] = useState<Section>("profile");

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur shrink-0">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="text-base font-semibold text-white">הגדרות</h1>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar nav */}
            <nav className="hidden sm:flex flex-col w-56 border-e border-gray-800 p-3 shrink-0 gap-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={cn(
                    "flex items-start gap-3 px-3 py-3 rounded-xl text-start transition-colors",
                    active === s.key
                      ? "bg-indigo-600/20 border border-indigo-600/30"
                      : "hover:bg-gray-800",
                  )}
                >
                  <s.icon size={16} className={cn("mt-0.5 shrink-0", active === s.key ? "text-indigo-400" : "text-gray-500")} />
                  <div>
                    <p className={cn("text-sm font-medium", active === s.key ? "text-indigo-300" : "text-gray-300")}>{s.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{s.description}</p>
                  </div>
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:pb-6">
              {/* Mobile tabs */}
              <div className="sm:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
                {SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border shrink-0 transition-colors",
                      active === s.key
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400",
                    )}
                  >
                    <s.icon size={12} />
                    {s.label}
                  </button>
                ))}
              </div>

              {active === "profile"       && <ProfileSection />}
              {active === "notifications" && <NotificationsSection />}
              {active === "privacy"       && <PrivacySection />}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}

// ─── Profile Section ───────────────────────────────────────────────────────────

const STUDY_TRACKS = [
  "פראמדיק בסיסי", "פראמדיק מתקדם", "EMT",
  "רופא חירום", "נהג אמבולנס", "מנהל תחנה",
];

const MDA_INSTITUTIONS = [
  "מרכז הדרכה ארצי — רמלה",
  "מחוז ירושלים", "מחוז תל אביב", "מחוז חיפה",
  "מחוז צפון", "מחוז דרום", "מחוז שרון",
  "מחוז דן-פת״מ", "מחוז ש״י",
];

function ProfileSection() {
  const [fullName, setFullName]       = useState("");
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null);
  const [faculty, setFaculty]         = useState("");
  const [studyTrack, setStudyTrack]   = useState("");
  const [institution, setInstitution] = useState("");
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [userId, setUserId]           = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, faculty, study_track, institution")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name ?? "");
        setAvatarUrl(data.avatar_url ?? null);
        setFaculty(data.faculty ?? "");
        setStudyTrack((data as any).study_track ?? "");
        setInstitution((data as any).institution ?? "");
      }
    }
    async function loadCommunities() {
      try {
        const { data } = await supabase.from("communities").select("id, name").order("name");
        if (data) setCommunities(data);
      } catch { /* communities table may not exist yet */ }
    }
    load();
    loadCommunities();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, full_name: fullName, faculty, study_track: studyTrack || null, institution: institution || null },
        { onConflict: "id" }
      );
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("שגיאה בהעלאת תמונה — ודא שה-bucket 'avatars' קיים ב-Supabase Storage");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    setAvatarUrl(publicUrl);
    setUploading(false);
  };

  const initials = fullName ? fullName[0] : "?";

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader title="פרופיל" description="המידע הציבורי שלך בקהילה" />

      {/* Avatar */}
      <div className="card p-5 flex items-center gap-5">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -end-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center transition-colors border-2 border-gray-900"
          >
            {uploading ? <Loader2 size={13} className="animate-spin text-white" /> : <Camera size={13} className="text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-200">תמונת פרופיל</p>
          <p className="text-xs text-gray-500 mt-0.5">JPG, PNG עד 5MB</p>
          <button onClick={() => fileRef.current?.click()}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            החלף תמונה
          </button>
        </div>
      </div>

      {/* Name + Community */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">שם תצוגה</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="השם שלך"
            className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
            <GraduationCap size={12} /> קהילה / יחידה
          </label>
          <select
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
          >
            <option value="">בחר קהילה...</option>
            {communities.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">מסלול לימוד</label>
          <select
            value={studyTrack}
            onChange={(e) => setStudyTrack(e.target.value)}
            className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
          >
            <option value="">בחר מסלול...</option>
            {STUDY_TRACKS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">תחנת / מחוז מד"א</label>
          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
          >
            <option value="">בחר תחנה...</option>
            {MDA_INSTITUTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !fullName.trim()}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> :
           saved  ? <><Check size={16} /> נשמר!</> : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
}

// ─── Privacy Section ────────────────────────────────────────────────────────────

function PrivacySection() {
  const [section, setSection] = useState<"menu" | "email" | "password">("menu");

  if (section === "email")    return <ChangeEmailForm onBack={() => setSection("menu")} />;
  if (section === "password") return <ChangePasswordForm onBack={() => setSection("menu")} />;

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader title="פרטיות ואבטחה" description="שמור על החשבון שלך" />
      <div className="card divide-y divide-gray-800">
        <PrivacyRow icon={Lock}        label="שינוי אימייל"          onClick={() => setSection("email")} />
        <PrivacyRow icon={Shield}      label="שינוי סיסמה"           onClick={() => setSection("password")} />
        <PrivacyRow icon={Eye}         label="מי רואה את הפרופיל שלי" />
        <PrivacyRow icon={ExternalLink} label="אפליקציות מחוברות"    />
      </div>
      <div className="card p-5 border-red-900/40 bg-red-950/10">
        <p className="text-sm font-semibold text-red-400 mb-1">אזור מסוכן</p>
        <p className="text-xs text-gray-500 mb-4">פעולות אלו אינן הפיכות</p>
        <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
          <Trash2 size={14} /> מחיקת החשבון
        </button>
      </div>
    </div>
  );
}

function ChangeEmailForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <SectionHeader title="שינוי אימייל" description="נשלח אימייל אימות לכתובת החדשה" />
      </div>

      {done ? (
        <div className="card p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={24} className="text-green-400" />
          </div>
          <p className="text-sm font-semibold text-white">נשלח אימייל אימות</p>
          <p className="text-xs text-gray-400">לחץ על הקישור ב-{email} כדי לאשר את השינוי</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">אימייל חדש</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              dir="ltr"
              required
              className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "שלח אימות"}
          </button>
        </form>
      )}
    </div>
  );
}

function ChangePasswordForm({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("הסיסמאות לא תואמות"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <SectionHeader title="שינוי סיסמה" description="בחר סיסמה חזקה עם לפחות 6 תווים" />
      </div>

      {done ? (
        <div className="card p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={24} className="text-green-400" />
          </div>
          <p className="text-sm font-semibold text-white">הסיסמה עודכנה בהצלחה</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">סיסמה חדשה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="לפחות 6 תווים"
              dir="ltr"
              required
              minLength={6}
              className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">אימות סיסמה</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="חזור על הסיסמה"
              dir="ltr"
              required
              minLength={6}
              className="w-full h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "עדכן סיסמה"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Notifications Section ──────────────────────────────────────────────────────

function NotificationsSection() {
  const items = [
    { label: "עליות על פוסט שלי",    defaultOn: true  },
    { label: "תגובות על פוסטים שלי", defaultOn: true  },
    { label: "תשובה שאושרה",          defaultOn: true  },
    { label: "עיטורים חדשים",         defaultOn: false },
    { label: "עדכוני מערכת",          defaultOn: false },
  ];
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.label, i.defaultOn]))
  );

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader title="התראות" description="בחר אילו התראות לקבל" />
      <div className="card divide-y divide-gray-800">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-gray-200">{item.label}</span>
            <button
              onClick={() => setOn((s) => ({ ...s, [item.label]: !s[item.label] }))}
              className={cn("w-11 h-6 rounded-full transition-colors relative", on[item.label] ? "bg-indigo-600" : "bg-gray-700")}
            >
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                on[item.label] ? "start-0.5" : "end-0.5")} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared ─────────────────────────────────────────────────────────────────────

function PrivacyRow({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-5 py-4 hover:bg-gray-800/30 transition-colors text-start">
      <Icon size={16} className="text-gray-500 shrink-0" />
      <span className="flex-1 text-sm text-gray-200">{label}</span>
      <ChevronLeft size={14} className="text-gray-600" />
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
  );
}
