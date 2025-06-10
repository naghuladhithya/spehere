import React from 'react';
import { Play, Pause, Camera, Settings, Shapes } from 'lucide-react';
import { ShapeControls } from '../utils/threeScene';

interface ControlPanelProps {
  isTracking: boolean;
  onToggleTracking: () => void;
  shapeState: ShapeControls;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isTracking,
  onToggleTracking,
  shapeState
}) => {
  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Controls</h2>
      </div>

      <div className="space-y-6">
        {/* Main Control Button */}
        <button
          onClick={onToggleTracking}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
            isTracking
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
          }`}
        >
          {isTracking ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>

        {/* Status Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 text-sm">Camera Status</span>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isTracking 
                ? 'text-green-300 bg-green-500/20 border border-green-500/30' 
                : 'text-gray-400 bg-gray-500/20 border border-gray-500/30'
            }`}>
              {isTracking ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Shapes className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 text-sm">Current Shape</span>
            </div>
            <span className="text-white font-medium capitalize">
              {shapeState.shapeType}
            </span>
          </div>
        </div>

        {/* Gesture Guide */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <span>Gesture Controls</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🖐️</span>
                <div>
                  <div className="text-white font-medium text-sm">Open Palm</div>
                  <div className="text-red-300 text-xs">Growing Red Sphere</div>
                </div>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✊</span>
                <div>
                  <div className="text-white font-medium text-sm">Closed Fist</div>
                  <div className="text-blue-300 text-xs">Shrinking Blue Cube</div>
                </div>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">☝️</span>
                <div>
                  <div className="text-white font-medium text-sm">Pointing</div>
                  <div className="text-green-300 text-xs">Rotating Green Cone</div>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-2">Tips</h4>
          <div className="space-y-1 text-xs text-gray-400">
            <div>• Hold gestures steady for best results</div>
            <div>• Ensure good lighting for tracking</div>
            <div>• Keep hand centered in camera view</div>
          </div>
        </div>
      </div>
    </div>
  );
};