"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, SearchIcon, UserPlus, UserX, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface User {
  _id: string;
  fullName: string;
  image?: string;
}

interface Channel {
  _id: string;
  name: string;
  members: string[];
}

interface ManageChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  allUsers: User[];
  onChannelUpdated: () => void;
}

export const ManageChannelModal: React.FC<ManageChannelModalProps> = ({ isOpen, onClose, channel, allUsers, onChannelUpdated }) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Holds userId being updated

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const channelMembers = useMemo(() => {
    if (!channel) return [];
    return allUsers.filter(user => channel.members.includes(user._id));
  }, [channel, allUsers]);

  const usersToAdd = useMemo(() => {
    if (!channel) return [];
    const memberIds = new Set(channel.members);
    return allUsers.filter(user => 
      !memberIds.has(user._id) && 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channel, allUsers, searchQuery]);

  const handleMemberAction = async (userId: string, action: 'add' | 'remove') => {
    if (!channel) return;
    setIsUpdating(userId);
    try {
      const response = await fetch(`/api/channels/${channel._id}/members`, {
        method: action === 'add' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        onChannelUpdated(); // Re-fetch channels in the parent component
        toast.success(action === 'add' ? t('manageChannelModal.memberAdded') : t('manageChannelModal.memberRemoved'));
        onClose();
      } else {
        // Handle error (e.g., show a toast)
        console.error(action === 'add' ? t('manageChannelModal.errorAdding') : t('manageChannelModal.errorRemoving'));
        toast.error(action === 'add' ? t('manageChannelModal.failedToAdd') : t('manageChannelModal.failedToRemove'));
      }
    } catch (error) {
      console.error(action === 'add' ? t('manageChannelModal.errorAdding') : t('manageChannelModal.errorRemoving'), error);
      toast.error(action === 'add' ? t('manageChannelModal.failedToAdd') : t('manageChannelModal.failedToRemove'));
    } finally {
      setIsUpdating(null);
    }
  };

  if (!channel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-background/95 dark:bg-slate-900/80 border-border/50 shadow-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('manageChannelModal.title').replace('#{channelName}', channel.name)}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] flex flex-col">
          {/* Add Members Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{t('manageChannelModal.addMembers')}</h3>
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('manageChannelModal.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                {usersToAdd.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarImage src={user.image} /><AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{user.fullName}</span>
                    </div>
                    <Button className='cursor-pointer' size="sm" variant="ghost" onClick={() => handleMemberAction(user._id, 'add')} disabled={isUpdating === user._id}>
                      {isUpdating === user._id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    </Button>
                  </div>
                ))}
                {usersToAdd.length === 0 && <p className="text-xs text-muted-foreground text-center p-2">{t('manageChannelModal.noUsersFound')}</p>}
              </div>
            )}
          </div>

          {/* Current Members Section */}
          <div className="space-y-3 flex-1 min-h-0">
            <h3 className="text-sm font-semibold text-foreground">{t('manageChannelModal.membersCount').replace('{count}', channelMembers.length.toString())}</h3>
            <div className="max-h-full overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {channelMembers.map(member => (
                <div key={member._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={member.image} /><AvatarFallback>{member.fullName.slice(0, 2)}</AvatarFallback></Avatar>
                    <span className="text-sm font-medium">{member.fullName}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 cursor-pointer" onClick={() => handleMemberAction(member._id, 'remove')} disabled={isUpdating === member._id}>
                    {isUpdating === member._id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};