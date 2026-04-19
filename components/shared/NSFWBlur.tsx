"use client";

import { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";

type Sensitivity = "safe" | "sensitive" | "nsfw" | "blocked";

interface NSFWBlurProps {
  children: React.ReactNode;
  sensitivity: Sensitivity;
}

const SENSITIVITY_CONFIG = {
  sensitive: {
    label: "תוכן רגיש",
    description: "חומר רפואי / ניתוחי",
    icon: ShieldAlert,
    color: "text-yellow-400",
    borderColor: "border-yellow-600/30",
    bgColor: "bg-yellow-950/20",
    requiresAge: false,
  },
  nsfw: {
    label: "תוכן 18+",
    description: "יש לאשר גיל לצפייה בתוכן זה",
    icon: EyeOff,
    color: "text-red-400",
    borderColor: "border-red-600/30",
    bgColor: "bg-red-950/20",
    requiresAge: true,
  },
  blocked: {
    label: "תוכן חסום",
    description: "תוכן זה הוסר על ידי המערכת",
    icon: ShieldAlert,
    color: "text-gray-500",
    borderColor: "border-gray-700",
    bgColor: "bg-gray-900/50",
    requiresAge: false,
  },
  safe: {
    label: "",
    description: "",
    icon: Eye,
    color: "",
    borderColor: "",
    bgColor: "",
    requiresAge: false,
  },
};

export function NSFWBlur({ children, sensitivity }: NSFWBlurProps) {
  const [revealed, setRevealed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Safe content — render as-is
  if (sensitivity === "safe") return <>{children}</>;

  // Blocked — never reveal
  if (sensitivity === "blocked") {
    const cfg = SENSITIVITY_CONFIG.blocked;
    return (
      <div
        className={`rounded-lg border ${cfg.borderColor} ${cfg.bgColor} px-4 py-3 flex items-center gap-3`}
      >
        <cfg.icon size={16} className={cfg.color} />
        <div>
          <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
        </div>
      </div>
    );
  }

  const cfg = SENSITIVITY_CONFIG[sensitivity];

  if (!revealed) {
    return (
      <div className={`rounded-lg border ${cfg.borderColor} ${cfg.bgColor} p-4`}>
        {/* Blurred preview */}
        <div className="nsfw-blur pointer-events-none select-none" aria-hidden>
          {children}
        </div>

        {/* Overlay */}
        <div className="flex flex-col items-center gap-3 mt-3 text-center">
          <div className={`flex items-center gap-2 ${cfg.color}`}>
            <cfg.icon size={18} />
            <span className="text-sm font-semibold">{cfg.label}</span>
          </div>
          <p className="text-xs text-gray-500">{cfg.description}</p>

          {cfg.requiresAge && !ageConfirmed ? (
            <AgeConfirmGate
              onConfirm={() => {
                setAgeConfirmed(true);
                setRevealed(true);
                // TODO: call POST /community/confirm-age
              }}
            />
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${cfg.borderColor} ${cfg.color} hover:bg-gray-800 text-sm font-medium transition-colors`}
            >
              <Eye size={15} />
              הצג תוכן
            </button>
          )}
        </div>
      </div>
    );
  }

  // Revealed state
  return (
    <div className="relative">
      {children}
      <button
        onClick={() => setRevealed(false)}
        className="flex items-center gap-1.5 mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        <EyeOff size={12} />
        הסתר תוכן
      </button>
    </div>
  );
}

// ─── Age Confirmation Gate ─────────────────────────────────────────────────────

function AgeConfirmGate({ onConfirm }: { onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      <label className="flex items-start gap-2 cursor-pointer text-start">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 accent-indigo-500"
        />
        <span className="text-xs text-gray-400">
          אני מאשר/ת שאני מעל גיל 18 ומבין/ה שמדובר בתוכן רפואי לצרכים לימודיים בלבד
        </span>
      </label>
      <button
        disabled={!checked}
        onClick={onConfirm}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors w-full justify-center"
      >
        <Eye size={15} />
        אישור וצפייה בתוכן
      </button>
    </div>
  );
}
