import { Vector3 } from './Vector';

/**
 * Matrix4 - 4x4 Homogeneous Transformation Matrix
 * Column-major / standard mathematical robotics transformation representation.
 * 
 * [ m0  m4  m8   m12 ]   [ R00  R01  R02  Tx ]
 * [ m1  m5  m9   m13 ] = [ R10  R11  R12  Ty ]
 * [ m2  m6  m10  m14 ]   [ R20  R21  R22  Tz ]
 * [ m3  m7  m11  m15 ]   [  0    0    0    1 ]
 */
export class Matrix4 {
  elements: Float64Array;

  constructor() {
    this.elements = new Float64Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  static identity(): Matrix4 {
    return new Matrix4();
  }

  clone(): Matrix4 {
    const m = new Matrix4();
    m.elements.set(this.elements);
    return m;
  }

  copy(m: Matrix4): this {
    this.elements.set(m.elements);
    return this;
  }

  static translation(x: number, y: number, z: number): Matrix4 {
    const m = new Matrix4();
    m.elements[12] = x;
    m.elements[13] = y;
    m.elements[14] = z;
    return m;
  }

  static rotationX(rad: number): Matrix4 {
    const m = new Matrix4();
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    m.elements[5] = c;
    m.elements[6] = s;
    m.elements[9] = -s;
    m.elements[10] = c;
    return m;
  }

  static rotationY(rad: number): Matrix4 {
    const m = new Matrix4();
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    m.elements[0] = c;
    m.elements[2] = -s;
    m.elements[8] = s;
    m.elements[10] = c;
    return m;
  }

  static rotationZ(rad: number): Matrix4 {
    const m = new Matrix4();
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    m.elements[0] = c;
    m.elements[1] = s;
    m.elements[4] = -s;
    m.elements[5] = c;
    return m;
  }

  /**
   * Denavit-Hartenberg standard transformation matrix:
   * Rot_z(theta) * Trans_z(d) * Trans_x(a) * Rot_x(alpha)
   */
  static fromDH(theta: number, d: number, a: number, alpha: number): Matrix4 {
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const ca = Math.cos(alpha);
    const sa = Math.sin(alpha);

    const m = new Matrix4();
    const e = m.elements;

    // Row 0
    e[0] = ct;
    e[4] = -st * ca;
    e[8] = st * sa;
    e[12] = a * ct;

    // Row 1
    e[1] = st;
    e[5] = ct * ca;
    e[9] = -ct * sa;
    e[13] = a * st;

    // Row 2
    e[2] = 0;
    e[6] = sa;
    e[10] = ca;
    e[14] = d;

    // Row 3
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;

    return m;
  }

  multiply(b: Matrix4): Matrix4 {
    const result = new Matrix4();
    const ae = this.elements;
    const be = b.elements;
    const te = result.elements;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        te[c * 4 + r] =
          ae[0 * 4 + r] * be[c * 4 + 0] +
          ae[1 * 4 + r] * be[c * 4 + 1] +
          ae[2 * 4 + r] * be[c * 4 + 2] +
          ae[3 * 4 + r] * be[c * 4 + 3];
      }
    }

    return result;
  }

  transformPoint(p: Vector3): Vector3 {
    const e = this.elements;
    const x = p.x;
    const y = p.y;
    const z = p.z;
    const w = e[3] * x + e[7] * y + e[11] * z + e[15];
    const invW = Math.abs(w) > 1e-9 ? 1 / w : 1;

    return new Vector3(
      (e[0] * x + e[4] * y + e[8] * z + e[12]) * invW,
      (e[1] * x + e[5] * y + e[9] * z + e[13]) * invW,
      (e[2] * x + e[6] * y + e[10] * z + e[14]) * invW
    );
  }

  transformVector(v: Vector3): Vector3 {
    const e = this.elements;
    return new Vector3(
      e[0] * v.x + e[4] * v.y + e[8] * v.z,
      e[1] * v.x + e[5] * v.y + e[9] * v.z,
      e[2] * v.x + e[6] * v.y + e[10] * v.z
    );
  }

  getPosition(): Vector3 {
    return new Vector3(this.elements[12], this.elements[13], this.elements[14]);
  }

  /**
   * Extract Euler angles in ZYX convention (Roll, Pitch, Yaw in radians)
   */
  getEulerAngles(): { roll: number; pitch: number; yaw: number } {
    const e = this.elements;
    // R = [ [r00, r01, r02], [r10, r11, r12], [r20, r21, r22] ]
    const r00 = e[0];
    const r10 = e[1];
    const r20 = e[2];
    const r21 = e[6];
    const r22 = e[10];

    const pitch = Math.atan2(-r20, Math.sqrt(r00 * r00 + r10 * r10));
    let roll = 0;
    let yaw = 0;

    if (Math.abs(Math.cos(pitch)) > 1e-6) {
      roll = Math.atan2(r21, r22);
      yaw = Math.atan2(r10, r00);
    } else {
      // Gimbal lock
      roll = Math.atan2(-e[9], e[5]);
      yaw = 0;
    }

    return { roll, pitch, yaw };
  }

  /**
   * Inverse of rigid-body homogeneous transformation matrix
   * [ R^T  -R^T * T ]
   * [  0        1   ]
   */
  inverseRigid(): Matrix4 {
    const e = this.elements;
    const inv = new Matrix4();
    const ie = inv.elements;

    // Transpose rotation 3x3
    ie[0] = e[0];
    ie[1] = e[4];
    ie[2] = e[8];

    ie[4] = e[1];
    ie[5] = e[5];
    ie[6] = e[9];

    ie[8] = e[2];
    ie[9] = e[6];
    ie[10] = e[10];

    // Translation -R^T * T
    const tx = e[12];
    const ty = e[13];
    const tz = e[14];

    ie[12] = -(ie[0] * tx + ie[4] * ty + ie[8] * tz);
    ie[13] = -(ie[1] * tx + ie[5] * ty + ie[9] * tz);
    ie[14] = -(ie[2] * tx + ie[6] * ty + ie[10] * tz);

    return inv;
  }
}
