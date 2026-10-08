/**
 * Vector3 - 3D Euclidean Vector Mathematics Class
 * Independent, highly optimized vector operations for robotics computations.
 */
export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = Number.isFinite(x) ? x : 0;
    this.y = Number.isFinite(y) ? y : 0;
    this.z = Number.isFinite(z) ? z : 0;
  }

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static fromArray(arr: number[]): Vector3 {
    return new Vector3(arr[0] ?? 0, arr[1] ?? 0, arr[2] ?? 0);
  }

  set(x: number, y: number, z: number): this {
    this.x = Number.isFinite(x) ? x : 0;
    this.y = Number.isFinite(y) ? y : 0;
    this.z = Number.isFinite(z) ? z : 0;
    return this;
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  addScaled(v: Vector3, s: number): Vector3 {
    return new Vector3(this.x + v.x * s, this.y + v.y * s, this.z + v.z * s);
  }

  sub(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  distanceTo(v: Vector3): number {
    return this.sub(v).length();
  }

  normalize(): Vector3 {
    const len = this.length();
    if (len < 1e-9) {
      return new Vector3(0, 0, 0);
    }
    return this.scale(1 / len);
  }

  lerp(target: Vector3, alpha: number): Vector3 {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return new Vector3(
      this.x + (target.x - this.x) * clampedAlpha,
      this.y + (target.y - this.y) * clampedAlpha,
      this.z + (target.z - this.z) * clampedAlpha
    );
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  equals(v: Vector3, tolerance: number = 1e-5): boolean {
    return (
      Math.abs(this.x - v.x) <= tolerance &&
      Math.abs(this.y - v.y) <= tolerance &&
      Math.abs(this.z - v.z) <= tolerance
    );
  }
}
