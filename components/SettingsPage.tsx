
import React from 'react';
import { REP_PRESETS, SettingsPageProps, SoundOption } from '../types';
import { formatDuration } from '../utils/formatDuration';
import { ChevronLeftIcon } from './icons';
import packageJson from '../package.json';

const SoundButton: React.FC<{
  option: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ option, selected, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 min-w-[calc(50%-0.25rem)] rounded-2xl px-3 py-3 text-sm min-h-[48px] transition ${
      selected
        ? 'bg-cyan-500 font-semibold text-gray-950 shadow-md shadow-cyan-500/20'
        : 'bg-gray-800/80 text-gray-300 active:bg-gray-700'
    } disabled:opacity-40`}
  >
    {option}
  </button>
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}> = ({ checked, onChange, label, description }) => (
  <label className="flex items-center justify-between gap-3">
    <div>
      <span className="block text-sm text-gray-300">{label}</span>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-8 w-[3.25rem] shrink-0 rounded-full transition ${
        checked ? 'bg-cyan-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? 'left-[1.45rem]' : 'left-1'
        }`}
      />
    </button>
  </label>
);

const SettingsPage: React.FC<SettingsPageProps> = ({
  targetReps,
  setTargetReps,
  delay,
  setDelay,
  selectedSound,
  setSelectedSound,
  hapticsEnabled,
  setHapticsEnabled,
  lockOnLeave,
  setLockOnLeave,
  autoFocusLock,
  setAutoFocusLock,
  onLogout,
  onRestart,
  onBack,
  isTimerActive,
  totalSessions,
  totalReps,
}) => {
  const soundOptions = Object.values(SoundOption);
  const estimatedSessionSec = targetReps > 0 ? targetReps * delay : 0;

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b border-gray-800/80 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-icon"
          aria-label="Back to timer"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">Settings</h1>
          <p className="text-xs text-gray-500">Practice, sound & security</p>
        </div>
      </header>

      {isTimerActive && (
        <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-xs text-amber-200/90 ring-1 ring-amber-400/20">
          Session in progress — rep count and interval are locked until you finish or restart.
        </p>
      )}

      <div className="mt-5 flex-1 space-y-6 overflow-y-auto pb-6">
        <section className="rounded-2xl border border-gray-700/40 bg-gray-800/40 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Lifetime</p>
          <p className="mt-1 text-sm text-gray-300">
            {totalSessions} session{totalSessions === 1 ? '' : 's'} · {totalReps.toLocaleString()} reps
          </p>
          {targetReps > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Next session ~{formatDuration(estimatedSessionSec)}
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-200">Practice</h2>
          <label htmlFor="target-reps" className="block text-sm text-gray-400">
            Target repetitions
          </label>
          <input
            id="target-reps"
            type="number"
            inputMode="numeric"
            min="0"
            max="1000000"
            value={targetReps}
            onChange={(e) => setTargetReps(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={isTimerActive}
            className="w-full rounded-2xl border border-gray-700 bg-gray-950/60 p-3.5 text-center text-xl font-medium text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-40"
          />
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

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-200">Interval</h2>
            <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              {delay.toFixed(1)}s
            </span>
          </div>
          <input
            id="delay-slider"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={delay}
            onChange={(e) => setDelay(parseFloat(e.target.value))}
            disabled={isTimerActive}
            className="w-full disabled:opacity-40"
          />
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>0.5s</span>
            <span>10s</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-200">Sound</h2>
          <div className="flex flex-wrap gap-2">
            {soundOptions.map((option) => (
              <SoundButton
                key={option}
                option={option}
                selected={selectedSound === option}
                onClick={() => setSelectedSound(option)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-700/40 bg-gray-800/40 p-4">
          <h2 className="text-sm font-medium text-gray-200">Preferences</h2>
          <Toggle
            checked={hapticsEnabled}
            onChange={() => setHapticsEnabled(!hapticsEnabled)}
            label="Haptic feedback"
            description="Gentle tap each rep"
          />
          <Toggle
            checked={autoFocusLock}
            onChange={() => setAutoFocusLock(!autoFocusLock)}
            label="Auto focus lock"
            description="Hide timer controls when session starts"
          />
          <Toggle
            checked={lockOnLeave}
            onChange={() => setLockOnLeave(!lockOnLeave)}
            label="Lock when leaving app"
            description="Require unlock after switching apps"
          />
        </section>

        <section className="space-y-3">
          <button
            type="button"
            onClick={onRestart}
            disabled={!isTimerActive}
            className="w-full rounded-xl bg-gray-800 py-3.5 text-sm font-medium text-gray-200 active:bg-gray-700 disabled:opacity-40"
          >
            Restart session
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl bg-rose-500/15 py-3.5 text-sm font-medium text-rose-300 ring-1 ring-rose-400/25 active:bg-rose-500/25"
          >
            Logout
          </button>
        </section>

        <p className="pb-2 text-center text-[11px] text-gray-600">
          Repit v{packageJson.version}
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
