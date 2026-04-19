"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ALL_BADGES, Badge, BadgeStats,
  TIER_COLORS, TIER_BORDER, TIER_BG, getEarnedBadges,
} from "@/lib/badges";
import { Lock } from "lucide-react";

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-default",
        earned
          ? `${TIER_BG[badge.tier]} ${TIER_BORDER[badge.tier]}`
          : "bg-gray-800/30 border-gray-800",
        hovered && earned && "scale-105",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Emoji / lock */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
        earned
          ? `bg-gradient-to-br ${TIER_COLORS[badge.tier]} shadow-sm`
          : "bg-gray-700/50",
      )}>
        {earned ? badge.emoji : <Lock size={14} className="text-gray-600" />}
      </div>

      {/* Name */}
      <p className={cn(
        "text-[11px] font-semibold text-center leading-tight",
        earned ? "text-gray-100" : "text-gray-600",
      )}>
        {badge.name}
      </p>

      {/* Tier dot */}
      {earned && (
        <div className={cn(
          "absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-gradient-to-br",
          TIER_COLORS[badge.tier],
        )} />
      )}

      {/* Tooltip on hover */}
      {hovered && (
        <div className="absolute bottom-full mb-2 start-1/2 -translate-x-1/2 z-20 w-40 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-center shadow-xl pointer-events-none" dir="rtl">
          <p className="text-xs font-semibold text-white mb-0.5">{badge.name}</p>
          <p className="text-[10px] text-gray-400">{badge.description}</p>
          {badge.premium && <p className="text-[9px] text-yellow-500 mt-1">✨ פרמיום עתידי</p>}
        </div>
      )}
    </div>
  );
}

export function BadgesPanel({ stats }: { stats: BadgeStats }) {
  const earned = useMemo(() => getEarnedBadges(stats), [stats]);
  const earnedIds = new Set(earned.map((b) => b.id));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-200">העיטורים שלי</p>
        <span className="text-xs text-gray-500">{earned.length}/{ALL_BADGES.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
          style={{ width: `${(earned.length / ALL_BADGES.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ALL_BADGES.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} earned={earnedIds.has(badge.id)} />
        ))}
      </div>
    </div>
  );
}
