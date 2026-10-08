import React from 'react';
import { AVAILABLE_ROBOTS } from '../../robots';
import { Bot, RefreshCw, Layers, Compass, BookOpen, Activity, Play } from 'lucide-react';

interface AppHeaderProps {
  currentRobotId: string;
  onSelectRobot: (id: string) => void;
  unit: 'degrees' | 'radians';
  onToggleUnit: (unit: 'degrees' | 'radians') => void;
  activePanel: 'control' | 'target' | 'trajectory' | 'education' | 'info';
  onSelectPanel: (panel: 'control' | 'target' | 'trajectory' | 'education' | 'info') => void;
  onResetToHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentRobotId,
  onSelectRobot,
  unit,
  onToggleUnit,
  activePanel,
  onSelectPanel,
  onResetToHome,
}) => {
  return (
    <header className="h-14 bg-dark-900/90 border-b border-white/10 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px] shadow-glow-blue">
          <div className="w-full h-full bg-dark-900 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-tight text-white font-mono text-base">
              ROBOT<span className="text-cyan-400">SIM</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v1.0 LAB
            </span>
          </div>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center bg-dark-800/80 rounded-lg p-1 border border-white/5 shadow-inner">
        <button
          onClick={() => onSelectPanel('control')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activePanel === 'control'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Joint Control</span>
        </button>

        <button
          onClick={() => onSelectPanel('target')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activePanel === 'target'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>IK Target</span>
        </button>

        <button
          onClick={() => onSelectPanel('trajectory')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activePanel === 'trajectory'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Trajectory</span>
        </button>

        <button
          onClick={() => onSelectPanel('education')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activePanel === 'education'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>Educational Lab</span>
        </button>

        <button
          onClick={() => onSelectPanel('info')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activePanel === 'info'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Telemetry</span>
        </button>
      </nav>

      {/* Right Controls: Robot Selector, Unit Switch, Reset */}
      <div className="flex items-center space-x-3">
        {/* Robot Model Selector Dropdown */}
        <div className="flex items-center space-x-1.5 bg-dark-800/80 rounded-lg px-2.5 py-1 border border-white/10">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Robot:</span>
          <select
            value={currentRobotId}
            onChange={(e) => onSelectRobot(e.target.value)}
            className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer"
          >
            {AVAILABLE_ROBOTS.map((r) => (
              <option key={r.id} value={r.id} className="bg-dark-900 text-slate-200">
                {r.name} ({r.dof}-DOF)
              </option>
            ))}
          </select>
        </div>

        {/* Deg / Rad Toggle */}
        <div className="flex items-center bg-dark-800 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => onToggleUnit('degrees')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              unit === 'degrees' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DEG
          </button>
          <button
            onClick={() => onToggleUnit('radians')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              unit === 'radians' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RAD
          </button>
        </div>

        {/* Reset Home Button */}
        <button
          onClick={onResetToHome}
          title="Reset to Zero/Home Position"
          className="p-1.5 rounded-lg bg-dark-800 text-slate-400 hover:text-cyan-400 hover:bg-dark-750 border border-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
