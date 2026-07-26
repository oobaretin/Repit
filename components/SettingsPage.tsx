
import React, { useState } from 'react';
import { REP_PRESETS, SettingsPageProps, SoundOption } from '../types';
import { SOUND_GROUPS, SOUND_HINTS } from '../constants/sounds';
import { formatDuration } from '../utils/formatDuration';
import { ChevronLeftIcon } from './icons';
import packageJson from '../package.json';

const SOUND_GRID_CLASS = {
  1: 'sound-grid-1',
  2: 'sound-grid-2',
  3: 'sound-grid-3',
} as const;

const SoundButton: React.FC<{
  option: SoundOption;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ option, selected, onClick, disabled }) => {
  const isSilent = option === SoundOption.None;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`sound-chip ${selected ? 'sound-chip--selected' : ''} ${isSilent ? 'sound-chip--silent' : ''}`}
    >
      <span className="sound-chip__label">{option}</span>
      <span className="sound-chip__hint">{SOUND_HINTS[option]}</span>
    </button>
  );
};

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
  onBack,
  onRestorePurchases,
  isTimerActive,
  totalSessions,
  totalReps,
}) => {
  const estimatedSessionSec = targetReps > 0 ? targetReps * delay : 0;
  const [restoreMessage, setRestoreMessage] = useState('');
  const [restoreBusy, setRestoreBusy] = useState(false);

  const handleRestore = async () => {
    setRestoreBusy(true);
    setRestoreMessage('');
    const result = await onRestorePurchases();
    setRestoreBusy(false);
    if (result.success) {
      setRestoreMessage('Subscription restored.');
      return;
    }
    if (result.error) setRestoreMessage(result.error);
  };

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

      <div className="mt-5 flex-1 space-y-5 overflow-y-auto pb-6">
        <section className="settings-card">
          <p className="settings-group-label">Lifetime</p>
          <p className="mt-1 text-sm text-gray-300">
            {totalSessions} session{totalSessions === 1 ? '' : 's'} · {totalReps.toLocaleString()} reps
          </p>
          {targetReps > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Next session ~{formatDuration(estimatedSessionSec)}
            </p>
          )}
        </section>

        <section className="settings-card space-y-3">
          <h2 className="settings-section-title">Practice</h2>
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

        <section className="settings-card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="settings-section-title">Interval</h2>
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

        <section className="settings-card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="settings-section-title">Tick sound</h2>
              <p className="mt-1 text-xs text-gray-500">Tap to preview · plays each rep</p>
            </div>
            <span className="shrink-0 rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              {selectedSound}
            </span>
          </div>

          {SOUND_GROUPS.map((group) => (
            <div key={group.id} className="space-y-2">
              <p className="settings-group-label">{group.label}</p>
              <div className={SOUND_GRID_CLASS[group.columns ?? 2]}>
                {group.options.map((option) => (
                  <SoundButton
                    key={option}
                    option={option}
                    selected={selectedSound === option}
                    onClick={() => setSelectedSound(option)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="settings-card space-y-4">
          <h2 className="settings-section-title">Preferences</h2>
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

        <section className="settings-card space-y-3">
          <h2 className="settings-section-title">Subscription</h2>
          <p className="text-xs text-gray-500">
            Manage or cancel in Settings → Apple ID → Subscriptions on your iPhone.
          </p>
          <button
            type="button"
            onClick={handleRestore}
            disabled={restoreBusy}
            className="w-full rounded-xl bg-gray-700/60 py-3 text-sm font-medium text-gray-200 active:bg-gray-700 disabled:opacity-50"
          >
            {restoreBusy ? 'Restoring…' : 'Restore purchases'}
          </button>
          {restoreMessage && (
            <p className={`text-xs ${restoreMessage.includes('restored') ? 'text-emerald-400' : 'text-gray-400'}`}>
              {restoreMessage}
            </p>
          )}
        </section>

        <section>
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
