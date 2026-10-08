import type { Robot } from '../robotics/Robot';
import type { Vector3 } from '../math/Vector';
import type { IKSolution, RobotPose, TrajectoryInterpolationType, TrajectoryPlan } from '../robotics/types';
import { createRobotById } from '../robots';

export interface ViewportVisibility {
  worldAxes: boolean;
  robotAxes: boolean;
  jointAxes: boolean;
  endEffectorAxes: boolean;
  grid: boolean;
  workspacePointCloud: boolean;
  targetMarker: boolean;
  trajectoryPath: boolean;
  ghostRobotIK: boolean;
  jointAngleArcs: boolean;
}

export interface SimulationMetrics {
  fps: number;
  time: number;
  manipulability: number;
  distanceToTarget: number;
  isReachable: boolean;
}

export interface SimulationState {
  // Robot selection and model
  robotId: string;
  robot: Robot;
  pose: RobotPose;
  
  // Joint control
  jointAngles: number[];
  unit: 'degrees' | 'radians';

  // Target and Inverse Kinematics
  targetPosition: Vector3;
  ikSolution: IKSolution | null;
  ikConfig: 'any' | 'elbow_up' | 'elbow_down';
  autoSolveIK: boolean;
  isSolvingIK: boolean;

  // Trajectory Planning & Animation
  trajectoryPlan: TrajectoryPlan | null;
  trajectoryDuration: number;
  trajectoryInterpolation: TrajectoryInterpolationType;
  isPlayingTrajectory: boolean;
  trajectoryTime: number;
  trajectorySpeed: number;

  // Viewport Settings
  visibility: ViewportVisibility;
  activePanel: 'control' | 'target' | 'trajectory' | 'education' | 'info';

  // Metrics
  metrics: SimulationMetrics;
}

export function createInitialSimulationState(initialRobotId: string = '3dof_educational'): SimulationState {
  const robot = createRobotById(initialRobotId);
  const initialAngles = robot.getJointAngles();
  const initialPose = robot.computeFK(initialAngles);
  const targetPos = initialPose.endEffectorPosition.clone();
  const initialIK = robot.computeIK(targetPos);

  return {
    robotId: initialRobotId,
    robot,
    pose: initialPose,
    jointAngles: initialAngles,
    unit: 'degrees',
    targetPosition: targetPos,
    ikSolution: initialIK,
    ikConfig: 'any',
    autoSolveIK: false,
    isSolvingIK: false,
    trajectoryPlan: null,
    trajectoryDuration: 3.0,
    trajectoryInterpolation: 'joint_quintic',
    isPlayingTrajectory: false,
    trajectoryTime: 0,
    trajectorySpeed: 1.0,
    visibility: {
      worldAxes: true,
      robotAxes: true,
      jointAxes: true,
      endEffectorAxes: true,
      grid: true,
      workspacePointCloud: false,
      targetMarker: true,
      trajectoryPath: true,
      ghostRobotIK: true,
      jointAngleArcs: true,
    },
    activePanel: 'control',
    metrics: {
      fps: 60,
      time: 0,
      manipulability: robot.computeManipulability(initialAngles),
      distanceToTarget: 0,
      isReachable: true,
    },
  };
}
