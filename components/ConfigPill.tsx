
import React from 'react';
import { ChevronRightIcon } from './icons';

interface ConfigPillProps {
  summary: string;
  onPress: () => void;
}

const ConfigPill: React.FC<ConfigPillProps> = ({ summary, onPress }) => (
  <button
    type="button"
    onClick={onPress}
    className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-gray-700/50 bg-gray-900/60 px-4 py-3.5 text-left backdrop-blur-sm transition active:scale-[0.99] active:bg-gray-800/80"
  >
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Practice</p>
      <p className="mt-0.5 truncate text-sm text-gray-200">{summary}</p>
    </div>
    <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-500" />
  </button>
);

export default ConfigPill;
