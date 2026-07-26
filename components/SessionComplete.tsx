
import React from 'react';
import { formatDuration } from '../utils/formatDuration';
import { sessionCompleteGreeting } from '../utils/displayName';

interface SessionCompleteProps {
  reps: number;
  totalSessions: number;
  durationSec?: number | null;
  displayName?: string;
  currentStreak?: number;
  onDismiss: () => void;
}

const SessionComplete: React.FC<SessionCompleteProps> = ({
  reps,
  totalSessions,
  durationSec,
  displayName = '',
  currentStreak = 0,
  onDismiss,
}) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md animate-fade-up sm:items-center">
    <div
      className="w-full max-w-sm rounded-t-[2rem] border border-emerald-500/20 bg-gray-950/95 p-6 shadow-2xl sm:rounded-[2rem] sm:mx-4"
      style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
      role="dialog"
      aria-labelledby="session-complete-title"
    >
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/25">
        <span className="text-4xl text-emerald-400">✓</span>
      </div>
      <h2 id="session-complete-title" className="text-center text-2xl font-semibold text-white">
        {sessionCompleteGreeting(displayName)}
      </h2>
      <p className="mt-2 text-center text-gray-300">
        You completed{' '}
        <span className="font-semibold text-emerald-300">{reps.toLocaleString()}</span>{' '}
        repetitions
        {durationSec ? (
          <>
            {' '}
            in <span className="font-semibold text-emerald-300">{formatDuration(durationSec)}</span>.
          </>
        ) : (
          '.'
        )}
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        {totalSessions} session{totalSessions === 1 ? '' : 's'} in your journey
        {currentStreak > 1 && (
          <>
            {' '}
            · <span className="text-cyan-400/90">{currentStreak}-day streak</span>
          </>
        )}
      </p>
      <button
        onClick={onDismiss}
        className="mt-6 w-full rounded-2xl bg-emerald-500 py-4 text-base font-semibold text-gray-950 transition active:scale-[0.98] active:bg-emerald-400"
      >
        Close
      </button>
    </div>
  </div>
);

export default SessionComplete;
