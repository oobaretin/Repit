import React, { useState } from 'react';
import {
  PLAN_DISPLAY,
  PRIVACY_POLICY_URL,
  SUBSCRIPTION_LEGAL,
  type SubscriptionPlan,
} from '../constants/subscription';

interface PaywallScreenProps {
  onSubscribed: () => void;
  onPurchase: (plan: SubscriptionPlan) => Promise<{ success: boolean; error?: string }>;
  onRestore: () => Promise<{ success: boolean; error?: string }>;
  onDismiss?: () => void;
  devMode?: boolean;
  expired?: boolean;
  /** Shown right after the user's first free session */
  afterFirstSession?: boolean;
}

const PAYWALL_FEATURES = [
  'Unlimited sessions, history & streaks',
  'Focus lock, tick sounds & Flower of Life breath',
  'Mantra, haptics & custom presets',
  'Everything on your device — no account',
] as const;

const PAYWALL_COPY = {
  expired: {
    title: 'Your free trial has ended',
    subtitle: 'Subscribe to continue your practice with Repit.',
  },
  afterFirstSession: {
    title: 'You finished your first session',
    subtitle: 'Start a 7-day free trial to keep your streak, history, and daily practice.',
  },
  default: {
    title: 'Start your 7-day free trial',
    subtitle: 'Full access to Repit. Cancel anytime before the trial ends.',
  },
} as const;

const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onSubscribed,
  onPurchase,
  onRestore,
  onDismiss,
  devMode = false,
  expired = false,
  afterFirstSession = false,
}) => {
  const [plan, setPlan] = useState<SubscriptionPlan>('annual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showMonthly, setShowMonthly] = useState(false);

  const handlePurchase = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await onPurchase(plan);
    setBusy(false);
    if (result.success) {
      onSubscribed();
      return;
    }
    if (result.error) setError(result.error);
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await onRestore();
    setBusy(false);
    if (result.success) {
      onSubscribed();
      return;
    }
    if (result.error) setError(result.error);
  };

  const plans: SubscriptionPlan[] = showMonthly ? ['annual', 'monthly'] : ['annual'];

  const copy = expired
    ? PAYWALL_COPY.expired
    : afterFirstSession
      ? PAYWALL_COPY.afterFirstSession
      : PAYWALL_COPY.default;

  return (
    <div
      className="paywall-shell fixed inset-0 z-[110] flex flex-col overflow-y-auto bg-[var(--brand-bg)] text-white"
      style={{
        paddingTop: 'calc(1.25rem + var(--safe-top))',
        paddingBottom: 'calc(1.25rem + var(--safe-bottom))',
        paddingLeft: 'calc(1.25rem + var(--safe-left))',
        paddingRight: 'calc(1.25rem + var(--safe-right))',
      }}
    >
      <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
      <div className="ambient-vignette" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col py-4">
        {onDismiss && (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300"
            >
              Not now
            </button>
          </div>
        )}

        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-sm text-gray-400">{copy.subtitle}</p>
        </header>

        <ul className="mb-6 space-y-2.5 text-sm text-gray-300">
          {PAYWALL_FEATURES.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-0.5 text-cyan-400" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {plans.map((planId) => {
            const display = PLAN_DISPLAY[planId];
            const selected = plan === planId;
            return (
              <button
                key={planId}
                type="button"
                onClick={() => setPlan(planId)}
                className={`paywall-plan w-full rounded-2xl border p-4 text-left transition ${
                  selected
                    ? 'border-cyan-400/60 bg-cyan-500/10 ring-1 ring-cyan-400/30'
                    : 'border-gray-700/60 bg-gray-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{display.title}</p>
                    <p className="mt-1 text-sm text-cyan-300">{display.priceLabel}</p>
                    <p className="mt-1 text-xs text-gray-500">{display.detail}</p>
                  </div>
                  {display.badge && (
                    <span className="shrink-0 rounded-full bg-cyan-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                      {display.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!showMonthly && (
          <button
            type="button"
            onClick={() => setShowMonthly(true)}
            className="mt-3 text-center text-sm text-gray-500 underline-offset-2 hover:text-gray-400 hover:underline"
          >
            Other plans
          </button>
        )}

        {error && <p className="mt-4 text-center text-sm text-rose-400">{error}</p>}

        {devMode && (
          <p className="mt-3 text-center text-xs text-amber-400/90">
            Preview mode — purchases are simulated until RevenueCat is configured.
          </p>
        )}

        <button
          type="button"
          onClick={handlePurchase}
          disabled={busy}
          className="welcome-unlock-btn mt-6 w-full rounded-2xl py-4 text-base font-semibold disabled:opacity-50"
        >
          {busy ? 'Please wait…' : 'Start 7-day free trial'}
        </button>

        <button
          type="button"
          onClick={handleRestore}
          disabled={busy}
          className="mt-4 text-center text-sm text-gray-400 underline-offset-2 hover:text-gray-300 hover:underline disabled:opacity-50"
        >
          Restore purchases
        </button>

        <p className="mt-6 text-[11px] leading-relaxed text-gray-500">{SUBSCRIPTION_LEGAL}</p>

        <p className="mt-3 text-center text-[11px] text-gray-600">
          <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-500/80">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaywallScreen;
