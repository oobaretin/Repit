
import React, { useEffect, useRef } from 'react';
import { TimerState } from '../types';
import { formatDuration } from '../utils/formatDuration';
import { PlayIcon, PauseIcon, CheckIcon } from './icons';

interface CircleDisplayProps {
  state: TimerState;
  currentRep: number;
  targetReps: number;
  delay: number;
  onClick: () => void;
  isFocusLocked?: boolean;
  immersive?: boolean;
}

const CircleDisplay: React.FC<CircleDisplayProps> = ({
  state,
  currentRep,
  targetReps,
  delay,
  onClick,
  isFocusLocked = false,
  immersive = false,
}) => {
  const countRef = useRef<HTMLHeadingElement>(null);
  const prevRep = useRef(currentRep);

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const progress = targetReps > 0 ? (currentRep / targetReps) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isRunning = state === TimerState.Running;
  const isPaused = state === TimerState.Paused;
  const remaining = targetReps > 0 ? Math.max(0, targetReps - currentRep) : null;
  const estimatedTotal = targetReps > 0 ? targetReps * delay : null;
  const breathDuration = Math.max(delay, 0.5);

  const breathStyle = {
    '--breath-duration': `${breathDuration}s`,
  } as React.CSSProperties;

  useEffect(() => {
    if (currentRep > prevRep.current && countRef.current) {
      countRef.current.classList.remove('rep-pop');
      void countRef.current.offsetWidth;
      countRef.current.classList.add('rep-pop');
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
        return 'Breathe with the circle';
      case TimerState.Paused:
        return 'Tap to resume';
      case TimerState.Finished:
        return 'Tap to reset';
      default:
        return 'Tap to begin';
    }
  };

  const breathMode = isRunning ? 'breath-running' : isPaused ? 'breath-paused' : 'breath-idle';
  const displayCount = currentRep > 0 ? currentRep.toLocaleString() : '0';
  const displayText =
    state === TimerState.Finished ? 'Done' : state === TimerState.Idle && currentRep === 0 ? 'Start' : displayCount;

  return (
    <div
      className={`relative flex aspect-square items-center justify-center transition-all duration-500 ${
        immersive ? 'w-[min(96vw,28rem)]' : 'w-[min(92vw,24rem)]'
      }`}
    >
      <div className={`breath-stack ${breathMode}`} style={breathStyle} aria-hidden="true">
        <div className="breath-layer breath-layer-outer" />
        <div className="breath-layer breath-layer-mid" />
        <div className="breath-layer breath-layer-inner" />
      </div>

      <svg
        className={`absolute h-full w-full -rotate-90 ${breathMode}`}
        style={breathStyle}
        viewBox="0 0 300 300"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="complete-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <circle
          cx="150"
          cy="150"
          r={radius}
          strokeWidth="8"
          className="stroke-gray-800/80"
          fill="transparent"
        />
        {targetReps > 0 && (
          <circle
            cx="150"
            cy="150"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={state === TimerState.Finished ? 'url(#complete-gradient)' : 'url(#progress-gradient)'}
            className="breath-progress-stroke transition-[stroke-dashoffset] duration-500 ease-out"
            fill="transparent"
            strokeLinecap="round"
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
        <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gray-500">
          {targetReps > 0 ? `${Math.min(100, Math.round(progress))}%` : 'Open count'}
        </p>

        <h1
          ref={countRef}
          className={`font-semibold tabular-nums tracking-tight ${
            state === TimerState.Idle && currentRep === 0
              ? 'text-[clamp(2.25rem,11vw,3.5rem)] text-cyan-100/90'
              : 'text-[clamp(3rem,14vw,4.75rem)]'
          } ${isPaused ? 'text-amber-100/90' : state === TimerState.Idle && currentRep === 0 ? '' : 'text-white'} ${
            isRunning ? 'breath-count' : ''
          }`}
          style={isRunning ? breathStyle : undefined}
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

        {state === TimerState.Idle && estimatedTotal !== null && currentRep === 0 && (
          <p className="mt-1 text-xs text-gray-500">~{formatDuration(estimatedTotal)} session</p>
        )}

        {!isFocusLocked && (
          <div
            className={`breath-control mt-8 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full shadow-lg ${
              isRunning
                ? 'bg-cyan-500/20 shadow-cyan-500/10 ring-1 ring-cyan-400/30'
                : isPaused
                  ? 'bg-amber-500/15 ring-1 ring-amber-400/25'
                  : state === TimerState.Finished
                    ? 'bg-emerald-500/15 ring-1 ring-emerald-400/25'
                    : 'bg-white/10 ring-1 ring-white/10'
            }`}
            style={isRunning ? breathStyle : undefined}
          >
            {getButtonContent()}
          </div>
        )}

        <p className="mt-4 max-w-[12rem] text-center text-xs text-gray-500">{getHint()}</p>
      </button>
    </div>
  );
};

export default CircleDisplay;
