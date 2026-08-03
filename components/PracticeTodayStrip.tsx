
import React from 'react';

interface PracticeTodayStripProps {
  currentStreak: number;
  repsThisWeek: number;
  totalSessions: number;
}

const PracticeTodayStrip: React.FC<PracticeTodayStripProps> = ({
  currentStreak,
  repsThisWeek,
  totalSessions,
}) => {
  if (totalSessions === 0) return null;

  return (
    <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2">
      {currentStreak > 0 && (
        <span className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 ring-1 ring-cyan-400/20">
          {currentStreak}-day streak
        </span>
      )}
      {repsThisWeek > 0 && (
        <span className="rounded-full bg-gray-800/60 px-3 py-1.5 text-xs text-gray-400 ring-1 ring-gray-700/50">
          {repsThisWeek.toLocaleString()} reps this week
        </span>
      )}
    </div>
  );
};

export default PracticeTodayStrip;
