
import React from 'react';
import { RestartIcon } from './icons';

interface SessionBarProps {
  summary: string;
  onRestart: () => void;
}

const SessionBar: React.FC<SessionBarProps> = ({ summary, onRestart }) => (
  <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-gray-700/50 bg-gray-900/60 px-4 py-3.5 backdrop-blur-sm">
    <div className="min-w-0 flex-1">
      <p className="label-meta">Session</p>
      <p className="mt-0.5 truncate text-sm text-gray-200">{summary}</p>
    </div>
    <button
      type="button"
      onClick={onRestart}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 active:bg-rose-500/30"
      aria-label="Restart session"
    >
      <RestartIcon className="h-5 w-5" />
    </button>
  </div>
);

export default SessionBar;
