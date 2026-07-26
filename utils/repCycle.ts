/** Breath + glow curve: peak at phase 0 (tick), smooth inhale through the interval. */
export function breathAtPhase(t: number): { scale: number; opacity: number; glow: number } {
  const peak = Math.exp(-t * 8);
  const ease = t * t * (3 - 2 * t);

  return {
    scale: 0.9 + peak * 0.2 + ease * 0.19,
    opacity: 0.28 + peak * 0.67 + ease * 0.05,
    glow: 0.3 + peak * 0.7,
  };
}