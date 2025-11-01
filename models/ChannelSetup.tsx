"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon, PlusIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChannelSetupProps {
  onComplete: (channels: string[]) => void;
  isLoading: boolean;
}

export const ChannelSetup: React.FC<ChannelSetupProps> = ({ onComplete, isLoading }) => {
  const [channels, setChannels] = useState<string[]>(['General', 'Emergency Ward', 'Cardiology']);
  const [newChannel, setNewChannel] = useState('');

  const handleAddChannel = () => {
    if (newChannel.trim() && !channels.find(c => c.toLowerCase() === newChannel.trim().toLowerCase())) {
      setChannels([...channels, newChannel.trim()]);
      setNewChannel('');
    }
  };

  const handleRemoveChannel = (channelToRemove: string) => {
    setChannels(channels.filter(c => c !== channelToRemove));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-foreground">Setup Your Departments</h2>
      <p className="text-center text-muted-foreground mt-2 mb-8">
        Create channels for different teams or topics. 'General' is included by default.
      </p>

      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {channels.map(channel => (
            <motion.div
              key={channel}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between bg-card/80 border border-border/50 rounded-lg px-4 py-3"
            >
              <span className="font-medium text-foreground"># {channel}</span>
              {channel !== 'General' && (
                <button onClick={() => handleRemoveChannel(channel)} className="text-muted-foreground hover:text-red-500">
                  <XIcon size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
          placeholder="e.g., Pediatrics"
          className="flex-grow"
        />
        <Button variant="outline" onClick={handleAddChannel} className="px-4">
          <PlusIcon size={16} className="mr-2" /> Add
        </Button>
      </div>

      <Button
        onClick={() => onComplete(channels)}
        disabled={isLoading}
        className="w-full mt-8 text-lg py-6"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
      </Button>
    </div>
  );
};