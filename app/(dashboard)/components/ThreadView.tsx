"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/hooks/useChat";
import { SendIcon } from "lucide-react";

interface ThreadViewProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string | null;
  messages: Message[];
  onReply: (threadId: string, content: string) => void;
  MessageBubbleComponent: React.ComponentType<any>;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  isOpen,
  onClose,
  threadId,
  messages,
  onReply,
  MessageBubbleComponent,
}) => {
  const [replyContent, setReplyContent] = useState("");
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

  return (
    <AnimatePresence>
      {isOpen && threadId && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-0 right-0 h-full w-full max-w-md bg-card/95 backdrop-blur-lg border-l border-border/50 shadow-2xl flex flex-col z-40"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-primary" size={20} />
              <h3 className="font-bold text-lg text-foreground">Thread</h3>
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
              <div className="border-b border-border/50 pb-4">
                <MessageBubbleComponent
                  msg={parentMessage}
                  isSender={false}
                  showTime={true}
                />
              </div>
            )}

            {/* Replies */}
            <div className="space-y-4">
              {threadReplies.map((reply) => (
                <MessageBubbleComponent
                  key={reply.id}
                  msg={reply}
                  isSender={false}
                  showTime={true}
                />
              ))}
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
                placeholder={`Reply in thread...`}
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