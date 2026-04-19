export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  condition: (stats: BadgeStats) => boolean;
  premium?: boolean; // reserved for future paid tier
}

export interface BadgeStats {
  xp: number;
  posts: number;
  comments: number;
  upvotes_received: number;
  login_streak: number;
  longest_streak: number;
}

const TIER_COLORS: Record<Badge["tier"], string> = {
  bronze:   "from-amber-700 to-amber-600",
  silver:   "from-gray-400 to-gray-300",
  gold:     "from-yellow-500 to-yellow-400",
  platinum: "from-cyan-400 to-blue-400",
  diamond:  "from-purple-400 via-pink-400 to-indigo-400",
};

const TIER_BORDER: Record<Badge["tier"], string> = {
  bronze:   "border-amber-700/50",
  silver:   "border-gray-400/40",
  gold:     "border-yellow-500/50",
  platinum: "border-cyan-400/50",
  diamond:  "border-purple-400/60",
};

const TIER_BG: Record<Badge["tier"], string> = {
  bronze:   "bg-amber-900/20",
  silver:   "bg-gray-700/20",
  gold:     "bg-yellow-900/20",
  platinum: "bg-cyan-900/20",
  diamond:  "bg-purple-900/20",
};

export { TIER_COLORS, TIER_BORDER, TIER_BG };

export const ALL_BADGES: Badge[] = [
  // ── XP Milestones ──────────────────────────────────────────────────────────
  {
    id: "xp_50",
    emoji: "⚡",
    name: "ניצוץ ראשון",
    description: "הגע ל-50 XP",
    tier: "bronze",
    condition: (s) => s.xp >= 50,
  },
  {
    id: "xp_200",
    emoji: "🌟",
    name: "כוכב עולה",
    description: "הגע ל-200 XP",
    tier: "silver",
    condition: (s) => s.xp >= 200,
  },
  {
    id: "xp_500",
    emoji: "🏆",
    name: "לוחם שדה",
    description: "הגע ל-500 XP",
    tier: "gold",
    condition: (s) => s.xp >= 500,
  },
  {
    id: "xp_1000",
    emoji: "💎",
    name: "פראמדיק מצטיין",
    description: "הגע ל-1,000 XP",
    tier: "platinum",
    condition: (s) => s.xp >= 1000,
  },
  {
    id: "xp_2500",
    emoji: "👑",
    name: "אגדת מד\"א",
    description: "הגע ל-2,500 XP — עילית מוחלטת",
    tier: "diamond",
    condition: (s) => s.xp >= 2500,
  },

  // ── Posts ──────────────────────────────────────────────────────────────────
  {
    id: "post_1",
    emoji: "📝",
    name: "פוסט ראשון",
    description: "פרסם את הפוסט הראשון שלך",
    tier: "bronze",
    condition: (s) => s.posts >= 1,
  },
  {
    id: "post_10",
    emoji: "📚",
    name: "ידען קהילה",
    description: "פרסם 10 פוסטים",
    tier: "silver",
    condition: (s) => s.posts >= 10,
  },
  {
    id: "post_30",
    emoji: "🎓",
    name: "מורה בשטח",
    description: "פרסם 30 פוסטים",
    tier: "gold",
    condition: (s) => s.posts >= 30,
  },

  // ── Comments ───────────────────────────────────────────────────────────────
  {
    id: "comment_5",
    emoji: "💬",
    name: "שיחתן",
    description: "כתוב 5 תגובות",
    tier: "bronze",
    condition: (s) => s.comments >= 5,
  },
  {
    id: "comment_25",
    emoji: "🗣️",
    name: "קול הקהילה",
    description: "כתוב 25 תגובות",
    tier: "silver",
    condition: (s) => s.comments >= 25,
  },

  // ── Upvotes received ───────────────────────────────────────────────────────
  {
    id: "liked_10",
    emoji: "👍",
    name: "מוערך",
    description: "קבל 10 לייקים על הפוסטים שלך",
    tier: "bronze",
    condition: (s) => s.upvotes_received >= 10,
  },
  {
    id: "liked_50",
    emoji: "❤️",
    name: "אהוב הקהילה",
    description: "קבל 50 לייקים",
    tier: "silver",
    condition: (s) => s.upvotes_received >= 50,
  },
  {
    id: "liked_200",
    emoji: "🌈",
    name: "מוביל דעה",
    description: "קבל 200 לייקים",
    tier: "gold",
    condition: (s) => s.upvotes_received >= 200,
  },

  // ── Streak ─────────────────────────────────────────────────────────────────
  {
    id: "streak_3",
    emoji: "🔥",
    name: "שלושה ברצף",
    description: "התחבר 3 ימים ברצף",
    tier: "bronze",
    condition: (s) => (s.longest_streak ?? 0) >= 3,
  },
  {
    id: "streak_7",
    emoji: "🔥🔥",
    name: "שבוע שלם",
    description: "התחבר 7 ימים ברצף",
    tier: "silver",
    condition: (s) => (s.longest_streak ?? 0) >= 7,
  },
  {
    id: "streak_30",
    emoji: "💪",
    name: "מחויב לקהילה",
    description: "התחבר 30 ימים ברצף",
    tier: "gold",
    condition: (s) => (s.longest_streak ?? 0) >= 30,
  },
  {
    id: "streak_100",
    emoji: "🏅",
    name: "אלוף הנוכחות",
    description: "התחבר 100 ימים ברצף",
    tier: "diamond",
    condition: (s) => (s.longest_streak ?? 0) >= 100,
    premium: true,
  },
];

export function getEarnedBadges(stats: BadgeStats): Badge[] {
  return ALL_BADGES.filter((b) => b.condition(stats));
}

export function getNextBadge(stats: BadgeStats): Badge | null {
  return ALL_BADGES.find((b) => !b.condition(stats)) ?? null;
}
