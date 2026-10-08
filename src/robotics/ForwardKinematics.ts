import { Vector3 } from '../math/Vector';
import { Matrix4 } from '../math/Matrix';
import type { DHParameter, RobotPose } from './types';

export class ForwardKinematics {
  /**
   * Computes Forward Kinematics for a 3-DOF RRR robotic arm using geometric & DH methods
   * 
   * @param jointAngles Array of joint angles [theta1, theta2, theta3] in radians
   * @param d1 Base vertical offset (height)
   * @param a2 Link 2 length
   * @param a3 Link 3 length
   */
  static compute3DOF(
    jointAngles: number[],
    d1: number = 0.5,
    a2: number = 1.0,
    a3: number = 0.8
  ): RobotPose {
    const t1 = jointAngles[0] ?? 0;
    const t2 = jointAngles[1] ?? 0;
    const t3 = jointAngles[2] ?? 0;

    // Joint 1 position (Base origin / Shoulder joint)
    const p0 = new Vector3(0, 0, 0);
    const p1 = new Vector3(0, d1, 0);

    // Shoulder -> Elbow (Link 2)
    const r2 = a2 * Math.cos(t2);
    const y2 = d1 + a2 * Math.sin(t2);
    const x2 = r2 * Math.cos(t1);
    const z2 = r2 * Math.sin(t1);
    const p2 = new Vector3(x2, y2, z2);

    // Elbow -> End Effector (Link 3)
    const t23 = t2 + t3;
    const r3 = r2 + a3 * Math.cos(t23);
    const y3 = y2 + a3 * Math.sin(t23);
    const x3 = r3 * Math.cos(t1);
    const z3 = r3 * Math.sin(t1);
    const p3 = new Vector3(x3, y3, z3);

    // Calculate Homogeneous Transformation Matrices for each frame
    // Base Frame T0
    const T0 = Matrix4.identity();

    // Frame 1: Rotate Y(t1) then Translate Y(d1)
    const T1 = Matrix4.translation(0, d1, 0).multiply(Matrix4.rotationY(-t1));

    // Frame 2: Rotate around Z (pitch) at shoulder
    const rotBase = Matrix4.rotationY(-t1);
    const transBase = Matrix4.translation(0, d1, 0);
    const rotShoulder = Matrix4.rotationZ(t2);
    const T2 = transBase.multiply(rotBase).multiply(rotShoulder).multiply(Matrix4.translation(a2, 0, 0));

    // Frame 3 (End Effector):
    const rotElbow = Matrix4.rotationZ(t23);
    const T3 = transBase.multiply(rotBase).multiply(rotElbow).multiply(Matrix4.translation(a2 + a3, 0, 0));

    // End effector orientation (Roll, Pitch, Yaw)
    const roll = 0;
    const pitch = t23;
    const yaw = t1;

    return {
      jointAngles: [t1, t2, t3],
      endEffectorPosition: p3,
      endEffectorOrientation: { roll, pitch, yaw },
      jointPositions: [p0, p1, p2, p3],
      transforms: [T0, T1, T2, T3],
      endEffectorMatrix: T3,
    };
  }

  /**
   * Computes DH-based transformation chain
   */
  static computeDHChain(dhParams: DHParameter[]): { transforms: Matrix4[]; finalTransform: Matrix4 } {
    const transforms: Matrix4[] = [Matrix4.identity()];
    let current = Matrix4.identity();

    for (const p of dhParams) {
      const step = Matrix4.fromDH(p.theta, p.d, p.a, p.alpha);
      current = current.multiply(step);
      transforms.push(current.clone());
    }

    return { transforms, finalTransform: current };
  }
}
