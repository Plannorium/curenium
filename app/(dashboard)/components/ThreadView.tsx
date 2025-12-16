"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/hooks/useChat";
import { SendIcon } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface User {
  id: string;
  _id: string;
  fullName: string;
  image?: string;
  role?: string;
  email?: string;
}

interface ThreadViewProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string | null;
  messages: Message[];
  onReply: (threadId: string, content: string) => void;
  MessageBubbleComponent: React.ComponentType<any>;
  sendReadReceipt: (messageId: string) => void;
  onJoinCall: (callId: string) => void;
  allUsers: User[];
  className?: string;
  openDocPreview?: (file: any) => void;
  openLightbox?: (images: Array<{ url: string; name: string }>, initialIndex: number) => void;
  handleReaction?: (messageId: string, emoji: string) => void;
  onAlertClick?: (alert: any) => void;
  onReactionClick?: (messageId: string, emoji: string, users: any[]) => void;
  onStartThread?: (message: any) => void;
  onScrollToMessage?: (messageId: string) => void;
  voiceUploadProgress?: Record<string, number>;
  isCallActive?: boolean;
  onMentionClick?: (user: User) => void;
  userTimezone: string;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  isOpen,
  onClose,
  threadId,
  messages,
  onReply,
  MessageBubbleComponent,
  sendReadReceipt,
  onJoinCall,
  allUsers,
  className,
  openDocPreview,
  openLightbox,
  handleReaction,
  onAlertClick,
  onReactionClick,
  onStartThread,
  onScrollToMessage,
  voiceUploadProgress,
  isCallActive,
  onMentionClick,
  userTimezone,
}) => {
  const { language } = useLanguage();
  const [replyContent, setReplyContent] = useState("");

  // Validate timezone
  useEffect(() => {
    const isValidTimezone = (tz: string): boolean => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch (e) {
        return false;
      }
    };

    if (!isValidTimezone(userTimezone)) {
      console.warn(`Invalid timezone: ${userTimezone}, falling back to UTC`);
    }
  }, [userTimezone]);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  const parentMessage = messages.find((m) => m.id === threadId);
  const threadReplies = messages.filter((m) => m.threadId === threadId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadReplies]);

  const handleSendReply = () => {
    if (replyContent.trim() && threadId) {
      onReply(threadId, replyContent);
      setReplyContent("");
    }
  };

  const isRTL = language === 'ar';

  return (
    <AnimatePresence>
      {isOpen && threadId && (
        <motion.div
          initial={{ x: isRTL ? "-100%" : "100%" }}
          animate={{ x: "0%" }}
          exit={{ x: isRTL ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-card/95 backdrop-blur-lg ${isRTL ? 'border-r' : 'border-l'} border-border/50 shadow-2xl flex flex-col z-40 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary" size={20} />
              <h3 className="font-bold text-lg text-foreground">{t('threadView.title')}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <XIcon size={20} />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 md:max-h-[calc(100vh-15rem)]">
            {/* Parent Message */}
            {parentMessage && (
              (() => {
                const user = allUsers.find(u => u._id === parentMessage.userId);
                return (
                  <div className="border-b border-border/50 pb-4">
                    <MessageBubbleComponent
                      id={`thread-parent-${parentMessage.id}`}
                      msg={parentMessage}
                      user={user}
                      isSender={false} // This is context-dependent, assuming parent is not the sender
                      showTime={true}
                      openDocPreview={openDocPreview}
                      openLightbox={openLightbox}
                      handleReaction={handleReaction}
                      onAlertClick={onAlertClick}
                      onReactionClick={onReactionClick}
                      onReply={() => {}} // Disable reply in thread view
                      onDelete={() => {}} // Disable delete in thread view
                      onStartThread={onStartThread}
                      onScrollToMessage={onScrollToMessage}
                      sendReadReceipt={sendReadReceipt}
                      voiceUploadProgress={voiceUploadProgress}
                      onJoinCall={onJoinCall}
                      isCallActive={isCallActive}
                      users={allUsers}
                      onMentionClick={onMentionClick}
                      userTimezone={userTimezone}
                    />
                  </div>
                );
              })()
            )}

            {/* Replies */}
            <div className="space-y-4">
              {threadReplies.map((reply) => {
                const user = allUsers.find(u => u._id === reply.userId);
                return <MessageBubbleComponent
                  key={reply.id}
                  id={`thread-reply-${reply.id}`}
                  msg={reply}
                  isSender={false}
                  showTime={true}
                  openDocPreview={openDocPreview}
                  openLightbox={openLightbox}
                  handleReaction={handleReaction}
                  onAlertClick={onAlertClick}
                  onReactionClick={onReactionClick}
                  onReply={() => {}} // Disable reply in thread view
                  onDelete={() => {}} // Disable delete in thread view
                  onStartThread={onStartThread}
                  onScrollToMessage={onScrollToMessage}
                  sendReadReceipt={sendReadReceipt}
                  voiceUploadProgress={voiceUploadProgress}
                  onJoinCall={onJoinCall}
                  isCallActive={isCallActive}
                  users={allUsers}
                  onMentionClick={onMentionClick}
                  user={user}
                  userTimezone={userTimezone}
                />;
              })}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div className="p-4 border-t border-border/50 bg-background/50">
            <div className="relative">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder={t('threadView.replyPlaceholder')}
                className="pr-12 min-h-[40px] resize-none"
                rows={1}
              />
              <Button
                size="sm"
                className="absolute right-2 bottom-2 h-7 w-7 p-0"
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
              >
                <SendIcon size={14} />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};