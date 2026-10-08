import { useRef } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Scene3D, type Scene3DHandle } from './components/RobotViewer/Scene3D';
import { AppHeader } from './components/Header/AppHeader';
import { ViewportToolbar } from './components/Toolbar/ViewportToolbar';
import { JointControlsPanel } from './components/JointControls/JointControlsPanel';
import { TargetControlsPanel } from './components/TargetControls/TargetControlsPanel';
import { TrajectoryControlsPanel } from './components/TrajectoryControls/TrajectoryControlsPanel';
import { SimulationInfoPanel } from './components/SimulationPanel/SimulationInfoPanel';
import { EducationalLab } from './components/EducationalPanel/EducationalLab';

export function App() {
  const sceneRef = useRef<Scene3DHandle>(null);

  const {
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
  } = useSimulation();

  return (
    <div className="flex flex-col w-screen h-screen bg-dark-900 text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP NAVIGATION & BRANDING HEADER */}
      <AppHeader
        currentRobotId={state.robotId}
        onSelectRobot={changeRobot}
        unit={state.unit}
        onToggleUnit={setUnit}
        activePanel={state.activePanel}
        onSelectPanel={setActivePanel}
        onResetToHome={resetToHome}
      />

      {/* 2. MAIN SIMULATION WORKSPACE */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* 3D Interactive Viewport (Takes prominent full space) */}
        <main className="flex-1 relative h-full w-full">
          {/* Floating Viewport Toolbars (Camera presets & layer toggles) */}
          <ViewportToolbar
            visibility={state.visibility}
            onToggleVisibility={toggleVisibility}
            onCameraPreset={(preset) => sceneRef.current?.setCameraPreset(preset)}
            onResetCamera={() => sceneRef.current?.resetCamera()}
          />

          {/* 3D WebGL Canvas */}
          <Scene3D ref={sceneRef} state={state} />

          {/* Quick HUD Overlay for TCP Coordinates in bottom left of viewport */}
          <div className="absolute bottom-4 left-4 z-10 glass-panel rounded-lg px-3 py-2 border border-white/10 text-xs font-mono flex items-center space-x-3 pointer-events-none shadow-lg">
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">TCP:</span>
              <span className="text-red-400 font-semibold">X: {state.pose.endEffectorPosition.x.toFixed(2)}</span>
              <span className="text-green-400 font-semibold">Y: {state.pose.endEffectorPosition.y.toFixed(2)}</span>
              <span className="text-blue-400 font-semibold">Z: {state.pose.endEffectorPosition.z.toFixed(2)}</span>
            </div>
            <div className="border-l border-white/10 pl-3 flex items-center space-x-1.5 text-slate-400">
              <span>Status:</span>
              <span className={`font-semibold ${state.metrics.isReachable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {state.metrics.isReachable ? 'OK' : 'Target Unreachable'}
              </span>
            </div>
          </div>
        </main>

        {/* 3. RIGHT DOCKABLE CONTROL & EDUCATIONAL PANEL */}
        <aside className="w-[380px] lg:w-[420px] h-full glass-panel border-l border-white/10 flex flex-col z-20 overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {state.activePanel === 'control' && (
              <JointControlsPanel
                robot={state.robot}
                jointAngles={state.jointAngles}
                unit={state.unit}
                onSetJointAngle={setJointAngle}
                onSetAllJointAngles={setAllJointAngles}
              />
            )}

            {state.activePanel === 'target' && (
              <TargetControlsPanel
                targetPosition={state.targetPosition}
                ikSolution={state.ikSolution}
                ikConfig={state.ikConfig}
                autoSolveIK={state.autoSolveIK}
                unit={state.unit}
                onSetTargetPosition={setTargetPosition}
                onSolveAndApplyIK={solveAndApplyIK}
                onSetIKConfig={setIKConfig}
                onToggleAutoSolveIK={toggleAutoSolveIK}
                onRandomizeTarget={randomizeTarget}
              />
            )}

            {state.activePanel === 'trajectory' && (
              <TrajectoryControlsPanel
                plan={state.trajectoryPlan}
                duration={state.trajectoryDuration}
                interpolation={state.trajectoryInterpolation}
                isPlaying={state.isPlayingTrajectory}
                currentTime={state.trajectoryTime}
                onGenerateTrajectory={generateTrajectory}
                onPlay={playTrajectory}
                onPause={pauseTrajectory}
                onReset={resetTrajectory}
                onScrub={scrubTrajectory}
                onSetDuration={setTrajectoryDuration}
                onSetInterpolation={setTrajectoryInterpolation}
              />
            )}

            {state.activePanel === 'education' && (
              <EducationalLab
                state={state}
                onSetTarget={setTargetPosition}
                onSolveIK={solveAndApplyIK}
              />
            )}

            {state.activePanel === 'info' && <SimulationInfoPanel state={state} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
