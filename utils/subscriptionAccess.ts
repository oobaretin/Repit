import { FREE_SESSION_LIMIT } from '../constants/subscription';

export function freeSessionsRemaining(totalSessions: number): number {
  return Math.max(0, FREE_SESSION_LIMIT - totalSessions);
}

export function hasFreeAccess(isPremium: boolean, totalSessions: number): boolean {
  return isPremium || totalSessions < FREE_SESSION_LIMIT;
}

export function requiresPaidSubscription(isPremium: boolean, totalSessions: number): boolean {
  return !hasFreeAccess(isPremium, totalSessions);
}

export function showPostFreeSessionPaywallCopy(
  totalSessions: number,
  everPremium: boolean,
  isPremium: boolean,
): boolean {
  return (
    requiresPaidSubscription(isPremium, totalSessions) &&
    totalSessions === FREE_SESSION_LIMIT &&
    !everPremium
  );
}
