import React from 'react';
import type { SimulationState } from '../../simulation/SimulationState';
import { CheckCircle2, Circle, Trophy, Award, ArrowRight } from 'lucide-react';
import { Vector3 } from '../../math/Vector';

interface InteractiveChallengesProps {
  state: SimulationState;
  onSetTarget: (target: Vector3) => void;
  onSolveIK: () => void;
}

export const InteractiveChallenges: React.FC<InteractiveChallengesProps> = ({
  state,
  onSetTarget,
  onSolveIK,
}) => {
  const ee = state.pose.endEffectorPosition;
  const angles = state.jointAngles;
  const manipulability = state.metrics.manipulability;

  // Challenge conditions evaluated in real-time
  const challenges = [
    {
      id: 'c1',
      title: '1. The Horizontal Datum',
      desc: 'Set all joints to 0° to observe the baseline kinematic reach of 1.80m.',
      completed:
        Math.abs(angles[0] ?? 1) < 0.02 &&
        Math.abs(angles[1] ?? 1) < 0.02 &&
        Math.abs(angles[2] ?? 1) < 0.02,
      hint: 'Adjust sliders J1, J2, and J3 to 0°.',
    },
    {
      id: 'c2',
      title: '2. Vertical Apex Peak',
      desc: 'Position the robot arm to its maximum vertical height (Y ≥ 2.25m).',
      completed: ee.y >= 2.25,
      hint: 'Set Shoulder J2 to +90° and Elbow J3 to 0°.',
    },
    {
      id: 'c3',
      title: '3. Precise Cartesian Target',
      desc: 'Reach the coordinate point (X: 1.00m, Y: 0.80m, Z: 0.50m) within 3cm error.',
      completed: ee.distanceTo(new Vector3(1.0, 0.8, 0.5)) < 0.03,
      hint: 'Click "Set Target (1.0, 0.8, 0.5)" below and solve IK.',
      action: () => {
        onSetTarget(new Vector3(1.0, 0.8, 0.5));
        onSolveIK();
      },
    },
    {
      id: 'c4',
      title: '4. Kinematic Singularity',
      desc: 'Align links 2 and 3 into fully outstretched singularity where manipulability μ < 0.03.',
      completed: manipulability < 0.03 && Math.abs(angles[2] ?? 1) < 0.05,
      hint: 'Fully straighten the elbow by setting Joint 3 to 0°.',
    },
  ];

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
      {/* Progress Header */}
      <div className="glass-card rounded-lg p-3 flex items-center justify-between border-l-2 border-l-amber-400">
        <div className="flex items-center space-x-2.5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-xs font-semibold text-white font-mono">Robotics Lab Missions</h3>
            <p className="text-[11px] text-slate-400">
              Completed {completedCount} of {challenges.length} missions
            </p>
          </div>
        </div>
        {completedCount === challenges.length && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold animate-bounce">
            <Award className="w-3.5 h-3.5" />
            <span>CERTIFIED!</span>
          </div>
        )}
      </div>

      {/* Challenge List */}
      <div className="space-y-2.5">
        {challenges.map((ch) => (
          <div
            key={ch.id}
            className={`glass-card rounded-lg p-3 space-y-2 border transition-all ${
              ch.completed
                ? 'bg-emerald-950/25 border-emerald-500/30'
                : 'border-white/10 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {ch.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
                <span
                  className={`text-xs font-semibold font-mono ${
                    ch.completed ? 'text-emerald-300' : 'text-slate-200'
                  }`}
                >
                  {ch.title}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">{ch.desc}</p>

            <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
              <span className="text-slate-500">Hint: {ch.hint}</span>
              {ch.action && !ch.completed && (
                <button
                  onClick={ch.action}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 underline font-semibold"
                >
                  <span>Auto-Solve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
