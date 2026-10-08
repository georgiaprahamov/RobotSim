import type { TrajectoryInterpolationType, TrajectoryPlan } from '../../robotics/types';
import { formatNumber } from '../../utils/mathUtils';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Route,
  Activity,
} from 'lucide-react';

interface TrajectoryControlsPanelProps {
  plan: TrajectoryPlan | null;
  duration: number;
  interpolation: TrajectoryInterpolationType;
  isPlaying: boolean;
  currentTime: number;
  onGenerateTrajectory: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onScrub: (time: number) => void;
  onSetDuration: (duration: number) => void;
  onSetInterpolation: (type: TrajectoryInterpolationType) => void;
}

export const TrajectoryControlsPanel: React.FC<TrajectoryControlsPanelProps> = ({
  plan,
  duration,
  interpolation,
  isPlaying,
  currentTime,
  onGenerateTrajectory,
  onPlay,
  onPause,
  onReset,
  onScrub,
  onSetDuration,
  onSetInterpolation,
}) => {
  const interpOptions: { id: TrajectoryInterpolationType; label: string; desc: string }[] = [
    { id: 'joint_quintic', label: 'Quintic Polynomial', desc: 'Smooth C² continuity (zero initial/final accel)' },
    { id: 'cartesian_linear', label: 'Cartesian Linear', desc: 'Straight-line tool center point in 3D' },
    { id: 'joint_cubic', label: 'Cubic Spline', desc: 'Smooth C¹ continuity (zero initial/final vel)' },
    { id: 'trapezoidal', label: 'Trapezoidal Profile', desc: 'Linear with Parabolic Blends (LSPB)' },
  ];

  const totalDist = plan
    ? plan.startPosition.distanceTo(plan.targetPosition)
    : 0;

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Route className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Trajectory Planning
          </h2>
        </div>
        <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          Motion Profile
        </span>
      </div>

      {/* Interpolation Mode Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-300">Interpolation Profile:</label>
        <div className="space-y-1.5">
          {interpOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSetInterpolation(opt.id)}
              className={`w-full p-2 rounded-lg text-left border transition-all flex flex-col ${
                interpolation === opt.id
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                  : 'glass-card text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] text-slate-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Slider */}
      <div className="glass-card rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300">Move Duration:</span>
          <span className="text-purple-300 font-semibold">{duration.toFixed(1)} s</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={10.0}
          step={0.5}
          value={duration}
          onChange={(e) => onSetDuration(parseFloat(e.target.value))}
          className="w-full accent-purple-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>0.5 s (Fast)</span>
          <span>10.0 s (Slow)</span>
        </div>
      </div>

      {/* Generate Trajectory Action */}
      <button
        onClick={onGenerateTrajectory}
        className="w-full py-2 rounded-lg font-mono text-xs font-semibold flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span>GENERATE TRAJECTORY</span>
      </button>

      {/* Playback Controls & Timeline Scrubber */}
      {plan && (
        <div className="glass-card rounded-lg p-3 space-y-3 border border-purple-500/20">
          {/* Time and Distance stats */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Timeline:</span>
            <span className="text-cyan-300">
              {formatNumber(currentTime, 2)}s / {formatNumber(plan.duration, 2)}s
            </span>
          </div>

          {/* Scrubber Bar */}
          <input
            type="range"
            min={0}
            max={plan.duration}
            step={0.02}
            value={currentTime}
            onChange={(e) => onScrub(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center space-x-1 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-white/10 text-slate-300 text-xs font-mono flex items-center justify-center space-x-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onPlay}
              className="py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center justify-center space-x-1 transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          </div>

          {/* Trajectory Details Badge */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Path Length:</span>
            <span className="text-slate-200">{totalDist.toFixed(3)} m</span>
          </div>
        </div>
      )}
    </div>
  );
};
