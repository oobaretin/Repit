
import React, { useCallback, useState } from 'react';
import { tryBiometricUnlock } from '../services/lockService';
import BrandMark from './BrandMark';

interface AppLockScreenProps {
  onUnlock: () => void;
  biometricAvailable: boolean;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock, biometricAvailable }) => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const unlockWithBiometric = useCallback(async () => {
    setBusy(true);
    setError('');
    const ok = await tryBiometricUnlock();
    setBusy(false);
    if (ok) onUnlock();
    else setError('Could not verify identity');
  }, [onUnlock]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060912] px-6">
      <BrandMark size={88} className="mb-6 rounded-[22px] shadow-2xl shadow-cyan-500/15" />
      <h2 className="text-2xl font-semibold text-white">Repit is locked</h2>
      <p className="mt-2 text-center text-sm text-gray-400">Unlock to continue your practice</p>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      {biometricAvailable ? (
        <button
          type="button"
          onClick={unlockWithBiometric}
          disabled={busy}
          className="mt-10 rounded-2xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-gray-950 active:bg-cyan-400 disabled:opacity-40"
        >
          Unlock with Face ID
        </button>
      ) : (
        <button
          type="button"
          onClick={onUnlock}
          className="mt-10 rounded-2xl bg-cyan-500 px-8 py-3.5 text-base font-semibold text-gray-950 active:bg-cyan-400"
        >
          Unlock
        </button>
      )}
    </div>
  );
};

export default AppLockScreen;
