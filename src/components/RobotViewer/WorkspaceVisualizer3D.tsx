import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Robot } from '../../robotics/Robot';

interface WorkspaceVisualizer3DProps {
  robot: Robot;
  visible?: boolean;
}

export const WorkspaceVisualizer3D: React.FC<WorkspaceVisualizer3DProps> = ({
  robot,
  visible = false,
}) => {
  if (!visible) return null;

  const pointsGeometry = useMemo(() => {
    const pts = robot.sampleWorkspace(18);
    const positions = new Float32Array(pts.length * 3);
    const colors = new Float32Array(pts.length * 3);

    const bounds = robot.getWorkspaceBounds();

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      positions[i * 3 + 0] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      // Color by reach distance (cyan -> purple -> amber)
      const r = Math.sqrt(p.x * p.x + p.z * p.z);
      const norm = (r - bounds.rMin) / Math.max(0.1, bounds.rMax - bounds.rMin);

      // Gradient from cyan (0.0, 0.9, 1.0) to purple (0.6, 0.3, 0.9)
      colors[i * 3 + 0] = 0.0 + norm * 0.6;
      colors[i * 3 + 1] = 0.9 - norm * 0.5;
      colors[i * 3 + 2] = 1.0;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [robot]);

  return (
    <group>
      <points geometry={pointsGeometry}>
        <pointsMaterial
          size={0.025}
          vertexColors
          transparent
          opacity={0.45}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
