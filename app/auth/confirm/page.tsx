import EmailConfirmation from '@/components/auth/EmailConfirmation';
import { Suspense } from 'react';
import { Loader } from '@/components/ui/Loader';

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={<Loader variant="fullscreen" text="Loading..." />}>
      <EmailConfirmation />
    </Suspense>
  );
}