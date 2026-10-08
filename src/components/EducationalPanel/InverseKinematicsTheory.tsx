import React from 'react';
import type { SimulationState } from '../../simulation/SimulationState';
import { MathFormula } from './MathFormula';
import { formatNumber, radToDeg } from '../../utils/mathUtils';

interface InverseKinematicsTheoryProps {
  state: SimulationState;
}

export const InverseKinematicsTheory: React.FC<InverseKinematicsTheoryProps> = ({ state }) => {
  const target = state.targetPosition;
  const ik = state.ikSolution;

  return (
    <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
      {/* Intro Concept */}
      <div className="glass-card rounded-lg p-3 space-y-2 border-l-2 border-l-cyan-400">
        <h3 className="text-sm font-semibold text-white font-mono flex items-center justify-between">
          <span>Inverse Kinematics (IK)</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            (x, y, z) → θ
          </span>
        </h3>
        <p>
          Inverse Kinematics solves the inverse problem: given a desired tool center point{' '}
          <MathFormula math="\mathbf{P}_{target} = (x_t, y_t, z_t)" />, determine the corresponding joint angles{' '}
          <MathFormula math="\theta_1, \theta_2, \theta_3" /> to place the end-effector exactly at the target.
        </p>
      </div>

      {/* Step 1: Base Angle */}
      <div className="glass-card rounded-lg p-3 space-y-1.5 font-mono">
        <h4 className="text-xs font-semibold text-cyan-300">
          Step 1: Base Azimuth Angle (\theta_1)
        </h4>
        <p className="text-[11px] text-slate-400 font-sans">
          The base joint rotates around the vertical Y-axis to aim the arm plane directly toward the target projection on the ground:
        </p>
        <div className="bg-dark-900/90 rounded p-2 border border-white/5 text-[11px]">
          <MathFormula math="\theta_1 = \operatorname{atan2}(z_t, x_t)" block />
          <MathFormula math="r = \sqrt{x_t^2 + z_t^2}" block />
        </div>
      </div>

      {/* Step 2: Sagittal Plane & Reachability */}
      <div className="glass-card rounded-lg p-3 space-y-1.5 font-mono">
        <h4 className="text-xs font-semibold text-cyan-300">
          Step 2: Reachability & Distance
        </h4>
        <p className="text-[11px] text-slate-400 font-sans">
          In the 2D plane of the arm, let <MathFormula math="\Delta y = y_t - d_1" />. The distance from shoulder to target is:
        </p>
        <div className="bg-dark-900/90 rounded p-2 border border-white/5 text-[11px]">
          <MathFormula math="D = \sqrt{r^2 + (y_t - d_1)^2}" block />
          <div className="text-slate-400 text-center text-[10px] pt-1">
            Reachability Condition: <MathFormula math="|a_2 - a_3| \le D \le a_2 + a_3" />
          </div>
        </div>
      </div>

      {/* Step 3: Law of Cosines for Elbow */}
      <div className="glass-card rounded-lg p-3 space-y-1.5 font-mono">
        <h4 className="text-xs font-semibold text-cyan-300">
          Step 3: Law of Cosines for Elbow (\theta_3)
        </h4>
        <p className="text-[11px] text-slate-400 font-sans">
          Using the Law of Cosines on the triangle formed by Link 2, Link 3, and hypotenuse D:
        </p>
        <div className="bg-dark-900/90 rounded p-2 border border-white/5 text-[11px]">
          <MathFormula math="\cos\theta_3 = \frac{D^2 - a_2^2 - a_3^2}{2 a_2 a_3}" block />
          <MathFormula math="\theta_3 = \pm \arccos(\cos\theta_3)" block />
        </div>
        <p className="text-[10px] text-slate-400 font-sans">
          The <span className="text-cyan-300 font-bold">+</span> sign yields the <em>Elbow-Up</em> configuration, while{' '}
          <span className="text-cyan-300 font-bold">-</span> yields <em>Elbow-Down</em>.
        </p>
      </div>

      {/* Step 4: Shoulder Pitch */}
      <div className="glass-card rounded-lg p-3 space-y-1.5 font-mono">
        <h4 className="text-xs font-semibold text-cyan-300">
          Step 4: Shoulder Angle (\theta_2)
        </h4>
        <div className="bg-dark-900/90 rounded p-2 border border-white/5 text-[11px]">
          <MathFormula math="\alpha = \operatorname{atan2}(\Delta y, r)" block />
          <MathFormula math="\beta = \operatorname{atan2}(a_3 \sin\theta_3, a_2 + a_3 \cos\theta_3)" block />
          <MathFormula math="\theta_2 = \alpha - \beta" block />
        </div>
      </div>

      {/* Current Target Live Solution */}
      {ik && (
        <div
          className={`p-3 rounded-lg border font-mono ${
            ik.success ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
          }`}
        >
          <div className="font-semibold text-xs mb-1 text-slate-200">
            Target ({formatNumber(target.x, 2)}, {formatNumber(target.y, 2)}, {formatNumber(target.z, 2)}):
          </div>
          {ik.success ? (
            <div className="text-emerald-300 text-[11px] space-y-0.5">
              <div>θ1 = {formatNumber(radToDeg(ik.jointAngles[0]), 1)}° ({formatNumber(ik.jointAngles[0], 3)} rad)</div>
              <div>θ2 = {formatNumber(radToDeg(ik.jointAngles[1]), 1)}° ({formatNumber(ik.jointAngles[1], 3)} rad)</div>
              <div>θ3 = {formatNumber(radToDeg(ik.jointAngles[2]), 1)}° ({formatNumber(ik.jointAngles[2], 3)} rad)</div>
            </div>
          ) : (
            <div className="text-rose-300 text-[11px]">{ik.error}</div>
          )}
        </div>
      )}
    </div>
  );
};
