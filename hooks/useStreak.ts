"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { XP_VALUES } from "@/lib/xp";

/** Updates login streak once per day and awards bonus_xp */
export function useStreak() {
  useEffect(() => {
    async function update() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("login_streak, last_login_date, longest_streak, bonus_xp")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().slice(0, 10);
      if (profile.last_login_date === today) return; // already updated today

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = profile.last_login_date === yesterday
        ? (profile.login_streak ?? 0) + 1
        : 1;
      const longest = Math.max(newStreak, profile.longest_streak ?? 0);

      // XP bonus
      let bonusGain = XP_VALUES.daily_login;
      if (newStreak === 7)  bonusGain += XP_VALUES.streak_7;
      if (newStreak === 30) bonusGain += XP_VALUES.streak_30;

      await supabase.from("profiles").update({
        login_streak:    newStreak,
        last_login_date: today,
        longest_streak:  longest,
        bonus_xp:        (profile.bonus_xp ?? 0) + bonusGain,
      }).eq("id", user.id);
    }

    update();
  }, []);
}
