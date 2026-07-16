
import React from 'react';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

const BrandMark: React.FC<BrandMarkProps> = ({ className = '', size = 32 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="repit-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="45%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <radialGradient id="repit-base" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stopColor="#0e1826" />
        <stop offset="60%" stopColor="#060912" />
        <stop offset="100%" stopColor="#04070f" />
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" rx="229" fill="url(#repit-base)" />
    <g fill="none" stroke="url(#repit-ring)" strokeWidth="112" strokeLinecap="round">
      <path d="M 512 128 A 384 384 0 1 1 460 129.5" />
    </g>
    <circle cx="460" cy="129.5" r="56" fill="#67e8f9" />
  </svg>
);

export default BrandMark;
