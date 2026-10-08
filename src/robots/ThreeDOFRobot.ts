import { Robot } from '../robotics/Robot';
import { Joint } from '../robotics/Joint';
import { Link } from '../robotics/Link';
import type { DHParameter, IKOptions, IKSolution, RobotPose, WorkspaceBounds } from '../robotics/types';
import { Vector3 } from '../math/Vector';
import { ForwardKinematics } from '../robotics/ForwardKinematics';
import { InverseKinematics } from '../robotics/InverseKinematics';

export class ThreeDOFRobot extends Robot {
  readonly d1: number; // Base height (m)
  readonly a2: number; // Link 2 length (m)
  readonly a3: number; // Link 3 length (m)

  constructor(d1: number = 0.5, a2: number = 1.0, a3: number = 0.8) {
    const joints = [
      new Joint({
        id: 'j1',
        name: 'Joint 1 (Base Yaw)',
        type: 'revolute',
        axis: 'y',
        limits: { min: -Math.PI, max: Math.PI },
        defaultAngle: 0,
        color: '#00f0ff',
      }),
      new Joint({
        id: 'j2',
        name: 'Joint 2 (Shoulder Pitch)',
        type: 'revolute',
        axis: 'z',
        limits: { min: -Math.PI / 2, max: Math.PI / 2 },
        defaultAngle: Math.PI / 6,
        color: '#00ffcc',
      }),
      new Joint({
        id: 'j3',
        name: 'Joint 3 (Elbow Pitch)',
        type: 'revolute',
        axis: 'z',
        limits: { min: -3 * Math.PI / 4, max: 3 * Math.PI / 4 },
        defaultAngle: -Math.PI / 4,
        color: '#ffb703',
      }),
    ];

    const links = [
      new Link({
        id: 'link1',
        name: 'Base Column (Link 1)',
        length: d1,
        offset: new Vector3(0, d1 / 2, 0),
        color: '#1e293b',
        radius: 0.08,
      }),
      new Link({
        id: 'link2',
        name: 'Upper Arm (Link 2)',
        length: a2,
        offset: new Vector3(a2 / 2, 0, 0),
        color: '#334155',
        radius: 0.06,
      }),
      new Link({
        id: 'link3',
        name: 'Forearm (Link 3)',
        length: a3,
        offset: new Vector3(a3 / 2, 0, 0),
        color: '#475569',
        radius: 0.045,
      }),
    ];

    super(
      '3dof_educational',
      '3-DOF Educational Arm',
      'Standard 3-axis articulated robot arm for understanding base rotation, planar kinematics, and trigonometric IK.',
      3,
      joints,
      links
    );

    this.d1 = d1;
    this.a2 = a2;
    this.a3 = a3;
  }

  computeFK(jointAngles?: number[]): RobotPose {
    const angles = jointAngles ?? this.getJointAngles();
    return ForwardKinematics.compute3DOF(angles, this.d1, this.a2, this.a3);
  }

  computeIK(target: Vector3, options?: IKOptions): IKSolution {
    return InverseKinematics.solve3DOF(
      target,
      this.d1,
      this.a2,
      this.a3,
      this.getJointLimits(),
      {
        ...options,
        currentAngles: this.getJointAngles(),
      }
    );
  }

  getDHParameters(jointAngles?: number[]): DHParameter[] {
    const angles = jointAngles ?? this.getJointAngles();
    return [
      {
        jointIndex: 1,
        name: 'Joint 1 (Base)',
        theta: angles[0] ?? 0,
        d: this.d1,
        a: 0,
        alpha: Math.PI / 2,
      },
      {
        jointIndex: 2,
        name: 'Joint 2 (Shoulder)',
        theta: angles[1] ?? 0,
        d: 0,
        a: this.a2,
        alpha: 0,
      },
      {
        jointIndex: 3,
        name: 'Joint 3 (Elbow)',
        theta: angles[2] ?? 0,
        d: 0,
        a: this.a3,
        alpha: 0,
      },
    ];
  }

  computeJacobian(jointAngles?: number[]): number[][] {
    const angles = jointAngles ?? this.getJointAngles();
    const t1 = angles[0] ?? 0;
    const t2 = angles[1] ?? 0;
    const t3 = angles[2] ?? 0;

    const s1 = Math.sin(t1);
    const c1 = Math.cos(t1);
    const s2 = Math.sin(t2);
    const c2 = Math.cos(t2);
    const s23 = Math.sin(t2 + t3);
    const c23 = Math.cos(t2 + t3);

    const r = this.a2 * c2 + this.a3 * c23;
    const dr_dt2 = -this.a2 * s2 - this.a3 * s23;
    const dr_dt3 = -this.a3 * s23;

    const dy_dt1 = 0;
    const dy_dt2 = this.a2 * c2 + this.a3 * c23;
    const dy_dt3 = this.a3 * c23;

    return [
      [-r * s1, dr_dt2 * c1, dr_dt3 * c1],
      [dy_dt1, dy_dt2, dy_dt3],
      [r * c1, dr_dt2 * s1, dr_dt3 * s1],
    ];
  }

  getWorkspaceBounds(): WorkspaceBounds {
    const totalReach = this.a2 + this.a3;
    return {
      rMin: Math.abs(this.a2 - this.a3),
      rMax: totalReach,
      zMin: this.d1 - totalReach,
      zMax: this.d1 + totalReach,
      totalReach,
    };
  }
}
