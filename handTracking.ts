import { Hands, Results } from '@mediapipe/hands';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type GestureType = 'open_palm' | 'closed_fist' | 'pointing' | 'none';

export interface GestureData {
  type: GestureType;
  confidence: number;
  landmarks: HandLandmark[];
}

export class HandTracker {
  private hands: Hands;
  private onResults: (gesture: GestureData) => void;
  private gestureHistory: GestureType[] = [];
  private readonly historySize = 5;

  constructor(onResults: (gesture: GestureData) => void) {
    this.onResults = onResults;
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });
    
    this.setupHands();
  }

  private setupHands() {
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults((results: Results) => {
      this.processResults(results);
    });
  }

  private processResults(results: Results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const gesture = this.recognizeGesture(landmarks);
      const stabilizedGesture = this.stabilizeGesture(gesture);
      this.onResults(stabilizedGesture);
    } else {
      this.onResults({
        type: 'none',
        confidence: 0,
        landmarks: []
      });
    }
  }

  private stabilizeGesture(gesture: GestureData): GestureData {
    // Add current gesture to history
    this.gestureHistory.push(gesture.type);
    if (this.gestureHistory.length > this.historySize) {
      this.gestureHistory.shift();
    }

    // Find most common gesture in recent history
    const gestureCounts = this.gestureHistory.reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {} as Record<GestureType, number>);

    const mostCommon = Object.entries(gestureCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommon && mostCommon[1] >= Math.ceil(this.historySize * 0.6)) {
      return {
        ...gesture,
        type: mostCommon[0] as GestureType,
        confidence: Math.min(gesture.confidence + 0.2, 1.0)
      };
    }

    return gesture;
  }

  private recognizeGesture(landmarks: HandLandmark[]): GestureData {
    // Key landmarks for gesture recognition
    const thumb_tip = landmarks[4];
    const thumb_ip = landmarks[3];
    const index_tip = landmarks[8];
    const index_pip = landmarks[6];
    const index_mcp = landmarks[5];
    const middle_tip = landmarks[12];
    const middle_pip = landmarks[10];
    const ring_tip = landmarks[16];
    const ring_pip = landmarks[14];
    const pinky_tip = landmarks[20];
    const pinky_pip = landmarks[18];
    const wrist = landmarks[0];

    // Calculate finger extensions with improved logic
    const isThumbExtended = this.calculateThumbExtension(thumb_tip, thumb_ip, wrist);
    const isIndexExtended = index_tip.y < index_pip.y && index_tip.y < index_mcp.y;
    const isMiddleExtended = middle_tip.y < middle_pip.y;
    const isRingExtended = ring_tip.y < ring_pip.y;
    const isPinkyExtended = pinky_tip.y < pinky_pip.y;

    const extendedFingers = [
      isThumbExtended,
      isIndexExtended,
      isMiddleExtended,
      isRingExtended,
      isPinkyExtended
    ];

    const extendedCount = extendedFingers.filter(Boolean).length;

    // Enhanced gesture recognition with better confidence scoring
    
    // Pointing gesture: Only index finger extended
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      const confidence = this.calculatePointingConfidence(landmarks);
      return {
        type: 'pointing',
        confidence,
        landmarks
      };
    }

    // Open palm: Most or all fingers extended
    if (extendedCount >= 4) {
      const confidence = this.calculateOpenPalmConfidence(extendedFingers);
      return {
        type: 'open_palm',
        confidence,
        landmarks
      };
    }

    // Closed fist: Few or no fingers extended
    if (extendedCount <= 1) {
      const confidence = this.calculateFistConfidence(extendedFingers);
      return {
        type: 'closed_fist',
        confidence,
        landmarks
      };
    }

    return {
      type: 'none',
      confidence: 0,
      landmarks
    };
  }

  private calculateThumbExtension(thumb_tip: HandLandmark, thumb_ip: HandLandmark, wrist: HandLandmark): boolean {
    // Calculate distance from wrist to thumb tip vs thumb IP
    const tipDistance = Math.sqrt(
      Math.pow(thumb_tip.x - wrist.x, 2) + 
      Math.pow(thumb_tip.y - wrist.y, 2)
    );
    const ipDistance = Math.sqrt(
      Math.pow(thumb_ip.x - wrist.x, 2) + 
      Math.pow(thumb_ip.y - wrist.y, 2)
    );
    
    return tipDistance > ipDistance * 1.1;
  }

  private calculatePointingConfidence(landmarks: HandLandmark[]): number {
    const index_tip = landmarks[8];
    const index_pip = landmarks[6];
    const middle_tip = landmarks[12];
    const middle_pip = landmarks[10];
    
    // Check how straight the index finger is
    const indexStraightness = Math.abs(index_tip.x - index_pip.x) < 0.05 ? 0.3 : 0;
    
    // Check separation between index and middle finger
    const fingerSeparation = Math.abs(index_tip.y - middle_tip.y) > 0.1 ? 0.3 : 0;
    
    // Base confidence
    const baseConfidence = 0.4;
    
    return Math.min(baseConfidence + indexStraightness + fingerSeparation, 1.0);
  }

  private calculateOpenPalmConfidence(extendedFingers: boolean[]): number {
    const extendedCount = extendedFingers.filter(Boolean).length;
    return Math.min(0.6 + (extendedCount - 4) * 0.1, 1.0);
  }

  private calculateFistConfidence(extendedFingers: boolean[]): number {
    const extendedCount = extendedFingers.filter(Boolean).length;
    return Math.max(0.9 - extendedCount * 0.2, 0.5);
  }

  async initialize() {
    await this.hands.initialize();
  }

  async processFrame(videoElement: HTMLVideoElement) {
    await this.hands.send({ image: videoElement });
  }
}