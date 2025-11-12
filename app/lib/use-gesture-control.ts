// lib/use-gesture-control.ts
import { useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  HandLandmarkerResult
} from "@mediapipe/tasks-vision";

export type Gesture = "mute" | "unmute" | "camera_off" | "camera_on" | "end_call";

/* ------------------------------------------------------------------ */
/* 1. GestureDetector – does the heavy lifting                        */
/* ------------------------------------------------------------------ */
export class GestureDetector {
  private handLandmarker?: HandLandmarker;
  private video: HTMLVideoElement;
  private onGesture: (g: Gesture) => void;

  /** Public UI state – updated every frame */
  public isReady = false;
  public currentHandResult: HandLandmarkerResult | null = null;
  public gesture: Gesture | null = null;
  public confidence: number | null = null;

  private lastGesture: Gesture | null = null;
  private cooldown: NodeJS.Timeout | null = null;
  private rafId: number | null = null;
  private isRunning = false;

  constructor(video: HTMLVideoElement, onGesture: (g: Gesture) => void) {
    this.video = video;
    this.onGesture = onGesture;
    this.initialize();
  }

  /* ---------- init MediaPipe ---------- */
  private async initialize() {
    console.log("GestureDetector: Initializing MediaPipe…");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      numHands: 2,
      runningMode: "VIDEO",
    });

    this.isReady = true;
    console.log("GestureDetector: Models loaded – waiting for video…");
    this.startWhenReady();
  }

  private startWhenReady() {
    const tryStart = () => {
      if (this.video.readyState >= 2 && this.isReady) {
        this.startDetection();
      } else {
        if (this.video.readyState < 2) {
          this.video.addEventListener("loadeddata", tryStart, { once: true });
        }
      }
    };
    tryStart();
  }

  /* ---------- detection loop ---------- */
  private startDetection() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("GestureDetector: Starting detection loop…");
    this.detect();
  }

  private isWakandaGesture(landmarks: any[][]): boolean {
    if (landmarks.length < 2) return false;
    const [hand1, hand2] = landmarks;

    const wrist1 = hand1[0];
    const wrist2 = hand2[0];

    const dist = Math.hypot(wrist1.x - wrist2.x, wrist1.y - wrist2.y);
    return dist < 0.15; // wrists very close → crossed
  }

  private detect() {
    if (!this.isRunning || !this.handLandmarker) {
      this.rafId = requestAnimationFrame(() => this.detect());
      return;
    }

    const now = performance.now();
    const hand = this.handLandmarker.detectForVideo(this.video, now);

    let detected: Gesture | null = null;

    if (hand.landmarks?.[0]) {
      // Handle two-handed gestures first
      if (hand.landmarks.length > 1 && this.isWakandaGesture(hand.landmarks)) {
        detected = "end_call";
      } else {
        // Fallback to single-hand gestures
        const l = hand.landmarks[0];

        const wrist = l[0];
        const thumbTip = l[4];
        const indexTip = l[8];
        const middleTip = l[12];
        const ringTip = l[16];
        const pinkyTip = l[20];

        const indexMCP = l[5];
        const middleMCP = l[9];

        // Thumbs Up → Camera On
        if (
          thumbTip.y < wrist.y * 0.9 &&
          indexTip.y > thumbTip.y &&
          middleTip.y > thumbTip.y
        ) {
          detected = "camera_on";
        }
        // Thumbs Down → Camera Off
        else if (
          thumbTip.y > wrist.y * 1.1 &&
          indexTip.y < thumbTip.y
        ) {
          detected = "camera_off";
        }
        // Index Finger Only → Mute
        else if (
          indexTip.y < middleTip.y * 0.9 &&
          indexTip.y < ringTip.y &&
          indexTip.y < pinkyTip.y &&
          indexTip.y < thumbTip.y
        ) {
          detected = "mute";
        }
        // Index + Middle Up → Unmute
        else if (
          indexTip.y < indexMCP.y * 1.1 &&
          middleTip.y < middleMCP.y * 1.1 &&
          ringTip.y > middleTip.y &&
          pinkyTip.y > middleTip.y
        ) {
          detected = "unmute";
        }
      }
    }

    if (detected && detected !== this.lastGesture) {
      console.log("ACTION:", detected);
      this.onGesture(detected);
      this.lastGesture = detected;
      this.gesture = detected;
      this.confidence = 1; // Placeholder confidence
      if (this.cooldown) clearTimeout(this.cooldown);
      this.cooldown = setTimeout(() => {
        this.lastGesture = null;
        this.gesture = null;
        this.confidence = null;
      }, 2000);
    } else if (!detected) {
      this.gesture = null;
      this.confidence = null;
    }

    this.rafId = requestAnimationFrame(() => this.detect());
  }

  public stop() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.cooldown) clearTimeout(this.cooldown);
    console.log("GestureDetector: Stopped.");
  }
}

/* ------------------------------------------------------------------ */
/* 2. Hook – returns UI state + creates the detector only once        */
/* ------------------------------------------------------------------ */
export function useGestureControl(
  videoElement: HTMLVideoElement | null,
  onGesture: (g: Gesture) => void
) {
  const detectorRef = useRef<GestureDetector | null>(null);
  const [overlay, setOverlay] = useState<{
    handResult: HandLandmarkerResult | null;
    gesture: Gesture | null;
    confidence: number | null;
  }>({ handResult: null, gesture: null, confidence: null });

  useEffect(() => {
    if (!videoElement) {
      detectorRef.current?.stop();
      detectorRef.current = null;
      setOverlay({ handResult: null, gesture: null, confidence: null });
      return;
    }

    if (!detectorRef.current) {
      console.log("useGestureControl: Creating new GestureDetector");
      detectorRef.current = new GestureDetector(videoElement, onGesture);
    }

    const interval = setInterval(() => {
      if (detectorRef.current) {
        setOverlay({
          handResult: detectorRef.current.currentHandResult,
          gesture: detectorRef.current.gesture,
          confidence: detectorRef.current.confidence,
        });
      }
    }, 33);

    return () => {
      clearInterval(interval);
      detectorRef.current?.stop();
      detectorRef.current = null;
    };
  }, [videoElement, onGesture]);

  return overlay;
}