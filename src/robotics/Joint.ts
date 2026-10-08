import type { AxisType, JointConfig, JointLimits, JointType } from './types';
import { clamp, normalizeAngle } from '../utils/mathUtils';

export class Joint {
  readonly id: string;
  readonly name: string;
  readonly type: JointType;
  readonly axis: AxisType;
  readonly limits: JointLimits;
  readonly maxVelocity: number;
  readonly color?: string;
  
  private _angle: number;

  constructor(config: JointConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.axis = config.axis;
    this.limits = config.limits;
    this.maxVelocity = config.maxVelocity ?? Math.PI;
    this.color = config.color;
    this._angle = this.clampAngle(config.defaultAngle);
  }

  get angle(): number {
    return this._angle;
  }

  set angle(val: number) {
    if (!Number.isFinite(val)) return;
    this._angle = this.clampAngle(val);
  }

  /**
   * Clamps the given angle within the joint's physical limits
   */
  clampAngle(angle: number): number {
    if (this.limits.min === -Infinity && this.limits.max === Infinity) {
      return normalizeAngle(angle);
    }
    return clamp(angle, this.limits.min, this.limits.max);
  }

  /**
   * Checks if an angle is within valid limits
   */
  isWithinLimits(angle: number, tolerance: number = 1e-4): boolean {
    return angle >= this.limits.min - tolerance && angle <= this.limits.max + tolerance;
  }

  reset(): void {
    this._angle = 0;
  }
}
