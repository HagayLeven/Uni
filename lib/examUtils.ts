import type { MdaPhase } from "./mdaScenarios";

export function calcScore(
  phases: MdaPhase[],
  answers: Record<string, number>
): { earned: number; max: number; pct: number } {
  let earned = 0;
  let max = 0;
  for (const phase of phases) {
    for (const action of phase.actions) {
      const v = answers[action.id] ?? -1;
      if (v >= 0) {
        max += action.maxScore ?? 3;
        earned += v;
      }
    }
  }
  const pct = max === 0 ? 0 : Math.round((earned / max) * 100);
  return { earned, max, pct };
}
