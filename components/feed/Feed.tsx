"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostCard } from "./PostCard";
import { Zap } from "lucide-react";
import { CreatePostModal } from "./CreatePostModal";

// ─── Types ──────────────────────────────────────────────────────────────────────

type PostType = "summary" | "note" | "question" | "resource" | "exam_question";
type Sensitivity = "safe" | "sensitive" | "nsfw" | "blocked";

interface FeedPost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  author: { name: string; avatar: string | null };
  course: string;
  score: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  sensitivity: Sensitivity;
  userVote: "up" | "down" | null;
  timeAgo: string;
  files: { id: string; name: string; type: "pdf" | "image" | "code" }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

type SortMode = "hot" | "new" | "top";
type FilterType = "all" | "summary" | "question" | "exam_question" | "resource";

// ─── Component ─────────────────────────────────────────────────────────────────

// ─── Skeleton ───────────────────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          {/* Author row */}
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer w-9 h-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <div className="skeleton-shimmer h-3 w-28 rounded-md" />
              <div className="skeleton-shimmer h-2.5 w-20 rounded-md" />
            </div>
            <div className="skeleton-shimmer h-5 w-14 rounded-full" />
          </div>
          {/* Title */}
          <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
          {/* Body */}
          <div className="space-y-1.5">
            <div className="skeleton-shimmer h-3 w-full rounded-md" />
            <div className="skeleton-shimmer h-3 w-5/6 rounded-md" />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <div className="skeleton-shimmer h-7 w-20 rounded-lg" />
            <div className="skeleton-shimmer h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────────
function FeedEmptyState() {
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col items-center gap-5 py-16 px-4 text-center">
        <div className="text-6xl select-none">📭</div>
        <div>
          <h3 className="text-lg font-bold text-white">עדיין אין פוסטים כאן</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            היה הראשון לשתף סיכום, שאלה או חומר — וקבל בונוס
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
        >
          <Zap size={15} className="text-yellow-300" />
          פרסם ראשון — קבל 50 XP
        </button>
      </div>
      {createOpen && <CreatePostModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}

export function Feed() {
  const [sort, setSort] = useState<SortMode>("hot");
  const [filter, setFilter] = useState<FilterType>("all");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);

      // Get current user's votes
      const { data: { user } } = await supabase.auth.getUser();
      let myVotes: Record<string, number> = {};
      if (user) {
        const { data: voteData } = await supabase
          .from("votes")
          .select("post_id, value")
          .eq("user_id", user.id);
        (voteData ?? []).forEach((v: any) => { myVotes[v.post_id] = v.value; });
      }

      let query = supabase
        .from("posts")
        .select(`
          id,
          content,
          type,
          author_id,
          upvotes,
          downvotes,
          sensitivity,
          created_at,
          profiles ( full_name, avatar_url ),
          topics ( title )
        `);

      // Filter by type
      if (filter !== "all") {
        query = query.eq("type", filter);
      }

      // Sort
      if (sort === "top") {
        query = query.order("upvotes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error.message);
        setLoading(false);
        return;
      }

      const mapped: FeedPost[] = (data ?? []).map((row: any) => {
        const lines = (row.content ?? "").split("\n").filter(Boolean);
        const title = lines[0] ?? "";
        const body = lines.slice(1).join("\n").trim();
        return {
          id: row.id,
          type: (row.type ?? "summary") as PostType,
          title,
          body: body || title,
          authorId: row.author_id ?? "",
          author: {
            name: row.profiles?.full_name ?? "משתמש",
            avatar: row.profiles?.avatar_url ?? null,
          },
          course: row.topics?.title ?? "כללי",
          upvotes: row.upvotes ?? 0,
          downvotes: row.downvotes ?? 0,
          score: (row.upvotes ?? 0) - (row.downvotes ?? 0),
          comments: 0,
          sensitivity: (row.sensitivity ?? "safe") as Sensitivity,
          userVote: myVotes[row.id] === 1 ? "up" : myVotes[row.id] === -1 ? "down" : null,
          timeAgo: timeAgo(row.created_at),
          files: [],
        };
      });

      setPosts(mapped);
      setLoading(false);
    }

    fetchPosts();
  }, [sort, filter]);

  const SORT_LABELS: Record<SortMode, string> = {
    hot: "🔥 חם",
    new: "✨ חדש",
    top: "⭐ מובחר",
  };

  const FILTER_LABELS: Record<FilterType, string> = {
    all: "הכל",
    summary: "סיכומים",
    question: "שאלות",
    exam_question: "שאלות מבחן",
    resource: "חומרים",
  };

  const filtered = posts;

  return (
    <div className="space-y-4">
      {/* Filter / sort bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Type filters */}
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-1">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sort === s
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Skeleton loaders */}
      {loading && <FeedSkeleton />}

      {/* Posts */}
      {!loading && filtered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Empty state */}
      {!loading && filtered.length === 0 && <FeedEmptyState />}
    </div>
  );
}
