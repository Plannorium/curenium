"use client";

import React, { useEffect, useState, useRef } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendIcon, PaperclipIcon, BellIcon, SmileIcon, InfoIcon, SearchIcon, ChevronDownIcon, XIcon, Users, MessageCircle, FileIcon, VideoIcon, Loader2, Plus, Eye, Copy, Download, ExternalLink, ReplyIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
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
import { UserProfileCard } from './UserProfileCard';
import { AlertDetailsModal } from './AlertDetailsModal';
import { SendAlertModal } from './SendAlertModal';
import { IMessage } from '@/types/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initAudio, playSound } from '@/lib/sound/soundGenerator';
import { CreateChannelModal } from './CreateChannelModal';
import { ManageChannelModal } from './ManageChannelModal';
import SoundPalette from './SoundPalette';

interface User {
  id: string;
  _id: string;
  fullName: string;
  image?: string;
  role?: string;
  email?: string;
  isOnline?: boolean;
}

interface AlertMessage {
  _id: string;
  level: 'critical' | 'urgent' | 'info';
  message: string;
  createdBy: {
    _id: string;
    fullName: string;
    image?: string;
  };
  createdAt: string;
}

interface Channel {
  _id: string;
  id: string; // for compatibility if used elsewhere
  name: string;
  members: string[];
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
  onAlertClick: (alert: AlertMessage) => void;
  onReactionClick: (messageId: string, emoji: string, users: any[]) => void;
  onReply: (message: any) => void;
  sendReadReceipt: (messageId: string) => void;
}

const MessageBubble = ({
  msg,
  isSender,
    user,
    showTime,
    openDocPreview,
    openLightbox,
    handleReaction,
    onAlertClick,
    onReactionClick,
    onReply,
    sendReadReceipt,
}: MessageBubbleProps) => {
  const { data: session } = useSession();
  const [isReactionPickerOpen, setReactionPickerOpen] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageRef.current || isSender || msg.status === 'read') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sendReadReceipt(msg.id);
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(messageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [msg.id, isSender, msg.status, sendReadReceipt]);

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

  const renderRepliedMessage = () => {
    if (!msg.replyTo) return null;

    return (
      <div className="mb-2 p-2 rounded-md bg-background/30 border-l-2 border-primary/50 text-xs">
        <p className="font-semibold text-primary/80 text-xs">
          Replying to {msg.replyTo.userName}
        </p>
        <p className="text-muted-foreground truncate">
          {msg.replyTo.text}
        </p>
      </div>
    );
  };
  const timeString = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

  // ---------- IMAGE GALLERY ----------
  const renderImages = () => {
    const files = Array.isArray(msg.file) ? msg.file : msg.file ? [msg.file] : [];
    const images = files.filter(
      (f: any) =>
        f?.resource_type?.startsWith?.("image") ||
        f?.type?.startsWith?.("image") ||
        /\.(jpe?g|png|webp|gif)$/i.test(f?.url)
    );

    if (!images.length) return null;

    return (
      <div className={images.length > 1 ? "grid grid-cols-2 gap-1 mt-1" : "mt-1 "}>
        {images.map((img: any, i: number) => (
          <button
            key={i}
            onClick={() => openLightbox(images.map((f: any) => ({ url: f.url, name: f.name })), i)}
            className="relative overflow-hidden rounded-lg group cursor-pointer"
          >
            <img
              src={img.url}
              alt={img.name}
              className="h-auto max-h-28 max-w-[330px] object-cover rounded-lg transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Eye className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    );
  };

  // ---------- NON‑IMAGE FILES ----------
  const renderFiles = () => {
    const files = Array.isArray(msg.file) ? msg.file : msg.file ? [msg.file] : [];
    const nonImages = files.filter(
      (f: any) =>
        !f?.resource_type?.startsWith?.("image") &&
        !f?.type?.startsWith?.("image") &&
        !/\.(jpe?g|png|webp|gif)$/i.test(f?.url)
    );

    if (!nonImages.length) return null;

    return (
      <div className="space-y-2">
        {nonImages.map((f: any, i: number) => (
          <FileAttachment
            key={i}
            file={f}
            onPreview={() => openDocPreview(f)}
          />
        ))}
      </div>
    );
  };

  if (msg.type === 'alert_notification' && msg.alert) {
    const alert: AlertMessage = msg.alert;
    const alertColors = {
      critical: 'red',
      urgent: 'amber',
      info: 'blue',
    };
    const color = alertColors[alert.level];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full flex justify-center"
      >
        <button
          onClick={() => onAlertClick(alert)}
          className={`w-full max-w-lg text-left group relative flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm border shadow-sm hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 bg-${color}-500/10 border-${color}-500/30 hover:bg-${color}-500/15 hover:border-${color}-500/40`}
        >
          <div className={`p-2 bg-${color}-500/10 rounded-lg mr-4 border border-${color}-500/20`}>
            <BellIcon size={24} className={`text-${color}-500 animate-pulse`} />
          </div>
          <div className="flex-1">
            <p className={`font-bold text-sm text-${color}-500 uppercase`}>{alert.level} Alert</p>
            <p className="font-medium text-foreground">{alert.message}</p>
          </div>
        </button>
      </motion.div>
    );
  }
  // ---------- MAIN RENDER ----------
  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-background/50 shadow-sm">
        <AvatarImage src={user?.image || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {(msg.userName ?? "")
            .split(" ")
            .map((n: string) => n[0] || "")
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div
        className="flex flex-col gap-1 items-start"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm">
            {msg.userName}
          </span>
          {showTime && <span className="text-xs text-muted-foreground">{timeString}</span>}
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`relative rounded-2xl px-0.5 md:px-1 py-1.5 cursor-pointer shadow-sm border transition-all hover:shadow-lg hover:scale-[1.01] max-w-full sm:max-w-md lg:max-w-lg ${
              isSender
                ? "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
                : "bg-card/95 border-border/40"
            }`}
          >
            <div className="absolute top-0 right-0 mt-[-12px] mr-1.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border rounded-2xl px-1.5 py-1 shadow-md z-10">
              <div className="relative" ref={reactionPickerRef}>
                <button onClick={() => setReactionPickerOpen(p => !p)} className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors">
                  <SmileIcon size={15} className="text-muted-foreground" />
                </button>
                {isReactionPickerOpen && (
                  <div className="absolute z-20 bottom-full right-0 mb-2">
                    <ReactionPicker onEmojiClick={(emoji) => { handleReaction(msg.id, emoji); setReactionPickerOpen(false); }} onClose={() => setReactionPickerOpen(false)} />
                  </div>
                )}
              </div>
              <button onClick={() => onReply(msg)} className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors">
                <ReplyIcon size={15} className="text-muted-foreground" />
              </button>
              <button className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors">
                <MoreHorizontal size={15} className="text-muted-foreground" />
              </button>
            </div>

            {/* REPLIED TO MESSAGE */}
            {renderRepliedMessage()}

            {/* TEXT */}
            {(msg.text || msg.content) && (
              <p className="text-[0.75rem] leading-relaxed break-words px-2">{msg.text || msg.content}</p>
            )}

            {/* IMAGES */}
            {renderImages()}

            {/* FILES */}
            {renderFiles()}

            {/* SENT CHECK */}
            {isSender && !msg.file && (
              <div className="absolute bottom-1 right-0 text-[0.78rem] text-muted-foreground opacity-70">
                {msg.status === 'read' ? (
                  <span className="text-blue-500">✓✓</span>
                ) : msg.status === 'delivered' ? (
                  <span>✓✓</span>
                ) : (
                  <span>✓</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 min-h-[24px]">
          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
            <>
              {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                <div key={emoji} className="relative group">
                  <button onClick={() => onReactionClick(msg.id, emoji, users)} className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 text-[0.625rem] hover:bg-primary/20 transition-colors duration-200">
                    <span>{emoji}</span>
                    <span className="font-medium text-primary text-[0.6rem]">{Array.isArray(users) ? users.length : 0}</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [recentDms, setRecentDms] = useState<any[]>([]); // Add this line
  const [lightbox, setLightbox] = useState<{ images: Array<{ url: string; name: string }>, initialIndex: number } | null>(null);
  const [isCreateChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [managingChannel, setManagingChannel] = useState<Channel | null>(null);
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  const [stagedFilePreviews, setStagedFilePreviews] = useState<string[]>([]);
  const openLightbox = (images: Array<{ url: string; name: string }>, initialIndex: number) => {
    setLightbox({ images, initialIndex });
  };
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, { stream: MediaStream, name: string }>>({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const callRef = useRef<{ endCall: () => void; replaceTrack: (track: MediaStreamTrack) => void; } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertMessage | null>(null);
  const {
    messages,
    sendCombinedMessage,
    uploadFile,
    onlineUsers,
    typingUsers,
    sendTyping,
    sendPayload,
    startCall,
    sendReadReceipt,
  } = useChat(activeRoom);

  const prevMessagesLengthRef = useRef(messages.length);

  // Play sound on new message received
  useEffect(() => {
    const wasMessageAdded = messages.length > prevMessagesLengthRef.current;
    if (wasMessageAdded) {
      const newMessage = messages[messages.length - 1];
      const isFromAnotherUser = newMessage && newMessage.userId !== session?.user?._id;
      if (isFromAnotherUser) {
        playSound('notification');
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, session?.user?._id]);

  const handleStartChat = (userId: string) => {
    console.log(`Starting chat with user ${userId}`);
    setSelectedUser(null);
    // Here you would typically switch to a direct message room
    // For now, we'll just log the action
  };

  const handleAlertClick = (alert: AlertMessage) => {
    setSelectedAlert(alert);
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
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

  const fetchChannels = async () => {
    try {
      interface ChannelsApiResponse {
        channels: Channel[];
      }
      const response = await fetch('/api/channels');
      if (response.ok) {
        const data = await response.json() as ChannelsApiResponse;
        setChannels(data.channels || []);
      }
    } catch (error) { console.error('Failed to fetch channels:', error); }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    const fetchRecentDms = async () => {
      try {
        const response = await fetch('/api/messages/recent');
        if (response.ok) {
          const data: IMessage[] = await response.json();
          setRecentDms(data);
        }
      } catch (error) {
        console.error('Failed to fetch recent DMs:', error);
      }
    };

    fetchRecentDms();
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

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    console.log('Emoji clicked:', emojiData.emoji);
    console.log('Current text before:', text);
    setText(prevText => {
      const newText = prevText + emojiData.emoji;
      console.log('New text after:', newText);
      return newText;
    });
    textareaRef.current?.focus();
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      // Generate previews for image files
      const newPreviews = await Promise.all(
        processedFiles.map(file => {
          if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
          }
          return Promise.resolve(''); // No preview for non-images
        })
      );
      setStagedFilePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => stagedFilePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [stagedFilePreviews]);

  const handleSendMessage = async () => {
    if ((text.trim() || stagedFiles.length > 0) && session?.user) {
      initAudio(); // Ensure audio is ready
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
          setReplyingTo(null);

          setStagedFiles([]);
          setUploadProgress({});
          setStagedFilePreviews([]);
        } else if (text.trim()) {
          await sendCombinedMessage(text.trim(), []);
        }
        setReplyingTo(null);
        playSound('messageSent');
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

  const handleReply = (message: any) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
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
    initAudio(); // Ensure audio is ready
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
      playSound('callStart');
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

  const currentUser = users.find(u => u._id === session?.user?._id);


  return (
    <>
      <div className="h-full flex flex-col backdrop-blur-xl bg-background/95 rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>

        <div className="relative flex-1 flex min-h-0">
          {/* Channel List Sidebar */}
          <div className="hidden md:block w-64 backdrop-blur-lg bg-card/80 border-r border-border/50 flex-shrink-0">
            <div className="p-4">
              <div className="relative" ref={emojiPickerRef}>
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
              <button
                onClick={() => setIsChannelsOpen(!isChannelsOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >
                <h3 className="flex items-center">
                  <Users className="h-3 w-3 mr-2" />
                  Channels
                </h3>
                <ChevronDownIcon
                  size={16}
                  className={`transform transition-transform duration-200 ${isChannelsOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {isChannelsOpen && (
                <div className="mt-2 space-y-1">
                  {channels
                    .filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((channel) => (
                      <div
                        key={channel._id}
                        className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:bg-accent/50 ${activeRoom === channel.name.toLowerCase().replace(/ /g, '-')
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        <button className="flex items-center flex-1 text-left" onClick={() => handleRoomChange(channel.name.toLowerCase().replace(/ /g, '-'))}>
                          <span className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${activeRoom === channel.name.toLowerCase().replace(/ /g, '-') ? 'bg-primary' : 'bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity'
                            }`}></span>
                          {channel.name}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setManagingChannel(channel);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1 rounded-md"
                        >
                          <Users size={14} />
                        </button>
                      </div>
                    ))}
                  <div className="px-3">
                    <button
                      onClick={() => setCreateChannelModalOpen(true)}
                      className="group cursor-pointer flex items-center justify-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-300 border border-dashed border-border/50 hover:border-primary/50 bg-background/20 hover:bg-accent/50 text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <Plus size={16} className="mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      Add Channel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Messages Section */}
            <div className="px-3 pb-2 mt-6">
              <button
                onClick={() => setIsDmsOpen(!isDmsOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider"
              >
                <h3 className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-2" />
                  Direct Messages
                </h3>
                <ChevronDownIcon
                  size={16}
                  className={`transform transition-transform duration-200 ${isDmsOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {isDmsOpen && (
                <div className="mt-2 space-y-1">
                  {/* Self-chat / Notes to self */}
                  {currentUser && (
                    <button
                      onClick={() => handleRoomChange(createDirectRoom(currentUser._id, currentUser._id))}
                      className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${activeRoom === createDirectRoom(currentUser._id, currentUser._id)
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md'
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <div className="relative mr-3">
                        <Avatar className="h-6 w-6 ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-200">
                          <AvatarImage src={currentUser.image || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {currentUser.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground -mt-1">Notes to self</span>
                      </div>
                    </button>
                  )}
                  {recentDms
                    .map(dm => {
                      const otherUserId = dm.room.split('-').find(id => id !== session?.user?._id);
                      const user = users.find(u => u._id === otherUserId);
                      return { ...dm, user };
                    })
                    .filter(dm => dm.user && dm.room.includes('-'))
                    .filter(dm => !searchQuery || (dm.user && dm.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(dm => {
                      if (!dm.user) return null;
                      const room = dm.room;
                      const user = dm.user;

                      return (
                        <button
                          key={dm._id}
                          onClick={() => handleRoomChange(room)}
                          className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${activeRoom === room
                              ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md'
                              : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                            }`}>
                          <div className="relative mr-3">
                            <Avatar className="h-6 w-6 ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-200">
                              <AvatarImage src={user.image || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers.includes(user._id) && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                            )}
                          </div>
                          {user.fullName}
                        </button>
                      );
                    })
                  }
                </div>
              )}
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
                  {activeRoom === 'general' ? 'General' : channels.find(c => c.name.toLowerCase().replace(/ /g, '-') === activeRoom)?.name || (users && users.find(u => createDirectRoom(session?.user?._id || '', u._id) === activeRoom)?.fullName) || 'Chat'}
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
                  <span className="ml-2">Sync</span>
                </Button>
                <div className="flex items-center -space-x-2 pr-2">
                  {users.slice(0, 5).map(user => {
                    const isOnline = onlineUsers.includes(user.fullName);
                    return (
                      <div key={user.id || user._id} className="relative group/avatar" onClick={() => setSelectedUser(user)}>
                        <Avatar className="h-8 w-8 border-2 border-background hover:z-10 transition-all duration-200 cursor-pointer">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="text-xs font-semibold">
                            {(user.fullName || "").split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                    );
                  })}
                  {users.length > 5 && (
                    <div className="relative group/avatar">
                      <Avatar className="h-8 w-8 border-2 border-background cursor-pointer">
                        <AvatarFallback className="text-xs font-semibold bg-muted">
                          +{users.length - 5}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs bg-card text-foreground text-xs rounded py-2 px-3 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border z-20">
                        <p className="font-semibold mb-1">More members:</p>
                        <p className="font-normal">{users.slice(5).map(u => u.fullName).join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
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
                      onAlertClick={handleAlertClick}
                      onReactionClick={handleReactionClick}
                      onReply={handleReply}
                      sendReadReceipt={sendReadReceipt}
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
              {replyingTo && (
                <div className="mb-2 p-2 border-l-2 border-primary bg-background/50 rounded-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-primary">
                        Replying to {replyingTo.userName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {replyingTo.text}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => setReplyingTo(null)}>
                      <XIcon size={14} />
                    </Button>
                  </div>
                </div>
              )}
              {stagedFiles.length > 0 && (
                <div className="mb-2 p-2 border border-border/50 rounded-lg bg-background/50">
                  <p className="text-sm font-semibold mb-2 px-2">Attached Files</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {stagedFiles.map((file, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="relative group bg-background/70 p-2 rounded-lg flex flex-col items-start gap-2 h-24 justify-between">
                          {stagedFilePreviews[index] ? (
                            <img src={stagedFilePreviews[index]} alt={file.name} className="w-full h-16 object-cover rounded-md" />
                          ) : (
                            <div className="flex items-center gap-2 w-full h-16">
                              <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                          )}
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
                          {isUploading && uploadProgress[file.name] !== undefined && (
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative mt-auto">
                              <Progress value={uploadProgress[file.name] > 100 ? 100 : uploadProgress[file.name]} className="h-2" />
                              {uploadProgress[file.name] > 100 && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] font-bold">
                                  PROCESSING
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="flex items-end backdrop-blur-sm bg-background/50 border border-border/60 rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground w-full resize-none py-1 text-sm leading-relaxed max-h-32"
                    rows={1}
                  />
                  <div className="flex items-center space-x-1 ml-3">
                    {/* EMOJI BUTTON - Fixed */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <SmileIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
                      </Button>

                      {/* FIXED EMOJI PICKER POSITIONING */}
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute bottom-full right-0 mb-2 z-1000 shadow-xl border border-border/50 rounded-2xl overflow-hidden"
                          style={{ width: 'min(320px, 90vw)' }}
                        >
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            height={350}
                            width="100%"
                            theme={Theme.AUTO}
                          />
                        </div>
                      )}
                    </div>

                    {/* Rest of your buttons */}
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
        <SendAlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          onAlertSent={() => {
            // Optional: show a success toast or notification
          }}
          allUsers={users}
          allChannels={channels.map(c => ({ id: c.name.toLowerCase().replace(/ /g, '-'), name: c.name }))}
          channelMembers={
            activeRoom.includes('-') // This is a DM room
              ? users.filter(u => activeRoom.split('-').includes(u._id))
              // This is a placeholder. In a real app, you'd get actual channel members.
              // For now, sending to a "channel" from chat sends to all users.
              : activeRoom !== 'general' ? users : undefined
          }
        />

        {/* Alert Details Modal */}
        {selectedAlert && (
          <AlertDetailsModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
          />
        )}
        {/* Alert Details Modal */}
        {selectedAlert && (
          <AlertDetailsModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
          />
        )}

        <CreateChannelModal
          isOpen={isCreateChannelModalOpen}
          onClose={() => setCreateChannelModalOpen(false)}
          onChannelCreated={fetchChannels}
        />

        <ManageChannelModal
          isOpen={!!managingChannel}
          onClose={() => setManagingChannel(null)}
          channel={managingChannel}
          allUsers={users}
          onChannelUpdated={fetchChannels}
        />
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

        <AnimatePresence>
          {selectedUser && (
            <UserProfileCard
              user={{
                ...selectedUser,
                isOnline: onlineUsers.includes(selectedUser._id),
                // Assuming email is fetched with user data. If not, this will be undefined.
                email: selectedUser.email
              }}
              onClose={() => setSelectedUser(null)}
              onStartChat={handleStartChat}
              currentUserId={session?.user?._id}
            />
          )}
        </AnimatePresence>
      </div>

      {/* --- Sound Palette for Development/Testing --- */}
      {/* In a real app, might conditionally render this based on user role */}
      {/* <div className="absolute bottom-0 left-0 p-4 z-50">
        <SoundPalette />
      </div> */}
    </>
  );
}