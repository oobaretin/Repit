
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TimerState,
  SoundOption,
  DEFAULT_SESSION_STATS,
  AppScreen,
  MAX_SESSION_HISTORY,
  MAX_CUSTOM_PRESETS,
  type SessionRecord,
  type CustomPreset,
} from './types';
import { normalizeSoundOption } from './constants/sounds';
import { audioService } from './services/audioService';
import { hapticsService } from './services/hapticsService';
import { nativeService } from './services/nativeService';
import { isBiometricAvailable } from './services/lockService';
import { syncWidgetData } from './services/widgetSyncService';
import {
  appendSessionRecord,
  computeCurrentStreak,
  computeLongestStreak,
  repsInLastDays,
} from './utils/practiceStats';
import CircleDisplay from './components/CircleDisplay';
import SettingsPage from './components/SettingsPage';
import SessionBar from './components/SessionBar';
import SessionComplete from './components/SessionComplete';
import StatusChip from './components/StatusChip';
import UnlockWelcomeScreen from './components/UnlockWelcomeScreen';
import FocusLockOverlay from './components/FocusLockOverlay';
import BrandMark from './components/BrandMark';
import ConfigPill from './components/ConfigPill';
import OnboardingFlow from './components/OnboardingFlow';
import PaywallScreen from './components/PaywallScreen';
import TrialReminderBanner from './components/TrialReminderBanner';
import BootstrapLoading from './components/BootstrapLoading';
import usePersistentState from './hooks/usePersistentState';
import { normalizePracticeIntention } from './utils/practiceIntention';
import { useMeditationTimer } from './hooks/useMeditationTimer';
import { useSubscription } from './hooks/useSubscription';
import { LockIcon, SettingsIcon } from './components/icons';

const shellStyle = {
  paddingTop: 'calc(0.75rem + var(--safe-top))',
  paddingBottom: 'calc(0.75rem + var(--safe-bottom))',
  paddingLeft: 'calc(1rem + var(--safe-left))',
  paddingRight: 'calc(1rem + var(--safe-right))',
} as const;

const App: React.FC = () => {
  const {
    isPremium,
    loading: subscriptionLoading,
    trialDaysLeft,
    devMode,
    purchase,
    restore,
    refresh,
  } = useSubscription();

  const [onboardingComplete, setOnboardingComplete] = usePersistentState('repit-onboardingComplete', false);
  const [everPremium, setEverPremium] = usePersistentState('repit-everPremium', false);
  const [trialReminderDismissed, setTrialReminderDismissed] = usePersistentState(
    'repit-trialReminderDismissed',
    false,
  );

  const [screen, setScreen] = useState<AppScreen>('timer');
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle);
  const [currentRep, setCurrentRep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [sessionDurationSec, setSessionDurationSec] = useState<number | null>(null);
  const [appUnlocked, setAppUnlocked] = useState(true);
  const [unlockReveal, setUnlockReveal] = useState(false);
  const [focusLocked, setFocusLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const currentRepRef = useRef(currentRep);
  const sessionStartRef = useRef<number | null>(null);

  const [targetReps, setTargetReps] = usePersistentState('repit-targetReps', 108);
  const [delay, setDelay] = usePersistentState('repit-delay', 1.5);
  const [selectedSound, setSelectedSound] = usePersistentState<SoundOption>('repit-sound', SoundOption.Mala);
  const [hapticsEnabled, setHapticsEnabled] = usePersistentState('repit-haptics', true);
  const [sessionStats, setSessionStats] = usePersistentState('repit-sessionStats', DEFAULT_SESSION_STATS);
  const [sessionHistory, setSessionHistory] = usePersistentState<SessionRecord[]>('repit-sessionHistory', []);
  const [customPresets, setCustomPresets] = usePersistentState<CustomPreset[]>('repit-customPresets', []);
  const [lockOnLeave, setLockOnLeave] = usePersistentState('repit-lockOnLeave', true);
  const [autoFocusLock, setAutoFocusLock] = usePersistentState('repit-autoFocusLock', true);
  const [displayName, setDisplayName] = usePersistentState('repit-displayName', '');
  const [practiceIntention, setPracticeIntentionRaw] = usePersistentState('repit-practiceIntention', '');

  const setPracticeIntention = useCallback((value: string) => {
    setPracticeIntentionRaw(normalizePracticeIntention(value));
  }, [setPracticeIntentionRaw]);

  currentRepRef.current = currentRep;
  const isTimerActive = timerState === TimerState.Running || timerState === TimerState.Paused;
  const sessionSummary = `${targetReps.toLocaleString()} reps · ${delay.toFixed(1)}s · ${selectedSound}`;

  const currentStreak = useMemo(() => computeCurrentStreak(sessionHistory), [sessionHistory]);
  const longestStreak = useMemo(() => computeLongestStreak(sessionHistory), [sessionHistory]);
  const repsThisWeek = useMemo(() => repsInLastDays(sessionHistory, 7), [sessionHistory]);

  const hasFreeSessionRemaining = sessionStats.totalSessions === 0;
  const requiresSubscription = !isPremium && !hasFreeSessionRemaining;
  const paywallAfterFirstSession = requiresSubscription && sessionStats.totalSessions === 1 && !everPremium;

  const showTrialReminder =
    isPremium &&
    trialDaysLeft !== null &&
    trialDaysLeft <= 2 &&
    trialDaysLeft > 0 &&
    !trialReminderDismissed;

  useEffect(() => {
    const normalized = normalizeSoundOption(selectedSound);
    if (normalized !== selectedSound) setSelectedSound(normalized);
  }, [selectedSound, setSelectedSound]);

  useEffect(() => {
    if (isPremium) setEverPremium(true);
  }, [isPremium, setEverPremium]);

  useEffect(() => {
    void syncWidgetData({
      currentStreak,
      repsThisWeek,
      totalSessions: sessionStats.totalSessions,
    });
  }, [currentStreak, repsThisWeek, sessionStats.totalSessions]);

  useEffect(() => {
    nativeService.initialize();
    isBiometricAvailable().then(setBiometricAvailable);

    const unlockOnGesture = () => {
      void audioService.unlock();
    };
    document.addEventListener('pointerdown', unlockOnGesture, { once: true });
    document.addEventListener('touchstart', unlockOnGesture, { once: true });
    return () => {
      document.removeEventListener('pointerdown', unlockOnGesture);
      document.removeEventListener('touchstart', unlockOnGesture);
    };
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
    if (selectedSound !== SoundOption.None) await audioService.playSound(selectedSound);
    if (kind === 'success') await hapticsService.success();
    else if (kind === 'tick') await hapticsService.light();
    else await hapticsService.medium();
  }, [selectedSound]);

  const handleSoundSelection = useCallback(async (sound: SoundOption) => {
    setSelectedSound(sound);
    if (sound !== SoundOption.None) await audioService.playSound(sound);
    await hapticsService.light();
  }, [setSelectedSound]);

  const completeSession = useCallback(() => {
    setTimerState((prev) => (prev === TimerState.Finished ? prev : TimerState.Finished));
    setCurrentRep(targetReps);
    setShowComplete(true);
    setFocusLocked(false);
    const completedAt = new Date().toISOString();
    let durationSec: number | null = null;
    if (sessionStartRef.current) {
      durationSec = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
      setSessionDurationSec(durationSec);
      sessionStartRef.current = null;
    }
    setSessionStats((prev) => ({
      totalSessions: prev.totalSessions + 1,
      totalReps: prev.totalReps + targetReps,
      lastSessionAt: completedAt,
    }));
    setSessionHistory((prev) =>
      appendSessionRecord(
        prev,
        {
          id: crypto.randomUUID(),
          completedAt,
          reps: targetReps,
          delay,
          sound: selectedSound,
          durationSec,
        },
        MAX_SESSION_HISTORY,
      ),
    );
    playFeedback('success');
  }, [playFeedback, setSessionStats, setSessionHistory, targetReps, delay, selectedSound]);

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
    }

    if (currentRep > 0) {
      void hapticsService.medium();
    }

    setTimerState(TimerState.Running);
    if (currentRep === 0 && autoFocusLock) setFocusLocked(true);

    if (currentRep === 0) {
      await audioService.unlock();
      void playFeedback('tap');
    }
  }, [timerState, currentRep, playFeedback, focusLocked, autoFocusLock]);

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

  const handleSameAgain = useCallback(async () => {
    if (requiresSubscription) {
      setShowComplete(false);
      return;
    }
    setShowComplete(false);
    setCurrentRep(0);
    setSessionDurationSec(null);
    setFocusLocked(false);
    sessionStartRef.current = Date.now();
    audioService.initialize();
    setTimerState(TimerState.Running);
    if (autoFocusLock) setFocusLocked(true);
    await playFeedback('tap');
  }, [autoFocusLock, playFeedback, requiresSubscription]);

  const handleLogout = useCallback(async () => {
    setAppUnlocked(false);
    await hapticsService.medium();
  }, []);

  const handleUnlock = useCallback(() => {
    setScreen('timer');
    setAppUnlocked(true);
    setUnlockReveal(true);
    window.setTimeout(() => setUnlockReveal(false), 500);
  }, []);

  const openSettings = useCallback(async () => {
    setScreen('settings');
    await hapticsService.light();
  }, []);

  const handleRestorePurchases = useCallback(async () => {
    const result = await restore();
    return result;
  }, [restore]);

  const handleSavePreset = useCallback(
    (name: string) => {
      if (customPresets.length >= MAX_CUSTOM_PRESETS) return;
      setCustomPresets((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name,
          reps: targetReps,
          delay,
          sound: selectedSound,
        },
      ]);
      void hapticsService.light();
    },
    [customPresets.length, targetReps, delay, selectedSound, setCustomPresets],
  );

  const handleApplyPreset = useCallback(
    (preset: CustomPreset) => {
      setTargetReps(preset.reps);
      setDelay(preset.delay);
      setSelectedSound(preset.sound);
      void hapticsService.light();
    },
    [setTargetReps, setDelay, setSelectedSound],
  );

  const handleDeletePreset = useCallback(
    (id: string) => {
      setCustomPresets((prev) => prev.filter((p) => p.id !== id));
      void hapticsService.light();
    },
    [setCustomPresets],
  );

  if (subscriptionLoading) {
    return <BootstrapLoading />;
  }

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={() => setOnboardingComplete(true)} setDisplayName={setDisplayName} />;
  }

  if (requiresSubscription && !showComplete) {
    return (
      <PaywallScreen
        expired={everPremium}
        afterFirstSession={paywallAfterFirstSession}
        devMode={devMode}
        onSubscribed={() => void refresh()}
        onPurchase={purchase}
        onRestore={restore}
      />
    );
  }

  if (!appUnlocked) {
    return (
      <UnlockWelcomeScreen
        biometricAvailable={biometricAvailable}
        displayName={displayName}
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <main
      className={`relative flex min-h-screen flex-col overflow-hidden bg-[var(--brand-bg)] text-white${
        unlockReveal ? ' app-unlock-reveal' : ''
      }`}
      style={shellStyle}
    >
      <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col">
        {showTrialReminder && screen === 'timer' && !focusLocked && (
          <TrialReminderBanner
            daysLeft={trialDaysLeft!}
            onViewPlans={openSettings}
            onDismiss={() => setTrialReminderDismissed(true)}
          />
        )}

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
            onBack={() => setScreen('timer')}
            onRestorePurchases={handleRestorePurchases}
            isTimerActive={isTimerActive}
            totalSessions={sessionStats.totalSessions}
            totalReps={sessionStats.totalReps}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            repsThisWeek={repsThisWeek}
            sessionHistory={sessionHistory}
            customPresets={customPresets}
            practiceIntention={practiceIntention}
            setPracticeIntention={setPracticeIntention}
            onSavePreset={handleSavePreset}
            onApplyPreset={handleApplyPreset}
            onDeletePreset={handleDeletePreset}
          />
          </div>
        ) : (
          <div key="timer" className="page-enter flex min-h-full flex-1 flex-col">
          <>
            {!focusLocked && (
              <header className="flex items-center justify-between px-1 pb-3 pt-1">
                <BrandMark size={32} className="shrink-0 rounded-[9px] shadow-lg shadow-cyan-500/10" aria-label="Repit" />
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
                soundLabel={selectedSound}
                practiceIntention={practiceIntention}
                onClick={handleStartPauseResume}
                isFocusLocked={focusLocked}
                immersive={focusLocked}
              />

              {!focusLocked && isTimerActive && (
                <SessionBar summary={sessionSummary} onRestart={handleRestart} />
              )}

              {!focusLocked && timerState === TimerState.Idle && !showComplete && (
                <ConfigPill
                  summary={sessionSummary}
                  intention={practiceIntention}
                  currentStreak={currentStreak}
                  repsThisWeek={repsThisWeek}
                  onPress={openSettings}
                />
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
          displayName={displayName}
          practiceIntention={practiceIntention}
          currentStreak={currentStreak}
          onDismiss={dismissComplete}
          onSameAgain={handleSameAgain}
          showSameAgain={isPremium}
        />
      )}
    </main>
  );
};

export default App;
