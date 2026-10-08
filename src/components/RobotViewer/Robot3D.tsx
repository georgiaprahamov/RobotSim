import React from 'react';
import * as THREE from 'three';
import type { Robot } from '../../robotics/Robot';
import type { RobotPose } from '../../robotics/types';
import { CoordinateAxes3D } from './CoordinateAxes3D';

interface Robot3DProps {
  robot?: Robot;
  pose: RobotPose;
  isGhost?: boolean;
  showJointAxes?: boolean;
  showEndEffectorAxes?: boolean;
}

export const Robot3D: React.FC<Robot3DProps> = ({
  pose,
  isGhost = false,
  showJointAxes = false,
  showEndEffectorAxes = false,
}) => {
  const jointPositions = pose.jointPositions;
  const p0 = jointPositions[0] ?? { x: 0, y: 0, z: 0 };
  const p1 = jointPositions[1] ?? { x: 0, y: 0.5, z: 0 };
  const p2 = jointPositions[2] ?? { x: 0.8, y: 0.8, z: 0 };
  const p3 = pose.endEffectorPosition;

  // Materials
  const baseMaterial = isGhost ? (
    <meshStandardMaterial color="#00f0ff" transparent opacity={0.25} wireframe={false} />
  ) : (
    <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
  );

  const linkMaterial = isGhost ? (
    <meshStandardMaterial color="#00f0ff" transparent opacity={0.2} wireframe={false} />
  ) : (
    <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
  );

  const accentMaterial = isGhost ? (
    <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
  ) : (
    <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} roughness={0.2} />
  );

  const jointPivotMaterial = isGhost ? (
    <meshStandardMaterial color="#00f0ff" transparent opacity={0.25} />
  ) : (
    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
  );

  // Helper to render cylindrical link between two 3D points
  const renderLinkSegment = (
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    radius: number,
    key: string
  ) => {
    const vFrom = new THREE.Vector3(from.x, from.y, from.z);
    const vTo = new THREE.Vector3(to.x, to.y, to.z);
    const dist = vFrom.distanceTo(vTo);
    if (dist < 1e-4) return null;

    const mid = vFrom.clone().add(vTo).multiplyScalar(0.5);
    const dir = vTo.clone().sub(vFrom).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

    return (
      <group key={key} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
        {/* Main Arm Link Tube */}
        <mesh castShadow receiveShadow={!isGhost}>
          <cylinderGeometry args={[radius, radius * 1.1, dist, 24]} />
          {linkMaterial}
        </mesh>

        {/* Accent Styling Ring */}
        {!isGhost && (
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[radius * 1.12, radius * 1.12, dist * 0.15, 24]} />
            {accentMaterial}
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group>
      {/* BASE (Pedestal resting on ground) */}
      <group position={[p0.x, p0.y, p0.z]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.22, 0.26, 0.1, 32]} />
          {baseMaterial}
        </mesh>

        {/* Joint 1 Base Turret Column */}
        <mesh position={[0, (p1.y - p0.y) / 2 + 0.05, 0]} castShadow receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.13, 0.16, p1.y - p0.y - 0.02, 32]} />
          {baseMaterial}
        </mesh>

        {/* Base Glowing Ring */}
        {!isGhost && (
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.222, 0.222, 0.02, 32]} />
            {accentMaterial}
          </mesh>
        )}
      </group>

      {/* JOINT 1 / SHOULDER HOUSING (At p1) */}
      <group position={[p1.x, p1.y, p1.z]}>
        <mesh castShadow receiveShadow={!isGhost}>
          <sphereGeometry args={[0.14, 32, 32]} />
          {jointPivotMaterial}
        </mesh>
        {/* Lateral Joint Pivot Caps */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.28, 24]} />
          {jointPivotMaterial}
        </mesh>
        {!isGhost && (
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.14]}>
            <ringGeometry args={[0.06, 0.09, 24]} />
            {accentMaterial}
          </mesh>
        )}
      </group>

      {/* LINK 2 (Shoulder to Elbow) */}
      {renderLinkSegment(p1, p2, 0.075, 'link-shoulder-elbow')}

      {/* JOINT 2 / ELBOW HOUSING (At p2) */}
      <group position={[p2.x, p2.y, p2.z]}>
        <mesh castShadow receiveShadow={!isGhost}>
          <sphereGeometry args={[0.11, 32, 32]} />
          {jointPivotMaterial}
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.22, 24]} />
          {jointPivotMaterial}
        </mesh>
        {!isGhost && (
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.11]}>
            <ringGeometry args={[0.05, 0.075, 24]} />
            {accentMaterial}
          </mesh>
        )}
      </group>

      {/* LINK 3 (Elbow to End Effector) */}
      {renderLinkSegment(p2, p3, 0.055, 'link-elbow-ee')}

      {/* END EFFECTOR (Tool Flange & Gripper at p3) */}
      <group position={[p3.x, p3.y, p3.z]}>
        {/* Tool Flange Collar */}
        <mesh castShadow receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 24]} />
          {jointPivotMaterial}
        </mesh>

        {/* Gripper Base Platform */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow={!isGhost}>
          <boxGeometry args={[0.09, 0.04, 0.09]} />
          {baseMaterial}
        </mesh>

        {/* Dual-Finger Gripper */}
        <mesh position={[0.03, 0.04, 0]} castShadow>
          <boxGeometry args={[0.015, 0.06, 0.03]} />
          {linkMaterial}
        </mesh>
        <mesh position={[-0.03, 0.04, 0]} castShadow>
          <boxGeometry args={[0.015, 0.06, 0.03]} />
          {linkMaterial}
        </mesh>

        {/* End-Effector Precision Laser / LED Pointer */}
        {!isGhost && (
          <mesh position={[0, 0.035, 0]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshBasicMaterial color="#00ffcc" />
          </mesh>
        )}
      </group>

      {/* Joint Coordinate Axes Visualizers */}
      {showJointAxes &&
        jointPositions.map((pos, idx) => (
          <CoordinateAxes3D
            key={`joint-axis-${idx}`}
            position={pos}
            size={0.2}
            label={`J${idx + 1}`}
            visible={showJointAxes}
          />
        ))}

      {/* End Effector Coordinate Axes Visualizer */}
      {showEndEffectorAxes && (
        <CoordinateAxes3D
          position={p3}
          size={0.28}
          label="End-Effector (TCP)"
          visible={showEndEffectorAxes}
        />
      )}
    </group>
  );
};
