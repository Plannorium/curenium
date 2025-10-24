import EmailConfirmation from '@/components/auth/EmailConfirmation';
import { Suspense } from 'react';

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailConfirmation />
    </Suspense>
  );
}