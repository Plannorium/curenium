'use client'

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import Image from 'next/image';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    const urlError = searchParams?.get('error');
    if (urlError) {
      switch (urlError) {
        case 'OAuthUserNotFound':
          setError('You need to be invited to use this application. Please contact your administrator.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
          break;
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.ok) {
      router.push(callbackUrl);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/curenium-logo-bg-none.png" alt="Curenium Logo" width={48} height={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
          <p className="text-dark-400 mt-1">Welcome back to Curenium.</p>
        </div>

        <div className="bg-dark-800/50 backdrop-blur-lg border border-dark-700 rounded-2xl shadow-2xl shadow-black/20 p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-dark-300">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-dark-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-600 rounded bg-dark-700" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-300">Remember me</label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg py-2 px-4">{error}</p>}

            <div className="pt-2">
              <Button type="submit" className="w-full text-base font-semibold" size="lg" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-dark-400">
            <p>Or continue with</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => signIn('google')}>
              <Image width={20} height={20} className="mr-2" src="https://www.svgrepo.com/show/506498/google.svg" alt="Google" />
              Google
            </Button>
            <Button variant="outline" onClick={() => signIn('github')}>
              <Image width={20} height={20} className="mr-2 invert" src="https://www.svgrepo.com/show/506497/github.svg" alt="GitHub" />
              GitHub
            </Button>
          </div>
        </div>
        <p className="text-center text-sm text-dark-400 mt-8">
          Not a member?{' '}
          <a href="/signup" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};