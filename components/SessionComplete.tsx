
import React from 'react';

interface SessionCompleteProps {
  reps: number;
  totalSessions: number;
  onDismiss: () => void;
}

const SessionComplete: React.FC<SessionCompleteProps> = ({
  reps,
  totalSessions,
  onDismiss,
}) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-[calc(1rem+var(--safe-bottom))] bg-black/60 backdrop-blur-sm animate-fade-up">
    <div
      className="w-full max-w-sm rounded-3xl border border-cyan-500/20 bg-gray-900/95 p-6 shadow-2xl"
      role="dialog"
      aria-labelledby="session-complete-title"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-400 text-3xl">
        ✓
      </div>
      <h2 id="session-complete-title" className="text-center text-2xl font-semibold text-white">
        Session Complete
      </h2>
      <p className="mt-2 text-center text-gray-300">
        You completed <span className="font-semibold text-cyan-300">{reps.toLocaleString()}</span> repetitions.
      </p>
      <p className="mt-1 text-center text-sm text-gray-500">
        {totalSessions} session{totalSessions === 1 ? '' : 's'} logged
      </p>
      <button
        onClick={onDismiss}
        className="mt-6 w-full rounded-2xl bg-cyan-500 py-3.5 text-base font-semibold text-gray-950 transition active:scale-[0.98] active:bg-cyan-400"
      >
        Done
      </button>
    </div>
  </div>
);

export default SessionComplete;
