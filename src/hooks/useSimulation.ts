import { useState, useEffect, useRef, useCallback } from 'react';
import { createInitialSimulationState } from '../simulation/SimulationState';
import type { SimulationState, ViewportVisibility } from '../simulation/SimulationState';
import { SimulationEngine } from '../simulation/SimulationEngine';
import type { Vector3 } from '../math/Vector';
import type { TrajectoryInterpolationType } from '../robotics/types';

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(() => createInitialSimulationState());
  const stateRef = useRef<SimulationState>(state);
  stateRef.current = state;

  const lastFrameTimeRef = useRef<number>(performance.now());
  const fpsCounterRef = useRef<{ frames: number; lastTime: number }>({ frames: 0, lastTime: performance.now() });

  // Main high-frequency animation loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const delta = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;

      // Calculate FPS
      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastTime >= 500) {
        const fps = Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime));
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
        
        setState((prev) => ({
          ...prev,
          metrics: { ...prev.metrics, fps },
        }));
      }

      // Step active trajectory animation if playing
      if (stateRef.current.isPlayingTrajectory && stateRef.current.trajectoryPlan) {
        setState((prev) => SimulationEngine.stepTrajectory(prev, Math.min(delta, 0.05)));
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Action Dispatches
  const setJointAngle = useCallback((jointIndex: number, angle: number) => {
    setState((prev) => SimulationEngine.setJointAngle(prev, jointIndex, angle));
  }, []);

  const setAllJointAngles = useCallback((angles: number[]) => {
    setState((prev) => SimulationEngine.setAllJointAngles(prev, angles));
  }, []);

  const setTargetPosition = useCallback((target: Vector3) => {
    setState((prev) => SimulationEngine.setTargetPosition(prev, target, prev.autoSolveIK));
  }, []);

  const solveAndApplyIK = useCallback(() => {
    setState((prev) => SimulationEngine.solveAndApplyIK(prev));
  }, []);

  const setIKConfig = useCallback((config: 'any' | 'elbow_up' | 'elbow_down') => {
    setState((prev) => {
      const updated = { ...prev, ikConfig: config };
      return SimulationEngine.setTargetPosition(updated, prev.targetPosition, prev.autoSolveIK);
    });
  }, []);

  const toggleAutoSolveIK = useCallback(() => {
    setState((prev) => {
      const nextAuto = !prev.autoSolveIK;
      const updated = { ...prev, autoSolveIK: nextAuto };
      return nextAuto ? SimulationEngine.solveAndApplyIK(updated) : updated;
    });
  }, []);

  const generateTrajectory = useCallback(() => {
    setState((prev) => SimulationEngine.generateTrajectory(prev));
  }, []);

  const playTrajectory = useCallback(() => {
    setState((prev) => {
      if (!prev.trajectoryPlan) {
        const withPlan = SimulationEngine.generateTrajectory(prev);
        return { ...withPlan, isPlayingTrajectory: true };
      }
      const time = prev.trajectoryTime >= prev.trajectoryPlan.duration ? 0 : prev.trajectoryTime;
      return { ...prev, isPlayingTrajectory: true, trajectoryTime: time };
    });
  }, []);

  const pauseTrajectory = useCallback(() => {
    setState((prev) => ({ ...prev, isPlayingTrajectory: false }));
  }, []);

  const resetTrajectory = useCallback(() => {
    setState((prev) => {
      if (!prev.trajectoryPlan) return prev;
      const stepped = SimulationEngine.stepTrajectory({ ...prev, trajectoryTime: 0, isPlayingTrajectory: true }, 0);
      return {
        ...stepped,
        isPlayingTrajectory: false,
        trajectoryTime: 0,
      };
    });
  }, []);

  const scrubTrajectory = useCallback((time: number) => {
    setState((prev) => {
      if (!prev.trajectoryPlan) return prev;
      const stepState = { ...prev, trajectoryTime: time, isPlayingTrajectory: true };
      const updated = SimulationEngine.stepTrajectory(stepState, 0);
      return { ...updated, isPlayingTrajectory: false };
    });
  }, []);

  const setTrajectoryDuration = useCallback((duration: number) => {
    setState((prev) => ({
      ...prev,
      trajectoryDuration: duration,
      trajectoryPlan: prev.trajectoryPlan ? SimulationEngine.generateTrajectory({ ...prev, trajectoryDuration: duration }).trajectoryPlan : null,
    }));
  }, []);

  const setTrajectoryInterpolation = useCallback((type: TrajectoryInterpolationType) => {
    setState((prev) => ({
      ...prev,
      trajectoryInterpolation: type,
      trajectoryPlan: prev.trajectoryPlan ? SimulationEngine.generateTrajectory({ ...prev, trajectoryInterpolation: type }).trajectoryPlan : null,
    }));
  }, []);

  const changeRobot = useCallback((robotId: string) => {
    setState((prev) => SimulationEngine.changeRobot(prev, robotId));
  }, []);

  const setUnit = useCallback((unit: 'degrees' | 'radians') => {
    setState((prev) => ({ ...prev, unit }));
  }, []);

  const toggleVisibility = useCallback((key: keyof ViewportVisibility) => {
    setState((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: !prev.visibility[key],
      },
    }));
  }, []);

  const setActivePanel = useCallback((panel: 'control' | 'target' | 'trajectory' | 'education' | 'info') => {
    setState((prev) => ({ ...prev, activePanel: panel }));
  }, []);

  const randomizeTarget = useCallback(() => {
    setState((prev) => {
      const randTarget = SimulationEngine.generateRandomTarget(prev);
      return SimulationEngine.setTargetPosition(prev, randTarget, prev.autoSolveIK);
    });
  }, []);

  const resetToHome = useCallback(() => {
    setState((prev) => {
      const homeAngles = prev.robot.joints.map((j) => j.clampAngle(0));
      return SimulationEngine.setAllJointAngles(prev, homeAngles);
    });
  }, []);

  return {
    state,
    setJointAngle,
    setAllJointAngles,
    setTargetPosition,
    solveAndApplyIK,
    setIKConfig,
    toggleAutoSolveIK,
    generateTrajectory,
    playTrajectory,
    pauseTrajectory,
    resetTrajectory,
    scrubTrajectory,
    setTrajectoryDuration,
    setTrajectoryInterpolation,
    changeRobot,
    setUnit,
    toggleVisibility,
    setActivePanel,
    randomizeTarget,
    resetToHome,
  };
}
