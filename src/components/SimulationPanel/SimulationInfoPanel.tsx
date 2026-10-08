import React from 'react';
import type { SimulationState } from '../../simulation/SimulationState';
import { formatNumber, radToDeg } from '../../utils/mathUtils';
import { Activity, Gauge, Cpu, Target, CheckCircle2, AlertOctagon } from 'lucide-react';

interface SimulationInfoPanelProps {
  state: SimulationState;
}

export const SimulationInfoPanel: React.FC<SimulationInfoPanelProps> = ({ state }) => {
  const isDeg = state.unit === 'degrees';
  const ee = state.pose.endEffectorPosition;
  const orient = state.pose.endEffectorOrientation;
  const metrics = state.metrics;

  const formatAngle = (rad: number) => {
    return isDeg ? `${formatNumber(radToDeg(rad), 1)}°` : `${formatNumber(rad, 3)} rad`;
  };

  const manipulability = state.metrics.manipulability;
  const isSingular = manipulability < 0.05;

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            Simulation Telemetry
          </h2>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {metrics.fps} FPS
          </span>
        </div>
      </div>

      {/* End Effector Pose Card */}
      <div className="glass-card rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
          <span className="flex items-center space-x-1.5 font-semibold">
            <Target className="w-3.5 h-3.5" />
            <span>End-Effector (TCP) Position</span>
          </span>
        </div>

        {/* X, Y, Z Grid */}
        <div className="grid grid-cols-3 gap-2 font-mono">
          <div className="bg-dark-900/80 rounded p-2 text-center border border-red-500/20">
            <span className="text-[10px] text-red-400 block font-semibold">X (m)</span>
            <span className="text-xs font-bold text-white">{formatNumber(ee.x, 3)}</span>
          </div>
          <div className="bg-dark-900/80 rounded p-2 text-center border border-green-500/20">
            <span className="text-[10px] text-green-400 block font-semibold">Y (m)</span>
            <span className="text-xs font-bold text-white">{formatNumber(ee.y, 3)}</span>
          </div>
          <div className="bg-dark-900/80 rounded p-2 text-center border border-blue-500/20">
            <span className="text-[10px] text-blue-400 block font-semibold">Z (m)</span>
            <span className="text-xs font-bold text-white">{formatNumber(ee.z, 3)}</span>
          </div>
        </div>

        {/* Orientation RPY */}
        <div className="pt-2 border-t border-white/5 space-y-1 text-xs font-mono">
          <span className="text-[10px] text-slate-400 uppercase">Orientation (Euler RPY):</span>
          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-300">
            <div>Roll: <span className="text-cyan-300">{formatAngle(orient.roll)}</span></div>
            <div>Pitch: <span className="text-cyan-300">{formatAngle(orient.pitch)}</span></div>
            <div>Yaw: <span className="text-cyan-300">{formatAngle(orient.yaw)}</span></div>
          </div>
        </div>
      </div>

      {/* Joint State Telemetry */}
      <div className="glass-card rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Joint Angles State</span>
          </span>
        </div>

        <div className="space-y-2">
          {state.robot.joints.map((j, i) => {
            const ang = state.jointAngles[i] ?? 0;
            const pct = ((ang - j.limits.min) / (j.limits.max - j.limits.min)) * 100;

            return (
              <div key={j.id} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{j.name}:</span>
                  <span className="text-cyan-300 font-semibold">{formatAngle(ang)}</span>
                </div>
                <div className="w-full bg-dark-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: j.color || '#00f0ff',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kinematics Diagnostics & Manipulability */}
      <div className="glass-card rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span>Kinematic Diagnostics</span>
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Yoshikawa Manipulability:</span>
            <span className={`font-semibold ${isSingular ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatNumber(manipulability, 3)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Singularity Status:</span>
            {isSingular ? (
              <span className="flex items-center space-x-1 text-rose-400">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Singular</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nominal</span>
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Target Distance:</span>
            <span className="text-cyan-300 font-semibold">
              {(metrics.distanceToTarget * 100).toFixed(1)} cm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
