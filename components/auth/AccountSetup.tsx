'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Building } from 'lucide-react';

import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

interface AdminRegisterResponse {
  message?: string;
  user?: {
    email: string;
  };
}

export const AccountSetup: React.FC = () => {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await fetch("/api/register/admin", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, organizationName }),
    });

    const data: AdminRegisterResponse = await res.json();

    if (res.ok && data.user) {
      const signInResponse = await signIn('credentials', {
        email: email,
        password: password,
        redirect: true,
        callbackUrl: '/dashboard',
      });

      // If signIn is successful with redirect: true, the user will be navigated
      // to the callbackUrl and this part of the code will not be reached.
      // If it fails, NextAuth will handle showing an error on the login page,
      // but we can set a local error for immediate feedback if needed.
      if (signInResponse?.error) {
        setError('Sign-in failed after registration. Please try logging in manually.');
      }
    } else {
      setError(data.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-950 text-foreground dark:text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)] dark:[mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary-500/10 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 dark:bg-accent-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-4 flex justify-center items-center flex-col">
          <div className="mx-auto mb-0">
            <Image
              src="/curenium-logo.png"
              alt="Curenium Logo"
              width={80}
              height={80}
              className="block dark:hidden"
            />
            <Image
              src="/curenium-no-bg.png"
              alt="Curenium Logo"
              width={80}
              height={80}
              className="hidden dark:block"
            />
          </div>
          <h2 className="text-2xl font-bold">Create Your Admin Account</h2>
          <p className="text-dark-400 mt-1">Join Curenium and streamline your team&apos;s communication.</p>
        </div>

        <div className="bg-card/80 dark:bg-dark-800/50 backdrop-blur-lg border border-border dark:border-dark-700 rounded-2xl shadow-2xl p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground dark:text-dark-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                <input id="fullName" name="fullName" type="text" required
                  className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground dark:text-dark-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                <input id="email" name="email" type="email" autoComplete="email" required
                  className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground dark:text-dark-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                <input id="password" name="password" type="password" autoComplete="new-password" required
                  className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="organizationName" className="text-sm font-medium text-muted-foreground dark:text-dark-300">Organization Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-dark-400" size={18} />
                <input id="organizationName" name="organizationName" type="text" required
                  className="w-full pl-10 pr-4 py-2 bg-background dark:bg-dark-700/50 border border-input dark:border-dark-600 rounded-lg placeholder-muted-foreground dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>
            </div>
            
            {error && <p className="text-destructive dark:text-red-400 text-sm text-center bg-destructive/10 dark:bg-red-900/20 border border-destructive/20 dark:border-red-500/30 rounded-lg py-2 px-4">{error}</p>}
            {success && <p className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg py-2 px-4">{success}</p>}

            <div className="pt-4">
              <Button type="submit" className="w-full text-base font-semibold" size="lg">
                Create Account
              </Button>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground dark:text-dark-400 mt-8">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};