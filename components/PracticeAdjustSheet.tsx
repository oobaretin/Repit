import React, { useEffect } from 'react';
import { REP_PRESETS, SoundOption } from '../types';
import { ALL_SOUND_OPTIONS, SOUND_HINTS } from '../constants/sounds';
import { formatDuration } from '../utils/formatDuration';

interface PracticeAdjustSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenFullSettings: () => void;
  targetReps: number;
  setTargetReps: (reps: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  selectedSound: SoundOption;
  onSoundSelect: (sound: SoundOption) => void;
  isTimerActive: boolean;
}

const PracticeAdjustSheet: React.FC<PracticeAdjustSheetProps> = ({
  open,
  onClose,
  onOpenFullSettings,
  targetReps,
  setTargetReps,
  delay,
  setDelay,
  selectedSound,
  onSoundSelect,
  isTimerActive,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const estimatedSec = targetReps > 0 ? targetReps * delay : 0;

  return (
    <div className="practice-sheet-root" role="presentation">
      <button
        type="button"
        className="practice-sheet-backdrop"
        aria-label="Close adjust practice"
        onClick={onClose}
      />
      <div
        className="practice-sheet panel-enter"
        role="dialog"
        aria-labelledby="practice-sheet-title"
        aria-modal="true"
      >
        <div className="practice-sheet-handle" aria-hidden="true" />
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 id="practice-sheet-title" className="text-lg font-semibold text-white">
            Adjust practice
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300"
          >
            Done
          </button>
        </header>

        {isTimerActive && (
          <p className="mb-4 rounded-xl bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200/90 ring-1 ring-amber-400/20">
            Session in progress — rep count and interval are locked.
          </p>
        )}

        <div className="space-y-5 overflow-y-auto pb-2">
          <section className="space-y-2">
            <p className="settings-group-label">Target reps</p>
            <div className="grid grid-cols-4 gap-2">
              {REP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetReps(preset)}
                  disabled={isTimerActive}
                  className={`min-h-[44px] rounded-xl py-2.5 text-sm font-medium transition ${
                    targetReps === preset
                      ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40'
                      : 'bg-gray-800/70 text-gray-400 active:bg-gray-700'
                  } disabled:opacity-40`}
                >
                  {preset >= 1000 ? '1k' : preset}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="settings-group-label">Interval</p>
              <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                {delay.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={delay}
              onChange={(e) => setDelay(parseFloat(e.target.value))}
              disabled={isTimerActive}
              className="w-full disabled:opacity-40"
            />
            {targetReps > 0 && (
              <p className="text-xs text-gray-500">~{formatDuration(estimatedSec)} per session</p>
            )}
          </section>

          <section className="space-y-2">
            <p className="settings-group-label">Tick sound</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SOUND_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSoundSelect(option)}
                  className={`rounded-xl px-3 py-2.5 text-left transition ${
                    selectedSound === option
                      ? 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/35'
                      : 'bg-gray-900/60 text-gray-400 ring-1 ring-gray-800/80 active:bg-gray-800/80'
                  }`}
                >
                  <span className="block text-sm font-medium">{option}</span>
                  <span className="block text-xs text-gray-500">{SOUND_HINTS[option]}</span>
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullSettings();
            }}
            className="w-full rounded-xl border border-gray-700/80 py-3 text-sm text-gray-300 hover:border-gray-600 hover:text-white"
          >
            All settings — history, presets & security
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeAdjustSheet;
