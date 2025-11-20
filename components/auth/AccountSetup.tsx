'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

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
        redirect: false,
        email: data.user.email,
        password: password, // Use the password from the form
      });

      if (signInResponse?.ok) {
        router.push('/dashboard');
      } else {
        setError(signInResponse?.error || 'Sign-in failed after registration.');
      }
    } else {
      setError(data.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      
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

        <div className="bg-dark-800/50 backdrop-blur-lg border border-dark-700 rounded-2xl shadow-2xl shadow-black/20 p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-sm font-medium text-dark-300">Full Name</label>
              <input id="fullName" name="fullName" type="text" required 
                className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-dark-300">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" required 
                className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-dark-300">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required 
                className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="organizationName" className="text-sm font-medium text-dark-300">Organization Name</label>
              <input id="organizationName" name="organizationName" type="text" required 
                className="w-full px-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
            
            {error && <p className="text-sm text-red-400 text-center pt-2">{error}</p>}
            {success && <p className="text-sm text-green-400 text-center pt-2">{success}</p>}

            <div className="pt-4">
              <Button type="submit" className="w-full text-base font-semibold" size="lg">
                Create Account
              </Button>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-dark-400 mt-8">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};