"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, Loader2, XIcon } from 'lucide-react';

interface SendAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertSent: () => void;
}

export const SendAlertModal: React.FC<SendAlertModalProps> = ({ isOpen, onClose, onAlertSent }) => {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'critical' | 'urgent' | 'info'>('critical');
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return;
    setIsSendingAlert(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: alertMessage,
          level: alertType,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full backdrop-blur-xl bg-card/95 border-border/50 shadow-2xl">
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
          <p className="text-muted-foreground leading-relaxed">
            Alerts notify all relevant team members immediately. Use only for situations requiring attention.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Alert Type</label>
            <select value={alertType} onChange={(e) => setAlertType(e.target.value as 'critical' | 'urgent' | 'info')} className="backdrop-blur-sm bg-background/50 border border-border/60 rounded-xl px-4 py-3 w-full text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200">
              <option value="critical">Critical (Medical Emergency)</option>
              <option value="urgent">Urgent (Assistance Required)</option>
              <option value="info">Info (General Update)</option>
            </select>
          </div>
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