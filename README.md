# 🤖 RobotSim — 3D Robotics Kinematics & Simulation Laboratory

**RobotSim** is an interactive, production-quality engineering simulation laboratory designed for engineering students, robotics researchers, and software developers to understand industrial robots, joint/link kinematic chains, forward and inverse kinematics, coordinate transformations, trajectory generation, and manipulability analysis in real time.

Built with modern web technologies: **React 19**, **TypeScript (Strict Mode)**, **Three.js**, **React Three Fiber (R3F)**, **Drei**, **Tailwind CSS v4**, **KaTeX**, and **Vitest**.

---

## 📑 Table of Contents

- [Key Capabilities](#-key-capabilities)
- [Software Architecture & Directory Structure](#-software-architecture--directory-structure)
- [Robot Models in Library](#-robot-models-in-library)
- [Mathematical Foundations & Kinematics](#-mathematical-foundations--kinematics)
  - [1. Forward Kinematics (FK)](#1-forward-kinematics-fk)
  - [2. Inverse Kinematics (IK)](#2-inverse-kinematics-ik)
  - [3. Jacobian Matrix & Manipulability](#3-jacobian-matrix--manipulability)
  - [4. Trajectory Planning](#4-trajectory-planning)
- [Getting Started & Installation](#-getting-started--installation)
- [Automated Unit Testing](#-automated-unit-testing)
- [Adding New Robots](#-adding-new-robots)
- [Technology Stack](#-technology-stack)
- [License](#-license)

---

## 🌟 Key Capabilities

### 1. Real-Time 3D Interactive Simulation
- **WebGL 3D Environment**: Studio key/fill/rim lighting, soft contact shadows (`ContactShadows`), and cybernetic ground grid with concentric reach rings.
- **Camera Controls**: Smooth inertial rotation, zooming, panning, and instant perspective presets (**ISO**, **TOP**, **FRONT**, **SIDE**, **RESET**).
- **Layer Visibility Toggles**:
  - World Origin ($O$) and Robot Base coordinate axes.
  - Joint frames and Tool Center Point (TCP) RGB coordinate axes.
  - **Reachable Workspace Envelope Point Cloud**.
  - Ghost hologram of the candidate IK solution.
  - 3D Trajectory curve with waypoint markers and active animated cursor.

### 2. Real-Time Joint Control
- Smooth sliders with physical boundary limits $[min, max]$, fine step buttons (+/- 5°), and real-time 3D motion update.
- Direct numerical angle inputs with instant safety clamping.
- Global unit switching between **Degrees (DEG)** and **Radians (RAD)**.
- Preset configurations (*Zero Home, Upright, Extended Forward, Floor Pick, Folded Compact*).

### 3. Inverse Kinematics (IK)
- Set Cartesian target coordinates $(X, Y, Z)$ for the end-effector.
- **Closed-form Analytical Geometric Solver** for 3-DOF articulated arms with zero latency.
- Configuration selection: **Elbow-Up**, **Elbow-Down**, or **Auto** (minimal joint displacement).
- **Live Auto-Solve** mode for continuous target tracking.
- **Singularity & Error Handling**: Clear feedback for unreachable targets (exceeding maximum reach or inside inner deadzones).
- Random reachable target generator (**Random Target**).

### 4. Trajectory Planning & Motion Playback
- Smooth trajectory generation between current position and target point.
- 4 Interpolation Algorithms:
  1. **Quintic Polynomial ($C^2$)** — zero initial/final velocities and accelerations.
  2. **Cartesian Linear** — straight-line Tool Center Point (TCP) path in 3D Cartesian space.
  3. **Cubic Spline ($C^1$)** — velocity continuity without abrupt jumps.
  4. **Trapezoidal Velocity Profile (LSPB)** — linear motion with parabolic blends.
- Playback controls: **Play**, **Pause**, **Reset**, **Replay**, duration slider ($0.5\,\text{s} - 10.0\,\text{s}$), and interactive timeline scrubber.

### 5. Interactive Educational Theory Lab
- **KaTeX Equations**: Live LaTeX formulas with current numerical values substituted in real time.
- **Denavit-Hartenberg (DH) Parameter Table**: Continuously updating transformation parameters.
- **Jacobian & Manipulability Analysis**: Real-time evaluation of $J(\theta)$ matrix and Yoshikawa manipulability index $w$.
- **Interactive Student Missions**: 4 guided laboratory challenges with automated validation and achievement badges.

---

## 🏗 Software Architecture & Directory Structure

Robotics mathematics are **strictly decoupled from React and UI components** into reusable, pure TypeScript modules:

```text
src/
├── math/                     # Independent 3D Euclidean vector & matrix mathematics
│   ├── Vector.ts             # Vector3 (add, scale, dot, cross, norm, lerp)
│   ├── Matrix.ts             # Matrix4 (4x4 transforms, DH matrix generator, rotations, inverse)
│   └── Transform.ts          # Rigid-body frame transform representation
│
├── robotics/                 # Core robotics kinematics and planning algorithms
│   ├── types.ts              # Strongly-typed interfaces for joints, links, poses, and plans
│   ├── Joint.ts              # Joint class with limits, clamping, and velocity checks
│   ├── Link.ts               # Link class representing arm body segments
│   ├── Robot.ts              # Abstract Robot base class for all kinematic models
│   ├── ForwardKinematics.ts  # Geometric & Denavit-Hartenberg Forward Kinematics
│   ├── InverseKinematics.ts  # Analytical (3-DOF) & Damped Least Squares Numerical IK
│   ├── TrajectoryPlanner.ts  # Quintic, Cubic, Cartesian, and Trapezoidal planners
│   └── CoordinateSystem.ts  # Frame transformations and basis vector extractors
│
├── robots/                   # Robot model implementations
│   ├── ThreeDOFRobot.ts      # 3-DOF Educational Articulated Arm
│   ├── SCARARobot.ts         # 3/4-DOF SCARA Assembly Robot (RRPR)
│   ├── SixDOFRobot.ts        # 6-DOF Industrial Manipulator (PUMA / UR kinematic style)
│   └── index.ts              # Model registry and factory
│
├── simulation/               # Simulation state engine
│   ├── SimulationState.ts    # State definition and initial state generator
│   └── SimulationEngine.ts   # Pure transition functions for state updates
│
├── components/               # React UI & Three.js 3D Viewport
│   ├── Header/               # Navigation, model selector, unit toggles, home reset
│   ├── Toolbar/              # Floating viewport camera presets & layer toggles
│   ├── RobotViewer/          # Three.js / React Three Fiber scene & 3D meshes
│   │   ├── Scene3D.tsx       # Canvas, OrbitControls, studio lighting, shadows
│   │   ├── Robot3D.tsx       # Procedural metallic robotic arm mesh & tool gripper
│   │   ├── CoordinateAxes3D.tsx # RGB frame axes (World, Base, Joints, TCP)
│   │   ├── TargetMarker3D.tsx   # Pulsing target reticle & laser reach line
│   │   ├── TrajectoryVisualizer3D.tsx # 3D trajectory path curve & waypoint beads
│   │   ├── WorkspaceVisualizer3D.tsx  # Reachable workspace point cloud
│   │   └── GridFloor3D.tsx   # Cybernetic floor grid with concentric reach rings
│   ├── JointControls/        # Real-time joint sliders, numeric inputs, preset poses
│   ├── TargetControls/       # X/Y/Z Cartesian inputs, IK solver, configuration selector
│   ├── TrajectoryControls/   # Trajectory planning parameters, scrubber, playback buttons
│   ├── SimulationPanel/      # Real-time telemetry, TCP coordinates, Euler angles, Jacobian
│   └── EducationalPanel/     # Interactive theory lab (FK, IK, Jacobian, Missions)
│
├── hooks/
│   └── useSimulation.ts      # Main React hook for simulation animation loop & actions
│
├── test/
│   └── kinematics.test.ts    # Comprehensive Vitest unit test suite
│
├── utils/
│   └── mathUtils.ts          # Conversions (deg/rad), clamping, smoothing helpers
├── App.tsx                   # Main application layout
└── main.tsx                  # Application entry point
```

---

## 🦾 Robot Models in Library

| Robot | Degrees of Freedom (DOF) | Joint Types | Description |
| :--- | :---: | :---: | :--- |
| **3-DOF Educational Arm** | 3 | Revolute (R-R-R) | Standard 3-axis articulated robot arm with Base Yaw, Shoulder Pitch, and Elbow Pitch. Ideal for learning trigonometric kinematic derivations. |
| **SCARA Robot** | 3/4 | R-R-P-R | Selective Compliance Assembly Robot Arm featuring planar horizontal reach and vertical prismatic quill. Widely used in high-speed pick-and-place. |
| **6-DOF Industrial Arm** | 6 | Revolute (6R) | Full 6-axis articulated industrial manipulator with spherical wrist for arbitrary 6D position and orientation control. |

---

## 📐 Mathematical Foundations & Kinematics

### 1. Forward Kinematics (FK)

For the 3-DOF arm with base height $d_1 = 0.5\,\text{m}$, upper arm length $a_2 = 1.0\,\text{m}$, and forearm length $a_3 = 0.8\,\text{m}$:

Let planar reach $r$ in the horizontal $XZ$-plane be:
$$r = a_2 \cos(\theta_2) + a_3 \cos(\theta_2 + \theta_3)$$

The Cartesian Tool Center Point (TCP) coordinates are:
$$X = r \cdot \cos(\theta_1)$$
$$Y = d_1 + a_2 \sin(\theta_2) + a_3 \sin(\theta_2 + \theta_3)$$
$$Z = r \cdot \sin(\theta_1)$$

#### Denavit-Hartenberg (DH) Parameter Table:
$$\begin{array}{|c|c|c|c|c|}
\hline
\textbf{Joint } i & \theta_i & d_i & a_i & \alpha_i \\
\hline
1 & \theta_1 & d_1 = 0.5 & 0 & +90^\circ \\
2 & \theta_2 & 0 & a_2 = 1.0 & 0^\circ \\
3 & \theta_3 & 0 & a_3 = 0.8 & 0^\circ \\
\hline
\end{array}$$

Standard transformation matrix for frame $i-1$ to $i$:
$$T_i = \begin{bmatrix}
\cos\theta_i & -\sin\theta_i\cos\alpha_i & \sin\theta_i\sin\alpha_i & a_i\cos\theta_i \\
\sin\theta_i & \cos\theta_i\cos\alpha_i & -\cos\theta_i\sin\alpha_i & a_i\sin\theta_i \\
0 & \sin\alpha_i & \cos\alpha_i & d_i \\
0 & 0 & 0 & 1
\end{bmatrix}$$

---

### 2. Inverse Kinematics (IK)

Given target position $\mathbf{P}_t = (X_t, Y_t, Z_t)$:

1. **Base Yaw Angle ($\theta_1$):**
   $$\theta_1 = \operatorname{atan2}(Z_t, X_t)$$
   $$r = \sqrt{X_t^2 + Z_t^2}$$

2. **Distance in Sagittal Arm Plane ($D$):**
   $$\Delta Y = Y_t - d_1$$
   $$D = \sqrt{r^2 + (\Delta Y)^2}$$

   *Geometric Reachability Condition:*
   $$|a_2 - a_3| \le D \le a_2 + a_3$$

3. **Law of Cosines for Elbow Angle ($\theta_3$):**
   $$\cos\theta_3 = \frac{D^2 - a_2^2 - a_3^2}{2 a_2 a_3}$$
   $$\theta_3 = \pm \arccos(\cos\theta_3) \quad \begin{cases} + \implies \text{Elbow-Up} \\ - \implies \text{Elbow-Down} \end{cases}$$

4. **Shoulder Pitch Angle ($\theta_2$):**
   $$\alpha = \operatorname{atan2}(\Delta Y, r)$$
   $$\beta = \operatorname{atan2}(a_3 \sin\theta_3, a_2 + a_3 \cos\theta_3)$$
   $$\theta_2 = \alpha - \beta$$

---

### 3. Jacobian Matrix & Manipulability

The Jacobian matrix $J(\vec{\theta})$ maps joint angular velocities $\dot{\vec{\theta}}$ to linear TCP velocities $\vec{v}$:

$$\vec{v} = \begin{bmatrix} \dot{X} \\ \dot{Y} \\ \dot{Z} \end{bmatrix} = J(\vec{\theta}) \begin{bmatrix} \dot{\theta}_1 \\ \dot{\theta}_2 \\ \dot{\theta}_3 \end{bmatrix}$$

$$J(\vec{\theta}) = \begin{bmatrix}
\frac{\partial X}{\partial \theta_1} & \frac{\partial X}{\partial \theta_2} & \frac{\partial X}{\partial \theta_3} \\
\frac{\partial Y}{\partial \theta_1} & \frac{\partial Y}{\partial \theta_2} & \frac{\partial Y}{\partial \theta_3} \\
\frac{\partial Z}{\partial \theta_1} & \frac{\partial Z}{\partial \theta_2} & \frac{\partial Z}{\partial \theta_3}
\end{bmatrix}$$

**Yoshikawa's Manipulability Measure:**
$$w = \sqrt{\det(J(\vec{\theta}) \cdot J(\vec{\theta})^T)}$$

When $w \to 0$, the robot arm is near a **kinematic singularity** (e.g. fully extended arm), losing mobility along one Cartesian dimension.

---

### 4. Trajectory Planning

For smooth joint movements without acceleration jerks ($C^2$ continuity), a 5th-order quintic polynomial is used:

$$s(\tau) = 6\tau^5 - 15\tau^4 + 10\tau^3, \quad \tau = \frac{t}{T} \in [0, 1]$$

satisfying boundary constraints:
$$s(0) = 0, \quad s(1) = 1$$
$$\dot{s}(0) = \dot{s}(1) = 0$$
$$\ddot{s}(0) = \ddot{s}(1) = 0$$

---

## 🚀 Getting Started & Installation

### Prerequisites:
- **Node.js** (v18.0 or newer)
- **npm** (v9.0 or newer)

### 1. Clone or navigate to the project directory:
```bash
cd "RobotSim"
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Launch Development Server:
```bash
npm run dev
```
Open your browser at: **[http://localhost:5173/](http://localhost:5173/)**

---

## 🧪 Automated Unit Testing

All robotics mathematics, forward/inverse kinematics, boundary checks, and trajectory planners are covered by unit tests using **Vitest**:

```bash
npm test
```

### Verified Test Cases:
- ✅ **Home position (zero angles)**: verifies TCP coordinates $(1.80, 0.50, 0.00)$.
- ✅ **Vertical position (90° shoulder)**: verifies peak vertical height $(0.00, 2.30, 0.00)$.
- ✅ **Base yaw rotation (90°)**: verifies $Z$-axis coordinate transformation.
- ✅ **Negative joint angles**.
- ✅ **FK $\to$ IK $\to$ FK closed-loop validation**: sub-millimeter precision ($< 1\,\text{mm}$).
- ✅ **Detection of unreachable targets exceeding maximum reach**.
- ✅ **Detection of targets inside inner deadzone**.
- ✅ **Numerical safety handling for invalid inputs (`NaN`, `Infinity`)**.
- ✅ **Elbow-Up and Elbow-Down multi-solution verification**.
- ✅ **Quintic trajectory boundary conditions and time sampling**.

---

## 📦 Production Build

To build the optimized production bundle:

```bash
npm run build
```

To preview the built production app:
```bash
npm run preview
```

---

## 🔌 Adding New Robots

The architecture uses the **Strategy / Factory** pattern, making it straightforward to add new robotic manipulators:

1. Create a new robot class extending `Robot` in `src/robots/`:
```typescript
import { Robot } from '../robotics/Robot';
import { Joint } from '../robotics/Joint';
import { Link } from '../robotics/Link';
import type { RobotPose, IKSolution } from '../robotics/types';
import { Vector3 } from '../math/Vector';

export class CustomRobot extends Robot {
  constructor() {
    const joints = [ /* define joints and limits */ ];
    const links = [ /* define link lengths and offsets */ ];
    super('custom_id', 'Custom Robot', 'Description...', 4, joints, links);
  }

  computeFK(jointAngles?: number[]): RobotPose {
    // Return frame transforms and TCP position
  }

  computeIK(target: Vector3): IKSolution {
    // Solve inverse kinematics for target
  }

  getDHParameters(jointAngles?: number[]) { /* ... */ }
  computeJacobian(jointAngles?: number[]) { /* ... */ }
  getWorkspaceBounds() { /* ... */ }
}
```

2. Register the robot model in `src/robots/index.ts` in the `AVAILABLE_ROBOTS` array. It will automatically appear in the application UI dropdown!

---

## 🛠 Technology Stack

- **Language**: [TypeScript 6.0](https://www.typescriptlang.org/) (Strict Mode)
- **UI Framework**: [React 19](https://react.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) & [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) & [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Math Formula Rendering**: [KaTeX](https://katex.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)

---

## 📄 License

This project is open-source and available under the **MIT License**. Suitable for robotics education in universities, engineering laboratories, and research.
