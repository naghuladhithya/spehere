import { useState, useCallback, useRef } from 'react';
import { HandTracker, GestureData } from '../utils/handTracking';

export const useHandTracking = () => {
  const [currentGesture, setCurrentGesture] = useState<GestureData>({
    type: 'none',
    confidence: 0,
    landmarks: []
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const handTrackerRef = useRef<HandTracker | null>(null);

  const initializeTracker = useCallback(async () => {
    try {
      const tracker = new HandTracker((gesture) => {
        setCurrentGesture(gesture);
      });
      
      await tracker.initialize();
      handTrackerRef.current = tracker;
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize hand tracker:', error);
    }
  }, []);

  const processFrame = useCallback(async (videoElement: HTMLVideoElement) => {
    if (handTrackerRef.current && isInitialized) {
      try {
        await handTrackerRef.current.processFrame(videoElement);
      } catch (error) {
        console.error('Error processing frame:', error);
      }
    }
  }, [isInitialized]);

  return {
    currentGesture,
    isInitialized,
    initializeTracker,
    processFrame
  };
};