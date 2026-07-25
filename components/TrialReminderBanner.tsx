import React from 'react';

interface TrialReminderBannerProps {
  daysLeft: number;
  onViewPlans: () => void;
  onDismiss: () => void;
}

const TrialReminderBanner: React.FC<TrialReminderBannerProps> = ({
  daysLeft,
  onViewPlans,
  onDismiss,
}) => (
  <div
    className="mx-4 mb-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3"
    role="status"
  >
    <p className="text-sm font-medium text-cyan-100">
      Your trial ends in {daysLeft} day{daysLeft === 1 ? '' : 's'}
    </p>
    <p className="mt-0.5 text-xs text-gray-400">Subscribe to keep your practice going.</p>
    <div className="mt-3 flex gap-3">
      <button
        type="button"
        onClick={onViewPlans}
        className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-gray-950"
      >
        View plans
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs text-gray-400 underline-offset-2 hover:underline"
      >
        Not now
      </button>
    </div>
  </div>
);

export default TrialReminderBanner;
