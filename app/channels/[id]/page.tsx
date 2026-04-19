"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  ArrowRight, FileText, Hash, MessageSquare, Pencil,
  Send, Smile, Stethoscope, Trophy, X, Plus, Loader2,
  ChevronDown, ChevronUp, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Channel definitions (same as CommunityChat) ────────────────────────────

const CHANNELS = [
  { id: "general",   name: "כללי",        description: "שיחות חופשיות",           icon: MessageSquare, color: "text-indigo-400", accent: "indigo" },
  { id: "protocols", name: "פרוטוקולים",  description: "דיון בפרוטוקולי מד\"א",   icon: FileText,      color: "text-blue-400",   accent: "blue"   },
  { id: "clinical",  name: "קלינאי",      description: "מקרים ושאלות מהשטח",      icon: Stethoscope,   color: "text-green-400",  accent: "green"  },
  { id: "exams",     name: "מבחנים",      description: "הכנה למבחנים וחזרות",      icon: Pencil,        color: "text-yellow-400", accent: "yellow" },
  { id: "resources", name: "חומרי לימוד", description: "סיכומים, טפסים ומאמרים",  icon: FileText,      color: "text-orange-400", accent: "orange" },
  { id: "winners",   name: "הישגים",      description: "שתף הצלחות ואבני דרך",     icon: Trophy,        color: "text-pink-400",   accent: "pink"   },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  content: string;
  type: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  author_id: string;
  author_name: string;
  author_avatar: string | null;
  comment_count: number;
  user_vote: "up" | "down" | null;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
}

const EMOJIS = ["😀","😂","🥲","😍","🤔","😅","🔥","💡","✅","❌","👍","👎","🙏","💪","🎉","😎","🤓","📚","💊","🚑"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "עכשיו";
  if (m < 60) return `לפני ${m} דק'`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} ש'`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

function timeFmt(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const channel = CHANNELS.find((c) => c.id === id) ?? CHANNELS[0];
  const ChannelIcon = channel.icon;

  const [tab, setTab] = useState<"feed" | "chat">("feed");
  const [userId, setUserId]       = useState<string | null>(null);
  const [userName, setUserName]   = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Feed state
  const [posts, setPosts]           = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [newPost, setNewPost]       = useState("");
  const [postType, setPostType]     = useState("question");
  const [showCompose, setShowCompose] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // Chat state
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending]     = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef  = useRef<HTMLInputElement>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      setUserId(uid);
      const { data: p } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", uid).single();
      if (p) { setUserName(p.full_name ?? "משתמש"); setUserAvatar(p.avatar_url ?? null); }
    });
  }, []);

  // Save last channel to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastChannel", id);
    }
  }, [id]);

  // Load feed posts
  const loadPosts = useCallback(async () => {
    setFeedLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id, content, type, created_at, upvotes, downvotes, author_id, profiles!author_id(full_name, avatar_url)")
      .eq("channel_id", id)
      .eq("is_announcement", false)
      .order("created_at", { ascending: false })
      .limit(40);

    if (data && userId) {
      const postIds = data.map((p: any) => p.id);
      const { data: votes } = postIds.length
        ? await supabase.from("votes").select("post_id, value").eq("user_id", userId).in("post_id", postIds)
        : { data: [] };
      const voteMap: Record<string, "up" | "down"> = {};
      (votes ?? []).forEach((v: any) => { voteMap[v.post_id] = v.value === 1 ? "up" : "down"; });

      const { data: commentRows } = postIds.length
        ? await supabase.from("comments").select("post_id").in("post_id", postIds)
        : { data: [] };
      const commentCount: Record<string, number> = {};
      (commentRows ?? []).forEach((c: any) => { commentCount[c.post_id] = (commentCount[c.post_id] ?? 0) + 1; });

      setPosts(data.map((p: any) => ({
        id: p.id,
        content: p.content,
        type: p.type,
        created_at: p.created_at,
        upvotes: p.upvotes ?? 0,
        downvotes: p.downvotes ?? 0,
        author_id: p.author_id,
        author_name: (p.profiles as any)?.full_name ?? "משתמש",
        author_avatar: (p.profiles as any)?.avatar_url ?? null,
        comment_count: commentCount[p.id] ?? 0,
        user_vote: voteMap[p.id] ?? null,
      })));
    }
    setFeedLoading(false);
  }, [id, userId]);

  useEffect(() => {
    if (userId) loadPosts();
  }, [userId, loadPosts]);

  // Load chat messages
  const loadChat = useCallback(async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, content, created_at, user_id, profiles(full_name, avatar_url)")
      .eq("channel_id", id)
      .order("created_at", { ascending: true })
      .limit(80);
    if (data) {
      setMessages(data.map((m: any) => ({
        id: m.id, content: m.content, created_at: m.created_at, user_id: m.user_id,
        author_name: m.profiles?.full_name ?? "משתמש",
        author_avatar: m.profiles?.avatar_url ?? null,
      })));
    }
  }, [id]);

  useEffect(() => { loadChat(); }, [loadChat]);

  // Realtime chat
  useEffect(() => {
    const ch = supabase.channel(`channel-chat-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `channel_id=eq.${id}` },
        async (payload) => {
          const msg = payload.new as any;
          const { data: p } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", msg.user_id).single();
          setMessages((prev) => [...prev, {
            id: msg.id, content: msg.content, created_at: msg.created_at,
            user_id: msg.user_id, author_name: p?.full_name ?? "משתמש", author_avatar: p?.avatar_url ?? null,
          }]);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  // Scroll chat to bottom
  useEffect(() => {
    if (tab === "chat") chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  // Submit post
  const submitPost = async () => {
    if (!newPost.trim() || !userId || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("posts").insert({
      content: newPost.trim(),
      type: postType,
      author_id: userId,
      channel_id: id,
      sensitivity: "safe",
      upvotes: 0,
      downvotes: 0,
      is_announcement: false,
    });
    if (!error) {
      setNewPost("");
      setShowCompose(false);
      loadPosts();
    }
    setSubmitting(false);
  };

  // Vote on post
  const vote = async (postId: string, value: "up" | "down") => {
    if (!userId) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const isSame = post.user_vote === value;

    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const wasUp = p.user_vote === "up", wasDown = p.user_vote === "down";
      return {
        ...p,
        user_vote: isSame ? null : value,
        upvotes:   p.upvotes   + (value === "up"   ? (isSame ? -1 : (wasUp   ? -1 : 0) + 1) : (wasUp   ? -1 : 0)),
        downvotes: p.downvotes + (value === "down"  ? (isSame ? -1 : (wasDown ? -1 : 0) + 1) : (wasDown ? -1 : 0)),
      };
    }));

    if (isSame) {
      await supabase.from("votes").delete().eq("user_id", userId).eq("post_id", postId);
    } else {
      await supabase.from("votes").upsert({ user_id: userId, post_id: postId, value: value === "up" ? 1 : -1 });
    }
  };

  // Send chat message
  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || !userId || sending) return;
    setChatInput(""); setSending(true); setShowEmoji(false);
    await supabase.from("chat_messages").insert({ content: text, user_id: userId, channel_id: id });
    setSending(false);
    chatInputRef.current?.focus();
  };

  const POST_TYPES = [
    { id: "question", label: "שאלה" },
    { id: "summary",  label: "סיכום" },
    { id: "resource", label: "חומר לימוד" },
    { id: "note",     label: "הערה" },
  ];

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur shrink-0">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowRight size={18} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center">
              <ChannelIcon size={15} className={channel.color} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white">#{channel.name}</h1>
              <p className="text-[10px] text-gray-500">{channel.description}</p>
            </div>
            {/* Channel switcher */}
            <div className="flex gap-1">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                return (
                  <Link key={ch.id} href={`/channels/${ch.id}`}
                    className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      ch.id === id ? "bg-gray-700" : "hover:bg-gray-800"
                    )}>
                    <Icon size={12} className={ch.id === id ? ch.color : "text-gray-600"} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800 shrink-0">
            {(["feed", "chat"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-2.5 text-xs font-semibold transition-colors",
                  tab === t ? `${channel.color} border-b-2 border-current` : "text-gray-500 hover:text-gray-300"
                )}>
                {t === "feed" ? "פיד פוסטים" : "צ'אט חי"}
              </button>
            ))}
          </div>

          {/* ── Feed Tab ── */}
          {tab === "feed" && (
            <div className="flex-1 overflow-y-auto pb-28 md:pb-6">
              <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

                {/* Compose button */}
                <button onClick={() => setShowCompose((v) => !v)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-sm",
                    showCompose
                      ? "bg-gray-800 border-gray-600 text-gray-200"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
                  )}>
                  <Plus size={16} />
                  <span>פרסם ב-#{channel.name}</span>
                </button>

                {/* Compose form */}
                {showCompose && (
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                    {/* Type selector */}
                    <div className="flex gap-2 flex-wrap">
                      {POST_TYPES.map((t) => (
                        <button key={t.id} onClick={() => setPostType(t.id)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                            postType === t.id
                              ? `${channel.color} border-current bg-gray-800`
                              : "text-gray-500 border-gray-700 hover:border-gray-500"
                          )}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder={`מה תרצה לשתף ב-${channel.name}?`}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setShowCompose(false); setNewPost(""); }}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300">
                        ביטול
                      </button>
                      <button onClick={submitPost} disabled={!newPost.trim() || submitting}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
                        {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        פרסם
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts list */}
                {feedLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse space-y-2">
                        <div className="flex gap-2 items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-800" />
                          <div className="h-3 w-24 bg-gray-800 rounded" />
                        </div>
                        <div className="h-3 bg-gray-800 rounded w-full" />
                        <div className="h-3 bg-gray-800 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <ChannelIcon size={36} className={cn("opacity-20", channel.color)} />
                    <p className="text-gray-600 text-sm">אין פוסטים בערוץ עדיין — היה הראשון!</p>
                  </div>
                ) : (
                  posts.map((post) => {
                    const expanded = expandedPosts.has(post.id);
                    const isLong = post.content.length > 220;
                    const displayContent = isLong && !expanded
                      ? post.content.slice(0, 220) + "..."
                      : post.content;

                    return (
                      <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                          {post.author_avatar
                            ? <img src={post.author_avatar} className="w-8 h-8 rounded-full object-cover border border-gray-700 shrink-0" />
                            : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{post.author_name[0]}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-300">{post.author_name}</p>
                            <p className="text-[10px] text-gray-600">{timeAgo(post.created_at)}</p>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                            {POST_TYPES.find((t) => t.id === post.type)?.label ?? post.type}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                        {isLong && (
                          <button onClick={() => setExpandedPosts((prev) => {
                            const next = new Set(prev);
                            expanded ? next.delete(post.id) : next.add(post.id);
                            return next;
                          })} className={cn("text-xs flex items-center gap-0.5", channel.color)}>
                            {expanded ? <><ChevronUp size={12} /> פחות</> : <><ChevronDown size={12} /> קרא עוד</>}
                          </button>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-1">
                          {/* Upvote */}
                          <button onClick={() => vote(post.id, "up")}
                            className={cn("flex items-center gap-1 text-xs transition-colors",
                              post.user_vote === "up" ? "text-green-400" : "text-gray-500 hover:text-green-400")}>
                            <ChevronUp size={15} />
                            <span>{post.upvotes}</span>
                          </button>
                          {/* Downvote */}
                          <button onClick={() => vote(post.id, "down")}
                            className={cn("flex items-center gap-1 text-xs transition-colors",
                              post.user_vote === "down" ? "text-red-400" : "text-gray-500 hover:text-red-400")}>
                            <ChevronDown size={15} />
                            <span>{post.downvotes}</span>
                          </button>
                          {/* Comments link */}
                          <Link href={`/post/${post.id}`}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-400 transition-colors">
                            <MessageCircle size={13} />
                            <span>{post.comment_count}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── Chat Tab ── */}
          {tab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <ChannelIcon size={28} className={cn("opacity-20", channel.color)} />
                    <p className="text-xs text-gray-600">התחל שיחה בערוץ #{channel.name}</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.user_id === userId;
                  return (
                    <div key={msg.id} className={cn("flex gap-2 max-w-[85%]", isMe ? "ms-auto flex-row-reverse" : "")}>
                      {!isMe && (
                        msg.author_avatar
                          ? <img src={msg.author_avatar} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                          : <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{msg.author_name[0]}</div>
                      )}
                      <div>
                        {!isMe && <p className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.author_name}</p>}
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                          isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-800 text-gray-100 rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <p className={cn("text-[9px] text-gray-600 mt-0.5 px-1", isMe ? "text-end" : "text-start")}>
                          {timeFmt(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat input */}
              <div className="px-4 pb-4 pt-2 border-t border-gray-800 shrink-0 relative"
                style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <button onClick={() => setShowEmoji((v) => !v)}
                      className="p-2 text-gray-500 hover:text-yellow-400 transition-colors">
                      <Smile size={16} />
                    </button>
                    {showEmoji && (
                      <div className="absolute bottom-full mb-2 start-0 bg-gray-800 border border-gray-700 rounded-2xl p-3 shadow-xl z-20 w-64">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJIS.map((e) => (
                            <button key={e} onClick={() => { setChatInput((p) => p + e); chatInputRef.current?.focus(); }}
                              className="text-base hover:bg-gray-700 rounded-lg p-0.5 transition-colors">{e}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder={`הודעה ב-#${channel.name}...`}
                    disabled={sending}
                    className="flex-1 h-10 bg-gray-800 border border-gray-700 rounded-xl px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                  <button onClick={sendChat} disabled={!chatInput.trim() || sending}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
