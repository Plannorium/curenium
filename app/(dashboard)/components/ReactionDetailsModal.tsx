"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  emoji: string;
  users: any[];
  currentUserId?: string;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

export const ReactionDetailsModal: React.FC<ReactionDetailsModalProps> = ({
  isOpen,
  onClose,
  messageId,
  emoji,
  users,
  currentUserId,
  onRemoveReaction,
}) => {
  const currentUserHasReacted = users.some(user => user.userId === currentUserId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{emoji}</div>
                  <h2 className="text-xl font-bold text-foreground">{users.length} Reaction{users.length > 1 ? 's' : ''}</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-xl">
                  <XIcon size={18} />
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-4 pr-2 -mr-2 custom-scrollbar">
                {users.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {(user.userName || '').split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{user.userName}</p>
                        {user.userId === currentUserId && (
                          <p className="text-xs text-muted-foreground">You</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentUserHasReacted && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onRemoveReaction(messageId, emoji)}
                  >
                    Remove Reaction
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};