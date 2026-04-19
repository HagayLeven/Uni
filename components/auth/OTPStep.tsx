"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface Props {
  email: string;
  onNext: () => void;
  onBack: () => void;
}

export function OTPStep({ email, onNext, onBack }: Props) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const updateDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError("");
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (!val && i > 0) refs.current[i - 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) return setError("הזן את כל 6 הספרות");
    setLoading(true);
    // TODO: POST /api/v1/auth/verify-email  { email, code }
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    // Mock: any 6-digit code works in dev
    if (code === "000000") return setError("קוד שגוי, נסה שנית");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">קוד אימות</h2>
        <p className="text-sm text-gray-400 mt-1">
          שלחנו קוד ל-<span className="text-indigo-400 dir-ltr">{email}</span>
        </p>
      </div>

      {/* OTP boxes */}
      <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => updateDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-14 bg-gray-800 border border-gray-700 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors caret-indigo-400"
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading || digits.join("").length < 6}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            אמת חשבון
            <ArrowLeft size={16} />
          </>
        )}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← חזרה
        </button>
        <button
          type="button"
          disabled={resendCooldown > 0}
          onClick={() => setResendCooldown(60)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw size={13} />
          {resendCooldown > 0 ? `שלח שוב (${resendCooldown}s)` : "שלח שוב"}
        </button>
      </div>
    </form>
  );
}
