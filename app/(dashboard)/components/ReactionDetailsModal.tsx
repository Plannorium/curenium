"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XIcon, SmileIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

interface ReactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  emoji: string;
  users: any[];
  allUsers: any[];
  currentUserId?: string;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onAddReaction: (emoji: string) => void;
}

export const ReactionDetailsModal: React.FC<ReactionDetailsModalProps> = ({
  isOpen,
  onClose,
  messageId,
  emoji,
  users,
  allUsers,
  currentUserId,
  onRemoveReaction,
  onAddReaction,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUserHasReacted = users.some(user => user.userId === currentUserId);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onAddReaction(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const content = (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl">{emoji}</div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{users.length} Reaction{users.length > 1 ? 's' : ''}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-xl -mr-2 sm:mr-0">
            <XIcon size={18} />
          </Button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-3 pr-2 -mr-2 custom-scrollbar">
          {users.map((reactingUser) => {
            const user = allUsers.find(u => u.id === reactingUser.userId || u._id === reactingUser.userId);
            return (
              <div key={reactingUser.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {(user?.fullName || '').split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{user?.fullName}</p>
                    {reactingUser.userId === currentUserId && (
                      <p className="text-xs text-muted-foreground">You</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/50 p-3 bg-background/50 rounded-b-2xl">
        <div className="flex items-center justify-between gap-2">
          {currentUserHasReacted && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onRemoveReaction(messageId, emoji);
                onClose();
              }}
            >
              Remove Reaction
            </Button>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(p => !p)}
              className="rounded-full"
            >
              <SmileIcon size={20} className="text-muted-foreground" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
            onClick={onClose}
          >
            <motion.div
              ref={modalRef}
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="bg-card border-t border-border/50 rounded-t-2xl shadow-2xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};