"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookMarked, ClipboardList, GraduationCap, MessageSquare, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: "🦉",
    emoji: true,
    title: "ברוכים הבאים ל-Uni!",
    subtitle: "הפלטפורמה ללימוד רפואת חירום",
    body: "כאן תמצא את כל החומרים, המבחנים וההתקדמות שלך במקום אחד. בוא נכיר את הפלטפורמה.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: GraduationCap,
    title: "הקורס שלי",
    subtitle: "תוכן מותאם אישית",
    body: "המדריך שלך ישייך אותך לקורס. משם תוכל לראות את השבועות, לסמן שיעורים כהושלמו ולעקוב אחר ההתקדמות.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: BookMarked,
    title: "אוגדנים",
    subtitle: "חומרי לימוד וסיכומים",
    body: "כל האוגדנים, הוראות השעה והמסמכים נמצאים כאן. אפשר גם ליצור כרטיסיות לימוד מכל אוגדן!",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: ClipboardList,
    title: "מבחנים",
    subtitle: "בחן את עצמך",
    body: "מבחנים עם ניקוד, תשובות נכונות ומעקב אחר ציוניך לאורך הקורס.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: MessageSquare,
    title: "פיד הקהילה",
    subtitle: "למד יחד עם החניכים שלך",
    body: "שתף סיכומים, שאל שאלות ועזור לאחרים. התוכן מסונן לפי הקהילה שלך.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
];

interface Props {
  userId: string;
  onClose: () => void;
}

export function OnboardingModal({ userId, onClose }: Props) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const isFirst = step === 0;

  const finish = async () => {
    await supabase.from("profiles").update({ onboarding_done: true }).eq("id", userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" dir="rtl">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-4xl", current.bg)}>
            {current.emoji ? (
              <span>{current.icon as string}</span>
            ) : (
              <current.icon size={28} className={current.color} />
            )}
          </div>

          {/* Text */}
          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", current.color)}>
              {current.subtitle}
            </p>
            <h2 className="text-lg font-bold text-white">{current.title}</h2>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{current.body}</p>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={cn("w-2 h-2 rounded-full transition-colors",
                  i === step ? "bg-indigo-400" : "bg-gray-700 hover:bg-gray-600")} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <button onClick={finish}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            דלג
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors">
                <ChevronRight size={15} /> הקודם
              </button>
            )}
            {isLast ? (
              <button onClick={finish}
                className="flex items-center gap-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
                בוא נתחיל! 🚀
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                הבא <ChevronLeft size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
