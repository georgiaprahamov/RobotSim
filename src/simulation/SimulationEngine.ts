import { Vector3 } from '../math/Vector';
import { createRobotById } from '../robots';
import { TrajectoryPlanner } from '../robotics/TrajectoryPlanner';
import type { SimulationState } from './SimulationState';
import { clamp } from '../utils/mathUtils';

export class SimulationEngine {
  /**
   * Switches the active robot model
   */
  static changeRobot(state: SimulationState, robotId: string): SimulationState {
    const robot = createRobotById(robotId);
    const jointAngles = robot.getJointAngles();
    const pose = robot.computeFK(jointAngles);
    const targetPosition = pose.endEffectorPosition.clone();
    const ikSolution = robot.computeIK(targetPosition);

    return {
      ...state,
      robotId,
      robot,
      jointAngles,
      pose,
      targetPosition,
      ikSolution,
      trajectoryPlan: null,
      isPlayingTrajectory: false,
      trajectoryTime: 0,
      metrics: {
        ...state.metrics,
        manipulability: robot.computeManipulability(jointAngles),
        distanceToTarget: 0,
        isReachable: ikSolution.success,
      },
    };
  }

  /**
   * Sets joint angle at specific index
   */
  static setJointAngle(state: SimulationState, jointIndex: number, angle: number): SimulationState {
    const newAngles = [...state.jointAngles];
    newAngles[jointIndex] = angle;
    state.robot.setJointAngles(newAngles);
    const clampedAngles = state.robot.getJointAngles();
    const pose = state.robot.computeFK(clampedAngles);

    const dist = pose.endEffectorPosition.distanceTo(state.targetPosition);

    return {
      ...state,
      jointAngles: clampedAngles,
      pose,
      metrics: {
        ...state.metrics,
        manipulability: state.robot.computeManipulability(clampedAngles),
        distanceToTarget: dist,
      },
    };
  }

  /**
   * Sets all joint angles simultaneously
   */
  static setAllJointAngles(state: SimulationState, angles: number[]): SimulationState {
    state.robot.setJointAngles(angles);
    const clampedAngles = state.robot.getJointAngles();
    const pose = state.robot.computeFK(clampedAngles);
    const dist = pose.endEffectorPosition.distanceTo(state.targetPosition);

    return {
      ...state,
      jointAngles: clampedAngles,
      pose,
      metrics: {
        ...state.metrics,
        manipulability: state.robot.computeManipulability(clampedAngles),
        distanceToTarget: dist,
      },
    };
  }

  /**
   * Updates target 3D Cartesian coordinates and optionally auto-solves IK
   */
  static setTargetPosition(state: SimulationState, target: Vector3, autoSolve: boolean = false): SimulationState {
    const ikSolution = state.robot.computeIK(target, { configuration: state.ikConfig });
    
    let nextAngles = state.jointAngles;
    let nextPose = state.pose;

    if (autoSolve && ikSolution.success) {
      state.robot.setJointAngles(ikSolution.jointAngles);
      nextAngles = state.robot.getJointAngles();
      nextPose = state.robot.computeFK(nextAngles);
    }

    const dist = nextPose.endEffectorPosition.distanceTo(target);

    return {
      ...state,
      targetPosition: target.clone(),
      ikSolution,
      jointAngles: nextAngles,
      pose: nextPose,
      metrics: {
        ...state.metrics,
        manipulability: state.robot.computeManipulability(nextAngles),
        distanceToTarget: dist,
        isReachable: ikSolution.success,
      },
    };
  }

  /**
   * Solves Inverse Kinematics for current target and applies joint angles to robot
   */
  static solveAndApplyIK(state: SimulationState): SimulationState {
    const ikSolution = state.robot.computeIK(state.targetPosition, { configuration: state.ikConfig });

    if (!ikSolution.success) {
      return {
        ...state,
        ikSolution,
        metrics: {
          ...state.metrics,
          isReachable: false,
        },
      };
    }

    state.robot.setJointAngles(ikSolution.jointAngles);
    const jointAngles = state.robot.getJointAngles();
    const pose = state.robot.computeFK(jointAngles);
    const dist = pose.endEffectorPosition.distanceTo(state.targetPosition);

    return {
      ...state,
      ikSolution,
      jointAngles,
      pose,
      metrics: {
        ...state.metrics,
        manipulability: state.robot.computeManipulability(jointAngles),
        distanceToTarget: dist,
        isReachable: true,
      },
    };
  }

  /**
   * Generates a new trajectory plan from current robot position to target position
   */
  static generateTrajectory(state: SimulationState): SimulationState {
    const startAngles = state.jointAngles;
    const ikSol = state.robot.computeIK(state.targetPosition, { configuration: state.ikConfig });
    const targetAngles = ikSol.success ? ikSol.jointAngles : [...startAngles];

    const plan = TrajectoryPlanner.planTrajectory(
      state.robot,
      startAngles,
      targetAngles,
      state.trajectoryDuration,
      state.trajectoryInterpolation,
      80
    );

    return {
      ...state,
      trajectoryPlan: plan,
      trajectoryTime: 0,
      isPlayingTrajectory: false,
    };
  }

  /**
   * Steps the trajectory animation forward by delta time
   */
  static stepTrajectory(state: SimulationState, deltaSeconds: number): SimulationState {
    if (!state.trajectoryPlan || !state.isPlayingTrajectory) {
      return state;
    }

    const nextTime = state.trajectoryTime + deltaSeconds * state.trajectorySpeed;
    const isFinished = nextTime >= state.trajectoryPlan.duration;
    const clampedTime = clamp(nextTime, 0, state.trajectoryPlan.duration);

    const sample = TrajectoryPlanner.sampleAtTime(state.trajectoryPlan, clampedTime);
    state.robot.setJointAngles(sample.jointAngles);
    const jointAngles = state.robot.getJointAngles();
    const pose = state.robot.computeFK(jointAngles);

    return {
      ...state,
      trajectoryTime: isFinished ? state.trajectoryPlan.duration : clampedTime,
      isPlayingTrajectory: !isFinished,
      jointAngles,
      pose,
      metrics: {
        ...state.metrics,
        time: state.metrics.time + deltaSeconds,
        manipulability: state.robot.computeManipulability(jointAngles),
        distanceToTarget: pose.endEffectorPosition.distanceTo(state.targetPosition),
      },
    };
  }

  /**
   * Generates a random valid reachable target position within the workspace
   */
  static generateRandomTarget(state: SimulationState): Vector3 {
    const bounds = state.robot.getWorkspaceBounds();
    const radius = bounds.rMin + Math.random() * (bounds.rMax - bounds.rMin) * 0.85;
    const angle = Math.random() * Math.PI * 2;
    const zSpan = bounds.zMax - bounds.zMin;
    const y = bounds.zMin + Math.random() * zSpan * 0.8;

    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);

    return new Vector3(x, Math.max(0.1, y), z);
  }
}
