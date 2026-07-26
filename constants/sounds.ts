import { SoundOption } from '../types';

export interface SoundGroup {
  id: string;
  label: string;
  options: SoundOption[];
  columns?: 1 | 2 | 3;
}

export const SOUND_HINTS: Record<SoundOption, string> = {
  [SoundOption.Mala]: 'Warm bead',
  [SoundOption.Wood]: 'Soft knock',
  [SoundOption.Gong]: 'Deep strike',
  [SoundOption.Bell]: 'Temple chime',
  [SoundOption.Crystal]: 'Glass tick',
  [SoundOption.Bowl]: 'Singing bowl',
  [SoundOption.Tap]: 'Light click',
  [SoundOption.Breath]: 'Soft exhale',
  [SoundOption.Om]: 'Low hum',
  [SoundOption.None]: 'Haptics only',
};

export const SOUND_GROUPS: SoundGroup[] = [
  {
    id: 'traditional',
    label: 'Traditional',
    columns: 2,
    options: [SoundOption.Mala, SoundOption.Wood, SoundOption.Gong, SoundOption.Bell],
  },
  {
    id: 'bright',
    label: 'Bright',
    columns: 3,
    options: [SoundOption.Crystal, SoundOption.Bowl, SoundOption.Tap],
  },
  {
    id: 'soft',
    label: 'Soft',
    options: [SoundOption.Breath, SoundOption.Om],
    columns: 2,
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

/** Coerce persisted values after sound library expansion. */
export function normalizeSoundOption(value: unknown): SoundOption {
  if (typeof value === 'string' && ALL_SOUND_OPTIONS.includes(value as SoundOption)) {
    return value as SoundOption;
  }
  return SoundOption.Mala;
}
