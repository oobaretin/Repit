import { Capacitor } from '@capacitor/core';
import { LOG_LEVEL, Purchases } from '@revenuecat/purchases-capacitor';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import {
  ENTITLEMENT_PREMIUM,
  type SubscriptionPlan,
} from '../constants/subscription';

const DEV_PREMIUM_KEY = 'repit-devPremium';
const API_KEY = import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined;

export interface SubscriptionStatus {
  isPremium: boolean;
  trialDaysLeft: number | null;
  loading: boolean;
  devMode: boolean;
}

class SubscriptionService {
  private configured = false;

  private get useDevMode(): boolean {
    return !API_KEY || !Capacitor.isNativePlatform();
  }

  async initialize(): Promise<void> {
    if (this.configured || this.useDevMode) return;
    if (!API_KEY) return;

    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
      await Purchases.configure({ apiKey: API_KEY });
      this.configured = true;
    } catch (error) {
      console.error('RevenueCat configure failed:', error);
    }
  }

  isDevMode(): boolean {
    return this.useDevMode;
  }

  private readDevPremium(): boolean {
    try {
      return localStorage.getItem(DEV_PREMIUM_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private setDevPremium(value: boolean): void {
    localStorage.setItem(DEV_PREMIUM_KEY, value ? 'true' : 'false');
  }

  private parseTrialDays(expirationDate: string | null | undefined): number | null {
    if (!expirationDate) return null;
    const ms = new Date(expirationDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }

  async getStatus(): Promise<Omit<SubscriptionStatus, 'loading'>> {
    if (this.useDevMode) {
      return {
        isPremium: this.readDevPremium(),
        trialDaysLeft: null,
        devMode: true,
      };
    }

    await this.initialize();

    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_PREMIUM];

      if (!entitlement) {
        return { isPremium: false, trialDaysLeft: null, devMode: false };
      }

      const period = String(entitlement.periodType).toUpperCase();
      const trialDaysLeft =
        period === 'TRIAL' || period === 'INTRO'
          ? this.parseTrialDays(entitlement.expirationDate)
          : null;

      return { isPremium: true, trialDaysLeft, devMode: false };
    } catch (error) {
      console.error('Subscription status check failed:', error);
      return { isPremium: false, trialDaysLeft: null, devMode: false };
    }
  }

  private packageForPlan(offerings: Awaited<ReturnType<typeof Purchases.getOfferings>>, plan: SubscriptionPlan): PurchasesPackage | null {
    const current = offerings.current;
    if (!current) return null;
    return plan === 'annual' ? current.annual ?? null : current.monthly ?? null;
  }

  async purchase(plan: SubscriptionPlan): Promise<{ success: boolean; error?: string }> {
    if (this.useDevMode) {
      this.setDevPremium(true);
      return { success: true };
    }

    await this.initialize();

    try {
      const offerings = await Purchases.getOfferings();
      const selected = this.packageForPlan(offerings, plan);
      if (!selected) {
        return { success: false, error: 'Plans unavailable. Try again later.' };
      }

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: selected });
      const isPremium = Boolean(customerInfo.entitlements.active[ENTITLEMENT_PREMIUM]);
      return { success: isPremium };
    } catch (error: unknown) {
      const err = error as { userCancelled?: boolean; message?: string };
      if (err.userCancelled) return { success: false };
      return { success: false, error: err.message ?? 'Purchase failed. Try again.' };
    }
  }

  async restore(): Promise<{ success: boolean; error?: string }> {
    if (this.useDevMode) {
      if (this.readDevPremium()) return { success: true };
      return { success: false, error: 'No purchases to restore in preview mode.' };
    }

    await this.initialize();

    try {
      const { customerInfo } = await Purchases.restorePurchases();
      const isPremium = Boolean(customerInfo.entitlements.active[ENTITLEMENT_PREMIUM]);
      if (!isPremium) {
        return { success: false, error: 'No active subscription found.' };
      }
      return { success: true };
    } catch (error: unknown) {
      const err = error as { message?: string };
      return { success: false, error: err.message ?? 'Restore failed. Try again.' };
    }
  }
}

export const subscriptionService = new SubscriptionService();
