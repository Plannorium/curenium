"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchIcon, UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  _id: string;
  fullName: string;
  image?: string;
  role?: string;
}

interface ChannelMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onlineUserIds: string[];
  onViewProfile: (user: User) => void;
}

export const ChannelMembersModal: React.FC<ChannelMembersModalProps> = ({
  isOpen,
  onClose,
  users,
  onlineUserIds,
  onViewProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-background/80 dark:bg-slate-900/95 border-border/30 shadow-2xl max-w-md p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/30">
          <DialogTitle className="text-lg font-semibold">Channel Members ({users.length})</DialogTitle>
          <div className="relative pt-2">
            <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-background/70 dark:bg-slate-800/60 border-border/50 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-6 pt-2 custom-scrollbar">
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {filteredUsers.map(user => {
              const isOnline = onlineUserIds.includes(user._id);
              return (
                <motion.div
                  key={user._id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent/60 dark:hover:bg-slate-800/70 transition-colors duration-200"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-11 w-11 border-2 border-transparent group-hover:border-primary/50 transition-all">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-sm font-semibold">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse-strong" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.role || 'Member'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-slate-700 rounded-full cursor-pointer"
                    onClick={() => {
                      onViewProfile(user);
                      onClose();
                    }}
                  >
                    <UserIcon size={20} />
                  </Button>
                </motion.div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No members found.</p>
              </div>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};