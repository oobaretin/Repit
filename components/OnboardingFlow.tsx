import React, { useState } from 'react';
import BrandRing from './BrandRing';
import OnboardingRhythmDemo from './OnboardingRhythmDemo';
import { ONBOARDING_STEPS } from '../constants/subscription';
import { normalizeDisplayName } from '../utils/displayName';
import { LockIcon } from './icons';
import { audioService } from '../services/audioService';

interface OnboardingFlowProps {
  onComplete: () => void;
  setDisplayName: (name: string) => void;
}

const OnboardingRhythmPreviewStatic: React.FC = () => (
  <div className="onboarding-rhythm-preview relative mb-10 flex aspect-square w-[min(72vw,14rem)] items-center justify-center">
    <div className="absolute inset-0 rounded-full bg-cyan-500/5 ring-1 ring-cyan-400/15" aria-hidden="true" />
    <div className="absolute inset-[12%] rounded-full bg-cyan-500/10 ring-1 ring-cyan-400/25" aria-hidden="true" />
    <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="88" stroke="rgba(55,65,81,0.8)" strokeWidth="6" fill="transparent" />
      <circle
        cx="100"
        cy="100"
        r="88"
        stroke="url(#onboard-ring-static)"
        strokeWidth="7"
        fill="transparent"
        strokeLinecap="round"
        strokeDasharray="553"
        strokeDashoffset="420"
      />
      <defs>
        <linearGradient id="onboard-ring-static" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
    <div className="relative text-center">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">3 remaining</p>
      <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight text-white">2</p>
    </div>
  </div>
);

const OnboardingLockPreview: React.FC = () => (
  <div className="mb-8 flex flex-col items-center gap-4">
    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/25 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
      <LockIcon className="h-10 w-10 text-cyan-300" />
    </div>
    <div className="rounded-full bg-gray-900/80 px-4 py-2 text-xs text-gray-400 ring-1 ring-gray-700/60">
      Hold to unlock · ~1.2s
    </div>
  </div>
);

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, setDisplayName }) => {
  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const finish = (saveName: boolean) => {
    if (saveName) {
      const normalized = normalizeDisplayName(nameInput);
      if (normalized) setDisplayName(normalized);
    }
    onComplete();
  };

  const handleNext = () => {
    if (step === 0) {
      void audioService.unlock();
    }
    if (isLast) {
      finish(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="onboarding-shell fixed inset-0 z-[110] flex flex-col bg-[var(--brand-bg)] text-white"
      style={{
        paddingTop: 'calc(1.5rem + var(--safe-top))',
        paddingBottom: 'calc(1.25rem + var(--safe-bottom))',
        paddingLeft: 'calc(1.25rem + var(--safe-left))',
        paddingRight: 'calc(1.25rem + var(--safe-right))',
      }}
    >
      <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-8 flex justify-center gap-2">
          {ONBOARDING_STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === step ? 'w-8 bg-cyan-400' : index < step ? 'w-4 bg-cyan-400/50' : 'w-4 bg-gray-700'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          {step === 0 && (
            <div className="welcome-brand-ring-wrap relative mb-10">
              <BrandRing className="welcome-brand-ring" />
            </div>
          )}

          {step === 1 &&
            (prefersReducedMotion ? <OnboardingRhythmPreviewStatic /> : <OnboardingRhythmDemo />)}

          {step === 2 && <OnboardingLockPreview />}

          <h1 className="max-w-sm text-2xl font-semibold tracking-tight text-white">{current.headline}</h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-400">{current.body}</p>

          {isLast && 'namePrompt' in current && (
            <div className="mt-8 w-full max-w-sm text-left">
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-200">
                {current.namePrompt}
              </label>
              <p className="mt-1 text-xs text-gray-500">{current.nameHint}</p>
              <input
                id="display-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={32}
                placeholder="Alex"
                className="mt-3 w-full rounded-2xl border border-gray-700/80 bg-gray-900/80 px-4 py-3.5 text-base text-white placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex w-full max-w-md flex-col self-center gap-3">
          <button
            type="button"
            onClick={handleNext}
            className="welcome-unlock-btn w-full rounded-2xl py-4 text-base font-semibold"
          >
            {isLast ? 'Begin practice' : 'Continue'}
          </button>

          {isLast && (
            <button
              type="button"
              onClick={() => finish(false)}
              className="text-center text-sm text-gray-500 underline-offset-2 hover:text-gray-400 hover:underline"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
