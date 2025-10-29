"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { XIcon, MessageSquare } from 'lucide-react';
import { motion } from "framer-motion";

interface User {
  id: string;
  _id: string;
  fullName: string;
  image?: string;
  role?: string;
  email?: string;
  isOnline?: boolean;
}

interface UserProfileCardProps {
  user: User;
  onClose: () => void;
  onStartChat: (userId: string) => void;
  currentUserId?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onClose, onStartChat, currentUserId }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-50">
      <div className="relative bg-card border rounded-xl shadow-2xl w-full max-w-sm m-4">
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="sm" className="p-2 rounded-full" onClick={onClose}>
            <XIcon size={18} />
          </Button>
        </div>
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {(user.fullName || "").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-2xl font-bold mt-4 text-foreground">{user.fullName}</h3>
            {user.role && <p className="text-sm text-muted-foreground font-medium">{user.role}</p>}

            <div className="mt-6 w-full text-left">
              <h4 className="font-semibold text-foreground mb-2">Channels</h4>
            <div className="flex flex-wrap gap-2">
              {/* Placeholder for channels */}
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full"># general</span>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full"># design</span>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full"># engineering</span>
            </div>
          </div>

          {user._id !== currentUserId && (
            <div className="mt-8">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/40"
                onClick={() => onStartChat(user.id || user._id)}
              >
                <MessageSquare size={16} className="mr-2" />
                Message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};