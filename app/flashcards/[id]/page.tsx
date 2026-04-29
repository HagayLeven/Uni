"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle, Loader2, BookMarked, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Card { front: string; back: string; }

function parseCards(body: string): Card[] {
  // Split by double newline → each block is a card
  // First line = front (term/question), rest = back (definition/answer)
  const blocks = body.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  const cards: Card[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.length === 1) {
      // Single line — use as front, mark as "להמשיך"
      cards.push({ front: lines[0], back: "—" });
    } else {
      cards.push({ front: lines[0], back: lines.slice(1).join("\n") });
    }
  }
  return cards;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [notebook, setNotebook] = useState<{ title: string; body: string } | null>(null);
  const [cards, setCards]       = useState<Card[]>([]);
  const [index, setIndex]       = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [known, setKnown]       = useState<Set<number>>(new Set());
  const [unknown, setUnknown]   = useState<Set<number>>(new Set());
  const [loading, setLoading]   = useState(true);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("notebooks")
        .select("title, body")
        .eq("id", id)
        .single();
      if (data) {
        setNotebook(data);
        const parsed = parseCards(data.body ?? "");
        setCards(parsed);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const current = cards[index];
  const total   = cards.length;
  const progress = total > 0 ? Math.round(((known.size + unknown.size) / total) * 100) : 0;

  const markKnown = () => {
    setKnown(p => new Set([...p, index]));
    unknown.delete(index);
    next();
  };

  const markUnknown = () => {
    setUnknown(p => new Set([...p, index]));
    known.delete(index);
    next();
  };

  const next = () => {
    setFlipped(false);
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setTimeout(() => setIndex(i => i + 1), 150);
    }
  };

  const prev = () => {
    if (index === 0) return;
    setFlipped(false);
    setTimeout(() => setIndex(i => i - 1), 150);
  };

  const restart = () => {
    setIndex(0); setFlipped(false);
    setKnown(new Set()); setUnknown(new Set()); setDone(false);
  };

  const reshuffleUnknown = () => {
    const unknownCards = [...unknown].map(i => cards[i]);
    setCards(shuffle(unknownCards));
    setIndex(0); setFlipped(false);
    setKnown(new Set()); setUnknown(new Set()); setDone(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );

  if (!notebook || cards.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4" dir="rtl">
      <BookMarked size={40} className="text-gray-700" />
      <p className="text-gray-500">אין כרטיסיות — הוסף תוכן לאוגדן</p>
      <p className="text-xs text-gray-600 max-w-xs text-center">כל פסקה (שורה ריקה בין קטעים) הופכת לכרטיסייה.<br />שורה ראשונה = שאלה / מונח, השאר = תשובה</p>
      <button onClick={() => router.back()} className="text-indigo-400 text-sm hover:text-indigo-300">← חזרה</button>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 px-4" dir="rtl">
      <div className="text-6xl">🎉</div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">סיימת!</h2>
        <p className="text-gray-400 text-sm">{notebook.title}</p>
      </div>
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{known.size}</p>
          <p className="text-xs text-gray-500">ידעתי</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{unknown.size}</p>
          <p className="text-xs text-gray-500">לא ידעתי</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-400">{Math.round((known.size / total) * 100)}%</p>
          <p className="text-xs text-gray-500">הצלחה</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={restart}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
          <RotateCcw size={14} /> התחל מחדש
        </button>
        {unknown.size > 0 && (
          <button onClick={reshuffleUnknown}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-xl transition-colors">
            <Shuffle size={14} /> תרגל שגיאות ({unknown.size})
          </button>
        )}
        <button onClick={() => router.back()}
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors">
          חזרה
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors">
          <ChevronRight size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{notebook.title}</p>
          <p className="text-xs text-gray-500">{index + 1} / {total} · {known.size} ידעתי · {unknown.size} לא ידעתי</p>
        </div>
        <button onClick={restart} className="p-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-lg cursor-pointer select-none"
          onClick={() => setFlipped(f => !f)}
          style={{ perspective: "1000px" }}
        >
          <div className={cn(
            "relative w-full transition-transform duration-500",
            "min-h-[280px]"
          )} style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
            {/* Front */}
            <div className="absolute inset-0 bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: "hidden" }}>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">מונח / שאלה</p>
              <p className="text-xl font-bold text-white text-center leading-relaxed">{current.front}</p>
              <p className="text-xs text-gray-600 mt-4">לחץ לגלות תשובה</p>
            </div>
            {/* Back */}
            <div className="absolute inset-0 bg-indigo-950 border-2 border-indigo-700/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <p className="text-[10px] font-semibold text-indigo-400/60 uppercase tracking-widest">תשובה / הגדרה</p>
              <p className="text-lg text-indigo-100 text-center leading-relaxed whitespace-pre-line">{current.back}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {flipped && (
          <div className="flex gap-4 mt-8">
            <button onClick={markUnknown}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold rounded-xl transition-colors">
              <XCircle size={18} /> לא ידעתי
            </button>
            <button onClick={markKnown}
              className="flex items-center gap-2 px-6 py-3 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-semibold rounded-xl transition-colors">
              <CheckCircle2 size={18} /> ידעתי!
            </button>
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex items-center gap-6 mt-6">
          <button onClick={prev} disabled={index === 0}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-300 disabled:opacity-30 transition-colors">
            <ChevronRight size={20} />
          </button>
          <div className="flex gap-1">
            {cards.map((_, i) => (
              <span key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors",
                i === index ? "bg-indigo-400" :
                known.has(i) ? "bg-green-500" :
                unknown.has(i) ? "bg-red-500" :
                "bg-gray-700")} />
            ))}
          </div>
          <button onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => Math.min(i + 1, total - 1)), 150); }}
            disabled={index === total - 1}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-300 disabled:opacity-30 transition-colors">
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
