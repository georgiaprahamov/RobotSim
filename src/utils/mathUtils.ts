/**
 * Utility functions for robotics mathematics, angle conversions, and numerical safety
 */

export const RAD2DEG = 180 / Math.PI;
export const DEG2RAD = Math.PI / 180;

export function radToDeg(rad: number): number {
  return rad * RAD2DEG;
}

export function degToRad(deg: number): number {
  return deg * DEG2RAD;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes an angle in radians to [-PI, PI]
 */
export function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * Formats a floating-point number with precision, handling negative zero safely
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value)) return '0.00';
  const fixed = value.toFixed(decimals);
  return fixed === '-0.00' || fixed === '-0.0' ? fixed.replace('-', '') : fixed;
}

/**
 * Smoothstep interpolation function for $C^1$ continuity
 */
export function smoothstep(x: number): number {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Quintic smoothstep for $C^2$ continuity (zero initial/final velocity & acceleration)
 */
export function smootherstep(x: number): number {
  const t = clamp(x, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}
