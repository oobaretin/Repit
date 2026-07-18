/** Breath + glow curve: peak at phase 0 (tick), inhale through the interval. */
export function breathAtPhase(t: number): { scale: number; opacity: number; glow: number } {
  if (t < 0.12) {
    const u = t / 0.12;
    return {
      scale: 1.1 - u * 0.04,
      opacity: 0.95 - u * 0.33,
      glow: 1 - u * 0.35,
    };
  }
  if (t < 0.38) {
    const u = (t - 0.12) / 0.26;
    return {
      scale: 1.06 - u * 0.16,
      opacity: 0.62 - u * 0.34,
      glow: 0.65 - u * 0.35,
    };
  }
  const u = (t - 0.38) / 0.62;
  const ease = u * u * (3 - 2 * u);
  return {
    scale: 0.9 + ease * 0.19,
    opacity: 0.28 + ease * 0.67,
    glow: 0.3 + ease * 0.7,
  };
}