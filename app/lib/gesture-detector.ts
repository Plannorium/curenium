import { HandLandmarker, FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export type Gesture = "mute" | "unmute" | "camera_off" | "camera_on";

export class GestureDetector {
  private handLandmarker: HandLandmarker | undefined;
  private faceLandmarker: FaceLandmarker | undefined;
  private video: HTMLVideoElement;
  private onGesture: (gesture: Gesture) => void;
  private lastGesture: Gesture | null = null;
  private gestureTimeout: NodeJS.Timeout | null = null;

  constructor(video: HTMLVideoElement, onGesture: (gesture: Gesture) => void) {
    this.video = video;
    this.onGesture = onGesture;
    this.initialize();
  }

  private async initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      numHands: 1,
      runningMode: "VIDEO"
    });

    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO"
    });

    this.video.addEventListener("loadeddata", () => {
      this.detect();
    });
  }

  private async detect() {
    try {
      if (this.handLandmarker && this.faceLandmarker && this.video.readyState >= 2) {
        // Some environments (remote tracks) may not have dimensions immediately.
        // Bail out early if video metadata/dimensions are not yet available.
        const { videoWidth, videoHeight } = this.video as HTMLVideoElement;
        if (!videoWidth || !videoHeight) return;

        const handResults = this.handLandmarker.detectForVideo(this.video, performance.now());
        const faceResults = this.faceLandmarker.detectForVideo(this.video, performance.now());

        const gesture = this.recognizeGesture(handResults, faceResults);

        if (gesture && gesture !== this.lastGesture) {
          if (this.gestureTimeout) clearTimeout(this.gestureTimeout);
          this.onGesture(gesture);
          this.lastGesture = gesture;
          this.gestureTimeout = setTimeout(() => {
            this.lastGesture = null;
          }, 1000); // 1 second cooldown
        }
      }
    } catch (err: any) {
      // Ignore transient errors related to missing track/video metadata (these
      // often happen immediately after attaching a MediaStream and are benign).
      // Log at debug level to avoid alarming the console in dev.
      // Example message from underlying libs: "could not determine track dimensions, using defaults {}"
      // We intentionally swallow these.
      // console.debug('GestureDetector.detect error (ignored):', err?.message || err);
    }

    requestAnimationFrame(() => this.detect());
  }

  private recognizeGesture(handResults: any, faceResults: any): Gesture | null {
    const mouthLandmarks = [
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, // Outer lip
      78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, // Inner lip
    ];

    if (handResults.landmarks.length > 0 && faceResults.faceLandmarks.length > 0) {
      const hand = handResults.landmarks[0];
      const face = faceResults.faceLandmarks[0];

      const mouthRegion = {
        xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity,
      };

      for (const index of mouthLandmarks) {
        const landmark = face[index];
        mouthRegion.xMin = Math.min(mouthRegion.xMin, landmark.x);
        mouthRegion.xMax = Math.max(mouthRegion.xMax, landmark.x);
        mouthRegion.yMin = Math.min(mouthRegion.yMin, landmark.y);
        mouthRegion.yMax = Math.max(mouthRegion.yMax, landmark.y);
      }

      let handOverMouth = false;
      for (const landmark of hand) {
        if (
          landmark.x >= mouthRegion.xMin &&
          landmark.x <= mouthRegion.xMax &&
          landmark.y >= mouthRegion.yMin &&
          landmark.y <= mouthRegion.yMax
        ) {
          handOverMouth = true;
          break;
        }
      }

      if (handOverMouth) {
        console.log("Mute gesture detected");
        return "mute";
      } else if (this.lastGesture === "mute") {
        console.log("Unmute gesture detected");
        return "unmute";
      }

      const noseTip = face[1];
      const handBase = hand[0];
      const handTip = hand[8];

      // Swipe down
      if (handBase.y > noseTip.y && handTip.y < noseTip.y) {
        if (handBase.y - handTip.y > 0.1) {
          console.log("Camera off gesture detected");
          return "camera_off";
        }
      }

      // Swipe up
      if (handTip.y > noseTip.y && handBase.y < noseTip.y) {
        if (handTip.y - handBase.y > 0.1) {
          console.log("Camera on gesture detected");
          return "camera_on";
        }
      }
    }

    return null;
  }
}