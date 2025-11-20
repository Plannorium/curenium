'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader } from '@/components/ui/Loader';

const InviteUser = dynamic(
  () => import('@/components/auth/InviteUser').then((mod) => mod.InviteUser),
  { ssr: false, loading: () => <Loader variant="minimal" /> }
);

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<Loader variant="fullscreen" text="Loading Invite..." />}>
          <InviteUser />
        </Suspense>
      </div>
    </div>
  );
}