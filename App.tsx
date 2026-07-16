
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, SoundOption, DEFAULT_SESSION_STATS, AppScreen } from './types';
import { audioService } from './services/audioService';
import { hapticsService } from './services/hapticsService';
import { nativeService } from './services/nativeService';
import { isBiometricAvailable } from './services/lockService';
import CircleDisplay from './components/CircleDisplay';
import SettingsPage from './components/SettingsPage';
import SessionBar from './components/SessionBar';
import SessionComplete from './components/SessionComplete';
import StatusChip from './components/StatusChip';
import AppLockScreen from './components/AppLockScreen';
import FocusLockOverlay from './components/FocusLockOverlay';
import BrandMark from './components/BrandMark';
import ConfigPill from './components/ConfigPill';
import usePersistentState from './hooks/usePersistentState';
import { useMeditationTimer } from './hooks/useMeditationTimer';
import { LockIcon, SettingsIcon } from './components/icons';

const shellStyle = {
  paddingTop: 'calc(0.75rem + var(--safe-top))',
  paddingBottom: 'calc(0.75rem + var(--safe-bottom))',
  paddingLeft: 'calc(1rem + var(--safe-left))',
  paddingRight: 'calc(1rem + var(--safe-right))',
} as const;

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('timer');
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle);
  const [currentRep, setCurrentRep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [sessionDurationSec, setSessionDurationSec] = useState<number | null>(null);
  const [appUnlocked, setAppUnlocked] = useState(true);
  const [focusLocked, setFocusLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const currentRepRef = useRef(currentRep);
  const sessionStartRef = useRef<number | null>(null);

  const [targetReps, setTargetReps] = usePersistentState('repit-targetReps', 108);
  const [delay, setDelay] = usePersistentState('repit-delay', 2.0);
  const [selectedSound, setSelectedSound] = usePersistentState<SoundOption>('repit-sound', SoundOption.Mala);
  const [hapticsEnabled, setHapticsEnabled] = usePersistentState('repit-haptics', true);
  const [sessionStats, setSessionStats] = usePersistentState('repit-sessionStats', DEFAULT_SESSION_STATS);
  const [lockOnLeave, setLockOnLeave] = usePersistentState('repit-lockOnLeave', true);
  const [autoFocusLock, setAutoFocusLock] = usePersistentState('repit-autoFocusLock', true);

  currentRepRef.current = currentRep;
  const isTimerActive = timerState === TimerState.Running || timerState === TimerState.Paused;
  const sessionSummary = `${targetReps.toLocaleString()} reps · ${delay.toFixed(1)}s · ${selectedSound}`;

  useEffect(() => {
    nativeService.initialize();
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  useEffect(() => {
    hapticsService.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    nativeService.setKeepAwake(timerState === TimerState.Running);
    return () => {
      void nativeService.setKeepAwake(false);
    };
  }, [timerState]);

  useEffect(() => {
    if (timerState === TimerState.Running) {
      setScreen('timer');
      if (autoFocusLock) setFocusLocked(true);
    }
    if (timerState === TimerState.Idle) {
      setFocusLocked(false);
    }
  }, [timerState, autoFocusLock]);

  useEffect(() => {
    return nativeService.onAppStateChange((isActive) => {
      if (!isActive) {
        if (timerState === TimerState.Running) setTimerState(TimerState.Paused);
        if (lockOnLeave) setAppUnlocked(false);
      }
    });
  }, [timerState, lockOnLeave]);

  const playFeedback = useCallback(async (kind: 'tick' | 'success' | 'tap') => {
    if (selectedSound !== SoundOption.None) audioService.playSound(selectedSound);
    if (kind === 'success') await hapticsService.success();
    else if (kind === 'tick') await hapticsService.light();
    else await hapticsService.medium();
  }, [selectedSound]);

  const handleSoundSelection = useCallback((sound: SoundOption) => {
    audioService.initialize();
    setSelectedSound(sound);
    if (sound !== SoundOption.None) audioService.playSound(sound);
    hapticsService.light();
  }, [setSelectedSound]);

  const completeSession = useCallback(() => {
    setTimerState((prev) => (prev === TimerState.Finished ? prev : TimerState.Finished));
    setCurrentRep(targetReps);
    setShowComplete(true);
    setFocusLocked(false);
    if (sessionStartRef.current) {
      setSessionDurationSec(Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000)));
      sessionStartRef.current = null;
    }
    setSessionStats((prev) => ({
      totalSessions: prev.totalSessions + 1,
      totalReps: prev.totalReps + targetReps,
      lastSessionAt: new Date().toISOString(),
    }));
    playFeedback('success');
  }, [playFeedback, setSessionStats, targetReps]);

  const handleTick = useCallback(() => {
    setCurrentRep((prev) => prev + 1);
    playFeedback('tick');
  }, [playFeedback]);

  useMeditationTimer({
    timerState,
    delay,
    targetReps,
    getCurrentRep: () => currentRepRef.current,
    onTick: handleTick,
    onComplete: completeSession,
  });

  const handleStartPauseResume = useCallback(async () => {
    if (focusLocked) return;
    audioService.initialize();

    if (timerState === TimerState.Running) {
      setTimerState(TimerState.Paused);
      await hapticsService.medium();
      return;
    }

    if (timerState === TimerState.Finished) {
      setCurrentRep(0);
      setTimerState(TimerState.Idle);
      setShowComplete(false);
      await hapticsService.light();
      return;
    }

    if (currentRep === 0) {
      sessionStartRef.current = Date.now();
      await playFeedback('tap');
    } else {
      await hapticsService.medium();
    }
    setTimerState(TimerState.Running);
  }, [timerState, currentRep, playFeedback, focusLocked]);

  const handleRestart = useCallback(async () => {
    setTimerState(TimerState.Idle);
    setCurrentRep(0);
    setShowComplete(false);
    setSessionDurationSec(null);
    setFocusLocked(false);
    sessionStartRef.current = null;
    setScreen('timer');
    await hapticsService.medium();
  }, []);

  const dismissComplete = useCallback(async () => {
    setShowComplete(false);
    setCurrentRep(0);
    setSessionDurationSec(null);
    setTimerState(TimerState.Idle);
    await hapticsService.light();
  }, []);

  const handleLogout = useCallback(async () => {
    setAppUnlocked(false);
    await hapticsService.medium();
  }, []);

  const openSettings = useCallback(async () => {
    setScreen('settings');
    await hapticsService.light();
  }, []);

  if (!appUnlocked) {
    return (
      <AppLockScreen
        biometricAvailable={biometricAvailable}
        onUnlock={() => setAppUnlocked(true)}
      />
    );
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#060912] text-white"
      style={shellStyle}
    >
      <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        {screen === 'settings' ? (
          <div key="settings" className="page-enter flex min-h-full flex-1 flex-col">
          <SettingsPage
            targetReps={targetReps}
            setTargetReps={setTargetReps}
            delay={delay}
            setDelay={setDelay}
            selectedSound={selectedSound}
            setSelectedSound={handleSoundSelection}
            hapticsEnabled={hapticsEnabled}
            setHapticsEnabled={setHapticsEnabled}
            lockOnLeave={lockOnLeave}
            setLockOnLeave={setLockOnLeave}
            autoFocusLock={autoFocusLock}
            setAutoFocusLock={setAutoFocusLock}
            onLogout={handleLogout}
            onRestart={handleRestart}
            onBack={() => setScreen('timer')}
            isTimerActive={isTimerActive}
            totalSessions={sessionStats.totalSessions}
            totalReps={sessionStats.totalReps}
          />
          </div>
        ) : (
          <div key="timer" className="page-enter flex min-h-full flex-1 flex-col">
          <>
            {!focusLocked && (
              <header className="flex items-center justify-between px-1 pb-3 pt-1">
                <div className="flex items-center gap-3">
                  <BrandMark size={36} className="shrink-0 rounded-[10px] shadow-lg shadow-cyan-500/10" />
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-white">Repit</p>
                    <p className="text-[11px] text-gray-500">Mindfulness timer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isTimerActive && (
                    <button
                      type="button"
                      onClick={() => setFocusLocked(true)}
                      className="btn-icon"
                      aria-label="Lock focus mode"
                    >
                      <LockIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openSettings}
                    className="btn-icon"
                    aria-label="Open settings"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </button>
                  <StatusChip state={timerState} />
                </div>
              </header>
            )}

            <div
              className={`flex flex-1 flex-col items-center justify-center transition-all duration-500 ${
                focusLocked ? 'gap-0 py-2' : 'gap-8 py-6'
              }`}
            >
              <CircleDisplay
                state={timerState}
                currentRep={currentRep}
                targetReps={targetReps}
                delay={delay}
                onClick={handleStartPauseResume}
                isFocusLocked={focusLocked}
                immersive={focusLocked}
              />

              {!focusLocked && isTimerActive && (
                <SessionBar summary={sessionSummary} onRestart={handleRestart} />
              )}

              {!focusLocked && timerState === TimerState.Idle && !showComplete && (
                <ConfigPill summary={sessionSummary} onPress={openSettings} />
              )}
            </div>
          </>
          </div>
        )}
      </div>

      {focusLocked && screen === 'timer' && (
        <FocusLockOverlay onUnlock={() => setFocusLocked(false)} />
      )}

      {showComplete && (
        <SessionComplete
          reps={targetReps}
          totalSessions={sessionStats.totalSessions}
          durationSec={sessionDurationSec}
          onDismiss={dismissComplete}
        />
      )}
    </main>
  );
};

export default App;
