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
  roomId: string;
  localStream: MediaStream;
  token: string;
  userName: string;
  onRemoteStream: (stream: MediaStream, peerId: string, peerName: string) => void;
  onParticipantLeft: (peerId: string) => void;
  startCall: () => void;
};

export async function startMeshCall({
  roomId,
  localStream,
  token,
  userName,
  onRemoteStream,
  onParticipantLeft,
  startCall,
}: StartMeshCallParams) {
  const ws = new WebSocket(
    `${location.origin.replace(/^http/, "ws")}/ws/call-${encodeURIComponent(
      roomId
    )}`
  );
  const pcMap: Record<string, RTCPeerConnection> = {};

  ws.onopen = () => {
    startCall();
    ws.send(JSON.stringify({ type: "auth", token, user: { name: userName } }));
    ws.send(JSON.stringify({ type: "join", room: roomId }));
  };

  ws.onmessage = async (evt) => {
    const msg: WSMessage = JSON.parse(evt.data);
    if (msg.type === "welcome" || msg.type === "joined") {
      if (msg.userList && msg.you) {
        for (const peer of msg.userList) { // The server should send a list of {id, name}
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
        // When we get an answer, the remote peer might not have a stream yet, but we now know their name.
        // We can update the name here if we have a placeholder.
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
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // free STUN
    });

    // add local tracks
    for (const t of localStream.getTracks()) pc.addTrack(t, localStream);

    // handle remote stream
    const remoteStream = new MediaStream();
    pc.ontrack = (ev) => {
      // When the track is received, we know the stream is starting.
      // The name was passed when the connection was initiated.
      ev.streams[0].getTracks().forEach((tr) => {
        if (!remoteStream.getTrackById(tr.id)) {
          remoteStream.addTrack(tr);
        }
      });
      onRemoteStream(remoteStream, peerId, peerName);
    };

    // ICE candidates
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
    endCall: () => {
      Object.values(pcMap).forEach((pc) => pc.close());
      localStream.getTracks().forEach((track) => track.stop());
      ws.close();
    },
    replaceTrack,
  };
}