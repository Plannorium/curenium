"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchIcon, MessageSquare } from 'lucide-react';

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
      <DialogContent className="backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl max-w-md p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle>Channel Members ({users.length})</DialogTitle>
          <div className="relative pt-2">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-6 pt-2 custom-scrollbar">
          <div className="space-y-2">
            {filteredUsers.map(user => {
              const isOnline = onlineUserIds.includes(user._id);
              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-xs">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.role || 'Member'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      onViewProfile(user);
                      onClose();
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No members found.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};