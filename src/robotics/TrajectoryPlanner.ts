import type { Vector3 } from '../math/Vector';
import type { TrajectoryInterpolationType, TrajectoryPlan, TrajectoryPoint } from './types';
import { smootherstep, smoothstep } from '../utils/mathUtils';
import { Robot } from './Robot';

export class TrajectoryPlanner {
  /**
   * Generates a smooth trajectory plan between two poses or positions
   */
  static planTrajectory(
    robot: Robot,
    startAngles: number[],
    targetAngles: number[],
    duration: number = 3.0,
    interpolationType: TrajectoryInterpolationType = 'joint_quintic',
    sampleCount: number = 60
  ): TrajectoryPlan {
    const safeDuration = Math.max(0.5, duration);
    const safeCount = Math.max(10, sampleCount);
    const points: TrajectoryPoint[] = [];

    const startPose = robot.computeFK(startAngles);
    const targetPose = robot.computeFK(targetAngles);

    const startPos = startPose.endEffectorPosition;
    const targetPos = targetPose.endEffectorPosition;

    for (let i = 0; i <= safeCount; i++) {
      const alpha = i / safeCount;
      const time = alpha * safeDuration;

      let currentAngles: number[] = [...startAngles];
      let currentPos: Vector3 = startPos;

      if (interpolationType === 'cartesian_linear') {
        // Cartesian Straight-Line Interpolation
        const tClamped = smoothstep(alpha);
        currentPos = startPos.lerp(targetPos, tClamped);
        
        // Solve IK for current Cartesian point
        const ikSol = robot.computeIK(currentPos, { currentAngles });
        if (ikSol.success) {
          currentAngles = ikSol.jointAngles;
        } else {
          // Fallback to joint interpolation if IK fails along line
          currentAngles = TrajectoryPlanner.interpolateAngles(startAngles, targetAngles, tClamped);
        }
      } else {
        // Joint Space Interpolations
        let easeT = alpha;
        if (interpolationType === 'joint_quintic') {
          easeT = smootherstep(alpha); // C^2 continuous: zero velocity & acceleration at ends
        } else if (interpolationType === 'joint_cubic') {
          easeT = smoothstep(alpha);   // C^1 continuous: zero velocity at ends
        } else if (interpolationType === 'trapezoidal') {
          easeT = TrajectoryPlanner.trapezoidalEase(alpha);
        }

        currentAngles = TrajectoryPlanner.interpolateAngles(startAngles, targetAngles, easeT);
        const pose = robot.computeFK(currentAngles);
        currentPos = pose.endEffectorPosition;
      }

      points.push({
        time,
        position: currentPos,
        jointAngles: currentAngles,
      });
    }

    return {
      duration: safeDuration,
      points,
      interpolationType,
      startPosition: startPos,
      targetPosition: targetPos,
      startAngles: [...startAngles],
      targetAngles: [...targetAngles],
    };
  }

  /**
   * Linearly interpolates an array of joint angles
   */
  private static interpolateAngles(start: number[], end: number[], t: number): number[] {
    const result: number[] = [];
    for (let j = 0; j < start.length; j++) {
      const s = start[j] ?? 0;
      const e = end[j] ?? 0;
      result.push(s + (e - s) * t);
    }
    return result;
  }

  /**
   * Trapezoidal velocity profile (1/3 acceleration, 1/3 constant velocity, 1/3 deceleration)
   */
  private static trapezoidalEase(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    const ta = 1 / 3;
    if (clamped < ta) {
      return 0.5 * (clamped / ta) * (clamped / ta) * (1.5 * ta);
    } else if (clamped <= 1 - ta) {
      return 0.5 * (1.5 * ta) + (clamped - ta) * (1.5 / (1 - ta * 0.5));
    } else {
      const td = 1 - clamped;
      return 1 - 0.5 * (td / ta) * (td / ta) * (1.5 * ta);
    }
  }

  /**
   * Samples a trajectory at a specific timestamp
   */
  static sampleAtTime(plan: TrajectoryPlan, t: number): TrajectoryPoint {
    const clampedT = Math.max(0, Math.min(plan.duration, t));
    const normalized = clampedT / plan.duration;

    const points = plan.points;
    if (points.length === 0) {
      return {
        time: t,
        position: plan.startPosition,
        jointAngles: plan.startAngles,
      };
    }

    const indexF = normalized * (points.length - 1);
    const i0 = Math.floor(indexF);
    const i1 = Math.min(points.length - 1, i0 + 1);
    const alpha = indexF - i0;

    const p0 = points[i0];
    const p1 = points[i1];

    if (!p1 || i0 === i1) return p0;

    const interpPos = p0.position.lerp(p1.position, alpha);
    const interpAngles = TrajectoryPlanner.interpolateAngles(p0.jointAngles, p1.jointAngles, alpha);

    return {
      time: clampedT,
      position: interpPos,
      jointAngles: interpAngles,
    };
  }
}
