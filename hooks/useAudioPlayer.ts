import { useRef, useCallback, useEffect, useState } from 'react';

type UpdateCallback = (payload: { id: string | null; field?: string | null; isPlaying: boolean }) => void;

type AudioEntry =
  | {
      audio: HTMLAudioElement;
      isSequence: false;
      field?: string;
    }
  | {
      audio: HTMLAudioElement;
      isSequence: true;
      queue: string[];
      index: number;
      currentField: string | null;
    };

export function useAudioPlayer() {
  // map of id -> { audio, queue?, index, isSequence }
  const mapRef = useRef(new Map<string, AudioEntry>());
  const updateCbRef = useRef<UpdateCallback | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const setOnUpdate = useCallback((cb: UpdateCallback | null) => {
    updateCbRef.current = cb;
  }, []);

  const notify = (payload: { id: string | null; field?: string | null; isPlaying: boolean }) => {
    setPlayingId(payload.isPlaying ? payload.id : null);
    if (updateCbRef.current) updateCbRef.current(payload);
  };

  const cleanupEntry = (id: string) => {
    const entry = mapRef.current.get(id);
    if (!entry) return;
    try {
      entry.audio.pause();
    } catch (e) {}
    mapRef.current.delete(id);
  };

  const stop = useCallback((id: string) => {
    const entry = mapRef.current.get(id);
    if (entry) {
      try {
        entry.audio.pause();
        entry.audio.currentTime = 0;
      } catch (e) {}
      mapRef.current.delete(id);
    }
    notify({ id: null, isPlaying: false });
  }, []);

  const togglePlay = useCallback(async (url: string, id: string) => {
    const existing = mapRef.current.get(id);
    if (existing && !existing.isSequence) {
      try {
        if (existing.audio.paused) {
          await existing.audio.play();
        } else {
          existing.audio.pause();
          notify({ id: null, field: existing.field ?? null, isPlaying: false });
        }
      } catch (e) {
        console.error('Audio toggle error', e);
        notify({ id: null, isPlaying: false });
      }
      return;
    }

    // create new audio and play
    try {
      const audio = new Audio(url);
      const entry: AudioEntry = { audio, isSequence: false, field: undefined };
      audio.addEventListener('ended', () => {
        cleanupEntry(id);
        notify({ id: null, isPlaying: false });
      });
      audio.addEventListener('play', () => notify({ id, field: undefined, isPlaying: true }));
      audio.addEventListener('pause', () => notify({ id: null, field: undefined, isPlaying: false }));
      mapRef.current.set(id, entry);
      await audio.play();
    } catch (e) {
      console.error('Audio play error', e);
      notify({ id: null, isPlaying: false });
    }
  }, []);

  const toggleSequence = useCallback(async (urls: string[], id: string) => {
    const existing = mapRef.current.get(id);
    if (existing && existing.isSequence) {
      try {
        if (existing.audio.paused) {
          await existing.audio.play();
        } else {
          existing.audio.pause();
          notify({ id: null, field: existing.currentField ?? null, isPlaying: false });
        }
      } catch (e) {
        console.error('Sequence toggle error', e);
        notify({ id: null, isPlaying: false });
      }
      return;
    }

    if (!urls || urls.length === 0) return;

    try {
      let index = 0;
      const audio = new Audio(urls[index]);
      const entry: AudioEntry = { audio, isSequence: true, queue: urls.slice(), index, currentField: null };

      const playIndex = async (i: number) => {
        if (!entry.queue[i]) return;
        try {
          entry.index = i;
          entry.audio.src = entry.queue[i];
          // derive field as position string; caller can map index->field if needed
          entry.currentField = String(i);
          await entry.audio.play();
        } catch (e) {
          console.error('Error playing sequence item', e);
          notify({ id: null, isPlaying: false });
        }
      };

      entry.audio.addEventListener('ended', () => {
        const next = entry.index + 1;
        if (next < entry.queue.length) {
          playIndex(next);
        } else {
          cleanupEntry(id);
          notify({ id: null, isPlaying: false });
        }
      });

      entry.audio.addEventListener('play', () => notify({ id, field: entry.currentField ?? null, isPlaying: true }));
      entry.audio.addEventListener('pause', () => notify({ id: null, field: entry.currentField ?? null, isPlaying: false }));

      mapRef.current.set(id, entry);
      await playIndex(0);
    } catch (e) {
      console.error('Sequence play error', e);
      notify({ id: null, isPlaying: false });
    }
  }, []);

  const restartSequence = useCallback(async (urls: string[], id: string) => {
    const existing = mapRef.current.get(id);
    if (existing && existing.isSequence) {
      try {
        existing.audio.pause();
        existing.index = 0;
        existing.currentField = '0';
        existing.audio.src = existing.queue[0];
        await existing.audio.play();
      } catch (e) {
        console.error('Error restarting sequence', e);
        notify({ id: null, isPlaying: false });
      }
      return;
    }

    // Otherwise start a new sequence
    await toggleSequence(urls, id);
  }, [toggleSequence]);

  useEffect(() => {
    return () => {
      // cleanup all
      mapRef.current.forEach((entry: AudioEntry, key: string) => {
        try { entry.audio.pause(); } catch (e) {}
      });
      mapRef.current.clear();
    };
  }, []);

  return {
    playingId,
    setOnUpdate,
    togglePlay,
    toggleSequence,
    restartSequence,
    stop
  };
}
