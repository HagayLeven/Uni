"use client";

import { useState } from "react";
import { Mail, ArrowLeft, GraduationCap } from "lucide-react";

interface Props {
  onNext: (email: string) => void;
}

export function EmailStep({ onNext }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (v: string) => {
    if (!v.includes("@") || !v.includes(".")) return "כתובת אימייל לא תקינה";
    return "";
  };

  const isAcademic = email.toLowerCase().endsWith(".ac.il");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(email);
    if (err) return setError(err);
    setLoading(true);
    // TODO: POST /api/v1/auth/register → sends OTP
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onNext(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <Mail
            size={16}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 pointer-events-none"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="name@example.com"
            dir="ltr"
            required
            className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl pe-10 ps-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-start"
          />
        </div>

        {/* Hint when academic email detected */}
        {isAcademic && (
          <div className="flex items-center gap-1.5 px-1 text-xs text-green-400">
            <GraduationCap size={12} />
            אימייל אקדמי זוהה — תאומת כסטודנט אוטומטית
          </div>
        )}

        {/* Hint for non-academic */}
        {email.length > 5 && !isAcademic && !error && (
          <p className="text-xs text-gray-500 px-1">
            ניתן לאמת סטאטוס סטודנט בהמשך דרך ההגדרות
          </p>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            שלח קוד אימות
            <ArrowLeft size={16} />
          </>
        )}
      </button>
    </form>
  );
}
