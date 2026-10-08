import { Robot } from '../robotics/Robot';
import { Joint } from '../robotics/Joint';
import { Link } from '../robotics/Link';
import type { DHParameter, IKOptions, IKSolution, RobotPose, WorkspaceBounds } from '../robotics/types';
import { Vector3 } from '../math/Vector';
import type { Matrix4 } from '../math/Matrix';
import { ForwardKinematics } from '../robotics/ForwardKinematics';
import { InverseKinematics } from '../robotics/InverseKinematics';

export class SixDOFRobot extends Robot {
  readonly d1: number = 0.4;
  readonly a2: number = 0.7;
  readonly a3: number = 0.6;
  readonly d4: number = 0.3;
  readonly d6: number = 0.15;

  constructor() {
    const joints = [
      new Joint({
        id: '6dof_j1',
        name: 'J1 (Base Waist)',
        type: 'revolute',
        axis: 'y',
        limits: { min: -Math.PI, max: Math.PI },
        defaultAngle: 0,
        color: '#00f0ff',
      }),
      new Joint({
        id: '6dof_j2',
        name: 'J2 (Shoulder)',
        type: 'revolute',
        axis: 'z',
        limits: { min: -Math.PI / 2, max: Math.PI / 2 },
        defaultAngle: Math.PI / 4,
        color: '#00ffcc',
      }),
      new Joint({
        id: '6dof_j3',
        name: 'J3 (Elbow)',
        type: 'revolute',
        axis: 'z',
        limits: { min: -Math.PI * 0.8, max: Math.PI * 0.8 },
        defaultAngle: -Math.PI / 3,
        color: '#ffb703',
      }),
      new Joint({
        id: '6dof_j4',
        name: 'J4 (Forearm Roll)',
        type: 'revolute',
        axis: 'x',
        limits: { min: -Math.PI, max: Math.PI },
        defaultAngle: 0,
        color: '#9d4edd',
      }),
      new Joint({
        id: '6dof_j5',
        name: 'J5 (Wrist Pitch)',
        type: 'revolute',
        axis: 'z',
        limits: { min: -Math.PI * 0.6, max: Math.PI * 0.6 },
        defaultAngle: 0.2,
        color: '#ff0055',
      }),
      new Joint({
        id: '6dof_j6',
        name: 'J6 (Wrist Roll)',
        type: 'revolute',
        axis: 'x',
        limits: { min: -Math.PI, max: Math.PI },
        defaultAngle: 0,
        color: '#3b82f6',
      }),
    ];

    const links = [
      new Link({ id: 'l1', name: 'Base', length: 0.4, offset: new Vector3(0, 0.2, 0) }),
      new Link({ id: 'l2', name: 'Upper Arm', length: 0.7, offset: new Vector3(0.35, 0, 0) }),
      new Link({ id: 'l3', name: 'Forearm', length: 0.6, offset: new Vector3(0.3, 0, 0) }),
      new Link({ id: 'l4', name: 'Wrist 1', length: 0.2, offset: new Vector3(0.1, 0, 0) }),
      new Link({ id: 'l5', name: 'Wrist 2', length: 0.15, offset: new Vector3(0.075, 0, 0) }),
      new Link({ id: 'l6', name: 'Tool Flange', length: 0.1, offset: new Vector3(0.05, 0, 0) }),
    ];

    super(
      '6dof_industrial',
      '6-DOF Industrial Manipulator',
      'Full 6-axis articulated industrial robotic arm capable of arbitrary 6D position and orientation control.',
      6,
      joints,
      links
    );
  }

  computeFK(jointAngles?: number[]): RobotPose {
    const angles = jointAngles ?? this.getJointAngles();
    const t1 = angles[0] ?? 0;
    const t2 = angles[1] ?? 0;
    const t3 = angles[2] ?? 0;
    const t4 = angles[3] ?? 0;
    const t5 = angles[4] ?? 0;
    const t6 = angles[5] ?? 0;

    const dh = this.getDHParameters(angles);
    const chain = ForwardKinematics.computeDHChain(dh);

    const jointPositions = chain.transforms.map((t: Matrix4) => t.getPosition());
    const eePos = chain.finalTransform.getPosition();
    const eeEuler = chain.finalTransform.getEulerAngles();

    return {
      jointAngles: [t1, t2, t3, t4, t5, t6],
      endEffectorPosition: eePos,
      endEffectorOrientation: eeEuler,
      jointPositions,
      transforms: chain.transforms,
      endEffectorMatrix: chain.finalTransform,
    };
  }

  computeIK(target: Vector3, options?: IKOptions): IKSolution {
    const limits = this.getJointLimits();
    const current = options?.currentAngles ?? this.getJointAngles();

    return InverseKinematics.solveNumerical(
      (ang) => this.computeFK(ang).endEffectorPosition,
      (ang) => this.computeJacobian(ang),
      target,
      current,
      limits,
      60,
      1e-3,
      0.08
    );
  }

  getDHParameters(jointAngles?: number[]): DHParameter[] {
    const a = jointAngles ?? this.getJointAngles();
    return [
      { jointIndex: 1, name: 'J1', theta: a[0] ?? 0, d: this.d1, a: 0, alpha: Math.PI / 2 },
      { jointIndex: 2, name: 'J2', theta: a[1] ?? 0, d: 0, a: this.a2, alpha: 0 },
      { jointIndex: 3, name: 'J3', theta: a[2] ?? 0, d: 0, a: this.a3, alpha: 0 },
      { jointIndex: 4, name: 'J4', theta: a[3] ?? 0, d: this.d4, a: 0, alpha: -Math.PI / 2 },
      { jointIndex: 5, name: 'J5', theta: a[4] ?? 0, d: 0, a: 0, alpha: Math.PI / 2 },
      { jointIndex: 6, name: 'J6', theta: a[5] ?? 0, d: this.d6, a: 0, alpha: 0 },
    ];
  }

  computeJacobian(jointAngles?: number[]): number[][] {
    const angles = jointAngles ?? this.getJointAngles();
    const n = 6;
    const J: number[][] = [
      new Array(n).fill(0),
      new Array(n).fill(0),
      new Array(n).fill(0),
    ];

    const delta = 1e-4;
    const basePose = this.computeFK(angles).endEffectorPosition;

    for (let i = 0; i < n; i++) {
      const perturbed = [...angles];
      perturbed[i] += delta;
      const pertPos = this.computeFK(perturbed).endEffectorPosition;

      J[0][i] = (pertPos.x - basePose.x) / delta;
      J[1][i] = (pertPos.y - basePose.y) / delta;
      J[2][i] = (pertPos.z - basePose.z) / delta;
    }

    return J;
  }

  getWorkspaceBounds(): WorkspaceBounds {
    const totalReach = this.a2 + this.a3 + this.d4 + this.d6;
    return {
      rMin: 0.2,
      rMax: totalReach,
      zMin: this.d1 - totalReach,
      zMax: this.d1 + totalReach,
      totalReach,
    };
  }
}
