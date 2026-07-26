import React, { useState } from 'react';
import BrandRing from './BrandRing';
import { ONBOARDING_STEPS } from '../constants/subscription';
import { normalizeDisplayName } from '../utils/displayName';

interface OnboardingFlowProps {
  onComplete: () => void;
  setDisplayName: (name: string) => void;
}

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
    if (isLast) {
      finish(true);
      return;
    }
    setStep((s) => s + 1);
  };

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

          {step === 1 && (
            <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/5">
              <div className="h-24 w-24 rounded-full border-2 border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.25)]" />
            </div>
          )}

          {step === 2 && (
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/25">
              <span className="text-3xl" aria-hidden="true">
                🔒
              </span>
            </div>
          )}

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
            {isLast ? 'Start free trial' : 'Continue'}
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
