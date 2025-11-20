'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader } from '@/components/ui/Loader';

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
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (token) {
        try {
          const res = await fetch(`/api/invite/details?token=${token}`);
          const data: InviteDetailsResponse = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setIsNewUser(data.isNewUser ?? null);
            setEmail(data.email ?? '');
          }
        } catch (_err) {
          setError('Failed to fetch invite details.');
        }
      } else {
        setError('Invite token is missing.');
      }
    };

    fetchInviteDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invite token is missing.');
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
        setSuccess('Account created successfully! Signing you in...');
        await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        router.push('/dashboard');
      } else {
        setSuccess('You have been added to the new organization. Please log in to continue.');
      }
    } else {
      setError(data.message || 'An error occurred while accepting the invite.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-6">
          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
            Accept Invitation
          </h3>
          {token ? (
            <div>
             {isNewUser === null && <Loader variant="minimal" />}
              {isNewUser === true && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-dark-700 dark:text-dark-200">Full Name</label>
                    <div className="mt-1">
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-md shadow-sm placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-dark-700 dark:text-dark-200">Create a Password</label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-md shadow-sm placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {success && <p className="text-sm text-green-500">{success}</p>}
                  <div>
                    <Button type="submit" className="w-full">
                      Complete Registration <Check size={16} className="ml-2" />
                    </Button>
                  </div>
                </form>
              )}
              {isNewUser === false && (
                <div>
                  <p>{success || `You have been added to a new organization. Please log in to access it.`}</p>
                  <Button onClick={() => router.push('/login')} className="w-full mt-4">Go to Login</Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-500">{error || 'Invalid invite link.'}</p>
          )}
        </Card>
      </div>
    </div>
  );
}