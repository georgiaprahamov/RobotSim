import React from 'react';
import * as THREE from 'three';

export const GridFloor3D: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <group position={[0, -0.001, 0]}>
      {/* Primary Coordinate Grid */}
      <gridHelper args={[10, 20, '#00f0ff', '#1e293b']} position={[0, 0, 0]} />
      
      {/* Finer High-Tech Sub-Grid */}
      <gridHelper args={[10, 100, '#0f172a', '#0f172a']} position={[0, -0.002, 0]} />

      {/* Radial Distance Rings on the floor for reach reference */}
      {[0.5, 1.0, 1.5, 1.8, 2.0].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <ringGeometry args={[radius - 0.004, radius + 0.004, 64]} />
          <meshBasicMaterial
            color={radius === 1.8 ? '#00f0ff' : '#334155'}
            transparent
            opacity={radius === 1.8 ? 0.35 : 0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Base Platform Ring */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.02, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};
