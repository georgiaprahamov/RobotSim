import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { TrajectoryPlan } from '../../robotics/types';

interface TrajectoryVisualizer3DProps {
  plan: TrajectoryPlan | null;
  currentTime: number;
  isPlaying: boolean;
  visible?: boolean;
}

export const TrajectoryVisualizer3D: React.FC<TrajectoryVisualizer3DProps> = ({
  plan,
  currentTime,
  visible = true,
}) => {
  if (!visible || !plan || plan.points.length < 2) return null;

  const points3D: [number, number, number][] = useMemo(() => {
    return plan.points.map((p) => [p.position.x, p.position.y, p.position.z]);
  }, [plan]);

  // Current interpolated position on trajectory
  const currentPos = useMemo(() => {
    const norm = Math.max(0, Math.min(1, currentTime / plan.duration));
    const idx = norm * (plan.points.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(plan.points.length - 1, i0 + 1);
    const alpha = idx - i0;

    const p0 = plan.points[i0]?.position ?? plan.startPosition;
    const p1 = plan.points[i1]?.position ?? plan.targetPosition;

    return p0.lerp(p1, alpha);
  }, [plan, currentTime]);

  return (
    <group>
      {/* 3D Glowing Trajectory Path Line */}
      <Line
        points={points3D}
        color="#9d4edd"
        lineWidth={3}
        transparent
        opacity={0.85}
      />

      {/* Trajectory Waypoints Beads (every few points) */}
      {plan.points.filter((_, idx) => idx % 6 === 0).map((pt, idx) => (
        <mesh key={`wp-${idx}`} position={[pt.position.x, pt.position.y, pt.position.z]}>
          <sphereGeometry args={[0.014, 12, 12]} />
          <meshBasicMaterial color="#c77dff" />
        </mesh>
      ))}

      {/* Start Position Marker */}
      <mesh position={[plan.startPosition.x, plan.startPosition.y, plan.startPosition.z]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
      </mesh>

      {/* End Position Marker */}
      <mesh position={[plan.targetPosition.x, plan.targetPosition.y, plan.targetPosition.z]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={0.6} />
      </mesh>

      {/* Active Trajectory Tracer Cursor */}
      <mesh position={[currentPos.x, currentPos.y, currentPos.z]}>
        <sphereGeometry args={[0.04, 20, 20]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.0}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};
