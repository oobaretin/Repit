export const ENTITLEMENT_PREMIUM = 'premium';

export const PRODUCT_ANNUAL = 'com.repit.app.premium.annual';
export const PRODUCT_MONTHLY = 'com.repit.app.premium.monthly';

export const PRIVACY_POLICY_URL = 'https://oobaretin.github.io/Repit/';

export type SubscriptionPlan = 'annual' | 'monthly';

export interface PlanDisplay {
  id: SubscriptionPlan;
  title: string;
  priceLabel: string;
  detail: string;
  badge?: string;
}

export const PLAN_DISPLAY: Record<SubscriptionPlan, Omit<PlanDisplay, 'id'>> = {
  annual: {
    title: 'Annual',
    priceLabel: '$24.99 / year',
    detail: '7 days free, then $24.99/year · Less than $2.10/month',
    badge: 'Best value',
  },
  monthly: {
    title: 'Monthly',
    priceLabel: '$4.99 / month',
    detail: '7 days free, then $4.99/month',
  },
};

export const ONBOARDING_STEPS = [
  {
    headline: 'Japa & mala, simplified',
    body: 'Repit is a calm timer for japa mantra, mala counting, and breath rounds. Set your reps — 27, 54, 108, or any count — and follow the circle.',
  },
  {
    headline: 'A steady rhythm for your practice',
    body: 'Choose your count and interval. Each rep brings a gentle sound and haptic tap — Mala, Gong, Crystal, or Bowl. Focus lock keeps distractions away.',
  },
  {
    headline: 'Private by design',
    body: 'No account required. Your settings and session stats stay on your device. Optional Face ID when you return.',
    namePrompt: 'What should we call you?',
    nameHint: 'Optional — stored only on your device.',
  },
] as const;

export const SUBSCRIPTION_LEGAL =
  'Payment will be charged to your Apple ID account at the confirmation of purchase or at the end of the free trial. Subscription automatically renews unless canceled at least 24 hours before the end of the current period. Manage or cancel in Settings → Apple ID → Subscriptions.';
