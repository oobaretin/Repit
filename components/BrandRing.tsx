import React, { useId } from 'react';
import { BRAND_COLORS, BRAND_GRADIENT_STOPS } from '../utils/brandColors';

interface BrandRingProps {
  className?: string;
}

/** Open ring mark — same SVG geometry and gradient as the app logo */
const BrandRing: React.FC<BrandRingProps> = ({ className = '' }) => {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      className={className}
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`brand-ring-grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          {BRAND_GRADIENT_STOPS.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      <path
        d="M 512 128 A 384 384 0 1 1 460 129.5"
        fill="none"
        stroke={`url(#brand-ring-grad-${uid})`}
        strokeWidth="112"
        strokeLinecap="round"
      />
      <circle cx="460" cy="129.5" r="56" fill={BRAND_COLORS.cyanLight} />
    </svg>
  );
};

export default BrandRing;
