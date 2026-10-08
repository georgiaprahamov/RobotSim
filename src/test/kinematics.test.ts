import { describe, it, expect } from 'vitest';
import { ThreeDOFRobot } from '../robots/ThreeDOFRobot';
import { Vector3 } from '../math/Vector';
import { ForwardKinematics } from '../robotics/ForwardKinematics';
import { TrajectoryPlanner } from '../robotics/TrajectoryPlanner';
import { degToRad } from '../utils/mathUtils';

describe('Forward Kinematics (FK)', () => {
  const d1 = 0.5;
  const a2 = 1.0;
  const a3 = 0.8;

  it('calculates home position correctly when all angles are zero', () => {
    const pose = ForwardKinematics.compute3DOF([0, 0, 0], d1, a2, a3);

    expect(pose.endEffectorPosition.x).toBeCloseTo(1.8, 4);
    expect(pose.endEffectorPosition.y).toBeCloseTo(0.5, 4);
    expect(pose.endEffectorPosition.z).toBeCloseTo(0.0, 4);
  });

  it('calculates vertical upright position when shoulder is 90 deg and elbow is 0 deg', () => {
    const pose = ForwardKinematics.compute3DOF([0, Math.PI / 2, 0], d1, a2, a3);

    expect(pose.endEffectorPosition.x).toBeCloseTo(0.0, 4);
    expect(pose.endEffectorPosition.y).toBeCloseTo(2.3, 4);
    expect(pose.endEffectorPosition.z).toBeCloseTo(0.0, 4);
  });

  it('calculates base yaw rotation correctly at 90 deg', () => {
    const pose = ForwardKinematics.compute3DOF([Math.PI / 2, 0, 0], d1, a2, a3);

    expect(pose.endEffectorPosition.x).toBeCloseTo(0.0, 4);
    expect(pose.endEffectorPosition.y).toBeCloseTo(0.5, 4);
    expect(pose.endEffectorPosition.z).toBeCloseTo(1.8, 4);
  });

  it('calculates negative angle configurations accurately', () => {
    const t1 = degToRad(-45);
    const t2 = degToRad(-30);
    const t3 = degToRad(45);
    const pose = ForwardKinematics.compute3DOF([t1, t2, t3], d1, a2, a3);

    expect(Number.isFinite(pose.endEffectorPosition.x)).toBe(true);
    expect(Number.isFinite(pose.endEffectorPosition.y)).toBe(true);
    expect(Number.isFinite(pose.endEffectorPosition.z)).toBe(true);
  });
});

describe('Inverse Kinematics (IK)', () => {
  const robot = new ThreeDOFRobot(0.5, 1.0, 0.8);

  it('solves IK for known reachable forward kinematic positions', () => {
    const testAngles = [degToRad(35), degToRad(25), degToRad(-40)];
    const fkPose = robot.computeFK(testAngles);
    const target = fkPose.endEffectorPosition;

    const ikSol = robot.computeIK(target, { configuration: 'elbow_down' });

    expect(ikSol.success).toBe(true);
    expect(ikSol.distanceToTarget).toBeLessThan(1e-3);

    const reachedPose = robot.computeFK(ikSol.jointAngles);
    expect(reachedPose.endEffectorPosition.distanceTo(target)).toBeLessThan(1e-3);
  });

  it('detects unreachable targets exceeding maximum radial reach', () => {
    const unreachableTarget = new Vector3(3.0, 0.5, 0.0);
    const ikSol = robot.computeIK(unreachableTarget);

    expect(ikSol.success).toBe(false);
    expect(ikSol.error).toContain('exceeds maximum arm reach');
  });

  it('detects unreachable targets inside inner deadzone', () => {
    const deadzoneTarget = new Vector3(0.01, 0.52, 0.01);
    const ikSol = robot.computeIK(deadzoneTarget);

    expect(ikSol.success).toBe(false);
    expect(ikSol.error).toContain('inner deadzone');
  });

  it('handles invalid NaN input values gracefully without crashing', () => {
    const invalidTarget = new Vector3(NaN, 1.0, Infinity);
    const ikSol = robot.computeIK(invalidTarget);

    expect(ikSol.success).toBe(false);
    expect(ikSol.error).toBeDefined();
  });

  it('supports both elbow-up and elbow-down configurations', () => {
    const target = new Vector3(1.0, 0.8, 0.5);

    const solUp = robot.computeIK(target, { configuration: 'elbow_up' });
    const solDown = robot.computeIK(target, { configuration: 'elbow_down' });

    expect(solUp.success).toBe(true);
    expect(solDown.success).toBe(true);
    expect(solUp.jointAngles[2]).toBeGreaterThan(0);
    expect(solDown.jointAngles[2]).toBeLessThan(0);
  });
});

describe('Trajectory Planning', () => {
  const robot = new ThreeDOFRobot();

  it('plans a smooth quintic trajectory with boundary conditions', () => {
    const startAngles = [0, 0, 0];
    const targetAngles = [degToRad(60), degToRad(30), degToRad(-30)];
    const duration = 2.0;

    const plan = TrajectoryPlanner.planTrajectory(robot, startAngles, targetAngles, duration, 'joint_quintic', 50);

    expect(plan.points.length).toBe(51);
    expect(plan.points[0].time).toBe(0);
    expect(plan.points[50].time).toBeCloseTo(duration, 4);

    const pStart = plan.points[0];
    const pEnd = plan.points[50];

    expect(pStart.jointAngles[0]).toBeCloseTo(0, 4);
    expect(pEnd.jointAngles[0]).toBeCloseTo(degToRad(60), 4);
    expect(pEnd.jointAngles[1]).toBeCloseTo(degToRad(30), 4);
  });

  it('samples continuous points correctly along timeline', () => {
    const plan = TrajectoryPlanner.planTrajectory(robot, [0, 0, 0], [1, 0.5, -0.5], 4.0);

    const midSample = TrajectoryPlanner.sampleAtTime(plan, 2.0);
    expect(midSample.time).toBe(2.0);
    expect(Number.isFinite(midSample.position.x)).toBe(true);
    expect(Number.isFinite(midSample.jointAngles[0])).toBe(true);
  });
});
