import React from 'react';
import { Robot } from '../../robotics/Robot';
import { degToRad, formatNumber, radToDeg } from '../../utils/mathUtils';
import { RotateCw, CornerDownRight, Zap } from 'lucide-react';

interface JointControlsPanelProps {
  robot: Robot;
  jointAngles: number[];
  unit: 'degrees' | 'radians';
  onSetJointAngle: (index: number, angle: number) => void;
  onSetAllJointAngles: (angles: number[]) => void;
}

export const JointControlsPanel: React.FC<JointControlsPanelProps> = ({
  robot,
  jointAngles,
  unit,
  onSetJointAngle,
  onSetAllJointAngles,
}) => {
  const isDeg = unit === 'degrees';

  // Helper to format values for display
  const formatVal = (rad: number) => {
    return isDeg ? `${formatNumber(radToDeg(rad), 1)}°` : `${formatNumber(rad, 2)} rad`;
  };

  const getSliderValue = (rad: number) => {
    return isDeg ? radToDeg(rad) : rad;
  };

  const handleSliderChange = (index: number, val: number) => {
    const rad = isDeg ? degToRad(val) : val;
    onSetJointAngle(index, rad);
  };

  const handleStep = (index: number, stepDeg: number) => {
    const currentRad = jointAngles[index] ?? 0;
    const deltaRad = degToRad(stepDeg);
    onSetJointAngle(index, currentRad + deltaRad);
  };

  // Preset Poses
  const presets = [
    {
      name: 'Zero Home',
      angles: [0, 0, 0],
    },
    {
      name: 'Upright',
      angles: [0, Math.PI / 2, 0],
    },
    {
      name: 'Extended Forward',
      angles: [0, Math.PI / 6, -Math.PI / 6],
    },
    {
      name: 'Floor Pick',
      angles: [0, -Math.PI / 4, Math.PI / 3],
    },
    {
      name: 'Folded Compact',
      angles: [0, Math.PI / 2, -Math.PI / 2],
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <RotateCw className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Joint Control
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          {robot.dof}-DOF Chain
        </span>
      </div>

      {/* Joint Sliders */}
      <div className="space-y-3.5">
        {robot.joints.map((joint, idx) => {
          const currentAngle = jointAngles[idx] ?? 0;
          const minVal = isDeg ? radToDeg(joint.limits.min) : joint.limits.min;
          const maxVal = isDeg ? radToDeg(joint.limits.max) : joint.limits.max;
          const currentVal = getSliderValue(currentAngle);
          const percent = ((currentAngle - joint.limits.min) / (joint.limits.max - joint.limits.min)) * 100;

          return (
            <div key={joint.id} className="glass-card rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: joint.color || '#00f0ff' }}
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    {joint.name}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 font-mono">
                  <input
                    type="number"
                    value={Number(formatNumber(currentVal, isDeg ? 1 : 3))}
                    step={isDeg ? 1 : 0.05}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value);
                      if (Number.isFinite(num)) {
                        handleSliderChange(idx, num);
                      }
                    }}
                    className="w-20 bg-dark-900 border border-white/10 rounded px-1.5 py-0.5 text-xs text-right text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">{isDeg ? '°' : 'rad'}</span>
                </div>
              </div>

              {/* Slider & Quick +/- Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStep(idx, -5)}
                  className="w-6 h-6 rounded bg-dark-900 border border-white/10 hover:border-cyan-500/50 text-xs font-mono text-slate-300 flex items-center justify-center transition-colors"
                  title="Step -5°"
                >
                  -
                </button>

                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    step={isDeg ? 0.5 : 0.01}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-cyan-400"
                  />
                </div>

                <button
                  onClick={() => handleStep(idx, 5)}
                  className="w-6 h-6 rounded bg-dark-900 border border-white/10 hover:border-cyan-500/50 text-xs font-mono text-slate-300 flex items-center justify-center transition-colors"
                  title="Step +5°"
                >
                  +
                </button>
              </div>

              {/* Min / Max labels & percentage bar */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Min: {formatVal(joint.limits.min)}</span>
                <span className="text-slate-500">{percent.toFixed(0)}%</span>
                <span>Max: {formatVal(joint.limits.max)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Poses Palette */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>PRESET CONFIGURATIONS</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => onSetAllJointAngles(p.angles)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-dark-800/80 hover:bg-dark-750 border border-white/5 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all text-left"
            >
              <CornerDownRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
