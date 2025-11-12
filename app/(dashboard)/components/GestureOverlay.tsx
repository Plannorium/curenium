import React, { useRef, useEffect } from 'react';
import { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { DrawingUtils } from '@mediapipe/tasks-vision';

interface GestureOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  handResult: HandLandmarkerResult | null;
  gesture: string | null;
  confidence: number;
}

export const GestureOverlay: React.FC<GestureOverlayProps> = ({
  videoRef,
  handResult,
  gesture,
  confidence,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!drawingUtilsRef.current) {
      drawingUtilsRef.current = new DrawingUtils(ctx);
    }

    const { videoWidth, videoHeight } = video;
    if (videoWidth === 0 || videoHeight === 0) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (handResult?.landmarks) {
      ctx.save();
      // Mirror the canvas for a natural feel
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      for (const landmarks of handResult.landmarks) {
        drawingUtilsRef.current.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: 'rgba(28, 255, 28, 0.7)',
          lineWidth: 3,
        });
        drawingUtilsRef.current.drawLandmarks(landmarks, {
          color: 'rgba(28, 255, 28, 0.9)',
          radius: 3,
         });
      }
      ctx.restore();
    }
  }, [handResult, videoRef]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {gesture && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-mono">
            {gesture} ({(confidence * 100).toFixed(0)}%)
          </div>
        </div>
      )}
    </div>
  );
};