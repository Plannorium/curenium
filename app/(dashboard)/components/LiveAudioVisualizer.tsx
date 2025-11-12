"use client";

import React, { useRef, useEffect } from 'react';

import { useTheme } from 'next-themes';

interface LiveAudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isSending: boolean; // New prop
}

const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps> = ({ stream, isRecording, isSending }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear any previous animation frame
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Always clear canvas initially

    if (isRecording && stream) {
      // Setup audio context for recording visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawRecording = () => {
        animationFrameIdRef.current = requestAnimationFrame(drawRecording);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2.5; // Scale for better visibility
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
          if (isDarkMode) {
            gradient.addColorStop(0, '#4A5568'); // gray-600
            gradient.addColorStop(1, '#A0AEC0'); // gray-400
          } else {
            gradient.addColorStop(0, '#718096'); // gray-500
            gradient.addColorStop(1, '#E2E8F0'); // gray-200
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 2;
        }
      };

      drawRecording();

      return () => {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        source.disconnect();
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    } else if (isSending) {
      // Sending animation
      let animationProgress = 0;
      const drawSending = () => {
        animationFrameIdRef.current = requestAnimationFrame(drawSending);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pulsing line animation
        const lineHeight = 2;
        const lineY = canvas.height / 2 - lineHeight / 2;
        const pulseFactor = Math.sin(animationProgress * 0.1) * 0.5 + 0.5; // 0.5 to 1.5
        const currentWidth = canvas.width * (0.2 + pulseFactor * 0.6); // Line width from 20% to 80%
        const startX = (canvas.width - currentWidth) / 2;

        const gradient = ctx.createLinearGradient(startX, 0, startX + currentWidth, 0);
        const centerColor = isDarkMode ? 'rgba(160, 174, 192, 0.8)' : 'rgba(113, 128, 150, 0.8)'; // gray-400 / gray-500
        const edgeColor = isDarkMode ? 'rgba(74, 85, 104, 0.2)' : 'rgba(226, 232, 240, 0.2)'; // gray-600 / gray-200

        gradient.addColorStop(0, edgeColor);
        gradient.addColorStop(0.5, centerColor);
        gradient.addColorStop(1, edgeColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(startX, lineY, currentWidth, lineHeight);

        animationProgress++;
      };
      drawSending();
    } else {
      // No recording or sending, ensure canvas is clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isRecording, isSending, stream, isDarkMode]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default LiveAudioVisualizer;