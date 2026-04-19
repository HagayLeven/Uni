"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniCharacter, type UniPose } from "@/components/uni/UniCharacter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Detect what pose Uni should use based on content
function detectPose(content: string): UniPose {
  const lower = content.toLowerCase();
  if (/✅|כל הכבוד|מצוין|נכון|perfect|bravo|יפה|נהדר/.test(content)) return "joyful";
  if (/😅|אופס|שגיאה|לא הצלחתי|נסה שוב/.test(content)) return "compassion";
  if (/📝|שאלה|בחירה|a\)|b\)|c\)|d\)/.test(lower)) return "focused";
  if (/שלום|היי|מה תרצה|ללמוד היום/.test(content)) return "core";
  return "calm";
}

// ─── Uni Popup ─────────────────────────────────────────────────────────────────
function UniPopup({ onClose }: { onClose: () => void }) {
  const lines = [
    "היי! שאל אותי כל שאלה לימודית 📚",
    "אני כאן אם צריך עזרה! 🤓",
    "שאלה טובה שווה יותר מתשובה! 💡",
    "בוא נלמד ביחד! ✨",
  ];
  const line = lines[Math.floor(Math.random() * lines.length)];

  return (
    <div className="fixed bottom-24 end-4 z-50 flex items-end gap-2 animate-in slide-in-from-bottom-4 duration-300" dir="rtl">
      <div className="bg-gray-900 border border-indigo-500/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl max-w-[200px]">
        <p className="text-sm text-gray-100">{line}</p>
        <button onClick={onClose} className="text-[10px] text-gray-500 mt-1 hover:text-gray-300">סגור</button>
      </div>
      <UniCharacter pose="joyful" size={44} animate />
    </div>
  );
}

const SUGGESTIONS = [
  "בוא נלמד על הלם והסוגים שלו",
  "הסבר לי ABCDE assessment",
  "מה פרוטוקול ACS וכאב חזה?",
  "שאל אותי שאלות על CPR",
  "תרופות חירום — אפינפרין, ניטרו, אספירין",
  "טראומה — MARCH ועצירת דימום",
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [headerPose, setHeaderPose] = useState<UniPose>("core");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (greeted) return;
    setGreeted(true);
    send("שלום! אני מתחיל עכשיו — מה תרצה ללמוד היום?", true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loading) setShowPopup(true);
    }, 45000 + Math.random() * 45000);
    return () => clearTimeout(timeout);
  }, [messages, loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update header pose based on last assistant message
  useEffect(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (last?.content) setHeaderPose(detectPose(last.content));
  }, [messages]);

  const send = async (text: string, silent = false) => {
    if (!text.trim() || loading) return;
    setInput("");
    setShowPopup(false);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const newMessages = silent ? [userMsg] : [...messages, userMsg];
    if (!silent) setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: silent ? [userMsg] : newMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `שגיאת שרת ${res.status}`);
      }
      if (!res.body) throw new Error("תגובה ריקה מהשרת");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: full } : m)
        );
      }
    } catch (err: any) {
      const msg = err?.message ?? "שגיאה לא ידועה";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `⚠️ ${msg}\n\nאם הבעיה נמשכת — ודא שמפתח ה-API תקין ב-.env.local` }
            : m
        )
      );
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="flex bg-gray-950" style={{ height: "100dvh" }} dir="rtl">
        <div className="hidden md:flex shrink-0"><Sidebar /></div>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur shrink-0">
            <UniCharacter pose={loading ? "focused" : headerPose} size={38} animate={loading} />
            <div>
              <h1 className="text-base font-bold text-white">Uni</h1>
              <p className="text-xs text-indigo-400">עוזרת לימודית · מבוסס Gemini</p>
            </div>
            <div className="ms-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">מחוברת</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-6 pt-8">
                <UniCharacter pose="core" size={80} animate />
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">היי! אני Uni 🦉</h2>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs">שאל אותי כל שאלה — פרוטוקולים, תרופות, הגדרות, או סתם שוחח איתי</p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="text-start px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const pose: UniPose = msg.content ? detectPose(msg.content) : "calm";
              return (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <UniCharacter
                      pose={msg.content ? pose : "sleeping"}
                      size={32}
                      animate={!msg.content}
                    />
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700"
                  )}>
                    {msg.content ? (
                      <span
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em>$1</em>")
                        }}
                      />
                    ) : (
                      <span className="flex gap-1 items-center text-gray-400">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-800 shrink-0" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="שאל את Uni..."
                disabled={loading}
                className="flex-1 h-11 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="h-11 w-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center shrink-0">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </main>
      </div>

      {showPopup && <UniPopup onClose={() => setShowPopup(false)} />}
      <BottomNav />
    </>
  );
}
