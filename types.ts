
export enum TimerState {
  Idle,
  Running,
  Paused,
  Finished,
}

export enum SoundOption {
  Mala = 'Mala',
  Gong = 'Gong',
  Crystal = 'Crystal',
  Bowl = 'Bowl',
  None = 'None',
}

export type AppScreen = 'timer' | 'settings';

export const REP_PRESETS = [27, 54, 108, 1000] as const;

export const MAX_SESSION_HISTORY = 100;
export const MAX_CUSTOM_PRESETS = 5;

export interface SessionStats {
  totalSessions: number;
  totalReps: number;
  lastSessionAt: string | null;
}

export const DEFAULT_SESSION_STATS: SessionStats = {
  totalSessions: 0,
  totalReps: 0,
  lastSessionAt: null,
};

export interface SessionRecord {
  id: string;
  completedAt: string;
  reps: number;
  delay: number;
  sound: SoundOption;
  durationSec: number | null;
}

export interface CustomPreset {
  id: string;
  name: string;
  reps: number;
  delay: number;
  sound: SoundOption;
}

export interface SettingsPageProps {
  targetReps: number;
  setTargetReps: (reps: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  selectedSound: SoundOption;
  setSelectedSound: (sound: SoundOption) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  lockOnLeave: boolean;
  setLockOnLeave: (enabled: boolean) => void;
  autoFocusLock: boolean;
  setAutoFocusLock: (enabled: boolean) => void;
  onLogout: () => void;
  onBack: () => void;
  onRestorePurchases: () => Promise<{ success: boolean; error?: string }>;
  isTimerActive: boolean;
  totalSessions: number;
  totalReps: number;
  currentStreak: number;
  longestStreak: number;
  repsThisWeek: number;
  sessionHistory: SessionRecord[];
  customPresets: CustomPreset[];
  practiceIntention: string;
  setPracticeIntention: (value: string) => void;
  onSavePreset: (name: string) => void;
  onApplyPreset: (preset: CustomPreset) => void;
  onDeletePreset: (id: string) => void;
  reminderEnabled: boolean;
  setReminderEnabled: (enabled: boolean) => void;
  reminderHour: number;
  reminderMinute: number;
  setReminderTime: (hour: number, minute: number) => void;
  reminderStatusMessage: string;
}
