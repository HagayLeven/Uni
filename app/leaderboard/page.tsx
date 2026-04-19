"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FileText, MessageCircle, ThumbsUp, Trophy, Zap, Flame, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniCharacter } from "@/components/uni/UniCharacter";
import { useStreak } from "@/hooks/useStreak";
import { BadgesPanel } from "@/components/badges/BadgesPanel";
import { BadgeStats } from "@/lib/badges";
import { getLevel, XP_VALUES } from "@/lib/xp";

interface LeaderUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  faculty: string | null;
  xp: number;
  posts: number;
  comments: number;
  upvotes_received: number;
  login_streak: number;
  longest_streak: number;
}

const XP_RULES = [
  { icon: FileText,      label: "פרסום פוסט",              xp: XP_VALUES.post,        color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: ThumbsUp,      label: "לייק שקיבלת על פוסט",    xp: XP_VALUES.upvote,      color: "text-green-400",  bg: "bg-green-500/10"  },
  { icon: MessageCircle, label: "כתיבת תגובה",              xp: XP_VALUES.comment,     color: "text-blue-400",   bg: "bg-blue-500/10"   },
  { icon: LogIn,         label: "כניסה יומית",              xp: XP_VALUES.daily_login, color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Flame,         label: "בונוס רצף 7 ימים",        xp: XP_VALUES.streak_7,   color: "text-red-400",    bg: "bg-red-500/10"    },
];

export default function LeaderboardPage() {
  useStreak();

  const [users, setUsers]     = useState<LeaderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId]       = useState<string | null>(null);
  const [myRank, setMyRank]   = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setMyId(uid);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, faculty, xp_override, bonus_xp, login_streak, longest_streak");
      if (!profiles) { setLoading(false); return; }

      const { data: postRows } = await supabase
        .from("posts").select("author_id").eq("is_announcement", false);
      const postCounts: Record<string, number> = {};
      (postRows ?? []).forEach((r: any) => { postCounts[r.author_id] = (postCounts[r.author_id] ?? 0) + 1; });

      const { data: commentRows } = await supabase.from("comments").select("author_id");
      const commentCounts: Record<string, number> = {};
      (commentRows ?? []).forEach((r: any) => { commentCounts[r.author_id] = (commentCounts[r.author_id] ?? 0) + 1; });

      const { data: voteRows } = await supabase
        .from("votes").select("post_id, value, posts!inner(author_id)").eq("value", 1);
      const upvoteCounts: Record<string, number> = {};
      (voteRows ?? []).forEach((r: any) => {
        const authorId = r.posts?.author_id;
        if (authorId) upvoteCounts[authorId] = (upvoteCounts[authorId] ?? 0) + 1;
      });

      const ranked = profiles
        .map((p: any) => {
          const posts    = postCounts[p.id]    ?? 0;
          const comments = commentCounts[p.id] ?? 0;
          const upvotes  = upvoteCounts[p.id]  ?? 0;
          const bonus    = p.bonus_xp ?? 0;
          const xp = p.xp_override != null
            ? p.xp_override
            : posts * XP_VALUES.post + comments * XP_VALUES.comment + upvotes * XP_VALUES.upvote + bonus;
          return { ...p, posts, comments, upvotes_received: upvotes, login_streak: p.login_streak ?? 0, longest_streak: p.longest_streak ?? 0, xp };
        })
        .sort((a: any, b: any) => b.xp - a.xp);

      setUsers(ranked);
      if (uid) {
        const rank = ranked.findIndex((u: any) => u.id === uid);
        setMyRank(rank >= 0 ? rank + 1 : null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const myUser = users.find((u) => u.id === myId);
  const myLevel = myUser ? getLevel(myUser.xp) : null;
  const myBadgeStats: BadgeStats | null = myUser ? {
    xp: myUser.xp, posts: myUser.posts, comments: myUser.comments,
    upvotes_received: myUser.upvotes_received,
    login_streak: myUser.login_streak, longest_streak: myUser.longest_streak,
  } : null;

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

            {/* Header */}
            <div className="flex items-center gap-3">
              <Trophy size={22} className="text-yellow-400" />
              <h1 className="text-xl font-bold text-white">לוח הישגים</h1>
            </div>

            {/* My stats card */}
            {!loading && myUser && myLevel && (
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {myUser.avatar_url
                      ? <img src={myUser.avatar_url} className="w-12 h-12 rounded-full object-cover border border-indigo-500/30" />
                      : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">{myUser.full_name?.[0] ?? "?"}</div>
                    }
                  </div>
                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{myUser.full_name}</p>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", myLevel.color, myLevel.bg, myLevel.border)}>
                      רמה {myLevel.level} · {myLevel.name}
                    </span>
                  </div>
                  {/* Rank + XP */}
                  <div className="flex gap-3 shrink-0">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-400">#{myRank}</p>
                      <p className="text-[10px] text-gray-500">מקום</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{myUser.xp}</p>
                      <p className="text-[10px] text-gray-500">XP</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>{myLevel.name}</span>
                    {myLevel.xpToNext > 0
                      ? <span>עוד {myLevel.xpToNext} XP לרמה {myLevel.level + 1}</span>
                      : <span className="text-yellow-400">רמה מקסימלית!</span>
                    }
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${myLevel.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Streak card */}
            {!loading && myUser && (
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-orange-500/10 border border-orange-500/20">
                    🔥
                  </div>
                  {myUser.login_streak > 0 && (
                    <span className="absolute -top-1 -end-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {myUser.login_streak}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">רצף התחברות</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {myUser.login_streak === 0
                      ? "התחבר מחר לפתוח רצף!"
                      : `${myUser.login_streak} ימים ברציפות`}
                  </p>
                  {myUser.longest_streak > 0 && (
                    <p className="text-[10px] text-gray-600 mt-0.5">שיא אישי: {myUser.longest_streak} ימים</p>
                  )}
                  {/* Streak milestones hint */}
                  {myUser.login_streak < 7 && (
                    <p className="text-[10px] text-orange-400/70 mt-0.5">
                      עוד {7 - myUser.login_streak} ימים לבונוס +{XP_VALUES.streak_7} XP
                    </p>
                  )}
                </div>
                {/* 7-day dots */}
                <div className="flex flex-col gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      i < Math.min(myUser.login_streak, 7) ? "bg-orange-400" : "bg-gray-700"
                    )} />
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {!loading && myBadgeStats && <BadgesPanel stats={myBadgeStats} />}

            {/* XP Rules */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">איך מרוויחים XP?</p>
              <div className="space-y-2">
                {XP_RULES.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", rule.bg)}>
                      <rule.icon size={15} className={rule.color} />
                    </div>
                    <span className="flex-1 text-sm text-gray-300">{rule.label}</span>
                    <span className={cn("text-sm font-bold", rule.color)}>+{rule.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-gray-800" />
                    <div className="w-10 h-10 rounded-full bg-gray-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 bg-gray-800 rounded" />
                      <div className="h-2.5 w-20 bg-gray-800 rounded" />
                    </div>
                    <div className="h-5 w-14 bg-gray-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user, i) => {
                  const lvl = getLevel(user.xp);
                  return (
                    <div key={user.id} className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
                      user.id === myId
                        ? "bg-indigo-600/10 border-indigo-500/30"
                        : i === 0
                          ? "bg-yellow-500/5 border-yellow-500/20"
                          : "bg-gray-900 border-gray-800"
                    )}>
                      {/* Rank */}
                      <span className="w-7 text-center shrink-0 text-lg">
                        {i < 3 ? medals[i] : <span className="text-sm text-gray-500 font-bold">{i + 1}</span>}
                      </span>

                      {/* Avatar */}
                      {user.avatar_url
                        ? <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-gray-700 shrink-0" />
                        : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{user.full_name?.[0] ?? "?"}</div>
                      }

                      {/* Name + level + stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-gray-100 truncate">
                            {user.full_name ?? "משתמש"}
                            {user.id === myId && <span className="text-xs text-indigo-400 me-1"> (אני)</span>}
                          </p>
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0", lvl.color, lvl.bg, lvl.border)}>
                            {lvl.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-600 flex items-center gap-0.5"><FileText size={9} /> {user.posts}</span>
                          <span className="text-[10px] text-gray-600 flex items-center gap-0.5"><MessageCircle size={9} /> {user.comments}</span>
                          <span className="text-[10px] text-gray-600 flex items-center gap-0.5"><ThumbsUp size={9} /> {user.upvotes_received}</span>
                          {user.login_streak >= 3 && (
                            <span className="text-[10px] text-orange-400 flex items-center gap-0.5">🔥 {user.login_streak}</span>
                          )}
                        </div>
                      </div>

                      {/* XP */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Zap size={13} className="text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{user.xp}</span>
                        <span className="text-xs text-gray-600">XP</span>
                      </div>
                    </div>
                  );
                })}
                {users.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <UniCharacter pose="compassion" size={56} />
                    <p className="text-gray-600">אין משתמשים עדיין</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
