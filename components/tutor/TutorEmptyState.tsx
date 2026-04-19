"use client";

import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "מה ההגדרה של מרחב וקטורי?",
  "איך מוכיחים שקבוצה היא בסיס?",
  "הסבר את שיטת גאוס-יורדן",
  "מה ההבדל בין תלות לינארית לעצמאות לינארית?",
];

interface Props {
  onSuggestion: (text: string) => void;
}

export function TutorEmptyState({ onSuggestion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-8 px-4 text-center">
      {/* Icon */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
          <Sparkles size={28} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">מדריך AI — Socratic Mode</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            אני לא אתן לך את התשובה ישירות — אנחנו נגיע אליה ביחד דרך שאלות
          </p>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="w-full max-w-md space-y-2">
        <p className="text-xs text-gray-600 mb-3">שאלות נפוצות בקורס:</p>
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="text-start px-4 py-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/40 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
