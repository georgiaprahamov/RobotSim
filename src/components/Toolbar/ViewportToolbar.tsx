import type { ViewportVisibility } from '../../simulation/SimulationState';
import {
  Eye,
  Grid,
  Crosshair,
  Route,
  Ghost,
  Camera,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ViewportToolbarProps {
  visibility: ViewportVisibility;
  onToggleVisibility: (key: keyof ViewportVisibility) => void;
  onCameraPreset: (preset: 'iso' | 'top' | 'front' | 'side') => void;
  onResetCamera: () => void;
}

export const ViewportToolbar: React.FC<ViewportToolbarProps> = ({
  visibility,
  onToggleVisibility,
  onCameraPreset,
  onResetCamera,
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2 select-none">
      {/* Camera Presets Card */}
      <div className="glass-panel rounded-xl p-1.5 flex items-center space-x-1 border border-white/10 shadow-lg">
        <div className="px-2 text-[10px] font-mono text-slate-400 flex items-center space-x-1 border-r border-white/10 pr-2">
          <Camera className="w-3 h-3 text-cyan-400" />
          <span>VIEW</span>
        </div>
        <button
          onClick={() => onCameraPreset('iso')}
          className="px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
          title="Isometric 3D View"
        >
          ISO
        </button>
        <button
          onClick={() => onCameraPreset('top')}
          className="px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
          title="Top View (XZ Plane)"
        >
          TOP
        </button>
        <button
          onClick={() => onCameraPreset('front')}
          className="px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
          title="Front View (XY Plane)"
        >
          FRONT
        </button>
        <button
          onClick={() => onCameraPreset('side')}
          className="px-2 py-1 rounded text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
          title="Side View (YZ Plane)"
        >
          SIDE
        </button>
        <button
          onClick={onResetCamera}
          className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visibility Toggles Card */}
      <div className="glass-panel rounded-xl p-1.5 flex items-center space-x-1 border border-white/10 shadow-lg">
        <div className="px-2 text-[10px] font-mono text-slate-400 flex items-center space-x-1 border-r border-white/10 pr-2">
          <Eye className="w-3 h-3 text-cyan-400" />
          <span>LAYERS</span>
        </div>

        {/* Grid Floor */}
        <button
          onClick={() => onToggleVisibility('grid')}
          className={`p-1.5 rounded transition-all ${
            visibility.grid ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Floor Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Joint Axes */}
        <button
          onClick={() => onToggleVisibility('jointAxes')}
          className={`px-2 py-1 rounded text-xs font-mono transition-all ${
            visibility.jointAxes ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Joint Frames (XYZ)"
        >
          Axes
        </button>

        {/* Target Marker */}
        <button
          onClick={() => onToggleVisibility('targetMarker')}
          className={`p-1.5 rounded transition-all ${
            visibility.targetMarker ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Target Marker Reticle"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        {/* Trajectory Curve */}
        <button
          onClick={() => onToggleVisibility('trajectoryPath')}
          className={`p-1.5 rounded transition-all ${
            visibility.trajectoryPath ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Trajectory Path Line"
        >
          <Route className="w-3.5 h-3.5" />
        </button>

        {/* Ghost IK Robot */}
        <button
          onClick={() => onToggleVisibility('ghostRobotIK')}
          className={`p-1.5 rounded transition-all ${
            visibility.ghostRobotIK ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Ghost IK Preview"
        >
          <Ghost className="w-3.5 h-3.5" />
        </button>

        {/* Workspace Envelope */}
        <button
          onClick={() => onToggleVisibility('workspacePointCloud')}
          className={`p-1.5 rounded transition-all ${
            visibility.workspacePointCloud ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Reachable Workspace Envelope"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
