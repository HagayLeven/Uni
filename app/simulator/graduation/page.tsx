"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Printer, Save, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Lock, Loader2, Eye, EyeOff, Trash2, Plus, Settings, Radio, Clock, X, GripVertical } from "lucide-react";
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
interface RubricItem { text: string; maxScore: number; expected?: string | null; }
interface RubricCategory {
  id: string;
  title: string;
  items: RubricItem[];
}

const DEFAULT_RUBRIC: RubricCategory[] = [
  {
    id: "scene",
    title: "הערכת סצנה ובטיחות",
    items: [
      { text: "בדיקת בטיחות הסצנה לפני כניסה", maxScore: 3 },
      { text: "זיהוי מספר נפגעים", maxScore: 3 },
      { text: "הפעלת גורמי סיוע נדרשים", maxScore: 3 },
      { text: "שימוש במחסומי זיהום", maxScore: 3 },
      { text: "נהלי גישה ומיקום נכון", maxScore: 3 },
    ],
  },
  {
    id: "primary",
    title: "הערכה ראשונית",
    items: [
      { text: "רושם כללי מהיר", maxScore: 3 },
      { text: "פתיחת נתיב אוויר", maxScore: 3 },
      { text: "בדיקת נשימה ואיכותה", maxScore: 3 },
      { text: "בדיקת מחזור דם ושליטה על דימום", maxScore: 3 },
      { text: "הערכת רמת הכרה (AVPU/GCS)", maxScore: 3 },
      { text: "זיהוי ומענה לאיומים מיידים לחיים", maxScore: 3 },
    ],
  },
  {
    id: "focused",
    title: "הערכה ממוקדת",
    items: [
      { text: "שאלות רלוונטיות לתלונה ראשית (OPQRST/SAMPLE)", maxScore: 3 },
      { text: "בדיקה גופנית ממוקדת", maxScore: 3 },
      { text: "ניטור: SpO2, BP, דופק, RR", maxScore: 3 },
      { text: "שימוש בכלי אבחון (ECG, גלוקוז)", maxScore: 3 },
      { text: "זיהוי אבחנה עיקרית", maxScore: 3 },
    ],
  },
  {
    id: "treatment",
    title: "טיפול והתערבויות",
    items: [
      { text: "מתן חמצן בהתאם לאינדיקציה", maxScore: 3 },
      { text: "פתיחת גישה ורידית", maxScore: 3 },
      { text: "מתן תרופות מתאימות במינון נכון", maxScore: 3 },
      { text: "טכניקות ייצוב (ספליינט, חבישה, כולר)", maxScore: 3 },
      { text: "ניהול נתיב אוויר מתקדם", maxScore: 3 },
      { text: "הכנת ציוד חירום (דפיברילטור, BVM)", maxScore: 3 },
      { text: "עמידה בסדר עדיפויות טיפולי", maxScore: 3 },
    ],
  },
  {
    id: "monitoring",
    title: "ניטור ותיעוד",
    items: [
      { text: "ניטור מתמשך לאחר כל התערבות", maxScore: 3 },
      { text: "הערכה חוזרת ובדיקת תגובה לטיפול", maxScore: 3 },
      { text: "תיעוד מסודר של ממצאים", maxScore: 3 },
      { text: "ניטור זמנים קריטיים (תחילה, התדרדרות, טיפול)", maxScore: 3 },
    ],
  },
  {
    id: "comms",
    title: "תקשורת ופינוי",
    items: [
      { text: "Pre-alert מקצועי ומפורט לחדר מיון", maxScore: 3 },
      { text: "דיווח handover ברור", maxScore: 3 },
      { text: "קביעת עדיפות ואופן פינוי", maxScore: 3 },
    ],
  },
  {
    id: "skills",
    title: "כישורים מקצועיים",
    items: [
      { text: "שפת גוף, רוגע ומנהיגות", maxScore: 3 },
      { text: "עבודת צוות ותקשורת פנימית", maxScore: 3 },
      { text: "קבלת החלטות תחת לחץ", maxScore: 3 },
    ],
  },
];

const DEFAULT_FAIL_CRITERIA: string[] = [
  "לא בוצעה דפיברילציה בזמן (VF/VT ≤3 דקות)",
  "לא ניתן אדרנלין IM באנפילקסיס",
  "לא ניתן מגנזיום סולפט באקלמפסיה",
  "ניקור מחט בצד הלא נכון (tension pneumothorax)",
  "לא ניתן נלוקסון ב-OD אופיואידים",
  "לא בוצע CPR כשנדרש",
  "מתן תרופה שגויה או מינון מסוכן",
  "עיכוב פינוי מסכן חיים מעל 15 דקות",
];

type ScoreVal = -1 | 0 | 1 | 2 | 3; // -1 = לא רלוונטי (N/A)

export default function GraduationPage() {
  const router = useRouter();

  // ── Password gate — NO sessionStorage, NO cache. Every entry requires password. ──
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [passChecking, setPassChecking] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditorUser, setIsEditorUser] = useState(false);
  // Config editor (paz.gutman@gmail.com + hagayas2001@gmail.com only)
  const [isPazOrAdmin, setIsPazOrAdmin] = useState(false);
  // Supervisor live view access
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [configEditorOpen, setConfigEditorOpen] = useState(false);
  const [liveRubric, setLiveRubric] = useState<RubricCategory[]>(DEFAULT_RUBRIC);
  const [liveFailCriteria, setLiveFailCriteria] = useState<string[]>(DEFAULT_FAIL_CRITERIA);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  // Hidden rubric items (canEdit users only)
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  // Change-password mode
  const [changePassMode, setChangePassMode] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [changeSaving, setChangeSaving] = useState(false);
  const [changeSaved, setChangeSaved] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/dashboard"); return; }
      // Determine if admin (for showing change-password button inside the exam)
      const SUPERVISOR_EMAILS = ["hagayas2001@gmail.com", "paz.gutman@gmail.com", "danbenishi@gmail.com"];
      const admin = user.email === "hagayas2001@gmail.com";
      if (admin) {
        setIsAdmin(true);
        setIsSupervisor(true);
      } else {
        const { data: p } = await supabase.from("profiles").select("role, faculty, permissions").eq("id", user.id).single();
        const adminUser = (p as any)?.faculty === "אדמיניסטרציה" || ["root","מנהל מערכת"].includes((p as any)?.role ?? "");
        const editorUser = adminUser || ["מדריך ראשי","מדריך"].includes((p as any)?.role ?? "") || (p as any)?.permissions?.can_edit_scenarios === true;
        const supervisorUser = adminUser || (p as any)?.permissions?.supervisor_access === true || SUPERVISOR_EMAILS.includes(user.email ?? "");
        setIsAdmin(adminUser);
        setIsEditorUser(editorUser);
        setIsSupervisor(supervisorUser);
      }
      setIsPazOrAdmin(user.email === "paz.gutman@gmail.com" || user.email === "hagayas2001@gmail.com");

      // Load graduation_config
      const { data: cfg } = await supabase.from("graduation_config").select("rubric, fail_criteria").eq("id", "default").maybeSingle();
      if (cfg?.rubric && Array.isArray(cfg.rubric) && cfg.rubric.length > 0) {
        setLiveRubric(cfg.rubric as RubricCategory[]);
      }
      if (cfg?.fail_criteria && Array.isArray(cfg.fail_criteria) && cfg.fail_criteria.length > 0) {
        setLiveFailCriteria(cfg.fail_criteria as string[]);
      }
      // Always load examiner name from profile (overrides any cached/stale localStorage value)
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const name = (prof as any)?.full_name;
      if (name) {
        setExaminer(name);
        localStorage.setItem("mda_examiner", name);
      }
      // EVERYONE — including admin — must enter the password. No bypass. No cache.
    }
    checkAdmin();
  }, [router]);

  const handleUnlock = async () => {
    setPassChecking(true);
    setPassError("");
    try {
      // Verify user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }

      const { data } = await supabase.from("app_settings").select("value").eq("key", "graduation_password_20_05_26").maybeSingle();
      // value is JSONB — could be a JSON string like "\"password\"" or plain string
      const raw = data?.value;
      const stored = (typeof raw === "string" ? raw : JSON.stringify(raw) ?? "").replace(/^"|"$/g, "").trim();
      if (!stored) {
        setPassError("סיסמה לא הוגדרה עדיין — פנה למנהל המערכת");
        return;
      }
      if (passInput.trim() === stored) {
        // No sessionStorage — just set in-memory state
        setUnlocked(true);
      } else {
        setPassError("סיסמה שגויה ❌");
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
      // Store password as JSON string (value column is JSONB)
      await supabase.from("app_settings").upsert({ key: "graduation_password_20_05_26", value: JSON.stringify(newPass.trim()), updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "key" });
      setChangeSaved(true);
      setNewPass("");
      setTimeout(() => { setChangeSaved(false); setChangePassMode(false); }, 2000);
    } catch {
      // ignore
    } finally {
      setChangeSaving(false);
    }
  };

  // ── Graduation config realtime sync ──────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("graduation-config-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "graduation_config" }, async () => {
        const { data: cfg } = await supabase.from("graduation_config").select("rubric, fail_criteria").eq("id", "default").maybeSingle();
        if (cfg?.rubric && Array.isArray(cfg.rubric) && cfg.rubric.length > 0) setLiveRubric(cfg.rubric as RubricCategory[]);
        if (cfg?.fail_criteria && Array.isArray(cfg.fail_criteria) && cfg.fail_criteria.length > 0) setLiveFailCriteria(cfg.fail_criteria as string[]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("graduation_config").upsert({
        id: "default",
        rubric: liveRubric,
        fail_criteria: liveFailCriteria,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } finally {
      setConfigSaving(false);
    }
  };

  // ── All state must be declared before any conditional return ─────────────
  // Main page tab
  const [pageTab, setPageTab] = useState<"exam" | "tracking" | "assign" | "editscenario" | "archive" | "bank" | "config" | "supervisor" | "grades">("exam");
  // Scenario editing
  const [editScenarioId, setEditScenarioId] = useState<string | null>(null); // DB id of the scenario being edited
  const [editScenarioCode, setEditScenarioCode] = useState("");
  const [editScenarioTitle, setEditScenarioTitle] = useState("");
  const [editStory, setEditStory] = useState("");
  const [editVitals, setEditVitals] = useState<Record<string, string>>({});
  const [editPhasesJson, setEditPhasesJson] = useState("");
  const [editPhasesError, setEditPhasesError] = useState("");
  const [editScenarioSaving, setEditScenarioSaving] = useState(false);
  const [editScenarioSaved, setEditScenarioSaved] = useState(false);
  const [editScenarioError, setEditScenarioError] = useState("");
  const [savedScenarios, setSavedScenarios] = useState<{id: string; title: string; code: string}[]>([]);

  // ── Archive tab ───────────────────────────────────────────────────────────
  type ArchiveRow = {
    id: string;
    candidate_name: string;
    candidate_id?: string | null;
    group_number: number;
    scenario_title: string;
    scenario_id: string;
    pct: number;
    passed: boolean;
    examiner: string;
    saved_at: string;
    score: number;
    max_score: number;
    manual_override?: string;
    rubric_data?: { scores?: Record<string, number>; failChecked?: Record<string, boolean>; manualOverride?: string } | null;
    answers?: { _started_at?: string | null; _notes?: { impression?: string; strengths?: string; improvements?: string; recommendation?: string } } | null;
  };
  const [archiveRows, setArchiveRows] = useState<ArchiveRow[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState("");
  const [deletingArchiveId, setDeletingArchiveId] = useState<string | null>(null);

  // Grades tab — same data as archive but presented as a grade sheet
  type GradeRow = { id: string; candidate_name: string; candidate_id?: string | null; group_number?: number; scenario_title?: string; scenario_id?: string; score: number; max_score: number; pct: number; passed: boolean; examiner?: string; saved_at: string };
  const [gradesRows, setGradesRows] = useState<GradeRow[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesFilter, setGradesFilter] = useState("");

  const deleteArchiveRow = async (id: string) => {
    if (!confirm("למחוק בחינה זו מהארכיון? פעולה בלתי הפיכה.")) return;
    setDeletingArchiveId(id);
    await supabase.from("exam_archive").delete().eq("id", id);
    setArchiveRows(prev => prev.filter(r => r.id !== id));
    setDeletingArchiveId(null);
  };

  // ── Scenario bank tab ─────────────────────────────────────────────────────
  type ScenarioSlot = { code: string; title: string };
  type BankEntry = { candidateName: string; groupId: number; slots: ScenarioSlot[]; saved: boolean; saving: boolean };
  const EMPTY_SLOTS: ScenarioSlot[] = [{code:"",title:""},{code:"",title:""},{code:"",title:""},{code:"",title:""}];
  const [bank, setBank] = useState<BankEntry[]>(() =>
    GROUPS.flatMap(g => g.candidates.map(c => ({ candidateName: c, groupId: g.id, slots: EMPTY_SLOTS.map(s=>({...s})), saved: false, saving: false })))
  );
  const [bankDbLoaded, setBankDbLoaded] = useState(false);
  const [bankScenarios, setBankScenarios] = useState<{id: string; code: string; title: string; badge: string; category: string}[]>([]);

  // ── Assigned scenarios for current candidate (step 3) ────────────────────
  const [assignedForCandidate, setAssignedForCandidate] = useState<ScenarioSlot[]>([]);

  useEffect(() => {
    if (pageTab === "editscenario") {
      supabase.from("mda_scenarios").select("id, title, story, vitals, code").eq("graduation_only", true).then(({ data }) => {
        if (data) setSavedScenarios(data.map((d: any) => ({ id: d.id, title: d.title || d.id, code: d.code || d.id })));
      });
    }
  }, [pageTab]);

  useEffect(() => {
    if (pageTab !== "archive") return;

    // Initial load
    setArchiveLoading(true);
    supabase.from("exam_archive")
      .select("id, candidate_name, candidate_id, group_number, scenario_title, scenario_id, pct, passed, examiner, saved_at, score, max_score, rubric_data, answers")
      .eq("exam_type", "graduation")
      .order("saved_at", { ascending: false })
      .then(({ data }) => {
        setArchiveRows((data ?? []) as ArchiveRow[]);
        setArchiveLoading(false);
      });

    // Realtime — כל שמירה של כל בוחן מתעדכנת מיד לכולם
    const ch = supabase
      .channel("graduation-archive-sync")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "exam_archive",
        filter: "exam_type=eq.graduation",
      }, (payload) => {
        const row = payload.new as ArchiveRow;
        setArchiveRows(prev => {
          // avoid duplicates
          if (prev.some(r => r.id === row.id)) return prev;
          return [row, ...prev];
        });
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "exam_archive",
        filter: "exam_type=eq.graduation",
      }, (payload) => {
        const row = payload.new as ArchiveRow;
        setArchiveRows(prev => prev.map(r => r.id === row.id ? row : r));
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "exam_archive",
      }, (payload) => {
        setArchiveRows(prev => prev.filter(r => r.id !== (payload.old as any).id));
      })
      .subscribe();

    return () => { ch.unsubscribe(); };
  }, [pageTab]);

  useEffect(() => {
    if (pageTab !== "grades") return;
    setGradesLoading(true);
    supabase.from("exam_archive")
      .select("id, candidate_name, candidate_id, group_number, scenario_title, scenario_id, score, max_score, pct, passed, examiner, saved_at")
      .eq("exam_type", "graduation")
      .order("saved_at", { ascending: false })
      .then(({ data }) => {
        setGradesRows((data ?? []) as GradeRow[]);
        setGradesLoading(false);
      });
  }, [pageTab]);

  useEffect(() => {
    if (pageTab === "bank" && !bankDbLoaded) {
      // Load available scenarios + existing assignments in parallel
      Promise.all([
        supabase.from("mda_scenarios").select("id, code, title, badge").eq("graduation_only", true).order("code"),
        supabase.from("candidate_scenarios").select("*").order("group_number"),
      ]).then(([scenRes, assignRes]) => {
        if (scenRes.data) {
          setBankScenarios(scenRes.data.map((d: any) => ({
            id: d.id, code: d.code || d.id, title: d.title || d.id, badge: d.badge || "🚑", category: d.category || "cardiac",
          })));
        }
        if (assignRes.data && assignRes.data.length > 0) {
          setBank(prev => prev.map(entry => {
            const row = (assignRes.data as any[]).find(d => d.candidate_name === entry.candidateName);
            if (row) {
              // Load from scenarios_json if available, else fallback to single scenario
              const loaded: ScenarioSlot[] = Array.isArray(row.scenarios_json) && row.scenarios_json.length > 0
                ? row.scenarios_json
                : [{ code: row.scenario_code ?? "", title: row.scenario_title ?? "" }, {code:"",title:""},{code:"",title:""},{code:"",title:""}];
              // Pad to 4 slots
              while (loaded.length < 4) loaded.push({code:"",title:""});
              return { ...entry, slots: loaded.slice(0, 4) };
            }
            return entry;
          }));
        }
        setBankDbLoaded(true);
      }).catch(() => setBankDbLoaded(true));
    }
  }, [pageTab, bankDbLoaded]);

  const saveBankEntry = async (candidateName: string) => {
    setBank(prev => prev.map(e => e.candidateName === candidateName ? { ...e, saving: true } : e));
    const entry = bank.find(e => e.candidateName === candidateName);
    if (!entry) return;
    const { data: { user } } = await supabase.auth.getUser();
    const filledSlots = entry.slots.filter(s => s.title.trim());
    const firstSlot = filledSlots[0] ?? { code: "", title: "" };
    const existing = await supabase.from("candidate_scenarios").select("id").eq("candidate_name", candidateName).maybeSingle();
    if (existing.data?.id) {
      await supabase.from("candidate_scenarios").update({
        scenario_title: firstSlot.title,
        scenario_code: firstSlot.code || null,
        scenarios_json: entry.slots,
        group_number: entry.groupId,
      }).eq("id", existing.data.id);
    } else {
      await supabase.from("candidate_scenarios").insert({
        candidate_name: candidateName,
        group_number: entry.groupId,
        scenario_title: firstSlot.title,
        scenario_code: firstSlot.code || null,
        scenarios_json: entry.slots,
        done: false,
        created_by: user?.id,
      });
    }
    setBank(prev => prev.map(e => e.candidateName === candidateName ? { ...e, saving: false, saved: true } : e));
    setTimeout(() => setBank(prev => prev.map(e => e.candidateName === candidateName ? { ...e, saved: false } : e)), 2000);
  };

  const handleEditScenarioSave = async () => {
    if (!editScenarioTitle.trim()) return;
    setEditPhasesError("");
    setEditScenarioSaving(true);
    setEditScenarioError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Keep original DB id when editing existing; generate new id only for new scenarios
      const id = editScenarioId ?? (editScenarioCode.trim() || editScenarioTitle.trim().replace(/\s+/g, "_").slice(0, 30));
      // Convert liveRubric (visual editor) back to phases format for DB
      const phases = liveRubric.map(cat => ({
        id: cat.id,
        name: cat.title,
        steps: cat.items.map((item, i) => ({
          num: i + 1,
          action: item.text,
          expected: item.expected ?? "",
          maxScore: item.maxScore,
        })),
      }));
      const { error } = await supabase.from("mda_scenarios").upsert({
        id,
        code: editScenarioCode.trim() || id,
        title: editScenarioTitle.trim(),
        story: editStory,
        vitals: editVitals,
        phases,
        fail_criteria: liveFailCriteria,
        graduation_only: true,
        category: "graduation",
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
  // Bulk assign: candidateName → 4 slots
  type BulkSlot = { code: string; title: string };
  const EMPTY_BULK_SLOT: BulkSlot = { code: "", title: "" };
  const [bulkMap, setBulkMap] = useState<Record<string, BulkSlot[]>>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaved, setBulkSaved] = useState(false);

  const [trackingArchive, setTrackingArchive] = useState<{candidate_name: string; scenario_title: string; scenario_id: string | null; passed: boolean}[]>([]);

  useEffect(() => {
    if (pageTab === "tracking" || pageTab === "assign") {
      setLoadingTracking(true);
      Promise.all([
        supabase.from("candidate_scenarios").select("*").order("group_number"),
        supabase.from("exam_archive").select("candidate_name, scenario_title, scenario_id, passed").order("saved_at", { ascending: false }),
      ]).then(([{ data: scenData }, { data: archData }]) => {
        setCandidateScenarios((scenData as CandidateScenario[]) ?? []);
        setTrackingArchive((archData ?? []) as any);
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
  const [scenarioStory, setScenarioStory] = useState<string>("");
  const [scenarioVitals, setScenarioVitals] = useState<Record<string, string>>({});

  // Load assigned scenarios when candidate selected (step 3)
  useEffect(() => {
    if (step === 3 && candidate) {
      setAssignedForCandidate([]);
      supabase.from("candidate_scenarios")
        .select("scenarios_json, scenario_title, scenario_code")
        .eq("candidate_name", candidate)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          const slots: ScenarioSlot[] = Array.isArray(data.scenarios_json) && data.scenarios_json.length > 0
            ? (data.scenarios_json as ScenarioSlot[]).filter((s: ScenarioSlot) => s.title?.trim())
            : data.scenario_title ? [{ code: data.scenario_code ?? "", title: data.scenario_title }] : [];
          setAssignedForCandidate(slots);
        });
    }
  }, [step, candidate]);

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
  const [candidateId, setCandidateId] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState({
    impression: "",
    strengths: "",
    improvements: "",
    recommendation: "",
  });
  // Which rubric categories are open
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Item timestamps: key → "HH:MM:SS"
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const [editingTs, setEditingTs] = useState<string | null>(null);
  const [editingTsVal, setEditingTsVal] = useState<string>("");
  const stampTime = (key: string) => {
    const now = new Date();
    const t = now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const next = { ...timestamps, [key]: t };
    setTimestamps(next);
    writeLiveState({ timestamps: next });
  };
  const openEditTs = (key: string, current: string) => {
    setEditingTs(key);
    setEditingTsVal(current);
  };
  const commitEditTs = (key: string) => {
    if (!editingTsVal) { setEditingTs(null); return; }
    const next = { ...timestamps, [key]: editingTsVal };
    setTimestamps(next);
    writeLiveState({ timestamps: next });
    setEditingTs(null);
  };

  // Live board — active exams visible to supervisor
  type ActiveExam = { candidate: string; examiner: string; scenarioTitle: string; pct: number; ts: number };
  const [activeExams, setActiveExams] = useState<Record<string, ActiveExam>>({});
  const liveBoardRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to live board channel (always, for supervisor tab)
  useEffect(() => {
    const ch = supabase.channel("graduation-live-board", { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "exam_active" }, ({ payload }: any) => {
      if (!payload?.candidate) return;
      if (payload.active === false) {
        setActiveExams(prev => { const n = {...prev}; delete n[payload.candidate]; return n; });
      } else {
        setActiveExams(prev => ({ ...prev, [payload.candidate]: {
          candidate: payload.candidate,
          examiner: payload.examiner ?? "",
          scenarioTitle: payload.scenarioTitle ?? "",
          pct: payload.pct ?? 0,
          ts: payload.ts ?? Date.now(),
        }}));
      }
    });
    ch.subscribe();
    liveBoardRef.current = ch;
    return () => { ch.unsubscribe(); liveBoardRef.current = null; };
  }, []);

  // Broadcast active exam status when in step 4
  const broadcastActive = (active: boolean, overridePct?: number) => {
    liveBoardRef.current?.send({
      type: "broadcast", event: "exam_active",
      payload: { candidate, examiner, scenarioTitle, active, pct: overridePct ?? pct, ts: Date.now() },
    });
  };

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notesError, setNotesError] = useState(false);

  // ── Realtime sync ─────────────────────────────────────────────────────────
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);

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

  // Subscribe/unsubscribe to realtime channel when step changes
  // Channel name is ASCII-only to avoid Hebrew encoding issues in Supabase Realtime
  useEffect(() => {
    if (step === 4 && candidate) {
      const ch = supabase.channel("graduation-live-state", { config: { broadcast: { self: true } } });
      ch.on("broadcast", { event: "score_update" }, () => {
        // no-op: examiner is source of truth
      });
      ch.subscribe((status) => {
        setLiveConnected(status === "SUBSCRIBED");
      });
      channelRef.current = ch;
      return () => {
        ch.unsubscribe();
        channelRef.current = null;
        setLiveConnected(false);
      };
    }
  }, [step, candidate]);

  // Keep a ref of latest state so heartbeat always sends fresh data without re-creating the interval
  const liveStateRef = useRef({ scores, failChecked, timestamps, notes, candidate, candidateId, examiner, scenarioTitle, groupId });
  useEffect(() => {
    liveStateRef.current = { scores, failChecked, timestamps, notes, candidate, candidateId, examiner, scenarioTitle, groupId };
  }, [scores, failChecked, timestamps, notes, candidate, candidateId, examiner, scenarioTitle, groupId]);

  // Write live state to DB every 2s — monitor reads via Postgres Realtime (reliable)
  useEffect(() => {
    if (step !== 4) return;
    const upsertState = () => {
      const s = liveStateRef.current;
      if (!s.candidate) return;
      supabase.from("graduation_live_state").upsert({
        candidate_name: s.candidate,
        state: {
          scores: s.scores,
          failChecked: s.failChecked,
          timestamps: s.timestamps,
          notes: s.notes,
          candidateId: s.candidateId,
          examiner: s.examiner,
          scenarioTitle: s.scenarioTitle,
          groupId: s.groupId,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: "candidate_name" });
    };
    upsertState(); // immediate write on enter
    const interval = setInterval(upsertState, 2000);
    return () => {
      clearInterval(interval);
      // Clear live state when exam ends
      const s = liveStateRef.current;
      if (s.candidate) supabase.from("graduation_live_state").delete().eq("candidate_name", s.candidate);
    };
  }, [step]);

  const resetExam = () => {
    broadcastActive(false);
    setStep(1);
    setGroupId(null);
    setCandidate("");
    setScenarioCode("");
    setScenarioTitle("");
    setScores({});
    setFailChecked({});
    setTimestamps({});
    setManualOverride(null);
    setExaminer(localStorage.getItem("mda_examiner") ?? "");
    setSaving(false);
    setSaved(false);
    setOpenCategories({});
    setHiddenItems(new Set());
    setStartTime(null);
    setNotes({ impression: "", strengths: "", improvements: "", recommendation: "" });
    setCandidateId("");
  };

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const selectedGroup = GROUPS.find((g) => g.id === groupId);

  // catId may be undefined for DB-loaded rubric rows that lack an id field — MUST be before totalMax/totalEarned
  const scoreKey = (catId: string | undefined, idx: number) =>
    catId ? `${catId}.${idx}` : `__cat${idx}`;

  // Compute totals — defensive array validation, exclude N/A (-1) and hidden items
  const safeRubric = Array.isArray(liveRubric) ? liveRubric : [];
  const totalMax = safeRubric.reduce((s, cat) =>
    s + cat.items.reduce((cs, item, idx) => {
      const k = scoreKey(cat.id, idx);
      if (hiddenItems.has(k)) return cs;
      const v = scores[k];
      if (v === -1) return cs; // N/A
      return cs + item.maxScore;
    }, 0)
  , 0);
  const totalEarned = safeRubric.reduce((s, cat) =>
    s + cat.items.reduce((cs, item, idx) => {
      const k = scoreKey(cat.id, idx);
      if (hiddenItems.has(k)) return cs;
      const v = scores[k] ?? 0;
      if (v === -1) return cs; // N/A excluded
      return cs + (v / 3) * item.maxScore;
    }, 0)
  , 0);
  const totalEarnedRounded = Math.round(totalEarned * 10) / 10;
  const pct = totalMax === 0 ? 0 : Math.round((totalEarned / totalMax) * 100);
  const anyFail = Object.values(failChecked).some(Boolean);
  const passed = manualOverride
    ? manualOverride === "pass"
    : !anyFail && pct >= 60;

  const writeLiveState = (overrides: Partial<typeof liveStateRef.current> = {}) => {
    const s = { ...liveStateRef.current, ...overrides };
    if (!s.candidate) return;
    supabase.from("graduation_live_state").upsert({
      candidate_name: s.candidate,
      state: { scores: s.scores, failChecked: s.failChecked, timestamps: s.timestamps, notes: s.notes, candidateId: s.candidateId, examiner: s.examiner, scenarioTitle: s.scenarioTitle, groupId: s.groupId },
      updated_at: new Date().toISOString(),
    }, { onConflict: "candidate_name" });
  };

  const setScore = (catId: string | undefined, idx: number, val: ScoreVal) => {
    const k = scoreKey(catId, idx);
    const next = { ...scores, [k]: val };
    setScores(next);
    writeLiveState({ scores: next });
    // Update live board score
    const newEarned = safeRubric.reduce((s, cat) => s + cat.items.reduce((cs, item, i) => {
      const v = next[scoreKey(cat.id, i)] ?? 0; return v === -1 ? cs : cs + (v / 3) * item.maxScore;
    }, 0), 0);
    const newMax = safeRubric.reduce((s, cat) => s + cat.items.reduce((cs, item, i) => {
      const v = next[scoreKey(cat.id, i)]; return v === -1 ? cs : cs + item.maxScore;
    }, 0), 0);
    const newPct = newMax === 0 ? 0 : Math.round((newEarned / newMax) * 100);
    liveBoardRef.current?.send({ type: "broadcast", event: "exam_active",
      payload: { candidate, examiner, scenarioTitle, active: true, pct: newPct, ts: Date.now() } });
  };
  const getScore = (catId: string | undefined, idx: number): ScoreVal =>
    ((scores[scoreKey(catId, idx)] ?? 0) as ScoreVal);

  const generateArchivePDF = async (row: ArchiveRow) => {
    const { generateExamPDF } = await import("@/lib/examPDF");
    const rowScores: Record<string, number> = row.rubric_data?.scores ?? {};
    const rowFailChecked: Record<string, boolean> = row.rubric_data?.failChecked ?? {};
    const rowNotes = row.answers?._notes;
    generateExamPDF({
      type: "graduation",
      candidateName: row.candidate_name,
      candidateId: row.candidate_id ?? undefined,
      groupNumber: row.group_number ?? undefined,
      scenarioTitle: row.scenario_title || row.scenario_id,
      scenarioCode: row.scenario_id,
      examiner: row.examiner,
      startTime: row.answers?._started_at ? new Date(row.answers._started_at) : undefined,
      endTime: new Date(row.saved_at),
      score: row.score,
      maxScore: row.max_score,
      pct: row.pct,
      passed: row.passed,
      rubricCategories: liveRubric.map((cat) => ({
        title: cat.title,
        items: cat.items.map((item, i) => ({
          text: item.text,
          score: (rowScores[scoreKey(cat.id, i)] ?? 0) as ScoreVal,
          max: item.maxScore,
        })),
      })),
      failChecked: Object.entries(rowFailChecked)
        .filter(([, v]) => v)
        .map(([k]) => liveFailCriteria[Number(k)] ?? k),
      notes: rowNotes ? {
        impression: rowNotes.impression ?? "",
        strengths: rowNotes.strengths ?? "",
        improvements: rowNotes.improvements ?? "",
        recommendation: rowNotes.recommendation ?? "",
      } : undefined,
    });
  };

  const buildPDFPayload = () => ({
    type: "graduation" as const,
    candidateName: candidate,
    candidateId,
    groupNumber: groupId ?? undefined,
    scenarioTitle: scenarioTitle || scenarioCode,
    scenarioCode,
    examiner,
    startTime: startTime ?? undefined,
    endTime: new Date(),
    score: totalEarnedRounded,
    maxScore: totalMax,
    pct,
    passed,
    rubricCategories: safeRubric.map((cat) => ({
      title: cat.title,
      items: cat.items.map((item, i) => ({
        text: item.text,
        score: getScore(cat.id, i),
        max: item.maxScore,
        timestamp: timestamps[scoreKey(cat.id, i)],
      })),
    })),
    failChecked: Object.entries(failChecked)
      .filter(([, v]) => v)
      .map(([k]) => liveFailCriteria[Number(k)] ?? k),
    notes,
  });

  const toggleHideItem = (key: string) => {
    setHiddenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const endTime = new Date();
    try {
      if (!notes.strengths.trim()) {
        setNotesError(true);
        document.getElementById("notes-section")?.scrollIntoView({ behavior: "smooth" });
        setSaving(false);
        return;
      }
      setNotesError(false);

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
        score: totalEarnedRounded,
        max_score: totalMax,
        pct,
        passed,
        rubric_data: { scores, failChecked, manualOverride },
        candidate_name: candidate,
        candidate_id: candidateId || null,
        group_number: groupId,
        examiner,
        saved_at: new Date().toISOString(),
      });

      if (error) throw error;
      setSaved(true);
      broadcastActive(false);
      // Refresh grades table if open
      setGradesRows(prev => [{
        id: (Math.random()).toString(),
        candidate_name: candidate,
        candidate_id: candidateId || null,
        group_number: groupId ?? undefined,
        scenario_title: scenarioTitle || scenarioCode,
        scenario_id: scenarioCode,
        score: totalEarnedRounded,
        max_score: totalMax,
        pct,
        passed,
        examiner,
        saved_at: new Date().toISOString(),
      } as GradeRow, ...prev]);

      // Auto-generate + open PDF
      const { generateExamPDF } = await import("@/lib/examPDF");
      generateExamPDF(buildPDFPayload());
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
              {/* Admin auto-unlocks via useEffect — no bypass button needed */}
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
            {isPazOrAdmin && <button onClick={() => setPageTab("config")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2 flex items-center justify-center gap-1", pageTab === "config" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-gray-200")}><Settings size={12} /> בחינה</button>}
            <button onClick={() => setPageTab("grades")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2", pageTab === "grades" ? "bg-teal-600 text-white" : "text-gray-400 hover:text-gray-200")}>📊 ציונים</button>
            {isSupervisor && <button onClick={() => setPageTab("supervisor")} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap px-2 relative", pageTab === "supervisor" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-gray-200")}>
              👁 מפקח
              {Object.keys(activeExams).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{Object.keys(activeExams).length}</span>
              )}
            </button>}
          </div>

          {/* EDIT SCENARIO TAB — full exam preview with inline editing */}
          {pageTab === "editscenario" && isAdmin && (
            <div className="print:hidden space-y-4">

              {/* Scenario picker */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400">בחר תרחיש לעריכה</p>
                  <button onClick={() => { setEditScenarioId(null); setEditScenarioCode(""); setEditScenarioTitle(""); setEditStory(""); setEditVitals({}); setEditPhasesJson("[]"); setEditPhasesError(""); }}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors">+ תרחיש חדש</button>
                </div>
                <div className="space-y-1">
                  {savedScenarios.map(s => (
                    <div key={s.id} className={cn(
                      "flex items-center gap-1 rounded-lg border transition-colors",
                      editScenarioId === s.id
                        ? "bg-orange-600/20 border-orange-500/40"
                        : "bg-gray-800 border-transparent hover:border-gray-600"
                    )}>
                      {/* Select to edit */}
                      <button onClick={async () => {
                        const { data } = await supabase.from("mda_scenarios").select("*").eq("id", s.id).maybeSingle();
                        if (data) {
                          setEditScenarioId(data.id);
                          setEditScenarioCode(data.code || "");
                          setEditScenarioTitle(data.title || "");
                          setEditStory(data.story || "");
                          setEditVitals((data.vitals as Record<string, string>) || {});
                          setEditPhasesJson(JSON.stringify(data.phases || [], null, 2));
                          setEditPhasesError("");
                          // Load THIS scenario's phases into the live rubric editor
                          if (data.phases && Array.isArray(data.phases) && data.phases.length > 0) {
                            const rubric = (data.phases as any[]).map((ph: any) => {
                              const steps = ph.steps ?? ph.actions ?? [];
                              return {
                                id: ph.id ?? ph.name ?? String(Math.random()),
                                title: ph.name ?? ph.title ?? "שלב",
                                items: steps.map((s: any) => ({
                                  text: s.action ?? s.text ?? "",
                                  maxScore: s.maxScore ?? 3,
                                  expected: s.expected ?? null,
                                })),
                              };
                            });
                            setLiveRubric(rubric);
                          } else {
                            setLiveRubric([]);
                          }
                          if (data.fail_criteria && Array.isArray(data.fail_criteria)) {
                            setLiveFailCriteria(data.fail_criteria as string[]);
                          } else {
                            setLiveFailCriteria([]);
                          }
                        }
                      }} className="flex-1 text-right px-3 py-2 text-sm flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">{s.code}</span>
                        <span className={cn("flex-1", editScenarioId === s.id ? "text-orange-300" : "text-gray-300")}>{s.title}</span>
                        {editScenarioId === s.id && <span className="text-[10px] text-orange-400">עורך</span>}
                      </button>
                      {/* Delete */}
                      <button onClick={async () => {
                        if (!confirm(`למחוק את התרחיש "${s.title}"? לא ניתן לשחזר.`)) return;
                        await supabase.from("mda_scenarios").delete().eq("id", s.id);
                        setSavedScenarios(prev => prev.filter(x => x.id !== s.id));
                        if (editScenarioId === s.id) {
                          setEditScenarioId(null); setEditScenarioCode(""); setEditScenarioTitle(""); setEditStory(""); setEditVitals({}); setEditPhasesJson("[]");
                        }
                      }} className="px-2 py-2 text-red-500/40 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── EXAM PREVIEW EDIT MODE ── */}
              <div className="space-y-3">
                {/* Header — scenario identity */}
                <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wide">✏️ פרטי תרחיש</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">קוד</label>
                      <input value={editScenarioCode} onChange={e => setEditScenarioCode(e.target.value)}
                        placeholder="C01" className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white font-mono focus:outline-none focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">שם תרחיש *</label>
                      <input value={editScenarioTitle} onChange={e => setEditScenarioTitle(e.target.value)}
                        placeholder="שם התרחיש..." className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>

                  {/* Story — what the examiner reads to the candidate */}
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">מלל תרחיש — מה הבוחן מוסר לנבחן</label>
                    <textarea value={editStory} onChange={e => setEditStory(e.target.value)}
                      rows={4} placeholder="לדוגמה: נורית, בת 59, התמוטטה בביתה לאחר שהתלוננה על חולשה..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 resize-y" />
                  </div>

                  {/* Vitals */}
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">מדדים (שורה לכל מדד: מפתח: ערך)</label>
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
                      rows={3} placeholder={"pulse: 120\nbp: 90/60\nspo2: 94%\nrr: 22"}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500 resize-none" dir="ltr" />
                  </div>
                </div>

                {/* ── Rubric — rendered exactly like exam, but text is editable ── */}
                <p className="text-xs font-semibold text-gray-400 px-1">רובריקת הערכה — עריכה ישירה בתוך מבנה הבחינה</p>
                {liveRubric.map((cat, catIdx) => (
                  <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    {/* Category header */}
                    <div className="flex items-center gap-2 px-4 min-h-[44px] bg-gray-800/80 border-b border-gray-700">
                      {/* Reorder ▲▼ */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => setLiveRubric(prev => {
                            if (catIdx === 0) return prev;
                            const next = [...prev];
                            [next[catIdx - 1], next[catIdx]] = [next[catIdx], next[catIdx - 1]];
                            return next;
                          })}
                          disabled={catIdx === 0}
                          className="text-gray-600 hover:text-orange-400 disabled:opacity-20 transition-colors"
                          title="הזז למעלה"
                        ><ChevronUp size={13} /></button>
                        <button
                          onClick={() => setLiveRubric(prev => {
                            if (catIdx === prev.length - 1) return prev;
                            const next = [...prev];
                            [next[catIdx], next[catIdx + 1]] = [next[catIdx + 1], next[catIdx]];
                            return next;
                          })}
                          disabled={catIdx === liveRubric.length - 1}
                          className="text-gray-600 hover:text-orange-400 disabled:opacity-20 transition-colors"
                          title="הזז למטה"
                        ><ChevronDown size={13} /></button>
                      </div>
                      <GripVertical size={13} className="text-gray-700 shrink-0" />
                      <input
                        value={cat.title}
                        onChange={e => setLiveRubric(prev => prev.map((c, ci) => ci === catIdx ? { ...c, title: e.target.value } : c))}
                        className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none border-b border-transparent focus:border-orange-400 placeholder:text-gray-600"
                        placeholder="שם קטגוריה..."
                      />
                      <button onClick={() => { if (confirm("למחוק קטגוריה זו?")) setLiveRubric(prev => prev.filter((_, ci) => ci !== catIdx)); }}
                        className="p-1 text-red-500/40 hover:text-red-400 transition-colors shrink-0"><Trash2 size={13} /></button>
                    </div>

                    {/* Items — exam row style with editable text */}
                    <div className="px-3 py-2 space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2 min-h-[44px]">
                          {/* Score badge (decorative) */}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-700 text-gray-600 shrink-0 w-12 text-center">
                            0/{item.maxScore}
                          </span>
                          {/* Editable text — exactly where the label appears in the exam */}
                          <input
                            value={item.text}
                            onChange={e => setLiveRubric(prev => prev.map((c, ci) => ci === catIdx
                              ? { ...c, items: c.items.map((it, ii) => ii === itemIdx ? { ...it, text: e.target.value } : it) }
                              : c))}
                            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none border-b border-transparent focus:border-orange-400 placeholder:text-gray-600"
                            placeholder="פריט הערכה..."
                          />
                          {/* Max score */}
                          <input type="number" min={1} max={5} value={item.maxScore}
                            onChange={e => setLiveRubric(prev => prev.map((c, ci) => ci === catIdx
                              ? { ...c, items: c.items.map((it, ii) => ii === itemIdx ? { ...it, maxScore: Math.min(5, Math.max(1, Number(e.target.value))) } : it) }
                              : c))}
                            className="w-10 text-center bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 focus:outline-none h-7 shrink-0" title="ניקוד מקסימלי" />
                          {/* Decorative score buttons — same visual as exam */}
                          <div className="flex gap-1 shrink-0">
                            {([3,2,1,0] as const).map(v => (
                              <div key={v} className="w-9 h-9 rounded-lg text-sm font-bold border bg-gray-800 border-gray-700 text-gray-600 flex items-center justify-center">{v}</div>
                            ))}
                            <div className="w-9 h-9 rounded-lg text-sm font-bold border bg-gray-800 border-gray-700 text-gray-600 flex items-center justify-center">ל</div>
                          </div>
                          {/* Delete item */}
                          <button onClick={() => setLiveRubric(prev => prev.map((c, ci) => ci === catIdx
                            ? { ...c, items: c.items.filter((_, ii) => ii !== itemIdx) }
                            : c))} className="p-1 text-red-500/40 hover:text-red-400 transition-colors shrink-0">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add item */}
                    <div className="px-4 py-2 border-t border-gray-800">
                      <button onClick={() => setLiveRubric(prev => prev.map((c, ci) => ci === catIdx
                        ? { ...c, items: [...c.items, { text: "", maxScore: 3 }] }
                        : c))} className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                        <Plus size={12} /> הוסף פריט
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add category */}
                <button onClick={() => setLiveRubric(prev => [...prev, { id: `cat_${Date.now()}`, title: "קטגוריה חדשה", items: [{ text: "", maxScore: 3 }] }])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors text-sm w-full justify-center">
                  <Plus size={14} /> הוסף קטגוריה
                </button>

                {/* Fail criteria */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-red-400 flex items-center gap-2"><AlertTriangle size={12} /> קריטריוני כשלון אוטומטי</p>
                  {liveFailCriteria.map((fc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={fc} onChange={e => setLiveFailCriteria(prev => prev.map((c, ci) => ci === i ? e.target.value : c))}
                        className="flex-1 h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-red-500" placeholder="קריטריון כשלון..." />
                      <button onClick={() => setLiveFailCriteria(prev => prev.filter((_, ci) => ci !== i))}
                        className="p-1.5 text-red-500/40 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <button onClick={() => setLiveFailCriteria(prev => [...prev, ""])}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <Plus size={12} /> הוסף קריטריון
                  </button>
                </div>

                {/* Save all */}
                {editScenarioError && <p className="text-xs text-red-400">{editScenarioError}</p>}
                <div className="flex gap-2">
                  {editScenarioId && (
                    <button onClick={async () => {
                      if (!confirm(`למחוק את התרחיש "${editScenarioTitle}"? לא ניתן לשחזר.`)) return;
                      await supabase.from("mda_scenarios").delete().eq("id", editScenarioId);
                      setSavedScenarios(prev => prev.filter(x => x.id !== editScenarioId));
                      setEditScenarioId(null); setEditScenarioCode(""); setEditScenarioTitle(""); setEditStory(""); setEditVitals({}); setEditPhasesJson("[]");
                    }} className="px-4 py-3 rounded-xl bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-400 text-sm font-bold transition-colors flex items-center gap-2 shrink-0">
                      <Trash2 size={15} /> מחיקת תרחיש
                    </button>
                  )}
                  <button onClick={handleEditScenarioSave} disabled={editScenarioSaving || !editScenarioTitle.trim()}
                    className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    {editScenarioSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {editScenarioSaved ? "✓ נשמר!" : "שמירה"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIG TAB — rubric + fail criteria editor ── */}
          {pageTab === "config" && isPazOrAdmin && (
            <div className="print:hidden flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Settings size={32} className="text-gray-700" />
              <p className="text-sm font-semibold text-gray-400">הרובריקה נטענת אוטומטית מכל תרחיש</p>
              <p className="text-xs text-gray-600 max-w-xs">לעריכת הצ׳קליסט של תרחיש ספציפי — עבור לטאב <span className="text-violet-400">עריכה</span> ובחר תרחיש</p>
            </div>
          )}

          {/* ── BANK TAB — pre-assign scenarios ── */}
          {pageTab === "bank" && (
            <div className="print:hidden space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">מאגר תרחישים</p>
                  <p className="text-xs text-gray-500 mt-0.5">שייך תרחיש לכל נבחן מראש — יוצג אוטומטית בשלב 3 של הבחינה</p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm("למחוק את כל השיבוצים של כל הנבחנים? לא ניתן לשחזר.")) return;
                    await supabase.from("candidate_scenarios").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                    setBank(GROUPS.flatMap(g => g.candidates.map(c => ({ candidateName: c, groupId: g.id, slots: EMPTY_SLOTS.map(s=>({...s})), saved: false, saving: false }))));
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium"
                >
                  🗑 אפס הכל
                </button>
              </div>

              {!bankDbLoaded ? (
                <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-teal-400" /></div>
              ) : (
                <>
                  {/* Scenario catalog by category */}
                  {bankScenarios.length > 0 && (() => {
                    const CAT_LABELS: Record<string, string> = {
                      cardiac: "❤️ קרדיו",
                      respiratory: "🌬️ נשימתי",
                      trauma: "🚗 טראומה",
                      pediatric: "👶 פדיאטריה",
                      neuro: "🧠 נוירולוגיה",
                      obstetric: "🤰 מיילדות",
                      toxicology: "☠️ הרעלות",
                    };
                    const PRIORITY = ["cardiac","respiratory","trauma","pediatric","neuro","obstetric","toxicology"];
                    const grouped = bankScenarios.reduce((acc, s) => {
                      const cat = s.category || "cardiac";
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(s);
                      return acc;
                    }, {} as Record<string, typeof bankScenarios>);
                    const cats = [...PRIORITY.filter(c => grouped[c]), ...Object.keys(grouped).filter(c => !PRIORITY.includes(c))];
                    return (
                      <div className="bg-gray-900 border border-teal-500/20 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-gray-800 border-b border-teal-500/20">
                          <p className="text-xs font-semibold text-teal-400">📚 תרחישים זמינים ({bankScenarios.length})</p>
                        </div>
                        <div className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {cats.flatMap(cat => grouped[cat].map(s => (
                                  <div key={s.id} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg pl-1 pr-2 py-1">
                                    <span className="text-xs text-gray-300">
                                      <span className="font-mono text-gray-500 ml-1">{s.code}</span>{s.title}
                                    </span>
                                    {isEditorUser && (
                                      <a
                                        href={`/simulator/scenarios/${s.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5 mr-1 transition-colors"
                                        title="ערוך תרחיש"
                                      >✏️</a>
                                    )}
                                  </div>
                            )))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {bankScenarios.length === 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-400">
                      אין תרחישים ב-DB עדיין — הוסף תרחישים דרך טאב ״עריכה״ או ייבא ב-SQL
                    </div>
                  )}

                  {/* Per-candidate assignment */}
                  {GROUPS.map(g => (
                    <div key={g.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-400">קבוצה {g.id}</span>
                        <span className="text-xs text-gray-500">({g.candidates.length} נבחנים)</span>
                      </div>
                      <div className="divide-y divide-gray-800">
                        {g.candidates.map(cand => {
                          const entry = bank.find(e => e.candidateName === cand)!;
                          return (
                            <div key={cand} className="px-3 py-3 border-b border-gray-800 last:border-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-200">{cand}</span>
                                {isAdmin && (
                                  <button
                                    onClick={() => saveBankEntry(cand)}
                                    disabled={entry.saving || !entry.slots.some(s => s.title.trim())}
                                    className={cn(
                                      "h-7 px-3 rounded-lg text-xs font-semibold transition-colors",
                                      entry.saved ? "bg-green-600 text-white" : "bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white"
                                    )}
                                  >
                                    {entry.saving ? <Loader2 size={11} className="animate-spin" /> : entry.saved ? "✓ נשמר" : "שמור"}
                                  </button>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                {entry.slots.map((slot, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-600 w-4 text-center shrink-0">{idx + 1}</span>
                                    <select
                                      value={slot.code}
                                      onChange={e => {
                                        const sel = bankScenarios.find(s => s.code === e.target.value);
                                        setBank(prev => prev.map(b => {
                                          if (b.candidateName !== cand) return b;
                                          const newSlots = b.slots.map((s, i) => i === idx ? { code: e.target.value, title: sel?.title ?? "" } : s);
                                          return { ...b, slots: newSlots, saved: false };
                                        }));
                                      }}
                                      className="flex-1 h-7 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                                    >
                                      <option value="">— תרחיש {idx + 1} —</option>
                                      {bankScenarios.map(s => (
                                        <option key={s.id} value={s.code}>{s.badge} {s.code} — {s.title}</option>
                                      ))}
                                    </select>
                                    <input
                                      value={slot.title}
                                      onChange={e => setBank(prev => prev.map(b => {
                                        if (b.candidateName !== cand) return b;
                                        const newSlots = b.slots.map((s, i) => i === idx ? { ...s, title: e.target.value } : s);
                                        return { ...b, slots: newSlots, saved: false };
                                      }))}
                                      placeholder="שם ידני..."
                                      className="w-28 h-7 bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
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
                              <button
                                onClick={() => generateArchivePDF(row)}
                                title="הורד PDF"
                                className="shrink-0 p-1.5 text-purple-400/60 hover:text-purple-300 transition-colors"
                              >
                                <Printer size={14} />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => deleteArchiveRow(row.id)}
                                  disabled={deletingArchiveId === row.id}
                                  title="מחק בחינה זו"
                                  className="shrink-0 p-1.5 text-red-500/40 hover:text-red-400 transition-colors"
                                >
                                  {deletingArchiveId === row.id
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Trash2 size={14} />}
                                </button>
                              )}
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
                <div className="space-y-4">
                  {Array.from(new Set(candidateScenarios.map(r => r.group_number))).sort().map(gNum => {
                    const groupRows = candidateScenarios.filter(r => r.group_number === gNum);
                    // Count completed scenarios in this group
                    const totalSlots = groupRows.reduce((acc, row) => {
                      const slots: ScenarioSlot[] = Array.isArray((row as any).scenarios_json) && (row as any).scenarios_json.length > 0
                        ? (row as any).scenarios_json.filter((s: ScenarioSlot) => s.title?.trim())
                        : row.scenario_title ? [{ code: row.scenario_code, title: row.scenario_title }] : [];
                      return acc + slots.length;
                    }, 0);
                    const doneSlots = groupRows.reduce((acc, row) => {
                      const slots: ScenarioSlot[] = Array.isArray((row as any).scenarios_json) && (row as any).scenarios_json.length > 0
                        ? (row as any).scenarios_json.filter((s: ScenarioSlot) => s.title?.trim())
                        : row.scenario_title ? [{ code: row.scenario_code, title: row.scenario_title }] : [];
                      return acc + slots.filter(s =>
                        trackingArchive.some(a => a.candidate_name === row.candidate_name && (a.scenario_id === s.code || a.scenario_title === s.title))
                      ).length;
                    }, 0);
                    return (
                      <div key={gNum} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">קבוצה {gNum}</span>
                          <span className="text-[10px] text-gray-500">{doneSlots}/{totalSlots} תרחישים הושלמו</span>
                        </div>
                        <div className="divide-y divide-gray-800">
                          {groupRows.map(row => {
                            const slots: ScenarioSlot[] = Array.isArray((row as any).scenarios_json) && (row as any).scenarios_json.length > 0
                              ? (row as any).scenarios_json.filter((s: ScenarioSlot) => s.title?.trim())
                              : row.scenario_title ? [{ code: row.scenario_code, title: row.scenario_title }] : [];
                            const allDone = slots.length > 0 && slots.every(s =>
                              trackingArchive.some(a => a.candidate_name === row.candidate_name && (a.scenario_id === s.code || a.scenario_title === s.title))
                            );
                            return (
                              <div key={row.id} className="px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={cn("text-sm font-semibold", allDone ? "text-green-400" : "text-gray-200")}>
                                    {allDone && <span className="ml-1">✓</span>}{row.candidate_name}
                                  </span>
                                  <button
                                    onClick={() => { if (confirm(`למחוק את כל השיוכים של ${row.candidate_name}?`)) deleteAssignment(row.id); }}
                                    className="w-6 h-6 rounded text-red-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                                    title="מחק שיוך"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                {slots.length === 0 ? (
                                  <p className="text-xs text-gray-600 italic">אין תרחישים משויכים</p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {slots.map((s, i) => {
                                      const archEntry = trackingArchive.find(a =>
                                        a.candidate_name === row.candidate_name && (a.scenario_id === s.code || a.scenario_title === s.title)
                                      );
                                      const isDone = !!archEntry;
                                      return (
                                        <div key={i} className={cn(
                                          "rounded-lg px-2.5 py-1.5 text-[11px] flex items-start gap-1.5 border",
                                          isDone
                                            ? "bg-green-900/30 border-green-700/50 text-green-300"
                                            : "bg-gray-800/60 border-gray-700/50 text-gray-400"
                                        )}>
                                          <span className="mt-0.5 shrink-0">{isDone ? "✓" : `${i + 1}.`}</span>
                                          <div className="min-w-0">
                                            {s.code && <span className="font-mono text-[9px] text-gray-500 block">{s.code}</span>}
                                            <span className="leading-tight">{s.title}</span>
                                            {isDone && archEntry?.passed !== undefined && (
                                              <span className={cn("block text-[9px] mt-0.5", archEntry.passed ? "text-green-500" : "text-red-400")}>
                                                {archEntry.passed ? "עבר" : "נכשל"}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {/* Empty slots placeholder */}
                                    {Array.from({ length: Math.max(0, 4 - slots.length) }).map((_, i) => (
                                      <div key={`empty-${i}`} className="rounded-lg px-2.5 py-1.5 text-[11px] border border-dashed border-gray-800 text-gray-700 flex items-center gap-1.5">
                                        <span>{slots.length + i + 1}.</span>
                                        <span>לא שויך</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ASSIGN TAB — admin only */}
          {pageTab === "assign" && isAdmin && (
            <div className="print:hidden space-y-5">

              {/* ── Bulk assign — 4 scenarios per candidate ── */}
              <div className="bg-gray-900 border border-green-500/20 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">שיוך 4 תרחישים לכל חניך</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">בחר עד 4 תרחישים לכל חניך ושמור הכל בלחיצה אחת</p>
                  </div>
                  <button
                    onClick={async () => {
                      const entries = Object.entries(bulkMap).filter(([, slots]) => slots.some(s => s.title));
                      if (!entries.length) return;
                      setBulkSaving(true);
                      for (const [candidateName, slots] of entries) {
                        const filledSlots = slots.filter(s => s.title);
                        const group = GROUPS.find(g => g.candidates.includes(candidateName));
                        const firstSlot = filledSlots[0] ?? { code: "", title: "" };
                        const existing = await supabase.from("candidate_scenarios").select("id").eq("candidate_name", candidateName).maybeSingle();
                        if (existing.data?.id) {
                          await supabase.from("candidate_scenarios").update({
                            scenario_title: firstSlot.title,
                            scenario_code: firstSlot.code || null,
                            scenarios_json: filledSlots,
                            group_number: group?.id ?? 1,
                          }).eq("id", existing.data.id);
                        } else {
                          await supabase.from("candidate_scenarios").insert({
                            candidate_name: candidateName,
                            scenario_title: firstSlot.title,
                            scenario_code: firstSlot.code || null,
                            scenarios_json: filledSlots,
                            group_number: group?.id ?? 1,
                            done: false,
                          });
                        }
                      }
                      const { data } = await supabase.from("candidate_scenarios").select("*").order("group_number");
                      if (data) setCandidateScenarios(data as any);
                      setBulkSaving(false);
                      setBulkSaved(true);
                      setTimeout(() => setBulkSaved(false), 2500);
                    }}
                    disabled={bulkSaving || Object.values(bulkMap).every(slots => !slots?.some(s => s.title))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold transition-colors"
                  >
                    {bulkSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                    {bulkSaved ? "✓ נשמר!" : "שמור הכל"}
                  </button>
                </div>

                {bankScenarios.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">אין תרחישים במאגר — הוסף תרחישים דרך לשונית עריכה</p>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {GROUPS.map(g => (
                      <div key={g.id}>
                        {/* Group header */}
                        <div className="px-4 py-2.5 bg-gray-800/60 border-b border-gray-700">
                          <span className="text-xs font-bold text-amber-400">קבוצה {g.id}</span>
                        </div>

                        {/* Candidates — each with 4 slots */}
                        {g.candidates.map(c => {
                          const existing = candidateScenarios.find(r => r.candidate_name === c);
                          const slots: BulkSlot[] = bulkMap[c] ?? (() => {
                            // Pre-fill from existing DB data
                            const existingSlots = (existing as any)?.scenarios_json;
                            if (Array.isArray(existingSlots) && existingSlots.length > 0) {
                              const padded = [...existingSlots];
                              while (padded.length < 4) padded.push({ code: "", title: "" });
                              return padded.slice(0, 4);
                            }
                            return [EMPTY_BULK_SLOT, EMPTY_BULK_SLOT, EMPTY_BULK_SLOT, EMPTY_BULK_SLOT];
                          })();

                          const filledCount = slots.filter(s => s.title).length;

                          return (
                            <div key={c} className="px-4 py-3 border-b border-gray-800/60 last:border-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm text-gray-200 font-medium flex-1">{c}</p>
                                {filledCount > 0 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400">
                                    {filledCount}/4 תרחישים
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[0, 1, 2, 3].map(idx => (
                                  <select
                                    key={idx}
                                    value={slots[idx]?.code ?? ""}
                                    onChange={e => {
                                      const s = bankScenarios.find(x => x.code === e.target.value);
                                      const newSlots = [...slots];
                                      newSlots[idx] = s ? { code: s.code, title: s.title } : EMPTY_BULK_SLOT;
                                      setBulkMap(prev => ({ ...prev, [c]: newSlots }));
                                    }}
                                    className={cn(
                                      "h-9 bg-gray-800 border rounded-lg px-2 text-xs focus:outline-none transition-colors w-full",
                                      slots[idx]?.title ? "border-green-500/40 text-green-300" : "border-gray-700 text-gray-500"
                                    )}
                                  >
                                    <option value="">תרחיש {idx + 1}...</option>
                                    {bankScenarios.map(s => (
                                      <option key={s.code} value={s.code}>{s.code} — {s.title}</option>
                                    ))}
                                  </select>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Single assign ── */}
              <details className="group">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 select-none">
                  <ChevronDown size={13} className="group-open:rotate-180 transition-transform" /> שיוך ידני בודד
                </summary>
                <div className="mt-3 bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
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
                      <label className="text-[10px] text-gray-500 mb-1 block">תרחיש</label>
                      <select value={assignCode} onChange={e => {
                        const s = bankScenarios.find(x => x.code === e.target.value);
                        setAssignCode(e.target.value);
                        setAssignTitle(s?.title ?? "");
                      }} className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-green-500">
                        <option value="">בחר תרחיש...</option>
                        {bankScenarios.map(s => <option key={s.code} value={s.code}>{s.code} — {s.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">שם חופשי (רשות)</label>
                      <input value={assignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="שם התרחיש..." className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-green-500" />
                    </div>
                  </div>
                  <button onClick={handleAssign} disabled={assignSaving || !assignCandidate || !assignTitle} className="w-full h-10 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    {assignSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                    + הוסף שיוך
                  </button>
                </div>
              </details>
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

          {/* ── GRADES TAB ── */}
          {pageTab === "grades" && (
            <div className="space-y-4">
              {/* Header + export */}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  value={gradesFilter}
                  onChange={e => setGradesFilter(e.target.value)}
                  placeholder="חפש לפי שם..."
                  className="flex-1 h-9 bg-gray-800 border border-gray-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
                <button
                  onClick={() => {
                    const rows = gradesRows.filter(r => !gradesFilter || r.candidate_name.includes(gradesFilter));
                    const header = "שם נבחן,ת.ז.,קבוצה,תרחיש,ניקוד,מקסימום,אחוז,תוצאה,בוחן,תאריך";
                    const csv = [header, ...rows.map(r =>
                      [r.candidate_name, r.candidate_id ?? "", r.group_number ?? "", r.scenario_title ?? r.scenario_id ?? "", r.score, r.max_score, r.pct + "%", r.passed ? "עבר" : "נכשל", r.examiner ?? "", new Date(r.saved_at).toLocaleDateString("he-IL")].join(",")
                    )].join("\n");
                    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "ציונים_בגרות.csv"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 hover:bg-teal-500/30 transition-colors text-xs font-semibold shrink-0"
                >
                  <Printer size={13} /> ייצוא CSV
                </button>
              </div>

              {/* Stats bar */}
              {gradesRows.length > 0 && (() => {
                const filtered = gradesRows.filter(r => !gradesFilter || r.candidate_name.includes(gradesFilter));
                const passed = filtered.filter(r => r.passed).length;
                const avg = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.pct, 0) / filtered.length) : 0;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-white">{filtered.length}</p>
                      <p className="text-xs text-gray-500 mt-0.5">בחינות</p>
                    </div>
                    <div className="bg-gray-900 border border-green-500/20 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-green-400">{passed}</p>
                      <p className="text-xs text-gray-500 mt-0.5">עברו ({filtered.length ? Math.round(passed / filtered.length * 100) : 0}%)</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-black ${avg >= 60 ? "text-green-400" : "text-red-400"}`}>{avg}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">ממוצע</p>
                    </div>
                  </div>
                );
              })()}

              {/* Table */}
              {gradesLoading ? (
                <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-teal-400" /></div>
              ) : gradesRows.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">אין ציונים עדיין — ציונים יופיעו כאן אוטומטית לאחר שמירת בחינה</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-800 text-gray-400 text-xs">
                        <th className="px-3 py-2.5 text-right font-semibold">שם נבחן</th>
                        <th className="px-3 py-2.5 text-right font-semibold">ת.ז.</th>
                        <th className="px-3 py-2.5 text-center font-semibold">ק׳</th>
                        <th className="px-3 py-2.5 text-right font-semibold">תרחיש</th>
                        <th className="px-3 py-2.5 text-center font-semibold">ניקוד</th>
                        <th className="px-3 py-2.5 text-center font-semibold">%</th>
                        <th className="px-3 py-2.5 text-center font-semibold">תוצאה</th>
                        <th className="px-3 py-2.5 text-right font-semibold">בוחן</th>
                        <th className="px-3 py-2.5 text-right font-semibold">שעה</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {gradesRows
                        .filter(r => !gradesFilter || r.candidate_name.includes(gradesFilter))
                        .map((r, i) => (
                        <tr key={r.id} className={cn("hover:bg-gray-800/40 transition-colors", i % 2 === 0 ? "bg-gray-900" : "bg-gray-900/50")}>
                          <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">{r.candidate_name}</td>
                          <td className="px-3 py-2.5 text-gray-400 font-mono text-xs">{r.candidate_id ?? "—"}</td>
                          <td className="px-3 py-2.5 text-gray-400 text-center">{r.group_number ?? "—"}</td>
                          <td className="px-3 py-2.5 text-gray-300 max-w-[140px] truncate">{r.scenario_title || r.scenario_id || "—"}</td>
                          <td className="px-3 py-2.5 text-center text-gray-300 font-mono">{r.score}/{r.max_score}</td>
                          <td className="px-3 py-2.5 text-center font-bold">
                            <span className={r.pct >= 60 ? "text-green-400" : "text-red-400"}>{r.pct}%</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", r.passed ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30")}>
                              {r.passed ? "עבר ✓" : "נכשל ✗"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap">{r.examiner || "—"}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(r.saved_at).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SUPERVISOR TAB ── */}
          {pageTab === "supervisor" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
                  בחינות פעילות כרגע
                </h2>
                <span className="text-xs text-gray-500">{Object.keys(activeExams).length} פעילות</span>
              </div>

              {Object.keys(activeExams).length === 0 ? (
                <div className="text-center py-16 text-gray-600">
                  <p className="text-4xl mb-3">👁</p>
                  <p className="text-sm">אין בחינות פעילות כרגע</p>
                  <p className="text-xs mt-1 text-gray-700">כשבוחן יתחיל בחינה — היא תופיע כאן אוטומטית</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {Object.values(activeExams).map((exam) => (
                    <div key={exam.candidate} className="bg-gray-900 border border-cyan-500/20 rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{exam.candidate}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {exam.scenarioTitle && <span>תרחיש: {exam.scenarioTitle} · </span>}
                          בוחן: {exam.examiner || "—"}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          התחיל: {new Date(exam.ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-center shrink-0">
                        <div className={`text-2xl font-black ${exam.pct >= 60 ? "text-green-400" : "text-red-400"}`}>{exam.pct}%</div>
                        <div className={`text-xs font-semibold ${exam.pct >= 60 ? "text-green-500" : "text-red-500"}`}>{exam.pct >= 60 ? "עובר" : "נכשל"}</div>
                      </div>
                      <button
                        onClick={() => window.open(`/simulator/monitor?type=graduation&candidate=${encodeURIComponent(exam.candidate)}`, "_blank")}
                        className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                        title="צפה בבחינה בזמן אמת"
                      >
                        <Radio size={16} className="animate-pulse" />
                        <span className="text-[10px] font-semibold">צפייה</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-700 text-center pt-2">
                הדף מתעדכן אוטומטית · אין צורך לרענן
              </div>
            </div>
          )}

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

          {/* STEP 3: Scenario selection */}
          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1 min-h-[44px]">
                <ArrowRight size={14} /> חזרה לנבחנים
              </button>
              <h2 className="text-lg font-semibold text-white mb-1">שלב 3: תרחיש עבור {candidate}</h2>

              {/* Assigned scenarios from bank */}
              {assignedForCandidate.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-teal-400 mb-2">📚 תרחישים משויכים מהמאגר — בחר אחד:</p>
                  <div className="space-y-2">
                    {assignedForCandidate.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          setScenarioTitle(slot.title);
                          setScenarioCode(slot.code ?? "");
                          const id = slot.code || slot.title;
                          const { data: sd } = await supabase.from("mda_scenarios").select("story,vitals").or(`id.eq.${id},code.eq.${id},title.eq.${slot.title}`).maybeSingle();
                          setScenarioStory(sd?.story ?? "");
                          setScenarioVitals((sd?.vitals as Record<string,string>) ?? {});
                        }}
                        className={cn(
                          "w-full text-start px-4 py-3 rounded-xl border transition-colors",
                          scenarioTitle === slot.title
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                            : "bg-gray-900 border-gray-700 hover:border-amber-500/40 text-gray-200"
                        )}
                      >
                        <span className="text-xs font-mono text-gray-500 ml-2">{slot.code}</span>
                        {slot.title}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3 mb-1">או הזן ידנית:</p>
                  {/* Story preview */}
                  {scenarioStory && (
                    <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-semibold text-amber-400 mb-1">📋 מלל התרחיש לנבחן</p>
                      <p className="text-sm text-gray-200 leading-relaxed">{scenarioStory}</p>
                    </div>
                  )}
                </div>
              )}

              {assignedForCandidate.length === 0 && (
                <p className="text-xs text-gray-500 mb-4">לא שויכו תרחישים מראש — הזן ידנית:</p>
              )}

              <div className="space-y-3">
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
                  onClick={async () => {
                    // Load scenario-specific checklist from DB and build rubric
                    const scenarioId = scenarioCode.trim() || scenarioTitle.trim();
                    const { data: sc } = await supabase
                      .from("mda_scenarios")
                      .select("phases, fail_criteria, story, vitals")
                      .or(`id.eq.${scenarioId},code.eq.${scenarioId},title.eq.${scenarioTitle.trim()}`)
                      .maybeSingle();

                    if (!sc?.phases || !Array.isArray(sc.phases) || sc.phases.length === 0) {
                      alert("⚠️ לא נמצא צ'קליסט לתרחיש זה במאגר.\nוודא שהתרחיש קיים בטאב עריכה ושה-ID/קוד/שם תואם.");
                      return;
                    }

                    // Convert scenario phases → rubric categories
                    const scenarioRubric: RubricCategory[] = (sc.phases as any[]).map((phase: any) => {
                      const steps = phase.steps ?? phase.actions ?? [];
                      return {
                        id: phase.id ?? phase.name ?? phase.title ?? String(Math.random()),
                        title: phase.name ?? phase.title ?? "שלב",
                        items: steps.map((s: any) => ({
                          text: s.action ?? s.text ?? "",
                          maxScore: s.maxScore ?? 2,
                          expected: s.expected ?? null,
                        })),
                      };
                    });
                    setLiveRubric(scenarioRubric);
                    if (sc.fail_criteria && Array.isArray(sc.fail_criteria)) {
                      setLiveFailCriteria(sc.fail_criteria as string[]);
                    }
                    if (sc.story) setScenarioStory(sc.story);
                    if (sc.vitals) setScenarioVitals((sc.vitals as Record<string,string>) ?? {});

                    setStep(4);
                    setStartTime(new Date());
                    setTimeout(() => broadcastActive(true, 0), 500);
                  }}
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-3 text-sm flex-1">
                    <div>
                      <span className="text-amber-500/70">נבחן: </span>
                      <span className="text-amber-300 font-semibold">{candidate}</span>
                    </div>
                    {candidateId && (
                      <div>
                        <span className="text-amber-500/70">ת.ז.: </span>
                        <span className="text-amber-300 font-semibold font-mono">{candidateId}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-amber-500/70">קבוצה: </span>
                      <span className="text-amber-300 font-semibold">{groupId}</span>
                    </div>
                    <div>
                      <span className="text-amber-500/70">תרחיש: </span>
                      <span className="text-amber-300 font-semibold">{scenarioTitle || scenarioCode || "—"}</span>
                    </div>
                  </div>
                  {/* Live watch button — prominent, top-right of info bar */}
                  <button
                    onClick={() => window.open(`/simulator/monitor?type=graduation&candidate=${encodeURIComponent(candidate)}`, "_blank")}
                    className="print:hidden shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-xs font-semibold"
                    title="פתח מסך צפייה חי למפקח"
                  >
                    <Radio size={14} className="animate-pulse" />
                    צפייה חי
                  </button>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-amber-500/70 hover:text-amber-400 mt-2 flex items-center gap-1 print:hidden min-h-[36px]"
                >
                  <ArrowRight size={10} /> שנה תרחיש
                </button>
              </div>

              {/* Scenario story */}
              {(scenarioStory || Object.keys(scenarioVitals).length > 0) && (
                <div className="bg-gray-900 border border-amber-500/20 rounded-xl px-4 py-3 print:border-gray-300 print:bg-white space-y-3">
                  {scenarioStory && (
                    <>
                      <p className="text-[10px] font-semibold text-amber-400 print:text-gray-500">📋 מלל התרחיש — למסור לנבחן</p>
                      <p className="text-sm text-gray-100 leading-relaxed print:text-black">{scenarioStory}</p>
                    </>
                  )}
                  {Object.keys(scenarioVitals).length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-blue-400 print:text-gray-500">📊 מדדים ראשוניים</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(scenarioVitals).map(([k, v]) => (
                          <span key={k} className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1 text-xs text-blue-200 font-mono print:border-gray-300 print:text-black">
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Live sync indicator */}
              <div className="print:hidden flex items-center gap-2 flex-wrap">
                {liveConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    LIVE — מסונכרן בזמן אמת
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/50 border border-gray-700 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
                    מתחבר...
                  </span>
                )}
              </div>

              {/* Examiner field + start time */}
              <div className="print:hidden space-y-2">
                {startTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 font-medium">⏱ התחלה:</span>
                    {editingTs === "__startTime" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          step="60"
                          value={editingTsVal}
                          onChange={(e) => setEditingTsVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (editingTsVal) {
                                const [h, m] = editingTsVal.split(":").map(Number);
                                const d = new Date(startTime);
                                d.setHours(h, m, 0, 0);
                                setStartTime(d);
                              }
                              setEditingTs(null);
                            }
                            if (e.key === "Escape") setEditingTs(null);
                          }}
                          className="text-xs font-mono bg-gray-800 border border-amber-500/60 rounded px-2 py-0.5 text-amber-300 outline-none w-24"
                        />
                        <button
                          onClick={() => {
                            if (editingTsVal) {
                              const [h, m] = editingTsVal.split(":").map(Number);
                              const d = new Date(startTime);
                              d.setHours(h, m, 0, 0);
                              setStartTime(d);
                            }
                            setEditingTs(null);
                          }}
                          className="text-[10px] bg-amber-600 hover:bg-amber-500 text-white rounded px-2 py-0.5"
                        >
                          ✓
                        </button>
                        <button onClick={() => setEditingTs(null)} className="text-gray-500 hover:text-gray-300">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openEditTs("__startTime", startTime.toTimeString().slice(0, 5))}
                        title="לחץ לעריכת שעת התחלה"
                        className="text-xs text-amber-400 font-mono hover:text-amber-300 hover:underline transition-colors"
                      >
                        {startTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                      </button>
                    )}
                  </div>
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
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
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">ת.ז. נבחן <span className="text-amber-500">*</span></label>
                    <input
                      value={candidateId}
                      onChange={(e) => setCandidateId(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      placeholder="9 ספרות"
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={9}
                      className={cn(
                        "bg-gray-800 border rounded-xl px-4 py-3 text-white w-full min-h-[44px] placeholder:text-gray-500 focus:outline-none transition-colors text-sm font-mono tracking-widest",
                        candidateId.length === 9 ? "border-green-500/50 focus:border-green-400" : "border-gray-700 focus:border-amber-500"
                      )}
                    />
                    {candidateId.length > 0 && candidateId.length < 9 && (
                      <p className="text-[10px] text-amber-400 mt-1">{9 - candidateId.length} ספרות נוספות</p>
                    )}
                    {candidateId.length === 9 && (
                      <p className="text-[10px] text-green-400 mt-1">✓ ת.ז. תקינה</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fail criteria — FIRST, large custom checkboxes */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 print:border-red-300">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> קריטריוני כשלון אוטומטי
                </h3>
                <div className="space-y-2">
                  {liveFailCriteria.map((fc, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const next = { ...failChecked, [i]: !failChecked[i] };
                        setFailChecked(next);
                        writeLiveState({ failChecked: next });
                      }}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-start",
                        failChecked[i]
                          ? "bg-red-500/20 border-red-500/50"
                          : "bg-gray-800/50 border-gray-700 hover:border-red-500/30"
                      )}
                    >
                      <div className={cn(
                        "shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors",
                        failChecked[i] ? "bg-red-500 border-red-400" : "bg-transparent border-gray-500"
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

              {/* Rubric categories — after fail criteria */}
              {safeRubric.map((cat) => {
                const catEarned = cat.items.reduce((s, item, i) => {
                  const key = `${cat.id}.${i}`;
                  if (hiddenItems.has(key)) return s;
                  const v = scores[key] ?? 0;
                  return v === -1 ? s : s + (v / 3) * item.maxScore;
                }, 0);
                const catMax = cat.items.reduce((s, item, i) => {
                  const key = `${cat.id}.${i}`;
                  if (hiddenItems.has(key)) return s;
                  return scores[key] === -1 ? s : s + item.maxScore;
                }, 0);
                return (
                  <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden print:border-gray-200">
                    <div className="w-full flex items-center justify-between px-4 min-h-[44px] bg-gray-800/80">
                      <h3 className="text-sm font-semibold text-white">{cat.title}</h3>
                      <span className="text-xs text-gray-400 shrink-0">{catEarned}/{catMax}</span>
                    </div>
                    {/* Always visible in print */}
                    <div className="hidden print:block px-4 py-2 bg-gray-100">
                      <h3 className="text-sm font-semibold text-black">{cat.title}</h3>
                      <span className="text-xs text-gray-600">{catEarned}/{catMax}</span>
                    </div>
                    <div className="px-4 py-3 space-y-3 print:block">
                        {cat.items.map((item, idx) => {
                          const key = `${cat.id}.${idx}`;
                          const isHidden = hiddenItems.has(key);
                          if (isHidden && !isEditorUser) return null;
                          const score = getScore(cat.id, idx);
                          const SCORE_COLORS = ["text-red-400","text-orange-400","text-yellow-400","text-green-400"];
                          const SCORE_LABELS = ["לא בוצע כלל","בוצע חלקית","בוצע טוב","בוצע מעולה"];
                          return (
                          <div key={idx} className={cn("flex flex-col gap-1 py-1", isHidden && "opacity-40")}>
                            <div className="flex items-center gap-3 min-h-[44px]">
                            {/* Editor: hide/show toggle */}
                            {isEditorUser && (
                              <button
                                onClick={() => toggleHideItem(key)}
                                title={isHidden ? "הצג סעיף" : "הסתר סעיף"}
                                className="shrink-0 p-1 text-gray-600 hover:text-gray-400 print:hidden"
                              >
                                {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-300 print:text-black leading-snug">{item.text}</p>
                              {item.expected && (
                                <p className="text-[11px] text-teal-400/70 mt-0.5 leading-snug print:text-teal-700">💡 {item.expected}</p>
                              )}
                            </div>
                            {/* Fixed-width label — always present, no layout shift */}
                            <span className={cn(
                              "w-20 text-[10px] font-medium text-end shrink-0 print:hidden transition-colors",
                              score === -1 ? "text-gray-500" : SCORE_COLORS[score]
                            )}>
                              {score === -1 ? "לא רלוונטי" : `${Math.round((score / 3) * item.maxScore)}/${item.maxScore}`}
                            </span>
                            <div className="flex gap-1.5 shrink-0 print:hidden">
                              {([3, 2, 1, 0] as ScoreVal[]).map((v) => {
                                const active = score === v;
                                return (
                                  <button
                                    key={v}
                                    onClick={() => setScore(cat.id, idx, v)}
                                    title={SCORE_LABELS[v]}
                                    className={cn(
                                      "w-9 h-9 rounded-lg text-sm font-bold border transition-colors shrink-0",
                                      active
                                        ? v === 0 ? "bg-red-500 border-red-400 text-white"
                                          : v === 1 ? "bg-orange-500 border-orange-400 text-white"
                                          : v === 2 ? "bg-yellow-500 border-yellow-400 text-gray-900"
                                          : "bg-green-500 border-green-400 text-white"
                                        : "bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500"
                                    )}
                                  >
                                    {v}
                                  </button>
                                );
                              })}
                              {/* ל = לא רלוונטי (N/A) */}
                              <button
                                onClick={() => setScore(cat.id, idx, -1 as ScoreVal)}
                                title="לא רלוונטי לתרחיש"
                                className={cn(
                                  "w-9 h-9 rounded-lg text-sm font-bold border transition-colors shrink-0",
                                  score === -1
                                    ? "bg-gray-600 border-gray-500 text-white"
                                    : "bg-gray-700 border-gray-600 text-gray-500 hover:border-gray-400"
                                )}
                              >
                                ל
                              </button>
                              {/* ⏱ Timestamp button */}
                              <button
                                onClick={() => stampTime(key)}
                                title="חתום שעה"
                                className={cn(
                                  "w-9 h-9 rounded-lg text-sm border transition-colors shrink-0 flex items-center justify-center",
                                  timestamps[key]
                                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                                    : "bg-gray-700 border-gray-600 text-gray-500 hover:border-blue-500/50 hover:text-blue-400"
                                )}
                              >
                                <Clock size={14} />
                              </button>
                            </div>
                            {/* Print: show selected score */}
                            <span className="hidden print:flex w-8 h-8 rounded border border-gray-400 text-xs font-bold items-center justify-center shrink-0">
                              {score === -1 ? "ל" : score}
                            </span>
                            </div>
                            {/* Timestamp badge — shown when stamped */}
                            {timestamps[key] && (
                              <div className="flex items-center gap-1.5 pr-1 print:block">
                                {editingTs === key ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="time"
                                      step="1"
                                      value={editingTsVal}
                                      onChange={(e) => setEditingTsVal(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") commitEditTs(key);
                                        if (e.key === "Escape") setEditingTs(null);
                                      }}
                                      className="text-[11px] font-mono bg-gray-800 border border-blue-500/60 rounded px-2 py-0.5 text-blue-300 outline-none w-28"
                                    />
                                    <button
                                      onClick={() => commitEditTs(key)}
                                      className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-0.5"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => setEditingTs(null)}
                                      className="text-gray-500 hover:text-gray-300"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => openEditTs(key, timestamps[key])}
                                    title="לחץ לעריכת השעה"
                                    className="text-[11px] text-blue-400 font-mono bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5 print:text-black print:border-gray-400 hover:border-blue-400 hover:bg-blue-500/20 transition-colors"
                                  >
                                    ⏱ {timestamps[key]}
                                  </button>
                                )}
                                {editingTs !== key && (
                                  <button
                                    onClick={() => { setTimestamps(prev => { const n = {...prev}; delete n[key]; return n; }); }}
                                    className="text-gray-600 hover:text-gray-400 print:hidden"
                                    title="מחק חותמת"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    {/* Print view: always render items */}
                    <div className="hidden print:block px-4 py-3 space-y-3">
                      {cat.items.map((item, idx) => {
                        const key = `${cat.id}.${idx}`;
                        if (hiddenItems.has(key)) return null;
                        return (
                        <div key={idx} className="flex items-center gap-3">
                          <p className="flex-1 text-sm text-black leading-snug">{item.text}</p>
                          <span className="w-8 h-8 rounded border border-gray-400 text-xs font-bold flex items-center justify-center shrink-0">
                            {getScore(cat.id, idx) === -1 ? "ל" : getScore(cat.id, idx)}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* ── Decision + Notes block ── */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 print:hidden space-y-4">
                <h3 className="text-sm font-semibold text-gray-300">החלטת בוחן והערות</h3>

                {/* Pass / Fail buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {([null, "pass", "fail"] as const).map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => setManualOverride(v)}
                      className={cn(
                        "min-h-[52px] rounded-xl text-sm font-bold border-2 transition-all",
                        manualOverride === v
                          ? v === "pass"
                            ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20"
                            : v === "fail"
                              ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20"
                              : "bg-indigo-500 border-indigo-400 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                      )}
                    >
                      {v === null ? "🤖 אוטומטי" : v === "pass" ? "✅ עובר" : "❌ נכשל"}
                    </button>
                  ))}
                </div>

                {/* Failure reason — shown only when fail selected */}
                {manualOverride === "fail" && (
                  <div>
                    <label className="block text-xs font-bold text-red-400 mb-1.5">סיבת כישלון <span className="text-red-500">*</span></label>
                    <textarea
                      value={notes.impression}
                      onChange={(e) => setNotes((n) => ({ ...n, impression: e.target.value }))}
                      rows={3}
                      dir="rtl"
                      placeholder="פרט את סיבת הכישלון — מה לא בוצע, מה היה מסוכן, אילו קריטריונים לא עמד בהם..."
                      className="w-full bg-gray-800 border border-red-500/40 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-400 transition-colors resize-none"
                    />
                  </div>
                )}

                {/* General notes */}
                <div id="notes-section" className={notesError ? "ring-1 ring-red-500 rounded-xl p-2" : ""}>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">הערות בוחן חופשיות <span className="text-red-400">*</span></label>
                  <textarea
                    value={notes.strengths}
                    onChange={(e) => { setNotes((n) => ({ ...n, strengths: e.target.value })); setNotesError(false); }}
                    rows={3}
                    dir="rtl"
                    placeholder="התרשמות כללית, נקודות חוזק, נקודות לשיפור, המלצות..."
                    className={`w-full bg-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors resize-none border ${notesError ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-amber-500"}`}
                  />
                  {notesError && <p className="text-xs text-red-400 mt-1">⚠ הערות בוחן הן שדה חובה</p>}
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
                <p className="text-gray-400 text-sm">{totalEarnedRounded} / {totalMax} | סף: 60%</p>
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
                  {candidateId && (
                    <span>
                      🪪 ת.ז.: <span className="text-white font-mono">{candidateId}</span>
                    </span>
                  )}
                  {examiner && (
                    <span>
                      👤 בוחן: <span className="text-white">{examiner}</span>
                    </span>
                  )}
                </div>
                {(notes.impression || notes.strengths) && (
                  <div className="mt-2 space-y-1">
                    {notes.impression && (
                      <p className="text-xs text-gray-400">
                        <span className="font-semibold text-red-400">סיבת כישלון: </span>
                        {notes.impression.slice(0, 100)}{notes.impression.length > 100 ? "…" : ""}
                      </p>
                    )}
                    {notes.strengths && (
                      <p className="text-xs text-gray-400">
                        <span className="font-semibold text-gray-300">הערות: </span>
                        {notes.strengths.slice(0, 100)}{notes.strengths.length > 100 ? "…" : ""}
                      </p>
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
                  onClick={async () => {
                    const { generateExamPDF } = await import("@/lib/examPDF");
                    generateExamPDF(buildPDFPayload());
                  }}
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
