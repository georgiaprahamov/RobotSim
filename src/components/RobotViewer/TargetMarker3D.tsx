import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import type { Vector3 } from '../../math/Vector';
import type { IKSolution } from '../../robotics/types';

interface TargetMarker3DProps {
  target: Vector3;
  endEffectorPos: Vector3;
  ikSolution: IKSolution | null;
  visible?: boolean;
}

export const TargetMarker3D: React.FC<TargetMarker3DProps> = ({
  target,
  endEffectorPos,
  ikSolution,
  visible = true,
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const isReachable = ikSolution?.success ?? true;

  const targetColor = isReachable ? '#00f0ff' : '#ff3366';
  const glowColor = isReachable ? '#00ffcc' : '#ff0055';

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      ringRef.current.rotation.y = t * 1.5;
      ringRef.current.rotation.z = Math.sin(t * 2) * 0.2;
      const s = 1 + Math.sin(t * 3) * 0.08;
      ringRef.current.scale.set(s, s, s);
    }
  });

  if (!visible) return null;

  const points: [number, number, number][] = [
    [endEffectorPos.x, endEffectorPos.y, endEffectorPos.z],
    [target.x, target.y, target.z],
  ];

  const groundProjection: [number, number, number][] = [
    [target.x, 0, target.z],
    [target.x, target.y, target.z],
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Dashed line connecting End Effector to Target */}
      <Line
        points={points}
        color={targetColor}
        lineWidth={2}
        dashed
        dashSize={0.06}
        gapSize={0.04}
        transparent
        opacity={0.7}
      />

      {/* Vertical Drop Line to Ground */}
      <Line
        points={groundProjection}
        color="#64748b"
        lineWidth={1}
        dashed
        dashSize={0.04}
        gapSize={0.04}
        transparent
        opacity={0.4}
      />

      {/* Ground Projection Ring */}
      <mesh position={[target.x, 0.002, target.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 24]} />
        <meshBasicMaterial color={targetColor} transparent opacity={0.4} />
      </mesh>

      {/* TARGET POSITION GIZMO AT TARGET XYZ */}
      <group position={[target.x, target.y, target.z]}>
        {/* Core Sphere */}
        <mesh>
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshStandardMaterial
            color={targetColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pulsing Orbital Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.08, 0.008, 16, 32]} />
          <meshBasicMaterial color={glowColor} wireframe={false} />
        </mesh>

        {/* Target Reticle Crosshairs */}
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.006, 0.006]} />
          <meshBasicMaterial color={targetColor} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.16, 0.006, 0.006]} />
          <meshBasicMaterial color={targetColor} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.16, 0.006, 0.006]} />
          <meshBasicMaterial color={targetColor} />
        </mesh>

        {/* Floating Tooltip Label */}
        <Html position={[0, 0.12, 0]} center distanceFactor={8}>
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border shadow-lg backdrop-blur-md whitespace-nowrap transition-all duration-200 pointer-events-none select-none ${
              isReachable
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-rose-950/90 border-rose-500/80 text-rose-300 animate-pulse'
            }`}
          >
            {isReachable ? 'Target (Reachable)' : 'Target Unreachable'}
          </div>
        </Html>
      </group>
    </group>
  );
};
