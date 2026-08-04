import { SoundOption } from '../types';

export interface SoundGroup {
  id: string;
  label: string;
  options: SoundOption[];
  columns?: 1 | 2 | 3;
}

export const SOUND_HINTS: Record<SoundOption, string> = {
  [SoundOption.Mala]: 'Warm bead',
  [SoundOption.Gong]: 'Deep strike',
  [SoundOption.Crystal]: 'Glass tick',
  [SoundOption.Bowl]: 'Singing bowl',
  [SoundOption.None]: 'Haptics only',
};

export const SOUND_GROUPS: SoundGroup[] = [
  {
    id: 'traditional',
    label: 'Traditional',
    columns: 2,
    options: [SoundOption.Mala, SoundOption.Gong],
  },
  {
    id: 'bright',
    label: 'Bright',
    columns: 2,
    options: [SoundOption.Crystal, SoundOption.Bowl],
  },
  {
    id: 'silent',
    label: 'Silent',
    columns: 1,
    options: [SoundOption.None],
  },
];

export const ALL_SOUND_OPTIONS: SoundOption[] = SOUND_GROUPS.flatMap((g) => g.options);

export const PLAYABLE_SOUND_COUNT = ALL_SOUND_OPTIONS.filter((s) => s !== SoundOption.None).length;

const LEGACY_SOUND_MAP: Record<string, SoundOption> = {
  Wood: SoundOption.Mala,
  Bell: SoundOption.Gong,
  Tap: SoundOption.Crystal,
  Breath: SoundOption.Bowl,
  Om: SoundOption.Gong,
};

/** Coerce persisted values; map removed sounds to the closest kept option. */
export function normalizeSoundOption(value: unknown): SoundOption {
  if (typeof value === 'string') {
    if (ALL_SOUND_OPTIONS.includes(value as SoundOption)) {
      return value as SoundOption;
    }
    if (value in LEGACY_SOUND_MAP) {
      return LEGACY_SOUND_MAP[value];
    }
  }
  return SoundOption.Mala;
}
