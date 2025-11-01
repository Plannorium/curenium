"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, XIcon, User, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Alert {
  _id: string;
  level: 'critical' | 'urgent' | 'info';
  message: string;
  createdBy: {
    _id: string;
    fullName: string;
    image?: string;
  };
  createdAt: string;
}

interface AlertDetailsModalProps {
  alert: Alert;
  onClose: () => void;
}

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ alert, onClose }) => {
  const alertColors = {
    critical: 'red',
    urgent: 'amber',
    info: 'blue',
  };
  const color = alertColors[alert.level];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className={`max-w-md w-full backdrop-blur-xl bg-card/95 border-${color}-500/50 shadow-2xl shadow-${color}-500/10`} onClick={e => e.stopPropagation()}>
        <CardHeader className="relative pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className={`text-xl font-bold text-foreground flex items-center`}>
              <div className={`p-2 bg-${color}-500/10 rounded-lg mr-3 border border-${color}-500/20`}>
                <BellIcon size={20} className={`text-${color}-500`} />
              </div>
              Alert Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-xl hover:bg-accent/50">
              <XIcon size={18} className="text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <CardDescription className="capitalize text-lg font-semibold">{alert.level} Alert</CardDescription>
          <p className="text-base text-foreground leading-relaxed p-4 bg-background/50 border rounded-lg">{alert.message}</p>
          <div className="flex items-center text-sm text-muted-foreground gap-4 pt-2">
            <div className="flex items-center gap-2">
              <User size={14} /> Sent by {alert.createdBy.fullName}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} /> {timeSince(new Date(alert.createdAt))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};