import { Vector3 } from '../math/Vector';
import type { IKOptions, IKSolution, JointLimits } from './types';
import { clamp, normalizeAngle } from '../utils/mathUtils';
import { ForwardKinematics } from './ForwardKinematics';

export class InverseKinematics {
  /**
   * Solves Analytical Inverse Kinematics for a 3-DOF Articulated Arm
   * 
   * @param target Target position in 3D base coordinate space
   * @param d1 Base vertical height (m)
   * @param a2 Link 2 length (m)
   * @param a3 Link 3 length (m)
   * @param jointLimits Optional joint limits for joints 1, 2, 3
   * @param options Options including configuration ('elbow_up', 'elbow_down', 'any') and currentAngles
   */
  static solve3DOF(
    target: Vector3,
    d1: number = 0.5,
    a2: number = 1.0,
    a3: number = 0.8,
    jointLimits: JointLimits[] = [
      { min: -Math.PI, max: Math.PI },
      { min: -Math.PI / 2, max: Math.PI / 2 },
      { min: -3 * Math.PI / 4, max: 3 * Math.PI / 4 },
    ],
    options: IKOptions = {}
  ): IKSolution {
    const config = options.configuration ?? 'any';
    const currentAngles = options.currentAngles ?? [0, 0, 0];

    // Check for invalid input (NaN, Infinity)
    if (!Number.isFinite(target.x) || !Number.isFinite(target.y) || !Number.isFinite(target.z)) {
      return {
        success: false,
        jointAngles: [...currentAngles],
        distanceToTarget: Infinity,
        reachedPosition: target.clone(),
        targetPosition: target.clone(),
        error: 'Invalid target coordinates (NaN or non-finite values).',
      };
    }

    // Step 1: Base Angle theta1
    // Joint 1 rotates around Y axis to orient arm towards planar target (x, z)
    const planarDist = Math.sqrt(target.x * target.x + target.z * target.z);
    let t1 = 0;
    if (planarDist > 1e-6) {
      t1 = Math.atan2(target.z, target.x);
    } else {
      // Singularity: target is directly above/below base
      t1 = currentAngles[0] ?? 0;
    }

    // Step 2: Target in sagittal arm plane
    // R is radial distance along the rotated arm axis
    const r = planarDist;
    // Y' is relative height above shoulder joint at height d1
    const dy = target.y - d1;

    // Euclidean distance from shoulder joint to end effector
    const D = Math.sqrt(r * r + dy * dy);
    const maxReach = a2 + a3;
    const minReach = Math.abs(a2 - a3);

    // Reachability verification
    if (D > maxReach + 1e-4) {
      return {
        success: false,
        jointAngles: [...currentAngles],
        distanceToTarget: D - maxReach,
        reachedPosition: target.clone(),
        targetPosition: target.clone(),
        error: `Target is unreachable: Target distance (${D.toFixed(3)}m) exceeds maximum arm reach (${maxReach.toFixed(3)}m).`,
      };
    }

    if (D < minReach - 1e-4) {
      return {
        success: false,
        jointAngles: [...currentAngles],
        distanceToTarget: minReach - D,
        reachedPosition: target.clone(),
        targetPosition: target.clone(),
        error: `Target is unreachable: Target distance (${D.toFixed(3)}m) is within inner deadzone (${minReach.toFixed(3)}m).`,
      };
    }

    // Step 3: Law of Cosines for theta3 (Elbow angle)
    const cosT3 = clamp((D * D - a2 * a2 - a3 * a3) / (2 * a2 * a3), -1, 1);
    
    // Two possible elbow solutions:
    const t3_pos = Math.acos(cosT3);
    const t3_neg = -Math.acos(cosT3);

    // Helper to calculate corresponding theta2 for a given theta3
    const solveT2 = (t3Val: number): number => {
      // Angle to target from shoulder
      const alpha = Math.atan2(dy, r);
      // Angle between Link2 and the shoulder-target segment
      const beta = Math.atan2(a3 * Math.sin(t3Val), a2 + a3 * Math.cos(t3Val));
      return alpha - beta;
    };

    // Construct candidate solutions
    interface Candidate {
      angles: [number, number, number];
      type: 'elbow_up' | 'elbow_down';
      valid: boolean;
      displacement: number;
    }

    const candidates: Candidate[] = [
      {
        angles: [t1, solveT2(t3_pos), t3_pos],
        type: 'elbow_up',
        valid: true,
        displacement: 0,
      },
      {
        angles: [t1, solveT2(t3_neg), t3_neg],
        type: 'elbow_down',
        valid: true,
        displacement: 0,
      },
    ];

    // Check joint limits and calculate distance to current angles
    for (const cand of candidates) {
      for (let i = 0; i < 3; i++) {
        const lim = jointLimits[i];
        const ang = cand.angles[i];
        if (lim && (ang < lim.min - 1e-4 || ang > lim.max + 1e-4)) {
          cand.valid = false;
        }
      }

      // Weight displacement from current angles for smooth motion
      cand.displacement =
        Math.abs(normalizeAngle(cand.angles[0] - currentAngles[0])) +
        Math.abs(cand.angles[1] - (currentAngles[1] ?? 0)) +
        Math.abs(cand.angles[2] - (currentAngles[2] ?? 0));
    }

    // Filter by requested configuration if specified
    let eligible = candidates.filter((c) => {
      if (config === 'elbow_up') return c.type === 'elbow_up' && c.valid;
      if (config === 'elbow_down') return c.type === 'elbow_down' && c.valid;
      return c.valid;
    });

    if (eligible.length === 0 && config !== 'any') {
      const alternative = candidates.find((c) => c.valid);
      if (alternative) {
        eligible = [alternative];
      }
    }

    if (eligible.length === 0) {
      return {
        success: false,
        jointAngles: [...currentAngles],
        distanceToTarget: 0,
        reachedPosition: target.clone(),
        targetPosition: target.clone(),
        error: `Target is reachable geometrically, but exceeds joint limit constraints for all configurations.`,
      };
    }

    // Pick candidate with least joint displacement from current pose
    eligible.sort((a, b) => a.displacement - b.displacement);
    const best = eligible[0];

    // Verify reached position via Forward Kinematics
    const pose = ForwardKinematics.compute3DOF(best.angles, d1, a2, a3);
    const dist = pose.endEffectorPosition.distanceTo(target);

    return {
      success: true,
      jointAngles: best.angles,
      distanceToTarget: dist,
      reachedPosition: pose.endEffectorPosition,
      targetPosition: target.clone(),
      configuration: best.type,
    };
  }

  /**
   * Numerical IK using Damped Least Squares
   */
  static solveNumerical(
    fkFunction: (angles: number[]) => Vector3,
    jacobianFunction: (angles: number[]) => number[][],
    target: Vector3,
    initialAngles: number[],
    limits: JointLimits[],
    maxIterations: number = 50,
    tolerance: number = 1e-3,
    damping: number = 0.05
  ): IKSolution {
    const angles = [...initialAngles];

    for (let iter = 0; iter < maxIterations; iter++) {
      const currentPos = fkFunction(angles);
      const error = target.sub(currentPos);
      const errorDist = error.length();

      if (errorDist < tolerance) {
        return {
          success: true,
          jointAngles: angles,
          distanceToTarget: errorDist,
          reachedPosition: currentPos,
          targetPosition: target.clone(),
          iterations: iter,
        };
      }

      // Compute Jacobian
      const J = jacobianFunction(angles);
      const dTheta = InverseKinematics.dampedLeastSquaresStep(J, error, damping);

      for (let i = 0; i < angles.length; i++) {
        angles[i] += dTheta[i];
        if (limits[i]) {
          angles[i] = clamp(angles[i], limits[i].min, limits[i].max);
        }
      }
    }

    const finalPos = fkFunction(angles);
    const finalDist = finalPos.distanceTo(target);

    return {
      success: finalDist < tolerance * 2,
      jointAngles: angles,
      distanceToTarget: finalDist,
      reachedPosition: finalPos,
      targetPosition: target.clone(),
      iterations: maxIterations,
      error: finalDist >= tolerance * 2 ? 'Numerical IK did not converge within iteration limit.' : undefined,
    };
  }

  private static dampedLeastSquaresStep(J: number[][], error: Vector3, damping: number): number[] {
    const e = [error.x, error.y, error.z];
    const n = J[0].length;

    const JJT: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += J[r][k] * J[c][k];
        }
        JJT[r][c] = sum + (r === c ? damping * damping : 0);
      }
    }

    const invJJT = InverseKinematics.invert3x3(JJT);
    if (!invJJT) {
      const dTheta = new Array(n).fill(0);
      for (let j = 0; j < n; j++) {
        dTheta[j] = 0.1 * (J[0][j] * e[0] + J[1][j] * e[1] + J[2][j] * e[2]);
      }
      return dTheta;
    }

    const v = [
      invJJT[0][0] * e[0] + invJJT[0][1] * e[1] + invJJT[0][2] * e[2],
      invJJT[1][0] * e[0] + invJJT[1][1] * e[1] + invJJT[1][2] * e[2],
      invJJT[2][0] * e[0] + invJJT[2][1] * e[1] + invJJT[2][2] * e[2],
    ];

    const dTheta = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      dTheta[j] = J[0][j] * v[0] + J[1][j] * v[1] + J[2][j] * v[2];
    }

    return dTheta;
  }

  private static invert3x3(m: number[][]): number[][] | null {
    const a = m[0][0], b = m[0][1], c = m[0][2];
    const d = m[1][0], e = m[1][1], f = m[1][2];
    const g = m[2][0], h = m[2][1], i = m[2][2];

    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (Math.abs(det) < 1e-9) return null;

    const invDet = 1 / det;
    return [
      [ (e * i - f * h) * invDet, (c * h - b * i) * invDet, (b * f - c * e) * invDet ],
      [ (f * g - d * i) * invDet, (a * i - c * g) * invDet, (c * d - a * f) * invDet ],
      [ (d * h - e * g) * invDet, (b * g - a * h) * invDet, (a * e - b * d) * invDet ],
    ];
  }
}
