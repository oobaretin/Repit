import React from 'react';
import BrandRing from './BrandRing';

const BootstrapLoading: React.FC = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--brand-bg)]">
    <div className="welcome-brand-ring-wrap relative opacity-80">
      <BrandRing className="welcome-brand-ring h-28 w-28" />
    </div>
    <p className="text-lg font-semibold tracking-tight text-white">Repit</p>
    <p className="label-meta animate-pulse">Loading…</p>
  </div>
);

export default BootstrapLoading;
