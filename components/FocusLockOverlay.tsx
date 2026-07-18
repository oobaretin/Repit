
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { BRAND_COLORS } from '../utils/brandColors';
import { LockOpenIcon } from './icons';

interface FocusLockOverlayProps {
  onUnlock: () => void;
}

const HOLD_MS = 1200;

const FocusLockOverlay: React.FC<FocusLockOverlayProps> = ({ onUnlock }) => {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const clearHold = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timerRef.current = null;
    startRef.current = null;
    setProgress(0);
  }, []);

  const tick = useCallback(() => {
    if (startRef.current === null) return;
    const elapsed = Date.now() - startRef.current;
    setProgress(Math.min(100, (elapsed / HOLD_MS) * 100));
    if (elapsed >= HOLD_MS) {
      clearHold();
      onUnlock();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [clearHold, onUnlock]);

  const startHold = useCallback(() => {
    clearHold();
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [clearHold, tick]);

  useEffect(() => () => clearHold(), [clearHold]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-end pb-[calc(2.5rem+var(--safe-bottom))] pointer-events-none animate-fade-up">
      <button
        type="button"
        onPointerDown={startHold}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        className="pointer-events-auto flex flex-col items-center gap-3 rounded-3xl bg-gray-950/80 px-8 py-5 backdrop-blur-md ring-1 ring-white/10"
        aria-label="Hold to unlock controls"
      >
        <div className="relative flex h-12 w-12 items-center justify-center">
          <svg className="absolute h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={BRAND_COLORS.cyan}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 - (125.6 * progress) / 100}
              className="transition-none"
            />
          </svg>
          <LockOpenIcon className="relative h-5 w-5 text-cyan-300" />
        </div>
        <span className="text-xs text-gray-400">Hold to unlock</span>
      </button>
    </div>
  );
};

export default FocusLockOverlay;
