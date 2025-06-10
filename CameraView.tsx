import React, { useRef, useEffect, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';

interface CameraViewProps {
  onFrame: (video: HTMLVideoElement) => void;
  isActive: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onFrame, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!videoRef.current || !isActive) return;

    const initCamera = async () => {
      try {
        const cameraInstance = new Camera(videoRef.current!, {
          onFrame: async () => {
            if (videoRef.current) {
              onFrame(videoRef.current);
            }
          },
          width: 640,
          height: 480,
        });

        await cameraInstance.start();
        setCamera(cameraInstance);
        setError('');
      } catch (err) {
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        console.error('Camera initialization error:', err);
      }
    };

    initCamera();

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [isActive, onFrame]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-auto rounded-lg shadow-lg transform -scale-x-100"
        style={{ maxWidth: '300px' }}
        playsInline
        muted
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
          <p className="text-red-400 text-sm text-center px-4">{error}</p>
        </div>
      )}
    </div>
  );
};