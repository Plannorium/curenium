"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Call from "@/app/(dashboard)/components/Call";
import { joinMeshCall, startMeshCall } from "@/app/lib/simple-call-client";
import { initAudio, playSound } from "@/lib/sound/soundGenerator";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneIncoming, Home, AlertTriangle } from "lucide-react";

type RemoteStream = { stream: MediaStream; name: string };

export default function CallPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const callId = params?.callId as string;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, RemoteStream>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callHasEnded, setCallHasEnded] = useState(false);
  const callRef = useRef<{ id: string; endCall: () => void; replaceTrack: (track: MediaStreamTrack) => void; } | null>(null);

  const audioInitialized = useRef(false);
  const playSoundWithInit = useCallback((sound: Parameters<typeof playSound>[0]) => {
    if (!audioInitialized.current) {
      initAudio();
      audioInitialized.current = true;
    }
    playSound(sound);
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !callId || localStream) return;

    let stream: MediaStream | null = null;

    const join = async () => {
      setIsConnecting(true);
      setError(null);
      playSoundWithInit("callStart");

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);

        const call = await joinMeshCall({
          callId,
          localStream: stream,
          token: session.user.token,
          userName: session.user.name || "Anonymous",
          onRemoteStream: (remoteStream, peerId, peerName) => {
            setRemoteStreams(prev => ({ ...prev, [peerId]: { stream: remoteStream, name: peerName } }));
            playSoundWithInit('userJoined');
          },
          onParticipantLeft: (peerId) => {
            setRemoteStreams(prev => {
              const { [peerId]: _, ...rest } = prev;
              return rest;
            });
            playSoundWithInit('userLeft');
          },
        });
        callRef.current = call;
        setIsConnecting(false);
      } catch (err) {
        console.error("Error joining call:", err);
        setError("Failed to join the call. Please check your camera and microphone permissions.");
        setIsConnecting(false);
        playSoundWithInit('error');
      }
    };

    join();

    return () => {
      callRef.current?.endCall();
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [callId, session, playSoundWithInit, localStream]);

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    setIsMuted(newMutedState);
    playSoundWithInit(newMutedState ? 'mute' : 'unmute');
  };

  const handleToggleVideo = () => {
    const newVideoOffState = !isVideoOff;
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    setIsVideoOff(newVideoOffState);
    playSoundWithInit('mute');
  };

  const handleEndCall = () => {
    playSoundWithInit('callEnd');
    if (callRef.current) {
      callRef.current.endCall();
      callRef.current = null;
    }
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setCallHasEnded(true);
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
      if (localStream && callRef.current) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          callRef.current.replaceTrack(videoTrack);
        }
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];

        if (callRef.current) {
          callRef.current.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          handleToggleScreenShare(); // This will trigger the "stop" logic
        };

        setScreenStream(stream);
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error starting screen share:", err);
        setError("Failed to start screen sharing.");
      }
    }
  };

  const handleRejoin = () => {
    setCallHasEnded(false);
    // We reset the localStream to null to ensure the useEffect hook re-triggers the join logic.
    setLocalStream(null); 
  };

  const handleReturnToChat = () => {
    window.close();
    // As a fallback in case the browser blocks window.close(), navigate to the chat dashboard.
    router.push('/dashboard/chat');
  };

  if (callHasEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center p-4">
        <div className="relative bg-card/50 backdrop-blur-xl border border-border rounded-3xl shadow-2xl max-w-md w-full p-8 sm:p-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 shadow-inner">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card">
                <PhoneIncoming className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
              Call Concluded
            </h1>
            <p className="text-muted-foreground mb-10 max-w-xs mx-auto">
              You've successfully disconnected. Feel free to rejoin or head back to your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={handleReturnToChat} variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
              <Button onClick={handleRejoin} variant="default" className="w-full sm:w-auto">
                <PhoneIncoming className="w-4 h-4 mr-2" />
                Rejoin Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full bg-primary/10 animate-ping"></div>
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <p className="text-lg mt-6 text-muted-foreground">Connecting to Call...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center p-4">
        <div className="bg-card/50 backdrop-blur-xl border border-destructive/50 rounded-3xl shadow-2xl max-w-md w-full p-8 sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">Connection Error</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => router.push('/dashboard/chat')} variant="destructive">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!localStream) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center p-4">
        <div className="bg-card/50 backdrop-blur-xl border border-destructive/50 rounded-3xl shadow-2xl max-w-md w-full p-8 sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <VideoOff className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">Media Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            Curenium requires access to your camera and microphone to join a call. Please grant permissions and try again.
          </p>
          <Button onClick={() => router.push('/dashboard/chat')} variant="destructive">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-900 rounded-2xl shadow-lg border-2 border-white/10">
      <Call
        localStream={localStream}
        remoteStreams={remoteStreams}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
        userName={session?.user?.name || "You"}
        onToggleScreenShare={handleToggleScreenShare}
        isScreenSharing={isScreenSharing}
        screenStream={screenStream}
        callId={callId}
        onInvite={() => {
          // Placeholder for invite functionality on this page
          alert("Invite functionality can be added here.");
        }}
      />
    </div>
  );
}