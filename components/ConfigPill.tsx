
import React from 'react';
import { ChevronRightIcon } from './icons';

interface ConfigPillProps {
  summary: string;
  onPress: () => void;
  intention?: string;
  currentStreak?: number;
  repsThisWeek?: number;
}

const ConfigPill: React.FC<ConfigPillProps> = ({
  summary,
  onPress,
  intention = '',
  currentStreak = 0,
  repsThisWeek = 0,
}) => {
  const statsLine = [
    currentStreak > 0 ? `${currentStreak}-day streak` : '',
    repsThisWeek > 0 ? `${repsThisWeek.toLocaleString()} reps this week` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-gray-700/50 bg-gray-900/60 px-4 py-3.5 text-left backdrop-blur-sm transition active:scale-[0.99] active:bg-gray-800/80"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Adjust practice</p>
        <p className="mt-0.5 truncate text-sm text-gray-200">{summary}</p>
        {intention ? (
          <p className="mt-1 truncate text-xs italic text-cyan-300/70">&ldquo;{intention}&rdquo;</p>
        ) : null}
        {statsLine ? (
          <p className="mt-1 truncate text-xs text-gray-500">{statsLine}</p>
        ) : null}
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-500" />
    </button>
  );
};

export default ConfigPill;
