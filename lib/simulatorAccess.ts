const ROOT_EMAILS = ["hagayas2001@gmail.com"];

export function canAccessSimulator(
  role?: string | null,
  faculty?: string | null,
  email?: string | null
): boolean {
  if (email && ROOT_EMAILS.includes(email)) return true;
  if (faculty === "אדמיניסטרציה") return true;
  return ["root", "מנהל מערכת", "מדריך ראשי", "מדריך"].includes(role ?? "");
}
