import type { MdaPhase } from "./mdaScenarios";

export function calcScore(
  phases: MdaPhase[],
  answers: Record<string, number>
): { earned: number; max: number; pct: number } {
  let earned = 0;
  let max = 0;
  for (const phase of phases) {
    for (const action of phase.actions) {
      max += action.maxScore;
      earned += answers[action.id] ?? 0;
    }
  }
  const pct = max === 0 ? 0 : Math.round((earned / max) * 100);
  return { earned, max, pct };
}
