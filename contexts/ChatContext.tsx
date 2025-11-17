
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IUser } from '@/models/User';

interface DM {
  [key: string]: any;
  participants: IUser[];
}

interface ChatContextType {
  recentDms: DM[];
  setRecentDms: React.Dispatch<React.SetStateAction<DM[]>>;
  addRecentDm: (dm: DM) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [recentDms, setRecentDms] = useState<any[]>([]);

  const addRecentDm = (dm: DM) => {
    setRecentDms((prevDms) => {
      // Prevent duplicate entries for the same room
      if (prevDms.find((d) => d.room === dm.room)) return prevDms;
      return [dm, ...prevDms];
    });
  };
  return (
    <ChatContext.Provider value={{ recentDms, setRecentDms, addRecentDm }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};