import { SoundOption } from '../types';

export interface SoundGroup {
  id: string;
  label: string;
  options: SoundOption[];
}

export const SOUND_GROUPS: SoundGroup[] = [
  {
    id: 'traditional',
    label: 'Traditional',
    options: [SoundOption.Mala, SoundOption.Wood, SoundOption.Gong, SoundOption.Bell],
  },
  {
    id: 'bright',
    label: 'Bright',
    options: [SoundOption.Crystal, SoundOption.Bowl, SoundOption.Tap],
  },
  {
    id: 'soft',
    label: 'Soft',
    options: [SoundOption.Breath, SoundOption.Om],
  },
  {
    id: 'silent',
    label: 'Silent',
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

export const MALA_SOUND_PATH = '/sounds/mala.mp3';
