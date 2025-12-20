'use client'

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export const Login = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const { update } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const urlError = searchParams?.get('error');
    if (urlError) {
      switch (urlError) {
        case 'OAuthUserNotFound':
          setError(t('auth.login.socialAccountOnly'));
          break;
        default:
          // For other errors that might come from redirects, show generic message
          setError(t('auth.login.unexpectedError'));
          break;
      }
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      // Map specific error messages
      switch (result.error) {
        case 'No user found with this email':
          setError(t('auth.login.noUserFound'));
          break;
        case 'Incorrect password':
          setError(t('auth.login.incorrectPassword'));
          break;
        case 'Your account is pending verification by an administrator.':
          setError(t('auth.login.pendingVerification'));
          break;
        case 'Please sign in using your social account or contact support.':
          setError(t('auth.login.socialAccountOnly'));
          break;
        default:
          setError(t('auth.login.invalidCredentials'));
          break;
      }
    } else if (result?.ok) {
      // Successful login
      setIsSuccess(true);
      await update();
      timeoutRef.current = setTimeout(() => {
        router.push(callbackUrl);      }, 1500); // Brief delay to show success state
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-950 text-foreground dark:text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)] dark:[mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 dark:bg-accent-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 flex justify-center items-center flex-col">
          <Link href="/"  className="mx-auto mb-4">
            <Image
              src="/curenium-logo.png"
              alt="Curenium Logo"
              width={48}
              height={48}
              className="block dark:hidden"
            />
            <Image
              src="/curenium-no-bg.png"
              alt="Curenium Logo"
              width={48}
              height={48}
              className="hidden dark:block"
            />
          </Link>
          <h2 className="text-2xl font-bold">{t('auth.login.title')}</h2>
          <p className="text-muted-foreground dark:text-dark-400 mt-1">{t('auth.login.subtitle')}</p>
        </div>

        <div className="bg-card/80 dark:bg-dark-800/50 backdrop-blur-lg border border-border dark:border-dark-700 rounded-2xl shadow-2xl p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground dark:text-dark-300">{t('auth.login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground dark:text-dark-300">{t('auth.login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400 hover:text-foreground dark:hover:text-dark-200">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input dark:border-dark-600 rounded bg-background dark:bg-dark-700" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground dark:text-dark-300">{t('auth.login.rememberMe')}</label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  {t('auth.login.forgotPassword')}
                </a>
              </div>
            </div>

            {error && <p className="text-destructive dark:text-red-400 text-sm text-center bg-destructive/10 dark:bg-red-900/20 border border-destructive/20 dark:border-red-500/30 rounded-lg py-2 px-4">{error}</p>}

            <div className="pt-2">
              <Button type="submit" className={`w-full text-base font-semibold ${isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`} size="lg" disabled={isLoading || isSuccess}>
                {isLoading ? t('auth.login.signingIn') :
                 isSuccess ? (
                   <>
                     <Check className="w-4 h-4 mr-2" />
                     {t('auth.login.success')}
                   </>
                 ) : t('auth.login.signIn')}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground dark:text-dark-400">
            <p>{t('auth.login.orContinueWith')}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => signIn('google')} className="bg-background dark:bg-dark-700/50 border-input dark:border-dark-600 hover:bg-accent dark:hover:bg-dark-600/50">
              <svg width="20" height="20" className="mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('auth.login.google')}
            </Button>
            <Button variant="outline" onClick={() => signIn('github')} className="bg-background dark:bg-dark-700/50 border-input dark:border-dark-600 hover:bg-accent dark:hover:bg-dark-600/50">
              <svg width="20" height="20" className="mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('auth.login.github')}
            </Button>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground dark:text-dark-400 mt-8">
          {t('auth.login.notMember')}{' '}
          <a href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
            {t('auth.login.signUp')}
          </a>
        </p>
      </div>
    </div>
  );
};