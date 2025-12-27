"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Square, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript?: string) => void;
  onRecordingCanceled?: () => void;
  maxDuration?: number; // in seconds, default 120 (2 minutes)
  fieldName: string;
}

export function VoiceRecorder({ onRecordingComplete, onRecordingCanceled, maxDuration = 120, fieldName }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const warningTime = maxDuration - 30; // Show warning 30 seconds before limit

  // Initialize audio context and analyser
  const initAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      return stream;
    } catch (error) {
      console.error('Error initializing audio context:', error);
      toast.error('Microphone access denied or not available');
      return null;
    }
  }, []);

  // Visualize audio data
  const visualize = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const data: number[] = Array.from(dataArrayRef.current).slice(0, 32) as number[]; // Take first 32 frequency bins
    setAudioData(data);

    animationFrameRef.current = requestAnimationFrame(visualize);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }

    // Clean up
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioData([]);
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await initAudioContext();
      if (!stream) return;

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete(blob);
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      setShowWarning(false);

      // Start visualization
      visualize();

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;

          // Show warning when approaching limit
          if (newTime >= warningTime && !showWarning) {
            setShowWarning(true);
            toast.warning(`Recording will stop in ${maxDuration - newTime} seconds`);
          }

          // Stop recording when limit reached
          if (newTime >= maxDuration) {
            stopRecording();
            toast.info('Recording stopped - maximum duration reached');
            return maxDuration;
          }

          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [initAudioContext, visualize, onRecordingComplete, maxDuration, warningTime, showWarning, stopRecording]);

  // Play recorded audio
  const playAudio = useCallback(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Cancel/remove recording
  const cancelRecording = useCallback(() => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    // Clear recorded audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset state
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setAudioData([]);
    setShowWarning(false);
    setIsPlaying(false);

    // Clean up refs
    chunksRef.current = [];
    if (audioRef.current) {
      audioRef.current.src = '';
    }

    // Notify parent component
    onRecordingCanceled?.();
  }, [isRecording, stopRecording, audioUrl, onRecordingCanceled]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isRecording, stopRecording, audioUrl]);

  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Record {fieldName}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-50 border-red-200 hover:bg-red-100"
          >
            <Square className="h-4 w-4" />
            Stop Recording
          </Button>
        )}

        {audioUrl && (
          <>
            {!isPlaying ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playAudio}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Play
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={pauseAudio}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelRecording}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>{formatTime(recordingTime)} / {formatTime(maxDuration)}</span>
          </div>
        )}

        {showWarning && (
          <div className="flex items-center gap-1 text-sm text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Approaching limit</span>
          </div>
        )}
      </div>

      {/* Audio Visualization */}
      {(isRecording || audioData.length > 0 || (audioUrl && !isRecording)) && (
        <div className="flex items-end gap-1 h-12 bg-gray-100 dark:bg-gray-800 rounded p-2">
          {audioData.length > 0 ? (
            audioData.map((value, index) => {
              // Determine color based on recording time
              let barColor = 'bg-green-400'; // Default light green
              if (isRecording && recordingTime >= warningTime) {
                barColor = 'bg-red-500'; // Red when approaching limit
              } else if (!isRecording) {
                barColor = 'bg-blue-500'; // Blue for recorded audio
              }

              return (
                <div
                  key={index}
                  className={`${barColor} rounded-sm transition-all duration-75`}
                  style={{
                    height: `${Math.max(4, (value / 255) * 40)}px`,
                    width: '4px',
                    opacity: isRecording ? 1 : 0.7
                  }}
                />
              );
            })
          ) : (
            // Recorded Audio Summary
            <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
              Audio recorded - {audioBlob ? `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB` : ''}
            </div>
          )}
        </div>
      )}

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          className="hidden"
        />
      )}
    </div>
  );
}