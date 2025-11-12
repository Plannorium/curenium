import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, isPlaying }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audioEl = audioRef.current;

    if (audioEl && !audioContextRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioEl);

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 256;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }

    const draw = () => {
      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!analyser || !canvas || !ctx) {
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Use time domain data for a waveform visualization
      analyser.getByteTimeDomainData(dataArray);

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Waveform drawing logic
      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      if (isDarkMode) {
        // Dark mode: gray-400 to gray-600
        gradient.addColorStop(0, 'rgba(160, 174, 192, 0.8)');
        gradient.addColorStop(1, 'rgba(74, 85, 104, 0.9)');
      } else {
        // Light mode: gray-500 to gray-300
        gradient.addColorStop(0, 'rgba(107, 114, 128, 0.8)');
        gradient.addColorStop(1, 'rgba(209, 213, 219, 0.9)');
      }
      ctx.strokeStyle = gradient;
      ctx.fillStyle = gradient; // Use the same gradient for filling

      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      // Start drawing from the vertical center of the canvas
      ctx.moveTo(0, canvas.height / 2);

      for (let i = 0; i < bufferLength; i++) {
        // Normalize dataArray[i] (0-255) to a range of -1 to 1, then scale to half canvas height
        const v = (dataArray[i] - 128) / 128.0; // Range -1 to 1
        const y = (v * (canvas.height / 2)) + (canvas.height / 2); // Center around canvas.height / 2

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2); // Ensure the waveform ends at the center line
      ctx.closePath(); // Close the path back to the starting point (0, canvas.height / 2)
      ctx.fill();      // Fill the area
      ctx.stroke();

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      draw();
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // Also clear the canvas when paused
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, audioRef, isDarkMode]);

  return <canvas ref={canvasRef} width="180" height="50" />;
};

export default AudioVisualizer;