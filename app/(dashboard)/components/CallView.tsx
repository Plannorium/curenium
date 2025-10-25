import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Minimize2, Maximize2, PhoneOff, MessageSquare, Send, Smile, ScreenShare, ThumbsUp, Heart, Laugh, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CallViewProps {
  localStream: MediaStream | null;
  remoteStreams: { [key: string]: { stream: MediaStream, name: string } };
  onEndCall: () => void;
  userName: string;
  onToggleScreenShare: () => void;
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
}

interface CallChatMessage {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

const useSpeakingIndicator = (stream: MediaStream | null) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;

      let animationFrameId: number;
      const detectSpeaking = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setIsSpeaking(average > 20); // Threshold for speaking
        animationFrameId = requestAnimationFrame(detectSpeaking);
      };

      detectSpeaking();

      return () => {
        cancelAnimationFrame(animationFrameId);
        source.disconnect();
        analyser.disconnect();
        audioContext.close().catch(console.error);
      };
    }
  }, [stream]);

  return isSpeaking;
};

const VideoTile = ({ stream, isMuted, userName, isLocal, isVideoOff, isSpeaking }: { stream: MediaStream, isMuted: boolean, userName: string, isLocal?: boolean, isVideoOff?: boolean, isSpeaking?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const userInitials = (userName || "")
    .split(" ")
    .map((n: string) => n[0] || "")
    .join("")
    .slice(0, 2);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'ring-4 ring-green-500 shadow-2xl shadow-green-500/30' : 'ring-2 ring-transparent'}`}>
      {stream && !isVideoOff ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center text-white bg-gray-800 w-full h-full">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary">{userInitials}</span>
          </div>
          <div className="flex items-center gap-2">
            <VideoOff size={16} className="opacity-70" />
            <p className="text-sm font-medium opacity-70">Camera is off</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
        {userName}
      </div>
    </div>
  );
};



const TooltipButton = ({ children, tooltip, forceHide }: { children: React.ReactNode, tooltip: string, forceHide?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && !forceHide && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full mb-3 px-3 py-1.5 bg-gray-800/90 backdrop-blur-md text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScreenShareButton = ({ onToggleScreenShare, isScreenSharing, variant = 'default' }: { onToggleScreenShare: () => void, isScreenSharing: boolean, variant?: 'default' | 'minimized' }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMainButtonClick = () => {
    if (isScreenSharing) {
      setIsPopupOpen(prev => !prev);
    } else {
      onToggleScreenShare();
    }
  };

  const handleOptionClick = (action: 'stop' | 'change') => {
    onToggleScreenShare(); // This will handle both stopping and changing
    setIsPopupOpen(false);
  };

  const buttonSize = variant === 'minimized' ? 'w-10 h-10' : 'w-16 h-16';
  const iconSize = variant === 'minimized' ? 18 : 24;

  return (
    <TooltipButton tooltip={isScreenSharing ? "Screen sharing options" : "Share screen"} forceHide={isPopupOpen}>
      <div className="relative" ref={popupRef}>
        <Button
          onClick={handleMainButtonClick}
          variant="outline"
          size={variant === 'minimized' ? 'icon' : 'lg'}
          className={`${buttonSize} rounded-full ${isScreenSharing ? 'bg-blue-500/80 text-white' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'} cursor-pointer`}
        >
          <ScreenShare size={iconSize} />
        </Button>
        <AnimatePresence>
          {isPopupOpen && isScreenSharing && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-52 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => handleOptionClick('stop')}
                  className="flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/20 transition-colors w-full cursor-pointer"
                >
                  <StopCircle size={18} />
                  <span>Stop Sharing</span>
                </button>
                <button
                  onClick={() => handleOptionClick('change')}
                  className="flex items-center gap-3 px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 transition-colors w-full cursor-pointer"
                >
                  <ScreenShare size={18} />
                  <span>Share Something Else</span>
                </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipButton>
    );
};

export const CallView: React.FC<CallViewProps> = ({ localStream, remoteStreams, onEndCall, userName, onToggleScreenShare, isScreenSharing, screenStream }) => {

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<CallChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const isLocalSpeaking = useSpeakingIndicator(localStream);
  const [reactions, setReactions] = useState<{ emoji: string, id: number, name: string }[]>([]);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setIsReactionPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [reactionPickerRef]);


  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      const newMessage: CallChatMessage = {
        id: crypto.randomUUID(),
        userName: userName,
        text: chatInput.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      // In a real app, you'd send this message over the data channel
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  const handleSendReaction = (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, name: userName };
    setReactions((prev) => [...prev, newReaction]);
    setIsReactionPickerOpen(false);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 750);
    // sendReaction(emoji);
  };

  if (isMinimized) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        className="fixed bottom-4 right-4 z-50 w-64 h-40 rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
      >
        <div className="relative w-full h-full bg-black group">
          {isScreenSharing && screenStream ? (
            <video ref={el => { if (el) el.srcObject = screenStream; }} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : localStream && !isVideoOff ? (
            <video ref={el => { if (el) el.srcObject = localStream; }} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              <VideoOff size={32} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipButton tooltip="Maximize">
              <Button onClick={handleToggleMinimize} variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white cursor-pointer">
                <Maximize2 size={16} />
              </Button>
            </TooltipButton>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipButton tooltip={isMuted ? "Unmute" : "Mute"}>
              <Button onClick={handleToggleMute} variant="outline" size="icon" className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border-white/20 text-white cursor-pointer">
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
            </TooltipButton>
            <TooltipButton tooltip={isVideoOff ? "Turn on camera" : "Turn off camera"}>
              <Button onClick={handleToggleVideo} variant="outline" size="icon" className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border-white/20 text-white cursor-pointer">
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </Button>
            </TooltipButton>
            <ScreenShareButton onToggleScreenShare={onToggleScreenShare} isScreenSharing={isScreenSharing} variant="minimized" />
            <TooltipButton tooltip="End call">
              <Button onClick={onEndCall} variant="destructive" size="icon" className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                <PhoneOff size={18} />
              </Button>
            </TooltipButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full h-full flex flex-col">
        {/* Main Video Grid */}
        <div className="flex-1 grid gap-4 w-full h-full p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-all duration-300" style={{ paddingRight: isChatOpen ? '340px' : '1rem' }}>
          {isScreenSharing && screenStream && (
            <div className="md:col-span-2 lg:col-span-3">
              <VideoTile stream={screenStream} isMuted={true} userName={"Your Screen"} isLocal={true} />
            </div>
          )}
          {localStream && <VideoTile stream={localStream} isMuted={isMuted} userName={`${userName} (You)`} isLocal={true} isVideoOff={isVideoOff} isSpeaking={isLocalSpeaking} />}
          {Object.entries(remoteStreams).map(([peerId, remote]) => <RemoteVideoTile key={peerId} peerId={peerId} remote={remote} />)}
        </div>

        {/* Floating Reactions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {reactions.map((reaction) => (
              <motion.div
                key={reaction.id}
                initial={{ opacity: 0, y: 150, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }}
                exit={{ opacity: 0, y: -300, scale: 0.5, transition: { duration: 1, ease: 'easeOut' } }}
                className="absolute bottom-24"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl" style={{ textShadow: '0 0 15px rgba(0,0,0,0.7)' }}>{reaction.emoji}</span>
                  <span className="text-white text-xs font-bold bg-black/50 px-2.5 py-1 rounded-full mt-1">{reaction.name}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/70 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-2xl">
          <TooltipButton tooltip={isMuted ? "Unmute" : "Mute"}>
            <Button onClick={handleToggleMute} variant="outline" size="lg" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-16 h-16 cursor-pointer">
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
          </TooltipButton>
          <TooltipButton tooltip={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}>
            <Button onClick={handleToggleVideo} variant="outline" size="lg" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-16 h-16 cursor-pointer">
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </Button>
          </TooltipButton>
          <ScreenShareButton onToggleScreenShare={onToggleScreenShare} isScreenSharing={isScreenSharing} />
          <div className="relative" ref={reactionPickerRef}>
            <TooltipButton tooltip="Send Reaction">
              <Button onClick={() => setIsReactionPickerOpen(prev => !prev)} variant="outline" size="lg" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-16 h-16 cursor-pointer">
                <Smile size={24} />
              </Button>
            </TooltipButton>
            <AnimatePresence>
              {isReactionPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/80 p-2 rounded-full"
                >
                  {['👍', '❤️', '👏', '😂'].map(emoji => (
                    <button key={emoji} onClick={() => handleSendReaction(emoji)} className="text-2xl p-2 rounded-full hover:bg-white/20 transition-transform hover:scale-125 cursor-pointer">{emoji}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <TooltipButton tooltip="End Call">
            <Button onClick={onEndCall} variant="destructive" size="lg" className="rounded-full w-20 h-16 cursor-pointer" title="">
              <PhoneOff size={24} />
            </Button>
          </TooltipButton>
          <TooltipButton tooltip={isChatOpen ? "Close Chat" : "Open Chat"}>
            <Button onClick={() => setIsChatOpen(!isChatOpen)} variant="outline" size="lg" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-16 h-16 cursor-pointer">
              <MessageSquare size={24} />
            </Button>
          </TooltipButton>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4" style={{ right: isChatOpen ? '340px' : '1rem', transition: 'right 0.3s ease-in-out' }}>
          <TooltipButton tooltip="Minimize">
            <Button onClick={handleToggleMinimize} variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50 text-white cursor-pointer">
              <Minimize2 size={20} />
            </Button>
          </TooltipButton>
        </div>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-80 bg-gray-900/80 backdrop-blur-lg border-l border-white/10 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white">In-call messages</h3>
              <Button onClick={() => setIsChatOpen(false)} variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                <Maximize2 size={16} />
              </Button>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chatMessages.map(msg => (
                <div key={msg.id} className="text-white/90 text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">{msg.userName}</span>
                    <span className="text-xs text-white/50">{msg.timestamp}</span>
                  </div>
                  <p className="text-white/80">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 bg-gray-800/70 rounded-lg p-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="bg-transparent w-full text-white placeholder:text-white/50 focus:outline-none text-sm"
                />
                <Button onClick={handleSendChatMessage} size="icon" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RemoteVideoTile = ({ peerId, remote }: {
  peerId: string;
  remote: { stream: MediaStream; name: string };
}) => {
  const isSpeaking = useSpeakingIndicator(remote.stream);
  return <VideoTile stream={remote.stream} isMuted={false} userName={remote.name} isSpeaking={isSpeaking} />;
};