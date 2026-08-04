
import React, { useCallback, useEffect, useLayoutEffect, useRef, useId } from 'react';
import { TimerState } from '../types';
import { formatDuration } from '../utils/formatDuration';
import { breathAtPhase } from '../utils/repCycle';
import { phaseAtTime, useRepCycle } from '../hooks/useRepCycle';
import { BRAND_GRADIENT_STOPS, brandGlow } from '../utils/brandColors';
import { PlayIcon, PauseIcon, CheckIcon } from './icons';
import FlowerOfLifeLayer, { type FlowerOfLifeHandle } from './FlowerOfLifeLayer';
import { flowerBreathAtPhase, flowerIdleBreath } from '../utils/flowerOfLife';

interface CircleDisplayProps {
  state: TimerState;
  currentRep: number;
  targetReps: number;
  delay: number;
  soundLabel?: string;
  practiceIntention?: string;
  onClick: () => void;
  isFocusLocked?: boolean;
  immersive?: boolean;
}

const CircleDisplay: React.FC<CircleDisplayProps> = ({
  state,
  currentRep,
  targetReps,
  delay,
  soundLabel = '',
  practiceIntention = '',
  onClick,
  isFocusLocked = false,
  immersive = false,
}) => {
  const countRef = useRef<HTMLHeadingElement>(null);
  const prevRep = useRef(currentRep);
  const progressRingRef = useRef<SVGCircleElement>(null);
  const progressPercentRef = useRef<HTMLParagraphElement>(null);
  const flowerRef = useRef<FlowerOfLifeHandle>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const animRefsRef = useRef({ currentRep, targetReps, delay, state });
  const gradientId = useId().replace(/:/g, '');

  const radius = 130;
  const cx = 150;
  const cy = 150;
  const circumference = 2 * Math.PI * radius;
  const isRunning = state === TimerState.Running;
  const isPaused = state === TimerState.Paused;
  const remaining = targetReps > 0 ? Math.max(0, targetReps - currentRep) : null;
  const estimatedTotal = targetReps > 0 ? targetReps * delay : null;

  const { phaseRef, cycleStartRef, delayMs } = useRepCycle({ isRunning, isPaused, delay, currentRep });
  const staticPhase = isRunning || isPaused ? phaseRef.current : 0;
  const breath = breathAtPhase(staticPhase);

  const progressFraction =
    targetReps > 0
      ? Math.min(1, (currentRep + (isRunning ? staticPhase : 0)) / targetReps)
      : 0;
  const strokeDashoffset = circumference - progressFraction * circumference;
  const ringOpacity = 0.72 + breath.glow * 0.28;
  const breathMode = isRunning ? 'breath-sync' : isPaused ? 'breath-paused' : 'breath-idle';

  animRefsRef.current = { currentRep, targetReps, delay, state };

  const applyFrame = useCallback(() => {
    const { currentRep: rep, targetReps: target, state: timerState } = animRefsRef.current;
    if (timerState !== TimerState.Running || target <= 0) return;

    const phase = phaseAtTime(cycleStartRef.current, delayMs);
    phaseRef.current = phase;
    const frameBreath = breathAtPhase(phase);
    const fraction = Math.min(1, (rep + phase) / target);
    const dashOffset = circumference - fraction * circumference;
    const opacity = 0.72 + frameBreath.glow * 0.28;
    const ring = progressRingRef.current;

    if (ring) {
      ring.setAttribute('stroke-dashoffset', String(dashOffset));
      ring.style.opacity = String(opacity);
    }

    if (progressPercentRef.current && timerState !== TimerState.Running) {
      progressPercentRef.current.textContent = `${Math.min(100, Math.round(fraction * 100))}%`;
    }

    flowerRef.current?.applyBreath(flowerBreathAtPhase(phase));

    if (countRef.current) {
      countRef.current.style.transform = `scale(${1 + frameBreath.glow * 0.05})`;
      countRef.current.style.textShadow = `0 0 ${frameBreath.glow * 28}px ${brandGlow(frameBreath.glow * 0.45)}`;
    }

    if (controlRef.current) {
      controlRef.current.style.transform = `scale(${1 + frameBreath.glow * 0.06})`;
      controlRef.current.style.boxShadow = `0 0 ${frameBreath.glow * 32}px ${brandGlow(frameBreath.glow * 0.35)}`;
    }
  }, [circumference, cycleStartRef, delayMs, phaseRef]);

  useLayoutEffect(() => {
    if (isRunning) applyFrame();
  }, [isRunning, currentRep, applyFrame]);

  useEffect(() => {
    if (isRunning) return;

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      if (isPaused) {
        flowerRef.current?.applyBreath(flowerBreathAtPhase(staticPhase));
      } else {
        flowerRef.current?.applyBreath(flowerIdleBreath((now - start) / 1000));
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, isPaused, staticPhase]);

  useEffect(() => {
    if (!isRunning) return;

    let rafId = 0;

    const tick = () => {
      applyFrame();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, applyFrame]);

  useEffect(() => {
    if (currentRep > prevRep.current && countRef.current) {
      const el = countRef.current;
      requestAnimationFrame(() => {
        el.classList.remove('rep-pop');
        void el.offsetWidth;
        el.classList.add('rep-pop');
      });
    }
    prevRep.current = currentRep;
  }, [currentRep]);

  const getButtonContent = () => {
    if (isFocusLocked) return null;
    switch (state) {
      case TimerState.Running:
        return <PauseIcon className="w-12 h-12 text-slate-100" />;
      case TimerState.Paused:
        return <PlayIcon className="w-12 h-12 text-slate-100" />;
      case TimerState.Finished:
        return <CheckIcon className="w-14 h-14 text-emerald-400" />;
      default:
        return <PlayIcon className="w-12 h-12 text-slate-100" />;
    }
  };

  const getHint = () => {
    if (isFocusLocked) return 'Focus locked · hold below to unlock';
    switch (state) {
      case TimerState.Running:
        return 'Tap to pause · follow the circle';
      case TimerState.Paused:
        return 'Tap to resume';
      case TimerState.Finished:
        return 'Tap to reset';
      default:
        return 'Tap to begin';
    }
  };

  const displayCount = currentRep > 0 ? currentRep.toLocaleString() : '0';
  const isIdleReady = state === TimerState.Idle && currentRep === 0;
  const displayText =
    state === TimerState.Finished
      ? 'Done'
      : isIdleReady
        ? targetReps > 0
          ? targetReps.toLocaleString()
          : '0'
        : displayCount;
  const progressPercent = Math.min(100, Math.round(progressFraction * 100));
  const topLabel = isIdleReady
    ? 'Tap to begin'
    : isRunning || isPaused
      ? null
      : state === TimerState.Finished
        ? 'Complete'
        : targetReps > 0
          ? `${progressPercent}%`
          : 'Open count';

  const showHint = !isRunning && !isFocusLocked;

  return (
    <div
      className={`relative flex aspect-square items-center justify-center ${
        isRunning || isPaused ? '' : 'transition-all duration-500'
      } ${immersive ? 'w-[min(96vw,28rem)]' : 'w-[min(92vw,24rem)]'}`}
    >
      <div className={`breath-stack flower-stack ${breathMode}`} aria-hidden="true">
        <FlowerOfLifeLayer ref={flowerRef} filterId={gradientId} />
      </div>

      <svg
        className="absolute h-full w-full -rotate-90"
        viewBox="0 0 300 300"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`progress-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {BRAND_GRADIENT_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
          <linearGradient id={`complete-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id={`ring-glow-${gradientId}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          strokeWidth="8"
          className="stroke-gray-800/80"
          fill="transparent"
        />
        {targetReps > 0 && (
          <circle
            ref={progressRingRef}
            cx={cx}
            cy={cy}
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={state === TimerState.Finished ? `url(#complete-gradient-${gradientId})` : `url(#progress-gradient-${gradientId})`}
            className="sync-progress-ring"
            fill="transparent"
            strokeLinecap="round"
            filter={`url(#ring-glow-${gradientId})`}
            style={{ opacity: ringOpacity }}
          />
        )}
      </svg>

      <button
        onClick={isFocusLocked ? undefined : onClick}
        disabled={isFocusLocked}
        aria-label={getHint()}
        className={`relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
          isFocusLocked ? 'cursor-default' : ''
        }`}
      >
        <p
          ref={progressPercentRef}
          className={`mb-3 min-h-[1rem] text-[11px] uppercase tracking-[0.35em] ${
            isIdleReady ? 'text-cyan-400/80' : 'text-gray-500'
          } ${topLabel ? '' : 'invisible'}`}
        >
          {topLabel ?? '\u00A0'}
        </p>

        <h1
          ref={countRef}
          className={`font-semibold tabular-nums tracking-tight transition-transform duration-150 ${
            state === TimerState.Idle && currentRep === 0
              ? 'text-[clamp(2.25rem,11vw,3.5rem)] text-cyan-100/90'
              : 'text-[clamp(3rem,14vw,4.75rem)]'
          } ${isPaused ? 'text-amber-100/90' : state === TimerState.Idle && currentRep === 0 ? '' : 'text-white'}`}
          style={
            isRunning
              ? undefined
              : isPaused
                ? {
                    transform: `scale(${1 + breath.glow * 0.05})`,
                    textShadow: `0 0 ${breath.glow * 28}px ${brandGlow(breath.glow * 0.45)}`,
                  }
                : undefined
          }
        >
          {displayText}
        </h1>

        {targetReps > 0 && state !== TimerState.Finished && (
          <p className="mt-2 text-sm text-gray-400">
            {remaining !== null && remaining > 0
              ? `${remaining.toLocaleString()} remaining`
              : `of ${targetReps.toLocaleString()}`}
          </p>
        )}

        {practiceIntention && (isRunning || isPaused) && (
          <p
            className={`mt-2 max-w-[14rem] truncate text-center text-xs italic ${
              isFocusLocked ? 'text-cyan-300/75' : 'text-cyan-300/60'
            }`}
          >
            {practiceIntention}
          </p>
        )}

        {isIdleReady && estimatedTotal !== null && (
          <p className="mt-1 text-xs text-gray-500">
            ~{formatDuration(estimatedTotal)}
            {soundLabel ? ` · ${soundLabel}` : ''}
          </p>
        )}

        {!isFocusLocked && (
          <div
            ref={controlRef}
            className={`breath-control mt-8 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full shadow-lg ${
              isRunning
                ? 'bg-cyan-500/20 ring-1 ring-cyan-400/30'
                : isPaused
                  ? 'bg-amber-500/15 ring-1 ring-amber-400/25'
                  : state === TimerState.Finished
                    ? 'bg-emerald-500/15 ring-1 ring-emerald-400/25'
                    : 'bg-white/10 ring-1 ring-white/10'
            }`}
            style={
              isRunning
                ? undefined
                : isPaused
                  ? {
                      transform: `scale(${1 + breath.glow * 0.06})`,
                      boxShadow: `0 0 ${breath.glow * 32}px ${brandGlow(breath.glow * 0.35)}`,
                    }
                  : undefined
            }
          >
            {getButtonContent()}
          </div>
        )}

        {showHint ? (
          <p className="mt-4 max-w-[12rem] text-center text-xs text-gray-500">{getHint()}</p>
        ) : null}
      </button>
    </div>
  );
};

export default CircleDisplay;
