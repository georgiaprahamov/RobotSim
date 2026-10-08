import React, { useState } from 'react';
import type { SimulationState } from '../../simulation/SimulationState';
import { ForwardKinematicsTheory } from './ForwardKinematicsTheory';
import { InverseKinematicsTheory } from './InverseKinematicsTheory';
import { JacobianTheory } from './JacobianTheory';
import { InteractiveChallenges } from './InteractiveChallenges';
import { BookOpen, Compass, Layers, Activity, Trophy } from 'lucide-react';
import { Vector3 } from '../../math/Vector';

interface EducationalLabProps {
  state: SimulationState;
  onSetTarget: (target: Vector3) => void;
  onSolveIK: () => void;
}

export const EducationalLab: React.FC<EducationalLabProps> = ({ state, onSetTarget, onSolveIK }) => {
  const [activeTab, setActiveTab] = useState<'fk' | 'ik' | 'jacobian' | 'challenges'>('fk');

  return (
    <div className="flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Robotics Theory & Lab
          </h2>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-dark-900 rounded-lg border border-white/5 font-mono text-[11px]">
        <button
          onClick={() => setActiveTab('fk')}
          className={`py-1.5 rounded flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'fk'
              ? 'bg-purple-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>FK</span>
        </button>

        <button
          onClick={() => setActiveTab('ik')}
          className={`py-1.5 rounded flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'ik'
              ? 'bg-purple-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>IK</span>
        </button>

        <button
          onClick={() => setActiveTab('jacobian')}
          className={`py-1.5 rounded flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'jacobian'
              ? 'bg-purple-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Jacobian</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`py-1.5 rounded flex items-center justify-center space-x-1 transition-all ${
            activeTab === 'challenges'
              ? 'bg-purple-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Trophy className="w-3 h-3 text-amber-300" />
          <span>Missions</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {activeTab === 'fk' && <ForwardKinematicsTheory state={state} />}
        {activeTab === 'ik' && <InverseKinematicsTheory state={state} />}
        {activeTab === 'jacobian' && <JacobianTheory state={state} />}
        {activeTab === 'challenges' && (
          <InteractiveChallenges state={state} onSetTarget={onSetTarget} onSolveIK={onSolveIK} />
        )}
      </div>
    </div>
  );
};
