import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react';

interface UseRepCycleOptions {
  isRunning: boolean;
  isPaused: boolean;
  delay: number;
  currentRep: number;
}

export interface RepCycleHandle {
  phaseRef: MutableRefObject<number>;
  cycleStartRef: MutableRefObject<number>;
  delayMs: number;
}

export function useRepCycle({ isRunning, isPaused, delay, currentRep }: UseRepCycleOptions): RepCycleHandle {
  const cycleStartRef = useRef(Date.now());
  const pausedPhaseRef = useRef(0);
  const prevRepRef = useRef(currentRep);
  const wasRunningRef = useRef(false);
  const wasPausedRef = useRef(false);
  const phaseRef = useRef(0);

  const delayMs = Math.max(delay * 1000, 100);

  useLayoutEffect(() => {
    if (prevRepRef.current !== currentRep) {
      cycleStartRef.current = Date.now();
      pausedPhaseRef.current = 0;
      phaseRef.current = 0;
      prevRepRef.current = currentRep;
    }
  }, [currentRep]);

  useLayoutEffect(() => {
    const justStarted = isRunning && !wasRunningRef.current;
    const justResumed = isRunning && wasPausedRef.current && !isPaused;

    if (justStarted || justResumed) {
      if (pausedPhaseRef.current > 0) {
        cycleStartRef.current = Date.now() - pausedPhaseRef.current * delayMs;
        pausedPhaseRef.current = 0;
      } else if (justStarted) {
        cycleStartRef.current = Date.now();
        phaseRef.current = 0;
      }
    }

    if (isPaused && !wasPausedRef.current && isRunning) {
      pausedPhaseRef.current = Math.min(0.999, (Date.now() - cycleStartRef.current) / delayMs);
      phaseRef.current = pausedPhaseRef.current;
    }

    wasRunningRef.current = isRunning;
    wasPausedRef.current = isPaused;
  }, [isRunning, isPaused, delayMs]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    phaseRef.current = Math.min(0.999, (Date.now() - cycleStartRef.current) / delayMs);
  }, [isRunning, isPaused, delayMs]);

  return { phaseRef, cycleStartRef, delayMs };
}

export function phaseAtTime(cycleStartMs: number, delayMs: number, now = Date.now()): number {
  return Math.min(0.999, (now - cycleStartMs) / delayMs);
}
