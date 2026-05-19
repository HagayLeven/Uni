/**
 * PDF generator for MDA exam results — uses browser print dialog (no dependencies)
 */

export interface ExamPDFData {
  type: "exam" | "graduation";
  candidateName?: string;
  candidateId?: string;
  groupNumber?: number;
  scenarioTitle: string;
  scenarioCode?: string;
  examiner: string;
  startTime?: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  pct: number;
  passed: boolean;
  mode?: string;
  // For regular exam
  phases?: { title: string; actions: { text: string; score: number }[] }[];
  notes?: { impression: string; strengths: string; improvements: string; recommendation: string };
  // For graduation
  rubricCategories?: { title: string; items: { text: string; score: number; max: number; timestamp?: string }[] }[];
  failChecked?: string[];
}

export function generateExamPDF(data: ExamPDFData) {
  const durationMin = data.startTime && data.endTime
    ? Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000)
    : null;

  const passColor = data.passed ? "#22c55e" : "#ef4444";
  const passText  = data.passed ? "עבר/ה ✓" : "נכשל/ה ✗";

  const formatTime = (d?: Date) =>
    d ? d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "—";

  // Score color helper
  const scoreColor = (earned: number, max: number) => {
    if (max === 0) return "#64748b";
    const r = earned / max;
    if (r >= 0.66) return "#16a34a";
    if (r > 0) return "#d97706";
    return "#dc2626";
  };

  const rubricRows = data.rubricCategories?.map((cat) => {
    // Filter out score=-1 (לא רלוונטי) items
    const relevantItems = cat.items.filter((item) => item.score !== -1);
    if (relevantItems.length === 0) return "";
    return `
    <div class="cat-block">
      <h3>${cat.title}</h3>
      <table>
        ${relevantItems.map((item) => {
          // Convert raw score (0-3) to weighted points: round((score/3)*max)
          const earnedPts = Math.round((item.score / 3) * item.max);
          return `
          <tr>
            <td class="item-text">${item.text}${item.timestamp ? `<span class="ts"> ⏱ ${item.timestamp}</span>` : ""}</td>
            <td class="item-score" style="color:${scoreColor(earnedPts, item.max)}">${earnedPts}/${item.max}</td>
          </tr>`;
        }).join("")}
      </table>
    </div>`;
  }).join("") ?? "";

  const phasesRows = data.phases?.map((ph) => `
    <div class="cat-block">
      <h3>${ph.title}</h3>
      <table>
        ${ph.actions.map((a) => `
          <tr>
            <td class="item-text">${a.text}</td>
            <td class="item-score" style="color:${a.score === 2 ? "#16a34a" : a.score === 1 ? "#d97706" : "#dc2626"}">${a.score === 2 ? "✓ מלא" : a.score === 1 ? "~ חלקי" : "✗ לא בוצע"}</td>
          </tr>`).join("")}
      </table>
    </div>`).join("") ?? "";

  // Notes section — impression = סיבת כישלון, strengths = הערות בוחן
  const notesSection = data.notes ? `
    <div class="section">
      <h2>הערות בוחן</h2>
      ${data.notes.impression   ? `<p><strong>סיבת כישלון:</strong> ${data.notes.impression}</p>` : ""}
      ${data.notes.strengths    ? `<p><strong>הערות כלליות:</strong> ${data.notes.strengths}</p>` : ""}
      ${data.notes.improvements ? `<p><strong>נקודות לשיפור:</strong> ${data.notes.improvements}</p>` : ""}
      ${data.notes.recommendation ? `<p><strong>המלצת הבוחן:</strong> ${data.notes.recommendation}</p>` : ""}
    </div>` : "";

  const failSection = data.failChecked?.length ? `
    <div class="fail-box">
      <strong>⚠ קריטריוני כישלון שסומנו:</strong>
      <ul>${data.failChecked.map((f) => `<li>${f}</li>`).join("")}</ul>
    </div>` : "";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>דוח בחינה — ${data.candidateName ?? ""} — ${data.scenarioTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Arial", sans-serif; font-size: 13px; color: #111; background: #fff; padding: 24px 32px; direction: rtl; }
    .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 22px; color: #1e3a8a; }
    .header .subtitle { font-size: 13px; color: #555; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .meta-item { background: #f1f5f9; border-radius: 8px; padding: 10px 14px; }
    .meta-item label { font-size: 10px; color: #64748b; display: block; margin-bottom: 2px; text-transform: uppercase; }
    .meta-item span { font-size: 14px; font-weight: bold; }
    .result-banner { border-radius: 10px; padding: 14px 20px; text-align: center; margin-bottom: 20px; color: white; background: ${passColor}; }
    .result-banner .pct { font-size: 48px; font-weight: 900; line-height: 1; }
    .result-banner .label { font-size: 18px; font-weight: bold; margin-top: 4px; }
    .section { margin-bottom: 20px; }
    .section h2 { font-size: 15px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
    .cat-block { margin-bottom: 14px; page-break-inside: avoid; break-inside: avoid; }
    .cat-block h3 { font-size: 13px; font-weight: bold; background: #f8fafc; padding: 6px 10px; border-right: 3px solid #1e3a8a; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    tr { border-bottom: 1px solid #f1f5f9; page-break-inside: avoid; break-inside: avoid; }
    .item-text { padding: 4px 8px; }
    .item-score { padding: 4px 8px; font-weight: bold; text-align: left; white-space: nowrap; width: 80px; }
    .ts { font-size: 10px; color: #2563eb; font-family: monospace; margin-right: 6px; }
    .fail-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; }
    .fail-box ul { padding-right: 20px; margin-top: 6px; }
    .signature-line { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; page-break-inside: avoid; break-inside: avoid; }
    .sig-item { text-align: center; width: 30%; border-bottom: 1px solid #000; padding-bottom: 4px; font-size: 12px; color: #555; }
    @media print {
      body { padding: 12px 20px; }
      .result-banner { page-break-inside: avoid; break-inside: avoid; }
      .meta-grid { page-break-inside: avoid; break-inside: avoid; }
      .signature-line { margin-top: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.type === "graduation" ? "🎓 בחינה מעשית לבגרות — 20/05/26" : "📋 דוח בחינה — סימולטור מד״א"}</h1>
    <div class="subtitle">תאריך: ${new Date().toLocaleDateString("he-IL")} | תרחיש: ${data.scenarioCode ?? ""} ${data.scenarioTitle}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><label>נבחן/ת</label><span>${data.candidateName ?? "—"}</span></div>
    ${data.candidateId ? `<div class="meta-item"><label>ת.ז. נבחן</label><span style="font-family:monospace">${data.candidateId}</span></div>` : ""}
    ${data.groupNumber ? `<div class="meta-item"><label>קבוצה</label><span>קבוצה ${data.groupNumber}</span></div>` : ""}
    <div class="meta-item"><label>בוחן</label><span>${data.examiner || "—"}</span></div>
    <div class="meta-item"><label>שעת התחלה</label><span>${formatTime(data.startTime)}</span></div>
    <div class="meta-item"><label>שעת סיום</label><span>${formatTime(data.endTime)}</span></div>
    ${durationMin !== null ? `<div class="meta-item"><label>משך</label><span>${durationMin} דקות</span></div>` : ""}
  </div>

  <div class="result-banner">
    <div class="pct">${data.pct}%</div>
    <div class="label">${passText} | ${data.score}/${data.maxScore} נקודות</div>
  </div>

  ${failSection}

  <div class="section">
    <h2>${data.type === "graduation" ? "רובריקת הערכה" : "ביצועים לפי שלבים"}</h2>
    ${data.type === "graduation" ? rubricRows : phasesRows}
  </div>

  ${notesSection}

  <div class="signature-line">
    <div class="sig-item">חתימת הנבחן/ת</div>
    <div class="sig-item">חתימת הבוחן</div>
    <div class="sig-item">חותמת / אישור</div>
  </div>
</body>
</html>`;

  // Open in new window + trigger print dialog (Save as PDF)
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("אפשר חלונות קופצים בדפדפן כדי להוריד PDF"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Wait for fonts/layout to render before printing
  setTimeout(() => { win.print(); }, 800);
}
