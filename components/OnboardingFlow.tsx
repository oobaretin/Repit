import React, { useState } from 'react';
import BrandRing from './BrandRing';
import { ONBOARDING_STEPS } from '../constants/subscription';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
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
            <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-400/25">
              <span className="text-3xl" aria-hidden="true">
                🔒
              </span>
            </div>
          )}

          <h1 className="max-w-sm text-2xl font-semibold tracking-tight text-white">{current.headline}</h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-400">{current.body}</p>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="welcome-unlock-btn mt-6 w-full max-w-md self-center rounded-2xl py-4 text-base font-semibold"
        >
          {isLast ? 'Start free trial' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
