import { Robot } from '../robotics/Robot';
import { Joint } from '../robotics/Joint';
import { Link } from '../robotics/Link';
import type { DHParameter, IKOptions, IKSolution, RobotPose, WorkspaceBounds } from '../robotics/types';
import { Vector3 } from '../math/Vector';
import { Matrix4 } from '../math/Matrix';
import { clamp } from '../utils/mathUtils';

export class SCARARobot extends Robot {
  readonly d1: number; // Base height (m)
  readonly a1: number; // Arm 1 length (m)
  readonly a2: number; // Arm 2 length (m)
  readonly d4Max: number; // Max vertical stroke (m)

  constructor(d1: number = 0.4, a1: number = 0.8, a2: number = 0.6, d4Max: number = 0.3) {
    const joints = [
      new Joint({
        id: 'scara_j1',
        name: 'Joint 1 (Base Yaw)',
        type: 'revolute',
        axis: 'y',
        limits: { min: -2.35, max: 2.35 },
        defaultAngle: 0.3,
        color: '#00f0ff',
      }),
      new Joint({
        id: 'scara_j2',
        name: 'Joint 2 (Elbow Yaw)',
        type: 'revolute',
        axis: 'y',
        limits: { min: -2.6, max: 2.6 },
        defaultAngle: -0.6,
        color: '#00ffcc',
      }),
      new Joint({
        id: 'scara_j3',
        name: 'Joint 3 (Z-Prismatic)',
        type: 'prismatic',
        axis: 'y',
        limits: { min: -d4Max, max: 0 },
        defaultAngle: -0.1,
        color: '#ffb703',
      }),
    ];

    const links = [
      new Link({
        id: 'scara_l1',
        name: 'Base Pedestal',
        length: d1,
        offset: new Vector3(0, d1 / 2, 0),
        radius: 0.1,
      }),
      new Link({
        id: 'scara_l2',
        name: 'Inner Arm',
        length: a1,
        offset: new Vector3(a1 / 2, 0, 0),
        radius: 0.07,
      }),
      new Link({
        id: 'scara_l3',
        name: 'Outer Arm',
        length: a2,
        offset: new Vector3(a2 / 2, 0, 0),
        radius: 0.055,
      }),
    ];

    super(
      'scara_robot',
      'SCARA Assembly Robot (RRPR)',
      'Selective Compliance Assembly Robot Arm widely used in high-speed pick-and-place and semiconductor assembly.',
      3,
      joints,
      links
    );

    this.d1 = d1;
    this.a1 = a1;
    this.a2 = a2;
    this.d4Max = d4Max;
  }

  computeFK(jointAngles?: number[]): RobotPose {
    const angles = jointAngles ?? this.getJointAngles();
    const t1 = angles[0] ?? 0;
    const t2 = angles[1] ?? 0;
    const d3 = angles[2] ?? 0;

    const p0 = new Vector3(0, 0, 0);
    const p1 = new Vector3(0, this.d1, 0);

    const x2 = this.a1 * Math.cos(t1);
    const y2 = this.d1;
    const z2 = this.a1 * Math.sin(t1);
    const p2 = new Vector3(x2, y2, z2);

    const t12 = t1 + t2;
    const x3 = x2 + this.a2 * Math.cos(t12);
    const y3 = this.d1 + d3;
    const z3 = z2 + this.a2 * Math.sin(t12);
    const p3 = new Vector3(x3, y3, z3);

    const T0 = Matrix4.identity();
    const T1 = Matrix4.translation(0, this.d1, 0).multiply(Matrix4.rotationY(-t1));
    const T2 = T1.multiply(Matrix4.translation(this.a1, 0, 0)).multiply(Matrix4.rotationY(-t2));
    const T3 = T2.multiply(Matrix4.translation(this.a2, d3, 0));

    return {
      jointAngles: [t1, t2, d3],
      endEffectorPosition: p3,
      endEffectorOrientation: { roll: 0, pitch: 0, yaw: t12 },
      jointPositions: [p0, p1, p2, p3],
      transforms: [T0, T1, T2, T3],
      endEffectorMatrix: T3,
    };
  }

  computeIK(target: Vector3, options?: IKOptions): IKSolution {
    const currentAngles = options?.currentAngles ?? this.getJointAngles();

    const d3 = target.y - this.d1;
    if (d3 < -this.d4Max || d3 > 0.05) {
      return {
        success: false,
        jointAngles: [...currentAngles],
        distanceToTarget: Math.abs(d3),
        reachedPosition: target.clone(),
        targetPosition: target.clone(),
        error: `Target height (${target.y.toFixed(2)}m) is outside SCARA vertical stroke [${(this.d1 - this.d4Max).toFixed(2)}m, ${this.d1.toFixed(2)}m].`,
      };
    }

    const r2 = target.x * target.x + target.z * target.z;
    const r = Math.sqrt(r2);
    const maxR = this.a1 + this.a2;
    const minR = Math.abs(this.a1 - this.a2);

    if (r > maxR || r < minR) {
      return {
        success: false,
        jointAngles: [...currentAngles],
        distanceToTarget: Math.abs(r - maxR),
        reachedPosition: target.clone(),
        targetPosition: target.clone(),
        error: `Target planar distance (${r.toFixed(2)}m) is outside reachable radius [${minR.toFixed(2)}m, ${maxR.toFixed(2)}m].`,
      };
    }

    const cosT2 = clamp((r2 - this.a1 * this.a1 - this.a2 * this.a2) / (2 * this.a1 * this.a2), -1, 1);
    const t2 = options?.configuration === 'elbow_down' ? -Math.acos(cosT2) : Math.acos(cosT2);

    const phi = Math.atan2(target.z, target.x);
    const psi = Math.atan2(this.a2 * Math.sin(t2), this.a1 + this.a2 * Math.cos(t2));
    const t1 = phi - psi;

    const solAngles = [t1, t2, d3];
    const pose = this.computeFK(solAngles);

    return {
      success: true,
      jointAngles: solAngles,
      distanceToTarget: pose.endEffectorPosition.distanceTo(target),
      reachedPosition: pose.endEffectorPosition,
      targetPosition: target.clone(),
      configuration: t2 >= 0 ? 'elbow_up' : 'elbow_down',
    };
  }

  getDHParameters(jointAngles?: number[]): DHParameter[] {
    const angles = jointAngles ?? this.getJointAngles();
    return [
      {
        jointIndex: 1,
        name: 'Base Yaw',
        theta: angles[0] ?? 0,
        d: this.d1,
        a: this.a1,
        alpha: 0,
      },
      {
        jointIndex: 2,
        name: 'Elbow Yaw',
        theta: angles[1] ?? 0,
        d: 0,
        a: this.a2,
        alpha: Math.PI,
      },
      {
        jointIndex: 3,
        name: 'Z Quill',
        theta: 0,
        d: angles[2] ?? 0,
        a: 0,
        alpha: 0,
      },
    ];
  }

  computeJacobian(jointAngles?: number[]): number[][] {
    const angles = jointAngles ?? this.getJointAngles();
    const t1 = angles[0] ?? 0;
    const t2 = angles[1] ?? 0;
    const t12 = t1 + t2;

    const s1 = Math.sin(t1);
    const c1 = Math.cos(t1);
    const s12 = Math.sin(t12);
    const c12 = Math.cos(t12);

    return [
      [-this.a1 * s1 - this.a2 * s12, -this.a2 * s12, 0],
      [0, 0, 1],
      [this.a1 * c1 + this.a2 * c12, this.a2 * c12, 0],
    ];
  }

  getWorkspaceBounds(): WorkspaceBounds {
    const totalReach = this.a1 + this.a2;
    return {
      rMin: Math.abs(this.a1 - this.a2),
      rMax: totalReach,
      zMin: this.d1 - this.d4Max,
      zMax: this.d1,
      totalReach,
    };
  }
}
