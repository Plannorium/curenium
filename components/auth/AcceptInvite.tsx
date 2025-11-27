'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader } from '@/components/ui/Loader';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface InviteDetailsResponse {
  error?: string;
  isNewUser?: boolean;
  email?: string;
}

interface AcceptInviteResponse {
  message?: string;
}

export default function AcceptInvite() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const token = searchParams?.get('token');
   const { language } = useLanguage();
   const [password, setPassword] = useState('');
   const [fullName, setFullName] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [errorKey, setErrorKey] = useState('');
   const [successKey, setSuccessKey] = useState('');
   const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
   const [email, setEmail] = useState('');

   const t = (key: string) => {
     const keys = key.split('.');
     let value: any = translations[language as keyof typeof translations];
     for (const k of keys) {
       value = value?.[k];
     }
     return value || key;
   };

   const translatedError = errorKey ? t(errorKey) : error;
   const translatedSuccess = successKey ? t(successKey) : success;

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (token) {
        try {
           const res = await fetch(`/api/invite/details?token=${token}`);
           if (!res.ok) {
             if (res.status === 404) {
               setErrorKey('auth.acceptInvite.invalidInviteLink');
             } else {
               setErrorKey('auth.acceptInvite.failedToFetchInviteDetails');
             }
             return;
           }
           const data: InviteDetailsResponse = await res.json();
           if (data.error) {
             setError(data.error);
           } else {
             setIsNewUser(data.isNewUser ?? null);
             setEmail(data.email ?? '');
           }
         } catch (_err) {
           setErrorKey('auth.acceptInvite.failedToFetchInviteDetails');
         }
       } else {
         setErrorKey('auth.acceptInvite.missingInviteToken');
       }
    };

    fetchInviteDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setErrorKey('');
    setSuccessKey('');

    if (!token) {
       setErrorKey('auth.acceptInvite.missingInviteToken');
       return;
     }

    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, fullName, password }),
    });

    const data: AcceptInviteResponse = await res.json();

    if (res.ok) {
       if (isNewUser) {
         setSuccessKey('auth.acceptInvite.accountCreatedSuccess');
         await signIn('credentials', {
           email,
           password,
           redirect: false,
         });
         router.push('/dashboard');
       } else {
         setSuccessKey('auth.acceptInvite.addedToOrganization');
       }
     } else {
       setError(data.message || 'auth.acceptInvite.failedToAcceptInvite');
     }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-950 text-foreground dark:text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)] dark:[mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 dark:bg-accent-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 flex justify-center items-center flex-col">
          <div className="mx-auto mb-4">
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
          </div>
          <h2 className="text-2xl font-bold">{t('auth.acceptInvite.title')}</h2>
           <p className="text-muted-foreground dark:text-dark-400 mt-1">{t('auth.acceptInvite.subtitle')}</p>
        </div>

        <div className="bg-card/80 dark:bg-dark-800/50 backdrop-blur-lg border border-border dark:border-dark-700 rounded-2xl shadow-2xl p-8">
          {token ? (
            <div>
              {(error || errorKey) && <p className="text-destructive dark:text-red-400 text-sm text-center bg-destructive/10 dark:bg-red-900/20 border border-destructive/20 dark:border-red-500/30 rounded-lg py-2 px-4">{translatedError}</p>}
              {isNewUser === null ? (
                <Loader variant="minimal" />
              ) : isNewUser === true ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground dark:text-dark-300">{t('auth.acceptInvite.fullName')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-muted-foreground dark:text-dark-300">{t('auth.acceptInvite.createPassword')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {(success || successKey) && <p className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg py-2 px-4">{translatedSuccess}</p>}
                  <div className="pt-2">
                    <Button type="submit" className="w-full text-base font-semibold" size="lg">
                      {t('auth.acceptInvite.completeRegistration')} <Check size={16} className="ml-2" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-center">{translatedSuccess || t('auth.acceptInvite.addedToOrganization')}</p>
                  <Button onClick={() => router.push('/login')} className="w-full mt-4 text-base font-semibold" size="lg">{t('auth.acceptInvite.goToLogin')}</Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-destructive dark:text-red-400 text-sm text-center bg-destructive/10 dark:bg-red-900/20 border border-destructive/20 dark:border-red-500/30 rounded-lg py-2 px-4">{translatedError || t('auth.acceptInvite.invalidInviteLink')}</p>
          )}
        </div>
      </div>
    </div>
  );
}