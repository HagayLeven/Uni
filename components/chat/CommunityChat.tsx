"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  FileText, Hash, MessageSquare, Pencil, Plus,
  Send, Smile, Stethoscope, Trophy, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Channels ─────────────────────────────────────────────────────────────────

interface Channel {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const CHANNELS: Channel[] = [
  { id: "general",    name: "כללי",          description: "שיחות חופשיות",              icon: MessageSquare, color: "text-indigo-400" },
  { id: "protocols",  name: "פרוטוקולים",    description: "דיון בפרוטוקולי מד\"א",      icon: FileText,      color: "text-blue-400"   },
  { id: "clinical",   name: "קלינאי",        description: "מקרים ושאלות מהשטח",         icon: Stethoscope,   color: "text-green-400"  },
  { id: "exams",      name: "מבחנים",        description: "הכנה למבחנים וחזרות",         icon: Pencil,        color: "text-yellow-400" },
  { id: "resources",  name: "חומרי לימוד",   description: "סיכומים, טפסים ומאמרים",     icon: FileText,      color: "text-orange-400" },
  { id: "winners",    name: "הישגים",        description: "שתף הצלחות ואבני דרך",        icon: Trophy,        color: "text-pink-400"   },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  channel_id: string;
  author_name: string;
  author_avatar: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const EMOJIS = [
  "😀","😂","🥲","😍","🤔","😅","🔥","💡","✅","❌",
  "👍","👎","🙏","💪","🎉","😎","🤓","📚","💊","🚑",
  "❤️","⭐","🌟","✨","🏆","👀","💬","📝","🧠","⚡",
];

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 end-0 bg-gray-800 border border-gray-700 rounded-2xl p-3 shadow-xl z-20 w-64" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">אימוג׳י</span>
        <button onClick={onClose} className="p-0.5 text-gray-500 hover:text-gray-300"><X size={13} /></button>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => onSelect(e)}
            className="text-lg hover:bg-gray-700 rounded-lg p-0.5 transition-colors">{e}</button>
        ))}
      </div>
    </div>
  );
}

function timeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

// ─── CommunityChat ─────────────────────────────────────────────────────────────

export function CommunityChat() {
  const [open, setOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lastChannel");
      return CHANNELS.find((c) => c.id === saved) ?? CHANNELS[0];
    }
    return CHANNELS[0];
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef(activeChannel.id);
  channelRef.current = activeChannel.id;

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      setUserId(uid);
      const { data: profile } = await supabase
        .from("profiles").select("full_name, avatar_url").eq("id", uid).single();
      if (profile) {
        setUserName(profile.full_name ?? "משתמש");
        setUserAvatar(profile.avatar_url ?? null);
      }
    });
  }, []);

  // Load messages for active channel
  const loadMessages = useCallback(async (channelId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, content, created_at, user_id, channel_id, profiles(full_name, avatar_url)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(80);

    if (data) {
      setMessages(data.map((m: any) => ({
        id: m.id,
        content: m.content,
        created_at: m.created_at,
        user_id: m.user_id,
        channel_id: m.channel_id,
        author_name: m.profiles?.full_name ?? "משתמש",
        author_avatar: m.profiles?.avatar_url ?? null,
      })));
    }
  }, []);

  useEffect(() => {
    loadMessages(activeChannel.id);
  }, [activeChannel.id, loadMessages]);

  // Realtime subscription (all channels — filter client-side)
  useEffect(() => {
    const channel = supabase
      .channel("community-chat-all")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
      }, async (payload) => {
        const msg = payload.new as any;
        const { data: profile } = await supabase
          .from("profiles").select("full_name, avatar_url").eq("id", msg.user_id).single();

        const newMsg: ChatMessage = {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          channel_id: msg.channel_id,
          author_name: profile?.full_name ?? "משתמש",
          author_avatar: profile?.avatar_url ?? null,
        };

        if (msg.channel_id === channelRef.current) {
          setMessages((prev) => [...prev, newMsg]);
        }
        if (!open || msg.channel_id !== channelRef.current) {
          setUnread((u) => u + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open]);

  // Scroll to bottom
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !userId || sending) return;
    setInput("");
    setSending(true);
    setShowEmoji(false);
    await supabase.from("chat_messages").insert({
      content: text,
      user_id: userId,
      channel_id: activeChannel.id,
    });
    setSending(false);
    inputRef.current?.focus();
  };

  const switchChannel = (ch: Channel) => {
    setActiveChannel(ch);
    setMessages([]);
    setShowChannels(false);
    setInput("");
    if (typeof window !== "undefined") localStorage.setItem("lastChannel", ch.id);
  };

  const ChannelIcon = activeChannel.icon;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-20 start-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all md:bottom-6",
          open ? "bg-gray-700 text-gray-300" : "bg-indigo-600 hover:bg-indigo-500 text-white"
        )}
        aria-label="פתח ערוצים"
      >
        {open ? <X size={20} /> : <Hash size={20} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 start-4 z-40 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex overflow-hidden md:bottom-6"
          style={{ width: "340px", height: "460px" }}
          dir="rtl"
        >
          {/* Channels sidebar */}
          <div className={cn(
            "flex flex-col bg-gray-950/80 border-e border-gray-800 transition-all shrink-0",
            showChannels ? "w-36" : "w-10"
          )}>
            {/* Toggle */}
            <button
              onClick={() => setShowChannels((v) => !v)}
              className="flex items-center justify-center h-10 border-b border-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showChannels ? <X size={14} /> : <Plus size={14} />}
            </button>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto py-1">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isActive = ch.id === activeChannel.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => switchChannel(ch)}
                    title={ch.name}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-2 transition-colors",
                      isActive ? "bg-indigo-600/20 text-indigo-400" : "text-gray-600 hover:text-gray-400 hover:bg-gray-800/30",
                    )}
                  >
                    <Icon size={14} className={isActive ? ch.color : ""} />
                    {showChannels && (
                      <span className="text-xs font-medium truncate">{ch.name}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main chat area */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-800 shrink-0 bg-gray-900/80 backdrop-blur">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <ChannelIcon size={13} className={activeChannel.color} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{activeChannel.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{activeChannel.description}</p>
              </div>
              <Link href={`/channels/${activeChannel.id}`}
                className="p-1 text-gray-500 hover:text-indigo-400 transition-colors" title="פתח פיד">
                <ExternalLink size={13} />
              </Link>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-300">
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <ChannelIcon size={24} className={cn("opacity-30", activeChannel.color)} />
                  <p className="text-xs text-gray-600">התחל שיחה בערוץ {activeChannel.name}</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.user_id === userId;
                return (
                  <div key={msg.id} className={cn("flex gap-1.5 max-w-[90%]", isMe ? "ms-auto flex-row-reverse" : "")}>
                    {!isMe && (
                      msg.author_avatar
                        ? <img src={msg.author_avatar} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                        : <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                            {msg.author_name[0]}
                          </div>
                    )}
                    <div>
                      {!isMe && (
                        <p className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.author_name}</p>
                      )}
                      <div className={cn(
                        "px-2.5 py-1.5 rounded-2xl text-sm leading-relaxed",
                        isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-800 text-gray-100 rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <p className={cn("text-[9px] text-gray-600 mt-0.5 px-1", isMe ? "text-end" : "text-start")}>
                        {timeLabel(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-2 pb-2 pt-1.5 border-t border-gray-800 shrink-0 relative">
              <div className="flex gap-1.5 items-center">
                <div className="relative">
                  <button onClick={() => setShowEmoji((v) => !v)}
                    className="p-1.5 text-gray-500 hover:text-yellow-400 transition-colors">
                    <Smile size={15} />
                  </button>
                  {showEmoji && (
                    <EmojiPicker
                      onSelect={(e) => { setInput((p) => p + e); inputRef.current?.focus(); }}
                      onClose={() => setShowEmoji(false)}
                    />
                  )}
                </div>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`הודעה ב-${activeChannel.name}...`}
                  disabled={sending}
                  className="flex-1 h-8 bg-gray-800 border border-gray-700 rounded-xl px-2.5 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
