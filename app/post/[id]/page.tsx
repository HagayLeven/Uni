"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  ChevronDown, ChevronLeft, ChevronUp, Check,
  Loader2, Send, ThumbsUp, Trash2, CornerDownLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  summary:       { label: "סיכום",        color: "bg-blue-500/20 text-blue-400 border-blue-500/30"      },
  note:          { label: "הערת שוליים", color: "bg-teal-500/20 text-teal-400 border-teal-500/30"      },
  question:      { label: "שאלה",         color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  resource:      { label: "חומר לימודי", color: "bg-green-500/20 text-green-400 border-green-500/30"    },
  exam_question: { label: "שאלת מבחן",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  reply_to?: string | null;
  likes: number;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

interface PostData {
  id: string;
  content: string;
  type: string;
  upvotes: number;
  downvotes: number;
  sensitivity: string;
  created_at: string;
  author_id: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
  topics: { title: string } | null;
}

function Avatar({ name, url, size = 8 }: { name: string; url: string | null; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full shrink-0`;
  if (url) return <img src={url} alt={name} className={`${cls} object-cover border border-gray-700`} />;
  return (
    <div className={`${cls} bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold`}>
      {name[0] ?? "?"}
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [score, setScore] = useState(0);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const { data: postData } = await supabase
        .from("posts")
        .select("id, content, type, upvotes, downvotes, sensitivity, created_at, author_id, profiles(full_name, avatar_url), topics(title)")
        .eq("id", id)
        .single();

      if (postData) {
        setPost(postData as any);
        setScore((postData.upvotes ?? 0) - (postData.downvotes ?? 0));
      }

      if (user) {
        const { data: voteData } = await supabase
          .from("votes").select("value").eq("post_id", id).eq("user_id", user.id).single();
        if (voteData) setVote(voteData.value === 1 ? "up" : "down");
      }

      const { data: commentData } = await supabase
        .from("comments")
        .select("id, content, created_at, author_id, reply_to, likes, profiles(full_name, avatar_url)")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      setComments((commentData as any) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleVote = async (v: "up" | "down") => {
    if (!userId) return;
    const val = v === "up" ? 1 : -1;
    if (vote === v) {
      await supabase.from("votes").delete().eq("post_id", id).eq("user_id", userId);
      setScore((s) => s - val);
      setVote(null);
    } else {
      await supabase.from("votes").upsert({ post_id: id, user_id: userId, value: val }, { onConflict: "post_id,user_id" });
      const prev = vote === null ? 0 : vote === "up" ? -1 : 1;
      setScore((s) => s + val + prev);
      setVote(v);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: id,
        author_id: userId,
        content: newComment.trim(),
        reply_to: replyTo?.id ?? null,
        likes: 0,
      })
      .select("id, content, created_at, author_id, reply_to, likes, profiles(full_name, avatar_url)")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as any]);
      setNewComment("");
      setReplyTo(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
    setSubmitting(false);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!userId) return;
    const alreadyLiked = likedComments.has(commentId);
    const delta = alreadyLiked ? -1 : 1;

    await supabase.from("comments").update({
      likes: (comments.find(c => c.id === commentId)?.likes ?? 0) + delta
    }).eq("id", commentId);

    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, likes: (c.likes ?? 0) + delta } : c
    ));
    setLikedComments(prev => {
      const next = new Set(prev);
      alreadyLiked ? next.delete(commentId) : next.add(commentId);
      return next;
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500" dir="rtl">
        <div className="text-center">
          <p className="text-lg">הפוסט לא נמצא</p>
          <Link href="/dashboard" className="text-indigo-400 text-sm mt-2 block">חזור לדף הבית</Link>
        </div>
      </div>
    );
  }

  const lines = post.content.split("\n").filter(Boolean);
  const title = lines[0] ?? "";
  const body = lines.slice(1).join("\n").trim();
  const typeConfig = POST_TYPE_LABELS[post.type] ?? POST_TYPE_LABELS.summary;
  const authorName = (post.profiles as any)?.full_name ?? "משתמש";
  const authorAvatar = (post.profiles as any)?.avatar_url ?? null;
  const topicTitle = (post.topics as any)?.title ?? "כללי";

  // Group: top-level and replies
  const topLevel = comments.filter(c => !c.reply_to);
  const replies = (parentId: string) => comments.filter(c => c.reply_to === parentId);

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>

        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          {/* Back */}
          <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors">
              <ChevronLeft size={18} />
            </Link>
            <span className="text-sm font-medium text-gray-300">פוסט</span>
          </div>

          <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
            {/* Post */}
            <article className="card p-5 flex gap-4">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-1 w-10 shrink-0">
                <button onClick={() => handleVote("up")}
                  className={cn("p-1.5 rounded-lg transition-colors hover:bg-gray-800",
                    vote === "up" ? "text-orange-400" : "text-gray-500 hover:text-orange-400")}>
                  <ChevronUp size={20} strokeWidth={2.5} />
                </button>
                <span className={cn("text-sm font-bold tabular-nums",
                  score > 0 ? "text-orange-400" : score < 0 ? "text-blue-400" : "text-gray-500")}>
                  {score}
                </span>
                <button onClick={() => handleVote("down")}
                  className={cn("p-1.5 rounded-lg transition-colors hover:bg-gray-800",
                    vote === "down" ? "text-blue-400" : "text-gray-500 hover:text-blue-400")}>
                  <ChevronDown size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Author */}
                <div className="flex items-center gap-2.5 mb-3">
                  <Avatar name={authorName} url={authorAvatar} size={8} />
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{authorName}</p>
                    <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
                  </div>
                  <span className={cn("ms-auto text-[11px] font-semibold px-2 py-0.5 rounded-md border", typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                </div>

                <h1 className="text-lg font-bold text-gray-100 leading-snug mb-3">{title}</h1>

                {body && (
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{body}</p>
                )}
              </div>
            </article>

            {/* Comments header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                {comments.length} תגובות
              </h2>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {topLevel.map((c) => {
                const cAuthor = (c.profiles as any)?.full_name ?? "משתמש";
                const cAvatar = (c.profiles as any)?.avatar_url ?? null;
                const isOwn = c.author_id === userId;
                const cReplies = replies(c.id);
                const isLiked = likedComments.has(c.id);

                return (
                  <div key={c.id} className="space-y-2">
                    {/* Top-level comment */}
                    <div className="flex gap-3">
                      <Avatar name={cAuthor} url={cAvatar} size={8} />
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-800/60 rounded-2xl rounded-tr-sm px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-200">{cAuthor}</span>
                            <span className="text-xs text-gray-600">{timeAgo(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-1 px-2">
                          <button
                            onClick={() => handleLikeComment(c.id)}
                            className={cn("flex items-center gap-1 text-xs transition-colors",
                              isLiked ? "text-indigo-400" : "text-gray-600 hover:text-indigo-400")}
                          >
                            <ThumbsUp size={11} />
                            {c.likes > 0 && <span>{c.likes}</span>}
                          </button>
                          {userId && (
                            <button
                              onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, name: cAuthor })}
                              className={cn("flex items-center gap-1 text-xs transition-colors",
                                replyTo?.id === c.id ? "text-indigo-400" : "text-gray-600 hover:text-indigo-400")}
                            >
                              <CornerDownLeft size={11} />
                              השב
                            </button>
                          )}
                          {isOwn && (
                            <button onClick={() => handleDeleteComment(c.id)}
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-400 transition-colors ms-auto">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {cReplies.length > 0 && (
                      <div className="me-0 ms-11 space-y-2 border-s-2 border-gray-800 ps-3">
                        {cReplies.map((r) => {
                          const rAuthor = (r.profiles as any)?.full_name ?? "משתמש";
                          const rAvatar = (r.profiles as any)?.avatar_url ?? null;
                          const isROwn = r.author_id === userId;
                          const isRLiked = likedComments.has(r.id);
                          return (
                            <div key={r.id} className="flex gap-2">
                              <Avatar name={rAuthor} url={rAvatar} size={7} />
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-800/40 rounded-2xl rounded-tr-sm px-3 py-2">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-gray-300">{rAuthor}</span>
                                    <span className="text-[10px] text-gray-600">{timeAgo(r.created_at)}</span>
                                  </div>
                                  <p className="text-sm text-gray-300 leading-relaxed">{r.content}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 px-2">
                                  <button
                                    onClick={() => handleLikeComment(r.id)}
                                    className={cn("flex items-center gap-1 text-xs transition-colors",
                                      isRLiked ? "text-indigo-400" : "text-gray-600 hover:text-indigo-400")}
                                  >
                                    <ThumbsUp size={10} />
                                    {r.likes > 0 && <span>{r.likes}</span>}
                                  </button>
                                  {isROwn && (
                                    <button onClick={() => handleDeleteComment(r.id)}
                                      className="text-[10px] text-gray-600 hover:text-red-400 ms-auto">
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {comments.length === 0 && (
                <p className="text-sm text-gray-600 py-4 text-center">היה הראשון להגיב!</p>
              )}
            </div>

            {/* Comment input */}
            {userId ? (
              <form onSubmit={handleComment} className="space-y-2 sticky bottom-20 md:bottom-4">
                {replyTo && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-600/30 rounded-xl text-xs text-indigo-400">
                    <CornerDownLeft size={12} />
                    <span>משיב ל-{replyTo.name}</span>
                    <button type="button" onClick={() => setReplyTo(null)} className="ms-auto hover:text-indigo-200">×</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTo ? `השב ל-${replyTo.name}...` : "כתוב תגובה..."}
                    className="flex-1 h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button type="submit" disabled={submitting || !newComment.trim()}
                    className={cn(
                      "h-11 px-4 rounded-xl transition-colors flex items-center gap-2 text-white font-medium text-sm",
                      submitted
                        ? "bg-green-600"
                        : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                    )}>
                    {submitting ? <Loader2 size={15} className="animate-spin" /> :
                     submitted  ? <Check size={15} /> :
                     <Send size={15} />}
                    {submitted ? "נשלח!" : "שלח"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-center text-sm text-gray-600">
                <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">התחבר</Link> כדי להגיב
              </p>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
