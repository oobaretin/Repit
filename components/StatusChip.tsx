
import React from 'react';
import { TimerState } from '../types';

interface StatusChipProps {
  state: TimerState;
}

const STATUS: Record<TimerState, { label: string; className: string }> = {
  [TimerState.Idle]: {
    label: 'Ready',
    className: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
  },
  [TimerState.Running]: {
    label: 'In session',
    className: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  },
  [TimerState.Paused]: {
    label: 'Paused',
    className: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  },
  [TimerState.Finished]: {
    label: 'Complete',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  },
};

const StatusChip: React.FC<StatusChipProps> = ({ state }) => {
  const { label, className } = STATUS[state];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${className}`}
    >
      {state === TimerState.Running && (
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
      )}
      {label}
    </span>
  );
};

export default StatusChip;
