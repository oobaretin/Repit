/** Repit brand palette — logo, glow, and accent UI */
export const BRAND_COLORS = {
  cyanLight: '#67e8f9',
  cyan: '#22d3ee',
  cyanDeep: '#0891b2',
  bg: '#060912',
  textGlow: '#e0fcff',
} as const;

export const BRAND_RGB = {
  cyanLight: '103, 232, 249',
  cyan: '34, 211, 238',
  cyanDeep: '8, 145, 178',
} as const;

export const BRAND_GRADIENT_STOPS = [
  { offset: '0%', color: BRAND_COLORS.cyanLight },
  { offset: '45%', color: BRAND_COLORS.cyan },
  { offset: '100%', color: BRAND_COLORS.cyanDeep },
] as const;

export function brandGlow(alpha: number, channel: keyof typeof BRAND_RGB = 'cyan'): string {
  return `rgba(${BRAND_RGB[channel]}, ${alpha})`;
}
