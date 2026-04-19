"use client";

import { cn } from "@/lib/utils";

export type UniPose =
  | "core"        // Core Avatar — avatar ראשי, ברכות
  | "focused"     // Focused Analysis — טיפול בשאלות, ניתוח
  | "calm"        // Calm Instruction — הסברים, לימוד
  | "joyful"      // Joyful Success — תשובה נכונה, הישג, ניצחון
  | "compassion"  // Deep Compassion — שגיאה, עידוד
  | "sleeping";   // Sleeping — טעינה, המתנה

interface UniCharacterProps {
  pose?: UniPose;
  size?: number;
  animate?: boolean;
  className?: string;
}

// Fallback emoji per pose (used until image files are added)
const POSE_EMOJI: Record<UniPose, string> = {
  core:       "🦉",
  focused:    "🦉",
  calm:       "🦉",
  joyful:     "🦉",
  compassion: "🦉",
  sleeping:   "🦉",
};

// Animation per pose
const POSE_ANIMATION: Record<UniPose, string> = {
  core:       "",
  focused:    "",
  calm:       "animate-pulse",
  joyful:     "animate-bounce",
  compassion: "",
  sleeping:   "animate-pulse",
};

export function UniCharacter({ pose = "core", size = 40, animate = false, className }: UniCharacterProps) {
  const src = `/uni/${pose}.png`;

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center select-none overflow-hidden",
        "bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500",
        "shadow-lg shadow-indigo-500/30",
        animate && POSE_ANIMATION[pose],
        className
      )}
    >
      <img
        src={src}
        alt={`Uni — ${pose}`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to emoji if image not found
          const el = e.currentTarget;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent && !parent.querySelector(".uni-emoji")) {
            const span = document.createElement("span");
            span.className = "uni-emoji text-2xl";
            span.textContent = POSE_EMOJI[pose];
            span.style.fontSize = `${size * 0.55}px`;
            parent.appendChild(span);
          }
        }}
      />
    </div>
  );
}
