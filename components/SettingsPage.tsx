
import React, { useState } from 'react';
import { REP_PRESETS, SettingsPageProps, SoundOption, MAX_CUSTOM_PRESETS } from '../types';
import { SOUND_GROUPS, SOUND_HINTS } from '../constants/sounds';
import { formatDuration } from '../utils/formatDuration';
import { formatHistoryDate } from '../utils/practiceStats';
import { ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
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

const SettingsFold: React.FC<{
  title: string;
  hint?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, hint, badge, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="settings-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="settings-fold-trigger"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1 text-left">
          <h2 className="settings-section-title">{title}</h2>
          {!open && hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className="rounded-full bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
              {badge}
            </span>
          )}
          {open ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>
      {open ? <div className="settings-fold-body">{children}</div> : null}
    </section>
  );
};

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
  currentStreak,
  longestStreak,
  repsThisWeek,
  sessionHistory,
  customPresets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}) => {
  const estimatedSessionSec = targetReps > 0 ? targetReps * delay : 0;
  const [restoreMessage, setRestoreMessage] = useState('');
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetForm, setShowPresetForm] = useState(false);

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

  const handleSavePreset = () => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    onSavePreset(trimmed);
    setPresetName('');
    setShowPresetForm(false);
  };

  const recentHistory = sessionHistory.slice(0, 10);

  const preferenceSummary = [
    hapticsEnabled && 'Haptics on',
    autoFocusLock && 'Focus lock',
    lockOnLeave && 'App lock',
  ]
    .filter(Boolean)
    .join(' · ') || 'Defaults';

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
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gray-950/50 px-2 py-2.5 text-center ring-1 ring-gray-700/40">
              <p className="text-lg font-semibold text-cyan-300">{currentStreak}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Day streak</p>
            </div>
            <div className="rounded-xl bg-gray-950/50 px-2 py-2.5 text-center ring-1 ring-gray-700/40">
              <p className="text-lg font-semibold text-white">{longestStreak}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Best streak</p>
            </div>
            <div className="rounded-xl bg-gray-950/50 px-2 py-2.5 text-center ring-1 ring-gray-700/40">
              <p className="text-lg font-semibold text-white">{repsThisWeek.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Reps (7d)</p>
            </div>
          </div>
          {targetReps > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Next session ~{formatDuration(estimatedSessionSec)}
            </p>
          )}
        </section>

        {recentHistory.length > 0 && (
          <SettingsFold
            title="Recent sessions"
            hint={
              recentHistory[0]
                ? `Latest · ${formatHistoryDate(recentHistory[0].completedAt)} · ${recentHistory[0].reps.toLocaleString()} reps`
                : undefined
            }
            badge={String(recentHistory.length)}
          >
            <ul className="space-y-2">
              {recentHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-950/40 px-3 py-2.5 text-sm ring-1 ring-gray-800/60"
                >
                  <div>
                    <p className="font-medium text-gray-200">{formatHistoryDate(entry.completedAt)}</p>
                    <p className="text-xs text-gray-500">
                      {entry.reps.toLocaleString()} reps · {entry.delay.toFixed(1)}s · {entry.sound}
                    </p>
                  </div>
                  {entry.durationSec != null && (
                    <span className="shrink-0 text-xs text-gray-500">{formatDuration(entry.durationSec)}</span>
                  )}
                </li>
              ))}
            </ul>
          </SettingsFold>
        )}

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

          {(customPresets.length > 0 || showPresetForm) && (
            <div className="space-y-2 border-t border-gray-800/80 pt-3">
              <p className="settings-group-label">Saved presets</p>
              <div className="flex flex-wrap gap-2">
                {customPresets.map((preset) => (
                  <div key={preset.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onApplyPreset(preset)}
                      disabled={isTimerActive}
                      className="rounded-xl bg-violet-500/15 px-3 py-2 text-sm font-medium text-violet-200 ring-1 ring-violet-400/25 active:bg-violet-500/25 disabled:opacity-40"
                    >
                      {preset.name}
                    </button>
                    {!isTimerActive && (
                      <button
                        type="button"
                        onClick={() => onDeletePreset(preset.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                        aria-label={`Delete preset ${preset.name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isTimerActive && customPresets.length < MAX_CUSTOM_PRESETS && (
            <div className="border-t border-gray-800/80 pt-3">
              {showPresetForm ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name"
                    maxLength={24}
                    className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePreset();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="shrink-0 rounded-xl bg-cyan-500/20 px-4 py-2.5 text-sm font-medium text-cyan-300 ring-1 ring-cyan-400/30 disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPresetForm(false);
                      setPresetName('');
                    }}
                    className="shrink-0 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPresetForm(true)}
                  className="w-full rounded-xl border border-dashed border-gray-700 py-2.5 text-sm text-gray-400 hover:border-gray-600 hover:text-gray-300"
                >
                  + Save current as preset
                </button>
              )}
            </div>
          )}
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

        <SettingsFold
          title="Tick sound"
          hint="Tap to preview · plays each rep"
          badge={selectedSound}
        >
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
        </SettingsFold>

        <SettingsFold
          title="Preferences"
          hint={preferenceSummary}
        >
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
        </SettingsFold>

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
