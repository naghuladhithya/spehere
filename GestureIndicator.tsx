import React from 'react';
import { Hand, Zap, RotateCcw, Circle, Box, Triangle } from 'lucide-react';
import { GestureType } from '../utils/handTracking';

interface GestureIndicatorProps {
  currentGesture: GestureType;
  confidence: number;
}

export const GestureIndicator: React.FC<GestureIndicatorProps> = ({ currentGesture, confidence }) => {
  const getGestureInfo = (gesture: GestureType) => {
    switch (gesture) {
      case 'open_palm':
        return {
          icon: Circle,
          handIcon: '🖐️',
          label: 'Open Palm',
          description: 'Creating glowing red sphere',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          shape: 'Sphere'
        };
      case 'closed_fist':
        return {
          icon: Box,
          handIcon: '✊',
          label: 'Closed Fist',
          description: 'Forming shrinking blue cube',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          shape: 'Cube'
        };
      case 'pointing':
        return {
          icon: Triangle,
          handIcon: '☝️',
          label: 'Pointing',
          description: 'Spinning green cone',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          shape: 'Cone'
        };
      default:
        return {
          icon: Hand,
          handIcon: '✋',
          label: 'No Gesture',
          description: 'Show your hand to the camera',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          shape: 'None'
        };
    }
  };

  const gestureInfo = getGestureInfo(currentGesture);
  const Icon = gestureInfo.icon;

  return (
    <div className={`backdrop-blur-md bg-white/10 rounded-xl p-6 border ${gestureInfo.borderColor} ${gestureInfo.bgColor} transition-all duration-300 transform hover:scale-105`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-lg ${gestureInfo.bgColor} opacity-60 animate-pulse`} />
          <div className="relative text-3xl">{gestureInfo.handIcon}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{gestureInfo.label}</h3>
          <p className="text-gray-300 text-sm">{gestureInfo.description}</p>
        </div>
        <Icon className={`w-8 h-8 ${gestureInfo.color}`} />
      </div>
      
      {/* Shape Indicator */}
      <div className="flex items-center justify-between mb-4 p-3 bg-black/30 rounded-lg">
        <span className="text-gray-300 text-sm">Target Shape:</span>
        <span className={`font-bold ${gestureInfo.color}`}>{gestureInfo.shape}</span>
      </div>

      {/* Confidence Meter */}
      {currentGesture !== 'none' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Detection Confidence</span>
            <span className={`font-bold ${gestureInfo.color}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                gestureInfo.color.includes('red') ? 'bg-gradient-to-r from-red-500 to-red-400' :
                gestureInfo.color.includes('blue') ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 
                gestureInfo.color.includes('green') ? 'bg-gradient-to-r from-green-500 to-green-400' :
                'bg-gradient-to-r from-gray-500 to-gray-400'
              }`}
              style={{ 
                width: `${confidence * 100}%`,
                boxShadow: `0 0 10px ${gestureInfo.color.includes('red') ? '#ef4444' : 
                                      gestureInfo.color.includes('blue') ? '#3b82f6' : 
                                      gestureInfo.color.includes('green') ? '#10b981' : '#6b7280'}40`
              }}
            />
          </div>
          
          {/* Confidence Status */}
          <div className="text-center">
            <span className={`text-xs px-3 py-1 rounded-full ${
              confidence > 0.8 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              confidence > 0.6 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {confidence > 0.8 ? 'Excellent' : confidence > 0.6 ? 'Good' : 'Weak'} Detection
            </span>
          </div>
        </div>
      )}

      {/* No gesture state */}
      {currentGesture === 'none' && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm mb-2">Waiting for gesture...</div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}
    </div>
  );
};