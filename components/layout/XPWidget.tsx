"use client";

import { useEffect, useState } from "react";
import { Award, Flame, TrendingUp, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniCharacter } from "@/components/uni/UniCharacter";
import { supabase } from "@/lib/supabase";
import { getLevel } from "@/lib/xp";
import { ALL_BADGES, BadgeStats } from "@/lib/badges";
import { XP_VALUES } from "@/lib/xp";

export function XPWidget() {
  const [xp, setXp]             = useState(0);
  const [streak, setStreak]     = useState(0);
  const [rank, setRank]         = useState<number | null>(null);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp_override, bonus_xp, login_streak, longest_streak")
        .eq("id", user.id)
        .single();

      // Posts count
      const { count: posts } = await supabase
        .from("posts").select("*", { count: "exact", head: true })
        .eq("author_id", user.id).eq("is_announcement", false);

      // Comments count
      const { count: comments } = await supabase
        .from("comments").select("*", { count: "exact", head: true })
        .eq("author_id", user.id);

      // Upvotes received
      const { data: myPosts } = await supabase
        .from("posts").select("id").eq("author_id", user.id);
      const postIds = (myPosts ?? []).map((p: any) => p.id);
      let upvotes = 0;
      if (postIds.length) {
        const { count } = await supabase
          .from("votes").select("*", { count: "exact", head: true })
          .in("post_id", postIds).eq("value", 1);
        upvotes = count ?? 0;
      }

      const bonus = profile?.bonus_xp ?? 0;
      const calculatedXp = profile?.xp_override != null
        ? profile.xp_override
        : (posts ?? 0) * XP_VALUES.post + (comments ?? 0) * XP_VALUES.comment + upvotes * XP_VALUES.upvote + bonus;

      setXp(calculatedXp);
      setStreak(profile?.login_streak ?? 0);
      setBadgeStats({
        xp: calculatedXp,
        posts: posts ?? 0,
        comments: comments ?? 0,
        upvotes_received: upvotes,
        login_streak: profile?.login_streak ?? 0,
        longest_streak: profile?.longest_streak ?? 0,
      });

      // Rank — count users with more XP
      const { data: allProfiles } = await supabase
        .from("profiles").select("id, xp_override, bonus_xp");
      if (allProfiles) {
        const sorted = allProfiles
          .map((p: any) => p.xp_override != null ? p.xp_override : (p.bonus_xp ?? 0))
          .sort((a: number, b: number) => b - a);
        setRank(sorted.findIndex((x: number) => x <= calculatedXp) + 1);
      }

      setLoading(false);
    }
    load();
  }, []);

  const level = getLevel(xp);
  const earnedBadges = badgeStats ? ALL_BADGES.filter(b => b.condition(badgeStats)) : [];
  const displayBadges = ALL_BADGES.slice(0, 4);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="card p-4 h-48 bg-gray-900" />
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 h-20 bg-gray-900" />
        <div className="card p-3 h-20 bg-gray-900" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* XP Card */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap size={16} />
            <span className="text-sm font-semibold">ניקוד XP</span>
          </div>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", level.color, level.bg, level.border)}>
            {level.name}
          </span>
        </div>

        <div className="text-center py-2 flex flex-col items-center gap-2">
          <UniCharacter pose={xp >= 1000 ? "joyful" : "calm"} size={52} />
          <p className="text-3xl font-bold text-white">{xp.toLocaleString("he-IL")}</p>
          <p className="text-xs text-gray-500">רמה {level.level}</p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{xp} XP</span>
            {level.xpToNext > 0
              ? <span>עוד {level.xpToNext} XP לרמה {level.level + 1}</span>
              : <span className="text-yellow-400">רמה מקסימלית!</span>
            }
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={16} className="text-orange-400" />}
          label="סטריק"
          value={`${streak} ימים`}
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-green-400" />}
          label="דירוג"
          value={rank ? `#${rank}` : "—"}
        />
      </div>

      {/* Badges */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={15} className="text-yellow-400" />
          <span className="text-sm font-semibold text-gray-300">עיטורים</span>
          <span className="text-xs text-gray-600 me-auto">{earnedBadges.length}/{ALL_BADGES.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {displayBadges.map((badge) => {
            const earned = badgeStats ? badge.condition(badgeStats) : false;
            return (
              <div key={badge.id} title={badge.name}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                  earned ? "bg-gray-800 border-gray-700" : "bg-gray-900/50 border-gray-800 opacity-40 grayscale"
                )}>
                <span className="text-xl leading-none">{badge.emoji}</span>
                <span className="text-[9px] text-gray-500 text-center leading-tight truncate w-full text-center">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium upsell */}
      <div className="card p-4 bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-800">
        <div className="flex items-center gap-2 mb-2">
          <Star size={15} className="text-yellow-400" />
          <span className="text-sm font-semibold text-indigo-300">יעד הבא</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          הגע ל-500 XP לסטטוס לוחם שדה
        </p>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full"
            style={{ width: `${Math.min((xp / 500) * 100, 100)}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-end">
          {Math.max(0, 500 - xp)} XP נותרו
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-3 flex flex-col items-center gap-1">
      {icon}
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
