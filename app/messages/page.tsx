"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Bell, Check, Copy, Hash, Loader2, MessageSquare, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "hagayas2001@gmail.com";

type Tab = "announcements" | "friends";

interface Announcement {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  status: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

interface Friend {
  id: string;
  other_id: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
}

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `לפני ${h} שעות`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>("announcements");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myFriendCode, setMyFriendCode] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      setIsAdmin(user.email === ADMIN_EMAIL);

      // Fetch my friend code
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("friend_code")
        .eq("id", user.id)
        .single();
      if (myProfile?.friend_code) setMyFriendCode(myProfile.friend_code);

      // Announcements
      const { data: ann } = await supabase
        .from("posts")
        .select("id, content, created_at, profiles(full_name, avatar_url)")
        .eq("is_announcement", true)
        .order("created_at", { ascending: false })
        .limit(30);
      setAnnouncements((ann as any) ?? []);

      // Friend requests (pending, addressed to me)
      const { data: reqs } = await supabase
        .from("friendships")
        .select("id, requester_id, status, profiles!friendships_requester_id_fkey(full_name, avatar_url)")
        .eq("addressee_id", user.id)
        .eq("status", "pending");
      setRequests((reqs as any) ?? []);

      // Accepted friends
      const { data: accepted } = await supabase
        .from("friendships")
        .select("id, requester_id, addressee_id")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (accepted) {
        const otherIds = accepted.map((f: any) =>
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        );
        if (otherIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, friend_code")
            .in("id", otherIds);
          setFriends(accepted.map((f: any) => ({
            id: f.id,
            other_id: f.requester_id === user.id ? f.addressee_id : f.requester_id,
            profiles: profs?.find((p: any) => p.id === (f.requester_id === user.id ? f.addressee_id : f.requester_id)) ?? null,
          })));
        }
      }

      setLoading(false);
    }
    load();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const q = searchQuery.trim();

    // Search by name OR by exact friend_code (5-digit number)
    const isFriendCode = /^\d{5}$/.test(q);

    let data: any[] = [];
    if (isFriendCode) {
      const { data: byCode } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, friend_code")
        .eq("friend_code", q)
        .neq("id", userId ?? "")
        .limit(5);
      data = byCode ?? [];
    } else {
      const { data: byName } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, friend_code")
        .ilike("full_name", `%${q}%`)
        .neq("id", userId ?? "")
        .limit(10);
      data = byName ?? [];
    }

    setSearchResults(data);
    setSearching(false);
  };

  const sendRequest = async (toId: string) => {
    if (!userId) return;
    await supabase.from("friendships").insert({ requester_id: userId, addressee_id: toId });
    setSearchResults((prev) => prev.filter((p) => p.id !== toId));
  };

  const acceptRequest = async (req: FriendRequest) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", req.id);
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setFriends((prev) => [...prev, {
      id: req.id,
      other_id: req.requester_id,
      profiles: req.profiles,
    }]);
  };

  const declineRequest = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const pendingCount = requests.length;

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 shrink-0">
            <h1 className="text-base font-semibold text-white">הודעות</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800 shrink-0">
            <button onClick={() => setTab("announcements")}
              className={cn("flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                tab === "announcements" ? "text-white border-b-2 border-indigo-500" : "text-gray-500 hover:text-gray-300")}>
              <Bell size={15} />
              עדכונים
            </button>
            <button onClick={() => setTab("friends")}
              className={cn("flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative",
                tab === "friends" ? "text-white border-b-2 border-indigo-500" : "text-gray-500 hover:text-gray-300")}>
              <UserPlus size={15} />
              חברים
              {pendingCount > 0 && (
                <span className="absolute top-2 end-6 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-28 md:pb-6">
            {loading ? (
              <div className="flex justify-center pt-12"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
            ) : tab === "announcements" ? (
              <AnnouncementsTab announcements={announcements} isAdmin={isAdmin} userId={userId} />
            ) : (
              <FriendsTab
                friends={friends}
                requests={requests}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                searching={searching}
                onSearch={handleSearch}
                onSendRequest={sendRequest}
                onAccept={acceptRequest}
                onDecline={declineRequest}
                myFriendCode={myFriendCode}
              />
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}

// ─── Announcements ─────────────────────────────────────────────────────────────

function AnnouncementsTab({ announcements, isAdmin, userId }: {
  announcements: Announcement[];
  isAdmin: boolean;
  userId: string | null;
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [list, setList] = useState(announcements);

  useEffect(() => { setList(announcements); }, [announcements]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    setPosting(true);
    const { data } = await supabase
      .from("posts")
      .insert({ content: text, is_announcement: true, author_id: userId, type: "resource", sensitivity: "safe", upvotes: 0, downvotes: 0 })
      .select("id, content, created_at, profiles(full_name, avatar_url)")
      .single();
    if (data) setList((prev) => [data as any, ...prev]);
    setText("");
    setPosting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {isAdmin && (
        <form onSubmit={post} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            placeholder="פרסם עדכון לכל הקהילה..."
            className="flex-1 h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          <button type="submit" disabled={posting || !text.trim()}
            className="h-11 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {posting ? <Loader2 size={15} className="animate-spin" /> : "פרסם"}
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p>אין עדכונים עדיין</p>
        </div>
      ) : (
        list.map((a) => {
          const author = (a.profiles as any)?.full_name ?? "מנהל";
          const avatar = (a.profiles as any)?.avatar_url;
          const lines = a.content.split("\n").filter(Boolean);
          return (
            <div key={a.id} className="flex gap-3 p-4 bg-gray-900 border border-indigo-500/20 rounded-xl">
              <div className="w-2 shrink-0 rounded-full bg-indigo-500 self-stretch" />
              {avatar ? (
                <img src={avatar} className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {author[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-300">{author}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-medium">עדכון</span>
                  <span className="text-xs text-gray-600 ms-auto">{timeAgo(a.created_at)}</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{lines.join("\n")}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Friends ───────────────────────────────────────────────────────────────────

function FriendsTab({ friends, requests, searchQuery, setSearchQuery, searchResults, searching, onSearch, onSendRequest, onAccept, onDecline, myFriendCode }: any) {
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = async () => {
    if (!myFriendCode) return;
    await navigator.clipboard.writeText(myFriendCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">

      {/* My friend code */}
      {myFriendCode && (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 border border-indigo-500/30 rounded-xl">
          <Hash size={16} className="text-indigo-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">הקוד שלי</p>
            <p className="text-lg font-bold text-indigo-300 font-mono tracking-widest">{myFriendCode}</p>
          </div>
          <button onClick={copyCode}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              codeCopied ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}>
            {codeCopied ? <Check size={12} /> : <Copy size={12} />}
            {codeCopied ? "הועתק!" : "העתק"}
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">הוסף חבר</label>
        <div className="flex gap-2">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="חפש לפי שם או קוד חבר (5 ספרות)..."
            className="flex-1 h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          <button onClick={onSearch} disabled={searching}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {searching ? <Loader2 size={14} className="animate-spin" /> : "חפש"}
          </button>
        </div>
        {searchResults.length > 0 && (
          <ul className="mt-2 space-y-1">
            {searchResults.map((p: any) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {p.full_name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{p.full_name}</p>
                  {p.friend_code && (
                    <p className="text-[10px] text-gray-500 font-mono">#{p.friend_code}</p>
                  )}
                </div>
                <button onClick={() => onSendRequest(p.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <UserPlus size={13} /> שלח בקשה
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending requests */}
      {requests.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">בקשות ממתינות</label>
          <ul className="space-y-2">
            {requests.map((r: any) => {
              const name = r.profiles?.full_name ?? "משתמש";
              return (
                <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 bg-gray-800 border border-indigo-500/20 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {name[0]}
                  </div>
                  <span className="flex-1 text-sm text-gray-200">{name}</span>
                  <button onClick={() => onAccept(r)} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => onDecline(r.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Friends list */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">החברים שלי ({friends.length})</label>
        {friends.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">עדיין אין חברים — חפש ושלח בקשה!</p>
        ) : (
          <ul className="space-y-1">
            {friends.map((f: any) => {
              const name = f.profiles?.full_name ?? "משתמש";
              const code = f.profiles?.friend_code;
              return (
                <li key={f.id} className="flex items-center gap-3 px-3 py-2.5 bg-gray-800 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200">{name}</p>
                    {code && <p className="text-[10px] text-gray-500 font-mono">#{code}</p>}
                  </div>
                  <Link href={`/profile/${f.other_id}`} className="text-xs text-gray-500 hover:text-indigo-400 transition-colors">
                    פרופיל
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
