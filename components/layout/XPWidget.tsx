"use client";

import { Award, Flame, Star, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniCharacter } from "@/components/uni/UniCharacter";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Badge {
  id: string;
  name: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "legendary";
  earned: boolean;
}

const BADGE_TIER_COLORS = {
  bronze:    "text-orange-600",
  silver:    "text-gray-400",
  gold:      "text-yellow-400",
  platinum:  "text-cyan-300",
  legendary: "text-purple-400",
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

const mockXP = {
  total: 1240,
  level: 3,
  label: "Junior",
  nextLevelXP: 1500,
  streak: 7,
  rank: 42,
};

const mockBadges: Badge[] = [
  { id: "1", name: "העלאה ראשונה",   icon: "📄", tier: "bronze",    earned: true  },
  { id: "2", name: "מומחה תשובות",   icon: "💡", tier: "silver",    earned: true  },
  { id: "3", name: "עוזר הקהילה",    icon: "🤝", tier: "gold",      earned: false },
  { id: "4", name: "מלגאי אגדי",     icon: "👑", tier: "legendary", earned: false },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function XPWidget() {
  const progress = Math.round((mockXP.total / mockXP.nextLevelXP) * 100);

  return (
    <div className="space-y-4">
      {/* XP Card */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap size={16} />
            <span className="text-sm font-semibold">ניקוד XP</span>
          </div>
          <span className="text-xs text-gray-500">רמה {mockXP.level}</span>
        </div>

        {/* Level label */}
        <div className="text-center py-2 flex flex-col items-center gap-2">
          <UniCharacter pose={mockXP.total >= 1000 ? "joyful" : "calm"} size={52} />
          <p className="text-3xl font-bold text-white">{mockXP.total.toLocaleString("he-IL")}</p>
          <p className="text-sm text-indigo-400 font-medium mt-1">{mockXP.label}</p>
        </div>

        {/* XP Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{mockXP.total} XP</span>
            <span>{mockXP.nextLevelXP} XP לרמה הבאה</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full xp-bar rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={16} className="text-orange-400" />}
          label="סטריק"
          value={`${mockXP.streak} ימים`}
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-green-400" />}
          label="דירוג"
          value={`#${mockXP.rank}`}
        />
      </div>

      {/* Badges */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={15} className="text-yellow-400" />
          <span className="text-sm font-semibold text-gray-300">עיטורים</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mockBadges.map((badge) => (
            <div
              key={badge.id}
              title={badge.name}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                badge.earned
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-900/50 border-gray-800 opacity-40 grayscale",
              )}
            >
              <span className="text-xl leading-none">{badge.icon}</span>
              <span
                className={cn(
                  "text-[9px] font-medium leading-tight text-center",
                  BADGE_TIER_COLORS[badge.tier],
                )}
              >
                {badge.tier}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Premium upsell */}
      <div className="card p-4 bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-800">
        <div className="flex items-center gap-2 mb-2">
          <Star size={15} className="text-yellow-400" />
          <span className="text-sm font-semibold text-indigo-300">תכונות פרימיום</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          הגע ל-1,500 XP לפתיחת סימולציית מבחן מלאה
        </p>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
            style={{ width: `${Math.min((mockXP.total / 1500) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-end">
          {Math.max(0, 1500 - mockXP.total)} XP נותרו
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-3 flex flex-col items-center gap-1">
      {icon}
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
