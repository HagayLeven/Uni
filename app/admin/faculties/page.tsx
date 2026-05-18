"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Check, Loader2,
  Plus, X,
  Building2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

const FALLBACK_INSTITUTIONS = [
  "אשדוד",
  "אשקלון",
  "קרית גת",
  "גן יבנה",
  "שדרות",
  "קרית מלאכי",
  "יד בנימין",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function loadSetting(key: string, fallback: string[]): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single();
    if (data?.value && Array.isArray(data.value)) return data.value as string[];
  } catch {}
  return fallback;
}

async function saveSetting(key: string, value: string[]) {
  await supabase
    .from("app_settings")
    .upsert({ key, value }, { onConflict: "key" });
}

// ─── SettingsListEditor ────────────────────────────────────────────────────────

function SettingsListEditor({
  title, icon: Icon, settingKey, fallback, color,
}: {
  title: string;
  icon: any;
  settingKey: string;
  fallback: string[];
  color: string;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSetting(settingKey, fallback).then((v) => { setItems(v); setLoading(false); });
  }, [settingKey]);

  const addItem = async () => {
    const val = newItem.trim();
    if (!val || items.includes(val)) return;
    setSaving(true);
    const next = [...items, val];
    await saveSetting(settingKey, next);
    setItems(next);
    setNewItem("");
    setAdding(false);
    setSaving(false);
  };

  const removeItem = async (item: string) => {
    const next = items.filter((i) => i !== item);
    await saveSetting(settingKey, next);
    setItems(next);
    setConfirmDel(null);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className={color} />
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <button
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors"
        >
          <Plus size={12} /> הוסף
        </button>
      </div>

      {adding && (
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") { setAdding(false); setNewItem(""); } }}
            placeholder={`שם ${title === "מסלולי לימוד" ? "המסלול" : "התחנה"}...`}
            className="flex-1 h-9 bg-gray-800 border border-indigo-500/60 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
          <button onClick={addItem} disabled={saving || !newItem.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin text-white" /> : <Check size={14} className="text-white" />}
          </button>
          <button onClick={() => { setAdding(false); setNewItem(""); }}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 rounded-xl skeleton-shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item} className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700">
              <div className={`w-2 h-2 rounded-full shrink-0 ${color.replace("text-", "bg-")}`} />
              <span className="flex-1 text-xs text-gray-200 truncate">{item}</span>
              {confirmDel === item ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => removeItem(item)} className="text-red-400 hover:text-red-300 text-[10px] font-bold">מחק</button>
                  <button onClick={() => setConfirmDel(null)} className="text-gray-500 hover:text-gray-300 text-[10px]">לא</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDel(item)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminFacultiesPage() {
  return (
    <div className="space-y-8 max-w-4xl" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">ניהול תחנות</h1>
        <p className="text-sm text-gray-500 mt-1">תחנות מד"א</p>
      </div>

      {/* Institutions CRUD */}
      <SettingsListEditor
        title="תחנות מד״א"
        icon={Building2}
        settingKey="institutions"
        fallback={FALLBACK_INSTITUTIONS}
        color="text-teal-400"
      />
    </div>
  );
}
