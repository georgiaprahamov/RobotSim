import React from 'react';
import type { SimulationState } from '../../simulation/SimulationState';
import { MathFormula } from './MathFormula';
import { formatNumber } from '../../utils/mathUtils';

interface JacobianTheoryProps {
  state: SimulationState;
}

export const JacobianTheory: React.FC<JacobianTheoryProps> = ({ state }) => {
  const J = state.robot.computeJacobian(state.jointAngles);
  const manipulability = state.metrics.manipulability;

  return (
    <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
      {/* Intro */}
      <div className="glass-card rounded-lg p-3 space-y-2 border-l-2 border-l-purple-400">
        <h3 className="text-sm font-semibold text-white font-mono flex items-center justify-between">
          <span>Jacobian Matrix & Velocities</span>
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
            v = J(θ) θ̇
          </span>
        </h3>
        <p>
          The Robot Jacobian <MathFormula math="J(\vec{\theta})" /> represents the linear mapping from joint angular velocities{' '}
          <MathFormula math="\dot{\vec{\theta}}" /> to linear end-effector velocities{' '}
          <MathFormula math="\vec{v} = [\dot{x}, \dot{y}, \dot{z}]^T" />.
        </p>
      </div>

      {/* Live Jacobian Matrix */}
      <div className="glass-card rounded-lg p-3 space-y-2 font-mono">
        <h4 className="text-xs font-semibold text-purple-300">
          Live Evaluated Jacobian Matrix J(θ):
        </h4>

        <div className="bg-dark-900/90 rounded p-2.5 border border-white/5 overflow-x-auto text-[11px]">
          <div className="grid grid-cols-3 gap-2 text-center">
            {J.map((row, rIdx) =>
              row.map((val, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="p-1.5 rounded bg-dark-800 border border-white/5 text-cyan-300 font-semibold"
                >
                  <span className="text-[9px] text-slate-500 block">J_{rIdx + 1}{cIdx + 1}</span>
                  {formatNumber(val, 3)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Yoshikawa Manipulability */}
      <div className="glass-card rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold text-amber-300 font-mono">
          Yoshikawa Manipulability Measure (w)
        </h4>
        <p className="text-[11px] text-slate-400">
          Quantifies how easily the robot can move arbitrarily in any Cartesian direction without approaching singularities:
        </p>
        <div className="bg-dark-900/90 rounded p-2 border border-white/5 font-mono text-[11px]">
          <MathFormula math="w = \sqrt{\det(J(\vec{\theta}) \cdot J(\vec{\theta})^T)}" block />
        </div>
        <div className="flex justify-between items-center pt-1 font-mono text-xs">
          <span className="text-slate-400">Current Measure w:</span>
          <span className="text-amber-300 font-bold">{formatNumber(manipulability, 4)}</span>
        </div>
      </div>
    </div>
  );
};
