import { Login } from '@/components/auth/Login';
import { Suspense } from 'react';
import { Loader } from '@/components/ui/Loader';

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader variant="fullscreen" text="Loading..." />}>
      <Login />
    </Suspense>
  );
}