import { Joint } from './Joint';
import { Link } from './Link';
import type { DHParameter, IKOptions, IKSolution, JointLimits, RobotPose, WorkspaceBounds } from './types';
import type { Vector3 } from '../math/Vector';

export abstract class Robot {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dof: number;
  readonly joints: Joint[];
  readonly links: Link[];

  constructor(
    id: string,
    name: string,
    description: string,
    dof: number,
    joints: Joint[],
    links: Link[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.dof = dof;
    this.joints = joints;
    this.links = links;
  }

  /**
   * Get current joint angles in radians
   */
  getJointAngles(): number[] {
    return this.joints.map((j) => j.angle);
  }

  /**
   * Set joint angles in radians with physical limit clamping
   */
  setJointAngles(angles: number[]): void {
    angles.forEach((ang, i) => {
      if (this.joints[i]) {
        this.joints[i].angle = ang;
      }
    });
  }

  /**
   * Returns array of joint limit objects { min, max }
   */
  getJointLimits(): JointLimits[] {
    return this.joints.map((j) => j.limits);
  }

  /**
   * Compute Forward Kinematics for given (or current) joint angles
   */
  abstract computeFK(jointAngles?: number[]): RobotPose;

  /**
   * Compute Inverse Kinematics to reach target 3D Cartesian position
   */
  abstract computeIK(target: Vector3, options?: IKOptions): IKSolution;

  /**
   * Get analytical DH parameters for educational study
   */
  abstract getDHParameters(jointAngles?: number[]): DHParameter[];

  /**
   * Compute the Jacobian matrix J(theta) of dimension 3 x DOF for linear velocities
   */
  abstract computeJacobian(jointAngles?: number[]): number[][];

  /**
   * Compute Yoshikawa's Manipulability Measure w = sqrt(det(J * J^T))
   */
  computeManipulability(jointAngles?: number[]): number {
    const J = this.computeJacobian(jointAngles);
    const m = J.length; // 3
    const n = J[0].length;

    // JJT = J * J^T
    const JJT: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < m; c++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += J[r][k] * J[c][k];
        }
        JJT[r][c] = sum;
      }
    }

    // 3x3 determinant
    const a = JJT[0][0], b = JJT[0][1], c = JJT[0][2];
    const d = JJT[1][0], e = JJT[1][1], f = JJT[1][2];
    const g = JJT[2][0], h = JJT[2][1], i = JJT[2][2];

    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    return Math.sqrt(Math.max(0, det));
  }

  /**
   * Workspace bounding geometry
   */
  abstract getWorkspaceBounds(): WorkspaceBounds;

  /**
   * Samples reachable workspace points for 3D point cloud visualization
   */
  sampleWorkspace(resolution: number = 20): Vector3[] {
    const points: Vector3[] = [];
    const limits = this.getJointLimits();
    if (limits.length < 3) return points;

    const step1 = (limits[0].max - limits[0].min) / (resolution * 1.5);
    const step2 = (limits[1].max - limits[1].min) / resolution;
    const step3 = (limits[2].max - limits[2].min) / resolution;

    for (let t1 = limits[0].min; t1 <= limits[0].max; t1 += step1) {
      for (let t2 = limits[1].min; t2 <= limits[1].max; t2 += step2) {
        for (let t3 = limits[2].min; t3 <= limits[2].max; t3 += step3) {
          const pose = this.computeFK([t1, t2, t3]);
          points.push(pose.endEffectorPosition);
        }
      }
    }

    return points;
  }
}
