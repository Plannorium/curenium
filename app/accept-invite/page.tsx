import { Suspense } from 'react';
import AcceptInvite from '@/components/auth/AcceptInvite';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInvite />
    </Suspense>
  );
}