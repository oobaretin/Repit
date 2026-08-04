
import React from 'react';
import { REP_PRESETS } from '../types';

const QUICK_REPS = REP_PRESETS.filter((n) => n <= 108);

interface QuickPracticeChipsProps {
  targetReps: number;
  onSelect: (reps: number) => void;
}

const QuickPracticeChips: React.FC<QuickPracticeChipsProps> = ({ targetReps, onSelect }) => (
  <div className="flex w-full max-w-md flex-col items-center gap-2">
    <p className="text-[10px] uppercase tracking-[0.28em] text-gray-600">Quick count</p>
    <div className="flex w-full gap-2">
      {QUICK_REPS.map((reps) => {
        const selected = targetReps === reps;
        return (
          <button
            key={reps}
            type="button"
            onClick={() => onSelect(reps)}
            aria-pressed={selected}
            className={`min-h-[44px] flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
              selected
                ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40'
                : 'bg-gray-900/50 text-gray-400 ring-1 ring-gray-800/80 active:bg-gray-800/80'
            }`}
          >
            {reps}
          </button>
        );
      })}
    </div>
  </div>
);

export default QuickPracticeChips;
