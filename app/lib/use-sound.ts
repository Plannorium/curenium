
import { useEffect } from 'react';

const audioFiles: { [key: string]: string } = {
  mute: '/sounds/mute.mp3',
  unmute: '/sounds/unmute.mp3',
  callEnd: '/sounds/call-end.mp3',
  reaction: '/sounds/reaction.mp3',
  message: '/sounds/message.mp3',
};

let audioContext: AudioContext | null = null;
const audioBuffers: { [key: string]: AudioBuffer } = {};
let isInitialized = false;

const initAudio = () => {
  if (isInitialized) return;
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    isInitialized = true;
    preloadSounds();
  } catch (_e) { 
    console.error("Web Audio API is not supported in this browser");
  }
};

const preloadSounds = async () => {
  if (!audioContext) return;
  for (const key in audioFiles) {
    try {
      const response = await fetch(audioFiles[key]);
      const arrayBuffer = await response.arrayBuffer();
      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        audioBuffers[key] = buffer;
      });
    } catch (e) {
      console.error(`Failed to load sound: ${key}`, e);
    }
  }
};

const playSound = (key: string) => {
  if (!audioContext || !audioBuffers[key]) return;
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[key];
  source.connect(audioContext.destination);
  source.start(0);
};

export const useSound = () => {
  useEffect(() => {
    // On first use, we need a user interaction to initialize the AudioContext.
    // We'll rely on a component interaction (like a button click) to call initAudio.
  }, []);

  return { initAudio, playSound };
};