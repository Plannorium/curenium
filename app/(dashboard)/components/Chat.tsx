"use client";

import React, { useEffect, useState, useRef } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendIcon, PaperclipIcon, BellIcon, SmileIcon, InfoIcon, SearchIcon, ChevronDownIcon, XIcon, Users, MessageCircle, FileIcon, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useChat } from '@/hooks/useChat';
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { FileAttachment } from './FileAttachment';
import DocumentPreview from './DocumentPreview';
import { startMeshCall } from "@/app/lib/simple-call-client";
import { CallView } from './CallView';
import { ReactionPicker } from './ReactionPicker';
import { ReactionDetailsModal } from './ReactionDetailsModal';
import { AnimatePresence } from "framer-motion";

interface User {
  id: string;
  _id: string;
  fullName: string;
  image?: string;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


interface MessageBubbleProps {
  msg: any;
  isSender: boolean;
  user: any;
  showTime: boolean;
  openDocPreview: (file: any) => void;
  openLightbox: (images: Array<{ url: string; name: string }>, initialIndex: number) => void;
  handleReaction: (messageId: string, emoji: string) => void;
  onReactionClick: (messageId: string, emoji: string, users: any[]) => void;
}

const MessageBubbleComponent = (props: MessageBubbleProps) => {
  const {
    msg,
    isSender,
    user,
    showTime,
    openDocPreview,
    openLightbox,
    handleReaction,
    onReactionClick,
  } = props;
  const { data: session } = useSession();
  const [isReactionPickerOpen, setReactionPickerOpen] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setReactionPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenLightbox = (clickedUrl: string) => {
    try {
      const filesList = Array.isArray(msg.file) ? msg.file : msg.file ? [msg.file] : [];
      const images = filesList
        .filter((file: any) => {
          if (!file) return false;
          return (file.resource_type && file.resource_type.toString().startsWith('image')) || (file.type && file.type.toString().startsWith('image')) || (file.url && /\.(jpe?g|png|webp|gif)$/i.test(file.url));
        })
        .map((file: any) => ({ url: file.url, name: file.name }));

      if (images.length === 0) {
        console.warn('No image files found to open in lightbox', msg.file);
        return;
      }

      const initialIndex = clickedUrl ? Math.max(0, images.findIndex((img: any) => img.url === clickedUrl)) : 0;
      openLightbox(images, initialIndex);
    } catch (err) {
      console.error('openLightbox error', err);
    }
  };
  const messageDate = msg.createdAt ? new Date(msg.createdAt) : null;
  const timeString = messageDate
    ? messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-background/50 shadow-sm">
        <AvatarImage src={user?.image || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {(msg.userName || "")
            .split(" ")
            .map((n: string) => n[0] || "")
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col gap-1 items-start`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm">
            {msg.userName}
          </span>
          {showTime && <span className="text-xs text-muted-foreground">{timeString}</span>}
        </div>

        <div
          className={`relative rounded-2xl px-3 md:px-4 py-3 shadow-sm border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] max-w-full sm:max-w-md lg:max-w-lg ${
            isSender
              ? "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 text-foreground rounded-md"
              : "bg-card/95 border-border/40 text-foreground rounded-bl-md"
          }`}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 left-full pl-2`}
          >
            {/* {onHoverActions} */}
          </div>
          {msg.file ? (
              <div className="space-y-2">
                {/* Support array of files or single file */}
                {Array.isArray(msg.file) ? (
                  msg.file.map((f, i) => (
                    <FileAttachment key={i} file={f} message={msg} onPreview={() => openDocPreview(f)} onOpenLightbox={handleOpenLightbox} />
                  ))
                ) : (
                  <FileAttachment file={msg.file} message={msg} onPreview={() => openDocPreview(msg.file)} onOpenLightbox={handleOpenLightbox} />
                )}

                {msg.text && msg.text.trim() && msg.text !== `File: ${(Array.isArray(msg.file) ? msg.file[0]?.name : (msg.file as any)?.name)}` && (
                  <p className="text-sm leading-relaxed break-words pt-2 border-t border-border/20 mt-2">
                    {msg.text}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed break-words">
                {msg.text || msg.content}
              </p>
            )}
          {isSender && !msg.file && (
            <div className="absolute bottom-1 right-2 text-xs text-muted-foreground opacity-70">
              ✓
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 min-h-[28px]">
          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
            <>
              {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                <div key={emoji} className="relative group">
                  <button onClick={() => onReactionClick(msg.id, emoji, users)} className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 text-xs hover:bg-primary/20 transition-colors duration-200">
                    <span>{emoji}</span>
                    <span className="font-medium text-primary">{Array.isArray(users) ? users.length : 0}</span>
                  </button>
                </div>
              ))}
            </>
          )}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity" ref={reactionPickerRef}>
            <button 
              onClick={() => setReactionPickerOpen(p => !p)} 
              className="flex items-center justify-center w-7 h-7 rounded-full bg-card hover:bg-accent transition-colors border shadow-sm"
            >
              <SmileIcon size={16} className="text-muted-foreground" />
            </button>
            {isReactionPickerOpen && (
              <ReactionPicker
                onEmojiClick={(emoji) => {
                  handleReaction(msg.id, emoji);
                  setReactionPickerOpen(false);
                }}
                onClose={() => setReactionPickerOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Shallow compare all props except msg and onHoverActions
  if (
    prevProps.isSender !== nextProps.isSender ||
    prevProps.user?.id !== nextProps.user?.id ||
    prevProps.showTime !== nextProps.showTime ||
    prevProps.openDocPreview !== nextProps.openDocPreview ||
    prevProps.openLightbox !== nextProps.openLightbox ||
    prevProps.handleReaction !== nextProps.handleReaction ||
    prevProps.onReactionClick !== nextProps.onReactionClick
  ) {
    return false;
  }

  // Compare msg object, but skip reactions for now
  if (
    prevProps.msg.id !== nextProps.msg.id ||
    prevProps.msg.text !== nextProps.msg.text ||
    prevProps.msg.content !== nextProps.msg.content
  ) {
    return false;
  }

  // Deep compare reactions
  const prevReactions = prevProps.msg.reactions || {};
  const nextReactions = nextProps.msg.reactions || {};

  const prevReactionKeys = Object.keys(prevReactions);
  const nextReactionKeys = Object.keys(nextReactions);

  if (prevReactionKeys.length !== nextReactionKeys.length) {
    return false;
  }

  for (const emoji of prevReactionKeys) {
    const prevUsers = prevReactions[emoji];
    const nextUsers = nextReactions[emoji];
    if (!nextUsers || (Array.isArray(prevUsers) ? prevUsers.length : 0) !== (Array.isArray(nextUsers) ? nextUsers.length : 0)) {
      return false;
    }
  }

  return true; // Props are equal
});

export default function Chat() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Anonymous';
  const [activeRoom, setActiveRoom] = useState("general");
  // const { messages, sendMessage, sendFile, typingUsers, sendTyping, onlineUsers } = useChat(activeRoom);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [lightbox, setLightbox] = useState<{ images: Array<{ url: string; name: string }>, initialIndex: number } | null>(null);

  const openLightbox = (images: Array<{ url: string; name: string }>, initialIndex: number) => {
    setLightbox({ images, initialIndex });
  };
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, { stream: MediaStream, name: string }>>({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const callRef = useRef<{ endCall: () => void; replaceTrack: (track: MediaStreamTrack) => void; } | null>(null);
  const {
    messages,
    sendCombinedMessage,
    uploadFile,
    onlineUsers,
    typingUsers,
    sendTyping,
    sendPayload,
    startCall
  } = useChat(activeRoom);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const [activeReactionDetails, setActiveReactionDetails] = useState<{ messageId: string; emoji: string; users: any[] } | null>(null);

  const handleReaction = (messageId: string, emoji: string) => {
    if (!session?.user) return;
    sendPayload({
      type: 'reaction',
      payload: {
        messageId,
        emoji,
        userId: session.user.id,
        userName: session.user.name,
      }
    });
  };

  const handleReactionClick = (messageId: string, emoji: string, users: any[]) => {
    setActiveReactionDetails({ messageId, emoji, users });
  };

  const handleEndCall = () => {
    if (callRef.current) {
      callRef.current.endCall();
      callRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStreams({});
    setIsCallActive(false);
    setIsScreenSharing(false);
    setScreenStream(null);
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
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

        // When the user stops sharing from the browser UI
        screenTrack.onended = () => {
          if (localStream && callRef.current) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
              callRef.current.replaceTrack(videoTrack);
            }
          }
          setScreenStream(null);
          setIsScreenSharing(false);
        };

        setScreenStream(stream);
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error starting screen share:", error);
      }
    }
  };


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentResultIndex !== -1 && searchResults.length > 0) {
      const messageIndex = searchResults[currentResultIndex];
      messageRefs.current[messageIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentResultIndex, searchResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json() as { users: User[] };
          setUsers(Array.isArray(data) ? data : data.users || []);
        }
      } catch (_error) {
        console.error('Failed to fetch users:', _error);
      }
    };

    fetchUsers();
  }, []);



  const openDocPreview = (file: any) => {
    setSelectedDoc(file);
    setIsDocModalOpen(true);
  };

  const closeDocPreview = () => {
    setIsDocModalOpen(false);
    setSelectedDoc(null);
  };

  const handleChatSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setChatSearchQuery(query);

    if (query) {
      const results = messages.reduce((acc, msg, index) => {
        if (msg.text.toLowerCase().includes(query.toLowerCase())) {
          acc.push(index);
        }
        return acc;
      }, [] as number[]);
      setSearchResults(results);
      setCurrentResultIndex(results.length > 0 ? 0 : -1);
    } else {
      setSearchResults([]);
      setCurrentResultIndex(-1);
    }
  };

  const handleNextResult = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentResultIndex + 1) % searchResults.length;
      setCurrentResultIndex(nextIndex);
    }
  };

  const handlePrevResult = () => {
    if (searchResults.length > 0) {
      const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
      setCurrentResultIndex(prevIndex);
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setChatSearchQuery("");
    setSearchResults([]);
    setCurrentResultIndex(-1);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText((prevText) => prevText + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  interface ConversionProgress {
    status: 'queued' | 'converting' | 'uploading' | 'completed' | 'failed';
    progress: number;
    pdfUrl?: string;
    error?: string;
  }

  interface ConversionResponse {
    conversionId: string;
    status: string;
    pdfUrl?: string;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'audio/mpeg',
        'audio/wav',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      const validFiles = newFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} is too large. Max size is 5MB.`);
          return false;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`File ${file.name} has an invalid type. Allowed types: images, audio, PDF, Word documents.`);
          return false;
        }
        return true;
      });

      // Handle Word documents conversion
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          // Check if it's a Word document
          if (file.type.includes('word')) {
            try {
              const formData = new FormData();
              formData.append('file', file);

              const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error('Conversion failed');
              }

              const { conversionId } = await response.json() as ConversionResponse;

              // Poll for conversion progress
              while (true) {
                const progressResponse = await fetch(`/api/convert?id=${conversionId}`);
                if (!progressResponse.ok) break;

                const progress = await progressResponse.json() as ConversionProgress;
                setUploadProgress(prev => ({
                  ...prev,
                  [file.name]: progress.progress,
                }));

                if (progress.status === 'completed' && progress.pdfUrl) {
                  const response = await fetch(progress.pdfUrl);
                  const blob = await response.blob();
                  return new File([blob], file.name.replace(/\.docx?$/, '.pdf'), { type: 'application/pdf' });
                }

                if (progress.status === 'failed') {
                  throw new Error(progress.error || 'Conversion failed');
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (error) {
              console.error('Failed to convert Word document:', error);
              alert(`Failed to convert ${file.name} to PDF. The original file will be used.`);
              return file;
            }
          }
          return file;
        })
      );

      setStagedFiles(prev => [...prev, ...processedFiles]);
    }
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((text.trim() || stagedFiles.length > 0) && session?.user) {
      setIsUploading(true);
      try {
        if (stagedFiles.length > 0) {
          const uploadPromises = stagedFiles.map(file =>
            uploadFile(file, (progress) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            })
          );
          const uploadedFiles = await Promise.all(uploadPromises);

          const newProgress = { ...uploadProgress };
          stagedFiles.forEach(file => {
            newProgress[file.name] = 101; // Processing
          });
          setUploadProgress(newProgress);

          // Use sendCombinedMessage to send text and files together
          await sendCombinedMessage(text.trim(), uploadedFiles);

          setStagedFiles([]);
          setUploadProgress({});
        } else if (text.trim()) {
          await sendCombinedMessage(text.trim(), []);
        }
        setText("");
      } catch (error) {
        console.error("Error sending message or file:", error);
        alert("Failed to send message or file.");
      } finally {
        setIsUploading(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        sendTyping(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (!typingTimeoutRef.current) {
      sendTyping(true);
    } else {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleStartCall = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');

      if (!hasVideo && !hasAudio) {
        alert("No camera or microphone found. Please connect a device and grant permission to make a call.");
        return;
      }

      // Request a stream with the devices that are available.
      const stream = await navigator.mediaDevices.getUserMedia({ video: hasVideo, audio: hasAudio });
      
      setLocalStream(stream);
      setIsCallActive(true);
      
      if (session?.user?.token) {
        
        const call = await startMeshCall({
          roomId: activeRoom,
          localStream: stream,
          token: session.user.token,
          userName: session?.user?.fullName || "Anonymous",
          onRemoteStream: (remoteStream, peerId, userName) => {
            setRemoteStreams((prev) => ({ ...prev, [peerId]: { stream: remoteStream, name: userName } }));
          },
          onParticipantLeft: (peerId) => {
            setRemoteStreams(prev => {
              const newStreams = { ...prev };
              delete newStreams[peerId];
              return newStreams;
            });
          },
          startCall: startCall
        });
        callRef.current = call;
      }
    } catch (error) {
      console.error("Error starting call:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert("Permission to use camera and microphone was denied. Please grant access in your browser settings to make a call.");
        } else if (error.name === "NotFoundError") {
          alert("No camera or microphone found. Please connect a device to make a call.");
        } else {
          alert(`An error occurred while starting the call: ${error.message}`);
        }
      }
      // Ensure call state is cleaned up on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setIsCallActive(false);
    }
  };

  if (!session) return (
    <div className="flex items-center justify-center h-full backdrop-blur-sm bg-card/50 rounded-2xl border border-border/50">
      <div className="text-center p-8">
        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Sign in to view conversations.</p>
      </div>
    </div>
  );

  const handleRoomChange = (room: string) => {
    setActiveRoom(room);
  };

  const createDirectRoom = (userId1: string, userId2: string) => {
    const sortedIds = [userId1, userId2].sort();
    return sortedIds.join('-');
  };

  const departments = [
    { name: 'Emergency Ward', id: 'emergency' },
    { name: 'Cardiology', id: 'cardiology' },
    { name: 'Pediatrics', id: 'pediatrics' },
    { name: 'Oncology', id: 'oncology' },
  ];



  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-background/95 rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>
      
      <div className="relative flex-1 flex min-h-0">
        {/* Channel List Sidebar */}
        <div className="hidden md:block w-64 backdrop-blur-lg bg-card/80 border-r border-border/50 flex-shrink-0">
          <div className="p-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search conversations" 
                className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-full w-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <div className="px-3 pb-2">
            <h3 className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              Channels
            </h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => handleRoomChange('general')}
                className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${
                  activeRoom === 'general'
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}>
                <span className="text-muted-foreground mr-3 font-bold">#</span>
                General
              </button>
            </div>
          </div>
          
          {/* Departments Section */}
          <div className="px-3 pb-2">
            <h3 className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <Users className="h-3 w-3 mr-2" />
              Departments
            </h3>
            <div className="mt-2 space-y-1">
              {departments
                .filter((dept) => dept.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((dept) => (
                <button 
                  key={dept.id}
                  onClick={() => handleRoomChange(dept.id)}
                  className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${
                    activeRoom === dept.id
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  }`}>
                  <span className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${
                    activeRoom === dept.id ? 'bg-primary' : 'bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity'
                  }`}></span>
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Direct Messages Section */}
          <div className="px-3 pb-2 mt-6">
            <h3 className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <MessageCircle className="h-3 w-3 mr-2" />
              Direct Messages
            </h3>
            <div className="mt-2 space-y-1">
              {users
                .filter((user) => user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user) => {
                const isSelf = user._id === session?.user?._id;
                const room = createDirectRoom(session?.user?._id || '', user._id);

                return (
                  <button 
                    key={user._id}
                    onClick={() => handleRoomChange(room)}
                    className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${                    activeRoom === room
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative mr-3">
                      <Avatar className="h-6 w-6 ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-200">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.includes(user._id) && !isSelf && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                      )}
                    </div>
                    {isSelf ? 'You (Notes to self)' : user.fullName}
                  </button>
                );
              })}            </div>
          </div>
        </div>



        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isCallActive && localStream && (
            <CallView
            localStream={localStream}
            remoteStreams={remoteStreams}
            onEndCall={handleEndCall}
            userName={userName}
            onToggleScreenShare={handleToggleScreenShare}
            isScreenSharing={isScreenSharing}
            screenStream={screenStream}
          />
          )}
          {/* Chat Header */}
          <div className="backdrop-blur-sm bg-card/50 border-b border-border/50 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-foreground">
                {activeRoom === 'general' ? 'General' : departments.find(d => d.id === activeRoom)?.name || (users && users.find(u => createDirectRoom(session?.user?._id || '', u._id) === activeRoom)?.fullName) || 'Chat'}
              </h2>
              <div className="ml-3 bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-3 py-1 rounded-full font-semibold border border-green-500/20">
                 {onlineUsers.length} online
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200" onClick={() => setShowSearch(true)}>
                <SearchIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200" 
                onClick={handleStartCall}
                disabled={!session}
              >
                <VideoIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
                <span className="ml-2">Call</span>
              </Button>
              <Button variant="ghost" size="sm" className="p-2.5 rounded-xl hover:bg-accent/50 transition-all duration-200">
                <InfoIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="border-b border-border/50 p-2 flex items-center gap-2 bg-card/50 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="Search in chat..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-1"
                value={chatSearchQuery}
                onChange={handleChatSearch}
              />
              {searchResults.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {currentResultIndex + 1} of {searchResults.length}
                </span>
              )}
              <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7" onClick={handlePrevResult} disabled={searchResults.length === 0}>
                <ChevronDownIcon size={16} className="transform rotate-90" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7" onClick={handleNextResult} disabled={searchResults.length === 0}>
                <ChevronDownIcon size={16} className="transform -rotate-90" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7" onClick={handleCloseSearch}>
                <XIcon size={16} />
              </Button>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6 custom-scrollbar">
            {messages.map((msg, index) => {
              const isSender = msg.userId === session?.user?._id;
              const user = users.find(u => u._id === msg.userId);
              const prevMsg = messages[index - 1];
              const showTimeSeparator = index === 0 ||
                (prevMsg && new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString());



              return (
                <div
                  key={msg.id}
                  ref={(el) => { messageRefs.current[index] = el; }}
                  className={`${searchResults.includes(index) ? (index === searchResults[currentResultIndex] ? 'bg-primary/10 rounded-lg' : '') : ''}`}>
                  {showTimeSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-card/80 border border-border/40 rounded-full px-4 py-1 text-xs text-muted-foreground font-medium">
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  <MessageBubble
                    msg={msg}
                    isSender={isSender}
                    user={user}

                    showTime={true}
                    openDocPreview={openDocPreview}
                    openLightbox={openLightbox}
                    handleReaction={handleReaction}
                    onReactionClick={handleReactionClick}
                  />
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Typing Indicator */}
          <div className="h-6 px-4 pb-2 flex items-center">
            {typingUsers.length > 0 && (
              <div className="text-xs text-muted-foreground italic animate-pulse">
                {typingUsers.map((user) => user).join(', ')}
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="backdrop-blur-sm bg-card/50 border-t border-border/50 p-4">
            {stagedFiles.length > 0 && (
              <div className="mb-2 p-2 border border-border/50 rounded-lg bg-background/50">
                <p className="text-sm font-semibold mb-2 px-2">Attached Files</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {stagedFiles.map((file, index) => (
                    <div key={index} className="relative group bg-background/70 p-2 rounded-lg flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2 w-full">
                        <FileIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        {!isUploading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-1 opacity-50 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveStagedFile(index)}
                          >
                            <XIcon size={14} />
                          </Button>
                        )}
                      </div>
                      {isUploading && uploadProgress[file.name] !== undefined && (
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                          <Progress value={uploadProgress[file.name] > 100 ? 100 : uploadProgress[file.name]} className="h-2" />
                          {uploadProgress[file.name] > 100 && (
                            <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold">
                              PROCESSING
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="relative">
              <div className="flex items-end backdrop-blur-sm bg-background/50 border border-border/60 rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                 <textarea
                   value={text}
                   onChange={handleTyping}
                   onKeyDown={handleKeyDown}
                   placeholder="Type your message..."
                   className="bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground w-full resize-none py-1 text-sm leading-relaxed max-h-32"
                   rows={1}
                 />
                 <div className="flex items-center space-x-1 ml-3">
                   <div ref={emojiPickerRef}>
                     <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                       <SmileIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
                     </Button>
                   </div>
                   <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200" onClick={() => fileInputRef.current?.click()}>
                     <PaperclipIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
                   </Button>
                   <Button
                     variant="ghost"
                     size="sm"
                     className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-200 group"
                     onClick={() => setShowAlertModal(true)}
                   >
                     <BellIcon size={18} className="text-red-500 group-hover:text-red-600 transition-colors" />
                   </Button>
                   <Button
                     onClick={handleSendMessage}
                     disabled={(!text.trim() && stagedFiles.length === 0) || isUploading}
                     size="sm"
                     className="h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                   >
                     <SendIcon size={18} />
                   </Button>
                 </div>
               </div>
               {showEmojiPicker && (
                 <div className="absolute bottom-full left-0 mb-2 z-10">
                   <EmojiPicker
                     onEmojiClick={handleEmojiClick}
                     />
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* AI Summary Panel */}
        <div className="hidden lg:block w-72 backdrop-blur-lg bg-card/80 border-l border-border/50 overflow-y-auto">
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center">
                <div className="p-1.5 bg-primary/10 rounded-lg mr-2 border border-primary/20">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                AI Assistant
              </h3>
              <Button variant="ghost" size="sm" className="p-1.5 rounded-xl hover:bg-accent/50 transition-all duration-200">
                <ChevronDownIcon size={16} className="text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="backdrop-blur-sm bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 shadow-sm">
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                Conversation Summary
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Patient in Room 302 (Mohammed Al-Farsi, 58) experienced a
                cardiac event with dropping blood pressure and irregular
                heartbeat. Emergency response team stabilized the patient.
                Current plan is to transfer to ICU for monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full backdrop-blur-xl bg-card/95 border-border/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-primary/5 rounded-xl pointer-events-none"></div>
            
            <CardHeader className="relative pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <div className="p-2 bg-red-500/10 rounded-lg mr-3 border border-red-500/20">
                    <BellIcon size={20} className="text-red-500" />
                  </div>
                  Send Critical Alert
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAlertModal(false)} 
                  className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200"
                >
                  <XIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Critical alerts notify all team members immediately via push
                notifications and SMS. Use only for urgent situations requiring
                immediate attention.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Alert Type
                </label>
                <select className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl px-4 py-3 w-full text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200">
                  <option>Medical Emergency</option>
                  <option>Code Blue</option>
                  <option>Urgent Assistance</option>
                  <option>Critical Information</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Message
                </label>
                <textarea 
                  className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl px-4 py-3 w-full text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 resize-none" 
                  rows={3} 
                  placeholder="Describe the emergency situation..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Alert Recipients
                </label>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200">
                    Emergency Ward Team
                    <Button variant="ghost" size="sm" className="p-0.5 ml-2 rounded-full hover:bg-primary/20 transition-all duration-200">
                      <XIcon size={12} />
                    </Button>
                  </div>
                  <div className="bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200">
                    Dr. John Miller
                    <Button variant="ghost" size="sm" className="p-0.5 ml-2 rounded-full hover:bg-primary/20 transition-all duration-200">
                      <XIcon size={12} />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full px-3 py-1.5 text-sm backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200">
                    + Add more
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAlertModal(false)} 
                  className="flex-1 backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Send Critical Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Lightbox */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.initialIndex}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* PDF Modal */}
      {isDocModalOpen && selectedDoc && (
        <DocumentPreview
          file={selectedDoc}
          onClose={closeDocPreview}
        />
      )}

      {/* Reaction Details Modal */}
      <AnimatePresence>
          {activeReactionDetails && (
            <ReactionDetailsModal
              isOpen={!!activeReactionDetails}
              onClose={() => {
                setActiveReactionDetails(null);
              }}
              messageId={activeReactionDetails.messageId}
              emoji={activeReactionDetails.emoji}
              users={activeReactionDetails.users}
              allUsers={users}
              currentUserId={session?.user?.id}
              onRemoveReaction={handleReaction}
              onAddReaction={(emoji) => handleReaction(activeReactionDetails.messageId, emoji)}
            />
          )}
        </AnimatePresence>
    </div>
  );
}