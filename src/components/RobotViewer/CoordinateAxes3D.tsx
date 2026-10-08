import { Vector3 } from '../../math/Vector';
import type { Matrix4 } from '../../math/Matrix';
import { Html } from '@react-three/drei';

interface CoordinateAxes3DProps {
  matrix?: Matrix4;
  position?: Vector3;
  size?: number;
  label?: string;
  visible?: boolean;
}

export const CoordinateAxes3D: React.FC<CoordinateAxes3DProps> = ({
  matrix,
  position,
  size = 0.25,
  label,
  visible = true,
}) => {
  if (!visible) return null;

  const origin = position ?? (matrix ? matrix.getPosition() : Vector3.zero());

  const shaftRadius = size * 0.035;
  const headRadius = size * 0.08;
  const headLength = size * 0.25;
  const shaftLength = size - headLength;

  return (
    <group position={[origin.x, origin.y, origin.z]}>
      {/* X Axis - Red */}
      <group rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, shaftLength / 2, 0]}>
          <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, shaftLength + headLength / 2, 0]}>
          <coneGeometry args={[headRadius, headLength, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Y Axis - Green */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, shaftLength / 2, 0]}>
          <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0, shaftLength + headLength / 2, 0]}>
          <coneGeometry args={[headRadius, headLength, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Z Axis - Blue */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, shaftLength / 2, 0]}>
          <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 16]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, shaftLength + headLength / 2, 0]}>
          <coneGeometry args={[headRadius, headLength, 16]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* Frame Label */}
      {label && (
        <Html position={[0, size * 1.1, 0]} center distanceFactor={10}>
          <div className="px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-cyan-400 whitespace-nowrap shadow pointer-events-none select-none">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};
