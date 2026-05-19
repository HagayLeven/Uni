"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, User, Star, Shield, Clock, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

type Section = { title: string; content: React.ReactNode };

function Accordion({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-900 hover:bg-gray-800 transition-colors text-right"
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 text-sm font-semibold text-white">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-gray-950 border-t border-gray-800 space-y-3 text-sm text-gray-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", color)}>
      {children}
    </span>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">{n}</div>
        <div className="w-0.5 flex-1 bg-gray-800 min-h-[20px]" />
      </div>
      <div className="pb-4">
        <p className="text-sm font-semibold text-white mb-1">{title}</p>
        <div className="text-sm text-gray-400 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [tab, setTab] = useState<"exam" | "app">("exam");

  return (
    <div dir="rtl" className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 min-h-[44px] flex items-center">
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">מרכז עזרה</h1>
              <p className="text-xs text-gray-500">מדריכים מלאים לשימוש במערכת</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
            <button onClick={() => setTab("exam")}
              className={cn("flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                tab === "exam" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-gray-200")}>
              <GraduationCap size={16} /> בחינה מעשית
            </button>
            <button onClick={() => setTab("app")}
              className={cn("flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                tab === "app" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200")}>
              <BookOpen size={16} /> המערכת והאפליקציה
            </button>
          </div>

          {/* ───── EXAM GUIDE ───── */}
          {tab === "exam" && (
            <div className="space-y-4">
              {/* Intro */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <GraduationCap size={16} /> בחינה מעשית לבגרות — מד"א
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  מערכת דיגיטלית לניהול בחינות מעשיות. הבוחן מנהל את הבחינה בזמן אמת — מסכת תרחיש, מנהל טיימר, מדרג פעולות, ומקבל ציון אוטומטי. כל הנתונים נשמרים בענן.
                </p>
              </div>

              {/* Flow */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">סדר ביצוע הבחינה</p>
                <Step n={1} title="פתיחת דף הבחינה">
                  לחץ על <span className="text-amber-400 font-semibold">סימולטור מד"א</span> בתפריט הצד ← בחר <span className="text-amber-400 font-semibold">בחינה מעשית לבגרות</span>
                </Step>
                <Step n={2} title="בחירת נבחן ותרחיש">
                  בחר <strong>קבוצה</strong> ← בחר <strong>נבחן</strong> ← בחר <strong>תרחיש</strong> (מהמאגר שהוכן מראש). לחץ <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded">התחל בחינה</span>.
                </Step>
                <Step n={3} title="מסירת מלל התרחיש לנבחן">
                  בשלב 3 מוצג <strong>מלל התרחיש</strong> — קרא אותו בקול לנבחן. זהו המידע הראשוני שהוא מקבל. ניתן גם לומר לו את המדדים (pulse, BP, SpO2...).
                </Step>
                <Step n={4} title="ניהול הבחינה — הרובריקה">
                  הרובריקה פרושה לפניך. לכל פעולה — לחץ על הציון:<br />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">3 — מעולה</span>
                    <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded font-bold">2 — טוב</span>
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold">1 — חלקי</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">0 — לא בוצע</span>
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-bold">ל — לא רלוונטי</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">לחץ <strong>ל</strong> על פריטים שלא רלוונטיים לתרחיש — הם לא ייחשבו בציון.</p>
                </Step>
                <Step n={5} title="קריטריוני כשלון אוטומטי">
                  אם הנבחן לא ביצע פעולה מסוכנת/קריטית — סמן אותה ברשימה האדומה. <strong>כשלון אוטומטי</strong> ייכנס ללא קשר לציון.
                </Step>
                <Step n={6} title="שמירת תוצאה">
                  בסיום לחץ <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">שמור תוצאה</span>. הציון נשמר בארכיון וניתן להדפסה.
                </Step>
              </div>

              {/* Tabs explanation */}
              <Accordion title="מה כל לשונית עושה?" icon={<Star size={15} className="text-amber-400" />}>
                <div className="space-y-3">
                  {[
                    { tab: "🎓 בחינה", color: "bg-amber-500", desc: "ממשק הבחינה עצמה — נבחן, תרחיש, רובריקת ניקוד, טיימר, שמירה." },
                    { tab: "📚 מאגר", color: "bg-teal-500", desc: "מאגר התרחישים הזמינים לבחינה. רק מנהלים ומדריכים יכולים לראות." },
                    { tab: "📋 מעקב", color: "bg-indigo-500", desc: "רשימת כל הנבחנים והתרחישים שהוקצו להם. ניתן לסמן 'בוצע' ולמחוק שיוכים." },
                    { tab: "🗂 ארכיון", color: "bg-purple-500", desc: "היסטוריית כל הבחינות שנשמרו. ניתן לצפות, להדפיס ולסנן." },
                    { tab: "⚙️ שיוך", color: "bg-green-500", desc: "כלי לשיוך תרחיש לנבחן ספציפי מראש. הנבחן יקבל את התרחיש אוטומטית בשלב 3." },
                    { tab: "✏️ עריכה", color: "bg-orange-500", desc: "עריכת תרחישים קיימים — שם, מלל, מדדים, ורובריקת ההערכה — הכל inline בתצוגת הבחינה." },
                    { tab: "⚙ הגדרות", color: "bg-violet-500", desc: "הגדרת רובריקת ההערכה וקריטריוני הכשלון — משפיע על כל הבחינות." },
                  ].map(({ tab, color, desc }) => (
                    <div key={tab} className="flex gap-3">
                      <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", color)} />
                      <div>
                        <p className="text-white font-semibold text-xs">{tab}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>

              {/* Scoring */}
              <Accordion title="איך מחושב הציון?" icon={<CheckCircle size={15} className="text-green-400" />}>
                <p>כל פריט מדורג 0–3, כאשר 3 = מעולה. הניקוד מחושב יחסית לניקוד המקסימלי של כל פריט:</p>
                <div className="bg-gray-800 rounded-lg p-3 my-2 text-xs font-mono text-green-400 leading-relaxed">
                  ציון פריט = (ניקוד שנתת / 3) × מקסימום הפריט<br />
                  סה"כ = סכום כל פריטי הציון שלא סומנו "ל"
                </div>
                <p>פריט שסומן <strong className="text-gray-200">ל (לא רלוונטי)</strong> — מוצא לחלוטין מהחישוב, לא מוריד ולא מעלה.</p>
                <p>הציון הסופי מוצג מתוך 50 (ניתן לשינוי בהגדרות).</p>
              </Accordion>

              {/* Timer */}
              <Accordion title="הטיימר — איך זה עובד?" icon={<Clock size={15} className="text-blue-400" />}>
                <p>הטיימר הוא <strong className="text-gray-200">15 דקות</strong> — זמן ביצוע הבחינה. לחץ <strong>התחל טיימר</strong> עם תחילת הבחינה.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2">
                  <li>אפשר לעצור ולהמשיך בכל עת</li>
                  <li>הטיימר משודר LIVE לכל המדריכים שפתוחים על אותו נבחן</li>
                  <li>בסיום הזמן — אין כיבוי אוטומטי, ממשיכים לנקד עד לשמירה</li>
                </ul>
              </Accordion>

              {/* Fail criteria */}
              <Accordion title="קריטריוני כשלון אוטומטי" icon={<AlertTriangle size={15} className="text-red-400" />}>
                <p>אלה פעולות שאי-ביצוען גורם לכשלון בלא קשר לציון הכולל:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2 text-xs">
                  <li>לא בוצעה דפיברילציה בזמן (VF/VT ≤3 דקות)</li>
                  <li>מתן תרופה שגויה/מינון שגוי שגרם לנזק</li>
                  <li>לא בוצע CPR כשנדרש</li>
                  <li>אי-בטיחות — פעולה שסיכנה את הנבחן/הנפגע</li>
                  <li>לא הוזעקו גורמי סיוע בסיטואציה מחייבת</li>
                </ul>
                <p className="mt-2 text-xs text-gray-500">כשלון = סמן את הקריטריון האדום בתחתית הרובריקה. הציון יישמר אך הסטטוס יהיה "נכשל".</p>
              </Accordion>

              {/* Live sync */}
              <Accordion title='סנכרון LIVE — מה זה?' icon={<span className="w-2 h-2 rounded-full bg-green-400 inline-block" />}>
                <p>כאשר שני בוחנים (או יותר) פתוחים על אותו נבחן — הניקוד והטיימר מסתנכרנים בזמן אמת.</p>
                <p className="mt-1 text-gray-400 text-xs">שימושי כאשר בוחן ראשי ובוחן משנה עובדים יחד — כל שינוי שאחד עושה מופיע מיד אצל השני.</p>
              </Accordion>

              {/* Edit scenarios */}
              <Accordion title="איך מוסיפים ועורכים תרחיש?" icon={<span className="text-orange-400 text-sm font-bold">✏️</span>}>
                <ol className="list-decimal list-inside space-y-2 text-gray-400">
                  <li>עבור ללשונית <strong className="text-white">עריכה</strong></li>
                  <li>בחר תרחיש קיים מהרשימה, או לחץ <strong className="text-white">+ תרחיש חדש</strong></li>
                  <li>ערוך את הקוד, השם, <strong className="text-white">מלל התרחיש</strong> (מה הבוחן קורא לנבחן), המדדים, ורובריקת ההערכה</li>
                  <li>לחץ <strong className="text-white">שמור תרחיש + רובריקה</strong></li>
                </ol>
                <p className="mt-2 text-xs text-gray-500">שינויים ברובריקה משפיעים על כל הבחינות הבאות. הארכיון שמור עם הרובריקה המקורית.</p>
              </Accordion>
            </div>
          )}

          {/* ───── APP GUIDE ───── */}
          {tab === "app" && (
            <div className="space-y-4">
              {/* What is Uni */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/logoAmbulance.jpeg" alt="מד-א" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-white">Uni — פלטפורמת ההדרכה של מד"א</p>
                    <p className="text-xs text-gray-400">סימולטור, קהילה, AI וניהול בחינות — במקום אחד</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Uni נבנתה עבור אנשי מד"א — חובשים, פראמדיקים, ומדריכים. המטרה: לאפשר תרגול יעיל, לעקוב אחרי התקדמות, ולנהל בחינות מעשיות בצורה דיגיטלית, מסודרת ומאובטחת.
                </p>
              </div>

              {/* Onboarding */}
              <Accordion title="הרשמה ומילוי פרופיל" icon={<User size={15} className="text-indigo-400" />}>
                <ol className="list-decimal list-inside space-y-2 text-gray-400">
                  <li>קבל הזמנה ממנהל המערכת — <strong className="text-white">אימייל + סיסמה</strong> לכניסה ראשונה</li>
                  <li>בכניסה ראשונה — מסך <strong className="text-white">ברוך הבא</strong> יבקש ממך:
                    <ul className="list-disc list-inside mr-4 mt-1 space-y-1 text-xs">
                      <li>שם מלא</li>
                      <li>תאריך לידה</li>
                      <li>סמכות רפואית (פראמדיק / חובש בכיר / חובש / מגיש עזרה ראשונה)</li>
                      <li>תמונת פרופיל (אופציונלי)</li>
                    </ul>
                  </li>
                  <li>לאחר מילוי — עוברים לדשבורד הראשי</li>
                </ol>
                <p className="mt-2 text-xs text-gray-500">ניתן לעדכן את כל הפרטים בכל עת דרך <strong>פרופיל</strong> או <strong>הגדרות</strong>.</p>
              </Accordion>

              {/* Features */}
              <Accordion title="מה יש במערכת?" icon={<Star size={15} className="text-yellow-400" />}>
                <div className="space-y-3">
                  {[
                    { icon: "🏠", name: "דשבורד", desc: "מסך הבית — XP שלך, תוצאות אחרונות, קישורים מהירים." },
                    { icon: "🚑", name: "סימולטור מד\"א", desc: "תרגול תרחישים רפואיים — בחינה עצמית, מדדים, משוב מיידי." },
                    { icon: "🎓", name: "בחינה מעשית לבגרות", desc: "ניהול בחינות מעשיות בזמן אמת — לבוחנים ומדריכים בלבד." },
                    { icon: "🦉", name: "מדריך AI — Uni", desc: "עוזר AI שמכיר את פרוטוקולי מד\"א. שאל שאלות, קבל הסברים, תרגל מקרים." },
                    { icon: "📰", name: "פיד קהילה", desc: "שיתוף מידע מקצועי, שאלות, ועדכונים בין אנשי הצוות." },
                    { icon: "🏆", name: "לוח הישגים", desc: "דירוג XP לפי קהילה — מי תרגל הכי הרבה? מי שאל הכי הרבה שאלות?" },
                    { icon: "📚", name: "הקורס שלי", desc: "חומר לימוד, מבחנים, ומשימות הקשורות לקורס שלך." },
                  ].map(f => (
                    <div key={f.name} className="flex gap-3">
                      <span className="text-xl shrink-0">{f.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-xs">{f.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>

              {/* Roles */}
              <Accordion title="תפקידים והרשאות" icon={<Shield size={15} className="text-purple-400" />}>
                <div className="space-y-3">
                  {[
                    { role: "חובש / פראמדיק", badge: "border-gray-600 text-gray-400", desc: "גישה לסימולטור, קהילה, AI, פרופיל. אין גישה לבחינות או לניהול." },
                    { role: "מדריך", badge: "border-blue-600 text-blue-400", desc: "כל הגישות הבסיסיות + צפייה בבחינות מעשיות." },
                    { role: "מדריך ראשי", badge: "border-indigo-500 text-indigo-400", desc: "כל גישות מדריך + ניהול מאגר תרחישים (אם הופעל), ניהול בחינות." },
                    { role: "מנהל מערכת", badge: "border-violet-500 text-violet-400", desc: "גישה מלאה — ניהול משתמשים, עריכת תרחישים, רובריקות, הגדרות מערכת." },
                    { role: "אדמיניסטרציה", badge: "border-amber-500 text-amber-400", desc: "גישה מלאה לכל — זהה למנהל מערכת." },
                  ].map(r => (
                    <div key={r.role} className="flex items-start gap-3">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 mt-0.5", r.badge)}>{r.role}</span>
                      <p className="text-gray-400 text-xs leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </Accordion>

              {/* XP */}
              <Accordion title="מהו XP ואיך מרוויחים?" icon={<span className="text-yellow-400 font-bold text-sm">⚡</span>}>
                <p>XP (נקודות ניסיון) משקפות את הפעילות שלך במערכת:</p>
                <div className="mt-2 space-y-1.5">
                  {[
                    ["פרסום פוסט בקהילה", "+20 XP"],
                    ["תגובה על פוסט", "+5 XP"],
                    ["לייק שקיבלת על פוסט", "+5 XP"],
                    ["תרגול בסימולטור", "בהתאם לביצועים"],
                    ["בונוס XP ממנהל", "לפי שיקול דעת"],
                  ].map(([action, xp]) => (
                    <div key={action} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{action}</span>
                      <span className="text-yellow-400 font-bold">{xp}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">XP משפיע על הדירוג בלוח הישגים. אין השלכות אחרות — זה לעידוד.</p>
              </Accordion>

              {/* AI Tutor */}
              <Accordion title='מדריך AI — Uni 🦉 — איך להשתמש?' icon={<span className="text-sm">🦉</span>}>
                <p>Uni הוא עוזר AI שמתמחה בפרוטוקולי מד"א. הוא יודע:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400 mt-2 text-xs">
                  <li>פרוטוקולי ALS, BLS, טראומה, ילדים</li>
                  <li>מינוני תרופות (אדרנלין, אמיודורון, מורפין וכו׳)</li>
                  <li>ניהול נתיב אוויר — אינטובציה, LMA, CPAP</li>
                  <li>קריאת אק"ג ואבחון קצבים</li>
                  <li>תרחישי CPR — VF, VT, PEA, Asystole</li>
                </ul>
                <p className="mt-2 text-xs text-gray-400">
                  <strong className="text-white">טיפ:</strong> שאל שאלות ספציפיות — "מה המינון של אדרנלין בהחייאה?", "מתי נותנים אטרופין?", "הסבר לי VF vs VT."
                </p>
                <p className="mt-1 text-xs text-gray-500">Uni לא מחליף שיפוט קליני — תמיד עקוב אחרי הפרוטוקול הרשמי.</p>
              </Accordion>

              {/* Profile */}
              <Accordion title="עדכון פרופיל ותמונה" icon={<User size={15} className="text-teal-400" />}>
                <ol className="list-decimal list-inside space-y-2 text-gray-400">
                  <li>לחץ על <strong className="text-white">פרופיל</strong> בתפריט הצד (או תמונתך)</li>
                  <li>לחץ על <strong className="text-white">עריכת פרופיל</strong></li>
                  <li>עדכן שם, תמונה, מידע מקצועי</li>
                  <li>לחץ <strong className="text-white">שמור</strong></li>
                </ol>
                <p className="mt-2 text-xs text-gray-500">תמונת פרופיל מופיעה בכל מקום במערכת — פיד, לוח הישגים, תוצאות בחינה. גודל מקסימלי: 5MB.</p>
              </Accordion>

              {/* Contact */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-white mb-1">שאלות נוספות?</p>
                <p className="text-xs text-gray-500">פנה למנהל המערכת או שלח הודעה דרך <Link href="/messages" className="text-indigo-400 hover:text-indigo-300">מרכז ההודעות</Link>.</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
