'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Send, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface InviteActionsProps {
  invite: {
    _id: string;
    status: string;
    email: string;
  };
}

export const InviteActions: React.FC<InviteActionsProps> = ({ invite }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleResend = async () => {
    setLoading('resend');
    try {
      const response = await fetch('/api/invites/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to resend invite');
      }
      toast.success('Invite resent successfully!');
    } catch (error) {
      console.error('Failed to resend invite:', error);
      toast.error('Failed to resend invite.');
    } finally {
      setLoading(null);
      setShowMenu(false);
    }
  };

  const handleRevoke = async () => {
    setLoading('revoke');
    try {
      const response = await fetch('/api/invites/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to revoke invite');
      }
      toast.success('Invite revoked successfully!');
    } catch (error)      {
      console.error('Failed to revoke invite:', error);
      toast.error('Failed to revoke invite.');
    } finally {
      setLoading(null);
      setShowMenu(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(invite.email);
    toast.success('Email copied to clipboard!');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[160px]">
            <div className="py-1">
              <button
                onClick={handleCopyEmail}
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Email
              </button>
              <button
                onClick={handleResend}
                disabled={loading === 'resend'}
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading === 'resend' ? 'Resending...' : 'Resend Invite'}
              </button>

              <button
                onClick={handleRevoke}
                disabled={loading === 'revoke'}
                className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {loading === 'revoke' ? 'Revoking...' : 'Revoke Invite'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};