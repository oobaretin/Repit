import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { BRAND_COLORS } from '../utils/brandColors';
import {
  getFlowerOfLifeGeometry,
  type FlowerBreathVisual,
} from '../utils/flowerOfLife';

const VIEW_SIZE = 300;
const CENTER = VIEW_SIZE / 2;
/** Inner edge of progress ring: r=130, stroke 10 → 125 */
const RING_INNER_RADIUS = 125;
const CLIP_RADIUS = RING_INNER_RADIUS;
const PATTERN_RADIUS = RING_INNER_RADIUS;

export interface FlowerOfLifeHandle {
  applyBreath: (breath: FlowerBreathVisual) => void;
}

interface FlowerOfLifeLayerProps {
  filterId: string;
  lite?: boolean;
}

function breathChanged(a: FlowerBreathVisual, b: FlowerBreathVisual, lite: boolean): boolean {
  if (Math.abs(a.scale - b.scale) > 0.002) return true;
  if (Math.abs(a.opacity - b.opacity) > 0.01) return true;
  if (Math.abs(a.ringOpacity - b.ringOpacity) > 0.01) return true;
  if (!lite && Math.abs(a.nodeScale - b.nodeScale) > 0.002) return true;
  if (!lite && Math.abs(a.glow - b.glow) > 0.02) return true;
  if (Math.abs(a.centerGlow - b.centerGlow) > 0.02) return true;
  return false;
}

const FlowerOfLifeLayer = forwardRef<FlowerOfLifeHandle, FlowerOfLifeLayerProps>(
  function FlowerOfLifeLayer({ filterId, lite = false }, ref) {
    const motionRef = useRef<SVGGElement>(null);
    const nodesRef = useRef<SVGGElement>(null);
    const ringsRef = useRef<SVGGElement>(null);
    const centerRef = useRef<SVGCircleElement>(null);
    const lastBreathRef = useRef<FlowerBreathVisual | null>(null);

    const geometry = useMemo(() => getFlowerOfLifeGeometry(PATTERN_RADIUS), []);

    useImperativeHandle(ref, () => ({
      applyBreath(breath) {
        const last = lastBreathRef.current;
        if (last && !breathChanged(last, breath, lite)) return;
        lastBreathRef.current = breath;

        const g = motionRef.current;
        if (!g) return;

        const s = breath.scale * geometry.fitScale;
        g.style.transform = `scale(${s})`;
        g.style.opacity = String(breath.opacity);

        if (ringsRef.current) {
          ringsRef.current.setAttribute('stroke-opacity', String(breath.ringOpacity));
        }

        if (!lite && nodesRef.current) {
          nodesRef.current.style.transform = `scale(${breath.nodeScale})`;
          nodesRef.current.style.opacity = String(0.22 + breath.glow * 0.35);
        }

        if (centerRef.current) {
          centerRef.current.setAttribute('opacity', String(breath.centerGlow));
        }
      },
    }));

    const clipId = `flower-clip-${filterId}`;
    const glowFilterId = `flower-glow-${filterId}`;

    return (
      <svg
        className="flower-layer"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={CENTER} cy={CENTER} r={CLIP_RADIUS} />
          </clipPath>
          <radialGradient id={`flower-center-${filterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BRAND_COLORS.cyanLight} stopOpacity="0.45" />
            <stop offset="45%" stopColor={BRAND_COLORS.cyan} stopOpacity="0.18" />
            <stop offset="100%" stopColor={BRAND_COLORS.cyanDeep} stopOpacity="0" />
          </radialGradient>
          {!lite && (
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="bloom" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="bloom" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <g transform={`translate(${CENTER}, ${CENTER})`}>
            <g
              ref={motionRef}
              className={`flower-motion${lite ? ' flower-motion-lite' : ''}`}
              filter={lite ? undefined : `url(#${glowFilterId})`}
            >
              <circle
                ref={centerRef}
                cx={0}
                cy={0}
                r={0.85}
                fill={`url(#flower-center-${filterId})`}
                opacity={0.4}
              />
              <g ref={ringsRef}>
                {geometry.circles.map((circle, index) => (
                  <circle
                    key={`flower-c-${index}`}
                    cx={circle.x}
                    cy={circle.y}
                    r={circle.r}
                    fill="none"
                    stroke={index === 0 ? BRAND_COLORS.cyanLight : BRAND_COLORS.cyan}
                    strokeWidth={index === 0 ? 0.06 : 0.045}
                    strokeOpacity={0.42}
                  />
                ))}
              </g>
              {!lite && (
                <g ref={nodesRef} className="flower-nodes">
                  {geometry.nodes.map((node, index) => (
                    <circle
                      key={`flower-n-${index}`}
                      cx={node.x}
                      cy={node.y}
                      r={index === 0 ? 0.1 : 0.065}
                      fill={BRAND_COLORS.cyanLight}
                    />
                  ))}
                </g>
              )}
            </g>
          </g>
        </g>
      </svg>
    );
  },
);

export default FlowerOfLifeLayer;
