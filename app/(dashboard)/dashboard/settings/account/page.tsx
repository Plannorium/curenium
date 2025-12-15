'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Link2, Trash2, CheckCircle, AlertCircle, Github, Chrome, Loader2, Shield } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/lib/settings-translations";
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = settingsTranslations[language as keyof typeof settingsTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/account');
        if (res.ok) {
          const data = await res.json() as { fullName?: string };
          setFullName(data.fullName || '');
        }
      } catch (_error) {
        console.error('Failed to fetch user data');
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsUpdatingProfile(true);

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      });

      if (res.ok) {
        setSuccess(t('account.profileUpdated'));
      } else {
        const data = await res.json() as { message?: string };
        setError(data.message || t('account.failedToUpdateProfile'));
      }
    } catch (_error) {
      setError(t('account.failedToUpdateProfile'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsChangingPassword(true);

    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setSuccess(t('account.passwordChanged'));
        setCurrentPassword('');
        setNewPassword('');
      } else {
        const data = await res.json() as { message?: string };
        setError(data.message || t('account.failedToChangePassword'));
      }
    } catch (_error) {
      setError(t('account.failedToChangePassword'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setSuccess(null);

    if (confirm(t('account.confirmDeleteAccount'))) {
      try {
        const res = await fetch('/api/account', {
          method: 'DELETE',
        });

        if (res.ok) {
          window.location.href = '/login';
        } else {
          const data = await res.json() as { message?: string };
          setError(data.message || t('account.failedToDeleteAccount'));
        }
      } catch (_error) {
        setError(t('account.failedToDeleteAccount'));
      }
    }
  };

  const handleLinkAccount = async (provider: string) => {
    setIsLinking(provider);
    toast.info(t('account.linkingNote') || 'Note: You may be logged out during the linking process. After linking, please sign in again with the linked provider.');
    try {
      await signIn(provider, { callbackUrl: '/dashboard/settings/account' });
    } catch (_error) {
      setError(t('account.failedToLinkAccount'));
    } finally {
      setIsLinking(null);
    }
  };

  return (
    <div className="relative min-h-screen ">
      {/* Background blur effects */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div> */}

      <div className="relative max-w-2xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {t('account.title')}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t('account.subtitle')}
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 backdrop-blur-sm bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <p className="text-green-600 dark:text-green-400 font-medium">{success}</p>
          </div>
        )}

        {/* Profile Information Card */}
        <Card className="mb-6 backdrop-blur-lg bg-card/80 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-xl pointer-events-none"></div>
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3 border border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('account.profileInformation')}</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                  {t('account.fullName')}
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your full name"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  t('account.updateProfile')
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Change Password Card */}
        <Card className="mb-6 backdrop-blur-lg bg-card/80 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-primary/5 rounded-xl pointer-events-none"></div>
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-amber-500/10 rounded-lg mr-3 border border-amber-500/20">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('account.changePassword')}</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground">
                  {t('account.currentPassword')}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                  {t('account.newPassword')}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="backdrop-blur-sm bg-background/50 border-border/60 hover:border-border focus:border-primary transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter new password"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isChangingPassword}
                className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  t('account.changePasswordButton')
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Link Accounts Card */}
        <Card className="mb-6 backdrop-blur-lg bg-card/80 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none"></div>
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg mr-3 border border-blue-500/20">
                <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('account.linkAccounts')}</h2>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('account.linkAccountsDescription')}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => handleLinkAccount('google')} 
                disabled={isLinking === 'google'}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinking === 'google' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    <Chrome className="h-4 w-4 mr-2" />
                    {t('account.linkWithGoogle')}
                  </>
                )}
              </Button>
              <Button 
                onClick={() => handleLinkAccount('github')} 
                disabled={isLinking === 'github'}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinking === 'github' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    {t('account.linkWithGitHub')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Account Card */}
        <Card className="backdrop-blur-lg bg-card/80 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/10 rounded-xl pointer-events-none"></div>
          <div className="relative p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg mr-3 border border-red-500/20">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('account.dangerZone')}</h2>
            </div>
            <div className="backdrop-blur-sm bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">{t('account.deleteAccount')}</h3>
              <p className="text-red-600/80 dark:text-red-400/80 text-sm leading-relaxed">
                {t('account.deleteAccountDescription')}
              </p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <Trash2 className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              {t('account.deleteAccountButton')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}