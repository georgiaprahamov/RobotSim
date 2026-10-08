import { Robot } from '../robotics/Robot';
import { ThreeDOFRobot } from './ThreeDOFRobot';
import { SCARARobot } from './SCARARobot';
import { SixDOFRobot } from './SixDOFRobot';

export { ThreeDOFRobot, SCARARobot, SixDOFRobot };

export interface RobotInfo {
  id: string;
  name: string;
  dof: number;
  description: string;
  category: 'Educational' | 'Industrial' | 'Assembly';
  factory: () => Robot;
}

export const AVAILABLE_ROBOTS: RobotInfo[] = [
  {
    id: '3dof_educational',
    name: '3-DOF Educational Arm',
    dof: 3,
    description: '3-axis articulated robot arm with Base Yaw, Shoulder Pitch, and Elbow Pitch.',
    category: 'Educational',
    factory: () => new ThreeDOFRobot(0.5, 1.0, 0.8),
  },
  {
    id: 'scara_robot',
    name: 'SCARA Assembly Robot',
    dof: 3,
    description: 'Selective Compliance Articulated Robot Arm with horizontal planar axes and vertical quill.',
    category: 'Assembly',
    factory: () => new SCARARobot(0.4, 0.8, 0.6, 0.3),
  },
  {
    id: '6dof_industrial',
    name: '6-DOF Industrial Arm',
    dof: 6,
    description: 'Full 6-axis industrial robot arm with spherical wrist for 6D orientation control.',
    category: 'Industrial',
    factory: () => new SixDOFRobot(),
  },
];

export function createRobotById(id: string): Robot {
  const found = AVAILABLE_ROBOTS.find((r) => r.id === id);
  if (found) {
    return found.factory();
  }
  return new ThreeDOFRobot();
}
