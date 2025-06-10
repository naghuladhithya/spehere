import React from 'react';
import { Box, Circle, Triangle } from 'lucide-react';

interface ShapeDisplayProps {
  shapeType: 'sphere' | 'cube' | 'cone';
  size: number;
  color: { r: number; g: number; b: number };
}

export const ShapeDisplay: React.FC<ShapeDisplayProps> = ({ shapeType, size, color }) => {
  const getShapeInfo = (shape: 'sphere' | 'cube' | 'cone') => {
    switch (shape) {
      case 'sphere':
        return {
          icon: Circle,
          name: 'Sphere',
          description: 'Glowing orb of energy',
          gesture: '🖐️ Open Palm',
          colorName: 'Red Spectrum'
        };
      case 'cube':
        return {
          icon: Box,
          name: 'Cube',
          description: 'Crystalline structure',
          gesture: '✊ Closed Fist',
          colorName: 'Blue Spectrum'
        };
      case 'cone':
        return {
          icon: Triangle,
          name: 'Cone',
          description: 'Rotating pyramid',
          gesture: '☝️ Pointing',
          colorName: 'Green Spectrum'
        };
    }
  };

  const shapeInfo = getShapeInfo(shapeType);
  const Icon = shapeInfo.icon;
  
  const rgbColor = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
  const glowColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, 0.3)`;

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 transition-all duration-500">
      <div className="text-center space-y-4">
        {/* Shape Icon with Glow */}
        <div className="relative flex justify-center">
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse"
            style={{ 
              backgroundColor: glowColor,
              transform: `scale(${1 + size * 0.3})`
            }}
          />
          <Icon 
            className="relative w-16 h-16 transition-all duration-500"
            style={{ 
              color: rgbColor,
              transform: `scale(${0.8 + size * 0.4})`,
              filter: `drop-shadow(0 0 20px ${rgbColor})`
            }}
          />
        </div>

        {/* Shape Info */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{shapeInfo.name}</h3>
          <p className="text-gray-300 text-sm">{shapeInfo.description}</p>
          <div className="text-xs text-gray-400">{shapeInfo.gesture}</div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <div className="bg-black/30 rounded-lg p-3">
            <h4 className="text-gray-300 text-xs font-medium mb-1">Size</h4>
            <div className="text-white font-bold text-lg">{size.toFixed(2)}</div>
            <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
              <div 
                className="h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((size / 3) * 100, 100)}%`,
                  backgroundColor: rgbColor
                }}
              />
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3">
            <h4 className="text-gray-300 text-xs font-medium mb-1">Color</h4>
            <div className="text-white font-bold text-xs mb-1">{shapeInfo.colorName}</div>
            <div 
              className="w-full h-6 rounded border border-white/20 transition-all duration-300"
              style={{ 
                backgroundColor: rgbColor,
                boxShadow: `0 0 10px ${glowColor}`
              }}
            />
          </div>
        </div>

        {/* Color Values */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-red-500/20 rounded p-2 border border-red-500/30">
            <div className="text-red-300 font-medium">R</div>
            <div className="text-white">{Math.round(color.r * 255)}</div>
          </div>
          <div className="bg-green-500/20 rounded p-2 border border-green-500/30">
            <div className="text-green-300 font-medium">G</div>
            <div className="text-white">{Math.round(color.g * 255)}</div>
          </div>
          <div className="bg-blue-500/20 rounded p-2 border border-blue-500/30">
            <div className="text-blue-300 font-medium">B</div>
            <div className="text-white">{Math.round(color.b * 255)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};