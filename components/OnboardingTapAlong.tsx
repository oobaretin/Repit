import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { SoundOption } from '../types';
import { audioService } from '../services/audioService';
import { hapticsService } from '../services/hapticsService';
import { breathAtPhase } from '../utils/repCycle';
import { flowerBreathAtPhase } from '../utils/flowerOfLife';
import { brandGlow } from '../utils/brandColors';
import FlowerOfLifeLayer, { type FlowerOfLifeHandle } from './FlowerOfLifeLayer';

const TAP_TARGET = 3;
const REP_MS = 1200;
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface OnboardingTapAlongProps {
  onComplete: () => void;
}

const OnboardingTapAlong: React.FC<OnboardingTapAlongProps> = ({ onComplete }) => {
  const filterId = useId().replace(/:/g, '');
  const ringRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);
  const flowerRef = useRef<FlowerOfLifeHandle>(null);
  const [rep, setRep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const completeRef = useRef(false);

  const applyVisuals = useCallback((currentRep: number, currentPhase: number) => {
    const breath = breathAtPhase(currentPhase);
    const fraction = Math.min(1, (currentRep + currentPhase) / TAP_TARGET);
    const dashOffset = CIRCUMFERENCE - fraction * CIRCUMFERENCE;

    if (ringRef.current) {
      ringRef.current.setAttribute('stroke-dashoffset', String(dashOffset));
      ringRef.current.style.opacity = String(0.72 + breath.glow * 0.28);
    }

    if (countRef.current) {
      countRef.current.textContent = String(currentRep);
      countRef.current.style.transform = `scale(${1 + breath.glow * 0.06})`;
      countRef.current.style.textShadow = `0 0 ${breath.glow * 24}px ${brandGlow(breath.glow * 0.4)}`;
    }

    flowerRef.current?.applyBreath(flowerBreathAtPhase(currentPhase));
  }, []);

  useEffect(() => {
    void audioService.unlock();
    applyVisuals(0, 0);
  }, [applyVisuals]);

  const handleTap = () => {
    if (animating || rep >= TAP_TARGET) return;

    setAnimating(true);
    const startRep = rep;
    void audioService.playSound(SoundOption.Crystal);
    void hapticsService.light();

    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const t = Math.min(0.999, (now - start) / REP_MS);
      applyVisuals(startRep, t);

      if (t < 0.999) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const next = startRep + 1;
      setRep(next);
      setAnimating(false);
      applyVisuals(next, 0);

      if (next >= TAP_TARGET && !completeRef.current) {
        completeRef.current = true;
        onComplete();
      }
    };

    rafId = requestAnimationFrame(tick);
  };

  const remaining = Math.max(0, TAP_TARGET - rep);
  const label =
    rep >= TAP_TARGET
      ? 'Nice rhythm'
      : rep === 0
        ? 'Tap to begin'
        : `${remaining} more tap${remaining === 1 ? '' : 's'}`;

  return (
    <div className="mb-8 flex flex-col items-center">
      <button
        type="button"
        onClick={handleTap}
        disabled={animating || rep >= TAP_TARGET}
        aria-label="Tap to count a repetition"
        className="onboarding-rhythm-preview relative flex aspect-square w-[min(72vw,14rem)] items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 disabled:cursor-default"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
          <div className="h-full w-full scale-[0.48]">
            <FlowerOfLifeLayer ref={flowerRef} filterId={filterId} lite />
          </div>
        </div>
        <svg
          className="pointer-events-none absolute h-full w-full -rotate-90"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r={RADIUS} stroke="rgba(55,65,81,0.8)" strokeWidth="6" fill="transparent" />
          <circle
            ref={ringRef}
            cx="100"
            cy="100"
            r={RADIUS}
            stroke="url(#onboard-tap-ring)"
            strokeWidth="7"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
          />
          <defs>
            <linearGradient id="onboard-tap-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
        <div className="pointer-events-none relative text-center">
          <p className="label-meta label-meta-wide">{label}</p>
          <p
            ref={countRef}
            className="mt-1 text-5xl font-semibold tabular-nums tracking-tight text-white"
          >
            0
          </p>
        </div>
      </button>
      <p className="mt-3 text-xs text-gray-500">Tap the circle {TAP_TARGET} times — just like practice</p>
    </div>
  );
};

export default OnboardingTapAlong;
