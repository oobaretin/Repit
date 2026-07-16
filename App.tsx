
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, SoundOption, DEFAULT_SESSION_STATS } from './types';
import { audioService } from './services/audioService';
import { hapticsService } from './services/hapticsService';
import { nativeService } from './services/nativeService';
import CircleDisplay from './components/CircleDisplay';
import SettingsPanel from './components/SettingsPanel';
import SessionComplete from './components/SessionComplete';
import usePersistentState from './hooks/usePersistentState';
import { useMeditationTimer } from './hooks/useMeditationTimer';

const App: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Idle);
  const [currentRep, setCurrentRep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const currentRepRef = useRef(currentRep);

  const [targetReps, setTargetReps] = usePersistentState('repit-targetReps', 108);
  const [delay, setDelay] = usePersistentState('repit-delay', 2.0);
  const [selectedSound, setSelectedSound] = usePersistentState<SoundOption>('repit-sound', SoundOption.Mala);
  const [hapticsEnabled, setHapticsEnabled] = usePersistentState('repit-haptics', true);
  const [sessionStats, setSessionStats] = usePersistentState('repit-sessionStats', DEFAULT_SESSION_STATS);

  currentRepRef.current = currentRep;

  useEffect(() => {
    nativeService.initialize();
  }, []);

  useEffect(() => {
    hapticsService.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    const isActive = timerState === TimerState.Running;
    nativeService.setKeepAwake(isActive);
    return () => {
      nativeService.setKeepAwake(false);
    };
  }, [timerState]);

  useEffect(() => {
    return nativeService.onAppStateChange((isActive) => {
      if (!isActive && timerState === TimerState.Running) {
        setTimerState(TimerState.Paused);
      }
    });
  }, [timerState]);

  const playFeedback = useCallback(async (kind: 'tick' | 'success' | 'tap') => {
    if (selectedSound !== SoundOption.None) {
      audioService.playSound(selectedSound);
    }

    if (kind === 'success') {
      await hapticsService.success();
    } else if (kind === 'tick') {
      await hapticsService.light();
    } else {
      await hapticsService.medium();
    }
  }, [selectedSound]);

  const handleSoundSelection = useCallback((sound: SoundOption) => {
    audioService.initialize();
    setSelectedSound(sound);
    if (sound !== SoundOption.None) {
      audioService.playSound(sound);
    }
    hapticsService.light();
  }, [setSelectedSound]);

  const completeSession = useCallback(() => {
    setTimerState((prev) => {
      if (prev === TimerState.Finished) return prev;
      return TimerState.Finished;
    });
    setCurrentRep(targetReps);
    setShowComplete(true);
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
      await playFeedback('tap');
    } else {
      await hapticsService.medium();
    }

    setTimerState(TimerState.Running);
  }, [timerState, currentRep, playFeedback]);

  const handleRestart = useCallback(async () => {
    setTimerState(TimerState.Idle);
    setCurrentRep(0);
    setShowComplete(false);
    await hapticsService.medium();
  }, []);

  const dismissComplete = useCallback(async () => {
    setShowComplete(false);
    setCurrentRep(0);
    setTimerState(TimerState.Idle);
    await hapticsService.light();
  }, []);

  const isTimerActive = timerState === TimerState.Running || timerState === TimerState.Paused;

  return (
    <main
      className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        paddingTop: 'calc(1rem + var(--safe-top))',
        paddingBottom: 'calc(1rem + var(--safe-bottom))',
        paddingLeft: 'calc(1rem + var(--safe-left))',
        paddingRight: 'calc(1rem + var(--safe-right))',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-900/40 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full max-w-lg">
        <header className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70">Repit</p>
          <h2 className="text-lg text-gray-300 font-light">Mindfulness repetition timer</h2>
        </header>

        <CircleDisplay
          state={timerState}
          currentRep={currentRep}
          targetReps={targetReps}
          onClick={handleStartPauseResume}
        />

        <SettingsPanel
          targetReps={targetReps}
          setTargetReps={setTargetReps}
          delay={delay}
          setDelay={setDelay}
          selectedSound={selectedSound}
          setSelectedSound={handleSoundSelection}
          hapticsEnabled={hapticsEnabled}
          setHapticsEnabled={setHapticsEnabled}
          onRestart={handleRestart}
          isTimerActive={isTimerActive}
          totalSessions={sessionStats.totalSessions}
          totalReps={sessionStats.totalReps}
        />
      </div>

      {showComplete && (
        <SessionComplete
          reps={targetReps}
          totalSessions={sessionStats.totalSessions}
          onDismiss={dismissComplete}
        />
      )}
    </main>
  );
};

export default App;
