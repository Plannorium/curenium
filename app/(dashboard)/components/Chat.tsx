"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "./ImageLightbox";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BellIcon,
  ChevronDownIcon,
  Copy,
  CornerUpLeft,
  Download,
  PhoneIcon,
  UsersIcon,
  UserPlus,
  MessageSquareText,
  ExternalLink,
  Eye,
  FileIcon,
  Loader2,
  MessageCircle,
  MessageSquare,
  MicIcon,
  MoreHorizontal,
  PaperclipIcon,
  PauseIcon,
  Phone,
  PlayIcon,
  Plus,
  ReplyIcon,
  Search,
  SearchIcon,
  SendIcon,
  SmileIcon,
  Trash2,
  Users,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useChat, Message } from "@/hooks/useChat";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { FileAttachment } from "./FileAttachment";
import DocumentPreview from "./DocumentPreview";
import { startMeshCall, joinMeshCall } from "@/app/lib/simple-call-client";
import { getCallById } from "@/app/lib/calls";
import { ReactionPicker } from "./ReactionPicker";
import { ReactionDetailsModal } from "./ReactionDetailsModal";
import { AnimatePresence } from "framer-motion";
import { UserProfileCard } from "./UserProfileCard";
import { AlertDetailsModal } from "./AlertDetailsModal";
import { SendAlertModal } from "./SendAlertModal";
import { initAudio, playSound } from "@/lib/sound/soundGenerator";
import { CreateChannelModal } from "./CreateChannelModal";
import { ManageChannelModal } from "./ManageChannelModal";
import { ChannelMembersModal } from "./ChannelMembersModal";
import SoundPalette from "./SoundPalette";
import Call from "./Call";
import { ThreadView } from "./ThreadView";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useChatContext } from "@/contexts/ChatContext";
import PdfPreviewCard from "./PdfPreviewCard";
import AudioVisualizer from "./AudioVisualizer";
import LiveAudioVisualizer from "./LiveAudioVisualizer";
import { IUser } from "@/models/User";

interface User {
  id: string;
  _id: string;
  fullName: string;
  image?: string;
  role?: string;
  email?: string;
  isOnline?: boolean;
  online?: boolean;
}

interface AlertMessage {
  _id: string;
  level: "critical" | "urgent" | "info";
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

interface DM {
  _id: string;
  participants: IUser[];
  room: string;
  messages: any[]; // You might want to type this more strictly
}

interface DMRoom {
  dm: DM;
}

const AudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (event: React.MouseEvent) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      handleSeek(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging && progressRef.current && audioRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = percentage * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener(
      "mousemove",
      handleGlobalMouseMove as EventListener
    );
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener(
        "mousemove",
        handleGlobalMouseMove as EventListener
      );
    };
  }, [isDragging, duration]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-background/80 to-background/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-sm border border-border/50 dark:border-gray-700/50 shadow-lg w-[16.5rem] lg:w-[18.5rem]">
      <audio
        ref={audioRef}
        src={src}
        crossOrigin="anonymous"
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
      <Button
        onClick={togglePlay}
        size="sm"
        variant="ghost"
        className="rounded-full h-10 w-10 p-0 shrink-0 hover:bg-primary/10 transition-all duration-200"
      >
        {isPlaying ? (
          <PauseIcon className="h-5 w-5 text-primary" />
        ) : (
          <PlayIcon className="h-5 w-5 text-primary ml-0.5" />
        )}
      </Button>
      <div className="flex-1 flex flex-col gap-1">
        <div
          ref={progressRef}
          className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden select-none"
          onClick={handleSeek}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-200 border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing"
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

const isSingleEmoji = (str: string): boolean => {
  if (!str) return false;
  const trimmed = str.trim();

  // Use Intl.Segmenter to count grapheme clusters. This is the most reliable way to count "characters" as perceived by users.
  // It correctly handles emojis with skin tones, ZWJ sequences, etc.
  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = [...segmenter.segment(trimmed)];

    if (segments.length !== 1) {
      return false;
    }

    // Now check if that single grapheme is an emoji.
    const emojiRegex = /\p{Emoji}/u;
    return emojiRegex.test(segments[0].segment);
  } catch (e) {
    // Fallback for environments where Intl.Segmenter is not supported
    console.warn(
      "Intl.Segmenter not supported, falling back to regex for emoji detection."
    );
    const emojiRegex = /^\p{Extended_Pictographic}$/u;
    return emojiRegex.test(trimmed);
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
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
  openLightbox: (
    images: Array<{ url: string; name: string }>,
    initialIndex: number
  ) => void;
  handleReaction: (messageId: string, emoji: string) => void;
  onAlertClick: (alert: AlertMessage) => void;
  onReactionClick: (messageId: string, emoji: string, users: any[]) => void;
  onReply: (message: any) => void;
  onDelete: (messageId: string) => void;
  onStartThread: (message: any) => void;
  onScrollToMessage: (messageId: string) => void;
  sendReadReceipt: (messageId: string) => void;
  voiceUploadProgress: Record<string, number>;
  onJoinCall: (callId: string) => void;
  id: string;
  isCallActive: boolean;
  users: User[];
  onMentionClick: (user: User) => void;
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
  onDelete,
  onStartThread,
  onScrollToMessage,
  sendReadReceipt,
  voiceUploadProgress,
  onJoinCall,
  isCallActive,
  id,
  users,
  onMentionClick,
}: MessageBubbleProps) => {
  const { data: session } = useSession();
  const [isReactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageText = msg.text || msg.content;
  const isEmoji = isSingleEmoji(messageText);

  // Function to parse message text and render mentions as clickable elements
  const renderMessageWithMentions = (text: string) => {
    if (!text) return text;

    // Split text by mentions and regular text
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        // This is a mention
        const mentionText = part.slice(1); // Remove the @ symbol
        const mentionedUser = users.find(
          (u) =>
            u.fullName.toLowerCase().startsWith(mentionText.toLowerCase()) ||
            u.fullName.split(" ")[0].toLowerCase() === mentionText.toLowerCase()
        );

        if (mentionedUser) {
          return (
            <span
              key={index}
              className="mention-tag bg-primary/10 text-primary px-1 py-0.5 rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => onMentionClick(mentionedUser)}
            >
              {part}
            </span>
          );
        }
      }

      // Check for links in regular text
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      const linkParts = part.split(linkRegex);

      return linkParts.map((linkPart, linkIndex) => {
        if (linkRegex.test(linkPart)) {
          return (
            <a
              key={`${index}-${linkIndex}`}
              href={linkPart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {linkPart}
            </a>
          );
        }
        return linkPart;
      });
    });
  };
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (msg.type === "call_invitation" && msg.createdAt && !msg.callEnded) {
      const startTime = new Date(msg.createdAt).getTime();
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(diff / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");
        setDuration(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [msg.type, msg.createdAt, msg.callEnded]);

  useEffect(() => {
    if (!messageRef.current || isSender || msg.status === "read") return;

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
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target as Node)
      ) {
        setReactionPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setIsActionsVisible(true);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClickOutsideActions = () => {
    setIsActionsVisible(false);
  };

  useEffect(() => {
    if (isActionsVisible) {
      const handleClick = () => setIsActionsVisible(false);
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [isActionsVisible]);

  const timeString = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  // ---------- IMAGE GALLERY ----------
  const renderImages = () => {
    const files = Array.isArray(msg.file)
      ? msg.file
      : msg.file
        ? [msg.file]
        : [];
    const images = files.filter(
      (f: any) =>
        f?.resource_type?.startsWith?.("image") ||
        f?.type?.startsWith?.("image") ||
        /\.(jpe?g|png|webp|gif)$/i.test(f?.url)
    );

    if (!images.length) return null;

    return (
      <div
        className={images.length > 1 ? "grid grid-cols-2 gap-1 mt-1" : "mt-1 "}
      >
        {images.map((img: any, i: number) => (
          <button
            key={i}
            onClick={() =>
              openLightbox(
                images.map((f: any) => ({ url: f.url, name: f.name })),
                i
              )
            }
            className="relative overflow-hidden rounded-lg group cursor-pointer"
          >
            <img
              src={img.url}
              alt={img.name}
              className="h-auto max-h-28 max-w-[330px] object-cover rounded-lg transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    );
  };

  // ---------- NON‑IMAGE FILES ----------
  const renderFiles = () => {
    const files = Array.isArray(msg.file)
      ? msg.file
      : msg.file
        ? [msg.file]
        : [];
    const nonImages = files.filter(
      (f: any) =>
        f?.url &&
        !f?.resource_type?.startsWith?.("image") &&
        !f?.type?.startsWith?.("image") &&
        !/\.(jpe?g|png|webp|gif)$/i.test(f.url)
    );

    if (!nonImages.length) return null;

    return (
      <div className="space-y-2">
        {nonImages.map((f: any, i: number) => (
          <React.Fragment key={i}>
            {(() => {
              const isVoiceMessage =
                f.type?.startsWith("audio/") ||
                (f.resource_type === "video" && f.url.endsWith(".webm"));
              if (isVoiceMessage) {
                // Normal player when upload is finished
                if (f.url) return <AudioPlayer src={f.url} />;
                return null;
              }

              if (f.type === "application/pdf" || f.name?.endsWith(".pdf")) {
                return (
                  <PdfPreviewCard
                    file={f}
                    onPreview={() => openDocPreview(f)}
                  />
                );
              }

              return (
                <FileAttachment file={f} onPreview={() => openDocPreview(f)} />
              );
            })()}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (msg.type === "call_invitation") {
    const callEnded = msg.callEnded;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative flex items-start gap-3"
      >
        <div className="shrink-0 pt-1">
          <div className="w-8 h-8 flex items-center justify-center bg-card dark:bg-gray-800 rounded-lg border border-border/50 shadow-sm">
            <PhoneIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-foreground text-sm">
              A call started
            </span>
            <span className="text-xs text-muted-foreground">{timeString}</span>
          </div>
          <div className="mt-1 p-4 rounded-lg bg-card/50 dark:bg-gray-800/30 border border-border/30 max-w-md">
            {callEnded ? (
              <div className="text-sm text-muted-foreground">
                Call ended. Duration: {msg.duration}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">
                    {msg.text || `${msg.fullName} started a call.`}
                  </p>
                  {duration && (
                    <span className="text-sm font-mono text-green-400 animate-pulse">
                      {duration}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => onJoinCall(msg.callId)}
                  className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Join Call
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (msg.type === "alert_notification" && msg.alert) {
    // Handle other alert types here if needed
    const alert: AlertMessage = msg.alert;
    const alertColors = {
      critical: "red",
      urgent: "amber",
      info: "blue",
    };
    const color = alertColors[alert.level];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full flex justify-center rounded-full"
      >
        <button
          onClick={() => onAlertClick(alert)}
          className={`w-full max-w-xs lg:max-w-md text-center group relative flex justify-center items-center p-2.5 lg:p-3 rounded-full transition-all duration-300 cursor-pointer backdrop-blur-sm border shadow-sm hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 bg-${color}-500/10 border-${color}-500/30 hover:bg-${color}-500/15 hover:border-${color}-500/40 dark:bg-${color}-900/20 dark:border-${color}-500/20 dark:hover:bg-${color}-900/30 dark:hover:border-${color}-500/30`}
        >
          <div
            className={`p-1.5 lg:p-2 bg-${color}-500/10 rounded-lg mr-3 lg:mr-4 border border-${color}-500/20 dark:bg-${color}-900/20 dark:border-${color}-500/30`}
          >
            <BellIcon size={22} className={`text-${color}-500 animate-pulse`} />
          </div>
          <div className="text-left">
            <p
              className={`font-bold text-xs lg:text-sm text-${color}-500 uppercase`}
            >
              {alert.level} Alert
            </p>
            {/* <p className="font-medium text-foreground">{alert.message}</p> */}
          </div>
        </button>
      </motion.div>
    );
  }
  // ---------- MAIN RENDER ----------
  return (
    <motion.div
      id={id}
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-background/50 shadow-sm">
        <AvatarImage src={user?.image || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {(msg.fullName ?? "")
            .split(" ")
            .map((n: string) => n[0] || "")
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 w-full max-w-[calc(100%-4rem)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm">
            {msg.fullName}
          </span>
          {showTime && (
            <span className="text-xs text-muted-foreground">{timeString}</span>
          )}
        </div>

        <div className={cn("flex flex-col relative items-start group")}>
          <div
            className={cn(
              "relative group rounded-xl bg-linear-to-br p-3 transition-all duration-200 max-w-full sm:max-w-88 lg:max-w-126",
              !isEmoji &&
                `px-2.5 py-1.5 ${
                  isSender
                    ? "from-primary/0 to-primary/10 bg-card dark:bg-gray-900/80 border border-accent-50 dark:border-gray-900/70"
                    : "bg-card border-border/40 dark:bg-gray-800/50 dark:border-gray-700/50"
                }`
            )}
          >
            <div
              className={`absolute top-0 right-0 -mt-3 mr-1.5 flex items-center space-x-1 ${isActionsVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity bg-card border rounded-2xl px-1.5 py-1 shadow-md z-10 dark:bg-gray-800 dark:border-gray-700`}
            >
              <div className="relative" ref={reactionPickerRef}>
                <button
                  onClick={() => setReactionPickerOpen((p) => !p)}
                  className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors dark:hover:bg-gray-700"
                >
                  <SmileIcon size={15} className="text-muted-foreground" />
                </button>
                {isReactionPickerOpen && (
                  <div className="absolute z-20 bottom-full right-0 mb-2">
                    <ReactionPicker
                      onEmojiClick={(emoji) => {
                        handleReaction(msg.id, emoji);
                        setReactionPickerOpen(false);
                      }}
                      onClose={() => setReactionPickerOpen(false)}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => onReply(msg)}
                className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors dark:hover:bg-gray-700"
              >
                <CornerUpLeft size={15} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => onStartThread(msg)}
                className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors dark:hover:bg-gray-700"
              >
                <MessageSquareText
                  size={15}
                  className="text-muted-foreground"
                />
              </button>
              <button
                onClick={() => onDelete(msg.id)}
                className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-accent transition-colors dark:hover:bg-gray-700"
              >
                <Trash2 size={15} className="text-muted-foreground" />
              </button>
            </div>

            {/* REPLIED TO MESSAGE */}
            {msg.replyTo && (
              <div className="mb-2">
                <div
                  className="relative flex items-start gap-2 rounded-lg bg-background/30 p-2 cursor-pointer border-l-4 border-primary/60 shadow-inner dark:bg-gray-800/50"
                  onClick={() => onScrollToMessage(msg.replyTo.id)}
                >
                  {(() => {
                    const fileData = Array.isArray(msg.replyTo.file)
                      ? msg.replyTo.file[0]
                      : msg.replyTo.file;
                    if (!fileData) return null;

                    if (
                      fileData.type?.startsWith("image") ||
                      fileData.thumbnailUrl
                    ) {
                      const imageUrl = fileData.thumbnailUrl || fileData.url;
                      return (
                        <img
                          src={imageUrl}
                          alt="reply-thumbnail"
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      );
                    }

                    // Fallback for PDFs and other file types
                    return (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    );
                  })()}
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-foreground">
                      {msg.replyTo?.fullName || "Someone"}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-h-10 overflow-hidden">
                      {msg.replyTo.text ||
                        (Array.isArray(msg.replyTo.file)
                          ? msg.replyTo.file[0]?.name
                          : (msg.replyTo.file as any)?.name) ||
                        "File"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {msg.deleted ? ( // This should be the first check
              <div className="flex items-center gap-2">
                <Trash2 size={14} className="text-muted-foreground/80" />
                <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground italic">
                  message deleted by {msg.deleted.by}
                </p>
              </div>
            ) : (
              <>
                {/* TEXT */}
                {messageText && (
                  <p
                    className={`text-[1rem] leading-relaxed wrap-break-word ${isEmoji ? "text-[4rem]" : "whitespace-pre-wrap"}`}
                  >
                    {renderMessageWithMentions(messageText)}
                  </p>
                )}

                {/* IMAGES */}
                {renderImages()}

                {/* FILES */}
                {renderFiles()}
              </>
            )}

            {/* SENT CHECK */}
            {isSender && !msg.file && (
              <div className="absolute bottom-[-1.5] right-1 text-[0.78rem] text-muted-foreground opacity-70">
                {msg.status === "read" ? (
                  <span className="text-blue-500">✓✓</span>
                ) : msg.status === "delivered" ? (
                  <span>✓✓</span>
                ) : (
                  <span>✓</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0 min-h-6">
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <>
                {Object.entries(msg.reactions).map(
                  ([emoji, users]: [string, any]) => (
                    <div key={emoji} className="relative group">
                      <button
                        onClick={() => onReactionClick(msg.id, emoji, users)}
                        className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-1 py-0.5 text-[0.6rem] hover:bg-primary/20 transition-colors duration-200 cursor-pointer dark:bg-primary/5 dark:border-primary/10 dark:hover:bg-primary/10"
                      >
                        <span>{emoji}</span>
                        <span className="font-medium text-primary text-[0.6rem]">
                          {Array.isArray(users) ? users.length : 0}
                        </span>
                      </button>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Chat() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const fullName = session?.user?.name || "Anonymous";
  const searchParams = useSearchParams();
  const activeRoom = searchParams?.get("room") || "general";
  // const { messages, sendCombinedMessage, typingUsers, sendTyping, onlineUsers } = useChat(activeRoom);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const { recentDms, setRecentDms, addRecentDm } = useChatContext();
  const currentUser = useMemo(() => {
    if (!session?.user?._id || !users.length) return null;
    return users.find((u) => u._id === session?.user?._id);
  }, [session?.user?._id, users]);

  // Refresh users online status periodically
  useEffect(() => {
    const refreshUsersOnlineStatus = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data: User[] = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to refresh users online status:", error);
      }
    };

    // Cleanup stale online statuses (run every 5 minutes)
    const cleanupOnlineStatus = async () => {
      try {
        await fetch("/api/users/cleanup", { method: "POST" });
      } catch (error) {
        console.error("Failed to cleanup online status:", error);
      }
    };

    // Refresh immediately and then every 60 seconds
    refreshUsersOnlineStatus();
    const refreshInterval = setInterval(refreshUsersOnlineStatus, 60000);

    // Cleanup every 5 minutes
    const cleanupInterval = setInterval(cleanupOnlineStatus, 300000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(cleanupInterval);
    };
  }, []);
  const [lightbox, setLightbox] = useState<{
    images: Array<{ url: string; name: string }>;
    initialIndex: number;
  } | null>(null);
  const [isCreateChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const [managingChannel, setManagingChannel] = useState<Channel | null>(null);
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isPermissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [isMembersModalOpen, setMembersModalOpen] = useState(false);

  const [isDmsOpen, setIsDmsOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<any | null>(null);

  const [voiceUploadProgress, setVoiceUploadProgress] = useState<
    Record<string, number>
  >({});
  const audioContextRef = useRef<AudioContext | null>(null);

  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "paused" | "sending"
  >("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null
  );

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const handleStartThread = (message: any) => {
    setActiveThreadId(message.id); // This should open the thread view
  };

  const handleReplyInThread = (threadId: string, content: string) => {
    sendCombinedMessage(
      content,
      undefined,
      false,
      undefined,
      undefined,
      threadId
    );
  };

  const [stagedFilePreviews, setStagedFilePreviews] = useState<string[]>([]);
  const openLightbox = (
    images: Array<{ url: string; name: string }>,
    initialIndex: number
  ) => {
    setLightbox({ images, initialIndex });
  };
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [callRoom, setCallRoom] = useState<string | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, { stream: MediaStream; name: string }>
  >({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const callRef = useRef<{
    endCall: () => void;
    id: string;

    replaceTrack: (track: MediaStreamTrack) => void;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersToInvite, setUsersToInvite] = useState<User[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertMessage | null>(null);
  const {
    messages,
    isMuted,
    isVideoOff,
    setMessages,
    sendCombinedMessage,
    uploadFile,
    onlineUsers,
    typingUsers,
    sendTyping,
    sendPayload,
    startCall,
    sendCallInvitation,
    sendCallEnd,
    sendReadReceipt,
    deleteMessage,
    setIsMuted,
    setIsVideoOff,
    getWs,
  } = useChat(activeRoom);

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !newMuted;
        }
      }
      return newMuted;
    });
    playSound(!isMuted ? "mute" : "unmute");
  };

  const handleToggleVideo = () => {
    setIsVideoOff((prev) => {
      const newVideoOff = !prev;
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !newVideoOff;
        }
      }
      return newVideoOff;
    });
    playSound("mute"); // Using 'mute' as a generic 'tick' sound
  };

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    const ws = getWs();
    if (!ws || session?.user.role !== "doctor" || "admin") return;

    const handleVitalsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "vitals.recorded") {
          toast.info(`New vitals recorded for ${data.payload.patientName}`, {
            description: `Click to view`,
            action: {
              label: "View",
              onClick: () => {
                // redirect to patient's page
                window.location.href = `/dashboard/patients/${data.payload.patientId}`;
              },
            },
          });
        }
      } catch (error) {
        // Not a JSON message, ignore
      }
    };

    ws.addEventListener("message", handleVitalsMessage);

    return () => {
      ws.removeEventListener("message", handleVitalsMessage);
    };
  }, [getWs, session]);

  // Play sound on new message received
  useEffect(() => {
    const wasMessageAdded = messages.length > prevMessagesLengthRef.current;
    if (wasMessageAdded) {
      const newMessage = messages[messages.length - 1];
      const isFromAnotherUser =
        newMessage && newMessage.userId !== session?.user?._id;
      if (isFromAnotherUser) {
        playSound("notification");
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, session?.user?._id]);

  // Heartbeat to update online status
  useEffect(() => {
    if (!session?.user?.id) return;

    const updateOnlineStatus = async () => {
      try {
        await fetch("/api/users/online", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to update online status:", error);
      }
    };

    // Update online status immediately
    updateOnlineStatus();

    // Set up heartbeat interval (every 30 seconds)
    const heartbeatInterval = setInterval(updateOnlineStatus, 30000);

    // Set offline when component unmounts or user leaves
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        "/api/users/online",
        JSON.stringify({ method: "DELETE" })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Set offline when component unmounts
      fetch("/api/users/online", { method: "DELETE" }).catch(console.error);
    };
  }, [session?.user?.id]);

  const handleStartChat = (roomId: string) => {
    if (!roomId) return;
    handleRoomChange(roomId);
    setIsNewChatDialogOpen(false);
    setSelectedUser(null);
  };

  const handleAlertClick = (alert: AlertMessage) => {
    setSelectedAlert(alert);
  };

  const handleThreadReply = (threadId: string, content: string) => {
    if (session?.user) {
      sendCombinedMessage(
        content,
        undefined,
        false,
        undefined,
        undefined,
        threadId
      );
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState<
    string | null
  >(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const [activeReactionDetails, setActiveReactionDetails] = useState<{
    messageId: string;
    emoji: string;
    users: any[];
  } | null>(null);

  // Scroll position caching per room
  const [scrollPositions, setScrollPositions] = useState<
    Record<string, number>
  >({});
  const [hasUserScrolledUp, setHasUserScrolledUp] = useState(false);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);

  const handleReaction = (messageId: string, emoji: string) => {
    if (!session?.user) return;
    sendPayload({
      type: "reaction",
      payload: {
        messageId,
        emoji,
        userId: session.user.id,
        userName: session.user.name,
      },
    });
  };

  const handleReactionClick = (
    messageId: string,
    emoji: string,
    users: any[]
  ) => {
    setActiveReactionDetails({ messageId, emoji, users });
  };

  const handleScrollToMessage = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      messageRefs.current[messageIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const messageToDelete = messages.find((m) => m.id === messageId);
    if (messageToDelete) {
      setDeletingMessage(messageToDelete);
      setShowDeleteConfirm(true);
    }
  };

  const handleToggleRecording = async () => {
    if (recordingState === "idle") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setRecordingStream(stream);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (audioChunksRef.current.length === 0) return;
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const file = new File([blob], "voice-message.webm", {
            type: "audio/webm",
          });

          try {
            // First, upload the file and wait for the response.
            const uploadedFile = await uploadFile(file, (progress) => {
              // We can still track progress if we want to add a non-optimistic UI later.
              console.log(`Voice message upload progress: ${progress}%`);
            });

            // Once the upload is complete, send the message with the file details.
            sendCombinedMessage("", [uploadedFile], true);
          } catch (error) {
            console.error("Error sending voice message:", error);
            alert("Failed to send voice message.");
          } finally {
            setRecordingState("idle");
            setRecordingStream(null);
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stream
                .getTracks()
                .forEach((track) => track.stop());
            }
            audioChunksRef.current = [];
          }
        };

        mediaRecorder.start();
        setRecordingState("recording");
      } catch (error) {
        console.error("Error starting recording:", error);
        alert(
          "Could not start recording. Please check microphone permissions."
        );
      }
    }
  };

  const handleSendVoiceMessage = async () => {
    if (
      mediaRecorderRef.current &&
      (recordingState === "recording" || recordingState === "paused")
    ) {
      setRecordingState("sending");
      mediaRecorderRef.current.stop();
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
    } else if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null; // Prevent onstop from firing and sending
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    recordingStream?.getTracks().forEach((track) => track.stop());
    setRecordingState("idle");
    setRecordingStream(null);
    audioChunksRef.current = [];
  };

  const confirmDeleteMessage = async () => {
    if (deletingMessage) {
      await deleteMessage(deletingMessage.id);
      setDeletingMessage(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleEndCall = () => {
    playSound("callEnd");
    if (callRef.current) {
      callRef.current.endCall();
      callRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    if (callStartTime) {
      const durationInSeconds = Math.floor((Date.now() - callStartTime) / 1000);
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      const durationString = `${minutes}m ${seconds}s`;

      // Send call_end message to update the message in the database
      if (callRef.current && (callRef.current as any).id) {
        sendCallEnd(
          (callRef.current as any).id,
          durationString,
          callRoom || undefined
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === callRef.current?.id
            ? { ...m, callEnded: true, duration: durationString }
            : m
        )
      );
    }

    setLocalStream(null);
    setRemoteStreams({});
    setIsCallActive(false);
    setIsScreenSharing(false);
    setScreenStream(null);
    setCallRoom(null); // Reset call room
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
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
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

  // Save scroll position when changing rooms
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Save scroll position for current room
      setScrollPositions((prev) => ({
        ...prev,
        [activeRoom]: scrollTop,
      }));

      // Track if user has scrolled up
      setHasUserScrolledUp(distanceFromBottom > 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeRoom]);

  // Restore scroll position when entering a room, or scroll to bottom if no cached position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    const cachedPosition = scrollPositions[activeRoom];

    if (cachedPosition !== undefined) {
      // Restore cached position
      container.scrollTop = cachedPosition;
    } else {
      // No cached position, scroll to bottom
      container.scrollTop = container.scrollHeight;
    }
  }, [activeRoom, messages.length, scrollPositions]);

  // Keep user near bottom when new messages arrive, but don't fight modals
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const shouldScrollToBottom = !hasUserScrolledUp;

    const scrollIfNeeded = () => {
      if (shouldScrollToBottom && !isDocModalOpen && lightbox === null) {
        container.scrollTop = container.scrollHeight;
      }
    };

    // Only auto-scroll for new messages if user hasn't scrolled up
    if (!hasUserScrolledUp) {
      scrollIfNeeded();
    }

    const observer = new MutationObserver(() => {
      if (!hasUserScrolledUp) {
        scrollIfNeeded();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    return () => {
      observer.disconnect();
    };
  }, [messages, isDocModalOpen, lightbox, hasUserScrolledUp]);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 200;
      setShowScrollToBottom(!isNearBottom && messages.length > 5);

      // Update scroll up state
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setHasUserScrolledUp(distanceFromBottom > 150);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
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
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = (await response.json()) as { users: User[] };
          setUsers(Array.isArray(data) ? data : data.users || []);
        }
      } catch (_error) {
        console.error("Failed to fetch users:", _error);
      }
    };

    fetchUsers();
  }, []);

  const fetchChannels = async () => {
    try {
      interface ChannelsApiResponse {
        channels: Channel[];
      }
      const response = await fetch("/api/channels");
      if (response.ok) {
        const data = (await response.json()) as ChannelsApiResponse;
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    const fetchRecentDms = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/dms`);
          if (response.ok) {
            const data: { dms: DM[] } = await response.json();
            setRecentDms(data.dms);
          }
        } catch (error) {
          console.error("Failed to fetch recent DMs:", error);
        }
      }
    };

    fetchRecentDms();
  }, [session, setRecentDms]);

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
      const prevIndex =
        (currentResultIndex - 1 + searchResults.length) % searchResults.length;
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
    setText((prevText) => {
      const newText = prevText + emojiData.emoji;
      return newText;
    });
    textareaRef.current?.focus();
  };

  const handleMentionSelect = (user: User) => {
    const cursorPosition = textareaRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const textAfterCursor = text.substring(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const firstName = user.fullName.split(" ")[0];
      const newText = beforeMention + `@${firstName} ` + textAfterCursor;
      setText(newText);
      setShowMentions(false);
      setMentionQuery("");
      // Focus and set cursor after the mention
      setTimeout(() => {
        textareaRef.current?.focus();
        const newCursorPos = beforeMention.length + `@${firstName} `.length;
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  useEffect(() => {
    if (
      messagesContainerRef.current &&
      searchResults.length > 0 &&
      currentResultIndex >= 0
    ) {
      const messageIndex = searchResults[currentResultIndex];
      const messageElement = messagesContainerRef.current.querySelector(
        `#message-${messageIndex}`
      );
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentResultIndex, searchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  interface ConversionProgress {
    status: "queued" | "converting" | "uploading" | "completed" | "failed";
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
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "audio/mpeg",
        "audio/wav",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const validFiles = newFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} is too large. Max size is 5MB.`);
          return false;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(
            `File ${file.name} has an invalid type. Allowed types: images, audio, PDF, Word documents.`
          );
          return false;
        }
        return true;
      });

      // Handle Word documents conversion
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          // Check if it's a Word document
          if (file.type.includes("word")) {
            try {
              const formData = new FormData();
              formData.append("file", file);

              const response = await fetch("/api/convert", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                throw new Error("Conversion failed");
              }

              const { conversionId } =
                (await response.json()) as ConversionResponse;

              // Poll for conversion progress
              while (true) {
                const progressResponse = await fetch(
                  `/api/convert?id=${conversionId}`
                );
                if (!progressResponse.ok) break;

                const progress =
                  (await progressResponse.json()) as ConversionProgress;
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: progress.progress,
                }));

                if (progress.status === "completed" && progress.pdfUrl) {
                  const response = await fetch(progress.pdfUrl);
                  const blob = await response.blob();
                  return new File(
                    [blob],
                    file.name.replace(/\.docx?$/, ".pdf"),
                    { type: "application/pdf" }
                  );
                }

                if (progress.status === "failed") {
                  throw new Error(progress.error || "Conversion failed");
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            } catch (error) {
              console.error("Failed to convert Word document:", error);
              alert(
                `Failed to convert ${file.name} to PDF. The original file will be used.`
              );
              return file;
            }
          }
          return file;
        })
      );

      setStagedFiles((prev) => [...prev, ...processedFiles]);

      // Generate previews for image files
      const newPreviews = await Promise.all(
        processedFiles.map((file) => {
          if (file.type.startsWith("image/")) {
            return URL.createObjectURL(file);
          }
          return Promise.resolve(""); // No preview for non-images
        })
      );
      setStagedFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => stagedFilePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [stagedFilePreviews]);

  const handleSendMessage = async () => {
    if ((text.trim() || stagedFiles.length > 0) && session?.user) {
      initAudio(); // Ensure audio is ready

      const replyToMessage = replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            fullName:
              replyingTo.sender?.fullName ||
              replyingTo.sender?.fullName ||
              replyingTo.fullName ||
              "Unknown",
            userId: replyingTo.userId,
            file: replyingTo.file, // Add file information to the reply payload
          }
        : undefined;

      setIsUploading(true);
      try {
        if (stagedFiles.length > 0) {
          const uploadPromises = stagedFiles.map((file) =>
            uploadFile(file, (progress) => {
              setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
            })
          );
          const uploadedFiles = await Promise.all(uploadPromises);
          const newProgress = { ...uploadProgress };
          stagedFiles.forEach((file) => {
            newProgress[file.name] = 101; // Processing
          });
          setUploadProgress(newProgress);

          // Use sendCombinedMessage to send text and files together
          await sendCombinedMessage(
            text.trim(),
            uploadedFiles,
            false,
            replyToMessage
          );
          setStagedFiles([]);
          setUploadProgress({});
          setStagedFilePreviews([]);
        } else if (text.trim()) {
          await sendCombinedMessage(text.trim(), [], false, replyToMessage);
        }
        setReplyingTo(null);
        playSound("messageSent");
        setText("");

        // Always scroll to bottom when sending a message
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
          }
        }, 100);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Handle mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setMentionIndex(-1);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }

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

  const handleJoinCall = async (callId: string) => {
    try {
      const callDetails = await getCallById(callId);
      if (!callDetails) {
        toast.error("Call details not found.");
        return;
      }

      // Navigate to the call page
      router.push(`/call/${callId}`);

      initAudio(); // Ensure audio is ready
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((device) => device.kind === "videoinput");
      const hasAudio = devices.some((device) => device.kind === "audioinput");

      if (!hasVideo && !hasAudio) {
        alert(
          "No camera or microphone found. Please connect a device and grant permission to make a call."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: hasVideo,
        audio: hasAudio,
      });

      stream.getAudioTracks().forEach((track) => (track.enabled = false));
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
      setIsMuted(true);
      setIsVideoOff(true);
      setLocalStream(stream);
      playSound("callStart");
      setCallStartTime(Date.now());
      setCallRoom(activeRoom); // Store the room where the call started
      setIsCallActive(true);

      if (session?.user?.token) {
        const call = await joinMeshCall({
          callId: callId,
          localStream: stream,
          token: session.user.token,
          userName: session?.user?.fullName || "Anonymous",
          onRemoteStream: (remoteStream, peerId, userName) => {
            setRemoteStreams((prev) => ({
              ...prev,
              [peerId]: { stream: remoteStream, name: userName },
            }));
          },
          onParticipantLeft: (peerId) => {
            setRemoteStreams((prev) => {
              const newStreams = { ...prev };
              delete newStreams[peerId];
              return newStreams;
            });
          },
        });
        callRef.current = call;
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/call/${callId}`);
        }
      }
    } catch (error) {
      console.error("Error joining call:", error);
      toast.error("Failed to join call.");
    }
  };

  const handleStartCall = async () => {
    initAudio(); // Ensure audio is ready
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((device) => device.kind === "videoinput");
      const hasAudio = devices.some((device) => device.kind === "audioinput");

      if (!hasVideo && !hasAudio) {
        alert(
          "No camera or microphone found. Please connect a device and grant permission to make a call."
        );
        return;
      }

      // Request a stream with the devices that are available.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: hasVideo,
        audio: hasAudio,
      });

      stream.getAudioTracks().forEach((track) => (track.enabled = false));
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
      setIsMuted(true);
      setIsVideoOff(true);
      setLocalStream(stream);
      playSound("callStart");
      setIsCallActive(true);

      if (session?.user?.token) {
        const call = await startMeshCall({
          callId: `call-${activeRoom}-${crypto.randomUUID().slice(0, 8)}`,
          roomId: activeRoom,
          localStream: stream,
          token: session.user.token,
          userName: session?.user?.fullName || "Anonymous",
          onRemoteStream: (remoteStream, peerId, userName) => {
            setRemoteStreams((prev) => ({
              ...prev,
              [peerId]: { stream: remoteStream, name: userName },
            }));
          },
          onParticipantLeft: (peerId) => {
            setRemoteStreams((prev) => {
              const newStreams = { ...prev };
              delete newStreams[peerId];
              return newStreams;
            });
          },
          onCallStarted: (callId) => {
            // This runs when WS connects
            sendCallInvitation(activeRoom, callId); // ← THIS IS KEY
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `/call/${callId}`);
            }
            callRef.current = { ...call, id: callId };
          },
        });
        if (call) {
          callRef.current = call;
        }
      }
    } catch (error) {
      console.error("Error starting call:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert(
            "Permission to use camera and microphone was denied. Please grant access in your browser settings to make a call."
          );
        } else if (error.name === "NotFoundError") {
          alert(
            "No camera or microphone found. Please connect a device to make a call."
          );
        } else {
          alert(`An error occurred while starting the call: ${error.message}`);
        }
      }
      // Ensure call state is cleaned up on error
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      setIsCallActive(false);
    }
  };

  const handleSendCallInvitations = async () => {
    if (session?.user && usersToInvite.length > 0 && callRef.current) {
      const callId = (callRef.current as any).id as string;
      if (callId) {
        if (isDmRoom) {
          // DM call: Send invites to selected users via DM
          for (const user of usersToInvite) {
            // Create a DM room ID
            const dmRoomId = [session.user._id, user._id].sort().join("--");

            // Send the invitation to that specific DM room
            await sendCallInvitation(dmRoomId, callId);

            // Also add this DM to the recent DMs list if it's not there
            const dmExists = recentDms.some((dm) => dm.room === dmRoomId);
            if (!dmExists) {
              // This assumes you have a way to create/add a DM room.
              // We can use the logic from handleRoomChange.
              addRecentDm({
                participants: [session.user as any, user],
                room: dmRoomId,
                messages: [],
                _id: dmRoomId,
              });
            }
          }
        } else {
          // Channel call: Send a single invite to the channel
          // This sends the invitation to the active room (channel).
          if (activeRoom) {
            await sendCallInvitation(activeRoom, callId);
          }
        }
        toast.success(`Invites sent to ${usersToInvite.length} user(s).`);
        setUsersToInvite([]);
        setIsNewChatDialogOpen(false);
      }
    }
  };
  const handleInviteToCall = () => {
    // For now, this will open the new chat dialog to select users to invite.
    setIsNewChatDialogOpen(true);
  };

  const isDmRoom = useMemo(() => activeRoom.includes("--"), [activeRoom]);
  const currentChannel = useMemo(
    () =>
      channels.find(
        (c) => c.name.trim().toLowerCase().replace(/\s+/g, "-") === activeRoom
      ),
    [channels, activeRoom]
  );

  const channelUsers = useMemo(() => {
    if (activeRoom === "general") {
      return users;
    }
    if (isDmRoom) {
      const userIds = activeRoom.split("--");
      return users.filter((u) => userIds.includes(u._id));
    }
    if (currentChannel) {
      return users.filter((u) => currentChannel.members.includes(u._id));
    }
    return []; // Fallback for unknown rooms
  }, [activeRoom, isDmRoom, currentChannel, users]);

  const filteredMentionUsers = useMemo(() => {
    if (!mentionQuery) return channelUsers.slice(0, 5);
    return channelUsers
      .filter((user) =>
        user.fullName.toLowerCase().includes(mentionQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [mentionQuery, channelUsers]);

  const otherUser = useMemo(() => {
    if (!isDmRoom) return null;
    return channelUsers.find((u) => u._id !== session?.user?._id);
  }, [isDmRoom, channelUsers, session?.user?._id]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user._id !== session?.user?._id &&
        (!searchQuery ||
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, searchQuery, session?.user?._id]);

  if (!session)
    return (
      <div className="flex items-center justify-center h-full backdrop-blur-sm bg-card/50 rounded-2xl border border-border/50">
        <div className="text-center p-8">
          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            Sign in to view conversations.
          </p>
        </div>
      </div>
    );

  const handleRoomChange = async (room: string) => {
    router.push(`${pathname}?room=${room}`);
    setSearchQuery("");

    if (room.includes("--")) {
      const userIds = room.split("--");
      if (userIds.length === 2 && userIds[0] !== userIds[1]) {
        const otherUserId = userIds.find((id) => id !== session?.user?._id);
        if (otherUserId) {
          const dmExists = recentDms.some((dm) => dm.room === room);
          if (!dmExists) {
            try {
              const res = await fetch(`/api/users/${session?.user?._id}/dms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: otherUserId }),
              });
              if (res.ok) {
                const newDm: DMRoom = await res.json();
                addRecentDm(newDm.dm);
              } else {
                console.error("Failed to create DM room");
              }
            } catch (error) {
              console.error("Error creating DM room:", error);
            }
          }
        }
      }
    }
  };

  return (
    <>
      <Dialog
        open={isNewChatDialogOpen}
        onOpenChange={(isOpen) => {
          setIsNewChatDialogOpen(isOpen);
          if (!isOpen) {
            setSearchQuery("");
          }
        }}
      >
        <DialogContent className="max-w-md g-background/80 dark:bg-slate-900/95 border-border/30 shadow-2xl rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold">New Message</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Search for people in your organization to start a conversation.
            </DialogDescription>
          </DialogHeader>

          <div className="px-1 pt-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="w-full bg-transparent border-2 border-border/30 focus:border-primary/50 transition-all duration-300 rounded-xl pl-10 pr-4 py-2.5 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-1.5 max-h-[50vh] overflow-y-auto no-scrollbar">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      const room = [session?.user?._id, user._id]
                        .sort()
                        .join("--");
                      //handleRoomChange(room);
                      //setIsNewChatDialogOpen(false);
                      setUsersToInvite((prev) => [...prev, user]);
                    }}
                    className="w-full flex items-center p-2.5 rounded-xl hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="relative mr-3">
                      <Avatar className="h-9 w-9 border-2 border-border/20 dark:border-gray-700/50">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.includes(user._id) && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-base text-foreground">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <Button
                    onClick={handleSendCallInvitations}
                    disabled={usersToInvite.length === 0}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    Invite
                  </Button>

                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No users found
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search or invite new members to your
                    organization.
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSendCallInvitations}
              disabled={usersToInvite.length === 0}
            >
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="h-[calc(100vh-11rem)] lg:h-[calc(100vh-6rem)] flex flex-col backdrop-blur-xl bg-background/95 rounded-2xl border border-border/50 overflow-hidden shadow-2xl relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none"></div>

        <ThreadView
          isOpen={!!activeThreadId}
          onClose={() => setActiveThreadId(null)}
          threadId={activeThreadId}
          messages={messages}
          onReply={handleReplyInThread}
          MessageBubbleComponent={MessageBubble}
          sendReadReceipt={sendReadReceipt}
          onJoinCall={handleJoinCall}
          allUsers={users}
        />

        <div className="relative flex-1 flex min-h-0">
          {/* Channel List Sidebar */}
          <div className="hidden md:block w-64 backdrop-blur-lg bg-card/80 dark:bg-gray-900/80 border-r border-border/50 dark:border-gray-700/50 shrink-0">
            <div className="p-4">
              <div className="relative" ref={emojiPickerRef}>
                <input
                  type="text"
                  placeholder="Search conversations"
                  className="backdrop-blur-sm bg-background/50 dark:bg-gray-800/50 border border-border/60 dark:border-gray-700/60 rounded-full w-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
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
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider"
              >
                <h3 className="flex items-center">
                  <Users className="h-3 w-3 mr-2" />
                  Channels
                </h3>
                <ChevronDownIcon
                  size={16}
                  className={`transform transition-transform duration-200 ${
                    isChannelsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isChannelsOpen && (
                <div className="mt-2 space-y-1">
                  <div
                    className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:bg-accent/50 dark:hover:bg-gray-800/50 ${
                      activeRoom === "general"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <button
                      className="flex cursor-pointer items-center flex-1 text-left"
                      onClick={() => handleRoomChange("general")}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${
                          activeRoom === "general"
                            ? "bg-primary"
                            : "bg-green-500 opacity-60 group-hover:opacity-100 transition-opacity"
                        }`}
                      ></span>
                      General
                    </button>
                    {/* No manage button for the general channel */}
                  </div>
                  {channels
                    .filter((channel) =>
                      channel.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )

                    .map((channel) => (
                      <div
                        key={channel._id}
                        className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:bg-accent/50 dark:hover:bg-gray-800/50 ${
                          activeRoom ===
                          channel.name.trim().toLowerCase().replace(/\s+/g, "-")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <button
                          className="flex cursor-pointer items-center flex-1 text-left"
                          onClick={() =>
                            handleRoomChange(
                              channel.name
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                            )
                          }
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${
                              activeRoom ===
                              channel.name
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                ? "bg-primary"
                                : "bg-blue-500 opacity-60 group-hover:opacity-100 transition-opacity"
                            }`}
                          ></span>
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

                  <div className="px-3 cursor-pointer">
                    <button
                      onClick={() => setCreateChannelModalOpen(true)}
                      className="group flex items-center justify-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-300 border border-dashed border-border/50 hover:border-primary/50 bg-background/20 hover:bg-accent/50 dark:border-gray-700/50 dark:hover:border-primary/50 dark:bg-gray-800/20 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <Plus
                        size={16}
                        className="mr-2 text-muted-foreground group-hover:text-primary transition-colors"
                      />
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
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider"
              >
                <h3 className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-2" />
                  Direct Messages
                </h3>
                <ChevronDownIcon
                  size={16}
                  className={`transform transition-transform duration-200 ${
                    isDmsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDmsOpen && (
                <div className="mt-2 space-y-1">
                  {/* Self-chat / Notes to self */}
                  {currentUser && (
                    <button
                      onClick={() =>
                        handleRoomChange(
                          `${currentUser._id}-${currentUser._id}`
                        )
                      }
                      className={`group cursor-pointer flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${
                        activeRoom === `${currentUser._id}-${currentUser._id}`
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md"
                          : "hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="relative mr-3">
                        <Avatar className="h-6 w-6 ring-2 ring-border/20 dark:ring-gray-700/20 group-hover:ring-primary/30 transition-all duration-200">
                          <AvatarImage src={currentUser.image || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {currentUser.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {currentUser.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground -mt-1">
                          Notes to self
                        </span>
                      </div>
                    </button>
                  )}

                  {recentDms
                    .slice(0, 5)
                    .reduce(
                      (acc, dm) => {
                        // Find the other user in the DM
                        const otherUser = dm.participants.find(
                          (p) => p._id.toString() !== session?.user?._id
                        );

                        if (otherUser) {
                          acc.push({
                            ...dm,
                            user: otherUser,
                            room: dm.room,
                          } as DM & { user: IUser; room: string });
                        }
                        return acc;
                      },
                      [] as Array<DM & { user: IUser; room: string }>
                    )
                    .filter(
                      (dm) =>
                        !searchQuery ||
                        (dm.user &&
                          dm.user.fullName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()))
                    )
                    .map((dm) => {
                      const room = dm.room;

                      const user = dm.user;

                      return (
                        <button
                          key={(dm as any)._id}
                          onClick={() => handleRoomChange(room)}
                          className={`group cursor-pointer flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] ${
                            activeRoom === room
                              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-md"
                              : "hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="relative mr-3">
                            <Avatar className="h-6 w-6 ring-2 ring-border/20 dark:ring-gray-700/20 group-hover:ring-primary/30 transition-all duration-200">
                              <AvatarImage src={user.image || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {user.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {user.online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background shadow-sm"></span>
                            )}
                          </div>
                          {user.fullName}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => setIsNewChatDialogOpen(true)}
                    className="group cursor-pointer flex items-center w-full px-3 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-[1.01] hover:bg-accent/50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground"
                  >
                    <div className="relative mr-3">
                      <div className="h-6 w-6 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                    Start a new chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 h-full flex flex-col overflow-hidden bg-background dark:bg-gray-900/80 border-l border-r border-border/50 dark:border-gray-700/50">
            {isCallActive && callRef.current && (
              <Call
                callId={callRef.current.id}
                localStream={localStream}
                remoteStreams={remoteStreams}
                onEndCall={handleEndCall}
                userName={session?.user?.name || ""}
                onToggleScreenShare={handleToggleScreenShare}
                isScreenSharing={isScreenSharing}
                screenStream={screenStream}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                onToggleMute={handleToggleMute}
                onToggleVideo={handleToggleVideo}
                onInvite={handleInviteToCall}
              />
            )}

            {/* Chat Header */}
            <header className="flex items-center justify-between p-3 lg:p-4 border-b border-border/50 dark:border-gray-700/50 bg-background/30 dark:bg-transparent backdrop-blur-sm z-10">
              <div className="flex items-center overflow-hidden">
                <h2 className="text-base font-bold text-foreground cursor-pointer truncate">
                  {activeRoom === "general"
                    ? "General"
                    : activeRoom ===
                        `${session?.user?._id}-${session?.user?._id}`
                      ? currentUser?.fullName ||
                        session?.user?.name ||
                        "Personal Space"
                      : isDmRoom
                        ? channelUsers.find((u) => u._id !== session?.user?._id)
                            ?.fullName || "Chat"
                        : currentChannel?.name || "Chat"}
                </h2>
                <div className="flex items-center ml-3">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full mr-2",
                      isDmRoom
                        ? otherUser && otherUser.online
                          ? "bg-green-500"
                          : "bg-gray-400"
                        : users.filter((u) => u.online).length > 0
                          ? "bg-green-500"
                          : "bg-gray-400"
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isDmRoom ? (
                      <span className="hidden md:inline">
                        {otherUser && otherUser.online ? "Online" : "Offline"}
                      </span>
                    ) : (
                      `${users.filter((u) => u.online).length} Online`
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-xl hover:bg-accent/50"
                  onClick={() => {
                    initAudio(); // Initialize audio context on user interaction
                    setPermissionDialogOpen(true);
                  }}
                >
                  <PhoneIcon size={18} className="text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-xl hover:bg-accent/50"
                  onClick={() => setShowSearch(true)}
                >
                  <SearchIcon size={18} className="text-muted-foreground" />
                </Button>

                {/* Members Display */}
                <button
                  onClick={() => {
                    if (isDmRoom) {
                      const otherUser = channelUsers.find(
                        (u) => u._id !== session?.user?._id
                      );
                      if (otherUser) setSelectedUser(otherUser);
                    } else {
                      setMembersModalOpen(true);
                    }
                  }}
                  className="flex items-center group cursor-pointer"
                >
                  <div className="flex items-center -space-x-2 pr-2 transition-all duration-300 group-hover:-space-x-1">
                    {isDmRoom ? (
                      <Avatar className="h-7 w-7 lg:h-8 lg:w-8 border-2 border-background group-hover:z-10 transition-all duration-200">
                        <AvatarImage
                          src={
                            channelUsers.find(
                              (u) => u._id !== session?.user?._id
                            )?.image || undefined
                          }
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {(
                            channelUsers.find(
                              (u) => u._id !== session?.user?._id
                            )?.fullName || ""
                          )
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <>
                        {channelUsers.slice(0, 4).map((user) => (
                          <Avatar
                            key={user.id || user._id}
                            className="h-7 w-7 lg:h-8 lg:w-8 border-2 border-background group-hover:z-10 transition-all duration-200"
                          >
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-xs font-semibold">
                              {(user.fullName || "")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {channelUsers.length > 4 && (
                          <Avatar className="h-8 w-8 border-2 border-background cursor-pointer">
                            <AvatarFallback className="text-xs font-semibold bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              +{channelUsers.length - 4}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </header>

            {/* Search Bar */}
            {showSearch && (
              <div className="border-b border-border/50 p-2 flex items-center gap-2 bg-card/50 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  placeholder="Search in chat..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 py-1"
                  value={chatSearchQuery}
                  onChange={handleChatSearch}
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {currentResultIndex + 1} of {searchResults.length}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-7 w-7 "
                  onClick={handlePrevResult}
                  disabled={searchResults.length === 0}
                >
                  <ChevronDownIcon size={16} className="transform rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-7 w-7 "
                  onClick={handleNextResult}
                  disabled={searchResults.length === 0}
                >
                  <ChevronDownIcon size={16} className="transform -rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-7 w-7 cursor-pointer"
                  onClick={handleCloseSearch}
                >
                  <XIcon size={16} />
                </Button>
              </div>
            )}

            {/* Chat Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6 custom-scrollbar max-h-[calc(93vh-250px)] md:max-h-none"
            >
              {messages
                .filter((msg) => !msg.threadId)

                .map((msg, index) => {
                  const isSender = msg.userId === session?.user?._id;
                  const user = users.find((u) => u._id === msg.userId);
                  const prevMsg = messages[index - 1];
                  const showTimeSeparator =
                    index === 0 ||
                    (prevMsg &&
                      new Date(msg.createdAt || Date.now()).toDateString() !==
                        new Date(
                          prevMsg.createdAt || Date.now()
                        ).toDateString());

                  return (
                    <div
                      key={msg.id}
                      ref={(el) => {
                        messageRefs.current[index] = el;
                      }}
                      className={`${searchResults.includes(index) ? (index === searchResults[currentResultIndex] ? "bg-primary/10 rounded-lg" : "") : ""}`}
                    >
                      {showTimeSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-card/80 border border-border/40 rounded-full px-4 py-1 text-xs text-muted-foreground font-medium">
                            {(() => {
                              try {
                                const msgDate = new Date(
                                  msg.createdAt || Date.now()
                                );
                                if (isNaN(msgDate.getTime())) {
                                  return "Today";
                                }
                                return msgDate.toLocaleDateString([], {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                });
                              } catch (error) {
                                return "Today";
                              }
                            })()}
                          </div>
                        </div>
                      )}

                      <MessageBubble
                        id={`message-${index}`}
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
                        onDelete={handleDeleteMessage}
                        onStartThread={handleStartThread}
                        onScrollToMessage={handleScrollToMessage}
                        sendReadReceipt={sendReadReceipt}
                        voiceUploadProgress={voiceUploadProgress}
                        onJoinCall={handleJoinCall}
                        isCallActive={isCallActive}
                        users={users}
                        onMentionClick={setSelectedUser}
                      />
                    </div>
                  );
                })}
              <div ref={bottomRef} />
            </div>

            {showScrollToBottom && (
              <button
                onClick={() => {
                  if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTo({
                      top: messagesContainerRef.current.scrollHeight,
                      behavior: "smooth",
                    });
                    setHasUserScrolledUp(false);
                  }
                }}
                className="fixed bottom-24 right-8 bg-primary text-white rounded-full p-3 shadow-lg z-50 animate-bounce"
              >
                <ChevronDownIcon size={20} />
              </button>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog
              open={showDeleteConfirm}
              onOpenChange={setShowDeleteConfirm}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  This action will permanently delete the message. This cannot
                  be undone.
                </DialogDescription>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>{" "}
                  <Button variant="destructive" onClick={confirmDeleteMessage}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Typing Indicator */}
            <div className="h-6 px-4 pb-2 flex items-center">
              {typingUsers.length > 0 && (
                <div className="text-xs text-muted-foreground italic animate-pulse">
                  {typingUsers.join(", ")}
                  {typingUsers.length === 1 ? " is" : " are"} typing...
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="backdrop-blur-sm bg-card/50 border-t border-border/50 p-4 dark:border-gray-700/50 dark:bg-transparent">
              {replyingTo && (
                <div className="mb-2 p-2 border-l-2 border-primary bg-background/50 dark:bg-gray-800/50 rounded-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {replyingTo.file && !Array.isArray(replyingTo.file) && (
                        <>
                          {replyingTo.file.type?.startsWith("image") ||
                          replyingTo.file.thumbnailUrl ? (
                            <img
                              src={
                                replyingTo.file.thumbnailUrl ||
                                replyingTo.file.url
                              }
                              alt="reply-thumb"
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-semibold text-primary">
                          Replying to{" "}
                          {replyingTo.sender?.fullName ||
                            replyingTo.fullName ||
                            "Someone"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {replyingTo.text ||
                            (replyingTo.file
                              ? Array.isArray(replyingTo.file)
                                ? replyingTo.file[0]?.name ||
                                  `${replyingTo.file.length} files`
                                : replyingTo.file.name || "a file"
                              : "File attachment")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={() => setReplyingTo(null)}
                    >
                      <XIcon size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {stagedFiles.length > 0 && (
                <div className="mb-2 p-2 border border-border/50 rounded-lg bg-background/50 dark:bg-gray-800/50">
                  <p className="text-sm font-semibold mb-2 px-2">
                    Attached Files
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {stagedFiles.map((file, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="relative group bg-background/70 p-2 rounded-lg flex flex-col items-start gap-2 h-24 justify-between">
                          {stagedFilePreviews[index] ? (
                            <img
                              src={stagedFilePreviews[index]}
                              alt={file.name}
                              className="w-full h-16 object-cover rounded-md"
                            />
                          ) : (
                            <div className="flex items-center gap-2 w-full h-16">
                              <FileIcon className="h-8 w-8 text-primary shrink-0" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-medium truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
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
                          {isUploading &&
                            uploadProgress[file.name] !== undefined && (
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative mt-auto">
                                <Progress
                                  value={
                                    uploadProgress[file.name] > 100
                                      ? 100
                                      : uploadProgress[file.name]
                                  }
                                  className="h-2"
                                />
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
                <div className="flex items-end backdrop-blur-sm bg-background/50 border border-border/50 dark:border-gray-700/50 rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  {recordingState === "idle" ? (
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground w-full resize-none py-1 text-sm leading-relaxed max-h-32"
                      rows={1}
                    />
                  ) : (
                    <div className="w-full h-8.5 flex items-center gap-4">
                      {recordingState !== "sending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground"
                          onClick={handleCancelRecording}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                      <LiveAudioVisualizer
                        stream={recordingStream}
                        isRecording={recordingState === "recording"}
                        isSending={recordingState === "sending"}
                      />
                      {recordingState === "sending" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </div>
                      )}
                      {recordingState === "paused" && (
                        <div className="text-sm text-muted-foreground animate-pulse">
                          Paused
                        </div>
                      )}
                    </div>
                  )}
                  {showMentions && filteredMentionUsers.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50 min-w-72 max-w-80">
                      <div className="p-2 border-b border-border/30">
                        <p className="text-xs font-medium text-muted-foreground px-2">
                          Mention users
                        </p>
                      </div>
                      {filteredMentionUsers.map((user, index) => (
                        <button
                          key={user._id}
                          onClick={() => handleMentionSelect(user)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-accent/60 transition-all duration-150 text-left rounded-lg mx-1 my-0.5"
                        >
                          <Avatar className="h-8 w-8 ring-2 ring-background/50">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          {user.online && (
                            <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-1 ml-3">
                    {recordingState === "idle" && (
                      <>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hidden md:block rounded-xl hover:bg-accent/50 transition-all duration-200"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <SmileIcon
                              size={18}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            />
                          </Button>
                          {showEmojiPicker && (
                            <div
                              ref={emojiPickerRef}
                              className="absolute bottom-full right-0 mb-2 z-1000 shadow-xl border border-border/50 rounded-2xl overflow-hidden"
                              style={{ width: "min(320px, 90vw)" }}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <PaperclipIcon
                            size={18}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 rounded-xl hover:bg-red-500/10 transition-all duration-200 group"
                          onClick={() => setShowAlertModal(true)}
                        >
                          <BellIcon
                            size={18}
                            className="text-red-500 group-hover:text-red-600 transition-colors"
                          />
                        </Button>
                      </>
                    )}

                    {text.trim() || stagedFiles.length > 0 ? (
                      <Button
                        onClick={handleSendMessage}
                        disabled={isUploading}
                        size="sm"
                        className="h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        <SendIcon size={18} />
                      </Button>
                    ) : recordingState === "recording" ||
                      recordingState === "paused" ? (
                      <>
                        <Button
                          onClick={handlePauseRecording}
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 rounded-full"
                        >
                          {recordingState === "recording" ? (
                            <PauseIcon size={18} />
                          ) : (
                            <MicIcon size={18} />
                          )}
                        </Button>
                        <Button
                          onClick={handleSendVoiceMessage}
                          size="sm"
                          className="h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                          disabled={recordingState === "paused"}
                        >
                          <SendIcon size={18} />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleToggleRecording}
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-full transition-all duration-300"
                      >
                        <MicIcon size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {activeThreadId && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "28rem" }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ThreadView
                  isOpen={!!activeThreadId}
                  onClose={() => setActiveThreadId(null)}
                  threadId={activeThreadId}
                  messages={messages}
                  onReply={handleReplyInThread}
                  MessageBubbleComponent={MessageBubble}
                  sendReadReceipt={sendReadReceipt}
                  onJoinCall={handleJoinCall}
                  allUsers={users}
                  className="bg-background/70 dark:bg-gray-900/80 backdrop-blur-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!activeThreadId && (
            <div className="hidden lg:block w-72 backdrop-blur-lg bg-card/80 dark:bg-gray-900/50 border-l border-border/50 dark:border-gray-700/50 overflow-y-auto">
              {/* AI Summary Panel */}
              <div className="p-4 border-b border-border/30 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center">
                    <div className="p-1.5 bg-primary/10 rounded-lg mr-2 border border-primary/20">
                      <BellIcon className="h-4 w-4 text-primary" />
                    </div>
                    AI Assistant
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 rounded-xl hover:bg-accent/50 transition-all duration-200"
                  >
                    <ChevronDownIcon
                      size={16}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="backdrop-blur-sm bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 shadow-sm dark:bg-primary/10 dark:border-primary/20">
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
          )}
        </div>

        {/* Critical Alert Modal */}
        <SendAlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          onAlertSent={() => {
            // Optional: show a success toast or notification
          }}
          allUsers={users}
          allChannels={channels.map((c) => ({
            id: c.name.toLowerCase().replace(/ /g, "-"),
            name: c.name,
          }))}
          channelMembers={
            activeRoom.includes("-") // This is a DM room
              ? users.filter((u) => activeRoom.split("-").includes(u._id))
              : // This is a placeholder. In a real app, you'd get actual channel members.
                // For now, sending to a "channel" from chat sends to all users.
                activeRoom !== "general"
                ? users
                : undefined
          }
          currentRoom={activeRoom}
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
        <Dialog
          open={isPermissionDialogOpen}
          onOpenChange={setPermissionDialogOpen}
        >
          {/* Dialog content here */}
        </Dialog>

        <ChannelMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setMembersModalOpen(false)}
          users={channelUsers}
          onlineUserIds={onlineUsers}
          onViewProfile={(user) => setSelectedUser(user)}
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
          <DocumentPreview file={selectedDoc} onClose={closeDocPreview} />
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
              currentUserId={session?.user?.id || undefined}
              onRemoveReaction={handleReaction}
              onAddReaction={(emoji) =>
                handleReaction(activeReactionDetails.messageId, emoji)
              }
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
                email: selectedUser.email,
              }}
              onClose={() => setSelectedUser(null)}
              onStartChat={handleStartChat}
              currentUserId={session?.user?._id}
            />
          )}
        </AnimatePresence>
      </div>

      <Dialog
        open={isPermissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-card/90 dark:bg-slate-900/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <VideoIcon className="text-primary" />
              Start a Sync Call
            </DialogTitle>
            <DialogDescription>
              To start a call, we need access to your camera and microphone.
              Your browser will ask you for permission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPermissionDialogOpen(false);
                handleStartCall();
              }}
              className="bg-primary hover:bg-primary/90 cursor-pointer"
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Sound Palette for Development/Testing --- */}
      {/* In a real app, might conditionally render this based on user role */}
      {/* <div className="absolute bottom-0 left-0 p-4 z-50">
        <SoundPalette />
      </div> */}
    </>
  );
}
