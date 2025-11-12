"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BellIcon, Loader2, X, Users, SearchIcon, AlertTriangle, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { playSound } from '@/lib/sound/soundGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  _id: string;
  fullName: string;
  image?: string;
}

interface Channel {
  id: string;
  name: string;
}

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertSent: () => void;
  allUsers: User[];
  allChannels?: Channel[];
  channelMembers?: User[];
}

const alertLevelConfig = {
  critical: {
    icon: BellIcon,
    color: 'red',
    title: 'Critical Alert',
    description: 'Medical emergency, requires immediate attention.',
    styles: {
      dialog: 'border-red-500/30 dark:border-red-500/40',
      iconContainer: 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400',
      button: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white',
    },
  },
  urgent: {
    icon: AlertTriangle,
    color: 'amber',
    title: 'Urgent Alert',
    description: 'Assistance required, prompt response needed.',
    styles: {
      dialog: 'border-amber-500/30 dark:border-amber-500/40',
      iconContainer: 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white',
    },
  },
  info: {
    icon: Info,
    color: 'blue',
    title: 'Info Alert',
    description: 'General update for all team members.',
    styles: {
      dialog: 'border-blue-500/30 dark:border-blue-500/40',
      iconContainer: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400',
      button: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
    },
  },
};

export const SendAlertModal: React.FC<SendAlertModalProps> = ({ isOpen, onClose, onAlertSent, allUsers, allChannels = [], channelMembers }) => {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'critical' | 'urgent' | 'info'>('critical');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedRecipients(channelMembers ? channelMembers.map(u => u._id) : []);
      setAlertMessage('');
      setSearchQuery('');
    }
  }, [isOpen, channelMembers]);

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;
    setIsSendingAlert(true);
    try {
      if (!channelMembers && selectedRecipients.length === 0) {
        alert('Please select at least one user or channel.');
        setIsSendingAlert(false);
        return;
      }
      playSound('alert');
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: alertMessage,
          level: alertType,
          recipients: selectedRecipients,
        }),
      });
      if (response.ok) {
        setAlertMessage('');
        onAlertSent();
        onClose();
      }
    } catch (error) { 
      console.error('Failed to send alert:', error);
    } finally {
      setIsSendingAlert(false);
    }
  };

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const config = alertLevelConfig[alertType];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className={`sm:max-w-md p-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t-4 transition-all duration-300 ${config.styles.dialog}`}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center text-xl font-bold text-gray-800 dark:text-gray-100">
            <div className={`p-2 rounded-lg mr-3 border ${config.styles.iconContainer}`}>
              <Icon size={20} />
            </div>
            Send New Alert
          </DialogTitle>
          <DialogDescription className="pt-1 pl-12">
            {config.description}
          </DialogDescription>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Alert Type</label>
            <Select value={alertType} onValueChange={(value: 'critical' | 'urgent' | 'info') => setAlertType(value)}>
              <SelectTrigger className="w-full bg-gray-50/80 dark:bg-gray-900/80 border-gray-300/70 dark:border-gray-700/60 text-gray-800 dark:text-gray-100">
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!channelMembers && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Recipients</label>
              <div className="relative">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users or channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50/80 dark:bg-gray-900/80 border border-gray-300/70 dark:border-gray-700/60 rounded-lg pl-10 pr-4 py-2 w-full text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedRecipients.map(recipientId => {
                    const isChannel = recipientId.startsWith('channel:');
                    const id = isChannel ? recipientId.replace('channel:', '') : recipientId;

                    if (isChannel) {
                      const channel = allChannels.find(c => c.id === id);
                      if (!channel) return null;
                      return (
                        <div key={recipientId} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full px-2.5 py-1 text-xs font-medium animate-in fade-in-50">
                          <span>#{channel.name}</span>
                          <button onClick={() => toggleRecipient(recipientId)} className="p-0.5 rounded-full hover:bg-blue-500/20">
                            <X size={12} />
                          </button>
                        </div>
                      );
                    } else {
                      const user = allUsers.find(u => u._id === id);
                      if (!user) return null;
                      return (
                        <div key={recipientId} className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full pl-1 pr-2 py-0.5 text-xs font-medium animate-in fade-in-50">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="text-[10px]">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.fullName}</span>
                          <button onClick={() => toggleRecipient(recipientId)} className="p-0.5 rounded-full hover:bg-blue-500/20"><X size={12} /></button>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
              <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-gray-50/80 dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/60 custom-scrollbar">
                {allChannels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(channel => (
                  <div
                    key={`channel-${channel.id}`}
                    onClick={() => toggleRecipient(`channel:${channel.id}`)}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedRecipients.includes(`channel:${channel.id}`) ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'}`}>
                    <div className="h-7 w-7 mr-3 flex items-center justify-center bg-gray-200/80 dark:bg-gray-800/80 rounded-md text-gray-500 dark:text-gray-400 font-bold text-sm">#</div>
                    <span className="text-sm font-medium">{channel.name}</span>
                  </div>
                ))}
                {filteredUsers.map(user => (
                  <div
                    key={user._id}
                    onClick={() => toggleRecipient(user._id)}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedRecipients.includes(user._id) ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'}`}>
                    <Avatar className="h-7 w-7 mr-3">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-xs">
                        {user.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.fullName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
            <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="bg-gray-50/80 dark:bg-gray-900/80 border border-gray-300/70 dark:border-gray-700/60 rounded-lg px-3 py-2 w-full text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200 resize-none" rows={3} placeholder="Describe the situation..." />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button className={`w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 ${config.styles.button}`} onClick={handleSendAlert} disabled={!alertMessage.trim() || isSendingAlert}>
            {isSendingAlert ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
            ) : 'Send Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};