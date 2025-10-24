'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface UnverifiedUser {
  _id: string;
  fullName: string;
  email: string;
}

export default function PendingUsersPage() {
  const [users, setUsers] = useState<UnverifiedUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/organization/unverified-users')
      .then((res) => res.json())
      .then((data: unknown) => {
        if (typeof data === 'object' && data && 'error' in data && typeof data.error === 'string') {
          setError(data.error);
        } else if (Array.isArray(data)) {
          setUsers(data as UnverifiedUser[]);
        }
      });
  }, []);

  const handleVerify = async (userId: string) => {
    const res = await fetch('/api/organization/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data: unknown = await res.json();
    
    if (res.ok) {
      setUsers(users.filter((user) => user._id !== userId));
    } else {
      setError(
        typeof data === 'object' && data && 'message' in data && typeof data.message === 'string'
          ? data.message
          : 'An error occurred while verifying the user.'
      );
    }
  };

  return (
    <Card className="py-8 px-6">
      <div>
        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-6">
          Pending User Verifications
        </h3>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Button onClick={() => handleVerify(user._id)}>Verify</Button>
              </div>
            ))
          ) : (
            <p>No pending users to verify.</p>
          )}
        </div>
      </div>
    </Card>
  );
}