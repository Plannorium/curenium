// Lightweight LiveKit client helper for the browser.
// This file dynamically imports `@livekit/client` to avoid build-time errors
// when the package is not yet installed. It fetches a server-generated token
// from `/api/livekit/token` and connects to the LiveKit room.

type JoinOptions = {
  roomId: string;
  localStream?: MediaStream;
  onParticipantConnected?: (p: any) => void;
  onParticipantDisconnected?: (p: any) => void;
  onTrackSubscribed?: (track: any, publication: any, participant: any) => void;
  onDisconnected?: () => void;
};

export async function joinLiveKitRoom(opts: JoinOptions) {
  const { roomId, localStream, onParticipantConnected, onParticipantDisconnected, onTrackSubscribed, onDisconnected } = opts;

  // Request a token from our server-side route
  const resp = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room: roomId }),
  });

  if (!resp.ok) {
    throw new Error('Failed to get LiveKit token');
  }

  const body = await resp.json() as { token: string; url: string };
  const token: string = body.token;
  const livekitUrl: string = body.url;

  if (!token || !livekitUrl) throw new Error('Invalid LiveKit token response');
  if (typeof token !== 'string') throw new Error('Token must be a string');

  // Dynamically import the client
  const lk = await import('livekit-client');

  // Create a new room instance
  const room = new lk.Room();

  // Connect to the room
  await room.connect(livekitUrl, token, {
    autoSubscribe: true,
  });

  // Publish local tracks using LiveKit's method
  if (localStream) {
    // Prefer publishing the exact MediaStreamTracks the caller provided
    for (const t of localStream.getTracks()) {
      try {
        // publishTrack accepts a MediaStreamTrack
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await room.localParticipant.publishTrack(t);
      } catch (e) {
        console.warn('Failed to publish existing local track, attempting to create local tracks', e);
      }
    }
  } else {
    // Fallback: create local tracks if no MediaStream was provided
    try {
      const tracks = await lk.createLocalTracks({ audio: true, video: true });
      for (const track of tracks) {
        await room.localParticipant.publishTrack(track);
      }
    } catch (e) {
      // ignore - publishing is optional here
    }
  }

  // Wire up events
  room.on(lk.RoomEvent.ParticipantConnected, (participant: any) => {
    onParticipantConnected?.(participant);
  });

  room.on(lk.RoomEvent.ParticipantDisconnected, (participant: any) => {
    onParticipantDisconnected?.(participant);
  });

  room.on(lk.RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
    // Try to normalize into a MediaStream for easier consumption by the UI
    try {
      const mediaTrack = (track as any)?.mediaStreamTrack || (track as any)?.track || track;
      if (mediaTrack && typeof mediaTrack.kind === 'string') {
        const ms = new MediaStream();
        try { ms.addTrack(mediaTrack); } catch (err) { /* some track shapes may not be addable */ }
        onTrackSubscribed?.(ms, publication, participant);
        return;
      }
    } catch (e) {
      // ignore and fallback
    }

    // If normalization failed, still forward the original params
    onTrackSubscribed?.(track, publication, participant);
  });

  room.on(lk.RoomEvent.Disconnected, () => {
    onDisconnected?.();
  });

  // TODO: publish local tracks (audio/video) using LiveKit helpers like createLocalTracks
  // Example (caller side):
  // const tracks = await lk.createLocalTracks({ audio: true, video: true });
  // await room.localParticipant.publishTracks(tracks);

  return {
    room,
    disconnect: async () => {
      try {
        await room.disconnect();
      } catch (e) {
        console.warn('LiveKit disconnect error', e);
      }
    },
  };
}

// Helper to replace published track on an existing room's local participant.
export async function replacePublishedTrackForRoom(room: any, newTrack: MediaStreamTrack) {
  if (!room || !newTrack) throw new Error('Room and newTrack required');

  try {
    const lp = room.localParticipant as any;

    // Try to find existing publications of same kind (audio/video)
    const publications: any[] = [];
    try {
      if (lp.publications && typeof lp.publications.forEach === 'function') {
        lp.publications.forEach((p: any) => publications.push(p));
      } else if (lp.getTrackPublications) {
        const map = lp.getTrackPublications();
        if (map && typeof map.forEach === 'function') map.forEach((p: any) => publications.push(p));
      }
    } catch (e) {
      // ignore
    }

    // Unpublish any existing publication with same kind
    for (const pub of publications) {
      try {
        const t = pub.track || pub.trackOrPublisher || pub;
        if (t && t.kind === newTrack.kind) {
          if (typeof lp.unpublishTrack === 'function') {
            try { lp.unpublishTrack(t); } catch (e) { /* ignore */ }
          }
        }
      } catch (e) { /* ignore */ }
    }

    // Publish the new track
    const newPub = await lp.publishTrack(newTrack);
    return newPub;
  } catch (err) {
    console.error('replacePublishedTrackForRoom error', err);
    throw err;
  }
}
