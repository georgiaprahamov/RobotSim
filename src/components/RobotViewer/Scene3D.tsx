import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Robot3D } from './Robot3D';
import { GridFloor3D } from './GridFloor3D';
import { CoordinateAxes3D } from './CoordinateAxes3D';
import { TargetMarker3D } from './TargetMarker3D';
import { TrajectoryVisualizer3D } from './TrajectoryVisualizer3D';
import { WorkspaceVisualizer3D } from './WorkspaceVisualizer3D';
import type { SimulationState } from '../../simulation/SimulationState';
import { Matrix4 } from '../../math/Matrix';

export interface Scene3DHandle {
  setCameraPreset: (preset: 'iso' | 'top' | 'front' | 'side') => void;
  resetCamera: () => void;
}

interface Scene3DProps {
  state: SimulationState;
}

export const Scene3D = forwardRef<Scene3DHandle, Scene3DProps>(({ state }, ref) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useImperativeHandle(ref, () => ({
    setCameraPreset: (preset) => {
      if (!controlsRef.current) return;
      const controls = controlsRef.current;
      const target = new THREE.Vector3(0, 0.7, 0);
      controls.target.copy(target);

      if (preset === 'iso') {
        controls.object.position.set(2.8, 2.5, 2.8);
      } else if (preset === 'top') {
        controls.object.position.set(0, 4.2, 0.001);
      } else if (preset === 'front') {
        controls.object.position.set(0, 1.0, 3.8);
      } else if (preset === 'side') {
        controls.object.position.set(3.8, 1.0, 0);
      }
      controls.update();
    },
    resetCamera: () => {
      if (!controlsRef.current) return;
      controlsRef.current.target.set(0, 0.7, 0);
      controlsRef.current.object.position.set(2.8, 2.4, 2.8);
      controlsRef.current.update();
    },
  }));

  // If ghost preview is enabled and target is reachable, compute ghost pose
  const ghostPose = state.visibility.ghostRobotIK && state.ikSolution?.success
    ? state.robot.computeFK(state.ikSolution.jointAngles)
    : null;

  return (
    <div className="relative w-full h-full bg-[#090d16] select-none">
      <Canvas
        camera={{ position: [2.8, 2.4, 2.8], fov: 45, near: 0.1, far: 100 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#090d16']} />
        
        {/* Orbit Camera Controls with smooth inertia */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 0.7, 0]}
          enableDamping
          dampingFactor={0.08}
          minDistance={0.5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2 + 0.05} // Don't flip below grid floor
        />

        {/* Ambient & Studio Lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        {/* Soft Cyber Rim / Fill Lights */}
        <pointLight position={[-4, 4, -4]} intensity={0.6} color="#00f0ff" />
        <pointLight position={[4, 2, -3]} intensity={0.4} color="#9d4edd" />

        {/* World Base Coordinate Axes */}
        <CoordinateAxes3D
          size={0.4}
          label="World (O)"
          visible={state.visibility.worldAxes}
        />

        {/* Robot Base Coordinate Axes */}
        <CoordinateAxes3D
          matrix={Matrix4.translation(0, 0.001, 0)}
          size={0.35}
          label="Base Frame"
          visible={state.visibility.robotAxes}
        />

        {/* High-Tech Grid Floor */}
        <GridFloor3D visible={state.visibility.grid} />

        {/* Soft Contact Shadows on Floor */}
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.6}
          scale={5}
          blur={1.5}
          far={4}
        />

        {/* Active 3D Robot Arm */}
        <Robot3D
          robot={state.robot}
          pose={state.pose}
          showJointAxes={state.visibility.jointAxes}
          showEndEffectorAxes={state.visibility.endEffectorAxes}
        />

        {/* Ghost Robot Arm (IK Solution Preview) */}
        {ghostPose && !state.isPlayingTrajectory && (
          <Robot3D
            robot={state.robot}
            pose={ghostPose}
            isGhost={true}
          />
        )}

        {/* 3D Target Marker and Reach Line */}
        <TargetMarker3D
          target={state.targetPosition}
          endEffectorPos={state.pose.endEffectorPosition}
          ikSolution={state.ikSolution}
          visible={state.visibility.targetMarker}
        />

        {/* 3D Trajectory Path Visualizer */}
        <TrajectoryVisualizer3D
          plan={state.trajectoryPlan}
          currentTime={state.trajectoryTime}
          isPlaying={state.isPlayingTrajectory}
          visible={state.visibility.trajectoryPath}
        />

        {/* 3D Reachable Workspace Point Cloud */}
        <WorkspaceVisualizer3D
          robot={state.robot}
          visible={state.visibility.workspacePointCloud}
        />
      </Canvas>
    </div>
  );
});
