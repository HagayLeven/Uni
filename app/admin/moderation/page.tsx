"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Eye, EyeOff, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type SensitivityType = "nsfw" | "spam" | "harassment" | "misinformation";

interface FlaggedItem {
  id: string;
  type: "post" | "comment";
  title: string;
  author: string;
  course: string;
  reportCount: number;
  sensitivity: SensitivityType;
  aiConfidence: number;
  reportedAt: string;
  preview: string;
}

const SENSITIVITY_CONFIG: Record<SensitivityType, { label: string; color: string }> = {
  nsfw:           { label: "NSFW",          color: "text-red-400 bg-red-500/10 border-red-500/30"      },
  spam:           { label: "ספאם",          color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  harassment:     { label: "הטרדה",         color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  misinformation: { label: "מידע שגוי",     color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
};

const MOCK_FLAGS: FlaggedItem[] = [
  {
    id: "1", type: "post",
    title: "תמונות מניתוח לא מסומנות כרגיש",
    author: "user_anon_44", course: "אנטומיה — MED301",
    reportCount: 5, sensitivity: "nsfw", aiConfidence: 0.94,
    reportedAt: "לפני 10 דקות",
    preview: "צירפתי תמונות מהניתוח של אתמול...",
  },
  {
    id: "2", type: "comment",
    title: "תגובה פוגענית כלפי משתמש אחר",
    author: "dan.k@gmail.com", course: "אלגברה — 20581",
    reportCount: 3, sensitivity: "harassment", aiConfidence: 0.81,
    reportedAt: "לפני 25 דקות",
    preview: "את לא מבינה כלום, תלכי תלמדי בסיסי...",
  },
  {
    id: "3", type: "post",
    title: "שיתוף 'סיכום' שהוא בעצם פרסומת",
    author: "promo_bot_2", course: "מבוא למחשב — 20441",
    reportCount: 8, sensitivity: "spam", aiConfidence: 0.97,
    reportedAt: "לפני שעה",
    preview: "הי כולם! יש לי את הסיכום הכי טוב + קישור לאתר...",
  },
  {
    id: "4", type: "post",
    title: "שאלת מבחן עם תשובות שגויות",
    author: "student_x99", course: "חשבון — 20407",
    reportCount: 2, sensitivity: "misinformation", aiConfidence: 0.72,
    reportedAt: "לפני 3 שעות",
    preview: "שאלה 4: התשובה היא C כי... (לא מדויק)",
  },
];

export default function AdminModerationPage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const active = MOCK_FLAGS.filter((f) => !dismissed.has(f.id) && !resolved.has(f.id));

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">תור מודרציה</h1>
          <p className="text-sm text-gray-500 mt-1">{active.length} פריטים ממתינים לבדיקה</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          AI Moderation פעיל
        </div>
      </div>

      {active.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-white">הכל נקי!</p>
          <p className="text-sm text-gray-500 mt-1">אין פריטים ממתינים לבדיקה כרגע</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((item) => {
            const cfg = SENSITIVITY_CONFIG[item.sensitivity];
            return (
              <div key={item.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", cfg.color)}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-500">{item.type === "post" ? "פוסט" : "תגובה"}</span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{item.course}</span>
                    </div>

                    {/* Title */}
                    <p className="font-semibold text-gray-100">{item.title}</p>

                    {/* Preview */}
                    <p className="text-sm text-gray-400 line-clamp-2">{item.preview}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={11} className="text-red-400" />
                        {item.reportCount} דיווחים
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        AI: {Math.round(item.aiConfidence * 100)}% ביטחון
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {item.reportedAt}
                      </span>
                      <span>מאת: {item.author}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setResolved((s) => new Set([...s, item.id]))}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 text-sm font-medium rounded-xl transition-colors"
                    >
                      <XCircle size={15} />
                      הסר תוכן
                    </button>
                    <button
                      onClick={() => {}}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-600/30 text-yellow-400 text-sm font-medium rounded-xl transition-colors"
                    >
                      <EyeOff size={15} />
                      טשטש תוכן
                    </button>
                    <button
                      onClick={() => setDismissed((s) => new Set([...s, item.id]))}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 text-sm font-medium rounded-xl transition-colors"
                    >
                      <CheckCircle size={15} />
                      אשר — תקין
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
