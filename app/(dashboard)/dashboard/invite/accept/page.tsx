import AcceptInvite from '@/components/auth/AcceptInvite';
import { Suspense } from 'react';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvite />
    </Suspense>
  );
}