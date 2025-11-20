import { Suspense } from 'react';
import AcceptInvite from '@/components/auth/AcceptInvite';
import { Loader } from '@/components/ui/Loader';

export default function Page() {
  return (
    <Suspense fallback={<Loader variant="fullscreen" text="Loading..." />}>
      <AcceptInvite />
    </Suspense>
  );
}