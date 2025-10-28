import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Minimize2, Maximize2, PhoneOff, MessageSquare, Send, Smile, ScreenShare, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface CallViewProps {
  localStream: MediaStream | null;
  remoteStreams: { [key: string]: { stream: MediaStream; name: string } };
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
        setIsSpeaking(average > 20);
        animationFrameId = requestAnimationFrame(detectSpeaking);
      };

      detectSpeaking();

      return () => {
        cancelAnimationFrame(animationFrameId);
        try { source.disconnect(); } catch (e) {}
        try { analyser.disconnect(); } catch (e) {}
        audioContext.close().catch(() => {});
      };
    }

    return () => {};
  }, [stream]);

  return isSpeaking;
};

const VideoTile = ({ stream, isMuted, userName, isLocal, isVideoOff, isSpeaking, isScreenShare }: { stream: MediaStream; isMuted: boolean; userName: string; isLocal?: boolean; isVideoOff?: boolean; isSpeaking?: boolean; isScreenShare?: boolean; }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      try { (videoRef.current as any).srcObject = stream; } catch (e) {}
    }
  }, [stream]);

  const userInitials = (userName || '')
    .split(' ')
    .map((n: string) => n[0] || '')
    .join('')
    .slice(0, 2);

  return (
    <div className={`relative rounded-lg overflow-hidden flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'ring-4 ring-green-500 shadow-2xl shadow-green-500/30' : 'ring-1 ring-white/4'} bg-black`}> 
      {stream && !isVideoOff ? (
        <video ref={videoRef} autoPlay playsInline muted={!!isLocal} className={`w-full h-full ${isScreenShare ? 'object-contain' : 'object-cover'}`} />
      ) : (
        <div className="flex flex-col items-center justify-center text-white bg-gray-800 w-full h-full p-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-primary">{userInitials}</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <VideoOff size={16} />
            <span>Camera is off</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-0.5 rounded">{userName}</div>
    </div>
  );
};

const TooltipButton = ({ children, tooltip, forceHide }: { children: React.ReactNode; tooltip: string; forceHide?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
      <AnimatePresence>
        {isHovered && !forceHide && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute bottom-full mb-3 px-3 py-1.5 bg-gray-800/95 backdrop-blur text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap">
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ScreenShareButton = ({ onToggleScreenShare, isScreenSharing, variant = 'default' }: { onToggleScreenShare: () => void; isScreenSharing: boolean; variant?: 'default' | 'minimized' }) => {
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
    if (isScreenSharing) setIsPopupOpen(prev => !prev); else onToggleScreenShare();
  };

  const handleOptionClick = (action: 'stop' | 'change') => {
    onToggleScreenShare();
    setIsPopupOpen(false);
  };

  const buttonSize = variant === 'minimized' ? 'w-10 h-10' : 'w-14 h-14 sm:w-16 sm:h-16';
  const iconSize = variant === 'minimized' ? 18 : 24;

  return (
    <TooltipButton tooltip={isScreenSharing ? 'Screen sharing options' : 'Share screen'} forceHide={isPopupOpen}>
      <div className="relative" ref={popupRef}>
        <Button onClick={handleMainButtonClick} variant="outline" size={variant === 'minimized' ? 'icon' : 'lg'} className={`${buttonSize} rounded-full ${isScreenSharing ? 'bg-blue-500/80 text-white' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'} cursor-pointer`}>
          <ScreenShare size={iconSize} />
        </Button>

        <AnimatePresence>
          {isPopupOpen && isScreenSharing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }} className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-44 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden">
              <div className="flex flex-col">
                <button onClick={() => handleOptionClick('stop')} className="flex items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 w-full">
                  <StopCircle size={16} />
                  <span>Stop Sharing</span>
                </button>
                <button onClick={() => handleOptionClick('change')} className="flex items-center gap-3 px-4 py-3 text-left text-sm text-white/90 hover:bg-white/5 w-full">
                  <ScreenShare size={16} />
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
  const [reactions, setReactions] = useState<{ emoji: string; id: number; name: string }[]>([]);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  // resizable chat width state
  const [chatWidth, setChatWidth] = useState<number>(320);
  const minChatWidth = 240;
  const maxChatWidth = 640;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setIsReactionPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // clamp chat width on resize
    const handler = () => setChatWidth((w) => Math.min(maxChatWidth, Math.max(minChatWidth, w)));
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleToggleMinimize = () => setIsMinimized(!isMinimized);

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      const newMessage: CallChatMessage = { id: crypto.randomUUID(), userName, text: chatInput.trim(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  const handleSendReaction = (emoji: string) => {
    const newReaction = { id: Date.now(), emoji, name: userName };
    setReactions(prev => [...prev, newReaction]);
    setIsReactionPickerOpen(false);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== newReaction.id)), 750);
  };

  if (isMinimized) {
    return (
      <motion.div drag dragMomentum={false} className="fixed bottom-4 right-4 z-50 w-64 h-40 rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing">
        <div className="relative w-full h-full bg-black group">
          {isScreenSharing && screenStream ? (
            <video ref={el => { if (el) (el as HTMLVideoElement).srcObject = screenStream; }} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : localStream && !isVideoOff ? (
            <video ref={el => { if (el) (el as HTMLVideoElement).srcObject = localStream; }} autoPlay playsInline muted className="w-full h-full object-cover" />
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
            <TooltipButton tooltip={isMuted ? 'Unmute' : 'Mute'}>
              <Button onClick={handleToggleMute} variant="outline" size="icon" className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border-white/20 text-white cursor-pointer">{isMuted ? <MicOff size={18} /> : <Mic size={18} />}</Button>
            </TooltipButton>
            <TooltipButton tooltip={isVideoOff ? 'Turn on camera' : 'Turn off camera'}>
              <Button onClick={handleToggleVideo} variant="outline" size="icon" className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border-white/20 text-white cursor-pointer">{isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}</Button>
            </TooltipButton>
            <ScreenShareButton onToggleScreenShare={onToggleScreenShare} isScreenSharing={isScreenSharing} variant="minimized" />
            <TooltipButton tooltip="End call">
              <Button onClick={onEndCall} variant="destructive" size="icon" className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white cursor-pointer"><PhoneOff size={18} /></Button>
            </TooltipButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 overflow-hidden">
      {/* custom scrollbar CSS injected for this component */}
      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.16) transparent; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)); border-radius: 12px; border: 2px solid transparent; background-clip: padding-box; }
        .resizable-handle { width: 8px; cursor: col-resize; height: 100%; background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); }
        .participant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
      `}</style>

      <div className="relative w-full h-full flex flex-col" style={{ paddingRight: isChatOpen ? `${chatWidth + 24}px` : '0', transition: 'padding-right 0.25s ease' }}>
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
          {/* Screen share header */}
          {isScreenSharing && screenStream && (
            <div className="w-full max-h-fit overflow-hidden p-4">
              <VideoTile stream={screenStream} isMuted={true} userName={"Your Screen"} isLocal={true} isScreenShare={true} />
            </div>
          )}

          {/* participants area */}
          <div className="p-4 ">
            <div className="participant-grid">
              {/* local tile always first */}
              {localStream && (
                <VideoTile stream={localStream} isMuted={isMuted} userName={`${userName} (You)`} isLocal={true} isVideoOff={isVideoOff} isSpeaking={isLocalSpeaking} />
              )}

              {Object.entries(remoteStreams).map(([peerId, remote]) => (
                <RemoteVideoTile key={peerId} peerId={peerId} remote={remote} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating reactions (no break) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {reactions.map((reaction) => (
              <motion.div key={reaction.id} initial={{ opacity: 0, y: 150, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }} exit={{ opacity: 0, y: -300, scale: 0.5, transition: { duration: 1, ease: 'easeOut' } }} className="absolute bottom-24" style={{ left: `${Math.random() * 80 + 10}%` }}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl" style={{ textShadow: '0 0 15px rgba(0,0,0,0.7)' }}>{reaction.emoji}</span>
                  <span className="text-white text-xs font-bold bg-black/50 px-2.5 py-1 rounded-full mt-1">{reaction.name}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/70 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl w-auto">
          <TooltipButton tooltip={isMuted ? 'Unmute' : 'Mute'}>
            <Button onClick={handleToggleMute} variant="outline" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 sm:w-14 sm:h-14">{isMuted ? <MicOff size={20} /> : <Mic size={20} />}</Button>
          </TooltipButton>

          <TooltipButton tooltip={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}>
            <Button onClick={handleToggleVideo} variant="outline" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 sm:w-14 sm:h-14">{isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}</Button>
          </TooltipButton>

          <ScreenShareButton onToggleScreenShare={onToggleScreenShare} isScreenSharing={isScreenSharing} variant="minimized" />

          <div className="relative" ref={reactionPickerRef}>
            <TooltipButton tooltip="Send Reaction">
              <Button onClick={() => setIsReactionPickerOpen(prev => !prev)} variant="outline" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 sm:w-14 sm:h-14"><Smile size={20} /></Button>
            </TooltipButton>

            <AnimatePresence>
              {isReactionPickerOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/80 p-2 rounded-full">
                  {['👍', '❤️', '👏', '😂'].map(emoji => (
                    <button key={emoji} onClick={() => handleSendReaction(emoji)} className="text-2xl p-2 rounded-full hover:bg-white/20 transition-transform hover:scale-125">{emoji}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <TooltipButton tooltip="End Call">
            <Button onClick={onEndCall} variant="destructive" size="icon" className="rounded-full w-16 h-12 sm:w-20 sm:h-14"><PhoneOff size={20} /></Button>
          </TooltipButton>

          <TooltipButton tooltip={isChatOpen ? 'Close Chat' : 'Open Chat'}>
            <Button onClick={() => setIsChatOpen(!isChatOpen)} variant="outline" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white w-12 h-12 sm:w-14 sm:h-14"><MessageSquare size={20} /></Button>
          </TooltipButton>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4" style={{ right: isChatOpen ? `${chatWidth + 24}px` : '1rem', transition: 'right 0.25s ease' }}>
          <TooltipButton tooltip="Minimize">
            <Button onClick={handleToggleMinimize} variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50 text-white"><Minimize2 size={20} /></Button>
          </TooltipButton>
        </div>
      </div>

      {/* Chat Panel (resizable) */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: '0%' }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute top-0 right-0 h-full flex">
            <ResizableBox
              className="bg-transparent"
              width={chatWidth}
              height={typeof window !== 'undefined' ? window.innerHeight : 720}
              axis="x"
              minConstraints={[minChatWidth, 200]}
              maxConstraints={[maxChatWidth, typeof window !== 'undefined' ? window.innerHeight : 2000]}
              resizeHandles={["w"]}
              onResizeStop={(e, data) => {
                const w = data.size.width;
                setChatWidth(Math.min(maxChatWidth, Math.max(minChatWidth, w)));
              }}
              handle={<div className="resizable-handle" /> as any}
            >
              <div className="h-full w-full bg-gray-900/90 backdrop-blur-lg border-l border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-white">In-call messages</h3>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setIsChatOpen(false)} variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10"><Maximize2 size={16} /></Button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
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
                    <input type="text" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()} className="bg-transparent w-full text-white placeholder:text-white/50 focus:outline-none text-sm" />
                    <Button onClick={handleSendChatMessage} size="icon" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8"><Send size={16} /></Button>
                  </div>
                </div>
              </div>
            </ResizableBox>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RemoteVideoTile = ({ peerId, remote }: { peerId: string; remote: { stream: MediaStream; name: string } }) => {
  const isSpeaking = useSpeakingIndicator(remote.stream);
  return <VideoTile stream={remote.stream} isMuted={false} userName={remote.name} isSpeaking={isSpeaking} />;
};

export default CallView;