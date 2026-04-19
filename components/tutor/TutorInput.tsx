"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function TutorInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="shrink-0 px-4 pb-4 pt-2 border-t border-gray-800 bg-gray-950">
      <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-2xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
        <button className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors shrink-0 mb-0.5">
          <Paperclip size={17} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="שאל את המדריך... (Shift+Enter לשורה חדשה)"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed py-1.5 disabled:opacity-50"
          style={{ maxHeight: "160px" }}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0 mb-0.5"
        >
          {disabled ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowUp size={15} className="text-white" />
          )}
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-700 mt-2">
        המדריך מבוסס על חומרי הקורס המאומתים בלבד
      </p>
    </div>
  );
}
