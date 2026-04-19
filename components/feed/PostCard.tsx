"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown, ChevronUp, Check, FileText, Image as ImageIcon,
  MessageSquare, MoreHorizontal, Pencil, Share2, Trash2, X,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { NSFWBlur } from "@/components/shared/NSFWBlur";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PostType = "summary" | "note" | "question" | "resource" | "exam_question";
type Sensitivity = "safe" | "sensitive" | "nsfw" | "blocked";
type VoteValue = "up" | "down" | null;

interface PostFile {
  id: string;
  name: string;
  type: "pdf" | "image" | "code";
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId?: string;
  author: { name: string; avatar: string | null };
  course: string;
  score: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  sensitivity: Sensitivity;
  userVote: VoteValue;
  timeAgo: string;
  files: PostFile[];
}

// ─── Config ────────────────────────────────────────────────────────────────────

const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string }> = {
  summary:       { label: "סיכום",        color: "bg-blue-500/20 text-blue-400 border-blue-500/30"      },
  note:          { label: "הערת שוליים", color: "bg-teal-500/20 text-teal-400 border-teal-500/30"      },
  question:      { label: "שאלה",         color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  resource:      { label: "חומר לימודי", color: "bg-green-500/20 text-green-400 border-green-500/30"    },
  exam_question: { label: "שאלת מבחן",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

// ─── VoteBar ───────────────────────────────────────────────────────────────────

function VoteBar({ postId, initialScore, initialVote }: {
  postId: string;
  initialScore: number;
  initialVote: VoteValue;
}) {
  const [vote, setVote] = useState<VoteValue>(initialVote);
  const [score, setScore] = useState(initialScore);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const handleVote = async (v: "up" | "down") => {
    if (!userId) return;
    const val = v === "up" ? 1 : -1;

    if (vote === v) {
      await supabase.from("votes").delete().eq("post_id", postId).eq("user_id", userId);
      setScore((s) => s - val);
      setVote(null);
    } else {
      await supabase.from("votes").upsert(
        { post_id: postId, user_id: userId, value: val },
        { onConflict: "post_id,user_id" }
      );
      const prev = vote === null ? 0 : vote === "up" ? -1 : 1;
      setScore((s) => s + val + prev);
      setVote(v);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 w-10 shrink-0">
      <button
        onClick={() => handleVote("up")}
        className={cn(
          "p-1.5 rounded-lg transition-colors hover:bg-gray-800",
          vote === "up" ? "text-orange-400" : "text-gray-500 hover:text-orange-400",
        )}
        aria-label="הצבע בעד"
      >
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>

      <span className={cn(
        "text-sm font-bold tabular-nums",
        score > 0 ? "text-orange-400" : score < 0 ? "text-blue-400" : "text-gray-500",
      )}>
        {score}
      </span>

      <button
        onClick={() => handleVote("down")}
        className={cn(
          "p-1.5 rounded-lg transition-colors hover:bg-gray-800",
          vote === "down" ? "text-blue-400" : "text-gray-500 hover:text-blue-400",
        )}
        aria-label="הצבע נגד"
      >
        <ChevronDown size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── FileAttachments ───────────────────────────────────────────────────────────

function FileAttachments({ files }: { files: PostFile[] }) {
  if (!files.length) return null;
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {files.map((file) => (
        <button key={file.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 hover:text-gray-100 transition-colors border border-gray-700">
          {file.type === "pdf"
            ? <FileText size={13} className="text-red-400" />
            : <ImageIcon size={13} className="text-blue-400" />}
          {file.name}
        </button>
      ))}
    </div>
  );
}

// ─── PostCard ──────────────────────────────────────────────────────────────────

export function PostCard({ post }: { post: Post }) {
  const typeConfig = POST_TYPE_CONFIG[post.type] ?? POST_TYPE_CONFIG.summary;
  const isNSFW = post.sensitivity === "nsfw" || post.sensitivity === "sensitive";

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    post.title + (post.body && post.body !== post.title ? "\n" + post.body : "")
  );
  const [displayTitle, setDisplayTitle] = useState(post.title);
  const [displayBody, setDisplayBody]   = useState(post.body);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setCurrentUserId(data.user?.id ?? null)
    );
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isOwner = !!(post.authorId && currentUserId && post.authorId === currentUserId);

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("posts").update({ content: editContent.trim() }).eq("id", post.id);
    if (!error) {
      const lines = editContent.trim().split("\n").filter(Boolean);
      setDisplayTitle(lines[0] ?? "");
      setDisplayBody(lines.slice(1).join("\n").trim());
    }
    setSaving(false);
    setEditing(false);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    await supabase.from("posts").delete().eq("id", post.id);
    setDeleted(true);
  };

  if (deleted) return null;

  return (
    <article className="card p-4 flex gap-3 hover:border-gray-700 transition-colors">
      <VoteBar
        postId={post.id}
        initialScore={post.score}
        initialVote={post.userVote}
      />

      <div className="flex-1 min-w-0">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", typeConfig.color)}>
            {typeConfig.label}
          </span>
          <span className="text-xs text-gray-500">{post.course}</span>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-500">{post.timeAgo}</span>
          <span className="text-xs text-gray-500">· {post.author.name}</span>
        </div>

        {/* Title / Edit mode */}
        {editing ? (
          <div className="mb-3 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              dir="rtl"
              className="w-full bg-gray-800 border border-indigo-500/60 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none resize-none"
              placeholder="שורה ראשונה = כותרת, שאר = תוכן..."
            />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors">
                <Check size={12} />
                {saving ? "שומר..." : "שמור"}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors">
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link href={`/post/${post.id}`}>
              <h2 className="text-base font-semibold text-gray-100 leading-snug mb-2 text-he hover:text-indigo-300 cursor-pointer transition-colors">
                {displayTitle}
              </h2>
            </Link>

            {/* Body */}
            {isNSFW ? (
              <NSFWBlur sensitivity={post.sensitivity}>
                <p className="text-sm text-gray-400 leading-relaxed text-he line-clamp-3">{displayBody}</p>
              </NSFWBlur>
            ) : (
              <p className="text-sm text-gray-400 leading-relaxed text-he line-clamp-3">{displayBody}</p>
            )}

            {/* Attachments */}
            {isNSFW ? (
              <NSFWBlur sensitivity={post.sensitivity}><FileAttachments files={post.files} /></NSFWBlur>
            ) : (
              <FileAttachments files={post.files} />
            )}
          </>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-1 mt-3">
            <Link href={`/post/${post.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors">
              <MessageSquare size={13} />
              {post.comments} תגובות
            </Link>

            <button
              onClick={handleShare}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
                shared
                  ? "text-green-400 bg-green-500/10"
                  : "text-gray-500 hover:text-gray-100 hover:bg-gray-800"
              )}
            >
              {shared ? <Check size={13} /> : <Share2 size={13} />}
              {shared ? "הועתק!" : "שתף"}
            </button>

            {/* More menu */}
            <div className="ms-auto relative" ref={menuRef}>
              {confirmDelete ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                  <span className="text-xs text-red-400">מחק לצמיתות?</span>
                  <button onClick={handleDelete}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors">
                    כן
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    לא
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
              )}

              {menuOpen && !confirmDelete && (
                <div className="absolute end-0 bottom-full mb-1 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-10" dir="rtl">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => { setEditing(true); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <Pencil size={14} className="text-indigo-400" />
                        ערוך פוסט
                      </button>
                      <button
                        onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                        מחק פוסט
                      </button>
                      <div className="border-t border-gray-700" />
                    </>
                  )}
                  <Link
                    href={`/post/${post.id}`}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-700 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <MessageSquare size={14} />
                    צפה בפוסט
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
