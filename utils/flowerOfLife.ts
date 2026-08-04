import { breathAtPhase } from './repCycle';

export interface FlowerPoint {
  x: number;
  y: number;
}

export interface FlowerCircle {
  x: number;
  y: number;
  r: number;
}

export interface FlowerOfLifeGeometry {
  circles: FlowerCircle[];
  nodes: FlowerPoint[];
  /** Uniform scale so the pattern outer edge matches targetRadius at breath scale 1 */
  fitScale: number;
}

export interface FlowerBreathVisual {
  scale: number;
  opacity: number;
  glow: number;
  ringOpacity: number;
  nodeScale: number;
  centerGlow: number;
  blur: number;
}

/** Same period as the previous slow idle pulse (~28s). */
const IDLE_BREATH_PERIOD_SEC = 28;

const BREATH_MIN = 0.8;
const BREATH_MAX = 1;

/** Map ring breath scale (0.9–1.1) to flower fill (min–max at ring edge). */
function flowerVisualAtPhase(t: number): FlowerBreathVisual {
  const breath = breathAtPhase(t);
  const open = Math.min(1, Math.max(0, (breath.scale - 0.9) / 0.2));

  return {
    scale: BREATH_MIN + open * (BREATH_MAX - BREATH_MIN),
    opacity: 0.14 + breath.opacity * 0.22,
    glow: breath.glow * 0.38,
    ringOpacity: 0.34 + breath.glow * 0.18,
    nodeScale: 0.94 + breath.glow * 0.06,
    centerGlow: 0.16 + breath.glow * 0.22,
    blur: 0.35 + breath.glow * 0.55,
  };
}

/** Synced to rep phase — same curve as the glowing progress ring. */
export function flowerBreathAtPhase(t: number): FlowerBreathVisual {
  return flowerVisualAtPhase(t);
}

export function flowerIdleBreath(elapsedSec: number): FlowerBreathVisual {
  const t = (elapsedSec % IDLE_BREATH_PERIOD_SEC) / IDLE_BREATH_PERIOD_SEC;
  return flowerVisualAtPhase(t);
}

/** Classic 19-circle Flower of Life centered at origin. */
export function getFlowerOfLifeGeometry(targetRadius: number): FlowerOfLifeGeometry {
  const cellRadius = 1;
  const centers: FlowerPoint[] = [{ x: 0, y: 0 }];

  for (let i = 0; i < 6; i += 1) {
    const angle = (i * Math.PI) / 3;
    centers.push({ x: Math.cos(angle), y: Math.sin(angle) });
  }

  for (let i = 0; i < 6; i += 1) {
    const angle = (i * Math.PI) / 3;
    centers.push({ x: 2 * Math.cos(angle), y: 2 * Math.sin(angle) });
  }

  for (let i = 0; i < 6; i += 1) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const dist = Math.sqrt(3);
    centers.push({ x: dist * Math.cos(angle), y: dist * Math.sin(angle) });
  }

  const circles: FlowerCircle[] = centers.map((c) => ({
    x: c.x * cellRadius,
    y: c.y * cellRadius,
    r: cellRadius,
  }));

  let maxExtent = 0;
  for (const circle of circles) {
    const extent = Math.hypot(circle.x, circle.y) + circle.r;
    maxExtent = Math.max(maxExtent, extent);
  }

  const fitScale = targetRadius / maxExtent;

  const nodes: FlowerPoint[] = [{ x: 0, y: 0 }];
  for (let i = 0; i < 6; i += 1) {
    const angle = (i * Math.PI) / 3;
    nodes.push({
      x: cellRadius * Math.cos(angle),
      y: cellRadius * Math.sin(angle),
    });
  }
  for (let i = 0; i < 6; i += 1) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const dist = cellRadius * (Math.sqrt(3) / 2);
    nodes.push({
      x: dist * Math.cos(angle),
      y: dist * Math.sin(angle),
    });
  }

  return { circles, nodes, fitScale };
}
