import AcceptInvite from '@/components/auth/AcceptInvite';
import { Suspense } from 'react';
import { Loader } from '@/components/ui/Loader';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Loader variant="fullscreen" text="Loading..." />}>
      <AcceptInvite />
    </Suspense>
  );
}