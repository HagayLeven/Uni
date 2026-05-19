"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Printer, Save, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { canAccessSimulator } from "@/lib/simulatorAccess";

// ── Group / candidate data ────────────────────────────────────────────────
const GROUPS: { id: number; candidates: string[] }[] = [
  { id: 1, candidates: ["אבישג חזות", "גיא רודריק", "יובל קופסריוב ספיבק"] },
  { id: 2, candidates: ["רוני בצלאל", "ליאם כהן", "ברק בן נפלא"] },
  { id: 3, candidates: ["ליה רבקה נובוטני", "רוי תורג'מן", "ליאל ליכט"] },
  { id: 4, candidates: ["מלאכי טרבלסי", "אורטל מוסקוביץ'", "שני רווה"] },
  { id: 5, candidates: ["אליענה שולדנפריי", "טוהר סויסה", "הדר בודאי"] },
  { id: 6, candidates: ["הדסה אסתר רומנו", "מרים גלזמן", "רומי (י״א)"] },
  { id: 7, candidates: ["נועם פאר", "לוטם דרעי", "יערה ברגר"] },
  { id: 8, candidates: ["ליטל לוזינסקי", "הילה בת ציון זיקרי", "אנסטסיה (י״א)"] },
];

// ── Rubric definition ─────────────────────────────────────────────────────
interface RubricCategory {
  id: string;
  title: string;
  items: string[];
}

const RUBRIC: RubricCategory[] = [
  {
    id: "scene",
    title: "הערכת סצנה ובטיחות",
    items: [
      "בדיקת בטיחות הסצנה לפני כניסה",
      "זיהוי מספר נפגעים",
      "הפעלת גורמי סיוע נדרשים",
      "שימוש במחסומי זיהום",
      "נהלי גישה ומיקום נכון",
    ],
  },
  {
    id: "primary",
    title: "הערכה ראשונית",
    items: [
      "רושם כללי מהיר",
      "פתיחת נתיב אוויר",
      "בדיקת נשימה ואיכותה",
      "בדיקת מחזור דם ושליטה על דימום",
      "הערכת רמת הכרה (AVPU/GCS)",
      "זיהוי ומענה לאיומים מיידים לחיים",
    ],
  },
  {
    id: "focused",
    title: "הערכה ממוקדת",
    items: [
      "שאלות רלוונטיות לתלונה ראשית (OPQRST/SAMPLE)",
      "בדיקה גופנית ממוקדת",
      "ניטור: SpO2, BP, דופק, RR",
      "שימוש בכלי אבחון (ECG, גלוקוז)",
      "זיהוי אבחנה עיקרית",
    ],
  },
  {
    id: "treatment",
    title: "טיפול והתערבויות",
    items: [
      "מתן חמצן בהתאם לאינדיקציה",
      "פתיחת גישה ורידית",
      "מתן תרופות מתאימות במינון נכון",
      "טכניקות ייצוב (ספליינט, חבישה, כולר)",
      "ניהול נתיב אוויר מתקדם",
      "הכנת ציוד חירום (דפיברילטור, BVM)",
      "עמידה בסדר עדיפויות טיפולי",
    ],
  },
  {
    id: "monitoring",
    title: "ניטור ותיעוד",
    items: [
      "ניטור מתמשך לאחר כל התערבות",
      "הערכה חוזרת ובדיקת תגובה לטיפול",
      "תיעוד מסודר של ממצאים",
      "ניטור זמנים קריטיים (תחילה, התדרדרות, טיפול)",
    ],
  },
  {
    id: "comms",
    title: "תקשורת ופינוי",
    items: [
      "Pre-alert מקצועי ומפורט לחדר מיון",
      "דיווח handover ברור",
      "קביעת עדיפות ואופן פינוי",
    ],
  },
  {
    id: "skills",
    title: "כישורים מקצועיים",
    items: [
      "שפת גוף, רוגע ומנהיגות",
      "עבודת צוות ותקשורת פנימית",
      "קבלת החלטות תחת לחץ",
    ],
  },
];

const FAIL_CRITERIA_LIST = [
  "לא בוצעה דפיברילציה בזמן (VF/VT ≤3 דקות)",
  "לא ניתן אדרנלין IM באנפילקסיס",
  "לא ניתן מגנזיום סולפט באקלמפסיה",
  "ניקור מחט בצד הלא נכון (tension pneumothorax)",
  "לא ניתן נלוקסון ב-OD אופיואידים",
  "לא בוצע CPR כשנדרש",
  "מתן תרופה שגויה או מינון מסוכן",
  "עיכוב פינוי מסכן חיים מעל 15 דקות",
];

type ScoreVal = 0 | 1 | 2 | 3;

// ── Password stored in Supabase app_settings table (key: graduation_password) ──
const PASS_STORAGE_KEY = "graduation_exam_unlocked_20_05_26";

export default function GraduationPage() {
  const router = useRouter();

  // ── Password gate ─────────────────────────────────────────────────────────
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem(PASS_STORAGE_KEY) === "1";
    return false;
  });
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [passChecking, setPassChecking] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // Change-password mode
  const [changePassMode, setChangePassMode] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [changeSaving, setChangeSaving] = useState(false);
  const [changeSaved, setChangeSaved] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const admin = user.email === "hagayas2001@gmail.com";
      if (!admin) {
        const { data: p } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
        setIsAdmin((p as any)?.faculty === "אדמיניסטרציה" || ["root","מנהל מערכת"].includes((p as any)?.role ?? ""));
      } else {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

  const handleUnlock = async () => {
    setPassChecking(true);
    setPassError("");
    try {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "graduation_password_20_05_26").maybeSingle();
      const stored = data?.value ?? "";
      if (!stored) {
        // No password set — allow entry (admin only mode)
        sessionStorage.setItem(PASS_STORAGE_KEY, "1");
        setUnlocked(true);
      } else if (passInput === stored) {
        sessionStorage.setItem(PASS_STORAGE_KEY, "1");
        setUnlocked(true);
      } else {
        setPassError("סיסמה שגויה");
      }
    } catch {
      setPassError("שגיאה בבדיקת סיסמה");
    } finally {
      setPassChecking(false);
    }
  };

  const handleChangePass = async () => {
    if (!newPass.trim()) return;
    setChangeSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("לא מחובר");
      await supabase.from("app_settings").upsert({ key: "graduation_password_20_05_26", value: newPass.trim(), updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
      setChangeSaved(true);
      setNewPass("");
      setTimeout(() => { setChangeSaved(false); setChangePassMode(false); }, 2000);
    } catch {
      // ignore
    } finally {
      setChangeSaving(false);
    }
  };

  // ── All state must be declared before any conditional return ─────────────
  // Main page tab
  const [pageTab, setPageTab] = useState<"exam" | "tracking" | "assign" | "editscenario" | "archive" | "bank">("exam");
  // Scenario editing
  const [editScenarioCode, setEditScenarioCode] = useState("");
  const [editScenarioTitle, setEditScenarioTitle] = useState("");
  const [editStory, setEditStory] = useState("");
  const [editVitals, setEditVitals] = useState<Record<string, string>>({});
  const [editScenarioSaving, setEditScenarioSaving] = useState(false);
  const [editScenarioSaved, setEditScenarioSaved] = useState(false);
  const [editScenarioError, setEditScenarioError] = useState("");
  const [savedScenarios, setSavedScenarios] = useState<{id: string; title: string; code: string}[]>([]);

  // ── Archive tab ───────────────────────────────────────────────────────────
  type ArchiveRow = { id: string; candidate_name: string; group_number: number; scenario_title: string; scenario_id: string; pct: number; passed: boolean; examiner: string; saved_at: string; score: number; max_score: number; manual_override?: string };
  const [archiveRows, setArchiveRows] = useState<ArchiveRow[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState("");

  // ── Scenario bank tab ─────────────────────────────────────────────────────
  // Pre-assignment: all candidates × scenario. Stored in candidate_scenarios.
  // bank state = map of candidateName → {title, code}
  type BankEntry = { candidateName: string; groupId: number; title: string; code: string; saved: boolean; saving: boolean };
  const [bank, setBank] = useState<BankEntry[]>(() =>
    GROUPS.flatMap(g => g.candidates.map(c => ({ candidateName: c, groupId: g.id, title: "", code: "", saved: false, saving: false })))
  );
  const [bankDbLoaded, setBankDbLoaded] = useState(false);

  useEffect(() => {
    if (pageTab === "editscenario") {
      supabase.from("mda_scenarios").select("id, title, story, vitals, code").then(({ data }) => {
        if (data) setSavedScenarios(data.map((d: any) => ({ id: d.id, title: d.title || d.id, code: d.code || d.id })));
      });
    }
  }, [pageTab]);

  useEffect(() => {
    if (pageTab === "archive") {
      setArchiveLoading(true);
      supabase.from("exam_archive")
        .select("id, candidate_name, group_number, scenario_title, scenario_id, pct, passed, examiner, saved_at, score, max_score, rubric_data")
        .eq("exam_type", "graduation")
        .order("saved_at", { ascending: false })
        .then(({ data }) => {
          setArchiveRows((data ?? []) as ArchiveRow[]);
          setArchiveLoading(false);
        });
    }
  }, [pageTab]);

  useEffect(() => {
    if (pageTab === "bank" && !bankDbLoaded) {
      supabase.from("candidate_scenarios").select("*").order("group_number").then(({ data }) => {
        if (data && data.length > 0) {
          setBank(prev => prev.map(entry => {
            const row = (data as any[]).find(d => d.candidate_name === entry.candidateName);
            if (row) return { ...entry, title: row.scenario_title ?? "", code: row.scenario_code ?? "" };
            return entry;
          }));
        }
        setBankDbLoaded(true);
      });
    }
  }, [pageTab, bankDbLoaded]);

  const saveBankEntry = async (candidateName: string) => {
    setBank(prev => prev.map(e => e.candidateName === candidateName ? { ...e, saving: true } : e));
    const entry = bank.find(e => e.candidateName === candidateName);
    if (!entry) return;
    const { data: { user } } = await supabase.auth.getUser();
    // Upsert by candidate_name
    const existing = await supabase.from("candidate_scenarios").select("id").eq("candidate_name", candidateName).maybeSingle();
    if (existing.data?.id) {
      await supabase.from("candidate_scenarios").update({
        scenario_title: entry.title,
        scenario_code: entry.code || null,
        group_number: entry.groupId,
      }).eq("id", existing.data.id);
    } else {
      await supabase.from("candidate_scenarios").insert({
        candidate_name: candidateName,
        group_number: entry.groupId,
        scenario_title: entry.title,
        scenario_code: entry.code || null,
        done: false,
        created_by: user?.id,
      });
    }
    setBank(prev => prev.map(e => e.candidateName === candidateName ? { ...e, saving: false, saved: true } : e));
    setTimeout(() => setBank(prev => prev.map(e => e.candidateName === candidateName ? { ...e, saved: false } : e)), 2000);
  };

  const handleEditScenarioSave = async () => {
    if (!editScenarioTitle.trim()) return;
    setEditScenarioSaving(true);
    setEditScenarioError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const id = editScenarioCode.trim() || editScenarioTitle.trim().slice(0, 20);
      const { error } = await supabase.from("mda_scenarios").upsert({
        id,
        code: editScenarioCode.trim() || id,
        title: editScenarioTitle.trim(),
        story: editStory,
        vitals: editVitals,
        category: "cardiac",
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      }, { onConflict: "id" });
      if (error) throw error;
      setEditScenarioSaved(true);
      setSavedScenarios(prev => {
        const exists = prev.find(s => s.id === id);
        if (exists) return prev.map(s => s.id === id ? { ...s, title: editScenarioTitle, code: editScenarioCode } : s);
        return [...prev, { id, title: editScenarioTitle, code: editScenarioCode }];
      });
      setTimeout(() => setEditScenarioSaved(false), 2500);
    } catch (e: any) {
      setEditScenarioError(e.message ?? "שגיאה");
    } finally {
      setEditScenarioSaving(false);
    }
  };
  // Candidate scenarios (assigned + tracking)
  type CandidateScenario = { id: string; candidate_name: string; group_number: number; scenario_title: string; scenario_code: string; done: boolean; done_at: string | null; done_by: string | null };
  const [candidateScenarios, setCandidateScenarios] = useState<CandidateScenario[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(false);
  // Assign form
  const [assignGroup, setAssignGroup] = useState<number>(1);
  const [assignCandidate, setAssignCandidate] = useState<string>("");
  const [assignTitle, setAssignTitle] = useState<string>("");
  const [assignCode, setAssignCode] = useState<string>("");
  const [assignSaving, setAssignSaving] = useState(false);

  useEffect(() => {
    if (pageTab === "tracking" || pageTab === "assign") {
      setLoadingTracking(true);
      supabase.from("candidate_scenarios").select("*").order("group_number").then(({ data }) => {
        setCandidateScenarios((data as CandidateScenario[]) ?? []);
        setLoadingTracking(false);
      });
    }
  }, [pageTab]);

  const handleAssign = async () => {
    if (!assignCandidate || !assignTitle) return;
    setAssignSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("candidate_scenarios").insert({
      candidate_name: assignCandidate,
      group_number: assignGroup,
      scenario_title: assignTitle,
      scenario_code: assignCode || null,
      done: false,
      created_by: user?.id,
    });
    const { data } = await supabase.from("candidate_scenarios").select("*").order("group_number");
    setCandidateScenarios((data as CandidateScenario[]) ?? []);
    setAssignTitle(""); setAssignCode("");
    setAssignSaving(false);
  };

  const toggleDone = async (row: CandidateScenario) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("candidate_scenarios").update({
      done: !row.done,
      done_at: !row.done ? new Date().toISOString() : null,
      done_by: !row.done ? (examiner || user?.email || "") : null,
    }).eq("id", row.id);
    setCandidateScenarios((prev) => prev.map((r) => r.id === row.id ? { ...r, done: !r.done } : r));
  };

  const deleteAssignment = async (id: string) => {
    await supabase.from("candidate_scenarios").delete().eq("id", id);
    setCandidateScenarios((prev) => prev.filter((r) => r.id !== id));
  };

  // Wizard steps: group → candidate → scenario → rubric
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [candidate, setCandidate] = useState<string>("");
  const [scenarioCode, setScenarioCode] = useState<string>("");
  const [scenarioTitle, setScenarioTitle] = useState<string>("");

  // Rubric scores: rubricCategoryId.itemIndex → 0-3
  const [scores, setScores] = useState<Record<string, ScoreVal>>({});
  // Fail criteria checked
  const [failChecked, setFailChecked] = useState<Record<string, boolean>>({});
  // Manual pass/fail override
  const [manualOverride, setManualOverride] = useState<"pass" | "fail" | null>(null);
  const [examiner, setExaminer] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("mda_examiner") ?? "";
    return "";
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState({
    impression: "",
    strengths: "",
    improvements: "",
    recommendation: "",
  });
  // Which rubric categories are open
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── 15-min countdown timer ────────────────────────────────────────────────
  const TIMER_SECONDS = 15 * 60;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      const { data: profile } = await supabase.from("profiles").select("role, faculty").eq("id", user.id).single();
      if (!canAccessSimulator((profile as any)?.role, (profile as any)?.faculty, user.email)) {
        router.replace("/dashboard");
      }
    }
    checkAccess();
  }, [router]);

  // Single effect — driven by timerRunning flag
  useEffect(() => {
    if (!timerRunning) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [timerRunning]);

  const startTimer  = () => { setTimeLeft(TIMER_SECONDS); setTimerRunning(true); };
  const pauseTimer  = () => setTimerRunning(false);
  const resumeTimer = () => { if ((timeLeft ?? 0) > 0) setTimerRunning(true); };
  const resetTimer  = () => { setTimerRunning(false); setTimeLeft(null); };

  const timerDisplay = timeLeft !== null
    ? `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`
    : null;
  const timerColor = timeLeft === null ? "" : timeLeft <= 60 ? "text-red-400 animate-pulse" : timeLeft <= 180 ? "text-yellow-400" : "text-green-400";

  const resetExam = () => {
    setStep(1);
    setGroupId(null);
    setCandidate("");
    setScenarioCode("");
    setScenarioTitle("");
    setScores({});
    setFailChecked({});
    setManualOverride(null);
    setExaminer(localStorage.getItem("mda_examiner") ?? "");
    setSaving(false);
    setSaved(false);
    setOpenCategories({});
    setStartTime(null);
    setNotes({ impression: "", strengths: "", improvements: "", recommendation: "" });
  };

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const selectedGroup = GROUPS.find((g) => g.id === groupId);

  // Compute totals — defensive array validation
  const safeRubric = Array.isArray(RUBRIC) ? RUBRIC : [];
  const totalMax = safeRubric.reduce((s, cat) => s + cat.items.length * 3, 0);
  const totalEarned = Object.values(scores).reduce((s: number, v) => s + (v ?? 0), 0);
  const pct = totalMax === 0 ? 0 : Math.round((totalEarned / totalMax) * 100);
  const anyFail = Object.values(failChecked).some(Boolean);
  const passed = manualOverride
    ? manualOverride === "pass"
    : !anyFail && pct >= 70;

  const setScore = (catId: string, idx: number, val: ScoreVal) => {
    if (typeof catId !== "string" || typeof idx !== "number") return;
    setScores((prev) => ({ ...prev, [`${catId}.${idx}`]: val ?? 0 }));
  };
  const getScore = (catId: string, idx: number): ScoreVal =>
    ((scores[`${catId}.${idx}`] ?? 0) as ScoreVal);

  const handleSave = async () => {
    setSaving(true);
    const endTime = new Date();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("not logged in");

      const { error } = await supabase.from("exam_archive").insert({
        user_id: user.id,
        scenario_id: scenarioCode,
        scenario_title: scenarioTitle || scenarioCode,
        exam_type: "graduation",
        answers: {
          _started_at: startTime?.toISOString() ?? null,
          _notes: notes,
        },
        score: totalEarned,
        max_score: totalMax,
        pct,
        passed,
        rubric_data: { scores, failChecked, manualOverride },
        candidate_name: candidate,
        group_number: groupId,
        examiner,
        saved_at: new Date().toISOString(),
      });

      if (error) throw error;
      setSaved(true);

      // Auto-generate + open PDF
      const { generateExamPDF } = await import("@/lib/examPDF");
      generateExamPDF({
        type: "graduation",
        candidateName: candidate,
        groupNumber: groupId ?? undefined,
        scenarioTitle: scenarioTitle || scenarioCode,
        scenarioCode,
        examiner,
        startTime: startTime ?? undefined,
        endTime,
        score: totalEarned,
        maxScore: totalMax,
        pct,
        passed,
        rubricCategories: safeRubric.map((cat) => ({
          title: cat.title,
          items: cat.items.map((item, i) => ({
            text: item,
            score: getScore(cat.id, i),
            max: 3,
          })),
        })),
        failChecked: Object.entries(failChecked).filter(([, v]) => v).map(([k]) => k),
        notes,
      });
    } catch (e) {
      console.error("Save error:", e);
      alert("שגיאה בשמירה — בדוק קונסול");
    } finally {
      setSaving(false);
    }
  };

  // ── Password gate — conditional render (hooks-safe) ──────────────────────
  if (!unlocked) {
    return (
      <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-amber-400" />
              </div>
              <h1 className="text-xl font-bold text-white">בחינת בגרות 20/05/26</h1>
              <p className="text-sm text-gray-400 mt-1">הזן סיסמת גישה לבחינה</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="סיסמה..."
                  className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl px-4 pe-11 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button onClick={() => setShowPass(v => !v)} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passError && <p className="text-xs text-red-400 text-center">{passError}</p>}
              <button
                onClick={handleUnlock}
                disabled={passChecking || !passInput.trim()}
                className="w-full h-12 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {passChecking ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                כניסה
              </button>
              {isAdmin && (
                <button onClick={() => { sessionStorage.setItem(PASS_STORAGE_KEY, "1"); setUnlocked(true); }} className="w-full text-xs text-gray-500 hover:text-gray-300 py-2 transition-colors">
                  כניסת מנהל (ללא סיסמה) →
                </button>
              )}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 py-6 print:px-0 print:py-2">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <Link href="/simulator" className="text-gray-500 hover:text-gray-300 min-h-[44px] flex items-center">
              <ArrowRight size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-amber-400">🎓 בחינה מעשית לבגרות</h1>
              <p className="text-sm text-amber-500/70">20/05/2026 — מד״א</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setChangePassMode(v => !v)}
                className="text-xs text-gray-500 hover:text-amber-400 border border-gray-700 rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <Lock size={12} /> סיסמה
              </button>
            )}
          </div>

          {/* Change password panel — admin only */}
          {isAdmin && changePassMode && (
            <div className="mb-4 bg-gray-900 border border-amber-500/30 rounded-xl p-4 space-y-3 print:hidden">
              <p className="text-xs font-semibold text-amber-400">🔑 שינוי סיסמת גישה לבחינה</p>
              <input
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="סיסמה חדשה..."
                className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={() => setChangePassMode(false)} className="flex-1 h-9 rounded-lg bg-gray-800 text-gray-400 text-xs font-medium hover:bg-gray-700 transition-colors">ביטול</button>
                <button
                  onClick={handleChangePass}
                  disabled={changeSaving || !newPass.trim()}
                  className="flex-1 h-9 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  {changeSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {changeSaved ? "✓ נשמר!" : "שמור"}
                </button>
              </div>
            </div>
          )}

          {/* Page tabs */}
          <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 print:hidden overflow-x-auto">
            <button onClick={() => setPageTab("exam")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "exam" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200")}>🎓 בחינה</button>
            <button onClick={() => setPageTab("bank")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "bank" ? "bg-teal-600 text-white" : "text-gray-400 hover:text-gray-200")}>📚 מאגר</button>
            <button onClick={() => setPageTab("tracking")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "tracking" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200")}>📋 מעקב</button>
            <button onClick={() => setPageTab("archive")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "archive" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-200")}>🗂 ארכיון</button>
            {isAdmin && <button onClick={() => setPageTab("assign")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "assign" ? "bg-green-600 text-white" : "text-gray-400 hover:text-gray-200")}>⚙️ שיוך</button>}
            {isAdmin && <button onClick={() => setPageTab("editscenario")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "editscenario" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-gray-200")}>✏️ עריכה</button>}
          </div>

          {/* EDIT SCENARIO TAB */}
          {pageTab === "editscenario" && isAdmin && (
            <div className="print:hidden space-y-4">
              <p className="text-xs text-gray-500">צור או ערוך תרחיש לבגרות. התרחישים נשמרים ב-DB ומופיעים בשלב 3 של הבחינה.</p>

              {/* Existing saved scenarios */}
              {savedScenarios.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-400">תרחישים שמורים — לחץ לעריכה</p>
                  {savedScenarios.map(s => (
                    <button key={s.id} onClick={async () => {
                      const { data } = await supabase.from("mda_scenarios").select("*").eq("id", s.id).maybeSingle();
                      if (data) {
                        setEditScenarioCode(data.code || "");
                        setEditScenarioTitle(data.title || "");
                        setEditStory(data.story || "");
                        setEditVitals((data.vitals as Record<string, string>) || {});
                      }
                    }} className="w-full text-right px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-200 transition-colors flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">{s.code}</span>
                      <span>{s.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Edit form */}
              <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-orange-400">✏️ {editScenarioTitle ? `עריכת: ${editScenarioTitle}` : "תרחיש חדש"}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">קוד תרחיש</label>
                    <input value={editScenarioCode} onChange={e => setEditScenarioCode(e.target.value)} placeholder="G01..." className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">שם תרחיש *</label>
                    <input value={editScenarioTitle} onChange={e => setEditScenarioTitle(e.target.value)} placeholder="שם התרחיש..." className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">מלל תרחיש</label>
                  <textarea value={editStory} onChange={e => setEditStory(e.target.value)} rows={4} placeholder="תיאור התרחיש..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">מדדים (מפתח: ערך, שורה אחת לכל מדד)</label>
                  <textarea
                    value={Object.entries(editVitals).map(([k, v]) => `${k}: ${v}`).join("\n")}
                    onChange={e => {
                      const obj: Record<string, string> = {};
                      e.target.value.split("\n").forEach(line => {
                        const [k, ...rest] = line.split(":");
                        if (k && rest.length) obj[k.trim()] = rest.join(":").trim();
                      });
                      setEditVitals(obj);
                    }}
                    rows={4}
                    placeholder={"pulse: 120\nbp: 90/60\nspo2: 94%\nrr: 22"}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
                {editScenarioError && <p className="text-xs text-red-400">{editScenarioError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setEditScenarioCode(""); setEditScenarioTitle(""); setEditStory(""); setEditVitals({}); }} className="flex-1 h-10 rounded-lg bg-gray-800 text-gray-400 text-xs hover:bg-gray-700 transition-colors">נקה</button>
                  <button onClick={handleEditScenarioSave} disabled={editScenarioSaving || !editScenarioTitle.trim()} className="flex-1 h-10 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                    {editScenarioSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                    {editScenarioSaved ? "✓ נשמר!" : "שמור תרחיש"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── BANK TAB — pre-assign scenarios ── */}
          {pageTab === "bank" && (
            <div className="print:hidden space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">מאגר תרחישים</p>
                  <p className="text-xs text-gray-500 mt-0.5">הגדר מראש איזה תרחיש כל נבחן יבצע</p>
                </div>
              </div>
              {!bankDbLoaded ? (
                <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-teal-400" /></div>
              ) : (
                GROUPS.map(g => (
                  <div key={g.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-400">קבוצה {g.id}</span>
                      <span className="text-xs text-gray-500">({g.candidates.length} נבחנים)</span>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {g.candidates.map(cand => {
                        const entry = bank.find(e => e.candidateName === cand)!;
                        return (
                          <div key={cand} className="px-3 py-2.5 flex items-center gap-2">
                            <span className="text-sm text-gray-200 w-36 shrink-0 truncate">{cand}</span>
                            <input
                              value={entry.title}
                              onChange={e => setBank(prev => prev.map(b => b.candidateName === cand ? { ...b, title: e.target.value, saved: false } : b))}
                              placeholder="שם תרחיש..."
                              className="flex-1 h-8 bg-gray-800 border border-gray-700 rounded-lg px-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                            />
                            <input
                              value={entry.code}
                              onChange={e => setBank(prev => prev.map(b => b.candidateName === cand ? { ...b, code: e.target.value, saved: false } : b))}
                              placeholder="קוד"
                              className="w-16 h-8 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs font-mono text-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                            />
                            {isAdmin && (
                              <button
                                onClick={() => saveBankEntry(cand)}
                                disabled={entry.saving || !entry.title.trim()}
                                className={cn(
                                  "h-8 px-3 rounded-lg text-xs font-semibold transition-colors shrink-0",
                                  entry.saved ? "bg-green-600 text-white" : "bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white"
                                )}
                              >
                                {entry.saving ? <Loader2 size={11} className="animate-spin" /> : entry.saved ? "✓" : "שמור"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── ARCHIVE TAB ── */}
          {pageTab === "archive" && (
            <div className="print:hidden space-y-3">
              <div className="flex items-center gap-2">
                <input
                  value={archiveFilter}
                  onChange={e => setArchiveFilter(e.target.value)}
                  placeholder="חפש לפי שם נבחן..."
                  className="flex-1 h-10 bg-gray-800 border border-gray-700 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                {archiveRows.length > 0 && (
                  <span className="text-xs text-gray-500 shrink-0">{archiveRows.length} בחינות</span>
                )}
              </div>

              {archiveLoading ? (
                <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-purple-400" /></div>
              ) : archiveRows.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">אין בחינות בארכיון עדיין</p>
              ) : (() => {
                const filtered = archiveRows.filter(r =>
                  !archiveFilter || (r.candidate_name ?? "").includes(archiveFilter)
                );
                // Group by candidate
                const byCandidate = filtered.reduce((acc, row) => {
                  const key = row.candidate_name ?? "לא ידוע";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(row);
                  return acc;
                }, {} as Record<string, ArchiveRow[]>);

                return (
                  <div className="space-y-3">
                    {Object.entries(byCandidate).map(([candName, rows]) => (
                      <div key={candName} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{candName}</span>
                          <span className="text-xs text-gray-500">
                            {rows.filter(r => r.passed).length}/{rows.length} עברו
                          </span>
                        </div>
                        <div className="divide-y divide-gray-800/60">
                          {rows.map(row => (
                            <div key={row.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                              <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full border shrink-0",
                                row.passed
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              )}>
                                {row.passed ? "עבר" : "נכשל"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200 truncate">{row.scenario_title || row.scenario_id || "—"}</p>
                                <p className="text-xs text-gray-500">
                                  {row.pct}% ({row.score}/{row.max_score})
                                  {row.examiner ? ` · בוחן: ${row.examiner}` : ""}
                                  {row.group_number ? ` · ק׳${row.group_number}` : ""}
                                </p>
                              </div>
                              <span className="text-xs text-gray-600 shrink-0">
                                {row.saved_at ? new Date(row.saved_at).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TRACKING TAB */}
          {pageTab === "tracking" && (
            <div className="print:hidden">
              <p className="text-xs text-gray-500 mb-3">מעקב תרחישים לכלל החניכים — גלוי לכל המדריכים</p>
              {loadingTracking ? <p className="text-gray-500 text-sm">טוען...</p> : candidateScenarios.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">עדיין לא שויכו תרחישים</p>
              ) : (
                <div className="space-y-3">
                  {Array.from(new Set(candidateScenarios.map(r => r.group_number))).sort().map(gNum => (
                    <div key={gNum} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <span className="text-xs font-bold text-amber-400">קבוצה {gNum}</span>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-xs text-gray-500">
                            <th className="text-right px-4 py-2 font-medium">חניך</th>
                            <th className="text-right px-4 py-2 font-medium">תרחיש</th>
                            <th className="text-center px-4 py-2 font-medium">בוצע</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidateScenarios.filter(r => r.group_number === gNum).map(row => (
                            <tr key={row.id} className="border-b border-gray-800/50 last:border-0">
                              <td className="px-4 py-3 text-gray-200 font-medium">{row.candidate_name}</td>
                              <td className="px-4 py-3 text-gray-400">
                                <span className="font-mono text-xs text-gray-500 ml-1">{row.scenario_code}</span>
                                {row.scenario_title}
                                {row.done && row.done_by && <span className="block text-[10px] text-gray-600">ע״י {row.done_by}</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => toggleDone(row)}
                                  className={cn("w-8 h-8 rounded-full border-2 font-bold text-sm transition-all", row.done ? "bg-green-500 border-green-400 text-white" : "border-gray-600 text-gray-600 hover:border-green-500 hover:text-green-500")}
                                >
                                  {row.done ? "✓" : "○"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASSIGN TAB — admin only */}
          {pageTab === "assign" && isAdmin && (
            <div className="print:hidden space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400">שיוך תרחיש לחניך</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">קבוצה</label>
                    <select value={assignGroup} onChange={e => setAssignGroup(Number(e.target.value))} className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-green-500">
                      {GROUPS.map(g => <option key={g.id} value={g.id}>קבוצה {g.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">חניך</label>
                    <select value={assignCandidate} onChange={e => setAssignCandidate(e.target.value)} className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-green-500">
                      <option value="">בחר חניך...</option>
                      {(GROUPS.find(g => g.id === assignGroup)?.candidates ?? []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">שם תרחיש *</label>
                    <input value={assignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="שם התרחיש..." className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">קוד (רשות)</label>
                    <input value={assignCode} onChange={e => setAssignCode(e.target.value)} placeholder="C01..." className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-green-500" />
                  </div>
                </div>
                <button onClick={handleAssign} disabled={assignSaving || !assignCandidate || !assignTitle} className="w-full h-10 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {assignSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                  + הוסף שיוך
                </button>
              </div>

              {/* List of assignments */}
              {candidateScenarios.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">שיוכים קיימים:</p>
                  {candidateScenarios.map(row => (
                    <div key={row.id} className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-400 text-xs">ק׳{row.group_number}</span>
                      <span className="text-gray-200 font-medium flex-1">{row.candidate_name}</span>
                      <span className="text-gray-500 text-xs">{row.scenario_code} {row.scenario_title}</span>
                      <button onClick={() => deleteAssignment(row.id)} className="text-red-500/60 hover:text-red-400 text-xs px-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Print header (visible only in print) */}
          <div className="hidden print:block mb-4 border-b border-gray-300 pb-3">
            <h1 className="text-xl font-bold">בחינה מעשית — קורס פרמדיק מד״א</h1>
            <p className="text-sm">תאריך: 20/05/2026</p>
            {candidate && <p className="text-sm">נבחן: {candidate} | קבוצה: {groupId}</p>}
            {(scenarioTitle || scenarioCode) && <p className="text-sm">תרחיש: {scenarioTitle || scenarioCode}</p>}
            {examiner && <p className="text-sm">בוחן: {examiner}</p>}
          </div>

          {pageTab === "exam" && <>
          {/* STEP 1: Group picker */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">שלב 1: בחר קבוצה</h2>
              {/* 2×4 grid on mobile */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setGroupId(g.id); setStep(2); }}
                    className="min-h-[64px] rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-white font-bold text-2xl transition-colors"
                  >
                    {g.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Candidate picker */}
          {step === 2 && selectedGroup && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1 min-h-[44px]"
              >
                <ArrowRight size={14} /> חזרה לקבוצות
              </button>
              <h2 className="text-lg font-semibold text-white mb-4">
                שלב 2: קבוצה {groupId} — בחר נבחן
              </h2>
              <div className="space-y-3">
                {selectedGroup.candidates.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCandidate(c); setStep(3); }}
                    className="w-full text-start px-5 min-h-[56px] flex items-center rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-white font-medium text-base transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Manual scenario entry */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1 min-h-[44px]"
              >
                <ArrowRight size={14} /> חזרה לנבחנים
              </button>
              <h2 className="text-lg font-semibold text-white mb-1">
                שלב 3: הגדרת תרחיש עבור {candidate}
              </h2>
              <p className="text-xs text-gray-500 mb-5">התרחישים יוגדרו ע״י המנחה לפני הבחינה</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">שם התרחיש <span className="text-red-400">*</span></label>
                  <input
                    value={scenarioTitle}
                    onChange={(e) => setScenarioTitle(e.target.value)}
                    placeholder="למשל: דום לב מחוץ לבית חולים"
                    className="w-full py-3 bg-gray-900 border border-gray-700 rounded-xl px-4 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">קוד תרחיש (רשות)</label>
                  <input
                    value={scenarioCode}
                    onChange={(e) => setScenarioCode(e.target.value)}
                    placeholder="למשל: C01"
                    className="w-full py-3 bg-gray-900 border border-gray-700 rounded-xl px-4 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <button
                  disabled={!scenarioTitle.trim()}
                  onClick={() => { setStep(4); setStartTime(new Date()); }}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors text-sm mt-2"
                >
                  התחל בחינה →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Rubric */}
          {step === 4 && (
            <div className="space-y-5 pb-4">
              {/* Info bar */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 print:bg-white print:border-gray-300">
                <div className="flex flex-wrap gap-3 text-sm">
                  <div>
                    <span className="text-amber-500/70">נבחן: </span>
                    <span className="text-amber-300 font-semibold">{candidate}</span>
                  </div>
                  <div>
                    <span className="text-amber-500/70">קבוצה: </span>
                    <span className="text-amber-300 font-semibold">{groupId}</span>
                  </div>
                  <div>
                    <span className="text-amber-500/70">תרחיש: </span>
                    <span className="text-amber-300 font-semibold">{scenarioTitle || scenarioCode || "—"}</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-amber-500/70 hover:text-amber-400 mt-2 flex items-center gap-1 print:hidden min-h-[36px]"
                >
                  <ArrowRight size={10} /> שנה תרחיש
                </button>
              </div>

              {/* Examiner field + start time */}
              <div className="print:hidden space-y-2">
                {startTime && (
                  <p className="text-xs text-amber-400 font-medium">
                    ⏱ התחלה: {startTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}

                {/* Timer */}
                <div className="flex items-center gap-2 flex-wrap">
                  {timerDisplay !== null ? (
                    <>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border ${timeLeft! <= 60 ? "border-red-500/50" : timeLeft! <= 180 ? "border-yellow-500/50" : "border-gray-700"}`}>
                        <span className="text-xs text-gray-400">⏳</span>
                        <span className={`text-2xl font-black font-mono tracking-widest ${timerColor}`}>{timerDisplay}</span>
                        {timeLeft === 0 && <span className="text-xs text-red-400 font-bold">הזמן נגמר!</span>}
                      </div>
                      {/* Pause / Resume */}
                      {timerRunning ? (
                        <button onClick={pauseTimer}
                          className="px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 text-sm font-semibold min-h-[44px] transition-colors">
                          ⏸ עצור
                        </button>
                      ) : timeLeft! > 0 ? (
                        <button onClick={resumeTimer}
                          className="px-3 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 text-sm font-semibold min-h-[44px] transition-colors">
                          ▶ המשך
                        </button>
                      ) : null}
                      {/* Reset */}
                      <button onClick={resetTimer}
                        className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 text-sm min-h-[44px] transition-colors">
                        🔄 איפוס
                      </button>
                    </>
                  ) : (
                    <button onClick={startTimer}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-semibold min-h-[44px]">
                      ⏱ התחל טיימר 15 דקות
                    </button>
                  )}
                </div>

                <label className="block text-xs text-gray-400 mb-1.5">שם הבוחן</label>
                <input
                  value={examiner}
                  onChange={(e) => {
                    setExaminer(e.target.value);
                    localStorage.setItem("mda_examiner", e.target.value);
                  }}
                  placeholder="שם הבוחן"
                  dir="rtl"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white w-full min-h-[44px] placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              {/* Rubric categories — collapsible accordions */}
              {safeRubric.map((cat) => {
                const catEarned = cat.items.reduce((s, _, i) => s + getScore(cat.id, i), 0);
                const catMax = cat.items.length * 3;
                const isOpen = !!openCategories[cat.id];
                return (
                  <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden print:border-gray-200">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between px-4 min-h-[52px] bg-gray-800 hover:bg-gray-750 transition-colors print:hidden"
                    >
                      <h3 className="text-sm font-semibold text-white">{cat.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">{catEarned}/{catMax}</span>
                        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </button>
                    {/* Always visible in print */}
                    <div className="hidden print:block px-4 py-2 bg-gray-100">
                      <h3 className="text-sm font-semibold text-black">{cat.title}</h3>
                      <span className="text-xs text-gray-600">{catEarned}/{catMax}</span>
                    </div>
                    {(isOpen || false) && (
                      <div className="px-4 py-3 space-y-3 print:block">
                        {cat.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <p className="flex-1 text-sm text-gray-300 print:text-black leading-snug">{item}</p>
                            <div className="flex gap-1.5 shrink-0 print:hidden">
                              {([0, 1, 2, 3] as ScoreVal[]).map((v) => (
                                <button
                                  key={v}
                                  onClick={() => setScore(cat.id, idx, v)}
                                  className={cn(
                                    "w-9 h-9 rounded-lg text-sm font-bold border transition-colors",
                                    getScore(cat.id, idx) === v
                                      ? v === 0
                                        ? "bg-red-500/60 border-red-400 text-white"
                                        : v === 1
                                          ? "bg-yellow-500/60 border-yellow-400 text-white"
                                          : v === 2
                                            ? "bg-blue-500/60 border-blue-400 text-white"
                                            : "bg-green-500/60 border-green-400 text-white"
                                      : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                                  )}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                            {/* Print: show selected score */}
                            <span className="hidden print:flex w-8 h-8 rounded border border-gray-400 text-xs font-bold items-center justify-center shrink-0">
                              {getScore(cat.id, idx)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Print view: always render items */}
                    <div className="hidden print:block px-4 py-3 space-y-3">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <p className="flex-1 text-sm text-black leading-snug">{item}</p>
                          <span className="w-8 h-8 rounded border border-gray-400 text-xs font-bold flex items-center justify-center shrink-0">
                            {getScore(cat.id, idx)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Fail criteria — large custom checkboxes */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 print:border-red-300">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> קריטריוני כשלון אוטומטי
                </h3>
                <div className="space-y-2">
                  {FAIL_CRITERIA_LIST.map((fc, i) => (
                    <button
                      key={i}
                      onClick={() => setFailChecked((p) => ({ ...p, [i]: !p[i] }))}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-start",
                        failChecked[i]
                          ? "bg-red-500/20 border-red-500/50"
                          : "bg-gray-800/50 border-gray-700 hover:border-red-500/30"
                      )}
                    >
                      {/* Custom large checkbox */}
                      <div className={cn(
                        "shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors",
                        failChecked[i]
                          ? "bg-red-500 border-red-400"
                          : "bg-transparent border-gray-500"
                      )}>
                        {failChecked[i] && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <span className={cn("text-sm leading-snug", failChecked[i] ? "text-red-300 font-medium" : "text-gray-400")}>
                        {fc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Written notes rubric */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 print:hidden">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="flex-1 border-t border-gray-700" />
                  <span className="shrink-0">הערות בכתב</span>
                  <span className="flex-1 border-t border-gray-700" />
                </h3>
                <div className="space-y-4">
                  {(
                    [
                      { key: "impression", label: "התרשמות כללית" },
                      { key: "strengths", label: "נקודות חוזק" },
                      { key: "improvements", label: "נקודות לשיפור" },
                      { key: "recommendation", label: "המלצת הבוחן" },
                    ] as { key: keyof typeof notes; label: string }[]
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">{label}</label>
                      <textarea
                        value={notes[key]}
                        onChange={(e) => setNotes((n) => ({ ...n, [key]: e.target.value }))}
                        rows={3}
                        dir="rtl"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors resize-none min-h-[80px]"
                        placeholder={label + "..."}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual override */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 print:hidden">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">עקיפה ידנית</h3>
                <div className="flex gap-3">
                  {([null, "pass", "fail"] as const).map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => setManualOverride(v)}
                      className={cn(
                        "flex-1 min-h-[44px] rounded-lg text-xs font-medium border transition-colors",
                        manualOverride === v
                          ? v === "pass"
                            ? "bg-green-500/30 border-green-500/60 text-green-300"
                            : v === "fail"
                              ? "bg-red-500/30 border-red-500/60 text-red-300"
                              : "bg-indigo-500/30 border-indigo-500/60 text-indigo-300"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                      )}
                    >
                      {v === null ? "אוטומטי" : v === "pass" ? "✅ עובר" : "❌ נכשל"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary banner */}
              <div className={cn(
                "rounded-xl p-5 text-center border",
                passed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              )}>
                <p className={cn("text-2xl font-bold mb-1", passed ? "text-green-400" : "text-red-400")}>
                  {passed ? "✅ עובר" : "❌ נכשל"}
                </p>
                <p className="text-4xl font-black text-white my-1">{pct}%</p>
                <p className="text-gray-400 text-sm">{totalEarned} / {totalMax} | סף: 70%</p>
                {anyFail && (
                  <p className="mt-2 text-xs text-red-400 font-medium">⚠ כשלון אוטומטי — קריטריון מסומן</p>
                )}
              </div>

              {/* Session meta summary */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 print:hidden space-y-2 text-sm">
                <div className="flex flex-wrap gap-4 text-gray-400">
                  {startTime && (
                    <>
                      <span>
                        ⏱ התחלה: <span className="text-white">{startTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                      <span>
                        🕐 סיום: <span className="text-white">{new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                      <span>
                        ⏳ משך: <span className="text-white">{Math.round((Date.now() - startTime.getTime()) / 60000)} דקות</span>
                      </span>
                    </>
                  )}
                  {examiner && (
                    <span>
                      👤 בוחן: <span className="text-white">{examiner}</span>
                    </span>
                  )}
                </div>
                {Object.values(notes).some(Boolean) && (
                  <div className="mt-2 space-y-1">
                    {(
                      [
                        { key: "impression" as const, label: "התרשמות" },
                        { key: "strengths" as const, label: "חוזקות" },
                        { key: "improvements" as const, label: "שיפור" },
                        { key: "recommendation" as const, label: "המלצה" },
                      ]
                    ).map(({ key, label }) =>
                      notes[key] ? (
                        <p key={key} className="text-xs text-gray-400">
                          <span className="font-semibold text-gray-300">{label}: </span>
                          {notes[key].slice(0, 80)}{notes[key].length > 80 ? "…" : ""}
                        </p>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              {/* Actions — stacked on mobile */}
              <div className="flex flex-col gap-3 print:hidden">
                {!saved ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "שומר..." : "שמור תוצאה"}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-green-600/20 border border-green-600/30 text-green-400 text-sm font-medium">
                    <CheckCircle size={16} />
                    נשמר!
                  </div>
                )}
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  <Printer size={16} />
                  ייצוא PDF
                </button>
                <button
                  onClick={resetExam}
                  className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  בחינה חדשה
                </button>
              </div>
            </div>
          )}
          </>}
        </div>
      </main>
      <BottomNav />

      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          aside, nav { display: none !important; }
          main { overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}
