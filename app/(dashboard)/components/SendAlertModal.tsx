"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, Loader2, XIcon, Users, SearchIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { playSound } from '@/lib/sound/soundGenerator';

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

export const SendAlertModal: React.FC<SendAlertModalProps> = ({ isOpen, onClose, onAlertSent, allUsers, allChannels = [], channelMembers }) => {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'critical' | 'urgent' | 'info'>('critical');
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      // If channel members are provided, it's a channel-context alert. Pre-select them.
      // Otherwise, it's a general alert, so reset selections.
      setSelectedRecipients(channelMembers ? channelMembers.map(u => u._id) : []);
      setAlertMessage('');
      setSearchQuery('');
    }
  }, [isOpen, channelMembers]);

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;
    setIsSendingAlert(true);
    try {
      // If not in a channel context (i.e., from the Alerts page), ensure at least one recipient is selected.
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-md w-full backdrop-blur-xl bg-card/95 border-border/50 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-primary/5 rounded-xl pointer-events-none"></div>
        <CardHeader className="relative pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg mr-3 border border-red-500/20">
                <BellIcon size={20} className="text-red-500" />
              </div>
              Send New Alert
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-200">
              <XIcon size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <CardDescription>
            Alerts notify all relevant team members immediately. Use only for situations requiring attention.
          </CardDescription>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Alert Type</label>
            <select value={alertType} onChange={(e) => setAlertType(e.target.value as 'critical' | 'urgent' | 'info')} className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl px-4 py-3 w-full text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200">
              <option value="critical">Critical (Medical Emergency)</option>
              <option value="urgent">Urgent (Assistance Required)</option>
              <option value="info">Info (General Update)</option>
            </select>
          </div>

          {/* Recipient Selector (only shows if not in a specific channel context) */}
          {!channelMembers && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Recipients</label>
                <div className="relative">
                  <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users or channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl pl-10 pr-4 py-2.5 w-full text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
                {selectedRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedRecipients.map(recipientId => {
                      const isChannel = recipientId.startsWith('channel:');
                      const id = isChannel ? recipientId.replace('channel:', '') : recipientId;

                      if (isChannel) {
                        const channel = allChannels.find(c => c.id === id);
                        if (!channel) return null;
                        return (
                          <div key={recipientId} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium animate-in fade-in-50">
                            <span>#{channel.name}</span>
                            <button onClick={() => toggleRecipient(recipientId)} className="p-0.5 rounded-full hover:bg-primary/20">
                              <XIcon size={12} />
                            </button>
                          </div>
                        );
                      } else {
                        const user = allUsers.find(u => u._id === id);
                        if (!user) return null;
                        return (
                          <div key={recipientId} className="flex items-center gap-2 bg-primary/10 text-primary rounded-full pl-1 pr-2 py-0.5 text-xs font-medium animate-in fade-in-50">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={user.image} />
                              <AvatarFallback className="text-[10px]">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.fullName}</span>
                            <button onClick={() => toggleRecipient(recipientId)} className="p-0.5 rounded-full hover:bg-primary/20"><XIcon size={12} /></button>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-background/50 rounded-lg border border-border/60 custom-scrollbar">
                  {/* Channels */}
                  {allChannels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(channel => (
                    <div
                      key={`channel-${channel.id}`}
                      onClick={() => toggleRecipient(`channel:${channel.id}`)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedRecipients.includes(`channel:${channel.id}`) ? 'bg-primary/20' : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="h-7 w-7 mr-3 flex items-center justify-center bg-primary/10 rounded-md text-primary font-bold text-sm">#</div>
                      <span className="text-sm font-medium text-foreground">{channel.name}</span>
                      <div className={`ml-auto h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedRecipients.includes(`channel:${channel.id}`) ? 'bg-primary border-primary-foreground' : 'border-border'}`}>
                        {selectedRecipients.includes(`channel:${channel.id}`) && <div className="h-2 w-2 bg-primary-foreground rounded-full"></div>}
                      </div>
                    </div>
                  ))}
                  {/* Users */}
                  {filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => toggleRecipient(user._id)}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                        selectedRecipients.includes(user._id) ? 'bg-primary/20' : 'hover:bg-accent/50'
                      }`}
                    >
                      <Avatar className="h-7 w-7 mr-3">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-xs">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{user.fullName}</span>
                      <div className={`ml-auto h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedRecipients.includes(user._id) ? 'bg-primary border-primary-foreground' : 'border-border'}`}>
                        {selectedRecipients.includes(user._id) && <div className="h-2 w-2 bg-primary-foreground rounded-full"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Message</label>
            <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl px-4 py-3 w-full text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 resize-none" rows={3} placeholder="Describe the situation..." />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 backdrop-blur-sm bg-background/50 border-border/60 hover:bg-accent/50 transition-all duration-200">
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50" onClick={handleSendAlert} disabled={!alertMessage.trim() || isSendingAlert}>
              {isSendingAlert ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : 'Send Alert'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};