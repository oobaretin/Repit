
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
  None = 'None',
}

export type AppScreen = 'timer' | 'settings';

export const REP_PRESETS = [27, 54, 108, 1000] as const;

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
}
