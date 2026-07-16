
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
