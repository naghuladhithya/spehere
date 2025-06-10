declare module '@mediapipe/hands' {
  export interface Results {
    multiHandLandmarks: Array<Array<{x: number, y: number, z: number}>>;
    multiHandedness: Array<{classification: Array<{score: number, label: string}>}>;
  }

  export class Hands {
    constructor(config: {locateFile: (path: string) => string});
    setOptions(options: {
      maxNumHands: number;
      modelComplexity: number;
      minDetectionConfidence: number;
      minTrackingConfidence: number;
    }): void;
    onResults(callback: (results: Results) => void): void;
    send(data: {image: HTMLVideoElement | HTMLCanvasElement}): Promise<void>;
    initialize(): Promise<void>;
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, config: {
      onFrame: () => Promise<void>;
      width: number;
      height: number;
    });
    start(): Promise<void>;
    stop(): void;
  }
}