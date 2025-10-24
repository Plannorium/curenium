'use client'

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { 
  Mail,
  Send,
} from 'lucide-react';

interface InviteResponse {
  message?: string;
}

export const InviteUser: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data: InviteResponse = await res.json();

      if (res.ok) {
        setSuccess(`Invite sent successfully to ${email}`);
        setEmail('');
      } else {
        setError(data.message || 'An error occurred while sending the invite.');
      }
    } catch (_error) {
      setError('An error occurred while sending the invite.');
    }
  };

  return (
    <Card className="py-8 px-6">
      <div>
        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
          Invite New User
        </h3>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-200">Email Address</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-dark-300 dark:border-dark-600 rounded-md shadow-sm placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-dark-700 dark:text-dark-200">Role</label>
            <select 
              id="role" 
              name="role" 
              required 
              className="appearance-none block w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <div>
            <Button type="submit" className="w-full">
              Send Invite <Send size={16} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};