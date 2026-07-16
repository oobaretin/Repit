
import React from 'react';
import { TimerState } from '../types';
import { PlayIcon, PauseIcon, CheckIcon } from './icons';

interface CircleDisplayProps {
  state: TimerState;
  currentRep: number;
  targetReps: number;
  onClick: () => void;
}

const CircleDisplay: React.FC<CircleDisplayProps> = ({ state, currentRep, targetReps, onClick }) => {
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const progress = targetReps > 0 ? (currentRep / targetReps) * 100 : 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isRunning = state === TimerState.Running;

  const getButtonContent = () => {
    switch (state) {
      case TimerState.Running:
        return <PauseIcon className="w-14 h-14 text-slate-100" />;
      case TimerState.Paused:
        return <PlayIcon className="w-14 h-14 text-slate-100" />;
      case TimerState.Finished:
        return <CheckIcon className="w-16 h-16 text-green-400" />;
      case TimerState.Idle:
      default:
        return <PlayIcon className="w-14 h-14 text-slate-100" />;
    }
  };

  const getAriaLabel = () => {
    switch (state) {
      case TimerState.Running:
        return `Pause meditation. Current count is ${currentRep}.`;
      case TimerState.Paused:
        return `Resume meditation. Current count is ${currentRep}.`;
      case TimerState.Finished:
        return 'Meditation complete. Tap to restart.';
      case TimerState.Idle:
      default:
        return 'Start meditation.';
    }
  };

  const displayCount = currentRep > 0 ? currentRep.toLocaleString() : 'REPEAT';
  const displayText = state === TimerState.Finished ? 'DONE' : displayCount;
  const progressLabel =
    targetReps > 0 ? `${Math.min(100, Math.round(progress))}%` : 'Open';

  return (
    <div className="relative w-[min(88vw,22rem)] aspect-square flex items-center justify-center">
      {isRunning && (
        <div className="absolute inset-0 rounded-full bg-cyan-400/5 animate-pulse-ring" />
      )}
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 300 300" aria-hidden="true">
        <circle
          cx="150"
          cy="150"
          r={radius}
          strokeWidth="10"
          className="stroke-gray-700/60"
          fill="transparent"
        />
        {targetReps > 0 && (
          <circle
            cx="150"
            cy="150"
            r={radius}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="stroke-cyan-400 transition-all duration-500 ease-linear"
            fill="transparent"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80 mb-2">
          {progressLabel}
        </p>
        <h1 className="text-[clamp(2.5rem,10vw,3.75rem)] font-bold text-slate-100 tracking-wider transition-colors duration-300">
          {displayText}
        </h1>
        {targetReps > 0 && state !== TimerState.Finished && (
          <p className="mt-2 text-sm text-gray-400">
            of {targetReps.toLocaleString()}
          </p>
        )}
        <button
          onClick={onClick}
          aria-label={getAriaLabel()}
          className="absolute bottom-8 w-[4.75rem] h-[4.75rem] rounded-full flex items-center justify-center bg-slate-800/70 active:bg-slate-700/90 transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 shadow-lg shadow-black/30"
        >
          {getButtonContent()}
        </button>
      </div>
    </div>
  );
};

export default CircleDisplay;
