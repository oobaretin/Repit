import { useEffect, useRef } from 'react';
import { TimerState } from '../types';

interface UseMeditationTimerOptions {
  timerState: TimerState;
  delay: number;
  targetReps: number;
  getCurrentRep: () => number;
  onTick: () => void;
  onComplete: () => void;
}

export function useMeditationTimer({
  timerState,
  delay,
  targetReps,
  getCurrentRep,
  onTick,
  onComplete,
}: UseMeditationTimerOptions) {
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);
  const getCurrentRepRef = useRef(getCurrentRep);

  onTickRef.current = onTick;
  onCompleteRef.current = onComplete;
  getCurrentRepRef.current = getCurrentRep;

  useEffect(() => {
    if (timerState !== TimerState.Running) return;

    let cancelled = false;
    let timeoutId = 0;
    const delayMs = Math.max(delay * 1000, 100);

    const scheduleTick = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;

        const nextRep = getCurrentRepRef.current() + 1;
        if (targetReps > 0 && nextRep >= targetReps) {
          onCompleteRef.current();
          return;
        }

        onTickRef.current();
        scheduleTick();
      }, delayMs);
    };

    scheduleTick();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [timerState, delay, targetReps]);
}
