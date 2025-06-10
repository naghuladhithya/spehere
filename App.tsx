import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ThreeScene, ShapeControls } from './utils/threeScene';
import { useHandTracking } from './hooks/useHandTracking';
import { CameraView } from './components/CameraView';
import { GestureIndicator } from './components/GestureIndicator';
import { ControlPanel } from './components/ControlPanel';
import { ShapeDisplay } from './components/ShapeDisplay';
import { Zap } from 'lucide-react';

function App() {
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<ThreeScene | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [shapeState, setShapeState] = useState<ShapeControls>({
    shapeType: 'sphere',
    size: 1,
    color: { r: 0, g: 0.8, b: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  });

  const { currentGesture, isInitialized, initializeTracker, processFrame } = useHandTracking();

  // Initialize Three.js scene
  useEffect(() => {
    if (sceneContainerRef.current && !threeSceneRef.current) {
      threeSceneRef.current = new ThreeScene(sceneContainerRef.current);
    }

    const handleResize = () => {
      if (threeSceneRef.current) {
        threeSceneRef.current.handleResize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeSceneRef.current) {
        threeSceneRef.current.dispose();
      }
    };
  }, []);

  // Handle gesture-based shape control
  useEffect(() => {
    if (!threeSceneRef.current || currentGesture.type === 'none') return;

    let newState = { ...shapeState };

    switch (currentGesture.type) {
      case 'open_palm':
        // Show glowing sphere, increase size, shift to red
        newState.shapeType = 'sphere';
        newState.size = Math.min(2.5, shapeState.size + 0.03);
        newState.color = {
          r: Math.min(1, shapeState.color.r + 0.025),
          g: Math.max(0, shapeState.color.g - 0.015),
          b: Math.max(0, shapeState.color.b - 0.015)
        };
        break;

      case 'closed_fist':
        // Show glowing cube, shrink size, shift to blue
        newState.shapeType = 'cube';
        newState.size = Math.max(0.6, shapeState.size - 0.025);
        newState.color = {
          r: Math.max(0, shapeState.color.r - 0.015),
          g: Math.max(0, shapeState.color.g - 0.015),
          b: Math.min(1, shapeState.color.b + 0.025)
        };
        break;

      case 'pointing':
        // Show glowing cone, stable size, rotate
        newState.shapeType = 'cone';
        newState.size = 1.2; // Keep stable size
        newState.color = {
          r: Math.max(0, shapeState.color.r - 0.01),
          g: Math.min(1, shapeState.color.g + 0.02),
          b: Math.max(0, shapeState.color.b - 0.01)
        };
        newState.rotation = {
          x: shapeState.rotation.x + 0.08,
          y: shapeState.rotation.y + 0.05,
          z: shapeState.rotation.z + 0.03
        };
        break;
    }

    setShapeState(newState);
    threeSceneRef.current.updateControls(newState);
  }, [currentGesture, shapeState]);

  const handleToggleTracking = useCallback(async () => {
    if (!isTracking) {
      if (!isInitialized) {
        await initializeTracker();
      }
      setIsTracking(true);
    } else {
      setIsTracking(false);
    }
  }, [isTracking, isInitialized, initializeTracker]);

  const handleCameraFrame = useCallback((video: HTMLVideoElement) => {
    if (isTracking) {
      processFrame(video);
    }
  }, [isTracking, processFrame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      {/* Three.js Scene Container */}
      <div ref={sceneContainerRef} className="absolute inset-0 z-0" />

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Morphic Shapes
            </h1>
          </div>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Control dynamic 3D shapes with hand gestures. Open palm creates a growing red sphere, 
            closed fist forms a shrinking blue cube, and pointing generates a rotating green cone.
          </p>
        </header>

        {/* Control Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Camera Feed */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                Camera Feed
              </h3>
              <CameraView 
                onFrame={handleCameraFrame}
                isActive={isTracking}
              />
            </div>

            {/* Gesture Status */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Gesture Detection</h3>
              <GestureIndicator 
                currentGesture={currentGesture.type}
                confidence={currentGesture.confidence}
              />
            </div>

            {/* Shape Display */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Current Shape</h3>
              <ShapeDisplay 
                shapeType={shapeState.shapeType}
                size={shapeState.size}
                color={shapeState.color}
              />
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              <ControlPanel
                isTracking={isTracking}
                onToggleTracking={handleToggleTracking}
                shapeState={shapeState}
              />
            </div>
          </div>
        </div>

        {/* Enhanced gesture guide */}
        <div className="fixed bottom-4 left-4 right-4 lg:hidden">
          <div className="backdrop-blur-md bg-black/50 rounded-xl p-4 border border-white/20">
            <div className="text-center">
              <p className="text-white text-sm font-medium mb-2">
                {isTracking ? 'Show gestures to control shapes' : 'Tap "Start Tracking" to begin'}
              </p>
              {isTracking && (
                <div className="flex justify-center gap-4 text-xs text-gray-300">
                  <span>🖐️ → 🔴 Sphere</span>
                  <span>✊ → 🔵 Cube</span>
                  <span>☝️ → 🟢 Cone</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance indicator */}
        <div className="fixed top-4 right-4 backdrop-blur-md bg-black/30 rounded-lg px-3 py-2 border border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-white">
              {isTracking ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;