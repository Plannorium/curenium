'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mail, Shield, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface Invite {
  _id: string;
  email?: string;
  role?: string;
  status?: string;
  expiresAt?: string | null;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteCreated: (invite: Invite) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onInviteCreated }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json() as Invite | { message: string };

      if (response.ok) {
        onInviteCreated(data as Invite);
        setEmail('');
        setRole('user');
        onClose();
      } else {
        setError((data as { message: string }).message || 'Failed to send invite.');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/50 dark:to-primary-900/30 border-b border-border px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('inviteModal.title')}</h2>
                <p className="text-sm text-muted-foreground">{t('inviteModal.subtitle')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              {t('inviteModal.emailAddress')}
            </label>
            <div className="relative">
              <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-3 bg-background border border-input rounded-lg shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                placeholder={t('inviteModal.emailPlaceholder')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-foreground">
              {t('inviteModal.rolePermissions')}
            </label>
            <div className="relative">
              <Shield className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full py-3 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              >
                <option value="admin">{t('inviteList.roles.admin')}</option>
                <option value="doctor">{t('inviteList.roles.doctor')}</option>
                <option value="nurse">{t('inviteList.roles.nurse')}</option>
                <option value="labtech">{t('inviteList.roles.labtech')}</option>
                <option value="reception">{t('inviteList.roles.reception')}</option>
                <option value="manager">{t('inviteList.roles.manager')}</option>
                <option value="staff">{t('inviteList.roles.staff')}</option>
                <option value="user">{t('inviteList.roles.user')}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                {error === 'Failed to send invite.' ? t('inviteModal.failedToSend') :
                 error === 'Network error. Please try again.' ? t('inviteModal.networkError') :
                 error}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-border hover:bg-muted"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-primary-foreground shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  {t('inviteModal.sending')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('inviteModal.sendInvitation')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};