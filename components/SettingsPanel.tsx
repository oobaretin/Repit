
import React from 'react';
import { REP_PRESETS, SoundOption } from '../types';
import { RestartIcon } from './icons';

interface SettingsPanelProps {
  targetReps: number;
  setTargetReps: (reps: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  selectedSound: SoundOption;
  setSelectedSound: (sound: SoundOption) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  onRestart: () => void;
  isTimerActive: boolean;
  totalSessions: number;
  totalReps: number;
}

const SoundButton: React.FC<{
  option: SoundOption;
  selected: boolean;
  onClick: (option: SoundOption) => void;
}> = ({ option, selected, onClick }) => (
  <button
    onClick={() => onClick(option)}
    className={`px-4 py-2.5 text-sm rounded-full transition-all duration-200 min-h-[44px] ${
      selected
        ? 'bg-cyan-500 text-gray-950 font-semibold shadow-lg shadow-cyan-500/20'
        : 'bg-gray-700/80 text-gray-200 active:bg-gray-600'
    }`}
  >
    {option}
  </button>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  targetReps,
  setTargetReps,
  delay,
  setDelay,
  selectedSound,
  setSelectedSound,
  hapticsEnabled,
  setHapticsEnabled,
  onRestart,
  isTimerActive,
  totalSessions,
  totalReps,
}) => {
  const soundOptions = Object.values(SoundOption);

  return (
    <div className="w-full max-w-md p-5 bg-gray-800/60 rounded-3xl shadow-2xl backdrop-blur-md border border-gray-700/50 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Lifetime</p>
          <p className="text-sm text-gray-300">
            {totalSessions} sessions · {totalReps.toLocaleString()} reps
          </p>
        </div>
        <button
          onClick={onRestart}
          className="p-3 rounded-full bg-slate-700/80 active:bg-rose-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-75 disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Restart meditation"
          disabled={!isTimerActive && targetReps === 0}
        >
          <RestartIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <label htmlFor="target-reps" className="block text-sm font-medium text-gray-300">
          Target Repetitions
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
          className="w-full bg-gray-900/80 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 p-3 text-center text-lg disabled:opacity-50"
        />
        <div className="flex flex-wrap gap-2">
          {REP_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setTargetReps(preset)}
              disabled={isTimerActive}
              className={`px-3 py-2 rounded-full text-sm min-h-[40px] transition ${
                targetReps === preset
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-gray-700/70 text-gray-300 border border-transparent active:bg-gray-600'
              } disabled:opacity-50`}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="delay-slider" className="block text-sm font-medium text-gray-300">
          Interval · <span className="font-bold text-cyan-400">{delay.toFixed(1)}s</span>
        </label>
        <input
          id="delay-slider"
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          value={delay}
          onChange={(e) => setDelay(parseFloat(e.target.value))}
          disabled={isTimerActive}
          className="w-full disabled:opacity-50"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300">Sound</h3>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {soundOptions.map((option) => (
            <SoundButton
              key={option}
              option={option}
              selected={selectedSound === option}
              onClick={setSelectedSound}
            />
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-2xl bg-gray-900/50 px-4 py-3 min-h-[52px]">
        <span className="text-sm text-gray-300">Haptic feedback</span>
        <button
          type="button"
          role="switch"
          aria-checked={hapticsEnabled}
          onClick={() => setHapticsEnabled(!hapticsEnabled)}
          className={`relative h-7 w-12 rounded-full transition ${
            hapticsEnabled ? 'bg-cyan-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
              hapticsEnabled ? 'left-[1.375rem]' : 'left-0.5'
            }`}
          />
        </button>
      </label>
    </div>
  );
};

export default SettingsPanel;
