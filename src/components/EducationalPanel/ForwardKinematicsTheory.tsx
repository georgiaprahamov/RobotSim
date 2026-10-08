import React from 'react';
import type { SimulationState } from '../../simulation/SimulationState';
import { MathFormula } from './MathFormula';
import { formatNumber, radToDeg } from '../../utils/mathUtils';

interface ForwardKinematicsTheoryProps {
  state: SimulationState;
}

export const ForwardKinematicsTheory: React.FC<ForwardKinematicsTheoryProps> = ({ state }) => {
  const angles = state.jointAngles;
  const ee = state.pose.endEffectorPosition;
  const dh = state.robot.getDHParameters(angles);

  return (
    <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
      {/* Intro Concept */}
      <div className="glass-card rounded-lg p-3 space-y-2 border-l-2 border-l-cyan-400">
        <h3 className="text-sm font-semibold text-white font-mono flex items-center justify-between">
          <span>Forward Kinematics (FK)</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
            θ → (x, y, z)
          </span>
        </h3>
        <p>
          Forward Kinematics is the mathematical mapping from the internal joint space angles{' '}
          <MathFormula math="\vec{\theta} = [\theta_1, \theta_2, \theta_3]^T" /> to the operational Cartesian coordinate
          position of the end-effector <MathFormula math="\mathbf{P}_{TCP} = [x, y, z]^T" />.
        </p>
      </div>

      {/* Live DH Parameters Table */}
      <div className="glass-card rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold text-cyan-300 font-mono">
          Denavit-Hartenberg (DH) Table (Live)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-1 px-2">Joint i</th>
                <th className="py-1 px-2">Link</th>
                <th className="py-1 px-2">θ_i (rad)</th>
                <th className="py-1 px-2">d_i (m)</th>
                <th className="py-1 px-2">a_i (m)</th>
                <th className="py-1 px-2">α_i (rad)</th>
              </tr>
            </thead>
            <tbody>
              {dh.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-1 px-2 text-cyan-400 font-bold">J{row.jointIndex}</td>
                  <td className="py-1 px-2 text-slate-400">{row.name}</td>
                  <td className="py-1 px-2 text-white font-semibold">
                    {formatNumber(row.theta, 3)} ({formatNumber(radToDeg(row.theta), 0)}°)
                  </td>
                  <td className="py-1 px-2 text-slate-300">{formatNumber(row.d, 2)}</td>
                  <td className="py-1 px-2 text-slate-300">{formatNumber(row.a, 2)}</td>
                  <td className="py-1 px-2 text-slate-300">{formatNumber(row.alpha, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Closed-Form Trigonometric Equations */}
      <div className="glass-card rounded-lg p-3 space-y-2 font-mono">
        <h4 className="text-xs font-semibold text-cyan-300">
          Geometric Closed-Form Equations:
        </h4>
        <p className="text-[11px] text-slate-400 font-sans">
          Let <MathFormula math="r = a_2 \cos(\theta_2) + a_3 \cos(\theta_2 + \theta_3)" /> be the radial reach on the XZ plane:
        </p>

        <div className="bg-dark-900/90 rounded p-2.5 border border-white/5 space-y-1.5 text-[11px]">
          <MathFormula math="x = r \cdot \cos(\theta_1)" block />
          <MathFormula math="y = d_1 + a_2 \sin(\theta_2) + a_3 \sin(\theta_2 + \theta_3)" block />
          <MathFormula math="z = r \cdot \sin(\theta_1)" block />
        </div>

        {/* Live Calculation Output */}
        <div className="pt-2 border-t border-white/5 text-[11px] text-slate-300 space-y-1">
          <div className="text-slate-400 font-sans">Current Evaluated Position:</div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 font-bold">
            <div className="bg-dark-800/80 p-1.5 rounded border border-red-500/30 text-red-300">
              X = {formatNumber(ee.x, 3)} m
            </div>
            <div className="bg-dark-800/80 p-1.5 rounded border border-green-500/30 text-green-300">
              Y = {formatNumber(ee.y, 3)} m
            </div>
            <div className="bg-dark-800/80 p-1.5 rounded border border-blue-500/30 text-blue-300">
              Z = {formatNumber(ee.z, 3)} m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
