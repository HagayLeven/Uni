"use client";

import { FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  citations?: { source: string; page?: number }[];
}

interface Props {
  message: Message;
}

export function TutorMessage({ message }: Props) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex gap-3", isAssistant ? "items-start" : "items-start flex-row-reverse")}>
      {/* Avatar */}
      {isAssistant ? (
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={15} className="text-indigo-400" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
          ה
        </div>
      )}

      {/* Bubble */}
      <div className={cn("max-w-[78%] space-y-2", isAssistant ? "items-start" : "items-end flex flex-col")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed text-he",
            isAssistant
              ? "bg-gray-800 text-gray-100 rounded-tr-sm"
              : "bg-indigo-600 text-white rounded-tl-sm",
          )}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-indigo-400 rounded-sm ms-1 animate-pulse align-middle" />
          )}
        </div>

        {/* Citations */}
        {isAssistant && message.citations && message.citations.length > 0 && !message.isStreaming && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c, i) => (
              <button
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800/60 hover:bg-gray-700 border border-gray-700/50 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <FileText size={11} className="text-indigo-400" />
                {c.source}
                {c.page && <span className="text-gray-600">עמ׳ {c.page}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {isAssistant && !message.isStreaming && (
          <div className="flex gap-2 text-xs text-gray-600">
            <button className="hover:text-green-400 transition-colors">👍 מועיל</button>
            <button className="hover:text-red-400 transition-colors">👎 לא מועיל</button>
          </div>
        )}
      </div>
    </div>
  );
}
