import React, { useEffect, useId, useRef } from 'react';
import { SoundOption } from '../types';
import { audioService } from '../services/audioService';
import { hapticsService } from '../services/hapticsService';
import { breathAtPhase } from '../utils/repCycle';
import { flowerBreathAtPhase } from '../utils/flowerOfLife';
import { brandGlow } from '../utils/brandColors';
import FlowerOfLifeLayer, { type FlowerOfLifeHandle } from './FlowerOfLifeLayer';

const DEMO_TARGET = 5;
const DEMO_INTERVAL_MS = 1200;
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const OnboardingRhythmDemo: React.FC = () => {
  const filterId = useId().replace(/:/g, '');
  const ringRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);
  const remainingRef = useRef<HTMLParagraphElement>(null);
  const flowerRef = useRef<FlowerOfLifeHandle>(null);
  const repRef = useRef(0);
  const cycleStartRef = useRef(performance.now());
  const doneRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    let cancelled = false;

    void audioService.unlock();

    const applyFrame = (phase: number, rep: number) => {
      const breath = breathAtPhase(phase);
      const fraction = Math.min(1, (rep + phase) / DEMO_TARGET);
      const dashOffset = CIRCUMFERENCE - fraction * CIRCUMFERENCE;
      const remaining = Math.max(0, DEMO_TARGET - rep);

      if (ringRef.current) {
        ringRef.current.setAttribute('stroke-dashoffset', String(dashOffset));
        ringRef.current.style.opacity = String(0.72 + breath.glow * 0.28);
      }

      if (countRef.current) {
        countRef.current.textContent = String(rep);
        countRef.current.style.transform = `scale(${1 + breath.glow * 0.06})`;
        countRef.current.style.textShadow = `0 0 ${breath.glow * 24}px ${brandGlow(breath.glow * 0.4)}`;
      }

      if (remainingRef.current) {
        remainingRef.current.textContent =
          remaining > 0 ? `${remaining} remaining` : 'Complete';
      }

      flowerRef.current?.applyBreath(flowerBreathAtPhase(phase));
    };

    const tick = (now: number) => {
      if (cancelled) return;

      if (!doneRef.current) {
        const elapsed = now - cycleStartRef.current;
        const phase = Math.min(0.999, elapsed / DEMO_INTERVAL_MS);
        applyFrame(phase, repRef.current);

        if (elapsed >= DEMO_INTERVAL_MS && repRef.current < DEMO_TARGET) {
          repRef.current += 1;
          cycleStartRef.current = now;
          void audioService.playSound(SoundOption.Crystal);
          void hapticsService.light();

          if (repRef.current >= DEMO_TARGET) {
            doneRef.current = true;
            cycleStartRef.current = now;
          }
        }
      } else {
        const idlePhase = ((now - cycleStartRef.current) / 2800) % 1;
        applyFrame(idlePhase, DEMO_TARGET);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="onboarding-rhythm-preview relative mb-10 flex aspect-square w-[min(72vw,14rem)] items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
        <div className="h-full w-full scale-[0.48]">
          <FlowerOfLifeLayer ref={flowerRef} filterId={filterId} lite />
        </div>
      </div>
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={RADIUS} stroke="rgba(55,65,81,0.8)" strokeWidth="6" fill="transparent" />
        <circle
          ref={ringRef}
          cx="100"
          cy="100"
          r={RADIUS}
          stroke="url(#onboard-ring-demo)"
          strokeWidth="7"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
        <defs>
          <linearGradient id="onboard-ring-demo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative text-center">
        <p ref={remainingRef} className="label-meta label-meta-wide">
          {DEMO_TARGET} remaining
        </p>
        <p
          ref={countRef}
          className="mt-1 text-5xl font-semibold tabular-nums tracking-tight text-white"
        >
          0
        </p>
      </div>
    </div>
  );
};

export default OnboardingRhythmDemo;
