import { Capacitor } from '@capacitor/core';

export async function tryBiometricUnlock(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    await NativeBiometric.verifyIdentity({
      reason: 'Unlock Repit',
      title: 'Repit',
      subtitle: 'Use Face ID or Touch ID',
    });
    return true;
  } catch {
    return false;
  }
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable({ useFallback: false });
    return result.isAvailable;
  } catch {
    return false;
  }
}
