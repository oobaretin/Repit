import { useCallback, useEffect, useState } from 'react';
import type { SubscriptionPlan } from '../constants/subscription';
import {
  subscriptionService,
  type SubscriptionStatus,
} from '../services/subscriptionService';

const initialStatus: SubscriptionStatus = {
  isPremium: false,
  trialDaysLeft: null,
  loading: true,
  devMode: false,
};

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);

  const refresh = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    await subscriptionService.initialize();
    const next = await subscriptionService.getStatus();
    setStatus({ ...next, loading: false });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const purchase = useCallback(
    async (plan: SubscriptionPlan) => {
      const result = await subscriptionService.purchase(plan);
      if (result.success) await refresh();
      return result;
    },
    [refresh],
  );

  const restore = useCallback(async () => {
    const result = await subscriptionService.restore();
    if (result.success) await refresh();
    return result;
  }, [refresh]);

  return {
    ...status,
    refresh,
    purchase,
    restore,
  };
}
