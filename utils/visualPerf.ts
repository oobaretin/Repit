import { Capacitor } from '@capacitor/core';

/** iOS WKWebView: skip SVG glow filters — they re-rasterize every frame and stutter. */
export function preferLiteVisuals(): boolean {
  return Capacitor.isNativePlatform();
}

/** GPU-composited CSS keyframes instead of per-frame SVG DOM writes on native. */
export function useCssBreathOnNative(): boolean {
  return preferLiteVisuals();
}

/** Cap RAF work on native when JS-driven visuals remain (~30fps). */
export function nativeFrameBudgetMs(): number {
  return preferLiteVisuals() ? 1000 / 30 : 0;
}

export function shouldRenderFrame(lastFrameTs: number, now: number, budgetMs?: number): boolean {
  const budget = budgetMs ?? nativeFrameBudgetMs();
  if (budget <= 0) return true;
  return now - lastFrameTs >= budget;
}
