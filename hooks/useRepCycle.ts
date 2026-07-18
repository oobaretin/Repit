import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface UseRepCycleOptions {
  isRunning: boolean;
  isPaused: boolean;
  delay: number;
  currentRep: number;
}

export function useRepCycle({ isRunning, isPaused, delay, currentRep }: UseRepCycleOptions) {
  const cycleStartRef = useRef(Date.now());
  const pausedPhaseRef = useRef(0);
  const prevRepRef = useRef(currentRep);
  const wasRunningRef = useRef(false);
  const wasPausedRef = useRef(false);
  const [phase, setPhase] = useState(0);

  const delayMs = Math.max(delay * 1000, 100);

  useLayoutEffect(() => {
    if (prevRepRef.current !== currentRep) {
      cycleStartRef.current = Date.now();
      pausedPhaseRef.current = 0;
      setPhase(0);
      prevRepRef.current = currentRep;
    }
  }, [currentRep, delayMs]);

  useEffect(() => {
    const justStarted = isRunning && !wasRunningRef.current;
    const justResumed = isRunning && wasPausedRef.current && !isPaused;

    if (justStarted || justResumed) {
      if (pausedPhaseRef.current > 0) {
        cycleStartRef.current = Date.now() - pausedPhaseRef.current * delayMs;
        pausedPhaseRef.current = 0;
      } else if (justStarted) {
        cycleStartRef.current = Date.now();
        setPhase(0);
      }
    }

    if (isPaused && !wasPausedRef.current && isRunning) {
      pausedPhaseRef.current = Math.min(0.999, (Date.now() - cycleStartRef.current) / delayMs);
      setPhase(pausedPhaseRef.current);
    }

    wasRunningRef.current = isRunning;
    wasPausedRef.current = isPaused;
  }, [isRunning, isPaused, delayMs]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    let rafId = 0;

    const tick = () => {
      const elapsed = Date.now() - cycleStartRef.current;
      const nextPhase = Math.min(0.999, elapsed / delayMs);
      setPhase(nextPhase);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, isPaused, delayMs]);

  return phase;
}
