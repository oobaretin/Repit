
import React, { useCallback, useState } from 'react';
import { tryBiometricUnlock } from '../services/lockService';
import { hapticsService } from '../services/hapticsService';
import BrandRing from './BrandRing';
import { LockOpenIcon } from './icons';
import { welcomeGreeting } from '../utils/displayName';

interface UnlockWelcomeScreenProps {
  biometricAvailable: boolean;
  displayName?: string;
  onUnlock: () => void;
}

const UnlockWelcomeScreen: React.FC<UnlockWelcomeScreenProps> = ({
  biometricAvailable,
  displayName = '',
  onUnlock,
}) => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [exiting, setExiting] = useState(false);

  const finishUnlock = useCallback(() => {
    setExiting(true);
    void hapticsService.light();
    window.setTimeout(onUnlock, 650);
  }, [onUnlock]);

  const handleUnlockTap = useCallback(async () => {
    if (busy || exiting) return;

    setBusy(true);
    setError('');

    if (biometricAvailable) {
      const ok = await tryBiometricUnlock();
      setBusy(false);
      if (ok) {
        finishUnlock();
        return;
      }
      setError('Could not verify identity');
      return;
    }

    setBusy(false);
    finishUnlock();
  }, [biometricAvailable, busy, exiting, finishUnlock]);

  const unlockLabel = biometricAvailable ? 'Unlock with Face ID' : 'Tap to unlock';
  const welcomeText = welcomeGreeting(displayName);
  const personalized = welcomeText.includes(',');

  return (
    <div
      className={`welcome-splash welcome-splash-locked fixed inset-0 z-[100] flex flex-col ${
        exiting ? 'welcome-splash-exiting' : ''
      }`}
      aria-live="polite"
    >
      <div className="welcome-splash-veil welcome-splash-veil-locked" aria-hidden="true" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6">
        <div className="welcome-splash-scene" aria-hidden="true">
          <div className="welcome-splash-glow welcome-splash-glow-a" />
        </div>

        <div className="welcome-brand-ring-wrap relative z-10">
          <BrandRing className="welcome-brand-ring" />
        </div>

        <p className="welcome-splash-text-wrap welcome-splash-text-wrap-locked relative z-10 mt-8">
          <span
            className={`welcome-splash-text${personalized ? ' welcome-splash-text-personal' : ''}`}
          >
            {welcomeText}
          </span>
        </p>
      </div>

      <div
        className="welcome-unlock-footer px-6 pt-4"
        style={{ paddingBottom: 'calc(1.25rem + var(--safe-bottom))' }}
      >
        {error && <p className="mb-3 text-center text-sm text-rose-400">{error}</p>}
        <button
          type="button"
          onClick={handleUnlockTap}
          disabled={busy || exiting}
          className="welcome-unlock-btn flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-semibold disabled:opacity-50"
          aria-label={unlockLabel}
        >
          <LockOpenIcon className="welcome-unlock-icon h-5 w-5 shrink-0" />
          {unlockLabel}
        </button>
      </div>
    </div>
  );
};

export default UnlockWelcomeScreen;
