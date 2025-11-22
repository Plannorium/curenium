// simple-call-client.ts
type WSMessage = {
  type: string;
  from?: string;
  to?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  user?: { name: string };
  userList?: Array<{ id: string; name: string }>;
  you?: string;
  room?: string;
  token?: string;
};

type StartMeshCallParams = {
  callId: string;
  roomId: string;
  localStream: MediaStream;
  token: string;
  userName: string;
  onRemoteStream: (stream: MediaStream, peerId: string, peerName: string) => void;
  onParticipantLeft: (peerId: string) => void;
  onCallStarted: (callId: string) => void;
};

type JoinMeshCallParams = {
  callId: string;
  localStream: MediaStream;
  token: string;
  userName: string;
  onRemoteStream: (stream: MediaStream, peerId: string, peerName: string) => void;
  onParticipantLeft: (peerId: string) => void;
};

export async function startMeshCall({
  callId,
  roomId,
  localStream,
  token,
  userName,
  onRemoteStream,
  onParticipantLeft,
  onCallStarted,
}: StartMeshCallParams) {
  // Generate callId properly: call-{roomId}-{randomId}
  const properCallId = `call-${roomId}-${crypto.randomUUID().slice(0, 8)}`;

  // Determine worker URL (same logic as useChat) so we connect directly to the
  // Durable Object WebSocket endpoint instead of the frontend origin. This
  // avoids routing issues in dev where the frontend does not proxy /ws paths
  // to the worker.
  const defaultWorker =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8787"
      : (process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL as string);

  let wsUrl = `${location.origin.replace(/^http/, "ws")}/ws/call-${encodeURIComponent(roomId)}`;
  try {
    if (defaultWorker) {
      const normalized = /^https?:\/\//i.test(defaultWorker) ? defaultWorker : `https://${defaultWorker}`;
      const u = new URL(normalized);
      const wsProtocol = u.protocol === "https:" ? "wss" : "ws";
      wsUrl = `${wsProtocol}://${u.host}/ws/call-${encodeURIComponent(roomId)}`;
    }
  } catch (err) {
    console.warn('Failed to normalize worker URL for mesh call; falling back to location.origin', err);
  }

  const ws = new WebSocket(wsUrl);
  const pcMap: Record<string, RTCPeerConnection> = {};

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "auth", token, user: { name: userName } }));
    ws.send(JSON.stringify({ type: "join", room: roomId }));
    onCallStarted(properCallId);
  };

  ws.onmessage = async (evt) => {
    const msg: WSMessage = JSON.parse(evt.data);
    if (msg.type === "welcome" || msg.type === "joined") {
      if (msg.userList && msg.you) {
        for (const peer of msg.userList) {
          const { id: peerId, name: peerName } = peer;
          if (peerId === msg.you) continue;
          await createPeerOffer(peerId, peerName);
        }
      }
    } else if (msg.type === "offer" && msg.from && msg.sdp) {
      const peerId = msg.from;
      const peerName = msg.user?.name || 'Anonymous';
      const pc = createPeerConnection(peerId, peerName);
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(
        JSON.stringify({
          type: "answer",
          to: peerId,
          sdp: pc.localDescription,
          user: { name: userName }
        })
      );
    } else if (msg.type === "answer" && msg.from && msg.sdp) {
      const peerId = msg.from;
      const pc = pcMap[peerId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    } else if (msg.type === "candidate" && msg.from && msg.candidate) {
      const pc = pcMap[msg.from];
      if (pc) await pc.addIceCandidate(msg.candidate);
    } else if (msg.type === "peer-left" && msg.from) {
      const pc = pcMap[msg.from];
      if (pc) {
        pc.close();
        delete pcMap[msg.from];
        onParticipantLeft(msg.from);
      }
    }
  };

  async function createPeerOffer(peerId: string, peerName: string) {
    const pc = createPeerConnection(peerId, peerName);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(
      JSON.stringify({ type: "offer", to: peerId, sdp: pc.localDescription, user: { name: userName } })
    );
  }

  function createPeerConnection(peerId: string, peerName: string) {
    if (pcMap[peerId]) return pcMap[peerId];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    for (const t of localStream.getTracks()) pc.addTrack(t, localStream);

    const remoteStream = new MediaStream();
    pc.ontrack = (ev) => {
      ev.streams[0].getTracks().forEach((tr) => {
        if (!remoteStream.getTrackById(tr.id)) {
          remoteStream.addTrack(tr);
        }
      });
      onRemoteStream(remoteStream, peerId, peerName);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        ws.send(
          JSON.stringify({
            type: "candidate",
            to: peerId,
            candidate: ev.candidate,
          })
        );
      }
    };

    pcMap[peerId] = pc;
    return pc;
  }

  function replaceTrack(newTrack: MediaStreamTrack) {
    Object.values(pcMap).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  }

  return {
    id: properCallId,
    endCall: () => {
      if (ws.readyState === WebSocket.OPEN) {
        Object.values(pcMap).forEach((pc) => pc.close());
        localStream.getTracks().forEach((track) => track.stop());
        ws.close();
      }
    },
    replaceTrack,
  };
}


export async function joinMeshCall({
  callId,
  localStream,
  token,
  userName,
  onRemoteStream,
  onParticipantLeft,
}: JoinMeshCallParams) {
  // Extract the actual channel/room name from callId
  // Expected canonical format: call-{channelName}-{randomSuffix}
  // But allow legacy or simplified formats such as "call-general".
  let roomId: string | null = null;

  // Prefer a strict match that allows hyphens in the channel name
  const strictMatch = callId.match(/^call-(.+)-[^-]+$/);
  if (strictMatch) {
    roomId = strictMatch[1];
  } else if (callId.startsWith("call-")) {
    // Fallback: split and take everything after the first segment
    const parts = callId.split("-");
    if (parts.length >= 3) {
      // e.g. call-my-channel-abc123 -> join parts [1..-2]
      roomId = parts.slice(1, -1).join("-");
    } else {
      // e.g. call-general -> room is everything after 'call-'
      roomId = parts.slice(1).join("-");
    }
  }

  if (!roomId) {
    throw new Error("Invalid callId format");
  }

  // joinMeshCall should also connect to the worker host so it reaches the
  // Durable Object that manages call signaling.
  const joinDefaultWorker =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8787"
      : (process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL as string);

  let joinWsUrl = `${location.origin.replace(/^http/, "ws")}/ws/call-${encodeURIComponent(roomId)}`;
  try {
    if (joinDefaultWorker) {
      const normalized = /^https?:\/\//i.test(joinDefaultWorker) ? joinDefaultWorker : `https://${joinDefaultWorker}`;
      const u = new URL(normalized);
      const wsProtocol = u.protocol === "https:" ? "wss" : "ws";
      joinWsUrl = `${wsProtocol}://${u.host}/ws/call-${encodeURIComponent(roomId)}`;
    }
  } catch (err) {
    console.warn('Failed to normalize worker URL for mesh join; falling back to location.origin', err);
  }

  const ws = new WebSocket(joinWsUrl);
  const pcMap: Record<string, RTCPeerConnection> = {};

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "auth", token, user: { name: userName } }));
    ws.send(JSON.stringify({ type: "join", room: roomId }));
  };

  ws.onmessage = async (evt) => {
    const msg: WSMessage = JSON.parse(evt.data);
    if (msg.type === "welcome" || msg.type === "joined") {
      if (msg.userList && msg.you) {
        for (const peer of msg.userList) {
          const { id: peerId, name: peerName } = peer;
          if (peerId === msg.you) continue;
          await createPeerOffer(peerId, peerName);
        }
      }
    } else if (msg.type === "offer" && msg.from && msg.sdp) {
      const peerId = msg.from;
      const peerName = msg.user?.name || 'Anonymous';
      const pc = createPeerConnection(peerId, peerName);
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(
        JSON.stringify({
          type: "answer",
          to: peerId,
          sdp: pc.localDescription,
          user: { name: userName }
        })
      );
    } else if (msg.type === "answer" && msg.from && msg.sdp) {
      const peerId = msg.from;
      const pc = pcMap[peerId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    } else if (msg.type === "candidate" && msg.from && msg.candidate) {
      const pc = pcMap[msg.from];
      if (pc) await pc.addIceCandidate(msg.candidate);
    } else if (msg.type === "peer-left" && msg.from) {
      const pc = pcMap[msg.from];
      if (pc) {
        pc.close();
        delete pcMap[msg.from];
        onParticipantLeft(msg.from);
      }
    }
  };

  async function createPeerOffer(peerId: string, peerName: string) {
    const pc = createPeerConnection(peerId, peerName);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(
      JSON.stringify({ type: "offer", to: peerId, sdp: pc.localDescription, user: { name: userName } })
    );
  }

  function createPeerConnection(peerId: string, peerName: string) {
    if (pcMap[peerId]) return pcMap[peerId];
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    for (const t of localStream.getTracks()) pc.addTrack(t, localStream);

    const remoteStream = new MediaStream();
    pc.ontrack = (ev) => {
      ev.streams[0].getTracks().forEach((tr) => {
        if (!remoteStream.getTrackById(tr.id)) {
          remoteStream.addTrack(tr);
        }
      });
      onRemoteStream(remoteStream, peerId, peerName);
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        ws.send(
          JSON.stringify({
            type: "candidate",
            to: peerId,
            candidate: ev.candidate,
          })
        );
      }
    };

    pcMap[peerId] = pc;
    return pc;
  }

  function replaceTrack(newTrack: MediaStreamTrack) {
    Object.values(pcMap).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  }

  return {
    id: callId,
    endCall: () => {
      Object.values(pcMap).forEach((pc) => pc.close());
      localStream.getTracks().forEach((track) => track.stop());
      ws.close();
    },
    replaceTrack,
  };
}