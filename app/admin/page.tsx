"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, FileText, MessageCircle, ThumbsUp, Clock, Sparkles, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  users: number;
  posts: number;
  comments: number;
  upvotes: number;
}

interface RecentPost {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `לפני ${h} שעות`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

const TOPIC_LABELS = [
  "שאלת מבחן — החייאה",
  "סיכום פרוטוקול",
  "מקרה קליני",
  "חישוב מינון תרופה",
  "טיפ קליני",
];

function AiFeedPanel({ userId }: { userId: string | null }) {
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(3);
  const [topicIndex, setTopicIndex] = useState<number | "random">("random");
  const [result, setResult] = useState<{ generated: number; errors?: string[] } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const generate = async () => {
    if (!userId) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_id: userId,
          count,
          topic_index: topicIndex === "random" ? null : topicIndex,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ generated: 0, errors: ["שגיאת רשת"] });
    }
    setGenerating(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-5 hover:bg-gray-800/30 transition-colors text-start"
      >
        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">פיד AI — Uni מפרסמת תכנים</p>
          <p className="text-xs text-gray-500 mt-0.5">יצירת פוסטים לימודיים אוטומטית לפיד הקהילה</p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-800 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Count */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">כמות פוסטים</label>
              <div className="flex gap-1">
                {[1, 3, 5].map((n) => (
                  <button key={n} onClick={() => setCount(n)}
                    className={cn("flex-1 h-8 rounded-lg text-xs font-medium transition-colors",
                      count === n ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">נושא</label>
              <select
                value={topicIndex === "random" ? "random" : topicIndex}
                onChange={(e) => setTopicIndex(e.target.value === "random" ? "random" : Number(e.target.value))}
                className="w-full h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="random">🎲 אקראי</option>
                {TOPIC_LABELS.map((label, i) => (
                  <option key={i} value={i}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating || !userId}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                מייצר פוסטים... (עד 30 שניות)
              </>
            ) : (
              <>
                <Sparkles size={15} />
                צור {count} פוסט{count > 1 ? "ים" : ""} עכשיו
              </>
            )}
          </button>

          {result && (
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm",
              result.generated > 0
                ? "bg-green-500/10 border border-green-500/25 text-green-400"
                : "bg-red-500/10 border border-red-500/25 text-red-400"
            )}>
              {result.generated > 0
                ? <Check size={15} />
                : <AlertCircle size={15} />}
              <div>
                {result.generated > 0
                  ? `✅ נוצרו ${result.generated} פוסטים בהצלחה — מופיעים עכשיו בפיד!`
                  : "לא נוצרו פוסטים"}
                {result.errors?.length ? (
                  <p className="text-xs opacity-70 mt-0.5">{result.errors[0]}</p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, posts: 0, comments: 0, upvotes: 0 });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const [
        { count: users },
        { count: posts },
        { count: comments },
        { count: upvotes },
        { data: recent },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("is_announcement", false),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }).eq("value", 1),
        supabase.from("posts")
          .select("id, content, created_at, profiles(full_name)")
          .eq("is_announcement", false)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      setStats({
        users: users ?? 0,
        posts: posts ?? 0,
        comments: comments ?? 0,
        upvotes: upvotes ?? 0,
      });
      setRecentPosts((recent as any) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const STAT_CARDS = [
    { label: "משתמשים רשומים", value: stats.users,    icon: Users,         color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"    },
    { label: "פוסטים",          value: stats.posts,    icon: FileText,      color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
    { label: "תגובות",          value: stats.comments, icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20"},
    { label: "לייקים",          value: stats.upvotes,  icon: ThumbsUp,      color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20"},
  ];

  return (
    <div className="space-y-8 max-w-6xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">סקירה כללית</h1>
        <p className="text-sm text-gray-500 mt-1">נתונים בזמן אמת מהמערכת</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-3xl font-bold text-white">
              {loading ? <span className="inline-block w-10 h-7 bg-gray-700 rounded animate-pulse" /> : s.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Feed */}
      <AiFeedPanel userId={userId} />

      {/* Recent posts */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">פוסטים אחרונים</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />)}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">אין פוסטים עדיין</p>
        ) : (
          <ul className="space-y-3">
            {recentPosts.map((p) => (
              <li key={p.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="flex-1 text-gray-300 truncate">
                  <span className="text-indigo-400 font-medium me-1">
                    {(p.profiles as any)?.full_name ?? "משתמש"}:
                  </span>
                  {p.content.slice(0, 80)}{p.content.length > 80 ? "..." : ""}
                </span>
                <span className="text-gray-600 text-xs shrink-0">{timeAgo(p.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
