import type { Vector3 } from '../math/Vector';
import type { Matrix4 } from '../math/Matrix';

export type JointType = 'revolute' | 'prismatic';
export type AxisType = 'x' | 'y' | 'z';

export interface JointLimits {
  min: number; // in radians (or meters if prismatic)
  max: number; // in radians
}

export interface JointConfig {
  id: string;
  name: string;
  type: JointType;
  axis: AxisType;
  limits: JointLimits;
  defaultAngle: number; // in radians
  maxVelocity?: number; // rad/s
  color?: string;
}

export interface LinkConfig {
  id: string;
  name: string;
  length: number; // length in meters
  offset: Vector3; // initial position offset from parent joint
  color?: string;
  radius?: number;
  mass?: number;
}

export interface DHParameter {
  jointIndex: number;
  name: string;
  theta: number; // joint angle (rad)
  d: number;     // link offset (m)
  a: number;     // link length (m)
  alpha: number; // link twist (rad)
}

export interface RobotPose {
  jointAngles: number[]; // in radians
  endEffectorPosition: Vector3;
  endEffectorOrientation: { roll: number; pitch: number; yaw: number };
  jointPositions: Vector3[]; // 3D world/base positions of each joint origin
  transforms: Matrix4[];     // Homogeneous transforms from base to each link/joint
  endEffectorMatrix: Matrix4;
}

export interface IKOptions {
  configuration?: 'elbow_up' | 'elbow_down' | 'any';
  tolerance?: number;
  maxIterations?: number;
  damping?: number;
  currentAngles?: number[];
}

export interface IKSolution {
  success: boolean;
  jointAngles: number[]; // solution angles in radians
  distanceToTarget: number; // distance in meters from reached to target
  reachedPosition: Vector3;
  targetPosition: Vector3;
  iterations?: number;
  error?: string;
  configuration?: 'elbow_up' | 'elbow_down';
}

export interface TrajectoryPoint {
  time: number;
  position: Vector3;
  jointAngles: number[];
  velocity?: Vector3;
}

export type TrajectoryInterpolationType = 'joint_quintic' | 'joint_cubic' | 'cartesian_linear' | 'trapezoidal';

export interface TrajectoryPlan {
  duration: number; // in seconds
  points: TrajectoryPoint[];
  interpolationType: TrajectoryInterpolationType;
  startPosition: Vector3;
  targetPosition: Vector3;
  startAngles: number[];
  targetAngles: number[];
}

export interface WorkspaceBounds {
  rMin: number;
  rMax: number;
  zMin: number;
  zMax: number;
  totalReach: number;
}
