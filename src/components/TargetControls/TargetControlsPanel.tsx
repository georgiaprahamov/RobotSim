import type { Vector3 } from '../../math/Vector';
import type { IKSolution } from '../../robotics/types';
import { formatNumber, radToDeg } from '../../utils/mathUtils';
import {
  Crosshair,
  Shuffle,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
} from 'lucide-react';

interface TargetControlsPanelProps {
  targetPosition: Vector3;
  ikSolution: IKSolution | null;
  ikConfig: 'any' | 'elbow_up' | 'elbow_down';
  autoSolveIK: boolean;
  unit: 'degrees' | 'radians';
  onSetTargetPosition: (pos: Vector3) => void;
  onSolveAndApplyIK: () => void;
  onSetIKConfig: (config: 'any' | 'elbow_up' | 'elbow_down') => void;
  onToggleAutoSolveIK: () => void;
  onRandomizeTarget: () => void;
}

export const TargetControlsPanel: React.FC<TargetControlsPanelProps> = ({
  targetPosition,
  ikSolution,
  ikConfig,
  autoSolveIK,
  unit,
  onSetTargetPosition,
  onSolveAndApplyIK,
  onSetIKConfig,
  onToggleAutoSolveIK,
  onRandomizeTarget,
}) => {
  const isDeg = unit === 'degrees';

  const handleCoordinateChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!Number.isFinite(value)) return;
    const next = targetPosition.clone();
    next[axis] = value;
    onSetTargetPosition(next);
  };

  const handleStep = (axis: 'x' | 'y' | 'z', delta: number) => {
    const next = targetPosition.clone();
    next[axis] = Number((next[axis] + delta).toFixed(2));
    onSetTargetPosition(next);
  };

  const formatAngle = (rad: number) => {
    return isDeg ? `${formatNumber(radToDeg(rad), 1)}°` : `${formatNumber(rad, 3)} rad`;
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Inverse Kinematics
          </h2>
        </div>
        <button
          onClick={onRandomizeTarget}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[11px] font-mono text-cyan-300 border border-cyan-500/30 transition-colors"
          title="Generate reachable random target"
        >
          <Shuffle className="w-3 h-3" />
          <span>Random</span>
        </button>
      </div>

      {/* Target Coordinates X, Y, Z */}
      <div className="space-y-2.5">
        {(['x', 'y', 'z'] as const).map((axis) => {
          const axisColors = {
            x: 'border-l-red-500 text-red-400',
            y: 'border-l-green-500 text-green-400',
            z: 'border-l-blue-500 text-blue-400',
          };

          return (
            <div
              key={axis}
              className={`glass-card rounded-lg p-2.5 flex items-center justify-between border-l-2 ${axisColors[axis]}`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase">{axis} (m)</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleStep(axis, -0.1)}
                  className="w-6 h-6 rounded bg-dark-900 border border-white/10 hover:border-cyan-500 text-xs font-mono text-slate-300 flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.05"
                  value={Number(formatNumber(targetPosition[axis], 2))}
                  onChange={(e) => handleCoordinateChange(axis, parseFloat(e.target.value))}
                  className="w-24 bg-dark-900 border border-white/10 rounded px-2 py-0.5 text-xs text-right text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={() => handleStep(axis, 0.1)}
                  className="w-6 h-6 rounded bg-dark-900 border border-white/10 hover:border-cyan-500 text-xs font-mono text-slate-300 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration & Auto-Solve Settings */}
      <div className="glass-card rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Elbow Solution</span>
          </span>

          <div className="flex items-center bg-dark-900 rounded-lg p-0.5 border border-white/10">
            {(['any', 'elbow_up', 'elbow_down'] as const).map((cfg) => (
              <button
                key={cfg}
                onClick={() => onSetIKConfig(cfg)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                  ikConfig === cfg
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cfg === 'any' ? 'Auto' : cfg === 'elbow_up' ? 'Up' : 'Down'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Auto-Solve Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs text-slate-300">Live Auto-Solve</span>
          <button
            onClick={onToggleAutoSolveIK}
            className="flex items-center space-x-1 text-xs font-mono transition-colors"
          >
            {autoSolveIK ? (
              <ToggleRight className="w-6 h-6 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* IK Solution Card */}
      {ikSolution && (
        <div
          className={`rounded-lg p-3 space-y-2 border backdrop-blur-md transition-all ${
            ikSolution.success
              ? 'bg-emerald-950/30 border-emerald-500/30'
              : 'bg-rose-950/40 border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              {ikSolution.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
              <span
                className={`text-xs font-mono font-semibold ${
                  ikSolution.success ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {ikSolution.success ? 'IK Solution Found' : 'Target Unreachable'}
              </span>
            </div>

            {ikSolution.configuration && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                {ikSolution.configuration.replace('_', ' ')}
              </span>
            )}
          </div>

          {ikSolution.success ? (
            <div className="space-y-1.5 font-mono text-xs">
              <div className="grid grid-cols-3 gap-1 pt-1">
                {ikSolution.jointAngles.map((ang, i) => (
                  <div key={i} className="bg-dark-900/60 rounded p-1.5 text-center border border-white/5">
                    <span className="text-[10px] text-slate-400 block">θ{i + 1}</span>
                    <span className="text-cyan-300 font-semibold">{formatAngle(ang)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Distance error:</span>
                <span className="text-emerald-400 font-medium">
                  {(ikSolution.distanceToTarget * 1000).toFixed(1)} mm
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-300/90 leading-relaxed font-sans">
              {ikSolution.error || 'The requested point is outside robot reach.'}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-1">
        <button
          onClick={onSolveAndApplyIK}
          disabled={!ikSolution?.success}
          className={`w-full py-2 rounded-lg font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md ${
            ikSolution?.success
              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black hover:opacity-95 shadow-glow-blue'
              : 'bg-dark-800 text-slate-500 border border-white/5 cursor-not-allowed'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>APPLY IK SOLUTION</span>
        </button>
      </div>
    </div>
  );
};
