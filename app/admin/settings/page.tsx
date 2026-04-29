"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Settings, Save, Loader2, Check, RefreshCw, Shield,
  BookOpen, Users, Bell, Zap, ToggleLeft, ToggleRight,
} from "lucide-react";

interface AppSettings {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const DEFAULT_SETTINGS = [
  { key: "registration_open",   value: "true",  description: "אפשר הרשמה חדשה לאתר" },
  { key: "feed_enabled",        value: "true",  description: "הפעל את הפיד הראשי" },
  { key: "exams_enabled",       value: "true",  description: "הפעל מבחנים" },
  { key: "notebooks_enabled",   value: "true",  description: "הפעל אוגדנים" },
  { key: "notifications_enabled", value: "true", description: "שלח התראות" },
  { key: "site_name",           value: "Uni",   description: "שם האתר" },
  { key: "welcome_message",     value: "ברוכים הבאים ל-Uni 🦉", description: "הודעת ברוכים הבאים" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);
  const [saved, setSaved]       = useState<string | null>(null);
  const [stats, setStats]       = useState({ users: 0, courses: 0, exams: 0, posts: 0 });

  useEffect(() => {
    async function load() {
      // Load settings
      const { data } = await supabase.from("app_settings").select("*").order("key");

      // Merge with defaults — add any missing keys
      const existing = (data as AppSettings[]) ?? [];
      const existingKeys = new Set(existing.map(s => s.key));
      const missing = DEFAULT_SETTINGS.filter(d => !existingKeys.has(d.key));

      if (missing.length) {
        await supabase.from("app_settings").insert(
          missing.map(m => ({ key: m.key, value: m.value, description: m.description }))
        );
        const { data: refreshed } = await supabase.from("app_settings").select("*").order("key");
        setSettings((refreshed as AppSettings[]) ?? []);
      } else {
        setSettings(existing);
      }

      // Stats
      const [{ count: users }, { count: courses }, { count: exams }, { count: posts }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("exams").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
      ]);
      setStats({ users: users ?? 0, courses: courses ?? 0, exams: exams ?? 0, posts: posts ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  const updateSetting = async (id: string, key: string, newValue: string) => {
    setSaving(key);
    await supabase.from("app_settings").update({ value: newValue }).eq("id", id);
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value: newValue } : s));
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  };

  const toggleBool = (s: AppSettings) => {
    const newVal = s.value === "true" ? "false" : "true";
    updateSetting(s.id, s.key, newVal);
  };

  const boolSettings = settings.filter(s => s.value === "true" || s.value === "false");
  const textSettings = settings.filter(s => s.value !== "true" && s.value !== "false");

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">הגדרות מערכת</h1>
        <p className="text-sm text-gray-500 mt-1">ניהול הגדרות כלליות של האפליקציה</p>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "משתמשים", value: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "קורסים",  value: stats.courses, icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "מבחנים",  value: stats.exams, icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "פוסטים",  value: stats.posts, icon: Bell, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <s.icon size={14} className={`${s.color} mb-2`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
      ) : (
        <div className="space-y-5">
          {/* Toggle settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/40">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">הפעלה / כיבוי</p>
            </div>
            <div className="divide-y divide-gray-800/60">
              {boolSettings.map((s) => {
                const on = s.value === "true";
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-100">{s.description ?? s.key}</p>
                      <p className="text-xs text-gray-600 mt-0.5 font-mono">{s.key}</p>
                    </div>
                    <button onClick={() => toggleBool(s)} disabled={saving === s.key}
                      className="flex items-center gap-2 transition-opacity">
                      {saving === s.key ? (
                        <Loader2 size={18} className="animate-spin text-indigo-400" />
                      ) : saved === s.key ? (
                        <Check size={18} className="text-green-400" />
                      ) : on ? (
                        <ToggleRight size={28} className="text-indigo-400" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-600" />
                      )}
                      <span className={`text-xs font-medium ${on ? "text-indigo-400" : "text-gray-600"}`}>
                        {on ? "פעיל" : "כבוי"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Text settings */}
          {textSettings.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/40">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">טקסטים</p>
              </div>
              <div className="divide-y divide-gray-800/60">
                {textSettings.map((s) => (
                  <div key={s.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-100">{s.description ?? s.key}</p>
                      <p className="text-xs text-gray-600 font-mono">{s.key}</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        defaultValue={s.value}
                        onBlur={(e) => {
                          if (e.target.value !== s.value) updateSetting(s.id, s.key, e.target.value);
                        }}
                        className="flex-1 h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                      />
                      {saved === s.key && <Check size={16} className="text-green-400 self-center" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <Shield size={14} /> אזור מסוכן
            </p>
            <p className="text-xs text-gray-500">פעולות בלתי הפיכות — יש לבצע בזהירות</p>
            <button
              onClick={async () => {
                if (!confirm("לאפס את כל הגדרות ברירת המחדל?")) return;
                for (const d of DEFAULT_SETTINGS) {
                  const s = settings.find(x => x.key === d.key);
                  if (s) await supabase.from("app_settings").update({ value: d.value }).eq("id", s.id);
                }
                const { data } = await supabase.from("app_settings").select("*").order("key");
                setSettings((data as AppSettings[]) ?? []);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 text-sm rounded-xl transition-colors">
              <RefreshCw size={13} /> אפס הגדרות לברירת מחדל
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
