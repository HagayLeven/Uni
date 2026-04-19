"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle, Loader2, CreditCard } from "lucide-react";

interface Props {
  onNext: () => void;
}

type ScanState = "idle" | "scanning" | "success" | "error";

export function StudentIDStep({ onNext }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [studentId, setStudentId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setScanState("scanning");
    // Mock OCR scan
    setTimeout(() => {
      setScanState("success");
      setStudentId("123456789"); // mock extracted ID
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST /api/v1/auth/verify-student-id  { student_id_number, s3_key }
    await new Promise((r) => setTimeout(r, 800));
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">אימות תעודת סטודנט</h2>
        <p className="text-sm text-gray-400 mt-1">
          העלה תמונה של תעודת הסטודנט שלך לאימות זהות
        </p>
      </div>

      {/* Drop zone */}
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative cursor-pointer border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl transition-colors overflow-hidden"
      >
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="תעודת סטודנט" className="w-full h-48 object-cover" />
            {/* Scan overlay */}
            {scanState === "scanning" && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="text-indigo-400 animate-spin" />
                <p className="text-sm text-white font-medium">סורק תעודה...</p>
                {/* Scan line animation */}
                <div className="absolute inset-x-0 h-0.5 bg-indigo-400/80 animate-[scanLine_1.5s_ease-in-out_infinite]" />
              </div>
            )}
            {scanState === "success" && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <CheckCircle size={40} className="text-green-400" />
                <p className="text-sm text-green-400 font-semibold">זוהה בהצלחה</p>
              </div>
            )}
            {scanState === "error" && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <XCircle size={40} className="text-red-400" />
                <p className="text-sm text-red-400 font-semibold">לא ניתן לזהות — נסה שוב</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
              <CreditCard size={24} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">גרור תמונה לכאן</p>
              <p className="text-xs text-gray-600 mt-0.5">או לחץ לצילום / בחירה מהגלריה</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Upload size={12} />
              JPG, PNG עד 10MB
            </div>
          </div>
        )}
      </div>

      {/* Extracted ID (read-only preview) */}
      {studentId && (
        <div className="flex items-center gap-3 p-3 bg-green-950/30 border border-green-700/30 rounded-xl">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">מספר סטודנט שזוהה</p>
            <p className="text-sm font-mono font-bold text-green-400 dir-ltr">{studentId}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={scanState !== "success"}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        סיים הרשמה 🎓
      </button>

      <p className="text-xs text-gray-600 text-center">
        תמונת תעודת הסטודנט מוצפנת ומשמשת לאימות בלבד
      </p>
    </form>
  );
}
