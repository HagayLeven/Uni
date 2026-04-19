// ─── Level definitions ─────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  name: string;
  color: string;
  bg: string;
  border: string;
  minXp: number;
  maxXp: number;
  progress: number; // 0–100
  xpToNext: number;
}

const LEVELS = [
  { level: 1,  name: "טירון",          color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/30",   minXp: 0    },
  { level: 2,  name: "מתחיל",          color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30",  minXp: 50   },
  { level: 3,  name: "חניך",           color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/30",  minXp: 150  },
  { level: 4,  name: "פראמדיק שדה",   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   minXp: 300  },
  { level: 5,  name: "פראמדיק מנוסה", color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",   minXp: 500  },
  { level: 6,  name: "בכיר",           color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", minXp: 800  },
  { level: 7,  name: "מוביל צוות",     color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", minXp: 1200 },
  { level: 8,  name: "מומחה",          color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", minXp: 1800 },
  { level: 9,  name: "אלוף",           color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", minXp: 2500 },
  { level: 10, name: "אגדה",           color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30",    minXp: 3500 },
];

export function getLevel(xp: number): LevelInfo {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) { idx = i; break; }
  }

  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;

  const maxXp = next?.minXp ?? current.minXp + 1000;
  const progress = next
    ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100;
  const xpToNext = next ? next.minXp - xp : 0;

  return {
    ...current,
    maxXp,
    progress,
    xpToNext,
  };
}

// XP awarded per action
export const XP_VALUES = {
  post:         20,
  comment:       5,
  upvote:        5,
  daily_login:  10,
  streak_7:     25,  // bonus at 7-day streak
  streak_30:    50,  // bonus at 30-day streak
};
